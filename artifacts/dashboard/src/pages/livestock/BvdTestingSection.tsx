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

// ─── BVD Testing Section ──────────────────────────────────────────────────────
const BVD_TEST_TYPES = [
  { value: "ear_notch_pcr", label: "Ear Notch PCR" },
  { value: "blood_elisa", label: "Blood ELISA" },
  { value: "milk_elisa", label: "Individual Milk ELISA" },
  { value: "blood_pcr", label: "Blood PCR" },
  { value: "bulk_milk_pcr", label: "Bulk Milk PCR" },
];
const BVD_RESULTS = [
  { value: "negative", label: "Negative" },
  { value: "positive", label: "Positive" },
  { value: "inconclusive", label: "Inconclusive" },
  { value: "pi_identified", label: "PI Animal Identified" },
];
const BVD_ACCRED = [
  { value: "not_accredited", label: "Not Accredited" },
  { value: "not_negative", label: "Not BVD-Negative" },
  { value: "negative_not_vaccinating", label: "BVD-Negative (Not Vaccinating)" },
  { value: "negative_vaccinating", label: "BVD-Negative (Vaccinating)" },
];
const BVD_SCHEMES = [
  { value: "CHeCS", label: "CHeCS Cattle Health Certification Standards" },
  { value: "ScotEID", label: "ScotEID" },
  { value: "other", label: "Other scheme" },
  { value: "none", label: "No scheme — independent testing" },
];

