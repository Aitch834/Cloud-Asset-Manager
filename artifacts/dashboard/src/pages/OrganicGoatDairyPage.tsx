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
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BcsTab, BulkTankTab, CaeTab, AssuranceTab } from "@/pages/GoatDairyPage";
import { SccEquipmentSection } from "@/pages/DairyPage";
import { AbrProcurementSection } from "@/pages/dairy/AbrProcurementSection";
import { RecordAttachments } from "@/components/ui/RecordAttachments";

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

function GoatSccBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const ok = v < 500;
  const warn = v >= 500 && v < 1000;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL {v >= 1000 ? "⚠ Exceeds limit" : ""}
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

const FEED_TYPES = ["Concentrate", "Grass Silage", "Hay", "Haylage", "Grazed Grass", "Straw", "Root Crops / Beet", "Minerals & Supplements", "Browse / Hedgerow", "Other"];

const PRODUCT_CATEGORIES = ["Antibiotic", "NSAID", "Anthelmintic", "Antiparasitic", "Vaccine", "Homeopathic", "Other"];

const ROUTES_OF_ADMINISTRATION = ["Intramuscular (IM)", "Subcutaneous (SC)", "Intravenous (IV)", "Oral", "Intramammary", "Topical", "Other"];

import { DairySuppliesTab } from "@/components/DairySuppliesTab";
type Tab = "conversion" | "collections" | "feed" | "treatments" | "mastitis" | "kidding" | "bcs" | "tank" | "cae" | "assurance" | "abr-kit" | "scc-equipment" | "supplies";

export default function OrganicGoatDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("conversion");
  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Organic Goat Dairy">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-full">🌿 Organic</Badge>
            <h1 className="text-2xl font-bold text-gray-900">Organic Goat Dairy</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Organic certification for dairy goats — flock conversion register, organic milk collection log with non-organic reason tracking, feed &amp; nutrition (≥95% organic DM target), and vet treatment register with doubled withdrawal periods (SA/OF&amp;G/Biodynamic certified flocks). CAE monitoring continues via the standard Goat Dairy module.
          </p>
        </div>
        <TabBar>
          <TabButton active={tab === "conversion"} onClick={() => setTab("conversion")}>Flock Conversion</TabButton>
          <TabButton active={tab === "collections"} onClick={() => setTab("collections")}>Milk Collections</TabButton>
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>Feed &amp; Nutrition</TabButton>
          <TabButton active={tab === "treatments"} onClick={() => setTab("treatments")}>Vet Treatments</TabButton>
          <TabButton active={tab === "mastitis"} onClick={() => setTab("mastitis")}>Mastitis</TabButton>
          <TabButton active={tab === "kidding"} onClick={() => setTab("kidding")}>Kidding Records</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "cae"} onClick={() => setTab("cae")}>CAE Monitoring</TabButton>
          <TabButton active={tab === "assurance"} onClick={() => setTab("assurance")}>Assurance</TabButton>
          <TabButton active={tab === "abr-kit"} onClick={() => setTab("abr-kit")}>ABR Kit Stock</TabButton>
          <TabButton active={tab === "scc-equipment"} onClick={() => setTab("scc-equipment")}>SCC Equipment</TabButton>
          <TabButton active={tab === "supplies"} onClick={() => setTab("supplies")}>Supplies</TabButton>
        </TabBar>
        <div className="mt-6">
          {tab === "conversion" && <FlockConversionTab farmId={farmId} />}
          {tab === "collections" && <OrganicCollectionsTab farmId={farmId} />}
          {tab === "feed" && <FeedNutritionTab farmId={farmId} />}
          {tab === "treatments" && <TreatmentRegisterTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "kidding" && <KiddingTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "cae" && <CaeTab farmId={farmId} />}
          {tab === "assurance" && <AssuranceTab />}
          {tab === "abr-kit" && <AbrProcurementSection farmId={farmId} />}
          {tab === "scc-equipment" && <SccEquipmentSection farmId={farmId} species="goat" />}
          {tab === "supplies" && <DairySuppliesTab farmId={farmId} dairyType="organic-goat" />}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlockConversionRecord {
  id: number; flockName: string; breed?: string | null; numberOfDoes?: number | null;
  conversionStartDate: string; expectedMilkCertDate?: string | null; actualMilkCertDate?: string | null;
  status: string; certifier?: string | null; certificationRef?: string | null;
  parallelProduction: boolean; notes?: string | null;
}

