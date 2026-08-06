import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge,
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

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type Operation = Record<string, unknown>;

export function OperationsTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Operation>(farmId, "vineyard-operations", "vineyard-operations");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Operation | null>(null);
  const [form, setForm] = useState<Operation>({});
  const [viewing, setViewing] = useState<Operation | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Operation | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
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

  const isPruning = String(form.operationType ?? "").toLowerCase().includes("prun");

  const operationYears = Array.from(new Set(data.map(r => new Date(r.operationDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!operationYears.includes(new Date().getFullYear())) operationYears.unshift(new Date().getFullYear());
  const filteredOperations = yearFilter === "all" ? data : data.filter(r => new Date(r.operationDate as string).getFullYear() === Number(yearFilter));

  const csvCols = [
    { key: "operationDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.operationDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
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
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Pruning & Canopy Operations</p>
          <p className="text-xs text-muted-foreground">Record all canopy management activities. Pruning records including bud counts are required for GI / PDO compliance and assurance schemes.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {operationYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredOperations, "vineyard-operations.csv", csvCols)} disabled={!filteredOperations.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Operation</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "operationDate", label: "Date", render: r => fmtDate(r.operationDate) },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
          { key: "operationType", label: "Operation" },
          { key: "pruningSystem", label: "System" },
          { key: "budsPerVineActual", label: "Buds/Vine" },
          { key: "pruningWeightKgPerVine", label: "Wt (kg/vine)", render: r => fmtNum(r.pruningWeightKgPerVine, 3) },
          { key: "operatorName", label: "Operator" },
          { key: "hoursWorked", label: "Hours", render: r => fmtNum(r.hoursWorked, 1) },
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
          defaultTitle={`Vineyard Operation — ${fmt(raiseTaskFor.operationType)} · ${fmt(blockName(raiseTaskFor.blockId))}`}
          defaultDescription={`Date: ${fmtDate(raiseTaskFor.operationDate)} · Operator: ${fmt(raiseTaskFor.operatorName)} · Hours: ${fmtNum(raiseTaskFor.hoursWorked, 1)}`}
          module="Viticulture"
        />
      )}

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
