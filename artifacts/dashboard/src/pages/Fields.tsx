import React, { useState, useEffect, useRef } from "react";
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
import { getListFieldCropAssignmentsQueryKey, getListFieldsQueryKey } from "@workspace/api-client-react/src/generated/api";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import {
  Plus, PlusCircle, Search, Map as MapIcon, MoreVertical, Pencil, Trash2, AlertTriangle,
  Sprout, Leaf, CalendarDays, Wheat, ChevronRight, X, History, ChevronDown, Printer, FlaskConical, Loader2, QrCode, StickyNote,
  Landmark, Phone, MapPin, BadgePoundSterling, RefreshCw, FileText, CheckCircle2, Paperclip, Download, Key,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { QRCodeSVG } from "qrcode.react";
import { FieldBoundaryMapDialog } from "@/components/fields/FieldBoundaryMapDialog";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printProReport } from "@/lib/print-report";
import { cropYearOptions, cropYearLabel, currentCropYear, isInCropYear } from "@/lib/cropYear";

const CURRENT_YEAR = new Date().getFullYear();

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
  notes?: string | null;
}

interface FieldFormData { name: string; areaHectares: number; soilType: string; fieldReference?: string; }
interface CropFormData { name: string; variety: string; category: string; }
interface AssignCropFormData { cropId: number; plantingDate: string; expectedHarvestDate: string; season: string; }

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
    const tableHtml = `<table><thead><tr>
      <th>Field Name</th><th>Ref</th><th>Area (ha)</th><th>Soil Type</th><th>Crop</th><th>Season</th><th>Planted</th><th>Exp. Harvest</th>${rows.some(r => r.actualHarvestDate) ? "<th>Actual Harvest</th><th>Variance</th>" : ""}${rows.some(r => r.notes) ? "<th>Notes</th>" : ""}
    </tr></thead><tbody>${rows.map(row => {
      const vd = harvestVarianceDays(row.expectedHarvestDate, row.actualHarvestDate);
      const varianceText = vd === null ? "—" : vd === 0 ? "On time" : vd > 0 ? `+${vd}d late` : `${vd}d early`;
      return `<tr>
      <td><strong>${row.fieldName || "Field #" + row.fieldId}</strong></td>
      <td style="color:#6b7280">${row.fieldReference || "—"}</td>
      <td>${row.areaHectares ? parseFloat(String(row.areaHectares)).toFixed(2) : "—"}</td>
      <td>${row.soilType || "—"}</td>
      <td><strong>${row.cropName}</strong></td>
      <td>${row.season || "—"}</td>
      <td style="white-space:nowrap">${formatDate(row.plantingDate) || "—"}</td>
      <td style="white-space:nowrap">${formatDate(row.expectedHarvestDate) || "—"}</td>
      ${rows.some(r => r.actualHarvestDate) ? `<td style="white-space:nowrap">${formatDate(row.actualHarvestDate) || "—"}</td><td>${varianceText}</td>` : ""}
      ${rows.some(r => r.notes) ? `<td style="color:#6b7280;font-style:italic">${row.notes || "—"}</td>` : ""}
    </tr>`;
    }).join("")}</tbody></table>
    <p style="font-size:7px;color:#6b7280;margin:6px 0 0">
      <strong>${fields.length}</strong> field${fields.length !== 1 ? "s" : ""} total  ·
      <strong>${rows.filter(r => r.cropId).length}</strong> with crop assigned  ·
      <strong>${rows.filter(r => !r.cropId).length}</strong> unassigned
    </p>`;
    printProReport({
      title: "Crop Register",
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
                  {rows.some(r => r.actualHarvestDate) && (
                    <>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Actual Harvest</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Variance</th>
                    </>
                  )}
                  {rows.some(r => r.notes) && (
                    <th className="border border-border/60 px-3 py-2 text-left font-semibold">Notes</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const varianceDays = harvestVarianceDays(row.expectedHarvestDate, row.actualHarvestDate);
                  return (
                    <tr key={row.fieldId} className={i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}>
                      <td className="border border-border/60 px-3 py-2 font-medium">{row.fieldName || `Field #${row.fieldId}`}</td>
                      <td className="border border-border/60 px-3 py-2 text-foreground/60">{row.fieldReference || "—"}</td>
                      <td className="border border-border/60 px-3 py-2">{row.areaHectares ? parseFloat(String(row.areaHectares)).toFixed(2) : "—"}</td>
                      <td className="border border-border/60 px-3 py-2">{row.soilType || "—"}</td>
                      <td className="border border-border/60 px-3 py-2 font-medium">{row.cropName}</td>
                      <td className="border border-border/60 px-3 py-2">{row.season || "—"}</td>
                      <td className="border border-border/60 px-3 py-2">{formatDate(row.plantingDate) || "—"}</td>
                      <td className="border border-border/60 px-3 py-2">{formatDate(row.expectedHarvestDate) || "—"}</td>
                      {rows.some(r => r.actualHarvestDate) && (
                        <>
                          <td className="border border-border/60 px-3 py-2">{formatDate(row.actualHarvestDate) || "—"}</td>
                          <td className="border border-border/60 px-3 py-2">
                            {varianceDays !== null ? <VarianceBadge days={varianceDays} size="xs" /> : <span className="text-foreground/30">—</span>}
                          </td>
                        </>
                      )}
                      {rows.some(r => r.notes) && (
                        <td className="border border-border/60 px-3 py-2 text-foreground/60 italic">{row.notes || "—"}</td>
                      )}
                    </tr>
                  );
                })}
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
    win.document.close(); win.focus(); win.print(); win.close();
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
          <DropdownMenuItem onClick={() => { setEditOpen(true); reset({ name: field.name ?? "", areaHectares: parseFloat(String(field.areaHectares ?? 0)), soilType: field.soilType ?? "", fieldReference: (field as any).fieldReference ?? "" }); }}>
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
  soilConditions: string | null;
  weatherNotes: string | null;
  notes: string | null;
  createdAt: string;
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
  isTreated: false,
  treatmentProduct: "",
  operator: "",
  areaSeededHa: "",
  soilConditions: "",
  weatherNotes: "",
  notes: "",
};

