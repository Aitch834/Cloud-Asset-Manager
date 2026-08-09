import React, { useState, useEffect, useRef, useMemo } from "react";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { useFields, useAddField, useUpdateField, useDeleteField } from "@/hooks/use-fields";
import { useCrops, useAddCrop, useFieldCropAssignments, useAssignCrop } from "@/hooks/use-crops";
import {
  getListFieldCropAssignmentsQueryKey,
  getListFieldsQueryKey,
  getListCropsQueryKey,
  useListSeedBatches,
  getListSeedBatchesQueryKey,
  useGenerateFieldCropLabels,
} from "@workspace/api-client-react/src/generated/api";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import {
  Plus, PlusCircle, Search, Map as MapIcon, MoreVertical, Pencil, Trash2, AlertTriangle,
  Sprout, Leaf, CalendarDays, Wheat, ChevronRight, X, History, ChevronDown, Printer, FlaskConical, Loader2, QrCode, StickyNote, ShoppingCart,
  Landmark, Phone, MapPin, BadgePoundSterling, RefreshCw, FileText, CheckCircle2, XCircle, Paperclip, Download, Key,
  TreePine, Layers3, TrendingUp, TrendingDown, Minus, Scale, CloudRain, BarChart2, Trophy, Medal, ChevronUp, Eye,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { QRCodeSVG } from "qrcode.react";
import { FieldBoundaryMapDialog } from "@/components/fields/FieldBoundaryMapDialog";
import { FieldSchematicMap } from "@/components/fields/FieldSchematicMap";
import { useForm } from "react-hook-form";
import { Redirect, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printProReport } from "@/lib/print-report";
import { printSeedBagLabels } from "@/lib/print-labels";
import { cropYearOptions, cropYearLabel, currentCropYear, isInCropYear } from "@/lib/cropYear";
import { getEstablishmentPercent, calculateSeedRate, suggestTargetPopulation, BLACKGRASS_TARGET_POPULATION_M2 } from "@/lib/seedRateCalculator";
import { useToast } from "@/hooks/use-toast";
import { DocAttach } from "@/components/DocAttach";
import CropSeasonReport from "@/components/CropSeasonReport";
import { FieldRecord, CropRecord } from "./shared";

interface SeedRecord {
  id: number;
  farmId: number;
  fieldId: number | null;
  drillingDate: string;
  cropName: string;
  variety: string | null;
  seedLotNumber: string | null;
  seedRate: string | null;
  seedRateUnit: string | null;
  rowSpacingCm: string | null;
  isTreated: boolean;
  treatmentProduct: string | null;
  operator: string | null;
  areaSeededHa: string | null;
  seedCostPencePerKg: number | null;
  soilConditions: string | null;
  weatherNotes: string | null;
  notes: string | null;
  createdAt: string;
  stockItemId: number | null;
  stockDeliveryId: number | null;
  batchNumber: string | null;
}

const SOIL_CONDITIONS = [
  { value: "", label: "— Not recorded —" },
  { value: "firm_good_tilth", label: "Firm, good seedbed tilth" },
  { value: "adequate_tilth", label: "Adequate tilth — acceptable conditions" },
  { value: "cloddy_rough", label: "Cloddy / rough — not ideal" },
  { value: "wet_soft", label: "Wet / soft — risk of compaction" },
  { value: "dry_dusty", label: "Dry / dusty — capping risk" },
  { value: "frozen", label: "Frozen — drilling on frozen ground" },
];

const EMPTY_SEED = {
  fieldId: "",
  drillingDate: new Date().toISOString().slice(0, 10),
  cropName: "",
  variety: "",
  seedLotNumber: "",
  seedRate: "",
  seedRateUnit: "kg/ha",
  rowSpacingCm: "",
  isTreated: false,
  treatmentProduct: "",
  operator: "",
  areaSeededHa: "",
  seedCostPencePerKg: "",
  soilConditions: "",
  weatherNotes: "",
  notes: "",
  stockItemId: "",
  stockDeliveryId: "",
  batchNumber: "",
};

export function SeedDrillingSection({ farmId, fields }: { farmId: number; fields: FieldRecord[] }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = usePersistedNumberFilter({ page: "seed-drilling", filter: "crop-year", farmId, defaultValue: currentCropYear() });
  const { data: membersData } = useFarmMembers(farmId);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SeedRecord | null>(null);
  const [viewSeed, setViewSeed] = useState<SeedRecord | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_SEED>(EMPTY_SEED);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [areaWarning, setAreaWarning] = useState<string | null>(null);
  const [pendingBody, setPendingBody] = useState<Record<string, unknown> | null>(null);

  const { data: cropsRegData } = useCrops(farmId);
  const cropsRegister = (cropsRegData?.records ?? []) as unknown as CropRecord[];

  const baseUrl = `/api/farms/${farmId}/seed-drilling`;

  const { data, isLoading } = useQuery({
    queryKey: ["seed-drilling", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: SeedRecord[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { error?: string }).error ?? "Failed to create record"); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setShowForm(false); setFormData(EMPTY_SEED); setAreaWarning(null); setPendingBody(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { error?: string }).error ?? "Failed to update record"); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setEditingRecord(null); setShowForm(false); setFormData(EMPTY_SEED); setAreaWarning(null); setPendingBody(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const records: SeedRecord[] = data?.records ?? [];
  const filtered = records.filter(r => {
    if (!isInCropYear(r.drillingDate, cropYear)) return false;
    if (!search) return true;
    return (
      r.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      r.variety?.toLowerCase().includes(search.toLowerCase()) ||
      r.seedLotNumber?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const fieldNameById = Object.fromEntries(fields.map(f => [f.id, f.name]));

  function setField(key: keyof typeof EMPTY_SEED, val: string | boolean) {
    setFormData(f => ({ ...f, [key]: val }));
  }

  function handleCropSelect(name: string) {
    const match = cropsRegister.find(c => c.name.toLowerCase() === name.toLowerCase());
    setFormData(f => ({
      ...f,
      cropName: name,
      variety: match?.variety ? match.variety : f.variety,
    }));
  }

  function openEdit(r: SeedRecord) {
    setEditingRecord(r);
    setFormData({
      fieldId: r.fieldId != null ? String(r.fieldId) : "",
      drillingDate: r.drillingDate ? r.drillingDate.slice(0, 10) : "",
      cropName: r.cropName ?? "",
      variety: r.variety ?? "",
      seedLotNumber: r.seedLotNumber ?? "",
      seedRate: r.seedRate ?? "",
      seedRateUnit: r.seedRateUnit ?? "kg/ha",
      rowSpacingCm: r.rowSpacingCm ?? "",
      isTreated: r.isTreated ?? false,
      treatmentProduct: r.treatmentProduct ?? "",
      operator: r.operator ?? "",
      areaSeededHa: r.areaSeededHa ?? "",
      seedCostPencePerKg: r.seedCostPencePerKg ? String(r.seedCostPencePerKg / 100) : "",
      soilConditions: r.soilConditions ?? "",
      weatherNotes: r.weatherNotes ?? "",
      notes: r.notes ?? "",
      stockItemId: r.stockItemId != null ? String(r.stockItemId) : "",
      stockDeliveryId: r.stockDeliveryId != null ? String(r.stockDeliveryId) : "",
      batchNumber: r.batchNumber ?? "",
    });
    setShowForm(true);
  }

  function harvestYearBounds(iso: string): { start: Date; end: Date } {
    const d = new Date(iso);
    const m = d.getMonth();
    const y = d.getFullYear();
    const sy = m >= 7 ? y : y - 1;
    return { start: new Date(Date.UTC(sy, 7, 1)), end: new Date(Date.UTC(sy + 1, 6, 31, 23, 59, 59)) };
  }

  const { data: seedStockItemsData } = useQuery<{ items: any[] }>({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then(r => r.json()),
    enabled: !!farmId,
  });
  const seedStockItems = (seedStockItemsData?.items ?? []).filter((si: any) =>
    ["seed", "cereal", "grain", "osr", "crop", "variety"].some(t => String(si.stockType ?? si.category ?? "").toLowerCase().includes(t)) || !(["chemical", "fuel", "fertiliser", "fert"].some(t => String(si.stockType ?? "").toLowerCase().includes(t)))
  );

  const { data: seedDeliveriesData } = useQuery<{ deliveries: any[] }>({
    queryKey: ["stock-deliveries-for-item", farmId, formData.stockItemId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries-for-item?stockItemId=${formData.stockItemId}`).then(r => r.json()),
    enabled: !!farmId && !!formData.stockItemId,
  });

  function handleSeedDeliverySelect(deliveryId: string) {
    if (!deliveryId) {
      setField("stockDeliveryId", "");
      return;
    }
    const del = (seedDeliveriesData?.deliveries ?? []).find((d: any) => String(d.id) === deliveryId);
    setField("stockDeliveryId", deliveryId);
    if (del?.batchNumber) setField("batchNumber", del.batchNumber);
    // Auto-populate cost — delivery is pence per stock unit (likely kg), form shows £/kg
    if (del?.unitPricePence != null) {
      const unit = (del.stockItemUnit ?? "kg").toLowerCase();
      const pencePerKg = unit === "tonne" || unit === "t" ? del.unitPricePence / 1000 : del.unitPricePence;
      setField("seedCostPencePerKg", (pencePerKg / 100).toFixed(4));
    }
    if (del?.stockItemId && !formData.stockItemId) setField("stockItemId", String(del.stockItemId));
  }

  function buildBody() {
    return {
      ...formData,
      fieldId: formData.fieldId ? Number(formData.fieldId) : null,
      drillingDate: formData.drillingDate ? new Date(formData.drillingDate).toISOString() : null,
      seedRate: formData.seedRate ? formData.seedRate : null,
      rowSpacingCm: formData.rowSpacingCm ? formData.rowSpacingCm : null,
      areaSeededHa: formData.areaSeededHa ? formData.areaSeededHa : null,
      seedCostPencePerKg: formData.seedCostPencePerKg ? Math.round(parseFloat(formData.seedCostPencePerKg) * 100) : null,
      stockItemId: formData.stockItemId ? Number(formData.stockItemId) : null,
      stockDeliveryId: formData.stockDeliveryId ? Number(formData.stockDeliveryId) : null,
      batchNumber: formData.batchNumber || null,
    };
  }

  function doSubmit(body: Record<string, unknown>) {
    if (editingRecord) { updateMutation.mutate({ id: editingRecord.id, body }); }
    else { createMutation.mutate(body); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAreaWarning(null);
    const body = buildBody();

    if (formData.fieldId && formData.areaSeededHa && formData.drillingDate) {
      const newArea = parseFloat(formData.areaSeededHa);
      const fieldRecord = fields.find(f => String(f.id) === formData.fieldId);
      const fieldAreaHa = fieldRecord?.areaHectares ? Number(fieldRecord.areaHectares) : null;

      if (fieldAreaHa && newArea > fieldAreaHa) {
        return;
      }

      if (fieldAreaHa) {
        const { start, end } = harvestYearBounds(formData.drillingDate);
        const existingTotal = records
          .filter(r => {
            if (String(r.fieldId) !== formData.fieldId) return false;
            if (editingRecord && r.id === editingRecord.id) return false;
            const rd = r.drillingDate ? new Date(r.drillingDate) : null;
            return rd && rd >= start && rd <= end;
          })
          .reduce((sum, r) => sum + (r.areaSeededHa ? parseFloat(r.areaSeededHa) : 0), 0);

        if (existingTotal + newArea > fieldAreaHa) {
          setAreaWarning(
            `The combined drilled area for ${fieldRecord?.name ?? "this field"} in this harvest year would be ${(existingTotal + newArea).toFixed(2)} ha — exceeding the field's total area of ${fieldAreaHa.toFixed(2)} ha. This may be valid (e.g. a catch crop after harvest), but please double-check.`
          );
          setPendingBody(body);
          return;
        }
      }
    }

    doSubmit(body);
  }

  function handleProceedAnyway() {
    if (pendingBody) { doSubmit(pendingBody); }
    setAreaWarning(null);
    setPendingBody(null);
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-foreground/60">Seed drilling and establishment records — variety, batch number, seed rate, and treated seed status for each drilling operation.</p>
        </div>
        <Button onClick={() => { setEditingRecord(null); setFormData({ ...EMPTY_SEED, drillingDate: new Date().toISOString().slice(0, 10) }); setShowForm(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Drilling Record
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          className="h-10 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shrink-0"
          value={cropYear}
          onChange={e => setCropYear(Number(e.target.value))}
        >
          <option value={0}>All years</option>
          {cropYearOptions(7).map(y => (
            <option key={y} value={y}>{cropYearLabel(y)}</option>
          ))}
        </select>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search crop, variety, lot..." className="pl-9 bg-white h-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">{editingRecord ? "Edit Drilling Record" : "New Drilling Record"}</h3>
              <button onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_SEED); }} className="p-1 rounded hover:bg-black/5"><X className="w-5 h-5 text-foreground/50" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Drilling Date <span className="text-red-500">*</span></label>
                  <Input type="date" value={formData.drillingDate} onChange={e => setField("drillingDate", e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Field</label>
                  <select
                    className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.fieldId}
                    onChange={e => {
                      const id = e.target.value;
                      setField("fieldId", id);
                      if (id && !formData.areaSeededHa) {
                        const f = fields.find(f => String(f.id) === id);
                        if (f?.areaHectares) {
                          setField("areaSeededHa", parseFloat(String(f.areaHectares)).toFixed(2));
                        }
                      }
                    }}
                  >
                    <option value="">— All / No specific field —</option>
                    {fields.map(f => <option key={f.id} value={f.id}>{f.name}{f.areaHectares ? ` (${parseFloat(String(f.areaHectares)).toFixed(1)} ha)` : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Area Seeded (ha)</label>
                  <Input type="number" step="0.01" placeholder="e.g. 12.50" value={formData.areaSeededHa} onChange={e => setField("areaSeededHa", e.target.value)} />
                  {(() => {
                    const fr = fields.find(f => String(f.id) === formData.fieldId);
                    const area = formData.areaSeededHa ? parseFloat(formData.areaSeededHa) : null;
                    if (fr?.areaHectares && area && area > Number(fr.areaHectares)) {
                      return <p className="text-[11px] text-red-600 mt-1">Exceeds {fr.name}&apos;s total area ({Number(fr.areaHectares).toFixed(2)} ha) — please correct before saving.</p>;
                    }
                    if (formData.fieldId && formData.areaSeededHa) {
                      return <p className="text-[11px] text-muted-foreground mt-1">Auto-filled from field register — edit if drilling only part of the field</p>;
                    }
                    return null;
                  })()}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Crop <span className="text-red-500">*</span></label>
                  <input
                    list="seed-crop-datalist"
                    className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={cropsRegister.length > 0 ? "Select from Crops Register or type…" : "e.g. Winter Wheat, OSR, Barley"}
                    value={formData.cropName}
                    onChange={e => handleCropSelect(e.target.value)}
                    required
                  />
                  <datalist id="seed-crop-datalist">
                    {cropsRegister.map(c => (
                      <option key={c.id} value={c.name}>{c.variety ? `${c.name} — ${c.variety}` : c.name}</option>
                    ))}
                  </datalist>
                  {cropsRegister.length === 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">No crops in your Crops Register yet — type the crop name manually.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Variety</label>
                  <Input placeholder="e.g. KWS Zyatt, Skyfall" value={formData.variety} onChange={e => setField("variety", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Seed Lot / Batch No.</label>
                  <Input placeholder="e.g. UK2025-A1234" value={formData.seedLotNumber} onChange={e => setField("seedLotNumber", e.target.value)} />
                </div>
                {/* ── Delivery-linked costing ── */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 space-y-2">
                  <p className="text-xs font-semibold text-emerald-800">Link to Stock Delivery — auto-populate cost</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-foreground/60 mb-1 block">Seed Stock Item</label>
                      <select className="w-full h-8 rounded-lg border border-border bg-white px-2 text-xs focus:outline-none"
                        value={formData.stockItemId}
                        onChange={e => { setField("stockItemId", e.target.value); setField("stockDeliveryId", ""); }}>
                        <option value="">— None —</option>
                        {(seedStockItemsData?.items ?? []).map((si: any) => (
                          <option key={String(si.id)} value={String(si.id)}>{String(si.name)}{si.unit ? ` (${si.unit})` : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/60 mb-1 block">Delivery</label>
                      <select className="w-full h-8 rounded-lg border border-border bg-white px-2 text-xs focus:outline-none"
                        value={formData.stockDeliveryId}
                        onChange={e => handleSeedDeliverySelect(e.target.value)}
                        disabled={!formData.stockItemId}>
                        <option value="">{formData.stockItemId ? "— Select delivery —" : "— Select item first —"}</option>
                        {(seedDeliveriesData?.deliveries ?? []).map((d: any) => (
                          <option key={String(d.id)} value={String(d.id)}>
                            {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString("en-GB") : "—"}{d.batchNumber ? ` · ${d.batchNumber}` : ""}{d.unitPricePence != null ? ` · £${(d.unitPricePence / 100).toFixed(2)}/${d.stockItemUnit ?? "unit"}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formData.stockDeliveryId && (
                    <p className="text-[11px] text-emerald-700">Seed cost auto-populated from delivery price.{formData.batchNumber ? ` Batch: ${formData.batchNumber}` : ""}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Seed Rate</label>
                  <Input type="number" step="0.01" placeholder="e.g. 150" value={formData.seedRate} onChange={e => setField("seedRate", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Rate Unit</label>
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.seedRateUnit} onChange={e => setField("seedRateUnit", e.target.value)}>
                    {["kg/ha", "seeds/m²", "kg/acre"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Row Spacing (cm)</label>
                  <Input type="number" step="0.1" placeholder="e.g. 12.5" value={formData.rowSpacingCm} onChange={e => setField("rowSpacingCm", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Operator / Driller</label>
                  <StaffSelect
                    staffNames={(membersData?.members ?? []).map(m => memberFullName(m))}
                    value={formData.operator ?? ""}
                    onChange={val => setField("operator", val)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Soil Conditions</label>
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.soilConditions} onChange={e => setField("soilConditions", e.target.value)}>
                    {SOIL_CONDITIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Weather at Drilling</label>
                  <Input placeholder="e.g. Dry, light wind, 8°C" value={formData.weatherNotes} onChange={e => setField("weatherNotes", e.target.value)} />
                </div>
              </div>

              {(() => {
                const fr = fields.find(f => String(f.id) === formData.fieldId);
                if (!fr || !(fr as any).blackgrassRiskField) return null;
                const warnings: string[] = [];
                const rate = formData.seedRate ? parseFloat(formData.seedRate) : null;
                if (rate != null && !isNaN(rate) && formData.seedRateUnit === "kg/ha" && rate < 220) {
                  warnings.push(`Seed rate of ${rate}kg/ha is below the recommended 220kg/ha for black-grass suppression on this field — consider raising it.`);
                }
                if (formData.drillingDate) {
                  const d = new Date(formData.drillingDate);
                  const month = d.getMonth() + 1;
                  const day = d.getDate();
                  const isAutumn = month >= 8 || month <= 2;
                  const isDelayed = month > 10 || (month === 10 && day >= 1);
                  if (isAutumn && !isDelayed) {
                    warnings.push("Drilling before 1 October misses the stale-seedbed window — delaying drilling lets an extra flush of black-grass be sprayed off first on this at-risk field.");
                  }
                }
                const spacing = formData.rowSpacingCm ? parseFloat(formData.rowSpacingCm) : null;
                if (spacing != null && !isNaN(spacing) && spacing > 15) {
                  warnings.push(`Row spacing of ${spacing}cm is wider than the recommended 15cm max — narrower rows close the canopy sooner and compete harder against black-grass.`);
                }
                if (warnings.length === 0) return null;
                return (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 space-y-1.5">
                    <p className="text-xs font-semibold text-red-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />{fr.name} is flagged as a black-grass risk field
                    </p>
                    {warnings.map((w, i) => (
                      <p key={i} className="text-[11px] text-red-700 pl-5">{w}</p>
                    ))}
                  </div>
                );
              })()}

              <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={formData.isTreated} onChange={e => setField("isTreated", e.target.checked)} className="rounded" />
                    Seed is treated / dressed
                  </label>
                  {formData.isTreated && (
                    <Input placeholder="Treatment product (e.g. Redigo Pro, Latitude)" value={formData.treatmentProduct} onChange={e => setField("treatmentProduct", e.target.value)} />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Seed Cost <span className="text-muted-foreground text-xs font-normal">(£/kg) — optional</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">£</span>
                    <Input
                      type="number" step="0.01" min="0" placeholder="e.g. 0.85"
                      className="pl-7"
                      value={formData.seedCostPencePerKg}
                      onChange={e => setField("seedCostPencePerKg", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                  <Input placeholder="Any additional notes" value={formData.notes} onChange={e => setField("notes", e.target.value)} />
                </div>
              </div>

              {(createMutation.error || updateMutation.error) && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {(createMutation.error as Error | null)?.message ?? (updateMutation.error as Error | null)?.message}
                </p>
              )}

              {areaWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 text-sm text-amber-800">
                  <p className="font-medium mb-1">Area warning</p>
                  <p className="mb-3">{areaWarning}</p>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleProceedAnyway} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                      Proceed anyway
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setAreaWarning(null); setPendingBody(null); }}>
                      Go back &amp; correct
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_SEED); setAreaWarning(null); setPendingBody(null); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !!areaWarning}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingRecord ? "Update Record" : "Save Record"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Wheat className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No seed drilling records yet</h3>
              <p className="text-foreground/50 text-sm">
                {search
                  ? "No records match your search."
                  : cropYear !== 0
                  ? `No records for crop year ${cropYearLabel(cropYear)}. Try selecting a different year.`
                  : "Record each drilling operation to build your establishment history."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Date</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Crop / Variety</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Field</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Lot No.</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Rate</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Area (ha)</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Operator</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Treated</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{r.drillingDate ? new Date(r.drillingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{r.cropName}</div>
                      {r.variety && <div className="text-xs text-foreground/50">{r.variety}</div>}
                    </td>
                    <td className="p-4 text-sm text-foreground/70">{r.fieldId ? (fieldNameById[r.fieldId] ?? "—") : "—"}</td>
                    <td className="p-4 text-sm font-mono text-foreground/70">{r.seedLotNumber || "—"}</td>
                    <td className="p-4 text-sm text-foreground/70">{r.seedRate ? `${r.seedRate} ${r.seedRateUnit || "kg/ha"}` : "—"}</td>
                    <td className="p-4 text-sm text-foreground/70">{r.areaSeededHa ? parseFloat(r.areaSeededHa).toFixed(2) : "—"}</td>
                    <td className="p-4 text-sm text-foreground/70">{r.operator || "—"}</td>
                    <td className="p-4">
                      {r.isTreated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <FlaskConical className="w-3 h-3" /> Treated
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/40">Untreated</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewSeed(r)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-sm text-foreground/50 flex items-center justify-between flex-wrap gap-2">
            <span>Showing {filtered.length} of {records.length} records</span>
            {cropYear !== 0 && (
              <span className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">
                Crop year {cropYearLabel(cropYear)}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* ── View dialog ── */}
      {viewSeed && (
        <Dialog open onOpenChange={() => setViewSeed(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Seed Drilling Record — {viewSeed.cropName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Drilling Date</p><p className="font-medium">{viewSeed.drillingDate}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop</p><p className="font-medium">{viewSeed.cropName}</p></div>
              {viewSeed.variety && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Variety</p><p className="font-medium">{viewSeed.variety}</p></div>}
              {viewSeed.seedLotNumber && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Lot No.</p><p className="font-medium font-mono">{viewSeed.seedLotNumber}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Rate</p><p className="font-medium">{viewSeed.seedRate ? `${viewSeed.seedRate} ${viewSeed.seedRateUnit ?? ""}` : "—"}</p></div>
              {viewSeed.rowSpacingCm && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Row Spacing</p><p className="font-medium">{viewSeed.rowSpacingCm} cm</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Area Seeded</p><p className="font-medium">{viewSeed.areaSeededHa ? `${parseFloat(viewSeed.areaSeededHa).toFixed(2)} ha` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treated Seed</p>
                {viewSeed.isTreated
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><FlaskConical className="w-3 h-3" /> Treated{viewSeed.treatmentProduct ? ` — ${viewSeed.treatmentProduct}` : ""}</span>
                  : <span className="text-xs text-foreground/40">Untreated</span>}
              </div>
              {viewSeed.operator && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Operator</p><p className="font-medium">{viewSeed.operator}</p></div>}
              {viewSeed.seedCostPencePerKg != null && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Seed Cost</p><p className="font-medium">{(viewSeed.seedCostPencePerKg / 100).toFixed(2)} £/kg</p></div>}
              {viewSeed.soilConditions && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Soil Conditions</p><p className="font-medium">{SOIL_CONDITIONS.find(s => s.value === viewSeed!.soilConditions)?.label ?? viewSeed.soilConditions}</p></div>}
              {viewSeed.weatherNotes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Weather Notes</p><p className="font-medium">{viewSeed.weatherNotes}</p></div>}
              {viewSeed.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewSeed.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewSeed); setViewSeed(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button onClick={() => setViewSeed(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMutation.reset(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Drilling Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

