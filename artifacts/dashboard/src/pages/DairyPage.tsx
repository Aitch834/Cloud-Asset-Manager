import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
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
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, ChevronRight, ChevronDown, Eye, Droplets, Thermometer, FileDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { openPrintWindow } from "@/lib/print-report";

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

function formatDate(v?: string | null) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return v; }
}

function today() { return new Date().toISOString().slice(0, 10); }

function SccBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const ok = v < 200;
  const warn = v >= 200 && v < 400;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL
    </span>
  );
}

function EaseScoreBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const colours = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const labels = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[v] || "bg-gray-100 text-gray-700"}`}>{v} — {labels[v] || "Unknown"}</span>;
}

function OutcomeBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const map: Record<string, string> = { cured: "bg-green-100 text-green-800", "dried-off": "bg-blue-100 text-blue-800", "culled": "bg-red-100 text-red-800", chronic: "bg-amber-100 text-amber-800", ongoing: "bg-yellow-100 text-yellow-800" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || "bg-gray-100 text-gray-700"}`}>{v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ")}</span>;
}

function BcsBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const n = parseFloat(v);
  const ok = n >= 2.5 && n <= 3.5;
  const low = n < 2.5;
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : low ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{v}</span>;
}

type Tab = "milk" | "mastitis" | "calving" | "bcs" | "mobility" | "tank" | "dct";

