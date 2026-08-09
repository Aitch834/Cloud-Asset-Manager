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
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge, Link, Unlink, ArrowLeftRight,
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
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printDiseaseScouting, useFarmMeta, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type Scouting = Record<string, unknown>;

export function ScoutingTab({ farmId, blocks, highlightBlockId, requestBulkLink, onNavigate }: { farmId: number; blocks: Record<string, unknown>[]; highlightBlockId?: number; requestBulkLink?: boolean; onNavigate?: (tab: string, blockId?: number) => void }) {
  const { data, isLoading, add, edit, remove } = useCrud<Scouting>(farmId, "vineyard-scouting", "vineyard-scouting");
  const { displayName } = useUserRole();
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Scouting | null>(null);
  const [form, setForm] = useState<Scouting>({});
  const [viewing, setViewing] = useState<Scouting | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Scouting | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-scouting", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [blockFilter, setBlockFilter] = usePersistedFilter({ page: "viticulture-scouting", filter: "block", farmId, defaultValue: highlightBlockId ? String(highlightBlockId) : "__all__" });
  const [searchText, setSearchText] = usePersistedFilter({ page: "viticulture-scouting", filter: "search", farmId, defaultValue: "" });
  const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Record<number, number | null>>({});
  const [unlinkRecordId, setUnlinkRecordId] = useState<number | null>(null);
  const [changingBlockRecordId, setChangingBlockRecordId] = useState<number | null>(null);
  const [pendingBlockId, setPendingBlockId] = useState<number | null>(null);
  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sync block filter when navigating from a block card
  useEffect(() => {
    if (highlightBlockId) setBlockFilter(String(highlightBlockId));
  }, [highlightBlockId]);
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const openAdd = () => {
    setForm({ scoutDate: today, scoutedBy: displayName ?? "", downyMildewPressure: "0", powderyMildewPressure: "0", botrytisPressure: "0", phomopsisPressure: "0", leafhopperPressure: "0", spiderMitePressure: "0" });
    setCurrent(null);
    setOpen(true);
  };
  const openEdit = (r: Scouting) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const pressureLabel = (v: unknown) => { const p = PRESSURE_LABELS[Number(v) || 0]; return <span className={p?.color}>{p?.label ?? "—"}</span>; };
  const save = async () => {
    if (current) {
      await edit.mutateAsync({ ...form, id: current.id as number });
      setOpen(false);
    } else {
      await add.mutateAsync(form);
      setOpen(false);
      const hasHighPressure =
        Number(form.downyMildewPressure) >= 2 ||
        Number(form.powderyMildewPressure) >= 2 ||
        Number(form.botrytisPressure) >= 2 ||
        Number(form.phomopsisPressure) >= 2 ||
        Number(form.leafhopperPressure) >= 2 ||
        Number(form.spiderMitePressure) >= 2 ||
        !!form.vineWeevilSighted ||
        !!form.xylellaFastidiosa ||
        !!form.phytophthoraViticola ||
        !!form.eutypaDiebackSighted;
      if (hasHighPressure) setRaiseTaskFor(form);
    }
  };

  // ── Bulk-link ─────────────────────────────────────────────────────────────
  const unlinkedScouting = useMemo(() => data.filter(r => !r.blockId), [data]);

  const openBulkLink = () => {
    const initial: Record<number, number | null> = {};
    for (const rec of unlinkedScouting) initial[rec.id as number] = null;
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
          fetch(api(`farms/${farmId}/vineyard-scouting/${id}`), {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId }),
          }).then(r => { if (!r.ok) throw new Error("Failed to link record"); return r.json(); })
        )
      );
      return toSave.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["vineyard-scouting", farmId] });
      setBulkLinkOpen(false);
      toast({ title: `${count} ${count === 1 ? "record" : "records"} linked`, description: "Block links saved successfully." });
    },
  });

  const bulkLinkCount = Object.values(bulkLinks).filter(v => v !== null).length;

  const unlinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-scouting/${id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId: null }),
      });
      if (!r.ok) throw new Error("Failed to unlink record");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vineyard-scouting", farmId] });
      setUnlinkRecordId(null);
      toast({ title: "Block link removed", description: "The scouting record is no longer linked to a block." });
    },
  });

  // ── Change-block mutation ─────────────────────────────────────────────────────
  const changeLinkMutation = useMutation({
    mutationFn: async ({ id, blockId }: { id: number; blockId: number }) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-scouting/${id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId }),
      });
      if (!r.ok) throw new Error("Failed to change block link");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vineyard-scouting", farmId] });
      setChangingBlockRecordId(null);
      setPendingBlockId(null);
      toast({ title: "Block updated", description: "The scouting record is now linked to the selected block." });
    },
    onError: () => {
      toast({ title: "Failed to update block", variant: "destructive" });
    },
  });

  const csvCols = [
    { key: "scoutDate", label: "Scout Date", fmt: (r: Record<string, unknown>) => fmtDate(r.scoutDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "scoutedBy", label: "Scouted By" },
    { key: "downyMildewPressure", label: "Downy Mildew", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.downyMildewPressure) || 0]?.label },
    { key: "powderyMildewPressure", label: "Powdery Mildew", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.powderyMildewPressure) || 0]?.label },
    { key: "botrytisPressure", label: "Botrytis", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.botrytisPressure) || 0]?.label },
    { key: "phomopsisPressure", label: "Phomopsis", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.phomopsisPressure) || 0]?.label },
    { key: "leafhopperPressure", label: "Leafhopper", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.leafhopperPressure) || 0]?.label },
    { key: "spiderMitePressure", label: "Spider Mite", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.spiderMitePressure) || 0]?.label },
    { key: "vineWeevilSighted", label: "Vine Weevil", fmt: (r: Record<string, unknown>) => r.vineWeevilSighted ? "Yes" : "No" },
    { key: "eutypaDiebackSighted", label: "Eutypa Dieback", fmt: (r: Record<string, unknown>) => r.eutypaDiebackSighted ? "Yes" : "No" },
    { key: "xylellaFastidiosa", label: "Xylella", fmt: (r: Record<string, unknown>) => r.xylellaFastidiosa ? "ALERT" : "No" },
    { key: "phytophthoraViticola", label: "Phytophthora viticola", fmt: (r: Record<string, unknown>) => r.phytophthoraViticola ? "ALERT" : "No" },
    { key: "nextScoutDate", label: "Next Scout Date", fmt: (r: Record<string, unknown>) => fmtDate(r.nextScoutDate) },
    { key: "actionTaken", label: "Action Taken" },
    { key: "notes", label: "Notes" },
  ];

  const scoutingYears = Array.from(new Set(data.map(r => new Date(r.scoutDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!scoutingYears.includes(new Date().getFullYear())) scoutingYears.unshift(new Date().getFullYear());
  const filteredScouting = useMemo(() => {
    let rows = yearFilter === "all" ? data : data.filter(r => new Date(r.scoutDate as string).getFullYear() === Number(yearFilter));
    if (blockFilter !== "__all__") rows = rows.filter(r => String(r.blockId) === blockFilter);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      rows = rows.filter(r => {
        const block = blocks.find(b => b.id === r.blockId);
        const blockNameStr = String(block?.blockName ?? "").toLowerCase();
        const variety = String(block?.variety ?? "").toLowerCase();
        const scout = String(r.scoutedBy ?? "").toLowerCase();
        return blockNameStr.includes(q) || variety.includes(q) || scout.includes(q);
      });
    }
    return rows;
  }, [data, yearFilter, blockFilter, searchText, blocks]);
  const highlightedBlockName = highlightBlockId ? String(blocks.find(b => b.id === highlightBlockId)?.blockName ?? highlightBlockId) : null;

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  const xylellaRows = data.filter(r => r.xylellaFastidiosa);

  return (
    <div className="space-y-4">
      {xylellaRows.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Xylella fastidiosa — Notifiable Organism</p>
            <p className="text-xs text-red-700 mt-0.5">{xylellaRows.length} scouting record(s) have flagged possible Xylella. This is a regulated plant pest (Regulation EU 2016/2031 retained in UK law). Report immediately to APHA via the online plant health portal or call 0300 1000 313.</p>
          </div>
        </div>
      )}
      {/* Block highlight banner */}
      {highlightBlockId && blockFilter === String(highlightBlockId) && highlightedBlockName && (
        <div className="flex items-center gap-2.5 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
          <Bug className="w-4 h-4 shrink-0 text-purple-600" />
          <span>Showing scouting records for <span className="font-semibold">{highlightedBlockName}</span></span>
          <button type="button" className="ml-auto text-xs underline underline-offset-2 hover:text-purple-900" onClick={() => setBlockFilter("__all__")}>Show all blocks</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Disease & Pest Scouting</p>
          <p className="text-xs text-muted-foreground">Regular scouting records demonstrate due diligence for plant health and inform spray timing decisions.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {unlinkedScouting.length > 0 && (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={openBulkLink}>
              <Link className="w-4 h-4 mr-1" />Link unlinked records ({unlinkedScouting.length})
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
              <SelectItem value="all">All years</SelectItem>
              {scoutingYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => { const uc = filteredScouting.filter(r => !r.blockId).length; exportCSV(filteredScouting, "vineyard-scouting.csv", csvCols, uc > 0 ? `"WARNING: ${uc} record${uc === 1 ? "" : "s"} not linked to a block — block-level totals may be incomplete"` : undefined); }} disabled={!filteredScouting.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => { if (filteredScouting.some(r => !r.blockId)) { setPrintConfirmOpen(true); } else { void printDiseaseScouting(filteredScouting, farmName, farmId, blocks, farmMeta); } }} disabled={!filteredScouting.length}><Printer className="w-4 h-4 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Scouting Record</Button>
        </div>
      </div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search block, variety or scout…"
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
      </div>
      <DataTable
        cols={[
          { key: "scoutDate", label: "Date", render: r => fmtDate(r.scoutDate) },
          {
            key: "blockId", label: "Block",
            render: r => {
              const recordId = r.id as number;
              const linked = blocks.find(b => b.id === r.blockId);

              // ── Inline "change block" select mode ──────────────────────────
              if (changingBlockRecordId === recordId) {
                return (
                  <div className="flex items-center gap-1.5 flex-wrap min-w-[180px]" onClick={e => e.stopPropagation()}>
                    <Select
                      value={pendingBlockId !== null ? String(pendingBlockId) : "__none__"}
                      onValueChange={v => setPendingBlockId(v === "__none__" ? null : Number(v))}
                    >
                      <SelectTrigger className="h-7 text-xs w-40">
                        <SelectValue placeholder="Pick a block…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" disabled>Pick a block…</SelectItem>
                        {blocks
                          .filter(b => b.id !== r.blockId)
                          .map(b => (
                            <SelectItem key={String(b.id)} value={String(b.id)}>
                              {String(b.blockName)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      disabled={pendingBlockId === null || changeLinkMutation.isPending}
                      className="rounded px-2 py-0.5 text-xs bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        if (pendingBlockId !== null)
                          changeLinkMutation.mutate({ id: recordId, blockId: pendingBlockId });
                      }}
                    >
                      {changeLinkMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                    </button>
                    <button
                      type="button"
                      className="rounded px-2 py-0.5 text-xs border border-border text-muted-foreground hover:bg-muted transition-colors"
                      onClick={() => { setChangingBlockRecordId(null); setPendingBlockId(null); }}
                    >
                      Cancel
                    </button>
                  </div>
                );
              }

              if (linked) return (
                <span className="inline-flex items-center gap-1.5 group">
                  <span className="text-sm">{String(linked.blockName)}</span>
                  <button
                    type="button"
                    title="Change block link"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded p-0.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={e => { e.stopPropagation(); setChangingBlockRecordId(recordId); setPendingBlockId(null); }}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
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
          { key: "scoutedBy", label: "Scout" },
          { key: "downyMildewPressure", label: "Downy", render: r => pressureLabel(r.downyMildewPressure) },
          { key: "powderyMildewPressure", label: "Powdery", render: r => pressureLabel(r.powderyMildewPressure) },
          { key: "botrytisPressure", label: "Botrytis", render: r => pressureLabel(r.botrytisPressure) },
          { key: "vineWeevilSighted", label: "Vine Weevil", render: r => r.vineWeevilSighted ? <Badge variant="destructive">Yes</Badge> : <span className="text-muted-foreground">No</span> },
          { key: "xylellaFastidiosa", label: "Xylella", render: r => r.xylellaFastidiosa ? <Badge className="bg-red-700 text-white hover:bg-red-700">ALERT</Badge> : <span className="text-muted-foreground">No</span> },
        ]}
        rows={filteredScouting}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Disease Scouting Record</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="Scout Date" value={fmtDate(viewing.scoutDate)} />
                <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
                <ViewField label="Scouted By" value={fmt(viewing.scoutedBy)} />
                <ViewField label="Next Scout Date" value={fmtDate(viewing.nextScoutDate)} />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t pt-2">Disease Pressure</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(["downyMildewPressure", "powderyMildewPressure", "botrytisPressure", "phomopsisPressure"] as const).map(k => {
                  const labels: Record<string, string> = { downyMildewPressure: "Downy Mildew", powderyMildewPressure: "Powdery Mildew", botrytisPressure: "Botrytis", phomopsisPressure: "Phomopsis" };
                  return <ViewField key={k} label={labels[k]} value={pressureLabel(viewing[k])} />;
                })}
                {(["leafhopperPressure", "spiderMitePressure"] as const).map(k => {
                  const labels: Record<string, string> = { leafhopperPressure: "Leafhopper", spiderMitePressure: "Spider Mite" };
                  return <ViewField key={k} label={labels[k]} value={pressureLabel(viewing[k])} />;
                })}
                <ViewField label="Vine Weevil Sighted" value={!!viewing.vineWeevilSighted ? <Badge variant="destructive">Yes</Badge> : "No"} />
                <ViewField label="Eutypa Dieback" value={!!viewing.eutypaDiebackSighted ? <Badge variant="destructive">Yes</Badge> : "No"} />
              </div>
              {(!!viewing.xylellaFastidiosa || !!viewing.phytophthoraViticola) && (
                <div className="border border-red-200 rounded bg-red-50 p-2 space-y-1">
                  <p className="text-xs font-semibold text-red-800 uppercase">Notifiable Organisms</p>
                  {!!viewing.xylellaFastidiosa && <p className="text-xs text-red-700">⚠ Xylella fastidiosa suspected</p>}
                  {!!viewing.phytophthoraViticola && <p className="text-xs text-red-700">⚠ Phytophthora viticola suspected</p>}
                </div>
              )}
              {!!viewing.actionTaken && <div className="col-span-2"><ViewField label="Action Taken" value={fmt(viewing.actionTaken)} /></div>}
              {!!viewing.notes && <ViewField label="Notes" value={fmt(viewing.notes)} />}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            {onNavigate && (
              <>
                <Button
                  variant="outline"
                  className="text-orange-700 border-orange-200 hover:bg-orange-50"
                  onClick={() => { onNavigate("operations", viewing?.blockId as number | undefined); setViewing(null); }}
                >
                  <Wrench className="w-4 h-4 mr-1" />Operations
                </Button>
                <Button
                  variant="outline"
                  className="text-purple-700 border-purple-200 hover:bg-purple-50"
                  onClick={() => { onNavigate("harvest", viewing?.blockId as number | undefined); setViewing(null); }}
                >
                  <Grape className="w-4 h-4 mr-1" />Harvest
                </Button>
              </>
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
          defaultTitle={`Disease Scouting — ${fmt(blockName(raiseTaskFor.blockId))} · ${fmtDate(raiseTaskFor.scoutDate)}`}
          defaultDescription={`Downy: ${PRESSURE_LABELS[Number(raiseTaskFor.downyMildewPressure) || 0]?.label} · Powdery: ${PRESSURE_LABELS[Number(raiseTaskFor.powderyMildewPressure) || 0]?.label} · Botrytis: ${PRESSURE_LABELS[Number(raiseTaskFor.botrytisPressure) || 0]?.label}${raiseTaskFor.xylellaFastidiosa ? " · ⚠ XYLELLA SUSPECTED" : ""}`}
          module="Viticulture"
        />
      )}

      {/* Unlink confirm */}
      <ConfirmDialog
        open={unlinkRecordId !== null}
        title="Remove block link?"
        message="This scouting record will no longer be linked to its block. You can re-link it at any time from the edit form or the bulk-link tool."
        confirmLabel="Unlink"
        confirmVariant="destructive"
        onConfirm={() => unlinkMutation.mutate(unlinkRecordId!)}
        onCancel={() => { setUnlinkRecordId(null); unlinkMutation.reset(); }}
        mutation={unlinkMutation}
      />

      {/* Print pre-flight confirm */}
      {(() => {
        const unlinkedInView = filteredScouting.filter(r => !r.blockId);
        return (
          <Dialog open={printConfirmOpen} onOpenChange={o => { if (!o) setPrintConfirmOpen(false); }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  {unlinkedInView.length} {unlinkedInView.length === 1 ? "record isn't" : "records aren't"} linked to a block
                </DialogTitle>
                <DialogDescription>
                  {unlinkedInView.length === 1 ? "This record" : "These records"} will appear without a block name in the printed report. Link {unlinkedInView.length === 1 ? "it" : "them"} first, or print anyway.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => { setPrintConfirmOpen(false); openBulkLink(); }}>
                  <Link className="w-4 h-4 mr-1" />Link first
                </Button>
                <Button onClick={() => { setPrintConfirmOpen(false); void printDiseaseScouting(filteredScouting, farmName, farmId, blocks, farmMeta); }}>
                  <Printer className="w-4 h-4 mr-1" />Print anyway
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Bulk-link Dialog */}
      <Dialog open={bulkLinkOpen} onOpenChange={o => { if (!o) { setBulkLinkOpen(false); bulkLinkMutation.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link unlinked scouting records to blocks</DialogTitle>
            <DialogDescription>
              Assign each unlinked record to a vineyard block. Records already linked to a block are not shown.
            </DialogDescription>
          </DialogHeader>
          {unlinkedScouting.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All scouting records are already linked to blocks.</p>
          ) : (
            <div className="space-y-1 mt-1">
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 px-1 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
                <span>Scout Date</span>
                <span>Scouted By</span>
                <span>Link to block</span>
              </div>
              {unlinkedScouting.map(rec => {
                const recId = rec.id as number;
                const selectedBlockId = bulkLinks[recId] ?? null;
                return (
                  <div key={recId} className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 items-center px-1 py-1.5 rounded hover:bg-muted/30">
                    <span className="text-sm truncate">{fmtDate(rec.scoutDate)}</span>
                    <span className="text-sm text-muted-foreground truncate">{String(rec.scoutedBy ?? "—")}</span>
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
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Scouting Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Scout Date *</Label><Input type="date" max={today} value={String(form.scoutDate ?? "")} onChange={e => sf("scoutDate", e.target.value)} /></div>
              <div><Label>Block</Label>
                <Select value={form.blockId ? String(form.blockId) : "__all__"} onValueChange={v => sf("blockId", v === "__all__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="All blocks…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Scouted By</Label><StaffSelect value={String(form.scoutedBy ?? "")} onChange={v => sf("scoutedBy", v)} staffNames={staffNames} loading={staffLoading} /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disease Pressure (0 = None → 3 = High)</p>
            <div className="grid grid-cols-2 gap-3">
              {(["downyMildewPressure", "powderyMildewPressure", "botrytisPressure", "phomopsisPressure"] as const).map(k => {
                const labels: Record<string, string> = { downyMildewPressure: "Downy Mildew", powderyMildewPressure: "Powdery Mildew", botrytisPressure: "Botrytis", phomopsisPressure: "Phomopsis" };
                return (
                  <div key={k}>
                    <Label>{labels[k]}</Label>
                    <Select value={String(form[k] ?? "0")} onValueChange={v => sf(k, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n} — {PRESSURE_LABELS[n]?.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pest Pressure</p>
            <div className="grid grid-cols-2 gap-3">
              {(["leafhopperPressure", "spiderMitePressure"] as const).map(k => {
                const labels: Record<string, string> = { leafhopperPressure: "Leafhopper", spiderMitePressure: "Spider Mite" };
                return (
                  <div key={k}>
                    <Label>{labels[k]}</Label>
                    <Select value={String(form[k] ?? "0")} onValueChange={v => sf(k, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n} — {PRESSURE_LABELS[n]?.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2"><Checkbox checked={!!form.vineWeevilSighted} onCheckedChange={v => sf("vineWeevilSighted", !!v)} id="vw" /><Label htmlFor="vw">Vine Weevil sighted</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.eutypaDiebackSighted} onCheckedChange={v => sf("eutypaDiebackSighted", !!v)} id="ed" /><Label htmlFor="ed">Eutypa dieback sighted</Label></div>
            </div>
            <div className="border border-red-200 rounded-lg p-3 bg-red-50 space-y-2">
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Notifiable Organisms — Report to APHA if suspected</p>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.xylellaFastidiosa} onCheckedChange={v => sf("xylellaFastidiosa", !!v)} id="xy" /><Label htmlFor="xy" className="text-red-900">Xylella fastidiosa suspected</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.phytophthoraViticola} onCheckedChange={v => sf("phytophthoraViticola", !!v)} id="pv" /><Label htmlFor="pv" className="text-red-900">Phytophthora viticola suspected</Label></div>
            </div>
            <div><Label>Action Taken</Label><Textarea value={String(form.actionTaken ?? "")} onChange={e => sf("actionTaken", e.target.value)} rows={2} placeholder="Describe any action taken…" /></div>
            <div><Label>Next Scout Date</Label><Input type="date" min={today} value={String(form.nextScoutDate ?? "")} onChange={e => sf("nextScoutDate", e.target.value)} /></div>
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

// ─── Winery: Wine Production (shared with Organic Viticulture) ─────────────────

