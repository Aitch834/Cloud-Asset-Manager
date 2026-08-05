import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, O as useMutation, j as jsxRuntimeExports, d as Button, S as Plus, I as Input, T as FlaskConical, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label } from "./index-CkP_Oc2o.js";
import { u as usePersistedTab } from "./use-persisted-tab-EEfhnjQH.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout, e as ChartColumn } from "./AppLayout-HiHvFWr1.js";
import { T as Textarea } from "./textarea-BzFXpDfb.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BQ1WeCvu.js";
import { B as Badge } from "./badge-C8ed02xt.js";
import { T as TriangleAlert } from "./triangle-alert-CIwd_1Ic.js";
import { C as CircleCheck } from "./circle-check-Bg0F-2ns.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip, L as Legend, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-ChjA81wG.js";
import { P as PieChart, a as Pie } from "./PieChart-DPTkghFV.js";
import { B as BarChart } from "./BarChart-CHMq6Kab.js";
import "./use-safe-clerk-Qr1ICzw7.js";
import "./trash-2-C5pdHoV1.js";
import "./database-C8r3P08X.js";
import "./shield-alert-CEHNisAj.js";
import "./shield-check-muoYVWRe.js";
import "./tractor-C02uPuMv.js";
import "./index-C0fxCdmX.js";
import "./index-CiLyLwn1.js";
import "./chevron-up-BVf9ftQB.js";
const EMPTY = {
  testDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  sampleType: "boot_swab",
  samplingMethod: "self_sampled",
  result: "pending",
  notificationSentToApha: false,
  movementRestrictions: false
};
const RESULT_BADGE = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  negative: { label: "Negative", className: "bg-green-100 text-green-800" },
  positive: { label: "POSITIVE", className: "bg-red-100 text-red-800 font-bold" },
  inconclusive: { label: "Inconclusive", className: "bg-orange-100 text-orange-800" }
};
const PIE_COLOURS = {
  Negative: "#22c55e",
  Pending: "#eab308",
  Positive: "#ef4444",
  Inconclusive: "#f97316"
};
function PoultryNCPPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab({ page: "poultry-ncp", farmId, validIds: ["records", "analytics"], defaultTab: "records" });
  const [search, setSearch] = reactExports.useState("");
  const [resultFilter, setResultFilter] = reactExports.useState("all");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const testsQ = useQuery({
    queryKey: ["farms", farmId, "poultry-ncp-tests"],
    queryFn: () => api.get(`/farms/${farmId}/poultry-ncp-tests`).then((r) => r.tests ?? []),
    enabled: !!farmId
  });
  const flocksQ = useQuery({
    queryKey: ["farms", farmId, "poultry-flocks"],
    queryFn: () => api.get(`/farms/${farmId}/poultry-flocks`).then((r) => r.flocks ?? []),
    enabled: !!farmId
  });
  const saveMut = useMutation({
    mutationFn: (body) => editing ? api.put(`/farms/${farmId}/poultry-ncp-tests/${editing.id}`, body) : api.post(`/farms/${farmId}/poultry-ncp-tests`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "poultry-ncp-tests"] });
      toast({ title: editing ? "NCP test updated" : "NCP test saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const tests = testsQ.data ?? [];
  const flocks = flocksQ.data ?? [];
  const filtered = tests.filter((t) => resultFilter === "all" || t.result === resultFilter).filter((t) => !search || (t.flockRef ?? "").toLowerCase().includes(search.toLowerCase()) || (t.sampleRef ?? "").toLowerCase().includes(search.toLowerCase()) || t.testDate.includes(search));
  const positives = tests.filter((t) => t.result === "positive");
  const pending = tests.filter((t) => t.result === "pending");
  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ ...t });
    setOpen(true);
  };
  const f = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const resultDistrib = ["negative", "positive", "inconclusive", "pending"].map((r) => ({
    name: r.charAt(0).toUpperCase() + r.slice(1),
    value: tests.filter((t) => t.result === r).length
  })).filter((d) => d.value > 0);
  const monthlyTests = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return {
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      tests: tests.filter((t) => t.testDate.slice(5, 7) === m).length,
      positives: tests.filter((t) => t.testDate.slice(5, 7) === m && t.result === "positive").length
    };
  });
  const positiveRate = tests.filter((t) => t.result !== "pending").length > 0 ? (positives.length / tests.filter((t) => t.result !== "pending").length * 100).toFixed(1) : "0.0";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Poultry NCP Salmonella Testing", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NCP (National Control Programme)" }),
      " — Mandatory Salmonella surveillance required under EU/UK Regulation (EC) No 2160/2003. Positive ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "S. Enteritidis" }),
      " or ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "S. Typhimurium" }),
      " results must be notified to APHA."
    ] }),
    positives.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-red-800 font-semibold text-sm mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
        positives.length,
        " Positive Result",
        positives.length > 1 ? "s" : "",
        " — APHA Notification Required"
      ] }),
      positives.filter((t) => !t.notificationSentToApha).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-red-700", children: [
        t.testDate,
        " — ",
        t.serotypeIsolated ?? "Serotype TBC",
        " — ",
        t.notificationSentToApha ? "APHA notified" : "⚠️ APHA NOT yet notified"
      ] }, t.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: tab === "records" ? "default" : "outline", onClick: () => setTab("records"), children: "Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: tab === "analytics" ? "default" : "outline", onClick: () => setTab("analytics"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1" }),
          "Analytics"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add NCP Test"
      ] })
    ] }),
    tab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search flock, sample ref, date…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
        ["all", "negative", "positive", "pending", "inconclusive"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: resultFilter === r ? "default" : "outline", onClick: () => setResultFilter(r), children: r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1) }, r))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [
        { label: "Total Tests", value: tests.length },
        { label: "Pending", value: pending.length, amber: pending.length > 0 },
        { label: "Positives", value: positives.length, red: positives.length > 0, green: positives.length === 0 }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-bold ${s.red ? "text-red-600" : s.amber ? "text-amber-600" : s.green ? "text-green-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] }, i)) }),
      testsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No NCP test records found. Record your first Salmonella test." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.sort((a, b) => b.testDate.localeCompare(a.testDate)).map((t) => {
        const rb = RESULT_BADGE[t.result] ?? RESULT_BADGE.pending;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${t.result === "positive" ? "border-red-300" : ""}`, onClick: () => openEdit(t), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: t.testDate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${rb.className}`, children: rb.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground capitalize", children: t.sampleType.replace(/_/g, " ") }),
            t.result === "positive" && !t.notificationSentToApha && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-red-200 text-red-900", children: "APHA not notified" }),
            t.movementRestrictions && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-red-100 text-red-800", children: "Restricted" }),
            t.result === "negative" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 text-green-600" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-x-3", children: [
            t.flockRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Flock/House: ",
              t.flockRef
            ] }),
            t.sampleRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Sample: ",
              t.sampleRef
            ] }),
            t.laboratoryName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Lab: ",
              t.laboratoryName
            ] }),
            t.serotypeIsolated && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-700 font-medium", children: [
              "Serotype: ",
              t.serotypeIsolated
            ] }),
            t.nextTestDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-700", children: [
              "Next: ",
              t.nextTestDueDate
            ] })
          ] })
        ] }, t.id);
      }) })
    ] }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { label: "Total Tests", value: tests.length },
        { label: "Negative", value: tests.filter((t) => t.result === "negative").length, green: true },
        { label: "Positive", value: positives.length, red: positives.length > 0, green: positives.length === 0 },
        { label: "Positive Rate", value: `${positiveRate}%`, red: parseFloat(positiveRate) > 0 }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white border rounded-lg p-4 text-center ${s.red && parseFloat(String(s.value)) > 0 ? "border-red-300" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${s.red && (positives.length > 0 || parseFloat(positiveRate) > 0) ? "text-red-600" : s.green ? "text-green-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] }, i)) }),
      tests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "mx-auto mb-2 w-8 h-8 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Add NCP test records to see analytics." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        resultDistrib.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Result Distribution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: resultDistrib, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 65, label: (d) => d.name, children: resultDistrib.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLOURS[d.name] ?? "#9ca3af" }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Monthly Testing Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthlyTests, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "tests", fill: "#3b82f6", radius: [4, 4, 0, 0], name: "Tests" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "positives", fill: "#ef4444", radius: [4, 4, 0, 0], name: "Positives" })
          ] }) })
        ] })
      ] }),
      positives.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-3 text-red-700", children: "Positive Result History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: positives.sort((a, b) => b.testDate.localeCompare(a.testDate)).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs border border-red-200 rounded p-2 bg-red-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t.testDate }),
            t.flockRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "Flock: ",
              t.flockRef
            ] }),
            t.serotypeIsolated && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700 font-medium", children: t.serotypeIsolated })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${t.notificationSentToApha ? "bg-green-100 text-green-800" : "bg-red-200 text-red-900"}`, children: t.notificationSentToApha ? "APHA notified" : "APHA not notified" })
        ] }, t.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) {
        setEditing(null);
        setForm(EMPTY);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit NCP Test" : "Add NCP Salmonella Test" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        saveMut.mutate({ ...form, notificationSentToApha: Boolean(form.notificationSentToApha), movementRestrictions: Boolean(form.movementRestrictions) });
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate ?? "", onChange: (e) => f("testDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sample Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sampleType ?? "boot_swab", onValueChange: (v) => f("sampleType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "boot_swab", children: "Boot Swab" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "environmental", children: "Environmental Swab" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "blood", children: "Blood Sample" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "neck_skin", children: "Neck Skin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "caecal", children: "Caecal (post-mortem)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sampling Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.samplingMethod ?? "self_sampled", onValueChange: (v) => f("samplingMethod", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "self_sampled", children: "Self-sampled" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "official", children: "Official (APHA)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.result ?? "pending", onValueChange: (v) => f("result", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inconclusive", children: "Inconclusive" })
              ] })
            ] })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock/House Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.flockRef ?? "", onChange: (e) => f("flockRef", e.target.value), placeholder: "e.g. House 3 / Flock A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Laboratory Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.laboratoryName ?? "", onChange: (e) => f("laboratoryName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sample Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sampleRef ?? "", onChange: (e) => f("sampleRef", e.target.value) })
          ] }),
          form.result === "positive" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serotype Isolated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serotypeIsolated ?? "", onChange: (e) => f("serotypeIsolated", e.target.value), placeholder: "e.g. S. Enteritidis, S. Typhimurium DT104" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDueDate ?? "", onChange: (e) => f("nextTestDueDate", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4", children: [
          { id: "apha", field: "notificationSentToApha", label: "APHA notified of positive result" },
          { id: "restrict", field: "movementRestrictions", label: "Movement restrictions imposed" }
        ].map((cb) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: cb.id, checked: Boolean(form[cb.field]), onChange: (e) => f(cb.field, e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: cb.id, children: cb.label })
        ] }, cb.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.actionsTaken ?? "", onChange: (e) => f("actionsTaken", e.target.value), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => f("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? "Saving…" : "Save Test" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  PoultryNCPPage as default
};
