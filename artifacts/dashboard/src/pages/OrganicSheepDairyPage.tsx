import React, { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Redirect } from "wouter";
import { Plus, Pencil, Trash2, Loader2, Eye, Droplets, Printer, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MastitisTab, BcsTab, BulkTankTab, MvTab } from "@/pages/SheepDairyPage";

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

function fmt(v?: string | null) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return v; }
}

function fmtRaw(v: unknown): string {
  return v == null || v === "" ? "—" : String(v);
}

function today() { return new Date().toISOString().slice(0, 10); }

function formatPence(p: number | null | undefined): string {
  if (p == null) return "—";
  return `£${(p / 100).toFixed(2)}`;
}

function SheepSccBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const ok = v < 750;
  const warn = v >= 750 && v < 1500;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL {v >= 1500 ? "⚠ Exceeds limit" : ""}
    </span>
  );
}

function conversionStatusBadge(status: string) {
  const map: Record<string, string> = {
    "in-conversion": "bg-yellow-100 text-yellow-800",
    certified: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-700",
  };
  return <Badge className={map[status] ?? "bg-gray-100 text-gray-700"}>{status.replace(/-/g, " ")}</Badge>;
}

const CERTIFIERS = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Biodynamic Association (BDOCA)", "Other"];

const FEED_TYPES = ["Concentrate", "Grass Silage", "Hay", "Haylage", "Grazed Grass", "Straw", "Root Crops / Beet", "Minerals & Supplements", "Other"];

const PRODUCT_CATEGORIES = ["Antibiotic", "NSAID", "Anthelmintic", "Antiparasitic", "Vaccine", "Homeopathic", "Other"];

const ROUTES_OF_ADMINISTRATION = ["Intramuscular (IM)", "Subcutaneous (SC)", "Intravenous (IV)", "Oral", "Intramammary", "Topical", "Other"];

type Tab = "tupping" | "conversion" | "collections" | "feed" | "treatments" | "mastitis" | "bcs" | "tank" | "mv";

