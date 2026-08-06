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

type Scouting = Record<string, unknown>;

export function ScoutingTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Scouting>(farmId, "vineyard-scouting", "vineyard-scouting");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Scouting | null>(null);
  const [form, setForm] = useState<Scouting>({});
  const [viewing, setViewing] = useState<Scouting | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Scouting | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
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
  const filteredScouting = yearFilter === "all" ? data : data.filter(r => new Date(r.scoutDate as string).getFullYear() === Number(yearFilter));

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
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Disease & Pest Scouting</p>
          <p className="text-xs text-muted-foreground">Regular scouting records demonstrate due diligence for plant health and inform spray timing decisions.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {scoutingYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredScouting, "vineyard-scouting.csv", csvCols)} disabled={!filteredScouting.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Scouting Record</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "scoutDate", label: "Date", render: r => fmtDate(r.scoutDate) },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
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

