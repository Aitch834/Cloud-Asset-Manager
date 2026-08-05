import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatDateLong, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";

const CASUALTY_METHODS = [
  { value: "captive_bolt", label: "Captive Bolt (+ pithing/sticking)" },
  { value: "free_bullet", label: "Free Bullet" },
  { value: "barbiturate_injection", label: "Barbiturate Injection (Vet)" },
  { value: "other", label: "Other" },
];
const CARCASE_DISPOSAL = [
  { value: "licensed_contractor", label: "Licensed Fallen Stock Contractor" },
  { value: "hunt_kennel", label: "Hunt Kennel / Knacker" },
  { value: "incineration", label: "Licensed Incineration" },
  { value: "rendering", label: "Rendering Plant" },
  { value: "burial_permitted", label: "On-farm Burial (EA Permit)" },
  { value: "other", label: "Other permitted method" },
];

export function CasualtySlaughterSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/casualty-slaughter/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["casualty-slaughter", farmId] }); },
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["casualty-slaughter", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/casualty-slaughter`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const [yearFilterCasualty, setYearFilterCasualty] = usePersistedFilter({ page: "livestock-casualty", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsCasualty = useMemo(() => Array.from(new Set((records as any[]).map((r: any) => String(r.eventDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredCasualtyRecords = yearFilterCasualty === "all" ? (records as any[]) : (records as any[]).filter((r: any) => String(r.eventDate ?? "").startsWith(yearFilterCasualty));

  const { data: fallenContractors = [] } = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const { data: animalsData } = useQuery<{ records: { id: number; earTagNumber: string | null; species: string; breed: string | null; dateOfBirth: string | null; sex: string | null }[] }>({
    queryKey: ["farm-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  const animals = animalsData?.records ?? [];

  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  function handleEarTagChange(tag: string) {
    const matched = animals.find(a => a.earTagNumber && a.earTagNumber.toLowerCase() === tag.toLowerCase());
    if (matched) {
      const agePart = matched.dateOfBirth
        ? `${Math.floor((Date.now() - new Date(matched.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}yo `
        : "";
      const sexPart = matched.sex ? matched.sex + " " : "";
      const breedPart = matched.breed ?? matched.species;
      setForm((f: any) => ({ ...f, animalEarTag: tag, species: matched.species || f.species, ageOrDescription: `${agePart}${sexPart}${breedPart}`.trim() || f.ageOrDescription }));
    } else {
      set("animalEarTag", tag);
    }
  }

  function handleMethodChange(v: string) {
    setForm((f: any) => ({ ...f, method: v, veterinaryInvolved: v === "barbiturate_injection" ? true : f.veterinaryInvolved }));
  }

  function openAdd() { setEditing(null); setForm({ species: "Cattle", method: "captive_bolt", veterinaryInvolved: false }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  function printCasualtyRegister() {
    const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = (records as any[]).map((r: any) => `<tr>
      <td>${fmtD(r.eventDate)}</td>
      <td>${r.animalEarTag ?? "—"}</td>
      <td>${r.species}</td>
      <td>${r.ageOrDescription ?? "—"}</td>
      <td>${r.reasonForSlaughter ?? "—"}</td>
      <td>${CASUALTY_METHODS.find((m: any) => m.value === r.method)?.label ?? r.method ?? "—"}</td>
      <td>${r.veterinaryInvolved ? (r.vetName ?? r.performedBy ?? "—") : (r.performedBy ?? "—")}</td>
      <td>${r.veterinaryInvolved ? (r.rcvsNumber ?? "—") : (r.waskWatokCertRef ?? "—")}</td>
      <td>${CARCASE_DISPOSAL.find((c: any) => c.value === r.carcaseDisposalMethod)?.label ?? r.carcaseDisposalMethod ?? "—"}</td>
      <td>${r.notes ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Casualty / Emergency Slaughter Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Casualty / Emergency Slaughter Register</h1>
<h2>On-Farm Emergency Killing Record — Red Tractor · ${records.length} event${records.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Ear Tag</th><th>Species</th><th>Age / Description</th><th>Reason</th><th>Method</th><th>Performed By</th><th>WASK/WATOK / RCVS No.</th><th>Disposal</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Red Tractor requires a record of every on-farm emergency killing. The person carrying out the slaughter must hold a valid WASK/WATOK certificate, or where a barbiturate injection is used, the attending vet must be RCVS registered. Records must be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  async function save() {
    const payload = { ...form };
    if (payload.veterinaryInvolved && !payload.performedBy && payload.vetName) {
      payload.performedBy = payload.vetName;
    }
    const url = editing ? `/api/farms/${farmId}/casualty-slaughter/${editing.id}` : `/api/farms/${farmId}/casualty-slaughter`;
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    qc.invalidateQueries({ queryKey: ["casualty-slaughter", farmId] });
    qc.invalidateQueries({ queryKey: ["farm-animals", farmId] });
    setOpen(false);
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const matchedAnimal = (tag: string) => animals.find(a => a.earTagNumber?.toLowerCase() === tag?.toLowerCase());

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Casualty / Emergency Slaughter Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor requires a record of every on-farm emergency killing. The person carrying out the slaughter must hold a valid WASK/WATOK certificate.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterCasualty} onValueChange={setYearFilterCasualty}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsCasualty.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          {records.length > 0 && <Button size="sm" variant="outline" onClick={printCasualtyRegister}><Printer className="w-3.5 h-3.5 mr-1" />Print Register</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Event</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : filteredCasualtyRecords.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="font-medium text-gray-600">No casualty slaughter events recorded</p>
          <p className="text-sm text-gray-400 mt-1">Record emergency on-farm killings here, separate from natural mortality.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Date","Ear Tag","Species","Reason","Method","Performed By","WASK/WATOK / RCVS","Disposal",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {filteredCasualtyRecords.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.eventDate)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.animalEarTag || "—"}</td>
                  <td className="px-3 py-2">{r.species}</td>
                  <td className="px-3 py-2 max-w-[140px] truncate" title={r.reasonForSlaughter}>{r.reasonForSlaughter}</td>
                  <td className="px-3 py-2 text-xs">{CASUALTY_METHODS.find(m => m.value === r.method)?.label ?? r.method}</td>
                  <td className="px-3 py-2">{r.veterinaryInvolved ? (r.vetName || r.performedBy) : r.performedBy}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.veterinaryInvolved ? (r.rcvsNumber || "—") : (r.waskWatokCertRef || "—")}</td>
                  <td className="px-3 py-2 text-xs">{CARCASE_DISPOSAL.find(c => c.value === r.carcaseDisposalMethod)?.label ?? r.carcaseDisposalMethod ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => setPendingDelete(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Casualty Slaughter Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Event Date *</Label><Input type="date" value={form.eventDate || ""} onChange={e => set("eventDate", e.target.value)} /></div>
            <div><Label>Species *</Label>
              <Select value={form.species || "Cattle"} onValueChange={v => set("species", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Cattle","Sheep","Pig","Goat","Other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ear Tag / ID</Label>
              <Input value={form.animalEarTag || ""} onChange={e => handleEarTagChange(e.target.value)} placeholder="UK ear tag number" />
              {form.animalEarTag && matchedAnimal(form.animalEarTag) && (
                <p className="text-xs text-green-700 mt-1">Matched — breed &amp; age auto-filled from animal register.</p>
              )}
            </div>
            <div>
              <Label>Breed / Age</Label>
              <Input value={form.ageOrDescription || ""} onChange={e => set("ageOrDescription", e.target.value)} placeholder="e.g. 3yo Holstein cow" />
            </div>
            <div className="col-span-2"><Label>Reason for Slaughter *</Label><Input value={form.reasonForSlaughter || ""} onChange={e => set("reasonForSlaughter", e.target.value)} placeholder="e.g. Severe fracture — irretrievable" /></div>
            <div><Label>Method *</Label>
              <Select value={form.method || "captive_bolt"} onValueChange={handleMethodChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CASUALTY_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Witness</Label><Input value={form.witnessName || ""} onChange={e => set("witnessName", e.target.value)} /></div>
            <div className="col-span-2 flex items-center gap-2 pt-1">
              <input type="checkbox" id="vetinv" checked={!!form.veterinaryInvolved} onChange={e => set("veterinaryInvolved", e.target.checked)} className="rounded" />
              <Label htmlFor="vetinv">Veterinary surgeon involved</Label>
            </div>
            {form.veterinaryInvolved ? (
              <>
                <div><Label>Vet Name *</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Full name" /></div>
                <div><Label>RCVS Number</Label><Input value={form.rcvsNumber || ""} onChange={e => set("rcvsNumber", e.target.value)} placeholder="e.g. 1234567" /></div>
              </>
            ) : (
              <>
                <div><Label>Performed By *</Label><StaffSelect value={form.performedBy || ""} onChange={v => set("performedBy", v)} staffNames={staffNames} loading={staffLoading} /></div>
                <div><Label>WASK/WATOK Certificate Ref</Label><Input value={form.waskWatokCertRef || ""} onChange={e => set("waskWatokCertRef", e.target.value)} placeholder="Certificate number" /></div>
              </>
            )}
            <div><Label>Carcase Disposal Method</Label>
              <Select value={form.carcaseDisposalMethod || "__none__"} onValueChange={v => set("carcaseDisposalMethod", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select disposal method" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not yet arranged</SelectItem>{CARCASE_DISPOSAL.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Disposal Contractor</Label>
              <Select value={String(form.carcaseDisposalContractorId || "__none__")} onValueChange={v => set("carcaseDisposalContractorId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select contractor" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— None / N/A</SelectItem>{fallenContractors.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Carcase Collection Date</Label><Input type="date" value={form.carcaseCollectionDate || ""} onChange={e => set("carcaseCollectionDate", e.target.value)} /></div>
            <div><Label>Disposal / Collection Note Ref</Label><Input value={form.carcaseDisposalRef || ""} onChange={e => set("carcaseDisposalRef", e.target.value)} placeholder="NFAS cert / waste transfer note ref" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete casualty slaughter record"
        message="Delete this casualty slaughter record?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteMut}
        onConfirm={() => { if (pendingDelete !== null) deleteMut.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) }); }}
        onCancel={() => { setPendingDelete(null); deleteMut.reset(); }}
      />
    </div>
  );
}

// ─── Incoming Stock Isolation Register ────────────────────────────────────────
