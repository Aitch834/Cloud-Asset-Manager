import { b as useAppStore, t as useQueryClient, a as useToast, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, I as Input, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label } from "./index-Cn4HYx_z.js";
import { a as api } from "./api-Bry3C6Hl.js";
import { A as AppLayout, T as TrendingUp } from "./AppLayout-GpX30yUm.js";
import { T as Textarea } from "./textarea-Dmg2yAfL.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DDDb12Ac.js";
import { B as Badge } from "./badge-B5V3LIPW.js";
import { B as Baby } from "./baby-DRbhEG27.js";
import { P as Printer } from "./printer-DLZd-Sf0.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-8VmfM7aP.js";
import { B as BarChart } from "./BarChart-C4lWZTuO.js";
import { P as PieChart, a as Pie } from "./PieChart-Bf4ADp-5.js";
import "./use-safe-clerk-BkhPzJ2I.js";
import "./trash-2-CqxjnahN.js";
import "./database-T-MkLoL9.js";
import "./shield-alert-BDjwjwRf.js";
import "./triangle-alert-CqiLO-Fz.js";
import "./shield-check-D0TASrTF.js";
import "./tractor-DjxVUV5U.js";
import "./index-BaKpWAM-.js";
import "./index-CMqCgCYi.js";
import "./chevron-up-BPmj-fat.js";
const EMPTY = {
  lambingDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  numberOfLambs: 1,
  assistanceRequired: false,
  colostrumGiven: true,
  fostered: false,
  mortalityCount: 0
};
const EASE_LABELS = ["", "1 — Unassisted", "2 — Easy Pull", "3 — Hard Pull", "4 — Assisted (repel)", "5 — Vet / C-section"];
const EASE_COLOURS = ["", "#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];
const PIE_COLOURS = ["#3b82f6", "#ec4899", "#8b5cf6"];
function LambingRecordsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = reactExports.useState("records");
  const [search, setSearch] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const recordsQ = useQuery({
    queryKey: ["farms", farmId, "lambing-records"],
    queryFn: () => api.get(`/farms/${farmId}/lambing-records`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const flocksQ = useQuery({
    queryKey: ["farms", farmId, "sheep-flocks"],
    queryFn: () => api.get(`/farms/${farmId}/sheep-flocks`).then((r) => r.flocks ?? []),
    enabled: !!farmId
  });
  const saveMut = useMutation({
    mutationFn: (body) => editing ? api.put(`/farms/${farmId}/lambing-records/${editing.id}`, body) : api.post(`/farms/${farmId}/lambing-records`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "lambing-records"] });
      toast({ title: editing ? "Lambing record updated" : "Lambing record saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const records = recordsQ.data ?? [];
  const flocks = flocksQ.data ?? [];
  const filtered = records.filter(
    (r) => !search || (r.eweEarTag ?? "").toLowerCase().includes(search.toLowerCase()) || r.lambingDate.includes(search)
  );
  const totalLambs = records.reduce((s, r) => s + r.numberOfLambs, 0);
  const totalMortalities = records.reduce((s, r) => s + r.mortalityCount, 0);
  const assisted = records.filter((r) => r.assistanceRequired).length;
  const survivalRate = totalLambs > 0 ? Math.round((totalLambs - totalMortalities) / totalLambs * 100) : null;
  const easeData = [1, 2, 3, 4, 5].map((e) => ({
    ease: EASE_LABELS[e],
    count: records.filter((r) => r.lambingEase === e).length,
    fill: EASE_COLOURS[e]
  })).filter((d) => d.count > 0);
  const sexData = [
    { name: "All Male", value: records.filter((r) => r.sexOfLambs === "all_male").length },
    { name: "All Female", value: records.filter((r) => r.sexOfLambs === "all_female").length },
    { name: "Mixed", value: records.filter((r) => r.sexOfLambs === "mixed").length }
  ].filter((d) => d.value > 0);
  const lambsPerEwe = [1, 2, 3, 4].map((n) => ({
    lambs: `${n} lamb${n > 1 ? "s" : ""}`,
    count: records.filter((r) => r.numberOfLambs === n).length
  })).filter((d) => d.count > 0);
  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  };
  const f = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const handleSubmit = (e) => {
    e.preventDefault();
    saveMut.mutate({
      ...form,
      numberOfLambs: Number(form.numberOfLambs ?? 1),
      mortalityCount: Number(form.mortalityCount ?? 0),
      lambingEase: form.lambingEase ? Number(form.lambingEase) : null,
      eweAgeYears: form.eweAgeYears ? Number(form.eweAgeYears) : null,
      assistanceRequired: Boolean(form.assistanceRequired),
      colostrumGiven: Boolean(form.colostrumGiven),
      fostered: Boolean(form.fostered)
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Lambing Records", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex gap-2", children: ["records", "analytics"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: tab === t ? "default" : "outline", size: "sm", onClick: () => setTab(t), children: t === "records" ? "Records" : "Analytics" }, t)) }),
    tab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by ewe tag, date…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Record Lambing"
        ] })
      ] }),
      recordsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Baby, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No lambing records found. Start recording this season's lambings." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.sort((a, b) => b.lambingDate.localeCompare(a.lambingDate)).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-3 flex items-start justify-between gap-3 cursor-pointer hover:shadow-sm transition-shadow", onClick: () => openEdit(r), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: r.lambingDate }),
            r.eweEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Ewe: ",
              r.eweEarTag
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-100 text-green-800 text-xs", children: [
              r.numberOfLambs,
              " lamb",
              r.numberOfLambs > 1 ? "s" : ""
            ] }),
            r.lambingEase && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { backgroundColor: EASE_COLOURS[r.lambingEase] + "20", color: EASE_COLOURS[r.lambingEase] }, children: [
              "Ease ",
              r.lambingEase
            ] }),
            r.mortalityCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-red-100 text-red-800 text-xs", children: [
              r.mortalityCount,
              " dead"
            ] }),
            r.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-orange-100 text-orange-800 text-xs", children: "Assisted" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-x-2", children: [
            r.sexOfLambs && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.sexOfLambs.replace(/_/g, " ") }),
            r.birthWeightsKg && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Weights: ",
              r.birthWeightsKg,
              " kg"
            ] }),
            r.fostered && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Fostered" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
          e.stopPropagation();
          window.print();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
      ] }, r.id)) })
    ] }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { label: "Total Lambings", value: records.length },
        { label: "Total Lambs", value: totalLambs },
        { label: "Mortalities", value: totalMortalities, red: totalMortalities > 0 },
        { label: "Survival Rate", value: survivalRate != null ? `${survivalRate}%` : "—", green: survivalRate != null && survivalRate >= 90 }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${s.red ? "text-red-600" : s.green ? "text-green-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        easeData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4" }),
            "Lambing Ease Distribution"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: easeData, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "ease", tick: { fontSize: 9 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", radius: [4, 4, 0, 0], children: easeData.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: d.fill }, i)) })
          ] }) })
        ] }),
        sexData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Sex of Lambs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: sexData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 60, label: (d) => d.name, children: sexData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLOURS[i % PIE_COLOURS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
          ] }) })
        ] }),
        lambsPerEwe.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Litter Size Distribution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 140, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: lambsPerEwe, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "lambs", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#22c55e", radius: [4, 4, 0, 0] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-2", children: "Season Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Assisted deliveries: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              assisted,
              " (",
              records.length > 0 ? Math.round(assisted / records.length * 100) : 0,
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Avg lambs/ewe: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: records.length > 0 ? (totalLambs / records.length).toFixed(2) : "—" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) {
        setEditing(null);
        setForm(EMPTY);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Lambing Record" : "Record Lambing" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lambing Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lambingDate ?? "", onChange: (e) => f("lambingDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.flockId?.toString() ?? "", onValueChange: (v) => f("flockId", v ? Number(v) : null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select flock…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "No specific flock" }),
                flocks.map((fl) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(fl.id), children: fl.flockName }, fl.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe Ear Tag" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweEarTag ?? "", onChange: (e) => f("eweEarTag", e.target.value), placeholder: "e.g. UK123456 000123" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe Age (years)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "20", value: form.eweAgeYears ?? "", onChange: (e) => f("eweAgeYears", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe BCS (body condition score)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "1", max: "5", value: form.eweBcs ?? "", onChange: (e) => f("eweBcs", e.target.value), placeholder: "1.0–5.0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Lambs Born *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "6", value: form.numberOfLambs ?? 1, onChange: (e) => f("numberOfLambs", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lambing Ease" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.lambingEase?.toString() ?? "", onValueChange: (v) => f("lambingEase", v ? Number(v) : null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(e), children: EASE_LABELS[e] }, e)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex of Lambs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sexOfLambs ?? "", onValueChange: (v) => f("sexOfLambs", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all_male", children: "All Male" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all_female", children: "All Female" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mixed", children: "Mixed" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lamb Ear Tags" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.lambEarTags ?? "", onChange: (e) => f("lambEarTags", e.target.value), placeholder: "Comma-separated tags" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Weights (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.birthWeightsKg ?? "", onChange: (e) => f("birthWeightsKg", e.target.value), placeholder: "e.g. 4.2,3.8" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mortalities" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.mortalityCount ?? 0, onChange: (e) => f("mortalityCount", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4", children: [
          { id: "assist", field: "assistanceRequired", label: "Assistance Required" },
          { id: "colostrum", field: "colostrumGiven", label: "Colostrum Given" },
          { id: "foster", field: "fostered", label: "Fostered" }
        ].map((cb) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: cb.id, checked: Boolean(form[cb.field]), onChange: (e) => f(cb.field, e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: cb.id, children: cb.label })
        ] }, cb.id)) }),
        form.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assistance Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assistanceType ?? "", onChange: (e) => f("assistanceType", e.target.value), placeholder: "e.g. Rope pull, repel, vet" })
        ] }),
        form.fostered && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Foster Ewe Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fosterEweTag ?? "", onChange: (e) => f("fosterEweTag", e.target.value) })
        ] }),
        Number(form.mortalityCount) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mortality Reasons" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.mortalityReasons ?? "", onChange: (e) => f("mortalityReasons", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => f("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? "Saving…" : "Save Record" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  LambingRecordsPage as default
};
