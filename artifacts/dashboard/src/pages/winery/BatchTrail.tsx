import { sanitiseSignatureForHtml, SignatureEmbed, NO_EMBED, printBatchTrail } from "./print";
import { fetchWineryJson, usePressing, so2Ceiling, bottlingSo2Verdict, fmtDate, today, fmtDDMonYYYY, AssignWineColourDialog, type AssignColourTarget, fmtNum, ADDITIVE_COL, EXTRA_ADDITIVE_COLUMNS, SO2_TEST_STAGE_LABELS, EmptyState, CELLAR_OP_LABELS, fmt, So2Badge, BATCH_TRAIL_CSV_HEADER, PRESS_ADDITIVE_COLUMNS, so2LimitUnverified, ViewField, SectionLabel, VESSEL_TYPE_OPTIONS, VESSEL_STATUS_OPTIONS, TOASTING_OPTIONS } from "./shared";
import { BarrelFillHistory, BarrelMaintenanceLog, BarrelMovementLog, VesselCleanRow } from "./VesselRegisterTab";
import { useState, useMemo, useEffect, useRef } from "react";
import { useFarmName } from "@/hooks/use-farm-name";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { BOTTLING_COLUMNS, BOTTLING_IMPORT_HEADERS, resolveBottlingField, bottlingImportRecord, parseCsvText, parseBottlingCsv } from "@/lib/bottling-csv";
import { computePrimaryPhTa, computePhTaStagePoints } from "@/lib/ph-ta-stages";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Eye, FlaskConical, Wine, Beaker, Gauge, Thermometer, Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Wrench, ShieldCheck, FileDown, Printer, Settings2, RefreshCw, GitBranch, Leaf, Search, Upload, PenLine, ArrowUp, ArrowDown, ArrowUpDown, Paperclip } from "lucide-react";
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

