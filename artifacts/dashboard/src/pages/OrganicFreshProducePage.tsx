import React, { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus, Loader2, Pencil, Trash2, AlertTriangle,
  Leaf, ShieldCheck, FlaskConical, FileText,
  Eye, Info, Package, CheckCircle2, Clock, Printer, ClipboardList,
  Droplets, Thermometer, Warehouse,
} from "lucide-react";
import {
  CropsTab, WaterTestsTab, HarvestTab, IntakeTab, PackhouseTab, AllergenTab,
} from "@/pages/FreshProducePage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

function fmtRaw(val: unknown): string {
  return val == null || val === "" ? "—" : String(val);
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function conversionProgress(startDate: string | null | undefined): number {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = start + 2 * 365.25 * 24 * 3600 * 1000;
  const now = Date.now();
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

import { apiUrl as api } from "@/lib/api";

function yearRange(): number[] {
  const cur = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => cur - 2 + i);
}

// ─── Approved substances (Annex I fertilisers + Annex II crop protection) ────

interface SubstanceOption { substance: string; autoType: string; }

const ANNEX_INPUTS: SubstanceOption[] = [
  { substance: "Farmyard Manure (FYM) — composted or well-rotted", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Composted Plant & Animal Material", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Green Manure / Cover Crop Residue", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Slurry (composted; restricted from non-organic units)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dried Blood (Blood Meal)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Bone Meal / Steamed Bone Flour", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Fish Meal / Fish Emulsion", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Calcified Seaweed (Lithothamnium)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Extract (liquid)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Rock Phosphate (soft / reactive)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Potassium Sulphate (natural mineral extraction, low chloride)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Kieserite (Magnesium Sulphate, natural mineral)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Wood Ash (from untreated wood only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Ground Limestone / Calcium Carbonate", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dolomitic Limestone / Magnesium Limestone", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Gypsum (natural calcium sulphate)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Elemental Sulphur", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Peat (growing media only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Vermiculite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Perlite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Copper Hydroxide", autoType: "Crop Protection / Pesticide" },
  { substance: "Copper Oxychloride", autoType: "Crop Protection / Pesticide" },
  { substance: "Copper Sulphate / Bordeaux Mixture", autoType: "Crop Protection / Pesticide" },
  { substance: "Pyrethrin (from Chrysanthemum cinerariaefolium)", autoType: "Crop Protection / Pesticide" },
  { substance: "Spinosad (restricted — certifier notification required)", autoType: "Crop Protection / Pesticide" },
  { substance: "Azadirachtin / Neem Extract", autoType: "Crop Protection / Pesticide" },
  { substance: "Bacillus thuringiensis (Bt)", autoType: "Crop Protection / Pesticide" },
  { substance: "Bacillus subtilis", autoType: "Crop Protection / Pesticide" },
  { substance: "Beauveria bassiana", autoType: "Crop Protection / Pesticide" },
  { substance: "Entomopathogenic Nematodes", autoType: "Crop Protection / Pesticide" },
  { substance: "Iron Phosphate (slug pellets)", autoType: "Crop Protection / Pesticide" },
  { substance: "Kaolin (particle film)", autoType: "Crop Protection / Pesticide" },
  { substance: "Diatomaceous Earth / Kieselgur", autoType: "Crop Protection / Pesticide" },
  { substance: "Potassium Bicarbonate", autoType: "Crop Protection / Pesticide" },
  { substance: "Sulphur (wettable / dust)", autoType: "Crop Protection / Pesticide" },
  { substance: "Soft Soap / Potassium Soap", autoType: "Crop Protection / Pesticide" },
  { substance: "Rapeseed Oil / Plant Oil", autoType: "Crop Protection / Pesticide" },
  { substance: "Pheromones (mating disruption traps only)", autoType: "Crop Protection / Pesticide" },
  { substance: "Certified Organic Seed", autoType: "Seed Treatment" },
  { substance: "Untreated Conventional Seed (derogation required)", autoType: "Seed Treatment" },
  { substance: "Potassium Permanganate (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Hydrogen Peroxide (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Sodium Hypochlorite (disinfection of equipment only)", autoType: "Cleaning & Disinfection" },
];

const INPUT_TYPES = [
  "Fertiliser / Soil Amendment",
  "Crop Protection / Pesticide",
  "Biological Control",
  "Seed Treatment",
  "Cleaning & Disinfection",
  "Water Treatment",
  "Other",
];

const QUANTITY_UNITS = ["kg", "kg/ha", "l", "l/ha", "t", "g", "g/ha", "units"];

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  permitted: "Permitted",
  restricted: "Restricted (notify certifier)",
  derogation: "Derogation Required",
};

const APPROVAL_STATUS_COLORS: Record<string, string> = {
  permitted: "bg-green-50 text-green-700 border-green-300",
  restricted: "bg-amber-50 text-amber-700 border-amber-300",
  derogation: "bg-red-50 text-red-700 border-red-300",
};

function SubstancePicker({ value, onSelect }: { value: string; onSelect: (substance: string, autoType: string) => void }) {
  const inList = ANNEX_INPUTS.some(o => o.substance === value);
  const [showCustom, setShowCustom] = useState(!inList && value !== "");
  const selectValue = inList ? value : (showCustom || value !== "") ? "__other__" : "";

  function handleSelect(val: string) {
    if (val === "__other__") { setShowCustom(true); onSelect("", ""); }
    else if (val === "") { setShowCustom(false); onSelect("", ""); }
    else {
      const opt = ANNEX_INPUTS.find(o => o.substance === val);
      if (opt) { setShowCustom(false); onSelect(opt.substance, opt.autoType); }
    }
  }

  return (
    <div className="space-y-1.5">
      <select
        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        value={selectValue}
        onChange={e => handleSelect(e.target.value)}
      >
        <option value="">Select approved substance…</option>
        {ANNEX_INPUTS.map(o => (
          <option key={o.substance} value={o.substance}>{o.substance}</option>
        ))}
        <option value="__other__">Other / specify below</option>
      </select>
      {(showCustom || selectValue === "__other__") && (
        <Input
          required
          placeholder="Enter product / substance name"
          value={inList ? "" : value}
          onChange={e => onSelect(e.target.value, "")}
          autoFocus
        />
      )}
    </div>
  );
}

const EMPTY_INPUT_FORM = {
  applicationDate: new Date().toISOString().slice(0, 10),
  cropYear: new Date().getFullYear(),
  blockId: "" as string,
  inputName: "",
  inputType: "",
  approvalStatus: "permitted",
  certifierApprovalRef: "",
  approvedByBody: "",
  supplier: "",
  poReference: "",
  grnReference: "",
  quantityApplied: "",
  quantityUnit: "kg",
  purposeOfUse: "",
  appliedBy: "",
  notes: "",
};

// ─── Synthetic History Panel ──────────────────────────────────────────────────

type SprayLookup = { id: number; applicationDate: string; productName: string; activeIngredient: string | null; reasonForApplication: string | null };
type SyntheticEntry = { id: number; productName: string; activeIngredient: string | null; productType: string | null; applicationDate: string | null; notes: string | null };
type LocalSynthEntry = { productName: string; activeIngredient: string; productType: string; applicationDate: string; notes: string; sprayApplicationId?: number };

const EMPTY_SYNTH: LocalSynthEntry = { productName: "", activeIngredient: "", productType: "spray", applicationDate: "", notes: "" };

function SyntheticHistoryPanel({
  farmId, blockStatusId, localEntries, onLocalAdd, onLocalRemove,
}: {
  farmId: number;
  blockStatusId?: number;
  localEntries?: LocalSynthEntry[];
  onLocalAdd?: (e: LocalSynthEntry) => void;
  onLocalRemove?: (idx: number) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isLocal = blockStatusId == null;
  const [addMode, setAddMode] = useState<"none" | "manual" | "import">("none");
  const [manualForm, setManualForm] = useState<LocalSynthEntry>({ ...EMPTY_SYNTH });
  const [selectedSprayId, setSelectedSprayId] = useState("");

  const { data: persistedEntries = [] } = useQuery<SyntheticEntry[]>({
    queryKey: ["synth-history", blockStatusId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp-block-status/${blockStatusId}/synthetic-history`), { credentials: "include" }).then(r => r.json()),
    enabled: !isLocal,
  });

  const { data: sprayOptions = [] } = useQuery<SprayLookup[]>({
    queryKey: ["spray-lookup", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/spray-applications-lookup`), { credentials: "include" }).then(r => r.json()),
    enabled: addMode === "import",
  });

  const addPersisted = useMutation({
    mutationFn: (body: Record<string, unknown>) => fetch(api(`farms/${farmId}/organic-fp-block-status/${blockStatusId}/synthetic-history`), {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["synth-history", blockStatusId] }); setAddMode("none"); setManualForm({ ...EMPTY_SYNTH }); setSelectedSprayId(""); toast({ title: "Entry added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const removePersisted = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-synthetic-history/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["synth-history", blockStatusId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const productTypeLabel = (t: string | null) => {
    if (t === "spray") return <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-700">Spray</span>;
    if (t === "fertiliser") return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Fertiliser</span>;
    return <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{t ?? "Other"}</span>;
  };

  const handleAddEntry = () => {
    if (!manualForm.productName) return;
    if (isLocal) {
      onLocalAdd?.({ ...manualForm });
    } else {
      addPersisted.mutate({ ...manualForm });
      return;
    }
    setAddMode("none");
    setManualForm({ ...EMPTY_SYNTH });
  };

  const handleImport = () => {
    const spray = sprayOptions.find(s => String(s.id) === selectedSprayId);
    if (!spray) return;
    const entry: LocalSynthEntry = {
      productName: spray.productName,
      activeIngredient: spray.activeIngredient ?? "",
      productType: "spray",
      applicationDate: spray.applicationDate ? spray.applicationDate.slice(0, 10) : "",
      notes: spray.reasonForApplication ?? "",
      sprayApplicationId: spray.id,
    };
    if (isLocal) {
      onLocalAdd?.(entry);
      setAddMode("none");
      setSelectedSprayId("");
    } else {
      addPersisted.mutate(entry as unknown as Record<string, unknown>);
    }
  };

  const displayEntries = isLocal
    ? (localEntries ?? []).map((e, i) => ({ ...e, _localIdx: i }))
    : persistedEntries;
  const isEmpty = displayEntries.length === 0;

  return (
    <div className="col-span-2 border rounded-lg p-3 space-y-2 bg-muted/30">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />Previous Synthetic Input History
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant={addMode === "manual" ? "secondary" : "outline"} className="h-6 text-xs px-2" onClick={() => setAddMode(m => m === "manual" ? "none" : "manual")}>
            <Plus className="w-3 h-3 mr-0.5" />Manual Entry
          </Button>
          <Button size="sm" variant={addMode === "import" ? "secondary" : "outline"} className="h-6 text-xs px-2" onClick={() => setAddMode(m => m === "import" ? "none" : "import")}>
            Import from Spray Records
          </Button>
        </div>
      </div>

      {isEmpty && addMode === "none" && (
        <p className="text-xs text-muted-foreground italic text-center py-2">No synthetic input history recorded. Use the buttons above to add entries.</p>
      )}

      {isLocal
        ? (localEntries ?? []).map((e, i) => (
          <div key={i} className="flex items-start justify-between gap-2 bg-white rounded p-2 border text-xs">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium">{e.productName}</span>
                {productTypeLabel(e.productType)}
                {e.applicationDate && <span className="text-muted-foreground">{fmt(e.applicationDate)}</span>}
              </div>
              {e.activeIngredient && <p className="text-muted-foreground mt-0.5">Active ingredient: {e.activeIngredient}</p>}
              {e.notes && <p className="text-muted-foreground mt-0.5 italic">{e.notes}</p>}
            </div>
            <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => onLocalRemove?.(i)}>
              <Trash2 className="w-3 h-3 text-red-400" />
            </Button>
          </div>
        ))
        : persistedEntries.map(e => (
          <div key={e.id} className="flex items-start justify-between gap-2 bg-white rounded p-2 border text-xs">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium">{e.productName}</span>
                {productTypeLabel(e.productType)}
                {e.applicationDate && <span className="text-muted-foreground">{fmt(e.applicationDate)}</span>}
              </div>
              {e.activeIngredient && <p className="text-muted-foreground mt-0.5">Active ingredient: {e.activeIngredient}</p>}
              {e.notes && <p className="text-muted-foreground mt-0.5 italic">{e.notes}</p>}
            </div>
            <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => removePersisted.mutate(e.id)}>
              <Trash2 className="w-3 h-3 text-red-400" />
            </Button>
          </div>
        ))
      }

      {addMode === "manual" && (
        <div className="border rounded p-2 space-y-2 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Product Name *</Label><Input className="h-7 text-xs" value={manualForm.productName} onChange={e => setManualForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div>
              <Label className="text-xs">Type</Label>
              <select className="w-full h-7 text-xs border rounded px-1" value={manualForm.productType} onChange={e => setManualForm(f => ({ ...f, productType: e.target.value }))}>
                <option value="spray">Spray / Pesticide</option>
                <option value="fertiliser">Fertiliser</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><Label className="text-xs">Active Ingredient</Label><Input className="h-7 text-xs" value={manualForm.activeIngredient} onChange={e => setManualForm(f => ({ ...f, activeIngredient: e.target.value }))} /></div>
            <div><Label className="text-xs">Application Date</Label><Input type="date" className="h-7 text-xs" max={new Date().toISOString().slice(0, 10)} value={manualForm.applicationDate} onChange={e => setManualForm(f => ({ ...f, applicationDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label className="text-xs">Notes</Label><Input className="h-7 text-xs" value={manualForm.notes} onChange={e => setManualForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. reason for application" /></div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => { setAddMode("none"); setManualForm({ ...EMPTY_SYNTH }); }}>Cancel</Button>
            <Button size="sm" className="h-6 text-xs" disabled={!manualForm.productName || addPersisted.isPending} onClick={handleAddEntry}>
              {addPersisted.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add Entry"}
            </Button>
          </div>
        </div>
      )}

      {addMode === "import" && (
        <div className="border rounded p-2 space-y-2 bg-white">
          <p className="text-xs text-muted-foreground">Select a spray application from your existing records to import as a synthetic input entry.</p>
          {sprayOptions.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">No spray records found for this farm.</p>
          ) : (
            <>
              <select className="w-full border rounded px-2 py-1 text-xs" value={selectedSprayId} onChange={e => setSelectedSprayId(e.target.value)}>
                <option value="">Select a spray record…</option>
                {sprayOptions.map(s => (
                  <option key={s.id} value={String(s.id)}>
                    {fmt(s.applicationDate)} — {s.productName}{s.activeIngredient ? ` (${s.activeIngredient})` : ""}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => { setAddMode("none"); setSelectedSprayId(""); }}>Cancel</Button>
                <Button size="sm" className="h-6 text-xs" disabled={!selectedSprayId || addPersisted.isPending} onClick={handleImport}>
                  {addPersisted.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Import"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Block Status Tab ────────────────────────────────────────────────────────

// ─── Print helpers ────────────────────────────────────────────────────────────

const FP_PRINT_CSS = `
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #15803d; padding-bottom: 8px; margin-bottom: 14px; }
  .hdr-l .title { font-size: 15px; font-weight: bold; color: #15803d; }
  .hdr-l .farm { font-size: 12px; color: #374151; margin-top: 2px; }
  .hdr-r { font-size: 10px; color: #6b7280; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 5px 7px; text-align: left; font-size: 10px; font-weight: bold; color: #15803d; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { display: inline-block; padding: 1px 7px; border-radius: 12px; font-size: 9px; font-weight: bold; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-yellow { background: #fef9c3; color: #854d0e; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-gray { background: #f3f4f6; color: #374151; }
  @media print { @page { size: A4 landscape; margin: 1.5cm; } }
`;

function fpOpenPrint(html: string) {
  const w = window.open("", "_blank", "width=1100,height=780");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.addEventListener("afterprint", () => w.close());
  setTimeout(() => w.print(), 400);
}

function printFpBlockStatusRegister(blocks: Record<string, unknown>[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = blocks.map(b => `
    <tr>
      <td>${String(b.blockName ?? "—")}</td>
      <td>${String(b.blockReference ?? "—")}</td>
      <td>${String(b.areaHectares ?? "—")}</td>
      <td><span class="badge ${b.status === 'fully-organic' ? 'badge-green' : b.status === 'in-conversion' ? 'badge-yellow' : 'badge-gray'}">${String(b.status ?? "—").replace(/-/g, ' ')}</span></td>
      <td>${b.conversionStartDate ? new Date(b.conversionStartDate as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${b.fullyOrganicDate ? new Date(b.fullyOrganicDate as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(b.certifyingBody ?? "—")}</td>
      <td>${String(b.certificationRef ?? "—")}</td>
      <td>${String(b.crop ?? "—")}</td>
      <td>${String(b.notes ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Organic Block Status Register — ${farmName}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Block Conversion Status Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Block Status</b><br>${blocks.length} block${blocks.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Block Name</th><th>Block Ref</th><th>Area (ha)</th><th>Status</th><th>Conv. Start</th><th>Fully Organic Date</th><th>Certifier</th><th>Cert Ref</th><th>Crop</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printFpInputLog(rows: Record<string, unknown>[], farmName: string, yearLabel: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rowsHtml = rows.map(r => `
    <tr>
      <td>${r.applicationDate ? new Date(r.applicationDate as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(r.cropYear ?? "—")}</td>
      <td>${String(r.inputName ?? "—")}</td>
      <td>${String(r.inputType ?? "—")}</td>
      <td><span class="badge ${r.approvalStatus === 'permitted' ? 'badge-green' : r.approvalStatus === 'restricted' ? 'badge-yellow' : 'badge-red'}">${String(r.approvalStatus ?? "—")}</span></td>
      <td>${String(r.supplier ?? "—")}</td>
      <td>${r.quantityApplied ? String(r.quantityApplied) + ' ' + String(r.quantityUnit ?? "") : "—"}</td>
      <td>${String(r.purposeOfUse ?? "—")}</td>
      <td>${String(r.appliedBy ?? "—")}</td>
      <td>${String(r.certifierApprovalRef ?? "—")}</td>
      <td>${String(r.poReference ?? "—")}</td>
      <td>${String(r.grnReference ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Organic Input Log — ${farmName} — ${yearLabel}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Approved Input Log · ${yearLabel}</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Input Log</b><br>${rows.length} record${rows.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Crop Year</th><th>Input / Product</th><th>Type</th><th>Approval</th><th>Supplier</th><th>Qty Applied</th><th>Purpose</th><th>Applied By</th><th>Certifier Ref</th><th>PO Ref</th><th>GRN Ref</th></tr></thead>
    <tbody>${rowsHtml}</tbody></table></body></html>`);
}

function printFpCertificates(certs: Record<string, unknown>[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = certs.map(c => `
    <tr>
      <td>${String(c.certifyingBody ?? "—")}</td>
      <td>${String(c.certificateNumber ?? "—")}</td>
      <td>${String(c.status ?? "—")}</td>
      <td>${c.issueDate ? new Date(c.issueDate as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${c.expiryDate ? new Date(c.expiryDate as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${c.annualRenewalDue ? new Date(c.annualRenewalDue as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(c.scopeDescription ?? "—")}</td>
      <td>${String(c.notes ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Organic Certificates — ${farmName}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Certificates Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Certificates</b><br>${certs.length} record${certs.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Certifying Body</th><th>Certificate No.</th><th>Status</th><th>Issue Date</th><th>Expiry Date</th><th>Annual Renewal Due</th><th>Scope</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printFpBuyerDeclarations(decls: Record<string, unknown>[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = decls.map(d => `
    <tr>
      <td>${d.declarationDate ? new Date(d.declarationDate as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(d.buyerName ?? "—")}</td>
      <td>${String(d.buyerAddress ?? "—")}</td>
      <td>${String(d.productDescription ?? "—")}</td>
      <td>${String(d.quantityKg ?? "—")}</td>
      <td>${String(d.certifyingBody ?? "—")}</td>
      <td>${String(d.certificateNumber ?? "—")}</td>
      <td>${String(d.declaredBy ?? "—")}</td>
      <td>${String(d.notes ?? "—")}</td>
    </tr>`).join("");
  fpOpenPrint(`<!DOCTYPE html><html><head><title>Buyer Declarations — ${farmName}</title><style>${FP_PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Fresh Produce — Buyer Organic Declarations</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Buyer Declarations</b><br>${decls.length} record${decls.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Buyer Name</th><th>Address</th><th>Product</th><th>Qty (kg)</th><th>Certifying Body</th><th>Cert Number</th><th>Declared By</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

// ─── Block Status Tab ─────────────────────────────────────────────────────────

function BlockStatusTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [pendingHistory, setPendingHistory] = useState<LocalSynthEntry[]>([]);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["ofp-block-status", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp-block-status`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: growerBlocks = [] } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-block-status/${editing.id}`) : api(`farms/${farmId}/organic-fp-block-status`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ).then(r => r.json()),
    onSuccess: async (data) => {
      if (!editing && pendingHistory.length > 0) {
        await Promise.all(pendingHistory.map(entry =>
          fetch(api(`farms/${farmId}/organic-fp-block-status/${data.id}/synthetic-history`), {
            method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
            body: JSON.stringify(entry),
          }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })
        ));
        qc.invalidateQueries({ queryKey: ["synth-history", data.id] });
      }
      qc.invalidateQueries({ queryKey: ["ofp-block-status", farmId] });
      setOpen(false); setEditing(null); setForm({}); setPendingHistory([]); toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-block-status/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-block-status", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm({ status: "in-conversion" }); setPendingHistory([]); setOpen(true); };

  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setPendingHistory([]);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  const statusBadge = (status: string) => {
    if (status === "fully-organic") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />Fully Organic</span>;
    if (status === "in-conversion") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"><Clock className="w-3 h-3" />In Conversion</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{status}</span>;
  };

  const blockRows = blocks as Record<string, unknown>[];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Block Conversion Status</h3>
          <Button variant="outline" size="sm" onClick={() => printFpBlockStatusRegister(blockRows, farmName)} disabled={blockRows.length === 0} className="gap-1.5">
            <Printer className="h-4 w-4" />Print Register
          </Button>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" />Add Block
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (blocks as Record<string, unknown>[]).length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No block status records yet.</p>
      ) : (
        <div className="space-y-3">
          {(blocks as Record<string, unknown>[]).map((b, i) => {
            const progress = conversionProgress(b.conversionStartDate as string);
            const daysLeft = daysUntil(b.fullyOrganicDate as string);
            return (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{fmtRaw(b.blockName)}</p>
                      {statusBadge(String(b.status))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtRaw(b.certifyingBody)}</p>

                    {b.status === "in-conversion" && !!b.conversionStartDate && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Conversion progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                          <span>Started {fmt(b.conversionStartDate as string)}</span>
                          {!!b.fullyOrganicDate && <span>Full organic {fmt(b.fullyOrganicDate as string)} {daysLeft != null && daysLeft > 0 ? `(${daysLeft}d)` : ""}</span>}
                        </div>
                      </div>
                    )}
                    {b.status === "fully-organic" && !!b.fullyOrganicDate && (
                      <p className="text-xs text-green-700 mt-1">Certified organic from {fmt(b.fullyOrganicDate as string)}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(b)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(b.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewRecord && (() => {
        const linkedBlock = (growerBlocks as { id: number; blockName: string; fieldId?: number; fieldName?: string; fieldReference?: string; fieldIsNvz?: boolean; fieldIsOrganic?: boolean }[]).find(b => String(b.id) === String(viewRecord.blockId));
        return (
          <Dialog open onOpenChange={() => setViewRecord(null)}>
            <DialogContent style={{ maxWidth: "42rem", maxHeight: "90vh", overflowY: "auto" }}>
              <DialogHeader><DialogTitle>Block Conversion Details</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block Name</p><p className="font-medium">{fmtRaw(viewRecord.blockName)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmtRaw(viewRecord.status)}</p></div>
                {linkedBlock?.fieldId && (
                  <div className="col-span-2 bg-muted/40 rounded p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Parent Field</p>
                    <p className="font-medium">{linkedBlock.fieldName ?? "—"}{linkedBlock.fieldReference ? <span className="text-muted-foreground text-xs ml-1">({linkedBlock.fieldReference})</span> : null}</p>
                    <div className="flex gap-3 mt-1">
                      {linkedBlock.fieldIsNvz && <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">NVZ</span>}
                      {linkedBlock.fieldIsOrganic && <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Organic</span>}
                    </div>
                  </div>
                )}
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{fmtRaw(viewRecord.certifyingBody)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion Start</p><p className="font-medium">{fmt(viewRecord.conversionStartDate as string)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fully Organic Date</p><p className="font-medium">{fmt(viewRecord.fullyOrganicDate as string)}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Land Use Before</p><p className="font-medium">{fmtRaw(viewRecord.landUseBeforeConversion)}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
                {!!viewRecord.id && <SyntheticHistoryPanel farmId={farmId} blockStatusId={viewRecord.id as number} />}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setPendingHistory([]); save.reset(); } }}>
        <DialogContent style={{ maxWidth: "40rem", maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Block Status" : "Add Block Conversion Record"}</DialogTitle>
            <DialogDescription>Track the organic conversion status of a growing block.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Block Name *</Label>
              <Input value={form.blockName ?? ""} onChange={e => setForm(f => ({ ...f, blockName: e.target.value }))} />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Label>Link to Growing Block</Label>
                <span title="Optionally link this record to a named growing block already set up in your system. Selecting one auto-fills the block name and enables cross-referencing with spray records, harvests, and input logs." className="cursor-help">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </span>
              </div>
              <Select value={form.blockId ?? ""} onValueChange={v => {
                const bl = (growerBlocks as { id: number; blockName: string }[]).find(b => String(b.id) === v);
                setForm(f => ({ ...f, blockId: v, blockName: f.blockName || (bl?.blockName ?? "") }));
              }}>
                <SelectTrigger><SelectValue placeholder="Optional — auto-fills name" /></SelectTrigger>
                <SelectContent>{(growerBlocks as { id: number; blockName: string }[]).map(b => <SelectItem key={b.id} value={String(b.id)}>{b.blockName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "in-conversion"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-conversion">In Conversion</SelectItem>
                  <SelectItem value="fully-organic">Fully Organic</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certifying Body</Label>
              <Select value={form.certifyingBody ?? ""} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soil Association">Soil Association</SelectItem>
                  <SelectItem value="OF&G">OF&G (Organic Farmers &amp; Growers)</SelectItem>
                  <SelectItem value="Biodynamic Association">Biodynamic Association</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Conversion Start Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.conversionStartDate ?? ""} onChange={e => setForm(f => ({ ...f, conversionStartDate: e.target.value }))} /></div>
            <div><Label>Fully Organic Date</Label><Input type="date" value={form.fullyOrganicDate ?? ""} onChange={e => setForm(f => ({ ...f, fullyOrganicDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Land Use Before Conversion</Label><Input value={form.landUseBeforeConversion ?? ""} onChange={e => setForm(f => ({ ...f, landUseBeforeConversion: e.target.value }))} placeholder="e.g. Conventional arable, intensive vegetable production" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            {editing?.id
              ? <SyntheticHistoryPanel farmId={farmId} blockStatusId={editing.id as number} />
              : <SyntheticHistoryPanel
                  farmId={farmId}
                  localEntries={pendingHistory}
                  onLocalAdd={e => setPendingHistory(h => [...h, e])}
                  onLocalRemove={idx => setPendingHistory(h => h.filter((_, i) => i !== idx))}
                />
            }
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setPendingHistory([]); }}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.blockName}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Input Log Tab ───────────────────────────────────────────────────────────

function InputLogTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ ...EMPTY_INPUT_FORM });
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "ofp-input-log", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["ofp-input-log", farmId, yearFilter],
    queryFn: () => {
      const url = yearFilter === "all"
        ? api(`farms/${farmId}/organic-fp-input-log`)
        : api(`farms/${farmId}/organic-fp-input-log?cropYear=${yearFilter}`);
      return fetch(url, { credentials: "include" }).then(r => r.json());
    },
  });

  const { data: growerBlocks = [] } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: suppliersData } = useQuery<{ records?: { id: number; name: string }[] }>({
    queryKey: ["suppliers-lookup", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => r.ok ? r.json() : { records: [] }),
  });
  const supplierNames: string[] = useMemo(
    () => (suppliersData?.records ?? []).map((s) => s.name).filter(Boolean),
    [suppliersData],
  );

  const { data: membersData } = useQuery<{ members?: { firstName: string; lastName: string }[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/members`), { credentials: "include" }).then(r => r.json()),
  });
  const staffNames: string[] = useMemo(
    () => (membersData?.members ?? []).map((m) => `${m.firstName} ${m.lastName}`.trim()).filter(Boolean),
    [membersData],
  );

  const allRows: Record<string, unknown>[] = useMemo(
    () => (Array.isArray(logs) ? logs : (logs as { records?: unknown[] }).records ?? []) as Record<string, unknown>[],
    [logs],
  );

  const poSuggestions: string[] = useMemo(() => {
    if (!form.supplier) return [];
    return [...new Set(
      allRows
        .filter(r => r.supplier === form.supplier && r.poReference)
        .map(r => String(r.poReference))
    )];
  }, [allRows, form.supplier]);

  const grnSuggestions: string[] = useMemo(() => {
    if (!form.supplier) return [];
    return [...new Set(
      allRows
        .filter(r => r.supplier === form.supplier && r.grnReference)
        .map(r => String(r.grnReference))
    )];
  }, [allRows, form.supplier]);

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-input-log/${editing.id}`) : api(`farms/${farmId}/organic-fp-input-log`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-input-log", farmId] });
      setOpen(false); setEditing(null); setForm({ ...EMPTY_INPUT_FORM });
      toast({ title: "Input saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-input-log/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-input-log", farmId] }); toast({ title: "Input deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(r: Record<string, unknown>) {
    setEditing(r);
    setForm({
      applicationDate: (r.applicationDate as string)?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      cropYear: r.cropYear != null ? Number(r.cropYear) : new Date().getFullYear(),
      blockId: r.blockId != null ? String(r.blockId) : "",
      inputName: (r.inputName as string) ?? "",
      inputType: (r.inputType as string) ?? "",
      approvalStatus: (r.approvalStatus as string) ?? "permitted",
      certifierApprovalRef: (r.certifierApprovalRef as string) ?? "",
      approvedByBody: (r.approvedByBody as string) ?? "",
      supplier: (r.supplier as string) ?? "",
      poReference: (r.poReference as string) ?? "",
      grnReference: (r.grnReference as string) ?? "",
      quantityApplied: r.quantityApplied != null ? String(r.quantityApplied) : "",
      quantityUnit: (r.quantityUnit as string) ?? "kg",
      purposeOfUse: (r.purposeOfUse as string) ?? "",
      appliedBy: (r.appliedBy as string) ?? "",
      notes: (r.notes as string) ?? "",
    });
    setOpen(true);
  }

  const rows = allRows;
  const blocks = growerBlocks as { id: number; blockName: string }[];
  const blockName = (id: unknown) => blocks.find(b => String(b.id) === String(id))?.blockName ?? "—";

  const permitted = useMemo(() => rows.filter(r => r.approvalStatus === "permitted" || (!r.approvalStatus && r.isApproved)).length, [rows]);
  const restricted = useMemo(() => rows.filter(r => r.approvalStatus === "restricted").length, [rows]);
  const derogation = useMemo(() => rows.filter(r => r.approvalStatus === "derogation").length, [rows]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-green-50 border-green-200 px-4 py-3 text-sm text-green-800 space-y-1.5">
        <div className="flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-semibold">Input log — fresh produce &amp; horticultural organic inputs only</span>
        </div>
        <p className="text-green-700">Record every input applied to organic horticultural blocks — fertilisers, crop protection, seed treatments, and cleaning products. This is your evidence register for annual certification inspection.</p>
        <p className="text-green-700 text-xs border-t border-green-200 pt-1.5">For other enterprise types: arable and general farm inputs belong in <em>Organic Compliance → Input Register</em>; vineyard inputs belong in <em>Organic Viticulture → Organic Inputs</em>; livestock feed records belong in <em>Organic Livestock → Feed Records</em>. Recording the same input in multiple places causes duplication in your audit trail.</p>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
          >
            <option value="all">All years</option>
            {yearRange().map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {rows.length > 0 && (
            <div className="flex gap-3 text-xs pl-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{permitted} permitted</span>
              {restricted > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{restricted} restricted</span>}
              {derogation > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{derogation} derogation</span>}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => printFpInputLog(rows, farmName, yearFilter === "all" ? "All Years" : String(yearFilter))} disabled={rows.length === 0} className="gap-1.5">
            <Printer className="h-4 w-4" />Print Input Log
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ ...EMPTY_INPUT_FORM }); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Input
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : rows.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <Package className="w-8 h-8 mx-auto text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground italic">No input records{yearFilter !== "all" ? ` for ${yearFilter}` : ""} yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const status = (row.approvalStatus as string) ?? (row.isApproved ? "permitted" : "restricted");
            const statusColor = APPROVAL_STATUS_COLORS[status] ?? APPROVAL_STATUS_COLORS.permitted;
            return (
              <div key={i} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Package className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="font-semibold text-sm">{fmtRaw(row.inputName)}</span>
                      {!!row.inputType && <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{fmtRaw(row.inputType)}</span>}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {APPROVAL_STATUS_LABELS[status] ?? status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                      {!!row.applicationDate && <span>{fmt(row.applicationDate as string)}</span>}
                      {!!row.blockId && <span>Block: {blockName(row.blockId)}</span>}
                      {!!row.supplier && <span>Supplier: {fmtRaw(row.supplier)}</span>}
                      {!!row.quantityApplied && <span>Qty: {fmtRaw(row.quantityApplied)}{row.quantityUnit ? ` ${fmtRaw(row.quantityUnit)}` : ""}</span>}
                      {!!row.approvedByBody && <span>Certifier: {fmtRaw(row.approvedByBody)}</span>}
                    </div>
                    {!!(row.poReference || row.grnReference) && (
                      <div className="text-xs text-muted-foreground flex gap-3 mt-0.5">
                        {!!row.poReference && <span>PO: {fmtRaw(row.poReference)}</span>}
                        {!!row.grnReference && <span>GRN: {fmtRaw(row.grnReference)}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewRecord(row)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del.mutate(row.id as number)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Input Log Entry</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product / Substance</p><p className="font-medium">{fmtRaw(viewRecord.inputName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Input Type</p><p className="font-medium">{fmtRaw(viewRecord.inputType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Approval Status</p>
                <p className="font-medium">{APPROVAL_STATUS_LABELS[(viewRecord.approvalStatus as string)] ?? fmtRaw(viewRecord.approvalStatus)}</p>
              </div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Approval Ref</p><p className="font-medium">{fmtRaw(viewRecord.certifierApprovalRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Approved by Body</p><p className="font-medium">{fmtRaw(viewRecord.approvedByBody)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p><p className="font-medium">{fmtRaw(viewRecord.supplier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Order</p><p className="font-medium">{fmtRaw(viewRecord.poReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">GRN / Delivery Note</p><p className="font-medium">{fmtRaw(viewRecord.grnReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Application Date</p><p className="font-medium">{fmt(viewRecord.applicationDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop Year</p><p className="font-medium">{fmtRaw(viewRecord.cropYear)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Growing Block</p><p className="font-medium">{blockName(viewRecord.blockId)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p>
                <p className="font-medium">{viewRecord.quantityApplied ? `${fmtRaw(viewRecord.quantityApplied)} ${fmtRaw(viewRecord.quantityUnit)}` : "—"}</p>
              </div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purpose of Use</p><p className="font-medium">{fmtRaw(viewRecord.purposeOfUse)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Applied By</p><p className="font-medium">{fmtRaw(viewRecord.appliedBy)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); save.reset(); } }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Input Record" : "Log Organic Input"}</DialogTitle>
            <DialogDescription>Record an input applied to organic blocks — this forms your evidence register for annual inspection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

            {/* Substance */}
            <div>
              <Label>Product / Substance Name *</Label>
              <SubstancePicker
                value={form.inputName}
                onSelect={(substance, autoType) => setForm(f => ({ ...f, inputName: substance, inputType: autoType || f.inputType }))}
              />
            </div>

            {/* Type + Block */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Input Type</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.inputType}
                  onChange={e => setForm(f => ({ ...f, inputType: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {INPUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Growing Block</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.blockId}
                  onChange={e => setForm(f => ({ ...f, blockId: e.target.value }))}
                >
                  <option value="">— None —</option>
                  {blocks.map(b => <option key={b.id} value={String(b.id)}>{b.blockName}</option>)}
                </select>
              </div>
            </div>

            {/* Approval status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Approval Status *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.approvalStatus}
                  onChange={e => setForm(f => ({ ...f, approvalStatus: e.target.value }))}
                >
                  <option value="permitted">Permitted</option>
                  <option value="restricted">Restricted (notify certifier)</option>
                  <option value="derogation">Derogation Required</option>
                </select>
              </div>
              {(form.approvalStatus === "restricted" || form.approvalStatus === "derogation") && (
                <div>
                  <Label>Certifier Approval Ref</Label>
                  <Input value={form.certifierApprovalRef} onChange={e => setForm(f => ({ ...f, certifierApprovalRef: e.target.value }))} placeholder="Reference number" />
                </div>
              )}
              {form.approvalStatus === "permitted" && (
                <div>
                  <Label>Approved by Certifying Body</Label>
                  <Input value={form.approvedByBody} onChange={e => setForm(f => ({ ...f, approvedByBody: e.target.value }))} placeholder="e.g. Soil Association, OF&G" />
                </div>
              )}
            </div>

            {/* Supplier / PO / GRN */}
            <datalist id="input-supplier-list">
              {supplierNames.map(n => <option key={n} value={n} />)}
            </datalist>
            <datalist id="input-po-list">
              {poSuggestions.map(p => <option key={p} value={p} />)}
            </datalist>
            <datalist id="input-grn-list">
              {grnSuggestions.map(g => <option key={g} value={g} />)}
            </datalist>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Supplier</Label>
                <Input
                  list="input-supplier-list"
                  value={form.supplier}
                  onChange={e => setForm(f => ({ ...f, supplier: e.target.value, poReference: "", grnReference: "" }))}
                  placeholder={supplierNames.length > 0 ? "Search or type supplier…" : "Supplier name"}
                />
                {supplierNames.length === 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Add suppliers in the Suppliers module to enable the lookup.
                  </p>
                )}
              </div>
              <div>
                <Label>Purchase Order Ref</Label>
                <Input
                  list="input-po-list"
                  value={form.poReference}
                  onChange={e => setForm(f => ({ ...f, poReference: e.target.value }))}
                  placeholder={form.supplier && poSuggestions.length > 0 ? "Pick or type PO…" : "PO number"}
                  disabled={false}
                />
                {form.supplier && poSuggestions.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">{poSuggestions.length} PO ref{poSuggestions.length !== 1 ? "s" : ""} on file for this supplier</p>
                )}
              </div>
              <div>
                <Label>GRN / Delivery Note</Label>
                <Input
                  list="input-grn-list"
                  value={form.grnReference}
                  onChange={e => setForm(f => ({ ...f, grnReference: e.target.value }))}
                  placeholder={form.supplier && grnSuggestions.length > 0 ? "Pick or type GRN…" : "GRN number"}
                />
                {form.supplier && grnSuggestions.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">{grnSuggestions.length} GRN ref{grnSuggestions.length !== 1 ? "s" : ""} on file for this supplier</p>
                )}
              </div>
            </div>

            {/* Date / Year / Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Application Date *</Label>
                <Input type="date" value={form.applicationDate} onChange={e => setForm(f => ({ ...f, applicationDate: e.target.value }))} />
              </div>
              <div>
                <Label>Crop Year</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.cropYear}
                  onChange={e => setForm(f => ({ ...f, cropYear: parseInt(e.target.value) }))}
                >
                  {yearRange().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity Applied</Label>
                <Input type="number" value={form.quantityApplied} onChange={e => setForm(f => ({ ...f, quantityApplied: e.target.value }))} placeholder="Amount" />
              </div>
              <div>
                <Label>Unit</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.quantityUnit}
                  onChange={e => setForm(f => ({ ...f, quantityUnit: e.target.value }))}
                >
                  {QUANTITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Purpose / Applied By */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Purpose of Use</Label>
                <Input value={form.purposeOfUse} onChange={e => setForm(f => ({ ...f, purposeOfUse: e.target.value }))} placeholder="e.g. Slug control, foliar feed" />
              </div>
              <div>
                <Label>Applied By</Label>
                <StaffSelect value={form.appliedBy} onChange={v => setForm(f => ({ ...f, appliedBy: v }))} staffNames={staffNames} />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>

          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button
              onClick={() => save.mutate(form as unknown as Record<string, unknown>)}
              disabled={save.isPending || !form.applicationDate || !form.inputName.trim()}
            >
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Certificates Tab ────────────────────────────────────────────────────────

function CertificatesTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [raiseTaskFor, setRaiseTaskFor] = useState<{ title: string; description: string; dueDate?: string } | null>(null);

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["ofp-certificates", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp-certificates`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-certificates/${editing.id}`) : api(`farms/${farmId}/organic-fp-certificates`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-certificates", farmId] }); setOpen(false); setEditing(null); setForm({}); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-certificates/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-certificates", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Organic Certificates</h3>
          <Button variant="outline" size="sm" onClick={() => printFpCertificates(certs as Record<string, unknown>[], farmName)} disabled={(certs as Record<string, unknown>[]).length === 0} className="gap-1.5">
            <Printer className="h-4 w-4" />Print List
          </Button>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ status: "active" }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Certificate
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (certs as Record<string, unknown>[]).length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No certificates recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {(certs as Record<string, unknown>[]).map((c, i) => {
            const days = daysUntil(c.annualRenewalDue as string);
            const expiring = days != null && days <= 60 && days >= 0;
            const expired = days != null && days < 0;
            return (
              <Card key={i} className={`p-4 ${expired ? "border-red-300 bg-red-50" : expiring ? "border-amber-300 bg-amber-50" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{fmtRaw(c.certifyingBody)}</p>
                      <span className="text-xs font-mono text-muted-foreground">{fmtRaw(c.certificateNumber)}</span>
                      {c.status === "active" && !expired
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle2 className="inline w-3 h-3 mr-0.5" />Active</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">Expired / Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtRaw(c.scope)}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Issued {fmt(c.issueDate as string)}</span>
                      {!!c.expiryDate && <span>Expires {fmt(c.expiryDate as string)}</span>}
                      {!!c.annualRenewalDue && (
                        <span className={expired ? "text-red-600 font-semibold" : expiring ? "text-amber-700 font-semibold" : ""}>
                          Renewal due {fmt(c.annualRenewalDue as string)}
                          {expiring && ` (${days}d)`}
                          {expired && " — OVERDUE"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!!(c.annualRenewalDue || c.expiryDate) && (
                      <Button size="icon" variant="ghost" title="Raise task" onClick={() => setRaiseTaskFor({ title: `Organic Certificate ${c.annualRenewalDue ? "Renewal Due" : "Expiring"} — ${c.certifyingBody ?? ""}`, description: `The organic fresh produce certificate${c.certifyingBody ? ` from ${String(c.certifyingBody)}` : ""} ${c.annualRenewalDue ? "annual renewal is due" : "is due to expire"}. Update in Organic Fresh Produce → Certificates.`, dueDate: (c.annualRenewalDue ?? c.expiryDate) as string | undefined })}>
                        <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(c)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(c.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Certificate Details</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{fmtRaw(viewRecord.certifyingBody)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate No.</p><p className="font-mono text-sm">{fmtRaw(viewRecord.certificateNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Issue Date</p><p className="font-medium">{fmt(viewRecord.issueDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry Date</p><p className="font-medium">{fmt(viewRecord.expiryDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Renewal Due</p><p className="font-medium">{fmt(viewRecord.annualRenewalDue as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmtRaw(viewRecord.status)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope</p><p className="font-medium">{fmtRaw(viewRecord.scope)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Products Included</p><p className="font-medium">{fmtRaw(viewRecord.productsIncluded)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Document Reference</p><p className="font-medium">{fmtRaw(viewRecord.documentRef)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); save.reset(); } }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Certificate" : "Add Organic Certificate"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Certifying Body *</Label>
              <Select value={form.certifyingBody ?? ""} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soil Association">Soil Association</SelectItem>
                  <SelectItem value="OF&G">OF&G</SelectItem>
                  <SelectItem value="Biodynamic Association">Biodynamic Association</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number *</Label><Input value={form.certificateNumber ?? ""} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Issue Date *</Label><Input type="date" value={form.issueDate ?? ""} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate ?? ""} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            <div><Label>Annual Renewal Due</Label><Input type="date" value={form.annualRenewalDue ?? ""} onChange={e => setForm(f => ({ ...f, annualRenewalDue: e.target.value }))} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Scope</Label><Input value={form.scope ?? ""} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} placeholder="e.g. Fresh vegetables and salads" /></div>
            <div><Label>Products Included</Label><Input value={form.productsIncluded ?? ""} onChange={e => setForm(f => ({ ...f, productsIncluded: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Document Reference</Label><Input value={form.documentRef ?? ""} onChange={e => setForm(f => ({ ...f, documentRef: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.certifyingBody || !form.certificateNumber || !form.issueDate}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Fresh Produce"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}
    </div>
  );
}

// ─── Buyer Declarations Tab ──────────────────────────────────────────────────

function BuyerDeclarationsTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: decls = [], isLoading } = useQuery({
    queryKey: ["ofp-buyer-decls", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp-buyer-declarations`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-buyer-declarations/${editing.id}`) : api(`farms/${farmId}/organic-fp-buyer-declarations`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-buyer-decls", farmId] }); setOpen(false); setEditing(null); setForm({}); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-buyer-declarations/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-buyer-decls", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Buyer Organic Declarations</h3>
          <Button variant="outline" size="sm" onClick={() => printFpBuyerDeclarations(decls as Record<string, unknown>[], farmName)} disabled={(decls as Record<string, unknown>[]).length === 0} className="gap-1.5">
            <Printer className="h-4 w-4" />Print Log
          </Button>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Declaration
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (decls as Record<string, unknown>[]).length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No buyer declarations recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Buyer</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Qty (kg)</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Cert Body</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(decls as Record<string, unknown>[]).map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-4">{fmt(row.declarationDate as string)}</td>
                  <td className="py-2 pr-4 font-medium">{fmtRaw(row.buyerName)}</td>
                  <td className="py-2 pr-4">{fmtRaw(row.productDescription)}</td>
                  <td className="py-2 pr-4">{fmtRaw(row.quantityKg)}</td>
                  <td className="py-2 pr-4">{fmtRaw(row.certifyingBody)}</td>
                  <td className="py-2 text-right space-x-1 whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(row)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(row.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Buyer Declaration</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Declaration Date</p><p className="font-medium">{fmt(viewRecord.declarationDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer Name</p><p className="font-medium">{fmtRaw(viewRecord.buyerName)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer Address</p><p className="font-medium">{fmtRaw(viewRecord.buyerAddress)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Description</p><p className="font-medium">{fmtRaw(viewRecord.productDescription)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity (kg)</p><p className="font-medium">{fmtRaw(viewRecord.quantityKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{fmtRaw(viewRecord.certifyingBody)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Number</p><p className="font-mono text-sm">{fmtRaw(viewRecord.certificateNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Declared By</p><p className="font-medium">{fmtRaw(viewRecord.declaredBy)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); save.reset(); } }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Declaration" : "Add Buyer Organic Declaration"}</DialogTitle>
            <DialogDescription>Record a declaration that produce supplied to this buyer was grown organically.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Declaration Date *</Label><Input type="date" value={form.declarationDate ?? ""} onChange={e => setForm(f => ({ ...f, declarationDate: e.target.value }))} /></div>
            <div><Label>Buyer Name *</Label><Input value={form.buyerName ?? ""} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Buyer Address</Label><Input value={form.buyerAddress ?? ""} onChange={e => setForm(f => ({ ...f, buyerAddress: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Product Description *</Label><Input value={form.productDescription ?? ""} onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))} placeholder="e.g. Organic winter lettuce, variety Romaine" /></div>
            <div><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg ?? ""} onChange={e => setForm(f => ({ ...f, quantityKg: e.target.value }))} /></div>
            <div>
              <Label>Certifying Body</Label>
              <Select value={form.certifyingBody ?? ""} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soil Association">Soil Association</SelectItem>
                  <SelectItem value="OF&G">OF&G</SelectItem>
                  <SelectItem value="Biodynamic Association">Biodynamic Association</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number</Label><Input value={form.certificateNumber ?? ""} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Declared By</Label><Input value={form.declaredBy ?? ""} onChange={e => setForm(f => ({ ...f, declaredBy: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.declarationDate || !form.buyerName || !form.productDescription}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Input Derogations Tab ───────────────────────────────────────────────────

type FpDerogCase = {
  id: number;
  inputName: string;
  inputType: string;
  regulatoryBasis: string | null;
  certifier: string | null;
  certifierRef: string | null;
  internalDecisionDate: string | null;
  availabilitySearchDate: string | null;
  availabilitySearchRef: string | null;
  applicationDate: string | null;
  decisionDate: string | null;
  status: string;
  approvalConditions: string | null;
  expiryDate: string | null;
  cropYear: number | null;
  justification: string | null;
  rejectionReason: string | null;
  rejectionRef: string | null;
  correctiveAction: string | null;
  notes: string | null;
  createdAt: string;
};

type FpDerogCorrespondence = {
  id: number;
  derogationId: number;
  correspondenceDate: string;
  direction: string;
  correspondenceType: string;
  summary: string;
  reference: string | null;
  notes: string | null;
};

type FpDerogDocument = {
  id: number;
  fileName: string;
  fileSize: number | null;
  fileKey: string;
  fileUrl: string;
  notes: string | null;
  uploadedAt: string;
};

const FP_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  withdrawn: "Withdrawn",
};

const FP_STATUS_COLOURS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-800 border-yellow-300",
  approved: "bg-green-50 text-green-800 border-green-300",
  rejected: "bg-red-50 text-red-800 border-red-300",
  expired: "bg-gray-100 text-gray-600 border-gray-300",
  withdrawn: "bg-slate-50 text-slate-600 border-slate-300",
};

const FP_INPUT_TYPES = ["Seed", "Pesticide / Crop Protection", "Fertiliser / Soil Amendment", "Cleaning Product", "Other"];
const FP_CERTIFIERS = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Organic Food Federation", "Biodynamic Association", "Other"];
const FP_CORRESPONDENCE_TYPES = ["Application to Certifier", "Availability Search Evidence", "Supporting Evidence", "Certifier Query", "Approval Letter", "Rejection Notice", "Conditions Letter", "Renewal Request", "Other"];
const FP_DOCUMENT_TYPES = ["Availability Search Evidence", "Application Letter", "Supporting Evidence", "Approval / Decision Letter", "Conditions Letter", "Rejection Notice", "Photographs", "Other"];

const EMPTY_FP_CASE_FORM = {
  inputName: "", inputType: "Seed", regulatoryBasis: "UK Organic Regulations 2020 — Schedule 1 / Annex II",
  certifier: "", certifierRef: "", internalDecisionDate: "", availabilitySearchDate: "", availabilitySearchRef: "",
  applicationDate: "", decisionDate: "", status: "pending", approvalConditions: "",
  expiryDate: "", cropYear: new Date().getFullYear(), justification: "", rejectionReason: "", rejectionRef: "", correctiveAction: "", notes: "",
};

const EMPTY_FP_CORRESP_FORM = {
  correspondenceDate: new Date().toISOString().slice(0, 10), direction: "outbound",
  correspondenceType: "Application to Certifier", summary: "", reference: "", notes: "",
};

function FpDerogStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${FP_STATUS_COLOURS[status] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}>
      {FP_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function FpDaysRemaining({ dateStr }: { dateStr: string | null | undefined }) {
  const d = daysUntil(dateStr);
  if (d === null) return null;
  if (d < 0) return <span className="text-xs font-medium text-red-700">Expired {Math.abs(d)}d ago</span>;
  if (d <= 14) return <span className="text-xs font-medium text-red-700">Expires in {d}d</span>;
  if (d <= 60) return <span className="text-xs font-medium text-amber-700">Expires in {d}d</span>;
  return <span className="text-xs text-muted-foreground">Expires {fmt(dateStr)}</span>;
}


// ─── FP Record Decision Dialog ────────────────────────────────────────────────
function FpRecordDecisionDialog({ farmId, derogCase, onClose, onSaved }: {
  farmId: number; derogCase: FpDerogCase; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = React.useState("approved");
  const [decisionDate, setDecisionDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [certifierRef, setCertifierRef] = React.useState(derogCase.certifierRef ?? "");
  const [approvalConditions, setApprovalConditions] = React.useState(derogCase.approvalConditions ?? "");
  const [expiryDate, setExpiryDate] = React.useState(derogCase.expiryDate ?? "");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [rejectionRef, setRejectionRef] = React.useState("");
  const mut = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-fp/input-derogations/${derogCase.id}`), {
      method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ ...derogCase, status, decisionDate: decisionDate || null, certifierRef: certifierRef || null, approvalConditions: approvalConditions || null, expiryDate: expiryDate || null, rejectionReason: rejectionReason || null, rejectionRef: rejectionRef || null }),
    }).then(r => { if (!r.ok) throw new Error("Failed"); }),
    onSuccess: () => { onSaved(); toast({ title: "Decision recorded" }); onClose(); },
    onError: () => toast({ title: "Error saving decision", variant: "destructive" }),
  });
  return (
    <Dialog open onOpenChange={o => { if (!o) { onClose(); mut.reset(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Certifier Decision</DialogTitle>
          <DialogDescription>{derogCase.inputName} — decision from {derogCase.certifier ?? "certifying body"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Decision *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn (by applicant)</SelectItem>
                  <SelectItem value="expired">Expired — no decision received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Decision Date *</Label><Input type="date" className="mt-1" value={decisionDate} onChange={e => setDecisionDate(e.target.value)} /></div>
          </div>
          {status === "approved" && (
            <>
              <div><Label>Certifier Reference No.</Label><Input className="mt-1" value={certifierRef} onChange={e => setCertifierRef(e.target.value)} placeholder="Reference from certifying body" /></div>
              <div><Label>Approval Conditions</Label><Textarea className="mt-1" value={approvalConditions} onChange={e => setApprovalConditions(e.target.value)} rows={2} placeholder="Any conditions attached to the approval…" /></div>
              <div><Label>Expiry Date</Label><Input type="date" className="mt-1" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
            </>
          )}
          {status === "rejected" && (
            <>
              <div><Label>Rejection Reason</Label><Textarea className="mt-1" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={2} placeholder="Certifier's stated reason for refusing the derogation" /></div>
              <div><Label>Rejection Reference</Label><Input className="mt-1" value={rejectionRef} onChange={e => setRejectionRef(e.target.value)} placeholder="Certifier's reference for the rejection notice" /></div>
            </>
          )}
        </div>
        <DialogMutationError mutation={mut} message="Failed to save — your entries are still here." />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !decisionDate}>{mut.isPending ? "Saving…" : "Save Decision"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InputDerogationsTab({ farmId, farmName: _farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const [caseOpen, setCaseOpen] = React.useState(false);
  const [recordDecisionFor, setRecordDecisionFor] = React.useState<FpDerogCase | null>(null);
  const [editingCase, setEditingCase] = React.useState<FpDerogCase | null>(null);
  const [caseForm, setCaseForm] = React.useState({ ...EMPTY_FP_CASE_FORM });
  const [correspOpen, setCorrespOpen] = React.useState(false);
  const [correspCaseId, setCorrespCaseId] = React.useState<number | null>(null);
  const [editingCorresp, setEditingCorresp] = React.useState<FpDerogCorrespondence | null>(null);
  const [correspForm, setCorrespForm] = React.useState({ ...EMPTY_FP_CORRESP_FORM });
  const [uploadingCaseId, setUploadingCaseId] = React.useState<number | null>(null);
  const [uploadDocType, setUploadDocType] = React.useState("Availability Search Evidence");
  const [uploading, setUploading] = React.useState(false);
  const [correspondences, setCorrespondences] = React.useState<Record<number, FpDerogCorrespondence[]>>({});
  const [documents, setDocuments] = React.useState<Record<number, FpDerogDocument[]>>({});
  const [raiseTaskFor, setRaiseTaskFor] = React.useState<{ title: string; description: string; dueDate?: string } | null>(null);
  const [pendingDeleteCase, setPendingDeleteCase] = React.useState<number | null>(null);
  const [pendingDeleteCorresp, setPendingDeleteCorresp] = React.useState<{ id: number; caseId: number } | null>(null);
  const [pendingDeleteDoc, setPendingDeleteDoc] = React.useState<{ id: number; caseId: number } | null>(null);

  const { data: casesData, isLoading } = useQuery<{ cases: FpDerogCase[] }>({
    queryKey: ["ofp-input-derogations", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp/input-derogations`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const cases = casesData?.cases ?? [];

  async function loadCorrespDocs(caseId: number) {
    const [cr, dr] = await Promise.all([
      fetch(api(`farms/${farmId}/organic-fp/input-derogations/${caseId}/correspondence`), { credentials: "include" }).then(r => r.json()),
      fetch(api(`farms/${farmId}/organic-fp/input-derogations/${caseId}/documents`), { credentials: "include" }).then(r => r.json()),
    ]);
    setCorrespondences(p => ({ ...p, [caseId]: cr.items ?? [] }));
    setDocuments(p => ({ ...p, [caseId]: dr.items ?? [] }));
  }

  function toggleExpand(id: number) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    loadCorrespDocs(id);
  }

  const saveCase = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editingCase ? api(`farms/${farmId}/organic-fp/input-derogations/${editingCase.id}`) : api(`farms/${farmId}/organic-fp/input-derogations`),
      { method: editingCase ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-input-derogations", farmId] });
      setCaseOpen(false); setEditingCase(null); setCaseForm({ ...EMPTY_FP_CASE_FORM });
      toast({ title: editingCase ? "Case updated" : "Derogation case created" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteCase = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp/input-derogations/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-input-derogations", farmId] }); toast({ title: "Case deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const saveCorresp = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editingCorresp
        ? api(`farms/${farmId}/organic-fp/input-derogation-correspondence/${editingCorresp.id}`)
        : api(`farms/${farmId}/organic-fp/input-derogations/${correspCaseId}/correspondence`),
      { method: editingCorresp ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      if (correspCaseId) loadCorrespDocs(correspCaseId);
      setCorrespOpen(false); setEditingCorresp(null); setCorrespForm({ ...EMPTY_FP_CORRESP_FORM });
      toast({ title: "Correspondence saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteCorresp = useMutation({
    mutationFn: ({ id, caseId }: { id: number; caseId: number }) =>
      fetch(api(`farms/${farmId}/organic-fp/input-derogation-correspondence/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })
        .then(() => { loadCorrespDocs(caseId); }),
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const deleteDoc = useMutation({
    mutationFn: ({ id, caseId }: { id: number; caseId: number }) =>
      fetch(api(`farms/${farmId}/organic-fp/input-derogation-documents/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })
        .then(() => { loadCorrespDocs(caseId); }),
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  async function handleUpload(caseId: number, file: File) {
    setUploading(true);
    try {
      const presign = await fetch("/api/storage/uploads/request-url", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ fileName: file.name, contentType: file.type, recordType: "organic_fp_derogation" }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
      await fetch(presign.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      await fetch(api(`farms/${farmId}/organic-fp/input-derogations/${caseId}/documents`), {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ fileKey: presign.storageKey ?? presign.fileKey, fileName: file.name, fileSize: file.size, documentType: uploadDocType, mimeType: file.type }),
      });
      loadCorrespDocs(caseId);
      setUploadingCaseId(null);
      toast({ title: "Document uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const pending = cases.filter(c => c.status === "pending").length;
  const approved = cases.filter(c => c.status === "approved").length;
  const rejected = cases.filter(c => c.status === "rejected").length;
  const expired = cases.filter(c => c.status === "expired").length;
  const withdrawn = cases.filter(c => c.status === "withdrawn").length;

  function openNewCase() { setEditingCase(null); setCaseForm({ ...EMPTY_FP_CASE_FORM, cropYear: new Date().getFullYear() }); setCaseOpen(true); }
  function openEditCase(c: FpDerogCase) {
    setEditingCase(c);
    setCaseForm({
      inputName: c.inputName, inputType: c.inputType, regulatoryBasis: c.regulatoryBasis ?? "",
      certifier: c.certifier ?? "", certifierRef: c.certifierRef ?? "",
      internalDecisionDate: c.internalDecisionDate?.slice(0, 10) ?? "",
      availabilitySearchDate: c.availabilitySearchDate?.slice(0, 10) ?? "",
      availabilitySearchRef: c.availabilitySearchRef ?? "",
      applicationDate: c.applicationDate?.slice(0, 10) ?? "",
      decisionDate: c.decisionDate?.slice(0, 10) ?? "",
      status: c.status, approvalConditions: c.approvalConditions ?? "",
      expiryDate: c.expiryDate?.slice(0, 10) ?? "",
      cropYear: c.cropYear ?? new Date().getFullYear(),
      justification: c.justification ?? "",
      rejectionReason: c.rejectionReason ?? "",
      rejectionRef: c.rejectionRef ?? "",
      correctiveAction: c.correctiveAction ?? "",
      notes: c.notes ?? "",
    });
    setCaseOpen(true);
  }
  function openAddCorresp(caseId: number) {
    setCorrespCaseId(caseId); setEditingCorresp(null);
    setCorrespForm({ ...EMPTY_FP_CORRESP_FORM }); setCorrespOpen(true);
  }
  function openEditCorresp(c: FpDerogCorrespondence, caseId: number) {
    setCorrespCaseId(caseId); setEditingCorresp(c);
    setCorrespForm({
      correspondenceDate: c.correspondenceDate?.slice(0, 10) ?? "",
      direction: c.direction, correspondenceType: c.correspondenceType,
      summary: c.summary, reference: c.reference ?? "", notes: c.notes ?? "",
    });
    setCorrespOpen(true);
  }

  const cf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCaseForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-amber-50 border-amber-200 px-4 py-3 text-sm text-amber-800 flex gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Under the <strong>UK Organic Regulations 2020</strong>, certain inputs — including conventional seed where a certified organic equivalent is unavailable, and restricted crop protection substances — require <strong>prior written approval from your certification body</strong> before use. This register tracks each derogation application from submission through to the certifier's decision, correspondence log, and supporting documents.
        </span>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex flex-wrap gap-2 text-sm">
          {pending > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800"><Clock className="w-3 h-3" />{pending} Pending</span>}
          {approved > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 border border-green-200 text-green-800"><CheckCircle2 className="w-3 h-3" />{approved} Approved</span>}
          {rejected > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-800">{rejected} Rejected</span>}
          {expired > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-600">{expired} Expired</span>}
          {withdrawn > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">{withdrawn} Withdrawn</span>}
          {cases.length === 0 && !isLoading && <span className="text-muted-foreground">No derogation cases yet</span>}
        </div>
        <Button size="sm" onClick={openNewCase}><Plus className="h-4 w-4 mr-1" />Add Derogation Case</Button>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}

      <div className="space-y-3">
        {cases.map(c => {
          const isExp = expandedId === c.id;
          const corresp = correspondences[c.id] ?? [];
          const docs = documents[c.id] ?? [];
          return (
            <div key={c.id} className="rounded-md border bg-white">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(c.id)}
              >
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  <FpDerogStatusBadge status={c.status} />
                  <span className="font-medium truncate">{c.inputName}</span>
                  <span className="text-xs text-muted-foreground">{c.inputType}</span>
                  {c.cropYear && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.cropYear}</span>}
                  {c.certifier && <span className="text-xs text-muted-foreground hidden sm:inline">{c.certifier}</span>}
                  {c.expiryDate && c.status === "approved" && <FpDaysRemaining dateStr={c.expiryDate} />}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {c.status === "pending" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 gap-1" onClick={e => { e.stopPropagation(); setRecordDecisionFor(c); }}>
                      Record Decision
                    </Button>
                  )}
                  {(c.status === "rejected" && !c.correctiveAction) && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs border border-orange-300">Action Required</Badge>
                  )}
                  {c.expiryDate && c.status === "approved" && (
                  <Button variant="ghost" size="icon" title="Raise task" onClick={e => { e.stopPropagation(); setRaiseTaskFor({ title: `Organic Input Derogation Expiring — ${c.inputName}`, description: `The derogation approval for '${c.inputName}' is due to expire. Renew or confirm with your certifying body.`, dueDate: c.expiryDate ?? undefined }); }}>
                      <ClipboardList className="h-4 w-4 text-amber-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" title="Edit" onClick={e => { e.stopPropagation(); openEditCase(c); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Delete" onClick={e => { e.stopPropagation(); setPendingDeleteCase(c.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  <Eye className={`h-4 w-4 text-muted-foreground transition-transform ${isExp ? "opacity-70" : ""}`} />
                </div>
              </div>
              {isExp && (
                <div className="border-t px-4 pb-4 pt-3 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Input Type</p><p className="font-medium">{fmtRaw(c.inputType)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop Year</p><p className="font-medium">{fmtRaw(c.cropYear)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier</p><p className="font-medium">{fmtRaw(c.certifier)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Reference</p><p className="font-medium">{fmtRaw(c.certifierRef)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Application Date</p><p className="font-medium">{fmt(c.applicationDate)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Decision Date</p><p className="font-medium">{fmt(c.decisionDate)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry Date</p><p className="font-medium">{fmt(c.expiryDate)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Availability Search Date</p><p className="font-medium">{fmt(c.availabilitySearchDate)}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Availability Search Ref</p><p className="font-medium">{fmtRaw(c.availabilitySearchRef)}</p></div>
                    <div className="col-span-2 sm:col-span-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Regulatory Basis</p><p className="font-medium">{fmtRaw(c.regulatoryBasis)}</p></div>
                    {c.approvalConditions && <div className="col-span-2 sm:col-span-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Approval Conditions</p><p className="font-medium">{c.approvalConditions}</p></div>}
                    {c.justification && <div className="col-span-2 sm:col-span-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Justification</p><p className="font-medium">{c.justification}</p></div>}
                    {c.notes && <div className="col-span-2 sm:col-span-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{c.notes}</p></div>}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold">Correspondence Log ({corresp.length})</p>
                      <Button size="sm" variant="outline" onClick={() => openAddCorresp(c.id)}><Plus className="h-3 w-3 mr-1" />Add</Button>
                    </div>
                    {corresp.length === 0 && <p className="text-xs text-muted-foreground py-2">No correspondence recorded yet.</p>}
                    <div className="space-y-2">
                      {corresp.map(cr => (
                        <div key={cr.id} className="rounded-md border bg-muted/20 px-3 py-2 text-sm flex gap-3 items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{cr.correspondenceType}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${cr.direction === "inbound" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>{cr.direction === "inbound" ? "Received" : "Sent"}</span>
                              <span className="text-xs text-muted-foreground">{fmt(cr.correspondenceDate)}</span>
                              {cr.reference && <span className="text-xs text-muted-foreground">Ref: {cr.reference}</span>}
                            </div>
                            <p className="text-muted-foreground mt-1">{cr.summary}</p>
                            {cr.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{cr.notes}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => openEditCorresp(cr, c.id)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setPendingDeleteCorresp({ id: cr.id, caseId: c.id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold">Documents ({docs.length})</p>
                      <Button size="sm" variant="outline" onClick={() => setUploadingCaseId(uploadingCaseId === c.id ? null : c.id)}><Plus className="h-3 w-3 mr-1" />Upload</Button>
                    </div>
                    {uploadingCaseId === c.id && (
                      <div className="mb-3 rounded-md border bg-muted/20 p-3 space-y-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Document Type</Label>
                          <select className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm" value={uploadDocType} onChange={e => setUploadDocType(e.target.value)}>
                            {FP_DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <input type="file" className="text-sm" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(c.id, f); }} />
                        {uploading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Uploading…</p>}
                      </div>
                    )}
                    {docs.length === 0 && uploadingCaseId !== c.id && <p className="text-xs text-muted-foreground py-1">No documents uploaded yet.</p>}
                    <div className="space-y-1.5">
                      {docs.map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-sm rounded border bg-muted/20 px-3 py-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{d.fileName}</span>
                          {d.notes && <span className="text-xs text-muted-foreground shrink-0">{d.notes}</span>}
                          {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">View</a>}
                          <Button variant="ghost" size="icon" onClick={() => setPendingDeleteDoc({ id: d.id, caseId: c.id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={caseOpen} onOpenChange={v => { if (!v) { setCaseOpen(false); setEditingCase(null); saveCase.reset(); } }}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader>
            <DialogTitle>{editingCase ? "Edit Derogation Case" : "Add Derogation Case"}</DialogTitle>
            <DialogDescription>Record a substance requiring prior certifier approval under the UK Organic Regulations.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
            <div className="col-span-2 space-y-1">
              <Label>Input / Substance Name <span className="text-destructive">*</span></Label>
              <Input value={caseForm.inputName} onChange={cf("inputName")} placeholder="e.g. Conventional Spring Wheat Seed — Variety Skyfall" />
            </div>
            <div className="space-y-1">
              <Label>Input Type</Label>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={caseForm.inputType} onChange={e => setCaseForm(p => ({ ...p, inputType: e.target.value }))}>
                {FP_INPUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Crop Year</Label>
              <Input type="number" value={caseForm.cropYear} onChange={cf("cropYear")} />
            </div>
            <div className="space-y-1">
              <Label>Certifier</Label>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={caseForm.certifier} onChange={e => setCaseForm(p => ({ ...p, certifier: e.target.value }))}>
                <option value="">— Select —</option>
                {FP_CERTIFIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Certifier Reference</Label>
              <Input value={caseForm.certifierRef} onChange={cf("certifierRef")} placeholder="Certifier's reference for this approval" />
            </div>
            <div className="space-y-1">
              <Label>Availability Search Date</Label>
              <Input type="date" value={caseForm.availabilitySearchDate} onChange={cf("availabilitySearchDate")} />
            </div>
            <div className="space-y-1">
              <Label>Internal Decision Date</Label>
              <Input type="date" value={caseForm.internalDecisionDate} onChange={cf("internalDecisionDate")} />
              <p className="text-xs text-muted-foreground">Date the holding decided this input was needed.</p>
            </div>
            <div className="space-y-1">
              <Label>Availability Search Ref (OFAS / UKOAS)</Label>
              <Input value={caseForm.availabilitySearchRef} onChange={cf("availabilitySearchRef")} placeholder="Search reference number" />
            </div>
            <div className="space-y-1">
              <Label>Application Date</Label>
              <Input type="date" value={caseForm.applicationDate} onChange={cf("applicationDate")} />
            </div>
            <div className="space-y-1">
              <Label>Decision Date</Label>
              <Input type="date" value={caseForm.decisionDate} onChange={cf("decisionDate")} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={caseForm.status} onChange={e => setCaseForm(p => ({ ...p, status: e.target.value }))}>
                {Object.entries(FP_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Expiry Date</Label>
              <Input type="date" value={caseForm.expiryDate} onChange={cf("expiryDate")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Regulatory Basis</Label>
              <Input value={caseForm.regulatoryBasis} onChange={cf("regulatoryBasis")} placeholder="e.g. UK Organic Regulations 2020 — Schedule 1 / Annex II" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Justification (why organic alternative unavailable)</Label>
              <Textarea value={caseForm.justification} onChange={cf("justification")} rows={3} placeholder="Explain why no certified organic equivalent was available at the time of sourcing" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Approval Conditions</Label>
              <Textarea value={caseForm.approvalConditions} onChange={cf("approvalConditions")} rows={2} placeholder="Any conditions placed on the approval by the certifier" />
            </div>
            {(caseForm.status === "rejected") && (
              <>
                <div className="col-span-2 space-y-1">
                  <Label>Rejection Reason</Label>
                  <Textarea value={caseForm.rejectionReason} onChange={cf("rejectionReason")} rows={2} placeholder="Certifier's stated reason for refusing the derogation" />
                </div>
                <div className="space-y-1">
                  <Label>Rejection Reference</Label>
                  <Input value={caseForm.rejectionRef} onChange={cf("rejectionRef")} placeholder="Certifier's reference for the rejection notice" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Corrective Action Taken</Label>
                  <Textarea value={caseForm.correctiveAction} onChange={cf("correctiveAction")} rows={2} placeholder="What the farm did in response to rejection" />
                </div>
              </>
            )}
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={caseForm.notes} onChange={cf("notes")} rows={2} />
            </div>
          </div>
          <DialogMutationError mutation={saveCase} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseOpen(false)}>Cancel</Button>
            <Button onClick={() => saveCase.mutate(caseForm as unknown as Record<string, unknown>)} disabled={!caseForm.inputName || saveCase.isPending}>
              {saveCase.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {recordDecisionFor && (
        <FpRecordDecisionDialog
          farmId={farmId}
          derogCase={recordDecisionFor}
          onClose={() => setRecordDecisionFor(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["ofp-input-derogations", farmId] })}
        />
      )}

      <Dialog open={correspOpen} onOpenChange={v => { if (!v) { setCorrespOpen(false); setEditingCorresp(null); saveCorresp.reset(); } }}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader>
            <DialogTitle>{editingCorresp ? "Edit Correspondence" : "Add Correspondence"}</DialogTitle>
            <DialogDescription>Log a communication with your certifier regarding this derogation application.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <Label>Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={correspForm.correspondenceDate} onChange={e => setCorrespForm(p => ({ ...p, correspondenceDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Direction</Label>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={correspForm.direction} onChange={e => setCorrespForm(p => ({ ...p, direction: e.target.value }))}>
                <option value="outbound">Outbound (sent to certifier)</option>
                <option value="inbound">Inbound (received from certifier)</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Type <span className="text-destructive">*</span></Label>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={correspForm.correspondenceType} onChange={e => setCorrespForm(p => ({ ...p, correspondenceType: e.target.value }))}>
                {FP_CORRESPONDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Summary <span className="text-destructive">*</span></Label>
              <Textarea value={correspForm.summary} onChange={e => setCorrespForm(p => ({ ...p, summary: e.target.value }))} rows={3} placeholder="Brief description of the content" />
            </div>
            <div className="space-y-1">
              <Label>Reference</Label>
              <Input value={correspForm.reference} onChange={e => setCorrespForm(p => ({ ...p, reference: e.target.value }))} placeholder="Certifier ref or ticket no." />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input value={correspForm.notes} onChange={e => setCorrespForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogMutationError mutation={saveCorresp} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrespOpen(false)}>Cancel</Button>
            <Button onClick={() => saveCorresp.mutate(correspForm as unknown as Record<string, unknown>)} disabled={!correspForm.summary || !correspForm.correspondenceDate || saveCorresp.isPending}>
              {saveCorresp.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Fresh Produce"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}

      <ConfirmDialog
        open={pendingDeleteCase !== null}
        title="Delete Derogation Case"
        message="Delete this derogation case and all its correspondence?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteCase}
        onConfirm={() => { if (pendingDeleteCase !== null) deleteCase.mutate(pendingDeleteCase, { onSuccess: () => setPendingDeleteCase(null) }); }}
        onCancel={() => { setPendingDeleteCase(null); deleteCase.reset(); }}
      />

      <ConfirmDialog
        open={pendingDeleteCorresp !== null}
        title="Delete Correspondence"
        message="Delete this correspondence entry?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteCorresp}
        onConfirm={() => { if (pendingDeleteCorresp) deleteCorresp.mutate(pendingDeleteCorresp, { onSuccess: () => setPendingDeleteCorresp(null) }); }}
        onCancel={() => { setPendingDeleteCorresp(null); deleteCorresp.reset(); }}
      />

      <ConfirmDialog
        open={pendingDeleteDoc !== null}
        title="Delete Document"
        message="Delete this document?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteDoc}
        onConfirm={() => { if (pendingDeleteDoc) deleteDoc.mutate(pendingDeleteDoc, { onSuccess: () => setPendingDeleteDoc(null) }); }}
        onCancel={() => { setPendingDeleteDoc(null); deleteDoc.reset(); }}
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "block-status", label: "Block Status", icon: <Leaf className="w-4 h-4" /> },
  { key: "input-log", label: "Input Log", icon: <FlaskConical className="w-4 h-4" /> },
  { key: "input-derogations", label: "Input Derogations", icon: <AlertTriangle className="w-4 h-4" /> },
  { key: "certificates", label: "Certificates", icon: <ShieldCheck className="w-4 h-4" /> },
  { key: "buyer-declarations", label: "Buyer Declarations", icon: <FileText className="w-4 h-4" /> },
  { key: "crops", label: "Crops", icon: <Leaf className="w-4 h-4" /> },
  { key: "water-tests", label: "Water Tests", icon: <Droplets className="w-4 h-4" /> },
  { key: "harvest", label: "Harvest", icon: <Package className="w-4 h-4" /> },
  { key: "intake", label: "Intake", icon: <Thermometer className="w-4 h-4" /> },
  { key: "packhouse", label: "Packhouse", icon: <Warehouse className="w-4 h-4" /> },
  { key: "allergen", label: "Allergens", icon: <AlertTriangle className="w-4 h-4" /> },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function OrganicFreshProducePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<TabKey>({ page: "organic-fresh-produce", farmId, validIds: TABS.map(t => t.key), defaultTab: "block-status" });

  const { data: farmData } = useQuery<{ name: string }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmName = farmData?.name ?? "Farm";

  if (!farmId) return null;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organic Fresh Produce</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Block conversion status, approved input log, input derogation register, organic certification records, and buyer declarations.
          </p>
        </div>

        <TabBar>
          {TABS.map(t => (
            <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.icon}
              {t.label}
            </TabButton>
          ))}
        </TabBar>

        <Card className="p-5">
          {tab === "block-status" && <BlockStatusTab farmId={farmId} farmName={farmName} />}
          {tab === "input-log" && <InputLogTab farmId={farmId} farmName={farmName} />}
          {tab === "input-derogations" && <InputDerogationsTab farmId={farmId} farmName={farmName} />}
          {tab === "certificates" && <CertificatesTab farmId={farmId} farmName={farmName} />}
          {tab === "buyer-declarations" && <BuyerDeclarationsTab farmId={farmId} farmName={farmName} />}
          {tab === "crops" && <CropsTab farmId={farmId} />}
          {tab === "water-tests" && <WaterTestsTab farmId={farmId} />}
          {tab === "harvest" && <HarvestTab farmId={farmId} />}
          {tab === "intake" && <IntakeTab farmId={farmId} />}
          {tab === "packhouse" && <PackhouseTab farmId={farmId} />}
          {tab === "allergen" && <AllergenTab farmId={farmId} />}
        </Card>
      </div>
    </AppLayout>
  );
}
