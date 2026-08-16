import { BatchTrailDialog } from "./BatchTrail";
import { fetchWineryJson, useWineryCrud, useIsViticultureActive, useVessels, usePressing, useStaff, usePersistedYearFilter, ORGANIC_MAX_SO2, CONVENTIONAL_MAX_SO2, today, fmtDate, CELLAR_OP_TYPES, CELLAR_OP_LABELS, csvSlug, csvComment, exportCSV, QueryErrorNotice, EmptyState, fmtNum, fmt, So2Badge, NotesCell, SignOffBadge, BatchTrailButton, ViewAdditionsButton, SignOffButton, SignedEditWarning, WINE_COLOUR_OPTIONS, SectionLabel, ViewField, AuditSignOffView, EditHistorySection, RecordSignOffDialog, SIGN_OFF_CSV_COLUMNS } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useFarmName } from "@/hooks/use-farm-name";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { BOTTLING_COLUMNS, BOTTLING_IMPORT_HEADERS, resolveBottlingField, bottlingImportRecord, parseCsvText, parseBottlingCsv } from "@/lib/bottling-csv";
import { computePrimaryPhTa, computePhTaStagePoints } from "@/lib/ph-ta-stages";
import { StaffSelect } from "@/components/ui/staff-select";
import { So2OverCeilingDialog } from "@/components/So2OverCeilingDialog";
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
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import SignatureCanvas from "react-signature-canvas";

import { apiUrl as api } from "@/lib/api";

