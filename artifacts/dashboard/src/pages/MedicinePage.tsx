import React, { useState } from "react";
import { printHtml } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Redirect } from "wouter";
import {
  Plus, Search, Loader2, Pencil, Trash2, HeartPulse, Printer,
  AlertTriangle, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | "in_withdrawal" | "cleared" | "no_withdrawal";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function formatDateLong(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return val; }
}
function addDays(dateStr: string, days: number): string {
  if (!dateStr || !days) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}
function isInWithdrawal(endDate: string | null | undefined): boolean {
  if (!endDate) return false;
  return daysUntil(endDate) !== null && daysUntil(endDate)! >= 0;
}
function getRecordStatus(r: MedicineRecord): "in_withdrawal" | "cleared" | "no_withdrawal" {
  if (!r.withdrawalPeriodDays) return "no_withdrawal";
  if (isInWithdrawal(r.withdrawalEndDate)) return "in_withdrawal";
  return "cleared";
}

interface Herd { id: number; name: string; type: string; }
interface MedicineRecord {
  id: number; farmId: number; animalId: number | null; herdId: number | null;
  medicineRef: string | null;
  medicineName: string; batchNumber: string | null; dosage: string | null;
  administrationRoute: string | null; administeredBy: string | null;
  administeredDate: string; withdrawalPeriodDays: number | null;
  withdrawalEndDate: string | null; reason: string | null;
  vetName: string | null; notes: string | null; createdAt: string;
}
interface Farm { id: number; name: string; address: string | null; postcode: string | null; cphNumber: string | null; redTractorId: string | null; }

const EMPTY_FORM = {
  herdId: "", medicineName: "", batchNumber: "", dosage: "", administrationRoute: "",
  administeredBy: "", administeredDate: new Date().toISOString().slice(0, 10),
  withdrawalPeriodDays: "", reason: "", vetName: "", notes: "",
};

const ADMIN_ROUTES = ["Oral", "Subcutaneous injection", "Intramuscular injection", "Intravenous injection", "Intramammary", "Topical / Pour-on", "Intrauterine", "Ocular", "Nasal", "Other"];

function StatusBadge({ record }: { record: MedicineRecord }) {
  const status = getRecordStatus(record);
  const days = daysUntil(record.withdrawalEndDate);
  if (status === "in_withdrawal") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
      <Clock className="w-3 h-3" />{days}d left
    </span>
  );
  if (status === "cleared") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
      <CheckCircle2 className="w-3 h-3" />Cleared
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
      <XCircle className="w-3 h-3" />No W/D
    </span>
  );
}