export default function OrganicSheepDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("tupping");
  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Organic Sheep Dairy">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-full">🌿 Organic</Badge>
            <h1 className="text-2xl font-bold text-gray-900">Organic Sheep Dairy</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Organic certification for dairy sheep — flock conversion register, organic milk collection log with non-organic reason tracking, feed &amp; nutrition (≥95% organic DM target), and vet treatment register with doubled withdrawal periods (SA/OF&amp;G/Biodynamic certified flocks).
          </p>
        </div>
        <TabBar>
          <TabButton active={tab === "tupping"} onClick={() => setTab("tupping")}>Tupping</TabButton>
          <TabButton active={tab === "conversion"} onClick={() => setTab("conversion")}>Flock Conversion</TabButton>
          <TabButton active={tab === "collections"} onClick={() => setTab("collections")}>Milk Collections</TabButton>
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>Feed &amp; Nutrition</TabButton>
          <TabButton active={tab === "treatments"} onClick={() => setTab("treatments")}>Vet Treatments</TabButton>
          <TabButton active={tab === "mastitis"} onClick={() => setTab("mastitis")}>Mastitis</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "mv"} onClick={() => setTab("mv")}>Maedi-Visna</TabButton>
        </TabBar>
        <div className="mt-6">
          {tab === "tupping" && <TuppingTab farmId={farmId} />}
          {tab === "conversion" && <FlockConversionTab farmId={farmId} />}
          {tab === "collections" && <OrganicCollectionsTab farmId={farmId} />}
          {tab === "feed" && <FeedNutritionTab farmId={farmId} />}
          {tab === "treatments" && <TreatmentRegisterTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "mv" && <MvTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlockConversionRecord {
  id: number; flockName: string; breed?: string | null; numberOfEwes?: number | null;
  conversionStartDate: string; expectedMilkCertDate?: string | null; actualMilkCertDate?: string | null;
  status: string; certifier?: string | null; certificationRef?: string | null;
  parallelProduction: boolean; notes?: string | null;
}

interface CollectionRecord {
  id: number; collectionDate: string; collectorName?: string | null; vehicleRegistration?: string | null;
  volumeLitres?: string | null; fatPercentage?: string | null; proteinPercentage?: string | null;
  sccCount?: number | null; tbcCount?: number | null;
  isOrganicCollection: boolean; nonOrganicReason?: string | null;
  processorRef?: string | null; collectionSlipRef?: string | null;
  organicPremiumPence?: number | null; deductionsPence?: number | null; netValuePence?: number | null;
  witnessedBy?: string | null; notes?: string | null;
}

interface FeedRecord {
  id: number; recordDate: string; feedType: string; feedProductName: string;
  supplier?: string | null; supplierApprovalNumber?: string | null;
  isOrganicApproved: boolean; quantityKg?: string | null; organicPercentage?: string | null;
  dryMatterKg?: string | null; poReference?: string | null; grnReference?: string | null;
  certifierApprovalRef?: string | null; derogationReference?: string | null; notes?: string | null;
}

interface TreatmentRecord {
  id: number; treatmentDate: string; animalLisTags?: string | null; numberOfAnimals?: number | null;
  productName: string; productCategory?: string | null; activeIngredient?: string | null;
  doseAmount?: string | null; routeOfAdministration?: string | null; vetName?: string | null;
  prescriptionRef?: string | null;
  standardMilkWithdrawalDays?: number | null; doubledMilkWithdrawalDays?: number | null;
  standardMeatWithdrawalDays?: number | null; doubledMeatWithdrawalDays?: number | null;
  milkWithdrawalEndDate?: string | null; meatWithdrawalEndDate?: string | null;
  certifierNotified: boolean; treatmentNumber: number; notes?: string | null;
}

// ─── FlockConversionTab ───────────────────────────────────────────────────────

function FlockConversionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FlockConversionRecord | null>(null);
  const [viewRec, setViewRec] = useState<FlockConversionRecord | null>(null);
  const [form, setForm] = useState<Partial<FlockConversionRecord>>({});
  const f = (k: keyof FlockConversionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, isLoading } = useQuery({
    queryKey: ["org-sheep-flock-conv", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/flock-conversion`)).then(r => r.json()),
  });
  const records: FlockConversionRecord[] = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/flock-conversion${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-flock-conv", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Flock added" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/flock-conversion/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-flock-conv", farmId] }); toast({ title: "Record deleted" }); },
  });

  function openNew() { setEditing(null); setForm({ status: "in-conversion", parallelProduction: false, conversionStartDate: today() }); setOpen(true); }
  function openEdit(r: FlockConversionRecord) { setEditing(r); setForm(r); setOpen(true); }

  const certifiedCount = records.filter(r => r.status === "certified").length;

  return (
    <div className="space-y-4">
      {certifiedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span className="font-semibold">🌿 {certifiedCount} flock{certifiedCount !== 1 ? "s" : ""} certified organic</span>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />Add Flock</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flock Name</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Ewes</TableHead>
              <TableHead>Conv. Start</TableHead>
              <TableHead>Exp. Milk Cert</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Certifier</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No flock conversion records yet. Add your first flock to start tracking organic certification.</TableCell></TableRow>
            )}
            {records.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.flockName}</TableCell>
                <TableCell>{r.breed ?? "—"}</TableCell>
                <TableCell>{r.numberOfEwes ?? "—"}</TableCell>
                <TableCell>{fmt(r.conversionStartDate)}</TableCell>
                <TableCell>{fmt(r.expectedMilkCertDate)}</TableCell>
                <TableCell>{conversionStatusBadge(r.status)}</TableCell>
                <TableCell>{r.certifier ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRec(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>Flock Conversion — {viewRec.flockName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock Name</p><p className="font-medium">{fmtRaw(viewRec.flockName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Breed</p><p className="font-medium">{fmtRaw(viewRec.breed)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Ewes</p><p className="font-medium">{fmtRaw(viewRec.numberOfEwes)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{conversionStatusBadge(viewRec.status)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion Start</p><p className="font-medium">{fmt(viewRec.conversionStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Milk Cert Date</p><p className="font-medium">{fmt(viewRec.expectedMilkCertDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Actual Milk Cert Date</p><p className="font-medium">{fmt(viewRec.actualMilkCertDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier</p><p className="font-medium">{fmtRaw(viewRec.certifier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Ref</p><p className="font-medium">{fmtRaw(viewRec.certificationRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Parallel Production</p><p className="font-medium">{viewRec.parallelProduction ? "Yes — flock also produces conventional milk" : "No"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Flock Conversion" : "Add Flock Conversion Record"}</DialogTitle>
            <DialogDescription>Track your flock's organic conversion status and certification details.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1"><Label>Flock Name *</Label><Input value={form.flockName ?? ""} onChange={f("flockName")} placeholder="e.g. Home Flock — East Block" /></div>
            <div className="space-y-1"><Label>Breed</Label><Input value={form.breed ?? ""} onChange={f("breed")} placeholder="e.g. East Friesian × Lacaune" /></div>
            <div className="space-y-1"><Label>Number of Ewes</Label><Input type="number" value={form.numberOfEwes ?? ""} onChange={e => setForm(p => ({ ...p, numberOfEwes: e.target.value ? Number(e.target.value) : null }))} /></div>
            <div className="space-y-1"><Label>Conversion Start Date *</Label><Input type="date" value={String(form.conversionStartDate ?? "").slice(0, 10)} onChange={f("conversionStartDate")} /></div>
            <div className="space-y-1"><Label>Expected Milk Cert Date</Label><Input type="date" value={String(form.expectedMilkCertDate ?? "").slice(0, 10)} onChange={f("expectedMilkCertDate")} /></div>
            <div className="space-y-1"><Label>Actual Milk Cert Date</Label><Input type="date" value={String(form.actualMilkCertDate ?? "").slice(0, 10)} onChange={f("actualMilkCertDate")} /></div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status ?? "in-conversion"} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-conversion">In Conversion</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Certifier</Label>
              <Select value={form.certifier ?? "__none__"} onValueChange={v => setForm(p => ({ ...p, certifier: v === "__none__" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Select certifier…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not specified —</SelectItem>
                  {CERTIFIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Certification Reference</Label><Input value={form.certificationRef ?? ""} onChange={f("certificationRef")} placeholder="e.g. SA/2024/XXXXX" /></div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={form.parallelProduction ?? false} onCheckedChange={v => setForm(p => ({ ...p, parallelProduction: !!v }))} id="parallel" />
              <Label htmlFor="parallel" className="cursor-pointer font-normal">Parallel production — this flock also produces non-organic milk</Label>
            </div>
            <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={f("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.flockName || !form.conversionStartDate || save.isPending}>
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── OrganicCollectionsTab ────────────────────────────────────────────────────

function OrganicCollectionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRecord | null>(null);
  const [viewRec, setViewRec] = useState<CollectionRecord | null>(null);
  const blank: Partial<CollectionRecord> = { collectionDate: today(), isOrganicCollection: true };
  const [form, setForm] = useState<Partial<CollectionRecord>>(blank);
  const f = (k: keyof CollectionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, isLoading } = useQuery({
    queryKey: ["org-sheep-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/collections`)).then(r => r.json()),
  });
  const records: CollectionRecord[] = data?.records ?? [];

  const organicCount = records.filter(r => r.isOrganicCollection).length;
  const totalVol = records.reduce((s, r) => s + (parseFloat(r.volumeLitres || "0") || 0), 0);
  const sccReadings = records.map(r => r.sccCount).filter((v): v is number => v != null);
  const avgScc = sccReadings.length ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;

  const save = useMutation({
    mutationFn: () => {
      if (!form.isOrganicCollection && !form.nonOrganicReason?.trim()) {
        throw new Error("Reason required for non-organic collection");
      }
      return fetch(api(`farms/${farmId}/organic-sheep-dairy/collections${editing ? `/${editing.id}` : ""}`), {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-collections", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Collection added" }); },
    onError: (e: Error) => toast({ title: e.message || "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/collections/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-collections", farmId] }); toast({ title: "Record deleted" }); },
  });

  function openNew() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(r: CollectionRecord) { setEditing(r); setForm(r); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Total Volume</p><p className="text-2xl font-bold text-blue-800">{totalVol.toLocaleString("en-GB", { maximumFractionDigits: 0 })}<span className="text-sm font-normal ml-1">L</span></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Organic Collections</p><p className="text-2xl font-bold text-green-700">{organicCount}<span className="text-sm font-normal ml-1">/ {records.length}</span></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Avg SCC (k/mL)</p><p className={`text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1500 ? "text-red-700" : avgScc > 750 ? "text-amber-700" : "text-green-700"}`}>{avgScc != null ? avgScc.toLocaleString() : "—"}</p><p className="text-xs text-gray-400">Limit: 1,500k</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Non-organic</p><p className="text-2xl font-bold text-amber-700">{records.length - organicCount}</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />Add Collection</Button>
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Volume (L)</TableHead>
              <TableHead>SCC (k/mL)</TableHead>
              <TableHead>Fat %</TableHead>
              <TableHead>Protein %</TableHead>
              <TableHead>Organic</TableHead>
              <TableHead>Net Value</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8"><Droplets className="w-7 h-7 mx-auto mb-2 opacity-40" />No milk collection records yet.</TableCell></TableRow>
            )}
            {records.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.collectionDate)}</TableCell>
                <TableCell>{r.volumeLitres ? parseFloat(r.volumeLitres).toLocaleString() : "—"}</TableCell>
                <TableCell><SheepSccBadge v={r.sccCount} /></TableCell>
                <TableCell>{r.fatPercentage ? `${r.fatPercentage}%` : "—"}</TableCell>
                <TableCell>{r.proteinPercentage ? `${r.proteinPercentage}%` : "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <Badge className={r.isOrganicCollection ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-100"}>
                      {r.isOrganicCollection ? "Organic" : "Non-organic"}
                    </Badge>
                    {!r.isOrganicCollection && r.nonOrganicReason && (
                      <span className="text-xs text-amber-700 truncate max-w-[100px]" title={r.nonOrganicReason}>{r.nonOrganicReason}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatPence(r.netValuePence)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRec(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>Milk Collection — {fmt(viewRec.collectionDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{fmt(viewRec.collectionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume (litres)</p><p className="font-medium">{fmtRaw(viewRec.volumeLitres)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collector</p><p className="font-medium">{fmtRaw(viewRec.collectorName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle Reg</p><p className="font-medium">{fmtRaw(viewRec.vehicleRegistration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC (k/mL)</p><p className="font-medium"><SheepSccBadge v={viewRec.sccCount} /></p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">TBC (k/mL)</p><p className="font-medium">{fmtRaw(viewRec.tbcCount)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fat %</p><p className="font-medium">{viewRec.fatPercentage ? `${viewRec.fatPercentage}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protein %</p><p className="font-medium">{viewRec.proteinPercentage ? `${viewRec.proteinPercentage}%` : "—"}</p></div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Certified</p>
                <p className="font-medium">{viewRec.isOrganicCollection ? <span className="text-green-700">Yes — sold as organic</span> : <span className="text-amber-700">No — sold as conventional</span>}</p>
              </div>
              {!viewRec.isOrganicCollection && viewRec.nonOrganicReason && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Non-organic Reason</p><p className="font-medium text-amber-800">{viewRec.nonOrganicReason}</p></div>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Processor Ref</p><p className="font-medium">{fmtRaw(viewRec.processorRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Docket Ref</p><p className="font-medium">{fmtRaw(viewRec.collectionSlipRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Premium</p><p className="font-medium">{formatPence(viewRec.organicPremiumPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Value</p><p className="font-medium">{formatPence(viewRec.netValuePence)}</p></div>
              {viewRec.witnessedBy && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Witnessed By</p><p className="font-medium">{viewRec.witnessedBy}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Collection" : "Add Milk Collection"}</DialogTitle>
            <DialogDescription>Record each milk collection with quality metrics and organic certification status.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Collection Date *</Label><Input type="date" value={String(form.collectionDate ?? "").slice(0, 10)} onChange={f("collectionDate")} /></div>
            <div className="space-y-1"><Label>Volume (litres) *</Label><Input type="number" step="0.01" value={form.volumeLitres ?? ""} onChange={f("volumeLitres")} /></div>
            <div className="space-y-1"><Label>Collector Name</Label><Input value={form.collectorName ?? ""} onChange={f("collectorName")} /></div>
            <div className="space-y-1"><Label>Vehicle Registration</Label><Input value={form.vehicleRegistration ?? ""} onChange={f("vehicleRegistration")} /></div>
            <div className="space-y-1"><Label>SCC (k/mL)</Label><Input type="number" value={form.sccCount ?? ""} onChange={e => setForm(p => ({ ...p, sccCount: e.target.value ? Number(e.target.value) : null }))} /><p className="text-xs text-gray-400">UK limit: 1,500k</p></div>
            <div className="space-y-1"><Label>TBC (k/mL)</Label><Input type="number" value={form.tbcCount ?? ""} onChange={e => setForm(p => ({ ...p, tbcCount: e.target.value ? Number(e.target.value) : null }))} /></div>
            <div className="space-y-1"><Label>Fat %</Label><Input type="number" step="0.01" value={form.fatPercentage ?? ""} onChange={f("fatPercentage")} /></div>
            <div className="space-y-1"><Label>Protein %</Label><Input type="number" step="0.01" value={form.proteinPercentage ?? ""} onChange={f("proteinPercentage")} /></div>
            <div className="space-y-1"><Label>Processor Ref</Label><Input value={form.processorRef ?? ""} onChange={f("processorRef")} /></div>
            <div className="space-y-1"><Label>Collection Docket Ref</Label><Input value={form.collectionSlipRef ?? ""} onChange={f("collectionSlipRef")} /></div>
            <div className="space-y-1"><Label>Organic Premium (pence)</Label><Input type="number" value={form.organicPremiumPence ?? ""} onChange={e => setForm(p => ({ ...p, organicPremiumPence: e.target.value ? Number(e.target.value) : null }))} /></div>
            <div className="space-y-1"><Label>Net Value (pence)</Label><Input type="number" value={form.netValuePence ?? ""} onChange={e => setForm(p => ({ ...p, netValuePence: e.target.value ? Number(e.target.value) : null }))} /></div>
            <div className="space-y-1"><Label>Witnessed By</Label><Input value={form.witnessedBy ?? ""} onChange={f("witnessedBy")} /></div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={form.isOrganicCollection ?? true} onCheckedChange={v => setForm(p => ({ ...p, isOrganicCollection: !!v, nonOrganicReason: !!v ? null : p.nonOrganicReason }))} id="organic-col" />
              <Label htmlFor="organic-col" className="cursor-pointer font-normal">This collection is certified as Organic</Label>
            </div>
            {!form.isOrganicCollection && (
              <div className="col-span-2 space-y-1">
                <Label className="text-amber-700">Reason — non-organic collection *</Label>
                <Input value={form.nonOrganicReason ?? ""} onChange={f("nonOrganicReason")} placeholder="e.g. Antibiotic withdrawal period, conversion milk…" className="border-amber-300" />
                <p className="text-xs text-amber-600">Required. Notify your certifier if this occurs regularly.</p>
              </div>
            )}
            <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={f("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FeedNutritionTab ─────────────────────────────────────────────────────────

function FeedNutritionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeedRecord | null>(null);
  const [viewRec, setViewRec] = useState<FeedRecord | null>(null);
  const [form, setForm] = useState<Partial<FeedRecord>>({});
  const f = (k: keyof FeedRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, isLoading } = useQuery({
    queryKey: ["org-sheep-feed", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/feed`)).then(r => r.json()),
  });
  const records: FeedRecord[] = data?.records ?? [];
  const nonOrganicCount = records.filter(r => !r.isOrganicApproved).length;

  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/feed${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-feed", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Record added" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/feed/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-feed", farmId] }); toast({ title: "Record deleted" }); },
  });

  function openNew() { setEditing(null); setForm({ isOrganicApproved: true, recordDate: today() }); setOpen(true); }
  function openEdit(r: FeedRecord) { setEditing(r); setForm(r); setOpen(true); }

  return (
    <div className="space-y-4">
      {nonOrganicCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{nonOrganicCount} feed record{nonOrganicCount !== 1 ? "s" : ""} marked as non-organic approved. Monitor total organic DM — target ≥95%.</span>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />Add Feed Record</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Feed Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Qty (kg)</TableHead>
              <TableHead>DM (kg)</TableHead>
              <TableHead>Organic %</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No feed records yet.</TableCell></TableRow>
            )}
            {records.map(r => (
              <TableRow key={r.id}>
                <TableCell>{fmt(r.recordDate)}</TableCell>
                <TableCell className="font-medium">{r.feedProductName}</TableCell>
                <TableCell>{r.feedType}</TableCell>
                <TableCell>{r.quantityKg ?? "—"}</TableCell>
                <TableCell>{r.dryMatterKg ?? "—"}</TableCell>
                <TableCell>{r.organicPercentage ? `${r.organicPercentage}%` : "—"}</TableCell>
                <TableCell>
                  <Badge className={r.isOrganicApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {r.isOrganicApproved ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRec(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>Feed Record — {viewRec.feedProductName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmt(viewRec.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Type</p><p className="font-medium">{fmtRaw(viewRec.feedType)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Product</p><p className="font-medium">{fmtRaw(viewRec.feedProductName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p><p className="font-medium">{fmtRaw(viewRec.supplier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier Approval No.</p><p className="font-medium">{fmtRaw(viewRec.supplierApprovalNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity (kg)</p><p className="font-medium">{fmtRaw(viewRec.quantityKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dry Matter (kg)</p><p className="font-medium">{fmtRaw(viewRec.dryMatterKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic %</p><p className="font-medium">{viewRec.organicPercentage ? `${viewRec.organicPercentage}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Approved</p><p className="font-medium">{viewRec.isOrganicApproved ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PO Reference</p><p className="font-medium">{fmtRaw(viewRec.poReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">GRN Reference</p><p className="font-medium">{fmtRaw(viewRec.grnReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Approval Ref</p><p className="font-medium">{fmtRaw(viewRec.certifierApprovalRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Derogation Reference</p><p className="font-medium">{fmtRaw(viewRec.derogationReference)}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Feed Record</DialogTitle>
            <DialogDescription>Log feed given to the dairy flock. All feed must be ≥95% certified organic dry matter.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Date *</Label><Input type="date" value={String(form.recordDate ?? "").slice(0, 10)} onChange={f("recordDate")} /></div>
            <div className="space-y-1">
              <Label>Feed Type *</Label>
              <Select value={form.feedType ?? "__none__"} onValueChange={v => setForm(p => ({ ...p, feedType: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>{FEED_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Feed Product Name *</Label><Input value={form.feedProductName ?? ""} onChange={f("feedProductName")} placeholder="e.g. Organic Ewe Concentrate" /></div>
            <div className="space-y-1"><Label>Supplier</Label><Input value={form.supplier ?? ""} onChange={f("supplier")} /></div>
            <div className="space-y-1"><Label>Supplier Approval No.</Label><Input value={form.supplierApprovalNumber ?? ""} onChange={f("supplierApprovalNumber")} /></div>
            <div className="space-y-1"><Label>Quantity (kg)</Label><Input type="number" step="0.1" value={form.quantityKg ?? ""} onChange={f("quantityKg")} /></div>
            <div className="space-y-1"><Label>Dry Matter (kg)</Label><Input type="number" step="0.1" value={form.dryMatterKg ?? ""} onChange={f("dryMatterKg")} /></div>
            <div className="space-y-1"><Label>Organic % of DM</Label><Input type="number" step="0.1" max="100" value={form.organicPercentage ?? ""} onChange={f("organicPercentage")} /><p className="text-xs text-gray-400">Target ≥95%</p></div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={form.isOrganicApproved ?? true} onCheckedChange={v => setForm(p => ({ ...p, isOrganicApproved: !!v }))} id="feed-approved" />
              <Label htmlFor="feed-approved" className="cursor-pointer font-normal">Certifier-approved organic feed</Label>
            </div>
            <div className="space-y-1"><Label>PO Reference</Label><Input value={form.poReference ?? ""} onChange={f("poReference")} /></div>
            <div className="space-y-1"><Label>GRN Reference</Label><Input value={form.grnReference ?? ""} onChange={f("grnReference")} /></div>
            <div className="space-y-1"><Label>Certifier Approval Ref</Label><Input value={form.certifierApprovalRef ?? ""} onChange={f("certifierApprovalRef")} /></div>
            <div className="space-y-1"><Label>Derogation Reference</Label><Input value={form.derogationReference ?? ""} onChange={f("derogationReference")} /></div>
            <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={f("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.feedType || !form.feedProductName || save.isPending}>
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TreatmentRegisterTab ─────────────────────────────────────────────────────

function TreatmentRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TreatmentRecord | null>(null);
  const [viewRec, setViewRec] = useState<TreatmentRecord | null>(null);
  const blank: Partial<TreatmentRecord> = { treatmentDate: today(), certifierNotified: false, treatmentNumber: 1 };
  const [form, setForm] = useState<Partial<TreatmentRecord>>(blank);
  const f = (k: keyof TreatmentRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, isLoading } = useQuery({
    queryKey: ["org-sheep-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/treatments`)).then(r => r.json()),
  });
  const records: TreatmentRecord[] = data?.records ?? [];
  const uncertifiedCount = records.filter(r => !r.certifierNotified).length;

  function autoDoubled(stdDays: number | null | undefined): number | null {
    if (!stdDays) return null;
    return stdDays * 2;
  }

  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/treatments${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-treatments", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Treatment recorded" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/treatments/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-treatments", farmId] }); toast({ title: "Record deleted" }); },
  });

  function openNew() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(r: TreatmentRecord) { setEditing(r); setForm(r); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Organic rule:</strong> Statutory withdrawal periods must be DOUBLED for all veterinary treatments on organic animals. Record both the standard and doubled periods below.
      </div>
      {uncertifiedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{uncertifiedCount} treatment{uncertifiedCount !== 1 ? "s" : ""} where certifier has not been notified.</span>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />Add Treatment</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Animal LIS Tags</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Dbl Milk W/D</TableHead>
              <TableHead>Milk W/D End</TableHead>
              <TableHead>Cert Notified</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No treatment records yet.</TableCell></TableRow>
            )}
            {records.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.treatmentDate)}</TableCell>
                <TableCell className="font-mono text-xs max-w-[120px] truncate">{r.animalLisTags || "—"}</TableCell>
                <TableCell>{r.productName}</TableCell>
                <TableCell>
                  {r.doubledMilkWithdrawalDays != null ? (
                    <Badge className="bg-blue-100 text-blue-800">{r.doubledMilkWithdrawalDays}d</Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>{fmt(r.milkWithdrawalEndDate)}</TableCell>
                <TableCell>
                  <Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                    {r.certifierNotified ? "Yes" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRec(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "44rem" }}>
            <DialogHeader><DialogTitle>Vet Treatment — {viewRec.productName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Date</p><p className="font-medium">{fmt(viewRec.treatmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment No.</p><p className="font-medium">{viewRec.treatmentNumber}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Animal LIS Tags</p><p className="font-medium font-mono text-xs">{fmtRaw(viewRec.animalLisTags)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Animals</p><p className="font-medium">{fmtRaw(viewRec.numberOfAnimals)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmtRaw(viewRec.productName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{fmtRaw(viewRec.productCategory)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{fmtRaw(viewRec.activeIngredient)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dose</p><p className="font-medium">{fmtRaw(viewRec.doseAmount)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Route</p><p className="font-medium">{fmtRaw(viewRec.routeOfAdministration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet</p><p className="font-medium">{fmtRaw(viewRec.vetName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Ref</p><p className="font-medium">{fmtRaw(viewRec.prescriptionRef)}</p></div>
              <div className="col-span-2 border-t pt-2 mt-1"><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">⚠ Organic — Doubled Withdrawal Periods</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Standard Milk W/D (days)</p><p className="font-medium">{fmtRaw(viewRec.standardMilkWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doubled Milk W/D (days)</p><p className="font-medium text-blue-800 font-bold">{fmtRaw(viewRec.doubledMilkWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Standard Meat W/D (days)</p><p className="font-medium">{fmtRaw(viewRec.standardMeatWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doubled Meat W/D (days)</p><p className="font-medium text-blue-800 font-bold">{fmtRaw(viewRec.doubledMeatWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk W/D End Date</p><p className="font-medium">{fmt(viewRec.milkWithdrawalEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Meat W/D End Date</p><p className="font-medium">{fmt(viewRec.meatWithdrawalEndDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Notified</p><p className="font-medium">{viewRec.certifierNotified ? "Yes" : "No — pending notification"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Treatment" : "Record Vet Treatment"}</DialogTitle>
            <DialogDescription>All withdrawal periods must be DOUBLED for organic animals under UK Organic Regulations.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Treatment Date *</Label><Input type="date" value={String(form.treatmentDate ?? "").slice(0, 10)} onChange={f("treatmentDate")} /></div>
            <div className="space-y-1"><Label>Treatment No.</Label><Input type="number" value={form.treatmentNumber ?? 1} onChange={e => setForm(p => ({ ...p, treatmentNumber: Number(e.target.value) }))} /></div>
            <div className="col-span-2 space-y-1"><Label>Animal LIS Tags (comma-separated)</Label><Input value={form.animalLisTags ?? ""} onChange={f("animalLisTags")} placeholder="e.g. UK123456789012, UK123456789013" /></div>
            <div className="space-y-1"><Label>Number of Animals</Label><Input type="number" value={form.numberOfAnimals ?? ""} onChange={e => setForm(p => ({ ...p, numberOfAnimals: e.target.value ? Number(e.target.value) : null }))} /></div>
            <div className="space-y-1">
              <Label>Product Category</Label>
              <Select value={form.productCategory ?? "__none__"} onValueChange={v => setForm(p => ({ ...p, productCategory: v === "__none__" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Product Name *</Label><Input value={form.productName ?? ""} onChange={f("productName")} /></div>
            <div className="space-y-1"><Label>Active Ingredient</Label><Input value={form.activeIngredient ?? ""} onChange={f("activeIngredient")} /></div>
            <div className="space-y-1"><Label>Dose Amount</Label><Input value={form.doseAmount ?? ""} onChange={f("doseAmount")} /></div>
            <div className="space-y-1">
              <Label>Route of Administration</Label>
              <Select value={form.routeOfAdministration ?? "__none__"} onValueChange={v => setForm(p => ({ ...p, routeOfAdministration: v === "__none__" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{ROUTES_OF_ADMINISTRATION.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Vet Name</Label><Input value={form.vetName ?? ""} onChange={f("vetName")} /></div>
            <div className="col-span-2 space-y-1"><Label>Prescription Reference</Label><Input value={form.prescriptionRef ?? ""} onChange={f("prescriptionRef")} /></div>
            <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">⚠ Doubled Withdrawal Periods</p></div>
            <div className="space-y-1"><Label>Standard Milk W/D (days)</Label><Input type="number" value={form.standardMilkWithdrawalDays ?? ""} onChange={e => { const v = e.target.value ? Number(e.target.value) : null; setForm(p => ({ ...p, standardMilkWithdrawalDays: v, doubledMilkWithdrawalDays: autoDoubled(v) })); }} /></div>
            <div className="space-y-1"><Label className="text-blue-700">Doubled Milk W/D (days)</Label><Input type="number" value={form.doubledMilkWithdrawalDays ?? ""} onChange={e => setForm(p => ({ ...p, doubledMilkWithdrawalDays: e.target.value ? Number(e.target.value) : null }))} className="border-blue-300" /></div>
            <div className="space-y-1"><Label>Standard Meat W/D (days)</Label><Input type="number" value={form.standardMeatWithdrawalDays ?? ""} onChange={e => { const v = e.target.value ? Number(e.target.value) : null; setForm(p => ({ ...p, standardMeatWithdrawalDays: v, doubledMeatWithdrawalDays: autoDoubled(v) })); }} /></div>
            <div className="space-y-1"><Label className="text-blue-700">Doubled Meat W/D (days)</Label><Input type="number" value={form.doubledMeatWithdrawalDays ?? ""} onChange={e => setForm(p => ({ ...p, doubledMeatWithdrawalDays: e.target.value ? Number(e.target.value) : null }))} className="border-blue-300" /></div>
            <div className="space-y-1"><Label>Milk W/D End Date</Label><Input type="date" value={String(form.milkWithdrawalEndDate ?? "").slice(0, 10)} onChange={f("milkWithdrawalEndDate")} /></div>
            <div className="space-y-1"><Label>Meat W/D End Date</Label><Input type="date" value={String(form.meatWithdrawalEndDate ?? "").slice(0, 10)} onChange={f("meatWithdrawalEndDate")} /></div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={form.certifierNotified ?? false} onCheckedChange={v => setForm(p => ({ ...p, certifierNotified: !!v }))} id="cert-notified" />
              <Label htmlFor="cert-notified" className="cursor-pointer font-normal">Certifier has been notified of this treatment</Label>
            </div>
            <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={f("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.productName || save.isPending}>
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Organic Tupping Tab ──────────────────────────────────────────────────────

interface TuppingRecord {
  id: number;
  tuppingStartDate: string;
  tuppingEndDate?: string | null;
  ramBreed?: string | null;
  ramTagNumber?: string | null;
  ramSource?: string | null;
  ewesExposed?: number | null;
  tuppingMethod?: string | null;
  harnessColour?: string | null;
  progesteroneUsed?: boolean | null;
  expectedLambingStart?: string | null;
  expectedLambingEnd?: string | null;
  notes?: string | null;
}

function TuppingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TuppingRecord | null>(null);
  const [viewing, setViewing] = useState<TuppingRecord | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = useState<string>("all");

  const { data: rows = [], isLoading } = useQuery<TuppingRecord[]>({
    queryKey: ["sheep-tupping", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sheep-tupping-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing
        ? api(`farms/${farmId}/sheep-tupping-records/${editing.id}`)
        : api(`farms/${farmId}/sheep-tupping-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-tupping-records/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }),
  });

  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  function openAdd() { setEditing(null); setForm({ progesteroneUsed: "false" }); setOpen(true); }
  function openEdit(r: TuppingRecord) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }

  const years = useMemo(() =>
    Array.from(new Set(rows.map(r => String(r.tuppingStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(),
    [rows]
  );
  const filtered = useMemo(() =>
    yearFilter === "all" ? rows : rows.filter(r => String(r.tuppingStartDate ?? "").startsWith(yearFilter)),
    [rows, yearFilter]
  );

  const fmtD = (v?: string | null) => v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtV = (v: unknown) => v == null || v === "" ? "—" : String(v);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Tupping Records</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin w-5 h-5 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No tupping records for this period.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Ram Breed</TableHead>
              <TableHead>Ram Tag</TableHead>
              <TableHead>Ewes Exposed</TableHead>
              <TableHead>Expected Lambing</TableHead>
              <TableHead>Progesterone</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{fmtD(r.tuppingStartDate)}</TableCell>
                <TableCell>{fmtD(r.tuppingEndDate)}</TableCell>
                <TableCell>{fmtV(r.ramBreed)}</TableCell>
                <TableCell>{fmtV(r.ramTagNumber)}</TableCell>
                <TableCell>{fmtV(r.ewesExposed)}</TableCell>
                <TableCell>{fmtD(r.expectedLambingStart)}</TableCell>
                <TableCell>
                  {r.progesteroneUsed ? (
                    <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs font-medium">CIDR / Prog. ⚠</Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Tupping Record Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {([
                  ["Start Date", fmtD(viewing.tuppingStartDate)],
                  ["End Date", fmtD(viewing.tuppingEndDate)],
                  ["Ram Breed", fmtV(viewing.ramBreed)],
                  ["Ram Tag", fmtV(viewing.ramTagNumber)],
                  ["Ram Source", fmtV(viewing.ramSource)],
                  ["Ewes Exposed", fmtV(viewing.ewesExposed)],
                  ["Tupping Method", fmtV(viewing.tuppingMethod)],
                  ["Harness Colour", fmtV(viewing.harnessColour)],
                  ["Expected Lambing Start", fmtD(viewing.expectedLambingStart)],
                  ["Expected Lambing End", fmtD(viewing.expectedLambingEnd)],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Progesterone / CIDR</p>
                <p className="font-medium">{viewing.progesteroneUsed ? "Yes" : "No"}</p>
              </div>
              {viewing.progesteroneUsed && (
                <div className="flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span><strong>Organic Restriction:</strong> Synthetic progesterone / CIDR used for reproductive synchronisation is a prohibited input under UK Organic Regulations. Ensure a Vet Treatment record exists in the Vet Treatments tab with doubled withdrawal periods applied and certifier notification recorded.</span>
                </div>
              )}
              {viewing.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
                  <p className="font-medium">{fmtV(viewing.notes)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Tupping Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1"><Label>Start Date *</Label><Input type="date" value={form.tuppingStartDate ?? ""} onChange={e => sf("tuppingStartDate", e.target.value)} /></div>
            <div className="space-y-1"><Label>End Date</Label><Input type="date" value={form.tuppingEndDate ?? ""} onChange={e => sf("tuppingEndDate", e.target.value)} /></div>
            <div className="space-y-1">
              <Label>Ram Breed</Label>
              <Select value={form.ramBreed ?? ""} onValueChange={v => sf("ramBreed", v)}>
                <SelectTrigger><SelectValue placeholder="Select breed..." /></SelectTrigger>
                <SelectContent>{["Suffolk","Texel","Charollais","Beltex","Bluefaced Leicester","Border Leicester","Hampshire Down","Poll Dorset","Rouge de l'Ouest","Vendeen","Lleyn","Cheviot","Swaledale","Herdwick","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Ram Tag Number</Label><Input value={form.ramTagNumber ?? ""} onChange={e => sf("ramTagNumber", e.target.value)} /></div>
            <div className="space-y-1">
              <Label>Ram Source</Label>
              <Select value={form.ramSource ?? ""} onValueChange={v => sf("ramSource", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Home bred","Purchased at auction/market","Private sale","AI centre","ET donor flock","Hired/loaned","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Ewes Exposed</Label><Input type="number" min="1" step="1" value={form.ewesExposed ?? ""} onChange={e => sf("ewesExposed", e.target.value)} /></div>
            <div className="space-y-1">
              <Label>Tupping Method</Label>
              <Select value={form.tuppingMethod ?? ""} onValueChange={v => sf("tuppingMethod", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Natural service","AI (fresh)","AI (frozen)","ET"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Harness Colour</Label>
              <Select value={form.harnessColour ?? ""} onValueChange={v => sf("harnessColour", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Red","Orange","Yellow","Green","Blue","Purple","Pink","None"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Expected Lambing Start</Label><Input type="date" value={form.expectedLambingStart ?? ""} onChange={e => sf("expectedLambingStart", e.target.value)} /></div>
            <div className="space-y-1"><Label>Expected Lambing End</Label><Input type="date" value={form.expectedLambingEnd ?? ""} onChange={e => sf("expectedLambingEnd", e.target.value)} /></div>
            <div className="col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={form.progesteroneUsed === "true"} onCheckedChange={v => sf("progesteroneUsed", v ? "true" : "false")} id="prog-org" />
              <Label htmlFor="prog-org" className="cursor-pointer font-normal">Progesterone / CIDR used</Label>
            </div>
            {form.progesteroneUsed === "true" && (
              <div className="col-span-2 flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>
                  <strong>⚠ Organic Restriction — Prohibited Input.</strong> Synthetic progesterone and CIDR devices used for reproductive synchronisation are prohibited inputs under UK Organic Regulations (UK Organic Regulations 2022, Schedule 2). If used therapeutically for an individual animal's medical condition on veterinary prescription, record a Vet Treatment in the <strong>Vet Treatments tab</strong> with doubled withdrawal periods applied, and notify your certifying body (Soil Association / OF&amp;G / Biodynamic). If used for cycle synchronisation, consult your certifying body immediately.
                </span>
              </div>
            )}
            <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={!form.tuppingStartDate || save.isPending}>
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
