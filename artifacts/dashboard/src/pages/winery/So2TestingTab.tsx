import { BatchTrailDialog } from "./BatchTrail";
import { useCrud, useVessels, useEquipment, usePressing, useStaff, usePersistedYearFilter, ORGANIC_MAX_SO2, CONVENTIONAL_MAX_SO2, today, SO2_TEST_STAGE_LABELS, so2LimitUnverified, fmtDate, csvSlug, csvComment, exportCSV, QueryErrorNotice, EmptyState, fmt, fmtNum, So2Badge, NotesCell, BatchTrailButton, ViewAdditionsButton, SectionLabel, WINE_COLOUR_OPTIONS, SO2_TEST_STAGES, SO2_TEST_METHODS, ViewField } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
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
  // Progress through the Fix queue, captured when the flow starts so the
  // indicator reads "2 of 5" even as saved rows drop out of the flagged set.
  const [fixFlowProgress, setFixFlowProgress] = useState<{ position: number; total: number } | null>(null);
  // Review cycling: index of the last-reviewed flagged row (null until first
  // click). Each Review click advances to the next flagged row, wrapping.
  const [so2ReviewIndex, setSo2ReviewIndex] = useState<number | null>(null);
  const flaggedSo2RowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const farmNameSo2: string = useFarmName(farmId);
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const so2PressingRefs = pressingRecords
    .filter(r => r.batch_ref)
    .map(r => ({ batchRef: String(r.batch_ref), vintageYear: String(r.vintage_year ?? ""), wineColour: String(r.wine_colour ?? ""), isOrganic: !!(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) }))
    .sort((a, b) => b.batchRef.localeCompare(a.batchRef));

  const [isSo2BatchOrganic, setIsSo2BatchOrganic] = useState(false);
  const [so2WineColourAutoFilled, setSo2WineColourAutoFilled] = useState(false);
  // Confirmation gate before saving a test whose total SO₂ exceeds the active
  // ceiling — same pattern as CellarOpsTab / BottlingRecordsTab.
  const [confirmOverCeiling, setConfirmOverCeiling] = useState(false);

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
  const save = async (ceilingConfirmed = false) => {
    // Confirm before saving a test whose entered total SO₂ exceeds the max
    // permitted ceiling in the form. Only fires when both values are actually
    // available (autoCompliant is null otherwise) — saving proceeds normally
    // when under the ceiling or when ceiling/SO₂ data is missing.
    if (!ceilingConfirmed && autoCompliant === false) {
      setConfirmOverCeiling(true);
      return;
    }
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
          // Advance the queue position captured at flow start so the dialog
          // header keeps counting up (2 of 5, 3 of 5, …) as rows are fixed.
          setFixFlowProgress(p => p ? { ...p, position: Math.min(p.position + 1, p.total) } : p);
          openEdit(nextFlagged[0]);
          return;
        }
        setFixingFlaggedSo2(false);
        setFixFlowProgress(null);
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

  // Rows where batch_ref is missing and max_permitted_mg_l is an organic ceiling
  // value — shared so2LimitUnverified predicate.
  const unverifiedLimitCount = filtered.filter(so2LimitUnverified).length;

  const isFlaggedSo2Row = (r: Record<string, unknown>) => so2LimitUnverified(r);
  const findFirstFlaggedSo2 = () => filtered.find(isFlaggedSo2Row);

  // Step through flagged rows: each click advances to the next flagged row
  // (wrapping around), so operators can inspect each one in turn.
  const flaggedSo2Rows = filtered.filter(isFlaggedSo2Row);
  const handleReviewFlaggedSo2 = () => {
    if (flaggedSo2Rows.length === 0) return;
    const nextIndex = so2ReviewIndex == null ? 0 : (so2ReviewIndex + 1) % flaggedSo2Rows.length;
    setSo2ReviewIndex(nextIndex);
    const rowId = String(flaggedSo2Rows[nextIndex].id);
    setHighlightedSo2RowId(rowId);
    flaggedSo2RowRefs.current[rowId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightedSo2RowId(null), 2500);
  };
  // The flagged set can shrink (rows fixed) or change with filters — drop the
  // cursor whenever it no longer points at a valid position so the indicator
  // and the next click restart cleanly from the top.
  useEffect(() => {
    if (so2ReviewIndex != null && so2ReviewIndex >= flaggedSo2Rows.length) setSo2ReviewIndex(null);
  }, [flaggedSo2Rows.length, so2ReviewIndex]);

  const handleFixFlaggedSo2 = () => {
    const firstFlagged = findFirstFlaggedSo2();
    if (!firstFlagged) return;
    setFixingFlaggedSo2(true);
    setFixFlowProgress({ position: 1, total: flaggedSo2Rows.length });
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
    // Shared so2LimitUnverified predicate — same rule as the on-screen table
    // flag and the batch-trail PDF so2Rows builder.
    { key: "limit_unverified", label: "Limit Unverified", fmt: (r: Record<string, unknown>) => so2LimitUnverified(r) ? "Yes — no batch ref" : "" },
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
              <Tooltip content={({ active, payload, label }) => {
                // Custom tooltip mirroring the default look, but flagging an
                // organic-ceiling breach on the Total SO₂ row — same breach
                // rule as the red dot renderer below (row's own ceiling only).
                if (!active || !payload || payload.length === 0) return null;
                const row = (payload[0]?.payload ?? {}) as Record<string, unknown>;
                const ceiling = row["Organic ceiling"] as number | null | undefined;
                const total = row["Total SO₂"] as number | null | undefined;
                const breach = ceiling != null && total != null && total > ceiling;
                return (
                  <div style={{ fontSize: 11 }} className="rounded border bg-white px-2.5 py-1.5 shadow-sm">
                    <p className="font-medium mb-0.5">{String(label ?? "")}</p>
                    {payload.map((entry, i) => {
                      const isTotal = entry.dataKey === "Total SO₂";
                      const rowBreach = isTotal && breach;
                      return (
                        <p key={i} style={{ color: rowBreach ? "#dc2626" : (entry.color as string | undefined) }} className={rowBreach ? "font-semibold" : undefined}>
                          {String(entry.name)}: {entry.value != null ? String(entry.value) : "—"} mg/L
                          {rowBreach && <span> — Exceeds organic ceiling ({ceiling} mg/L)</span>}
                        </p>
                      );
                    })}
                  </div>
                );
              }} />
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
            Review{so2ReviewIndex != null && flaggedSo2Rows.length > 0 ? ` (${so2ReviewIndex + 1} of ${flaggedSo2Rows.length})` : ""}
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
        : crud.isError ? <QueryErrorNotice label="SO₂ tests" error={crud.error} />
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
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map((r, idx) => {
                const isUnverifiedLimit = so2LimitUnverified(r);
                const rowId = String(r.id);
                const isHighlighted = highlightedSo2RowId === rowId;
                return (
                <tr
                  key={rowId}
                  ref={isUnverifiedLimit ? (el => { flaggedSo2RowRefs.current[rowId] = el; }) : undefined}
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
                  <NotesCell notes={r.notes} />
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

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setFixingFlaggedSo2(false); setFixFlowProgress(null); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "Edit" : "Log"} SO₂ Test</DialogTitle>
            {/* Fix-flow progress: while remediating flagged rows via the amber
                banner's Fix button, show where the operator is in the queue.
                Position/total come from state captured when the flow started
                (advanced on each save) so the count stays stable even as saved
                rows drop out of the live flagged set. */}
            {fixingFlaggedSo2 && editing !== null && fixFlowProgress && (
              <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                Fixing flagged test {fixFlowProgress.position} of {fixFlowProgress.total}
              </p>
            )}
          </DialogHeader>
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
            <Button onClick={() => save()} disabled={!form.testDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <So2OverCeilingDialog
        open={confirmOverCeiling}
        valueMgL={form.totalSo2MgL && !isNaN(parseFloat(form.totalSo2MgL)) ? parseFloat(form.totalSo2MgL) : null}
        ceilingMgL={form.maxPermittedMgL}
        ceilingLabel={allSo2LimitValues.includes(form.maxPermittedMgL ?? "") ? (isSo2BatchOrganic ? "organic" : "conventional") : ""}
        pending={crud.add.isPending || crud.edit.isPending}
        onCancel={() => setConfirmOverCeiling(false)}
        onConfirm={() => { setConfirmOverCeiling(false); save(true); }}
      />

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