function SeedDrillingSection({ farmId, fields }: { farmId: number; fields: FieldRecord[] }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState<number>(() => currentCropYear());
  const { data: membersData } = useFarmMembers(farmId);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SeedRecord | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_SEED>(EMPTY_SEED);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
      isTreated: r.isTreated ?? false,
      treatmentProduct: r.treatmentProduct ?? "",
      operator: r.operator ?? "",
      areaSeededHa: r.areaSeededHa ?? "",
      soilConditions: r.soilConditions ?? "",
      weatherNotes: r.weatherNotes ?? "",
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
                  {formData.fieldId && formData.areaSeededHa && (
                    <p className="text-[11px] text-muted-foreground mt-1">Auto-filled from field register — edit if drilling only part of the field</p>
                  )}
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
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"fields" | "crops" | "seed" | "tenure">("fields");
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

  const tenureDocsQ = useQuery({
    queryKey: ["field-tenure-docs", safeFarmId, selectedFieldForHistory?.id],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/fields/${selectedFieldForHistory?.id}/tenure-documents`).then(r => r.json()).then(d => d.documents ?? []),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "tenure",
  });

  const landlordSuppliersQ = useQuery({
    queryKey: ["farm-landlords", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/landlords`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const landlordSuppliers: { id: number; name: string; contactName?: string | null; phone?: string | null; email?: string | null; address?: string | null }[] = landlordSuppliersQ.data ?? [];

  const { uploadFile, isUploading: isUploadingTenureDoc } = useUpload();

  const { mutate: createField, isPending: creatingField } = useAddField(safeFarmId);
  const { mutate: createCrop, isPending: creatingCrop } = useAddCrop(safeFarmId);
  const { mutate: assignCrop, isPending: assigningCrop } = useAssignCrop(safeFarmId);

  const fieldForm = useForm<FieldFormData>();
  const cropForm = useForm<CropFormData>();
  const assignForm = useForm<AssignCropFormData>();

  const fields = (fieldsData?.records ?? []) as unknown as FieldRecord[];
  const crops = (cropsData?.records ?? []) as unknown as CropRecord[];
  const assignments = (assignmentsData?.records ?? []) as unknown as FieldCropAssignment[];

  // Early return after all hooks
  if (!farmId) return <Redirect href="/select" />;

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
    createField({ farmId, data: values as any }, { onSuccess: () => { setIsAddFieldOpen(false); fieldForm.reset(); } });
  };

  const onSubmitCrop = (values: CropFormData) => {
    createCrop({ farmId, data: values as any }, { onSuccess: () => { setIsAddCropOpen(false); cropForm.reset(); } });
  };

  const onSubmitAssign = (values: AssignCropFormData) => {
    if (!assignForField) return;
    assignCrop(
      { farmId, data: { ...values, fieldId: assignForField.id, cropId: Number(values.cropId), year: CURRENT_YEAR, season: values.season } },
      { onSuccess: () => { setAssignForField(null); assignForm.reset(); } }
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

  const cropSeasonAssignments = (cropId: number) => assignments.filter(a =>
    a.cropId === cropId &&
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
                    <button
                      onClick={() => toggleCropGroup(groupName)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left"
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
                              <button
                                onClick={() => setExpandedVarietyId(isVarietyExpanded ? null : crop.id)}
                                className="w-full flex items-center gap-3 px-5 py-3 text-left bg-green-50/20 hover:bg-green-50/50 transition-colors"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 ml-3" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {crop.variety || <span className="italic text-foreground/40">No variety specified</span>}
                                  </p>
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
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
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
                                    Expected harvest {formatDate(a.expectedHarvestDate)}
                                  </p>
                                )}
                                {a.actualHarvestDate && (() => {
                                  const days = harvestVarianceDays(a.expectedHarvestDate, a.actualHarvestDate);
                                  return (
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      <p className="text-xs text-foreground/60 flex items-center gap-1.5">
                                        <Wheat className="w-3 h-3 flex-shrink-0 text-green-700" />
                                        Actual harvest {formatDate(a.actualHarvestDate)}
                                      </p>
                                      {days !== null && <VarianceBadge days={days} size="xs" />}
                                    </div>
                                  );
                                })()}
                                {a.actualHarvestDate && (
                                  <div className="mt-1.5">
                                    <HarvestNoteEditor
                                      assignmentId={a.id}
                                      farmId={farmId}
                                      initialNote={a.notes}
                                    />
                                  </div>
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
    </AppLayout>
  );
}
