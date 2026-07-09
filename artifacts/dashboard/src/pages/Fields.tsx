import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { Redirect, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printProReport } from "@/lib/print-report";
import { printSeedBagLabels } from "@/lib/print-labels";
import { cropYearOptions, cropYearLabel, currentCropYear, isInCropYear } from "@/lib/cropYear";
import { getEstablishmentPercent, calculateSeedRate, suggestTargetPopulation, BLACKGRASS_TARGET_POPULATION_M2 } from "@/lib/seedRateCalculator";
import { useToast } from "@/hooks/use-toast";
import { DocAttach } from "@/components/DocAttach";
import CropSeasonReport from "@/components/CropSeasonReport";

const CURRENT_YEAR = new Date().getFullYear();
const SEASON_OPTIONS = ["Autumn", "Winter", "Spring", "Summer"];

function deriveSeasonFromDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const month = d.getMonth() + 1;
  if (month >= 8 && month <= 10) return "Autumn";
  if (month === 11 || month === 12 || month === 1) return "Winter";
  if (month >= 2 && month <= 5) return "Spring";
  return "Summer";
}

interface FieldRecord {
  id: number;
  name?: string;
  fieldReference?: string;
  areaHectares?: string | number | null;
  farmableAreaHectares?: string | number | null;
  enclosedFeatureAreaHa?: number;
  computedFarmableAreaHa?: number;
  soilType?: string;
  currentUse?: string;
  isActive?: boolean;
  isNvz?: boolean;
  blackgrassRiskField?: boolean;
  latitude?: string | number | null;
  longitude?: string | number | null;
  tenureType?: string | null;
  landlordSupplierId?: number | null;
  tenancyStartDate?: string | null;
  tenancyEndDate?: string | null;
  annualRentPounds?: string | number | null;
  rentReviewDate?: string | null;
  tenureNotes?: string | null;
}

interface CropRecord {
  id: number;
  cropId?: number;
  name: string;
  variety?: string | null;
  category?: string | null;
}

interface CropDocRecord {
  id: number;
  cropId: number;
  title: string;
  documentUrl: string;
  documentName: string | null;
  uploadedAt: string;
}

interface FieldCropAssignment {
  id: number;
  fieldId: number;
  varietyId: number;
  cropId?: number;
  cropName: string;
  variety?: string | null;
  plantingDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string | null;
  season?: string;
  year?: number;
  notes?: string | null;
  seedRate?: string | null;
  seedUnit?: string | null;
  tgwGrams?: string | null;
  targetPlantPopulationM2?: string | null;
  estimatedEstablishmentPercent?: string | null;
  calculatedSeedRateKgHa?: string | null;
  targetRowSpacingCm?: string | null;
  seedBatchId?: number | null;
  bagsAllocated?: number | null;
  labelsGeneratedAt?: string | null;
}

interface FieldFormData { name: string; areaHectares: number; soilType: string; fieldReference?: string; blackgrassRiskField?: boolean; }
interface CropFormData { name: string; variety: string; category: string; }
interface AssignCropFormData {
  varietyId: number;
  plantingDate: string;
  expectedHarvestDate: string;
  season: string;
  targetPlantPopulationM2: string;
  tgwGrams: string;
  targetRowSpacingCm: string;
  seedRate: string;
  seedUnit: string;
  seedBatchId: string;
}

