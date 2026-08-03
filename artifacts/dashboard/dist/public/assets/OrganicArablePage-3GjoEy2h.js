import { b as useAppStore, a as useToast, c as useQueryClient, m as useQuery, r as reactExports, O as useMutation, j as jsxRuntimeExports, e as LoaderCircle, d as Button, L as Label, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, J as DialogFooter, I as Input } from "./index-BGtVdleN.js";
import { u as usePersistedTab } from "./use-persisted-tab-CEazkJXm.js";
import { A as AppLayout, a as Wheat, S as Sprout, B as BookOpen, e as ChartColumn } from "./AppLayout-D2-X9iTh.js";
import { T as TabBar, a as TabButton } from "./tab-button-BeX9yvqW.js";
import { T as Textarea } from "./textarea-C49oz5H9.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BMOXF0oE.js";
import { R as RecordAttachments } from "./RecordAttachments-BhBbwUlq.js";
import { u as useLookupStrings } from "./use-lookup-BJZfj-qG.js";
import { d as downloadCsvFile } from "./csv-Dr539t8b.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { S as ShieldCheck } from "./shield-check-DuyfyUev.js";
import { P as Package } from "./use-safe-clerk-sm9SK8pO.js";
import { F as FileText } from "./shield-alert-syt1UVEt.js";
import { C as CircleCheck } from "./circle-check-CbvLsW3b.js";
import { T as TriangleAlert } from "./triangle-alert-OV1jLT5y.js";
import { E as Eye } from "./eye-B0KSXoBU.js";
import { T as Trash2 } from "./trash-2-CcKqJzTT.js";
import { a as ArrowDownToLine, A as ArrowUpFromLine } from "./arrow-up-from-line-DTQ1fteq.js";
import { P as Pencil } from "./pencil-DDsmwbbO.js";
import { P as Printer } from "./printer-CWmMoyXV.js";
import { D as Download } from "./download-BLoUexsB.js";
import "./database-sBqWeOKL.js";
import "./tractor-TYhGu_VD.js";
import "./index-C5gQ-tdg.js";
import "./index-D8iuOzEV.js";
import "./chevron-up-CY8SIG6d.js";
import "./use-upload-BwtP0czP.js";
import "./paperclip-C7ZwtbBq.js";
import "./upload-Cl5SNcIn.js";
import "./image-CiRTV-Wd.js";
function fmt(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return val;
  }
}
function fmtN(val, suffix = "") {
  if (val == null || val === "") return "—";
  return `${val}${suffix}`;
}
function str(v) {
  return v == null ? "" : String(v);
}
function conversionProgress(start, end) {
  if (!start) return 0;
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : s + 2 * 365.25 * 24 * 3600 * 1e3;
  return Math.min(100, Math.max(0, Math.round((Date.now() - s) / (e - s) * 100)));
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(dateStr);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 864e5);
}
function currentYear() {
  return (/* @__PURE__ */ new Date()).getFullYear();
}
function yearOptions() {
  const y = currentYear();
  return [y + 1, y, y - 1, y - 2, y - 3].map(String);
}
const apiFetch = (path, opts) => fetch(`/api/${path}`, { credentials: "include", ...opts });
const DEFAULT_ARABLE_CROPS = [
  "Winter Wheat",
  "Spring Wheat",
  "Winter Barley",
  "Spring Barley",
  "Malting Barley",
  "Oilseed Rape (OSR)",
  "Winter Oats",
  "Spring Oats",
  "Winter Beans",
  "Spring Beans",
  "Peas",
  "Maize",
  "Sugar Beet",
  "Potatoes",
  "Linseed",
  "Rye",
  "Triticale",
  "Other"
];
const CERTIFIERS = [
  "Soil Association",
  "Organic Farmers & Growers (OF&G)",
  "OCIS",
  "Biodynamic Association (Demeter)",
  "Other"
];
const CERT_STATUSES = [
  { value: "all", label: "All" },
  { value: "certified", label: "Certified", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "in-conversion", label: "In Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "suspended", label: "Suspended", cls: "bg-red-50 text-red-700 border-red-300" },
  { value: "withdrawn", label: "Withdrawn", cls: "bg-gray-100 text-gray-500 border-gray-300" }
];
const CONV_STATUSES = [
  { value: "all", label: "All" },
  { value: "pre-conversion", label: "Pre-Conversion", cls: "bg-blue-50 text-blue-700 border-blue-300" },
  { value: "in-conversion", label: "In Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "certified", label: "Certified", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "lapsed", label: "Lapsed", cls: "bg-gray-100 text-gray-500 border-gray-300" }
];
const SEED_TYPES = [
  { value: "organic", label: "Certified Organic", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "untreated-conventional", label: "Untreated Conventional", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "treated-conventional-derogation", label: "Treated Conventional (Derogation)", cls: "bg-red-50 text-red-700 border-red-300" }
];
const HARVEST_STATUSES = [
  { value: "all", label: "All" },
  { value: "certified", label: "Certified Organic", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "in-conversion", label: "In-Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "conventional", label: "Conventional", cls: "bg-gray-100 text-gray-500 border-gray-300" }
];
const PERMITTED_STATUSES = [
  { value: "all", label: "All" },
  { value: "permitted", label: "Permitted (Annex II)", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "restricted", label: "Restricted — notify certifier", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "prohibited", label: "Prohibited", cls: "bg-red-50 text-red-700 border-red-300" }
];
const INPUT_TYPES_ALL = [
  "Fertiliser / Soil Amendment",
  "Crop Protection / Pesticide",
  "Biological Control",
  "Seed Treatment",
  "Cleaning & Disinfection",
  "Other"
];
const QUANTITY_UNITS = ["kg/ha", "l/ha", "t/ha", "kg", "l", "t", "g/ha", "units/ha"];
const ANNEX_INPUTS = [
  { name: "Farmyard Manure (FYM) — composted or well-rotted", activeIngredient: "Nitrogen, Phosphorus, Potassium (NPK); Organic matter" },
  { name: "Composted Plant & Animal Material", activeIngredient: "Nitrogen, Phosphorus, Potassium (NPK); Organic matter" },
  { name: "Green Manure / Cover Crop Residue", activeIngredient: "Nitrogen (fixed); Organic matter" },
  { name: "Slurry (composted; restricted from non-organic units)", activeIngredient: "Nitrogen, Phosphorus, Potassium (NPK)" },
  { name: "Dried Blood (Blood Meal)", activeIngredient: "Nitrogen (~12–14% N)" },
  { name: "Bone Meal / Steamed Bone Flour", activeIngredient: "Phosphorus (P₂O₅ 20–25%); Nitrogen (~4% N)" },
  { name: "Fish Meal / Fish Emulsion", activeIngredient: "Nitrogen (~10% N); Phosphorus; Trace elements" },
  { name: "Seaweed Meal", activeIngredient: "Potassium; Cytokinins; Trace elements" },
  { name: "Calcified Seaweed (Lithothamnium)", activeIngredient: "Calcium carbonate; Magnesium; Trace elements" },
  { name: "Seaweed Extract (liquid)", activeIngredient: "Cytokinins; Auxins; Betaines; Trace elements" },
  { name: "Rock Phosphate (soft / reactive)", activeIngredient: "Phosphorus (P₂O₅ 28–35%)" },
  { name: "Potassium Sulphate (natural mineral extraction, low chloride)", activeIngredient: "Potassium (K₂O 48–52%); Sulphur" },
  { name: "Kieserite (Magnesium Sulphate, natural mineral)", activeIngredient: "Magnesium (MgO 27%); Sulphur (SO₃ 55%)" },
  { name: "Wood Ash (from untreated wood only)", activeIngredient: "Potassium; Calcium; Phosphorus" },
  { name: "Ground Limestone / Calcium Carbonate", activeIngredient: "Calcium carbonate (CaCO₃)" },
  { name: "Dolomitic Limestone / Magnesium Limestone", activeIngredient: "Calcium carbonate; Magnesium carbonate" },
  { name: "Gypsum (natural calcium sulphate)", activeIngredient: "Calcium sulphate (CaSO₄); Sulphur" },
  { name: "Elemental Sulphur", activeIngredient: "Sulphur (S)" },
  { name: "Copper Hydroxide", activeIngredient: "Copper (Cu(OH)₂)" },
  { name: "Copper Oxychloride", activeIngredient: "Copper (Cu₂(OH)₃Cl)" },
  { name: "Copper Sulphate / Bordeaux Mixture", activeIngredient: "Copper sulphate (CuSO₄); Calcium hydroxide" },
  { name: "Pyrethrin (from Chrysanthemum cinerariaefolium)", activeIngredient: "Pyrethrin I and II (natural pyrethroid)" },
  { name: "Spinosad (restricted — certifier notification required)", activeIngredient: "Spinosyn A and D (fermentation-derived)" },
  { name: "Bacillus thuringiensis (Bt)", activeIngredient: "Bacillus thuringiensis delta-endotoxin (biological)" },
  { name: "Beauveria bassiana", activeIngredient: "Beauveria bassiana spores (entomopathogenic fungus)" },
  { name: "Entomopathogenic Nematodes", activeIngredient: "Steinernema / Heterorhabditis spp." },
  { name: "Iron Phosphate (slug pellets)", activeIngredient: "Iron(III) phosphate (FePO₄)" },
  { name: "Kaolin (particle film)", activeIngredient: "Hydrated aluminium silicate (Al₂Si₂O₅(OH)₄)" },
  { name: "Diatomaceous Earth / Kieselgur", activeIngredient: "Amorphous silica (SiO₂)" },
  { name: "Potassium Bicarbonate", activeIngredient: "Potassium bicarbonate (KHCO₃)" },
  { name: "Sulphur (wettable / dust)", activeIngredient: "Sulphur (S)" },
  { name: "Soft Soap / Potassium Soap", activeIngredient: "Potassium salts of fatty acids" },
  { name: "Rapeseed Oil / Plant Oil", activeIngredient: "Triglycerides / fatty acids (plant-derived)" },
  { name: "Pheromones (mating disruption traps only)", activeIngredient: "Insect sex pheromones (species-specific)" }
];
const SCOPE_GROUPS = [
  {
    group: "Arable",
    items: [
      { key: "arable:cereals", label: "Cereals" },
      { key: "arable:oilseeds", label: "Oilseeds" },
      { key: "arable:pulses", label: "Pulses" },
      { key: "arable:potatoes", label: "Potatoes" },
      { key: "arable:forage", label: "Forage / Cover Crops" }
    ]
  },
  {
    group: "Horticulture",
    items: [
      { key: "hort:field-veg", label: "Field Vegetables" },
      { key: "hort:protected", label: "Protected Crops (polytunnel/glass)" },
      { key: "hort:herbs", label: "Herbs & Botanicals" },
      { key: "hort:soft-fruit", label: "Soft Fruit" },
      { key: "hort:top-fruit", label: "Top Fruit" }
    ]
  },
  {
    group: "Livestock",
    items: [
      { key: "livestock:beef", label: "Beef Cattle" },
      { key: "livestock:dairy", label: "Dairy Cattle" },
      { key: "livestock:sheep-meat", label: "Sheep (Meat)" },
      { key: "livestock:sheep-wool", label: "Sheep (Wool)" },
      { key: "livestock:pigs", label: "Pigs" },
      { key: "livestock:laying-hens", label: "Laying Hens (Eggs)" },
      { key: "livestock:broilers", label: "Broilers (Meat Poultry)" },
      { key: "livestock:goats-dairy", label: "Goats (Dairy)" },
      { key: "livestock:goats-meat", label: "Goats (Meat)" },
      { key: "livestock:deer", label: "Deer" },
      { key: "livestock:bees", label: "Bees / Apiculture" }
    ]
  },
  {
    group: "Land",
    items: [
      { key: "land:in-conversion", label: "In-Conversion Land" },
      { key: "land:certified", label: "Fully Certified Land" },
      { key: "land:woodland", label: "Woodland" },
      { key: "land:conservation", label: "Conservation / Wildflower Headlands" }
    ]
  },
  {
    group: "On-Farm Handling",
    items: [
      { key: "handling:grain-storage", label: "Grain Storage & Drying" },
      { key: "handling:milling", label: "On-Farm Milling / Processing" },
      { key: "handling:packing", label: "Packing & Preparation" }
    ]
  }
];
function parseScopeKeys(raw) {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
function getScopeLabel(key) {
  for (const g of SCOPE_GROUPS) {
    const item = g.items.find((i) => i.key === key);
    if (item) return item.label;
  }
  return key;
}
function formatScopeSummary(raw) {
  const keys = parseScopeKeys(raw);
  if (keys.length === 0) return "—";
  const groups = new Set(keys.map((k) => SCOPE_GROUPS.find((g) => g.items.some((i) => i.key === k))?.group ?? k.split(":")[0]));
  const labels = [...groups];
  return labels.length <= 2 ? labels.join(", ") : `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
}
function StatusBadge({ value, options }) {
  const opt = options.filter((o) => o.value !== "all").find((o) => o.value === value) ?? { label: value, cls: "bg-gray-100 text-gray-600 border-gray-300" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${opt.cls ?? "bg-gray-100 text-gray-600 border-gray-300"}`, children: opt.label });
}
function SummaryCard({ icon: Icon, label, value, sub }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-4 flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/10 p-2 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 text-primary" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold mt-0.5", children: value }),
      sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: sub })
    ] })
  ] });
}
function EmptyState({ icon: Icon, message }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-10 h-10 text-muted-foreground/40 mb-3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message })
  ] });
}
function DeleteConfirmDialog({ open, onClose, onConfirm, saving }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-destructive" }),
        "Delete Record"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This action cannot be undone. Are you sure?" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, disabled: saving, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: onConfirm, disabled: saving, children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Delete" })
    ] })
  ] }) });
}
function DetailRow({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 py-2 border-b border-border/50 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium min-w-[150px] shrink-0", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm flex-1", children: value || "—" })
  ] });
}
function FilterPills({ options, value, onChange, counts }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => onChange(o.value),
      className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${value === o.value ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted"}`,
      children: [
        o.label,
        counts && counts[o.value] != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `ml-1.5 ${value === o.value ? "opacity-80" : "text-muted-foreground"}`, children: [
          "(",
          counts[o.value],
          ")"
        ] })
      ]
    },
    o.value
  )) });
}
function ReportBar({ onPrint, onCsv, onAdd, addLabel }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onPrint, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1.5" }),
        "Print Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onCsv, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5 mr-1.5" }),
        "Export CSV"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: onAdd, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1.5" }),
      addLabel
    ] })
  ] });
}
function FieldSelector({ value, onChange, fields }) {
  const inList = fields.some((f) => f.name === value);
  const showText = !inList || fields.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inList ? value : "__other__", onValueChange: (v) => {
      if (v === "__other__") onChange("");
      else onChange(v);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.name, children: f.name }, f.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / Manual entry" })
      ] })
    ] }),
    showText && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Field / parcel name", value, onChange: (e) => onChange(e.target.value) })
  ] });
}
function SubstancePicker({ value, onChange, onIngredient }) {
  const inList = ANNEX_INPUTS.some((s) => s.name === value);
  const [custom, setCustom] = reactExports.useState(!inList && value !== "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "select",
      {
        className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
        value: inList ? value : custom ? "__other__" : "",
        onChange: (e) => {
          if (e.target.value === "__other__") {
            setCustom(true);
            onChange("");
            onIngredient?.("");
          } else if (e.target.value === "") {
            setCustom(false);
            onChange("");
            onIngredient?.("");
          } else {
            setCustom(false);
            onChange(e.target.value);
            const match = ANNEX_INPUTS.find((s) => s.name === e.target.value);
            onIngredient?.(match?.activeIngredient ?? "");
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select Annex II approved input…" }),
          ANNEX_INPUTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.name, children: s.name }, s.name)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__other__", children: "Other / specify below" })
        ]
      }
    ),
    custom && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, placeholder: "Enter product / substance name", value: inList ? "" : value, onChange: (e) => onChange(e.target.value) })
  ] });
}
function OrganicArablePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const cropOptions = useLookupStrings("commodity_types", DEFAULT_ARABLE_CROPS);
  const { data: varietyLookup } = useQuery({
    queryKey: ["lookups", "crop_varieties"],
    queryFn: () => apiFetch("lookups/crop_varieties").then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const allVarietyItems = varietyLookup?.items ?? [];
  const { data: fieldsData } = useQuery({
    queryKey: ["farm-fields", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId
  });
  const fieldOptions = fieldsData?.records ?? [];
  const suppliersQ = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/suppliers`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const allSuppliers = suppliersQ.data ?? [];
  const deliveriesQ = useQuery({
    queryKey: ["stock-deliveries-all", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/stock-deliveries`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const allDeliveries = deliveriesQ.data ?? [];
  const [activeTab, setActiveTab] = usePersistedTab({ page: "organic-arable", farmId, validIds: ["certification", "field-conversion", "seed-sourcing", "input-log", "harvest-declarations"], defaultTab: "certification" });
  const [certFilter, setCertFilter] = reactExports.useState("all");
  const [viewCert, setViewCert] = reactExports.useState(null);
  const [certOpen, setCertOpen] = reactExports.useState(false);
  const [certEditing, setCertEditing] = reactExports.useState(null);
  const [certDeleting, setCertDeleting] = reactExports.useState(null);
  const [certForm, setCertForm] = reactExports.useState({});
  const [certScopeKeys, setCertScopeKeys] = reactExports.useState([]);
  const [convFilter, setConvFilter] = reactExports.useState("all");
  const [viewConv, setViewConv] = reactExports.useState(null);
  const [convOpen, setConvOpen] = reactExports.useState(false);
  const [convEditing, setConvEditing] = reactExports.useState(null);
  const [convDeleting, setConvDeleting] = reactExports.useState(null);
  const [convForm, setConvForm] = reactExports.useState({});
  const [seedSubTab, setSeedSubTab] = reactExports.useState("declarations");
  const [seedFilterCrop, setSeedFilterCrop] = reactExports.useState("all");
  const [seedFilterType, setSeedFilterType] = reactExports.useState("all");
  const [viewSeed, setViewSeed] = reactExports.useState(null);
  const [seedOpen, setSeedOpen] = reactExports.useState(false);
  const [seedEditing, setSeedEditing] = reactExports.useState(null);
  const [seedDeleting, setSeedDeleting] = reactExports.useState(null);
  const [seedForm, setSeedForm] = reactExports.useState({});
  const [selectedStockId, setSelectedStockId] = reactExports.useState(null);
  const [stockOpen, setStockOpen] = reactExports.useState(false);
  const [stockEditing, setStockEditing] = reactExports.useState(null);
  const [stockDeleting, setStockDeleting] = reactExports.useState(null);
  const [stockForm, setStockForm] = reactExports.useState({});
  const [moveOpen, setMoveOpen] = reactExports.useState(false);
  const [moveType, setMoveType] = reactExports.useState("goods_in");
  const [moveStockId, setMoveStockId] = reactExports.useState(null);
  const [moveForm, setMoveForm] = reactExports.useState({});
  const [moveDeleting, setMoveDeleting] = reactExports.useState(null);
  const [inputFilterYear, setInputFilterYear] = reactExports.useState(String(currentYear()));
  const [inputFilterType, setInputFilterType] = reactExports.useState("all");
  const [inputFilterStatus, setInputFilterStatus] = reactExports.useState("all");
  const [viewInput, setViewInput] = reactExports.useState(null);
  const [inputOpen, setInputOpen] = reactExports.useState(false);
  const [inputEditing, setInputEditing] = reactExports.useState(null);
  const [inputDeleting, setInputDeleting] = reactExports.useState(null);
  const [inputForm, setInputForm] = reactExports.useState({});
  const [inputCustomProduct, setInputCustomProduct] = reactExports.useState(false);
  const [inputAreaAutoFilled, setInputAreaAutoFilled] = reactExports.useState(false);
  const [harvestFilterYear, setHarvestFilterYear] = reactExports.useState(String(currentYear()));
  const [harvestFilterCrop, setHarvestFilterCrop] = reactExports.useState("all");
  const [harvestFilterStatus, setHarvestFilterStatus] = reactExports.useState("all");
  const [viewHarvest, setViewHarvest] = reactExports.useState(null);
  const [harvestOpen, setHarvestOpen] = reactExports.useState(false);
  const [harvestEditing, setHarvestEditing] = reactExports.useState(null);
  const [harvestDeleting, setHarvestDeleting] = reactExports.useState(null);
  const [harvestForm, setHarvestForm] = reactExports.useState({});
  const [buyerOpen, setBuyerOpen] = reactExports.useState(false);
  const [buyerRecord, setBuyerRecord] = reactExports.useState(null);
  const [buyerForm, setBuyerForm] = reactExports.useState({});
  const certQ = useQuery({ queryKey: ["oa-cert", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/certification`).then((r) => r.json()).then((d) => d.records), enabled: !!farmId });
  const convQ = useQuery({ queryKey: ["oa-conv", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/field-conversion`).then((r) => r.json()).then((d) => d.records), enabled: !!farmId });
  const seedQ = useQuery({ queryKey: ["oa-seed", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/seed-records`).then((r) => r.json()).then((d) => d.records), enabled: !!farmId });
  const stockQ = useQuery({ queryKey: ["oa-seed-stock", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/seed-stock`).then((r) => r.json()).then((d) => d.records), enabled: !!farmId });
  const movementsQ = useQuery({ queryKey: ["oa-seed-movements", farmId, selectedStockId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/seed-movements${selectedStockId ? `?stockId=${selectedStockId}` : ""}`).then((r) => r.json()).then((d) => d.records), enabled: !!farmId && seedSubTab === "stock" });
  const inputQ = useQuery({ queryKey: ["oa-input", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/input-records`).then((r) => r.json()).then((d) => d.records), enabled: !!farmId });
  const harvestQ = useQuery({ queryKey: ["oa-harvest", farmId], queryFn: () => apiFetch(`farms/${farmId}/organic-arable/harvest-declarations`).then((r) => r.json()).then((d) => d.records), enabled: !!farmId });
  function useCrud(endpoint, keys) {
    const save = useMutation({
      mutationFn: ({ id, body }) => apiFetch(id ? `farms/${farmId}/${endpoint}/${id}` : `farms/${farmId}/${endpoint}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then((r) => r.json()),
      onSuccess: () => {
        keys.forEach((k) => qc.invalidateQueries({ queryKey: [k, farmId] }));
        toast({ title: "Saved" });
      },
      onError: () => toast({ title: "Error saving", variant: "destructive" })
    });
    const del = useMutation({
      mutationFn: (id) => apiFetch(`farms/${farmId}/${endpoint}/${id}`, { method: "DELETE" }),
      onSuccess: () => {
        keys.forEach((k) => qc.invalidateQueries({ queryKey: [k, farmId] }));
        toast({ title: "Deleted" });
      },
      onError: () => toast({ title: "Error deleting", variant: "destructive" })
    });
    return { save, del };
  }
  const certMut = useCrud("organic-arable/certification", ["oa-cert"]);
  const convMut = useCrud("organic-arable/field-conversion", ["oa-conv"]);
  const seedMut = useCrud("organic-arable/seed-records", ["oa-seed"]);
  const stockMut = useCrud("organic-arable/seed-stock", ["oa-seed-stock"]);
  const inputMut = useCrud("organic-arable/input-records", ["oa-input"]);
  const harvestMut = useCrud("organic-arable/harvest-declarations", ["oa-harvest"]);
  const moveSaveMut = useMutation({
    mutationFn: (body) => apiFetch(`farms/${farmId}/organic-arable/seed-movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oa-seed-stock", farmId] });
      qc.invalidateQueries({ queryKey: ["oa-seed-movements", farmId] });
      toast({ title: "Movement recorded" });
      setMoveOpen(false);
      setMoveForm({});
    },
    onError: () => toast({ title: "Error recording movement", variant: "destructive" })
  });
  const moveDelMut = useMutation({
    mutationFn: (id) => apiFetch(`farms/${farmId}/organic-arable/seed-movements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oa-seed-stock", farmId] });
      qc.invalidateQueries({ queryKey: ["oa-seed-movements", farmId] });
      toast({ title: "Movement deleted" });
      setMoveDeleting(null);
    },
    onError: () => toast({ title: "Error deleting", variant: "destructive" })
  });
  const certs = certQ.data ?? [];
  const convs = convQ.data ?? [];
  const seeds = seedQ.data ?? [];
  const stockLines = stockQ.data ?? [];
  const movements = movementsQ.data ?? [];
  selectedStockId ? stockLines.find((s) => Number(s.id) === selectedStockId) ?? null : null;
  const inputs = inputQ.data ?? [];
  const harvests = harvestQ.data ?? [];
  const filteredCerts = reactExports.useMemo(() => certs.filter((c) => certFilter === "all" || c.status === certFilter), [certs, certFilter]);
  const filteredConvs = reactExports.useMemo(() => convs.filter((c) => convFilter === "all" || c.status === convFilter), [convs, convFilter]);
  const filteredSeeds = reactExports.useMemo(() => seeds.filter(
    (s) => (seedFilterCrop === "all" || s.cropName === seedFilterCrop) && (seedFilterType === "all" || s.seedType === seedFilterType)
  ), [seeds, seedFilterCrop, seedFilterType]);
  const filteredInputs = reactExports.useMemo(() => inputs.filter(
    (i) => (inputFilterYear === "all" || str(i.applicationDate).startsWith(inputFilterYear)) && (inputFilterType === "all" || i.inputType === inputFilterType) && (inputFilterStatus === "all" || i.permittedStatus === inputFilterStatus)
  ), [inputs, inputFilterYear, inputFilterType, inputFilterStatus]);
  const filteredHarvests = reactExports.useMemo(() => harvests.filter(
    (h) => (harvestFilterYear === "all" || str(h.harvestDate).startsWith(harvestFilterYear)) && (harvestFilterCrop === "all" || h.cropName === harvestFilterCrop) && (harvestFilterStatus === "all" || h.organicStatus === harvestFilterStatus)
  ), [harvests, harvestFilterYear, harvestFilterCrop, harvestFilterStatus]);
  function openCertForm(row) {
    if (row) {
      setCertEditing(row);
      setCertForm({
        certifier: str(row.certifier),
        certificateNumber: str(row.certificateNumber),
        operatorNumber: str(row.operatorNumber),
        certificationDate: str(row.certificationDate),
        renewalDate: str(row.renewalDate),
        annualInspectionDate: str(row.annualInspectionDate),
        nextInspectionDue: str(row.nextInspectionDue),
        status: str(row.status) || "certified",
        notes: str(row.notes)
      });
      setCertScopeKeys(parseScopeKeys(str(row.scope)));
    } else {
      setCertEditing(null);
      setCertForm({ status: "certified", certifier: CERTIFIERS[0] });
      setCertScopeKeys([]);
    }
    setCertOpen(true);
  }
  function saveCert() {
    const INACTIVE = ["suspended", "withdrawn"];
    const otherActive = certs.filter((r) => {
      const isSelf = certEditing && Number(r.id) === Number(certEditing.id);
      return !isSelf && !INACTIVE.includes(str(r.status));
    });
    const conflicts = [];
    for (const other of otherActive) {
      if (str(other.certifier) === certForm.certifier) continue;
      const otherKeys = parseScopeKeys(str(other.scope));
      const overlapping = certScopeKeys.filter((k) => otherKeys.includes(k));
      if (overlapping.length > 0)
        conflicts.push(`${str(other.certifier)} already holds: ${overlapping.map(getScopeLabel).join(", ")}`);
    }
    if (conflicts.length > 0) {
      toast({ title: "Scope conflict", description: conflicts.join(" | "), variant: "destructive" });
      return;
    }
    const body = { ...certForm, scope: JSON.stringify(certScopeKeys) };
    certMut.save.mutate({ id: certEditing ? Number(certEditing.id) : void 0, body }, {
      onSuccess: () => {
        setCertOpen(false);
        setCertEditing(null);
        setCertForm({});
        setCertScopeKeys([]);
      }
    });
  }
  function openConvForm(row) {
    if (row) {
      setConvEditing(row);
      setConvForm({
        fieldName: str(row.fieldName),
        areaHa: str(row.areaHa),
        conversionStartDate: str(row.conversionStartDate),
        expectedCertificationDate: str(row.expectedCertificationDate),
        actualCertificationDate: str(row.actualCertificationDate),
        status: str(row.status) || "in-conversion",
        certifierRef: str(row.certifierRef),
        parallelProduction: row.parallelProduction ? "true" : "false",
        parallelProductionJustification: str(row.parallelProductionJustification),
        previousLandUse: str(row.previousLandUse),
        notes: str(row.notes)
      });
    } else {
      setConvEditing(null);
      setConvForm({ status: "in-conversion", conversionStartDate: today, parallelProduction: "false" });
    }
    setConvOpen(true);
  }
  function saveConv() {
    const body = { ...convForm, parallelProduction: convForm.parallelProduction === "true" };
    convMut.save.mutate({ id: convEditing ? Number(convEditing.id) : void 0, body }, {
      onSuccess: () => {
        setConvOpen(false);
        setConvEditing(null);
        setConvForm({});
      }
    });
  }
  function openSeedForm(row) {
    if (row) {
      setSeedEditing(row);
      setSeedForm({
        purchaseDate: str(row.purchaseDate),
        cropName: str(row.cropName),
        variety: str(row.variety),
        quantityKg: str(row.quantityKg),
        supplierName: str(row.supplierName),
        supplierAddress: str(row.supplierAddress),
        seedType: str(row.seedType) || "organic",
        derogationGranted: row.derogationGranted ? "true" : "false",
        derogationReference: str(row.derogationReference),
        derogationExpiryDate: str(row.derogationExpiryDate),
        certifierApproval: str(row.certifierApproval),
        batchLotNumber: str(row.batchLotNumber),
        poReference: str(row.poReference),
        grnReference: str(row.grnReference),
        notes: str(row.notes)
      });
    } else {
      setSeedEditing(null);
      setSeedForm({ purchaseDate: today, seedType: "organic", derogationGranted: "false" });
    }
    setSeedOpen(true);
  }
  function saveSeed() {
    const body = {
      ...seedForm,
      derogationGranted: seedForm.derogationGranted === "true",
      variety: seedForm.variety === "__other__" ? "" : seedForm.variety || ""
    };
    seedMut.save.mutate({ id: seedEditing ? Number(seedEditing.id) : void 0, body }, {
      onSuccess: () => {
        setSeedOpen(false);
        setSeedEditing(null);
        setSeedForm({});
      }
    });
  }
  const seedVarieties = allVarietyItems.filter((v) => !seedForm.cropName || !v.groupLabel || v.groupLabel === seedForm.cropName).map((v) => v.value);
  function openInputForm(row) {
    if (row) {
      setInputEditing(row);
      setInputForm({
        fieldName: str(row.fieldName),
        applicationDate: str(row.applicationDate),
        productName: str(row.productName),
        activeIngredient: str(row.activeIngredient),
        inputType: str(row.inputType),
        permittedStatus: str(row.permittedStatus) || "permitted",
        regulatoryBasis: str(row.regulatoryBasis),
        supplierName: str(row.supplierName),
        supplierId: str(row.supplierId),
        stockDeliveryId: str(row.stockDeliveryId),
        batchNumber: str(row.batchNumber),
        lotNumber: str(row.lotNumber),
        grnNumber: str(row.grnNumber),
        quantityApplied: str(row.quantityApplied),
        quantityUnit: str(row.quantityUnit) || "kg/ha",
        areaAppliedHa: str(row.areaAppliedHa),
        certifierApproval: str(row.certifierApproval),
        notes: str(row.notes)
      });
      setInputCustomProduct(!ANNEX_INPUTS.some((s) => s.name === str(row.productName)));
      setInputAreaAutoFilled(false);
    } else {
      setInputEditing(null);
      setInputForm({ applicationDate: today, permittedStatus: "permitted", quantityUnit: "kg/ha" });
      setInputCustomProduct(false);
      setInputAreaAutoFilled(false);
    }
    setInputOpen(true);
  }
  function saveInput() {
    inputMut.save.mutate({ id: inputEditing ? Number(inputEditing.id) : void 0, body: inputForm }, {
      onSuccess: () => {
        setInputOpen(false);
        setInputEditing(null);
        setInputForm({});
      }
    });
  }
  function openHarvestForm(row) {
    if (row) {
      setHarvestEditing(row);
      setHarvestForm({
        fieldName: str(row.fieldName),
        harvestDate: str(row.harvestDate),
        cropName: str(row.cropName),
        variety: str(row.variety),
        yieldTonnes: str(row.yieldTonnes),
        moisturePercent: str(row.moisturePercent),
        storageLocation: str(row.storageLocation),
        organicStatus: str(row.organicStatus) || "certified",
        certifierRef: str(row.certifierRef),
        notes: str(row.notes)
      });
    } else {
      setHarvestEditing(null);
      setHarvestForm({ harvestDate: today, organicStatus: "certified" });
    }
    setHarvestOpen(true);
  }
  function saveHarvest() {
    const body = {
      ...harvestForm,
      variety: harvestForm.variety === "__other__" ? "" : harvestForm.variety || ""
    };
    harvestMut.save.mutate({ id: harvestEditing ? Number(harvestEditing.id) : void 0, body }, {
      onSuccess: () => {
        setHarvestOpen(false);
        setHarvestEditing(null);
        setHarvestForm({});
      }
    });
  }
  const harvestVarieties = allVarietyItems.filter((v) => !harvestForm.cropName || !v.groupLabel || v.groupLabel === harvestForm.cropName).map((v) => v.value);
  function openBuyer(row) {
    setBuyerRecord(row);
    setBuyerForm({
      buyerName: str(row.buyerName),
      buyerOrganisation: str(row.buyerOrganisation),
      buyerAddress: str(row.buyerAddress),
      saleDate: str(row.saleDate),
      quantitySoldTonnes: str(row.quantitySoldTonnes),
      pricePoundPerTonne: str(row.pricePoundPerTonne),
      organicPremiumPercent: str(row.organicPremiumPercent),
      declarationDate: str(row.declarationDate),
      declarationReference: str(row.declarationReference)
    });
    setBuyerOpen(true);
  }
  function saveBuyer() {
    if (!buyerRecord) return;
    harvestMut.save.mutate({ id: Number(buyerRecord.id), body: buyerForm }, {
      onSuccess: () => {
        setBuyerOpen(false);
        setBuyerRecord(null);
        setBuyerForm({});
      }
    });
  }
  function printCerts() {
    printProReport({
      title: "Organic Arable — Certification Register",
      recordCount: filteredCerts.length,
      recordLabel: "certificate",
      footerNote: "Organic Arable Certification Register — UK Retained EU Organic Regulation",
      tableHtml: `<table><thead><tr><th>Certifier</th><th>Certificate No.</th><th>Operator No.</th><th>Status</th><th>Certified</th><th>Renewal Due</th><th>Next Inspection</th><th>Scope</th></tr></thead><tbody>${filteredCerts.map((r) => `<tr><td>${str(r.certifier)}</td><td>${str(r.certificateNumber) || "—"}</td><td>${str(r.operatorNumber) || "—"}</td><td>${str(r.status)}</td><td>${fmt(str(r.certificationDate))}</td><td>${fmt(str(r.renewalDate))}</td><td>${fmt(str(r.nextInspectionDue))}</td><td>${str(r.scope) || "—"}</td></tr>`).join("")}</tbody></table>`
    });
  }
  function printConvs() {
    printProReport({
      title: "Organic Arable — Field Conversion Register",
      recordCount: filteredConvs.length,
      recordLabel: "field",
      footerNote: "Organic Arable Field Conversion Register — UK Retained EU Organic Regulation",
      landscape: false,
      tableHtml: `<table><thead><tr><th>Field / Parcel</th><th>Area (ha)</th><th>Status</th><th>Conversion Start</th><th>Expected Cert.</th><th>Actual Cert.</th><th>Certifier Ref</th><th>Previous Land Use</th></tr></thead><tbody>${filteredConvs.map((r) => `<tr><td>${str(r.fieldName)}</td><td>${fmtN(r.areaHa)}</td><td>${str(r.status)}</td><td>${fmt(str(r.conversionStartDate))}</td><td>${fmt(str(r.expectedCertificationDate))}</td><td>${fmt(str(r.actualCertificationDate))}</td><td>${str(r.certifierRef) || "—"}</td><td>${str(r.previousLandUse) || "—"}</td></tr>`).join("")}</tbody></table>`
    });
  }
  function printSeeds() {
    printProReport({
      title: "Organic Arable — Seed Sourcing Log",
      recordCount: filteredSeeds.length,
      recordLabel: "record",
      footerNote: "Organic seed sourcing log — derogation records must be retained for inspection",
      tableHtml: `<table><thead><tr><th>Date</th><th>Crop</th><th>Variety</th><th>Seed Type</th><th>Qty (kg)</th><th>Supplier</th><th>PO Ref</th><th>GRN Ref</th><th>Derogation Ref</th><th>Batch/Lot</th></tr></thead><tbody>${filteredSeeds.map((r) => `<tr><td>${fmt(str(r.purchaseDate))}</td><td>${str(r.cropName)}</td><td>${str(r.variety) || "—"}</td><td>${str(r.seedType)}</td><td>${fmtN(r.quantityKg)}</td><td>${str(r.supplierName) || "—"}</td><td>${str(r.poReference) || "—"}</td><td>${str(r.grnReference) || "—"}</td><td>${str(r.derogationReference) || "—"}</td><td>${str(r.batchLotNumber) || "—"}</td></tr>`).join("")}</tbody></table>`
    });
  }
  function printInputs() {
    printProReport({
      title: "Organic Arable — Permitted Input Register",
      recordCount: filteredInputs.length,
      recordLabel: "application",
      footerNote: "Organic Arable Input Register — Annex II permitted inputs only (UK Retained EU Reg 2018/848)",
      tableHtml: `<table><thead><tr><th>Date</th><th>Product / Substance</th><th>Type</th><th>Status</th><th>Field</th><th>Qty Applied</th><th>Area (ha)</th><th>Certifier Approval</th></tr></thead><tbody>${filteredInputs.map((r) => `<tr><td>${fmt(str(r.applicationDate))}</td><td>${str(r.productName)}</td><td>${str(r.inputType) || "—"}</td><td>${str(r.permittedStatus)}</td><td>${str(r.fieldName) || "—"}</td><td>${fmtN(r.quantityApplied)} ${str(r.quantityUnit)}</td><td>${fmtN(r.areaAppliedHa)}</td><td>${str(r.certifierApproval) || "—"}</td></tr>`).join("")}</tbody></table>`
    });
  }
  function printHarvests() {
    printProReport({
      title: "Organic Arable — Harvest Declarations",
      recordCount: filteredHarvests.length,
      recordLabel: "declaration",
      footerNote: "Organic Arable Harvest Declarations — retain for 5 years and make available at certifier inspection",
      tableHtml: `<table><thead><tr><th>Harvest Date</th><th>Crop</th><th>Variety</th><th>Field</th><th>Yield (t)</th><th>Status</th><th>Buyer</th><th>Sale Date</th><th>Price (£/t)</th><th>Premium %</th><th>Decl. Ref</th></tr></thead><tbody>${filteredHarvests.map((r) => `<tr><td>${fmt(str(r.harvestDate))}</td><td>${str(r.cropName)}</td><td>${str(r.variety) || "—"}</td><td>${str(r.fieldName) || "—"}</td><td>${fmtN(r.yieldTonnes)}</td><td>${str(r.organicStatus)}</td><td>${str(r.buyerName) || "—"} ${str(r.buyerOrganisation) ? `(${str(r.buyerOrganisation)})` : ""}</td><td>${fmt(str(r.saleDate))}</td><td>${fmtN(r.pricePoundPerTonne)}</td><td>${fmtN(r.organicPremiumPercent)}</td><td>${str(r.declarationReference) || "—"}</td></tr>`).join("")}</tbody></table>`
    });
  }
  function exportCertsCsv() {
    downloadCsvFile("organic-arable-certification.csv", [
      ["Certifier", "Certificate No.", "Operator No.", "Status", "Certified Date", "Renewal Date", "Next Inspection", "Scope", "Notes"],
      ...filteredCerts.map((r) => [str(r.certifier), str(r.certificateNumber), str(r.operatorNumber), str(r.status), str(r.certificationDate), str(r.renewalDate), str(r.nextInspectionDue), str(r.scope), str(r.notes)])
    ]);
  }
  function exportConvsCsv() {
    downloadCsvFile("organic-arable-field-conversion.csv", [
      ["Field", "Area (ha)", "Status", "Conversion Start", "Expected Cert.", "Actual Cert.", "Certifier Ref", "Prev. Land Use", "Parallel Production", "Notes"],
      ...filteredConvs.map((r) => [str(r.fieldName), str(r.areaHa), str(r.status), str(r.conversionStartDate), str(r.expectedCertificationDate), str(r.actualCertificationDate), str(r.certifierRef), str(r.previousLandUse), str(r.parallelProduction), str(r.notes)])
    ]);
  }
  function exportSeedsCsv() {
    downloadCsvFile("organic-arable-seed-records.csv", [
      ["Date", "Crop", "Variety", "Seed Type", "Qty (kg)", "Supplier", "Supplier Address", "PO Reference", "GRN Reference", "Derogation Granted", "Derogation Ref", "Derogation Expiry", "Certifier Approval", "Batch/Lot", "Notes"],
      ...filteredSeeds.map((r) => [str(r.purchaseDate), str(r.cropName), str(r.variety), str(r.seedType), str(r.quantityKg), str(r.supplierName), str(r.supplierAddress), str(r.poReference), str(r.grnReference), str(r.derogationGranted), str(r.derogationReference), str(r.derogationExpiryDate), str(r.certifierApproval), str(r.batchLotNumber), str(r.notes)])
    ]);
  }
  function exportInputsCsv() {
    downloadCsvFile("organic-arable-input-records.csv", [
      ["Date", "Field", "Product", "Active Ingredient", "Type", "Status", "Regulatory Basis", "Supplier", "Qty Applied", "Unit", "Area (ha)", "Certifier Approval", "Notes"],
      ...filteredInputs.map((r) => [str(r.applicationDate), str(r.fieldName), str(r.productName), str(r.activeIngredient), str(r.inputType), str(r.permittedStatus), str(r.regulatoryBasis), str(r.supplierName), str(r.quantityApplied), str(r.quantityUnit), str(r.areaAppliedHa), str(r.certifierApproval), str(r.notes)])
    ]);
  }
  function exportHarvestsCsv() {
    downloadCsvFile("organic-arable-harvest-declarations.csv", [
      ["Harvest Date", "Crop", "Variety", "Field", "Yield (t)", "Moisture %", "Storage", "Status", "Certifier Ref", "Buyer", "Buyer Org", "Sale Date", "Qty Sold (t)", "Price (£/t)", "Premium %", "Decl. Date", "Decl. Ref", "Notes"],
      ...filteredHarvests.map((r) => [str(r.harvestDate), str(r.cropName), str(r.variety), str(r.fieldName), str(r.yieldTonnes), str(r.moisturePercent), str(r.storageLocation), str(r.organicStatus), str(r.certifierRef), str(r.buyerName), str(r.buyerOrganisation), str(r.saleDate), str(r.quantitySoldTonnes), str(r.pricePoundPerTonne), str(r.organicPremiumPercent), str(r.declarationDate), str(r.declarationReference), str(r.notes)])
    ]);
  }
  const certsDueThisYear = certs.filter((c) => {
    const d = daysUntil(str(c.renewalDate));
    return d !== null && d >= 0 && d <= 365;
  }).length;
  const certifiedHa = convs.filter((c) => c.status === "certified").reduce((s, c) => s + (parseFloat(str(c.areaHa)) || 0), 0);
  const conversionHa = convs.filter((c) => c.status === "in-conversion").reduce((s, c) => s + (parseFloat(str(c.areaHa)) || 0), 0);
  const derogationCount = seeds.filter((s) => s.seedType !== "organic").length;
  const restrictedInputs = inputs.filter((i) => i.permittedStatus === "restricted").length;
  const totalYield = harvests.reduce((s, h) => s + (parseFloat(str(h.yieldTonnes)) || 0), 0);
  const certifiedHarvests = harvests.filter((h) => h.organicStatus === "certified").length;
  const harvestCropOptions = reactExports.useMemo(() => {
    const unique = [...new Set(harvests.map((h) => str(h.cropName)).filter(Boolean))].sort();
    return [{ value: "all", label: "All Crops" }, ...unique.map((c) => ({ value: c, label: c }))];
  }, [harvests]);
  const seedCropOptions = reactExports.useMemo(() => {
    const unique = [...new Set(seeds.map((s) => str(s.cropName)).filter(Boolean))].sort();
    return [{ value: "all", label: "All Crops" }, ...unique.map((c) => ({ value: c, label: c }))];
  }, [seeds]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-6 h-6 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Organic Arable" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Conversion register, seed sourcing, permitted inputs, harvest declarations and certification records" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: activeTab === "certification", onClick: () => setActiveTab("certification"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
          "Certification"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: activeTab === "field-conversion", onClick: () => setActiveTab("field-conversion"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-3.5 h-3.5" }),
          "Field Conversion"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: activeTab === "seed-sourcing", onClick: () => setActiveTab("seed-sourcing"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5" }),
          "Seed Sourcing"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: activeTab === "input-log", onClick: () => setActiveTab("input-log"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5" }),
          "Input Log"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: activeTab === "harvest-declarations", onClick: () => setActiveTab("harvest-declarations"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-3.5 h-3.5" }),
          "Harvest Declarations"
        ] })
      ] }),
      activeTab === "certification" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: ShieldCheck, label: "Certification Records", value: certs.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: CircleCheck, label: "Active Certifications", value: certs.filter((c) => c.status === "certified").length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: TriangleAlert, label: "Renewals Due (12 months)", value: certsDueThisYear, sub: certsDueThisYear > 0 ? "check renewal dates" : "none due" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FilterPills,
          {
            options: CERT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            value: certFilter,
            onChange: setCertFilter,
            counts: Object.fromEntries(CERT_STATUSES.map((s) => [s.value, s.value === "all" ? certs.length : certs.filter((c) => c.status === s.value).length]))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportBar, { onPrint: printCerts, onCsv: exportCertsCsv, onAdd: () => openCertForm(), addLabel: "Add Certificate" }),
        certQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : filteredCerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: ShieldCheck, message: certFilter === "all" ? "No certification records yet. Add your certifying body certificate." : `No ${certFilter} records.` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Certifier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Certificate No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Certified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Renewal Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Next Inspection" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Scope" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredCerts.map((row) => {
            const d = daysUntil(str(row.renewalDate));
            const urgent = d !== null && d >= 0 && d <= 60;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer ${urgent ? "bg-amber-50/50" : ""}`, onClick: () => setViewCert(row), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: str(row.certifier) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: str(row.certificateNumber) || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(row.status), options: CERT_STATUSES.slice(1) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(str(row.certificationDate)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: urgent ? "text-amber-700 font-medium" : "", children: fmt(str(row.renewalDate)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(str(row.nextInspectionDue)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: formatScopeSummary(str(row.scope)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewCert(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: () => setCertDeleting(Number(row.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
              ] }) })
            ] }, String(row.id));
          }) })
        ] }) })
      ] }),
      activeTab === "field-conversion" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: Sprout, label: "Fields in Register", value: convs.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: CircleCheck, label: "Certified Ha", value: certifiedHa > 0 ? `${certifiedHa.toFixed(2)} ha` : 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: TriangleAlert, label: "In Conversion Ha", value: conversionHa > 0 ? `${conversionHa.toFixed(2)} ha` : 0, sub: "2-year minimum period" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FilterPills,
          {
            options: CONV_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            value: convFilter,
            onChange: setConvFilter,
            counts: Object.fromEntries(CONV_STATUSES.map((s) => [s.value, s.value === "all" ? convs.length : convs.filter((c) => c.status === s.value).length]))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportBar, { onPrint: printConvs, onCsv: exportConvsCsv, onAdd: () => openConvForm(), addLabel: "Add Field" }),
        convQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : filteredConvs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Sprout, message: convFilter === "all" ? "No fields in the conversion register. Add each field or parcel and its conversion start date." : `No ${convFilter} fields.` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Field / Parcel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Conversion Start" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Expected Cert." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Progress" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredConvs.map((row) => {
            const pct = row.status === "certified" ? 100 : conversionProgress(str(row.conversionStartDate), str(row.expectedCertificationDate));
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer", onClick: () => setViewConv(row), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: str(row.fieldName) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtN(row.areaHa, " ha") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(row.status), options: CONV_STATUSES.slice(1) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(str(row.conversionStartDate)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(str(row.expectedCertificationDate)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 min-w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-muted rounded-full h-1.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 rounded-full ${pct === 100 ? "bg-green-500" : "bg-amber-500"}`, style: { width: `${pct}%` } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
                  pct,
                  "%"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewConv(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: () => setConvDeleting(Number(row.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
              ] }) })
            ] }, String(row.id));
          }) })
        ] }) })
      ] }),
      activeTab === "seed-sourcing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 border-b border-border pb-0", children: [
          { key: "declarations", label: "Sourcing Declarations", icon: BookOpen },
          { key: "stock", label: "Seed Stock Ledger", icon: ChartColumn }
        ].map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setSeedSubTab(key),
            className: `flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${seedSubTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5" }),
              label
            ]
          },
          key
        )) }),
        seedSubTab === "declarations" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: Package, label: "Seed Records", value: seeds.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: CircleCheck, label: "Certified Organic", value: seeds.filter((s) => s.seedType === "organic").length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: TriangleAlert, label: "Derogations / Non-Organic", value: derogationCount, sub: derogationCount > 0 ? "certifier approval required" : "none recorded" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [
            seedCropOptions.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs whitespace-nowrap", children: "Crop" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: seedFilterCrop, onValueChange: setSeedFilterCrop, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: seedCropOptions.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FilterPills,
              {
                options: [{ value: "all", label: "All Types" }, ...SEED_TYPES.map((s) => ({ value: s.value, label: s.label }))],
                value: seedFilterType,
                onChange: setSeedFilterType,
                counts: Object.fromEntries([["all", seeds.length], ...SEED_TYPES.map((s) => [s.value, seeds.filter((x) => x.seedType === s.value).length])])
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReportBar, { onPrint: printSeeds, onCsv: exportSeedsCsv, onAdd: () => openSeedForm(), addLabel: "Add Seed Record" }),
          seedQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : filteredSeeds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Package, message: "No seed records. Log all seed purchases — organic certified or with derogation approval." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Crop" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Variety" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Seed Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Qty (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "PO / GRN" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Derogation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredSeeds.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer", onClick: () => setViewSeed(row), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(str(row.purchaseDate)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: str(row.cropName) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: str(row.variety) || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(row.seedType), options: SEED_TYPES }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtN(row.quantityKg) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: str(row.supplierName) || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-xs text-muted-foreground font-mono", children: [
                str(row.poReference) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "PO: ",
                  str(row.poReference)
                ] }) : null,
                str(row.poReference) && str(row.grnReference) ? /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}) : null,
                str(row.grnReference) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "GRN: ",
                  str(row.grnReference)
                ] }) : null,
                !str(row.poReference) && !str(row.grnReference) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: row.derogationGranted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-300", children: [
                "Yes — ",
                str(row.derogationReference) || "ref pending"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "No" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewSeed(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: () => setSeedDeleting(Number(row.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
              ] }) })
            ] }, String(row.id))) })
          ] }) })
        ] }),
        seedSubTab === "stock" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: Package, label: "Stock Lines", value: stockLines.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: CircleCheck, label: "In Stock", value: stockLines.filter((s) => parseFloat(str(s.currentStockKg)) > 0).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: TriangleAlert, label: "Low / Empty", value: stockLines.filter((s) => parseFloat(str(s.currentStockKg)) <= 0).length, sub: "zero balance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: ChartColumn, label: "Total Stock", value: `${stockLines.reduce((a, s) => a + (parseFloat(str(s.currentStockKg)) || 0), 0).toFixed(0)} kg` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setStockEditing(null);
            setStockForm({ seedType: "organic" });
            setStockOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1.5" }),
            "New Stock Line"
          ] }) }),
          stockQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : stockLines.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Package, message: "No stock lines. Create a stock line for each crop/variety/batch you hold, then record goods-in and consumption movements." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: stockLines.map((line) => {
            const kg = parseFloat(str(line.currentStockKg)) || 0;
            const threshold = parseFloat(str(line.reorderThresholdKg)) || 0;
            const isLow = threshold > 0 && kg <= threshold;
            const isSelected = selectedStockId === Number(line.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors ${isSelected ? "bg-green-50/60" : ""}`,
                  onClick: () => setSelectedStockId(isSelected ? null : Number(line.id)),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-2 h-2 rounded-full flex-shrink-0 ${kg <= 0 ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-green-400"}` }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-sm", children: [
                          str(line.cropName),
                          str(line.variety) ? ` — ${str(line.variety)}` : ""
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                          str(line.batchLotNumber) ? `Batch: ${str(line.batchLotNumber)} · ` : "",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(line.seedType), options: SEED_TYPES }),
                          str(line.supplierName) ? ` · ${str(line.supplierName)}` : ""
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-shrink-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold tabular-nums ${kg <= 0 ? "text-red-600" : isLow ? "text-amber-600" : "text-green-600"}`, children: kg.toFixed(1) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "kg in stock" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", onClick: (e) => e.stopPropagation(), children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", onClick: () => {
                          setMoveType("goods_in");
                          setMoveStockId(Number(line.id));
                          setMoveForm({ movementDate: today, quantityKg: "" });
                          setMoveOpen(true);
                        }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { className: "w-3 h-3" }),
                          "Goods In"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", onClick: () => {
                          setMoveType("consumption");
                          setMoveStockId(Number(line.id));
                          setMoveForm({ movementDate: today, quantityKg: "" });
                          setMoveOpen(true);
                        }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "w-3 h-3" }),
                          "Consumed"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => {
                          setStockEditing(line);
                          setStockForm({ cropName: str(line.cropName), variety: str(line.variety), batchLotNumber: str(line.batchLotNumber), seedType: str(line.seedType) || "organic", supplierName: str(line.supplierName), reorderThresholdKg: str(line.reorderThresholdKg), storageLocation: str(line.storageLocation), notes: str(line.notes) });
                          setStockOpen(true);
                        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: () => setStockDeleting(Number(line.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
                      ] })
                    ] })
                  ]
                }
              ),
              isSelected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2 bg-muted/20", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Movement History" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs gap-1", onClick: () => {
                      setMoveType("adjustment");
                      setMoveStockId(Number(line.id));
                      setMoveForm({ movementDate: today, quantityKg: "" });
                      setMoveOpen(true);
                    }, children: "Adjustment" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs gap-1", onClick: () => {
                      setMoveType("waste");
                      setMoveStockId(Number(line.id));
                      setMoveForm({ movementDate: today, quantityKg: "" });
                      setMoveOpen(true);
                    }, children: "Waste" })
                  ] })
                ] }),
                movementsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-muted-foreground" }) }) : movements.filter((m) => Number(m.stockId) === Number(line.id)).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-5", children: "No movements yet — record a Goods In to start the ledger." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/10 text-[10px] uppercase tracking-wider text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Type" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Qty (kg)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Reference" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Field / Operator" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: movements.filter((m) => Number(m.stockId) === Number(line.id)).map((mv) => {
                    const isIn = mv.movementType === "goods_in" || mv.movementType === "adjustment";
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0 hover:bg-muted/10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: fmt(str(mv.movementDate)) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${mv.movementType === "goods_in" ? "bg-green-50 text-green-700" : mv.movementType === "consumption" ? "bg-blue-50 text-blue-700" : mv.movementType === "waste" ? "bg-red-50 text-red-700" : "bg-muted text-muted-foreground"}`, children: [
                        mv.movementType === "goods_in" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { className: "w-2.5 h-2.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "w-2.5 h-2.5" }),
                        String(mv.movementType).replace("_", " ")
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `px-4 py-2 text-right font-mono font-semibold ${isIn ? "text-green-600" : "text-red-600"}`, children: [
                        isIn ? "+" : "-",
                        str(mv.quantityKg),
                        " kg"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-mono text-muted-foreground", children: [str(mv.poReference) ? `PO:${str(mv.poReference)}` : "", str(mv.grnReference) ? `GRN:${str(mv.grnReference)}` : "", str(mv.invoiceReference) ? `Inv:${str(mv.invoiceReference)}` : "", str(mv.reference) || ""].filter(Boolean).join(" · ") || "—" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-muted-foreground", children: [str(mv.fieldName), str(mv.operatorName), str(mv.reason)].filter(Boolean).join(" · ") || "—" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-destructive hover:text-destructive", onClick: () => setMoveDeleting(Number(mv.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) }) })
                    ] }, String(mv.id));
                  }) })
                ] })
              ] })
            ] }, String(line.id));
          }) })
        ] })
      ] }),
      activeTab === "input-log" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Annex II Permitted Inputs — UK Retained EU Organic Regulation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Only listed inputs may be used on certified or in-conversion land. Restricted substances require prior certifier notification. All applications must be recorded here as evidence for inspection." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: FileText, label: "Input Applications", value: inputs.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: CircleCheck, label: "Fully Permitted", value: inputs.filter((i) => i.permittedStatus === "permitted").length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: TriangleAlert, label: "Restricted (notify certifier)", value: restrictedInputs, sub: restrictedInputs > 0 ? "ensure approvals filed" : "none recorded" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs whitespace-nowrap", children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inputFilterYear, onValueChange: setInputFilterYear, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
                yearOptions().map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs whitespace-nowrap", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inputFilterType, onValueChange: setInputFilterType, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-52 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All types" }),
                INPUT_TYPES_ALL.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FilterPills,
            {
              options: PERMITTED_STATUSES.map((s) => ({ value: s.value, label: s.label.split(" —")[0] })),
              value: inputFilterStatus,
              onChange: setInputFilterStatus,
              counts: Object.fromEntries(PERMITTED_STATUSES.map((s) => [s.value, s.value === "all" ? inputs.length : inputs.filter((i) => i.permittedStatus === s.value).length]))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportBar, { onPrint: printInputs, onCsv: exportInputsCsv, onAdd: () => openInputForm(), addLabel: "Log Input" }),
        inputQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : filteredInputs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: FileText, message: "No input records for this filter. Log every fertiliser, soil amendment, and crop protection product applied." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Qty Applied" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredInputs.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer ${row.permittedStatus === "restricted" ? "bg-amber-50/40" : row.permittedStatus === "prohibited" ? "bg-red-50/40" : ""}`, onClick: () => setViewInput(row), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(str(row.applicationDate)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium max-w-[200px] truncate", children: str(row.productName) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: str(row.inputType) || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(row.permittedStatus), options: PERMITTED_STATUSES.slice(1) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: str(row.fieldName) || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
              fmtN(row.quantityApplied),
              " ",
              str(row.quantityUnit)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtN(row.areaAppliedHa, " ha") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewInput(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: () => setInputDeleting(Number(row.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, String(row.id))) })
        ] }) })
      ] }),
      activeTab === "harvest-declarations" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: Wheat, label: "Harvest Records", value: harvests.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: CircleCheck, label: "Certified Organic", value: certifiedHarvests }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { icon: FileText, label: "Total Recorded Yield", value: totalYield > 0 ? `${totalYield.toFixed(2)} t` : "—", sub: "all status types" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs whitespace-nowrap", children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: harvestFilterYear, onValueChange: setHarvestFilterYear, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
                yearOptions().map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
              ] })
            ] })
          ] }),
          harvestCropOptions.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs whitespace-nowrap", children: "Crop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: harvestFilterCrop, onValueChange: setHarvestFilterCrop, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: harvestCropOptions.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FilterPills,
            {
              options: HARVEST_STATUSES.map((s) => ({ value: s.value, label: s.label })),
              value: harvestFilterStatus,
              onChange: setHarvestFilterStatus,
              counts: Object.fromEntries(HARVEST_STATUSES.map((s) => [s.value, s.value === "all" ? harvests.length : harvests.filter((h) => h.organicStatus === s.value).length]))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportBar, { onPrint: printHarvests, onCsv: exportHarvestsCsv, onAdd: () => openHarvestForm(), addLabel: "Log Harvest" }),
        harvestQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : filteredHarvests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Wheat, message: "No harvest records for this filter. Log each organic harvest with field and yield details." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Harvest Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Crop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Yield (t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Buyer Declaration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredHarvests.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer", onClick: () => setViewHarvest(row), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(str(row.harvestDate)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: str(row.cropName) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: str(row.variety) || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: str(row.fieldName) || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtN(row.yieldTonnes, " t") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(row.organicStatus), options: HARVEST_STATUSES.slice(1) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: row.buyerName ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-700 font-medium", children: str(row.buyerName) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "Not recorded" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewHarvest(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: () => setHarvestDeleting(Number(row.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, String(row.id))) })
        ] }) })
      ] })
    ] }),
    viewCert && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewCert(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Certification Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: str(viewCert.certifier) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Certifying Body", value: str(viewCert.certifier) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Certificate No.", value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: str(viewCert.certificateNumber) || "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Operator No.", value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: str(viewCert.operatorNumber) || "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(viewCert.status), options: CERT_STATUSES.slice(1) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Certified Date", value: fmt(str(viewCert.certificationDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Renewal Date", value: fmt(str(viewCert.renewalDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Annual Inspection", value: fmt(str(viewCert.annualInspectionDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Next Inspection Due", value: fmt(str(viewCert.nextInspectionDue)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Scope", value: parseScopeKeys(str(viewCert.scope)).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-0.5", children: parseScopeKeys(str(viewCert.scope)).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium", children: getScopeLabel(k) }, k)) }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Notes", value: str(viewCert.notes) || "—" })
      ] }),
      farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Supporting Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-arable-cert", recordId: Number(viewCert.id), compact: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewCert(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openCertForm(viewCert);
          setViewCert(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1.5" }),
          "Edit Record"
        ] })
      ] })
    ] }) }),
    viewConv && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewConv(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Field Conversion Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: str(viewConv.fieldName) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Field / Parcel", value: str(viewConv.fieldName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Area", value: fmtN(viewConv.areaHa, " ha") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(viewConv.status), options: CONV_STATUSES.slice(1) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Conversion Start", value: fmt(str(viewConv.conversionStartDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Expected Certification", value: fmt(str(viewConv.expectedCertificationDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Actual Certification", value: fmt(str(viewConv.actualCertificationDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Certifier Reference", value: str(viewConv.certifierRef) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Previous Land Use", value: str(viewConv.previousLandUse) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Parallel Production", value: viewConv.parallelProduction ? "Yes" : "No" }),
        !!viewConv.parallelProduction && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Justification", value: str(viewConv.parallelProductionJustification) }),
        viewConv.status !== "certified" && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Conversion Progress", value: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-muted rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-amber-500", style: { width: `${conversionProgress(str(viewConv.conversionStartDate), str(viewConv.expectedCertificationDate))}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
            conversionProgress(str(viewConv.conversionStartDate), str(viewConv.expectedCertificationDate)),
            "%"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Notes", value: str(viewConv.notes) || "—" })
      ] }),
      farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Supporting Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-arable-field-conversion", recordId: Number(viewConv.id), compact: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewConv(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openConvForm(viewConv);
          setViewConv(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1.5" }),
          "Edit Record"
        ] })
      ] })
    ] }) }),
    viewSeed && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewSeed(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Seed Sourcing Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          str(viewSeed.cropName),
          " — ",
          fmt(str(viewSeed.purchaseDate))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Purchase Date", value: fmt(str(viewSeed.purchaseDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Crop", value: str(viewSeed.cropName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Variety", value: str(viewSeed.variety) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Seed Type", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(viewSeed.seedType), options: SEED_TYPES }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Quantity", value: fmtN(viewSeed.quantityKg, " kg") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Batch / Lot No.", value: str(viewSeed.batchLotNumber) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "PO Reference", value: str(viewSeed.poReference) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "GRN Reference", value: str(viewSeed.grnReference) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Supplier", value: str(viewSeed.supplierName) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Supplier Address", value: str(viewSeed.supplierAddress) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Derogation Granted", value: viewSeed.derogationGranted ? "Yes" : "No" }),
        !!viewSeed.derogationGranted && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Derogation Reference", value: str(viewSeed.derogationReference) || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Derogation Expiry", value: fmt(str(viewSeed.derogationExpiryDate)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Certifier Approval", value: str(viewSeed.certifierApproval) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Notes", value: str(viewSeed.notes) || "—" })
      ] }),
      farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Supporting Documents & Invoices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-arable-seed", recordId: Number(viewSeed.id), compact: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewSeed(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openSeedForm(viewSeed);
          setViewSeed(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1.5" }),
          "Edit Record"
        ] })
      ] })
    ] }) }),
    viewInput && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewInput(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Input Application Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          str(viewInput.productName),
          " — ",
          fmt(str(viewInput.applicationDate))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Application Date", value: fmt(str(viewInput.applicationDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Field / Parcel", value: str(viewInput.fieldName) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Product / Substance", value: str(viewInput.productName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Active Ingredient", value: str(viewInput.activeIngredient) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Input Type", value: str(viewInput.inputType) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Permitted Status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(viewInput.permittedStatus), options: PERMITTED_STATUSES.slice(1) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Regulatory Basis", value: str(viewInput.regulatoryBasis) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Supplier", value: str(viewInput.supplierName) || "—" }),
        str(viewInput.grnNumber) && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "GRN Reference", value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: str(viewInput.grnNumber) }) }),
        str(viewInput.batchNumber) && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Batch Number", value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: str(viewInput.batchNumber) }) }),
        str(viewInput.lotNumber) && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Lot Number", value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: str(viewInput.lotNumber) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Quantity Applied", value: `${fmtN(viewInput.quantityApplied)} ${str(viewInput.quantityUnit)}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Area Applied", value: fmtN(viewInput.areaAppliedHa, " ha") }),
        (viewInput.permittedStatus === "restricted" || viewInput.permittedStatus === "derogation") && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Certifier Approval Ref", value: str(viewInput.certifierApproval) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Notes", value: str(viewInput.notes) || "—" })
      ] }),
      farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Supporting Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-arable-input", recordId: Number(viewInput.id), compact: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewInput(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openInputForm(viewInput);
          setViewInput(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1.5" }),
          "Edit Record"
        ] })
      ] })
    ] }) }),
    viewHarvest && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewHarvest(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Harvest Declaration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          str(viewHarvest.cropName),
          " — ",
          fmt(str(viewHarvest.harvestDate))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1 pb-1", children: "Harvest Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Harvest Date", value: fmt(str(viewHarvest.harvestDate)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Crop", value: str(viewHarvest.cropName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Variety", value: str(viewHarvest.variety) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Field / Parcel", value: str(viewHarvest.fieldName) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Yield", value: fmtN(viewHarvest.yieldTonnes, " t") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Moisture %", value: fmtN(viewHarvest.moisturePercent, "%") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Storage Location", value: str(viewHarvest.storageLocation) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Organic Status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: str(viewHarvest.organicStatus), options: HARVEST_STATUSES.slice(1) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Certifier Reference", value: str(viewHarvest.certifierRef) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Notes", value: str(viewHarvest.notes) || "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-border space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1", children: "Buyer Declaration" }),
        viewHarvest.buyerName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Buyer", value: str(viewHarvest.buyerName) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Organisation", value: str(viewHarvest.buyerOrganisation) || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Address", value: str(viewHarvest.buyerAddress) || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Sale Date", value: fmt(str(viewHarvest.saleDate)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Qty Sold", value: fmtN(viewHarvest.quantitySoldTonnes, " t") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Price", value: fmtN(viewHarvest.pricePoundPerTonne, " £/t") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Organic Premium", value: fmtN(viewHarvest.organicPremiumPercent, "%") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Declaration Date", value: fmt(str(viewHarvest.declarationDate)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Declaration Ref", value: str(viewHarvest.declarationReference) || "—" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-2 italic", children: "No buyer declaration recorded yet." })
      ] }),
      farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Supporting Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-arable-harvest", recordId: Number(viewHarvest.id), compact: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewHarvest(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openBuyer(viewHarvest);
          setViewHarvest(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 mr-1.5" }),
          viewHarvest.buyerName ? "Edit Buyer Declaration" : "Add Buyer Declaration"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openHarvestForm(viewHarvest);
          setViewHarvest(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1.5" }),
          "Edit Harvest"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: certOpen, onOpenChange: (v) => !v && setCertOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          certEditing ? "Edit" : "Add",
          " Certification Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record your certifying body certificate and key dates" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: certForm.certifier || "", onValueChange: (v) => setCertForm((f) => ({ ...f, certifier: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certifier…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERTIFIERS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: certForm.certificateNumber || "", onChange: (e) => setCertForm((f) => ({ ...f, certificateNumber: e.target.value })), placeholder: "e.g. SA-1234567" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: certForm.operatorNumber || "", onChange: (e) => setCertForm((f) => ({ ...f, operatorNumber: e.target.value })), placeholder: "e.g. GB-ORG-01-XXXX" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: certForm.status || "certified", onValueChange: (v) => setCertForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERT_STATUSES.slice(1).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: certForm.certificationDate || "", onChange: (e) => setCertForm((f) => ({ ...f, certificationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Renewal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: certForm.renewalDate || "", onChange: (e) => setCertForm((f) => ({ ...f, renewalDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual Inspection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: certForm.annualInspectionDate || "", onChange: (e) => setCertForm((f) => ({ ...f, annualInspectionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Inspection Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: certForm.nextInspectionDue || "", onChange: (e) => setCertForm((f) => ({ ...f, nextInspectionDue: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2 mt-0.5", children: "Select the enterprise areas this certificate covers. No two certifiers can hold the same scope item simultaneously on this holding." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl overflow-hidden", children: SCOPE_GROUPS.map((group, gi) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: gi > 0 ? "border-t border-border" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: group.group }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2.5 flex flex-wrap gap-x-5 gap-y-2", children: group.items.map((item) => {
              const checked = certScopeKeys.includes(item.key);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer select-none", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    className: "w-3.5 h-3.5 rounded accent-primary",
                    checked,
                    onChange: (e) => {
                      if (e.target.checked) setCertScopeKeys((k) => [...k, item.key]);
                      else setCertScopeKeys((k) => k.filter((x) => x !== item.key));
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: item.label })
              ] }, item.key);
            }) })
          ] }, group.group)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: certForm.notes || "", onChange: (e) => setCertForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCertOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveCert, disabled: certMut.save.isPending || !certForm.certifier, children: certMut.save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : certEditing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: convOpen, onOpenChange: (v) => !v && setConvOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          convEditing ? "Edit" : "Add",
          " Field Conversion Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Track the organic conversion status for each field or parcel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Parcel *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldSelector, { value: convForm.fieldName || "", onChange: (v) => {
            const fld = fieldOptions.find((x) => x.name === v);
            setConvForm((f) => ({ ...f, fieldName: v, areaHa: fld?.areaHectares ? String(fld.areaHectares) : f.areaHa }));
          }, fields: fieldOptions })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: convForm.areaHa || "", onChange: (e) => setConvForm((f) => ({ ...f, areaHa: e.target.value })), placeholder: "0.000" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: convForm.status || "in-conversion", onValueChange: (v) => setConvForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONV_STATUSES.slice(1).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: convForm.conversionStartDate || "", onChange: (e) => setConvForm((f) => ({ ...f, conversionStartDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Certification Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: convForm.expectedCertificationDate || "", onChange: (e) => setConvForm((f) => ({ ...f, expectedCertificationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actual Certification Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: convForm.actualCertificationDate || "", onChange: (e) => setConvForm((f) => ({ ...f, actualCertificationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: convForm.certifierRef || "", onChange: (e) => setConvForm((f) => ({ ...f, certifierRef: e.target.value })), placeholder: "e.g. SA-CONV-2024-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Previous Land Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: convForm.previousLandUse || "", onChange: (e) => setConvForm((f) => ({ ...f, previousLandUse: e.target.value })), placeholder: "e.g. Conventional arable — winter wheat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "pp", checked: convForm.parallelProduction === "true", onChange: (e) => setConvForm((f) => ({ ...f, parallelProduction: e.target.checked ? "true" : "false" })), className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pp", className: "cursor-pointer font-normal", children: "Parallel production — same crop variety on both organic and conventional land" })
        ] }),
        convForm.parallelProduction === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parallel Production Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: convForm.parallelProductionJustification || "", onChange: (e) => setConvForm((f) => ({ ...f, parallelProductionJustification: e.target.value })), placeholder: "Certifier approval required — explain justification" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: convForm.notes || "", onChange: (e) => setConvForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConvOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveConv, disabled: convMut.save.isPending || !convForm.fieldName || !convForm.conversionStartDate, children: convMut.save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : convEditing ? "Save Changes" : "Add Field" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: stockOpen, onOpenChange: (v) => !v && setStockOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          stockEditing ? "Edit" : "New",
          " Seed Stock Line"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "A stock line represents a specific crop / variety / batch you hold in store. Goods-in and consumption movements debit and credit this line." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.cropName || "", onValueChange: (v) => setStockForm((f) => ({ ...f, cropName: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: cropOptions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.variety || "", onChange: (e) => setStockForm((f) => ({ ...f, variety: e.target.value })), placeholder: "e.g. KWS Zyatt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Seed Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.seedType || "organic", onValueChange: (v) => setStockForm((f) => ({ ...f, seedType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SEED_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch / Lot Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.batchLotNumber || "", onChange: (e) => setStockForm((f) => ({ ...f, batchLotNumber: e.target.value })), placeholder: "e.g. BL-2024-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          allSuppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.supplierName || "__none__", onValueChange: (v) => setStockForm((f) => ({ ...f, supplierName: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
              allSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.name, children: s.name }, s.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.supplierName || "", onChange: (e) => setStockForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "Supplier name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reorder Threshold (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: stockForm.reorderThresholdKg || "", onChange: (e) => setStockForm((f) => ({ ...f, reorderThresholdKg: e.target.value })), placeholder: "e.g. 500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.storageLocation || "", onChange: (e) => setStockForm((f) => ({ ...f, storageLocation: e.target.value })), placeholder: "e.g. Grain store bay 3" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: stockForm.notes || "", onChange: (e) => setStockForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStockOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !stockForm.cropName || stockMut.save.isPending, onClick: () => {
          stockMut.save.mutate({ id: stockEditing ? Number(stockEditing.id) : void 0, body: stockForm }, {
            onSuccess: () => {
              setStockOpen(false);
              setStockEditing(null);
              setStockForm({});
            }
          });
        }, children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: moveOpen, onOpenChange: (v) => !v && setMoveOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: moveType === "goods_in" ? "Record Goods In" : moveType === "consumption" ? "Record Consumption" : moveType === "waste" ? "Record Waste" : "Stock Adjustment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          moveType === "goods_in" && "Record seed delivered to store. Include PO and GRN references for a full audit trail.",
          moveType === "consumption" && "Record seed used for drilling. Link to field and operator.",
          moveType === "waste" && "Record seed disposed of — include reason for inspection records.",
          moveType === "adjustment" && "Correct stock balance — include reason (e.g. stock count, spillage)."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: moveForm.movementDate || today, onChange: (e) => setMoveForm((f) => ({ ...f, movementDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: moveForm.quantityKg || "", onChange: (e) => setMoveForm((f) => ({ ...f, quantityKg: e.target.value })) })
        ] }),
        moveType === "goods_in" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: moveForm.poReference || "", onChange: (e) => setMoveForm((f) => ({ ...f, poReference: e.target.value })), placeholder: "e.g. PO-2024-007" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: moveForm.grnReference || "", onChange: (e) => setMoveForm((f) => ({ ...f, grnReference: e.target.value })), placeholder: "e.g. GRN-2024-042" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            allSuppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: moveForm.supplierName || "__none__", onValueChange: (v) => setMoveForm((f) => ({ ...f, supplierName: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                allSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.name, children: s.name }, s.id))
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: moveForm.supplierName || "", onChange: (e) => setMoveForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "Supplier name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: moveForm.invoiceReference || "", onChange: (e) => setMoveForm((f) => ({ ...f, invoiceReference: e.target.value })), placeholder: "e.g. INV-2024-1234" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Cost (£/tonne)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: moveForm.unitCostPoundPerTonne || "", onChange: (e) => setMoveForm((f) => ({ ...f, unitCostPoundPerTonne: e.target.value })), placeholder: "e.g. 850.00" })
          ] })
        ] }),
        moveType === "consumption" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: moveForm.fieldId || "__none__", onValueChange: (v) => {
              const f = fieldOptions.find((x) => String(x.id) === v);
              setMoveForm((fm) => ({ ...fm, fieldId: v === "__none__" ? "" : v, fieldName: f ? f.name : fm.fieldName }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                fieldOptions.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: f.name }, String(f.id)))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: moveForm.operatorName || "", onChange: (e) => setMoveForm((f) => ({ ...f, operatorName: e.target.value })), placeholder: "Name of driller" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Seed Rate (kg/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: moveForm.seedRateKgHa || "", onChange: (e) => setMoveForm((f) => ({ ...f, seedRateKgHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area Drilled (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: moveForm.areaDrilledHa || "", onChange: (e) => setMoveForm((f) => ({ ...f, areaDrilledHa: e.target.value })) })
          ] })
        ] }),
        (moveType === "adjustment" || moveType === "waste") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: moveForm.reason || "", onChange: (e) => setMoveForm((f) => ({ ...f, reason: e.target.value })), placeholder: moveType === "waste" ? "e.g. Condemned — contamination" : "e.g. Stocktake correction" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: moveForm.notes || "", onChange: (e) => setMoveForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMoveOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !moveForm.quantityKg || !moveStockId || moveSaveMut.isPending, onClick: () => {
          moveSaveMut.mutate({
            stockId: moveStockId,
            movementType: moveType,
            movementDate: moveForm.movementDate || today,
            quantityKg: moveForm.quantityKg,
            poReference: moveForm.poReference || null,
            grnReference: moveForm.grnReference || null,
            supplierName: moveForm.supplierName || null,
            invoiceReference: moveForm.invoiceReference || null,
            unitCostPoundPerTonne: moveForm.unitCostPoundPerTonne || null,
            fieldId: moveForm.fieldId ? Number(moveForm.fieldId) : null,
            fieldName: moveForm.fieldName || null,
            seedRateKgHa: moveForm.seedRateKgHa || null,
            areaDrilledHa: moveForm.areaDrilledHa || null,
            operatorName: moveForm.operatorName || null,
            reason: moveForm.reason || null,
            notes: moveForm.notes || null
          });
        }, children: "Save Movement" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: seedOpen, onOpenChange: (v) => !v && setSeedOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          seedEditing ? "Edit" : "Add",
          " Seed Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log all seed purchases — organic certified preferred; derogation required for non-organic seed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purchase Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: seedForm.purchaseDate || "", onChange: (e) => setSeedForm((f) => ({ ...f, purchaseDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Seed Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: seedForm.seedType || "organic", onValueChange: (v) => setSeedForm((f) => ({ ...f, seedType: v, derogationGranted: v === "organic" ? "false" : f.derogationGranted })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SEED_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: seedForm.cropName || "", onValueChange: (v) => setSeedForm((f) => ({ ...f, cropName: v, variety: "" })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: cropOptions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
          seedVarieties.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: seedVarieties.includes(seedForm.variety || "") ? seedForm.variety || "" : seedForm.variety === "__other__" ? "__other__" : "",
                onValueChange: (v) => setSeedForm((f) => ({ ...f, variety: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select variety…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    seedVarieties.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / unregistered" })
                  ] })
                ]
              }
            ),
            (seedForm.variety === "__other__" || seedForm.variety && !seedVarieties.includes(seedForm.variety)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Enter variety name",
                value: seedForm.variety === "__other__" ? "" : seedForm.variety,
                onChange: (e) => setSeedForm((f) => ({ ...f, variety: e.target.value }))
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.variety || "", onChange: (e) => setSeedForm((f) => ({ ...f, variety: e.target.value })), placeholder: "e.g. KWS Zyatt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: seedForm.quantityKg || "", onChange: (e) => setSeedForm((f) => ({ ...f, quantityKg: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch / Lot Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.batchLotNumber || "", onChange: (e) => setSeedForm((f) => ({ ...f, batchLotNumber: e.target.value })), placeholder: "e.g. BL-2024-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.poReference || "", onChange: (e) => setSeedForm((f) => ({ ...f, poReference: e.target.value })), placeholder: "e.g. PO-2024-007" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.grnReference || "", onChange: (e) => setSeedForm((f) => ({ ...f, grnReference: e.target.value })), placeholder: "e.g. GRN-2024-042" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          allSuppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: seedForm.supplierName || "__none__",
              onValueChange: (v) => {
                if (v === "__none__") {
                  setSeedForm((f) => ({ ...f, supplierName: "", supplierAddress: "" }));
                  return;
                }
                const s = allSuppliers.find((x) => x.name === v);
                setSeedForm((f) => ({
                  ...f,
                  supplierName: v,
                  supplierAddress: s ? [s.addressLine1, s.addressLine2, s.town, s.county, s.postcode].filter(Boolean).join(", ") : f.supplierAddress
                }));
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                  allSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.name, children: s.name }, s.id))
                ] })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.supplierName || "", onChange: (e) => setSeedForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "e.g. Organic Seed Store Ltd — add suppliers in Trade Contacts & Stock" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.supplierAddress || "", onChange: (e) => setSeedForm((f) => ({ ...f, supplierAddress: e.target.value })), placeholder: "Auto-filled from supplier register, or enter manually" })
        ] }),
        seedForm.seedType !== "organic" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Derogation Required" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Non-organic seed requires prior written approval from your certifying body before use. Attach the approval letter in the record view." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "derog", checked: seedForm.derogationGranted === "true", onChange: (e) => setSeedForm((f) => ({ ...f, derogationGranted: e.target.checked ? "true" : "false" })), className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "derog", className: "cursor-pointer font-normal", children: "Derogation granted by certifier" })
          ] }),
          seedForm.derogationGranted === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Derogation Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.derogationReference || "", onChange: (e) => setSeedForm((f) => ({ ...f, derogationReference: e.target.value })), placeholder: "e.g. SA-DER-2024-007" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Derogation Expiry" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: seedForm.derogationExpiryDate || "", onChange: (e) => setSeedForm((f) => ({ ...f, derogationExpiryDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seedForm.certifierApproval || "", onChange: (e) => setSeedForm((f) => ({ ...f, certifierApproval: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: seedForm.notes || "", onChange: (e) => setSeedForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSeedOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveSeed, disabled: seedMut.save.isPending || !seedForm.purchaseDate || !seedForm.cropName, children: seedMut.save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : seedEditing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: inputOpen, onOpenChange: (v) => !v && setInputOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          inputEditing ? "Edit" : "Log",
          " Input Application"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record all fertilisers, soil amendments, and crop protection products applied to organic fields" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: inputForm.applicationDate || "", onChange: (e) => setInputForm((f) => ({ ...f, applicationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Parcel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FieldSelector,
            {
              value: inputForm.fieldName || "",
              onChange: (v) => {
                const field = fieldOptions.find((f) => f.name === v);
                setInputForm((f) => ({
                  ...f,
                  fieldName: v,
                  areaAppliedHa: field?.areaHectares ? String(field.areaHectares) : f.areaAppliedHa
                }));
                setInputAreaAutoFilled(!!field?.areaHectares);
              },
              fields: fieldOptions
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product / Substance *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SubstancePicker,
            {
              value: inputForm.productName || "",
              onChange: (v) => setInputForm((f) => ({ ...f, productName: v })),
              onIngredient: (ingredient) => setInputForm((f) => ({ ...f, activeIngredient: ingredient }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: inputForm.activeIngredient || "",
              onChange: (e) => setInputForm((f) => ({ ...f, activeIngredient: e.target.value })),
              placeholder: "Auto-filled from selected substance"
            }
          ),
          inputForm.activeIngredient && ANNEX_INPUTS.some((s) => s.name === inputForm.productName) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "✓ Auto-filled from Annex II substance list — edit to override" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inputForm.inputType || "", onValueChange: (v) => setInputForm((f) => ({ ...f, inputType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INPUT_TYPES_ALL.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Permitted Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inputForm.permittedStatus || "permitted", onValueChange: (v) => setInputForm((f) => ({ ...f, permittedStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PERMITTED_STATUSES.slice(1).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regulatory Basis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inputForm.regulatoryBasis || "", onChange: (e) => setInputForm((f) => ({ ...f, regulatoryBasis: e.target.value })), placeholder: "e.g. Annex II EU Reg 2018/848" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty Applied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: inputForm.quantityApplied || "", onChange: (e) => setInputForm((f) => ({ ...f, quantityApplied: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inputForm.quantityUnit || "kg/ha", onValueChange: (v) => setInputForm((f) => ({ ...f, quantityUnit: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: QUANTITY_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area Applied (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.001",
              value: inputForm.areaAppliedHa || "",
              onChange: (e) => {
                setInputForm((f) => ({ ...f, areaAppliedHa: e.target.value }));
                setInputAreaAutoFilled(false);
              }
            }
          ),
          inputAreaAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "✓ Auto-filled from field register — edit to override" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          (() => {
            const agchemSuppliers = allSuppliers.filter((s) => s.supplierType === "agrochemicals");
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: inputForm.supplierId || "__none__",
                  onValueChange: (v) => {
                    if (v === "__none__") {
                      setInputForm((f) => ({ ...f, supplierId: "", supplierName: "", stockDeliveryId: "", grnNumber: "", batchNumber: "", lotNumber: "" }));
                    } else {
                      const supplier = allSuppliers.find((s) => String(s.id) === v);
                      setInputForm((f) => ({ ...f, supplierId: v, supplierName: supplier?.name || "", stockDeliveryId: "", grnNumber: "", batchNumber: "", lotNumber: "" }));
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                      agchemSuppliers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__empty__", disabled: true, children: "No agrochemical suppliers — add in Trade Contacts" }) : agchemSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
                    ] })
                  ]
                }
              ),
              agchemSuppliers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Add agrochemical suppliers in Trade Contacts to enable this field." })
            ] });
          })()
        ] }),
        inputForm.supplierId && inputForm.supplierId !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800", children: "Batch / Lot Traceability — Link to Goods Received Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-600", children: "Select Delivery (GRN)" }),
            (() => {
              const supplierDeliveries = allDeliveries.filter((d) => String(d.supplierId) === inputForm.supplierId);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: inputForm.stockDeliveryId || "__none__",
                  onValueChange: (v) => {
                    if (v === "__none__") {
                      setInputForm((f) => ({ ...f, stockDeliveryId: "", grnNumber: "", batchNumber: "", lotNumber: "" }));
                    } else {
                      const del = supplierDeliveries.find((d) => String(d.id) === v);
                      setInputForm((f) => ({
                        ...f,
                        stockDeliveryId: v,
                        grnNumber: del?.grnNumber || "",
                        batchNumber: del?.batchNumber || f.batchNumber,
                        lotNumber: del?.lotNumber || f.lotNumber
                      }));
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from GRN deliveries…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No specific GRN" }),
                      supplierDeliveries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__no_grn__", disabled: true, children: "No deliveries on file for this supplier" }) : supplierDeliveries.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(d.id), children: [
                        d.grnNumber ? `${d.grnNumber} — ` : "",
                        d.stockItemName || d.productName || "Delivery",
                        d.batchNumber ? ` · Batch: ${d.batchNumber}` : "",
                        " (",
                        new Date(d.deliveryDate).toLocaleDateString("en-GB"),
                        ")"
                      ] }, d.id))
                    ] })
                  ]
                }
              );
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-600", children: "Batch Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", placeholder: "e.g. BT240301", value: inputForm.batchNumber || "", onChange: (e) => setInputForm((f) => ({ ...f, batchNumber: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-600", children: "Lot Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", placeholder: "e.g. LOT-2026-001", value: inputForm.lotNumber || "", onChange: (e) => setInputForm((f) => ({ ...f, lotNumber: e.target.value })) })
            ] })
          ] }),
          inputForm.stockDeliveryId && inputForm.stockDeliveryId !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700", children: "✓ Linked to GRN — batch and lot auto-filled from delivery record" })
        ] }) }),
        inputForm.permittedStatus === "restricted" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inputForm.certifierApproval || "", onChange: (e) => setInputForm((f) => ({ ...f, certifierApproval: e.target.value })), placeholder: "Reference from certifier written approval" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: inputForm.notes || "", onChange: (e) => setInputForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setInputOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveInput, disabled: inputMut.save.isPending || !inputForm.applicationDate || !inputForm.productName || !inputForm.inputType, children: inputMut.save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : inputEditing ? "Save Changes" : "Log Input" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: harvestOpen, onOpenChange: (v) => !v && setHarvestOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          harvestEditing ? "Edit" : "Log",
          " Harvest"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record organic harvest details for a field or parcel. Add the buyer declaration separately from the record view." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: harvestForm.harvestDate || "", onChange: (e) => setHarvestForm((f) => ({ ...f, harvestDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: harvestForm.organicStatus || "certified", onValueChange: (v) => setHarvestForm((f) => ({ ...f, organicStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HARVEST_STATUSES.slice(1).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: harvestForm.cropName || "", onValueChange: (v) => setHarvestForm((f) => ({ ...f, cropName: v, variety: "" })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: cropOptions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
          harvestVarieties.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: harvestVarieties.includes(harvestForm.variety || "") ? harvestForm.variety || "" : harvestForm.variety === "__other__" ? "__other__" : "",
                onValueChange: (v) => setHarvestForm((f) => ({ ...f, variety: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select variety…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    harvestVarieties.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / unregistered" })
                  ] })
                ]
              }
            ),
            (harvestForm.variety === "__other__" || harvestForm.variety && !harvestVarieties.includes(harvestForm.variety)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Enter variety name",
                value: harvestForm.variety === "__other__" ? "" : harvestForm.variety,
                onChange: (e) => setHarvestForm((f) => ({ ...f, variety: e.target.value }))
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: harvestForm.variety || "", onChange: (e) => setHarvestForm((f) => ({ ...f, variety: e.target.value })), placeholder: "e.g. KWS Zyatt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Parcel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldSelector, { value: harvestForm.fieldName || "", onChange: (v) => setHarvestForm((f) => ({ ...f, fieldName: v })), fields: fieldOptions })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yield (tonnes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: harvestForm.yieldTonnes || "", onChange: (e) => setHarvestForm((f) => ({ ...f, yieldTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: harvestForm.moisturePercent || "", onChange: (e) => setHarvestForm((f) => ({ ...f, moisturePercent: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: harvestForm.storageLocation || "", onChange: (e) => setHarvestForm((f) => ({ ...f, storageLocation: e.target.value })), placeholder: "e.g. Grain store A — segregated organic bay" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: harvestForm.certifierRef || "", onChange: (e) => setHarvestForm((f) => ({ ...f, certifierRef: e.target.value })), placeholder: "e.g. SA-CROP-2025-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: harvestForm.notes || "", onChange: (e) => setHarvestForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setHarvestOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveHarvest, disabled: harvestMut.save.isPending || !harvestForm.harvestDate || !harvestForm.cropName, children: harvestMut.save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : harvestEditing ? "Save Changes" : "Log Harvest" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: buyerOpen, onOpenChange: (v) => !v && setBuyerOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          buyerRecord?.buyerName ? "Edit" : "Add",
          " Buyer Declaration"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Record the buyer details and sale declaration for:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: str(buyerRecord?.cropName) }),
          " harvested ",
          fmt(str(buyerRecord?.harvestDate))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: buyerForm.buyerName || "", onChange: (e) => setBuyerForm((f) => ({ ...f, buyerName: e.target.value })), placeholder: "e.g. John Smith" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Organisation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: buyerForm.buyerOrganisation || "", onChange: (e) => setBuyerForm((f) => ({ ...f, buyerOrganisation: e.target.value })), placeholder: "e.g. Organic Grain Merchants Ltd" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: buyerForm.buyerAddress || "", onChange: (e) => setBuyerForm((f) => ({ ...f, buyerAddress: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: buyerForm.saleDate || "", onChange: (e) => setBuyerForm((f) => ({ ...f, saleDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Sold (t)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: buyerForm.quantitySoldTonnes || "", onChange: (e) => setBuyerForm((f) => ({ ...f, quantitySoldTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price (£/tonne)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: buyerForm.pricePoundPerTonne || "", onChange: (e) => setBuyerForm((f) => ({ ...f, pricePoundPerTonne: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Premium %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: buyerForm.organicPremiumPercent || "", onChange: (e) => setBuyerForm((f) => ({ ...f, organicPremiumPercent: e.target.value })), placeholder: "e.g. 25" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: buyerForm.declarationDate || "", onChange: (e) => setBuyerForm((f) => ({ ...f, declarationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: buyerForm.declarationReference || "", onChange: (e) => setBuyerForm((f) => ({ ...f, declarationReference: e.target.value })), placeholder: "e.g. DEC-2025-001" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setBuyerOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveBuyer, disabled: harvestMut.save.isPending, children: harvestMut.save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save Declaration" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: certDeleting !== null,
        onClose: () => setCertDeleting(null),
        saving: certMut.del.isPending,
        onConfirm: () => certMut.del.mutate(certDeleting, { onSuccess: () => setCertDeleting(null) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: convDeleting !== null,
        onClose: () => setConvDeleting(null),
        saving: convMut.del.isPending,
        onConfirm: () => convMut.del.mutate(convDeleting, { onSuccess: () => setConvDeleting(null) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: seedDeleting !== null,
        onClose: () => setSeedDeleting(null),
        saving: seedMut.del.isPending,
        onConfirm: () => seedMut.del.mutate(seedDeleting, { onSuccess: () => setSeedDeleting(null) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: stockDeleting !== null,
        onClose: () => setStockDeleting(null),
        saving: stockMut.del.isPending,
        onConfirm: () => stockMut.del.mutate(stockDeleting, { onSuccess: () => setStockDeleting(null) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: moveDeleting !== null,
        onClose: () => setMoveDeleting(null),
        saving: moveDelMut.isPending,
        onConfirm: () => moveDelMut.mutate(moveDeleting)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: inputDeleting !== null,
        onClose: () => setInputDeleting(null),
        saving: inputMut.del.isPending,
        onConfirm: () => inputMut.del.mutate(inputDeleting, { onSuccess: () => setInputDeleting(null) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: harvestDeleting !== null,
        onClose: () => setHarvestDeleting(null),
        saving: harvestMut.del.isPending,
        onConfirm: () => harvestMut.del.mutate(harvestDeleting, { onSuccess: () => setHarvestDeleting(null) })
      }
    )
  ] });
}
export {
  OrganicArablePage as default
};
