import { b as useAppStore, m as useQuery, j as jsxRuntimeExports, n as Card, U as FlaskConical, c as useQueryClient, a as useToast, r as reactExports, S as useMutation, d as Button, T as Plus, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, L as Label, I as Input, N as DialogMutationError, O as React } from "./index-Ds3qXTXl.js";
import { u as usePersistedTab } from "./use-persisted-tab-BkSWRSa_.js";
import { A as AppLayout, W as Warehouse, I as Info, c as ClipboardList } from "./AppLayout-gD7smBMK.js";
import { T as TabBar, a as TabButton } from "./tab-button-DhhDn-mM.js";
import { B as Badge } from "./badge-q4Dm4D6y.js";
import { CropsTab, WaterTestsTab, HarvestTab, IntakeTab, PackhouseTab, AllergenTab } from "./FreshProducePage-64WUoi-i.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CiZnBM9u.js";
import { C as ConfirmDialog } from "./confirm-dialog-FNKlITHY.js";
import { T as Textarea } from "./textarea-C9LnoljT.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Ds2cGH5k.js";
import { S as StaffSelect } from "./staff-select-B8CZndmH.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-PJXwwVnR.js";
import { S as ShieldCheck } from "./shield-check-C14av2OH.js";
import { F as FileText, D as Droplets } from "./shield-alert-CScPgq-N.js";
import { P as Package } from "./use-safe-clerk-XvRfZiHM.js";
import { T as Thermometer } from "./thermometer-CRSesMeb.js";
import { P as Printer } from "./printer-Bf3wQ4Qq.js";
import { E as Eye } from "./eye-tG5LLDy9.js";
import { P as Pencil } from "./pencil-D9no5hvh.js";
import { T as Trash2 } from "./trash-2-VSnlTP8U.js";
import { a as Clock } from "./database-CtuKqm3A.js";
import { C as CircleCheck } from "./circle-check-cBF89s-p.js";
import "./tractor-BmsewAim.js";
import "./LabSelector-SrMDqF1g.js";
import "./generateCategoricalChart-B7JM6Xey.js";
import "./BarChart-I2wKZC3l.js";
import "./CartesianGrid-BKPC_qWi.js";
import "./chevron-up-Bdcaj78K.js";
import "./use-farm-members-Cy_PmOjk.js";
import "./use-farm-name-BtNXk3HT.js";
import "./layout-grid-B5YRw-cG.js";
import "./archive-BfsKyPK9.js";
import "./index-C-AJI0p9.js";
import "./index-DhrpWCQs.js";
function fmt(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}
function fmtRaw(val) {
  return val == null || val === "" ? "—" : String(val);
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 864e5);
}
function conversionProgress(startDate) {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = start + 2 * 365.25 * 24 * 3600 * 1e3;
  const now = Date.now();
  return Math.min(100, Math.max(0, Math.round((now - start) / (end - start) * 100)));
}
function yearRange() {
  const cur = (/* @__PURE__ */ new Date()).getFullYear();
  return Array.from({ length: 8 }, (_, i) => cur - 2 + i);
}
const ANNEX_INPUTS = [
  { substance: "Farmyard Manure (FYM) — composted or well-rotted", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Composted Plant & Animal Material", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Green Manure / Cover Crop Residue", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Slurry (composted; restricted from non-organic units)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dried Blood (Blood Meal)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Bone Meal / Steamed Bone Flour", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Fish Meal / Fish Emulsion", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Calcified Seaweed (Lithothamnium)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Extract (liquid)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Rock Phosphate (soft / reactive)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Potassium Sulphate (natural mineral extraction, low chloride)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Kieserite (Magnesium Sulphate, natural mineral)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Wood Ash (from untreated wood only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Ground Limestone / Calcium Carbonate", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dolomitic Limestone / Magnesium Limestone", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Gypsum (natural calcium sulphate)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Elemental Sulphur", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Peat (growing media only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Vermiculite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Perlite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Copper Hydroxide", autoType: "Crop Protection / Pesticide" },
  { substance: "Copper Oxychloride", autoType: "Crop Protection / Pesticide" },
  { substance: "Copper Sulphate / Bordeaux Mixture", autoType: "Crop Protection / Pesticide" },
  { substance: "Pyrethrin (from Chrysanthemum cinerariaefolium)", autoType: "Crop Protection / Pesticide" },
  { substance: "Spinosad (restricted — certifier notification required)", autoType: "Crop Protection / Pesticide" },
  { substance: "Azadirachtin / Neem Extract", autoType: "Crop Protection / Pesticide" },
  { substance: "Bacillus thuringiensis (Bt)", autoType: "Crop Protection / Pesticide" },
  { substance: "Bacillus subtilis", autoType: "Crop Protection / Pesticide" },
  { substance: "Beauveria bassiana", autoType: "Crop Protection / Pesticide" },
  { substance: "Entomopathogenic Nematodes", autoType: "Crop Protection / Pesticide" },
  { substance: "Iron Phosphate (slug pellets)", autoType: "Crop Protection / Pesticide" },
  { substance: "Kaolin (particle film)", autoType: "Crop Protection / Pesticide" },
  { substance: "Diatomaceous Earth / Kieselgur", autoType: "Crop Protection / Pesticide" },
  { substance: "Potassium Bicarbonate", autoType: "Crop Protection / Pesticide" },
  { substance: "Sulphur (wettable / dust)", autoType: "Crop Protection / Pesticide" },
  { substance: "Soft Soap / Potassium Soap", autoType: "Crop Protection / Pesticide" },
  { substance: "Rapeseed Oil / Plant Oil", autoType: "Crop Protection / Pesticide" },
  { substance: "Pheromones (mating disruption traps only)", autoType: "Crop Protection / Pesticide" },
  { substance: "Certified Organic Seed", autoType: "Seed Treatment" },
  { substance: "Untreated Conventional Seed (derogation required)", autoType: "Seed Treatment" },
  { substance: "Potassium Permanganate (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Hydrogen Peroxide (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Sodium Hypochlorite (disinfection of equipment only)", autoType: "Cleaning & Disinfection" }
];
const INPUT_TYPES = [
  "Fertiliser / Soil Amendment",
  "Crop Protection / Pesticide",
  "Biological Control",
  "Seed Treatment",
  "Cleaning & Disinfection",
  "Water Treatment",
  "Other"
];
const QUANTITY_UNITS = ["kg", "kg/ha", "l", "l/ha", "t", "g", "g/ha", "units"];
const APPROVAL_STATUS_LABELS = {
  permitted: "Permitted",
  restricted: "Restricted (notify certifier)",
  derogation: "Derogation Required"
};
const APPROVAL_STATUS_COLORS = {
  permitted: "bg-green-50 text-green-700 border-green-300",
  restricted: "bg-amber-50 text-amber-700 border-amber-300",
  derogation: "bg-red-50 text-red-700 border-red-300"
};
function SubstancePicker({ value, onSelect }) {
  const inList = ANNEX_INPUTS.some((o) => o.substance === value);
  const [showCustom, setShowCustom] = reactExports.useState(!inList && value !== "");
  const selectValue = inList ? value : showCustom || value !== "" ? "__other__" : "";
  function handleSelect(val) {
    if (val === "__other__") {
      setShowCustom(true);
      onSelect("", "");
    } else if (val === "") {
      setShowCustom(false);
      onSelect("", "");
    } else {
      const opt = ANNEX_INPUTS.find((o) => o.substance === val);
      if (opt) {
        setShowCustom(false);
        onSelect(opt.substance, opt.autoType);
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "select",
      {
        className: "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
        value: selectValue,
        onChange: (e) => handleSelect(e.target.value),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select approved substance…" }),
          ANNEX_INPUTS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.substance, children: o.substance }, o.substance)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__other__", children: "Other / specify below" })
        ]
      }
    ),
    (showCustom || selectValue === "__other__") && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        required: true,
        placeholder: "Enter product / substance name",
        value: inList ? "" : value,
        onChange: (e) => onSelect(e.target.value, ""),
        autoFocus: true
      }
    )
  ] });
}
const EMPTY_INPUT_FORM = {
  applicationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  cropYear: (/* @__PURE__ */ new Date()).getFullYear(),
  blockId: "",
  inputName: "",
  inputType: "",
  approvalStatus: "permitted",
  certifierApprovalRef: "",
  approvedByBody: "",
  supplier: "",
  poReference: "",
  grnReference: "",
  quantityApplied: "",
  quantityUnit: "kg",
  purposeOfUse: "",
  appliedBy: "",
  notes: ""
};
const EMPTY_SYNTH = { productName: "", activeIngredient: "", productType: "spray", applicationDate: "", notes: "" };
function SyntheticHistoryPanel({
  farmId,
  blockStatusId,
  localEntries,
  onLocalAdd,
  onLocalRemove
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isLocal = blockStatusId == null;
  const [addMode, setAddMode] = reactExports.useState("none");
  const [manualForm, setManualForm] = reactExports.useState({ ...EMPTY_SYNTH });
  const [selectedSprayId, setSelectedSprayId] = reactExports.useState("");
  const { data: persistedEntries = [] } = useQuery({
    queryKey: ["synth-history", blockStatusId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/organic-fp-block-status/${blockStatusId}/synthetic-history`), { credentials: "include" }).then((r) => r.json()),
    enabled: !isLocal
  });
  const { data: sprayOptions = [] } = useQuery({
    queryKey: ["spray-lookup", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/spray-applications-lookup`), { credentials: "include" }).then((r) => r.json()),
    enabled: addMode === "import"
  });
  const addPersisted = useMutation({
    mutationFn: (body) => fetch(apiUrl(`farms/${farmId}/organic-fp-block-status/${blockStatusId}/synthetic-history`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["synth-history", blockStatusId] });
      setAddMode("none");
      setManualForm({ ...EMPTY_SYNTH });
      setSelectedSprayId("");
      toast({ title: "Entry added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const removePersisted = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/organic-fp-synthetic-history/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["synth-history", blockStatusId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const productTypeLabel = (t) => {
    if (t === "spray") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-700", children: "Spray" });
    if (t === "fertiliser") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700", children: "Fertiliser" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600", children: t ?? "Other" });
  };
  const handleAddEntry = () => {
    if (!manualForm.productName) return;
    if (isLocal) {
      onLocalAdd?.({ ...manualForm });
    } else {
      addPersisted.mutate({ ...manualForm });
      return;
    }
    setAddMode("none");
    setManualForm({ ...EMPTY_SYNTH });
  };
  const handleImport = () => {
    const spray = sprayOptions.find((s) => String(s.id) === selectedSprayId);
    if (!spray) return;
    const entry = {
      productName: spray.productName,
      activeIngredient: spray.activeIngredient ?? "",
      productType: "spray",
      applicationDate: spray.applicationDate ? spray.applicationDate.slice(0, 10) : "",
      notes: spray.reasonForApplication ?? "",
      sprayApplicationId: spray.id
    };
    if (isLocal) {
      onLocalAdd?.(entry);
      setAddMode("none");
      setSelectedSprayId("");
    } else {
      addPersisted.mutate(entry);
    }
  };
  const displayEntries = isLocal ? (localEntries ?? []).map((e, i) => ({ ...e, _localIdx: i })) : persistedEntries;
  const isEmpty = displayEntries.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border rounded-lg p-3 space-y-2 bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3" }),
        "Previous Synthetic Input History"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: addMode === "manual" ? "secondary" : "outline", className: "h-6 text-xs px-2", onClick: () => setAddMode((m) => m === "manual" ? "none" : "manual"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3 mr-0.5" }),
          "Manual Entry"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: addMode === "import" ? "secondary" : "outline", className: "h-6 text-xs px-2", onClick: () => setAddMode((m) => m === "import" ? "none" : "import"), children: "Import from Spray Records" })
      ] })
    ] }),
    isEmpty && addMode === "none" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic text-center py-2", children: "No synthetic input history recorded. Use the buttons above to add entries." }),
    isLocal ? (localEntries ?? []).map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 bg-white rounded p-2 border text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: e.productName }),
          productTypeLabel(e.productType),
          e.applicationDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: fmt(e.applicationDate) })
        ] }),
        e.activeIngredient && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-0.5", children: [
          "Active ingredient: ",
          e.activeIngredient
        ] }),
        e.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-0.5 italic", children: e.notes })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-5 w-5 shrink-0", onClick: () => onLocalRemove?.(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3 text-red-400" }) })
    ] }, i)) : persistedEntries.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 bg-white rounded p-2 border text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: e.productName }),
          productTypeLabel(e.productType),
          e.applicationDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: fmt(e.applicationDate) })
        ] }),
        e.activeIngredient && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-0.5", children: [
          "Active ingredient: ",
          e.activeIngredient
        ] }),
        e.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-0.5 italic", children: e.notes })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-5 w-5 shrink-0", onClick: () => removePersisted.mutate(e.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3 text-red-400" }) })
    ] }, e.id)),
    addMode === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-2 space-y-2 bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs", value: manualForm.productName, onChange: (e) => setManualForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-7 text-xs border rounded px-1", value: manualForm.productType, onChange: (e) => setManualForm((f) => ({ ...f, productType: e.target.value })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "spray", children: "Spray / Pesticide" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fertiliser", children: "Fertiliser" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs", value: manualForm.activeIngredient, onChange: (e) => setManualForm((f) => ({ ...f, activeIngredient: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Application Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-7 text-xs", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: manualForm.applicationDate, onChange: (e) => setManualForm((f) => ({ ...f, applicationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs", value: manualForm.notes, onChange: (e) => setManualForm((f) => ({ ...f, notes: e.target.value })), placeholder: "e.g. reason for application" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-6 text-xs", onClick: () => {
          setAddMode("none");
          setManualForm({ ...EMPTY_SYNTH });
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-6 text-xs", disabled: !manualForm.productName || addPersisted.isPending, onClick: handleAddEntry, children: addPersisted.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : "Add Entry" })
      ] })
    ] }),
    addMode === "import" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-2 space-y-2 bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select a spray application from your existing records to import as a synthetic input entry." }),
      sprayOptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs italic text-muted-foreground", children: "No spray records found for this farm." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border rounded px-2 py-1 text-xs", value: selectedSprayId, onChange: (e) => setSelectedSprayId(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a spray record…" }),
          sprayOptions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(s.id), children: [
            fmt(s.applicationDate),
            " — ",
            s.productName,
            s.activeIngredient ? ` (${s.activeIngredient})` : ""
          ] }, s.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-6 text-xs", onClick: () => {
            setAddMode("none");
            setSelectedSprayId("");
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-6 text-xs", disabled: !selectedSprayId || addPersisted.isPending, onClick: handleImport, children: addPersisted.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : "Import" })
        ] })
      ] })
    ] })
  ] });
}
const FP_PRINT_CSS = `
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #15803d; padding-bottom: 8px; margin-bottom: 14px; }
  .hdr-l .title { font-size: 15px; font-weight: bold; color: #15803d; }
  .hdr-l .farm { font-size: 12px; color: #374151; margin-top: 2px; }
  .hdr-r { font-size: 10px; color: #6b7280; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 5px 7px; text-align: left; font-size: 10px; font-weight: bold; color: #15803d; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { display: inline-block; padding: 1px 7px; border-radius: 12px; font-size: 9px; font-weight: bold; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-yellow { background: #fef9c3; color: #854d0e; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-gray { background: #f3f4f6; color: #374151; }
  @media print { @page { size: A4 landscape; margin: 1.5cm; } }
`;
function fpOpenPrint(html) {
  const w = window.open("", "_blank", "width=1100,height=780");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.addEventListener("afterprint", () => w.close());
  setTimeout(() => w.print(), 400);
}
function printFpBlockStatusRegister(blocks, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = blocks.map((b) => `
    <tr>
      <td>${String(b.blockName ?? "—")}</td>
      <td>${String(b.blockReference ?? "—")}</td>
      <td>${String(b.areaHectares ?? "—")}</td>
      <td><span class="badge ${b.status === "fully-organic" ? "badge-green" : b.status === "in-conversion" ? "badge-yellow" : "badge-gray"}">${String(b.status ?? "—").replace(/-/g, " ")}</span></td>
      <td>${b.conversionStartDate ? new Date(b.conversionStartDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${b.fullyOrganicDate ? new Date(b.fullyOrganicDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(b.certifyingBody ?? "—")}</td>
      <td>${String(b.certificationRef ?? "—")}</td>
      <td>${String(b.crop ?? "—")}</td>
      <td>${String(b.notes ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Organic Block Status Register — ${farmName}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Block Conversion Status Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Block Status</b><br>${blocks.length} block${blocks.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Block Name</th><th>Block Ref</th><th>Area (ha)</th><th>Status</th><th>Conv. Start</th><th>Fully Organic Date</th><th>Certifier</th><th>Cert Ref</th><th>Crop</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function printFpInputLog(rows, farmName, yearLabel) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rowsHtml = rows.map((r) => `
    <tr>
      <td>${r.applicationDate ? new Date(r.applicationDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(r.cropYear ?? "—")}</td>
      <td>${String(r.inputName ?? "—")}</td>
      <td>${String(r.inputType ?? "—")}</td>
      <td><span class="badge ${r.approvalStatus === "permitted" ? "badge-green" : r.approvalStatus === "restricted" ? "badge-yellow" : "badge-red"}">${String(r.approvalStatus ?? "—")}</span></td>
      <td>${String(r.supplier ?? "—")}</td>
      <td>${r.quantityApplied ? String(r.quantityApplied) + " " + String(r.quantityUnit ?? "") : "—"}</td>
      <td>${String(r.purposeOfUse ?? "—")}</td>
      <td>${String(r.appliedBy ?? "—")}</td>
      <td>${String(r.certifierApprovalRef ?? "—")}</td>
      <td>${String(r.poReference ?? "—")}</td>
      <td>${String(r.grnReference ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Organic Input Log — ${farmName} — ${yearLabel}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Approved Input Log · ${yearLabel}</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Input Log</b><br>${rows.length} record${rows.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Crop Year</th><th>Input / Product</th><th>Type</th><th>Approval</th><th>Supplier</th><th>Qty Applied</th><th>Purpose</th><th>Applied By</th><th>Certifier Ref</th><th>PO Ref</th><th>GRN Ref</th></tr></thead>
    <tbody>${rowsHtml}</tbody></table></body></html>`);
}
function printFpCertificates(certs, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = certs.map((c) => `
    <tr>
      <td>${String(c.certifyingBody ?? "—")}</td>
      <td>${String(c.certificateNumber ?? "—")}</td>
      <td>${String(c.status ?? "—")}</td>
      <td>${c.issueDate ? new Date(c.issueDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${c.annualRenewalDue ? new Date(c.annualRenewalDue).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(c.scopeDescription ?? "—")}</td>
      <td>${String(c.notes ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Organic Certificates — ${farmName}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Certificates Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Certificates</b><br>${certs.length} record${certs.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Certifying Body</th><th>Certificate No.</th><th>Status</th><th>Issue Date</th><th>Expiry Date</th><th>Annual Renewal Due</th><th>Scope</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function printFpBuyerDeclarations(decls, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = decls.map((d) => `
    <tr>
      <td>${d.declarationDate ? new Date(d.declarationDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(d.buyerName ?? "—")}</td>
      <td>${String(d.buyerAddress ?? "—")}</td>
      <td>${String(d.productDescription ?? "—")}</td>
      <td>${String(d.quantityKg ?? "—")}</td>
      <td>${String(d.certifyingBody ?? "—")}</td>
      <td>${String(d.certificateNumber ?? "—")}</td>
      <td>${String(d.declaredBy ?? "—")}</td>
      <td>${String(d.notes ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Buyer Declarations — ${farmName}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Buyer Organic Declarations</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Buyer Declarations</b><br>${decls.length} record${decls.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Buyer Name</th><th>Address</th><th>Product</th><th>Qty (kg)</th><th>Certifying Body</th><th>Cert Number</th><th>Declared By</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function BlockStatusTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [pendingHistory, setPendingHistory] = reactExports.useState([]);
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["ofp-block-status", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/organic-fp-block-status`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: growerBlocks = [] } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/organic-fp-block-status/${editing.id}`) : apiUrl(`farms/${farmId}/organic-fp-block-status`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ).then((r) => r.json()),
    onSuccess: async (data) => {
      if (!editing && pendingHistory.length > 0) {
        await Promise.all(pendingHistory.map(
          (entry) => fetch(apiUrl(`farms/${farmId}/organic-fp-block-status/${data.id}/synthetic-history`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(entry)
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          })
        ));
        qc.invalidateQueries({ queryKey: ["synth-history", data.id] });
      }
      qc.invalidateQueries({ queryKey: ["ofp-block-status", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setPendingHistory([]);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/organic-fp-block-status/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-block-status", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openAdd = () => {
    setEditing(null);
    setForm({ status: "in-conversion" });
    setPendingHistory([]);
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setPendingHistory([]);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  const statusBadge = (status) => {
    if (status === "fully-organic") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
      "Fully Organic"
    ] });
    if (status === "in-conversion") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
      "In Conversion"
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700", children: status });
  };
  const blockRows = blocks;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Block Conversion Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printFpBlockStatusRegister(blockRows, farmName), disabled: blockRows.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Register"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Block"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : blocks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No block status records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: blocks.map((b, i) => {
      const progress = conversionProgress(b.conversionStartDate);
      const daysLeft = daysUntil(b.fullyOrganicDate);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: fmtRaw(b.blockName) }),
            statusBadge(String(b.status))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: fmtRaw(b.certifyingBody) }),
          b.status === "in-conversion" && !!b.conversionStartDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Conversion progress" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                progress,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-100 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-500 h-2 rounded-full transition-all", style: { width: `${progress}%` } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mt-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Started ",
                fmt(b.conversionStartDate)
              ] }),
              !!b.fullyOrganicDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Full organic ",
                fmt(b.fullyOrganicDate),
                " ",
                daysLeft != null && daysLeft > 0 ? `(${daysLeft}d)` : ""
              ] })
            ] })
          ] }),
          b.status === "fully-organic" && !!b.fullyOrganicDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-1", children: [
            "Certified organic from ",
            fmt(b.fullyOrganicDate)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setViewRecord(b), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(b), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => del.mutate(b.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }) }, i);
    }) }),
    viewRecord && (() => {
      const linkedBlock = growerBlocks.find((b) => String(b.id) === String(viewRecord.blockId));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem", maxHeight: "90vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Block Conversion Details" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Block Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.blockName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.status) })
          ] }),
          linkedBlock?.fieldId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 bg-muted/40 rounded p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1", children: "Parent Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              linkedBlock.fieldName ?? "—",
              linkedBlock.fieldReference ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs ml-1", children: [
                "(",
                linkedBlock.fieldReference,
                ")"
              ] }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-1", children: [
              linkedBlock.fieldIsNvz && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5", children: "NVZ" }),
              linkedBlock.fieldIsOrganic && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5", children: "Organic" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifying Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifyingBody) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Conversion Start" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.conversionStartDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Fully Organic Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.fullyOrganicDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Land Use Before" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.landUseBeforeConversion) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
          ] }),
          !!viewRecord.id && /* @__PURE__ */ jsxRuntimeExports.jsx(SyntheticHistoryPanel, { farmId, blockStatusId: viewRecord.id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            openEdit(viewRecord);
            setViewRecord(null);
          }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
        ] })
      ] }) });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setPendingHistory([]);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem", maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Block Status" : "Add Block Conversion Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Track the organic conversion status of a growing block." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Block Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.blockName ?? "", onChange: (e) => setForm((f) => ({ ...f, blockName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Growing Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Optionally link this record to a named growing block already set up in your system. Selecting one auto-fills the block name and enables cross-referencing with spray records, harvests, and input logs.", className: "cursor-help", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3 h-3 text-muted-foreground" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.blockId ?? "", onValueChange: (v) => {
            const bl = growerBlocks.find((b) => String(b.id) === v);
            setForm((f) => ({ ...f, blockId: v, blockName: f.blockName || (bl?.blockName ?? "") }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Optional — auto-fills name" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: growerBlocks.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(b.id), children: b.blockName }, b.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "in-conversion", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in-conversion", children: "In Conversion" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fully-organic", children: "Fully Organic" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certifyingBody ?? "", onValueChange: (v) => setForm((f) => ({ ...f, certifyingBody: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Soil Association", children: "Soil Association" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "OF&G", children: "OF&G (Organic Farmers & Growers)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Biodynamic Association", children: "Biodynamic Association" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.conversionStartDate ?? "", onChange: (e) => setForm((f) => ({ ...f, conversionStartDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fully Organic Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fullyOrganicDate ?? "", onChange: (e) => setForm((f) => ({ ...f, fullyOrganicDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Land Use Before Conversion" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.landUseBeforeConversion ?? "", onChange: (e) => setForm((f) => ({ ...f, landUseBeforeConversion: e.target.value })), placeholder: "e.g. Conventional arable, intensive vegetable production" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        editing?.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(SyntheticHistoryPanel, { farmId, blockStatusId: editing.id }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          SyntheticHistoryPanel,
          {
            farmId,
            localEntries: pendingHistory,
            onLocalAdd: (e) => setPendingHistory((h) => [...h, e]),
            onLocalRemove: (idx) => setPendingHistory((h) => h.filter((_, i) => i !== idx))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setPendingHistory([]);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.blockName, children: save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save" })
      ] })
    ] }) })
  ] });
}
function InputLogTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY_INPUT_FORM });
  const [yearFilter, setYearFilter] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["ofp-input-log", farmId, yearFilter],
    queryFn: () => {
      const url = yearFilter === "all" ? apiUrl(`farms/${farmId}/organic-fp-input-log`) : apiUrl(`farms/${farmId}/organic-fp-input-log?cropYear=${yearFilter}`);
      return fetch(url, { credentials: "include" }).then((r) => r.json());
    }
  });
  const { data: growerBlocks = [] } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers-lookup", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/suppliers`), { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] })
  });
  const supplierNames = reactExports.useMemo(
    () => (suppliersData?.records ?? []).map((s) => s.name).filter(Boolean),
    [suppliersData]
  );
  const { data: membersData } = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/members`), { credentials: "include" }).then((r) => r.json())
  });
  const staffNames = reactExports.useMemo(
    () => (membersData?.members ?? []).map((m) => `${m.firstName} ${m.lastName}`.trim()).filter(Boolean),
    [membersData]
  );
  const allRows = reactExports.useMemo(
    () => Array.isArray(logs) ? logs : logs.records ?? [],
    [logs]
  );
  const poSuggestions = reactExports.useMemo(() => {
    if (!form.supplier) return [];
    return [...new Set(
      allRows.filter((r) => r.supplier === form.supplier && r.poReference).map((r) => String(r.poReference))
    )];
  }, [allRows, form.supplier]);
  const grnSuggestions = reactExports.useMemo(() => {
    if (!form.supplier) return [];
    return [...new Set(
      allRows.filter((r) => r.supplier === form.supplier && r.grnReference).map((r) => String(r.grnReference))
    )];
  }, [allRows, form.supplier]);
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/organic-fp-input-log/${editing.id}`) : apiUrl(`farms/${farmId}/organic-fp-input-log`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-input-log", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({ ...EMPTY_INPUT_FORM });
      toast({ title: "Input saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/organic-fp-input-log/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-input-log", farmId] });
      toast({ title: "Input deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({
      applicationDate: r.applicationDate?.slice(0, 10) ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      cropYear: r.cropYear != null ? Number(r.cropYear) : (/* @__PURE__ */ new Date()).getFullYear(),
      blockId: r.blockId != null ? String(r.blockId) : "",
      inputName: r.inputName ?? "",
      inputType: r.inputType ?? "",
      approvalStatus: r.approvalStatus ?? "permitted",
      certifierApprovalRef: r.certifierApprovalRef ?? "",
      approvedByBody: r.approvedByBody ?? "",
      supplier: r.supplier ?? "",
      poReference: r.poReference ?? "",
      grnReference: r.grnReference ?? "",
      quantityApplied: r.quantityApplied != null ? String(r.quantityApplied) : "",
      quantityUnit: r.quantityUnit ?? "kg",
      purposeOfUse: r.purposeOfUse ?? "",
      appliedBy: r.appliedBy ?? "",
      notes: r.notes ?? ""
    });
    setOpen(true);
  }
  const rows = allRows;
  const blocks = growerBlocks;
  const blockName = (id) => blocks.find((b) => String(b.id) === String(id))?.blockName ?? "—";
  const permitted = reactExports.useMemo(() => rows.filter((r) => r.approvalStatus === "permitted" || !r.approvalStatus && r.isApproved).length, [rows]);
  const restricted = reactExports.useMemo(() => rows.filter((r) => r.approvalStatus === "restricted").length, [rows]);
  const derogation = reactExports.useMemo(() => rows.filter((r) => r.approvalStatus === "derogation").length, [rows]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-green-50 border-green-200 px-4 py-3 text-sm text-green-800 space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Input log — fresh produce & horticultural organic inputs only" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700", children: "Record every input applied to organic horticultural blocks — fertilisers, crop protection, seed treatments, and cleaning products. This is your evidence register for annual certification inspection." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-700 text-xs border-t border-green-200 pt-1.5", children: [
        "For other enterprise types: arable and general farm inputs belong in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Compliance → Input Register" }),
        "; vineyard inputs belong in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Viticulture → Organic Inputs" }),
        "; livestock feed records belong in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Livestock → Feed Records" }),
        ". Recording the same input in multiple places causes duplication in your audit trail."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "h-8 rounded-md border border-input bg-background px-2 text-sm",
            value: yearFilter,
            onChange: (e) => setYearFilter(e.target.value === "all" ? "all" : parseInt(e.target.value)),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All years" }),
              yearRange().map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
            ]
          }
        ),
        rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-xs pl-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 inline-block" }),
            permitted,
            " permitted"
          ] }),
          restricted > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 inline-block" }),
            restricted,
            " restricted"
          ] }),
          derogation > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 inline-block" }),
            derogation,
            " derogation"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printFpInputLog(rows, farmName, yearFilter === "all" ? "All Years" : String(yearFilter)), disabled: rows.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Input Log"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ ...EMPTY_INPUT_FORM });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Input"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-8 h-8 mx-auto text-muted-foreground opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground italic", children: [
        "No input records",
        yearFilter !== "all" ? ` for ${yearFilter}` : "",
        " yet."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: rows.map((row, i) => {
      const status = row.approvalStatus ?? (row.isApproved ? "permitted" : "restricted");
      const statusColor = APPROVAL_STATUS_COLORS[status] ?? APPROVAL_STATUS_COLORS.permitted;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-green-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: fmtRaw(row.inputName) }),
            !!row.inputType && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full", children: fmtRaw(row.inputType) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor}`, children: APPROVAL_STATUS_LABELS[status] ?? status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5", children: [
            !!row.applicationDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(row.applicationDate) }),
            !!row.blockId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Block: ",
              blockName(row.blockId)
            ] }),
            !!row.supplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Supplier: ",
              fmtRaw(row.supplier)
            ] }),
            !!row.quantityApplied && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Qty: ",
              fmtRaw(row.quantityApplied),
              row.quantityUnit ? ` ${fmtRaw(row.quantityUnit)}` : ""
            ] }),
            !!row.approvedByBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Certifier: ",
              fmtRaw(row.approvedByBody)
            ] })
          ] }),
          !!(row.poReference || row.grnReference) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex gap-3 mt-0.5", children: [
            !!row.poReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "PO: ",
              fmtRaw(row.poReference)
            ] }),
            !!row.grnReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "GRN: ",
              fmtRaw(row.grnReference)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => setViewRecord(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => openEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => del.mutate(row.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) })
        ] })
      ] }) }, i);
    }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Input Log Entry" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product / Substance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.inputName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Input Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.inputType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Approval Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: APPROVAL_STATUS_LABELS[viewRecord.approvalStatus] ?? fmtRaw(viewRecord.approvalStatus) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifierApprovalRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Approved by Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.approvedByBody) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.supplier) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.poReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "GRN / Delivery Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.grnReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Application Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.applicationDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Crop Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.cropYear) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Growing Block" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: blockName(viewRecord.blockId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.quantityApplied ? `${fmtRaw(viewRecord.quantityApplied)} ${fmtRaw(viewRecord.quantityUnit)}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Purpose of Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.purposeOfUse) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Applied By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.appliedBy) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setEditing(null);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Input Record" : "Log Organic Input" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record an input applied to organic blocks — this forms your evidence register for annual inspection." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product / Substance Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SubstancePicker,
            {
              value: form.inputName,
              onSelect: (substance, autoType) => setForm((f) => ({ ...f, inputName: substance, inputType: autoType || f.inputType }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
                value: form.inputType,
                onChange: (e) => setForm((f) => ({ ...f, inputType: e.target.value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
                  INPUT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Growing Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
                value: form.blockId,
                onChange: (e) => setForm((f) => ({ ...f, blockId: e.target.value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— None —" }),
                  blocks.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(b.id), children: b.blockName }, b.id))
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Status *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
                value: form.approvalStatus,
                onChange: (e) => setForm((f) => ({ ...f, approvalStatus: e.target.value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "permitted", children: "Permitted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "restricted", children: "Restricted (notify certifier)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "derogation", children: "Derogation Required" })
                ]
              }
            )
          ] }),
          (form.approvalStatus === "restricted" || form.approvalStatus === "derogation") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierApprovalRef, onChange: (e) => setForm((f) => ({ ...f, certifierApprovalRef: e.target.value })), placeholder: "Reference number" })
          ] }),
          form.approvalStatus === "permitted" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approved by Certifying Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.approvedByBody, onChange: (e) => setForm((f) => ({ ...f, approvedByBody: e.target.value })), placeholder: "e.g. Soil Association, OF&G" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "input-supplier-list", children: supplierNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "input-po-list", children: poSuggestions.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p }, p)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "input-grn-list", children: grnSuggestions.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g }, g)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                list: "input-supplier-list",
                value: form.supplier,
                onChange: (e) => setForm((f) => ({ ...f, supplier: e.target.value, poReference: "", grnReference: "" })),
                placeholder: supplierNames.length > 0 ? "Search or type supplier…" : "Supplier name"
              }
            ),
            supplierNames.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Add suppliers in the Suppliers module to enable the lookup." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purchase Order Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                list: "input-po-list",
                value: form.poReference,
                onChange: (e) => setForm((f) => ({ ...f, poReference: e.target.value })),
                placeholder: form.supplier && poSuggestions.length > 0 ? "Pick or type PO…" : "PO number",
                disabled: false
              }
            ),
            form.supplier && poSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-1", children: [
              poSuggestions.length,
              " PO ref",
              poSuggestions.length !== 1 ? "s" : "",
              " on file for this supplier"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN / Delivery Note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                list: "input-grn-list",
                value: form.grnReference,
                onChange: (e) => setForm((f) => ({ ...f, grnReference: e.target.value })),
                placeholder: form.supplier && grnSuggestions.length > 0 ? "Pick or type GRN…" : "GRN number"
              }
            ),
            form.supplier && grnSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-1", children: [
              grnSuggestions.length,
              " GRN ref",
              grnSuggestions.length !== 1 ? "s" : "",
              " on file for this supplier"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.applicationDate, onChange: (e) => setForm((f) => ({ ...f, applicationDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
                value: form.cropYear,
                onChange: (e) => setForm((f) => ({ ...f, cropYear: parseInt(e.target.value) })),
                children: yearRange().map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Applied" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.quantityApplied, onChange: (e) => setForm((f) => ({ ...f, quantityApplied: e.target.value })), placeholder: "Amount" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
                value: form.quantityUnit,
                onChange: (e) => setForm((f) => ({ ...f, quantityUnit: e.target.value })),
                children: QUANTITY_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u, children: u }, u))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purpose of Use" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.purposeOfUse, onChange: (e) => setForm((f) => ({ ...f, purposeOfUse: e.target.value })), placeholder: "e.g. Slug control, foliar feed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Applied By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.appliedBy, onChange: (v) => setForm((f) => ({ ...f, appliedBy: v })), staffNames })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => save.mutate(form),
            disabled: save.isPending || !form.applicationDate || !form.inputName.trim(),
            children: [
              save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
              "Save"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function CertificatesTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["ofp-certificates", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/organic-fp-certificates`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/organic-fp-certificates/${editing.id}`) : apiUrl(`farms/${farmId}/organic-fp-certificates`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-certificates", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/organic-fp-certificates/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-certificates", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Organic Certificates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printFpCertificates(certs, farmName), disabled: certs.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print List"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm({ status: "active" });
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Certificate"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : certs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No certificates recorded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: certs.map((c, i) => {
      const days = daysUntil(c.annualRenewalDue);
      const expiring = days != null && days <= 60 && days >= 0;
      const expired = days != null && days < 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `p-4 ${expired ? "border-red-300 bg-red-50" : expiring ? "border-amber-300 bg-amber-50" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: fmtRaw(c.certifyingBody) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: fmtRaw(c.certificateNumber) }),
            c.status === "active" && !expired ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "inline w-3 h-3 mr-0.5" }),
              "Active"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800", children: "Expired / Inactive" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: fmtRaw(c.scope) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Issued ",
              fmt(c.issueDate)
            ] }),
            !!c.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Expires ",
              fmt(c.expiryDate)
            ] }),
            !!c.annualRenewalDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: expired ? "text-red-600 font-semibold" : expiring ? "text-amber-700 font-semibold" : "", children: [
              "Renewal due ",
              fmt(c.annualRenewalDue),
              expiring && ` (${days}d)`,
              expired && " — OVERDUE"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          !!(c.annualRenewalDue || c.expiryDate) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Raise task", onClick: () => setRaiseTaskFor({ title: `Organic Certificate ${c.annualRenewalDue ? "Renewal Due" : "Expiring"} — ${c.certifyingBody ?? ""}`, description: `The organic fresh produce certificate${c.certifyingBody ? ` from ${String(c.certifyingBody)}` : ""} ${c.annualRenewalDue ? "annual renewal is due" : "is due to expire"}. Update in Organic Fresh Produce → Certificates.`, dueDate: c.annualRenewalDue ?? c.expiryDate }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 text-amber-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setViewRecord(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => del.mutate(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }) }, i);
    }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Certificate Details" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifyingBody) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: fmtRaw(viewRecord.certificateNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Issue Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.issueDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.expiryDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Annual Renewal Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.annualRenewalDue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.status) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.scope) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Products Included" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.productsIncluded) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Document Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.documentRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Certificate" : "Add Organic Certificate" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certifyingBody ?? "", onValueChange: (v) => setForm((f) => ({ ...f, certifyingBody: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Soil Association", children: "Soil Association" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "OF&G", children: "OF&G" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Biodynamic Association", children: "Biodynamic Association" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificateNumber ?? "", onChange: (e) => setForm((f) => ({ ...f, certificateNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.issueDate ?? "", onChange: (e) => setForm((f) => ({ ...f, issueDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate ?? "", onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual Renewal Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.annualRenewalDue ?? "", onChange: (e) => setForm((f) => ({ ...f, annualRenewalDue: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.scope ?? "", onChange: (e) => setForm((f) => ({ ...f, scope: e.target.value })), placeholder: "e.g. Fresh vegetables and salads" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Products Included" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productsIncluded ?? "", onChange: (e) => setForm((f) => ({ ...f, productsIncluded: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.documentRef ?? "", onChange: (e) => setForm((f) => ({ ...f, documentRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.certifyingBody || !form.certificateNumber || !form.issueDate, children: save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save" })
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
        module: "Organic Fresh Produce",
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null)
      }
    )
  ] });
}
function BuyerDeclarationsTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: decls = [], isLoading } = useQuery({
    queryKey: ["ofp-buyer-decls", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/organic-fp-buyer-declarations`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/organic-fp-buyer-declarations/${editing.id}`) : apiUrl(`farms/${farmId}/organic-fp-buyer-declarations`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-buyer-decls", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/organic-fp-buyer-declarations/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-buyer-decls", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Buyer Organic Declarations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printFpBuyerDeclarations(decls, farmName), disabled: decls.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Log"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm({});
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Declaration"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : decls.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No buyer declarations recorded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Buyer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Qty (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Cert Body" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: decls.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmt(row.declarationDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 font-medium", children: fmtRaw(row.buyerName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmtRaw(row.productDescription) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmtRaw(row.quantityKg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmtRaw(row.certifyingBody) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setViewRecord(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => del.mutate(row.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Buyer Declaration" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Declaration Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.declarationDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.buyerName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.buyerAddress) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.productDescription) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.quantityKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifyingBody) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: fmtRaw(viewRecord.certificateNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Declared By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.declaredBy) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Declaration" : "Add Buyer Organic Declaration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record a declaration that produce supplied to this buyer was grown organically." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.declarationDate ?? "", onChange: (e) => setForm((f) => ({ ...f, declarationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buyerName ?? "", onChange: (e) => setForm((f) => ({ ...f, buyerName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buyerAddress ?? "", onChange: (e) => setForm((f) => ({ ...f, buyerAddress: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Description *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productDescription ?? "", onChange: (e) => setForm((f) => ({ ...f, productDescription: e.target.value })), placeholder: "e.g. Organic winter lettuce, variety Romaine" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.quantityKg ?? "", onChange: (e) => setForm((f) => ({ ...f, quantityKg: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certifyingBody ?? "", onValueChange: (v) => setForm((f) => ({ ...f, certifyingBody: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Soil Association", children: "Soil Association" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "OF&G", children: "OF&G" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Biodynamic Association", children: "Biodynamic Association" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificateNumber ?? "", onChange: (e) => setForm((f) => ({ ...f, certificateNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declared By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.declaredBy ?? "", onChange: (e) => setForm((f) => ({ ...f, declaredBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.declarationDate || !form.buyerName || !form.productDescription, children: save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save" })
      ] })
    ] }) })
  ] });
}
const FP_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  withdrawn: "Withdrawn"
};
const FP_STATUS_COLOURS = {
  pending: "bg-yellow-50 text-yellow-800 border-yellow-300",
  approved: "bg-green-50 text-green-800 border-green-300",
  rejected: "bg-red-50 text-red-800 border-red-300",
  expired: "bg-gray-100 text-gray-600 border-gray-300",
  withdrawn: "bg-slate-50 text-slate-600 border-slate-300"
};
const FP_INPUT_TYPES = ["Seed", "Pesticide / Crop Protection", "Fertiliser / Soil Amendment", "Cleaning Product", "Other"];
const FP_CERTIFIERS = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Organic Food Federation", "Biodynamic Association", "Other"];
const FP_CORRESPONDENCE_TYPES = ["Application to Certifier", "Availability Search Evidence", "Supporting Evidence", "Certifier Query", "Approval Letter", "Rejection Notice", "Conditions Letter", "Renewal Request", "Other"];
const FP_DOCUMENT_TYPES = ["Availability Search Evidence", "Application Letter", "Supporting Evidence", "Approval / Decision Letter", "Conditions Letter", "Rejection Notice", "Photographs", "Other"];
const EMPTY_FP_CASE_FORM = {
  inputName: "",
  inputType: "Seed",
  regulatoryBasis: "UK Organic Regulations 2020 — Schedule 1 / Annex II",
  certifier: "",
  certifierRef: "",
  internalDecisionDate: "",
  availabilitySearchDate: "",
  availabilitySearchRef: "",
  applicationDate: "",
  decisionDate: "",
  status: "pending",
  approvalConditions: "",
  expiryDate: "",
  cropYear: (/* @__PURE__ */ new Date()).getFullYear(),
  justification: "",
  rejectionReason: "",
  rejectionRef: "",
  correctiveAction: "",
  notes: ""
};
const EMPTY_FP_CORRESP_FORM = {
  correspondenceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  direction: "outbound",
  correspondenceType: "Application to Certifier",
  summary: "",
  reference: "",
  notes: ""
};
function FpDerogStatusBadge({ status }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${FP_STATUS_COLOURS[status] ?? "bg-gray-100 text-gray-600 border-gray-300"}`, children: FP_STATUS_LABELS[status] ?? status });
}
function FpDaysRemaining({ dateStr }) {
  const d = daysUntil(dateStr);
  if (d === null) return null;
  if (d < 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-red-700", children: [
    "Expired ",
    Math.abs(d),
    "d ago"
  ] });
  if (d <= 14) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-red-700", children: [
    "Expires in ",
    d,
    "d"
  ] });
  if (d <= 60) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-700", children: [
    "Expires in ",
    d,
    "d"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
    "Expires ",
    fmt(dateStr)
  ] });
}
function FpRecordDecisionDialog({ farmId, derogCase, onClose, onSaved }) {
  const { toast } = useToast();
  const [status, setStatus] = React.useState("approved");
  const [decisionDate, setDecisionDate] = React.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [certifierRef, setCertifierRef] = React.useState(derogCase.certifierRef ?? "");
  const [approvalConditions, setApprovalConditions] = React.useState(derogCase.approvalConditions ?? "");
  const [expiryDate, setExpiryDate] = React.useState(derogCase.expiryDate ?? "");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [rejectionRef, setRejectionRef] = React.useState("");
  const mut = useMutation({
    mutationFn: () => fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogations/${derogCase.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...derogCase, status, decisionDate: decisionDate || null, certifierRef: certifierRef || null, approvalConditions: approvalConditions || null, expiryDate: expiryDate || null, rejectionReason: rejectionReason || null, rejectionRef: rejectionRef || null })
    }).then((r) => {
      if (!r.ok) throw new Error("Failed");
    }),
    onSuccess: () => {
      onSaved();
      toast({ title: "Decision recorded" });
      onClose();
    },
    onError: () => toast({ title: "Error saving decision", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Certifier Decision" }),
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" }),
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
      status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: certifierRef, onChange: (e) => setCertifierRef(e.target.value), placeholder: "Reference from certifying body" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: approvalConditions, onChange: (e) => setApprovalConditions(e.target.value), rows: 2, placeholder: "Any conditions attached to the approval…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: expiryDate, onChange: (e) => setExpiryDate(e.target.value) })
        ] })
      ] }),
      status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: rejectionReason, onChange: (e) => setRejectionReason(e.target.value), rows: 2, placeholder: "Certifier's stated reason for refusing the derogation" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: rejectionRef, onChange: (e) => setRejectionRef(e.target.value), placeholder: "Certifier's reference for the rejection notice" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || !decisionDate, children: mut.isPending ? "Saving…" : "Save Decision" })
    ] })
  ] }) });
}
function InputDerogationsTab({ farmId, farmName: _farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = React.useState(null);
  const [caseOpen, setCaseOpen] = React.useState(false);
  const [recordDecisionFor, setRecordDecisionFor] = React.useState(null);
  const [editingCase, setEditingCase] = React.useState(null);
  const [caseForm, setCaseForm] = React.useState({ ...EMPTY_FP_CASE_FORM });
  const [correspOpen, setCorrespOpen] = React.useState(false);
  const [correspCaseId, setCorrespCaseId] = React.useState(null);
  const [editingCorresp, setEditingCorresp] = React.useState(null);
  const [correspForm, setCorrespForm] = React.useState({ ...EMPTY_FP_CORRESP_FORM });
  const [uploadingCaseId, setUploadingCaseId] = React.useState(null);
  const [uploadDocType, setUploadDocType] = React.useState("Availability Search Evidence");
  const [uploading, setUploading] = React.useState(false);
  const [correspondences, setCorrespondences] = React.useState({});
  const [documents, setDocuments] = React.useState({});
  const [raiseTaskFor, setRaiseTaskFor] = React.useState(null);
  const [pendingDeleteCase, setPendingDeleteCase] = React.useState(null);
  const [pendingDeleteCorresp, setPendingDeleteCorresp] = React.useState(null);
  const [pendingDeleteDoc, setPendingDeleteDoc] = React.useState(null);
  const { data: casesData, isLoading } = useQuery({
    queryKey: ["ofp-input-derogations", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogations`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const cases = casesData?.cases ?? [];
  async function loadCorrespDocs(caseId) {
    const [cr, dr] = await Promise.all([
      fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogations/${caseId}/correspondence`), { credentials: "include" }).then((r) => r.json()),
      fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogations/${caseId}/documents`), { credentials: "include" }).then((r) => r.json())
    ]);
    setCorrespondences((p) => ({ ...p, [caseId]: cr.items ?? [] }));
    setDocuments((p) => ({ ...p, [caseId]: dr.items ?? [] }));
  }
  function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    loadCorrespDocs(id);
  }
  const saveCase = useMutation({
    mutationFn: (b) => fetch(
      editingCase ? apiUrl(`farms/${farmId}/organic-fp/input-derogations/${editingCase.id}`) : apiUrl(`farms/${farmId}/organic-fp/input-derogations`),
      { method: editingCase ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-input-derogations", farmId] });
      setCaseOpen(false);
      setEditingCase(null);
      setCaseForm({ ...EMPTY_FP_CASE_FORM });
      toast({ title: editingCase ? "Case updated" : "Derogation case created" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteCase = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogations/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-input-derogations", farmId] });
      toast({ title: "Case deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveCorresp = useMutation({
    mutationFn: (b) => fetch(
      editingCorresp ? apiUrl(`farms/${farmId}/organic-fp/input-derogation-correspondence/${editingCorresp.id}`) : apiUrl(`farms/${farmId}/organic-fp/input-derogations/${correspCaseId}/correspondence`),
      { method: editingCorresp ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      if (correspCaseId) loadCorrespDocs(correspCaseId);
      setCorrespOpen(false);
      setEditingCorresp(null);
      setCorrespForm({ ...EMPTY_FP_CORRESP_FORM });
      toast({ title: "Correspondence saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteCorresp = useMutation({
    mutationFn: ({ id, caseId }) => fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogation-correspondence/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then(() => {
      loadCorrespDocs(caseId);
    }),
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const deleteDoc = useMutation({
    mutationFn: ({ id, caseId }) => fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogation-documents/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then(() => {
      loadCorrespDocs(caseId);
    }),
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  async function handleUpload(caseId, file) {
    setUploading(true);
    try {
      const presign = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileName: file.name, contentType: file.type, recordType: "organic_fp_derogation" })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
      await fetch(presign.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      await fetch(apiUrl(`farms/${farmId}/organic-fp/input-derogations/${caseId}/documents`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileKey: presign.storageKey ?? presign.fileKey, fileName: file.name, fileSize: file.size, documentType: uploadDocType, mimeType: file.type })
      });
      loadCorrespDocs(caseId);
      setUploadingCaseId(null);
      toast({ title: "Document uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }
  const pending = cases.filter((c) => c.status === "pending").length;
  const approved = cases.filter((c) => c.status === "approved").length;
  const rejected = cases.filter((c) => c.status === "rejected").length;
  const expired = cases.filter((c) => c.status === "expired").length;
  const withdrawn = cases.filter((c) => c.status === "withdrawn").length;
  function openNewCase() {
    setEditingCase(null);
    setCaseForm({ ...EMPTY_FP_CASE_FORM, cropYear: (/* @__PURE__ */ new Date()).getFullYear() });
    setCaseOpen(true);
  }
  function openEditCase(c) {
    setEditingCase(c);
    setCaseForm({
      inputName: c.inputName,
      inputType: c.inputType,
      regulatoryBasis: c.regulatoryBasis ?? "",
      certifier: c.certifier ?? "",
      certifierRef: c.certifierRef ?? "",
      internalDecisionDate: c.internalDecisionDate?.slice(0, 10) ?? "",
      availabilitySearchDate: c.availabilitySearchDate?.slice(0, 10) ?? "",
      availabilitySearchRef: c.availabilitySearchRef ?? "",
      applicationDate: c.applicationDate?.slice(0, 10) ?? "",
      decisionDate: c.decisionDate?.slice(0, 10) ?? "",
      status: c.status,
      approvalConditions: c.approvalConditions ?? "",
      expiryDate: c.expiryDate?.slice(0, 10) ?? "",
      cropYear: c.cropYear ?? (/* @__PURE__ */ new Date()).getFullYear(),
      justification: c.justification ?? "",
      rejectionReason: c.rejectionReason ?? "",
      rejectionRef: c.rejectionRef ?? "",
      correctiveAction: c.correctiveAction ?? "",
      notes: c.notes ?? ""
    });
    setCaseOpen(true);
  }
  function openAddCorresp(caseId) {
    setCorrespCaseId(caseId);
    setEditingCorresp(null);
    setCorrespForm({ ...EMPTY_FP_CORRESP_FORM });
    setCorrespOpen(true);
  }
  function openEditCorresp(c, caseId) {
    setCorrespCaseId(caseId);
    setEditingCorresp(c);
    setCorrespForm({
      correspondenceDate: c.correspondenceDate?.slice(0, 10) ?? "",
      direction: c.direction,
      correspondenceType: c.correspondenceType,
      summary: c.summary,
      reference: c.reference ?? "",
      notes: c.notes ?? ""
    });
    setCorrespOpen(true);
  }
  const cf = (k) => (e) => setCaseForm((p) => ({ ...p, [k]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-amber-50 border-amber-200 px-4 py-3 text-sm text-amber-800 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Under the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UK Organic Regulations 2020" }),
        ", certain inputs — including conventional seed where a certified organic equivalent is unavailable, and restricted crop protection substances — require ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "prior written approval from your certification body" }),
        " before use. This register tracks each derogation application from submission through to the certifier's decision, correspondence log, and supporting documents."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 text-sm", children: [
        pending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
          pending,
          " Pending"
        ] }),
        approved > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 border border-green-200 text-green-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
          approved,
          " Approved"
        ] }),
        rejected > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-800", children: [
          rejected,
          " Rejected"
        ] }),
        expired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-600", children: [
          expired,
          " Expired"
        ] }),
        withdrawn > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600", children: [
          withdrawn,
          " Withdrawn"
        ] }),
        cases.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "No derogation cases yet" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openNewCase, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Add Derogation Case"
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: cases.map((c) => {
      const isExp = expandedId === c.id;
      const corresp = correspondences[c.id] ?? [];
      const docs = documents[c.id] ?? [];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors",
            onClick: () => toggleExpand(c.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FpDerogStatusBadge, { status: c.status }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: c.inputName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: c.inputType }),
                c.cropYear && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-muted px-1.5 py-0.5 rounded", children: c.cropYear }),
                c.certifier && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground hidden sm:inline", children: c.certifier }),
                c.expiryDate && c.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(FpDaysRemaining, { dateStr: c.expiryDate })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0 ml-2", children: [
                c.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 gap-1", onClick: (e) => {
                  e.stopPropagation();
                  setRecordDecisionFor(c);
                }, children: "Record Decision" }),
                c.status === "rejected" && !c.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-orange-100 text-orange-800 text-xs border border-orange-300", children: "Action Required" }),
                c.expiryDate && c.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Raise task", onClick: (e) => {
                  e.stopPropagation();
                  setRaiseTaskFor({ title: `Organic Input Derogation Expiring — ${c.inputName}`, description: `The derogation approval for '${c.inputName}' is due to expire. Renew or confirm with your certifying body.`, dueDate: c.expiryDate ?? void 0 });
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-amber-600" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Edit", onClick: (e) => {
                  e.stopPropagation();
                  openEditCase(c);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Delete", onClick: (e) => {
                  e.stopPropagation();
                  setPendingDeleteCase(c.id);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: `h-4 w-4 text-muted-foreground transition-transform ${isExp ? "opacity-70" : ""}` })
              ] })
            ]
          }
        ),
        isExp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t px-4 pb-4 pt-3 space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Input Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(c.inputType) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Crop Year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(c.cropYear) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(c.certifier) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(c.certifierRef) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Application Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(c.applicationDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Decision Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(c.decisionDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expiry Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(c.expiryDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Availability Search Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(c.availabilitySearchDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Availability Search Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(c.availabilitySearchRef) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 sm:col-span-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Regulatory Basis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(c.regulatoryBasis) })
            ] }),
            c.approvalConditions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 sm:col-span-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Approval Conditions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: c.approvalConditions })
            ] }),
            c.justification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 sm:col-span-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Justification" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: c.justification })
            ] }),
            c.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 sm:col-span-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: c.notes })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
                "Correspondence Log (",
                corresp.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openAddCorresp(c.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
                "Add"
              ] })
            ] }),
            corresp.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-2", children: "No correspondence recorded yet." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: corresp.map((cr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/20 px-3 py-2 text-sm flex gap-3 items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: cr.correspondenceType }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-1.5 py-0.5 rounded border ${cr.direction === "inbound" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200"}`, children: cr.direction === "inbound" ? "Received" : "Sent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: fmt(cr.correspondenceDate) }),
                  cr.reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "Ref: ",
                    cr.reference
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: cr.summary }),
                cr.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 italic", children: cr.notes })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEditCorresp(cr, c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setPendingDeleteCorresp({ id: cr.id, caseId: c.id }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
              ] })
            ] }, cr.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
                "Documents (",
                docs.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setUploadingCaseId(uploadingCaseId === c.id ? null : c.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
                "Upload"
              ] })
            ] }),
            uploadingCaseId === c.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-md border bg-muted/20 p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Document Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-8 w-full rounded-md border border-input bg-background px-2 text-sm", value: uploadDocType, onChange: (e) => setUploadDocType(e.target.value), children: FP_DOCUMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "text-sm", disabled: uploading, onChange: (e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(c.id, f);
              } }),
              uploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                "Uploading…"
              ] })
            ] }),
            docs.length === 0 && uploadingCaseId !== c.id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-1", children: "No documents uploaded yet." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: docs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm rounded border bg-muted/20 px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: d.fileName }),
              d.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: d.notes }),
              d.fileUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: d.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline shrink-0", children: "View" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setPendingDeleteDoc({ id: d.id, caseId: c.id }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
            ] }, d.id)) })
          ] })
        ] })
      ] }, c.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: caseOpen, onOpenChange: (v) => {
      if (!v) {
        setCaseOpen(false);
        setEditingCase(null);
        saveCase.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCase ? "Edit Derogation Case" : "Add Derogation Case" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record a substance requiring prior certifier approval under the UK Organic Regulations." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Input / Substance Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: caseForm.inputName, onChange: cf("inputName"), placeholder: "e.g. Conventional Spring Wheat Seed — Variety Skyfall" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", value: caseForm.inputType, onChange: (e) => setCaseForm((p) => ({ ...p, inputType: e.target.value })), children: FP_INPUT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: caseForm.cropYear, onChange: cf("cropYear") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", value: caseForm.certifier, onChange: (e) => setCaseForm((p) => ({ ...p, certifier: e.target.value })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select —" }),
            FP_CERTIFIERS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: caseForm.certifierRef, onChange: cf("certifierRef"), placeholder: "Certifier's reference for this approval" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: caseForm.availabilitySearchDate, onChange: cf("availabilitySearchDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Internal Decision Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: caseForm.internalDecisionDate, onChange: cf("internalDecisionDate") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Date the holding decided this input was needed." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Ref (OFAS / UKOAS)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: caseForm.availabilitySearchRef, onChange: cf("availabilitySearchRef"), placeholder: "Search reference number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: caseForm.applicationDate, onChange: cf("applicationDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: caseForm.decisionDate, onChange: cf("decisionDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", value: caseForm.status, onChange: (e) => setCaseForm((p) => ({ ...p, status: e.target.value })), children: Object.entries(FP_STATUS_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: caseForm.expiryDate, onChange: cf("expiryDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regulatory Basis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: caseForm.regulatoryBasis, onChange: cf("regulatoryBasis"), placeholder: "e.g. UK Organic Regulations 2020 — Schedule 1 / Annex II" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Justification (why organic alternative unavailable)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: caseForm.justification, onChange: cf("justification"), rows: 3, placeholder: "Explain why no certified organic equivalent was available at the time of sourcing" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: caseForm.approvalConditions, onChange: cf("approvalConditions"), rows: 2, placeholder: "Any conditions placed on the approval by the certifier" })
        ] }),
        caseForm.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: caseForm.rejectionReason, onChange: cf("rejectionReason"), rows: 2, placeholder: "Certifier's stated reason for refusing the derogation" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: caseForm.rejectionRef, onChange: cf("rejectionRef"), placeholder: "Certifier's reference for the rejection notice" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: caseForm.correctiveAction, onChange: cf("correctiveAction"), rows: 2, placeholder: "What the farm did in response to rejection" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: caseForm.notes, onChange: cf("notes"), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveCase, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCaseOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveCase.mutate(caseForm), disabled: !caseForm.inputName || saveCase.isPending, children: saveCase.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    recordDecisionFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FpRecordDecisionDialog,
      {
        farmId,
        derogCase: recordDecisionFor,
        onClose: () => setRecordDecisionFor(null),
        onSaved: () => qc.invalidateQueries({ queryKey: ["ofp-input-derogations", farmId] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: correspOpen, onOpenChange: (v) => {
      if (!v) {
        setCorrespOpen(false);
        setEditingCorresp(null);
        saveCorresp.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCorresp ? "Edit Correspondence" : "Add Correspondence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log a communication with your certifier regarding this derogation application." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Date ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: correspForm.correspondenceDate, onChange: (e) => setCorrespForm((p) => ({ ...p, correspondenceDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", value: correspForm.direction, onChange: (e) => setCorrespForm((p) => ({ ...p, direction: e.target.value })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "outbound", children: "Outbound (sent to certifier)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "inbound", children: "Inbound (received from certifier)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Type ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", value: correspForm.correspondenceType, onChange: (e) => setCorrespForm((p) => ({ ...p, correspondenceType: e.target.value })), children: FP_CORRESPONDENCE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Summary ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: correspForm.summary, onChange: (e) => setCorrespForm((p) => ({ ...p, summary: e.target.value })), rows: 3, placeholder: "Brief description of the content" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: correspForm.reference, onChange: (e) => setCorrespForm((p) => ({ ...p, reference: e.target.value })), placeholder: "Certifier ref or ticket no." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: correspForm.notes, onChange: (e) => setCorrespForm((p) => ({ ...p, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveCorresp, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCorrespOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveCorresp.mutate(correspForm), disabled: !correspForm.summary || !correspForm.correspondenceDate || saveCorresp.isPending, children: saveCorresp.isPending ? "Saving…" : "Save" })
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
        module: "Organic Fresh Produce",
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDeleteCase !== null,
        title: "Delete Derogation Case",
        message: "Delete this derogation case and all its correspondence?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: deleteCase,
        onConfirm: () => {
          if (pendingDeleteCase !== null) deleteCase.mutate(pendingDeleteCase, { onSuccess: () => setPendingDeleteCase(null) });
        },
        onCancel: () => {
          setPendingDeleteCase(null);
          deleteCase.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDeleteCorresp !== null,
        title: "Delete Correspondence",
        message: "Delete this correspondence entry?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: deleteCorresp,
        onConfirm: () => {
          if (pendingDeleteCorresp) deleteCorresp.mutate(pendingDeleteCorresp, { onSuccess: () => setPendingDeleteCorresp(null) });
        },
        onCancel: () => {
          setPendingDeleteCorresp(null);
          deleteCorresp.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDeleteDoc !== null,
        title: "Delete Document",
        message: "Delete this document?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: deleteDoc,
        onConfirm: () => {
          if (pendingDeleteDoc) deleteDoc.mutate(pendingDeleteDoc, { onSuccess: () => setPendingDeleteDoc(null) });
        },
        onCancel: () => {
          setPendingDeleteDoc(null);
          deleteDoc.reset();
        }
      }
    )
  ] });
}
const TABS = [
  { key: "block-status", label: "Block Status", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4" }) },
  { key: "input-log", label: "Input Log", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-4 h-4" }) },
  { key: "input-derogations", label: "Input Derogations", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }) },
  { key: "certificates", label: "Certificates", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4" }) },
  { key: "buyer-declarations", label: "Buyer Declarations", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }) },
  { key: "crops", label: "Crops", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4" }) },
  { key: "water-tests", label: "Water Tests", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-4 h-4" }) },
  { key: "harvest", label: "Harvest", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4" }) },
  { key: "intake", label: "Intake", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "w-4 h-4" }) },
  { key: "packhouse", label: "Packhouse", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { className: "w-4 h-4" }) },
  { key: "allergen", label: "Allergens", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }) }
];
function OrganicFreshProducePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "organic-fresh-produce", farmId, validIds: TABS.map((t) => t.key), defaultTab: "block-status" });
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmData?.name ?? "Farm";
  if (!farmId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Organic Fresh Produce" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Block conversion status, approved input log, input derogation register, organic certification records, and buyer declarations." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabBar, { children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === t.key, onClick: () => setTab(t.key), children: [
      t.icon,
      t.label
    ] }, t.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      tab === "block-status" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlockStatusTab, { farmId, farmName }),
      tab === "input-log" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputLogTab, { farmId, farmName }),
      tab === "input-derogations" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputDerogationsTab, { farmId, farmName }),
      tab === "certificates" && /* @__PURE__ */ jsxRuntimeExports.jsx(CertificatesTab, { farmId, farmName }),
      tab === "buyer-declarations" && /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerDeclarationsTab, { farmId, farmName }),
      tab === "crops" && /* @__PURE__ */ jsxRuntimeExports.jsx(CropsTab, { farmId }),
      tab === "water-tests" && /* @__PURE__ */ jsxRuntimeExports.jsx(WaterTestsTab, { farmId }),
      tab === "harvest" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestTab, { farmId }),
      tab === "intake" && /* @__PURE__ */ jsxRuntimeExports.jsx(IntakeTab, { farmId }),
      tab === "packhouse" && /* @__PURE__ */ jsxRuntimeExports.jsx(PackhouseTab, { farmId }),
      tab === "allergen" && /* @__PURE__ */ jsxRuntimeExports.jsx(AllergenTab, { farmId })
    ] })
  ] }) });
}
export {
  OrganicFreshProducePage as default
};
