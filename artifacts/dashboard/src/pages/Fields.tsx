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
import { getListFieldCropAssignmentsQueryKey } from "@workspace/api-client-react/src/generated/api";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import {
  Plus, Search, Map, MoreVertical, Pencil, Trash2, AlertTriangle,
  Sprout, Leaf, CalendarDays, Wheat, ChevronRight, X, History, ChevronDown, Printer, FlaskConical, Loader2, QrCode, StickyNote,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { FieldBoundaryMapDialog } from "@/components/fields/FieldBoundaryMapDialog";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printProReport } from "@/lib/print-report";

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
            <Map className="w-4 h-4 text-blue-600" />
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

      <div className="relative w-full sm:w-80 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <Input placeholder="Search crop, variety, lot..." className="pl-9 bg-white h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
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
                  <StaffSelect
                    staffNames={(membersData?.members ?? []).map(m => memberFullName(m))}
                    value={formData.operator ?? ""}
                    onChange={val => setField("operator", val)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Soil Conditions</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={formData.soilConditions} onChange={e => setField("soilConditions", e.target.value)}>
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
    </AppLayout>
  );
}
