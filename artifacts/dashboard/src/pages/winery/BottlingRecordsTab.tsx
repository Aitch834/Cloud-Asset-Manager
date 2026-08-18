import { BatchTrailDialog } from "./BatchTrail";
import { fetchWineryJson, useWineryCrud, useIsViticultureActive, useVessels, usePressing, useStaff, usePersistedYearFilter, today, ORGANIC_MAX_SO2, CONVENTIONAL_MAX_SO2, bottlingSo2Verdict, csvComment, csvSlug, exportCSV, QueryErrorNotice, EmptyState, fmtDate, fmt, fmtNum, So2Badge, NotesCell, SignOffBadge, BatchTrailButton, ViewAdditionsButton, SignOffButton, SignedEditWarning, SectionLabel, WINE_COLOUR_OPTIONS, CLOSURE_TYPE_OPTIONS, ViewField, AuditSignOffView, EditHistorySection, RecordSignOffDialog, SIGN_OFF_CSV_COLUMNS } from "./shared";
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

export function BottlingRecordsTab({ farmId }: { farmId: number }) {
  const viticultureActive = useIsViticultureActive(farmId);
  const crud = useWineryCrud(farmId, "winery-bottling", "winery-bottling");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { data: bottlingMachines = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-bottling-machines", farmId],
    queryFn: () => fetchWineryJson(`farms/${farmId}/winery-bottling-machines`).then(d => (d as { records: Record<string, unknown>[] }).records ?? []),
    staleTime: 60_000,
  });
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [signingOff, setSigningOff] = useState<Record<string, unknown> | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [yearFilter, setYearFilter] = usePersistedYearFilter("bottling", farmId);
  const [bottlingSearch, setBottlingSearch] = useState("");
  const [bottlingSignedFilter, setBottlingSignedFilter] = usePersistedFilter({ page: "bottling-records", filter: "signed", farmId, defaultValue: "all" });
  const BOTTLING_SORT_COLS = ["bottling_date", "lot_code", "batch_ref", "wine_colour", "volume_bottled_litres", "bottles_produced"] as const;
  type BottlingSortCol = typeof BOTTLING_SORT_COLS[number];
  const [sortCol, setSortCol] = usePersistedFilter({ page: "bottling-records", filter: "sort-col", farmId, defaultValue: "bottling_date", validValues: BOTTLING_SORT_COLS });
  const [sortDir, setSortDir] = usePersistedFilter({ page: "bottling-records", filter: "sort-dir", farmId, defaultValue: "desc", validValues: ["asc", "desc"] });
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
  // Confirm-before-save gate: shown when the entered total SO₂ exceeds the
  // active (organic or conventional) ceiling for the wine colour — same
  // pattern as the Cellar Ops sulfiting confirm.
  const [confirmOverCeiling, setConfirmOverCeiling] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importParsed, setImportParsed] = useState<Record<string, string>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ insertedCount: number; rejectedCount: number; rejected: { row: number; lotCode: string; reason: string }[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  // Headers in the uploaded file that match no BOTTLING_COLUMNS header, alias
  // or dbKey — surfaced as a preview warning (mirrors harvest's knownHeaders
  // behaviour) so a typo'd column isn't silently dropped. Import may proceed.
  const [importUnknownHeaders, setImportUnknownHeaders] = useState<string[]>([]);
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
    setImportUnknownHeaders([]);
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
      setImportUnknownHeaders(parsed.unknownHeaders);
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
    setImportUnknownHeaders([]);
    setImportLoading(false);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const farmNameBottling: string = useFarmName(farmId);
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  // Read SO₂ test records to enable pre-fill on batch ref selection
  const { data: so2TestRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-so2-tests", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-so2-tests`)).records ?? []) as Record<string, unknown>[],
    enabled: !!farmId && viticultureActive,
    staleTime: 30_000,
  });

  // Fermentation records for organic-status lookup when a batch ref is selected
  const { data: fermentationRecords = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-fermentation", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-fermentation`)).records ?? []) as Record<string, unknown>[],
    enabled: !!farmId && viticultureActive,
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
    // API returns snake_case; normalize organic boolean fields and machine FK to camelCase so form controls read them correctly
    if (raw.isOrganic === undefined || raw.isOrganic === "") raw.isOrganic = raw.is_organic ?? "false";
    if (raw.certifiedOrganic === undefined || raw.certifiedOrganic === "") raw.certifiedOrganic = raw.certified_organic ?? "false";
    if (raw.bottlingMachineId === undefined || raw.bottlingMachineId === "") raw.bottlingMachineId = raw.bottling_machine_id ?? "";
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
  // Active total-SO₂ ceiling for the open form — organic when the batch is
  // flagged organic, otherwise the conventional ceiling for the wine colour.
  const bottlingFormIsOrganic = form.isOrganic === "true" || form.isOrganic === true;
  // Edit mode keeps the API's snake_case keys until a field is touched, so
  // accept both key styles when reading colour and total SO₂.
  const bottlingFormColour = String(form.wineColour ?? form.wine_colour ?? "");
  const bottlingFormCeiling = bottlingFormColour
    ? (bottlingFormIsOrganic ? ORGANIC_MAX_SO2[bottlingFormColour] : CONVENTIONAL_MAX_SO2[bottlingFormColour])
    : undefined;
  const bottlingFormTotalSo2Raw = form.totalSo2MgL ?? form.total_so2_mg_l;
  const bottlingFormTotalSo2 = bottlingFormTotalSo2Raw != null && String(bottlingFormTotalSo2Raw) !== ""
    ? parseFloat(String(bottlingFormTotalSo2Raw))
    : null;
  const save = async (ceilingConfirmed = false) => {
    // Confirm before saving a record whose entered total SO₂ exceeds the
    // applicable ceiling. Only fires when both the total and a ceiling are
    // actually available — otherwise saving proceeds normally.
    if (
      !ceilingConfirmed &&
      bottlingFormTotalSo2 != null &&
      !isNaN(bottlingFormTotalSo2) &&
      bottlingFormCeiling &&
      !isNaN(parseFloat(bottlingFormCeiling)) &&
      bottlingFormTotalSo2 > parseFloat(bottlingFormCeiling)
    ) {
      setConfirmOverCeiling(true);
      return;
    }
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
  const bottlingFilteredBySearch = bottlingSearch.trim() === "" ? filteredByYear : filteredByYear.filter(r => {
    const q = bottlingSearch.trim().toLowerCase();
    return String(r.batch_ref ?? "").toLowerCase().includes(q)
      || String(r.lot_code ?? "").toLowerCase().includes(q)
      || String(r.wine_colour ?? "").toLowerCase().includes(q)
      || String(r.operator_name ?? "").toLowerCase().includes(q)
      || String(r.notes ?? "").toLowerCase().includes(q);
  });
  const filtered = bottlingSignedFilter === "all"
    ? bottlingFilteredBySearch
    : bottlingFilteredBySearch.filter(r => {
        const isSigned = r.audit_signature != null && r.audit_signature !== "";
        return bottlingSignedFilter === "signed" ? isSigned : !isSigned;
      });
  // Outstanding sign-offs across the current vintage filter (independent of
  // search / signed-status filters) — same as the Pressing table's header badge
  const bottlingUnsignedCount = useMemo(
    () => filteredByYear.filter(r => r.audit_signature == null || r.audit_signature === "").length,
    [filteredByYear],
  );

  // Bottling SO₂ compliance verdict now lives in shared.tsx (bottlingSo2Verdict)
  // so the Batch Trail dialog and printed report use the exact same logic as
  // this tab's badge, CSV, dialog and non-compliant filter.
  const isBottlingRowNonCompliant = (r: Record<string, unknown>): boolean =>
    bottlingSo2Verdict(r)?.compliant === false;

  const nonCompliantCount = filtered.filter(isBottlingRowNonCompliant).length;
  const baseRows = nonCompliantOnly ? filtered.filter(isBottlingRowNonCompliant) : filtered;

  const toggleSort = (col: BottlingSortCol) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir(col === "bottling_date" ? "desc" : "asc");
    }
  };
  const SortIcon = ({ col }: { col: BottlingSortCol }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 ml-1 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };
  const thSort = (col: BottlingSortCol, label: string, align: "left" | "right" = "left") => (
    <th
      className={`${align === "right" ? "text-right" : "text-left"} p-3 font-medium cursor-pointer select-none hover:bg-muted/60 transition-colors whitespace-nowrap`}
      onClick={() => toggleSort(col)}
    >
      <span className="inline-flex items-center gap-0.5">{label}<SortIcon col={col} /></span>
    </th>
  );

  const displayRows = [...baseRows].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const col = sortCol as BottlingSortCol;
    if (col === "volume_bottled_litres" || col === "bottles_produced") {
      const av = parseFloat(String(a[col] ?? "")) || 0;
      const bv = parseFloat(String(b[col] ?? "")) || 0;
      return (av - bv) * dir;
    }
    return String(a[col] ?? "").localeCompare(String(b[col] ?? "")) * dir;
  });

  // Import-compatible columns derived from BOTTLING_COLUMNS (exact import
  // headers + re-import-safe values: ISO dates, Yes/No booleans), followed by
  // export-only derived columns the import simply ignores.
  const bottlingCsvCols = [
    ...BOTTLING_COLUMNS.map(c => ({ key: c.dbKey, label: c.header, fmt: c.exportValue })),
    // Export-only: machine linkage is dashboard-only; this column is not part of the import template.
    { key: "bottling_machine_ref", label: "Bottling Machine", fmt: (r: Record<string, unknown>) => r.bottling_machine_ref != null ? String(r.bottling_machine_ref) : "" },
    { key: "so2_ceiling", label: "SO₂ ceiling (mg/L)", fmt: (r: Record<string, unknown>) => {
      const v = bottlingSo2Verdict(r);
      return v ? String(v.ceiling) : "";
    }},
    { key: "so2_compliant", label: "Compliance", fmt: (r: Record<string, unknown>) => {
      const v = bottlingSo2Verdict(r);
      if (!v || v.compliant == null) return "";
      return v.compliant ? "Compliant" : "Exceeds";
    }},
    { key: "certified_organic", label: "Certified Organic", fmt: (r: Record<string, unknown>) => r.certified_organic ? "Yes" : "No" },
    { key: "notes", label: "Notes" },
    // Sign-off columns — shared with the pressing export so formatting can't drift.
    // Export-only: the bottling importer ignores unknown headers.
    ...SIGN_OFF_CSV_COLUMNS,
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
            Bottling Records
            {bottlingUnsignedCount > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
                title={`${bottlingUnsignedCount} bottling record${bottlingUnsignedCount === 1 ? "" : "s"} in the current vintage filter ${bottlingUnsignedCount === 1 ? "has" : "have"} not been signed off — click to ${bottlingSignedFilter === "unsigned" ? "show all records" : "show only unsigned records"}`}
                onClick={() => setBottlingSignedFilter(bottlingSignedFilter === "unsigned" ? "all" : "unsigned")}
              >
                <PenLine className="w-3 h-3" />{bottlingUnsignedCount} unsigned
              </button>
            )}
          </p>
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
        <span className="text-xs text-muted-foreground">Sign-off:</span>
        <Select value={bottlingSignedFilter} onValueChange={v => setBottlingSignedFilter(v as "all" | "signed" | "unsigned")}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="signed">Signed only</SelectItem>
            <SelectItem value="unsigned">Unsigned only</SelectItem>
          </SelectContent>
        </Select>
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
          // Farm-name + filter header block — same pattern as the fermentation
          // and cellar-ops exports, kept ahead of the SO₂ warning line.
          const searchTrim = bottlingSearch.trim();
          const prefixLines: string[] = [
            csvComment(`Bottling Records — ${farmNameBottling}`),
            csvComment(`Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}`),
            csvComment(`Search filter: ${searchTrim || "None"}`),
          ];
          if (nonCompliantRows.length > 0) {
            const lotList = nonCompliantRows.map(r => r.lot_code ? String(r.lot_code) : "(no lot code)").join(", ");
            prefixLines.push(`"WARNING: ${nonCompliantRows.length} run${nonCompliantRows.length !== 1 ? "s" : ""} exceed the applicable SO₂ limit: ${lotList}"`);
          }
          // Traceable export filename — mirrors the SO₂ CSV pattern: include
          // the vintage scope and a sanitised search term so a filtered
          // download is identifiable.
          const parts = ["bottling-records"];
          if (yearFilter !== "all") parts.push(yearFilter);
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
        : crud.isError ? <QueryErrorNotice label="bottling records" error={crud.error} />
        : filtered.length === 0 ? <EmptyState icon={Wine} title="No bottling records yet" sub="Add a record for each bottling run." />
        : displayRows.length === 0 ? <EmptyState icon={CheckCircle2} title="No non-compliant runs" sub="All bottling runs in this vintage are within the SO₂ limit." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              {thSort("bottling_date", "Date")}
              {thSort("lot_code", "Lot Code")}
              {thSort("batch_ref", "Batch")}
              {thSort("wine_colour", "Colour")}
              {thSort("volume_bottled_litres", "Volume (L)", "right")}
              {thSort("bottles_produced", "Bottles", "right")}
              {crud.data.some(r => r.bottling_machine_id != null) && <th className="text-left p-3 font-medium">Machine</th>}
              <th className="text-left p-3 font-medium">Closure</th>
              <th className="text-right p-3 font-medium">Free SO₂</th>
              <th className="text-right p-3 font-medium">Total SO₂</th>
              <th className="text-left p-3 font-medium">SO₂ Status</th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="text-left p-3 font-medium">Sign-off</th>
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
                  {crud.data.some(r2 => r2.bottling_machine_id != null) && <td className="p-3 text-xs text-muted-foreground">{fmt(r.bottling_machine_ref)}</td>}
                  <td className="p-3 text-muted-foreground text-xs">{fmt(r.closure_type)}</td>
                  <td className="p-3 text-right">{r.free_so2_mg_l ? `${fmtNum(r.free_so2_mg_l, 0)} mg/L` : "—"}</td>
                  <td className="p-3 text-right">{r.total_so2_mg_l ? `${fmtNum(r.total_so2_mg_l, 0)} mg/L` : "—"}</td>
                  <td className="p-3">{(() => {
                    const v = bottlingSo2Verdict(r);
                    if (!v || v.compliant == null) return <span className="text-muted-foreground text-xs">—</span>;
                    return (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <So2Badge compliant={v.compliant} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">{fmtNum(r.total_so2_mg_l, 0)} / {v.ceiling} mg/L</span>
                      </div>
                    );
                  })()}</td>
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
              {bottlingMachines.length > 0 && (
                <div>
                  <Label>Bottling Machine</Label>
                  <Select value={String(form.bottlingMachineId ?? "")} onValueChange={v => sf("bottlingMachineId", v)}>
                    <SelectTrigger><SelectValue placeholder="— None —" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {bottlingMachines.map(m => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>
                          {String(m.machine_ref)}{m.machine_type ? ` (${String(m.machine_type)})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
            <Button onClick={() => save()} disabled={!form.bottlingDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <So2OverCeilingDialog
        open={confirmOverCeiling}
        valueMgL={bottlingFormTotalSo2}
        ceilingMgL={bottlingFormCeiling}
        ceilingLabel={bottlingFormIsOrganic ? "organic" : "conventional"}
        pending={crud.add.isPending || crud.edit.isPending}
        onCancel={() => setConfirmOverCeiling(false)}
        onConfirm={() => { setConfirmOverCeiling(false); save(true); }}
      />

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
              {view.bottling_machine_ref != null && <ViewField label="Machine" value={fmt(view.bottling_machine_ref)} />}
              <ViewField label="Closure" value={fmt(view.closure_type)} />
              <ViewField label="Cork Grade" value={fmt(view.cork_grade)} />
              <ViewField label="Label Batch" value={fmt(view.label_batch)} />
              <ViewField label="Free SO₂" value={view.free_so2_mg_l ? `${fmtNum(view.free_so2_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="Total SO₂" value={(() => {
                const v = bottlingSo2Verdict(view);
                if (!v || v.compliant == null) return view.total_so2_mg_l ? `${fmtNum(view.total_so2_mg_l, 0)} mg/L` : "—";
                return (
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono">{parseFloat(String(view.total_so2_mg_l)).toFixed(0)} mg/L</span>
                    <So2Badge compliant={v.compliant} />
                    <span className="text-muted-foreground text-xs">(max {v.ceiling} mg/L{v.isOrganic ? " organic" : ""})</span>
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
            <AuditSignOffView record={view} />
            <EditHistorySection history={view.edit_history} />
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-bottling" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {signingOff && (
        <RecordSignOffDialog farmId={farmId} endpoint="winery-bottling" queryKey="winery-bottling" recordLabel="Bottling Record" record={signingOff} onClose={() => setSigningOff(null)} />
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
              {importUnknownHeaders.length > 0 && !importError && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Unrecognised column{importUnknownHeaders.length !== 1 ? "s" : ""} — these will be ignored on import:</p>
                    <p className="text-xs mt-1 font-mono">{importUnknownHeaders.join(", ")}</p>
                    <p className="text-xs mt-1 text-amber-700">Check for typos against the template headers. You can still import — data in unrecognised columns will not be saved.</p>
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
