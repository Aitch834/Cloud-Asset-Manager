import React, { useState, useEffect } from "react";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { useFields, useAddField, useUpdateField, useDeleteField } from "@/hooks/use-fields";
import { useCrops, useAddCrop, useFieldCropAssignments, useAssignCrop } from "@/hooks/use-crops";
import {
  Plus, Search, Map, MoreVertical, Pencil, Trash2, AlertTriangle,
  Sprout, Leaf, CalendarDays, Wheat, ChevronRight, X, History, ChevronDown, Printer, FlaskConical, Loader2, QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { FieldBoundaryMapDialog } from "@/components/fields/FieldBoundaryMapDialog";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printHtml } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();

interface FieldRecord {
  id: number;
  name?: string;
  fieldReference?: string;
  areaHectares?: string | number | null;
  soilType?: string;
  currentUse?: string;
  isActive?: boolean;
}

interface CropRecord {
  id: number;
  name: string;
  variety?: string;
  category?: string;
}

interface FieldCropAssignment {
  id: number;
  fieldId: number;
  cropId: number;
  cropName: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string | null;
  season?: string;
  year?: number;
}

interface FieldFormData { name: string; areaHectares: number; soilType: string; }
interface CropFormData { name: string; variety: string; category: string; }
interface AssignCropFormData { cropId: number; plantingDate: string; expectedHarvestDate: string; season: string; }

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface Farm { name?: string; address?: string; postcode?: string; cphNumber?: string; redTractorId?: string | null; }
interface PrintableAssignment extends FieldCropAssignment { fieldName?: string; soilType?: string; areaHectares?: string | number | null; fieldReference?: string; }