export function useWineryBatchSettings(farmId: number) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery<{ settings: Record<string, unknown>; nextRef: string }>({
    queryKey: ["winery-batch-settings", farmId],
    queryFn: async () => (await fetchWineryJson(`farms/${farmId}/winery-batch-settings`)) as unknown as { settings: Record<string, unknown>; nextRef: string },
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

  const farmName: string = useFarmName(farmId);

  // Reuse cached pressing data already fetched by the pressing tab
  const { data: pressingData } = usePressing(farmId);

  // Reuse cached fermentation data (same queryKey used by the fermentation tab)
  const { data: fermentationData } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-fermentation", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-fermentation`)).records ?? []) as Record<string, unknown>[],
    enabled: !!farmId,
    staleTime: 60_000,
  });

  // The Batch Trail dialog itself matches a ref across ALL winery record types
  // (fermentation, cellar ops, SO₂ tests, bottling, pressing additions), so the
  // typeahead must draw from the same sources — a ref that only exists in, say,
  // cellar ops or bottling would otherwise open fine via Enter but never appear
  // as a suggestion. These queries share the same queryKey + response shape as
  // their tabs, so cached data is reused when a tab has already loaded.
  const useBatchRefSource = (endpoint: string, key: string) =>
    useQuery<Record<string, unknown>[]>({
      queryKey: [key, farmId],
      queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/${endpoint}`)).records ?? []) as Record<string, unknown>[],
      enabled: !!farmId,
      staleTime: 60_000,
    });
  const { data: cellarOpsData } = useBatchRefSource("winery-cellar-ops", "winery-cellar-ops");
  const { data: bottlingData } = useBatchRefSource("winery-bottling", "winery-bottling");
  const { data: so2TestsData } = useBatchRefSource("winery-so2-tests", "winery-so2-tests");

  // Build sorted, deduplicated list of all known batch refs carrying their vintage year.
  // Pressing is the authoritative source for vintage year; the other record types fill
  // in any gaps. Sorted by most recent activity date so commonly-used batches surface first.
  const allBatchRefs = useMemo(() => {
    const map = new Map<string, { vintageYear: string | null; latestDate: string | null }>();
    // Helper: keep the more-recent of two ISO date strings (or nulls)
    const laterDate = (a: string | null, b: string | null): string | null => {
      if (!a) return b;
      if (!b) return a;
      return a >= b ? a : b;
    };
    // Fold one record source into the map. dateField names the record's activity
    // date column. Array.isArray guards against a shared-key cache entry holding
    // a non-array shape (never unwrap-mismatch a shared queryKey silently).
    const fold = (records: unknown, dateField: string) => {
      if (!Array.isArray(records)) return;
      for (const r of records as Record<string, unknown>[]) {
        if (!r.batch_ref) continue;
        const ref = String(r.batch_ref);
        const date = r[dateField] != null ? String(r[dateField]).slice(0, 10) : null;
        const existing = map.get(ref);
        if (existing) {
          existing.latestDate = laterDate(existing.latestDate, date);
          if (existing.vintageYear == null && r.vintage_year != null) existing.vintageYear = String(r.vintage_year);
        } else {
          map.set(ref, {
            vintageYear: r.vintage_year != null ? String(r.vintage_year) : null,
            latestDate: date,
          });
        }
      }
    };
    // Pressing first — preferred source for vintage year
    fold(pressingData, "press_date");
    fold(fermentationData, "start_date");
    fold(cellarOpsData, "op_date");
    fold(bottlingData, "bottling_date");
    fold(so2TestsData, "test_date");
    return Array.from(map.entries())
      .map(([ref, { vintageYear, latestDate }]) => ({ ref, vintageYear, latestDate }))
      // Most recent first; fall back to alphabetical when dates are equal or both null
      .sort((a, b) => {
        if (a.latestDate && b.latestDate) return b.latestDate.localeCompare(a.latestDate);
        if (a.latestDate) return -1;
        if (b.latestDate) return 1;
        return a.ref.localeCompare(b.ref);
      });
  }, [pressingData, fermentationData, cellarOpsData, bottlingData, so2TestsData]);

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
export function VintagePHComparisonChart({
  data,
  vintageYear,
  highlightedBatch,
  onBatchClick,
  onAssignColours,
}: {
  data: BatchTrailData;
  vintageYear: string | null;
  highlightedBatch: string | null;
  onBatchClick: (ref: string) => void;
  /** Optional shortcut: opens the assign-wine-colour dialog for the Unspecified batches */
  onAssignColours?: () => void;
}) {
  const [colourFilter, setColourFilter] = useState<string>("all");

  // Collect per-batch pH/TA: bottling (primary) → fermentation end (fallback)
  // Brix: fermentation start_brix (juice sugar at fermentation start)
  const batchMap = new Map<string, { ph: number | null; ta: number | null; brix: number | null; colour: string | null }>();

  // Per-batch wine colour lookup (fermentation first, then bottling, then the
  // pressing record's own declared colour)
  const colourOf = (ref: string): string | null => {
    for (const src of [data.fermentation, data.bottling, data.pressings ?? []]) {
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
          {hasUnspecified && onAssignColours && (
            <button
              onClick={onAssignColours}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed border-purple-400 text-purple-700 hover:bg-purple-50 transition-colors"
              data-testid="assign-colours-chart-button"
            >
              <Wine className="h-3 w-3" />Assign colours…
            </button>
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
export interface BatchTrailData {
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
  /** Fill history for any oak barrel used as a source vessel in a bottling record for this batch/vintage */
  barrelFills?: Record<string, unknown>[];
  /** Cooperage maintenance records for barrel vessels in this batch trail */
  barrelMaintenance?: Record<string, unknown>[];
}

export function TrailSection({ icon: Icon, title, count, children }: { icon: React.ElementType; title: string; count: number; children: React.ReactNode }) {
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
export interface So2Summary {
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

export function computeSo2Summary(pressing: Record<string, unknown>, data: BatchTrailData): So2Summary {
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
  const conventionalLimit = so2Ceiling(colourStr, false) ?? 200;
  const organicLimit = so2Ceiling(colourStr, true) ?? 150;
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

export function So2SummaryBlock({ summary }: { summary: So2Summary }) {
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

// ─── Vessel Detail (opened from Batch Trail) ──────────────────────────────────
/**
 * Opens a vessel record dialog directly from the Batch Trail, fetching the full
 * vessel data from the shared winery-vessels list query (cache-first).
 * Includes an inline Edit form so winemakers can fix details without leaving the trail.
 */
function VesselDetailFromTrail({ farmId, vesselId, onClose }: { farmId: number; vesselId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: vessels, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-vessels", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels`), { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load vessels");
      return (await r.json()).records ?? [];
    },
    staleTime: 60_000,
  });

  const vessel = vessels?.find(v => Number(v.id) === vesselId) ?? null;
  const isBarrel = vessel
    ? String(vessel.vessel_type ?? "").toLowerCase().includes("barrel") ||
      String(vessel.vessel_type ?? "").toLowerCase().includes("barrique")
    : false;

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const isBarrelForm = form.vesselType?.toLowerCase().includes("barrel") || form.vesselType?.toLowerCase().includes("barrique");

  // Normalise an API snake_case vessel record into the camelCase keys the form uses,
  // matching the same key names as the Vessel Register editor in VesselRegisterTab.tsx.
  const normaliseVesselToForm = (v: Record<string, unknown>): Record<string, string> => {
    const str = (val: unknown) => (val == null ? "" : String(val));
    return {
      vesselRef: str(v.vessel_ref),
      vesselType: str(v.vessel_type),
      capacityLitres: str(v.capacity_litres),
      material: str(v.material),
      yearPurchased: str(v.year_purchased),
      manufacturer: str(v.manufacturer),
      location: str(v.location),
      status: str(v.status) || "active",
      oakOrigin: str(v.oak_origin),
      cooperage: str(v.cooperage),
      fillNumber: str(v.fill_number),
      toastingLevel: str(v.toasting_level),
      cellarZone: str(v.cellar_zone),
      cellarPosition: str(v.cellar_position),
      currentContents: str(v.current_contents),
      currentVolumeLitres: str(v.current_volume_litres),
      notes: str(v.notes),
    };
  };

  const openEdit = () => {
    if (!vessel) return;
    setForm(normaliseVesselToForm(vessel));
    setEditOpen(true);
  };

  const editMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-vessels/${vesselId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as Record<string, string>).error || "Save failed"); }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["winery-vessels", farmId] });
      setEditOpen(false);
      editMut.reset();
      toast({ title: "Vessel updated" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const statusBadge = (s: unknown) => {
    const v = String(s ?? "active");
    if (v === "active") return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Active</span>;
    if (v === "retired") return <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Retired</span>;
    return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">{v}</span>;
  };

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vessel — {vessel ? fmt(vessel.vessel_ref) : `#${vesselId}`}</DialogTitle>
          {editOpen && <DialogDescription>Edit vessel details below. Changes will be saved to the Vessel Register.</DialogDescription>}
        </DialogHeader>

        {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
        {!isLoading && !vessel && <p className="text-sm text-muted-foreground py-4">Vessel record could not be loaded.</p>}

        {vessel && !editOpen && (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Vessel Ref" value={<span className="font-mono">{fmt(vessel.vessel_ref)}</span>} />
              <ViewField label="Type" value={fmt(vessel.vessel_type)} />
              <ViewField label="Capacity" value={vessel.capacity_litres ? `${fmtNum(vessel.capacity_litres, 0)} L` : "—"} />
              <ViewField label="Material" value={fmt(vessel.material)} />
              <ViewField label="Year Purchased" value={fmt(vessel.year_purchased)} />
              <ViewField label="Manufacturer" value={fmt(vessel.manufacturer)} />
              <ViewField label="Location" value={fmt(vessel.location)} />
              <ViewField label="Status" value={statusBadge(vessel.status)} />
              {isBarrel && (
                <>
                  <ViewField label="Oak Origin" value={fmt(vessel.oak_origin)} />
                  <ViewField label="Cooperage" value={fmt(vessel.cooperage)} />
                  <ViewField label="Fill Number" value={fmt(vessel.fill_number)} />
                  <ViewField label="Toasting" value={fmt(vessel.toasting_level)} />
                  {!!vessel.cellar_zone && <ViewField label="Cellar Zone" value={fmt(vessel.cellar_zone)} />}
                  {!!vessel.cellar_position && <ViewField label="Position" value={fmt(vessel.cellar_position)} />}
                  <ViewField label="Barrel Status" value={
                    vessel.is_full
                      ? <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-medium">● Full</span>
                      : <span className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-medium">○ Empty</span>
                  } />
                </>
              )}
              <ViewField label="Current Contents" value={fmt(vessel.current_contents)} />
              <ViewField label="Current Volume" value={vessel.current_volume_litres ? `${fmtNum(vessel.current_volume_litres, 0)} L` : "—"} />
              {!!vessel.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(vessel.notes)} /></div>}
            </div>
            {isBarrel && (
              <>
                <BarrelMovementLog farmId={farmId} vesselId={vesselId} currentZone={String(vessel.cellar_zone ?? "")} currentPosition={String(vessel.cellar_position ?? "")} readOnly />
                <BarrelFillHistory farmId={farmId} vesselId={vesselId} maxExistingFill={Number(vessel.fill_number ?? 0)} readOnly />
                <BarrelMaintenanceLog farmId={farmId} vesselId={vesselId} readOnly />
              </>
            )}
            <VesselCleanRow farmId={farmId} vesselId={vesselId} readOnly />
          </>
        )}

        {vessel && editOpen && (
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
            {isBarrelForm && (
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
                <SectionLabel>Cellar location</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cellar Zone</Label><Input value={form.cellarZone ?? ""} onChange={e => sf("cellarZone", e.target.value)} placeholder="e.g. Cellar A, Bonded Store" /></div>
                  <div><Label>Position within Zone</Label><Input value={form.cellarPosition ?? ""} onChange={e => sf("cellarPosition", e.target.value)} placeholder="e.g. R4-P3, Bay 2" /></div>
                </div>
              </>
            )}
            <SectionLabel>Current state</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Current Contents</Label><Input value={form.currentContents ?? ""} onChange={e => sf("currentContents", e.target.value)} placeholder="e.g. Bacchus 2024, empty" /></div>
              <div><Label>Current Volume (L)</Label><Input type="number" step="0.1" value={form.currentVolumeLitres ?? ""} onChange={e => sf("currentVolumeLitres", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
            <DialogMutationError mutation={editMut} />
          </div>
        )}

        <DialogFooter>
          {!editOpen ? (
            <>
              <Button variant="outline" onClick={openEdit} disabled={!vessel}>
                <Pencil className="h-4 w-4 mr-1.5" />Edit
              </Button>
              <Button onClick={onClose}>Close</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => { setEditOpen(false); editMut.reset(); }}>Cancel</Button>
              <Button
                onClick={() => editMut.mutate()}
                disabled={!form.vesselRef || editMut.isPending}
              >
                {editMut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save changes
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BatchTrailDialog({ farmId, pressing, farmName, onClose }: { farmId: number; pressing: Record<string, unknown>; farmName: string; onClose: () => void }) {
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

  // ── Assign wine colour (vintage scope) ───────────────────────────────────────
  // Pressing sessions in this vintage whose batch has no derived colour anywhere
  // (fermentation → cellar → bottling → pressing's own colour) — targets for the
  // dialog. Batches that have NO pressing record at all are offered too, saving
  // the colour directly onto the fermentation/cellar record instead.
  const [assignColourRecords, setAssignColourRecords] = useState<AssignColourTarget[] | null>(null);
  const [openVesselId, setOpenVesselId] = useState<number | null>(null);
  const openAssignColours = () => {
    if (!data) return;
    const hasColour = (ref: string) =>
      [data.fermentation, data.cellarOps, data.bottling, data.pressings ?? []].some(src =>
        src.some(r => r.batch_ref && String(r.batch_ref).trim() === ref && r.wine_colour));
    const seen = new Set<string>();
    const targets: AssignColourTarget[] = [];
    const pressedRefs = new Set((data.pressings ?? [])
      .map(p => (p.batch_ref ? String(p.batch_ref).trim() : ""))
      .filter(Boolean));
    for (const p of data.pressings ?? []) {
      const ref = p.batch_ref ? String(p.batch_ref).trim() : "";
      const id = Number(p.id);
      if (!ref || seen.has(`pressing:${id}`) || hasColour(ref)) continue;
      seen.add(`pressing:${id}`);
      targets.push({ id, kind: "pressing", batchRef: ref, pressDate: p.press_date ? String(p.press_date) : null });
    }
    // Colourless batches with no pressing record — target the source record itself.
    const noPressingSources: { rows: Record<string, unknown>[]; kind: "fermentation" | "cellar"; dateField: string }[] = [
      { rows: data.fermentation, kind: "fermentation", dateField: "start_date" },
      { rows: data.cellarOps, kind: "cellar", dateField: "op_date" },
    ];
    for (const { rows, kind, dateField } of noPressingSources) {
      for (const r of rows) {
        const ref = r.batch_ref ? String(r.batch_ref).trim() : "";
        const id = Number(r.id);
        const key = `${kind}:${id}`;
        if (!ref || pressedRefs.has(ref) || seen.has(key) || hasColour(ref)) continue;
        seen.add(key);
        targets.push({ id, kind, batchRef: ref, pressDate: r[dateField] ? String(r[dateField]) : null });
      }
    }
    setAssignColourRecords(targets);
  };

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
  // Single shared embed decision for the Batch Trail PDF — consumed by BOTH the
  // ShieldCheck indicator and the printBatchTrail call, so they can never drift apart.
  // Sanitised first, mirroring the PDF helper's validation, so an invalid stored
  // signature never shows the indicator while producing an unsigned PDF.
  const batchTrailSafeSig = sanitiseSignatureForHtml(currentSig);
  const batchTrailEmbed: SignatureEmbed = batchTrailSafeSig
    ? { willEmbed: true, sig: batchTrailSafeSig, signerInfo: { name: currentSignerName, role: currentSignerRole, signedAt: currentSignedAt, signerDate: currentSignerDate } }
    : NO_EMBED;

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

  // Vintage scope: fetch attachments for EVERY pressing session in the vintage
  // (same best-effort fetchStageAttachments the CSV/PDF exports use) so the
  // on-screen dialog can list files per pressing, not just the primary one.
  // Single-batch scope never enables this query — behaviour unchanged.
  const vintagePressingIds = (data?.pressings ?? []).map(p => Number(p.id)).filter(n => Number.isFinite(n));
  const { data: vintagePressingAttachments } = useQuery<Map<number, TrailAttachment[]>>({
    queryKey: ["winery-batch-trail-pressing-attachments", farmId, vintageYear, vintagePressingIds.join(",")],
    queryFn: () => fetchStageAttachments(farmId, "winery-pressing", data?.pressings ?? []),
    enabled: isVintageScoped && !!data && vintagePressingIds.length > 0,
    staleTime: 30_000,
  });

  // Attachments for the other stage records (fermentation, cellar ops, SO₂
  // tests, bottling) — same best-effort fetchStageAttachments helper the
  // CSV/PDF exports use, so the on-screen dialog lists the same files the
  // downloads do. Records without attachments are simply omitted.
  const stageRecordIds = [
    ...(data?.fermentation ?? []), ...(data?.cellarOps ?? []),
    ...(data?.so2Tests ?? []), ...(data?.bottling ?? []),
  ].map(r => Number(r.id)).filter(n => Number.isFinite(n));
  const { data: stageAttachments } = useQuery<{
    ferm: Map<number, TrailAttachment[]>;
    cellar: Map<number, TrailAttachment[]>;
    so2: Map<number, TrailAttachment[]>;
    bottling: Map<number, TrailAttachment[]>;
  }>({
    queryKey: ["winery-batch-trail-stage-attachments", farmId, batchRef, vintageYear, stageRecordIds.join(",")],
    queryFn: async () => {
      const [ferm, cellar, so2, bottling] = await Promise.all([
        fetchStageAttachments(farmId, "winery-fermentation", data?.fermentation ?? []),
        fetchStageAttachments(farmId, "winery-cellar-op", data?.cellarOps ?? []),
        fetchStageAttachments(farmId, "winery-so2-test", data?.so2Tests ?? []),
        fetchStageAttachments(farmId, "winery-bottling", data?.bottling ?? []),
      ]);
      return { ferm, cellar, so2, bottling };
    },
    enabled: !!data && stageRecordIds.length > 0,
    staleTime: 30_000,
  });
  // Renders a row's attachment list — nothing when the record has no files
  // (best-effort: while the query is loading or if it failed, rows simply
  // show no attachment info, mirroring the exports' behaviour).
  const rowAttachments = (map: Map<number, TrailAttachment[]> | undefined, r: Record<string, unknown>) => {
    const id = r.id != null ? Number(r.id) : NaN;
    const files = Number.isFinite(id) ? (map?.get(id) ?? []) : [];
    if (files.length === 0) return null;
    return (
      <div className="pt-1">
        <p className="text-muted-foreground uppercase tracking-wide font-semibold" style={{ fontSize: "10px" }}>
          Attachments ({files.length})
        </p>
        <ul className="space-y-0.5 mt-0.5">
          {files.map((f, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="h-3 w-3 shrink-0" />
              <TrailAttachmentName file={f} />
              {!!f.uploadedAt && <span className="text-muted-foreground/70 shrink-0">· Uploaded {fmtDate(f.uploadedAt)}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
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
            onAssignColours={(data.pressings ?? []).length > 0 || data.fermentation.length > 0 || data.cellarOps.length > 0 ? openAssignColours : undefined}
          />
        )}
        {assignColourRecords && (
          <AssignWineColourDialog
            farmId={farmId}
            records={assignColourRecords}
            onClose={() => setAssignColourRecords(null)}
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
              const additiveGroups: { key: string; pressDate: string; batchRef: string | null; operatorName: string | null; pressingNotes: string; additions: Record<string, unknown>[] }[] = [];
              {
                const groupIndex = new Map<string, number>();
                // In vintage scope, seed one group per pressing session (from
                // data.pressings) so sessions with zero additives — but
                // non-empty notes — still get a block, matching the PDF.
                if (isVintageScoped) {
                  for (const p of data.pressings ?? []) {
                    const key = String(p.id);
                    groupIndex.set(key, additiveGroups.length);
                    additiveGroups.push({
                      key,
                      pressDate: p.press_date ? fmtDate(p.press_date) : "—",
                      batchRef: p.batch_ref != null && String(p.batch_ref).trim() !== "" ? String(p.batch_ref).trim() : null,
                      operatorName: p.operator_name != null && String(p.operator_name).trim() !== "" ? String(p.operator_name).trim() : null,
                      pressingNotes: p.notes != null ? String(p.notes).trim() : "",
                      additions: [],
                    });
                  }
                }
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
                      operatorName: a.pressing_operator_name != null && String(a.pressing_operator_name).trim() !== "" ? String(a.pressing_operator_name).trim() : null,
                      pressingNotes: a.pressing_notes != null ? String(a.pressing_notes).trim() : "",
                      additions: [],
                    });
                  }
                  additiveGroups[idx].additions.push(a);
                }
                // Drop seeded sessions that ended up with neither additives
                // nor notes — they'd render an empty block.
                for (let i = additiveGroups.length - 1; i >= 0; i--) {
                  if (additiveGroups[i].additions.length === 0 && !additiveGroups[i].pressingNotes) additiveGroups.splice(i, 1);
                }
              }
              const hasOtherPressingFiles = isVintageScoped && !!vintagePressingAttachments && (data.pressings ?? []).some(p => {
                const pid = p.id != null ? Number(p.id) : null;
                return pid != null && (vintagePressingAttachments.get(pid) ?? []).length > 0;
              });
              if (!hasDetails && !pressId && additiveGroups.length === 0 && !pressing.notes && !hasOtherPressingFiles) return null;
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
                  {/* Vintage scope: attachments for the OTHER pressing sessions in the
                      vintage (primary's files are already shown by RecordAttachments
                      above). Same best-effort data the CSV/PDF exports list — sessions
                      without files are omitted. Single-batch scope renders nothing. */}
                  {isVintageScoped && vintagePressingAttachments && (() => {
                    const others = (data.pressings ?? []).filter(p => {
                      const pid = p.id != null ? Number(p.id) : null;
                      return pid != null && pid !== pressId && (vintagePressingAttachments.get(pid) ?? []).length > 0;
                    });
                    if (others.length === 0) return null;
                    return (
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-muted-foreground uppercase tracking-wide font-semibold" style={{ fontSize: "10px" }}>
                          Attachments — Other Pressings
                        </p>
                        {others.map(p => {
                          const pid = Number(p.id);
                          const files = vintagePressingAttachments.get(pid) ?? [];
                          const ref = p.batch_ref != null && String(p.batch_ref).trim() !== "" ? String(p.batch_ref).trim() : null;
                          return (
                            <div key={pid} className="pl-4">
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-1">
                                <span>Pressing — {p.press_date ? fmtDate(p.press_date) : "—"}</span>
                                {ref ? (
                                  <span className="font-mono text-blue-800 bg-blue-100 rounded px-1.5 py-0.5" style={{ fontSize: "10px" }}>{ref}</span>
                                ) : (
                                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5" style={{ fontSize: "10px" }}>No ref</span>
                                )}
                                <span className="font-normal text-muted-foreground/70">({files.length})</span>
                              </p>
                              <ul className="space-y-0.5">
                                {files.map((f, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Paperclip className="h-3 w-3 shrink-0" />
                                    <TrailAttachmentName file={f} />
                                    {!!f.uploadedAt && <span className="text-muted-foreground/70 shrink-0">· Uploaded {fmtDate(f.uploadedAt)}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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
                              {/* Each pressing's own operator — mirrors the PDF group header so a
                                  vintage trail no longer reads as one operator doing everything */}
                              {g.operatorName && (
                                <span className="font-normal text-muted-foreground/70">Operator: {g.operatorName}</span>
                              )}
                              <span className="font-normal text-muted-foreground/70">({g.additions.length})</span>
                            </p>
                          )}
                          {isVintageScoped && !!g.pressingNotes && (
                            <div className="mb-1">
                              <p className="text-muted-foreground uppercase tracking-wide font-semibold" style={{ fontSize: "10px" }}>Pressing Notes</p>
                              <p className="text-xs text-muted-foreground italic">{g.pressingNotes}</p>
                            </div>
                          )}
                          {g.additions.length === 0 && (
                            <p className="text-xs text-muted-foreground/70 italic">No additives recorded for this pressing.</p>
                          )}
                          {g.additions.length > 0 && (
                          <div className="rounded border divide-y bg-background">
                            {/* Cell values come from the shared PRESS_ADDITIVE_COLUMNS definitions
                                (via ADDITIVE_COL), the same source the batch-trail PDF/CSV render
                                from — screen and downloads can no longer drift apart. */}
                            {g.additions.map((a, i) => (
                              <div key={i} className="px-3 py-2 space-y-0.5">
                                <div className="flex items-center gap-3 text-xs">
                                  <Beaker className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="font-medium">{ADDITIVE_COL.additive_name.pdfValue(a) || "—"}</span>
                                  <span className="text-muted-foreground">{ADDITIVE_COL.category.pdfValue(a) || "—"}</span>
                                  <span className="text-muted-foreground font-mono ml-auto">{a.dose != null && a.dose !== "" ? `${ADDITIVE_COL.dose.pdfValue(a)} ${ADDITIVE_COL.unit.pdfValue(a)}`.trim() : "—"}</span>
                                </div>
                                {!!a.notes && <p className="text-xs text-muted-foreground italic pl-6">{ADDITIVE_COL.notes.pdfValue(a)}</p>}
                                {EXTRA_ADDITIVE_COLUMNS.map(col => (
                                  <p key={col.field} className="text-xs text-muted-foreground pl-6">
                                    <span className="uppercase tracking-wide font-semibold" style={{ fontSize: "10px" }}>{col.pdfLabel}:</span> {col.pdfValue(a) || "—"}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isVintageScoped && !!pressing.notes && (
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
                      {rowAttachments(stageAttachments?.ferm, r)}
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
                      {rowAttachments(stageAttachments?.cellar, r)}
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
                      {rowAttachments(stageAttachments?.so2, r)}
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
                          // Shared verdict helper — same logic as the Bottling tab and printed report
                          const v = bottlingSo2Verdict(r as Record<string, unknown>);
                          if (!v) return null;
                          return (
                            <>
                              <span>Ceiling: {v.ceiling.toFixed(0)} mg/L{v.isOrganic ? " (organic)" : ""}</span>
                              {v.compliant != null && (v.compliant
                                ? <span className="inline-flex items-center gap-0.5 text-green-700 font-medium"><CheckCircle2 className="w-3 h-3" />Compliant</span>
                                : <span className="inline-flex items-center gap-0.5 text-red-700 font-medium"><XCircle className="w-3 h-3" />Exceeds limit</span>)}
                            </>
                          );
                        })()}
                        {r.ph != null && <span className="text-blue-700 font-medium">pH: {fmtNum(r.ph, 2)}</span>}
                        {r.titratable_acidity_gl != null && <span className="text-blue-700">TA: {fmtNum(r.titratable_acidity_gl, 1)} g/L</span>}
                      </div>
                      {!!r.source_vessel_ref && <p className="text-xs text-muted-foreground">Source vessel: {String(r.source_vessel_ref)}</p>}
                      {!!r.notes && <p className="text-xs text-muted-foreground italic">{String(r.notes)}</p>}
                      {rowAttachments(stageAttachments?.bottling, r)}
                    </div>
                    );
                  })}
                </div>
              </TrailSection>
            )}

            {/* Barrel Provenance */}
            {(() => {
              const barrelFills = Array.isArray(data.barrelFills) ? data.barrelFills : [];
              if (barrelFills.length === 0) return null;
              const barrelMaintenance = Array.isArray(data.barrelMaintenance) ? data.barrelMaintenance : [];

              const WORK_TYPE_LABELS: Record<string, string> = {
                inspection: "Inspection",
                stave_repair: "Stave repair",
                head_replacement: "Head replacement",
                re_toast: "Re-toast",
                re_char: "Re-char",
                re_cooper: "Re-cooper",
                condemned: "Condemned",
              };

              const fillOakLabel = (fillNumber: number): { label: string; className: string } => {
                if (fillNumber === 1) return { label: "New oak (1st fill)", className: "bg-amber-100 text-amber-800" };
                if (fillNumber === 2) return { label: "2nd fill", className: "bg-yellow-50 text-yellow-900" };
                if (fillNumber === 3) return { label: "3rd fill", className: "bg-green-50 text-green-800" };
                if (fillNumber === 4) return { label: "4th fill", className: "bg-blue-50 text-blue-800" };
                return { label: `${fillNumber}th fill – neutral oak`, className: "bg-muted text-muted-foreground" };
              };

              const barrelDuration = (fillDate: unknown, rackOutDate: unknown): string => {
                const start = fillDate ? new Date(String(fillDate)) : null;
                if (!start || isNaN(start.getTime())) return "—";
                const end = rackOutDate ? new Date(String(rackOutDate)) : null;
                const days = end ? Math.round((end.getTime() - start.getTime()) / 86400000) : null;
                if (days == null) return "Still maturing";
                if (days < 0) return "—";
                if (days < 31) return `${days}d`;
                const months = Math.floor(days / 30.44);
                return months < 12 ? `${months} mo` : `${Math.floor(months / 12)}y ${months % 12}mo`;
              };

              // Group fills by vessel_id, preserving insertion order (one meta per vessel)
              const vesselMap = new Map<number, Record<string, unknown>[]>();
              const vesselMeta = new Map<number, Record<string, unknown>>();
              for (const f of barrelFills) {
                const vid = Number(f.vessel_id);
                if (!vesselMap.has(vid)) {
                  vesselMap.set(vid, []);
                  vesselMeta.set(vid, f);
                }
                vesselMap.get(vid)!.push(f);
              }

              return (
                <TrailSection icon={Package} title="Barrel Provenance" count={vesselMap.size}>
                  <p className="text-xs text-muted-foreground -mt-1 mb-2">
                    Fill history for each oak barrel used as a source vessel in a bottling run for this batch. Fill numbers reflect how many times the barrel has been used — influencing oak extraction and wine character.
                  </p>
                  <div className="space-y-3">
                    {Array.from(vesselMap.entries()).map(([vid, fills]) => {
                      const meta = vesselMeta.get(vid)!;
                      const cooperage = meta.cooperage ? String(meta.cooperage) : null;
                      const oakOrigin = meta.oak_origin ? String(meta.oak_origin) : null;
                      const toasting = meta.toasting_level ? String(meta.toasting_level) : null;
                      const capacityL = meta.capacity_litres != null ? parseFloat(String(meta.capacity_litres)) : null;
                      return (
                        <div key={vid} className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <button
                              className="font-semibold text-sm inline-flex items-center gap-1 hover:text-amber-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded transition-colors"
                              title="Open full barrel record"
                              onClick={() => setOpenVesselId(vid)}
                            >
                              🪵 {String(meta.vessel_ref ?? "")}
                              <Eye className="h-3 w-3 text-muted-foreground" />
                            </button>
                            {cooperage && <span className="text-xs text-muted-foreground">Cooperage: <strong className="text-foreground">{cooperage}</strong></span>}
                            {oakOrigin && <span className="text-xs text-muted-foreground">Oak origin: <strong className="text-foreground">{oakOrigin}</strong></span>}
                            {toasting && <span className="text-xs text-muted-foreground">Toasting: <strong className="text-foreground">{toasting}</strong></span>}
                            {capacityL != null && <span className="text-xs text-muted-foreground">{capacityL.toFixed(0)} L</span>}
                          </div>
                          <div className="rounded border bg-white/70 overflow-x-auto">
                            <div className="min-w-[560px]">
                              <div className="grid text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-orange-100/60 border-b border-orange-200 px-3 py-1.5" style={{ gridTemplateColumns: "1.6fr 1.4fr 0.9fr 72px 72px 90px 58px 90px" }}>
                                <span>Fill</span>
                                <span>Wine</span>
                                <span>Variety</span>
                                <span>In</span>
                                <span>Out</span>
                                <span>Duration</span>
                                <span>Volume</span>
                                <span>Batch Ref</span>
                              </div>
                              <div className="divide-y">
                                {fills.map((f, i) => {
                                  const fn = Number(f.fill_number);
                                  const oak = fillOakLabel(fn);
                                  const stillIn = !f.rack_out_date;
                                  const volL = f.volume_litres != null ? parseFloat(String(f.volume_litres)) : null;
                                  const isCurrentBatch = !!f.fill_batch_ref && !!pressing.batch_ref &&
                                    String(f.fill_batch_ref).trim() === String(pressing.batch_ref).trim();
                                  return (
                                    <div
                                      key={i}
                                      className={`grid text-xs px-3 py-2 items-start gap-x-1${isCurrentBatch ? " bg-amber-50 border-l-4 border-l-amber-400" : ""}`}
                                      style={{ gridTemplateColumns: "1.6fr 1.4fr 0.9fr 72px 72px 90px 58px 90px" }}
                                    >
                                      <span><span className={`inline-block px-1.5 py-0.5 rounded font-semibold ${oak.className}`}>{oak.label}</span></span>
                                      <span>{f.wine_name ? String(f.wine_name) : "—"}{f.fill_vintage_year ? <span className="text-muted-foreground"> ({String(f.fill_vintage_year)})</span> : null}</span>
                                      <span className="text-muted-foreground">{f.variety ? String(f.variety) : "—"}</span>
                                      <span className="text-muted-foreground">{f.fill_date ? fmtDate(f.fill_date) : "—"}</span>
                                      <span className="text-muted-foreground">{f.rack_out_date ? fmtDate(f.rack_out_date) : "—"}</span>
                                      <span className={`font-mono font-semibold${stillIn ? " text-green-700" : ""}`}>{barrelDuration(f.fill_date, f.rack_out_date)}</span>
                                      <span className="text-muted-foreground">{volL != null ? `${volL.toFixed(0)} L` : "—"}</span>
                                      <span className="flex items-center gap-1 flex-wrap">
                                        {f.fill_batch_ref ? <span className="font-mono text-blue-800 bg-blue-100 rounded px-1.5 py-0.5" style={{ fontSize: "10px" }}>{String(f.fill_batch_ref)}</span> : "—"}
                                        {isCurrentBatch && (
                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold text-amber-800 bg-amber-200 border border-amber-400 whitespace-nowrap" style={{ fontSize: "9px" }}>
                                            ★ This batch
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          {/* Cooperage maintenance records for this vessel */}
                          {(() => {
                            const vesselMaintRows = barrelMaintenance.filter(m => Number(m.vessel_id) === vid);
                            if (vesselMaintRows.length === 0) return null;
                            return (
                              <div className="mt-2 border-t border-orange-200 pt-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1.5 flex items-center gap-1">
                                  <Wrench className="h-3 w-3" />
                                  Cooperage Work ({vesselMaintRows.length})
                                </p>
                                <div className="rounded border overflow-x-auto bg-white/70">
                                  <div className="min-w-[420px]">
                                    <div className="grid text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-orange-100/60 border-b border-orange-200 px-3 py-1.5" style={{ gridTemplateColumns: "80px 1.4fr 1.2fr 68px 1fr" }}>
                                      <span>Date</span>
                                      <span>Work Type</span>
                                      <span>Cooperage</span>
                                      <span className="text-right">Cost</span>
                                      <span>Notes</span>
                                    </div>
                                    <div className="divide-y">
                                      {vesselMaintRows.map((m, mi) => {
                                        const workType = String(m.work_type ?? "");
                                        const workLabel = WORK_TYPE_LABELS[workType] ?? (workType || "—");
                                        const isReToast = workType === "re_toast" || workType === "re_char";
                                        const costPence = m.cost_pence != null ? parseFloat(String(m.cost_pence)) : null;
                                        const costStr = costPence != null ? `£${(costPence / 100).toFixed(2)}` : "—";
                                        return (
                                          <div
                                            key={mi}
                                            className={`grid text-xs px-3 py-2 items-start gap-x-1${isReToast ? " bg-amber-50" : ""}`}
                                            style={{ gridTemplateColumns: "80px 1.4fr 1.2fr 68px 1fr" }}
                                          >
                                            <span className="text-muted-foreground">{m.maintenance_date ? fmtDate(m.maintenance_date) : "—"}</span>
                                            <span className={isReToast ? "font-semibold text-amber-700 flex items-center gap-1" : "font-medium"}>
                                              {isReToast && <span aria-hidden="true">🔥</span>}{workLabel}
                                            </span>
                                            <span className="text-muted-foreground">{m.cooperage_name ? String(m.cooperage_name) : "—"}</span>
                                            <span className="text-right font-mono">{costStr}</span>
                                            <span className="text-muted-foreground italic">{m.notes ? String(m.notes) : ""}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </TrailSection>
              );
            })()}

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
              <Button variant="outline" size="sm" onClick={() => { void printBatchTrail(farmId, pressing, data, farmName, batchTrailEmbed.sig, batchTrailEmbed.signerInfo); }} title={batchTrailEmbed.willEmbed ? "Signed — signature will be embedded" : undefined}>
                <Printer className="w-3.5 h-3.5 mr-1" />Print / Export PDF
                {batchTrailEmbed.willEmbed && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
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

    {/* Vessel detail — opened by clicking a vessel ref in the Barrel Provenance section */}
    {openVesselId != null && (
      <VesselDetailFromTrail
        farmId={farmId}
        vesselId={openVesselId}
        onClose={() => setOpenVesselId(null)}
      />
    )}
    </>
  );
}

// ─── Batch Trail — CSV export ─────────────────────────────────────────────────
// ─── Vintage pH & TA comparison rows — shared by the batch-trail PDF + CSV ────
// Per-batch pH/TA: bottling (primary, most recent) → fermentation end (fallback).
// Both printBatchTrail's "Vintage pH & TA Comparison" table and the CSV export's
// comparison section derive their rows from this one function so they can't drift.
export function computeVintagePhTaComparisonRows(data: BatchTrailData): { ref: string; ph: number | null; ta: number | null; source: string | null }[] {
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

// Renders an attachment's file name as a link that opens/downloads the file in
// a new tab — same fileUrl the RecordAttachments component's download icon uses.
// Falls back to plain text if the record predates fileUrl being returned.
function TrailAttachmentName({ file }: { file: TrailAttachment }) {
  const name = String(file.fileName ?? "");
  if (!file.fileUrl) return <span className="truncate">{name}</span>;
  return (
    <a
      href={file.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="truncate underline underline-offset-2 hover:text-foreground"
      title="Download / view"
    >
      {name}
    </a>
  );
}

// ─── Batch-trail attachment fetch helpers ─────────────────────────────────────
// Best-effort attachment lookups shared by the CSV export and the printed PDF —
// a failed fetch never blocks the export, but failures are surfaced (null /
// lookupFailed) so exports can show a visible note instead of silently omitting
// the attachments section.
export type TrailAttachment = { fileName: string; uploadedAt: string; fileUrl?: string };

// Returns null when the lookup itself failed (network error or non-OK response),
// as distinct from an empty array meaning "record genuinely has no attachments".
export async function fetchTrailAttachments(farmId: number, recordType: string, recordId: number): Promise<TrailAttachment[] | null> {
  try {
    const res = await fetch(api(`farms/${farmId}/record-attachments?recordType=${recordType}&recordId=${recordId}`), { credentials: "include" });
    if (!res.ok) return null;
    const json = await res.json();
    return (Array.isArray(json) ? json : []) as TrailAttachment[];
  } catch {
    return null; // best-effort — non-critical, but callers can tell it failed
  }
}

export type StageAttachmentsResult = {
  /** record id → attachments, only for records that actually have attachments */
  map: Map<number, TrailAttachment[]>;
  /** true when at least one record's attachment lookup failed */
  lookupFailed: boolean;
};

// Fetch attachments for every record of a stage; returns a map keyed by record id
// containing only records that actually have attachments, plus a flag telling
// callers whether any individual lookup failed (so exports can warn the user).
export async function fetchStageAttachmentsWithStatus(farmId: number, recordType: string, records: Record<string, unknown>[]): Promise<StageAttachmentsResult> {
  const map = new Map<number, TrailAttachment[]>();
  let lookupFailed = false;
  await Promise.all(records.map(async r => {
    const id = r.id != null ? Number(r.id) : null;
    if (!id) return;
    const files = await fetchTrailAttachments(farmId, recordType, id);
    if (files === null) { lookupFailed = true; return; }
    if (files.length > 0) map.set(id, files);
  }));
  return { map, lookupFailed };
}

// Back-compat wrapper for callers that only need the map (on-screen dialog).
export async function fetchStageAttachments(farmId: number, recordType: string, records: Record<string, unknown>[]): Promise<Map<number, TrailAttachment[]>> {
  return (await fetchStageAttachmentsWithStatus(farmId, recordType, records)).map;
}

export async function exportBatchTrailCsv(farmId: number, pressing: Record<string, unknown>, data: BatchTrailData, farmName: string) {
  // Fetch attachments for the pressing record(s) (best-effort — CSV still exports if this fails).
  // Mirrors the attachments block in the printed PDF (printBatchTrail).
  // In vintage scope the trail spans every pressing session in data.pressings,
  // so attachments are fetched for ALL of them (keyed per pressing id) rather
  // than just the clicked/primary pressing. Single-batch scope is unchanged.
  const isVintageScoped = data.scope === "vintageYear";
  const pressId = pressing.id != null ? Number(pressing.id) : null;
  const vintagePressings = isVintageScoped && Array.isArray(data.pressings) && data.pressings.length > 0
    ? data.pressings
    : [pressing];
  // Fermentation / cellar op / SO₂ test / bottling attachments — same best-effort
  // fetch, keyed per record so each stage row can list its own files. Lookup
  // failures don't block the export, but they are surfaced as a visible note row
  // so users can tell "no attachments" apart from "lookup failed".
  const [pressingResult, fermResult, cellarResult, so2Result, bottlingResult] = await Promise.all([
    fetchStageAttachmentsWithStatus(farmId, "winery-pressing", vintagePressings),
    fetchStageAttachmentsWithStatus(farmId, "winery-fermentation", data.fermentation),
    fetchStageAttachmentsWithStatus(farmId, "winery-cellar-op", data.cellarOps),
    fetchStageAttachmentsWithStatus(farmId, "winery-so2-test", data.so2Tests),
    fetchStageAttachmentsWithStatus(farmId, "winery-bottling", data.bottling),
  ]);
  const pressingAttachmentsById = pressingResult.map;
  const fermAttachments = fermResult.map;
  const cellarAttachments = cellarResult.map;
  const so2Attachments = so2Result.map;
  const bottlingAttachments = bottlingResult.map;
  const attachmentLookupFailed = [pressingResult, fermResult, cellarResult, so2Result, bottlingResult].some(r => r.lookupFailed);
  const pressAttachments: TrailAttachment[] = pressId != null ? (pressingAttachmentsById.get(pressId) ?? []) : [];
  const batchRef = String(pressing.batch_ref ?? "");
  const vintageYear = data.vintageYear ? String(data.vintageYear) : (pressing.vintage_year ? String(pressing.vintage_year) : null);
  const rows: string[][] = [];

  // Every data row is built as a named-cell record and mapped through
  // BATCH_TRAIL_CSV_HEADER (same pattern as the pressing-additive rows), so
  // inserting or reordering a header column can never misalign a row's values.
  const pushRow = (cells: Record<string, string>) => {
    rows.push(BATCH_TRAIL_CSV_HEADER.map(h => cells[h] ?? ""));
  };

  // Header
  rows.push([...BATCH_TRAIL_CSV_HEADER]);

  // Attachment lookup failure note — placed right after the header so it can't
  // be missed. Without this, a failed lookup is indistinguishable from a batch
  // that genuinely has no attachments.
  if (attachmentLookupFailed) {
    pushRow({
      "Stage": "⚠ Attachment list unavailable",
      "Detail": "Attachment lookup failed — some or all attachment rows may be missing from this export. Retry the export to include them.",
    });
  }

  const pressingBatchRef = String(pressing.batch_ref ?? "");

  // Pressing — summary row with juice analytics
  pushRow({
    "Stage": "Pressing — Juice",
    "Batch Ref": pressingBatchRef,
    "Date": fmtDate(pressing.press_date),
    "Type / Additive": String(pressing.press_type ?? ""),
    "Detail": pressing.juice_brix != null ? `Brix: ${fmtNum(pressing.juice_brix, 1)}` : "",
    "pH": pressing.juice_ph != null ? fmtNum(pressing.juice_ph, 2) : "",
    "TA (g/L)": pressing.juice_ta_gl != null ? fmtNum(pressing.juice_ta_gl, 1) : "",
    "Operator": String(pressing.operator_name ?? ""),
  });

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
      "Operator": isVintageScoped && a.pressing_operator_name != null && String(a.pressing_operator_name).trim() !== ""
        ? String(a.pressing_operator_name).trim()
        : String(pressing.operator_name ?? ""),
    };
    for (const col of PRESS_ADDITIVE_COLUMNS) cells[col.csvColumn] = col.csvValue(a);
    pushRow(cells);
  }

  // Pressing notes — dedicated row, only when non-empty (mirrors on-screen view)
  if (pressing.notes) {
    pushRow({
      "Stage": "Pressing — Notes",
      "Batch Ref": pressingBatchRef,
      "Date": fmtDate(pressing.press_date),
      "Detail": String(pressing.notes),
    });
  }

  // Pressing attachments — one row per file, only when attachments exist (mirrors the PDF).
  // In vintage scope every pressing session's attachments are listed, each row
  // attributed to its own pressing's batch ref; single-batch scope emits only
  // the clicked pressing's files (unchanged behaviour).
  for (const p of vintagePressings) {
    const pid = p.id != null ? Number(p.id) : null;
    const files = pid != null ? (pressingAttachmentsById.get(pid) ?? []) : [];
    const rowBatchRef = String(p.batch_ref ?? "").trim() || pressingBatchRef;
    for (const a of files) {
      pushRow({
        "Stage": "Pressing — Attachment",
        "Batch Ref": rowBatchRef,
        "Date": a.uploadedAt ? fmtDate(a.uploadedAt) : "",
        "Type / Additive": "Attachment",
        "Detail": String(a.fileName ?? ""),
        "Notes": a.uploadedAt ? `Uploaded ${fmtDate(a.uploadedAt)}` : "",
      });
    }
  }

  // Attachment rows for a stage record — same shape as the pressing attachment
  // rows above; emitted directly after the record's own row, omitted when empty.
  const pushStageAttachmentRows = (stageLabel: string, r: Record<string, unknown>, attMap: Map<number, TrailAttachment[]>) => {
    const files = r.id != null ? attMap.get(Number(r.id)) : undefined;
    for (const a of files ?? []) {
      pushRow({
        "Stage": `${stageLabel} — Attachment`,
        "Batch Ref": String(r.batch_ref ?? ""),
        "Date": a.uploadedAt ? fmtDate(a.uploadedAt) : "",
        "Type / Additive": "Attachment",
        "Detail": String(a.fileName ?? ""),
        "Notes": a.uploadedAt ? `Uploaded ${fmtDate(a.uploadedAt)}` : "",
      });
    }
  };

  // Fermentation
  for (const r of data.fermentation) {
    pushRow({
      "Stage": "Fermentation",
      "Batch Ref": String(r.batch_ref ?? ""),
      "Date": r.start_date ? fmtDate(r.start_date) : "",
      "Type / Additive": String(r.fermentation_type ?? ""),
      "Detail": r.yeast_strain ? `Yeast: ${String(r.yeast_strain)}` : "",
      "SO₂ / Dose": r.so2_at_fermentation_mg_l != null ? fmtNum(r.so2_at_fermentation_mg_l, 1) : "",
      "Unit": r.so2_at_fermentation_mg_l != null ? "mg/L" : "",
      "pH": r.end_ph != null ? fmtNum(r.end_ph, 2) : "",
      "TA (g/L)": r.end_ta_gl != null ? fmtNum(r.end_ta_gl, 1) : "",
      "Vessel": String(r.vessel_ref ?? ""),
      "Operator": String(r.operator_name ?? ""),
      "Notes": String(r.notes ?? ""),
    });
    pushStageAttachmentRows("Fermentation", r, fermAttachments);
  }

  // Cellar ops — per-op running SO₂ totals computed in chronological op order
  // via the shared cellarSo2RunningTotals helper, matching the batch-trail PDF's
  // "Running total after this op (cumulative mg/L)" column.
  const csvCellarChrono = [...data.cellarOps].sort((a, b) => String(a.op_date ?? "").localeCompare(String(b.op_date ?? "")));
  const { perOp: csvCellarPerOp } = cellarSo2RunningTotals(csvCellarChrono);
  const csvRunningByOp = new Map<Record<string, unknown>, { contributed: boolean; runningMgL: number | null }>();
  csvCellarChrono.forEach((op, i) => csvRunningByOp.set(op, csvCellarPerOp[i]));
  for (const r of data.cellarOps) {
    const soDetails = r.so2_quantity_g != null ? fmtNum(r.so2_quantity_g, 1) : (r.free_so2_after_mg_l != null ? fmtNum(r.free_so2_after_mg_l, 1) : "");
    const soUnit = r.so2_quantity_g != null ? "g" : (r.free_so2_after_mg_l != null ? "mg/L (after)" : "");
    const running = csvRunningByOp.get(r);
    const runningCell = String(r.op_type) === "sulfiting"
      ? (running?.contributed && running.runningMgL != null ? `≈ ${running.runningMgL.toFixed(1)}` : "—")
      : "";
    pushRow({
      "Stage": "Cellar Operation",
      "Batch Ref": String(r.batch_ref ?? ""),
      "Date": fmtDate(r.op_date),
      "Type / Additive": CELLAR_OP_LABELS[String(r.op_type)] ?? String(r.op_type ?? ""),
      "Detail": r.fining_agent ? `Fining: ${String(r.fining_agent)}` : "",
      "SO₂ / Dose": soDetails,
      "Unit": soUnit,
      "Vessel": [r.from_vessel_ref, r.to_vessel_ref].filter(Boolean).join(" → "),
      "Operator": String(r.operator_name ?? ""),
      "Notes": String(r.notes ?? ""),
      "Running SO₂ Total (mg/L)": runningCell,
    });
    pushStageAttachmentRows("Cellar Operation", r, cellarAttachments);
  }

  // SO₂ tests
  // Uses the shared so2LimitUnverified predicate (same rule as the batch-trail
  // PDF, the SO₂ register CSV column and the on-screen table flag), so the
  // compliance cell carries the same caveat.
  for (const r of data.so2Tests) {
    const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
    const unverifiedLimit = so2LimitUnverified(r);
    const compliance = r.so2_compliant === true || r.so2_compliant === "true" ? "Compliant" : r.so2_compliant === false || r.so2_compliant === "false" ? "Exceeds Limit" : "";
    pushRow({
      "Stage": "SO₂ Test",
      "Batch Ref": String(r.batch_ref ?? ""),
      "Date": fmtDate(r.test_date),
      "Type / Additive": SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? String(r.test_stage ?? ""),
      "SO₂ / Dose": r.free_so2_mg_l != null ? fmtNum(r.free_so2_mg_l, 1) : "",
      "Unit": "mg/L (free)",
      "SO₂ Ceiling (mg/L)": maxVal != null ? maxVal.toFixed(0) : "",
      "SO₂ Compliance": unverifiedLimit ? (compliance ? `${compliance} — Limit unverified (no batch ref)` : "Limit unverified (no batch ref)") : compliance,
      "pH": r.ph != null ? fmtNum(r.ph, 2) : "",
      "TA (g/L)": r.titratable_acidity_gl != null ? fmtNum(r.titratable_acidity_gl, 1) : "",
      "Vessel": String(r.vessel_ref ?? ""),
      "Operator": String(r.operator_name ?? ""),
      "Notes": String(r.notes ?? ""),
    });
    pushStageAttachmentRows("SO₂ Test", r, so2Attachments);
  }

  // Bottling — SO₂ ceiling and compliance verdict via the shared helper,
  // matching the Bottling tab and PDF logic
  for (const r of data.bottling) {
    const v = bottlingSo2Verdict(r as Record<string, unknown>);
    pushRow({
      "Stage": "Bottling",
      "Batch Ref": String(r.batch_ref ?? ""),
      "Date": fmtDate(r.bottling_date),
      "Type / Additive": r.lot_code ? `Lot: ${String(r.lot_code)}` : "",
      "Detail": r.bottles_produced != null ? `${String(r.bottles_produced)} bottles` : "",
      "SO₂ / Dose": r.free_so2_mg_l != null ? fmtNum(r.free_so2_mg_l, 1) : "",
      "Unit": r.free_so2_mg_l != null ? "mg/L (free SO₂)" : "",
      "SO₂ Ceiling (mg/L)": v ? `${v.ceiling.toFixed(0)} (${v.isOrganic ? "organic" : "conventional"})` : "",
      "SO₂ Compliance": v?.compliant != null ? (v.compliant ? "Compliant" : "Exceeds Limit") : "",
      "pH": r.ph != null ? fmtNum(r.ph, 2) : "",
      "TA (g/L)": r.titratable_acidity_gl != null ? fmtNum(r.titratable_acidity_gl, 1) : "",
      "Vessel": String(r.source_vessel_ref ?? ""),
      "Operator": String(r.operator_name ?? ""),
      "Notes": String(r.notes ?? ""),
    });
    pushStageAttachmentRows("Bottling", r, bottlingAttachments);
  }

  // ── Barrel Provenance ───────────────────────────────────────────────────────
  // One row per fill across all oak barrels — same data as the on-screen Barrel
  // Provenance section. Empty section is omitted (same convention as other blocks).
  // Columns are mapped onto existing BATCH_TRAIL_CSV_HEADER slots with a heading
  // row re-labelling each slot so spreadsheet readers know what they're looking at.
  const barrelFillsForCsv = Array.isArray(data.barrelFills) ? data.barrelFills : [];
  if (barrelFillsForCsv.length > 0) {
    const csvBarrelDuration = (fillDate: unknown, rackOutDate: unknown): string => {
      const start = fillDate ? new Date(String(fillDate)) : null;
      if (!start || isNaN(start.getTime())) return "";
      const end = rackOutDate ? new Date(String(rackOutDate)) : null;
      const days = end ? Math.round((end.getTime() - start.getTime()) / 86400000) : null;
      if (days == null) return "Still maturing";
      if (days < 0) return "";
      if (days < 31) return `${days}d`;
      const months = Math.floor(days / 30.44);
      return months < 12 ? `${months} mo` : `${Math.floor(months / 12)}y ${months % 12}mo`;
    };
    // Blank separator row
    pushRow({});
    // Section heading — re-labels each CSV column so the barrel data is self-describing
    pushRow({
      "Stage": "Barrel Provenance",
      "Batch Ref": "Batch Ref",
      "Date": "Fill Date",
      "Type / Additive": "Fill Number",
      "Detail": "Wine Name",
      "SO₂ / Dose": "Vintage",
      "Unit": "Variety",
      "SO₂ Ceiling (mg/L)": "Volume (L)",
      "SO₂ Compliance": "Rack-out Date",
      "pH": "Duration",
      "Vessel": "Vessel Ref",
      "Operator": "Cooperage",
      "Notes": "Oak Origin / Toasting",
    });
    for (const f of barrelFillsForCsv) {
      const fillNum = f.fill_number != null ? Number(f.fill_number) : null;
      const fillLabel = fillNum != null ? `Fill ${fillNum}` : "";
      const volL = f.volume_litres != null ? parseFloat(String(f.volume_litres)) : null;
      const oakParts = [f.oak_origin ? String(f.oak_origin) : "", f.toasting_level ? `Toasting: ${String(f.toasting_level)}` : ""].filter(Boolean);
      pushRow({
        "Stage": "Barrel Fill",
        "Batch Ref": String(f.fill_batch_ref ?? ""),
        "Date": f.fill_date ? fmtDate(f.fill_date) : "",
        "Type / Additive": fillLabel,
        "Detail": String(f.wine_name ?? ""),
        "SO₂ / Dose": f.fill_vintage_year != null ? String(f.fill_vintage_year) : "",
        "Unit": String(f.variety ?? ""),
        "SO₂ Ceiling (mg/L)": volL != null ? volL.toFixed(0) : "",
        "SO₂ Compliance": f.rack_out_date ? fmtDate(f.rack_out_date) : "",
        "pH": csvBarrelDuration(f.fill_date, f.rack_out_date),
        "Vessel": String(f.vessel_ref ?? ""),
        "Operator": String(f.cooperage ?? ""),
        "Notes": oakParts.join("; "),
      });
    }
  }

  // ── Barrel Cooperage Work ───────────────────────────────────────────────────
  // One row per maintenance record across all oak barrels in this batch/vintage.
  // Only emitted when the batch includes barrel-type vessels with maintenance
  // records (mirrors the on-screen Barrel Provenance section convention).
  const barrelMaintenanceForCsv = Array.isArray(data.barrelMaintenance) ? data.barrelMaintenance : [];
  if (barrelMaintenanceForCsv.length > 0) {
    // Blank separator row
    pushRow({});
    // Section heading — re-labels each CSV column so the cooperage data is self-describing
    pushRow({
      "Stage": "Barrel Cooperage Work",
      "Batch Ref": "Barrel",
      "Date": "Date",
      "Type / Additive": "Work Type",
      "Operator": "Cooperage",
      "SO₂ / Dose": "Cost (£)",
      "Notes": "Notes",
    });
    for (const m of barrelMaintenanceForCsv) {
      const costPence = m.cost_pence != null ? Number(m.cost_pence) : null;
      pushRow({
        "Stage": "Cooperage Work",
        "Batch Ref": String(m.vessel_ref ?? ""),
        "Date": m.maintenance_date ? fmtDate(m.maintenance_date) : "",
        "Type / Additive": String(m.work_type ?? ""),
        "Operator": String(m.cooperage_name ?? ""),
        "SO₂ / Dose": costPence != null ? (costPence / 100).toFixed(2) : "",
        "Notes": String(m.notes ?? ""),
      });
    }
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
    pushRow({});
    // Section heading — pH/TA labels placed under their own header columns
    pushRow({ "Stage": "pH & TA Analytical History", "pH": "pH", "TA (g/L)": "TA (g/L)" });
    for (const [stage, ph, ta] of phTaStages) {
      pushRow({ "Stage": stage, "Batch Ref": batchRef, "pH": ph, "TA (g/L)": ta });
    }
  }

  // ── Vintage pH & TA Comparison summary block (vintage scope only) ───────────
  // Row logic shared with the printed PDF via computeVintagePhTaComparisonRows:
  // per-batch pH/TA — bottling (most recent) primary, fermentation end fallback.
  if (isVintageScoped) {
    const cmpRows = computeVintagePhTaComparisonRows(data);
    if (cmpRows.length > 0) {
      // Blank separator row
      pushRow({});
      // Section heading — "Type / Additive" column carries the source stage per row
      pushRow({ "Stage": "Vintage pH & TA Comparison", "Batch Ref": "Batch Ref", "Type / Additive": "Stage", "pH": "pH", "TA (g/L)": "TA (g/L)" });
      for (const r of cmpRows) {
        pushRow({
          "Stage": "Vintage Comparison",
          "Batch Ref": r.ref,
          "Type / Additive": r.source ?? "",
          "pH": r.ph != null ? r.ph.toFixed(2) : "",
          "TA (g/L)": r.ta != null ? r.ta.toFixed(1) : "",
        });
      }
    }
  }

  const prefixLine = isVintageScoped && vintageYear
    ? `"Full Vintage Trail — Vintage ${vintageYear} — ${farmName.replace(/"/g, '""')}"`
    : null;
  // Every row is built via pushRow (named cells mapped through
  // BATCH_TRAIL_CSV_HEADER), so all rows are already exactly header-width.
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
