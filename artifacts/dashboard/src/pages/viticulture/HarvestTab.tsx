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
import { sanitiseCsvCell } from "@/lib/csv";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
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

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printHarvest, useFarmMeta, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type Harvest = Record<string, unknown>;

export function HarvestTab({ farmId, blocks, highlightBlockId, requestBulkLink }: { farmId: number; blocks: Record<string, unknown>[]; highlightBlockId?: number; requestBulkLink?: boolean }) {
  const { data, isLoading, add, edit, remove } = useCrud<Harvest>(farmId, "vineyard-harvest", "vineyard-harvest");
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Harvest | null>(null);
  const [form, setForm] = useState<Harvest>({});
  const [viewing, setViewing] = useState<Harvest | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Harvest | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-harvest", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [blockFilter, setBlockFilter] = usePersistedFilter({ page: "viticulture-harvest", filter: "block", farmId, defaultValue: highlightBlockId ? String(highlightBlockId) : "__all__" });
  const [searchText, setSearchText] = usePersistedFilter({ page: "viticulture-harvest", filter: "search", farmId, defaultValue: "" });
  const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Record<number, number | null>>({});
  const [unlinkRecordId, setUnlinkRecordId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["vineyard-harvest", farmId] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vineyard-harvest", farmId] });
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
    const summaryHeader = [summaryLabel, "Harvest Date(s)", "Total Yield (kg)", "Avg t/ha", "Avg Brix °", "Avg pH", "Avg TA (g/L)", "Avg Potential Alcohol %"].map(h => cell(h)).join(",");
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

      // header row: "Block" | vintage1 | vintage2 | … | Total
      const crossHeaderCols = [cell("Block"), ...crossVintages.map(v => cell(v)), cell("Total Yield (kg)"), cell("Avg Brix °")];
      const crossHeader = crossHeaderCols.join(",");

      // build lookup: blockId → vintageYear → rows
      const lookup: Record<string, Record<string, Record<string, unknown>[]>> = {};
      for (const r of rows) {
        const bid = String(r.blockId ?? "");
        const vy = String(r.vintageYear ?? "");
        if (!lookup[bid]) lookup[bid] = {};
        if (!lookup[bid][vy]) lookup[bid][vy] = [];
        lookup[bid][vy].push(r);
      }

      const crossRows = uniqueBlockIds.map(bid => {
        const bidStr = String(bid);
        const label = (() => { const n = Number(bidStr); return !isNaN(n) && n > 0 ? String(blockName(n)) : "—"; })();
        const vintageCells = crossVintages.map(vy => {
          const grp = lookup[bidStr]?.[vy] ?? [];
          const total = grp.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
          return cell(total > 0 ? total.toFixed(1) : "");
        });
        // row totals
        const allRows = Object.values(lookup[bidStr] ?? {}).flat();
        const rowTotal = allRows.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        const brixAll = allRows.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v));
        const avgBrixRow = brixAll.length > 0 ? brixAll.reduce((a, b) => a + b, 0) / brixAll.length : null;
        return [cell(label), ...vintageCells, cell(rowTotal > 0 ? rowTotal.toFixed(1) : ""), cell(avgBrixRow != null ? avgBrixRow.toFixed(1) : "")].join(",");
      });

      // totals footer row
      const footerCells = crossVintages.map(vy => {
        const total = rows
          .filter(r => String(r.vintageYear ?? "") === vy)
          .reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
        return cell(total > 0 ? total.toFixed(1) : "");
      });
      const grandTotal = rows.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);
      const allBrix = rows.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v));
      const grandAvgBrix = allBrix.length > 0 ? allBrix.reduce((a, b) => a + b, 0) / allBrix.length : null;
      const footer = [cell("All blocks"), ...footerCells, cell(grandTotal > 0 ? grandTotal.toFixed(1) : ""), cell(grandAvgBrix != null ? grandAvgBrix.toFixed(1) : "")].join(",");

      crossTabLines = [
        "",
        cell("Block × Vintage Cross-tab — Yield (kg)"),
        crossHeader,
        ...crossRows,
        footer,
      ];
    }

    let csv: string;
    let filename: string;

    if (mode === "summary") {
      // ── Summary-only export ──────────────────────────────────────────────
      csv = [
        cell(`Yield Summary — ${summaryLabel === "Vintage Year" ? "by Vintage Year" : "by Block"}`),
        summaryHeader,
        ...summaryRows,
        ...crossTabLines,
      ].join("\n");
      filename = "vineyard-harvest-summary.csv";
    } else {
      // ── Full export (summary + detail rows) ──────────────────────────────
      const detailHeader = csvCols.map(c => cell(c.label)).join(",");
      const detailBody = rows.map(r =>
        csvCols.map(c => {
          const raw = c.fmt ? c.fmt(r) : String(r[c.key] ?? "");
          return cell(raw);
        }).join(",")
      ).join("\n");

      csv = [
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
          <Button size="sm" variant="outline" onClick={() => void printHarvest(filteredHarvest, farmName, farmId, blocks, farmMeta)} disabled={!filteredHarvest.length}><Printer className="w-4 h-4 mr-1" />Print{searchText.trim() ? ` (${filteredHarvest.length})` : ""}</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Harvest Record</Button>
        </div>
      </div>

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
