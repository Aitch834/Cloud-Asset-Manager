import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge, Link, Unlink,
  ArrowUp, ArrowDown, ArrowUpDown,
} from "lucide-react";
import {
  ViticulturalAnalyticsTab,
  VintageSeasonReportTab,
  ViticulturalEnterpriseReport,
} from "@/components/ViticulturalReports";
import {
  HarvestReceptionTab,
  PressingRecordsTab,
  FermentationRecordsTab,
  VesselRegisterTab,
  CellarOpsTab,
  BottlingRecordsTab,
  So2TestingTab,
  EquipmentRegisterTab,
  BatchTrailQuickSearch,
  WINERY_VIEW_ADDITIONS_EVENT,
} from "@/pages/WineryManagementTabs";
import { sanitiseCsvCell, buildViticultureUnlinkedWarning } from "@/lib/csv";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { VineyardBlockBoundaryMapDialog } from "@/components/viticulture/VineyardBlockBoundaryMapDialog";
import { VineyardBlockMapTab } from "@/components/viticulture/VineyardBlockMapTab";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookupStrings } from "@/hooks/use-lookup";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";

import { useLocation } from "wouter";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printHarvest, useFarmMeta, FarmSettingsWarning, FsaCompletenessBar, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type Harvest = Record<string, unknown>;

