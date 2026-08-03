import { SignatureEmbed, NO_EMBED, signatureEmbedFrom, computeSo2DominantUnitByVintage, SOURCE_LABELS, so2UnitOutlierDominant, printPressingReport, printAdditionsReport, printSo2TransactionLog } from "./print";
import { useWineryBatchSettings, BatchTrailDialog } from "./BatchTrail";
import { useCrud, useVessels, useEquipment, useStaff, AdditionRow, additionsShortcutKey, WINERY_VIEW_ADDITIONS_EVENT, ADDITIVE_CATEGORY_LABELS, WINE_COLOUR_OPTIONS, UNSPECIFIED_COLOUR, useAdditionsSummary, useAllPressAdditions, PERMITTED_ADDITIVES, PRESS_TYPE_OPTIONS, today, rowMatchesColour, additiveCsvCol, fmtDate, colourFilterLabel, exportCSV, QueryErrorNotice, EmptyState, fmt, fmtNum, signOffTooltip, BatchTrailButton, ORGANIC_MAX_SO2, ADDITIVE_COL, EXTRA_ADDITIVE_COLUMNS, SectionLabel, JUICE_TURBIDITY_OPTIONS, ALL_DOSE_UNITS, SETTLING_METHOD_OPTIONS, ViewField, AssignWineColourDialog, SIGN_OFF_CSV_COLUMNS } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
import { useFarmName } from "@/hooks/use-farm-name";
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
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import SignatureCanvas from "react-signature-canvas";

import { apiUrl as api } from "@/lib/api";

