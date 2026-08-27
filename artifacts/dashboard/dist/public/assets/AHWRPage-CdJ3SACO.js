import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input } from "./index-B79fdy4q.js";
import { u as usePersistedTab } from "./use-persisted-tab-HVrvTnnf.js";
import { a as usePersistedFilter } from "./use-persisted-filter-BxLaY80g.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout, e as ChartColumn, k as Stethoscope, I as Info } from "./AppLayout-WXhsn1Oj.js";
import { T as Textarea } from "./textarea-B2zoxm1e.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C2chGZ5e.js";
import { B as Badge } from "./badge-cBqpHV4b.js";
import { a as printRecordReport } from "./record-report-CtL9yOgX.js";
import { C as CalendarCheck, T as TooltipProvider, a as Tooltip$1, b as TooltipTrigger, c as TooltipContent } from "./tooltip-BRlDiw8h.js";
import { R as RecordAttachments } from "./RecordAttachments-urk6XJti.js";
import { a as Clock, C as CircleAlert } from "./database-B_v6kO1h.js";
import { C as CircleCheck } from "./circle-check-DKiMgdAY.js";
import { T as TriangleAlert } from "./triangle-alert-i0ksyHOk.js";
import { P as Printer } from "./printer-U9gyO2YQ.js";
import { L as ListChecks } from "./list-checks-BT6e1rCP.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip, L as Legend, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-Bmj1BWd2.js";
import { P as PieChart, a as Pie } from "./PieChart-DTEfqIT0.js";
import { B as BarChart } from "./BarChart-DR3Nl14F.js";
import { U as UserCheck } from "./user-check-DPUBeFv1.js";
import { P as Paperclip } from "./paperclip-DtJsXe9l.js";
import "./use-safe-clerk-BkT-X0_i.js";
import "./trash-2-C9iY4Z0h.js";
import "./shield-alert-DO3uGrs8.js";
import "./shield-check-_oLLEcr8.js";
import "./tractor-qiX3u5VJ.js";
import "./index-CwHJsZHy.js";
import "./index-BhTuQqCI.js";
import "./chevron-up-CjOQrLPI.js";
import "./print-report-ClU8-1P0.js";
import "./use-upload-CcDlSikM.js";
import "./upload-4D-qF_qa.js";
import "./image-lAfUV7d5.js";
import "./download-E3dRPw_0.js";
const SPECIES = ["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Deer"];
const SPECIES_COLOUR = {
  Cattle: "bg-blue-100 text-blue-800",
  Sheep: "bg-green-100 text-green-800",
  Pigs: "bg-pink-100 text-pink-800",
  Poultry: "bg-yellow-100 text-yellow-800",
  Goats: "bg-purple-100 text-purple-800",
  Deer: "bg-orange-100 text-orange-800"
};
const PIE_COLOURS = ["#3b82f6", "#22c55e", "#ec4899", "#eab308", "#a855f7", "#f97316"];
const OUTCOMES = [
  { key: "satisfactory", label: "Satisfactory", icon: CircleCheck, colour: "text-green-600", bg: "bg-green-50 border-green-300" },
  { key: "action_required", label: "Action Required", icon: CircleAlert, colour: "text-amber-600", bg: "bg-amber-50 border-amber-300" },
  { key: "urgent_action", label: "Urgent Action", icon: TriangleAlert, colour: "text-red-600", bg: "bg-red-50 border-red-300" }
];
function addOneYear(dateStr) {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
const VET_OTHER = "__other__";
function AHWRPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab({
    page: "ahwr",
    farmId,
    validIds: ["reviews", "analytics"],
    defaultTab: "reviews"
  });
  const [speciesFilter, setSpeciesFilter] = usePersistedFilter({
    page: "ahwr",
    filter: "species",
    farmId,
    defaultValue: "all"
  });
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [nextReviewAutoSet, setNextReviewAutoSet] = reactExports.useState(false);
  const [vetSelectVal, setVetSelectVal] = reactExports.useState("");
  const [showTaskPrompt, setShowTaskPrompt] = reactExports.useState(false);
  const [savedRecordId, setSavedRecordId] = reactExports.useState(null);
  const recordsQ = useQuery({
    queryKey: ["farms", farmId, "ahwr-records"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-records`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const farmQ = useQuery({
    queryKey: ["farms", farmId, "info"],
    queryFn: () => api.get(`/farms/${farmId}`).then((r) => r.farm ?? r),
    enabled: !!farmId
  });
  const contactsQ = useQuery({
    queryKey: ["farms", farmId, "ahwr-vet-contacts"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-vet-contacts`).then((r) => r.contacts ?? []),
    enabled: !!farmId
  });
  const records = recordsQ.data ?? [];
  const contacts = contactsQ.data ?? [];
  const vetContacts = contacts.filter(
    (c) => !c.role || c.role.toLowerCase().includes("vet") || c.role.toLowerCase().includes("veterinar")
  );
  const vetOptions = vetContacts.length > 0 ? vetContacts : contacts;
  const filtered = speciesFilter === "all" ? records : records.filter((r) => r.species === speciesFilter);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const overdue = records.filter((r) => r.nextReviewDue && r.nextReviewDue < today);
  const f = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  function openAdd() {
    setEditing(null);
    const sbi = farmQ.data?.sbiNumber ?? "";
    const today2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    setForm({
      species: "Cattle",
      reviewDate: today2,
      sbiNumber: sbi,
      nextReviewDue: addOneYear(today2)
    });
    setNextReviewAutoSet(true);
    setVetSelectVal("");
    setShowTaskPrompt(false);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setNextReviewAutoSet(false);
    setVetSelectVal(r.vetContactId ? String(r.vetContactId) : r.vetName ? VET_OTHER : "");
    setShowTaskPrompt(false);
    setOpen(true);
  }
  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm({});
    setNextReviewAutoSet(false);
    setVetSelectVal("");
    setShowTaskPrompt(false);
  }
  reactExports.useEffect(() => {
    if (!form.reviewDate) return;
    if (nextReviewAutoSet || !form.nextReviewDue) {
      setForm((p) => ({ ...p, nextReviewDue: addOneYear(form.reviewDate) }));
      setNextReviewAutoSet(true);
    }
  }, [form.reviewDate]);
  function handleVetSelect(val) {
    setVetSelectVal(val);
    if (val === VET_OTHER || val === "") {
      f("vetContactId", null);
    } else {
      const contact = vetOptions.find((c) => String(c.id) === val);
      if (contact) {
        setForm((p) => ({
          ...p,
          vetContactId: contact.id,
          vetName: contact.name,
          vetPractice: contact.organisation ?? "",
          // Pre-fill "agreed with" with vet name if not already set
          agreedWith: p.agreedWith || contact.name
        }));
      }
    }
  }
  const saveMut = useMutation({
    mutationFn: (body) => editing ? api.put(`/farms/${farmId}/ahwr-records/${editing.id}`, body) : api.post(`/farms/${farmId}/ahwr-records`, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "ahwr-records"] });
      toast({ title: editing ? "AHWR record updated" : "AHWR record saved" });
      if (form.actionsAgreed?.trim()) {
        const id = data?.record?.id ?? editing?.id ?? null;
        setSavedRecordId(id);
        setShowTaskPrompt(true);
      } else {
        closeDialog();
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const taskMut = useMutation({
    mutationFn: (body) => api.post(`/farms/${farmId}/task-assignments`, body),
    onSuccess: () => {
      toast({ title: "Follow-up task created" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
      closeDialog();
    }
  });
  function raiseFollowUpTask() {
    taskMut.mutate({
      title: `AHWR follow-up — ${form.species ?? ""}${form.reviewDate ? ` (${form.reviewDate})` : ""}`,
      description: form.actionsAgreed ?? "",
      dueDate: form.nextReviewDue ?? void 0
    });
  }
  const bySpecies = SPECIES.map((s) => ({
    species: s,
    count: records.filter((r) => r.species === s).length
  })).filter((d) => d.count > 0);
  const byYear = Array.from(new Set(records.map((r) => r.reviewDate.slice(0, 4)))).sort().map((yr) => ({
    year: yr,
    count: records.filter((r) => r.reviewDate.startsWith(yr)).length
  }));
  const upcoming = records.filter((r) => r.nextReviewDue && r.nextReviewDue >= today).sort((a, b) => a.nextReviewDue.localeCompare(b.nextReviewDue)).slice(0, 4);
  function printReview(record) {
    printRecordReport({
      title: "Annual Health & Welfare Review",
      subtitle: `${record.species} review — ${record.reviewDate}`,
      farmName: farmQ.data?.name ?? "",
      farmAddress: farmQ.data?.address ?? void 0,
      contactPhone: farmQ.data?.phone ?? void 0,
      cphNumber: farmQ.data?.cphNumber ?? void 0,
      sbiNumber: farmQ.data?.sbiNumber ?? void 0,
      redTractorId: farmQ.data?.redTractorId ?? void 0,
      authority: "SFI / ELM",
      authorityReferenceLabel: "AHWR Reference",
      authorityReference: record.ahwrRef,
      authorityReferenceRequired: true,
      record
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Annual Health & Welfare Review (AHWR)", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AHWR" }),
      " — Annual vet health and welfare reviews are a condition of SFI/ELM payments. Records must be kept for at least 5 years. Add your attending vets to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → Contacts" }),
      " to enable intelligent vet lookup and auto-population."
    ] }),
    overdue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-800 font-medium text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
        overdue.length,
        " review",
        overdue.length > 1 ? "s" : "",
        " overdue"
      ] }),
      overdue.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-amber-700 mt-1 cursor-pointer hover:underline", onClick: () => openEdit(r), children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap items-center", children: [
        tab === "reviews" && ["all", ...SPECIES].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: speciesFilter === s ? "default" : "outline", onClick: () => setSpeciesFilter(s), children: s === "all" ? "All" : s }, s)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add AHWR"
        ] })
      ] })
    ] }),
    tab === "reviews" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: recordsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "No AHWR records",
        speciesFilter !== "all" ? ` for ${speciesFilter}` : "",
        ". Add your first review."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate)).map((r) => {
      const outcomeObj = OUTCOMES.find((o) => o.key === r.outcome);
      const OutcomeIcon = outcomeObj?.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow",
          onClick: () => openEdit(r),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700", children: r.species }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: r.reviewDate }),
                outcomeObj && OutcomeIcon && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-1 text-xs font-medium ${outcomeObj.colour}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeIcon, { className: "w-3 h-3" }),
                  outcomeObj.label
                ] }),
                r.nextReviewDue && r.nextReviewDue < today && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-800 text-xs", children: "Overdue" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
                e.stopPropagation();
                printReview(r);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Vet: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.vetName }),
                r.vetPractice ? ` — ${r.vetPractice}` : ""
              ] }),
              r.ahwrRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Ref: ",
                r.ahwrRef
              ] }),
              r.keyFindings && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-2", children: [
                "Findings: ",
                r.keyFindings
              ] }),
              r.actionsAgreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-blue-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "w-3 h-3" }),
                "Actions agreed",
                r.agreedWith ? ` with ${r.agreedWith}` : ""
              ] }),
              r.nextReviewDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: r.nextReviewDue < today ? "text-amber-600 font-medium" : "text-blue-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "inline w-3 h-3 mr-1" }),
                "Next due: ",
                r.nextReviewDue
              ] })
            ] })
          ]
        },
        r.id
      );
    }) }) }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { label: "Total Reviews", value: records.length },
        { label: "Overdue", value: overdue.length, amber: overdue.length > 0 },
        {
          label: "Upcoming (next 90d)",
          value: records.filter((r) => {
            const d90 = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
            return r.nextReviewDue && r.nextReviewDue >= today && r.nextReviewDue <= d90;
          }).length,
          blue: true
        },
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
      if (!o) closeDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit AHWR Record" : "Add Annual Health & Welfare Review" }) }),
      showTaskPrompt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "w-4 h-4 text-blue-700 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-blue-800", children: "Actions recorded — raise a follow-up task?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 mt-1", children: "The actions agreed during this review can be added to your Week Ahead task planner so they appear as reminders for your team. The next review date will be set as the due date." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: raiseFollowUpTask, disabled: taskMut.isPending, children: taskMut.isPending ? "Creating…" : "Yes, raise a task" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: closeDialog, children: "No thanks, close" })
        ] })
      ] }),
      !showTaskPrompt && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        saveMut.mutate(form);
      }, className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Review Details" }),
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: form.reviewDate ?? "",
                  onChange: (e) => f("reviewDate", e.target.value),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SBI Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip$1, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 text-muted-foreground cursor-help" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-xs", children: "Auto-filled from Farm Settings. Edit Farm Settings to change your registered SBI. You can override it here for this record only." })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.sbiNumber ?? "",
                  onChange: (e) => f("sbiNumber", e.target.value),
                  placeholder: "Single Business Identifier",
                  className: farmQ.data?.sbiNumber && form.sbiNumber === farmQ.data.sbiNumber ? "bg-gray-50" : ""
                }
              ),
              farmQ.data?.sbiNumber && form.sbiNumber === farmQ.data.sbiNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none", children: "from Farm Settings" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Attending Vet" }),
          vetOptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "No contacts registered. Add your attending vet in ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → Contacts" }),
              " to enable intelligent vet lookup and automatic practice population. You can still enter details manually below."
            ] })
          ] }) : null,
          vetOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: vetSelectVal, onValueChange: handleVetSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose from registered contacts…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                vetOptions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                  c.name,
                  c.organisation ? ` — ${c.organisation}` : ""
                ] }, c.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: VET_OTHER, children: "Other / manual entry…" })
              ] })
            ] }),
            vetSelectVal && vetSelectVal !== VET_OTHER && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3 h-3 text-green-600" }),
              "Vet name and practice auto-populated from your Contacts register"
            ] })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.vetName ?? "",
                  onChange: (e) => f("vetName", e.target.value),
                  required: true,
                  readOnly: !!(vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0),
                  className: vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0 ? "bg-gray-50" : "",
                  placeholder: "e.g. Dr Sarah Jones"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Practice" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.vetPractice ?? "",
                  onChange: (e) => f("vetPractice", e.target.value),
                  readOnly: !!(vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0),
                  className: vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0 ? "bg-gray-50" : "",
                  placeholder: "Practice name"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Findings & Priorities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Areas Reviewed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.areasReviewed ?? "",
                onChange: (e) => f("areasReviewed", e.target.value),
                placeholder: "e.g. Biosecurity, lameness, BVD, nutrition, parasite management"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Key Findings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.keyFindings ?? "",
                onChange: (e) => f("keyFindings", e.target.value),
                rows: 3,
                placeholder: "Summary of health status, disease pressures, body condition, welfare indicators…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Health Priorities for Next 12 Months" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.healthPriorities ?? "",
                onChange: (e) => f("healthPriorities", e.target.value),
                rows: 2,
                placeholder: "Vaccination protocols, endemic disease management, nutrition plans…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recommendations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.recommendations ?? "",
                onChange: (e) => f("recommendations", e.target.value),
                rows: 2,
                placeholder: "Vet's formal recommendations for herd / flock health"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Actions Agreed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Saved actions can be raised as a follow-up task after saving" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Agreed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.actionsAgreed ?? "",
                onChange: (e) => f("actionsAgreed", e.target.value),
                rows: 3,
                placeholder: "Specific actions agreed — ideally name a responsible person and target date for each"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agreed With" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.agreedWith ?? "",
                onChange: (e) => f("agreedWith", e.target.value),
                placeholder: "e.g. Dr Sarah Jones and farm manager"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Auto-filled with the vet name when a registered contact is selected" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Outcome & Schedule" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Overall Outcome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: OUTCOMES.map((o) => {
              const Icon = o.icon;
              const selected = form.outcome === o.key;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => f("outcome", selected ? null : o.key),
                  className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${selected ? `${o.bg} ${o.colour} border-current` : "border-gray-200 text-muted-foreground hover:border-gray-400"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5" }),
                    o.label
                  ]
                },
                o.key
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Due" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip$1, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 text-muted-foreground cursor-help" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-xs", children: "Auto-calculated to 12 months from the review date. Appears in the Week Ahead Planner as an upcoming task reminder. Edit to override." })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: form.nextReviewDue ?? "",
                  onChange: (e) => {
                    f("nextReviewDue", e.target.value);
                    setNextReviewAutoSet(false);
                  }
                }
              ),
              nextReviewAutoSet && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Auto-set to 12 months from review date" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "AHWR Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip$1, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 text-muted-foreground cursor-help" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-xs", children: "The reference number on the vet's report, or the RPA action reference assigned when you confirm the review under your SFI agreement. This is not an RPA claim number — it is your own record-keeping reference for this review." })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.ahwrRef ?? "",
                  onChange: (e) => f("ahwrRef", e.target.value),
                  placeholder: "Vet report or RPA action reference"
                }
              )
            ] })
          ] })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3.5 h-3.5" }),
            "Vet Report & Attachments"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Attach the vet's written report (paper scan, emailed PDF, or photo). Accepted formats: PDF, images, Word documents." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "ahwr_review", recordId: editing.id })
        ] }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3.5 h-3.5 shrink-0" }),
          "Save this record first, then re-open it to attach the vet's written report or PDF."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: form.notes ?? "",
              onChange: (e) => f("notes", e.target.value),
              rows: 2,
              placeholder: "Additional observations or context"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: closeDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? "Saving…" : editing ? "Update Review" : "Save Review" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AHWRPage as default
};