export default function DairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("milk");

  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Dairy Records">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dairy Records</h1>
          <p className="text-gray-500 text-sm mt-1">Red Tractor Dairy scheme compliance — milk recording, mastitis, calving, body condition, mobility, bulk tank, and dry cow therapy.</p>
        </div>

        <TabBar>
          <TabButton active={tab === "milk"} onClick={() => setTab("milk")}>Milk Records</TabButton>
          <TabButton active={tab === "mastitis"} onClick={() => setTab("mastitis")}>Mastitis</TabButton>
          <TabButton active={tab === "calving"} onClick={() => setTab("calving")}>Calving</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "mobility"} onClick={() => setTab("mobility")}>Mobility Scoring</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "dct"} onClick={() => setTab("dct")}>Dry Cow Therapy</TabButton>
        </TabBar>

        <div className="mt-6">
          {tab === "milk" && <MilkRecordsTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "calving" && <CalvingTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "mobility" && <MobilityTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "dct" && <DctTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Milk Records ──────────────────────────────────────────────────────────────

interface MilkRecord {
  id: number; recordDate: string; recordType: string; sessionType?: string | null;
  yieldLitres?: string | null; sccThousands?: number | null; tbcCfuMl?: number | null;
  fatPercent?: string | null; proteinPercent?: string | null; lactosePercent?: string | null;
  milkTemperatureCelsius?: string | null; antibioticResidueTestResult?: string | null;
  collectorReference?: string | null; herdId?: number | null; notes?: string | null;
}

function MilkRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MilkRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MilkRecord | null>(null);
  const [form, setForm] = useState<Partial<MilkRecord>>({});

  const { data, isLoading } = useQuery<{ records: MilkRecord[] }>({
    queryKey: ["dairy-milk", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<MilkRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/milk-records/${editing.id}`) : api(`farms/${farmId}/dairy/milk-records`);
      const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/milk-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ recordDate: today(), recordType: "bulk-tank" }); setOpen(true); }
  function openEdit(r: MilkRecord) { setEditing(r); setForm({ ...r }); setOpen(true); }
  function set(k: keyof MilkRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Milk Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{formatDate(viewRecord.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Record Type</p><p className="font-medium capitalize">{String(viewRecord.recordType ?? "—").replace("-", " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milking Session</p><p className="font-medium capitalize">{String(viewRecord.sessionType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Yield (litres)</p><p className="font-medium">{viewRecord.yieldLitres ? `${parseFloat(viewRecord.yieldLitres).toLocaleString()} L` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC (k/mL)</p><p className="font-medium">{viewRecord.sccThousands?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">TBC (cfu/mL)</p><p className="font-medium">{viewRecord.tbcCfuMl?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fat (%)</p><p className="font-medium">{String(viewRecord.fatPercent ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protein (%)</p><p className="font-medium">{String(viewRecord.proteinPercent ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lactose (%)</p><p className="font-medium">{String(viewRecord.lactosePercent ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Temperature (°C)</p><p className="font-medium">{String(viewRecord.milkTemperatureCelsius ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Antibiotic Residue Test</p><p className="font-medium capitalize">{String(viewRecord.antibioticResidueTestResult ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collector Ref</p><p className="font-medium">{String(viewRecord.collectorReference ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No milk records yet — click Add Record to begin.</CardContent></Card>}
          {data?.records?.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm text-gray-900">{formatDate(r.recordDate)}</span>
                    <span className="text-xs text-gray-500 capitalize">{r.recordType.replace("-", " ")}{r.sessionType ? ` · ${r.sessionType}` : ""}</span>
                    {r.yieldLitres && <span className="text-sm text-gray-700">{parseFloat(r.yieldLitres).toLocaleString()} L</span>}
                    <SccBadge v={r.sccThousands} />
                    {r.tbcCfuMl && <span className="text-xs text-gray-500">TBC: {r.tbcCfuMl.toLocaleString()} cfu/mL</span>}
                    {r.fatPercent && <span className="text-xs text-gray-500">Fat: {r.fatPercent}%</span>}
                    {r.proteinPercent && <span className="text-xs text-gray-500">Protein: {r.proteinPercent}%</span>}
                    {r.antibioticResidueTestResult && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.antibioticResidueTestResult === "negative" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {r.antibioticResidueTestResult === "negative" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        ABR: {r.antibioticResidueTestResult}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "56rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Milk Record" : "Add Milk Record"}</DialogTitle>
            <p className="text-xs text-muted-foreground pt-1">Record milk quality and yield data — SCC, TBC, composition, and ABR test results. For tanker collection logistics (volume, driver, buyer), use the <span className="font-medium">Bulk Tank</span> tab.</p>
          </DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div><Label>Date *</Label><Input type="date" value={form.recordDate || ""} onChange={e => set("recordDate", e.target.value)} /></div>
              <div>
                <Label>Record Type *</Label>
                <Select value={form.recordType || "bulk-tank"} onValueChange={v => set("recordType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulk-tank">Bulk Tank (Quality Sample)</SelectItem>
                    <SelectItem value="individual-cow">Individual Cow</SelectItem>
                    <SelectItem value="herd-total">Herd Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Milking Session</Label>
                <Select value={form.sessionType || ""} onValueChange={v => set("sessionType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="daily-total">Daily Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Yield (litres)</Label><Input type="number" step="0.1" value={form.yieldLitres || ""} onChange={e => set("yieldLitres", e.target.value)} /></div>
              <div>
                <Label>SCC (thousands/mL)</Label>
                <Input type="number" value={form.sccThousands || ""} onChange={e => set("sccThousands", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="e.g. 185 = 185,000 cells/mL" />
                <p className="text-xs text-gray-400 mt-0.5">Legal limit: 400 (400,000 cells/mL)</p>
              </div>
              <div><Label>TBC (cfu/mL)</Label><Input type="number" value={form.tbcCfuMl || ""} onChange={e => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Total bacterial count" /></div>
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Fat (%)</Label><Input type="number" step="0.01" value={form.fatPercent || ""} onChange={e => set("fatPercent", e.target.value)} /></div>
                <div><Label>Protein (%)</Label><Input type="number" step="0.01" value={form.proteinPercent || ""} onChange={e => set("proteinPercent", e.target.value)} /></div>
                <div><Label>Lactose (%)</Label><Input type="number" step="0.01" value={form.lactosePercent || ""} onChange={e => set("lactosePercent", e.target.value)} /></div>
              </div>
              <div><Label>Milk Temperature (°C)</Label><Input type="number" step="0.1" value={form.milkTemperatureCelsius || ""} onChange={e => set("milkTemperatureCelsius", e.target.value)} /></div>
              <div>
                <Label>Antibiotic Residue Test</Label>
                <Select value={form.antibioticResidueTestResult || ""} onValueChange={v => set("antibioticResidueTestResult", v)}>
                  <SelectTrigger><SelectValue placeholder="Not tested" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negative">Negative (safe to supply)</SelectItem>
                    <SelectItem value="positive">Positive (milk discarded)</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Collector / Tanker Reference</Label><Input value={form.collectorReference || ""} onChange={e => set("collectorReference", e.target.value)} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={4} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.recordDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Mastitis Records ──────────────────────────────────────────────────────────

interface MastitisRecord {
  id: number; herdId?: number | null; earTagNumber?: string | null; onsetDate: string;
  quartersAffected?: string | null; clinicalGrade?: string | null; bacterialCultureResult?: string | null;
  treatmentProduct?: string | null; treatmentStartDate?: string | null; treatmentDurationDays?: number | null;
  withdrawalEndDate?: string | null; outcome?: string | null; outcomeDate?: string | null;
  vetConsulted?: boolean; vetName?: string | null; sccAtOnset?: number | null; notes?: string | null;
}

function MastitisTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MastitisRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MastitisRecord | null>(null);
  const [form, setForm] = useState<Partial<MastitisRecord>>({});

  const { data, isLoading } = useQuery<{ records: MastitisRecord[] }>({
    queryKey: ["dairy-mastitis", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mastitis-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<MastitisRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/mastitis-records/${editing.id}`) : api(`farms/${farmId}/dairy/mastitis-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/mastitis-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ onsetDate: today() }); setOpen(true); }
  function openEdit(r: MastitisRecord) { setEditing(r); setForm({ ...r, treatmentStartDate: r.treatmentStartDate?.slice(0, 10), withdrawalEndDate: r.withdrawalEndDate?.slice(0, 10), outcomeDate: r.outcomeDate?.slice(0, 10) }); setOpen(true); }
  function set(k: keyof MastitisRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Mastitis Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Onset Date</p><p className="font-medium">{formatDate(viewRecord.onsetDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cow Ear Tag</p><p className="font-medium">{String(viewRecord.earTagNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quarters Affected</p><p className="font-medium">{String(viewRecord.quartersAffected ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clinical Grade</p><p className="font-medium">{String(viewRecord.clinicalGrade ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bacterial Culture</p><p className="font-medium">{String(viewRecord.bacterialCultureResult ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Onset</p><p className="font-medium">{viewRecord.sccAtOnset?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Product</p><p className="font-medium">{String(viewRecord.treatmentProduct ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Start</p><p className="font-medium">{formatDate(viewRecord.treatmentStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Duration (days)</p><p className="font-medium">{String(viewRecord.treatmentDurationDays ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal End</p><p className="font-medium">{formatDate(viewRecord.withdrawalEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-medium capitalize">{String(viewRecord.outcome ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome Date</p><p className="font-medium">{formatDate(viewRecord.outcomeDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Consulted</p><p className="font-medium">{viewRecord.vetConsulted ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{String(viewRecord.vetName ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="mastitis" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No mastitis records yet.</CardContent></Card>}
          {data?.records?.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.onsetDate)}</span>
                    {r.earTagNumber && <span className="text-sm text-gray-700 font-mono">{r.earTagNumber}</span>}
                    {r.quartersAffected && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{r.quartersAffected}</span>}
                    {r.clinicalGrade && <span className="text-xs text-gray-500">Grade: {r.clinicalGrade}</span>}
                    {r.treatmentProduct && <span className="text-xs text-gray-500">{r.treatmentProduct}</span>}
                    <OutcomeBadge v={r.outcome} />
                    {r.withdrawalEndDate && <span className="text-xs text-amber-600">Withdrawal ends {formatDate(r.withdrawalEndDate)}</span>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "58rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Mastitis Record" : "Add Mastitis Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column: case details ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Onset Date *</Label><Input type="date" value={form.onsetDate?.slice(0, 10) || ""} onChange={e => set("onsetDate", e.target.value)} /></div>
                <div><Label>Cow Ear Tag</Label><Input value={form.earTagNumber || ""} onChange={e => set("earTagNumber", e.target.value)} placeholder="e.g. UK123456 000001" /></div>
              </div>
              <div>
                <Label>Quarters Affected</Label>
                <Select value={form.quartersAffected || ""} onValueChange={v => set("quartersAffected", v)}>
                  <SelectTrigger><SelectValue placeholder="Select quarters..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LF">Left Front (LF)</SelectItem>
                    <SelectItem value="RF">Right Front (RF)</SelectItem>
                    <SelectItem value="LR">Left Rear (LR)</SelectItem>
                    <SelectItem value="RR">Right Rear (RR)</SelectItem>
                    <SelectItem value="LF, RF">Both Fronts (LF + RF)</SelectItem>
                    <SelectItem value="LR, RR">Both Rears (LR + RR)</SelectItem>
                    <SelectItem value="LF, LR">Left Side (LF + LR)</SelectItem>
                    <SelectItem value="RF, RR">Right Side (RF + RR)</SelectItem>
                    <SelectItem value="All quarters">All Four Quarters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Clinical Grade</Label>
                <Select value={form.clinicalGrade || ""} onValueChange={v => set("clinicalGrade", v)}>
                  <SelectTrigger><SelectValue placeholder="Select grade..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subclinical">Subclinical (high SCC, no visible signs)</SelectItem>
                    <SelectItem value="Mild">Mild (clots in milk, slight swelling)</SelectItem>
                    <SelectItem value="Moderate">Moderate (swollen quarter, cow lame/off-feed)</SelectItem>
                    <SelectItem value="Severe">Severe (toxic cow, systemic signs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>SCC at Onset (k/mL)</Label><Input type="number" value={form.sccAtOnset || ""} onChange={e => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
              <div><Label>Bacterial Culture Result</Label><Input value={form.bacterialCultureResult || ""} onChange={e => set("bacterialCultureResult", e.target.value)} placeholder="e.g. Staph. aureus, E. coli, Strep. uberis" /></div>
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column: treatment & outcome ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Treatment</p>
                <div><Label>Product</Label><Input value={form.treatmentProduct || ""} onChange={e => set("treatmentProduct", e.target.value)} placeholder="e.g. Ubrolexin intramammary" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Start Date</Label><Input type="date" value={form.treatmentStartDate || ""} onChange={e => set("treatmentStartDate", e.target.value)} /></div>
                  <div><Label>Duration (days)</Label><Input type="number" value={form.treatmentDurationDays || ""} onChange={e => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                </div>
                <div><Label>Milk Withdrawal End Date</Label><Input type="date" value={form.withdrawalEndDate || ""} onChange={e => set("withdrawalEndDate", e.target.value)} /></div>
              </div>
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outcome &amp; Vet</p>
                <div>
                  <Label>Outcome</Label>
                  <Select value={form.outcome || ""} onValueChange={v => set("outcome", v)}>
                    <SelectTrigger><SelectValue placeholder="Select outcome..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing (still treating)</SelectItem>
                      <SelectItem value="cured">Cured</SelectItem>
                      <SelectItem value="chronic">Chronic (no cure achieved)</SelectItem>
                      <SelectItem value="dried-off">Quarter/Cow Dried Off</SelectItem>
                      <SelectItem value="culled">Culled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Outcome Date</Label><Input type="date" value={form.outcomeDate || ""} onChange={e => set("outcomeDate", e.target.value)} /></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vc" checked={!!form.vetConsulted} onChange={e => set("vetConsulted", e.target.checked)} className="rounded" />
                  <Label htmlFor="vc">Vet consulted</Label>
                </div>
                <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.onsetDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Calving Records ───────────────────────────────────────────────────────────

interface CalvingRecord {
  id: number; herdId?: number | null; cowEarTag?: string | null; cowAnimalId?: number | null; calvingDate: string;
  calvingEaseScore?: number | null; numberOfCalves?: number; calfOutcome?: string | null;
  calfSex?: string | null; calfEarTag?: string | null; sireBreed?: string | null; calfBreed?: string | null;
  calfBirthWeightKg?: string | null; calfAnimalId?: number | null;
  calfOutcome2?: string | null; calfSex2?: string | null; calfEarTag2?: string | null; calfBirthWeightKg2?: string | null; calfAnimalId2?: number | null;
  colostrumGivenWithin2Hours?: boolean | null;
  colostrumGivenWithin6Hours?: boolean | null; colostrumVolumeFirstFeedLitres?: string | null;
  colostrumQualityBrix?: string | null; colostrumSource?: string | null;
  cowComplications?: string | null; assistanceRequired?: boolean; assistanceType?: string | null;
  vetAttended?: boolean; vetName?: string | null;
  conceptionMethod?: string | null; sireRegisterId?: number | null; strawInventoryId?: number | null;
  calfDisposition?: string | null; bcmsPassportApplied?: boolean; notes?: string | null;
}

function CalvingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalvingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<CalvingRecord | null>(null);
  const [form, setForm] = useState<Partial<CalvingRecord>>({});
  const [showManualEarTag, setShowManualEarTag] = useState(false);
  const [showManualVet, setShowManualVet] = useState(false);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));

  const { data, isLoading } = useQuery<{ records: CalvingRecord[] }>({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/calving-records`), { credentials: "include" }).then(r => r.json()),
  });

  const animalsQ = useQuery<{ records: Array<{ id: number; earTagNumber?: string | null; species: string; sex?: string | null; status: string }> }>({
    queryKey: ["calving-animals", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const CATTLE_SPECIES = ["cattle", "bovine"];
  const cows = (animalsQ.data?.records ?? []).filter(a =>
    CATTLE_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber
  );

  const vetVisitsQ = useQuery<{ records: Array<{ id: number; vetName: string; vetPractice?: string | null }> }>({
    queryKey: ["calving-vet-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/vet-visits`), { credentials: "include" }).then(r => r.json()),
    enabled: open && !!form.vetAttended,
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map(v => v.vetName).filter(Boolean))] as string[];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter(v => v.vetName && v.vetPractice).map(v => [v.vetName, v.vetPractice])
  );

  const siresQ = useQuery<{ records: Array<{ id: number; name: string; breed?: string | null; tagNumber?: string | null; species: string; isActive?: boolean | null }> }>({
    queryKey: ["calving-sires", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sires`), { credentials: "include" }).then(r => r.json()),
    enabled: open && form.conceptionMethod === "natural",
  });
  const activeSires = (siresQ.data?.records ?? []).filter(s => s.isActive !== false && s.species?.toLowerCase() === "cattle");

  const strawsQ = useQuery<{ records: Array<{ id: number; sireName: string; sireBreed?: string | null; batchNumber: string; sireSpecies: string }> }>({
    queryKey: ["calving-straws", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/straws`), { credentials: "include" }).then(r => r.json()),
    enabled: open && form.conceptionMethod === "ai",
  });
  const cattleStraws = (strawsQ.data?.records ?? []).filter(s => s.sireSpecies?.toLowerCase() === "cattle");

  const save = useMutation({
    mutationFn: async (body: Partial<CalvingRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/calving-records/${editing.id}`) : api(`farms/${farmId}/dairy/calving-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }); setOpen(false); setEditing(null); setForm({}); setShowManualEarTag(false); setShowManualVet(false); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/calving-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ calvingDate: today(), numberOfCalves: 1 }); setShowManualEarTag(false); setShowManualVet(false); setOpen(true); }
  function openEdit(r: CalvingRecord) {
    setEditing(r);
    setForm({ ...r, calvingDate: r.calvingDate.slice(0, 10) });
    setShowManualEarTag(!r.cowAnimalId && !!r.cowEarTag);
    setShowManualVet(!!r.vetAttended && !!r.vetName);
    setOpen(true);
  }
  function set(k: keyof CalvingRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  function generateCalvingReport() {
    const records = data?.records ?? [];
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-GB") : "—";
    const fv2 = (v: unknown) => (v === null || v === undefined || v === "") ? "—" : String(v);
    const easeLabel = (n?: number | null) => n ? ["", "1 — Unassisted", "2 — Easy pull", "3 — Hard pull", "4 — Mech. assistance", "5 — C-section"][n] ?? String(n) : "—";
    const yesNo = (v: boolean | null | undefined) => v === true ? "Yes" : v === false ? "No" : "—";

    const rows = records.map(r => {
      const calves = r.numberOfCalves && r.numberOfCalves > 1
        ? `${r.calfOutcome ?? "—"} (${r.calfSex ?? "?"}) ${r.calfEarTag ?? ""} + ${r.calfOutcome2 ?? "—"} (${r.calfSex2 ?? "?"}) ${r.calfEarTag2 ?? ""}`
        : `${r.calfOutcome ?? "—"} · ${r.calfSex === "male" ? "Bull" : r.calfSex === "female" ? "Heifer" : r.calfSex ?? "?"} · ${r.calfEarTag ?? "no tag"}`;
      return `<tr>
        <td>${fmtD(r.calvingDate)}</td>
        <td>${fv2(r.cowEarTag)}</td>
        <td>${easeLabel(r.calvingEaseScore)}</td>
        <td>${r.numberOfCalves ?? 1} calf${(r.numberOfCalves ?? 1) > 1 ? "ves" : ""}</td>
        <td>${calves}</td>
        <td>${r.calfBirthWeightKg ? `${r.calfBirthWeightKg} kg` : "—"}</td>
        <td>${yesNo(r.colostrumGivenWithin2Hours)} / ${yesNo(r.colostrumGivenWithin6Hours)}</td>
        <td>${r.colostrumVolumeFirstFeedLitres ? `${r.colostrumVolumeFirstFeedLitres} L` : "—"}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td>${yesNo(r.vetAttended)}</td>
        <td>${yesNo(r.bcmsPassportApplied)}</td>
        <td style="color:#888;font-size:9px">${fv2(r.notes).slice(0, 80)}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><title>Calving Records — Red Tractor Dairy Audit</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Calving Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<table>
  <thead><tr>
    <th>Date</th><th>Dam Tag</th><th>Ease Score</th><th>No. Calves</th><th>Calf Outcome / Tag</th>
    <th>Birth Wt</th><th>Colostrum ≤2h / ≤6h</th><th>Col. Volume</th><th>Assisted</th><th>Vet</th><th>BCMS Applied</th><th>Notes</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="note">This calving records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Dairy audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      {(() => {
        const allCalvingRecords = data?.records ?? [];
        const calvingRecords = yearFilter === "all" ? allCalvingRecords : allCalvingRecords.filter(r => r.calvingDate?.startsWith(yearFilter));
        const calvingYears = [...new Set(allCalvingRecords.map(r => r.calvingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a)) as string[];
        if (!calvingYears.includes(String(CURRENT_YEAR))) calvingYears.unshift(String(CURRENT_YEAR));
        return (<>
      <div className="flex justify-between items-center mb-4 gap-3">
        <p className="text-sm text-gray-500">Calving records including ease score, calf details, colostrum management, and BCMS passport application.</p>
        <div className="flex gap-2 shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {calvingYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              <SelectItem value="all">All years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateCalvingReport}><FileDown className="h-4 w-4 mr-1" />Audit Report</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Calving</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!calvingRecords.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No calving records yet.</CardContent></Card>}
          {calvingRecords.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.calvingDate)}</span>
                    {r.cowEarTag && <span className="text-sm text-gray-700 font-mono">Dam: {r.cowEarTag}</span>}
                    <EaseScoreBadge v={r.calvingEaseScore} />
                    {r.numberOfCalves && r.numberOfCalves > 1 && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Twins × {r.numberOfCalves}</span>}
                    {r.calfOutcome && <span className={`text-xs px-2 py-0.5 rounded ${r.calfOutcome === "live" ? "bg-green-100 text-green-700" : r.calfOutcome === "stillborn" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{r.calfOutcome.charAt(0).toUpperCase() + r.calfOutcome.slice(1)}</span>}
                    {r.calfSex && <span className="text-xs text-gray-500">{r.calfSex === "male" ? "Bull calf" : r.calfSex === "female" ? "Heifer calf" : r.calfSex}</span>}
                    {r.calfEarTag && <span className="text-xs text-gray-500 font-mono">Calf: {r.calfEarTag}</span>}
                    {r.calfAnimalId && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">In Livestock Register ✓</span>}
                    {r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h"}
                      </span>
                    )}
                    {r.bcmsPassportApplied
                      ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Passport applied ✓</span>
                      : (() => {
                          const daysOld = Math.floor((Date.now() - new Date(r.calvingDate).getTime()) / 86400000);
                          if (daysOld >= 27) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">⚠ Passport overdue ({daysOld}d)</span>;
                          if (daysOld >= 20) return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Passport due in {27 - daysOld}d</span>;
                          return null;
                        })()
                    }
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </>); })()}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Calving Record — {viewRecord.cowEarTag || `Record #${viewRecord.id}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calving Date</p><p className="font-medium">{formatDate(viewRecord.calvingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dam Ear Tag</p><p className="font-medium font-mono">{viewRecord.cowEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><p className="font-medium">{viewRecord.calvingEaseScore ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][viewRecord.calvingEaseScore] ?? viewRecord.calvingEaseScore : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">No. of Calves</p><p className="font-medium">{viewRecord.numberOfCalves ?? 1}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Outcome</p><p className="font-medium capitalize">{viewRecord.calfOutcome || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Sex</p><p className="font-medium capitalize">{viewRecord.calfSex || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Ear Tag</p><p className="font-medium font-mono">{viewRecord.calfEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Weight (kg)</p><p className="font-medium">{viewRecord.calfBirthWeightKg || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assistance Required</p><p className="font-medium">{viewRecord.assistanceRequired ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Attended</p><p className="font-medium">{viewRecord.vetAttended ? viewRecord.vetName || "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BCMS Passport</p><p className="font-medium">{viewRecord.bcmsPassportApplied ? "Applied ✓" : "Pending"}</p></div>
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="calving" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "62rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Calving Record" : "Add Calving Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column: cow + calf ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cow Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Calving Date *</Label><Input type="date" value={form.calvingDate?.slice(0, 10) || ""} onChange={e => set("calvingDate", e.target.value)} /></div>
                  <div>
                    <Label>Dam Ear Tag</Label>
                    {cows.length > 0 && !showManualEarTag ? (
                      <Select
                        value={form.cowAnimalId ? String(form.cowAnimalId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__manual__") { setShowManualEarTag(true); set("cowAnimalId", null); return; }
                          const animal = cows.find(a => a.id === parseInt(v));
                          set("cowAnimalId", v === "__none__" ? null : parseInt(v));
                          set("cowEarTag", animal?.earTagNumber ?? null);
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select cow..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {cows.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.earTagNumber!}</SelectItem>)}
                          <SelectItem value="__manual__">Enter tag manually…</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input value={form.cowEarTag || ""} onChange={e => set("cowEarTag", e.target.value)} placeholder="Cow's BCMS ear tag" />
                        {cows.length > 0 && (
                          <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualEarTag(false); set("cowAnimalId", null); set("cowEarTag", null); }}>↩</Button>
                        )}
                      </div>
                    )}
                    {cows.length === 0 && animalsQ.isSuccess && (
                      <p className="text-xs text-amber-600 mt-1">No cattle registered. Add animals in the Livestock page, or type the ear tag above.</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Calving Ease Score *</Label>
                  <Select value={String(form.calvingEaseScore || "")} onValueChange={v => set("calvingEaseScore", v ? parseInt(v) : null)}>
                    <SelectTrigger><SelectValue placeholder="Select score..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 — Unassisted</SelectItem>
                      <SelectItem value="2">2 — Minor assistance (1 person)</SelectItem>
                      <SelectItem value="3">3 — Major assistance (calving aid)</SelectItem>
                      <SelectItem value="4">4 — Vet/caesarean required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Cow Complications</Label><Input value={form.cowComplications || ""} onChange={e => set("cowComplications", e.target.value)} placeholder="e.g. retained placenta, hypocalcaemia" /></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ar" checked={!!form.assistanceRequired} onChange={e => { set("assistanceRequired", e.target.checked); if (!e.target.checked) set("assistanceType", null); }} className="rounded" />
                    <Label htmlFor="ar">Assistance required</Label>
                  </div>
                  {form.assistanceRequired && (
                    <div className="pl-6">
                      <Label>Type of Assistance</Label>
                      <Select value={form.assistanceType || "__none__"} onValueChange={v => set("assistanceType", v === "__none__" ? null : v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          <SelectItem value="manual-1-person">Manual — 1 person</SelectItem>
                          <SelectItem value="manual-2-person">Manual — 2 persons</SelectItem>
                          <SelectItem value="calving-aid">Calving aid / jack</SelectItem>
                          <SelectItem value="vet-assisted">Vet-assisted delivery</SelectItem>
                          <SelectItem value="caesarean">Caesarean section</SelectItem>
                          <SelectItem value="embryotomy">Embryotomy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="va" checked={!!form.vetAttended} onChange={e => { set("vetAttended", e.target.checked); if (!e.target.checked) { set("vetName", null); setShowManualVet(false); } }} className="rounded" />
                    <Label htmlFor="va">Vet attended</Label>
                  </div>
                  {form.vetAttended && (
                    <div className="pl-6">
                      <Label>Vet Name</Label>
                      {uniqueVetNames.length > 0 && !showManualVet ? (
                        <Select
                          value={form.vetName && uniqueVetNames.includes(form.vetName) ? form.vetName : "__none__"}
                          onValueChange={v => {
                            if (v === "__manual__") { setShowManualVet(true); set("vetName", ""); return; }
                            set("vetName", v === "__none__" ? null : v);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Select vet..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Not specified</SelectItem>
                            {uniqueVetNames.map(n => <SelectItem key={n} value={n}>{n}{vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""}</SelectItem>)}
                            <SelectItem value="__manual__">Enter new vet name…</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex gap-1">
                          <Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Vet's name" />
                          {uniqueVetNames.length > 0 && (
                            <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualVet(false); set("vetName", null); }}>↩</Button>
                          )}
                        </div>
                      )}
                      {vetVisitsQ.isSuccess && uniqueVetNames.length === 0 && !showManualVet && (
                        <p className="text-xs text-gray-400 mt-1">No previous vets on record — type the name above.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calf Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><Label>Number of Calves</Label><Input type="number" min="1" max="4" value={form.numberOfCalves || 1} onChange={e => { const n = parseInt(e.target.value); set("numberOfCalves", n); if (n < 2) { set("calfOutcome2", null); set("calfSex2", null); set("calfEarTag2", null); set("calfBirthWeightKg2", null); } }} /></div>
                </div>
                {/* Calf 1 */}
                {(form.numberOfCalves ?? 1) >= 2 && <p className="text-xs font-medium text-gray-500">Calf 1</p>}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Outcome" : "Calf Outcome"}</Label>
                    <Select value={form.calfOutcome || ""} onValueChange={v => set("calfOutcome", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="stillborn">Stillborn</SelectItem>
                        <SelectItem value="died-within-24h">Died within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Sex" : "Calf Sex"}</Label>
                    <Select value={form.calfSex || ""} onValueChange={v => set("calfSex", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Heifer (Female)</SelectItem>
                        <SelectItem value="male">Bull Calf (Male)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Ear Tag" : "Calf Ear Tag"}</Label>
                    <Input value={form.calfEarTag || ""} onChange={e => set("calfEarTag", e.target.value)} placeholder="BCMS ear tag number" />
                    {form.calfOutcome === "live" && form.calfEarTag && !form.calfAnimalId && (
                      <p className="text-xs text-teal-600 mt-1">Live calf will be auto-registered in the Livestock module on save — no double entry needed.</p>
                    )}
                    {form.calfAnimalId && (
                      <p className="text-xs text-teal-600 mt-1">Already in Livestock Register (ID #{form.calfAnimalId}). Movements &amp; destination tracked there.</p>
                    )}
                  </div>
                  <div><Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Birth Weight (kg)" : "Birth Weight (kg)"}</Label><Input type="number" step="0.1" value={form.calfBirthWeightKg || ""} onChange={e => set("calfBirthWeightKg", e.target.value)} /></div>
                </div>
                {/* Calf 2 (twins) */}
                {(form.numberOfCalves ?? 1) >= 2 && (
                  <>
                    <p className="text-xs font-medium text-gray-500 pt-1 border-t">Calf 2</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Calf 2 Outcome</Label>
                        <Select value={form.calfOutcome2 || ""} onValueChange={v => set("calfOutcome2", v)}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="stillborn">Stillborn</SelectItem>
                            <SelectItem value="died-within-24h">Died within 24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Calf 2 Sex</Label>
                        <Select value={form.calfSex2 || ""} onValueChange={v => set("calfSex2", v)}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Heifer (Female)</SelectItem>
                            <SelectItem value="male">Bull Calf (Male)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Calf 2 Ear Tag</Label>
                        <Input value={form.calfEarTag2 || ""} onChange={e => set("calfEarTag2", e.target.value)} placeholder="BCMS ear tag number" />
                        {form.calfOutcome2 === "live" && form.calfEarTag2 && !form.calfAnimalId2 && (
                          <p className="text-xs text-teal-600 mt-1">Live calf will be auto-registered in the Livestock module on save.</p>
                        )}
                      </div>
                      <div><Label>Calf 2 Birth Weight (kg)</Label><Input type="number" step="0.1" value={form.calfBirthWeightKg2 || ""} onChange={e => set("calfBirthWeightKg2", e.target.value)} /></div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label>Conception Method</Label>
                    <Select
                      value={form.conceptionMethod || "__none__"}
                      onValueChange={v => {
                        const method = v === "__none__" ? null : v;
                        set("conceptionMethod", method);
                        set("sireRegisterId", null);
                        set("strawInventoryId", null);
                        set("sireBreed", "");
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not recorded</SelectItem>
                        <SelectItem value="natural">Natural Service (bull)</SelectItem>
                        <SelectItem value="ai">AI — Artificial Insemination</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.conceptionMethod === "natural" && (
                    <div className="col-span-2">
                      <Label>Sire (from Sire Register)</Label>
                      <Select
                        value={form.sireRegisterId ? String(form.sireRegisterId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__none__") { set("sireRegisterId", null); set("sireBreed", ""); return; }
                          const sire = activeSires.find(s => s.id === parseInt(v));
                          set("sireRegisterId", parseInt(v));
                          set("sireBreed", sire?.breed ?? "");
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select sire..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {activeSires.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}{s.breed ? ` (${s.breed})` : ""}{s.tagNumber ? ` — ${s.tagNumber}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {siresQ.isSuccess && activeSires.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">No bulls in Sire Register. Add them via the Livestock → Breeding section.</p>
                      )}
                      {form.sireBreed && <p className="text-xs text-gray-500 mt-1">Breed auto-filled: {form.sireBreed}</p>}
                    </div>
                  )}
                  {form.conceptionMethod === "ai" && (
                    <div className="col-span-2">
                      <Label>AI Straw (from Inventory)</Label>
                      <Select
                        value={form.strawInventoryId ? String(form.strawInventoryId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__none__") { set("strawInventoryId", null); set("sireBreed", ""); return; }
                          const straw = cattleStraws.find(s => s.id === parseInt(v));
                          set("strawInventoryId", parseInt(v));
                          set("sireBreed", straw?.sireBreed ?? "");
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select straw batch..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {cattleStraws.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.sireName}{s.sireBreed ? ` (${s.sireBreed})` : ""} — Batch {s.batchNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {strawsQ.isSuccess && cattleStraws.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">No AI straws in inventory. Add them via the Livestock → Breeding section.</p>
                      )}
                      {form.sireBreed && <p className="text-xs text-gray-500 mt-1">Sire breed auto-filled: {form.sireBreed}</p>}
                    </div>
                  )}
                  {(!form.conceptionMethod || form.conceptionMethod === "unknown") && (
                    <div className="col-span-2">
                      <Label>Sire Breed</Label>
                      <Input value={form.sireBreed || ""} onChange={e => set("sireBreed", e.target.value)} placeholder="e.g. Aberdeen Angus" />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Calf Disposition <span className="font-normal text-gray-400">(optional — can be updated later)</span></Label>
                  <Select value={form.calfDisposition || "__none__"} onValueChange={v => set("calfDisposition", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Not yet decided..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not yet decided</SelectItem>
                      <SelectItem value="retained">Retained on farm (rear)</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="market">To market / auction</SelectItem>
                      <SelectItem value="died">Died post-birth</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">Only needed for calves leaving the holding (sold/market) or that die post-birth. Calves retained on farm have their movements tracked automatically through the Livestock module — no need to record disposition here.</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="bpp" checked={!!form.bcmsPassportApplied} onChange={e => set("bcmsPassportApplied", e.target.checked)} className="rounded" />
                    <Label htmlFor="bpp">BCMS passport applied</Label>
                  </div>
                  <p className="text-xs text-gray-400 ml-6">UK rules: passport must be applied within 36 days of birth (or within 7 days if the calf leaves the farm of birth before day 36). Tick once submitted to BCMS/CTS.</p>
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column: colostrum + notes ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colostrum Management</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="c2h" checked={!!form.colostrumGivenWithin2Hours} onChange={e => set("colostrumGivenWithin2Hours", e.target.checked)} className="rounded" />
                    <Label htmlFor="c2h">Colostrum given within 2 hours</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="c6h" checked={!!form.colostrumGivenWithin6Hours} onChange={e => set("colostrumGivenWithin6Hours", e.target.checked)} className="rounded" />
                    <Label htmlFor="c6h">Colostrum given within 6 hours</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>First Feed Volume (L)</Label><Input type="number" step="0.1" value={form.colostrumVolumeFirstFeedLitres || ""} onChange={e => set("colostrumVolumeFirstFeedLitres", e.target.value)} /></div>
                  <div><Label>Brix Quality (%)</Label><Input type="number" step="0.1" value={form.colostrumQualityBrix || ""} onChange={e => set("colostrumQualityBrix", e.target.value)} placeholder="≥22% = good" /></div>
                </div>
                <div>
                  <Label>Colostrum Source</Label>
                  <Select value={form.colostrumSource || ""} onValueChange={v => set("colostrumSource", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own-dam">Own dam</SelectItem>
                      <SelectItem value="other-cow">Other cow on farm</SelectItem>
                      <SelectItem value="frozen-stored">Frozen/stored colostrum</SelectItem>
                      <SelectItem value="colostrum-supplement">Commercial colostrum supplement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={5} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.calvingDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Calving"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Body Condition Scoring ────────────────────────────────────────────────────

interface BcsRecord {
  id: number; herdId?: number | null; animalId?: number | null; earTagNumber?: string | null;
  assessmentDate: string; lifeStage?: string | null; bcsScore?: string | null;
  assessedBy?: string | null; targetScore?: string | null; actionRequired?: boolean;
  actionTaken?: string | null; notes?: string | null;
}

function BcsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BcsRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<BcsRecord | null>(null);
  const [form, setForm] = useState<Partial<BcsRecord>>({});

  const { data, isLoading } = useQuery<{ records: BcsRecord[] }>({
    queryKey: ["dairy-bcs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bcs-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<BcsRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/bcs-records/${editing.id}`) : api(`farms/${farmId}/dairy/bcs-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/bcs-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ assessmentDate: today() }); setOpen(true); }
  function openEdit(r: BcsRecord) { setEditing(r); setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10) }); setOpen(true); }
  function set(k: keyof BcsRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const LIFE_STAGES = ["Early lactation (0-60 DIM)", "Mid lactation (60-200 DIM)", "Late lactation (>200 DIM)", "Dry period", "At dry-off", "At calving", "Heifers pre-calving"];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Body Condition Scoring (BCS) — document at dry-off, calving, and mid-lactation. Target range: 2.5–3.5 on a 1–5 scale.</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add BCS</Button>
      </div>
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View BCS Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{formatDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ear Tag Number</p><p className="font-medium">{String(viewRecord.earTagNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Life Stage</p><p className="font-medium capitalize">{String(viewRecord.lifeStage ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BCS Score</p><p className="font-medium">{String(viewRecord.bcsScore ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Score</p><p className="font-medium">{String(viewRecord.targetScore ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{String(viewRecord.assessedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Required</p><p className="font-medium">{viewRecord.actionRequired ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Taken</p><p className="font-medium">{String(viewRecord.actionTaken ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No BCS records yet.</CardContent></Card>}
          {data?.records?.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.assessmentDate)}</span>
                    {r.earTagNumber && <span className="text-sm text-gray-700 font-mono">{r.earTagNumber}</span>}
                    {r.lifeStage && <span className="text-xs text-gray-500">{r.lifeStage}</span>}
                    {r.bcsScore && <><BcsBadge v={r.bcsScore} />{r.targetScore && <span className="text-xs text-gray-400">Target: {r.targetScore}</span>}</>}
                    {r.assessedBy && <span className="text-xs text-gray-400">by {r.assessedBy}</span>}
                    {r.actionRequired && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Action needed</span>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.actionTaken && <p className="text-xs text-gray-400 mt-1">Action: {r.actionTaken}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit BCS Record" : "Add BCS Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate?.slice(0, 10) || ""} onChange={e => set("assessmentDate", e.target.value)} /></div>
            <div><Label>Cow Ear Tag (or leave blank for group)</Label><Input value={form.earTagNumber || ""} onChange={e => set("earTagNumber", e.target.value)} /></div>
            <div>
              <Label>Life Stage</Label>
              <Select value={form.lifeStage || ""} onValueChange={v => set("lifeStage", v)}>
                <SelectTrigger><SelectValue placeholder="Select life stage..." /></SelectTrigger>
                <SelectContent>{LIFE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>BCS Score (1–5 scale)</Label>
              <Select value={form.bcsScore || ""} onValueChange={v => set("bcsScore", v)}>
                <SelectTrigger><SelectValue placeholder="Select score..." /></SelectTrigger>
                <SelectContent>
                  {["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Score</Label>
              <Select value={form.targetScore || ""} onValueChange={v => set("targetScore", v)}>
                <SelectTrigger><SelectValue placeholder="Optional target..." /></SelectTrigger>
                <SelectContent>
                  {["2.0","2.5","3.0","3.5","4.0"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Assessed By</Label><Input value={form.assessedBy || ""} onChange={e => set("assessedBy", e.target.value)} /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="acreq" checked={!!form.actionRequired} onChange={e => set("actionRequired", e.target.checked)} className="rounded" />
              <Label htmlFor="acreq">Management action required</Label>
            </div>
            <div className="col-span-2"><Label>Action Taken</Label><Input value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} placeholder="e.g. Moved to higher energy group, supplemented" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.assessmentDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add BCS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Mobility Scoring ──────────────────────────────────────────────────────────

interface MobilityScoring {
  id: number; herdId?: number | null; assessmentDate: string; assessedBy?: string | null;
  totalCowsScored: number; score0Count: number; score1Count: number; score2Count: number; score3Count: number;
  lamenessPrevalencePercent?: string | null; actionTaken?: string | null;
  nextAssessmentDue?: string | null; notes?: string | null;
}

function MobilityTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MobilityScoring | null>(null);
  const [viewRecord, setViewRecord] = useState<MobilityScoring | null>(null);
  const [form, setForm] = useState<Partial<MobilityScoring>>({});

  const { data, isLoading } = useQuery<{ records: MobilityScoring[] }>({
    queryKey: ["dairy-mobility", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mobility-scorings`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<MobilityScoring>) => {
      const url = editing ? api(`farms/${farmId}/dairy/mobility-scorings/${editing.id}`) : api(`farms/${farmId}/dairy/mobility-scorings`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/mobility-scorings/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ assessmentDate: today(), score0Count: 0, score1Count: 0, score2Count: 0, score3Count: 0 }); setOpen(true); }
  function openEdit(r: MobilityScoring) { setEditing(r); setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10), nextAssessmentDue: r.nextAssessmentDue?.slice(0, 10) }); setOpen(true); }
  function set(k: keyof MobilityScoring, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const total = (form.score0Count || 0) + (form.score1Count || 0) + (form.score2Count || 0) + (form.score3Count || 0);
  const prevalence = total > 0 ? (((form.score3Count || 0) / total) * 100).toFixed(1) : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Quarterly mobility/lameness scoring — score cows 0–3 as they walk from the parlour. Red Tractor target: score 3 (lame) cows below 10% of herd.</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Assessment</Button>
      </div>
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Mobility Assessment</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{formatDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{String(viewRecord.assessedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Scored</p><p className="font-medium">{String(viewRecord.totalCowsScored ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Score 0 (Normal)</p><p className="font-medium">{String(viewRecord.score0Count ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Score 1</p><p className="font-medium">{String(viewRecord.score1Count ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Score 2</p><p className="font-medium">{String(viewRecord.score2Count ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Score 3 (Lame)</p><p className="font-medium">{String(viewRecord.score3Count ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lameness %</p><p className="font-medium">{String(viewRecord.lamenessPrevalencePercent ?? "—")}%</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Taken</p><p className="font-medium">{String(viewRecord.actionTaken ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Due</p><p className="font-medium">{formatDate(viewRecord.nextAssessmentDue)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No mobility assessments yet. Assessments should be carried out at least quarterly.</CardContent></Card>}
          {data?.records?.map(r => {
            const prev = r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null;
            return (
              <Card key={r.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-sm">{formatDate(r.assessmentDate)}</span>
                      <span className="text-xs text-gray-500">{r.totalCowsScored} cows scored</span>
                      <div className="flex gap-1 text-xs">
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">0: {r.score0Count}</span>
                        <span className="bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded">1: {r.score1Count}</span>
                        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">2: {r.score2Count}</span>
                        <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">3: {r.score3Count}</span>
                      </div>
                      {prev !== null && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prev >= 10 ? "bg-red-100 text-red-700" : prev >= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          Lameness: {prev}%{prev >= 10 ? " ⚠ above target" : ""}
                        </span>
                      )}
                      {r.assessedBy && <span className="text-xs text-gray-400">by {r.assessedBy}</span>}
                      {r.nextAssessmentDue && <span className="text-xs text-gray-400">Next: {formatDate(r.nextAssessmentDue)}</span>}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {r.actionTaken && <p className="text-xs text-gray-400 mt-1">Action: {r.actionTaken}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "56rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Mobility Assessment" : "Add Mobility Assessment"}</DialogTitle>
          </DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column: scores ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate?.slice(0, 10) || ""} onChange={e => set("assessmentDate", e.target.value)} /></div>
                <div><Label>Assessed By</Label><Input value={form.assessedBy || ""} onChange={e => set("assessedBy", e.target.value)} /></div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Score counts (observe cows walking from parlour)</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-green-700 mb-0.5">Score 0 — Normal</p>
                  <p className="text-xs text-green-600 mb-2">Perfect gait, even weight bearing</p>
                  <Input type="number" min="0" className="text-center" value={form.score0Count || 0} onChange={e => set("score0Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-lime-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-lime-700 mb-0.5">Score 1 — Imperfect</p>
                  <p className="text-xs text-lime-600 mb-2">Minor gait imperfection</p>
                  <Input type="number" min="0" className="text-center" value={form.score1Count || 0} onChange={e => set("score1Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-amber-700 mb-0.5">Score 2 — Impaired</p>
                  <p className="text-xs text-amber-600 mb-2">Clear gait impairment, arched back</p>
                  <Input type="number" min="0" className="text-center" value={form.score2Count || 0} onChange={e => set("score2Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-red-700 mb-0.5">Score 3 — Lame</p>
                  <p className="text-xs text-red-600 mb-2">Severely lame, reluctant to bear weight</p>
                  <Input type="number" min="0" className="text-center" value={form.score3Count || 0} onChange={e => set("score3Count", parseInt(e.target.value) || 0)} />
                </div>
              </div>
              {total > 0 && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center ${prevalence && parseFloat(prevalence) >= 10 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {total} cows scored — Lameness prevalence (score 3): <strong>{prevalence}%</strong>
                  {prevalence && parseFloat(prevalence) >= 10 ? " — Above 10% target." : " — Within target."}
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column: actions & notes ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <Label>Action Taken</Label>
                <Textarea value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} placeholder="e.g. Score 3 cows referred to vet for foot trimming" rows={4} />
              </div>
              <div>
                <Label>Next Assessment Due</Label>
                <Input type="date" value={form.nextAssessmentDue || ""} onChange={e => set("nextAssessmentDue", e.target.value)} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={4} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form, totalCowsScored: total })} disabled={save.isPending || !form.assessmentDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Bulk Tank Records ─────────────────────────────────────────────────────────

// ─── Bulk Tank interfaces ─────────────────────────────────────────────────────

interface BulkTank {
  id: number; name: string; location?: string | null;
  capacityLitres?: string | null; notes?: string | null;
}

interface BulkTankRecord {
  id: number; tankId?: number | null; recordDate: string; recordType: string;
  tankTemperatureCelsius?: string | null; tankCleaned?: boolean;
  cleaningProductUsed?: string | null; cleaningProductBatch?: string | null;
  antibioticResidueTestRef?: string | null; antibioticResidueResult?: string | null;
  notes?: string | null;
}

interface MilkCollection {
  id: number; tankId?: number | null; collectionDate: string;
  volumeCollectedLitres?: string | null; milkBuyer?: string | null;
  tankerRegistration?: string | null; tankerDriverName?: string | null;
  collectionRef?: string | null; abtResultBeforeCollection?: string | null;
  notes?: string | null;
}

// ─── ABR badge helper ─────────────────────────────────────────────────────────
function AbrBadge({ result }: { result?: string | null }) {
  if (!result) return null;
  const ok = result === "negative";
  return (
    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      ABR: {result}
    </span>
  );
}

// ─── Temperature badge helper ─────────────────────────────────────────────────
function TempBadge({ v }: { v?: string | null }) {
  if (!v) return null;
  const n = parseFloat(v);
  const cls = n <= 4 ? "bg-green-100 text-green-700" : n <= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${cls}`}><Thermometer className="h-3 w-3" />{v}°C</span>;
}

// ─── BulkTankTab ──────────────────────────────────────────────────────────────

function BulkTankTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();

  // ── Tank registry ──────────────────────────────────────────────────────────
  const [tanksOpen, setTanksOpen] = useState(true);
  const [tankDialog, setTankDialog] = useState(false);
  const [editingTank, setEditingTank] = useState<BulkTank | null>(null);
  const [tankForm, setTankForm] = useState<Partial<BulkTank>>({});

  const tanksQ = useQuery<{ tanks: BulkTank[] }>({
    queryKey: ["dairy-tanks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/tanks`), { credentials: "include" }).then(r => r.json()),
  });
  const tanks = tanksQ.data?.tanks ?? [];

  const saveTank = useMutation({
    mutationFn: (body: Partial<BulkTank>) => {
      const url = editingTank ? api(`farms/${farmId}/dairy/tanks/${editingTank.id}`) : api(`farms/${farmId}/dairy/tanks`);
      return fetch(url, { method: editingTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] }); setTankDialog(false); setEditingTank(null); setTankForm({}); },
  });
  const delTank = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/tanks/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] }),
  });

  function openAddTank() { setEditingTank(null); setTankForm({}); setTankDialog(true); }
  function openEditTank(t: BulkTank) { setEditingTank(t); setTankForm({ ...t }); setTankDialog(true); }

  // ── Monitoring records ─────────────────────────────────────────────────────
  const [monDialog, setMonDialog] = useState(false);
  const [editingMon, setEditingMon] = useState<BulkTankRecord | null>(null);
  const [viewMon, setViewMon] = useState<BulkTankRecord | null>(null);
  const [monForm, setMonForm] = useState<Partial<BulkTankRecord>>({});

  const monQ = useQuery<{ records: BulkTankRecord[] }>({
    queryKey: ["dairy-tank-records", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bulk-tank-records`), { credentials: "include" }).then(r => r.json()),
  });

  const saveMon = useMutation({
    mutationFn: (body: Partial<BulkTankRecord>) => {
      const url = editingMon ? api(`farms/${farmId}/dairy/bulk-tank-records/${editingMon.id}`) : api(`farms/${farmId}/dairy/bulk-tank-records`);
      return fetch(url, { method: editingMon ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] }); setMonDialog(false); setEditingMon(null); setMonForm({}); },
  });
  const delMon = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/bulk-tank-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] }),
  });

  function openAddMon() { setEditingMon(null); setMonForm({ recordDate: today(), recordType: "daily-temperature" }); setMonDialog(true); }
  function openEditMon(r: BulkTankRecord) { setEditingMon(r); setMonForm({ ...r, recordDate: r.recordDate.slice(0, 10) }); setMonDialog(true); }
  function setMon(k: keyof BulkTankRecord, v: unknown) { setMonForm(f => ({ ...f, [k]: v })); }

  // ── Milk collections ───────────────────────────────────────────────────────
  const [collDialog, setCollDialog] = useState(false);
  const [editingColl, setEditingColl] = useState<MilkCollection | null>(null);
  const [viewColl, setViewColl] = useState<MilkCollection | null>(null);
  const [collForm, setCollForm] = useState<Partial<MilkCollection>>({});

  const collQ = useQuery<{ collections: MilkCollection[] }>({
    queryKey: ["dairy-milk-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-collections`), { credentials: "include" }).then(r => r.json()),
  });

  const saveColl = useMutation({
    mutationFn: (body: Partial<MilkCollection>) => {
      const url = editingColl ? api(`farms/${farmId}/dairy/milk-collections/${editingColl.id}`) : api(`farms/${farmId}/dairy/milk-collections`);
      return fetch(url, { method: editingColl ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] }); setCollDialog(false); setEditingColl(null); setCollForm({}); },
  });
  const delColl = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/milk-collections/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] }),
  });

  function openAddColl() { setEditingColl(null); setCollForm({ collectionDate: today() }); setCollDialog(true); }
  function openEditColl(c: MilkCollection) { setEditingColl(c); setCollForm({ ...c, collectionDate: c.collectionDate.slice(0, 10) }); setCollDialog(true); }
  function setColl(k: keyof MilkCollection, v: unknown) { setCollForm(f => ({ ...f, [k]: v })); }

  const tankName = (id?: number | null) => tanks.find(t => t.id === id)?.name ?? null;

  return (
    <div className="space-y-6">

      {/* ── Section 1: Tank Registry ────────────────────────────────────────── */}
      <div className="border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          onClick={() => setTanksOpen(o => !o)}
        >
          <span className="font-semibold text-sm text-gray-800">Registered Bulk Tanks ({tanks.length})</span>
          {tanksOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
        </button>
        {tanksOpen && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500">Register each bulk tank on the holding. Once registered, select the tank when logging monitoring records or milk collections.</p>
            {tanksQ.isLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              : tanks.length === 0
                ? <p className="text-sm text-gray-400 italic">No tanks registered yet. Add your first tank below.</p>
                : tanks.map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-white border rounded px-3 py-2">
                    <div>
                      <span className="font-medium text-sm">{t.name}</span>
                      {t.location && <span className="text-xs text-gray-500 ml-2">· {t.location}</span>}
                      {t.capacityLitres && <span className="text-xs text-gray-400 ml-2">· {Number(t.capacityLitres).toLocaleString()} L capacity</span>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditTank(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => delTank.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))
            }
            <Button size="sm" variant="outline" onClick={openAddTank}><Plus className="h-3.5 w-3.5 mr-1" />Add Tank</Button>
          </div>
        )}
      </div>

      {/* ── Section 2: Tank Monitoring Records ─────────────────────────────── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-semibold text-sm text-gray-800">Tank Monitoring Records</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daily temperature checks, cleaning, antibiotic residue tests, and maintenance logs.</p>
          </div>
          <Button size="sm" onClick={openAddMon} disabled={tanksQ.isLoading || tanks.length === 0}>
            <Plus className="h-4 w-4 mr-1" />Add Record
          </Button>
        </div>
        {!tanksQ.isLoading && tanks.length === 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">No tanks registered.</span> You must register at least one bulk tank before adding monitoring records.
              Use the <span className="font-semibold">Registered Bulk Tanks</span> section above to add your first tank.
            </p>
          </div>
        )}
        {monQ.isLoading
          ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          : !monQ.data?.records?.length
            ? <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No monitoring records yet.</CardContent></Card>
            : <div className="space-y-2">
              {monQ.data.records.map(r => (
                <Card key={r.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{formatDate(r.recordDate)}</span>
                        {r.tankId && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tankName(r.tankId)}</span>}
                        <span className="text-xs text-gray-500 capitalize">{r.recordType.replace(/-/g, " ")}</span>
                        <TempBadge v={r.tankTemperatureCelsius} />
                        {r.tankCleaned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Cleaned</span>}
                        {r.cleaningProductUsed && <span className="text-xs text-gray-400">{r.cleaningProductUsed}</span>}
                        <AbrBadge result={r.antibioticResidueResult} />
                      </div>
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMon(r)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMon(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => delMon.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
        }
      </div>

      {/* ── Section 3: Milk Collections ─────────────────────────────────────── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-semibold text-sm text-gray-800">Milk Collections</h3>
            <p className="text-xs text-gray-500 mt-0.5">Log each collection event — tanker arrival, volume drawn, driver, and collection reference from the milk buyer.</p>
          </div>
          <Button size="sm" onClick={openAddColl} disabled={tanksQ.isLoading || tanks.length === 0}>
            <Plus className="h-4 w-4 mr-1" /><Droplets className="h-3.5 w-3.5 mr-1" />Log Collection
          </Button>
        </div>
        {!tanksQ.isLoading && tanks.length === 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">No tanks registered.</span> You must register at least one bulk tank before logging a collection.
              Use the <span className="font-semibold">Registered Bulk Tanks</span> section above to add your first tank.
            </p>
          </div>
        )}
        {collQ.isLoading
          ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          : !collQ.data?.collections?.length
            ? <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No collection records yet.</CardContent></Card>
            : <div className="space-y-2">
              {collQ.data.collections.map(c => (
                <Card key={c.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{formatDate(c.collectionDate)}</span>
                        {c.tankId && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tankName(c.tankId)}</span>}
                        {c.volumeCollectedLitres && <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{Number(c.volumeCollectedLitres).toLocaleString()} L</span>}
                        {c.milkBuyer && <span className="text-xs text-gray-500">{c.milkBuyer}</span>}
                        {c.collectionRef && <span className="text-xs text-gray-400">Ref: {c.collectionRef}</span>}
                        {c.tankerRegistration && <span className="text-xs text-gray-400 font-mono">{c.tankerRegistration}</span>}
                        <AbrBadge result={c.abtResultBeforeCollection} />
                      </div>
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewColl(c)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditColl(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => delColl.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {c.tankerDriverName && <p className="text-xs text-gray-400 mt-1">Driver: {c.tankerDriverName}</p>}
                    {c.notes && <p className="text-xs text-gray-400 mt-1">{c.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
        }
      </div>

      {/* ── Tank Registry Dialog ─────────────────────────────────────────────── */}
      <Dialog open={tankDialog} onOpenChange={setTankDialog}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editingTank ? "Edit Tank" : "Add Bulk Tank"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Tank Name / Designation *</Label>
              <Input placeholder="e.g. Tank 1, Main Tank, Overflow Tank" value={tankForm.name || ""} onChange={e => setTankForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Location on Holding</Label>
              <Input placeholder="e.g. Main Dairy, North Unit" value={tankForm.location || ""} onChange={e => setTankForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <Label>Capacity (litres)</Label>
              <Input type="number" placeholder="e.g. 12000" value={tankForm.capacityLitres || ""} onChange={e => setTankForm(f => ({ ...f, capacityLitres: e.target.value }))} />
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={tankForm.notes || ""} onChange={e => setTankForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTankDialog(false)}>Cancel</Button>
            <Button onClick={() => saveTank.mutate(tankForm)} disabled={saveTank.isPending || !tankForm.name?.trim()}>
              {saveTank.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingTank ? "Save Changes" : "Add Tank"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Monitoring Record View Dialog ────────────────────────────────────── */}
      {viewMon && (
        <Dialog open onOpenChange={() => setViewMon(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>View Monitoring Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{formatDate(viewMon.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tank</p><p className="font-medium">{tankName(viewMon.tankId) ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Record Type</p><p className="font-medium capitalize">{viewMon.recordType.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Temperature (°C)</p><p className="font-medium">{viewMon.tankTemperatureCelsius ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tank Cleaned</p><p className="font-medium">{viewMon.tankCleaned ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleaning Product</p><p className="font-medium">{viewMon.cleaningProductUsed ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleaning Batch</p><p className="font-medium">{viewMon.cleaningProductBatch ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Result</p><p className="font-medium capitalize">{viewMon.antibioticResidueResult ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Test Ref</p><p className="font-medium">{viewMon.antibioticResidueTestRef ?? "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewMon.notes ?? "—"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEditMon(viewMon); setViewMon(null); }}>Edit</Button>
              <Button onClick={() => setViewMon(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Monitoring Record Add/Edit Dialog ────────────────────────────────── */}
      <Dialog open={monDialog} onOpenChange={setMonDialog}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editingMon ? "Edit Monitoring Record" : "Add Monitoring Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Date *</Label><Input type="date" value={monForm.recordDate?.slice(0, 10) || ""} onChange={e => setMon("recordDate", e.target.value)} /></div>
            <div>
              <Label>Tank</Label>
              <Select value={monForm.tankId ? String(monForm.tankId) : "__none__"} onValueChange={v => setMon("tankId", v !== "__none__" ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not specified</SelectItem>
                  {tanks.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}{t.location ? ` — ${t.location}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Record Type *</Label>
              <Select value={monForm.recordType || "daily-temperature"} onValueChange={v => setMon("recordType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily-temperature">Daily Temperature Check</SelectItem>
                  <SelectItem value="cleaning">Tank Cleaning</SelectItem>
                  <SelectItem value="antibiotic-residue-test">Antibiotic Residue Test</SelectItem>
                  <SelectItem value="maintenance">Tank Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tank Temperature (°C)</Label><Input type="number" step="0.1" value={monForm.tankTemperatureCelsius || ""} onChange={e => setMon("tankTemperatureCelsius", e.target.value)} placeholder="Target ≤4°C" /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="tc" checked={!!monForm.tankCleaned} onChange={e => setMon("tankCleaned", e.target.checked)} className="rounded" />
              <Label htmlFor="tc">Tank cleaned and sanitised</Label>
            </div>
            {monForm.tankCleaned && <>
              <div><Label>Cleaning Product</Label><Input value={monForm.cleaningProductUsed || ""} onChange={e => setMon("cleaningProductUsed", e.target.value)} /></div>
              <div><Label>Product Batch Number</Label><Input value={monForm.cleaningProductBatch || ""} onChange={e => setMon("cleaningProductBatch", e.target.value)} /></div>
            </>}
            <div>
              <Label>Antibiotic Residue Result</Label>
              <Select value={monForm.antibioticResidueResult || ""} onValueChange={v => setMon("antibioticResidueResult", v)}>
                <SelectTrigger><SelectValue placeholder="Not tested" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>ABR Test Reference</Label><Input value={monForm.antibioticResidueTestRef || ""} onChange={e => setMon("antibioticResidueTestRef", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={monForm.notes || ""} onChange={e => setMon("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMonDialog(false)}>Cancel</Button>
            <Button onClick={() => saveMon.mutate(monForm)} disabled={saveMon.isPending || !monForm.recordDate}>
              {saveMon.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingMon ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Milk Collection View Dialog ──────────────────────────────────────── */}
      {viewColl && (
        <Dialog open onOpenChange={() => setViewColl(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>View Milk Collection</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{formatDate(viewColl.collectionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tank</p><p className="font-medium">{tankName(viewColl.tankId) ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume Collected</p><p className="font-medium">{viewColl.volumeCollectedLitres ? `${Number(viewColl.volumeCollectedLitres).toLocaleString()} L` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Buyer / Haulier</p><p className="font-medium">{viewColl.milkBuyer ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tanker Registration</p><p className="font-medium font-mono">{viewColl.tankerRegistration ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tanker Driver</p><p className="font-medium">{viewColl.tankerDriverName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Reference</p><p className="font-medium">{viewColl.collectionRef ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pre-Collection ABR</p><p className="font-medium capitalize">{viewColl.abtResultBeforeCollection ?? "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewColl.notes ?? "—"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEditColl(viewColl); setViewColl(null); }}>Edit</Button>
              <Button onClick={() => setViewColl(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Milk Collection Add/Edit Dialog ─────────────────────────────────── */}
      <Dialog open={collDialog} onOpenChange={setCollDialog}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editingColl ? "Edit Milk Collection" : "Log Milk Collection"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Collection Date *</Label><Input type="date" value={collForm.collectionDate?.slice(0, 10) || ""} onChange={e => setColl("collectionDate", e.target.value)} /></div>
            <div>
              <Label>Tank Collected From</Label>
              <Select value={collForm.tankId ? String(collForm.tankId) : "__none__"} onValueChange={v => setColl("tankId", v !== "__none__" ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not specified</SelectItem>
                  {tanks.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}{t.location ? ` — ${t.location}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Volume Collected (litres)</Label><Input type="number" step="1" placeholder="e.g. 8500" value={collForm.volumeCollectedLitres || ""} onChange={e => setColl("volumeCollectedLitres", e.target.value)} /></div>
            <div><Label>Milk Buyer / Haulier</Label><Input placeholder="e.g. Müller, Arla, First Milk" value={collForm.milkBuyer || ""} onChange={e => setColl("milkBuyer", e.target.value)} /></div>
            <div><Label>Tanker Registration</Label><Input placeholder="e.g. AB12 CDE" value={collForm.tankerRegistration || ""} onChange={e => setColl("tankerRegistration", e.target.value)} /></div>
            <div><Label>Tanker Driver Name</Label><Input value={collForm.tankerDriverName || ""} onChange={e => setColl("tankerDriverName", e.target.value)} /></div>
            <div><Label>Collection Reference</Label><Input placeholder="From milk buyer docket" value={collForm.collectionRef || ""} onChange={e => setColl("collectionRef", e.target.value)} /></div>
            <div>
              <Label>Pre-Collection ABR Result</Label>
              <Select value={collForm.abtResultBeforeCollection || ""} onValueChange={v => setColl("abtResultBeforeCollection", v)}>
                <SelectTrigger><SelectValue placeholder="Not recorded" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={collForm.notes || ""} onChange={e => setColl("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollDialog(false)}>Cancel</Button>
            <Button onClick={() => saveColl.mutate(collForm)} disabled={saveColl.isPending || !collForm.collectionDate}>
              {saveColl.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingColl ? "Save Changes" : "Log Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ─── Dry Cow Therapy ───────────────────────────────────────────────────────────

interface DctRecord {
  id: number; herdId?: number | null; animalId?: number | null; cowEarTag?: string | null;
  dryOffDate: string; protocol: string; antibioticTubeProduct?: string | null;
  antibioticTubeBatch?: string | null; antibioticTubeWithdrawalMilkDays?: number | null;
  antibioticTubeWithdrawalMeatDays?: number | null; teatSealantProduct?: string | null;
  teatSealantBatch?: string | null; treatmentJustification?: string | null;
  sccAtDryOff?: number | null; mastitisEpisodes12Months?: number | null;
  administeredBy?: string | null; vetAuthorisation?: boolean; vetName?: string | null;
  expectedCalvingDate?: string | null; notes?: string | null;
}

function DctTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DctRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<DctRecord | null>(null);
  const [form, setForm] = useState<Partial<DctRecord>>({});

  const { data, isLoading } = useQuery<{ records: DctRecord[] }>({
    queryKey: ["dairy-dct", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/dct-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<DctRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/dct-records/${editing.id}`) : api(`farms/${farmId}/dairy/dct-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/dct-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ dryOffDate: today(), protocol: "selective" }); setOpen(true); }
  function openEdit(r: DctRecord) { setEditing(r); setForm({ ...r, dryOffDate: r.dryOffDate.slice(0, 10), expectedCalvingDate: r.expectedCalvingDate?.slice(0, 10) }); setOpen(true); }
  function set(k: keyof DctRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const PROTOCOLS = [
    { value: "selective", label: "Selective DCT (antibiotic only where indicated)" },
    { value: "blanket", label: "Blanket DCT (all cows treated)" },
    { value: "teat-sealant-only", label: "Teat Sealant Only (no antibiotic)" },
    { value: "selective-sealant", label: "Selective DCT + Teat Sealant" },
    { value: "blanket-sealant", label: "Blanket DCT + Teat Sealant" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Dry Cow Therapy (DCT) — record treatment decisions at dry-off. Antibiotic stewardship requires documented justification for each cow treated.</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add DCT Record</Button>
      </div>
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View DCT Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dry-Off Date</p><p className="font-medium">{formatDate(viewRecord.dryOffDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cow Ear Tag</p><p className="font-medium">{String(viewRecord.cowEarTag ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protocol</p><p className="font-medium capitalize">{String(viewRecord.protocol ?? "—").replace("-", " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Antibiotic Product</p><p className="font-medium">{String(viewRecord.antibioticRegimeProduct || viewRecord.antibioticTubeProduct || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Teat Sealant</p><p className="font-medium">{String(viewRecord.teatSealantProduct ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Dry-Off</p><p className="font-medium">{viewRecord.sccAtDryOff?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mastitis Eps (12m)</p><p className="font-medium">{String(viewRecord.mastitisEpisodes12Months ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Authorisation</p><p className="font-medium">{viewRecord.vetAuthorisation ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Calving</p><p className="font-medium">{formatDate(viewRecord.expectedCalvingDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Justification</p><p className="font-medium">{String(viewRecord.treatmentJustification ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="dct" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No DCT records yet. Record dry-off treatments for each cow at the end of lactation.</CardContent></Card>}
          {data?.records?.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.dryOffDate)}</span>
                    {r.cowEarTag && <span className="text-sm text-gray-700 font-mono">{r.cowEarTag}</span>}
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded capitalize">{r.protocol.replace(/-/g, " ")}</span>
                    {r.antibioticTubeProduct && <span className="text-xs text-gray-500">{r.antibioticTubeProduct}</span>}
                    {r.teatSealantProduct && <span className="text-xs text-gray-500">Sealant: {r.teatSealantProduct}</span>}
                    {r.sccAtDryOff && <SccBadge v={r.sccAtDryOff} />}
                    {r.mastitisEpisodes12Months !== null && r.mastitisEpisodes12Months !== undefined && <span className="text-xs text-gray-500">{r.mastitisEpisodes12Months} mastitis episodes (12m)</span>}
                    {r.vetAuthorisation && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Vet authorised</span>}
                    {r.expectedCalvingDate && <span className="text-xs text-gray-400 flex items-center gap-1"><ChevronRight className="h-3 w-3" />Expected calving {formatDate(r.expectedCalvingDate)}</span>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.treatmentJustification && <p className="text-xs text-gray-500 mt-1">Justification: {r.treatmentJustification}</p>}
                {r.notes && <p className="text-xs text-gray-400 mt-0.5">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "60rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit DCT Record" : "Add Dry Cow Therapy Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cow Ear Tag</Label><Input value={form.cowEarTag || ""} onChange={e => set("cowEarTag", e.target.value)} placeholder="e.g. UK123456 78901" /></div>
                <div><Label>Dry-Off Date *</Label><Input type="date" value={form.dryOffDate?.slice(0, 10) || ""} onChange={e => set("dryOffDate", e.target.value)} /></div>
              </div>

              <div>
                <Label>DCT Protocol *</Label>
                <Select value={form.protocol || "selective"} onValueChange={v => set("protocol", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROTOCOLS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {form.protocol !== "teat-sealant-only" && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antibiotic Tube</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Product Name</Label><Input value={form.antibioticTubeProduct || ""} onChange={e => set("antibioticTubeProduct", e.target.value)} /></div>
                    <div><Label>Batch Number</Label><Input value={form.antibioticTubeBatch || ""} onChange={e => set("antibioticTubeBatch", e.target.value)} /></div>
                    <div><Label>Milk Withdrawal (days)</Label><Input type="number" value={form.antibioticTubeWithdrawalMilkDays || ""} onChange={e => set("antibioticTubeWithdrawalMilkDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
                    <div><Label>Meat Withdrawal (days)</Label><Input type="number" value={form.antibioticTubeWithdrawalMeatDays || ""} onChange={e => set("antibioticTubeWithdrawalMeatDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
                  </div>
                </div>
              )}

              {form.protocol?.includes("sealant") && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teat Sealant</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Product</Label><Input value={form.teatSealantProduct || ""} onChange={e => set("teatSealantProduct", e.target.value)} /></div>
                    <div><Label>Batch Number</Label><Input value={form.teatSealantBatch || ""} onChange={e => set("teatSealantBatch", e.target.value)} /></div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antibiotic Stewardship</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>SCC at Dry-Off (k/mL)</Label><Input type="number" value={form.sccAtDryOff || ""} onChange={e => set("sccAtDryOff", e.target.value ? parseInt(e.target.value) : null)} /></div>
                  <div><Label>Mastitis Episodes (12 mo)</Label><Input type="number" value={form.mastitisEpisodes12Months ?? ""} onChange={e => set("mastitisEpisodes12Months", e.target.value ? parseInt(e.target.value) : null)} /></div>
                </div>
                <div><Label>Treatment Justification</Label><Textarea value={form.treatmentJustification || ""} onChange={e => set("treatmentJustification", e.target.value)} placeholder="e.g. SCC consistently above 200k, 2 mastitis episodes in last lactation" rows={2} /></div>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vet &amp; Administration</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vetauth" checked={!!form.vetAuthorisation} onChange={e => set("vetAuthorisation", e.target.checked)} className="rounded" />
                  <Label htmlFor="vetauth">Written vet authorisation obtained</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
                  <div><Label>Administered By</Label><Input value={form.administeredBy || ""} onChange={e => set("administeredBy", e.target.value)} /></div>
                </div>
                <div><Label>Expected Calving Date</Label><Input type="date" value={form.expectedCalvingDate || ""} onChange={e => set("expectedCalvingDate", e.target.value)} /></div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.dryOffDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add DCT Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
