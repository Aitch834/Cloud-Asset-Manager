import { b as useAppStore, t as useQueryClient, a as useToast, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input } from "./index-R4XICohc.js";
import { a as api } from "./api-Bry3C6Hl.js";
import { A as AppLayout, e as ChartColumn, q as Stethoscope } from "./AppLayout-p836YkSR.js";
import { T as Textarea } from "./textarea-COanlBw4.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-8zr33rK0.js";
import { B as Badge } from "./badge-B-nhOm9J.js";
import { a as Clock } from "./database-Dj8SDLcA.js";
import { P as Printer } from "./printer-Nl0FSCcI.js";
import { C as CalendarCheck } from "./calendar-check-bEW7MWpK.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip, L as Legend, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-BfcAnxRo.js";
import { P as PieChart, a as Pie } from "./PieChart-DMJtoqjT.js";
import { B as BarChart } from "./BarChart-C3EN7W8j.js";
import "./use-safe-clerk-9Diu1NTz.js";
import "./trash-2-CW0p5gY-.js";
import "./shield-alert-DLMzHCQQ.js";
import "./triangle-alert-DoYQtXrW.js";
import "./shield-check-CjTpMlqB.js";
import "./tractor-DsJv_0QH.js";
import "./index-BTvjRpbJ.js";
import "./index-DYWzTIYo.js";
import "./chevron-up-BUruL3pK.js";
const SPECIES = ["Cattle", "Sheep", "Pigs", "Poultry"];
const SPECIES_COLOUR = {
  Cattle: "bg-blue-100 text-blue-800",
  Sheep: "bg-green-100 text-green-800",
  Pigs: "bg-pink-100 text-pink-800",
  Poultry: "bg-yellow-100 text-yellow-800"
};
const PIE_COLOURS = ["#3b82f6", "#22c55e", "#ec4899", "#eab308"];
const EMPTY = {
  reviewDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  species: "Cattle"
};
function AHWRPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = reactExports.useState("reviews");
  const [speciesFilter, setSpeciesFilter] = reactExports.useState("all");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const recordsQ = useQuery({
    queryKey: ["farms", farmId, "ahwr-records"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-records`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const saveMut = useMutation({
    mutationFn: (body) => editing ? api.put(`/farms/${farmId}/ahwr-records/${editing.id}`, body) : api.post(`/farms/${farmId}/ahwr-records`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "ahwr-records"] });
      toast({ title: editing ? "AHWR record updated" : "AHWR record saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const records = recordsQ.data ?? [];
  const filtered = speciesFilter === "all" ? records : records.filter((r) => r.species === speciesFilter);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const overdue = records.filter((r) => r.nextReviewDue && r.nextReviewDue < today);
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
  const bySpecies = SPECIES.map((s) => ({
    species: s,
    count: records.filter((r) => r.species === s).length
  })).filter((d) => d.count > 0);
  const byYear = Array.from(new Set(records.map((r) => r.reviewDate.slice(0, 4)))).sort().map((yr) => ({
    year: yr,
    count: records.filter((r) => r.reviewDate.startsWith(yr)).length
  }));
  const upcoming = records.filter((r) => r.nextReviewDue && r.nextReviewDue >= today).sort((a, b) => a.nextReviewDue.localeCompare(b.nextReviewDue)).slice(0, 4);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Annual Health & Welfare Review (AHWR)", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AHWR" }),
      " — Annual vet health and welfare reviews are a condition of SFI/ELM payments. Records must be kept for a minimum of 5 years."
    ] }),
    overdue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-800 font-medium text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
        overdue.length,
        " review",
        overdue.length > 1 ? "s" : "",
        " overdue"
      ] }),
      overdue.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-amber-700 mt-1", children: [
        r.species,
        " — due ",
        r.nextReviewDue
      ] }, r.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: tab === "reviews" ? "default" : "outline", onClick: () => setTab("reviews"), children: "Reviews" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: tab === "analytics" ? "default" : "outline", onClick: () => setTab("analytics"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1" }),
          "Analytics"
        ] })
      ] }),
      tab === "reviews" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap items-center", children: [
        ["all", ...SPECIES].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: speciesFilter === s ? "default" : "outline", onClick: () => setSpeciesFilter(s), children: s === "all" ? "All" : s }, s)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add AHWR"
        ] })
      ] }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add AHWR"
      ] })
    ] }),
    tab === "reviews" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: recordsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "No AHWR records for ",
        speciesFilter === "all" ? "any species" : speciesFilter,
        ". Add your first review."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate)).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow", onClick: () => openEdit(r), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700", children: r.species }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: r.reviewDate }),
          r.nextReviewDue && r.nextReviewDue < today && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-800 text-xs", children: "Overdue" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
          e.stopPropagation();
          window.print();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Vet: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.vetName }),
          r.vetPractice ? ` — ${r.vetPractice}` : ""
        ] }),
        r.ahwrRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "AHWR ref: ",
          r.ahwrRef
        ] }),
        r.keyFindings && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-2", children: [
          "Findings: ",
          r.keyFindings
        ] }),
        r.nextReviewDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: r.nextReviewDue < today ? "text-amber-600 font-medium" : "text-blue-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "inline w-3 h-3 mr-1" }),
          "Next due: ",
          r.nextReviewDue
        ] })
      ] })
    ] }, r.id)) }) }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { label: "Total Reviews", value: records.length },
        { label: "Overdue", value: overdue.length, amber: overdue.length > 0 },
        { label: "Upcoming (next 90d)", value: records.filter((r) => r.nextReviewDue && r.nextReviewDue >= today && r.nextReviewDue <= new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10)).length, blue: true },
        { label: "Species Covered", value: new Set(records.map((r) => r.species)).size }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${s.amber ? "text-amber-600" : s.blue ? "text-blue-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] }, i)) }),
      records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No AHWR records yet. Add your first review to see analytics." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          bySpecies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Reviews by Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: bySpecies, dataKey: "count", nameKey: "species", cx: "50%", cy: "50%", outerRadius: 65, label: (d) => d.species, children: bySpecies.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLOURS[i % PIE_COLOURS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
            ] }) })
          ] }),
          byYear.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Annual Review Frequency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: byYear, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "year", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#3b82f6", radius: [4, 4, 0, 0], name: "Reviews" })
            ] }) })
          ] })
        ] }),
        upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "w-4 h-4 text-blue-600" }),
            "Upcoming Reviews"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: upcoming.map((r) => {
            const daysUntil = Math.ceil((new Date(r.nextReviewDue).getTime() - Date.now()) / 864e5);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm border rounded p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700", children: r.species }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "Vet: ",
                  r.vetName
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs font-medium ${daysUntil <= 30 ? "text-amber-600" : "text-blue-600"}`, children: [
                "Due ",
                r.nextReviewDue,
                " (",
                daysUntil,
                "d)"
              ] })
            ] }, r.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "SFI / ELM Compliance Overview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-xs", children: SPECIES.map((sp) => {
            const spRecords = records.filter((r) => r.species === sp);
            const latest = spRecords.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate))[0];
            const isOverdue = latest?.nextReviewDue && latest.nextReviewDue < today;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded p-3 border ${isOverdue ? "border-amber-300 bg-amber-50" : spRecords.length > 0 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-1", children: sp }),
              spRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No records" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Last: ",
                  latest.reviewDate
                ] }),
                latest.nextReviewDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: isOverdue ? "text-amber-600 font-medium" : "text-green-700", children: [
                  "Next: ",
                  latest.nextReviewDue
                ] })
              ] })
            ] }, sp);
          }) })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit AHWR Record" : "Add Annual Health & Welfare Review" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        saveMut.mutate(form);
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species ?? "Cattle", onValueChange: (v) => f("species", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.reviewDate ?? "", onChange: (e) => f("reviewDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName ?? "", onChange: (e) => f("vetName", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Practice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetPractice ?? "", onChange: (e) => f("vetPractice", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "AHWR Reference / Claim Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ahwrRef ?? "", onChange: (e) => f("ahwrRef", e.target.value), placeholder: "e.g. AHWR-2025-XXXX" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SBI Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sbiNumber ?? "", onChange: (e) => f("sbiNumber", e.target.value), placeholder: "Single Business Identifier" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextReviewDue ?? "", onChange: (e) => f("nextReviewDue", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.documentRef ?? "", onChange: (e) => f("documentRef", e.target.value), placeholder: "Vet report file/ref" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Areas Reviewed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.areasReviewed ?? "", onChange: (e) => f("areasReviewed", e.target.value), placeholder: "e.g. Biosecurity, lameness, BVD, nutrition" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Key Findings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.keyFindings ?? "", onChange: (e) => f("keyFindings", e.target.value), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recommendations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.recommendations ?? "", onChange: (e) => f("recommendations", e.target.value), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Agreed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.actionsAgreed ?? "", onChange: (e) => f("actionsAgreed", e.target.value), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => f("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? "Saving…" : "Save Review" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AHWRPage as default
};