export function HarvestTab({ farmId, blocks, highlightBlockId, requestBulkLink }: { farmId: number; blocks: Record<string, unknown>[]; highlightBlockId?: number; requestBulkLink?: boolean }) {
  const { data, isLoading, add, edit, remove } = useCrud<Harvest>(farmId, "vineyard-harvest", "vineyard-harvest");
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);
  const [, setLocation] = useLocation();
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Harvest | null>(null);
  const [form, setForm] = useState<Harvest>({});
  const [viewing, setViewing] = useState<Harvest | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Harvest | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-harvest", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [blockFilter, setBlockFilter] = usePersistedFilter({ page: "viticulture-harvest", filter: "block", farmId, defaultValue: highlightBlockId ? String(highlightBlockId) : "__all__" });
  const [searchText, setSearchText] = usePersistedFilter({ page: "viticulture-harvest", filter: "search", farmId, defaultValue: "" });
  const [yieldChartUnit, setYieldChartUnit] = usePersistedFilter({ page: "viticulture-harvest", filter: "yieldChartUnit", farmId, defaultValue: "kg" });
  const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Record<number, number | null>>({});
  const [blockSummaryOpen, setBlockSummaryOpen] = useState(true);
  const [varietySummaryOpen, setVarietySummaryOpen] = useState(true);
  const [summarySortCol, setSummarySortCol] = usePersistedFilter({ page: "viticulture-harvest", filter: "summarySortCol", farmId, defaultValue: "name" });
  const [summarySortDir, setSummarySortDir] = usePersistedFilter({ page: "viticulture-harvest", filter: "summarySortDir", farmId, defaultValue: "asc", validValues: ["asc", "desc"] as const });
  const summarySort = { col: summarySortCol, dir: summarySortDir as "asc" | "desc" };
  const setSummarySort = (v: { col: string; dir: "asc" | "desc" }) => { setSummarySortCol(v.col); setSummarySortDir(v.dir); };
  const [varietySortCol, setVarietySortCol] = usePersistedFilter({ page: "viticulture-harvest", filter: "varietySortCol", farmId, defaultValue: "variety" });
  const [varietySortDir, setVarietySortDir] = usePersistedFilter({ page: "viticulture-harvest", filter: "varietySortDir", farmId, defaultValue: "asc", validValues: ["asc", "desc"] as const });
  const varietySort = { col: varietySortCol, dir: varietySortDir as "asc" | "desc" };
  const setVarietySort = (v: { col: string; dir: "asc" | "desc" }) => { setVarietySortCol(v.col); setVarietySortDir(v.dir); };
  const [vintageSummarySortCol, setVintageSummarySortCol] = usePersistedFilter({ page: "viticulture-harvest", filter: "vintageSummarySortCol", farmId, defaultValue: "vintage" });
  const [vintageSummarySortDir, setVintageSummarySortDir] = usePersistedFilter({ page: "viticulture-harvest", filter: "vintageSummarySortDir", farmId, defaultValue: "desc", validValues: ["asc", "desc"] as const });
  const vintageSort = { col: vintageSummarySortCol, dir: vintageSummarySortDir as "asc" | "desc" };
  const setVintageSort = (v: { col: string; dir: "asc" | "desc" }) => { setVintageSummarySortCol(v.col); setVintageSummarySortDir(v.dir); };
  const [showVintageBrix, setShowVintageBrix] = usePersistedFilter({ page: "viticulture-harvest", filter: "showVintageBrix", farmId, defaultValue: "true", validValues: ["true", "false"] as const });
  const [showVintagePh, setShowVintagePh] = usePersistedFilter({ page: "viticulture-harvest", filter: "showVintagePh", farmId, defaultValue: "true", validValues: ["true", "false"] as const });
  const [showVintageTa, setShowVintageTa] = usePersistedFilter({ page: "viticulture-harvest", filter: "showVintageTa", farmId, defaultValue: "true", validValues: ["true", "false"] as const });
  const [showVintagePa, setShowVintagePa] = usePersistedFilter({ page: "viticulture-harvest", filter: "showVintagePa", farmId, defaultValue: "true", validValues: ["true", "false"] as const });
  const vintageChemCols = {
    avgBrix: showVintageBrix === "true",
    avgPh:   showVintagePh   === "true",
    avgTa:   showVintageTa   === "true",
    avgPa:   showVintagePa   === "true",
  };
  const [chemSort, setChemSort] = useState<{ col: string; dir: "asc" | "desc" } | null>(null);
  const [unlinkRecordId, setUnlinkRecordId] = useState<number | null>(null);
  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isSbiInvalid = !!farmMeta && !!String(farmMeta.sbiNumber ?? "").trim() && !/^\d{9}$/.test(String(farmMeta.sbiNumber ?? "").trim());

  // Sync block filter when navigating from a block card
  useEffect(() => {
    if (highlightBlockId) setBlockFilter(String(highlightBlockId));
  }, [highlightBlockId]);

  const { data: wineryContactsData } = useQuery<{ records: Record<string, unknown>[] }>({
    queryKey: ["vineyard-winery-contacts", farmId],
    queryFn: async () => { const r = await fetch(api(`farms/${farmId}/vineyard-harvest/winery-contacts`)); return r.json(); },
    staleTime: 60_000,
  });
  const wineryContacts = wineryContactsData?.records ?? [];
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const openAdd = () => { setForm({ harvestDate: today, vintageYear: new Date().getFullYear(), operatorName: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Harvest) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  // ── Bulk-link ─────────────────────────────────────────────────────────────
  const unlinkedHarvest = useMemo(() => data.filter(r => !r.blockId), [data]);

  const openBulkLink = () => {
    const initial: Record<number, number | null> = {};
    for (const rec of unlinkedHarvest) initial[rec.id as number] = null;
    setBulkLinks(initial);
    setBulkLinkOpen(true);
  };

  // Auto-open bulk-link dialog when navigated from Overview warning bar
  const bulkLinkPending = useRef(false);
  useEffect(() => { if (requestBulkLink) bulkLinkPending.current = true; }, [requestBulkLink]);
  useEffect(() => {
    if (bulkLinkPending.current && !isLoading) {
      bulkLinkPending.current = false;
      openBulkLink();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const bulkLinkMutation = useMutation({
    mutationFn: async (links: Record<number, number | null>) => {
      const toSave = Object.entries(links).filter(([, blockId]) => blockId !== null);
      if (!toSave.length) return 0;
      await Promise.all(
        toSave.map(([id, blockId]) =>
          fetch(api(`farms/${farmId}/vineyard-harvest/${id}`), {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId }),
          }).then(r => { if (!r.ok) throw new Error("Failed to link harvest record"); return r.json(); })
        )
      );
      return toSave.length;
    },
    onSuccess: async (count) => {
      await queryClient.refetchQueries({ queryKey: ["vineyard-harvest", farmId] });
      setBulkLinkOpen(false);
      toast({ title: `${count} harvest ${count === 1 ? "record" : "records"} linked`, description: "Block links saved successfully." });
    },
  });

  const bulkLinkCount = Object.values(bulkLinks).filter(v => v !== null).length;

  const unlinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-harvest/${id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId: null }),
      });
      if (!r.ok) throw new Error("Failed to unlink harvest record");
      return r.json();
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["vineyard-harvest", farmId] });
      setUnlinkRecordId(null);
      toast({ title: "Block link removed", description: "The harvest record is no longer linked to a block." });
    },
  });

  const harvestYears = Array.from(new Set(data.map(r => Number(r.vintageYear)))).filter(Boolean).sort((a, b) => b - a);
  if (!harvestYears.includes(new Date().getFullYear())) harvestYears.unshift(new Date().getFullYear());

  const filteredHarvest = useMemo(() => {
    let rows = yearFilter === "all" ? data : data.filter(r => String(r.vintageYear) === yearFilter);
    if (blockFilter !== "__all__") rows = rows.filter(r => String(r.blockId) === blockFilter);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      rows = rows.filter(r => {
        const block = blocks.find(b => b.id === r.blockId);
        const blockNameStr = String(block?.blockName ?? "").toLowerCase();
        const variety = String(block?.variety ?? "").toLowerCase();
        const operator = String(r.operatorName ?? "").toLowerCase();
        return blockNameStr.includes(q) || variety.includes(q) || operator.includes(q);
      });
    }
    return rows;
  }, [data, yearFilter, blockFilter, searchText, blocks]);

  const highlightedBlockName = highlightBlockId ? String(blocks.find(b => b.id === highlightBlockId)?.blockName ?? highlightBlockId) : null;

  // ── Yield by Block × Vintage chart data ───────────────────────────────────
  // X-axis = vintages (chronological), series per block (Bar + Line overlay)
  const YIELD_CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16"];
  const yieldChartData = useMemo(() => {
    if (yearFilter !== "all") return null;
    const uniqueVintages = [...new Set(filteredHarvest.map(r => String(r.vintageYear ?? "")).filter(Boolean))].sort();
    const linkedRows = filteredHarvest.filter(r => r.blockId != null && r.blockId !== "");
    const uniqueBlockIds = [...new Set(linkedRows.map(r => r.blockId))];
    if (uniqueVintages.length < 2 || uniqueBlockIds.length < 2) return null;

    // Compute per-block area lookup
    const blockAreaHa: Record<string, number> = {};
    for (const bid of uniqueBlockIds) {
      const block = blocks.find(b => b.id === bid);
      const ha = block ? parseFloat(String((block as Record<string, unknown>).areaHa ?? (block as Record<string, unknown>).area ?? "")) : NaN;
      blockAreaHa[String(bid)] = isNaN(ha) ? 0 : ha;
    }

    // One entry per vintage; blocks become the bar/line series
    const kgData = uniqueVintages.map(vy => {
      const entry: Record<string, string | number> = { vintage: vy };
      for (const bid of uniqueBlockIds) {
        const grp = filteredHarvest.filter(r => String(r.vintageYear ?? "") === vy && r.blockId === bid);
        const total = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        entry[String(blockName(bid))] = total > 0 ? parseFloat(total.toFixed(1)) : 0;
      }
      return entry;
    });
    const thaData = uniqueVintages.map(vy => {
      const entry: Record<string, string | number> = { vintage: vy };
      for (const bid of uniqueBlockIds) {
        const grp = filteredHarvest.filter(r => String(r.vintageYear ?? "") === vy && r.blockId === bid);
        const total = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        const areaHa = blockAreaHa[String(bid)] ?? 0;
        const tha = areaHa > 0 && total > 0 ? total / 1000 / areaHa : 0;
        entry[String(blockName(bid))] = tha > 0 ? parseFloat(tha.toFixed(3)) : 0;
      }
      return entry;
    });

    const blockNames = uniqueBlockIds.map(bid => String(blockName(bid)));
    // Build a name-keyed area map so the Recharts tooltip formatter (which receives the series name) can look up the area
    const blockAreaByName: Record<string, number> = {};
    for (const bid of uniqueBlockIds) {
      blockAreaByName[String(blockName(bid))] = blockAreaHa[String(bid)] ?? 0;
    }
    return { kgData, thaData, blockNames, blockAreaByName };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredHarvest, yearFilter, blocks]);

  // ── Chemistry cross-tab data (block × vintage) ────────────────────────────
  // Only computed when "All vintages" is selected and there are ≥2 vintages + ≥2 linked blocks
  const chemCrossTabData = useMemo(() => {
    if (yearFilter !== "all") return null;
    const linkedRows = filteredHarvest.filter(r => r.blockId != null && r.blockId !== "");
    const uniqueVintages = [...new Set(linkedRows.map(r => String(r.vintageYear ?? "")).filter(Boolean))].sort();
    const uniqueBlockIds = [...new Set(linkedRows.map(r => r.blockId))];
    if (uniqueVintages.length < 2 || uniqueBlockIds.length < 2) return null;

    // Build lookup: blockId → vintageYear → rows[]
    const lookup: Record<string, Record<string, Record<string, unknown>[]>> = {};
    for (const r of linkedRows) {
      const bid = String(r.blockId ?? "");
      const vy = String(r.vintageYear ?? "");
      if (!lookup[bid]) lookup[bid] = {};
      if (!lookup[bid][vy]) lookup[bid][vy] = [];
      lookup[bid][vy].push(r);
    }

    const avg = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

    type MetricDef = {
      label: string;
      key: string;
      precision: number;
      extractor: (r: Record<string, unknown>) => number | null;
    };

    const metrics: MetricDef[] = [
      { label: "Avg Brix °", key: "brix", precision: 1, extractor: r => { const v = parseFloat(String(r.brix ?? "")); return isNaN(v) ? null : v; } },
      { label: "Avg pH", key: "ph", precision: 2, extractor: r => { const v = parseFloat(String(r.ph ?? "")); return isNaN(v) ? null : v; } },
      { label: "Avg TA (g/L)", key: "ta", precision: 2, extractor: r => { const v = parseFloat(String(r.titratableAcidityGl ?? "")); return isNaN(v) ? null : v; } },
      { label: "Avg Pot. Alc %", key: "pa", precision: 2, extractor: r => { const v = parseFloat(String(r.potentialAlcohol ?? "")); return isNaN(v) ? null : v; } },
    ];

    // Pre-compute per-block, per-vintage, and grand averages for each metric
    const tables = metrics.map(m => {
      const rows = uniqueBlockIds.map(bid => {
        const bidStr = String(bid);
        const bname = String(blockName(bid));
        const vintageCells = uniqueVintages.map(vy => {
          const grp = lookup[bidStr]?.[vy] ?? [];
          const vals = grp.map(m.extractor).filter((v): v is number => v !== null);
          return avg(vals);
        });
        const vintageCounts = uniqueVintages.map(vy => (lookup[bidStr]?.[vy] ?? []).length);
        const allVals = Object.values(lookup[bidStr] ?? {}).flat().map(m.extractor).filter((v): v is number => v !== null);
        return { bname, vintageCells, vintageCounts, rowAvg: avg(allVals) };
      });

      // Compute footer averages directly from all records for that vintage (record-weighted, not block-weighted)
      const colAvgs = uniqueVintages.map(vy => {
        const vals = linkedRows
          .filter(r => String(r.vintageYear ?? "") === vy)
          .map(m.extractor)
          .filter((v): v is number => v !== null);
        return avg(vals);
      });
      const grandVals = linkedRows.map(m.extractor).filter((v): v is number => v !== null);
      const grandAvg = avg(grandVals);

      return { label: m.label, precision: m.precision, rows, colAvgs, grandAvg };
    });

    return { uniqueVintages, tables };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredHarvest, yearFilter, blocks]);

  // ── Yield by Variety summary (both views, requires ≥2 distinct linked+named varieties) ──
  const varietySummaryData = useMemo(() => {
    const avg = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    // Separate bucket for records with no usable variety (unlinked or blank variety on block)
    const UNKNOWN_KEY = "Unknown / Not linked";
    const varietyMap: Record<string, { totalKg: number; totalHa: number; blockIds: Set<unknown>; brixVals: number[]; phVals: number[]; taVals: number[]; paVals: number[] }> = {};
    for (const r of filteredHarvest) {
      const block = r.blockId != null ? blocks.find(b => String(b.id) === String(r.blockId)) : null;
      const variety = block ? String(block.variety ?? "").trim() : "";
      // Use the variety name if available; fall back to the unknown bucket
      const key = variety || UNKNOWN_KEY;
      if (!varietyMap[key]) varietyMap[key] = { totalKg: 0, totalHa: 0, blockIds: new Set(), brixVals: [], phVals: [], taVals: [], paVals: [] };
      const entry = varietyMap[key];
      entry.totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
      if (block && r.blockId != null && !entry.blockIds.has(r.blockId)) {
        entry.blockIds.add(r.blockId);
        const ha = parseFloat(String((block.areaHa ?? block.area ?? "")));
        if (!isNaN(ha) && ha > 0) entry.totalHa += ha;
      }
      const brix = parseFloat(String(r.brix ?? "")); if (!isNaN(brix)) entry.brixVals.push(brix);
      const ph = parseFloat(String(r.ph ?? "")); if (!isNaN(ph)) entry.phVals.push(ph);
      const ta = parseFloat(String(r.titratableAcidityGl ?? "")); if (!isNaN(ta)) entry.taVals.push(ta);
      const pa = parseFloat(String(r.potentialAlcohol ?? "")); if (!isNaN(pa)) entry.paVals.push(pa);
    }
    // Eligibility: count only real, named variety keys (not the unknown bucket)
    const namedVarietyKeys = Object.keys(varietyMap).filter(k => k !== UNKNOWN_KEY);
    if (namedVarietyKeys.length < 2) return null;

    const rows = Object.entries(varietyMap)
      .sort(([a], [b]) => {
        // Unknown bucket always sorts last
        if (a === UNKNOWN_KEY) return 1;
        if (b === UNKNOWN_KEY) return -1;
        return a.localeCompare(b);
      })
      .map(([variety, e]) => {
        const kgPerHa = e.totalHa > 0 && e.totalKg > 0 ? e.totalKg / e.totalHa : null;
        return {
          variety,
          areaHa: e.totalHa > 0 ? e.totalHa : null,
          totalKg: e.totalKg,
          kgPerHa,
          avgBrix: avg(e.brixVals),
          avgPh: avg(e.phVals),
          avgTa: avg(e.taVals),
          avgPa: avg(e.paVals),
        };
      });

    // Grand kg/ha: only from rows with known positive area (same-population, matching block summary)
    const rowsWithArea = rows.filter(r => r.areaHa != null && r.areaHa > 0);
    const grandHa = rowsWithArea.reduce((s, r) => s + (r.areaHa ?? 0), 0);
    const grandKgForArea = rowsWithArea.reduce((s, r) => s + r.totalKg, 0);
    const grandKgPerHa = grandHa > 0 && grandKgForArea > 0 ? grandKgForArea / grandHa : null;

    const grandKg = rows.reduce((s, r) => s + r.totalKg, 0);
    const grandAvgBrix = avg(filteredHarvest.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v)));
    const grandAvgPh = avg(filteredHarvest.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v)));
    const grandAvgTa = avg(filteredHarvest.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v)));
    const grandAvgPa = avg(filteredHarvest.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v)));
    return { rows, grandKg, grandHa, grandKgPerHa, grandAvgBrix, grandAvgPh, grandAvgTa, grandAvgPa };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredHarvest, blocks]);

  // ── KPI stat cards ────────────────────────────────────────────────────────
  const kpiStats = useMemo(() => {
    const totalKg = filteredHarvest.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
    const picksCount = filteredHarvest.length;
    // Derive t/ha from total yield ÷ total unique-linked-block area
    const seenBlockIds = new Set<unknown>();
    let totalAreaHa = 0;
    for (const r of filteredHarvest) {
      if (r.blockId != null && r.blockId !== "" && !seenBlockIds.has(r.blockId)) {
        seenBlockIds.add(r.blockId);
        const block = blocks.find(b => b.id === r.blockId);
        if (block) {
          const ha = parseFloat(String((block as Record<string, unknown>).areaHa ?? (block as Record<string, unknown>).area ?? ""));
          if (!isNaN(ha) && ha > 0) totalAreaHa += ha;
        }
      }
    }
    const derivedTha = totalAreaHa > 0 && totalKg > 0 ? totalKg / 1000 / totalAreaHa : null;
    return { totalKg, picksCount, derivedTha };
  }, [filteredHarvest, blocks]);

  const csvCols = [
    { key: "harvestDate", label: "Harvest Date", fmt: (r: Record<string, unknown>) => fmtDate(r.harvestDate) },
    { key: "vintageYear", label: "Vintage Year" },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "harvestMethod", label: "Harvest Method" },
    { key: "yieldKg", label: "Yield (kg)" },
    { key: "yieldKgPerVine", label: "kg/Vine" },
    { key: "yieldTonnesPerHa", label: "t/ha" },
    { key: "brix", label: "Brix °" },
    { key: "ph", label: "pH" },
    { key: "titratableAcidityGl", label: "TA (g/L)" },
    { key: "potentialAlcohol", label: "Potential Alcohol %" },
    { key: "grapeCondition", label: "Grape Condition" },
    { key: "botrytisPresent", label: "Botrytis Present", fmt: (r: Record<string, unknown>) => r.botrytisPresent ? "Yes" : "No" },
    { key: "botrytisPercentage", label: "Botrytis %" },
    { key: "destinationWinery", label: "Destination Winery" },
    { key: "operatorName", label: "Operator" },
    { key: "notes", label: "Notes" },
  ];

  const exportHarvestCSV = (rows: Record<string, unknown>[], mode: "full" | "summary" = "full") => {
    if (!rows.length) return;
    const cell = (v: unknown) => {
      const s = sanitiseCsvCell(v == null ? "" : String(v));
      return `"${s.replace(/"/g, '""')}"`;
    };

    // ── Build summary grouped by vintage (if multiple) or by block ───────────
    const uniqueVintages = [...new Set(rows.map(r => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse();
    const groupByVintage = uniqueVintages.length > 1;

    const groupObj: Record<string, Record<string, unknown>[]> = {};
    const groupKeys: string[] = [];
    for (const r of rows) {
      const key = groupByVintage ? String(r.vintageYear ?? "Unknown") : String(r.blockId ?? "0");
      if (!groupObj[key]) { groupObj[key] = []; groupKeys.push(key); }
      groupObj[key].push(r);
    }

    const summaryLabel = groupByVintage ? "Vintage Year" : "Block";
    const summaryHeader = [summaryLabel, "Picks", "Harvest Date(s)", "Total Yield (kg)", "Avg t/ha", "Avg Brix °", "Avg pH", "Avg TA (g/L)", "Avg Potential Alcohol %"].map(h => cell(h)).join(",");
    const summaryRows = groupKeys.map(key => {
      const grp = groupObj[key];
      const totalYieldKg = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      const brixVals = grp.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v));
      const avgBrix = brixVals.length > 0 ? brixVals.reduce((a, b) => a + b, 0) / brixVals.length : null;
      const thaVals = grp.map(r => parseFloat(String(r.yieldTonnesPerHa ?? ""))).filter(v => !isNaN(v));
      const avgTha = thaVals.length > 0 ? thaVals.reduce((a, b) => a + b, 0) / thaVals.length : null;
      const phVals = grp.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v));
      const avgPh = phVals.length > 0 ? phVals.reduce((a, b) => a + b, 0) / phVals.length : null;
      const taVals = grp.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v));
      const avgTa = taVals.length > 0 ? taVals.reduce((a, b) => a + b, 0) / taVals.length : null;
      const paVals = grp.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v));
      const avgPa = paVals.length > 0 ? paVals.reduce((a, b) => a + b, 0) / paVals.length : null;
      const sortedDates = [...new Set(
        grp.map(r => r.harvestDate ? new Date(r.harvestDate as string).toLocaleDateString("en-GB") : "").filter(Boolean)
      )];
      const dateStr = sortedDates.length === 0 ? ""
        : sortedDates.length === 1 ? sortedDates[0]
        : `${sortedDates[0]} – ${sortedDates[sortedDates.length - 1]}`;

      let label: string;
      if (groupByVintage) {
        label = key;
      } else {
        const bid = Number(key);
        label = !isNaN(bid) && bid > 0 ? String(blockName(bid)) : "—";
      }

      return [
        cell(label),
        cell(grp.length),
        cell(dateStr),
        cell(totalYieldKg > 0 ? totalYieldKg.toFixed(1) : ""),
        cell(avgTha != null ? avgTha.toFixed(2) : ""),
        cell(avgBrix != null ? avgBrix.toFixed(1) : ""),
        cell(avgPh != null ? avgPh.toFixed(2) : ""),
        cell(avgTa != null ? avgTa.toFixed(2) : ""),
        cell(avgPa != null ? avgPa.toFixed(2) : ""),
      ].join(",");
    });

    // ── Build cross-tab (block × vintage) when multiple vintages AND multiple blocks ──
    const uniqueBlockIds = [...new Set(rows.map(r => r.blockId).filter(id => id != null && id !== ""))];
    const showCrossTab = uniqueVintages.length > 1 && uniqueBlockIds.length > 1;

    let crossTabLines: string[] = [];
    if (showCrossTab) {
      // vintages across columns (ascending order for readability)
      const crossVintages = [...uniqueVintages].reverse(); // ascending (uniqueVintages is desc)

      // build lookup: blockId → vintageYear → rows
      const lookup: Record<string, Record<string, Record<string, unknown>[]>> = {};
      for (const r of rows) {
        const bid = String(r.blockId ?? "");
        const vy = String(r.vintageYear ?? "");
        if (!lookup[bid]) lookup[bid] = {};
        if (!lookup[bid][vy]) lookup[bid][vy] = [];
        lookup[bid][vy].push(r);
      }

      const blockLabel = (bid: unknown) => {
        const bidStr = String(bid);
        const n = Number(bidStr);
        return !isNaN(n) && n > 0 ? String(blockName(n)) : "—";
      };

      // ── Helper: build a chemistry sub-table ──────────────────────────────
      // extractor: rows → number[]  (the raw values to average)
      // precision: decimal places for cell values
      const chemSubTable = (
        title: string,
        avgLabel: string,
        extractor: (r: Record<string, unknown>) => number | null,
        precision: number,
      ): string[] => {
        const chemHeader = [cell("Block"), ...crossVintages.map(v => cell(v)), cell(avgLabel)].join(",");
        const chemRows = uniqueBlockIds.map(bid => {
          const bidStr = String(bid);
          const vintageCells = crossVintages.map(vy => {
            const grp = lookup[bidStr]?.[vy] ?? [];
            const vals = grp.map(extractor).filter((v): v is number => v !== null && !isNaN(v));
            const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            return cell(avg != null ? avg.toFixed(precision) : "");
          });
          const allGrp = Object.values(lookup[bidStr] ?? {}).flat();
          const allVals = allGrp.map(extractor).filter((v): v is number => v !== null && !isNaN(v));
          const rowAvg = allVals.length > 0 ? allVals.reduce((a, b) => a + b, 0) / allVals.length : null;
          return [cell(blockLabel(bid)), ...vintageCells, cell(rowAvg != null ? rowAvg.toFixed(precision) : "")].join(",");
        });
        const grandVals = rows.map(extractor).filter((v): v is number => v !== null && !isNaN(v));
        const grandAvg = grandVals.length > 0 ? grandVals.reduce((a, b) => a + b, 0) / grandVals.length : null;
        const chemFooterCells = crossVintages.map(vy => {
          const vals = rows
            .filter(r => String(r.vintageYear ?? "") === vy)
            .map(extractor)
            .filter((v): v is number => v !== null && !isNaN(v));
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          return cell(avg != null ? avg.toFixed(precision) : "");
        });
        const chemFooter = [cell("All blocks"), ...chemFooterCells, cell(grandAvg != null ? grandAvg.toFixed(precision) : "")].join(",");
        return [
          "",
          cell(title),
          chemHeader,
          ...chemRows,
          chemFooter,
        ];
      };

      // ── Yield cross-tab ──────────────────────────────────────────────────
      const yieldHeader = [cell("Block"), ...crossVintages.map(v => cell(v)), cell("Total Yield (kg)")].join(",");
      const yieldRows = uniqueBlockIds.map(bid => {
        const bidStr = String(bid);
        const vintageCells = crossVintages.map(vy => {
          const grp = lookup[bidStr]?.[vy] ?? [];
          const total = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
          return cell(total > 0 ? total.toFixed(1) : "");
        });
        const allRows = Object.values(lookup[bidStr] ?? {}).flat();
        const rowTotal = allRows.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        return [cell(blockLabel(bid)), ...vintageCells, cell(rowTotal > 0 ? rowTotal.toFixed(1) : "")].join(",");
      });
      const yieldFooterCells = crossVintages.map(vy => {
        const total = rows
          .filter(r => String(r.vintageYear ?? "") === vy)
          .reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        return cell(total > 0 ? total.toFixed(1) : "");
      });
      const grandTotal = rows.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      const yieldFooter = [cell("All blocks"), ...yieldFooterCells, cell(grandTotal > 0 ? grandTotal.toFixed(1) : "")].join(",");

      // ── Chemistry sub-tables ─────────────────────────────────────────────
      const brixTable = chemSubTable(
        "Block × Vintage Cross-tab — Avg Brix °",
        "Avg All Vintages",
        r => { const v = parseFloat(String(r.brix ?? "")); return isNaN(v) ? null : v; },
        1,
      );
      const phTable = chemSubTable(
        "Block × Vintage Cross-tab — Avg pH",
        "Avg All Vintages",
        r => { const v = parseFloat(String(r.ph ?? "")); return isNaN(v) ? null : v; },
        2,
      );
      const taTable = chemSubTable(
        "Block × Vintage Cross-tab — Avg TA (g/L)",
        "Avg All Vintages",
        r => { const v = parseFloat(String(r.titratableAcidityGl ?? "")); return isNaN(v) ? null : v; },
        2,
      );
      const paTable = chemSubTable(
        "Block × Vintage Cross-tab — Avg Potential Alcohol %",
        "Avg All Vintages",
        r => { const v = parseFloat(String(r.potentialAlcohol ?? "")); return isNaN(v) ? null : v; },
        2,
      );

      crossTabLines = [
        "",
        cell("Block × Vintage Cross-tab — Yield (kg)"),
        yieldHeader,
        ...yieldRows,
        yieldFooter,
        ...brixTable,
        ...phTable,
        ...taTable,
        ...paTable,
      ];
    }

    const _w0 = buildViticultureUnlinkedWarning(rows);
    const warningLine = _w0 ? _w0 + "\n" : "";

    // ── Build pick-count lookup per (blockId, vintageYear) ────────────────
    const pickCountMap: Record<string, number> = {};
    for (const r of rows) {
      const k = `${r.blockId ?? ""}|${r.vintageYear ?? ""}`;
      pickCountMap[k] = (pickCountMap[k] ?? 0) + 1;
    }

    // ── Low-pick warning: collect blocks/vintages with only 1 pick ────────
    const lowPickEntries = Object.entries(pickCountMap).filter(([, count]) => count === 1);
    let lowPickWarningLine = "";
    if (lowPickEntries.length > 0) {
      const descriptions = lowPickEntries.map(([k]) => {
        const [bid, vy] = k.split("|");
        const bName = (() => { const n = Number(bid); return !isNaN(n) && n > 0 ? String(blockName(n)) : null; })();
        return bName && vy ? `${bName} (${vy})` : bName ? bName : vy || "unknown";
      });
      const plural = lowPickEntries.length === 1;
      lowPickWarningLine = `"NOTE: ${lowPickEntries.length} block-vintage combination${plural ? "" : "s"} based on a single pick — yield and chemistry averages may be less representative: ${descriptions.join("; ")}"\n`;
    }

    let csv: string;
    let filename: string;

    if (mode === "summary") {
      // ── Summary-only export ──────────────────────────────────────────────
      csv = warningLine + lowPickWarningLine + [
        cell(`Yield Summary — ${summaryLabel === "Vintage Year" ? "by Vintage Year" : "by Block"}`),
        summaryHeader,
        ...summaryRows,
        ...crossTabLines,
      ].join("\n");
      filename = "vineyard-harvest-summary.csv";
    } else {
      // ── Full export (summary + detail rows) ──────────────────────────────
      // Detail header includes an extra "Picks" column (pick count for that block+vintage)
      const detailHeader = [...csvCols.map(c => cell(c.label)), cell("Picks")].join(",");
      const detailBody = rows.map(r => {
        const k = `${r.blockId ?? ""}|${r.vintageYear ?? ""}`;
        const picks = pickCountMap[k] ?? 1;
        return [
          ...csvCols.map(c => {
            const raw = c.fmt ? c.fmt(r) : String(r[c.key] ?? "");
            return cell(raw);
          }),
          cell(picks),
        ].join(",");
      }).join("\n");

      csv = warningLine + lowPickWarningLine + [
        cell(`Yield Summary — ${summaryLabel === "Vintage Year" ? "by Vintage Year" : "by Block"}`),
        summaryHeader,
        ...summaryRows,
        ...crossTabLines,
        "",
        cell("Detail Records"),
        detailHeader,
        detailBody,
      ].join("\n");
      filename = "vineyard-harvest.csv";
    }

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  const exportBlockSummaryCSV = (rows: Record<string, unknown>[]) => {
    if (!rows.length) return;
    const cell = (v: unknown) => {
      const s = sanitiseCsvCell(v == null ? "" : String(v));
      return `"${s.replace(/"/g, '""')}"`;
    };

    // Determine vintage scope label for filename / title
    const uniqueVintages = [...new Set(rows.map(r => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse();
    const vintageLabel = uniqueVintages.length === 1 ? uniqueVintages[0] : uniqueVintages.length > 1 ? `${uniqueVintages[uniqueVintages.length - 1]}–${uniqueVintages[0]}` : "all";

    // Group by blockId → compute aggregates
    const blockMap: Record<string, Record<string, unknown>[]> = {};
    for (const r of rows) {
      const key = String(r.blockId ?? "__unlinked__");
      if (!blockMap[key]) blockMap[key] = [];
      blockMap[key].push(r);
    }

    const header = [
      "Vintage", "Block", "Variety", "Area (ha)", "Picks",
      "Total Yield (kg)", "Avg t/ha", "Avg Brix °", "Avg pH", "Avg TA (g/L)", "Avg Pot. Alcohol %",
    ].map(h => cell(h)).join(",");

    const dataRows = Object.entries(blockMap).map(([key, grp]) => {
      const block = key === "__unlinked__" ? null : blocks.find(b => String(b.id) === key);
      const name = block ? String(block.blockName ?? "") : "Not linked";
      const variety = block ? String(block.variety ?? "") : "";
      const area = block ? String((block.areaHa ?? block.area ?? "")) : "";

      // Vintage column: single vintage from filter, or comma-list if multiple
      const vintagesInGrp = [...new Set(grp.map(r => String(r.vintageYear ?? "")).filter(Boolean))].sort();
      const vintageCol = vintagesInGrp.join(", ");

      const totalYieldKg = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      const avg = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      // t/ha is derived from total yield ÷ block area, NOT an average of per-pick t/ha values
      const areaHaNum = area !== "" ? parseFloat(area) : NaN;
      const derivedTha = !isNaN(areaHaNum) && areaHaNum > 0 && totalYieldKg > 0
        ? totalYieldKg / 1000 / areaHaNum
        : null;
      const avgBrix = avg(grp.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v)));
      const avgPh = avg(grp.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v)));
      const avgTa = avg(grp.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v)));
      const avgPa = avg(grp.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v)));

      return [
        cell(vintageCol),
        cell(name),
        cell(variety),
        cell(area !== "" ? parseFloat(area).toFixed(2) : ""),
        cell(grp.length),
        cell(totalYieldKg > 0 ? totalYieldKg.toFixed(1) : ""),
        cell(derivedTha != null ? derivedTha.toFixed(2) : ""),
        cell(avgBrix != null ? avgBrix.toFixed(1) : ""),
        cell(avgPh != null ? avgPh.toFixed(2) : ""),
        cell(avgTa != null ? avgTa.toFixed(2) : ""),
        cell(avgPa != null ? avgPa.toFixed(2) : ""),
      ].join(",");
    });

    const _w1 = buildViticultureUnlinkedWarning(rows);
    const warningLine = _w1 ? _w1 + "\n" : "";

    // Low-pick warning for blocks with only 1 pick
    const lowPickBlocks = Object.entries(blockMap).filter(([, grp]) => grp.length === 1);
    let lowPickWarningLine = "";
    if (lowPickBlocks.length > 0) {
      const descriptions = lowPickBlocks.map(([key]) => {
        const block = key === "__unlinked__" ? null : blocks.find(b => String(b.id) === key);
        return block ? String(block.blockName ?? key) : "Not linked";
      });
      const plural = lowPickBlocks.length === 1;
      lowPickWarningLine = `"NOTE: ${lowPickBlocks.length} block${plural ? "" : "s"} based on a single pick — averages may be less representative: ${descriptions.join("; ")}"\n`;
    }

    const csv = warningLine + lowPickWarningLine + [
      cell(`Per-Block Yield Summary — Vintage ${vintageLabel} — ${farmName ?? ""}`),
      header,
      ...dataRows,
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vineyard-block-yield-summary-${vintageLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── WineGB Harvest Yield Survey export ────────────────────────────────────
  // Aggregates harvest data by grape variety — the exact shape WineGB's annual
  // Harvest Yield Survey requests from member vineyards.
  const exportWineGBSurveyCSV = (rows: Record<string, unknown>[]) => {
    if (!rows.length) return;
    const cell = (v: unknown) => {
      const s = sanitiseCsvCell(v == null ? "" : String(v));
      return `"${s.replace(/"/g, '""')}"`;
    };
    const avg = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

    const uniqueVintages = [...new Set(rows.map(r => String(r.vintageYear ?? "")).filter(Boolean))].sort().reverse();
    const vintageLabel = uniqueVintages.length === 1 ? uniqueVintages[0]
      : uniqueVintages.length > 1 ? `${uniqueVintages[uniqueVintages.length - 1]}–${uniqueVintages[0]}`
      : "all";

    // Group records by variety (via their linked block)
    const varietyMap: Record<string, { totalKg: number; totalHa: number; blockIds: Set<unknown>; brixVals: number[]; phVals: number[]; taVals: number[]; paVals: number[] }> = {};
    for (const r of rows) {
      const block = r.blockId != null ? blocks.find(b => String(b.id) === String(r.blockId)) : null;
      const variety = block ? String(block.variety ?? "").trim() : "";
      const key = variety || "Unknown / Not linked";
      if (!varietyMap[key]) varietyMap[key] = { totalKg: 0, totalHa: 0, blockIds: new Set(), brixVals: [], phVals: [], taVals: [], paVals: [] };
      const entry = varietyMap[key];
      entry.totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
      // Accumulate area from each unique block only once per variety
      if (block && r.blockId != null && !entry.blockIds.has(r.blockId)) {
        entry.blockIds.add(r.blockId);
        const ha = parseFloat(String((block.areaHa ?? block.area ?? "")));
        if (!isNaN(ha) && ha > 0) entry.totalHa += ha;
      }
      const brix = parseFloat(String(r.brix ?? "")); if (!isNaN(brix)) entry.brixVals.push(brix);
      const ph = parseFloat(String(r.ph ?? "")); if (!isNaN(ph)) entry.phVals.push(ph);
      const ta = parseFloat(String(r.titratableAcidityGl ?? "")); if (!isNaN(ta)) entry.taVals.push(ta);
      const pa = parseFloat(String(r.potentialAlcohol ?? "")); if (!isNaN(pa)) entry.paVals.push(pa);
    }

    const header = [
      "Variety", "Area Under Vine (ha)", "Total Harvested (kg)", "Yield (kg/ha)",
      "Avg Brix °", "Avg pH", "Avg TA (g/L)", "Avg Potential Alcohol %",
    ].map(h => cell(h)).join(",");

    const dataRows = Object.entries(varietyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([variety, e]) => {
        const kgPerHa = e.totalHa > 0 && e.totalKg > 0 ? e.totalKg / e.totalHa : null;
        return [
          cell(variety),
          cell(e.totalHa > 0 ? e.totalHa.toFixed(2) : ""),
          cell(e.totalKg > 0 ? e.totalKg.toFixed(1) : ""),
          cell(kgPerHa != null ? kgPerHa.toFixed(0) : ""),
          cell(avg(e.brixVals) != null ? avg(e.brixVals)!.toFixed(1) : ""),
          cell(avg(e.phVals) != null ? avg(e.phVals)!.toFixed(2) : ""),
          cell(avg(e.taVals) != null ? avg(e.taVals)!.toFixed(2) : ""),
          cell(avg(e.paVals) != null ? avg(e.paVals)!.toFixed(1) : ""),
        ].join(",");
      });

    // Grand total footer
    const grandKg = Object.values(varietyMap).reduce((s, e) => s + e.totalKg, 0);
    const grandHa = Object.values(varietyMap).reduce((s, e) => s + e.totalHa, 0);
    const grandKgPerHa = grandHa > 0 && grandKg > 0 ? grandKg / grandHa : null;
    const footer = [
      cell("TOTAL"),
      cell(grandHa > 0 ? grandHa.toFixed(2) : ""),
      cell(grandKg > 0 ? grandKg.toFixed(1) : ""),
      cell(grandKgPerHa != null ? grandKgPerHa.toFixed(0) : ""),
      cell(""), cell(""), cell(""), cell(""),
    ].join(",");

    const _w2 = buildViticultureUnlinkedWarning(rows);
    const warningLine = _w2 ? _w2 + "\n" : "";

    const csv = warningLine + [
      cell(`WineGB Harvest Yield Survey — ${farmName ?? ""} — Vintage ${vintageLabel}`),
      cell("Submit this data at winegb.co.uk (members area → Harvest Yield Survey). Select the correct vintage year when submitting."),
      "",
      header,
      ...dataRows,
      footer,
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `winegb-harvest-survey-${vintageLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {/* Block highlight banner */}
      {highlightBlockId && blockFilter === String(highlightBlockId) && highlightedBlockName && (
        <div className="flex items-center gap-2.5 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
          <Grape className="w-4 h-4 shrink-0 text-purple-600" />
          <span>Showing harvest records for <span className="font-semibold">{highlightedBlockName}</span></span>
          <button type="button" className="ml-auto text-xs underline underline-offset-2 hover:text-purple-900" onClick={() => setBlockFilter("__all__")}>Show all blocks</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Harvest & Vintage Records</p>
          <p className="text-xs text-muted-foreground">Per-block vintage records including yield, must chemistry, and grape condition. Required for GI / PDO vintage declarations.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {unlinkedHarvest.length > 0 && (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={openBulkLink}>
              <Link className="w-4 h-4 mr-1" />Link unlinked records ({unlinkedHarvest.length})
            </Button>
          )}
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className={`w-36 h-8 text-xs ${blockFilter !== "__all__" ? "border-purple-400 text-purple-700" : ""}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All blocks</SelectItem>
              {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vintages</SelectItem>
              {harvestYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={!filteredHarvest.length}>
                <FileDown className="w-4 h-4 mr-1" />Export CSV{searchText.trim() ? ` (${filteredHarvest.length})` : ""}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportBlockSummaryCSV(filteredHarvest)}>
                <FileDown className="w-4 h-4 mr-2 text-muted-foreground" />
                Export Block Summary
                <span className="ml-2 text-xs text-muted-foreground">(one row per block)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportWineGBSurveyCSV(filteredHarvest)}>
                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                Export WineGB Harvest Survey
                <span className="ml-2 text-xs text-muted-foreground">(by variety, for annual survey)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportHarvestCSV(filteredHarvest, "summary")}>
                <FileDown className="w-4 h-4 mr-2 text-muted-foreground" />
                Export Summary
                <span className="ml-2 text-xs text-muted-foreground">(totals only)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportHarvestCSV(filteredHarvest, "full")}>
                <FileDown className="w-4 h-4 mr-2 text-muted-foreground" />
                Export Full
                <span className="ml-2 text-xs text-muted-foreground">(summary + all records)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" onClick={() => { if (isSbiInvalid || filteredHarvest.some(r => !r.blockId)) { setPrintConfirmOpen(true); } else { void printHarvest(filteredHarvest, farmName, farmId, blocks, farmMeta); } }} disabled={!filteredHarvest.length}><Printer className="w-4 h-4 mr-1" />Print{searchText.trim() ? ` (${filteredHarvest.length})` : ""}</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Harvest Record</Button>
        </div>
      </div>

      {/* Farm Settings missing / invalid field warning */}
      <FarmSettingsWarning
        missingFields={farmMeta ? [
          ...(!String(farmMeta.sbiNumber ?? "").trim()
            ? ["SBI Number"]
            : !/^\d{9}$/.test(String(farmMeta.sbiNumber ?? "").trim())
              ? ["SBI Number (invalid — must be exactly 9 digits)"]
              : []),
          ...(!String(farmMeta.address ?? "").trim() ? ["Farm address"] : []),
        ] : []}
        settingsSection="Contact & Address"
        onNavigate={() => setLocation("/settings/farm")}
      />

      {/* FSA / APPA registration pre-flight check */}
      <FsaCompletenessBar farmId={farmId} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search block, variety or operator…"
            className={`h-8 text-xs w-52 pr-6 ${searchText.trim() ? "border-primary text-primary" : ""}`}
          />
          {searchText && (
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchText("")}
              aria-label="Clear search"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {searchText.trim() && (
          <span className="text-xs text-muted-foreground">Showing {filteredHarvest.length} of {data.length}</span>
        )}
      </div>


      {/* KPI stat cards */}
      {filteredHarvest.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Total Picks"
            value={kpiStats.picksCount}
            sub={yearFilter === "all" ? "all vintages" : `vintage ${yearFilter}`}
          />
          <StatCard
            label="Total Yield"
            value={kpiStats.totalKg > 0 ? `${kpiStats.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "—"}
            sub={kpiStats.derivedTha != null ? `${kpiStats.derivedTha.toFixed(2)} t/ha` : "area needed for t/ha"}
            color="green"
          />
          <StatCard
            label="Avg Brix °"
            value={(() => {
              const vals = filteredHarvest.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v));
              if (!vals.length) return "—";
              return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
            })()}
            sub="must chemistry at harvest"
          />
        </div>
      )}

      {/* Yield by Block × Vintage chart */}
      {yieldChartData && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Yield by Block × Vintage{" "}
              <span className="font-normal text-muted-foreground">
                ({yieldChartUnit === "kg" ? "Total kg" : "t/ha"})
              </span>
            </p>
            <div className="flex items-center rounded-md border overflow-hidden text-xs">
              <button
                type="button"
                className={`px-3 py-1 transition-colors ${yieldChartUnit === "kg" ? "bg-primary text-primary-foreground font-semibold" : "bg-background text-muted-foreground hover:bg-muted"}`}
                onClick={() => setYieldChartUnit("kg")}
              >
                Total kg
              </button>
              <button
                type="button"
                className={`px-3 py-1 transition-colors border-l ${yieldChartUnit === "tha" ? "bg-primary text-primary-foreground font-semibold" : "bg-background text-muted-foreground hover:bg-muted"}`}
                onClick={() => setYieldChartUnit("tha")}
              >
                t/ha
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={yieldChartUnit === "kg" ? yieldChartData.kgData : yieldChartData.thaData}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="vintage" tick={{ fontSize: 12 }} />
              {yieldChartUnit === "kg" ? (
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}t` : String(v)}
                  unit=" kg"
                  width={64}
                />
              ) : (
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  unit=" t/ha"
                  width={72}
                />
              )}
              <Tooltip
                formatter={(v: number, name: string) => {
                  // Hide line series from tooltip (they duplicate the bar values)
                  if (name.endsWith(" trend")) return [null, null];
                  const areaHa = yieldChartData.blockAreaByName[name] ?? 0;
                  if (yieldChartUnit === "kg") {
                    const thaStr = areaHa > 0 && v > 0
                      ? ` (${(v / 1000 / areaHa).toFixed(2)} t/ha)`
                      : "";
                    return [`${v.toLocaleString()} kg${thaStr}`, name];
                  } else {
                    const kgStr = areaHa > 0 && v > 0
                      ? ` (${Math.round(v * 1000 * areaHa).toLocaleString()} kg)`
                      : "";
                    return [`${v.toFixed(2)} t/ha${kgStr}`, name];
                  }
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {yieldChartData.blockNames.map((bname, i) => {
                const color = YIELD_CHART_COLORS[i % YIELD_CHART_COLORS.length];
                return [
                  <Bar
                    key={`bar-${bname}`}
                    dataKey={bname}
                    fill={color}
                    fillOpacity={0.75}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={40}
                  />,
                  <Line
                    key={`line-${bname}`}
                    type="monotone"
                    dataKey={bname}
                    name={`${bname} trend`}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: color, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    legendType="none"
                  />,
                ];
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chemistry cross-tab: block × vintage for Brix, pH, TA, Pot. Alc */}
      {chemCrossTabData && (() => {
        const { uniqueVintages, tables } = chemCrossTabData;

        const handleChemSortCol = (col: string) => {
          setChemSort(prev =>
            prev?.col === col
              ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
              : { col, dir: "desc" }
          );
        };

        const ChemSortIcon = ({ col }: { col: string }) => {
          if (!chemSort || chemSort.col !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30 inline-block" />;
          return chemSort.dir === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-primary inline-block" />
            : <ArrowDown className="w-3 h-3 ml-1 text-primary inline-block" />;
        };

        const sortRows = (rows: typeof tables[0]["rows"], vintageIndex: number) => {
          // Default (no explicit sort): alphabetical by block name
          if (!chemSort) return [...rows].sort((a, b) => a.bname.localeCompare(b.bname));
          const d = chemSort.dir === "asc" ? 1 : -1;
          return [...rows].sort((a, b) => {
            if (chemSort.col === "name") return a.bname.localeCompare(b.bname) * d;
            let av: number | null, bv: number | null;
            if (chemSort.col === "avg") {
              av = a.rowAvg; bv = b.rowAvg;
            } else {
              av = a.vintageCells[vintageIndex]; bv = b.vintageCells[vintageIndex];
            }
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            return (av - bv) * d;
          });
        };

        return (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-muted-foreground" />
                Chemistry Cross-tab — Block × Vintage
              </p>
              {chemSort && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  onClick={() => setChemSort(null)}
                >
                  Clear sort
                </button>
              )}
            </div>
            {tables.map(tbl => {
              const vintageIndex = chemSort && chemSort.col !== "avg"
                ? uniqueVintages.indexOf(chemSort.col)
                : -1;
              const sortedRows = sortRows(tbl.rows, vintageIndex);
              const hasLowPick = tbl.rows.some(row => row.vintageCounts.some((c, vi) => c === 1 && row.vintageCells[vi] != null));
              return (
                <div key={tbl.label} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{tbl.label}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                          <th className="text-left px-3 py-1.5 font-medium">
                            <button
                              type="button"
                              className={`inline-flex items-center justify-start hover:text-foreground transition-colors ${chemSort?.col === "name" ? "text-foreground" : ""}`}
                              onClick={() => handleChemSortCol("name")}
                              title="Sort by block name"
                            >
                              Block<ChemSortIcon col="name" />
                            </button>
                          </th>
                          {uniqueVintages.map(vy => (
                            <th key={vy} className="text-right px-3 py-1.5 font-medium">
                              <button
                                type="button"
                                className={`inline-flex items-center justify-end hover:text-foreground transition-colors ${chemSort?.col === vy ? "text-foreground" : ""}`}
                                onClick={() => handleChemSortCol(vy)}
                                title={`Sort by ${vy}`}
                              >
                                {vy}<ChemSortIcon col={vy} />
                              </button>
                            </th>
                          ))}
                          <th className="text-right px-3 py-1.5 font-medium border-l">
                            <button
                              type="button"
                              className={`inline-flex items-center justify-end hover:text-foreground transition-colors ${chemSort?.col === "avg" ? "text-foreground" : ""}`}
                              onClick={() => handleChemSortCol("avg")}
                              title="Sort by row average"
                            >
                              Avg<ChemSortIcon col="avg" />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRows.map((row, ri) => (
                          <tr key={ri} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-3 py-1.5 font-medium">{row.bname}</td>
                            {row.vintageCells.map((val, vi) => {
                              const pickCount = row.vintageCounts[vi] ?? 0;
                              const lowPick = val != null && pickCount === 1;
                              return (
                                <td key={vi} className={`text-right px-3 py-1.5 tabular-nums ${chemSort?.col === uniqueVintages[vi] ? "bg-muted/30" : ""}`}>
                                  {val != null ? (
                                    <span className="inline-flex items-center justify-end gap-0.5">
                                      {val.toFixed(tbl.precision)}
                                      {lowPick && (
                                        <span
                                          className="text-amber-500 font-bold leading-none"
                                          title="Based on 1 pick — treat with caution"
                                          aria-label="Based on 1 pick"
                                        >
                                          *
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/40">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className={`text-right px-3 py-1.5 tabular-nums border-l text-muted-foreground ${chemSort?.col === "avg" ? "bg-muted/30" : ""}`}>
                              {row.rowAvg != null ? row.rowAvg.toFixed(tbl.precision) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 bg-muted/40 font-semibold text-xs">
                          <td className="px-3 py-1.5">All blocks</td>
                          {tbl.colAvgs.map((val, vi) => (
                            <td key={vi} className={`text-right px-3 py-1.5 tabular-nums ${chemSort?.col === uniqueVintages[vi] ? "bg-muted/30" : ""}`}>
                              {val != null ? val.toFixed(tbl.precision) : "—"}
                            </td>
                          ))}
                          <td className={`text-right px-3 py-1.5 tabular-nums border-l ${chemSort?.col === "avg" ? "bg-muted/30" : ""}`}>
                            {tbl.grandAvg != null ? tbl.grandAvg.toFixed(tbl.precision) : "—"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {hasLowPick && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                      <span className="font-bold">*</span> Based on 1 pick — treat with caution
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Yield summary table — grouped by vintage (all vintages) or by block (single vintage) */}
      {filteredHarvest.length > 0 && (() => {
        const avg = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        const groupByVintage = yearFilter === "all";

        if (groupByVintage) {
          // ── Group by vintage year ──────────────────────────────────────────
          const vintageMap: Record<string, Record<string, unknown>[]> = {};
          const vintageOrder: string[] = [];
          for (const r of filteredHarvest) {
            const key = String(r.vintageYear ?? "Unknown");
            if (!vintageMap[key]) { vintageMap[key] = []; vintageOrder.push(key); }
            vintageMap[key].push(r);
          }
          // Sort descending (most recent first)
          vintageOrder.sort((a, b) => Number(b) - Number(a));
          const vintageRows = vintageOrder.map(key => {
            const grp = vintageMap[key];
            const totalYieldKg = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
            const avgBrix = avg(grp.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v)));
            const avgPh = avg(grp.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v)));
            const avgTa = avg(grp.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v)));
            const avgPa = avg(grp.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v)));
            // Derive t/ha consistently: totalKg / 1000 / sum(distinct linked block areas for this vintage)
            const seenBids = new Set<unknown>();
            let vintageAreaHa = 0;
            let hasLinkedBlocksNoArea = false;
            for (const r of grp) {
              if (r.blockId != null && !seenBids.has(r.blockId)) {
                seenBids.add(r.blockId);
                const block = blocks.find(b => b.id === r.blockId);
                if (block) {
                  const ha = parseFloat(String((block as Record<string, unknown>).areaHa ?? (block as Record<string, unknown>).area ?? ""));
                  if (!isNaN(ha) && ha > 0) vintageAreaHa += ha;
                  else hasLinkedBlocksNoArea = true;
                }
              }
            }
            const derivedTha = vintageAreaHa > 0 && totalYieldKg > 0 ? totalYieldKg / 1000 / vintageAreaHa : null;
            return { vintage: key, picks: grp.length, totalYieldKg, derivedTha, avgBrix, avgPh, avgTa, avgPa, hasLinkedBlocksNoArea };
          });
          const vFooterTotalKg = vintageRows.reduce((s, r) => s + r.totalYieldKg, 0);
          const vFooterTotalPicks = vintageRows.reduce((s, r) => s + r.picks, 0);
          // Footer t/ha: grand total kg / 1000 / sum of all distinct linked block areas across all vintages
          const allSeenBids = new Set<unknown>();
          let grandAreaHa = 0;
          let vFooterResolvedNoArea = false;
          for (const r of filteredHarvest) {
            if (r.blockId != null && !allSeenBids.has(r.blockId)) {
              allSeenBids.add(r.blockId);
              const block = blocks.find(b => b.id === r.blockId);
              if (block) {
                const ha = parseFloat(String((block as Record<string, unknown>).areaHa ?? (block as Record<string, unknown>).area ?? ""));
                if (!isNaN(ha) && ha > 0) grandAreaHa += ha;
                else vFooterResolvedNoArea = true;
              }
            }
          }
          const vFooterDerivedTha = grandAreaHa > 0 && vFooterTotalKg > 0 ? vFooterTotalKg / 1000 / grandAreaHa : null;
          const vFooterHasLinkedNoArea = vFooterResolvedNoArea && grandAreaHa === 0;
          const vFooterAvgBrix = avg(filteredHarvest.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v)));
          const vFooterAvgPh = avg(filteredHarvest.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v)));
          const vFooterAvgTa = avg(filteredHarvest.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v)));
          const vFooterAvgPa = avg(filteredHarvest.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v)));
          const toggleVintageSort = (col: string) => setVintageSort(
            vintageSort.col === col
              ? { col, dir: vintageSort.dir === "asc" ? "desc" : "asc" }
              : { col, dir: "desc" }
          );
          const VintageSortIcon = ({ col }: { col: string }) => {
            if (vintageSort.col !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 shrink-0" />;
            return vintageSort.dir === "asc"
              ? <ArrowUp className="w-3 h-3 ml-1 text-primary shrink-0" />
              : <ArrowDown className="w-3 h-3 ml-1 text-primary shrink-0" />;
          };
          const sortedVintageRows = [...vintageRows].sort((a, b) => {
            const d = vintageSort.dir === "asc" ? 1 : -1;
            switch (vintageSort.col) {
              case "vintage":    return d * (Number(a.vintage) - Number(b.vintage));
              case "picks":      return d * (a.picks - b.picks);
              case "totalKg":    return d * (a.totalYieldKg - b.totalYieldKg);
              case "derivedTha": return d * ((a.derivedTha ?? (d > 0 ? Infinity : -Infinity)) - (b.derivedTha ?? (d > 0 ? Infinity : -Infinity)));
              case "avgBrix":    return d * ((a.avgBrix ?? (d > 0 ? Infinity : -Infinity)) - (b.avgBrix ?? (d > 0 ? Infinity : -Infinity)));
              case "avgPh":      return d * ((a.avgPh ?? (d > 0 ? Infinity : -Infinity)) - (b.avgPh ?? (d > 0 ? Infinity : -Infinity)));
              case "avgTa":      return d * ((a.avgTa ?? (d > 0 ? Infinity : -Infinity)) - (b.avgTa ?? (d > 0 ? Infinity : -Infinity)));
              case "avgPa":      return d * ((a.avgPa ?? (d > 0 ? Infinity : -Infinity)) - (b.avgPa ?? (d > 0 ? Infinity : -Infinity)));
              default: return 0;
            }
          });
          return (
            <div className="rounded-lg border bg-card overflow-hidden">
              <button
                type="button"
                className="w-full px-4 py-2.5 border-b bg-muted/30 flex items-center gap-1.5 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setBlockSummaryOpen(o => !o)}
                aria-expanded={blockSummaryOpen}
              >
                <Grape className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold flex-1">Yield Summary by Vintage</p>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${blockSummaryOpen ? "rotate-90" : ""}`} />
              </button>
              {blockSummaryOpen && (
                <>
                  <div className="px-4 py-2 border-b flex items-center justify-end gap-2 bg-background">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                          <Beaker className="w-3.5 h-3.5" />
                          Columns
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {([
                          { key: "avgBrix", label: "Avg Brix °",     val: showVintageBrix, set: setShowVintageBrix },
                          { key: "avgPh",   label: "Avg pH",          val: showVintagePh,   set: setShowVintagePh   },
                          { key: "avgTa",   label: "Avg TA (g/L)",    val: showVintageTa,   set: setShowVintageTa   },
                          { key: "avgPa",   label: "Avg Pot. Alc %",  val: showVintagePa,   set: setShowVintagePa   },
                        ] as { key: string; label: string; val: string; set: (v: string) => void }[]).map(({ key, label, val, set }) => (
                          <DropdownMenuItem
                            key={key}
                            onSelect={e => { e.preventDefault(); set(val === "true" ? "false" : "true"); }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox checked={val === "true"} className="pointer-events-none" />
                            <span>{label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                          {([
                            { col: "vintage",    label: "Vintage",          align: "left",  show: true },
                            { col: "picks",      label: "Picks",            align: "right", show: true },
                            { col: "totalKg",    label: "Total Yield (kg)", align: "right", show: true },
                            { col: "derivedTha", label: "Avg t/ha",         align: "right", show: true },
                            { col: "avgBrix",    label: "Avg Brix °",       align: "right", show: vintageChemCols.avgBrix },
                            { col: "avgPh",      label: "Avg pH",           align: "right", show: vintageChemCols.avgPh   },
                            { col: "avgTa",      label: "Avg TA (g/L)",     align: "right", show: vintageChemCols.avgTa   },
                            { col: "avgPa",      label: "Avg Pot. Alc %",   align: "right", show: vintageChemCols.avgPa   },
                          ] as { col: string; label: string; align: "left" | "right"; show: boolean }[]).filter(c => c.show).map(({ col, label, align }) => (
                            <th key={col} className={`${align === "left" ? "text-left px-4" : "text-right px-3"} py-2 font-medium`}>
                              <button
                                type="button"
                                onClick={() => toggleVintageSort(col)}
                                className={`inline-flex items-center gap-0.5 hover:text-foreground transition-colors ${vintageSort.col === col ? "text-foreground" : ""}`}
                              >
                                {label}<VintageSortIcon col={col} />
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedVintageRows.map((row, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-4 py-2 font-medium">{row.vintage}</td>
                            <td className="text-right px-3 py-2 tabular-nums">
                              {row.picks === 1 ? (
                                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 ring-1 ring-inset ring-amber-300" title="Only one pick recorded — low-confidence data">1 pick</span>
                              ) : row.picks <= 3 ? (
                                <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5">{row.picks} picks</span>
                              ) : (
                                <span className="text-muted-foreground">{row.picks}</span>
                              )}
                            </td>
                            <td className="text-right px-3 py-2 tabular-nums font-medium">{row.totalYieldKg > 0 ? row.totalYieldKg.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : "—"}</td>
                            <td className="text-right px-3 py-2 tabular-nums">
                              {row.derivedTha != null ? row.derivedTha.toFixed(2) : row.hasLinkedBlocksNoArea ? (
                                <span className="cursor-help border-b border-dotted border-muted-foreground/50" title="Block area not set — add it in Block Settings to see t/ha">—</span>
                              ) : "—"}
                            </td>
                            {vintageChemCols.avgBrix && <td className="text-right px-3 py-2 tabular-nums">{row.avgBrix != null ? row.avgBrix.toFixed(1) : "—"}</td>}
                            {vintageChemCols.avgPh   && <td className="text-right px-3 py-2 tabular-nums">{row.avgPh   != null ? row.avgPh.toFixed(2)   : "—"}</td>}
                            {vintageChemCols.avgTa   && <td className="text-right px-3 py-2 tabular-nums">{row.avgTa   != null ? row.avgTa.toFixed(2)   : "—"}</td>}
                            {vintageChemCols.avgPa   && <td className="text-right px-3 py-2 tabular-nums">{row.avgPa   != null ? row.avgPa.toFixed(2)   : "—"}</td>}
                          </tr>
                        ))}
                      </tbody>
                      {vintageRows.length > 1 && (
                        <tfoot>
                          <tr className="border-t-2 bg-muted/40 font-semibold">
                            <td className="px-4 py-2">Total / Average</td>
                            <td className="text-right px-3 py-2 tabular-nums">{vFooterTotalPicks}</td>
                            <td className="text-right px-3 py-2 tabular-nums">{vFooterTotalKg > 0 ? vFooterTotalKg.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : "—"}</td>
                            <td className="text-right px-3 py-2 tabular-nums">
                              {vFooterDerivedTha != null ? vFooterDerivedTha.toFixed(2) : vFooterHasLinkedNoArea ? (
                                <span className="cursor-help border-b border-dotted border-muted-foreground/50" title="Block area not set — add it in Block Settings to see t/ha">—</span>
                              ) : "—"}
                            </td>
                            {vintageChemCols.avgBrix && <td className="text-right px-3 py-2 tabular-nums">{vFooterAvgBrix != null ? vFooterAvgBrix.toFixed(1) : "—"}</td>}
                            {vintageChemCols.avgPh   && <td className="text-right px-3 py-2 tabular-nums">{vFooterAvgPh   != null ? vFooterAvgPh.toFixed(2)   : "—"}</td>}
                            {vintageChemCols.avgTa   && <td className="text-right px-3 py-2 tabular-nums">{vFooterAvgTa   != null ? vFooterAvgTa.toFixed(2)   : "—"}</td>}
                            {vintageChemCols.avgPa   && <td className="text-right px-3 py-2 tabular-nums">{vFooterAvgPa   != null ? vFooterAvgPa.toFixed(2)   : "—"}</td>}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </>
              )}
            </div>
          );
        }

        // ── Group by block (single vintage selected) ───────────────────────
        const blockMap: Record<string, Record<string, unknown>[]> = {};
        const blockOrder: string[] = [];
        for (const r of filteredHarvest) {
          const key = String(r.blockId ?? "__unlinked__");
          if (!blockMap[key]) { blockMap[key] = []; blockOrder.push(key); }
          blockMap[key].push(r);
        }
        const summaryRows = blockOrder.map(key => {
          const grp = blockMap[key];
          const block = key === "__unlinked__" ? null : blocks.find(b => String(b.id) === key);
          const name = block ? String(block.blockName ?? "") : "Not linked";
          const variety = block ? String(block.variety ?? "") : "";
          const areaRaw = block ? String((block.areaHa ?? block.area ?? "")) : "";
          const areaHaNum = areaRaw !== "" ? parseFloat(areaRaw) : NaN;
          const totalYieldKg = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
          const derivedTha = !isNaN(areaHaNum) && areaHaNum > 0 && totalYieldKg > 0
            ? totalYieldKg / 1000 / areaHaNum : null;
          const linkedButNoArea = block !== null && (isNaN(areaHaNum) || areaHaNum <= 0);
          const avgBrix = avg(grp.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v)));
          const avgPh = avg(grp.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v)));
          const avgTa = avg(grp.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v)));
          const avgPa = avg(grp.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v)));
          return { name, variety, areaHa: !isNaN(areaHaNum) ? areaHaNum : null, picks: grp.length, totalYieldKg, derivedTha, avgBrix, avgPh, avgTa, avgPa, linkedButNoArea };
        });
        // Sort rows; nulls sort last regardless of direction
        const sortedSummaryRows = [...summaryRows].sort((a, b) => {
          const d = summarySort.dir === "asc" ? 1 : -1;
          switch (summarySort.col) {
            case "name":    return d * a.name.localeCompare(b.name);
            case "variety": {
              const av = a.variety || ""; const bv = b.variety || "";
              if (!av && !bv) return 0;
              if (!av) return 1;   // empty variety always last, regardless of direction
              if (!bv) return -1;
              return d * av.localeCompare(bv);
            }
            case "areaHa":  return d * ((a.areaHa ?? (d > 0 ? Infinity : -Infinity)) - (b.areaHa ?? (d > 0 ? Infinity : -Infinity)));
            case "picks":   return d * (a.picks - b.picks);
            case "totalYieldKg": return d * (a.totalYieldKg - b.totalYieldKg);
            case "derivedTha":   return d * ((a.derivedTha ?? (d > 0 ? Infinity : -Infinity)) - (b.derivedTha ?? (d > 0 ? Infinity : -Infinity)));
            case "avgBrix": return d * ((a.avgBrix ?? (d > 0 ? Infinity : -Infinity)) - (b.avgBrix ?? (d > 0 ? Infinity : -Infinity)));
            case "avgPh":   return d * ((a.avgPh ?? (d > 0 ? Infinity : -Infinity)) - (b.avgPh ?? (d > 0 ? Infinity : -Infinity)));
            case "avgTa":   return d * ((a.avgTa ?? (d > 0 ? Infinity : -Infinity)) - (b.avgTa ?? (d > 0 ? Infinity : -Infinity)));
            case "avgPa":   return d * ((a.avgPa ?? (d > 0 ? Infinity : -Infinity)) - (b.avgPa ?? (d > 0 ? Infinity : -Infinity)));
            default: return 0;
          }
        });
        const toggleSort = (col: string) => setSummarySort(
          summarySort.col === col
            ? { col, dir: summarySort.dir === "asc" ? "desc" : "asc" }
            : { col, dir: col === "name" || col === "variety" ? "asc" : "desc" }
        );
        const SortIcon = ({ col }: { col: string }) => {
          if (summarySort.col !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 shrink-0" />;
          return summarySort.dir === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-primary shrink-0" />
            : <ArrowDown className="w-3 h-3 ml-1 text-primary shrink-0" />;
        };
        const bFooterTotalKg = summaryRows.reduce((s, r) => s + r.totalYieldKg, 0);
        const bFooterTotalPicks = summaryRows.reduce((s, r) => s + r.picks, 0);
        // Only include rows with a known positive area in the t/ha calculation so
        // the numerator (yield) and denominator (area) cover the same population.
        const rowsWithArea = summaryRows.filter(r => r.areaHa != null && r.areaHa > 0);
        const bFooterTotalArea = rowsWithArea.reduce((s, r) => s + (r.areaHa ?? 0), 0);
        const bFooterAreaYieldKg = rowsWithArea.reduce((s, r) => s + r.totalYieldKg, 0);
        const bFooterDerivedTha = bFooterTotalArea > 0 && bFooterAreaYieldKg > 0 ? bFooterAreaYieldKg / 1000 / bFooterTotalArea : null;
        const bFooterHasLinkedNoArea = bFooterDerivedTha === null && summaryRows.some(r => r.linkedButNoArea);
        const bFooterAvgBrix = avg(filteredHarvest.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v)));
        const bFooterAvgPh = avg(filteredHarvest.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v)));
        const bFooterAvgTa = avg(filteredHarvest.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v)));
        const bFooterAvgPa = avg(filteredHarvest.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v)));
        return (
          <div className="rounded-lg border bg-card overflow-hidden">
            <button
              type="button"
              className="w-full px-4 py-2.5 border-b bg-muted/30 flex items-center gap-1.5 hover:bg-muted/50 transition-colors text-left"
              onClick={() => setBlockSummaryOpen(o => !o)}
              aria-expanded={blockSummaryOpen}
            >
              <Grape className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-semibold flex-1">Per-Block Yield Summary</p>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${blockSummaryOpen ? "rotate-90" : ""}`} />
            </button>
            {blockSummaryOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                      {([
                        { col: "name",         label: "Block",            align: "left"  },
                        { col: "variety",      label: "Variety",          align: "left"  },
                        { col: "areaHa",       label: "Area (ha)",        align: "right" },
                        { col: "picks",        label: "Picks",            align: "right" },
                        { col: "totalYieldKg", label: "Total Yield (kg)", align: "right" },
                        { col: "derivedTha",   label: "t/ha",             align: "right" },
                        { col: "avgBrix",      label: "Avg Brix °",       align: "right" },
                        { col: "avgPh",        label: "Avg pH",           align: "right" },
                        { col: "avgTa",        label: "Avg TA (g/L)",     align: "right" },
                        { col: "avgPa",        label: "Avg Pot. Alc %",   align: "right" },
                      ] as { col: string; label: string; align: "left" | "right" }[]).map(({ col, label, align }) => (
                        <th
                          key={col}
                          className={`${align === "left" ? "text-left px-4" : "text-right px-3"} py-2 font-medium`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSort(col)}
                            className={`inline-flex items-center gap-0.5 hover:text-foreground transition-colors ${summarySort.col === col ? "text-foreground" : ""}`}
                          >
                            {label}<SortIcon col={col} />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSummaryRows.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2 font-medium">{row.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.variety || "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums text-muted-foreground">{row.areaHa != null ? row.areaHa.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">
                          {row.picks === 1 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 ring-1 ring-inset ring-amber-300" title="Only one pick recorded — low-confidence data">1 pick</span>
                          ) : row.picks <= 3 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5">{row.picks} picks</span>
                          ) : (
                            <span className="text-muted-foreground">{row.picks}</span>
                          )}
                        </td>
                        <td className="text-right px-3 py-2 tabular-nums font-medium">{row.totalYieldKg > 0 ? row.totalYieldKg.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">
                          {row.derivedTha != null ? row.derivedTha.toFixed(2) : row.linkedButNoArea ? (
                            <span className="cursor-help border-b border-dotted border-muted-foreground/50" title="Block area not set — add it in Block Settings to see t/ha">—</span>
                          ) : "—"}
                        </td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgBrix != null ? row.avgBrix.toFixed(1) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgPh != null ? row.avgPh.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgTa != null ? row.avgTa.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgPa != null ? row.avgPa.toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  {summaryRows.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 bg-muted/40 font-semibold">
                        <td className="px-4 py-2">Season Totals</td>
                        <td className="px-3 py-2" />
                        <td className="text-right px-3 py-2 tabular-nums">{bFooterTotalArea > 0 ? bFooterTotalArea.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{bFooterTotalPicks}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{bFooterTotalKg > 0 ? bFooterTotalKg.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">
                          {bFooterDerivedTha != null ? bFooterDerivedTha.toFixed(2) : bFooterHasLinkedNoArea ? (
                            <span className="cursor-help border-b border-dotted border-muted-foreground/50" title="Block area not set — add it in Block Settings to see t/ha">—</span>
                          ) : "—"}
                        </td>
                        <td className="text-right px-3 py-2 tabular-nums">{bFooterAvgBrix != null ? bFooterAvgBrix.toFixed(1) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{bFooterAvgPh != null ? bFooterAvgPh.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{bFooterAvgTa != null ? bFooterAvgTa.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{bFooterAvgPa != null ? bFooterAvgPa.toFixed(2) : "—"}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Yield by Variety summary — shown whenever ≥2 distinct varieties exist */}
      {varietySummaryData && (() => {
        const UNKNOWN_KEY = "Unknown / Not linked";
        const toggleVarietySort = (col: string) => setVarietySort(
          varietySort.col === col
            ? { col, dir: varietySort.dir === "asc" ? "desc" : "asc" }
            : { col, dir: col === "variety" ? "asc" : "desc" }
        );
        const VarietySortIcon = ({ col }: { col: string }) => {
          if (varietySort.col !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 shrink-0" />;
          return varietySort.dir === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-primary shrink-0" />
            : <ArrowDown className="w-3 h-3 ml-1 text-primary shrink-0" />;
        };
        const sortedVarietyRows = [...varietySummaryData.rows].sort((a, b) => {
          // Unknown bucket always last regardless of sort direction
          if (a.variety === UNKNOWN_KEY) return 1;
          if (b.variety === UNKNOWN_KEY) return -1;
          const d = varietySort.dir === "asc" ? 1 : -1;
          switch (varietySort.col) {
            case "variety":    return d * a.variety.localeCompare(b.variety);
            case "areaHa":     return d * ((a.areaHa ?? (d > 0 ? Infinity : -Infinity)) - (b.areaHa ?? (d > 0 ? Infinity : -Infinity)));
            case "totalKg":    return d * (a.totalKg - b.totalKg);
            case "kgPerHa":    return d * ((a.kgPerHa ?? (d > 0 ? Infinity : -Infinity)) - (b.kgPerHa ?? (d > 0 ? Infinity : -Infinity)));
            case "avgBrix":    return d * ((a.avgBrix ?? (d > 0 ? Infinity : -Infinity)) - (b.avgBrix ?? (d > 0 ? Infinity : -Infinity)));
            case "avgPh":      return d * ((a.avgPh ?? (d > 0 ? Infinity : -Infinity)) - (b.avgPh ?? (d > 0 ? Infinity : -Infinity)));
            case "avgTa":      return d * ((a.avgTa ?? (d > 0 ? Infinity : -Infinity)) - (b.avgTa ?? (d > 0 ? Infinity : -Infinity)));
            case "avgPa":      return d * ((a.avgPa ?? (d > 0 ? Infinity : -Infinity)) - (b.avgPa ?? (d > 0 ? Infinity : -Infinity)));
            default: return 0;
          }
        });
        return (
          <div className="rounded-lg border bg-card overflow-hidden">
            <button
              type="button"
              className="w-full px-4 py-2.5 border-b bg-muted/30 flex items-center gap-1.5 hover:bg-muted/50 transition-colors text-left"
              onClick={() => setVarietySummaryOpen(o => !o)}
              aria-expanded={varietySummaryOpen}
            >
              <Wine className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-semibold flex-1">Yield by Variety</p>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${varietySummaryOpen ? "rotate-90" : ""}`} />
            </button>
            {varietySummaryOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                      {([
                        { col: "variety",   label: "Variety",          align: "left"  },
                        { col: "areaHa",    label: "Area (ha)",        align: "right" },
                        { col: "totalKg",   label: "Total Yield (kg)", align: "right" },
                        { col: "kgPerHa",   label: "Yield (kg/ha)",    align: "right" },
                        { col: "avgBrix",   label: "Avg Brix °",       align: "right" },
                        { col: "avgPh",     label: "Avg pH",           align: "right" },
                        { col: "avgTa",     label: "Avg TA (g/L)",     align: "right" },
                        { col: "avgPa",     label: "Avg Pot. Alc %",   align: "right" },
                      ] as { col: string; label: string; align: "left" | "right" }[]).map(({ col, label, align }) => (
                        <th
                          key={col}
                          className={`${align === "left" ? "text-left px-4" : "text-right px-3"} py-2 font-medium`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleVarietySort(col)}
                            className={`inline-flex items-center gap-0.5 hover:text-foreground transition-colors ${varietySort.col === col ? "text-foreground" : ""}`}
                          >
                            {label}<VarietySortIcon col={col} />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVarietyRows.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2 font-medium">{row.variety}</td>
                        <td className="text-right px-3 py-2 tabular-nums text-muted-foreground">{row.areaHa != null ? row.areaHa.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums font-medium">{row.totalKg > 0 ? row.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.kgPerHa != null ? Math.round(row.kgPerHa).toLocaleString("en-GB") : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgBrix != null ? row.avgBrix.toFixed(1) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgPh != null ? row.avgPh.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgTa != null ? row.avgTa.toFixed(2) : "—"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{row.avgPa != null ? row.avgPa.toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-muted/40 font-semibold">
                      <td className="px-4 py-2">Total / Average</td>
                      <td className="text-right px-3 py-2 tabular-nums">{varietySummaryData.grandHa > 0 ? varietySummaryData.grandHa.toFixed(2) : "—"}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{varietySummaryData.grandKg > 0 ? varietySummaryData.grandKg.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : "—"}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{varietySummaryData.grandKgPerHa != null ? Math.round(varietySummaryData.grandKgPerHa).toLocaleString("en-GB") : "—"}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{varietySummaryData.grandAvgBrix != null ? varietySummaryData.grandAvgBrix.toFixed(1) : "—"}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{varietySummaryData.grandAvgPh != null ? varietySummaryData.grandAvgPh.toFixed(2) : "—"}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{varietySummaryData.grandAvgTa != null ? varietySummaryData.grandAvgTa.toFixed(2) : "—"}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{varietySummaryData.grandAvgPa != null ? varietySummaryData.grandAvgPa.toFixed(2) : "—"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      <DataTable
        cols={[
          { key: "harvestDate", label: "Date", render: r => fmtDate(r.harvestDate) },
          { key: "vintageYear", label: "Vintage" },
          {
            key: "blockId",
            label: "Block",
            render: r => {
              const linked = blocks.find(b => b.id === r.blockId);
              if (linked) return (
                <span className="inline-flex items-center gap-1.5 group">
                  <span className="text-sm">{String(linked.blockName)}</span>
                  <button
                    type="button"
                    title="Remove block link"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={e => { e.stopPropagation(); setUnlinkRecordId(r.id as number); }}
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
              return (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Not linked
                </span>
              );
            },
          },
          { key: "harvestMethod", label: "Method" },
          { key: "yieldKg", label: "Yield (kg)", render: r => fmtNum(r.yieldKg, 1) },
          { key: "yieldTonnesPerHa", label: "t/ha", render: r => fmtNum(r.yieldTonnesPerHa, 2) },
          { key: "brix", label: "Brix °", render: r => fmtNum(r.brix, 1) },
          { key: "ph", label: "pH", render: r => fmtNum(r.ph, 2) },
          { key: "grapeCondition", label: "Condition" },
          { key: "botrytisPresent", label: "Botrytis", render: r => r.botrytisPresent ? <Badge variant="destructive">Yes {r.botrytisPercentage ? `${r.botrytisPercentage}%` : ""}</Badge> : <span className="text-muted-foreground">No</span> },
        ]}
        rows={filteredHarvest}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Harvest Record — {fmt(viewing?.vintageYear)} Vintage</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Harvest Date" value={fmtDate(viewing.harvestDate)} />
              <ViewField label="Vintage Year" value={fmt(viewing.vintageYear)} />
              <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
              <ViewField label="Harvest Method" value={fmt(viewing.harvestMethod)} />
              <ViewField label="Total Yield (kg)" value={fmtNum(viewing.yieldKg, 1)} />
              <ViewField label="kg / Vine" value={fmtNum(viewing.yieldKgPerVine, 3)} />
              <ViewField label="t / ha" value={fmtNum(viewing.yieldTonnesPerHa, 3)} />
              <ViewField label="Grape Condition" value={fmt(viewing.grapeCondition)} />
              <ViewField label="Brix °" value={fmtNum(viewing.brix, 1)} />
              <ViewField label="pH" value={fmtNum(viewing.ph, 2)} />
              <ViewField label="TA (g/L)" value={fmtNum(viewing.titratableAcidityGl, 1)} />
              <ViewField label="Potential Alcohol %" value={fmtNum(viewing.potentialAlcohol, 1)} />
              <ViewField label="Botrytis Present" value={!!viewing.botrytisPresent ? <Badge variant="destructive">Yes {viewing.botrytisPercentage ? `— ${viewing.botrytisPercentage}%` : ""}</Badge> : "No"} />
              <ViewField label="Destination" value={
                viewing.destinationWineryType === "own-holding" ? "Own winery (on-holding)" :
                viewing.destinationWineryType === "contract-processor" ? `Contract processor: ${fmt(viewing.destinationWinery)}` :
                viewing.destinationWineryType === "grape-sale" ? `Grape sale: ${fmt(viewing.destinationWinery)}` :
                fmt(viewing.destinationWinery)
              } />
              <ViewField label="Operator" value={fmt(viewing.operatorName)} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          {viewing && typeof viewing.id === "number" && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="vineyard-harvest" recordId={viewing.id} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            {!!viewing?.blockId && (
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => { setUnlinkRecordId(viewing!.id as number); setViewing(null); }}
              >
                <Unlink className="w-4 h-4 mr-1" />Unlink Block
              </Button>
            )}
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={
            raiseTaskFor.botrytisPresent
              ? `Botrytis at Harvest — ${fmt(raiseTaskFor.vintageYear)} · ${fmt(blockName(raiseTaskFor.blockId))}`
              : `Harvest — ${fmt(raiseTaskFor.vintageYear)} · ${fmt(blockName(raiseTaskFor.blockId))}`
          }
          defaultDescription={
            raiseTaskFor.botrytisPresent
              ? `${raiseTaskFor.botrytisPercentage ? `${raiseTaskFor.botrytisPercentage}% botrytis` : "Botrytis"} recorded at harvest on ${fmtDate(raiseTaskFor.harvestDate)} — ${fmt(blockName(raiseTaskFor.blockId))} block. Actions: assess must, confirm SO₂ protocol with winemaker, verify GI / PDO eligibility before vintage declaration, notify destination winery.`
              : `Date: ${fmtDate(raiseTaskFor.harvestDate)} · Yield: ${fmtNum(raiseTaskFor.yieldKg, 1)} kg · Brix: ${fmtNum(raiseTaskFor.brix, 1)}° · Condition: ${fmt(raiseTaskFor.grapeCondition)}`
          }
          module="Viticulture"
        />
      )}

      {/* Unlink confirm */}
      <ConfirmDialog
        open={unlinkRecordId !== null}
        title="Remove block link?"
        message="This harvest record will no longer be linked to its block. You can re-link it at any time from the edit form or the bulk-link tool."
        confirmLabel="Unlink"
        confirmVariant="destructive"
        onConfirm={() => unlinkMutation.mutate(unlinkRecordId!)}
        onCancel={() => { setUnlinkRecordId(null); unlinkMutation.reset(); }}
        mutation={unlinkMutation}
      />

      {/* Print pre-flight confirm */}
      {(() => {
        const unlinkedInView = filteredHarvest.filter(r => !r.blockId);
        return (
          <Dialog open={printConfirmOpen} onOpenChange={o => { if (!o) setPrintConfirmOpen(false); }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                {isSbiInvalid ? (
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    SBI Number is invalid
                  </DialogTitle>
                ) : (
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    {unlinkedInView.length} {unlinkedInView.length === 1 ? "record isn't" : "records aren't"} linked to a block
                  </DialogTitle>
                )}
                <DialogDescription>
                  {isSbiInvalid
                    ? "The SBI Number saved in Farm Settings must be exactly 9 digits before printing. Correct it in Farm Settings, then try again."
                    : `${unlinkedInView.length === 1 ? "This record" : "These records"} will appear without a block name in the printed report. Link ${unlinkedInView.length === 1 ? "it" : "them"} first, or print anyway.`}
                </DialogDescription>
              </DialogHeader>
              {isSbiInvalid && (
                <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>SBI <span className="font-mono font-semibold">{String(farmMeta?.sbiNumber ?? "")}</span> is not valid — must be exactly 9 digits. <button type="button" className="underline underline-offset-2 hover:opacity-80 font-medium" onClick={() => { setPrintConfirmOpen(false); setLocation("/settings/farm"); }}>Fix in Farm Settings</button></span>
                </div>
              )}
              {!isSbiInvalid && <FsaCompletenessBar farmId={farmId} />}
              <DialogFooter className="gap-2 sm:gap-0">
                {!isSbiInvalid && (
                  <Button variant="outline" onClick={() => { setPrintConfirmOpen(false); openBulkLink(); }}>
                    <Link className="w-4 h-4 mr-1" />Link first
                  </Button>
                )}
                <Button variant="outline" onClick={() => setPrintConfirmOpen(false)}>
                  {isSbiInvalid ? "Close" : "Cancel"}
                </Button>
                {!isSbiInvalid && (
                  <Button onClick={() => { setPrintConfirmOpen(false); void printHarvest(filteredHarvest, farmName, farmId, blocks, farmMeta); }}>
                    <Printer className="w-4 h-4 mr-1" />Print anyway
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Bulk-link Dialog */}
      <Dialog open={bulkLinkOpen} onOpenChange={o => { if (!o) { setBulkLinkOpen(false); bulkLinkMutation.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link unlinked harvest records to blocks</DialogTitle>
            <DialogDescription>
              Assign each unlinked harvest record to a vineyard block. Records already linked to a block are not shown.
            </DialogDescription>
          </DialogHeader>
          {unlinkedHarvest.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All harvest records are already linked to blocks.</p>
          ) : (
            <div className="space-y-1 mt-1">
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 px-1 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
                <span>Vintage</span>
                <span>Harvest Date</span>
                <span>Link to block</span>
              </div>
              {unlinkedHarvest.map(rec => {
                const recId = rec.id as number;
                const selectedBlockId = bulkLinks[recId] ?? null;
                return (
                  <div key={recId} className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 items-center px-1 py-1.5 rounded hover:bg-muted/30">
                    <span className="text-sm truncate">
                      {String(rec.vintageYear ?? "—")}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {fmtDate(rec.harvestDate)}
                    </span>
                    <Select
                      value={selectedBlockId !== null ? String(selectedBlockId) : "__none__"}
                      onValueChange={v => setBulkLinks(prev => ({ ...prev, [recId]: v === "__none__" ? null : Number(v) }))}
                    >
                      <SelectTrigger className={`h-8 text-xs flex-1 min-w-0 ${selectedBlockId !== null ? "border-green-400 text-green-800 bg-green-50" : ""}`}>
                        <SelectValue placeholder="— No link —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No link —</SelectItem>
                        {blocks.map(b => (
                          <SelectItem key={String(b.id)} value={String(b.id)}>
                            {String(b.blockName)}{b.variety ? ` (${String(b.variety)})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
          <DialogMutationError mutation={bulkLinkMutation} message="Some links could not be saved. Please try again." />
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setBulkLinkOpen(false)}>Cancel</Button>
            <Button
              onClick={() => bulkLinkMutation.mutate(bulkLinks)}
              disabled={bulkLinkCount === 0 || bulkLinkMutation.isPending}
            >
              {bulkLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save {bulkLinkCount > 0 ? `${bulkLinkCount} link${bulkLinkCount === 1 ? "" : "s"}` : "links"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Harvest Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Harvest Date *</Label><Input type="date" max={today} value={String(form.harvestDate ?? "")} onChange={e => sf("harvestDate", e.target.value)} /></div>
              <div><Label>Vintage Year *</Label><Input type="number" min="1900" max={new Date().getFullYear()} value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Block</Label>
                <Select value={form.blockId ? String(form.blockId) : "__all__"} onValueChange={v => sf("blockId", v === "__all__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)} ({String(b.variety)})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Harvest Method</Label>
                <Select value={String(form.harvestMethod ?? "")} onValueChange={v => sf("harvestMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["Hand Picked", "Machine Harvested", "Selective Hand Pick", "Triage Pick"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Yield</p>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Total Yield (kg)</Label><Input type="number" step="0.1" value={String(form.yieldKg ?? "")} onChange={e => sf("yieldKg", e.target.value)} /></div>
              <div><Label>kg / Vine</Label><Input type="number" step="0.001" value={String(form.yieldKgPerVine ?? "")} onChange={e => sf("yieldKgPerVine", e.target.value)} /></div>
              <div><Label>t / ha</Label><Input type="number" step="0.001" value={String(form.yieldTonnesPerHa ?? "")} onChange={e => sf("yieldTonnesPerHa", e.target.value)} /></div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Must Chemistry</p>
            <div className="grid grid-cols-4 gap-3">
              <div><Label>Brix °</Label><Input type="number" step="0.1" value={String(form.brix ?? "")} onChange={e => sf("brix", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={e => sf("ph", e.target.value)} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => sf("titratableAcidityGl", e.target.value)} /><p className="text-xs text-muted-foreground mt-1">Lab result — can be added after harvest</p></div>
              <div><Label>Pot. Alcohol %</Label><Input type="number" step="0.1" value={String(form.potentialAlcohol ?? "")} onChange={e => sf("potentialAlcohol", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Grape Condition</Label>
                <Select value={String(form.grapeCondition ?? "")} onValueChange={v => sf("grapeCondition", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["Excellent", "Good", "Fair", "Poor"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destination Type</Label>
                <Select
                  value={String(form.destinationWineryType ?? "")}
                  onValueChange={v => {
                    sf("destinationWineryType", v);
                    if (v === "own-holding") { sf("destinationWinery", "Own winery (on-holding)"); sf("destinationWineryContactId", null); }
                    else { sf("destinationWinery", ""); sf("destinationWineryContactId", null); }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own-holding">Own winery (on-holding)</SelectItem>
                    <SelectItem value="contract-processor">Contract winery / processor</SelectItem>
                    <SelectItem value="grape-sale">Grape sale to buyer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(form.destinationWineryType === "contract-processor" || form.destinationWineryType === "grape-sale") && (
              <div>
                <Label>{form.destinationWineryType === "grape-sale" ? "Grape Buyer" : "Contract Winery"}</Label>
                <Select
                  value={form.destinationWineryContactId ? String(form.destinationWineryContactId) : ""}
                  onValueChange={v => {
                    const contact = wineryContacts.find(c => String(c.id) === v);
                    sf("destinationWineryContactId", Number(v));
                    sf("destinationWinery", contact ? String(contact.name) : "");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select from trade contacts…" /></SelectTrigger>
                  <SelectContent>
                    {wineryContacts.length === 0 && <SelectItem value="__none__" disabled>No contacts found — add them in Suppliers & Stock</SelectItem>}
                    {wineryContacts.map(c => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>
                        {String(c.name)}{c.supplierType ? ` · ${String(c.supplierType)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.botrytisPresent} onCheckedChange={v => sf("botrytisPresent", !!v)} id="bot" />
              <Label htmlFor="bot">Botrytis present at harvest</Label>
            </div>
            {!!form.botrytisPresent && (
              <>
                <div><Label>Botrytis Percentage (%)</Label><Input type="number" min="0" max="100" value={String(form.botrytisPercentage ?? "")} onChange={e => sf("botrytisPercentage", e.target.value)} /></div>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">Botrytis at harvest — please review before dispatch:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><span className="font-medium">SO₂ management:</span> botrytis-affected must requires higher initial SO₂ addition and closer monitoring throughout fermentation.</li>
                    <li><span className="font-medium">GI / PDO eligibility:</span> significant botrytis may affect vintage declaration eligibility — check your scheme rules before lodging a claim.</li>
                    <li><span className="font-medium">Notify your winemaker</span> before grape intake so they can adjust must treatment protocols accordingly.</li>
                  </ul>
                </div>
              </>
            )}
            <div><Label>Operator</Label><StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Disease Scouting ──────────────────────────────────────────────────────────
