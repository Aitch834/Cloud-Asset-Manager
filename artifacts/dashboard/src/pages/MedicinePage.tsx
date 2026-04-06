import React, { useState } from "react";
import { printProReport } from "@/lib/print-report";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
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
  AlertTriangle, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Eye,
  Tag, Users, User,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | "in_withdrawal" | "cleared" | "no_withdrawal";
type TreatmentScope = "individual" | "group" | "whole_herd";

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
interface Animal { id: number; earTagNumber: string | null; tagNumber: string | null; species: string; breed: string | null; herdId: number | null; }
interface MedicineRecord {
  id: number; farmId: number; animalId: number | null; herdId: number | null;
  medicineRef: string | null;
  medicineName: string; batchNumber: string | null; dosage: string | null;
  administrationRoute: string | null; administeredBy: string | null;
  administeredDate: string; withdrawalPeriodDays: number | null;
  withdrawalEndDate: string | null; reason: string | null;
  vetName: string | null; notes: string | null;
  treatmentScope: string | null;
  treatedAnimalTags: string | null;
  treatedAnimalCount: number | null;
  createdAt: string;
}
interface Farm { id: number; name: string; address: string | null; postcode: string | null; cphNumber: string | null; redTractorId: string | null; }

const EMPTY_FORM = {
  treatmentScope: "whole_herd" as TreatmentScope,
  animalId: "",
  herdId: "",
  treatedAnimalCount: "",
  treatedAnimalTags: "",
  medicineName: "", batchNumber: "", dosage: "", administrationRoute: "",
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

function TreatmentScopeBadge({ record, herds, animals }: { record: MedicineRecord; herds: Herd[]; animals: Animal[] }) {
  const scope = record.treatmentScope;
  if (scope === "individual" && record.animalId) {
    const animal = animals.find(a => a.id === record.animalId);
    const tag = animal?.earTagNumber ?? animal?.tagNumber ?? `Animal #${record.animalId}`;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
        <Tag className="w-3 h-3" />{tag}
      </span>
    );
  }
  if (scope === "individual" && record.treatedAnimalTags) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
        <Tag className="w-3 h-3" />{record.treatedAnimalTags}
      </span>
    );
  }
  if (scope === "group") {
    const herdName = herds.find(h => h.id === record.herdId)?.name;
    const count = record.treatedAnimalCount;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
        <Users className="w-3 h-3" />Group{herdName ? ` — ${herdName}` : ""}{count ? ` (${count})` : ""}
      </span>
    );
  }
  if (scope === "whole_herd" || record.herdId) {
    const herdName = herds.find(h => h.id === record.herdId)?.name;
    const count = record.treatedAnimalCount;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
        <Users className="w-3 h-3" />{herdName ?? "Whole Herd"}{count ? ` (${count})` : ""}
      </span>
    );
  }
  return null;
}

function animalLabel(a: Animal): string {
  const tag = a.earTagNumber ?? a.tagNumber ?? `#${a.id}`;
  return `${tag}${a.breed ? ` — ${a.breed}` : ""} (${a.species})`;
}

function treatmentTraceDetail(record: MedicineRecord, herds: Herd[], animals: Animal[]): string {
  const scope = record.treatmentScope;
  if (scope === "individual" && record.animalId) {
    const animal = animals.find(a => a.id === record.animalId);
    return animal ? `Individual: ${animal.earTagNumber ?? animal.tagNumber ?? `#${animal.id}`}` : `Individual: Animal #${record.animalId}`;
  }
  if (scope === "individual" && record.treatedAnimalTags) {
    return `Individual: ${record.treatedAnimalTags}`;
  }
  if (scope === "group") {
    const herdName = herds.find(h => h.id === record.herdId)?.name ?? "Group";
    const tags = record.treatedAnimalTags ? ` · Tags: ${record.treatedAnimalTags}` : "";
    return `Group: ${herdName}${record.treatedAnimalCount ? ` (${record.treatedAnimalCount} animals)` : ""}${tags}`;
  }
  const herdName = herds.find(h => h.id === record.herdId)?.name;
  const count = record.treatedAnimalCount;
  if (herdName) return `Whole herd: ${herdName}${count ? ` (${count} animals)` : ""}`;
  return "—";
}

