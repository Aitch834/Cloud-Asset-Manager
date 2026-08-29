import { b as useAppStore, a as useToast, c as useQueryClient, a4 as useSearch, r as reactExports, S as useMutation, m as useQuery, j as jsxRuntimeExports, d as Button, T as Plus, I as Input, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, N as DialogMutationError, e as LoaderCircle } from "./index-q2SF5na-.js";
import { a as usePersistedFilter, u as usePersistedNumberFilter } from "./use-persisted-filter-B8iJdQjz.js";
import { u as useSafeUser } from "./use-safe-clerk-CyL47sik.js";
import { C as CropYearSelector } from "./CropYearSelector-DvJt30ix.js";
import { c as currentCropYear, i as isInCropYear } from "./cropYear-Dmv-iNR6.js";
import { A as AppLayout, c as ClipboardList } from "./AppLayout-DLEWRumu.js";
import { T as Textarea } from "./textarea-WrD9IjwF.js";
import { B as Badge } from "./badge-BGYi9X5o.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BHW7ZKS4.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-C6rqNWVh.js";
import { u as useUpload } from "./use-upload--KPAcNXP.js";
import { C as ClipboardCheck } from "./shield-alert-Bi25-ayP.js";
import { C as CircleAlert } from "./database-CBvAZAA2.js";
import { E as Eye } from "./eye-CW9eCDFT.js";
import { C as CircleCheck } from "./circle-check-B2AsUiYR.js";
import { S as Search } from "./search-B-rCeo1H.js";
import { E as Ellipsis } from "./ellipsis-Bmu_s_Fs.js";
import { P as Pencil } from "./pencil-mZTRywFx.js";
import { U as UserPlus } from "./user-plus-BY_lvrpP.js";
import { S as SquareCheckBig } from "./square-check-big-ZNrelbGL.js";
import { F as File } from "./file-DKBD5XbC.js";
import { T as Trash2 } from "./trash-2-C5yd-eIS.js";
import { C as Camera } from "./camera-1Q6u9tOz.js";
import "./triangle-alert-B75lyEQ5.js";
import "./shield-check-DXxVNJN_.js";
import "./tractor-D_hoJQRR.js";
import "./index-BM811bwq.js";
import "./index-DdIZJdm_.js";
import "./chevron-up-BAjydpF5.js";
import "./index-BjTJrEVv.js";
import "./circle-RERmXu9u.js";
const UK_CROP_TYPES = [
  "Winter Wheat",
  "Spring Wheat",
  "Winter Barley",
  "Spring Barley",
  "Winter Oats",
  "Spring Oats",
  "Winter Rye",
  "Triticale",
  "Winter OSR",
  "Spring OSR",
  "Linseed",
  "Field Beans",
  "Spring Beans",
  "Peas",
  "Sugar Beet",
  "Fodder Beet",
  "Potatoes",
  "Maize",
  "Grass / Herbage",
  "Cover Crop",
  "Fallow / Bare",
  "Other"
];
function getCropGroup(c) {
  const l = c.toLowerCase();
  if (/wheat|barley|oat|rye|triticale/.test(l)) return "cereal";
  if (/osr|rapeseed/.test(l)) return "osr";
  if (/sugar beet/.test(l)) return "sugarbeet";
  if (/potato/.test(l)) return "potatoes";
  if (/bean/.test(l)) return "beans";
  if (/pea/.test(l)) return "peas";
  if (/maize|corn/.test(l)) return "maize";
  if (/grass|herbage/.test(l)) return "grass";
  return "generic";
}
const GROWTH_STAGES_BY_GROUP = {
  cereal: [
    "Pre-emergence",
    "GS10–19 (Seedling)",
    "GS20–29 (Tillering)",
    "GS30 (Stem extension)",
    "GS31 (1st node)",
    "GS32 (2nd node)",
    "GS37–39 (Flag leaf)",
    "GS41–49 (Booting)",
    "GS51–59 (Ear emergence)",
    "GS61–69 (Anthesis)",
    "GS71–79 (Grain fill)",
    "GS80–89 (Ripening)",
    "Harvest ripe"
  ],
  osr: [
    "Pre-emergence",
    "Cotyledon stage",
    "1–3 true leaves",
    "Rosette (Autumn)",
    "Over-wintered rosette",
    "Stem extension",
    "Green bud",
    "Yellow bud",
    "Full flower",
    "Pod fill",
    "Ripening",
    "Harvest ripe"
  ],
  sugarbeet: [
    "Pre-emergence",
    "Cotyledon stage",
    "2 true leaves",
    "4 true leaves",
    "6 leaves",
    "8 leaves",
    "Canopy closure",
    "Mid-season",
    "Mature / Harvest"
  ],
  potatoes: [
    "Pre-emergence",
    "Emergence",
    "Early vegetative",
    "Canopy development",
    "Canopy closure",
    "Flowering",
    "Tuber bulking",
    "Senescence",
    "Harvest ready"
  ],
  beans: [
    "Pre-emergence",
    "Germination",
    "Seedling (VC)",
    "2 true leaves",
    "Vegetative growth",
    "Flowering (R1)",
    "Pod set (R3)",
    "Pod fill (R5)",
    "Harvest ripe"
  ],
  peas: [
    "Pre-emergence",
    "Germination",
    "Seedling (1st node)",
    "2–4 nodes",
    "Tendrils",
    "Flowering",
    "Pod set",
    "Pod fill",
    "Harvest ripe"
  ],
  maize: [
    "Pre-emergence",
    "VE (Emergence)",
    "V2–V3",
    "V4–V6",
    "V8–V10",
    "V12 (Knee high)",
    "VT (Tasselling)",
    "R1 (Silking)",
    "R2–R3 (Grain fill)",
    "R4–R5 (Dough / Dent)",
    "R6 (Maturity)",
    "Harvest ripe"
  ],
  grass: [
    "Pre-growth / Dormant",
    "Early growth",
    "Vegetative",
    "Stem extension",
    "Heading",
    "Anthesis",
    "Post-cut recovery",
    "Post-grazing recovery"
  ],
  generic: [
    "Pre-emergence",
    "Germination",
    "Seedling",
    "Early vegetative",
    "Vegetative growth",
    "Flowering / Bolting",
    "Fruit / Seed / Tuber set",
    "Maturity",
    "Harvest ripe"
  ]
};
function InspectionPhotoPanel({ recordId, farmId, photos }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const deleteMut = useMutation({
    mutationFn: (photoId) => fetch(`/api/farms/${farmId}/field-inspections/${recordId}/photos/${photoId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-inspections", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/field-inspections/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Photo uploaded" });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 bg-gray-50 px-5 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2", children: "Evidence Photos" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: photos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 11, className: "text-blue-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${p.objectPath}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline", children: p.fileName ?? "photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(p.id), className: "text-red-400 hover:text-red-600 ml-1", style: { background: "none", border: "none", cursor: "pointer", padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 11 }) })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-50", children: [
      isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 12 }),
      isUploading ? `Uploading… ${progress}%` : "Add Photo",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*,application/pdf",
          className: "hidden",
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }
        }
      )
    ] })
  ] });
}
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const ACTION_LABELS = {
  none: "No Action",
  monitor: "Monitor",
  treat: "Treat",
  urgent: "Urgent"
};
function ActionBadge({ action, resolved }) {
  if (resolved) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 border-green-200", children: "Resolved" });
  if (action === "urgent") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-800 border-red-200", children: "Urgent" });
  if (action === "treat") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-orange-100 text-orange-800 border-orange-200", children: "Treat" });
  if (action === "monitor") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-yellow-100 text-yellow-800 border-yellow-200", children: "Monitor" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "No Action" });
}
function RaiseTaskDialog({
  inspection,
  farmId,
  staff,
  onClose,
  onRaised
}) {
  const { toast } = useToast();
  const [memberId, setMemberId] = reactExports.useState("");
  const [dueDate, setDueDate] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = reactExports.useState("");
  const [titleOverride, setTitleOverride] = reactExports.useState(
    `${ACTION_LABELS[inspection.actionRequired]} — ${inspection.fieldName}${inspection.cropType ? ` (${inspection.cropType})` : ""}`
  );
  const [error, setError] = reactExports.useState("");
  const mut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      const member = staff.find((s) => s.id === Number(memberId));
      const name = member ? `${member.firstName} ${member.lastName}` : "staff member";
      if (data.smsSent) {
        toast({ title: "Task raised & assigned", description: `${name} has been notified by SMS.` });
      } else {
        toast({ title: "Task raised & assigned", description: `${name} has been assigned. (No phone number on file — SMS not sent.)` });
      }
      onRaised();
      onClose();
    },
    onError: () => setError("Failed to raise task. Please try again.")
  });
  const activeStaff = staff.filter((s) => s.isActive);
  function handleSubmit(e) {
    e.preventDefault();
    if (!memberId) {
      setError("Please select a staff member.");
      return;
    }
    if (!titleOverride.trim()) {
      setError("Please enter a task title.");
      return;
    }
    setError("");
    mut.mutate({
      assignedToMemberId: Number(memberId),
      title: titleOverride.trim(),
      description: [
        inspection.recommendedAction ? `Recommended action: ${inspection.recommendedAction}` : null,
        inspection.pestDiseaseObservations ? `Observations: ${inspection.pestDiseaseObservations}` : null
      ].filter(Boolean).join("\n\n") || null,
      dueDate: dueDate || null,
      module: "Field Inspections",
      href: "/field-inspections",
      taskType: "field-inspection",
      taskSourceId: String(inspection.id),
      assignmentNote: note.trim() || null
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      mut.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "32rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-5 h-5 text-indigo-600" }),
      "Raise Task from Inspection"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-0.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBadge, { action: inspection.actionRequired, resolved: false }),
          inspection.fieldName,
          inspection.cropType ? ` — ${inspection.cropType}` : ""
        ] }),
        inspection.recommendedAction && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: inspection.recommendedAction })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Task title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: titleOverride, onChange: (e) => setTitleOverride(e.target.value), placeholder: "Task title…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Assign to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: memberId,
              onChange: (e) => setMemberId(e.target.value),
              className: "w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select staff member…" }),
                activeStaff.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.id, children: [
                  s.firstName,
                  " ",
                  s.lastName
                ] }, s.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: dueDate, onChange: (e) => setDueDate(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Note for staff member ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: note, onChange: (e) => setNote(e.target.value), placeholder: "e.g. Check North Field after rain…" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to raise task — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: mut.isPending, className: "bg-indigo-700 hover:bg-indigo-800 text-white", children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
          "Raising…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5 mr-1.5" }),
          "Raise & Assign Task"
        ] }) })
      ] })
    ] })
  ] }) });
}
function FieldInspectionsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useSafeUser();
  const inspectorName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.primaryEmailAddress?.emailAddress || "" : "";
  const searchStr = useSearch();
  const targetInspectionId = (() => {
    const v = new URLSearchParams(searchStr).get("inspectionId");
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : null;
  })();
  const [highlightId, setHighlightId] = reactExports.useState(null);
  const scrolledToTarget = reactExports.useRef(false);
  const [search, setSearch] = reactExports.useState("");
  const [filterAction, setFilterAction] = usePersistedFilter({ page: "field-inspections", filter: "action", farmId, defaultValue: "all" });
  const [filterStatus, setFilterStatus] = usePersistedFilter({ page: "field-inspections", filter: "status", farmId, defaultValue: "all" });
  const [filterField, setFilterField] = usePersistedFilter({ page: "field-inspections", filter: "field", farmId, defaultValue: "__all__" });
  const [cropYear, setCropYear] = usePersistedNumberFilter({ page: "field-inspections", filter: "crop-year", farmId, defaultValue: currentCropYear() });
  const [allYears, setAllYears] = reactExports.useState(false);
  const [resolvedThisMonthMode, setResolvedThisMonthMode] = reactExports.useState(false);
  const [detailRecord, setDetailRecord] = reactExports.useState(null);
  const [resolveOpen, setResolveOpen] = reactExports.useState(false);
  const [resolvedBy, setResolvedBy] = reactExports.useState("");
  const [resolutionNotes, setResolutionNotes] = reactExports.useState("");
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [fieldNameIsCustom, setFieldNameIsCustom] = reactExports.useState(false);
  const emptyForm = () => ({ fieldName: "", inspectionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), cropType: "", growthStage: "", pestDiseaseObservations: "", actionRequired: "none", recommendedAction: "", inspector: inspectorName, notes: "" });
  const [form, setForm] = reactExports.useState(emptyForm());
  const [cropAutoFilled, setCropAutoFilled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (inspectorName && !form.inspector) setForm((f) => ({ ...f, inspector: inspectorName }));
  }, [inspectorName]);
  const formOpen = addOpen || !!editRecord;
  function openEditInspection(r) {
    setCropAutoFilled(false);
    setEditRecord(r);
    setFieldNameIsCustom(!!r.fieldName && registeredFields.length > 0 && !registeredFields.includes(r.fieldName));
    setForm({
      fieldName: r.fieldName,
      inspectionDate: r.inspectionDate ? r.inspectionDate.slice(0, 10) : "",
      cropType: r.cropType ?? "",
      growthStage: r.growthStage ?? "",
      pestDiseaseObservations: r.pestDiseaseObservations ?? "",
      actionRequired: r.actionRequired,
      recommendedAction: r.recommendedAction ?? "",
      inspector: r.inspector ?? "",
      notes: r.notes ?? ""
    });
  }
  function closeInspectionForm() {
    setAddOpen(false);
    setEditRecord(null);
    setForm(emptyForm());
    setFieldNameIsCustom(false);
    setCropAutoFilled(false);
  }
  reactExports.useEffect(() => {
    if (!formOpen || !farmId || !form.fieldName || !form.inspectionDate || editRecord) return;
    let cancelled = false;
    const params = new URLSearchParams({ fieldName: form.fieldName, date: form.inspectionDate });
    fetch(`/api/farms/${farmId}/crop-for-field?${params}`).then((r) => r.json()).then((data2) => {
      if (!cancelled && data2.found && data2.cropName) {
        const matched = UK_CROP_TYPES.find((c) => c.toLowerCase() === (data2.cropName ?? "").toLowerCase()) ?? data2.cropName;
        setForm((f) => ({ ...f, cropType: matched ?? "", growthStage: "" }));
        setCropAutoFilled(true);
      }
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [formOpen, farmId, form.fieldName, form.inspectionDate, editRecord]);
  const raiseAfterSave = reactExports.useRef(false);
  const createInspMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/field-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data2) => {
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Inspection logged" });
      closeInspectionForm();
      if (raiseAfterSave.current && data2?.id) {
        raiseAfterSave.current = false;
        setRaiseTaskRecord(data2);
      } else {
        raiseAfterSave.current = false;
      }
    },
    onError: () => {
      raiseAfterSave.current = false;
      toast({ title: "Failed to save inspection", variant: "destructive" });
    }
  });
  const updateInspMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/field-inspections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Inspection updated" });
      closeInspectionForm();
    },
    onError: () => toast({ title: "Failed to update inspection", variant: "destructive" })
  });
  useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/field-inspections/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Inspection deleted" });
    },
    onError: () => toast({ title: "Failed to delete inspection", variant: "destructive" })
  });
  const [raiseTaskRecord, setRaiseTaskRecord] = reactExports.useState(null);
  const { data: staffData } = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    enabled: !!farmId
  });
  const staff = staffData?.members ?? [];
  const { data: tasksData } = useQuery({
    queryKey: ["task-assignments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments`).then((r) => r.json()),
    enabled: !!farmId
  });
  const inspectionTaskMap = reactExports.useMemo(() => {
    const map = {};
    for (const t of tasksData?.records ?? []) {
      if (t.taskType === "field-inspection" && t.taskSourceId && t.status !== "cancelled") {
        const id = Number(t.taskSourceId);
        map[id] = (map[id] ?? 0) + 1;
      }
    }
    return map;
  }, [tasksData]);
  function submitInspectionForm() {
    if (!form.fieldName || !form.inspectionDate) {
      toast({ title: "Field name and date are required", variant: "destructive" });
      return;
    }
    const body = { fieldName: form.fieldName, inspectionDate: form.inspectionDate, cropType: form.cropType || null, growthStage: form.growthStage || null, pestDiseaseObservations: form.pestDiseaseObservations || null, actionRequired: form.actionRequired, recommendedAction: form.recommendedAction || null, inspector: form.inspector || null, notes: form.notes || null };
    if (editRecord) {
      updateInspMut.mutate({ id: editRecord.id, body });
    } else {
      createInspMut.mutate(body);
    }
  }
  function submitAndRaiseTask() {
    if (!form.fieldName || !form.inspectionDate) {
      toast({ title: "Field name and date are required", variant: "destructive" });
      return;
    }
    raiseAfterSave.current = true;
    const body = { fieldName: form.fieldName, inspectionDate: form.inspectionDate, cropType: form.cropType || null, growthStage: form.growthStage || null, pestDiseaseObservations: form.pestDiseaseObservations || null, actionRequired: form.actionRequired, recommendedAction: form.recommendedAction || null, inspector: form.inspector || null, notes: form.notes || null };
    createInspMut.mutate(body);
  }
  const canRaiseTask = form.actionRequired === "monitor" || form.actionRequired === "treat" || form.actionRequired === "urgent";
  const { data: fieldsData } = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId
  });
  const registeredFields = (fieldsData?.records ?? []).filter((f) => f.isActive !== false).map((f) => f.name).sort();
  const { data, isLoading } = useQuery({
    queryKey: ["field-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-inspections`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = data?.records ?? [];
  const openActions = records.filter((r) => !r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent")).length;
  const monitored = records.filter((r) => !r.isResolved && r.actionRequired === "monitor").length;
  const resolvedThisMonth = (() => {
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return records.filter((r) => r.isResolved && r.resolvedAt && new Date(r.resolvedAt) >= start).length;
  })();
  const thisMonthStart = (() => {
    const n = /* @__PURE__ */ new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  })();
  const thisMonthLabel = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  reactExports.useEffect(() => {
    if (targetInspectionId == null || scrolledToTarget.current || records.length === 0) return;
    if (!records.some((r) => r.id === targetInspectionId)) return;
    scrolledToTarget.current = true;
    setHighlightId(targetInspectionId);
    setTimeout(() => {
      document.getElementById(`inspection-row-${targetInspectionId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    const t = setTimeout(() => setHighlightId(null), 4e3);
    return () => clearTimeout(t);
  }, [targetInspectionId, records]);
  const filtered = records.filter((r) => {
    if (r.id === targetInspectionId) return true;
    if (!allYears && !isInCropYear(r.inspectionDate, cropYear)) return false;
    if (resolvedThisMonthMode) {
      if (!r.isResolved || !r.resolvedAt || new Date(r.resolvedAt) < thisMonthStart) return false;
    }
    const matchSearch = !search || r.fieldName.toLowerCase().includes(search.toLowerCase()) || r.inspector?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || r.actionRequired === filterAction;
    const matchField = filterField === "__all__" || r.fieldName === filterField;
    const matchStatus = filterStatus === "all" ? true : filterStatus === "open" ? !r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent") : filterStatus === "resolved" ? r.isResolved : filterStatus === "monitor" ? r.actionRequired === "monitor" && !r.isResolved : true;
    return matchSearch && matchAction && matchField && matchStatus;
  });
  const resolveMutation = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/field-inspections/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolvedBy, resolutionNotes })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Inspection resolved", description: "The action has been marked as resolved." });
      setResolveOpen(false);
      setDetailRecord(null);
      setResolvedBy("");
      setResolutionNotes("");
    },
    onError: () => toast({ title: "Error", description: "Failed to resolve the inspection.", variant: "destructive" })
  });
  function openResolve(r) {
    setDetailRecord(r);
    setResolvedBy(inspectorName);
    setResolveOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-5 h-5 text-green-700" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Field Inspections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Track crop inspection findings and resolve field actions" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm(emptyForm());
          setEditRecord(null);
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1.5" }),
          "Log Inspection"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide font-medium mb-1", children: "Total Inspections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: records.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setFilterStatus("open");
              setAllYears(true);
              setFilterAction("all");
              setSearch("");
              setResolvedThisMonthMode(false);
            },
            className: "bg-white rounded-lg border p-4 text-left transition-all",
            style: {
              borderColor: allYears && filterStatus === "open" ? "#dc2626" : "#fecaca",
              background: allYears && filterStatus === "open" ? "#fff1f1" : "#fff",
              cursor: "pointer",
              boxShadow: allYears && filterStatus === "open" ? "0 0 0 2px #fca5a5" : "none"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 text-red-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 uppercase tracking-wide font-medium", children: "Open Actions" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }, children: "click to view all" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-700", children: openActions }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Treat or urgent — unresolved · all years" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setFilterStatus("monitor");
              setAllYears(true);
              setFilterAction("all");
              setSearch("");
              setResolvedThisMonthMode(false);
            },
            className: "bg-white rounded-lg border p-4 text-left transition-all",
            style: {
              borderColor: allYears && filterStatus === "monitor" ? "#d97706" : "#fde68a",
              background: allYears && filterStatus === "monitor" ? "#fffbeb" : "#fff",
              cursor: "pointer",
              boxShadow: allYears && filterStatus === "monitor" ? "0 0 0 2px #fcd34d" : "none"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5 text-yellow-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-yellow-600 uppercase tracking-wide font-medium", children: "Monitoring" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }, children: "click to view all" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-yellow-700", children: monitored }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Active monitoring flags · all years" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setResolvedThisMonthMode(true);
              setFilterStatus("resolved");
              setAllYears(true);
              setFilterAction("all");
              setSearch("");
            },
            className: "bg-white rounded-lg border p-4 text-left transition-all",
            style: {
              borderColor: resolvedThisMonthMode ? "#16a34a" : "#bbf7d0",
              background: resolvedThisMonthMode ? "#f0fdf4" : "#fff",
              cursor: "pointer",
              boxShadow: resolvedThisMonthMode ? "0 0 0 2px #86efac" : "none"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 uppercase tracking-wide font-medium", children: "Resolved This Month" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }, children: "click to view" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: resolvedThisMonth }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
                "Resolved in ",
                thisMonthLabel,
                " · all years"
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [
        (allYears || resolvedThisMonthMode) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 8,
          background: resolvedThisMonthMode ? "#f0fdf4" : filterStatus === "open" ? "#fff1f1" : "#fffbeb",
          border: `1px solid ${resolvedThisMonthMode ? "#86efac" : filterStatus === "open" ? "#fca5a5" : "#fcd34d"}`,
          fontSize: "0.8125rem",
          color: resolvedThisMonthMode ? "#15803d" : filterStatus === "open" ? "#991b1b" : "#92400e",
          fontWeight: 500,
          marginBottom: 8
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: resolvedThisMonthMode ? `🟢 Resolved in ${thisMonthLabel} — all years (${filtered.length} record${filtered.length !== 1 ? "s" : ""})` : filterStatus === "open" ? `🔴 Showing all years — Open Actions (${filtered.length} records)` : `🟡 Showing all years — Monitoring (${filtered.length} records)` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setAllYears(false);
                setFilterStatus("all");
                setResolvedThisMonthMode(false);
              },
              style: { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "inherit", padding: "0 2px", lineHeight: 1 },
              title: "Clear — return to crop year view",
              children: "✕ Clear"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-48", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search by field or inspector...",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                className: "pl-9"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterField, onValueChange: setFilterField, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All fields" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-64 overflow-y-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All fields" }),
              registeredFields.map((name) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, name))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: (v) => {
            setFilterStatus(v);
            setAllYears(false);
            setResolvedThisMonthMode(false);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open actions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monitor", children: "Monitoring" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "resolved", children: "Resolved" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: (y) => {
            setCropYear(y);
            setAllYears(false);
            setResolvedThisMonthMode(false);
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterAction, onValueChange: setFilterAction, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Action" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All actions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgent", children: "Urgent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "treat", children: "Treat" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monitor", children: "Monitor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No action" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-gray-400 text-sm", children: "Loading inspections…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-8 h-8 text-gray-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "No inspections found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-xs", children: "Field inspections logged from the mobile app will appear here" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Crop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Observations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Inspector" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            id: `inspection-row-${r.id}`,
            className: `border-b border-gray-50 transition-colors ${highlightId === r.id ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300" : "hover:bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-gray-900", children: r.fieldName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: fmt(r.inspectionDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.cropType || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600 max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2", children: r.pestDiseaseObservations || "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBadge, { action: r.actionRequired, resolved: r.isResolved }),
                !r.isResolved && (inspectionTaskMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 w-fit", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-2.5 h-2.5" }),
                  inspectionTaskMap[r.id],
                  " task",
                  inspectionTaskMap[r.id] !== 1 ? "s" : ""
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.inspector || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "w-4 h-4" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => {
                    setDetailRecord(r);
                    setResolveOpen(false);
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5 mr-2" }),
                    "View details"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => openEditInspection(r), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-2" }),
                    "Edit"
                  ] }),
                  !r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent" || r.actionRequired === "monitor") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { className: "text-indigo-700 focus:text-indigo-700", onClick: () => setRaiseTaskRecord(r), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5 mr-2" }),
                      "Raise Task"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { className: "text-green-700 focus:text-green-700", onClick: () => openResolve(r), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-3.5 h-3.5 mr-2" }),
                      "Mark as Resolved"
                    ] })
                  ] })
                ] })
              ] }) })
            ]
          },
          r.id
        )) })
      ] }) })
    ] }),
    detailRecord && !resolveOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDetailRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-5 h-5 text-green-600" }),
        "Field Inspection — ",
        detailRecord.fieldName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(detailRecord.inspectionDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Inspector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: detailRecord.inspector || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Crop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: detailRecord.cropType || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Growth Stage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: detailRecord.growthStage || "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Observations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: detailRecord.pestDiseaseObservations || "None recorded" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Recommended Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: detailRecord.recommendedAction || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBadge, { action: detailRecord.actionRequired, resolved: detailRecord.isResolved })
        ] }),
        detailRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium uppercase mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: detailRecord.notes })
        ] }),
        detailRecord.isResolved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-md p-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-green-700 uppercase tracking-wide", children: "Resolution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: detailRecord.resolutionNotes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            "Resolved by ",
            detailRecord.resolvedBy || "—",
            " on ",
            fmt(detailRecord.resolvedAt)
          ] })
        ] })
      ] }),
      farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(InspectionPhotoPanel, { recordId: detailRecord.id, farmId, photos: detailRecord.photos ?? [] }),
      !detailRecord.isResolved && (inspectionTaskMap[detailRecord.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-3 py-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          inspectionTaskMap[detailRecord.id],
          " task",
          inspectionTaskMap[detailRecord.id] !== 1 ? "s" : "",
          " already raised — visible on the Task Board."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        !detailRecord.isResolved && (detailRecord.actionRequired === "treat" || detailRecord.actionRequired === "urgent" || detailRecord.actionRequired === "monitor") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "text-indigo-700 border-indigo-300 hover:bg-indigo-50", onClick: () => {
            setRaiseTaskRecord(detailRecord);
            setDetailRecord(null);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5 mr-1" }),
            "Raise Task"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "text-green-700 border-green-300 hover:bg-green-50", onClick: () => {
            setResolveOpen(true);
          }, children: "Mark as Resolved" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEditInspection(detailRecord);
          setDetailRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setDetailRecord(null), children: "Close" })
      ] })
    ] }) }),
    detailRecord && resolveOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setResolveOpen(false);
        setDetailRecord(null);
        resolveMutation.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-green-600" }),
        "Resolve Action — ",
        detailRecord.fieldName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium mb-0.5", children: [
            "Action: ",
            ACTION_LABELS[detailRecord.actionRequired]
          ] }),
          detailRecord.pestDiseaseObservations && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: detailRecord.pestDiseaseObservations })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "resolvedBy", children: "Resolved by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "resolvedBy",
              placeholder: "Your name",
              value: resolvedBy,
              onChange: (e) => setResolvedBy(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "resolutionNotes", children: "Resolution notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "resolutionNotes",
              placeholder: "Describe what action was taken to resolve this issue…",
              rows: 4,
              value: resolutionNotes,
              onChange: (e) => setResolutionNotes(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: resolveMutation, message: "Failed to resolve — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => {
          setResolveOpen(false);
          setDetailRecord(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "bg-green-700 hover:bg-green-800 text-white",
            disabled: !resolvedBy || resolveMutation.isPending,
            onClick: () => resolveMutation.mutate(detailRecord.id),
            children: resolveMutation.isPending ? "Saving…" : "Mark Resolved"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) {
        closeInspectionForm();
        createInspMut.reset();
        updateInspMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 640 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Inspection" : "Log Field Inspection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Field Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            registeredFields.length > 0 && !fieldNameIsCustom ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.fieldName || "__none__",
                onValueChange: (v) => {
                  if (v === "__custom__") {
                    setFieldNameIsCustom(true);
                    setForm((f) => ({ ...f, fieldName: "" }));
                  } else {
                    setForm((f) => ({ ...f, fieldName: v === "__none__" ? "" : v }));
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select field —" }),
                    registeredFields.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "✏ Enter manually…" })
                  ] })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g. North Field",
                  value: form.fieldName,
                  onChange: (e) => setForm((f) => ({ ...f, fieldName: e.target.value }))
                }
              ),
              registeredFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "px-2 text-xs text-gray-400 hover:text-gray-600 shrink-0", onClick: () => {
                setFieldNameIsCustom(false);
                setForm((f) => ({ ...f, fieldName: "" }));
              }, children: "↩" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Inspection Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.inspectionDate, onChange: (e) => setForm((f) => ({ ...f, inspectionDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-2", children: [
              "Crop",
              cropAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 leading-none", children: "Auto-filled" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.cropType || "__none__", onValueChange: (v) => {
              setForm((f) => ({ ...f, cropType: v === "__none__" ? "" : v, growthStage: "" }));
              setCropAutoFilled(false);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                UK_CROP_TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Growth Stage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.growthStage || "__none__",
                onValueChange: (v) => setForm((f) => ({ ...f, growthStage: v === "__none__" ? "" : v })),
                disabled: !form.cropType,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: form.cropType ? "Select stage…" : "Select crop first" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                    (form.cropType ? GROWTH_STAGES_BY_GROUP[getCropGroup(form.cropType)] : []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pest / Disease Observations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, placeholder: "Describe what was observed in the field…", value: form.pestDiseaseObservations, onChange: (e) => setForm((f) => ({ ...f, pestDiseaseObservations: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Required" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.actionRequired, onValueChange: (v) => setForm((f) => ({ ...f, actionRequired: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No action" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monitor", children: "Monitor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "treat", children: "Treat" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgent", children: "Urgent" })
              ] })
            ] }),
            canRaiseTask && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-indigo-600 mt-1", children: 'Use "Save & Raise Task" to assign this to a staff member with SMS notification.' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.inspector || "", onValueChange: (v) => setForm((f) => ({ ...f, inspector: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select inspector…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: staff.filter((s) => s.isActive).map((s) => {
                const name = `${s.firstName} ${s.lastName}`.trim();
                return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, s.id);
              }) })
            ] })
          ] })
        ] }),
        form.actionRequired !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recommended Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Apply fungicide within 48 hours", value: form.recommendedAction, onChange: (e) => setForm((f) => ({ ...f, recommendedAction: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Additional notes…", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createInspMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateInspMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeInspectionForm, children: "Cancel" }),
        !editRecord && canRaiseTask && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            className: "text-indigo-700 border-indigo-300 hover:bg-indigo-50",
            onClick: submitAndRaiseTask,
            disabled: !form.fieldName || !form.inspectionDate || createInspMut.isPending,
            children: createInspMut.isPending && raiseAfterSave.current ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
              "Saving…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5 mr-1.5" }),
              "Save & Raise Task"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submitInspectionForm, disabled: !form.fieldName || !form.inspectionDate || createInspMut.isPending || updateInspMut.isPending, children: createInspMut.isPending || updateInspMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Log Inspection" })
      ] })
    ] }) }),
    raiseTaskRecord && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        inspection: raiseTaskRecord,
        farmId,
        staff,
        onClose: () => setRaiseTaskRecord(null),
        onRaised: () => {
          qc.invalidateQueries({ queryKey: ["task-assignments", farmId] });
          qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
        }
      }
    )
  ] });
}
export {
  FieldInspectionsPage as default
};
