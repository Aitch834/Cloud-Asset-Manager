import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, O as useMutation, j as jsxRuntimeExports, d as Button, I as Input, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label } from "./index-DX6E55cF.js";
import { u as usePersistedTab } from "./use-persisted-tab-91q_b0z-.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout, i as TestTube } from "./AppLayout-D0Q7F_A3.js";
import { T as Textarea } from "./textarea-CM5VZbXN.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select--CPFaZiO.js";
import { B as Badge } from "./badge-DN9nlpDC.js";
import { P as Printer } from "./printer-B1KvOQ4C.js";
import { C as CircleCheck } from "./circle-check-BJdkAffO.js";
import { T as TriangleAlert } from "./triangle-alert-Db-PHg84.js";
import { a as Clock } from "./database-B5gWgHfK.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-37Iyw6pK.js";
import { B as BarChart } from "./BarChart-2Zw7vGuv.js";
import "./use-safe-clerk-CM8568bY.js";
import "./trash-2-D9eXD5d8.js";
import "./shield-alert-BZBVsiR-.js";
import "./shield-check-Dzeo_f6v.js";
import "./tractor-CPfgjVan.js";
import "./index-CsuW_qoO.js";
import "./index-v9370g5_.js";
import "./chevron-up-OuAfCSiT.js";
const EMPTY = {
  testDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  testType: "routine_skin",
  species: "cattle",
  outcome: "pending",
  reactors: 0,
  inconclusives: 0,
  movementRestriction: false
};
const OUTCOME_BADGE = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  clear: { label: "Clear", className: "bg-green-100 text-green-800" },
  reactor: { label: "Reactor", className: "bg-red-100 text-red-800" },
  inconclusive: { label: "Inconclusive", className: "bg-orange-100 text-orange-800" },
  withdrawn: { label: "Withdrawn", className: "bg-gray-100 text-gray-700" }
};
function TBTestingPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab({ page: "tb-testing", farmId, validIds: ["records", "restrictions", "analytics"], defaultTab: "records" });
  const [search, setSearch] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const testsQ = useQuery({
    queryKey: ["farms", farmId, "tb-tests"],
    queryFn: () => api.get(`/farms/${farmId}/tb-tests`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const herdsQ = useQuery({
    queryKey: ["farms", farmId, "herds"],
    queryFn: () => api.get(`/farms/${farmId}/herds`).then((r) => r.herds ?? []),
    enabled: !!farmId
  });
  const saveMut = useMutation({
    mutationFn: (body) => editing ? api.put(`/farms/${farmId}/tb-tests/${editing.id}`, body) : api.post(`/farms/${farmId}/tb-tests`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "tb-tests"] });
      toast({ title: editing ? "TB test updated" : "TB test saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const tests = testsQ.data ?? [];
  herdsQ.data ?? [];
  const filtered = tests.filter(
    (t) => !search || (t.testingVet ?? "").toLowerCase().includes(search.toLowerCase()) || (t.aphaCaseRef ?? "").toLowerCase().includes(search.toLowerCase()) || (t.herdFlockRef ?? "").toLowerCase().includes(search.toLowerCase()) || t.testDate.includes(search)
  );
  const restricted = tests.filter((t) => t.movementRestriction && !t.restrictionLiftedDate);
  const totalReactors = tests.reduce((s, t) => s + (t.reactors ?? 0), 0);
  const lastTest = [...tests].sort((a, b) => b.testDate.localeCompare(a.testDate))[0];
  const analyticsData = ["clear", "reactor", "inconclusive", "pending", "withdrawn"].map((r) => ({
    result: OUTCOME_BADGE[r]?.label ?? r,
    count: tests.filter((t) => t.outcome === r).length
  })).filter((d) => d.count > 0);
  const COLOURS = { Clear: "#22c55e", Reactor: "#ef4444", Inconclusive: "#f97316", Pending: "#eab308", Withdrawn: "#9ca3af" };
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
  const handleSubmit = (e) => {
    e.preventDefault();
    saveMut.mutate({
      ...form,
      reactors: Number(form.reactors ?? 0),
      inconclusives: Number(form.inconclusives ?? 0),
      animalsTested: form.animalsTested ? Number(form.animalsTested) : null,
      movementRestriction: Boolean(form.movementRestriction)
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "TB Testing Register", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex gap-2", children: ["records", "restrictions", "analytics"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: tab === t ? "default" : "outline", size: "sm", onClick: () => setTab(t), children: t === "records" ? "Test Records" : t === "restrictions" ? `Restrictions${restricted.length ? ` (${restricted.length})` : ""}` : "Analytics" }, t)) }),
    tab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by vet, APHA ref, herd, date…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add TB Test"
        ] })
      ] }),
      testsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No TB test records found. Add your first test." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((t) => {
        const ob = OUTCOME_BADGE[t.outcome] ?? OUTCOME_BADGE.pending;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow cursor-pointer", onClick: () => openEdit(t), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: t.testDate }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-blue-100 text-blue-800 capitalize", children: t.species }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground capitalize", children: t.testType.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${ob.className}`, children: ob.label }),
              t.movementRestriction && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-red-100 text-red-800", children: "Restricted" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-x-3", children: [
              t.herdFlockRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Herd/Flock: ",
                t.herdFlockRef
              ] }),
              t.testingVet && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Vet: ",
                t.testingVet
              ] }),
              t.aphaCaseRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "APHA: ",
                t.aphaCaseRef
              ] }),
              t.animalsTested != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Tested: ",
                t.animalsTested
              ] }),
              t.reactors > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 font-medium", children: [
                "Reactors: ",
                t.reactors
              ] }),
              t.inconclusives > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-600", children: [
                "Inconclusive: ",
                t.inconclusives
              ] }),
              t.nextTestDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-700", children: [
                "Next: ",
                t.nextTestDueDate
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
            e.stopPropagation();
            window.print();
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
        ] }, t.id);
      }) })
    ] }),
    tab === "restrictions" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: restricted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mx-auto mb-2 w-10 h-10 text-green-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-green-700", children: "No active movement restrictions." })
    ] }) : restricted.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-red-800", children: [
          "Movement Restriction Active — ",
          t.species
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-red-700 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Test date: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t.testDate })
        ] }),
        t.aphaCaseRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "APHA case ref: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t.aphaCaseRef })
        ] }),
        t.herdFlockRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Herd/Flock: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t.herdFlockRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Reactors: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t.reactors }),
          " · Inconclusive: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t.inconclusives })
        ] }),
        t.testingVet && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Vet: ",
          t.testingVet
        ] }),
        t.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Notes: ",
          t.notes
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "mt-3", onClick: () => openEdit(t), children: "Update Record" })
    ] }, t.id)) }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: tests.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Tests" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${totalReactors > 0 ? "text-red-600" : "text-green-600"}`, children: totalReactors }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Reactors" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: restricted.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Active Restrictions" })
        ] }),
        lastTest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: lastTest.testDate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Last Test" }),
          lastTest.nextTestDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-blue-700 text-xs mt-1 justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
            "Next: ",
            lastTest.nextTestDueDate
          ] })
        ] })
      ] }),
      analyticsData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Outcomes Breakdown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analyticsData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "result", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", radius: [4, 4, 0, 0], children: analyticsData.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: COLOURS[d.result] ?? "#3b82f6" }, i)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) {
        setEditing(null);
        setForm(EMPTY);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit TB Test Record" : "Add TB Test Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate ?? "", onChange: (e) => f("testDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading Date (72-hour skin)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.readingDate ?? "", onChange: (e) => f("readingDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testType ?? "routine_skin", onValueChange: (v) => f("testType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "routine_skin", children: "Routine Skin Test" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pre_movement", children: "Pre-Movement" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "post_movement", children: "Post-Movement" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gamma_ifn", children: "Gamma Interferon (Blood)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "check_test", children: "Check Test" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species ?? "cattle", onValueChange: (v) => f("species", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cattle", children: "Cattle" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sheep", children: "Sheep" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "goat", children: "Goat" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "deer", children: "Deer" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome ?? "pending", onValueChange: (v) => f("outcome", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "clear", children: "Clear" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reactor", children: "Reactor Found" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inconclusive", children: "Inconclusive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockRef ?? "", onChange: (e) => f("herdFlockRef", e.target.value), placeholder: "e.g. herd number / flock mark" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Testing Vet / OV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.testingVet ?? "", onChange: (e) => f("testingVet", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Officer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.aphaOfficer ?? "", onChange: (e) => f("aphaOfficer", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Case Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.aphaCaseRef ?? "", onChange: (e) => f("aphaCaseRef", e.target.value), placeholder: "e.g. TB-2025-XXXX" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTested ?? "", onChange: (e) => f("animalsTested", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reactors Found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.reactors ?? 0, onChange: (e) => f("reactors", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inconclusive Results" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.inconclusives ?? 0, onChange: (e) => f("inconclusives", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDueDate ?? "", onChange: (e) => f("nextTestDueDate", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "movRes", checked: Boolean(form.movementRestriction), onChange: (e) => f("movementRestriction", e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "movRes", children: "Movement restriction imposed" })
        ] }),
        form.movementRestriction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restriction Lifted Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.restrictionLiftedDate ?? "", onChange: (e) => f("restrictionLiftedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => f("notes", e.target.value), rows: 3 })
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
  TBTestingPage as default
};
