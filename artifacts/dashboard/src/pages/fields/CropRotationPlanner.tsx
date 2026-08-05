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
import { useToast } from "@/hooks/use-toast";
import { DocAttach } from "@/components/DocAttach";
import CropSeasonReport from "@/components/CropSeasonReport";

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

export function CropRotationPlanner({ farmId, fields, fieldsLoading }: { farmId: number; fields: { id: number; name?: string; areaHectares?: string | number | null; isActive?: boolean | null }[]; fieldsLoading?: boolean }) {
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
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
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

