import { b as useAppStore, r as reactExports, j as jsxRuntimeExports, d as Button, U as FlaskConical, a as useToast, c as useQueryClient, m as useQuery, S as useMutation, I as Input, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, N as DialogMutationError, J as DialogFooter, e as LoaderCircle, n as Card, o as CardContent, O as React } from "./index-dOwizOzO.js";
import { u as usePersistedTab } from "./use-persisted-tab-Bj-lqAhP.js";
import { a as usePersistedFilter } from "./use-persisted-filter-BVVAsJLr.js";
import { F as FarmLocationSelect } from "./FarmLocationSelect-CERRcEJE.js";
import { A as AppLayout, Z as Zap, E as Flame, c as ClipboardList } from "./AppLayout-DxVOt1e5.js";
import { T as Textarea } from "./textarea-CtBJ8gnr.js";
import { B as Badge } from "./badge-B3vfMADX.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DQkn2syB.js";
import { T as TabBar, a as TabButton } from "./tab-button-DtTx3Q0L.js";
import { Q as QRCodeSVG } from "./index-B3f1Z1G1.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BJ5F-MNX.js";
import { B as BuyerCombobox } from "./BuyerCombobox-dHJxvksS.js";
import { S as ShieldAlert } from "./shield-alert-C8T4oV9r.js";
import { P as Printer } from "./printer-nkM_Y8P7.js";
import { T as TriangleAlert } from "./triangle-alert-D1dPGvoB.js";
import { a as Clock } from "./database-BRM0OUE2.js";
import { S as ShieldCheck } from "./shield-check-D0h4MUGc.js";
import { S as Search } from "./search-BaxYgIhK.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-Cia-aNs-.js";
import { E as Eye } from "./eye-rh9yUpxo.js";
import { P as Pencil } from "./pencil-DmROvMR6.js";
import { Q as QrCode } from "./qr-code-6C0L0Zud.js";
import { C as ChevronRight } from "./tractor-Cxn8N8za.js";
import { F as File } from "./file-CzkMMBbL.js";
import { P as Paperclip } from "./paperclip-Dc4ey0vy.js";
import "./use-safe-clerk-YwdTw6WL.js";
import "./index-CDU9tKoH.js";
import "./index-D6wgdV58.js";
import "./chevron-up-DmXKv5PB.js";
import "./popover-Df48Ds3A.js";
import "./command-DAt5aITj.js";
import "./chevrons-up-down-D8pAZi8C.js";
import "./user-plus-B9fhF1Vz.js";
const RISK_ASSESSMENTS_TAB_IDS = ["risk", "coshh", "pat", "fire"];
const RISK_COLORS = {
  low: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200"
};
const STATUS_COLORS = {
  active: "bg-green-50 text-green-700 border-green-200",
  "under-review": "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200"
};
const HAZARD_TEMPLATES = [
  {
    label: "Manual Handling",
    title: "Manual Handling",
    hazardDescription: "Lifting, carrying and moving heavy loads (bags of feed/fertiliser, equipment parts) causing musculoskeletal injury.",
    controlMeasures: "Training in correct lifting technique provided. Use of mechanical aids (pallet trucks, telehandler) where loads exceed 20kg. Team lifts for awkward loads. Regular risk assessment review.",
    riskLevel: "medium"
  },
  {
    label: "Working at Height",
    title: "Working at Height",
    hazardDescription: "Access to and working on grain store roofs, silage clamps, ladder use, and elevated platform work.",
    controlMeasures: "Harness and anchor point system used. Work at height permits in place. Ladders inspected and secured. No lone working at height. Guard rails fitted where permanent access required.",
    riskLevel: "high"
  },
  {
    label: "Machinery & Moving Parts",
    title: "Machinery – PTO and Moving Parts",
    hazardDescription: "Injury from PTO shafts, augers, conveyors, and rotating machinery components.",
    controlMeasures: "All guards fitted and in good condition before use. PTOs disengaged before dismounting. Operators trained and competent. Pre-use checks completed. Emergency stop procedures displayed.",
    riskLevel: "high"
  },
  {
    label: "Chemical Handling (COSHH)",
    title: "Chemical Handling – Pesticides and Fertilisers",
    hazardDescription: "Skin, eye and respiratory exposure to agrochemicals during mixing, loading and application operations.",
    controlMeasures: "COSHH assessments completed for all products. Full PPE worn (gloves, goggles, overalls, respirator where required). Emergency wash station available at spray fill point. SDS sheets accessible. Waste product disposed of correctly.",
    riskLevel: "high"
  },
  {
    label: "Lone Working",
    title: "Lone Working",
    hazardDescription: "Working alone in remote field locations, grain stores or workshop, reducing access to emergency assistance if injured.",
    controlMeasures: "Lone worker check-in procedure in place. Mobile phone carried at all times. Supervisor informed of working location and expected return time. Buddy system for high-risk tasks. Emergency contacts posted.",
    riskLevel: "medium"
  },
  {
    label: "Young Workers / Visitors",
    title: "Young Workers and Farm Visitors",
    hazardDescription: "Inexperienced young workers and farm visitors (including children) in proximity to hazardous machinery, chemicals and livestock.",
    controlMeasures: "Induction training provided before any work commences. Restricted access zones marked. Visitors accompanied at all times. Young workers not permitted to operate machinery without supervision. Visitor risk assessment completed.",
    riskLevel: "medium"
  },
  {
    label: "Electricity",
    title: "Electrical Hazards",
    hazardDescription: "Fixed and portable electrical equipment, overhead lines, and grain drying / irrigation electrical installations.",
    controlMeasures: "PAT testing completed annually. Fixed installation tested every 5 years. RCDs fitted. Overhead line clearance checked before any tall machinery movement. Wet environments – waterproof rated equipment only. Faults reported immediately.",
    riskLevel: "high"
  },
  {
    label: "Slips, Trips & Falls",
    title: "Slips, Trips and Falls",
    hazardDescription: "Wet and muddy yard surfaces, steep banks, grain store floors, and uneven ground causing slips and falls.",
    controlMeasures: "Anti-slip surfaces installed in high-traffic areas. Good housekeeping maintained. Adequate lighting in buildings. Spills cleared immediately. Appropriate footwear required (steel toe cap, anti-slip).",
    riskLevel: "medium"
  },
  {
    label: "Livestock Handling",
    title: "Livestock Handling",
    hazardDescription: "Crushing, kicking, trampling or goring injuries when handling cattle, sheep, pigs or other livestock.",
    controlMeasures: "Proper handling facilities used at all times. Lone working with cattle not permitted. Trained handlers only. Escape route always available. Protective clothing worn. Seasonal risk (calving, lambing) procedures in place.",
    riskLevel: "high"
  },
  {
    label: "Silo/Clamp Filling",
    title: "Silo and Silage Clamp Filling",
    hazardDescription: "Silo gas (nitrogen dioxide) exposure from freshly filled tower silos and fermenting silage causing respiratory injury or death; vehicle rollover, collision or crushing during clamp filling and consolidation by tractors/loaders working on sheeted, sloped or narrow clamp faces; clamp wall collapse; and self-heating/fire risk in stored haylage. Based on HSE AIS28 (Silage) guidance.",
    controlMeasures: "Silo gas: do not enter towers/silos for at least 3 weeks after filling; ventilate fully and test atmosphere before entry; never enter alone; forage/blowing pipes ventilated away from occupied buildings. Clamp filling: exclusion zone enforced — no pedestrians/children/visitors on or near the clamp while filling; rolling tractors fitted with ROPS and seatbelts worn at all times; safe systems of work agreed and briefed before filling starts (one vehicle on the clamp face at a time, banksman used for reversing); clamp faces built with a safe batter, not vertical overhangs; sheeting and weighting carried out from ground level or with fall protection, never by standing on unsupported bale stacks; haylage bales stacked and monitored for self-heating with a written inspection routine; fire extinguisher and emergency contact numbers available on site during filling.",
    riskLevel: "critical"
  }
];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const isOverdue = (reviewDate) => {
  if (!reviewDate) return false;
  return new Date(reviewDate) < /* @__PURE__ */ new Date();
};
const EMPTY = {
  title: "",
  area: "",
  hazardDescription: "",
  riskLevel: "medium",
  controlMeasures: "",
  assessedBy: "",
  assessmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  reviewDate: "",
  status: "active",
  notes: ""
};
function RiskAssessmentTab({ farmId, openId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [filterRisk, setFilterRisk] = usePersistedFilter({ page: "risk-assessments", filter: "risk", farmId, defaultValue: "all" });
  const [filterStatus, setFilterStatus] = usePersistedFilter({ page: "risk-assessments", filter: "status", farmId, defaultValue: "all" });
  const [quickFilter, setQuickFilter] = usePersistedFilter({ page: "risk-assessments", filter: "quick", farmId, defaultValue: "none" });
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [raiseTaskRisk, setRaiseTaskRisk] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const [showTemplates, setShowTemplates] = reactExports.useState(false);
  const [hlId, setHlId] = reactExports.useState(openId ?? null);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const { data, isLoading } = useQuery({
    queryKey: ["risk-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/risk-assessments`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = data?.records ?? [];
  const totalActive = records.filter((r) => r.status === "active").length;
  const highCritical = records.filter((r) => r.status === "active" && (r.riskLevel === "high" || r.riskLevel === "critical")).length;
  const overdueReviews = records.filter((r) => r.status === "active" && isOverdue(r.reviewDate)).length;
  const reviewDueSoon = records.filter((r) => {
    if (!r.reviewDate || r.status !== "active") return false;
    const d = new Date(r.reviewDate);
    const now = /* @__PURE__ */ new Date();
    const soon = /* @__PURE__ */ new Date();
    soon.setDate(soon.getDate() + 30);
    return d >= now && d <= soon;
  }).length;
  const filtered = records.filter((r) => {
    if (quickFilter === "overdue") return r.status === "active" && isOverdue(r.reviewDate);
    if (quickFilter === "due-soon") {
      if (!r.reviewDate || r.status !== "active") return false;
      const d = new Date(r.reviewDate), now = /* @__PURE__ */ new Date(), soon = /* @__PURE__ */ new Date();
      soon.setDate(soon.getDate() + 30);
      return d >= now && d <= soon;
    }
    if (quickFilter === "high-critical") return r.status === "active" && (r.riskLevel === "high" || r.riskLevel === "critical");
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.area?.toLowerCase().includes(search.toLowerCase()) || r.assessedBy?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === "all" || r.riskLevel === filterRisk;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchRisk && matchStatus;
  });
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || records.length === 0) return;
    const target = records.find((r) => r.id === openId);
    if (target) {
      autoOpened.current = true;
      setViewRecord(target);
      setTimeout(() => {
        rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = setTimeout(() => setHlId(null), 4e3);
        return () => clearTimeout(t);
      }, 200);
    }
  }, [openId, records]);
  const saveMutation = useMutation({
    mutationFn: (data2) => {
      const url = editing ? `/api/farms/${farmId}/risk-assessments/${editing.id}` : `/api/farms/${farmId}/risk-assessments`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data2,
          assessmentDate: data2.assessmentDate ? new Date(data2.assessmentDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          reviewDate: data2.reviewDate ? new Date(data2.reviewDate).toISOString() : null
        })
      }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] });
      toast({ title: editing ? "Assessment updated" : "Assessment added" });
      closeDialog();
    },
    onError: () => toast({ title: "Error saving assessment", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/risk-assessments/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] });
      setDeleteId(null);
      toast({ title: "Assessment deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY, assessmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setShowTemplates(false);
    setDialogOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate?.slice(0, 10), reviewDate: r.reviewDate?.slice(0, 10) ?? "" });
    setViewRecord(null);
    setShowTemplates(false);
    setDialogOpen(true);
  }
  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY);
    setShowTemplates(false);
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const applyTemplate = (t) => {
    setForm((f) => ({ ...f, title: t.title, hazardDescription: t.hazardDescription, controlMeasures: t.controlMeasures, riskLevel: t.riskLevel }));
    setShowTemplates(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide font-medium mb-1", children: "Active Assessments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: totalActive })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setQuickFilter(quickFilter === "high-critical" ? "none" : "high-critical"),
          className: `rounded-lg p-4 text-left border transition-all ${quickFilter === "high-critical" ? "bg-red-50 border-red-500 ring-2 ring-red-100" : "bg-white border-red-200 hover:border-red-400"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 text-red-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 uppercase tracking-wide font-medium", children: "High / Critical" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-700", children: highCritical }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: quickFilter === "high-critical" ? "Filtered — click to clear" : "Click to filter" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setQuickFilter(quickFilter === "overdue" ? "none" : "overdue"),
          className: `rounded-lg p-4 text-left border transition-all ${quickFilter === "overdue" ? "bg-orange-50 border-orange-500 ring-2 ring-orange-100" : "bg-white border-orange-200 hover:border-orange-400"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 text-orange-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-orange-600 uppercase tracking-wide font-medium", children: "Overdue Reviews" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-orange-700", children: overdueReviews }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: quickFilter === "overdue" ? "Filtered — click to clear" : "Click to filter" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setQuickFilter(quickFilter === "due-soon" ? "none" : "due-soon"),
          className: `rounded-lg p-4 text-left border transition-all ${quickFilter === "due-soon" ? "bg-yellow-50 border-yellow-500 ring-2 ring-yellow-100" : "bg-white border-yellow-200 hover:border-yellow-400"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-yellow-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-yellow-600 uppercase tracking-wide font-medium", children: "Due in 30 Days" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-yellow-700", children: reviewDueSoon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: quickFilter === "due-soon" ? "Filtered — click to clear" : "Click to filter" })
          ]
        }
      )
    ] }),
    quickFilter !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 16, fontSize: "0.875rem", color: "#92400e" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, style: { flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Showing ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: filtered.length }),
        " ",
        quickFilter === "overdue" ? "overdue review" : quickFilter === "due-soon" ? "review due within 30 days" : "high / critical",
        " record",
        filtered.length !== 1 ? "s" : "",
        " — all statuses"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQuickFilter("none"), style: { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#92400e", fontWeight: 600, fontSize: "0.875rem", padding: "0 4px" }, children: "✕ Clear" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white rounded-lg border p-4 flex flex-wrap gap-3 items-center mb-4 transition-colors ${quickFilter !== "none" ? "border-amber-300 bg-amber-50/30" : "border-gray-200"}`, children: [
      quickFilter !== "none" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 font-medium w-full -mb-1", children: "Quick filter active — search and dropdowns are bypassed" }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-48", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: `absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${quickFilter !== "none" ? "text-gray-300" : "text-gray-400"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by title, area or assessor…", value: search, onChange: (e) => {
          setSearch(e.target.value);
          setQuickFilter("none");
        }, className: "pl-9", disabled: quickFilter !== "none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterRisk, onValueChange: (v) => {
        setFilterRisk(v);
        setQuickFilter("none");
      }, disabled: quickFilter !== "none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Risk level" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All levels" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "High" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: (v) => {
        setFilterStatus(v);
        setQuickFilter("none");
      }, disabled: quickFilter !== "none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "under-review", children: "Under Review" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "archived", children: "Archived" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-brand-forest hover:bg-brand-forest/90 text-white", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
        " Add Assessment"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-x-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-gray-400 text-sm", children: "Loading assessments…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-8 h-8 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "No risk assessments found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-xs", children: "Add your first risk assessment or use a template to get started quickly" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-max min-w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Title / Area" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Risk Level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Assessed By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Assessment Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Review Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { ref: (el) => {
        if (el) rowRefs.current.set(r.id, el);
      }, className: `border-b border-gray-50 transition-colors${hlId === r.id ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : " hover:bg-gray-50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: r.title }),
          r.area && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: r.area })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.riskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `capitalize ${RISK_COLORS[r.riskLevel] ?? ""}`, children: r.riskLevel }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.assessedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: fmt(r.assessmentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: r.reviewDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: isOverdue(r.reviewDate) ? "text-red-600 font-medium" : "text-gray-600", children: [
          isOverdue(r.reviewDate) && "⚠ ",
          fmt(r.reviewDate)
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `capitalize ${STATUS_COLORS[r.status] ?? ""}`, children: r.status.replace("-", " ") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRecord(r), children: "View" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1 text-xs text-primary border-primary/30 hover:bg-primary/5", onClick: () => setRaiseTaskRisk(r), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }),
            "Raise Task"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500 hover:text-red-700", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (v) => {
      if (!v) {
        closeDialog();
        saveMutation.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "54rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 text-red-600" }),
        editing ? "Edit Risk Assessment" : "New Risk Assessment"
      ] }) }),
      !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowTemplates((v) => !v),
            style: { display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", color: "#166534", fontWeight: 500 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 13 }),
              " Use a hazard template ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13, style: { marginLeft: 2, transform: showTemplates ? "rotate(180deg)" : "none", transition: "transform 0.2s" } })
            ]
          }
        ),
        showTemplates && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }, children: HAZARD_TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => applyTemplate(t),
            style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", cursor: "pointer", textAlign: "left", fontSize: "0.8rem", color: "#374151", fontWeight: 500, transition: "border-color 0.15s" },
            onMouseEnter: (e) => e.currentTarget.style.borderColor = "#16a34a",
            onMouseLeave: (e) => e.currentTarget.style.borderColor = "#e5e7eb",
            children: t.label
          },
          t.label
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.title ?? "", onChange: (e) => set("title", e.target.value), placeholder: "e.g. Chemical storage area risk assessment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area / Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FarmLocationSelect, { farmId, value: form.area ?? "", onChange: (v) => set("area", v), placeholder: "Select or type area…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.riskLevel ?? "medium", onValueChange: (v) => set("riskLevel", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "High" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hazard Description *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.hazardDescription ?? "", onChange: (e) => set("hazardDescription", e.target.value), rows: 3, placeholder: "Describe the hazard and who might be harmed…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.controlMeasures ?? "", onChange: (e) => set("controlMeasures", e.target.value), rows: 3, placeholder: "PPE, training requirements, engineering controls, safe working procedures…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessedBy ?? "", onChange: (e) => set("assessedBy", e.target.value), placeholder: "Name of assessor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => set("status", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "under-review", children: "Under Review" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "archived", children: "Archived" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate ?? "", onChange: (e) => set("assessmentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.reviewDate ?? "", onChange: (e) => set("reviewDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => set("notes", e.target.value), rows: 2, placeholder: "Any additional context or follow-up actions…" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMutation, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: closeDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "bg-brand-forest hover:bg-brand-forest/90 text-white",
            disabled: !form.title || !form.hazardDescription || !form.assessmentDate || saveMutation.isPending,
            onClick: () => saveMutation.mutate(form),
            children: saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Assessment"
          }
        )
      ] })
    ] }) }),
    viewRecord && !dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 text-red-600" }),
        " ",
        viewRecord.title
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          viewRecord.riskLevel && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `capitalize ${RISK_COLORS[viewRecord.riskLevel]}`, children: [
            viewRecord.riskLevel,
            " Risk"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `capitalize ${STATUS_COLORS[viewRecord.status]}`, children: viewRecord.status.replace("-", " ") }),
          isOverdue(viewRecord.reviewDate) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-50 text-red-700 border-red-200", children: "Review Overdue" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.area || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Assessed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.assessedBy || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Assessment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewRecord.assessmentDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Review Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: isOverdue(viewRecord.reviewDate) ? "text-red-600 font-medium" : "", children: fmt(viewRecord.reviewDate) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Hazard Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.hazardDescription })
        ] }),
        viewRecord.controlMeasures && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.controlMeasures })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => openEdit(viewRecord), children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMutation.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "28rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Risk Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "This will permanently delete this risk assessment record. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMutation, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMutation.isPending, onClick: () => deleteId && deleteMutation.mutate(deleteId), children: deleteMutation.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) }),
    raiseTaskRisk && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskRisk,
        onClose: () => setRaiseTaskRisk(null),
        defaultTitle: `Address risk: ${raiseTaskRisk.title}`,
        defaultDescription: raiseTaskRisk.hazardDescription || raiseTaskRisk.controlMeasures || "",
        taskType: "risk_assessment",
        module: "Health & Safety"
      }
    )
  ] });
}
const HAZARD_CLASSIFICATIONS = [
  "Flammable (F)",
  "Highly Flammable (F+)",
  "Corrosive (C)",
  "Irritant (Xi)",
  "Harmful (Xn)",
  "Toxic (T)",
  "Very Toxic (T+)",
  "Oxidising (O)",
  "Explosive (E)",
  "Environmentally Hazardous (N)",
  "Carcinogenic / Mutagenic / Reprotoxic (CMR)",
  "None / Low Hazard"
];
function CoshhTab({ farmId, openId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const emptyForm = { substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), reviewDate: "", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const [search, setSearch] = reactExports.useState("");
  const [hlId, setHlId] = reactExports.useState(openId ?? null);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const q = useQuery({
    queryKey: ["risk-coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/risk-coshh`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["risk-coshh", farmId] });
  const saveMut = useMutation({
    mutationFn: (body) => {
      const payload = {
        ...body,
        assessmentDate: body.assessmentDate ? new Date(body.assessmentDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        reviewDate: body.reviewDate ? new Date(body.reviewDate).toISOString() : null
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/risk-coshh/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      return fetch(`/api/farms/${farmId}/risk-coshh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      toast({ title: editRecord ? "COSHH record updated" : "COSHH record saved" });
      invalidate();
      setAddOpen(false);
      setEditRecord(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/risk-coshh/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const records = q.data ?? [];
  const filtered = records.filter((r) => !search || r.substanceName?.toLowerCase().includes(search.toLowerCase()) || r.manufacturer?.toLowerCase().includes(search.toLowerCase()) || r.usageArea?.toLowerCase().includes(search.toLowerCase()));
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || records.length === 0) return;
    const target = records.find((r) => r.id === openId);
    if (target) {
      autoOpened.current = true;
      setTimeout(() => setViewRecord(target), 100);
    }
  }, [openId, records]);
  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setAddOpen(true);
  };
  const openEdit = (r) => {
    setEditRecord(r);
    setForm({ ...r, assessmentDate: r.assessmentDate?.slice(0, 10) ?? "", reviewDate: r.reviewDate?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };
  const overdueReviews = records.filter((r) => r.reviewDate && new Date(r.reviewDate) < /* @__PURE__ */ new Date()).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 6, padding: "6px 12px", fontSize: "0.8rem", color: "#92400e" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 13 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600 }, children: [
          records.length,
          " substance",
          records.length !== 1 ? "s" : "",
          " assessed"
        ] }),
        overdueReviews > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          " — ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: overdueReviews }),
          " review",
          overdueReviews !== 1 ? "s" : "",
          " overdue"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 13, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search substances…", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8 w-56" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add COSHH Record"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No COSHH records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record COSHH assessments for all hazardous substances used on the farm — pesticides, diesel, oils, cleaning agents and veterinary chemicals." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", tableLayout: "fixed" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("colgroup", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "12%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "9%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "11%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "9%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "9%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "8%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "10%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "10%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "15%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("col", { style: { width: "7%" } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Substance", "Manufacturer", "Hazard Classification", "Usage Area", "Storage", "Assessed By", "Assessment Date", "Review Due", "PPE Required", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", verticalAlign: "bottom" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => {
        const reviewOverdue = r.reviewDate && new Date(r.reviewDate) < /* @__PURE__ */ new Date();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { ref: (el) => {
          if (el) rowRefs.current.set(r.id, el);
        }, style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none", background: hlId === r.id ? "#fffbeb" : void 0, outline: hlId === r.id ? "2px solid #f59e0b" : void 0, outlineOffset: hlId === r.id ? -2 : void 0, transition: "background 0.5s" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, verticalAlign: "top", wordBreak: "break-word" }, children: r.substanceName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", verticalAlign: "top", wordBreak: "break-word" }, children: r.manufacturer || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", verticalAlign: "top" }, children: r.hazardClassification ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.7rem", whiteSpace: "normal", textAlign: "left" }, children: r.hazardClassification }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", verticalAlign: "top", wordBreak: "break-word" }, children: r.usageArea || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", verticalAlign: "top", wordBreak: "break-word" }, children: r.storageLocation || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", verticalAlign: "top", wordBreak: "break-word" }, children: r.assessedBy || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", verticalAlign: "top", whiteSpace: "nowrap" }, children: fmt(r.assessmentDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", verticalAlign: "top", whiteSpace: "nowrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: reviewOverdue ? "#991b1b" : "#6b7280", fontWeight: reviewOverdue ? 600 : 400 }, children: [
            reviewOverdue && "⚠ ",
            fmt(r.reviewDate)
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.75rem", verticalAlign: "top", wordBreak: "break-word" }, children: r.ppe || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem", verticalAlign: "top" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-4 h-4 text-amber-600" }),
        viewRecord.substanceName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-3", children: [
          viewRecord.manufacturer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Manufacturer / Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.manufacturer })
          ] }),
          viewRecord.hazardClassification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Hazard Classification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.7rem" }, children: viewRecord.hazardClassification }) })
          ] }),
          viewRecord.usageArea && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Usage Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.usageArea })
          ] }),
          viewRecord.storageLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Storage Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.storageLocation })
          ] }),
          viewRecord.assessedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Assessed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.assessedBy })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Assessment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewRecord.assessmentDate) })
          ] }),
          viewRecord.reviewDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-0.5", children: "Review Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: viewRecord.reviewDate && new Date(viewRecord.reviewDate) < /* @__PURE__ */ new Date() ? "text-red-600 font-medium" : "", children: fmt(viewRecord.reviewDate) })
          ] })
        ] }),
        viewRecord.ppe && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "PPE Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.ppe })
        ] }),
        viewRecord.controlMeasures && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.controlMeasures })
        ] }),
        viewRecord.emergencyProcedures && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Emergency Procedures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.emergencyProcedures })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setViewRecord(null);
          openEdit(viewRecord);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-4 h-4 text-amber-600" }),
        editRecord ? "Edit COSHH Record" : "New COSHH Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Substance Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Glyphosate 360 g/L", value: form.substanceName, onChange: (e) => setForm((f) => ({ ...f, substanceName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manufacturer / Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Monsanto", value: form.manufacturer, onChange: (e) => setForm((f) => ({ ...f, manufacturer: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hazard Classification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.hazardClassification, onValueChange: (v) => setForm((f) => ({ ...f, hazardClassification: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select classification…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HAZARD_CLASSIFICATIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Usage Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Arable crops, spray season", value: form.usageArea, onChange: (e) => setForm((f) => ({ ...f, usageArea: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Chemical store, locked cabinet", value: form.storageLocation, onChange: (e) => setForm((f) => ({ ...f, storageLocation: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Engineering controls, ventilation, safe handling procedures…", value: form.controlMeasures, onChange: (e) => setForm((f) => ({ ...f, controlMeasures: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PPE Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Nitrile gloves, goggles, half-face respirator (A/P filter)", value: form.ppe, onChange: (e) => setForm((f) => ({ ...f, ppe: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Emergency Procedures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Spillage, first aid, emergency contacts…", value: form.emergencyProcedures, onChange: (e) => setForm((f) => ({ ...f, emergencyProcedures: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessedBy, onChange: (e) => setForm((f) => ({ ...f, assessedBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Assessment Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate, onChange: (e) => setForm((f) => ({ ...f, assessmentDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.reviewDate, onChange: (e) => setForm((f) => ({ ...f, reviewDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "SDS sheet location, disposal instructions…", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(form), disabled: !form.substanceName || !form.assessmentDate || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete COSHH Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this COSHH record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function DocCell({ endpoint, queryKey, documentPath, documentName }) {
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  async function handleFile(file) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const fileName = objectPath.split("/").pop() ?? file.name;
      await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey });
    } finally {
      setUploading(false);
    }
  }
  async function handleRemove() {
    await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: null, documentName: null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${documentPath}`, target: "_blank", rel: "noopener noreferrer", title: documentName || "View document", className: "flex items-center text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-3.5 w-3.5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleRemove, title: "Remove document", className: "text-gray-300 hover:text-gray-500 p-1 leading-none", style: { background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }, children: "×" })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: ".pdf,.jpg,.jpeg,.png", className: "hidden", onChange: (e) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    } }),
    uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => fileRef.current?.click(), title: "Attach certificate copy", className: "text-gray-300 hover:text-gray-500 p-1", style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3.5 w-3.5" }) })
  ] }) });
}
const PAT_RESULT = {
  pass: { label: "Pass", colour: "bg-green-100 text-green-700" },
  fail: { label: "Fail", colour: "bg-red-100 text-red-700" },
  advisory: { label: "Advisory", colour: "bg-amber-100 text-amber-700" }
};
const PAT_DISPOSAL_REASONS = [
  { value: "end_of_life", label: "End of life / No longer required" },
  { value: "beyond_repair", label: "Beyond economical repair" },
  { value: "sold", label: "Sold / Transferred" },
  { value: "condemned", label: "Condemned by tester" },
  { value: "other", label: "Other" }
];
const EMPTY_PAT_EQUIPMENT = {
  buildingId: "",
  subLocation: "",
  location: "",
  itemName: "",
  description: "",
  make: "",
  model: "",
  serialNumber: "",
  status: "active",
  disposalDate: "",
  disposalReason: "",
  disposalNotes: "",
  notes: ""
};
const EMPTY_PAT_TEST = {
  testDate: "",
  testerName: "",
  testerCompany: "",
  certificateNumber: "",
  result: "pass",
  nextDueDate: "",
  notes: ""
};
function PatTestingTab({ farmId, openId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_PAT_EQUIPMENT);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [hlId, setHlId] = reactExports.useState(openId ?? null);
  const [buildingFilter, setBuildingFilter] = usePersistedFilter({ page: "risk-pat-testing", filter: "building", farmId, defaultValue: "__all__" });
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [showTest, setShowTest] = reactExports.useState(false);
  const [editingTest, setEditingTest] = reactExports.useState(null);
  const [testingEqId, setTestingEqId] = reactExports.useState(null);
  const [testForm, setTestForm] = reactExports.useState(EMPTY_PAT_TEST);
  const [deleteTestId, setDeleteTestId] = reactExports.useState(null);
  const [printLabelEq, setPrintLabelEq] = reactExports.useState(null);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  function handlePrintLabel(eq) {
    const el = document.getElementById("pat-label-print-area");
    if (!el) return;
    const style = document.createElement("style");
    style.id = "__pat-print-style";
    style.textContent = `@media print { body > *:not(#pat-label-print-area) { display: none !important; } #pat-label-print-area { display: flex !important; position: fixed; inset: 0; background: #fff; align-items: center; justify-content: center; z-index: 99999; } }`;
    document.head.appendChild(style);
    setPrintLabelEq(eq);
    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
      setPrintLabelEq(null);
    }, 80);
  }
  const { data, isLoading } = useQuery({
    queryKey: ["pat-equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/workshop/pat-equipment`, { credentials: "include" }).then((r) => r.json())
  });
  const { data: locData } = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`, { credentials: "include" }).then((r) => r.json())
  });
  const farmLocations = (locData ?? []).filter((l) => l.isActive);
  const { data: testData } = useQuery({
    queryKey: ["pat-test-records", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/workshop/pat-equipment/${expandedId}/tests`, { credentials: "include" }).then((r) => r.json()),
    enabled: expandedId !== null
  });
  const expandedTests = testData?.records ?? [];
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/workshop/pat-equipment`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, buildingId: body.buildingId ? parseInt(body.buildingId) : null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pat-equipment", farmId] });
      setShowForm(false);
      setForm(EMPTY_PAT_EQUIPMENT);
      toast({ title: "Appliance added" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/workshop/pat-equipment/${editing.id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, buildingId: body.buildingId ? parseInt(body.buildingId) : null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pat-equipment", farmId] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_PAT_EQUIPMENT);
      toast({ title: "Appliance updated" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/workshop/pat-equipment/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pat-equipment", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const createTestMut = useMutation({
    mutationFn: ({ eqId, body }) => fetch(`/api/farms/${farmId}/workshop/pat-equipment/${eqId}/tests`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { eqId }) => {
      qc.invalidateQueries({ queryKey: ["pat-test-records", farmId, eqId] });
      qc.invalidateQueries({ queryKey: ["pat-equipment", farmId] });
      setShowTest(false);
      setEditingTest(null);
      setTestForm(EMPTY_PAT_TEST);
      toast({ title: "Test record saved" });
    },
    onError: () => toast({ title: "Error saving test record", variant: "destructive" })
  });
  const updateTestMut = useMutation({
    mutationFn: ({ eqId, testId, body }) => fetch(`/api/farms/${farmId}/workshop/pat-equipment/${eqId}/tests/${testId}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { eqId }) => {
      qc.invalidateQueries({ queryKey: ["pat-test-records", farmId, eqId] });
      qc.invalidateQueries({ queryKey: ["pat-equipment", farmId] });
      setShowTest(false);
      setEditingTest(null);
      setTestForm(EMPTY_PAT_TEST);
      toast({ title: "Test record updated" });
    },
    onError: () => toast({ title: "Error saving test record", variant: "destructive" })
  });
  const deleteTestMut = useMutation({
    mutationFn: ({ eqId, testId }) => fetch(`/api/farms/${farmId}/workshop/pat-equipment/${eqId}/tests/${testId}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { eqId }) => {
      qc.invalidateQueries({ queryKey: ["pat-test-records", farmId, eqId] });
      qc.invalidateQueries({ queryKey: ["pat-equipment", farmId] });
      setDeleteTestId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({
      buildingId: r.buildingId ? String(r.buildingId) : "",
      subLocation: r.subLocation ?? "",
      location: r.location ?? "",
      itemName: r.itemName,
      description: r.description ?? "",
      make: r.make ?? "",
      model: r.model ?? "",
      serialNumber: r.serialNumber ?? "",
      status: r.status ?? "active",
      disposalDate: r.disposalDate ? r.disposalDate.slice(0, 10) : "",
      disposalReason: r.disposalReason ?? "",
      disposalNotes: r.disposalNotes ?? "",
      notes: r.notes ?? ""
    });
    setShowForm(true);
  }
  function openLogTest(eqId, tst) {
    setTestingEqId(eqId);
    if (tst) {
      setEditingTest(tst);
      setTestForm({ testDate: tst.testDate.slice(0, 10), testerName: tst.testerName ?? "", testerCompany: tst.testerCompany ?? "", certificateNumber: tst.certificateNumber ?? "", result: tst.result, nextDueDate: tst.nextDueDate ? tst.nextDueDate.slice(0, 10) : "", notes: tst.notes ?? "" });
    } else {
      setEditingTest(null);
      setTestForm(EMPTY_PAT_TEST);
    }
    setShowTest(true);
  }
  function handleTestDateChange(v) {
    const updated = { ...testForm, testDate: v };
    if (v) {
      const d = new Date(v);
      d.setFullYear(d.getFullYear() + 1);
      updated.nextDueDate = d.toISOString().slice(0, 10);
    }
    setTestForm(updated);
  }
  function handleTestSubmit(e) {
    e.preventDefault();
    const eqId = testingEqId;
    if (editingTest) {
      updateTestMut.mutate({ eqId, testId: editingTest.id, body: testForm });
    } else {
      createTestMut.mutate({ eqId, body: testForm });
    }
  }
  const today = /* @__PURE__ */ new Date();
  const allRecords = data?.records ?? [];
  const activeRecords = allRecords.filter((r) => (r.status ?? "active") === "active");
  const records = buildingFilter === "__all__" ? allRecords : buildingFilter === "__none__" ? allRecords.filter((r) => !r.buildingId) : allRecords.filter((r) => r.buildingId === parseInt(buildingFilter));
  const overdue = activeRecords.filter((r) => r.nextTestDue && new Date(r.nextTestDue) < today).length;
  const dueSoon = activeRecords.filter((r) => {
    if (!r.nextTestDue) return false;
    const d = new Date(r.nextTestDue);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 864e5);
    return diff >= 0 && diff <= 60;
  }).length;
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || allRecords.length === 0) return;
    const target = allRecords.find((r) => r.id === openId);
    if (target) {
      autoOpened.current = true;
      setExpandedId(openId);
      setTimeout(() => {
        rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [openId, allRecords]);
  const usingBuildingPicker = !!form.buildingId;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto text-gray-400" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Register all electrical appliances on the holding that require Portable Appliance Testing. Log annual test records with certificates year-on-year. Required under the Electricity at Work Regulations 1989 and Health & Safety at Work Act 1974." }),
        overdue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-600 font-medium mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          " ",
          overdue,
          " item",
          overdue !== 1 ? "s" : "",
          " overdue for PAT test"
        ] }),
        overdue === 0 && dueSoon > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 font-medium mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
          " ",
          dueSoon,
          " item",
          dueSoon !== 1 ? "s" : "",
          " due for PAT test within 60 days"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm(EMPTY_PAT_EQUIPMENT);
        setShowForm(true);
      }, className: "gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Add Appliance"
      ] })
    ] }),
    allRecords.length > 0 && farmLocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 whitespace-nowrap", children: "Filter by location:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: buildingFilter, onValueChange: setBuildingFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "__all__", children: [
            "All locations (",
            allRecords.length,
            ")"
          ] }),
          farmLocations.filter((l) => allRecords.some((r) => r.buildingId === l.id)).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(l.id), children: [
            l.name,
            " (",
            allRecords.filter((r) => r.buildingId === l.id).length,
            ")"
          ] }, l.id)),
          allRecords.some((r) => !r.buildingId) && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "__none__", children: [
            "No building linked (",
            allRecords.filter((r) => !r.buildingId).length,
            ")"
          ] })
        ] })
      ] })
    ] }),
    allRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-gray-400 text-sm", children: "No appliances registered yet. Add each item that requires annual PAT testing to start tracking compliance." }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No appliances at this location." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Item / Appliance", "Location", "Make / Model", "Serial No.", "Status", "Last Test", "Next Test Due", "Test History", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => {
        const due = r.nextTestDue ? new Date(r.nextTestDue) : null;
        const isOverdue2 = due && due < today;
        const diff = due ? Math.ceil((due.getTime() - today.getTime()) / 864e5) : null;
        const isSoon = diff !== null && diff >= 0 && diff <= 60;
        const displayLocation = r.buildingName ? r.subLocation ? `${r.buildingName} — ${r.subLocation}` : r.buildingName : r.location || null;
        const isDisposed = (r.status ?? "active") === "disposed";
        const isExpanded = expandedId === r.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { ref: (el) => {
            if (el) rowRefs.current.set(r.id, el);
          }, className: cn("transition-colors", hlId === r.id ? "bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : isDisposed ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                r.itemName,
                r.description ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400 font-normal", children: r.description }) : null
              ] }),
              r.assetNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-violet-50 text-violet-700 border border-violet-200 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-2.5 w-2.5" }),
                r.assetNumber
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-500 text-xs", children: displayLocation || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-500 text-xs", children: [r.make, r.model].filter(Boolean).join(" ") || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-mono text-xs text-gray-500", children: r.serialNumber || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600", children: [
              "Disposed",
              r.disposalDate ? ` · ${new Date(r.disposalDate).toLocaleDateString("en-GB")}` : ""
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: "Active" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-500 text-xs", children: r.lastTestDate ? new Date(r.lastTestDate).toLocaleDateString("en-GB") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" }) : due ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("text-xs font-medium", isOverdue2 ? "text-red-600" : isSoon ? "text-amber-600" : "text-gray-600"), children: [
              (isOverdue2 || isSoon) && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3 inline mr-1" }),
              due.toLocaleDateString("en-GB")
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpandedId(isExpanded ? null : r.id), className: "flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium", children: [
              isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" }),
              "View"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              !isDisposed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-xs h-7 px-2 gap-1", onClick: () => {
                setExpandedId(r.id);
                openLogTest(r.id);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                "Log Test"
              ] }),
              r.assetNumber && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Print QR label", onClick: () => handlePrintLabel(r), className: "text-violet-600 hover:text-violet-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
            ] }) })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, className: "bg-blue-50 border-b px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-blue-900 uppercase tracking-wide", children: [
                "PAT Test History — ",
                r.itemName,
                r.make || r.model ? ` (${[r.make, r.model].filter(Boolean).join(" ")})` : ""
              ] }),
              !isDisposed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1 h-7", onClick: () => openLogTest(r.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                "Log Test"
              ] })
            ] }),
            expandedTests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No test records yet. Click Log Test to add the first annual PAT certificate." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded border bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Test Date", "Tester Name", "Tester Company", "Cert No.", "Result", "Next Due", "Certificate", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: h }, h)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: expandedTests.map((tst) => {
                const tRes = PAT_RESULT[tst.result] ?? { label: tst.result, colour: "bg-gray-100 text-gray-600" };
                const tDue = tst.nextDueDate ? new Date(tst.nextDueDate) : null;
                const tOverdue = tDue && tDue < today;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium whitespace-nowrap", children: new Date(tst.testDate).toLocaleDateString("en-GB") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: tst.testerName || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: tst.testerCompany || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-gray-500", children: tst.certificateNumber || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tRes.colour}`, children: tRes.label }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: tDue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("text-xs font-medium", tOverdue ? "text-red-600" : "text-gray-600"), children: [
                    tOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3 inline mr-1" }),
                    tDue.toLocaleDateString("en-GB")
                  ] }) : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DocCell,
                    {
                      endpoint: `/api/farms/${farmId}/workshop/pat-equipment/${r.id}/tests/${tst.id}/document`,
                      queryKey: ["pat-test-records", farmId, r.id],
                      documentPath: tst.documentPath,
                      documentName: tst.documentName
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openLogTest(r.id, tst), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteTestId({ testId: tst.id, eqId: r.id }), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
                  ] }) })
                ] }, tst.id);
              }) })
            ] }) })
          ] }) }) })
        ] }, r.id);
      }) })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Appliance" : "Add Appliance" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        editing ? updateMut.mutate(form) : createMut.mutate(form);
      }, className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Item / Appliance Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.itemName, onChange: (e) => setForm((f) => ({ ...f, itemName: e.target.value })), placeholder: "e.g. Angle Grinder, Extension Lead, Welder, Kettle" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.description, onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })), placeholder: "e.g. 9-inch angle grinder used for cutting metal" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Make" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.make, onChange: (e) => setForm((f) => ({ ...f, make: e.target.value })), placeholder: "e.g. Bosch, Dewalt, Makita" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.model, onChange: (e) => setForm((f) => ({ ...f, model: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serialNumber, onChange: (e) => setForm((f) => ({ ...f, serialNumber: e.target.value })), className: "font-mono" })
          ] }),
          farmLocations.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Building / Area" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.buildingId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, buildingId: v === "__none__" ? "" : v, location: "" })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a farm building or area…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Manual entry (no building selected) —" }),
                  farmLocations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(l.id), children: l.name }, l.id))
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Select from your Farm Buildings & Areas register." })
            ] }),
            usingBuildingPicker ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Workstation / Position" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.subLocation, onChange: (e) => setForm((f) => ({ ...f, subLocation: e.target.value })), placeholder: "e.g. Left workbench, Tool rack, Under the desk" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Exact position — helps PAT testers locate the item without a floor plan." })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.location, onChange: (e) => setForm((f) => ({ ...f, location: e.target.value })), placeholder: "e.g. Main workshop, Farm office, Grain store" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.location, onChange: (e) => setForm((f) => ({ ...f, location: e.target.value })), placeholder: "e.g. Main workshop, Farm office, Grain store" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Add buildings in Farm Buildings & Areas to enable the structured building picker here." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active — requires annual PAT testing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "disposed", children: "Disposed / Removed from service" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Mark as Disposed when the item is no longer on the holding. The record is retained for audit." })
          ] }),
          form.status === "disposed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.disposalDate, onChange: (e) => setForm((f) => ({ ...f, disposalDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.disposalReason || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, disposalReason: v === "__none__" ? "" : v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reason…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select reason —" }),
                  PAT_DISPOSAL_REASONS.map((dr) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: dr.value, children: dr.label }, dr.value))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.disposalNotes, onChange: (e) => setForm((f) => ({ ...f, disposalNotes: e.target.value })), rows: 2 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setShowForm(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMut.isPending || updateMut.isPending, children: editing ? "Save Changes" : "Add Appliance" })
        ] })
      ] })
    ] }) }),
    showTest && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowTest(false);
        setEditingTest(null);
        createTestMut.reset();
        updateTestMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingTest ? "Edit Test Record" : "Log PAT Test" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleTestSubmit, className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "date", value: testForm.testDate, onChange: (e) => handleTestDateChange(e.target.value), max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: testForm.result, onValueChange: (v) => setTestForm((f) => ({ ...f, result: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass — safe to use" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "advisory", children: "Advisory — minor issues noted" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail — condemned / do not use" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tester Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: testForm.testerName, onChange: (e) => setTestForm((f) => ({ ...f, testerName: e.target.value })), placeholder: "e.g. John Smith" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tester Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["pat_testing_company"],
                valueId: null,
                valueName: testForm.testerCompany,
                onChange: (_, name) => setTestForm((f) => ({ ...f, testerCompany: name })),
                typeLabel: "PAT Testing Company",
                placeholder: "Search or add company…"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Draws from Trade Contacts. Type a new name to add inline." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: testForm.certificateNumber, onChange: (e) => setTestForm((f) => ({ ...f, certificateNumber: e.target.value })), className: "font-mono", placeholder: "e.g. PAT-2024-00123" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: testForm.nextDueDate, onChange: (e) => setTestForm((f) => ({ ...f, nextDueDate: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Auto-filled to +1 year from the test date. Override if different." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: testForm.notes, onChange: (e) => setTestForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "e.g. All sockets tested. Earth continuity verified on power tools." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "After saving, use the paperclip icon on the test row to attach a copy of the PAT certificate." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createTestMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateTestMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setShowTest(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createTestMut.isPending || updateTestMut.isPending, children: editingTest ? "Save Changes" : "Log Test" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Appliance?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "This will permanently remove this appliance and all its PAT test records. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteTestId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteTestId(null);
        deleteTestMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Test Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "This will permanently remove this PAT test entry. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteTestMut, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteTestId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteTestId && deleteTestMut.mutate(deleteTestId), disabled: deleteTestMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "pat-label-print-area", style: { display: "none" }, children: printLabelEq && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, border: "2.5px solid #7c3aed", borderRadius: 14, background: "#fff", minWidth: 210 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 10 }, children: "BDE Farm Trac — PAT Equipment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { value: `BDE:F${farmId}:${printLabelEq.assetNumber}`, size: 160, level: "M", includeMargin: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 17, fontWeight: 700, fontFamily: "monospace", letterSpacing: 2, marginTop: 10, color: "#1e1e2e" }, children: printLabelEq.assetNumber }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#1e1e2e", marginTop: 5, textAlign: "center" }, children: printLabelEq.itemName }),
      (printLabelEq.make || printLabelEq.model) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#555", marginTop: 3 }, children: [printLabelEq.make, printLabelEq.model].filter(Boolean).join(" ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 9, color: "#999", marginTop: 8, textAlign: "center" }, children: "Scan with BDE Farm Trac app to log PAT test" })
    ] }) })
  ] });
}
const FIRE_TYPES = [
  { value: "co2", label: "CO₂ (Red/Black) — electrical fires" },
  { value: "dry_powder", label: "Dry Powder (Red/Blue) — general purpose" },
  { value: "water", label: "Water (Red) — paper/wood fires" },
  { value: "foam", label: "Foam (Red/Cream) — liquid fires" },
  { value: "wet_chemical", label: "Wet Chemical (Red/Yellow) — cooking oils" }
];
const FIRE_TYPE_LABEL = { co2: "CO₂", dry_powder: "Dry Powder", water: "Water", foam: "Foam", wet_chemical: "Wet Chemical" };
const SERVICE_TYPES = [
  { value: "annual_check", label: "Annual Check" },
  { value: "5yr_discharge", label: "5-Year Discharge Test" },
  { value: "interim_check", label: "Interim Check" },
  { value: "extended", label: "Extended Service" },
  { value: "commissioning", label: "Commissioning / New Install" }
];
const SERVICE_TYPE_LABEL = { annual_check: "Annual Check", "5yr_discharge": "5-Yr Discharge", interim_check: "Interim Check", extended: "Extended", commissioning: "Commissioning" };
const DISPOSAL_REASONS = [
  { value: "end_of_life", label: "End of life / Manufacturer limit reached" },
  { value: "failed_test", label: "Failed service / Condemned by engineer" },
  { value: "damaged", label: "Damaged or discharged" },
  { value: "replaced", label: "Replaced with new unit" },
  { value: "other", label: "Other" }
];
const SVC_RESULT = {
  pass: { label: "Pass", colour: "bg-green-100 text-green-700" },
  advisory: { label: "Advisory", colour: "bg-amber-100 text-amber-700" },
  fail: { label: "Fail", colour: "bg-red-100 text-red-700" }
};
const EMPTY_FIRE = {
  buildingId: "",
  subLocation: "",
  location: "",
  type: "co2",
  capacityKg: "",
  serialNumber: "",
  lastServiceDate: "",
  engineerName: "",
  engineerCompany: "",
  nextServiceDue: "",
  status: "active",
  disposalDate: "",
  disposalReason: "",
  disposalNotes: "",
  notes: ""
};
const EMPTY_SERVICE = {
  serviceDate: "",
  serviceType: "annual_check",
  engineerName: "",
  engineerCompany: "",
  certificateNumber: "",
  result: "pass",
  nextServiceDue: "",
  notes: ""
};
function FireSafetyTab({ farmId, openId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_FIRE);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [hlId, setHlId] = reactExports.useState(openId ?? null);
  const [buildingFilter, setBuildingFilter] = usePersistedFilter({ page: "risk-fire-safety", filter: "building", farmId, defaultValue: "__all__" });
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [showService, setShowService] = reactExports.useState(false);
  const [editingService, setEditingService] = reactExports.useState(null);
  const [servicingExtId, setServicingExtId] = reactExports.useState(null);
  const [serviceForm, setServiceForm] = reactExports.useState(EMPTY_SERVICE);
  const [deleteServiceId, setDeleteServiceId] = reactExports.useState(null);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const { data, isLoading } = useQuery({
    queryKey: ["fire-extinguishers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers`, { credentials: "include" }).then((r) => r.json())
  });
  const { data: locData } = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`, { credentials: "include" }).then((r) => r.json())
  });
  const farmLocations = (locData ?? []).filter((l) => l.isActive);
  const { data: svcData } = useQuery({
    queryKey: ["fire-extinguisher-services", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${expandedId}/services`, { credentials: "include" }).then((r) => r.json()),
    enabled: expandedId !== null
  });
  const expandedServices = svcData?.records ?? [];
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, buildingId: body.buildingId ? parseInt(body.buildingId) : null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] });
      setShowForm(false);
      setForm(EMPTY_FIRE);
      toast({ title: "Extinguisher added" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${editing.id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, buildingId: body.buildingId ? parseInt(body.buildingId) : null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FIRE);
      toast({ title: "Extinguisher updated" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const createServiceMut = useMutation({
    mutationFn: ({ extId, body }) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${extId}/services`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { extId }) => {
      qc.invalidateQueries({ queryKey: ["fire-extinguisher-services", farmId, extId] });
      qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] });
      setShowService(false);
      setEditingService(null);
      setServiceForm(EMPTY_SERVICE);
      toast({ title: "Service record saved" });
    },
    onError: () => toast({ title: "Error saving service record", variant: "destructive" })
  });
  const updateServiceMut = useMutation({
    mutationFn: ({ extId, svcId, body }) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${extId}/services/${svcId}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { extId }) => {
      qc.invalidateQueries({ queryKey: ["fire-extinguisher-services", farmId, extId] });
      qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] });
      setShowService(false);
      setEditingService(null);
      setServiceForm(EMPTY_SERVICE);
      toast({ title: "Service record updated" });
    },
    onError: () => toast({ title: "Error saving service record", variant: "destructive" })
  });
  const deleteServiceMut = useMutation({
    mutationFn: ({ extId, svcId }) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${extId}/services/${svcId}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { extId }) => {
      qc.invalidateQueries({ queryKey: ["fire-extinguisher-services", farmId, extId] });
      qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] });
      setDeleteServiceId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({
      buildingId: r.buildingId ? String(r.buildingId) : "",
      subLocation: r.subLocation ?? "",
      location: r.location,
      type: r.type,
      capacityKg: r.capacityKg ?? "",
      serialNumber: r.serialNumber ?? "",
      lastServiceDate: r.lastServiceDate ? r.lastServiceDate.slice(0, 10) : "",
      engineerName: r.engineerName ?? "",
      engineerCompany: r.engineerCompany ?? "",
      nextServiceDue: r.nextServiceDue ? r.nextServiceDue.slice(0, 10) : "",
      status: r.status ?? "active",
      disposalDate: r.disposalDate ? r.disposalDate.slice(0, 10) : "",
      disposalReason: r.disposalReason ?? "",
      disposalNotes: r.disposalNotes ?? "",
      notes: r.notes ?? ""
    });
    setShowForm(true);
  }
  function openLogService(extId, svc) {
    setServicingExtId(extId);
    if (svc) {
      setEditingService(svc);
      setServiceForm({
        serviceDate: svc.serviceDate.slice(0, 10),
        serviceType: svc.serviceType,
        engineerName: svc.engineerName ?? "",
        engineerCompany: svc.engineerCompany ?? "",
        certificateNumber: svc.certificateNumber ?? "",
        result: svc.result,
        nextServiceDue: svc.nextServiceDue ? svc.nextServiceDue.slice(0, 10) : "",
        notes: svc.notes ?? ""
      });
    } else {
      setEditingService(null);
      setServiceForm(EMPTY_SERVICE);
    }
    setShowService(true);
  }
  function handleServiceDateChange(v) {
    const updated = { ...serviceForm, serviceDate: v };
    if (v) {
      const d = new Date(v);
      if (serviceForm.serviceType === "annual_check" || serviceForm.serviceType === "commissioning") {
        d.setFullYear(d.getFullYear() + 1);
        updated.nextServiceDue = d.toISOString().slice(0, 10);
      } else if (serviceForm.serviceType === "5yr_discharge") {
        d.setFullYear(d.getFullYear() + 5);
        updated.nextServiceDue = d.toISOString().slice(0, 10);
      }
    }
    setServiceForm(updated);
  }
  function handleServiceTypeChange(v) {
    const updated = { ...serviceForm, serviceType: v };
    if (serviceForm.serviceDate) {
      const d = new Date(serviceForm.serviceDate);
      if (v === "annual_check" || v === "commissioning") {
        d.setFullYear(d.getFullYear() + 1);
        updated.nextServiceDue = d.toISOString().slice(0, 10);
      } else if (v === "5yr_discharge") {
        d.setFullYear(d.getFullYear() + 5);
        updated.nextServiceDue = d.toISOString().slice(0, 10);
      }
    }
    setServiceForm(updated);
  }
  function handleServiceSubmit(e) {
    e.preventDefault();
    const extId = servicingExtId;
    if (editingService) {
      updateServiceMut.mutate({ extId, svcId: editingService.id, body: serviceForm });
    } else {
      createServiceMut.mutate({ extId, body: serviceForm });
    }
  }
  const today = /* @__PURE__ */ new Date();
  const allRecords = data?.records ?? [];
  const activeRecords = allRecords.filter((r) => (r.status ?? "active") === "active");
  const records = buildingFilter === "__all__" ? allRecords : buildingFilter === "__none__" ? allRecords.filter((r) => !r.buildingId) : allRecords.filter((r) => r.buildingId === parseInt(buildingFilter));
  const overdue = activeRecords.filter((r) => r.nextServiceDue && new Date(r.nextServiceDue) < today).length;
  const dueSoon = activeRecords.filter((r) => {
    if (!r.nextServiceDue) return false;
    const d = new Date(r.nextServiceDue);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 864e5);
    return diff >= 0 && diff <= 60;
  }).length;
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || allRecords.length === 0) return;
    const target = allRecords.find((r) => r.id === openId);
    if (target) {
      autoOpened.current = true;
      setExpandedId(openId);
      setTimeout(() => {
        rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [openId, allRecords]);
  const usingBuildingPicker = !!form.buildingId;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto text-gray-400" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Register all fire extinguishers on the holding. Required under the Regulatory Reform (Fire Safety) Order 2005. Extinguishers must be serviced annually by a competent person." }),
        overdue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-600 font-medium mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          " ",
          overdue,
          " extinguisher",
          overdue !== 1 ? "s" : "",
          " overdue for service"
        ] }),
        overdue === 0 && dueSoon > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 font-medium mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
          " ",
          dueSoon,
          " extinguisher",
          dueSoon !== 1 ? "s" : "",
          " due for service within 60 days"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm(EMPTY_FIRE);
        setShowForm(true);
      }, className: "gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Add Extinguisher"
      ] })
    ] }),
    allRecords.length > 0 && farmLocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 whitespace-nowrap", children: "Filter by location:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: buildingFilter, onValueChange: setBuildingFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "__all__", children: [
            "All locations (",
            allRecords.length,
            ")"
          ] }),
          farmLocations.filter((l) => allRecords.some((r) => r.buildingId === l.id)).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(l.id), children: [
            l.name,
            " (",
            allRecords.filter((r) => r.buildingId === l.id).length,
            ")"
          ] }, l.id)),
          allRecords.some((r) => !r.buildingId) && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "__none__", children: [
            "No building linked (",
            allRecords.filter((r) => !r.buildingId).length,
            ")"
          ] })
        ] })
      ] })
    ] }),
    allRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-gray-400 text-sm", children: "No extinguishers registered yet. Add each extinguisher on the holding to track annual service dates." }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No extinguishers at this location." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Building / Location", "Position", "Type", "Cap.", "Serial No.", "Status", "Next Service Due", "Service Log", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => {
        const due = r.nextServiceDue ? new Date(r.nextServiceDue) : null;
        const isOverdue2 = due && due < today;
        const diff = due ? Math.ceil((due.getTime() - today.getTime()) / 864e5) : null;
        const isSoon = diff !== null && diff >= 0 && diff <= 60;
        const displayBuilding = r.buildingName ?? r.location;
        const isDisposed = (r.status ?? "active") === "disposed";
        const isExpanded = expandedId === r.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { ref: (el) => {
            if (el) rowRefs.current.set(r.id, el);
          }, className: cn("transition-colors", hlId === r.id ? "bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : isDisposed ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-medium", children: displayBuilding }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-500 text-xs", children: r.subLocation || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: FIRE_TYPE_LABEL[r.type] ?? r.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-500", children: r.capacityKg ? `${r.capacityKg} kg` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-mono text-xs text-gray-500", children: r.serialNumber || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600", children: [
              "Disposed",
              r.disposalDate ? ` · ${new Date(r.disposalDate).toLocaleDateString("en-GB")}` : ""
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: "Active" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" }) : due ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("text-xs font-medium", isOverdue2 ? "text-red-600" : isSoon ? "text-amber-600" : "text-gray-600"), children: [
              (isOverdue2 || isSoon) && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3 inline mr-1" }),
              due.toLocaleDateString("en-GB")
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpandedId(isExpanded ? null : r.id), className: "flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium", children: [
              isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" }),
              "View"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              !isDisposed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-xs h-7 px-2 gap-1", onClick: () => {
                setExpandedId(r.id);
                openLogService(r.id);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                "Service"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
            ] }) })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, className: "bg-blue-50 border-b px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-blue-900 uppercase tracking-wide", children: [
                "Service History — ",
                displayBuilding,
                r.subLocation ? ` · ${r.subLocation}` : "",
                " (",
                FIRE_TYPE_LABEL[r.type] ?? r.type,
                r.capacityKg ? `, ${r.capacityKg} kg` : "",
                ")"
              ] }),
              !isDisposed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1 h-7", onClick: () => openLogService(r.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                "Log Service"
              ] })
            ] }),
            expandedServices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No service records yet. Click Log Service to add the first entry." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded border bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Type", "Engineer", "Company", "Cert No.", "Result", "Next Due", "Certificate", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: h }, h)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: expandedServices.map((svc) => {
                const svcRes = SVC_RESULT[svc.result] ?? { label: svc.result, colour: "bg-gray-100 text-gray-600" };
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium whitespace-nowrap", children: new Date(svc.serviceDate).toLocaleDateString("en-GB") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600 whitespace-nowrap", children: SERVICE_TYPE_LABEL[svc.serviceType] ?? svc.serviceType }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: svc.engineerName || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: svc.engineerCompany || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-gray-500", children: svc.certificateNumber || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${svcRes.colour}`, children: svcRes.label }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap text-gray-600", children: svc.nextServiceDue ? new Date(svc.nextServiceDue).toLocaleDateString("en-GB") : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DocCell,
                    {
                      endpoint: `/api/farms/${farmId}/workshop/fire-extinguishers/${r.id}/services/${svc.id}/document`,
                      queryKey: ["fire-extinguisher-services", farmId, r.id],
                      documentPath: svc.documentPath,
                      documentName: svc.documentName
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openLogService(r.id, svc), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteServiceId({ svcId: svc.id, extId: r.id }), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
                  ] }) })
                ] }, svc.id);
              }) })
            ] }) })
          ] }) }) })
        ] }, r.id);
      }) })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Extinguisher" : "Add Fire Extinguisher" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        editing ? updateMut.mutate(form) : createMut.mutate(form);
      }, className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          farmLocations.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Building / Area *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.buildingId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, buildingId: v === "__none__" ? "" : v, location: "" })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a farm building or area…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Manual entry (no building registered) —" }),
                  farmLocations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(l.id), children: l.name }, l.id))
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Select from your Farm Buildings & Areas register, or choose manual entry." })
            ] }),
            usingBuildingPicker ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Position within building" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.subLocation, onChange: (e) => setForm((f) => ({ ...f, subLocation: e.target.value })), placeholder: "e.g. Near roller door, Left of main entrance, By welding bay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Describe the exact position so an engineer can locate it without a plan." })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: !usingBuildingPicker, value: form.location, onChange: (e) => setForm((f) => ({ ...f, location: e.target.value })), placeholder: "e.g. Main workshop entrance, Grain store office" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.location, onChange: (e) => setForm((f) => ({ ...f, location: e.target.value })), placeholder: "e.g. Main workshop entrance, Grain store" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Add buildings in Farm Buildings & Areas to enable the structured building picker here." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Extinguisher Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.type, onValueChange: (v) => setForm((f) => ({ ...f, type: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FIRE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.capacityKg, onChange: (e) => setForm((f) => ({ ...f, capacityKg: e.target.value })), placeholder: "e.g. 6" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serialNumber, onChange: (e) => setForm((f) => ({ ...f, serialNumber: e.target.value })), className: "font-mono" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Service Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastServiceDate, onChange: (e) => setForm((f) => ({ ...f, lastServiceDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Service Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextServiceDue, onChange: (e) => setForm((f) => ({ ...f, nextServiceDue: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Engineer Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.engineerName, onChange: (e) => setForm((f) => ({ ...f, engineerName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Engineer Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["fire_safety_company"],
                valueId: null,
                valueName: form.engineerCompany,
                onChange: (_, name) => setForm((f) => ({ ...f, engineerCompany: name })),
                typeLabel: "Fire Safety Company",
                placeholder: "Search or add company…"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Draws from Trade Contacts (type: Fire Safety Company). Type a new name to add it inline." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active — in service" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "disposed", children: "Disposed / Decommissioned" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Mark as Disposed when the extinguisher is removed from service. The record is retained for audit purposes." })
          ] }),
          form.status === "disposed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.disposalDate, onChange: (e) => setForm((f) => ({ ...f, disposalDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.disposalReason || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, disposalReason: v === "__none__" ? "" : v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reason…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select reason —" }),
                  DISPOSAL_REASONS.map((dr) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: dr.value, children: dr.label }, dr.value))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.disposalNotes, onChange: (e) => setForm((f) => ({ ...f, disposalNotes: e.target.value })), rows: 2, placeholder: "e.g. Replaced with new 6 kg CO₂ unit, serial ABC123" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setShowForm(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMut.isPending || updateMut.isPending, children: editing ? "Save Changes" : "Add Extinguisher" })
        ] })
      ] })
    ] }) }),
    showService && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowService(false);
        setEditingService(null);
        createServiceMut.reset();
        updateServiceMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingService ? "Edit Service Record" : "Log Service" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleServiceSubmit, className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Service Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "date", value: serviceForm.serviceDate, onChange: (e) => handleServiceDateChange(e.target.value), max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Service Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: serviceForm.serviceType, onValueChange: handleServiceTypeChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SERVICE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Engineer Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: serviceForm.engineerName, onChange: (e) => setServiceForm((f) => ({ ...f, engineerName: e.target.value })), placeholder: "e.g. John Smith" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Engineer Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["fire_safety_company"],
                valueId: null,
                valueName: serviceForm.engineerCompany,
                onChange: (_, name) => setServiceForm((f) => ({ ...f, engineerCompany: name })),
                typeLabel: "Fire Safety Company",
                placeholder: "Search or add company…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: serviceForm.certificateNumber, onChange: (e) => setServiceForm((f) => ({ ...f, certificateNumber: e.target.value })), className: "font-mono", placeholder: "e.g. FS-2024-00123" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: serviceForm.result, onValueChange: (v) => setServiceForm((f) => ({ ...f, result: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass — serviceable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "advisory", children: "Advisory — minor issues noted" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail — condemned / requires replacement" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Service Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: serviceForm.nextServiceDue, onChange: (e) => setServiceForm((f) => ({ ...f, nextServiceDue: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Auto-filled: +1 year for Annual Check / Commissioning, +5 years for Discharge Test. Override if different." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: serviceForm.notes, onChange: (e) => setServiceForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "e.g. Pressure checked and recharged. Minor corrosion on bracket noted." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "After saving, use the paperclip icon on the service row to attach a copy of the service certificate." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createServiceMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateServiceMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setShowService(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createServiceMut.isPending || updateServiceMut.isPending, children: editingService ? "Save Changes" : "Log Service" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Extinguisher?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "This will permanently remove this extinguisher and all its service records. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteServiceId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteServiceId(null);
        deleteServiceMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Service Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "This will permanently remove this service entry. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteServiceMut, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteServiceId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteServiceId && deleteServiceMut.mutate(deleteServiceId), disabled: deleteServiceMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function hsRptFmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function HsRptTable({ headers, rows }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", fontFamily: "system-ui, sans-serif" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f3f4f6" }, children: headers.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: row.map((cell, ci) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "7px 10px", color: "#374151", verticalAlign: "top" }, children: cell }, ci)) }, ri)) })
  ] }) });
}
function HsRptSection({ title, count, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 28 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontSize: "0.95rem", fontWeight: 700, color: "#991b1b", fontFamily: "system-ui, sans-serif", margin: "0 0 10px", borderBottom: "2px solid #fee2e2", paddingBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "baseline" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      count !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", fontWeight: 500, color: "#6b7280" }, children: [
        count,
        " record",
        count !== 1 ? "s" : ""
      ] })
    ] }),
    children
  ] });
}
function RiskPill({ level }) {
  const m = {
    critical: { bg: "#fee2e2", color: "#991b1b" },
    high: { bg: "#fef3c7", color: "#92400e" },
    medium: { bg: "#dbeafe", color: "#1e40af" },
    low: { bg: "#dcfce7", color: "#166534" }
  };
  const s = m[level] ?? { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color, fontSize: "0.7rem", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }, children: level });
}
function HsReportModal({ farmId, onClose }) {
  const farmQ = useQuery({ queryKey: ["farm-record", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()) });
  const raQ = useQuery({ queryKey: ["risk-assessments", farmId], queryFn: () => fetch(`/api/farms/${farmId}/risk-assessments`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const coshhQ = useQuery({ queryKey: ["risk-coshh", farmId], queryFn: () => fetch(`/api/farms/${farmId}/risk-coshh`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const patQ = useQuery({ queryKey: ["pat-equipment", farmId], queryFn: () => fetch(`/api/farms/${farmId}/workshop/pat-equipment`, { credentials: "include" }).then((r) => r.json()), select: (d) => d.records ?? [] });
  const fireQ = useQuery({ queryKey: ["fire-extinguishers", farmId], queryFn: () => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers`, { credentials: "include" }).then((r) => r.json()), select: (d) => d.records ?? [] });
  const farm = farmQ.data?.record;
  const risks = raQ.data ?? [];
  const coshh = coshhQ.data ?? [];
  const pats = patQ.data ?? [];
  const fires = fireQ.data ?? [];
  const isLoading = farmQ.isLoading || raQ.isLoading || coshhQ.isLoading || patQ.isLoading || fireQ.isLoading;
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const now = /* @__PURE__ */ new Date();
  const activeRisks = risks.filter((r) => r.status !== "archived").sort((a, b) => {
    const o = { critical: 0, high: 1, medium: 2, low: 3 };
    return (o[a.riskLevel ?? ""] ?? 4) - (o[b.riskLevel ?? ""] ?? 4);
  });
  const overdueRa = activeRisks.filter((r) => r.reviewDate && new Date(r.reviewDate) < now).length;
  const overdueCoShh = coshh.filter((r) => r.reviewDate && new Date(r.reviewDate) < now).length;
  const overduePat = pats.filter((r) => r.nextTestDue && new Date(r.nextTestDue) < now && r.status !== "disposed").length;
  const overdueFire = fires.filter((r) => r.nextServiceDue && new Date(r.nextServiceDue) < now).length;
  const printReport = () => {
    const contentEl = document.getElementById("hs-report-content");
    if (!contentEl) return;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>H&S Register — ${today}</title><style>* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #fff; font-family: system-ui, sans-serif; } @page { size: A4 portrait; margin: 12mm 15mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${contentEl.innerHTML}</body></html>`;
    const win = window.open("", "_blank", "width=980,height=760,toolbar=0,menubar=0,scrollbars=1");
    if (!win) {
      alert("Pop-ups are blocked — please allow pop-ups for this site to open the print dialog.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.addEventListener("load", () => {
      win.focus();
      win.addEventListener("afterprint", () => win.close());
      win.print();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, overflow: "auto", padding: "24px 16px 48px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", maxWidth: 960, margin: "0 auto", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 16, style: { color: "#991b1b" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#374151" }, children: "Health, Safety & Risk Register — Preview" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: printReport, disabled: isLoading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 13, className: "mr-1.5" }),
          "Print / Save PDF"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: onClose, children: "Close" })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "5rem", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 28, style: { margin: "0 auto 12px", animation: "spin 1s linear infinite", display: "block" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: "system-ui, sans-serif", fontSize: "0.875rem" }, children: "Loading H&S data…" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "hs-report-content", style: { padding: "36px 44px", fontFamily: "system-ui, sans-serif", fontSize: "0.875rem", color: "#111827", lineHeight: 1.6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderBottom: "3px solid #991b1b", paddingBottom: 18, marginBottom: 24 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 4 }, children: "BDE Farm Trac · Health, Safety & Risk Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0 0 4px" }, children: farm?.name ?? "—" }),
          farm?.address && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: farm.address })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", fontSize: "0.8rem", color: "#6b7280", flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, color: "#374151" }, children: "Report Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 4 }, children: today }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.68rem", color: "#9ca3af", maxWidth: 160 }, children: "For H&S inspection and Red Tractor assessment" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }, children: [
        { label: "Active risk assessments", value: activeRisks.length, accent: "#374151" },
        { label: "High / critical risks", value: activeRisks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length, accent: activeRisks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length > 0 ? "#b91c1c" : "#166534" },
        { label: "COSHH substances", value: coshh.length, accent: "#374151" },
        { label: "Items overdue", value: overdueRa + overdueCoShh + overduePat + overdueFire, accent: overdueRa + overdueCoShh + overduePat + overdueFire > 0 ? "#b91c1c" : "#166534" }
      ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: item.accent, lineHeight: 1 }, children: item.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.68rem", color: "#6b7280", marginTop: 4 }, children: item.label })
      ] }, item.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HsRptSection, { title: "1. Risk Assessment Register", count: activeRisks.length, children: activeRisks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontStyle: "italic", fontSize: "0.85rem" }, children: "No risk assessments recorded." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        HsRptTable,
        {
          headers: ["Title / Area", "Risk Level", "Hazard (summary)", "Control Measures (summary)", "Assessed By", "Date", "Review Due", "Status"],
          rows: activeRisks.map((r) => [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.title }),
              r.area ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.72rem" }, children: r.area })
              ] }) : null
            ] }),
            r.riskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx(RiskPill, { level: r.riskLevel }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.72rem" }, children: r.hazardDescription ? r.hazardDescription.length > 120 ? r.hazardDescription.slice(0, 117) + "…" : r.hazardDescription : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.72rem" }, children: r.controlMeasures ? r.controlMeasures.length > 120 ? r.controlMeasures.slice(0, 117) + "…" : r.controlMeasures : "—" }),
            r.assessedBy || "—",
            hsRptFmt(r.assessmentDate),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: r.reviewDate && new Date(r.reviewDate) < now ? "#991b1b" : "#374151", fontWeight: r.reviewDate && new Date(r.reviewDate) < now ? 600 : 400 }, children: [
              r.reviewDate && new Date(r.reviewDate) < now ? "⚠ " : "",
              hsRptFmt(r.reviewDate)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { textTransform: "capitalize", fontSize: "0.72rem" }, children: r.status?.replace("-", " ") || "—" })
          ])
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HsRptSection, { title: "2. COSHH Register", count: coshh.length, children: coshh.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontStyle: "italic", fontSize: "0.85rem" }, children: "No COSHH records logged." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        HsRptTable,
        {
          headers: ["Substance", "Manufacturer", "Hazard Classification", "Usage Area", "Storage", "PPE Required", "Assessed By", "Assess. Date", "Review Due"],
          rows: coshh.map((r) => [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.substanceName }),
            r.manufacturer || "—",
            r.hazardClassification || "—",
            r.usageArea || "—",
            r.storageLocation || "—",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: r.ppe || "—" }),
            r.assessedBy || "—",
            hsRptFmt(r.assessmentDate),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: r.reviewDate && new Date(r.reviewDate) < now ? "#991b1b" : "#374151", fontWeight: r.reviewDate && new Date(r.reviewDate) < now ? 600 : 400 }, children: [
              r.reviewDate && new Date(r.reviewDate) < now ? "⚠ " : "",
              hsRptFmt(r.reviewDate)
            ] })
          ])
        }
      ) }),
      (() => {
        const activePats = pats.filter((r) => (r.status ?? "active") === "active");
        const disposedPats = pats.filter((r) => r.status === "disposed");
        return /* @__PURE__ */ jsxRuntimeExports.jsx(HsRptSection, { title: "3. PAT Testing — Appliance Register", count: activePats.length, children: pats.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontStyle: "italic", fontSize: "0.85rem" }, children: "No PAT appliances registered." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          activePats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            HsRptTable,
            {
              headers: ["Item / Appliance", "Make / Model", "Location", "Last Test Date", "Tester", "Next Test Due"],
              rows: activePats.map((r) => {
                const overdue = r.nextTestDue && new Date(r.nextTestDue) < now;
                const displayLoc = r.buildingName ? r.subLocation ? `${r.buildingName} — ${r.subLocation}` : r.buildingName : r.location || "—";
                return [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.itemName }),
                  [r.make, r.model].filter(Boolean).join(" ") || "—",
                  displayLoc,
                  hsRptFmt(r.lastTestDate),
                  [r.testerName, r.testerCompany].filter(Boolean).join(", ") || "—",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: overdue ? "#991b1b" : "#374151", fontWeight: overdue ? 600 : 400 }, children: [
                    overdue ? "⚠ " : "",
                    hsRptFmt(r.nextTestDue)
                  ] })
                ];
              })
            }
          ),
          disposedPats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: 8, fontSize: "0.78rem", color: "#6b7280" }, children: [
            disposedPats.length,
            " disposed / removed item",
            disposedPats.length !== 1 ? "s" : "",
            " not shown (",
            disposedPats.map((r) => `${r.itemName}${r.disposalDate ? `, removed ${new Date(r.disposalDate).toLocaleDateString("en-GB")}` : ""}`).join("; "),
            ")."
          ] })
        ] }) });
      })(),
      (() => {
        const activeFires = fires.filter((r) => (r.status ?? "active") === "active");
        const disposedFires = fires.filter((r) => r.status === "disposed");
        return /* @__PURE__ */ jsxRuntimeExports.jsx(HsRptSection, { title: "4. Fire Safety — Extinguisher Service Register", count: activeFires.length, children: fires.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontStyle: "italic", fontSize: "0.85rem" }, children: "No fire extinguisher records logged." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          activeFires.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontStyle: "italic", fontSize: "0.85rem" }, children: "All extinguishers have been marked as disposed. Add new units to restart compliance tracking." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            HsRptTable,
            {
              headers: ["Location", "Position", "Type", "Capacity", "Serial No.", "Last Service", "Engineer", "Company", "Next Service Due"],
              rows: activeFires.map((r) => {
                const overdue = r.nextServiceDue && new Date(r.nextServiceDue) < now;
                return [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.buildingName ?? r.location }),
                  r.subLocation || "—",
                  FIRE_TYPE_LABEL[r.type] ?? r.type,
                  r.capacityKg ? `${r.capacityKg} kg` : "—",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontSize: "0.72rem" }, children: r.serialNumber || "—" }),
                  hsRptFmt(r.lastServiceDate),
                  r.engineerName || "—",
                  r.engineerCompany || "—",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: overdue ? "#991b1b" : "#374151", fontWeight: overdue ? 600 : 400 }, children: [
                    overdue ? "⚠ " : "",
                    hsRptFmt(r.nextServiceDue)
                  ] })
                ];
              })
            }
          ),
          disposedFires.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: 8, fontSize: "0.78rem", color: "#6b7280" }, children: [
            disposedFires.length,
            " disposed / decommissioned unit",
            disposedFires.length !== 1 ? "s" : "",
            " not shown above (",
            disposedFires.map((r) => `${FIRE_TYPE_LABEL[r.type] ?? r.type}${r.serialNumber ? ` S/N ${r.serialNumber}` : ""}${r.disposalDate ? `, disposed ${new Date(r.disposalDate).toLocaleDateString("en-GB")}` : ""}`).join("; "),
            ")."
          ] })
        ] }) });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 36, paddingTop: 12, borderTop: "1px solid #e5e7eb", fontSize: "0.7rem", color: "#9ca3af", display: "flex", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "BDE Farm Trac · bdefarmtrac.co.uk · Barnett Davies Enterprises Ltd." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Generated ",
          today,
          " · Health, Safety & Risk Register"
        ] })
      ] })
    ] })
  ] }) });
}
function RiskAssessmentsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "risk-assessments", farmId, validIds: RISK_ASSESSMENTS_TAB_IDS, defaultTab: "risk", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const [reportOpen, setReportOpen] = reactExports.useState(false);
  const openId = (() => {
    const n = Number(new URLSearchParams(window.location.search).get("open"));
    return n > 0 ? n : null;
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 text-red-700" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Health, Safety & Risk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Risk assessments, COSHH records, PAT testing, and fire safety — covering your legal obligations under UK health & safety law and Red Tractor requirements" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "shrink-0 mt-1", onClick: () => setReportOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
        "Print H&S Register"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "risk", onClick: () => setTab("risk"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5 mr-1 inline-block" }),
        "Risk Assessments"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "coshh", onClick: () => setTab("coshh"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5 mr-1 inline-block" }),
        "COSHH Records"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "pat", onClick: () => setTab("pat"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5 mr-1 inline-block" }),
        "PAT Testing"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "fire", onClick: () => setTab("fire"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 mr-1 inline-block" }),
        "Fire Safety"
      ] })
    ] }),
    farmId && tab === "risk" && /* @__PURE__ */ jsxRuntimeExports.jsx(RiskAssessmentTab, { farmId, openId }),
    farmId && tab === "coshh" && /* @__PURE__ */ jsxRuntimeExports.jsx(CoshhTab, { farmId, openId }),
    farmId && tab === "pat" && /* @__PURE__ */ jsxRuntimeExports.jsx(PatTestingTab, { farmId, openId }),
    farmId && tab === "fire" && /* @__PURE__ */ jsxRuntimeExports.jsx(FireSafetyTab, { farmId, openId }),
    farmId && reportOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(HsReportModal, { farmId, onClose: () => setReportOpen(false) })
  ] }) });
}
export {
  RiskAssessmentsPage as default
};
