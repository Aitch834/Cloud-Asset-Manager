import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge, ExternalLink, Link,
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
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printVineRegister, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, VIVC_VARIETY_MAP, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type VineReg = Record<string, unknown>;

export function VineRegisterTab({ farmId, blocks, highlightBlockId }: { farmId: number; blocks: Record<string, unknown>[]; highlightBlockId?: number }) {
  const { data, isLoading, add, edit, remove } = useCrud<VineReg>(farmId, "vine-register", "vine-register");
  const farmName = useFarmName(farmId);
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VineReg | null>(null);
  const [form, setForm] = useState<VineReg>({});
  const [viewing, setViewing] = useState<VineReg | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<VineReg | null>(null);
  const varieties = useLookupStrings("vineyard_grape_varieties", UK_GRAPE_VARIETIES);
  const [varietyOther, setVarietyOther] = useState(false);
  const [highlightDismissed, setHighlightDismissed] = useState(false);
  const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Record<number, number | null>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Reset dismiss state whenever a new block is highlighted
  useEffect(() => {
    if (highlightBlockId) setHighlightDismissed(false);
  }, [highlightBlockId]);

  const activeHighlight = highlightBlockId && !highlightDismissed;
  const highlightedBlockName = highlightBlockId ? String(blocks.find(b => b.id === highlightBlockId)?.blockName ?? highlightBlockId) : null;

  // ── Search & Filter state ─────────────────────────────────────────────────
  const [searchText, setSearchText] = useState("");

  // ── Filter & sort state (persisted per farm) ──────────────────────────────
  const STATUS_VALUES = ["", "active", "removed"] as const;
  const [filterStatusRaw, setFilterStatus] = usePersistedFilter({
    page: "vine-register", filter: "status", farmId,
    defaultValue: "", validValues: STATUS_VALUES,
  });
  const filterStatus = filterStatusRaw as "" | "active" | "removed";

  const GI_OPTIONS = ["English Wine PDO", "English Wine PGI", "Welsh Wine PDO", "Welsh Wine PGI", "UK Table Wine", "No GI"];
  const [filterGI, setFilterGI] = usePersistedFilter({
    page: "vine-register", filter: "gi", farmId,
    defaultValue: "", validValues: ["", ...GI_OPTIONS],
  });

  const COLOUR_OPTIONS = ["White", "Red", "Rosé", "Sparkling White", "Sparkling Rosé", "Sparkling Red"];
  const [filterColour, setFilterColour] = usePersistedFilter({
    page: "vine-register", filter: "colour", farmId,
    defaultValue: "", validValues: ["", ...COLOUR_OPTIONS],
  });

  const SORT_KEYS = ["", "registeredVariety", "registeredAreaHa", "dateRegistered"];
  const [sortKey, setSortKey] = usePersistedFilter({
    page: "vine-register", filter: "sort-key", farmId,
    defaultValue: "", validValues: SORT_KEYS,
  });

  const [sortDirRaw, setSortDirRaw] = usePersistedFilter({
    page: "vine-register", filter: "sort-dir", farmId,
    defaultValue: "asc", validValues: ["asc", "desc"],
  });
  const sortDir = sortDirRaw as "asc" | "desc";
  const setSortDir = (d: "asc" | "desc") => setSortDirRaw(d);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const displayRows = useMemo(() => {
    let rows = data;
    if (filterStatus === "active") rows = rows.filter(r => !r.isRemovedFromRegister);
    else if (filterStatus === "removed") rows = rows.filter(r => !!r.isRemovedFromRegister);
    if (filterGI) rows = rows.filter(r => String(r.giClassification ?? "") === filterGI);
    if (filterColour) rows = rows.filter(r => String(r.wineColour ?? "") === filterColour);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      rows = rows.filter(r =>
        String(r.registeredVariety ?? "").toLowerCase().includes(q) ||
        String(r.fsaVineRegisterRef ?? "").toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        if (sortKey === "registeredAreaHa") {
          const na = parseFloat(String(a[sortKey] ?? 0)) || 0;
          const nb = parseFloat(String(b[sortKey] ?? 0)) || 0;
          return sortDir === "asc" ? na - nb : nb - na;
        }
        if (sortKey === "dateRegistered") {
          const da = a[sortKey] ? new Date(a[sortKey] as string).getTime() : 0;
          const db = b[sortKey] ? new Date(b[sortKey] as string).getTime() : 0;
          return sortDir === "asc" ? da - db : db - da;
        }
        const sa = String(a[sortKey] ?? "").toLowerCase();
        const sb = String(b[sortKey] ?? "").toLowerCase();
        return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
    }
    return rows;
  }, [data, filterStatus, filterGI, filterColour, searchText, sortKey, sortDir]);

  const activeFilterCount = [filterStatus, filterGI, filterColour, searchText.trim()].filter(Boolean).length;

  // Fetch farm-level FSA Vine Register Ref stored in Farm Settings
  const { data: farmRecordData } = useQuery<Record<string, unknown> | null>({
    queryKey: ["farm-meta", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}`), { credentials: "include" });
      if (!r.ok) return null;
      const d = await r.json();
      return (d.record ?? d) as Record<string, unknown>;
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });
  const farmFsaVineRef = String((farmRecordData as any)?.fsaVineRegisterRef ?? "");

  const openAdd = () => {
    setForm({ fsaVineRegisterRef: farmFsaVineRef });
    setCurrent(null);
    setVarietyOther(false);
    setOpen(true);
  };
  const openEdit = (r: VineReg) => {
    setForm({ ...r, fsaVineRegisterRef: r.fsaVineRegisterRef || farmFsaVineRef });
    setCurrent(r);
    setVarietyOther(!!r.registeredVariety && !UK_GRAPE_VARIETIES.includes(String(r.registeredVariety)));
    setOpen(true);
  };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  // ── Bulk-link ─────────────────────────────────────────────────────────────
  const unlinkedEntries = useMemo(() => data.filter(r => !r.blockId), [data]);

  const suggestBlockForEntry = (entry: VineReg): number | null => {
    if (!entry.registeredVariety) return null;
    const variety = String(entry.registeredVariety).toLowerCase().trim();
    const match = blocks.find(b => b.variety && String(b.variety).toLowerCase().trim() === variety);
    return match ? Number(match.id) : null;
  };

  const openBulkLink = () => {
    const initial: Record<number, number | null> = {};
    for (const entry of unlinkedEntries) {
      initial[entry.id as number] = suggestBlockForEntry(entry);
    }
    setBulkLinks(initial);
    setBulkLinkOpen(true);
  };

  const bulkLinkMutation = useMutation({
    mutationFn: async (links: Record<number, number | null>) => {
      const toSave = Object.entries(links).filter(([, blockId]) => blockId !== null);
      if (!toSave.length) return 0;
      await Promise.all(
        toSave.map(([id, blockId]) =>
          fetch(api(`farms/${farmId}/vine-register/${id}`), {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId }),
          }).then(r => { if (!r.ok) throw new Error("Failed to link entry"); return r.json(); })
        )
      );
      return toSave.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["vine-register", farmId] });
      setBulkLinkOpen(false);
      toast({ title: `${count} ${count === 1 ? "entry" : "entries"} linked`, description: "Block links saved successfully." });
    },
  });

  const bulkLinkCount = Object.values(bulkLinks).filter(v => v !== null).length;

  const csvCols = [
    { key: "fsaVineRegisterRef", label: "FSA Ref" },
    { key: "registeredVariety", label: "Variety" },
    { key: "vivcNumber", label: "VIVC Number" },
    { key: "varietyColour", label: "Berry Colour" },
    { key: "motherVariety", label: "Mother Variety" },
    { key: "fatherVariety", label: "Father Variety" },
    { key: "registeredAreaHa", label: "Area (ha)" },
    { key: "giClassification", label: "GI Classification" },
    { key: "wineColour", label: "Wine Colour" },
    { key: "dateRegistered", label: "Date Registered", fmt: (r: Record<string, unknown>) => fmtDate(r.dateRegistered) },
    { key: "dateAmended", label: "Date Amended", fmt: (r: Record<string, unknown>) => fmtDate(r.dateAmended) },
    { key: "isRemovedFromRegister", label: "Status", fmt: (r: Record<string, unknown>) => r.isRemovedFromRegister ? "Removed" : "Active" },
    { key: "removalDate", label: "Removal Date", fmt: (r: Record<string, unknown>) => fmtDate(r.removalDate) },
    { key: "removalReason", label: "Removal Reason" },
    { key: "notes", label: "Notes" },
  ];

  // Derive selected block for area prefill — reactive to form.blockId
  const selectedBlock = form.blockId ? blocks.find(b => b.id === Number(form.blockId)) : undefined;

  // Auto-suggest a block when variety is chosen and no block is linked yet
  const suggestedBlock = useMemo(() => {
    if (form.blockId || !form.registeredVariety) return undefined;
    const variety = String(form.registeredVariety).toLowerCase().trim();
    return blocks.find(b => b.variety && String(b.variety).toLowerCase().trim() === variety);
  }, [form.registeredVariety, form.blockId, blocks]);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {/* Block highlight banner */}
      {activeHighlight && highlightedBlockName && (
        <div className="flex items-center gap-2.5 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
          <ClipboardList className="w-4 h-4 shrink-0 text-purple-600" />
          <span>Entries linked to <span className="font-semibold">{highlightedBlockName}</span> are highlighted below</span>
          <button type="button" className="ml-auto text-xs underline underline-offset-2 hover:text-purple-900" onClick={() => setHighlightDismissed(true)}>Dismiss</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">FSA Vine Register</p>
          <p className="text-xs text-muted-foreground">Mandatory for all UK vineyards over 0.01 ha. Keep this up to date and report any changes to the Food Standards Agency.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {unlinkedEntries.length > 0 && (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={openBulkLink}>
              <Link className="w-4 h-4 mr-1" />Link unlinked entries ({unlinkedEntries.length})
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => exportCSV(displayRows, "vine-register.csv", csvCols)} disabled={!displayRows.length}><FileDown className="w-4 h-4 mr-1" />Export CSV{activeFilterCount > 0 ? ` (${displayRows.length})` : ""}</Button>
          <Button size="sm" variant="outline" onClick={() => void printVineRegister(displayRows, farmName, farmFsaVineRef || undefined, farmId, blocks)} disabled={!displayRows.length}><Printer className="w-4 h-4 mr-1" />Print Register{activeFilterCount > 0 ? ` (${displayRows.length})` : ""}</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Entry</Button>
        </div>
      </div>

      {/* FSA ref missing warning */}
      {!farmFsaVineRef && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
          <span>
            <span className="font-medium">FSA Vine Register Reference not set.</span>{" "}
            Your printed register will be missing this reference.{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-amber-900 font-medium"
              onClick={() => setLocation("/settings/farm")}
            >
              Add it in Farm Settings → Viticulture Registrations
            </button>
          </span>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search variety or FSA ref…"
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

        <Select value={filterStatus || "__all__"} onValueChange={v => setFilterStatus(v === "__all__" ? "" : v as "active" | "removed")}>
          <SelectTrigger className={`h-8 text-xs w-36 ${filterStatus ? "border-primary text-primary" : ""}`}>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="removed">Removed only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterGI || "__all__"} onValueChange={v => setFilterGI(v === "__all__" ? "" : v)}>
          <SelectTrigger className={`h-8 text-xs w-44 ${filterGI ? "border-primary text-primary" : ""}`}>
            <SelectValue placeholder="All GI classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All GI classes</SelectItem>
            {GI_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterColour || "__all__"} onValueChange={v => setFilterColour(v === "__all__" ? "" : v)}>
          <SelectTrigger className={`h-8 text-xs w-40 ${filterColour ? "border-primary text-primary" : ""}`}>
            <SelectValue placeholder="All wine colours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All wine colours</SelectItem>
            {COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground"
            onClick={() => {
              // Use the hook setters (not raw state setters) so that the cleared
              // values are written back to localStorage. This ensures the filter
              // state is also reset on the next visit to the page.
              setFilterStatus(""); setFilterGI(""); setFilterColour(""); setSearchText("");
            }}>
            Clear filters ({activeFilterCount})
          </Button>
        )}

        {data.length > 0 && displayRows.length !== data.length && (
          <span className="text-xs text-muted-foreground ml-auto">Showing {displayRows.length} of {data.length}</span>
        )}
      </div>

      <DataTable
        cols={[
          { key: "fsaVineRegisterRef", label: "FSA Ref" },
          { key: "registeredVariety", label: "Variety", sortable: true },
          { key: "registeredAreaHa", label: "Area (ha)", sortable: true, render: r => fmtNum(r.registeredAreaHa, 4) },
          { key: "giClassification", label: "GI / PDO" },
          { key: "wineColour", label: "Colour" },
          { key: "dateRegistered", label: "Date Registered", sortable: true, render: r => fmtDate(r.dateRegistered) },
          { key: "isRemovedFromRegister", label: "Status", render: r => <Badge variant={r.isRemovedFromRegister ? "destructive" : "default"}>{r.isRemovedFromRegister ? "Removed" : "Active"}</Badge> },
          {
            key: "blockId",
            label: "Block",
            render: r => {
              const linked = blocks.find(b => b.id === r.blockId);
              if (linked) return <span className="text-sm">{String(linked.blockName)}</span>;
              return (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Link to show photo
                </span>
              );
            },
          },
        ]}
        rows={displayRows}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        rowClassName={activeHighlight ? r => r.blockId === highlightBlockId ? "bg-purple-50 border-l-2 border-l-purple-400" : "" : undefined}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Vine Register Entry</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="FSA Ref" value={fmt(viewing.fsaVineRegisterRef)} />
                <ViewField label="Registered Variety" value={fmt(viewing.registeredVariety)} />
              </div>
              {!!(viewing.motherVariety || viewing.fatherVariety || viewing.vivcNumber || viewing.varietyColour) && (
                <div className="rounded-md border bg-muted/30 px-3 py-2.5 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variety Pedigree</p>
                  <div className="grid grid-cols-2 gap-3">
                    {!!(viewing.motherVariety || viewing.fatherVariety) && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Parentage (VIVC nomenclature)</p>
                        <p className="text-sm font-mono">
                          {String(viewing.motherVariety || "?")}
                          <span className="text-muted-foreground mx-1.5">♀ ×</span>
                          {String(viewing.fatherVariety || "?")}
                          <span className="text-muted-foreground ml-1.5">♂</span>
                        </p>
                      </div>
                    )}
                    {!!viewing.vivcNumber && <ViewField label="VIVC Number" value={fmt(viewing.vivcNumber)} />}
                    {!!viewing.varietyColour && <ViewField label="Berry Colour" value={fmt(viewing.varietyColour)} />}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="Registered Area (ha)" value={fmtNum(viewing.registeredAreaHa, 4)} />
                <ViewField label="GI Classification" value={fmt(viewing.giClassification)} />
                <ViewField label="Wine Colour" value={fmt(viewing.wineColour)} />
                <ViewField label="Linked Block" value={fmt(blocks.find(b => b.id === viewing.blockId)?.blockName)} />
                <ViewField label="Date Registered" value={fmtDate(viewing.dateRegistered)} />
                <ViewField label="Date Amended" value={fmtDate(viewing.dateAmended)} />
                <ViewField label="Status" value={!!viewing.isRemovedFromRegister ? <Badge variant="destructive">Removed</Badge> : <Badge>Active</Badge>} />
                {!!viewing.isRemovedFromRegister && <>
                  <ViewField label="Removal Date" value={fmtDate(viewing.removalDate)} />
                  <div className="col-span-2"><ViewField label="Removal Reason" value={fmt(viewing.removalReason)} /></div>
                </>}
                {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
              </div>
            </div>
          )}
          {viewing && typeof viewing.id === "number" && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="vine-register" recordId={viewing.id} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Vine Register — ${fmt(raiseTaskFor.registeredVariety)} (${fmt(raiseTaskFor.fsaVineRegisterRef)})`}
          defaultDescription={`Area: ${fmtNum(raiseTaskFor.registeredAreaHa, 4)} ha · GI: ${fmt(raiseTaskFor.giClassification)} · Status: ${raiseTaskFor.isRemovedFromRegister ? "Removed" : "Active"}`}
          module="Viticulture"
        />
      )}

      {/* Bulk-link Dialog */}
      <Dialog open={bulkLinkOpen} onOpenChange={o => { if (!o) { setBulkLinkOpen(false); bulkLinkMutation.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link unlinked entries to blocks</DialogTitle>
            <DialogDescription>
              Assign each unlinked Vine Register entry to a vineyard block. Entries already linked to a block are not shown. Where a variety matches a block, it has been pre-selected.
            </DialogDescription>
          </DialogHeader>
          {unlinkedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All entries are already linked to blocks.</p>
          ) : (
            <div className="space-y-1 mt-1">
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 px-1 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
                <span>Variety</span>
                <span>FSA Ref</span>
                <span>Link to block</span>
              </div>
              {unlinkedEntries.map(entry => {
                const entryId = entry.id as number;
                const selectedBlockId = bulkLinks[entryId] ?? null;
                const isAutoSuggested = suggestBlockForEntry(entry) !== null && selectedBlockId === suggestBlockForEntry(entry);
                return (
                  <div key={entryId} className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 items-center px-1 py-1.5 rounded hover:bg-muted/30">
                    <span className="text-sm truncate" title={String(entry.registeredVariety ?? "")}>
                      {String(entry.registeredVariety ?? <span className="text-muted-foreground italic">Unknown</span>)}
                    </span>
                    <span className="text-sm text-muted-foreground truncate font-mono" title={String(entry.fsaVineRegisterRef ?? "")}>
                      {String(entry.fsaVineRegisterRef ?? "—")}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Select
                        value={selectedBlockId !== null ? String(selectedBlockId) : "__none__"}
                        onValueChange={v => setBulkLinks(prev => ({ ...prev, [entryId]: v === "__none__" ? null : Number(v) }))}
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
                      {isAutoSuggested && (
                        <span title="Auto-matched by variety">
                          <Grape className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        </span>
                      )}
                    </div>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vine Register Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* FSA ref — pulled from Farm Settings, read-only here */}
            <div className="rounded-md border bg-muted/40 px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">FSA Vine Register Reference</p>
                {farmFsaVineRef
                  ? <p className="font-mono text-sm font-medium">{farmFsaVineRef}</p>
                  : <p className="text-xs text-amber-600">Not set — add your reference in Farm Settings → Viticulture Registrations</p>}
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">Farm Settings</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Registered Variety *</Label>
                <Select
                  value={varietyOther ? "Other" : String(form.registeredVariety ?? "")}
                  onValueChange={v => {
                    if (v === "Other") { setVarietyOther(true); sf("registeredVariety", ""); }
                    else {
                      setVarietyOther(false);
                      sf("registeredVariety", v);
                      // Auto-fill VIVC number from the catalogue map if the field is currently empty
                      if (VIVC_VARIETY_MAP[v] && !form.vivcNumber) sf("vivcNumber", VIVC_VARIETY_MAP[v]);
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
                  <SelectContent>{varieties.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                {varietyOther && <Input className="mt-1.5" placeholder="Enter variety name…" value={String(form.registeredVariety ?? "")} onChange={e => sf("registeredVariety", e.target.value)} />}
              </div>
            </div>
            {/* Pedigree / ampelographic fields */}
            <div className="rounded-md border bg-muted/30 px-3 py-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variety Pedigree <span className="normal-case font-normal">(VIVC nomenclature — optional)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Mother Variety <span className="text-muted-foreground font-normal">(♀ seed parent)</span></Label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Input value={String(form.motherVariety ?? "")} onChange={e => sf("motherVariety", e.target.value)} placeholder="e.g. Sirius" className="flex-1" />
                    <a
                      href={`https://www.vivc.de/index.php?r=cultivarname%2Findex&ViticultivarnameSearch%5Bcultivarnameall%5D=${encodeURIComponent(String(form.motherVariety || ""))}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 shrink-0 whitespace-nowrap"
                      title="Look up on VIVC"
                    >
                      <ExternalLink className="w-3 h-3" />VIVC
                    </a>
                  </div>
                </div>
                <div>
                  <Label>Father Variety <span className="text-muted-foreground font-normal">(♂ pollen parent)</span></Label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Input value={String(form.fatherVariety ?? "")} onChange={e => sf("fatherVariety", e.target.value)} placeholder="e.g. Villard Blanc" className="flex-1" />
                    <a
                      href={`https://www.vivc.de/index.php?r=cultivarname%2Findex&ViticultivarnameSearch%5Bcultivarnameall%5D=${encodeURIComponent(String(form.fatherVariety || ""))}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 shrink-0 whitespace-nowrap"
                      title="Look up on VIVC"
                    >
                      <ExternalLink className="w-3 h-3" />VIVC
                    </a>
                  </div>
                </div>
                <div>
                  <Label>VIVC Number</Label>
                  <Input value={String(form.vivcNumber ?? "")} onChange={e => sf("vivcNumber", e.target.value)} placeholder="e.g. 4551" />
                  <p className="text-xs text-muted-foreground mt-1">Auto-filled for known varieties. Verify or look up any variety at <a href="https://www.vivc.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono">vivc.de</a></p>
                </div>
                <div>
                  <Label>Berry Colour</Label>
                  <Select value={String(form.varietyColour ?? "")} onValueChange={v => sf("varietyColour", v)}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {["White", "Black", "Grey", "Rosé/Pink", "Teinturier"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Colour of berry skin — VIVC classification</p>
                </div>
              </div>
              {!!(form.motherVariety || form.fatherVariety) && (
                <div className="rounded bg-background border px-3 py-2 text-sm font-mono text-muted-foreground">
                  {String(form.registeredVariety || "—")}
                  <span className="mx-2 text-xs">=</span>
                  {String(form.motherVariety || "?")}
                  <span className="mx-1.5">♀ ×</span>
                  {String(form.fatherVariety || "?")}
                  <span className="ml-1.5">♂</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Registered Area (ha) *</Label>
                <Input type="number" step="0.0001" value={String(form.registeredAreaHa ?? "")} onChange={e => sf("registeredAreaHa", e.target.value)} />
                {!!selectedBlock?.areaHa && (
                  <button type="button" className="text-xs text-blue-600 hover:underline mt-0.5"
                    onClick={() => sf("registeredAreaHa", String(selectedBlock!.areaHa))}>
                    Prefill from block: {fmtNum(selectedBlock!.areaHa, 4)} ha
                  </button>
                )}
              </div>
              <div>
                <Label>GI Classification</Label>
                <Select value={String(form.giClassification ?? "")} onValueChange={v => sf("giClassification", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["English Wine PDO", "English Wine PGI", "Welsh Wine PDO", "Welsh Wine PGI", "UK Table Wine", "No GI"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Wine Colour</Label>
                <Select value={String(form.wineColour ?? "")} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["White", "Red", "Rosé", "Sparkling White", "Sparkling Rosé", "Sparkling Red"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link to Block</Label>
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)} ({String(b.variety ?? "no variety")})</SelectItem>)}
                  </SelectContent>
                </Select>
                {suggestedBlock && (
                  <div className="mt-1.5 flex items-center gap-2 rounded border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs text-purple-800">
                    <Grape className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                    <span>Matches block <span className="font-semibold">{String(suggestedBlock.blockName)}</span></span>
                    <button
                      type="button"
                      className="ml-auto shrink-0 font-medium underline underline-offset-2 hover:text-purple-900"
                      onClick={() => sf("blockId", Number(suggestedBlock.id))}
                    >
                      Link it
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Linking to a block shows its photo on the printed Vine Register.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Registered</Label><Input type="date" max={today} value={String(form.dateRegistered ?? "")} onChange={e => sf("dateRegistered", e.target.value)} /></div>
              <div>
                <Label>Date Amended</Label>
                <Input type="date" max={today} value={String(form.dateAmended ?? "")} onChange={e => sf("dateAmended", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">The date this entry was amended with the RPA — not when a physical change occurred in the vineyard.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.isRemovedFromRegister} onCheckedChange={v => sf("isRemovedFromRegister", !!v)} id="rmv" />
              <Label htmlFor="rmv">Removed from register</Label>
            </div>
            {!!form.isRemovedFromRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Removal Date</Label><Input type="date" max={today} value={String(form.removalDate ?? "")} onChange={e => sf("removalDate", e.target.value)} /></div>
                <div><Label>Removal Reason</Label><Input value={String(form.removalReason ?? "")} onChange={e => sf("removalReason", e.target.value)} /></div>
              </div>
            )}
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

// ─── Blocks ────────────────────────────────────────────────────────────────────