export function BvdTestingSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/bvd-tests/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bvd-tests", farmId] }); },
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["bvd-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const [yearFilterBvd, setYearFilterBvd] = usePersistedFilter({ page: "livestock-bvd", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsBvd = useMemo(() => Array.from(new Set((records as any[]).map((r: any) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredBvdRecords = yearFilterBvd === "all" ? (records as any[]) : (records as any[]).filter((r: any) => String(r.testDate ?? "").startsWith(yearFilterBvd));

  const { data: herdsRaw } = useQuery<{ records: any[] } | any[] | null>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()),
    enabled: !!farmId,
  });
  // Normalise: HerdsSection (default tab) caches { records: Herd[] }; if this
  // queryFn runs first the API returns the same shape.  Guard Array.isArray so
  // the component also handles a future schema change without crashing.
  const herds: any[] = Array.isArray(herdsRaw) ? herdsRaw : ((herdsRaw as any)?.records ?? []);

  function openAdd() { setEditing(null); setForm({ result: "negative" }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  function printBvdRegister() {
    const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = (records as any[]).map((r: any) => `<tr>
      <td>${fmtD(r.testDate)}</td>
      <td>${BVD_TEST_TYPES.find((t: any) => t.value === r.testType)?.label ?? r.testType ?? "—"}</td>
      <td>${herds.find((h: any) => h.id === r.herdId)?.name ?? "—"}</td>
      <td>${r.result}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.piAnimalsFound ?? 0}</td>
      <td>${r.labName ?? "—"}</td>
      <td>${r.labRef ?? "—"}</td>
      <td>${BVD_ACCRED.find((a: any) => a.value === r.accreditationStatus)?.label ?? "—"}</td>
      <td>${fmtD(r.nextTestDue)}</td>
      <td>${r.vetName ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>BVD Testing Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>BVD Testing Register</h1>
<h2>Bovine Viral Diarrhoea Monitoring — Red Tractor Beef &amp; Dairy · ${records.length} record${records.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Result</th><th>Animals Tested</th><th>PI Found</th><th>Lab</th><th>Lab Ref</th><th>Accreditation Status</th><th>Next Test Due</th><th>Vet</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Red Tractor Beef &amp; Dairy: BVD monitoring records must be maintained and available at audit. Persistent Infectees (PIs) must be removed promptly. Retain records for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  async function save() {
    const url = editing ? `/api/farms/${farmId}/bvd-tests/${editing.id}` : `/api/farms/${farmId}/bvd-tests`;
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: ["bvd-tests", farmId] });
    setOpen(false);
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const resultBadge = (r: string) => {
    const colours: Record<string, string> = { negative: "bg-green-100 text-green-800", positive: "bg-red-100 text-red-800", pi_identified: "bg-red-200 text-red-900", inconclusive: "bg-amber-100 text-amber-800" };
    const label = BVD_RESULTS.find(x => x.value === r)?.label ?? r;
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[r] ?? "bg-gray-100 text-gray-700"}`}>{label}</span>;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">BVD Testing Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor Beef &amp; Dairy requires documented BVD monitoring. Record individual tests, PI findings, and herd accreditation status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterBvd} onValueChange={setYearFilterBvd}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsBvd.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          {records.length > 0 && <Button size="sm" variant="outline" onClick={printBvdRegister}><Printer className="w-3.5 h-3.5 mr-1" />Print Register</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Test</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : filteredBvdRecords.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="font-medium text-gray-600">No BVD test records yet</p>
          <p className="text-sm text-gray-400 mt-1">Add test results including ear notch, blood ELISA, or bulk milk PCR tests.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Test Date","Test Type","Herd","Result","Animals Tested","PI Found","Accreditation Status","Next Test Due",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {filteredBvdRecords.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.testDate)}</td>
                  <td className="px-3 py-2">{BVD_TEST_TYPES.find(t => t.value === r.testType)?.label ?? r.testType}</td>
                  <td className="px-3 py-2">{herds.find((h: any) => h.id === r.herdId)?.name ?? "—"}</td>
                  <td className="px-3 py-2">{resultBadge(r.result)}</td>
                  <td className="px-3 py-2">{r.animalsTestedCount ?? "—"}</td>
                  <td className="px-3 py-2">{r.piAnimalsFound ?? 0}</td>
                  <td className="px-3 py-2 text-xs">{BVD_ACCRED.find(a => a.value === r.accreditationStatus)?.label ?? "—"}</td>
                  <td className="px-3 py-2">{fmtDate(r.nextTestDue)}</td>
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
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} BVD Test Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Test Date *</Label><Input type="date" value={form.testDate || ""} onChange={e => set("testDate", e.target.value)} /></div>
            <div><Label>Test Type *</Label>
              <Select value={form.testType || ""} onValueChange={v => set("testType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{BVD_TEST_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Herd</Label>
              <Select value={String(form.herdId || "__none__")} onValueChange={v => set("herdId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select herd" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— All herds</SelectItem>{herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Result *</Label>
              <Select value={form.result || "negative"} onValueChange={v => set("result", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BVD_RESULTS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Lab Name</Label><Input value={form.labName || ""} onChange={e => set("labName", e.target.value)} placeholder="e.g. SRUC, Biobest" /></div>
            <div><Label>Lab Reference</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>Animals Tested</Label><Input type="number" min="0" value={form.animalsTestedCount ?? ""} onChange={e => set("animalsTestedCount", e.target.value)} /></div>
            <div><Label>PI Animals Found</Label><Input type="number" min="0" value={form.piAnimalsFound ?? 0} onChange={e => set("piAnimalsFound", e.target.value)} /></div>
            <div><Label>Monitoring Scheme</Label>
              <Select value={form.monitoringScheme || "__none__"} onValueChange={v => set("monitoringScheme", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— None</SelectItem>{BVD_SCHEMES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Accreditation Status</Label>
              <Select value={form.accreditationStatus || "__none__"} onValueChange={v => set("accreditationStatus", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not set</SelectItem>{BVD_ACCRED.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Scheme Membership No.</Label><Input value={form.schemeMembershipNumber || ""} onChange={e => set("schemeMembershipNumber", e.target.value)} /></div>
            <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
            <div><Label>Next Test Due</Label><Input type="date" value={form.nextTestDue || ""} onChange={e => set("nextTestDue", e.target.value)} /></div>
            <div className="col-span-2"><Label>Actions Taken</Label><Textarea rows={2} value={form.actionsTaken || ""} onChange={e => set("actionsTaken", e.target.value)} placeholder="PI removal, vaccination decisions, biosecurity changes…" /></div>
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
        title="Delete BVD test record"
        message="Delete this BVD test record?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteMut}
        onConfirm={() => { if (pendingDelete !== null) deleteMut.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) }); }}
        onCancel={() => { setPendingDelete(null); deleteMut.reset(); }}
      />
    </div>
  );
}

// ─── Casualty / Emergency Slaughter Section ───────────────────────────────────
