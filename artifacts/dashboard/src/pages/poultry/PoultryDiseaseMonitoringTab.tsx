// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

const POULTRY_MONITORING_TYPES = [
  { value: "AI", label: "Avian Influenza (AI) Surveillance" },
  { value: "Marek", label: "Marek's Disease Monitoring" },
  { value: "ND", label: "Newcastle Disease Serology" },
  { value: "MG", label: "Mycoplasma gallisepticum (MG) Surveillance" },
  { value: "IB", label: "Infectious Bronchitis Typing" },
  { value: "ART", label: "Avian Rhinotracheitis (ART) Surveillance" },
  { value: "Salmonella serology", label: "Salmonella Serology (non-NCP)" },
  { value: "General serology", label: "General Serology / Antibody Profiling" },
];

const POULTRY_FLOCK_STATUSES: { value: string; label: string; colour: string }[] = [
  { value: "negative", label: "Negative / Clear", colour: "bg-green-100 text-green-800 border-green-200" },
  { value: "low_positive", label: "Low Positive", colour: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "positive", label: "Positive", colour: "bg-red-100 text-red-800 border-red-200" },
  { value: "inconclusive", label: "Inconclusive", colour: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "pending", label: "Pending — awaiting results", colour: "bg-gray-100 text-gray-700 border-gray-200" },
];

export function PoultryDiseaseMonitoringTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery({ queryKey: ["poultry-disease-monitoring", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-disease-monitoring`, { credentials: "include" }).then(r => r.json()) });
  const records: any[] = Array.isArray(q.data?.records) ? q.data.records : [];

  const empty = { monitoringDate: new Date().toISOString().slice(0, 10), monitoringType: "", testingBody: "", numberOfSamples: "", positiveResults: "0", negativeResults: "0", flockStatus: "", aiRiskLevel: "", actionsTaken: "", nextTestDue: "", notes: "" };
  const [form, setForm] = useState({ ...empty });
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["poultry-disease-monitoring", farmId] });
  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/poultry-disease-monitoring`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setForm({ ...empty }); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }: { id: number; b: any }) => fetch(`/api/farms/${farmId}/poultry-disease-monitoring/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setEditRec(null); setForm({ ...empty }); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/poultry-disease-monitoring/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { invalidate(); setDeleteId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  function openEdit(r: any) {
    setEditRec(r);
    setForm({ monitoringDate: r.monitoringDate?.slice(0, 10) ?? "", monitoringType: r.monitoringType ?? "", testingBody: r.testingBody ?? "", numberOfSamples: r.numberOfSamples ? String(r.numberOfSamples) : "", positiveResults: r.positiveResults ? String(r.positiveResults) : "0", negativeResults: r.negativeResults ? String(r.negativeResults) : "0", flockStatus: r.flockStatus ?? "", aiRiskLevel: r.aiRiskLevel ?? "", actionsTaken: r.actionsTaken ?? "", nextTestDue: r.nextTestDue?.slice(0, 10) ?? "", notes: r.notes ?? "" });
    setAddOpen(true);
  }

  const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const typeLabel = (v: string) => POULTRY_MONITORING_TYPES.find(t => t.value === v)?.label ?? v;
  const statusInfo = (v: string) => POULTRY_FLOCK_STATUSES.find(s => s.value === v);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{records.length} monitoring record{records.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => { setEditRec(null); setForm({ ...empty }); setAddOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Add Monitoring Record</Button>
      </div>
      {q.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : records.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No disease monitoring records. Use this register to record AI surveillance, Marek's monitoring, ND serology, MG surveillance, IB typing, and general antibody profiling results.</p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs text-muted-foreground">{["Date","Monitoring Type","Testing Body","Samples","Positive","Negative","Flock Status","AI Risk","Next Test","Docs",""].map(h => <th key={h} className="text-left py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {records.map((r: any) => {
              const si = statusInfo(r.flockStatus);
              return (
                <tr key={r.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 pr-3 whitespace-nowrap">{fmtD(r.monitoringDate)}</td>
                  <td className="py-2 pr-3">{typeLabel(r.monitoringType)}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.testingBody || "—"}</td>
                  <td className="py-2 pr-3">{r.numberOfSamples ?? "—"}</td>
                  <td className="py-2 pr-3">{r.positiveResults ?? "—"}</td>
                  <td className="py-2 pr-3">{r.negativeResults ?? "—"}</td>
                  <td className="py-2 pr-3">{si ? <span className={`inline-block rounded px-1.5 py-0.5 text-xs border font-medium ${si.colour}`}>{si.label}</span> : "—"}</td>
                  <td className="py-2 pr-3">{r.aiRiskLevel ? <span className={`inline-block rounded px-1.5 py-0.5 text-xs border font-medium ${r.aiRiskLevel === "low" ? "bg-green-100 text-green-800 border-green-200" : r.aiRiskLevel === "medium" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"}`}>{r.aiRiskLevel.charAt(0).toUpperCase() + r.aiRiskLevel.slice(1)}</span> : "—"}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{fmtD(r.nextTestDue)}</td>
                  <td className="py-2 pr-3"><DocAttach recordId={r.id} endpoint={`/api/farms/${farmId}/poultry-disease-monitoring/${r.id}/document`} currentPath={r.documentPath} currentName={r.documentName} onAttached={invalidate} /></td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...empty }); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 560 }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editRec ? "Edit Monitoring Record" : "Add Monitoring Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Monitoring Date *</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.monitoringDate} onChange={e => setForm(f => ({ ...f, monitoringDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Monitoring Type *</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.monitoringType} onChange={e => setForm(f => ({ ...f, monitoringType: e.target.value }))}>
                  <option value="">— select —</option>
                  {POULTRY_MONITORING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="text-xs">Testing Body / Laboratory</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.testingBody} onChange={e => setForm(f => ({ ...f, testingBody: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Samples</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.numberOfSamples} onChange={e => setForm(f => ({ ...f, numberOfSamples: e.target.value }))} /></div>
              <div><Label className="text-xs">Positive</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.positiveResults} onChange={e => setForm(f => ({ ...f, positiveResults: e.target.value }))} /></div>
              <div><Label className="text-xs">Negative</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.negativeResults} onChange={e => setForm(f => ({ ...f, negativeResults: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Flock Status</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.flockStatus} onChange={e => setForm(f => ({ ...f, flockStatus: e.target.value }))}>
                  <option value="">— select —</option>
                  {POULTRY_FLOCK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {form.monitoringType === "AI" && (
                <div><Label className="text-xs">AI Risk Level</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.aiRiskLevel} onChange={e => setForm(f => ({ ...f, aiRiskLevel: e.target.value }))}>
                    <option value="">— select —</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}
            </div>
            <div><Label className="text-xs">Next Test Due</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.nextTestDue} onChange={e => setForm(f => ({ ...f, nextTestDue: e.target.value }))} /></div>
            <div><Label className="text-xs">Actions Taken</Label><textarea className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" rows={2} value={form.actionsTaken} onChange={e => setForm(f => ({ ...f, actionsTaken: e.target.value }))} /></div>
            <div><Label className="text-xs">Notes</Label><textarea className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...empty }); }}>Cancel</Button>
            <Button disabled={!form.monitoringDate || !form.monitoringType || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}><DialogHeader><DialogTitle>Delete Monitoring Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this disease monitoring record?</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Inter-Site Transfers Tab ─────────────────────────────────────────────────
