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
import { BcsTab, BulkTankTab, MvTab, AssuranceTab, SheepLambingTab } from "@/pages/SheepDairyPage";
import { SccEquipmentSection, AbrKitStockSection } from "@/pages/DairyPage";
import { AbrProcurementSection } from "@/pages/dairy/AbrProcurementSection";
import { DairyEnterpriseReport } from "@/components/DairyEnterpriseReport";
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

interface TreatmentRecord {
  id: number;
  treatmentDate: string;
  animalLisTags?: string | null;
  numberOfAnimals?: number | null;
  productName: string;
  productCategory?: string | null;
  activeIngredient?: string | null;
  doseAmount?: string | null;
  routeOfAdministration?: string | null;
  vetName?: string | null;
  prescriptionRef?: string | null;
  standardMilkWithdrawalDays?: number | null;
  doubledMilkWithdrawalDays?: number | null;
  standardMeatWithdrawalDays?: number | null;
  doubledMeatWithdrawalDays?: number | null;
  milkWithdrawalEndDate?: string | null;
  meatWithdrawalEndDate?: string | null;
  certifierNotified?: boolean | null;
  treatmentNumber?: number | null;
  notes?: string | null;
}

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

import { DairySuppliesTab } from "@/components/DairySuppliesTab";
type Tab = "tupping" | "conversion" | "collections" | "feed" | "treatments" | "mastitis" | "kidding" | "bcs" | "tank" | "mv" | "assurance" | "abr-kit" | "scc-equipment" | "enterprise" | "supplies";

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
          <TabButton active={tab === "kidding"} onClick={() => setTab("kidding")}>Lambing Records</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "mv"} onClick={() => setTab("mv")}>Maedi-Visna</TabButton>
          <TabButton active={tab === "assurance"} onClick={() => setTab("assurance")}>Assurance</TabButton>
          <TabButton active={tab === "abr-kit"} onClick={() => setTab("abr-kit")}>ABR Kit Stock</TabButton>
          <TabButton active={tab === "scc-equipment"} onClick={() => setTab("scc-equipment")}>SCC Equipment</TabButton>
          <TabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}>Enterprise Report</TabButton>
          <TabButton active={tab === "supplies"} onClick={() => setTab("supplies")}>Supplies</TabButton>
        </TabBar>
        <div className="mt-6">
          {tab === "tupping" && <TuppingTab farmId={farmId} />}
          {tab === "conversion" && <FlockConversionTab farmId={farmId} />}
          {tab === "collections" && <OrganicCollectionsTab farmId={farmId} />}
          {tab === "feed" && <FeedNutritionTab farmId={farmId} />}
          {tab === "treatments" && <TreatmentRegisterTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "kidding" && <SheepLambingTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "mv" && <MvTab farmId={farmId} />}
          {tab === "assurance" && <AssuranceTab />}
          {tab === "abr-kit" && <div className="space-y-6"><AbrKitStockSection farmId={farmId} /><AbrProcurementSection farmId={farmId} /></div>}
          {tab === "scc-equipment" && <SccEquipmentSection farmId={farmId} species="sheep" />}
          {tab === "enterprise" && <DairyEnterpriseReport farmId={farmId} endpoint={api(`farms/${farmId}/sheep-dairy-enterprise-report`)} queryPrefix="organic-sheep-dairy-enterprise" speciesNote="Milk income from organic sheep dairy collection records. Feed cost and other variable costs not yet included — add via Financial for a complete P&L." />}
          {tab === "supplies" && <DairySuppliesTab farmId={farmId} dairyType="organic-sheep" />}
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
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/flock-conversion/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-flock-conv", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
    queryKey: ["org-sheep-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/collections`)).then(r => r.json()),
  });
  const records: CollectionRecord[] = data?.records ?? [];

  const { data: membersData } = useQuery<{ members: Array<{ id: number; firstName: string; lastName: string }> }>({
    queryKey: ["farm-members-sheep-dairy", farmId],
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
      return fetch(api(`farms/${farmId}/organic-sheep-dairy/collections${editing ? `/${editing.id}` : ""}`), {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, abrKitStockId: abrKitStockId || undefined }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-collections", farmId] }); qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }); setOpen(false); setAbrKitStockId(""); toast({ title: editing ? "Record updated" : "Collection added" }); },
    onError: (e: Error) => toast({ title: e.message || "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/collections/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-collections", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setForm(blank); setAbrKitStockId(""); setFormTab("collection"); setOpen(true); }
  function openEdit(r: CollectionRecord) { setEditing(r); setForm(r); setAbrKitStockId(""); setFormTab("collection"); setOpen(true); }

  function doPrint() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Organic Sheep Milk Collections</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:#f5f5f5}h2{font-size:14px}</style></head><body><h2>Organic Sheep Milk Collection Log${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Volume (L)</th><th>Collector</th><th>ABR</th><th>Temp (°C)</th><th>SCC (k/mL)</th><th>Fat%</th><th>Protein%</th><th>Organic</th><th>Net Value</th></tr></thead><tbody>${filteredRecords.map(r => `<tr><td>${r.collectionDate}</td><td>${parseFloat(r.volumeLitres || "0").toLocaleString()}</td><td>${r.collectorName || "—"}</td><td>${r.antibioticResidueTestResult || "—"}</td><td>${r.milkTemperatureCelsius || "—"}</td><td>${r.sccCount || "—"}</td><td>${r.fatPercentage || "—"}</td><td>${r.proteinPercentage || "—"}</td><td>${r.isOrganicCollection ? "Organic" : "Non-organic"}</td><td>${r.netValuePence != null ? "£" + (r.netValuePence / 100).toFixed(2) : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
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
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Avg SCC (k/mL)</p><p className={`text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1500 ? "text-red-700" : avgScc > 750 ? "text-amber-700" : "text-green-700"}`}>{avgScc != null ? avgScc.toLocaleString() : "—"}</p><p className="text-xs text-gray-400">Limit: 1,500k</p></CardContent></Card>
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
              <span className="text-xs text-gray-400">Organic sheep regulatory SCC limit: 1,500k cells/mL</span>
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
                <TableCell><SheepSccBadge v={r.sccCount} /></TableCell>
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
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC (k/mL)</p><p className="font-medium"><SheepSccBadge v={viewRec.sccCount} /></p></div>
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
                <RecordAttachments farmId={farmId} recordType="organic-sheep-dairy-collection" recordId={viewRec.id} />
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
                  <datalist id="sheep-dairy-staff-list">{staffNames.map(n => <option key={n} value={n} />)}</datalist>
                  <Input list="sheep-dairy-staff-list" placeholder="Name of tester" value={form.tempTestedBy ?? ""} onChange={f("tempTestedBy")} />
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
                  <Input list="sheep-dairy-staff-list" placeholder="Name of tester" value={form.abrTestedBy ?? ""} onChange={f("abrTestedBy")} />
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
                <div className="space-y-1"><Label>SCC (k/mL)</Label><Input type="number" value={form.sccCount ?? ""} onChange={e => set("sccCount", e.target.value ? Number(e.target.value) : null)} /><p className="text-xs text-gray-400">UK limit: 1,500k</p></div>
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
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/feed/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-feed", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="organic-sheep-dairy-feed" recordId={viewRec.id} /></div>
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

// ─── Organic Sheep Dairy — Mastitis Tab ───────────────────────────────────────

interface OrgSheepMastitisRecord {
  id: number; incidentDate: string; eweLisTag?: string | null; quarterAffected?: string | null;
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
  const [editing, setEditing] = useState<OrgSheepMastitisRecord | null>(null);
  const [viewRec, setViewRec] = useState<OrgSheepMastitisRecord | null>(null);
  const blank: Partial<OrgSheepMastitisRecord> = { incidentDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false, certifierNotified: false };
  const [form, setForm] = useState<Partial<OrgSheepMastitisRecord>>(blank);
  const set = (k: keyof OrgSheepMastitisRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records`)).then(r => r.json()) });
  const records: OrgSheepMastitisRecord[] = data?.records ?? [];
  const uncertifiedCount = records.filter(r => r.treatmentProduct && !r.certifierNotified).length;

  const save = useMutation({
    mutationFn: (body: Partial<OrgSheepMastitisRecord>) => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-mastitis", farmId] }); setOpen(false); toast({ title: editing ? "Record updated" : "Record added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dairy-mastitis", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
              <TableHead>Date</TableHead><TableHead>Ewe LIS Tag</TableHead><TableHead>Quarter</TableHead>
              <TableHead>Treatment</TableHead><TableHead>Dbl Milk W/D</TableHead><TableHead>Certifier</TableHead><TableHead>Outcome</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>{filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.incidentDate)}</TableCell>
                <TableCell className="font-mono text-xs">{r.eweLisTag || "—"}</TableCell>
                <TableCell className="capitalize">{r.quarterAffected || "—"}</TableCell>
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
            <DialogHeader><DialogTitle>Mastitis — {viewRec.eweLisTag || "Unknown ewe"} on {fmt(viewRec.incidentDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ewe LIS Tag</p><p className="font-mono font-medium">{viewRec.eweLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quarter Affected</p><p className="font-medium capitalize">{viewRec.quarterAffected || "—"}</p></div>
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
            <div><Label>Ewe LIS Tag</Label><Input value={form.eweLisTag || ""} onChange={e => set("eweLisTag", e.target.value)} placeholder="LIS ear tag" /></div>
            <div><Label>Quarter Affected</Label>
              <Select value={form.quarterAffected || "__none__"} onValueChange={v => set("quarterAffected", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="left">Left</SelectItem><SelectItem value="right">Right</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Clinical Signs</Label><Input value={form.clinicalSigns || ""} onChange={e => set("clinicalSigns", e.target.value)} /></div>
            <div><Label>Pathogen Identified</Label><Input value={form.pathogenIdentified || ""} onChange={e => set("pathogenIdentified", e.target.value)} placeholder="e.g. Staph. aureus" /></div>
            <div><Label>Lab Ref</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>SCC at Onset (k/mL)</Label><Input type="number" value={form.sccAtOnset || ""} onChange={e => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : null)} /></div>
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
              <Checkbox checked={!!form.certifierNotified} onCheckedChange={v => set("certifierNotified", !!v)} id="masti-cert-sheep" />
              <Label htmlFor="masti-cert-sheep" className="cursor-pointer font-normal">Certifier has been notified of this antibiotic treatment</Label>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Organic Vet Treatments ────────────────────────────────────────────────────

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
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-sheep-dairy/treatments/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-sheep-treatments", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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

// ─── Organic Tupping Tab ───────────────────────────────────────────────────────

function TuppingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
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
    mutationFn: async (body: Record<string, unknown>) => {
      const url = editing
        ? api(`farms/${farmId}/sheep-tupping-records/${editing.id}`)
        : api(`farms/${farmId}/sheep-tupping-records`);
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const tupping = await res.json();
      const cidrUsed = body.progesteroneUsed === "true" || body.progesteroneUsed === true;
      if (cidrUsed && body.cidrProductName) {
        const adminDate = body.cidrAdminDate || body.tuppingStartDate;
        const wdDays = parseInt(String(body.cidrWithdrawalDays ?? "1")) || 1;
        const doubledWd = parseInt(String(body.cidrDoubledWd ?? String(wdDays * 2))) || wdDays * 2;
        const wdEnd = adminDate ? new Date(new Date(String(adminDate)).getTime() + doubledWd * 86400000).toISOString().slice(0, 10) : null;
        await fetch(api(`farms/${farmId}/medicine-records`), {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            medicineName: body.cidrProductName, batchNumber: body.cidrBatchNumber || null,
            dosage: body.cidrDosePerEwe || "1 device per ewe",
            administrationRoute: body.cidrRoute || "Intravaginal",
            administeredBy: body.cidrAdministeredBy || null, administeredDate: adminDate,
            vetName: body.cidrPrescribingVet || null, treatmentScope: "group",
            treatedAnimalCount: body.ewesExposed ? parseInt(String(body.ewesExposed)) : null,
            withdrawalPeriodDays: wdDays, doubledWithdrawalDays: doubledWd,
            withdrawalEndDate: wdEnd, organicWithdrawalEndDate: wdEnd,
            isOrganicTreatment: true, certifierNotified: body.certifierNotified === "true",
            reason: body.cidrTherapeuticReason ? `Therapeutic: ${String(body.cidrTherapeuticReason)}` : "Progesterone/CIDR — organic therapeutic use",
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Ram: ${body.ramBreed || ""} ${body.ramTagNumber || ""} | Rx ref: ${body.cidrPrescriptionRef || "—"} | Practice: ${body.cidrVetPractice || "—"} | ORGANIC: doubled withdrawal applied`,
            source: "tupping-record",
          }),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      }
      if (cidrUsed && body.createVetVisit === "true" && body.cidrPrescribingVet) {
        await fetch(api(`farms/${farmId}/vet-visits`), {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            visitDate: body.cidrAdminDate || body.tuppingStartDate,
            vetName: body.cidrPrescribingVet, vetPractice: body.cidrVetPractice || null,
            reasonForVisit: "POM-V prescription — Progesterone/CIDR (organic therapeutic use)",
            treatmentsCarriedOut: `${body.cidrProductName || "CIDR/Progesterone"} — ${body.ewesExposed || "?"} ewes. Therapeutic: ${body.cidrTherapeuticReason || "not specified"}`,
            prescriptionsIssued: body.cidrPrescriptionRef || null,
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Organic — doubled withdrawal applied`,
          }),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      }
      if (cidrUsed && body.cidrCostGbp && parseFloat(String(body.cidrCostGbp)) > 0) {
        await fetch(api(`farms/${farmId}/financial-transactions`), {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            transactionType: "expense", category: "Veterinary & Medicine",
            description: `${body.cidrProductName || "CIDR/Progesterone"} — ${body.ewesExposed || ""} ewes [ORGANIC] (tupping ${body.tuppingStartDate})`,
            amountPence: Math.round(parseFloat(String(body.cidrCostGbp)) * 100),
            transactionDate: body.cidrAdminDate || body.tuppingStartDate,
            reference: body.cidrPrescriptionRef || null, vendorCustomer: body.cidrVetPractice || null,
            notes: "Auto-created from organic tupping record (CIDR/Progesterone cost)",
          }),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      }
      return tupping;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }); qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-tupping-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
  const cidrUsed = form.progesteroneUsed === "true";

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
                <p className="font-medium">{viewing.progesteroneUsed ? "Yes — organic compliance fields recorded" : "No"}</p>
              </div>
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
            <div className="col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-amber-50 border-amber-200">
              <Checkbox checked={form.progesteroneUsed === "true"} onCheckedChange={v => sf("progesteroneUsed", v ? "true" : "false")} id="prog-organic" />
              <Label htmlFor="prog-organic" className="cursor-pointer font-normal text-amber-800">Progesterone / CIDR used — <strong>organic compliance required</strong></Label>
            </div>
            {cidrUsed && (
              <>
                <div className="col-span-2 pt-1"><p className="text-xs font-semibold text-red-700 uppercase tracking-wide">⚠ Organic CIDR/Progesterone — POM-V & Compliance Fields</p></div>
                <div className="col-span-2 space-y-1"><Label>Therapeutic Reason (required for organic use)</Label><Input value={form.cidrTherapeuticReason ?? ""} onChange={e => sf("cidrTherapeuticReason", e.target.value)} placeholder="e.g. Synchronise lambing to reduce exposure period" /></div>
                <div className="space-y-1"><Label>CIDR Product Name</Label><Input value={form.cidrProductName ?? ""} onChange={e => sf("cidrProductName", e.target.value)} placeholder="e.g. CIDR Sheep" /></div>
                <div className="space-y-1"><Label>Batch Number</Label><Input value={form.cidrBatchNumber ?? ""} onChange={e => sf("cidrBatchNumber", e.target.value)} /></div>
                <div className="space-y-1"><Label>Dose per Ewe</Label><Input value={form.cidrDosePerEwe ?? "1 device per ewe"} onChange={e => sf("cidrDosePerEwe", e.target.value)} /></div>
                <div className="space-y-1"><Label>Route</Label><Input value={form.cidrRoute ?? "Intravaginal"} onChange={e => sf("cidrRoute", e.target.value)} /></div>
                <div className="space-y-1"><Label>Admin Date</Label><Input type="date" value={form.cidrAdminDate ?? ""} onChange={e => sf("cidrAdminDate", e.target.value)} /></div>
                <div className="space-y-1"><Label>Administered By</Label><Input value={form.cidrAdministeredBy ?? ""} onChange={e => sf("cidrAdministeredBy", e.target.value)} /></div>
                <div className="space-y-1"><Label>Prescribing Vet</Label><Input value={form.cidrPrescribingVet ?? ""} onChange={e => sf("cidrPrescribingVet", e.target.value)} /></div>
                <div className="space-y-1"><Label>Vet Practice</Label><Input value={form.cidrVetPractice ?? ""} onChange={e => sf("cidrVetPractice", e.target.value)} /></div>
                <div className="space-y-1"><Label>Prescription Ref</Label><Input value={form.cidrPrescriptionRef ?? ""} onChange={e => sf("cidrPrescriptionRef", e.target.value)} /></div>
                <div className="space-y-1"><Label>Standard W/D (days)</Label><Input type="number" value={form.cidrWithdrawalDays ?? ""} onChange={e => sf("cidrWithdrawalDays", e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-red-700">Doubled W/D (days)</Label><Input type="number" value={form.cidrDoubledWd ?? (form.cidrWithdrawalDays ? String(parseInt(form.cidrWithdrawalDays) * 2) : "")} onChange={e => sf("cidrDoubledWd", e.target.value)} className="border-red-300" /></div>
                <div className="space-y-1"><Label>CIDR Cost (£)</Label><Input type="number" step="0.01" value={form.cidrCostGbp ?? ""} onChange={e => sf("cidrCostGbp", e.target.value)} /></div>
                <div className="col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30">
                  <Checkbox checked={form.certifierNotified === "true"} onCheckedChange={v => sf("certifierNotified", v ? "true" : "false")} id="cert-notified-tup" />
                  <Label htmlFor="cert-notified-tup" className="cursor-pointer font-normal">Certifier has been notified of this POM-V treatment</Label>
                </div>
                <div className="col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30">
                  <Checkbox checked={form.createVetVisit === "true"} onCheckedChange={v => sf("createVetVisit", v ? "true" : "false")} id="create-vet-visit" />
                  <Label htmlFor="create-vet-visit" className="cursor-pointer font-normal">Also create a vet visit record for this prescription</Label>
                </div>
              </>
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

