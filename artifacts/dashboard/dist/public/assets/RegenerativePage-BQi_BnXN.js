import { b as useAppStore, c as useQueryClient, m as useQuery, r as reactExports, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, L as Label, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-DDOJnc-Q.js";
import { u as usePersistedTab } from "./use-persisted-tab-jjJyzP35.js";
import { A as AppLayout, S as Sprout } from "./AppLayout-Bsbkv4x9.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { T as Textarea } from "./textarea-CbeIBDDv.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-kiQ-lzAB.js";
import { C as ConfirmDialog } from "./confirm-dialog-DdUmT1oc.js";
import { B as Badge } from "./badge-EeeGmf-N.js";
import { T as TabBar, a as TabButton } from "./tab-button-D4YUeaC9.js";
import { p as printProReport } from "./print-report-ClU8-1P0.js";
import { P as Pencil } from "./pencil-ByxCKD-T.js";
import { T as Trash2 } from "./trash-2-NOl2VtfS.js";
import { P as Printer } from "./printer-DcL9iz19.js";
import "./use-safe-clerk-BpvxzUHZ.js";
import "./database-BSV48juJ.js";
import "./shield-alert-C1gd25lh.js";
import "./triangle-alert-DQfIUd3n.js";
import "./shield-check-CIN51tXa.js";
import "./tractor-CMgJrZvj.js";
import "./index-C3bulVnW.js";
import "./index-CtWuxg3F.js";
import "./chevron-up-CQ_z4M-d.js";
const PRINT_ID = "regen-evidence-pack-print";
const TAB_IDS = ["practices", "soil", "summary"];
const PRINCIPLES = [
  { value: "min_disturbance", label: "Minimise soil disturbance", hint: "No-till or reduced tillage" },
  { value: "soil_cover", label: "Keep soil covered", hint: "Cover crops, stubble, mulches — no bare ground over winter" },
  { value: "living_roots", label: "Living roots year-round", hint: "Catch/cover crops, undersowing, leys" },
  { value: "diversity", label: "Maximise diversity", hint: "Varied rotations, companion cropping, herbal leys" },
  { value: "livestock_integration", label: "Integrate livestock", hint: "Rotational/mob grazing on arable ground" },
  { value: "input_reduction", label: "Reduce synthetic inputs", hint: "Cutting fertiliser and pesticide use over time" }
];
const principleLabel = (v) => PRINCIPLES.find((p) => p.value === v)?.label ?? v;
const num = (v) => {
  const n = parseFloat(String(v ?? ""));
  return isNaN(n) ? 0 : n;
};
const fmtDate = (d) => d ? String(d).slice(0, 10) : "—";
const yearOf = (r) => r.seasonYear ?? (r.recordDate ? Number(String(r.recordDate).slice(0, 4)) : null);
function PracticeDialog({ farmId, editRow, fields, onClose }) {
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState(() => ({
    recordDate: editRow?.recordDate?.slice(0, 10) ?? "",
    seasonYear: editRow?.seasonYear != null ? String(editRow.seasonYear) : String((/* @__PURE__ */ new Date()).getFullYear()),
    fieldId: editRow?.fieldId ? String(editRow.fieldId) : "",
    fieldName: editRow?.fieldName ?? "",
    principle: editRow?.principle ?? "min_disturbance",
    practice: editRow?.practice ?? "",
    areaHectares: editRow?.areaHectares ?? "",
    details: editRow?.details ?? ""
  }));
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        recordDate: f.recordDate,
        seasonYear: f.seasonYear ? Number(f.seasonYear) : null,
        fieldId: f.fieldId ? Number(f.fieldId) : null,
        fieldName: f.fieldName || (f.fieldId ? fields.find((fd) => String(fd.id) === f.fieldId)?.name ?? null : null),
        principle: f.principle,
        practice: f.practice,
        areaHectares: f.areaHectares || null,
        details: f.details || null
      };
      return editRow ? api.put(`/farms/${farmId}/regen-practices/${editRow.id}`, payload) : api.post(`/farms/${farmId}/regen-practices`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["regen-practices", farmId] });
      onClose();
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      saveMut.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRow ? "Edit Practice Record" : "Record Regenerative Practice" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.recordDate, onChange: (e) => set("recordDate", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Season / harvest year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: f.seasonYear, onChange: (e) => set("seasonYear", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.fieldId || "none", onValueChange: (v) => set("fieldId", v === "none" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— None / whole farm —" }),
            fields.map((fd) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(fd.id), children: fd.name ?? fd.fieldName ?? `Field ${fd.id}` }, fd.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field name (if not listed)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.fieldName, onChange: (e) => set("fieldName", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Principle *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.principle, onValueChange: (v) => set("principle", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRINCIPLES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.value, children: [
            p.label,
            " — ",
            p.hint
          ] }, p.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Practice *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.practice, onChange: (e) => set("practice", e.target.value), placeholder: "e.g. No-till drilling, Cover crop — vetch/rye" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: f.areaHectares, onChange: (e) => set("areaHectares", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Details / evidence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.details, onChange: (e) => set("details", e.target.value), placeholder: "Mix, drill used, photos kept, input reduction vs last year…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        saveMut.reset();
        onClose();
      }, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending || !f.recordDate || !f.practice, children: saveMut.isPending ? "Saving…" : "Save" })
    ] })
  ] }) });
}
function SoilDialog({ farmId, editRow, fields, onClose }) {
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState(() => ({
    testDate: editRow?.testDate?.slice(0, 10) ?? "",
    fieldId: editRow?.fieldId ? String(editRow.fieldId) : "",
    fieldName: editRow?.fieldName ?? "",
    sampleDepthCm: editRow?.sampleDepthCm != null ? String(editRow.sampleDepthCm) : "",
    organicMatterPercent: editRow?.organicMatterPercent ?? "",
    wormCount: editRow?.wormCount != null ? String(editRow.wormCount) : "",
    vessScore: editRow?.vessScore != null ? String(editRow.vessScore) : "",
    infiltrationSeconds: editRow?.infiltrationSeconds != null ? String(editRow.infiltrationSeconds) : "",
    bulkDensityGCm3: editRow?.bulkDensityGCm3 ?? "",
    labName: editRow?.labName ?? "",
    notes: editRow?.notes ?? ""
  }));
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        testDate: f.testDate,
        fieldId: f.fieldId ? Number(f.fieldId) : null,
        fieldName: f.fieldName || (f.fieldId ? fields.find((fd) => String(fd.id) === f.fieldId)?.name ?? null : null),
        sampleDepthCm: f.sampleDepthCm ? Number(f.sampleDepthCm) : null,
        organicMatterPercent: f.organicMatterPercent || null,
        wormCount: f.wormCount ? Number(f.wormCount) : null,
        vessScore: f.vessScore ? Number(f.vessScore) : null,
        infiltrationSeconds: f.infiltrationSeconds ? Number(f.infiltrationSeconds) : null,
        bulkDensityGCm3: f.bulkDensityGCm3 || null,
        labName: f.labName || null,
        notes: f.notes || null
      };
      return editRow ? api.put(`/farms/${farmId}/regen-soil-indicators/${editRow.id}`, payload) : api.post(`/farms/${farmId}/regen-soil-indicators`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["regen-soil-indicators", farmId] });
      onClose();
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      saveMut.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRow ? "Edit Soil Indicators" : "Record Soil Health Indicators" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.testDate, onChange: (e) => set("testDate", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.fieldId || "none", onValueChange: (v) => set("fieldId", v === "none" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— None —" }),
            fields.map((fd) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(fd.id), children: fd.name ?? fd.fieldName ?? `Field ${fd.id}` }, fd.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field name (if not listed)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.fieldName, onChange: (e) => set("fieldName", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sample depth (cm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: f.sampleDepthCm, onChange: (e) => set("sampleDepthCm", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Soil organic matter (%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: f.organicMatterPercent, onChange: (e) => set("organicMatterPercent", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Worm count (per pit)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: f.wormCount, onChange: (e) => set("wormCount", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VESS score (1 best – 5 worst)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "5", value: f.vessScore, onChange: (e) => set("vessScore", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Infiltration (seconds)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: f.infiltrationSeconds, onChange: (e) => set("infiltrationSeconds", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bulk density (g/cm³)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: f.bulkDensityGCm3, onChange: (e) => set("bulkDensityGCm3", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab / method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.labName, onChange: (e) => set("labName", e.target.value), placeholder: "e.g. NRM, in-field spade test" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.notes, onChange: (e) => set("notes", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        saveMut.reset();
        onClose();
      }, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending || !f.testDate, children: saveMut.isPending ? "Saving…" : "Save" })
    ] })
  ] }) });
}
function RegenerativePage() {
  const { farmId: rawFarmId } = useAppStore();
  const farmId = rawFarmId;
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab({ page: "regenerative", farmId: rawFarmId, validIds: TAB_IDS, defaultTab: "practices" });
  const farmQ = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => api.get(`/farms/${farmId}`),
    enabled: !!farmId
  });
  const rawFarmName = typeof farmQ.data?.name === "string" ? farmQ.data.name : typeof farmQ.data?.farmName === "string" ? farmQ.data.farmName : void 0;
  const farmName = rawFarmName ?? `Farm ${farmId}`;
  const practicesQ = useQuery({
    queryKey: ["regen-practices", farmId],
    queryFn: () => api.get(`/farms/${farmId}/regen-practices`),
    enabled: !!farmId,
    select: (d) => Array.isArray(d?.records) ? d.records : []
  });
  const soilQ = useQuery({
    queryKey: ["regen-soil-indicators", farmId],
    queryFn: () => api.get(`/farms/${farmId}/regen-soil-indicators`),
    enabled: !!farmId,
    select: (d) => Array.isArray(d?.records) ? d.records : []
  });
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => api.get(`/farms/${farmId}/fields`),
    enabled: !!farmId,
    select: (d) => Array.isArray(d?.records) ? d.records : Array.isArray(d) ? d : [],
    staleTime: 6e4
  });
  const practices = practicesQ.data ?? [];
  const soil = soilQ.data ?? [];
  const fields = fieldsQ.data ?? [];
  const [pracDlg, setPracDlg] = reactExports.useState({ open: false });
  const [soilDlg, setSoilDlg] = reactExports.useState({ open: false });
  const [pendingDelPrac, setPendingDelPrac] = reactExports.useState(null);
  const [pendingDelSoil, setPendingDelSoil] = reactExports.useState(null);
  const delPracMut = useMutation({
    mutationFn: (id) => api.delete(`/farms/${farmId}/regen-practices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regen-practices", farmId] })
  });
  const delSoilMut = useMutation({
    mutationFn: (id) => api.delete(`/farms/${farmId}/regen-soil-indicators/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regen-soil-indicators", farmId] })
  });
  const years = reactExports.useMemo(() => {
    const ys = /* @__PURE__ */ new Set();
    practices.forEach((r) => {
      const y = yearOf(r);
      if (y) ys.add(y);
    });
    soil.forEach((r) => {
      const y = r.testDate ? Number(String(r.testDate).slice(0, 4)) : null;
      if (y) ys.add(y);
    });
    if (ys.size === 0) ys.add((/* @__PURE__ */ new Date()).getFullYear());
    return Array.from(ys).sort((a, b) => b - a);
  }, [practices, soil]);
  const [summaryYear, setSummaryYear] = reactExports.useState(null);
  const selYear = summaryYear ?? years[0];
  const summary = reactExports.useMemo(() => {
    const inYear = practices.filter((r) => yearOf(r) === selYear);
    return PRINCIPLES.map((p) => {
      const rows = inYear.filter((r) => r.principle === p.value);
      return { ...p, count: rows.length, areaHa: rows.reduce((a, r) => a + num(r.areaHectares), 0) };
    });
  }, [practices, selYear]);
  const somTrend = reactExports.useMemo(() => {
    const byYear = /* @__PURE__ */ new Map();
    soil.forEach((r) => {
      const om = num(r.organicMatterPercent);
      if (!om || !r.testDate) return;
      const y = Number(String(r.testDate).slice(0, 4));
      byYear.set(y, [...byYear.get(y) ?? [], om]);
    });
    return Array.from(byYear.entries()).sort((a, b) => a[0] - b[0]).map(([y, vals]) => ({ year: y, avg: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length }));
  }, [soil]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { size: 24, className: "text-green-600" }),
          " Regenerative Farming"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Practice records against the six regenerative principles, plus the outcome evidence buyers and verifiers ask for" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        tab === "practices" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setPracDlg({ open: true }), "data-testid": "button-add-practice", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
          "Record Practice"
        ] }),
        tab === "soil" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setSoilDlg({ open: true }), "data-testid": "button-add-soil", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
          "Record Indicators"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "practices", onClick: () => setTab("practices"), children: "Practices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "soil", onClick: () => setTab("soil"), children: "Soil Indicators" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "summary", onClick: () => setTab("summary"), children: "Summary" })
    ] }),
    tab === "practices" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border overflow-x-auto", children: practicesQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-red-600", children: "Failed to load practice records — please refresh." }) : practices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "p-6 text-sm text-gray-500", children: [
      "No practices recorded yet. Log each cover crop, no-till pass, grazing integration or input cut against one of the six principles — then use the ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Summary" }),
      " tab to review your evidence and print it as an evidence pack for verification schemes."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 text-left text-xs uppercase text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Principle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Practice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Area (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: practices.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", "data-testid": `row-practice-${r.id}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(r.recordDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.seasonYear ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.fieldName || (r.fieldId ? fields.find((fd) => fd.id === r.fieldId)?.name : null) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700", children: principleLabel(r.principle) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.practice }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.areaHectares ? num(r.areaHectares).toFixed(2) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setPracDlg({ open: true, row: r }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setPendingDelPrac(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "text-red-500" }) })
        ] })
      ] }, r.id)) })
    ] }) }),
    tab === "soil" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border overflow-x-auto", children: soilQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-red-600", children: "Failed to load soil indicators — please refresh." }) : soil.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-sm text-gray-500", children: "No soil indicators yet. Regenerative schemes are outcome-based — record organic matter %, worm counts, VESS scores and infiltration so you can show improvement over time." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 text-left text-xs uppercase text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "OM %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Worms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "VESS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Infiltration (s)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Bulk density" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Lab" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: soil.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", "data-testid": `row-soil-${r.id}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.fieldName || (r.fieldId ? fields.find((fd) => fd.id === r.fieldId)?.name : null) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.organicMatterPercent ? num(r.organicMatterPercent).toFixed(2) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.wormCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.vessScore ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.infiltrationSeconds ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.bulkDensityGCm3 ? num(r.bulkDensityGCm3).toFixed(2) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.labName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSoilDlg({ open: true, row: r }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setPendingDelSoil(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "text-red-500" }) })
        ] })
      ] }, r.id)) })
    ] }) }),
    tab === "summary" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Season year:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(selYear), onValueChange: (v) => setSummaryYear(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "ml-2", onClick: () => printProReport({
          title: "Regenerative Farming Evidence Pack",
          subtitle: `Season year: ${selYear}`,
          farmName: rawFarmName,
          farmAddress: farmQ.data?.address,
          cphNumber: farmQ.data?.cphNumber,
          sbiNumber: farmQ.data?.sbiNumber,
          recordCount: practices.filter((r) => yearOf(r) === selYear).length,
          recordLabel: "practice record",
          landscape: true,
          tableHtml: document.getElementById(PRINT_ID)?.innerHTML ?? ""
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print Evidence Pack"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: summary.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-4 ${p.count > 0 ? "bg-green-50 border-green-200" : "bg-white"}`, "data-testid": `card-principle-${p.value}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-gray-900", children: p.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: p.hint }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-baseline gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: p.count }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
            "record",
            p.count === 1 ? "" : "s",
            p.areaHa > 0 ? ` · ${p.areaHa.toFixed(1)} ha` : ""
          ] })
        ] }),
        p.count === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mt-1", children: [
          "No evidence recorded for ",
          selYear
        ] })
      ] }, p.value)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-2", children: "Soil organic matter trend (farm average)" }),
        somTrend.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "No organic matter results recorded yet — the single most-asked-for regenerative outcome measure." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left text-xs uppercase text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-8 py-1", children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-8 py-1", children: "Avg OM %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1", children: "Samples" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: somTrend.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-8 py-1.5", children: t.year }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-8 py-1.5 font-medium", children: t.avg.toFixed(2) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5", children: t.n })
          ] }, t.year)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, style: { display: "none" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 20, fontWeight: 700, margin: 0 }, children: "Regenerative Farming Evidence Pack" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: "#6b7280", margin: "4px 0 2px" }, children: farmName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 12, color: "#9ca3af", margin: 0 }, children: [
          "Season year: ",
          selYear,
          "  ·  Printed: ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
        ] })
      ] }),
      PRINCIPLES.map((p) => {
        const rows = practices.filter((r) => r.principle === p.value && yearOf(r) === selYear);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print-section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: p.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 11, color: "#6b7280", marginBottom: 6 }, children: p.hint }),
          rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 12, color: "#9ca3af", fontStyle: "italic" }, children: [
            "No records for ",
            selYear
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "print-table", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Field" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Practice" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Area (ha)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Details / evidence" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { whiteSpace: "nowrap" }, children: fmtDate(r.recordDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.fieldName || (r.fieldId ? fields.find((fd) => fd.id === r.fieldId)?.name : null) || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.practice }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.areaHectares ? parseFloat(String(r.areaHectares)).toFixed(2) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.details || "—" })
            ] }, r.id)) })
          ] })
        ] }, p.value);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print-section", style: { marginTop: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Soil Health Indicators" }),
        soil.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12, color: "#9ca3af", fontStyle: "italic" }, children: "No soil indicator records." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "print-table", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "OM %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Worm count" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "VESS score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Infiltration (s)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Bulk density" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Lab / method" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: soil.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { whiteSpace: "nowrap" }, children: fmtDate(r.testDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.fieldName || (r.fieldId ? fields.find((fd) => fd.id === r.fieldId)?.name : null) || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.organicMatterPercent ? parseFloat(String(r.organicMatterPercent)).toFixed(2) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.wormCount ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.vessScore ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.infiltrationSeconds ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.bulkDensityGCm3 ? parseFloat(String(r.bulkDensityGCm3)).toFixed(2) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.labName || "—" })
          ] }, r.id)) })
        ] })
      ] }),
      somTrend.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Soil Organic Matter Trend (farm average)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "print-table", style: { width: "auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { paddingRight: 32 }, children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { paddingRight: 32 }, children: "Avg OM %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Samples" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: somTrend.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: t.year }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { fontWeight: 600 }, children: t.avg.toFixed(2) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: t.n })
          ] }, t.year)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 11, color: "#9ca3af", marginTop: 32, borderTop: "1px solid #e5e7eb", paddingTop: 8 }, children: [
        "Generated by BDE Farm Trac · Regenerative Farming module · ",
        (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")
      ] })
    ] }),
    pracDlg.open && /* @__PURE__ */ jsxRuntimeExports.jsx(PracticeDialog, { farmId, editRow: pracDlg.row, fields, onClose: () => setPracDlg({ open: false }) }),
    soilDlg.open && /* @__PURE__ */ jsxRuntimeExports.jsx(SoilDialog, { farmId, editRow: soilDlg.row, fields, onClose: () => setSoilDlg({ open: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelPrac !== null,
        title: "Delete practice record",
        message: "Delete this regenerative practice record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delPracMut,
        onConfirm: () => {
          if (pendingDelPrac !== null) delPracMut.mutate(pendingDelPrac, { onSuccess: () => setPendingDelPrac(null) });
        },
        onCancel: () => {
          setPendingDelPrac(null);
          delPracMut.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelSoil !== null,
        title: "Delete soil indicator record",
        message: "Delete this soil indicator record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delSoilMut,
        onConfirm: () => {
          if (pendingDelSoil !== null) delSoilMut.mutate(pendingDelSoil, { onSuccess: () => setPendingDelSoil(null) });
        },
        onCancel: () => {
          setPendingDelSoil(null);
          delSoilMut.reset();
        }
      }
    )
  ] }) });
}
export {
  RegenerativePage as default
};
