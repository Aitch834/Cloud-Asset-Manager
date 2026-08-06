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

type Phenology = Record<string, unknown>;

export function PhenologyTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Phenology>(farmId, "vineyard-phenology", "vineyard-phenology");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Phenology | null>(null);
  const [form, setForm] = useState<Phenology>({});
  const [viewing, setViewing] = useState<Phenology | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Phenology | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const openAdd = () => { setForm({ observationDate: today, observer: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Phenology) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const phenologyYears = Array.from(new Set(data.map(r => new Date(r.observationDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!phenologyYears.includes(new Date().getFullYear())) phenologyYears.unshift(new Date().getFullYear());
  const filteredPhenology = yearFilter === "all" ? data : data.filter(r => new Date(r.observationDate as string).getFullYear() === Number(yearFilter));

  const csvCols = [
    { key: "observationDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.observationDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "bbchStage", label: "BBCH Stage" },
    { key: "bbchDescription", label: "Description" },
    { key: "percentageReached", label: "% Reached" },
    { key: "observer", label: "Observer" },
    { key: "temperatureC", label: "Temp (°C)" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Phenology (BBCH Growth Stages)</p>
          <p className="text-xs text-muted-foreground">Log key growth stages using the BBCH scale. Used to time spray applications, canopy operations, and vintner decisions.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {phenologyYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredPhenology, "phenology.csv", csvCols)} disabled={!filteredPhenology.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Observation</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "observationDate", label: "Date", render: r => fmtDate(r.observationDate) },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
          { key: "bbchStage", label: "BBCH Stage" },
          { key: "bbchDescription", label: "Description" },
          { key: "percentageReached", label: "% Reached", render: r => r.percentageReached ? `${r.percentageReached}%` : "—" },
          { key: "observer", label: "Observer" },
          { key: "temperatureC", label: "Temp (°C)", render: r => fmtNum(r.temperatureC, 1) },
        ]}
        rows={filteredPhenology}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Phenology Observation</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Observation Date" value={fmtDate(viewing.observationDate)} />
              <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
              <ViewField label="BBCH Stage" value={fmt(viewing.bbchStage)} />
              <ViewField label="% Reached" value={viewing.percentageReached ? `${viewing.percentageReached}%` : "—"} />
              <div className="col-span-2"><ViewField label="Description" value={fmt(viewing.bbchDescription)} /></div>
              <ViewField label="Observer" value={fmt(viewing.observer)} />
              <ViewField label="Temperature (°C)" value={fmtNum(viewing.temperatureC, 1)} />
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
          defaultTitle={`Phenology — BBCH ${fmt(raiseTaskFor.bbchStage)} · ${fmt(blockName(raiseTaskFor.blockId))}`}
          defaultDescription={`Date: ${fmtDate(raiseTaskFor.observationDate)} · ${fmt(raiseTaskFor.bbchDescription)} · ${raiseTaskFor.percentageReached ? `${raiseTaskFor.percentageReached}% reached` : ""}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Phenology Observation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" max={today} value={String(form.observationDate ?? "")} onChange={e => sf("observationDate", e.target.value)} /></div>
              <div><Label>Block</Label>
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="All blocks…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>BBCH Stage *</Label>
              <Select value={String(form.bbchStage ?? "")} onValueChange={v => { const s = BBCH_STAGES.find(x => x.code === v); sf("bbchStage", v); if (s) sf("bbchDescription", s.desc); }}>
                <SelectTrigger><SelectValue placeholder="Select BBCH stage…" /></SelectTrigger>
                <SelectContent>
                  {BBCH_STAGES.map(s => <SelectItem key={s.code} value={s.code}>{s.code} — {s.desc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={String(form.bbchDescription ?? "")} onChange={e => sf("bbchDescription", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>% Reached</Label><Input type="number" min="0" max="100" value={String(form.percentageReached ?? "")} onChange={e => sf("percentageReached", e.target.value)} /></div>
              <div><Label>Observer</Label><StaffSelect value={String(form.observer ?? "")} onChange={v => sf("observer", v)} staffNames={staffNames} loading={staffLoading} /></div>
              <div><Label>Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureC ?? "")} onChange={e => sf("temperatureC", e.target.value)} /></div>
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

// ─── Operations ────────────────────────────────────────────────────────────────