function RecordCard({ record, herds, onEdit, onDelete }: { record: MedicineRecord; herds: Herd[]; onEdit: (r: MedicineRecord) => void; onDelete: (id: number) => void; }) {
  const [expanded, setExpanded] = useState(false);
  const herdName = herds.find(h => h.id === record.herdId)?.name ?? (record.herdId ? `Herd #${record.herdId}` : "—");
  const status = getRecordStatus(record);
  const borderColor = status === "in_withdrawal" ? "border-l-amber-400" : status === "cleared" ? "border-l-green-400" : "border-l-blue-400";
  const days = daysUntil(record.withdrawalEndDate);

  return (
    <div className={`bg-white border border-border rounded-xl border-l-4 ${borderColor} p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {record.medicineRef && (
              <span className="font-mono text-xs text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded">{record.medicineRef}</span>
            )}
            <StatusBadge record={record} />
            {status === "in_withdrawal" && (
              <span className="text-xs text-amber-700 font-medium">Withdrawal ends {formatDate(record.withdrawalEndDate)}</span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm">{record.medicineName}</h3>
          <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-foreground/60">
            <span>{formatDate(record.administeredDate)}</span>
            {herdName !== "—" && <span>· {herdName}</span>}
            {record.administeredBy && <span>· by {record.administeredBy}</span>}
            {record.withdrawalPeriodDays && <span>· {record.withdrawalPeriodDays}d W/D</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(record)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/30 hover:text-primary">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(record.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/30 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/30">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
          {[
            { label: "Dosage", value: record.dosage },
            { label: "Route", value: record.administrationRoute },
            { label: "Batch No.", value: record.batchNumber },
            { label: "Vet", value: record.vetName },
            { label: "Reason", value: record.reason },
            { label: "Notes", value: record.notes },
          ].filter(f => f.value).map(f => (
            <div key={f.label}>
              <p className="text-foreground/40 uppercase tracking-wide font-semibold text-[10px]">{f.label}</p>
              <p className="text-foreground/80 font-medium">{f.value}</p>
            </div>
          ))}
          <div>
            <p className="text-foreground/40 uppercase tracking-wide font-semibold text-[10px]">Timeline</p>
            <p className="text-foreground/80 font-medium">Administered {formatDate(record.administeredDate)}</p>
            {record.withdrawalEndDate && (
              <p className="text-foreground/80 font-medium">Withdrawal ends {formatDate(record.withdrawalEndDate)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function buildPrintHtml(records: MedicineRecord[], herds: Herd[], farm: Farm, filterLabel: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Medicine Register</title><style>
body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
.hdr h1{font-size:14px;font-weight:700;margin:0 0 2px}.hdr p{font-size:9px;color:#555;margin:1px 0}
.hdr-r{text-align:right;font-size:9px;color:#666}.hdr-r b{display:block;font-size:12px;font-weight:700;color:#000}
table{width:100%;border-collapse:collapse;font-size:9px;margin-bottom:10px}
th{background:#f0fdf4;font-weight:700;text-align:left;border:1px solid #d1d5db;padding:5px 7px}
td{border:1px solid #d1d5db;padding:5px 7px}
tr:nth-child(even) td{background:#fafafa}
.badge-wd{background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:99px;font-weight:600}
.badge-ok{background:#dcfce7;color:#166534;padding:1px 5px;border-radius:99px;font-weight:600}
.badge-na{background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:99px;font-weight:600}
.footer{font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:6px;font-style:italic}
@media print{@page{margin:1.5cm}}
</style></head><body>
<div class="hdr">
  <div>
    <h1>Medicine Register</h1>
    <p>${farm.name}</p>
    ${farm.cphNumber ? `<p>CPH: ${farm.cphNumber}</p>` : ""}
    ${farm.redTractorId ? `<p>Red Tractor ID: ${farm.redTractorId}</p>` : ""}
    <p>Filter: ${filterLabel}</p>
  </div>
  <div class="hdr-r">
    <b>BDE Farm Trac</b>
    <span>Printed: ${new Date().toLocaleDateString("en-GB")}</span>
  </div>
</div>
<table>
  <thead><tr>
    <th>Reference</th><th>Medicine</th><th>Batch No.</th><th>Herd / Group</th><th>Administered</th>
    <th>Dosage / Route</th><th>W/D Days</th><th>W/D Ends</th><th>Status</th><th>Vet</th><th>Reason</th>
  </tr></thead>
  <tbody>${records.map(r => {
    const status = getRecordStatus(r);
    const herdName = herds.find(h => h.id === r.herdId)?.name ?? "—";
    const days = daysUntil(r.withdrawalEndDate);
    const badge = status === "in_withdrawal" ? `<span class="badge-wd">${days}d left</span>` : status === "cleared" ? `<span class="badge-ok">Cleared</span>` : `<span class="badge-na">No W/D</span>`;
    return `<tr>
      <td style="font-family:monospace">${r.medicineRef ?? "—"}</td>
      <td><b>${r.medicineName}</b></td>
      <td style="font-family:monospace">${r.batchNumber ?? "—"}</td>
      <td>${herdName}</td>
      <td>${formatDateLong(r.administeredDate)}</td>
      <td>${[r.dosage, r.administrationRoute].filter(Boolean).join(" · ") || "—"}</td>
      <td>${r.withdrawalPeriodDays ?? "—"}</td>
      <td>${r.withdrawalEndDate ? formatDateLong(r.withdrawalEndDate) : "—"}</td>
      <td>${badge}</td>
      <td>${r.vetName ?? "—"}</td>
      <td>${r.reason ?? "—"}</td>
    </tr>`;
  }).join("")}</tbody>
</table>
<p class="footer">This register is a legally required document under the Veterinary Medicines Regulations 2013 and must be retained for at least 5 years. Ensure withdrawal periods are observed before slaughter, milk sale, or egg collection.</p>
</body></html>`;
}

export default function MedicinePageDedicated() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect to="/select" />;
  return (
    <AppLayout title="Medicine Register">
      <MedicineRegisterContent farmId={farmId} />
    </AppLayout>
  );
}

function MedicineRegisterContent({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const farmQ = useQuery<{ record: Farm }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then(r => r.json()),
  });
  const herdsQ = useQuery<{ records: Herd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`, { credentials: "include" }).then(r => r.json()),
  });
  const medicineQ = useQuery<{ records: MedicineRecord[] }>({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`, { credentials: "include" }).then(r => r.json()),
  });

  const farm: Farm = farmQ.data?.record ?? { id: farmId, name: "Farm", address: null, postcode: null, cphNumber: null, redTractorId: null };
  const herds: Herd[] = herdsQ.data?.records ?? [];
  const allRecords: MedicineRecord[] = medicineQ.data?.records ?? [];

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/medicine-records`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); toast({ title: "Medicine record saved" }); },
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); toast({ title: "Record updated" }); },
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setDeleteId(null); toast({ title: "Record deleted" }); },
  });

  const inWithdrawal = allRecords.filter(r => getRecordStatus(r) === "in_withdrawal");
  const cleared = allRecords.filter(r => getRecordStatus(r) === "cleared");
  const noWithdrawal = allRecords.filter(r => getRecordStatus(r) === "no_withdrawal");

  const tabCounts = { all: allRecords.length, in_withdrawal: inWithdrawal.length, cleared: cleared.length, no_withdrawal: noWithdrawal.length };

  const baseFiltered = statusFilter === "all" ? allRecords
    : statusFilter === "in_withdrawal" ? inWithdrawal
    : statusFilter === "cleared" ? cleared
    : noWithdrawal;

  const filtered = baseFiltered.filter(r => !search
    || r.medicineName.toLowerCase().includes(search.toLowerCase())
    || r.medicineRef?.toLowerCase().includes(search.toLowerCase())
    || r.vetName?.toLowerCase().includes(search.toLowerCase())
    || r.reason?.toLowerCase().includes(search.toLowerCase())
    || herds.find(h => h.id === r.herdId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const filterLabel = statusFilter === "all" ? "All records" : statusFilter === "in_withdrawal" ? "In Withdrawal" : statusFilter === "cleared" ? "Cleared" : "No Withdrawal Required";

  function openEdit(r: MedicineRecord) {
    setEditing(r);
    setForm({
      herdId: r.herdId ? String(r.herdId) : "",
      medicineName: r.medicineName, batchNumber: r.batchNumber ?? "",
      dosage: r.dosage ?? "", administrationRoute: r.administrationRoute ?? "",
      administeredBy: r.administeredBy ?? "", administeredDate: r.administeredDate?.slice(0, 10) ?? "",
      withdrawalPeriodDays: r.withdrawalPeriodDays ? String(r.withdrawalPeriodDays) : "",
      reason: r.reason ?? "", vetName: r.vetName ?? "", notes: r.notes ?? "",
    });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wdDays = form.withdrawalPeriodDays ? Number(form.withdrawalPeriodDays) : null;
    const wdEnd = wdDays && form.administeredDate ? new Date(addDays(form.administeredDate, wdDays)).toISOString() : null;
    const body = {
      herdId: form.herdId ? Number(form.herdId) : null,
      medicineName: form.medicineName, batchNumber: form.batchNumber || null,
      dosage: form.dosage || null, administrationRoute: form.administrationRoute || null,
      administeredBy: form.administeredBy || null,
      administeredDate: form.administeredDate ? new Date(form.administeredDate).toISOString() : null,
      withdrawalPeriodDays: wdDays, withdrawalEndDate: wdEnd,
      reason: form.reason || null, vetName: form.vetName || null, notes: form.notes || null,
    };
    if (editing) { updateM.mutate({ id: editing.id, body }); } else { createM.mutate(body); }
  }

  const isSubmitting = createM.isPending || updateM.isPending;
  const previewWdEnd = form.withdrawalPeriodDays && form.administeredDate ? addDays(form.administeredDate, Number(form.withdrawalPeriodDays)) : null;

  return (
    <>
      {inWithdrawal.length > 0 && (
        <div className="mb-6 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{inWithdrawal.length} active withdrawal period{inWithdrawal.length !== 1 ? "s" : ""} — check before selling or slaughtering</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {inWithdrawal.slice(0, 3).map(r => {
                const days = daysUntil(r.withdrawalEndDate);
                return `${r.medicineName} — ${days} day${days !== 1 ? "s" : ""} remaining`;
              }).join(" · ")}{inWithdrawal.length > 3 ? ` · +${inWithdrawal.length - 3} more` : ""}
            </p>
          </div>
        </div>
      )}

      <TabBar className="mb-5">
        <TabButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
          All <span className="ml-1 text-xs opacity-60">({tabCounts.all})</span>
        </TabButton>
        <TabButton active={statusFilter === "in_withdrawal"} onClick={() => setStatusFilter("in_withdrawal")}>
          In Withdrawal <span className="ml-1 text-xs opacity-60">({tabCounts.in_withdrawal})</span>
        </TabButton>
        <TabButton active={statusFilter === "cleared"} onClick={() => setStatusFilter("cleared")}>
          Cleared <span className="ml-1 text-xs opacity-60">({tabCounts.cleared})</span>
        </TabButton>
        <TabButton active={statusFilter === "no_withdrawal"} onClick={() => setStatusFilter("no_withdrawal")}>
          No W/D Required <span className="ml-1 text-xs opacity-60">({tabCounts.no_withdrawal})</span>
        </TabButton>
      </TabBar>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search medicine, ref, reason..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => printHtml(buildPrintHtml(filtered, herds, farm, filterLabel))} className="gap-2">
            <Printer className="w-4 h-4" /> Print Register
          </Button>
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setFormOpen(true); }} className="gap-2" size="sm">
            <Plus className="w-4 h-4" /> Add Record
          </Button>
        </div>
      </div>

      {medicineQ.isLoading ? (
        <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <HeartPulse className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/80 mb-1">No medicine records</h3>
            <p className="text-foreground/50 text-sm">{search ? "No records match your search." : statusFilter === "all" ? "Record all veterinary medicines administered to your livestock." : `No records in the "${filterLabel}" category.`}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <RecordCard key={r.id} record={r} herds={herds} onEdit={openEdit} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); } }}>
        <DialogContent style={{ maxWidth: "56rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" />
              {editing ? "Edit Medicine Record" : "Add Medicine Record"}
            </DialogTitle>
            <DialogDescription>
              {editing?.medicineRef && <span className="font-mono text-xs text-foreground/50 mr-2">Ref: {editing.medicineRef}</span>}
              Record all veterinary medicines — required under Red Tractor Livestock Standards and the Veterinary Medicines Regulations 2013. Ensure withdrawal periods are observed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Medicine Name <span className="text-red-500">*</span></label>
                <Input placeholder="e.g. Alamycin 300, Metacam 20mg/ml" value={form.medicineName} onChange={e => setForm(f => ({ ...f, medicineName: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Batch / Licence Number</label>
                <Input placeholder="e.g. UK/V/0083451/0001" value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Herd / Animal Group</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.herdId} onChange={e => setForm(f => ({ ...f, herdId: e.target.value }))}>
                  <option value="">Select herd (optional)...</option>
                  {herds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administered By</label>
                <Input placeholder="Name of person administering" value={form.administeredBy} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Date Administered <span className="text-red-500">*</span></label>
                <Input type="date" value={form.administeredDate} onChange={e => setForm(f => ({ ...f, administeredDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administration Route</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.administrationRoute} onChange={e => setForm(f => ({ ...f, administrationRoute: e.target.value }))}>
                  <option value="">Select route...</option>
                  {ADMIN_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Dosage</label>
                <Input placeholder="e.g. 5ml/100kg" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Withdrawal Period (days)</label>
                <Input type="number" min="0" placeholder="e.g. 7 — leave blank if none" value={form.withdrawalPeriodDays} onChange={e => setForm(f => ({ ...f, withdrawalPeriodDays: e.target.value }))} />
                {previewWdEnd && (
                  <p className="text-xs text-amber-700 mt-1 font-medium">
                    ⚠ Withdrawal ends: {formatDate(previewWdEnd)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Prescribing Vet</label>
                <Input placeholder="Vet name / practice" value={form.vetName} onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Reason / Indication</label>
                <Input placeholder="e.g. Mastitis, lameness, respiratory" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                <textarea className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Any additional information..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Save Changes" : "Add to Register"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent style={{ maxWidth: "28rem" }}>
          <DialogHeader>
            <DialogTitle>Delete Medicine Record</DialogTitle>
            <DialogDescription>This will permanently remove the record from the medicine register. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteM.mutate(deleteId)} disabled={deleteM.isPending}>
              {deleteM.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
