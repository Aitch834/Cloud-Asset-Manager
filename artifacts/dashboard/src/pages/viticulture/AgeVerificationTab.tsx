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

const UK_TRAINING_PROVIDERS = [
  "BIIAB Level 2 Award in Responsible Alcohol Retailing",
  "BIIAB Award for Personal Licence Holders (APLH)",
  "Highfield Level 2 Award in Responsible Alcohol Retailing",
  "Highfield Award for Personal Licence Holders",
  "Pearson BTEC Level 2 Award in Responsible Alcohol Retailing",
  "NCPLH (Pearson/EdExcel National Certificate for Personal Licence Holders)",
  "In-House Training Programme",
  "Online / eLearning (CPL Online, Inncentive, etc.)",
];

export function AgeVerificationTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-age-verification", "winery-age-verification");
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [providerOther, setProviderOther] = useState(false);
  const [locationOther, setLocationOther] = useState(false);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = (type: "training" | "refusal") => {
    setEditing(null);
    setForm({ recordType: type, recordDate: today, idRequested: false, idProduced: false, supervisorNotified: false });
    setProviderOther(false);
    setLocationOther(false);
    setOpen(true);
  };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm({ ...r });
    const isKnown = UK_TRAINING_PROVIDERS.includes(r.trainingProvider as string);
    setProviderOther(!isKnown && !!r.trainingProvider);
    setLocationOther(!!r.refusalLocation && !["shop", "tour", "event", "cellar-door"].includes(String(r.refusalLocation)));
    setOpen(true);
  };
  const save = () => {
    if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number });
    else crud.add.mutate(form);
    setOpen(false);
  };

  const now = new Date();
  const soon = new Date(); soon.setDate(soon.getDate() + 90);
  const ageYears = Array.from(new Set(crud.data.map(r => r.recordDate ? new Date(r.recordDate as string).getFullYear() : null).filter(Boolean) as number[])).sort((a, b) => b - a);
  if (!ageYears.includes(new Date().getFullYear())) ageYears.unshift(new Date().getFullYear());
  const yearFiltered = yearFilter === "all" ? crud.data : crud.data.filter(r => r.recordDate && new Date(r.recordDate as string).getFullYear() === Number(yearFilter));
  const trainings = yearFiltered.filter(r => r.recordType === "training");
  const refusals = yearFiltered.filter(r => r.recordType === "refusal");
  const ageCsvCols = [
    { key: "recordDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.recordDate) },
    { key: "recordType", label: "Type" },
    { key: "staffName", label: "Staff Member" },
    { key: "trainingProvider", label: "Training Provider" },
    { key: "trainingCourse", label: "Course" },
    { key: "trainingExpiryDate", label: "Expiry Date", fmt: (r: Record<string, unknown>) => fmtDate(r.trainingExpiryDate) },
    { key: "idDocumentType", label: "ID Type" },
    { key: "idRequested", label: "ID Requested", fmt: (r: Record<string, unknown>) => r.idRequested ? "Yes" : "No" },
    { key: "idProduced", label: "ID Produced", fmt: (r: Record<string, unknown>) => r.idProduced ? "Yes" : "No" },
    { key: "supervisorNotified", label: "Supervisor Notified", fmt: (r: Record<string, unknown>) => r.supervisorNotified ? "Yes" : "No" },
    { key: "notes", label: "Notes" },
  ];
  const expiredTraining = trainings.filter(r => r.trainingExpiryDate && new Date(r.trainingExpiryDate as string) < now);
  const expiringSoon = trainings.filter(r => {
    if (!r.trainingExpiryDate) return false;
    const d = new Date(r.trainingExpiryDate as string);
    return d >= now && d <= soon;
  });

  const expiryBadge = (r: Record<string, unknown>) => {
    if (!r.trainingExpiryDate) return null;
    const d = new Date(r.trainingExpiryDate as string);
    if (d < now) return <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-medium shrink-0">Expired</span>;
    if (d <= soon) return <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium shrink-0">Expiring soon</span>;
    return <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium shrink-0">Active</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Age Verification — Challenge 25</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Staff training records and refusal log. Both are typically required by premises licence conditions and must be available for inspection.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {ageYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(yearFiltered, "age-verification.csv", ageCsvCols)} disabled={!yearFiltered.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => openAdd("refusal")}><Plus className="w-3.5 h-3.5 mr-1" />Log Refusal</Button>
          <Button size="sm" onClick={() => openAdd("training")}><Plus className="w-3.5 h-3.5 mr-1" />Add Training</Button>
        </div>
      </div>

      {expiredTraining.length > 0 && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p><strong>Expired training:</strong> {expiredTraining.map(r => fmt(r.staffName)).join(", ")}. Renewal required before staff may sell alcohol unsupervised.</p>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p><strong>Training expiring within 90 days:</strong> {expiringSoon.map(r => fmt(r.staffName)).join(", ")}. Book renewal now to avoid a compliance gap.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Staff Trained" value={trainings.length} sub="Challenge 25 certificates on file" />
        <StatCard label="Refusals Logged" value={refusals.length} sub="Keep for licence review / inspection" />
      </div>

      {trainings.length > 0 && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trained &amp; Certified Staff</p>
          </div>
          <ul>
            {trainings.map(r => (
              <li key={r.id as number} className="flex items-center justify-between gap-3 px-3 py-2.5 border-b last:border-0 hover:bg-muted/20">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{fmt(r.staffName)}</p>
                  <p className="text-xs text-muted-foreground truncate">{fmt(r.trainingProvider)}</p>
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0">
                  {!!r.trainingExpiryDate && <span className="text-muted-foreground">Expires {fmtDate(r.trainingExpiryDate)}</span>}
                  {expiryBadge(r)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "recordDate", label: "Date", render: r => fmtDate(r.recordDate) },
            { key: "recordType", label: "Type", render: r => r.recordType === "training"
              ? <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Training</span>
              : <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Refusal</span> },
            { key: "staffName", label: "Staff Name" },
            { key: "details", label: "Details", render: r => r.recordType === "training"
              ? <span className="text-xs text-muted-foreground">{fmt(r.trainingProvider)}{r.trainingExpiryDate ? ` — expires ${fmtDate(r.trainingExpiryDate)}` : ""}</span>
              : <span className="text-xs text-muted-foreground">Est. age {fmt(r.estimatedAge)} — ID {r.idProduced ? "produced" : "not produced"}</span> },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)}
        />
      )}

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader>
              <DialogTitle>{view.recordType === "training" ? "Training Record" : "Refusal Record"} — {fmtDate(view.recordDate)}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="Date" value={fmtDate(view.recordDate)} />
              <ViewField label="Staff Name" value={fmt(view.staffName)} />
              {view.recordType === "training" ? <>
                <div className="col-span-2"><ViewField label="Training Provider" value={fmt(view.trainingProvider)} /></div>
                <ViewField label="Certificate Ref" value={fmt(view.trainingCertificateRef)} />
                <ViewField label="Certificate Expiry" value={fmtDate(view.trainingExpiryDate)} />
              </> : <>
                <ViewField label="Refusal Location" value={fmt(view.refusalLocation)} />
                <ViewField label="Estimated Customer Age" value={fmt(view.estimatedAge)} />
                <ViewField label="ID Requested" value={view.idRequested ? "Yes" : "No"} />
                <ViewField label="ID Produced" value={view.idProduced ? "Yes" : "No"} />
                <ViewField label="Supervisor Notified" value={view.supervisorNotified ? "Yes" : "No"} />
              </>}
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {view.recordType === "training" && typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="age-verification-training" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); crud.add.reset(); crud.edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader>
            <DialogTitle>{editing !== null ? "Edit Record" : form.recordType === "training" ? "Add Training Record" : "Log Refusal"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.recordDate ?? "")} onChange={e => sf("recordDate", e.target.value)} /></div>
            <div>
              <Label>Staff Name</Label>
              <StaffSelect
                value={String(form.staffName ?? "")}
                onChange={v => sf("staffName", v)}
                staffNames={staffNames}
                loading={staffLoading}
              />
            </div>
            {form.recordType === "training" ? <>
              <div className="col-span-2">
                <Label>Training Provider</Label>
                <Select
                  value={providerOther ? "other" : String(form.trainingProvider ?? "")}
                  onValueChange={v => {
                    if (v === "other") { setProviderOther(true); sf("trainingProvider", ""); }
                    else { setProviderOther(false); sf("trainingProvider", v); }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select accredited body…" /></SelectTrigger>
                  <SelectContent>
                    {UK_TRAINING_PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                {providerOther && (
                  <Input
                    className="mt-1.5"
                    value={String(form.trainingProvider ?? "")}
                    onChange={e => sf("trainingProvider", e.target.value)}
                    placeholder="Enter training provider name…"
                  />
                )}
              </div>
              <div><Label>Certificate Reference</Label><Input value={String(form.trainingCertificateRef ?? "")} onChange={e => sf("trainingCertificateRef", e.target.value)} /></div>
              <div><Label>Certificate Expiry</Label><Input type="date" value={String(form.trainingExpiryDate ?? "")} onChange={e => sf("trainingExpiryDate", e.target.value)} /></div>
            </> : <>
              <div>
                <Label>Refusal Location</Label>
                <Select
                  value={locationOther ? "other" : String(form.refusalLocation ?? "")}
                  onValueChange={v => { if (v === "other") { setLocationOther(true); sf("refusalLocation", ""); } else { setLocationOther(false); sf("refusalLocation", v); } }}
                >
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shop">Farm Shop</SelectItem>
                    <SelectItem value="tour">Winery Tour</SelectItem>
                    <SelectItem value="event">Event / Tasting</SelectItem>
                    <SelectItem value="cellar-door">Cellar Door</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {locationOther && <Input className="mt-1.5" placeholder="Describe the location…" value={String(form.refusalLocation ?? "")} onChange={e => sf("refusalLocation", e.target.value)} />}
              </div>
              <div><Label>Customer's Estimated Age</Label><Input type="number" value={String(form.estimatedAge ?? "")} onChange={e => sf("estimatedAge", e.target.value)} /></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.idRequested} onCheckedChange={v => sf("idRequested", !!v)} id="idr" /><Label htmlFor="idr">ID Requested</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.idProduced} onCheckedChange={v => sf("idProduced", !!v)} id="idp" /><Label htmlFor="idp">ID Produced</Label></div>
              <div className="flex items-center gap-2 col-span-2"><Checkbox checked={!!form.supervisorNotified} onCheckedChange={v => sf("supervisorNotified", !!v)} id="sup" /><Label htmlFor="sup">Supervisor Notified</Label></div>
            </>}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={crud.add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={crud.edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.recordDate}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Spray Diary Tab ──────────────────────────────────────────────────────────

