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

const POULTRY_VACC_CATEGORIES: { value: string; label: string; products: string[] }[] = [
  { value: "ND", label: "Newcastle Disease (ND)", products: ["Nobilis ND Clone 30", "Nobilis ND Clone 45", "Nobilis ND Hitchner B1", "Nobilis ND Ma5+Clone30", "Avinew (La Sota)", "Hipraviar Clone 45", "Poulvac Bursa Plus ND", "La Sota (generic)", "Other — enter manually"] },
  { value: "IB", label: "Infectious Bronchitis (IB)", products: ["Nobilis IB Ma5", "Nobilis IB 4-91", "Nobilis IB H120", "Nobilis IB Multi+Clone30", "Hipraviar IB-H120", "Poulvac IB H52", "Vikavac IB", "Other — enter manually"] },
  { value: "Marek", label: "Marek's Disease", products: ["Nobilis Rismavac (HVT+Rispens)", "Nobilis Turkey Herpesvirus (HVT)", "Vectormune HVT NDV", "Rispens/CVI988", "Solvay Rispens", "HVT (generic)", "Other — enter manually"] },
  { value: "Gumboro", label: "Gumboro (IBD / Infectious Bursal Disease)", products: ["Nobilis Gumboro D78", "Nobilis Gumboro 228E", "Nobilis IBA", "Bursa-Vac", "TAD Gumboro vac", "Nobilis Gumboro Intervet", "Other — enter manually"] },
  { value: "aMPV", label: "Avian Metapneumovirus (aMPV / TRT)", products: ["Nobilis TRT", "Hipraviar TRT-C", "Poulvac TRT", "Biomune TRT", "Other — enter manually"] },
  { value: "ILT", label: "Infectious Laryngotracheitis (ILT)", products: ["Nobilis ILT", "TAD Laryngo vac", "Poulvac ILT", "Other — enter manually"] },
  { value: "EDS", label: "Egg Drop Syndrome (EDS)", products: ["Nobilis EDS", "ADS 76 (generic)", "Other — enter manually"] },
  { value: "AE", label: "Avian Encephalomyelitis / Fowl Typhoid (AE)", products: ["Nobilis AE+POX", "Poulvac AE Layervax", "AE Vac (generic)", "Other — enter manually"] },
  { value: "Salmonella", label: "Salmonella", products: ["Nobilis SalENT (live SE)", "AviPro Salmonella Vac E", "AviPro Salmonella Vac T", "Salenvac (inactivated)", "Salmovac 440", "Other — enter manually"] },
  { value: "Mycoplasma", label: "Mycoplasma (MG)", products: ["Nobilis MG 6/85", "Biomune MG-F36", "Other — enter manually"] },
  { value: "FowlPox", label: "Fowl Pox", products: ["Nobilis Pox", "Hipraviar Pox", "AE Vac+Pox combo", "Other — enter manually"] },
  { value: "Other", label: "Other", products: ["Other — enter manually"] },
];

const POULTRY_ADMIN_ROUTES = ["Drinking water", "Eye drop", "Spray (coarse)", "Spray (fine mist)", "Subcutaneous injection", "Intramuscular injection", "Wing web/stab", "In ovo", "Intranasal", "Other"];
const POULTRY_AGE_GROUPS = ["Day-old chicks", "Broilers", "Pullets", "Layers", "Breeders", "Turkeys", "Ducks", "All birds", "Other"];

