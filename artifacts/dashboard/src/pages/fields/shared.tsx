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
import { SOIL_TYPE_OPTIONS } from "@/lib/irrigationData";
import { useToast } from "@/hooks/use-toast";
import { DocAttach } from "@/components/DocAttach";
import CropSeasonReport from "@/components/CropSeasonReport";

export const CURRENT_YEAR = new Date().getFullYear();
export const SEASON_OPTIONS = ["Autumn", "Winter", "Spring", "Summer"];

export function deriveSeasonFromDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const month = d.getMonth() + 1;
  if (month >= 8 && month <= 10) return "Autumn";
  if (month === 11 || month === 12 || month === 1) return "Winter";
  if (month >= 2 && month <= 5) return "Spring";
  return "Summer";
}

export interface FieldRecord {
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

export interface CropRecord {
  id: number;
  cropId?: number;
  name: string;
  variety?: string | null;
  category?: string | null;
}

export interface CropDocRecord {
  id: number;
  cropId: number;
  title: string;
  documentUrl: string;
  documentName: string | null;
  uploadedAt: string;
}

export interface FieldCropAssignment {
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

export interface FieldFormData { name: string; areaHectares: number; soilType: string; fieldReference?: string; blackgrassRiskField?: boolean; }
export interface CropFormData { name: string; variety: string; category: string; }
export interface AssignCropFormData {
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

export interface SeedBatchRecord {
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

export interface LandUseRecord {
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
export interface LandUseFormData {
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

export const LAND_USE_OPTIONS = [
  { value: "fallow",                   label: "Fallow",                    icon: "🌾" },
  { value: "sfi",                      label: "SFI Action",                icon: "🌿" },
  { value: "countryside_stewardship",  label: "Countryside Stewardship",   icon: "🦋" },
  { value: "permanent_grassland",      label: "Permanent Grassland",       icon: "🌱" },
  { value: "woodland",                 label: "Woodland",                  icon: "🌳" },
  { value: "set_aside",                label: "Set-aside",                 icon: "⏸️" },
  { value: "out_of_production",        label: "Out of Production",         icon: "🚫" },
  { value: "other",                    label: "Other",                     icon: "📋" },
];
export const LAND_USE_LABEL: Record<string, string> = Object.fromEntries(LAND_USE_OPTIONS.map(o => [o.value, o.label]));
export const LAND_USE_BADGE: Record<string, string> = {
  fallow:                  "bg-amber-100 text-amber-800 border-amber-300",
  sfi:                     "bg-teal-100 text-teal-800 border-teal-300",
  countryside_stewardship: "bg-purple-100 text-purple-800 border-purple-300",
  permanent_grassland:     "bg-green-100 text-green-700 border-green-300",
  woodland:                "bg-emerald-100 text-emerald-800 border-emerald-300",
  set_aside:               "bg-stone-100 text-stone-700 border-stone-300",
  out_of_production:       "bg-red-100 text-red-700 border-red-300",
  other:                   "bg-slate-100 text-slate-700 border-slate-300",
};
export const SCHEME_CODES_NEEDED = new Set(["sfi", "countryside_stewardship"]);

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function harvestVarianceDays(expected?: string | null, actual?: string | null): number | null {
  if (!expected || !actual) return null;
  const e = new Date(expected), a = new Date(actual);
  if (isNaN(e.getTime()) || isNaN(a.getTime())) return null;
  return Math.round((a.getTime() - e.getTime()) / 86400000);
}

export function VarianceBadge({ days, size = "sm" }: { days: number | null; size?: "xs" | "sm" }) {
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

export function HarvestNoteEditor({ assignmentId, farmId, initialNote }: {
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

export interface Farm { name?: string; address?: string; postcode?: string; cphNumber?: string; sbiNumber?: string | null; redTractorId?: string | null; }
export interface PrintableAssignment extends FieldCropAssignment { fieldName?: string; soilType?: string; areaHectares?: string | number | null; fieldReference?: string; }

export function PrintCropRegister({ farmId, year, fields, assignments, crops, landUseRecords, onClose }: {
  farmId: number;
  year: number;
  fields: FieldRecord[];
  assignments: FieldCropAssignment[];
  crops: CropRecord[];
  landUseRecords: LandUseRecord[];
  onClose: () => void;
}) {
  const [, navigate] = useLocation();
  const { data: farmData, isLoading: farmLoading } = useQuery<{ record: Farm }>({
    queryKey: ["farm", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`);
      return r.json();
    },
  });
  const farm = farmData?.record;

  // Only show the warning once the farm record has loaded — avoids false positives during loading
  const missingHeaderFields: string[] = [];
  if (!farmLoading && farm && !farm.sbiNumber?.trim()) missingHeaderFields.push("SBI Number");
  else if (!farmLoading && farm && farm.sbiNumber?.trim() && !/^\d{9}$/.test(farm.sbiNumber.trim())) missingHeaderFields.push("SBI Number (invalid — must be exactly 9 digits)");
  if (!farmLoading && farm && !farm.address?.trim()) missingHeaderFields.push("Farm address");

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
      farmAddress: farm?.address ?? undefined,
      cphNumber: farm?.cphNumber ?? undefined,
      sbiNumber: farm?.sbiNumber ?? undefined,
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

        {missingHeaderFields.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <span>
              <span className="font-medium">Farm Settings incomplete:</span>{" "}
              {missingHeaderFields.join(", ")} {missingHeaderFields.length === 1 ? "is" : "are"} not set — your printed report will have blank header fields.{" "}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-amber-900 font-medium"
                onClick={() => { onClose(); navigate("/settings/farm"); }}
              >
                Add in Farm Settings → General
              </button>
            </span>
          </div>
        )}

        <div id="fields-print-area" className="border border-border rounded-lg p-6 space-y-5 text-sm mt-2">
          {/* Document header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <p className="text-base font-bold text-foreground">{farm?.name ?? "Farm"}</p>
              {farm?.address && <p className="text-xs text-foreground/60">{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
              {farm?.sbiNumber && <p className="text-xs text-foreground/60 mt-0.5">SBI: <span className="font-mono font-semibold">{farm.sbiNumber}</span></p>}
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
          <Button onClick={handlePrint} className="gap-2" disabled={farmLoading}>
            <Printer className="w-4 h-4" /> {farmLoading ? "Loading…" : "Print Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const FIELD_LABEL_CSS = `@page{size:62mm 90mm;margin:0}body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}.brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em}.divider{border-color:#e5e7eb}.farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}svg{display:block;margin:0 auto}.code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}.iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}.hint{font-size:8px;color:#d1d5db;margin-top:4px}`;

export function FieldCardMenu({
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
  const updateFieldMut = useUpdateField(farmId);
  const { mutate: updateField, isPending: isUpdating } = updateFieldMut;
  const deleteFieldMut = useDeleteField(farmId);
  const { mutate: deleteField, isPending: isDeleting } = deleteFieldMut;

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

      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) updateFieldMut.reset(); }}>
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
                <select
                  {...register("soilType")}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">— Select soil type —</option>
                  {SOIL_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
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
            <DialogMutationError mutation={updateFieldMut} message="Failed to save — your entries are still here." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={o => { setDeleteOpen(o); if (!o) deleteFieldMut.reset(); }}>
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
          <DialogMutationError mutation={deleteFieldMut} message="Failed to delete — please try again." />
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


export interface CropComparisonEntry {
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
export interface CropComparisonData {
  comparisons: CropComparisonEntry[];
  farmAvgYieldTha: number | null;
  maxYieldTha: number | null;
  minYieldTha: number | null;
}

export function SeasonRainfallBadge({ lat, lng, startDate, endDate }: {
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

