import { useState, useMemo, useRef, useEffect } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useUpload } from "@workspace/object-storage-web";
import { Plus, Trash2, Pencil, FileText, Upload, Loader2, X, ExternalLink, PoundSterling, AlertTriangle, CheckCircle2, Clock, Info, Eye, ClipboardList, ArrowRight, CalendarDays, Archive, ChevronDown, Leaf, Download, Printer } from "lucide-react";
import { downloadCsvFile } from "@/lib/csv";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { useLocation } from "wouter";

// ─── FETF Item Reference Data ──────────────────────
const FETF_ITEMS: { code: string; description: string; category: string }[] = [
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
  { code: "ENV-2", description: "Solar panels for on-farm energy generation", category: "Environment & Energy" },
];

const SCHEME_TYPES = ["FETF", "CS", "SFI", "RDPE", "Other"] as const;
type SchemeType = typeof SCHEME_TYPES[number];

const STATUSES = ["draft", "applied", "approved", "purchased", "claimed", "rejected", "withdrawn"] as const;
type GrantStatus = typeof STATUSES[number];

const STATUS_CONFIG: Record<GrantStatus, { label: string; bg: string; text: string; border: string }> = {
  draft:     { label: "Draft",     bg: "bg-gray-50",    text: "text-gray-700",   border: "border-gray-200" },
  applied:   { label: "Applied",   bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  approved:  { label: "Approved",  bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200" },
  purchased: { label: "Purchased", bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200" },
  claimed:   { label: "Claimed",   bg: "bg-teal-50",    text: "text-teal-700",   border: "border-teal-200" },
  rejected:  { label: "Rejected",  bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200" },
};

interface GrantRecord {
  id: number;
  schemeName: string;
  schemeType: string;
  itemReferenceCode: string | null;
  itemDescription: string | null;
  applicationReference: string | null;
  approvalAgreementReference: string | null;
  applicationDate: string | null;
  approvalDate: string | null;
  purchaseDeadline: string | null;
  claimDeadline: string | null;
  grantAmountPence: number | null;
  actualCostPence: number | null;
  status: GrantStatus;
  notes: string | null;
  documentPath: string | null;
  documentName: string | null;
}

function formatGBP(pence: number | null) {
  if (!pence) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function deadlineStatus(dateStr: string | null): "overdue" | "warning" | "ok" | "none" {
  if (!dateStr) return "none";
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "overdue";
  if (diff <= 30) return "warning";
  return "ok";
}

function grantYear(r: GrantRecord): number | null {
  const d = r.applicationDate || r.approvalDate;
  return d ? new Date(d).getFullYear() : null;
}

function DeadlineBadge({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return <span className="text-gray-400 text-sm">—</span>;
  const status = deadlineStatus(dateStr);
  const formatted = formatDate(dateStr);
  const styles: Record<string, string> = {
    overdue: "bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded font-semibold",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded font-semibold",
    ok: "bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded font-medium",
  };
  return <span className={styles[status]}>{formatted}</span>;
}

function StatusBadge({ status }: { status: GrantStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

const BLANK_FORM = {
  schemeName: "",
  schemeType: "FETF" as SchemeType,
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
  status: "applied" as GrantStatus,
  notes: "",
};

// ─── Agri-environment Scheme Types ────────────────────────────────────────────
interface AgriEnvProject {
  id: number;
  schemeName: string;
  administeringBody: string | null;
  agreementReference: string | null;
  designatedLandscape: string | null;
  theme: string | null;
  startDate: string | null;
  endDate: string | null;
  totalGrantValuePence: number | null;
  status: string;
  notes: string | null;
}

interface AgriEnvMilestone {
  id: number;
  projectId: number;
  milestoneName: string;
  dueDate: string | null;
  completionDate: string | null;
  claimAmountPence: number | null;
  status: string;
  evidenceNotes: string | null;
}

const AE_PROJECT_STATUS_CFG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  applied:   { label: "Applied",   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  active:    { label: "Active",    bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  completed: { label: "Completed", bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200" },
  suspended: { label: "Suspended", bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-100",  text: "text-gray-500",   border: "border-gray-200" },
};

const AE_MILESTONE_STATUS_CFG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: "Pending",   bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200" },
  submitted: { label: "Submitted", bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  paid:      { label: "Paid",      bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  overdue:   { label: "Overdue",   bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
};

const AE_COMMON_SCHEMES = [
  "FiPL (Farming in Protected Landscapes)",
  "SFI (Sustainable Farming Incentive)",
  "Countryside Stewardship (CS)",
  "ELMs (Environmental Land Management)",
  "RDPE",
  "AONB Stewardship",
];
const AE_COMMON_BODIES = [
  "Natural England",
  "RPA (Rural Payments Agency)",
  "National Park Authority",
  "AONB Partnership",
  "Local Authority",
];
const AE_FIPL_THEMES    = ["Climate", "Nature", "People", "Place", "Multiple", "General / Other"];
const AE_PROJECT_STATUSES = ["applied", "active", "completed", "suspended", "withdrawn"] as const;
const AE_MILESTONE_STATUSES = ["pending", "submitted", "paid", "overdue"] as const;
const AE_MILESTONE_FILTERS = ["all", ...AE_MILESTONE_STATUSES] as const;

const AE_BLANK_PROJECT = {
  schemeName: "", administeringBody: "", agreementReference: "",
  designatedLandscape: "", theme: "", startDate: "", endDate: "",
  totalGrantValueGBP: "", status: "active", notes: "",
};

const AE_BLANK_MILESTONE = {
  milestoneName: "", dueDate: "", completionDate: "",
  claimAmountGBP: "", status: "pending", evidenceNotes: "",
};

function AeProjectBadge({ status }: { status: string }) {
  const cfg = AE_PROJECT_STATUS_CFG[status] ?? AE_PROJECT_STATUS_CFG.active!;
  return <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>{cfg.label}</span>;
}

function AeMilestoneBadge({ status }: { status: string }) {
  const cfg = AE_MILESTONE_STATUS_CFG[status] ?? AE_MILESTONE_STATUS_CFG.pending!;
  return <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>{cfg.label}</span>;
}

// ─── Scheme Name Combobox ─────────────────────────────────────────────────────
// A type-to-filter combobox for selecting a scheme name (or "All schemes").
// `value` is either "all" or a scheme name string.
// Implements ARIA combobox pattern with full keyboard navigation.
interface SchemeNameComboboxProps {
  value: string;
  onChange: (value: string) => void;
  schemeNames: string[];
  compact?: boolean; // smaller width for the export/print bar
}

function SchemeNameCombobox({ value, onChange, schemeNames, compact = false }: SchemeNameComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // -1 = "All schemes" entry; 0..n-1 = index in filteredNames
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useRef(`snc-listbox-${Math.random().toString(36).slice(2)}`).current;

  // Options filtered by the current query
  const filteredNames = useMemo(() => {
    if (!query.trim()) return schemeNames;
    const q = query.toLowerCase();
    return schemeNames.filter(n => n.toLowerCase().includes(q));
  }, [schemeNames, query]);

  // All options including the "all" sentinel at index -1
  // activeIdx -1 → "All schemes", 0..n-1 → filteredNames[i]
  const totalOptions = filteredNames.length + 1; // +1 for "All schemes"

  // Keep activeIdx in bounds when filtered list shrinks
  useEffect(() => {
    setActiveIdx(-1);
  }, [query]);

  // Scroll the active option into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  function select(v: string) {
    onChange(v);
    closeDropdown();
    inputRef.current?.blur();
  }

  function handleFocus() {
    setQuery("");
    setActiveIdx(-1);
    setOpen(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      // -1 is "All schemes", then 0..filteredNames.length-1
      setActiveIdx(i => (i + 1 < filteredNames.length ? i + 1 : filteredNames.length === 0 ? -1 : filteredNames.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => (i > -1 ? i - 1 : -1));
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
  // While the dropdown is open, show the typed query; when closed, show the selected label
  const inputVal = open ? query : (value === "all" ? "" : value);

  // Active descendant id
  function optionId(idx: number) {
    return idx === -1 ? `${listboxId}-all` : `${listboxId}-opt-${idx}`;
  }

  const inputStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    padding: "4px 28px 4px 8px",
    borderRadius: 6,
    border: isActive ? "1.5px solid #374151" : "1px solid #d1d5db",
    background: isActive ? "#111827" : "#fff",
    color: isActive ? "#fff" : "#111827",
    cursor: "text",
    outline: "none",
    width: compact ? 180 : 220,
    boxSizing: "border-box" as const,
  };

  function optionStyle(selected: boolean, active: boolean): React.CSSProperties {
    return {
      padding: "8px 12px",
      fontSize: "0.8rem",
      cursor: "pointer",
      background: active ? "#e0f2fe" : selected ? "#f0fdf4" : "#fff",
      color: active ? "#0369a1" : selected ? "#166534" : "#111827",
      fontWeight: selected || active ? 600 : 400,
      borderBottom: "1px solid #f3f4f6",
      outline: "none",
    };
  }

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={open ? optionId(activeIdx) : undefined}
          aria-label="Filter by scheme name"
          autoComplete="off"
          value={inputVal}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={open ? "Type to filter schemes…" : "All schemes"}
          style={inputStyle}
        />
        {/* Chevron indicator */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            pointerEvents: "none", color: isActive ? "rgba(255,255,255,0.7)" : "#9ca3af",
            fontSize: "0.65rem",
          }}
        >
          ▾
        </span>
      </div>

      {open && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Scheme names"
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: compact ? 200 : 240,
            maxHeight: 260, overflowY: "auto",
          }}
        >
          {/* "All schemes" option */}
          <div
            id={optionId(-1)}
            role="option"
            aria-selected={value === "all"}
            data-active={activeIdx === -1 ? "true" : undefined}
            onMouseDown={e => { e.preventDefault(); select("all"); }}
            onMouseEnter={() => setActiveIdx(-1)}
            style={optionStyle(value === "all", activeIdx === -1)}
          >
            All schemes
          </div>

          {filteredNames.length === 0 ? (
            <div role="status" style={{ padding: "10px 12px", fontSize: "0.8rem", color: "#9ca3af" }}>
              No matching schemes
            </div>
          ) : (
            filteredNames.map((n, i) => (
              <div
                key={n}
                id={optionId(i)}
                role="option"
                aria-selected={value === n}
                data-active={activeIdx === i ? "true" : undefined}
                onMouseDown={e => { e.preventDefault(); select(n); }}
                onMouseEnter={() => setActiveIdx(i)}
                style={optionStyle(value === n, activeIdx === i)}
              >
                {n}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AgriEnvTab({ farmId }: { farmId: number | null }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  // expandedId — persisted per farm via direct localStorage access.
  // We manage this ourselves (not via usePersistedFilter) to avoid the hook's
  // async rehydration lag: on a farm switch both effects run in the same flush,
  // so a usePersistedFilter-derived value would still reflect the prior farm's
  // ID and could overwrite the new farm's key with an empty string.
  const [expandedId, _setExpandedIdRaw] = useState<number | null>(null);

  // Write helper — updates React state and localStorage in lockstep.
  const setExpandedId = (id: number | null) => {
    _setExpandedIdRaw(id);
    if (farmId === null) return;
    try {
      const key = `grants-agri-env-expanded-project-filter-${farmId}`;
      if (id !== null) { localStorage.setItem(key, String(id)); }
      else             { localStorage.removeItem(key); }
    } catch { /* localStorage unavailable */ }
  };

  // Initialise from localStorage (or the ?project= URL param) once per unique
  // farmId, so we always read from the correct farm's storage key.
  const _initFarmIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (farmId === null || _initFarmIdRef.current === farmId) return;
    _initFarmIdRef.current = farmId;
    // URL param takes precedence over stored value
    const urlId = Number(new URLSearchParams(window.location.search).get("project"));
    if (urlId > 0) { setExpandedId(urlId); return; }
    // Otherwise restore the farm's stored value
    try {
      const v = localStorage.getItem(`grants-agri-env-expanded-project-filter-${farmId}`);
      const n = v ? Number(v) : 0;
      _setExpandedIdRaw(n > 0 ? n : null);
    } catch { _setExpandedIdRaw(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  // The milestone status tab belongs to the expanded project, so include the
  // project ID in the filter name while the hook scopes the value to the farm.
  // This lets each project resume on the status view the advisor last used.
  const [milestoneFilter, setMilestoneFilter] = usePersistedFilter({
    page: "grants-agri-env",
    filter: expandedId === null ? "milestone-status-none" : `milestone-status-${expandedId}`,
    farmId,
    defaultValue: "all",
    validValues: AE_MILESTONE_FILTERS,
  });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<AgriEnvProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<AgriEnvProject | null>(null);
  const [projectForm, setProjectForm] = useState({ ...AE_BLANK_PROJECT });

  // Milestone state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<AgriEnvMilestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<AgriEnvMilestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({ ...AE_BLANK_MILESTONE });
  // Inline status update state
  const [pendingCompletion, setPendingCompletion] = useState<{ milestoneId: number; projectId: number; newStatus: string; date: string } | null>(null);
  const [updatingMilestone, setUpdatingMilestone] = useState<number | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data: projData, isLoading, isSuccess: projIsSuccess } = useQuery({
    queryKey: ["agri-env-projects", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects`);
      if (!r.ok) throw new Error("Failed to load agri-env projects");
      return r.json() as Promise<{ projects: AgriEnvProject[] }>;
    },
    enabled: !!farmId,
  });

  const { data: msData } = useQuery({
    queryKey: ["agri-env-milestones", farmId, expandedId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones`);
      if (!r.ok) throw new Error("Failed to load milestones");
      return r.json() as Promise<{ milestones: AgriEnvMilestone[] }>;
    },
    enabled: !!farmId && expandedId !== null,
  });

  // Fetch all milestones across all projects for deadline summary banner
  const { data: allMsData } = useQuery({
    queryKey: ["agri-env-all-milestones", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-milestones`);
      if (!r.ok) throw new Error("Failed to load milestones");
      return r.json() as Promise<{ milestones: AgriEnvMilestone[] }>;
    },
    enabled: !!farmId,
  });

  const projects = projData?.projects ?? [];
  const milestones = msData?.milestones ?? [];
  const allMilestones = allMsData?.milestones ?? [];
  const visibleMilestones = milestoneFilter === "all"
    ? milestones
    : milestones.filter(m => m.status === milestoneFilter);

  // If the persisted project has been deleted, collapse gracefully.
  // Read from localStorage directly (keyed on the current farmId) rather than
  // from the derived expandedId state.  This prevents a prior-farm ID from
  // being validated against the new farm's project list during a farm switch,
  // and also handles an empty project list (projIsSuccess, not length > 0).
  useEffect(() => {
    if (!projIsSuccess || farmId === null) return;
    const key = `grants-agri-env-expanded-project-filter-${farmId}`;
    try {
      const stored = localStorage.getItem(key);
      const storedId = stored ? Number(stored) : 0;
      if (storedId > 0 && !projects.some(p => p.id === storedId)) {
        localStorage.removeItem(key);
        _setExpandedIdRaw(null);
      }
    } catch { /* localStorage unavailable */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projIsSuccess, farmId, projects]);

  // ── On-screen status filter (persisted per farm) ─────────────────────────
  const [aeScreenStatus, setAeScreenStatus] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "screen-status",
    farmId,
    defaultValue: "all",
    validValues: ["all", ...AE_PROJECT_STATUSES] as readonly string[],
  });

  // ── On-screen scheme name filter (persisted per farm) ────────────────────
  const [aeScreenScheme, setAeScreenScheme] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "screen-scheme",
    farmId,
    defaultValue: "all",
  });

  const screenFilteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (aeScreenStatus !== "all" && p.status !== aeScreenStatus) return false;
      if (aeScreenScheme !== "all" && p.schemeName !== aeScreenScheme) return false;
      return true;
    });
  }, [projects, aeScreenStatus, aeScreenScheme]);

  // ── Export / print filter state (persisted per farm) ────────────────────
  const [aeExportScheme, setAeExportScheme] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "export-scheme",
    farmId,
    defaultValue: "all",
  });
  const [aeExportStatus, setAeExportStatus] = usePersistedFilter({
    page: "grants-agri-env",
    filter: "export-status",
    farmId,
    defaultValue: "all",
    validValues: ["all", ...AE_PROJECT_STATUSES] as readonly string[],
  });

  const uniqueSchemeNames = useMemo(
    () => [...new Set(projects.map(p => p.schemeName))].sort(),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (aeExportScheme !== "all" && p.schemeName !== aeExportScheme) return false;
      if (aeExportStatus !== "all" && p.status !== aeExportStatus) return false;
      return true;
    });
  }, [projects, aeExportScheme, aeExportStatus]);

  function exportFilename() {
    const parts: string[] = ["agri-environment"];
    if (aeExportScheme !== "all") {
      parts.push(aeExportScheme.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24));
    }
    if (aeExportStatus !== "all") parts.push(aeExportStatus);
    return parts.join("-") + ".csv";
  }

  const schemeProjects = aeScreenScheme === "all" ? projects : projects.filter(p => p.schemeName === aeScreenScheme);

  // Deadline counts — scoped to the selected scheme's projects (or farm-wide when "All schemes")
  const schemeProjectIds = useMemo(() => new Set(schemeProjects.map(p => p.id)), [schemeProjects]);
  const pendingMilestones = allMilestones.filter(m => m.status !== "paid" && schemeProjectIds.has(m.projectId));
  const overdueMs  = pendingMilestones.filter(m => deadlineStatus(m.dueDate) === "overdue").length;
  const upcomingMs = pendingMilestones.filter(m => deadlineStatus(m.dueDate) === "warning").length;
  const activeCount    = schemeProjects.filter(p => ["applied", "active"].includes(p.status)).length;
  const completedCount = schemeProjects.filter(p => p.status === "completed").length;
  const totalValue     = schemeProjects.filter(p => p.status !== "withdrawn").reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);

  const saveProjectMut = useMutation({
    mutationFn: async (payload: typeof projectForm) => {
      const body = {
        schemeName:          payload.schemeName,
        administeringBody:   payload.administeringBody   || null,
        agreementReference:  payload.agreementReference  || null,
        designatedLandscape: payload.designatedLandscape || null,
        theme:               payload.theme               || null,
        startDate:           payload.startDate           || null,
        endDate:             payload.endDate             || null,
        totalGrantValuePence: payload.totalGrantValueGBP ? Math.round(parseFloat(payload.totalGrantValueGBP) * 100) : null,
        status:              payload.status,
        notes:               payload.notes               || null,
      };
      const url = editingProject
        ? `/api/farms/${farmId}/agri-env-projects/${editingProject.id}`
        : `/api/farms/${farmId}/agri-env-projects`;
      const r = await fetch(url, { method: editingProject ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text().catch(() => "Save failed"));
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-projects", farmId] });
      toast({ title: editingProject ? "Scheme updated" : "Scheme added" });
      setShowProjectForm(false); setEditingProject(null);
    },
  });

  const deleteProjectMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text().catch(() => "Delete failed"));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-projects", farmId] });
      // Deleting a project removes all its milestones — refresh the aggregate count too
      qc.invalidateQueries({ queryKey: ["agri-env-all-milestones", farmId] });
      toast({ title: "Scheme removed" });
      setDeletingProject(null);
      if (expandedId === deletingProject?.id) setExpandedId(null);
    },
  });

  const saveMilestoneMut = useMutation({
    mutationFn: async (payload: typeof milestoneForm) => {
      const body = {
        milestoneName:    payload.milestoneName,
        dueDate:          payload.dueDate        || null,
        completionDate:   payload.completionDate || null,
        claimAmountPence: payload.claimAmountGBP ? Math.round(parseFloat(payload.claimAmountGBP) * 100) : null,
        status:           payload.status,
        evidenceNotes:    payload.evidenceNotes  || null,
      };
      const url = editingMilestone
        ? `/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones/${editingMilestone.id}`
        : `/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones`;
      const r = await fetch(url, { method: editingMilestone ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text().catch(() => "Save failed"));
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-milestones", farmId, expandedId] });
      // Also refresh the aggregate deadline banner
      qc.invalidateQueries({ queryKey: ["agri-env-all-milestones", farmId] });
      toast({ title: editingMilestone ? "Milestone updated" : "Milestone added" });
      setShowMilestoneForm(false); setEditingMilestone(null);
    },
  });

  const deleteMilestoneMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${expandedId}/milestones/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text().catch(() => "Delete failed"));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agri-env-milestones", farmId, expandedId] });
      // Also refresh the aggregate deadline banner
      qc.invalidateQueries({ queryKey: ["agri-env-all-milestones", farmId] });
      toast({ title: "Milestone removed" });
      setDeletingMilestone(null);
    },
  });

  const updateMilestoneStatusMut = useMutation({
    mutationFn: async ({ milestoneId, projectId, status, completionDate }: { milestoneId: number; projectId: number; status: string; completionDate?: string | null }) => {
      const body: Record<string, unknown> = { status };
      // Include completionDate whenever it is explicitly provided (even null, to clear it)
      if (completionDate !== undefined) body.completionDate = completionDate ?? null;
      const r = await fetch(`/api/farms/${farmId}/agri-env-projects/${projectId}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    },
  });

  function openAddProject() { setEditingProject(null); setProjectForm({ ...AE_BLANK_PROJECT }); setShowProjectForm(true); }
  function openEditProject(p: AgriEnvProject) {
    setEditingProject(p);
    setProjectForm({
      schemeName: p.schemeName, administeringBody: p.administeringBody ?? "",
      agreementReference: p.agreementReference ?? "", designatedLandscape: p.designatedLandscape ?? "",
      theme: p.theme ?? "", startDate: p.startDate ?? "", endDate: p.endDate ?? "",
      totalGrantValueGBP: p.totalGrantValuePence ? (p.totalGrantValuePence / 100).toFixed(0) : "",
      status: p.status, notes: p.notes ?? "",
    });
    setShowProjectForm(true);
  }
  function openAddMilestone() { setEditingMilestone(null); setMilestoneForm({ ...AE_BLANK_MILESTONE }); setShowMilestoneForm(true); }
  function openEditMilestone(m: AgriEnvMilestone) {
    setEditingMilestone(m);
    setMilestoneForm({
      milestoneName: m.milestoneName, dueDate: m.dueDate ?? "",
      completionDate: m.completionDate ?? "",
      claimAmountGBP: m.claimAmountPence ? (m.claimAmountPence / 100).toFixed(0) : "",
      status: m.status, evidenceNotes: m.evidenceNotes ?? "",
    });
    setShowMilestoneForm(true);
  }

  const inputSt = { padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: "0.875rem", width: "100%" };
  const labelSt: React.CSSProperties = { fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" };

  function exportCsv() {
    const milestonesByProject = new Map<number, AgriEnvMilestone[]>();
    for (const m of allMilestones) {
      const arr = milestonesByProject.get(m.projectId) ?? [];
      arr.push(m);
      milestonesByProject.set(m.projectId, arr);
    }

    const header = [
      "Scheme Name", "Administering Body", "Agreement / Ref", "Designated Landscape",
      "Theme", "Start Date", "End Date", "Grant Value (£)", "Status", "Notes",
      "Milestone Name", "Milestone Due Date", "Milestone Completion Date",
      "Milestone Claim (£)", "Milestone Status", "Evidence Notes",
    ];

    const rows: (string | number | null)[][] = [header];
    for (const p of filteredProjects) {
      const ms = milestonesByProject.get(p.id) ?? [];
      const schemeBase = [
        p.schemeName,
        p.administeringBody ?? "",
        p.agreementReference ?? "",
        p.designatedLandscape ?? "",
        p.theme ?? "",
        p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB") : "",
        p.endDate   ? new Date(p.endDate).toLocaleDateString("en-GB")   : "",
        p.totalGrantValuePence != null ? (p.totalGrantValuePence / 100).toFixed(2) : "",
        AE_PROJECT_STATUS_CFG[p.status]?.label ?? p.status,
        p.notes ?? "",
      ];
      if (ms.length === 0) {
        rows.push([...schemeBase, "", "", "", "", "", ""]);
      } else {
        for (const m of ms) {
          rows.push([
            ...schemeBase,
            m.milestoneName,
            m.dueDate        ? new Date(m.dueDate).toLocaleDateString("en-GB")        : "",
            m.completionDate ? new Date(m.completionDate).toLocaleDateString("en-GB") : "",
            m.claimAmountPence != null ? (m.claimAmountPence / 100).toFixed(2) : "",
            AE_MILESTONE_STATUS_CFG[m.status]?.label ?? m.status,
            m.evidenceNotes ?? "",
          ]);
        }
      }
    }
    downloadCsvFile(exportFilename(), rows);
  }

  return (
    <div>
      {/* Print styles */}
      <style>{`
        @media print {
          aside, nav, header, [data-sidebar], .sidebar, [class*="sidebar"] { display: none !important; }
          body { background: white !important; }
          .ae-screen-only { display: none !important; }
          .ae-print-only { display: block !important; }
          .ae-print-card { break-inside: avoid; }
        }
      `}</style>

      <div className="ae-screen-only">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
          Record agri-environment scheme agreements — FiPL, SFI, Countryside Stewardship, ELMs, AONB stewardship and any other scheme.
        </p>
        <div className="ae-print-hide" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 16 }}>
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={projects.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Printer size={14} /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={projects.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={14} /> Export CSV
          </Button>
          <Button onClick={openAddProject} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Add Scheme
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#059669", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>Active Schemes</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>{activeCount}</div>
          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>{completedCount} completed</div>
        </div>
        <div style={{ background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>Total Scheme Value</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>
            {totalValue > 0 ? `£${(totalValue / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>
            across {schemeProjects.filter(p => p.status !== "withdrawn").length} scheme(s)
          </div>
        </div>
        <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#d97706", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>FiPL Info</div>
          <div style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.5, marginTop: 4 }}>
            Farming in Protected Landscapes — administered by your National Park or AONB team. Runs to 2029.
          </div>
        </div>
      </div>

      {/* Farm-wide drawdown summary */}
      {(() => {
        const drawdownProjects = projects.filter(p => p.status !== "withdrawn" && (p.totalGrantValuePence ?? 0) > 0);
        if (drawdownProjects.length === 0) return null;
        const drawdownProjectIds = new Set(drawdownProjects.map(p => p.id));
        const totalPence = drawdownProjects.reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
        const paidPence = allMilestones
          .filter(m => drawdownProjectIds.has(m.projectId) && m.status === "paid")
          .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const submittedPence = allMilestones
          .filter(m => drawdownProjectIds.has(m.projectId) && m.status === "submitted")
          .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const pct = Math.min(100, Math.round(paidPence / totalPence * 100));
        const pctSub = Math.min(100 - pct, Math.round(submittedPence / totalPence * 100));
        return (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10,
            padding: "16px 20px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                Farm-wide Drawdown
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: pct >= 100 ? "#059669" : "#111827" }}>
                {pct}% drawn
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ fontWeight: 700, color: "#111827" }}>
                  £{(paidPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                </span>
                {" of "}
                <span style={{ fontWeight: 600 }}>
                  £{(totalPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                </span>
                {" claimed across "}
                <span style={{ fontWeight: 600 }}>{drawdownProjects.length}</span>
                {" project"}{drawdownProjects.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ height: 10, background: "#dcfce7", borderRadius: 6, overflow: "hidden", display: "flex" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#059669", transition: "width 0.3s", borderRadius: pct >= 100 ? 6 : "6px 0 0 6px" }} />
              {pctSub > 0 && <div style={{ height: "100%", width: `${pctSub}%`, background: "#93c5fd", transition: "width 0.3s" }} />}
            </div>
            {pctSub > 0 && (
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 5 }}>
                + £{(submittedPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} submitted (awaiting payment)
              </div>
            )}
          </div>
        );
      })()}

      {/* Milestone deadline alert banner */}
      {(overdueMs > 0 || upcomingMs > 0) && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
          background: overdueMs > 0 ? "#fef2f2" : "#fffbeb",
          border: `1px solid ${overdueMs > 0 ? "#fecaca" : "#fde68a"}`,
          borderRadius: 10, marginBottom: 20,
        }}>
          <AlertTriangle size={18} color={overdueMs > 0 ? "#dc2626" : "#d97706"} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: overdueMs > 0 ? "#991b1b" : "#92400e", marginBottom: 3 }}>
              {overdueMs > 0 && upcomingMs > 0
                ? `${overdueMs} overdue and ${upcomingMs} upcoming milestone${upcomingMs !== 1 ? "s" : ""} need attention`
                : overdueMs > 0
                ? `${overdueMs} milestone${overdueMs !== 1 ? "s" : ""} ${overdueMs !== 1 ? "are" : "is"} overdue — claim payment may be at risk`
                : `${upcomingMs} milestone${upcomingMs !== 1 ? "s" : ""} due within 30 days — prepare your claim evidence`}
            </div>
            <div style={{ fontSize: "0.8rem", color: overdueMs > 0 ? "#b91c1c" : "#b45309" }}>
              Expand the scheme below to view and update individual milestone statuses.
            </div>
          </div>
        </div>
      )}

      {/* Export / print filter bar */}
      {projects.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16,
          flexWrap: "wrap" as const,
        }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", flexShrink: 0 }}>
            Export &amp; Print filter:
          </span>
          <SchemeNameCombobox
            value={aeExportScheme}
            onChange={setAeExportScheme}
            schemeNames={uniqueSchemeNames}
            compact
          />
          <select
            value={aeExportStatus}
            onChange={e => setAeExportStatus(e.target.value)}
            style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", color: "#111827" }}
          >
            <option value="all">All statuses</option>
            {AE_PROJECT_STATUSES.map(s => <option key={s} value={s}>{AE_PROJECT_STATUS_CFG[s]?.label ?? s}</option>)}
          </select>
          {(aeExportScheme !== "all" || aeExportStatus !== "all") && (
            <span style={{ fontSize: "0.78rem", color: "#6b7280", marginLeft: 2 }}>
              {filteredProjects.length} of {projects.length} scheme{projects.length !== 1 ? "s" : ""} selected
              {" · "}
              <button
                onClick={() => { setAeExportScheme("all"); setAeExportStatus("all"); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", textDecoration: "underline", fontSize: "0.78rem" }}
              >
                Clear
              </button>
            </span>
          )}
        </div>
      )}

      {/* On-screen filter bar — scheme dropdown + status pills */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {/* Scheme name filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", flexShrink: 0 }}>Scheme:</span>
            <SchemeNameCombobox
              value={aeScreenScheme}
              onChange={setAeScreenScheme}
              schemeNames={uniqueSchemeNames}
            />
            {aeScreenScheme !== "all" && (
              <button
                onClick={() => setAeScreenScheme("all")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", fontSize: "0.78rem", textDecoration: "underline" }}
              >
                Clear
              </button>
            )}
          </div>
          {/* Status pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginRight: 2 }}>Status:</span>
            {(["all", ...AE_PROJECT_STATUSES] as const).map(s => {
              const cfg = s === "all" ? null : AE_PROJECT_STATUS_CFG[s];
              const label = s === "all" ? "All" : (cfg?.label ?? s);
              const schemeProjects = aeScreenScheme === "all" ? projects : projects.filter(p => p.schemeName === aeScreenScheme);
              const count = s === "all" ? schemeProjects.length : schemeProjects.filter(p => p.status === s).length;
              const isActive = aeScreenStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setAeScreenStatus(s)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 12px", borderRadius: 20,
                    fontSize: "0.8rem", fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    border: isActive ? "1.5px solid #374151" : "1px solid #e5e7eb",
                    background: isActive ? "#111827" : "#f9fafb",
                    color: isActive ? "#fff" : "#374151",
                    transition: "all 0.12s",
                  }}
                >
                  {label}
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 600,
                    background: isActive ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                    color: isActive ? "#fff" : "#6b7280",
                    borderRadius: 20, padding: "0px 6px", minWidth: 18, textAlign: "center",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects list */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <Loader2 size={24} className="animate-spin" style={{ display: "inline" }} />
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }}>
          <Leaf size={32} color="#d1d5db" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>No agri-environment schemes recorded</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: 16 }}>
            Add your first scheme to track milestones, claim dates and evidence.
          </div>
          <Button onClick={openAddProject} size="sm">
            <Plus size={14} style={{ marginRight: 6 }} /> Add Scheme
          </Button>
        </div>
      ) : screenFilteredProjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }}>
          <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            No schemes match
            {aeScreenScheme !== "all" && <> scheme <strong>{aeScreenScheme}</strong></>}
            {aeScreenScheme !== "all" && aeScreenStatus !== "all" && <> with</>}
            {aeScreenStatus !== "all" && <> status <strong>{AE_PROJECT_STATUS_CFG[aeScreenStatus as keyof typeof AE_PROJECT_STATUS_CFG]?.label ?? aeScreenStatus}</strong></>}.
          </div>
          <button
            onClick={() => { setAeScreenStatus("all"); setAeScreenScheme("all"); }}
            style={{ marginTop: 10, background: "none", border: "none", cursor: "pointer", color: "#374151", textDecoration: "underline", fontSize: "0.82rem" }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {screenFilteredProjects.map(project => {
            const isExpanded = expandedId === project.id;
            return (
              <div key={project.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                {/* Project row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>{project.schemeName}</span>
                      <AeProjectBadge status={project.status} />
                      {project.theme && (
                        <span style={{ fontSize: "0.72rem", padding: "1px 8px", borderRadius: 20, border: "1px solid #d1d5db", color: "#6b7280", background: "#f9fafb" }}>
                          {project.theme}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginTop: 4 }}>
                      {project.administeringBody && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{project.administeringBody}</span>}
                      {project.agreementReference && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Ref: {project.agreementReference}</span>}
                      {project.designatedLandscape && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{project.designatedLandscape}</span>}
                      {(project.startDate || project.endDate) && (
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          {project.startDate ? new Date(project.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "?"}
                          {" → "}
                          {project.endDate ? new Date(project.endDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "ongoing"}
                        </span>
                      )}
                      {!!project.totalGrantValuePence && (
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#059669" }}>
                          £{(project.totalGrantValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                        </span>
                      )}
                    </div>
                    {/* Drawdown progress bar */}
                    {!!project.totalGrantValuePence && (() => {
                      const paidPence = allMilestones
                        .filter(m => m.projectId === project.id && m.status === "paid")
                        .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
                      const submittedPence = allMilestones
                        .filter(m => m.projectId === project.id && m.status === "submitted")
                        .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
                      const total = project.totalGrantValuePence!;
                      const pct = Math.min(100, Math.round(paidPence / total * 100));
                      const pctSub = Math.min(100 - pct, Math.round(submittedPence / total * 100));
                      const claimedLabel = paidPence > 0
                        ? `£${(paidPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} of £${(total / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} claimed`
                        : `£${(total / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} total — no paid claims yet`;
                      return (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontSize: "0.71rem", color: "#6b7280" }}>{claimedLabel}</span>
                            <span style={{ fontSize: "0.71rem", fontWeight: 600, color: pct >= 100 ? "#059669" : "#374151" }}>{pct}% drawn</span>
                          </div>
                          <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", display: "flex" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "#059669", transition: "width 0.3s" }} />
                            {pctSub > 0 && <div style={{ height: "100%", width: `${pctSub}%`, background: "#93c5fd", transition: "width 0.3s" }} />}
                          </div>
                          {pctSub > 0 && <div style={{ fontSize: "0.69rem", color: "#6b7280", marginTop: 2 }}>£{(submittedPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })} submitted (awaiting payment)</div>}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); openEditProject(project); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeletingProject(project); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#ef4444" }}>
                      <Trash2 size={14} />
                    </button>
                    <ChevronDown size={16} color="#9ca3af" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </div>
                </div>

                {/* Expanded milestones */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa", padding: "12px 16px" }}>
                    {project.notes && (
                      <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 6, padding: "8px 12px", fontSize: "0.82rem", color: "#3730a3", marginBottom: 12 }}>
                        <strong>Notes:</strong> {project.notes}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                        Milestones &amp; Claims
                      </span>
                      <Button size="sm" variant="outline" onClick={openAddMilestone}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}>
                        <Plus size={12} /> Add Milestone
                      </Button>
                    </div>
                    {milestones.length > 0 && (
                      <div
                        role="tablist"
                        aria-label="Filter milestones by status"
                        style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}
                      >
                        {AE_MILESTONE_FILTERS.map(filter => {
                          const isActive = milestoneFilter === filter;
                          const count = filter === "all"
                            ? milestones.length
                            : milestones.filter(m => m.status === filter).length;
                          const label = filter === "all"
                            ? "All"
                            : AE_MILESTONE_STATUS_CFG[filter]?.label ?? filter;
                          return (
                            <button
                              key={filter}
                              role="tab"
                              aria-selected={isActive}
                              onClick={() => setMilestoneFilter(filter)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                padding: "3px 10px", borderRadius: 20,
                                fontSize: "0.76rem", fontWeight: isActive ? 600 : 400,
                                cursor: "pointer",
                                border: isActive ? "1.5px solid #374151" : "1px solid #e5e7eb",
                                background: isActive ? "#111827" : "#fff",
                                color: isActive ? "#fff" : "#374151",
                              }}
                            >
                              {label}
                              <span style={{
                                fontSize: "0.68rem", fontWeight: 600,
                                background: isActive ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                                color: isActive ? "#fff" : "#6b7280",
                                borderRadius: 20, padding: "0px 5px", minWidth: 16, textAlign: "center",
                              }}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {milestones.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px 12px", color: "#9ca3af", fontSize: "0.82rem" }}>
                        No milestones recorded yet — add one to track claim dates and evidence.
                      </div>
                    ) : visibleMilestones.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px 12px", color: "#9ca3af", fontSize: "0.82rem" }}>
                        No milestones match this status.
                        <button
                          onClick={() => setMilestoneFilter("all")}
                          style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", cursor: "pointer", color: "#374151", textDecoration: "underline", fontSize: "0.78rem" }}
                        >
                          Show all milestones
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {visibleMilestones.map(m => {
                          const isPending = pendingCompletion?.milestoneId === m.id;
                          const isUpdating = updatingMilestone === m.id;
                          const needsDate = (s: string) => (s === "submitted" || s === "paid") && !m.completionDate;
                          const msStatusColors: Record<string, { bg: string; color: string; border: string }> = {
                            pending:   { bg: "#f9fafb", color: "#374151", border: "#e5e7eb" },
                            submitted: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
                            paid:      { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
                            overdue:   { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
                          };
                          const sc = msStatusColors[m.status] ?? msStatusColors.pending!;
                          return (
                          <div key={m.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{m.milestoneName}</span>
                                {isPending ? (
                                  <input
                                    type="date"
                                    value={pendingCompletion!.date}
                                    max={todayIso}
                                    onChange={e => setPendingCompletion(prev => prev ? { ...prev, date: e.target.value } : prev)}
                                    style={{ fontSize: "0.75rem", padding: "2px 4px", border: "1px solid #93c5fd", borderRadius: 4, background: "#eff6ff", color: "#1e40af", width: 120 }}
                                  />
                                ) : (
                                  <select
                                    disabled={isUpdating}
                                    value={m.status ?? "pending"}
                                    onChange={e => {
                                      const newStatus = e.target.value;
                                      if (needsDate(newStatus)) {
                                        const defaultDate = m.dueDate && m.dueDate.slice(0, 10) <= todayIso ? m.dueDate.slice(0, 10) : todayIso;
                                        setPendingCompletion({ milestoneId: m.id, projectId: m.projectId, newStatus, date: defaultDate });
                                      } else {
                                        setUpdatingMilestone(m.id);
                                        // Clear completionDate when reverting away from claimed statuses
                                        const isClaimed = (s: string) => s === "submitted" || s === "paid";
                                        const completionDate = m.completionDate && isClaimed(m.status ?? "") && !isClaimed(newStatus)
                                          ? null
                                          : undefined;
                                        updateMilestoneStatusMut.mutate({ milestoneId: m.id, projectId: m.projectId, status: newStatus, completionDate });
                                      }
                                    }}
                                    style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 4px 2px 7px", borderRadius: 20, border: `1px solid ${sc.border}`, background: sc.bg, color: sc.color, cursor: isUpdating ? "wait" : "pointer", opacity: isUpdating ? 0.6 : 1 }}
                                  >
                                    {AE_MILESTONE_STATUSES.map(s => (
                                      <option key={s} value={s}>{AE_MILESTONE_STATUS_CFG[s]?.label ?? s}</option>
                                    ))}
                                  </select>
                                )}
                                {!!m.claimAmountPence && (
                                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#059669" }}>
                                    £{(m.claimAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, marginTop: 3, alignItems: "center" }}>
                                {m.dueDate && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#6b7280" }}>
                                    Due:{" "}
                                    {m.status === "paid"
                                      ? <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{new Date(m.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                      : <DeadlineBadge dateStr={m.dueDate} />}
                                  </span>
                                )}
                                {m.completionDate && <span style={{ fontSize: "0.78rem", color: "#059669" }}>Done: {new Date(m.completionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                                {m.evidenceNotes && <span style={{ fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic" }}>{m.evidenceNotes}</span>}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => {
                                      if (!pendingCompletion?.date) return;
                                      setUpdatingMilestone(m.id);
                                      updateMilestoneStatusMut.mutate({ milestoneId: m.id, projectId: m.projectId, status: pendingCompletion.newStatus, completionDate: pendingCompletion.date });
                                    }}
                                    disabled={isUpdating || !pendingCompletion?.date}
                                    style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#1e40af", color: "#fff", border: "none", cursor: isUpdating ? "wait" : "pointer", fontWeight: 600, opacity: (isUpdating || !pendingCompletion?.date) ? 0.6 : 1 }}
                                  >
                                    {isUpdating ? "Saving…" : "Save"}
                                  </button>
                                  <button
                                    onClick={() => setPendingCompletion(null)}
                                    disabled={isUpdating}
                                    style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", fontWeight: 600 }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => openEditMilestone(m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 3, color: "#6b7280" }}><Pencil size={13} /></button>
                                  <button onClick={() => setDeletingMilestone(m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 3, color: "#ef4444" }}><Trash2 size={13} /></button>
                                </>
                              )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      </div>{/* end ae-screen-only */}

      {/* ── Print-only full report ────────────────────────────────────────── */}
      {filteredProjects.length > 0 && (() => {
        const milestonesByProject = new Map<number, AgriEnvMilestone[]>();
        for (const m of allMilestones) {
          const arr = milestonesByProject.get(m.projectId) ?? [];
          arr.push(m);
          milestonesByProject.set(m.projectId, arr);
        }
        const printedValue = filteredProjects.filter(p => p.status !== "withdrawn").reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
        const filterLabel = [
          aeExportScheme !== "all" ? aeExportScheme : null,
          aeExportStatus !== "all" ? (AE_PROJECT_STATUS_CFG[aeExportStatus]?.label ?? aeExportStatus) : null,
        ].filter(Boolean).join(" · ");
        return (
          <div style={{ display: "none" }} className="ae-print-only">
            <div style={{ fontFamily: "Georgia, serif", color: "#111827", padding: "0 0 24px" }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 }}>Agri-environment Scheme Record</h1>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 24 }}>
                Exported {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                {filterLabel && ` · Filtered: ${filterLabel}`}
                {printedValue > 0 && ` · Total scheme value: £${(printedValue / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`}
              </p>
              {filteredProjects.map((p, idx) => {
                const ms = milestonesByProject.get(p.id) ?? [];
                const statusCfg = AE_PROJECT_STATUS_CFG[p.status];
                return (
                  <div key={p.id} className="ae-print-card" style={{ marginBottom: 28, pageBreakInside: "avoid" }}>
                    <div style={{ borderLeft: "4px solid #059669", paddingLeft: 12, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
                        <span style={{ fontSize: "1rem", fontWeight: 700 }}>{idx + 1}. {p.schemeName}</span>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>[{statusCfg?.label ?? p.status}]</span>
                      </div>
                      <table style={{ fontSize: "0.8rem", borderCollapse: "collapse", width: "100%" }}>
                        <tbody>
                          {p.administeringBody && <tr><td style={{ color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }}>Administering body</td><td>{p.administeringBody}</td></tr>}
                          {p.agreementReference && <tr><td style={{ color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }}>Agreement reference</td><td>{p.agreementReference}</td></tr>}
                          {p.designatedLandscape && <tr><td style={{ color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }}>Designated landscape</td><td>{p.designatedLandscape}</td></tr>}
                          {p.theme && <tr><td style={{ color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }}>Theme</td><td>{p.theme}</td></tr>}
                          {(p.startDate || p.endDate) && <tr><td style={{ color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }}>Period</td><td>{p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "?"} → {p.endDate ? new Date(p.endDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "ongoing"}</td></tr>}
                          {p.totalGrantValuePence != null && <tr><td style={{ color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", paddingBottom: 2 }}>Grant value</td><td>£{(p.totalGrantValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}</td></tr>}
                          {p.notes && <tr><td style={{ color: "#6b7280", paddingRight: 16, whiteSpace: "nowrap", verticalAlign: "top", paddingBottom: 2 }}>Notes</td><td>{p.notes}</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    {ms.length > 0 && (
                      <div style={{ marginLeft: 16 }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 6 }}>Milestones &amp; Claims</div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                              <th style={{ textAlign: "left", padding: "4px 8px 4px 0", color: "#374151", fontWeight: 600 }}>Milestone</th>
                              <th style={{ textAlign: "left", padding: "4px 8px 4px 0", color: "#374151", fontWeight: 600 }}>Due</th>
                              <th style={{ textAlign: "left", padding: "4px 8px 4px 0", color: "#374151", fontWeight: 600 }}>Completed</th>
                              <th style={{ textAlign: "right", padding: "4px 0 4px 8px", color: "#374151", fontWeight: 600 }}>Claim (£)</th>
                              <th style={{ textAlign: "left", padding: "4px 0 4px 8px", color: "#374151", fontWeight: 600 }}>Status</th>
                              <th style={{ textAlign: "left", padding: "4px 0", color: "#374151", fontWeight: 600 }}>Evidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ms.map(m => {
                              const mCfg = AE_MILESTONE_STATUS_CFG[m.status];
                              return (
                                <tr key={m.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                  <td style={{ padding: "4px 8px 4px 0" }}>{m.milestoneName}</td>
                                  <td style={{ padding: "4px 8px 4px 0", whiteSpace: "nowrap" }}>{m.dueDate ? new Date(m.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                                  <td style={{ padding: "4px 8px 4px 0", whiteSpace: "nowrap" }}>{m.completionDate ? new Date(m.completionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                                  <td style={{ padding: "4px 0 4px 8px", textAlign: "right", whiteSpace: "nowrap" }}>{m.claimAmountPence != null ? `£${(m.claimAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—"}</td>
                                  <td style={{ padding: "4px 0 4px 8px" }}>{mCfg?.label ?? m.status}</td>
                                  <td style={{ padding: "4px 0", color: "#6b7280" }}>{m.evidenceNotes ?? ""}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {ms.length === 0 && (
                      <div style={{ marginLeft: 16, fontSize: "0.8rem", color: "#9ca3af" }}>No milestones recorded.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Project Form Dialog ───────────────────────────────────────────── */}
      <Dialog open={showProjectForm} onOpenChange={v => { if (!v) { setShowProjectForm(false); setEditingProject(null); saveProjectMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>{editingProject ? "Edit Scheme" : "Add Agri-environment Scheme"}</DialogTitle></DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelSt}>Scheme Name *</label>
              <input list="ae-scheme-list" value={projectForm.schemeName}
                onChange={e => setProjectForm(f => ({ ...f, schemeName: e.target.value }))}
                style={inputSt} placeholder="e.g. FiPL, SFI, Countryside Stewardship…" />
              <datalist id="ae-scheme-list">{AE_COMMON_SCHEMES.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelSt}>Administering Body</label>
                <input list="ae-body-list" value={projectForm.administeringBody}
                  onChange={e => setProjectForm(f => ({ ...f, administeringBody: e.target.value }))}
                  style={inputSt} placeholder="e.g. Natural England" />
                <datalist id="ae-body-list">{AE_COMMON_BODIES.map(b => <option key={b} value={b} />)}</datalist>
              </div>
              <div>
                <label style={labelSt}>Agreement / Reference No.</label>
                <input value={projectForm.agreementReference}
                  onChange={e => setProjectForm(f => ({ ...f, agreementReference: e.target.value }))}
                  style={inputSt} placeholder="Agreement reference" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelSt}>Designated Landscape</label>
                <input value={projectForm.designatedLandscape}
                  onChange={e => setProjectForm(f => ({ ...f, designatedLandscape: e.target.value }))}
                  style={inputSt} placeholder="e.g. South Downs NP" />
              </div>
              <div>
                <label style={labelSt}>Theme (FiPL)</label>
                <select value={projectForm.theme} onChange={e => setProjectForm(f => ({ ...f, theme: e.target.value }))} style={inputSt}>
                  <option value="">— not applicable —</option>
                  {AE_FIPL_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelSt}>Start Date</label>
                <input type="date" value={projectForm.startDate} onChange={e => setProjectForm(f => ({ ...f, startDate: e.target.value }))} style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>End Date</label>
                <input type="date" value={projectForm.endDate} onChange={e => setProjectForm(f => ({ ...f, endDate: e.target.value }))} style={inputSt} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelSt}>Total Grant Value (£)</label>
                <input type="number" min="0" step="1" value={projectForm.totalGrantValueGBP}
                  onChange={e => setProjectForm(f => ({ ...f, totalGrantValueGBP: e.target.value }))}
                  style={inputSt} placeholder="0" />
              </div>
              <div>
                <label style={labelSt}>Status</label>
                <select value={projectForm.status} onChange={e => setProjectForm(f => ({ ...f, status: e.target.value }))} style={inputSt}>
                  {AE_PROJECT_STATUSES.map(s => <option key={s} value={s}>{AE_PROJECT_STATUS_CFG[s]?.label ?? s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelSt}>Notes</label>
              <textarea value={projectForm.notes} onChange={e => setProjectForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...inputSt, minHeight: 70, resize: "vertical" as const }}
                placeholder="Objectives, conditions, required actions…" />
            </div>
          </div>
          <DialogMutationError mutation={saveProjectMut} message="Failed to save — please try again." />
          <DialogFooter style={{ marginTop: 16 }}>
            <Button variant="outline" onClick={() => { setShowProjectForm(false); setEditingProject(null); saveProjectMut.reset(); }}>Cancel</Button>
            <Button disabled={!projectForm.schemeName.trim() || saveProjectMut.isPending} onClick={() => saveProjectMut.mutate(projectForm)}>
              {saveProjectMut.isPending ? <><Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />Saving…</> : editingProject ? "Save Changes" : "Add Scheme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Milestone Form Dialog ─────────────────────────────────────────── */}
      <Dialog open={showMilestoneForm} onOpenChange={v => { if (!v) { setShowMilestoneForm(false); setEditingMilestone(null); saveMilestoneMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>{editingMilestone ? "Edit Milestone" : "Add Milestone"}</DialogTitle></DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelSt}>Milestone Name *</label>
              <input value={milestoneForm.milestoneName}
                onChange={e => setMilestoneForm(f => ({ ...f, milestoneName: e.target.value }))}
                style={inputSt} placeholder="e.g. Year 1 claim, Habitat survey, Q2 payment…" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelSt}>Due Date</label>
                <input type="date" value={milestoneForm.dueDate} onChange={e => setMilestoneForm(f => ({ ...f, dueDate: e.target.value }))} style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>Completion Date</label>
                <input type="date" value={milestoneForm.completionDate} onChange={e => setMilestoneForm(f => ({ ...f, completionDate: e.target.value }))} style={inputSt} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelSt}>Claim Amount (£)</label>
                <input type="number" min="0" step="1" value={milestoneForm.claimAmountGBP}
                  onChange={e => setMilestoneForm(f => ({ ...f, claimAmountGBP: e.target.value }))}
                  style={inputSt} placeholder="0" />
              </div>
              <div>
                <label style={labelSt}>Status</label>
                <select value={milestoneForm.status} onChange={e => setMilestoneForm(f => ({ ...f, status: e.target.value }))} style={inputSt}>
                  {AE_MILESTONE_STATUSES.map(s => <option key={s} value={s}>{AE_MILESTONE_STATUS_CFG[s]?.label ?? s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelSt}>Evidence Notes</label>
              <textarea value={milestoneForm.evidenceNotes} onChange={e => setMilestoneForm(f => ({ ...f, evidenceNotes: e.target.value }))}
                style={{ ...inputSt, minHeight: 60, resize: "vertical" as const }}
                placeholder="Photos taken, reports submitted, site visits completed…" />
            </div>
          </div>
          <DialogMutationError mutation={saveMilestoneMut} message="Failed to save — please try again." />
          <DialogFooter style={{ marginTop: 16 }}>
            <Button variant="outline" onClick={() => { setShowMilestoneForm(false); setEditingMilestone(null); saveMilestoneMut.reset(); }}>Cancel</Button>
            <Button disabled={!milestoneForm.milestoneName.trim() || saveMilestoneMut.isPending} onClick={() => saveMilestoneMut.mutate(milestoneForm)}>
              {saveMilestoneMut.isPending ? <><Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />Saving…</> : editingMilestone ? "Save Changes" : "Add Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Project ────────────────────────────────────────────────── */}
      <AlertDialog open={!!deletingProject} onOpenChange={v => { if (!v) { setDeletingProject(null); deleteProjectMut.reset(); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Scheme?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingProject?.schemeName}</strong> and all its milestones. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DialogMutationError mutation={deleteProjectMut} message="Failed to remove — please try again." />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingProject && deleteProjectMut.mutate(deletingProject.id)} style={{ background: "#ef4444" }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Milestone ─────────────────────────────────────────────── */}
      <AlertDialog open={!!deletingMilestone} onOpenChange={v => { if (!v) { setDeletingMilestone(null); deleteMilestoneMut.reset(); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingMilestone?.milestoneName}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DialogMutationError mutation={deleteMilestoneMut} message="Failed to remove — please try again." />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingMilestone && deleteMilestoneMut.mutate(deletingMilestone.id)} style={{ background: "#ef4444" }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function GrantsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();

  const _initTab = new URLSearchParams(window.location.search).get("tab");
  const [mainTab, setMainTab] = useState<"capital" | "agrienv">(_initTab === "agrienv" ? "agrienv" : "capital");
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "grants", filter: "status", farmId, defaultValue: "all" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GrantRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<GrantRecord | null>(null);
  const [deleting, setDeleting] = useState<GrantRecord | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<GrantRecord | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const openId = (() => { const n = Number(new URLSearchParams(window.location.search).get("open")); return n > 0 ? n : null; })();
  const [hlId, setHlId] = useState<number | null>(openId);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());
  const autoOpened = useRef(false);
  const [fetfPickerOpen, setFetfPickerOpen] = useState(false);
  const [fetfSearch, setFetfSearch] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [quickFilter, setQuickFilter] = usePersistedFilter({
    page: "grants",
    filter: "quick",
    farmId,
    defaultValue: "",
    validValues: ["", "approved", "active", "deadlines"] as const,
  });
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "grants", filter: "year", farmId, defaultValue: "all" });
  const [_hideArchivedStr, _setHideArchivedStr] = usePersistedFilter({
    page: "grants",
    filter: "hide-archived",
    farmId,
    defaultValue: "true",
    validValues: ["true", "false"] as const,
  });
  const hideArchived = _hideArchivedStr !== "false";
  const setHideArchived = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(hideArchived) : v;
    _setHideArchivedStr(next ? "true" : "false");
  };

  // ── On-screen scheme filter for capital grants (persisted per farm) ──
  const [screenScheme, setScreenScheme] = usePersistedFilter({
    page: "grants",
    filter: "screen-scheme",
    farmId,
    defaultValue: "all",
  });

  // ── Export / print filter state for capital grants (persisted per farm) ──
  const [grantExportScheme, setGrantExportScheme] = usePersistedFilter({
    page: "grants",
    filter: "export-scheme",
    farmId,
    defaultValue: "all",
  });
  const [grantExportStatus, setGrantExportStatus] = usePersistedFilter({
    page: "grants",
    filter: "export-status",
    farmId,
    defaultValue: "all",
    validValues: ["all", ...STATUSES] as readonly string[],
  });

  const { uploadFile } = useUpload();

  const { data, isLoading } = useQuery({
    queryKey: ["grants", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/grants`);
      if (!r.ok) throw new Error("Failed to load grants");
      return r.json() as Promise<{ records: GrantRecord[] }>;
    },
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const uniqueGrantSchemeNames = useMemo(
    () => [...new Set(records.map(r => r.schemeName))].sort(),
    [records],
  );

  const exportFilteredRecords = useMemo(() => {
    return records.filter(r => {
      if (grantExportScheme !== "all" && r.schemeName !== grantExportScheme) return false;
      if (grantExportStatus !== "all" && r.status !== grantExportStatus) return false;
      return true;
    });
  }, [records, grantExportScheme, grantExportStatus]);

  function exportGrantsCsv() {
    const parts: string[] = ["grants"];
    if (grantExportScheme !== "all") {
      parts.push(grantExportScheme.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24));
    }
    if (grantExportStatus !== "all") parts.push(grantExportStatus);
    const filename = parts.join("-") + ".csv";

    const header = [
      "Scheme Name", "Scheme Type", "Item Ref Code", "Item Description",
      "Application Ref", "Agreement Ref", "Application Date", "Approval Date",
      "Purchase Deadline", "Claim Deadline", "Grant Amount (£)", "Actual Cost (£)",
      "Status", "Notes",
    ];
    const rows: (string | number | null)[][] = [header];
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
        r.notes ?? "",
      ]);
    }
    downloadCsvFile(filename, rows);
  }

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const r of records) { const y = grantYear(r); if (y) years.add(y); }
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);

  const baseRecords = useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter(r => grantYear(r) === Number(yearFilter));
    if (hideArchived) rs = rs.filter(r => !["claimed","rejected","withdrawn"].includes(r.status));
    if (screenScheme !== "all") rs = rs.filter(r => r.schemeName === screenScheme);
    return rs;
  }, [records, yearFilter, hideArchived, screenScheme]);

  const archivedCount = useMemo(() => {
    let rs = records;
    if (yearFilter !== "all") rs = rs.filter(r => grantYear(r) === Number(yearFilter));
    return rs.filter(r => ["claimed","rejected","withdrawn"].includes(r.status)).length;
  }, [records, yearFilter]);

  useEffect(() => {
    if (!openId || autoOpened.current || records.length === 0) return;
    const target = records.find(r => r.id === openId);
    if (target) {
      autoOpened.current = true;
      setViewRecord(target);
      setTimeout(() => { rowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" }); const t = setTimeout(() => setHlId(null), 4000); return () => clearTimeout(t); }, 200);
    }
  }, [openId, records]);

  const filtered = useMemo(() => {
    if (quickFilter === "approved") {
      return baseRecords.filter(r => ["approved","purchased","claimed"].includes(r.status));
    }
    if (quickFilter === "active") {
      return baseRecords.filter(r => ["draft","applied","approved","purchased"].includes(r.status));
    }
    if (quickFilter === "deadlines") {
      return baseRecords.filter(r => {
        const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
        const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
        return purchSt === "warning" || purchSt === "overdue" || claimSt === "warning" || claimSt === "overdue";
      });
    }
    if (statusFilter !== "all") return baseRecords.filter(r => r.status === statusFilter);
    return baseRecords;
  }, [baseRecords, statusFilter, quickFilter]);

  const totalGrantApproved = baseRecords
    .filter(r => ["approved","purchased","claimed"].includes(r.status))
    .reduce((sum, r) => sum + (r.grantAmountPence ?? 0), 0);

  // Only count deadlines genuinely within the next 30 days (warning); overdue tracked separately
  // Both computed from baseRecords so year filter + hide-archived are respected
  const warningDeadlineRecords = baseRecords.filter(r => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "warning" || claimSt === "warning";
  });
  const overdueDeadlineRecords = baseRecords.filter(r => {
    const purchSt = r.purchaseDeadline ? deadlineStatus(r.purchaseDeadline) : "none";
    const claimSt = r.claimDeadline ? deadlineStatus(r.claimDeadline) : "none";
    return purchSt === "overdue" || claimSt === "overdue";
  });
  const deadlineAlertCount = warningDeadlineRecords.length + overdueDeadlineRecords.length;

  const saveMut = useMutation({
    mutationFn: async (payload: typeof form) => {
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
        notes: payload.notes || null,
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
    onError: () => toast({ title: "Error saving grant", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/farms/${farmId}/grants/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Grant removed" });
      setDeleting(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK_FORM });
    setShowForm(true);
  }

  function openEdit(r: GrantRecord) {
    setEditing(r);
    setForm({
      schemeName: r.schemeName,
      schemeType: (r.schemeType as SchemeType) || "FETF",
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
      notes: r.notes ?? "",
    });
    setShowForm(true);
  }

  function pickFetfItem(item: typeof FETF_ITEMS[0]) {
    setForm(f => ({ ...f, itemReferenceCode: item.code, itemDescription: item.description }));
    setFetfPickerOpen(false);
    setFetfSearch("");
  }

  async function handleEvidenceUpload(record: GrantRecord, file: File) {
    setUploadingId(record.id);
    try {
      const response = await uploadFile(file);
      if (!response) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: file.name }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      qc.invalidateQueries({ queryKey: ["grants", farmId] });
      toast({ title: "Evidence uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  }

  async function removeDocument(record: GrantRecord) {
    await fetch(`/api/farms/${farmId}/grants/${record.id}/document`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    qc.invalidateQueries({ queryKey: ["grants", farmId] });
  }

  const filteredFetf = FETF_ITEMS.filter(i =>
    !fetfSearch || i.code.toLowerCase().includes(fetfSearch.toLowerCase()) ||
    i.description.toLowerCase().includes(fetfSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(fetfSearch.toLowerCase())
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseRecords.length };
    for (const s of STATUSES) counts[s] = baseRecords.filter(r => r.status === s).length;
    return counts;
  }, [baseRecords]);

  // Summary card helpers — computed before return to avoid hook-rule violations
  const cardApprovedRecords = baseRecords.filter(r => ["approved","purchased","claimed"].includes(r.status));
  const cardActiveRecords = baseRecords.filter(r => ["draft","applied","approved","purchased"].includes(r.status));
  const cardNeedsAction = baseRecords.filter(r => ["draft","applied"].includes(r.status)).length;
  const isApprovedActive = quickFilter === "approved";
  const isActiveFilterOn = quickFilter === "active";
  const isDeadlinesFilterOn = quickFilter === "deadlines";
  const dlHasAlert = deadlineAlertCount > 0;
  const dlHasOverdue = overdueDeadlineRecords.length > 0;
  const dlBg = isDeadlinesFilterOn ? (dlHasOverdue ? "#fef2f2" : "#fffbeb") : dlHasOverdue ? "#fef2f2" : dlHasAlert ? "#fffbeb" : "#fff";
  const dlBorder = isDeadlinesFilterOn ? (dlHasOverdue ? "#f87171" : "#fbbf24") : dlHasOverdue ? "#fca5a5" : dlHasAlert ? "#fde68a" : "#e5e7eb";
  const dlAccent = dlHasOverdue ? "#dc2626" : dlHasAlert ? "#d97706" : "#9ca3af";
  const cardStyle = { borderRadius: 10, padding: "16px 20px", cursor: "pointer" as const, transition: "box-shadow 0.15s, transform 0.1s", userSelect: "none" as const };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Grants & Funding</h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>
              Capital grants and equipment funding, plus agri-environment scheme agreements and milestones.
            </p>
          </div>
          {mainTab === "capital" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Button variant="outline" size="sm" onClick={() => window.print()} disabled={records.length === 0}
                style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Printer size={14} /> Print
              </Button>
              <Button variant="outline" size="sm" onClick={exportGrantsCsv} disabled={records.length === 0}
                style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Download size={14} /> Export CSV
              </Button>
              <Button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={16} /> Add Grant
              </Button>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
          {([
            { key: "capital" as const, label: "Equipment & Capital Grants" },
            { key: "agrienv" as const, label: "Agri-environment Schemes" },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: mainTab === tab.key ? 700 : 500,
                color: mainTab === tab.key ? "#4f46e5" : "#6b7280",
                background: "none",
                border: "none",
                borderBottom: mainTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mainTab === "capital" && <>
        <style>{`@media print { .grants-cap-screen { display: none !important; } .grants-cap-print { display: block !important; } }`}</style>
        <div className="grants-cap-screen">
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {/* Approved Grant Value */}
          <div
            style={{ ...cardStyle, background: isApprovedActive ? "#f5f3ff" : "#fff", border: `1px solid ${isApprovedActive ? "#a78bfa" : "#e5e7eb"}`, outline: isApprovedActive ? "2px solid #7c3aed" : "none", outlineOffset: 2 }}
            onClick={() => { setQuickFilter(isApprovedActive ? "" : "approved"); setStatusFilter("all"); }}
            title="Click to filter by approved, purchased & claimed"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <PoundSterling size={18} color="#7c3aed" />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>Approved Grant Value</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>{formatGBP(totalGrantApproved)}</div>
            <div style={{ fontSize: "0.78rem", color: isApprovedActive ? "#7c3aed" : "#6b7280", marginTop: 2 }}>
              {isApprovedActive ? `Showing ${cardApprovedRecords.length} record${cardApprovedRecords.length !== 1 ? "s" : ""} — click to clear` : `${cardApprovedRecords.length} approved, purchased & claimed`}
            </div>
          </div>

          {/* Active Applications */}
          <div
            style={{ ...cardStyle, background: isActiveFilterOn ? "#f0fdf4" : cardActiveRecords.length > 0 ? "#f0fdf4" : "#fff", border: `1px solid ${isActiveFilterOn ? "#16a34a" : cardActiveRecords.length > 0 ? "#bbf7d0" : "#e5e7eb"}`, outline: isActiveFilterOn ? "2px solid #16a34a" : "none", outlineOffset: 2 }}
            onClick={() => { setQuickFilter(isActiveFilterOn ? "" : "active"); setStatusFilter("all"); }}
            title="Click to filter active applications"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <CheckCircle2 size={18} color="#059669" />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Applications</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>{cardActiveRecords.length}</div>
            <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>
              {isActiveFilterOn ? `Showing ${cardActiveRecords.length} record${cardActiveRecords.length !== 1 ? "s" : ""} — click to clear` : cardNeedsAction > 0 ? `${cardNeedsAction} awaiting decision` : "all concluded or approved"}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div
            style={{ ...cardStyle, background: dlBg, border: `1px solid ${dlBorder}`, outline: isDeadlinesFilterOn ? `2px solid ${dlAccent}` : "none", outlineOffset: 2 }}
            onClick={() => { setQuickFilter(isDeadlinesFilterOn ? "" : "deadlines"); setStatusFilter("all"); }}
            title="Click to filter records with upcoming or overdue deadlines"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <AlertTriangle size={18} color={dlAccent} />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: dlAccent, textTransform: "uppercase", letterSpacing: "0.05em" }}>Upcoming Deadlines</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: dlHasAlert ? (dlHasOverdue ? "#991b1b" : "#92400e") : "#111827" }}>
              {warningDeadlineRecords.length}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>
              {isDeadlinesFilterOn
                ? `Showing ${deadlineAlertCount} record${deadlineAlertCount !== 1 ? "s" : ""} — click to clear`
                : dlHasOverdue
                  ? `within 30 days · ${overdueDeadlineRecords.length} overdue`
                  : "Purchase or claim deadlines within 30 days"}
            </div>
          </div>
        </div>

        {/* FETF guidance banner */}
        <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Info size={16} color="#4338ca" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: "0.82rem", color: "#3730a3", lineHeight: 1.5 }}>
            <strong>FETF 2026:</strong> The full published item list and grant rates for the 2026 round have not yet been confirmed by the RPA. Item reference codes shown in the picker are based on previous FETF rounds — verify codes and eligible costs against the current prospectus before applying at{" "}
            <a href="https://www.gov.uk/government/publications/farming-equipment-and-technology-fund-2025" target="_blank" rel="noopener noreferrer" style={{ color: "#4338ca", textDecoration: "underline" }}>
              gov.uk FETF guidance <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
            </a>
          </div>
        </div>

        {/* Export / print filter bar */}
        {records.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 12,
            flexWrap: "wrap" as const,
          }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", flexShrink: 0 }}>
              Export &amp; Print filter:
            </span>
            <SchemeNameCombobox
              value={grantExportScheme}
              onChange={setGrantExportScheme}
              schemeNames={uniqueGrantSchemeNames}
              compact
            />
            <select
              value={grantExportStatus}
              onChange={e => setGrantExportStatus(e.target.value)}
              style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", background: grantExportStatus !== "all" ? "#111827" : "#fff", color: grantExportStatus !== "all" ? "#fff" : "#111827", cursor: "pointer", fontWeight: grantExportStatus !== "all" ? 600 : 400 }}
            >
              <option value="all">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
            {(grantExportScheme !== "all" || grantExportStatus !== "all") && (
              <button
                onClick={() => { setGrantExportScheme("all"); setGrantExportStatus("all"); }}
                style={{ fontSize: "0.78rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Clear
              </button>
            )}
            <span style={{ fontSize: "0.78rem", color: "#9ca3af", marginLeft: "auto" }}>
              {exportFilteredRecords.length} of {records.length} grant{records.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        )}

        {/* Year & Archive toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap", padding: "8px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarDays size={14} color="#6b7280" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Year</span>
            <select
              value={yearFilter}
              onChange={e => { const v = e.target.value; setYearFilter(v); setQuickFilter(""); setStatusFilter("all"); }}
              style={{ fontSize: "0.85rem", padding: "3px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: yearFilter !== "all" ? "#eff6ff" : "#fff", color: "#111827", cursor: "pointer", fontWeight: yearFilter !== "all" ? 600 : 400 }}
            >
              <option value="all">All years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              {availableYears.length === 0 && <option disabled>No years available</option>}
            </select>
          </div>
          {uniqueGrantSchemeNames.length > 1 && (
            <>
              <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
              <SchemeNameCombobox
                value={screenScheme}
                onChange={v => { setScreenScheme(v); setQuickFilter(""); setStatusFilter("all"); }}
                schemeNames={uniqueGrantSchemeNames}
                compact
              />
            </>
          )}
          {(archivedCount > 0 || !hideArchived) && (
            <>
              <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
              <button
                onClick={() => { setHideArchived(h => !h); setQuickFilter(""); }}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", padding: "3px 10px", borderRadius: 6, border: "1px solid", background: hideArchived ? "#fff" : "#fef9c3", borderColor: hideArchived ? "#e5e7eb" : "#fbbf24", color: hideArchived ? "#374151" : "#92400e", cursor: "pointer", fontWeight: 500 }}
              >
                <Archive size={13} />
                {hideArchived ? `Show archived (${archivedCount})` : `Hide archived (${archivedCount})`}
              </button>
            </>
          )}
          {(yearFilter !== "all" || !hideArchived || screenScheme !== "all") && (
            <button
              onClick={() => { setYearFilter("all"); setHideArchived(true); setQuickFilter(""); setStatusFilter("all"); setScreenScheme("all"); }}
              style={{ fontSize: "0.78rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginLeft: 2 }}
            >
              Reset filters
            </button>
          )}
          {records.length > 0 && availableYears.length === 0 && (
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }}>
              Add an Application Date to records to enable year filtering
            </span>
          )}
        </div>

        {/* Status filter tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {(["all", ...STATUSES] as const).map(s => {
            const count = statusCounts[s] ?? 0;
            const active = statusFilter === s;
            const cfg = s === "all" ? null : STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setQuickFilter(""); }}
                style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: active ? 700 : 500, cursor: "pointer", border: "1px solid",
                  background: active ? "#f0f4ff" : "#fff",
                  borderColor: active ? "#6366f1" : "#e5e7eb",
                  color: active ? "#3730a3" : "#374151",
                }}>
                {s === "all" ? "All" : STATUS_CONFIG[s].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Records table */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}><Loader2 size={24} className="animate-spin" style={{ display: "inline" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }}>
            <PoundSterling size={32} color="#d1d5db" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
              {quickFilter === "approved" ? "No approved grants"
                : quickFilter === "active" ? "No active applications"
                : quickFilter === "deadlines" ? "No upcoming or overdue deadlines"
                : statusFilter !== "all" ? `No ${(STATUS_CONFIG as Record<string, {label: string}>)[statusFilter]?.label?.toLowerCase() ?? statusFilter} grants`
                : records.length === 0 ? "No grants recorded yet"
                : "No records match the current filters"}
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: 16 }}>
              {records.length === 0
                ? "Add your first FETF or scheme application to start tracking deadlines and grant values."
                : hideArchived && archivedCount > 0
                  ? `${archivedCount} archived record${archivedCount !== 1 ? "s" : ""} (claimed, rejected, withdrawn) are hidden — click "Show archived" above to reveal them.`
                  : yearFilter !== "all"
                    ? `No records have an application or approval date in ${yearFilter}. Switch to "All years" to see all records.`
                    : "Try adjusting the year filter or status tabs."}
            </div>
            {records.length === 0 && !quickFilter && statusFilter === "all" && <Button onClick={openAdd} variant="outline"><Plus size={14} /> Add Grant</Button>}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Scheme / Item</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Status</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Grant Amount</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Actual Cost</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Purchase Deadline</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Claim Deadline</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Evidence</th>
                    <th style={{ padding: "10px 16px", width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={r.id}
                      ref={(el) => { if (el) rowRefs.current.set(r.id, el as HTMLElement); }}
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}
                      className={`transition-colors${hlId === r.id ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : ""}`}
                      onMouseEnter={e => { if (hlId !== r.id) e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={e => { if (hlId !== r.id) e.currentTarget.style.background = ""; }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{r.schemeName}</div>
                        {r.itemReferenceCode && (
                          <div style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 500, marginTop: 2 }}>{r.itemReferenceCode}</div>
                        )}
                        {r.itemDescription && (
                          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 1, maxWidth: 280 }}>{r.itemDescription}</div>
                        )}
                        {r.applicationReference && (
                          <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>App ref: {r.applicationReference}</div>
                        )}
                        {r.approvalAgreementReference && (
                          <div style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 500, marginTop: 2 }}>Agreement: {r.approvalAgreementReference}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#059669" }}>{formatGBP(r.grantAmountPence)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#374151" }}>{formatGBP(r.actualCostPence)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {["claimed","rejected","withdrawn"].includes(r.status) ? (
                          <span className="text-gray-400 text-sm">{formatDate(r.purchaseDeadline)}</span>
                        ) : (
                          <DeadlineBadge dateStr={r.purchaseDeadline} />
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {["claimed","rejected","withdrawn"].includes(r.status) ? (
                          <span className="text-gray-400 text-sm">{formatDate(r.claimDeadline)}</span>
                        ) : (
                          <DeadlineBadge dateStr={r.claimDeadline} />
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {r.documentPath ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <a href={`/api/storage${r.documentPath}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: "0.78rem", textDecoration: "none" }}>
                              <FileText size={14} /> {r.documentName ?? "View"}
                            </a>
                            <button onClick={() => removeDocument(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}>
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#6b7280", fontSize: "0.78rem" }}>
                            {uploadingId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                            {uploadingId === r.id ? "Uploading…" : "Attach"}
                            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: "none" }}
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleEvidenceUpload(r, f); e.target.value = ""; }} />
                          </label>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }} title="View">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 4 }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleting(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4 }}>
                            <Trash2 size={15} />
                          </button>
                          {!["claimed","rejected","withdrawn"].includes(r.status) && (
                            <button onClick={() => setRaiseTaskFor(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 4, borderRadius: 4 }} title="Raise Task">
                              <ClipboardList size={15} />
                            </button>
                          )}
                          {(r.schemeType === "SFI" || r.schemeType === "CS") && ["approved","purchased","claimed"].includes(r.status) && (
                            <button
                              onClick={() => {
                                const schemeName = r.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
                                const prefill = btoa(JSON.stringify({ agreementNumber: r.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
                                navigate(`/sfi?prefill=${prefill}`);
                              }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4, borderRadius: 4 }}
                              title="Start SFI / ELM Record"
                            >
                              <ArrowRight size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>{/* end grants-cap-screen */}

        {/* Print-only grants report */}
        {exportFilteredRecords.length > 0 && (
          <div className="grants-cap-print" style={{ display: "none" }}>
            <div style={{ fontFamily: "Georgia, serif", color: "#111827", padding: "0 0 24px" }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 }}>Equipment &amp; Capital Grants</h1>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 24 }}>
                Exported {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                {grantExportScheme !== "all" && ` · Scheme: ${grantExportScheme}`}
                {grantExportStatus !== "all" && ` · Status: ${STATUS_CONFIG[grantExportStatus as GrantStatus]?.label ?? grantExportStatus}`}
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ textAlign: "left", padding: "6px 12px 6px 0", fontWeight: 600 }}>Scheme / Item</th>
                    <th style={{ textAlign: "left", padding: "6px 12px", fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: "right", padding: "6px 0 6px 12px", fontWeight: 600 }}>Grant (£)</th>
                    <th style={{ textAlign: "right", padding: "6px 0 6px 12px", fontWeight: 600 }}>Actual Cost (£)</th>
                    <th style={{ textAlign: "left", padding: "6px 0 6px 12px", fontWeight: 600 }}>Purchase Deadline</th>
                    <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 600 }}>Claim Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {exportFilteredRecords.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6", pageBreakInside: "avoid" }}>
                      <td style={{ padding: "6px 12px 6px 0", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600 }}>{r.schemeName}</div>
                        {r.itemReferenceCode && <div style={{ fontSize: "0.75rem", color: "#7c3aed" }}>{r.itemReferenceCode}</div>}
                        {r.itemDescription && <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.itemDescription}</div>}
                        {r.applicationReference && <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>App ref: {r.applicationReference}</div>}
                      </td>
                      <td style={{ padding: "6px 12px", verticalAlign: "top" }}>{STATUS_CONFIG[r.status]?.label ?? r.status}</td>
                      <td style={{ padding: "6px 0 6px 12px", textAlign: "right", verticalAlign: "top", fontWeight: 600 }}>{r.grantAmountPence != null ? `£${(r.grantAmountPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—"}</td>
                      <td style={{ padding: "6px 0 6px 12px", textAlign: "right", verticalAlign: "top" }}>{r.actualCostPence != null ? `£${(r.actualCostPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—"}</td>
                      <td style={{ padding: "6px 0 6px 12px", verticalAlign: "top", whiteSpace: "nowrap" }}>{formatDate(r.purchaseDeadline)}</td>
                      <td style={{ padding: "6px 0", verticalAlign: "top", whiteSpace: "nowrap" }}>{formatDate(r.claimDeadline)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View dialog */}
        {viewRecord && (
          <Dialog open onOpenChange={() => setViewRecord(null)}>
            <DialogContent style={{ maxWidth: 540 }}>
              <DialogHeader><DialogTitle>Grant / Funding Record</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Scheme</p><p className="font-medium">{viewRecord.schemeName}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Type</p><p>{viewRecord.schemeType || "—"}</p></div>
                  {viewRecord.itemReferenceCode && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Item Ref</p><p className="font-mono text-xs">{viewRecord.itemReferenceCode}</p></div>}
                  {viewRecord.applicationReference && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Application Ref</p><p className="font-mono text-xs">{viewRecord.applicationReference}</p></div>}
                  {viewRecord.approvalAgreementReference && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px" }}><p className="text-xs font-medium mb-1" style={{ color: "#166534" }}>RPA Agreement Ref</p><p className="font-mono text-xs font-semibold" style={{ color: "#15803d" }}>{viewRecord.approvalAgreementReference}</p></div>}
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><p className="capitalize">{viewRecord.status}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Application Date</p><p>{formatDate(viewRecord.applicationDate)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Approval Date</p><p>{formatDate(viewRecord.approvalDate)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Claim Deadline</p><p>{formatDate(viewRecord.claimDeadline)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Deadline</p><p>{formatDate(viewRecord.purchaseDeadline)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Grant Amount</p><p>{formatGBP(viewRecord.grantAmountPence)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Actual Cost</p><p>{formatGBP(viewRecord.actualCostPence)}</p></div>
                </div>
                {viewRecord.itemDescription && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Item Description</p><p className="text-gray-700">{viewRecord.itemDescription}</p></div>}
                {viewRecord.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.notes}</p></div>}
                {viewRecord.documentPath && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Document</p><a href={`/api/storage${viewRecord.documentPath}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 text-sm"><FileText size={14} />{viewRecord.documentName ?? "View Document"}</a></div>}
              </div>
              <DialogFooter>
                {(viewRecord.schemeType === "SFI" || viewRecord.schemeType === "CS") && ["approved","purchased","claimed"].includes(viewRecord.status) && (
                  <Button
                    variant="outline"
                    style={{ borderColor: "#16a34a", color: "#16a34a", marginRight: "auto" }}
                    onClick={() => {
                      const schemeName = viewRecord.schemeType === "SFI" ? "SFI 2024" : "Countryside Stewardship (CS)";
                      const prefill = btoa(JSON.stringify({ agreementNumber: viewRecord.approvalAgreementReference ?? "", schemeName, managingBody: "RPA", status: "active" }));
                      setViewRecord(null);
                      navigate(`/sfi?prefill=${prefill}`);
                    }}
                  >
                    Start SFI / ELM Record <ArrowRight size={14} className="ml-1" />
                  </Button>
                )}
                <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil size={14} className="mr-1" />Edit</Button>
                <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add / Edit dialog */}
        <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); setEditing(null); saveMut.reset(); } }}>
          <DialogContent style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Grant" : "Add Grant / Funding Application"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(form); }} style={{ display: "grid", gap: 14 }}>
              {/* Scheme name + type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Scheme Name *</label>
                  <Input value={form.schemeName} onChange={e => setForm(f => ({ ...f, schemeName: e.target.value }))}
                    placeholder="e.g. FETF 2026, CS Capital, SFI Capital" required />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Scheme Type</label>
                  <select
                    value={SCHEME_TYPES.filter(t => t !== "Other").includes(form.schemeType as any) ? form.schemeType : "Other"}
                    onChange={e => setForm(f => ({ ...f, schemeType: e.target.value as SchemeType }))}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" }}>
                    {SCHEME_TYPES.map(t => <option key={t} value={t}>{t === "Other" ? "Other (please specify)" : t}</option>)}
                  </select>
                  {(form.schemeType === "Other" || (form.schemeType && !SCHEME_TYPES.filter(t => t !== "Other").includes(form.schemeType as any))) && (
                    <Input
                      style={{ marginTop: 4, fontSize: "0.875rem" }}
                      value={form.schemeType === "Other" ? "" : form.schemeType}
                      onChange={e => setForm(f => ({ ...f, schemeType: (e.target.value || "Other") as SchemeType }))}
                      placeholder="Please specify scheme type…"
                      autoFocus={form.schemeType === "Other"}
                    />
                  )}
                </div>
              </div>

              {/* Item reference + picker */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Item Reference Code</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input value={form.itemReferenceCode} onChange={e => setForm(f => ({ ...f, itemReferenceCode: e.target.value }))}
                    placeholder="e.g. T-SYS-1, LESS-2, ANH-2" style={{ flex: 1 }} />
                  {form.schemeType === "FETF" && (
                    <Button type="button" variant="outline" onClick={() => setFetfPickerOpen(true)} style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                      Browse FETF items
                    </Button>
                  )}
                </div>
              </div>

              {/* Item description */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Item Description</label>
                <Input value={form.itemDescription} onChange={e => setForm(f => ({ ...f, itemDescription: e.target.value }))}
                  placeholder="e.g. Auto-steering GPS system for 6m tractor" />
              </div>

              {/* Application reference */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Application Reference</label>
                <Input value={form.applicationReference} onChange={e => setForm(f => ({ ...f, applicationReference: e.target.value }))}
                  placeholder="RPA / scheme application reference number" />
              </div>

              {/* RPA Agreement Reference — only for SFI/CS when approved or beyond */}
              {(form.schemeType === "SFI" || form.schemeType === "CS") && ["approved","purchased","claimed"].includes(form.status) && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "12px 14px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#166534", display: "block", marginBottom: 4 }}>
                    RPA Agreement / Approval Reference
                    <span style={{ fontWeight: 400, color: "#15803d", marginLeft: 6 }}>— issued by RPA on approval</span>
                  </label>
                  <Input
                    value={form.approvalAgreementReference}
                    onChange={e => setForm(f => ({ ...f, approvalAgreementReference: e.target.value }))}
                    placeholder={form.schemeType === "SFI" ? "e.g. SFI-2024-123456" : "e.g. CS-2024-78901"}
                    style={{ borderColor: "#86efac" }}
                  />
                  <p style={{ fontSize: "0.72rem", color: "#15803d", marginTop: 6 }}>
                    This reference carries through to the SFI / ELM page when you start your agreement record.
                  </p>
                </div>
              )}

              {/* Dates row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Application Date</label>
                  <Input type="date" value={form.applicationDate} onChange={e => setForm(f => ({ ...f, applicationDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Approval Date</label>
                  <Input type="date" value={form.approvalDate} onChange={e => setForm(f => ({ ...f, approvalDate: e.target.value }))} />
                </div>
              </div>

              {/* Deadlines */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    Purchase Deadline
                    <span style={{ fontWeight: 400, color: "#6b7280" }}> — must buy by</span>
                  </label>
                  <Input type="date" value={form.purchaseDeadline} onChange={e => setForm(f => ({ ...f, purchaseDeadline: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    Claim Deadline
                    <span style={{ fontWeight: 400, color: "#6b7280" }}> — must claim by</span>
                  </label>
                  <Input type="date" value={form.claimDeadline} onChange={e => setForm(f => ({ ...f, claimDeadline: e.target.value }))} />
                </div>
              </div>

              {/* Amounts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Grant Amount (£)</label>
                  <Input type="number" min="0" step="1" value={form.grantAmountGBP}
                    onChange={e => setForm(f => ({ ...f, grantAmountGBP: e.target.value }))}
                    placeholder="Amount payable by scheme" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Actual Item Cost (£)</label>
                  <Input type="number" min="0" step="1" value={form.actualCostGBP}
                    onChange={e => setForm(f => ({ ...f, actualCostGBP: e.target.value }))}
                    placeholder="Total purchase price" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as GrantStatus }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Any additional notes about this application…"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box" }} />
              </div>

              <DialogMutationError mutation={saveMut} message="Failed to save — your entries are still here." />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={saveMut.isPending}>
                  {saveMut.isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (editing ? "Save Changes" : "Add Grant")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* FETF Item Picker Dialog */}
        <Dialog open={fetfPickerOpen} onOpenChange={setFetfPickerOpen}>
          <DialogContent style={{ maxWidth: 640, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <DialogHeader>
              <DialogTitle>FETF Item Reference Picker</DialogTitle>
            </DialogHeader>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 12px" }}>
              Based on previous FETF rounds — verify against the current RPA prospectus before applying.
            </p>
            <Input value={fetfSearch} onChange={e => setFetfSearch(e.target.value)}
              placeholder="Search by code, description, or category…" style={{ marginBottom: 12 }} />
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredFetf.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No items match your search.</div>
              ) : (
                filteredFetf.map(item => (
                  <button key={item.code} onClick={() => pickFetfItem(item)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", width: "100%" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", marginTop: 1 }}>{item.code}</span>
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}>{item.description}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }}>{item.category}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleting} onOpenChange={v => { if (!v) { setDeleting(null); deleteMut.reset(); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Grant?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the record for <strong>{deleting?.schemeName}</strong>. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <DialogMutationError mutation={deleteMut} message="Failed to remove — please try again." />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleting && deleteMut.mutate(deleting.id)}
                style={{ background: "#ef4444" }}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <RaiseTaskDialog
          farmId={farmId!}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={raiseTaskFor ? `Grant Action — ${raiseTaskFor.schemeName}` : ""}
          defaultDescription={raiseTaskFor ? [
            raiseTaskFor.purchaseDeadline ? `Purchase deadline: ${new Date(raiseTaskFor.purchaseDeadline).toLocaleDateString("en-GB")}` : "",
            raiseTaskFor.claimDeadline ? `Claim deadline: ${new Date(raiseTaskFor.claimDeadline).toLocaleDateString("en-GB")}` : "",
          ].filter(Boolean).join("\n") : ""}
          module="grants"
        />
      </>}

      {mainTab === "agrienv" && <AgriEnvTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