interface SeedBatchRecord {
  id: number;
  farmId: number;
  cropId: number;
  cropName: string;
  varietyId: number;
  varietyName: string | null;
  supplierId: number | null;
  supplierName: string | null;
  batchNumber: string;
  tgwGrams: string;
  bagWeightKg: string;
  quantityReceivedKg: string;
  quantityRemainingKg: string;
  dateReceived: string | null;
  treatmentNotes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface LandUseRecord {
  id: number;
  fieldId: number;
  fieldName?: string;
  fieldReference?: string;
  fieldAreaHectares?: string | number | null;
  year: number;
  season?: string | null;
  landUse: string;
  schemeActionCode?: string | null;
  schemeReference?: string | null;
  areaHectares?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
  managementNotes?: string | null;
  createdAt: string;
}
interface LandUseFormData {
  landUse: string;
  year: string;
  season: string;
  schemeActionCode: string;
  schemeReference: string;
  areaHectares: string;
  startDate: string;
  endDate: string;
  managementNotes: string;
}

const LAND_USE_OPTIONS = [
  { value: "fallow",                   label: "Fallow",                    icon: "🌾" },
  { value: "sfi",                      label: "SFI Action",                icon: "🌿" },
  { value: "countryside_stewardship",  label: "Countryside Stewardship",   icon: "🦋" },
  { value: "permanent_grassland",      label: "Permanent Grassland",       icon: "🌱" },
  { value: "woodland",                 label: "Woodland",                  icon: "🌳" },
  { value: "set_aside",                label: "Set-aside",                 icon: "⏸️" },
  { value: "out_of_production",        label: "Out of Production",         icon: "🚫" },
  { value: "other",                    label: "Other",                     icon: "📋" },
];
const LAND_USE_LABEL: Record<string, string> = Object.fromEntries(LAND_USE_OPTIONS.map(o => [o.value, o.label]));
const LAND_USE_BADGE: Record<string, string> = {
  fallow:                  "bg-amber-100 text-amber-800 border-amber-300",
  sfi:                     "bg-teal-100 text-teal-800 border-teal-300",
  countryside_stewardship: "bg-purple-100 text-purple-800 border-purple-300",
  permanent_grassland:     "bg-green-100 text-green-700 border-green-300",
  woodland:                "bg-emerald-100 text-emerald-800 border-emerald-300",
  set_aside:               "bg-stone-100 text-stone-700 border-stone-300",
  out_of_production:       "bg-red-100 text-red-700 border-red-300",
  other:                   "bg-slate-100 text-slate-700 border-slate-300",
};
const SCHEME_CODES_NEEDED = new Set(["sfi", "countryside_stewardship"]);

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function harvestVarianceDays(expected?: string | null, actual?: string | null): number | null {
  if (!expected || !actual) return null;
  const e = new Date(expected), a = new Date(actual);
  if (isNaN(e.getTime()) || isNaN(a.getTime())) return null;
  return Math.round((a.getTime() - e.getTime()) / 86400000);
}

function VarianceBadge({ days, size = "sm" }: { days: number | null; size?: "xs" | "sm" }) {
  if (days === null) return null;
  const textSize = size === "xs" ? "0.65rem" : "0.7rem";
  const pad = size === "xs" ? "1px 5px" : "2px 7px";
  if (days === 0) return (
    <span style={{ fontSize: textSize, fontWeight: 600, padding: pad, borderRadius: 99, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", whiteSpace: "nowrap" }}>
      On time
    </span>
  );
  if (days > 0) return (
    <span style={{ fontSize: textSize, fontWeight: 600, padding: pad, borderRadius: 99, background: days > 7 ? "#fee2e2" : "#fef3c7", color: days > 7 ? "#b91c1c" : "#92400e", border: `1px solid ${days > 7 ? "#fca5a5" : "#fde68a"}`, whiteSpace: "nowrap" }}>
      +{days}d late
    </span>
  );
  return (
    <span style={{ fontSize: textSize, fontWeight: 600, padding: pad, borderRadius: 99, background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe", whiteSpace: "nowrap" }}>
      {days}d early
    </span>
  );
}

function HarvestNoteEditor({ assignmentId, farmId, initialNote }: {
  assignmentId: number;
  farmId: number;
  initialNote?: string | null;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(initialNote ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { setText(initialNote ?? ""); }, [initialNote]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/farms/${farmId}/field-crops/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: text.trim() || null }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: getListFieldCropAssignmentsQueryKey(farmId) });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div style={{ marginTop: 6 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note to explain the harvest variance…"
          rows={2}
          style={{
            width: "100%", fontSize: "0.72rem", borderRadius: 8, border: "1px solid #d1d5db",
            padding: "5px 8px", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5,
            backgroundColor: "#fff",
          }}
        />
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#16a34a", color: "#fff", border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => { setEditing(false); setText(initialNote ?? ""); }}
            style={{ fontSize: "0.7rem", fontWeight: 500, padding: "3px 10px", borderRadius: 6, background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 5, marginTop: 5 }}>
      <StickyNote style={{ width: 11, height: 11, color: "#9ca3af", flexShrink: 0, marginTop: 1 }} />
      {text ? (
        <span style={{ fontSize: "0.72rem", color: "#6b7280", fontStyle: "italic", flex: 1, lineHeight: 1.4 }}>{text}</span>
      ) : (
        <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>No harvest note</span>
      )}
      <button
        onClick={() => setEditing(true)}
        title="Edit harvest note"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "#9ca3af", flexShrink: 0 }}
      >
        <Pencil style={{ width: 10, height: 10 }} />
      </button>
    </div>
  );
}

interface Farm { name?: string; address?: string; postcode?: string; cphNumber?: string; redTractorId?: string | null; }
interface PrintableAssignment extends FieldCropAssignment { fieldName?: string; soilType?: string; areaHectares?: string | number | null; fieldReference?: string; }

function PrintCropRegister({ farmId, year, fields, assignments, crops, landUseRecords, onClose }: {
  farmId: number;
  year: number;
  fields: FieldRecord[];
  assignments: FieldCropAssignment[];
  crops: CropRecord[];
  landUseRecords: LandUseRecord[];
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

  type FieldUseRow = {
    fieldId: number; fieldName?: string; fieldReference?: string;
    soilType?: string; areaHectares?: string | number | null;
    type: "crop" | "landuse" | "none";
    cropName?: string; season?: string | null;
    plantingDate?: string; expectedHarvestDate?: string; actualHarvestDate?: string | null;
    notes?: string | null;
    landUseLabel?: string; schemeActionCode?: string | null; schemeReference?: string | null;
    startDate?: string | null; endDate?: string | null; managementNotes?: string | null;
  };

  const rows: FieldUseRow[] = fields.map(f => {
    const asgn = assignments.find(a => a.fieldId === f.id && (a.year === year || (!a.year && year === CURRENT_YEAR)));
    if (asgn) {
      const cropVar = crops.find(c => c.id === asgn.varietyId);
      const cropName = cropVar ? (cropVar.name + (cropVar.variety ? ` — ${cropVar.variety}` : "")) : (asgn.cropName ?? "—");
      return { fieldId: f.id, fieldName: f.name, fieldReference: f.fieldReference, soilType: f.soilType, areaHectares: f.areaHectares, type: "crop", cropName, season: asgn.season, plantingDate: asgn.plantingDate, expectedHarvestDate: asgn.expectedHarvestDate, actualHarvestDate: asgn.actualHarvestDate, notes: asgn.notes };
    }
    const lu = landUseRecords.find(r => r.fieldId === f.id && r.year === year);
    if (lu) {
      return { fieldId: f.id, fieldName: f.name, fieldReference: f.fieldReference, soilType: f.soilType, areaHectares: f.areaHectares, type: "landuse", landUseLabel: LAND_USE_LABEL[lu.landUse] ?? lu.landUse, season: lu.season, schemeActionCode: lu.schemeActionCode, schemeReference: lu.schemeReference, startDate: lu.startDate, endDate: lu.endDate, managementNotes: lu.managementNotes };
    }
    return { fieldId: f.id, fieldName: f.name, fieldReference: f.fieldReference, soilType: f.soilType, areaHectares: f.areaHectares, type: "none" };
  });

  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const hasActual = rows.some(r => r.actualHarvestDate);
  const hasScheme = rows.some(r => r.schemeActionCode || r.schemeReference);

  const handlePrint = () => {
    const tableHtml = `<table><thead><tr>
      <th>Field Name</th><th>Ref</th><th>Area (ha)</th><th>Soil Type</th><th>Crop / Land Use</th><th>Season</th>
      <th>Planted / Start</th><th>Harvest / End</th>
      ${hasActual ? "<th>Actual Harvest</th><th>Variance</th>" : ""}
      ${hasScheme ? "<th>Scheme / Action Code</th>" : ""}
    </tr></thead><tbody>${rows.map(row => {
      const useLabel = row.type === "crop" ? row.cropName ?? "—" : row.type === "landuse" ? (row.landUseLabel ?? "—") + (row.schemeActionCode ? ` (${row.schemeActionCode})` : "") : "Not recorded";
      const vd = harvestVarianceDays(row.expectedHarvestDate, row.actualHarvestDate);
      const varianceText = vd === null ? "—" : vd === 0 ? "On time" : vd > 0 ? `+${vd}d late` : `${vd}d early`;
      return `<tr>
      <td><strong>${row.fieldName || "Field #" + row.fieldId}</strong></td>
      <td style="color:#6b7280">${row.fieldReference || "—"}</td>
      <td>${row.areaHectares ? parseFloat(String(row.areaHectares)).toFixed(2) : "—"}</td>
      <td>${row.soilType || "—"}</td>
      <td style="${row.type === "none" ? "color:#9ca3af;font-style:italic" : "font-weight:600"}">${useLabel}</td>
      <td>${row.season || "—"}</td>
      <td style="white-space:nowrap">${(row.type === "crop" ? formatDate(row.plantingDate) : formatDate(row.startDate)) || "—"}</td>
      <td style="white-space:nowrap">${(row.type === "crop" ? formatDate(row.expectedHarvestDate) : formatDate(row.endDate)) || "—"}</td>
      ${hasActual ? `<td style="white-space:nowrap">${formatDate(row.actualHarvestDate) || "—"}</td><td>${varianceText}</td>` : ""}
      ${hasScheme ? `<td style="color:#6b7280">${row.schemeReference || row.schemeActionCode || "—"}</td>` : ""}
    </tr>`;
    }).join("")}</tbody></table>
    <p style="font-size:7px;color:#6b7280;margin:6px 0 0">
      <strong>${fields.length}</strong> field${fields.length !== 1 ? "s" : ""} total  ·
      <strong>${rows.filter(r => r.type === "crop").length}</strong> with crop  ·
      <strong>${rows.filter(r => r.type === "landuse").length}</strong> non-crop land use  ·
      <strong>${rows.filter(r => r.type === "none").length}</strong> not recorded
    </p>`;
    printProReport({
      title: "Field Use Register",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      redTractorId: farm?.redTractorId ?? undefined,
      extraMeta: `Season: ${year}`,
      recordCount: fields.length,
      recordLabel: "field",
      tableHtml,
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-green-600" />
            Field Use Register — {year} Season
          </DialogTitle>
          <DialogDescription>
            Review the record below, then click Print to produce a compliance document for Red Tractor audit. Covers all fields with crops or non-crop land use recorded.
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
              <p className="font-semibold text-foreground text-sm">Field Use Register</p>
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
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Soil</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Crop / Land Use</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Season</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Planted / Start</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Harvest / End</th>
                  {hasActual && (
                    <>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Actual Harvest</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Variance</th>
                    </>
                  )}
                  {hasScheme && (
                    <th className="border border-border/60 px-3 py-2 text-left font-semibold">Scheme / Ref</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const varianceDays = harvestVarianceDays(row.expectedHarvestDate, row.actualHarvestDate);
                  const useCell = row.type === "crop"
                    ? <span className="font-semibold">{row.cropName}</span>
                    : row.type === "landuse"
                    ? <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${LAND_USE_BADGE[row.landUseLabel ? Object.keys(LAND_USE_BADGE)[LAND_USE_OPTIONS.findIndex(o => o.label === row.landUseLabel)] ?? "other" : "other"]}`}>{row.landUseLabel}</span>
                    : <span className="text-foreground/30 italic text-[10px]">Not recorded</span>;
                  return (
                    <tr key={row.fieldId} className={i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}>
                      <td className="border border-border/60 px-3 py-2 font-medium">{row.fieldName || `Field #${row.fieldId}`}</td>
                      <td className="border border-border/60 px-3 py-2 text-foreground/60 font-mono text-[10px]">{row.fieldReference || "—"}</td>
                      <td className="border border-border/60 px-3 py-2">{row.areaHectares ? parseFloat(String(row.areaHectares)).toFixed(2) : "—"}</td>
                      <td className="border border-border/60 px-3 py-2">{row.soilType || "—"}</td>
                      <td className="border border-border/60 px-3 py-2">{useCell}</td>
                      <td className="border border-border/60 px-3 py-2">{row.season || "—"}</td>
                      <td className="border border-border/60 px-3 py-2 whitespace-nowrap">{row.type === "crop" ? (formatDate(row.plantingDate) || "—") : (formatDate(row.startDate) || "—")}</td>
                      <td className="border border-border/60 px-3 py-2 whitespace-nowrap">{row.type === "crop" ? (formatDate(row.expectedHarvestDate) || "—") : (formatDate(row.endDate) || "—")}</td>
                      {hasActual && (
                        <>
                          <td className="border border-border/60 px-3 py-2 whitespace-nowrap">{formatDate(row.actualHarvestDate) || "—"}</td>
                          <td className="border border-border/60 px-3 py-2">
                            {varianceDays !== null ? <VarianceBadge days={varianceDays} size="xs" /> : <span className="text-foreground/30">—</span>}
                          </td>
                        </>
                      )}
                      {hasScheme && (
                        <td className="border border-border/60 px-3 py-2 text-foreground/60">
                          {row.schemeActionCode && <span className="font-mono font-semibold text-teal-700">{row.schemeActionCode}</span>}
                          {row.schemeReference && <span className="block text-[10px] text-foreground/50">{row.schemeReference}</span>}
                          {!row.schemeActionCode && !row.schemeReference && "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-foreground/60 border-t">
            <span><strong className="text-foreground">{fields.length}</strong> field{fields.length !== 1 ? "s" : ""} total</span>
            <span><strong className="text-foreground">{rows.filter(r => r.type === "crop").length}</strong> with crop assigned</span>
            <span><strong className="text-foreground">{rows.filter(r => r.type === "landuse").length}</strong> non-crop land use</span>
            {rows.filter(r => r.type === "none").length > 0 && (
              <span className="text-amber-600"><strong>{rows.filter(r => r.type === "none").length}</strong> not yet recorded</span>
            )}
          </div>

          {/* Footer */}
          <div className="text-xs text-foreground/40 border-t pt-3 flex items-center justify-between">
            <span className="italic">
              On-farm record for Red Tractor and RPA compliance. Retain for a minimum of 3 years and make available for inspection.
            </span>
            <span className="font-medium not-italic text-foreground/50 ml-4 whitespace-nowrap">BDE Farm Trac · {printedDate}</span>
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

const FIELD_LABEL_CSS = `@page{size:62mm 90mm;margin:0}body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}.brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em}.divider{border-color:#e5e7eb}.farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}svg{display:block;margin:0 auto}.code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}.iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}.hint{font-size:8px;color:#d1d5db;margin-top:4px}`;

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
  const [savedCode, setSavedCode] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { mutate: updateField, isPending: isUpdating } = useUpdateField(farmId);
  const { mutate: deleteField, isPending: isDeleting } = useDeleteField(farmId);

  const autoCode = `FLD-${String(field.id).padStart(4, "0")}`;
  const displayCode = savedCode || (field as any).fieldCode || null;
  const qrRef = useRef<HTMLDivElement>(null);
  const { data: fData } = useQuery<{ record: { name: string } }>({
    queryKey: ["farm", farmId],
    queryFn: async () => (await fetch(`/api/farms/${farmId}`)).json(),
  });
  const farmName = fData?.record?.name ?? "BDE Farm";
  const qrValue = `BDE:F${farmId}:${displayCode ?? autoCode}`;
  function handleQrPrint() {
    const win = window.open("", "_blank");
    if (!win || !qrRef.current) return;
    win.document.write(`<html><head><title>Field Label — ${displayCode}</title><style>${FIELD_LABEL_CSS}</style></head><body>${qrRef.current.innerHTML}</body></html>`);
    win.document.close(); win.focus(); win.addEventListener("afterprint", () => win.close()); win.print();
  }

  const saveFieldCode = async (code: string) => {
    setIsSavingCode(true);
    try {
      const res = await fetch(`/api/farms/${farmId}/fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldCode: code }),
        credentials: "include",
      });
      if (res.ok) {
        setSavedCode(code);
        queryClient.invalidateQueries({ queryKey: getListFieldsQueryKey(farmId) });
      }
    } finally {
      setIsSavingCode(false);
    }
  };

  const { register, handleSubmit, reset } = useForm<FieldFormData>({
    defaultValues: { name: field.name ?? "", areaHectares: parseFloat(String(field.areaHectares ?? 0)), soilType: field.soilType ?? "", fieldReference: (field as any).fieldReference ?? "" },
  });

  const handleEdit = (values: FieldFormData) => {
    updateField({ farmId, recordId: field.id, data: values as any }, { onSuccess: () => { setEditOpen(false); reset(values); } });
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
            <MapIcon className="w-4 h-4 text-blue-600" />
            Draw boundary on map
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setQrOpen(true)}>
            <QrCode className="w-4 h-4 text-teal-600" />
            {displayCode ? "View QR label" : "Generate QR label"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setEditOpen(true); reset({ name: field.name ?? "", areaHectares: parseFloat(String(field.areaHectares ?? 0)), soilType: field.soilType ?? "", fieldReference: (field as any).fieldReference ?? "", blackgrassRiskField: (field as any).blackgrassRiskField ?? false } as any); }}>
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
          {displayCode ? (
            <>
              <div className="flex flex-col items-center gap-1.5 py-2 border rounded-xl bg-white px-5 shadow-sm" ref={qrRef}>
                <p className="brand text-[11px] font-bold text-teal-700 tracking-widest mt-1">🌿 BDE Farm Trac</p>
                <hr className="divider w-full border-gray-200" />
                <p className="farm text-sm font-bold text-gray-900 uppercase tracking-wider">{farmName}</p>
                <QRCodeSVG value={qrValue} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
                <p className="code font-mono text-xl font-bold tracking-widest text-teal-700 mt-1">{displayCode}</p>
                <p className="iname text-sm font-semibold text-gray-700">{field.name}</p>
                <p className="hint text-[10px] text-gray-300 mb-1">Scan to view field record</p>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setQrOpen(false)}>Close</Button>
                <Button size="sm" onClick={handleQrPrint} className="gap-2"><Printer className="w-3.5 h-3.5" /> Print Label</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <QrCode className="w-16 h-16 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground text-center">No QR code generated yet. Click below to assign code <strong className="font-mono">{autoCode}</strong> to this field.</p>
              <Button onClick={() => saveFieldCode(autoCode)} disabled={isSavingCode} className="gap-2">
                {isSavingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                Generate QR Code
              </Button>
            </div>
          )}
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
            <div>
              <label className="text-sm font-medium mb-1 block">RPA Parcel Reference</label>
              <Input {...register("fieldReference")} placeholder="e.g. TF 1234 5678" />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in the{" "}
                <a href="https://www.ruralpayments.service.gov.uk" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                  Rural Payments portal
                </a>{" "}
                or on any RPA correspondence.
              </p>
            </div>
            <div className="border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" {...register("blackgrassRiskField")} className="rounded" />
                Black-grass risk field
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Tracks this field in the Black-grass Five-in-Five cultural control view (Crop History &amp; Season Reports).
              </p>
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

function SeedDrillingSection({ farmId, fields }: { farmId: number; fields: FieldRecord[] }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState<number>(() => currentCropYear());
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
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { error?: string }).error ?? "Failed to update record"); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setEditingRecord(null); setShowForm(false); setFormData(EMPTY_SEED); setAreaWarning(null); setPendingBody(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["seed-drilling", farmId] }); setDeleteId(null); },
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

interface CropComparisonEntry {
  id: number;
  fieldId: number;
  fieldName: string;
  fieldReference?: string | null;
  fieldAreaHectares?: string | number | null;
  year: number | null;
  season?: string | null;
  plantingDate?: string | null;
  expectedHarvestDate?: string | null;
  actualHarvestDate?: string | null;
  totalYieldTonnes?: string | null;
  totalAreaHarvestedHa?: string | null;
  avgMoisturePercent?: string | null;
  qualityGrades?: string | null;
  harvestCount: number;
  yieldTha: number | null;
  hasHarvest: boolean;
}
interface CropComparisonData {
  comparisons: CropComparisonEntry[];
  farmAvgYieldTha: number | null;
  maxYieldTha: number | null;
  minYieldTha: number | null;
}

function SeasonRainfallBadge({ lat, lng, startDate, endDate }: {
  lat: string | number | null | undefined;
  lng: string | number | null | undefined;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const start = startDate?.slice(0, 10) ?? null;
  const rawEnd = endDate?.slice(0, 10) ?? null;
  const end = rawEnd ? (rawEnd > today ? today : rawEnd) : today;
  const enabled = !!(lat && lng && start && start < end);

  const { data: totalMm, isLoading, isError } = useQuery<number | null>({
    queryKey: ["season-rainfall", String(lat), String(lng), start, end],
    queryFn: async () => {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&daily=precipitation_sum&timezone=Europe%2FLondon`;
      const r = await fetch(url);
      if (!r.ok) throw new Error("Weather fetch failed");
      const data = await r.json();
      const dailySums: (number | null)[] = data?.daily?.precipitation_sum ?? [];
      return Math.round(dailySums.reduce<number>((s, v) => s + (v ?? 0), 0));
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  if (!enabled) return null;
  if (isLoading) return (
    <span className="inline-flex items-center gap-1 text-[11px] text-foreground/30 mt-1">
      <CloudRain className="w-3 h-3" />
      <span className="animate-pulse">Loading rainfall…</span>
    </span>
  );
  if (isError || totalMm === null || totalMm === undefined) return null;

  const label = totalMm < 200 ? "Very dry" : totalMm < 300 ? "Dry" : totalMm < 450 ? "Normal" : totalMm < 600 ? "Wet" : "Very wet";
  const cls = totalMm < 200 ? "text-orange-600 bg-orange-50 border-orange-200"
    : totalMm < 300 ? "text-amber-600 bg-amber-50 border-amber-200"
    : totalMm < 450 ? "text-teal-700 bg-teal-50 border-teal-200"
    : totalMm < 600 ? "text-blue-600 bg-blue-50 border-blue-200"
    : "text-indigo-700 bg-indigo-50 border-indigo-200";

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border mt-1 ${cls}`}>
      <CloudRain className="w-3 h-3" />
      {totalMm} mm · {label}
    </span>
  );
}

export default function FieldsPage() {
  const { farmId } = useAppStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"fields" | "crops" | "seed" | "tenure" | "rotation" | "map">("fields");
  const [search, setSearch] = useState("");
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [assignForField, setAssignForField] = useState<FieldRecord | null>(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedFieldForHistory, setSelectedFieldForHistory] = useState<FieldRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "history" | "nmp" | "tenure">("overview");
  const [tenureEditMode, setTenureEditMode] = useState(false);
  const [isSavingTenure, setIsSavingTenure] = useState(false);
  const [tenureForm, setTenureForm] = useState<{
    tenureType: string;
    landlordSupplierId: string;
    tenancyStartDate: string;
    tenancyEndDate: string;
    annualRentPounds: string;
    rentReviewDate: string;
    tenureNotes: string;
  }>({ tenureType: "owned", landlordSupplierId: "__none__", tenancyStartDate: "", tenancyEndDate: "", annualRentPounds: "", rentReviewDate: "", tenureNotes: "" });
  const [showAddLandlordDialog, setShowAddLandlordDialog] = useState(false);
  const [landlordQuickForm, setLandlordQuickForm] = useState({ name: "", contactName: "", phone: "", address: "" });
  const [savingLandlord, setSavingLandlord] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [expandedVarietyId, setExpandedVarietyId] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingCrop, setEditingCrop] = useState<CropRecord | null>(null);
  const [editCropForm, setEditCropForm] = useState({ name: "", variety: "", category: "", notes: "" });
  const [editCropSaving, setEditCropSaving] = useState(false);
  const [addingVarietyCropId, setAddingVarietyCropId] = useState<number | null>(null);
  const [addVarietyForm, setAddVarietyForm] = useState({ variety: "", notes: "" });
  const [addVarietySaving, setAddVarietySaving] = useState(false);
  const [deletingVarietyId, setDeletingVarietyId] = useState<number | null>(null);
  const [landUseForField, setLandUseForField] = useState<FieldRecord | null>(null);
  const [editingLandUseRecord, setEditingLandUseRecord] = useState<LandUseRecord | null>(null);
  const [comparisonVarietyId, setComparisonVarietyId] = useState<number | null>(null);
  const [comparisonAssignmentId, setComparisonAssignmentId] = useState<number | null>(null);
  const [reportAssignmentId, setReportAssignmentId] = useState<number | null>(null);

  // All hooks must be called unconditionally before any early return
  const safeFarmId = farmId ?? 0;
  const { data: fieldsData, isLoading: fieldsLoading, refetch: fieldsRefetch } = useFields(safeFarmId);
  const { data: cropsData, isLoading: cropsLoading } = useCrops(safeFarmId);
  const { data: assignmentsData } = useFieldCropAssignments(safeFarmId);
  const fieldNmpQ = useQuery({
    queryKey: ["field-nmp-entries", safeFarmId, selectedFieldForHistory?.id, drawerTab],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/fields/${selectedFieldForHistory?.id}/nmp-entries`).then(r => r.json()),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "nmp",
    select: (d: any) => d.entries ?? [],
  });

  type FieldHarvestRecord = {
    id: number;
    fieldCropAssignmentId: number;
    yieldTonnes: string | null;
    areaHarvestedHa: string | null;
    moisturePercent: string | null;
    qualityGrade: string | null;
    harvestDate: string;
  };
  const fieldHarvestsQ = useQuery<FieldHarvestRecord[]>({
    queryKey: ["field-harvests", safeFarmId, selectedFieldForHistory?.id],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/harvests?fieldId=${selectedFieldForHistory?.id}`)
        .then(r => r.json())
        .then((d: { records?: FieldHarvestRecord[] }) => d.records ?? []),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "history",
  });
  const fieldHarvests: FieldHarvestRecord[] = fieldHarvestsQ.data ?? [];

  type PillarKey = "ploughing" | "delayedDrilling" | "springCropping" | "higherSeedRate" | "fallowCover";
  type SeasonPillarResult = {
    year: number;
    season: string | null;
    pillars: Record<PillarKey, boolean>;
    pillarsUsedCount: number;
    herbicideMoaGroupsUsed: string[];
  };
  type RecommendationSeverity = "high" | "medium" | "low";
  type FieldRecommendation = {
    key: string;
    severity: RecommendationSeverity;
    title: string;
    detail: string;
  };
  type FiveInFiveScore = {
    fieldId: number;
    fieldName: string;
    blackgrassRiskField: boolean;
    seasons: SeasonPillarResult[];
    distinctPillarsUsed: PillarKey[];
    distinctPillarCount: number;
    moaRepetitionRisk: boolean;
    moaRepeatedGroup: string | null;
    recommendations: FieldRecommendation[];
  };
  const RECOMMENDATION_SEVERITY_STYLES: Record<RecommendationSeverity, string> = {
    high: "border-red-200 bg-red-50 text-red-800",
    medium: "border-amber-200 bg-amber-50 text-amber-800",
    low: "border-blue-200 bg-blue-50 text-blue-800",
  };
  const PILLAR_LABELS: Record<PillarKey, { label: string; detail: string }> = {
    ploughing: { label: "Rotational ploughing", detail: "Primary inversion cultivation used this season" },
    delayedDrilling: { label: "Delayed autumn drilling", detail: "Drilled after the stale-seedbed cut-off (1 Oct)" },
    springCropping: { label: "Spring cropping", detail: "Spring-sown crop breaks the autumn germination window" },
    higherSeedRate: { label: "Higher seed rate", detail: "Denser crop competition suppresses black-grass" },
    fallowCover: { label: "Fallow / cover crop", detail: "A reset season with no autumn cash crop" },
  };
  const fiveInFiveQ = useQuery<FiveInFiveScore | null>({
    queryKey: ["field-five-in-five", safeFarmId, selectedFieldForHistory?.id],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/fields/${selectedFieldForHistory?.id}/blackgrass-five-in-five`)
        .then(r => r.ok ? r.json() : null),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "history" && !!(selectedFieldForHistory as any)?.blackgrassRiskField,
  });
  const fiveInFiveScore = fiveInFiveQ.data ?? null;

  const [isUploadingCropDoc, setIsUploadingCropDoc] = useState(false);
  const expandedCropTypeId = expandedVarietyId
    ? (cropsData?.records as CropRecord[] | undefined)?.find(c => c.id === expandedVarietyId)?.cropId ?? null
    : null;
  const cropDocsQ = useQuery<CropDocRecord[]>({
    queryKey: ["crop-docs", safeFarmId, expandedCropTypeId],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/crops/${expandedCropTypeId}/documents`)
        .then(r => r.json())
        .then((d: { documents?: CropDocRecord[] }) => d.documents ?? []),
    enabled: !!farmId && !!expandedCropTypeId,
  });
  const cropDocs: CropDocRecord[] = cropDocsQ.data ?? [];

  const tenureDocsQ = useQuery({
    queryKey: ["field-tenure-docs", safeFarmId, selectedFieldForHistory?.id],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/fields/${selectedFieldForHistory?.id}/tenure-documents`).then(r => r.json()).then(d => d.documents ?? []),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "tenure",
  });

  const biofuelDeclQ = useQuery({
    queryKey: ["biofuel-field-declarations", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/biofuel/field-declarations`).then(r => r.ok ? r.json() : { records: [] }).then(d => (d.records ?? []) as { fieldName: string; eligibilityStatus: string; highCarbonStockRisk: boolean; highBiodiversityRisk: boolean }[]),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  const biofuelDeclarations: { fieldName: string; eligibilityStatus: string; highCarbonStockRisk: boolean; highBiodiversityRisk: boolean }[] = biofuelDeclQ.data ?? [];

  const landlordSuppliersQ = useQuery({
    queryKey: ["farm-landlords", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/landlords`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const landlordSuppliers: { id: number; name: string; contactName?: string | null; phone?: string | null; email?: string | null; address?: string | null }[] = landlordSuppliersQ.data ?? [];

  const landUseQ = useQuery<LandUseRecord[]>({
    queryKey: ["field-season-land-use", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/field-season-land-use`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const landUseRecords: LandUseRecord[] = landUseQ.data ?? [];

  const farmCoordsQ = useQuery({
    queryKey: ["farm-coords", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 10 * 60 * 1000,
    select: (d: any) => {
      const src = d?.farm ?? d?.result ?? d ?? {};
      return {
        lat: src.latitude ?? null,
        lng: src.longitude ?? null,
      } as { lat: string | null; lng: string | null };
    },
  });
  const farmLat = farmCoordsQ.data?.lat ?? null;
  const farmLng = farmCoordsQ.data?.lng ?? null;

  const comparisonQ = useQuery<CropComparisonData>({
    queryKey: ["crop-performance-comparison", safeFarmId, comparisonVarietyId],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/crop-performance-comparison?varietyId=${comparisonVarietyId}`)
        .then(r => r.json()),
    enabled: !!comparisonVarietyId && !!farmId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setComparisonVarietyId(null);
    setComparisonAssignmentId(null);
  }, [selectedFieldForHistory?.id]);

  const createLandUseMut = useMutation({
    mutationFn: (data: Partial<LandUseRecord> & { fieldId: number; year: number; landUse: string }) =>
      fetch(`/api/farms/${safeFarmId}/field-season-land-use`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["field-season-land-use", safeFarmId] }); },
  });
  const updateLandUseMut = useMutation({
    mutationFn: ({ id, ...data }: Partial<LandUseRecord> & { id: number }) =>
      fetch(`/api/farms/${safeFarmId}/field-season-land-use/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["field-season-land-use", safeFarmId] }); },
  });
  const deleteLandUseMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${safeFarmId}/field-season-land-use/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["field-season-land-use", safeFarmId] }); },
  });

  const { uploadFile, isUploading: isUploadingTenureDoc } = useUpload();

  const { mutate: createField, isPending: creatingField } = useAddField(safeFarmId);
  const { mutate: createCrop, isPending: creatingCrop } = useAddCrop(safeFarmId);
  const { mutate: assignCrop, isPending: assigningCrop } = useAssignCrop(safeFarmId);

  const fieldForm = useForm<FieldFormData>();
  const cropForm = useForm<CropFormData>();
  const assignForm = useForm<AssignCropFormData>();
  const [seasonManuallySet, setSeasonManuallySet] = useState(false);
  const [tgwManuallySet, setTgwManuallySet] = useState(false);
  const watchedAssignVarietyId = assignForm.watch("varietyId");
  const { data: seedBatchesForVariety } = useListSeedBatches(
    safeFarmId,
    watchedAssignVarietyId ? { varietyId: Number(watchedAssignVarietyId) } : undefined,
    { query: { enabled: !!safeFarmId && !!watchedAssignVarietyId } as any },
  );
  const { data: allSeedBatchesData } = useListSeedBatches(
    safeFarmId,
    undefined,
    { query: { enabled: !!safeFarmId } as any },
  );
  const allSeedBatches: SeedBatchRecord[] = ((allSeedBatchesData as any)?.records ?? []) as SeedBatchRecord[];
  const { data: currentFarmData } = useQuery<{ record: { name?: string; cphNumber?: string } }>({
    queryKey: ["farm", safeFarmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${safeFarmId}`);
      return r.json();
    },
    enabled: !!safeFarmId,
  });
  const currentFarm = currentFarmData?.record;
  const { mutate: generateLabels, isPending: generatingLabelsForId } = useGenerateFieldCropLabels();
  const [labelCountDraft, setLabelCountDraft] = useState<Record<number, string>>({});

  const handleGenerateLabels = async (a: FieldCropAssignment) => {
    const batch = allSeedBatches.find(b => b.id === a.seedBatchId);
    if (!batch) return;
    const defaultCount = a.bagsAllocated ?? 1;
    const raw = labelCountDraft[a.id];
    const count = raw !== undefined && raw !== "" ? Math.max(1, parseInt(raw, 10) || defaultCount) : defaultCount;
    const field = fields.find(f => f.id === a.fieldId);
    await printSeedBagLabels(
      {
        batchId: (batch as unknown as { id: number }).id,
        cropName: a.cropName,
        varietyName: a.variety,
        batchNumber: batch.batchNumber,
        supplierName: batch.supplierName ?? null,
        tgwGrams: batch.tgwGrams,
        quantityReceivedKg: (batch as unknown as { quantityReceivedKg?: string | number }).quantityReceivedKg ?? null,
        treatmentNotes: (batch as unknown as { treatmentNotes?: string | null }).treatmentNotes ?? null,
        fieldName: field?.name ?? null,
        fieldReference: field?.fieldReference ?? null,
        plantingDate: a.plantingDate ? formatDate(a.plantingDate) : null,
        farmName: currentFarm?.name ?? null,
        cphNumber: currentFarm?.cphNumber ?? null,
      },
      count
    );
    generateLabels({ farmId: safeFarmId, recordId: a.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFieldCropAssignmentsQueryKey(safeFarmId) });
      },
    });
  };
  const availableSeedBatches: SeedBatchRecord[] = (
    ((seedBatchesForVariety as any)?.records ?? []) as SeedBatchRecord[]
  ).filter((b) => b.isActive && Number(b.quantityRemainingKg) > 0);
  const landUseForm = useForm<LandUseFormData>({
    defaultValues: { landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: "", startDate: "", endDate: "", managementNotes: "" },
  });

  const fields = (fieldsData?.records ?? []) as unknown as FieldRecord[];
  const crops = (cropsData?.records ?? []) as unknown as CropRecord[];
  const assignments = (assignmentsData?.records ?? []) as unknown as FieldCropAssignment[];

  // Early return after all hooks
  if (!farmId) return <Redirect href="/select" />;

  const availableYears = Array.from(
    new Set([CURRENT_YEAR,
      ...assignments.map(a => a.year).filter((y): y is number => !!y),
      ...landUseRecords.map(r => r.year),
    ])
  ).sort((a, b) => b - a);

  const currentAssignments = assignments.filter(a =>
    selectedYear === CURRENT_YEAR ? (a.year === CURRENT_YEAR || !a.year) : a.year === selectedYear
  );

  const currentCropByField = Object.fromEntries(
    currentAssignments.map(a => [a.fieldId, a])
  ) as Record<number, FieldCropAssignment>;

  const currentLandUseByField = Object.fromEntries(
    landUseRecords.filter(r => r.year === selectedYear).map(r => [r.fieldId, r])
  ) as Record<number, LandUseRecord>;

  const filteredFields = fields.filter(f =>
    !search || (f.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const onSubmitField = (values: FieldFormData) => {
    createField({ farmId, data: values as any }, { onSuccess: () => { setIsAddFieldOpen(false); fieldForm.reset(); } });
  };

  const onSubmitCrop = (values: CropFormData) => {
    createCrop({ farmId, data: values as any }, { onSuccess: () => { setIsAddCropOpen(false); cropForm.reset(); } });
  };

  async function handleEditCropSave() {
    if (!editingCrop) return;
    setEditCropSaving(true);
    try {
      const res = await fetch(`/api/farms/${safeFarmId}/crop-varieties/${editingCrop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editCropForm.name, variety: editCropForm.variety, category: editCropForm.category, notes: editCropForm.notes }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await queryClient.invalidateQueries({ queryKey: getListCropsQueryKey(safeFarmId) });
      setEditingCrop(null);
    } catch (err) {
      alert(`Could not save changes: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setEditCropSaving(false);
    }
  }

  async function handleAddVarietySave() {
    if (!addingVarietyCropId) return;
    setAddVarietySaving(true);
    try {
      const res = await fetch(`/api/farms/${safeFarmId}/crops/${addingVarietyCropId}/varieties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ variety: addVarietyForm.variety, notes: addVarietyForm.notes }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await queryClient.invalidateQueries({ queryKey: getListCropsQueryKey(safeFarmId) });
      setAddingVarietyCropId(null);
      setAddVarietyForm({ variety: "", notes: "" });
    } catch (err) {
      alert(`Could not add variety: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setAddVarietySaving(false);
    }
  }

  async function handleDeleteVariety(varietyId: number) {
    if (!confirm("Delete this variety? If it is the only variety for this crop, the entire crop record will be removed.")) return;
    setDeletingVarietyId(varietyId);
    try {
      const res = await fetch(`/api/farms/${safeFarmId}/crop-varieties/${varietyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await queryClient.invalidateQueries({ queryKey: getListCropsQueryKey(safeFarmId) });
    } catch (err) {
      alert(`Could not delete: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setDeletingVarietyId(null);
    }
  }

  const onSubmitAssign = (values: AssignCropFormData) => {
    if (!assignForField) return;
    const targetPop = values.targetPlantPopulationM2 ? parseFloat(values.targetPlantPopulationM2) : null;
    const tgw = values.tgwGrams ? parseFloat(values.tgwGrams) : null;
    let estimatedEstablishmentPercent: number | null = null;
    let calculatedSeedRateKgHa: number | null = null;
    if (targetPop && tgw) {
      const establishment = getEstablishmentPercent(assignForField.soilType, values.plantingDate);
      const calc = calculateSeedRate(targetPop, tgw, establishment.percent);
      estimatedEstablishmentPercent = establishment.percent;
      calculatedSeedRateKgHa = calc?.seedRateKgHa ?? null;
    }
    const seedBatchId = values.seedBatchId ? Number(values.seedBatchId) : null;
    let bagsAllocated: number | null = null;
    if (seedBatchId) {
      const selectedBatch = availableSeedBatches.find(b => b.id === seedBatchId);
      const seedRateNum = values.seedRate ? parseFloat(values.seedRate) : NaN;
      const areaHa = assignForField.areaHectares ? Number(assignForField.areaHectares) : NaN;
      const bagWeightKg = selectedBatch ? Number(selectedBatch.bagWeightKg) || 25 : 25;
      if (selectedBatch && !isNaN(seedRateNum) && !isNaN(areaHa) && (values.seedUnit || "kg/ha") === "kg/ha") {
        bagsAllocated = Math.ceil((seedRateNum * areaHa) / bagWeightKg);
      }
    }
    assignCrop(
      {
        farmId,
        data: {
          ...values,
          fieldId: assignForField.id,
          varietyId: Number(values.varietyId),
          year: CURRENT_YEAR,
          season: values.season,
          seedRate: values.seedRate || null,
          seedUnit: values.seedRate ? (values.seedUnit || "kg/ha") : null,
          targetPlantPopulationM2: targetPop,
          tgwGrams: tgw,
          estimatedEstablishmentPercent,
          calculatedSeedRateKgHa,
          targetRowSpacingCm: values.targetRowSpacingCm ? parseFloat(values.targetRowSpacingCm) : null,
          seedBatchId,
          bagsAllocated,
        },
      },
      {
        onSuccess: () => {
          setAssignForField(null);
          assignForm.reset();
          setTgwManuallySet(false);
          if (seedBatchId) {
            queryClient.invalidateQueries({ queryKey: getListSeedBatchesQueryKey(safeFarmId) });
          }
        },
      }
    );
  };

  const CROP_CATEGORIES = ["Combinable Crops", "Root Crops", "Vegetables", "Oilseeds", "Pulses", "Grass & Forage", "Other"];

  // Crop register: group by name, sorted alphabetically
  const cropGroupMap = new Map<string, CropRecord[]>();
  for (const crop of crops) {
    if (!cropGroupMap.has(crop.name)) cropGroupMap.set(crop.name, []);
    cropGroupMap.get(crop.name)!.push(crop);
  }
  const sortedCropGroupNames = Array.from(cropGroupMap.keys()).sort((a, b) => a.localeCompare(b));

  const toggleCropGroup = (name: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const cropSeasonAssignments = (varietyId: number) => assignments.filter(a =>
    a.varietyId === varietyId &&
    (selectedYear === CURRENT_YEAR ? (a.year === CURRENT_YEAR || !a.year) : a.year === selectedYear)
  );

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
        <TabButton active={tab === "tenure"} onClick={() => setTab("tenure")}>Land Tenure</TabButton>
        <TabButton active={tab === "rotation"} onClick={() => setTab("rotation")}>Crop Rotation</TabButton>
        <TabButton active={tab === "map"} onClick={() => setTab("map")}>Field Map</TabButton>
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
                  <div>
                    <label className="text-sm font-medium mb-1 block">RPA Parcel Reference</label>
                    <Input {...fieldForm.register("fieldReference")} placeholder="e.g. TF 1234 5678" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find this in the{" "}
                      <a href="https://www.ruralpayments.service.gov.uk" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                        Rural Payments portal
                      </a>{" "}
                      or on any RPA correspondence. Leave blank if not registered for scheme payments.
                    </p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input type="checkbox" {...fieldForm.register("blackgrassRiskField")} className="rounded" />
                      Black-grass risk field
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tracks this field in the Black-grass Five-in-Five cultural control view (Crop History &amp; Season Reports).
                    </p>
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
                <MapIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No fields found.</p>
              </div>
            ) : filteredFields.map((field) => {
              const crop = currentCropByField[field.id];
              const fieldLandUse = !crop ? currentLandUseByField[field.id] : undefined;
              return (
                <Card key={field.id} className="group relative overflow-visible">
                  <div className="absolute top-3 right-3 z-30">
                    <FieldCardMenu
                      field={field}
                      farmId={farmId}
                      crops={crops}
                      currentCrop={crop}
                      onAssignCrop={() => { setAssignForField(field); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
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
                    {field.tenureType && field.tenureType !== "owned" && (() => {
                      const tenureBadgeMap: Record<string, { label: string; cls: string }> = {
                        fbt:              { label: "FBT",              cls: "bg-amber-100 text-amber-800 border-amber-300" },
                        aha:              { label: "AHA Tenancy",      cls: "bg-amber-100 text-amber-800 border-amber-300" },
                        contract_farming: { label: "Contract Farming", cls: "bg-violet-100 text-violet-800 border-violet-300" },
                        grazing_licence:  { label: "Grazing Licence",  cls: "bg-sky-100 text-sky-800 border-sky-300" },
                        seasonal_licence: { label: "Seasonal Licence", cls: "bg-blue-100 text-blue-800 border-blue-300" },
                        other:            { label: "Tenanted",         cls: "bg-slate-100 text-slate-700 border-slate-300" },
                      };
                      const b = tenureBadgeMap[field.tenureType] ?? { label: field.tenureType, cls: "bg-slate-100 text-slate-700 border-slate-300" };
                      return (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 uppercase tracking-wide ${b.cls}`}>
                          <Key className="w-2.5 h-2.5" />
                          {b.label}
                        </span>
                      );
                    })()}
                    {(field as any).blackgrassRiskField && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ml-1.5 uppercase tracking-wide bg-red-100 text-red-800 border-red-300">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Black-grass risk
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Crop / Land use badge */}
                    <div className="mb-3">
                      {crop ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <Wheat className="w-3 h-3" />
                          {crop.cropName}
                        </span>
                      ) : fieldLandUse ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${LAND_USE_BADGE[fieldLandUse.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300"}`}>
                          <TreePine className="w-3 h-3" />
                          {LAND_USE_LABEL[fieldLandUse.landUse] ?? fieldLandUse.landUse}
                          {fieldLandUse.schemeActionCode && <span className="font-mono ml-0.5 opacity-70">· {fieldLandUse.schemeActionCode}</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-black/5 text-foreground/40 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Leaf className="w-3 h-3" />
                          Not recorded
                        </span>
                      )}
                    </div>

                    {/* Crop details / Land use details / assign prompt */}
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
                        {crop.actualHarvestDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <Wheat className="w-3.5 h-3.5 text-green-700 flex-shrink-0" />
                            <span>Actual harvest: <strong>{formatDate(crop.actualHarvestDate)}</strong></span>
                            {(() => {
                              const days = harvestVarianceDays(crop.expectedHarvestDate, crop.actualHarvestDate);
                              return days !== null ? <VarianceBadge days={days} size="xs" /> : null;
                            })()}
                          </div>
                        )}
                        {crop.actualHarvestDate && (
                          <HarvestNoteEditor
                            assignmentId={crop.id}
                            farmId={farmId}
                            initialNote={crop.notes}
                          />
                        )}
                      </div>
                    ) : fieldLandUse ? (
                      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 mb-3 space-y-1">
                        {fieldLandUse.season && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <CalendarDays className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                            <span>{fieldLandUse.season}</span>
                          </div>
                        )}
                        {fieldLandUse.schemeReference && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <FileText className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                            <span className="font-mono">{fieldLandUse.schemeReference}</span>
                          </div>
                        )}
                        {fieldLandUse.managementNotes && (
                          <div className="flex items-start gap-2 text-xs text-foreground/60 italic">
                            <StickyNote className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                            <span>{fieldLandUse.managementNotes}</span>
                          </div>
                        )}
                        <button
                          onClick={() => { setEditingLandUseRecord(fieldLandUse); landUseForm.reset({ landUse: fieldLandUse.landUse, year: String(fieldLandUse.year), season: fieldLandUse.season ?? "", schemeActionCode: fieldLandUse.schemeActionCode ?? "", schemeReference: fieldLandUse.schemeReference ?? "", areaHectares: fieldLandUse.areaHectares ? String(fieldLandUse.areaHectares) : "", startDate: fieldLandUse.startDate ?? "", endDate: fieldLandUse.endDate ?? "", managementNotes: fieldLandUse.managementNotes ?? "" }); }}
                          className="text-xs text-foreground/50 hover:text-foreground underline mt-1 cursor-pointer"
                        >
                          Edit record
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3 space-y-1.5">
                        <button
                          onClick={() => { setAssignForField(field); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-green-200 rounded-xl text-xs text-green-700 font-medium hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <Sprout className="w-3.5 h-3.5" />
                          Assign crop
                        </button>
                        <button
                          onClick={() => { setLandUseForField(field); landUseForm.reset({ landUse: "fallow", year: String(selectedYear), season: "", schemeActionCode: "", schemeReference: "", areaHectares: field.areaHectares ? String(field.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-stone-200 rounded-xl text-xs text-stone-600 font-medium hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          <TreePine className="w-3.5 h-3.5" />
                          Record land use
                        </button>
                      </div>
                    )}

                    {/* Field stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Soil</p>
                        <p className="text-sm font-medium text-foreground">{field.soilType || '—'}</p>
                      </div>
                      {(field as any).fieldReference && (
                        <>
                          <div className="w-px h-8 bg-border" />
                          <div className="flex-1">
                            <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">RPA Ref</p>
                            <p className="text-sm font-medium text-foreground font-mono">{(field as any).fieldReference}</p>
                          </div>
                        </>
                      )}
                      <div className="w-px h-8 bg-border" />
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Area</p>
                        {field.enclosedFeatureAreaHa && field.enclosedFeatureAreaHa > 0 ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {field.computedFarmableAreaHa != null ? field.computedFarmableAreaHa.toFixed(2) : (field.areaHectares ? parseFloat(String(field.areaHectares)).toFixed(2) : "—")} ha <span className="text-xs text-green-600 font-semibold">farmable</span>
                            </p>
                            <p className="text-xs text-foreground/50">
                              {field.areaHectares ? parseFloat(String(field.areaHectares)).toFixed(2) : "—"} ha gross · −{field.enclosedFeatureAreaHa.toFixed(2)} ha features
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            {field.areaHectares ? `${parseFloat(String(field.areaHectares)).toFixed(2)} ha` : '—'}
                          </p>
                        )}
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
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <p className="text-sm text-foreground/60">
                Your crop catalogue — add crop types here, then assign them to fields each season.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Year selector — same as Fields tab */}
              <div className="relative flex-shrink-0">
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                <select
                  value={selectedYear}
                  onChange={e => { setSelectedYear(Number(e.target.value)); setExpandedVarietyId(null); setExpandedGroups(new Set()); }}
                  className="appearance-none border border-input rounded-lg pl-3 pr-8 py-2 text-sm bg-white font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y} Season{y === CURRENT_YEAR ? " (Current)" : ""}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => setPrintOpen(true)}>
                <Printer className="w-4 h-4" /> Print Register
              </Button>
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
                    <Input {...cropForm.register("name", { required: true })} placeholder="e.g. Winter Wheat, Oil Seed Rape" autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Variety (optional)</label>
                    <Input {...cropForm.register("variety")} placeholder="e.g. KWS Zyatt, Extase" autoComplete="off" />
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
            <div className="space-y-2">
              {sortedCropGroupNames.map(groupName => {
                const groupCrops = cropGroupMap.get(groupName)!;
                const isGroupExpanded = expandedGroups.has(groupName);
                const totalGroupFieldCount = groupCrops.reduce((sum, c) => sum + cropSeasonAssignments(c.id).length, 0);
                const groupCategories = Array.from(new Set(groupCrops.map(c => c.category).filter(Boolean)));

                return (
                  <div key={groupName} className="bg-white border border-border/50 rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
                    {/* ── Group header row ── */}
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCropGroup(groupName)}
                        className="flex-1 flex items-center gap-4 px-5 py-4 text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                          <Wheat className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{groupName}</p>
                          <p className="text-sm text-foreground/50">
                            {groupCrops.length === 1 && !groupCrops[0].variety
                              ? groupCategories[0] ?? "No variety set"
                              : `${groupCrops.length} variet${groupCrops.length === 1 ? "y" : "ies"}${groupCategories.length === 1 ? ` · ${groupCategories[0]}` : ""}`
                            }
                          </p>
                        </div>
                        {totalGroupFieldCount > 0 ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                            <Leaf className="w-3 h-3" />
                            {totalGroupFieldCount} field{totalGroupFieldCount !== 1 ? "s" : ""} this season
                          </div>
                        ) : (
                          <span className="text-xs text-foreground/30 flex-shrink-0">No fields this season</span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-foreground/30 flex-shrink-0 transition-transform ${isGroupExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <div className="flex items-center pr-4 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingVarietyCropId(groupCrops[0].cropId ?? null); setAddVarietyForm({ variety: "", notes: "" }); }}
                          className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Add a new variety to this crop"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add variety
                        </button>
                      </div>
                    </div>

                    {/* ── Variety sub-rows ── */}
                    {isGroupExpanded && (
                      <div className="border-t border-border/50 divide-y divide-border/30">
                        {groupCrops.map(crop => {
                          const assignedFields = cropSeasonAssignments(crop.id);
                          const isVarietyExpanded = expandedVarietyId === crop.id;
                          const hasAssignments = assignedFields.length > 0;

                          return (
                            <div key={crop.id}>
                              {/* Variety row header */}
                              <div className="flex items-center bg-green-50/20 hover:bg-green-50/50 transition-colors">
                                <button
                                  onClick={() => setExpandedVarietyId(isVarietyExpanded ? null : crop.id)}
                                  className="flex-1 flex items-center gap-3 px-5 py-3 text-left min-w-0"
                                >
                                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 ml-3" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                      {crop.variety || <span className="italic text-foreground/40">No variety specified</span>}
                                    </p>
                                    {(crop as any).notes && (
                                      <p className="text-xs text-foreground/50 truncate max-w-sm mt-0.5">{(crop as any).notes}</p>
                                    )}
                                    {crop.category && (
                                      <p className="text-xs text-foreground/40">{crop.category}</p>
                                    )}
                                  </div>
                                  {hasAssignments ? (
                                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                      {assignedFields.length} field{assignedFields.length !== 1 ? "s" : ""}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-foreground/30 flex-shrink-0">No fields</span>
                                  )}
                                  <ChevronDown className={`w-3.5 h-3.5 text-foreground/30 flex-shrink-0 transition-transform ${isVarietyExpanded ? "rotate-180" : ""}`} />
                                </button>
                                <div className="flex items-center gap-0.5 pr-3 flex-shrink-0">
                                  <DocAttach
                                    farmId={safeFarmId}
                                    endpoint="crop-varieties"
                                    recordId={crop.id}
                                    documentPath={(crop as any).documentPath ?? null}
                                    documentName={(crop as any).documentName ?? null}
                                    queryKey={[...getListCropsQueryKey(safeFarmId)]}
                                    compact
                                  />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditingCrop(crop); setEditCropForm({ name: crop.name, variety: crop.variety ?? "", category: crop.category ?? "", notes: (crop as any).notes ?? "" }); }}
                                    className="p-1.5 rounded hover:bg-green-100 text-foreground/30 hover:text-green-700 transition-colors"
                                    title="Edit variety"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteVariety(crop.id); }}
                                    disabled={deletingVarietyId === crop.id}
                                    className="p-1.5 rounded hover:bg-red-50 text-foreground/30 hover:text-red-500 transition-colors disabled:opacity-40"
                                    title="Delete variety"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded field list for this variety */}
                              {isVarietyExpanded && (
                                <div className="border-t border-border/30 bg-green-50/40 px-5 py-3">
                                  {!hasAssignments ? (
                                    <p className="text-xs text-foreground/40 py-2 text-center">
                                      No fields are growing {crop.variety ? `${groupName} (${crop.variety})` : groupName} this season.
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide mb-2">
                                        {crop.variety ? `${groupName} — ${crop.variety}` : groupName} · {selectedYear} season
                                      </p>
                                      {assignedFields.map(a => {
                                        const field = fields.find(f => f.id === a.fieldId);
                                        const varianceDays = harvestVarianceDays(a.expectedHarvestDate, a.actualHarvestDate);
                                        return (
                                          <div key={a.id} className="bg-white rounded-lg border border-border/50 px-3 py-2.5">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="font-semibold text-sm text-foreground">{field?.name || `Field #${a.fieldId}`}</span>
                                              {field?.areaHectares && (
                                                <span className="text-xs text-foreground/40">{parseFloat(String(field.areaHectares)).toFixed(1)} ha</span>
                                              )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-foreground/60">
                                              {a.plantingDate && (
                                                <span className="flex items-center gap-1">
                                                  <CalendarDays className="w-3 h-3 text-green-600" />
                                                  Planted {formatDate(a.plantingDate)}
                                                </span>
                                              )}
                                              {a.expectedHarvestDate && (
                                                <span className="flex items-center gap-1">
                                                  <Wheat className="w-3 h-3 text-amber-500" />
                                                  Exp. {formatDate(a.expectedHarvestDate)}
                                                </span>
                                              )}
                                              {a.actualHarvestDate && (
                                                <span className="flex items-center gap-2">
                                                  <Wheat className="w-3 h-3 text-green-700" />
                                                  Actual {formatDate(a.actualHarvestDate)}
                                                  {varianceDays !== null && <VarianceBadge days={varianceDays} size="xs" />}
                                                </span>
                                              )}
                                            </div>
                                            {a.notes && (
                                              <p className="text-xs text-foreground/40 italic mt-1 flex items-center gap-1">
                                                <StickyNote className="w-2.5 h-2.5" />{a.notes}
                                              </p>
                                            )}
                                            {a.seedBatchId && (
                                              <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-2 flex-wrap">
                                                <QrCode className="w-3 h-3 text-foreground/30" />
                                                <span className="text-[11px] text-foreground/50">
                                                  Seed batch: <strong>{allSeedBatches.find(b => b.id === a.seedBatchId)?.batchNumber ?? `#${a.seedBatchId}`}</strong>
                                                  {a.bagsAllocated ? ` · ${a.bagsAllocated} bag${a.bagsAllocated !== 1 ? "s" : ""}` : ""}
                                                </span>
                                                <Input
                                                  type="number"
                                                  min={1}
                                                  placeholder={String(a.bagsAllocated ?? 1)}
                                                  value={labelCountDraft[a.id] ?? ""}
                                                  onChange={e => setLabelCountDraft(prev => ({ ...prev, [a.id]: e.target.value }))}
                                                  className="h-6 w-16 text-xs px-2"
                                                />
                                                <Button
                                                  type="button"
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-6 text-[11px] px-2 gap-1"
                                                  onClick={() => void handleGenerateLabels(a)}
                                                >
                                                  <Printer className="w-3 h-3" />
                                                  {a.labelsGeneratedAt ? "Reprint labels" : "Print bag labels"}
                                                </Button>
                                                {a.labelsGeneratedAt && (
                                                  <span className="text-[10px] text-foreground/35">
                                                    Last printed {formatDate(a.labelsGeneratedAt)}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {/* ── Variety Documents (data sheets, seed certs) ── */}
                                  <div className="mt-3 pt-3 border-t border-border/30">
                                    <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                      <Paperclip className="w-3 h-3" /> Variety Documents
                                    </p>
                                    {cropDocsQ.isLoading && expandedVarietyId === crop.id ? (
                                      <p className="text-xs text-foreground/30 mb-2">Loading…</p>
                                    ) : cropDocs.length > 0 ? (
                                      <div className="space-y-1.5 mb-2">
                                        {cropDocs.map(doc => (
                                          <div key={doc.id} className="flex items-center gap-2 bg-white border border-border/50 rounded-lg px-3 py-2">
                                            <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-medium truncate">{doc.title}</p>
                                              {doc.documentName && doc.documentName !== doc.title && (
                                                <p className="text-[10px] text-foreground/40 truncate">{doc.documentName}</p>
                                              )}
                                            </div>
                                            <a
                                              href={`/api/storage${doc.documentUrl}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex-shrink-0 p-1 rounded hover:bg-blue-50 text-blue-500 transition-colors"
                                              title="Open document"
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                              onClick={async () => {
                                                if (!confirm("Remove this document?")) return;
                                                const cropTypeId = crop.cropId ?? null;
                                                if (!cropTypeId) return;
                                                await fetch(`/api/farms/${safeFarmId}/crops/${cropTypeId}/documents/${doc.id}`, { method: "DELETE" });
                                                queryClient.invalidateQueries({ queryKey: ["crop-docs", safeFarmId, cropTypeId] });
                                              }}
                                              className="flex-shrink-0 p-1 rounded hover:bg-red-50 text-foreground/30 hover:text-red-500 transition-colors"
                                              title="Remove"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-foreground/30 italic mb-2">No documents yet — attach the variety data sheet or seed certificate.</p>
                                    )}
                                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-border/60 rounded-xl hover:border-green-400 hover:bg-green-50/50 transition-colors ${isUploadingCropDoc ? "opacity-50 pointer-events-none" : ""}`}>
                                      <Paperclip className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0" />
                                      <span className="text-xs text-foreground/45">{isUploadingCropDoc ? "Uploading…" : "Attach variety data sheet or seed certificate"}</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="application/pdf,image/*,.doc,.docx"
                                        disabled={isUploadingCropDoc}
                                        onChange={async e => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const cropTypeId = crop.cropId ?? null;
                                          if (!cropTypeId) return;
                                          setIsUploadingCropDoc(true);
                                          try {
                                            const result = await uploadFile(file);
                                            if (!result) return;
                                            await fetch(`/api/farms/${safeFarmId}/crops/${cropTypeId}/documents`, {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ title: file.name.replace(/\.[^.]+$/, ""), documentUrl: result.objectPath, documentName: file.name }),
                                            });
                                            queryClient.invalidateQueries({ queryKey: ["crop-docs", safeFarmId, cropTypeId] });
                                            e.target.value = "";
                                          } finally {
                                            setIsUploadingCropDoc(false);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Non-crop land use section */}
          {(() => {
            const seasonLandUse = landUseRecords.filter(r =>
              selectedYear === CURRENT_YEAR ? r.year === CURRENT_YEAR : r.year === selectedYear
            );
            if (seasonLandUse.length === 0) return null;
            return (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-stone-600" />
                    <h3 className="font-semibold text-foreground">Non-Crop Land Use — {selectedYear} Season</h3>
                    <span className="text-xs text-foreground/40 bg-muted px-2 py-0.5 rounded-full">{seasonLandUse.length} record{seasonLandUse.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-border/50">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide">Field</th>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide">Land Use</th>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide hidden sm:table-cell">Scheme</th>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide hidden md:table-cell">Season</th>
                        <th className="text-right px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide hidden sm:table-cell">Area (ha)</th>
                        <th className="px-4 py-2.5 w-16" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {seasonLandUse.map(r => {
                        const field = fields.find(f => f.id === r.fieldId);
                        return (
                          <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium">{r.fieldName || field?.name || `Field #${r.fieldId}`}</p>
                              {r.fieldReference && <p className="text-xs text-foreground/40 font-mono">{r.fieldReference}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${LAND_USE_BADGE[r.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300"}`}>
                                <TreePine className="w-3 h-3" />
                                {LAND_USE_LABEL[r.landUse] ?? r.landUse}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              {r.schemeActionCode ? (
                                <span className="font-mono font-semibold text-teal-700 text-xs">{r.schemeActionCode}</span>
                              ) : <span className="text-foreground/30 text-xs">—</span>}
                              {r.schemeReference && <p className="text-xs text-foreground/40 font-mono">{r.schemeReference}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground/60 hidden md:table-cell">{r.season || "—"}</td>
                            <td className="px-4 py-3 text-right text-xs text-foreground/60 hidden sm:table-cell">
                              {r.areaHectares ? parseFloat(String(r.areaHectares)).toFixed(2) : field?.areaHectares ? `${parseFloat(String(field.areaHectares)).toFixed(2)} *` : "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => { setEditingLandUseRecord(r); landUseForm.reset({ landUse: r.landUse, year: String(r.year), season: r.season ?? "", schemeActionCode: r.schemeActionCode ?? "", schemeReference: r.schemeReference ?? "", areaHectares: r.areaHectares ? String(r.areaHectares) : "", startDate: r.startDate ?? "", endDate: r.endDate ?? "", managementNotes: r.managementNotes ?? "" }); }}
                                className="text-xs text-foreground/40 hover:text-foreground underline cursor-pointer"
                              >Edit</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-foreground/40 mt-2 px-1">* Using full field area — no partial area recorded.</p>
              </div>
            );
          })()}
        </>
      )}

      {/* ── FIELD HISTORY DIALOG ── */}
      <Dialog open={!!selectedFieldForHistory} onOpenChange={(o) => { if (!o) setSelectedFieldForHistory(null); }}>
        <DialogContent className="max-w-3xl p-0 flex flex-col max-h-[85vh] overflow-hidden gap-0" aria-describedby={undefined}>
          <DialogTitle className="sr-only">
            {selectedFieldForHistory?.name || `Field #${selectedFieldForHistory?.id}`} — Field Details
          </DialogTitle>
          {selectedFieldForHistory && (() => {
            const f = selectedFieldForHistory;
            const fieldAssignments = assignments
              .filter(a => a.fieldId === f.id)
              .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
            const currentCropForDrawer = currentCropByField[f.id];
            const currentLandUseForDrawer = !currentCropForDrawer ? currentLandUseByField[f.id] : undefined;
            const fieldLandUseHistory = landUseRecords.filter(r => r.fieldId === f.id).sort((a, b) => b.year - a.year);
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
                  <TabButton size="sm" active={drawerTab === "history"} onClick={() => setDrawerTab("history")}>Season History</TabButton>
                  <TabButton size="sm" active={drawerTab === "nmp"} onClick={() => setDrawerTab("nmp")}>NMP</TabButton>
                  <TabButton size="sm" active={drawerTab === "tenure"} onClick={() => { setDrawerTab("tenure"); setTenureEditMode(false); }}>Land Tenure</TabButton>
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
                    {/* biofuel eligibility indicator */}
                    {(() => {
                      const decl = biofuelDeclarations.find(d => d.fieldName === f.name);
                      if (!decl && biofuelDeclarations.length === 0) return null;
                      const statusColor = decl?.eligibilityStatus === "eligible" ? { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#16a34a" } : decl?.eligibilityStatus === "not-eligible" ? { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#dc2626" } : { bg: "#fefce8", border: "#fef08a", text: "#a16207", dot: "#ca8a04" };
                      return (
                        <div className="rounded-xl p-4" style={{ background: decl ? statusColor.bg : "#f9fafb", border: `1px solid ${decl ? statusColor.border : "#e5e7eb"}` }}>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: decl ? statusColor.text : "#9ca3af" }}>Biofuel / RTFO</p>
                          {decl ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor.dot }} />
                              <span className="text-sm font-semibold" style={{ color: statusColor.text }}>
                                {decl.eligibilityStatus === "eligible" ? "Eligible" : decl.eligibilityStatus === "not-eligible" ? "Not Eligible" : "Requires Verification"}
                              </span>
                              {(decl.highCarbonStockRisk || decl.highBiodiversityRisk) && (
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#fef2f2", color: "#dc2626" }}>
                                  {[decl.highCarbonStockRisk && "Carbon risk", decl.highBiodiversityRisk && "Biodiversity risk"].filter(Boolean).join(" · ")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-foreground/50">No declaration on file</p>
                          )}
                        </div>
                      );
                    })()}

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
                          {currentCropForDrawer.actualHarvestDate && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <Wheat className="w-4 h-4 text-green-700 flex-shrink-0" />
                              <span>Actual harvest <strong>{formatDate(currentCropForDrawer.actualHarvestDate)}</strong></span>
                              {(() => {
                                const days = harvestVarianceDays(currentCropForDrawer.expectedHarvestDate, currentCropForDrawer.actualHarvestDate);
                                return days !== null ? <VarianceBadge days={days} /> : null;
                              })()}
                            </div>
                          )}
                          {currentCropForDrawer.actualHarvestDate && (
                            <div className="pt-1">
                              <HarvestNoteEditor
                                assignmentId={currentCropForDrawer.id}
                                farmId={farmId}
                                initialNote={currentCropForDrawer.notes}
                              />
                            </div>
                          )}
                        </div>
                      ) : currentLandUseForDrawer ? (
                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${LAND_USE_BADGE[currentLandUseForDrawer.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300"}`}>
                              <TreePine className="w-3 h-3" />
                              {LAND_USE_LABEL[currentLandUseForDrawer.landUse] ?? currentLandUseForDrawer.landUse}
                            </span>
                            {currentLandUseForDrawer.season && <span className="text-xs text-foreground/50">{currentLandUseForDrawer.season}</span>}
                          </div>
                          {currentLandUseForDrawer.schemeActionCode && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                              <span>Scheme action: <strong className="font-mono">{currentLandUseForDrawer.schemeActionCode}</strong></span>
                            </div>
                          )}
                          {currentLandUseForDrawer.schemeReference && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <FileText className="w-4 h-4 text-stone-500 flex-shrink-0" />
                              <span>Agreement ref: <strong className="font-mono">{currentLandUseForDrawer.schemeReference}</strong></span>
                            </div>
                          )}
                          {(currentLandUseForDrawer.startDate || currentLandUseForDrawer.endDate) && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <CalendarDays className="w-4 h-4 text-stone-500 flex-shrink-0" />
                              <span>{formatDate(currentLandUseForDrawer.startDate) ?? "—"} → {formatDate(currentLandUseForDrawer.endDate) ?? "—"}</span>
                            </div>
                          )}
                          {currentLandUseForDrawer.managementNotes && (
                            <p className="text-sm text-foreground/60 italic">{currentLandUseForDrawer.managementNotes}</p>
                          )}
                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={() => { setEditingLandUseRecord(currentLandUseForDrawer); landUseForm.reset({ landUse: currentLandUseForDrawer.landUse, year: String(currentLandUseForDrawer.year), season: currentLandUseForDrawer.season ?? "", schemeActionCode: currentLandUseForDrawer.schemeActionCode ?? "", schemeReference: currentLandUseForDrawer.schemeReference ?? "", areaHectares: currentLandUseForDrawer.areaHectares ? String(currentLandUseForDrawer.areaHectares) : "", startDate: currentLandUseForDrawer.startDate ?? "", endDate: currentLandUseForDrawer.endDate ?? "", managementNotes: currentLandUseForDrawer.managementNotes ?? "" }); }}
                              className="text-xs font-semibold text-stone-600 hover:text-stone-800 underline cursor-pointer"
                            >Edit record</button>
                            <button
                              onClick={() => { if (confirm("Delete this land use record?")) deleteLandUseMut.mutate(currentLandUseForDrawer.id); }}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 underline cursor-pointer"
                            >Delete</button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-stone-200 rounded-xl p-5 text-center">
                          <Leaf className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                          <p className="text-sm text-foreground/50">Nothing recorded for {selectedYear}</p>
                          {selectedYear === CURRENT_YEAR && (
                            <div className="flex justify-center gap-3 mt-3">
                              <button
                                onClick={() => { setSelectedFieldForHistory(null); setAssignForField(f); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
                                className="text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                              >
                                + Assign a crop
                              </button>
                              <span className="text-foreground/30">·</span>
                              <button
                                onClick={() => { setLandUseForField(f); landUseForm.reset({ landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: f.areaHectares ? String(f.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                                className="text-xs font-semibold text-stone-600 hover:underline cursor-pointer"
                              >
                                + Record land use
                              </button>
                            </div>
                          )}
                          {selectedYear !== CURRENT_YEAR && (
                            <button
                              onClick={() => { setSelectedFieldForHistory(null); setAssignForField(f); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
                              className="mt-3 text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                            >
                              + Assign a crop
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* quick link to history */}
                    {(fieldAssignments.length + fieldLandUseHistory.length) > 1 && (
                      <button
                        onClick={() => setDrawerTab("history")}
                        className="w-full flex items-center justify-between text-sm text-foreground/60 hover:text-foreground border border-border/50 rounded-xl px-4 py-3 hover:bg-black/[0.02] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <History className="w-4 h-4" />
                          View full season history
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

                {drawerTab === "tenure" && (() => {
                  const tenureLabels: Record<string, string> = {
                    owned: "Owned outright",
                    fbt: "Farm Business Tenancy (FBT)",
                    aha: "Agricultural Holdings Act tenancy",
                    contract_farming: "Contract farming agreement",
                    grazing_licence: "Grazing licence",
                    other: "Other arrangement",
                  };
                  const isRented = f.tenureType && f.tenureType !== "owned";
                  const endDate = f.tenancyEndDate ? new Date(f.tenancyEndDate) : null;
                  const today = new Date();
                  const daysToExpiry = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / 86400000) : null;
                  const expiryUrgent = daysToExpiry !== null && daysToExpiry <= 90;
                  const expiryWarning = daysToExpiry !== null && daysToExpiry > 90 && daysToExpiry <= 180;
                  const reviewDate = f.rentReviewDate ? new Date(f.rentReviewDate) : null;
                  const daysToReview = reviewDate ? Math.ceil((reviewDate.getTime() - today.getTime()) / 86400000) : null;
                  const reviewSoon = daysToReview !== null && daysToReview <= 90;

                  if (tenureEditMode) {
                    const tf = tenureForm;
                    const setTf = (k: string, v: string) => setTenureForm(prev => ({ ...prev, [k]: v }));
                    const handleSaveTenure = async () => {
                      setIsSavingTenure(true);
                      try {
                        const body: Record<string, string | number | null> = {
                          tenureType: tf.tenureType || null,
                          landlordSupplierId: tf.landlordSupplierId && tf.landlordSupplierId !== "__none__" ? parseInt(tf.landlordSupplierId, 10) : null,
                          tenancyStartDate: tf.tenancyStartDate || null,
                          tenancyEndDate: tf.tenancyEndDate || null,
                          annualRentPounds: tf.annualRentPounds || null,
                          rentReviewDate: tf.rentReviewDate || null,
                          tenureNotes: tf.tenureNotes || null,
                        };
                        const res = await fetch(`/api/farms/${farmId}/fields/${f.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(body),
                        });
                        const data = await res.json();
                        queryClient.invalidateQueries({ queryKey: ["farms", farmId, "fields"] });
                        setSelectedFieldForHistory(prev => prev ? { ...prev, ...data.record } : null);
                        setTenureEditMode(false);
                      } finally {
                        setIsSavingTenure(false);
                      }
                    };
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Tenure Type</label>
                          <select value={tf.tenureType} onChange={e => setTf("tenureType", e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white">
                            <option value="owned">Owned outright</option>
                            <option value="fbt">Farm Business Tenancy (FBT)</option>
                            <option value="aha">Agricultural Holdings Act tenancy</option>
                            <option value="contract_farming">Contract farming agreement</option>
                            <option value="grazing_licence">Grazing licence</option>
                            <option value="other">Other arrangement</option>
                          </select>
                        </div>
                        {tf.tenureType !== "owned" && (
                          <>
                            <div>
                              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Landlord / Licensor</label>
                              <div className="flex gap-2">
                                <select value={tf.landlordSupplierId} onChange={e => setTf("landlordSupplierId", e.target.value)} className="flex-1 border border-input rounded-md px-3 py-2 text-sm bg-white">
                                  <option value="__none__">— None selected —</option>
                                  {landlordSuppliers.map(s => (
                                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                                  ))}
                                </select>
                                <Button type="button" variant="outline" size="sm" className="flex-shrink-0 gap-1.5 whitespace-nowrap" onClick={() => { setLandlordQuickForm({ name: "", contactName: "", phone: "", address: "" }); setShowAddLandlordDialog(true); }}>
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  New landlord
                                </Button>
                              </div>
                              {tf.landlordSupplierId && tf.landlordSupplierId !== "__none__" && (() => {
                                const s = landlordSuppliers.find(x => String(x.id) === tf.landlordSupplierId);
                                if (!s) return null;
                                return (
                                  <div className="mt-2 text-xs text-foreground/50 bg-black/[0.02] rounded-lg px-3 py-2 space-y-0.5">
                                    {s.contactName && <p><span className="font-medium">Contact:</span> {s.contactName}</p>}
                                    {s.phone && <p><span className="font-medium">Phone:</span> {s.phone}</p>}
                                    {s.email && <p><span className="font-medium">Email:</span> {s.email}</p>}
                                    {s.address && <p><span className="font-medium">Address:</span> {s.address}</p>}
                                  </div>
                                );
                              })()}</div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Tenancy Start</label>
                                <Input type="date" value={tf.tenancyStartDate} onChange={e => setTf("tenancyStartDate", e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Tenancy End</label>
                                <Input type="date" value={tf.tenancyEndDate} onChange={e => setTf("tenancyEndDate", e.target.value)} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Annual Rent (£)</label>
                                <Input type="number" step="0.01" min="0" value={tf.annualRentPounds} onChange={e => setTf("annualRentPounds", e.target.value)} placeholder="e.g. 3200.00" />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Rent Review Date</label>
                                <Input type="date" value={tf.rentReviewDate} onChange={e => setTf("rentReviewDate", e.target.value)} />
                              </div>
                            </div>
                          </>
                        )}
                        <div>
                          <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Notes</label>
                          <textarea value={tf.tenureNotes} onChange={e => setTf("tenureNotes", e.target.value)} rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none" placeholder="Any additional tenancy notes, break clauses, special conditions..." />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button onClick={handleSaveTenure} disabled={isSavingTenure} size="sm" className="gap-2">
                            {isSavingTenure ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isSavingTenure ? "Saving..." : "Save Land Tenure"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setTenureEditMode(false)}>Cancel</Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-5">
                      {(expiryUrgent || expiryWarning) && (
                        <div className={`flex items-start gap-3 rounded-xl p-3 text-sm ${expiryUrgent ? "bg-red-50 border border-red-200 text-red-800" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
                          <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${expiryUrgent ? "text-red-500" : "text-amber-500"}`} />
                          <div>
                            <p className="font-semibold">{expiryUrgent ? "Tenancy expiring soon" : "Tenancy approaching expiry"}</p>
                            <p className="text-xs mt-0.5">
                              {daysToExpiry === 0 ? "Expires today" : daysToExpiry! < 0 ? `Expired ${Math.abs(daysToExpiry!)} day${Math.abs(daysToExpiry!) !== 1 ? "s" : ""} ago` : `Expires in ${daysToExpiry} day${daysToExpiry !== 1 ? "s" : ""}`} — check your SFI/CS eligibility for this field.
                            </p>
                          </div>
                        </div>
                      )}
                      {reviewSoon && (
                        <div className="flex items-start gap-3 rounded-xl p-3 text-sm bg-blue-50 border border-blue-200 text-blue-800">
                          <RefreshCw className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                          <div>
                            <p className="font-semibold">Rent review due soon</p>
                            <p className="text-xs mt-0.5">Review date in {daysToReview} day{daysToReview !== 1 ? "s" : ""}. Contact your landlord or agent to initiate review.</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-black/[0.03] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Landmark className="w-4 h-4 text-foreground/40" />
                          <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Tenure Type</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {f.tenureType ? (tenureLabels[f.tenureType] ?? f.tenureType) : <span className="text-foreground/40 font-normal">Not recorded</span>}
                        </p>
                      </div>
                      {isRented && (
                        <>
                          {(() => {
                            const landlord = f.landlordSupplierId ? landlordSuppliers.find(s => s.id === f.landlordSupplierId) : null;
                            if (!landlord && !f.landlordSupplierId) return null;
                            return (
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                                  <Landmark className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-foreground/40 mb-0.5">Landlord / Licensor</p>
                                    <p className="text-sm font-medium">{landlord?.name ?? <span className="text-foreground/40 italic">Unknown landlord</span>}</p>
                                  </div>
                                </div>
                                {landlord?.contactName && (
                                  <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                                    <Phone className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-foreground/40 mb-0.5">Contact</p>
                                      <p className="text-sm font-medium">{landlord.contactName}{landlord.phone ? ` · ${landlord.phone}` : ""}</p>
                                    </div>
                                  </div>
                                )}
                                {landlord?.address && (
                                  <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                                    <MapPin className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-foreground/40 mb-0.5">Address</p>
                                      <p className="text-sm font-medium">{landlord.address}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/[0.03] rounded-xl p-3">
                              <p className="text-xs text-foreground/40 mb-1">Tenancy Start</p>
                              <p className="text-sm font-semibold">{f.tenancyStartDate ? new Date(f.tenancyStartDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${expiryUrgent ? "bg-red-50" : expiryWarning ? "bg-amber-50" : "bg-black/[0.03]"}`}>
                              <p className="text-xs text-foreground/40 mb-1">Tenancy End</p>
                              <p className={`text-sm font-semibold ${expiryUrgent ? "text-red-700" : expiryWarning ? "text-amber-700" : ""}`}>
                                {f.tenancyEndDate ? new Date(f.tenancyEndDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                              </p>
                              {daysToExpiry !== null && (
                                <p className={`text-xs mt-0.5 ${expiryUrgent ? "text-red-500" : expiryWarning ? "text-amber-500" : "text-foreground/40"}`}>
                                  {daysToExpiry < 0 ? `Expired ${Math.abs(daysToExpiry)}d ago` : daysToExpiry === 0 ? "Today" : `${daysToExpiry}d remaining`}
                                </p>
                              )}
                            </div>
                            <div className="bg-black/[0.03] rounded-xl p-3">
                              <p className="text-xs text-foreground/40 mb-1 flex items-center gap-1"><BadgePoundSterling className="w-3 h-3" />Annual Rent</p>
                              <p className="text-sm font-semibold">{f.annualRentPounds ? `£${parseFloat(String(f.annualRentPounds)).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${reviewSoon ? "bg-blue-50" : "bg-black/[0.03]"}`}>
                              <p className="text-xs text-foreground/40 mb-1 flex items-center gap-1"><RefreshCw className="w-3 h-3" />Rent Review</p>
                              <p className={`text-sm font-semibold ${reviewSoon ? "text-blue-700" : ""}`}>
                                {f.rentReviewDate ? new Date(f.rentReviewDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {f.tenureNotes && (
                        <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                          <FileText className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-foreground/40 mb-0.5">Notes</p>
                            <p className="text-sm text-foreground/70 whitespace-pre-line">{f.tenureNotes}</p>
                          </div>
                        </div>
                      )}
                      {!f.tenureType && !f.landlordSupplierId && (
                        <div className="py-8 text-center">
                          <Landmark className="w-10 h-10 mx-auto text-foreground/15 mb-3" />
                          <p className="text-sm text-foreground/40">No land tenure information recorded yet.</p>
                          <p className="text-xs text-foreground/30 mt-1">Record tenure type, landlord details, and tenancy dates to track SFI eligibility.</p>
                        </div>
                      )}

                      {/* ── Tenure Documents ── */}
                      <div>
                        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">Documents</p>
                        {tenureDocsQ.isLoading ? (
                          <div className="flex items-center gap-2 text-sm text-foreground/40 py-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
                        ) : tenureDocsQ.data && tenureDocsQ.data.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {(tenureDocsQ.data as any[]).map((doc: any) => (
                              <div key={doc.id} className="flex items-center gap-2 p-2.5 bg-black/[0.02] border border-border/40 rounded-xl">
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{doc.title}</p>
                                  {doc.documentName && <p className="text-xs text-foreground/40 truncate">{doc.documentName}</p>}
                                </div>
                                <a href={`/api/storage${doc.documentUrl}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Download">
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button onClick={async () => {
                                  await fetch(`/api/farms/${farmId}/fields/${f.id}/tenure-documents/${doc.id}`, { method: "DELETE" });
                                  queryClient.invalidateQueries({ queryKey: ["field-tenure-docs", safeFarmId, f.id] });
                                }} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Remove">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-foreground/35 mb-3 italic">No documents attached yet.</p>
                        )}
                        <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-border rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors ${isUploadingTenureDoc ? "opacity-50 pointer-events-none" : ""}`}>
                          <Paperclip className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                          <span className="text-sm text-foreground/50">{isUploadingTenureDoc ? "Uploading…" : "Attach tenancy agreement or document"}</span>
                          <input type="file" className="hidden" accept="application/pdf,image/*,.doc,.docx" disabled={isUploadingTenureDoc} onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const result = await uploadFile(file);
                            if (!result) return;
                            await fetch(`/api/farms/${farmId}/fields/${f.id}/tenure-documents`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ title: file.name.replace(/\.[^.]+$/, ""), documentUrl: result.objectPath, documentName: file.name }),
                            });
                            queryClient.invalidateQueries({ queryKey: ["field-tenure-docs", safeFarmId, f.id] });
                            e.target.value = "";
                          }} />
                        </label>
                      </div>

                      <div className="pt-1">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                          setTenureForm({
                            tenureType: f.tenureType ?? "owned",
                            landlordSupplierId: f.landlordSupplierId ? String(f.landlordSupplierId) : "__none__",
                            tenancyStartDate: f.tenancyStartDate ?? "",
                            tenancyEndDate: f.tenancyEndDate ?? "",
                            annualRentPounds: f.annualRentPounds ? String(f.annualRentPounds) : "",
                            rentReviewDate: f.rentReviewDate ?? "",
                            tenureNotes: f.tenureNotes ?? "",
                          });
                          setTenureEditMode(true);
                        }}>
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Land Tenure
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {drawerTab === "history" && (() => {
                  type HistoryEntry =
                    | { kind: "crop"; year: number; data: FieldCropAssignment }
                    | { kind: "landuse"; year: number; data: LandUseRecord };
                  const historyEntries: HistoryEntry[] = [
                    ...fieldAssignments.map(a => ({ kind: "crop" as const, year: a.year ?? 0, data: a })),
                    ...fieldLandUseHistory.map(r => ({ kind: "landuse" as const, year: r.year, data: r })),
                  ].sort((a, b) => b.year - a.year);
                  return (
                  <div>
                    <p className="text-sm text-foreground/50 mb-5">
                      All recorded crop and non-crop land use entries for this field across all seasons.
                    </p>
                    {(f as any).blackgrassRiskField && (() => {
                      if (fiveInFiveQ.isLoading) {
                        return (
                          <div className="mb-5 flex items-center gap-2 text-xs text-foreground/40 border border-border/50 rounded-xl p-4">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />Loading black-grass Five-in-Five score…
                          </div>
                        );
                      }
                      if (!fiveInFiveScore) return null;
                      const { seasons, distinctPillarsUsed, distinctPillarCount, moaRepetitionRisk, moaRepeatedGroup } = fiveInFiveScore;
                      const yearsConsidered = seasons.map(s => s.year);
                      const strong = distinctPillarCount >= 4;
                      const moderate = distinctPillarCount >= 2 && distinctPillarCount < 4;
                      const pillarKeys = Object.keys(PILLAR_LABELS) as PillarKey[];
                      return (
                        <div className={`mb-5 rounded-xl border overflow-hidden ${strong ? "border-green-200 bg-green-50/50" : moderate ? "border-amber-200 bg-amber-50/50" : "border-red-200 bg-red-50/50"}`}>
                          <div className={`px-4 py-3 flex items-center justify-between flex-wrap gap-2 ${strong ? "bg-green-600" : moderate ? "bg-amber-500" : "bg-red-500"} text-white`}>
                            <div className="flex items-center gap-2">
                              <Sprout className="w-4 h-4" />
                              <span className="text-sm font-semibold">Black-grass Five-in-Five</span>
                              {yearsConsidered.length > 0 && (
                                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                                  {Math.min(...yearsConsidered)}–{Math.max(...yearsConsidered)}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-bold">{distinctPillarCount}/5 pillars</span>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              {pillarKeys.map(key => {
                                const met = distinctPillarsUsed.includes(key);
                                const { label, detail } = PILLAR_LABELS[key];
                                return (
                                  <div key={key} className="flex items-start gap-2 text-xs">
                                    {met
                                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                      : <XCircle className="w-3.5 h-3.5 text-foreground/25 flex-shrink-0 mt-0.5" />}
                                    <div>
                                      <p className={`font-semibold ${met ? "text-green-800" : "text-foreground/60"}`}>{label}</p>
                                      <p className="text-foreground/45 text-[11px]">{detail}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {moaRepetitionRisk && (
                              <div className="flex items-start gap-2 text-xs border-t border-border/30 pt-2.5 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-red-700">Herbicide MOA repetition risk</p>
                                  <p className="text-foreground/50 text-[11px]">
                                    The same herbicide MOA group ({moaRepeatedGroup}) has been used for 3+ consecutive seasons on this field, increasing resistance risk.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    {(f as any).blackgrassRiskField && fiveInFiveScore && fiveInFiveScore.recommendations.length > 0 && (
                      <div className="mb-5 rounded-xl border border-border/50 overflow-hidden">
                        <div className="px-4 py-3 bg-stone-700 text-white flex items-center gap-2">
                          <Sprout className="w-4 h-4" />
                          <span className="text-sm font-semibold">Recommended actions for this season</span>
                        </div>
                        <div className="p-4 space-y-2.5">
                          {fiveInFiveScore.recommendations.map((rec) => (
                            <div key={rec.key} className={`flex items-start gap-2 text-xs rounded-lg border px-3 py-2.5 ${RECOMMENDATION_SEVERITY_STYLES[rec.severity]}`}>
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold">{rec.title}</p>
                                <p className="text-[11px] opacity-80 mt-0.5">{rec.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {historyEntries.length === 0 ? (
                      <div className="py-12 text-center">
                        <History className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
                        <p className="text-foreground/40 text-sm">No season history recorded yet.</p>
                        <button
                          onClick={() => { setLandUseForField(f); landUseForm.reset({ landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: f.areaHectares ? String(f.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                          className="mt-3 text-xs font-semibold text-stone-600 hover:underline cursor-pointer"
                        >+ Record land use</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {historyEntries.map((entry, i) => {
                          const isCurrent = entry.year === CURRENT_YEAR;
                          if (entry.kind === "crop") {
                            const a = entry.data;
                            return (
                              <div key={`crop-${a.id}`} className="flex items-start gap-3">
                                <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isCurrent ? "bg-green-600 border-green-600" : "bg-white border-border"}`} />
                                  {i < historyEntries.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: "24px" }} />}
                                </div>
                                <div className={`flex-1 rounded-xl border p-4 mb-0 ${isCurrent ? "border-green-200 bg-green-50" : "border-border/50 bg-black/[0.01]"}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isCurrent ? "bg-green-700 text-white" : "bg-black/5 text-foreground/70"}`}>
                                      <Wheat className="w-3 h-3" />
                                      {a.cropName}
                                    </span>
                                    <span className="text-xs font-bold text-foreground/40">{a.year ?? "—"}{a.season ? ` · ${a.season}` : ""}</span>
                                  </div>
                                  {a.plantingDate && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1"><CalendarDays className="w-3 h-3 flex-shrink-0" />Planted {formatDate(a.plantingDate)}</p>}
                                  {a.expectedHarvestDate && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5"><Wheat className="w-3 h-3 flex-shrink-0 text-amber-500" />Expected harvest {formatDate(a.expectedHarvestDate)}</p>}
                                  {a.actualHarvestDate && (() => {
                                    const days = harvestVarianceDays(a.expectedHarvestDate, a.actualHarvestDate);
                                    return <div className="flex items-center gap-2 mt-0.5 flex-wrap"><p className="text-xs text-foreground/60 flex items-center gap-1.5"><Wheat className="w-3 h-3 flex-shrink-0 text-green-700" />Actual harvest {formatDate(a.actualHarvestDate)}</p>{days !== null && <VarianceBadge days={days} size="xs" />}</div>;
                                  })()}
                                  {a.actualHarvestDate && (
                                    (a.year ?? 0) >= CURRENT_YEAR ? (
                                      <div className="mt-1.5"><HarvestNoteEditor assignmentId={a.id} farmId={farmId} initialNote={a.notes} /></div>
                                    ) : a.notes ? (
                                      <p className="text-[11px] text-foreground/50 italic mt-1.5 leading-relaxed">{a.notes}</p>
                                    ) : null
                                  )}
                                  {(() => {
                                    const harvests = fieldHarvests.filter(h => h.fieldCropAssignmentId === a.id);
                                    if (!harvests.length) return null;
                                    const totalYield = harvests.reduce((s, h) => s + (h.yieldTonnes ? parseFloat(h.yieldTonnes) : 0), 0);
                                    const totalArea = harvests.reduce((s, h) => s + (h.areaHarvestedHa ? parseFloat(h.areaHarvestedHa) : 0), 0);
                                    const fieldArea = f.areaHectares ? parseFloat(String(f.areaHectares)) : null;
                                    const effectiveArea = totalArea > 0 ? totalArea : fieldArea;
                                    const yieldTha = effectiveArea && effectiveArea > 0 ? totalYield / effectiveArea : null;
                                    const moistureVals = harvests.filter(h => h.moisturePercent).map(h => parseFloat(h.moisturePercent!));
                                    const avgMoisture = moistureVals.length > 0 ? moistureVals.reduce((s, v) => s + v, 0) / moistureVals.length : null;
                                    const grades = [...new Set(harvests.map(h => h.qualityGrade).filter(Boolean))];
                                    return (
                                      <div className="mt-2.5 pt-2.5 border-t border-border/30 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                                          <Scale className="w-3 h-3" />
                                          {yieldTha ? `${yieldTha.toFixed(1)} t/ha` : `${totalYield.toFixed(1)} t`}
                                        </span>
                                        {yieldTha && totalYield > 0 && (
                                          <span className="text-xs text-foreground/45">{totalYield.toFixed(1)} t total</span>
                                        )}
                                        {avgMoisture !== null && (
                                          <span className="text-xs text-foreground/45">{avgMoisture.toFixed(1)}% moisture</span>
                                        )}
                                        {grades.length > 0 && (
                                          <span className="text-xs text-foreground/45">Grade {grades.join(", ")}</span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  {/* ── Rainfall badge ── */}
                                  <div className="mt-1">
                                    <SeasonRainfallBadge
                                      lat={f.latitude ?? farmLat}
                                      lng={f.longitude ?? farmLng}
                                      startDate={a.plantingDate}
                                      endDate={a.actualHarvestDate ?? a.expectedHarvestDate}
                                    />
                                  </div>
                                  {/* ── Compare across farm button + Season Report button ── */}
                                  <div className="mt-2.5 pt-2 border-t border-border/20 flex items-center gap-2 flex-wrap">
                                    <button
                                      onClick={() => setReportAssignmentId(a.id)}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border text-green-700 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                                    >
                                      <FileText className="w-3 h-3" />
                                      Season Report
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (comparisonAssignmentId === a.id) {
                                          setComparisonAssignmentId(null);
                                          setComparisonVarietyId(null);
                                        } else {
                                          setComparisonAssignmentId(a.id);
                                          setComparisonVarietyId(a.varietyId);
                                        }
                                      }}
                                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                                        comparisonAssignmentId === a.id
                                          ? "bg-violet-600 text-white border-violet-600"
                                          : "text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100"
                                      }`}
                                    >
                                      <BarChart2 className="w-3 h-3" />
                                      {comparisonAssignmentId === a.id ? "Hide comparison" : "Compare across farm"}
                                      {comparisonAssignmentId === a.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                  </div>
                                  {/* ── Comparison panel ── */}
                                  {comparisonAssignmentId === a.id && (() => {
                                    const cq = comparisonQ;
                                    if (cq.isLoading) return (
                                      <div className="mt-3 flex items-center gap-2 text-xs text-foreground/40">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />Fetching farm-wide comparison…
                                      </div>
                                    );
                                    if (cq.isError || !cq.data) return (
                                      <div className="mt-3 text-xs text-red-500">Could not load comparison data.</div>
                                    );
                                    const { comparisons, farmAvgYieldTha, maxYieldTha, minYieldTha } = cq.data;
                                    if (!comparisons.length) return null;
                                    const withHarvest = comparisons.filter(c => c.hasHarvest && c.yieldTha !== null);
                                    const totalEntries = comparisons.length;
                                    const thisEntry = comparisons.find(c => c.id === a.id);
                                    const thisYieldTha = thisEntry?.yieldTha ?? null;
                                    // rank among entries with yield (lower index = better)
                                    const sorted = [...withHarvest].sort((x, y) => (y.yieldTha ?? 0) - (x.yieldTha ?? 0));
                                    const rank = thisYieldTha !== null ? sorted.findIndex(c => c.id === a.id) + 1 : null;
                                    const isTopPerformer = rank === 1 && sorted.length > 1;
                                    return (
                                      <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/40 overflow-hidden">
                                        {/* Header stats */}
                                        <div className="px-4 py-3 bg-violet-600 text-white">
                                          <div className="flex items-center gap-2 mb-2">
                                            <BarChart2 className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Farm Performance Comparison</span>
                                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{a.cropName}{a.variety ? ` · ${a.variety}` : ""}</span>
                                          </div>
                                          <div className="flex items-center gap-4 flex-wrap">
                                            {farmAvgYieldTha !== null && (
                                              <div className="text-center">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Farm avg</p>
                                                <p className="text-lg font-bold">{farmAvgYieldTha.toFixed(1)} <span className="text-xs font-normal text-violet-200">t/ha</span></p>
                                              </div>
                                            )}
                                            {maxYieldTha !== null && (
                                              <div className="text-center">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Best</p>
                                                <p className="text-lg font-bold text-green-300">{maxYieldTha.toFixed(1)} <span className="text-xs font-normal text-violet-200">t/ha</span></p>
                                              </div>
                                            )}
                                            {minYieldTha !== null && (
                                              <div className="text-center">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Worst</p>
                                                <p className="text-lg font-bold text-red-300">{minYieldTha.toFixed(1)} <span className="text-xs font-normal text-violet-200">t/ha</span></p>
                                              </div>
                                            )}
                                            {rank !== null && (
                                              <div className="text-center ml-auto">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">This field rank</p>
                                                <p className="text-lg font-bold flex items-center gap-1">
                                                  {isTopPerformer && <Trophy className="w-4 h-4 text-yellow-300" />}
                                                  {rank === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                                                  {rank}/{sorted.length}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {/* Comparison table */}
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs">
                                            <thead>
                                              <tr className="border-b border-violet-200 bg-violet-50">
                                                <th className="text-left px-3 py-2 font-semibold text-foreground/50">Field</th>
                                                <th className="text-center px-3 py-2 font-semibold text-foreground/50">Year</th>
                                                <th className="text-right px-3 py-2 font-semibold text-foreground/50">Area</th>
                                                <th className="text-right px-3 py-2 font-semibold text-foreground/50">Yield t/ha</th>
                                                <th className="text-right px-3 py-2 font-semibold text-foreground/50">vs avg</th>
                                                <th className="text-center px-3 py-2 font-semibold text-foreground/50">Moisture</th>
                                                <th className="text-center px-3 py-2 font-semibold text-foreground/50">Grade</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {comparisons.map(c => {
                                                const isThis = c.id === a.id;
                                                const diff = (c.yieldTha !== null && farmAvgYieldTha !== null) ? c.yieldTha - farmAvgYieldTha : null;
                                                const isAbove = diff !== null && withHarvest.length > 1 && diff > 0.1;
                                                const isBelow = diff !== null && withHarvest.length > 1 && diff < -0.1;
                                                const rowCls = isThis
                                                  ? "bg-violet-100 border-b border-violet-200"
                                                  : "border-b border-violet-100 hover:bg-violet-50/60 transition-colors";
                                                const fieldAreaHa = c.fieldAreaHectares ? parseFloat(String(c.fieldAreaHectares)) : null;
                                                const displayArea = c.totalAreaHarvestedHa ? parseFloat(c.totalAreaHarvestedHa) : fieldAreaHa;
                                                return (
                                                  <tr key={c.id} className={rowCls}>
                                                    <td className="px-3 py-2">
                                                      <div className="flex items-center gap-1.5">
                                                        {isThis && <div className="w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />}
                                                        <span className={isThis ? "font-bold text-violet-900" : "text-foreground/70"}>
                                                          {c.fieldName}
                                                        </span>
                                                        {c.fieldReference && <span className="text-foreground/35 font-mono">{c.fieldReference}</span>}
                                                        {isThis && <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-semibold ml-1">this</span>}
                                                      </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-foreground/60">{c.year ?? "—"}{c.season ? ` · ${c.season}` : ""}</td>
                                                    <td className="px-3 py-2 text-right text-foreground/60">{displayArea ? `${displayArea.toFixed(1)} ha` : "—"}</td>
                                                    <td className="px-3 py-2 text-right">
                                                      {c.yieldTha !== null
                                                        ? <span className={`font-bold ${isThis ? "text-violet-900" : "text-foreground"}`}>{c.yieldTha.toFixed(1)}</span>
                                                        : <span className="text-foreground/30">—</span>
                                                      }
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                      {isAbove && <span className="inline-flex items-center gap-0.5 text-green-600 font-semibold"><TrendingUp className="w-3 h-3" />+{diff!.toFixed(1)}</span>}
                                                      {isBelow && <span className="inline-flex items-center gap-0.5 text-red-500 font-semibold"><TrendingDown className="w-3 h-3" />{diff!.toFixed(1)}</span>}
                                                      {!isAbove && !isBelow && c.yieldTha !== null && withHarvest.length > 1 && <span className="text-foreground/30"><Minus className="w-3 h-3 inline" /></span>}
                                                      {c.yieldTha === null && !c.hasHarvest && <span className="text-foreground/25 text-[10px]">No harvest</span>}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-foreground/60">{c.avgMoisturePercent ? `${c.avgMoisturePercent}%` : "—"}</td>
                                                    <td className="px-3 py-2 text-center text-foreground/60">{c.qualityGrades || "—"}</td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                            {farmAvgYieldTha !== null && withHarvest.length > 1 && (
                                              <tfoot>
                                                <tr className="border-t-2 border-violet-300 bg-violet-100/60">
                                                  <td colSpan={3} className="px-3 py-2 font-semibold text-foreground/60">Farm average</td>
                                                  <td className="px-3 py-2 text-right font-bold text-violet-900">{farmAvgYieldTha.toFixed(1)}</td>
                                                  <td colSpan={3} className="px-3 py-2 text-center text-[10px] text-foreground/40">across {withHarvest.length} harvest records</td>
                                                </tr>
                                              </tfoot>
                                            )}
                                          </table>
                                        </div>
                                        {totalEntries > withHarvest.length && (
                                          <p className="px-4 py-2 text-[10px] text-foreground/40 border-t border-violet-200">
                                            {totalEntries - withHarvest.length} assignment{totalEntries - withHarvest.length !== 1 ? "s" : ""} with no harvest data not shown in yield average.
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            );
                          } else {
                            const r = entry.data;
                            const luBadgeCls = LAND_USE_BADGE[r.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300";
                            return (
                              <div key={`lu-${r.id}`} className="flex items-start gap-3">
                                <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isCurrent ? "bg-stone-500 border-stone-500" : "bg-white border-border"}`} />
                                  {i < historyEntries.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: "24px" }} />}
                                </div>
                                <div className={`flex-1 rounded-xl border p-4 mb-0 ${isCurrent ? "border-stone-200 bg-stone-50" : "border-border/50 bg-black/[0.01]"}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${luBadgeCls}`}>
                                      <TreePine className="w-3 h-3" />
                                      {LAND_USE_LABEL[r.landUse] ?? r.landUse}
                                    </span>
                                    <span className="text-xs font-bold text-foreground/40">{r.year}{r.season ? ` · ${r.season}` : ""}</span>
                                  </div>
                                  {r.schemeActionCode && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1"><FileText className="w-3 h-3 flex-shrink-0 text-teal-600" />Action: <span className="font-mono font-semibold">{r.schemeActionCode}</span></p>}
                                  {r.schemeReference && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5"><FileText className="w-3 h-3 flex-shrink-0" />Ref: <span className="font-mono">{r.schemeReference}</span></p>}
                                  {(r.startDate || r.endDate) && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5"><CalendarDays className="w-3 h-3 flex-shrink-0" />{formatDate(r.startDate) ?? "—"} → {formatDate(r.endDate) ?? "—"}</p>}
                                  {r.managementNotes && <p className="text-xs text-foreground/50 italic mt-1">{r.managementNotes}</p>}
                                  <div className="flex gap-3 mt-2">
                                    <button onClick={() => { setEditingLandUseRecord(r); landUseForm.reset({ landUse: r.landUse, year: String(r.year), season: r.season ?? "", schemeActionCode: r.schemeActionCode ?? "", schemeReference: r.schemeReference ?? "", areaHectares: r.areaHectares ? String(r.areaHectares) : "", startDate: r.startDate ?? "", endDate: r.endDate ?? "", managementNotes: r.managementNotes ?? "" }); }} className="text-xs text-foreground/40 hover:text-foreground underline cursor-pointer">Edit</button>
                                    <button onClick={() => { if (confirm("Delete this land use record?")) deleteLandUseMut.mutate(r.id); }} className="text-xs text-red-400 hover:text-red-600 underline cursor-pointer">Delete</button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                        {(() => {
                          const yieldRows = fieldAssignments
                            .map(a => {
                              const harvests = fieldHarvests.filter(h => h.fieldCropAssignmentId === a.id);
                              if (!harvests.length) return null;
                              const totalYield = harvests.reduce((s, h) => s + (h.yieldTonnes ? parseFloat(h.yieldTonnes) : 0), 0);
                              const totalArea = harvests.reduce((s, h) => s + (h.areaHarvestedHa ? parseFloat(h.areaHarvestedHa) : 0), 0);
                              const fieldArea = f.areaHectares ? parseFloat(String(f.areaHectares)) : null;
                              const effectiveArea = totalArea > 0 ? totalArea : fieldArea;
                              const yieldTha = effectiveArea && effectiveArea > 0 ? totalYield / effectiveArea : null;
                              return { year: a.year ?? 0, cropName: a.cropName, yieldTha, totalYield };
                            })
                            .filter((r): r is { year: number; cropName: string; yieldTha: number | null; totalYield: number } => r !== null)
                            .sort((a, b) => b.year - a.year);
                          if (!yieldRows.length) return null;
                          const cropAvgs: Record<string, number> = {};
                          const cropCounts: Record<string, number> = {};
                          for (const row of yieldRows) {
                            if (row.yieldTha) {
                              cropAvgs[row.cropName] = (cropAvgs[row.cropName] ?? 0) + row.yieldTha;
                              cropCounts[row.cropName] = (cropCounts[row.cropName] ?? 0) + 1;
                            }
                          }
                          for (const crop of Object.keys(cropAvgs)) {
                            cropAvgs[crop] = cropAvgs[crop] / (cropCounts[crop] ?? 1);
                          }
                          return (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5" /> Yield History
                              </p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-border/30">
                                    <th className="text-left pb-1.5 font-semibold text-foreground/40">Year</th>
                                    <th className="text-left pb-1.5 font-semibold text-foreground/40">Crop</th>
                                    <th className="text-right pb-1.5 font-semibold text-foreground/40">t/ha</th>
                                    <th className="text-right pb-1.5 font-semibold text-foreground/40">vs avg</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {yieldRows.map((row, i) => {
                                    const avg = cropAvgs[row.cropName] ?? 0;
                                    const diff = row.yieldTha !== null ? row.yieldTha - avg : null;
                                    const isAbove = diff !== null && cropCounts[row.cropName] > 1 && diff > 0.1;
                                    const isBelow = diff !== null && cropCounts[row.cropName] > 1 && diff < -0.1;
                                    return (
                                      <tr key={i} className="border-b border-border/20 last:border-0">
                                        <td className="py-1.5 font-medium text-foreground/70">{row.year}</td>
                                        <td className="py-1.5 text-foreground/60 truncate max-w-[80px]">{row.cropName}</td>
                                        <td className="py-1.5 text-right font-semibold text-foreground">
                                          {row.yieldTha ? row.yieldTha.toFixed(1) : `${row.totalYield.toFixed(1)} t`}
                                        </td>
                                        <td className="py-1.5 text-right">
                                          {isAbove && <span className="inline-flex items-center gap-0.5 text-green-600 font-semibold"><TrendingUp className="w-3 h-3" />+{diff!.toFixed(1)}</span>}
                                          {isBelow && <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold"><TrendingDown className="w-3 h-3" />{diff!.toFixed(1)}</span>}
                                          {!isAbove && !isBelow && row.yieldTha && <span className="text-foreground/30"><Minus className="w-3 h-3 inline" /></span>}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {Object.keys(cropCounts).some(c => cropCounts[c] > 1) && (
                                <p className="text-[10px] text-foreground/30 mt-2">Trend vs. this field's average per crop type</p>
                              )}
                            </div>
                          );
                        })()}
                        <button
                          onClick={() => { setLandUseForField(f); landUseForm.reset({ landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: f.areaHectares ? String(f.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                          className="w-full mt-4 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-stone-200 rounded-xl text-xs text-stone-500 font-medium hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          <TreePine className="w-3.5 h-3.5" />
                          Record another season's land use
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })()}

              </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── EDIT CROP / VARIETY DIALOG ── */}
      <Dialog open={!!editingCrop} onOpenChange={(o) => { if (!o) setEditingCrop(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Variety</DialogTitle>
            <DialogDescription>Update this variety's details. Crop name and category changes apply to all varieties of this crop.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Crop Name</label>
              <Input
                value={editCropForm.name}
                onChange={e => setEditCropForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Winter Wheat, Oil Seed Rape"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Variety Name</label>
              <Input
                value={editCropForm.variety}
                onChange={e => setEditCropForm(f => ({ ...f, variety: e.target.value }))}
                placeholder="e.g. KWS Zyatt, Extase"
              />
              <p className="text-xs text-foreground/50 mt-1">Leave blank if variety is not known or not applicable.</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <select
                value={editCropForm.category}
                onChange={e => setEditCropForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">No category</option>
                {["Combinable Crops", "Root Crops", "Vegetables", "Oilseeds", "Pulses", "Grass & Forage", "Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <textarea
                value={editCropForm.notes}
                onChange={e => setEditCropForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Seed rate, treatment details, grower's observations, or any other variety-specific notes…"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setEditingCrop(null)}>Cancel</Button>
            <Button onClick={handleEditCropSave} disabled={editCropSaving || !editCropForm.name.trim()}>
              {editCropSaving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD VARIETY DIALOG ── */}
      <Dialog open={!!addingVarietyCropId} onOpenChange={(o) => { if (!o) setAddingVarietyCropId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Variety</DialogTitle>
            <DialogDescription>Add a new variety to this crop. You can attach a seed data sheet after saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Variety Name</label>
              <Input
                value={addVarietyForm.variety}
                onChange={e => setAddVarietyForm(f => ({ ...f, variety: e.target.value }))}
                placeholder="e.g. KWS Zyatt, Extase, Crusoe"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <textarea
                value={addVarietyForm.notes}
                onChange={e => setAddVarietyForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Seed rate, treatment details, grower's observations, or any other variety-specific notes…"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setAddingVarietyCropId(null)}>Cancel</Button>
            <Button onClick={handleAddVarietySave} disabled={addVarietySaving || !addVarietyForm.variety.trim()}>
              {addVarietySaving ? "Adding…" : "Add Variety"}
            </Button>
          </DialogFooter>
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
          landUseRecords={landUseRecords}
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
                  {...assignForm.register("varietyId", {
                    required: true,
                    valueAsNumber: true,
                    onChange: () => {
                      assignForm.setValue("seedBatchId", "");
                      setTgwManuallySet(false);
                    },
                  })}
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

              {!!watchedAssignVarietyId && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Seed Batch</label>
                  <p className="text-xs text-muted-foreground mb-1.5">Optional — selecting a batch auto-fills TGW and reserves stock.</p>
                  <select
                    {...assignForm.register("seedBatchId", {
                      onChange: (e) => {
                        const batch = availableSeedBatches.find(b => String(b.id) === e.target.value);
                        if (batch && !tgwManuallySet) {
                          assignForm.setValue("tgwGrams", batch.tgwGrams);
                        }
                      },
                    })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">No batch — enter TGW manually</option>
                    {availableSeedBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} — TGW {b.tgwGrams}g — {Number(b.quantityRemainingKg).toFixed(1)}kg remaining
                        {b.supplierName ? ` (${b.supplierName})` : ""}
                      </option>
                    ))}
                  </select>
                  {availableSeedBatches.length === 0 && (
                    <p className="text-[11px] text-foreground/50 mt-1">No seed batches in stock for this variety. Add one in Seed Store.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Planting Date</label>
                  <Input
                    type="date"
                    {...assignForm.register("plantingDate", {
                      onChange: (e) => {
                        if (!seasonManuallySet) {
                          const derived = deriveSeasonFromDate(e.target.value);
                          if (derived) assignForm.setValue("season", derived);
                        }
                      },
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Expected Harvest</label>
                  <Input type="date" {...assignForm.register("expectedHarvestDate")} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Season</label>
                <p className="text-xs text-muted-foreground mb-1.5">When the crop goes in the ground — auto-filled from Planting Date, but you can change it.</p>
                <select
                  {...assignForm.register("season", {
                    onChange: () => setSeasonManuallySet(true),
                  })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select a season...</option>
                  {SEASON_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const soilType = assignForField?.soilType;
                const blackgrassRisk = !!assignForField?.blackgrassRiskField;
                const watchedPlantingDate = assignForm.watch("plantingDate");
                const watchedTarget = assignForm.watch("targetPlantPopulationM2");
                const watchedTgw = assignForm.watch("tgwGrams");
                const establishment = getEstablishmentPercent(soilType, watchedPlantingDate);
                const targetNum = watchedTarget ? parseFloat(watchedTarget) : NaN;
                const tgwNum = watchedTgw ? parseFloat(watchedTgw) : NaN;
                const calc = !isNaN(targetNum) && !isNaN(tgwNum)
                  ? calculateSeedRate(targetNum, tgwNum, establishment.percent)
                  : null;
                const applyCalculatedRate = () => {
                  if (!calc) return;
                  assignForm.setValue("seedRate", String(calc.seedRateKgHa));
                  assignForm.setValue("seedUnit", "kg/ha");
                };
                return (
                  <div className="rounded-lg border-2 border-dashed border-green-200 bg-green-50/40 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-green-700" />
                      <p className="text-sm font-semibold text-green-900">Seed rate calculator</p>
                      <span className="text-xs text-foreground/50">(optional)</span>
                    </div>
                    <p className="text-xs text-foreground/60">
                      Target plants/m² × TGW ÷ estimated establishment %, adjusted for this field's soil type and planting date.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground/70">Target Plant Population (plants/m²)</label>
                        <Input
                          type="number" step="1" placeholder={String(suggestTargetPopulation(blackgrassRisk))}
                          {...assignForm.register("targetPlantPopulationM2")}
                        />
                        {blackgrassRisk && (
                          <p className="text-[11px] text-red-700 mt-1">Black-grass risk field — suggest {BLACKGRASS_TARGET_POPULATION_M2}/m² to raise crop competition.</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground/70">TGW — Thousand Grain Weight (g)</label>
                        <Input
                          type="number" step="0.1" placeholder="e.g. 48.5"
                          {...assignForm.register("tgwGrams", { onChange: () => setTgwManuallySet(true) })}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-foreground/60 space-y-0.5">
                      <p>Soil: {soilType || "not set"} — {establishment.soilLabel}</p>
                      <p>Timing: {establishment.dateLabel}</p>
                      <p className="font-medium text-foreground/80">Estimated establishment: {establishment.percent}%</p>
                    </div>
                    {calc ? (
                      <div className="flex items-center justify-between rounded-md bg-white border border-green-300 px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-green-900">Suggested seed rate: {calc.seedRateKgHa} kg/ha</p>
                          <p className="text-xs text-foreground/60">{calc.seedsPerM2} seeds/m²</p>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={applyCalculatedRate}>Use this rate</Button>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground/50">Enter a target population and TGW to see a suggested seed rate.</p>
                    )}
                  </div>
                );
              })()}

              {(() => {
                const watchedSeedBatchId = assignForm.watch("seedBatchId");
                const selectedBatch = availableSeedBatches.find(b => String(b.id) === String(watchedSeedBatchId));
                if (!selectedBatch) return null;
                const watchedSeedRate = assignForm.watch("seedRate");
                const watchedSeedUnit = assignForm.watch("seedUnit") || "kg/ha";
                const seedRateNum = watchedSeedRate ? parseFloat(watchedSeedRate) : NaN;
                const areaHa = assignForField?.areaHectares ? Number(assignForField.areaHectares) : NaN;
                const bagWeightKg = Number(selectedBatch.bagWeightKg) || 25;
                const canCalc = !isNaN(seedRateNum) && !isNaN(areaHa) && watchedSeedUnit === "kg/ha";
                const bagsNeeded = canCalc ? Math.ceil((seedRateNum * areaHa) / bagWeightKg) : null;
                const kgNeeded = bagsNeeded !== null ? bagsNeeded * bagWeightKg : null;
                const remainingKg = Number(selectedBatch.quantityRemainingKg);
                const insufficient = kgNeeded !== null && kgNeeded > remainingKg;
                return (
                  <div className={`rounded-lg border p-3 text-sm ${insufficient ? "border-red-300 bg-red-50" : "border-blue-200 bg-blue-50/50"}`}>
                    {bagsNeeded !== null ? (
                      <>
                        <p className={insufficient ? "text-red-900 font-medium" : "text-blue-900 font-medium"}>
                          Bags needed: {bagsNeeded} ({kgNeeded?.toFixed(1)}kg of {bagWeightKg}kg bags)
                        </p>
                        {insufficient ? (
                          <p className="text-xs text-red-700 mt-1">
                            Only {remainingKg.toFixed(1)}kg remaining in this batch — not enough stock. Choose another batch or reduce area/rate.
                          </p>
                        ) : (
                          <p className="text-xs text-blue-700 mt-1">{remainingKg.toFixed(1)}kg remaining in batch after allocation would be {(remainingKg - (kgNeeded ?? 0)).toFixed(1)}kg.</p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-foreground/60">Enter a Seed Rate in kg/ha to calculate bags needed from this batch.</p>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Seed Rate</label>
                  <Input type="number" step="0.1" placeholder="e.g. 180" {...assignForm.register("seedRate")} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Unit</label>
                  <select
                    {...assignForm.register("seedUnit")}
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  >
                    <option value="kg/ha">kg/ha</option>
                    <option value="seeds/m²">seeds/m²</option>
                    <option value="kg/acre">kg/acre</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Row Spacing (cm)</label>
                  <Input type="number" step="0.5" placeholder={assignForField?.blackgrassRiskField ? "≤ 15" : "e.g. 12.5"} {...assignForm.register("targetRowSpacingCm")} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAssignForField(null)}>Cancel</Button>
                <Button type="submit" disabled={assigningCrop}>{assigningCrop ? "Saving..." : "Assign Crop"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── LAND USE DIALOG ── */}
      {(() => {
        const isEditing = !!editingLandUseRecord;
        const targetField = isEditing
          ? fields.find(f => f.id === editingLandUseRecord!.fieldId) ?? null
          : landUseForField;
        const isOpen = !!landUseForField || !!editingLandUseRecord;
        const watchedLandUse = landUseForm.watch("landUse");
        const onClose = () => { setLandUseForField(null); setEditingLandUseRecord(null); landUseForm.reset(); };
        const onSubmitLandUse = (values: LandUseFormData) => {
          const payload = {
            fieldId: targetField!.id,
            year: Number(values.year),
            season: values.season || null,
            landUse: values.landUse,
            schemeActionCode: values.schemeActionCode || null,
            schemeReference: values.schemeReference || null,
            areaHectares: values.areaHectares || null,
            startDate: values.startDate || null,
            endDate: values.endDate || null,
            managementNotes: values.managementNotes || null,
          };
          if (isEditing) {
            updateLandUseMut.mutate({ id: editingLandUseRecord!.id, ...payload }, { onSuccess: onClose });
          } else {
            createLandUseMut.mutate(payload as any, { onSuccess: onClose });
          }
        };
        return (
          <Dialog open={isOpen} onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-stone-600" />
                  {isEditing ? "Edit Land Use Record" : `Record Land Use — ${targetField?.name || "Field"}`}
                </DialogTitle>
                <DialogDescription>
                  Record how this field is being managed when not in arable or horticultural production — for example fallow, SFI or Countryside Stewardship options, permanent grassland or woodland.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={landUseForm.handleSubmit(onSubmitLandUse)} className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Land Use Type <span className="text-red-500">*</span></label>
                  <select {...landUseForm.register("landUse", { required: true })} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white">
                    {LAND_USE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                    ))}
                  </select>
                </div>
                {SCHEME_CODES_NEEDED.has(watchedLandUse) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Scheme Action Code</label>
                      <Input {...landUseForm.register("schemeActionCode")} placeholder="e.g. CSAM1, AB8, OP1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Agreement Reference</label>
                      <Input {...landUseForm.register("schemeReference")} placeholder="e.g. 23/12345/SFI" className="font-mono" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Year <span className="text-red-500">*</span></label>
                    <Input type="number" min="2000" max="2099" {...landUseForm.register("year", { required: true })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Season Description</label>
                    <Input {...landUseForm.register("season")} placeholder="e.g. Spring 2026" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Start Date</label>
                    <Input type="date" {...landUseForm.register("startDate")} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">End Date</label>
                    <Input type="date" {...landUseForm.register("endDate")} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Area (ha)</label>
                  <Input type="number" step="0.0001" {...landUseForm.register("areaHectares")} placeholder={targetField?.areaHectares ? String(parseFloat(String(targetField.areaHectares)).toFixed(2)) : "e.g. 12.40"} />
                  <p className="text-xs text-foreground/40 mt-1">Leave blank to use full field area. Enter a partial area if only part of the field is in this use.</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Management Notes</label>
                  <textarea {...landUseForm.register("managementNotes")} rows={3} placeholder="e.g. Wild bird seed mix sown April 2026. No cultivation or spraying until Aug." className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={createLandUseMut.isPending || updateLandUseMut.isPending}>
                    {(createLandUseMut.isPending || updateLandUseMut.isPending) ? "Saving..." : isEditing ? "Save Changes" : "Record Land Use"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── SEED RECORDS TAB ── */}
      {tab === "seed" && <SeedDrillingSection farmId={farmId} fields={fields} />}

      {/* ── CROP ROTATION PLANNER TAB ── */}
      {tab === "rotation" && <CropRotationPlanner farmId={farmId} fields={fields} fieldsLoading={fieldsLoading} />}

      {/* ── FIELD MAP TAB ── */}
      {tab === "map" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-semibold">Field Map</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Showing plantings and land use for the selected season.</p>
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
          <FieldSchematicMap
            fields={fields}
            currentCropByField={currentCropByField as Record<number, { fieldId: number; cropName?: string; season?: string; year?: number; plantingDate?: string; expectedHarvestDate?: string }>}
            currentLandUseByField={currentLandUseByField as Record<number, { fieldId: number; landUse: string }>}
            selectedYear={selectedYear}
          />
        </div>
      )}

      {/* ── LAND TENURE REGISTER TAB ── */}
      {tab === "tenure" && (() => {
        const today = new Date().toISOString().slice(0, 10);
        const in60 = new Date(Date.now() + 60 * 86400 * 1000).toISOString().slice(0, 10);
        const rentedFields = fields.filter(f => f.tenureType && f.tenureType !== "owned" && f.isActive !== false);
        const totalAreaHa = rentedFields.reduce((s, f) => s + (f.areaHectares ? parseFloat(String(f.areaHectares)) : 0), 0);
        const totalAnnualRent = rentedFields.reduce((s, f) => s + (f.annualRentPounds ? parseFloat(String(f.annualRentPounds)) : 0), 0);
        const reviewsDue = rentedFields.filter(f => f.rentReviewDate && f.rentReviewDate >= today && f.rentReviewDate <= in60).length;
        const expiringSoon = rentedFields.filter(f => f.tenancyEndDate && f.tenancyEndDate >= today && f.tenancyEndDate <= in60).length;
        const expiredCount = rentedFields.filter(f => f.tenancyEndDate && f.tenancyEndDate < today).length;
        const alertCount = reviewsDue + expiringSoon + expiredCount;

        const tenureLabels: Record<string, string> = { owned: "Owned", tenanted: "Tenanted", license: "Grazing Licence", seasonal: "Seasonal" };
        const tenureColours: Record<string, string> = {
          tenanted: "bg-blue-100 text-blue-800 border-blue-200",
          license: "bg-amber-100 text-amber-800 border-amber-200",
          seasonal: "bg-purple-100 text-purple-800 border-purple-200",
        };

        function fmtRent(val?: string | number | null) {
          if (!val) return "—";
          const n = parseFloat(String(val));
          return isNaN(n) ? "—" : `£${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }

        function openFieldTenure(f: FieldRecord) {
          setTab("fields");
          setSelectedFieldForHistory(f);
          setDrawerTab("tenure");
          setTenureEditMode(false);
        }

        function openFieldTenureForEdit(f: FieldRecord) {
          setTenureForm({
            tenureType: f.tenureType ?? "owned",
            landlordSupplierId: f.landlordSupplierId ? String(f.landlordSupplierId) : "__none__",
            tenancyStartDate: f.tenancyStartDate ?? "",
            tenancyEndDate: f.tenancyEndDate ?? "",
            annualRentPounds: f.annualRentPounds ? String(f.annualRentPounds) : "",
            rentReviewDate: f.rentReviewDate ?? "",
            tenureNotes: f.tenureNotes ?? "",
          });
          setTab("fields");
          setSelectedFieldForHistory(f);
          setDrawerTab("tenure");
          setTenureEditMode(true);
        }

        const fieldsWithoutTenure = fields.filter(f => f.isActive !== false && (!f.tenureType || f.tenureType === "owned"));

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Land Tenure Register</h2>
                <p className="text-xs text-muted-foreground mt-0.5">All land held by the farm under tenancy, licence, or seasonal agreement — and the associated rent liability.</p>
              </div>
            </div>

            {/* Stats bar */}
            {rentedFields.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{rentedFields.length}</div>
                  <div className="text-xs text-muted-foreground">Fields Rented In</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-800">{totalAreaHa.toFixed(1)} ha</div>
                  <div className="text-xs text-green-700">Total Area Rented</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-800">{totalAnnualRent > 0 ? `£${totalAnnualRent.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}</div>
                  <div className="text-xs text-blue-700">Annual Rent Liability</div>
                </div>
                <div className={`rounded-lg p-3 text-center ${alertCount > 0 ? "bg-amber-50" : "bg-muted/40"}`}>
                  <div className={`text-xl font-bold ${alertCount > 0 ? "text-amber-800" : ""}`}>{alertCount}</div>
                  <div className={`text-xs ${alertCount > 0 ? "text-amber-700" : "text-muted-foreground"}`}>Upcoming Alerts</div>
                </div>
              </div>
            )}

            {/* Alert banners */}
            {expiredCount > 0 && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">{expiredCount} tenancy agreement{expiredCount !== 1 ? "s have" : " has"} passed their end date</p>
                  <p className="text-xs text-red-600 mt-0.5">Review the highlighted rows below and renew or update the tenancy details.</p>
                </div>
              </div>
            )}
            {(reviewsDue > 0 || expiringSoon > 0) && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <CalendarDays className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  {reviewsDue > 0 && <p className="font-medium">{reviewsDue} rent review{reviewsDue !== 1 ? "s" : ""} due within 60 days — contact your landlord or agent to initiate.</p>}
                  {expiringSoon > 0 && <p className={`font-medium ${reviewsDue > 0 ? "mt-0.5" : ""}`}>{expiringSoon} tenancy agreement{expiringSoon !== 1 ? "s expire" : " expires"} within 60 days — arrange renewal if continuing.</p>}
                </div>
              </div>
            )}

            {/* Empty state — no rented fields yet */}
            {rentedFields.length === 0 && fieldsWithoutTenure.length === 0 && (
              <div className="border rounded-xl p-12 text-center text-muted-foreground">
                <Landmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No fields added yet</p>
                <p className="text-xs mt-1">Add fields on the Fields tab first, then set tenure here.</p>
              </div>
            )}

            {/* Table */}
            {rentedFields.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Field</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Landlord</th>
                      <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Area</th>
                      <th className="text-right px-4 py-3 font-medium">Annual Rent</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Tenancy End</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Rent Review</th>
                      <th className="px-4 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rentedFields.map(f => {
                      const landlord = f.landlordSupplierId ? landlordSuppliers.find(s => s.id === f.landlordSupplierId) : null;
                      const isExpired = f.tenancyEndDate && f.tenancyEndDate < today;
                      const isEndingSoon = !isExpired && f.tenancyEndDate && f.tenancyEndDate <= in60;
                      const isReviewDue = f.rentReviewDate && f.rentReviewDate >= today && f.rentReviewDate <= in60;
                      return (
                        <tr key={f.id} className={`hover:bg-muted/30 transition-colors ${isExpired ? "bg-red-50" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="font-medium">{f.name || `Field #${f.id}`}</div>
                            {f.fieldReference && <div className="text-xs text-muted-foreground font-mono">{f.fieldReference}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${tenureColours[f.tenureType!] ?? "bg-muted text-foreground border-border"}`}>
                              {tenureLabels[f.tenureType!] ?? f.tenureType}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {landlord ? (
                              <div>
                                <div className="font-medium">{landlord.name}</div>
                                {landlord.phone && <div className="text-xs text-muted-foreground">{landlord.phone}</div>}
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell text-muted-foreground">
                            {f.areaHectares ? `${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {fmtRent(f.annualRentPounds)}
                            {f.annualRentPounds && (
                              <div className="text-xs text-muted-foreground font-normal">per year</div>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {f.tenancyEndDate ? (
                              <span className={`text-xs font-medium ${isExpired ? "text-red-700" : isEndingSoon ? "text-amber-700" : "text-foreground"}`}>
                                {formatDate(f.tenancyEndDate)}
                                {isExpired && <span className="ml-1 text-red-600">(expired)</span>}
                                {isEndingSoon && <span className="ml-1 text-amber-600">(soon)</span>}
                              </span>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {f.rentReviewDate ? (
                              <span className={`text-xs font-medium ${isReviewDue ? "text-amber-700" : "text-foreground"}`}>
                                {formatDate(f.rentReviewDate)}
                                {isReviewDue && <span className="ml-1 text-amber-600">(due soon)</span>}
                              </span>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 gap-1" onClick={() => openFieldTenure(f)}>
                              <FileText className="h-3 w-3" /> Open
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {rentedFields.length > 1 && totalAnnualRent > 0 && (
                    <tfoot className="border-t bg-muted/30">
                      <tr>
                        <td colSpan={4} className="px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Total</td>
                        <td colSpan={4} className="px-4 py-2.5 text-xs font-medium sm:hidden">Total annual rent</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-sm">£{totalAnnualRent.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-xs font-normal text-muted-foreground ml-1">/ yr</span></td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {/* Per-hectare analysis */}
            {rentedFields.length > 0 && totalAreaHa > 0 && totalAnnualRent > 0 && (
              <p className="text-xs text-muted-foreground text-right px-1">
                Blended average: <span className="font-medium text-foreground">£{(totalAnnualRent / totalAreaHa).toFixed(2)} / ha / yr</span> across {totalAreaHa.toFixed(1)} ha
              </p>
            )}

            {/* Fields without tenure — shown when any active field has no tenure set */}
            {fieldsWithoutTenure.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 border-b flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {fieldsWithoutTenure.length} field{fieldsWithoutTenure.length !== 1 ? "s" : ""} — no tenure recorded
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">Click "Set tenure" to record the ownership or tenancy basis for each field.</p>
                  </div>
                </div>
                <div className="divide-y">
                  {fieldsWithoutTenure.map(f => (
                    <div key={f.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{f.name || `Field #${f.id}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.areaHectares ? `${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : "Area not set"}
                          {(f as any).fieldReference ? ` · ${(f as any).fieldReference}` : ""}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => openFieldTenureForEdit(f)}>
                        <Key className="h-3 w-3" />
                        Set tenure
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Add New Landlord Dialog ── */}
      <Dialog open={showAddLandlordDialog} onOpenChange={setShowAddLandlordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Landlord / Landowner</DialogTitle>
            <DialogDescription>Create a new landlord contact. They will be available to all fields on this farm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Name <span className="text-red-500">*</span></label>
              <Input value={landlordQuickForm.name} onChange={e => setLandlordQuickForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Smith Estates Ltd" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Contact Name</label>
              <Input value={landlordQuickForm.contactName} onChange={e => setLandlordQuickForm(p => ({ ...p, contactName: e.target.value }))} placeholder="e.g. James Smith" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Phone</label>
              <Input value={landlordQuickForm.phone} onChange={e => setLandlordQuickForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. 01234 567890" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Address</label>
              <Input value={landlordQuickForm.address} onChange={e => setLandlordQuickForm(p => ({ ...p, address: e.target.value }))} placeholder="e.g. Estate Office, High Street" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLandlordDialog(false)}>Cancel</Button>
            <Button disabled={savingLandlord || !landlordQuickForm.name.trim()} onClick={async () => {
              setSavingLandlord(true);
              try {
                const res = await fetch(`/api/farms/${safeFarmId}/landlords`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(landlordQuickForm),
                });
                const data = await res.json();
                queryClient.invalidateQueries({ queryKey: ["farm-landlords", safeFarmId] });
                setTenureForm(prev => ({ ...prev, landlordSupplierId: String(data.record.id) }));
                setShowAddLandlordDialog(false);
              } finally {
                setSavingLandlord(false);
              }
            }}>
              {savingLandlord ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Save Landlord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CropSeasonReport
        assignmentId={reportAssignmentId}
        onClose={() => setReportAssignmentId(null)}
      />
    </AppLayout>
  );
}

// ─── T016: Crop Rotation Planner ──────────────────────────────────────────────

const ROTATION_CROPS = [
  "Wheat", "Barley (Winter)", "Barley (Spring)", "Oilseed Rape", "Beans / Peas",
  "Sugar Beet", "Potatoes", "Oats", "Rye / Triticale", "Linseed",
  "Cover Crop / Break", "Grass Ley", "Fallow / SFI", "Maize",
];
const ROTATION_COLORS: Record<string, string> = {
  "Wheat": "#fef9c3", "Barley (Winter)": "#fef3c7", "Barley (Spring)": "#fde68a",
  "Oilseed Rape": "#d1fae5", "Beans / Peas": "#a7f3d0", "Sugar Beet": "#fbcfe8",
  "Potatoes": "#e0e7ff", "Oats": "#fde68a", "Rye / Triticale": "#fef3c7",
  "Linseed": "#dbeafe", "Cover Crop / Break": "#dcfce7", "Grass Ley": "#bbf7d0",
  "Fallow / SFI": "#f3f4f6", "Maize": "#fef9c3",
};
const CROP_CATEGORY: Record<string, string> = {
  "Wheat": "cereals", "Barley (Winter)": "cereals", "Barley (Spring)": "cereals",
  "Oats": "cereals", "Rye / Triticale": "cereals", "Maize": "cereals",
  "Oilseed Rape": "oilseeds", "Linseed": "oilseeds",
  "Beans / Peas": "pulses", "Sugar Beet": "root-crops", "Potatoes": "root-crops",
  "Cover Crop / Break": "break-crops", "Grass Ley": "grass", "Fallow / SFI": "uncropped",
};

type CropRec = { id: number; cropId?: number; name: string; variety?: string | null; category?: string | null };
type AssignmentRec = {
  id: number; fieldId: number; varietyId: number; cropId?: number; cropName: string; variety?: string | null;
  year: number | null; season: string | null; notes: string | null; reasonTags?: string[] | null;
};

const REASON_TAG_OPTIONS = [
  "Disease/pest break",
  "Blackgrass/weed control",
  "Soil health/organic matter",
  "Market price",
  "Agronomist recommendation",
  "Rotation requirement",
  "Contract/quota commitment",
  "Other",
] as const;

function getCropColor(name: string): string {
  if (ROTATION_COLORS[name]) return ROTATION_COLORS[name];
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(ROTATION_COLORS)) {
    if (lower.includes(key.toLowerCase().split(" ")[0] ?? "")) return color;
  }
  return "#f0fdf4";
}

function CropRotationPlanner({ farmId, fields, fieldsLoading }: { farmId: number; fields: { id: number; name?: string; areaHectares?: string | number | null; isActive?: boolean | null }[]; fieldsLoading?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const currentYear = new Date().getFullYear();
  const YEARS = useMemo(() => Array.from({ length: 9 }, (_, i) => currentYear - 4 + i), [currentYear]);

  const activeFields = fields.filter(f => f.isActive !== false);

  const assignmentsQ = useQuery<{ records: AssignmentRec[] }>({
    queryKey: ["field-crops-planner", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-crops`).then(r => r.json()),
    enabled: !!farmId,
  });

  const cropsQ = useQuery<{ records: CropRec[] }>({
    queryKey: ["crops-planner", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crops`).then(r => r.json()),
    enabled: !!farmId,
  });

  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<string, string | null>>({});
  const [fieldNotes, setFieldNotes] = useState<Record<string, string>>({});
  const [fieldReasonTags, setFieldReasonTags] = useState<Record<string, string[]>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [expandedNotesKey, setExpandedNotesKey] = useState<string | null>(null);
  const [showRotationMgr, setShowRotationMgr] = useState(false);
  const [showSecondCropFor, setShowSecondCropFor] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [osrWarnPending, setOsrWarnPending] = useState<{ fieldId: number; year: number; cropName: string } | null>(null);

  const assignmentMap = useMemo(() => {
    const map: Record<string, AssignmentRec[]> = {};
    for (const a of assignmentsQ.data?.records ?? []) {
      if (a.year) {
        const k = `${a.fieldId}:${a.year}`;
        (map[k] ??= []).push(a);
      }
    }
    return map;
  }, [assignmentsQ.data]);

  useEffect(() => {
    setFieldNotes(prev => {
      const merged = { ...prev };
      for (const a of assignmentsQ.data?.records ?? []) {
        if (a.fieldId && a.year) {
          const k = `${a.fieldId}:${a.year}`;
          if (a.notes && !(k in merged)) merged[k] = a.notes;
        }
      }
      return merged;
    });
    setFieldReasonTags(prev => {
      const merged = { ...prev };
      for (const a of assignmentsQ.data?.records ?? []) {
        if (a.fieldId && a.year) {
          const k = `${a.fieldId}:${a.year}`;
          if (a.reasonTags && a.reasonTags.length > 0 && !(k in merged)) merged[k] = a.reasonTags;
        }
      }
      return merged;
    });
  }, [assignmentsQ.data]);

  const farmCrops = cropsQ.data?.records ?? [];
  const actualFarmCrops = useMemo(() => farmCrops.filter(c => c.category !== "rotation-generic"), [farmCrops]);
  const rotationGenericCrops = useMemo(() => farmCrops.filter(c => c.category === "rotation-generic"), [farmCrops]);
  const actualFarmCropNames = useMemo(() => new Set(actualFarmCrops.map(c => c.name.toLowerCase())), [actualFarmCrops]);
  const rotationGenericNames = useMemo(() => new Set(rotationGenericCrops.map(c => c.name.toLowerCase())), [rotationGenericCrops]);
  const genericExtras = useMemo(
    () => ROTATION_CROPS.filter(r => !actualFarmCropNames.has(r.toLowerCase()) && !rotationGenericNames.has(r.toLowerCase())),
    [actualFarmCropNames, rotationGenericNames],
  );

  const getCellCrop = (fieldId: number, year: number): string => {
    const key = `${fieldId}:${year}`;
    if (key in localOverrides) return localOverrides[key] ?? "";
    const a = assignmentMap[key]?.[0];
    if (!a) return "";
    return a.cropName + (a.variety ? ` — ${a.variety}` : "");
  };

  const getSecondaryCrops = (fieldId: number, year: number): AssignmentRec[] =>
    (assignmentMap[`${fieldId}:${year}`] ?? []).slice(1);

  const fieldMetrics = useMemo(() => {
    return activeFields.map(f => {
      const osrYears = YEARS.filter(y => {
        const c = getCellCrop(f.id, y).toLowerCase();
        return c.includes("oilseed") || c.includes("rape") || c === "oilseed rape";
      });
      let osrTooClose = false;
      for (let i = 0; i < osrYears.length - 1; i++) {
        if (((osrYears[i + 1] ?? 0) - (osrYears[i] ?? 0)) < 4) osrTooClose = true;
      }
      const cropsInWindow = YEARS.map(y => getCellCrop(f.id, y)).filter(Boolean);
      const diversity = new Set(cropsInWindow).size;
      return { osrTooClose, diversity };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFields, assignmentMap, localOverrides, YEARS]);

  const anyOsrWarning = fieldMetrics.some(m => m.osrTooClose);

  const resolveVarietyId = async (displayStr: string): Promise<number | null> => {
    const matched = farmCrops.find(c => {
      const combined = c.name + (c.variety ? ` — ${c.variety}` : "");
      return combined === displayStr;
    });
    if (matched) return matched.id;
    const byName = farmCrops.find(c => c.name.toLowerCase() === displayStr.toLowerCase() && !c.variety);
    if (byName) return byName.id;
    const res = await fetch(`/api/farms/${farmId}/crops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: displayStr, category: CROP_CATEGORY[displayStr] ?? "rotation-generic" }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { record?: { id: number } };
    await qc.invalidateQueries({ queryKey: ["crops-planner", farmId] });
    return data.record?.id ?? null;
  };

  const isOsrCrop = (name: string) => {
    const l = name.toLowerCase();
    return l.includes("oilseed") || l.includes("rape");
  };

  const wouldBreakOsrRule = (fieldId: number, year: number, cropName: string): boolean => {
    if (!isOsrCrop(cropName)) return false;
    const otherOsrYears = YEARS.filter(y => {
      if (y === year) return false;
      return isOsrCrop(getCellCrop(fieldId, y));
    });
    const allOsrYears = [...otherOsrYears, year].sort((a, b) => a - b);
    for (let i = 0; i < allOsrYears.length - 1; i++) {
      if (((allOsrYears[i + 1] ?? 0) - (allOsrYears[i] ?? 0)) < 4) return true;
    }
    return false;
  };

  const doSaveCellChange = async (fieldId: number, year: number, cropName: string) => {
    const key = `${fieldId}:${year}`;
    const existing = assignmentMap[key]?.[0];
    setLocalOverrides(p => ({ ...p, [key]: cropName || null }));
    setSavingCell(key);
    try {
      if (!cropName) {
        if (existing) {
          const res = await fetch(`/api/farms/${farmId}/field-crops/${existing.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete failed");
        }
      } else if (existing) {
        const varietyId = await resolveVarietyId(cropName);
        if (!varietyId) throw new Error("Could not resolve crop");
        if (varietyId !== existing.varietyId) {
          const res = await fetch(`/api/farms/${farmId}/field-crops/${existing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ varietyId }),
          });
          if (!res.ok) throw new Error("Update failed");
        }
      } else {
        const varietyId = await resolveVarietyId(cropName);
        if (!varietyId) throw new Error("Could not resolve crop");
        const res = await fetch(`/api/farms/${farmId}/field-crops`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldId, varietyId, year, season: String(year) }),
        });
        if (!res.ok) throw new Error("Create failed");
      }
      await qc.invalidateQueries({ queryKey: ["field-crops-planner", farmId] });
      setLocalOverrides(p => { const n = { ...p }; delete n[key]; return n; });
    } catch (err) {
      setLocalOverrides(p => { const n = { ...p }; delete n[key]; return n; });
      toast({ title: "Failed to save", description: String(err), variant: "destructive" });
    } finally {
      setSavingCell(null);
    }
  };

  const handleCellChange = async (fieldId: number, year: number, cropName: string) => {
    if (cropName && wouldBreakOsrRule(fieldId, year, cropName)) {
      setOsrWarnPending({ fieldId, year, cropName });
      return;
    }
    await doSaveCellChange(fieldId, year, cropName);
  };

  const handleAddSecondaryCrop = async (fieldId: number, year: number, cropName: string) => {
    if (!cropName) { setShowSecondCropFor(null); return; }
    const varietyId = await resolveVarietyId(cropName);
    if (!varietyId) return;
    const res = await fetch(`/api/farms/${farmId}/field-crops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldId, varietyId, year, season: String(year) }),
    });
    if (!res.ok) { toast({ title: "Failed to add catch crop", variant: "destructive" }); return; }
    await qc.invalidateQueries({ queryKey: ["field-crops-planner", farmId] });
    setShowSecondCropFor(null);
  };

  const handleRemoveSecondaryCrop = async (assignmentId: number) => {
    const res = await fetch(`/api/farms/${farmId}/field-crops/${assignmentId}`, { method: "DELETE" });
    if (!res.ok) { toast({ title: "Failed to remove", variant: "destructive" }); return; }
    await qc.invalidateQueries({ queryKey: ["field-crops-planner", farmId] });
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    try {
      const res = await fetch(`/api/farms/${farmId}/crops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category: "rotation-generic" }),
      });
      if (!res.ok) throw new Error("Failed to add");
      await qc.invalidateQueries({ queryKey: ["crops-planner", farmId] });
      setNewCategoryName("");
    } catch (err) {
      toast({ title: "Failed to add category", description: String(err), variant: "destructive" });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await fetch(`/api/farms/${farmId}/crops/${id}`, { method: "DELETE" });
    if (!res.ok) { toast({ title: "Failed to remove", variant: "destructive" }); return; }
    await qc.invalidateQueries({ queryKey: ["crops-planner", farmId] });
  };

  const handleSaveNotes = async (fieldId: number, year: number) => {
    const key = `${fieldId}:${year}`;
    const notes = fieldNotes[key] ?? "";
    const reasonTags = fieldReasonTags[key] ?? [];
    const assignment = assignmentMap[key]?.[0];
    if (!assignment) return;
    setSavingNotes(p => ({ ...p, [key]: true }));
    try {
      await fetch(`/api/farms/${farmId}/field-crops/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, reasonTags }),
      });
      await qc.invalidateQueries({ queryKey: ["field-crops-planner", farmId] });
    } catch {
      toast({ title: "Failed to save notes", variant: "destructive" });
    } finally {
      setSavingNotes(p => ({ ...p, [key]: false }));
    }
  };

  const toggleReasonTag = (fieldId: number, year: number, tag: string) => {
    const key = `${fieldId}:${year}`;
    setFieldReasonTags(prev => {
      const existing = prev[key] ?? [];
      const next = existing.includes(tag) ? existing.filter(t => t !== tag) : [...existing, tag];
      return { ...prev, [key]: next };
    });
  };

  const isLoading = fieldsLoading || assignmentsQ.isLoading || cropsQ.isLoading;

  if (activeFields.length === 0 && !fieldsLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Sprout className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p>No active fields found. Add fields in the Fields tab to start planning rotations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Rotation Categories manager dialog */}
      <Dialog open={showRotationMgr} onOpenChange={setShowRotationMgr}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Rotation Categories</DialogTitle>
            <DialogDescription>
              Rotation types are a <strong>colour-coding guide only</strong> — they colour the planner grid cells by crop category and appear in the legend below the grid. They cannot be directly assigned to fields. To assign crops to fields, add them to your Crops Register tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Built-in types (read-only)</p>
              <div className="flex flex-wrap gap-1.5">
                {ROTATION_CROPS.map(r => (
                  <span key={r} className="text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded px-2 py-0.5">{r}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Custom types</p>
              {rotationGenericCrops.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No custom types added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {rotationGenericCrops.map(c => (
                    <span key={c.id} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">
                      {c.name}
                      <button
                        title="Remove"
                        onClick={() => void handleDeleteCategory(c.cropId ?? c.id)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New rotation type name…"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") void handleAddCategory(); }}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
              <Button
                size="sm"
                onClick={() => void handleAddCategory()}
                disabled={!newCategoryName.trim() || savingCategory}
              >
                {savingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                Add
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRotationMgr(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guidance */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
        <Sprout className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Crop Rotation Planner</strong> — Assign crops from your Crops Register to each field and year. Past years' crop choices are read-only to protect your compliance records, but you can still add or edit notes and reason tags for any year via the note icon.
          Future years show your plan; the current year is highlighted in green. Avoid continuous cropping — OSR should not return to the same field more than once in 4 years.
          Colours are guided by the rotation type legend below.
        </div>
      </div>

      {anyOsrWarning && (
        <div className="flex gap-2 items-center bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          One or more fields has OSR within 4 years of a previous OSR crop — extend the break to manage clubroot and disease resistance risk.
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading crop history…
        </div>
      )}

      {!isLoading && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="text-sm border-collapse bg-white" style={{ minWidth: `${180 + YEARS.length * 155}px` }}>
            <thead>
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 sticky left-0 bg-gray-50 border-b border-r border-gray-200 z-10 min-w-[180px]">
                  Field
                </th>
                {YEARS.map(y => {
                  const isPast = y < currentYear;
                  const isCurrent = y === currentYear;
                  return (
                    <th key={y} className={`px-1 py-2 text-center text-xs font-semibold border-b min-w-[155px] ${
                      isCurrent ? "bg-green-50 text-green-800" :
                      isPast    ? "bg-gray-50 text-gray-400" :
                                  "bg-sky-50/50 text-sky-800"
                    }`} style={{ borderBottom: isCurrent ? "2px solid #86efac" : undefined }}>
                      <div className="font-bold">{y}</div>
                      <div className="font-normal text-[10px] opacity-70 mt-0.5">
                        {isPast ? "🔒 read-only" : isCurrent ? "▶ current" : "planned"}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activeFields.map((field, fi) => {
                const metrics = fieldMetrics[fi];
                const isNotesExpanded = expandedNotesKey?.startsWith(`${field.id}:`) ?? false;
                const expandedYear = isNotesExpanded ? Number(expandedNotesKey!.split(":")[1]) : null;
                const colSpan = 1 + YEARS.length;
                return (
                  <React.Fragment key={field.id}>
                    <tr className={fi < activeFields.length - 1 && !isNotesExpanded ? "border-b border-gray-100" : ""}>
                      {/* Field name cell */}
                      <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-100 z-10">
                        <div className="font-medium text-gray-800 text-sm leading-tight">
                          {field.name ?? `Field ${field.id}`}
                        </div>
                        {field.areaHectares && (
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {parseFloat(String(field.areaHectares)).toFixed(1)} ha
                          </div>
                        )}
                        {(metrics?.diversity ?? 0) >= 3 && (
                          <div className="text-[11px] text-green-600 mt-0.5">✓ {metrics?.diversity} crops — good diversity</div>
                        )}
                        {(metrics?.diversity ?? 0) === 2 && (
                          <div className="text-[11px] text-amber-600 mt-0.5">⚠ 2 crops — low diversity</div>
                        )}
                        {(metrics?.diversity ?? 0) === 1 && (
                          <div className="text-[11px] text-red-500 mt-0.5">⚠ Monoculture risk</div>
                        )}
                        {metrics?.osrTooClose && (
                          <div className="text-[11px] text-amber-600">⚠ OSR too frequent</div>
                        )}
                      </td>
                      {/* Year cells */}
                      {YEARS.map(y => {
                        const key = `${field.id}:${y}`;
                        const cropName = getCellCrop(field.id, y);
                        const isSaving = savingCell === key;
                        const isPast = y < currentYear;
                        const isCurrent = y === currentYear;
                        const hasRecord = (assignmentMap[key]?.length ?? 0) > 0;
                        const bg = cropName ? getCropColor(cropName) : (isPast ? "#f8fafc" : "#fff");
                        const secondaryCrops = getSecondaryCrops(field.id, y);
                        const isAddingSecond = showSecondCropFor === key;
                        return (
                          <td key={y} style={{ background: bg }} className={`px-2 py-1.5 relative${isCurrent ? " ring-1 ring-inset ring-green-200" : ""}`}>
                            {isSaving ? (
                              <div className="flex items-center justify-center h-8">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-green-500 animate-spin" />
                              </div>
                            ) : isPast ? (
                              /* Past year — read-only */
                              <div className="min-h-[2rem]">
                                {cropName ? (
                                  <div>
                                    <div className="text-xs font-medium text-gray-700 leading-snug">{cropName}</div>
                                    {secondaryCrops.map(sc => (
                                      <div key={sc.id} className="text-[10px] text-gray-400 mt-0.5 italic">
                                        + {sc.cropName}{sc.variety ? ` — ${sc.variety}` : ""}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-300 text-xs select-none">—</span>
                                )}
                              </div>
                            ) : (
                              /* Current / future — editable, farm crops only */
                              <div className="space-y-0.5">
                                {actualFarmCrops.length === 0 ? (
                                  <div className="text-[10px] text-gray-400 italic leading-tight py-0.5 px-1">
                                    Add crops in Crops Register first
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <select
                                      className={`w-full text-xs border-0 bg-transparent cursor-pointer rounded pl-1 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-green-400 ${cropName ? "font-medium text-gray-700 pr-8" : "text-gray-500 pr-5"}`}
                                      value={cropName}
                                      onChange={e => void handleCellChange(field.id, y, e.target.value)}
                                    >
                                      <option value="">— select crop —</option>
                                      {actualFarmCrops.map(c => (
                                        <option key={c.id} value={c.name + (c.variety ? ` — ${c.variety}` : "")}>
                                          {c.name}{c.variety ? ` — ${c.variety}` : ""}
                                        </option>
                                      ))}
                                    </select>
                                    {cropName && (
                                      <button
                                        title="Remove primary crop"
                                        onClick={() => void handleCellChange(field.id, y, "")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-90 transition-opacity"
                                      >
                                        <X className="w-2.5 h-2.5 text-gray-500" />
                                      </button>
                                    )}
                                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                  </div>
                                )}
                                {/* Secondary / catch crops */}
                                {secondaryCrops.map(sc => {
                                  const scLabel = sc.cropName + (sc.variety ? ` — ${sc.variety}` : "");
                                  return (
                                    <div key={sc.id}
                                      className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium"
                                      style={{ background: getCropColor(sc.cropName), color: "#374151" }}>
                                      <span className="flex-1 truncate">{scLabel}</span>
                                      <button
                                        title="Remove catch crop"
                                        onClick={() => void handleRemoveSecondaryCrop(sc.id)}
                                        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                                {/* Add catch crop */}
                                {cropName && actualFarmCrops.length > 0 && !isAddingSecond && secondaryCrops.length < 2 && (
                                  <button
                                    title="Add catch / cover crop for this year"
                                    onClick={() => setShowSecondCropFor(key)}
                                    className="w-full text-[10px] text-gray-300 hover:text-green-500 text-left pl-1 leading-tight transition-colors"
                                  >
                                    + catch crop
                                  </button>
                                )}
                                {cropName && y >= currentYear && (
                                  <button
                                    title={`Raise seed purchase order for ${cropName}`}
                                    onClick={() => navigate(`/seed-store?openPO=1&cropName=${encodeURIComponent(cropName.split(" — ")[0] ?? cropName)}`)}
                                    className="w-full text-[10px] text-amber-400 hover:text-amber-600 text-left pl-1 leading-tight transition-colors flex items-center gap-0.5 mt-0.5"
                                  >
                                    <ShoppingCart className="w-2 h-2" /> order seed
                                  </button>
                                )}
                                {/* Inline catch crop select */}
                                {isAddingSecond && (
                                  <div className="flex items-center gap-0.5">
                                    <div className="relative flex-1">
                                      <select
                                        className="w-full text-[10px] border border-green-300 bg-white cursor-pointer rounded pl-1 pr-5 py-0.5 appearance-none focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-600"
                                        defaultValue=""
                                        onChange={e => void handleAddSecondaryCrop(field.id, y, e.target.value)}
                                      >
                                        <option value="">Select crop…</option>
                                        {actualFarmCrops.map(c => (
                                          <option key={c.id} value={c.name + (c.variety ? ` — ${c.variety}` : "")}>
                                            {c.name}{c.variety ? ` — ${c.variety}` : ""}
                                          </option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-gray-400 pointer-events-none" />
                                    </div>
                                    <button
                                      onClick={() => setShowSecondCropFor(null)}
                                      className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {hasRecord && !isSaving && (
                              <span
                                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400 pointer-events-none"
                                title="Saved crop history record"
                              />
                            )}
                            {hasRecord && !isSaving && (
                              <button
                                title={expandedNotesKey === key ? "Hide notes" : "Show / edit notes for this year"}
                                onClick={() => setExpandedNotesKey(expandedNotesKey === key ? null : key)}
                                className={`absolute bottom-0.5 left-0.5 p-0.5 rounded transition-colors ${
                                  expandedNotesKey === key
                                    ? "text-green-600 bg-green-100"
                                    : (assignmentMap[key]?.[0]?.notes || (assignmentMap[key]?.[0]?.reasonTags?.length ?? 0) > 0)
                                      ? "text-green-500 hover:text-green-700"
                                      : "text-gray-300 hover:text-gray-500"
                                }`}
                              >
                                <StickyNote className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {/* Expanded notes row */}
                    {isNotesExpanded && (
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <td colSpan={colSpan} className="px-4 py-3">
                          {(() => {
                            const y = expandedYear as number;
                            const noteKey = `${field.id}:${y}`;
                            const hasAssignment = (assignmentMap[noteKey]?.length ?? 0) > 0;
                            const selectedTags = fieldReasonTags[noteKey] ?? [];
                            return (
                              <div className="flex items-start gap-3">
                                <StickyNote className="w-3.5 h-3.5 text-green-500 mt-1.5 shrink-0" />
                                <div className="flex-1">
                                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Notes — {field.name ?? `Field ${field.id}`} ({y} season)
                                  </p>
                                  {hasAssignment ? (
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-[10px] text-gray-400 mb-1">Why this crop? (select any that apply)</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {REASON_TAG_OPTIONS.map(tag => {
                                            const active = selectedTags.includes(tag);
                                            return (
                                              <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleReasonTag(field.id, y, tag)}
                                                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                                                  active
                                                    ? "bg-green-100 border-green-300 text-green-700 font-medium"
                                                    : "bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
                                                }`}
                                              >
                                                {tag}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <textarea
                                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white resize-y"
                                        rows={3}
                                        placeholder="Enter rotation notes for this field — variety choice, break crop reason, disease pressure, ground conditions…"
                                        value={fieldNotes[noteKey] ?? ""}
                                        onChange={e => setFieldNotes(p => ({ ...p, [noteKey]: e.target.value }))}
                                        onBlur={() => handleSaveNotes(field.id, y)}
                                      />
                                      <div className="flex items-center gap-3">
                                        <Button
                                          size="sm"
                                          onClick={() => void handleSaveNotes(field.id, y)}
                                          disabled={savingNotes[noteKey]}
                                          className="h-7 text-xs"
                                        >
                                          {savingNotes[noteKey] ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                          ) : (
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                          )}
                                          Save notes
                                        </Button>
                                        <span className="text-xs text-gray-400">Also saves automatically when you click away</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">Assign a crop to {y} before adding notes.</p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend + key */}
      {!isLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colour guide</span>
            <button
              title="Manage Rotation Categories"
              onClick={() => setShowRotationMgr(true)}
              className="text-[10px] font-normal text-gray-400 hover:text-green-600 border border-gray-200 hover:border-green-300 rounded px-1.5 py-0.5 transition-colors"
            >
              Edit ⚙
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[...rotationGenericCrops.map(c => c.name), ...genericExtras].slice(0, 16).map(c => (
              <span key={c} className="text-xs px-2 py-0.5 rounded border border-gray-200"
                style={{ background: getCropColor(c) }}>
                {c}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" /> Saved to crop history
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-200" /> 🔒 Past years are read-only to protect compliance records
            </span>
            <span>Notes are saved to the current year's crop assignment</span>
          </div>
        </div>
      )}

      {/* OSR break-interval confirmation dialog */}
      <Dialog open={!!osrWarnPending} onOpenChange={open => { if (!open) setOsrWarnPending(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              OSR Rotation Warning
            </DialogTitle>
            <DialogDescription className="text-gray-700 pt-1">
              Adding <span className="font-semibold">{osrWarnPending?.cropName}</span> here would place OSR within 4 years of a previous OSR crop on this field.
              <br /><br />
              Short OSR breaks increase the risk of <span className="font-medium">clubroot</span> and <span className="font-medium">disease resistance</span> build-up. The recommended minimum break is <span className="font-medium">4 years</span>.
              <br /><br />
              Are you sure you want to add this crop anyway?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOsrWarnPending(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (osrWarnPending) {
                  void doSaveCellChange(osrWarnPending.fieldId, osrWarnPending.year, osrWarnPending.cropName);
                  setOsrWarnPending(null);
                }
              }}
            >
              Add anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
