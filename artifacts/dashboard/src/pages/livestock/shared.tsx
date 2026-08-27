import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport, escapeHtml } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";


export function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

export function formatDateLong(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return val; }
}

export { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface Farm {
  id: number;
  name: string;
  address: string | null;
  postcode: string | null;
  cphNumber: string | null;
  redTractorId: string | null;
}

export interface Herd {
  id: number;
  farmId: number;
  name: string;
  type: string;
  productionType: string | null;
  breed: string | null;
  herdNumber: string | null;
  registrationDocumentUrl: string | null;
  registrationDocumentName: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Production type options keyed by canonical species slug */
export const PRODUCTION_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  cattle: [
    { value: "dairy", label: "Dairy" },
    { value: "beef", label: "Beef" },
    { value: "suckler", label: "Suckler / Beef" },
    { value: "mixed", label: "Mixed (Beef & Dairy)" },
  ],
  sheep: [
    { value: "meat", label: "Meat / Lamb" },
    { value: "dairy", label: "Dairy" },
    { value: "wool", label: "Wool" },
    { value: "mixed", label: "Mixed" },
  ],
  pigs: [
    { value: "farrow-to-finish", label: "Farrow-to-Finish" },
    { value: "breeding", label: "Breeding / Sows" },
    { value: "finishing", label: "Finishing / Growing" },
    { value: "weaners", label: "Weaners" },
  ],
  goats: [
    { value: "dairy", label: "Dairy" },
    { value: "meat", label: "Meat / Fibre" },
    { value: "mixed", label: "Mixed" },
  ],
  poultry: [
    { value: "layers", label: "Layers (Eggs)" },
    { value: "broilers", label: "Broilers (Meat)" },
    { value: "breeders", label: "Breeders" },
    { value: "mixed", label: "Mixed" },
  ],
  deer: [
    { value: "venison", label: "Venison (Meat)" },
    { value: "breeding", label: "Breeding" },
    { value: "mixed", label: "Mixed" },
  ],
};

export interface VetHealthPlan {
  id: number;
  farmId: number;
  planYear: number;
  vetName: string;
  practiceName: string | null;
  practicePhone: string | null;
  practiceAddress: string | null;
  planDate: string;
  reviewDate: string | null;
  healthPriorities: string | null;
  vaccinationProtocol: string | null;
  biosecurityMeasures: string | null;
  wormingProtocol: string | null;
  flukeTreatment: string | null;
  mastitisPrevention: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface VetHealthPlanActionCompletion {
  id: number;
  farmId: number;
  actionId: number;
  completedDate: string;
  completedBy: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  verifiedBy: string | null;
  verifiedDate: string | null;
  createdAt: string;
}

export interface VetHealthPlanAction {
  id: number;
  farmId: number;
  planId: number;
  description: string;
  category: string;
  frequency: string;
  nextDueDate: string | null;
  assignedTo: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  latestCompletion: VetHealthPlanActionCompletion | null;
  completionCount: number;
}

export interface MortalityRecord {
  id: number;
  farmId: number;
  herdId: number | null;
  animalId: number | null;
  contractorId: number | null;
  contractorName: string | null;
  contractorApprovalNumber: string | null;
  tagNumber: string | null;
  species: string;
  breed: string | null;
  dateOfDeath: string;
  causeOfDeath: string;
  disposalMethod: string;
  disposalOperator: string | null;
  disposalRef: string | null;
  veterinaryAttended: boolean;
  vetName: string | null;
  postMortemCarriedOut: boolean;
  postMortemFindings: string | null;
  bcmsNotified: boolean;
  bcmsNotificationRef: string | null;
  notes: string | null;
  invoiceStatus: string;
  invoiceRef: string | null;
  invoiceAmount: string | null;
  invoicePaidDate: string | null;
  createdAt: string;
}

export interface FallenStockContractor {
  id: number;
  farmId: number;
  name: string;
  approvalNumber: string;
  operatorType: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface FeedRecord {
  id: number;
  farmId: number;
  herdId: number | null;
  feedType: string;
  supplier: string | null;
  batchNumber: string | null;
  quantityKg: string | null;
  feedDate: string;
  notes: string | null;
  feedStockItemId: number | null;
  deliveryId: number | null;
  createdAt: string;
}

export interface WaterRecord {
  id: number;
  farmId: number;
  herdId: number | null;
  waterSource: string;
  sourceDescription: string | null;
  testDate: string | null;
  testResult: string | null;
  testPass: boolean | null;
  labSupplierId: number | null;
  notes: string | null;
  createdAt: string;
}

export interface Animal {
  id: number;
  farmId: number;
  herdId: number | null;
  tagNumber: string | null;
  earTagNumber: string | null;
  eidNumber: string | null;
  species: string;
  breed: string | null;
  sex: string | null;
  dateOfBirth: string | null;
  acquisitionDate: string | null;
  acquisitionSource: string | null;
  animalCode: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface Sire {
  id: number;
  farmId: number;
  name: string;
  species: string;
  breed: string | null;
  tagNumber: string | null;
  passportNumber: string | null;
  dateOfBirth: string | null;
  ownershipType: string;
  supplierName: string | null;
  supplierContact: string | null;
  hireStartDate: string | null;
  hireEndDate: string | null;
  returnDate: string | null;
  bvdStatus: string | null;
  fertilityTestDate: string | null;
  fertilityTestResult: string | null;
  scrapieGenotype: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export const EMPTY_SIRE = {
  name: "", species: "Cattle", breed: "", tagNumber: "", passportNumber: "",
  dateOfBirth: "", ownershipType: "owned",
  supplierName: "", supplierContact: "", hireStartDate: "", hireEndDate: "", returnDate: "",
  bvdStatus: "", fertilityTestDate: "", fertilityTestResult: "", scrapieGenotype: "", notes: "",
};

export interface StrawInventory {
  id: number;
  farmId: number;
  sireRegisterId: number | null;
  sireName: string;
  sireBreed: string | null;
  sireSpecies: string;
  supplierName: string | null;
  batchNumber: string;
  strawsReceived: number;
  strawsUsed: number;
  storageLocation: string | null;
  deliveryDate: string | null;
  unitCostPence: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export const EMPTY_STRAW = {
  sireRegisterId: "" as string | number,
  sireName: "", sireBreed: "", sireSpecies: "Cattle",
  supplierName: "", batchNumber: "",
  strawsReceived: 0,
  storageLocation: "", deliveryDate: "", unitCostPence: "" as string | number,
  notes: "",
};

export const EMPTY_HERD = { name: "", type: "", productionType: "", breed: "", herdNumber: "", registrationDocumentUrl: "", registrationDocumentName: "", notes: "", isOrganicHerd: false, organicCertBody: "", organicCertNumber: "", organicConversionStartDate: "" };
export const EMPTY_PLAN = {
  planYear: new Date().getFullYear(),
  vetName: "",
  practiceName: "",
  practicePhone: "",
  practiceAddress: "",
  planDate: new Date().toISOString().slice(0, 10),
  reviewDate: "",
  healthPriorities: "",
  vaccinationProtocol: "",
  biosecurityMeasures: "",
  wormingProtocol: "",
  flukeTreatment: "",
  mastitisPrevention: "",
  notes: "",
};

export const EMPTY_ANIMAL = {
  herdId: "",
  earTagNumber: "",
  eidNumber: "",
  tagNumber: "",
  species: "",
  breed: "",
  sex: "",
  dateOfBirth: "",
  acquisitionDate: "",
  acquisitionSource: "",
  status: "active",
  notes: "",
};

export function PrintHerdRegisterDialog({ farmId, herds, onClose }: { farmId: number; herds: Herd[]; onClose: () => void }) {
  const { data: farmData } = useQuery<{ record: Farm }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
  });
  const farm = farmData?.record;
  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handleHerdPrint = () => {
    const rows = herds.length === 0
      ? `<tr><td colspan="6" style="text-align:center;color:#9ca3af;font-style:italic;padding:12px">No herds recorded</td></tr>`
      : herds.map(h => `<tr>
          <td><strong>${escapeHtml(h.name)}</strong></td>
          <td>${escapeHtml(h.type ? herdSpeciesDisplayLabel(h.type) + (herdProductionSubtype(h.type, (h as any).productionType) ? ` (${herdProductionSubtype(h.type, (h as any).productionType)})` : "") : "—")}</td>
          <td>${escapeHtml(h.breed || "—")}</td>
          <td style="font-family:monospace">${escapeHtml(h.herdNumber || "—")}</td>
          <td>${h.isActive ? "Active" : "Inactive"}</td>
          <td style="color:#6b7280">${escapeHtml(h.notes || "—")}</td>
        </tr>`).join("");
    const tableHtml = `<table><thead><tr>
      <th>Name</th><th>Species</th><th>Breed</th><th>Herd / Flock No.</th><th>Status</th><th>Notes</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <p style="font-size:7px;color:#6b7280;margin:6px 0 0"><strong>${herds.length}</strong> herd${herds.length !== 1 ? "s" : ""} / flock${herds.length !== 1 ? "s" : ""} registered  ·  <strong>${herds.filter(h => h.isActive).length}</strong> active</p>`;
    printProReport({
      title: "Herd & Flock Register",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      redTractorId: farm?.redTractorId ?? undefined,
      recordCount: herds.length,
      recordLabel: "herd / flock",
      tableHtml,
      landscape: false,
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <style>{`
          @media print {
            body > * { display: none !important; }
            [role="dialog"] { position: fixed; inset: 0; overflow: visible !important; }
            [role="dialog"] > * { display: none !important; }
            [role="dialog"] #livestock-herd-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-green-600" />
            Herd &amp; Flock Register
          </DialogTitle>
          <DialogDescription>
            Review the register below, then click Print to produce a compliance document for Red Tractor audit.
          </DialogDescription>
        </DialogHeader>

        <div id="livestock-herd-print-area" className="border border-border rounded-lg p-6 space-y-5 text-sm mt-2">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <p className="text-base font-bold text-foreground">{farm?.name ?? "Farm"}</p>
              {farm?.address && <p className="text-xs text-foreground/60">{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
              {farm?.cphNumber && <p className="text-xs text-foreground/60 mt-0.5">CPH: <span className="font-mono font-semibold">{farm.cphNumber}</span></p>}
              {farm?.redTractorId && <p className="text-xs text-foreground/60 mt-0.5">Red Tractor ID: <span className="font-mono font-semibold">{farm.redTractorId}</span></p>}
            </div>
            <div className="text-right text-xs text-foreground/50">
              <p className="font-semibold text-foreground text-sm">Herd &amp; Flock Register</p>
              <p>Printed: {printedDate}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-green-50 text-foreground/70">
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Name</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Species</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Breed</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Herd / Flock No.</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Status</th>
                  <th className="border border-border/60 px-3 py-2 text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {herds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-border/60 px-3 py-4 text-center text-foreground/40 italic">No herds recorded</td>
                  </tr>
                ) : herds.map((h, i) => (
                  <tr key={h.id} className={i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}>
                    <td className="border border-border/60 px-3 py-2 font-medium">{h.name}</td>
                    <td className="border border-border/60 px-3 py-2">
                      {h.type ? herdSpeciesDisplayLabel(h.type) : "—"}
                      {h.type && herdProductionSubtype(h.type, (h as any).productionType) ? <span className="ml-1 text-xs text-muted-foreground">({herdProductionSubtype(h.type, (h as any).productionType)})</span> : null}
                    </td>
                    <td className="border border-border/60 px-3 py-2">{h.breed || "—"}</td>
                    <td className="border border-border/60 px-3 py-2 font-mono">{h.herdNumber || "—"}</td>
                    <td className="border border-border/60 px-3 py-2">{h.isActive ? "Active" : "Inactive"}</td>
                    <td className="border border-border/60 px-3 py-2 text-foreground/60">{h.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-6 pt-2 text-xs text-foreground/60 border-t">
            <span><strong className="text-foreground">{herds.length}</strong> herd{herds.length !== 1 ? "s" : ""} / flock{herds.length !== 1 ? "s" : ""} registered</span>
            <span><strong className="text-foreground">{herds.filter(h => h.isActive).length}</strong> active</span>
          </div>

          <div className="text-xs text-foreground/40 border-t pt-3 flex items-center justify-between">
            <span className="italic">
              This is an on-farm record for Red Tractor compliance purposes.
              Retain for a minimum of 3 years and make available for inspection at audit.
            </span>
            <span className="font-medium not-italic text-foreground/50 ml-4 whitespace-nowrap">BDE Farm Trac · {printedDate}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleHerdPrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print Register
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PrintVetPlanDialog({ farmId, plan, onClose }: { farmId: number; plan: VetHealthPlan; onClose: () => void }) {
  const { data: farmData } = useQuery<{ record: Farm }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
  });
  const farm = farmData?.record;
  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const sections: { label: string; value: string | null | undefined }[] = [
    { label: "Key Health Priorities", value: plan.healthPriorities },
    { label: "Vaccination Protocol", value: plan.vaccinationProtocol },
    { label: "Biosecurity Measures", value: plan.biosecurityMeasures },
    { label: "Worming / Parasite Protocol", value: plan.wormingProtocol },
    { label: "Fluke Treatment", value: plan.flukeTreatment },
    { label: "Mastitis Prevention (Dairy)", value: plan.mastitisPrevention },
    { label: "Additional Notes", value: plan.notes },
  ].filter(s => s.value);

  const handleVetPrint = () => {
    const e = escapeHtml;
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Vet Health Plan ${e(plan.planYear)}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.hdr h1{font-size:13px;font-weight:700;margin:0 0 4px}.hdr p{font-size:10px;color:#374151;margin:4px 0}.hdr-r{text-align:right;font-size:10px;color:#374151;line-height:1.8}.hdr-r b{display:block;font-size:12px;font-weight:600;color:#000}.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 32px;padding:10px 0;border-bottom:1px solid #e5e7eb;margin-bottom:12px}.meta-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555}.section{border:1px solid #e5e7eb;border-radius:4px;padding:10px;margin-bottom:8px}.section-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555;margin:0 0 4px}.section-body{white-space:pre-line;line-height:1.5}.sig{border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.sigline{border-bottom:1px solid #999;height:32px;margin:24px 0 4px}.note{font-size:9px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h1>${e(farm?.name ?? "Farm")}</h1>${farm?.address ? `<p>${e(farm.address)}${farm.postcode ? ", " + e(farm.postcode) : ""}</p>` : ""}${farm?.cphNumber ? `<p>CPH: <span style="font-family:monospace;font-weight:600">${e(farm.cphNumber)}</span></p>` : ""}${farm?.redTractorId ? `<p>Red Tractor ID: <span style="font-family:monospace;font-weight:600">${e(farm.redTractorId)}</span></p>` : ""}</div><div class="hdr-r"><b>Vet Health Plan ${e(plan.planYear)}</b>Plan date: <b>${e(formatDateLong(plan.planDate))}</b>${plan.reviewDate ? `<br>Review due: ${e(formatDateLong(plan.reviewDate))}` : ""}<br>Printed: ${e(printedDate)}</div></div>
<div class="meta"><div><div class="meta-label">Attending Vet</div><div style="font-weight:600">${e(plan.vetName)}</div></div>${plan.practiceName ? `<div><div class="meta-label">Practice</div><div style="font-weight:600">${e(plan.practiceName)}</div></div>` : ""}${plan.practicePhone ? `<div><div class="meta-label">Phone</div><div>${e(plan.practicePhone)}</div></div>` : ""}${plan.practiceAddress ? `<div><div class="meta-label">Address</div><div>${e(plan.practiceAddress)}</div></div>` : ""}</div>
${sections.length === 0 ? `<p style="color:#555;font-style:italic;text-align:center;padding:12px">No plan content recorded.</p>` : sections.map(s => `<div class="section"><p class="section-label">${e(s.label)}</p><p class="section-body">${e(s.value ?? "")}</p></div>`).join("")}
<div class="sig"><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Farmer Signature</p><div class="sigline"></div><p style="font-size:9px;color:#555">Name &amp; Date</p></div><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Vet Signature</p><div class="sigline"></div><p style="font-size:9px;color:#555">Name &amp; Date</p></div></div>
<div class="note">This veterinary health plan is an on-farm record required by Red Tractor Livestock Standards. Retain for a minimum of 3 years and make available for inspection at audit.</div>
</body></html>`;
    openPrintWindow(html);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <style>{`
          @media print {
            body > * { display: none !important; }
            [role="dialog"] { position: fixed; inset: 0; overflow: visible !important; }
            [role="dialog"] > * { display: none !important; }
            [role="dialog"] #vet-plan-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-green-600" />
            Vet Health Plan — {plan.planYear}
          </DialogTitle>
          <DialogDescription>
            Review the plan below, then click Print to produce a signed compliance document for Red Tractor audit.
          </DialogDescription>
        </DialogHeader>

        <div id="vet-plan-print-area" className="border border-border rounded-lg p-6 space-y-5 text-sm mt-2">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <p className="text-base font-bold text-foreground">{farm?.name ?? "Farm"}</p>
              {farm?.address && <p className="text-xs text-foreground/60">{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
              {farm?.cphNumber && <p className="text-xs text-foreground/60 mt-0.5">CPH: <span className="font-mono font-semibold">{farm.cphNumber}</span></p>}
              {farm?.redTractorId && <p className="text-xs text-foreground/60 mt-0.5">Red Tractor ID: <span className="font-mono font-semibold">{farm.redTractorId}</span></p>}
            </div>
            <div className="text-right text-xs text-foreground/50">
              <p className="font-semibold text-foreground text-sm">Vet Health Plan {plan.planYear}</p>
              <p>Plan date: <strong className="text-foreground">{formatDateLong(plan.planDate)}</strong></p>
              {plan.reviewDate && <p>Review due: {formatDateLong(plan.reviewDate)}</p>}
              <p className="mt-1">Printed: {printedDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs pb-3 border-b">
            <div>
              <span className="font-bold text-foreground/50 uppercase tracking-wider">Attending Vet</span>
              <p className="font-semibold text-foreground mt-0.5">{plan.vetName}</p>
            </div>
            {plan.practiceName && (
              <div>
                <span className="font-bold text-foreground/50 uppercase tracking-wider">Practice</span>
                <p className="font-semibold text-foreground mt-0.5">{plan.practiceName}</p>
              </div>
            )}
            {plan.practicePhone && (
              <div>
                <span className="font-bold text-foreground/50 uppercase tracking-wider">Phone</span>
                <p className="text-foreground mt-0.5">{plan.practicePhone}</p>
              </div>
            )}
            {plan.practiceAddress && (
              <div>
                <span className="font-bold text-foreground/50 uppercase tracking-wider">Address</span>
                <p className="text-foreground mt-0.5">{plan.practiceAddress}</p>
              </div>
            )}
          </div>

          {sections.length === 0 ? (
            <p className="text-foreground/40 italic text-xs text-center py-4">No plan content recorded.</p>
          ) : (
            <div className="space-y-4">
              {sections.map(s => (
                <div key={s.label} className="border border-border/40 rounded-md p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5">{s.label}</p>
                  <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-6">Farmer Signature</p>
                <div className="border-b border-foreground/30 mb-1" />
                <p className="text-xs text-foreground/40">Name &amp; Date</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-6">Vet Signature</p>
                <div className="border-b border-foreground/30 mb-1" />
                <p className="text-xs text-foreground/40">Name &amp; Date</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-foreground/40 border-t pt-3 flex items-center justify-between">
            <span className="italic">
              This veterinary health plan is an on-farm record required by Red Tractor Livestock Standards.
              Retain for a minimum of 3 years and make available for inspection at audit.
            </span>
            <span className="font-medium not-italic text-foreground/50 ml-4 whitespace-nowrap">BDE Farm Trac · {printedDate}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleVetPrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Species-aware configuration for the herd registration number field
export function getHerdNumberConfig(species: string): { label: string; placeholder: string; hint: string } {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return {
    label: "BCMS Herd Number",
    placeholder: "e.g. 12/345/0001",
    hint: "Issued by BCMS (British Cattle Movement Service). Found on your annual BCMS letter, cattle passports, or CPH registration documents from the Rural Payments Agency.",
  };
  if (s === "sheep" || s === "goats" || s === "goat") return {
    label: "Flock Number",
    placeholder: "e.g. 12/345/0001",
    hint: "Your CPH-based flock number assigned by APHA. Found on EID ear tag documentation, your APHA holding registration letter, or Rural Payments Agency CPH paperwork.",
  };
  if (s === "pigs" || s === "pig") return {
    label: "Herd Mark",
    placeholder: "e.g. AB1234",
    hint: "Your unique herd mark issued by AHDB Pork on pig registration. Found on movement licences (eAML2 / paper AML2) or your AHDB pig registration letter.",
  };
  if (s === "deer") return {
    label: "Herd Number",
    placeholder: "e.g. 12/345/0001",
    hint: "Deer herd number from your APHA / Rural Payments Agency CPH registration. Found on your holding registration or movement documents.",
  };
  if (s === "poultry" || s === "chickens" || s === "turkeys") return {
    label: "Flock Registration No.",
    placeholder: "e.g. GB-12345",
    hint: "Required for flocks of 50+ birds notifiable to APHA. Found on your APHA poultry registration letter.",
  };
  return {
    label: "Herd / Flock Number",
    placeholder: "Enter official registration number",
    hint: "Enter the official herd or flock number issued by the relevant authority (APHA, BCMS, AHDB, or Rural Payments Agency).",
  };
}

export function getBreedPlaceholder(species: string): string {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return "e.g. Holstein Friesian, Hereford × Angus, Limousin";
  if (s === "sheep") return "e.g. Suffolk, Texel, Mule, Welsh Mountain";
  if (s === "pigs" || s === "pig") return "e.g. Large White, Landrace, Duroc";
  if (s === "goats" || s === "goat") return "e.g. Saanen, British Alpine, Boer";
  if (s === "deer") return "e.g. Red Deer, Fallow Deer, Sika";
  if (s === "poultry") return "e.g. Ross 308, Cobb 500, Lohmann Brown";
  return "e.g. breed name";
}

export function getHerdNamePlaceholder(species: string): string {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return "e.g. Main Dairy Herd, Suckler Herd";
  if (s === "sheep") return "e.g. Main Ewe Flock, Lowland Flock";
  if (s === "pigs" || s === "pig") return "e.g. Breeding Herd, Finishing Unit";
  if (s === "goats" || s === "goat") return "e.g. Milking Goat Herd";
  if (s === "deer") return "e.g. Red Deer Park";
  if (s === "poultry") return "e.g. Layer Flock, Broiler Unit";
  return "e.g. Main Herd / Flock";
}

export const ANIMAL_SPECIES_FALLBACK = ["Cattle", "Sheep", "Pigs", "Goats", "Deer", "Horses", "Poultry", "Other"];
export const ANIMAL_STATUS_LABELS: Record<string, string> = {
  active: "On Farm", sold: "Sold / Moved Off", dead: "Deceased", removed: "Removed",
};

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  arrival: "Arrival / Purchase", departure: "Departure / Sale", "inter-farm": "Inter-Farm Move",
  "within-farm": "Within-Farm Move", "to-slaughter": "Off to Slaughter", "to-show": "To Show / Market",
  temporary: "Temporary Move", other: "Other",
};

export const OUTCOME_COLOURS: Record<string, string> = {
  clear: "bg-green-50 text-green-700", restricted: "bg-red-50 text-red-700",
  breakdown: "bg-red-100 text-red-800", inconclusive: "bg-amber-50 text-amber-700",
};

export interface AnimalDoc {
  id: number;
  animalId: number;
  title: string;
  documentType: string;
  documentUrl: string;
  documentName: string | null;
  notes: string | null;
  uploadedAt: string;
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  passport: "Cattle Passport",
  tb_test: "TB Test Certificate",
  movement_licence: "Movement Licence",
  vet_certificate: "Veterinary Certificate",
  johnes_test: "Johne's Disease Test",
  breed_certificate: "Breed / Pedigree Certificate",
  health_certificate: "Health Certificate",
  export_certificate: "Export Certificate",
  other: "Other Document",
};

export interface VaccHistoryRecord {
  id: number;
  source: "sheep_vacc_programme" | "goat_vacc_programme" | "pig_vacc_record" | "poultry_vacc_record" | "medicine_record";
  speciesLabel: string;
  date: string | null;
  vaccineProduct: string;
  vaccinationCategory: string | null;
  batchNumber: string | null;
  numberTreated: number | null;
  administeredBy: string | null;
  withdrawalPeriodDays: number | null;
  nextDueDate: string | null;
  vetPrescribed: boolean;
  ageGroupTreated: string | null;
  administrationRoute: string | null;
  notes: string | null;
}

export interface AnimalProfile {
  animal: Animal;
  herd: { id: number; name: string; type: string; herdNumber: string | null } | null;
  medicines: Array<{ id: number; medicineName: string; administeredDate: string; dosage: string | null; administrationRoute: string | null; administeredBy: string | null; vetName: string | null; withdrawalEndDate: string | null; withdrawalPeriodDays: number | null; reason: string | null; notes: string | null; batchNumber: string | null; medicineRef: string | null; treatmentScope: string | null; _source: "individual" | "herd_treatment" }>;
  movements: Array<{ id: number; movementType: string; movementDate: string; fromLocation: string | null; toLocation: string | null; licenceNumber: string | null; bcmsSubmissionRef: string | null; reason: string | null; notes: string | null }>;
  calvings: Array<{ id: number; calvingDate: string; calvingEaseScore: number | null; numberOfCalves: number; calfOutcome: string | null; calfSex: string | null; calfEarTag: string | null; sireBreed: string | null; cowComplications: string | null; assistanceRequired: boolean; vetAttended: boolean; bcmsPassportApplied: boolean; notes: string | null }>;
  mastitis: Array<{ id: number; onsetDate: string; quartersAffected: string | null; clinicalGrade: string | null; treatmentProduct: string | null; outcome: string | null; vetConsulted: boolean; notes: string | null }>;
  mortality: {
    dateOfDeath: string; causeOfDeath: string; disposalMethod: string;
    disposalOperator: string | null; disposalRef: string | null;
    veterinaryAttended: boolean; vetName: string | null;
    postMortemCarriedOut: boolean; postMortemFindings: string | null;
    bcmsNotified: boolean; bcmsNotificationRef: string | null;
    notes: string | null;
    contractorId: number | null;
    contractorName: string | null;
    contractorApprovalNumber: string | null;
    contractorOperatorType: string | null;
  } | null;
  diseaseIncidents: Array<{
    id: number; incidentDate: string; incidentType: string; symptomsObserved: string;
    suspectedDiagnosis: string | null; confirmedDiagnosis: string | null;
    vetCalled: boolean; vetName: string | null; vetVisitDate: string | null;
    treatmentGiven: string | null; prescriptionRef: string | null;
    status: string; mortalityCount: number | null;
    _involvedAs: "affected" | "mortality";
  }>;
  stats: { medicineCount: number; movementCount: number; calvingCount: number; mastitisCount: number; diseaseIncidentCount: number };
}

// ─── Animal Quick View Dialog ──────────────────────────────────────────────────
