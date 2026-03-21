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
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
        <div>
          <p className="text-sm text-gray-500">Daily milk recording — yield, SCC, TBC, composition. Legal SCC limit: 400,000 cells/mL (400 k).</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>
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
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Milk Record" : "Add Milk Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Date *</Label><Input type="date" value={form.recordDate || ""} onChange={e => set("recordDate", e.target.value)} /></div>
            <div>
              <Label>Record Type *</Label>
              <Select value={form.recordType || "bulk-tank"} onValueChange={v => set("recordType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulk-tank">Bulk Tank Collection</SelectItem>
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
            <div><Label>SCC (thousands/mL)</Label><Input type="number" value={form.sccThousands || ""} onChange={e => set("sccThousands", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="e.g. 185 = 185,000 cells/mL" /><p className="text-xs text-gray-400 mt-0.5">Legal limit: 400 (400,000 cells/mL)</p></div>
            <div><Label>TBC (cfu/mL)</Label><Input type="number" value={form.tbcCfuMl || ""} onChange={e => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Total bacterial count" /></div>
            <div><Label>Fat (%)</Label><Input type="number" step="0.01" value={form.fatPercent || ""} onChange={e => set("fatPercent", e.target.value)} /></div>
            <div><Label>Protein (%)</Label><Input type="number" step="0.01" value={form.proteinPercent || ""} onChange={e => set("proteinPercent", e.target.value)} /></div>
            <div><Label>Lactose (%)</Label><Input type="number" step="0.01" value={form.lactosePercent || ""} onChange={e => set("lactosePercent", e.target.value)} /></div>
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
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
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
        <p className="text-sm text-gray-500">Individual cow mastitis events — quarters affected, clinical grade, treatment, and outcome. Linked to antibiotic stewardship records.</p>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>
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
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Mastitis Record" : "Add Mastitis Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Onset Date *</Label><Input type="date" value={form.onsetDate?.slice(0, 10) || ""} onChange={e => set("onsetDate", e.target.value)} /></div>
            <div><Label>Cow Ear Tag</Label><Input value={form.earTagNumber || ""} onChange={e => set("earTagNumber", e.target.value)} placeholder="e.g. UK123456 000001" /></div>
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
            <div><Label>Treatment Product</Label><Input value={form.treatmentProduct || ""} onChange={e => set("treatmentProduct", e.target.value)} placeholder="e.g. Ubrolexin intramammary" /></div>
            <div><Label>Treatment Start Date</Label><Input type="date" value={form.treatmentStartDate || ""} onChange={e => set("treatmentStartDate", e.target.value)} /></div>
            <div><Label>Treatment Duration (days)</Label><Input type="number" value={form.treatmentDurationDays || ""} onChange={e => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
            <div><Label>Milk Withdrawal End Date</Label><Input type="date" value={form.withdrawalEndDate || ""} onChange={e => set("withdrawalEndDate", e.target.value)} /></div>
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
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="vc" checked={!!form.vetConsulted} onChange={e => set("vetConsulted", e.target.checked)} className="rounded" />
              <Label htmlFor="vc">Vet consulted</Label>
            </div>
            <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
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
  id: number; herdId?: number | null; cowEarTag?: string | null; calvingDate: string;
  calvingEaseScore?: number | null; numberOfCalves?: number; calfOutcome?: string | null;
  calfSex?: string | null; calfEarTag?: string | null; sireBreed?: string | null; calfBreed?: string | null;
  calfBirthWeightKg?: string | null; colostrumGivenWithin2Hours?: boolean | null;
  colostrumGivenWithin6Hours?: boolean | null; colostrumVolumeFirstFeedLitres?: string | null;
  colostrumQualityBrix?: string | null; colostrumSource?: string | null;
  cowComplications?: string | null; assistanceRequired?: boolean; vetAttended?: boolean;
  vetName?: string | null; calfDisposition?: string | null; bcmsPassportApplied?: boolean; notes?: string | null;
}

function CalvingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalvingRecord | null>(null);
  const [form, setForm] = useState<Partial<CalvingRecord>>({});

  const { data, isLoading } = useQuery<{ records: CalvingRecord[] }>({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/calving-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<CalvingRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/calving-records/${editing.id}`) : api(`farms/${farmId}/dairy/calving-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/calving-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ calvingDate: today(), numberOfCalves: 1 }); setOpen(true); }
  function openEdit(r: CalvingRecord) { setEditing(r); setForm({ ...r, calvingDate: r.calvingDate.slice(0, 10) }); setOpen(true); }
  function set(k: keyof CalvingRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Calving records including ease score, calf details, colostrum management, and BCMS passport application.</p>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Calving</Button>
      </div>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No calving records yet.</CardContent></Card>}
          {data?.records?.map(r => (
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
                    {r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h"}
                      </span>
                    )}
                    {r.bcmsPassportApplied && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Passport applied</span>}
                  </div>
                  <div className="flex gap-1 ml-2">
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
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Calving Record" : "Add Calving Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2 max-h-[65vh] overflow-y-auto pr-2">
            <div className="col-span-2 border-b pb-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cow Details</p></div>
            <div><Label>Calving Date *</Label><Input type="date" value={form.calvingDate?.slice(0, 10) || ""} onChange={e => set("calvingDate", e.target.value)} /></div>
            <div><Label>Dam Ear Tag</Label><Input value={form.cowEarTag || ""} onChange={e => set("cowEarTag", e.target.value)} placeholder="Cow's BCMS ear tag" /></div>
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
            <div>
              <Label>Cow Complications</Label>
              <Input value={form.cowComplications || ""} onChange={e => set("cowComplications", e.target.value)} placeholder="e.g. retained placenta, hypocalcaemia" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="ar" checked={!!form.assistanceRequired} onChange={e => set("assistanceRequired", e.target.checked)} className="rounded" />
              <Label htmlFor="ar">Assistance required</Label>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="va" checked={!!form.vetAttended} onChange={e => set("vetAttended", e.target.checked)} className="rounded" />
              <Label htmlFor="va">Vet attended</Label>
            </div>
            {form.vetAttended && <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>}

            <div className="col-span-2 border-b pb-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calf Details</p></div>
            <div><Label>Number of Calves</Label><Input type="number" min="1" max="4" value={form.numberOfCalves || 1} onChange={e => set("numberOfCalves", parseInt(e.target.value))} /></div>
            <div>
              <Label>Calf Outcome</Label>
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
              <Label>Calf Sex</Label>
              <Select value={form.calfSex || ""} onValueChange={v => set("calfSex", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Heifer (Female)</SelectItem>
                  <SelectItem value="male">Bull Calf (Male)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Calf Ear Tag (if applied)</Label><Input value={form.calfEarTag || ""} onChange={e => set("calfEarTag", e.target.value)} placeholder="BCMS tag applied at birth" /></div>
            <div><Label>Sire Breed</Label><Input value={form.sireBreed || ""} onChange={e => set("sireBreed", e.target.value)} /></div>
            <div><Label>Calf Birth Weight (kg)</Label><Input type="number" step="0.1" value={form.calfBirthWeightKg || ""} onChange={e => set("calfBirthWeightKg", e.target.value)} /></div>
            <div>
              <Label>Calf Disposition</Label>
              <Select value={form.calfDisposition || ""} onValueChange={v => set("calfDisposition", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="retained">Retained on farm (rear)</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="market">To market</SelectItem>
                  <SelectItem value="died">Died</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="bpp" checked={!!form.bcmsPassportApplied} onChange={e => set("bcmsPassportApplied", e.target.checked)} className="rounded" />
              <Label htmlFor="bpp">BCMS passport applied</Label>
            </div>

            <div className="col-span-2 border-b pb-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colostrum Management</p></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="c2h" checked={!!form.colostrumGivenWithin2Hours} onChange={e => set("colostrumGivenWithin2Hours", e.target.checked)} className="rounded" />
              <Label htmlFor="c2h">Colostrum given within 2 hours</Label>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="c6h" checked={!!form.colostrumGivenWithin6Hours} onChange={e => set("colostrumGivenWithin6Hours", e.target.checked)} className="rounded" />
              <Label htmlFor="c6h">Colostrum given within 6 hours</Label>
            </div>
            <div><Label>First Feed Volume (litres)</Label><Input type="number" step="0.1" value={form.colostrumVolumeFirstFeedLitres || ""} onChange={e => set("colostrumVolumeFirstFeedLitres", e.target.value)} /></div>
            <div><Label>Brix Quality Reading (%)</Label><Input type="number" step="0.1" value={form.colostrumQualityBrix || ""} onChange={e => set("colostrumQualityBrix", e.target.value)} placeholder="≥22% = good quality" /></div>
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

            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
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
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Mobility Assessment" : "Add Mobility Assessment"}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate?.slice(0, 10) || ""} onChange={e => set("assessmentDate", e.target.value)} /></div>
              <div><Label>Assessed By</Label><Input value={form.assessedBy || ""} onChange={e => set("assessedBy", e.target.value)} /></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Score counts (observe cows walking from parlour)</p>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-green-700 mb-1">Score 0 — Normal</p>
                  <p className="text-xs text-green-600 mb-2">Perfect gait, even weight bearing</p>
                  <Input type="number" min="0" className="text-center" value={form.score0Count || 0} onChange={e => set("score0Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-lime-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-lime-700 mb-1">Score 1 — Imperfect</p>
                  <p className="text-xs text-lime-600 mb-2">Minor gait imperfection</p>
                  <Input type="number" min="0" className="text-center" value={form.score1Count || 0} onChange={e => set("score1Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-amber-700 mb-1">Score 2 — Impaired</p>
                  <p className="text-xs text-amber-600 mb-2">Clear gait impairment, arched back</p>
                  <Input type="number" min="0" className="text-center" value={form.score2Count || 0} onChange={e => set("score2Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-red-700 mb-1">Score 3 — Lame</p>
                  <p className="text-xs text-red-600 mb-2">Severely lame, reluctant to bear weight</p>
                  <Input type="number" min="0" className="text-center" value={form.score3Count || 0} onChange={e => set("score3Count", parseInt(e.target.value) || 0)} />
                </div>
              </div>
              {total > 0 && (
                <div className={`mt-3 p-3 rounded-lg text-sm font-medium text-center ${prevalence && parseFloat(prevalence) >= 10 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  Total scored: {total} cows — Lameness prevalence (score 3): <strong>{prevalence}%</strong>
                  {prevalence && parseFloat(prevalence) >= 10 ? " — Above 10% target. Action plan required." : " — Within target range."}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Action Taken</Label><Textarea value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} placeholder="e.g. Score 3 cows referred to vet for foot trimming" rows={2} /></div>
              <div>
                <Label>Next Assessment Due</Label><Input type="date" value={form.nextAssessmentDue || ""} onChange={e => set("nextAssessmentDue", e.target.value)} />
                <Label className="mt-2 block">Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} />
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

interface BulkTankRecord {
  id: number; recordDate: string; recordType: string; tankTemperatureCelsius?: string | null;
  tankCleaned?: boolean; cleaningProductUsed?: string | null; cleaningProductBatch?: string | null;
  antibioticResidueTestRef?: string | null; antibioticResidueResult?: string | null;
  tankerDriverName?: string | null; collectionRef?: string | null; notes?: string | null;
}

function BulkTankTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BulkTankRecord | null>(null);
  const [form, setForm] = useState<Partial<BulkTankRecord>>({});

  const { data, isLoading } = useQuery<{ records: BulkTankRecord[] }>({
    queryKey: ["dairy-tank", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bulk-tank-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<BulkTankRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/bulk-tank-records/${editing.id}`) : api(`farms/${farmId}/dairy/bulk-tank-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-tank", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/bulk-tank-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tank", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ recordDate: today(), recordType: "daily-temperature" }); setOpen(true); }
  function openEdit(r: BulkTankRecord) { setEditing(r); setForm({ ...r, recordDate: r.recordDate.slice(0, 10) }); setOpen(true); }
  function set(k: keyof BulkTankRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Bulk milk tank records — daily temperature, cleaning, antibiotic residue tests, and collection references.</p>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No bulk tank records yet.</CardContent></Card>}
          {data?.records?.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.recordDate)}</span>
                    <span className="text-xs text-gray-500 capitalize">{r.recordType.replace(/-/g, " ")}</span>
                    {r.tankTemperatureCelsius && <span className={`text-xs px-2 py-0.5 rounded ${parseFloat(r.tankTemperatureCelsius) <= 6 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{r.tankTemperatureCelsius}°C</span>}
                    {r.tankCleaned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Tank cleaned</span>}
                    {r.cleaningProductUsed && <span className="text-xs text-gray-500">{r.cleaningProductUsed}</span>}
                    {r.antibioticResidueResult && (
                      <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${r.antibioticResidueResult === "negative" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {r.antibioticResidueResult === "negative" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        ABR: {r.antibioticResidueResult}
                      </span>
                    )}
                    {r.collectionRef && <span className="text-xs text-gray-400">Ref: {r.collectionRef}</span>}
                  </div>
                  <div className="flex gap-1 ml-2">
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
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Bulk Tank Record" : "Add Bulk Tank Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Date *</Label><Input type="date" value={form.recordDate?.slice(0, 10) || ""} onChange={e => set("recordDate", e.target.value)} /></div>
            <div>
              <Label>Record Type *</Label>
              <Select value={form.recordType || "daily-temperature"} onValueChange={v => set("recordType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily-temperature">Daily Temperature Check</SelectItem>
                  <SelectItem value="cleaning">Tank Cleaning</SelectItem>
                  <SelectItem value="collection">Milk Collection</SelectItem>
                  <SelectItem value="antibiotic-residue-test">Antibiotic Residue Test</SelectItem>
                  <SelectItem value="maintenance">Tank Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tank Temperature (°C)</Label><Input type="number" step="0.1" value={form.tankTemperatureCelsius || ""} onChange={e => set("tankTemperatureCelsius", e.target.value)} placeholder="Should be ≤6°C" /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="tc" checked={!!form.tankCleaned} onChange={e => set("tankCleaned", e.target.checked)} className="rounded" />
              <Label htmlFor="tc">Tank cleaned and sanitised</Label>
            </div>
            {form.tankCleaned && <>
              <div><Label>Cleaning Product</Label><Input value={form.cleaningProductUsed || ""} onChange={e => set("cleaningProductUsed", e.target.value)} /></div>
              <div><Label>Product Batch Number</Label><Input value={form.cleaningProductBatch || ""} onChange={e => set("cleaningProductBatch", e.target.value)} /></div>
            </>}
            <div>
              <Label>Antibiotic Residue Result</Label>
              <Select value={form.antibioticResidueResult || ""} onValueChange={v => set("antibioticResidueResult", v)}>
                <SelectTrigger><SelectValue placeholder="Not tested" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>ABR Test Reference</Label><Input value={form.antibioticResidueTestRef || ""} onChange={e => set("antibioticResidueTestRef", e.target.value)} /></div>
            <div><Label>Tanker Driver Name</Label><Input value={form.tankerDriverName || ""} onChange={e => set("tankerDriverName", e.target.value)} /></div>
            <div><Label>Collection Reference</Label><Input value={form.collectionRef || ""} onChange={e => set("collectionRef", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
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
