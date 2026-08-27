import { a as useToast, c as useQueryClient, b as useAppStore, u as useLocation, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, e as LoaderCircle, X, A as ArrowRight, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, I as Input, N as DialogMutationError } from "./index-CDukCNha.js";
import { a as usePersistedFilter } from "./use-persisted-filter-BlZwb5ik.js";
import { A as AppLayout, I as Info, C as CalendarDays, c as ClipboardList, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction } from "./AppLayout-CcF0mXKK.js";
import { u as useUpload } from "./use-upload-BPoi9DLT.js";
import { d as downloadCsvFile } from "./csv-DqFyucvM.js";
import { p as printProReport } from "./print-report-ClU8-1P0.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-C2WN5o9s.js";
import { P as Printer } from "./printer-C46G2sGo.js";
import { D as Download } from "./download-CfXxhQ_b.js";
import { P as PoundSterling, F as FileText } from "./shield-alert-BdARTvO8.js";
import { C as CircleCheck } from "./circle-check-DeOzX17T.js";
import { T as TriangleAlert, L as Leaf } from "./triangle-alert-CbSmXkg4.js";
import { E as ExternalLink } from "./external-link-Dfwa3vp3.js";
import { A as Archive } from "./archive-ByqW7sNA.js";
import { U as Upload } from "./upload-CloOvMS_.js";
import { E as Eye } from "./eye-2zMV_Yik.js";
import { P as Pencil } from "./pencil-iIMUFqn7.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-Cmi2RjiA.js";
import "./use-safe-clerk-DFK3tOiq.js";
import "./database-CCTTbwNA.js";
import "./shield-check-SpObG-tw.js";
import "./tractor-DBLqaPPG.js";
import "./textarea-DIvtomjZ.js";
import "./select-Dkg4sueF.js";
import "./index-BVVHEFnd.js";
import "./index-BHuKXUMm.js";
import "./chevron-up-DbU10X3h.js";
const FETF_ITEMS = [
  { code: "T-SYS-1", description: "Auto-steering / GPS guidance system", category: "Precision Technology" },
  { code: "T-SYS-2", description: "Variable rate technology (VRT) seeding or fertilising", category: "Precision Technology" },
  { code: "T-SYS-3", description: "Yield mapping and analysis system", category: "Precision Technology" },
  { code: "T-ENV-1", description: "Soil sampling and analysis technology", category: "Precision Technology" },
  { code: "T-ENV-2", description: "Remote sensing / drone survey equipment", category: "Precision Technology" },
  { code: "T-NUT-1", description: "Near infrared (NIR) spectroscopy for slurry or manure analysis", category: "Precision Technology" },
  { code: "T-IRR-1", description: "Soil moisture monitoring system", category: "Irrigation & Water" },
  { code: "T-IRR-2", description: "Weather station for irrigation management", category: "Irrigation & Water" },
  { code: "LESS-1", description: "Trailing shoe / trailing hose slurry spreader", category: "Slurry Management" },
  { code: "LESS-2", description: "Dribble bar slurry spreader", category: "Slurry Management" },
  { code: "LESS-3", description: "Shallow injection slurry spreader", category: "Slurry Management" },
  { code: "LESS-4", description: "Deep injection slurry spreader", category: "Slurry Management" },
  { code: "SLU-1", description: "Slurry store cover (fixed or floating)", category: "Slurry Management" },
  { code: "SLU-2", description: "Slurry separator", category: "Slurry Management" },
  { code: "SLU-3", description: "Slurry mixer / agitator", category: "Slurry Management" },
  { code: "ANH-1", description: "Electronic identification (EID) readers for cattle or sheep", category: "Animal Health" },
  { code: "ANH-2", description: "Electronic weigh scales / weighing system for livestock", category: "Animal Health" },
  { code: "ANH-3", description: "Automated beef crush / cattle handling system", category: "Animal Health" },
  { code: "ANH-4", description: "Lameness detection system", category: "Animal Health" },
  { code: "ANH-5", description: "Computerised cattle or pig feeding system", category: "Animal Health" },
  { code: "ANH-6", description: "Electronic sow feeding system", category: "Animal Health" },
  { code: "ANH-7", description: "Poultry weighing equipment", category: "Animal Health" },
  { code: "ANH-8", description: "Broiler catching machine", category: "Animal Health" },
  { code: "FERT-1", description: "Precision fertiliser spreader with GPS variable rate capability", category: "Arable & Crops" },
  { code: "FERT-2", description: "Boom sprayer section control / GPS shut-off", category: "Arable & Crops" },
  { code: "SEED-1", description: "Direct drill / no-till drill for arable crops", category: "Arable & Crops" },
  { code: "HRT-1", description: "Protected cropping irrigation system (polytunnel / glasshouse)", category: "Horticulture" },
  { code: "HRT-2", description: "Polytunnel structure with growing system", category: "Horticulture" },
  { code: "ENV-1", description: "Electric vehicle charging point (farm or public)", category: "Environment & Energy" },
  { code: "ENV-2", description: "Solar panels for on-farm energy generation", category: "Environment & Energy" }
];
const SCHEME_TYPES = ["FETF", "CS", "SFI", "RDPE", "Other"];
const STATUSES = ["draft", "applied", "approved", "purchased", "claimed", "rejected", "withdrawn"];
const STATUS_CONFIG = {
  draft: { label: "Draft", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  applied: { label: "Applied", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  approved: { label: "Approved", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  purchased: { label: "Purchased", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  claimed: { label: "Claimed", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" }
};
function formatGBP(pence) {
  if (!pence) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function deadlineStatus(dateStr) {
  if (!dateStr) return "none";
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 864e5);
  if (diff < 0) return "overdue";
  if (diff <= 30) return "warning";
  return "ok";
}
function grantYear(r) {
  const d = r.applicationDate || r.approvalDate;
  return d ? new Date(d).getFullYear() : null;
}
function DeadlineBadge({ dateStr }) {
  if (!dateStr) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: "—" });
  const status = deadlineStatus(dateStr);
  const formatted = formatDate(dateStr);
  const styles = {
    overdue: "bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded font-semibold",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded font-semibold",
    ok: "bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded font-medium"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles[status], children: formatted });
}
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`, children: cfg.label });
}
const BLANK_FORM = {
  schemeName: "",
  schemeType: "FETF",
  itemReferenceCode: "",
  itemDescription: "",
  applicationReference: "",
  approvalAgreementReference: "",
  applicationDate: "",
  approvalDate: "",
  purchaseDeadline: "",
  claimDeadline: "",
  grantAmountGBP: "",
  actualCostGBP: "",
  status: "applied",
  notes: ""
};
const AE_PROJECT_STATUS_CFG = {
  applied: { label: "Applied", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  active: { label: "Active", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  completed: { label: "Completed", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  suspended: { label: "Suspended", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" }
};
const AE_MILESTONE_STATUS_CFG = {
  pending: { label: "Pending", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  submitted: { label: "Submitted", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  paid: { label: "Paid", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  overdue: { label: "Overdue", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" }
};
const AE_COMMON_SCHEMES = [
  "FiPL (Farming in Protected Landscapes)",
  "SFI (Sustainable Farming Incentive)",
  "Countryside Stewardship (CS)",
  "ELMs (Environmental Land Management)",
  "RDPE",
  "AONB Stewardship"
];
const AE_COMMON_BODIES = [
  "Natural England",
  "RPA (Rural Payments Agency)",
  "National Park Authority",
  "AONB Partnership",
  "Local Authority"
];
const AE_FIPL_THEMES = ["Climate", "Nature", "People", "Place", "Multiple", "General / Other"];
const AE_PROJECT_STATUSES = ["applied", "active", "completed", "suspended", "withdrawn"];
const AE_MILESTONE_STATUSES = ["pending", "completed", "submitted", "paid", "overdue"];
const ACTIVE_AE_PROJECT_STATUSES = /* @__PURE__ */ new Set(["active", "applied", "pending"]);
const AE_MILESTONE_FILTERS = ["all", ...AE_MILESTONE_STATUSES];
const AE_BLANK_PROJECT = {
  schemeName: "",
  administeringBody: "",
  agreementReference: "",
  designatedLandscape: "",
  theme: "",
  startDate: "",
  endDate: "",
  totalGrantValueGBP: "",
  status: "active",
  notes: ""
};
const AE_BLANK_MILESTONE = {
  milestoneName: "",
  dueDate: "",
  completionDate: "",
  claimAmountGBP: "",
  status: "pending",
  evidenceNotes: ""
};
function AeProjectBadge({ status }) {
  const cfg = AE_PROJECT_STATUS_CFG[status] ?? AE_PROJECT_STATUS_CFG.active;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`, children: cfg.label });
}
function SchemeNameCombobox({ value, onChange, schemeNames, compact = false }) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const [activeIdx, setActiveIdx] = reactExports.useState(-1);
  const containerRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const listRef = reactExports.useRef(null);
  const listboxId = reactExports.useRef(`snc-listbox-${Math.random().toString(36).slice(2)}`).current;
  const filteredNames = reactExports.useMemo(() => {
    if (!query.trim()) return schemeNames;
    const q = query.toLowerCase();
    return schemeNames.filter((n) => n.toLowerCase().includes(q));
  }, [schemeNames, query]);
  filteredNames.length + 1;
  reactExports.useEffect(() => {
    setActiveIdx(-1);
  }, [query]);
  reactExports.useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);
  reactExports.useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  function closeDropdown() {
    setOpen(false);
    setQuery("");
    setActiveIdx(-1);
  }
  function select(v) {
    onChange(v);
    closeDropdown();
    inputRef.current?.blur();
  }
  function handleFocus() {
    setQuery("");
    setActiveIdx(-1);
    setOpen(true);
  }
  function handleInputChange(e) {
    setQuery(e.target.value);
    setOpen(true);
  }
  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => i + 1 < filteredNames.length ? i + 1 : filteredNames.length === 0 ? -1 : filteredNames.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => i > -1 ? i - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx === -1) {
        select("all");
      } else if (activeIdx >= 0 && activeIdx < filteredNames.length) {
        select(filteredNames[activeIdx]);
      } else if (filteredNames.length === 1) {
        select(filteredNames[0]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      closeDropdown();
    }
  }
  const isActive = value !== "all";
  const inputVal = open ? query : value === "all" ? "" : value;
  function optionId(idx) {
    return idx === -1 ? `${listboxId}-all` : `${listboxId}-opt-${idx}`;
  }
  const inputStyle = {
    fontSize: "0.8rem",
    padding: "4px 28px 4px 8px",
    borderRadius: 6,
    border: isActive ? "1.5px solid #374151" : "1px solid #d1d5db",
    background: isActive ? "#111827" : "#fff",
    color: isActive ? "#fff" : "#111827",
    cursor: "text",
    outline: "none",
    width: compact ? 180 : 220,
    boxSizing: "border-box"
  };
  function optionStyle(selected, active) {
    return {
      padding: "8px 12px",
      fontSize: "0.8rem",
      cursor: "pointer",
      background: active ? "#e0f2fe" : selected ? "#f0fdf4" : "#fff",
      color: active ? "#0369a1" : selected ? "#166534" : "#111827",
      fontWeight: selected || active ? 600 : 400,
      borderBottom: "1px solid #f3f4f6",
      outline: "none"
    };
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, style: { position: "relative", display: "inline-block" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          role: "combobox",
          "aria-haspopup": "listbox",
          "aria-expanded": open,
          "aria-autocomplete": "list",
          "aria-controls": listboxId,
          "aria-activedescendant": open ? optionId(activeIdx) : void 0,
          "aria-label": "Filter by scheme name",
          autoComplete: "off",
          value: inputVal,
          onChange: handleInputChange,
          onFocus: handleFocus,
          onKeyDown: handleKeyDown,
          placeholder: open ? "Type to filter schemes…" : "All schemes",
          style: inputStyle
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          "aria-hidden": "true",
          style: {
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: isActive ? "rgba(255,255,255,0.7)" : "#9ca3af",
            fontSize: "0.65rem"
          },
          children: "▾"
        }
      )
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: listRef,
        id: listboxId,
        role: "listbox",
        "aria-label": "Scheme names",
        style: {
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          zIndex: 100,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          minWidth: compact ? 200 : 240,
          maxHeight: 260,
          overflowY: "auto"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              id: optionId(-1),
              role: "option",
              "aria-selected": value === "all",
              "data-active": activeIdx === -1 ? "true" : void 0,
              onMouseDown: (e) => {
                e.preventDefault();
                select("all");
              },
              onMouseEnter: () => setActiveIdx(-1),
              style: optionStyle(value === "all", activeIdx === -1),
              children: "All schemes"
            }
          ),
          filteredNames.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", style: { padding: "10px 12px", fontSize: "0.8rem", color: "#9ca3af" }, children: "No matching schemes" }) : filteredNames.map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              id: optionId(i),
              role: "option",
              "aria-selected": value === n,
              "data-active": activeIdx === i ? "true" : void 0,
              onMouseDown: (e) => {
                e.preventDefault();
                select(n);
              },
              onMouseEnter: () => setActiveIdx(i),
              style: optionStyle(value === n, activeIdx === i),
              children: n
            },
            n
          ))
        ]
      }
    )
  ] });
}
function AgriEnvTab({ farmId, farm }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedId, _setExpandedIdRaw] = reactExports.useState(null);
  const setExpandedId = (id) => {
    _setExpandedIdRaw(id);
    if (farmId === null) return;
    try {
      const key = `grants-agri-env-expanded-project-filter-${farmId}`;
      if (id !== null) {
        localStorage.setItem(key, String(id));
      } else {
        localStorage.removeItem(key);
      }
    } catch {
    }
  };
  const _initFarmIdRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (farmId === null || _initFarmIdRef.current === farmId) return;
    _initFarmIdRef.current = farmId;
    const urlId = Number(new URLSearchParams(window.location.search).get("project"));
    if (urlId > 0) {
      setExpandedId(urlId);
      return;
    }
    try {
      const v = localStorage.getItem(`grants-agri-env-expanded-project-filter-${farmId}`);
      const n = v ? Number(v) : 0;
      _setExpandedIdRaw(n > 0 ? n : null);
    } catch {
      _setExpandedIdRaw(null);
    }
  }, [farmId]);
  const [milestoneFilter, setMilestoneFilter] = usePersistedFilter({
    page: "grants-agri-env",
    filter: expandedId === null ? "milestone-status-none" : `milestone-status-${expandedId}`,
    farmId,
    defaultValue: "all",
    validValues: AE_MILESTONE_FILTERS
  });
  const [showProjectForm, setShowProjectForm] = reactExports.useState(false);
  const [editingProject, setEditingProject] = reactExports.useState(null);
  const [deletingProject, setDeletingProject] = reactExports.useState(null);
  const [projectForm, setProjectForm] = reactExports.useState({ ...AE_BLANK_PROJECT });
  const [showMilestoneForm, setShowMilestoneForm] = reactExports.useState(false);
  const [editingMilestone, setEditingMilestone] = reactExports.useState(null);
  const [deletingMilestone, setDeletingMilestone] = reactExports.useState(null);
  const [milestoneForm, setMilestoneForm] = reactExports.useState({ ...AE_BLANK_MILESTONE });
  const [pendingCompletion, setPendingCompletion] = reactExports.useState(null);
  const [updatingMilestone, setUpdatingMilestone] = reactExports.useState(null);
  const todayIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const { data: projData, isLoading, isSuccess: projIsSuccess } = useQuery({
    queryKey: ["agri-env-projects", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects`);
      if (!r.ok) throw new Error("Failed to load agri-env projects");
      return r.json();
    },
    enabled: !!farmId
  });
  const { data: msData } = useQuery({
    queryKey: ["agri-env-milestones", farmId, expandedId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones`);
      if (!r.ok) throw new Error("Failed to load milestones");
      return r.json();
    },
    enabled: !!farmId && expandedId !== null
  });
  const { data: allMsData } = useQuery({
    queryKey: ["agri-env-all-milestones", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-milestones`);
      if (!r.ok) throw new Error("Failed to load milestones");
      return r.json();
    },
    enabled: !!farmId
  });
  const projects = projData?.projects ?? [];
  const milestones = msData?.milestones ?? [];
  const allMilestones = allMsData?.milestones ?? [];
  const visibleMilestones = milestoneFilter === "all" ? milestones : milestones.filter((m) => m.status === milestoneFilter);
  reactExports.useEffect(() => {
    if (!projIsSuccess || farmId === null) return;
    const key = `grants-agri-env-expanded-project-filter-${farmId}`;
    try {
      const stored = localStorage.getItem(key);
      const storedId = stored ? Number(stored) : 0;
      if (storedId > 0 && !projects.some((p) => p.id === storedId)) {
        localStorage.removeItem(key);
        _setExpandedIdRaw(null);
      }
    } catch {
    }
  }, [projIsSuccess, farmId, projects]);
  const [aeScreenStatus, setAeScreenStatus] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "screen-status",
    farmId,
    defaultValue: "all",
    validValues: ["all", ...AE_PROJECT_STATUSES]
  });
  const [aeScreenScheme, setAeScreenScheme] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "screen-scheme",
    farmId,
    defaultValue: "all"
  });
  const screenFilteredProjects = reactExports.useMemo(() => {
    return projects.filter((p) => {
      if (aeScreenStatus !== "all" && p.status !== aeScreenStatus) return false;
      if (aeScreenScheme !== "all" && p.schemeName !== aeScreenScheme) return false;
      return true;
    });
  }, [projects, aeScreenStatus, aeScreenScheme]);
  const [aeExportScheme, setAeExportScheme] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "export-scheme",
    farmId,
    defaultValue: "all"
  });
  const [aeExportStatus, setAeExportStatus] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "export-status",
    farmId,
    defaultValue: "all",
    validValues: ["all", ...AE_PROJECT_STATUSES]
  });
  const uniqueSchemeNames = reactExports.useMemo(
    () => [...new Set(projects.map((p) => p.schemeName))].sort(),
    [projects]
  );
  const filteredProjects = reactExports.useMemo(() => {
    return projects.filter((p) => {
      if (aeExportScheme !== "all" && p.schemeName !== aeExportScheme) return false;
      if (aeExportStatus !== "all" && p.status !== aeExportStatus) return false;
      return true;
    });
  }, [projects, aeExportScheme, aeExportStatus]);
  function exportFilename() {
    const parts = ["agri-environment"];
    if (aeExportScheme !== "all") {
      parts.push(aeExportScheme.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24));
    }
    if (aeExportStatus !== "all") parts.push(aeExportStatus);
    return parts.join("-") + ".csv";
  }
  const schemeProjects = aeScreenScheme === "all" ? projects : projects.filter((p) => p.schemeName === aeScreenScheme);
  const schemeProjectIds = reactExports.useMemo(() => new Set(schemeProjects.map((p) => p.id)), [schemeProjects]);
  const pendingMilestones = allMilestones.filter((m) => m.status !== "paid" && m.status !== "completed" && schemeProjectIds.has(m.projectId));
  const overdueMs = pendingMilestones.filter((m) => deadlineStatus(m.dueDate) === "overdue").length;
  const upcomingMs = pendingMilestones.filter((m) => deadlineStatus(m.dueDate) === "warning").length;
  const activeCount = schemeProjects.filter((p) => ["applied", "active"].includes(p.status)).length;
  const completedCount = schemeProjects.filter((p) => p.status === "completed").length;
  const totalValue = schemeProjects.filter((p) => p.status !== "withdrawn").reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
  const saveProjectMut = useMutation({
    mutationFn: async (payload) => {
      const body = {
        schemeName: payload.schemeName,
        administeringBody: payload.administeringBody || null,
        agreementReference: payload.agreementReference || null,
        designatedLandscape: payload.designatedLandscape || null,
        theme: payload.theme || null,
        startDate: payload.startDate || null,
        endDate: payload.endDate || null,
        totalGrantValuePence: payload.totalGrantValueGBP ? Math.round(parseFloat(payload.totalGrantValueGBP) * 100) : null,
        status: payload.status,
        notes: payload.notes || null
      };
      const url = editingProject ? `/api/farms/${farmId}/agri-env-projects/${editingProject.id}` : `/api/farms/${farmId}/agri-env-projects`;
      const r = await fetch(url, { method: editingProject ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text().catch(() => "Save failed"));
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-projects", farmId] });
      toast({ title: editingProject ? "Scheme updated" : "Scheme added" });
      setShowProjectForm(false);
      setEditingProject(null);
    }
  });
  const deleteProjectMut = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text().catch(() => "Delete failed"));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-projects", farmId] });
      qc.invalidateQueries({ queryKey: ["agri-env-all-milestones", farmId] });
      toast({ title: "Scheme removed" });
      setDeletingProject(null);
      if (expandedId === deletingProject?.id) setExpandedId(null);
    }
  });
  const saveMilestoneMut = useMutation({
    mutationFn: async (payload) => {
      const body = {
        milestoneName: payload.milestoneName,
        dueDate: payload.dueDate || null,
        completionDate: payload.completionDate || null,
        claimAmountPence: payload.claimAmountGBP ? Math.round(parseFloat(payload.claimAmountGBP) * 100) : null,
        status: payload.status,
        evidenceNotes: payload.evidenceNotes || null
      };
      const url = editingMilestone ? `/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones/${editingMilestone.id}` : `/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones`;
      const r = await fetch(url, { method: editingMilestone ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text().catch(() => "Save failed"));
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-milestones", farmId, expandedId] });
      qc.invalidateQueries({ queryKey: ["agri-env-all-milestones", farmId] });
      toast({ title: editingMilestone ? "Milestone updated" : "Milestone added" });
      setShowMilestoneForm(false);
      setEditingMilestone(null);
    }
  });
  const deleteMilestoneMut = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text().catch(() => "Delete failed"));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-milestones", farmId, expandedId] });
      qc.invalidateQueries({ queryKey: ["agri-env-all-milestones", farmId] });
      toast({ title: "Milestone removed" });
      setDeletingMilestone(null);
    }
  });
  const updateMilestoneStatusMut = useMutation({
    mutationFn: async ({ milestoneId, projectId, status, completionDate }) => {
      const body = { status };
      if (completionDate !== void 0) body.completionDate = completionDate ?? null;
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${projectId}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(await r.text().catch(() => "Update failed"));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-milestones", farmId, expandedId] });
      qc.invalidateQueries({ queryKey: ["agri-env-all-milestones", farmId] });
      setPendingCompletion(null);
      setUpdatingMilestone(null);
      toast({ title: "Milestone updated" });
    },
    onError: () => {
      setUpdatingMilestone(null);
    }
  });
  function openAddProject() {
    setEditingProject(null);
    setProjectForm({ ...AE_BLANK_PROJECT });
    setShowProjectForm(true);
  }
  function openEditProject(p) {
    setEditingProject(p);
    setProjectForm({
      schemeName: p.schemeName,
      administeringBody: p.administeringBody ?? "",
      agreementReference: p.agreementReference ?? "",
      designatedLandscape: p.designatedLandscape ?? "",
      theme: p.theme ?? "",
      startDate: p.startDate ?? "",
      endDate: p.endDate ?? "",
      totalGrantValueGBP: p.totalGrantValuePence ? (p.totalGrantValuePence / 100).toFixed(0) : "",
      status: p.status,
      notes: p.notes ?? ""
    });
    setShowProjectForm(true);
  }
  function openAddMilestone() {
    setEditingMilestone(null);
    setMilestoneForm({ ...AE_BLANK_MILESTONE });
    setShowMilestoneForm(true);
  }
  function openEditMilestone(m) {
    setEditingMilestone(m);
    setMilestoneForm({
      milestoneName: m.milestoneName,
      dueDate: m.dueDate ?? "",
      completionDate: m.completionDate ?? "",
      claimAmountGBP: m.claimAmountPence ? (m.claimAmountPence / 100).toFixed(0) : "",
      status: m.status,
      evidenceNotes: m.evidenceNotes ?? ""
    });
    setShowMilestoneForm(true);
  }
  const inputSt = { padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: "0.875rem", width: "100%" };
  const labelSt = { fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" };
  function exportCsv() {
    const milestonesByProject = /* @__PURE__ */ new Map();
    for (const m of allMilestones) {
      const arr = milestonesByProject.get(m.projectId) ?? [];
      arr.push(m);
      milestonesByProject.set(m.projectId, arr);
    }
    const header = [
      "Scheme Name",
      "Administering Body",
      "Agreement / Ref",
      "Designated Landscape",
      "Theme",
      "Start Date",
      "End Date",
      "Grant Value (£)",
      "Status",
      "Notes",
      "Milestone Name",
      "Milestone Due Date",
      "Milestone Completion Date",
      "Milestone Claim (£)",
      "Milestone Status",
      "Evidence Notes"
    ];
    const rows = [header];
    for (const p of filteredProjects) {
      const ms = milestonesByProject.get(p.id) ?? [];
      const schemeBase = [
        p.schemeName,
        p.administeringBody ?? "",
        p.agreementReference ?? "",
        p.designatedLandscape ?? "",
        p.theme ?? "",
        p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB") : "",
        p.endDate ? new Date(p.endDate).toLocaleDateString("en-GB") : "",
        p.totalGrantValuePence != null ? (p.totalGrantValuePence / 100).toFixed(2) : "",
        AE_PROJECT_STATUS_CFG[p.status]?.label ?? p.status,
        p.notes ?? ""
      ];
      if (ms.length === 0) {
        rows.push([...schemeBase, "", "", "", "", "", ""]);
      } else {
        for (const m of ms) {
          rows.push([
            ...schemeBase,
            m.milestoneName,
            m.dueDate ? new Date(m.dueDate).toLocaleDateString("en-GB") : "",
            m.completionDate ? new Date(m.completionDate).toLocaleDateString("en-GB") : "",
            m.claimAmountPence != null ? (m.claimAmountPence / 100).toFixed(2) : "",
            AE_MILESTONE_STATUS_CFG[m.status]?.label ?? m.status,
            m.evidenceNotes ?? ""
          ]);
        }
      }
    }
    downloadCsvFile(exportFilename(), rows);
  }
  const printReport = () => printProReport({
    title: "Agri-environment Scheme Record",
    farmName: typeof farm?.name === "string" ? farm.name : typeof farm?.farmName === "string" ? farm.farmName : void 0,
    farmAddress: farm?.address ? String(farm.address) : void 0,
    cphNumber: farm?.cphNumber ? String(farm.cphNumber) : void 0,
    sbiNumber: farm?.sbiNumber ? String(farm.sbiNumber) : void 0,
    authority: "RPA",
    authorityReferenceLabel: "RPA customer reference",
    authorityReference: farm?.rpaCustomerReference ? String(farm.rpaCustomerReference) : null,
    recordCount: filteredProjects.length,
    recordLabel: "scheme",
    landscape: true,
    tableHtml: document.getElementById("agri-env-print-report")?.innerHTML ?? ""
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          aside, nav, header, [data-sidebar], .sidebar, [class*="sidebar"] { display: none !important; }
          body { background: white !important; }
          .ae-screen-only { display: none !important; }
          .ae-print-only { display: block !important; }
          .ae-print-card { break-inside: avoid; }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ae-screen-only", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem", margin: 0 }, children: "Record agri-environment scheme agreements — FiPL, SFI, Countryside Stewardship, ELMs, AONB stewardship and any other scheme." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ae-print-hide", style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: printReport,
              disabled: projects.length === 0,
              style: { display: "flex", alignItems: "center", gap: 6 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
                " Print"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: exportCsv,
              disabled: projects.length === 0,
              style: { display: "flex", alignItems: "center", gap: 6 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                " Export CSV"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAddProject, style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
            " Add Scheme"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px 20px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }, children: "Active Schemes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: "#111827" }, children: activeCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }, children: [
            completedCount,
            " completed"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "16px 20px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }, children: "Total Scheme Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: "#111827" }, children: totalValue > 0 ? `£${(totalValue / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }, children: [
            "across ",
            schemeProjects.filter((p) => p.status !== "withdrawn").length,
            " scheme(s)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "16px 20px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }, children: "FiPL Info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#374151", lineHeight: 1.5, marginTop: 4 }, children: "Farming in Protected Landscapes — administered by your National Park or AONB team. Runs to 2029." })
        ] })
      ] }),
      (() => {
        const drawdownProjects = projects.filter(
          (p) => ACTIVE_AE_PROJECT_STATUSES.has(p.status) && (p.totalGrantValuePence ?? 0) > 0
        );
        if (drawdownProjects.length === 0) return null;
        const drawdownProjectIds = new Set(drawdownProjects.map((p) => p.id));
        const totalPence = drawdownProjects.reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
        const paidPence = allMilestones.filter((m) => drawdownProjectIds.has(m.projectId) && m.status === "paid").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const submittedPence = allMilestones.filter((m) => drawdownProjectIds.has(m.projectId) && m.status === "submitted").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const pct = Math.min(100, Math.round(paidPence / totalPence * 100));
        const pctSub = Math.min(100 - pct, Math.round(submittedPence / totalPence * 100));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 20
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }, children: [
              "Farm-wide Drawdown — ",
              drawdownProjects.length,
              " active project",
              drawdownProjects.length !== 1 ? "s" : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8rem", fontWeight: 700, color: pct >= 100 ? "#059669" : "#111827" }, children: [
              pct,
              "% drawn"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.875rem", color: "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, color: "#111827" }, children: [
              "£",
              (paidPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })
            ] }),
            " of ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600 }, children: [
              "£",
              (totalPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })
            ] }),
            " claimed across ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: drawdownProjects.length }),
            " project",
            drawdownProjects.length !== 1 ? "s" : ""
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { height: 10, background: "#dcfce7", borderRadius: 6, overflow: "hidden", display: "flex" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${pct}%`, background: "#059669", transition: "width 0.3s", borderRadius: pct >= 100 ? 6 : "6px 0 0 6px" } }),
            pctSub > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${pctSub}%`, background: "#93c5fd", transition: "width 0.3s" } })
          ] }),
          pctSub > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 5 }, children: [
            "+ £",
            (submittedPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 }),
            " submitted (awaiting payment)"
          ] })
        ] });
      })(),
      (overdueMs > 0 || upcomingMs > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        background: overdueMs > 0 ? "#fef2f2" : "#fffbeb",
        border: `1px solid ${overdueMs > 0 ? "#fecaca" : "#fde68a"}`,
        borderRadius: 10,
        marginBottom: 20
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: overdueMs > 0 ? "#dc2626" : "#d97706", style: { flexShrink: 0, marginTop: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", fontWeight: 700, color: overdueMs > 0 ? "#991b1b" : "#92400e", marginBottom: 3 }, children: overdueMs > 0 && upcomingMs > 0 ? `${overdueMs} overdue and ${upcomingMs} upcoming milestone${upcomingMs !== 1 ? "s" : ""} need attention` : overdueMs > 0 ? `${overdueMs} milestone${overdueMs !== 1 ? "s" : ""} ${overdueMs !== 1 ? "are" : "is"} overdue — claim payment may be at risk` : `${upcomingMs} milestone${upcomingMs !== 1 ? "s" : ""} due within 30 days — prepare your claim evidence` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: overdueMs > 0 ? "#b91c1c" : "#b45309" }, children: "Expand the scheme below to view and update individual milestone statuses." })
        ] })
      ] }),
      projects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        marginBottom: 16,
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", flexShrink: 0 }, children: "Export & Print filter:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SchemeNameCombobox,
          {
            value: aeExportScheme,
            onChange: setAeExportScheme,
            schemeNames: uniqueSchemeNames,
            compact: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: aeExportStatus,
            onChange: (e) => setAeExportStatus(e.target.value),
            style: { fontSize: "0.8rem", padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", color: "#111827" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All statuses" }),
              AE_PROJECT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: AE_PROJECT_STATUS_CFG[s]?.label ?? s }, s))
            ]
          }
        ),
        (aeExportScheme !== "all" || aeExportStatus !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#6b7280", marginLeft: 2 }, children: [
          filteredProjects.length,
          " of ",
          projects.length,
          " scheme",
          projects.length !== 1 ? "s" : "",
          " selected",
          " · ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setAeExportScheme("all");
                setAeExportStatus("all");
              },
              style: { background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", textDecoration: "underline", fontSize: "0.78rem" },
              children: "Clear"
            }
          )
        ] })
      ] }),
      projects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", flexShrink: 0 }, children: "Scheme:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SchemeNameCombobox,
            {
              value: aeScreenScheme,
              onChange: setAeScreenScheme,
              schemeNames: uniqueSchemeNames
            }
          ),
          aeScreenScheme !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setAeScreenScheme("all"),
              style: { background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", fontSize: "0.78rem", textDecoration: "underline" },
              children: "Clear"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginRight: 2 }, children: "Status:" }),
          ["all", ...AE_PROJECT_STATUSES].map((s) => {
            const cfg = s === "all" ? null : AE_PROJECT_STATUS_CFG[s];
            const label = s === "all" ? "All" : cfg?.label ?? s;
            const schemeProjects2 = aeScreenScheme === "all" ? projects : projects.filter((p) => p.schemeName === aeScreenScheme);
            const count = s === "all" ? schemeProjects2.length : schemeProjects2.filter((p) => p.status === s).length;
            const isActive = aeScreenStatus === s;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setAeScreenStatus(s),
                style: {
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  border: isActive ? "1.5px solid #374151" : "1px solid #e5e7eb",
                  background: isActive ? "#111827" : "#f9fafb",
                  color: isActive ? "#fff" : "#374151",
                  transition: "all 0.12s"
                },
                children: [
                  label,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background: isActive ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                    color: isActive ? "#fff" : "#6b7280",
                    borderRadius: 20,
                    padding: "0px 6px",
                    minWidth: 18,
                    textAlign: "center"
                  }, children: count })
                ]
              },
              s
            );
          })
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: 60, color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin", style: { display: "inline" } }) }) : projects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 32, color: "#d1d5db", style: { margin: "0 auto 12px" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "No agri-environment schemes recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: "#6b7280", marginBottom: 16 }, children: "Add your first scheme to track milestones, claim dates and evidence." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAddProject, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, style: { marginRight: 6 } }),
          " Add Scheme"
        ] })
      ] }) : screenFilteredProjects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "32px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.9rem", color: "#6b7280" }, children: [
          "No schemes match",
          aeScreenScheme !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            " scheme ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: aeScreenScheme })
          ] }),
          aeScreenScheme !== "all" && aeScreenStatus !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: " with" }),
          aeScreenStatus !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            " status ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: AE_PROJECT_STATUS_CFG[aeScreenStatus]?.label ?? aeScreenStatus })
          ] }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setAeScreenStatus("all");
              setAeScreenScheme("all");
            },
            style: { marginTop: 10, background: "none", border: "none", cursor: "pointer", color: "#374151", textDecoration: "underline", fontSize: "0.82rem" },
            children: "Clear filters"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: screenFilteredProjects.map((project) => {
        const isExpanded = expandedId === project.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", cursor: "pointer" },
              onClick: () => setExpandedId(isExpanded ? null : project.id),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1rem", fontWeight: 600, color: "#111827" }, children: project.schemeName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AeProjectBadge, { status: project.status }),
                    project.theme && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", padding: "1px 8px", borderRadius: 20, border: "1px solid #d1d5db", color: "#6b7280", background: "#f9fafb" }, children: project.theme })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }, children: [
                    project.administeringBody && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: project.administeringBody }),
                    project.agreementReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
                      "Ref: ",
                      project.agreementReference
                    ] }),
                    project.designatedLandscape && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: project.designatedLandscape }),
                    (project.startDate || project.endDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
                      project.startDate ? new Date(project.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "?",
                      " → ",
                      project.endDate ? new Date(project.endDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "ongoing"
                    ] }),
                    !!project.totalGrantValuePence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#059669" }, children: [
                      "£",
                      (project.totalGrantValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })
                    ] })
                  ] }),
                  !!project.totalGrantValuePence && (() => {
                    const paidPence = allMilestones.filter((m) => m.projectId === project.id && m.status === "paid").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
                    const submittedPence = allMilestones.filter((m) => m.projectId === project.id && m.status === "submitted").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
                    const total = project.totalGrantValuePence;
                    const pct = Math.min(100, Math.round(paidPence / total * 100));
                    const pctSub = Math.min(100 - pct, Math.round(submittedPence / total * 100));
                    const claimedLabel = paidPence > 0 ? `£${(paidPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} of £${(total / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} claimed` : `£${(total / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} total — no paid claims yet`;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.71rem", color: "#6b7280" }, children: claimedLabel }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.71rem", fontWeight: 600, color: pct >= 100 ? "#059669" : "#374151" }, children: [
                          pct,
                          "% drawn"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { height: 6, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", display: "flex" }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${pct}%`, background: "#059669", transition: "width 0.3s" } }),
                        pctSub > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${pctSub}%`, background: "#93c5fd", transition: "width 0.3s" } })
                      ] }),
                      pctSub > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.69rem", color: "#6b7280", marginTop: 2 }, children: [
                        "£",
                        (submittedPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 }),
                        " submitted (awaiting payment)"
                      ] })
                    ] });
                  })()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        openEditProject(project);
                      },
                      style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        setDeletingProject(project);
                      },
                      style: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#ef4444" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16, color: "#9ca3af", style: { transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" } })
                ] })
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", background: "#fafafa", padding: "12px 16px" }, children: [
            project.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 6, padding: "8px 12px", fontSize: "0.82rem", color: "#3730a3", marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Notes:" }),
              " ",
              project.notes
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.82rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Milestones & Claims" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: openAddMilestone,
                  style: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                    " Add Milestone"
                  ]
                }
              )
            ] }),
            milestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                role: "tablist",
                "aria-label": "Filter milestones by status",
                style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 },
                children: AE_MILESTONE_FILTERS.map((filter) => {
                  const isActive = milestoneFilter === filter;
                  const count = filter === "all" ? milestones.length : milestones.filter((m) => m.status === filter).length;
                  const label = filter === "all" ? "All" : AE_MILESTONE_STATUS_CFG[filter]?.label ?? filter;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      role: "tab",
                      "aria-selected": isActive,
                      onClick: () => setMilestoneFilter(filter),
                      style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: "0.76rem",
                        fontWeight: isActive ? 600 : 400,
                        cursor: "pointer",
                        border: isActive ? "1.5px solid #374151" : "1px solid #e5e7eb",
                        background: isActive ? "#111827" : "#fff",
                        color: isActive ? "#fff" : "#374151"
                      },
                      children: [
                        label,
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          background: isActive ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                          color: isActive ? "#fff" : "#6b7280",
                          borderRadius: 20,
                          padding: "0px 5px",
                          minWidth: 16,
                          textAlign: "center"
                        }, children: count })
                      ]
                    },
                    filter
                  );
                })
              }
            ),
            milestones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: "20px 12px", color: "#9ca3af", fontSize: "0.82rem" }, children: "No milestones recorded yet — add one to track claim dates and evidence." }) : visibleMilestones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "20px 12px", color: "#9ca3af", fontSize: "0.82rem" }, children: [
              "No milestones match this status.",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setMilestoneFilter("all"),
                  style: { display: "block", margin: "8px auto 0", background: "none", border: "none", cursor: "pointer", color: "#374151", textDecoration: "underline", fontSize: "0.78rem" },
                  children: "Show all milestones"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: visibleMilestones.map((m) => {
              const isPending = pendingCompletion?.milestoneId === m.id;
              const isUpdating = updatingMilestone === m.id;
              const needsDate = (s) => (s === "completed" || s === "submitted" || s === "paid") && !m.completionDate;
              const msStatusColors = {
                pending: { bg: "#f9fafb", color: "#374151", border: "#e5e7eb" },
                completed: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
                submitted: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
                paid: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
                overdue: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" }
              };
              const sc = msStatusColors[m.status] ?? msStatusColors.pending;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#111827" }, children: m.milestoneName }),
                    isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "date",
                        value: pendingCompletion.date,
                        max: todayIso,
                        onChange: (e) => setPendingCompletion((prev) => prev ? { ...prev, date: e.target.value } : prev),
                        style: { fontSize: "0.75rem", padding: "2px 4px", border: "1px solid #93c5fd", borderRadius: 4, background: "#eff6ff", color: "#1e40af", width: 120 }
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "select",
                      {
                        disabled: isUpdating,
                        value: m.status ?? "pending",
                        onChange: (e) => {
                          const newStatus = e.target.value;
                          if (needsDate(newStatus)) {
                            const defaultDate = m.dueDate && m.dueDate.slice(0, 10) <= todayIso ? m.dueDate.slice(0, 10) : todayIso;
                            setPendingCompletion({ milestoneId: m.id, projectId: m.projectId, newStatus, date: defaultDate });
                          } else {
                            setUpdatingMilestone(m.id);
                            const isClaimed = (s) => s === "submitted" || s === "paid";
                            const completionDate = m.completionDate && isClaimed(m.status ?? "") && !isClaimed(newStatus) ? null : void 0;
                            updateMilestoneStatusMut.mutate({ milestoneId: m.id, projectId: m.projectId, status: newStatus, completionDate });
                          }
                        },
                        style: { fontSize: "0.7rem", fontWeight: 600, padding: "2px 4px 2px 7px", borderRadius: 20, border: `1px solid ${sc.border}`, background: sc.bg, color: sc.color, cursor: isUpdating ? "wait" : "pointer", opacity: isUpdating ? 0.6 : 1 },
                        children: AE_MILESTONE_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: AE_MILESTONE_STATUS_CFG[s]?.label ?? s }, s))
                      }
                    ),
                    !!m.claimAmountPence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#059669" }, children: [
                      "£",
                      (m.claimAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 3, alignItems: "center" }, children: [
                    m.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#6b7280" }, children: [
                      "Due:",
                      " ",
                      m.status === "paid" || m.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: new Date(m.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeadlineBadge, { dateStr: m.dueDate })
                    ] }),
                    m.completionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#059669" }, children: [
                      "Done: ",
                      new Date(m.completionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    ] }),
                    m.evidenceNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic" }, children: m.evidenceNotes })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }, children: isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => {
                        if (!pendingCompletion?.date) return;
                        setUpdatingMilestone(m.id);
                        updateMilestoneStatusMut.mutate({ milestoneId: m.id, projectId: m.projectId, status: pendingCompletion.newStatus, completionDate: pendingCompletion.date });
                      },
                      disabled: isUpdating || !pendingCompletion?.date,
                      style: { fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#1e40af", color: "#fff", border: "none", cursor: isUpdating ? "wait" : "pointer", fontWeight: 600, opacity: isUpdating || !pendingCompletion?.date ? 0.6 : 1 },
                      children: isUpdating ? "Saving…" : "Save"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setPendingCompletion(null),
                      disabled: isUpdating,
                      style: { fontSize: "0.7rem", padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", fontWeight: 600 },
                      children: "Cancel"
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditMilestone(m), style: { background: "none", border: "none", cursor: "pointer", padding: 3, color: "#6b7280" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeletingMilestone(m), style: { background: "none", border: "none", cursor: "pointer", padding: 3, color: "#ef4444" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
                ] }) })
              ] }, m.id);
            }) })
          ] })
        ] }, project.id);
      }) })
    ] }),
    filteredProjects.length > 0 && (() => {
      const milestonesByProject = /* @__PURE__ */ new Map();
      for (const m of allMilestones) {
        const arr = milestonesByProject.get(m.projectId) ?? [];
        arr.push(m);
        milestonesByProject.set(m.projectId, arr);
      }
      const printedValue = filteredProjects.filter((p) => p.status !== "withdrawn").reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
      const drawdownProjects = projects.filter(
        (p) => ACTIVE_AE_PROJECT_STATUSES.has(p.status) && (p.totalGrantValuePence ?? 0) > 0
      );
      const drawdownProjectIds = new Set(drawdownProjects.map((p) => p.id));
      const drawdownTotalPence = drawdownProjects.reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
      const drawdownPaidPence = allMilestones.filter((m) => drawdownProjectIds.has(m.projectId) && m.status === "paid").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
      const drawdownSubmittedPence = allMilestones.filter((m) => drawdownProjectIds.has(m.projectId) && m.status === "submitted").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
      const drawdownPct = drawdownTotalPence > 0 ? Math.min(100, Math.round(drawdownPaidPence / drawdownTotalPence * 100)) : 0;
      const drawdownPctSubmitted = drawdownTotalPence > 0 ? Math.min(100 - drawdownPct, Math.round(drawdownSubmittedPence / drawdownTotalPence * 100)) : 0;
      const filterLabel = [
        aeExportScheme !== "all" ? aeExportScheme : null,
        aeExportStatus !== "all" ? AE_PROJECT_STATUS_CFG[aeExportStatus]?.label ?? aeExportStatus : null
      ].filter(Boolean).join(" · ");
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "agri-env-print-report", style: { display: "none" }, className: "ae-print-only", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontFamily: "Georgia, serif", color: "#111827", padding: "0 0 24px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 }, children: "Agri-environment Scheme Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 24 }, children: [
          "Exported ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
          filterLabel && ` · Filtered: ${filterLabel}`,
          printedValue > 0 && ` · Total scheme value: £${(printedValue / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`
        ] }),
        drawdownProjects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ae-print-card", style: {
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 24
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }, children: [
              "Farm-wide Drawdown — ",
              drawdownProjects.length,
              " active project",
              drawdownProjects.length !== 1 ? "s" : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8rem", fontWeight: 700, color: drawdownPct >= 100 ? "#059669" : "#111827" }, children: [
              drawdownPct,
              "% drawn"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.875rem", color: "#374151", marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, color: "#111827" }, children: [
              "£",
              (drawdownPaidPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })
            ] }),
            " of ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600 }, children: [
              "£",
              (drawdownTotalPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })
            ] }),
            " claimed across ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: drawdownProjects.length }),
            " project",
            drawdownProjects.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { height: 10, background: "#dcfce7", borderRadius: 6, overflow: "hidden", display: "flex" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${drawdownPct}%`, background: "#059669", borderRadius: drawdownPct >= 100 ? 6 : "6px 0 0 6px" } }),
            drawdownPctSubmitted > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${drawdownPctSubmitted}%`, background: "#93c5fd" } })
          ] }),
          drawdownPctSubmitted > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 5 }, children: [
            "+ £",
            (drawdownSubmittedPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 }),
            " submitted (awaiting payment)"
          ] })
        ] }),
        filteredProjects.map((p, idx) => {
          const ms = milestonesByProject.get(p.id) ?? [];
          const statusCfg = AE_PROJECT_STATUS_CFG[p.status];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ae-print-card", style: { marginBottom: 28, pageBreakInside: "avoid" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderLeft: "4px solid #059669", paddingLeft: 12, marginBottom: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "1rem", fontWeight: 700 }, children: [
                  idx + 1,
                  ". ",
                  p.schemeName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
                  "[",
                  statusCfg?.label ?? p.status,
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("table", { style: { fontSize: "0.8rem", borderCollapse: "collapse", width: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
                p.administeringBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }, children: "Administering body" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: p.administeringBody })
                ] }),
                p.agreementReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }, children: "Agreement reference" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: p.agreementReference })
                ] }),
                p.designatedLandscape && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }, children: "Designated landscape" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: p.designatedLandscape })
                ] }),
                p.theme && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }, children: "Theme" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: p.theme })
                ] }),
                (p.startDate || p.endDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }, children: "Period" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                    p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "?",
                    " → ",
                    p.endDate ? new Date(p.endDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "ongoing"
                  ] })
                ] }),
                p.totalGrantValuePence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }, children: "Grant value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                    "£",
                    (p.totalGrantValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })
                  ] })
                ] }),
                p.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", verticalAlign: "top", paddingBottom: 2 }, children: "Notes" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: p.notes })
                ] })
              ] }) })
            ] }),
            ms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginLeft: 16 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 6 }, children: "Milestones & Claims" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #e5e7eb" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "4px 8px 4px 0", color: "#374151", fontWeight: 600 }, children: "Milestone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "4px 8px 4px 0", color: "#374151", fontWeight: 600 }, children: "Due" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "4px 8px 4px 0", color: "#374151", fontWeight: 600 }, children: "Completed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "4px 0 4px 8px", color: "#374151", fontWeight: 600 }, children: "Claim (£)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "4px 0 4px 8px", color: "#374151", fontWeight: 600 }, children: "Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "4px 0", color: "#374151", fontWeight: 600 }, children: "Evidence" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: ms.map((m) => {
                  const mCfg = AE_MILESTONE_STATUS_CFG[m.status];
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px 4px 0" }, children: m.milestoneName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px 4px 0", whiteSpace: "nowrap" }, children: m.dueDate ? new Date(m.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px 4px 0", whiteSpace: "nowrap" }, children: m.completionDate ? new Date(m.completionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 0 4px 8px", textAlign: "right", whiteSpace: "nowrap" }, children: m.claimAmountPence != null ? `£${(m.claimAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 0 4px 8px" }, children: mCfg?.label ?? m.status }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 0", color: "#6b7280" }, children: m.evidenceNotes ?? "" })
                  ] }, m.id);
                }) })
              ] })
            ] }),
            ms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginLeft: 16, fontSize: "0.8rem", color: "#9ca3af" }, children: "No milestones recorded." })
          ] }, p.id);
        })
      ] }) });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showProjectForm, onOpenChange: (v) => {
      if (!v) {
        setShowProjectForm(false);
        setEditingProject(null);
        saveProjectMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingProject ? "Edit Scheme" : "Add Agri-environment Scheme" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Scheme Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              list: "ae-scheme-list",
              value: projectForm.schemeName,
              onChange: (e) => setProjectForm((f) => ({ ...f, schemeName: e.target.value })),
              style: inputSt,
              placeholder: "e.g. FiPL, SFI, Countryside Stewardship…"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "ae-scheme-list", children: AE_COMMON_SCHEMES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s }, s)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Administering Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                list: "ae-body-list",
                value: projectForm.administeringBody,
                onChange: (e) => setProjectForm((f) => ({ ...f, administeringBody: e.target.value })),
                style: inputSt,
                placeholder: "e.g. Natural England"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "ae-body-list", children: AE_COMMON_BODIES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b }, b)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Agreement / Reference No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: projectForm.agreementReference,
                onChange: (e) => setProjectForm((f) => ({ ...f, agreementReference: e.target.value })),
                style: inputSt,
                placeholder: "Agreement reference"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Designated Landscape" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: projectForm.designatedLandscape,
                onChange: (e) => setProjectForm((f) => ({ ...f, designatedLandscape: e.target.value })),
                style: inputSt,
                placeholder: "e.g. South Downs NP"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Theme (FiPL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: projectForm.theme, onChange: (e) => setProjectForm((f) => ({ ...f, theme: e.target.value })), style: inputSt, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— not applicable —" }),
              AE_FIPL_THEMES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: projectForm.startDate, onChange: (e) => setProjectForm((f) => ({ ...f, startDate: e.target.value })), style: inputSt })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: projectForm.endDate, onChange: (e) => setProjectForm((f) => ({ ...f, endDate: e.target.value })), style: inputSt })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Total Grant Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "1",
                value: projectForm.totalGrantValueGBP,
                onChange: (e) => setProjectForm((f) => ({ ...f, totalGrantValueGBP: e.target.value })),
                style: inputSt,
                placeholder: "0"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: projectForm.status, onChange: (e) => setProjectForm((f) => ({ ...f, status: e.target.value })), style: inputSt, children: AE_PROJECT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: AE_PROJECT_STATUS_CFG[s]?.label ?? s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: projectForm.notes,
              onChange: (e) => setProjectForm((f) => ({ ...f, notes: e.target.value })),
              style: { ...inputSt, minHeight: 70, resize: "vertical" },
              placeholder: "Objectives, conditions, required actions…"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveProjectMut, message: "Failed to save — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowProjectForm(false);
          setEditingProject(null);
          saveProjectMut.reset();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !projectForm.schemeName.trim() || saveProjectMut.isPending, onClick: () => saveProjectMut.mutate(projectForm), children: saveProjectMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin", style: { marginRight: 6 } }),
          "Saving…"
        ] }) : editingProject ? "Save Changes" : "Add Scheme" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showMilestoneForm, onOpenChange: (v) => {
      if (!v) {
        setShowMilestoneForm(false);
        setEditingMilestone(null);
        saveMilestoneMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingMilestone ? "Edit Milestone" : "Add Milestone" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Milestone Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: milestoneForm.milestoneName,
              onChange: (e) => setMilestoneForm((f) => ({ ...f, milestoneName: e.target.value })),
              style: inputSt,
              placeholder: "e.g. Year 1 claim, Habitat survey, Q2 payment…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: milestoneForm.dueDate, onChange: (e) => setMilestoneForm((f) => ({ ...f, dueDate: e.target.value })), style: inputSt })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Completion Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: milestoneForm.completionDate, onChange: (e) => setMilestoneForm((f) => ({ ...f, completionDate: e.target.value })), style: inputSt })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Claim Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "1",
                value: milestoneForm.claimAmountGBP,
                onChange: (e) => setMilestoneForm((f) => ({ ...f, claimAmountGBP: e.target.value })),
                style: inputSt,
                placeholder: "0"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: milestoneForm.status, onChange: (e) => setMilestoneForm((f) => ({ ...f, status: e.target.value })), style: inputSt, children: AE_MILESTONE_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: AE_MILESTONE_STATUS_CFG[s]?.label ?? s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelSt, children: "Evidence Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: milestoneForm.evidenceNotes,
              onChange: (e) => setMilestoneForm((f) => ({ ...f, evidenceNotes: e.target.value })),
              style: { ...inputSt, minHeight: 60, resize: "vertical" },
              placeholder: "Photos taken, reports submitted, site visits completed…"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMilestoneMut, message: "Failed to save — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowMilestoneForm(false);
          setEditingMilestone(null);
          saveMilestoneMut.reset();
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !milestoneForm.milestoneName.trim() || saveMilestoneMut.isPending, onClick: () => saveMilestoneMut.mutate(milestoneForm), children: saveMilestoneMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin", style: { marginRight: 6 } }),
          "Saving…"
        ] }) : editingMilestone ? "Save Changes" : "Add Milestone" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deletingProject, onOpenChange: (v) => {
      if (!v) {
        setDeletingProject(null);
        deleteProjectMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove Scheme?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "This will permanently delete ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deletingProject?.schemeName }),
          " and all its milestones. This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteProjectMut, message: "Failed to remove — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deletingProject && deleteProjectMut.mutate(deletingProject.id), style: { background: "#ef4444" }, children: "Remove" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deletingMilestone, onOpenChange: (v) => {
      if (!v) {
        setDeletingMilestone(null);
        deleteMilestoneMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove Milestone?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "This will permanently delete ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deletingMilestone?.milestoneName }),
          ". This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMilestoneMut, message: "Failed to remove — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deletingMilestone && deleteMilestoneMut.mutate(deletingMilestone.id), style: { background: "#ef4444" }, children: "Remove" })
      ] })
    ] }) })
  ] });
}
function GrantsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const _initTab = new URLSearchParams(window.location.search).get("tab");
  const [mainTab, setMainTab] = reactExports.useState(_initTab === "agrienv" ? "agrienv" : "capital");
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "grants", filter: "status", farmId, defaultValue: "all" });
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...BLANK_FORM });
  const openId = (() => {
    const n = Number(new URLSearchParams(window.location.search).get("open"));
    return n > 0 ? n : null;
  })();
  const [hlId, setHlId] = reactExports.useState(openId);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const [fetfPickerOpen, setFetfPickerOpen] = reactExports.useState(false);
  const [fetfSearch, setFetfSearch] = reactExports.useState("");
  const [uploadingId, setUploadingId] = reactExports.useState(null);
  const [quickFilter, setQuickFilter] = usePersistedFilter({
    page: "grants",
    filter: "quick",
    farmId,
    defaultValue: "",
    validValues: ["", "approved", "active", "deadlines"]
  });
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "grants", filter: "year", farmId, defaultValue: "all" });
  const [_hideArchivedStr, _setHideArchivedStr] = usePersistedFilter({
    page: "grants",
    filter: "hide-archived",
    farmId,
    defaultValue: "true",
    validValues: ["true", "false"]
  });
  const hideArchived = _hideArchivedStr !== "false";
  const setHideArchived = (v) => {
    const next = typeof v === "function" ? v(hideArchived) : v;
    _setHideArchivedStr(next ? "true" : "false");
  };
  const [screenScheme, setScreenScheme] = usePersistedFilter({
    page: "grants",
    filter: "screen-scheme",
    farmId,
    defaultValue: "all"
  });
  const [grantExportScheme, setGrantExportScheme] = usePersistedFilter({
    page: "grants",
    filter: "export-scheme",
    farmId,
    defaultValue: "all"
  });
  const [grantExportStatus, setGrantExportStatus] = usePersistedFilter({
    page: "grants",
    filter: "export-status",
    farmId,
    defaultValue: "all",
    validValues: ["all", ...STATUSES]
  });
  const { uploadFile } = useUpload();
  const { data: farm } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: async () => {
      const response = await fetch(`/api/farms/${farmId}`);
      if (!response.ok) throw new Error("Failed to load farm details");
      const result = await response.json();
      return result.record ?? result;
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1e3
  });
  const { data, isLoading } = useQuery({
    queryKey: ["grants", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/grants`);
      if (!r.ok) throw new Error("Failed to load grants");
      return r.json();
    },
    enabled: !!farmId
  });
  const records = data?.records ?? [];
  const uniqueGrantSchemeNames = reactExports.useMemo(
    () => [...new Set(records.map((r) => r.schemeName))].sort(),
    [records]
  );
  const exportFilteredRecords = reactExports.useMemo(() => {
    return records.filter((r) => {
      if (grantExportScheme !== "all" && r.schemeName !== grantExportScheme) return false;
      if (grantExportStatus !== "all" && r.status !== grantExportStatus) return false;
      return true;
    });
  }, [records, grantExportScheme, grantExportStatus]);
  function exportGrantsCsv() {
    const parts = ["grants"];
    if (grantExportScheme !== "all") {
      parts.push(grantExportScheme.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24));
    }
    if (grantExportStatus !== "all") parts.push(grantExportStatus);
    const filename = parts.join("-") + ".csv";
    const header = [
      "Scheme Name",
      "Scheme Type",
      "Item Ref Code",
      "Item Description",
      "Application Ref",
      "Agreement Ref",
      "Application Date",
      "Approval Date",
      "Purchase Deadline",
      "Claim Deadline",
      "Grant Amount (£)",
      "Actual Cost (£)",
      "Status",
      "Notes"
    ];
    const rows = [header];
    for (const r of exportFilteredRecords) {
      rows.push([
        r.schemeName,
        r.schemeType ?? "",
        r.itemReferenceCode ?? "",
        r.itemDescription ?? "",
        r.applicationReference ?? "",
        r.approvalAgreementReference ?? "",
        r.applicationDate ? new Date(r.applicationDate).toLocaleDateString("en-GB") : "",
        r.approvalDate ? new Date(r.approvalDate).toLocaleDateString("en-GB") : "",
        r.purchaseDeadline ? new Date(r.purchaseDeadline).toLocaleDateString("en-GB") : "",
        r.claimDeadline ? new Date(r.claimDeadline).toLocaleDateString("en-GB") : "",
        r.grantAmountPence != null ? (r.grantAmountPence / 100).toFixed(2) : "",
        r.actualCostPence != null ? (r.actualCostPence / 100).toFixed(2) : "",
        STATUS_CONFIG[r.status]?.label ?? r.status,
        r.notes ?? ""
      ]);
    }
    downloadCsvFile(filename, rows);
  }
  const availableYears = reactExports.useMemo(() => {
    const years = /* @__PURE__ */ new Set();
    for (const r of records) {
      const y = grantYear(r);
      if (y) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);
  const baseRecords = reactExports.useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter((r) => grantYear(r) === Number(yearFilter));
    if (hideArchived) rs = rs.filter((r) => !["claimed", "rejected", "withdrawn"].includes(r.status));
    if (screenScheme !== "all") rs = rs.filter((r) => r.schemeName === screenScheme);
    return rs;
  }, [records, yearFilter, hideArchived, screenScheme]);
  const archivedCount = reactExports.useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter((r) => grantYear(r) === Number(yearFilter));
    return rs.filter((r) => ["claimed", "rejected", "withdrawn"].includes(r.status)).length;
  }, [records, yearFilter]);
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
  const filtered = reactExports.useMemo(() => {
    if (quickFilter === "approved") {
      return baseRecords.filter((r) => ["approved", "purchased", "claimed"].includes(r.status));
    }
    if (quickFilter === "active") {
      return baseRecords.filter((r) => ["draft", "applied", "approved", "purchased"].includes(r.status));
    }
    if (quickFilter === "deadlines") {
      return baseRecords.filter((r) => {
        const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
        const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
        return purchSt === "warning" || purchSt === "overdue" || claimSt === "warning" || claimSt === "overdue";
      });
    }
    if (statusFilter !== "all") return baseRecords.filter((r) => r.status === statusFilter);
    return baseRecords;
  }, [baseRecords, statusFilter, quickFilter]);
  const totalGrantApproved = baseRecords.filter((r) => ["approved", "purchased", "claimed"].includes(r.status)).reduce((sum, r) => sum + (r.grantAmountPence ?? 0), 0);
  const warningDeadlineRecords = baseRecords.filter((r) => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "warning" || claimSt === "warning";
  });
  const overdueDeadlineRecords = baseRecords.filter((r) => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "overdue" || claimSt === "overdue";
  });
  const deadlineAlertCount = warningDeadlineRecords.length + overdueDeadlineRecords.length;
  const saveMut = useMutation({
    mutationFn: async (payload) => {
      const body = {
        schemeName: payload.schemeName,
        schemeType: payload.schemeType,
        itemReferenceCode: payload.itemReferenceCode || null,
        itemDescription: payload.itemDescription || null,
        applicationReference: payload.applicationReference || null,
        approvalAgreementReference: payload.approvalAgreementReference || null,
        applicationDate: payload.applicationDate || null,
        approvalDate: payload.approvalDate || null,
        purchaseDeadline: payload.purchaseDeadline || null,
        claimDeadline: payload.claimDeadline || null,
        grantAmountPence: payload.grantAmountGBP ? Math.round(parseFloat(payload.grantAmountGBP) * 100) : null,
        actualCostPence: payload.actualCostGBP ? Math.round(parseFloat(payload.actualCostGBP) * 100) : null,
        status: payload.status,
        notes: payload.notes || null
      };
      const url = editing ? `/api/farms/${farmId}/grants/${editing.id}` : `/api/farms/${farmId}/grants`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed to save grant");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: editing ? "Grant updated" : "Grant added" });
      setShowForm(false);
      setEditing(null);
    },
    onError: () => toast({ title: "Error saving grant", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/farms/${farmId}/grants/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Grant removed" });
      setDeleting(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK_FORM });
    setShowForm(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({
      schemeName: r.schemeName,
      schemeType: r.schemeType || "FETF",
      itemReferenceCode: r.itemReferenceCode ?? "",
      itemDescription: r.itemDescription ?? "",
      applicationReference: r.applicationReference ?? "",
      approvalAgreementReference: r.approvalAgreementReference ?? "",
      applicationDate: r.applicationDate ?? "",
      approvalDate: r.approvalDate ?? "",
      purchaseDeadline: r.purchaseDeadline ?? "",
      claimDeadline: r.claimDeadline ?? "",
      grantAmountGBP: r.grantAmountPence ? (r.grantAmountPence / 100).toFixed(0) : "",
      actualCostGBP: r.actualCostPence ? (r.actualCostPence / 100).toFixed(0) : "",
      status: r.status,
      notes: r.notes ?? ""
    });
    setShowForm(true);
  }
  function pickFetfItem(item) {
    setForm((f) => ({ ...f, itemReferenceCode: item.code, itemDescription: item.description }));
    setFetfPickerOpen(false);
    setFetfSearch("");
  }
  async function handleEvidenceUpload(record, file) {
    setUploadingId(record.id);
    try {
      const response = await uploadFile(file);
      if (!response) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: file.name })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Evidence uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  }
  async function removeDocument(record) {
    await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["grants", farmId] });
  }
  const filteredFetf = FETF_ITEMS.filter(
    (i) => !fetfSearch || i.code.toLowerCase().includes(fetfSearch.toLowerCase()) || i.description.toLowerCase().includes(fetfSearch.toLowerCase()) || i.category.toLowerCase().includes(fetfSearch.toLowerCase())
  );
  const statusCounts = reactExports.useMemo(() => {
    const counts = { all: baseRecords.length };
    for (const s of STATUSES) counts[s] = baseRecords.filter((r) => r.status === s).length;
    return counts;
  }, [baseRecords]);
  const cardApprovedRecords = baseRecords.filter((r) => ["approved", "purchased", "claimed"].includes(r.status));
  const cardActiveRecords = baseRecords.filter((r) => ["draft", "applied", "approved", "purchased"].includes(r.status));
  const cardNeedsAction = baseRecords.filter((r) => ["draft", "applied"].includes(r.status)).length;
  const isApprovedActive = quickFilter === "approved";
  const isActiveFilterOn = quickFilter === "active";
  const isDeadlinesFilterOn = quickFilter === "deadlines";
  const dlHasAlert = deadlineAlertCount > 0;
  const dlHasOverdue = overdueDeadlineRecords.length > 0;
  const dlBg = isDeadlinesFilterOn ? dlHasOverdue ? "#fef2f2" : "#fffbeb" : dlHasOverdue ? "#fef2f2" : dlHasAlert ? "#fffbeb" : "#fff";
  const dlBorder = isDeadlinesFilterOn ? dlHasOverdue ? "#f87171" : "#fbbf24" : dlHasOverdue ? "#fca5a5" : dlHasAlert ? "#fde68a" : "#e5e7eb";
  const dlAccent = dlHasOverdue ? "#dc2626" : dlHasAlert ? "#d97706" : "#9ca3af";
  const cardStyle = { borderRadius: 10, padding: "16px 20px", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.1s", userSelect: "none" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }, children: "Grants & Funding" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }, children: "Capital grants and equipment funding, plus agri-environment scheme agreements and milestones." })
      ] }),
      mainTab === "capital" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => printProReport({
              title: "Equipment & Capital Grants",
              farmName: typeof farm?.name === "string" ? farm.name : typeof farm?.farmName === "string" ? farm.farmName : void 0,
              farmAddress: farm?.address ? String(farm.address) : void 0,
              cphNumber: farm?.cphNumber ? String(farm.cphNumber) : void 0,
              sbiNumber: farm?.sbiNumber ? String(farm.sbiNumber) : void 0,
              authority: "RPA",
              authorityReferenceLabel: "RPA customer reference",
              authorityReference: farm?.rpaCustomerReference ? String(farm.rpaCustomerReference) : null,
              recordCount: exportFilteredRecords.length,
              recordLabel: "grant",
              landscape: true,
              tableHtml: document.getElementById("capital-grants-print-report")?.innerHTML ?? ""
            }),
            disabled: records.length === 0,
            style: { display: "flex", alignItems: "center", gap: 6 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
              " Print"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: exportGrantsCsv,
            disabled: records.length === 0,
            style: { display: "flex", alignItems: "center", gap: 6 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
              " Export CSV"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          " Add Grant"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #e5e7eb" }, children: [
      { key: "capital", label: "Equipment & Capital Grants" },
      { key: "agrienv", label: "Agri-environment Schemes" }
    ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setMainTab(tab.key),
        style: {
          padding: "8px 16px",
          fontSize: "0.875rem",
          fontWeight: mainTab === tab.key ? 700 : 500,
          color: mainTab === tab.key ? "#4f46e5" : "#6b7280",
          background: "none",
          border: "none",
          borderBottom: mainTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
          cursor: "pointer",
          marginBottom: -1
        },
        children: tab.label
      },
      tab.key
    )) }),
    mainTab === "capital" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `@media print { .grants-cap-screen { display: none !important; } .grants-cap-print { display: block !important; } }` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grants-cap-screen", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: { ...cardStyle, background: isApprovedActive ? "#f5f3ff" : "#fff", border: `1px solid ${isApprovedActive ? "#a78bfa" : "#e5e7eb"}`, outline: isApprovedActive ? "2px solid #7c3aed" : "none", outlineOffset: 2 },
              onClick: () => {
                setQuickFilter(isApprovedActive ? "" : "approved");
                setStatusFilter("all");
              },
              title: "Click to filter by approved, purchased & claimed",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 18, color: "#7c3aed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Approved Grant Value" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: "#111827" }, children: formatGBP(totalGrantApproved) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: isApprovedActive ? "#7c3aed" : "#6b7280", marginTop: 2 }, children: isApprovedActive ? `Showing ${cardApprovedRecords.length} record${cardApprovedRecords.length !== 1 ? "s" : ""} — click to clear` : `${cardApprovedRecords.length} approved, purchased & claimed` })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: { ...cardStyle, background: isActiveFilterOn ? "#f0fdf4" : cardActiveRecords.length > 0 ? "#f0fdf4" : "#fff", border: `1px solid ${isActiveFilterOn ? "#16a34a" : cardActiveRecords.length > 0 ? "#bbf7d0" : "#e5e7eb"}`, outline: isActiveFilterOn ? "2px solid #16a34a" : "none", outlineOffset: 2 },
              onClick: () => {
                setQuickFilter(isActiveFilterOn ? "" : "active");
                setStatusFilter("all");
              },
              title: "Click to filter active applications",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, color: "#059669" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Active Applications" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: "#111827" }, children: cardActiveRecords.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }, children: isActiveFilterOn ? `Showing ${cardActiveRecords.length} record${cardActiveRecords.length !== 1 ? "s" : ""} — click to clear` : cardNeedsAction > 0 ? `${cardNeedsAction} awaiting decision` : "all concluded or approved" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: { ...cardStyle, background: dlBg, border: `1px solid ${dlBorder}`, outline: isDeadlinesFilterOn ? `2px solid ${dlAccent}` : "none", outlineOffset: 2 },
              onClick: () => {
                setQuickFilter(isDeadlinesFilterOn ? "" : "deadlines");
                setStatusFilter("all");
              },
              title: "Click to filter records with upcoming or overdue deadlines",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: dlAccent }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: dlAccent, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Upcoming Deadlines" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.6rem", fontWeight: 700, color: dlHasAlert ? dlHasOverdue ? "#991b1b" : "#92400e" : "#111827" }, children: warningDeadlineRecords.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }, children: isDeadlinesFilterOn ? `Showing ${deadlineAlertCount} record${deadlineAlertCount !== 1 ? "s" : ""} — click to clear` : dlHasOverdue ? `within 30 days · ${overdueDeadlineRecords.length} overdue` : "Purchase or claim deadlines within 30 days" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, color: "#4338ca", style: { marginTop: 2, flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#3730a3", lineHeight: 1.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "FETF 2026:" }),
            " The full published item list and grant rates for the 2026 round have not yet been confirmed by the RPA. Item reference codes shown in the picker are based on previous FETF rounds — verify codes and eligible costs against the current prospectus before applying at",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://www.gov.uk/government/publications/farming-equipment-and-technology-fund-2025", target: "_blank", rel: "noopener noreferrer", style: { color: "#4338ca", textDecoration: "underline" }, children: [
              "gov.uk FETF guidance ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11, style: { display: "inline", verticalAlign: "middle" } })
            ] })
          ] })
        ] }),
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          marginBottom: 12,
          flexWrap: "wrap"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", flexShrink: 0 }, children: "Export & Print filter:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SchemeNameCombobox,
            {
              value: grantExportScheme,
              onChange: setGrantExportScheme,
              schemeNames: uniqueGrantSchemeNames,
              compact: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: grantExportStatus,
              onChange: (e) => setGrantExportStatus(e.target.value),
              style: { fontSize: "0.8rem", padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", background: grantExportStatus !== "all" ? "#111827" : "#fff", color: grantExportStatus !== "all" ? "#fff" : "#111827", cursor: "pointer", fontWeight: grantExportStatus !== "all" ? 600 : 400 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All statuses" }),
                STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: STATUS_CONFIG[s].label }, s))
              ]
            }
          ),
          (grantExportScheme !== "all" || grantExportStatus !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setGrantExportScheme("all");
                setGrantExportStatus("all");
              },
              style: { fontSize: "0.78rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" },
              children: "Clear"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#9ca3af", marginLeft: "auto" }, children: [
            exportFilteredRecords.length,
            " of ",
            records.length,
            " grant",
            records.length !== 1 ? "s" : "",
            " selected"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap", padding: "8px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 14, color: "#6b7280" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: yearFilter,
                onChange: (e) => {
                  const v = e.target.value;
                  setYearFilter(v);
                  setQuickFilter("");
                  setStatusFilter("all");
                },
                style: { fontSize: "0.85rem", padding: "3px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: yearFilter !== "all" ? "#eff6ff" : "#fff", color: "#111827", cursor: "pointer", fontWeight: yearFilter !== "all" ? 600 : 400 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All years" }),
                  availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)),
                  availableYears.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { disabled: true, children: "No years available" })
                ]
              }
            )
          ] }),
          uniqueGrantSchemeNames.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 1, height: 18, background: "#e5e7eb" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SchemeNameCombobox,
              {
                value: screenScheme,
                onChange: (v) => {
                  setScreenScheme(v);
                  setQuickFilter("");
                  setStatusFilter("all");
                },
                schemeNames: uniqueGrantSchemeNames,
                compact: true
              }
            )
          ] }),
          (archivedCount > 0 || !hideArchived) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 1, height: 18, background: "#e5e7eb" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  setHideArchived((h) => !h);
                  setQuickFilter("");
                },
                style: { display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", padding: "3px 10px", borderRadius: 6, border: "1px solid", background: hideArchived ? "#fff" : "#fef9c3", borderColor: hideArchived ? "#e5e7eb" : "#fbbf24", color: hideArchived ? "#374151" : "#92400e", cursor: "pointer", fontWeight: 500 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { size: 13 }),
                  hideArchived ? `Show archived (${archivedCount})` : `Hide archived (${archivedCount})`
                ]
              }
            )
          ] }),
          (yearFilter !== "all" || !hideArchived || screenScheme !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setYearFilter("all");
                setHideArchived(true);
                setQuickFilter("");
                setStatusFilter("all");
                setScreenScheme("all");
              },
              style: { fontSize: "0.78rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginLeft: 2 },
              children: "Reset filters"
            }
          ),
          records.length > 0 && availableYears.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }, children: "Add an Application Date to records to enable year filtering" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }, children: ["all", ...STATUSES].map((s) => {
          const count = statusCounts[s] ?? 0;
          const active = statusFilter === s;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setStatusFilter(s);
                setQuickFilter("");
              },
              style: {
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.8rem",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                border: "1px solid",
                background: active ? "#f0f4ff" : "#fff",
                borderColor: active ? "#6366f1" : "#e5e7eb",
                color: active ? "#3730a3" : "#374151"
              },
              children: [
                s === "all" ? "All" : STATUS_CONFIG[s].label,
                " (",
                count,
                ")"
              ]
            },
            s
          );
        }) }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: 60, color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin", style: { display: "inline" } }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 32, color: "#d1d5db", style: { margin: "0 auto 12px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: quickFilter === "approved" ? "No approved grants" : quickFilter === "active" ? "No active applications" : quickFilter === "deadlines" ? "No upcoming or overdue deadlines" : statusFilter !== "all" ? `No ${STATUS_CONFIG[statusFilter]?.label?.toLowerCase() ?? statusFilter} grants` : records.length === 0 ? "No grants recorded yet" : "No records match the current filters" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#6b7280", fontSize: "0.875rem", marginBottom: 16 }, children: records.length === 0 ? "Add your first FETF or scheme application to start tracking deadlines and grant values." : hideArchived && archivedCount > 0 ? `${archivedCount} archived record${archivedCount !== 1 ? "s" : ""} (claimed, rejected, withdrawn) are hidden — click "Show archived" above to reveal them.` : yearFilter !== "all" ? `No records have an application or approval date in ${yearFilter}. Switch to "All years" to see all records.` : "Try adjusting the year filter or status tabs." }),
          records.length === 0 && !quickFilter && statusFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, variant: "outline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
            " Add Grant"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Scheme / Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Grant Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Actual Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Purchase Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Claim Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: "Evidence" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", width: 80 } })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              ref: (el) => {
                if (el) rowRefs.current.set(r.id, el);
              },
              style: { borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" },
              className: `transition-colors${hlId === r.id ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : ""}`,
              onMouseEnter: (e) => {
                if (hlId !== r.id) e.currentTarget.style.background = "#f9fafb";
              },
              onMouseLeave: (e) => {
                if (hlId !== r.id) e.currentTarget.style.background = "";
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "12px 16px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, color: "#111827" }, children: r.schemeName }),
                  r.itemReferenceCode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#7c3aed", fontWeight: 500, marginTop: 2 }, children: r.itemReferenceCode }),
                  r.itemDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 1, maxWidth: 280 }, children: r.itemDescription }),
                  r.applicationReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }, children: [
                    "App ref: ",
                    r.applicationReference
                  ] }),
                  r.approvalAgreementReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#15803d", fontWeight: 500, marginTop: 2 }, children: [
                    "Agreement: ",
                    r.approvalAgreementReference
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#059669" }, children: formatGBP(r.grantAmountPence) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px", textAlign: "right", color: "#374151" }, children: formatGBP(r.actualCostPence) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: ["claimed", "rejected", "withdrawn"].includes(r.status) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: formatDate(r.purchaseDeadline) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeadlineBadge, { dateStr: r.purchaseDeadline }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: ["claimed", "rejected", "withdrawn"].includes(r.status) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: formatDate(r.claimDeadline) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeadlineBadge, { dateStr: r.claimDeadline }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: r.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "a",
                    {
                      href: `/api/storage${r.documentPath}`,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: { display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: "0.78rem", textDecoration: "none" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }),
                        " ",
                        r.documentName ?? "View"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeDocument(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#6b7280", fontSize: "0.78rem" }, children: [
                  uploadingId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 13 }),
                  uploadingId === r.id ? "Uploading…" : "Attach",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "file",
                      accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
                      style: { display: "none" },
                      onChange: (e) => {
                        const f = e.target.files?.[0];
                        if (f) handleEvidenceUpload(r, f);
                        e.target.value = "";
                      }
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, justifyContent: "flex-end" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 15 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => openEdit(r),
                      style: { background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 4 },
                      onMouseEnter: (e) => e.currentTarget.style.color = "#111827",
                      onMouseLeave: (e) => e.currentTarget.style.color = "#6b7280",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 15 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleting(r), style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 15 }) }),
                  !["claimed", "rejected", "withdrawn"].includes(r.status) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(r), style: { background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 4, borderRadius: 4 }, title: "Raise Task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 15 }) }),
                  (r.schemeType === "SFI" || r.schemeType === "CS") && ["approved", "purchased", "claimed"].includes(r.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => {
                        const schemeName = r.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
                        const prefill = btoa(JSON.stringify({ agreementNumber: r.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
                        navigate(`/sfi?prefill=${prefill}`);
                      },
                      style: { background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4, borderRadius: 4 },
                      title: "Start SFI / ELM Record",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 15 })
                    }
                  )
                ] }) })
              ]
            },
            r.id
          )) })
        ] }) }) })
      ] }),
      exportFilteredRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "capital-grants-print-report", className: "grants-cap-print", style: { display: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontFamily: "Georgia, serif", color: "#111827", padding: "0 0 24px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 }, children: "Equipment & Capital Grants" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 24 }, children: [
          "Exported ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
          grantExportScheme !== "all" && ` · Scheme: ${grantExportScheme}`,
          grantExportStatus !== "all" && ` · Status: ${STATUS_CONFIG[grantExportStatus]?.label ?? grantExportStatus}`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "2px solid #e5e7eb" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "6px 12px 6px 0", fontWeight: 600 }, children: "Scheme / Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "6px 12px", fontWeight: 600 }, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "6px 0 6px 12px", fontWeight: 600 }, children: "Grant (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "6px 0 6px 12px", fontWeight: 600 }, children: "Actual Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "6px 0 6px 12px", fontWeight: 600 }, children: "Purchase Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "6px 0", fontWeight: 600 }, children: "Claim Deadline" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: exportFilteredRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", pageBreakInside: "avoid" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "6px 12px 6px 0", verticalAlign: "top" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600 }, children: r.schemeName }),
              r.itemReferenceCode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#7c3aed" }, children: r.itemReferenceCode }),
              r.itemDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: r.itemDescription }),
              r.applicationReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: [
                "App ref: ",
                r.applicationReference
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 12px", verticalAlign: "top" }, children: STATUS_CONFIG[r.status]?.label ?? r.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 0 6px 12px", textAlign: "right", verticalAlign: "top", fontWeight: 600 }, children: r.grantAmountPence != null ? `£${(r.grantAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 0 6px 12px", textAlign: "right", verticalAlign: "top" }, children: r.actualCostPence != null ? `£${(r.actualCostPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 0 6px 12px", verticalAlign: "top", whiteSpace: "nowrap" }, children: formatDate(r.purchaseDeadline) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 0", verticalAlign: "top", whiteSpace: "nowrap" }, children: formatDate(r.claimDeadline) })
          ] }, r.id)) })
        ] })
      ] }) }),
      viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Grant / Funding Record" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Scheme" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.schemeName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.schemeType || "—" })
            ] }),
            viewRecord.itemReferenceCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Item Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.itemReferenceCode })
            ] }),
            viewRecord.applicationReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Application Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.applicationReference })
            ] }),
            viewRecord.approvalAgreementReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium mb-1", style: { color: "#166534" }, children: "RPA Agreement Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-semibold", style: { color: "#15803d" }, children: viewRecord.approvalAgreementReference })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capitalize", children: viewRecord.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Application Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.applicationDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Approval Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.approvalDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Claim Deadline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.claimDeadline) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Purchase Deadline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.purchaseDeadline) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Grant Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatGBP(viewRecord.grantAmountPence) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Actual Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatGBP(viewRecord.actualCostPence) })
            ] })
          ] }),
          viewRecord.itemDescription && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Item Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewRecord.itemDescription })
          ] }),
          viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.notes })
          ] }),
          viewRecord.documentPath && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/api/storage${viewRecord.documentPath}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-blue-600 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }),
              viewRecord.documentName ?? "View Document"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          (viewRecord.schemeType === "SFI" || viewRecord.schemeType === "CS") && ["approved", "purchased", "claimed"].includes(viewRecord.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              style: { borderColor: "#16a34a", color: "#16a34a", marginRight: "auto" },
              onClick: () => {
                const schemeName = viewRecord.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
                const prefill = btoa(JSON.stringify({ agreementNumber: viewRecord.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
                setViewRecord(null);
                navigate(`/sfi?prefill=${prefill}`);
              },
              children: [
                "Start SFI / ELM Record ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14, className: "ml-1" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
            openEdit(viewRecord);
            setViewRecord(null);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14, className: "mr-1" }),
            "Edit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: (v) => {
        if (!v) {
          setShowForm(false);
          setEditing(null);
          saveMut.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Grant" : "Add Grant / Funding Application" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          saveMut.mutate(form);
        }, style: { display: "grid", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Scheme Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.schemeName,
                  onChange: (e) => setForm((f) => ({ ...f, schemeName: e.target.value })),
                  placeholder: "e.g. FETF 2026, CS Capital, SFI Capital",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Scheme Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: SCHEME_TYPES.filter((t) => t !== "Other").includes(form.schemeType) ? form.schemeType : "Other",
                  onChange: (e) => setForm((f) => ({ ...f, schemeType: e.target.value })),
                  style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" },
                  children: SCHEME_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t === "Other" ? "Other (please specify)" : t }, t))
                }
              ),
              (form.schemeType === "Other" || form.schemeType && !SCHEME_TYPES.filter((t) => t !== "Other").includes(form.schemeType)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  style: { marginTop: 4, fontSize: "0.875rem" },
                  value: form.schemeType === "Other" ? "" : form.schemeType,
                  onChange: (e) => setForm((f) => ({ ...f, schemeType: e.target.value || "Other" })),
                  placeholder: "Please specify scheme type…",
                  autoFocus: form.schemeType === "Other"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Item Reference Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.itemReferenceCode,
                  onChange: (e) => setForm((f) => ({ ...f, itemReferenceCode: e.target.value })),
                  placeholder: "e.g. T-SYS-1, LESS-2, ANH-2",
                  style: { flex: 1 }
                }
              ),
              form.schemeType === "FETF" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setFetfPickerOpen(true), style: { whiteSpace: "nowrap", fontSize: "0.8rem" }, children: "Browse FETF items" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Item Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.itemDescription,
                onChange: (e) => setForm((f) => ({ ...f, itemDescription: e.target.value })),
                placeholder: "e.g. Auto-steering GPS system for 6m tractor"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Application Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.applicationReference,
                onChange: (e) => setForm((f) => ({ ...f, applicationReference: e.target.value })),
                placeholder: "RPA / scheme application reference number"
              }
            )
          ] }),
          (form.schemeType === "SFI" || form.schemeType === "CS") && ["approved", "purchased", "claimed"].includes(form.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "12px 14px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#166534", display: "block", marginBottom: 4 }, children: [
              "RPA Agreement / Approval Reference",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#15803d", marginLeft: 6 }, children: "— issued by RPA on approval" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.approvalAgreementReference,
                onChange: (e) => setForm((f) => ({ ...f, approvalAgreementReference: e.target.value })),
                placeholder: form.schemeType === "SFI" ? "e.g. SFI-2024-123456" : "e.g. CS-2024-78901",
                style: { borderColor: "#86efac" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#15803d", marginTop: 6 }, children: "This reference carries through to the SFI / ELM page when you start your agreement record." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Application Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.applicationDate, onChange: (e) => setForm((f) => ({ ...f, applicationDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Approval Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.approvalDate, onChange: (e) => setForm((f) => ({ ...f, approvalDate: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
                "Purchase Deadline",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#6b7280" }, children: " — must buy by" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.purchaseDeadline, onChange: (e) => setForm((f) => ({ ...f, purchaseDeadline: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
                "Claim Deadline",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#6b7280" }, children: " — must claim by" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.claimDeadline, onChange: (e) => setForm((f) => ({ ...f, claimDeadline: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Grant Amount (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "0",
                  step: "1",
                  value: form.grantAmountGBP,
                  onChange: (e) => setForm((f) => ({ ...f, grantAmountGBP: e.target.value })),
                  placeholder: "Amount payable by scheme"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Actual Item Cost (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "0",
                  step: "1",
                  value: form.actualCostGBP,
                  onChange: (e) => setForm((f) => ({ ...f, actualCostGBP: e.target.value })),
                  placeholder: "Total purchase price"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: form.status,
                onChange: (e) => setForm((f) => ({ ...f, status: e.target.value })),
                style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" },
                children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: STATUS_CONFIG[s].label }, s))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: form.notes,
                onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
                rows: 3,
                placeholder: "Any additional notes about this application…",
                style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
              setShowForm(false);
              setEditing(null);
            }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }),
              " Saving…"
            ] }) : editing ? "Save Changes" : "Add Grant" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: fetfPickerOpen, onOpenChange: setFetfPickerOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 640, maxHeight: "80vh", display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "FETF Item Reference Picker" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", margin: "0 0 12px" }, children: "Based on previous FETF rounds — verify against the current RPA prospectus before applying." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: fetfSearch,
            onChange: (e) => setFetfSearch(e.target.value),
            placeholder: "Search by code, description, or category…",
            style: { marginBottom: 12 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2 }, children: filteredFetf.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }, children: "No items match your search." }) : filteredFetf.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => pickFetfItem(item),
            style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", width: "100%" },
            onMouseEnter: (e) => e.currentTarget.style.background = "#f3f4f6",
            onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", marginTop: 1 }, children: item.code }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", fontWeight: 500, color: "#111827" }, children: item.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }, children: item.category })
              ] })
            ]
          },
          item.code
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleting, onOpenChange: (v) => {
        if (!v) {
          setDeleting(null);
          deleteMut.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove Grant?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
            "This will permanently delete the record for ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleting?.schemeName }),
            ". This cannot be undone."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to remove — please try again." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AlertDialogAction,
            {
              onClick: () => deleting && deleteMut.mutate(deleting.id),
              style: { background: "#ef4444" },
              children: "Remove"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        RaiseTaskDialog,
        {
          farmId,
          open: !!raiseTaskFor,
          onClose: () => setRaiseTaskFor(null),
          defaultTitle: raiseTaskFor ? `Grant Action — ${raiseTaskFor.schemeName}` : "",
          defaultDescription: raiseTaskFor ? [
            raiseTaskFor.purchaseDeadline ? `Purchase deadline: ${new Date(raiseTaskFor.purchaseDeadline).toLocaleDateString("en-GB")}` : "",
            raiseTaskFor.claimDeadline ? `Claim deadline: ${new Date(raiseTaskFor.claimDeadline).toLocaleDateString("en-GB")}` : ""
          ].filter(Boolean).join("\n") : "",
          module: "grants"
        }
      )
    ] }),
    mainTab === "agrienv" && /* @__PURE__ */ jsxRuntimeExports.jsx(AgriEnvTab, { farmId, farm })
  ] }) });
}
export {
  GrantsPage as default
};
