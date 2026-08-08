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
import { usePersistedFilter } from "@/hooks/use-persisted-filter";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

const LICENCE_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-amber-100 text-amber-700",
  lapsed: "bg-red-100 text-red-700",
};

export function LicensingTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-licences", "winery-licences");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "viticulture-licensing", filter: "status", farmId, defaultValue: "all", validValues: ["all", "active", "suspended", "lapsed"] });
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditing(null); setForm({ status: "active" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm({ ...r }); setOpen(true); };
  const save = () => { if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number }); else crud.add.mutate(form); setOpen(false); };
  const today30 = new Date(); today30.setDate(today30.getDate() + 30); const now = new Date();
  const expiringDps = crud.data.filter(r => r.dpsPersonalLicenceExpiry && new Date(r.dpsPersonalLicenceExpiry as string) <= today30 && new Date(r.dpsPersonalLicenceExpiry as string) >= now);
  const dueReview = crud.data.filter(r => r.reviewDate && new Date(r.reviewDate as string) <= today30 && new Date(r.reviewDate as string) >= now);
  const licenceFiltered = statusFilter === "all" ? crud.data : crud.data.filter(r => String(r.status) === statusFilter);
  const licenceCsvCols = [
    { key: "licenceNumber", label: "Licence No." },
    { key: "licenceType", label: "Licence Type" },
    { key: "localAuthority", label: "Issuing Council" },
    { key: "dpsName", label: "DPS Name" },
    { key: "dpsPersonalLicenceNumber", label: "DPS Licence No." },
    { key: "dpsPersonalLicenceExpiry", label: "DPS Expiry", fmt: (r: Record<string, unknown>) => fmtDate(r.dpsPersonalLicenceExpiry) },
    { key: "grantedDate", label: "Granted Date", fmt: (r: Record<string, unknown>) => fmtDate(r.grantedDate) },
    { key: "reviewDate", label: "Review Date", fmt: (r: Record<string, unknown>) => fmtDate(r.reviewDate) },
    { key: "status", label: "Status" },
    { key: "conditions", label: "Conditions" },
    { key: "notes", label: "Notes" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold text-sm">Premises Licences & DPS</h3><p className="text-xs text-muted-foreground mt-0.5">Licensing Act 2003 — premises licence, Designated Premises Supervisor personal licence, and review dates.</p></div>
        <div className="flex gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="lapsed">Lapsed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(licenceFiltered, "licences.csv", licenceCsvCols)} disabled={!licenceFiltered.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Licence</Button>
        </div>
      </div>
      {expiringDps.length > 0 && <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><p><strong>DPS Personal Licence expiring soon:</strong> {expiringDps.map(r => fmt(r.dpsName)).join(", ")}. Renewal must be completed before it lapses.</p></div>}
      {dueReview.length > 0 && <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><p><strong>Premises licence review due within 30 days:</strong> {dueReview.map(r => fmt(r.licenceNumber) || "unlicensed record").join(", ")}.</p></div>}
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "licenceNumber", label: "Licence No." },
            { key: "localAuthority", label: "Issuing Council" },
            { key: "dpsName", label: "DPS" },
            { key: "licenceType", label: "Type", render: r => <span className="capitalize">{fmt(r.licenceType)?.replace(/_/g, " ")}</span> },
            { key: "reviewDate", label: "Review Date", render: r => fmtDate(r.reviewDate) },
            { key: "status", label: "Status", render: r => <span className={`text-xs rounded-full px-2 py-0.5 ${LICENCE_STATUS_COLORS[String(r.status)] ?? "bg-gray-100 text-gray-600"}`}>{fmt(r.status)}</span> },
          ]}
          rows={licenceFiltered}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)} deleteMutation={crud.remove}
        />
      )}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>Premises Licence — {fmt(view.licenceNumber) || "Record"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="Licence Number" value={fmt(view.licenceNumber)} />
              <ViewField label="Licence Type" value={<span className="capitalize">{fmt(view.licenceType)?.replace(/_/g, " ")}</span>} />
              <ViewField label="Issuing Council" value={fmt(view.localAuthority)} />
              <ViewField label="Status" value={<span className={`text-xs rounded-full px-2 py-0.5 ${LICENCE_STATUS_COLORS[String(view.status)] ?? ""}`}>{fmt(view.status)}</span>} />
              <ViewField label="DPS Name" value={fmt(view.dpsName)} />
              <ViewField label="DPS Personal Licence No." value={fmt(view.dpsPersonalLicenceNumber)} />
              <ViewField label="DPS Licence Expiry" value={fmtDate(view.dpsPersonalLicenceExpiry)} />
              <ViewField label="Granted Date" value={fmtDate(view.grantedDate)} />
              <ViewField label="Review Date" value={fmtDate(view.reviewDate)} />
              <div className="col-span-2"><ViewField label="Conditions" value={fmt(view.conditions)} /></div>
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="winery-licence" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); crud.add.reset(); crud.edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Premises Licence</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Licence Number</Label><Input value={String(form.licenceNumber ?? "")} onChange={e => sf("licenceNumber", e.target.value)} /></div>
            <div><Label>Licence Type</Label>
              <Select value={String(form.licenceType ?? "")} onValueChange={v => sf("licenceType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_licence">On-licence (on-site consumption)</SelectItem>
                  <SelectItem value="off_licence">Off-licence (retail / farm shop)</SelectItem>
                  <SelectItem value="both">Both on- and off-licence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Issuing Local Authority</Label><Input value={String(form.localAuthority ?? "")} onChange={e => sf("localAuthority", e.target.value)} placeholder="e.g. East Sussex County Council" /></div>
            <div><Label>DPS Name</Label><Input value={String(form.dpsName ?? "")} onChange={e => sf("dpsName", e.target.value)} /></div>
            <div><Label>DPS Personal Licence No.</Label><Input value={String(form.dpsPersonalLicenceNumber ?? "")} onChange={e => sf("dpsPersonalLicenceNumber", e.target.value)} /></div>
            <div><Label>DPS Licence Expiry</Label><Input type="date" value={String(form.dpsPersonalLicenceExpiry ?? "")} onChange={e => sf("dpsPersonalLicenceExpiry", e.target.value)} /></div>
            <div><Label>Granted Date</Label><Input type="date" value={String(form.grantedDate ?? "")} onChange={e => sf("grantedDate", e.target.value)} /></div>
            <div><Label>Review / Renewal Date</Label><Input type="date" value={String(form.reviewDate ?? "")} onChange={e => sf("reviewDate", e.target.value)} /></div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "active")} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Licence Conditions</Label><Textarea value={String(form.conditions ?? "")} onChange={e => sf("conditions", e.target.value)} rows={2} placeholder="e.g. No off-sales after 22:00, Challenge 25 policy required…" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={crud.add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={crud.edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending}>{(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery: Excise & Duty Returns ─────────────────────────────────────────────

