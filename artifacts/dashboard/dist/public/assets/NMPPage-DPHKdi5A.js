import { b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, A as ArrowRight, p as Link, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-LXPEs_eP.js";
import { p as printProReport } from "./print-report-DB1ygEK5.js";
import { A as AppLayout, I as Info } from "./AppLayout-D8w7b3b6.js";
import { T as Textarea } from "./textarea-GiBrF2NL.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BFdOvATK.js";
import { B as Badge } from "./badge-C8BUUDdp.js";
import { L as Leaf } from "./triangle-alert-skIbspia.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-C9k4yS84.js";
import { C as ChevronRight } from "./tractor-CzRvfg4v.js";
import { P as Printer } from "./printer-K9cR5RkI.js";
import { P as Pencil } from "./pencil-CpMaG9K6.js";
import { E as ExternalLink } from "./external-link-BVtOyoYa.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-DOISIwU8.js";
import { B as BarChart } from "./BarChart-C-DpuZk3.js";
import { C as CartesianGrid } from "./CartesianGrid-C9nEg9PX.js";
import "./use-safe-clerk-D9pj8SIE.js";
import "./database-Cvp24-rR.js";
import "./shield-alert-CArGQDWe.js";
import "./shield-check-DorjTB4x.js";
import "./index-BdbRFk4T.js";
import "./index-B1JzmWuj.js";
import "./chevron-up-DIkiMB7h.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const MANURE_TYPES = ["Cattle FYM", "Pig Slurry", "Cattle Slurry", "Poultry Manure", "Digestate", "Compost", "Sewage Sludge", "Green Waste Compost", "None"];
const APP_METHODS = ["Injected", "Band spread", "Broadcast (surface)", "Trailing shoe", "Dribble bar", "Foliar application"];
const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);
function NMPPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedPlanId, setExpandedPlanId] = reactExports.useState(null);
  const [addPlanOpen, setAddPlanOpen] = reactExports.useState(false);
  const [addEntryPlanId, setAddEntryPlanId] = reactExports.useState(null);
  const [deletePlanId, setDeletePlanId] = reactExports.useState(null);
  const [printPlan, setPrintPlan] = reactExports.useState(null);
  const [entryCountByPlan, setEntryCountByPlan] = reactExports.useState({});
  const { data: farmDetailData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const currentFarm = farmDetailData?.record;
  const plansQ = useQuery({
    queryKey: ["nmp-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const entriesQ = useQuery({
    queryKey: ["nmp-entries", farmId, expandedPlanId],
    queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans/${expandedPlanId}/field-entries`).then((r) => r.json()),
    enabled: !!farmId && !!expandedPlanId,
    select: (d) => d.entries ?? []
  });
  reactExports.useEffect(() => {
    const data = entriesQ.data ?? [];
    if (expandedPlanId) setEntryCountByPlan((prev) => ({ ...prev, [expandedPlanId]: data.length }));
  }, [entriesQ.data, expandedPlanId]);
  const plans = plansQ.data ?? [];
  const fields = fieldsQ.data ?? [];
  const entries = entriesQ.data ?? [];
  const emptyPlan = { planYear: String(CURRENT_YEAR), preparedBy: "", approvedBy: "", approvedDate: "", notes: "" };
  const [planForm, setPlanForm] = reactExports.useState(emptyPlan);
  const emptyEntry = { fieldId: "", cropType: "", nitrogenKgHa: "", phosphorusKgHa: "", potassiumKgHa: "", organicManureType: "", organicManureRate: "", applicationMethod: "", timingNotes: "" };
  const [entryForm, setEntryForm] = reactExports.useState(emptyEntry);
  const [editEntry, setEditEntry] = reactExports.useState(null);
  const [editEntryForm, setEditEntryForm] = reactExports.useState(emptyEntry);
  const createPlanMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/nmp-plans`, {
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
      toast({ title: "Plan created — now add your field entries below" });
      qc.invalidateQueries({ queryKey: ["nmp-plans", farmId] });
      setAddPlanOpen(false);
      setPlanForm(emptyPlan);
      const newId = data.record?.id;
      if (newId) {
        setExpandedPlanId(newId);
        setTimeout(() => {
          setAddEntryPlanId(newId);
          setEntryForm(emptyEntry);
        }, 300);
      }
    },
    onError: () => toast({ title: "Failed to create plan", variant: "destructive" })
  });
  const deletePlanMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/nmp-plans/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: (_data, id) => {
      toast({ title: "Plan deleted" });
      qc.invalidateQueries({ queryKey: ["nmp-plans", farmId] });
      setDeletePlanId(null);
      if (expandedPlanId === id) setExpandedPlanId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const createEntryMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/nmp-plans/${addEntryPlanId}/field-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Field entry added" });
      qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, addEntryPlanId] });
      setAddEntryPlanId(null);
      setEntryForm(emptyEntry);
    },
    onError: () => toast({ title: "Failed to add entry", variant: "destructive" })
  });
  const deleteEntryMut = useMutation({
    mutationFn: ({ entryId }) => fetch(`/api/farms/${farmId}/nmp-plans/${expandedPlanId}/field-entries/${entryId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Entry removed" });
      qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, expandedPlanId] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const updateEntryMut = useMutation({
    mutationFn: ({ entryId, planId, body }) => fetch(`/api/farms/${farmId}/nmp-plans/${planId}/field-entries/${entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Field entry updated" });
      qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, expandedPlanId] });
      setEditEntry(null);
    },
    onError: () => toast({ title: "Failed to update entry", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Nutrient Management Plans", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.875rem 1.125rem", marginBottom: "1.25rem", display: "flex", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, color: "#16a34a", style: { flexShrink: 0, marginTop: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.875rem", color: "#166534", lineHeight: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How NMP works:" }),
        " Create one plan per growing year — this is your farm-level NMP document (who prepared it, when it was approved). Then add a ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "field entry" }),
        " for each field, recording the planned N, P and K nutrient budgets and any organic manure applications. Required under the Nitrates Action Programme and Red Tractor Crop Inputs standard."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 18, color: "#166534" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600, color: "#111827" }, children: [
          plans.length,
          " plan",
          plans.length !== 1 ? "s" : "",
          " on record"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setPlanForm(emptyPlan);
        setAddPlanOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "New NMP"
      ] })
    ] }),
    plansQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : plans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f0fdf4", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 28, color: "#16a34a" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No nutrient management plans yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af", maxWidth: 440, marginBottom: "1.25rem" }, children: "Start by creating a plan for the current growing year. You'll then add individual nutrient budgets for each of your fields within that plan." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", fontSize: "0.82rem", color: "#6b7280" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "#e5e7eb", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }, children: "Step 1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Create the annual plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "#e5e7eb", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }, children: "Step 2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add a field entry for each field" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddPlanOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Create First NMP"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: plans.map((plan) => {
      const isExpanded = expandedPlanId === plan.id;
      const entryCount = entryCountByPlan[plan.id];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: { padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
            onClick: () => setExpandedPlanId(isExpanded ? null : plan.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, fontSize: "1rem", color: "#111827" }, children: [
                  plan.planYear,
                  " Nutrient Management Plan"
                ] }),
                plan.approvedDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#dcfce7", color: "#166534", border: "none", fontSize: "0.72rem" }, children: [
                  "Approved ",
                  fmt(plan.approvedDate)
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem" }, children: "Pending Approval" }),
                entryCount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: entryCount === 0 ? "#fef2f2" : "#f0fdf4", color: entryCount === 0 ? "#991b1b" : "#166534", border: "none", fontSize: "0.72rem" }, children: [
                  entryCount,
                  " field",
                  entryCount !== 1 ? "s" : "",
                  " entered"
                ] }),
                plan.preparedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
                  "Prepared by: ",
                  plan.preparedBy
                ] }),
                plan.approvedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
                  "Approved by: ",
                  plan.approvedBy
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setPrintPlan(plan), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 13 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    onClick: () => {
                      setAddEntryPlanId(plan.id);
                      setExpandedPlanId(plan.id);
                      setEntryForm(emptyEntry);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
                      "Add Field"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setDeletePlanId(plan.id),
                    style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 },
                    title: "Delete plan",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                  }
                )
              ] })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", padding: "1rem 1.25rem" }, children: [
          plan.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem", background: "#f9fafb", borderRadius: 6, padding: "0.5rem 0.75rem" }, children: plan.notes }),
          entriesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Loading field entries..." }) : entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "2px dashed #d1fae5", background: "#f0fdf4", borderRadius: 8, padding: "1.5rem", textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 22, color: "#16a34a", style: { margin: "0 auto 0.5rem" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#166534", marginBottom: 4 }, children: "No field entries yet for this plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280", marginBottom: "1rem", maxWidth: 380, margin: "0 auto 1rem" }, children: "Add a nutrient budget for each field — select the field, then enter N, P and K values (kg/ha) and any organic manure application details." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: () => {
                  setAddEntryPlanId(plan.id);
                  setEntryForm(emptyEntry);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
                  "Add First Field Entry"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Field", "Crop", "N (kg/ha)", "P (kg/ha)", "K (kg/ha)", "Organic Manure", "Rate (t/ha)", "Method", "Timing Notes", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: entries.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < entries.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 600, color: "#1e40af" }, children: e.fieldName || `Field #${e.fieldId}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#374151", fontWeight: 500 }, children: e.cropType || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: e.nitrogenKgHa ? /* @__PURE__ */ jsxRuntimeExports.jsx(NutrientBadge, { val: e.nitrogenKgHa, color: "#1d4ed8", bg: "#dbeafe", letter: "N" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: e.phosphorusKgHa ? /* @__PURE__ */ jsxRuntimeExports.jsx(NutrientBadge, { val: e.phosphorusKgHa, color: "#7c3aed", bg: "#ede9fe", letter: "P" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: e.potassiumKgHa ? /* @__PURE__ */ jsxRuntimeExports.jsx(NutrientBadge, { val: e.potassiumKgHa, color: "#b45309", bg: "#fef3c7", letter: "K" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#374151" }, children: e.organicManureType || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "None" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: e.organicManureRate ? `${e.organicManureRate}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: e.applicationMethod || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280", minWidth: 160, maxWidth: 260 }, children: e.timingNotes || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.375rem", whiteSpace: "nowrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2, alignItems: "center" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => {
                        setEditEntry({ ...e, planId: expandedPlanId });
                        setEditEntryForm({
                          fieldId: e.fieldId ? String(e.fieldId) : "",
                          cropType: e.cropType ?? "",
                          nitrogenKgHa: e.nitrogenKgHa ?? "",
                          phosphorusKgHa: e.phosphorusKgHa ?? "",
                          potassiumKgHa: e.potassiumKgHa ?? "",
                          organicManureType: e.organicManureType ?? "",
                          organicManureRate: e.organicManureRate ?? "",
                          applicationMethod: e.applicationMethod ?? "",
                          timingNotes: e.timingNotes ?? ""
                        });
                      },
                      style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 },
                      title: "Edit field entry",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: `/sprays?field=${encodeURIComponent(e.fieldName ?? e.fieldId ?? "")}`, style: { display: "flex", alignItems: "center", color: "#9ca3af", padding: 4 }, title: "View spray applications for this field", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 13 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => deleteEntryMut.mutate({ entryId: e.id }),
                      style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 },
                      title: "Remove field entry",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
                    }
                  )
                ] }) })
              ] }, e.id)) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => {
                  setAddEntryPlanId(plan.id);
                  setEntryForm(emptyEntry);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
                  "Add Another Field"
                ]
              }
            ) }),
            entries.some((e) => e.nitrogenKgHa || e.phosphorusKgHa || e.potassiumKgHa) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "1.25rem", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }, children: "N/P/K Budget by Field (kg/ha)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(180, entries.length * 44), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                BarChart,
                {
                  data: entries.map((e) => ({
                    field: e.fieldName || `Field #${e.fieldId}`,
                    N: parseFloat(String(e.nitrogenKgHa || 0)),
                    P: parseFloat(String(e.phosphorusKgHa || 0)),
                    K: parseFloat(String(e.potassiumKgHa || 0))
                  })),
                  layout: "vertical",
                  margin: { top: 4, right: 16, left: 0, bottom: 4 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", horizontal: false }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, unit: " kg/ha" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "field", tick: { fontSize: 11 }, width: 120 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} kg/ha`, ""] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "N", fill: "#1d4ed8", name: "Nitrogen (N)", radius: [0, 2, 2, 0] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "P", fill: "#7c3aed", name: "Phosphorus (P)", radius: [0, 2, 2, 0] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "K", fill: "#b45309", name: "Potassium (K)", radius: [0, 2, 2, 0] })
                  ]
                }
              ) })
            ] })
          ] })
        ] })
      ] }, plan.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addPlanOpen, onOpenChange: (o) => {
      setAddPlanOpen(o);
      if (!o) {
        setPlanForm(emptyPlan);
        createPlanMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create Nutrient Management Plan" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.82rem", color: "#166534", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 14, style: { flexShrink: 0, marginTop: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "This creates the annual plan document. After saving, you'll add a separate nutrient budget for each field." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Plan Year ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: planForm.planYear, onValueChange: (v) => setPlanForm((f) => ({ ...f, planYear: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prepared By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name or FACTS adviser", value: planForm.preparedBy, onChange: (e) => setPlanForm((f) => ({ ...f, preparedBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approved By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Farm manager or agronomist", value: planForm.approvedBy, onChange: (e) => setPlanForm((f) => ({ ...f, approvedBy: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: planForm.approvedDate, onChange: (e) => setPlanForm((f) => ({ ...f, approvedDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "e.g. Based on FACTS-qualified analysis, SNS index 2 for all fields",
              value: planForm.notes,
              onChange: (e) => setPlanForm((f) => ({ ...f, notes: e.target.value })),
              rows: 2
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createPlanMut, message: "Failed to create plan — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddPlanOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => createPlanMut.mutate(planForm),
            disabled: !planForm.planYear || createPlanMut.isPending,
            children: "Create Plan & Add Fields"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addEntryPlanId !== null, onOpenChange: (o) => {
      if (!o) {
        setAddEntryPlanId(null);
        createEntryMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Field Nutrient Budget" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#6b7280", marginBottom: 4 }, children: "Select the field and enter the planned nutrient applications. Repeat for each field in your NMP." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Field ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: entryForm.fieldId, onValueChange: (v) => setEntryForm((f) => ({ ...f, fieldId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a field..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: fields.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", disabled: true, children: "No fields registered — add fields in Fields & Crops first" }) : fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(f.id), children: [
              f.name,
              f.fieldReference ? ` — ${f.fieldReference}` : "",
              f.areaHa ? ` (${f.areaHa} ha)` : ""
            ] }, f.id)) })
          ] }),
          fields.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#f59e0b", marginTop: 4 }, children: "You need to register fields in Fields & Crops before adding NMP field entries." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Crop / Enterprise ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#9ca3af", fontWeight: 400 }, children: "(recommended)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. Winter Wheat, Oil Seed Rape, Spring Barley",
              value: entryForm.cropType,
              onChange: (e) => setEntryForm((f) => ({ ...f, cropType: e.target.value }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 3 }, children: "If the same field has more than one crop (e.g. catch crop rotation), add a separate entry per crop." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#374151" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Planned nutrient applications" }),
          " — enter the target kg/ha for each nutrient. Leave blank if not applicable."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nitrogen N (kg/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0", value: entryForm.nitrogenKgHa, onChange: (e) => setEntryForm((f) => ({ ...f, nitrogenKgHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phosphorus P (kg/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0", value: entryForm.phosphorusKgHa, onChange: (e) => setEntryForm((f) => ({ ...f, phosphorusKgHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Potassium K (kg/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0", value: entryForm.potassiumKgHa, onChange: (e) => setEntryForm((f) => ({ ...f, potassiumKgHa: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Manure Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: entryForm.organicManureType, onValueChange: (v) => setEntryForm((f) => ({ ...f, organicManureType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MANURE_TYPES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manure Rate (t/ha or m³/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: entryForm.organicManureRate, onChange: (e) => setEntryForm((f) => ({ ...f, organicManureRate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: entryForm.applicationMethod, onValueChange: (v) => setEntryForm((f) => ({ ...f, applicationMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: APP_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Timing Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "e.g. Apply pre-drilling September, avoid waterlogged conditions",
              value: entryForm.timingNotes,
              onChange: (e) => setEntryForm((f) => ({ ...f, timingNotes: e.target.value })),
              rows: 2
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createEntryMut, message: "Failed to add field entry — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddEntryPlanId(null), children: "Done" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => createEntryMut.mutate(entryForm),
            disabled: !entryForm.fieldId || createEntryMut.isPending,
            children: "Save & Add Another Field"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deletePlanId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeletePlanId(null);
        deletePlanMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete NMP" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will permanently delete the plan and all its field entries. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deletePlanMut, message: "Failed to delete the plan." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeletePlanId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            onClick: () => deletePlanId !== null && deletePlanMut.mutate(deletePlanId),
            disabled: deletePlanMut.isPending,
            children: "Delete Plan"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editEntry, onOpenChange: (o) => {
      if (!o) {
        setEditEntry(null);
        updateEntryMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Field Nutrient Budget" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#6b7280", marginBottom: 4 }, children: [
        "Update the planned nutrient applications for ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: editEntry?.fieldName || "this field" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editEntryForm.fieldId, onValueChange: (v) => setEditEntryForm((f) => ({ ...f, fieldId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a field..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(f.id), children: [
              f.name,
              f.fieldReference ? ` — ${f.fieldReference}` : "",
              f.areaHa ? ` (${f.areaHa} ha)` : ""
            ] }, f.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop / Enterprise" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Winter Wheat, Oil Seed Rape", value: editEntryForm.cropType, onChange: (e) => setEditEntryForm((f) => ({ ...f, cropType: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#374151" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Planned nutrient applications" }),
          " — kg/ha targets"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nitrogen N (kg/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0", value: editEntryForm.nitrogenKgHa, onChange: (e) => setEditEntryForm((f) => ({ ...f, nitrogenKgHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phosphorus P (kg/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0", value: editEntryForm.phosphorusKgHa, onChange: (e) => setEditEntryForm((f) => ({ ...f, phosphorusKgHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Potassium K (kg/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0", value: editEntryForm.potassiumKgHa, onChange: (e) => setEditEntryForm((f) => ({ ...f, potassiumKgHa: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Manure Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editEntryForm.organicManureType || "__none__", onValueChange: (v) => setEditEntryForm((f) => ({ ...f, organicManureType: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
                MANURE_TYPES.filter((m) => m !== "None").map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manure Rate (t/ha or m³/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 25", value: editEntryForm.organicManureRate, onChange: (e) => setEditEntryForm((f) => ({ ...f, organicManureRate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editEntryForm.applicationMethod || "__none__", onValueChange: (v) => setEditEntryForm((f) => ({ ...f, applicationMethod: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
              APP_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Timing Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "e.g. Apply pre-drilling September, avoid waterlogged conditions",
              value: editEntryForm.timingNotes,
              onChange: (e) => setEditEntryForm((f) => ({ ...f, timingNotes: e.target.value })),
              rows: 3
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateEntryMut, message: "Failed to update the entry — your changes are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditEntry(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => updateEntryMut.mutate({ entryId: editEntry.id, planId: editEntry.planId, body: editEntryForm }),
            disabled: !editEntryForm.fieldId || updateEntryMut.isPending,
            children: updateEntryMut.isPending ? "Saving…" : "Save Changes"
          }
        )
      ] })
    ] }) }),
    printPlan && /* @__PURE__ */ jsxRuntimeExports.jsx(PrintDialog, { plan: printPlan, farmId, farm: currentFarm, onClose: () => setPrintPlan(null) })
  ] }) });
}
function NutrientBadge({ val, color, bg, letter }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, background: bg, color, borderRadius: 5, padding: "2px 7px", fontSize: "0.78rem", fontWeight: 600 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 800 }, children: letter }),
    val
  ] });
}
function PrintDialog({ plan, farmId, farm, onClose }) {
  const entriesQ = useQuery({
    queryKey: ["nmp-entries-print", farmId, plan.id],
    queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans/${plan.id}/field-entries`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.entries ?? []
  });
  const entries = entriesQ.data ?? [];
  (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const handlePrint = () => {
    const rows = entries.map((e) => `<tr>
      <td><strong>${e.fieldName || `Field #${e.fieldId}`}</strong></td>
      <td>${e.cropType || "—"}</td>
      <td>${e.nitrogenKgHa || "—"}</td>
      <td>${e.phosphorusKgHa || "—"}</td>
      <td>${e.potassiumKgHa || "—"}</td>
      <td>${e.organicManureType || "None"}</td>
      <td>${e.organicManureRate || "—"}</td>
      <td>${e.applicationMethod || "—"}</td>
      <td>${e.timingNotes || "—"}</td>
    </tr>`).join("");
    const metaBlock = [
      `<p style="font-size:7.5px;color:#374151;margin:0 0 2px"><strong>Prepared by:</strong> ${plan.preparedBy || "—"}  &nbsp;·&nbsp;  <strong>Approved by:</strong> ${plan.approvedBy || "—"}  &nbsp;·&nbsp;  <strong>Approval date:</strong> ${plan.approvedDate ? new Date(plan.approvedDate).toLocaleDateString("en-GB") : "Pending"}</p>`,
      plan.notes ? `<p style="font-size:7.5px;color:#6b7280;margin:2px 0;font-style:italic">Notes: ${plan.notes}</p>` : ""
    ].filter(Boolean).join("");
    const tableHtml = `${metaBlock}<table><thead><tr>
      <th>Field</th><th>Crop</th><th>N (kg/ha)</th><th>P (kg/ha)</th><th>K (kg/ha)</th>
      <th>Organic Manure</th><th>Rate</th><th>Method</th><th>Timing Notes</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: `Nutrient Management Plan — ${plan.planYear}`,
      subtitle: "RB209 Fertiliser Recommendations",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      redTractorId: farm?.redTractorId ?? void 0,
      recordCount: entries.length,
      recordLabel: "field entry",
      tableHtml
    });
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Print NMP — ",
      plan.planYear
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: entriesQ.isLoading ? "Loading field entries..." : `${entries.length} field ${entries.length !== 1 ? "entries" : "entry"} will be included.` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, disabled: entriesQ.isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
        "Print / Export PDF"
      ] })
    ] })
  ] }) });
}
export {
  NMPPage as default
};