export function CellarOpsTab({ farmId }: { farmId: number }) {
  const viticultureActive = useIsViticultureActive(farmId);
  const crud = useWineryCrud(farmId, "winery-cellar-ops", "winery-cellar-ops");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { data: cellarFermentationRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-fermentation", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-fermentation`)).records ?? []) as Record<string, unknown>[],
    enabled: !!farmId && viticultureActive,
    staleTime: 60_000,
  });
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [signingOff, setSigningOff] = useState<Record<string, unknown> | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = usePersistedYearFilter("cellar-ops", farmId);
  const [opFilter, setOpFilter] = usePersistedFilter({ page: "cellar-ops", filter: "op-type", farmId, defaultValue: "all" });
  const [cellarSearch, setCellarSearch] = useState("");
  const [cellarSignedFilter, setCellarSignedFilter] = usePersistedFilter({ page: "cellar-ops", filter: "signed", farmId, defaultValue: "all" });
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
  const farmNameCellar: string = useFarmName(farmId);
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
  const cellarFilteredByYear = crud.data.filter(r => yearFilter === "all" || String(r.vintage_year) === yearFilter);
  const filtered = cellarFilteredByYear
    .filter(r => opFilter === "all" || String(r.op_type) === opFilter)
    .filter(r => {
      const q = cellarSearch.trim().toLowerCase();
      if (q === "") return true;
      return String(r.batch_ref ?? "").toLowerCase().includes(q)
        || String(r.operator_name ?? "").toLowerCase().includes(q)
        || String(r.notes ?? "").toLowerCase().includes(q);
    })
    .filter(r => {
      if (cellarSignedFilter === "all") return true;
      const isSigned = r.audit_signature != null && r.audit_signature !== "";
      return cellarSignedFilter === "signed" ? isSigned : !isSigned;
    });
  // Outstanding sign-offs across the current vintage filter (independent of
  // op-type / search / signed-status filters) — same as the Pressing table badge
  const cellarUnsignedCount = useMemo(
    () => cellarFilteredByYear.filter(r => r.audit_signature == null || r.audit_signature === "").length,
    [cellarFilteredByYear],
  );
  // Organic status for a cellar-ops row: derived from the linked pressing record by
  // batch_ref (same as the view dialog / form), falling back to the row's own flag.
  const cellarRowIsOrganic = (r: Record<string, unknown>): boolean => {
    const pressMatch = r.batch_ref ? cellarPressingRefs.find(p => p.batchRef === String(r.batch_ref)) : null;
    if (pressMatch) return !!pressMatch.isOrganic;
    return r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
  };

  // Single source of truth for the Cellar Ops SO₂ compliance verdict — used by
  // BOTH the on-screen table badge and the CSV export columns, so the screen
  // and the download can never disagree. Ceiling comes from wine_colour +
  // organic status; verdict compares it against free_so2_after_mg_l.
  const cellarSo2Verdict = (r: Record<string, unknown>): { ceiling: number; isOrganic: boolean; compliant: boolean | null } | null => {
    if (String(r.op_type) !== "sulfiting") return null;
    const colour = String(r.wine_colour ?? "");
    if (!colour) return null;
    const isOrganic = cellarRowIsOrganic(r);
    const ceiling = parseFloat((isOrganic ? ORGANIC_MAX_SO2[colour] : CONVENTIONAL_MAX_SO2[colour]) ?? "");
    if (isNaN(ceiling)) return null;
    const freeAfter = r.free_so2_after_mg_l != null && r.free_so2_after_mg_l !== "" ? parseFloat(String(r.free_so2_after_mg_l)) : NaN;
    return { ceiling, isOrganic, compliant: isNaN(freeAfter) ? null : freeAfter <= ceiling };
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
      const v = cellarSo2Verdict(r);
      return v ? `${v.ceiling} (${v.isOrganic ? "organic" : "conventional"})` : "";
    } },
    { key: "so2_compliance", label: "Compliance", fmt: (r: Record<string, unknown>) => {
      const v = cellarSo2Verdict(r);
      if (!v || v.compliant == null) return "";
      return v.compliant ? "Compliant" : "Exceeds Limit";
    } },
    { key: "operator_name", label: "Operator" },
    { key: "notes", label: "Notes" },
    // Sign-off columns — shared with the pressing export so formatting can't drift
    ...SIGN_OFF_CSV_COLUMNS,
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
            Cellar Operations Log
            {cellarUnsignedCount > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
                title={`${cellarUnsignedCount} cellar operation${cellarUnsignedCount === 1 ? "" : "s"} in the current vintage filter ${cellarUnsignedCount === 1 ? "has" : "have"} not been signed off — click to ${cellarSignedFilter === "unsigned" ? "show all records" : "show only unsigned records"}`}
                onClick={() => setCellarSignedFilter(cellarSignedFilter === "unsigned" ? "all" : "unsigned")}
              >
                <PenLine className="w-3 h-3" />{cellarUnsignedCount} unsigned
              </button>
            )}
          </p>
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
        <span className="text-xs text-muted-foreground">Sign-off:</span>
        <Select value={cellarSignedFilter} onValueChange={v => setCellarSignedFilter(v as "all" | "signed" | "unsigned")}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="signed">Signed only</SelectItem>
            <SelectItem value="unsigned">Unsigned only</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          const searchTrim = cellarSearch.trim();
          const parts = ["cellar-ops"];
          if (yearFilter !== "all") parts.push(yearFilter);
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
        : crud.isError ? <QueryErrorNotice label="cellar operations" error={crud.error} />
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
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="text-left p-3 font-medium">Sign-off</th>
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
                // Compliance verdict for sulfiting rows — shared helper with the
                // CSV export columns, so screen and download can never disagree.
                const compliance: boolean | null = cellarSo2Verdict(r)?.compliant ?? null;
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
                    <NotesCell notes={r.notes} />
                    <td className="p-3 whitespace-nowrap"><SignOffBadge r={r} /></td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <BatchTrailButton batchRef={r.batch_ref} onClick={() => setTrailRecord(r)} />
                      <ViewAdditionsButton farmId={farmId} record={r} />
                      <SignOffButton record={r} onClick={() => setSigningOff(r)} />
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

      <So2OverCeilingDialog
        open={confirmOverCeiling}
        valueLabel="Projected total"
        valueMgL={cellarProjectedMgL}
        ceilingMgL={cellarCumulativeLimit}
        ceilingLabel={cellarCumulativeLimitLabel}
        pending={crud.add.isPending || crud.edit.isPending}
        onCancel={() => setConfirmOverCeiling(false)}
        onConfirm={() => { setConfirmOverCeiling(false); save(true); }}
      />

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
                // Same shared verdict as the table badge and CSV export — no inline recomputation.
                const verdict = cellarSo2Verdict(view as Record<string, unknown>);
                if (!verdict) return null;
                const { ceiling, isOrganic: viewIsOrganic, compliant } = verdict;
                const viewWineColour = String(view.wine_colour ?? "");
                const viewActiveLimit = String(ceiling);
                const viewConvLimit = viewWineColour ? CONVENTIONAL_MAX_SO2[viewWineColour] : null;
                const viewOverLimit = compliant === false;
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
            <AuditSignOffView record={view} />
            <EditHistorySection history={view.edit_history} />
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-cellar-op" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {signingOff && (
        <RecordSignOffDialog farmId={farmId} endpoint="winery-cellar-ops" queryKey="winery-cellar-ops" recordLabel="Cellar Operation" record={signingOff} onClose={() => setSigningOff(null)} />
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
