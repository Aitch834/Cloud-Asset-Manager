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
  Camera, ChevronLeft,
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

import { useLocation } from "wouter";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printOperations, downloadVineOperationsPdf, useFarmMeta, FarmSettingsWarning, FsaCompletenessBar, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";
import { CaneWeightsSection } from "./CaneWeightsSection";

type Operation = Record<string, unknown>;

type OperationPhoto = {
  id: number;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
};

function isOperationPhoto(attachment: Record<string, unknown>): boolean {
  const mimeType = String(attachment.mimeType ?? "").toLowerCase();
  const fileName = String(attachment.fileName ?? "");
  return mimeType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
}

export function OperationsTab({ farmId, blocks, highlightBlockId, requestBulkLink }: { farmId: number; blocks: Record<string, unknown>[]; highlightBlockId?: number; requestBulkLink?: boolean }) {
  const { data, isLoading, add, edit, remove } = useCrud<Operation>(farmId, "vineyard-operations", "vineyard-operations");
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);
  const [, setLocation] = useLocation();
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Operation | null>(null);
  const [form, setForm] = useState<Operation>({});
  const [viewing, setViewing] = useState<Operation | null>(null);
  const [lightboxOperationId, setLightboxOperationId] = useState<number | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(0);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Operation | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-operations", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [blockFilter, setBlockFilter] = usePersistedFilter({ page: "viticulture-operations", filter: "block", farmId, defaultValue: highlightBlockId ? String(highlightBlockId) : "__all__" });
  const [searchText, setSearchText] = usePersistedFilter({ page: "viticulture-operations", filter: "search", farmId, defaultValue: "" });
  const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Record<number, number | null>>({});
  const [unlinkRecordId, setUnlinkRecordId] = useState<number | null>(null);
  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);
  const [printBlockFilter, setPrintBlockFilter] = usePersistedFilter({ page: "viticulture-operations", filter: "print-block", farmId, defaultValue: "__all__" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: operationPhotos = [], isLoading: operationPhotosLoading } = useQuery<OperationPhoto[]>({
    queryKey: ["vineyard-operation-photos", farmId, lightboxOperationId],
    queryFn: async () => {
      const recordTypes = ["vineyard-operation", "vineyard-operations"];
      const responses = await Promise.all(recordTypes.map(recordType =>
        fetch(api(`farms/${farmId}/record-attachments?recordType=${recordType}&recordId=${lightboxOperationId}`), { credentials: "include" })
          .then(r => { if (!r.ok) throw new Error("Failed to load operation photos"); return r.json(); })
      ));
      const uniquePhotos = new globalThis.Map<number, OperationPhoto>();
      for (const response of responses) {
        for (const attachment of (Array.isArray(response) ? response : [])) {
          if (isOperationPhoto(attachment) && typeof attachment.id === "number") {
            uniquePhotos.set(attachment.id, attachment as OperationPhoto);
          }
        }
      }
      return Array.from(uniquePhotos.values());
    },
    enabled: lightboxOperationId !== null,
    staleTime: 0,
  });
  const currentOperationPhoto = operationPhotos[lightboxPhotoIndex] ?? null;

  const isSbiInvalid = !!farmMeta && !!String(farmMeta.sbiNumber ?? "").trim() && !/^\d{9}$/.test(String(farmMeta.sbiNumber ?? "").trim());

  // Sync block filter when navigating from a block card
  useEffect(() => {
    if (highlightBlockId) setBlockFilter(String(highlightBlockId));
  }, [highlightBlockId]);
  const operationTypes = useLookupStrings("vineyard_operation_types", OPERATION_TYPES);
  const [pruningOther, setPruningOther] = useState(false);
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const openAdd = () => { setForm({ operationDate: today, operatorName: displayName ?? "" }); setCurrent(null); setPruningOther(false); setOpen(true); };
  const openEdit = (r: Operation) => {
    setForm({ ...r });
    setCurrent(r);
    setPruningOther(!!r.pruningSystem && !["Double Guyot", "Single Guyot", "Cordon Spur", "Scott Henry", "Cane Replacement", "Other"].includes(String(r.pruningSystem)));
    setOpen(true);
  };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  // ── Bulk-link ─────────────────────────────────────────────────────────────
  const unlinkedOperations = useMemo(() => data.filter(r => !r.blockId), [data]);

  const openBulkLink = () => {
    const initial: Record<number, number | null> = {};
    for (const op of unlinkedOperations) initial[op.id as number] = null;
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
          fetch(api(`farms/${farmId}/vineyard-operations/${id}`), {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId }),
          }).then(r => { if (!r.ok) throw new Error("Failed to link operation"); return r.json(); })
        )
      );
      return toSave.length;
    },
    onSuccess: async (count) => {
      await queryClient.refetchQueries({ queryKey: ["vineyard-operations", farmId] });
      setBulkLinkOpen(false);
      toast({ title: `${count} ${count === 1 ? "operation" : "operations"} linked`, description: "Block links saved successfully." });
    },
  });

  const bulkLinkCount = Object.values(bulkLinks).filter(v => v !== null).length;

  const unlinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-operations/${id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId: null }),
      });
      if (!r.ok) throw new Error("Failed to unlink operation");
      return r.json();
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["vineyard-operations", farmId] });
      setUnlinkRecordId(null);
      toast({ title: "Block link removed", description: "The operation is no longer linked to a block." });
    },
  });

  const isPruning = String(form.operationType ?? "").toLowerCase().includes("prun");

  const operationYears = Array.from(new Set(data.map(r => new Date(r.operationDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!operationYears.includes(new Date().getFullYear())) operationYears.unshift(new Date().getFullYear());

  const yearFiltered = useMemo(() => yearFilter === "all" ? data : data.filter(r => new Date(r.operationDate as string).getFullYear() === Number(yearFilter)), [data, yearFilter]);
  const printRows = useMemo(() => printBlockFilter === "__all__" ? yearFiltered : yearFiltered.filter(r => String(r.blockId) === printBlockFilter), [yearFiltered, printBlockFilter]);

  const filteredOperations = useMemo(() => {
    let rows = yearFilter === "all" ? data : data.filter(r => new Date(r.operationDate as string).getFullYear() === Number(yearFilter));
    if (blockFilter !== "__all__") rows = rows.filter(r => String(r.blockId) === blockFilter);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      rows = rows.filter(r => {
        const block = blocks.find(b => b.id === r.blockId);
        const blockNameStr = String(block?.blockName ?? "").toLowerCase();
        const variety = String(block?.variety ?? "").toLowerCase();
        const operator = String(r.operatorName ?? "").toLowerCase();
        const opType = String(r.operationType ?? "").toLowerCase();
        return blockNameStr.includes(q) || variety.includes(q) || operator.includes(q) || opType.includes(q);
      });
    }
    return rows;
  }, [data, yearFilter, blockFilter, searchText, blocks]);

  const activeFilterCount = [blockFilter !== "__all__" ? blockFilter : "", yearFilter !== String(new Date().getFullYear()) ? yearFilter : "", searchText.trim()].filter(Boolean).length;
  const highlightedBlockName = highlightBlockId ? String(blocks.find(b => b.id === highlightBlockId)?.blockName ?? highlightBlockId) : null;

  const csvCols = [
    { key: "operationDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.operationDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "blockLinked", label: "Block Linked", fmt: (r: Record<string, unknown>) => r.blockId ? "Yes" : "No" },
    { key: "operationType", label: "Operation Type" },
    { key: "pruningSystem", label: "Pruning System" },
    { key: "budsPerVineTarget", label: "Target Buds/Vine" },
    { key: "budsPerVineActual", label: "Actual Buds/Vine" },
    { key: "pruningWeightKgPerVine", label: "Pruning Wt (kg/vine)" },
    { key: "shootsRemovedPct", label: "Shoots Removed (%)" },
    { key: "leavesRemovedZone", label: "Leaves Removed Zone" },
    { key: "operatorName", label: "Operator" },
    { key: "contractorName", label: "Contractor" },
    { key: "machineUsed", label: "Machine" },
    { key: "hoursWorked", label: "Hours" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {/* Block highlight banner */}
      {highlightBlockId && blockFilter === String(highlightBlockId) && highlightedBlockName && (
        <div className="flex items-center gap-2.5 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
          <Scissors className="w-4 h-4 shrink-0 text-purple-600" />
          <span>Showing operations for <span className="font-semibold">{highlightedBlockName}</span></span>
          <button type="button" className="ml-auto text-xs underline underline-offset-2 hover:text-purple-900" onClick={() => setBlockFilter("__all__")}>Show all blocks</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Pruning & Canopy Operations</p>
          <p className="text-xs text-muted-foreground">Record all canopy management activities. Pruning records including bud counts are required for GI / PDO compliance and assurance schemes.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {unlinkedOperations.length > 0 && (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={openBulkLink}>
              <Link className="w-4 h-4 mr-1" />Link unlinked records ({unlinkedOperations.length})
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
              {operationYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => { const uc = filteredOperations.filter(r => !r.blockId).length; exportCSV(filteredOperations, "vineyard-operations.csv", csvCols, uc > 0 ? `"WARNING: ${uc} record${uc === 1 ? "" : "s"} not linked to a block — block-level totals may be incomplete"` : undefined); }} disabled={!filteredOperations.length}><FileDown className="w-4 h-4 mr-1" />Export CSV{searchText.trim() ? ` (${filteredOperations.length})` : ""}</Button>
          <Select value={printBlockFilter} onValueChange={setPrintBlockFilter}>
            <SelectTrigger className={`w-36 h-8 text-xs ${printBlockFilter !== "__all__" ? "border-blue-400 text-blue-700" : ""}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Print: all blocks</SelectItem>
              {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>Print: {String(b.blockName)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => { if (isSbiInvalid || printRows.some(r => !r.blockId)) { setPrintConfirmOpen(true); } else { void printOperations(printRows, farmName, farmId, blocks, farmMeta, yearFilter !== "all" ? yearFilter : undefined); } }} disabled={!printRows.length}><Printer className="w-4 h-4 mr-1" />Print</Button>
          <Button size="sm" variant="outline" onClick={() => { void downloadVineOperationsPdf(printRows, blocks, farmName, farmMeta, yearFilter !== "all" ? yearFilter : undefined); }} disabled={!printRows.length}><FileDown className="w-4 h-4 mr-1" />Export PDF</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Operation</Button>
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
        fieldTargetIds={{
          "SBI Number": "settings-sbi",
          "SBI Number (invalid — must be exactly 9 digits)": "settings-sbi",
          "Farm address": "settings-address",
        }}
      />

      {/* APPA Ref missing warning */}
      <FarmSettingsWarning
        missingFields={farmMeta && !String(farmMeta.appaRef ?? "").trim() ? ["APPA Ref"] : []}
        settingsSection="Viticulture & Wine"
        onNavigate={() => setLocation("/settings/farm")}
        targetId="settings-appa-ref"
      />

      {/* FSA / APPA registration pre-flight check */}
      <FsaCompletenessBar farmId={farmId} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search block, variety, operator or type…"
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
          <span className="text-xs text-muted-foreground">Showing {filteredOperations.length} of {data.length}</span>
        )}
      </div>

      <DataTable
        cols={[
          { key: "operationDate", label: "Date", render: r => fmtDate(r.operationDate) },
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
          { key: "operationType", label: "Operation" },
          { key: "pruningSystem", label: "System" },
          { key: "budsPerVineActual", label: "Buds/Vine" },
          { key: "pruningWeightKgPerVine", label: "Wt (kg/vine)", render: r => fmtNum(r.pruningWeightKgPerVine, 3) },
          { key: "operatorName", label: "Operator" },
          { key: "hoursWorked", label: "Hours", render: r => fmtNum(r.hoursWorked, 1) },
          {
            key: "photoCount",
            label: "Photos",
            render: r => {
              const count = Number(r.photoCount ?? 0);
              if (count === 0) return <span className="text-muted-foreground text-xs">—</span>;
              return (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxOperationId(r.id as number); setLightboxPhotoIndex(0); }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium hover:bg-primary/20 transition-colors"
                  title="View photos"
                  aria-label={`View ${count} ${count === 1 ? "photo" : "photos"}`}
                >
                  <Camera className="w-3 h-3" />
                  {count}
                </button>
              );
            },
          },
        ]}
        rows={filteredOperations}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Vineyard Operation</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Date" value={fmtDate(viewing.operationDate)} />
              <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
              <ViewField label="Operation Type" value={fmt(viewing.operationType)} />
              <ViewField label="Pruning System" value={fmt(viewing.pruningSystem)} />
              <ViewField label="Target Buds/Vine" value={fmt(viewing.budsPerVineTarget)} />
              <ViewField label="Actual Buds/Vine" value={fmt(viewing.budsPerVineActual)} />
              <ViewField label="Pruning Wt (kg/vine)" value={fmtNum(viewing.pruningWeightKgPerVine, 3)} />
              <ViewField label="Shoots Removed (%)" value={viewing.shootsRemovedPct ? `${viewing.shootsRemovedPct}%` : "—"} />
              <ViewField label="Leaves Removed Zone" value={fmt(viewing.leavesRemovedZone)} />
              <ViewField label="Machine Used" value={fmt(viewing.machineUsed)} />
              <ViewField label="Operator" value={fmt(viewing.operatorName)} />
              <ViewField label="Contractor" value={fmt(viewing.contractorName)} />
              <ViewField label="Hours Worked" value={fmtNum(viewing.hoursWorked, 1)} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          {viewing && typeof viewing.id === "number" && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments
                farmId={farmId}
                recordType="vineyard-operation"
                recordId={viewing.id}
                onAttachmentsChange={() => { void queryClient.refetchQueries({ queryKey: ["vineyard-operations", farmId] }); }}
              />
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

      {/* Operation Photo Lightbox */}
      <Dialog
        open={lightboxOperationId !== null}
        onOpenChange={o => { if (!o) { setLightboxOperationId(null); setLightboxPhotoIndex(0); } }}
      >
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader className="px-2 pt-2 pb-1">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Camera className="w-4 h-4 text-muted-foreground" />
              Operation Photos
              {operationPhotos.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  {lightboxPhotoIndex + 1} / {operationPhotos.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {operationPhotosLoading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!operationPhotosLoading && operationPhotos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">No photos attached to this operation.</p>
          )}

          {!operationPhotosLoading && currentOperationPhoto && (
            <div className="relative group/lightbox">
              <img
                src={currentOperationPhoto.fileUrl}
                alt={currentOperationPhoto.fileName || "Operation photo"}
                className="w-full max-h-[70vh] object-contain rounded-lg bg-gray-50"
                onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
              />

              {operationPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxPhotoIndex(i => (i - 1 + operationPhotos.length) % operationPhotos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-1.5 transition-colors"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxPhotoIndex(i => (i + 1) % operationPhotos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-1.5 transition-colors"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 px-1 justify-center">
                    {operationPhotos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setLightboxPhotoIndex(index)}
                        className={`w-14 h-14 shrink-0 rounded border-2 overflow-hidden transition-colors ${index === lightboxPhotoIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/40"}`}
                        aria-label={`View photo ${index + 1}`}
                      >
                        <img src={photo.fileUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Vineyard Operation — ${fmt(raiseTaskFor.operationType)} · ${fmt(blockName(raiseTaskFor.blockId))}`}
          defaultDescription={`Date: ${fmtDate(raiseTaskFor.operationDate)} · Operator: ${fmt(raiseTaskFor.operatorName)} · Hours: ${fmtNum(raiseTaskFor.hoursWorked, 1)}`}
          module="Viticulture"
        />
      )}

      {/* Unlink confirm */}
      <ConfirmDialog
        open={unlinkRecordId !== null}
        title="Remove block link?"
        message="This operation will no longer be linked to its block. You can re-link it at any time from the edit form or the bulk-link tool."
        confirmLabel="Unlink"
        confirmVariant="destructive"
        onConfirm={() => unlinkMutation.mutate(unlinkRecordId!)}
        onCancel={() => { setUnlinkRecordId(null); unlinkMutation.reset(); }}
        mutation={unlinkMutation}
      />

      {/* Print pre-flight confirm */}
      {(() => {
        const unlinkedInView = printRows.filter(r => !r.blockId);
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
                  <span>SBI <span className="font-mono font-semibold">{String(farmMeta?.sbiNumber ?? "")}</span> is not valid — must be exactly 9 digits. <button type="button" className="underline underline-offset-2 hover:opacity-80 font-medium" onClick={() => { setPrintConfirmOpen(false); setLocation("/settings/farm"); setTimeout(() => { document.getElementById("settings-sbi")?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 400); }}>Fix in Farm Settings</button></span>
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
                  <Button onClick={() => { setPrintConfirmOpen(false); void printOperations(printRows, farmName, farmId, blocks, farmMeta, yearFilter !== "all" ? yearFilter : undefined); }}>
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
            <DialogTitle>Link unlinked operations to blocks</DialogTitle>
            <DialogDescription>
              Assign each unlinked operation to a vineyard block. Operations already linked to a block are not shown.
            </DialogDescription>
          </DialogHeader>
          {unlinkedOperations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All operations are already linked to blocks.</p>
          ) : (
            <div className="space-y-1 mt-1">
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 px-1 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
                <span>Operation Type</span>
                <span>Date</span>
                <span>Link to block</span>
              </div>
              {unlinkedOperations.map(op => {
                const opId = op.id as number;
                const selectedBlockId = bulkLinks[opId] ?? null;
                return (
                  <div key={opId} className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 items-center px-1 py-1.5 rounded hover:bg-muted/30">
                    <span className="text-sm truncate" title={String(op.operationType ?? "")}>
                      {String(op.operationType ?? <span className="text-muted-foreground italic">Unknown</span>)}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {fmtDate(op.operationDate)}
                    </span>
                    <Select
                      value={selectedBlockId !== null ? String(selectedBlockId) : "__none__"}
                      onValueChange={v => setBulkLinks(prev => ({ ...prev, [opId]: v === "__none__" ? null : Number(v) }))}
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

      {/* Cane Weights — vine vigour metric */}
      <CaneWeightsSection farmId={farmId} blocks={blocks} />

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vineyard Operation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" max={today} value={String(form.operationDate ?? "")} onChange={e => sf("operationDate", e.target.value)} /></div>
              <div><Label>Block</Label>
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Operation Type *</Label>
              <Select value={String(form.operationType ?? "")} onValueChange={v => sf("operationType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>{operationTypes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isPruning && (
              <>
                <div>
                  <Label>Pruning System</Label>
                  <Select
                    value={pruningOther ? "Other" : String(form.pruningSystem ?? "")}
                    onValueChange={v => { if (v === "Other") { setPruningOther(true); sf("pruningSystem", ""); } else { setPruningOther(false); sf("pruningSystem", v); } }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {["Double Guyot", "Single Guyot", "Cordon Spur", "Scott Henry", "Cane Replacement", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {pruningOther && <Input className="mt-1.5" placeholder="Enter pruning system…" value={String(form.pruningSystem ?? "")} onChange={e => sf("pruningSystem", e.target.value)} />}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Target Buds/Vine</Label><Input type="number" value={String(form.budsPerVineTarget ?? "")} onChange={e => sf("budsPerVineTarget", e.target.value)} /></div>
                  <div><Label>Actual Buds/Vine</Label><Input type="number" value={String(form.budsPerVineActual ?? "")} onChange={e => sf("budsPerVineActual", e.target.value)} /></div>
                  <div><Label>Pruning Wt (kg/vine)</Label><Input type="number" step="0.001" value={String(form.pruningWeightKgPerVine ?? "")} onChange={e => sf("pruningWeightKgPerVine", e.target.value)} /></div>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Shoots Removed (%)</Label><Input type="number" min="0" max="100" value={String(form.shootsRemovedPct ?? "")} onChange={e => sf("shootsRemovedPct", e.target.value)} /></div>
              <div><Label>Leaves Removed Zone</Label><Input value={String(form.leavesRemovedZone ?? "")} onChange={e => sf("leavesRemovedZone", e.target.value)} placeholder="e.g. Fruit zone" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Operator</Label><StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
              <div><Label>Contractor</Label><Input value={String(form.contractorName ?? "")} onChange={e => sf("contractorName", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Machine Used</Label><Input value={String(form.machineUsed ?? "")} onChange={e => sf("machineUsed", e.target.value)} /></div>
              <div><Label>Hours Worked</Label><Input type="number" step="0.5" value={String(form.hoursWorked ?? "")} onChange={e => sf("hoursWorked", e.target.value)} /></div>
            </div>
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

// ─── Harvest ───────────────────────────────────────────────────────────────────