export function PoultryVaccinationTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery({ queryKey: ["poultry-vaccination-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-vaccination-records`, { credentials: "include" }).then(r => r.json()) });
  const records: any[] = Array.isArray(q.data?.records) ? q.data.records : [];

  const empty = { vaccinationDate: new Date().toISOString().slice(0, 10), vaccinationCategory: "", vaccineProduct: "", customProduct: "", batchNumber: "", expiryDate: "", ageGroupTreated: "", numberTreated: "", doseVolume: "", administrationRoute: "", withdrawalPeriodDays: "0", nextDueDate: "", administeredBy: "", vetPrescribed: false, notes: "" };
  const [form, setForm] = useState({ ...empty });
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const selectedCategory = POULTRY_VACC_CATEGORIES.find(c => c.value === form.vaccinationCategory);
  const productOptions = selectedCategory?.products ?? [];
  const isCustomProduct = form.vaccineProduct === "Other — enter manually";

  const invalidate = () => qc.invalidateQueries({ queryKey: ["poultry-vaccination-records", farmId] });
  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/poultry-vaccination-records`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, vaccineProduct: b.vaccineProduct === "Other — enter manually" ? b.customProduct : b.vaccineProduct }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setForm({ ...empty }); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }: { id: number; b: any }) => fetch(`/api/farms/${farmId}/poultry-vaccination-records/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, vaccineProduct: b.vaccineProduct === "Other — enter manually" ? b.customProduct : b.vaccineProduct }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setEditRec(null); setForm({ ...empty }); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/poultry-vaccination-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { invalidate(); setDeleteId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
  const overdueAlerts = records.filter((r: any) => r.nextDueDate && new Date(r.nextDueDate) <= in30);

  function openEdit(r: any) {
    setEditRec(r);
    const knownProducts = POULTRY_VACC_CATEGORIES.find(c => c.value === r.vaccinationCategory)?.products ?? [];
    const productIsKnown = knownProducts.includes(r.vaccineProduct);
    setForm({ vaccinationDate: r.vaccinationDate?.slice(0, 10) ?? "", vaccinationCategory: r.vaccinationCategory ?? "", vaccineProduct: productIsKnown ? r.vaccineProduct : "Other — enter manually", customProduct: productIsKnown ? "" : (r.vaccineProduct ?? ""), batchNumber: r.batchNumber ?? "", expiryDate: r.expiryDate?.slice(0, 10) ?? "", ageGroupTreated: r.ageGroupTreated ?? "", numberTreated: r.numberTreated ? String(r.numberTreated) : "", doseVolume: r.doseVolume ?? "", administrationRoute: r.administrationRoute ?? "", withdrawalPeriodDays: r.withdrawalPeriodDays ? String(r.withdrawalPeriodDays) : "0", nextDueDate: r.nextDueDate?.slice(0, 10) ?? "", administeredBy: r.administeredBy ?? "", vetPrescribed: r.vetPrescribed ?? false, notes: r.notes ?? "" });
    setAddOpen(true);
  }

  const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const categoryLabel = (v: string) => POULTRY_VACC_CATEGORIES.find(c => c.value === v)?.label ?? v;

  return (
    <div className="space-y-4">
      {overdueAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-amber-800 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />Upcoming / Overdue Booster Alerts</p>
          {overdueAlerts.map((r: any) => {
            const due = new Date(r.nextDueDate); const overdue = due < today;
            return <p key={r.id} className={`text-xs ${overdue ? "text-red-700" : "text-amber-700"}`}>{overdue ? "✗ OVERDUE" : "⚠ Due soon"}: {r.vaccineProduct} ({categoryLabel(r.vaccinationCategory)}) — {fmtD(r.nextDueDate)}</p>;
          })}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{records.length} vaccination record{records.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => { setEditRec(null); setForm({ ...empty }); setAddOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Add Vaccination Record</Button>
      </div>
      {q.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : records.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No vaccination records. Red Tractor Poultry requires a vet-signed vaccination programme — record each administration event here.</p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs text-muted-foreground">{["Date","Category","Vaccine Product","Batch No.","Age Group","Num Treated","Route","Next Due","Docs",""].map(h => <th key={h} className="text-left py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {records.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-muted/30">
                <td className="py-2 pr-3 whitespace-nowrap">{fmtD(r.vaccinationDate)}</td>
                <td className="py-2 pr-3">{categoryLabel(r.vaccinationCategory)}</td>
                <td className="py-2 pr-3">{r.vaccineProduct}{r.vetPrescribed && <span className="ml-1 text-xs text-blue-600 font-medium">POM-V</span>}</td>
                <td className="py-2 pr-3 text-muted-foreground">{r.batchNumber || "—"}</td>
                <td className="py-2 pr-3">{r.ageGroupTreated || "—"}</td>
                <td className="py-2 pr-3">{r.numberTreated ?? "—"}</td>
                <td className="py-2 pr-3">{r.administrationRoute || "—"}</td>
                <td className="py-2 pr-3 whitespace-nowrap">{r.nextDueDate ? <span className={new Date(r.nextDueDate) < today ? "text-red-600 font-medium" : new Date(r.nextDueDate) <= in30 ? "text-amber-600 font-medium" : ""}>{fmtD(r.nextDueDate)}</span> : "—"}</td>
                <td className="py-2 pr-3"><DocAttach recordId={r.id} endpoint={`/api/farms/${farmId}/poultry-vaccination-records/${r.id}/document`} currentPath={r.documentPath} currentName={r.documentName} onAttached={invalidate} /></td>
                <td className="py-2 text-right whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...empty }); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 560 }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editRec ? "Edit Vaccination Record" : "Add Vaccination Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date *</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.vaccinationDate} onChange={e => setForm(f => ({ ...f, vaccinationDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Age Group</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.ageGroupTreated} onChange={e => setForm(f => ({ ...f, ageGroupTreated: e.target.value }))}>
                  <option value="">— select —</option>
                  {POULTRY_AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="text-xs">Disease Category *</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.vaccinationCategory} onChange={e => setForm(f => ({ ...f, vaccinationCategory: e.target.value, vaccineProduct: "", customProduct: "" }))}>
                <option value="">— select category —</option>
                {POULTRY_VACC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            {form.vaccinationCategory && (
              <div><Label className="text-xs">Vaccine Product *</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.vaccineProduct} onChange={e => setForm(f => ({ ...f, vaccineProduct: e.target.value }))}>
                  <option value="">— select product —</option>
                  {productOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            {isCustomProduct && <div><Label className="text-xs">Product Name (manual entry) *</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" placeholder="Enter vaccine product name" value={form.customProduct} onChange={e => setForm(f => ({ ...f, customProduct: e.target.value }))} /></div>}
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Batch Number</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
              <div><Label className="text-xs">Expiry Date</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Number Treated</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.numberTreated} onChange={e => setForm(f => ({ ...f, numberTreated: e.target.value }))} /></div>
              <div><Label className="text-xs">Dose Volume (ml)</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" placeholder="e.g. 0.2" value={form.doseVolume} onChange={e => setForm(f => ({ ...f, doseVolume: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Administration Route</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.administrationRoute} onChange={e => setForm(f => ({ ...f, administrationRoute: e.target.value }))}>
                <option value="">— select —</option>
                {POULTRY_ADMIN_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Withdrawal Period (days)</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.withdrawalPeriodDays} onChange={e => setForm(f => ({ ...f, withdrawalPeriodDays: e.target.value }))} /></div>
              <div><Label className="text-xs">Next Due Date</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Administered By</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.administeredBy} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="pv-vet" checked={form.vetPrescribed} onChange={e => setForm(f => ({ ...f, vetPrescribed: e.target.checked }))} /><label htmlFor="pv-vet" className="text-sm cursor-pointer">Vet prescribed (POM-V product)</label></div>
            <div><Label className="text-xs">Notes</Label><textarea className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...empty }); }}>Cancel</Button>
            <Button disabled={!form.vaccinationDate || !form.vaccinationCategory || (!form.vaccineProduct || (isCustomProduct && !form.customProduct)) || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}><DialogHeader><DialogTitle>Delete Vaccination Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this vaccination record?</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Poultry Disease Monitoring Tab ───────────────────────────────────────────
