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

const SESSION_TYPES: Record<string, string> = {
  tour: "Winery Tour",
  event: "Event / Open Day",
  trade_tasting: "Trade Tasting",
  private_tasting: "Private Tasting",
};

export function TastingsToursTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-tasting-sessions", "winery-tasting-sessions");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditing(null); setForm({ sessionDate: today }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm({ ...r }); setOpen(true); };
  const save = () => { if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number }); else crud.add.mutate(form); setOpen(false); };
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const rolling = crud.data.filter(r => r.sessionDate && new Date(r.sessionDate as string) >= oneYearAgo);
  const rolling12mVolumeL = rolling.reduce((s, r) => s + parseFloat(String(r.totalVolumeL ?? 0)), 0);
  const rolling12mVisitors = rolling.reduce((s, r) => s + (parseInt(String(r.visitorCount ?? 0)) || 0), 0);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold text-sm">Tastings & Tours Log</h3><p className="text-xs text-muted-foreground mt-0.5">Record all tour sessions, tastings, and events. Tasting volumes are dutiable and must be declared in excise duty returns.</p></div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Session</Button>
      </div>
      {crud.data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Rolling 12M Sessions" value={rolling.length} />
          <StatCard label="Rolling 12M Visitors" value={rolling12mVisitors.toLocaleString()} />
          <StatCard label="Rolling 12M Tasting Volume" value={`${rolling12mVolumeL.toFixed(1)} L`} sub="Must be included in duty returns" color="amber" />
        </div>
      )}
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "sessionDate", label: "Date", render: r => fmtDate(r.sessionDate) },
            { key: "sessionType", label: "Type", render: r => SESSION_TYPES[String(r.sessionType)] ?? fmt(r.sessionType) },
            { key: "sessionName", label: "Session" },
            { key: "visitorCount", label: "Visitors" },
            { key: "totalVolumeL", label: "Volume (L)", render: r => fmtNum(r.totalVolumeL) },
            { key: "revenueGbp", label: "Revenue", render: r => r.revenueGbp ? `£${fmtNum(r.revenueGbp, 2)}` : "—" },
            { key: "staffName", label: "Staff" },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)}
        />
      )}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>Session — {fmtDate(view.sessionDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="Date" value={fmtDate(view.sessionDate)} />
              <ViewField label="Type" value={SESSION_TYPES[String(view.sessionType)] ?? fmt(view.sessionType)} />
              <ViewField label="Session Name" value={fmt(view.sessionName)} />
              <ViewField label="Staff Name" value={fmt(view.staffName)} />
              <ViewField label="Visitor Count" value={fmt(view.visitorCount)} />
              <ViewField label="Wines Shown" value={fmt(view.winesShownCount)} />
              <ViewField label="Volume per Person (ml)" value={fmt(view.volumePerPersonMl)} />
              <ViewField label="Total Volume (L)" value={fmtNum(view.totalVolumeL)} />
              <ViewField label="Ticket Price" value={view.ticketPriceGbp ? `£${fmtNum(view.ticketPriceGbp, 2)}` : "—"} />
              <ViewField label="Revenue" value={view.revenueGbp ? `£${fmtNum(view.revenueGbp, 2)}` : "—"} />
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="winery-tasting-session" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); crud.add.reset(); crud.edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Log"} Tasting Session</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.sessionDate ?? "")} onChange={e => sf("sessionDate", e.target.value)} /></div>
            <div><Label>Session Type</Label>
              <Select value={String(form.sessionType ?? "")} onValueChange={v => sf("sessionType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{Object.entries(SESSION_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Session Name</Label><Input value={String(form.sessionName ?? "")} onChange={e => sf("sessionName", e.target.value)} placeholder="e.g. Saturday afternoon vineyard walk & tasting" /></div>
            <div><Label>Visitor Count</Label><Input type="number" value={String(form.visitorCount ?? "")} onChange={e => sf("visitorCount", e.target.value)} /></div>
            <div><Label>Wines Shown</Label><Input type="number" value={String(form.winesShownCount ?? "")} onChange={e => sf("winesShownCount", e.target.value)} /></div>
            <div><Label>Volume per Person (ml)</Label><Input type="number" value={String(form.volumePerPersonMl ?? "")} onChange={e => sf("volumePerPersonMl", e.target.value)} placeholder="e.g. 150" /></div>
            <div><Label>Total Volume (L)</Label><Input type="number" step="0.01" value={String(form.totalVolumeL ?? "")} onChange={e => sf("totalVolumeL", e.target.value)} /></div>
            <div><Label>Staff Name</Label><Input value={String(form.staffName ?? "")} onChange={e => sf("staffName", e.target.value)} /></div>
            <div><Label>Ticket Price (£)</Label><Input type="number" step="0.01" value={String(form.ticketPriceGbp ?? "")} onChange={e => sf("ticketPriceGbp", e.target.value)} /></div>
            <div><Label>Revenue (£)</Label><Input type="number" step="0.01" value={String(form.revenueGbp ?? "")} onChange={e => sf("revenueGbp", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={crud.add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={crud.edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.sessionDate}>{(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery: Age Verification — Challenge 25 ───────────────────────────────────