export function PressingRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-pressing", "winery-pressing");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: equipment = [] } = useEquipment(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const batchSettings = useWineryBatchSettings(farmId);
  const { toast } = useToast();
  const farmName: string = useFarmName(farmId);
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
        if (parsed === null || (typeof parsed === "string" && (WINE_COLOUR_OPTIONS.includes(parsed) || parsed === UNSPECIFIED_COLOUR))) return parsed;
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
  const { data: additionsSummary = [], isError: summaryError, error: summaryErrorObj } = useAdditionsSummary(farmId);
  const { data: allAdditions = [], isError: allAdditionsError, error: allAdditionsErrorObj } = useAllPressAdditions(farmId);
  // "Assign wine colour" shortcut for Unspecified report rows. Holds a snapshot
  // of the target pressing records while the dialog is open (null = closed) so
  // rows don't vanish mid-dialog when queries refresh after each save.
  const [assignColourRecords, setAssignColourRecords] = useState<{ id: number; batchRef: string; pressDate: string | null }[] | null>(null);
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

  // Pressing batches whose derived wine colour is missing — targets for the
  // Assign Wine Colour dialog. Report rows from fermentation/cellar sources are
  // mapped back to the batch's pressing record via batch_ref (unique per farm).
  const colourlessPressings = useMemo(() => {
    const out = new Map<number, { id: number; batchRef: string; pressDate: string | null; vintage: string }>();
    for (const a of allAdditions) {
      if (String(a.wine_colour ?? "") !== "") continue;
      let rec: Record<string, unknown> | undefined;
      if (a.pressing_record_id != null) rec = crud.data.find(r => r.id === a.pressing_record_id);
      else if (a.batch_ref) rec = crud.data.find(r => String(r.batch_ref ?? "") === String(a.batch_ref));
      if (!rec) continue;
      const id = rec.id as number;
      if (!out.has(id)) out.set(id, {
        id,
        batchRef: String(rec.batch_ref ?? ""),
        pressDate: rec.press_date ? String(rec.press_date) : null,
        vintage: String(a.vintage_year ?? rec.vintage_year ?? ""),
      });
    }
    return Array.from(out.values());
  }, [allAdditions, crud.data]);
  // Snapshot the matching batches and open the dialog. `vintage` is a year
  // string, or "all" to include every vintage.
  const openAssignColours = (vintage: string) => {
    setAssignColourRecords(colourlessPressings
      .filter(p => vintage === "all" || p.vintage === vintage)
      .map(({ id, batchRef, pressDate }) => ({ id, batchRef, pressDate })));
  };

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
    // wineColour is mapped to its camelCase form key explicitly so the Select
    // reads it and the PUT body carries it (the API reads b.wineColour).
    setForm({
      ...Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])),
      wineColour: r.wine_colour == null ? "" : String(r.wine_colour),
    });
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

  // Single shared embed decision for the Pressing report — consumed by BOTH the
  // ShieldCheck indicator and the Print button's click handler. The PDF embeds
  // the digital signature only when scoped to a single vintage and every visible
  // record is signed by the same person.
  const pressingEmbed = useMemo<SignatureEmbed>(() => {
    if (yearFilter === "all" || filtered.length === 0) return NO_EMBED;
    if (!filtered.every(r => r.audit_signature != null && r.audit_signature !== "")) return NO_EMBED;
    const firstSigner = String(filtered[0].audit_signer_name ?? "");
    if (!filtered.every(r => String(r.audit_signer_name ?? "") === firstSigner)) return NO_EMBED;
    return signatureEmbedFrom(filtered[0]);
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
  // Offer an "Unspecified" chip whenever any visible row lacks a wine colour,
  // so those rows can be isolated (mirrors the pH/TA chart's Unspecified option).
  const summaryHasUnspecifiedColour = filteredSummary.some(r => String(r.wine_colour ?? "") === "");
  const colourFilteredSummary = colourFilter === null
    ? categoryFilteredSummary
    : categoryFilteredSummary.filter(r => rowMatchesColour(r, colourFilter));
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

  // Single shared embed decision for the Additions Report — consumed by BOTH the
  // ShieldCheck indicator and the Print button's click handler. The signature
  // embeds only when every printed row provably derives from records the
  // signature attests to: the report must be scoped to a single vintage, every
  // visible summary row must come from the pressing stage (fermentation/cellar
  // additions are not covered by pressing sign-offs), and every pressing record
  // in that vintage must be signed by the same person. Narrowing filters
  // (search/colour/category) only subset that signed scope, so they remain safe;
  // anything broader falls back to blank sign-off lines.
  const additionsEmbed = ((): SignatureEmbed => {
    if (yearFilter === "all" || searchFilteredSummary.length === 0) return NO_EMBED;
    const allRowsPressing = searchFilteredSummary.every(r =>
      String(r.source ?? "pressing") === "pressing" && String(r.vintage_year ?? "") === yearFilter);
    if (!allRowsPressing) return NO_EMBED;
    const vintagePressings = crud.data.filter((r: Record<string, unknown>) => String(r.vintage_year ?? "") === yearFilter);
    const allSigned = vintagePressings.length > 0 && vintagePressings.every((r: Record<string, unknown>) => r.audit_signature != null && r.audit_signature !== "");
    if (!allSigned) return NO_EMBED;
    const firstSigner = String(vintagePressings[0].audit_signer_name ?? "");
    if (!vintagePressings.every((r: Record<string, unknown>) => String(r.audit_signer_name ?? "") === firstSigner)) return NO_EMBED;
    return signatureEmbedFrom(vintagePressings[0]);
  })();

  const showSo2Chart = categoryFilter.size === 0 || categoryFilter.has("so2");
  // Scope the chart to the active wine colour filter so the graph matches the table below it
  const so2ChartSourceRows = additionsSummary.filter(r =>
    r.category === "so2" && (colourFilter === null || rowMatchesColour(r, colourFilter))
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

  const filteredTransactionLog = (yearFilter === "all"
    ? allAdditions
    : allAdditions.filter((r: Record<string, unknown>) => String(r.vintage_year) === yearFilter)
  ).filter((r: Record<string, unknown>) =>
    txLogBatchFilter.trim() === "" || String(r.batch_ref ?? "").toLowerCase().includes(txLogBatchFilter.trim().toLowerCase())
  );
  // Dominant SO₂ unit per vintage across the per-record rows in the export —
  // same computation as the summary table/PDF/CSV (each record counts once:
  // batch_count is absent on these rows, so the helper defaults it to 1).
  const { dominantUnitByVintage: txLogDominantUnitByVintage } =
    computeSo2DominantUnitByVintage(filteredTransactionLog);

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
    // Matches the summary table/PDF/CSV audit cue — same dominant-unit map
    // (computeSo2DominantUnitByVintage) applied to the per-record rows.
    { key: "unit_outlier", label: "Unit Differs From Vintage", fmt: (r: Record<string, unknown>) => {
      const dominant = so2UnitOutlierDominant(r, txLogDominantUnitByVintage);
      return dominant ? `Yes — most records for this vintage use ${dominant}` : "";
    }},
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

  // Exact-match pressing record for the sign-off badge
  const txLogExactMatch = txLogBatchFilter.trim()
    ? (crud.data.find((r: Record<string, unknown>) =>
        String(r.batch_ref ?? "").toLowerCase() === txLogBatchFilter.trim().toLowerCase()
      ) ?? null)
    : null;
  // Single shared embed decision for the Transaction Log PDF — consumed by BOTH
  // the ShieldCheck indicator and the print handler: the signature embeds when
  // the batch-ref filter exactly matches a signed pressing record.
  const txLogEmbed = signatureEmbedFrom(txLogExactMatch);

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
    // Sign-off columns — shared with fermentation, cellar-ops and bottling exports
    ...SIGN_OFF_CSV_COLUMNS,
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
          // Shared embed decision (pressingEmbed) — same object drives the ShieldCheck
          // indicator on this button, so they can never drift apart.
          printPressingReport(filtered, farmName, vintageLabel, allAdditions, pressingEmbed.sig, pressingEmbed.signerInfo);
        }} disabled={!filtered.length} title={pressingEmbed.willEmbed ? "Signed — signature will be embedded" : undefined}>
          <Printer className="w-3.5 h-3.5 mr-1" />Print / Export PDF
          {pressingEmbed.willEmbed && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
        </Button>
        <Button size="sm" variant="outline" onClick={() => {
          // Apply the active colour filter (from the Additions Report panel) to the exported
          // rows so the scope stated in the filename/header matches the file contents.
          const exportRows = colourFilter
            ? filtered.filter(r => rowMatchesColour(r, colourFilter))
            : filtered;
          const vintageSlug = yearFilter === "all" ? "all-vintages" : yearFilter;
          const colourSlug = colourFilter ? `-${colourFilterLabel(colourFilter).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}` : "";
          const filename = `pressing-report-${vintageSlug}${colourSlug}.csv`;
          const prefixLines = [
            `"Pressing Report — ${farmName.replace(/"/g, '""')}"`,
            `"Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}"`,
            `"Colour filter: ${colourFilter ? colourFilterLabel(colourFilter).replace(/"/g, '""') : "All colours"}"`,
          ];
          exportCSV(exportRows, filename, pressCsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {!crud.isLoading && pressingNonCompliantCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <span>
            <strong>{pressingNonCompliantCount} record{pressingNonCompliantCount !== 1 ? "s" : ""}</strong> exceed{pressingNonCompliantCount === 1 ? "s" : ""} the applicable additive limit
            {yearFilter !== "all" ? ` in ${yearFilter}` : ""}.{" "}
            {!pressingNonCompliantOnly && (
              <button className="underline font-medium" onClick={() => setPressingNonCompliantOnly(true)}>Show non-compliant only</button>
            )}
          </span>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.isError ? <QueryErrorNotice label="pressing records" error={crud.error} />
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
                    {/* Title lives on a wrapping span (same pattern as BatchTrailButton):
                        the base Button's disabled:pointer-events-none suppresses native
                        tooltips on the disabled button itself. */}
                    <span title={r.batch_ref ? `View additions for ${String(r.batch_ref)}` : "No batch reference — additions view unavailable"} className="inline-flex">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 disabled:opacity-40" disabled={!r.batch_ref} onClick={() => {
                        // Open the Additions Report pre-scoped to this row's batch ref and
                        // vintage year — same pre-fill behaviour as the batch trail dialog.
                        if (r.vintage_year != null && String(r.vintage_year) !== "") setYearFilter(String(r.vintage_year));
                        setTxLogBatchFilter(String(r.batch_ref ?? ""));
                        setShowReport(true);
                      }}><Beaker className="h-4 w-4" /></Button>
                    </span>
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
                const scopeLabel = colourFilter !== null
                  ? (colourFilter === UNSPECIFIED_COLOUR ? `${vintagePart} · Unspecified colour` : `${vintagePart} · ${colourFilter} wine`)
                  : vintagePart;
                // Shared embed decision (additionsEmbed) — same object drives the
                // ShieldCheck indicator on this button, so they can never drift apart.
                printAdditionsReport(searchFilteredSummary, farmName, scopeLabel, additionsEmbed.sig, additionsEmbed.signerInfo);
              }} disabled={!searchFilteredSummary.length} title={additionsEmbed.willEmbed ? "Signed — signature will be embedded" : undefined}>
                <FileDown className="w-3.5 h-3.5 mr-1" />Print / Export PDF
                {additionsEmbed.willEmbed && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
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
                const colourSlug = colourFilter !== null ? colourFilterLabel(colourFilter).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") : "";
                const filename = colourFilter !== null
                  ? `additions-report-${colourSlug}-${yearFilter}.csv`
                  : `pressing-additions-report-${yearFilter}.csv`;
                if (colourFilter !== null) {
                  const vintageLabel = yearFilter === "all" ? "All vintages" : `Vintage ${yearFilter}`;
                  const headerText = `Additive Usage Report — ${colourFilterLabel(colourFilter)} — ${vintageLabel} — ${farmName}`;
                  prefixLines.unshift(`"${headerText.replace(/"/g, '""')}"`);
                }
                exportCSV(searchFilteredSummary, filename, summaryCsvCols, prefixLines);
              }} disabled={!searchFilteredSummary.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export Summary CSV</Button>
              <Button size="sm" variant="outline" onClick={() => {
                const batchTrim = txLogBatchFilter.trim();
                const scope = batchTrim || (yearFilter === "all" ? "All vintages" : yearFilter);
                // Shared embed decision (txLogEmbed, from txLogExactMatch) — same object
                // drives the ShieldCheck indicator on this button, so they can never drift apart.
                printSo2TransactionLog(filteredTransactionLog, farmName, scope, txLogEmbed.sig, txLogEmbed.signerInfo);
              }} disabled={!filteredTransactionLog.length} title={txLogEmbed.willEmbed ? "Signed — signature will be embedded" : "Print the SO₂ transaction log as a PDF — embeds the batch's digital signature if one exists"}>
                <Printer className="w-3.5 h-3.5 mr-1" />Transaction Log PDF
                {txLogEmbed.willEmbed && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-green-600" aria-label="Signed — signature will be embedded" />}
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
            {availableColours.length + (summaryHasUnspecifiedColour ? 1 : 0) > 1 && (
              <>
                <span className="text-xs text-muted-foreground shrink-0">Colour:</span>
                {[...availableColours, ...(summaryHasUnspecifiedColour ? [UNSPECIFIED_COLOUR] : [])].map(colour => {
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
                      {colourFilterLabel(colour)}
                    </button>
                  );
                })}
                {summaryHasUnspecifiedColour && (
                  <button
                    onClick={() => openAssignColours(yearFilter)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-purple-400 text-purple-700 hover:bg-purple-50 transition-colors"
                    title="Assign a wine colour to the batches shown under Unspecified"
                    data-testid="assign-colours-chip-button"
                  >
                    <Wine className="h-3 w-3" />Assign colours…
                  </button>
                )}
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
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">SO₂ / KMS — Total dose by vintage{colourFilter ? ` (${colourFilterLabel(colourFilter)})` : ""}</p>
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

          {summaryError || allAdditionsError ? (
            <QueryErrorNotice label="the additions report" error={summaryErrorObj ?? allAdditionsErrorObj} />
          ) : filteredSummary.length === 0 ? (
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
                            : (
                              <button
                                onClick={() => openAssignColours(String(row.vintage_year ?? "") || "all")}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border border-dashed border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors"
                                title="No wine colour recorded — assign one to the batch record"
                                data-testid="assign-colour-cell-button"
                              >
                                <Wine className="h-3 w-3" />Assign
                              </button>
                            )}
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
                    {/* Additive headers/cells come from the shared PRESS_ADDITIVE_COLUMNS
                        definitions (ADDITIVE_COL) — the same source the Transaction Log
                        CSV/PDF exports render from, so screen and downloads stay in sync. */}
                    <th className={`text-${ADDITIVE_COL.additive_name.align} p-2.5 font-medium`}>{ADDITIVE_COL.additive_name.pdfLabel}</th>
                    <th className={`text-${ADDITIVE_COL.dose.align} p-2.5 font-medium`}>{ADDITIVE_COL.dose.pdfLabel}</th>
                    <th className={`text-${ADDITIVE_COL.unit.align} p-2.5 font-medium`}>{ADDITIVE_COL.unit.pdfLabel}</th>
                    {EXTRA_ADDITIVE_COLUMNS.map(col => (
                      <th key={col.field} className={`text-${col.align} p-2.5 font-medium`}>{col.pdfLabel}</th>
                    ))}
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
                          <td className={`p-2.5 text-${ADDITIVE_COL.additive_name.align}`}>{ADDITIVE_COL.additive_name.pdfValue(row) || "—"}</td>
                          <td className={`p-2.5 text-${ADDITIVE_COL.dose.align} font-mono`}>{row.dose != null && row.dose !== "" ? ADDITIVE_COL.dose.pdfValue(row) : "—"}</td>
                          <td className={`p-2.5 text-${ADDITIVE_COL.unit.align} text-xs text-muted-foreground`}>{ADDITIVE_COL.unit.pdfValue(row) || "—"}</td>
                          {EXTRA_ADDITIVE_COLUMNS.map(col => (
                            <td key={col.field} className={`p-2.5 text-${col.align} text-xs text-muted-foreground`}>{col.pdfValue(row) || "—"}</td>
                          ))}
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
                          <td className="p-2.5 text-muted-foreground text-xs max-w-[7rem]">
                            <span className="truncate block" title={row.operator_name ? String(row.operator_name) : undefined}>{fmt(row.operator_name)}</span>
                          </td>
                          <td className="p-2.5 text-muted-foreground text-xs max-w-[8rem]">
                            <span className="truncate block" title={row.vessel_ref ? String(row.vessel_ref) : undefined}>{fmt(row.vessel_ref)}</span>
                          </td>
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
                <Label>Wine Colour</Label>
                <Select value={String(form.wineColour ?? "")} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Used when no downstream fermentation/cellar/bottling record carries a colour.</p>
              </div>
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
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
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
                  {/* Cell values come from the shared PRESS_ADDITIVE_COLUMNS definitions
                      (via ADDITIVE_COL), the same source the exports render from, and any
                      extra shared field is appended generically — screen and downloads
                      can no longer drift apart. */}
                  <div className="mt-1 space-y-1">
                    {(viewAdditions ?? []).map((a, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="flex gap-2 text-sm flex-wrap">
                          <span className="font-medium">{ADDITIVE_COL.additive_name.pdfValue(a) || "—"}</span>
                          {!!ADDITIVE_COL.category.pdfValue(a) && <span className="text-xs text-muted-foreground self-center">{ADDITIVE_COL.category.pdfValue(a)}</span>}
                          {(a.dose != null && a.dose !== "") && <span className="text-muted-foreground">{ADDITIVE_COL.dose.pdfValue(a)} {ADDITIVE_COL.unit.pdfValue(a)}</span>}
                          {!!(a.notes) && <span className="text-xs text-muted-foreground">— {ADDITIVE_COL.notes.pdfValue(a)}</span>}
                        </div>
                        {EXTRA_ADDITIVE_COLUMNS.map(col => (
                          <p key={col.field} className="text-xs text-muted-foreground">
                            <span className="uppercase tracking-wide font-semibold" style={{ fontSize: "10px" }}>{col.pdfLabel}:</span> {col.pdfValue(a) || "—"}
                          </p>
                        ))}
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
      {assignColourRecords && (
        <AssignWineColourDialog
          farmId={farmId}
          records={assignColourRecords}
          onClose={() => setAssignColourRecords(null)}
        />
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
