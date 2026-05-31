import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, Eye, FileDown, Droplets } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

function fmt(v?: string | null) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return v; }
}

function today() { return new Date().toISOString().slice(0, 10); }

// SCC badge — sheep regulatory limit is 1,500,000 cells/mL
function SheepSccBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const ok = v < 750;
  const warn = v >= 750 && v < 1500;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL {v >= 1500 ? "⚠ Exceeds 1,500k limit" : ""}
    </span>
  );
}

function OutcomeBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const map: Record<string, string> = { cured: "bg-green-100 text-green-800", recovered: "bg-green-100 text-green-800", "dried-off": "bg-blue-100 text-blue-800", culled: "bg-red-100 text-red-800", chronic: "bg-amber-100 text-amber-800", ongoing: "bg-yellow-100 text-yellow-800" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || "bg-gray-100 text-gray-700"}`}>{v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ")}</span>;
}

function BcsBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const n = parseFloat(v);
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${n >= 2.5 && n <= 3.5 ? "bg-green-100 text-green-800" : n < 2.5 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{v}</span>;
}

function ResultBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const cls = v.toLowerCase().includes("neg") || v.toLowerCase() === "clear" ? "bg-green-100 text-green-800" : v.toLowerCase().includes("pos") ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{v}</span>;
}

type Tab = "milk" | "mastitis" | "kidding" | "bcs" | "tank" | "mv" | "assurance";

export default function SheepDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("milk");
  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Sheep Dairy">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sheep Dairy Records</h1>
          <p className="text-gray-500 text-sm mt-1">
            British Sheep Dairying Association compliance — milk recording with SCC monitoring (1,500,000 cells/mL regulatory limit), mastitis, lambing records with LIS tagging, body condition, bulk tank hygiene, and Maedi-Visna monitoring.
          </p>
        </div>
        <TabBar>
          <TabButton active={tab === "milk"} onClick={() => setTab("milk")}>Milk Collections</TabButton>
          <TabButton active={tab === "mastitis"} onClick={() => setTab("mastitis")}>Mastitis</TabButton>
          <TabButton active={tab === "kidding"} onClick={() => setTab("kidding")}>Lambing Records</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "mv"} onClick={() => setTab("mv")}>Maedi-Visna</TabButton>
          <TabButton active={tab === "assurance"} onClick={() => setTab("assurance")}>Assurance</TabButton>
        </TabBar>
        <div className="mt-6">
          {tab === "milk" && <MilkTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "kidding" && <KiddingTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "mv" && <MvTab farmId={farmId} />}
          {tab === "assurance" && <AssuranceTab />}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Milk Collections ──────────────────────────────────────────────────────────

interface MilkRecord {
  id: number; recordDate: string; sessionType?: string | null; yieldLitres?: string | null;
  milkBuyer?: string | null; collectorReference?: string | null;
  sccThousands?: number | null; tbcCfuMl?: number | null; fatPercent?: string | null; proteinPercent?: string | null;
  milkTemperatureCelsius?: string | null; antibioticResidueTestResult?: string | null;
  abrTestKitLot?: string | null;
  buyerLabResultsStatus?: string | null; buyerSccThousands?: number | null;
  buyerFatPercent?: string | null; buyerProteinPercent?: string | null;
  pencePerLitre?: string | null; netPaymentPence?: number | null; notes?: string | null;
}

function MilkTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MilkRecord | null>(null);
  const [viewRec, setViewRec] = useState<MilkRecord | null>(null);
  const blank: Partial<MilkRecord> = { recordDate: today(), sessionType: "morning" };
  const [form, setForm] = useState<Partial<MilkRecord>>(blank);
  const set = (k: keyof MilkRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-milk", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/milk-records`)).then(r => r.json()) });
  const records: MilkRecord[] = data?.records ?? [];

  const totalYield = records.reduce((s, r) => s + (parseFloat(r.yieldLitres || "0") || 0), 0);
  const sccReadings = records.map(r => r.buyerSccThousands ?? r.sccThousands).filter((v): v is number => v != null);
  const avgScc = sccReadings.length ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;

  const save = useMutation({
    mutationFn: (body: Partial<MilkRecord>) => fetch(api(`farms/${farmId}/sheep-dairy/milk-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-milk", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Record added" }); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-dairy/milk-records/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-milk", farmId] }); toast({ title: "Record deleted" }); },
  });

  function openAdd() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(r: MilkRecord) { setEditing(r); setForm(r); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Total Yield (all records)</p><p className="text-2xl font-bold text-blue-800">{totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 })}<span className="text-sm font-normal ml-1">L</span></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Avg SCC (k/mL)</p><p className={`text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1500 ? "text-red-700" : avgScc > 750 ? "text-amber-700" : "text-green-700"}`}>{avgScc != null ? avgScc.toLocaleString() : "—"}</p><p className="text-xs text-gray-400">UK limit: 1,500k cells/mL</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Records</p><p className="text-2xl font-bold text-gray-800">{records.length}</p></CardContent></Card>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">Milk Collection Records</h2>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><Droplets className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No milk records yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Session</th><th className="py-2 px-3 text-left">Yield (L)</th><th className="py-2 px-3 text-left">SCC</th><th className="py-2 px-3 text-left">Fat%</th><th className="py-2 px-3 text-left">Protein%</th><th className="py-2 px-3 text-left">ABR</th><th className="py-2 px-3 text-left">Buyer</th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{fmt(r.recordDate)}</td>
                  <td className="py-2 px-3 capitalize">{r.sessionType || "—"}</td>
                  <td className="py-2 px-3">{r.yieldLitres ? parseFloat(r.yieldLitres).toLocaleString() : "—"}</td>
                  <td className="py-2 px-3"><SheepSccBadge v={r.buyerSccThousands ?? r.sccThousands} /></td>
                  <td className="py-2 px-3">{r.buyerFatPercent ?? r.fatPercent ?? "—"}</td>
                  <td className="py-2 px-3">{r.buyerProteinPercent ?? r.proteinPercent ?? "—"}</td>
                  <td className="py-2 px-3">{r.antibioticResidueTestResult ? <span className={`px-2 py-0.5 rounded-full text-xs ${r.antibioticResidueTestResult === "positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{r.antibioticResidueTestResult}</span> : "—"}</td>
                  <td className="py-2 px-3 text-gray-500">{r.milkBuyer || "—"}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader><DialogTitle>Milk Record — {fmt(viewRec.recordDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Session</p><p className="font-medium capitalize">{viewRec.sessionType || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Yield (L)</p><p className="font-medium">{viewRec.yieldLitres || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC (on-farm, k/mL)</p><p className="font-medium"><SheepSccBadge v={viewRec.sccThousands} /></p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer SCC (k/mL)</p><p className="font-medium"><SheepSccBadge v={viewRec.buyerSccThousands} /></p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fat%</p><p className="font-medium">{viewRec.buyerFatPercent ?? viewRec.fatPercent ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protein%</p><p className="font-medium">{viewRec.buyerProteinPercent ?? viewRec.proteinPercent ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Temperature (°C)</p><p className="font-medium">{viewRec.milkTemperatureCelsius || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Result</p><p className="font-medium capitalize">{viewRec.antibioticResidueTestResult || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Buyer</p><p className="font-medium">{viewRec.milkBuyer || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collector Ref</p><p className="font-medium">{viewRec.collectorReference || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer Lab Status</p><p className="font-medium capitalize">{viewRec.buyerLabResultsStatus || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Payment</p><p className="font-medium">{viewRec.netPaymentPence != null ? `£${(viewRec.netPaymentPence / 100).toFixed(2)}` : "—"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="sheep-dairy-milk" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRec(null)}>Close</Button>
              <Button onClick={() => { openEdit(viewRec); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Milk Record" : "Add Milk Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Date *</Label><Input type="date" value={String(form.recordDate || "").slice(0, 10)} onChange={e => set("recordDate", e.target.value)} /></div>
            <div><Label>Session</Label>
              <Select value={form.sessionType || "__none__"} onValueChange={v => set("sessionType", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="full-day">Full day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Yield (litres)</Label><Input type="number" step="0.1" value={form.yieldLitres || ""} onChange={e => set("yieldLitres", e.target.value)} /></div>
            <div><Label>Milk Temperature (°C)</Label><Input type="number" step="0.1" value={form.milkTemperatureCelsius || ""} onChange={e => set("milkTemperatureCelsius", e.target.value)} /></div>
            <div><Label>On-farm SCC (k/mL)</Label><Input type="number" value={form.sccThousands || ""} onChange={e => set("sccThousands", e.target.value ? parseInt(e.target.value) : null)} /><p className="text-xs text-gray-400 mt-0.5">UK limit: 1,500k</p></div>
            <div><Label>On-farm TBC (cfu/mL)</Label><Input type="number" value={form.tbcCfuMl || ""} onChange={e => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Fat %</Label><Input type="number" step="0.01" value={form.fatPercent || ""} onChange={e => set("fatPercent", e.target.value)} /></div>
            <div><Label>Protein %</Label><Input type="number" step="0.01" value={form.proteinPercent || ""} onChange={e => set("proteinPercent", e.target.value)} /></div>
            <div><Label>ABR Test Result</Label>
              <Select value={form.antibioticResidueTestResult || "__none__"} onValueChange={v => set("antibioticResidueTestResult", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not tested</SelectItem>
                  <SelectItem value="negative">Negative ✓</SelectItem>
                  <SelectItem value="positive">Positive ⚠</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>ABR Kit Lot</Label><Input value={form.abrTestKitLot || ""} onChange={e => set("abrTestKitLot", e.target.value)} /></div>
            <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Buyer / Collection</p></div>
            <div><Label>Milk Buyer</Label><Input value={form.milkBuyer || ""} onChange={e => set("milkBuyer", e.target.value)} /></div>
            <div><Label>Collector Reference</Label><Input value={form.collectorReference || ""} onChange={e => set("collectorReference", e.target.value)} /></div>
            <div><Label>Buyer SCC (k/mL)</Label><Input type="number" value={form.buyerSccThousands || ""} onChange={e => set("buyerSccThousands", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Buyer Fat %</Label><Input type="number" step="0.01" value={form.buyerFatPercent || ""} onChange={e => set("buyerFatPercent", e.target.value)} /></div>
            <div><Label>Buyer Protein %</Label><Input type="number" step="0.01" value={form.buyerProteinPercent || ""} onChange={e => set("buyerProteinPercent", e.target.value)} /></div>
            <div><Label>Pence per litre</Label><Input type="number" step="0.01" value={form.pencePerLitre || ""} onChange={e => set("pencePerLitre", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Mastitis ──────────────────────────────────────────────────────────────────

interface MastitisRecord {
  id: number; incidentDate: string; eweLisTag?: string | null; eweName?: string | null;
  quarterAffected?: string | null; clinicalSigns?: string | null; pathogenIdentified?: string | null;
  labSampleTaken?: boolean; labRef?: string | null;
  treatmentProduct?: string | null; treatmentDurationDays?: number | null;
  withdrawalMilkDays?: number | null; milkWithdrawnUntil?: string | null;
  outcome?: string | null; chronicCase?: boolean; culledDueToMastitis?: boolean;
  attendingVet?: string | null; notes?: string | null;
}

function MastitisTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MastitisRecord | null>(null);
  const [viewRec, setViewRec] = useState<MastitisRecord | null>(null);
  const blank: Partial<MastitisRecord> = { incidentDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false };
  const [form, setForm] = useState<Partial<MastitisRecord>>(blank);
  const set = (k: keyof MastitisRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records`)).then(r => r.json()) });
  const records: MastitisRecord[] = data?.records ?? [];
  const chronicCount = records.filter(r => r.chronicCase).length;
  const culledCount = records.filter(r => r.culledDueToMastitis).length;

  const save = useMutation({
    mutationFn: (body: Partial<MastitisRecord>) => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-mastitis", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Record added" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-mastitis", farmId] }); toast({ title: "Record deleted" }); },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Total Cases</p><p className="text-2xl font-bold text-gray-800">{records.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Chronic Cases</p><p className="text-2xl font-bold text-amber-700">{chronicCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Culled Due to Mastitis</p><p className="text-2xl font-bold text-red-700">{culledCount}</p></CardContent></Card>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">Mastitis Records</h2>
        <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No mastitis records yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Ewe LIS Tag</th><th className="py-2 px-3 text-left">Quarter</th><th className="py-2 px-3 text-left">Pathogen</th><th className="py-2 px-3 text-left">Treatment</th><th className="py-2 px-3 text-left">Outcome</th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{fmt(r.incidentDate)}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.eweLisTag || "—"}</td>
                  <td className="py-2 px-3 capitalize">{r.quarterAffected || "—"}</td>
                  <td className="py-2 px-3">{r.pathogenIdentified || "—"}</td>
                  <td className="py-2 px-3">{r.treatmentProduct || "—"}</td>
                  <td className="py-2 px-3"><OutcomeBadge v={r.outcome} />{r.chronicCase && <span className="ml-1 text-xs text-amber-600">Chronic</span>}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Mastitis — {viewRec.eweLisTag || "Unknown ewe"} on {fmt(viewRec.incidentDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ewe LIS Tag</p><p className="font-mono font-medium">{viewRec.eweLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quarter Affected</p><p className="font-medium capitalize">{viewRec.quarterAffected || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clinical Signs</p><p className="font-medium">{viewRec.clinicalSigns || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pathogen</p><p className="font-medium">{viewRec.pathogenIdentified || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Sample</p><p className="font-medium">{viewRec.labSampleTaken ? `Yes — ref: ${viewRec.labRef || "pending"}` : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Product</p><p className="font-medium">{viewRec.treatmentProduct || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Withdrawal</p><p className="font-medium">{viewRec.withdrawalMilkDays != null ? `${viewRec.withdrawalMilkDays} days` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Withheld Until</p><p className="font-medium">{fmt(viewRec.milkWithdrawnUntil)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><OutcomeBadge v={viewRec.outcome} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Attending Vet</p><p className="font-medium">{viewRec.attendingVet || "—"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="sheep-dairy-mastitis" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Mastitis Record" : "Add Mastitis Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Incident Date *</Label><Input type="date" value={String(form.incidentDate || "").slice(0, 10)} onChange={e => set("incidentDate", e.target.value)} /></div>
            <div><Label>Ewe LIS Tag</Label><Input value={form.eweLisTag || ""} onChange={e => set("eweLisTag", e.target.value)} placeholder="LIS ear tag" /></div>
            <div><Label>Quarter Affected</Label>
              <Select value={form.quarterAffected || "__none__"} onValueChange={v => set("quarterAffected", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not specified</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Clinical Signs</Label><Input value={form.clinicalSigns || ""} onChange={e => set("clinicalSigns", e.target.value)} /></div>
            <div><Label>Pathogen Identified</Label><Input value={form.pathogenIdentified || ""} onChange={e => set("pathogenIdentified", e.target.value)} placeholder="e.g. Staph. aureus" /></div>
            <div><Label>Lab Ref</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>Treatment Product</Label><Input value={form.treatmentProduct || ""} onChange={e => set("treatmentProduct", e.target.value)} /></div>
            <div><Label>Treatment Duration (days)</Label><Input type="number" value={form.treatmentDurationDays || ""} onChange={e => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Milk Withdrawal (days)</Label><Input type="number" value={form.withdrawalMilkDays || ""} onChange={e => set("withdrawalMilkDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Milk Withheld Until</Label><Input type="date" value={String(form.milkWithdrawnUntil || "").slice(0, 10)} onChange={e => set("milkWithdrawnUntil", e.target.value)} /></div>
            <div><Label>Outcome</Label>
              <Select value={form.outcome || "__none__"} onValueChange={v => set("outcome", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Ongoing</SelectItem>
                  <SelectItem value="cured">Cured</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="dried-off">Dried off early</SelectItem>
                  <SelectItem value="chronic">Chronic</SelectItem>
                  <SelectItem value="culled">Culled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Attending Vet</Label><Input value={form.attendingVet || ""} onChange={e => set("attendingVet", e.target.value)} /></div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.labSampleTaken} onChange={e => set("labSampleTaken", e.target.checked)} />Lab sample taken</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.chronicCase} onChange={e => set("chronicCase", e.target.checked)} />Chronic case</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.culledDueToMastitis} onChange={e => set("culledDueToMastitis", e.target.checked)} />Culled for mastitis</label>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Lambing / Kidding Records ─────────────────────────────────────────────────

interface KiddingRecord {
  id: number; lambingDate: string; eweLisTag?: string | null; birthOutcome: string;
  lambCount?: number | null; lambSex?: string | null; lambEidTag?: string | null;
  lambBirthWeightKg?: string | null; easeScore?: number | null;
  assistanceRequired?: boolean; assistanceType?: string | null;
  vetAttended?: boolean; vetName?: string | null;
  colostrumGivenWithin2Hours?: boolean | null;
  eidApplied?: boolean; eidAppliedDate?: string | null; lisTagNumber?: string | null;
  eweMilkingStatus?: string | null; eweComplications?: string | null; notes?: string | null;
}

function EaseScoreBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const cls = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const lbl = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] || "bg-gray-100 text-gray-700"}`}>{v} — {lbl[v] || "Unknown"}</span>;
}

function KiddingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KiddingRecord | null>(null);
  const [viewRec, setViewRec] = useState<KiddingRecord | null>(null);
  const blank: Partial<KiddingRecord> = { lambingDate: today(), birthOutcome: "live-single", lambCount: 1, assistanceRequired: false, vetAttended: false, eidApplied: false };
  const [form, setForm] = useState<Partial<KiddingRecord>>(blank);
  const set = (k: keyof KiddingRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-kidding", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/kidding-records`)).then(r => r.json()) });
  const records: KiddingRecord[] = data?.records ?? [];
  const liveCount = records.reduce((s, r) => s + (r.birthOutcome?.includes("live") ? (r.lambCount || 1) : 0), 0);
  const pendingEid = records.filter(r => !r.eidApplied && r.birthOutcome?.includes("live")).length;

  const save = useMutation({
    mutationFn: (body: Partial<KiddingRecord>) => fetch(api(`farms/${farmId}/sheep-dairy/kidding-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-kidding", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Record added" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-dairy/kidding-records/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-kidding", farmId] }); toast({ title: "Record deleted" }); },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        <strong>LIS Tagging:</strong> Sheep EID tags must be applied before first movement off the holding — there is no 36-hour rule (unlike cattle BCMS). Record EID application date and LIS tag number below.
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Litters Recorded</p><p className="text-2xl font-bold text-gray-800">{records.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Live Lambs</p><p className="text-2xl font-bold text-green-700">{liveCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">EID Pending</p><p className={`text-2xl font-bold ${pendingEid > 0 ? "text-amber-700" : "text-gray-400"}`}>{pendingEid}</p></CardContent></Card>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">Lambing Records</h2>
        <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No lambing records yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Ewe LIS Tag</th><th className="py-2 px-3 text-left">Outcome</th><th className="py-2 px-3 text-left">Lambs</th><th className="py-2 px-3 text-left">Ease</th><th className="py-2 px-3 text-left">EID</th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{fmt(r.lambingDate)}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.eweLisTag || "—"}</td>
                  <td className="py-2 px-3 capitalize">{r.birthOutcome?.replace(/-/g, " ") || "—"}</td>
                  <td className="py-2 px-3">{r.lambCount ?? 1} × {r.lambSex || "?"}</td>
                  <td className="py-2 px-3"><EaseScoreBadge v={r.easeScore} /></td>
                  <td className="py-2 px-3">{r.eidApplied ? <span className="text-green-700 font-medium text-xs">✓ Applied</span> : <span className="text-amber-600 text-xs font-medium">Pending</span>}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Lambing Record — {fmt(viewRec.lambingDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ewe LIS Tag</p><p className="font-mono font-medium">{viewRec.eweLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Outcome</p><p className="font-medium capitalize">{viewRec.birthOutcome?.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lamb Count</p><p className="font-medium">{viewRec.lambCount ?? 1}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sex</p><p className="font-medium capitalize">{viewRec.lambSex || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Weight (kg)</p><p className="font-medium">{viewRec.lambBirthWeightKg || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><EaseScoreBadge v={viewRec.easeScore} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EID Applied</p><p className="font-medium">{viewRec.eidApplied ? `Yes — ${fmt(viewRec.eidAppliedDate)}` : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">LIS Tag Number</p><p className="font-mono font-medium">{viewRec.lisTagNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRec.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRec.colostrumGivenWithin2Hours === false ? "No" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ewe Milking Status</p><p className="font-medium capitalize">{viewRec.eweMilkingStatus || "—"}</p></div>
              {viewRec.eweComplications && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ewe Complications</p><p className="font-medium">{viewRec.eweComplications}</p></div>}
              {viewRec.vetAttended && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet</p><p className="font-medium">{viewRec.vetName || "Attended"}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="sheep-dairy-kidding" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Lambing Record" : "Add Lambing Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Lambing Date *</Label><Input type="date" value={String(form.lambingDate || "").slice(0, 10)} onChange={e => set("lambingDate", e.target.value)} /></div>
            <div><Label>Ewe LIS Tag</Label><Input value={form.eweLisTag || ""} onChange={e => set("eweLisTag", e.target.value)} placeholder="LIS ear tag" /></div>
            <div><Label>Birth Outcome *</Label>
              <Select value={form.birthOutcome || "live-single"} onValueChange={v => set("birthOutcome", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live-single">Live — single</SelectItem>
                  <SelectItem value="live-twins">Live — twins</SelectItem>
                  <SelectItem value="live-triplets">Live — triplets</SelectItem>
                  <SelectItem value="stillborn">Stillborn</SelectItem>
                  <SelectItem value="mummified">Mummified</SelectItem>
                  <SelectItem value="abortion">Abortion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Lamb Count</Label><Input type="number" min="1" value={form.lambCount || 1} onChange={e => set("lambCount", parseInt(e.target.value))} /></div>
            <div><Label>Sex</Label>
              <Select value={form.lambSex || "__none__"} onValueChange={v => set("lambSex", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not recorded</SelectItem>
                  <SelectItem value="ewe">Ewe lamb</SelectItem>
                  <SelectItem value="ram">Ram lamb</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Birth Weight (kg)</Label><Input type="number" step="0.1" value={form.lambBirthWeightKg || ""} onChange={e => set("lambBirthWeightKg", e.target.value)} /></div>
            <div><Label>Ease Score</Label>
              <Select value={String(form.easeScore || "")} onValueChange={v => set("easeScore", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 — Unassisted</SelectItem>
                  <SelectItem value="2">2 — Minor assistance</SelectItem>
                  <SelectItem value="3">3 — Major assistance</SelectItem>
                  <SelectItem value="4">4 — Vet required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">LIS Tagging</p></div>
            <div><Label>EID Tag Number</Label><Input value={form.lambEidTag || ""} onChange={e => set("lambEidTag", e.target.value)} /></div>
            <div><Label>LIS Tag Number</Label><Input value={form.lisTagNumber || ""} onChange={e => set("lisTagNumber", e.target.value)} /></div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" className="rounded" checked={!!form.eidApplied} onChange={e => set("eidApplied", e.target.checked)} id="sd-eid" />
              <label htmlFor="sd-eid" className="text-sm cursor-pointer">EID tag applied</label>
              {form.eidApplied && <Input type="date" className="ml-2 w-40" value={String(form.eidAppliedDate || "").slice(0, 10)} onChange={e => set("eidAppliedDate", e.target.value)} />}
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Colostrum & Ewe</p></div>
            <div><Label>Colostrum Given ≤2h</Label>
              <Select value={form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no"} onValueChange={v => set("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not recorded</SelectItem><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Ewe Milking Status</Label>
              <Select value={form.eweMilkingStatus || "__none__"} onValueChange={v => set("eweMilkingStatus", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="good">Good let-down</SelectItem><SelectItem value="poor">Poor let-down</SelectItem><SelectItem value="agalactia">Agalactia</SelectItem><SelectItem value="mastitis">Mastitis</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Ewe Complications</Label><Input value={form.eweComplications || ""} onChange={e => set("eweComplications", e.target.value)} /></div>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.vetAttended} onChange={e => set("vetAttended", e.target.checked)} />Vet attended</label>
            </div>
            {form.vetAttended && <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Body Condition Scoring ────────────────────────────────────────────────────

interface BcsRecord {
  id: number; assessmentDate: string; assessedBy?: string | null; assessmentStage?: string | null;
  eweLisTag?: string | null; bcsScore?: string | null; actionRequired?: string | null;
  followUpDate?: string | null; notes?: string | null;
}

function BcsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BcsRecord | null>(null);
  const blank: Partial<BcsRecord> = { assessmentDate: today() };
  const [form, setForm] = useState<Partial<BcsRecord>>(blank);
  const set = (k: keyof BcsRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-bcs", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/bcs-records`)).then(r => r.json()) });
  const records: BcsRecord[] = data?.records ?? [];

  const save = useMutation({
    mutationFn: (body: Partial<BcsRecord>) => fetch(api(`farms/${farmId}/sheep-dairy/bcs-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-bcs", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-dairy/bcs-records/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-bcs", farmId] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h2 className="text-base font-semibold text-gray-800">Body Condition Scoring (1–5 scale)</h2><Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button></div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : records.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No BCS records yet.</p></div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Ewe LIS Tag</th><th className="py-2 px-3 text-left">Stage</th><th className="py-2 px-3 text-left">BCS</th><th className="py-2 px-3 text-left">Action</th><th className="py-2 px-3 text-left">Assessed By</th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
          <tbody>{records.map(r => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-medium">{fmt(r.assessmentDate)}</td>
              <td className="py-2 px-3 font-mono text-xs">{r.eweLisTag || "—"}</td>
              <td className="py-2 px-3 capitalize">{r.assessmentStage || "—"}</td>
              <td className="py-2 px-3"><BcsBadge v={r.bcsScore} /></td>
              <td className="py-2 px-3 text-sm">{r.actionRequired || "None"}</td>
              <td className="py-2 px-3 text-gray-500">{r.assessedBy || "—"}</td>
              <td className="py-2 px-3"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit BCS Record" : "Add BCS Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Date *</Label><Input type="date" value={String(form.assessmentDate || "").slice(0, 10)} onChange={e => set("assessmentDate", e.target.value)} /></div>
            <div><Label>Ewe LIS Tag</Label><Input value={form.eweLisTag || ""} onChange={e => set("eweLisTag", e.target.value)} /></div>
            <div><Label>Assessment Stage</Label>
              <Select value={form.assessmentStage || "__none__"} onValueChange={v => set("assessmentStage", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="tupping">Pre-tupping</SelectItem><SelectItem value="mid-pregnancy">Mid-pregnancy</SelectItem><SelectItem value="late-pregnancy">Late pregnancy</SelectItem><SelectItem value="post-lambing">Post-lambing</SelectItem><SelectItem value="weaning">Weaning</SelectItem><SelectItem value="lactation-peak">Peak lactation</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>BCS Score (1–5)</Label>
              <Select value={String(form.bcsScore || "")} onValueChange={v => set("bcsScore", v || null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Assessed By</Label><Input value={form.assessedBy || ""} onChange={e => set("assessedBy", e.target.value)} /></div>
            <div><Label>Follow-up Date</Label><Input type="date" value={String(form.followUpDate || "").slice(0, 10)} onChange={e => set("followUpDate", e.target.value)} /></div>
            <div className="col-span-2"><Label>Action Required</Label><Input value={form.actionRequired || ""} onChange={e => set("actionRequired", e.target.value)} placeholder="e.g. Increase ration, separate group" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Bulk Tank ─────────────────────────────────────────────────────────────────

interface TankRecord {
  id: number; recordDate: string; recordType: string;
  tankTemperatureCelsius?: string | null; tankCleaned?: boolean;
  cleaningProductUsed?: string | null; cleaningProductBatch?: string | null;
  antibioticResidueTestRef?: string | null; antibioticResidueResult?: string | null;
  tankerDriverName?: string | null; collectionRef?: string | null; notes?: string | null;
}

function BulkTankTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TankRecord | null>(null);
  const blank: Partial<TankRecord> = { recordDate: today(), recordType: "temperature-check" };
  const [form, setForm] = useState<Partial<TankRecord>>(blank);
  const set = (k: keyof TankRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-tank", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/bulk-tank-records`)).then(r => r.json()) });
  const records: TankRecord[] = data?.records ?? [];
  const tempRecords = records.filter(r => r.tankTemperatureCelsius != null);
  const highTempCount = tempRecords.filter(r => parseFloat(r.tankTemperatureCelsius!) > 4).length;

  const save = useMutation({
    mutationFn: (body: Partial<TankRecord>) => fetch(api(`farms/${farmId}/sheep-dairy/bulk-tank-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-tank", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-dairy/bulk-tank-records/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-tank", farmId] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Total Records</p><p className="text-2xl font-bold text-gray-800">{records.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">High Temp Events (&gt;4°C)</p><p className={`text-2xl font-bold ${highTempCount > 0 ? "text-red-700" : "text-green-700"}`}>{highTempCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Cleaning Records</p><p className="text-2xl font-bold text-blue-700">{records.filter(r => r.tankCleaned).length}</p></CardContent></Card>
      </div>
      <div className="flex justify-between items-center"><h2 className="text-base font-semibold text-gray-800">Bulk Tank Records</h2><Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button></div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : records.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No bulk tank records yet.</p></div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Type</th><th className="py-2 px-3 text-left">Temperature</th><th className="py-2 px-3 text-left">Cleaned</th><th className="py-2 px-3 text-left">ABR</th><th className="py-2 px-3 text-left">Collection Ref</th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
          <tbody>{records.map(r => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-medium">{fmt(r.recordDate)}</td>
              <td className="py-2 px-3 capitalize">{r.recordType?.replace(/-/g, " ") || "—"}</td>
              <td className="py-2 px-3">{r.tankTemperatureCelsius ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${parseFloat(r.tankTemperatureCelsius) > 4 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{r.tankTemperatureCelsius}°C</span> : "—"}</td>
              <td className="py-2 px-3">{r.tankCleaned ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—"}</td>
              <td className="py-2 px-3">{r.antibioticResidueResult ? <span className={`px-2 py-0.5 rounded-full text-xs ${r.antibioticResidueResult === "positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{r.antibioticResidueResult}</span> : "—"}</td>
              <td className="py-2 px-3 text-gray-500">{r.collectionRef || "—"}</td>
              <td className="py-2 px-3"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Bulk Tank Record" : "Add Bulk Tank Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Date *</Label><Input type="date" value={String(form.recordDate || "").slice(0, 10)} onChange={e => set("recordDate", e.target.value)} /></div>
            <div><Label>Record Type *</Label>
              <Select value={form.recordType || "temperature-check"} onValueChange={v => set("recordType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="temperature-check">Temperature check</SelectItem><SelectItem value="cleaning">Tank cleaning</SelectItem><SelectItem value="collection">Milk collection</SelectItem><SelectItem value="abr-test">ABR test</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={form.tankTemperatureCelsius || ""} onChange={e => set("tankTemperatureCelsius", e.target.value)} /></div>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.tankCleaned} onChange={e => set("tankCleaned", e.target.checked)} />Tank cleaned</label></div>
            {form.tankCleaned && <>
              <div><Label>Cleaning Product</Label><Input value={form.cleaningProductUsed || ""} onChange={e => set("cleaningProductUsed", e.target.value)} /></div>
              <div><Label>Product Batch</Label><Input value={form.cleaningProductBatch || ""} onChange={e => set("cleaningProductBatch", e.target.value)} /></div>
            </>}
            <div><Label>ABR Test Ref</Label><Input value={form.antibioticResidueTestRef || ""} onChange={e => set("antibioticResidueTestRef", e.target.value)} /></div>
            <div><Label>ABR Result</Label>
              <Select value={form.antibioticResidueResult || "__none__"} onValueChange={v => set("antibioticResidueResult", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not tested</SelectItem><SelectItem value="negative">Negative ✓</SelectItem><SelectItem value="positive">Positive ⚠</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Collection Ref</Label><Input value={form.collectionRef || ""} onChange={e => set("collectionRef", e.target.value)} /></div>
            <div><Label>Tanker Driver</Label><Input value={form.tankerDriverName || ""} onChange={e => set("tankerDriverName", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Maedi-Visna Monitoring ────────────────────────────────────────────────────

interface MvRecord {
  id: number; testDate: string; testType: string;
  laboratory?: string | null; labRef?: string | null;
  animalsTestedCount?: number | null; positiveCount?: number | null;
  result: string; mvAccreditationStatus?: string | null; accreditationBody?: string | null;
  actionTaken?: string | null; nextTestDue?: string | null; vetName?: string | null; notes?: string | null;
}

function MvTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MvRecord | null>(null);
  const [viewRec, setViewRec] = useState<MvRecord | null>(null);
  const blank: Partial<MvRecord> = { testDate: today(), testType: "blood-elisa" };
  const [form, setForm] = useState<Partial<MvRecord>>(blank);
  const set = (k: keyof MvRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-mv", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/mv-monitoring`)).then(r => r.json()) });
  const records: MvRecord[] = data?.records ?? [];
  const latestAccred = records.find(r => r.mvAccreditationStatus)?.mvAccreditationStatus;

  const save = useMutation({
    mutationFn: (body: Partial<MvRecord>) => fetch(api(`farms/${farmId}/sheep-dairy/mv-monitoring${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-mv", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-dairy/mv-monitoring/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-mv", farmId] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Maedi-Visna (MV)</strong> is a progressive chronic viral disease of sheep (OIE listed). UK dairy sheep health schemes require regular testing. Accreditation is available through SRUC and other bodies. Dairy ewes should be MV-accredited status for premium markets.
      </div>
      {latestAccred && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-600">Accreditation status:</span>
          <ResultBadge v={latestAccred} />
        </div>
      )}
      <div className="flex justify-between items-center"><h2 className="text-base font-semibold text-gray-800">Maedi-Visna Test Records</h2><Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Test Record</Button></div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : records.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No MV monitoring records yet.</p></div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Test Type</th><th className="py-2 px-3 text-left">Animals</th><th className="py-2 px-3 text-left">Positives</th><th className="py-2 px-3 text-left">Result</th><th className="py-2 px-3 text-left">Next Test</th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
          <tbody>{records.map(r => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-medium">{fmt(r.testDate)}</td>
              <td className="py-2 px-3 capitalize">{r.testType?.replace(/-/g, " ") || "—"}</td>
              <td className="py-2 px-3">{r.animalsTestedCount ?? "—"}</td>
              <td className="py-2 px-3">{r.positiveCount != null ? <span className={r.positiveCount > 0 ? "text-red-700 font-medium" : "text-green-700"}>{r.positiveCount}</span> : "—"}</td>
              <td className="py-2 px-3"><ResultBadge v={r.result} /></td>
              <td className="py-2 px-3 text-gray-500">{fmt(r.nextTestDue)}</td>
              <td className="py-2 px-3"><div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "34rem" }}>
            <DialogHeader><DialogTitle>MV Test — {fmt(viewRec.testDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Type</p><p className="font-medium capitalize">{viewRec.testType?.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Laboratory</p><p className="font-medium">{viewRec.laboratory || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Ref</p><p className="font-medium">{viewRec.labRef || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animals Tested</p><p className="font-medium">{viewRec.animalsTestedCount ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Positives</p><p className={`font-medium ${(viewRec.positiveCount ?? 0) > 0 ? "text-red-700" : "text-green-700"}`}>{viewRec.positiveCount ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Result</p><ResultBadge v={viewRec.result} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Accreditation Status</p><ResultBadge v={viewRec.mvAccreditationStatus} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Accreditation Body</p><p className="font-medium">{viewRec.accreditationBody || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Taken</p><p className="font-medium">{viewRec.actionTaken || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">{fmt(viewRec.nextTestDue)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet</p><p className="font-medium">{viewRec.vetName || "—"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="sheep-dairy-mv" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit MV Record" : "Add MV Test Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Test Date *</Label><Input type="date" value={String(form.testDate || "").slice(0, 10)} onChange={e => set("testDate", e.target.value)} /></div>
            <div><Label>Test Type *</Label>
              <Select value={form.testType || "blood-elisa"} onValueChange={v => set("testType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="blood-elisa">Blood ELISA</SelectItem><SelectItem value="agar-gel-id">Agar gel immunodiffusion (AGID)</SelectItem><SelectItem value="pcr">PCR</SelectItem><SelectItem value="post-mortem">Post-mortem / histopathology</SelectItem><SelectItem value="bulk-milk">Bulk milk ELISA</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Laboratory</Label><Input value={form.laboratory || ""} onChange={e => set("laboratory", e.target.value)} /></div>
            <div><Label>Lab Ref</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>Animals Tested</Label><Input type="number" value={form.animalsTestedCount || ""} onChange={e => set("animalsTestedCount", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Positives</Label><Input type="number" value={form.positiveCount ?? ""} onChange={e => set("positiveCount", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Result *</Label>
              <Select value={form.result || ""} onValueChange={v => set("result", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent><SelectItem value="negative">Negative (all clear)</SelectItem><SelectItem value="positive">Positive</SelectItem><SelectItem value="inconclusive">Inconclusive</SelectItem><SelectItem value="accredited-clear">Accredited — Clear</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>MV Accreditation Status</Label>
              <Select value={form.mvAccreditationStatus || "__none__"} onValueChange={v => set("mvAccreditationStatus", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not applicable</SelectItem><SelectItem value="accredited-negative">Accredited — Negative</SelectItem><SelectItem value="provisional">Provisional</SelectItem><SelectItem value="withdrawn">Withdrawn</SelectItem><SelectItem value="not-accredited">Not accredited</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Accreditation Body</Label><Input value={form.accreditationBody || ""} onChange={e => set("accreditationBody", e.target.value)} placeholder="e.g. SRUC, ABVMA" /></div>
            <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
            <div><Label>Next Test Due</Label><Input type="date" value={String(form.nextTestDue || "").slice(0, 10)} onChange={e => set("nextTestDue", e.target.value)} /></div>
            <div className="col-span-2"><Label>Action Taken</Label><Input value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Assurance Certs ───────────────────────────────────────────────────────────

function AssuranceTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-green-100 bg-green-50 p-4">
        <h3 className="font-semibold text-green-800 mb-1">British Sheep Dairying Association (BSDA)</h3>
        <p className="text-sm text-green-700">The BSDA supports UK sheep dairy producers with technical guidance, traceability, and assurance frameworks for sheep milk production. Record your membership and certification details using the Assurance Certs register in the main Compliance module.</p>
        <a href="https://www.sheepdairying.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-green-800 underline hover:text-green-900">Visit British Sheep Dairying Association ↗</a>
      </div>
      <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-800 mb-1">Red Tractor — Sheep milk not currently covered</h3>
        <p className="text-sm text-blue-700">Red Tractor does not currently operate an assurance scheme specifically for sheep or goat milk production. Producers should refer to BSDA guidance, buyer assurance requirements, and their certifying body requirements directly.</p>
      </div>
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-700 mb-1">National Milk Records (NMR)</h3>
        <p className="text-sm text-gray-600">NMR operates milk recording services for sheep and goat dairy enterprises in addition to dairy cattle. Recording with NMR provides SCC data, yield analysis, and quality reports that support compliance evidence.</p>
        <a href="https://www.nmr.co.uk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-gray-700 underline hover:text-gray-900">Visit National Milk Records ↗</a>
      </div>
    </div>
  );
}
