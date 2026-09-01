import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, j as jsxRuntimeExports, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, S as useMutation } from "./index-Bdz-TS7R.js";
import { u as usePersistedTab } from "./use-persisted-tab-BOgUBEqM.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout } from "./AppLayout-Ct4ymMi8.js";
import { T as Textarea } from "./textarea-CWGuMwZX.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BUdWqYxr.js";
import { B as Badge } from "./badge-C4fZBoDh.js";
import { a as useRawFarmName } from "./use-farm-name-DPvi34TU.js";
import { a as printRecordReport } from "./record-report-CtL9yOgX.js";
import { T as TriangleAlert } from "./triangle-alert-Dq_DYYf-.js";
import { P as Printer } from "./printer-D_TK8DSO.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar } from "./generateCategoricalChart-B8tUTNUS.js";
import { B as BarChart } from "./BarChart-DW5WFkPx.js";
import "./use-safe-clerk-CMbvd5bz.js";
import "./trash-2-CW3F-HGL.js";
import "./database-D_T9FUvp.js";
import "./shield-alert-DxgsdyUf.js";
import "./shield-check-T3euHTYu.js";
import "./tractor-DoXCgdS2.js";
import "./index-Owkc222z.js";
import "./index-BOOxMXNz.js";
import "./chevron-up-Bq5orbWQ.js";
import "./print-report-ClU8-1P0.js";
const EMPTY_APIARY = { species: "honeybee", numberOfHives: 1, isActive: true };
const EMPTY_INSPECTION = { inspectionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notificationSentToApha: false };
const EMPTY_HONEY = { harvestDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), sold: false };
function BeekeepingPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const rawFarmName = useRawFarmName(farmId ?? 0);
  const [tab, setTab] = usePersistedTab({ page: "beekeeping", farmId, validIds: ["apiaries", "inspections", "honey", "analytics"], defaultTab: "apiaries" });
  const [apiaryId, setApiaryId] = reactExports.useState(null);
  const [apiaryOpen, setApiaryOpen] = reactExports.useState(false);
  const [inspOpen, setInspOpen] = reactExports.useState(false);
  const [honeyOpen, setHoneyOpen] = reactExports.useState(false);
  const [editApiary, setEditApiary] = reactExports.useState(null);
  const [editInsp, setEditInsp] = reactExports.useState(null);
  const [editHoney, setEditHoney] = reactExports.useState(null);
  const [apiaryForm, setApiaryForm] = reactExports.useState(EMPTY_APIARY);
  const [inspForm, setInspForm] = reactExports.useState(EMPTY_INSPECTION);
  const [honeyForm, setHoneyForm] = reactExports.useState(EMPTY_HONEY);
  const apiariesQ = useQuery({
    queryKey: ["farms", farmId, "apiaries"],
    queryFn: () => api.get(`/farms/${farmId}/apiaries`).then((r) => r.apiaries ?? []),
    enabled: !!farmId
  });
  const inspsQ = useQuery({
    queryKey: ["farms", farmId, "apiary-inspections"],
    queryFn: () => api.get(`/farms/${farmId}/apiary-inspections`).then((r) => r.inspections ?? []),
    enabled: !!farmId
  });
  const honeyQ = useQuery({
    queryKey: ["farms", farmId, "apiary-honey"],
    queryFn: () => api.get(`/farms/${farmId}/apiary-honey`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const saveMut = (endpoint, editing, onSuccess) => useMutation({
    mutationFn: (body) => editing ? api.put(`/farms/${farmId}/${endpoint}/${editing.id}`, body) : api.post(`/farms/${farmId}/${endpoint}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId] });
      toast({ title: "Saved" });
      onSuccess();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const apiarySave = saveMut("apiaries", editApiary, () => {
    setApiaryOpen(false);
    setEditApiary(null);
    setApiaryForm(EMPTY_APIARY);
  });
  const inspSave = saveMut("apiary-inspections", editInsp, () => {
    setInspOpen(false);
    setEditInsp(null);
    setInspForm(EMPTY_INSPECTION);
  });
  const honeySave = saveMut("apiary-honey", editHoney, () => {
    setHoneyOpen(false);
    setEditHoney(null);
    setHoneyForm(EMPTY_HONEY);
  });
  const apiaries = apiariesQ.data ?? [];
  const inspections = inspsQ.data ?? [];
  const honeyRecords = honeyQ.data ?? [];
  const filteredInsps = apiaryId ? inspections.filter((i) => i.apiaryId === apiaryId) : inspections;
  const filteredHoney = apiaryId ? honeyRecords.filter((r) => r.apiaryId === apiaryId) : honeyRecords;
  const totalHives = apiaries.filter((a) => a.isActive).reduce((s, a) => s + a.numberOfHives, 0);
  const totalHoneyKg = honeyRecords.reduce((s, r) => s + parseFloat(r.quantityKg), 0);
  const diseasePositive = inspections.filter((i) => i.diseaseSigns && i.diseaseSigns !== "none" && !i.diseaseSigns.includes("none")).length;
  const monthlyHoney = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return { month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i], kg: honeyRecords.filter((r) => r.harvestDate.slice(5, 7) === m).reduce((s, r) => s + parseFloat(r.quantityKg), 0) };
  });
  const fa = (field, val) => setApiaryForm((p) => ({ ...p, [field]: val }));
  const fi = (field, val) => setInspForm((p) => ({ ...p, [field]: val }));
  const fh = (field, val) => setHoneyForm((p) => ({ ...p, [field]: val }));
  const getApiaryName = (id) => apiaries.find((a) => a.id === id)?.apiaryName ?? `Apiary ${id}`;
  const printInspection = (inspection) => printRecordReport({
    title: "Hive Inspection Record",
    farmName: rawFarmName,
    authority: inspection.notificationSentToApha ? "APHA" : void 0,
    authorityReferenceLabel: inspection.notificationSentToApha ? "BeeBase registration" : void 0,
    authorityReference: inspection.notificationSentToApha ? apiaries.find((a) => a.id === inspection.apiaryId)?.beebaseRegistration : void 0,
    subtitle: `${getApiaryName(inspection.apiaryId)}${inspection.hiveRef ? ` — Hive ${inspection.hiveRef}` : ""}`,
    record: { ...inspection, apiaryName: getApiaryName(inspection.apiaryId) }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Beekeeping", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex gap-2 flex-wrap", children: [
      ["apiaries", "inspections", "honey", "analytics"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: tab === t ? "default" : "outline", size: "sm", onClick: () => setTab(t), children: t === "apiaries" ? "Apiaries" : t === "inspections" ? "Inspections" : t === "honey" ? "Honey Harvest" : "Analytics" }, t)),
      tab !== "apiaries" && apiaries.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: apiaryId?.toString() ?? "", onValueChange: (v) => setApiaryId(v ? Number(v) : null), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All apiaries" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "All apiaries" }),
          apiaries.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.apiaryName }, a.id))
        ] })
      ] })
    ] }),
    tab === "apiaries" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditApiary(null);
        setApiaryForm(EMPTY_APIARY);
        setApiaryOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Apiary"
      ] }) }),
      apiaries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-5xl mb-2 block", children: "🍯" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No apiaries registered. Add your first apiary." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: apiaries.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${!a.isActive ? "opacity-60" : ""}`, onClick: () => {
        setEditApiary(a);
        setApiaryForm({ ...a });
        setApiaryOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: a.apiaryName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: a.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600", children: a.isActive ? "Active" : "Inactive" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
          a.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Location: ",
            a.location
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Hives: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: a.numberOfHives }),
            " · Species: ",
            a.species
          ] }),
          a.beebaseRegistration && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "BeeBase: ",
            a.beebaseRegistration
          ] })
        ] })
      ] }, a.id)) })
    ] }),
    tab === "inspections" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditInsp(null);
        setInspForm({ ...EMPTY_INSPECTION, apiaryId: apiaryId ?? (apiaries[0]?.id ?? null) });
        setInspOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Inspection"
      ] }) }),
      filteredInsps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No inspections recorded yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredInsps.sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate)).map((i) => {
        const diseased = i.diseaseSigns && i.diseaseSigns !== "none" && !i.diseaseSigns.includes("none");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${diseased ? "border-amber-300" : ""}`, onClick: () => {
          setEditInsp(i);
          setInspForm({ ...i });
          setInspOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: i.inspectionDate }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                getApiaryName(i.apiaryId),
                i.hiveRef ? ` — Hive ${i.hiveRef}` : ""
              ] }),
              i.queenSeen && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-purple-100 text-purple-800", children: "Queen seen" }),
              diseased && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs bg-amber-100 text-amber-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3 mr-1 inline" }),
                i.diseaseSigns
              ] }),
              i.notificationSentToApha && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-blue-100 text-blue-800", children: "APHA notified" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
              e.stopPropagation();
              printInspection(i);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-x-3", children: [
            i.inspectedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "By: ",
              i.inspectedBy
            ] }),
            i.broodPattern && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Brood: ",
              i.broodPattern
            ] }),
            i.estimatedColonySize && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Colony: ",
              i.estimatedColonySize
            ] }),
            i.varroaWashCount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Varroa: ",
              i.varroaWashCount,
              "/100"
            ] }),
            i.nextInspectionDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-700", children: [
              "Next: ",
              i.nextInspectionDue
            ] })
          ] })
        ] }, i.id);
      }) })
    ] }),
    tab === "honey" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Total harvested: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            totalHoneyKg.toFixed(1),
            " kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditHoney(null);
          setHoneyForm({ ...EMPTY_HONEY, apiaryId: apiaryId ?? (apiaries[0]?.id ?? null) });
          setHoneyOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Record Harvest"
        ] })
      ] }),
      filteredHoney.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No honey harvest records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredHoney.sort((a, b) => b.harvestDate.localeCompare(a.harvestDate)).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow", onClick: () => {
        setEditHoney(r);
        setHoneyForm({ ...r });
        setHoneyOpen(true);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.harvestDate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: getApiaryName(r.apiaryId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-yellow-100 text-yellow-800", children: [
            r.quantityKg,
            " kg"
          ] }),
          r.sold && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800", children: "Sold" }),
          r.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "Lot: ",
            r.lotNumber
          ] })
        ] }),
        r.moisturePercent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
          "Moisture: ",
          r.moisturePercent,
          "%"
        ] })
      ] }) }, r.id)) })
    ] }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { label: "Active Apiaries", value: apiaries.filter((a) => a.isActive).length },
        { label: "Total Hives", value: totalHives },
        { label: "Total Honey (kg)", value: totalHoneyKg.toFixed(1) },
        { label: "Disease Observations", value: diseasePositive, amber: diseasePositive > 0 }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${s.amber ? "text-amber-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] }, i)) }),
      monthlyHoney.some((m) => m.kg > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Monthly Honey Harvest (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthlyHoney, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${Number(v).toFixed(1)} kg`] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "kg", fill: "#eab308", radius: [4, 4, 0, 0] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: apiaryOpen, onOpenChange: (o) => {
      setApiaryOpen(o);
      if (!o) {
        setEditApiary(null);
        setApiaryForm(EMPTY_APIARY);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editApiary ? "Edit Apiary" : "Add Apiary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        apiarySave.mutate({ ...apiaryForm, numberOfHives: Number(apiaryForm.numberOfHives ?? 1), isActive: Boolean(apiaryForm.isActive) });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Apiary Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: apiaryForm.apiaryName ?? "", onChange: (e) => fa("apiaryName", e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: apiaryForm.location ?? "", onChange: (e) => fa("location", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Hives" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: apiaryForm.numberOfHives ?? 1, onChange: (e) => fa("numberOfHives", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: apiaryForm.species ?? "honeybee", onValueChange: (v) => fa("species", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "honeybee", children: "Honeybee" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bumblebee", children: "Bumblebee" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BeeBase Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: apiaryForm.beebaseRegistration ?? "", onChange: (e) => fa("beebaseRegistration", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "actv", checked: Boolean(apiaryForm.isActive), onChange: (e) => fa("isActive", e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "actv", children: "Active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: apiaryForm.notes ?? "", onChange: (e) => fa("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setApiaryOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: apiarySave.isPending, children: apiarySave.isPending ? "Saving…" : "Save Apiary" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: inspOpen, onOpenChange: (o) => {
      setInspOpen(o);
      if (!o) {
        setEditInsp(null);
        setInspForm(EMPTY_INSPECTION);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editInsp ? "Edit Inspection" : "Add Hive Inspection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        inspSave.mutate({ ...inspForm, apiaryId: Number(inspForm.apiaryId), varroaWashCount: inspForm.varroaWashCount ? Number(inspForm.varroaWashCount) : null, supersOnHive: inspForm.supersOnHive ? Number(inspForm.supersOnHive) : null, queenCellCount: inspForm.queenCellCount ? Number(inspForm.queenCellCount) : null, queenSeen: Boolean(inspForm.queenSeen), queenCells: Boolean(inspForm.queenCells), storesAdequate: inspForm.storesAdequate != null ? Boolean(inspForm.storesAdequate) : null, notificationSentToApha: Boolean(inspForm.notificationSentToApha) });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Apiary *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm.apiaryId?.toString() ?? "", onValueChange: (v) => fi("apiaryId", Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select apiary…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: apiaries.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.apiaryName }, a.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hive Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inspForm.hiveRef ?? "", onChange: (e) => fi("hiveRef", e.target.value), placeholder: "e.g. Hive 3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: inspForm.inspectionDate ?? "", onChange: (e) => fi("inspectionDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspected By *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inspForm.inspectedBy ?? "", onChange: (e) => fi("inspectedBy", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Brood Pattern" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm.broodPattern ?? "", onValueChange: (v) => fi("broodPattern", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["excellent", "good", "fair", "poor"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v.charAt(0).toUpperCase() + v.slice(1) }, v)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colony Size" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm.estimatedColonySize ?? "", onValueChange: (v) => fi("estimatedColonySize", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["strong", "medium", "weak"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v.charAt(0).toUpperCase() + v.slice(1) }, v)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temper" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspForm.temper ?? "", onValueChange: (v) => fi("temper", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["calm", "normal", "defensive"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v.charAt(0).toUpperCase() + v.slice(1) }, v)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Varroa Wash Count (/100)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: inspForm.varroaWashCount ?? "", onChange: (e) => fi("varroaWashCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supers on Hive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: inspForm.supersOnHive ?? "", onChange: (e) => fi("supersOnHive", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disease Signs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inspForm.diseaseSigns ?? "", onChange: (e) => fi("diseaseSigns", e.target.value), placeholder: "e.g. varroa, none" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Inspection Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: inspForm.nextInspectionDue ?? "", onChange: (e) => fi("nextInspectionDue", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4", children: [{ id: "qs", f: "queenSeen", l: "Queen seen" }, { id: "qc", f: "queenCells", l: "Queen cells present" }, { id: "sa", f: "storesAdequate", l: "Stores adequate" }, { id: "apha", f: "notificationSentToApha", l: "APHA notified (AFB/EFB)" }].map((cb) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: cb.id, checked: Boolean(inspForm[cb.f]), onChange: (e) => fi(cb.f, e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: cb.id, children: cb.l })
        ] }, cb.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: inspForm.actionsTaken ?? "", onChange: (e) => fi("actionsTaken", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Applied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inspForm.treatmentApplied ?? "", onChange: (e) => fi("treatmentApplied", e.target.value), placeholder: "e.g. Apiguard, OA treatment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: inspForm.notes ?? "", onChange: (e) => fi("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setInspOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: inspSave.isPending, children: inspSave.isPending ? "Saving…" : "Save Inspection" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: honeyOpen, onOpenChange: (o) => {
      setHoneyOpen(o);
      if (!o) {
        setEditHoney(null);
        setHoneyForm(EMPTY_HONEY);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editHoney ? "Edit Harvest Record" : "Record Honey Harvest" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        honeySave.mutate({ ...honeyForm, apiaryId: Number(honeyForm.apiaryId), sold: Boolean(honeyForm.sold) });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Apiary *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: honeyForm.apiaryId?.toString() ?? "", onValueChange: (v) => fh("apiaryId", Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select apiary…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: apiaries.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.apiaryName }, a.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: honeyForm.harvestDate ?? "", onChange: (e) => fh("harvestDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: honeyForm.quantityKg ?? "", onChange: (e) => fh("quantityKg", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: honeyForm.lotNumber ?? "", onChange: (e) => fh("lotNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", max: "25", value: honeyForm.moisturePercent ?? "", onChange: (e) => fh("moisturePercent", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "sold", checked: Boolean(honeyForm.sold), onChange: (e) => fh("sold", e.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sold", children: "Sold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: honeyForm.notes ?? "", onChange: (e) => fh("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setHoneyOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: honeySave.isPending, children: honeySave.isPending ? "Saving…" : "Save Record" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  BeekeepingPage as default
};
