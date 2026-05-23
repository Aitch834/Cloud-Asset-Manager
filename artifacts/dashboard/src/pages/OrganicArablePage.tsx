import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Loader2, Pencil, Trash2, AlertTriangle, Wheat,
  ShieldCheck, FileText, Sprout, Package, CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function fmtN(val: unknown, suffix = ""): string {
  if (val == null || val === "") return "—";
  return `${val}${suffix}`;
}
function conversionProgress(startDate: string | null | undefined, endDate: string | null | undefined): number {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : start + 2 * 365.25 * 24 * 3600 * 1000;
  const now = Date.now();
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}
function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`/api/${path}`, { credentials: "include", ...opts });

// ─── Constants ────────────────────────────────────────────────────────────────

const CERTIFIERS = ["Soil Association", "Organic Farmers & Growers (OF&G)", "OCIS", "Biodynamic Association (Demeter)", "Other"];

const CERT_STATUSES = [
  { value: "in-conversion", label: "In Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "certified", label: "Certified", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "suspended", label: "Suspended", cls: "bg-red-50 text-red-700 border-red-300" },
  { value: "withdrawn", label: "Withdrawn", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

const CONV_STATUSES = [
  { value: "pre-conversion", label: "Pre-Conversion", cls: "bg-blue-50 text-blue-700 border-blue-300" },
  { value: "in-conversion", label: "In Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "certified", label: "Certified", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "lapsed", label: "Lapsed", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

const SEED_TYPES = [
  { value: "organic", label: "Certified Organic", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "untreated-conventional", label: "Untreated Conventional", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "treated-conventional-derogation", label: "Treated Conventional (Derogation)", cls: "bg-red-50 text-red-700 border-red-300" },
];

const HARVEST_STATUSES = [
  { value: "certified", label: "Certified Organic", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "in-conversion", label: "In-Conversion", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "conventional", label: "Conventional", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

const PERMITTED_STATUSES = [
  { value: "permitted", label: "Permitted (Annex II)", cls: "bg-green-50 text-green-700 border-green-300" },
  { value: "restricted", label: "Restricted — notify certifier", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "prohibited", label: "Prohibited", cls: "bg-red-50 text-red-700 border-red-300" },
];

const INPUT_TYPES = [
  "Fertiliser / Soil Amendment",
  "Crop Protection / Pesticide",
  "Biological Control",
  "Seed Treatment",
  "Cleaning & Disinfection",
  "Other",
];

const QUANTITY_UNITS = ["kg/ha", "l/ha", "t/ha", "kg", "l", "t", "g/ha", "units/ha"];

const ANNEX_INPUTS = [
  "Farmyard Manure (FYM) — composted or well-rotted",
  "Composted Plant & Animal Material",
  "Green Manure / Cover Crop Residue",
  "Slurry (composted; restricted from non-organic units)",
  "Dried Blood (Blood Meal)",
  "Bone Meal / Steamed Bone Flour",
  "Fish Meal / Fish Emulsion",
  "Seaweed Meal",
  "Calcified Seaweed (Lithothamnium)",
  "Seaweed Extract (liquid)",
  "Rock Phosphate (soft / reactive)",
  "Potassium Sulphate (natural mineral extraction, low chloride)",
  "Kieserite (Magnesium Sulphate, natural mineral)",
  "Wood Ash (from untreated wood only)",
  "Ground Limestone / Calcium Carbonate",
  "Dolomitic Limestone / Magnesium Limestone",
  "Gypsum (natural calcium sulphate)",
  "Elemental Sulphur",
  "Copper Hydroxide",
  "Copper Oxychloride",
  "Copper Sulphate / Bordeaux Mixture",
  "Pyrethrin (from Chrysanthemum cinerariaefolium)",
  "Spinosad (restricted — certifier notification required)",
  "Bacillus thuringiensis (Bt)",
  "Beauveria bassiana",
  "Entomopathogenic Nematodes",
  "Iron Phosphate (slug pellets)",
  "Kaolin (particle film)",
  "Diatomaceous Earth / Kieselgur",
  "Potassium Bicarbonate",
  "Sulphur (wettable / dust)",
  "Soft Soap / Potassium Soap",
  "Rapeseed Oil / Plant Oil",
  "Pheromones (mating disruption traps only)",
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatusBadge({ value, options }: { value: string; options: { value: string; label: string; cls: string }[] }) {
  const opt = options.find(o => o.value === value) ?? { label: value, cls: "bg-gray-100 text-gray-600 border-gray-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${opt.cls}`}>
      {opt.label}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-10 h-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function DeleteConfirmDialog({ open, onClose, onConfirm, saving }: {
  open: boolean; onClose: () => void; onConfirm: () => void; saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />Delete Record
          </DialogTitle>
          <DialogDescription>This cannot be undone. Are you sure?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "certification" | "field-conversion" | "seed-sourcing" | "input-log" | "harvest-declarations";

export default function OrganicArablePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("certification");

  // ── Certification state ──
  const [certOpen, setCertOpen] = useState(false);
  const [certEditing, setCertEditing] = useState<Record<string, unknown> | null>(null);
  const [certDeleting, setCertDeleting] = useState<number | null>(null);
  const [certForm, setCertForm] = useState<Record<string, string>>({});

  // ── Field Conversion state ──
  const [convOpen, setConvOpen] = useState(false);
  const [convEditing, setConvEditing] = useState<Record<string, unknown> | null>(null);
  const [convDeleting, setConvDeleting] = useState<number | null>(null);
  const [convForm, setConvForm] = useState<Record<string, string | boolean>>({});

  // ── Seed Sourcing state ──
  const [seedOpen, setSeedOpen] = useState(false);
  const [seedEditing, setSeedEditing] = useState<Record<string, unknown> | null>(null);
  const [seedDeleting, setSeedDeleting] = useState<number | null>(null);
  const [seedForm, setSeedForm] = useState<Record<string, string | boolean>>({});

  // ── Input Log state ──
  const [inputOpen, setInputOpen] = useState(false);
  const [inputEditing, setInputEditing] = useState<Record<string, unknown> | null>(null);
  const [inputDeleting, setInputDeleting] = useState<number | null>(null);
  const [inputForm, setInputForm] = useState<Record<string, string>>({});
  const [inputCustomProduct, setInputCustomProduct] = useState(false);

  // ── Harvest state ──
  const [harvestOpen, setHarvestOpen] = useState(false);
  const [harvestEditing, setHarvestEditing] = useState<Record<string, unknown> | null>(null);
  const [harvestDeleting, setHarvestDeleting] = useState<number | null>(null);
  const [harvestForm, setHarvestForm] = useState<Record<string, string>>({});

  // ── Queries ──
  const certQ = useQuery<Record<string, unknown>[]>({
    queryKey: ["oa-cert", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/organic-arable/certification`).then(r => r.json()).then(d => d.records),
    enabled: !!farmId,
  });
  const convQ = useQuery<Record<string, unknown>[]>({
    queryKey: ["oa-conv", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/organic-arable/field-conversion`).then(r => r.json()).then(d => d.records),
    enabled: !!farmId,
  });
  const seedQ = useQuery<Record<string, unknown>[]>({
    queryKey: ["oa-seed", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/organic-arable/seed-records`).then(r => r.json()).then(d => d.records),
    enabled: !!farmId,
  });
  const inputQ = useQuery<Record<string, unknown>[]>({
    queryKey: ["oa-input", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/organic-arable/input-records`).then(r => r.json()).then(d => d.records),
    enabled: !!farmId,
  });
  const harvestQ = useQuery<Record<string, unknown>[]>({
    queryKey: ["oa-harvest", farmId],
    queryFn: () => apiFetch(`farms/${farmId}/organic-arable/harvest-declarations`).then(r => r.json()).then(d => d.records),
    enabled: !!farmId,
  });

  // ── Generic mutation factory ──
  function useCrud(key: string, endpoint: string, invalidate: string[]) {
    const save = useMutation({
      mutationFn: ({ id, body }: { id?: number; body: Record<string, unknown> }) =>
        apiFetch(id ? `farms/${farmId}/${endpoint}/${id}` : `farms/${farmId}/${endpoint}`, {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json()),
      onSuccess: () => {
        invalidate.forEach(k => qc.invalidateQueries({ queryKey: [k, farmId] }));
        toast({ title: "Saved" });
      },
      onError: () => toast({ title: "Error saving", variant: "destructive" }),
    });
    const del = useMutation({
      mutationFn: (id: number) =>
        apiFetch(`farms/${farmId}/${endpoint}/${id}`, { method: "DELETE" }),
      onSuccess: () => {
        invalidate.forEach(k => qc.invalidateQueries({ queryKey: [k, farmId] }));
        toast({ title: "Deleted" });
      },
      onError: () => toast({ title: "Error deleting", variant: "destructive" }),
    });
    return { save, del };
  }

  const certMut = useCrud("cert", "organic-arable/certification", ["oa-cert"]);
  const convMut = useCrud("conv", "organic-arable/field-conversion", ["oa-conv"]);
  const seedMut = useCrud("seed", "organic-arable/seed-records", ["oa-seed"]);
  const inputMut = useCrud("input", "organic-arable/input-records", ["oa-input"]);
  const harvestMut = useCrud("harvest", "organic-arable/harvest-declarations", ["oa-harvest"]);

  // ── Helpers ──
  const str = (v: unknown) => (v == null ? "" : String(v));
  const today = new Date().toISOString().slice(0, 10);

  // ─── Certification tab ────────────────────────────────────────────────────

  function openCert(row?: Record<string, unknown>) {
    if (row) {
      setCertEditing(row);
      setCertForm({
        certifier: str(row.certifier), certificateNumber: str(row.certificateNumber),
        operatorNumber: str(row.operatorNumber), certificationDate: str(row.certificationDate),
        renewalDate: str(row.renewalDate), annualInspectionDate: str(row.annualInspectionDate),
        nextInspectionDue: str(row.nextInspectionDue), status: str(row.status) || "certified",
        scope: str(row.scope), notes: str(row.notes),
      });
    } else {
      setCertEditing(null);
      setCertForm({ status: "certified", certifier: CERTIFIERS[0] });
    }
    setCertOpen(true);
  }

  function saveCert() {
    const id = certEditing ? Number(certEditing.id) : undefined;
    certMut.save.mutate({ id, body: certForm }, {
      onSuccess: () => { setCertOpen(false); setCertEditing(null); setCertForm({}); },
    });
  }

  const certs = certQ.data ?? [];
  const certsDueThisYear = certs.filter(c => {
    const d = daysUntil(str(c.renewalDate));
    return d !== null && d >= 0 && d <= 365;
  }).length;

  // ─── Field Conversion tab ─────────────────────────────────────────────────

  function openConv(row?: Record<string, unknown>) {
    if (row) {
      setConvEditing(row);
      setConvForm({
        fieldName: str(row.fieldName), areaHa: str(row.areaHa),
        conversionStartDate: str(row.conversionStartDate),
        expectedCertificationDate: str(row.expectedCertificationDate),
        actualCertificationDate: str(row.actualCertificationDate),
        status: str(row.status) || "in-conversion", certifierRef: str(row.certifierRef),
        parallelProduction: row.parallelProduction ? "true" : "false",
        parallelProductionJustification: str(row.parallelProductionJustification),
        previousLandUse: str(row.previousLandUse), notes: str(row.notes),
      });
    } else {
      setConvEditing(null);
      setConvForm({ status: "in-conversion", conversionStartDate: today, parallelProduction: "false" });
    }
    setConvOpen(true);
  }

  function saveConv() {
    const id = convEditing ? Number(convEditing.id) : undefined;
    const body = { ...convForm, parallelProduction: convForm.parallelProduction === "true" };
    convMut.save.mutate({ id, body }, {
      onSuccess: () => { setConvOpen(false); setConvEditing(null); setConvForm({}); },
    });
  }

  const convs = convQ.data ?? [];
  const certifiedHa = convs.filter(c => c.status === "certified").reduce((s, c) => s + (parseFloat(str(c.areaHa)) || 0), 0);
  const conversionHa = convs.filter(c => c.status === "in-conversion").reduce((s, c) => s + (parseFloat(str(c.areaHa)) || 0), 0);

  // ─── Seed Sourcing tab ────────────────────────────────────────────────────

  function openSeed(row?: Record<string, unknown>) {
    if (row) {
      setSeedEditing(row);
      setSeedForm({
        purchaseDate: str(row.purchaseDate), cropName: str(row.cropName),
        variety: str(row.variety), quantityKg: str(row.quantityKg),
        supplierName: str(row.supplierName), supplierAddress: str(row.supplierAddress),
        seedType: str(row.seedType) || "organic",
        derogationGranted: row.derogationGranted ? "true" : "false",
        derogationReference: str(row.derogationReference),
        derogationExpiryDate: str(row.derogationExpiryDate),
        certifierApproval: str(row.certifierApproval),
        batchLotNumber: str(row.batchLotNumber), notes: str(row.notes),
      });
    } else {
      setSeedEditing(null);
      setSeedForm({ purchaseDate: today, seedType: "organic", derogationGranted: "false" });
    }
    setSeedOpen(true);
  }

  function saveSeed() {
    const id = seedEditing ? Number(seedEditing.id) : undefined;
    const body = { ...seedForm, derogationGranted: seedForm.derogationGranted === "true" };
    seedMut.save.mutate({ id, body }, {
      onSuccess: () => { setSeedOpen(false); setSeedEditing(null); setSeedForm({}); },
    });
  }

  const seeds = seedQ.data ?? [];
  const derogationCount = seeds.filter(s => s.seedType !== "organic").length;

  // ─── Input Log tab ────────────────────────────────────────────────────────

  function openInput(row?: Record<string, unknown>) {
    if (row) {
      setInputEditing(row);
      setInputForm({
        fieldName: str(row.fieldName), applicationDate: str(row.applicationDate),
        productName: str(row.productName), activeIngredient: str(row.activeIngredient),
        inputType: str(row.inputType), permittedStatus: str(row.permittedStatus) || "permitted",
        regulatoryBasis: str(row.regulatoryBasis), supplierName: str(row.supplierName),
        quantityApplied: str(row.quantityApplied), quantityUnit: str(row.quantityUnit) || "kg/ha",
        areaAppliedHa: str(row.areaAppliedHa), certifierApproval: str(row.certifierApproval),
        notes: str(row.notes),
      });
      setInputCustomProduct(!ANNEX_INPUTS.includes(str(row.productName)));
    } else {
      setInputEditing(null);
      setInputForm({ applicationDate: today, permittedStatus: "permitted", quantityUnit: "kg/ha" });
      setInputCustomProduct(false);
    }
    setInputOpen(true);
  }

  function saveInput() {
    const id = inputEditing ? Number(inputEditing.id) : undefined;
    inputMut.save.mutate({ id, body: inputForm }, {
      onSuccess: () => { setInputOpen(false); setInputEditing(null); setInputForm({}); },
    });
  }

  const inputs = inputQ.data ?? [];
  const restrictedInputs = inputs.filter(i => i.permittedStatus === "restricted").length;

  // ─── Harvest Declarations tab ─────────────────────────────────────────────

  function openHarvest(row?: Record<string, unknown>) {
    if (row) {
      setHarvestEditing(row);
      setHarvestForm({
        fieldName: str(row.fieldName), harvestDate: str(row.harvestDate),
        cropName: str(row.cropName), variety: str(row.variety),
        yieldTonnes: str(row.yieldTonnes), moisturePercent: str(row.moisturePercent),
        storageLocation: str(row.storageLocation),
        organicStatus: str(row.organicStatus) || "certified",
        certifierRef: str(row.certifierRef), buyerName: str(row.buyerName),
        buyerOrganisation: str(row.buyerOrganisation), buyerAddress: str(row.buyerAddress),
        saleDate: str(row.saleDate), quantitySoldTonnes: str(row.quantitySoldTonnes),
        pricePoundPerTonne: str(row.pricePoundPerTonne),
        organicPremiumPercent: str(row.organicPremiumPercent),
        declarationDate: str(row.declarationDate), declarationReference: str(row.declarationReference),
        notes: str(row.notes),
      });
    } else {
      setHarvestEditing(null);
      setHarvestForm({ harvestDate: today, organicStatus: "certified" });
    }
    setHarvestOpen(true);
  }

  function saveHarvest() {
    const id = harvestEditing ? Number(harvestEditing.id) : undefined;
    harvestMut.save.mutate({ id, body: harvestForm }, {
      onSuccess: () => { setHarvestOpen(false); setHarvestEditing(null); setHarvestForm({}); },
    });
  }

  const harvests = harvestQ.data ?? [];
  const totalYield = harvests.reduce((s, h) => s + (parseFloat(str(h.yieldTonnes)) || 0), 0);
  const certifiedHarvests = harvests.filter(h => h.organicStatus === "certified").length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wheat className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Organic Arable</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Conversion register, seed sourcing, permitted inputs, harvest declarations and certification records
            </p>
          </div>
        </div>

        {/* Tabs */}
        <TabBar>
          <TabButton active={activeTab === "certification"} onClick={() => setActiveTab("certification")}>
            <ShieldCheck className="w-3.5 h-3.5" />Certification
          </TabButton>
          <TabButton active={activeTab === "field-conversion"} onClick={() => setActiveTab("field-conversion")}>
            <Sprout className="w-3.5 h-3.5" />Field Conversion
          </TabButton>
          <TabButton active={activeTab === "seed-sourcing"} onClick={() => setActiveTab("seed-sourcing")}>
            <Package className="w-3.5 h-3.5" />Seed Sourcing
          </TabButton>
          <TabButton active={activeTab === "input-log"} onClick={() => setActiveTab("input-log")}>
            <FileText className="w-3.5 h-3.5" />Input Log
          </TabButton>
          <TabButton active={activeTab === "harvest-declarations"} onClick={() => setActiveTab("harvest-declarations")}>
            <Wheat className="w-3.5 h-3.5" />Harvest Declarations
          </TabButton>
        </TabBar>

        {/* ── Certification ── */}
        {activeTab === "certification" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={ShieldCheck} label="Certification Records" value={certs.length} />
              <SummaryCard icon={CheckCircle2} label="Active Certifications" value={certs.filter(c => c.status === "certified").length} />
              <SummaryCard icon={AlertTriangle} label="Renewals Due (12 months)" value={certsDueThisYear} sub="check renewal dates" />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => openCert()}>
                <Plus className="w-4 h-4 mr-1.5" />Add Certificate
              </Button>
            </div>
            {certQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : certs.length === 0 ? (
              <EmptyState icon={ShieldCheck} message="No certification records yet. Add your Soil Association, OF&G, or Organic Farmers & Growers certificate." />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Certifier</th>
                      <th className="px-4 py-3 text-left">Certificate No.</th>
                      <th className="px-4 py-3 text-left">Operator No.</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Certified</th>
                      <th className="px-4 py-3 text-left">Renewal Due</th>
                      <th className="px-4 py-3 text-left">Next Inspection</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {certs.map((row, i) => {
                      const d = daysUntil(str(row.renewalDate));
                      const urgent = d !== null && d >= 0 && d <= 60;
                      return (
                        <tr key={String(row.id)} className={`border-b border-border last:border-0 ${urgent ? "bg-amber-50/50" : ""}`}>
                          <td className="px-4 py-3 font-medium">{str(row.certifier)}</td>
                          <td className="px-4 py-3 font-mono text-xs">{str(row.certificateNumber) || "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{str(row.operatorNumber) || "—"}</td>
                          <td className="px-4 py-3"><StatusBadge value={str(row.status)} options={CERT_STATUSES} /></td>
                          <td className="px-4 py-3">{fmt(str(row.certificationDate))}</td>
                          <td className="px-4 py-3">
                            {str(row.renewalDate) ? (
                              <span className={urgent ? "text-amber-700 font-medium" : ""}>{fmt(str(row.renewalDate))}</span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3">{fmt(str(row.nextInspectionDue))}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCert(row)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setCertDeleting(Number(row.id))}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Field Conversion ── */}
        {activeTab === "field-conversion" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={Sprout} label="Fields in Register" value={convs.length} />
              <SummaryCard icon={CheckCircle2} label="Certified Ha" value={certifiedHa > 0 ? `${certifiedHa.toFixed(2)} ha` : 0} />
              <SummaryCard icon={AlertTriangle} label="In Conversion Ha" value={conversionHa > 0 ? `${conversionHa.toFixed(2)} ha` : 0} sub="2-year conversion period" />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => openConv()}>
                <Plus className="w-4 h-4 mr-1.5" />Add Field
              </Button>
            </div>
            {convQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : convs.length === 0 ? (
              <EmptyState icon={Sprout} message="No fields in the conversion register. Add each field or parcel and its conversion start date." />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Field / Parcel</th>
                      <th className="px-4 py-3 text-left">Area (ha)</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Conversion Start</th>
                      <th className="px-4 py-3 text-left">Expected Cert.</th>
                      <th className="px-4 py-3 text-left">Progress</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {convs.map(row => {
                      const pct = row.status === "certified" ? 100 : conversionProgress(str(row.conversionStartDate), str(row.expectedCertificationDate));
                      return (
                        <tr key={String(row.id)} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium">{str(row.fieldName)}</td>
                          <td className="px-4 py-3">{fmtN(row.areaHa, " ha")}</td>
                          <td className="px-4 py-3"><StatusBadge value={str(row.status)} options={CONV_STATUSES} /></td>
                          <td className="px-4 py-3">{fmt(str(row.conversionStartDate))}</td>
                          <td className="px-4 py-3">{fmt(str(row.expectedCertificationDate))}</td>
                          <td className="px-4 py-3 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full transition-all ${pct === 100 ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openConv(row)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setConvDeleting(Number(row.id))}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Seed Sourcing ── */}
        {activeTab === "seed-sourcing" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={Package} label="Seed Records" value={seeds.length} />
              <SummaryCard icon={CheckCircle2} label="Certified Organic" value={seeds.filter(s => s.seedType === "organic").length} />
              <SummaryCard icon={AlertTriangle} label="Derogations / Non-Organic" value={derogationCount} sub={derogationCount > 0 ? "certifier approval required" : "none recorded"} />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => openSeed()}>
                <Plus className="w-4 h-4 mr-1.5" />Add Seed Record
              </Button>
            </div>
            {seedQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : seeds.length === 0 ? (
              <EmptyState icon={Package} message="No seed records yet. Log all seed purchases — organic certified or with derogation approval." />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Crop</th>
                      <th className="px-4 py-3 text-left">Variety</th>
                      <th className="px-4 py-3 text-left">Seed Type</th>
                      <th className="px-4 py-3 text-left">Qty (kg)</th>
                      <th className="px-4 py-3 text-left">Supplier</th>
                      <th className="px-4 py-3 text-left">Derogation</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {seeds.map(row => (
                      <tr key={String(row.id)} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">{fmt(str(row.purchaseDate))}</td>
                        <td className="px-4 py-3 font-medium">{str(row.cropName)}</td>
                        <td className="px-4 py-3">{str(row.variety) || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge value={str(row.seedType)} options={SEED_TYPES} /></td>
                        <td className="px-4 py-3">{fmtN(row.quantityKg)}</td>
                        <td className="px-4 py-3">{str(row.supplierName) || "—"}</td>
                        <td className="px-4 py-3">
                          {row.derogationGranted
                            ? <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-300">Yes — {str(row.derogationReference) || "ref pending"}</span>
                            : <span className="text-xs text-muted-foreground">No</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openSeed(row)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setSeedDeleting(Number(row.id))}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Input Log ── */}
        {activeTab === "input-log" && (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-semibold mb-1">Annex II Permitted Inputs (UK retained EU organic regulation)</p>
              <p className="text-xs">Only inputs on the UK permitted list may be used. Restricted substances require prior certifier notification. All inputs must be logged here as evidence for annual inspection.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={FileText} label="Input Applications" value={inputs.length} />
              <SummaryCard icon={CheckCircle2} label="Fully Permitted" value={inputs.filter(i => i.permittedStatus === "permitted").length} />
              <SummaryCard icon={AlertTriangle} label="Restricted (certifier notified)" value={restrictedInputs} sub={restrictedInputs > 0 ? "ensure certifier approvals filed" : "none recorded"} />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => openInput()}>
                <Plus className="w-4 h-4 mr-1.5" />Log Input
              </Button>
            </div>
            {inputQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : inputs.length === 0 ? (
              <EmptyState icon={FileText} message="No inputs logged yet. Record every fertiliser, soil amendment, and crop protection product applied to organic fields." />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Field</th>
                      <th className="px-4 py-3 text-left">Qty Applied</th>
                      <th className="px-4 py-3 text-left">Area (ha)</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {inputs.map(row => (
                      <tr key={String(row.id)} className={`border-b border-border last:border-0 ${row.permittedStatus === "restricted" ? "bg-amber-50/40" : row.permittedStatus === "prohibited" ? "bg-red-50/40" : ""}`}>
                        <td className="px-4 py-3">{fmt(str(row.applicationDate))}</td>
                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">{str(row.productName)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{str(row.inputType) || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge value={str(row.permittedStatus)} options={PERMITTED_STATUSES} /></td>
                        <td className="px-4 py-3">{str(row.fieldName) || "—"}</td>
                        <td className="px-4 py-3">{fmtN(row.quantityApplied)} {str(row.quantityUnit) || ""}</td>
                        <td className="px-4 py-3">{fmtN(row.areaAppliedHa, " ha")}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openInput(row)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setInputDeleting(Number(row.id))}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Harvest Declarations ── */}
        {activeTab === "harvest-declarations" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={Wheat} label="Harvest Records" value={harvests.length} />
              <SummaryCard icon={CheckCircle2} label="Certified Organic" value={certifiedHarvests} />
              <SummaryCard icon={FileText} label="Total Recorded Yield" value={totalYield > 0 ? `${totalYield.toFixed(2)} t` : "—"} sub="certified + in-conversion" />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => openHarvest()}>
                <Plus className="w-4 h-4 mr-1.5" />Log Harvest
              </Button>
            </div>
            {harvestQ.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : harvests.length === 0 ? (
              <EmptyState icon={Wheat} message="No harvest records yet. Log each organic harvest with buyer declaration and sale details." />
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Harvest Date</th>
                      <th className="px-4 py-3 text-left">Crop</th>
                      <th className="px-4 py-3 text-left">Field</th>
                      <th className="px-4 py-3 text-left">Yield (t)</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Buyer</th>
                      <th className="px-4 py-3 text-left">Sale Date</th>
                      <th className="px-4 py-3 text-left">Premium %</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {harvests.map(row => (
                      <tr key={String(row.id)} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">{fmt(str(row.harvestDate))}</td>
                        <td className="px-4 py-3 font-medium">{str(row.cropName)}</td>
                        <td className="px-4 py-3">{str(row.fieldName) || "—"}</td>
                        <td className="px-4 py-3">{fmtN(row.yieldTonnes)}</td>
                        <td className="px-4 py-3"><StatusBadge value={str(row.organicStatus)} options={HARVEST_STATUSES} /></td>
                        <td className="px-4 py-3">
                          <div>
                            <p>{str(row.buyerName) || "—"}</p>
                            {str(row.buyerOrganisation) && <p className="text-xs text-muted-foreground">{str(row.buyerOrganisation)}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">{fmt(str(row.saleDate))}</td>
                        <td className="px-4 py-3">{fmtN(row.organicPremiumPercent, "%")}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openHarvest(row)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setHarvestDeleting(Number(row.id))}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}

      {/* Certification Dialog */}
      <Dialog open={certOpen} onOpenChange={v => !v && setCertOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{certEditing ? "Edit" : "Add"} Certification Record</DialogTitle>
            <DialogDescription>Soil Association, OF&G, Organic Farmers & Growers or other certifying body</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Certifying Body *</Label>
              <Select value={certForm.certifier || ""} onValueChange={v => setCertForm(f => ({ ...f, certifier: v }))}>
                <SelectTrigger><SelectValue placeholder="Select certifier…" /></SelectTrigger>
                <SelectContent>{CERTIFIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certificate Number</Label>
              <Input value={certForm.certificateNumber || ""} onChange={e => setCertForm(f => ({ ...f, certificateNumber: e.target.value }))} placeholder="e.g. SA-1234567" />
            </div>
            <div>
              <Label>Operator Number</Label>
              <Input value={certForm.operatorNumber || ""} onChange={e => setCertForm(f => ({ ...f, operatorNumber: e.target.value }))} placeholder="e.g. GB-ORG-01-XXXX" />
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={certForm.status || "certified"} onValueChange={v => setCertForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CERT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certification Date</Label>
              <Input type="date" value={certForm.certificationDate || ""} onChange={e => setCertForm(f => ({ ...f, certificationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Renewal Date</Label>
              <Input type="date" value={certForm.renewalDate || ""} onChange={e => setCertForm(f => ({ ...f, renewalDate: e.target.value }))} />
            </div>
            <div>
              <Label>Annual Inspection Date</Label>
              <Input type="date" value={certForm.annualInspectionDate || ""} onChange={e => setCertForm(f => ({ ...f, annualInspectionDate: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Next Inspection Due</Label>
              <Input type="date" value={certForm.nextInspectionDue || ""} onChange={e => setCertForm(f => ({ ...f, nextInspectionDue: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Certification Scope</Label>
              <Input value={certForm.scope || ""} onChange={e => setCertForm(f => ({ ...f, scope: e.target.value }))} placeholder="e.g. Arable crops — winter wheat, OSR, spring barley" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={certForm.notes || ""} onChange={e => setCertForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertOpen(false)}>Cancel</Button>
            <Button onClick={saveCert} disabled={certMut.save.isPending || !certForm.certifier}>
              {certMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : certEditing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Conversion Dialog */}
      <Dialog open={convOpen} onOpenChange={v => !v && setConvOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{convEditing ? "Edit" : "Add"} Field Conversion Record</DialogTitle>
            <DialogDescription>Track conversion start date and organic status for each field or parcel</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Field / Parcel Name *</Label>
              <Input value={str(convForm.fieldName)} onChange={e => setConvForm(f => ({ ...f, fieldName: e.target.value }))} placeholder="e.g. Home Field, North Block" />
            </div>
            <div>
              <Label>Area (ha)</Label>
              <Input type="number" step="0.001" value={str(convForm.areaHa)} onChange={e => setConvForm(f => ({ ...f, areaHa: e.target.value }))} placeholder="0.000" />
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={str(convForm.status) || "in-conversion"} onValueChange={v => setConvForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONV_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conversion Start Date *</Label>
              <Input type="date" value={str(convForm.conversionStartDate)} onChange={e => setConvForm(f => ({ ...f, conversionStartDate: e.target.value }))} />
            </div>
            <div>
              <Label>Expected Certification Date</Label>
              <Input type="date" value={str(convForm.expectedCertificationDate)} onChange={e => setConvForm(f => ({ ...f, expectedCertificationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Actual Certification Date</Label>
              <Input type="date" value={str(convForm.actualCertificationDate)} onChange={e => setConvForm(f => ({ ...f, actualCertificationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Certifier Reference</Label>
              <Input value={str(convForm.certifierRef)} onChange={e => setConvForm(f => ({ ...f, certifierRef: e.target.value }))} placeholder="e.g. SA-CONV-2024-001" />
            </div>
            <div className="col-span-2">
              <Label>Previous Land Use</Label>
              <Input value={str(convForm.previousLandUse)} onChange={e => setConvForm(f => ({ ...f, previousLandUse: e.target.value }))} placeholder="e.g. Conventional arable — winter wheat" />
            </div>
            <div className="col-span-2 flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="parallelProd"
                checked={convForm.parallelProduction === "true"}
                onChange={e => setConvForm(f => ({ ...f, parallelProduction: e.target.checked ? "true" : "false" }))}
                className="w-4 h-4"
              />
              <Label htmlFor="parallelProd" className="cursor-pointer font-normal">Parallel production (same crop grown organically and conventionally on farm)</Label>
            </div>
            {convForm.parallelProduction === "true" && (
              <div className="col-span-2">
                <Label>Parallel Production Justification</Label>
                <Textarea rows={2} value={str(convForm.parallelProductionJustification)} onChange={e => setConvForm(f => ({ ...f, parallelProductionJustification: e.target.value }))} placeholder="Explain why the same variety is grown on both organic and conventional land (certifier approval required)" />
              </div>
            )}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={str(convForm.notes)} onChange={e => setConvForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvOpen(false)}>Cancel</Button>
            <Button onClick={saveConv} disabled={convMut.save.isPending || !convForm.fieldName || !convForm.conversionStartDate}>
              {convMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : convEditing ? "Save Changes" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seed Sourcing Dialog */}
      <Dialog open={seedOpen} onOpenChange={v => !v && setSeedOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{seedEditing ? "Edit" : "Add"} Seed Record</DialogTitle>
            <DialogDescription>Log all seed purchases — organic certified preferred; derogation required for any non-organic seed</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Purchase Date *</Label>
              <Input type="date" value={str(seedForm.purchaseDate)} onChange={e => setSeedForm(f => ({ ...f, purchaseDate: e.target.value }))} />
            </div>
            <div>
              <Label>Crop *</Label>
              <Input value={str(seedForm.cropName)} onChange={e => setSeedForm(f => ({ ...f, cropName: e.target.value }))} placeholder="e.g. Winter Wheat" />
            </div>
            <div>
              <Label>Variety</Label>
              <Input value={str(seedForm.variety)} onChange={e => setSeedForm(f => ({ ...f, variety: e.target.value }))} placeholder="e.g. KWS Zyatt" />
            </div>
            <div>
              <Label>Quantity (kg)</Label>
              <Input type="number" step="0.01" value={str(seedForm.quantityKg)} onChange={e => setSeedForm(f => ({ ...f, quantityKg: e.target.value }))} />
            </div>
            <div>
              <Label>Seed Type *</Label>
              <Select value={str(seedForm.seedType) || "organic"} onValueChange={v => setSeedForm(f => ({ ...f, seedType: v, derogationGranted: v === "organic" ? "false" : f.derogationGranted }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEED_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch / Lot Number</Label>
              <Input value={str(seedForm.batchLotNumber)} onChange={e => setSeedForm(f => ({ ...f, batchLotNumber: e.target.value }))} placeholder="e.g. BL-2024-001" />
            </div>
            <div className="col-span-2">
              <Label>Supplier Name</Label>
              <Input value={str(seedForm.supplierName)} onChange={e => setSeedForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="e.g. Organic Seed Store Ltd" />
            </div>
            <div className="col-span-2">
              <Label>Supplier Address</Label>
              <Input value={str(seedForm.supplierAddress)} onChange={e => setSeedForm(f => ({ ...f, supplierAddress: e.target.value }))} />
            </div>
            {str(seedForm.seedType) !== "organic" && (
              <>
                <div className="col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Derogation Required</p>
                  <p className="text-xs text-amber-700">Non-organic seed requires prior written approval from your certifying body. Ensure derogation is obtained before sowing.</p>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="derog" checked={str(seedForm.derogationGranted) === "true"} onChange={e => setSeedForm(f => ({ ...f, derogationGranted: e.target.checked ? "true" : "false" }))} className="w-4 h-4" />
                  <Label htmlFor="derog" className="cursor-pointer font-normal">Derogation granted by certifier</Label>
                </div>
                {str(seedForm.derogationGranted) === "true" && (
                  <>
                    <div>
                      <Label>Derogation Reference</Label>
                      <Input value={str(seedForm.derogationReference)} onChange={e => setSeedForm(f => ({ ...f, derogationReference: e.target.value }))} placeholder="e.g. SA-DER-2024-007" />
                    </div>
                    <div>
                      <Label>Derogation Expiry Date</Label>
                      <Input type="date" value={str(seedForm.derogationExpiryDate)} onChange={e => setSeedForm(f => ({ ...f, derogationExpiryDate: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <Label>Certifier Approval Reference</Label>
                      <Input value={str(seedForm.certifierApproval)} onChange={e => setSeedForm(f => ({ ...f, certifierApproval: e.target.value }))} />
                    </div>
                  </>
                )}
              </>
            )}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={str(seedForm.notes)} onChange={e => setSeedForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeedOpen(false)}>Cancel</Button>
            <Button onClick={saveSeed} disabled={seedMut.save.isPending || !seedForm.purchaseDate || !seedForm.cropName}>
              {seedMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : seedEditing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Input Log Dialog */}
      <Dialog open={inputOpen} onOpenChange={v => !v && setInputOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{inputEditing ? "Edit" : "Log"} Input Application</DialogTitle>
            <DialogDescription>Record all fertilisers, soil amendments, and crop protection products applied to organic fields</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Application Date *</Label>
              <Input type="date" value={inputForm.applicationDate || ""} onChange={e => setInputForm(f => ({ ...f, applicationDate: e.target.value }))} />
            </div>
            <div>
              <Label>Field / Parcel</Label>
              <Input value={inputForm.fieldName || ""} onChange={e => setInputForm(f => ({ ...f, fieldName: e.target.value }))} placeholder="e.g. Home Field" />
            </div>
            <div className="col-span-2">
              <Label>Product / Substance *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={inputCustomProduct ? "__other__" : (inputForm.productName || "")}
                onChange={e => {
                  if (e.target.value === "__other__") { setInputCustomProduct(true); setInputForm(f => ({ ...f, productName: "" })); }
                  else { setInputCustomProduct(false); setInputForm(f => ({ ...f, productName: e.target.value, inputType: "Fertiliser / Soil Amendment" })); }
                }}
              >
                <option value="">Select Annex II approved input…</option>
                {ANNEX_INPUTS.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__other__">Other / specify below</option>
              </select>
              {inputCustomProduct && (
                <Input className="mt-1.5" placeholder="Enter product name" value={inputForm.productName || ""} onChange={e => setInputForm(f => ({ ...f, productName: e.target.value }))} autoFocus />
              )}
            </div>
            <div>
              <Label>Active Ingredient</Label>
              <Input value={inputForm.activeIngredient || ""} onChange={e => setInputForm(f => ({ ...f, activeIngredient: e.target.value }))} placeholder="e.g. Copper hydroxide" />
            </div>
            <div>
              <Label>Input Type *</Label>
              <Select value={inputForm.inputType || ""} onValueChange={v => setInputForm(f => ({ ...f, inputType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>{INPUT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Permitted Status *</Label>
              <Select value={inputForm.permittedStatus || "permitted"} onValueChange={v => setInputForm(f => ({ ...f, permittedStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PERMITTED_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Regulatory Basis</Label>
              <Input value={inputForm.regulatoryBasis || ""} onChange={e => setInputForm(f => ({ ...f, regulatoryBasis: e.target.value }))} placeholder="e.g. Annex II EU Reg 2018/848" />
            </div>
            <div>
              <Label>Qty Applied</Label>
              <Input type="number" step="0.001" value={inputForm.quantityApplied || ""} onChange={e => setInputForm(f => ({ ...f, quantityApplied: e.target.value }))} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={inputForm.quantityUnit || "kg/ha"} onValueChange={v => setInputForm(f => ({ ...f, quantityUnit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{QUANTITY_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Area Applied (ha)</Label>
              <Input type="number" step="0.001" value={inputForm.areaAppliedHa || ""} onChange={e => setInputForm(f => ({ ...f, areaAppliedHa: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Supplier</Label>
              <Input value={inputForm.supplierName || ""} onChange={e => setInputForm(f => ({ ...f, supplierName: e.target.value }))} />
            </div>
            {inputForm.permittedStatus === "restricted" && (
              <div className="col-span-2">
                <Label>Certifier Approval Reference</Label>
                <Input value={inputForm.certifierApproval || ""} onChange={e => setInputForm(f => ({ ...f, certifierApproval: e.target.value }))} placeholder="Reference for certifier written approval" />
              </div>
            )}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={inputForm.notes || ""} onChange={e => setInputForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInputOpen(false)}>Cancel</Button>
            <Button onClick={saveInput} disabled={inputMut.save.isPending || !inputForm.applicationDate || !inputForm.productName || !inputForm.inputType}>
              {inputMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : inputEditing ? "Save Changes" : "Log Input"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Harvest Declarations Dialog */}
      <Dialog open={harvestOpen} onOpenChange={v => !v && setHarvestOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{harvestEditing ? "Edit" : "Log"} Harvest Declaration</DialogTitle>
            <DialogDescription>Record organic harvest details and buyer declaration for each crop</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Harvest Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harvest Date *</Label>
                <Input type="date" value={harvestForm.harvestDate || ""} onChange={e => setHarvestForm(f => ({ ...f, harvestDate: e.target.value }))} />
              </div>
              <div>
                <Label>Crop *</Label>
                <Input value={harvestForm.cropName || ""} onChange={e => setHarvestForm(f => ({ ...f, cropName: e.target.value }))} placeholder="e.g. Winter Wheat" />
              </div>
              <div>
                <Label>Variety</Label>
                <Input value={harvestForm.variety || ""} onChange={e => setHarvestForm(f => ({ ...f, variety: e.target.value }))} placeholder="e.g. KWS Zyatt" />
              </div>
              <div>
                <Label>Field / Parcel</Label>
                <Input value={harvestForm.fieldName || ""} onChange={e => setHarvestForm(f => ({ ...f, fieldName: e.target.value }))} placeholder="e.g. Home Field" />
              </div>
              <div>
                <Label>Yield (tonnes)</Label>
                <Input type="number" step="0.001" value={harvestForm.yieldTonnes || ""} onChange={e => setHarvestForm(f => ({ ...f, yieldTonnes: e.target.value }))} />
              </div>
              <div>
                <Label>Moisture %</Label>
                <Input type="number" step="0.1" value={harvestForm.moisturePercent || ""} onChange={e => setHarvestForm(f => ({ ...f, moisturePercent: e.target.value }))} />
              </div>
              <div>
                <Label>Organic Status *</Label>
                <Select value={harvestForm.organicStatus || "certified"} onValueChange={v => setHarvestForm(f => ({ ...f, organicStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{HARVEST_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Certifier Reference</Label>
                <Input value={harvestForm.certifierRef || ""} onChange={e => setHarvestForm(f => ({ ...f, certifierRef: e.target.value }))} placeholder="e.g. SA-CROP-2025-001" />
              </div>
              <div className="col-span-2">
                <Label>Storage Location</Label>
                <Input value={harvestForm.storageLocation || ""} onChange={e => setHarvestForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Grain store A — segregated organic bay" />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t border-border">Buyer Declaration</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Buyer Name</Label>
                <Input value={harvestForm.buyerName || ""} onChange={e => setHarvestForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="e.g. John Smith" />
              </div>
              <div>
                <Label>Buyer Organisation</Label>
                <Input value={harvestForm.buyerOrganisation || ""} onChange={e => setHarvestForm(f => ({ ...f, buyerOrganisation: e.target.value }))} placeholder="e.g. Organic Grain Merchants Ltd" />
              </div>
              <div className="col-span-2">
                <Label>Buyer Address</Label>
                <Input value={harvestForm.buyerAddress || ""} onChange={e => setHarvestForm(f => ({ ...f, buyerAddress: e.target.value }))} />
              </div>
              <div>
                <Label>Sale Date</Label>
                <Input type="date" value={harvestForm.saleDate || ""} onChange={e => setHarvestForm(f => ({ ...f, saleDate: e.target.value }))} />
              </div>
              <div>
                <Label>Qty Sold (t)</Label>
                <Input type="number" step="0.001" value={harvestForm.quantitySoldTonnes || ""} onChange={e => setHarvestForm(f => ({ ...f, quantitySoldTonnes: e.target.value }))} />
              </div>
              <div>
                <Label>Price (£/t)</Label>
                <Input type="number" step="0.01" value={harvestForm.pricePoundPerTonne || ""} onChange={e => setHarvestForm(f => ({ ...f, pricePoundPerTonne: e.target.value }))} />
              </div>
              <div>
                <Label>Organic Premium %</Label>
                <Input type="number" step="0.1" value={harvestForm.organicPremiumPercent || ""} onChange={e => setHarvestForm(f => ({ ...f, organicPremiumPercent: e.target.value }))} placeholder="e.g. 25" />
              </div>
              <div>
                <Label>Declaration Date</Label>
                <Input type="date" value={harvestForm.declarationDate || ""} onChange={e => setHarvestForm(f => ({ ...f, declarationDate: e.target.value }))} />
              </div>
              <div>
                <Label>Declaration Reference</Label>
                <Input value={harvestForm.declarationReference || ""} onChange={e => setHarvestForm(f => ({ ...f, declarationReference: e.target.value }))} placeholder="e.g. DEC-2025-001" />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea rows={2} value={harvestForm.notes || ""} onChange={e => setHarvestForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHarvestOpen(false)}>Cancel</Button>
            <Button onClick={saveHarvest} disabled={harvestMut.save.isPending || !harvestForm.harvestDate || !harvestForm.cropName}>
              {harvestMut.save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : harvestEditing ? "Save Changes" : "Log Harvest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialogs */}
      <DeleteConfirmDialog open={certDeleting !== null} onClose={() => setCertDeleting(null)} saving={certMut.del.isPending}
        onConfirm={() => certMut.del.mutate(certDeleting!, { onSuccess: () => setCertDeleting(null) })} />
      <DeleteConfirmDialog open={convDeleting !== null} onClose={() => setConvDeleting(null)} saving={convMut.del.isPending}
        onConfirm={() => convMut.del.mutate(convDeleting!, { onSuccess: () => setConvDeleting(null) })} />
      <DeleteConfirmDialog open={seedDeleting !== null} onClose={() => setSeedDeleting(null)} saving={seedMut.del.isPending}
        onConfirm={() => seedMut.del.mutate(seedDeleting!, { onSuccess: () => setSeedDeleting(null) })} />
      <DeleteConfirmDialog open={inputDeleting !== null} onClose={() => setInputDeleting(null)} saving={inputMut.del.isPending}
        onConfirm={() => inputMut.del.mutate(inputDeleting!, { onSuccess: () => setInputDeleting(null) })} />
      <DeleteConfirmDialog open={harvestDeleting !== null} onClose={() => setHarvestDeleting(null)} saving={harvestMut.del.isPending}
        onConfirm={() => harvestMut.del.mutate(harvestDeleting!, { onSuccess: () => setHarvestDeleting(null) })} />
    </AppLayout>
  );
}