function RecordCard({ record, herds, animals, onEdit, onDelete, onView }: {
  record: MedicineRecord; herds: Herd[]; animals: Animal[];
  onEdit: (r: MedicineRecord) => void; onDelete: (id: number) => void; onView: (r: MedicineRecord) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = getRecordStatus(record);
  const borderColor = status === "in_withdrawal" ? "border-l-amber-400" : status === "cleared" ? "border-l-green-400" : "border-l-blue-400";

  return (
    <div className={`bg-white border border-border rounded-xl border-l-4 ${borderColor} p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {record.medicineRef && (
              <span className="font-mono text-xs text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded">{record.medicineRef}</span>
            )}
            <StatusBadge record={record} />
            <TreatmentScopeBadge record={record} herds={herds} animals={animals} />
            {status === "in_withdrawal" && (
              <span className="text-xs text-amber-700 font-medium">Withdrawal ends {formatDate(record.withdrawalEndDate)}</span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm">{record.medicineName}</h3>
          <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-foreground/60">
            <span>{formatDate(record.administeredDate)}</span>
            {record.administeredBy && <span>· by {record.administeredBy}</span>}
            {record.withdrawalPeriodDays && <span>· {record.withdrawalPeriodDays}d W/D</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onView(record)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/30 hover:text-blue-600">
            <Eye className="w-3.5 h-3.5" />
          </button>
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
            { label: "Animal / Group", value: treatmentTraceDetail(record, herds, animals) },
            { label: "Dosage", value: record.dosage },
            { label: "Route", value: record.administrationRoute },
            { label: "Batch No.", value: record.batchNumber },
            { label: "Vet", value: record.vetName },
            { label: "Reason", value: record.reason },
            { label: "Notes", value: record.notes },
          ].filter(f => f.value && f.value !== "—").map(f => (
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

function printMedicineRegister(records: MedicineRecord[], herds: Herd[], animals: Animal[], farm: Farm, filterLabel: string): void {
  const tableHtml = `<table><thead><tr>
    <th>Reference</th><th>Medicine</th><th>Batch No.</th><th>Animal / Group Treated</th><th>Administered</th>
    <th>Dosage / Route</th><th>W/D Days</th><th>W/D Ends</th><th>Status</th><th>Vet</th><th>Reason</th>
  </tr></thead><tbody>${records.map(r => {
    const status = getRecordStatus(r);
    const days = daysUntil(r.withdrawalEndDate);
    const badge = status === "in_withdrawal"
      ? `<span style="background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-weight:600">${days}d left</span>`
      : status === "cleared"
      ? `<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-weight:600">Cleared</span>`
      : `<span style="background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px;font-weight:600">No W/D</span>`;
    const traceDetail = treatmentTraceDetail(r, herds, animals);
    return `<tr>
      <td style="font-family:monospace">${r.medicineRef ?? "—"}</td>
      <td><strong>${r.medicineName}</strong></td>
      <td style="font-family:monospace">${r.batchNumber ?? "—"}</td>
      <td>${traceDetail}</td>
      <td style="white-space:nowrap">${formatDateLong(r.administeredDate)}</td>
      <td>${[r.dosage, r.administrationRoute].filter(Boolean).join(" · ") || "—"}</td>
      <td>${r.withdrawalPeriodDays ?? "—"}</td>
      <td style="white-space:nowrap">${r.withdrawalEndDate ? formatDateLong(r.withdrawalEndDate) : "—"}</td>
      <td>${badge}</td>
      <td>${r.vetName ?? "—"}</td>
      <td>${r.reason ?? "—"}</td>
    </tr>`;
  }).join("")}</tbody></table>`;
  printProReport({
    title: "Medicine Register",
    subtitle: "Veterinary Medicines Regulations 2013",
    farmName: farm.name,
    cphNumber: farm.cphNumber ?? undefined,
    redTractorId: farm.redTractorId ?? undefined,
    recordCount: records.length,
    extraMeta: `Filter: ${filterLabel}`,
    tableHtml,
    footerNote: "Legally required under the Veterinary Medicines Regulations 2013 — retain for at least 5 years. Observe all withdrawal periods before slaughter, milk sale, or egg collection.",
  });
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
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MedicineRecord | null>(null);
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
  const animalsQ = useQuery<{ records: Animal[] }>({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then(r => r.json()),
  });
  const medicineQ = useQuery<{ records: MedicineRecord[] }>({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`, { credentials: "include" }).then(r => r.json()),
  });

  const farm: Farm = farmQ.data?.record ?? { id: farmId, name: "Farm", address: null, postcode: null, cphNumber: null, redTractorId: null };
  const herds: Herd[] = herdsQ.data?.records ?? [];
  const animals: Animal[] = animalsQ.data?.records ?? [];
  const allRecords: MedicineRecord[] = medicineQ.data?.records ?? [];

  // Animals filtered to the selected herd (for group/whole_herd scopes)
  const herdAnimals = form.herdId
    ? animals.filter(a => a.herdId === Number(form.herdId))
    : animals;

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

  const yearRecords = allRecords.filter(r => isInCropYear(r.administeredDate, cropYear));

  const inWithdrawal = yearRecords.filter(r => getRecordStatus(r) === "in_withdrawal");
  const cleared = yearRecords.filter(r => getRecordStatus(r) === "cleared");
  const noWithdrawal = yearRecords.filter(r => getRecordStatus(r) === "no_withdrawal");

  const tabCounts = { all: yearRecords.length, in_withdrawal: inWithdrawal.length, cleared: cleared.length, no_withdrawal: noWithdrawal.length };

  const baseFiltered = statusFilter === "all" ? yearRecords
    : statusFilter === "in_withdrawal" ? inWithdrawal
    : statusFilter === "cleared" ? cleared
    : noWithdrawal;

  const filtered = baseFiltered.filter(r => !search
    || r.medicineName.toLowerCase().includes(search.toLowerCase())
    || r.medicineRef?.toLowerCase().includes(search.toLowerCase())
    || r.vetName?.toLowerCase().includes(search.toLowerCase())
    || r.reason?.toLowerCase().includes(search.toLowerCase())
    || r.treatedAnimalTags?.toLowerCase().includes(search.toLowerCase())
    || herds.find(h => h.id === r.herdId)?.name.toLowerCase().includes(search.toLowerCase())
    || (r.animalId && animals.find(a => a.id === r.animalId)?.earTagNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  const filterLabel = statusFilter === "all" ? "All records" : statusFilter === "in_withdrawal" ? "In Withdrawal" : statusFilter === "cleared" ? "Cleared" : "No Withdrawal Required";

  function openEdit(r: MedicineRecord) {
    setEditing(r);
    setForm({
      treatmentScope: (r.treatmentScope as TreatmentScope) ?? "whole_herd",
      animalId: r.animalId ? String(r.animalId) : "",
      herdId: r.herdId ? String(r.herdId) : "",
      treatedAnimalCount: r.treatedAnimalCount ? String(r.treatedAnimalCount) : "",
      treatedAnimalTags: r.treatedAnimalTags ?? "",
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
    const body: Record<string, unknown> = {
      treatmentScope: form.treatmentScope,
      animalId: form.treatmentScope === "individual" && form.animalId ? Number(form.animalId) : null,
      herdId: form.treatmentScope !== "individual" && form.herdId ? Number(form.herdId) : null,
      treatedAnimalCount: (form.treatmentScope === "group" || form.treatmentScope === "whole_herd") && form.treatedAnimalCount ? Number(form.treatedAnimalCount) : null,
      treatedAnimalTags: form.treatedAnimalTags || null,
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
          <Input placeholder="Search medicine, ref, ear tag, reason..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => printMedicineRegister(filtered, herds, animals, farm, filterLabel)} className="gap-2">
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
            <RecordCard key={r.id} record={r} herds={herds} animals={animals} onEdit={openEdit} onDelete={setDeleteId} onView={setViewRecord} />
          ))}
        </div>
      )}

      {/* View dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-primary" />
                Medicine Record
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm py-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><p className="text-xs text-gray-500 uppercase font-medium mb-1">Medicine</p><p className="font-semibold">{viewRecord.medicineName}</p></div>
                {viewRecord.medicineRef && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Reference</p><p className="font-mono text-xs">{viewRecord.medicineRef}</p></div>}
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><StatusBadge record={viewRecord} /></div>

                {/* Traceability section */}
                <div className="col-span-2 bg-violet-50 border border-violet-200 rounded-lg p-3">
                  <p className="text-xs text-violet-700 uppercase font-semibold mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />Animal Traceability
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Treatment Scope</p>
                      <p className="font-semibold capitalize">
                        {viewRecord.treatmentScope === "individual" ? "Individual Animal" :
                         viewRecord.treatmentScope === "group" ? "Group / Batch" :
                         viewRecord.treatmentScope === "whole_herd" ? "Whole Herd" :
                         "—"}
                      </p>
                    </div>
                    {viewRecord.treatmentScope === "individual" && viewRecord.animalId && (
                      <div>
                        <p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Ear Tag</p>
                        <p className="font-semibold font-mono">
                          {(() => {
                            const a = animals.find(x => x.id === viewRecord.animalId);
                            return a?.earTagNumber ?? a?.tagNumber ?? `Animal #${viewRecord.animalId}`;
                          })()}
                        </p>
                      </div>
                    )}
                    {viewRecord.herdId && (
                      <div>
                        <p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Herd / Group</p>
                        <p className="font-semibold">{herds.find(h => h.id === viewRecord.herdId)?.name ?? `Herd #${viewRecord.herdId}`}</p>
                      </div>
                    )}
                    {viewRecord.treatedAnimalCount && (
                      <div>
                        <p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Animals Treated</p>
                        <p className="font-semibold">{viewRecord.treatedAnimalCount}</p>
                      </div>
                    )}
                    {viewRecord.treatedAnimalTags && (
                      <div className="col-span-2">
                        <p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Ear Tags / Animal IDs</p>
                        <p className="font-mono text-xs break-all">{viewRecord.treatedAnimalTags}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Administered Date</p><p>{formatDate(viewRecord.administeredDate)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Administered By</p><p>{viewRecord.administeredBy || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Dosage</p><p>{viewRecord.dosage || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Route</p><p>{viewRecord.administrationRoute || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Batch Number</p><p className="font-mono text-xs">{viewRecord.batchNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vet</p><p>{viewRecord.vetName || "—"}</p></div>
                {viewRecord.withdrawalPeriodDays != null && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Withdrawal Period</p><p>{viewRecord.withdrawalPeriodDays} days</p></div>}
                {viewRecord.withdrawalEndDate && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Withdrawal End</p><p>{formatDate(viewRecord.withdrawalEndDate)}</p></div>}
              </div>
              {viewRecord.reason && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Reason</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.reason}</p></div>}
              {viewRecord.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.notes}</p></div>}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil size={14} className="mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); } }}>
        <DialogContent style={{ maxWidth: "60rem" }}>
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
          <form onSubmit={handleSubmit} className="space-y-5 pt-1">

            {/* Treatment scope — the traceability section */}
            <div className="border border-violet-200 bg-violet-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />Animal Traceability (Red Tractor / VMR 2013 required)
              </p>
              <div className="flex gap-2 mb-4">
                {(["individual", "group", "whole_herd"] as TreatmentScope[]).map(scope => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, treatmentScope: scope, animalId: "", treatedAnimalCount: "", treatedAnimalTags: "" }))}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${form.treatmentScope === scope
                      ? "border-violet-500 bg-violet-100 text-violet-800"
                      : "border-border bg-white text-foreground/60 hover:border-violet-300"}`}
                  >
                    {scope === "individual" ? (
                      <span className="flex items-center justify-center gap-1.5"><User className="w-3.5 h-3.5" />Individual Animal</span>
                    ) : scope === "group" ? (
                      <span className="flex items-center justify-center gap-1.5"><Users className="w-3.5 h-3.5" />Group / Batch</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5"><Users className="w-3.5 h-3.5" />Whole Herd</span>
                    )}
                  </button>
                ))}
              </div>

              {form.treatmentScope === "individual" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Select Animal <span className="text-red-500">*</span></label>
                    {animals.length > 0 ? (
                      <select
                        className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        value={form.animalId}
                        onChange={e => setForm(f => ({ ...f, animalId: e.target.value }))}
                        required={form.treatmentScope === "individual"}
                      >
                        <option value="">Select animal by ear tag...</option>
                        {animals.map(a => <option key={a.id} value={a.id}>{animalLabel(a)}</option>)}
                      </select>
                    ) : (
                      <div>
                        <Input
                          placeholder="Enter ear tag number (e.g. UK123456/0001)"
                          value={form.treatedAnimalTags}
                          onChange={e => setForm(f => ({ ...f, treatedAnimalTags: e.target.value }))}
                          required={form.treatmentScope === "individual"}
                        />
                        <p className="text-xs text-foreground/50 mt-1">No animals registered — enter ear tag manually.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(form.treatmentScope === "group" || form.treatmentScope === "whole_herd") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Herd / Group <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                      value={form.herdId}
                      onChange={e => setForm(f => ({ ...f, herdId: e.target.value }))}
                      required={form.treatmentScope === "group" || form.treatmentScope === "whole_herd"}
                    >
                      <option value="">Select herd...</option>
                      {herds.map(h => <option key={h.id} value={h.id}>{h.name} ({h.type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">
                      Number of Animals Treated{form.treatmentScope === "whole_herd" && " (whole herd)"}
                    </label>
                    <Input
                      type="number" min="1"
                      placeholder="e.g. 42"
                      value={form.treatedAnimalCount}
                      onChange={e => setForm(f => ({ ...f, treatedAnimalCount: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">
                      Ear Tags / Animal IDs
                      <span className="ml-1 text-xs text-foreground/40 font-normal">
                        {form.treatmentScope === "whole_herd" ? "Optional — enter if you have a finite list" : "Recommended for Red Tractor compliance"}
                      </span>
                    </label>
                    <textarea
                      className="w-full min-h-[64px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
                      placeholder="e.g. UK123456/0001, UK123456/0002, UK123456/0003"
                      value={form.treatedAnimalTags}
                      onChange={e => setForm(f => ({ ...f, treatedAnimalTags: e.target.value }))}
                    />
                    <p className="text-xs text-foreground/40 mt-1">Comma-separated list. For small groups, listing individual ear tags provides the strongest audit trail.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Medicine details */}
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
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administered By</label>
                <Input placeholder="Name of person administering" value={form.administeredBy} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Date Administered <span className="text-red-500">*</span></label>
                <Input type="date" value={form.administeredDate} onChange={e => setForm(f => ({ ...f, administeredDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administration Route</label>
                <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={form.administrationRoute} onChange={e => setForm(f => ({ ...f, administrationRoute: e.target.value }))}>
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
                    Withdrawal ends: {formatDate(previewWdEnd)}
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
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                <Input placeholder="Any additional information..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
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
