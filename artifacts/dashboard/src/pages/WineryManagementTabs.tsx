import { useState, useMemo, useEffect, useRef } from "react";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { BOTTLING_COLUMNS, BOTTLING_IMPORT_HEADERS, resolveBottlingField, bottlingImportRecord, parseCsvText, parseBottlingCsv } from "@/lib/bottling-csv";
import { computePrimaryPhTa, computePhTaStagePoints } from "@/lib/ph-ta-stages";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Eye, FlaskConical, Wine, Beaker, Gauge, Thermometer, Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Wrench, ShieldCheck, FileDown, Printer, Settings2, RefreshCw, GitBranch, Leaf, Search, Upload, PenLine, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import SignatureCanvas from "react-signature-canvas";

// ─── Local helpers ─────────────────────────────────────────────────────────────
const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
const fmtNum = (v: unknown, dp = 1) => (v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp));
const today = new Date().toISOString().split("T")[0];

function exportCSV(rows: Record<string, unknown>[], filename: string, cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[], prefixLines?: string[]) {
  const header = cols.map(c => `"${c.label}"`).join(",");
  const body = rows.map(r => cols.map(c => {
    const v = c.fmt ? c.fmt(r) : (r[c.key] ?? "");
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(",")).join("\n");
  const prefix = prefixLines && prefixLines.length > 0 ? prefixLines.join("\n") + "\n" : "";
  const blob = new Blob([prefix + header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

// Filename-safe slug for embedding filter values in export filenames
const csvSlug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// Quote-escaped single-cell comment row for CSV prefix blocks
const csvComment = (s: string) => `"${s.replace(/"/g, '""')}"`;

// Farm display name for CSV/PDF headers — same "farms-list" query key as the
// per-tab lookups so the list is fetched once and shared.
function useFarmName(farmId: number): string {
  const { data } = useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  return ((Array.isArray(data?.farms)
    ? (data.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`);
}

function useCrud<T extends Record<string, unknown>>(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery<T[]>({
    queryKey: [key, farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: [key, farmId] });
  const add = useMutation({
    mutationFn: async (body: Partial<T>) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); const err = new Error(e.error || "Save failed"); (err as Error & { code?: string }).code = e.code; throw err; }
      return r.json();
    },
    onSuccess: invalidate,
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const edit = useMutation({
    mutationFn: async ({ id, ...body }: Partial<T> & { id: number }) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); const err = new Error(e.error || "Save failed"); (err as Error & { code?: string }).code = e.code; throw err; }
      return r.json();
    },
    onSuccess: invalidate,
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); } },
    onSuccess: invalidate,
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  return { data: q.data ?? [], isLoading: q.isLoading, add, edit, remove };
}

function useVessels(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-vessels", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels`), { credentials: "include" });
      const d = await r.json();
      return (d.records ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

function useEquipment(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-equipment", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-equipment`), { credentials: "include" });
      const d = await r.json();
      return (d.records ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

function usePressing(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing`), { credentials: "include" });
      const d = await r.json();
      return (d.records ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

function useAdditionsSummary(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-additions-summary", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/additions-summary`), { credentials: "include" });
      const d = await r.json();
      return (d.summary ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });
}

function useAllPressAdditions(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-all-additions", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/all-additions`), { credentials: "include" });
      const d = await r.json();
      return (d.additions ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });
}

function useStaff(farmId: number) {
  const { data, isLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  return {
    staffNames: (data?.staff ?? []).map((s: { name: string }) => s.name),
    isLoading,
  };
}

// Persist a tab's vintage year filter in localStorage, scoped to the farm.
// Same pattern as PressingRecordsTab's `pressing-year-filter-${farmId}` key:
// lazy initializer, wrapped setter, and a farmId re-sync effect (the component
// may stay mounted across farm switches).
function usePersistedYearFilter(prefix: string, farmId: number): [string, (v: string) => void] {
  const storageKey = `${prefix}-year-filter-${farmId}`;
  const [yearFilter, setYearFilterRaw] = useState(() => {
    try { return localStorage.getItem(storageKey) ?? String(new Date().getFullYear()); } catch { return String(new Date().getFullYear()); }
  });
  useEffect(() => {
    try { setYearFilterRaw(localStorage.getItem(storageKey) ?? String(new Date().getFullYear())); } catch { /**/ }
  }, [storageKey]);
  const setYearFilter = (v: string) => { try { localStorage.setItem(storageKey, v); } catch { /**/ } setYearFilterRaw(v); };
  return [yearFilter, setYearFilter];
}

function ViewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium text-sm">{value ?? "—"}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t pt-3 mt-1">{children}</p>;
}

// Amber warning shown inside an edit dialog when the record being edited has
// already been signed off — same pattern as the pressing edit dialog.
function SignedEditWarning({ signed }: { signed: unknown }) {
  if (!signed) return null;
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
      <span>
        <strong>This record has been signed off.</strong> The sign-off remains intact, but any change you save will be permanently recorded in the record's edit history for audit purposes.
      </span>
    </div>
  );
}

// Amber "Edited After Sign-Off" list shown in view dialogs — same pattern as the
// pressing view dialog. Renders nothing when the record has no edit history.
function EditHistorySection({ history }: { history: unknown }) {
  if (!Array.isArray(history) || history.length === 0) return null;
  return (
    <div className="border-t pt-2 mt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Edited After Sign-Off</p>
      <ul className="mt-1 space-y-0.5">
        {(history as Record<string, unknown>[]).map((h, i) => (
          <li key={i} className="text-xs text-muted-foreground">
            {String(h.note ?? "")}
            {h.editedAt ? <span className="text-[10px] text-muted-foreground/70"> ({new Date(String(h.editedAt)).toLocaleString("en-GB")})</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-40" />
      <p className="font-medium">{title}</p>
      <p className="text-xs mt-1">{sub}</p>
    </div>
  );
}

function So2Badge({ compliant }: { compliant: unknown }) {
  if (compliant === true || compliant === "true" || compliant === 1 || compliant === "1") {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />Compliant</span>;
  }
  if (compliant === false || compliant === "false" || compliant === 0 || compliant === "0") {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" />Exceeds Limit</span>;
  }
  return <span className="text-muted-foreground text-xs">—</span>;
}

// Tooltip for the pressing table sign-off badge. Prefers the auditor-declared
// declaration date (audit_signer_date, a date-only YYYY-MM-DD parsed as a local
// calendar date to avoid UTC day-shift), falling back to the digital timestamp
// (audit_signed_at). Signer name/role are included only when present.
function fmtDDMonYYYY(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function signOffTooltip(r: Record<string, unknown>): string {
  let dateStr = "";
  if (r.audit_signer_date) {
    const s = String(r.audit_signer_date);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
    if (!isNaN(d.getTime())) dateStr = fmtDDMonYYYY(d);
  } else if (r.audit_signed_at) {
    const d = new Date(String(r.audit_signed_at));
    if (!isNaN(d.getTime())) dateStr = fmtDDMonYYYY(d);
  }
  const name = r.audit_signer_name ? String(r.audit_signer_name) : "";
  const role = r.audit_signer_role ? ` (${String(r.audit_signer_role)})` : "";
  if (name && dateStr) return `Signed by ${name}${role} on ${dateStr}`;
  if (name) return `Signed by ${name}${role}`;
  if (dateStr) return `Signed on ${dateStr}`;
  return "Signed";
}

// Batch-trail table button. The base Button applies `disabled:pointer-events-none`,
// which suppresses the native `title` tooltip on a disabled button — so the
// explanatory title lives on a wrapping <span>, which still receives hover events.
function BatchTrailButton({ batchRef, onClick }: { batchRef: unknown; onClick: () => void }) {
  return (
    <span title={batchRef ? `View batch trail for ${String(batchRef)}` : "No batch reference — batch trail unavailable"} className="inline-flex">
      <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 disabled:opacity-40" disabled={!batchRef} onClick={onClick}><GitBranch className="h-4 w-4" /></Button>
    </span>
  );
}

// ─── Cross-tab "view additions" shortcut ──────────────────────────────────────
// Fermentation / Cellar Ops / Bottling rows carry a batch_ref but the Additions
// Report lives in the Pressing tab. The shortcut stores the requested scope in
// sessionStorage and fires an event; the parent page (ViticulturePage /
// OrganicViticulturePage) listens for the event and switches to the Pressing
// tab, whose mount effect consumes the stored scope and opens the report
// pre-filtered — same pre-fill behaviour as the pressing-row Beaker button.
export const WINERY_VIEW_ADDITIONS_EVENT = "winery:view-additions";
const additionsShortcutKey = (farmId: number) => `winery-additions-shortcut-${farmId}`;
function requestAdditionsReport(farmId: number, batchRef: unknown, vintageYear: unknown) {
  try {
    sessionStorage.setItem(additionsShortcutKey(farmId), JSON.stringify({
      batchRef: String(batchRef ?? ""),
      vintageYear: vintageYear != null && String(vintageYear) !== "" ? String(vintageYear) : null,
    }));
  } catch { /* storage unavailable — event alone still switches tab */ }
  window.dispatchEvent(new Event(WINERY_VIEW_ADDITIONS_EVENT));
}
// Row action button for the shortcut — same disabled-title-on-span pattern as
// BatchTrailButton, and the same amber Beaker styling as the pressing rows.
function ViewAdditionsButton({ farmId, record }: { farmId: number; record: Record<string, unknown> }) {
  const batchRef = record.batch_ref;
  return (
    <span title={batchRef ? `View additions for ${String(batchRef)}` : "No batch reference — additions view unavailable"} className="inline-flex">
      <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 disabled:opacity-40" disabled={!batchRef}
        onClick={() => requestAdditionsReport(farmId, batchRef, record.vintage_year)}>
        <Beaker className="h-4 w-4" />
      </Button>
    </span>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WINE_COLOUR_OPTIONS = ["Red", "White", "Rosé", "Sparkling", "Orange", "Other"];
const ORGANIC_MAX_SO2: Record<string, string> = { "Red": "100", "White": "150", "Rosé": "150", "Sparkling": "185", "Orange": "150" };
// Conventional (non-organic) total SO₂ ceilings — UK-retained Reg 1308/2013 Annex VIII Part B
const CONVENTIONAL_MAX_SO2: Record<string, string> = { "Red": "150", "White": "200", "Rosé": "200", "Sparkling": "235", "Orange": "200" };
const SOURCE_TYPE_OPTIONS = ["Own vineyard", "Contract grower", "Purchased grapes"];
const GRAPE_CONDITION_OPTIONS = ["Excellent", "Good", "Fair", "Poor"];
const PRESS_TYPE_OPTIONS = ["Pneumatic bladder", "Basket press", "Continuous screw", "Membrane press", "Other"];
const JUICE_TURBIDITY_OPTIONS = ["Clear", "Slightly turbid", "Turbid"];
const SETTLING_METHOD_OPTIONS = ["Static cold", "Static warm", "Centrifuge", "Flocculant", "None"];
const FERMENTATION_TYPE_OPTIONS = ["Wild / spontaneous fermentation", "Inoculated — commercial yeast", "Inoculated — cultured indigenous yeast"];
const VESSEL_TYPE_OPTIONS = ["Stainless steel tank", "Oak barrel (225L)", "Oak barrel (500L)", "Oak vat / foudre", "Amphora / clay", "Fibreglass tank", "HDPE tank", "Concrete tank", "Other"];
const VESSEL_STATUS_OPTIONS = ["active", "retired", "sold"];
const CLEAN_TYPE_OPTIONS = ["Rinse (water only)", "Hot water rinse", "CIP (Clean-in-place)", "Steam", "Chemical wash", "Ozone", "Other"];
const CELLAR_OP_TYPES = ["racking", "topping", "sulfiting", "fining", "filtering", "cold-stabilisation", "other"];
const CELLAR_OP_LABELS: Record<string, string> = {
  racking: "Racking (lees removal)", topping: "Topping up", sulfiting: "Sulfiting (SO₂ addition)",
  fining: "Fining", filtering: "Filtering", "cold-stabilisation": "Cold stabilisation", other: "Other",
};
const CLOSURE_TYPE_OPTIONS = ["Natural cork", "Technical cork", "Agglomerate cork", "Screw cap (Stelvin)", "Crown cap", "Waxed cork", "Glass stopper", "Other"];
const SO2_TEST_STAGES = ["at-pressing", "post-fermentation", "post-racking", "pre-bottling", "at-bottling", "other"];
const SO2_TEST_STAGE_LABELS: Record<string, string> = {
  "at-pressing": "At pressing", "post-fermentation": "Post-fermentation", "post-racking": "Post-racking",
  "pre-bottling": "Pre-bottling", "at-bottling": "At bottling line", "other": "Other",
};
const SO2_TEST_METHODS = ["On-site — Ripper titration", "On-site — Enzymatic kit", "On-site — Aeration-oxidation", "Third-party laboratory", "Not tested / not applicable"];
const EQUIPMENT_TYPES = ["Ripper burette / titrator", "Enzymatic SO₂ analyser", "Aeration-oxidation apparatus", "Refractometer (Brix)", "pH meter", "Hydrometer / densimeter", "Other analytical equipment"];
const EQUIPMENT_STATUS_OPTIONS = ["active", "out-of-service", "retired"];
const CALIBRATION_RESULT_OPTIONS = ["pass", "fail", "adjusted"];
const CALIBRATION_FREQ_OPTIONS = ["Per use", "Daily", "Weekly", "Monthly", "Quarterly", "Annually"];
const TOASTING_OPTIONS = ["Light (L)", "Medium (M)", "Medium+ (M+)", "Heavy (H)", "Extra Heavy (EH)", "None"];

// ─── Press Additive Catalogue ─────────────────────────────────────────────────
// Limits per retained EU Reg 2019/934 (UK-retained law).
// maxPerUnit: per-unit conventional ceiling (hard limit — API rejects above this).
// organicMaxPerUnit: lower organic limit (UI warning only, not API enforced at this stage).
interface PermittedAdditive {
  name: string; category: string; defaultUnit: string; units: string[];
  maxPerUnit?: Record<string, number>;
  organicMaxPerUnit?: Record<string, number>;
}
const PERMITTED_ADDITIVES: PermittedAdditive[] = [
  { name: "SO₂ / Potassium metabisulphite (KMS)", category: "so2",           defaultUnit: "mg/kg", units: ["mg/kg", "mg/L"],        maxPerUnit: { "mg/kg": 200, "mg/L": 200 }, organicMaxPerUnit: { "mg/kg": 90, "mg/L": 90 } },
  { name: "Ascorbic acid",                         category: "ascorbic_acid", defaultUnit: "mg/L",  units: ["mg/L"],                 maxPerUnit: { "mg/L": 250 },               organicMaxPerUnit: { "mg/L": 250 } },
  { name: "Pectolytic enzyme (Pectinase)",         category: "pectolytic",    defaultUnit: "g/hL",  units: ["g/hL", "mL/hL"] },
  { name: "Bentonite (white must only)",           category: "fining",        defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Activated charcoal (white must only)",  category: "fining",        defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Diammonium phosphate (DAP)",            category: "nutrient",      defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Tartaric acid",                         category: "acidification", defaultUnit: "g/L",   units: ["g/L", "g/hL"] },
  { name: "Other",                                 category: "other",         defaultUnit: "g/hL",  units: ["mg/kg", "mg/L", "g/hL", "g/L", "mL/hL"] },
];
const ALL_DOSE_UNITS = ["mg/kg", "mg/L", "g/hL", "g/L", "mL/hL"];
const ADDITIVE_CATEGORY_LABELS: Record<string, string> = {
  so2: "SO₂ / KMS",
  ascorbic_acid: "Ascorbic acid",
  pectolytic: "Pectolytic enzyme",
  fining: "Fining agents",
  nutrient: "Nutrients",
  acidification: "Acidification",
  other: "Other",
};
interface AdditionRow { tempId: number; id?: number; additiveName: string; category: string; dose: string; unit: string; notes: string }

// ─── Pressing additive columns — single source of truth for PDF + CSV ─────────
// Both the batch-trail PDF (printBatchTrail "Press Additives" table) and the
// batch-trail CSV export (exportBatchTrailCsv "Pressing — Additive" rows) render
// their additive columns from this list. Add a new field here (and, if the CSV
// needs a new header column, to BATCH_TRAIL_CSV_HEADER) and both outputs pick
// it up together — they can no longer drift apart.
type PressAdditiveField = "additive_name" | "category" | "dose" | "unit" | "notes";
interface PressAdditiveColumn {
  /** Underlying additive record field — lookup key for the other winery reports */
  field: PressAdditiveField;
  /** Which batch-trail CSV header column this field fills */
  csvColumn: string;
  /** Header label in the printed PDF additives table */
  pdfLabel: string;
  align: "left" | "right";
  csvValue: (a: Record<string, unknown>) => string;
  /** PDF cell content (escaped by the renderer); defaults may differ from CSV (e.g. "—" vs "") */
  pdfValue: (a: Record<string, unknown>) => string;
  /** Extra inline styles for the PDF table cell */
  pdfCellStyle?: string;
}
const PRESS_ADDITIVE_COLUMNS: PressAdditiveColumn[] = [
  {
    field: "additive_name",
    csvColumn: "Type / Additive", pdfLabel: "Additive", align: "left",
    csvValue: a => String(a.additive_name ?? ""),
    pdfValue: a => String(a.additive_name ?? ""),
    pdfCellStyle: "font-weight:500",
  },
  {
    field: "category",
    csvColumn: "Detail", pdfLabel: "Category", align: "left",
    csvValue: a => String(a.category ?? ""),
    pdfValue: a => ADDITIVE_CATEGORY_LABELS[String(a.category)] ?? String(a.category ?? ""),
    pdfCellStyle: "color:#6b7280",
  },
  {
    field: "dose",
    csvColumn: "SO₂ / Dose", pdfLabel: "Dose", align: "right",
    csvValue: a => (a.dose != null ? parseFloat(String(a.dose)).toFixed(2) : ""),
    pdfValue: a => (a.dose != null ? parseFloat(String(a.dose)).toFixed(2) : "—"),
    pdfCellStyle: "text-align:right;font-family:monospace",
  },
  {
    field: "unit",
    csvColumn: "Unit", pdfLabel: "Unit", align: "left",
    csvValue: a => String(a.unit ?? ""),
    pdfValue: a => String(a.unit ?? ""),
  },
  {
    field: "notes",
    csvColumn: "Notes", pdfLabel: "Notes", align: "left",
    csvValue: a => String(a.notes ?? ""),
    pdfValue: a => String(a.notes ?? ""),
    pdfCellStyle: "color:#6b7280;font-style:italic",
  },
];
// Field-keyed lookup into PRESS_ADDITIVE_COLUMNS. The Additive Usage Report,
// the SO₂ & Additive Transaction Log (PDF + CSV) and the Pressing Report all
// pull their additive value formatting from here, so a new/changed additive
// field edited in PRESS_ADDITIVE_COLUMNS updates every winery output together.
const ADDITIVE_COL: Record<PressAdditiveField, PressAdditiveColumn> = Object.fromEntries(
  PRESS_ADDITIVE_COLUMNS.map(c => [c.field, c]),
) as Record<PressAdditiveField, PressAdditiveColumn>;
// exportCSV column for a shared additive field — generic label (the PDF label,
// not the batch-trail-specific CSV slot name) + the shared CSV value formatter.
const additiveCsvCol = (field: PressAdditiveField) => ({
  key: field,
  label: ADDITIVE_COL[field].pdfLabel,
  fmt: (r: Record<string, unknown>) => ADDITIVE_COL[field].csvValue(r),
});
// Batch-trail CSV header — the additive columns above map into these slots by name.
const BATCH_TRAIL_CSV_HEADER = ["Stage", "Batch Ref", "Date", "Type / Additive", "Detail", "SO₂ / Dose", "Unit", "SO₂ Ceiling (mg/L)", "SO₂ Compliance", "pH", "TA (g/L)", "Vessel", "Operator", "Notes"];

// ─── Harvest Reception columns — single source of truth ───────────────────────
// The export CSV (harvestCsvCols), the import template headers
// (HARVEST_IMPORT_HEADERS), the template example row, the import field aliases,
// and the bulk-import payload mapping are ALL derived from this one list.
// Adding or renaming a field requires only one edit here, and exports use the
// exact import headers + re-import-safe value formats (ISO date, Yes/No), so an
// exported CSV can always be re-imported.
interface HarvestColumn {
  /** CSV header used by both the export and the import template */
  header: string;
  /** snake_case field name from the API rows — also accepted as an import header alias */
  dbKey: string;
  /** camelCase key expected by the bulk-import endpoint */
  recordKey: string;
  /** Example value in the downloadable import template */
  example: string;
  /** Optional export formatter — must produce a value the import understands */
  exportValue?: (r: Record<string, unknown>) => string;
}
const HARVEST_COLUMNS: HarvestColumn[] = [
  {
    header: "Reception Date", dbKey: "reception_date", recordKey: "receptionDate", example: "2024-09-15",
    // ISO YYYY-MM-DD so the export can be re-imported (not locale dd/mm/yyyy)
    exportValue: r => (r.reception_date ? String(r.reception_date).split("T")[0] : ""),
  },
  { header: "Vintage Year",      dbKey: "vintage_year",          recordKey: "vintageYear",        example: "2024" },
  { header: "Variety",           dbKey: "variety",               recordKey: "variety",            example: "Bacchus" },
  { header: "Source Type",       dbKey: "source_type",           recordKey: "sourceType",         example: "Own vineyard" },
  { header: "Grower Name",       dbKey: "grower_name",           recordKey: "growerName",         example: "" },
  { header: "Gross Weight (kg)", dbKey: "gross_weight_kg",       recordKey: "grossWeightKg",      example: "5200" },
  { header: "Tare Weight (kg)",  dbKey: "tare_weight_kg",        recordKey: "tareWeightKg",       example: "1800" },
  { header: "Net Weight (kg)",   dbKey: "net_weight_kg",         recordKey: "netWeightKg",        example: "3400" },
  { header: "Brix",              dbKey: "brix",                  recordKey: "brix",               example: "19.5" },
  { header: "pH",                dbKey: "ph",                    recordKey: "ph",                 example: "3.45" },
  { header: "TA (g/L)",          dbKey: "titratable_acidity_gl", recordKey: "titratableAcidityGl", example: "7.2" },
  { header: "Temp (°C)",         dbKey: "intake_temperature_c",  recordKey: "intakeTemperatureC", example: "14" },
  { header: "Grape Condition",   dbKey: "grape_condition",       recordKey: "grapeCondition",     example: "Good" },
  {
    header: "Accepted (Yes/No)", dbKey: "accepted", recordKey: "accepted", example: "Yes",
    exportValue: r => (String(r.accepted) === "true" ? "Yes" : "No"),
  },
  { header: "Notes",             dbKey: "notes",                 recordKey: "notes",              example: "Example row — delete before importing" },
];
const HARVEST_IMPORT_HEADERS = HARVEST_COLUMNS.map(c => c.header);
// Each canonical header also accepts its snake_case dbKey as an import alias
const HARVEST_FIELD_ALIASES: Record<string, string[]> = Object.fromEntries(
  HARVEST_COLUMNS.map(c => [c.header, [c.header, c.dbKey]]),
);
const resolveHarvestField = (row: Record<string, string>, canonical: string): string => {
  for (const alias of HARVEST_FIELD_ALIASES[canonical] ?? [canonical]) {
    if (row[alias] != null && row[alias] !== "") return row[alias];
  }
  return "";
};

// ─── Harvest Reception Tab ─────────────────────────────────────────────────────
export function HarvestReceptionTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const crud = useCrud(farmId, "winery-reception", "winery-reception");
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [yearFilter, setYearFilter] = usePersistedYearFilter("harvest", farmId);
  const [harvestSearch, setHarvestSearch] = useState("");
  const farmName = useFarmName(farmId);
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  // ── Import state ────────────────────────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false);
  const [importParsed, setImportParsed] = useState<Record<string, string>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ insertedCount: number; rejectedCount: number; rejected: { row: number; reason: string }[] } | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const downloadHarvestTemplate = () => {
    const exampleRow = HARVEST_COLUMNS.map(c => c.example);
    const header = HARVEST_IMPORT_HEADERS.map(h => `"${h}"`).join(",");
    const example = exampleRow.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
    const blob = new Blob([header + "\n" + example + "\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "harvest-reception-import-template.csv";
    a.click();
  };

  const handleHarvestImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportResult(null);
    setImportParsed([]);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      // Full-file CSV state machine (shared with the Bottling importer):
      // quoted fields may contain commas, escaped quotes ("") and embedded
      // newlines — exports with multiline Notes round-trip cleanly.
      let parsed = parseCsvText(text);
      // Skip any leading comment/prefix rows (e.g. the farm-name + filter block
      // our own exports prepend) — the real header row is the first row that
      // contains a recognised column header or alias.
      const knownHeaders = new Set(HARVEST_COLUMNS.flatMap(c => [c.header, c.dbKey]));
      const headerIdx = parsed.findIndex(cells => cells.some(cell => knownHeaders.has(cell)));
      if (headerIdx > 0) parsed = parsed.slice(headerIdx);
      if (headerIdx === -1 || parsed.length < 2) { setImportError("CSV must have a header row and at least one data row."); return; }
      const headers = parsed[0];
      const rows: Record<string, string>[] = [];
      for (let i = 1; i < parsed.length; i++) {
        const cells = parsed[i];
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = cells[idx] ?? ""; });
        rows.push(row);
      }
      if (rows.length > 500) { setImportError("Maximum 500 rows per import."); return; }
      setImportParsed(rows);
    };
    reader.readAsText(file);
  };

  const submitHarvestImport = async () => {
    if (!importParsed.length) return;
    setImportLoading(true);
    setImportError(null);
    try {
      const records = importParsed.map(row => {
        const rec: Record<string, string | undefined> = {};
        for (const c of HARVEST_COLUMNS) {
          const v = resolveHarvestField(row, c.header);
          rec[c.recordKey] = v || undefined;
        }
        rec.accepted = (rec.accepted ?? "yes").toLowerCase() === "no" ? "false" : "true";
        return rec;
      });
      const r = await fetch(api(`farms/${farmId}/winery-reception/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Import failed"); }
      const result = await r.json();
      setImportResult(result);
      if (result.insertedCount > 0) qc.invalidateQueries({ queryKey: ["winery-reception", farmId] });
    } catch (err) {
      setImportError((err as Error).message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const resetHarvestImportDialog = () => {
    setImportParsed([]);
    setImportError(null);
    setImportResult(null);
    setImportLoading(false);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const grossKg = parseFloat(String(form.grossWeightKg || "0"));
  const tareKg = parseFloat(String(form.tareWeightKg || "0"));
  const autoNet = !isNaN(grossKg) && !isNaN(tareKg) && grossKg > 0 ? grossKg - tareKg : null;

  const openAdd = () => { setEditing(null); setForm({ receptionDate: today, vintageYear: String(new Date().getFullYear()), accepted: "true" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    const payload = { ...form, netWeightKg: autoNet != null ? String(autoNet) : form.netWeightKg };
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filteredByYear = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const filtered = harvestSearch.trim() === "" ? filteredByYear : filteredByYear.filter(r => {
    const q = harvestSearch.trim().toLowerCase();
    return (
      String(r.grower_name ?? "").toLowerCase().includes(q) ||
      String(r.variety ?? "").toLowerCase().includes(q) ||
      String(r.source_type ?? "").toLowerCase().includes(q) ||
      String(r.grape_condition ?? "").toLowerCase().includes(q) ||
      String(r.notes ?? "").toLowerCase().includes(q)
    );
  });
  // Derived from HARVEST_COLUMNS — headers and value formats match the import
  // template exactly, so an exported CSV can be re-imported as-is.
  const harvestCsvCols = HARVEST_COLUMNS.map(c => ({ key: c.dbKey, label: c.header, fmt: c.exportValue }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Winery Grape Intake Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Record each grape delivery at the winery gate — separate from the vineyard harvest log. Captures winery-scale weights, intake analysis, vehicle details, and condition on arrival.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Intake</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setHarvestSearch(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input className="h-8 pl-7 text-xs w-52" placeholder="Search grower, variety, notes…" value={harvestSearch} onChange={e => setHarvestSearch(e.target.value)} />
        </div>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          const searchTrim = harvestSearch.trim();
          const parts = ["harvest-reception", yearFilter === "all" ? "all-vintages" : yearFilter];
          if (searchTrim) parts.push(`search-${csvSlug(searchTrim)}`);
          const prefixLines = [
            csvComment(`Harvest Reception — ${farmName}`),
            csvComment(`Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}`),
            csvComment(`Search filter: ${searchTrim || "None"}`),
          ];
          exportCSV(filtered, `${parts.join("-")}.csv`, harvestCsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <Button size="sm" variant="outline" onClick={() => { resetHarvestImportDialog(); setImportOpen(true); }}><Upload className="w-3.5 h-3.5 mr-1" />Import CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Wine} title="No intake records yet" sub="Log grape deliveries received at the winery gate." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Block / Variety</th>
              <th className="text-left p-3 font-medium">Source</th>
              <th className="text-right p-3 font-medium">Net Wt (kg)</th>
              <th className="text-right p-3 font-medium">Brix °</th>
              <th className="text-right p-3 font-medium">pH</th>
              <th className="text-right p-3 font-medium">TA (g/L)</th>
              <th className="text-left p-3 font-medium">Condition</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.reception_date)}</td>
                  <td className="p-3">{fmt(blocks.find(b => b.id === r.block_id)?.blockName ?? r.block_id)} {r.variety ? <span className="text-muted-foreground text-xs">— {String(r.variety)}</span> : ""}</td>
                  <td className="p-3 text-muted-foreground">{fmt(r.source_type)}</td>
                  <td className="p-3 text-right font-mono">{fmtNum(r.net_weight_kg, 0)}</td>
                  <td className="p-3 text-right">{fmtNum(r.brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.ph, 2)}</td>
                  <td className="p-3 text-right">{fmtNum(r.titratable_acidity_gl, 1)}</td>
                  <td className="p-3">{fmt(r.grape_condition)}</td>
                  <td className="p-3">{r.accepted === false || r.accepted === "false" ? <span className="text-xs bg-red-100 text-red-700 rounded px-2 py-0.5">Rejected</span> : <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">Accepted</span>}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "Edit" : "Log"} Grape Intake</DialogTitle>
            <DialogDescription>Record grape delivery details at the winery gate. Separate from vineyard harvest — this captures winery-scale data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Delivery identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reception Date *</Label><Input type="date" max={today} value={String(form.receptionDate ?? "")} onChange={e => sf("receptionDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} placeholder={String(new Date().getFullYear())} /></div>
              <div>
                <Label>Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => sf("blockId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                  <SelectContent>{blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Variety</Label><Input value={String(form.variety ?? "")} onChange={e => sf("variety", e.target.value)} placeholder="e.g. Bacchus, Pinot Noir" /></div>
              <div>
                <Label>Source Type</Label>
                <Select value={String(form.sourceType ?? "")} onValueChange={v => sf("sourceType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SOURCE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Grower Name</Label><Input value={String(form.growerName ?? "")} onChange={e => sf("growerName", e.target.value)} placeholder="If contract grower" /></div>
            </div>
            <SectionLabel>Vehicle & transport</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Reg</Label><Input value={String(form.vehicleReg ?? "")} onChange={e => sf("vehicleReg", e.target.value)} /></div>
              <div><Label>Driver Name</Label><Input value={String(form.driverName ?? "")} onChange={e => sf("driverName", e.target.value)} /></div>
              <div><Label>Intake Temperature (°C)</Label><Input type="number" step="0.1" value={String(form.intakeTemperatureC ?? "")} onChange={e => sf("intakeTemperatureC", e.target.value)} /></div>
            </div>
            <SectionLabel>Weights (winery scales)</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Gross Weight (kg)</Label><Input type="number" step="0.1" value={String(form.grossWeightKg ?? "")} onChange={e => sf("grossWeightKg", e.target.value)} /></div>
              <div><Label>Tare Weight (kg)</Label><Input type="number" step="0.1" value={String(form.tareWeightKg ?? "")} onChange={e => sf("tareWeightKg", e.target.value)} /></div>
              <div>
                <Label>Net Weight (kg)</Label>
                {autoNet !== null
                  ? <div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoNet.toFixed(1)} <span className="text-blue-600 text-xs">auto</span></div>
                  : <Input type="number" step="0.1" value={String(form.netWeightKg ?? "")} onChange={e => sf("netWeightKg", e.target.value)} placeholder="Or enter gross & tare" />}
              </div>
            </div>
            <SectionLabel>Intake analysis (at winery gate)</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Brix °</Label><Input type="number" step="0.1" value={String(form.brix ?? "")} onChange={e => sf("brix", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={e => sf("ph", e.target.value)} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => sf("titratableAcidityGl", e.target.value)} /></div>
              <div><Label>Potential Alcohol %</Label><Input type="number" step="0.1" value={String(form.potentialAlcohol ?? "")} onChange={e => sf("potentialAlcohol", e.target.value)} /></div>
            </div>
            <SectionLabel>Condition & allocation</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Grape Condition</Label>
                <Select value={String(form.grapeCondition ?? "")} onValueChange={v => sf("grapeCondition", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{GRAPE_CONDITION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Botrytis %</Label><Input type="number" min="0" max="100" value={String(form.botrytisPct ?? "")} onChange={e => sf("botrytisPct", e.target.value)} /></div>
              <div><Label>MOG % (material other than grapes)</Label><Input type="number" step="0.1" min="0" max="100" value={String(form.mogPct ?? "")} onChange={e => sf("mogPct", e.target.value)} /></div>
              <div><Label>Holding Bin / Tank allocated</Label><Input value={String(form.holdingBin ?? "")} onChange={e => sf("holdingBin", e.target.value)} placeholder="e.g. Bin 3, T2" /></div>
              <div><Label>Receiving Inspector</Label><Input value={String(form.inspectorName ?? "")} onChange={e => sf("inspectorName", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox id="accepted-chk" checked={form.accepted !== "false" && form.accepted !== false} onCheckedChange={v => sf("accepted", v ? "true" : "false")} />
              <Label htmlFor="accepted-chk" className="cursor-pointer">Grapes accepted at intake</Label>
            </div>
            {(form.accepted === "false" || form.accepted === false) && (
              <div><Label>Rejection Reason</Label><Textarea value={String(form.rejectionReason ?? "")} onChange={e => sf("rejectionReason", e.target.value)} rows={2} /></div>
            )}
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.receptionDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Grape Intake — {fmtDate(view.reception_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Reception Date" value={fmtDate(view.reception_date)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Block" value={fmt(blocks.find(b => b.id === view.block_id)?.blockName ?? view.block_id)} />
              <ViewField label="Variety" value={fmt(view.variety)} />
              <ViewField label="Source" value={fmt(view.source_type)} />
              <ViewField label="Grower" value={fmt(view.grower_name)} />
              <ViewField label="Vehicle Reg" value={fmt(view.vehicle_reg)} />
              <ViewField label="Driver" value={fmt(view.driver_name)} />
              <ViewField label="Gross Weight" value={view.gross_weight_kg ? `${fmtNum(view.gross_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Tare Weight" value={view.tare_weight_kg ? `${fmtNum(view.tare_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Net Weight" value={view.net_weight_kg ? `${fmtNum(view.net_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Intake Temp" value={view.intake_temperature_c ? `${fmtNum(view.intake_temperature_c, 1)} °C` : "—"} />
              <ViewField label="Brix °" value={fmtNum(view.brix, 1)} />
              <ViewField label="pH" value={fmtNum(view.ph, 2)} />
              <ViewField label="TA (g/L)" value={fmtNum(view.titratable_acidity_gl, 1)} />
              <ViewField label="Potential Alcohol %" value={fmtNum(view.potential_alcohol, 1)} />
              <ViewField label="Grape Condition" value={fmt(view.grape_condition)} />
              <ViewField label="Botrytis %" value={fmt(view.botrytis_pct)} />
              <ViewField label="MOG %" value={fmtNum(view.mog_pct, 1)} />
              <ViewField label="Holding Bin" value={fmt(view.holding_bin)} />
              <ViewField label="Inspector" value={fmt(view.inspector_name)} />
              <ViewField label="Status" value={view.accepted === false || view.accepted === "false" ? <span className="text-red-700">Rejected — {String(view.rejection_reason ?? "")}</span> : <span className="text-green-700">Accepted</span>} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-reception" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Intake Record</DialogTitle><DialogDescription>Remove the intake record for {fmtDate(deleting?.reception_date)}? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={importOpen} onOpenChange={o => { if (!o) { setImportOpen(false); resetHarvestImportDialog(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Harvest Reception Records from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk-create intake records. Rows missing required fields (Reception Date, Vintage Year) or with an invalid date format will be reported and skipped. Other rows will be imported.
            </DialogDescription>
          </DialogHeader>

          {!importResult && (
            <div className="space-y-4">
              <div className="rounded-md border border-dashed p-4 bg-muted/30 text-xs text-muted-foreground space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">Expected CSV columns (header row required):</p>
                  <button
                    type="button"
                    onClick={downloadHarvestTemplate}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <FileDown className="w-3 h-3" />Download template
                  </button>
                </div>
                <p className="font-mono">{HARVEST_IMPORT_HEADERS.join(", ")}</p>
                <p className="mt-1">The template includes an example row showing the expected formats — delete it before importing real data.</p>
              </div>
              <div>
                <Label>Select CSV file</Label>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleHarvestImportFile}
                  className="mt-1 block w-full text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
              {importError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
              {importParsed.length > 0 && !importError && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  <p className="font-medium">{importParsed.length} row{importParsed.length !== 1 ? "s" : ""} parsed from file.</p>
                  <div className="mt-2 max-h-32 overflow-y-auto rounded border border-blue-200 bg-white">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-blue-50 border-b border-blue-200">
                        <th className="p-1.5 text-left">Reception Date</th>
                        <th className="p-1.5 text-left">Vintage</th>
                        <th className="p-1.5 text-left">Variety</th>
                        <th className="p-1.5 text-left">Net Weight (kg)</th>
                        <th className="p-1.5 text-left">Accepted</th>
                      </tr></thead>
                      <tbody>
                        {importParsed.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b border-blue-100">
                            <td className="p-1.5">{row["Reception Date"] || "—"}</td>
                            <td className="p-1.5">{row["Vintage Year"] || "—"}</td>
                            <td className="p-1.5">{row["Variety"] || "—"}</td>
                            <td className="p-1.5">{row["Net Weight (kg)"] || "—"}</td>
                            <td className="p-1.5">{row["Accepted (Yes/No)"] || "—"}</td>
                          </tr>
                        ))}
                        {importParsed.length > 10 && (
                          <tr><td colSpan={5} className="p-1.5 text-center text-muted-foreground">… and {importParsed.length - 10} more rows</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className="space-y-3">
              <div className={`rounded-md p-3 border flex items-start gap-2 ${importResult.insertedCount > 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                {importResult.insertedCount > 0 ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">
                    {importResult.insertedCount} record{importResult.insertedCount !== 1 ? "s" : ""} imported successfully.
                    {importResult.rejectedCount > 0 && ` ${importResult.rejectedCount} row${importResult.rejectedCount !== 1 ? "s" : ""} skipped — see details below.`}
                  </p>
                </div>
              </div>
              {importResult.rejected.length > 0 && (
                <div className="rounded-md border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skipped rows</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        const skippedRows = importResult.rejected
                          .map(r => importParsed[r.row - 1])
                          .filter(Boolean);
                        const header = HARVEST_IMPORT_HEADERS.map(h => `"${h}"`).join(",");
                        const body = skippedRows.map(row =>
                          HARVEST_IMPORT_HEADERS.map(h => `"${resolveHarvestField(row, h).replace(/"/g, '""')}"`).join(",")
                        ).join("\n");
                        const blob = new Blob([header + "\n" + body + "\n"], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "harvest-reception-skipped-rows.csv";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FileDown className="w-3 h-3 mr-1" />Download skipped rows as CSV
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.rejected.map((r, i) => (
                      <div key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{r.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); resetHarvestImportDialog(); }}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button
                onClick={submitHarvestImport}
                disabled={importParsed.length === 0 || importLoading || !!importError}
              >
                {importLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Import {importParsed.length > 0 ? `${importParsed.length} Row${importParsed.length !== 1 ? "s" : ""}` : ""}
              </Button>
            )}
            {importResult && (
              <Button variant="outline" onClick={resetHarvestImportDialog}>Import Another File</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery Batch Settings hook ───────────────────────────────────────────────
function useWineryBatchSettings(farmId: number) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery<{ settings: Record<string, unknown>; nextRef: string }>({
    queryKey: ["winery-batch-settings", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-batch-settings`), { credentials: "include" });
      return r.json();
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });
  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch(api(`farms/${farmId}/winery-batch-settings`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); }
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["winery-batch-settings", farmId] }),
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  return { data: q.data, isLoading: q.isLoading, save };
}

// ─── Batch Trail Quick Search ─────────────────────────────────────────────────
/**
 * A standalone "Find batch" bar that can be placed in any winery-tab header.
 * Typing or pasting a batch ref and pressing Enter (or clicking the button)
 * opens BatchTrailDialog directly — no need to locate the pressing record row.
 * A typeahead dropdown lists matching batch refs from pressing + fermentation data.
 */
export function BatchTrailQuickSearch({ farmId }: { farmId: number }) {
  const [value, setValue] = useState("");
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: farmsData } = useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmName: string =
    (Array.isArray(farmsData?.farms)
      ? (farmsData.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)
          ?.name as string | undefined
      : undefined) ?? `Farm ${farmId}`;

  // Reuse cached pressing data already fetched by the pressing tab
  const { data: pressingData } = usePressing(farmId);

  // Reuse cached fermentation data (same queryKey used by the fermentation tab)
  const { data: fermentationData } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-fermentation", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-fermentation`), { credentials: "include" });
      const d = await r.json();
      return (d.records ?? []) as Record<string, unknown>[];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });

  // Build sorted, deduplicated list of all known batch refs carrying their vintage year.
  // Pressing is the authoritative source for vintage year; fermentation fills in any gaps.
  // Sorted by most recent activity date (pressing_date / fermentation_start_date) so
  // commonly-used batches surface first.
  const allBatchRefs = useMemo(() => {
    const map = new Map<string, { vintageYear: string | null; latestDate: string | null }>();
    // Helper: keep the more-recent of two ISO date strings (or nulls)
    const laterDate = (a: string | null, b: string | null): string | null => {
      if (!a) return b;
      if (!b) return a;
      return a >= b ? a : b;
    };
    // Pressing — preferred source for vintage year; use press_date as activity date
    for (const r of pressingData ?? []) {
      if (r.batch_ref) {
        const ref = String(r.batch_ref);
        const date = r.press_date != null ? String(r.press_date).slice(0, 10) : null;
        const existing = map.get(ref);
        if (existing) {
          existing.latestDate = laterDate(existing.latestDate, date);
        } else {
          map.set(ref, {
            vintageYear: r.vintage_year != null ? String(r.vintage_year) : null,
            latestDate: date,
          });
        }
      }
    }
    // Fermentation — use start_date as activity date
    for (const r of fermentationData ?? []) {
      if (r.batch_ref) {
        const ref = String(r.batch_ref);
        const date = r.start_date != null ? String(r.start_date).slice(0, 10) : null;
        const existing = map.get(ref);
        if (existing) {
          existing.latestDate = laterDate(existing.latestDate, date);
        } else {
          map.set(ref, {
            vintageYear: r.vintage_year != null ? String(r.vintage_year) : null,
            latestDate: date,
          });
        }
      }
    }
    return Array.from(map.entries())
      .map(([ref, { vintageYear, latestDate }]) => ({ ref, vintageYear, latestDate }))
      // Most recent first; fall back to alphabetical when dates are equal or both null
      .sort((a, b) => {
        if (a.latestDate && b.latestDate) return b.latestDate.localeCompare(a.latestDate);
        if (a.latestDate) return -1;
        if (b.latestDate) return 1;
        return a.ref.localeCompare(b.ref);
      });
  }, [pressingData, fermentationData]);

  // Case-insensitive partial-match suggestions, capped at 10
  const suggestions = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return [] as { ref: string; vintageYear: string | null; latestDate: string | null }[];
    const lower = trimmed.toLowerCase();
    return allBatchRefs.filter(s => s.ref.toLowerCase().includes(lower)).slice(0, 10);
  }, [allBatchRefs, value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlight whenever the suggestion list changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const openTrail = (ref?: string) => {
    const trimmed = (ref ?? value).trim();
    if (!trimmed) return;
    setValue(trimmed);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
    setActiveRef(trimmed);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={containerRef}>
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8 h-8 w-56 text-sm"
          placeholder="Find batch by ref…"
          value={value}
          role="combobox"
          aria-label="Batch reference search"
          aria-autocomplete="list"
          aria-expanded={dropdownOpen && suggestions.length > 0}
          aria-controls="batch-ref-listbox"
          aria-activedescendant={dropdownOpen && highlightedIndex >= 0 ? `batch-ref-option-${highlightedIndex}` : undefined}
          onChange={e => { setValue(e.target.value); setDropdownOpen(true); }}
          onFocus={() => { if (value.trim()) setDropdownOpen(true); }}
          onKeyDown={e => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!dropdownOpen && suggestions.length > 0) setDropdownOpen(true);
              setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex(i => Math.max(i - 1, -1));
            } else if (e.key === "Enter") {
              // Prevent the native Enter keystroke from leaking into the newly
              // mounted batch trail dialog (auto-focused close button), which
              // would immediately dismiss it.
              e.preventDefault();
              if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                openTrail(suggestions[highlightedIndex].ref);
              } else {
                openTrail();
              }
            } else if (e.key === "Escape") {
              setDropdownOpen(false);
              setHighlightedIndex(-1);
            }
          }}
        />
        {dropdownOpen && suggestions.length > 0 && (
          <div
            ref={listRef}
            id="batch-ref-listbox"
            role="listbox"
            aria-label="Batch reference suggestions"
            className="absolute z-50 mt-1 w-full min-w-max rounded-md border bg-popover shadow-md overflow-y-auto max-h-60"
          >
            {suggestions.map((s, idx) => (
              <button
                key={s.ref}
                id={`batch-ref-option-${idx}`}
                role="option"
                aria-selected={idx === highlightedIndex}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2${idx === highlightedIndex ? " bg-accent text-accent-foreground" : ""}`}
                // onMouseDown prevents input blur before click registers
                onMouseDown={e => { e.preventDefault(); openTrail(s.ref); }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <span>{s.ref}</span>
                {s.vintageYear && (
                  <span className="text-xs text-muted-foreground">· {s.vintageYear}</span>
                )}
                {s.latestDate && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    · last used {new Date(s.latestDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <Button variant="outline" size="sm" className="h-8" onClick={() => openTrail()} disabled={!value.trim()}>
        <GitBranch className="h-3.5 w-3.5 mr-1" />
        Open trail
      </Button>
      {activeRef && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={{ batch_ref: activeRef, vintage_year: null }}
          farmName={farmName}
          onClose={() => { setActiveRef(null); setValue(""); }}
        />
      )}
    </div>
  );
}

// ─── Vintage pH & TA Comparison Chart ────────────────────────────────────────
function VintagePHComparisonChart({
  data,
  vintageYear,
  highlightedBatch,
  onBatchClick,
}: {
  data: BatchTrailData;
  vintageYear: string | null;
  highlightedBatch: string | null;
  onBatchClick: (ref: string) => void;
}) {
  const [colourFilter, setColourFilter] = useState<string>("all");

  // Collect per-batch pH/TA: bottling (primary) → fermentation end (fallback)
  // Brix: fermentation start_brix (juice sugar at fermentation start)
  const batchMap = new Map<string, { ph: number | null; ta: number | null; brix: number | null; colour: string | null }>();

  // Per-batch wine colour lookup (fermentation first, then bottling)
  const colourOf = (ref: string): string | null => {
    for (const src of [data.fermentation, data.bottling]) {
      for (const r of src) {
        if (r.batch_ref && String(r.batch_ref).trim() === ref && r.wine_colour) return String(r.wine_colour);
      }
    }
    return null;
  };

  const sortedBottling = [...data.bottling].sort((a, b) =>
    a.bottling_date && b.bottling_date
      ? new Date(String(b.bottling_date)).getTime() - new Date(String(a.bottling_date)).getTime()
      : 0
  );
  for (const r of sortedBottling) {
    const ref = r.batch_ref ? String(r.batch_ref).trim() : null;
    if (!ref) continue;
    if (!batchMap.has(ref)) batchMap.set(ref, { ph: null, ta: null, brix: null, colour: colourOf(ref) });
    const entry = batchMap.get(ref)!;
    if (entry.ph == null && r.ph != null) entry.ph = parseFloat(String(r.ph));
    if (entry.ta == null && r.titratable_acidity_gl != null) entry.ta = parseFloat(String(r.titratable_acidity_gl));
  }

  const sortedFerm = [...data.fermentation].sort((a, b) =>
    a.end_date && b.end_date
      ? new Date(String(b.end_date)).getTime() - new Date(String(a.end_date)).getTime()
      : 0
  );
  for (const r of sortedFerm) {
    const ref = r.batch_ref ? String(r.batch_ref).trim() : null;
    if (!ref) continue;
    if (!batchMap.has(ref)) batchMap.set(ref, { ph: null, ta: null, brix: null, colour: colourOf(ref) });
    const entry = batchMap.get(ref)!;
    if (entry.ph == null && r.end_ph != null) entry.ph = parseFloat(String(r.end_ph));
    if (entry.ta == null && r.end_ta_gl != null) entry.ta = parseFloat(String(r.end_ta_gl));
    if (entry.brix == null && r.start_brix != null && r.start_brix !== "") entry.brix = parseFloat(String(r.start_brix));
  }

  const allChartData = Array.from(batchMap.entries())
    .filter(([, v]) => v.ph != null || v.ta != null || v.brix != null)
    .map(([ref, v]) => ({ ref, label: ref, ph: v.ph, ta: v.ta, brix: v.brix, colour: v.colour }))
    .sort((a, b) => a.ref.localeCompare(b.ref));

  const availableColours = Array.from(new Set(allChartData.map(d => d.colour).filter((c): c is string => !!c))).sort();
  const unspecifiedCount = allChartData.filter(d => !d.colour).length;
  const hasUnspecified = unspecifiedCount > 0;
  // Show the filter when there is more than one distinct group to filter between
  // (recorded colours plus, when present, the "Unspecified" group).
  const showColourFilter = availableColours.length + (hasUnspecified ? 1 : 0) > 1;
  const chartData = showColourFilter && colourFilter !== "all"
    ? colourFilter === "__unspecified__"
      ? allChartData.filter(d => !d.colour)
      : allChartData.filter(d => d.colour === colourFilter)
    : allChartData;

  if (allChartData.length < 2) return null;

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5" />
          Vintage {vintageYear} — pH, TA &amp; Brix Comparison
        </span>
        <span className="text-xs text-muted-foreground">
          {chartData.length} batch{chartData.length !== 1 ? "es" : ""} · click a bar to highlight
        </span>
      </div>
      {showColourFilter && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Wine colour:</span>
          <Select value={colourFilter} onValueChange={setColourFilter}>
            <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All colours</SelectItem>
              {availableColours.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              {hasUnspecified && <SelectItem value="__unspecified__">Unspecified</SelectItem>}
            </SelectContent>
          </Select>
          {hasUnspecified && (
            <span className="text-xs text-amber-700">
              {unspecifiedCount} batch{unspecifiedCount !== 1 ? "es" : ""} without a recorded wine colour
            </span>
          )}
        </div>
      )}
      {chartData.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">No batches with pH/TA/Brix data for the selected wine colour.</p>
      )}
      {chartData.length > 0 && (
      <div className="bg-white/70 rounded p-2">
        <ResponsiveContainer width="100%" height={170}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 42, left: 0, bottom: 0 }}
            onClick={(payload) => {
              const ref = payload?.activePayload?.[0]?.payload?.ref as string | undefined;
              if (ref) onBatchClick(ref);
            }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              interval={0}
              height={28}
            />
            <YAxis
              yAxisId="ph"
              orientation="left"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toFixed(2)}
              domain={["auto", "auto"]}
              width={40}
              label={{ value: "pH", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#6366f1" } }}
            />
            <YAxis
              yAxisId="ta"
              orientation="right"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toFixed(1)}
              domain={["auto", "auto"]}
              width={42}
              label={{ value: "TA g/L", angle: 90, position: "insideRight", style: { fontSize: 9, fill: "#0ea5e9" } }}
            />
            <YAxis
              yAxisId="brix"
              orientation="right"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toFixed(1)}
              domain={["auto", "auto"]}
              width={42}
              label={{ value: "Brix °", angle: 90, position: "insideRight", style: { fontSize: 9, fill: "#d97706" } }}
            />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(value: number, name: string) =>
                name === "pH" ? [value.toFixed(2), "pH"]
                : name === "Brix °" ? [value.toFixed(1) + " °Bx", "Brix"]
                : [value.toFixed(1) + " g/L", "TA"]
              }
              labelFormatter={(label: string) => `Batch: ${label}`}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar
              yAxisId="ph"
              dataKey="ph"
              name="pH"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              fill="#6366f1"
            >
              {chartData.map((entry) => (
                <rect
                  key={entry.ref}
                  fill={entry.ref === highlightedBatch ? "#4338ca" : "#6366f1"}
                  opacity={highlightedBatch && entry.ref !== highlightedBatch ? 0.5 : 1}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="ta"
              dataKey="ta"
              name="TA (g/L)"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              fill="#0ea5e9"
            >
              {chartData.map((entry) => (
                <rect
                  key={entry.ref}
                  fill={entry.ref === highlightedBatch ? "#0369a1" : "#0ea5e9"}
                  opacity={highlightedBatch && entry.ref !== highlightedBatch ? 0.5 : 1}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="brix"
              dataKey="brix"
              name="Brix °"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              fill="#f59e0b"
            >
              {chartData.map((entry) => (
                <rect
                  key={entry.ref}
                  fill={entry.ref === highlightedBatch ? "#b45309" : "#f59e0b"}
                  opacity={highlightedBatch && entry.ref !== highlightedBatch ? 0.5 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
      {highlightedBatch ? (
        <p className="text-xs text-indigo-700">
          Showing: <span className="font-mono font-semibold">{highlightedBatch}</span> — matching records are highlighted below.{" "}
          <button
            className="underline text-indigo-500 hover:text-indigo-700"
            onClick={() => onBatchClick(highlightedBatch)}
          >
            Clear
          </button>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          pH and TA at bottling (or latest available stage per batch); Brix at fermentation start. Click a batch bar to scroll to its records.
        </p>
      )}
    </div>
  );
}

// ─── Batch Trail Dialog ───────────────────────────────────────────────────────
interface BatchTrailData {
  batchRef: string | null;
  vintageYear: number | null;
  scope: "batchRef" | "vintageYear";
  fermentation: Record<string, unknown>[];
  cellarOps: Record<string, unknown>[];
  so2Tests: Record<string, unknown>[];
  bottling: Record<string, unknown>[];
  pressAdditions: Record<string, unknown>[];
  /** Vintage scope only — all pressing sessions for the vintage (id, press_date, batch_ref, notes), independent of additions */
  pressings?: Record<string, unknown>[];
}

function TrailSection({ icon: Icon, title, count, children }: { icon: React.ElementType; title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-sm">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
      </div>
      {children}
    </div>
  );
}

// ─── SO₂ Summary helpers ──────────────────────────────────────────────────────
interface So2Summary {
  pressSo2MgKg: number;
  pressSo2MgL: number;
  hasPressingSo2: boolean;
  fermSo2Total: number;
  hasFermSo2: boolean;
  cellarSo2TotalG: number;
  cellarSo2MgL: number | null;
  cellarVolumeSource: "vessel" | "volume_moved" | "mixed" | null;
  hasCellarSo2: boolean;
  latestTestTotal: number | null;
  latestTestDate: string | null;
  wineColour: string | null;
  isOrganic: boolean;
  conventionalLimit: number;
  organicLimit: number;
  activeLimit: number;
  runningEstimate: number;
  hasAny: boolean;
}

function computeSo2Summary(pressing: Record<string, unknown>, data: BatchTrailData): So2Summary {
  // 1. Press SO₂ additions
  const pressSo2Items = data.pressAdditions.filter(a => String(a.category) === "so2");
  const pressSo2MgKg = pressSo2Items.filter(a => String(a.unit) === "mg/kg").reduce((s, a) => s + parseFloat(String(a.dose ?? 0)), 0);
  const pressSo2MgL  = pressSo2Items.filter(a => String(a.unit) === "mg/L").reduce((s, a) => s + parseFloat(String(a.dose ?? 0)), 0);
  const hasPressingSo2 = pressSo2Items.length > 0;

  // 2. Fermentation SO₂ (sum across all linked fermentation records)
  const fermVals = data.fermentation.filter(r => r.so2_at_fermentation_mg_l != null).map(r => parseFloat(String(r.so2_at_fermentation_mg_l)));
  const fermSo2Total = fermVals.reduce((s, v) => s + v, 0);
  const hasFermSo2 = fermVals.length > 0;

  // 3. Cellar sulfiting ops
  const sulfitingOps = data.cellarOps.filter(r => String(r.op_type) === "sulfiting" && r.so2_quantity_g != null);
  // sumCellarSo2: per-operation dose rates are summed independently (not aggregate grams / aggregate vol)
  // Volume priority: vessel capacity_litres → volume_moved_litres (fallback)
  const { totalG: cellarSo2TotalG, cumulativeMgL: cellarSo2MgL, volumeSource: cellarVolumeSource } = sumCellarSo2(sulfitingOps);
  const hasCellarSo2 = sulfitingOps.length > 0;

  // 4. Latest SO₂ test total (most recent by date)
  const testsWithTotal = [...data.so2Tests].filter(r => r.total_so2_mg_l != null).sort((a, b) =>
    new Date(String(b.test_date)).getTime() - new Date(String(a.test_date)).getTime()
  );
  const latestTest = testsWithTotal[0] ?? null;
  const latestTestTotal = latestTest ? parseFloat(String(latestTest.total_so2_mg_l)) : null;
  const latestTestDate = latestTest ? String(latestTest.test_date) : null;

  // 5. Wine colour: fermentation → bottling → pressing record
  const wineColour = (
    (data.fermentation.find(r => r.wine_colour) as Record<string, unknown> | undefined)?.wine_colour ??
    (data.bottling.find(r => r.wine_colour) as Record<string, unknown> | undefined)?.wine_colour ??
    pressing.wine_colour ??
    null
  );
  const colourStr = wineColour ? String(wineColour) : "White";

  // 6. Organic flag
  const isOrganic = pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1;

  // 7. Limits
  const conventionalLimit = parseInt(CONVENTIONAL_MAX_SO2[colourStr] ?? "200", 10);
  const organicLimit = parseInt(ORGANIC_MAX_SO2[colourStr] ?? "150", 10);
  const activeLimit = isOrganic ? organicLimit : conventionalLimit;

  // 8. Running estimate: press (mg/kg ≈ mg/L, density ≈ 1) + ferm + cellar estimate
  const pressEquiv = pressSo2MgKg + pressSo2MgL;
  const runningEstimate = pressEquiv + fermSo2Total + (cellarSo2MgL ?? 0);

  return {
    pressSo2MgKg, pressSo2MgL, hasPressingSo2,
    fermSo2Total, hasFermSo2,
    cellarSo2TotalG, cellarSo2MgL, cellarVolumeSource, hasCellarSo2,
    latestTestTotal, latestTestDate,
    wineColour: wineColour ? String(wineColour) : null,
    isOrganic, conventionalLimit, organicLimit, activeLimit,
    runningEstimate,
    hasAny: hasPressingSo2 || hasFermSo2 || hasCellarSo2 || latestTest !== null,
  };
}

function So2SummaryBlock({ summary }: { summary: So2Summary }) {
  if (!summary.hasAny) return null;

  // Compliance indicator against the most authoritative figure (test total > running estimate)
  const complianceValue = summary.latestTestTotal ?? summary.runningEstimate;
  const pct = summary.activeLimit > 0 ? (complianceValue / summary.activeLimit) * 100 : 0;
  const indicatorColor = complianceValue > summary.activeLimit
    ? "bg-red-50 border-red-200"
    : pct >= 75
    ? "bg-amber-50 border-amber-200"
    : "bg-green-50 border-green-200";
  const badgeColor = complianceValue > summary.activeLimit
    ? "bg-red-100 text-red-800"
    : pct >= 75
    ? "bg-amber-100 text-amber-800"
    : "bg-green-100 text-green-800";
  const statusText = complianceValue > summary.activeLimit
    ? "Exceeds limit"
    : pct >= 75
    ? "Approaching limit"
    : "Within limit";
  const StatusIcon = complianceValue > summary.activeLimit ? XCircle : pct >= 75 ? AlertTriangle : CheckCircle2;

  return (
    <div className={`rounded-lg border px-4 py-3 space-y-2 ${indicatorColor}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5" />SO₂ Compliance Summary
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${badgeColor}`}>
          <StatusIcon className="w-3 h-3" />{statusText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Press SO₂ */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">At pressing</p>
          {summary.hasPressingSo2 ? (
            <p className="font-mono font-semibold text-sm">
              {summary.pressSo2MgKg > 0 && `${summary.pressSo2MgKg.toFixed(1)} mg/kg`}
              {summary.pressSo2MgKg > 0 && summary.pressSo2MgL > 0 && " + "}
              {summary.pressSo2MgL > 0 && `${summary.pressSo2MgL.toFixed(1)} mg/L`}
            </p>
          ) : <p className="text-muted-foreground">—</p>}
        </div>

        {/* Fermentation SO₂ */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">At fermentation</p>
          {summary.hasFermSo2
            ? <p className="font-mono font-semibold text-sm">{summary.fermSo2Total.toFixed(1)} mg/L</p>
            : <p className="text-muted-foreground">—</p>}
        </div>

        {/* Cellar sulfiting */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">Cellar sulfiting</p>
          {summary.hasCellarSo2 ? (
            <div>
              <p className="font-mono font-semibold text-sm">{summary.cellarSo2TotalG.toFixed(1)} g total</p>
              {summary.cellarSo2MgL != null && (
                <p className="text-muted-foreground text-xs">≈ {summary.cellarSo2MgL.toFixed(1)} mg/L</p>
              )}
            </div>
          ) : <p className="text-muted-foreground">—</p>}
        </div>

        {/* SO₂ test total */}
        <div className="bg-white/60 rounded p-2 space-y-0.5">
          <p className="text-muted-foreground font-medium">
            {summary.latestTestTotal != null ? "Latest test total" : "Additions estimate"}
          </p>
          <p className="font-mono font-semibold text-sm">
            {summary.latestTestTotal != null
              ? `${summary.latestTestTotal.toFixed(1)} mg/L`
              : `~${summary.runningEstimate.toFixed(1)} mg/L`}
          </p>
          {summary.latestTestDate && (
            <p className="text-muted-foreground text-xs">{fmtDate(summary.latestTestDate)}</p>
          )}
        </div>
      </div>

      {/* Ceiling cards — mirror the PDF's side-by-side organic/conventional rows:
          both ceilings are always shown, with the active one highlighted/labelled. */}
      <div className="flex gap-2">
        <div className={`flex-1 rounded px-2.5 py-1.5 ${summary.isOrganic ? "border-2 border-green-700 bg-white/80" : "border bg-white/40"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Organic ceiling {summary.isOrganic && <span className="text-green-800">· Active limit</span>}
          </p>
          <p className={`font-mono font-bold text-sm ${summary.isOrganic ? "text-green-800" : "text-foreground"}`}>{summary.organicLimit} mg/L</p>
        </div>
        <div className={`flex-1 rounded px-2.5 py-1.5 ${!summary.isOrganic ? "border-2 border-green-700 bg-white/80" : "border bg-white/40"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Conventional ceiling {!summary.isOrganic && <span className="text-green-800">· Active limit</span>}
          </p>
          <p className={`font-mono font-bold text-sm ${!summary.isOrganic ? "text-green-800" : "text-foreground"}`}>{summary.conventionalLimit} mg/L</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {summary.isOrganic
          ? `Organic batch — organic ceiling applies. Conventional ceiling shown for comparison (${(summary.conventionalLimit - summary.organicLimit).toFixed(0)} mg/L higher).`
          : `Conventional batch — conventional ceiling applies. Organic ceiling shown for comparison (${(summary.conventionalLimit - summary.organicLimit).toFixed(0)} mg/L lower).`}
      </p>

      {/* Limit bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {summary.wineColour ? `${summary.wineColour} wine · ` : ""}
            {summary.isOrganic ? "Organic" : "Conventional"} limit: {summary.activeLimit} mg/L
          </span>
          <span className="font-mono">{Math.min(pct, 150).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${complianceValue > summary.activeLimit ? "bg-red-500" : pct >= 75 ? "bg-amber-400" : "bg-green-500"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {summary.latestTestTotal == null && (summary.hasPressingSo2 || summary.hasFermSo2 || summary.hasCellarSo2) && (
          <p className="text-xs text-muted-foreground italic">
            * Estimate from addition records. Run an SO₂ test to confirm the true total.
            {summary.cellarSo2MgL != null && summary.cellarVolumeSource === "vessel" && " Cellar mg/L uses vessel capacity."}
            {summary.cellarSo2MgL != null && summary.cellarVolumeSource === "volume_moved" && " Cellar mg/L uses volume moved (no vessel capacity recorded)."}
            {summary.cellarSo2MgL != null && summary.cellarVolumeSource === "mixed" && " Cellar mg/L uses vessel capacity where available, volume moved otherwise."}
          </p>
        )}
      </div>
    </div>
  );
}

function BatchTrailDialog({ farmId, pressing, farmName, onClose }: { farmId: number; pressing: Record<string, unknown>; farmName: string; onClose: () => void }) {
  const batchRef = pressing.batch_ref != null && String(pressing.batch_ref).trim() !== "" ? String(pressing.batch_ref).trim() : null;
  const vintageYear = pressing.vintage_year != null ? String(pressing.vintage_year) : null;
  const hasQuery = !!(batchRef || vintageYear);

  const queryUrl = batchRef
    ? api(`farms/${farmId}/winery-pressing/batch-trail?batchRef=${encodeURIComponent(batchRef)}`)
    : api(`farms/${farmId}/winery-pressing/batch-trail?vintageYear=${encodeURIComponent(vintageYear ?? "")}`);

  const { data, isLoading, isError } = useQuery<BatchTrailData>({
    queryKey: ["winery-batch-trail", farmId, batchRef ?? `vintage:${vintageYear}`],
    queryFn: async () => {
      const r = await fetch(queryUrl, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load batch trail");
      return r.json();
    },
    enabled: hasQuery,
    staleTime: 30_000,
  });

  // ── Signature state ──────────────────────────────────────────────────────────
  const [sigOpen, setSigOpen] = useState(false);
  const [localSignature, setLocalSignature] = useState<string | null>(null);
  const [localSignedAt, setLocalSignedAt] = useState<string | null>(null);
  const [localSignerName, setLocalSignerName] = useState<string | null>(null);
  const [localSignerRole, setLocalSignerRole] = useState<string | null>(null);
  const [localSignerDate, setLocalSignerDate] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState("");
  const [signerDate, setSignerDate] = useState(today);
  const sigRef = useRef<SignatureCanvas | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const currentSig = localSignature ?? (pressing.audit_signature ? String(pressing.audit_signature) : null);
  const currentSignedAt = localSignedAt ?? (pressing.audit_signed_at ? String(pressing.audit_signed_at) : null);
  const currentSignerName = localSignerName ?? (pressing.audit_signer_name ? String(pressing.audit_signer_name) : null);
  const currentSignerRole = localSignerRole ?? (pressing.audit_signer_role ? String(pressing.audit_signer_role) : null);
  const currentSignerDate = localSignerDate ?? (pressing.audit_signer_date ? String(pressing.audit_signer_date) : null);

  const openSignDialog = () => {
    setSignerName(currentSignerName ?? "");
    setSignerRole(currentSignerRole ?? "");
    setSignerDate(currentSignerDate ?? today);
    setSigOpen(true);
  };

  const signOffMutation = useMutation({
    mutationFn: async ({ signatureDataUrl, name, role, date }: { signatureDataUrl: string; name: string; role: string; date: string }) => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/${pressing.id}/sign-off`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ auditSignature: signatureDataUrl, auditSignerName: name || null, auditSignerRole: role || null, auditSignerDate: date || null }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Sign-off failed"); }
      return r.json();
    },
    onSuccess: (result) => {
      setLocalSignature(result.record.audit_signature);
      setLocalSignedAt(result.record.audit_signed_at);
      setLocalSignerName(result.record.audit_signer_name ?? null);
      setLocalSignerRole(result.record.audit_signer_role ?? null);
      setLocalSignerDate(result.record.audit_signer_date ?? null);
      qc.invalidateQueries({ queryKey: ["winery-pressing", farmId] });
      setSigOpen(false);
      toast({ title: "Batch trail signed off", description: "Signature saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Sign-off failed", description: err.message, variant: "destructive" });
    },
  });

  const handleConfirmSignature = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast({ title: "No signature", description: "Please draw your signature before confirming.", variant: "destructive" });
      return;
    }
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    signOffMutation.mutate({ signatureDataUrl: dataUrl, name: signerName, role: signerRole, date: signerDate });
  };

  // ── Vintage comparison chart state ──────────────────────────────────────────
  const [highlightedBatch, setHighlightedBatch] = useState<string | null>(null);
  const batchRowRefs = useRef<Map<string, HTMLElement>>(new Map());

  const handleBatchHighlight = (ref: string) => {
    setHighlightedBatch(prev => {
      const next = prev === ref ? null : ref;
      if (next) {
        // Scroll to the first row with this batch_ref after state update
        setTimeout(() => {
          const el = batchRowRefs.current.get(next);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 50);
      }
      return next;
    });
  };

  const totalLinked = (data?.fermentation.length ?? 0) + (data?.cellarOps.length ?? 0) + (data?.so2Tests.length ?? 0) + (data?.bottling.length ?? 0);
  // Pre-derive likely scope so the title reads correctly even before the API responds.
  const expectedVintageScoped = !batchRef && !!vintageYear;
  const isVintageScoped = data ? data.scope === "vintageYear" : expectedVintageScoped;

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <GitBranch className="h-4 w-4 text-blue-600" />
            {isVintageScoped && vintageYear
              ? `Full Vintage Trail — Vintage ${vintageYear}`
              : `Batch Trail — ${batchRef ?? (vintageYear ? `Vintage ${vintageYear}` : "—")}`}
            {(pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1) && (
              <Badge className="text-xs bg-green-100 text-green-800 border-0 inline-flex items-center gap-0.5 font-normal"><Leaf className="w-3 h-3" />Organic</Badge>
            )}
            {currentSig ? (
              <Badge className="text-xs bg-green-100 text-green-800 border-0 inline-flex items-center gap-1 font-normal">
                <CheckCircle2 className="w-3 h-3" />
                {(() => {
                  let dateStr = "";
                  if (currentSignerDate) {
                    const m = currentSignerDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(currentSignerDate);
                    if (!isNaN(d.getTime())) dateStr = fmtDDMonYYYY(d);
                  } else if (currentSignedAt) {
                    const d = new Date(currentSignedAt);
                    if (!isNaN(d.getTime())) dateStr = fmtDDMonYYYY(d);
                  }
                  const parts = [currentSignerName, dateStr].filter(Boolean).join(", ");
                  return parts ? `Signed — ${parts}` : "Signed";
                })()}
              </Badge>
            ) : (
              <Badge className="text-xs bg-amber-100 text-amber-800 border-0 font-normal">Not yet signed</Badge>
            )}
          </DialogTitle>
          {isVintageScoped ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 mt-1">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>This pressing record has no batch reference. Results show all winery records for Vintage {vintageYear} — they may span multiple batches.</span>
            </div>
          ) : (
            <DialogDescription>
              {`All records linked to this pressing batch${pressing.vintage_year ? ` (Vintage ${String(pressing.vintage_year)})` : ""}. Press date: ${fmtDate(pressing.press_date)}.`}
            </DialogDescription>
          )}
        </DialogHeader>

        {!hasQuery && <p className="text-sm text-muted-foreground py-4">No batch reference or vintage year available for this pressing record.</p>}
        {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
        {isError && <p className="text-sm text-red-600 py-4">Failed to load batch trail. Please try again.</p>}

        {isVintageScoped && data && (
          <VintagePHComparisonChart
            data={data}
            vintageYear={vintageYear}
            highlightedBatch={highlightedBatch}
            onBatchClick={handleBatchHighlight}
          />
        )}

        {data && (
          <div className="space-y-5 text-sm">

            {/* Pressing details + attachments + additives (grouped per pressing, mirroring the PDF) */}
            {(() => {
              const pressId = pressing.id != null && Number(pressing.id) > 0 ? Number(pressing.id) : null;
              const hasDetails = pressing.press_type || pressing.grapes_pressed_kg || pressing.press_wine_litres ||
                pressing.juice_brix || pressing.juice_ph || pressing.juice_ta_gl ||
                pressing.operator_name || pressing.settling_method || pressing.juice_turbidity;
              // Group additives by their pressing session — in vintage scope a
              // trail can span multiple pressings, so each pressing renders its
              // own indented sub-list with press date + batch ref.
              const additiveGroups: { key: string; pressDate: string; batchRef: string | null; additions: Record<string, unknown>[] }[] = [];
              {
                const groupIndex = new Map<string, number>();
                for (const a of data.pressAdditions) {
                  const key = a.pressing_record_id != null ? String(a.pressing_record_id) : "unknown";
                  let idx = groupIndex.get(key);
                  if (idx == null) {
                    idx = additiveGroups.length;
                    groupIndex.set(key, idx);
                    additiveGroups.push({
                      key,
                      pressDate: a.pressing_press_date ? fmtDate(a.pressing_press_date) : "—",
                      batchRef: a.pressing_batch_ref != null && String(a.pressing_batch_ref).trim() !== "" ? String(a.pressing_batch_ref).trim() : null,
                      additions: [],
                    });
                  }
                  additiveGroups[idx].additions.push(a);
                }
              }
              if (!hasDetails && !pressId && additiveGroups.length === 0 && !pressing.notes) return null;
              return (
                <div className="rounded-lg border bg-muted/20 px-4 py-3 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Wine className="h-3.5 w-3.5" />Pressing Record
                  </span>
                  {!!hasDetails && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                      {!!pressing.press_type && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Press Type</p>
                          <p className="font-medium">{String(pressing.press_type)}</p>
                        </div>
                      )}
                      {!!pressing.operator_name && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Operator</p>
                          <p className="font-medium">{String(pressing.operator_name)}</p>
                        </div>
                      )}
                      {!!pressing.settling_method && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Settling Method</p>
                          <p className="font-medium">{String(pressing.settling_method)}</p>
                        </div>
                      )}
                      {!!pressing.juice_turbidity && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Juice Turbidity</p>
                          <p className="font-medium">{String(pressing.juice_turbidity)}</p>
                        </div>
                      )}
                      {pressing.grapes_pressed_kg != null && pressing.grapes_pressed_kg !== "" && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Grapes Pressed</p>
                          <p className="font-medium font-mono">{fmtNum(pressing.grapes_pressed_kg, 0)} kg</p>
                        </div>
                      )}
                      {pressing.press_wine_litres != null && pressing.press_wine_litres !== "" && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Juice Yield</p>
                          <p className="font-medium font-mono">{fmtNum(pressing.press_wine_litres, 1)} L</p>
                        </div>
                      )}
                      {pressing.juice_brix != null && pressing.juice_brix !== "" && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Brix °</p>
                          <p className="font-medium font-mono">{fmtNum(pressing.juice_brix, 1)}</p>
                        </div>
                      )}
                      {pressing.juice_ph != null && pressing.juice_ph !== "" && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Juice pH</p>
                          <p className="font-medium font-mono">{fmtNum(pressing.juice_ph, 2)}</p>
                        </div>
                      )}
                      {pressing.juice_ta_gl != null && pressing.juice_ta_gl !== "" && (
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10px" }}>Juice TA (g/L)</p>
                          <p className="font-medium font-mono">{fmtNum(pressing.juice_ta_gl, 1)}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {pressId !== null && (
                    <div className={hasDetails ? "pt-2 border-t" : ""}>
                      <RecordAttachments farmId={farmId} recordType="winery-pressing" recordId={pressId} compact />
                    </div>
                  )}
                  {additiveGroups.length > 0 && (
                    <div className="pt-2 border-t space-y-2">
                      <p className="text-muted-foreground uppercase tracking-wide font-semibold" style={{ fontSize: "10px" }}>
                        Press Additives ({data.pressAdditions.length})
                      </p>
                      {additiveGroups.map(g => (
                        <div key={g.key} className="pl-4">
                          {isVintageScoped && (
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-1">
                              <span>Pressing — {g.pressDate}</span>
                              {g.batchRef ? (
                                <span className="font-mono text-blue-800 bg-blue-100 rounded px-1.5 py-0.5" style={{ fontSize: "10px" }}>{g.batchRef}</span>
                              ) : (
                                <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5" style={{ fontSize: "10px" }}>No ref</span>
                              )}
                              <span className="font-normal text-muted-foreground/70">({g.additions.length})</span>
                            </p>
                          )}
                          <div className="rounded border divide-y bg-background">
                            {g.additions.map((a, i) => (
                              <div key={i} className="px-3 py-2 space-y-0.5">
                                <div className="flex items-center gap-3 text-xs">
                                  <Beaker className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="font-medium">{fmt(a.additive_name)}</span>
                                  <span className="text-muted-foreground">{ADDITIVE_CATEGORY_LABELS[String(a.category)] ?? fmt(a.category)}</span>
                                  <span className="text-muted-foreground font-mono ml-auto">{a.dose != null ? `${fmtNum(a.dose, 2)} ${fmt(a.unit)}` : "—"}</span>
                                </div>
                                {!!a.notes && <p className="text-xs text-muted-foreground italic pl-6">{String(a.notes)}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!!pressing.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground uppercase tracking-wide font-semibold" style={{ fontSize: "10px" }}>Pressing Notes</p>
                      <p className="text-xs text-muted-foreground italic mt-1">{String(pressing.notes)}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* SO₂ cumulative summary */}
            <So2SummaryBlock summary={computeSo2Summary(pressing, data)} />

            {/* pH & TA analytical history — stage merge logic shared via lib/ph-ta-stages */}
            {(() => {
              const primary = computePrimaryPhTa(pressing, data.fermentation, data.bottling);
              const { ph: pressPh, ta: pressTa } = primary.pressing;
              const { ph: fermPh,  ta: fermTa }  = primary.fermentation;
              const { ph: bottPh,  ta: bottTa }  = primary.bottling;

              // Short chart labels for the drift chart; extra SO₂-test stages fall back to their standard labels
              const SCREEN_STAGE_LABELS: Record<string, string> = {
                "at-pressing": "At pressing", "post-fermentation": "Post-ferm.", "at-bottling": "Bottling",
              };
              const trendStages = computePhTaStagePoints(primary, data.so2Tests)
                .map(p => ({ stage: SCREEN_STAGE_LABELS[p.key] ?? SO2_TEST_STAGE_LABELS[p.key] ?? p.key, ph: p.ph, ta: p.ta }));

              const hasAny = trendStages.length > 0;
              if (!hasAny) return null;
              const showTrend = trendStages.length >= 2;
              return (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" />pH &amp; TA Analytical History
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white/60 rounded p-2 space-y-1">
                      <p className="text-muted-foreground font-medium">At pressing (juice)</p>
                      {pressPh != null ? <p className="font-mono font-semibold">pH {pressPh.toFixed(2)}</p> : <p className="text-muted-foreground">pH —</p>}
                      {pressTa != null ? <p className="font-mono text-muted-foreground">TA {pressTa.toFixed(1)} g/L</p> : <p className="text-muted-foreground">TA —</p>}
                    </div>
                    <div className="bg-white/60 rounded p-2 space-y-1">
                      <p className="text-muted-foreground font-medium">Post-fermentation</p>
                      {fermPh != null ? <p className="font-mono font-semibold">pH {fermPh.toFixed(2)}</p> : <p className="text-muted-foreground">pH —</p>}
                      {fermTa != null ? <p className="font-mono text-muted-foreground">TA {fermTa.toFixed(1)} g/L</p> : <p className="text-muted-foreground">TA —</p>}
                    </div>
                    <div className="bg-white/60 rounded p-2 space-y-1">
                      <p className="text-muted-foreground font-medium">At bottling</p>
                      {bottPh != null ? <p className="font-mono font-semibold">pH {bottPh.toFixed(2)}</p> : <p className="text-muted-foreground">pH —</p>}
                      {bottTa != null ? <p className="font-mono text-muted-foreground">TA {bottTa.toFixed(1)} g/L</p> : <p className="text-muted-foreground">TA —</p>}
                    </div>
                  </div>
                  {showTrend && (
                    <div className="bg-white/70 rounded p-2">
                      <p className="text-xs text-muted-foreground mb-1">Acidity drift</p>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={trendStages} margin={{ top: 4, right: 28, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} />
                          <YAxis
                            yAxisId="ph"
                            orientation="left"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: number) => v.toFixed(2)}
                            domain={["auto", "auto"]}
                            width={36}
                            label={{ value: "pH", position: "insideLeft", offset: 4, style: { fontSize: 9, fill: "#6366f1" } }}
                          />
                          <YAxis
                            yAxisId="ta"
                            orientation="right"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: number) => v.toFixed(1)}
                            domain={["auto", "auto"]}
                            width={36}
                            label={{ value: "TA g/L", position: "insideRight", offset: 4, style: { fontSize: 9, fill: "#0ea5e9" } }}
                          />
                          <Tooltip
                            contentStyle={{ fontSize: 11 }}
                            formatter={(value: number, name: string) =>
                              name === "pH" ? [value.toFixed(2), "pH"] : [value.toFixed(1) + " g/L", "TA"]
                            }
                          />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                          <Line yAxisId="ph" type="monotone" dataKey="ph" name="pH" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                          <Line yAxisId="ta" type="monotone" dataKey="ta" name="TA (g/L)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} connectNulls strokeDasharray="4 2" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })()}

            {totalLinked === 0 && !isLoading && (
              <EmptyState icon={GitBranch} title="No linked records yet" sub="Fermentation, cellar ops, SO₂ tests, and bottling runs sharing this batch reference will appear here." />
            )}

            {/* Fermentation */}
            {data.fermentation.length > 0 && (
              <TrailSection icon={FlaskConical} title="Fermentation" count={data.fermentation.length}>
                <div className="rounded border divide-y">
                  {data.fermentation.map(r => {
                    const rowRef = r.batch_ref ? String(r.batch_ref).trim() : null;
                    const isHighlighted = !!(rowRef && highlightedBatch && rowRef === highlightedBatch);
                    return (
                    <div
                      key={String(r.id)}
                      className={`px-3 py-2.5 space-y-1 transition-colors${isHighlighted ? " bg-indigo-50 ring-1 ring-indigo-300" : ""}`}
                      ref={el => { if (el && rowRef && !batchRowRefs.current.has(rowRef)) batchRowRefs.current.set(rowRef, el); }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{r.start_date ? fmtDate(r.start_date) : "—"}{r.end_date ? ` → ${fmtDate(r.end_date)}` : ""}</span>
                          {!!r.wine_colour && <Badge variant="outline" className="text-xs">{String(r.wine_colour)}</Badge>}
                          {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                            <Badge className="text-xs bg-green-100 text-green-800 border-0 inline-flex items-center gap-0.5"><Leaf className="w-3 h-3" />Organic</Badge>
                          )}
                          {!!r.vessel_ref && <span className="text-xs text-muted-foreground">Vessel: {String(r.vessel_ref)}</span>}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        {!!r.operator_name && <span className="text-xs text-muted-foreground shrink-0">{String(r.operator_name)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {!!r.fermentation_type && <span>{String(r.fermentation_type)}</span>}
                        {!!r.yeast_strain && <span>Yeast: {String(r.yeast_strain)}</span>}
                        {!!r.inoculation_date && <span>Inoculated: {fmtDate(r.inoculation_date)}</span>}
                        {r.volume_litres != null && <span>{fmtNum(r.volume_litres, 0)} L</span>}
                        {r.so2_at_fermentation_mg_l != null && <span>SO₂: {fmtNum(r.so2_at_fermentation_mg_l, 1)} mg/L</span>}
                        {r.end_ph != null && <span className="text-blue-700 font-medium">End pH: {fmtNum(r.end_ph, 2)}</span>}
                        {r.end_ta_gl != null && <span className="text-blue-700">End TA: {fmtNum(r.end_ta_gl, 1)} g/L</span>}
                      </div>
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                    );
                  })}
                </div>
              </TrailSection>
            )}

            {/* Cellar Ops */}
            {data.cellarOps.length > 0 && (
              <TrailSection icon={Wrench} title="Cellar Operations" count={data.cellarOps.length}>
                <div className="rounded border divide-y">
                  {(() => {
                    // Per-op running SO₂ totals, computed in chronological order so
                    // the on-screen figure matches the printed PDF's "Running total
                    // after this op (cumulative mg/L)" column.
                    const chrono = [...data.cellarOps].sort((a, b) => String(a.op_date ?? "").localeCompare(String(b.op_date ?? "")));
                    const { perOp } = cellarSo2RunningTotals(chrono);
                    const runningByOp = new Map<Record<string, unknown>, { contributed: boolean; runningMgL: number | null }>();
                    chrono.forEach((op, i) => runningByOp.set(op, perOp[i]));
                    return data.cellarOps.map(r => {
                      const isSulfiting = String(r.op_type) === "sulfiting";
                      const running = runningByOp.get(r);
                      return (
                    <div key={String(r.id)} className="px-3 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{fmtDate(r.op_date)}</span>
                          <Badge variant="outline" className="text-xs">{CELLAR_OP_LABELS[String(r.op_type)] ?? fmt(r.op_type)}</Badge>
                          {!!r.from_vessel_ref && <span className="text-xs text-muted-foreground">{String(r.from_vessel_ref)}{r.to_vessel_ref ? ` → ${String(r.to_vessel_ref)}` : ""}</span>}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        {!!r.operator_name && <span className="text-xs text-muted-foreground shrink-0">{String(r.operator_name)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {r.volume_moved_litres != null && <span>{fmtNum(r.volume_moved_litres, 1)} L moved</span>}
                        {r.so2_quantity_g != null && <span>SO₂: {fmtNum(r.so2_quantity_g, 1)} g</span>}
                        {r.free_so2_before_mg_l != null && <span>Free SO₂ before: {fmtNum(r.free_so2_before_mg_l, 1)} mg/L</span>}
                        {r.free_so2_after_mg_l != null && <span>after: {fmtNum(r.free_so2_after_mg_l, 1)} mg/L</span>}
                        {!!r.fining_agent && <span>Fining: {String(r.fining_agent)}{r.fining_dose ? ` @ ${String(r.fining_dose)}` : ""}</span>}
                        {isSulfiting && (
                          <span className="font-mono font-medium text-amber-800">
                            Running total after this op: {running?.contributed && running.runningMgL != null ? `≈ ${running.runningMgL.toFixed(1)} mg/L` : "—"}
                          </span>
                        )}
                      </div>
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                      );
                    });
                  })()}
                </div>
              </TrailSection>
            )}

            {/* SO₂ Tests */}
            {data.so2Tests.length > 0 && (
              <TrailSection icon={Gauge} title="SO₂ Tests" count={data.so2Tests.length}>
                <div className="rounded border divide-y">
                  {data.so2Tests.map(r => (
                    <div key={String(r.id)} className="px-3 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{fmtDate(r.test_date)}</span>
                          <Badge variant="outline" className="text-xs">{SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? fmt(r.test_stage)}</Badge>
                          {!!r.vessel_ref && <span className="text-xs text-muted-foreground">Vessel: {String(r.vessel_ref)}</span>}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        <So2Badge compliant={r.so2_compliant} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {r.free_so2_mg_l != null && <span>Free SO₂: {fmtNum(r.free_so2_mg_l, 1)} mg/L</span>}
                        {r.total_so2_mg_l != null && <span>Total SO₂: {fmtNum(r.total_so2_mg_l, 1)} mg/L</span>}
                        {r.max_permitted_mg_l != null && <span>Max permitted: {fmtNum(r.max_permitted_mg_l, 0)} mg/L</span>}
                        {!!r.test_method && <span>{String(r.test_method)}</span>}
                      </div>
                      {!!r.action_taken && <p className="text-xs text-muted-foreground">Action: {String(r.action_taken)}</p>}
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                  ))}
                </div>
              </TrailSection>
            )}

            {/* Bottling */}
            {data.bottling.length > 0 && (
              <TrailSection icon={Package} title="Bottling Runs" count={data.bottling.length}>
                <div className="rounded border divide-y">
                  {data.bottling.map(r => {
                    const rowRef = r.batch_ref ? String(r.batch_ref).trim() : null;
                    const isHighlighted = !!(rowRef && highlightedBatch && rowRef === highlightedBatch);
                    return (
                    <div
                      key={String(r.id)}
                      className={`px-3 py-2.5 space-y-1 transition-colors${isHighlighted ? " bg-indigo-50 ring-1 ring-indigo-300" : ""}`}
                      ref={el => { if (el && rowRef && !batchRowRefs.current.has(rowRef)) batchRowRefs.current.set(rowRef, el); }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{fmtDate(r.bottling_date)}</span>
                          {!!r.lot_code && <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Lot: {String(r.lot_code)}</span>}
                          {!!r.wine_colour && <Badge variant="outline" className="text-xs">{String(r.wine_colour)}</Badge>}
                          {(r.is_organic === true || r.is_organic === "true") && (
                            <Badge className="text-xs bg-green-100 text-green-800 border-0 inline-flex items-center gap-0.5"><Leaf className="w-3 h-3" />Organic limits</Badge>
                          )}
                          {(r.certified_organic === true || r.certified_organic === "true") && (
                            <Badge className="text-xs bg-green-100 text-green-800 border-0">Certified organic</Badge>
                          )}
                          {isVintageScoped && (r.batch_ref ? <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{String(r.batch_ref)}</span> : <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No ref</span>)}
                        </div>
                        {!!r.operator_name && <span className="text-xs text-muted-foreground shrink-0">{String(r.operator_name)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {r.volume_bottled_litres != null && <span>{fmtNum(r.volume_bottled_litres, 1)} L</span>}
                        {r.bottles_produced != null && <span>{String(r.bottles_produced)} bottles</span>}
                        {r.cases_produced != null && <span>{String(r.cases_produced)} cases</span>}
                        {r.bottle_size_ml != null && <span>{String(r.bottle_size_ml)} mL</span>}
                        {!!r.closure_type && <span>{String(r.closure_type)}</span>}
                        {r.actual_abv_pct != null && <span>ABV: {fmtNum(r.actual_abv_pct, 1)}%</span>}
                        {r.free_so2_mg_l != null && <span>Free SO₂: {fmtNum(r.free_so2_mg_l, 1)} mg/L</span>}
                        {r.total_so2_mg_l != null && <span className="font-medium text-foreground">Total SO₂: {fmtNum(r.total_so2_mg_l, 1)} mg/L</span>}
                        {(() => {
                          const rowColour = r.wine_colour ? String(r.wine_colour) : null;
                          if (!rowColour) return null;
                          const rowOrganic = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
                          const ceiling = rowOrganic
                            ? (ORGANIC_MAX_SO2[rowColour] ?? null)
                            : (CONVENTIONAL_MAX_SO2[rowColour] ?? null);
                          if (!ceiling) return null;
                          const ceilingNum = parseInt(ceiling, 10);
                          return (
                            <>
                              <span>Ceiling: {ceilingNum} mg/L{rowOrganic ? " (organic)" : ""}</span>
                              {r.total_so2_mg_l != null && (() => {
                                const totalVal = parseFloat(String(r.total_so2_mg_l));
                                return totalVal <= ceilingNum
                                  ? <span className="inline-flex items-center gap-0.5 text-green-700 font-medium"><CheckCircle2 className="w-3 h-3" />Compliant</span>
                                  : <span className="inline-flex items-center gap-0.5 text-red-700 font-medium"><XCircle className="w-3 h-3" />Exceeds limit</span>;
                              })()}
                            </>
                          );
                        })()}
                        {r.ph != null && <span className="text-blue-700 font-medium">pH: {fmtNum(r.ph, 2)}</span>}
                        {r.titratable_acidity_gl != null && <span className="text-blue-700">TA: {fmtNum(r.titratable_acidity_gl, 1)} g/L</span>}
                      </div>
                      {!!r.source_vessel_ref && <p className="text-xs text-muted-foreground">Source vessel: {String(r.source_vessel_ref)}</p>}
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                    </div>
                    );
                  })}
                </div>
              </TrailSection>
            )}

          {/* Audit Signature */}
          {currentSig && (
            <div className="rounded-lg border px-4 py-3 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />Audit Sign-off
              </span>
              <div className="flex items-start gap-3 flex-wrap">
                <img src={currentSig} alt="Audit signature" className="border rounded bg-white max-h-16" />
                <div className="text-xs text-muted-foreground self-center space-y-0.5">
                  {currentSignerName && (
                    <p className="font-medium text-foreground text-sm">
                      {currentSignerName}{currentSignerRole ? <span className="text-muted-foreground font-normal"> — {currentSignerRole}</span> : ""}
                    </p>
                  )}
                  <p>Signed: {currentSignedAt ? new Date(currentSignedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</p>
                  <Button variant="ghost" size="sm" className="ml-0 h-6 text-xs px-0" onClick={openSignDialog}>Re-sign</Button>
                </div>
              </div>
            </div>
          )}

          </div>
        )}

        <DialogFooter className="flex-wrap gap-2">
          {data && (
            <>
              <Button variant="outline" size="sm" onClick={() => { void exportBatchTrailCsv(farmId, pressing, data, farmName); }}>
                <FileDown className="w-3.5 h-3.5 mr-1" />Export CSV
              </Button>
              {/* Mirrors the embed argument passed to printBatchTrail below: the PDF embeds
                  the signature exactly when currentSig is present. */}
              <Button variant="outline" size="sm" onClick={() => { void printBatchTrail(farmId, pressing, data, farmName, currentSig, { name: currentSignerName, role: currentSignerRole, signedAt: currentSignedAt, signerDate: currentSignerDate }); }} title={currentSig ? "Signed — signature will be embedded" : undefined}>
                <Printer className="w-3.5 h-3.5 mr-1" />Print / Export PDF
                {!!currentSig && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
              </Button>
              <Button size="sm" variant={currentSig ? "outline" : "default"} onClick={openSignDialog}>
                <PenLine className="w-3.5 h-3.5 mr-1" />{currentSig ? "Re-sign" : "Sign Off"}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {/* Signature Canvas Dialog */}
      {sigOpen && (
        <Dialog open onOpenChange={o => !o && setSigOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><PenLine className="h-4 w-4" />Sign Off Batch Trail</DialogTitle>
              <DialogDescription>Complete the fields below and draw your signature. These details will be saved against the pressing record and embedded in any PDF exported afterward.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Auditor Name</Label>
                <Input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Full name" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <Input value={signerRole} onChange={e => setSignerRole(e.target.value)} placeholder="e.g. Certification Inspector" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={signerDate} onChange={e => setSignerDate(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-white touch-none" style={{ height: 180 }}>
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{ style: { width: "100%", height: "100%" }, className: "signature-pad" }}
                backgroundColor="white"
                penColor="#111827"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">Sign above — draw with your finger, stylus, or mouse</p>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => sigRef.current?.clear()}>Clear</Button>
              <Button variant="outline" size="sm" onClick={() => setSigOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleConfirmSignature} disabled={signOffMutation.isPending}>
                {signOffMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Confirm &amp; Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

// ─── Batch Trail — CSV export ─────────────────────────────────────────────────
// ─── Vintage pH & TA comparison rows — shared by the batch-trail PDF + CSV ────
// Per-batch pH/TA: bottling (primary, most recent) → fermentation end (fallback).
// Both printBatchTrail's "Vintage pH & TA Comparison" table and the CSV export's
// comparison section derive their rows from this one function so they can't drift.
function computeVintagePhTaComparisonRows(data: BatchTrailData): { ref: string; ph: number | null; ta: number | null; source: string | null }[] {
  const cmpMap = new Map<string, { ph: number | null; ta: number | null; source: string | null }>();
  const cmpBottling = [...data.bottling].sort((a, b) =>
    a.bottling_date && b.bottling_date
      ? new Date(String(b.bottling_date)).getTime() - new Date(String(a.bottling_date)).getTime()
      : 0
  );
  for (const r of cmpBottling) {
    const ref = r.batch_ref ? String(r.batch_ref).trim() : null;
    if (!ref) continue;
    if (!cmpMap.has(ref)) cmpMap.set(ref, { ph: null, ta: null, source: null });
    const entry = cmpMap.get(ref)!;
    if (entry.ph == null && r.ph != null) { entry.ph = parseFloat(String(r.ph)); entry.source = "Bottling"; }
    if (entry.ta == null && r.titratable_acidity_gl != null) { entry.ta = parseFloat(String(r.titratable_acidity_gl)); entry.source = entry.source ?? "Bottling"; }
  }
  const cmpFerm = [...data.fermentation].sort((a, b) =>
    a.end_date && b.end_date
      ? new Date(String(b.end_date)).getTime() - new Date(String(a.end_date)).getTime()
      : 0
  );
  for (const r of cmpFerm) {
    const ref = r.batch_ref ? String(r.batch_ref).trim() : null;
    if (!ref) continue;
    if (!cmpMap.has(ref)) cmpMap.set(ref, { ph: null, ta: null, source: null });
    const entry = cmpMap.get(ref)!;
    if (entry.ph == null && r.end_ph != null) { entry.ph = parseFloat(String(r.end_ph)); entry.source = entry.source ?? "Fermentation end"; }
    if (entry.ta == null && r.end_ta_gl != null) { entry.ta = parseFloat(String(r.end_ta_gl)); entry.source = entry.source ?? "Fermentation end"; }
  }
  return Array.from(cmpMap.entries())
    .filter(([, v]) => v.ph != null || v.ta != null)
    .map(([ref, v]) => ({ ref, ...v }))
    .sort((a, b) => a.ref.localeCompare(b.ref));
}

// ─── Batch-trail attachment fetch helpers ─────────────────────────────────────
// Best-effort attachment lookups shared by the CSV export and the printed PDF —
// a failed fetch never blocks the export, the stage section is simply omitted.
type TrailAttachment = { fileName: string; uploadedAt: string };

async function fetchTrailAttachments(farmId: number, recordType: string, recordId: number): Promise<TrailAttachment[]> {
  try {
    const res = await fetch(api(`farms/${farmId}/record-attachments?recordType=${recordType}&recordId=${recordId}`), { credentials: "include" });
    if (!res.ok) return [];
    const json = await res.json();
    return (Array.isArray(json) ? json : []) as TrailAttachment[];
  } catch {
    return []; // best-effort — non-critical
  }
}

// Fetch attachments for every record of a stage; returns a map keyed by record id
// containing only records that actually have attachments.
async function fetchStageAttachments(farmId: number, recordType: string, records: Record<string, unknown>[]): Promise<Map<number, TrailAttachment[]>> {
  const map = new Map<number, TrailAttachment[]>();
  await Promise.all(records.map(async r => {
    const id = r.id != null ? Number(r.id) : null;
    if (!id) return;
    const files = await fetchTrailAttachments(farmId, recordType, id);
    if (files.length > 0) map.set(id, files);
  }));
  return map;
}

async function exportBatchTrailCsv(farmId: number, pressing: Record<string, unknown>, data: BatchTrailData, farmName: string) {
  // Fetch attachments for the pressing record (best-effort — CSV still exports if this fails).
  // Mirrors the attachments block in the printed PDF (printBatchTrail).
  let pressAttachments: TrailAttachment[] = [];
  const pressId = pressing.id != null ? Number(pressing.id) : null;
  // Fermentation / cellar op / SO₂ test / bottling attachments — same best-effort
  // fetch, keyed per record so each stage row can list its own files.
  const [fermAttachments, cellarAttachments, so2Attachments, bottlingAttachments] = await Promise.all([
    fetchStageAttachments(farmId, "winery-fermentation", data.fermentation),
    fetchStageAttachments(farmId, "winery-cellar-op", data.cellarOps),
    fetchStageAttachments(farmId, "winery-so2-test", data.so2Tests),
    fetchStageAttachments(farmId, "winery-bottling", data.bottling),
    (async () => { if (pressId) pressAttachments = await fetchTrailAttachments(farmId, "winery-pressing", pressId); })(),
  ]);
  const batchRef = String(pressing.batch_ref ?? "");
  const isVintageScoped = data.scope === "vintageYear";
  const vintageYear = data.vintageYear ? String(data.vintageYear) : (pressing.vintage_year ? String(pressing.vintage_year) : null);
  const rows: string[][] = [];

  // Header
  rows.push([...BATCH_TRAIL_CSV_HEADER]);

  const pressingBatchRef = String(pressing.batch_ref ?? "");

  // Pressing — summary row with juice analytics
  rows.push([
    "Pressing — Juice",
    pressingBatchRef,
    fmtDate(pressing.press_date),
    String(pressing.press_type ?? ""),
    pressing.juice_brix != null ? `Brix: ${fmtNum(pressing.juice_brix, 1)}` : "",
    "",
    "",
    "",
    "",
    pressing.juice_ph != null ? fmtNum(pressing.juice_ph, 2) : "",
    pressing.juice_ta_gl != null ? fmtNum(pressing.juice_ta_gl, 1) : "",
    "",
    String(pressing.operator_name ?? ""),
    "",
  ]);

  // Pressing additives — additive columns come from PRESS_ADDITIVE_COLUMNS (shared with the PDF)
  for (const a of data.pressAdditions) {
    // In vintage scope the additives span multiple pressings — attribute each
    // row to its own pressing (batch ref + press date from the API), matching
    // the PDF's per-pressing grouping. Batch-ref scope keeps the single
    // clicked pressing's values (identical, but preserved explicitly).
    const additiveBatchRef = isVintageScoped && a.pressing_batch_ref != null && String(a.pressing_batch_ref).trim() !== ""
      ? String(a.pressing_batch_ref).trim()
      : pressingBatchRef;
    const additiveDate = isVintageScoped && a.pressing_press_date
      ? fmtDate(a.pressing_press_date)
      : fmtDate(pressing.press_date);
    const cells: Record<string, string> = {
      "Stage": "Pressing — Additive",
      "Batch Ref": additiveBatchRef,
      "Date": additiveDate,
      "Operator": String(pressing.operator_name ?? ""),
    };
    for (const col of PRESS_ADDITIVE_COLUMNS) cells[col.csvColumn] = col.csvValue(a);
    rows.push(BATCH_TRAIL_CSV_HEADER.map(h => cells[h] ?? ""));
  }

  // Pressing notes — dedicated row, only when non-empty (mirrors on-screen view)
  if (pressing.notes) {
    rows.push([
      "Pressing — Notes",
      pressingBatchRef,
      fmtDate(pressing.press_date),
      "",
      String(pressing.notes),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  }

  // Pressing attachments — one row per file, only when attachments exist (mirrors the PDF)
  for (const a of pressAttachments) {
    rows.push([
      "Pressing — Attachment",
      pressingBatchRef,
      a.uploadedAt ? fmtDate(a.uploadedAt) : "",
      "Attachment",
      String(a.fileName ?? ""),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      a.uploadedAt ? `Uploaded ${fmtDate(a.uploadedAt)}` : "",
    ]);
  }

  // Attachment rows for a stage record — same shape as the pressing attachment
  // rows above; emitted directly after the record's own row, omitted when empty.
  const pushStageAttachmentRows = (stageLabel: string, r: Record<string, unknown>, attMap: Map<number, TrailAttachment[]>) => {
    const files = r.id != null ? attMap.get(Number(r.id)) : undefined;
    for (const a of files ?? []) {
      rows.push([
        `${stageLabel} — Attachment`,
        String(r.batch_ref ?? ""),
        a.uploadedAt ? fmtDate(a.uploadedAt) : "",
        "Attachment",
        String(a.fileName ?? ""),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        a.uploadedAt ? `Uploaded ${fmtDate(a.uploadedAt)}` : "",
      ]);
    }
  };

  // Fermentation
  for (const r of data.fermentation) {
    rows.push([
      "Fermentation",
      String(r.batch_ref ?? ""),
      r.start_date ? fmtDate(r.start_date) : "",
      String(r.fermentation_type ?? ""),
      r.yeast_strain ? `Yeast: ${String(r.yeast_strain)}` : "",
      r.so2_at_fermentation_mg_l != null ? fmtNum(r.so2_at_fermentation_mg_l, 1) : "",
      r.so2_at_fermentation_mg_l != null ? "mg/L" : "",
      "",
      "",
      r.end_ph != null ? fmtNum(r.end_ph, 2) : "",
      r.end_ta_gl != null ? fmtNum(r.end_ta_gl, 1) : "",
      String(r.vessel_ref ?? ""),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
    pushStageAttachmentRows("Fermentation", r, fermAttachments);
  }

  // Cellar ops
  for (const r of data.cellarOps) {
    const soDetails = r.so2_quantity_g != null ? fmtNum(r.so2_quantity_g, 1) : (r.free_so2_after_mg_l != null ? fmtNum(r.free_so2_after_mg_l, 1) : "");
    const soUnit = r.so2_quantity_g != null ? "g" : (r.free_so2_after_mg_l != null ? "mg/L (after)" : "");
    rows.push([
      "Cellar Operation",
      String(r.batch_ref ?? ""),
      fmtDate(r.op_date),
      CELLAR_OP_LABELS[String(r.op_type)] ?? String(r.op_type ?? ""),
      r.fining_agent ? `Fining: ${String(r.fining_agent)}` : "",
      soDetails,
      soUnit,
      "",
      "",
      "",
      "",
      [r.from_vessel_ref, r.to_vessel_ref].filter(Boolean).join(" → "),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
    pushStageAttachmentRows("Cellar Operation", r, cellarAttachments);
  }

  // SO₂ tests
  for (const r of data.so2Tests) {
    rows.push([
      "SO₂ Test",
      String(r.batch_ref ?? ""),
      fmtDate(r.test_date),
      SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? String(r.test_stage ?? ""),
      r.so2_compliant === true || r.so2_compliant === "true" ? "Compliant" : r.so2_compliant === false || r.so2_compliant === "false" ? "Exceeds Limit" : "",
      r.free_so2_mg_l != null ? fmtNum(r.free_so2_mg_l, 1) : "",
      "mg/L (free)",
      "",
      "",
      r.ph != null ? fmtNum(r.ph, 2) : "",
      r.titratable_acidity_gl != null ? fmtNum(r.titratable_acidity_gl, 1) : "",
      String(r.vessel_ref ?? ""),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
    pushStageAttachmentRows("SO₂ Test", r, so2Attachments);
  }

  // Bottling — includes SO₂ ceiling and compliance verdict, matching the PDF logic
  for (const r of data.bottling) {
    const isOrg = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
    const colour = String(r.wine_colour ?? "");
    const ceiling = colour ? parseFloat(isOrg ? (ORGANIC_MAX_SO2[colour] ?? "") : (CONVENTIONAL_MAX_SO2[colour] ?? "")) : NaN;
    const totalSo2 = r.total_so2_mg_l != null ? parseFloat(String(r.total_so2_mg_l)) : null;
    const hasCompliance = totalSo2 != null && !isNaN(ceiling);
    rows.push([
      "Bottling",
      String(r.batch_ref ?? ""),
      fmtDate(r.bottling_date),
      r.lot_code ? `Lot: ${String(r.lot_code)}` : "",
      r.bottles_produced != null ? `${String(r.bottles_produced)} bottles` : "",
      r.free_so2_mg_l != null ? fmtNum(r.free_so2_mg_l, 1) : "",
      r.free_so2_mg_l != null ? "mg/L (free SO₂)" : "",
      !isNaN(ceiling) ? `${ceiling.toFixed(0)} (${isOrg ? "organic" : "conventional"})` : "",
      hasCompliance ? (totalSo2! > ceiling ? "Exceeds Limit" : "Compliant") : "",
      r.ph != null ? fmtNum(r.ph, 2) : "",
      r.titratable_acidity_gl != null ? fmtNum(r.titratable_acidity_gl, 1) : "",
      String(r.source_vessel_ref ?? ""),
      String(r.operator_name ?? ""),
      String(r.notes ?? ""),
    ]);
    pushStageAttachmentRows("Bottling", r, bottlingAttachments);
  }

  // ── pH & TA Analytical History summary block ────────────────────────────────
  // Stage logic shared with the on-screen panel and PDF via lib/ph-ta-stages.
  // SO₂-test readings supplement the three primary stages (most recent test per
  // stage; primary sources win), so the CSV matches the richer on-screen panel.
  const CSV_STAGE_LABELS: Record<string, string> = {
    "at-pressing": "Pressing juice", "post-fermentation": "Post-fermentation", "at-bottling": "Bottling",
  };
  const phTaStages: Array<[string, string, string]> = computePhTaStagePoints(
    computePrimaryPhTa(pressing, data.fermentation, data.bottling),
    data.so2Tests
  ).map(p => [
    CSV_STAGE_LABELS[p.key] ?? SO2_TEST_STAGE_LABELS[p.key] ?? p.key,
    p.ph != null ? p.ph.toFixed(2) : "",
    p.ta != null ? p.ta.toFixed(1) : "",
  ]);

  if (phTaStages.length > 0) {
    // Blank separator row
    rows.push(["", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    // Section heading (spans first two columns for readability)
    rows.push(["pH & TA Analytical History", "", "", "", "", "", "", "", "", "pH", "TA (g/L)", "", "", ""]);
    for (const [stage, ph, ta] of phTaStages) {
      rows.push([stage, batchRef, "", "", "", "", "", "", "", ph, ta, "", "", ""]);
    }
  }

  // ── Vintage pH & TA Comparison summary block (vintage scope only) ───────────
  // Row logic shared with the printed PDF via computeVintagePhTaComparisonRows:
  // per-batch pH/TA — bottling (most recent) primary, fermentation end fallback.
  if (isVintageScoped) {
    const cmpRows = computeVintagePhTaComparisonRows(data);
    if (cmpRows.length > 0) {
      // Blank separator row
      rows.push(["", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      // Section heading — "Detail" column carries the source stage per row
      rows.push(["Vintage pH & TA Comparison", "Batch Ref", "", "Stage", "", "", "", "", "", "pH", "TA (g/L)", "", "", ""]);
      for (const r of cmpRows) {
        rows.push([
          "Vintage Comparison",
          r.ref,
          "",
          r.source ?? "",
          "",
          "",
          "",
          "",
          "",
          r.ph != null ? r.ph.toFixed(2) : "",
          r.ta != null ? r.ta.toFixed(1) : "",
          "",
          "",
          "",
        ]);
      }
    }
  }

  const prefixLine = isVintageScoped && vintageYear
    ? `"Full Vintage Trail — Vintage ${vintageYear} — ${farmName.replace(/"/g, '""')}"`
    : null;
  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([prefixLine ? prefixLine + "\n" + csv : csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = isVintageScoped && vintageYear
    ? `vintage-trail-${vintageYear}.csv`
    : `batch-trail-${batchRef || "unknown"}.csv`;
  a.click();
}

// ─── Batch Trail — Print report ───────────────────────────────────────────────
// Safe data-URL validator: only accepts PNG base64 data URLs with safe characters.
// Base64 chars (A-Za-z0-9+/=) cannot break out of an HTML attribute, so a validated
// value is safe to interpolate directly into src="...".
const SAFE_PNG_DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/;
const MAX_SIG_BYTES = 600_000;

function sanitiseSignatureForHtml(sig: string | null | undefined): string | null {
  if (!sig) return null;
  if (!SAFE_PNG_DATA_URL.test(sig) || sig.length > MAX_SIG_BYTES) return null;
  return sig;
}

async function printBatchTrail(farmId: number, pressing: Record<string, unknown>, data: BatchTrailData, farmName: string, auditSig?: string | null, signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null }) {
  // Fetch attachments for the pressing record (best-effort — PDF still prints if this fails)
  let pressAttachments: TrailAttachment[] = [];
  const pressId = pressing.id != null ? Number(pressing.id) : null;
  // Fermentation / cellar op / SO₂ test / bottling attachments — same best-effort
  // fetch, keyed per record so each stage section can list its own files.
  const [fermAttachments, cellarAttachments, so2Attachments, bottlingAttachments] = await Promise.all([
    fetchStageAttachments(farmId, "winery-fermentation", data.fermentation),
    fetchStageAttachments(farmId, "winery-cellar-op", data.cellarOps),
    fetchStageAttachments(farmId, "winery-so2-test", data.so2Tests),
    fetchStageAttachments(farmId, "winery-bottling", data.bottling),
    (async () => { if (pressId) pressAttachments = await fetchTrailAttachments(farmId, "winery-pressing", pressId); })(),
  ]);
  const batchRef = String(pressing.batch_ref ?? "");
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const vintage = pressing.vintage_year ? String(pressing.vintage_year) : null;
  const pressDate = pressing.press_date ? fmtDate(pressing.press_date) : "—";
  const isVintageScoped = data.scope === "vintageYear";

  // Validate the signature before any HTML injection — reject anything that isn't
  // a strict PNG base64 data URL (guards against stored XSS via the sign-off API).
  const safeSig = sanitiseSignatureForHtml(auditSig);

  const batchRefBadge = (r: Record<string, unknown>) =>
    r.batch_ref
      ? `<span style="font-family:monospace;font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px;white-space:nowrap">${escHtml(String(r.batch_ref))}</span>`
      : `<span style="font-size:10px;background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:3px">No ref</span>`;

  const sectionHtml = (title: string, rows: string) =>
    rows ? `<div class="section"><h2>${escHtml(title)}</h2><table>${rows}</table></div>` : "";

  // ── SO₂ compliance summary (computed client-side, same logic as the dialog) ──
  const s2 = computeSo2Summary(pressing, data);
  // compValue: most authoritative figure — drives the overall status badge and progress bar
  const compValue = s2.latestTestTotal ?? s2.runningEstimate;
  const pctOfLimit = s2.activeLimit > 0 ? (compValue / s2.activeLimit) * 100 : 0;
  const so2StatusColor = compValue > s2.activeLimit ? "#b91c1c" : pctOfLimit >= 75 ? "#92400e" : "#166534";
  const so2BgColor     = compValue > s2.activeLimit ? "#fee2e2" : pctOfLimit >= 75 ? "#fef3c7" : "#dcfce7";
  const so2StatusText  = compValue > s2.activeLimit ? "⚠ Exceeds limit" : pctOfLimit >= 75 ? "⚠ Approaching limit" : "✓ Within limit";
  const barPct = Math.min(pctOfLimit, 100).toFixed(0);
  const barColor = compValue > s2.activeLimit ? "#ef4444" : pctOfLimit >= 75 ? "#f59e0b" : "#22c55e";
  // estimateXxx: values based purely on the additions estimate — used for the cumulative row so that
  // the percentage and colour always reflect the running total regardless of test results.
  const estimatePct = s2.activeLimit > 0 ? (s2.runningEstimate / s2.activeLimit) * 100 : 0;
  const estimateBarPct = Math.min(estimatePct, 100).toFixed(0);
  const estimateColor = s2.runningEstimate > s2.activeLimit ? "#b91c1c" : estimatePct >= 75 ? "#92400e" : "#166534";

  // ── pH & TA Analytical History (stage merge logic shared via lib/ph-ta-stages) ──
  const PDF_STAGE_LABELS: Record<string, string> = {
    "at-pressing": "At pressing (juice)", "post-fermentation": "Post-fermentation", "at-bottling": "At bottling",
  };
  const pdfTrendStages = computePhTaStagePoints(
    computePrimaryPhTa(pressing, data.fermentation, data.bottling),
    data.so2Tests
  ).map(p => ({ label: PDF_STAGE_LABELS[p.key] ?? SO2_TEST_STAGE_LABELS[p.key] ?? p.key, ph: p.ph, ta: p.ta }));
  const phTaHasAny = pdfTrendStages.length > 0;

  // ── Vintage pH & TA Comparison (vintage scope only — mirrors the on-screen chart) ──
  // Row logic shared with the CSV export via computeVintagePhTaComparisonRows.
  let vintageComparisonHtml = "";
  if (isVintageScoped) {
    const cmpRows = computeVintagePhTaComparisonRows(data);
    if (cmpRows.length > 0) {
      vintageComparisonHtml = `
<div class="section">
  <h2>Vintage pH &amp; TA Comparison</h2>
  <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:6px;padding:10px 12px">
    <p style="font-size:10px;color:#6b7280;margin-bottom:6px">Per-batch pH and TA across the vintage — bottling values where available, otherwise fermentation-end values. ${cmpRows.length} batch${cmpRows.length !== 1 ? "es" : ""}.</p>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe">Batch Ref</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe;text-align:right">pH</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe;text-align:right">TA (g/L)</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe">Stage</th>
      </tr>
      ${cmpRows.map(r => `<tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;font-family:monospace">${escHtml(r.ref)}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;text-align:right;font-family:monospace">${r.ph != null ? r.ph.toFixed(2) : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;text-align:right;font-family:monospace">${r.ta != null ? r.ta.toFixed(1) : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;color:#6b7280">${escHtml(r.source ?? "—")}</td>
      </tr>`).join("")}
    </table>
  </div>
</div>`;
    }
  }

  const phTaHistoryHtml = phTaHasAny ? `
<div class="section">
  <h2>pH &amp; TA Analytical History</h2>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 12px">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      ${pdfTrendStages.map(s => `
      <div style="background:rgba(255,255,255,0.7);border-radius:4px;padding:8px 10px">
        <p style="font-size:10px;font-weight:600;color:#6b7280;margin-bottom:4px">${s.label}</p>
        <p style="font-size:12px;font-family:monospace;font-weight:700;color:#1e40af">${s.ph != null ? `pH ${s.ph.toFixed(2)}` : `<span style="color:#9ca3af">pH —</span>`}</p>
        <p style="font-size:11px;font-family:monospace;color:#374151;margin-top:2px">${s.ta != null ? `TA ${s.ta.toFixed(1)} g/L` : `<span style="color:#9ca3af">TA —</span>`}</p>
      </div>`).join("")}
    </div>
  </div>
</div>` : "";

  const so2SummaryHtml = s2.hasAny ? `
<div class="section">
  <h2>SO₂ Compliance Summary</h2>
  <div style="background:${so2BgColor};border-radius:6px;padding:10px 12px;margin-bottom:4px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:11px;font-weight:600;color:#374151">Cumulative SO₂ additions vs. legal ceiling</span>
      <span style="font-size:11px;font-weight:700;color:${so2StatusColor}">${so2StatusText}</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb">Stage</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb;text-align:right">Amount</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb">Notes</th>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">SO₂ at pressing</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasPressingSo2 ? [s2.pressSo2MgKg > 0 ? `${s2.pressSo2MgKg.toFixed(1)} mg/kg` : "", s2.pressSo2MgL > 0 ? `${s2.pressSo2MgL.toFixed(1)} mg/L` : ""].filter(Boolean).join(" + ") : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">From press additions</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">SO₂ at fermentation</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasFermSo2 ? `${s2.fermSo2Total.toFixed(1)} mg/L` : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Sum across fermentation records</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">Cellar sulfiting</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasCellarSo2 ? `${s2.cellarSo2TotalG.toFixed(1)} g${s2.cellarSo2MgL != null ? ` (≈ ${s2.cellarSo2MgL.toFixed(1)} mg/L)` : ""}` : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">${s2.hasCellarSo2 && s2.cellarSo2MgL != null && s2.cellarVolumeSource === "vessel" ? "Estimate using vessel capacity" : s2.hasCellarSo2 && s2.cellarSo2MgL != null && s2.cellarVolumeSource === "mixed" ? "Estimate: vessel capacity where available, volume moved otherwise" : s2.hasCellarSo2 && s2.cellarSo2MgL != null ? "Estimate using volume moved" : s2.hasCellarSo2 ? "Volume not recorded — no mg/L estimate" : "No sulfiting operations"}</td>
      </tr>
      <tr style="font-weight:700;background:rgba(255,255,255,0.5)">
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb">Cumulative additions (mg/L)</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;color:${estimateColor}">~${s2.runningEstimate.toFixed(1)} mg/L of ${s2.activeLimit} mg/L</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">${estimateBarPct}% of ${s2.isOrganic ? "organic" : "conventional"} ceiling${s2.isOrganic ? ` · Conv. ceiling: ${s2.conventionalLimit} mg/L` : ""}</td>
      </tr>
      ${s2.latestTestTotal != null ? `<tr style="font-weight:700">
        <td style="padding:5px 8px">Latest SO₂ test (confirmed)</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;color:${so2StatusColor}">${s2.latestTestTotal.toFixed(1)} mg/L${s2.latestTestDate ? ` (${fmtDate(s2.latestTestDate)})` : ""}</td>
        <td style="padding:5px 8px;color:#6b7280">Confirmed measurement — use in preference to estimate above</td>
      </tr>` : ""}
    </table>
    <div style="display:flex;gap:8px;margin-top:8px">
      <div style="flex:1;background:${s2.isOrganic ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"};border:${s2.isOrganic ? "2px solid #166534" : "1px solid #e5e7eb"};border-radius:6px;padding:6px 10px">
        <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280">Organic ceiling${s2.isOrganic ? ` <span style="color:#166534">· ACTIVE LIMIT</span>` : ""}</div>
        <div style="font-size:13px;font-weight:700;font-family:monospace;color:${s2.isOrganic ? "#166534" : "#374151"}">${s2.organicLimit} mg/L</div>
      </div>
      <div style="flex:1;background:${!s2.isOrganic ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"};border:${!s2.isOrganic ? "2px solid #166534" : "1px solid #e5e7eb"};border-radius:6px;padding:6px 10px">
        <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280">Conventional ceiling${!s2.isOrganic ? ` <span style="color:#166534">· ACTIVE LIMIT</span>` : ""}</div>
        <div style="font-size:13px;font-weight:700;font-family:monospace;color:${!s2.isOrganic ? "#166534" : "#374151"}">${s2.conventionalLimit} mg/L</div>
      </div>
    </div>
    <div style="font-size:9px;color:#6b7280;margin-top:3px">${s2.isOrganic ? `Organic batch — organic ceiling applies. Conventional ceiling shown for comparison (${(s2.conventionalLimit - s2.organicLimit).toFixed(0)} mg/L higher).` : `Conventional batch — conventional ceiling applies. Organic ceiling shown for comparison (${(s2.conventionalLimit - s2.organicLimit).toFixed(0)} mg/L lower).`}</div>
    <div style="margin-top:8px">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#6b7280;margin-bottom:2px">
        <span>${s2.wineColour ?? ""} · ${s2.isOrganic ? "Organic" : "Conventional"} ceiling: ${s2.activeLimit} mg/L${s2.isOrganic ? ` · Conv. ceiling: ${s2.conventionalLimit} mg/L` : ""}</span>
        <span>${barPct}% of limit</span>
      </div>
      <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
        <div style="height:6px;width:${barPct}%;background:${barColor};border-radius:3px"></div>
      </div>
    </div>
    ${s2.latestTestTotal == null ? `<p style="font-size:10px;color:#6b7280;font-style:italic;margin-top:6px">* Estimate from addition records only. Run a laboratory SO₂ test to confirm.</p>` : ""}
  </div>
</div>` : "";

  // Pressing summary — expanded block layout matching the on-screen "Pressing Record" card
  const pressingNotes = pressing.notes ? String(pressing.notes) : "";
  const isOrganicPress = pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1;

  // Helper: renders a single labelled field cell (label above, value below)
  const pField = (label: string, value: string) =>
    `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:4px;padding:7px 10px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:2px">${escHtml(label)}</p>
      <p style="font-size:11px;font-weight:500;color:#111">${escHtml(value)}</p>
    </div>`;

  // Group press additives by their pressing session. In vintage scope a trail
  // can span multiple pressings — each group renders its own sub-table with the
  // press date and batch ref, instead of one flat merged list.
  const pressAdditiveGroups: { key: string; pressDate: string; batchRef: string | null; notes: string; additions: Record<string, unknown>[] }[] = [];
  {
    const groupIndex = new Map<string, number>();
    // In vintage scope, seed one group per pressing session (from data.pressings)
    // so sessions with zero additives — but non-empty notes — still get a block.
    if (isVintageScoped) {
      for (const p of data.pressings ?? []) {
        const key = String(p.id);
        groupIndex.set(key, pressAdditiveGroups.length);
        pressAdditiveGroups.push({
          key,
          pressDate: p.press_date ? fmtDate(p.press_date) : "—",
          batchRef: p.batch_ref != null && String(p.batch_ref).trim() !== "" ? String(p.batch_ref).trim() : null,
          notes: p.notes != null ? String(p.notes).trim() : "",
          additions: [],
        });
      }
    }
    for (const a of data.pressAdditions) {
      const key = a.pressing_record_id != null ? String(a.pressing_record_id) : "unknown";
      let idx = groupIndex.get(key);
      if (idx == null) {
        idx = pressAdditiveGroups.length;
        groupIndex.set(key, idx);
        pressAdditiveGroups.push({
          key,
          pressDate: a.pressing_press_date ? fmtDate(a.pressing_press_date) : "—",
          batchRef: a.pressing_batch_ref != null && String(a.pressing_batch_ref).trim() !== "" ? String(a.pressing_batch_ref).trim() : null,
          notes: a.pressing_notes != null ? String(a.pressing_notes).trim() : "",
          additions: [],
        });
      }
      pressAdditiveGroups[idx].additions.push(a);
    }
    // Drop seeded sessions that ended up with neither additives nor notes —
    // they'd render an empty block.
    for (let i = pressAdditiveGroups.length - 1; i >= 0; i--) {
      if (pressAdditiveGroups[i].additions.length === 0 && !pressAdditiveGroups[i].notes) pressAdditiveGroups.splice(i, 1);
    }
  }

  const pressingBlockHtml = `
<div class="section">
  <h2>1. Pressing Record</h2>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px">

    <!-- Identity row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
      ${pField("Press Date", pressDate)}
      ${pField("Batch Ref", batchRef || "—")}
      ${pField("Vintage", vintage ?? "—")}
      ${pField("Organic", isOrganicPress ? "Yes — organic limits" : "No — conventional")}
    </div>

    <!-- Process row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
      ${pField("Press Type", String(pressing.press_type ?? "—"))}
      ${pField("Operator", String(pressing.operator_name ?? "—"))}
      ${pField("Free Run Separated", (pressing.free_run_separated === true || pressing.free_run_separated === "true" || pressing.free_run_separated === 1) ? "Yes" : "No")}
      ${pField("Juice Turbidity", String(pressing.juice_turbidity ?? "—"))}
    </div>

    <!-- Yield row -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:6px">
      ${pField("Grapes Pressed (kg)", pressing.grapes_pressed_kg != null && pressing.grapes_pressed_kg !== "" ? parseFloat(String(pressing.grapes_pressed_kg)).toFixed(0) : "—")}
      ${pField("Free Run (L)", pressing.free_run_litres != null && pressing.free_run_litres !== "" ? parseFloat(String(pressing.free_run_litres)).toFixed(1) : "—")}
      ${pField("Press Wine (L)", pressing.press_wine_litres != null && pressing.press_wine_litres !== "" ? parseFloat(String(pressing.press_wine_litres)).toFixed(1) : "—")}
      ${pField("Total Juice (L)", pressing.total_juice_litres != null && pressing.total_juice_litres !== "" ? parseFloat(String(pressing.total_juice_litres)).toFixed(1) : "—")}
      ${pField("Press Efficiency (L/kg)", pressing.press_efficiency_l_per_kg != null && pressing.press_efficiency_l_per_kg !== "" ? parseFloat(String(pressing.press_efficiency_l_per_kg)).toFixed(3) : "—")}
    </div>

    <!-- Juice analysis row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
      ${pField("Brix °", pressing.juice_brix != null && pressing.juice_brix !== "" ? parseFloat(String(pressing.juice_brix)).toFixed(1) : "—")}
      ${pField("Juice pH", pressing.juice_ph != null && pressing.juice_ph !== "" ? parseFloat(String(pressing.juice_ph)).toFixed(2) : "—")}
      ${pField("Juice TA (g/L)", pressing.juice_ta_gl != null && pressing.juice_ta_gl !== "" ? parseFloat(String(pressing.juice_ta_gl)).toFixed(1) : "—")}
      ${pField("Analysis Source", String(pressing.juice_analysis_source ?? "—"))}
    </div>

    <!-- Settling row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px${(pressAttachments.length > 0 || pressAdditiveGroups.length > 0 || (pressingNotes && !isVintageScoped)) ? ";margin-bottom:8px" : ""}">
      ${pField("Settling Method", String(pressing.settling_method ?? "—"))}
      ${pField("Settling Vessel", String(pressing.settling_vessel ?? "—"))}
      ${pField("Settling Time (hrs)", pressing.settling_hours != null && pressing.settling_hours !== "" ? String(pressing.settling_hours) : "—")}
      <div></div>
    </div>

    ${pressAttachments.length > 0 ? `
    <!-- Attachments -->
    <div style="border-top:1px solid #e5e7eb;padding-top:8px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:5px">Attachments (${pressAttachments.length})</p>
      <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px">
        ${pressAttachments.map(a => `<li style="font-size:10px;color:#374151;display:flex;align-items:center;gap:6px">
          <span style="display:inline-block;width:14px;height:14px;background:#dbeafe;border-radius:2px;flex-shrink:0;text-align:center;line-height:14px;font-size:9px;color:#1e40af">📎</span>
          <span style="font-family:monospace">${escHtml(String(a.fileName ?? ""))}</span>
          <span style="color:#9ca3af;font-size:9px">${a.uploadedAt ? fmtDate(a.uploadedAt) : ""}</span>
        </li>`).join("")}
      </ul>
    </div>` : ""}

    ${pressAdditiveGroups.length > 0 ? `
    <!-- Press additives — grouped inside this pressing record. In vintage scope
         a group renders for every pressing session with additives OR notes. -->
    <div style="border-top:1px solid #e5e7eb;padding-top:8px;margin-top:4px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:5px">Press Additives (${data.pressAdditions.length})</p>
      ${pressAdditiveGroups.map(g => `
      ${isVintageScoped ? `<p style="font-size:9px;font-weight:600;color:#374151;margin:6px 0 3px;display:flex;align-items:center;gap:6px">
        <span>Pressing — ${escHtml(g.pressDate)}</span>
        ${g.batchRef ? `<span style="font-family:monospace;font-size:9px;background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px">${escHtml(g.batchRef)}</span>` : `<span style="font-size:9px;background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:3px">No ref</span>`}
        <span style="font-weight:400;color:#9ca3af">(${g.additions.length})</span>
      </p>` : ""}
      ${g.additions.length > 0 ? `<table style="width:100%;border-collapse:collapse;margin-left:0">
        <tr style="background:#f9fafb">
          ${PRESS_ADDITIVE_COLUMNS.map(col => `<th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #d1d5db;text-align:${col.align}">${escHtml(col.pdfLabel)}</th>`).join("")}
        </tr>
        ${g.additions.map(a => `<tr>
          ${PRESS_ADDITIVE_COLUMNS.map(col => `<td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;${col.pdfCellStyle ?? ""}">${escHtml(col.pdfValue(a))}</td>`).join("")}
        </tr>`).join("")}
      </table>` : `<p style="font-size:10px;color:#9ca3af;font-style:italic;margin:2px 0 4px">No additives recorded for this pressing</p>`}
      ${isVintageScoped && g.notes ? `
      <!-- Per-pressing notes — vintage scope mirrors the single-batch "Pressing Notes" block -->
      <div style="margin:4px 0 6px">
        <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:3px">Pressing Notes</p>
        <p style="font-size:11px;color:#374151;font-style:italic">${escHtml(g.notes)}</p>
      </div>` : ""}`).join("")}
    </div>` : ""}

    ${pressingNotes && !isVintageScoped ? `
    <!-- Notes — shown below the additives section so print matches the CSV export.
         In vintage scope each pressing session's notes render inside its own
         additive group above, so this single-batch block is skipped to avoid
         duplicating the same notes twice. -->
    <div style="border-top:1px solid #e5e7eb;padding-top:8px;margin-top:4px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:3px">Pressing Notes</p>
      <p style="font-size:11px;color:#374151;font-style:italic">${escHtml(pressingNotes)}</p>
    </div>` : ""}

  </div>
</div>`;

  // Post-sign-off edit trail — full-width amber row under any signed record that
  // was edited after sign-off (same pattern as the Pressing Report PDF).
  const editHistoryPdfRow = (r: Record<string, unknown>, colCount: number) => {
    const editHistory = Array.isArray(r.edit_history) ? (r.edit_history as Record<string, unknown>[]) : [];
    if (editHistory.length === 0) return "";
    return `<tr>
      <td colspan="${colCount}" style="padding:3px 7px 6px 20px;background:#fffbeb;border-bottom:1px solid #e5e7eb">
        <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b45309;margin-right:8px">Edited after sign-off:</span>
        ${editHistory.map(h => `<span style="display:inline-block;margin-right:10px;font-size:9.5px;color:#92400e">${escHtml(String(h.note ?? ""))}</span>`).join("")}
      </td>
    </tr>`;
  };

  // Fermentation
  const fermRows = data.fermentation.map(r => `<tr>
    <td>${escHtml(r.start_date ? fmtDate(r.start_date) : "—")}${r.end_date ? ` → ${escHtml(fmtDate(r.end_date))}` : ""}</td>
    <td>${escHtml(r.wine_colour)}</td>
    <td>${escHtml(r.vessel_ref)}</td>
    <td>${escHtml(r.fermentation_type)}</td>
    <td>${escHtml(r.yeast_strain)}</td>
    <td style="text-align:right">${r.volume_litres != null ? parseFloat(String(r.volume_litres)).toFixed(0) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.so2_at_fermentation_mg_l != null ? `${parseFloat(String(r.so2_at_fermentation_mg_l)).toFixed(1)} mg/L` : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.end_ph != null ? parseFloat(String(r.end_ph)).toFixed(2) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.end_ta_gl != null ? parseFloat(String(r.end_ta_gl)).toFixed(1) : "—"}</td>
    <td>${escHtml(r.operator_name)}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
  </tr>${editHistoryPdfRow(r as Record<string, unknown>, 11)}`).join("");

  const fermHeader = `<tr class="header-row"><th>Period</th><th>Colour</th><th>Vessel</th><th>Type</th><th>Yeast</th><th style="text-align:right">Volume (L)</th><th style="text-align:right">SO₂ @ ferm.</th><th style="text-align:right">End pH</th><th style="text-align:right">End TA (g/L)</th><th>Operator</th><th>Batch Ref</th></tr>`;

  // Cellar ops — compute per-op running SO₂ totals in chronological order so the
  // "Running total" column shows how the cumulative estimate built up event-by-event.
  const cellarOpsChrono = [...data.cellarOps].sort((a, b) => String(a.op_date ?? "").localeCompare(String(b.op_date ?? "")));
  const { perOp: cellarPerOp } = cellarSo2RunningTotals(cellarOpsChrono);
  const runningByOp = new Map<Record<string, unknown>, { contributed: boolean; runningMgL: number | null }>();
  cellarOpsChrono.forEach((op, i) => runningByOp.set(op, cellarPerOp[i]));

  const cellarRows = data.cellarOps.map(r => {
    const isSulfiting = String(r.op_type) === "sulfiting";
    const running = runningByOp.get(r);
    const runningCell = isSulfiting && running?.contributed && running.runningMgL != null
      ? `≈ ${running.runningMgL.toFixed(1)} mg/L`
      : "—";
    const so2Detail = r.so2_quantity_g != null
      ? `${parseFloat(String(r.so2_quantity_g)).toFixed(1)} g${r.free_so2_before_mg_l != null ? ` (${parseFloat(String(r.free_so2_before_mg_l)).toFixed(1)} → ${r.free_so2_after_mg_l != null ? parseFloat(String(r.free_so2_after_mg_l)).toFixed(1) : "?"} mg/L)` : ""}`
      : "—";
    return `<tr${isSulfiting ? ' style="background:#fefce8"' : ""}>
    <td>${escHtml(fmtDate(r.op_date))}</td>
    <td>${escHtml(CELLAR_OP_LABELS[String(r.op_type)] ?? r.op_type)}</td>
    <td>${[r.from_vessel_ref, r.to_vessel_ref].filter(Boolean).map(escHtml).join(" → ")}</td>
    <td style="text-align:right">${r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)).toFixed(1) : "—"}</td>
    <td style="font-family:monospace">${isSulfiting ? so2Detail : "—"}</td>
    <td style="text-align:right;font-family:monospace">${runningCell}</td>
    <td>${escHtml(r.fining_agent)}</td>
    <td>${escHtml(r.operator_name)}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
  </tr>${editHistoryPdfRow(r as Record<string, unknown>, 9)}`;
  }).join("");

  const cellarHeader = `<tr class="header-row"><th>Date</th><th>Operation</th><th>Vessel(s)</th><th style="text-align:right">Volume (L)</th><th>SO₂ detail</th><th style="text-align:right">Running total after this op (cumulative mg/L)</th><th>Fining agent</th><th>Operator</th><th>Batch Ref</th></tr>`;

  // SO₂ tests
  const SO2_ORGANIC_LIMIT_NUMBERS = new Set(Object.values(ORGANIC_MAX_SO2).map(v => parseFloat(v)));
  let so2HasUnverifiedLimit = false;
  const so2Rows = data.so2Tests.map(r => {
    const compliant = r.so2_compliant === true || r.so2_compliant === "true" || r.so2_compliant === 1;
    const nonCompliant = r.so2_compliant === false || r.so2_compliant === "false" || r.so2_compliant === 0;
    const complianceStyle = nonCompliant ? ' style="color:#b91c1c;font-weight:600"' : (compliant ? ' style="color:#166534"' : "");
    const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
    const unverifiedLimit = !r.batch_ref && maxVal != null && SO2_ORGANIC_LIMIT_NUMBERS.has(maxVal);
    if (unverifiedLimit) so2HasUnverifiedLimit = true;
    return `<tr${unverifiedLimit ? ' style="background:#fffbeb"' : ""}>
    <td>${escHtml(fmtDate(r.test_date))}</td>
    <td>${escHtml(SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? r.test_stage)}</td>
    <td>${escHtml(r.vessel_ref)}</td>
    <td style="text-align:right;font-family:monospace">${r.free_so2_mg_l != null ? parseFloat(String(r.free_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.total_so2_mg_l != null ? parseFloat(String(r.total_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${maxVal != null ? maxVal.toFixed(0) : "—"}${unverifiedLimit ? '<br/><span style="color:#b45309;font-size:9px;white-space:nowrap">⚠ Limit unverified — no batch ref</span>' : ""}</td>
    <td${complianceStyle}>${nonCompliant ? "⚠ Exceeds limit" : compliant ? "✓ Compliant" : "—"}</td>
    <td>${escHtml(r.test_method)}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
  </tr>`;
  }).join("");

  const so2Header = `<tr class="header-row"><th>Date</th><th>Stage</th><th>Vessel</th><th style="text-align:right">Free SO₂ (mg/L)</th><th style="text-align:right">Total SO₂ (mg/L)</th><th style="text-align:right">Max permitted</th><th>Compliance</th><th>Method</th><th>Batch Ref</th></tr>`;

  // Bottling
  const bottlingRows = data.bottling.map(r => {
    const isOrg = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
    const colour = String(r.wine_colour ?? "");
    const ceiling = colour ? parseFloat(isOrg ? (ORGANIC_MAX_SO2[colour] ?? "") : (CONVENTIONAL_MAX_SO2[colour] ?? "")) : NaN;
    const totalSo2 = r.total_so2_mg_l != null ? parseFloat(String(r.total_so2_mg_l)) : null;
    const hasCompliance = totalSo2 != null && !isNaN(ceiling);
    const exceeds = hasCompliance && totalSo2! > ceiling;
    const complianceStyle = exceeds ? ' style="color:#b91c1c;font-weight:600"' : ' style="color:#166534"';
    const complianceText = hasCompliance ? (exceeds ? "⚠ Exceeds limit" : "✓ Compliant") : "—";
    return `<tr>
    <td>${escHtml(fmtDate(r.bottling_date))}</td>
    <td style="font-family:monospace">${escHtml(r.lot_code)}</td>
    <td>${escHtml(r.wine_colour)}</td>
    <td style="text-align:right">${r.volume_bottled_litres != null ? parseFloat(String(r.volume_bottled_litres)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${r.bottles_produced != null ? String(r.bottles_produced) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.free_so2_mg_l != null ? parseFloat(String(r.free_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${totalSo2 != null ? totalSo2.toFixed(1) : "—"}</td>
    <td style="text-align:right">${!isNaN(ceiling) ? `${ceiling.toFixed(0)} mg/L ${isOrg ? "organic" : "conventional"}` : "—"}</td>
    <td${hasCompliance ? complianceStyle : ""}>${complianceText}</td>
    <td style="text-align:right;font-family:monospace">${r.ph != null ? parseFloat(String(r.ph)).toFixed(2) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.titratable_acidity_gl != null ? parseFloat(String(r.titratable_acidity_gl)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${r.actual_abv_pct != null ? `${parseFloat(String(r.actual_abv_pct)).toFixed(1)}%` : "—"}</td>
    <td>${escHtml(r.closure_type)}</td>
    <td>${isOrg ? "Yes — organic" : "No — conventional"}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
  </tr>${editHistoryPdfRow(r as Record<string, unknown>, 15)}`;
  }).join("");

  // Per-stage attachment blocks — rendered under the stage's own table, styled
  // like the pressing attachments block. Omitted entirely when no record in the
  // stage has attachments; records are labelled with date + batch ref.
  const stageAttachmentsHtml = (records: Record<string, unknown>[], attMap: Map<number, TrailAttachment[]>, dateField: string) => {
    const blocks = records.map(r => {
      const files = r.id != null ? attMap.get(Number(r.id)) : undefined;
      if (!files || files.length === 0) return "";
      return `<div style="margin-bottom:5px">
        <p style="font-size:9px;font-weight:600;color:#374151;margin-bottom:2px">${escHtml(fmtDate(r[dateField]))} ${batchRefBadge(r)}</p>
        <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px">
          ${files.map(a => `<li style="font-size:10px;color:#374151;display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:14px;height:14px;background:#dbeafe;border-radius:2px;flex-shrink:0;text-align:center;line-height:14px;font-size:9px;color:#1e40af">📎</span>
            <span style="font-family:monospace">${escHtml(String(a.fileName ?? ""))}</span>
            <span style="color:#9ca3af;font-size:9px">${a.uploadedAt ? fmtDate(a.uploadedAt) : ""}</span>
          </li>`).join("")}
        </ul>
      </div>`;
    }).filter(Boolean).join("");
    if (!blocks) return "";
    return `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;margin-top:-14px;margin-bottom:20px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:5px">Attachments</p>
      ${blocks}
    </div>`;
  };
  const fermAttachmentsHtml = stageAttachmentsHtml(data.fermentation, fermAttachments, "start_date");
  const cellarAttachmentsHtml = stageAttachmentsHtml(data.cellarOps, cellarAttachments, "op_date");
  const so2AttachmentsHtml = stageAttachmentsHtml(data.so2Tests, so2Attachments, "test_date");
  const bottlingAttachmentsHtml = stageAttachmentsHtml(data.bottling, bottlingAttachments, "bottling_date");

  const bottlingHeader = `<tr class="header-row"><th>Date</th><th>Lot Code</th><th>Colour</th><th style="text-align:right">Volume (L)</th><th style="text-align:right">Bottles</th><th style="text-align:right">Free SO₂ (mg/L)</th><th style="text-align:right">Total SO₂ (mg/L)</th><th style="text-align:right">SO₂ ceiling</th><th>Compliance</th><th style="text-align:right">pH</th><th style="text-align:right">TA (g/L)</th><th style="text-align:right">ABV</th><th>Closure</th><th>Organic limits</th><th>Batch Ref</th></tr>`;

  const docTitle = isVintageScoped && vintage
    ? `Full Vintage Trail — Vintage ${escHtml(vintage)} — ${escHtml(farmName)}`
    : `Batch Trail — ${escHtml(batchRef)} — ${escHtml(farmName)}`;

  const coverTitle = isVintageScoped && vintage
    ? `Full Vintage Trail — Vintage ${escHtml(vintage)}`
    : "Batch Trail Report";

  const vintageScopeNote = isVintageScoped && vintage ? `
<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:9px 13px;margin-bottom:14px;display:flex;align-items:flex-start;gap:8px">
  <span style="font-size:15px;line-height:1">ℹ️</span>
  <div>
    <p style="font-size:11px;font-weight:700;color:#1e40af;margin-bottom:2px">Full-vintage view — Vintage ${escHtml(vintage)}</p>
    <p style="font-size:10px;color:#374151">This document covers <strong>all winery records for the entire ${escHtml(vintage)} vintage</strong>, not a single batch. All pressing records, fermentation runs, cellar operations, SO₂ tests, and bottling runs for this vintage year are included. Batch references are shown on each row where available.</p>
  </div>
</div>` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${docTitle}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; padding: 20px 28px; }
  h1 { font-size: 17px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 10px; margin-bottom: 14px; }
  .meta span { margin-right: 14px; }
  .section { margin-bottom: 20px; }
  h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
       color: #374151; border-bottom: 2px solid #d1d5db; padding-bottom: 4px; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; text-align: left; padding: 5px 7px; font-size: 10px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.03em; }
  td { padding: 5px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr.header-row th { border-bottom: 1px solid #d1d5db; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 16mm 14mm; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>${coverTitle}</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  ${isVintageScoped && vintage ? `<span>Vintage: <strong>${escHtml(vintage)}</strong></span>` : `<span>Batch ref: <strong>${escHtml(batchRef)}</strong></span>${vintage ? `<span>Vintage: <strong>${escHtml(vintage)}</strong></span>` : ""}`}
  ${(pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1) ? `<span style="color:#166534;font-weight:600">🌿 Organic batch — reduced SO₂ ceilings apply</span>` : ""}
  <span>Printed: ${escHtml(printedOn)}</span>
</p>
${vintageScopeNote}
${vintageComparisonHtml}
${so2SummaryHtml}
${phTaHistoryHtml}
${pressingBlockHtml}
${fermRows ? sectionHtml("2. Fermentation", fermHeader + fermRows) : ""}
${fermAttachmentsHtml}
${cellarRows ? sectionHtml("3. Cellar operations", cellarHeader + cellarRows) : ""}
${cellarAttachmentsHtml}
${so2Rows ? sectionHtml("4. SO₂ tests", so2Header + so2Rows) : ""}
${so2Rows && so2HasUnverifiedLimit ? `<p style="font-size:9px;color:#b45309;margin:2px 0 8px">⚠ Limit unverified — one or more SO₂ tests carry an organic ceiling but have no batch reference, so the applicable limit cannot be verified against a batch record.</p>` : ""}
${so2AttachmentsHtml}
${bottlingRows ? sectionHtml("5. Bottling runs", bottlingHeader + bottlingRows) : ""}
${bottlingAttachmentsHtml}

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the records contained in this batch trail report are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p class="footer">Generated by BDE Farm Trac · ${escHtml(printedOn)} · Batch: ${escHtml(batchRef)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Additions Report — Print helper ─────────────────────────────────────────
function escHtml(v: unknown): string {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const SOURCE_LABELS: Record<string, string> = { pressing: "Pressing", fermentation: "Fermentation", cellar: "Cellar" };

// Most-common SO₂ unit per vintage, weighted by record count, computed only for
// vintages that mix units. Single source of truth for the on-screen amber unit
// badges, the printed PDF outlier markers, and the CSV "Unit Differs" column —
// all three use this exact map so they can never disagree.
function computeSo2DominantUnitByVintage(rows: Record<string, unknown>[]): { mixedVintages: string[]; dominantUnitByVintage: Map<string, string> } {
  const byVintage = new Map<string, Map<string, number>>();
  rows.filter(r => r.category === "so2").forEach(r => {
    const v = String(r.vintage_year ?? "?");
    const u = String(r.unit ?? "");
    const n = Math.max(1, parseInt(String(r.batch_count ?? "1"), 10) || 1);
    if (!byVintage.has(v)) byVintage.set(v, new Map());
    const counts = byVintage.get(v)!;
    counts.set(u, (counts.get(u) ?? 0) + n);
  });
  const mixedVintages: string[] = [];
  const dominantUnitByVintage = new Map<string, string>();
  byVintage.forEach((counts, v) => {
    if (counts.size > 1) {
      mixedVintages.push(v);
      let best = ""; let bestN = -1;
      counts.forEach((n, u) => { if (n > bestN) { bestN = n; best = u; } });
      dominantUnitByVintage.set(v, best);
    }
  });
  return { mixedVintages: mixedVintages.sort(), dominantUnitByVintage };
}

// Shared unit-outlier test for a summary row (SO₂ row whose unit differs from
// the vintage's most common unit — only defined within mixed-unit vintages).
function so2UnitOutlierDominant(row: Record<string, unknown>, dominantUnitByVintage: Map<string, string>): string | undefined {
  if (row.category !== "so2") return undefined;
  const dominant = dominantUnitByVintage.get(String(row.vintage_year ?? "?"));
  if (!dominant || String(row.unit ?? "") === dominant) return undefined;
  return dominant;
}

function printAdditionsReport(
  rows: Record<string, unknown>[],
  farmName: string,
  vintageLabel: string,
  auditSig?: string | null,
  signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null },
) {
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeSig = sanitiseSignatureForHtml(auditSig);
  const showVintage = rows.length > 0 && rows.some((r, i) => i > 0 && r.vintage_year !== rows[0].vintage_year);

  // Detect mixed SO₂ units per vintage — totals are meaningless when mg/kg and mg/L are combined
  const so2UnitsByVintage = new Map<string, Set<string>>();
  rows.filter(r => r.category === "so2").forEach(r => {
    const v = String(r.vintage_year ?? "?");
    const u = String(r.unit ?? "");
    if (!so2UnitsByVintage.has(v)) so2UnitsByVintage.set(v, new Set());
    so2UnitsByVintage.get(v)!.add(u);
  });
  const mixedUnitVintages = Array.from(so2UnitsByVintage.entries())
    .filter(([, units]) => units.size > 1)
    .map(([v]) => v)
    .sort();
  const hasMixedSo2Units = mixedUnitVintages.length > 0;
  // Unit-outlier flag — same computation as the on-screen amber unit badges
  const { dominantUnitByVintage } = computeSo2DominantUnitByVintage(rows);
  let hasUnitOutliers = false;
  const mixedUnitsNotice = hasMixedSo2Units
    ? `<div style="margin-bottom:14px;padding:10px 14px;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;display:flex;align-items:flex-start;gap:10px">
  <span style="font-size:16px;line-height:1.2">⚠</span>
  <div>
    <strong style="color:#92400e;font-size:12px">Mixed SO₂ units detected${mixedUnitVintages.length === 1 ? ` — vintage ${escHtml(mixedUnitVintages[0])}` : `: vintages ${mixedUnitVintages.map(escHtml).join(", ")}`}</strong>
    <p style="color:#78350f;font-size:11px;margin-top:3px">This report contains SO₂ / KMS records measured in both <strong>mg/kg</strong> (at pressing) and <strong>mg/L</strong> (post-fermentation / cellar). Total and average dose figures combine different units and <strong>cannot be compared or summed</strong>. Use the per-row <em>Unit</em> column to interpret each figure individually.</p>
  </div>
</div>`
    : "";

  const tableRows = rows.map(row => {
    const avgDose = parseFloat(String(row.avg_dose ?? 0));
    const wineColour = String(row.wine_colour ?? "");
    // Use the per-colour organic limit when the colour is known; fall back to 90 (most conservative)
    const organicLimit = parseInt(ORGANIC_MAX_SO2[wineColour] ?? "90", 10);
    const warnConv  = row.category === "so2"          && avgDose > 200;
    const warnOrg   = row.category === "so2"          && !warnConv && avgDose > organicLimit;
    const warnAsc   = row.category === "ascorbic_acid" && avgDose > 250;
    const rowStyle  = warnConv ? 'style="background:#fee2e2"'
                    : (warnOrg || warnAsc) ? 'style="background:#fef3c7"' : "";

    // limitCell contains only trusted static text + escaped unit
    // (unit value comes from the shared PRESS_ADDITIVE_COLUMNS definition)
    const unitEsc = escHtml(ADDITIVE_COL.unit.pdfValue(row) || "mg/kg");
    const outlierDominant = so2UnitOutlierDominant(row, dominantUnitByVintage);
    if (outlierDominant) hasUnitOutliers = true;
    const unitCell = outlierDominant
      ? `<span style="color:#92400e;font-weight:600">${unitEsc} *</span><br /><span style="color:#92400e;font-size:9px">unit differs — most records for this vintage use ${escHtml(outlierDominant)}</span>`
      : unitEsc;
    let limitCell = "";
    if (warnConv)      limitCell = `<span style="color:#b91c1c;font-weight:600">⚠ Avg exceeds conv. max (200 ${unitEsc})</span>`;
    else if (warnOrg)  limitCell = `<span style="color:#92400e">⚠ Avg exceeds organic limit (${organicLimit} ${unitEsc})</span>`;
    else if (warnAsc)  limitCell = `<span style="color:#b91c1c;font-weight:600">⚠ Avg exceeds max (250 mg/L)</span>`;
    else if (row.category === "so2")          limitCell = `Conv. max 200 ${unitEsc} · Organic ${organicLimit}`;
    else if (row.category === "ascorbic_acid") limitCell = "Max 250 mg/L";

    const vintageCell = showVintage ? `<td>${escHtml(row.vintage_year ?? "—")}</td>` : "";
    const colourBadge = wineColour
      ? `<span style="display:inline-block;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#f3e8ff;color:#6b21a8">${escHtml(wineColour)}</span>`
      : `<span style="color:#9ca3af">—</span>`;
    const src = String(row.source ?? "pressing");
    const sourceLabel = SOURCE_LABELS[src] ?? src;
    const sourceBadgeStyle = src === "pressing"
      ? 'background:#ede9fe;color:#5b21b6'
      : src === "fermentation"
      ? 'background:#dbeafe;color:#1d4ed8'
      : 'background:#d1fae5;color:#065f46';
    const sourceBadge = `<span style="display:inline-block;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;${sourceBadgeStyle}">${escHtml(sourceLabel)}</span>`;
    return `<tr ${rowStyle}>
      <td style="font-weight:500">${escHtml(ADDITIVE_COL.additive_name.pdfValue(row))}</td>
      ${vintageCell}
      <td>${colourBadge}</td>
      <td>${sourceBadge}</td>
      <td style="text-align:right">${escHtml(row.batch_count)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.total_dose ?? 0)).toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${avgDose.toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.min_dose ?? 0)).toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.max_dose ?? 0)).toFixed(1)}</td>
      <td style="color:#6b7280;font-size:11px">${unitCell}</td>
      <td style="font-size:11px">${limitCell}</td>
    </tr>`;
  }).join("");

  const vintageHeader = showVintage ? "<th>Vintage</th>" : "";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Additive Usage Report — ${escHtml(farmName)} — ${escHtml(vintageLabel)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 11px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #d1d5db; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .legend { margin-top: 16px; font-size: 10px; color: #6b7280; }
  .legend span { margin-right: 14px; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 18mm 16mm; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>Additive Usage Report</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Vintage: <strong>${escHtml(vintageLabel)}</strong></span>
  <span>Printed: ${escHtml(printedOn)}</span>
  <span>${rows.length} additive row${rows.length !== 1 ? "s" : ""}</span>
  <span>Covers: pressing, fermentation &amp; cellar SO₂</span>
</p>
${mixedUnitsNotice}<table>
  <thead><tr>
    <th>Additive</th>
    ${vintageHeader}
    <th>Wine Colour</th>
    <th>Stage</th>
    <th style="text-align:right">Records</th>
    <th style="text-align:right">Total dose</th>
    <th style="text-align:right">Avg / record</th>
    <th style="text-align:right">Min</th>
    <th style="text-align:right">Max</th>
    <th>Unit</th>
    <th>Limit reference</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
${rows.some(r => r.category === "so2") ? `<div style="margin-top:12px;padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:6px;font-size:10px;color:#6b7280;page-break-inside:avoid">
  <p style="font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#374151;margin-bottom:4px">SO₂ total limits (mg/L total SO₂)</p>
  <p style="margin-bottom:2px"><strong style="color:#15803d">🌿 Organic</strong> &nbsp; Red <strong style="color:#111">100</strong> · White / Rosé / Orange <strong style="color:#111">150</strong> · Sparkling <strong style="color:#111">185</strong></p>
  <p style="margin-bottom:2px"><strong style="color:#374151">Conventional</strong> &nbsp; Red <strong style="color:#111">150</strong> · White / Rosé / Orange <strong style="color:#111">200</strong> · Sparkling <strong style="color:#111">235</strong></p>
  <p style="color:#9ca3af">UK-retained Reg 2019/934 (organic) · Reg 1308/2013 Annex VIII Part B (conventional). Limits are for <em>total</em> SO₂ across the wine's life (mg/L). Individual doses above are recorded in stage-specific units — pressing mg/kg · fermentation mg/L · cellar g — see each row's Unit column.</p>
</div>` : ""}
<p class="legend">
  <span style="color:#b91c1c">⚠ Red = average dose exceeds conventional maximum</span>
  <span style="color:#92400e">⚠ Amber = average dose exceeds organic limit (per-colour: Red 100 · White/Rosé/Orange 150 · Sparkling 185 mg/kg)</span>
  <span>Source: EU Reg 2019/934 (UK-retained law)</span>
  <span>SO₂ units vary by stage: pressing mg/kg · fermentation mg/L · cellar g</span>
  ${hasUnitOutliers ? `<span style="color:#92400e">* Unit differs from the most common SO₂ unit used for that vintage</span>` : ""}
</p>

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the additive usage records contained in this report are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p style="margin-top:20px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px">Generated by BDE Farm Trac · ${escHtml(printedOn)} · Vintage: ${escHtml(vintageLabel)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Pressing Report — Print helper ──────────────────────────────────────────
function printPressingReport(rows: Record<string, unknown>[], farmName: string, vintageLabel: string, allAdditions: Record<string, unknown>[] = [], auditSig?: string | null, signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null }) {
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeSig = sanitiseSignatureForHtml(auditSig);
  const COL_COUNT = 16;

  const tableRows = rows.map(r => {
    const isOrganic = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
    const organicBadge = isOrganic
      ? `<span style="display:inline-block;padding:1px 5px;border-radius:9999px;font-size:9px;font-weight:600;background:#dcfce7;color:#166534;margin-left:4px">Organic</span>`
      : "";
    const additions = allAdditions.filter(a => a.pressing_record_id === r.id);
    const additionsRow = additions.length > 0
      ? `<tr class="additions-row">
          <td colspan="${COL_COUNT}" style="padding:3px 7px 6px 20px;background:#f9fafb;border-bottom:1px solid #e5e7eb">
            <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-right:8px">Additives:</span>
            ${additions.map(a => {
              // Values come from the shared PRESS_ADDITIVE_COLUMNS definitions
              const dose = a.dose === "" ? "" : ADDITIVE_COL.dose.csvValue(a);
              const unit = ADDITIVE_COL.unit.pdfValue(a);
              const notes = ADDITIVE_COL.notes.pdfValue(a);
              return `<span style="display:inline-block;margin-right:10px;font-size:9.5px;color:#374151">
                <strong>${escHtml(ADDITIVE_COL.additive_name.pdfValue(a))}</strong>&thinsp;${escHtml(dose)}${escHtml(unit ? "\u202f" + unit : "")}${notes ? `&ensp;<span style="color:#9ca3af">${escHtml(notes)}</span>` : ""}
              </span>`;
            }).join("")}
          </td>
        </tr>`
      : "";
    const editHistory = Array.isArray(r.edit_history) ? (r.edit_history as Record<string, unknown>[]) : [];
    const editHistoryRow = editHistory.length > 0
      ? `<tr class="additions-row">
          <td colspan="${COL_COUNT}" style="padding:3px 7px 6px 20px;background:#fffbeb;border-bottom:1px solid #e5e7eb">
            <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b45309;margin-right:8px">Edited after sign-off:</span>
            ${editHistory.map(h =>
              `<span style="display:inline-block;margin-right:10px;font-size:9.5px;color:#92400e">${escHtml(String(h.note ?? ""))}</span>`
            ).join("")}
          </td>
        </tr>`
      : "";
    return `<tr>
      <td style="white-space:nowrap">${escHtml(r.press_date ? new Date(r.press_date as string).toLocaleDateString("en-GB") : "—")}</td>
      <td>${escHtml(r.vintage_year ?? "—")}</td>
      <td style="font-family:monospace;font-size:10px">${escHtml(r.batch_ref ?? "—")}${organicBadge}</td>
      <td>${escHtml(r.press_type ?? "—")}</td>
      <td style="text-align:right;font-family:monospace">${r.grapes_pressed_kg != null && r.grapes_pressed_kg !== "" ? parseFloat(String(r.grapes_pressed_kg)).toFixed(0) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.free_run_litres != null && r.free_run_litres !== "" ? parseFloat(String(r.free_run_litres)).toFixed(1) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.press_wine_litres != null && r.press_wine_litres !== "" ? parseFloat(String(r.press_wine_litres)).toFixed(1) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.total_juice_litres != null && r.total_juice_litres !== "" ? parseFloat(String(r.total_juice_litres)).toFixed(1) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.press_efficiency_l_per_kg != null && r.press_efficiency_l_per_kg !== "" ? parseFloat(String(r.press_efficiency_l_per_kg)).toFixed(3) : "—"}</td>
      <td style="text-align:right">${r.juice_brix != null && r.juice_brix !== "" ? parseFloat(String(r.juice_brix)).toFixed(1) : "—"}</td>
      <td style="text-align:right">${r.juice_ph != null && r.juice_ph !== "" ? parseFloat(String(r.juice_ph)).toFixed(2) : "—"}</td>
      <td style="text-align:right">${r.juice_ta_gl != null && r.juice_ta_gl !== "" ? parseFloat(String(r.juice_ta_gl)).toFixed(1) : "—"}</td>
      <td>${escHtml(r.juice_turbidity ?? "—")}</td>
      <td>${escHtml(r.operator_name ?? "—")}</td>
      <td>${escHtml(r.settling_method ?? "—")}</td>
      <td style="font-size:10px;color:#6b7280">${escHtml(r.notes ?? "")}</td>
    </tr>${additionsRow}${editHistoryRow}`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Pressing Report — ${escHtml(farmName)} — ${escHtml(vintageLabel)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 7px; font-size: 10px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #d1d5db; white-space: nowrap; }
  td { padding: 5px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 18mm 14mm; size: landscape; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>Pressing Report</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Vintage: <strong>${escHtml(vintageLabel)}</strong></span>
  <span>Printed: ${escHtml(printedOn)}</span>
  <span>${rows.length} record${rows.length !== 1 ? "s" : ""}</span>
</p>
<table>
  <thead><tr>
    <th>Date</th>
    <th>Vintage</th>
    <th>Batch Ref</th>
    <th>Press Type</th>
    <th style="text-align:right">Grapes (kg)</th>
    <th style="text-align:right">Free Run (L)</th>
    <th style="text-align:right">Press Wine (L)</th>
    <th style="text-align:right">Total Juice (L)</th>
    <th style="text-align:right">L/kg</th>
    <th style="text-align:right">Brix °</th>
    <th style="text-align:right">pH</th>
    <th style="text-align:right">TA (g/L)</th>
    <th>Turbidity</th>
    <th>Operator</th>
    <th>Settling</th>
    <th>Notes</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the pressing records contained in this report are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p style="margin-top:20px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px">Generated by BDE Farm Trac · ${escHtml(printedOn)} · Vintage: ${escHtml(vintageLabel)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── SO₂ Transaction Log — Print helper ──────────────────────────────────────
function printSo2TransactionLog(
  rows: Record<string, unknown>[],
  farmName: string,
  scopeLabel: string,
  auditSig?: string | null,
  signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null },
) {
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeSig = sanitiseSignatureForHtml(auditSig);

  const tableRows = rows.map(r => {
    const src = String(r.source ?? "pressing");
    const stageLabel = SOURCE_LABELS[src] ?? src;
    // Dose/unit formatting comes from the shared PRESS_ADDITIVE_COLUMNS definitions
    const dosePdf = ADDITIVE_COL.dose.pdfValue(r);
    const doseVal = dosePdf === "—" || r.dose === ""
      ? "—"
      : `${dosePdf} ${escHtml(ADDITIVE_COL.unit.pdfValue(r))}`;
    // Dose rate (mg/L) — cellar sulfiting rows only; mirrors on-screen table and CSV export
    let doseRateVal = "—";
    if (r.source === "cellar" && r.so2_quantity_g != null) {
      const g = parseFloat(String(r.so2_quantity_g));
      if (!isNaN(g)) {
        const capacity = r.vessel_capacity_litres != null ? parseFloat(String(r.vessel_capacity_litres)) : NaN;
        const moved = r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)) : NaN;
        if (!isNaN(capacity) && capacity > 0) doseRateVal = `${((g * 1000) / capacity).toFixed(1)}&nbsp;<span style="color:#6b7280">V</span>`;
        else if (!isNaN(moved) && moved > 0) doseRateVal = `${((g * 1000) / moved).toFixed(1)}&nbsp;<span style="color:#6b7280">M</span>`;
      }
    }
    return `<tr>
      <td style="white-space:nowrap">${escHtml(r.record_date ? new Date(r.record_date as string).toLocaleDateString("en-GB") : "—")}</td>
      <td style="font-family:monospace;font-size:10px">${escHtml(r.batch_ref ?? "—")}</td>
      <td>${escHtml(r.wine_colour ?? "—")}</td>
      <td>${escHtml(r.vintage_year ?? "—")}</td>
      <td>${escHtml(stageLabel)}</td>
      <td>${escHtml(ADDITIVE_COL.additive_name.pdfValue(r) || "—")}</td>
      <td style="text-align:right;font-family:monospace">${doseVal}</td>
      <td style="text-align:right;font-family:monospace">${doseRateVal}</td>
      <td>${escHtml(r.operator_name ?? "—")}</td>
      <td>${escHtml(r.vessel_ref ?? "—")}</td>
      <td style="font-size:10px;color:#6b7280">${escHtml(ADDITIVE_COL.notes.pdfValue(r))}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>SO₂ Transaction Log — ${escHtml(farmName)} — ${escHtml(scopeLabel)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 10px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #d1d5db; white-space: nowrap; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 18mm 14mm; size: landscape; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>SO₂ &amp; Additive Transaction Log</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Scope: <strong>${escHtml(scopeLabel)}</strong></span>
  <span>Printed: ${escHtml(printedOn)}</span>
  <span>${rows.length} row${rows.length !== 1 ? "s" : ""}</span>
</p>
<table>
  <thead><tr>
    <th>Date</th>
    <th>Batch Ref</th>
    <th>Wine Colour</th>
    <th>Vintage</th>
    <th>Stage</th>
    <th>Additive</th>
    <th style="text-align:right">Dose</th>
    <th style="text-align:right">Dose Rate (mg/L)*</th>
    <th>Operator</th>
    <th>Vessel</th>
    <th>Notes</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<p style="margin-top:6px;font-size:9px;color:#6b7280">* Dose Rate (mg/L) is estimated for cellar sulfiting rows only: <strong>V</strong> = based on vessel capacity, <strong>M</strong> = based on volume moved.</p>

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the SO₂ and additive records contained in this transaction log are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p style="margin-top:20px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px">Generated by BDE Farm Trac · ${escHtml(printedOn)} · ${escHtml(scopeLabel)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Pressing Records Tab ─────────────────────────────────────────────────────
export function PressingRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-pressing", "winery-pressing");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: equipment = [] } = useEquipment(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const batchSettings = useWineryBatchSettings(farmId);
  const { toast } = useToast();
  const { data: farmsData } = useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmName: string = (Array.isArray(farmsData?.farms)
    ? (farmsData.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const pressingYearFilterKey = `pressing-year-filter-${farmId}`;
  const [yearFilter, setYearFilterRaw] = useState(() => {
    try { return localStorage.getItem(`pressing-year-filter-${farmId}`) ?? String(new Date().getFullYear()); } catch { return String(new Date().getFullYear()); }
  });
  const setYearFilter = (v: string) => { try { localStorage.setItem(pressingYearFilterKey, v); } catch { /**/ } setYearFilterRaw(v); };
  const [pressingSearch, setPressingSearch] = useState("");
  const [pressingNonCompliantOnly, setPressingNonCompliantOnly] = useState(false);
  const [signedFilter, setSignedFilter] = useState<"all" | "signed" | "unsigned">("all");
  const pressingSortKey = `pressing-sort-${farmId}`;
  const PRESSING_SORT_COLS = ["date", "batch_ref", "grapes_pressed_kg", "total_juice_litres", "press_efficiency_l_per_kg", "juice_brix", "juice_ph", "juice_turbidity"] as const;
  type PressingSort = typeof PRESSING_SORT_COLS[number];
  const [pressingSortCol, setPressingSortColRaw] = useState<PressingSort>(() => {
    try { const v = localStorage.getItem(`pressing-sort-${farmId}-col`); return (PRESSING_SORT_COLS as readonly string[]).includes(v ?? "") ? v as PressingSort : "date"; } catch { return "date"; }
  });
  const [pressingSortDir, setPressingSortDirRaw] = useState<"asc" | "desc">(() => {
    try { const v = localStorage.getItem(`pressing-sort-${farmId}-dir`); return v === "asc" ? "asc" : "desc"; } catch { return "desc"; }
  });
  // Re-sync when farmId changes (component may stay mounted across farm switches)
  useEffect(() => {
    try {
      const col = localStorage.getItem(`${pressingSortKey}-col`);
      setPressingSortColRaw((PRESSING_SORT_COLS as readonly string[]).includes(col ?? "") ? col as PressingSort : "date");
      const dir = localStorage.getItem(`${pressingSortKey}-dir`);
      setPressingSortDirRaw(dir === "asc" ? "asc" : "desc");
      setYearFilterRaw(localStorage.getItem(pressingYearFilterKey) ?? String(new Date().getFullYear()));
    } catch { /**/ }
  }, [pressingSortKey, pressingYearFilterKey]);
  const setPressingSortCol = (col: PressingSort) => { try { localStorage.setItem(`${pressingSortKey}-col`, col); } catch { /**/ } setPressingSortColRaw(col); };
  const setPressingSortDir = (dir: "asc" | "desc") => { try { localStorage.setItem(`${pressingSortKey}-dir`, dir); } catch { /**/ } setPressingSortDirRaw(dir); };
  const [pressTypeOther, setPressTypeOther] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [additionsRows, setAdditionsRows] = useState<AdditionRow[]>([]);
  const [batchRefError, setBatchRefError] = useState<string | null>(null);
  const addRowCounter = useRef(0);
  const [showReport, setShowReport] = useState(false);
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  // Consume a pending cross-tab "view additions" request (from a Fermentation /
  // Cellar Ops / Bottling row shortcut). The parent page switches to this tab,
  // which mounts the component — this effect then applies the stored scope and
  // opens the report. One-shot: the key is removed once consumed.
  useEffect(() => {
    const consume = () => {
      try {
        const raw = sessionStorage.getItem(additionsShortcutKey(farmId));
        if (!raw) return;
        sessionStorage.removeItem(additionsShortcutKey(farmId));
        const scope = JSON.parse(raw) as { batchRef?: string; vintageYear?: string | null };
        if (scope.vintageYear) setYearFilter(String(scope.vintageYear));
        setTxLogBatchFilter(String(scope.batchRef ?? ""));
        setShowReport(true);
      } catch { /* corrupt/unavailable storage — ignore */ }
    };
    consume(); // handle the tab-switch mount
    // Also handle the already-on-pressing-tab case, where no remount occurs
    window.addEventListener(WINERY_VIEW_ADDITIONS_EVENT, consume);
    return () => window.removeEventListener(WINERY_VIEW_ADDITIONS_EVENT, consume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);
  // Category & colour filters persist across visits (localStorage), mirroring
  // the summarySort pattern below. Corrupt or legacy stored values are ignored.
  const [categoryFilter, setCategoryFilterState] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("winery-additions-summary-category-filter");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((c): c is string => typeof c === "string" && c in ADDITIVE_CATEGORY_LABELS);
          return new Set(valid);
        }
      }
    } catch { /* ignore corrupt saved value */ }
    return new Set();
  });
  const setCategoryFilter = (updater: React.SetStateAction<Set<string>>) => {
    setCategoryFilterState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("winery-additions-summary-category-filter", JSON.stringify([...next])); } catch { /* storage unavailable */ }
      return next;
    });
  };
  const [colourFilter, setColourFilterState] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("winery-additions-summary-colour-filter");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed === null || (typeof parsed === "string" && WINE_COLOUR_OPTIONS.includes(parsed))) return parsed;
      }
    } catch { /* ignore corrupt saved value */ }
    return null;
  });
  const setColourFilter = (updater: React.SetStateAction<string | null>) => {
    setColourFilterState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("winery-additions-summary-colour-filter", JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  };
  // Name search persists across visits too (localStorage), completing the
  // fully-restored view alongside the category/colour filters and sort.
  const [nameSearch, setNameSearchState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("winery-additions-summary-name-search");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "string") return parsed;
      }
    } catch { /* ignore corrupt saved value */ }
    return "";
  });
  const setNameSearch = (updater: React.SetStateAction<string>) => {
    setNameSearchState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("winery-additions-summary-name-search", JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  };
  const [summarySort, setSummarySortState] = useState<{ col: "additive" | "vintage" | "total_dose" | "avg_dose" | "batch_count"; dir: "asc" | "desc" }>(() => {
    try {
      const saved = localStorage.getItem("winery-additions-summary-sort");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["additive", "vintage", "total_dose", "avg_dose", "batch_count"].includes(parsed?.col) && ["asc", "desc"].includes(parsed?.dir)) {
          return { col: parsed.col, dir: parsed.dir };
        }
      }
    } catch { /* ignore corrupt saved value */ }
    return { col: "additive", dir: "asc" };
  });
  const setSummarySort = (updater: React.SetStateAction<{ col: "additive" | "vintage" | "total_dose" | "avg_dose" | "batch_count"; dir: "asc" | "desc" }>) => {
    setSummarySortState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("winery-additions-summary-sort", JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  };
  const [txLogBatchFilter, setTxLogBatchFilter] = useState("");
  const [signedConfirmRecord, setSignedConfirmRecord] = useState<Record<string, unknown> | null>(null);
  const { data: additionsSummary = [] } = useAdditionsSummary(farmId);
  const { data: allAdditions = [] } = useAllPressAdditions(farmId);
  const sf = (k: string, v: string | boolean) => {
    if (k === "batchRef") setBatchRefError(null);
    setForm(f => ({ ...f, [k]: v }));
  };
  const ssf = (k: string, v: string) => setSettingsForm(f => ({ ...f, [k]: v }));

  // Fetch existing additions when editing a pressing record
  const { data: fetchedAdditions } = useQuery<AdditionRow[]>({
    queryKey: ["winery-pressing-additions", farmId, editing],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/${editing}/additions`), { credentials: "include" });
      const d = await r.json();
      return (d.additions ?? []).map((a: Record<string, unknown>) => ({
        tempId: ++addRowCounter.current,
        id: a.id as number,
        additiveName: String(a.additive_name ?? ""),
        category: String(a.category ?? "other"),
        dose: String(a.dose ?? ""),
        unit: String(a.unit ?? "mg/kg"),
        notes: String(a.notes ?? ""),
      }));
    },
    enabled: editing !== null && open,
    staleTime: 0,
  });
  useEffect(() => {
    if (open && editing !== null && fetchedAdditions) setAdditionsRows(fetchedAdditions);
  }, [fetchedAdditions, open, editing]);

  // Fetch additions for the view dialog
  const { data: viewAdditions } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-additions-view", farmId, view?.id],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/${view!.id}/additions`), { credentials: "include" });
      const d = await r.json();
      return d.additions ?? [];
    },
    enabled: !!view?.id,
    staleTime: 0,
  });

  const freeRun = parseFloat(String(form.freeRunLitres || "0"));
  const press = parseFloat(String(form.pressWineLitres || "0"));
  const total = !isNaN(freeRun) && !isNaN(press) && (freeRun > 0 || press > 0) ? freeRun + press : null;
  const gPressed = parseFloat(String(form.grapesPressedKg || "0"));
  const efficiency = total !== null && gPressed > 0 ? (total / gPressed).toFixed(3) : null;
  const freeRunSep = form.freeRunSeparated !== "false" && form.freeRunSeparated !== false;
  const batchIsOrganicFlag = form.isOrganic === true || form.isOrganic === "true";

  // Compute whether any addition row breaches its applicable hard limit (used to block Save).
  const hasBlockingAdditionError = additionsRows.some(row => {
    const def = PERMITTED_ADDITIVES.find(a => a.name === row.additiveName);
    if (!def || !row.unit) return false;
    const doseVal = parseFloat(row.dose);
    if (isNaN(doseVal)) return false;
    if (batchIsOrganicFlag) {
      const orgMax = def.organicMaxPerUnit?.[row.unit];
      return orgMax !== undefined && doseVal > orgMax;
    }
    const convMax = def.maxPerUnit?.[row.unit];
    return convMax !== undefined && doseVal > convMax;
  });

  // Count of additive entries per pressing record, for the row badge
  const additionCounts = useMemo(() => {
    const m = new Map<number, number>();
    for (const a of allAdditions) {
      const id = Number(a.pressing_record_id);
      if (!Number.isFinite(id)) continue;
      m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [allAdditions]);

  // Pressing records where any recorded additive exceeds its applicable ceiling
  // (organic limit for organic batches, conventional max otherwise). Purely cosmetic row highlight.
  const nonCompliantPressingIds = useMemo(() => {
    const ids = new Set<number>();
    for (const a of allAdditions) {
      const def = PERMITTED_ADDITIVES.find(x => x.name === String(a.additive_name));
      if (!def) continue;
      const unit = String(a.unit ?? "");
      const doseVal = parseFloat(String(a.dose));
      if (!unit || isNaN(doseVal)) continue;
      const rec = crud.data.find(r => r.id === a.pressing_record_id);
      const isOrg = rec ? (rec.is_organic === true || rec.is_organic === "true" || rec.is_organic === 1) : false;
      const limit = isOrg ? (def.organicMaxPerUnit?.[unit] ?? def.maxPerUnit?.[unit]) : def.maxPerUnit?.[unit];
      if (limit !== undefined && doseVal > limit) ids.add(a.pressing_record_id as number);
    }
    return ids;
  }, [allAdditions, crud.data]);

  // Instruments that could be used for juice analysis
  const analysisEquipmentList = equipment.filter(e =>
    ["refractometer", "ph-meter", "hydrometer", "ripper-burette", "enzymatic-analyser", "ao-apparatus"].includes(String(e.equipment_type))
  );
  const activeVessels = vessels.filter(v => String(v.status) === "active");

  const KNOWN_PRESS_TYPES = PRESS_TYPE_OPTIONS.slice(0, -1); // all except "Other"

  const openAdd = () => {
    setEditing(null);
    setForm({ pressDate: today, vintageYear: String(new Date().getFullYear()), freeRunSeparated: "true" });
    setPressTypeOther(false);
    setAdditionsRows([]);
    setBatchRefError(null);
    setOpen(true);
  };
  const doOpenEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setPressTypeOther(!!r.press_type && !KNOWN_PRESS_TYPES.includes(String(r.press_type)));
    setOpen(true);
  };
  const openEdit = (r: Record<string, unknown>) => {
    if (r.audit_signature) {
      setSignedConfirmRecord(r);
    } else {
      doOpenEdit(r);
    }
  };
  const save = async () => {
    setBatchRefError(null);
    const payload = { ...form, totalJuiceLitres: total != null ? String(total) : form.totalJuiceLitres, pressEfficiencyLPerKg: efficiency ?? form.pressEfficiencyLPerKg };
    let pressingId: number;
    if (editing !== null) {
      try {
        await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      } catch (err) {
        const e = err as Error & { code?: string };
        if (e.code === "DUPLICATE_BATCH_REF") {
          setBatchRefError(e.message);
        } else {
          toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
        }
        return;
      }
      pressingId = editing;
    } else {
      let result: unknown;
      try {
        result = await crud.add.mutateAsync(payload);
      } catch (err) {
        const e = err as Error & { code?: string };
        if (e.code === "DUPLICATE_BATCH_REF") {
          setBatchRefError(e.message);
        } else {
          toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
        }
        return;
      }
      pressingId = (result as { record: { id: number } }).record?.id;
      // Switch immediately into edit mode so that if the additions save below fails,
      // retrying Save updates this record rather than creating a duplicate.
      setEditing(pressingId);
    }
    // Sync structured additions (batch replace) — check response and surface errors
    const validRows = additionsRows.filter(r => r.additiveName);
    const addRes = await fetch(api(`farms/${farmId}/winery-pressing/${pressingId}/additions/batch`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ additions: validRows }),
    });
    if (!addRes.ok) {
      const e = await addRes.json().catch(() => ({}));
      toast({ title: "Additions not saved", description: String(e.error || "Failed to save additions — please check dose limits and try again."), variant: "destructive" });
      return;
    }
    toast({ title: "Saved" }); setOpen(false);
  };
  const openSettings = () => {
    const s = batchSettings.data?.settings ?? {};
    setSettingsForm({
      prefix: String(s.prefix ?? "PRESS"),
      yearFormat: String(s.year_format ?? "YYYY"),
      paddingDigits: String(s.padding_digits ?? "3"),
      nextSequence: String(s.next_sequence ?? "1"),
    });
    setSettingsOpen(true);
  };
  const saveSettings = async () => {
    try {
      await batchSettings.save.mutateAsync({
        prefix: settingsForm.prefix || "PRESS",
        yearFormat: settingsForm.yearFormat,
        paddingDigits: parseInt(settingsForm.paddingDigits || "3", 10),
        nextSequence: parseInt(settingsForm.nextSequence || "1", 10),
      });
      toast({ title: "Batch settings saved" });
      setSettingsOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filteredByYear = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const filteredBySearch = pressingSearch.trim() === ""
    ? filteredByYear
    : filteredByYear.filter(r => {
        const q = pressingSearch.trim().toLowerCase();
        return String(r.batch_ref ?? "").toLowerCase().includes(q)
          || String(r.press_date ?? "").toLowerCase().includes(q);
      });
  const filteredBySigned = signedFilter === "all"
    ? filteredBySearch
    : filteredBySearch.filter(r => {
        const isSigned = r.audit_signature != null && r.audit_signature !== "";
        return signedFilter === "signed" ? isSigned : !isSigned;
      });
  // Outstanding sign-offs across the current vintage filter (independent of
  // search / signed-status filters, so the header count reflects the whole log)
  const unsignedCount = useMemo(
    () => filteredByYear.filter(r => r.audit_signature == null || r.audit_signature === "").length,
    [filteredByYear],
  );
  const togglePressSort = (col: PressingSort) => {
    if (pressingSortCol === col) {
      setPressingSortDir(pressingSortDir === "asc" ? "desc" : "asc");
    } else {
      setPressingSortCol(col);
      // Numeric columns default desc (largest first); text columns default to their natural direction
      setPressingSortDir(col === "grapes_pressed_kg" || col === "total_juice_litres" || col === "press_efficiency_l_per_kg" || col === "juice_brix" || col === "juice_ph" ? "desc" : col === "date" ? "desc" : "asc");
    }
  };
  const TURBIDITY_ORDER: Record<string, number> = { "Clear": 0, "Slightly turbid": 1, "Turbid": 2 };
  const filtered = [...filteredBySigned].sort((a, b) => {
    let cmp = 0;
    if (pressingSortCol === "grapes_pressed_kg" || pressingSortCol === "total_juice_litres" || pressingSortCol === "press_efficiency_l_per_kg" || pressingSortCol === "juice_brix" || pressingSortCol === "juice_ph") {
      const an = parseFloat(String(a[pressingSortCol] ?? ""));
      const bn = parseFloat(String(b[pressingSortCol] ?? ""));
      const aNull = isNaN(an), bNull = isNaN(bn);
      // Keep missing values last regardless of sort direction. These returns
      // exit the comparator immediately and are NEVER negated below.
      if (aNull && bNull) return 0;
      if (aNull) return 1;   // nulls always last
      if (bNull) return -1;  // nulls always last
      // Direction applied here directly — only when both values are numeric.
      return pressingSortDir === "asc" ? an - bn : bn - an;
    } else if (pressingSortCol === "juice_turbidity") {
      const av = String(a.juice_turbidity ?? "");
      const bv = String(b.juice_turbidity ?? "");
      const aIdx = av in TURBIDITY_ORDER ? TURBIDITY_ORDER[av] : 99;
      const bIdx = bv in TURBIDITY_ORDER ? TURBIDITY_ORDER[bv] : 99;
      cmp = aIdx - bIdx;
    } else {
      const av = pressingSortCol === "date" ? String(a.press_date ?? "") : String(a.batch_ref ?? "");
      const bv = pressingSortCol === "date" ? String(b.press_date ?? "") : String(b.batch_ref ?? "");
      cmp = av.localeCompare(bv);
    }
    return pressingSortDir === "asc" ? cmp : -cmp;
  });

  // Non-compliant filter (mirrors the bottling register's toggle): count reflects
  // the current vintage/search/sign-off filters; toggle narrows the table to breaches.
  const pressingNonCompliantCount = filtered.filter(r => nonCompliantPressingIds.has(r.id as number)).length;
  const displayedPressings = pressingNonCompliantOnly ? filtered.filter(r => nonCompliantPressingIds.has(r.id as number)) : filtered;

  // Mirrors the embed decision made in the Print button's click handler: the PDF
  // embeds the digital signature only when scoped to a single vintage and every
  // visible record is signed by the same person. Kept in sync so the indicator
  // never promises an embedded signature the PDF won't actually contain.
  const willEmbedSignature = useMemo(() => {
    if (yearFilter === "all" || filtered.length === 0) return false;
    if (!filtered.every(r => r.audit_signature != null && r.audit_signature !== "")) return false;
    const firstSigner = String(filtered[0].audit_signer_name ?? "");
    return filtered.every(r => String(r.audit_signer_name ?? "") === firstSigner);
  }, [yearFilter, filtered]);

  // ── Additions Report derived data ────────────────────────────────────────────
  const filteredSummary = yearFilter === "all" ? additionsSummary : additionsSummary.filter(r => String(r.vintage_year) === yearFilter);
  // Category filter: empty set = show all
  const availableCategories = Array.from(new Set(filteredSummary.map(r => String(r.category ?? "other")))).filter(Boolean);
  const categoryFilteredSummary = categoryFilter.size === 0
    ? filteredSummary
    : filteredSummary.filter(r => categoryFilter.has(String(r.category ?? "other")));
  // Wine colour filter
  const availableColours = Array.from(new Set(filteredSummary.map(r => String(r.wine_colour ?? "")).filter(Boolean))).sort();
  const colourFilteredSummary = colourFilter === null
    ? categoryFilteredSummary
    : categoryFilteredSummary.filter(r => String(r.wine_colour ?? "") === colourFilter);
  const searchFilteredSummaryUnsorted = nameSearch.trim() === ""
    ? colourFilteredSummary
    : colourFilteredSummary.filter(r =>
        String(r.additive_name ?? "").toLowerCase().includes(nameSearch.trim().toLowerCase())
      );
  // Sort the summary table by the user-selected column (default: additive → vintage → colour)
  const searchFilteredSummary = [...searchFilteredSummaryUnsorted].sort((a, b) => {
    const dir = summarySort.dir === "asc" ? 1 : -1;
    if (summarySort.col === "total_dose" || summarySort.col === "avg_dose" || summarySort.col === "batch_count") {
      const key = summarySort.col;
      const diff = parseFloat(String(a[key] ?? 0)) - parseFloat(String(b[key] ?? 0));
      if (diff !== 0) return diff * dir;
      // Secondary: additive name then vintage
      const n = String(a.additive_name ?? "").localeCompare(String(b.additive_name ?? ""));
      if (n !== 0) return n;
      return String(a.vintage_year ?? "").localeCompare(String(b.vintage_year ?? ""));
    }
    if (summarySort.col === "vintage") {
      const vinCmp = String(a.vintage_year ?? "").localeCompare(String(b.vintage_year ?? ""));
      if (vinCmp !== 0) return vinCmp * dir;
      // Secondary: additive name then colour
      const n = String(a.additive_name ?? "").localeCompare(String(b.additive_name ?? ""));
      if (n !== 0) return n;
      return String(a.wine_colour ?? "").localeCompare(String(b.wine_colour ?? ""));
    }
    // Default: additive → vintage → colour
    const nameCmp = String(a.additive_name ?? "").localeCompare(String(b.additive_name ?? ""));
    if (nameCmp !== 0) return nameCmp * dir;
    const vinA = String(a.vintage_year ?? "");
    const vinB = String(b.vintage_year ?? "");
    if (vinA !== vinB) return vinA.localeCompare(vinB);
    return String(a.wine_colour ?? "").localeCompare(String(b.wine_colour ?? ""));
  });
  // Detect mixed SO₂ units in the currently-visible summary rows so the on-screen
  // table can show a banner before the user reaches the export step.
  const { mixedVintages: summaryMixedUnitVintages, dominantUnitByVintage: summaryDominantUnitByVintage } =
    computeSo2DominantUnitByVintage(searchFilteredSummary);

  // Mirrors the signedPress embed decision inside the Additions Report Print button's
  // click handler: signature embeds only when scoped to a single vintage, every visible
  // summary row derives from the pressing stage, and every pressing record in that
  // vintage is signed by the same person. Kept in exact sync so the ShieldCheck
  // indicator never promises an embedded signature the PDF won't actually contain.
  const additionsWillEmbedSignature = (() => {
    if (yearFilter === "all" || searchFilteredSummary.length === 0) return false;
    const allRowsPressing = searchFilteredSummary.every(r =>
      String(r.source ?? "pressing") === "pressing" && String(r.vintage_year ?? "") === yearFilter);
    if (!allRowsPressing) return false;
    const vintagePressings = crud.data.filter((r: Record<string, unknown>) => String(r.vintage_year ?? "") === yearFilter);
    const allSigned = vintagePressings.length > 0 && vintagePressings.every((r: Record<string, unknown>) => r.audit_signature != null && r.audit_signature !== "");
    if (!allSigned) return false;
    const firstSigner = String(vintagePressings[0].audit_signer_name ?? "");
    return vintagePressings.every((r: Record<string, unknown>) => String(r.audit_signer_name ?? "") === firstSigner);
  })();

  const showSo2Chart = categoryFilter.size === 0 || categoryFilter.has("so2");
  // Scope the chart to the active wine colour filter so the graph matches the table below it
  const so2ChartSourceRows = additionsSummary.filter(r =>
    r.category === "so2" && (colourFilter === null || String(r.wine_colour ?? "") === colourFilter)
  );
  const so2ByVintage = new Map<string, number>();
  so2ChartSourceRows.forEach(r => {
    const v = String(r.vintage_year ?? "?");
    so2ByVintage.set(v, (so2ByVintage.get(v) ?? 0) + parseFloat(String(r.total_dose ?? 0)));
  });
  const so2ChartData = Array.from(so2ByVintage.entries()).map(([vintage, total]) => ({ vintage, total })).sort((a, b) => a.vintage.localeCompare(b.vintage));
  // Detect mixed units across SO₂ rows — if any vintage combines mg/kg and mg/L the totals are meaningless
  const so2UnitsByVintage = new Map<string, Set<string>>();
  so2ChartSourceRows.forEach(r => {
    const v = String(r.vintage_year ?? "?");
    const u = String(r.unit ?? "");
    if (!so2UnitsByVintage.has(v)) so2UnitsByVintage.set(v, new Set());
    so2UnitsByVintage.get(v)!.add(u);
  });
  const so2MixedUnits = Array.from(so2UnitsByVintage.values()).some(units => units.size > 1);
  const summaryCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    // Additive/category/unit come from the shared PRESS_ADDITIVE_COLUMNS definitions
    additiveCsvCol("additive_name"),
    additiveCsvCol("category"),
    { key: "wine_colour", label: "Wine Colour" },
    { key: "source", label: "Stage", fmt: (r: Record<string, unknown>) => SOURCE_LABELS[String(r.source ?? "pressing")] ?? String(r.source ?? "pressing") },
    additiveCsvCol("unit"),
    // Matches the on-screen amber unit badge and the PDF's "*" marker — same
    // dominant-unit map (computeSo2DominantUnitByVintage) drives all three.
    { key: "unit_outlier", label: "Unit Differs From Vintage", fmt: (r: Record<string, unknown>) => {
      const dominant = so2UnitOutlierDominant(r, summaryDominantUnitByVintage);
      return dominant ? `Yes — most records for this vintage use ${dominant}` : "";
    }},
    { key: "batch_count", label: "Records" },
    { key: "total_dose", label: "Total Dose" },
    { key: "avg_dose", label: "Avg Dose per Record" },
    { key: "min_dose", label: "Min Dose" },
    { key: "max_dose", label: "Max Dose" },
  ];

  const transactionLogCsvCols = [
    { key: "source", label: "Source", fmt: (r: Record<string, unknown>) => SOURCE_LABELS[String(r.source ?? "pressing")] ?? String(r.source ?? "pressing") },
    { key: "vintage_year", label: "Vintage" },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "wine_colour", label: "Wine Colour" },
    { key: "record_date", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.record_date) },
    { key: "operator_name", label: "Operator" },
    { key: "vessel_ref", label: "Vessel" },
    // Additive columns come from the shared PRESS_ADDITIVE_COLUMNS definitions
    additiveCsvCol("additive_name"),
    additiveCsvCol("category"),
    additiveCsvCol("dose"),
    additiveCsvCol("unit"),
    { key: "dose_rate_mg_l", label: "Dose Rate (mg/L)", fmt: (r: Record<string, unknown>) => {
      // Only compute for cellar sulfiting rows with so2_quantity_g
      if (r.source !== "cellar" || r.so2_quantity_g == null) return "";
      const g = parseFloat(String(r.so2_quantity_g));
      if (isNaN(g)) return "";
      const capacity = r.vessel_capacity_litres != null ? parseFloat(String(r.vessel_capacity_litres)) : NaN;
      if (!isNaN(capacity) && capacity > 0) return ((g * 1000) / capacity).toFixed(1);
      const moved = r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)) : NaN;
      if (!isNaN(moved) && moved > 0) return ((g * 1000) / moved).toFixed(1);
      return "";
    }},
    { key: "volume_basis", label: "Volume basis", fmt: (r: Record<string, unknown>) => {
      if (r.source !== "cellar" || r.so2_quantity_g == null) return "";
      const capacity = r.vessel_capacity_litres != null ? parseFloat(String(r.vessel_capacity_litres)) : NaN;
      if (!isNaN(capacity) && capacity > 0) return "Vessel capacity";
      const moved = r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)) : NaN;
      if (!isNaN(moved) && moved > 0) return "Volume moved";
      return "";
    }},
    additiveCsvCol("notes"),
  ];

  const filteredTransactionLog = (yearFilter === "all"
    ? allAdditions
    : allAdditions.filter((r: Record<string, unknown>) => String(r.vintage_year) === yearFilter)
  ).filter((r: Record<string, unknown>) =>
    txLogBatchFilter.trim() === "" || String(r.batch_ref ?? "").toLowerCase().includes(txLogBatchFilter.trim().toLowerCase())
  );

  // Exact-match pressing record for the sign-off badge
  const txLogExactMatch = txLogBatchFilter.trim()
    ? (crud.data.find((r: Record<string, unknown>) =>
        String(r.batch_ref ?? "").toLowerCase() === txLogBatchFilter.trim().toLowerCase()
      ) ?? null)
    : null;
  // Mirrors the Transaction Log PDF button's embed decision: the signature embeds when
  // the batch-ref filter exactly matches a signed pressing record (same lookup as
  // txLogExactMatch above and matchingPress inside the click handler).
  const txLogWillEmbedSignature = txLogExactMatch != null && txLogExactMatch.audit_signature != null && txLogExactMatch.audit_signature !== "";

  const pressCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "press_date", label: "Press Date", fmt: (r: Record<string, unknown>) => fmtDate(r.press_date) },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "is_organic", label: "Certified Organic", fmt: (r: Record<string, unknown>) => (r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) ? "Yes" : "No" },
    { key: "operator_name", label: "Operator" },
    { key: "settling_method", label: "Settling Method" },
    { key: "juice_turbidity", label: "Juice Turbidity" },
    { key: "notes", label: "Notes" },
    { key: "press_type", label: "Press Type" },
    { key: "grapes_pressed_kg", label: "Grapes Pressed (kg)" },
    { key: "free_run_litres", label: "Free Run (L)" },
    { key: "press_wine_litres", label: "Press Wine (L)" },
    { key: "total_juice_litres", label: "Total Juice (L)" },
    { key: "press_efficiency_l_per_kg", label: "Efficiency (L/kg)" },
    { key: "juice_brix", label: "Brix °" },
    { key: "juice_ph", label: "pH" },
    { key: "juice_ta_gl", label: "TA (g/L)" },
    { key: "juice_analysis_source", label: "Analysis Source" },
    { key: "settling_vessel", label: "Settling Vessel" },
    { key: "additions_at_press", label: "Additions (legacy text)" },
    { key: "structured_additions", label: "Structured Additions", fmt: (r: Record<string, unknown>) => {
      const rows = allAdditions.filter((a: Record<string, unknown>) => a.pressing_record_id === r.id);
      if (!rows.length) return "";
      return rows.map((a: Record<string, unknown>) => `${String(a.additive_name)}: ${String(a.dose ?? "")}${a.unit ? ` ${String(a.unit)}` : ""}${a.notes ? ` (${String(a.notes)})` : ""}`).join("; ");
    }},
    // Mirrors the on-screen "N additions" badge (count of additive entries per pressing record)
    { key: "additions_count", label: "Additions", fmt: (r: Record<string, unknown>) => String(additionCounts.get(Number(r.id)) ?? 0) },
    // Sign-off columns — mirror the on-screen Sign-off badge (signed = audit_signature present)
    { key: "audit_signature", label: "Signed", fmt: (r: Record<string, unknown>) => (r.audit_signature != null && r.audit_signature !== "") ? "Yes" : "No" },
    { key: "audit_signer_name", label: "Signer Name" },
    { key: "audit_signer_role", label: "Signer Role" },
    { key: "audit_signer_date", label: "Signed At", fmt: (r: Record<string, unknown>) => {
      // Prefer the auditor-declared declaration date; fall back to the digital signature timestamp.
      if (r.audit_signer_date) {
        const s = String(r.audit_signer_date);
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        // Date-only values are parsed as local calendar dates to avoid UTC day-shift.
        const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
        return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB");
      }
      if (r.audit_signed_at) return fmtDate(r.audit_signed_at);
      return "";
    }},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
            Pressing Records
            {unsignedCount > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
                title={`${unsignedCount} pressing record${unsignedCount === 1 ? "" : "s"} in the current vintage filter ${unsignedCount === 1 ? "has" : "have"} not been signed off — click to ${signedFilter === "unsigned" ? "show all records" : "show only unsigned records"}`}
                onClick={() => setSignedFilter(f => (f === "unsigned" ? "all" : "unsigned"))}
              >
                <PenLine className="w-3 h-3" />{unsignedCount} unsigned
              </button>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Log each pressing session — press type, grape weight in, juice yield, analysis, and settling method. One record per pressing run.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={openSettings}><Settings2 className="w-3.5 h-3.5 mr-1" />Batch Settings</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Press Record</Button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setNameSearch(""); setPressingSearch(""); setTxLogBatchFilter(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 text-xs pl-7 w-48"
            placeholder="Batch ref or date…"
            value={pressingSearch}
            onChange={e => setPressingSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted-foreground">Sign-off:</span>
        <Select value={signedFilter} onValueChange={v => setSignedFilter(v as "all" | "signed" | "unsigned")}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="signed">Signed only</SelectItem>
            <SelectItem value="unsigned">Unsigned only</SelectItem>
          </SelectContent>
        </Select>
        {pressingNonCompliantCount > 0 && (
          <Button
            size="sm"
            variant={pressingNonCompliantOnly ? "destructive" : "outline"}
            className={pressingNonCompliantOnly ? "h-8 text-xs" : "h-8 text-xs border-red-300 text-red-700 hover:bg-red-50"}
            onClick={() => setPressingNonCompliantOnly(v => !v)}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            {pressingNonCompliantOnly ? "Show all records" : `Non-compliant only (${pressingNonCompliantCount})`}
          </Button>
        )}
        <Button size="sm" variant={showReport ? "default" : "outline"} className="ml-auto" onClick={() => {
          const opening = !showReport;
          setShowReport(v => !v);
          if (opening && !txLogBatchFilter.trim()) {
            const batchCtx = trailRecord?.batch_ref ? String(trailRecord.batch_ref) : pressingSearch.trim();
            if (batchCtx) setTxLogBatchFilter(batchCtx);
          } else if (!opening) {
            setTxLogBatchFilter("");
          }
        }}><Beaker className="w-3.5 h-3.5 mr-1" />Additions Report</Button>
        <Button size="sm" variant="outline" onClick={() => {
          const vintageLabel = yearFilter === "all" ? "All vintages" : yearFilter;
          // Embed the digital signature only when scoped to a single vintage and all visible
          // records are signed by the same person. Multi-vintage or mixed-signer prints fall
          // back to blank sign-off lines so the PDF cannot be misconstrued as a signed audit
          // that spans a broader scope than the signer intended.
          const isSingleVintage = yearFilter !== "all";
          const allSigned = isSingleVintage && filtered.length > 0 && filtered.every(r => r.audit_signature != null && r.audit_signature !== "");
          const firstSigner = allSigned ? String(filtered[0].audit_signer_name ?? "") : "";
          const uniformSigner = allSigned && filtered.every(r => String(r.audit_signer_name ?? "") === firstSigner);
          const sharedSig = uniformSigner ? (filtered[0].audit_signature ? String(filtered[0].audit_signature) : null) : null;
          const sharedSignerInfo = uniformSigner && sharedSig ? {
            name: filtered[0].audit_signer_name ? String(filtered[0].audit_signer_name) : null,
            role: filtered[0].audit_signer_role ? String(filtered[0].audit_signer_role) : null,
            signedAt: filtered[0].audit_signed_at ? String(filtered[0].audit_signed_at) : null,
            signerDate: filtered[0].audit_signer_date ? String(filtered[0].audit_signer_date) : null,
          } : undefined;
          printPressingReport(filtered, farmName, vintageLabel, allAdditions, sharedSig, sharedSignerInfo);
        }} disabled={!filtered.length} title={willEmbedSignature ? "Signed — signature will be embedded" : undefined}>
          <Printer className="w-3.5 h-3.5 mr-1" />Print / Export PDF
          {willEmbedSignature && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
        </Button>
        <Button size="sm" variant="outline" onClick={() => {
          // Apply the active colour filter (from the Additions Report panel) to the exported
          // rows so the scope stated in the filename/header matches the file contents.
          const exportRows = colourFilter
            ? filtered.filter(r => String(r.wine_colour ?? "") === colourFilter)
            : filtered;
          const vintageSlug = yearFilter === "all" ? "all-vintages" : yearFilter;
          const colourSlug = colourFilter ? `-${colourFilter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}` : "";
          const filename = `pressing-report-${vintageSlug}${colourSlug}.csv`;
          const prefixLines = [
            `"Pressing Report — ${farmName.replace(/"/g, '""')}"`,
            `"Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}"`,
            `"Colour filter: ${colourFilter ? colourFilter.replace(/"/g, '""') : "All colours"}"`,
          ];
          exportCSV(exportRows, filename, pressCsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Gauge} title="No pressing records yet" sub="Add a record for each pressing run to track juice yield and composition." />
        : displayedPressings.length === 0 ? <EmptyState icon={CheckCircle2} title="No non-compliant records" sub="All pressing records in the current filter are within their additive limits." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground text-left group" onClick={() => togglePressSort("date")}>
                  Date
                  {pressingSortCol === "date"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground text-left group" onClick={() => togglePressSort("batch_ref")}>
                  Batch
                  {pressingSortCol === "batch_ref"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-left p-3 font-medium">Press Type</th>
              <th className="text-right p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground ml-auto group" onClick={() => togglePressSort("grapes_pressed_kg")}>
                  Pressed (kg)
                  {pressingSortCol === "grapes_pressed_kg"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-right p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground ml-auto group" onClick={() => togglePressSort("total_juice_litres")}>
                  Juice (L)
                  {pressingSortCol === "total_juice_litres"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-right p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground ml-auto group" onClick={() => togglePressSort("press_efficiency_l_per_kg")}>
                  L/kg
                  {pressingSortCol === "press_efficiency_l_per_kg"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-right p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground ml-auto group" onClick={() => togglePressSort("juice_brix")}>
                  Brix °
                  {pressingSortCol === "juice_brix"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-right p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground ml-auto group" onClick={() => togglePressSort("juice_ph")}>
                  pH
                  {pressingSortCol === "juice_ph"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button className="flex items-center gap-1 hover:text-foreground text-left group" onClick={() => togglePressSort("juice_turbidity")}>
                  Turbidity
                  {pressingSortCol === "juice_turbidity"
                    ? pressingSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    : <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />}
                </button>
              </th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="text-left p-3 font-medium">Sign-off</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {displayedPressings.map(r => (
                <tr key={String(r.id)} className={nonCompliantPressingIds.has(r.id as number) ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400" : "hover:bg-muted/20"}>
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.press_date)}</td>
                  <td className="p-3 font-mono text-xs">
                    {fmt(r.batch_ref)}
                    {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-sans"><Leaf className="w-3 h-3" />Organic</span>
                    )}
                    {(additionCounts.get(Number(r.id)) ?? 0) > 0 && (
                      <span
                        className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 font-sans whitespace-nowrap cursor-default"
                        title={`${additionCounts.get(Number(r.id))} chemical addition${additionCounts.get(Number(r.id)) === 1 ? "" : "s"} recorded for this pressing session`}
                      >
                        {additionCounts.get(Number(r.id))} addition{additionCounts.get(Number(r.id)) === 1 ? "" : "s"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{fmt(r.press_type)}</td>
                  <td className="p-3 text-right">{fmtNum(r.grapes_pressed_kg, 0)}</td>
                  <td className="p-3 text-right">{fmtNum(r.total_juice_litres, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.press_efficiency_l_per_kg, 3)}</td>
                  <td className="p-3 text-right">{fmtNum(r.juice_brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.juice_ph, 2)}</td>
                  <td className="p-3 text-left text-muted-foreground">{fmt(r.juice_turbidity)}</td>
                  <td className="p-3 text-left text-muted-foreground max-w-[8rem] lg:max-w-[11rem] xl:max-w-[14rem]">
                    {r.notes ? (
                      <span className="truncate block cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2" title={String(r.notes)}>
                        {String(r.notes).length > 120 ? `${String(r.notes).slice(0, 120)}…` : String(r.notes)}
                      </span>
                    ) : <span className="text-muted-foreground/50">—</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {r.audit_signature
                      ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 cursor-default"
                          title={signOffTooltip(r)}
                        >
                          <ShieldCheck className="w-3 h-3" />Signed
                        </span>
                      )
                      : <span className="text-xs text-muted-foreground/60">Unsigned</span>
                    }
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <BatchTrailButton batchRef={r.batch_ref} onClick={() => setTrailRecord(r)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 disabled:opacity-40" title={r.batch_ref ? `View additions for ${String(r.batch_ref)}` : "No batch reference — additions view unavailable"} disabled={!r.batch_ref} onClick={() => {
                      // Open the Additions Report pre-scoped to this row's batch ref and
                      // vintage year — same pre-fill behaviour as the batch trail dialog.
                      if (r.vintage_year != null && String(r.vintage_year) !== "") setYearFilter(String(r.vintage_year));
                      setTxLogBatchFilter(String(r.batch_ref ?? ""));
                      setShowReport(true);
                    }}><Beaker className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Signed-record edit confirmation ──────────────────────────────────── */}
      <Dialog open={!!signedConfirmRecord} onOpenChange={o => { if (!o) setSignedConfirmRecord(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              Signed Record
            </DialogTitle>
            <DialogDescription>
              This pressing record has been signed off. Editing it will not remove the existing signature, but the record will reflect your changes.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Edit anyway?</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSignedConfirmRecord(null)}>Cancel</Button>
            <Button onClick={() => { const r = signedConfirmRecord!; setSignedConfirmRecord(null); doOpenEdit(r); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Batch Trail Dialog ────────────────────────────────────────────────── */}
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmName}
          onClose={() => setTrailRecord(null)}
        />
      )}

      {/* ── Additions Report Panel ────────────────────────────────────────────── */}
      {showReport && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm flex items-center gap-1.5"><Beaker className="h-4 w-4 text-muted-foreground" />Additions Report</p>
              <p className="text-xs text-muted-foreground mt-0.5">Additive usage totals across pressing batches, fermentation records, and cellar sulfiting operations. SO₂ is captured at all three winemaking stages. Use the vintage filter above to scope results.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                const vintagePart = yearFilter === "all" ? "All vintages" : yearFilter;
                const scopeLabel = colourFilter !== null ? `${vintagePart} · ${colourFilter} wine` : vintagePart;
                // Embed the digital signature only when every printed row provably derives
                // from records the signature attests to: the report must be scoped to a
                // single vintage, every visible summary row must come from the pressing
                // stage (fermentation/cellar additions are not covered by pressing
                // sign-offs), and every pressing record in that vintage must be signed by
                // the same person. Narrowing filters (search/colour/category) only subset
                // that signed scope, so they remain safe; anything broader falls back to
                // blank sign-off lines — mirrors the other winery PDFs.
                let signedPress: Record<string, unknown> | null = null;
                if (yearFilter !== "all" && searchFilteredSummary.length > 0) {
                  const allRowsPressing = searchFilteredSummary.every(r =>
                    String(r.source ?? "pressing") === "pressing" && String(r.vintage_year ?? "") === yearFilter);
                  if (allRowsPressing) {
                    const vintagePressings = crud.data.filter((r: Record<string, unknown>) => String(r.vintage_year ?? "") === yearFilter);
                    const allSigned = vintagePressings.length > 0 && vintagePressings.every((r: Record<string, unknown>) => r.audit_signature != null && r.audit_signature !== "");
                    const firstSigner = allSigned ? String(vintagePressings[0].audit_signer_name ?? "") : "";
                    const uniformSigner = allSigned && vintagePressings.every((r: Record<string, unknown>) => String(r.audit_signer_name ?? "") === firstSigner);
                    if (uniformSigner) signedPress = vintagePressings[0];
                  }
                }
                const addSig = signedPress?.audit_signature ? String(signedPress.audit_signature) : null;
                const addSignerInfo = signedPress && addSig ? {
                  name: signedPress.audit_signer_name ? String(signedPress.audit_signer_name) : null,
                  role: signedPress.audit_signer_role ? String(signedPress.audit_signer_role) : null,
                  signedAt: signedPress.audit_signed_at ? String(signedPress.audit_signed_at) : null,
                  signerDate: signedPress.audit_signer_date ? String(signedPress.audit_signer_date) : null,
                } : undefined;
                printAdditionsReport(searchFilteredSummary, farmName, scopeLabel, addSig, addSignerInfo);
              }} disabled={!searchFilteredSummary.length} title={additionsWillEmbedSignature ? "Signed — signature will be embedded" : undefined}>
                <FileDown className="w-3.5 h-3.5 mr-1" />Print / Export PDF
                {additionsWillEmbedSignature && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                const summaryUnitsByVintage = new Map<string, Set<string>>();
                searchFilteredSummary.filter(r => r.category === "so2").forEach(r => {
                  const v = String(r.vintage_year ?? "?");
                  const u = String(r.unit ?? "");
                  if (!summaryUnitsByVintage.has(v)) summaryUnitsByVintage.set(v, new Set());
                  summaryUnitsByVintage.get(v)!.add(u);
                });
                const mixedUnitVintages = Array.from(summaryUnitsByVintage.entries())
                  .filter(([, units]) => units.size > 1)
                  .map(([v]) => v)
                  .sort();
                const prefixLines: string[] = [];
                if (mixedUnitVintages.length > 0) {
                  const vintageList = mixedUnitVintages.length === 1
                    ? `vintage ${mixedUnitVintages[0]}`
                    : `vintages ${mixedUnitVintages.join(", ")}`;
                  prefixLines.push(
                    `"WARNING: Mixed SO2 units detected — ${vintageList}","This export contains SO2 / KMS records measured in both mg/kg (at pressing) and mg/L (post-fermentation / cellar). The Total Dose column combines different units and CANNOT be compared or summed. Use the Unit column to interpret each row individually."`,
                  );
                }
                // SO₂ colour-limit legend — mirrors the on-screen legend and printed PDF,
                // so a downloaded CSV opened later is self-contained. Only added when
                // the exported data actually contains SO₂ rows.
                if (searchFilteredSummary.some(r => r.category === "so2")) {
                  prefixLines.push(
                    `"SO2 total limits (mg/kg) — Organic: Red 100 · White/Rosé/Orange 150 · Sparkling 185","Conventional: Red 150 · White/Rosé/Orange 200 · Sparkling 235","UK-retained Reg 2019/934 (organic) · Reg 1308/2013 Annex VIII Part B (conventional). Limits are for total SO2 across the wine's life."`,
                  );
                }
                const colourSlug = colourFilter !== null ? colourFilter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") : "";
                const filename = colourFilter !== null
                  ? `additions-report-${colourSlug}-${yearFilter}.csv`
                  : `pressing-additions-report-${yearFilter}.csv`;
                if (colourFilter !== null) {
                  const vintageLabel = yearFilter === "all" ? "All vintages" : `Vintage ${yearFilter}`;
                  const headerText = `Additive Usage Report — ${colourFilter} — ${vintageLabel} — ${farmName}`;
                  prefixLines.unshift(`"${headerText.replace(/"/g, '""')}"`);
                }
                exportCSV(searchFilteredSummary, filename, summaryCsvCols, prefixLines);
              }} disabled={!searchFilteredSummary.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export Summary CSV</Button>
              <Button size="sm" variant="outline" onClick={() => {
                const batchTrim = txLogBatchFilter.trim();
                const scope = batchTrim || (yearFilter === "all" ? "All vintages" : yearFilter);
                const matchingPress = batchTrim
                  ? crud.data.find((r: Record<string, unknown>) => String(r.batch_ref ?? "").toLowerCase() === batchTrim.toLowerCase())
                  : null;
                const sig = matchingPress?.audit_signature ? String(matchingPress.audit_signature) : null;
                const signerInfo = matchingPress ? {
                  name: matchingPress.audit_signer_name ? String(matchingPress.audit_signer_name) : null,
                  role: matchingPress.audit_signer_role ? String(matchingPress.audit_signer_role) : null,
                  signedAt: matchingPress.audit_signed_at ? String(matchingPress.audit_signed_at) : null,
                  signerDate: matchingPress.audit_signer_date ? String(matchingPress.audit_signer_date) : null,
                } : undefined;
                printSo2TransactionLog(filteredTransactionLog, farmName, scope, sig, signerInfo);
              }} disabled={!filteredTransactionLog.length} title={txLogWillEmbedSignature ? "Signed — signature will be embedded" : "Print the SO₂ transaction log as a PDF — embeds the batch's digital signature if one exists"}>
                <Printer className="w-3.5 h-3.5 mr-1" />Transaction Log PDF
                {txLogWillEmbedSignature && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                const suffix = txLogBatchFilter.trim() ? txLogBatchFilter.trim().replace(/[^a-zA-Z0-9_-]/g, "_") : yearFilter;
                // Detect mixed SO₂ units per vintage — same logic as the PDF notice
                const so2UnitsByVintage = new Map<string, Set<string>>();
                filteredTransactionLog.filter((r: Record<string, unknown>) => r.category === "so2").forEach((r: Record<string, unknown>) => {
                  const v = String(r.vintage_year ?? "?");
                  const u = String(r.unit ?? "");
                  if (!so2UnitsByVintage.has(v)) so2UnitsByVintage.set(v, new Set());
                  so2UnitsByVintage.get(v)!.add(u);
                });
                const mixedUnitVintages = Array.from(so2UnitsByVintage.entries())
                  .filter(([, units]) => units.size > 1)
                  .map(([v]) => v)
                  .sort();
                const prefixLines: string[] = [];
                if (mixedUnitVintages.length > 0) {
                  const vintageList = mixedUnitVintages.length === 1
                    ? `vintage ${mixedUnitVintages[0]}`
                    : `vintages ${mixedUnitVintages.join(", ")}`;
                  prefixLines.push(
                    `"WARNING: Mixed SO2 units detected — ${vintageList}","This export contains SO2 / KMS records measured in both mg/kg (at pressing) and mg/L (post-fermentation / cellar). The Dose column mixes different units and totals CANNOT be compared or summed. Use the Unit column to interpret each row individually."`,
                  );
                }
                exportCSV(filteredTransactionLog, `so2-transaction-log-${suffix}.csv`, transactionLogCsvCols, prefixLines);
              }} disabled={!filteredTransactionLog.length} title="Export every individual SO₂ and additive record from pressing, fermentation, and cellar as a flat transaction log"><FileDown className="w-3.5 h-3.5 mr-1" />Transaction Log CSV</Button>
            </div>
          </div>

          {/* Transaction log batch-ref filter */}
          <div className="flex items-center gap-2 pb-1 border-b">
            <span className="text-xs text-muted-foreground shrink-0">Transaction Log filter:</span>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={txLogBatchFilter}
                onChange={e => setTxLogBatchFilter(e.target.value)}
                placeholder="Batch ref (leave blank for all)…"
                className="h-7 pl-6 pr-2 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-400 w-56"
              />
            </div>
            {txLogBatchFilter.trim() && (
              <button onClick={() => setTxLogBatchFilter("")} className="text-xs text-muted-foreground hover:text-foreground underline shrink-0">Clear</button>
            )}
            {txLogExactMatch && (
              txLogExactMatch.audit_signature
                ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Signed — {txLogExactMatch.audit_signer_name ? String(txLogExactMatch.audit_signer_name) : ""}
                    {txLogExactMatch.audit_signed_at ? `, ${new Date(String(txLogExactMatch.audit_signed_at)).toLocaleDateString("en-GB")}` : ""}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    Not yet signed
                  </span>
                )
            )}
            <span className="text-xs text-muted-foreground ml-auto">{filteredTransactionLog.length} row{filteredTransactionLog.length !== 1 ? "s" : ""} in export</span>
          </div>

          {/* Category filter chips + name search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Name search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={nameSearch}
                onChange={e => setNameSearch(e.target.value)}
                placeholder="Search additive…"
                className="h-7 pl-6 pr-2 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-indigo-400 w-40"
              />
            </div>
            {availableCategories.length > 1 && (
              <>
                <span className="text-xs text-muted-foreground shrink-0">Category:</span>
                {availableCategories.map(cat => {
                  const active = categoryFilter.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(prev => {
                        const next = new Set(prev);
                        if (next.has(cat)) next.delete(cat); else next.add(cat);
                        return next;
                      })}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-background text-muted-foreground border-border hover:border-indigo-400 hover:text-indigo-700"
                      }`}
                    >
                      {ADDITIVE_CATEGORY_LABELS[cat] ?? cat}
                    </button>
                  );
                })}
                {(categoryFilter.size > 0 || colourFilter !== null) && (
                  <button
                    onClick={() => { setCategoryFilter(new Set()); setColourFilter(null); }}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </>
            )}
            {availableColours.length > 1 && (
              <>
                <span className="text-xs text-muted-foreground shrink-0">Colour:</span>
                {availableColours.map(colour => {
                  const active = colourFilter === colour;
                  return (
                    <button
                      key={colour}
                      onClick={() => setColourFilter(active ? null : colour)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-background text-muted-foreground border-border hover:border-purple-400 hover:text-purple-700"
                      }`}
                    >
                      {colour}
                    </button>
                  );
                })}
                {colourFilter !== null && categoryFilter.size === 0 && (
                  <button
                    onClick={() => setColourFilter(null)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </>
            )}
          </div>

          {/* SO₂ bar chart across vintages — only shown when there is data for >1 vintage */}
          {showSo2Chart && so2ChartData.length > 1 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">SO₂ / KMS — Total dose by vintage{colourFilter ? ` (${colourFilter})` : ""}</p>
              <p className="text-xs text-muted-foreground mb-2">Stacked total across all pressing batches per vintage. Units may differ between records — check individual rows below.</p>
              {(() => {
                const allFilteredOrganic = filtered.length > 0 && filtered.every(r => r.is_organic === true || r.is_organic === "true" || r.is_organic === 1);
                const anyFilteredOrganic = filtered.some(r => r.is_organic === true || r.is_organic === "true" || r.is_organic === 1);
                const showConvLine = !allFilteredOrganic;
                const showOrgLine = anyFilteredOrganic || !showConvLine;
                return (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={so2ChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="vintage" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: unknown) => [typeof v === "number" ? v.toFixed(1) : String(v), "Total dose"]} />
                        {showConvLine && <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="4 2" />}
                        {showOrgLine && <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 2" />}
                        <Bar dataKey="total" fill="#6366f1" radius={[3, 3, 0, 0]} name="Total SO₂ dose" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      {showConvLine && <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-red-500" />Conv. max 200 mg/kg</span>}
                      {showOrgLine && <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-amber-500" />{allFilteredOrganic ? "Organic limit 90 mg/kg" : "Organic limit 90 mg/kg (🌿 batches)"}</span>}
                    </p>
                  </>
                );
              })()}
              {so2MixedUnits && (
                <p className="mt-2 flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span><strong>Mixed units detected.</strong> Some SO₂ records for this vintage use mg/kg and others use mg/L — the stacked totals above are numerically meaningless and should not be compared directly. Check the rows below for per-record units.</span>
                </p>
              )}
            </div>
          )}

          {filteredSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No structured additions recorded{yearFilter !== "all" ? ` for ${yearFilter}` : ""}. Add additives when logging a press record.</p>
          ) : searchFilteredSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No rows match the current filters. Try a different additive name or clear the category filter.</p>
          ) : (
            <>
            {summaryMixedUnitVintages.length > 0 && (
              <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <span>
                  <strong>Mixed SO₂ units detected — {summaryMixedUnitVintages.length === 1 ? `vintage ${summaryMixedUnitVintages[0]}` : `vintages ${summaryMixedUnitVintages.join(", ")}`}.</strong>{" "}
                  This table contains SO₂ / KMS records measured in both <strong>mg/kg</strong> (at pressing) and <strong>mg/L</strong> (post-fermentation / cellar). The Total Dose column combines different units and <strong>cannot be compared or summed</strong> across rows. Check the Unit column to interpret each figure individually.
                </span>
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40"><tr>
                  <th className="text-left p-2.5 font-medium">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => setSummarySort(s => s.col === "additive" ? { col: "additive", dir: s.dir === "asc" ? "desc" : "asc" } : { col: "additive", dir: "asc" })}
                    >
                      Additive
                      {summarySort.col === "additive" ? (summarySort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  </th>
                  {yearFilter === "all" && (
                    <th className="text-left p-2.5 font-medium">
                      <button
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => setSummarySort(s => s.col === "vintage" ? { col: "vintage", dir: s.dir === "asc" ? "desc" : "asc" } : { col: "vintage", dir: "asc" })}
                      >
                        Vintage
                        {summarySort.col === "vintage" ? (summarySort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      </button>
                    </th>
                  )}
                  <th className="text-left p-2.5 font-medium">Wine Colour</th>
                  <th className="text-left p-2.5 font-medium">Stage</th>
                  <th className="text-right p-2.5 font-medium">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                      onClick={() => setSummarySort(s => s.col === "batch_count" ? { col: "batch_count", dir: s.dir === "asc" ? "desc" : "asc" } : { col: "batch_count", dir: "desc" })}
                    >
                      Records
                      {summarySort.col === "batch_count" ? (summarySort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-right p-2.5 font-medium">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                      onClick={() => setSummarySort(s => s.col === "total_dose" ? { col: "total_dose", dir: s.dir === "asc" ? "desc" : "asc" } : { col: "total_dose", dir: "desc" })}
                    >
                      Total dose
                      {summarySort.col === "total_dose" ? (summarySort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-right p-2.5 font-medium">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                      onClick={() => setSummarySort(s => s.col === "avg_dose" ? { col: "avg_dose", dir: s.dir === "asc" ? "desc" : "asc" } : { col: "avg_dose", dir: "desc" })}
                    >
                      Avg / record
                      {summarySort.col === "avg_dose" ? (summarySort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-right p-2.5 font-medium">Min</th>
                  <th className="text-right p-2.5 font-medium">Max</th>
                  <th className="text-left p-2.5 font-medium">Unit</th>
                  <th className="text-left p-2.5 font-medium">Limit reference</th>
                </tr></thead>

                <tbody className="divide-y">
                  {searchFilteredSummary.map((row, i) => {
                    const avgDose = parseFloat(String(row.avg_dose ?? 0));
                    const wineColour = String(row.wine_colour ?? "");
                    const organicSo2Limit = row.category === "so2"
                      ? parseFloat(ORGANIC_MAX_SO2[wineColour] ?? "90")
                      : 0;
                    const warnConventional = row.category === "so2" && avgDose > 200;
                    const warnOrganic = row.category === "so2" && !warnConventional && avgDose > organicSo2Limit;
                    const warnAscorbic = row.category === "ascorbic_acid" && avgDose > 250;
                    const hasWarn = warnConventional || warnOrganic || warnAscorbic;
                    const src = String(row.source ?? "pressing");
                    const stageBadgeClass = src === "pressing"
                      ? "bg-violet-100 text-violet-800"
                      : src === "fermentation"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800";
                    // Visual grouping: suppress repeated additive name for consecutive same-additive rows (only when sorted by additive)
                    const prevName = i > 0 ? String(searchFilteredSummary[i - 1].additive_name ?? "") : null;
                    const isGroupContinuation = summarySort.col === "additive" && prevName === String(row.additive_name ?? "");
                    const isGroupStart = summarySort.col === "additive" && i > 0 && !isGroupContinuation;
                    // Per-row unit-deviation flag: SO₂ row whose unit differs from the
                    // most common unit used for that vintage (only within mixed-unit vintages)
                    const rowUnit = String(row.unit ?? "");
                    const dominantUnit = row.category === "so2" ? summaryDominantUnitByVintage.get(String(row.vintage_year ?? "?")) : undefined;
                    const unitDeviates = !!dominantUnit && rowUnit !== dominantUnit;
                    const unitDeviationMsg = unitDeviates ? `This record uses ${rowUnit || "an unspecified unit"}; most records for this vintage use ${dominantUnit}` : undefined;
                    return (
                      <tr key={i} className={`${warnConventional ? "bg-red-50" : warnOrganic || warnAscorbic ? "bg-amber-50" : "hover:bg-muted/20"}${isGroupStart ? " border-t-2 border-t-muted" : ""}`}>
                        <td className="p-2.5 font-medium">
                          {isGroupContinuation
                            ? <span className="text-muted-foreground/50 text-xs pl-1">↳</span>
                            : String(row.additive_name)}
                        </td>
                        {yearFilter === "all" && <td className="p-2.5 text-muted-foreground">{String(row.vintage_year ?? "—")}</td>}
                        <td className="p-2.5">
                          {wineColour
                            ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">{wineColour}</span>
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageBadgeClass}`}>
                            {SOURCE_LABELS[src] ?? src}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">{String(row.batch_count)}</td>
                        <td className="p-2.5 text-right font-mono">{parseFloat(String(row.total_dose ?? 0)).toFixed(1)}</td>
                        <td className="p-2.5 text-right font-mono">{avgDose.toFixed(1)}</td>
                        <td className="p-2.5 text-right font-mono">{parseFloat(String(row.min_dose ?? 0)).toFixed(1)}</td>
                        <td className="p-2.5 text-right font-mono">{parseFloat(String(row.max_dose ?? 0)).toFixed(1)}</td>
                        <td className="p-2.5 text-xs">
                          {unitDeviates ? (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300"
                              title={unitDeviationMsg}
                              aria-label={unitDeviationMsg}
                            >
                              <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                              {rowUnit || "—"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{String(row.unit ?? "—")}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-xs">
                          {warnConventional && <span className="text-red-700 font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />Avg exceeds conv. max (200 {String(row.unit ?? "mg/kg")})</span>}
                          {warnOrganic && <span className="text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />Avg exceeds organic limit ({organicSo2Limit} {String(row.unit ?? "mg/kg")})</span>}
                          {warnAscorbic && <span className="text-red-700 font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />Avg exceeds max (250 mg/L)</span>}
                          {!hasWarn && row.category === "so2" && <span className="text-muted-foreground">{wineColour ? `Organic max ${organicSo2Limit} · conv. max 200 ${String(row.unit ?? "mg/kg")}` : `Conv. max 200 ${String(row.unit ?? "mg/kg")}`}</span>}
                          {!hasWarn && row.category === "ascorbic_acid" && <span className="text-muted-foreground">Max 250 mg/L</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── SO₂ colour-limit legend ──────────────────────────────────────── */}
            {searchFilteredSummary.some(r => r.category === "so2") && (
              <div className="mt-3 rounded-md border border-muted bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground/80 mb-1.5 uppercase tracking-wide">SO₂ total limits (mg/kg)</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <div>
                    <span className="font-semibold text-green-700">🌿 Organic</span>
                    <span className="ml-1.5">Red <strong className="text-foreground">100</strong> · White / Rosé / Orange <strong className="text-foreground">150</strong> · Sparkling <strong className="text-foreground">185</strong></span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground/70">Conventional</span>
                    <span className="ml-1.5">Red <strong className="text-foreground">150</strong> · White / Rosé / Orange <strong className="text-foreground">200</strong> · Sparkling <strong className="text-foreground">235</strong></span>
                  </div>
                </div>
                <p className="mt-1 text-muted-foreground/70">UK-retained Reg 2019/934 (organic) · Reg 1308/2013 Annex VIII Part B (conventional). Limits are for <em>total</em> SO₂ across the wine's life.</p>
              </div>
            )}
            </>
          )}

          {/* ── Transaction Log individual rows ────────────────────────────────── */}
          {filteredTransactionLog.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t pt-3 mt-1">Transaction Log — individual records</p>
              <p className="text-xs text-muted-foreground mb-2">Every individual addition row included in the Transaction Log CSV and PDF. Wine Colour is drawn from the batch record.</p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40"><tr>
                    <th className="text-left p-2.5 font-medium whitespace-nowrap">Date</th>
                    <th className="text-left p-2.5 font-medium whitespace-nowrap">Batch Ref</th>
                    {yearFilter === "all" && <th className="text-left p-2.5 font-medium">Vintage</th>}
                    <th className="text-left p-2.5 font-medium whitespace-nowrap">Wine Colour</th>
                    <th className="text-left p-2.5 font-medium">Stage</th>
                    <th className="text-left p-2.5 font-medium">Additive</th>
                    <th className="text-right p-2.5 font-medium">Dose</th>
                    <th className="text-left p-2.5 font-medium">Unit</th>
                    <th className="text-right p-2.5 font-medium whitespace-nowrap">Dose Rate</th>
                    <th className="text-left p-2.5 font-medium">Operator</th>
                    <th className="text-left p-2.5 font-medium">Vessel</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {filteredTransactionLog.map((row: Record<string, unknown>, i: number) => {
                      const src = String(row.source ?? "pressing");
                      const stageBadgeClass = src === "pressing"
                        ? "bg-violet-100 text-violet-800"
                        : src === "fermentation"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800";
                      const rowColour = row.wine_colour ? String(row.wine_colour) : null;

                      // Dose rate calculation — cellar sulfiting rows only
                      let txDoseRateMgL: number | null = null;
                      let txVolumeBasis: "vessel" | "volume_moved" | null = null;
                      if (src === "cellar" && row.so2_quantity_g != null) {
                        const g = parseFloat(String(row.so2_quantity_g));
                        if (!isNaN(g)) {
                          const capacity = row.vessel_capacity_litres != null ? parseFloat(String(row.vessel_capacity_litres)) : NaN;
                          if (!isNaN(capacity) && capacity > 0) {
                            txDoseRateMgL = (g * 1000) / capacity;
                            txVolumeBasis = "vessel";
                          } else {
                            const moved = row.volume_moved_litres != null ? parseFloat(String(row.volume_moved_litres)) : NaN;
                            if (!isNaN(moved) && moved > 0) {
                              txDoseRateMgL = (g * 1000) / moved;
                              txVolumeBasis = "volume_moved";
                            }
                          }
                        }
                      }

                      return (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="p-2.5 whitespace-nowrap">{fmtDate(row.record_date)}</td>
                          <td className="p-2.5 font-mono text-xs">{fmt(row.batch_ref)}</td>
                          {yearFilter === "all" && <td className="p-2.5 text-muted-foreground text-xs">{fmt(row.vintage_year)}</td>}
                          <td className="p-2.5">
                            {rowColour
                              ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">{rowColour}</span>
                              : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="p-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageBadgeClass}`}>
                              {SOURCE_LABELS[src] ?? src}
                            </span>
                          </td>
                          <td className="p-2.5">{fmt(row.additive_name)}</td>
                          <td className="p-2.5 text-right font-mono">{row.dose != null && row.dose !== "" ? parseFloat(String(row.dose)).toFixed(2) : "—"}</td>
                          <td className="p-2.5 text-xs text-muted-foreground">{fmt(row.unit)}</td>
                          <td className="p-2.5 text-right">
                            {txDoseRateMgL != null ? (
                              <span
                                title={txVolumeBasis === "vessel" ? "Estimated from vessel capacity" : "Estimated from volume moved"}
                                className="inline-flex items-center gap-1 cursor-default"
                              >
                                <span className="font-mono text-xs">{txDoseRateMgL.toFixed(1)}</span>
                                <span className="text-muted-foreground text-xs">mg/L</span>
                                <span
                                  title={txVolumeBasis === "vessel" ? "Based on vessel capacity" : "Based on volume moved (no vessel capacity recorded)"}
                                  className={`inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium leading-none cursor-default ${txVolumeBasis === "vessel" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}
                                >
                                  {txVolumeBasis === "vessel" ? "cap" : "vol"}
                                </span>
                              </span>
                            ) : src === "cellar" && row.so2_quantity_g != null ? (
                              <span title="No vessel capacity or volume moved recorded" className="text-muted-foreground text-xs cursor-default">—</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="p-2.5 text-muted-foreground text-xs">{fmt(row.operator_name)}</td>
                          <td className="p-2.5 text-muted-foreground text-xs">{fmt(row.vessel_ref)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Press Record</DialogTitle></DialogHeader>
          {editing !== null && form.audit_signature && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
              <span>
                <strong>This record has been signed off.</strong> The sign-off remains intact, but any change you save will be permanently recorded in the record's edit history for audit purposes.
              </span>
            </div>
          )}
          <div className="space-y-4">
            <SectionLabel>Session</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Press Date *</Label><Input type="date" max={today} value={String(form.pressDate ?? "")} onChange={e => sf("pressDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch / Lot Reference</Label>
                <div className="relative">
                  <Input
                    value={String(form.batchRef ?? "")}
                    onChange={e => sf("batchRef", e.target.value)}
                    placeholder={editing !== null ? "e.g. PRESS-2025-001" : (batchSettings.data?.nextRef ?? "e.g. PRESS-2025-001")}
                    className={batchRefError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                </div>
                {batchRefError ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" />{batchRefError}</p>
                ) : editing === null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to auto-assign <span className="font-mono text-foreground">{batchSettings.data?.nextRef ?? "…"}</span>. Override by typing a custom reference.
                  </p>
                )}
              </div>
              <div>
                <Label>Press Type</Label>
                <Select
                  value={pressTypeOther ? "Other" : String(form.pressType ?? "")}
                  onValueChange={v => { if (v === "Other") { setPressTypeOther(true); sf("pressType", ""); } else { setPressTypeOther(false); sf("pressType", v); } }}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{PRESS_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                {pressTypeOther && <Input className="mt-1.5" placeholder="Describe your press type…" value={String(form.pressType ?? "")} onChange={e => sf("pressType", e.target.value)} />}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border px-3 py-2.5">
              <Checkbox id="organic-chk" checked={form.isOrganic === true || form.isOrganic === "true"} onCheckedChange={v => sf("isOrganic", v ? "true" : "false")} className="mt-0.5" />
              <div>
                <Label htmlFor="organic-chk" className="cursor-pointer">Certified organic batch</Label>
                <p className="text-xs text-muted-foreground mt-0.5">The SO₂ warning threshold will automatically switch to the organic limit (90 mg/kg) when this is ticked.</p>
              </div>
            </div>
            <div>
              <Label>Operator</Label>
              <StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} />
              <p className="text-xs text-muted-foreground mt-1">No specific certification is required for pressing in UK winemaking — any trained winery staff member may operate the press.</p>
            </div>
            <SectionLabel>Weights & Yield</SectionLabel>
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-md border px-3 py-2.5">
                <Checkbox id="frs-chk" checked={freeRunSep} onCheckedChange={v => sf("freeRunSeparated", v ? "true" : "false")} className="mt-0.5" />
                <div>
                  <Label htmlFor="frs-chk" className="cursor-pointer">Free run and press wine kept separate</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Tick if free run juice and press fractions are collected and tracked individually.</p>
                </div>
              </div>
              {!freeRunSep && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Free run and press wine will be blended — record only the total juice volume. Combined pressing may affect quality classification and organic certification traceability.</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Grapes Pressed (kg)</Label><Input type="number" step="0.1" value={String(form.grapesPressedKg ?? "")} onChange={e => sf("grapesPressedKg", e.target.value)} /></div>
              {freeRunSep && <div><Label>Free Run (L)</Label><Input type="number" step="0.1" value={String(form.freeRunLitres ?? "")} onChange={e => sf("freeRunLitres", e.target.value)} /></div>}
              {freeRunSep && <div><Label>Press Wine (L)</Label><Input type="number" step="0.1" value={String(form.pressWineLitres ?? "")} onChange={e => sf("pressWineLitres", e.target.value)} /></div>}
              <div className={freeRunSep ? "" : "col-span-2"}>
                <Label>Total Juice (L)</Label>
                {total !== null
                  ? <div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{total.toFixed(1)} <span className="text-blue-600 text-xs">auto</span></div>
                  : <Input type="number" step="0.1" value={String(form.totalJuiceLitres ?? "")} onChange={e => sf("totalJuiceLitres", e.target.value)} />}
              </div>
              {efficiency && <div className="col-span-2"><Label>Press Efficiency</Label><div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{efficiency} L/kg <span className="text-blue-600 text-xs">auto</span></div></div>}
            </div>
            <SectionLabel>Juice Analysis</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Brix °</Label><Input type="number" step="0.1" value={String(form.juiceBrix ?? "")} onChange={e => sf("juiceBrix", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.juicePh ?? "")} onChange={e => sf("juicePh", e.target.value)} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.juiceTaGl ?? "")} onChange={e => sf("juiceTaGl", e.target.value)} /></div>
              <div>
                <Label>Turbidity</Label>
                <Select value={String(form.juiceTurbidity ?? "")} onValueChange={v => sf("juiceTurbidity", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{JUICE_TURBIDITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Analysis Source (equipment or lab)</Label>
              <Input
                list="press-analysis-equip-list"
                value={String(form.juiceAnalysisSource ?? "")}
                onChange={e => sf("juiceAnalysisSource", e.target.value)}
                placeholder="e.g. Refractometer R1 or WineServices Lab, Bristol"
              />
              {analysisEquipmentList.length > 0 && (
                <datalist id="press-analysis-equip-list">
                  {analysisEquipmentList.map(e => <option key={String(e.id)} value={String(e.equipment_ref)} />)}
                </datalist>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {analysisEquipmentList.length > 0
                  ? "Select from registered equipment above, or type an external lab name."
                  : "Record which on-site instrument or external lab provided these values. Add instruments in the Equipment Register tab."}
              </p>
            </div>
            <SectionLabel>Additions at Press</SectionLabel>
            <div className="space-y-2">
              {(form.isOrganic === true || form.isOrganic === "true") ? (
                <p className="text-xs text-muted-foreground">UK-permitted additions (retained EU Reg 2019/934). <span className="font-medium text-amber-700">Organic batch — SO₂ limit is 90 mg/kg.</span> Ascorbic acid max: 250 mg/L.</p>
              ) : (
                <p className="text-xs text-muted-foreground">UK-permitted additions (retained EU Reg 2019/934). Conventional SO₂ max: 200 mg/kg; organic limit: 90 mg/kg. Ascorbic acid max: 250 mg/L.</p>
              )}
              {additionsRows.map((row) => {
                const additiveDef = PERMITTED_ADDITIVES.find(a => a.name === row.additiveName);
                const doseVal = parseFloat(row.dose);
                const batchIsOrganic = form.isOrganic === true || form.isOrganic === "true";
                let exceedsConventional = false;
                let exceedsOrganic = false;
                if (additiveDef && !isNaN(doseVal) && row.unit) {
                  const convMax = additiveDef.maxPerUnit?.[row.unit];
                  const orgMax = additiveDef.organicMaxPerUnit?.[row.unit];
                  if (batchIsOrganic) {
                    // For organic batches: warn at organic limit; API still enforces conventional ceiling
                    if (orgMax !== undefined && doseVal > orgMax) exceedsOrganic = true;
                  } else {
                    if (convMax !== undefined && doseVal > convMax) exceedsConventional = true;
                    else if (orgMax !== undefined && doseVal > orgMax) exceedsOrganic = true;
                  }
                }
                const setRow = (k: keyof AdditionRow, v: string) =>
                  setAdditionsRows(rs => rs.map(r => r.tempId === row.tempId ? { ...r, [k]: v } : r));
                return (
                  <div key={row.tempId} className="border rounded-md p-2 space-y-1.5 bg-muted/20">
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 min-w-0">
                        <Select value={row.additiveName} onValueChange={v => {
                          const def = PERMITTED_ADDITIVES.find(a => a.name === v);
                          setAdditionsRows(rs => rs.map(r => r.tempId === row.tempId ? { ...r, additiveName: v, category: def?.category ?? "other", unit: def?.defaultUnit ?? "g/hL" } : r));
                        }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select additive…" /></SelectTrigger>
                          <SelectContent>{PERMITTED_ADDITIVES.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <Input className="w-24 h-8 text-xs" type="number" step="0.1" min="0" placeholder="Dose" value={row.dose} onChange={e => setRow("dose", e.target.value)} />
                      <Select value={row.unit} onValueChange={v => setRow("unit", v)}>
                        <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{(additiveDef?.units ?? ALL_DOSE_UNITS).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0" type="button" onClick={() => setAdditionsRows(rs => rs.filter(r => r.tempId !== row.tempId))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                    {row.additiveName === "Other" && (
                      <Input className="h-7 text-xs" placeholder="Describe additive or product…" value={row.notes} onChange={e => setRow("notes", e.target.value)} />
                    )}
                    {exceedsConventional && (
                      <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />Exceeds conventional max ({additiveDef?.maxPerUnit?.[row.unit]} {row.unit})
                      </div>
                    )}
                    {!exceedsConventional && exceedsOrganic && batchIsOrganic && (
                      <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />Exceeds organic limit ({additiveDef?.organicMaxPerUnit?.[row.unit]} {row.unit}) — cannot save for a certified organic batch
                      </div>
                    )}
                    {!exceedsConventional && exceedsOrganic && !batchIsOrganic && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />Exceeds organic limit ({additiveDef?.organicMaxPerUnit?.[row.unit]} {row.unit}) — permitted for conventional wine only
                      </div>
                    )}
                  </div>
                );
              })}
              <Button size="sm" variant="outline" type="button" onClick={() => setAdditionsRows(rs => [...rs, { tempId: ++addRowCounter.current, additiveName: "", category: "other", dose: "", unit: "mg/kg", notes: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1" />Add Additive
              </Button>
            </div>
            <SectionLabel>Settling</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Settling Method</Label>
                <Select value={String(form.settlingMethod ?? "")} onValueChange={v => sf("settlingMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SETTLING_METHOD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Settling Vessel</Label>
                {activeVessels.length > 0 ? (
                  <Select value={String(form.settlingVessel ?? "")} onValueChange={v => sf("settlingVessel", v)}>
                    <SelectTrigger><SelectValue placeholder="Select registered vessel…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {activeVessels.map(v => (
                        <SelectItem key={String(v.id)} value={String(v.vessel_ref)}>
                          {String(v.vessel_ref)}{v.vessel_type ? ` — ${String(v.vessel_type).replace(/-/g, " ")}` : ""}{v.capacity_litres ? ` (${fmtNum(v.capacity_litres, 0)} L)` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={String(form.settlingVessel ?? "")} onChange={e => sf("settlingVessel", e.target.value)} placeholder="Register vessels in Tank Register" />
                )}
                {activeVessels.length === 0 && <p className="text-xs text-muted-foreground mt-1">Register your vessels in the Tank Register tab to enable the vessel picker here.</p>}
              </div>
              <div><Label>Settling Time (hours)</Label><Input type="number" value={String(form.settlingHours ?? "")} onChange={e => sf("settlingHours", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.pressDate || crud.add.isPending || crud.edit.isPending || hasBlockingAdditionError}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Press Record — {fmtDate(view.press_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Press Date" value={fmtDate(view.press_date)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Press Type" value={fmt(view.press_type)} />
              <ViewField label="Certified Organic" value={(view.is_organic === true || view.is_organic === "true" || view.is_organic === 1) ? <span className="inline-flex items-center gap-1 text-green-700 font-medium"><ShieldCheck className="h-3.5 w-3.5" />Yes — organic SO₂ limits apply</span> : "No"} />
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              <ViewField label="Free Run Separated" value={view.free_run_separated ? "Yes" : "No"} />
              <ViewField label="Grapes Pressed" value={view.grapes_pressed_kg ? `${fmtNum(view.grapes_pressed_kg, 0)} kg` : "—"} />
              <ViewField label="Free Run" value={view.free_run_litres ? `${fmtNum(view.free_run_litres, 1)} L` : "—"} />
              <ViewField label="Press Wine" value={view.press_wine_litres ? `${fmtNum(view.press_wine_litres, 1)} L` : "—"} />
              <ViewField label="Total Juice" value={view.total_juice_litres ? `${fmtNum(view.total_juice_litres, 1)} L` : "—"} />
              <ViewField label="Press Efficiency" value={view.press_efficiency_l_per_kg ? `${fmtNum(view.press_efficiency_l_per_kg, 3)} L/kg` : "—"} />
              <ViewField label="Juice Brix °" value={fmtNum(view.juice_brix, 1)} />
              <ViewField label="Juice pH" value={fmtNum(view.juice_ph, 2)} />
              <ViewField label="Juice TA (g/L)" value={fmtNum(view.juice_ta_gl, 1)} />
              <ViewField label="Turbidity" value={fmt(view.juice_turbidity)} />
              {!!view.juice_analysis_source && <div className="col-span-2"><ViewField label="Analysis Source" value={fmt(view.juice_analysis_source)} /></div>}
              {(viewAdditions?.length ?? 0) > 0 ? (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Additions at Press</p>
                  <div className="mt-1 space-y-1">
                    {(viewAdditions ?? []).map((a, i) => (
                      <div key={i} className="flex gap-2 text-sm flex-wrap">
                        <span className="font-medium">{String(a.additive_name)}</span>
                        {(a.dose != null && a.dose !== "") && <span className="text-muted-foreground">{String(a.dose)} {String(a.unit ?? "")}</span>}
                        {!!(a.notes) && <span className="text-xs text-muted-foreground">— {String(a.notes)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : !!view.additions_at_press ? (
                <div className="col-span-2"><ViewField label="Additions at Press" value={<span className="whitespace-pre-wrap">{fmt(view.additions_at_press)}</span>} /></div>
              ) : null}
              <ViewField label="Settling Method" value={fmt(view.settling_method)} />
              <ViewField label="Settling Vessel" value={fmt(view.settling_vessel)} />
              <ViewField label="Settling Time" value={view.settling_hours ? `${view.settling_hours} hours` : "—"} />
            </div>
            {!!view.notes && <p className="text-xs text-muted-foreground mt-2 border-t pt-2 whitespace-pre-wrap">{String(view.notes)}</p>}
            {Array.isArray(view.edit_history) && (view.edit_history as Record<string, unknown>[]).length > 0 && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Edited After Sign-Off</p>
                <ul className="mt-1 space-y-0.5">
                  {(view.edit_history as Record<string, unknown>[]).map((h, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      {String(h.note ?? "")}
                      {h.editedAt ? <span className="text-[10px] text-muted-foreground/70"> ({new Date(String(h.editedAt)).toLocaleString("en-GB")})</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-pressing" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Press Record</DialogTitle><DialogDescription>Remove press record from {fmtDate(deleting?.press_date)}?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={o => !o && setSettingsOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Winery Batch Settings</DialogTitle>
            <DialogDescription>Configure how pressing batch references are auto-generated. Leave the Batch / Lot Reference blank when adding a press record to use the next number.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Prefix</Label>
              <Input value={settingsForm.prefix ?? ""} onChange={e => ssf("prefix", e.target.value.toUpperCase())} placeholder="PRESS" maxLength={12} />
              <p className="text-xs text-muted-foreground mt-1">Short code used at the start of each reference, e.g. PRESS, LOT, VIN.</p>
            </div>
            <div>
              <Label>Year Format</Label>
              <Select value={settingsForm.yearFormat ?? "YYYY"} onValueChange={v => ssf("yearFormat", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY">Full year — YYYY (e.g. 2025)</SelectItem>
                  <SelectItem value="YY">Short year — YY (e.g. 25)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sequence Padding</Label>
              <Select value={String(settingsForm.paddingDigits ?? "3")} onValueChange={v => ssf("paddingDigits", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 digit (1, 2, 3…)</SelectItem>
                  <SelectItem value="2">2 digits (01, 02…)</SelectItem>
                  <SelectItem value="3">3 digits (001, 002…)</SelectItem>
                  <SelectItem value="4">4 digits (0001, 0002…)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Next Sequence Number</Label>
              <Input type="number" min="1" value={settingsForm.nextSequence ?? "1"} onChange={e => ssf("nextSequence", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">The number that will be issued on the next auto-generated reference. Increase to skip ahead; reduce to reset (use with care).</p>
            </div>
            {(settingsForm.prefix || settingsForm.yearFormat) && (
              <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
                <span className="text-muted-foreground text-xs">Next ref preview: </span>
                <span className="font-mono font-semibold">
                  {(settingsForm.prefix || "PRESS")}-{settingsForm.yearFormat === "YY" ? String(new Date().getFullYear()).slice(-2) : new Date().getFullYear()}-{String(settingsForm.nextSequence || "1").padStart(parseInt(settingsForm.paddingDigits || "3", 10), "0")}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={saveSettings} disabled={batchSettings.save.isPending}>
              {batchSettings.save.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Fermentation Records Tab ─────────────────────────────────────────────────
export function FermentationRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-fermentation", "winery-fermentation");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isOrganicForm, setIsOrganicForm] = useState(false);
  const [yearFilter, setYearFilter] = usePersistedYearFilter("fermentation", farmId);
  const [fermSearch, setFermSearch] = useState("");
  const [so2FromPressing, setSo2FromPressing] = useState(false);
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const { data: farmsDataFerm } = useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameFerm: string = (Array.isArray(farmsDataFerm?.farms)
    ? (farmsDataFerm.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Pressing records sorted newest-first for the link select
  const sortedPressingRecords = [...pressingRecords]
    .filter(r => r.batch_ref)
    .sort((a, b) => String(b.press_date ?? "").localeCompare(String(a.press_date ?? "")));

  const handlePressingLinkChange = async (val: string) => {
    sf("pressingRecordId", val);
    setSo2FromPressing(false);
    if (!val) return;
    const match = pressingRecords.find(p => String(p.id) === val);
    if (!match) return;
    // Auto-fill batch ref and vintage year when linking a pressing record
    if (!form.batchRef && match.batch_ref) sf("batchRef", String(match.batch_ref));
    if (!form.vintageYear && match.vintage_year) sf("vintageYear", String(match.vintage_year));
    if (!form.wineColour && match.wine_colour) sf("wineColour", String(match.wine_colour));
    // Inherit organic status from pressing record (user can override manually)
    setIsOrganicForm(!!(match.is_organic === true || match.is_organic === "true"));
    // Fetch pressing additions and pre-fill SO₂ if the field is currently empty
    try {
      const res = await fetch(api(`farms/${farmId}/winery-pressing/${val}/additions`), { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        const additions: Record<string, unknown>[] = d.additions ?? [];
        const so2Row = additions.find(a => String(a.category ?? "") === "so2");
        if (so2Row && so2Row.dose != null) {
          setForm(f => {
            if (f.so2AtFermentationMgL) return f; // don't overwrite if user already entered a value
            setSo2FromPressing(true);
            return { ...f, so2AtFermentationMgL: String(so2Row.dose) };
          });
        }
      }
    } catch {
      // non-critical — silently skip if fetch fails
    }
  };

  const openAdd = () => { setEditing(null); setForm({ vintageYear: String(new Date().getFullYear()) }); setIsOrganicForm(false); setSo2FromPressing(false); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm(Object.fromEntries(Object.entries(r).filter(([k]) => k !== "is_organic" && k !== "so2_from_pressing").map(([k, v]) => [k, v == null ? "" : String(v)])));
    setIsOrganicForm(!!(r.is_organic === true || r.is_organic === "true"));
    // Drive the badge from the persisted flag — no fetch needed
    setSo2FromPressing(!!(r.so2_from_pressing === true || r.so2_from_pressing === "true"));
    setOpen(true);
  };
  const save = async () => {
    try {
      const payload = { ...form, isOrganic: isOrganicForm, so2FromPressing };
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filteredByYear = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const filtered = fermSearch.trim() === "" ? filteredByYear : filteredByYear.filter(r => {
    const q = fermSearch.trim().toLowerCase();
    const vesselRef = r.vessel_ref ?? vessels.find(v => v.id === r.vessel_id)?.vessel_ref;
    return String(r.batch_ref ?? "").toLowerCase().includes(q)
      || String(r.variety ?? "").toLowerCase().includes(q)
      || String(vesselRef ?? "").toLowerCase().includes(q)
      || String(r.operator_name ?? "").toLowerCase().includes(q);
  });
  const fermentCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "wine_colour", label: "Wine Colour" },
    { key: "is_organic", label: "Organic", fmt: (r: Record<string, unknown>) => (r.is_organic === true || r.is_organic === "true") ? "Yes" : "No" },
    { key: "volume_litres", label: "Volume (L)" },
    { key: "fermentation_type", label: "Fermentation Type" },
    { key: "yeast_strain", label: "Yeast Strain" },
    { key: "inoculation_date", label: "Inoculation Date", fmt: (r: Record<string, unknown>) => fmtDate(r.inoculation_date) },
    { key: "start_date", label: "Start Date", fmt: (r: Record<string, unknown>) => fmtDate(r.start_date) },
    { key: "end_date", label: "End Date", fmt: (r: Record<string, unknown>) => fmtDate(r.end_date) },
    { key: "start_brix", label: "Start Brix" },
    { key: "end_brix", label: "End Brix" },
    { key: "end_sg", label: "End SG" },
    { key: "residual_sugar_gl", label: "Residual Sugar (g/L)" },
    { key: "max_temp_c", label: "Max Temp (°C)" },
    { key: "min_temp_c", label: "Min Temp (°C)" },
    { key: "so2_at_fermentation_mg_l", label: "SO₂ at Fermentation (mg/L)" },
    { key: "end_ph", label: "End pH", fmt: (r: Record<string, unknown>) => r.end_ph != null ? fmtNum(r.end_ph, 2) : "" },
    { key: "end_ta_gl", label: "End TA (g/L)", fmt: (r: Record<string, unknown>) => r.end_ta_gl != null ? fmtNum(r.end_ta_gl, 1) : "" },
    { key: "operator_name", label: "Operator" },
    { key: "notes", label: "Notes" },
  ];

  const fermentStatus = (r: Record<string, unknown>) => {
    if (r.end_date) return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Complete</span>;
    if (r.start_date) return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Active</span>;
    return <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Pending</span>;
  };

  const brixChartData = filtered.filter(r => r.start_brix || r.end_brix).map(r => ({
    batch: String(r.batch_ref ?? r.id).slice(0, 12),
    "Start Brix": r.start_brix ? parseFloat(String(r.start_brix)) : null,
    "End Brix": r.end_brix ? parseFloat(String(r.end_brix)) : null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Fermentation Records</p>
          <p className="text-xs text-muted-foreground mt-0.5">Track each fermentation batch from inoculation to dryness. One record per batch per vessel. Links to your Tank Register for vessel assignment.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Fermentation</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setFermSearch(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 text-xs pl-7 w-52"
            placeholder="Batch, variety, vessel, operator…"
            value={fermSearch}
            onChange={e => setFermSearch(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          const searchTrim = fermSearch.trim();
          const parts = ["fermentation-records", yearFilter === "all" ? "all-vintages" : yearFilter];
          if (searchTrim) parts.push(`search-${csvSlug(searchTrim)}`);
          const prefixLines = [
            csvComment(`Fermentation Records — ${farmNameFerm}`),
            csvComment(`Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}`),
            csvComment(`Search filter: ${searchTrim || "None"}`),
          ];
          exportCSV(filtered, `${parts.join("-")}.csv`, fermentCsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} batch{filtered.length !== 1 ? "es" : ""}</span>
      </div>
      {brixChartData.length > 1 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Start vs End Brix by Batch</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={brixChartData} margin={{ top: 4, right: 12, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="batch" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} width={32} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Start Brix" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="End Brix" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Beaker} title="No fermentation records yet" sub="Add a record when you begin each fermentation batch." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Vintage</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Colour</th>
              <th className="text-left p-3 font-medium">Vessel</th>
              <th className="text-left p-3 font-medium">Start</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Start Brix</th>
              <th className="text-right p-3 font-medium">End Brix</th>
              <th className="text-right p-3 font-medium">End pH</th>
              <th className="text-right p-3 font-medium">End TA (g/L)</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3">{fmt(r.vintage_year)}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.batch_ref)}</td>
                  <td className="p-3">
                    {r.wine_colour ? <span className="text-xs bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">{String(r.wine_colour)}</span> : "—"}
                    {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-sans"><Leaf className="w-3 h-3" />Organic</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">{fmt(r.vessel_ref ?? vessels.find(v => v.id === r.vessel_id)?.vessel_ref)}</td>
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.start_date)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{r.fermentation_type ? String(r.fermentation_type).split(" ")[0] : "—"}</td>
                  <td className="p-3 text-right">{fmtNum(r.start_brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.end_brix, 1)}</td>
                  <td className="p-3 text-right">{r.end_ph != null ? fmtNum(r.end_ph, 2) : "—"}</td>
                  <td className="p-3 text-right">{r.end_ta_gl != null ? fmtNum(r.end_ta_gl, 1) : "—"}</td>
                  <td className="p-3">{fermentStatus(r)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <BatchTrailButton batchRef={r.batch_ref} onClick={() => setTrailRecord(r)} />
                    <ViewAdditionsButton farmId={farmId} record={r} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Fermentation Record</DialogTitle></DialogHeader>
          {editing !== null && <SignedEditWarning signed={form.audit_signature} />}
          <div className="space-y-4">
            <SectionLabel>Batch identity</SectionLabel>
            {sortedPressingRecords.length > 0 && (
              <div>
                <Label>Link to Pressing Batch</Label>
                <Select value={String(form.pressingRecordId ?? "")} onValueChange={handlePressingLinkChange}>
                  <SelectTrigger><SelectValue placeholder="— Not linked to a pressing record —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Not linked —</SelectItem>
                    {sortedPressingRecords.map(p => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>
                        {String(p.batch_ref)}{p.is_organic === true || p.is_organic === "true" ? " 🌿" : ""}{p.vintage_year ? ` (${String(p.vintage_year)})` : ""}{p.press_date ? ` — ${new Date(String(p.press_date)).toLocaleDateString("en-GB")}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Linking a pressing batch makes its additions visible here and inherits the organic status.</p>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox
                id="ferm-organic-chk"
                checked={isOrganicForm}
                onCheckedChange={v => setIsOrganicForm(!!v)}
              />
              <div>
                <Label htmlFor="ferm-organic-chk" className="cursor-pointer">Organic batch</Label>
                <p className="text-xs text-muted-foreground">Automatically inherited from linked pressing record — you can override manually.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch / Lot Reference</Label>
                <Input
                  value={form.batchRef ?? ""}
                  onChange={e => sf("batchRef", e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
              </div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vessel</Label>
                <Select value={form.vesselId ?? ""} onValueChange={v => sf("vesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent>{vessels.filter(v => v.status === "active").map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}{v.vessel_type ? ` — ${String(v.vessel_type)}` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Volume (L)</Label><Input type="number" step="0.1" value={form.volumeLitres ?? ""} onChange={e => sf("volumeLitres", e.target.value)} /></div>
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <SectionLabel>Fermentation type</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Fermentation Type</Label>
                <Select value={form.fermentationType ?? ""} onValueChange={v => sf("fermentationType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{FERMENTATION_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Yeast Strain</Label><Input value={form.yeastStrain ?? ""} onChange={e => sf("yeastStrain", e.target.value)} placeholder="e.g. EC1118, Zymaflore F10, Wild" /></div>
              <div><Label>Inoculation Date</Label><Input type="date" max={today} value={form.inoculationDate ?? ""} onChange={e => sf("inoculationDate", e.target.value)} /></div>
              <div><Label>Inoculation Temp (°C)</Label><Input type="number" step="0.1" value={form.inoculationTempC ?? ""} onChange={e => sf("inoculationTempC", e.target.value)} /></div>
            </div>
            <SectionLabel>Fermentation progress</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" max={today} value={form.startDate ?? ""} onChange={e => sf("startDate", e.target.value)} /></div>
              <div><Label>Start Brix °</Label><Input type="number" step="0.1" value={form.startBrix ?? ""} onChange={e => sf("startBrix", e.target.value)} /></div>
              <div><Label>End Brix °</Label><Input type="number" step="0.01" value={form.endBrix ?? ""} onChange={e => sf("endBrix", e.target.value)} /></div>
              <div><Label>End SG</Label><Input type="number" step="0.0001" value={form.endSg ?? ""} onChange={e => sf("endSg", e.target.value)} placeholder="e.g. 0.9940" /></div>
              <div><Label>Residual Sugar (g/L)</Label><Input type="number" step="0.1" value={form.residualSugarGl ?? ""} onChange={e => sf("residualSugarGl", e.target.value)} /></div>
              <div><Label>End Date</Label><Input type="date" max={today} value={form.endDate ?? ""} onChange={e => sf("endDate", e.target.value)} /></div>
              <div><Label>Max Temp (°C)</Label><Input type="number" step="0.1" value={form.maxTempC ?? ""} onChange={e => sf("maxTempC", e.target.value)} /></div>
              <div><Label>Min Temp (°C)</Label><Input type="number" step="0.1" value={form.minTempC ?? ""} onChange={e => sf("minTempC", e.target.value)} /></div>
              <div><Label>End pH</Label><Input type="number" step="0.01" value={form.endPh ?? ""} onChange={e => sf("endPh", e.target.value)} placeholder="Post-fermentation pH" /></div>
              <div><Label>End TA (g/L)</Label><Input type="number" step="0.1" value={form.endTaGl ?? ""} onChange={e => sf("endTaGl", e.target.value)} placeholder="Post-fermentation titratable acidity" /></div>
            </div>
            <div><Label>Nutrient additions</Label><Input value={form.nutrientAdditions ?? ""} onChange={e => sf("nutrientAdditions", e.target.value)} placeholder="e.g. DAP 20g/hL at inoculation, Thiamine..." /></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label>SO₂ addition at fermentation (mg/L)</Label>
                {so2FromPressing && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    from pressing
                  </span>
                )}
              </div>
              <Input
                type="number"
                step="0.1"
                value={form.so2AtFermentationMgL ?? ""}
                onChange={e => { setSo2FromPressing(false); sf("so2AtFermentationMgL", e.target.value); }}
              />
              {(() => {
                if (!isOrganicForm || !form.wineColour) return null;
                const orgLimit = ORGANIC_MAX_SO2[form.wineColour];
                if (!orgLimit) return null;
                const dose = parseFloat(form.so2AtFermentationMgL ?? "");
                const exceeds = !isNaN(dose) && dose > parseFloat(orgLimit);
                return exceeds ? (
                  <p className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Exceeds organic total SO₂ limit for {form.wineColour} ({orgLimit} mg/L)
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 mt-1">
                    <Leaf className="inline h-3 w-3 mr-0.5" />Organic limit for {form.wineColour}: {orgLimit} mg/L total SO₂ — monitor cumulative additions across all stages.
                  </p>
                );
              })()}
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Fermentation — {fmt(view.batch_ref) !== "—" ? String(view.batch_ref) : `Vintage ${String(view.vintage_year)}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
              <ViewField label="Organic" value={(view.is_organic === true || view.is_organic === "true") ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">✓ Organic</span> : <span className="text-muted-foreground text-xs">No</span>} />
              <ViewField label="Vessel" value={fmt(view.vessel_ref ?? vessels.find(v => v.id === view.vessel_id)?.vessel_ref)} />
              <ViewField label="Volume (L)" value={fmtNum(view.volume_litres, 0)} />
              <ViewField label="Fermentation Type" value={fmt(view.fermentation_type)} />
              <ViewField label="Yeast Strain" value={fmt(view.yeast_strain)} />
              <ViewField label="Inoculation Date" value={fmtDate(view.inoculation_date)} />
              <ViewField label="Inoculation Temp" value={view.inoculation_temp_c ? `${fmtNum(view.inoculation_temp_c, 1)} °C` : "—"} />
              <ViewField label="Start Date" value={fmtDate(view.start_date)} />
              <ViewField label="Start Brix °" value={fmtNum(view.start_brix, 1)} />
              <ViewField label="End Brix °" value={fmtNum(view.end_brix, 2)} />
              <ViewField label="End SG" value={fmtNum(view.end_sg, 4)} />
              <ViewField label="End Date" value={fmtDate(view.end_date)} />
              <ViewField label="Residual Sugar" value={view.residual_sugar_gl ? `${fmtNum(view.residual_sugar_gl, 1)} g/L` : "—"} />
              <ViewField label="Max Temp" value={view.max_temp_c ? `${fmtNum(view.max_temp_c, 1)} °C` : "—"} />
              <ViewField label="Min Temp" value={view.min_temp_c ? `${fmtNum(view.min_temp_c, 1)} °C` : "—"} />
              <ViewField label="SO₂ at Fermentation" value={view.so2_at_fermentation_mg_l ? `${fmtNum(view.so2_at_fermentation_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="End pH" value={fmtNum(view.end_ph, 2)} />
              <ViewField label="End TA" value={view.end_ta_gl ? `${fmtNum(view.end_ta_gl, 1)} g/L` : "—"} />
              {!!view.nutrient_additions && <div className="col-span-2"><ViewField label="Nutrient Additions" value={fmt(view.nutrient_additions)} /></div>}
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {/* Pressing additions — shown when this fermentation record is linked to a pressing batch */}
            {!!view.pressing_record_id && (() => {
              const additions = Array.isArray(view.pressing_additions) ? view.pressing_additions as Record<string, unknown>[] : [];
              // Find the pressing SO₂ addition for the SO₂ baseline callout
              const pressingSo2 = additions.find(a => String(a.category ?? "") === "so2");
              return (
                <div className="border-t pt-3 mt-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Additions added at pressing
                    {view.pressing_batch_ref ? ` — Batch ${String(view.pressing_batch_ref)}` : ""}
                    {view.pressing_press_date ? ` (${fmtDate(view.pressing_press_date)})` : ""}
                  </p>
                  {pressingSo2 && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                      <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <strong>SO₂ baseline at pressing:</strong>{" "}
                        {pressingSo2.dose != null ? `${String(pressingSo2.dose)} ${String(pressingSo2.unit ?? "")}` : "recorded"}
                        {pressingSo2.additive_name ? ` — ${String(pressingSo2.additive_name)}` : ""}
                      </span>
                    </div>
                  )}
                  {additions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No structured additions recorded for the linked pressing batch.</p>
                  ) : (
                    <div className="rounded-md border overflow-hidden text-xs">
                      <table className="w-full">
                        <thead className="bg-muted/40"><tr>
                          <th className="text-left p-2 font-medium">Additive</th>
                          <th className="text-left p-2 font-medium">Category</th>
                          <th className="text-right p-2 font-medium">Dose</th>
                          <th className="text-left p-2 font-medium">Unit</th>
                          <th className="text-left p-2 font-medium">Notes</th>
                        </tr></thead>
                        <tbody className="divide-y">
                          {additions.map((a, i) => (
                            <tr key={String(a.id ?? i)} className="hover:bg-muted/20">
                              <td className="p-2 font-medium">{fmt(a.additive_name)}</td>
                              <td className="p-2 text-muted-foreground">{fmt(a.category)}</td>
                              <td className="p-2 text-right font-mono">{fmt(a.dose)}</td>
                              <td className="p-2">{fmt(a.unit)}</td>
                              <td className="p-2 text-muted-foreground max-w-[8rem] lg:max-w-[11rem] xl:max-w-[14rem]">
                                {a.notes ? (
                                  <span className="truncate block cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2" title={String(a.notes)}>
                                    {String(a.notes).length > 120 ? `${String(a.notes).slice(0, 120)}…` : String(a.notes)}
                                  </span>
                                ) : <span className="text-muted-foreground/50">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
            <EditHistorySection history={view.edit_history} />
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-fermentation" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Fermentation Record</DialogTitle><DialogDescription>Remove this fermentation batch record? Cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameFerm}
          onClose={() => setTrailRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Vessel Register Tab ──────────────────────────────────────────────────────
function VesselCleanRow({ farmId, vesselId }: { farmId: number; vesselId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-vessel-cleans", farmId, vesselId],
    queryFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/cleans`), { credentials: "include" }); return (await r.json()).records ?? []; },
    enabled: !!vesselId,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({ cleanDate: today, rinseCompleted: "true" });
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const addMut = useMutation({
    mutationFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/cleans`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); } },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-vessel-cleans", farmId, vesselId] }); setShowAdd(false); setForm({ cleanDate: today, rinseCompleted: "true" }); toast({ title: "Clean record added" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: async (cleanId: number) => { const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}/cleans/${cleanId}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["winery-vessel-cleans", farmId, vesselId] }),
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cleaning History</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(s => !s)}><Plus className="w-3 h-3 mr-1" />Log Clean</Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Clean Date *</Label><Input type="date" max={today} value={String(form.cleanDate ?? "")} onChange={e => sf("cleanDate", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Clean Type</Label>
              <Select value={String(form.cleanType ?? "")} onValueChange={v => sf("cleanType", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CLEAN_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Cleaning Product</Label><Input value={String(form.cleaningProduct ?? "")} onChange={e => sf("cleaningProduct", e.target.value)} className="h-8 text-xs" placeholder="e.g. Citric acid 2%" /></div>
            <div><Label className="text-xs">Concentration (%)</Label><Input type="number" step="0.01" value={String(form.concentrationPct ?? "")} onChange={e => sf("concentrationPct", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Water Temp (°C)</Label><Input type="number" step="0.1" value={String(form.waterTempC ?? "")} onChange={e => sf("waterTempC", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Contact Time (min)</Label><Input type="number" value={String(form.contactTimeMin ?? "")} onChange={e => sf("contactTimeMin", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Operator</Label><Input value={String(form.operatorName ?? "")} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="rinse-chk" checked={form.rinseCompleted !== "false" && form.rinseCompleted !== false} onCheckedChange={v => sf("rinseCompleted", v ? "true" : "false")} />
            <Label htmlFor="rinse-chk" className="text-xs cursor-pointer">Final rinse completed</Label>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!form.cleanDate || addMut.isPending}>{addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save Clean</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No cleaning records yet.</p> : (
        <div className="space-y-1">
          {(data ?? []).map(c => (
            <div key={String(c.id)} className="flex items-center justify-between text-xs border rounded px-3 py-1.5">
              <span className="font-medium">{fmtDate(c.clean_date)}</span>
              <span className="text-muted-foreground">{fmt(c.clean_type)}</span>
              <span className="text-muted-foreground">{fmt(c.cleaning_product)}</span>
              <span>{c.rinse_completed ? <span className="text-green-700">Rinse ✓</span> : <span className="text-red-600">No rinse</span>}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => delMut.mutate(Number(c.id))}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VesselRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const farmNameVessels = useFarmName(farmId);
  const crud = useCrud(farmId, "winery-vessels", "winery-vessels");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isBarrel = form.vesselType?.toLowerCase().includes("barrel") || form.vesselType?.toLowerCase().includes("barrique");

  const openAdd = () => { setEditing(null); setForm({ status: "active" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...form } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(form);
      toast({ title: "Saved" }); setOpen(false);
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const statusBadge = (s: unknown) => {
    const v = String(s ?? "active");
    if (v === "active") return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Active</span>;
    if (v === "retired") return <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Retired</span>;
    return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">{v}</span>;
  };
  const vesselCsvCols = [
    { key: "vessel_ref", label: "Vessel Ref" },
    { key: "vessel_type", label: "Vessel Type" },
    { key: "capacity_litres", label: "Capacity (L)" },
    { key: "location", label: "Location" },
    { key: "current_contents", label: "Current Contents" },
    { key: "volume_current_litres", label: "Current Volume (L)" },
    { key: "status", label: "Status" },
    { key: "last_cleaned_date", label: "Last Cleaned", fmt: (r: Record<string, unknown>) => fmtDate(r.last_cleaned_date) },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Tank & Vessel Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Register all winery vessels — tanks, barrels, amphorae — with capacity, current contents, and cleaning history. Used as a reference in fermentation, cellar ops, SO₂ testing, and bottling records.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "vessels.csv", vesselCsvCols, [
            csvComment(`Tank & Vessel Register — ${farmNameVessels}`),
            csvComment("Scope: All vessels (no filters on this register)"),
          ])} disabled={!crud.data.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Vessel</Button>
        </div>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.data.length === 0 ? <EmptyState icon={Package} title="No vessels registered yet" sub="Add your tanks, barrels, and other winery vessels to the register." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Ref</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Capacity (L)</th>
              <th className="text-left p-3 font-medium">Location</th>
              <th className="text-left p-3 font-medium">Current Contents</th>
              <th className="text-right p-3 font-medium">Volume (L)</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {crud.data.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 font-mono font-semibold">{fmt(r.vessel_ref)}</td>
                  <td className="p-3 text-muted-foreground">{fmt(r.vessel_type)}</td>
                  <td className="p-3 text-right">{fmtNum(r.capacity_litres, 0)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{fmt(r.location)}</td>
                  <td className="p-3">{fmt(r.current_contents)}</td>
                  <td className="p-3 text-right">{r.current_volume_litres ? fmtNum(r.current_volume_litres, 0) : "—"}</td>
                  <td className="p-3">{statusBadge(r.status)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Register"} Vessel</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vessel Reference *</Label><Input value={form.vesselRef ?? ""} onChange={e => sf("vesselRef", e.target.value)} placeholder="e.g. T1, Barrel-B12, A1" /></div>
              <div>
                <Label>Vessel Type</Label>
                <Select value={form.vesselType ?? ""} onValueChange={v => sf("vesselType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{VESSEL_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Capacity (L)</Label><Input type="number" step="0.1" value={form.capacityLitres ?? ""} onChange={e => sf("capacityLitres", e.target.value)} /></div>
              <div><Label>Material</Label><Input value={form.material ?? ""} onChange={e => sf("material", e.target.value)} placeholder="e.g. 316L stainless, French oak" /></div>
              <div><Label>Year Purchased</Label><Input type="number" value={form.yearPurchased ?? ""} onChange={e => sf("yearPurchased", e.target.value)} /></div>
              <div><Label>Manufacturer</Label><Input value={form.manufacturer ?? ""} onChange={e => sf("manufacturer", e.target.value)} /></div>
              <div><Label>Location</Label><Input value={form.location ?? ""} onChange={e => sf("location", e.target.value)} placeholder="e.g. Winery floor, East cellar" /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "active"} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VESSEL_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {isBarrel && (
              <>
                <SectionLabel>Barrel details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Oak Origin</Label><Input value={form.oakOrigin ?? ""} onChange={e => sf("oakOrigin", e.target.value)} placeholder="e.g. French Allier, American" /></div>
                  <div><Label>Cooperage</Label><Input value={form.cooperage ?? ""} onChange={e => sf("cooperage", e.target.value)} placeholder="e.g. Demptos, François Frères" /></div>
                  <div><Label>Fill Number</Label><Input type="number" min="1" value={form.fillNumber ?? ""} onChange={e => sf("fillNumber", e.target.value)} placeholder="How many vintages used" /></div>
                  <div>
                    <Label>Toasting Level</Label>
                    <Select value={form.toastingLevel ?? ""} onValueChange={v => sf("toastingLevel", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{TOASTING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            <SectionLabel>Current state</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Current Contents</Label><Input value={form.currentContents ?? ""} onChange={e => sf("currentContents", e.target.value)} placeholder="e.g. Bacchus 2024, empty" /></div>
              <div><Label>Current Volume (L)</Label><Input type="number" step="0.1" value={form.currentVolumeLitres ?? ""} onChange={e => sf("currentVolumeLitres", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.vesselRef || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Vessel — {fmt(view.vessel_ref)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Vessel Ref" value={<span className="font-mono">{fmt(view.vessel_ref)}</span>} />
              <ViewField label="Type" value={fmt(view.vessel_type)} />
              <ViewField label="Capacity" value={view.capacity_litres ? `${fmtNum(view.capacity_litres, 0)} L` : "—"} />
              <ViewField label="Material" value={fmt(view.material)} />
              <ViewField label="Year Purchased" value={fmt(view.year_purchased)} />
              <ViewField label="Manufacturer" value={fmt(view.manufacturer)} />
              <ViewField label="Location" value={fmt(view.location)} />
              <ViewField label="Status" value={statusBadge(view.status)} />
              {String(view.vessel_type ?? "").toLowerCase().includes("barrel") && (
                <>
                  <ViewField label="Oak Origin" value={fmt(view.oak_origin)} />
                  <ViewField label="Cooperage" value={fmt(view.cooperage)} />
                  <ViewField label="Fill Number" value={fmt(view.fill_number)} />
                  <ViewField label="Toasting" value={fmt(view.toasting_level)} />
                </>
              )}
              <ViewField label="Current Contents" value={fmt(view.current_contents)} />
              <ViewField label="Current Volume" value={view.current_volume_litres ? `${fmtNum(view.current_volume_litres, 0)} L` : "—"} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            <VesselCleanRow farmId={farmId} vesselId={view.id as number} />
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Vessel</DialogTitle><DialogDescription>Remove vessel {fmt(deleting?.vessel_ref)} from the register? All associated cleaning records will also be deleted.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Cellar Operations Log ────────────────────────────────────────────────────
export function CellarOpsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-cellar-ops", "winery-cellar-ops");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { data: cellarFermentationRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-fermentation", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-fermentation`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = usePersistedYearFilter("cellar-ops", farmId);
  const [opFilter, setOpFilter] = useState("all");
  const [cellarSearch, setCellarSearch] = useState("");
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  // Single source-aware auto-fill state, matching the bottling form's
  // wineColourAutoSource: "fermentation" | "pressing" | null
  const [cellarWineColourAutoSource, setCellarWineColourAutoSource] = useState<"fermentation" | "pressing" | null>(null);
  // True once the operator has manually changed the wine colour in the open form —
  // suppresses re-derivation of the colour-source badges until the form is reopened.
  const [cellarColourTouched, setCellarColourTouched] = useState(false);
  // Confirm-before-save gate: shown when a sulfiting save would push the batch's
  // projected cumulative SO₂ total to/over its active ceiling.
  const [confirmOverCeiling, setConfirmOverCeiling] = useState(false);
  const { data: farmsDataCellar } = useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameCellar: string = (Array.isArray(farmsDataCellar?.farms)
    ? (farmsDataCellar.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cellarPressingRefs = pressingRecords
    .filter(r => r.batch_ref)
    .map(r => ({ batchRef: String(r.batch_ref), vintageYear: String(r.vintage_year ?? ""), wineColour: String(r.wine_colour ?? ""), isOrganic: !!(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) }))
    .sort((a, b) => b.batchRef.localeCompare(a.batchRef));

  const handleCellarBatchRefChange = (val: string) => {
    sf("batchRef", val);
    // Always reset the hint — recompute from scratch for this new batch ref
    setCellarWineColourAutoSource(null);
    const pressMatch = cellarPressingRefs.find(p => p.batchRef === val);
    const fermMatch = val
      ? cellarFermentationRecords.find(f => String(f.batch_ref ?? "") === val)
      : null;
    if (pressMatch || fermMatch) {
      if (!form.vintageYear && pressMatch?.vintageYear) sf("vintageYear", pressMatch.vintageYear);
      // Prefer fermentation colour (more downstream); fall back to pressing
      const fermColour = fermMatch && fermMatch.wine_colour ? String(fermMatch.wine_colour) : "";
      const pressColour = pressMatch?.wineColour ?? "";
      const inheritedColour = fermColour || pressColour;
      if (!form.wineColour && inheritedColour) {
        sf("wineColour", inheritedColour);
        // Hint reflects where the colour actually came from
        if (fermColour) setCellarWineColourAutoSource("fermentation");
        else if (pressColour) setCellarWineColourAutoSource("pressing");
      }
      const isOrganic = fermMatch != null
        ? (fermMatch.is_organic === true || fermMatch.is_organic === "true" || fermMatch.is_organic === 1)
        : (pressMatch?.isOrganic ?? false);
      sf("_batchIsOrganic", isOrganic ? "true" : "false");
    } else {
      sf("_batchIsOrganic", "");
    }
  };

  // Organic SO₂ hint for cellar sulfiting form
  const cellarBatchIsOrganic = form._batchIsOrganic === "true";
  const cellarWineColour = form.wineColour ?? "";
  const cellarOrgLimit = cellarBatchIsOrganic && cellarWineColour ? ORGANIC_MAX_SO2[cellarWineColour] : null;
  // Conventional ceiling — shown as a read-only info line for all sulfiting ops when colour is known
  const cellarConvLimit = cellarWineColour ? CONVENTIONAL_MAX_SO2[cellarWineColour] : null;
  // Active ceiling based on whether the linked pressing batch is organic
  const cellarActiveLimit = cellarBatchIsOrganic ? (cellarOrgLimit ?? cellarConvLimit) : cellarConvLimit;
  const cellarFreeSo2After = form.freeSo2AfterMgL ? parseFloat(form.freeSo2AfterMgL) : null;
  const cellarSo2OverOrganic = cellarOrgLimit != null && cellarFreeSo2After != null && cellarFreeSo2After > parseFloat(cellarOrgLimit);

  // Cumulative SO₂ running total for the selected batch (excluding the record being edited)
  const cellarSo2PriorOps = useMemo(() => {
    if (!form.batchRef) return [];
    return crud.data.filter(r =>
      String(r.op_type) === "sulfiting" &&
      String(r.batch_ref) === form.batchRef &&
      r.so2_quantity_g != null &&
      (editing === null || Number(r.id) !== editing)
    );
  }, [crud.data, form.batchRef, editing]);
  // Strip vessel_capacity_litres so sumCellarSo2 uses only the immutable operation-time
  // volume_moved_litres, not the mutable vessel-register capacity.
  const cellarSo2Prior = useMemo(() => {
    const opsForCalc = cellarSo2PriorOps.map(op => ({ ...op, vessel_capacity_litres: undefined }));
    return sumCellarSo2(opsForCalc);
  }, [cellarSo2PriorOps]);
  const cellarSo2PriorWithVolumeCount = useMemo(() =>
    cellarSo2PriorOps.filter(op => {
      const v = parseFloat(String(op.volume_moved_litres ?? ""));
      return !isNaN(v) && v > 0;
    }).length,
    [cellarSo2PriorOps]
  );
  // Current form contribution (live, as the operator types)
  const cellarCurrentSo2G = form.so2QuantityG ? parseFloat(form.so2QuantityG) : null;
  const cellarCurrentVolL = form.volumeMovedLitres ? parseFloat(form.volumeMovedLitres) : null;
  const cellarCurrentContribMgL =
    cellarCurrentSo2G != null && !isNaN(cellarCurrentSo2G) && cellarCurrentSo2G > 0 &&
    cellarCurrentVolL != null && !isNaN(cellarCurrentVolL) && cellarCurrentVolL > 0
      ? (cellarCurrentSo2G * 1000) / cellarCurrentVolL
      : null;
  const cellarProjectedMgL =
    cellarSo2Prior.cumulativeMgL != null || cellarCurrentContribMgL != null
      ? (cellarSo2Prior.cumulativeMgL ?? 0) + (cellarCurrentContribMgL ?? 0)
      : null;
  // Ceiling the running total is judged against — organic when the linked batch is
  // organic, otherwise the conventional (non-organic) legal ceiling for the colour.
  const cellarCumulativeLimit = cellarBatchIsOrganic ? cellarOrgLimit : cellarConvLimit;
  const cellarCumulativeLimitLabel = cellarBatchIsOrganic ? "organic" : "conventional";
  const showCumulativeIndicator =
    !!cellarCumulativeLimit &&
    (cellarSo2PriorOps.length > 0 || (cellarCurrentSo2G != null && !isNaN(cellarCurrentSo2G)));

  const opType = form.opType ?? "";
  const isRacking = opType === "racking";
  const isTopping = opType === "topping";
  const isSulfiting = opType === "sulfiting";
  const isFining = opType === "fining";
  const isFiltering = opType === "filtering";
  const vRef = (id: unknown) => vessels.find(v => String(v.id) === String(id))?.vessel_ref ?? id;

  // Re-derive the colour-source badges while editing an existing record: the
  // fermentation/pressing source queries resolve asynchronously, so this must
  // re-run when they land, not just once in openEdit. Skipped once the operator
  // manually changes the colour (cellarColourTouched).
  useEffect(() => {
    if (!open || editing === null || cellarColourTouched) return;
    const storedColour = form.wineColour ?? "";
    const bRef = form.batchRef ?? "";
    const fermMatch = bRef ? cellarFermentationRecords.find(f => String(f.batch_ref ?? "") === bRef) : undefined;
    const fermColour = fermMatch && fermMatch.wine_colour ? String(fermMatch.wine_colour) : "";
    const pressColour = bRef ? (cellarPressingRefs.find(p => p.batchRef === bRef)?.wineColour ?? "") : "";
    if (storedColour && fermColour && storedColour === fermColour) {
      setCellarWineColourAutoSource("fermentation");
    } else if (storedColour && pressColour && storedColour === pressColour) {
      setCellarWineColourAutoSource("pressing");
    } else {
      setCellarWineColourAutoSource(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, cellarColourTouched, form.wineColour, form.batchRef, cellarFermentationRecords, pressingRecords]);

  const openAdd = () => { setEditing(null); setForm({ opDate: today, vintageYear: String(new Date().getFullYear()) }); setCellarColourTouched(false); setCellarWineColourAutoSource(null); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    const base = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]));
    // Restore organic flag from pressing records (not persisted on cellar op rows)
    const bRef = typeof r.batch_ref === "string" ? r.batch_ref : "";
    const matchedPress = bRef ? cellarPressingRefs.find(p => p.batchRef === bRef) : undefined;
    base._batchIsOrganic = matchedPress ? (matchedPress.isOrganic ? "true" : "false") : "";
    // Map snake_case API field to the camelCase key used by the sulfiting volume input
    if (r.volume_moved_litres != null && r.volume_moved_litres !== "") {
      base.volumeMovedLitres = String(r.volume_moved_litres);
    }
    setForm(base);
    // Badge derivation happens in the effect below so it re-runs once the
    // fermentation/pressing source queries resolve (they load asynchronously).
    setCellarColourTouched(false);
    setCellarWineColourAutoSource(null);
    setOpen(true);
  };
  const save = async (ceilingConfirmed = false) => {
    if (!form.opType) { toast({ title: "Please select an operation type", variant: "destructive" }); return; }
    if (form.opType === "sulfiting") {
      const vol = parseFloat(form.volumeMovedLitres ?? "");
      if (isNaN(vol) || vol <= 0) {
        toast({ title: "Batch volume required", description: "Enter the volume of wine being sulfited to enable SO₂ mg/L tracking.", variant: "destructive" });
        return;
      }
      // Confirm before saving a sulfiting record whose projected cumulative SO₂
      // total meets/exceeds the active (organic or conventional) ceiling. Only
      // fires when both the projection and a ceiling are actually available.
      if (
        !ceilingConfirmed &&
        cellarProjectedMgL != null &&
        cellarCumulativeLimit &&
        !isNaN(parseFloat(cellarCumulativeLimit)) &&
        cellarProjectedMgL >= parseFloat(cellarCumulativeLimit)
      ) {
        setConfirmOverCeiling(true);
        return;
      }
    }
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...form } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(form);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filtered = crud.data
    .filter(r => yearFilter === "all" || String(r.vintage_year) === yearFilter)
    .filter(r => opFilter === "all" || String(r.op_type) === opFilter)
    .filter(r => {
      const q = cellarSearch.trim().toLowerCase();
      if (q === "") return true;
      return String(r.batch_ref ?? "").toLowerCase().includes(q)
        || String(r.operator_name ?? "").toLowerCase().includes(q)
        || String(r.notes ?? "").toLowerCase().includes(q);
    });
  // Organic status for a cellar-ops row: derived from the linked pressing record by
  // batch_ref (same as the view dialog / form), falling back to the row's own flag.
  const cellarRowIsOrganic = (r: Record<string, unknown>): boolean => {
    const pressMatch = r.batch_ref ? cellarPressingRefs.find(p => p.batchRef === String(r.batch_ref)) : null;
    if (pressMatch) return !!pressMatch.isOrganic;
    return r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
  };

  const cellarCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "op_date", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.op_date) },
    { key: "op_type", label: "Operation Type" },
    { key: "wine_colour", label: "Wine Colour" },
    { key: "vessel", label: "Vessel", fmt: (r: Record<string, unknown>) => {
      const from = r.from_vessel_ref ?? (r.from_vessel_id != null ? vRef(r.from_vessel_id) : null);
      const to = r.to_vessel_ref ?? (r.to_vessel_id != null ? vRef(r.to_vessel_id) : null);
      return [from, to].filter(v => v != null && v !== "").map(String).join(" → ");
    } },
    { key: "volume_l", label: "Volume (L)" },
    { key: "product_used", label: "Product Used" },
    { key: "quantity_used", label: "Quantity Used" },
    { key: "so2_quantity_g", label: "SO₂ Added (g)", fmt: (r: Record<string, unknown>) => {
      if (String(r.op_type) !== "sulfiting" || r.so2_quantity_g == null || r.so2_quantity_g === "") return "";
      return String(r.so2_quantity_g);
    } },
    { key: "dose_rate_mg_l", label: "Dose Rate (mg/L)", fmt: (r: Record<string, unknown>) => {
      if (String(r.op_type) !== "sulfiting" || r.so2_quantity_g == null) return "";
      const g = parseFloat(String(r.so2_quantity_g));
      if (isNaN(g)) return "";
      const capacity = r.vessel_capacity_litres != null ? parseFloat(String(r.vessel_capacity_litres)) : NaN;
      if (!isNaN(capacity) && capacity > 0) return (g * 1000 / capacity).toFixed(1);
      const moved = r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)) : NaN;
      if (!isNaN(moved) && moved > 0) return (g * 1000 / moved).toFixed(1);
      return "";
    } },
    { key: "so2_ceiling_mg_l", label: "SO₂ ceiling (mg/L)", fmt: (r: Record<string, unknown>) => {
      if (String(r.op_type) !== "sulfiting") return "";
      const colour = String(r.wine_colour ?? "");
      if (!colour) return "";
      const isOrg = cellarRowIsOrganic(r);
      const ceiling = isOrg ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour];
      return ceiling ? `${ceiling} (${isOrg ? "organic" : "conventional"})` : "";
    } },
    { key: "so2_compliance", label: "Compliance", fmt: (r: Record<string, unknown>) => {
      if (String(r.op_type) !== "sulfiting") return "";
      const colour = String(r.wine_colour ?? "");
      if (!colour) return "";
      const isOrg = cellarRowIsOrganic(r);
      const ceiling = parseFloat((isOrg ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour]) ?? "");
      const freeAfter = r.free_so2_after_mg_l != null && r.free_so2_after_mg_l !== "" ? parseFloat(String(r.free_so2_after_mg_l)) : NaN;
      if (isNaN(ceiling) || isNaN(freeAfter)) return "";
      return freeAfter > ceiling ? "Exceeds Limit" : "Compliant";
    } },
    { key: "operator_name", label: "Operator" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Cellar Operations Log</p>
          <p className="text-xs text-muted-foreground mt-0.5">Record all winemaking interventions — racking, topping, sulfiting, fining, filtering, and cold stabilisation. The SO₂ addition records here feed into your SO₂ compliance audit trail.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Operation</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setCellarSearch(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">Operation:</span>
        <Select value={opFilter} onValueChange={setOpFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All types</SelectItem>{CELLAR_OP_TYPES.map(o => <SelectItem key={o} value={o}>{CELLAR_OP_LABELS[o]}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 text-xs pl-7 w-48"
            placeholder="Batch, operator, notes…"
            value={cellarSearch}
            onChange={e => setCellarSearch(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          const searchTrim = cellarSearch.trim();
          const parts = ["cellar-ops", yearFilter === "all" ? "all-vintages" : yearFilter];
          if (opFilter !== "all") parts.push(csvSlug(opFilter));
          if (searchTrim) parts.push(`search-${csvSlug(searchTrim)}`);
          const prefixLines = [
            csvComment(`Cellar Operations Log — ${farmNameCellar}`),
            csvComment(`Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}`),
            csvComment(`Operation filter: ${opFilter === "all" ? "All types" : (CELLAR_OP_LABELS[opFilter] ?? opFilter)}`),
            csvComment(`Search filter: ${searchTrim || "None"}`),
          ];
          exportCSV(filtered, `${parts.join("-")}.csv`, cellarCsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Wrench} title="No cellar operations logged" sub="Log racking, topping, sulfiting and other interventions here." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Colour</th>
              <th className="text-left p-3 font-medium">Operation</th>
              <th className="text-left p-3 font-medium">From</th>
              <th className="text-left p-3 font-medium">To</th>
              <th className="text-left p-3 font-medium">Detail</th>
              <th className="text-right p-3 font-medium">Dose Rate</th>
              <th className="text-left p-3 font-medium">Compliance</th>
              <th className="text-left p-3 font-medium">Operator</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => {
                const detail = r.op_type === "sulfiting" ? (r.free_so2_before_mg_l ? `${fmtNum(r.free_so2_before_mg_l, 0)}→${fmtNum(r.free_so2_after_mg_l, 0)} mg/L` : r.so2_quantity_g ? `${fmtNum(r.so2_quantity_g, 1)} g SO₂` : "") : r.op_type === "topping" ? (r.top_up_volume_litres ? `${fmtNum(r.top_up_volume_litres, 1)} L` : "") : r.op_type === "fining" ? fmt(r.fining_agent) : r.op_type === "filtering" ? fmt(r.filter_type) : "";
                // Per-row SO₂ dose rate (mg/L) for sulfiting operations
                let doseRateMgL: number | null = null;
                let doseRateSource: "vessel" | "volume_moved" | null = null;
                let doseRateMissingReason = "";
                if (r.op_type === "sulfiting") {
                  const g = parseFloat(String(r.so2_quantity_g ?? ""));
                  const capacityRaw = r.vessel_capacity_litres;
                  const capacity = capacityRaw != null ? parseFloat(String(capacityRaw)) : NaN;
                  const moved = parseFloat(String(r.volume_moved_litres ?? ""));
                  if (isNaN(g) || g <= 0) {
                    doseRateMissingReason = "SO₂ quantity not recorded";
                  } else if (!isNaN(capacity) && capacity > 0) {
                    doseRateMgL = (g * 1000) / capacity;
                    doseRateSource = "vessel";
                  } else if (!isNaN(moved) && moved > 0) {
                    doseRateMgL = (g * 1000) / moved;
                    doseRateSource = "volume_moved";
                  } else {
                    doseRateMissingReason = "No vessel capacity or batch volume recorded";
                  }
                }
                // Compliance verdict for sulfiting rows — same logic as the CSV export:
                // ceiling from wine_colour + organic status, compared against free_so2_after_mg_l
                let compliance: boolean | null = null;
                if (String(r.op_type) === "sulfiting") {
                  const colour = String(r.wine_colour ?? "");
                  if (colour) {
                    const isOrg = cellarRowIsOrganic(r);
                    const ceiling = parseFloat((isOrg ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour]) ?? "");
                    const freeAfter = r.free_so2_after_mg_l != null && r.free_so2_after_mg_l !== "" ? parseFloat(String(r.free_so2_after_mg_l)) : NaN;
                    if (!isNaN(ceiling) && !isNaN(freeAfter)) compliance = freeAfter <= ceiling;
                  }
                }
                return (
                  <tr key={String(r.id)} className="hover:bg-muted/20">
                    <td className="p-3 whitespace-nowrap">{fmtDate(r.op_date)}</td>
                    <td className="p-3 font-mono text-xs">
                    {fmt(r.batch_ref)}
                    {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-sans"><Leaf className="w-3 h-3" />Organic</span>
                    )}
                  </td>
                    <td className="p-3 text-xs text-muted-foreground">{r.wine_colour ? fmt(r.wine_colour) : "—"}</td>
                    <td className="p-3"><span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">{CELLAR_OP_LABELS[String(r.op_type)] ?? fmt(r.op_type)}</span></td>
                    <td className="p-3 font-mono text-xs">{fmt(r.from_vessel_ref ?? vRef(r.from_vessel_id))}</td>
                    <td className="p-3 font-mono text-xs">{fmt(r.to_vessel_ref ?? vRef(r.to_vessel_id))}</td>
                    <td className="p-3 text-muted-foreground text-xs">{detail}</td>
                    <td className="p-3 text-right font-mono text-xs">
                      {r.op_type === "sulfiting"
                        ? doseRateMgL != null
                          ? <span title={doseRateSource === "vessel" ? "Estimated from vessel capacity" : "Estimated from volume moved"} className="cursor-default">{doseRateMgL.toFixed(1)} <span className="text-muted-foreground font-sans">mg/L</span></span>
                          : <span title={doseRateMissingReason} className="text-muted-foreground cursor-default">—</span>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {String(r.op_type) === "sulfiting" && compliance != null
                        ? <So2Badge compliant={compliance} />
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{fmt(r.operator_name)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <BatchTrailButton batchRef={r.batch_ref} onClick={() => setTrailRecord(r)} />
                      <ViewAdditionsButton farmId={farmId} record={r} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Log"} Cellar Operation</DialogTitle></DialogHeader>
          {editing !== null && <SignedEditWarning signed={form.audit_signature} />}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Operation Date *</Label><Input type="date" max={today} value={form.opDate ?? ""} onChange={e => sf("opDate", e.target.value)} /></div>
              <div>
                <Label>Operation Type *</Label>
                <Select value={form.opType ?? ""} onValueChange={v => sf("opType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select operation" /></SelectTrigger>
                  <SelectContent>{CELLAR_OP_TYPES.map(o => <SelectItem key={o} value={o}>{CELLAR_OP_LABELS[o]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Wine Colour</Label>
                  {cellarWineColourAutoSource && !!form.wineColour && (
                    <span className="text-xs text-blue-600">auto from {cellarWineColourAutoSource}</span>
                  )}
                </div>
                <Select value={form.wineColour ?? ""} onValueChange={v => { setCellarColourTouched(true); setCellarWineColourAutoSource(null); sf("wineColour", v); }}>
                  <SelectTrigger><SelectValue placeholder="Select colour" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Not specified —</SelectItem>
                    {WINE_COLOUR_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Batch Reference</Label>
                <Input
                  list="cellar-pressing-refs"
                  value={form.batchRef ?? ""}
                  onChange={e => handleCellarBatchRefChange(e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
                {(cellarPressingRefs.length > 0 || cellarFermentationRecords.length > 0) && (() => {
                  const allRefs = Array.from(new Map([
                    ...cellarPressingRefs.map(p => [p.batchRef, { batchRef: p.batchRef, label: p.vintageYear ? `Vintage ${p.vintageYear}` : "" }] as [string, { batchRef: string; label: string }]),
                    ...cellarFermentationRecords.filter(f => f.batch_ref).map(f => [String(f.batch_ref), { batchRef: String(f.batch_ref), label: f.vintage_year ? `Vintage ${String(f.vintage_year)}` : "" }] as [string, { batchRef: string; label: string }]),
                  ]).values()).sort((a, b) => b.batchRef.localeCompare(a.batchRef));
                  return (
                    <datalist id="cellar-pressing-refs">
                      {allRefs.map(r => (
                        <option key={r.batchRef} value={r.batchRef} label={r.label || undefined} />
                      ))}
                    </datalist>
                  );
                })()}
                {(cellarPressingRefs.length > 0 || cellarFermentationRecords.length > 0) && (
                  <p className="text-xs text-muted-foreground mt-1">Select a batch ref to link, or type a custom reference.</p>
                )}
              </div>
              <div>
                <Label>{isTopping ? "Top-up Source Vessel" : "From Vessel"}</Label>
                <Select value={form.fromVesselId ?? ""} onValueChange={v => sf("fromVesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!isTopping && (
                <div>
                  <Label>To Vessel</Label>
                  <Select value={form.toVesselId ?? ""} onValueChange={v => sf("toVesselId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                    <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {(isRacking || !opType) && <div><Label>Volume Moved (L)</Label><Input type="number" step="0.1" value={form.volumeMovedLitres ?? ""} onChange={e => sf("volumeMovedLitres", e.target.value)} /></div>}
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            {isRacking && (
              <>
                <SectionLabel>Racking details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Clarity Before</Label><Input value={form.clarityBefore ?? ""} onChange={e => sf("clarityBefore", e.target.value)} placeholder="e.g. Hazy with lees" /></div>
                  <div><Label>Clarity After</Label><Input value={form.clarityAfter ?? ""} onChange={e => sf("clarityAfter", e.target.value)} placeholder="e.g. Bright" /></div>
                  <div><Label>Lees Depth (cm)</Label><Input type="number" step="0.1" value={form.leesDepthCm ?? ""} onChange={e => sf("leesDepthCm", e.target.value)} /></div>
                </div>
              </>
            )}
            {isTopping && (
              <>
                <SectionLabel>Topping up details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Top-up Volume (L)</Label><Input type="number" step="0.1" value={form.topUpVolumeLitres ?? ""} onChange={e => sf("topUpVolumeLitres", e.target.value)} /></div>
                  <div><Label>Source of top-up wine</Label><Input value={form.topUpSource ?? ""} onChange={e => sf("topUpSource", e.target.value)} placeholder="e.g. Same batch, Barrel T-spare" /></div>
                </div>
              </>
            )}
            {isSulfiting && (
              <>
                <SectionLabel>Sulfiting details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>SO₂ Product</Label><Input value={form.so2Product ?? ""} onChange={e => sf("so2Product", e.target.value)} placeholder="e.g. Potassium Metabisulphite" /></div>
                  <div><Label>SO₂ Added (g)</Label><Input type="number" step="0.01" value={form.so2QuantityG ?? ""} onChange={e => sf("so2QuantityG", e.target.value)} /></div>
                  <div><Label>Free SO₂ Before (mg/L)</Label><Input type="number" step="0.1" value={form.freeSo2BeforeMgL ?? ""} onChange={e => sf("freeSo2BeforeMgL", e.target.value)} /></div>
                  <div><Label>Free SO₂ After (mg/L)</Label><Input type="number" step="0.1" value={form.freeSo2AfterMgL ?? ""} onChange={e => sf("freeSo2AfterMgL", e.target.value)} /></div>
                  <div className="col-span-2">
                    <Label>Batch Volume (L) <span className="text-muted-foreground font-normal text-xs">— volume of wine being sulfited</span></Label>
                    <Input type="number" step="1" value={form.volumeMovedLitres ?? ""} onChange={e => sf("volumeMovedLitres", e.target.value)} placeholder="e.g. 750" />
                    <p className="text-xs text-muted-foreground mt-1">Required to calculate the cumulative SO₂ mg/L running total for this batch.</p>
                  </div>
                </div>
                {cellarWineColour && cellarActiveLimit && (
                  <div className="rounded-md border bg-slate-50 border-slate-200 px-3 py-2 text-sm flex items-center gap-2 text-slate-700">
                    <FlaskConical className="w-4 h-4 shrink-0 text-slate-500" />
                    <span>
                      <strong>{cellarBatchIsOrganic ? "Organic" : "Conventional"} SO₂ ceiling for {cellarWineColour}:</strong>{" "}
                      <strong>{cellarActiveLimit} mg/L</strong> total SO₂
                      {cellarBatchIsOrganic && cellarConvLimit && (
                        <span className="text-xs text-slate-500 ml-1">(conventional limit: {cellarConvLimit} mg/L)</span>
                      )}
                    </span>
                  </div>
                )}
                {cellarBatchIsOrganic && cellarOrgLimit && (
                  <div className={`rounded-md border px-3 py-2 text-sm flex items-start gap-2 ${cellarSo2OverOrganic ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-200 text-green-800"}`}>
                    {cellarSo2OverOrganic ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" /> : <Leaf className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />}
                    <span>
                      <strong>Organic batch</strong> — {cellarWineColour} ceiling: <strong>{cellarOrgLimit} mg/L</strong> free SO₂.
                      {cellarSo2OverOrganic && cellarFreeSo2After != null && (
                        <> The entered post-addition value ({cellarFreeSo2After.toFixed(1)} mg/L) exceeds the organic limit. Review before saving.</>
                      )}
                      {!cellarSo2OverOrganic && <> This addition is within the organic limit.</>}
                    </span>
                  </div>
                )}
                {showCumulativeIndicator && (
                  <div className={`rounded-md border px-3 py-2 text-sm flex items-start gap-2 ${
                    cellarProjectedMgL != null && cellarProjectedMgL >= parseFloat(cellarCumulativeLimit!)
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}>
                    <Gauge className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                    <span>
                      <strong>Cumulative SO₂ total for this batch:</strong>{" "}
                      {cellarProjectedMgL != null
                        ? <>
                            <strong>{cellarProjectedMgL.toFixed(1)} mg/L</strong> projected total out of <strong>{cellarCumulativeLimit} mg/L</strong> {cellarCumulativeLimitLabel} ceiling
                            {cellarCurrentContribMgL != null && cellarSo2Prior.cumulativeMgL != null && (
                              <span className="text-xs ml-1 opacity-80">({cellarSo2Prior.cumulativeMgL.toFixed(1)} mg/L prior + {cellarCurrentContribMgL.toFixed(1)} mg/L this addition)</span>
                            )}
                            {cellarSo2PriorWithVolumeCount < cellarSo2PriorOps.length && cellarSo2Prior.cumulativeMgL != null && (
                              <span className="text-xs ml-1 opacity-80">({cellarSo2PriorWithVolumeCount} of {cellarSo2PriorOps.length} prior operations have a recorded volume — partial estimate)</span>
                            )}
                            {cellarSo2PriorOps.length > 0 && cellarSo2Prior.cumulativeMgL == null && (
                              <span className="text-xs ml-1 opacity-80">({cellarSo2PriorOps.length} prior operation{cellarSo2PriorOps.length !== 1 ? "s" : ""} have no volume recorded)</span>
                            )}
                          </>
                        : <>
                            <strong>{(cellarSo2Prior.totalG + (cellarCurrentSo2G ?? 0)).toFixed(1)} g</strong> SO₂ across {cellarSo2PriorOps.length + (cellarCurrentSo2G != null && !isNaN(cellarCurrentSo2G) && cellarCurrentSo2G > 0 ? 1 : 0)} operation{(cellarSo2PriorOps.length + 1) !== 1 ? "s" : ""} — enter batch volume above to see mg/L total
                          </>
                      }
                    </span>
                  </div>
                )}
              </>
            )}
            {isFining && (
              <>
                <SectionLabel>Fining details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Fining Agent</Label><Input value={form.finingAgent ?? ""} onChange={e => sf("finingAgent", e.target.value)} placeholder="e.g. Bentonite, Casein, Isinglass" /></div>
                  <div><Label>Dose</Label><Input value={form.finingDose ?? ""} onChange={e => sf("finingDose", e.target.value)} placeholder="e.g. 50 g/hL" /></div>
                  <div><Label>Contact Time (hours)</Label><Input type="number" value={form.contactTimeHours ?? ""} onChange={e => sf("contactTimeHours", e.target.value)} /></div>
                  <div><Label>Volume moved (L)</Label><Input type="number" step="0.1" value={form.volumeMovedLitres ?? ""} onChange={e => sf("volumeMovedLitres", e.target.value)} /></div>
                </div>
              </>
            )}
            {isFiltering && (
              <>
                <SectionLabel>Filtering details</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Filter Type</Label><Input value={form.filterType ?? ""} onChange={e => sf("filterType", e.target.value)} placeholder="e.g. Plate filter, Crossflow, DE" /></div>
                  <div><Label>Filter Pore Size (µm)</Label><Input type="number" step="0.01" value={form.filterPoreUm ?? ""} onChange={e => sf("filterPoreUm", e.target.value)} /></div>
                  <div><Label>Volume Filtered (L)</Label><Input type="number" step="0.1" value={form.volumeMovedLitres ?? ""} onChange={e => sf("volumeMovedLitres", e.target.value)} /></div>
                  <div><Label>Clarity Before</Label><Input value={form.clarityBefore ?? ""} onChange={e => sf("clarityBefore", e.target.value)} /></div>
                  <div><Label>Clarity After</Label><Input value={form.clarityAfter ?? ""} onChange={e => sf("clarityAfter", e.target.value)} /></div>
                </div>
              </>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save()} disabled={!form.opDate || !form.opType || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmOverCeiling && (
        <Dialog open onOpenChange={() => setConfirmOverCeiling(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" />SO₂ ceiling exceeded</DialogTitle>
              <DialogDescription>
                Projected total {cellarProjectedMgL != null ? cellarProjectedMgL.toFixed(1) : "—"} mg/L exceeds the {cellarCumulativeLimit} mg/L {cellarCumulativeLimitLabel} ceiling — save anyway?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOverCeiling(false)}>Cancel</Button>
              <Button variant="destructive" disabled={crud.add.isPending || crud.edit.isPending} onClick={() => { setConfirmOverCeiling(false); save(true); }}>
                {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{CELLAR_OP_LABELS[String(view.op_type)] ?? fmt(view.op_type)} — {fmtDate(view.op_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Date" value={fmtDate(view.op_date)} />
              <ViewField label="Operation" value={CELLAR_OP_LABELS[String(view.op_type)] ?? fmt(view.op_type)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              {!!view.wine_colour && <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />}
              <ViewField label="From Vessel" value={fmt(view.from_vessel_ref ?? vRef(view.from_vessel_id))} />
              <ViewField label="To Vessel" value={fmt(view.to_vessel_ref ?? vRef(view.to_vessel_id))} />
              {!!view.volume_moved_litres && <ViewField label="Volume" value={`${fmtNum(view.volume_moved_litres, 1)} L`} />}
              {!!view.lees_depth_cm && <ViewField label="Lees Depth" value={`${fmtNum(view.lees_depth_cm, 1)} cm`} />}
              {!!view.top_up_volume_litres && <ViewField label="Top-up Volume" value={`${fmtNum(view.top_up_volume_litres, 1)} L`} />}
              {!!view.top_up_source && <ViewField label="Top-up Source" value={fmt(view.top_up_source)} />}
              {!!view.so2_product && <ViewField label="SO₂ Product" value={fmt(view.so2_product)} />}
              {!!view.so2_quantity_g && <ViewField label="SO₂ Added" value={`${fmtNum(view.so2_quantity_g, 2)} g`} />}
              {!!view.free_so2_before_mg_l && <ViewField label="Free SO₂ Before" value={`${fmtNum(view.free_so2_before_mg_l, 0)} mg/L`} />}
              {!!view.free_so2_after_mg_l && <ViewField label="Free SO₂ After" value={`${fmtNum(view.free_so2_after_mg_l, 0)} mg/L`} />}
              {(() => {
                if (String(view.op_type) !== "sulfiting") return null;
                const viewWineColour = String(view.wine_colour ?? "");
                const viewPressing = view.batch_ref ? cellarPressingRefs.find(p => p.batchRef === String(view.batch_ref)) : null;
                const viewIsOrganic = !!(viewPressing?.isOrganic);
                const viewOrgLimit = viewIsOrganic && viewWineColour ? ORGANIC_MAX_SO2[viewWineColour] : null;
                const viewConvLimit = viewWineColour ? CONVENTIONAL_MAX_SO2[viewWineColour] : null;
                const viewActiveLimit = viewIsOrganic ? (viewOrgLimit ?? viewConvLimit) : viewConvLimit;
                if (!viewActiveLimit) return null;
                const viewFreeSo2 = view.free_so2_after_mg_l != null && view.free_so2_after_mg_l !== "" ? parseFloat(String(view.free_so2_after_mg_l)) : NaN;
                const viewOverLimit = !isNaN(viewFreeSo2) && viewFreeSo2 > parseFloat(viewActiveLimit);
                return (
                  <>
                    <div className="col-span-2 rounded-md border bg-slate-50 border-slate-200 px-3 py-2 text-xs flex items-center gap-2 text-slate-700">
                      <FlaskConical className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      <span>
                        <strong>{viewIsOrganic ? "Organic" : "Conventional"} SO₂ ceiling for {viewWineColour}:</strong>{" "}
                        <strong>{viewActiveLimit} mg/L</strong> total SO₂
                        {viewIsOrganic && viewConvLimit && (
                          <span className="text-slate-500 ml-1">(conventional limit: {viewConvLimit} mg/L)</span>
                        )}
                      </span>
                    </div>
                    {viewOverLimit && (
                      <div className="col-span-2 flex items-start gap-2 rounded-md px-3 py-2 text-xs bg-red-50 border border-red-200 text-red-800">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                          <strong>{viewIsOrganic ? "Organic" : "Conventional"} {viewWineColour} limit: {viewActiveLimit} mg/L total SO₂</strong> —{" "}
                          Recorded free SO₂ ({fmtNum(view.free_so2_after_mg_l, 0)} mg/L) already <strong>exceeds</strong> the {viewIsOrganic ? "organic" : "conventional"} total-SO₂ ceiling (total SO₂ is at least the free SO₂).
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
              {!!view.fining_agent && <ViewField label="Fining Agent" value={fmt(view.fining_agent)} />}
              {!!view.fining_dose && <ViewField label="Fining Dose" value={fmt(view.fining_dose)} />}
              {!!view.contact_time_hours && <ViewField label="Contact Time" value={`${view.contact_time_hours} hours`} />}
              {!!view.filter_type && <ViewField label="Filter Type" value={fmt(view.filter_type)} />}
              {!!view.filter_pore_um && <ViewField label="Filter Pore" value={`${fmtNum(view.filter_pore_um, 2)} µm`} />}
              {!!view.clarity_before && <ViewField label="Clarity Before" value={fmt(view.clarity_before)} />}
              {!!view.clarity_after && <ViewField label="Clarity After" value={fmt(view.clarity_after)} />}
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            <EditHistorySection history={view.edit_history} />
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-cellar-op" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Operation</DialogTitle><DialogDescription>Remove this {CELLAR_OP_LABELS[String(deleting?.op_type)] ?? "cellar operation"} record?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameCellar}
          onClose={() => setTrailRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Bottling Records Tab ─────────────────────────────────────────────────────
export function BottlingRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-bottling", "winery-bottling");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [yearFilter, setYearFilter] = usePersistedYearFilter("bottling", farmId);
  const [bottlingSearch, setBottlingSearch] = useState("");
  const [nonCompliantOnly, setNonCompliantOnly] = useState(false);
  const [so2FromTest, setSo2FromTest] = useState(false);
  const [phTaFromAnalysis, setPhTaFromAnalysis] = useState<"fermentation" | "pressing" | null>(null);
  const [organicAutoSource, setOrganicAutoSource] = useState<"fermentation" | "pressing" | null>(null);
  const [wineColourAutoSource, setWineColourAutoSource] = useState<"fermentation" | "pressing" | null>(null);
  // True once the operator has manually changed the wine colour in the open form —
  // suppresses re-derivation of the colour-source badge until the form is reopened.
  const [bottlingColourTouched, setBottlingColourTouched] = useState(false);
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const [lotCodeError, setLotCodeError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importParsed, setImportParsed] = useState<Record<string, string>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ insertedCount: number; rejectedCount: number; rejected: { row: number; lotCode: string; reason: string }[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const importFileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const downloadBottlingTemplate = () => {
    // Headers and example row derived from BOTTLING_COLUMNS — always matches the import
    const exampleRow = BOTTLING_COLUMNS.map(c => c.example);
    const header = BOTTLING_IMPORT_HEADERS.map(h => `"${h}"`).join(",");
    const example = exampleRow.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
    const blob = new Blob([header + "\n" + example + "\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bottling-import-template.csv";
    a.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportResult(null);
    setImportParsed([]);
    setImportWarnings([]);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      // Full-file CSV state machine (shared with the Harvest importer): quoted
      // fields may contain commas, escaped quotes ("") and embedded newlines —
      // exports with multiline Notes round-trip cleanly. WARNING prefix records
      // our own exports prepend are extracted and surfaced in the preview.
      const parsed = parseBottlingCsv(text);
      setImportWarnings(parsed.warnings);
      if (!parsed.ok) { setImportError(parsed.error); return; }
      setImportParsed(parsed.rows);
    };
    reader.readAsText(file);
  };

  const submitImport = async () => {
    if (!importParsed.length) return;
    setImportLoading(true);
    setImportError(null);
    try {
      // Field mapping derived from BOTTLING_COLUMNS — headers, aliases and
      // record keys always stay in sync with the export and template.
      const records = importParsed.map(bottlingImportRecord);
      const r = await fetch(api(`farms/${farmId}/winery-bottling/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Import failed"); }
      const result = await r.json();
      setImportResult(result);
      if (result.insertedCount > 0) qc.invalidateQueries({ queryKey: ["winery-bottling", farmId] });
    } catch (err) {
      setImportError((err as Error).message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const resetImportDialog = () => {
    setImportParsed([]);
    setImportError(null);
    setImportResult(null);
    setImportWarnings([]);
    setImportLoading(false);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const { data: farmsDataBottling } = useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameBottling: string = (Array.isArray(farmsDataBottling?.farms)
    ? (farmsDataBottling.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  // Read SO₂ test records to enable pre-fill on batch ref selection
  const { data: so2TestRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-so2-tests", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-so2-tests`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });

  // Fermentation records for organic-status lookup when a batch ref is selected
  const { data: fermentationRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-fermentation", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-fermentation`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });

  const bottlingPressingRefs = pressingRecords
    .filter(r => r.batch_ref)
    .map(r => ({ batchRef: String(r.batch_ref), vintageYear: String(r.vintage_year ?? ""), wineColour: String(r.wine_colour ?? ""), isOrganic: !!(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) }))
    .sort((a, b) => b.batchRef.localeCompare(a.batchRef));

  const handleBottlingBatchRefChange = (val: string) => {
    const pressMatch = bottlingPressingRefs.find(p => p.batchRef === val);
    // Organic: prefer fermentation record for this batch ref, fall back to pressing
    const fermMatch = val
      ? fermentationRecords.find(f => String(f.batch_ref ?? "") === val)
      : null;
    const inheritedOrganic = fermMatch != null
      ? (fermMatch.is_organic === true || fermMatch.is_organic === "true" || fermMatch.is_organic === 1)
      : (pressMatch?.isOrganic ?? false);
    const organicSource: "fermentation" | "pressing" | null = fermMatch != null ? "fermentation" : (pressMatch ? "pressing" : null);
    // Find most recent pre-bottling or at-bottling SO₂ test for this batch
    const latestTest = val
      ? so2TestRecords
          .filter(t => String(t.batch_ref ?? "") === val && (t.test_stage === "pre-bottling" || t.test_stage === "at-bottling"))
          .sort((a, b) => String(b.test_date ?? "").localeCompare(String(a.test_date ?? "")))[0] ?? null
      : null;
    // Find the pressing record for this batch to source pH and TA
    const pressingRecord = val
      ? pressingRecords.find(p => String(p.batch_ref ?? "") === val) ?? null
      : null;
    setOrganicAutoSource(organicSource);
    setForm(f => {
      const next: Record<string, string | boolean> = { ...f, batchRef: val };
      if (pressMatch && !f.vintageYear) next.vintageYear = pressMatch.vintageYear;
      // Wine colour: prefer fermentation record (more downstream), fall back to pressing
      const inheritedWineColour = (fermMatch && fermMatch.wine_colour) ? String(fermMatch.wine_colour) : (pressMatch?.wineColour ?? "");
      if (!f.wineColour && inheritedWineColour) {
        next.wineColour = inheritedWineColour;
        setWineColourAutoSource(fermMatch && fermMatch.wine_colour ? "fermentation" : "pressing");
      }
      if (organicSource) next.isOrganic = inheritedOrganic ? "true" : "false";
      let filled = false;
      if (latestTest) {
        if (!f.freeSo2MgL && latestTest.free_so2_mg_l != null) { next.freeSo2MgL = String(latestTest.free_so2_mg_l); filled = true; }
        if (!f.totalSo2MgL && latestTest.total_so2_mg_l != null) { next.totalSo2MgL = String(latestTest.total_so2_mg_l); filled = true; }
      }
      if (filled) setSo2FromTest(true);
      // Pre-fill pH and TA — prefer fermentation end-of-ferment readings, fall back to pressing juice analysis
      let phTaFilled = false;
      let phTaSource: "fermentation" | "pressing" | null = null;
      if (fermMatch && (fermMatch.end_ph != null || fermMatch.end_ta_gl != null)) {
        if (!f.ph && fermMatch.end_ph != null) { next.ph = String(fermMatch.end_ph); phTaFilled = true; }
        if (!f.titratableAcidityGl && fermMatch.end_ta_gl != null) { next.titratableAcidityGl = String(fermMatch.end_ta_gl); phTaFilled = true; }
        if (phTaFilled) phTaSource = "fermentation";
      } else if (pressingRecord) {
        if (!f.ph && pressingRecord.juice_ph != null) { next.ph = String(pressingRecord.juice_ph); phTaFilled = true; }
        if (!f.titratableAcidityGl && pressingRecord.juice_ta_gl != null) { next.titratableAcidityGl = String(pressingRecord.juice_ta_gl); phTaFilled = true; }
        if (phTaFilled) phTaSource = "pressing";
      }
      if (phTaFilled) setPhTaFromAnalysis(phTaSource);
      return next;
    });
  };

  // Auto-calculate bottles from volume and size
  const volL = parseFloat(String(form.volumeBottledLitres || "0"));
  const sizeMl = parseInt(String(form.bottleSizeMl || "0"), 10);
  const autoBottles = volL > 0 && sizeMl > 0 ? Math.floor((volL * 1000) / sizeMl) : null;
  const autoCases = autoBottles != null ? Math.floor(autoBottles / 12) : null;

  // Re-derive the colour-source badge while editing an existing record: the
  // fermentation/pressing source queries resolve asynchronously, so this must
  // re-run when they land, not just once in openEdit. Skipped once the operator
  // manually changes the colour (bottlingColourTouched).
  useEffect(() => {
    if (!open || editing === null || bottlingColourTouched) return;
    const storedColour = String(form.wineColour ?? "");
    const bRef = String(form.batchRef ?? "");
    const fermMatch = bRef ? fermentationRecords.find(f => String(f.batch_ref ?? "") === bRef) : undefined;
    const fermColour = fermMatch && fermMatch.wine_colour ? String(fermMatch.wine_colour) : "";
    const pressColour = bRef ? (bottlingPressingRefs.find(p => p.batchRef === bRef)?.wineColour ?? "") : "";
    if (storedColour && fermColour && storedColour === fermColour) {
      setWineColourAutoSource("fermentation");
    } else if (storedColour && pressColour && storedColour === pressColour) {
      setWineColourAutoSource("pressing");
    } else {
      setWineColourAutoSource(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, bottlingColourTouched, form.wineColour, form.batchRef, fermentationRecords, pressingRecords]);

  const openAdd = () => { setEditing(null); setForm({ bottlingDate: today, vintageYear: String(new Date().getFullYear()), isOrganic: "false", certifiedOrganic: "false", bottleSizeMl: "750" }); setSo2FromTest(false); setPhTaFromAnalysis(null); setOrganicAutoSource(null); setWineColourAutoSource(null); setBottlingColourTouched(false); setLotCodeError(null); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    const raw = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]));
    // API returns snake_case; normalize organic boolean fields to camelCase so form checkboxes read them correctly
    if (raw.isOrganic === undefined || raw.isOrganic === "") raw.isOrganic = raw.is_organic ?? "false";
    if (raw.certifiedOrganic === undefined || raw.certifiedOrganic === "") raw.certifiedOrganic = raw.certified_organic ?? "false";
    setForm(raw);
    setSo2FromTest(false);
    setPhTaFromAnalysis(null);
    setOrganicAutoSource(null);
    // Badge derivation happens in the effect above so it re-runs once the
    // fermentation/pressing source queries resolve (they load asynchronously).
    setBottlingColourTouched(false);
    setWineColourAutoSource(null);
    setLotCodeError(null);
    setOpen(true);
  };
  const save = async () => {
    const payload = {
      ...form,
      bottlesProduced: autoBottles != null ? String(autoBottles) : form.bottlesProduced,
      casesProduced: autoCases != null ? String(autoCases) : form.casesProduced,
    };
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === "DUPLICATE_LOT_CODE") {
        setLotCodeError(e.message);
      } else {
        toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
      }
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filteredByYear = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const filtered = bottlingSearch.trim() === "" ? filteredByYear : filteredByYear.filter(r => {
    const q = bottlingSearch.trim().toLowerCase();
    return String(r.batch_ref ?? "").toLowerCase().includes(q)
      || String(r.lot_code ?? "").toLowerCase().includes(q)
      || String(r.wine_colour ?? "").toLowerCase().includes(q)
      || String(r.operator_name ?? "").toLowerCase().includes(q)
      || String(r.notes ?? "").toLowerCase().includes(q);
  });

  const isBottlingRowNonCompliant = (r: Record<string, unknown>): boolean => {
    const colour = String(r.wine_colour ?? "");
    const isOrg = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
    const total = r.total_so2_mg_l != null && r.total_so2_mg_l !== "" ? parseFloat(String(r.total_so2_mg_l)) : null;
    const ceiling = colour ? (isOrg ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour]) : undefined;
    if (total == null || !ceiling) return false;
    return total > parseFloat(ceiling);
  };

  const nonCompliantCount = filtered.filter(isBottlingRowNonCompliant).length;
  const displayRows = nonCompliantOnly ? filtered.filter(isBottlingRowNonCompliant) : filtered;

  // Import-compatible columns derived from BOTTLING_COLUMNS (exact import
  // headers + re-import-safe values: ISO dates, Yes/No booleans), followed by
  // export-only derived columns the import simply ignores.
  const bottlingCsvCols = [
    ...BOTTLING_COLUMNS.map(c => ({ key: c.dbKey, label: c.header, fmt: c.exportValue })),
    { key: "so2_ceiling", label: "SO₂ ceiling (mg/L)", fmt: (r: Record<string, unknown>) => {
      const colour = String(r.wine_colour ?? "");
      if (!colour) return "";
      const isOrg = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
      return (isOrg ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour]) ?? "";
    }},
    { key: "so2_compliant", label: "Compliance", fmt: (r: Record<string, unknown>) => {
      const colour = String(r.wine_colour ?? "");
      const isOrg = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
      const rawTotal = r.total_so2_mg_l;
      if (rawTotal == null || rawTotal === "") return "";
      const total = parseFloat(String(rawTotal));
      if (isNaN(total)) return "";
      const ceiling = colour ? (isOrg ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour]) : undefined;
      if (!ceiling) return "";
      return total <= parseFloat(ceiling) ? "Compliant" : "Exceeds";
    }},
    { key: "certified_organic", label: "Certified Organic", fmt: (r: Record<string, unknown>) => r.certified_organic ? "Yes" : "No" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Bottling Records</p>
          <p className="text-xs text-muted-foreground mt-0.5">Record each bottling run — lot code, volume, bottle format, closure type, and pre-bottling analysis. The lot code is used for excise duty returns and batch traceability.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Bottling Run</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setBottlingSearch(""); setNonCompliantOnly(false); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 text-xs pl-7 w-52"
            placeholder="Batch, lot, wine, operator, notes…"
            value={bottlingSearch}
            onChange={e => setBottlingSearch(e.target.value)}
          />
        </div>
        {nonCompliantCount > 0 && (
          <Button
            size="sm"
            variant={nonCompliantOnly ? "destructive" : "outline"}
            className={nonCompliantOnly ? "h-8 text-xs" : "h-8 text-xs border-red-300 text-red-700 hover:bg-red-50"}
            onClick={() => setNonCompliantOnly(v => !v)}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            {nonCompliantOnly ? "Show all runs" : "Non-compliant only"}
          </Button>
        )}
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          const nonCompliantRows = filtered.filter(isBottlingRowNonCompliant);
          const prefixLines: string[] = [];
          if (nonCompliantRows.length > 0) {
            const lotList = nonCompliantRows.map(r => r.lot_code ? String(r.lot_code) : "(no lot code)").join(", ");
            prefixLines.push(`"WARNING: ${nonCompliantRows.length} run${nonCompliantRows.length !== 1 ? "s" : ""} exceed the applicable SO₂ limit: ${lotList}"`);
          }
          // Traceable export filename — mirrors the SO₂ CSV pattern: include a
          // sanitised search term so a filtered download is identifiable.
          const searchTrim = bottlingSearch.trim();
          const parts = ["bottling-records"];
          if (searchTrim) parts.push(`search-${csvSlug(searchTrim)}`);
          exportCSV(filtered, `${parts.join("-")}.csv`, bottlingCsvCols, prefixLines.length > 0 ? prefixLines : undefined);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <Button size="sm" variant="outline" onClick={() => { resetImportDialog(); setImportOpen(true); }}><Upload className="w-3.5 h-3.5 mr-1" />Import CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} run{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {!crud.isLoading && nonCompliantCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <span>
            <strong>{nonCompliantCount} run{nonCompliantCount !== 1 ? "s" : ""}</strong> exceed{nonCompliantCount === 1 ? "s" : ""} the applicable SO₂ limit
            {yearFilter !== "all" ? ` in ${yearFilter}` : ""}.{" "}
            {!nonCompliantOnly && (
              <button className="underline font-medium" onClick={() => setNonCompliantOnly(true)}>Show non-compliant only</button>
            )}
          </span>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={Wine} title="No bottling records yet" sub="Add a record for each bottling run." />
        : displayRows.length === 0 ? <EmptyState icon={CheckCircle2} title="No non-compliant runs" sub="All bottling runs in this vintage are within the SO₂ limit." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Lot Code</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Colour</th>
              <th className="text-right p-3 font-medium">Volume (L)</th>
              <th className="text-right p-3 font-medium">Bottles</th>
              <th className="text-left p-3 font-medium">Closure</th>
              <th className="text-right p-3 font-medium">Free SO₂</th>
              <th className="text-right p-3 font-medium">Total SO₂</th>
              <th className="text-left p-3 font-medium">SO₂ Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {displayRows.map(r => (
                <tr key={String(r.id)} className={isBottlingRowNonCompliant(r) ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400" : "hover:bg-muted/20"}>
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.bottling_date)}</td>
                  <td className="p-3 font-mono font-semibold text-xs">{fmt(r.lot_code)}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.batch_ref)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {r.wine_colour ? <span className="text-xs bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">{String(r.wine_colour)}</span> : <span className="text-muted-foreground">—</span>}
                      {(r.is_organic === true || r.is_organic === "true") && <span className="inline-flex items-center gap-0.5 text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5"><Leaf className="w-3 h-3" />Organic</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right">{fmtNum(r.volume_bottled_litres, 0)}</td>
                  <td className="p-3 text-right">{fmt(r.bottles_produced)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{fmt(r.closure_type)}</td>
                  <td className="p-3 text-right">{r.free_so2_mg_l ? `${fmtNum(r.free_so2_mg_l, 0)} mg/L` : "—"}</td>
                  <td className="p-3 text-right">{r.total_so2_mg_l ? `${fmtNum(r.total_so2_mg_l, 0)} mg/L` : "—"}</td>
                  <td className="p-3">{(() => {
                    const colour = String(r.wine_colour ?? "");
                    const isOrg = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
                    const total = r.total_so2_mg_l != null ? parseFloat(String(r.total_so2_mg_l)) : null;
                    const ceiling = colour ? (isOrg ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour]) : undefined;
                    if (total == null || !ceiling) return <span className="text-muted-foreground text-xs">—</span>;
                    return (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <So2Badge compliant={total <= parseFloat(ceiling)} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">{fmtNum(total, 0)} / {ceiling} mg/L</span>
                      </div>
                    );
                  })()}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <BatchTrailButton batchRef={r.batch_ref} onClick={() => setTrailRecord(r)} />
                    <ViewAdditionsButton farmId={farmId} record={r} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Bottling Record</DialogTitle></DialogHeader>
          {editing !== null && <SignedEditWarning signed={form.audit_signature} />}
          <div className="space-y-4">
            <SectionLabel>Batch identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bottling Date *</Label><Input type="date" max={today} value={String(form.bottlingDate ?? "")} onChange={e => sf("bottlingDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch Reference</Label>
                <Input
                  list="bottling-pressing-refs"
                  value={String(form.batchRef ?? "")}
                  onChange={e => handleBottlingBatchRefChange(e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
                <datalist id="bottling-pressing-refs">
                  {bottlingPressingRefs.map(p => (
                    <option key={p.batchRef} value={p.batchRef} label={p.vintageYear ? `Vintage ${p.vintageYear}` : undefined} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Lot Code *</Label>
                <Input
                  value={String(form.lotCode ?? "")}
                  onChange={e => { sf("lotCode", e.target.value); setLotCodeError(null); }}
                  placeholder="e.g. LOT2024001A"
                  className={lotCodeError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {lotCodeError && <p className="text-xs text-red-600 mt-1">{lotCodeError}</p>}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Wine Colour</Label>
                  {wineColourAutoSource && !!form.wineColour && (
                    <span className="text-xs text-blue-600">auto from {wineColourAutoSource}</span>
                  )}
                </div>
                <Select value={String(form.wineColour ?? "")} onValueChange={v => { setBottlingColourTouched(true); setWineColourAutoSource(null); sf("wineColour", v); }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source Vessel</Label>
                <Select value={String(form.sourceVesselId ?? "")} onValueChange={v => sf("sourceVesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Operator</Label><StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <SectionLabel>Volume & format</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Volume Bottled (L)</Label><Input type="number" step="0.1" value={String(form.volumeBottledLitres ?? "")} onChange={e => sf("volumeBottledLitres", e.target.value)} /></div>
              <div><Label>Bottle Size (ml)</Label>
                <Select value={String(form.bottleSizeMl ?? "750")} onValueChange={v => sf("bottleSizeMl", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="187">187ml (quarter bottle)</SelectItem>
                    <SelectItem value="375">375ml (half bottle)</SelectItem>
                    <SelectItem value="500">500ml</SelectItem>
                    <SelectItem value="750">750ml (standard)</SelectItem>
                    <SelectItem value="1500">1500ml (magnum)</SelectItem>
                    <SelectItem value="3000">3000ml (double magnum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {autoBottles != null && (
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div><Label>Bottles Produced</Label><div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoBottles.toLocaleString()} <span className="text-blue-600 text-xs">auto</span></div></div>
                  <div><Label>Full Cases (12s)</Label><div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoCases} <span className="text-blue-600 text-xs">auto</span></div></div>
                </div>
              )}
              <div>
                <Label>Closure Type</Label>
                <Select value={String(form.closureType ?? "")} onValueChange={v => sf("closureType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CLOSURE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Cork Grade</Label><Input value={String(form.corkGrade ?? "")} onChange={e => sf("corkGrade", e.target.value)} placeholder="e.g. 1+1, Grade 1, Technical" /></div>
              <div><Label>Label Batch</Label><Input value={String(form.labelBatch ?? "")} onChange={e => sf("labelBatch", e.target.value)} placeholder="e.g. Label-v3" /></div>
            </div>
            <SectionLabel>Organic SO₂ limits</SectionLabel>
            <div className="rounded-md border px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is-organic-chk"
                  checked={form.isOrganic === "true" || form.isOrganic === true}
                  onCheckedChange={v => { sf("isOrganic", v ? "true" : "false"); setOrganicAutoSource(null); }}
                />
                <Label htmlFor="is-organic-chk" className="cursor-pointer">Apply organic SO₂ limits to this batch</Label>
              </div>
              {organicAutoSource && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Leaf className="h-3 w-3 shrink-0" />
                  Inherited from {organicAutoSource} record — override with the checkbox above
                </p>
              )}
              {(form.isOrganic === "true" || form.isOrganic === true) && form.wineColour && ORGANIC_MAX_SO2[String(form.wineColour)] && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Leaf className="h-3 w-3 shrink-0" />
                  Organic ceiling for {String(form.wineColour)}: <strong>{ORGANIC_MAX_SO2[String(form.wineColour)]} mg/L</strong> total SO₂
                  {form.totalSo2MgL && parseFloat(String(form.totalSo2MgL)) > parseFloat(ORGANIC_MAX_SO2[String(form.wineColour)]) && (
                    <span className="ml-1 text-red-600 font-medium">⚠ Entered value exceeds this limit</span>
                  )}
                </p>
              )}
            </div>
            <SectionLabel>Pre-bottling analysis</SectionLabel>
            {so2FromTest && (
              <p className="text-xs text-blue-600 flex items-center gap-1 -mt-1">
                <FlaskConical className="h-3 w-3 shrink-0" />
                SO₂ pre-filled from the most recent SO₂ test for this batch — edit to override
              </p>
            )}
            {phTaFromAnalysis === "fermentation" && (
              <p className="text-xs text-blue-600 flex items-center gap-1 -mt-1">
                <FlaskConical className="h-3 w-3 shrink-0" />
                pH / TA pre-filled from fermentation analysis (end-of-ferment readings) — edit to override
              </p>
            )}
            {phTaFromAnalysis === "pressing" && (
              <p className="text-xs text-blue-600 flex items-center gap-1 -mt-1">
                <FlaskConical className="h-3 w-3 shrink-0" />
                pH / TA pre-filled from pressing juice analysis — edit to override
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Free SO₂ (mg/L)</Label><Input type="number" step="0.1" value={String(form.freeSo2MgL ?? "")} onChange={e => { setSo2FromTest(false); sf("freeSo2MgL", e.target.value); }} /></div>
              <div><Label>Total SO₂ (mg/L)</Label><Input type="number" step="0.1" value={String(form.totalSo2MgL ?? "")} onChange={e => { setSo2FromTest(false); sf("totalSo2MgL", e.target.value); }} /></div>
              <div><Label>Actual ABV %</Label><Input type="number" step="0.01" value={String(form.actualAbvPct ?? "")} onChange={e => sf("actualAbvPct", e.target.value)} /></div>
              <div><Label>Residual Sugar (g/L)</Label><Input type="number" step="0.1" value={String(form.residualSugarGl ?? "")} onChange={e => sf("residualSugarGl", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={e => { setPhTaFromAnalysis(null); sf("ph", e.target.value); }} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => { setPhTaFromAnalysis(null); sf("titratableAcidityGl", e.target.value); }} /></div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox id="cert-org-chk" checked={form.certifiedOrganic === "true" || form.certifiedOrganic === true} onCheckedChange={v => sf("certifiedOrganic", v ? "true" : "false")} />
              <Label htmlFor="cert-org-chk" className="cursor-pointer">This batch is certified organic</Label>
            </div>
            {(form.certifiedOrganic === "true" || form.certifiedOrganic === true) && (
              <div><Label>Certifier Reference</Label><Input value={String(form.certifierRef ?? "")} onChange={e => sf("certifierRef", e.target.value)} placeholder="Batch certification reference" /></div>
            )}
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.bottlingDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Bottling — {fmt(view.lot_code)} ({fmtDate(view.bottling_date)})</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Bottling Date" value={fmtDate(view.bottling_date)} />
              <ViewField label="Lot Code" value={<span className="font-mono font-semibold">{fmt(view.lot_code)}</span>} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
              <ViewField label="Source Vessel" value={fmt(view.source_vessel_ref ?? vessels.find(v => v.id === view.source_vessel_id)?.vessel_ref)} />
              <ViewField label="Volume Bottled" value={view.volume_bottled_litres ? `${fmtNum(view.volume_bottled_litres, 0)} L` : "—"} />
              <ViewField label="Bottle Size" value={view.bottle_size_ml ? `${view.bottle_size_ml} ml` : "—"} />
              <ViewField label="Bottles Produced" value={view.bottles_produced ? Number(view.bottles_produced).toLocaleString() : "—"} />
              <ViewField label="Cases (12s)" value={fmt(view.cases_produced)} />
              <ViewField label="Closure" value={fmt(view.closure_type)} />
              <ViewField label="Cork Grade" value={fmt(view.cork_grade)} />
              <ViewField label="Label Batch" value={fmt(view.label_batch)} />
              <ViewField label="Free SO₂" value={view.free_so2_mg_l ? `${fmtNum(view.free_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Total SO₂" value={(() => {
                const totalSo2 = view.total_so2_mg_l != null ? parseFloat(String(view.total_so2_mg_l)) : null;
                const wc = view.wine_colour ? String(view.wine_colour) : null;
                if (totalSo2 == null || !wc) return view.total_so2_mg_l ? `${fmtNum(view.total_so2_mg_l, 0)} mg/L` : "—";
                const isOrg = view.is_organic === true || view.is_organic === "true" || view.is_organic === 1;
                const ceiling = isOrg ? ORGANIC_MAX_SO2[wc] : CONVENTIONAL_MAX_SO2[wc];
                if (!ceiling) return `${fmtNum(view.total_so2_mg_l, 0)} mg/L`;
                const compliant = totalSo2 <= parseFloat(ceiling);
                return (
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono">{totalSo2.toFixed(0)} mg/L</span>
                    <So2Badge compliant={compliant} />
                    <span className="text-muted-foreground text-xs">(max {ceiling} mg/L{isOrg ? " organic" : ""})</span>
                  </span>
                );
              })()} />
              <ViewField label="Actual ABV" value={view.actual_abv_pct ? `${fmtNum(view.actual_abv_pct, 2)} %` : "—"} />
              <ViewField label="Residual Sugar" value={view.residual_sugar_gl ? `${fmtNum(view.residual_sugar_gl, 1)} g/L` : "—"} />
              <ViewField label="pH" value={fmtNum(view.ph, 2)} />
              <ViewField label="TA" value={view.titratable_acidity_gl ? `${fmtNum(view.titratable_acidity_gl, 1)} g/L` : "—"} />
              <ViewField label="Organic SO₂ Limits" value={(view.is_organic === true || view.is_organic === "true")
                ? <span className="inline-flex items-center gap-1 text-green-700 font-medium"><Leaf className="w-3.5 h-3.5" />Organic limits apply{view.wine_colour && ORGANIC_MAX_SO2[String(view.wine_colour)] ? ` (max ${ORGANIC_MAX_SO2[String(view.wine_colour)]} mg/L)` : ""}</span>
                : "No — conventional limits"} />
              <ViewField label="Certified Organic" value={view.certified_organic ? <span className="text-green-700 font-medium">Yes — {fmt(view.certifier_ref)}</span> : "No"} />
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            <EditHistorySection history={view.edit_history} />
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-bottling" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Bottling Record</DialogTitle><DialogDescription>Remove lot {fmt(deleting?.lot_code)}?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameBottling}
          onClose={() => setTrailRecord(null)}
        />
      )}

      {/* CSV Import Dialog */}
      <Dialog open={importOpen} onOpenChange={o => { if (!o) { setImportOpen(false); resetImportDialog(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Bottling Records from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk-create bottling records. Rows missing required fields (Bottling Date, Vintage Year) or with duplicate lot codes will be reported and skipped. Other rows will be imported.
            </DialogDescription>
          </DialogHeader>

          {!importResult && (
            <div className="space-y-4">
              <div className="rounded-md border border-dashed p-4 bg-muted/30 text-xs text-muted-foreground space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">Expected CSV columns (header row required):</p>
                  <button
                    type="button"
                    onClick={downloadBottlingTemplate}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <FileDown className="w-3 h-3" />Download template
                  </button>
                </div>
                <p className="font-mono">{BOTTLING_IMPORT_HEADERS.join(", ")}</p>
                <p className="mt-1">Exports from this register use a compatible format and can be re-imported directly. The template includes an example row showing the expected formats — delete it before importing.</p>
              </div>
              <div>
                <Label>Select CSV file</Label>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImportFile}
                  className="mt-1 block w-full text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
              {importError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
              {importWarnings.length > 0 && !importError && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">This file contains warning{importWarnings.length !== 1 ? "s" : ""} from a previous export:</p>
                    {importWarnings.map((w, i) => <p key={i} className="text-xs mt-1">{w}</p>)}
                    <p className="text-xs mt-1 text-amber-700">Warning lines are skipped on import — only data rows below the header will be imported.</p>
                  </div>
                </div>
              )}
              {importParsed.length > 0 && !importError && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  <p className="font-medium">{importParsed.length} row{importParsed.length !== 1 ? "s" : ""} parsed from file.</p>
                  {importParsed.length > 0 && (
                    <p className="text-xs mt-1 text-blue-600">
                      Lot codes found: {importParsed.filter(r => r["Lot Code"] || r["lot_code"]).length} of {importParsed.length} rows have a lot code.
                    </p>
                  )}
                  <div className="mt-2 max-h-32 overflow-y-auto rounded border border-blue-200 bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-blue-100"><tr>
                        <th className="text-left p-1.5 font-medium">Date</th>
                        <th className="text-left p-1.5 font-medium">Lot Code</th>
                        <th className="text-left p-1.5 font-medium">Batch Ref</th>
                        <th className="text-left p-1.5 font-medium">Colour</th>
                        <th className="text-right p-1.5 font-medium">Volume (L)</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {importParsed.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-muted/10">
                            <td className="p-1.5">{row["Bottling Date"] || row["bottling_date"] || "—"}</td>
                            <td className="p-1.5 font-mono">{row["Lot Code"] || row["lot_code"] || "—"}</td>
                            <td className="p-1.5 font-mono">{row["Batch Ref"] || row["batch_ref"] || "—"}</td>
                            <td className="p-1.5">{row["Wine Colour"] || row["wine_colour"] || "—"}</td>
                            <td className="p-1.5 text-right">{row["Volume Bottled (L)"] || row["volume_bottled_litres"] || "—"}</td>
                          </tr>
                        ))}
                        {importParsed.length > 10 && (
                          <tr><td colSpan={5} className="p-1.5 text-center text-muted-foreground">… and {importParsed.length - 10} more rows</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className="space-y-3">
              <div className={`rounded-md p-3 border flex items-start gap-2 ${importResult.insertedCount > 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                {importResult.insertedCount > 0 ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium text-sm">
                    {importResult.insertedCount} record{importResult.insertedCount !== 1 ? "s" : ""} imported successfully.
                    {importResult.rejectedCount > 0 && ` ${importResult.rejectedCount} row${importResult.rejectedCount !== 1 ? "s" : ""} skipped — see details below.`}
                  </p>
                </div>
              </div>
              {importResult.rejected.length > 0 && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-red-800 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />Skipped rows:</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2 border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => {
                        // Headers and aliases derived from BOTTLING_COLUMNS so
                        // snake_case and legacy headers round-trip correctly
                        const skippedRows = importResult.rejected
                          .map(r => importParsed[r.row - 1])
                          .filter(Boolean);
                        const header = BOTTLING_IMPORT_HEADERS.map(h => `"${h}"`).join(",");
                        const body = skippedRows.map(row =>
                          BOTTLING_IMPORT_HEADERS.map(h => `"${resolveBottlingField(row, h).replace(/"/g, '""')}"`).join(",")
                        ).join("\n");
                        const blob = new Blob([header + "\n" + body + "\n"], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "bottling-skipped-rows.csv";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FileDown className="w-3 h-3 mr-1" />Download skipped rows as CSV
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.rejected.map((r, i) => (
                      <div key={i} className="text-xs text-red-700 bg-red-100 rounded px-2 py-1">
                        <span className="font-medium">Row {r.row}</span>{r.lotCode ? <span className="font-mono ml-1">[{r.lotCode}]</span> : ""}: {r.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); resetImportDialog(); }}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button
                onClick={submitImport}
                disabled={importParsed.length === 0 || importLoading || !!importError}
              >
                {importLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Import {importParsed.length > 0 ? `${importParsed.length} Row${importParsed.length !== 1 ? "s" : ""}` : ""}
              </Button>
            )}
            {importResult && importResult.rejected.length > 0 && (
              <Button variant="outline" onClick={resetImportDialog}>
                Import Another File
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── SO₂ Testing Register ─────────────────────────────────────────────────────
export function So2TestingTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-so2-tests", "winery-so2-tests");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: equipment = [] } = useEquipment(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = usePersistedYearFilter("so2-testing", farmId);
  const [so2Search, setSo2Search] = useState("");
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const [highlightedSo2RowId, setHighlightedSo2RowId] = useState<string | null>(null);
  // True while the operator is remediating flagged rows via the amber banner's
  // Fix button — after a save we auto-advance to the next flagged row.
  const [fixingFlaggedSo2, setFixingFlaggedSo2] = useState(false);
  const firstFlaggedSo2RowRef = useRef<HTMLTableRowElement>(null);
  const { data: farmsDataSo2 } = useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
  const farmNameSo2: string = (Array.isArray(farmsDataSo2?.farms)
    ? (farmsDataSo2.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`;
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const so2PressingRefs = pressingRecords
    .filter(r => r.batch_ref)
    .map(r => ({ batchRef: String(r.batch_ref), vintageYear: String(r.vintage_year ?? ""), wineColour: String(r.wine_colour ?? ""), isOrganic: !!(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) }))
    .sort((a, b) => b.batchRef.localeCompare(a.batchRef));

  const [isSo2BatchOrganic, setIsSo2BatchOrganic] = useState(false);
  const [so2WineColourAutoFilled, setSo2WineColourAutoFilled] = useState(false);

  const handleSo2BatchRefChange = (val: string) => {
    sf("batchRef", val);
    const match = so2PressingRefs.find(p => p.batchRef === val);
    const organic = match?.isOrganic ?? false;
    setIsSo2BatchOrganic(organic);
    if (match && !form.vintageYear) sf("vintageYear", match.vintageYear);
    if (match) {
      // Use the already-selected wine colour if present, otherwise pull it from the pressing record.
      // Either way, re-run the ceiling auto-fill so maxPermittedMgL reflects the correct
      // organic/conventional limit for this batch even when colour was set before the batch ref.
      const colour = form.wineColour || match.wineColour;
      if (colour) {
        handleColourChangeWithOrganic(colour, organic);
        // Mark auto-fill only when colour came from pressing (operator hadn't set it yet)
        if (!form.wineColour && match.wineColour) setSo2WineColourAutoFilled(true);
      }
    }
  };

  const isLab = form.testMethod === "Third-party laboratory";
  const isOnSite = form.testMethod?.startsWith("On-site");

  const autoCompliant: boolean | null = useMemo(() => {
    const total = parseFloat(form.totalSo2MgL ?? "");
    const max = parseFloat(form.maxPermittedMgL ?? "");
    if (isNaN(total) || isNaN(max)) return null;
    return total <= max;
  }, [form.totalSo2MgL, form.maxPermittedMgL]);

  const allSo2LimitValues = [...Object.values(ORGANIC_MAX_SO2), ...Object.values(CONVENTIONAL_MAX_SO2)];

  const handleColourChangeWithOrganic = (colour: string, organic: boolean) => {
    const autoMax = organic ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour];
    setForm(f => ({
      ...f,
      wineColour: colour,
      ...(!f.maxPermittedMgL || allSo2LimitValues.includes(f.maxPermittedMgL) ? { maxPermittedMgL: autoMax ?? f.maxPermittedMgL } : {}),
    }));
  };

  const handleColourChange = (colour: string) => {
    setSo2WineColourAutoFilled(false);
    handleColourChangeWithOrganic(colour, isSo2BatchOrganic);
  };

  const openAdd = () => { setEditing(null); setIsSo2BatchOrganic(false); setSo2WineColourAutoFilled(false); setForm({ testDate: today, vintageYear: String(new Date().getFullYear()), testMethod: "On-site — Ripper titration", testStage: "pre-bottling" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setSo2WineColourAutoFilled(false);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    // Determine organic status from linked pressing batch (if any)
    const batchRef = String(r.batch_ref ?? "");
    const match = so2PressingRefs.find(p => p.batchRef === batchRef);
    setIsSo2BatchOrganic(match?.isOrganic ?? false);
    setOpen(true);
  };
  const save = async () => {
    const payload = { ...form, so2Compliant: autoCompliant != null ? String(autoCompliant) : form.so2Compliant };
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      // Fix-flow auto-advance: when remediating flagged rows via the amber
      // banner's Fix button, jump straight to the next flagged row after each
      // save. The just-saved row is excluded locally (the refetch may not have
      // landed yet); if it still lacks a batch ref it re-flags on the next pass.
      if (fixingFlaggedSo2 && editing !== null) {
        const nextFlagged = filtered.filter(r => r.id !== editing && isFlaggedSo2Row(r));
        if (nextFlagged.length > 0) {
          toast({ title: "Saved", description: `${nextFlagged.length} flagged test${nextFlagged.length !== 1 ? "s" : ""} remaining — opening the next one.` });
          openEdit(nextFlagged[0]);
          return;
        }
        setFixingFlaggedSo2(false);
        toast({ title: "Saved", description: "All flagged tests fixed." });
        setOpen(false);
        return;
      }
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filteredByYearSo2 = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const filtered = so2Search.trim() === "" ? filteredByYearSo2 : filteredByYearSo2.filter(r => {
    const q = so2Search.trim().toLowerCase();
    return (
      String(r.batch_ref ?? "").toLowerCase().includes(q) ||
      String(r.wine_name ?? "").toLowerCase().includes(q) ||
      String(r.wine_colour ?? "").toLowerCase().includes(q) ||
      String(r.test_stage ?? "").toLowerCase().includes(q) ||
      (SO2_TEST_STAGE_LABELS[String(r.test_stage ?? "")] ?? "").toLowerCase().includes(q)
    );
  });

  // Rows where batch_ref is missing and max_permitted_mg_l is an organic ceiling value
  const ORGANIC_LIMIT_NUMBERS = new Set(Object.values(ORGANIC_MAX_SO2).map(v => parseFloat(v)));
  const unverifiedLimitCount = filtered.filter(r => {
    if (r.batch_ref) return false;
    const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
    return maxVal != null && ORGANIC_LIMIT_NUMBERS.has(maxVal);
  }).length;

  const isFlaggedSo2Row = (r: Record<string, unknown>) => {
    if (r.batch_ref) return false;
    const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
    return maxVal != null && ORGANIC_LIMIT_NUMBERS.has(maxVal);
  };
  const findFirstFlaggedSo2 = () => filtered.find(isFlaggedSo2Row);

  const handleReviewFlaggedSo2 = () => {
    const firstFlagged = findFirstFlaggedSo2();
    if (!firstFlagged) return;
    const rowId = String(firstFlagged.id);
    setHighlightedSo2RowId(rowId);
    firstFlaggedSo2RowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightedSo2RowId(null), 2500);
  };

  const handleFixFlaggedSo2 = () => {
    const firstFlagged = findFirstFlaggedSo2();
    if (!firstFlagged) return;
    setFixingFlaggedSo2(true);
    openEdit(firstFlagged);
  };

  // Organic ceiling for a test row — only when the linked pressing batch is organic (mirrors view dialog logic)
  const so2OrganicCeiling = (r: Record<string, unknown>): number | null => {
    const wc = r.wine_colour ? String(r.wine_colour) : null;
    if (!wc || !ORGANIC_MAX_SO2[wc]) return null;
    const batchRef = r.batch_ref ? String(r.batch_ref) : null;
    const matchedPressing = batchRef ? so2PressingRefs.find(p => p.batchRef === batchRef) : null;
    if (!matchedPressing?.isOrganic) return null;
    return parseFloat(ORGANIC_MAX_SO2[wc]);
  };

  const so2CsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "test_date", label: "Test Date", fmt: (r: Record<string, unknown>) => fmtDate(r.test_date) },
    { key: "wine_name", label: "Wine Name" },
    { key: "wine_colour", label: "Colour" },
    { key: "test_stage", label: "Stage" },
    { key: "free_so2_mg_l", label: "Free SO₂ (mg/L)" },
    { key: "total_so2_mg_l", label: "Total SO₂ (mg/L)" },
    { key: "max_permitted_mg_l", label: "Max Permitted (mg/L)" },
    { key: "so2_compliant", label: "Compliant", fmt: (r: Record<string, unknown>) => r.so2_compliant ? "Yes" : "No" },
    { key: "organic_ceiling_mg_l", label: "Organic Ceiling (mg/L)", fmt: (r: Record<string, unknown>) => { const c = so2OrganicCeiling(r); return c != null ? String(c) : ""; } },
    { key: "organic_pass_fail", label: "Organic Pass/Fail", fmt: (r: Record<string, unknown>) => {
      const c = so2OrganicCeiling(r);
      if (c == null) return "—";
      const total = r.total_so2_mg_l != null && r.total_so2_mg_l !== "" ? parseFloat(String(r.total_so2_mg_l)) : null;
      if (total == null || isNaN(total)) return "—";
      return total <= c ? "Pass" : "Fail";
    } },
    // Mirrors the on-screen table flag and the batch-trail PDF so2Rows builder:
    // an organic-ceiling max_permitted with no batch_ref means the limit can't
    // be verified against a batch record.
    { key: "limit_unverified", label: "Limit Unverified", fmt: (r: Record<string, unknown>) => {
      const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
      const organicLimits = new Set(Object.values(ORGANIC_MAX_SO2).map(v => parseFloat(v)));
      return !r.batch_ref && maxVal != null && organicLimits.has(maxVal) ? "Yes — no batch ref" : "";
    } },
    { key: "test_method", label: "Test Method" },
    { key: "notes", label: "Notes" },
  ];

  const so2ChartData = [...filtered]
    .sort((a, b) => String(a.test_date ?? "").localeCompare(String(b.test_date ?? "")))
    .map(r => ({
      date: r.test_date ? new Date(String(r.test_date)).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—",
      "Free SO₂": r.free_so2_mg_l ? parseFloat(String(r.free_so2_mg_l)) : null,
      "Total SO₂": r.total_so2_mg_l ? parseFloat(String(r.total_so2_mg_l)) : null,
      max: r.max_permitted_mg_l ? parseFloat(String(r.max_permitted_mg_l)) : null,
      // Organic ceiling for this test's linked pressing batch (null when batch is conventional/unlinked)
      "Organic ceiling": so2OrganicCeiling(r),
    }));
  const so2MaxLimit = so2ChartData.length > 0 ? Math.max(...so2ChartData.map(d => d.max ?? 0)) : 0;
  // Organic ceiling reference — shown when any displayed test belongs to an organic pressing batch.
  // Use the lowest applicable ceiling so the line is conservative across mixed wine colours.
  const so2OrganicCeilings = so2ChartData.map(d => d["Organic ceiling"]).filter((v): v is number => v != null);
  const so2OrganicLine = so2OrganicCeilings.length > 0 ? Math.min(...so2OrganicCeilings) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">SO₂ Testing Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Standalone register of every SO₂ measurement taken across all wines — at pressing, through winemaking, and pre-bottling. This is the primary organic certification audit document. Total SO₂ against the organic limit is auto-assessed.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Test</Button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
        <p><strong>Organic limits (UK-retained Reg 203/2012):</strong> Red 100 mg/L · White/Rosé 150 mg/L · Sparkling 185 mg/L</p>
        <p><strong>Conventional limits (Reg 1308/2013):</strong> Red 150 mg/L · White/Rosé 200 mg/L · Sparkling 235 mg/L</p>
        <p>These are <em>total</em> SO₂ limits. The max permitted field auto-fills from the linked batch's organic status — edit it to override.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setSo2Search(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input className="h-8 pl-7 text-xs w-52" placeholder="Search batch, colour, stage…" value={so2Search} onChange={e => setSo2Search(e.target.value)} />
        </div>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          // Traceable export filename — mirrors the Additions Report pattern:
          // include the active vintage and/or sanitised search term so a
          // downloaded subset is identifiable during audits.
          const searchTrim = so2Search.trim();
          const searchSlug = searchTrim ? csvSlug(searchTrim) : "";
          const parts = ["so2-testing"];
          if (yearFilter !== "all") parts.push(yearFilter);
          if (searchSlug) parts.push(`search-${searchSlug}`);
          const prefixLines = [
            csvComment(`SO₂ Testing Register — ${farmNameSo2}`),
            csvComment(`Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}`),
            csvComment(`Search filter: ${searchTrim || "None"}`),
          ];
          exportCSV(filtered, `${parts.join("-")}.csv`, so2CsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} test{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {so2ChartData.length > 1 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">SO₂ Levels Over Time (mg/L)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={so2ChartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {so2MaxLimit > 0 && <ReferenceLine y={so2MaxLimit} stroke="#ef4444" strokeDasharray="4 2" label={{ value: `Limit ${so2MaxLimit}`, position: "insideTopRight", fontSize: 9, fill: "#ef4444" }} />}
              {so2OrganicLine != null && so2OrganicLine !== so2MaxLimit && (
                <ReferenceLine y={so2OrganicLine} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: `Organic ${so2OrganicLine}`, position: "insideBottomRight", fontSize: 9, fill: "#d97706" }} />
              )}
              <Line type="monotone" dataKey="Total SO₂" stroke="#8b5cf6" dot={(props: { cx?: number; cy?: number; index?: number; payload?: Record<string, unknown>; value?: number }) => {
                // Breach flag: colour the dot red when this test's Total SO₂ exceeds
                // its own row's organic ceiling (only set when the linked pressing
                // batch is organic). Conventional/unlinked tests keep the purple dot.
                const { cx, cy, index, payload, value } = props;
                if (cx == null || cy == null || value == null) return <g key={`total-so2-dot-${index}`} />;
                const ceiling = payload?.["Organic ceiling"] as number | null | undefined;
                const breach = ceiling != null && value > ceiling;
                return breach
                  ? <circle key={`total-so2-dot-${index}`} cx={cx} cy={cy} r={4.5} fill="#ef4444" stroke="#b91c1c" strokeWidth={1.5} />
                  : <circle key={`total-so2-dot-${index}`} cx={cx} cy={cy} r={3} fill="#8b5cf6" />;
              }} connectNulls />
              <Line type="monotone" dataKey="Free SO₂" stroke="#3b82f6" dot={{ r: 3 }} connectNulls />
              {so2OrganicLine != null && (
                <Line type="stepAfter" dataKey="Organic ceiling" stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} dot={false} activeDot={false} connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
          {so2OrganicLine != null && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Leaf className="w-3 h-3 text-amber-600" />
              Organic batches in view — the lower organic ceiling ({so2OrganicLine} mg/L{so2OrganicCeilings.some(v => v !== so2OrganicLine) ? " or colour-specific" : ""}) applies to those tests, not the conventional limit. Red dots mark Total SO₂ tests above their batch's organic ceiling.
            </p>
          )}
        </div>
      )}
      {unverifiedLimitCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
          <span className="flex-1">
            <strong>{unverifiedLimitCount} test{unverifiedLimitCount !== 1 ? "s" : ""}</strong> {unverifiedLimitCount !== 1 ? "have" : "has"} no batch reference and {unverifiedLimitCount !== 1 ? "carry" : "carries"} an organic SO₂ ceiling — the limit may be incorrect if the wine is conventional.
          </span>
          <button
            type="button"
            onClick={handleReviewFlaggedSo2}
            className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Review
          </button>
          <button
            type="button"
            onClick={handleFixFlaggedSo2}
            className="shrink-0 inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Pencil className="h-3 w-3" />
            Fix{unverifiedLimitCount > 1 ? ` (${unverifiedLimitCount} remaining)` : ""}
          </button>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : filtered.length === 0 ? <EmptyState icon={FlaskConical} title="No SO₂ tests logged" sub="Record each SO₂ analysis here — at pressing, post-racking, and pre-bottling." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Vessel</th>
              <th className="text-left p-3 font-medium">Stage</th>
              <th className="text-left p-3 font-medium">Method</th>
              <th className="text-right p-3 font-medium">Free SO₂</th>
              <th className="text-right p-3 font-medium">Total SO₂</th>
              <th className="text-right p-3 font-medium">Max (mg/L)</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map((r, idx) => {
                const batchMissing = !r.batch_ref;
                const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
                const isUnverifiedLimit = batchMissing && maxVal != null && ORGANIC_LIMIT_NUMBERS.has(maxVal);
                const rowId = String(r.id);
                const isFirstFlagged = isUnverifiedLimit && !filtered.slice(0, idx).some(prev => {
                  const prevMax = prev.max_permitted_mg_l != null && prev.max_permitted_mg_l !== "" ? parseFloat(String(prev.max_permitted_mg_l)) : null;
                  return !prev.batch_ref && prevMax != null && ORGANIC_LIMIT_NUMBERS.has(prevMax);
                });
                const isHighlighted = highlightedSo2RowId === rowId;
                return (
                <tr
                  key={rowId}
                  ref={isFirstFlagged ? firstFlaggedSo2RowRef : undefined}
                  className={`transition-colors duration-700${isHighlighted ? " bg-amber-200" : isUnverifiedLimit ? " bg-amber-50/40 hover:bg-muted/20" : " hover:bg-muted/20"}`}
                >
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.test_date)}</td>
                  <td className="p-3 font-mono text-xs">
                    <span className="inline-flex items-center gap-1">
                      {fmt(r.batch_ref)}
                      {isUnverifiedLimit && (
                        <span
                          title="Batch reference missing — verify SO₂ limit is correct for this wine's organic status"
                          className="inline-flex items-center text-amber-500 cursor-help"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs">{fmt(r.vessel_ref ?? vessels.find(v => v.id === r.vessel_id)?.vessel_ref)}</td>
                  <td className="p-3 text-xs">{SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? fmt(r.test_stage)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{fmt(r.test_method)}</td>
                  <td className="p-3 text-right">{r.free_so2_mg_l ? `${fmtNum(r.free_so2_mg_l, 0)}` : "—"}</td>
                  <td className="p-3 text-right font-semibold">{r.total_so2_mg_l ? `${fmtNum(r.total_so2_mg_l, 0)}` : "—"}</td>
                  <td className="p-3 text-right text-muted-foreground">{r.max_permitted_mg_l ? `${fmtNum(r.max_permitted_mg_l, 0)}` : "—"}</td>
                  <td className="p-3"><So2Badge compliant={r.so2_compliant} /></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <BatchTrailButton batchRef={r.batch_ref} onClick={() => setTrailRecord(r)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setFixingFlaggedSo2(false); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Log"} SO₂ Test</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Sample identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Test Date *</Label><Input type="date" max={today} value={form.testDate ?? ""} onChange={e => sf("testDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch Reference</Label>
                <Input
                  list="so2-pressing-refs"
                  value={form.batchRef ?? ""}
                  onChange={e => handleSo2BatchRefChange(e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
                <datalist id="so2-pressing-refs">
                  {so2PressingRefs.map(p => (
                    <option key={p.batchRef} value={p.batchRef} label={p.vintageYear ? `Vintage ${p.vintageYear}` : undefined} />
                  ))}
                </datalist>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Wine Colour</Label>
                  {so2WineColourAutoFilled && !!form.wineColour && (
                    <span className="text-xs text-blue-600">auto from pressing</span>
                  )}
                </div>
                <Select value={form.wineColour ?? ""} onValueChange={handleColourChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vessel</Label>
                <Select value={form.vesselId ?? ""} onValueChange={v => sf("vesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent><SelectItem value="">— None —</SelectItem>{vessels.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Test Stage</Label>
                <Select value={form.testStage ?? ""} onValueChange={v => sf("testStage", v)}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>{SO2_TEST_STAGES.map(o => <SelectItem key={o} value={o}>{SO2_TEST_STAGE_LABELS[o]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <SectionLabel>Test method</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Test Method</Label>
                <Select value={form.testMethod ?? ""} onValueChange={v => sf("testMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>{SO2_TEST_METHODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isOnSite && equipment.length > 0 && (
                <div className="col-span-2">
                  <Label>Equipment Used</Label>
                  <Select value={form.equipmentId ?? ""} onValueChange={v => sf("equipmentId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                    <SelectContent><SelectItem value="">— Not specified —</SelectItem>{equipment.map(e => <SelectItem key={String(e.id)} value={String(e.id)}>{String(e.equipment_ref)} — {String(e.equipment_type ?? "")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {isLab && (
                <>
                  <div><Label>Laboratory Name</Label><Input value={form.labName ?? ""} onChange={e => sf("labName", e.target.value)} placeholder="e.g. WineLab UK Ltd" /></div>
                  <div><Label>Lab Report Reference</Label><Input value={form.labRef ?? ""} onChange={e => sf("labRef", e.target.value)} placeholder="Report or sample ref" /></div>
                </>
              )}
            </div>
            <SectionLabel>Results</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Free SO₂ (mg/L)</Label><Input type="number" step="0.1" value={form.freeSo2MgL ?? ""} onChange={e => sf("freeSo2MgL", e.target.value)} /></div>
              <div><Label>Total SO₂ (mg/L)</Label><Input type="number" step="0.1" value={form.totalSo2MgL ?? ""} onChange={e => sf("totalSo2MgL", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={form.ph ?? ""} onChange={e => sf("ph", e.target.value)} placeholder="e.g. 3.45" /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={form.titratableAcidityGl ?? ""} onChange={e => sf("titratableAcidityGl", e.target.value)} placeholder="e.g. 7.2" /></div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Max Permitted (mg/L)</Label>
                  {form.wineColour && (ORGANIC_MAX_SO2[form.wineColour] || CONVENTIONAL_MAX_SO2[form.wineColour]) && (
                    <span className="text-xs text-blue-600">{isSo2BatchOrganic ? "🌿 organic limit" : "conv. limit"} auto from colour</span>
                  )}
                </div>
                <Input type="number" step="1" value={form.maxPermittedMgL ?? ""} onChange={e => sf("maxPermittedMgL", e.target.value)} placeholder={isSo2BatchOrganic ? "100 / 150 / 185 (organic)" : "150 / 200 / 235 (conv.)"} />
              </div>
              {autoCompliant !== null && (
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Compliance:</span>
                  <So2Badge compliant={autoCompliant} />
                  <span className="text-xs text-muted-foreground">({form.totalSo2MgL} mg/L {autoCompliant ? "≤" : ">"} {form.maxPermittedMgL} mg/L limit)</span>
                </div>
              )}
            </div>
            <div><Label>Action Taken (if any)</Label><Input value={form.actionTaken ?? ""} onChange={e => sf("actionTaken", e.target.value)} placeholder="e.g. Added 15mg/L SO₂ before bottling" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setFixingFlaggedSo2(false); }}>Cancel</Button>
            <Button onClick={save} disabled={!form.testDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>SO₂ Test — {fmtDate(view.test_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Test Date" value={fmtDate(view.test_date)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
              <ViewField label="Vessel" value={fmt(view.vessel_ref ?? vessels.find(v => v.id === view.vessel_id)?.vessel_ref)} />
              <ViewField label="Test Stage" value={SO2_TEST_STAGE_LABELS[String(view.test_stage)] ?? fmt(view.test_stage)} />
              <ViewField label="Test Method" value={fmt(view.test_method)} />
              <ViewField label="Equipment" value={fmt(view.equipment_ref ?? equipment.find(e => e.id === view.equipment_id)?.equipment_ref)} />
              {!!view.lab_name && <ViewField label="Laboratory" value={fmt(view.lab_name)} />}
              {!!view.lab_ref && <ViewField label="Lab Ref" value={fmt(view.lab_ref)} />}
              <ViewField label="Free SO₂" value={view.free_so2_mg_l ? `${fmtNum(view.free_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Total SO₂" value={view.total_so2_mg_l ? `${fmtNum(view.total_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Max Permitted" value={view.max_permitted_mg_l ? `${fmtNum(view.max_permitted_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Compliance" value={<So2Badge compliant={view.so2_compliant} />} />
              <ViewField label="pH" value={view.ph ? fmtNum(view.ph, 2) : "—"} />
              <ViewField label="TA" value={view.titratable_acidity_gl ? `${fmtNum(view.titratable_acidity_gl, 1)} g/L` : "—"} />
              {(() => {
                const wc = view.wine_colour ? String(view.wine_colour) : null;
                if (!wc || !ORGANIC_MAX_SO2[wc]) return null;
                const batchRef = view.batch_ref ? String(view.batch_ref) : null;
                const matchedPressing = batchRef ? so2PressingRefs.find(p => p.batchRef === batchRef) : null;
                if (!matchedPressing?.isOrganic) return null;
                const orgCeiling = parseFloat(ORGANIC_MAX_SO2[wc]);
                const totalSo2 = view.total_so2_mg_l != null && view.total_so2_mg_l !== "" ? parseFloat(String(view.total_so2_mg_l)) : null;
                const pass = totalSo2 != null ? totalSo2 <= orgCeiling : null;
                return (
                  <div className="col-span-2 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm">
                    <Leaf className="w-4 h-4 text-green-700 shrink-0" />
                    <span className="text-green-800 font-medium">Organic batch — ceiling {orgCeiling} mg/L total SO₂</span>
                    {pass === true && <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />Pass</span>}
                    {pass === false && <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3" />Exceeds organic limit</span>}
                  </div>
                );
              })()}
              {!!view.action_taken && <div className="col-span-2"><ViewField label="Action Taken" value={fmt(view.action_taken)} /></div>}
              <ViewField label="Operator" value={fmt(view.operator_name)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-so2-test" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete SO₂ Test</DialogTitle><DialogDescription>Remove SO₂ test record from {fmtDate(deleting?.test_date)}?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameSo2}
          onClose={() => setTrailRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Equipment Register Tab ───────────────────────────────────────────────────
function CalibrationRows({ farmId, equipmentId }: { farmId: number; equipmentId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-equipment-cals", farmId, equipmentId],
    queryFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations`), { credentials: "include" }); return (await r.json()).records ?? []; },
    enabled: !!equipmentId,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ calibrationDate: today, result: "pass" });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addMut = useMutation({
    mutationFn: async () => { const r = await fetch(api(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Save failed"); } },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-equipment-cals", farmId, equipmentId] }); qc.invalidateQueries({ queryKey: ["winery-equipment", farmId] }); setShowAdd(false); setForm({ calibrationDate: today, result: "pass" }); toast({ title: "Calibration recorded" }); },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: async (calId: number) => { const r = await fetch(api(`farms/${farmId}/winery-equipment/${equipmentId}/calibrations/${calId}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); } },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["winery-equipment-cals", farmId, equipmentId] }),
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message || "An unexpected error occurred.", variant: "destructive" }),
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Calibration Records</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(s => !s)}><Plus className="w-3 h-3 mr-1" />Log Calibration</Button>
      </div>
      {showAdd && (
        <div className="border rounded-lg p-3 mb-3 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Calibration Date *</Label><Input type="date" max={today} value={form.calibrationDate ?? ""} onChange={e => sf("calibrationDate", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Result</Label>
              <Select value={form.result ?? "pass"} onValueChange={v => sf("result", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{CALIBRATION_RESULT_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Standard Used</Label><Input value={form.standardUsed ?? ""} onChange={e => sf("standardUsed", e.target.value)} className="h-8 text-xs" placeholder="e.g. HANNA buffer pH 7.01" /></div>
            <div><Label className="text-xs">Expected Value</Label><Input type="number" step="0.001" value={form.expectedValue ?? ""} onChange={e => sf("expectedValue", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Pre-cal Reading</Label><Input type="number" step="0.001" value={form.preCalibrationReading ?? ""} onChange={e => sf("preCalibrationReading", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Post-cal Reading</Label><Input type="number" step="0.001" value={form.postCalibrationReading ?? ""} onChange={e => sf("postCalibrationReading", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Next Cal Due</Label><Input type="date" value={form.nextCalibrationDue ?? ""} onChange={e => sf("nextCalibrationDue", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Operator</Label><Input value={form.operatorName ?? ""} onChange={e => sf("operatorName", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Certificate Ref</Label><Input value={form.certificateRef ?? ""} onChange={e => sf("certificateRef", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs">Action Taken</Label><Input value={form.actionTaken ?? ""} onChange={e => sf("actionTaken", e.target.value)} className="h-8 text-xs" placeholder="e.g. Adjusted" /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={1} className="text-xs" /></div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => addMut.mutate()} disabled={!form.calibrationDate || addMut.isPending}>{addMut.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Save</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No calibration records yet.</p> : (
        <div className="space-y-1">
          {(data ?? []).map(c => {
            const res = String(c.result ?? "pass");
            const badge = res === "pass" ? <span className="text-xs text-green-700 font-medium">✓ Pass</span> : res === "fail" ? <span className="text-xs text-red-700 font-medium">✗ Fail</span> : <span className="text-xs text-amber-700 font-medium">~ Adjusted</span>;
            return (
              <div key={String(c.id)} className="flex items-center justify-between text-xs border rounded px-3 py-1.5 gap-2">
                <span className="font-medium whitespace-nowrap">{fmtDate(c.calibration_date)}</span>
                <span className="text-muted-foreground">{fmt(c.standard_used)}</span>
                {badge}
                <span className="text-muted-foreground">{c.operator_name ? fmt(c.operator_name) : ""}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500 shrink-0" onClick={() => delMut.mutate(Number(c.id))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EquipmentRegisterTab({ farmId }: { farmId: number }) {
  const farmNameEquip = useFarmName(farmId);
  const crud = useCrud(farmId, "winery-equipment", "winery-equipment");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const now = new Date();
  const soon = new Date(); soon.setDate(soon.getDate() + 30);
  const overdue = crud.data.filter(e => e.next_calibration_due && new Date(e.next_calibration_due as string) < now);
  const dueSoon = crud.data.filter(e => {
    if (!e.next_calibration_due) return false;
    const d = new Date(e.next_calibration_due as string);
    return d >= now && d <= soon;
  });

  const openAdd = () => { setEditing(null); setForm({ status: "active" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...form } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(form);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const calStatus = (r: Record<string, unknown>) => {
    if (!r.next_calibration_due) return null;
    const d = new Date(r.next_calibration_due as string);
    if (d < now) return <span className="text-xs bg-red-100 text-red-700 rounded px-1.5 py-0.5">Overdue</span>;
    if (d <= soon) return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Due soon</span>;
    return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Current</span>;
  };
  const equipCsvCols = [
    { key: "equipment_ref", label: "Equipment Ref" },
    { key: "equipment_type", label: "Equipment Type" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "model", label: "Model" },
    { key: "serial_number", label: "Serial Number" },
    { key: "status", label: "Status" },
    { key: "last_calibration_date", label: "Last Calibrated", fmt: (r: Record<string, unknown>) => fmtDate(r.last_calibration_date) },
    { key: "next_calibration_due", label: "Next Calibration Due", fmt: (r: Record<string, unknown>) => fmtDate(r.next_calibration_due) },
    { key: "calibration_interval_months", label: "Interval (months)" },
    { key: "location", label: "Location" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Lab Equipment Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Register all winemaking analytical equipment with calibration records. Required for traceability of on-site SO₂ testing results. Third-party lab results don't require this — their accreditation covers traceability.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "equipment.csv", equipCsvCols, [
            csvComment(`Lab Equipment Register — ${farmNameEquip}`),
            csvComment("Scope: All equipment (no filters on this register)"),
          ])} disabled={!crud.data.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Equipment</Button>
        </div>
      </div>
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div><p className="font-semibold text-red-800 text-sm">Overdue calibration: {overdue.map(e => String(e.equipment_ref)).join(", ")}</p><p className="text-xs text-red-700 mt-0.5">Equipment with overdue calibration should not be used for compliance testing until recalibrated.</p></div>
        </div>
      )}
      {dueSoon.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div><p className="font-semibold text-amber-800 text-sm">Calibration due within 30 days: {dueSoon.map(e => String(e.equipment_ref)).join(", ")}</p></div>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.data.length === 0 ? <EmptyState icon={ShieldCheck} title="No equipment registered" sub="Add analytical equipment (Ripper burette, pH meter, refractometer, etc.) to track calibration records." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Ref</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Manufacturer / Model</th>
              <th className="text-left p-3 font-medium">Serial No.</th>
              <th className="text-left p-3 font-medium">Last Cal.</th>
              <th className="text-left p-3 font-medium">Next Due</th>
              <th className="text-left p-3 font-medium">Cal Status</th>
              <th className="text-left p-3 font-medium">Equip Status</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {crud.data.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 font-mono font-semibold">{fmt(r.equipment_ref)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{fmt(r.equipment_type)}</td>
                  <td className="p-3 text-xs">{[r.manufacturer, r.model].filter(Boolean).map(String).join(" ")}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.serial_number)}</td>
                  <td className="p-3 whitespace-nowrap text-xs">{fmtDate(r.last_calibration_date)}</td>
                  <td className="p-3 whitespace-nowrap text-xs">{fmtDate(r.next_calibration_due)}</td>
                  <td className="p-3">{calStatus(r)}</td>
                  <td className="p-3">{r.status === "active" ? <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Active</span> : <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{fmt(r.status)}</span>}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Register"} Equipment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Equipment Reference *</Label><Input value={form.equipmentRef ?? ""} onChange={e => sf("equipmentRef", e.target.value)} placeholder="e.g. RIPPER-01, PH-METER-A" /></div>
              <div>
                <Label>Equipment Type</Label>
                <Select value={form.equipmentType ?? ""} onValueChange={v => sf("equipmentType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{EQUIPMENT_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Manufacturer</Label><Input value={form.manufacturer ?? ""} onChange={e => sf("manufacturer", e.target.value)} placeholder="e.g. HANNA, CDR WineLab" /></div>
              <div><Label>Model</Label><Input value={form.model ?? ""} onChange={e => sf("model", e.target.value)} /></div>
              <div><Label>Serial Number</Label><Input value={form.serialNumber ?? ""} onChange={e => sf("serialNumber", e.target.value)} /></div>
              <div><Label>Purchase Date</Label><Input type="date" max={today} value={form.purchaseDate ?? ""} onChange={e => sf("purchaseDate", e.target.value)} /></div>
              <div>
                <Label>Calibration Frequency</Label>
                <Select value={form.calibrationFrequency ?? ""} onValueChange={v => sf("calibrationFrequency", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CALIBRATION_FREQ_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Last Calibration Date</Label><Input type="date" max={today} value={form.lastCalibrationDate ?? ""} onChange={e => sf("lastCalibrationDate", e.target.value)} /></div>
              <div><Label>Next Calibration Due</Label><Input type="date" value={form.nextCalibrationDue ?? ""} onChange={e => sf("nextCalibrationDue", e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "active"} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EQUIPMENT_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.replace(/-/g, " ").slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.equipmentRef || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Equipment — {fmt(view.equipment_ref)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Reference" value={<span className="font-mono">{fmt(view.equipment_ref)}</span>} />
              <ViewField label="Type" value={fmt(view.equipment_type)} />
              <ViewField label="Manufacturer" value={fmt(view.manufacturer)} />
              <ViewField label="Model" value={fmt(view.model)} />
              <ViewField label="Serial Number" value={<span className="font-mono">{fmt(view.serial_number)}</span>} />
              <ViewField label="Purchase Date" value={fmtDate(view.purchase_date)} />
              <ViewField label="Calibration Frequency" value={fmt(view.calibration_frequency)} />
              <ViewField label="Last Calibration" value={fmtDate(view.last_calibration_date)} />
              <ViewField label="Next Cal Due" value={fmtDate(view.next_calibration_due)} />
              <ViewField label="Calibration Status" value={calStatus(view)} />
              <ViewField label="Equipment Status" value={view.status === "active" ? <span className="text-green-700">Active</span> : fmt(view.status)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            <CalibrationRows farmId={farmId} equipmentId={view.id as number} />
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Equipment</DialogTitle><DialogDescription>Remove {fmt(deleting?.equipment_ref)} and all its calibration records?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