interface CollectionRecord {
  id: number; collectionDate: string; collectorName?: string | null; vehicleRegistration?: string | null;
  volumeLitres?: string | null; fatPercentage?: string | null; proteinPercentage?: string | null;
  lactosePercentage?: string | null;
  sccCount?: number | null; tbcCount?: number | null;
  milkTemperatureCelsius?: string | null; tempTestedBy?: string | null;
  antibioticResidueTestResult?: string | null; abrTestedBy?: string | null;
  abrTestKitLot?: string | null; abrTestKitBatch?: string | null;
  isRetest?: boolean | null; retestOfId?: number | null;
  buyerLabResultsStatus?: string | null; buyerLabResultsDate?: string | null;
  buyerLabRef?: string | null; buyerSccCount?: number | null; buyerTbcCount?: number | null;
  buyerFatPercentage?: string | null; buyerProteinPercentage?: string | null; buyerLactosePercentage?: string | null;
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
    queryKey: ["org-goat-flock-conv", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/flock-conversion`)).then(r => r.json()),
  });
  const records: FlockConversionRecord[] = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/flock-conversion${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-flock-conv", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Flock added" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-goat-dairy/flock-conversion/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-flock-conv", farmId] }); toast({ title: "Record deleted" }); },
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
              <TableHead>Does</TableHead>
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
                <TableCell>{r.numberOfDoes ?? "—"}</TableCell>
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
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Does</p><p className="font-medium">{fmtRaw(viewRec.numberOfDoes)}</p></div>
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
            <div className="col-span-2 space-y-1"><Label>Flock Name *</Label><Input value={form.flockName ?? ""} onChange={f("flockName")} placeholder="e.g. Home Flock — Alpine Does" /></div>
            <div className="space-y-1"><Label>Breed</Label><Input value={form.breed ?? ""} onChange={f("breed")} placeholder="e.g. British Alpine, Saanen" /></div>
            <div className="space-y-1"><Label>Number of Does</Label><Input type="number" value={form.numberOfDoes ?? ""} onChange={e => setForm(p => ({ ...p, numberOfDoes: e.target.value ? Number(e.target.value) : null }))} /></div>
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

// ─── AbrBadge ────────────────────────────────────────────────────────────────

function AbrBadge({ result }: { result?: string | null }) {
  if (!result || result === "not-tested") return <span className="text-gray-400 text-xs">—</span>;
  const map: Record<string, string> = {
    negative: "bg-green-100 text-green-800",
    positive: "bg-red-100 text-red-800",
    borderline: "bg-amber-100 text-amber-800",
    invalid: "bg-gray-100 text-gray-600",
  };
  return <Badge className={`text-xs ${map[result] ?? "bg-gray-100 text-gray-600"}`}>{result}</Badge>;
}

function LabResultsBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const map: Record<string, string> = {
    pass: "bg-green-100 text-green-800",
    fail: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
  };
  return <Badge className={`text-xs ${map[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</Badge>;
}

// ─── OrganicCollectionsTab ────────────────────────────────────────────────────

function OrganicCollectionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRecord | null>(null);
  const [viewRec, setViewRec] = useState<CollectionRecord | null>(null);
  const [formTab, setFormTab] = useState("collection");
  const blank: Partial<CollectionRecord> = { collectionDate: today(), isOrganicCollection: true };
  const [form, setForm] = useState<Partial<CollectionRecord>>(blank);
  const f = (k: keyof CollectionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const set = (k: keyof CollectionRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const [yearFilter, setYearFilter] = useState("all");
  const [abrKitStockId, setAbrKitStockId] = useState<string>("");
  const abrStockQ = useQuery<{ stock: Array<{ id: number; productName: string; lotNumber: string | null; quantityRemaining: number }> }>({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`)).then(r => r.json()),
  });
  const abrStock = abrStockQ.data?.stock ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["org-goat-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/collections`)).then(r => r.json()),
  });
  const records: CollectionRecord[] = data?.records ?? [];

  const { data: membersData } = useQuery<{ members: Array<{ id: number; firstName: string; lastName: string }> }>({
    queryKey: ["farm-members-goat-dairy", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/members`)).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });
  const staffNames = (membersData?.members ?? []).map(m => `${m.firstName} ${m.lastName}`.trim()).filter(Boolean);
  const years = useMemo(() => [...new Set(records.map(r => r.collectionDate?.slice(0, 4)).filter(Boolean))].sort().reverse() as string[], [records]);
  const filteredRecords = useMemo(() => yearFilter === "all" ? records : records.filter(r => r.collectionDate?.startsWith(yearFilter)), [records, yearFilter]);

  const organicCount = filteredRecords.filter(r => r.isOrganicCollection).length;
  const totalVol = filteredRecords.reduce((s, r) => s + (parseFloat(r.volumeLitres || "0") || 0), 0);
  const sccReadings = filteredRecords.map(r => r.sccCount).filter((v): v is number => v != null);
  const avgScc = sccReadings.length ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;
  const abrPositive = filteredRecords.filter(r => r.antibioticResidueTestResult === "positive" || r.antibioticResidueTestResult === "borderline").length;

  const save = useMutation({
    mutationFn: () => {
      if (!form.isOrganicCollection && !form.nonOrganicReason?.trim()) {
        throw new Error("Reason required for non-organic collection");
      }
      return fetch(api(`farms/${farmId}/organic-goat-dairy/collections${editing ? `/${editing.id}` : ""}`), {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, abrKitStockId: abrKitStockId || undefined }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-collections", farmId] }); qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }); setOpen(false); setAbrKitStockId(""); toast({ title: editing ? "Record updated" : "Collection added" }); },
    onError: (e: Error) => toast({ title: e.message || "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-goat-dairy/collections/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-collections", farmId] }); toast({ title: "Record deleted" }); },
  });

  function openNew() { setEditing(null); setForm(blank); setAbrKitStockId(""); setFormTab("collection"); setOpen(true); }
  function openEdit(r: CollectionRecord) { setEditing(r); setForm(r); setAbrKitStockId(""); setFormTab("collection"); setOpen(true); }

  function doPrint() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Organic Goat Milk Collections</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:#f5f5f5}h2{font-size:14px}</style></head><body><h2>Organic Goat Milk Collection Log${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Volume (L)</th><th>Collector</th><th>ABR</th><th>Temp (°C)</th><th>SCC (k/mL)</th><th>Fat%</th><th>Protein%</th><th>Organic</th><th>Net Value</th></tr></thead><tbody>${filteredRecords.map(r => `<tr><td>${r.collectionDate}</td><td>${parseFloat(r.volumeLitres || "0").toLocaleString()}</td><td>${r.collectorName || "—"}</td><td>${r.antibioticResidueTestResult || "—"}</td><td>${r.milkTemperatureCelsius || "—"}</td><td>${r.sccCount || "—"}</td><td>${r.fatPercentage || "—"}</td><td>${r.proteinPercentage || "—"}</td><td>${r.isOrganicCollection ? "Organic" : "Non-organic"}</td><td>${r.netValuePence != null ? "£" + (r.netValuePence / 100).toFixed(2) : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  }

  return (
    <div className="space-y-4">
      {abrPositive > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span><strong>{abrPositive} collection{abrPositive !== 1 ? "s" : ""}</strong> with positive or borderline ABR result — investigate before selling milk.</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Total Volume (filtered)</p><p className="text-2xl font-bold text-blue-800">{totalVol.toLocaleString("en-GB", { maximumFractionDigits: 0 })}<span className="text-sm font-normal ml-1">L</span></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Organic Collections</p><p className="text-2xl font-bold text-green-700">{organicCount}<span className="text-sm font-normal ml-1">/ {filteredRecords.length}</span></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Avg SCC (k/mL)</p><p className={`text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1000 ? "text-red-700" : avgScc > 500 ? "text-amber-700" : "text-green-700"}`}>{avgScc != null ? avgScc.toLocaleString() : "—"}</p><p className="text-xs text-gray-400">Limit: 1,000k</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">ABR Alerts</p><p className={`text-2xl font-bold ${abrPositive > 0 ? "text-red-700" : "text-gray-400"}`}>{abrPositive}</p></CardContent></Card>
      </div>

      {(() => {
        const monthMap: Record<string, { label: string; volL: number; scc: number | null }> = {};
        [...filteredRecords].sort((a, b) => String(a.collectionDate).localeCompare(String(b.collectionDate))).forEach(r => {
          const key = String(r.collectionDate || "").slice(0, 7);
          if (key.length !== 7) return;
          const label = new Date(key + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
          if (!monthMap[key]) monthMap[key] = { label, volL: 0, scc: null };
          monthMap[key].volL += parseFloat(r.volumeLitres || "0") || 0;
          if (r.sccCount != null) monthMap[key].scc = r.sccCount;
        });
        const chartData = Object.keys(monthMap).sort().map(k => monthMap[k]);
        if (chartData.length <= 1) return null;
        return (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Volume &amp; SCC Trend — Monthly</h3>
              <span className="text-xs text-gray-400">Organic goat regulatory SCC limit: 1,000k cells/mL</span>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={55} tickFormatter={(v: number) => `${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={65} tickFormatter={(v: number) => `${v}k`} />
                  <Tooltip formatter={(v: number, name: string) => [name === "SCC (k/mL)" ? `${v}k` : `${Number(v).toFixed(0)}L`, name]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="volL" name="Volume (L)" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="scc" name="SCC (k/mL)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={doPrint} disabled={filteredRecords.length === 0}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />Add Collection</Button>
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Volume (L)</TableHead>
              <TableHead>SCC (k/mL)</TableHead>
              <TableHead>ABR</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Fat %</TableHead>
              <TableHead>Protein %</TableHead>
              <TableHead>Organic</TableHead>
              <TableHead>Net Value</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 && (
              <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8"><Droplets className="w-7 h-7 mx-auto mb-2 opacity-40" />No milk collection records {yearFilter !== "all" ? `for ${yearFilter}` : "yet"}.</TableCell></TableRow>
            )}
            {filteredRecords.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.collectionDate)}</TableCell>
                <TableCell>{r.volumeLitres ? parseFloat(r.volumeLitres).toLocaleString() : "—"}</TableCell>
                <TableCell><GoatSccBadge v={r.sccCount} /></TableCell>
                <TableCell><AbrBadge result={r.antibioticResidueTestResult} /></TableCell>
                <TableCell><LabResultsBadge status={r.buyerLabResultsStatus} /></TableCell>
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
          <DialogContent style={{ maxWidth: "42rem" }} className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Milk Collection — {fmt(viewRec.collectionDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{fmt(viewRec.collectionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume (litres)</p><p className="font-medium">{fmtRaw(viewRec.volumeLitres)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collector</p><p className="font-medium">{fmtRaw(viewRec.collectorName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle Reg</p><p className="font-medium">{fmtRaw(viewRec.vehicleRegistration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Temperature</p><p className="font-medium">{viewRec.milkTemperatureCelsius ? `${viewRec.milkTemperatureCelsius} °C` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Result</p><p className="font-medium"><AbrBadge result={viewRec.antibioticResidueTestResult} /></p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC (k/mL)</p><p className="font-medium"><GoatSccBadge v={viewRec.sccCount} /></p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">TBC (k/mL)</p><p className="font-medium">{fmtRaw(viewRec.tbcCount)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fat %</p><p className="font-medium">{viewRec.fatPercentage ? `${viewRec.fatPercentage}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protein %</p><p className="font-medium">{viewRec.proteinPercentage ? `${viewRec.proteinPercentage}%` : "—"}</p></div>
              {viewRec.lactosePercentage && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lactose %</p><p className="font-medium">{viewRec.lactosePercentage}%</p></div>}
              {viewRec.abrTestedBy && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Tested By</p><p className="font-medium">{viewRec.abrTestedBy}</p></div>}
              {viewRec.isRetest && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Retest</p><p className="font-medium text-amber-700">Follow-up retest {viewRec.retestOfId ? `of record #${viewRec.retestOfId}` : ""}</p></div>}
              {viewRec.buyerLabResultsStatus && <>
                <div className="col-span-2 border-t pt-3"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buyer Lab Results — {viewRec.buyerLabResultsStatus}</p></div>
                {viewRec.buyerLabResultsDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Results Date</p><p className="font-medium">{fmt(viewRec.buyerLabResultsDate)}</p></div>}
                {viewRec.buyerLabRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Ref</p><p className="font-medium">{viewRec.buyerLabRef}</p></div>}
                {viewRec.buyerSccCount != null && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer SCC</p><p className="font-medium">{viewRec.buyerSccCount.toLocaleString()} k/mL</p></div>}
                {viewRec.buyerFatPercentage && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer Fat %</p><p className="font-medium">{viewRec.buyerFatPercentage}%</p></div>}
              </>}
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Certified</p>
                <p className="font-medium">{viewRec.isOrganicCollection ? <span className="text-green-700">Yes — sold as organic</span> : <span className="text-amber-700">No — sold as conventional</span>}</p>
              </div>
              {!viewRec.isOrganicCollection && viewRec.nonOrganicReason && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Non-organic Reason</p><p className="font-medium text-amber-800">{viewRec.nonOrganicReason}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Premium</p><p className="font-medium">{formatPence(viewRec.organicPremiumPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Value</p><p className="font-medium">{formatPence(viewRec.netValuePence)}</p></div>
              {viewRec.witnessedBy && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Witnessed By</p><p className="font-medium">{viewRec.witnessedBy}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attachments — documents &amp; buyer lab report</p>
                <RecordAttachments farmId={farmId} recordType="organic-goat-dairy-collection" recordId={viewRec.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Collection" : "Add Milk Collection"}</DialogTitle>
            <DialogDescription>Record each milk collection with quality metrics and organic certification status.</DialogDescription>
          </DialogHeader>
          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collection">Collection</TabsTrigger>
              <TabsTrigger value="quality">Quality & ABR</TabsTrigger>
              <TabsTrigger value="buyer">Buyer Lab</TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Collection Date *</Label><Input type="date" value={String(form.collectionDate ?? "").slice(0, 10)} onChange={f("collectionDate")} /></div>
                <div className="space-y-1"><Label>Volume (litres) *</Label><Input type="number" step="0.01" value={form.volumeLitres ?? ""} onChange={f("volumeLitres")} /></div>
                <div className="space-y-1"><Label>Collector Name</Label><Input value={form.collectorName ?? ""} onChange={f("collectorName")} /></div>
                <div className="space-y-1"><Label>Vehicle Registration</Label><Input value={form.vehicleRegistration ?? ""} onChange={f("vehicleRegistration")} /></div>
                <div className="space-y-1"><Label>Processor Ref</Label><Input value={form.processorRef ?? ""} onChange={f("processorRef")} /></div>
                <div className="space-y-1"><Label>Collection Docket Ref</Label><Input value={form.collectionSlipRef ?? ""} onChange={f("collectionSlipRef")} /></div>
                <div className="space-y-1"><Label>Organic Premium (pence)</Label><Input type="number" value={form.organicPremiumPence ?? ""} onChange={e => set("organicPremiumPence", e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="space-y-1"><Label>Net Value (pence)</Label><Input type="number" value={form.netValuePence ?? ""} onChange={e => set("netValuePence", e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="col-span-2 space-y-1"><Label>Witnessed By</Label><Input value={form.witnessedBy ?? ""} onChange={f("witnessedBy")} /></div>
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
            </TabsContent>

            <TabsContent value="quality" className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Milk Temperature (°C)</Label>
                  <Input type="number" step="0.1" value={form.milkTemperatureCelsius ?? ""} onChange={f("milkTemperatureCelsius")} placeholder="e.g. 4.2" />
                  <p className="text-xs text-gray-400">Target: ≤6°C at collection</p>
                </div>
                <div className="space-y-1">
                  <Label>Temp Tested By</Label>
                  <datalist id="goat-dairy-staff-list">{staffNames.map(n => <option key={n} value={n} />)}</datalist>
                  <Input list="goat-dairy-staff-list" placeholder="Name of tester" value={form.tempTestedBy ?? ""} onChange={f("tempTestedBy")} />
                </div>
                <div className="space-y-1">
                  <Label>ABR Test Result</Label>
                  <Select value={form.antibioticResidueTestResult ?? "__none__"} onValueChange={v => set("antibioticResidueTestResult", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Select result…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not tested —</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="positive">Positive ⚠</SelectItem>
                      <SelectItem value="borderline">Borderline — repeat required</SelectItem>
                      <SelectItem value="invalid">Invalid — repeat required</SelectItem>
                      <SelectItem value="not-tested">Not tested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>ABR Tested By</Label>
                  <Input list="goat-dairy-staff-list" placeholder="Name of tester" value={form.abrTestedBy ?? ""} onChange={f("abrTestedBy")} />
                </div>
                <div className="col-span-2 space-y-1"><Label>ABR Kit Stock Record</Label>
                  <Select value={abrKitStockId} onValueChange={setAbrKitStockId}>
                    <SelectTrigger><SelectValue placeholder="Link kit (auto-decrements stock)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None / not tracking</SelectItem>
                      {abrStock.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.productName}{s.lotNumber ? ` · Lot ${s.lotNumber}` : ""} ({s.quantityRemaining} remaining)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>ABR Test Kit Lot</Label><Input value={form.abrTestKitLot ?? ""} onChange={f("abrTestKitLot")} placeholder="Lot number" /></div>
                <div className="space-y-1"><Label>ABR Test Kit Batch</Label><Input value={form.abrTestKitBatch ?? ""} onChange={f("abrTestKitBatch")} placeholder="Batch / expiry" /></div>
                <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
                  <Checkbox checked={form.isRetest ?? false} onCheckedChange={v => set("isRetest", !!v)} id="is-retest" />
                  <Label htmlFor="is-retest" className="cursor-pointer font-normal">This is a follow-up retest of a previous non-negative result</Label>
                </div>
                {form.isRetest && (
                  <div className="col-span-2 space-y-1">
                    <Label>Retest of (original record)</Label>
                    <Select value={form.retestOfId ? String(form.retestOfId) : "__none__"} onValueChange={v => set("retestOfId", v === "__none__" ? null : Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Select original record…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None selected —</SelectItem>
                        {records.filter(r => r.id !== editing?.id && (r.antibioticResidueTestResult === "positive" || r.antibioticResidueTestResult === "borderline" || r.antibioticResidueTestResult === "invalid")).slice(0, 40).map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>{fmt(r.collectionDate)} — ABR {r.antibioticResidueTestResult}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1"><Label>SCC (k/mL)</Label><Input type="number" value={form.sccCount ?? ""} onChange={e => set("sccCount", e.target.value ? Number(e.target.value) : null)} /><p className="text-xs text-gray-400">UK limit: 1,000k</p></div>
                <div className="space-y-1"><Label>TBC (k/mL)</Label><Input type="number" value={form.tbcCount ?? ""} onChange={e => set("tbcCount", e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="space-y-1"><Label>Fat %</Label><Input type="number" step="0.01" value={form.fatPercentage ?? ""} onChange={f("fatPercentage")} /></div>
                <div className="space-y-1"><Label>Protein %</Label><Input type="number" step="0.01" value={form.proteinPercentage ?? ""} onChange={f("proteinPercentage")} /></div>
                <div className="col-span-2 space-y-1"><Label>Lactose %</Label><Input type="number" step="0.01" value={form.lactosePercentage ?? ""} onChange={f("lactosePercentage")} /></div>
              </div>
            </TabsContent>

            <TabsContent value="buyer" className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-md border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs text-blue-800">Buyer lab results are the processor's independent measurements. Enter them when you receive the results report.</p>
                </div>
                <div className="space-y-1">
                  <Label>Buyer Lab Results Status</Label>
                  <Select value={form.buyerLabResultsStatus ?? "__none__"} onValueChange={v => set("buyerLabResultsStatus", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Select status…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not received —</SelectItem>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Lab Results Date</Label><Input type="date" value={String(form.buyerLabResultsDate ?? "").slice(0, 10)} onChange={f("buyerLabResultsDate")} /></div>
                <div className="col-span-2 space-y-1"><Label>Lab Reference</Label><Input value={form.buyerLabRef ?? ""} onChange={f("buyerLabRef")} placeholder="Buyer's lab report reference" /></div>
                <div className="space-y-1"><Label>Buyer SCC (k/mL)</Label><Input type="number" value={form.buyerSccCount ?? ""} onChange={e => set("buyerSccCount", e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="space-y-1"><Label>Buyer TBC (k/mL)</Label><Input type="number" value={form.buyerTbcCount ?? ""} onChange={e => set("buyerTbcCount", e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="space-y-1"><Label>Buyer Fat %</Label><Input type="number" step="0.01" value={form.buyerFatPercentage ?? ""} onChange={f("buyerFatPercentage")} /></div>
                <div className="space-y-1"><Label>Buyer Protein %</Label><Input type="number" step="0.01" value={form.buyerProteinPercentage ?? ""} onChange={f("buyerProteinPercentage")} /></div>
                <div className="col-span-2 space-y-1"><Label>Buyer Lactose %</Label><Input type="number" step="0.01" value={form.buyerLactosePercentage ?? ""} onChange={f("buyerLactosePercentage")} /></div>
              </div>
            </TabsContent>
          </Tabs>
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
    queryKey: ["org-goat-feed", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/feed`)).then(r => r.json()),
  });
  const records: FeedRecord[] = data?.records ?? [];
  const nonOrganicCount = records.filter(r => !r.isOrganicApproved).length;

  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/feed${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-feed", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Record added" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-goat-dairy/feed/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-feed", farmId] }); toast({ title: "Record deleted" }); },
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
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="organic-goat-dairy-feed" recordId={viewRec.id} /></div>
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
            <div className="col-span-2 space-y-1"><Label>Feed Product Name *</Label><Input value={form.feedProductName ?? ""} onChange={f("feedProductName")} placeholder="e.g. Organic Milking Goat Blend" /></div>
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

// ─── Organic Goat Dairy — Mastitis Tab ────────────────────────────────────────

interface OrgGoatMastitisRecord {
  id: number; incidentDate: string; doeLisTag?: string | null; halfAffected?: string | null;
  clinicalSigns?: string | null; pathogenIdentified?: string | null; labSampleTaken?: boolean | null;
  labRef?: string | null; sccAtOnset?: number | null; treatmentProduct?: string | null;
  treatmentDurationDays?: number | null;
  standardMilkWithdrawalDays?: number | null; doubledMilkWithdrawalDays?: number | null;
  milkWithdrawnUntil?: string | null; certifierNotified?: boolean | null;
  outcome?: string | null; attendingVet?: string | null;
  chronicCase?: boolean | null; culledDueToMastitis?: boolean | null; notes?: string | null;
}

function MastitisTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OrgGoatMastitisRecord | null>(null);
  const [viewRec, setViewRec] = useState<OrgGoatMastitisRecord | null>(null);
  const blank: Partial<OrgGoatMastitisRecord> = { incidentDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false, certifierNotified: false };
  const [form, setForm] = useState<Partial<OrgGoatMastitisRecord>>(blank);
  const set = (k: keyof OrgGoatMastitisRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records`)).then(r => r.json()) });
  const records: OrgGoatMastitisRecord[] = data?.records ?? [];
  const uncertifiedCount = records.filter(r => r.treatmentProduct && !r.certifierNotified).length;

  const save = useMutation({
    mutationFn: (body: Partial<OrgGoatMastitisRecord>) => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-mastitis", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-mastitis", farmId] }); toast({ title: "Deleted" }); },
  });

  const mastiYears = useMemo(() => Array.from(new Set<string>(records.map(r => String(r.incidentDate || "").slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a)), [records]);
  const [mastiYear, setMastiYear] = useState("all");
  const filtered = useMemo(() => mastiYear === "all" ? records : records.filter(r => String(r.incidentDate || "").startsWith(mastiYear)), [records, mastiYear]);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Organic rule:</strong> All withdrawal periods for mastitis treatments must be DOUBLED. Record both standard and doubled milk withdrawal days. Notify your certifier of any antibiotic use.
      </div>
      {uncertifiedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{uncertifiedCount} treated case{uncertifiedCount !== 1 ? "s" : ""} where certifier has not been notified.</span>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-800">Mastitis Records</h2>
          <Select value={mastiYear} onValueChange={setMastiYear}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{mastiYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No mastitis records yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Doe LIS Tag</TableHead><TableHead>Half</TableHead>
              <TableHead>Treatment</TableHead><TableHead>Dbl Milk W/D</TableHead><TableHead>Certifier</TableHead><TableHead>Outcome</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>{filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.incidentDate)}</TableCell>
                <TableCell className="font-mono text-xs">{r.doeLisTag || "—"}</TableCell>
                <TableCell className="capitalize">{r.halfAffected || "—"}</TableCell>
                <TableCell>{r.treatmentProduct || "—"}</TableCell>
                <TableCell>{r.doubledMilkWithdrawalDays != null ? <Badge className="bg-blue-100 text-blue-800">{r.doubledMilkWithdrawalDays}d</Badge> : "—"}</TableCell>
                <TableCell><Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : r.treatmentProduct ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"}>{r.certifierNotified ? "Notified" : r.treatmentProduct ? "Pending" : "N/A"}</Badge></TableCell>
                <TableCell>{r.outcome || "Ongoing"}{r.chronicCase ? <span className="ml-1 text-xs text-amber-600">Chronic</span> : null}</TableCell>
                <TableCell><div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Mastitis — {viewRec.doeLisTag || "Unknown doe"} on {fmt(viewRec.incidentDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe LIS Tag</p><p className="font-mono font-medium">{viewRec.doeLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Half Affected</p><p className="font-medium capitalize">{viewRec.halfAffected || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clinical Signs</p><p className="font-medium">{viewRec.clinicalSigns || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pathogen</p><p className="font-medium">{viewRec.pathogenIdentified || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Product</p><p className="font-medium">{viewRec.treatmentProduct || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Duration (days)</p><p className="font-medium">{viewRec.treatmentDurationDays ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Standard Milk W/D (days)</p><p className="font-medium">{viewRec.standardMilkWithdrawalDays ?? "—"}</p></div>
              <div><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Doubled Milk W/D (days)</p><p className="font-bold text-blue-800">{viewRec.doubledMilkWithdrawalDays ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Withheld Until</p><p className="font-medium">{fmt(viewRec.milkWithdrawnUntil)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Notified</p><p className="font-medium">{viewRec.certifierNotified ? "Yes" : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-medium capitalize">{viewRec.outcome || "Ongoing"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Attending Vet</p><p className="font-medium">{viewRec.attendingVet || "—"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
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
            <div><Label>Doe LIS Tag</Label><Input value={form.doeLisTag || ""} onChange={e => set("doeLisTag", e.target.value)} placeholder="LIS ear tag" /></div>
            <div><Label>Half Affected</Label>
              <Select value={form.halfAffected || "__none__"} onValueChange={v => set("halfAffected", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="left">Left</SelectItem><SelectItem value="right">Right</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Clinical Signs</Label><Input value={form.clinicalSigns || ""} onChange={e => set("clinicalSigns", e.target.value)} /></div>
            <div><Label>Pathogen Identified</Label><Input value={form.pathogenIdentified || ""} onChange={e => set("pathogenIdentified", e.target.value)} placeholder="e.g. Staph. aureus" /></div>
            <div><Label>Lab Ref</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>SCC at Onset (k/mL)</Label><Input type="number" value={form.sccAtOnset || ""} onChange={e => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : null)} /><p className="text-xs text-gray-400 mt-0.5">UK limit: 1,000k</p></div>
            <div><Label>Treatment Product</Label><Input value={form.treatmentProduct || ""} onChange={e => set("treatmentProduct", e.target.value)} /></div>
            <div><Label>Duration (days)</Label><Input type="number" value={form.treatmentDurationDays || ""} onChange={e => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">⚠ Organic — Doubled Withdrawal</p></div>
            <div><Label>Standard Milk W/D (days)</Label><Input type="number" value={form.standardMilkWithdrawalDays || ""} onChange={e => { const v = e.target.value ? parseInt(e.target.value) : null; set("standardMilkWithdrawalDays", v); set("doubledMilkWithdrawalDays", v ? v * 2 : null); }} /></div>
            <div><Label className="text-blue-700">Doubled Milk W/D (days)</Label><Input type="number" value={form.doubledMilkWithdrawalDays || ""} onChange={e => set("doubledMilkWithdrawalDays", e.target.value ? parseInt(e.target.value) : null)} className="border-blue-300" /></div>
            <div><Label>Milk Withheld Until</Label><Input type="date" value={String(form.milkWithdrawnUntil || "").slice(0, 10)} onChange={e => set("milkWithdrawnUntil", e.target.value)} /></div>
            <div><Label>Outcome</Label>
              <Select value={form.outcome || "__none__"} onValueChange={v => set("outcome", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Ongoing</SelectItem><SelectItem value="cured">Cured</SelectItem><SelectItem value="recovered">Recovered</SelectItem><SelectItem value="dried-off">Dried off early</SelectItem><SelectItem value="chronic">Chronic</SelectItem><SelectItem value="culled">Culled</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Attending Vet</Label><Input value={form.attendingVet || ""} onChange={e => set("attendingVet", e.target.value)} /></div>
            <div className="col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.labSampleTaken} onChange={e => set("labSampleTaken", e.target.checked)} />Lab sample taken</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.chronicCase} onChange={e => set("chronicCase", e.target.checked)} />Chronic case</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.culledDueToMastitis} onChange={e => set("culledDueToMastitis", e.target.checked)} />Culled for mastitis</label>
            </div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={!!form.certifierNotified} onCheckedChange={v => set("certifierNotified", !!v)} id="masti-cert-goat" />
              <Label htmlFor="masti-cert-goat" className="cursor-pointer font-normal">Certifier has been notified of this antibiotic treatment</Label>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Organic Goat Dairy — Kidding Tab ─────────────────────────────────────────

interface OrgKiddingRecord {
  id: number; kiddingDate: string; doeLisTag?: string | null; birthOutcome: string;
  kidCount?: number | null; kidSex?: string | null; kidEidTag?: string | null;
  kidBirthWeightKg?: string | null; easeScore?: number | null;
  assistanceRequired?: boolean; assistanceType?: string | null;
  vetAttended?: boolean; vetName?: string | null;
  colostrumGivenWithin2Hours?: boolean | null; colostrumFromOrganicDoe?: boolean | null;
  organicStatusConfirmed?: boolean | null;
  eidApplied?: boolean; eidAppliedDate?: string | null; lisTagNumber?: string | null;
  doeMilkingStatus?: string | null; doeComplications?: string | null; notes?: string | null;
}

function OrgEaseScoreBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const cls = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const lbl = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] || "bg-gray-100 text-gray-700"}`}>{v} — {lbl[v] || "Unknown"}</span>;
}

function KiddingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OrgKiddingRecord | null>(null);
  const [viewRec, setViewRec] = useState<OrgKiddingRecord | null>(null);
  const blank: Partial<OrgKiddingRecord> = { kiddingDate: today(), birthOutcome: "live-single", kidCount: 1, assistanceRequired: false, vetAttended: false, eidApplied: false, colostrumFromOrganicDoe: true, organicStatusConfirmed: false };
  const [form, setForm] = useState<Partial<OrgKiddingRecord>>(blank);
  const set = (k: keyof OrgKiddingRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-kidding", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/kidding-records`)).then(r => r.json()) });
  const records: OrgKiddingRecord[] = data?.records ?? [];

  const save = useMutation({
    mutationFn: (body: Partial<OrgKiddingRecord>) => fetch(api(`farms/${farmId}/goat-dairy/kidding-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-kidding", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/kidding-records/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-kidding", farmId] }); toast({ title: "Deleted" }); },
  });

  const kiddingYears = useMemo(() => Array.from(new Set<string>(records.map(r => String(r.kiddingDate || "").slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a)), [records]);
  const [kiddingYearFilter, setKiddingYearFilter] = useState("all");
  const filteredKidding = useMemo(() => kiddingYearFilter === "all" ? records : records.filter(r => String(r.kiddingDate || "").startsWith(kiddingYearFilter)), [records, kiddingYearFilter]);

  const liveCount = filteredKidding.reduce((s, r) => s + (r.birthOutcome?.includes("live") ? (r.kidCount || 1) : 0), 0);
  const pendingEid = filteredKidding.filter(r => !r.eidApplied && r.birthOutcome?.includes("live")).length;
  const colostrumRisk = filteredKidding.filter(r => r.birthOutcome?.includes("live") && r.colostrumGivenWithin2Hours === false).length;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Organic welfare:</strong> Colostrum must be given within 2 hours of birth. Colostrum should come from the organic doe where possible. Record organic status confirmation for each kidding.
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Litters Recorded</p><p className="text-2xl font-bold text-gray-800">{filteredKidding.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Live Kids</p><p className="text-2xl font-bold text-green-700">{liveCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">EID Pending</p><p className={`text-2xl font-bold ${pendingEid > 0 ? "text-amber-700" : "text-gray-400"}`}>{pendingEid}</p></CardContent></Card>
      </div>
      {colostrumRisk > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{colostrumRisk} birth{colostrumRisk !== 1 ? "s" : ""} where colostrum was NOT given within 2 hours — organic welfare concern.</span>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-800">Kidding Records</h2>
          <Select value={kiddingYearFilter} onValueChange={setKiddingYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{kiddingYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filteredKidding.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No kidding records yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Doe LIS Tag</TableHead><TableHead>Outcome</TableHead>
              <TableHead>Kids</TableHead><TableHead>Ease</TableHead><TableHead>Col ≤2h</TableHead><TableHead>EID</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>{filteredKidding.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.kiddingDate)}</TableCell>
                <TableCell className="font-mono text-xs">{r.doeLisTag || "—"}</TableCell>
                <TableCell className="capitalize">{r.birthOutcome?.replace(/-/g, " ") || "—"}</TableCell>
                <TableCell>{r.kidCount ?? 1} × {r.kidSex || "?"}</TableCell>
                <TableCell><OrgEaseScoreBadge v={r.easeScore} /></TableCell>
                <TableCell>{r.colostrumGivenWithin2Hours === true ? <Badge className="bg-green-100 text-green-800">Yes ✓</Badge> : r.colostrumGivenWithin2Hours === false ? <Badge className="bg-red-100 text-red-700">No ⚠</Badge> : "—"}</TableCell>
                <TableCell>{r.eidApplied ? <span className="text-green-700 font-medium text-xs">✓</span> : <span className="text-amber-600 text-xs">Pending</span>}</TableCell>
                <TableCell><div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Kidding Record — {fmt(viewRec.kiddingDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe LIS Tag</p><p className="font-mono font-medium">{viewRec.doeLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Outcome</p><p className="font-medium capitalize">{viewRec.birthOutcome?.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Kid Count</p><p className="font-medium">{viewRec.kidCount ?? 1}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sex</p><p className="font-medium capitalize">{viewRec.kidSex || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Weight (kg)</p><p className="font-medium">{viewRec.kidBirthWeightKg || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><OrgEaseScoreBadge v={viewRec.easeScore} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRec.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRec.colostrumGivenWithin2Hours === false ? "No ⚠" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum from Organic Doe</p><p className="font-medium">{viewRec.colostrumFromOrganicDoe === true ? "Yes" : viewRec.colostrumFromOrganicDoe === false ? "No — note reason" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EID Applied</p><p className="font-medium">{viewRec.eidApplied ? `Yes — ${fmt(viewRec.eidAppliedDate)}` : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">LIS Tag Number</p><p className="font-mono font-medium">{viewRec.lisTagNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Status Confirmed</p><p className="font-medium">{viewRec.organicStatusConfirmed ? "Yes" : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe Milking Status</p><p className="font-medium capitalize">{viewRec.doeMilkingStatus || "—"}</p></div>
              {viewRec.doeComplications && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe Complications</p><p className="font-medium">{viewRec.doeComplications}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Kidding Record" : "Add Kidding Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Kidding Date *</Label><Input type="date" value={String(form.kiddingDate || "").slice(0, 10)} onChange={e => set("kiddingDate", e.target.value)} /></div>
            <div><Label>Doe LIS Tag</Label><Input value={form.doeLisTag || ""} onChange={e => set("doeLisTag", e.target.value)} /></div>
            <div><Label>Birth Outcome *</Label>
              <Select value={form.birthOutcome || "live-single"} onValueChange={v => set("birthOutcome", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="live-single">Live — single</SelectItem><SelectItem value="live-twins">Live — twins</SelectItem><SelectItem value="live-triplets">Live — triplets</SelectItem><SelectItem value="stillborn">Stillborn</SelectItem><SelectItem value="mummified">Mummified</SelectItem><SelectItem value="abortion">Abortion</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Kid Count</Label><Input type="number" min="1" value={form.kidCount || 1} onChange={e => set("kidCount", parseInt(e.target.value))} /></div>
            <div><Label>Sex</Label>
              <Select value={form.kidSex || "__none__"} onValueChange={v => set("kidSex", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not recorded</SelectItem><SelectItem value="doe">Doe kid</SelectItem><SelectItem value="buck">Buck kid</SelectItem><SelectItem value="mixed">Mixed</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Birth Weight (kg)</Label><Input type="number" step="0.1" value={form.kidBirthWeightKg || ""} onChange={e => set("kidBirthWeightKg", e.target.value)} /></div>
            <div><Label>Ease Score</Label>
              <Select value={String(form.easeScore || "")} onValueChange={v => set("easeScore", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent><SelectItem value="1">1 — Unassisted</SelectItem><SelectItem value="2">2 — Minor assistance</SelectItem><SelectItem value="3">3 — Major assistance</SelectItem><SelectItem value="4">4 — Vet required</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">LIS Tagging</p></div>
            <div><Label>Kid EID Tag</Label><Input value={form.kidEidTag || ""} onChange={e => set("kidEidTag", e.target.value)} /></div>
            <div><Label>LIS Tag Number</Label><Input value={form.lisTagNumber || ""} onChange={e => set("lisTagNumber", e.target.value)} /></div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" className="rounded" checked={!!form.eidApplied} onChange={e => set("eidApplied", e.target.checked)} id="gd-eid-org" />
              <label htmlFor="gd-eid-org" className="text-sm cursor-pointer">EID tag applied</label>
              {form.eidApplied && <Input type="date" className="ml-2 w-40" value={String(form.eidAppliedDate || "").slice(0, 10)} onChange={e => set("eidAppliedDate", e.target.value)} />}
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">⚠ Organic Welfare — Colostrum</p></div>
            <div><Label>Colostrum Given ≤2h *</Label>
              <Select value={form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no"} onValueChange={v => set("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not recorded</SelectItem><SelectItem value="yes">Yes ✓</SelectItem><SelectItem value="no">No ⚠</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Colostrum from Organic Doe</Label>
              <Select value={form.colostrumFromOrganicDoe == null ? "__none__" : form.colostrumFromOrganicDoe ? "yes" : "no"} onValueChange={v => set("colostrumFromOrganicDoe", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No — note reason</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-green-50 border-green-200">
              <Checkbox checked={!!form.organicStatusConfirmed} onCheckedChange={v => set("organicStatusConfirmed", !!v)} id="org-status-kid" />
              <Label htmlFor="org-status-kid" className="cursor-pointer font-normal text-green-800">Organic status of this birth confirmed</Label>
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Doe</p></div>
            <div><Label>Doe Milking Status</Label>
              <Select value={form.doeMilkingStatus || "__none__"} onValueChange={v => set("doeMilkingStatus", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="good">Good let-down</SelectItem><SelectItem value="poor">Poor let-down</SelectItem><SelectItem value="agalactia">Agalactia</SelectItem><SelectItem value="mastitis">Mastitis</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Doe Complications</Label><Input value={form.doeComplications || ""} onChange={e => set("doeComplications", e.target.value)} /></div>
            <div className="flex items-end pb-2">
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
    queryKey: ["org-goat-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/treatments`)).then(r => r.json()),
  });
  const records: TreatmentRecord[] = data?.records ?? [];
  const uncertifiedCount = records.filter(r => !r.certifierNotified).length;

  function autoDoubled(stdDays: number | null | undefined): number | null {
    if (!stdDays) return null;
    return stdDays * 2;
  }

  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/treatments${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-treatments", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Treatment recorded" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-goat-dairy/treatments/${id}`), { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-goat-treatments", farmId] }); toast({ title: "Record deleted" }); },
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