function PrintCropRegister({ farmId, year, fields, assignments, crops, onClose }: {
  farmId: number;
  year: number;
  fields: FieldRecord[];
  assignments: FieldCropAssignment[];
  crops: CropRecord[];
  onClose: () => void;
}) {
  const { data: farmData } = useQuery<{ record: Farm }>({
    queryKey: ["farm", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`);
      return r.json();
    },
  });
  const farm = farmData?.record;

  const isHistorical = year < CURRENT_YEAR;

  const rows: PrintableAssignment[] = fields.map(f => {
    const asgn = assignments.find(a => a.fieldId === f.id && (a.year === year || (!a.year && year === CURRENT_YEAR)));
    const crop = asgn ? crops.find(c => c.id === asgn.cropId) : undefined;
    return {
      id: asgn?.id ?? 0,
      fieldId: f.id,
      cropId: asgn?.cropId ?? 0,
      cropName: crop?.name ?? "—",
      plantingDate: asgn?.plantingDate,
      expectedHarvestDate: asgn?.expectedHarvestDate,
      actualHarvestDate: asgn?.actualHarvestDate,
      season: asgn?.season,
      year: asgn?.year,
      fieldName: f.name,
      soilType: f.soilType,
      areaHectares: f.areaHectares,
      fieldReference: f.fieldReference,
    };
  });

  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handlePrint = () => {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Crop Register — ${year} Season</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.hdr h1{font-size:13px;font-weight:700;margin:0 0 2px}.hdr p{font-size:10px;color:#555;margin:1px 0}.hdr-r{text-align:right;font-size:10px;color:#666}.hdr-r b{display:block;font-size:12px;font-weight:600;color:#000}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#f0fdf4;font-weight:600;text-align:left;border:1px solid #d1d5db;padding:5px 8px}td{border:1px solid #d1d5db;padding:5px 8px}tr:nth-child(even) td{background:#fafafa}.summary{display:flex;gap:20px;font-size:10px;color:#555;padding:6px 0;border-top:1px solid #e5e7eb}.footer{display:flex;justify-content:space-between;font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:4px}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h1>${farm?.name ?? "Farm"}</h1>${farm?.address ? `<p>${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm?.cphNumber ? `<p>CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}${farm?.redTractorId ? `<p>Red Tractor ID: <span style="font-family:monospace;font-weight:600">${farm.redTractorId}</span></p>` : ""}</div><div class="hdr-r"><b>Crop Register</b>Season: <b>${year}</b><br>Printed: ${printedDate}</div></div>
<table><thead><tr><th>Field Name</th><th>Ref</th><th>Area (ha)</th><th>Soil Type</th><th>Crop</th><th>Season</th><th>Planted</th><th>Exp. Harvest</th>${isHistorical ? "<th>Actual Harvest</th>" : ""}</tr></thead><tbody>${rows.map(row => `<tr><td style="font-weight:500">${row.fieldName || "Field #" + row.fieldId}</td><td style="color:#666">${row.fieldReference || "—"}</td><td>${row.areaHectares ? parseFloat(String(row.areaHectares)).toFixed(2) : "—"}</td><td>${row.soilType || "—"}</td><td style="font-weight:500">${row.cropName}</td><td>${row.season || "—"}</td><td>${formatDate(row.plantingDate) || "—"}</td><td>${formatDate(row.expectedHarvestDate) || "—"}</td>${isHistorical ? `<td>${formatDate(row.actualHarvestDate) || "—"}</td>` : ""}</tr>`).join("")}</tbody></table>
<div class="summary"><span><b>${fields.length}</b> field${fields.length !== 1 ? "s" : ""} total</span> <span><b>${rows.filter(r => r.cropId).length}</b> with crop assigned</span> <span><b>${rows.filter(r => !r.cropId).length}</b> unassigned</span></div>
<div class="footer"><em>On-farm record for Red Tractor compliance. Retain for minimum 3 years and make available for inspection at audit.</em><span>Powered by BDE Farm Trac · ${printedDate}</span></div>
</body></html>`;
    printHtml(html, `crop-register-${year}.html`);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-green-600" />
            Crop Register — {year} Season
          </DialogTitle>
          <DialogDescription>
            Review the record below, then click Print to produce a compliance document for Red Tractor audit.
          </DialogDescription>
        </DialogHeader>

        <div id="fields-print-area" className="border border-border rounded-lg p-6 space-y-5 text-sm mt-2">
          {/* Document header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <p className="text-base font-bold text-foreground">{farm?.name ?? "Farm"}</p>
              {farm?.address && <p className="text-xs text-foreground/60">{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
              {farm?.cphNumber && <p className="text-xs text-foreground/60 mt-0.5">CPH: <span className="font-mono font-semibold">{farm.cphNumber}</span></p>}
              {farm?.redTractorId && <p className="text-xs text-foreground/60 mt-0.5">Red Tractor ID: <span className="font-mono font-semibold">{farm.redTractorId}</span></p>}
            </div>
            <div className="text-right text-xs text-foreground/50">
              <p className="font-semibold text-foreground text-sm">Crop Register</p>
              <p>Season: <strong className="text-foreground">{year}</strong></p>
              <p>Printed: {printedDate}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-green-50 text-foreground/70">
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Field Name</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Ref</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Area (ha)</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Soil Type</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Crop</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Season</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Planted</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Exp. Harvest</th>
                  {isHistorical && <th className="border border-border/60 px-3 py-2 text-left font-semibold">Actual Harvest</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.fieldId} className={i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}>
                    <td className="border border-border/60 px-3 py-2 font-medium">{row.fieldName || `Field #${row.fieldId}`}</td>
                    <td className="border border-border/60 px-3 py-2 text-foreground/60">{row.fieldReference || "—"}</td>
                    <td className="border border-border/60 px-3 py-2">{row.areaHectares ? parseFloat(String(row.areaHectares)).toFixed(2) : "—"}</td>
                    <td className="border border-border/60 px-3 py-2">{row.soilType || "—"}</td>
                    <td className="border border-border/60 px-3 py-2 font-medium">{row.cropName}</td>
                    <td className="border border-border/60 px-3 py-2">{row.season || "—"}</td>
                    <td className="border border-border/60 px-3 py-2">{formatDate(row.plantingDate) || "—"}</td>
                    <td className="border border-border/60 px-3 py-2">{formatDate(row.expectedHarvestDate) || "—"}</td>
                    {isHistorical && (
                      <td className="border border-border/60 px-3 py-2">{formatDate(row.actualHarvestDate) || "—"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex gap-6 pt-2 text-xs text-foreground/60 border-t">
            <span><strong className="text-foreground">{fields.length}</strong> field{fields.length !== 1 ? "s" : ""} total</span>
            <span><strong className="text-foreground">{rows.filter(r => r.cropId).length}</strong> with crop assigned</span>
            <span><strong className="text-foreground">{rows.filter(r => !r.cropId).length}</strong> unassigned</span>
          </div>

          {/* Footer */}
          <div className="text-xs text-foreground/40 border-t pt-3 flex items-center justify-between">
            <span className="italic">
              This is an on-farm record for Red Tractor compliance purposes.
              Retain for a minimum of 3 years and make available for inspection at audit.
            </span>
            <span className="font-medium not-italic text-foreground/50 ml-4 whitespace-nowrap">Powered by BDE Farm Trac · {printedDate}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldCardMenu({
  field, farmId, crops, currentCrop, onAssignCrop, onBoundaryUpdated,
}: {
  field: FieldRecord;
  farmId: number;
  crops: CropRecord[];
  currentCrop?: FieldCropAssignment;
  onAssignCrop: () => void;
  onBoundaryUpdated?: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [boundaryOpen, setBoundaryOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [isSavingCode, setIsSavingCode] = useState(false);

  const queryClient = useQueryClient();
  const { mutate: updateField, isPending: isUpdating } = useUpdateField(farmId);
  const { mutate: deleteField, isPending: isDeleting } = useDeleteField(farmId);

  const autoCode = `FLD-${String(field.id).padStart(4, "0")}`;
  const displayCode = (field as any).fieldCode || null;

  const saveFieldCode = async (code: string) => {
    setIsSavingCode(true);
    try {
      await fetch(`/api/farms/${farmId}/fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldCode: code }),
      });
      queryClient.invalidateQueries({ queryKey: ["farms", farmId, "fields"] });
    } finally {
      setIsSavingCode(false);
    }
  };

  const { register, handleSubmit, reset } = useForm<FieldFormData>({
    defaultValues: { name: field.name ?? "", areaHectares: parseFloat(String(field.areaHectares ?? 0)), soilType: field.soilType ?? "" },
  });

  const handleEdit = (values: FieldFormData) => {
    updateField({ farmId, recordId: field.id, data: values }, { onSuccess: () => { setEditOpen(false); reset(values); } });
  };

  const handleDelete = () => {
    deleteField({ farmId, recordId: field.id }, { onSuccess: () => setDeleteOpen(false) });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer shadow-sm border border-border/30"
            aria-label="Field options"
          >
            <MoreVertical className="w-4 h-4 text-foreground/70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onAssignCrop()}>
            <Sprout className="w-4 h-4 text-green-600" />
            {currentCrop ? "Change crop" : "Assign crop"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBoundaryOpen(true)}>
            <Map className="w-4 h-4 text-blue-600" />
            Draw boundary on map
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setQrOpen(true)}>
            <QrCode className="w-4 h-4 text-teal-600" />
            {displayCode ? "View QR label" : "Generate QR label"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setEditOpen(true); reset({ name: field.name ?? "", areaHectares: parseFloat(String(field.areaHectares ?? 0)), soilType: field.soilType ?? "" }); }}>
            <Pencil className="w-4 h-4 text-foreground/50" />
            Edit field
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete field
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><QrCode className="w-4 h-4 text-teal-600" /> Field QR Label</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {displayCode ? (
              <>
                <span className="font-mono text-lg font-bold tracking-widest text-teal-700">{displayCode}</span>
                <QRCodeSVG value={displayCode} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
                <p className="text-xs text-muted-foreground text-center">Print and fix to a gate post or field boundary marker so field workers can scan it on the mobile app.</p>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2"><Printer className="w-3.5 h-3.5" /> Print Label</Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
                  <QrCode className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground text-center">No QR code generated yet. Click below to assign code <strong className="font-mono">{autoCode}</strong> to this field.</p>
                <Button onClick={() => saveFieldCode(autoCode)} disabled={isSavingCode} className="gap-2">
                  {isSavingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  Generate QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>Update details for {field.name || `Field #${field.id}`}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Field Name / ID</label>
              <Input {...register("name", { required: true })} placeholder="e.g. North Pasture" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Area (ha)</label>
                <Input type="number" step="0.0001" {...register("areaHectares", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                <Input {...register("soilType")} placeholder="e.g. Clay loam" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Field
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{field.name || `Field #${field.id}`}</strong>? All associated crop records will also be removed and this cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FieldBoundaryMapDialog
        fieldId={field.id}
        fieldName={field.name || `Field #${field.id}`}
        open={boundaryOpen}
        onClose={() => setBoundaryOpen(false)}
        onSaved={() => { onBoundaryUpdated?.(); }}
      />
    </div>
  );
}

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
  isTreated: boolean;
  treatmentProduct: string | null;
  operator: string | null;
  areaSeededHa: string | null;
  notes: string | null;
  createdAt: string;
}

const EMPTY_SEED = {
  fieldId: "",
  drillingDate: new Date().toISOString().slice(0, 10),
  cropName: "",
  variety: "",
  seedLotNumber: "",
  seedRate: "",
  seedRateUnit: "kg/ha",
  isTreated: false,
  treatmentProduct: "",
  operator: "",
  areaSeededHa: "",
  notes: "",
};

function SeedDrillingSection({ farmId, fields }: { farmId: number; fields: FieldRecord[] }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SeedRecord | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_SEED>(EMPTY_SEED);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: cropsRegData } = useCrops(farmId);
  const cropsRegister = (cropsRegData?.records ?? []) as CropRecord[];

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
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setShowForm(false); setFormData(EMPTY_SEED); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setEditingRecord(null); setShowForm(false); setFormData(EMPTY_SEED); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setDeleteId(null); },
  });

  const records: SeedRecord[] = data?.records ?? [];
  const filtered = records.filter(r =>
    !search ||
    r.cropName?.toLowerCase().includes(search.toLowerCase()) ||
    r.variety?.toLowerCase().includes(search.toLowerCase()) ||
    r.seedLotNumber?.toLowerCase().includes(search.toLowerCase())
  );

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
      isTreated: r.isTreated ?? false,
      treatmentProduct: r.treatmentProduct ?? "",
      operator: r.operator ?? "",
      areaSeededHa: r.areaSeededHa ?? "",
      notes: r.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...formData,
      fieldId: formData.fieldId ? Number(formData.fieldId) : null,
      drillingDate: formData.drillingDate ? new Date(formData.drillingDate).toISOString() : null,
      seedRate: formData.seedRate ? formData.seedRate : null,
      areaSeededHa: formData.areaSeededHa ? formData.areaSeededHa : null,
    };
    if (editingRecord) { updateMutation.mutate({ id: editingRecord.id, body }); }
    else { createMutation.mutate(body); }
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

      <div className="relative w-full sm:w-80 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <Input placeholder="Search crop, variety, lot..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
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
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={formData.fieldId} onChange={e => setField("fieldId", e.target.value)}>
                    <option value="">— All / No specific field —</option>
                    {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Area Seeded (ha)</label>
                  <Input type="number" step="0.01" placeholder="e.g. 12.50" value={formData.areaSeededHa} onChange={e => setField("areaSeededHa", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Crop <span className="text-red-500">*</span></label>
                  <input
                    list="seed-crop-datalist"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Seed Rate</label>
                  <Input type="number" step="0.01" placeholder="e.g. 150" value={formData.seedRate} onChange={e => setField("seedRate", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Rate Unit</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={formData.seedRateUnit} onChange={e => setField("seedRateUnit", e.target.value)}>
                    {["kg/ha", "seeds/m²", "kg/acre"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Operator / Driller</label>
                  <Input placeholder="Person or contractor" value={formData.operator} onChange={e => setField("operator", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                  <Input placeholder="Any additional notes" value={formData.notes} onChange={e => setField("notes", e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_SEED); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
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
              <p className="text-foreground/50 text-sm">{search ? "No records match your search." : "Record each drilling operation to build your establishment history."}</p>
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
          <div className="px-4 py-3 border-t border-border text-sm text-foreground/50">
            Showing {filtered.length} of {records.length} records
          </div>
        )}
      </Card>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Drilling Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
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

export default function FieldsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<"fields" | "crops" | "seed">("fields");
  const [search, setSearch] = useState("");
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [assignForField, setAssignForField] = useState<FieldRecord | null>(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedFieldForHistory, setSelectedFieldForHistory] = useState<FieldRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "history" | "nmp">("overview");
  const [printOpen, setPrintOpen] = useState(false);

  if (!farmId) return <Redirect href="/select" />;

  const { data: fieldsData, isLoading: fieldsLoading, refetch: fieldsRefetch } = useFields(farmId);
  const { data: cropsData, isLoading: cropsLoading } = useCrops(farmId);
  const { data: assignmentsData } = useFieldCropAssignments(farmId);
  const fieldNmpQ = useQuery({
    queryKey: ["field-nmp-entries", farmId, selectedFieldForHistory?.id, drawerTab],
    queryFn: () => fetch(`/api/farms/${farmId}/fields/${selectedFieldForHistory?.id}/nmp-entries`).then(r => r.json()),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "nmp",
    select: (d: any) => d.entries ?? [],
  });

  const { mutate: createField, isPending: creatingField } = useAddField(farmId);
  const { mutate: createCrop, isPending: creatingCrop } = useAddCrop(farmId);
  const { mutate: assignCrop, isPending: assigningCrop } = useAssignCrop(farmId);

  const fieldForm = useForm<FieldFormData>();
  const cropForm = useForm<CropFormData>();
  const assignForm = useForm<AssignCropFormData>();

  const fields = (fieldsData?.records ?? []) as FieldRecord[];
  const crops = (cropsData?.records ?? []) as CropRecord[];
  const assignments = (assignmentsData?.records ?? []) as FieldCropAssignment[];

  const availableYears = Array.from(
    new Set([CURRENT_YEAR, ...assignments.map(a => a.year).filter((y): y is number => !!y)])
  ).sort((a, b) => b - a);

  const currentAssignments = assignments.filter(a =>
    selectedYear === CURRENT_YEAR ? (a.year === CURRENT_YEAR || !a.year) : a.year === selectedYear
  );

  const currentCropByField = Object.fromEntries(
    currentAssignments.map(a => [a.fieldId, a])
  ) as Record<number, FieldCropAssignment>;

  const filteredFields = fields.filter(f =>
    !search || (f.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const onSubmitField = (values: FieldFormData) => {
    createField({ farmId, data: values }, { onSuccess: () => { setIsAddFieldOpen(false); fieldForm.reset(); } });
  };

  const onSubmitCrop = (values: CropFormData) => {
    createCrop({ farmId, data: values }, { onSuccess: () => { setIsAddCropOpen(false); cropForm.reset(); } });
  };

  const onSubmitAssign = (values: AssignCropFormData) => {
    if (!assignForField) return;
    assignCrop(
      { farmId, data: { ...values, fieldId: assignForField.id, cropId: Number(values.cropId), year: CURRENT_YEAR, season: values.season } },
      { onSuccess: () => { setAssignForField(null); assignForm.reset(); } }
    );
  };

  const CROP_CATEGORIES = ["Combinable Crops", "Root Crops", "Vegetables", "Oilseeds", "Pulses", "Grass & Forage", "Other"];

  return (
    <AppLayout title="Fields & Crops">
      <style>{`
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #fields-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
        }
      `}</style>

      {/* Tabs */}
      <TabBar className="mb-6">
        <TabButton active={tab === "fields"} onClick={() => setTab("fields")}>Fields</TabButton>
        <TabButton active={tab === "crops"} onClick={() => setTab("crops")}>Crops Register</TabButton>
        <TabButton active={tab === "seed"} onClick={() => setTab("seed")}>Seed Records</TabButton>
      </TabBar>

      {/* ── FIELDS TAB ── */}
      {tab === "fields" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <Input
                  placeholder="Search fields..."
                  className="pl-10 bg-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="relative flex-shrink-0">
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="appearance-none border border-input rounded-lg pl-3 pr-8 py-2 text-sm bg-white font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y} Season{y === CURRENT_YEAR ? " (Current)" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setPrintOpen(true)} className="gap-2 flex-shrink-0">
                <Printer className="w-4 h-4" /> Print Register
              </Button>
            <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Field</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Field</DialogTitle>
                  <DialogDescription>Register a new field or parcel to your farm holding.</DialogDescription>
                </DialogHeader>
                <form onSubmit={fieldForm.handleSubmit(onSubmitField)} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Field Name / ID</label>
                    <Input {...fieldForm.register("name", { required: true })} placeholder="e.g. North Pasture" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Area (ha)</label>
                      <Input type="number" step="0.0001" {...fieldForm.register("areaHectares", { valueAsNumber: true })} placeholder="e.g. 12.5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                      <Input {...fieldForm.register("soilType")} placeholder="e.g. Clay loam" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddFieldOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={creatingField}>{creatingField ? "Saving..." : "Save Field"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fieldsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-black/5 animate-pulse" />)
            ) : filteredFields.length === 0 ? (
              <div className="col-span-full py-16 text-center text-foreground/50 border-2 border-dashed rounded-2xl">
                <Map className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No fields found.</p>
              </div>
            ) : filteredFields.map((field) => {
              const crop = currentCropByField[field.id];
              return (
                <Card key={field.id} className="group relative overflow-visible">
                  <div className="absolute top-3 right-3 z-30">
                    <FieldCardMenu
                      field={field}
                      farmId={farmId}
                      crops={crops}
                      currentCrop={crop}
                      onAssignCrop={() => { setAssignForField(field); assignForm.reset(); }}
                      onBoundaryUpdated={() => { fieldsRefetch(); }}
                    />
                  </div>

                  {/* Green header — field name (clickable for history) */}
                  <div
                    className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-t-2xl border-b border-border/50 px-4 pt-4 pb-3 cursor-pointer hover:from-green-200 hover:to-emerald-100 transition-colors group/header"
                    onClick={() => { setSelectedFieldForHistory(field); setDrawerTab("overview"); }}
                  >
                    <div className="flex items-center justify-between pr-8">
                      <h3 className="text-lg font-bold text-foreground leading-snug">{field.name || `Field #${field.id}`}</h3>
                      <History className="w-4 h-4 text-green-600/50 group-hover/header:text-green-700 transition-colors flex-shrink-0" />
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Crop badge */}
                    <div className="mb-3">
                      {crop ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <Wheat className="w-3 h-3" />
                          {crop.cropName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-black/5 text-foreground/40 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Leaf className="w-3 h-3" />
                          No crop assigned
                        </span>
                      )}
                    </div>

                    {/* Crop details or assign prompt */}
                    {crop ? (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3 space-y-1">
                        {crop.plantingDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <CalendarDays className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span>Planted: <strong>{formatDate(crop.plantingDate)}</strong></span>
                          </div>
                        )}
                        {crop.expectedHarvestDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <Wheat className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Expected harvest: <strong>{formatDate(crop.expectedHarvestDate)}</strong></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAssignForField(field); assignForm.reset(); }}
                        className="w-full mb-3 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-green-200 rounded-xl text-xs text-green-700 font-medium hover:bg-green-50 transition-colors cursor-pointer"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        Assign this season's crop
                      </button>
                    )}

                    {/* Field stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Soil</p>
                        <p className="text-sm font-medium text-foreground">{field.soilType || '—'}</p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Area</p>
                        <p className="text-sm font-medium text-foreground">
                          {field.areaHectares ? `${parseFloat(String(field.areaHectares)).toFixed(2)} ha` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ── CROPS REGISTER TAB ── */}
      {tab === "crops" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-foreground/60">
                Your crop catalogue — add crop types here, then assign them to fields each season.
              </p>
            </div>
            <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add Crop</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Crop to Register</DialogTitle>
                  <DialogDescription>Add a crop type to your farm's catalogue. You can then assign it to fields each season.</DialogDescription>
                </DialogHeader>
                <form onSubmit={cropForm.handleSubmit(onSubmitCrop)} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Crop Name</label>
                    <Input {...cropForm.register("name", { required: true })} placeholder="e.g. Winter Wheat, Oil Seed Rape" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Variety (optional)</label>
                    <Input {...cropForm.register("variety")} placeholder="e.g. KWS Zyatt, Extase" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Category</label>
                    <select
                      {...cropForm.register("category")}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Select category...</option>
                      {CROP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddCropOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={creatingCrop}>{creatingCrop ? "Saving..." : "Add Crop"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {cropsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-black/5 animate-pulse" />)}
            </div>
          ) : crops.length === 0 ? (
            <div className="py-16 text-center text-foreground/50 border-2 border-dashed rounded-2xl">
              <Sprout className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No crops registered yet</p>
              <p className="text-sm mt-1">Add your crop types above, then assign them to fields each season.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crops.map(crop => {
                const assignedFields = assignments.filter(a => a.cropId === crop.id && (a.year === CURRENT_YEAR || !a.year));
                return (
                  <div key={crop.id} className="flex items-center gap-4 bg-white border border-border/50 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Wheat className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{crop.name}</p>
                      <p className="text-sm text-foreground/50">
                        {[crop.variety, crop.category].filter(Boolean).join(" · ") || "No variety / category set"}
                      </p>
                    </div>
                    {assignedFields.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <Leaf className="w-3 h-3" />
                        {assignedFields.length} field{assignedFields.length !== 1 ? "s" : ""} this season
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-foreground/20 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── FIELD HISTORY DIALOG ── */}
      <Dialog open={!!selectedFieldForHistory} onOpenChange={(o) => { if (!o) setSelectedFieldForHistory(null); }}>
        <DialogContent className="max-w-lg p-0 flex flex-col max-h-[85vh] overflow-hidden gap-0" aria-describedby={undefined}>
          <DialogTitle className="sr-only">
            {selectedFieldForHistory?.name || `Field #${selectedFieldForHistory?.id}`} — Field Details
          </DialogTitle>
          {selectedFieldForHistory && (() => {
            const f = selectedFieldForHistory;
            const fieldAssignments = assignments
              .filter(a => a.fieldId === f.id)
              .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
            const currentCropForDrawer = currentCropByField[f.id];
            return (
              <>
              {/* header */}
              <div className="bg-gradient-to-br from-green-100 to-emerald-50 border-b border-border/50 px-8 pt-6 pb-4 flex-shrink-0 rounded-t-2xl">
                <div className="pr-8">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Field Details</p>
                  <h2 className="text-xl font-bold text-foreground leading-tight">{f.name || `Field #${f.id}`}</h2>
                  {f.fieldReference && (
                    <p className="text-xs text-foreground/50 mt-0.5">Ref: {f.fieldReference}</p>
                  )}
                </div>
                {/* tabs */}
                <TabBar className="mt-4">
                  <TabButton size="sm" active={drawerTab === "overview"} onClick={() => setDrawerTab("overview")}>Overview</TabButton>
                  <TabButton size="sm" active={drawerTab === "history"} onClick={() => setDrawerTab("history")}>Crop History</TabButton>
                  <TabButton size="sm" active={drawerTab === "nmp"} onClick={() => setDrawerTab("nmp")}>NMP</TabButton>
                </TabBar>
              </div>

              {/* body */}
              <div className="flex-1 overflow-y-auto p-6">

                {drawerTab === "overview" && (
                  <div className="space-y-5">
                    {/* field stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/[0.03] rounded-xl p-4">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Area</p>
                        <p className="text-base font-bold text-foreground">
                          {f.areaHectares ? `${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : "—"}
                        </p>
                      </div>
                      <div className="bg-black/[0.03] rounded-xl p-4">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Soil Type</p>
                        <p className="text-base font-bold text-foreground">{f.soilType || "—"}</p>
                      </div>
                    </div>

                    {/* current season crop */}
                    <div>
                      <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                        {selectedYear} Season
                      </p>
                      {currentCropForDrawer ? (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                              <Wheat className="w-3 h-3" />
                              {currentCropForDrawer.cropName}
                            </span>
                            {currentCropForDrawer.season && (
                              <span className="text-xs text-foreground/50">{currentCropForDrawer.season}</span>
                            )}
                          </div>
                          {currentCropForDrawer.plantingDate && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <CalendarDays className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>Planted <strong>{formatDate(currentCropForDrawer.plantingDate)}</strong></span>
                            </div>
                          )}
                          {currentCropForDrawer.expectedHarvestDate && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <Wheat className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span>Expected harvest <strong>{formatDate(currentCropForDrawer.expectedHarvestDate)}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-green-200 rounded-xl p-5 text-center">
                          <Leaf className="w-8 h-8 mx-auto text-green-300 mb-2" />
                          <p className="text-sm text-foreground/50">No crop assigned for {selectedYear}</p>
                          {selectedYear === CURRENT_YEAR && (
                            <button
                              onClick={() => { setSelectedFieldForHistory(null); setAssignForField(f); assignForm.reset(); }}
                              className="mt-3 text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                            >
                              + Assign a crop
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* quick link to history */}
                    {fieldAssignments.length > 1 && (
                      <button
                        onClick={() => setDrawerTab("history")}
                        className="w-full flex items-center justify-between text-sm text-foreground/60 hover:text-foreground border border-border/50 rounded-xl px-4 py-3 hover:bg-black/[0.02] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <History className="w-4 h-4" />
                          View full crop rotation history
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {drawerTab === "nmp" && (
                  <div>
                    <p className="text-sm text-foreground/50 mb-5">
                      Nutrient Management Plan entries for this field — showing N, P and K budgets from all recorded annual plans.
                    </p>
                    {fieldNmpQ.isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-black/5 animate-pulse" />)}
                      </div>
                    ) : !fieldNmpQ.data || fieldNmpQ.data.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed border-green-200 rounded-xl">
                        <FlaskConical className="w-10 h-10 mx-auto text-green-300 mb-3" />
                        <p className="text-foreground/40 text-sm font-medium">No NMP entries for this field yet</p>
                        <p className="text-foreground/30 text-xs mt-1">Go to the NMP page to create an annual plan and add field entries.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fieldNmpQ.data.map((entry: any) => (
                          <div key={entry.id} className="bg-white border border-border/50 rounded-xl overflow-hidden">
                            {/* Plan year header */}
                            <div className="bg-green-50 border-b border-green-100 px-4 py-2.5 flex items-center justify-between">
                              <span className="font-bold text-green-800 text-sm">{entry.planYear} Plan</span>
                              <div className="flex items-center gap-2">
                                {entry.cropType && (
                                  <span className="inline-flex items-center gap-1 bg-green-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    <Wheat className="w-3 h-3" />{entry.cropType}
                                  </span>
                                )}
                                {entry.approvedDate
                                  ? <span className="text-xs text-green-700 font-medium">✓ Approved</span>
                                  : <span className="text-xs text-amber-600 font-medium">Pending</span>}
                              </div>
                            </div>
                            {/* Nutrient values */}
                            <div className="px-4 py-3 grid grid-cols-3 gap-3">
                              <div className="text-center">
                                <p className="text-xs text-foreground/40 font-semibold uppercase mb-1">Nitrogen N</p>
                                <p className="font-bold text-blue-700 text-base">{entry.nitrogenKgHa ? `${entry.nitrogenKgHa}` : "—"}</p>
                                <p className="text-xs text-foreground/40">kg/ha</p>
                              </div>
                              <div className="text-center border-x border-border/30">
                                <p className="text-xs text-foreground/40 font-semibold uppercase mb-1">Phosphorus P</p>
                                <p className="font-bold text-purple-700 text-base">{entry.phosphorusKgHa ? `${entry.phosphorusKgHa}` : "—"}</p>
                                <p className="text-xs text-foreground/40">kg/ha</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-foreground/40 font-semibold uppercase mb-1">Potassium K</p>
                                <p className="font-bold text-amber-700 text-base">{entry.potassiumKgHa ? `${entry.potassiumKgHa}` : "—"}</p>
                                <p className="text-xs text-foreground/40">kg/ha</p>
                              </div>
                            </div>
                            {/* Manure / method details */}
                            {(entry.organicManureType || entry.applicationMethod) && (
                              <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-foreground/60">
                                {entry.organicManureType && entry.organicManureType !== "None" && (
                                  <span className="flex items-center gap-1">
                                    <Leaf className="w-3 h-3 text-green-600" />
                                    {entry.organicManureType}
                                    {entry.organicManureRate ? ` · ${entry.organicManureRate} t/ha` : ""}
                                  </span>
                                )}
                                {entry.applicationMethod && (
                                  <span className="flex items-center gap-1">
                                    <Sprout className="w-3 h-3 text-green-600" />
                                    {entry.applicationMethod}
                                  </span>
                                )}
                              </div>
                            )}
                            {entry.timingNotes && (
                              <div className="px-4 pb-3">
                                <p className="text-xs text-foreground/50 italic">"{entry.timingNotes}"</p>
                              </div>
                            )}
                            {entry.preparedBy && (
                              <div className="px-4 pb-3 text-xs text-foreground/40 border-t border-border/30 pt-2">
                                Prepared by: {entry.preparedBy}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === "history" && (
                  <div>
                    <p className="text-sm text-foreground/50 mb-5">
                      All recorded crop assignments for this field across all seasons.
                    </p>
                    {fieldAssignments.length === 0 ? (
                      <div className="py-12 text-center">
                        <History className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
                        <p className="text-foreground/40 text-sm">No crop history recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {fieldAssignments.map((a, i) => {
                          const isCurrent = i === 0 && a.year === CURRENT_YEAR;
                          return (
                            <div key={a.id} className="flex items-start gap-3">
                              {/* dot + connecting line */}
                              <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                                <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isCurrent ? "bg-green-600 border-green-600" : "bg-white border-border"}`} />
                                {i < fieldAssignments.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: "24px" }} />
                                )}
                              </div>
                              {/* card */}
                              <div className={`flex-1 rounded-xl border p-4 mb-0 ${isCurrent ? "border-green-200 bg-green-50" : "border-border/50 bg-black/[0.01]"}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isCurrent ? "bg-green-700 text-white" : "bg-black/5 text-foreground/70"}`}>
                                    <Wheat className="w-3 h-3" />
                                    {a.cropName}
                                  </span>
                                  <span className="text-xs font-bold text-foreground/40">
                                    {a.year ?? "—"}{a.season ? ` · ${a.season}` : ""}
                                  </span>
                                </div>
                                {a.plantingDate && (
                                  <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1">
                                    <CalendarDays className="w-3 h-3 flex-shrink-0" />
                                    Planted {formatDate(a.plantingDate)}
                                  </p>
                                )}
                                {a.expectedHarvestDate && (
                                  <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5">
                                    <Wheat className="w-3 h-3 flex-shrink-0 text-amber-500" />
                                    Harvest {formatDate(a.expectedHarvestDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── PRINT CROP REGISTER ── */}
      {printOpen && (
        <PrintCropRegister
          farmId={farmId}
          year={selectedYear}
          fields={fields}
          assignments={assignments}
          crops={crops}
          onClose={() => setPrintOpen(false)}
        />
      )}

      {/* ── ASSIGN CROP DIALOG ── */}
      <Dialog open={!!assignForField} onOpenChange={(o) => { if (!o) setAssignForField(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Assign Crop to {assignForField?.name || "Field"}
            </DialogTitle>
            <DialogDescription>
              Record what's being grown in this field for the {CURRENT_YEAR} season.
            </DialogDescription>
          </DialogHeader>

          {crops.length === 0 ? (
            <div className="py-6 text-center text-foreground/60 text-sm">
              <p>No crops in your register yet.</p>
              <p className="mt-1">Go to the <strong>Crops Register</strong> tab to add crops first.</p>
            </div>
          ) : (
            <form onSubmit={assignForm.handleSubmit(onSubmitAssign)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Crop</label>
                <select
                  {...assignForm.register("cropId", { required: true, valueAsNumber: true })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select a crop...</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.variety ? ` — ${c.variety}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Planting Date</label>
                  <Input type="date" {...assignForm.register("plantingDate")} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Expected Harvest</label>
                  <Input type="date" {...assignForm.register("expectedHarvestDate")} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Season</label>
                <Input {...assignForm.register("season")} placeholder="e.g. Winter 2025/26, Spring 2026" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAssignForField(null)}>Cancel</Button>
                <Button type="submit" disabled={assigningCrop}>{assigningCrop ? "Saving..." : "Assign Crop"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── SEED RECORDS TAB ── */}
      {tab === "seed" && <SeedDrillingSection farmId={farmId} fields={fields} />}
    </AppLayout>
  );
}
