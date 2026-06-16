import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./livestock/MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
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
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

function formatDateLong(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return val; }
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Farm {
  id: number;
  name: string;
  address: string | null;
  postcode: string | null;
  cphNumber: string | null;
  redTractorId: string | null;
}

interface Herd {
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
const PRODUCTION_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
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

interface VetHealthPlan {
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

interface VetHealthPlanActionCompletion {
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

interface VetHealthPlanAction {
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

interface MortalityRecord {
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

interface FallenStockContractor {
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

interface FeedRecord {
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

interface WaterRecord {
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

interface Animal {
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

interface Sire {
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

const EMPTY_SIRE = {
  name: "", species: "Cattle", breed: "", tagNumber: "", passportNumber: "",
  dateOfBirth: "", ownershipType: "owned",
  supplierName: "", supplierContact: "", hireStartDate: "", hireEndDate: "", returnDate: "",
  bvdStatus: "", fertilityTestDate: "", fertilityTestResult: "", scrapieGenotype: "", notes: "",
};

interface StrawInventory {
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

const EMPTY_STRAW = {
  sireRegisterId: "" as string | number,
  sireName: "", sireBreed: "", sireSpecies: "Cattle",
  supplierName: "", batchNumber: "",
  strawsReceived: 0,
  storageLocation: "", deliveryDate: "", unitCostPence: "" as string | number,
  notes: "",
};

const EMPTY_HERD = { name: "", type: "", productionType: "", breed: "", herdNumber: "", registrationDocumentUrl: "", registrationDocumentName: "", notes: "", isOrganicHerd: false, organicCertBody: "", organicCertNumber: "", organicConversionStartDate: "" };
const EMPTY_PLAN = {
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

const EMPTY_ANIMAL = {
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

function PrintHerdRegisterDialog({ farmId, herds, onClose }: { farmId: number; herds: Herd[]; onClose: () => void }) {
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
          <td><strong>${h.name}</strong></td>
          <td>${h.type ? herdSpeciesDisplayLabel(h.type) + (herdProductionSubtype(h.type, (h as any).productionType) ? ` (${herdProductionSubtype(h.type, (h as any).productionType)})` : "") : "—"}</td>
          <td>${h.breed || "—"}</td>
          <td style="font-family:monospace">${h.herdNumber || "—"}</td>
          <td>${h.isActive ? "Active" : "Inactive"}</td>
          <td style="color:#6b7280">${h.notes || "—"}</td>
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

function PrintVetPlanDialog({ farmId, plan, onClose }: { farmId: number; plan: VetHealthPlan; onClose: () => void }) {
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
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Vet Health Plan ${plan.planYear}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.hdr h1{font-size:13px;font-weight:700;margin:0 0 4px}.hdr p{font-size:10px;color:#374151;margin:4px 0}.hdr-r{text-align:right;font-size:10px;color:#374151;line-height:1.8}.hdr-r b{display:block;font-size:12px;font-weight:600;color:#000}.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 32px;padding:10px 0;border-bottom:1px solid #e5e7eb;margin-bottom:12px}.meta-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555}.section{border:1px solid #e5e7eb;border-radius:4px;padding:10px;margin-bottom:8px}.section-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555;margin:0 0 4px}.section-body{white-space:pre-line;line-height:1.5}.sig{border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.sigline{border-bottom:1px solid #999;height:32px;margin:24px 0 4px}.note{font-size:9px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h1>${farm?.name ?? "Farm"}</h1>${farm?.address ? `<p>${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm?.cphNumber ? `<p>CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}${farm?.redTractorId ? `<p>Red Tractor ID: <span style="font-family:monospace;font-weight:600">${farm.redTractorId}</span></p>` : ""}</div><div class="hdr-r"><b>Vet Health Plan ${plan.planYear}</b>Plan date: <b>${formatDateLong(plan.planDate)}</b>${plan.reviewDate ? `<br>Review due: ${formatDateLong(plan.reviewDate)}` : ""}<br>Printed: ${printedDate}</div></div>
<div class="meta"><div><div class="meta-label">Attending Vet</div><div style="font-weight:600">${plan.vetName}</div></div>${plan.practiceName ? `<div><div class="meta-label">Practice</div><div style="font-weight:600">${plan.practiceName}</div></div>` : ""}${plan.practicePhone ? `<div><div class="meta-label">Phone</div><div>${plan.practicePhone}</div></div>` : ""}${plan.practiceAddress ? `<div><div class="meta-label">Address</div><div>${plan.practiceAddress}</div></div>` : ""}</div>
${sections.length === 0 ? `<p style="color:#555;font-style:italic;text-align:center;padding:12px">No plan content recorded.</p>` : sections.map(s => `<div class="section"><p class="section-label">${s.label}</p><p class="section-body">${s.value ?? ""}</p></div>`).join("")}
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
function getHerdNumberConfig(species: string): { label: string; placeholder: string; hint: string } {
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

function getBreedPlaceholder(species: string): string {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return "e.g. Holstein Friesian, Hereford × Angus, Limousin";
  if (s === "sheep") return "e.g. Suffolk, Texel, Mule, Welsh Mountain";
  if (s === "pigs" || s === "pig") return "e.g. Large White, Landrace, Duroc";
  if (s === "goats" || s === "goat") return "e.g. Saanen, British Alpine, Boer";
  if (s === "deer") return "e.g. Red Deer, Fallow Deer, Sika";
  if (s === "poultry") return "e.g. Ross 308, Cobb 500, Lohmann Brown";
  return "e.g. breed name";
}

function getHerdNamePlaceholder(species: string): string {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return "e.g. Main Dairy Herd, Suckler Herd";
  if (s === "sheep") return "e.g. Main Ewe Flock, Lowland Flock";
  if (s === "pigs" || s === "pig") return "e.g. Breeding Herd, Finishing Unit";
  if (s === "goats" || s === "goat") return "e.g. Milking Goat Herd";
  if (s === "deer") return "e.g. Red Deer Park";
  if (s === "poultry") return "e.g. Layer Flock, Broiler Unit";
  return "e.g. Main Herd / Flock";
}

export function HerdsSection({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const livestockSpecies = useLookupStrings("livestock_species", ANIMAL_SPECIES_FALLBACK);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHerd, setEditingHerd] = useState<Herd | null>(null);
  const [viewHerd, setViewHerd] = useState<Herd | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_HERD>(EMPTY_HERD);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  const baseUrl = `/api/farms/${farmId}/herds`;

  const { data, isLoading } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: Herd[] }>;
    },
  });

  const { data: countsData } = useQuery({
    queryKey: ["animal-counts-by-herd", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/animal-counts-by-herd`);
      if (!res.ok) return { counts: [] };
      return res.json() as Promise<{ counts: { herdId: number | null; total: number; male: number; female: number }[] }>;
    },
  });

  const countByHerd: Record<number, { total: number; male: number; female: number }> = {};
  for (const c of countsData?.counts ?? []) {
    if (c.herdId != null) countByHerd[c.herdId] = { total: c.total, male: c.male, female: c.female };
  }

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setShowForm(false); setFormData(EMPTY_HERD); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setEditingHerd(null); setShowForm(false); setFormData(EMPTY_HERD); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setDeleteId(null); },
  });

  const records: Herd[] = data?.records ?? [];
  const filtered = records.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(h: Herd) {
    setEditingHerd(h);
    setFormData({
      name: h.name ?? "", type: h.type ?? "", productionType: h.productionType ?? "", breed: h.breed ?? "", herdNumber: h.herdNumber ?? "",
      registrationDocumentUrl: h.registrationDocumentUrl ?? "", registrationDocumentName: h.registrationDocumentName ?? "",
      notes: h.notes ?? "",
      isOrganicHerd: (h as any).isOrganicHerd ?? false,
      organicCertBody: (h as any).organicCertBody ?? "",
      organicCertNumber: (h as any).organicCertNumber ?? "",
      organicConversionStartDate: (h as any).organicConversionStartDate ? new Date((h as any).organicConversionStartDate).toISOString().slice(0, 10) : "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...formData };
    if (editingHerd) { updateMutation.mutate({ id: editingHerd.id, body }); }
    else { createMutation.mutate(body); }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const herdNumConfig = getHerdNumberConfig(formData.type);

  const { uploadFile: uploadDoc, isUploading: isUploadingDoc } = useUpload({
    onSuccess: (response) => {
      const fileName = (response as { objectPath?: string; filename?: string }).filename
        ?? (response as { objectPath?: string }).objectPath?.split("/").pop()
        ?? "Registration document";
      setFormData(f => ({
        ...f,
        registrationDocumentUrl: (response as { objectPath?: string }).objectPath ?? "",
        registrationDocumentName: fileName,
      }));
    },
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search herds..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => setPrintOpen(true)} disabled={records.length === 0} className="gap-2">
            <Printer className="w-4 h-4" /> Print Register
          </Button>
          <Button onClick={() => { setEditingHerd(null); setFormData(EMPTY_HERD); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Herd / Flock
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-5">
            <h3 className="font-semibold text-base mb-4">{editingHerd ? "Edit Herd / Flock" : "New Herd / Flock"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Species <span className="text-red-500">*</span></label>
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value, productionType: "" }))} required>
                    <option value="">Select species...</option>
                    {livestockSpecies.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                {PRODUCTION_TYPE_OPTIONS[canonicalHerdSpecies(formData.type)] && (
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Production Type</label>
                    <select
                      className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      value={(formData as any).productionType ?? ""}
                      onChange={e => setFormData(f => ({ ...f, productionType: e.target.value }))}
                    >
                      <option value="">Not specified</option>
                      {PRODUCTION_TYPE_OPTIONS[canonicalHerdSpecies(formData.type)].map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Specifies what this herd is farmed for — used to filter herds correctly in Welfare Outcome Assessments and reports.</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Name <span className="text-red-500">*</span></label>
                  <Input
                    placeholder={formData.type ? getHerdNamePlaceholder(formData.type) : "e.g. Main Dairy Herd"}
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Breed</label>
                  <Input
                    placeholder={formData.type ? getBreedPlaceholder(formData.type) : "e.g. Holstein Friesian"}
                    value={formData.breed}
                    onChange={e => setFormData(f => ({ ...f, breed: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">{herdNumConfig.label}</label>
                  <Input
                    placeholder={herdNumConfig.placeholder}
                    value={formData.herdNumber}
                    onChange={e => setFormData(f => ({ ...f, herdNumber: e.target.value }))}
                  />
                  {formData.type && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                      <FileText className="w-3 h-3 mt-0.5 shrink-0 text-blue-500" />
                      {herdNumConfig.hint}
                    </p>
                  )}
                  {!formData.type && (
                    <p className="text-xs text-muted-foreground mt-1">Select a species above to see which official number applies.</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Official Registration Document</label>
                  {formData.registrationDocumentUrl ? (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-4 h-4 text-green-700 shrink-0" />
                      <span className="text-sm text-green-800 font-medium flex-1 truncate">{formData.registrationDocumentName || "Document attached"}</span>
                      <a href={formData.registrationDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">View</a>
                      <button type="button" onClick={() => setFormData(f => ({ ...f, registrationDocumentUrl: "", registrationDocumentName: "" }))} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                      {isUploadingDoc ? (
                        <><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Uploading…</span></>
                      ) : (
                        <><Upload className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Upload registration letter, BCMS letter, or herd/flock number document</span></>
                      )}
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadDoc(e.target.files[0]); }} />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Attach a photo or scan of the official letter or certificate for easy access during inspections.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                  <Input placeholder="Any additional notes" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
                </div>

                {/* ─── Organic Certification ───────────────────────────────── */}
                <div className="md:col-span-2 pt-1">
                  <div className={`rounded-xl border-2 p-4 transition-colors ${(formData as any).isOrganicHerd ? "border-green-400 bg-green-50" : "border-dashed border-border"}`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData as any).isOrganicHerd ?? false}
                        onChange={e => setFormData(f => ({ ...f, isOrganicHerd: e.target.checked }))}
                        className="w-5 h-5 rounded accent-green-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Organic Certified / In Conversion Herd</p>
                        <p className="text-xs text-muted-foreground">Enables organic compliance tracking, doubled withdrawal periods, and certifier notifications across all modules.</p>
                      </div>
                    </label>
                    {(formData as any).isOrganicHerd && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground/70 mb-1 block">Certifying Body</label>
                          <select
                            className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            value={(formData as any).organicCertBody ?? ""}
                            onChange={e => setFormData(f => ({ ...f, organicCertBody: e.target.value }))}
                          >
                            <option value="">Select certifier...</option>
                            <option value="Soil Association">Soil Association</option>
                            <option value="OF&G">OF&G (Organic Farmers &amp; Growers)</option>
                            <option value="Organic Food Federation">Organic Food Federation (OFF)</option>
                            <option value="Biodynamic Association">Biodynamic Association</option>
                            <option value="SOPA">SOPA (Scottish Organic Producers Association)</option>
                            <option value="QWFC">Quality Welsh Food Certification (QWFC)</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground/70 mb-1 block">Certification / Licence Number</label>
                          <Input placeholder="e.g. SA-CERT-12345" value={(formData as any).organicCertNumber ?? ""} onChange={e => setFormData(f => ({ ...f, organicCertNumber: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground/70 mb-1 block">Conversion Start Date</label>
                          <Input type="date" value={(formData as any).organicConversionStartDate ?? ""} onChange={e => setFormData(f => ({ ...f, organicConversionStartDate: e.target.value }))} />
                          <p className="text-xs text-muted-foreground mt-1">The date this herd/flock entered organic conversion. Used to enforce the 12-month minimum conversion period.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingHerd(null); setFormData(EMPTY_HERD); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingHerd ? "Update" : "Save Herd"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No herds registered</h3>
              <p className="text-foreground/50 text-sm">{search ? "No records match your search." : "Register your first herd or flock to get started."}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Name</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Species</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Breed</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Head Count</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Herd No.</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Doc</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => {
                  const cnt = countByHerd[h.id];
                  return (
                  <tr key={h.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{h.name}</td>
                    <td className="p-4 text-sm text-foreground/70">
                      {h.type ? (
                        <span className="inline-flex flex-col gap-0">
                          <span>{herdSpeciesDisplayLabel(h.type)}</span>
                          {herdProductionSubtype(h.type, h.productionType) && (
                            <span className="text-xs text-muted-foreground/60 leading-tight">{herdProductionSubtype(h.type, h.productionType)}</span>
                          )}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-4 text-sm text-foreground/70">{h.breed || "—"}</td>
                    <td className="p-4 text-sm text-foreground/70">
                      {cnt ? (
                        <span>
                          <span className="font-semibold text-foreground">{cnt.total}</span>
                          {(cnt.male > 0 || cnt.female > 0) && (
                            <span className="ml-1 text-xs text-muted-foreground">♂{cnt.male} / ♀{cnt.female}</span>
                          )}
                        </span>
                      ) : <span className="text-muted-foreground/40 text-xs">—</span>}
                    </td>
                    <td className="p-4 text-sm font-mono text-foreground/70">{h.herdNumber || "—"}</td>
                    <td className="p-4 text-sm">
                      {h.registrationDocumentUrl
                        ? <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5"><FileText className="w-3 h-3" />Doc</span>
                        : <span className="text-muted-foreground/40 text-xs">—</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewHerd(h)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(h)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(h.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ); })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {viewHerd && (
        <Dialog open onOpenChange={() => setViewHerd(null)}>
          <DialogContent style={{ maxWidth: 440 }}>
            <DialogHeader><DialogTitle>Herd Record</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Name</p><p className="font-medium">{viewHerd.name}</p></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Species</p>
                  <p>{viewHerd.type ? herdSpeciesDisplayLabel(viewHerd.type) : "—"}{viewHerd.type && herdProductionSubtype(viewHerd.type, viewHerd.productionType) ? <span className="ml-1 text-xs text-gray-400">({herdProductionSubtype(viewHerd.type, viewHerd.productionType)})</span> : null}</p>
                </div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Breed</p><p>{viewHerd.breed || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Herd Number</p><p className="font-mono text-xs">{viewHerd.herdNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><p>{viewHerd.isActive ? "Active" : "Inactive"}</p></div>
              </div>
              {viewHerd.registrationDocumentUrl && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Registration Document</p>
                  <a href={viewHerd.registrationDocumentUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <FileText className="w-4 h-4" />{viewHerd.registrationDocumentName || "View document"}
                  </a>
                </div>
              )}
              {viewHerd.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewHerd.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewHerd); setViewHerd(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewHerd(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Herd Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printOpen && (
        <PrintHerdRegisterDialog
          farmId={farmId}
          herds={records}
          onClose={() => setPrintOpen(false)}
        />
      )}
    </>
  );
}

const ACTION_CATEGORIES: Record<string, string> = {
  vaccination: "Vaccination", disease_monitoring: "Disease Monitoring",
  medicine_review: "Medicine / Antibiotics", biosecurity: "Biosecurity",
  nutrition: "Nutrition", welfare: "Animal Welfare", worming: "Worming / Parasites",
  fluke: "Fluke Treatment", breeding: "Breeding", records: "Record Keeping",
  staff_training: "Staff Training", other: "Other",
};
const ACTION_FREQUENCIES: Record<string, string> = {
  one_off: "One-off", annual: "Annual", six_monthly: "Six-monthly",
  quarterly: "Quarterly", monthly: "Monthly", weekly: "Weekly", as_required: "As required",
};
const CATEGORY_COLOURS: Record<string, string> = {
  vaccination: "bg-blue-100 text-blue-800 border-blue-200",
  disease_monitoring: "bg-purple-100 text-purple-800 border-purple-200",
  medicine_review: "bg-orange-100 text-orange-800 border-orange-200",
  biosecurity: "bg-amber-100 text-amber-800 border-amber-200",
  nutrition: "bg-lime-100 text-lime-800 border-lime-200",
  welfare: "bg-pink-100 text-pink-800 border-pink-200",
  worming: "bg-teal-100 text-teal-800 border-teal-200",
  fluke: "bg-cyan-100 text-cyan-800 border-cyan-200",
  breeding: "bg-rose-100 text-rose-800 border-rose-200",
  records: "bg-slate-100 text-slate-800 border-slate-200",
  staff_training: "bg-indigo-100 text-indigo-800 border-indigo-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};
const EMPTY_ACTION = { description: "", category: "other", categoryOther: "", frequency: "annual", nextDueDate: "", assignedTo: "", notes: "" };

function calcNextDueFromFrequency(freq: string, fromDate?: Date): string {
  const base = fromDate ?? new Date();
  const d = new Date(base);
  if (freq === "annual") d.setFullYear(d.getFullYear() + 1);
  else if (freq === "six_monthly") d.setMonth(d.getMonth() + 6);
  else if (freq === "quarterly") d.setMonth(d.getMonth() + 3);
  else if (freq === "monthly") d.setMonth(d.getMonth() + 1);
  else if (freq === "weekly") d.setDate(d.getDate() + 7);
  else return "";
  return d.toISOString().slice(0, 10);
}

function actionIsOverdue(action: VetHealthPlanAction): boolean {
  if (!action.nextDueDate) return false;
  return new Date(action.nextDueDate) < new Date();
}

function actionStatus(action: VetHealthPlanAction): "overdue" | "due-soon" | "upcoming" | "no-date" {
  if (!action.nextDueDate) return "no-date";
  const due = new Date(action.nextDueDate);
  const now = new Date();
  if (due < now) return "overdue";
  const soon = new Date(); soon.setDate(soon.getDate() + 30);
  if (due <= soon) return "due-soon";
  return "upcoming";
}

function CompletionHistoryDialog({ farmId, action, onClose }: { farmId: number; action: VetHealthPlanAction; onClose: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["vhp-completions", farmId, action.id],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/vet-health-plan-actions/${action.id}/completions`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ completions: VetHealthPlanActionCompletion[] }>;
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vet-health-plan-action-completions/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-completions", farmId, action.id] }); qc.invalidateQueries({ queryKey: ["vhp-actions"] }); },
  });
  const completions = data?.completions ?? [];
  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Completion History</DialogTitle>
          <DialogDescription className="text-sm">{action.description}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        ) : completions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No completions recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {completions.map(c => (
              <div key={c.id} className="border border-border rounded-lg p-3 relative">
                <button onClick={() => deleteMut.mutate(c.id)} className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 text-muted-foreground/40 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-sm">{new Date(c.completedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  {c.completedBy && <span className="text-xs text-muted-foreground">by {c.completedBy}</span>}
                </div>
                {c.notes && <p className="text-sm text-muted-foreground ml-6 whitespace-pre-line">{c.notes}</p>}
                {c.attachmentUrl && (
                  <a href={c.attachmentUrl} target="_blank" rel="noopener noreferrer" className="ml-6 mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Paperclip className="w-3 h-3" />{c.attachmentName || "View evidence"}
                  </a>
                )}
                {(c.verifiedBy || c.verifiedDate) && (
                  <p className="ml-6 mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Verified by {c.verifiedBy ?? "—"}{c.verifiedDate ? ` on ${new Date(c.verifiedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MarkCompleteDialog({ farmId, action, onClose }: { farmId: number; action: VetHealthPlanAction; onClose: () => void }) {
  const qc = useQueryClient();
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().slice(0, 10));
  const [completedBy, setCompletedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [verifiedDate, setVerifiedDate] = useState("");
  const [updateNextDue, setUpdateNextDue] = useState(action.frequency !== "one_off" && action.frequency !== "as_required");
  const [nextDueDateVal, setNextDueDateVal] = useState(() => calcNextDueFromFrequency(action.frequency));

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (r: unknown) => {
      const resp = r as { objectPath?: string; filename?: string };
      setAttachmentUrl(resp.objectPath ?? "");
      setAttachmentName(resp.filename ?? resp.objectPath?.split("/").pop() ?? "Evidence file");
    },
  });

  const aStatus = actionStatus(action);
  const isOverdue = aStatus === "overdue";
  const isDueSoon = aStatus === "due-soon";
  const freqLabel = ACTION_FREQUENCIES[action.frequency] ?? action.frequency;
  const nextDueFormatted = action.nextDueDate
    ? new Date(action.nextDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const completeMut = useMutation({
    mutationFn: async () => {
      const body = {
        completedDate, completedBy: completedBy || null, notes: notes || null,
        attachmentUrl: attachmentUrl || null, attachmentName: attachmentName || null,
        verifiedBy: verifiedBy || null, verifiedDate: verifiedDate || null,
      };
      const res = await fetch(`/api/farms/${farmId}/vet-health-plan-actions/${action.id}/completions`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      if (updateNextDue && nextDueDateVal) {
        await fetch(`/api/farms/${farmId}/vet-health-plan-actions/${action.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nextDueDate: nextDueDateVal }),
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vhp-actions"] });
      qc.invalidateQueries({ queryKey: ["vhp-completions", farmId, action.id] });
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Record Completion
          </DialogTitle>
          <DialogDescription className="text-sm">{action.description}</DialogDescription>
        </DialogHeader>

        {/* Context: overdue / due-soon / frequency */}
        {(isOverdue || isDueSoon || nextDueFormatted) && (
          <div className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 border
            ${isOverdue ? "bg-red-50 text-red-800 border-red-200" : isDueSoon ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-200"}`}>
            {isOverdue && <span className="font-semibold">Overdue</span>}
            {isDueSoon && <span className="font-semibold">Due soon</span>}
            {nextDueFormatted && <span>— was due {nextDueFormatted}</span>}
            <span className="ml-auto text-xs opacity-70">{freqLabel}</span>
          </div>
        )}

        <div className="space-y-5 mt-1">
          {/* Section 1: What was done */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What Was Done</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Completed</Label><Input type="date" value={completedDate} onChange={e => setCompletedDate(e.target.value)} className="mt-1" /></div>
              <div><Label>Carried Out By</Label><Input value={completedBy} onChange={e => setCompletedBy(e.target.value)} placeholder="Name of person" className="mt-1" /></div>
            </div>
            <div>
              <Label>Notes &amp; Observations</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What was done, results, observations, any concerns…" rows={3} className="mt-1" />
            </div>
          </div>

          {/* Section 2: Evidence */}
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
            {attachmentUrl ? (
              <div className="flex items-center gap-2 p-2 border border-emerald-200 bg-emerald-50 rounded-md">
                <Paperclip className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-emerald-800 truncate flex-1">{attachmentName}</span>
                <button className="text-muted-foreground hover:text-red-500" onClick={() => { setAttachmentUrl(""); setAttachmentName(""); }}>
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/30">
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading…" : "Upload photo, invoice or certificate"}
                <input type="file" accept="image/*,.pdf" className="sr-only" disabled={isUploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
              </label>
            )}
          </div>

          {/* Section 3: Manager Sign-off */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Manager Sign-off <span className="normal-case font-normal">(optional)</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Verified By</Label><Input value={verifiedBy} onChange={e => setVerifiedBy(e.target.value)} placeholder="Manager name" className="mt-1" /></div>
              <div><Label>Verification Date</Label><Input type="date" value={verifiedDate} onChange={e => setVerifiedDate(e.target.value)} className="mt-1" /></div>
            </div>
          </div>

          {/* Section 4: Schedule next occurrence */}
          {action.frequency !== "one_off" && action.frequency !== "as_required" && (
            <div className="border border-border/60 rounded-lg p-3 bg-muted/20 space-y-2 border-t pt-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="updateDue" checked={updateNextDue} onChange={e => setUpdateNextDue(e.target.checked)} className="rounded" />
                <label htmlFor="updateDue" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-primary" />
                  Schedule next occurrence
                </label>
                <span className="ml-auto text-xs text-muted-foreground">{freqLabel}</span>
              </div>
              {updateNextDue && (
                <div>
                  <Label className="text-xs">Next Due Date</Label>
                  <Input type="date" value={nextDueDateVal} onChange={e => setNextDueDateVal(e.target.value)} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Auto-calculated from today ({freqLabel.toLowerCase()}) — adjust if needed.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => completeMut.mutate()} disabled={completeMut.isPending || isUploading} className="bg-emerald-600 hover:bg-emerald-700">
            {completeMut.isPending ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : <><ClipboardCheck className="h-4 w-4 mr-1" /> Record Completion</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionPointsDialog({ farmId, plan, onClose }: { farmId: number; plan: VetHealthPlan; onClose: () => void }) {
  const qc = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAction, setEditingAction] = useState<VetHealthPlanAction | null>(null);
  const [actionForm, setActionForm] = useState(EMPTY_ACTION);
  const [markingAction, setMarkingAction] = useState<VetHealthPlanAction | null>(null);
  const [historyAction, setHistoryAction] = useState<VetHealthPlanAction | null>(null);
  const [deletingActionId, setDeletingActionId] = useState<number | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<any>(null);

  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter(m => m.isActive);
  const staffNames = activeMembers.map(m => memberFullName(m));

  const actionsUrl = `/api/farms/${farmId}/vet-health-plans/${plan.id}/actions`;

  const { data: actionsData, isLoading } = useQuery({
    queryKey: ["vhp-actions", farmId, plan.id],
    queryFn: async () => {
      const res = await fetch(actionsUrl);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ actions: VetHealthPlanAction[] }>;
    },
  });
  const actions = actionsData?.actions ?? [];
  const overdueCount = actions.filter(actionIsOverdue).length;

  const createActionMut = useMutation({
    mutationFn: (body: typeof EMPTY_ACTION) => fetch(actionsUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nextDueDate: body.nextDueDate || null }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] }); setShowAddForm(false); setActionForm(EMPTY_ACTION); },
  });

  const updateActionMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_ACTION }) => fetch(`/api/farms/${farmId}/vet-health-plan-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nextDueDate: body.nextDueDate || null }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] }); setEditingAction(null); setShowAddForm(false); setActionForm(EMPTY_ACTION); },
  });

  const deleteActionMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vet-health-plan-actions/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] }); setDeletingActionId(null); },
  });

  function openAddForm() { setEditingAction(null); setActionForm(EMPTY_ACTION); setShowAddForm(true); }

  function openEditAction(a: VetHealthPlanAction) {
    setEditingAction(a);
    const isKnownCategory = a.category in ACTION_CATEGORIES;
    setActionForm({
      description: a.description,
      category: isKnownCategory ? a.category : "other",
      categoryOther: isKnownCategory ? "" : a.category,
      frequency: a.frequency,
      nextDueDate: a.nextDueDate?.slice(0, 10) ?? "",
      assignedTo: a.assignedTo ?? "",
      notes: a.notes ?? "",
    });
    setShowAddForm(true);
  }

  function handleActionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalCategory = actionForm.category === "other" && actionForm.categoryOther.trim()
      ? actionForm.categoryOther.trim()
      : actionForm.category;
    const body = { ...actionForm, category: finalCategory };
    if (editingAction) updateActionMut.mutate({ id: editingAction.id, body });
    else createActionMut.mutate(body);
  }

  function setActionField(k: keyof typeof EMPTY_ACTION, v: string) { setActionForm(f => ({ ...f, [k]: v })); }

  function handlePrintEvidence() {
    fetch(`/api/farms/${farmId}/vet-health-plans/${plan.id}/evidence-report`)
      .then(r => r.json())
      .then(({ plan: p, actions: acts }) => {
        const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        const statusLabel = (a: VetHealthPlanAction) => {
          const s = actionStatus(a);
          if (s === "overdue") return `<span style="color:#dc2626;font-weight:bold">OVERDUE</span>`;
          if (s === "due-soon") return `<span style="color:#d97706;font-weight:bold">Due Soon</span>`;
          if (s === "upcoming") return `<span style="color:#2563eb">Upcoming</span>`;
          return `<span style="color:#6b7280">No target date</span>`;
        };
        const compLines = (comps: VetHealthPlanActionCompletion[]) => comps.slice(0, 5).map(c =>
          `<div style="border-left:2px solid #10b981;padding-left:6px;margin-bottom:4px;font-size:10px">
            <b>${new Date(c.completedDate).toLocaleDateString("en-GB")}</b>${c.completedBy ? ` — ${c.completedBy}` : ""}
            ${c.notes ? `<div style="color:#555">${c.notes}</div>` : ""}
            ${c.attachmentUrl ? `<a href="${c.attachmentUrl}" style="color:#2563eb">${c.attachmentName || "Evidence file"}</a>` : ""}
          </div>`
        ).join("");
        const rows = (acts as (VetHealthPlanAction & { completions: VetHealthPlanActionCompletion[] })[]).map(a => `
          <tr>
            <td style="vertical-align:top"><span style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:9px">${ACTION_CATEGORIES[a.category] ?? a.category}</span></td>
            <td style="vertical-align:top"><b>${a.description}</b>${a.notes ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">${a.notes}</div>` : ""}</td>
            <td style="vertical-align:top">${ACTION_FREQUENCIES[a.frequency] ?? a.frequency}</td>
            <td style="vertical-align:top">${a.nextDueDate ? new Date(a.nextDueDate).toLocaleDateString("en-GB") : "—"}</td>
            <td style="vertical-align:top">${statusLabel(a)}</td>
            <td style="vertical-align:top">${a.assignedTo || "—"}</td>
            <td style="vertical-align:top">${a.completionCount ?? 0} entries${a.completions?.length > 0 ? `<div style="margin-top:4px">${compLines(a.completions)}</div>` : ""}</td>
          </tr>`).join("");
        const totalCount = (acts as VetHealthPlanAction[]).length;
        const overdueN = (acts as VetHealthPlanAction[]).filter(actionIsOverdue).length;
        const completedRecently = (acts as (VetHealthPlanAction & { completions: VetHealthPlanActionCompletion[] })[]).filter(a => a.completions?.length > 0).length;
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Health Plan Evidence — ${p.planYear}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}h1{font-size:16px;margin:0 0 2px}h2{font-size:13px;margin:12px 0 4px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#f3f4f6;border:1px solid #d1d5db;padding:6px;text-align:left;font-size:9px;font-weight:bold;text-transform:uppercase;color:#6b7280}
td{border:1px solid #e5e7eb;padding:7px 6px;font-size:11px}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.summary-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}.summary-num{font-size:22px;font-weight:bold}.summary-label{font-size:9px;color:#6b7280;text-transform:uppercase}
.note{margin-top:20px;padding:8px;background:#fef3c7;border:1px solid #fcd34d;font-size:9px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:12px">
  <div><h1>Health Plan Evidence Report — ${p.planYear}</h1><div style="font-size:10px;color:#555">Vet: <b>${p.vetName}</b>${p.practiceName ? ` — ${p.practiceName}` : ""}${p.practicePhone ? ` · ${p.practicePhone}` : ""}</div>
  <div style="font-size:10px;color:#555">Plan date: ${p.planDate ? new Date(p.planDate).toLocaleDateString("en-GB") : "—"} · Review due: ${p.reviewDate ? new Date(p.reviewDate).toLocaleDateString("en-GB") : "—"}</div></div>
  <div style="text-align:right;font-size:10px;color:#555">Printed: ${today}</div>
</div>
<div class="summary">
  <div class="summary-box"><div class="summary-num">${totalCount}</div><div class="summary-label">Total Actions</div></div>
  <div class="summary-box" style="border-color:${overdueN > 0 ? "#fca5a5" : "#e5e7eb"}"><div class="summary-num" style="color:${overdueN > 0 ? "#dc2626" : "#000"}">${overdueN}</div><div class="summary-label">Overdue</div></div>
  <div class="summary-box" style="border-color:#a7f3d0"><div class="summary-num" style="color:#059669">${completedRecently}</div><div class="summary-label">With Evidence</div></div>
</div>
<h2>Action Points &amp; Completion Evidence</h2>
<table><thead><tr><th>Category</th><th>Action</th><th>Frequency</th><th>Next Due</th><th>Status</th><th>Responsible</th><th>Evidence Log</th></tr></thead><tbody>${rows}</tbody></table>
<div class="note">This evidence report documents actions taken against the ${p.planYear} Veterinary Health Plan. It is a Red Tractor compliance record — retain for a minimum of 3 years and make available at audit.</div>
</body></html>`;
        openPrintWindow(html);
      });
  }

  const isSaving = createActionMut.isPending || updateActionMut.isPending;

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            Action Points — {plan.planYear} Health Plan
          </DialogTitle>
          <DialogDescription>
            {plan.vetName}{plan.practiceName ? ` — ${plan.practiceName}` : ""}
            {overdueCount > 0 && <span className="ml-2 text-red-600 font-medium">· {overdueCount} overdue</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button size="sm" onClick={openAddForm} className="gap-1.5"><Plus className="w-4 h-4" /> Add Action Point</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50" onClick={handlePrintEvidence}>
            <Printer className="w-4 h-4" /> Print Evidence Report
          </Button>
        </div>

        {(showAddForm) && (
          <Card className="border-primary/20">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-sm mb-3">{editingAction ? "Edit Action Point" : "New Action Point"}</h4>
              <form onSubmit={handleActionSubmit} className="space-y-3">
                <div>
                  <Label>Action Description <span className="text-red-500">*</span></Label>
                  <Input value={actionForm.description} onChange={e => setActionField("description", e.target.value)} placeholder="e.g. Vaccinate all heifers against BVD before first service" required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <Label>Category</Label>
                    <Select value={actionForm.category} onValueChange={v => { setActionField("category", v); if (v !== "other") setActionField("categoryOther", ""); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ACTION_CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {actionForm.category === "other" && (
                      <Input className="mt-1" value={actionForm.categoryOther} onChange={e => setActionField("categoryOther", e.target.value)} placeholder="Specify category…" />
                    )}
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={actionForm.frequency} onValueChange={v => {
                      setActionField("frequency", v);
                      if (!actionForm.nextDueDate) setActionField("nextDueDate", calcNextDueFromFrequency(v));
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ACTION_FREQUENCIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Next Due Date</Label>
                    <Input type="date" value={actionForm.nextDueDate} onChange={e => setActionField("nextDueDate", e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <Label>Responsible Person</Label>
                    <Select
                      value={staffNames.includes(actionForm.assignedTo) ? actionForm.assignedTo : (actionForm.assignedTo ? "__other__" : "__none__")}
                      onValueChange={v => {
                        if (v === "__none__") setActionField("assignedTo", "");
                        else if (v === "__other__") setActionField("assignedTo", "");
                        else setActionField("assignedTo", v);
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Not assigned —</SelectItem>
                        {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        <SelectItem value="__other__">Other / type manually…</SelectItem>
                      </SelectContent>
                    </Select>
                    {(!staffNames.includes(actionForm.assignedTo) && actionForm.assignedTo !== "") && (
                      <Input className="mt-1" value={actionForm.assignedTo} onChange={e => setActionField("assignedTo", e.target.value)} placeholder="Enter name manually" />
                    )}
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input value={actionForm.notes} onChange={e => setActionField("notes", e.target.value)} placeholder="Additional details…" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="submit" size="sm" disabled={isSaving}>{isSaving ? <><Loader2 className="animate-spin w-3.5 h-3.5 mr-1" />Saving…</> : editingAction ? "Update" : "Add Action"}</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => { setShowAddForm(false); setEditingAction(null); setActionForm(EMPTY_ACTION); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        ) : actions.length === 0 && !showAddForm ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl">
            <ListChecks className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No action points yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add the requirements from this plan so you can track and evidence completion.</p>
            <Button size="sm" className="mt-3" onClick={openAddForm}><Plus className="w-3.5 h-3.5 mr-1" /> Add First Action</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map(a => {
              const status = actionStatus(a);
              return (
                <div key={a.id} className={`border rounded-lg p-3 ${status === "overdue" ? "border-red-200 bg-red-50/40" : "border-border bg-card"}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLOURS[a.category] ?? CATEGORY_COLOURS.other}`}>
                          {ACTION_CATEGORIES[a.category] ?? a.category}
                        </span>
                        {status === "overdue" && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                        {status === "due-soon" && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Due Soon
                          </span>
                        )}
                        {a.completionCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> {a.completionCount} {a.completionCount === 1 ? "entry" : "entries"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{a.description}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{ACTION_FREQUENCIES[a.frequency] ?? a.frequency}</span>
                        {a.nextDueDate && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> Due {new Date(a.nextDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                        {a.assignedTo && <span>👤 {a.assignedTo}</span>}
                        {a.latestCompletion && (
                          <span className="text-emerald-600">Last done {new Date(a.latestCompletion.completedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{a.latestCompletion.completedBy ? ` by ${a.latestCompletion.completedBy}` : ""}</span>
                        )}
                      </div>
                      {a.notes && <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="default" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setMarkingAction(a)}>
                        <ClipboardCheck className="w-3 h-3" /> Done
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setHistoryAction(a)}>
                        <BookOpen className="w-3 h-3" /> {a.completionCount > 0 ? `History (${a.completionCount})` : "History"}
                      </Button>
                      <button onClick={() => openEditAction(a)} className="p-1.5 rounded hover:bg-black/5 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeletingActionId(a.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      {(status === "overdue" || status === "due-soon") && <button onClick={() => setRaiseTaskFor(a)} className="p-1.5 rounded hover:bg-purple-50 text-muted-foreground hover:text-purple-600" title="Raise Task"><ClipboardList className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>

      {markingAction && (
        <MarkCompleteDialog farmId={farmId} action={markingAction} onClose={() => setMarkingAction(null)} />
      )}
      {historyAction && (
        <CompletionHistoryDialog farmId={farmId} action={historyAction} onClose={() => setHistoryAction(null)} />
      )}
      {deletingActionId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeletingActionId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Action Point?</DialogTitle><DialogDescription>This action point and its completion history will be removed. This cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingActionId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteActionMut.mutate(deletingActionId!)} disabled={deleteActionMut.isPending}>
                {deleteActionMut.isPending ? <><Loader2 className="animate-spin h-4 w-4 mr-1" />Deleting…</> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`VHP Action Overdue — ${String(raiseTaskFor.description ?? "Action Point").slice(0, 60)}`}
          defaultDescription={`Category: ${raiseTaskFor.category ?? "—"} · Due: ${raiseTaskFor.nextDueDate ? new Date(String(raiseTaskFor.nextDueDate)).toLocaleDateString("en-GB") : "—"} · Assigned: ${raiseTaskFor.assignedTo ?? "—"}`}
          module="livestock"
        />
      )}
    </Dialog>
  );
}

export function VetHealthPlansSection({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VetHealthPlan | null>(null);
  const [viewPlan, setViewPlan] = useState<VetHealthPlan | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_PLAN>(EMPTY_PLAN);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [printPlan, setPrintPlan] = useState<VetHealthPlan | null>(null);
  const [actionsPlan, setActionsPlan] = useState<VetHealthPlan | null>(null);

  const baseUrl = `/api/farms/${farmId}/vet-health-plans`;

  const { data, isLoading } = useQuery({
    queryKey: ["vet-health-plans", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: VetHealthPlan[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setShowForm(false); setFormData(EMPTY_PLAN); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setEditingPlan(null); setShowForm(false); setFormData(EMPTY_PLAN); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setDeleteId(null); },
  });

  const records: VetHealthPlan[] = data?.records ?? [];

  function openEdit(p: VetHealthPlan) {
    setEditingPlan(p);
    setFormData({
      planYear: p.planYear,
      vetName: p.vetName ?? "",
      practiceName: p.practiceName ?? "",
      practicePhone: p.practicePhone ?? "",
      practiceAddress: p.practiceAddress ?? "",
      planDate: p.planDate ? p.planDate.slice(0, 10) : "",
      reviewDate: p.reviewDate ? p.reviewDate.slice(0, 10) : "",
      healthPriorities: p.healthPriorities ?? "",
      vaccinationProtocol: p.vaccinationProtocol ?? "",
      biosecurityMeasures: p.biosecurityMeasures ?? "",
      wormingProtocol: p.wormingProtocol ?? "",
      flukeTreatment: p.flukeTreatment ?? "",
      mastitisPrevention: p.mastitisPrevention ?? "",
      notes: p.notes ?? "",
    });
    setShowForm(true);
  }

  function setField(key: keyof typeof EMPTY_PLAN, val: string | number) {
    setFormData(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...formData,
      planYear: Number(formData.planYear),
      planDate: formData.planDate ? new Date(formData.planDate).toISOString() : null,
      reviewDate: formData.reviewDate ? new Date(formData.reviewDate).toISOString() : null,
    };
    if (editingPlan) { updateMutation.mutate({ id: editingPlan.id, body }); }
    else { createMutation.mutate(body); }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-foreground/60">Annual veterinary health plans signed by your vet — required for Red Tractor livestock standards.</p>
        </div>
        <Button onClick={() => { setEditingPlan(null); setFormData(EMPTY_PLAN); setShowForm(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Health Plan
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-5">
            <h3 className="font-semibold text-base mb-4">{editingPlan ? "Edit Vet Health Plan" : "New Vet Health Plan"}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Plan Year <span className="text-red-500">*</span></label>
                  <Input type="number" min="2000" max="2099" value={formData.planYear} onChange={e => setField("planYear", e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Plan Date <span className="text-red-500">*</span></label>
                  <Input type="date" value={formData.planDate} onChange={e => setField("planDate", e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Review Date</label>
                  <Input type="date" value={formData.reviewDate} onChange={e => setField("reviewDate", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">Veterinary Practice</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Vet Name <span className="text-red-500">*</span></label>
                    <Input placeholder="e.g. Mr J. Smith BVSc" value={formData.vetName} onChange={e => setField("vetName", e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Practice Name</label>
                    <Input placeholder="e.g. Green Pastures Vets" value={formData.practiceName} onChange={e => setField("practiceName", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Practice Phone</label>
                    <Input placeholder="e.g. 01234 567890" value={formData.practicePhone} onChange={e => setField("practicePhone", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Practice Address</label>
                    <Input placeholder="Address" value={formData.practiceAddress} onChange={e => setField("practiceAddress", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">Health Plan Content</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Key Health Priorities</label>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                      placeholder="Key health issues identified for this farm (e.g. BVD control, lameness reduction, pneumonia prevention...)"
                      value={formData.healthPriorities}
                      onChange={e => setField("healthPriorities", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Vaccination Protocol</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Vaccines used, schedule, products..." value={formData.vaccinationProtocol} onChange={e => setField("vaccinationProtocol", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Biosecurity Measures</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Quarantine, testing, visitor controls..." value={formData.biosecurityMeasures} onChange={e => setField("biosecurityMeasures", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Worming / Parasite Protocol</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Products, timing, rotation strategy..." value={formData.wormingProtocol} onChange={e => setField("wormingProtocol", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Fluke Treatment</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Flukicide products and timing..." value={formData.flukeTreatment} onChange={e => setField("flukeTreatment", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Mastitis Prevention (dairy)</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Dry cow therapy, teat dipping, cell count targets..." value={formData.mastitisPrevention} onChange={e => setField("mastitisPrevention", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Additional Notes</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Any other notes..." value={formData.notes} onChange={e => setField("notes", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingPlan(null); setFormData(EMPTY_PLAN); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingPlan ? "Update Plan" : "Save Health Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
        ) : records.length === 0 ? (
          <Card>
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No vet health plans recorded</h3>
              <p className="text-foreground/50 text-sm">Add your annual veterinary health plan. Red Tractor requires a current signed plan from your vet.</p>
            </div>
          </Card>
        ) : records.map(p => (
          <Card key={p.id} className="overflow-hidden">
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary/70" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold">{p.planYear} Health Plan</span>
                    {p.isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70">
                    <span className="font-medium">{p.vetName}</span>
                    {p.practiceName && <span className="text-foreground/50"> — {p.practiceName}</span>}
                  </p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    Plan date: {formatDate(p.planDate)}
                    {p.reviewDate && <> · Review due: {formatDate(p.reviewDate)}</>}
                    {p.practicePhone && <> · {p.practicePhone}</>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5" onClick={() => setActionsPlan(p)} title="Manage action points">
                  <ListChecks className="w-3.5 h-3.5" /> Action Points
                </Button>
                <button onClick={() => setViewPlan(p)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                <button
                  onClick={() => setPrintPlan(p)}
                  className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-green-600"
                  title="Print this plan"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {(p.healthPriorities || p.vaccinationProtocol || p.wormingProtocol || p.flukeTreatment) && (
              <div className="border-t border-border/50 px-5 py-3 bg-muted/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.healthPriorities && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Health Priorities</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.healthPriorities}</p>
                  </div>
                )}
                {p.vaccinationProtocol && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Vaccination</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.vaccinationProtocol}</p>
                  </div>
                )}
                {p.wormingProtocol && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Worming</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.wormingProtocol}</p>
                  </div>
                )}
                {p.flukeTreatment && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Fluke</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.flukeTreatment}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {viewPlan && (
        <Dialog open onOpenChange={() => setViewPlan(null)}>
          <DialogContent style={{ maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <DialogHeader><DialogTitle>Vet Health Plan {viewPlan.planYear}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Year</p><p>{viewPlan.planYear}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vet Name</p><p>{viewPlan.vetName}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Practice</p><p>{viewPlan.practiceName || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Practice Phone</p><p>{viewPlan.practicePhone || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Plan Date</p><p>{formatDate(viewPlan.planDate)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Review Date</p><p>{formatDate(viewPlan.reviewDate)}</p></div>
              </div>
              {viewPlan.healthPriorities && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Health Priorities</p><p className="text-gray-700 whitespace-pre-line">{viewPlan.healthPriorities}</p></div>}
              {viewPlan.vaccinationProtocol && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vaccination Protocol</p><p className="text-gray-700 whitespace-pre-line">{viewPlan.vaccinationProtocol}</p></div>}
              {viewPlan.wormingProtocol && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Worming Protocol</p><p className="text-gray-700 whitespace-pre-line">{viewPlan.wormingProtocol}</p></div>}
              {viewPlan.flukeTreatment && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Fluke Treatment</p><p className="text-gray-700 whitespace-pre-line">{viewPlan.flukeTreatment}</p></div>}
              {viewPlan.biosecurityMeasures && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Biosecurity</p><p className="text-gray-700 whitespace-pre-line">{viewPlan.biosecurityMeasures}</p></div>}
              {viewPlan.mastitisPrevention && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Mastitis Prevention</p><p className="text-gray-700 whitespace-pre-line">{viewPlan.mastitisPrevention}</p></div>}
              {viewPlan.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewPlan.notes}</p></div>}
            </div>
            <RecordAttachments farmId={farmId} recordType="vet_plan" recordId={viewPlan.id} />
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewPlan); setViewPlan(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewPlan(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Vet Health Plan</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printPlan && (
        <PrintVetPlanDialog
          farmId={farmId}
          plan={printPlan}
          onClose={() => setPrintPlan(null)}
        />
      )}
      {actionsPlan && (
        <ActionPointsDialog
          farmId={farmId}
          plan={actionsPlan}
          onClose={() => setActionsPlan(null)}
        />
      )}
    </>
  );
}

const CONTRACTOR_TYPES: Record<string, string> = {
  "nfas-collector": "NFAS Fallen Stock Collector",
  "hunt-kennel": "Hunt Kennel",
  "knacker": "Knacker / Slaughterer",
  "rendering": "Rendering Plant",
  "incinerator": "Licensed Incinerator",
  "other": "Other",
};

const FEED_TYPE_LABELS: Record<string, string> = {
  "compound-pellets": "Compound Pellets", "rolled-barley": "Rolled Barley",
  "wholecrop-silage": "Wholecrop Silage", "grass-silage": "Grass Silage",
  "maize-silage": "Maize Silage", hay: "Hay", straw: "Straw (feed)",
  "sugar-beet-pulp": "Sugar Beet Pulp", "distillers-grains": "Distillers' Grains",
  "soya-meal": "Soya Meal", "rape-meal": "Rape Meal", minerals: "Minerals / Boluses",
  "creep-feed": "Creep Feed", "milk-replacer": "Milk Replacer",
  "total-mixed-ration": "TMR", other: "Other",
};

const EMPTY_FEED = {
  feedType: "", supplier: "", batchNumber: "", quantityKg: "",
  feedDate: new Date().toISOString().slice(0, 10), notes: "",
  herdId: "", feedStockItemId: "", deliveryId: "",
};

export function FallenStockContractorsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FallenStockContractor | null>(null);
  const [form, setForm] = useState({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: contractors = [], isLoading } = useQuery<FallenStockContractor[]>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then(r => r.json()),
  });

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/fallen-stock-contractors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }); setShowForm(false); setForm({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" }); },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof form & { id: number }) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }); setEditing(null); setShowForm(false); },
  });
  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }); setDeleteId(null); },
  });

  function openEdit(c: FallenStockContractor) {
    setEditing(c);
    setForm({ name: c.name, approvalNumber: c.approvalNumber, operatorType: c.operatorType, contactName: c.contactName ?? "", phone: c.phone ?? "", email: c.email ?? "", notes: c.notes ?? "" });
    setShowForm(true);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Fallen Stock Collectors &amp; Disposal Operators</h3>
          <p className="text-sm text-gray-500 mt-0.5">APHA-approved collection and disposal operators for animal by-products only. These are not general suppliers or hauliers — add those in Trade Contacts &amp; Stock.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" }); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Collector
        </Button>
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Regulatory note:</strong> Under the Animal By-Products Regulations, fallen stock must be collected by an APHA-approved operator. Record their official approval/registration number here so it appears automatically on every mortality record — this is the evidence inspectors will check.<br /><br />
        <strong>If a collector also provides other services</strong> (e.g. stock haulage, feed delivery), add them separately as a Trade Contact in <em>Trade Contacts &amp; Stock</em> so that invoices and purchase orders for those services are kept distinct from fallen stock disposal records. Use exactly the same company name in both places to make reconciliation straightforward.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : contractors.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-gray-700 mb-1">No contractors added yet</p>
          <p className="text-sm text-muted-foreground">Add your fallen stock collectors and disposal operators so they appear on mortality records.</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contractor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">APHA Approval No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {contractors.map(c => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{CONTRACTOR_TYPES[c.operatorType] ?? c.operatorType}</td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{c.approvalNumber}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{[c.contactName, c.phone].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive.mutate({ id: c.id, isActive: !c.isActive })}
                      className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium transition-colors ${c.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {c.isActive ? <><CheckCircle2 className="h-3 w-3" /> Active</> : <><XCircle className="h-3 w-3" /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Fallen Stock Collector" : "Add Fallen Stock Collector"}</DialogTitle>
              <DialogDescription>Record the contractor's APHA approval number for audit compliance.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2">
                <Label>Contractor / Company Name *</Label>
                <Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. ABC Fallen Stock Services Ltd" required />
              </div>
              <div className="col-span-2">
                <Label>APHA Approval / Registration Number *</Label>
                <Input value={form.approvalNumber} onChange={e => setF("approvalNumber", e.target.value)} placeholder="e.g. ABP-XXXX-XXXX" required className="font-mono" />
                <p className="text-xs text-gray-400 mt-1">Required under Animal By-Products Regulations. Available on operator's APHA certificate.</p>
              </div>
              <div>
                <Label>Operator Type</Label>
                <Select value={form.operatorType} onValueChange={v => setF("operatorType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACTOR_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e => setF("contactName", e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setF("phone", e.target.value)} type="tel" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setF("email", e.target.value)} type="email" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)}
                disabled={!form.name || !form.approvalNumber || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
                {editing ? "Update" : "Add Collector"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Fallen Stock Collector?</DialogTitle><DialogDescription>This will remove them from the register. Existing mortality records won't be affected.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function FeedSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}/feed-records`;

  const { data, isLoading } = useQuery<{ records: FeedRecord[] }>({
    queryKey: ["feed-records", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const { data: herdsData } = useQuery<{ records: any[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()),
  });
  const herds: any[] = herdsData?.records ?? [];

  const { data: feedBinsData } = useQuery<{ records: any[] }>({
    queryKey: ["feed-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then(r => r.json()),
  });
  const feedBins: any[] = feedBinsData?.records ?? [];

  const { data: deliveriesData } = useQuery<{ records: any[] }>({
    queryKey: ["feed-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-deliveries`).then(r => r.json()),
  });
  const allDeliveries: any[] = deliveriesData?.records ?? [];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeedRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FEED);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const binDeliveries = form.feedStockItemId
    ? allDeliveries.filter((d: any) => String(d.feedStockItemId) === String(form.feedStockItemId))
    : allDeliveries;

  const herdMap = Object.fromEntries(herds.map((h: any) => [h.id, h.name]));
  const binMap = Object.fromEntries(feedBins.map((b: any) => [b.id, b]));

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_FEED) => {
      const payload: any = { ...body };
      if (!payload.feedStockItemId) delete payload.feedStockItemId; else payload.feedStockItemId = Number(payload.feedStockItemId);
      if (!payload.deliveryId) delete payload.deliveryId; else payload.deliveryId = Number(payload.deliveryId);
      if (!payload.herdId) delete payload.herdId; else payload.herdId = Number(payload.herdId);
      return fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); qc.invalidateQueries({ queryKey: ["feed-stock", farmId] }); setShowForm(false); setForm(EMPTY_FEED); },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_FEED & { id: number }) => {
      const payload: any = { ...body };
      if (!payload.feedStockItemId) delete payload.feedStockItemId; else payload.feedStockItemId = Number(payload.feedStockItemId);
      if (!payload.deliveryId) delete payload.deliveryId; else payload.deliveryId = Number(payload.deliveryId);
      if (!payload.herdId) delete payload.herdId; else payload.herdId = Number(payload.herdId);
      return fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); qc.invalidateQueries({ queryKey: ["feed-stock", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_FEED); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); qc.invalidateQueries({ queryKey: ["feed-stock", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: FeedRecord) {
    setEditing(r);
    setForm({
      feedType: r.feedType,
      supplier: r.supplier ?? "",
      batchNumber: r.batchNumber ?? "",
      quantityKg: r.quantityKg ?? "",
      feedDate: r.feedDate?.slice(0, 10) ?? "",
      notes: r.notes ?? "",
      herdId: r.herdId ? String(r.herdId) : "",
      feedStockItemId: r.feedStockItemId ? String(r.feedStockItemId) : "",
      deliveryId: r.deliveryId ? String(r.deliveryId) : "",
    });
    setShowForm(true);
  }

  function handleBinSelect(binId: string) {
    if (binId === "__none__") {
      setForm(f => ({ ...f, feedStockItemId: "", deliveryId: "" }));
      return;
    }
    const bin = feedBins.find((b: any) => String(b.id) === binId);
    setForm(f => ({
      ...f,
      feedStockItemId: binId,
      deliveryId: "",
      feedType: bin?.feedType ?? f.feedType,
    }));
  }

  function handleDeliverySelect(delivId: string) {
    if (delivId === "__none__") { setForm(f => ({ ...f, deliveryId: "" })); return; }
    const d = allDeliveries.find((x: any) => String(x.id) === delivId);
    setForm(f => ({
      ...f,
      deliveryId: delivId,
      supplier: d?.supplierName ?? f.supplier,
      batchNumber: d?.batchNumber ?? d?.lotNumber ?? f.batchNumber,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
  }

  const filtered = records.filter(r =>
    r.feedType.toLowerCase().includes(search.toLowerCase()) ||
    (r.supplier ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.batchNumber ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by feed type, supplier or batch…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FEED); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Feed Record
        </Button>
      </div>

      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Traceability requirement:</strong> Link each feeding event to a source bin and delivery batch. This creates a full audit chain from supplier → bin → herd. Retain invoices and delivery notes for 3 years.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matching records." : "No feed records yet. Add the first feeding event."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Herd</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Feed Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source Bin</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Batch No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qty (kg)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => {
                const bin = r.feedStockItemId ? binMap[r.feedStockItemId] : null;
                return (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{formatDate(r.feedDate)}</td>
                    <td className="px-4 py-3 text-sm">{r.herdId ? (herdMap[r.herdId] ?? `Herd ${r.herdId}`) : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 font-medium">{FEED_TYPE_LABELS[r.feedType] ?? r.feedType}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{bin ? (bin.productName || bin.feedType) + (bin.storageLocation ? ` — ${bin.storageLocation}` : "") : <span>—</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.batchNumber || "—"}</td>
                    <td className="px-4 py-3 font-medium">{r.quantityKg ? `${Number(r.quantityKg).toLocaleString()} kg` : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Feed Record" : "Record Feeding Event"}</DialogTitle>
              <DialogDescription>Link to a source bin and delivery batch to build the full traceability chain.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Traceability Links</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <Label className="text-xs">Source Bin</Label>
                    <Select value={form.feedStockItemId || "__none__"} onValueChange={handleBinSelect}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select feed bin…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {feedBins.map((b: any) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.productName || FEED_TYPE_LABELS[b.feedType] || b.feedType}{b.storageLocation ? ` — ${b.storageLocation}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Delivery Batch</Label>
                    <Select value={form.deliveryId || "__none__"} onValueChange={handleDeliverySelect}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select delivery…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {binDeliveries.map((d: any) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.deliveryDate?.slice(0, 10)} — {d.batchNumber || d.lotNumber || "no batch"} — {d.supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <Label>Herd / Group</Label>
                  <Select value={form.herdId || "__none__"} onValueChange={v => setField("herdId", v === "__none__" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select herd…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      {herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Feed Date *</Label><Input type="date" value={form.feedDate} onChange={e => setField("feedDate", e.target.value)} required /></div>
                <div>
                  <Label>Feed Type *</Label>
                  <Select value={form.feedType || undefined} onValueChange={v => setField("feedType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FEED_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg} onChange={e => setField("quantityKg", e.target.value)} placeholder="e.g. 500" min="0" step="0.1" /></div>
                <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setField("supplier", e.target.value)} placeholder="Auto-filled from delivery" /></div>
                <div><Label>Batch / Lot Number</Label><Input value={form.batchNumber} onChange={e => setField("batchNumber", e.target.value)} placeholder="Auto-filled from delivery" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Ration changes, refusals, withdrawal periods, etc." rows={2} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : editing ? "Update" : "Save Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Feed Record?</DialogTitle><DialogDescription>This will also restore the consumed quantity to the source bin. This cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

const WATER_SOURCE_LABELS: Record<string, string> = {
  mains: "Mains Supply", borehole: "Borehole / Well", stream: "Stream / River",
  reservoir: "Farm Reservoir / Pond", rainwater: "Rainwater Harvesting",
  bowser: "Water Bowser / Tanker", other: "Other",
};

const EMPTY_WATER = {
  waterSource: "", sourceDescription: "", testDate: new Date().toISOString().slice(0, 10),
  testResult: "", testPass: "true", notes: "",
};

interface WaterAttachment {
  id: number;
  title: string;
  referenceNumber: string | null;
  filePath: string | null;
  mimeType: string | null;
  notes: string | null;
  createdAt: string;
}

function WaterCertificatesDialog({
  farmId,
  record,
  onClose,
}: {
  farmId: number;
  record: WaterRecord;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [labRef, setLabRef] = useState("");
  const [certTitle, setCertTitle] = useState("");

  const qKey = ["water-attachments", record.id];
  const { data, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ attachments: WaterAttachment[] }>;
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (docId: number) => {
      await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments/${docId}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const title = certTitle.trim() || (labRef.trim() ? `Lab Certificate — ${labRef.trim()}` : "Lab Certificate");
      await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          filePath: response.objectPath,
          referenceNumber: labRef.trim() || null,
          notes: null,
        }),
      });
      qc.invalidateQueries({ queryKey: qKey });
      setLabRef("");
      setCertTitle("");
    },
  });

  const attachments = data?.attachments ?? [];
  const sourceLabel = WATER_SOURCE_LABELS[record.waterSource] ?? record.waterSource;
  const testDateStr = record.testDate ? new Date(record.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: "42rem" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-blue-600" />
            Lab Certificates
          </DialogTitle>
          <DialogDescription>
            {sourceLabel} · {testDateStr}
            {record.testResult ? ` · ${record.testResult}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* Attached certificates */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attached Certificates</p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : attachments.length === 0 ? (
              <div className="text-sm text-muted-foreground italic py-2 border border-dashed rounded-lg px-3">
                No certificates attached yet. Upload the lab report below to link it to this test record.
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-start justify-between bg-muted/40 rounded-lg px-3 py-2.5 gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <a
                          href={att.filePath ? `/api/storage${att.filePath}` : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-700 hover:underline block truncate"
                        >
                          {att.title}
                        </a>
                        {att.referenceNumber && (
                          <p className="text-xs text-muted-foreground">Ref: {att.referenceNumber}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(att.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-red-50 h-7 px-2"
                      onClick={() => deleteMut.mutate(att.id)}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload form */}
          <div className="border border-dashed rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attach Lab Certificate</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <Label className="text-xs">Lab Reference Number</Label>
                <Input
                  placeholder="e.g. WA-2026-00291"
                  value={labRef}
                  onChange={(e) => setLabRef(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Certificate Title</Label>
                <Input
                  placeholder="e.g. Annual water test — Borehole"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                  e.target.value = "";
                }}
                disabled={isUploading}
              />
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" disabled={isUploading} asChild>
                <span>
                  {isUploading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading {progress}%</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Choose File</>
                  )}
                </span>
              </Button>
              <span className="text-xs text-muted-foreground">PDF, JPG, PNG accepted</span>
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Uploaded certificates are stored securely and linked to this specific water quality test record. They will appear in audit exports.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WaterSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}/water-records`;
  const { data, isLoading } = useQuery<{ records: WaterRecord[] }>({
    queryKey: ["water-records", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WaterRecord | null>(null);
  const [form, setForm] = useState(EMPTY_WATER);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [certRecord, setCertRecord] = useState<WaterRecord | null>(null);
  const [waterLabId, setWaterLabId] = useState<number | null>(null);
  const [waterLabName, setWaterLabName] = useState<string | null>(null);

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_WATER & { labSupplierId?: number | null }) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setShowForm(false); setForm(EMPTY_WATER); setWaterLabId(null); setWaterLabName(null); },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_WATER & { id: number; labSupplierId?: number | null }) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_WATER); setWaterLabId(null); setWaterLabName(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: WaterRecord) {
    setEditing(r);
    setForm({
      waterSource: r.waterSource, sourceDescription: r.sourceDescription ?? "",
      testDate: r.testDate?.slice(0, 10) ?? "",
      testResult: r.testResult ?? "", testPass: r.testPass === false ? "false" : "true", notes: r.notes ?? "",
    });
    setWaterLabId(r.labSupplierId ?? null);
    setWaterLabName(null);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, labSupplierId: waterLabId ?? undefined };
    if (editing) updateMut.mutate({ ...payload, id: editing.id });
    else createMut.mutate(payload);
  }

  const filtered = records.filter(r =>
    (WATER_SOURCE_LABELS[r.waterSource] ?? r.waterSource).toLowerCase().includes(search.toLowerCase()) ||
    (r.testResult ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by source or result…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_WATER); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Water Record
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
        <Paperclip className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          <strong>Annual testing required</strong> for pigs and poultry, and for all species where the water source is not mains supply.
          Use the <strong>Lab Certs</strong> button on each record to attach your lab certificate — certificates are stored against the specific test and included in audit exports.
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Droplets className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matching records." : "No water quality records yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Test Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Water Source</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location / Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Result</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{formatDate(r.testDate)}</td>
                  <td className="px-4 py-3 font-medium">{WATER_SOURCE_LABELS[r.waterSource] ?? r.waterSource}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{r.sourceDescription || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.testResult || "—"}</td>
                  <td className="px-4 py-3">
                    {r.testPass === null ? <span className="text-muted-foreground text-xs">—</span>
                      : r.testPass
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /> Pass</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Fail</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{r.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                        onClick={() => setCertRecord(r)}
                        title="Attach or view lab certificates"
                      >
                        <Paperclip className="h-3 w-3" /> Lab Certs
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Water Record" : "Add Water Quality Record"}</DialogTitle>
              <DialogDescription>Log water source and annual test results for Red Tractor compliance.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><Label>Water Source *</Label>
                  <Select value={form.waterSource || undefined} onValueChange={v => setField("waterSource", v)}>
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(WATER_SOURCE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Test Date</Label><Input type="date" value={form.testDate} onChange={e => setField("testDate", e.target.value)} /></div>
              </div>
              <div>
                <Label>Source Location / Description</Label>
                <Input value={form.sourceDescription} onChange={e => setField("sourceDescription", e.target.value)}
                  placeholder={
                    form.waterSource === "borehole" ? "Name, depth (m), grid reference" :
                    form.waterSource === "stream" ? "River / stream name and location" :
                    form.waterSource === "reservoir" ? "Reservoir name and location" :
                    form.waterSource === "bowser" ? "Vehicle registration and supplier" :
                    form.waterSource === "mains" ? "Meter/supply point reference (optional)" :
                    "Specific location or description of this source"
                  }
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <Label>Testing Laboratory</Label>
                  <LabSelector farmId={farmId} value={waterLabId ?? undefined} labName={waterLabName ?? undefined}
                    onChange={(id, name) => { setWaterLabId(id ?? null); setWaterLabName(name ?? null); }} />
                </div>
                <div><Label>Test Result / Lab Reference</Label><Input value={form.testResult} onChange={e => setField("testResult", e.target.value)} placeholder="e.g. Pass — E. coli &lt;1 CFU/100ml" /></div>
                <div><Label>Overall Outcome</Label>
                  <Select value={form.testPass} onValueChange={v => setField("testPass", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Pass — Suitable for livestock</SelectItem>
                      <SelectItem value="false">Fail — Action required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Lab reference, remedial actions, retest date, etc." rows={2} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : editing ? "Update" : "Save Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Water Record?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {certRecord && (
        <WaterCertificatesDialog
          farmId={farmId}
          record={certRecord}
          onClose={() => setCertRecord(null)}
        />
      )}
    </>
  );
}

const ANIMAL_SPECIES_FALLBACK = ["Cattle", "Sheep", "Pigs", "Goats", "Deer", "Horses", "Poultry", "Other"];
const ANIMAL_STATUS_LABELS: Record<string, string> = {
  active: "On Farm", sold: "Sold / Moved Off", dead: "Deceased", removed: "Removed",
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  arrival: "Arrival / Purchase", departure: "Departure / Sale", "inter-farm": "Inter-Farm Move",
  "within-farm": "Within-Farm Move", "to-slaughter": "Off to Slaughter", "to-show": "To Show / Market",
  temporary: "Temporary Move", other: "Other",
};

const OUTCOME_COLOURS: Record<string, string> = {
  clear: "bg-green-50 text-green-700", restricted: "bg-red-50 text-red-700",
  breakdown: "bg-red-100 text-red-800", inconclusive: "bg-amber-50 text-amber-700",
};

interface AnimalDoc {
  id: number;
  animalId: number;
  title: string;
  documentType: string;
  documentUrl: string;
  documentName: string | null;
  notes: string | null;
  uploadedAt: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
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

interface AnimalProfile {
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
function AnimalQuickViewDialog({ animal, herds, farmId, onClose, onEdit, onProfile }: {
  animal: Animal; herds: Herd[]; farmId: number; onClose: () => void;
  onEdit: (a: Animal) => void; onProfile: (a: Animal) => void;
}) {
  const herdName = (herdId: number | null) => herds.find(h => h.id === herdId)?.name ?? "Unassigned";
  const earTag = (animal.earTagNumber || animal.tagNumber || "").trim().toUpperCase();
  const { data: tbData } = useQuery<{ records: { id: number; testDate: string; readingDate: string | null; testType: string; outcome: string; species: string; animalEarTags: string | null }[] }>({
    queryKey: ["tb-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then(r => r.json()),
    enabled: !!earTag,
  });
  const tbHistory = (tbData?.records ?? []).filter(t => {
    if (!earTag || !t.animalEarTags) return false;
    try {
      const tags: string[] = JSON.parse(t.animalEarTags);
      return tags.map(x => x.trim().toUpperCase()).includes(earTag);
    } catch {
      return t.animalEarTags.split("\n").map(x => x.trim().toUpperCase()).includes(earTag);
    }
  }).sort((a, b) => b.testDate.localeCompare(a.testDate));
  const statusColor = {
    active: "bg-green-50 text-green-700", sold: "bg-amber-50 text-amber-700",
    dead: "bg-red-50 text-red-700", removed: "bg-gray-50 text-gray-600",
  }[animal.status] ?? "bg-gray-50 text-gray-600";

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 500 }} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-base">{animal.earTagNumber || animal.tagNumber || `Animal #${animal.id}`}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{ANIMAL_STATUS_LABELS[animal.status] ?? animal.status}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm py-1">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">UK Ear Tag</p><p className="font-mono font-bold text-gray-900">{animal.earTagNumber || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">EID Number</p><p className="font-mono text-gray-700">{animal.eidNumber || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Species</p><p className="capitalize">{animal.species}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Breed</p><p>{animal.breed || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Sex</p><p className="capitalize">{animal.sex || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Date of Birth</p><p>{formatDate(animal.dateOfBirth)}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Herd / Flock</p><p>{herdName(animal.herdId)}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Arrived on Holding</p><p>{formatDate(animal.acquisitionDate)}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">From</p><p>{animal.acquisitionSource || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Alt. ID</p><p className="font-mono text-xs">{animal.tagNumber || "—"}</p></div>
          </div>
          {animal.notes && <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Notes</p><p className="text-gray-700 whitespace-pre-line">{animal.notes}</p></div>}
          {earTag && (
            <div className="border rounded-md overflow-hidden mt-2">
              <div className="bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">TB Test History</div>
              {tbHistory.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground italic">No SICCT tests recorded for this ear tag</p>
              ) : (
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Injection</th><th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Stage</th><th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Result</th></tr></thead>
                  <tbody className="divide-y">
                    {tbHistory.map(t => (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="px-3 py-1.5 font-medium">{formatDate(t.testDate)}</td>
                        <td className="px-3 py-1.5">
                          {t.readingDate
                            ? <span className="text-green-700 font-semibold">✓ Complete</span>
                            : <span className="text-amber-600 font-semibold">⏳ Reading pending</span>}
                        </td>
                        <td className="px-3 py-1.5">
                          {t.readingDate
                            ? <span className={`inline-flex text-xs font-semibold rounded-full px-1.5 py-0.5 ${OUTCOME_COLOURS[t.outcome] ?? "bg-gray-100 text-gray-700"}`}>{t.outcome.toUpperCase()}</span>
                            : <span className="text-amber-500 text-xs italic">Awaiting reading</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          <Button variant="outline" size="sm" onClick={() => { onEdit(animal); onClose(); }}><Pencil className="w-3.5 h-3.5 mr-1" /> Edit</Button>
          <Button size="sm" onClick={() => { onProfile(animal); onClose(); }} className="gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Full Animal Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Animal Profile Dialog ─────────────────────────────────────────────────────
function AnimalProfileDialog({ animal, farmId, onClose, onEdit }: {
  animal: Animal; farmId: number; onClose: () => void; onEdit: (a: Animal) => void;
}) {
  const [tab, setTab] = useState<"overview" | "medicines" | "movements" | "breeding" | "health" | "tb-tests" | "documents">("overview");

  const { data, isLoading } = useQuery<AnimalProfile>({
    queryKey: ["animal-profile", farmId, animal.id],
    queryFn: () => fetch(`/api/farms/${farmId}/animals/${animal.id}/profile`, { credentials: "include" }).then(r => r.json()),
  });

  const statusColor = {
    active: "bg-green-100 text-green-800", sold: "bg-amber-100 text-amber-800",
    dead: "bg-red-100 text-red-800", removed: "bg-gray-100 text-gray-700",
  }[animal.status] ?? "bg-gray-100 text-gray-700";

  const isCattle = animal.species?.toLowerCase() === "cattle";
  const isFemale = animal.sex === "female";
  const showBreeding = isCattle && isFemale;

  const { data: docsData, isLoading: docsLoading, refetch: refetchDocs } = useQuery<{ documents: AnimalDoc[] }>({
    queryKey: ["animal-documents", farmId, animal.id],
    queryFn: () => fetch(`/api/farms/${farmId}/animals/${animal.id}/documents`, { credentials: "include" }).then(r => r.json()),
  });

  const earTag = (animal.earTagNumber || animal.tagNumber || "").trim().toUpperCase();
  const { data: tbData } = useQuery<{ records: { id: number; testDate: string; readingDate: string | null; testType: string; outcome: string; species: string; herdFlockRef: string | null; testingVet: string | null; reactors: number; inconclusives: number; animalEarTags: string | null }[] }>({
    queryKey: ["tb-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then(r => r.json()),
    enabled: !!earTag,
  });
  const animalTbHistory = (tbData?.records ?? []).filter(t => {
    if (!earTag || !t.animalEarTags) return false;
    try {
      const tags: string[] = JSON.parse(t.animalEarTags);
      return tags.map(x => x.trim().toUpperCase()).includes(earTag);
    } catch {
      return t.animalEarTags.split("\n").map(x => x.trim().toUpperCase()).includes(earTag);
    }
  }).sort((a, b) => b.testDate.localeCompare(a.testDate));

  const [docType, setDocType] = useState("other");
  const [docTitle, setDocTitle] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);

  const { uploadFile: uploadDoc, isUploading: isUploadingDoc } = useUpload({
    onSuccess: async (response) => {
      const path = (response as { objectPath?: string }).objectPath ?? "";
      const name = (response as { filename?: string }).filename ?? path.split("/").pop() ?? "Document";
      const title = docTitle.trim() || DOC_TYPE_LABELS[docType] || "Document";
      await fetch(`/api/farms/${farmId}/animals/${animal.id}/documents`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, documentType: docType, documentUrl: path, documentName: name, notes: docNotes.trim() || null }),
      });
      setDocTitle(""); setDocNotes("");
      refetchDocs();
    },
  });

  async function deleteDoc(docId: number) {
    setDeletingDocId(docId);
    await fetch(`/api/farms/${farmId}/animals/${animal.id}/documents/${docId}`, { method: "DELETE", credentials: "include" });
    setDeletingDocId(null);
    refetchDocs();
  }

  const tabDef = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    { key: "medicines", label: "Medicines", icon: Stethoscope, count: data?.stats.medicineCount },
    { key: "movements", label: "Movements", icon: FileText, count: data?.stats.movementCount },
    ...(showBreeding ? [{ key: "breeding", label: "Calving", icon: CheckCircle2, count: data?.stats.calvingCount }] : []),
    { key: "health", label: "Health Incidents", icon: AlertTriangle, count: data?.stats.diseaseIncidentCount },
    ...(earTag ? [{ key: "tb-tests", label: "TB Tests", icon: Stethoscope, count: animalTbHistory.length }] : []),
    { key: "documents", label: "Documents", icon: Paperclip, count: docsData?.documents.length },
  ] as const;

  function printAnimalReport() {
    if (!data) return;
    const d = data;
    const a = animal;
    const fmtD = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    const overviewRows = [
      ["UK Ear Tag", a.earTagNumber || "—"], ["EID Transponder", a.eidNumber || "—"],
      ["Species / Breed", [a.species, a.breed].filter(Boolean).join(" · ") || "—"],
      ["Sex", a.sex || "—"], ["Date of Birth", fmtD(a.dateOfBirth)],
      ["Herd / Flock", d.herd ? `${d.herd.name}${d.herd.herdNumber ? ` (${d.herd.herdNumber})` : ""}` : "—"],
      ["Arrived on Holding", fmtD(a.acquisitionDate)], ["Acquired From", a.acquisitionSource || "—"],
      ["Current Status", ANIMAL_STATUS_LABELS[a.status] ?? a.status],
    ];
    const overviewHtml = `<div class="section-head">Animal Overview</div><table><tbody>${overviewRows.map(([k, v]) => `<tr><td style="font-weight:600;width:35%">${k}</td><td>${v}</td></tr>`).join("")}${a.notes ? `<tr><td style="font-weight:600">Notes</td><td>${a.notes}</td></tr>` : ""}</tbody></table>`;

    const medicinesHtml = d.medicines.length === 0 ? "" : `<div class="section-head">Medicine Records (${d.medicines.length})</div><table><thead><tr><th>Date</th><th>Medicine</th><th>Dosage</th><th>Route</th><th>Administered By</th><th>Vet</th><th>Withdrawal Ends</th><th>Reason</th><th>Type</th></tr></thead><tbody>${d.medicines.map(m => `<tr><td>${fmtD(m.administeredDate)}</td><td>${m.medicineName}</td><td>${m.dosage || "—"}</td><td>${m.administrationRoute || "—"}</td><td>${m.administeredBy || "—"}</td><td>${m.vetName || "—"}</td><td>${fmtD(m.withdrawalEndDate)}</td><td>${m.reason || "—"}</td><td>${m._source === "herd_treatment" ? (m.treatmentScope === "group" ? "Group" : "Herd") : "Individual"}</td></tr>`).join("")}</tbody></table>`;

    const movementsHtml = d.movements.length === 0 ? "" : `<div class="section-head">Movement History (${d.movements.length})</div><table><thead><tr><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Licence No.</th><th>BCMS Ref</th><th>Reason</th></tr></thead><tbody>${d.movements.map(m => `<tr><td>${fmtD(m.movementDate)}</td><td>${MOVEMENT_TYPE_LABELS[m.movementType] ?? m.movementType}</td><td>${m.fromLocation || "—"}</td><td>${m.toLocation || "—"}</td><td>${m.licenceNumber || "—"}</td><td>${m.bcmsSubmissionRef || "—"}</td><td>${m.reason || "—"}</td></tr>`).join("")}</tbody></table>`;

    const tbHtml = animalTbHistory.length === 0 ? "" : `<div class="section-head">TB Test History (${animalTbHistory.length})</div><table><thead><tr><th>Injection Date</th><th>Reading Date</th><th>Test Type</th><th>Herd / Flock</th><th>Testing Vet</th><th>Stage</th><th>Result</th><th>Reactors</th><th>Inconc.</th></tr></thead><tbody>${animalTbHistory.map(t => `<tr><td>${fmtD(t.testDate)}</td><td>${fmtD(t.readingDate)}</td><td>${t.testType.replace(/-/g, " ")}</td><td>${t.herdFlockRef || "—"}</td><td>${t.testingVet || "—"}</td><td>${t.readingDate ? "Complete" : "Reading pending"}</td><td>${t.readingDate ? t.outcome.toUpperCase() : "Awaiting"}</td><td>${t.reactors}</td><td>${t.inconclusives}</td></tr>`).join("")}</tbody></table>`;

    const healthHtml = !d.diseaseIncidents || d.diseaseIncidents.length === 0 ? "" : `<div class="section-head">Health & Disease Incidents (${d.diseaseIncidents.length})</div><table><thead><tr><th>Date</th><th>Type</th><th>Status</th><th>Symptoms</th><th>Diagnosis</th><th>Vet</th><th>Treatment</th></tr></thead><tbody>${d.diseaseIncidents.map(inc => `<tr><td>${fmtD(inc.incidentDate)}</td><td style="text-transform:capitalize">${inc.incidentType?.replace(/_/g, " ") || "—"}</td><td style="text-transform:capitalize">${inc.status}${inc._involvedAs === "mortality" ? " (Mortality)" : ""}</td><td>${inc.symptomsObserved || "—"}</td><td>${inc.confirmedDiagnosis || inc.suspectedDiagnosis || "—"}</td><td>${inc.vetName || (inc.vetCalled ? "Yes" : "No")}</td><td>${inc.treatmentGiven || "—"}</td></tr>`).join("")}</tbody></table>`;

    const calvingHtml = showBreeding && d.calvings.length > 0 ? `<div class="section-head">Calving Records (${d.calvings.length})</div><table><thead><tr><th>Date</th><th>Calves</th><th>Calf Sex</th><th>Calf Tag</th><th>Outcome</th><th>Ease Score</th><th>Assistance</th><th>Vet</th></tr></thead><tbody>${d.calvings.map(c => `<tr><td>${fmtD(c.calvingDate)}</td><td>${c.numberOfCalves}</td><td>${c.calfSex || "—"}</td><td>${c.calfEarTag || "—"}</td><td>${c.calfOutcome || "—"}</td><td>${c.calvingEaseScore ?? "—"}</td><td>${c.assistanceRequired ? "Yes" : "No"}</td><td>${c.vetAttended ? "Yes" : "No"}</td></tr>`).join("")}</tbody></table>` : "";

    const mortalityHtml = d.mortality ? `<div class="section-head">Mortality &amp; Disposal Record</div><table><tbody>
      <tr><td style="font-weight:600;width:35%">Date of Death</td><td>${fmtD(d.mortality.dateOfDeath)}</td></tr>
      <tr><td style="font-weight:600">Cause of Death</td><td>${d.mortality.causeOfDeath}</td></tr>
      <tr><td style="font-weight:600">Disposal Method</td><td>${d.mortality.disposalMethod}</td></tr>
      ${d.mortality.disposalOperator ? `<tr><td style="font-weight:600">Disposal Operator</td><td>${d.mortality.disposalOperator}</td></tr>` : ""}
      ${d.mortality.disposalRef ? `<tr><td style="font-weight:600">Disposal Reference</td><td>${d.mortality.disposalRef}</td></tr>` : ""}
      ${d.mortality.contractorName ? `<tr><td style="font-weight:600">Collection Contractor</td><td>${d.mortality.contractorName}</td></tr>` : ""}
      ${d.mortality.contractorApprovalNumber ? `<tr><td style="font-weight:600">APHA Approval No.</td><td>${d.mortality.contractorApprovalNumber}</td></tr>` : ""}
      ${d.mortality.contractorOperatorType ? `<tr><td style="font-weight:600">Operator Type</td><td>${d.mortality.contractorOperatorType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</td></tr>` : ""}
      <tr><td style="font-weight:600">Vet Attended</td><td>${d.mortality.veterinaryAttended ? (d.mortality.vetName ? `Yes — ${d.mortality.vetName}` : "Yes") : "No"}</td></tr>
      <tr><td style="font-weight:600">Post-Mortem</td><td>${d.mortality.postMortemCarriedOut ? (d.mortality.postMortemFindings ? `Yes — ${d.mortality.postMortemFindings}` : "Yes") : "No"}</td></tr>
      <tr><td style="font-weight:600">BCMS Notified</td><td>${d.mortality.bcmsNotified ? (d.mortality.bcmsNotificationRef ? `Yes — Ref: ${d.mortality.bcmsNotificationRef}` : "Yes") : "No"}</td></tr>
      ${d.mortality.notes ? `<tr><td style="font-weight:600">Notes</td><td>${d.mortality.notes}</td></tr>` : ""}
    </tbody></table>` : "";

    const html = buildProReport({
      title: `Animal Record — ${a.earTagNumber || a.tagNumber || `Animal #${a.id}`}`,
      subtitle: `${a.species}${a.breed ? ` · ${a.breed}` : ""}${a.sex ? ` · ${a.sex}` : ""}`,
      landscape: false,
      footerNote: "This report documents the full history of this animal on the holding. Retain for a minimum of 3 years.",
      tableHtml: overviewHtml + medicinesHtml + movementsHtml + tbHtml + healthHtml + calvingHtml + mortalityHtml,
    });
    openPrintWindow(html);
  }

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: "56rem", maxHeight: "88vh", display: "flex", flexDirection: "column", padding: 0 }} aria-describedby={undefined}>
        {/* Header */}
        <div style={{ padding: "20px 24px 0 24px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  {animal.earTagNumber || animal.tagNumber || `Animal #${animal.id}`}
                </h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{ANIMAL_STATUS_LABELS[animal.status] ?? animal.status}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
                {animal.species}{animal.breed ? ` · ${animal.breed}` : ""}{animal.sex ? ` · ${animal.sex}` : ""}
                {data?.herd ? ` · ${data.herd.name}` : ""}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { onEdit(animal); onClose(); }} className="gap-1.5 shrink-0 mr-8">
              <Pencil className="w-3.5 h-3.5" /> Edit Record
            </Button>
          </div>

          {/* Mortality alert */}
          {data?.mortality && (
            <div style={{ marginBottom: 12, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "0.8rem", color: "#991b1b" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠ Deceased — {formatDate(data.mortality.dateOfDeath)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px" }}>
                <span><strong>Cause:</strong> {data.mortality.causeOfDeath}</span>
                <span><strong>Disposal method:</strong> {data.mortality.disposalMethod}</span>
                {data.mortality.disposalOperator && <span><strong>Disposal operator:</strong> {data.mortality.disposalOperator}</span>}
                {data.mortality.disposalRef && <span><strong>Disposal ref:</strong> {data.mortality.disposalRef}</span>}
                {data.mortality.contractorName && <span><strong>Collection contractor:</strong> {data.mortality.contractorName}</span>}
                {data.mortality.contractorApprovalNumber && <span><strong>APHA approval no.:</strong> {data.mortality.contractorApprovalNumber}</span>}
                {data.mortality.veterinaryAttended && <span><strong>Vet attended:</strong> {data.mortality.vetName || "Yes"}</span>}
                {data.mortality.postMortemCarriedOut && <span><strong>Post-mortem:</strong> {data.mortality.postMortemFindings || "Carried out"}</span>}
                <span><strong>BCMS notified:</strong> {data.mortality.bcmsNotified ? (data.mortality.bcmsNotificationRef ? `Yes — ref ${data.mortality.bcmsNotificationRef}` : "Yes") : "No"}</span>
              </div>
              {data.mortality.notes && <div style={{ marginTop: 4, color: "#7f1d1d" }}><strong>Notes:</strong> {data.mortality.notes}</div>}
            </div>
          )}

          {/* Stats row */}
          {data && (
            <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              {[
                { label: "Medicine records", val: data.stats.medicineCount },
                { label: "Movements", val: data.stats.movementCount },
                { label: "Calvings", val: data.stats.calvingCount },
                { label: "Mastitis episodes", val: data.stats.mastitisCount },
                { label: "Health incidents", val: data.stats.diseaseIncidentCount, alert: data.stats.diseaseIncidentCount > 0 },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1, color: (s as { alert?: boolean }).alert ? "#b45309" : s.val > 0 ? "#166534" : "#9ca3af" }}>{s.val}</div>
                  <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "none" }}>
            {tabDef.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                style={{
                  padding: "8px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "0.83rem", fontWeight: 600,
                  color: tab === t.key ? "#166534" : "#6b7280",
                  borderBottom: tab === t.key ? "2px solid #166534" : "2px solid transparent",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <t.icon size={13} />
                {t.label}
                {(t as { count?: number }).count !== undefined && (
                  <span style={{ fontSize: "0.68rem", background: tab === t.key ? "#dcfce7" : "#f3f4f6", color: tab === t.key ? "#166534" : "#6b7280", padding: "1px 5px", borderRadius: 10, fontWeight: 700 }}>
                    {(t as { count?: number }).count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 20px" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
          ) : !data ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>Failed to load profile.</p>
          ) : tab === "overview" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
              {[
                { label: "UK Ear Tag", val: animal.earTagNumber, mono: true },
                { label: "EID Transponder", val: animal.eidNumber, mono: true },
                { label: "Alt. / Internal ID", val: animal.tagNumber, mono: true },
                { label: "Species", val: animal.species, capitalize: true },
                { label: "Breed", val: animal.breed },
                { label: "Sex", val: animal.sex, capitalize: true },
                { label: "Date of Birth", val: formatDate(animal.dateOfBirth) },
                { label: "Age", val: animal.dateOfBirth ? `${Math.floor((Date.now() - new Date(animal.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))} years` : null },
                { label: "Herd / Flock", val: data.herd ? `${data.herd.name} (${data.herd.herdNumber || "no reg. no."})` : null },
                { label: "Arrival Date (on Holding)", val: formatDate(animal.acquisitionDate) },
                { label: "Acquired From", val: animal.acquisitionSource },
                { label: "QR / Animal Code", val: animal.animalCode, mono: true },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{f.label}</p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: f.val ? "#111827" : "#d1d5db", fontFamily: f.mono ? "monospace" : undefined, textTransform: (f as { capitalize?: boolean }).capitalize ? "capitalize" : undefined }}>
                    {f.val || "—"}
                  </p>
                </div>
              ))}
              {animal.notes && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{ margin: "0 0 2px", fontSize: "0.68rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes</p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#374151", whiteSpace: "pre-line" }}>{animal.notes}</p>
                </div>
              )}
            </div>
          ) : tab === "medicines" ? (
            data.medicines.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <Stethoscope size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p>No medicine records linked to this animal.</p>
                <p style={{ fontSize: "0.78rem" }}>Records appear here when a medicine is administered to this animal individually, or when a group / whole-herd treatment is recorded for the herd this animal belongs to.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.medicines.map(m => {
                  const isHerdTreatment = m._source === "herd_treatment";
                  const withdrawalActive = m.withdrawalEndDate && new Date(m.withdrawalEndDate) > new Date();
                  return (
                    <div key={m.id} style={{ background: isHerdTreatment ? "#f0fdf4" : "#f9fafb", border: `1px solid ${isHerdTreatment ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{m.medicineName}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                            {formatDate(m.administeredDate)}{m.administeredBy ? ` · ${m.administeredBy}` : ""}{m.vetName ? ` · ${m.vetName}` : ""}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
                          {isHerdTreatment && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#166534", background: "#dcfce7", border: "1px solid #86efac", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                              {m.treatmentScope === "group" ? "GROUP TREATMENT" : "HERD TREATMENT"}
                            </span>
                          )}
                          {withdrawalActive && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#854d0e", background: "#fef9c3", border: "1px solid #fde047", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>WITHDRAWAL ACTIVE</span>
                          )}
                        </div>
                      </div>
                      {(m.dosage || m.administrationRoute || m.reason) && (
                        <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "#374151" }}>
                          {[m.dosage && `Dosage: ${m.dosage}`, m.administrationRoute && `Route: ${m.administrationRoute}`, m.reason && `Reason: ${m.reason}`].filter(Boolean).join("  ·  ")}
                        </p>
                      )}
                      {(m.batchNumber || m.medicineRef) && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#6b7280", fontFamily: "monospace" }}>
                          {m.batchNumber && `Batch: ${m.batchNumber}`}{m.batchNumber && m.medicineRef && "  ·  "}{m.medicineRef && `Ref: ${m.medicineRef}`}
                        </p>
                      )}
                      {m.withdrawalEndDate && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#854d0e" }}>Withdrawal ends: {formatDate(m.withdrawalEndDate)} ({m.withdrawalPeriodDays} days)</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : tab === "movements" ? (
            data.movements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <FileText size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p>No movement records linked to this animal.</p>
                <p style={{ fontSize: "0.78rem" }}>Records appear here when a movement is logged against this specific animal in the Movement Records module.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.movements.map(mv => (
                  <div key={mv.id} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>{MOVEMENT_TYPE_LABELS[mv.movementType] ?? mv.movementType}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>{formatDate(mv.movementDate)}</p>
                      </div>
                      {(mv.fromLocation || mv.toLocation) && (
                        <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#6b7280" }}>
                          {mv.fromLocation && <span>From: <strong>{mv.fromLocation}</strong></span>}
                          {mv.fromLocation && mv.toLocation && <span> → </span>}
                          {mv.toLocation && <span>To: <strong>{mv.toLocation}</strong></span>}
                        </p>
                      )}
                      {(mv.licenceNumber || mv.bcmsSubmissionRef) && (
                        <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#9ca3af", fontFamily: "monospace" }}>
                          {mv.licenceNumber && `Licence: ${mv.licenceNumber}`}{mv.licenceNumber && mv.bcmsSubmissionRef && "  ·  "}{mv.bcmsSubmissionRef && `BCMS ref: ${mv.bcmsSubmissionRef}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === "breeding" ? (
            data.calvings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <CheckCircle2 size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p>No calving records linked to this cow.</p>
                <p style={{ fontSize: "0.78rem" }}>Records appear here when a calving event is logged against this cow in the Dairy / Calving module.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.calvings.map((c, i) => (
                  <div key={c.id} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#14532d" }}>Calving #{data.calvings.length - i} — {formatDate(c.calvingDate)}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#166534" }}>
                          {c.numberOfCalves} {c.numberOfCalves === 1 ? "calf" : "calves"} · {c.calfSex || "sex unknown"} · Outcome: {c.calfOutcome || "not recorded"}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {c.assistanceRequired && <span style={{ fontSize: "0.65rem", fontWeight: 600, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "1px 5px", borderRadius: 4 }}>Assisted</span>}
                        {c.vetAttended && <span style={{ fontSize: "0.65rem", fontWeight: 600, background: "#ede9fe", color: "#6d28d9", border: "1px solid #c4b5fd", padding: "1px 5px", borderRadius: 4 }}>Vet</span>}
                      </div>
                    </div>
                    {(c.calfEarTag || c.sireBreed) && (
                      <p style={{ margin: "5px 0 0", fontSize: "0.78rem", color: "#374151" }}>
                        {c.calfEarTag && `Calf tag: ${c.calfEarTag}`}{c.calfEarTag && c.sireBreed && "  ·  "}{c.sireBreed && `Sire breed: ${c.sireBreed}`}
                      </p>
                    )}
                    {c.cowComplications && <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#b45309" }}>Complications: {c.cowComplications}</p>}
                    {!c.bcmsPassportApplied && isCattle && <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#ef4444", fontWeight: 600 }}>⚠ BCMS passport not yet applied for</p>}
                  </div>
                ))}
              </div>
            )
          ) : tab === "health" ? (
            !data.diseaseIncidents || data.diseaseIncidents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <AlertTriangle size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p>No health or disease incidents recorded for this animal.</p>
                <p style={{ fontSize: "0.78rem" }}>Incidents appear here when this animal is listed in a Disease &amp; Incident Log entry as affected or a mortality.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.diseaseIncidents.map(inc => {
                  const isMortality = inc._involvedAs === "mortality";
                  const statusColors: Record<string, { bg: string; color: string; border: string }> = {
                    open: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
                    monitoring: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
                    resolved: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
                  };
                  const sc = statusColors[inc.status] ?? statusColors.open;
                  return (
                    <div key={inc.id} style={{ background: isMortality ? "#fef2f2" : "#fff", border: `1px solid ${isMortality ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827", textTransform: "capitalize" }}>{inc.incidentType?.replace(/_/g, " ")}</span>
                            <span style={{ fontSize: "0.7rem", background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: "1px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>{inc.status}</span>
                            {isMortality && <span style={{ fontSize: "0.7rem", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>MORTALITY</span>}
                          </div>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                            {new Date(inc.incidentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {inc.vetCalled && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe", padding: "1px 6px", borderRadius: 4 }}>
                              Vet called{inc.vetName ? ` — ${inc.vetName}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <p style={{ margin: "5px 0 0", fontSize: "0.8rem", color: "#374151" }}>{inc.symptomsObserved}</p>
                      {(inc.confirmedDiagnosis || inc.suspectedDiagnosis) && (
                        <p style={{ margin: "3px 0 0", fontSize: "0.76rem", color: "#374151" }}>
                          {inc.confirmedDiagnosis ? <><strong>Confirmed:</strong> {inc.confirmedDiagnosis}</> : <><strong>Suspected:</strong> {inc.suspectedDiagnosis}</>}
                        </p>
                      )}
                      {inc.treatmentGiven && (
                        <p style={{ margin: "3px 0 0", fontSize: "0.76rem", color: "#166534" }}><strong>Treatment:</strong> {inc.treatmentGiven}</p>
                      )}
                      {inc.vetVisitDate && (
                        <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#6b7280" }}>Vet visit: {new Date(inc.vetVisitDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : tab === "documents" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Upload zone */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
                <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: "0.82rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Attach a New Document</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>Document Type</label>
                    <select value={docType} onChange={e => setDocType(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: "0.85rem", background: "#fff", color: "#111827" }}>
                      {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>Title <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional — defaults to type)</span></label>
                    <input value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder={DOC_TYPE_LABELS[docType] ?? "Document title"}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: "0.85rem", color: "#111827", boxSizing: "border-box" }} />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "2px dashed #d1d5db", borderRadius: 8, cursor: "pointer", background: "#fff", transition: "border-color 0.15s" }}>
                  {isUploadingDoc
                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} /><span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Uploading…</span></>
                    : <><Upload size={16} style={{ color: "#9ca3af" }} /><span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Choose a photo, scan or PDF to upload</span></>}
                  <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) uploadDoc(e.target.files[0]); }} />
                </label>
              </div>

              {/* Document list */}
              {docsLoading ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af" }}><Loader2 size={20} style={{ margin: "0 auto" }} /></div>
              ) : !docsData?.documents.length ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
                  <Paperclip size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>No documents attached yet.</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem" }}>Use the upload zone above to add a cattle passport, TB certificate, or any other official document.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {docsData.documents.map(doc => {
                    const typeColor: Record<string, { bg: string; text: string; border: string }> = {
                      passport: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
                      tb_test: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
                      movement_licence: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
                      vet_certificate: { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
                      johnes_test: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
                      breed_certificate: { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
                      health_certificate: { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
                      export_certificate: { bg: "#fefce8", text: "#854d0e", border: "#fef08a" },
                    };
                    const colors = typeColor[doc.documentType] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb" };
                    return (
                      <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                        <FileText size={18} style={{ color: "#6b7280", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: "0.62rem", fontWeight: 700, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 4, padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                              {DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                            </span>
                          </div>
                          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>
                            {doc.title}
                          </a>
                          {doc.documentName && <span style={{ fontSize: "0.72rem", color: "#9ca3af", marginLeft: 6 }}>{doc.documentName}</span>}
                          <p style={{ margin: "1px 0 0", fontSize: "0.72rem", color: "#9ca3af" }}>{new Date(doc.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                          {doc.notes && <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>{doc.notes}</p>}
                        </div>
                        <button onClick={() => deleteDoc(doc.id)} disabled={deletingDocId === doc.id}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4, flexShrink: 0, opacity: deletingDocId === doc.id ? 0.4 : 1 }}>
                          {deletingDocId === doc.id ? <Loader2 size={14} /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : tab === "tb-tests" ? (
            <div>
              {animalTbHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                  <Stethoscope size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                  <p>No SICCT TB tests recorded for this ear tag.</p>
                  <p style={{ fontSize: "0.78rem" }}>Tests appear here when this animal's ear tag is listed in a TB Test entry under Livestock → TB Tests.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {animalTbHistory.map(t => {
                    const stageDone = !!t.readingDate;
                    return (
                      <div key={t.id} style={{ border: `1px solid ${stageDone ? "#bbf7d0" : "#fde68a"}`, borderRadius: 8, padding: "10px 14px", background: stageDone ? "#f0fdf4" : "#fffbeb" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>
                              {t.testType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                              Stage 1 — Injection: {new Date(t.testDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              {t.herdFlockRef ? `  ·  ${t.herdFlockRef}` : ""}
                              {t.testingVet ? `  ·  Vet: ${t.testingVet}` : ""}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: stageDone ? "#166534" : "#92400e" }}>
                              Stage 2 — Reading: {t.readingDate ? new Date(t.readingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Pending (72 h after injection)"}
                            </p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px", borderRadius: 9999, background: stageDone ? "#dcfce7" : "#fef9c3", color: stageDone ? "#166534" : "#92400e", border: `1px solid ${stageDone ? "#86efac" : "#fde047"}` }}>
                              {stageDone ? "✓ Both stages complete" : "⏳ Reading pending"}
                            </span>
                            {stageDone && (
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px", borderRadius: 9999, ...(OUTCOME_COLOURS[t.outcome] ? {} : {}), background: t.outcome === "clear" ? "#f0fdf4" : t.outcome === "inconclusive" ? "#fffbeb" : "#fef2f2", color: t.outcome === "clear" ? "#166534" : t.outcome === "inconclusive" ? "#92400e" : "#991b1b", border: `1px solid ${t.outcome === "clear" ? "#bbf7d0" : t.outcome === "inconclusive" ? "#fde68a" : "#fca5a5"}` }}>
                                {t.outcome.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {stageDone && (t.reactors > 0 || t.inconclusives > 0) && (
                          <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "#991b1b", fontWeight: 600 }}>
                            {t.reactors > 0 ? `${t.reactors} reactor${t.reactors > 1 ? "s" : ""}` : ""}
                            {t.reactors > 0 && t.inconclusives > 0 ? "  ·  " : ""}
                            {t.inconclusives > 0 ? `${t.inconclusives} inconclusive${t.inconclusives > 1 ? "s" : ""}` : ""}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Button variant="outline" size="sm" onClick={printAnimalReport} disabled={!data} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print Animal Report
          </Button>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            <Button variant="outline" size="sm" onClick={() => { onEdit(animal); onClose(); }} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AnimalsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const animalSpecies = useLookupStrings("livestock_species", ANIMAL_SPECIES_FALLBACK);
  const base = `/api/farms/${farmId}/animals`;

  const { data: animalsData, isLoading } = useQuery<{ records: Animal[] }>({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const { data: herdsData } = useQuery<{ records: Herd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()),
  });
  const { data: farmData } = useQuery<{ record: { name: string } }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
  });
  const animals = animalsData?.records ?? [];
  const herds = herdsData?.records ?? [];
  const farmName = farmData?.record?.name ?? "BDE Farm";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [speciesFilter, setSpeciesFilter] = useState<string>("__all__");
  const [herdFilter, setHerdFilter] = useState<string>("__all__");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [form, setForm] = useState(EMPTY_ANIMAL);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [qrAnimal, setQrAnimal] = useState<Animal | null>(null);
  const [viewAnimal, setViewAnimal] = useState<Animal | null>(null);
  const [profileAnimal, setProfileAnimal] = useState<Animal | null>(null);
  const [isSavingAnimalCode, setIsSavingAnimalCode] = useState(false);
  const qrPrintRef = useRef<HTMLDivElement>(null);

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_ANIMAL) => {
      const payload = { ...body, herdId: body.herdId ? Number(body.herdId) : null };
      return fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["animals", farmId] }); setShowForm(false); setForm(EMPTY_ANIMAL); },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_ANIMAL & { id: number }) => {
      const payload = { ...body, herdId: body.herdId ? Number(body.herdId) : null };
      return fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["animals", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_ANIMAL); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["animals", farmId] }); setDeleteId(null); },
  });

  function openEdit(a: Animal) {
    setEditing(a);
    setForm({
      herdId: a.herdId ? String(a.herdId) : "",
      earTagNumber: a.earTagNumber ?? "",
      eidNumber: a.eidNumber ?? "",
      tagNumber: a.tagNumber ?? "",
      species: a.species,
      breed: a.breed ?? "",
      sex: a.sex ?? "",
      dateOfBirth: a.dateOfBirth?.slice(0, 10) ?? "",
      acquisitionDate: a.acquisitionDate?.slice(0, 10) ?? "",
      acquisitionSource: a.acquisitionSource ?? "",
      status: a.status,
      notes: a.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
  }

  const herdName = (herdId: number | null) => herds.find(h => h.id === herdId)?.name ?? "—";

  // Derive available species and herds from data for filter dropdowns
  const availableSpecies = Array.from(new Set(animals.map(a => a.species))).sort();
  const herdsWithAnimals = herds.filter(h => animals.some(a => a.herdId === h.id));

  // Status counts across ALL animals (ignore other active filters for badge counts)
  const statusCounts: Record<string, number> = {
    active: animals.filter(a => a.status === "active").length,
    sold: animals.filter(a => a.status === "sold").length,
    dead: animals.filter(a => a.status === "dead").length,
    all: animals.length,
  };

  const filtered = animals.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (speciesFilter !== "__all__" && a.species !== speciesFilter) return false;
    if (herdFilter !== "__all__") {
      if (herdFilter === "__unassigned__") { if (a.herdId !== null) return false; }
      else if (a.herdId !== Number(herdFilter)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        (a.earTagNumber ?? "").toLowerCase().includes(q) ||
        (a.eidNumber ?? "").toLowerCase().includes(q) ||
        (a.tagNumber ?? "").toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q) ||
        (a.breed ?? "").toLowerCase().includes(q) ||
        (a.acquisitionSource ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const STATUS_TABS = [
    { key: "active", label: "On Farm", color: "bg-green-100 text-green-800 border-green-200" },
    { key: "sold", label: "Sold / Moved Off", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { key: "dead", label: "Deceased", color: "bg-red-100 text-red-700 border-red-200" },
    { key: "all", label: "All Records", color: "bg-gray-100 text-gray-600 border-gray-200" },
  ];

  return (
    <>
      {/* Status quick-filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === tab.key
                ? tab.color + " ring-2 ring-offset-1 ring-current"
                : "bg-white text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            {tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.key ? "bg-white/60" : "bg-muted"}`}>
              {statusCounts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search + species/herd filters + register button */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tag, EID, breed…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {availableSpecies.length > 1 && (
          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-foreground"
          >
            <option value="__all__">All species</option>
            {availableSpecies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {herdsWithAnimals.length > 1 && (
          <select
            value={herdFilter}
            onChange={e => setHerdFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-foreground"
          >
            <option value="__all__">All herds</option>
            {herds.map(h => <option key={h.id} value={String(h.id)}>{h.name}</option>)}
            <option value="__unassigned__">Unassigned</option>
          </select>
        )}
        <Button onClick={() => { setEditing(null); setForm(EMPTY_ANIMAL); setShowForm(true); }} className="ml-auto shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Register Animal
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        Register individual animals with their ear tag, EID transponder, and key details. For cattle, each animal must have a UK ear tag matching the BCMS cattle passport. For sheep, the EID (electronic transponder) number is required for flocks of 10 or more under retained UK law.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          {animals.length === 0
            ? "No individual animals registered yet. Click 'Register Animal' to add the first record."
            : search
            ? `No animals match "${search}" in the current filter.`
            : statusFilter === "active"
            ? "No animals currently on farm. Register an animal or check the 'Sold / Moved Off' or 'All Records' view."
            : statusFilter === "sold"
            ? "No sold or moved animals on record."
            : statusFilter === "dead"
            ? "No deceased animals on record."
            : "No animals match the current filter."}
        </CardContent></Card>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Ear Tag (UK)</th>
                <th className="text-left px-4 py-3 font-medium">EID Number</th>
                <th className="text-left px-4 py-3 font-medium">Alt. ID</th>
                <th className="text-left px-4 py-3 font-medium">Species</th>
                <th className="text-left px-4 py-3 font-medium">Breed</th>
                <th className="text-left px-4 py-3 font-medium">Sex</th>
                <th className="text-left px-4 py-3 font-medium">Date of Birth</th>
                <th className="text-left px-4 py-3 font-medium">Herd / Flock</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{a.earTagNumber || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.eidNumber || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.tagNumber || "—"}</td>
                  <td className="px-4 py-3 capitalize">{a.species}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.breed || "—"}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{a.sex || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.dateOfBirth)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{herdName(a.herdId)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.status === "active" ? "bg-green-50 text-green-700" :
                      a.status === "sold" ? "bg-amber-50 text-amber-700" :
                      a.status === "dead" ? "bg-red-50 text-red-700" :
                      "bg-gray-50 text-gray-600"
                    }`}>{ANIMAL_STATUS_LABELS[a.status] ?? a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" title="View animal" onClick={() => setViewAnimal(a)}><Eye className="h-3 w-3 text-blue-600" /></Button>
                      <Button size="sm" variant="ghost" title="Full profile" onClick={() => setProfileAnimal(a)} className="text-green-700 hover:text-green-800"><ClipboardList className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" title="QR Code" onClick={() => setQrAnimal(a)}><QrCode className="h-3 w-3 text-teal-600" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(a.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {qrAnimal && (() => {
        const autoCode = `ANM-${String(qrAnimal.id).padStart(4, "0")}`;
        const displayCode = qrAnimal.animalCode || null;
        const tagLabel = qrAnimal.earTagNumber || qrAnimal.tagNumber || `Animal #${qrAnimal.id}`;
        const qrValue = displayCode ? `BDE:F${farmId}:${displayCode}` : `BDE:F${farmId}:${autoCode}`;
        const LCSS = `@page{size:62mm 90mm;margin:0}body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}.brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em}.farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}svg{display:block;margin:0 auto}.code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}.iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}.hint{font-size:8px;color:#d1d5db;margin-top:4px}`;
        const saveAnimalCode = async (code: string) => {
          setIsSavingAnimalCode(true);
          try {
            await fetch(`/api/farms/${farmId}/animals/${qrAnimal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ animalCode: code }) });
            qc.invalidateQueries({ queryKey: ["animals", farmId] });
            setQrAnimal(prev => prev ? { ...prev, animalCode: code } : null);
          } finally { setIsSavingAnimalCode(false); }
        };
        function handleQrPrint() {
          const win = window.open("", "_blank");
          if (!win || !qrPrintRef.current) return;
          win.document.write(`<html><head><title>Animal Label</title><style>${LCSS}</style></head><body>${qrPrintRef.current.innerHTML}</body></html>`);
          win.document.close(); win.focus(); win.addEventListener("afterprint", () => win.close()); win.print();
        }
        return (
          <Dialog open onOpenChange={o => { if (!o) setQrAnimal(null); }}>
            <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><QrCode className="w-4 h-4 text-teal-600" /> Animal QR Label</DialogTitle>
              </DialogHeader>
              {displayCode ? (
                <>
                  <div className="flex flex-col items-center gap-1.5 border rounded-xl bg-white px-5 py-3 shadow-sm" ref={qrPrintRef}>
                    <p className="text-[11px] font-bold text-teal-700 tracking-widest mt-1">🌿 BDE Farm Trac</p>
                    <hr className="w-full border-gray-200" />
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">{farmName}</p>
                    <QRCodeSVG value={qrValue} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
                    <p className="font-mono text-xl font-bold tracking-widest text-teal-700 mt-1">{displayCode}</p>
                    <p className="text-sm font-semibold text-gray-700">{tagLabel}</p>
                    {qrAnimal.species && <p className="text-xs text-gray-400">{qrAnimal.species}{qrAnimal.breed ? ` · ${qrAnimal.breed}` : ""}</p>}
                    <p className="text-[10px] text-gray-300 mb-1">Scan to view animal record</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setQrAnimal(null)}>Close</Button>
                    <Button size="sm" onClick={handleQrPrint} className="gap-2"><Printer className="w-3.5 h-3.5" /> Print Label</Button>
                  </DialogFooter>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
                    <QrCode className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">No QR code yet. Assign code <strong className="font-mono">{autoCode}</strong> to this animal.</p>
                  <Button onClick={() => saveAnimalCode(autoCode)} disabled={isSavingAnimalCode} className="gap-2">
                    {isSavingAnimalCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    Generate QR Code
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        );
      })()}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "48rem" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Animal Record" : "Register Individual Animal"}</DialogTitle>
              <DialogDescription>Record the individual identifier, species, and key details for this animal.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>UK Ear Tag Number</Label>
                  <Input value={form.earTagNumber} onChange={e => setField("earTagNumber", e.target.value)} placeholder="e.g. UK123456 789012" className="font-mono" />
                  <p className="text-xs text-muted-foreground mt-1">BCMS format for cattle. For sheep, use the holding number + individual number printed on the visual tag.</p>
                </div>
                <div>
                  <Label>EID Transponder Number</Label>
                  <Input value={form.eidNumber} onChange={e => setField("eidNumber", e.target.value)} placeholder="e.g. 826 00123456789" className="font-mono" />
                  <p className="text-xs text-muted-foreground mt-1">15-digit electronic ID (ISO 11784). Required for sheep in flocks ≥ 10. Also used for cattle electronic tags.</p>
                </div>
                <div>
                  <Label>Alternative / Internal ID</Label>
                  <Input value={form.tagNumber} onChange={e => setField("tagNumber", e.target.value)} placeholder="e.g. breed society number, dam/sire ref" />
                </div>
                <div>
                  <Label>Species <span className="text-red-500">*</span></Label>
                  <Select value={form.species || undefined} onValueChange={v => setField("species", v)}>
                    <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                    <SelectContent>{animalSpecies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input value={form.breed} onChange={e => setField("breed", e.target.value)} placeholder="e.g. Holstein Friesian, Texel" />
                </div>
                <div>
                  <Label>Sex</Label>
                  <Select value={form.sex || undefined} onValueChange={v => setField("sex", v)}>
                    <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male (entire)</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="castrated">Castrated / Spayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={e => setField("dateOfBirth", e.target.value)} />
                </div>
                <div>
                  <Label>Herd / Flock</Label>
                  <Select value={form.herdId || "__none__"} onValueChange={v => setField("herdId", v === "__none__" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Assign to herd (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Unassigned —</SelectItem>
                      {herds.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Arrival Date (on Holding)</Label>
                  <p className="text-xs text-muted-foreground mb-1">Date the animal physically arrived at this holding — used for BCMS notifications and movement records</p>
                  <Input type="date" value={form.acquisitionDate} onChange={e => setField("acquisitionDate", e.target.value)} />
                </div>
                <div>
                  <Label>Acquired From</Label>
                  <Input value={form.acquisitionSource} onChange={e => setField("acquisitionSource", e.target.value)} placeholder="e.g. Supplier name / CPH / auction market" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setField("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ANIMAL_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Any additional notes" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : editing ? "Update" : "Register Animal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Animal Record?</DialogTitle><DialogDescription>This will mark the record as removed. It cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick view dialog */}
      {viewAnimal && (
        <AnimalQuickViewDialog
          animal={viewAnimal}
          farmId={farmId}
          herds={herds}
          onClose={() => setViewAnimal(null)}
          onEdit={a => { setViewAnimal(null); openEdit(a); }}
          onProfile={a => { setViewAnimal(null); setProfileAnimal(a); }}
        />
      )}

      {/* Full animal profile dialog */}
      {profileAnimal && (
        <AnimalProfileDialog
          animal={profileAnimal}
          farmId={farmId}
          onClose={() => setProfileAnimal(null)}
          onEdit={a => { setProfileAnimal(null); openEdit(a); }}
        />
      )}
    </>
  );
}

// ─── Sire Register Section ─────────────────────────────────────────────────────
export function SiresSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sire | null>(null);
  const [form, setForm] = useState<typeof EMPTY_SIRE>(EMPTY_SIRE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const baseUrl = `/api/farms/${farmId}/sires`;
  const { data, isLoading } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(baseUrl, { credentials: "include" }).then(r => r.json()) as Promise<{ records: Sire[] }>,
  });
  const records: Sire[] = (data?.records ?? []).filter(s => s.isActive);
  const filtered = records.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.breed ?? "").toLowerCase().includes(search.toLowerCase()));

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sires", farmId] }); setOpen(false); setForm(EMPTY_SIRE); setEditing(null); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) => fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sires", farmId] }); setOpen(false); setForm(EMPTY_SIRE); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${baseUrl}/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sires", farmId] }); setDeleteId(null); },
  });

  function openAdd() { setEditing(null); setForm(EMPTY_SIRE); setOpen(true); }
  function openEdit(s: Sire) {
    setEditing(s);
    setForm({
      name: s.name ?? "", species: s.species ?? "Cattle", breed: s.breed ?? "", tagNumber: s.tagNumber ?? "",
      passportNumber: s.passportNumber ?? "", dateOfBirth: s.dateOfBirth ?? "", ownershipType: s.ownershipType ?? "owned",
      supplierName: s.supplierName ?? "", supplierContact: s.supplierContact ?? "",
      hireStartDate: s.hireStartDate ?? "", hireEndDate: s.hireEndDate ?? "", returnDate: s.returnDate ?? "",
      bvdStatus: s.bvdStatus ?? "", fertilityTestDate: s.fertilityTestDate ?? "",
      fertilityTestResult: s.fertilityTestResult ?? "", scrapieGenotype: s.scrapieGenotype ?? "", notes: s.notes ?? "",
    });
    setOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) clean[k] = v === "" ? null : v;
    if (editing) updateMut.mutate({ id: editing.id, body: clean });
    else createMut.mutate(clean);
  }
  const saving = createMut.isPending || updateMut.isPending;
  const isHiredOrLoaned = form.ownershipType === "hired_in" || form.ownershipType === "loaned";

  const ownershipLabel: Record<string, string> = { owned: "Owned", hired_in: "Hired In", loaned: "Loaned" };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Search sires…" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
        </div>
        <Button onClick={openAdd} className="gap-1"><Plus className="h-4 w-4" /> Add Sire / Ram</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">{search ? "No sires match your search" : "No sires registered yet"}</p>
          {!search && <p className="text-sm mt-1">Add your bulls and rams — both on-site and hired in.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {["Name", "Species", "Breed", "Tag / Passport", "Ownership", "BVD / Scrapie", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                  <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.species}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.breed ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.tagNumber ?? "—"}{s.passportNumber ? ` / ${s.passportNumber}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.ownershipType === "owned" ? "bg-green-100 text-green-800"
                      : s.ownershipType === "hired_in" ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>{ownershipLabel[s.ownershipType] ?? s.ownershipType}</span>
                    {(s.ownershipType === "hired_in" || s.ownershipType === "loaned") && s.hireStartDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">From {s.hireStartDate}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {s.species === "Cattle" && s.bvdStatus ? s.bvdStatus : ""}
                    {s.species === "Sheep" && s.scrapieGenotype ? s.scrapieGenotype : ""}
                    {!s.bvdStatus && !s.scrapieGenotype ? "—" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm(EMPTY_SIRE); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sire / Ram" : "Add Sire / Ram"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Oakfield Commander" required /></div>
              <div><Label>Species *</Label>
                <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Cattle", "Sheep", "Pig", "Goat", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Breed</Label><Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder={({ Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" } as Record<string,string>)[form.species] ?? "e.g. enter breed"} /></div>
              <div><Label>Ear Tag Number</Label><Input value={form.tagNumber} onChange={e => setForm(f => ({ ...f, tagNumber: e.target.value }))} placeholder="e.g. UK141092 12345" /></div>
              <div><Label>Passport Number</Label><Input value={form.passportNumber} onChange={e => setForm(f => ({ ...f, passportNumber: e.target.value }))} placeholder="Cattle passport / flock no." /></div>
              <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div>
              <div><Label>Ownership *</Label>
                <Select value={form.ownershipType} onValueChange={v => setForm(f => ({ ...f, ownershipType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned — permanently on farm</SelectItem>
                    <SelectItem value="hired_in">Hired In — brought on for a season</SelectItem>
                    <SelectItem value="loaned">Loaned — temporary loan from another farm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isHiredOrLoaned && (
                <>
                  <div className="col-span-2 border-t pt-3">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Hire / Loan Details</p>
                  </div>
                  <div><Label>Supplier / Owner Name</Label><Input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="Farm or stud name" /></div>
                  <div><Label>Supplier Contact</Label><Input value={form.supplierContact} onChange={e => setForm(f => ({ ...f, supplierContact: e.target.value }))} placeholder="Phone or email" /></div>
                  <div><Label>Arrived on Farm</Label><Input type="date" value={form.hireStartDate} onChange={e => setForm(f => ({ ...f, hireStartDate: e.target.value }))} /></div>
                  <div><Label>Expected Return Date</Label><Input type="date" value={form.hireEndDate} onChange={e => setForm(f => ({ ...f, hireEndDate: e.target.value }))} /></div>
                  <div><Label>Actual Return Date</Label><Input type="date" value={form.returnDate} onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} /></div>
                </>
              )}

              <div className="col-span-2 border-t pt-3">
                <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Health Status</p>
              </div>
              {form.species === "Cattle" && (
                <div><Label>BVD Status</Label>
                  <Select value={form.bvdStatus || "__none__"} onValueChange={v => setForm(f => ({ ...f, bvdStatus: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not recorded —</SelectItem>
                      <SelectItem value="Tested Negative">Tested Negative</SelectItem>
                      <SelectItem value="Vaccinated">Vaccinated</SelectItem>
                      <SelectItem value="Not Tested">Not Tested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.species === "Sheep" && (
                <div><Label>Scrapie Genotype</Label><Input value={form.scrapieGenotype} onChange={e => setForm(f => ({ ...f, scrapieGenotype: e.target.value }))} placeholder="e.g. ARR/ARR" /></div>
              )}
              <div><Label>Fertility Test Date</Label><Input type="date" value={form.fertilityTestDate} onChange={e => setForm(f => ({ ...f, fertilityTestDate: e.target.value }))} /></div>
              <div><Label>Fertility Test Result</Label><Input value={form.fertilityTestResult} onChange={e => setForm(f => ({ ...f, fertilityTestResult: e.target.value }))} placeholder="e.g. Satisfactory" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(EMPTY_SIRE); }}>Cancel</Button>
              <Button type="submit" disabled={saving || !form.name.trim()}>{saving ? <Loader2 className="animate-spin h-4 w-4" /> : editing ? "Save Changes" : "Add Sire"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {deleteId !== null && (
        <Dialog open onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Remove Sire from Register?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This will deactivate the sire record. Existing AI/reproduction records linked to this sire are unaffected.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ─── AI / Reproduction Section ─────────────────────────────────────────────────
export function AIReproductionSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [viewAIRecord, setViewAIRecord] = useState<Record<string, unknown> | null>(null);

  // Lookup data
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`, { credentials: "include" }).then(r => r.json()),
  });
  const { data: animalsData } = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then(r => r.json()),
  });
  const { data: siresData } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: Sire[] }>,
  });
  const { data: strawsData } = useQuery({
    queryKey: ["straws", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straws`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: StrawInventory[] }>,
  });
  const { data: membersData } = useFarmMembers(farmId);

  const { data: aiAttachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const aiAttachMap = Object.fromEntries(aiAttachCountsRaw.filter(c => c.recordType === "ai_breeding").map(c => [c.recordId, c.count]));

  const herds: Herd[] = (herdsData?.records ?? []).filter((h: Herd) => h.isActive);
  const allAnimals: Animal[] = animalsData?.records ?? [];
  const activeSires: Sire[] = (siresData?.records ?? []).filter((s: Sire) => s.isActive);
  const inStockStraws: StrawInventory[] = (strawsData?.records ?? []).filter((s: StrawInventory) => (s.strawsReceived - (s.strawsUsed ?? 0)) > 0);

  // Filter animals to selected herd (if any), active only
  const selectedHerdId = form.herdId ? Number(form.herdId) : null;
  const herdAnimals = allAnimals.filter(a =>
    a.status !== "Dead" && a.status !== "Sold" &&
    (selectedHerdId ? a.herdId === selectedHerdId : true)
  );

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ai-reproduction", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`, { credentials: "include" }).then(r => r.json()),
  });

  const staffNames = (membersData?.members ?? []).map((m: Parameters<typeof memberFullName>[0]) => memberFullName(m));

  function handleSireSelect(val: string) {
    if (val === "__none__") {
      setForm(f => ({ ...f, sireRegisterId: "", sireName: "", sireBreed: "" }));
      return;
    }
    const sire = activeSires.find(s => String(s.id) === val);
    if (sire) {
      setForm(f => ({ ...f, sireRegisterId: String(sire.id), sireName: sire.name, sireBreed: sire.breed ?? "" }));
    }
  }

  function handleStrawSelect(val: string) {
    if (val === "__none__") {
      setForm(f => ({ ...f, strawInventoryId: "", strawBatchRef: "", sireName: "", sireBreed: "" }));
      return;
    }
    const straw = inStockStraws.find(s => String(s.id) === val);
    if (straw) {
      setForm(f => ({
        ...f,
        strawInventoryId: String(straw.id),
        strawBatchRef: straw.batchNumber,
        sireName: straw.sireName,
        sireBreed: straw.sireBreed ?? "",
      }));
    }
  }

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? `/api/farms/${farmId}/ai-reproduction-records/${editing.id}` : `/api/farms/${farmId}/ai-reproduction-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-reproduction", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/ai-reproduction-records/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-reproduction", farmId] }),
  });

  // When a herd is selected, store its id and name
  const handleHerdSelect = (herdId: string) => {
    if (herdId === "__none__") {
      setForm(f => ({ ...f, herdId: "", herdName: "", animalTag: "", animalId: "" }));
      return;
    }
    const herd = herds.find(h => String(h.id) === herdId);
    setForm(f => ({ ...f, herdId: herdId, herdName: herd?.name ?? "", animalTag: "", animalId: "" }));
  };

  // When an animal is selected, auto-fill tag and breed
  const handleAnimalSelect = (animalId: string) => {
    if (animalId === "__none__") {
      setForm(f => ({ ...f, animalId: "", animalTag: "" }));
      return;
    }
    const animal = allAnimals.find(a => String(a.id) === animalId);
    if (animal) {
      setForm(f => ({
        ...f,
        animalId: animalId,
        animalTag: animal.earTagNumber ?? animal.tagNumber ?? "",
      }));
    }
  };

  const rows = (records as Record<string, unknown>[]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">AI & Reproduction Records</h3>
          <p className="text-sm text-muted-foreground">Log AI, natural service, RVI confirmation and expected calving / lambing dates.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ servicingMethod: "AI", conceptionConfirmed: false }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Record
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <Card><CardContent className="pt-4">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground italic py-4 text-center">No AI/reproduction records yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Event Date", "Animal Tag", "Herd", "Type", "Method", "Sire", "Conception", "Expected Due"].map(h => <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground">{h}</th>)}
                  <th />
                </tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4">{r.eventDate ? new Date(r.eventDate as string).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="py-2 pr-4">{String(r.animalTag ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.herdName ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.recordType ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.servicingMethod ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.sireName ?? r.sireId ?? "—")}</td>
                    <td className="py-2 pr-4">{r.conceptionConfirmed ? "Yes" : "No"}</td>
                    <td className="py-2 pr-4">{r.expectedDueDate ? new Date(r.expectedDueDate as string).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(aiAttachMap[r.id as number] ?? 0) > 0 && (
                          <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />{aiAttachMap[r.id as number]}
                          </span>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => setViewAIRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setPendingConfirm({ msg: "Delete this AI/Reproduction record? This cannot be undone.", fn: () => del.mutate(r.id as number) })}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent></Card>
      )}

      <ConfirmDialog
        open={!!pendingConfirm}
        title="Delete Record"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />

      {viewAIRecord && (
        <Dialog open onOpenChange={() => setViewAIRecord(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>AI / Reproduction Record — {String(viewAIRecord.animalTag || `Record #${viewAIRecord.id}`)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Event Date</p><p className="font-medium">{viewAIRecord.eventDate ? new Date(viewAIRecord.eventDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Record Type</p><p className="font-medium">{String(viewAIRecord.recordType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animal Tag</p><p className="font-medium font-mono">{String(viewAIRecord.animalTag ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock</p><p className="font-medium">{String(viewAIRecord.herdName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Servicing Method</p><p className="font-medium">{String(viewAIRecord.servicingMethod ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inseminator / Technician</p><p className="font-medium">{String(viewAIRecord.inseminatorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sire / Bull / Ram</p><p className="font-medium">{String(viewAIRecord.sireName ?? "—")}{viewAIRecord.sireBreed ? ` (${viewAIRecord.sireBreed})` : ""}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Straw Batch Ref</p><p className="font-medium font-mono">{String(viewAIRecord.strawBatchRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conception Confirmed</p><p className="font-medium">{viewAIRecord.conceptionConfirmed ? "Yes ✓" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Due Date</p><p className="font-medium">{viewAIRecord.expectedDueDate ? new Date(viewAIRecord.expectedDueDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              {!!viewAIRecord.pregnancyDiagDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pregnancy Diag Date</p><p className="font-medium">{new Date(viewAIRecord.pregnancyDiagDate as string).toLocaleDateString("en-GB")}</p></div>}
              {!!viewAIRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewAIRecord.notes)}</p></div>}
            </div>
            <div className="mt-4">
              <RecordAttachments farmId={farmId} recordType="ai_breeding" recordId={viewAIRecord.id as number} />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewAIRecord(null)}>Close</Button>
              <Button onClick={() => { setEditing(viewAIRecord); setForm(Object.fromEntries(Object.entries(viewAIRecord).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); setViewAIRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Record" : "Add AI / Reproduction Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[75vh] overflow-y-auto pr-1">
            <div><Label>Event Date *</Label><Input type="date" value={String(form.eventDate ?? "")} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
            <div><Label>Record Type *</Label>
              <Select value={String(form.recordType ?? "")} onValueChange={v => setForm(f => ({ ...f, recordType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{["AI Service", "Natural Service", "Pregnancy Diagnosis", "Calving / Kidding / Lambing", "Embryo Transfer"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* ── Herd lookup ── */}
            <div><Label>Herd / Flock</Label>
              <Select value={String(form.herdId || "__none__")} onValueChange={handleHerdSelect}>
                <SelectTrigger><SelectValue placeholder="Select herd…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— No specific herd —</SelectItem>
                  {herds.map(h => (
                    <SelectItem key={h.id} value={String(h.id)}>
                      {h.name}{h.type ? ` (${herdSpeciesDisplayLabel(h.type)}${herdProductionSubtype(h.type, (h as any).productionType) ? ` · ${herdProductionSubtype(h.type, (h as any).productionType)}` : ""})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {herds.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No herds registered — add one in the Herds &amp; Flocks tab first.</p>
              )}
            </div>

            {/* ── Animal Tag lookup, filtered by herd ── */}
            <div><Label>Animal Tag *</Label>
              {herdAnimals.length > 0 ? (
                <Select value={String(form.animalId || "__none__")} onValueChange={handleAnimalSelect}>
                  <SelectTrigger><SelectValue placeholder="Select animal…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Type manually below —</SelectItem>
                    {herdAnimals.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.earTagNumber ?? a.tagNumber ?? `Animal #${a.id}`}
                        {a.breed ? ` — ${a.breed}` : ""}
                        {a.sex ? ` (${a.sex})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 mb-1">
                  {selectedHerdId ? "No active animals in this herd" : "Select a herd to filter animals"}
                </p>
              )}
              <Input
                className="mt-1"
                placeholder="Ear tag / tag number"
                value={String(form.animalTag ?? "")}
                onChange={e => setForm(f => ({ ...f, animalTag: e.target.value, animalId: "" }))}
              />
            </div>

            <div><Label>Servicing Method *</Label>
              <Select value={String(form.servicingMethod ?? "AI")} onValueChange={v => setForm(f => ({ ...f, servicingMethod: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["AI", "Natural Service", "Embryo Transfer", "N/A"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* ── Inseminator / Technician staff lookup ── */}
            <div><Label>Inseminator / Technician</Label>
              <StaffSelect
                staffNames={staffNames}
                value={String(form.inseminatorName ?? "")}
                onChange={v => setForm(f => ({ ...f, inseminatorName: v }))}
              />
            </div>

            {/* ── Straw inventory picker ── */}
            <div className="col-span-2">
              <Label>Select from Straw Inventory</Label>
              <Select value={String(form.strawInventoryId || "__none__")} onValueChange={handleStrawSelect}>
                <SelectTrigger><SelectValue placeholder="Pick an in-stock batch…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Enter batch ref manually —</SelectItem>
                  {inStockStraws.map(s => {
                    const remaining = s.strawsReceived - (s.strawsUsed ?? 0);
                    return (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.sireName} — {s.batchNumber}{s.supplierName ? ` (${s.supplierName})` : ""} · {remaining} left
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {inStockStraws.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No straws in stock — add a delivery in the Straw Inventory tab, or enter the batch ref manually below.</p>
              )}
            </div>
            <div><Label>Straw / Batch Ref</Label><Input value={String(form.strawBatchRef ?? "")} onChange={e => setForm(f => ({ ...f, strawBatchRef: e.target.value }))} placeholder="Auto-filled from inventory, or enter manually" /></div>
            {/* ── Sire register lookup ── */}
            <div className="col-span-2">
              <Label>Sire / Bull / Ram</Label>
              <Select value={String(form.sireRegisterId || "__none__")} onValueChange={handleSireSelect}>
                <SelectTrigger><SelectValue placeholder="Select from sire register…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Enter manually below —</SelectItem>
                  {activeSires.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}{s.breed ? ` (${s.breed})` : ""}{s.tagNumber ? ` — ${s.tagNumber}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeSires.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No sires in register — add one in the Sires &amp; Rams tab, or type a name below.</p>
              )}
            </div>
            <div><Label>Sire Name</Label><Input value={String(form.sireName ?? "")} onChange={e => setForm(f => ({ ...f, sireName: e.target.value }))} placeholder="Auto-filled from register, or type manually" /></div>
            <div><Label>Sire Breed</Label><Input value={String(form.sireBreed ?? "")} onChange={e => setForm(f => ({ ...f, sireBreed: e.target.value }))} placeholder="Auto-filled from register" /></div>
            <div><Label>Expected Due Date</Label><Input type="date" value={String(form.expectedDueDate ?? "")} onChange={e => setForm(f => ({ ...f, expectedDueDate: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="conceptionConfirmed" checked={Boolean(form.conceptionConfirmed)} onChange={e => setForm(f => ({ ...f, conceptionConfirmed: e.target.checked }))} className="w-4 h-4" />
              <Label htmlFor="conceptionConfirmed">Conception confirmed?</Label>
            </div>
            <div><Label>Confirmation Method</Label>
              <Select value={String(form.confirmationMethod ?? "")} onValueChange={v => setForm(f => ({ ...f, confirmationMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["RVI Scanning", "Blood Test", "Milk Progesterone", "Return to Service not observed", "Visual Assessment"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Confirmation Date</Label><Input type="date" value={String(form.confirmationDate ?? "")} onChange={e => setForm(f => ({ ...f, confirmationDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Vet Prescriptions / Medicine Treatment Register ────────────────────────────
export function VetPrescriptionsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean | number>>({});
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["vet-prescriptions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-prescriptions`, { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? `/api/farms/${farmId}/vet-prescriptions/${editing.id}` : `/api/farms/${farmId}/vet-prescriptions`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vet-prescriptions/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] }),
  });

  const rows = (records as Record<string, unknown>[]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Prescription Register</h3>
          <p className="text-sm text-muted-foreground">Record the written prescription or SIC issued by your vet authorising use of each product. Treatment administration is recorded separately in the Medicine module.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ signedByVet: true, farmRegistered: true }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Record
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <Card><CardContent className="pt-4">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground italic py-4 text-center">No medicine treatment records yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Rx Date", "Product / Active Ingredient", "Indication", "Withdrawal Meat", "Withdrawal Milk", "Vet / Practice", "Valid Until", "Treatments"].map(h => (
                    <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                  <th />
                </tr></thead>
                <tbody>{rows.map((r, i) => {
                  const treatmentsRecorded = Number((r as any).treatmentsRecorded ?? 0);
                  return (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{r.prescriptionDate ? new Date(r.prescriptionDate as string).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="py-2 pr-4">
                        <div className="font-medium">{String(r.productName ?? "—")}</div>
                        {r.activeIngredient != null && <div className="text-xs text-muted-foreground">{String(r.activeIngredient)}</div>}
                        {Boolean(r.isCascade) && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">Cascade</span>}
                      </td>
                      <td className="py-2 pr-4 max-w-[200px] text-xs text-muted-foreground">{r.indicationOrDiagnosis ? String(r.indicationOrDiagnosis).slice(0, 80) + (String(r.indicationOrDiagnosis).length > 80 ? "…" : "") : "—"}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.withdrawalPeriodMeat ? `${r.withdrawalPeriodMeat}d` : "—"}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.withdrawalPeriodMilk ? `${r.withdrawalPeriodMilk}d` : "—"}</td>
                      <td className="py-2 pr-4">
                        <div>{String(r.vetName ?? "—")}</div>
                        {r.vrcPracticeName != null && <div className="text-xs text-muted-foreground">{String(r.vrcPracticeName)}</div>}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {r.expiryDate
                          ? (() => {
                              const exp = new Date(r.expiryDate as string);
                              const daysLeft = Math.ceil((exp.getTime() - Date.now()) / 86400000);
                              return daysLeft < 0
                                ? <span className="text-xs text-red-600 font-medium">Expired</span>
                                : daysLeft <= 30
                                  ? <span className="text-xs text-amber-600 font-medium">{exp.toLocaleDateString("en-GB")} ({daysLeft}d)</span>
                                  : <span className="text-xs">{exp.toLocaleDateString("en-GB")}</span>;
                            })()
                          : "—"}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {treatmentsRecorded > 0
                          ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" />{treatmentsRecorded}</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" />None</span>}
                      </td>
                      <td className="py-2 text-right space-x-1 whitespace-nowrap">
                        <Button size="icon" variant="ghost" title="View" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setPendingConfirm({ msg: "Delete this prescription record? This cannot be undone.", fn: () => del.mutate(r.id as number) })}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </CardContent></Card>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "48rem", maxHeight: "90vh", overflowY: "auto" }}>
            <DialogHeader><DialogTitle>Prescription Record — {String(viewRecord.productName ?? "")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Date</p><p className="font-medium">{viewRecord.prescriptionDate ? new Date(viewRecord.prescriptionDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Ref</p><p className="font-medium">{String(viewRecord.prescriptionRef || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{String(viewRecord.vetName || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Practice</p><p className="font-medium">{String(viewRecord.vetPractice || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet RCVS Number</p><p className="font-medium">{String(viewRecord.vetRcvsNumber || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Valid Until</p><p className="font-medium">{viewRecord.prescriptionValidUntil ? new Date(viewRecord.prescriptionValidUntil as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div className="col-span-2 border-t pt-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{String(viewRecord.productName || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{String(viewRecord.activeIngredient || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Route of Administration</p><p className="font-medium">{String(viewRecord.routeOfAdministration || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dose</p><p className="font-medium">{String(viewRecord.dose || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Frequency</p><p className="font-medium">{String(viewRecord.frequency || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Duration</p><p className="font-medium">{String(viewRecord.treatmentDuration || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Authorised</p><p className="font-medium">{String(viewRecord.quantityAuthorised || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Dispensed</p><p className="font-medium">{String(viewRecord.dispensedQuantity || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Batch Number</p><p className="font-medium">{String(viewRecord.batchNumber || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry Date</p><p className="font-medium">{viewRecord.expiryDate ? new Date(viewRecord.expiryDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal — Meat</p><p className="font-medium">{viewRecord.withdrawalPeriodMeat ? `${viewRecord.withdrawalPeriodMeat}d` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal — Milk</p><p className="font-medium">{viewRecord.withdrawalPeriodMilk ? `${viewRecord.withdrawalPeriodMilk}d` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal — Eggs</p><p className="font-medium">{viewRecord.withdrawalPeriodEggs ? `${viewRecord.withdrawalPeriodEggs}d` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Species</p><p className="font-medium">{String(viewRecord.targetSpecies || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cascade / Off-label</p><p className="font-medium">{viewRecord.isCascade ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Signed by Vet</p><p className="font-medium">{viewRecord.signedByVet ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Farm Registered</p><p className="font-medium">{viewRecord.farmRegistered ? "Yes" : "No"}</p></div>
              {!!viewRecord.cascadeJustification && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Cascade Justification</p><p className="font-medium">{String(viewRecord.cascadeJustification)}</p></div>
              )}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Indication / Diagnosis</p><p className="font-medium">{String(viewRecord.indicationOrDiagnosis || "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes || "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!pendingConfirm}
        title="Delete Prescription Record"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Medicine Record" : "Add Prescription / Medicine Treatment Record"}</DialogTitle>
            <DialogDescription>Record the veterinary prescription and the animals treated. Required under VMR 2013 and Red Tractor standards.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[72vh] overflow-y-auto pr-1">

            {/* ── Prescription details ── */}
            <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Prescription Details</div>
            <div><Label>Prescription Date *</Label><Input type="date" value={String(form.prescriptionDate ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionDate: e.target.value }))} /></div>
            <div><Label>Prescription Reference</Label><Input value={String(form.prescriptionRef ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionRef: e.target.value }))} /></div>
            <div><Label>Vet Name *</Label><Input value={String(form.vetName ?? "")} onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))} /></div>
            <div><Label>Vet Practice</Label><Input value={String(form.vetPractice ?? "")} onChange={e => setForm(f => ({ ...f, vetPractice: e.target.value }))} /></div>
            <div><Label>Vet RCVS Number</Label><Input value={String(form.vetRcvsNumber ?? "")} onChange={e => setForm(f => ({ ...f, vetRcvsNumber: e.target.value }))} /></div>
            <div><Label>Prescription Valid Until</Label><Input type="date" value={String(form.prescriptionValidUntil ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionValidUntil: e.target.value }))} /></div>

            {/* ── Medicine details ── */}
            <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t">Medicine Details</div>
            <div><Label>Product Name *</Label><Input value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Active Ingredient</Label><Input value={String(form.activeIngredient ?? "")} onChange={e => setForm(f => ({ ...f, activeIngredient: e.target.value }))} /></div>
            <div><Label>Route of Administration *</Label>
              <Select value={String(form.routeOfAdministration ?? "")} onValueChange={v => setForm(f => ({ ...f, routeOfAdministration: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Oral", "Injection (IM)", "Injection (SC)", "Injection (IV)", "Topical", "Pour-on", "Intramammary", "Intrauterine", "In-water", "In-feed"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Dose</Label><Input value={String(form.dose ?? "")} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} /></div>
            <div><Label>Frequency</Label><Input value={String(form.frequency ?? "")} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} /></div>
            <div><Label>Treatment Duration</Label><Input value={String(form.treatmentDuration ?? "")} onChange={e => setForm(f => ({ ...f, treatmentDuration: e.target.value }))} /></div>
            <div><Label>Quantity Authorised</Label><Input value={String(form.quantityAuthorised ?? "")} onChange={e => setForm(f => ({ ...f, quantityAuthorised: e.target.value }))} /></div>
            <div><Label>Quantity Dispensed</Label><Input value={String(form.dispensedQuantity ?? "")} onChange={e => setForm(f => ({ ...f, dispensedQuantity: e.target.value }))} /></div>
            <div><Label>Batch Number</Label><Input value={String(form.batchNumber ?? "")} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate ?? "")} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            <div><Label>Withdrawal — Meat (days)</Label><Input type="number" value={String(form.withdrawalPeriodMeat ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodMeat: e.target.value }))} /></div>
            <div><Label>Withdrawal — Milk (days)</Label><Input type="number" value={String(form.withdrawalPeriodMilk ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodMilk: e.target.value }))} /></div>
            <div><Label>Withdrawal — Eggs (days)</Label><Input type="number" value={String(form.withdrawalPeriodEggs ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodEggs: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2">
              {([["signedByVet", "Signed by vet?"], ["isCascade", "Cascade / off-label use?"], ["farmRegistered", "Farm registered for prescribing?"]] as [string, string][]).map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <input type="checkbox" id={`rx-${k}`} checked={Boolean(form[k])} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} className="w-4 h-4" />
                  <Label htmlFor={`rx-${k}`}>{l}</Label>
                </div>
              ))}
            </div>
            {Boolean(form.isCascade) && (
              <div className="col-span-2"><Label>Cascade Justification</Label><Textarea value={String(form.cascadeJustification ?? "")} onChange={e => setForm(f => ({ ...f, cascadeJustification: e.target.value }))} rows={2} /></div>
            )}
            <div className="col-span-2"><Label>Indication / Diagnosis</Label><Textarea value={String(form.indicationOrDiagnosis ?? "")} onChange={e => setForm(f => ({ ...f, indicationOrDiagnosis: e.target.value }))} rows={2} /></div>

            {/* ── Target species ── */}
            <div><Label>Target Species</Label><Input value={String(form.targetSpecies ?? "")} onChange={e => setForm(f => ({ ...f, targetSpecies: e.target.value }))} placeholder="e.g. Cattle, Sheep, Pigs" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>

            {/* ── Separation notice ── */}
            <div className="col-span-2 mt-1 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
              <strong>Recording actual treatments?</strong> Once medicine has been administered, record each treatment event — ear tags, date given, who administered it, batch number used — in the <strong>Medicine</strong> module (sidebar). When creating a treatment entry there, you can link it back to this prescription for a full audit trail. Keeping prescription authorisation and treatment administration in separate registers is the VMR 2013 standard.
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StrawInventorySection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StrawInventory | null>(null);
  const [form, setForm] = useState<typeof EMPTY_STRAW>(EMPTY_STRAW);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: siresData } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: Sire[] }>,
  });
  const activeSires: Sire[] = (siresData?.records ?? []).filter((s: Sire) => s.isActive);

  const { data, isLoading } = useQuery({
    queryKey: ["straws", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straws`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: StrawInventory[] }>,
  });
  const straws: StrawInventory[] = data?.records ?? [];

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? `/api/farms/${farmId}/straws/${editing.id}` : `/api/farms/${farmId}/straws`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straws", farmId] }); setOpen(false); setEditing(null); setForm(EMPTY_STRAW); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/straws/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straws", farmId] }); setDeleteId(null); },
  });

  function openAdd() { setEditing(null); setForm(EMPTY_STRAW); setOpen(true); }
  function openEdit(s: StrawInventory) {
    setEditing(s);
    setForm({
      sireRegisterId: s.sireRegisterId ?? "",
      sireName: s.sireName, sireBreed: s.sireBreed ?? "", sireSpecies: s.sireSpecies,
      supplierName: s.supplierName ?? "", batchNumber: s.batchNumber,
      strawsReceived: s.strawsReceived, storageLocation: s.storageLocation ?? "",
      deliveryDate: s.deliveryDate ?? "", unitCostPence: s.unitCostPence ?? "",
      notes: s.notes ?? "",
    });
    setOpen(true);
  }

  function handleSireSelect(val: string) {
    if (val === "__none__") { setForm(f => ({ ...f, sireRegisterId: "", sireName: "", sireBreed: "" })); return; }
    const sire = activeSires.find(s => String(s.id) === val);
    if (sire) setForm(f => ({ ...f, sireRegisterId: sire.id, sireName: sire.name, sireBreed: sire.breed ?? "", sireSpecies: sire.species }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      sireRegisterId: form.sireRegisterId !== "" ? Number(form.sireRegisterId) : null,
      strawsReceived: Number(form.strawsReceived),
      unitCostPence: form.unitCostPence !== "" ? Number(form.unitCostPence) : null,
    };
    save.mutate(body);
  }

  function stockBadge(s: StrawInventory) {
    const remaining = s.strawsReceived - (s.strawsUsed ?? 0);
    if (remaining <= 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    if (remaining <= 2) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Low — {remaining} left</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{remaining} remaining</span>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Straw Inventory</h2>
          <p className="text-sm text-muted-foreground">Track AI straw deliveries by batch number — straws used are counted automatically from AI records.</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Delivery</Button>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : straws.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium">No straw deliveries logged yet</p>
          <p className="text-sm mt-1">Add your first delivery to start tracking stock and verifying batch numbers at AI service time.</p>
        </div>
      ) : (
        <>
          {/* ── Summary strip ── */}
          {(() => {
            const totalReceived = straws.reduce((s, r) => s + (r.strawsReceived ?? 0), 0);
            const totalUsed = straws.reduce((s, r) => s + (r.strawsUsed ?? 0), 0);
            const totalInStock = straws.reduce((s, r) => s + Math.max(0, (r.strawsReceived ?? 0) - (r.strawsUsed ?? 0)), 0);
            const totalCostPence = straws.reduce((s, r) => s + ((r.unitCostPence ?? 0) * (r.strawsReceived ?? 0)), 0);
            const hasCost = straws.some(r => r.unitCostPence);
            return (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ background: totalInStock > 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${totalInStock > 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalInStock > 0 ? "#15803d" : "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>In Stock</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: totalInStock > 0 ? "#14532d" : "#7f1d1d", lineHeight: 1, margin: 0 }}>{totalInStock}</p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>straw{totalInStock !== 1 ? "s" : ""}</p>
                </div>
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 100 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Received</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>{totalReceived}</p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>straws</p>
                </div>
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 100 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Used to Date</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>{totalUsed}</p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>straws</p>
                </div>
                {hasCost && (
                  <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Stock Value</p>
                    <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>£{(totalCostPence / 100).toFixed(2)}</p>
                    <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>total received</p>
                  </div>
                )}
              </div>
            );
          })()}
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sire / Bull / Ram</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Batch No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Storage</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Delivered</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {straws.map(s => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.sireName}</p>
                    {s.sireBreed && <p className="text-xs text-muted-foreground">{s.sireBreed} · {s.sireSpecies}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.batchNumber}</td>
                  <td className="px-4 py-3">{s.supplierName || "—"}</td>
                  <td className="px-4 py-3">
                    {stockBadge(s)}
                    <p className="text-xs text-muted-foreground mt-0.5">{s.strawsReceived} received · {s.strawsUsed ?? 0} used</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{s.storageLocation || "—"}</td>
                  <td className="px-4 py-3 text-xs">{s.deliveryDate || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove from inventory?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will mark the batch as inactive. AI records linked to it will not be affected.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && del.mutate(deleteId)} disabled={del.isPending}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm(EMPTY_STRAW); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Straw Batch" : "Log Straw Delivery"}</DialogTitle>
            <DialogDescription>Record the delivery details and batch number from the AI centre documentation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Sire register lookup */}
              <div className="col-span-2">
                <Label>Link to Sire Register</Label>
                <Select value={String(form.sireRegisterId || "__none__")} onValueChange={handleSireSelect}>
                  <SelectTrigger><SelectValue placeholder="Select from sire register…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Not in register / enter manually —</SelectItem>
                    {activeSires.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}{s.breed ? ` (${s.breed})` : ""}{s.tagNumber ? ` — ${s.tagNumber}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Linking to the register enables automatic donor verification. You can also enter details manually below.</p>
              </div>
              <div className="col-span-2"><Label>Donor Sire Name *</Label><Input value={form.sireName} onChange={e => setForm(f => ({ ...f, sireName: e.target.value }))} placeholder="e.g. Cogent Commander" required /></div>
              <div>
                <Label>Species *</Label>
                <Select value={form.sireSpecies} onValueChange={v => setForm(f => ({ ...f, sireSpecies: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Cattle", "Sheep", "Pig", "Goat", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Breed</Label><Input value={form.sireBreed} onChange={e => setForm(f => ({ ...f, sireBreed: e.target.value }))} placeholder={({ Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" } as Record<string, string>)[form.sireSpecies] ?? "e.g. enter breed"} /></div>
              <div><Label>Batch / Lot Number *</Label><Input value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} placeholder="As printed on straw label" required /></div>
              <div><Label>Supplier / AI Centre</Label><Input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="e.g. Cogent Breeding, Genus ABS" /></div>
              <div><Label>Straws Received</Label><Input type="number" min={0} value={form.strawsReceived} onChange={e => setForm(f => ({ ...f, strawsReceived: Number(e.target.value) }))} /></div>
              <div><Label>Storage Location</Label><Input value={form.storageLocation} onChange={e => setForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Tank 2, Goblet 3" /></div>
              <div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
              <div><Label>Unit Cost (£)</Label><Input type="number" min={0} step={0.01} value={form.unitCostPence !== "" ? Number(form.unitCostPence) / 100 : ""} onChange={e => setForm(f => ({ ...f, unitCostPence: e.target.value !== "" ? Math.round(Number(e.target.value) * 100) : "" }))} placeholder="e.g. 18.50" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Health cert reference, catalogue page, etc." /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(EMPTY_STRAW); }}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Lambing Records ──────────────────────────────────────────────────────────

interface LambingRecord {
  id: number;
  herdId?: number | null;
  eweAnimalId?: number | null;
  eweEarTag?: string | null;
  lambingDate: string;
  expectedLambingDate?: string | null;
  lambingEaseScore?: number | null;
  expectedLitterSize?: number | null;
  numberOfLambs: number;
  lambOutcome1?: string | null; lambSex1?: string | null; lambEarTag1?: string | null; lambEidNumber1?: string | null; lambBirthWeightKg1?: string | null; lambAnimalId1?: number | null;
  lambOutcome2?: string | null; lambSex2?: string | null; lambEarTag2?: string | null; lambEidNumber2?: string | null; lambBirthWeightKg2?: string | null; lambAnimalId2?: number | null;
  lambOutcome3?: string | null; lambSex3?: string | null; lambEarTag3?: string | null; lambEidNumber3?: string | null; lambBirthWeightKg3?: string | null; lambAnimalId3?: number | null;
  lambOutcome4?: string | null; lambSex4?: string | null; lambEarTag4?: string | null; lambEidNumber4?: string | null; lambBirthWeightKg4?: string | null; lambAnimalId4?: number | null;
  assistanceRequired: boolean; assistanceType?: string | null;
  vetAttended: boolean; vetName?: string | null;
  colostrumGivenWithin2Hours?: boolean | null; colostrumSource?: string | null;
  fosteringRequired: boolean; fosteringDetails?: string | null;
  ramEarTag?: string | null; ramBreed?: string | null; sireRegisterId?: number | null; conceptionMethod?: string | null;
  eweComplications?: string | null; notes?: string | null;
  perinatalDisposalContractorId?: number | null;
  perinatalCollectionDate?: string | null;
  perinatalCollectionRef?: string | null;
  perinatalDisposalMethod?: string | null;
  perinatalDisposalNotes?: string | null;
}

function LambingEaseBadge({ v }: { v?: number | null }) {
  if (!v) return null;
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: "Ease 1 — Unassisted", cls: "bg-green-100 text-green-700" },
    2: { label: "Ease 2 — Easy assist", cls: "bg-yellow-100 text-yellow-700" },
    3: { label: "Ease 3 — Hard assist", cls: "bg-orange-100 text-orange-700" },
    4: { label: "Ease 4 — Vet required", cls: "bg-red-100 text-red-700" },
  };
  const d = map[v];
  if (!d) return null;
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.cls}`}>{d.label}</span>;
}

// LambSection extracted to avoid component-inside-component anti-pattern (prevents focus loss on type)
function LambSection({ n, form, set }: {
  n: 1 | 2 | 3 | 4;
  form: Partial<LambingRecord>;
  set: <K extends keyof LambingRecord>(k: K, v: unknown) => void;
}) {
  const outcomeKey = `lambOutcome${n}` as keyof LambingRecord;
  const sexKey = `lambSex${n}` as keyof LambingRecord;
  const tagKey = `lambEarTag${n}` as keyof LambingRecord;
  const eidKey = `lambEidNumber${n}` as keyof LambingRecord;
  const weightKey = `lambBirthWeightKg${n}` as keyof LambingRecord;
  const animalIdKey = `lambAnimalId${n}` as keyof LambingRecord;
  const outcome = form[outcomeKey] as string | undefined;
  const earTag = form[tagKey] as string | undefined;
  const animalId = form[animalIdKey] as number | undefined;
  const showHint = outcome === "live" && earTag?.trim();
  return (
    <div className="rounded border p-3 space-y-2 bg-gray-50/50">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lamb {n}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Outcome</Label>
          <Select value={(form[outcomeKey] as string) || "__none__"} onValueChange={v => set(outcomeKey, v === "__none__" ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Not recorded</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="stillborn">Stillborn</SelectItem>
              <SelectItem value="died-within-24h">Died within 24h</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sex</Label>
          <Select value={(form[sexKey] as string) || "__none__"} onValueChange={v => set(sexKey, v === "__none__" ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Not recorded</SelectItem>
              <SelectItem value="male">Male (ram lamb)</SelectItem>
              <SelectItem value="female">Female (ewe lamb)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Ear Tag</Label>
          <Input value={(form[tagKey] as string) || ""} onChange={e => set(tagKey, e.target.value)} placeholder="e.g. UK0141092 0200" />
          {showHint && !animalId && <p className="text-xs text-teal-600 mt-1">Live lamb — will be registered in Livestock on save.</p>}
          {animalId && <p className="text-xs text-teal-600 mt-1">Already in Flock Register (ID #{animalId}) ✓</p>}
        </div>
        <div>
          <Label>EID / Transponder</Label>
          <Input value={(form[eidKey] as string) || ""} onChange={e => set(eidKey, e.target.value)} placeholder="15-digit ISO 11784 EID" />
        </div>
      </div>
      <div>
        <Label>Birth Weight (kg)</Label>
        <Input type="number" step="0.1" min="0" value={(form[weightKey] as string) || ""} onChange={e => set(weightKey, e.target.value || null)} placeholder="e.g. 4.2" className="w-32" />
      </div>
    </div>
  );
}

export function LambingSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const EMPTY: Partial<LambingRecord> = { numberOfLambs: 1, lambingDate: todayStr(), assistanceRequired: false, vetAttended: false, fosteringRequired: false };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LambingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<LambingRecord | null>(null);
  const [form, setForm] = useState<Partial<LambingRecord>>(EMPTY);
  const [showManualEwe, setShowManualEwe] = useState(false);
  const [showManualVet, setShowManualVet] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));

  const { data, isLoading } = useQuery<{ records: LambingRecord[] }>({
    queryKey: ["lambing-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lambing-records`, { credentials: "include" }).then(r => r.json()),
  });

  const animalsQ = useQuery<{ records: Array<{ id: number; earTagNumber?: string | null; eidNumber?: string | null; species: string; sex?: string | null; status: string }> }>({
    queryKey: ["lambing-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const SHEEP_SPECIES = ["sheep", "ovine"];
  const ewes = (animalsQ.data?.records ?? []).filter(a => SHEEP_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber);

  const siresQ = useQuery<{ records: Array<{ id: number; name: string; breed?: string | null; tagNumber?: string | null; species: string; isActive?: boolean | null }> }>({
    queryKey: ["lambing-sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const ramSires = (siresQ.data?.records ?? []).filter(s => s.isActive !== false && ["sheep", "ovine"].includes(s.species?.toLowerCase()));

  const vetVisitsQ = useQuery<{ records: Array<{ id: number; vetName: string; vetPractice?: string | null }> }>({
    queryKey: ["lambing-vet-visits", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-visits`, { credentials: "include" }).then(r => r.json()),
    enabled: open && !!form.vetAttended,
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map(v => v.vetName).filter(Boolean))] as string[];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter(v => v.vetName && v.vetPractice).map(v => [v.vetName, v.vetPractice])
  );

  const { data: attachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const lambingAttachMap = Object.fromEntries(attachCountsRaw.filter(c => c.recordType === "lambing").map(c => [c.recordId, c.count]));

  const contractorsQ = useQuery<Array<{ id: number; name: string; approvalNumber: string; operatorType: string; phone?: string | null }>>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`, { credentials: "include" }).then(r => r.json()),
  });
  const contractors = contractorsQ.data ?? [];

  const save = useMutation({
    mutationFn: (body: Partial<LambingRecord>) => {
      const url = editing ? `/api/farms/${farmId}/lambing-records/${editing.id}` : `/api/farms/${farmId}/lambing-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lambing-records", farmId] }); closeDialog(); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/lambing-records/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lambing-records", farmId] }); setConfirmDelete(null); },
  });

  function closeDialog() { setOpen(false); setEditing(null); setForm(EMPTY); setShowManualEwe(false); setShowManualVet(false); }
  function openAdd() { setEditing(null); setForm({ ...EMPTY, lambingDate: todayStr() }); setShowManualEwe(false); setShowManualVet(false); setOpen(true); }
  function openEdit(r: LambingRecord) {
    setEditing(r);
    setForm({ ...r, lambingDate: r.lambingDate?.slice(0, 10) ?? "" });
    setShowManualEwe(!r.eweAnimalId && !!r.eweEarTag);
    setShowManualVet(!!r.vetAttended && !!r.vetName);
    setOpen(true);
  }
  function set<K extends keyof LambingRecord>(k: K, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const numLambs = form.numberOfLambs ?? 1;
  const hasDeadLambs = [form.lambOutcome1, form.lambOutcome2, form.lambOutcome3, form.lambOutcome4]
    .slice(0, numLambs)
    .some(o => o === "stillborn" || o === "died-within-24h");

  const allRecords = data?.records ?? [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter(r => r.lambingDate?.startsWith(yearFilter));
  const availableYears = [...new Set(allRecords.map(r => r.lambingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a)) as string[];
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));

  function lambSeasonStats(recs: LambingRecord[]) {
    const totalBorn = recs.reduce((s, r) => s + (r.numberOfLambs ?? 0), 0);
    const allOutcomes = recs.flatMap(r => [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(Boolean));
    const stillborns = allOutcomes.filter(o => o === "stillborn").length;
    const died24h = allOutcomes.filter(o => o === "died-within-24h").length;
    const perinatal = stillborns + died24h;
    const pct = (n: number) => totalBorn > 0 ? ((n / totalBorn) * 100).toFixed(1) : "—";
    return { ewes: recs.length, totalBorn, stillborns, died24h, perinatal, pct };
  }
  const currentStats = lambSeasonStats(records);
  const yearlyStats = availableYears.map(y => ({ year: y, ...lambSeasonStats(allRecords.filter(r => r.lambingDate?.startsWith(y))) }));

  function generateLambingReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-GB") : "—";
    const fv2 = (v: unknown) => (v === null || v === undefined || v === "") ? "—" : String(v);
    const easeLabel = (n?: number | null) => n ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][n] ?? String(n) : "—";
    const yesNo = (v: boolean | null | undefined) => v === true ? "Yes" : v === false ? "No" : "—";
    const litterLabel = (n?: number | null) => n === 1 ? "Single" : n === 2 ? "Twins" : n === 3 ? "Triplets" : n === 4 ? "Quads" : fv2(n);

    const rptStats = lambSeasonStats(records);
    const summaryRows = yearlyStats.map(s =>
      `<tr><td>${s.year}</td><td>${s.ewes}</td><td>${s.totalBorn}</td><td>${s.stillborns} (${s.pct(s.stillborns)}%)</td><td>${s.died24h} (${s.pct(s.died24h)}%)</td><td style="font-weight:700">${s.perinatal} (${s.pct(s.perinatal)}%)</td></tr>`
    ).join("");

    const tableRows = records.map(r => {
      const outcomes = [
        r.lambOutcome1 ? `${r.lambOutcome1} (${r.lambSex1 ?? "?"}) ${r.lambEarTag1 ? `[${r.lambEarTag1}]` : ""}` : null,
        r.lambOutcome2 ? `${r.lambOutcome2} (${r.lambSex2 ?? "?"}) ${r.lambEarTag2 ? `[${r.lambEarTag2}]` : ""}` : null,
        r.lambOutcome3 ? `${r.lambOutcome3} (${r.lambSex3 ?? "?"}) ${r.lambEarTag3 ? `[${r.lambEarTag3}]` : ""}` : null,
        r.lambOutcome4 ? `${r.lambOutcome4} (${r.lambSex4 ?? "?"}) ${r.lambEarTag4 ? `[${r.lambEarTag4}]` : ""}` : null,
      ].filter(Boolean).join("; ");
      const liveCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "live").length;
      const deadCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "stillborn" || o === "died-within-24h").length;
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod
        ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}`
        : (deadCount > 0 ? "<span style='color:#b91c1c'>DISPOSAL NOT RECORDED</span>" : "—");
      return `<tr>
        <td>${fmtD(r.lambingDate)}</td>
        <td>${fv2(r.eweEarTag)}</td>
        <td>${easeLabel(r.lambingEaseScore)}</td>
        <td>${litterLabel(r.numberOfLambs)}</td>
        <td style="font-size:9px">${outcomes || "—"}</td>
        <td>${liveCount} live${deadCount ? ` / ${deadCount} dead` : ""}</td>
        <td>${yesNo(r.colostrumGivenWithin2Hours)}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td>${yesNo(r.vetAttended)}</td>
        <td>${r.fosteringRequired ? `Yes — ${fv2(r.fosteringDetails).slice(0, 40)}` : "No"}</td>
        <td style="font-size:9px">${disposalCell}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><title>Lambing Records — Red Tractor Sheep Assurance</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  h3{font-size:11px;margin:14px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .stat-row{display:flex;gap:16px;margin-bottom:14px}
  .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;flex:1;text-align:center}
  .stat-n{font-size:18px;font-weight:700;color:#111}
  .stat-l{font-size:9px;color:#555;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Lambing Records</h1><h2>Red Tractor Sheep Assurance — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Season: ${yearFilter === "all" ? "All years" : yearFilter}<br>Printed: ${printedDate}</div>
</div>
<div class="stat-row">
  <div class="stat"><div class="stat-n">${rptStats.ewes}</div><div class="stat-l">Ewes Lambed</div></div>
  <div class="stat"><div class="stat-n">${rptStats.totalBorn}</div><div class="stat-l">Total Lambs Born</div></div>
  <div class="stat"><div class="stat-n">${rptStats.stillborns} (${rptStats.pct(rptStats.stillborns)}%)</div><div class="stat-l">Stillborn</div></div>
  <div class="stat"><div class="stat-n">${rptStats.died24h} (${rptStats.pct(rptStats.died24h)}%)</div><div class="stat-l">Died Within 24h</div></div>
  <div class="stat" style="border-color:#fca5a5;background:#fff1f2"><div class="stat-n" style="color:#b91c1c">${rptStats.perinatal} (${rptStats.pct(rptStats.perinatal)}%)</div><div class="stat-l">Perinatal Loss</div></div>
</div>
${yearlyStats.length > 1 ? `<h3>Season-by-Season Perinatal Mortality Trend</h3>
<table style="margin-bottom:16px">
  <thead><tr><th>Season</th><th>Ewes Lambed</th><th>Total Born</th><th>Stillborn</th><th>Died &lt;24h</th><th>Perinatal Loss</th></tr></thead>
  <tbody>${summaryRows}</tbody>
</table>` : ""}
<h3>Individual Lambing Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h3>
<table>
  <thead><tr>
    <th>Date</th><th>Ewe Tag</th><th>Ease Score</th><th>Litter</th><th>Lamb Outcomes / Tags</th>
    <th>Alive/Dead</th><th>Colostrum ≤2h</th><th>Assisted</th><th>Vet</th><th>Fostering</th><th>Disposal (date · ref · method)</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<p class="note">Animal By-Products (Enforcement) (England) Regulations 2011: all perinatal deaths (stillborn and died within 24h) must be disposed of via an authorised route and the consignment note retained. Red Tractor Sheep Assurance: lambing performance and mortality records must be retained for a minimum of 3 years and made available at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Lambing records including ease score, up to 4 lambs, colostrum, fostering, and automatic registration of live lambs in the flock register.</p>
          <p className="text-xs text-gray-400">Red Tractor Sheep Assurance: lambing performance must be recorded and available at audit.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              <SelectItem value="all">All years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateLambingReport}><FileDown className="h-4 w-4 mr-1" />Audit Report</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Lambing</Button>
        </div>
      </div>
      {/* Season statistics panel */}
      {allRecords.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[
              { label: "Ewes Lambed", value: String(currentStats.ewes), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
              { label: "Total Lambs Born", value: String(currentStats.totalBorn), sub: "", colour: "" },
              { label: "Stillborn", value: `${currentStats.stillborns}`, sub: `${currentStats.pct(currentStats.stillborns)}% of born`, colour: currentStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
              { label: "Died Within 24h", value: `${currentStats.died24h}`, sub: `${currentStats.pct(currentStats.died24h)}% of born`, colour: currentStats.died24h > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
              { label: "Perinatal Loss", value: `${currentStats.perinatal}`, sub: `${currentStats.pct(currentStats.perinatal)}% of born`, colour: currentStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`}>
                <p className={`text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`}>{s.value}</p>
                <p className="text-xs font-medium text-gray-600 mt-0.5">{s.label}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
          {yearlyStats.length > 1 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Season-by-Season Perinatal Mortality Trend</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Season</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Ewes</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Born</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Stillborn</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Died &lt;24h</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Perinatal Loss</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyStats.map((s, i) => {
                    const maxRate = Math.max(...yearlyStats.map(x => Number(x.pct(x.perinatal)) || 0), 0.1);
                    const rate = Number(s.pct(s.perinatal)) || 0;
                    const barWidth = Math.round((rate / maxRate) * 100);
                    return (
                      <tr key={s.year} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium">{s.year}</td>
                        <td className="px-3 py-2 text-right">{s.ewes}</td>
                        <td className="px-3 py-2 text-right">{s.totalBorn}</td>
                        <td className="px-3 py-2 text-right">{s.stillborns} <span className="text-gray-400">({s.pct(s.stillborns)}%)</span></td>
                        <td className="px-3 py-2 text-right">{s.died24h} <span className="text-gray-400">({s.pct(s.died24h)}%)</span></td>
                        <td className={`px-3 py-2 text-right font-semibold ${rate > 5 ? "text-red-600" : rate > 2 ? "text-amber-600" : "text-green-700"}`}>{s.perinatal} ({s.pct(s.perinatal)}%)</td>
                        <td className="px-3 py-2 w-32">
                          <div className="h-3 bg-gray-100 rounded overflow-hidden">
                            <div className={`h-full rounded ${rate > 5 ? "bg-red-400" : rate > 2 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${barWidth}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-400">Red indicator &gt;5% perinatal loss · Amber 2–5% · Green &lt;2%. Red Tractor Sheep Assurance may query rates above 5%.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {records.length === 0 && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No lambing records yet. Add the first record above.</CardContent></Card>}
          {records.map(r => {
            const liveCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "live").length;
            const deadCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "stillborn" || o === "died-within-24h").length;
            const registeredCount = [r.lambAnimalId1, r.lambAnimalId2, r.lambAnimalId3, r.lambAnimalId4].filter(Boolean).length;
            const litterLabel = r.numberOfLambs === 1 ? "Single" : r.numberOfLambs === 2 ? "Twins" : r.numberOfLambs === 3 ? "Triplets" : "Quads";
            return (
              <Card key={r.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-sm">{formatDate(r.lambingDate)}</span>
                      {r.eweEarTag && <span className="text-sm text-gray-700 font-mono">Ewe: {r.eweEarTag}</span>}
                      <LambingEaseBadge v={r.lambingEaseScore} />
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{litterLabel} ({r.numberOfLambs})</span>
                      {liveCount > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{liveCount} live</span>}
                      {deadCount > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{deadCount} dead</span>}
                      {r.expectedLitterSize && r.expectedLitterSize !== r.numberOfLambs && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Scan: {r.expectedLitterSize} → Actual: {r.numberOfLambs}</span>
                      )}
                      {registeredCount > 0 && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">In Flock Register ✓ ×{registeredCount}</span>}
                      {r.fosteringRequired && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Fostered</span>}
                      {r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h"}
                        </span>
                      )}
                      {r.vetAttended && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{r.vetName ? `Vet: ${r.vetName}` : "Vet attended"}</span>}
                      {r.expectedLambingDate && (() => {
                        const days = Math.floor((new Date(r.expectedLambingDate).getTime() - Date.now()) / 86400000);
                        return <span className={`text-xs px-2 py-0.5 rounded border ${days >= 0 && days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>Expected: {formatDate(r.expectedLambingDate)}</span>;
                      })()}
                      {deadCount > 0 && (() => {
                        const hasDisposal = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod || r.perinatalDisposalContractorId;
                        return hasDisposal
                          ? <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded">Disposal recorded ✓</span>
                          : <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded">Disposal not recorded</span>;
                      })()}
                      {(lambingAttachMap[r.id] ?? 0) > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{lambingAttachMap[r.id]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => setConfirmDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Lambing Record — {viewRecord.eweEarTag || `Record #${viewRecord.id}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lambing Date</p><p className="font-medium">{formatDate(viewRecord.lambingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Lambing Date</p><p className="font-medium">{viewRecord.expectedLambingDate ? formatDate(viewRecord.expectedLambingDate) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ewe Ear Tag</p><p className="font-medium font-mono">{viewRecord.eweEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><p className="font-medium">{viewRecord.lambingEaseScore ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][viewRecord.lambingEaseScore] ?? viewRecord.lambingEaseScore : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Lambs</p><p className="font-medium">{viewRecord.numberOfLambs === 1 ? "Single" : viewRecord.numberOfLambs === 2 ? "Twins" : viewRecord.numberOfLambs === 3 ? "Triplets" : "Quads"} ({viewRecord.numberOfLambs})</p></div>
              {[1, 2, 3, 4].slice(0, viewRecord.numberOfLambs ?? 1).map(n => {
                const outcome = viewRecord[`lambOutcome${n}` as keyof LambingRecord] as string | null;
                const sex = viewRecord[`lambSex${n}` as keyof LambingRecord] as string | null;
                const tag = viewRecord[`lambEarTag${n}` as keyof LambingRecord] as string | null;
                const wt = viewRecord[`lambBirthWeightKg${n}` as keyof LambingRecord] as string | null;
                if (!outcome) return null;
                return (
                  <div key={n} className="col-span-2 bg-gray-50 rounded p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Lamb {n}</p>
                    <p className="text-sm">{outcome}{sex ? ` · ${sex}` : ""}{tag ? ` · Tag: ${tag}` : ""}{wt ? ` · ${wt} kg` : ""}</p>
                  </div>
                );
              })}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assistance Required</p><p className="font-medium">{viewRecord.assistanceRequired ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Attended</p><p className="font-medium">{viewRecord.vetAttended ? "Yes" : "No"}</p></div>
              {viewRecord.vetAttended && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{viewRecord.vetName || "—"}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fostering Required</p><p className="font-medium">{viewRecord.fosteringRequired ? "Yes" : "No"}</p></div>
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
              {(() => {
                const deadCount = [viewRecord.lambOutcome1, viewRecord.lambOutcome2, viewRecord.lambOutcome3, viewRecord.lambOutcome4].filter(o => o === "stillborn" || o === "died-within-24h").length;
                if (deadCount === 0) return null;
                const contractor = contractors.find(c => c.id === viewRecord.perinatalDisposalContractorId);
                const hasDisposal = viewRecord.perinatalCollectionDate || viewRecord.perinatalCollectionRef || viewRecord.perinatalDisposalMethod || viewRecord.perinatalDisposalContractorId;
                return (
                  <div className={`col-span-2 rounded-md border p-3 ${hasDisposal ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2 ${hasDisposal ? 'text-green-800' : 'text-red-700'}"
                      style={{ color: hasDisposal ? "#166534" : "#b91c1c" }}>
                      Perinatal Disposal ({deadCount} perinatal death{deadCount !== 1 ? "s" : ""})
                      {hasDisposal ? " ✓" : " — NOT YET RECORDED"}
                    </p>
                    {hasDisposal ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {contractor && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Contractor</p><p className="font-medium">{contractor.name} ({contractor.approvalNumber})</p></div>}
                        {viewRecord.perinatalCollectionDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{formatDate(viewRecord.perinatalCollectionDate)}</p></div>}
                        {viewRecord.perinatalCollectionRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Consignment / NFAS Ref</p><p className="font-medium font-mono">{viewRecord.perinatalCollectionRef}</p></div>}
                        {viewRecord.perinatalDisposalMethod && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Method</p><p className="font-medium">{viewRecord.perinatalDisposalMethod}</p></div>}
                        {viewRecord.perinatalDisposalNotes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Notes</p><p className="font-medium">{viewRecord.perinatalDisposalNotes}</p></div>}
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">Animal By-Products Regulations require disposal documentation for all perinatal deaths. Edit this record to add contractor collection details.</p>
                    )}
                  </div>
                );
              })()}
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="lambing" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Lambing Record"
        message="This will permanently remove this lambing record. Live lamb livestock register entries will be kept."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={() => confirmDelete !== null && del.mutate(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "68rem" }} className="max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Lambing Record" : "Add Lambing Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* Left column: ewe + event details */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Ewe details */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ewe Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Lambing Date *</Label>
                    <Input type="date" value={form.lambingDate?.slice(0, 10) || ""} onChange={e => set("lambingDate", e.target.value)} />
                  </div>
                  <div>
                    <Label>Expected Lambing Date</Label>
                    <Input type="date" value={form.expectedLambingDate?.slice(0, 10) || ""} onChange={e => set("expectedLambingDate", e.target.value || null)} />
                    <p className="text-xs text-muted-foreground mt-0.5">Set before birth to track in Week Ahead</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ewe Ear Tag</Label>
                    {ewes.length > 0 && !showManualEwe ? (
                      <Select
                        value={form.eweAnimalId ? String(form.eweAnimalId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__manual__") { setShowManualEwe(true); set("eweAnimalId", null); return; }
                          const a = ewes.find(x => x.id === parseInt(v));
                          set("eweAnimalId", v === "__none__" ? null : parseInt(v));
                          set("eweEarTag", a?.earTagNumber ?? null);
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select ewe..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {ewes.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.earTagNumber!}</SelectItem>)}
                          <SelectItem value="__manual__">Enter tag manually…</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input value={form.eweEarTag || ""} onChange={e => set("eweEarTag", e.target.value)} placeholder="Ewe ear tag" />
                        {ewes.length > 0 && <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualEwe(false); set("eweAnimalId", null); set("eweEarTag", null); }}>↩</Button>}
                      </div>
                    )}
                    {ewes.length === 0 && animalsQ.isSuccess && (
                      <p className="text-xs text-amber-600 mt-1">No sheep registered. Add animals in the Individual Animals tab, or enter the tag above.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Lambing Ease Score</Label>
                    <Select value={form.lambingEaseScore ? String(form.lambingEaseScore) : "__none__"} onValueChange={v => set("lambingEaseScore", v === "__none__" ? null : parseInt(v))}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not recorded</SelectItem>
                        <SelectItem value="1">1 — Unassisted</SelectItem>
                        <SelectItem value="2">2 — Easy assistance (1 person)</SelectItem>
                        <SelectItem value="3">3 — Hard assistance (ropes/snares)</SelectItem>
                        <SelectItem value="4">4 — Vet required / caesarean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Lambs Born *</Label>
                    <Select value={String(numLambs)} onValueChange={v => set("numberOfLambs", parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 — Single</SelectItem>
                        <SelectItem value="2">2 — Twins</SelectItem>
                        <SelectItem value="3">3 — Triplets</SelectItem>
                        <SelectItem value="4">4 — Quads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Expected Litter (from scan)</Label>
                    <Select value={form.expectedLitterSize ? String(form.expectedLitterSize) : "__none__"} onValueChange={v => set("expectedLitterSize", v === "__none__" ? null : parseInt(v))}>
                      <SelectTrigger><SelectValue placeholder="Not recorded" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not recorded / no scan</SelectItem>
                        <SelectItem value="1">1 — Single</SelectItem>
                        <SelectItem value="2">2 — Twins</SelectItem>
                        <SelectItem value="3">3 — Triplets</SelectItem>
                        <SelectItem value="4">4 — Quads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ewe Complications</Label>
                    <Input value={form.eweComplications || ""} onChange={e => set("eweComplications", e.target.value)} placeholder="e.g. prolapse, twin lamb disease" />
                  </div>
                </div>
              </div>

              {/* Lamb sections */}
              {([1, 2, 3, 4] as const).slice(0, numLambs).map(n => (
                <LambSection key={n} n={n} form={form} set={set} />
              ))}
            </div>

            {/* Right column: assistance, colostrum, fostering, ram, notes */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-3">
              {/* Assistance */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assistance & Vet</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ar-lamb" checked={!!form.assistanceRequired} onChange={e => { set("assistanceRequired", e.target.checked); if (!e.target.checked) set("assistanceType", null); }} className="rounded" />
                  <Label htmlFor="ar-lamb">Assistance required</Label>
                </div>
                {form.assistanceRequired && (
                  <div className="pl-6">
                    <Label>Type of Assistance</Label>
                    <Select value={form.assistanceType || "__none__"} onValueChange={v => set("assistanceType", v === "__none__" ? null : v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not specified</SelectItem>
                        <SelectItem value="manual-1-person">Manual — 1 person</SelectItem>
                        <SelectItem value="manual-2-person">Manual — 2 persons</SelectItem>
                        <SelectItem value="ropes-snares">Ropes / snares</SelectItem>
                        <SelectItem value="vet-assisted">Vet-assisted delivery</SelectItem>
                        <SelectItem value="caesarean">Caesarean section</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="va-lamb" checked={!!form.vetAttended} onChange={e => { set("vetAttended", e.target.checked); if (!e.target.checked) { set("vetName", null); setShowManualVet(false); } }} className="rounded" />
                  <Label htmlFor="va-lamb">Vet attended</Label>
                </div>
                {form.vetAttended && (
                  <div className="pl-6">
                    <Label>Vet Name</Label>
                    {uniqueVetNames.length > 0 && !showManualVet ? (
                      <Select value={form.vetName || "__none__"} onValueChange={v => { if (v === "__manual__") { setShowManualVet(true); set("vetName", null); return; } set("vetName", v === "__none__" ? null : v); }}>
                        <SelectTrigger><SelectValue placeholder="Select vet..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {uniqueVetNames.map(n => <SelectItem key={n} value={n}>{n}{vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""}</SelectItem>)}
                          <SelectItem value="__manual__">Enter name manually…</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Vet's full name" />
                        {uniqueVetNames.length > 0 && <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualVet(false); set("vetName", null); }}>↩</Button>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Colostrum */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colostrum Management</p>
                <p className="text-xs text-gray-400">Lambs should receive colostrum within 2 hours of birth. 50ml/kg is the target first feed.</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="col-lamb" checked={form.colostrumGivenWithin2Hours === true} onChange={e => set("colostrumGivenWithin2Hours", e.target.checked ? true : false)} className="rounded" />
                  <Label htmlFor="col-lamb">Colostrum given within 2 hours</Label>
                </div>
                <div>
                  <Label>Colostrum Source</Label>
                  <Select value={form.colostrumSource || "__none__"} onValueChange={v => set("colostrumSource", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Not recorded" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not recorded</SelectItem>
                      <SelectItem value="own-dam">Own dam (natural suck)</SelectItem>
                      <SelectItem value="other-ewe">Other ewe (bottle)</SelectItem>
                      <SelectItem value="frozen">Frozen colostrum</SelectItem>
                      <SelectItem value="supplement">Colostrum supplement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fostering */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fostering</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="foster-lamb" checked={!!form.fosteringRequired} onChange={e => { set("fosteringRequired", e.target.checked); if (!e.target.checked) set("fosteringDetails", null); }} className="rounded" />
                  <Label htmlFor="foster-lamb">Fostering required</Label>
                </div>
                {form.fosteringRequired && (
                  <div>
                    <Label>Fostering Details</Label>
                    <Textarea value={form.fosteringDetails || ""} onChange={e => set("fosteringDetails", e.target.value)} placeholder="e.g. Lamb 2 fostered onto ewe UK0141092 0301 — skin graft method used" rows={3} />
                  </div>
                )}
              </div>

              {/* Ram / Sire */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ram / Sire</p>
                <div>
                  <Label>Conception Method</Label>
                  <Select value={form.conceptionMethod || "__none__"} onValueChange={v => set("conceptionMethod", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Not recorded" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not recorded</SelectItem>
                      <SelectItem value="natural-service">Natural service</SelectItem>
                      <SelectItem value="ai">AI (artificial insemination)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ramSires.length > 0 ? (
                  <div>
                    <Label>Ram (from Sire Register)</Label>
                    <Select value={form.sireRegisterId ? String(form.sireRegisterId) : "__none__"} onValueChange={v => {
                      const sid = v === "__none__" ? null : parseInt(v);
                      const sr = ramSires.find(s => s.id === sid);
                      set("sireRegisterId", sid);
                      set("ramEarTag", sr?.tagNumber ?? null);
                      set("ramBreed", sr?.breed ?? null);
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select ram..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {ramSires.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}{s.breed ? ` (${s.breed})` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ram Ear Tag</Label>
                    <Input value={form.ramEarTag || ""} onChange={e => set("ramEarTag", e.target.value)} placeholder="Tag no." />
                  </div>
                  <div>
                    <Label>Ram Breed</Label>
                    <Input value={form.ramBreed || ""} onChange={e => set("ramBreed", e.target.value)} placeholder="e.g. Texel" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Any additional notes..." rows={3} />
              </div>
            </div>
          </div>

          {/* Perinatal disposal — shown when any lamb is stillborn or died-within-24h */}
          {hasDeadLambs && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 space-y-3 mt-2">
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Perinatal Disposal — Animal By-Products Requirement</p>
                <p className="text-xs text-amber-700 mt-1">Stillborn and died-within-24h lambs must be collected by a licensed fallen stock contractor or disposed of via another authorised route. The collection note / consignment reference must be retained for 3 years.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fallen Stock Contractor</Label>
                  {contractors.length > 0 ? (
                    <Select
                      value={form.perinatalDisposalContractorId ? String(form.perinatalDisposalContractorId) : "__none__"}
                      onValueChange={v => set("perinatalDisposalContractorId", v === "__none__" ? null : parseInt(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select contractor..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not yet collected</SelectItem>
                        {contractors.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.approvalNumber})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1 border border-amber-200 rounded p-2 bg-white">No fallen stock contractors registered. Add one in the Fallen Stock Contractors tab, then return here to link them.</p>
                  )}
                </div>
                <div>
                  <Label>Collection Date</Label>
                  <Input type="date" value={form.perinatalCollectionDate?.slice(0, 10) || ""} onChange={e => set("perinatalCollectionDate", e.target.value || null)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Consignment / NFAS Ref</Label>
                  <Input value={form.perinatalCollectionRef || ""} onChange={e => set("perinatalCollectionRef", e.target.value || null)} placeholder="e.g. NFAS-LIN-0042-240317" />
                  <p className="text-xs text-gray-500 mt-0.5">Collection note or NFAS certificate reference</p>
                </div>
                <div>
                  <Label>Disposal Method (if no contractor)</Label>
                  <Input value={form.perinatalDisposalMethod || ""} onChange={e => set("perinatalDisposalMethod", e.target.value || null)} placeholder="e.g. Hunt kennels, on-farm incinerator" />
                </div>
              </div>
              <div>
                <Label>Disposal Notes</Label>
                <Input value={form.perinatalDisposalNotes || ""} onChange={e => set("perinatalDisposalNotes", e.target.value || null)} placeholder="Any additional disposal details..." />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled={save.isPending || !form.lambingDate} onClick={() => save.mutate(form)}>
              {save.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saving…</> : editing ? "Save Changes" : "Add Lambing Record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TB Test Register ──────────────────────────────────────────────────────────

interface TbTest { id: number; farmId: number; testDate: string; readingDate: string | null; testType: string; species: string; herdFlockRef: string | null; herdId: number | null; animalsTested: number | null; animalEarTags: string | null; reactors: number; inconclusives: number; outcome: string; aphaOfficer: string | null; aphaCaseRef: string | null; movementRestriction: boolean; restrictionLiftedDate: string | null; nextTestDueDate: string | null; testingVet: string | null; documentUrl: string | null; documentName: string | null; documentPath: string | null; movementId: number | null; notes: string | null; }

const EMPTY_TB: Omit<TbTest, "id" | "farmId"> = { testDate: "", readingDate: null, testType: "routine-skin", species: "cattle", herdFlockRef: null, herdId: null, animalsTested: null, animalEarTags: null, reactors: 0, inconclusives: 0, outcome: "clear", aphaOfficer: null, aphaCaseRef: null, movementRestriction: false, restrictionLiftedDate: null, nextTestDueDate: null, testingVet: null, documentUrl: null, documentName: null, documentPath: null, movementId: null, notes: null };

export function TbTestsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}/tb-tests`;
  const { data, isLoading } = useQuery<{ records: TbTest[] }>({ queryKey: ["tb-tests", farmId], queryFn: () => fetch(base).then(r => r.json()) });
  const records = data?.records ?? [];

  const { data: herdsData } = useQuery<{ records: { id: number; name: string; type: string; herdNumber: string | null }[] }>({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()) });
  const herds = herdsData?.records ?? [];

  const vetNames = [...new Set(records.map(r => r.testingVet).filter((v): v is string => !!v))];

  const outMovQ = useQuery<{ records: { id: number; movementType: string; movementDate: string; numberOfAnimals: number | null; species: string | null; fromLocation: string | null; toLocation: string | null; licenceNumber: string | null }[] }>({ queryKey: ["outgoing-movements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-movements/outgoing`).then(r => r.json()), enabled: !!farmId });
  const outgoingMovements = outMovQ.data?.records ?? [];

  const { uploadFile, isUploading: isUploadingDoc } = useUpload();
  const [pendingDoc, setPendingDoc] = useState<{ path: string; name: string } | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [viewItem, setViewItem] = useState<TbTest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TbTest | null>(null);
  const [form, setForm] = useState<typeof EMPTY_TB>({ ...EMPTY_TB });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const createMut = useMutation({ mutationFn: (b: typeof EMPTY_TB) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["tb-tests", farmId] }); setShowForm(false); setForm({ ...EMPTY_TB }); } });
  const updateMut = useMutation({ mutationFn: (b: typeof EMPTY_TB & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["tb-tests", farmId] }); setShowForm(false); setEditing(null); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["tb-tests", farmId] }); setDeleteId(null); } });

  function openEdit(r: TbTest) { setEditing(r); setPendingDoc(null); setForm({ testDate: r.testDate, readingDate: r.readingDate ?? null, testType: r.testType, species: r.species, herdFlockRef: r.herdFlockRef ?? null, herdId: r.herdId ?? null, animalsTested: r.animalsTested, animalEarTags: r.animalEarTags ?? null, reactors: r.reactors, inconclusives: r.inconclusives, outcome: r.outcome, aphaOfficer: r.aphaOfficer ?? null, aphaCaseRef: r.aphaCaseRef ?? null, movementRestriction: r.movementRestriction, restrictionLiftedDate: r.restrictionLiftedDate ?? null, nextTestDueDate: r.nextTestDueDate ?? null, testingVet: r.testingVet ?? null, documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, documentPath: r.documentPath ?? null, movementId: r.movementId ?? null, notes: r.notes ?? null }); setShowForm(true); }

  function printReport() {
    const rows = records.map(r => `<tr><td>${formatDate(r.testDate)}</td><td>${r.testType.replace(/-/g," ")}</td><td>${r.species}</td><td>${r.herdFlockRef ?? "—"}</td><td>${r.animalsTested ?? "—"}</td><td>${r.reactors}</td><td>${r.inconclusives}</td><td>${r.outcome.toUpperCase()}</td><td>${r.movementRestriction ? "YES" : "No"}</td><td>${formatDate(r.nextTestDueDate)}</td><td style="text-align:center;color:${r.movementId ? "#166534" : "#9ca3af"};font-weight:${r.movementId ? "700" : "400"}">${r.movementId ? "✓ Linked" : "—"}</td></tr>`).join("");
    printProReport({ title: "TB Test Register", subtitle: `${records.length} test records`, tableHtml: `<table><thead><tr><th>Test Date</th><th>Test Type</th><th>Species</th><th>Herd/Flock</th><th>Tested</th><th>Reactors</th><th>Inconc.</th><th>Outcome</th><th>Restriction</th><th>Next Due</th><th>Movement Linked</th></tr></thead><tbody>${rows}</tbody></table>` });
  }


  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">TB Test Register</h3>
          <p className="text-sm text-gray-500 mt-0.5">Official bovine tuberculosis test records as required under TB (England) Order 2021 and Red Tractor standards.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Report</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY_TB }); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Log TB Test</Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Red Tractor Requirement:</strong> All bovine TB test results must be recorded with test date, reading date, number tested, reactors, inconclusives and outcome. Movement restrictions must be noted where applicable.
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        : records.length === 0 ? <Card><CardContent className="py-16 text-center"><AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="font-medium text-gray-700 mb-1">No TB tests recorded</p><p className="text-sm text-muted-foreground">Log your first bovine TB test result to start your register.</p></CardContent></Card>
        : <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Injection / Reading</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Species</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Herd/Flock</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tested</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Reactors</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next Due</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{formatDate(r.testDate)}</div>
                      {r.readingDate
                        ? <div className="text-xs text-muted-foreground mt-0.5">Reading: {formatDate(r.readingDate)}</div>
                        : <div className="text-xs text-amber-600 font-semibold mt-0.5">⏳ Reading pending</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                      <div>{r.testType.replace(/-/g," ")}</div>
                      {r.movementId && <span className="text-xs font-semibold rounded px-1 py-0.5" style={{ fontSize: "0.65rem", background: "#dcfce7", color: "#166534" }}>Movement</span>}
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">{r.species}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.herdFlockRef ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{r.animalsTested ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{r.reactors > 0 ? <span className="text-red-600">{r.reactors}</span> : r.reactors}</td>
                    <td className="px-4 py-3"><span className={`inline-flex text-xs font-semibold rounded-full px-2 py-0.5 ${OUTCOME_COLOURS[r.outcome] ?? "bg-gray-100 text-gray-700"}`}>{r.outcome.toUpperCase()}</span>{r.movementRestriction && <span className="ml-1 text-xs text-red-600 font-semibold">⚠ Restricted</span>}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(r.nextTestDueDate)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewItem(r)} title="View"><Eye className="h-3 w-3 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>TB Test — {formatDate(viewItem.testDate)}</DialogTitle><DialogDescription>{viewItem.species} · {viewItem.testType.replace(/-/g," ")}</DialogDescription></DialogHeader>
            <div className="flex items-center gap-2 mt-1 mb-2">
              {viewItem.readingDate
                ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">✓ Both stages complete</span>
                : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">⏳ Stage 1 done — Reading pending</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stage 1 — Injection</p><p className="font-medium">{formatDate(viewItem.testDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stage 2 — Reading (72 h)</p><p className="font-medium">{viewItem.readingDate ? formatDate(viewItem.readingDate) : <span className="text-amber-600">Pending</span>}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Type</p><p className="font-medium capitalize">{viewItem.testType.replace(/-/g," ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium capitalize">{viewItem.species}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock Ref</p><p className="font-medium">{viewItem.herdFlockRef ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animals Tested</p><p className="font-medium">{viewItem.animalsTested ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reactors</p><p className="font-semibold text-red-600">{viewItem.reactors}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inconclusives</p><p className="font-medium">{viewItem.inconclusives}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-semibold uppercase">{viewItem.outcome}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Movement Restriction</p><p className={viewItem.movementRestriction ? "font-semibold text-red-600" : ""}>{viewItem.movementRestriction ? "YES — Restricted" : "No"}</p></div>
              {viewItem.restrictionLiftedDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Restriction Lifted</p><p className="font-medium">{formatDate(viewItem.restrictionLiftedDate)}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">{formatDate(viewItem.nextTestDueDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Testing Vet</p><p className="font-medium">{viewItem.testingVet ?? "—"}</p></div>
              {viewItem.aphaOfficer && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">APHA Officer</p><p className="font-medium">{viewItem.aphaOfficer}</p></div>}
              {viewItem.aphaCaseRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">APHA Case Ref</p><p className="font-medium font-mono">{viewItem.aphaCaseRef}</p></div>}
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="whitespace-pre-line">{viewItem.notes}</p></div>}
              {(viewItem.documentName || viewItem.documentPath) && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Document</p><a href={viewItem.documentPath ? `/api/storage${viewItem.documentPath}` : (viewItem.documentUrl ?? "#")} target="_blank" rel="noreferrer" className="text-primary text-xs underline">{viewItem.documentName || "View Document"}</a></div>}
              {viewItem.animalEarTags && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Ear Tags ({viewItem.animalEarTags.split("\n").filter(t => t.trim()).length})</p><pre className="text-xs font-mono bg-muted rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap">{viewItem.animalEarTags}</pre></div>}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Linked Movement Record</p>
                {viewItem.movementId
                  ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 mt-0.5">✓ Movement #{viewItem.movementId} linked — pre/post-movement audit trail complete</span>
                  : <span className="text-sm text-muted-foreground">{(viewItem.testType === "pre-movement" || viewItem.testType === "post-movement") ? <span className="text-amber-700 font-medium">Not yet linked — edit this record to link the corresponding off-farm movement</span> : "Not linked (optional for routine tests)"}</span>}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit TB Test Record" : "Log TB Test"}</DialogTitle><DialogDescription>Record bovine TB test results as required by APHA and Red Tractor standards.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div><Label>Test Date *</Label><Input type="date" value={form.testDate ?? ""} onChange={e => setF("testDate", e.target.value)} /></div>
              <div><Label>Reading Date</Label><Input type="date" value={form.readingDate ?? ""} onChange={e => setF("readingDate", e.target.value || null)} /></div>
              <div><Label>Test Type *</Label>
                <Select value={form.testType} onValueChange={v => setF("testType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine-skin">Routine Skin Test</SelectItem>
                    <SelectItem value="short-interval">Short Interval Test (SIT)</SelectItem>
                    <SelectItem value="check-test">Check Test</SelectItem>
                    <SelectItem value="gamma-interferon">Gamma Interferon Blood Test</SelectItem>
                    <SelectItem value="pre-movement">Pre-movement Test (PMT)</SelectItem>
                    <SelectItem value="post-movement">Post-movement Test</SelectItem>
                    <SelectItem value="new-herd">New Herd Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Species *</Label>
                <Select value={form.species} onValueChange={v => setF("species", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="deer">Deer</SelectItem>
                    <SelectItem value="camelids">Camelids / Llamas</SelectItem>
                    <SelectItem value="goats">Goats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Herd / Flock</Label>
                {herds.length > 0 ? (
                  <Select value={form.herdId ? String(form.herdId) : "__manual"} onValueChange={v => { if (v === "__manual") { setF("herdId", null); } else { const h = herds.find(h => h.id === Number(v)); setF("herdId", Number(v)); if (h) setF("herdFlockRef", h.herdNumber || h.name); } }}>
                    <SelectTrigger><SelectValue placeholder="Select herd…" /></SelectTrigger>
                    <SelectContent>
                      {herds.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}{h.herdNumber ? ` (${h.herdNumber})` : ""}</SelectItem>)}
                      <SelectItem value="__manual">Enter manually…</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.herdFlockRef ?? ""} onChange={e => setF("herdFlockRef", e.target.value || null)} placeholder="CPH / herd name" />
                )}
                {form.herdId === null && herds.length > 0 && (
                  <Input className="mt-1" value={form.herdFlockRef ?? ""} onChange={e => setF("herdFlockRef", e.target.value || null)} placeholder="Herd / flock number or name" />
                )}
              </div>
              <div><Label>Animals Tested</Label><Input type="number" min={0} value={form.animalsTested ?? ""} onChange={e => setF("animalsTested", e.target.value ? Number(e.target.value) : null)} placeholder={form.animalEarTags ? String((form.animalEarTags.split("\n").filter(t => t.trim()).length)) : ""} /></div>
              <div className="col-span-2">
                <Label>Animal Ear Tags <span className="text-muted-foreground font-normal">(one per line — count auto-fills Animals Tested)</span></Label>
                <Textarea
                  rows={4}
                  value={form.animalEarTags ?? ""}
                  onChange={e => {
                    const raw = e.target.value || null;
                    setF("animalEarTags", raw);
                    const count = raw ? raw.split("\n").filter(t => t.trim()).length : null;
                    if (count) setF("animalsTested", count);
                  }}
                  placeholder={"UK123456789012\nUK123456789013\n…"}
                  className="font-mono text-xs"
                />
              </div>
              <div><Label>Reactors</Label><Input type="number" min={0} value={form.reactors} onChange={e => setF("reactors", Number(e.target.value))} /></div>
              <div><Label>Inconclusives</Label><Input type="number" min={0} value={form.inconclusives} onChange={e => setF("inconclusives", Number(e.target.value))} /></div>
              <div className="col-span-2"><Label>Outcome *</Label>
                <Select value={form.outcome} onValueChange={v => setF("outcome", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear — All animals negative</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive — Some reactors inconclusive</SelectItem>
                    <SelectItem value="restricted">Restricted — Movement restriction imposed</SelectItem>
                    <SelectItem value="breakdown">Breakdown — TB confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="tbRestriction" checked={form.movementRestriction} onChange={e => setF("movementRestriction", e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="tbRestriction">Movement restriction currently in place</Label>
              </div>
              {form.movementRestriction && <div><Label>Restriction Lifted Date</Label><Input type="date" value={form.restrictionLiftedDate ?? ""} onChange={e => setF("restrictionLiftedDate", e.target.value || null)} /></div>}
              <div><Label>Next Test Due Date</Label><Input type="date" value={form.nextTestDueDate ?? ""} onChange={e => setF("nextTestDueDate", e.target.value || null)} /></div>
              <div><Label>Testing Vet</Label>
                <Input list="tb-vet-list" value={form.testingVet ?? ""} onChange={e => setF("testingVet", e.target.value || null)} placeholder="Veterinary surgeon name" />
                <datalist id="tb-vet-list">{vetNames.map(v => <option key={v} value={v} />)}</datalist>
              </div>
              <div><Label>APHA Officer</Label><Input value={form.aphaOfficer ?? ""} onChange={e => setF("aphaOfficer", e.target.value || null)} /></div>
              <div><Label>APHA Case Reference</Label><Input value={form.aphaCaseRef ?? ""} onChange={e => setF("aphaCaseRef", e.target.value || null)} className="font-mono" /></div>
              <div className="col-span-2">
                <Label>Test Document</Label>
                <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const upload = await uploadFile(file);
                  if (upload?.objectPath) { setPendingDoc({ path: upload.objectPath, name: file.name }); setF("documentPath", upload.objectPath); setF("documentName", file.name); }
                  if (docInputRef.current) docInputRef.current.value = "";
                }} />
                {(pendingDoc || form.documentPath || form.documentName) ? (
                  <div className="flex items-center gap-2 mt-1 p-2 border rounded text-sm">
                    <span className="text-muted-foreground">📎</span>
                    {form.documentPath ? (
                      <a href={`/api/storage${form.documentPath}`} target="_blank" rel="noreferrer" className="text-primary underline truncate flex-1">{form.documentName || "Document"}</a>
                    ) : (
                      <span className="truncate flex-1">{form.documentName || "Document"}</span>
                    )}
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPendingDoc(null); setF("documentPath", null); setF("documentName", null); }}>×</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => docInputRef.current?.click()} disabled={isUploadingDoc}>
                    {isUploadingDoc ? "Uploading…" : "Upload Document (PDF / image)"}
                  </Button>
                )}
              </div>
              <div className="col-span-2">
                  <Label>Link to Livestock Movement Record <span className="font-normal text-muted-foreground text-xs">{(form.testType === "pre-movement" || form.testType === "post-movement") ? "(required for pre/post-movement tests)" : "(optional)"}</span></Label>
                  <select
                    value={form.movementId ?? ""}
                    onChange={e => setF("movementId", e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— Not linked to a movement record —</option>
                    {outgoingMovements.map((m) => (
                      <option key={m.id} value={m.id}>
                        {new Date(m.movementDate).toLocaleDateString("en-GB")} · {m.movementType.toUpperCase()} · {m.species ?? "Unknown"} · {m.numberOfAnimals ?? "?"} head {m.toLocation ? `→ ${m.toLocation}` : ""} {m.licenceNumber ? `[${m.licenceNumber}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.testDate || !form.outcome || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update" : "Log TB Test"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && <ConfirmDialog open title="Delete TB Test Record?" message="This record will be permanently removed from your TB register." onConfirm={() => deleteMut.mutate(deleteId!)} onCancel={() => setDeleteId(null)} confirmLabel="Delete" confirmVariant="destructive" />}
    </>
  );
}

// ─── Welfare Outcome Assessment ────────────────────────────────────────────────

interface WelfareOutcomeRecord {
  id: number; farmId: number; assessmentDate: string;
  assessorName: string; assessorRole: string | null;
  assessorType: string;
  assessorMemberId: number | null; assessorSupplierId: number | null;
  expectedFeeAmountPence: number | null; purchaseOrderId: number | null;
  species: string; herdFlockRef: string | null; sampleSize: number | null;
  lamenessScore: string | null; bodyConditionScore: string | null;
  dungScore: string | null; skinLesionScore: string | null;
  nasalDischargeScore: string | null; eyeDischargeScore: string | null;
  mortalityRate: string | null; calvingLambingScore: string | null;
  dagScore: string | null; tailBitingScore: string | null; snoutRootingScore: string | null;
  featherCoverageScore: string | null; footpadDermatitisScore: string | null;
  hockBurnScore: string | null; culledBirdsRate: string | null;
  stockingDensityCompliant: string | null;
  overallOutcome: string; correctiveActions: string | null;
  targetDate: string | null; nextAssessmentDue: string | null;
  documentUrl: string | null; documentName: string | null; documentPath: string | null;
  notes: string | null;
}

const EMPTY_WOA: Omit<WelfareOutcomeRecord, "id" | "farmId"> = {
  assessmentDate: "", assessorName: "", assessorRole: null,
  assessorType: "external", assessorMemberId: null, assessorSupplierId: null,
  expectedFeeAmountPence: null, purchaseOrderId: null,
  species: "", herdFlockRef: null, sampleSize: null,
  lamenessScore: null, bodyConditionScore: null, dungScore: null,
  skinLesionScore: null, nasalDischargeScore: null, eyeDischargeScore: null,
  mortalityRate: null, calvingLambingScore: null,
  dagScore: null, tailBitingScore: null, snoutRootingScore: null,
  featherCoverageScore: null, footpadDermatitisScore: null,
  hockBurnScore: null, culledBirdsRate: null, stockingDensityCompliant: null,
  overallOutcome: "acceptable", correctiveActions: null,
  targetDate: null, nextAssessmentDue: null,
  documentUrl: null, documentName: null, documentPath: null, notes: null,
};

interface WalkThroughForm {
  observedBy: string; observerMemberId: number | null; assessmentDate: string; sampleSize: number | null;
  lamenessAffected: number | null; lamenessTotal: number | null;
  bcsAffected: number | null; bcsTotal: number | null;
  dungAffected: number | null; dungTotal: number | null;
  skinLesionAffected: number | null; skinLesionTotal: number | null;
  nasalDischargeAffected: number | null; nasalDischargeTotal: number | null;
  eyeDischargeAffected: number | null; eyeDischargeTotal: number | null;
  calvingLambingAffected: number | null; calvingLambingTotal: number | null;
  dagAffected: number | null; dagTotal: number | null;
  tailBitingAffected: number | null; tailBitingTotal: number | null;
  snoutRootingAffected: number | null; snoutRootingTotal: number | null;
  featherCoverageAffected: number | null; featherCoverageTotal: number | null;
  footpadDermatitisAffected: number | null; footpadDermatitisTotal: number | null;
  hockBurnAffected: number | null; hockBurnTotal: number | null;
  culledBirdsAffected: number | null; culledBirdsTotal: number | null;
  walkthroughNotes: string; weatherConditions: string;
}
const EMPTY_WALKTHROUGH: WalkThroughForm = {
  observedBy: "", observerMemberId: null, assessmentDate: "", sampleSize: null,
  lamenessAffected: null, lamenessTotal: null, bcsAffected: null, bcsTotal: null,
  dungAffected: null, dungTotal: null, skinLesionAffected: null, skinLesionTotal: null,
  nasalDischargeAffected: null, nasalDischargeTotal: null, eyeDischargeAffected: null, eyeDischargeTotal: null,
  calvingLambingAffected: null, calvingLambingTotal: null,
  dagAffected: null, dagTotal: null, tailBitingAffected: null, tailBitingTotal: null,
  snoutRootingAffected: null, snoutRootingTotal: null, featherCoverageAffected: null, featherCoverageTotal: null,
  footpadDermatitisAffected: null, footpadDermatitisTotal: null, hockBurnAffected: null, hockBurnTotal: null,
  culledBirdsAffected: null, culledBirdsTotal: null,
  walkthroughNotes: "", weatherConditions: "",
};

type SpeciesMeasure = { key: keyof typeof EMPTY_WOA; label: string; placeholder: string; isSelect?: boolean; options?: { value: string; label: string }[] };
function getSpeciesMeasures(species: string): SpeciesMeasure[] {
  const common: SpeciesMeasure[] = [
    { key: "lamenessScore", label: "Lameness (%)", placeholder: "% animals lame" },
    { key: "bodyConditionScore", label: "Body Condition (%)", placeholder: "% thin animals" },
    { key: "skinLesionScore", label: "Skin Lesions (%)", placeholder: "% with injuries" },
    { key: "nasalDischargeScore", label: "Nasal Discharge (%)", placeholder: "% respiratory signs" },
    { key: "eyeDischargeScore", label: "Eye Discharge (%)", placeholder: "% with eye issues" },
  ];
  if (species === "cattle" || species === "beef-cattle") return [
    ...common,
    { key: "dungScore", label: "Dung Score (%)", placeholder: "% dirty hindquarters" },
  ];
  if (species === "sheep") return [
    ...common,
    { key: "dagScore", label: "Dag / Fleece Score (%)", placeholder: "% with dirty fleece or dag" },
  ];
  if (species === "pigs") return [
    { key: "lamenessScore", label: "Lameness (%)", placeholder: "% animals lame" },
    { key: "bodyConditionScore", label: "Body Condition (%)", placeholder: "% thin sows (BCS <2)" },
    { key: "tailBitingScore", label: "Tail Biting / Wounds (%)", placeholder: "% with tail wounds" },
    { key: "snoutRootingScore", label: "Snout Damage (%)", placeholder: "% with snout lesions" },
    { key: "skinLesionScore", label: "Fight Wounds / Skin Lesions (%)", placeholder: "% with skin injuries" },
  ];
  if (species === "poultry") return [
    { key: "featherCoverageScore", label: "Feather Coverage (%)", placeholder: "% with poor feathering (score 3–4)" },
    { key: "footpadDermatitisScore", label: "Footpad Dermatitis (%)", placeholder: "% with FPD score ≥2" },
    { key: "hockBurnScore", label: "Hock Burn (%)", placeholder: "% with hock burn score ≥2" },
    { key: "culledBirdsRate", label: "Culled / Rejected Birds (%)", placeholder: "% culled or rejected at processing" },
    { key: "stockingDensityCompliant", label: "Stocking Density", placeholder: "", isSelect: true, options: [
      { value: "yes", label: "Yes — within legal maximum" },
      { value: "no", label: "No — exceeds legal maximum" },
      { value: "not_checked", label: "Not checked this assessment" },
    ]},
  ];
  return common;
}

type WalkCriterion = { label: string; affKey: keyof WalkThroughForm; totKey: keyof WalkThroughForm; resultKey: keyof typeof EMPTY_WOA };
function getWalkthroughCriteria(species: string): WalkCriterion[] {
  const base: WalkCriterion[] = [
    { label: "Lame animals", affKey: "lamenessAffected", totKey: "lamenessTotal", resultKey: "lamenessScore" },
    { label: "Thin / poor BCS", affKey: "bcsAffected", totKey: "bcsTotal", resultKey: "bodyConditionScore" },
    { label: "Skin lesions / injuries", affKey: "skinLesionAffected", totKey: "skinLesionTotal", resultKey: "skinLesionScore" },
    { label: "Nasal discharge", affKey: "nasalDischargeAffected", totKey: "nasalDischargeTotal", resultKey: "nasalDischargeScore" },
    { label: "Eye discharge", affKey: "eyeDischargeAffected", totKey: "eyeDischargeTotal", resultKey: "eyeDischargeScore" },
  ];
  if (species === "cattle" || species === "beef-cattle") return [...base,
    { label: "Dirty hindquarters", affKey: "dungAffected", totKey: "dungTotal", resultKey: "dungScore" },
  ];
  if (species === "sheep") return [...base,
    { label: "Dag / dirty fleece", affKey: "dagAffected", totKey: "dagTotal", resultKey: "dagScore" },
  ];
  if (species === "pigs") return [
    { label: "Lame animals", affKey: "lamenessAffected", totKey: "lamenessTotal", resultKey: "lamenessScore" },
    { label: "Thin / poor BCS (<2)", affKey: "bcsAffected", totKey: "bcsTotal", resultKey: "bodyConditionScore" },
    { label: "Tail biting / wounds", affKey: "tailBitingAffected", totKey: "tailBitingTotal", resultKey: "tailBitingScore" },
    { label: "Snout damage", affKey: "snoutRootingAffected", totKey: "snoutRootingTotal", resultKey: "snoutRootingScore" },
    { label: "Skin lesions / fight wounds", affKey: "skinLesionAffected", totKey: "skinLesionTotal", resultKey: "skinLesionScore" },
  ];
  if (species === "poultry") return [
    { label: "Poor feather coverage", affKey: "featherCoverageAffected", totKey: "featherCoverageTotal", resultKey: "featherCoverageScore" },
    { label: "Footpad dermatitis (≥2)", affKey: "footpadDermatitisAffected", totKey: "footpadDermatitisTotal", resultKey: "footpadDermatitisScore" },
    { label: "Hock burn (≥2)", affKey: "hockBurnAffected", totKey: "hockBurnTotal", resultKey: "hockBurnScore" },
    { label: "Culled / rejected birds", affKey: "culledBirdsAffected", totKey: "culledBirdsTotal", resultKey: "culledBirdsRate" },
  ];
  return base;
}

function calcPct(aff: number | null, tot: number | null): string | null {
  if (aff == null || tot == null || tot === 0) return null;
  return ((aff / tot) * 100).toFixed(1);
}

export function WelfareOutcomeSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}/welfare-outcome-assessments`;
  const { data, isLoading } = useQuery<{ records: WelfareOutcomeRecord[] }>({ queryKey: ["welfare-outcomes", farmId], queryFn: () => fetch(base).then(r => r.json()) });
  const records = data?.records ?? [];

  const { data: herdsData } = useQuery<{ records: { id: number; name: string; type: string; productionType: string | null; herdNumber: string | null }[] }>({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()) });
  const herds = herdsData?.records ?? [];

  const { data: membersData } = useFarmMembers(farmId);
  const members = (membersData?.members ?? []).filter(m => m.isActive);

  const { data: suppliersData } = useQuery<{ records: { id: number; name: string; contactName: string | null; phone: string | null; supplierType: string }[] }>({
    queryKey: ["woa-suppliers", farmId], queryFn: () => fetch(`/api/farms/${farmId}/woa-suppliers`).then(r => r.json()),
  });
  const suppliers = suppliersData?.records ?? [];

  const { uploadFile: uploadWoaDoc, isUploading: isUploadingWoaDoc } = useUpload();
  const [pendingWoaDoc, setPendingWoaDoc] = useState<{ path: string; name: string } | null>(null);
  const woaDocRef = useRef<HTMLInputElement>(null);

  const [viewItem, setViewItem] = useState<WelfareOutcomeRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WelfareOutcomeRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_WOA>({ ...EMPTY_WOA });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedHerdId, setSelectedHerdId] = useState<number | null>(null);
  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // Walkthrough tally dialog (inline, pre-fills form fields when applied)
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [wt, setWt] = useState<WalkThroughForm>({ ...EMPTY_WALKTHROUGH });
  const setW = (k: string, v: unknown) => setWt(w => ({ ...w, [k]: v }));

  // Fee display — kept as a raw string so the input is never rewritten mid-type.
  // form.expectedFeeAmountPence is updated in parallel (for the PO notice condition)
  // but is NOT used as the input value to avoid the pence↔pounds conversion jitter.
  const [feeInputStr, setFeeInputStr] = useState<string>("");

  // Auto-calc: fetch mortality rate + calving/lambing score when a herd is selected
  const { data: autoCalc } = useQuery<{ mortalityRate: string | null; calvingLambingScore: string | null; herdSize: number; deathCount: number }>({
    queryKey: ["woa-auto-calc", farmId, selectedHerdId, form.species],
    queryFn: () => fetch(`/api/farms/${farmId}/woa-auto-calc?herdId=${selectedHerdId}&species=${form.species}`).then(r => r.json()),
    enabled: selectedHerdId !== null && showForm,
    staleTime: 60_000,
  });

  /**
   * Returns true when a registered herd should appear in the WOA herd dropdown
   * for the given WOA species selection.
   *
   * Uses the explicit `productionType` field when set for precise filtering
   * (e.g. a Dairy WOA will NOT show a herd whose productionType is "beef").
   * Falls back to inferring from the herd type string for legacy records.
   * A herd with no production type specified always shows for any matching species.
   */
  function woaSpeciesMatchesHerdType(woaSpecies: string, herdType: string, productionType?: string | null): boolean {
    const s = woaSpecies.toLowerCase();
    const t = herdType.toLowerCase();

    if (s === "cattle" || s === "beef-cattle") {
      // First: check the canonical species matches cattle
      const isCattleHerd = canonicalHerdSpecies(t) === "cattle";
      if (!isCattleHerd) return false;

      const p = (productionType ?? "").toLowerCase().trim();
      if (p) {
        // Explicit production type set — filter precisely
        const pIsBeef = p === "beef" || p === "suckler";
        const pIsDairy = p === "dairy";
        const pIsMixed = p === "mixed" || p === "mixed (beef & dairy)";
        if (s === "cattle")       return pIsDairy || pIsMixed || (!pIsBeef && !pIsDairy); // Dairy WOA
        if (s === "beef-cattle")  return pIsBeef  || pIsMixed || (!pIsBeef && !pIsDairy); // Beef WOA
      }
      // No explicit production type — fall back to type-string inference for legacy data
      const typeIsOnlyDairy = t.includes("dairy") && !t.includes("beef") && !t.includes("suckler");
      const typeIsOnlyBeef  = (t.includes("beef") || t.includes("suckler")) && !t.includes("dairy");
      if (typeIsOnlyDairy) return s === "cattle";       // explicitly dairy-only → Dairy WOA only
      if (typeIsOnlyBeef)  return s === "beef-cattle";  // explicitly beef-only → Beef WOA only
      return true; // generic cattle → matches both Dairy and Beef WOA
    }

    if (s === "sheep")   return canonicalHerdSpecies(t) === "sheep";
    if (s === "pigs")    return canonicalHerdSpecies(t) === "pigs";
    if (s === "poultry") return canonicalHerdSpecies(t) === "poultry";
    if (s === "goats")   return canonicalHerdSpecies(t) === "goats";
    return canonicalHerdSpecies(t) === s;
  }
  const filteredHerds = herds.filter(h => woaSpeciesMatchesHerdType(form.species, h.type, h.productionType));
  // When no herds match the species (fallback to all herds), any selection is valid.
  const herdPool = filteredHerds.length > 0 ? filteredHerds : herds;
  const currentHerdStillValid = !form.herdFlockRef || herdPool.some(h => h.name === form.herdFlockRef);

  const createMut = useMutation({ mutationFn: (b: typeof EMPTY_WOA) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); setShowForm(false); setForm({ ...EMPTY_WOA }); setPendingWoaDoc(null); setFeeInputStr(""); } });
  const updateMut = useMutation({ mutationFn: (b: typeof EMPTY_WOA & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); setShowForm(false); setEditing(null); setPendingWoaDoc(null); setFeeInputStr(""); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); setDeleteId(null); } });
  const walkthroughMut = useMutation({
    mutationFn: (b: WalkThroughForm & { woaId: number | null; species: string; herdFlockRef: string | null }) =>
      fetch(`/api/farms/${farmId}/woa-walkthrough`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] }); },
  });

  const activeWoaId = viewItem?.id ?? editing?.id ?? null;
  const { data: linkedWalkthroughsData } = useQuery<{ records: Array<{ id: number; assessmentDate: string; observedBy: string; sampleSize: number | null; walkthroughNotes: string | null; weatherConditions: string | null; appliedToWoa: boolean; createdAt: string }> }>({
    queryKey: ["woa-walkthroughs", farmId, activeWoaId],
    queryFn: () => fetch(`/api/farms/${farmId}/woa-walkthrough?woaId=${activeWoaId}`).then(r => r.json()),
    enabled: activeWoaId !== null,
  });
  const linkedWalkthroughs = linkedWalkthroughsData?.records ?? [];

  const applyWalkthroughMut = useMutation({
    mutationFn: (wtId: number) => fetch(`/api/farms/${farmId}/woa-walkthrough/${wtId}/apply`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] }); },
  });

  const deleteWalkthroughMut = useMutation({
    mutationFn: (wtId: number) => fetch(`/api/farms/${farmId}/woa-walkthrough/${wtId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] }); },
  });

  function openEdit(r: WelfareOutcomeRecord) {
    setEditing(r); setPendingWoaDoc(null);
    setFeeInputStr(r.expectedFeeAmountPence != null ? (r.expectedFeeAmountPence / 100).toString() : "");
    setForm({
      assessmentDate: r.assessmentDate, assessorName: r.assessorName, assessorRole: r.assessorRole ?? null,
      assessorType: r.assessorType ?? "external", assessorMemberId: r.assessorMemberId ?? null,
      assessorSupplierId: r.assessorSupplierId ?? null, expectedFeeAmountPence: r.expectedFeeAmountPence ?? null,
      purchaseOrderId: r.purchaseOrderId ?? null,
      species: r.species, herdFlockRef: r.herdFlockRef ?? null, sampleSize: r.sampleSize,
      lamenessScore: r.lamenessScore ?? null, bodyConditionScore: r.bodyConditionScore ?? null,
      dungScore: r.dungScore ?? null, skinLesionScore: r.skinLesionScore ?? null,
      nasalDischargeScore: r.nasalDischargeScore ?? null, eyeDischargeScore: r.eyeDischargeScore ?? null,
      mortalityRate: r.mortalityRate ?? null, calvingLambingScore: r.calvingLambingScore ?? null,
      dagScore: r.dagScore ?? null, tailBitingScore: r.tailBitingScore ?? null, snoutRootingScore: r.snoutRootingScore ?? null,
      featherCoverageScore: r.featherCoverageScore ?? null, footpadDermatitisScore: r.footpadDermatitisScore ?? null,
      hockBurnScore: r.hockBurnScore ?? null, culledBirdsRate: r.culledBirdsRate ?? null,
      stockingDensityCompliant: r.stockingDensityCompliant ?? null,
      overallOutcome: r.overallOutcome, correctiveActions: r.correctiveActions ?? null,
      targetDate: r.targetDate ?? null, nextAssessmentDue: r.nextAssessmentDue ?? null,
      documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, documentPath: r.documentPath ?? null,
      notes: r.notes ?? null,
    });
    if (r.herdFlockRef) { const h = herds.find(hx => hx.name === r.herdFlockRef); setSelectedHerdId(h?.id ?? null); } else { setSelectedHerdId(null); }
    setShowForm(true);
  }

  function applyWalkthrough() {
    const criteria = getWalkthroughCriteria(form.species);
    const updates: Partial<typeof EMPTY_WOA> = {};
    for (const c of criteria) {
      const pct = calcPct(wt[c.affKey] as number | null, wt[c.totKey] as number | null);
      if (pct !== null) { (updates as Record<string, unknown>)[c.resultKey] = pct; }
    }
    setForm(f => ({ ...f, ...updates }));
    walkthroughMut.mutate({ ...wt, woaId: editing?.id ?? null, species: form.species, herdFlockRef: form.herdFlockRef });
    setShowWalkthrough(false);
    setWt({ ...EMPTY_WALKTHROUGH });
  }

  function printReport() {
    const rows = records.map(r => `<tr><td>${formatDate(r.assessmentDate)}</td><td>${r.species}</td><td>${r.assessorType === "internal" ? "Internal" : "External"}</td><td>${r.assessorName}</td><td>${r.herdFlockRef ?? "—"}</td><td>${r.sampleSize ?? "—"}</td><td>${r.lamenessScore ?? "—"}</td><td>${r.overallOutcome.toUpperCase()}</td><td>${formatDate(r.nextAssessmentDue)}</td></tr>`).join("");
    printProReport({ title: "Welfare Outcome Assessment Register", subtitle: `${records.length} assessments on record`, tableHtml: `<table><thead><tr><th>Date</th><th>Species</th><th>Type</th><th>Assessor</th><th>Herd/Flock</th><th>Sample</th><th>Lameness</th><th>Outcome</th><th>Next Due</th></tr></thead><tbody>${rows}</tbody></table>` });
  }

  const OUTCOME_COL: Record<string, string> = { good: "bg-green-50 text-green-700", acceptable: "bg-blue-50 text-blue-700", "needs-improvement": "bg-amber-50 text-amber-700", poor: "bg-red-50 text-red-700" };

  // Derived: primary score label for list view (species-sensitive)
  function primaryScore(r: WelfareOutcomeRecord): string {
    if (r.species === "poultry") return r.featherCoverageScore ? `Feat: ${r.featherCoverageScore}%` : "—";
    if (r.species === "pigs") return r.tailBitingScore ? `Tail: ${r.tailBitingScore}%` : (r.lamenessScore ? `Lame: ${r.lamenessScore}%` : "—");
    return r.lamenessScore ? `${r.lamenessScore}%` : "—";
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Welfare Outcome Assessments</h3>
          <p className="text-sm text-gray-500 mt-0.5">Animal welfare outcome measures (WOA) as required by Red Tractor Beef & Lamb, Dairy, and Cross Compliance standards.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Report</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY_WOA }); setFeeInputStr(""); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Record Assessment</Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
        <strong>Red Tractor WOA:</strong> Assessments should be completed at least twice per year for beef &amp; dairy cattle, and annually for other species. Record outcome measures and corrective actions to satisfy assurance requirements.
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        : records.length === 0 ? <Card><CardContent className="py-16 text-center"><AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="font-medium text-gray-700 mb-1">No welfare assessments recorded</p><p className="text-sm text-muted-foreground">Record your first welfare outcome assessment to satisfy Red Tractor requirements.</p></CardContent></Card>
        : <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Species</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assessor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Herd/Flock</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Primary Score</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next Due</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{formatDate(r.assessmentDate)}</td>
                    <td className="px-4 py-3 text-xs capitalize">{r.species}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{r.assessorName}</div>
                      <span className={`inline-flex text-[10px] font-medium rounded px-1 py-0.5 mt-0.5 ${r.assessorType === "internal" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}>{r.assessorType === "internal" ? "Farm Staff" : "External"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.herdFlockRef ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono">{primaryScore(r)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex text-xs font-semibold rounded-full px-2 py-0.5 ${OUTCOME_COL[r.overallOutcome] ?? "bg-gray-100 text-gray-700"}`}>{r.overallOutcome.replace(/-/g," ").toUpperCase()}</span></td>
                    <td className="px-4 py-3 text-xs">{formatDate(r.nextAssessmentDue)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewItem(r)} title="View"><Eye className="h-3 w-3 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>WOA — {formatDate(viewItem.assessmentDate)}</DialogTitle><DialogDescription>{viewItem.species} · {viewItem.assessorName} · {viewItem.assessorType === "internal" ? "Farm Staff" : "External Assessor"}</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{formatDate(viewItem.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium capitalize">{viewItem.species}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessor</p><p className="font-medium">{viewItem.assessorName}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessor Role / Type</p><p className="font-medium">{viewItem.assessorRole ?? (viewItem.assessorType === "internal" ? "Farm Staff" : "External")}</p></div>
              {viewItem.purchaseOrderId && <div className="col-span-2 p-2 bg-sky-50 border border-sky-200 rounded text-xs text-sky-800"><strong>Expected invoice logged</strong> — a purchase order was created in Stock &amp; Supplies when this assessment was saved.</div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock</p><p className="font-medium">{viewItem.herdFlockRef ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Size</p><p className="font-medium">{viewItem.sampleSize ?? "—"}</p></div>
              {viewItem.lamenessScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lameness</p><p className="font-medium">{viewItem.lamenessScore}%</p></div>}
              {viewItem.bodyConditionScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Body Condition</p><p className="font-medium">{viewItem.bodyConditionScore}%</p></div>}
              {viewItem.dungScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dung Score</p><p className="font-medium">{viewItem.dungScore}%</p></div>}
              {viewItem.dagScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dag / Fleece</p><p className="font-medium">{viewItem.dagScore}%</p></div>}
              {viewItem.tailBitingScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tail Biting</p><p className="font-medium">{viewItem.tailBitingScore}%</p></div>}
              {viewItem.snoutRootingScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Snout Damage</p><p className="font-medium">{viewItem.snoutRootingScore}%</p></div>}
              {viewItem.featherCoverageScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feather Coverage</p><p className="font-medium">{viewItem.featherCoverageScore}%</p></div>}
              {viewItem.footpadDermatitisScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Footpad Dermatitis</p><p className="font-medium">{viewItem.footpadDermatitisScore}%</p></div>}
              {viewItem.hockBurnScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hock Burn</p><p className="font-medium">{viewItem.hockBurnScore}%</p></div>}
              {viewItem.skinLesionScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Skin Lesions</p><p className="font-medium">{viewItem.skinLesionScore}%</p></div>}
              {viewItem.nasalDischargeScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Nasal Discharge</p><p className="font-medium">{viewItem.nasalDischargeScore}%</p></div>}
              {viewItem.eyeDischargeScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Eye Discharge</p><p className="font-medium">{viewItem.eyeDischargeScore}%</p></div>}
              {viewItem.mortalityRate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mortality Rate</p><p className="font-medium">{viewItem.mortalityRate}%</p></div>}
              {viewItem.calvingLambingScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calving/Lambing</p><p className="font-medium">{viewItem.calvingLambingScore}%</p></div>}
              {viewItem.stockingDensityCompliant && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stocking Density</p><p className="font-medium capitalize">{viewItem.stockingDensityCompliant.replace(/_/g," ")}</p></div>}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Outcome</p><p className="font-semibold">{viewItem.overallOutcome.replace(/-/g," ").toUpperCase()}</p></div>
              {viewItem.correctiveActions && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Corrective Actions</p><p className="whitespace-pre-line">{viewItem.correctiveActions}</p></div>}
              {viewItem.targetDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Date</p><p className="font-medium">{formatDate(viewItem.targetDate)}</p></div>}
              {viewItem.nextAssessmentDue && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Assessment Due</p><p className="font-medium">{formatDate(viewItem.nextAssessmentDue)}</p></div>}
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="whitespace-pre-line">{viewItem.notes}</p></div>}
            </div>

            {linkedWalkthroughs.length > 0 && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="bg-muted/40 px-3 py-2 flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Saved Walkthroughs ({linkedWalkthroughs.length})</span>
                </div>
                <div className="divide-y text-sm">
                  {linkedWalkthroughs.map(wk => (
                    <div key={wk.id} className="px-3 py-2 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-medium">{formatDate(wk.assessmentDate)}</span>
                        <span className="text-muted-foreground ml-2 text-xs">by {wk.observedBy}</span>
                        {wk.sampleSize != null && <span className="text-muted-foreground ml-1 text-xs">· {wk.sampleSize} animals</span>}
                        {wk.appliedToWoa && <span className="ml-2 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1 py-0.5">Applied</span>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={applyWalkthroughMut.isPending} onClick={() => applyWalkthroughMut.mutate(wk.id)}>
                          {applyWalkthroughMut.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}Re-apply
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => deleteWalkthroughMut.mutate(wk.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Walkthrough Tally Dialog ─────────────────────────────────────────── */}
      {showWalkthrough && (
        <Dialog open onOpenChange={o => { if (!o) setShowWalkthrough(false); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Walkthrough Observations</DialogTitle>
              <DialogDescription>Enter raw animal counts per welfare criterion. Percentages are calculated automatically and will pre-fill the assessment when you apply.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Observer Name *</Label>
                  <Select value={wt.observerMemberId != null ? String(wt.observerMemberId) : "__free__"} onValueChange={v => {
                    if (v === "__free__") { setW("observerMemberId", null); } else {
                      const m = members.find(mx => String(mx.id) === v);
                      if (m) { setW("observerMemberId", m.id); setW("observedBy", memberFullName(m)); }
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__free__">— Enter name manually —</SelectItem>
                      {members.map(m => <SelectItem key={m.id} value={String(m.id)}>{memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {wt.observerMemberId == null && <Input className="mt-1" value={wt.observedBy} onChange={e => setW("observedBy", e.target.value)} placeholder="Observer name" />}
                </div>
                <div><Label>Walk Date</Label><Input type="date" value={wt.assessmentDate} onChange={e => setW("assessmentDate", e.target.value)} /></div>
                <div><Label>Animals Observed (Total)</Label><Input type="number" min={1} value={wt.sampleSize ?? ""} onChange={e => setW("sampleSize", e.target.value ? Number(e.target.value) : null)} placeholder="Total observed in walkthrough" /></div>
                <div><Label>Weather / Conditions</Label><Input value={wt.weatherConditions} onChange={e => setW("weatherConditions", e.target.value)} placeholder="e.g. Dry, housed, outdoor" /></div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Criterion</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground">Affected</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground">Total observed</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground">%</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {getWalkthroughCriteria(form.species).map(c => {
                      const aff = wt[c.affKey] as number | null;
                      const tot = wt[c.totKey] as number | null;
                      const pct = calcPct(aff, tot);
                      return (
                        <tr key={c.label} className="hover:bg-muted/20">
                          <td className="px-3 py-2 font-medium text-gray-700">{c.label}</td>
                          <td className="px-3 py-2 w-32"><Input type="number" min={0} className="h-8 text-center" value={aff ?? ""} onChange={e => setW(c.affKey, e.target.value ? Number(e.target.value) : null)} /></td>
                          <td className="px-3 py-2 w-32"><Input type="number" min={0} className="h-8 text-center" value={tot ?? ""} onChange={e => setW(c.totKey, e.target.value ? Number(e.target.value) : null)} /></td>
                          <td className="px-3 py-2 text-center font-mono text-sm">{pct !== null ? <span className={`font-semibold ${parseFloat(pct) > 10 ? "text-amber-700" : "text-green-700"}`}>{pct}%</span> : <span className="text-muted-foreground">—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div><Label>Walkthrough Notes</Label><Textarea value={wt.walkthroughNotes} onChange={e => setW("walkthroughNotes", e.target.value)} rows={2} placeholder="Any specific observations, environmental factors, or notes about individual animals" /></div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Apply to assessment:</strong> Calculated percentages will be copied to the welfare measures fields. You can still edit them manually before saving.
              </div>
            </div>
            <DialogFooter className="mt-4 gap-2">
              <Button variant="ghost" onClick={() => setShowWalkthrough(false)}>Cancel</Button>
              <Button onClick={applyWalkthrough} disabled={!wt.observedBy}><CheckCircle2 className="h-4 w-4 mr-1" />Apply to Assessment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Welfare Assessment" : "Record Welfare Outcome Assessment"}</DialogTitle><DialogDescription>Complete welfare outcome measures as required by Red Tractor and cross compliance.</DialogDescription></DialogHeader>
            <div className="space-y-5 mt-2">

              {/* ── Section: Assessment Info ─────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate ?? ""} onChange={e => setF("assessmentDate", e.target.value)} /></div>
                <div><Label>Species *</Label>
                  <Select value={form.species || "__none__"} onValueChange={v => {
                    const species = v === "__none__" ? "" : v;
                    setF("species", species);
                    const herdStillValid = !form.herdFlockRef || herds.filter(h => woaSpeciesMatchesHerdType(species, h.type, h.productionType)).some(h => h.name === form.herdFlockRef);
                    if (!herdStillValid) { setF("herdFlockRef", null); setSelectedHerdId(null); }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select species…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Select species —</SelectItem>
                      <SelectItem value="cattle">Cattle (Dairy)</SelectItem>
                      <SelectItem value="beef-cattle">Cattle (Beef)</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="pigs">Pigs</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Herd / Flock</Label>
                  <Select value={currentHerdStillValid ? (form.herdFlockRef ?? "__none__") : "__none__"} onValueChange={v => {
                    if (v === "__none__") { setF("herdFlockRef", null); setSelectedHerdId(null); }
                    else { const h = herdPool.find(h => h.name === v); setF("herdFlockRef", v); setSelectedHerdId(h?.id ?? null); }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select herd / flock" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not specified —</SelectItem>
                      {herdPool.map(h => <SelectItem key={h.id} value={h.name}>{h.name}{h.herdNumber ? ` (${h.herdNumber})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {filteredHerds.length === 0 && herds.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">No {form.species} herds matched — showing all.</p>}
                </div>
                <div><Label>Sample Size</Label><Input type="number" min={1} value={form.sampleSize ?? ""} onChange={e => setF("sampleSize", e.target.value ? Number(e.target.value) : null)} placeholder="No. animals observed" /></div>
              </div>

              {/* ── Section: Assessor ───────────────────────────────────────── */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm text-gray-800">Assessor</h4>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Assessor Type</Label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setF("assessorType", "internal")}
                      className={`flex-1 py-2 px-3 text-sm rounded-md border font-medium transition-colors ${form.assessorType === "internal" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400"}`}>
                      Farm Staff
                    </button>
                    <button type="button" onClick={() => setF("assessorType", "external")}
                      className={`flex-1 py-2 px-3 text-sm rounded-md border font-medium transition-colors ${form.assessorType === "external" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-gray-700 border-gray-300 hover:border-sky-400"}`}>
                      External Assessor
                    </button>
                  </div>
                </div>

                {form.assessorType === "internal" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Staff Member *</Label>
                      <Select value={form.assessorMemberId != null ? String(form.assessorMemberId) : "__none__"} onValueChange={v => {
                        if (v === "__none__") { setF("assessorMemberId", null); setF("assessorName", ""); setF("assessorRole", null); }
                        else {
                          const m = members.find(mx => String(mx.id) === v);
                          if (m) { setF("assessorMemberId", m.id); setF("assessorName", memberFullName(m)); setF("assessorRole", m.jobTitle ?? "Farm Staff"); }
                        }
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select —</SelectItem>
                          {members.map(m => <SelectItem key={m.id} value={String(m.id)}>{memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {members.length === 0 && <p className="text-xs text-muted-foreground mt-0.5">No staff registered — <a href="/staff" className="underline text-primary">add staff</a> or enter name below.</p>}
                    </div>
                    <div><Label>Role / Job Title</Label><Input value={form.assessorRole ?? ""} onChange={e => setF("assessorRole", e.target.value || null)} placeholder="Auto-filled from staff register" /></div>
                    {form.assessorMemberId == null && <div className="col-span-2"><Label>Name (if not in register) *</Label><Input value={form.assessorName ?? ""} onChange={e => setF("assessorName", e.target.value)} placeholder="Full name" /></div>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Supplier / Trade Contact *</Label>
                      <Select value={form.assessorSupplierId != null ? String(form.assessorSupplierId) : "__none__"} onValueChange={v => {
                        if (v === "__none__") { setF("assessorSupplierId", null); setF("assessorName", ""); }
                        else {
                          const s = suppliers.find(sx => String(sx.id) === v);
                          if (s) { setF("assessorSupplierId", s.id); setF("assessorName", s.contactName ?? s.name); }
                        }
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select from suppliers" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select —</SelectItem>
                          {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}{s.contactName ? ` (${s.contactName})` : ""}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {suppliers.length === 0 && <p className="text-xs text-muted-foreground mt-0.5">No suppliers registered. Add in Stock &amp; Supplies, or enter name below.</p>}
                    </div>
                    <div><Label>Assessor Role / Title</Label><Input value={form.assessorRole ?? ""} onChange={e => setF("assessorRole", e.target.value || null)} placeholder="e.g. Farm Vet, Welfare Consultant" /></div>
                    {form.assessorSupplierId == null && <div><Label>Name (if not in register) *</Label><Input value={form.assessorName ?? ""} onChange={e => setF("assessorName", e.target.value)} placeholder="Assessor full name" /></div>}
                    <div>
                      <Label>Expected Fee (£)</Label>
                      <Input type="number" min={0} step={0.01} value={feeInputStr}
                        onChange={e => {
                          setFeeInputStr(e.target.value);
                          setF("expectedFeeAmountPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null);
                        }}
                        placeholder="0.00 — leave blank if no fee" />
                    </div>
                    {form.assessorSupplierId != null && form.expectedFeeAmountPence != null && form.expectedFeeAmountPence > 0 && (
                      <div className="col-span-2 flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-800">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-500" />
                        <span>An expected invoice (purchase order) will be automatically logged in <strong>Stock &amp; Supplies → Purchase Orders</strong> when you save this assessment.</span>
                      </div>
                    )}
                    {editing?.purchaseOrderId && (
                      <div className="col-span-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        ✓ Purchase order already created for this assessment (PO #{editing.purchaseOrderId}).
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Section: Welfare Measures ───────────────────────────────── */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-800">Welfare Measures — <span className="capitalize text-muted-foreground font-normal">{form.species}</span></h4>
                  {form.assessorType === "internal" && (
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      setWt({ ...EMPTY_WALKTHROUGH, observedBy: form.assessorName, assessmentDate: form.assessmentDate, sampleSize: form.sampleSize });
                      setShowWalkthrough(true);
                    }}>
                      <ClipboardList className="h-3.5 w-3.5 mr-1" />Enter Raw Counts
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {getSpeciesMeasures(form.species).map(m => (
                    <div key={m.key}>
                      <Label>{m.label}</Label>
                      {m.isSelect ? (
                        <Select value={(form[m.key] as string | null) ?? ""} onValueChange={v => setF(m.key, v || null)}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>{m.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <Input value={(form[m.key] as string | null) ?? ""} onChange={e => setF(m.key, e.target.value || null)} placeholder={m.placeholder} />
                      )}
                    </div>
                  ))}

                  {/* Mortality — auto-calc for cattle/sheep */}
                  {(form.species !== "poultry") && (
                    <div className="col-span-2 grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label>Mortality Rate (%, 12-month)</Label>
                          {autoCalc?.mortalityRate && <button type="button" className="text-xs text-primary underline" onClick={() => setF("mortalityRate", autoCalc.mortalityRate)}>Use {autoCalc.mortalityRate}% (calculated)</button>}
                        </div>
                        <Input value={form.mortalityRate ?? ""} onChange={e => setF("mortalityRate", e.target.value || null)} placeholder={autoCalc?.mortalityRate ? `Calculated: ${autoCalc.mortalityRate}%` : "Rolling 12-month mortality %"} />
                        {autoCalc?.mortalityRate
                          ? <p className="text-xs text-green-700 mt-0.5">✓ From Mortality Register: {autoCalc.deathCount} deaths / {autoCalc.herdSize} animals.</p>
                          : <p className="text-xs text-muted-foreground mt-0.5">{selectedHerdId ? "No mortality records found — enter manually." : "Select a herd to auto-calculate."}</p>}
                      </div>

                      {/* Calving/Lambing — cattle + sheep only */}
                      {(form.species === "cattle" || form.species === "beef-cattle" || form.species === "sheep") && (
                        <div>
                          <div className="flex items-center justify-between">
                            <Label>{form.species === "sheep" ? "Lambing Score" : "Calving Score"} (% assisted)</Label>
                            {autoCalc?.calvingLambingScore && <button type="button" className="text-xs text-primary underline" onClick={() => setF("calvingLambingScore", autoCalc.calvingLambingScore)}>Use {autoCalc.calvingLambingScore}%</button>}
                          </div>
                          <Input value={form.calvingLambingScore ?? ""} onChange={e => setF("calvingLambingScore", e.target.value || null)} placeholder="% assisted births" />
                          {autoCalc?.calvingLambingScore
                            ? <p className="text-xs text-green-700 mt-0.5">✓ From {form.species === "sheep" ? "Lambing" : "Calving"} records.</p>
                            : <p className="text-xs text-muted-foreground mt-0.5">{selectedHerdId ? "No records found — enter manually." : "Select a herd to auto-calculate."}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Past Walkthroughs (edit mode only, internal assessor) ─────── */}
              {editing && linkedWalkthroughs.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/40 px-3 py-2 flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Saved Walkthroughs ({linkedWalkthroughs.length})</span>
                    <span className="text-xs text-muted-foreground ml-1">— click Re-apply to push tally counts to the scores below</span>
                  </div>
                  <div className="divide-y text-sm">
                    {linkedWalkthroughs.map(wk => (
                      <div key={wk.id} className="px-3 py-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-medium">{formatDate(wk.assessmentDate)}</span>
                          <span className="text-muted-foreground ml-2 text-xs">by {wk.observedBy}</span>
                          {wk.sampleSize != null && <span className="text-muted-foreground ml-1 text-xs">· {wk.sampleSize} animals</span>}
                          {wk.weatherConditions && <span className="text-muted-foreground ml-1 text-xs">· {wk.weatherConditions}</span>}
                          {wk.appliedToWoa && <span className="ml-2 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1 py-0.5">Applied</span>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={applyWalkthroughMut.isPending} onClick={() => applyWalkthroughMut.mutate(wk.id)}>
                            {applyWalkthroughMut.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}Re-apply
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => deleteWalkthroughMut.mutate(wk.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section: Outcome ────────────────────────────────────────── */}
              <div className="space-y-3">
                <div><Label>Overall Outcome *</Label>
                  <Select value={form.overallOutcome} onValueChange={v => setF("overallOutcome", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good — All measures within target</SelectItem>
                      <SelectItem value="acceptable">Acceptable — Minor areas for attention</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement — Action plan required</SelectItem>
                      <SelectItem value="poor">Poor — Urgent action required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(form.overallOutcome === "needs-improvement" || form.overallOutcome === "poor") && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm text-amber-800">
                    <strong>⚠ Action required</strong> — A task will appear on the Week Ahead planner for all farm staff so this can be tracked and signed off before the target date.
                  </div>
                )}
                <div>
                  <Label>Corrective Actions</Label>
                  <Textarea value={form.correctiveActions ?? ""} onChange={e => setF("correctiveActions", e.target.value || null)} rows={3} placeholder="Describe the specific actions that must be taken — who, what, and by when" />
                  {(form.overallOutcome === "needs-improvement" || form.overallOutcome === "poor") && !form.correctiveActions && <p className="text-xs text-red-600 mt-0.5">Required when outcome is Needs Improvement or Poor</p>}
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Target Completion Date</Label><Input type="date" value={form.targetDate ?? ""} onChange={e => setF("targetDate", e.target.value || null)} /></div>
                <div><Label>Next Assessment Due</Label><Input type="date" value={form.nextAssessmentDue ?? ""} onChange={e => setF("nextAssessmentDue", e.target.value || null)} /></div>
              </div>
              <div>
                <Label>Assessment Document</Label>
                <input type="file" ref={woaDocRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const upload = await uploadWoaDoc(file);
                  if (upload?.objectPath) { setPendingWoaDoc({ path: upload.objectPath, name: file.name }); setF("documentPath", upload.objectPath); setF("documentName", file.name); }
                  if (woaDocRef.current) woaDocRef.current.value = "";
                }} />
                {(pendingWoaDoc || form.documentPath || form.documentName) ? (
                  <div className="flex items-center gap-2 mt-1 p-2 border rounded text-sm">
                    <span className="text-muted-foreground">📎</span>
                    {form.documentPath ? (
                      <a href={`/api/storage${form.documentPath}`} target="_blank" rel="noreferrer" className="text-primary underline truncate flex-1">{form.documentName || "Document"}</a>
                    ) : (
                      <span className="truncate flex-1">{form.documentName || "Document"}</span>
                    )}
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPendingWoaDoc(null); setF("documentPath", null); setF("documentName", null); }}>×</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => woaDocRef.current?.click()} disabled={isUploadingWoaDoc}>
                    {isUploadingWoaDoc ? "Uploading…" : "Upload Document (PDF / image)"}
                  </Button>
                )}
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.assessmentDate || !form.assessorName || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update" : "Save Assessment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && <ConfirmDialog open title="Delete Assessment?" message="This welfare outcome assessment will be permanently deleted." onConfirm={() => deleteMut.mutate(deleteId!)} onCancel={() => setDeleteId(null)} confirmLabel="Delete" confirmVariant="destructive" />}
    </>
  );
}

// ─── Sheep Dipping Records ─────────────────────────────────────────────────────

interface SheepDippingRecord { id: number; farmId: number; dipDate: string; productName: string; mappNumber: string | null; activeIngredient: string | null; dipType: string; dipConcentrationPct: string | null; volumeOfDipLitres: string | null; sheepCount: number; herdFlockRef: string | null; operatorName: string; operatorCertNumber: string | null; operatorCertExpiry: string | null; bathFillDate: string | null; daysSinceLastUse: number | null; topUpVolumeAdded: string | null; disposalMethod: string | null; disposalQuantityLitres: string | null; disposalDate: string | null; disposalContractorName: string | null; disposalWasteTransferNoteRef: string | null; withdrawalPeriodDays: number | null; withdrawalClearDate: string | null; stockItemId: number | null; quantityUsed: string | null; stockItemName: string | null; stockItemUnit: string | null; stockItemStorageLocation: string | null; documentPath: string | null; documentUrl: string | null; documentName: string | null; notes: string | null; }
interface DipStockItem { id: number; name: string; stockType: string; mappNumber: string | null; unit: string | null; storageLocation: string | null; isActive: boolean; }
interface DipCert { id: number; userId: string; certificateType: string; certificateNumber: string | null; expiryDate: string | null; }

const EMPTY_DIP: Omit<SheepDippingRecord, "id" | "farmId" | "stockItemName" | "stockItemUnit" | "stockItemStorageLocation"> = { dipDate: "", productName: "", mappNumber: null, activeIngredient: null, dipType: "plunge", dipConcentrationPct: null, volumeOfDipLitres: null, sheepCount: 0, herdFlockRef: null, operatorName: "", operatorCertNumber: null, operatorCertExpiry: null, bathFillDate: null, daysSinceLastUse: null, topUpVolumeAdded: null, disposalMethod: null, disposalQuantityLitres: null, disposalDate: null, disposalContractorName: null, disposalWasteTransferNoteRef: null, withdrawalPeriodDays: null, withdrawalClearDate: null, stockItemId: null, quantityUsed: null, documentPath: null, documentUrl: null, documentName: null, notes: null };

export function SheepDippingSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}/sheep-dipping-records`;
  const { data, isLoading } = useQuery<{ records: SheepDippingRecord[] }>({ queryKey: ["sheep-dipping", farmId], queryFn: () => fetch(base).then(r => r.json()) });
  const records = data?.records ?? [];

  const { data: stockData } = useQuery<{ records: DipStockItem[] }>({ queryKey: ["stock-items", farmId], queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then(r => r.json()) });
  const chemicalItems = (stockData?.records ?? []).filter(s => s.isActive);

  const { data: herdsData } = useQuery<{ herds: { id: number; name: string; species: string; herdFlockMark: string | null }[] }>({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()) });
  const sheepHerds = (herdsData?.herds ?? []).filter(h => h.species === "sheep" || h.species === "goat");

  const { data: certsData } = useQuery<{ records: DipCert[] }>({
    queryKey: ["staff-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then(r => r.ok ? r.json() : { records: [] }),
  });
  const allCerts = certsData?.records ?? [];
  const PESTICIDE_TYPES = ["PA1", "PA2", "PA3", "PA4", "PA6", "PA6AW", "Safe use of pesticides", "Safe use of rodenticides"];

  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter(m => m.isActive !== false);
  const staffNames = activeMembers.map(memberFullName);

  function getCertForOperator(name: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const certs = allCerts.filter(c => c.userId === name && PESTICIDE_TYPES.some(t => c.certificateType.startsWith(t)));
    if (certs.length === 0) return null;
    const valid = certs.filter(c => !c.expiryDate || new Date(c.expiryDate) >= today);
    return valid.length > 0
      ? valid.sort((a, b) => (b.expiryDate ?? "").localeCompare(a.expiryDate ?? ""))[0]
      : certs.sort((a, b) => (b.expiryDate ?? "").localeCompare(a.expiryDate ?? ""))[0];
  }

  const [viewItem, setViewItem] = useState<SheepDippingRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SheepDippingRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_DIP>({ ...EMPTY_DIP });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pendingDoc, setPendingDoc] = useState<{ path: string; name: string } | null>(null);
  const dipDocRef = useRef<HTMLInputElement>(null);
  const { uploadFile: uploadDipDoc, isUploading: isUploadingDipDoc } = useUpload();
  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const selectedStockItem = chemicalItems.find(s => s.id === form.stockItemId) ?? null;

  const createMut = useMutation({ mutationFn: (b: typeof EMPTY_DIP) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] }); qc.invalidateQueries({ queryKey: ["stock-items", farmId] }); setShowForm(false); setForm({ ...EMPTY_DIP }); setPendingDoc(null); } });
  const updateMut = useMutation({ mutationFn: (b: typeof EMPTY_DIP & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] }); setShowForm(false); setEditing(null); setPendingDoc(null); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] }); setDeleteId(null); } });

  function openEdit(r: SheepDippingRecord) { setEditing(r); setPendingDoc(null); setForm({ dipDate: r.dipDate, productName: r.productName, mappNumber: r.mappNumber ?? null, activeIngredient: r.activeIngredient ?? null, dipType: r.dipType, dipConcentrationPct: r.dipConcentrationPct ?? null, volumeOfDipLitres: r.volumeOfDipLitres ?? null, sheepCount: r.sheepCount, herdFlockRef: r.herdFlockRef ?? null, operatorName: r.operatorName, operatorCertNumber: r.operatorCertNumber ?? null, operatorCertExpiry: r.operatorCertExpiry ?? null, bathFillDate: r.bathFillDate ?? null, daysSinceLastUse: r.daysSinceLastUse, topUpVolumeAdded: r.topUpVolumeAdded ?? null, disposalMethod: r.disposalMethod ?? null, disposalQuantityLitres: r.disposalQuantityLitres ?? null, disposalDate: r.disposalDate ?? null, disposalContractorName: r.disposalContractorName ?? null, disposalWasteTransferNoteRef: r.disposalWasteTransferNoteRef ?? null, withdrawalPeriodDays: r.withdrawalPeriodDays, withdrawalClearDate: r.withdrawalClearDate ?? null, stockItemId: r.stockItemId ?? null, quantityUsed: r.quantityUsed ?? null, documentPath: r.documentPath ?? null, documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, notes: r.notes ?? null }); setShowForm(true); }

  function printReport() {
    const rows = records.map(r => `<tr><td>${formatDate(r.dipDate)}</td><td>${r.productName}</td><td>${r.dipType}</td><td>${r.sheepCount}</td><td>${r.operatorName}</td><td>${r.operatorCertNumber ?? "—"}</td><td>${r.disposalMethod ?? "—"}</td><td>${r.withdrawalPeriodDays != null ? r.withdrawalPeriodDays + " days" : "—"}</td><td>${formatDate(r.withdrawalClearDate)}</td></tr>`).join("");
    printProReport({ title: "Sheep Dipping Register", subtitle: `${records.length} dipping records`, tableHtml: `<table><thead><tr><th>Dip Date</th><th>Product</th><th>Type</th><th>Sheep Count</th><th>Operator</th><th>Cert No.</th><th>Disposal</th><th>W/drawal</th><th>Clear Date</th></tr></thead><tbody>${rows}</tbody></table>` });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Sheep Dipping Records</h3>
          <p className="text-sm text-gray-500 mt-0.5">Organophosphate and synthetic pyrethroid dipping records as required by the Control of Pesticides Regulations and Red Tractor Sheep Assurance Scheme.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Report</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY_DIP }); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Log Dipping</Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Regulatory requirement:</strong> Operator must hold a Certificate of Competence in Safe Use of Pesticides (PA6AW or equivalent). All dip waste must be disposed of by a licensed contractor with a Waste Transfer Note. Withdrawal periods must be observed for slaughter and wool.
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        : records.length === 0 ? <Card><CardContent className="py-16 text-center"><AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="font-medium text-gray-700 mb-1">No dipping records logged</p><p className="text-sm text-muted-foreground">Log your sheep dipping treatments to maintain compliance with pesticide regulations.</p></CardContent></Card>
        : <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dip Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sheep</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Operator</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Disposal</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">W/drawal Clear</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{formatDate(r.dipDate)}</td>
                    <td className="px-4 py-3"><div className="font-medium text-gray-900 text-xs">{r.productName}</div>{r.mappNumber && <div className="text-xs text-muted-foreground">MAPP: {r.mappNumber}</div>}</td>
                    <td className="px-4 py-3 text-xs capitalize">{r.dipType}</td>
                    <td className="px-4 py-3 text-right">{r.sheepCount}</td>
                    <td className="px-4 py-3 text-xs">{r.operatorName}</td>
                    <td className="px-4 py-3 text-xs">{r.disposalMethod ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(r.withdrawalClearDate)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewItem(r)} title="View"><Eye className="h-3 w-3 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Sheep Dipping — {formatDate(viewItem.dipDate)}</DialogTitle><DialogDescription>{viewItem.productName} · {viewItem.sheepCount} sheep</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              {viewItem.stockItemName && <div className="col-span-2 p-2 bg-muted/40 rounded-lg flex items-center gap-2 text-xs"><Package className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{viewItem.stockItemName}</span>{viewItem.stockItemStorageLocation && <span className="text-muted-foreground">· {viewItem.stockItemStorageLocation}</span>}{viewItem.quantityUsed && <span className="ml-auto font-semibold text-destructive">−{viewItem.quantityUsed} {viewItem.stockItemUnit ?? "units"} deducted</span>}</div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dip Date</p><p className="font-medium">{formatDate(viewItem.dipDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product (MAPP)</p><p className="font-medium">{viewItem.productName}{viewItem.mappNumber && ` (${viewItem.mappNumber})`}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{viewItem.activeIngredient ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dip Type</p><p className="font-medium capitalize">{viewItem.dipType}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Concentration</p><p className="font-medium">{viewItem.dipConcentrationPct ? `${viewItem.dipConcentrationPct}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume of Dip (L)</p><p className="font-medium">{viewItem.volumeOfDipLitres ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sheep Dipped</p><p className="font-medium">{viewItem.sheepCount}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock Ref</p><p className="font-medium">{viewItem.herdFlockRef ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Operator</p><p className="font-medium">{viewItem.operatorName}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cert. Number</p><p className="font-medium font-mono">{viewItem.operatorCertNumber ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cert. Expiry</p><p className="font-medium">{formatDate(viewItem.operatorCertExpiry)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bath Fill Date</p><p className="font-medium">{formatDate(viewItem.bathFillDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Days Since Last Use</p><p className="font-medium">{viewItem.daysSinceLastUse ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Top-Up Added (L)</p><p className="font-medium">{viewItem.topUpVolumeAdded ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Method</p><p className="font-medium">{viewItem.disposalMethod ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Qty (L)</p><p className="font-medium">{viewItem.disposalQuantityLitres ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Date</p><p className="font-medium">{formatDate(viewItem.disposalDate)}</p></div>
              {viewItem.disposalContractorName && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Contractor</p><p className="font-medium">{viewItem.disposalContractorName}</p></div>}
              {viewItem.disposalWasteTransferNoteRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">WTN Reference</p><p className="font-medium font-mono">{viewItem.disposalWasteTransferNoteRef}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Period</p><p className="font-medium">{viewItem.withdrawalPeriodDays != null ? `${viewItem.withdrawalPeriodDays} days` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Clear Date</p><p className="font-medium">{formatDate(viewItem.withdrawalClearDate)}</p></div>
              {(viewItem.documentPath || viewItem.documentName) && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Document</p>
                  <a href={viewItem.documentPath ? `/api/storage${viewItem.documentPath}` : (viewItem.documentUrl ?? "#")} target="_blank" rel="noreferrer" className="text-primary text-xs underline">{viewItem.documentName || "View Document"}</a>
                </div>
              )}
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="whitespace-pre-line">{viewItem.notes}</p></div>}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Dipping Record" : "Log Sheep Dipping"}</DialogTitle><DialogDescription>Complete all fields required under Control of Pesticides Regulations and Red Tractor SAS.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">

              {/* ── Chemical Store Lookup ── */}
              <div className="col-span-2">
                <Label>Chemical Store Product <span className="text-muted-foreground font-normal text-xs">(select to auto-fill product details &amp; deduct stock)</span></Label>
                <Select
                  value={form.stockItemId != null ? String(form.stockItemId) : ""}
                  onValueChange={v => {
                    if (!v) { setF("stockItemId", null); return; }
                    const item = chemicalItems.find(s => s.id === Number(v));
                    if (item) {
                      setF("stockItemId", item.id);
                      if (item.name) setF("productName", item.name);
                      if (item.mappNumber) setF("mappNumber", item.mappNumber);
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder={chemicalItems.length === 0 ? "No stock items — enter manually below" : "Select from chemical store…"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— None / enter manually —</SelectItem>
                    {chemicalItems.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}{s.mappNumber ? ` (${s.mappNumber})` : ""}{s.storageLocation ? ` · ${s.storageLocation}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStockItem?.storageLocation && (
                  <p className="text-xs text-muted-foreground mt-1">Storage location: <span className="font-medium">{selectedStockItem.storageLocation}</span></p>
                )}
              </div>

              {selectedStockItem && (
                <div className="col-span-2">
                  <Label>Quantity Used <span className="text-muted-foreground font-normal text-xs">({selectedStockItem.unit ?? "units"} — will be deducted from stock on save)</span></Label>
                  <Input type="number" min={0} step="0.001" value={form.quantityUsed ?? ""} onChange={e => setF("quantityUsed", e.target.value || null)} placeholder={`Amount in ${selectedStockItem.unit ?? "units"}`} />
                </div>
              )}

              <div><Label>Dipping Date *</Label><Input type="date" value={form.dipDate ?? ""} onChange={e => setF("dipDate", e.target.value)} /></div>
              <div>
                <Label>Product Name (MAPP) *</Label>
                <Input value={form.productName ?? ""} onChange={e => setF("productName", e.target.value)} placeholder="e.g. Ridect Pour-On" />
                {form.stockItemId && <p className="text-xs text-muted-foreground mt-0.5">Auto-filled from chemical store — edit if needed</p>}
              </div>
              <div><Label>MAPP Number</Label><Input value={form.mappNumber ?? ""} onChange={e => setF("mappNumber", e.target.value || null)} className="font-mono" /></div>
              <div><Label>Active Ingredient</Label><Input value={form.activeIngredient ?? ""} onChange={e => setF("activeIngredient", e.target.value || null)} placeholder="e.g. Cypermethrin" /></div>
              <div><Label>Dip Type</Label>
                <Select value={form.dipType} onValueChange={v => setF("dipType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plunge">Plunge Dip</SelectItem>
                    <SelectItem value="shower">Shower / Race Dip</SelectItem>
                    <SelectItem value="pour-on">Pour-On</SelectItem>
                    <SelectItem value="spray">Hand Spray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Concentration (%)</Label><Input value={form.dipConcentrationPct ?? ""} onChange={e => setF("dipConcentrationPct", e.target.value || null)} /></div>
              <div><Label>Volume of Dip (litres)</Label><Input type="number" min={0} value={form.volumeOfDipLitres ?? ""} onChange={e => setF("volumeOfDipLitres", e.target.value || null)} /></div>
              <div><Label>Sheep Count *</Label><Input type="number" min={1} value={form.sheepCount || ""} onChange={e => setF("sheepCount", Number(e.target.value))} /></div>
              <div>
                <Label>Herd / Flock</Label>
                {sheepHerds.length > 0 ? (
                  <Select value={form.herdFlockRef ?? ""} onValueChange={v => setF("herdFlockRef", v || null)}>
                    <SelectTrigger><SelectValue placeholder="Select flock…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {sheepHerds.map(h => <SelectItem key={h.id} value={h.herdFlockMark ?? h.name}>{h.name}{h.herdFlockMark ? ` (${h.herdFlockMark})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.herdFlockRef ?? ""} onChange={e => setF("herdFlockRef", e.target.value || null)} placeholder="Flock mark / reference" />
                )}
              </div>
              <div className="col-span-2">
                <Label>Operator Name *</Label>
                <StaffSelect
                  value={form.operatorName ?? ""}
                  onChange={name => {
                    setF("operatorName", name);
                    if (name) {
                      const cert = getCertForOperator(name);
                      if (cert) {
                        setF("operatorCertNumber", cert.certificateNumber ?? null);
                        setF("operatorCertExpiry", cert.expiryDate ? cert.expiryDate.split("T")[0] : null);
                      }
                    }
                  }}
                  staffNames={staffNames}
                />
                {(() => {
                  if (!form.operatorName) return null;
                  const cert = getCertForOperator(form.operatorName);
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  if (!cert) {
                    return (
                      <p className="mt-1 text-xs text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No pesticide certificate (PA1/PA6AW/equivalent) found for this operator in the Staff &amp; Certificates register. Add one there or enter details manually below.
                      </p>
                    );
                  }
                  const expired = cert.expiryDate && new Date(cert.expiryDate) < today;
                  if (expired) {
                    return (
                      <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Certificate <span className="font-mono font-semibold">{cert.certificateNumber}</span> ({cert.certificateType}) expired {new Date(cert.expiryDate!).toLocaleDateString("en-GB")} — renewal required before operating.
                      </p>
                    );
                  }
                  return (
                    <p className="mt-1 text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {cert.certificateType} — cert number &amp; expiry auto-filled from Staff &amp; Certificates register.
                    </p>
                  );
                })()}
              </div>
              <div><Label>Cert. of Competence No.</Label><Input value={form.operatorCertNumber ?? ""} onChange={e => setF("operatorCertNumber", e.target.value || null)} className="font-mono" placeholder="PA6AW / equivalent" /></div>
              <div><Label>Cert. Expiry</Label><Input type="date" value={form.operatorCertExpiry ?? ""} onChange={e => setF("operatorCertExpiry", e.target.value || null)} /></div>
              <div><Label>Bath Fill Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.bathFillDate ?? ""} onChange={e => setF("bathFillDate", e.target.value || null)} /></div>
              <div><Label>Days Since Last Use</Label><Input type="number" min={0} value={form.daysSinceLastUse ?? ""} onChange={e => setF("daysSinceLastUse", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><Label>Top-Up Volume Added (L)</Label><Input value={form.topUpVolumeAdded ?? ""} onChange={e => setF("topUpVolumeAdded", e.target.value || null)} /></div>
              <div className="col-span-2 border-t pt-4"><p className="text-xs font-semibold text-gray-500 uppercase mb-3">Dip Waste Disposal</p></div>
              <div><Label>Disposal Method</Label>
                <Select value={form.disposalMethod ?? ""} onValueChange={v => setF("disposalMethod", v || null)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licensed-contractor">Licensed Contractor Collection</SelectItem>
                    <SelectItem value="approved-disposal-site">Approved Disposal Site</SelectItem>
                    <SelectItem value="treatment-plant">Treatment Plant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Disposal Quantity (L)</Label><Input type="number" min={0} value={form.disposalQuantityLitres ?? ""} onChange={e => setF("disposalQuantityLitres", e.target.value || null)} /></div>
              <div><Label>Disposal Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.disposalDate ?? ""} onChange={e => setF("disposalDate", e.target.value || null)} /></div>
              <div><Label>Disposal Contractor</Label><Input value={form.disposalContractorName ?? ""} onChange={e => setF("disposalContractorName", e.target.value || null)} /></div>
              <div className="col-span-2"><Label>Waste Transfer Note Ref</Label><Input value={form.disposalWasteTransferNoteRef ?? ""} onChange={e => setF("disposalWasteTransferNoteRef", e.target.value || null)} className="font-mono" /></div>
              <div className="col-span-2 border-t pt-4"><p className="text-xs font-semibold text-gray-500 uppercase mb-3">Withdrawal Period</p></div>
              <div><Label>Withdrawal Period (days)</Label><Input type="number" min={0} value={form.withdrawalPeriodDays ?? ""} onChange={e => setF("withdrawalPeriodDays", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><Label>Withdrawal Clear Date</Label><Input type="date" value={form.withdrawalClearDate ?? ""} onChange={e => setF("withdrawalClearDate", e.target.value || null)} /></div>

              {/* ── Document Upload ── */}
              <div className="col-span-2">
                <Label>Supporting Document <span className="text-muted-foreground font-normal text-xs">(MAPP label, risk assessment, waste transfer note…)</span></Label>
                <input
                  type="file"
                  ref={dipDocRef}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const upload = await uploadDipDoc(file);
                    if (upload?.objectPath) { setPendingDoc({ path: upload.objectPath, name: file.name }); setF("documentPath", upload.objectPath); setF("documentName", file.name); }
                    if (dipDocRef.current) dipDocRef.current.value = "";
                  }}
                />
                {(pendingDoc || form.documentPath || form.documentName) ? (
                  <div className="flex items-center gap-2 mt-1 p-2 border rounded text-sm">
                    <span className="text-muted-foreground">📎</span>
                    {form.documentPath ? (
                      <a href={`/api/storage${form.documentPath}`} target="_blank" rel="noreferrer" className="text-primary underline truncate flex-1">{form.documentName || "Document"}</a>
                    ) : (
                      <span className="truncate flex-1">{form.documentName || "Document"}</span>
                    )}
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPendingDoc(null); setF("documentPath", null); setF("documentName", null); }}>×</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => dipDocRef.current?.click()} disabled={isUploadingDipDoc}>
                    {isUploadingDipDoc ? "Uploading…" : "Upload Document (PDF / image)"}
                  </Button>
                )}
              </div>

              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.dipDate || !form.productName || !form.operatorName || !form.sheepCount || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update" : "Save Dipping Record"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && <ConfirmDialog open title="Delete Dipping Record?" message="This sheep dipping record will be permanently deleted." onConfirm={() => deleteMut.mutate(deleteId!)} onCancel={() => setDeleteId(null)} confirmLabel="Delete" confirmVariant="destructive" />}
    </>
  );
}

// ─── Livestock Analytics ──────────────────────────────────────────────────────
const LIVESTOCK_COLORS = ["#15803d","#a16207","#1d4ed8","#b91c1c","#7c3aed","#0e7490"];

function LivestockAnalyticsSection({ farmId }: { farmId: number }) {
  const { data: mortalityData } = useQuery({ queryKey: ["mortality", farmId], queryFn: () => fetch(`/api/farms/${farmId}/mortality-records`).then(r => r.json()) });
  const { data: bvdData } = useQuery({ queryKey: ["bvd-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then(r => r.json()).then(d => d.records ?? []) });
  const { data: tbData } = useQuery<{ records: Record<string, unknown>[] }>({ queryKey: ["tb-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then(r => r.json()) });
  const { data: aiData } = useQuery({ queryKey: ["ai-reproduction", farmId], queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`).then(r => r.json()).then(d => d.records ?? []) });

  const mortality: Record<string, unknown>[] = useMemo(() => mortalityData?.records ?? mortalityData ?? [], [mortalityData]);
  const bvdTests: Record<string, unknown>[] = useMemo(() => Array.isArray(bvdData) ? bvdData : [], [bvdData]);
  const tbTests: Record<string, unknown>[] = useMemo(() => tbData?.records ?? [], [tbData]);
  const aiRecords: Record<string, unknown>[] = useMemo(() => Array.isArray(aiData) ? aiData : [], [aiData]);

  const mortalityByCause = useMemo(() => {
    const map: Record<string, number> = {};
    mortality.forEach(r => { const c = String(r.causeOfDeath || r.cause || "Unknown"); map[c] = (map[c] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name, count]) => ({ name: name.length > 16 ? name.slice(0,15)+"…" : name, count }));
  }, [mortality]);

  const mortalityByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date(); const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 11);
    mortality.forEach(r => {
      const d = new Date(String(r.dateOfDeath || r.date || "")); if (isNaN(d.getTime()) || d < cutoff) return;
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort().map(([m, count]) => ({ month: m.slice(5), count }));
  }, [mortality]);

  const bvdResultCounts = useMemo(() => {
    const map: Record<string, number> = {};
    bvdTests.forEach(r => { const k = String(r.result || "Unknown"); map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bvdTests]);

  const tbPassRate = useMemo(() => {
    const passed = tbTests.filter(r => r.testResult === "clear" || r.testResult === "passed" || r.passed === true).length;
    return tbTests.length ? Math.round((passed / tbTests.length) * 100) : null;
  }, [tbTests]);

  const aiConceptionRate = useMemo(() => {
    const confirmed = aiRecords.filter(r => r.pregnancyConfirmed === true || r.status === "pregnant").length;
    return aiRecords.length ? Math.round((confirmed / aiRecords.length) * 100) : null;
  }, [aiRecords]);

  const noData = mortality.length === 0 && bvdTests.length === 0 && tbTests.length === 0;
  if (noData) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No data yet</p>
      <p className="text-xs mt-1">Add mortality, BVD, or TB records to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Mortality Records", value: mortality.length, bg: "bg-red-50 border-red-100", text: "text-red-800", sub: "text-red-700" },
          { label: "BVD Tests", value: bvdTests.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
          { label: "TB Test Pass Rate", value: tbPassRate !== null ? `${tbPassRate}%` : "—", bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "AI Conception Rate", value: aiConceptionRate !== null ? `${aiConceptionRate}%` : "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl border p-4 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className={`text-xs mt-0.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mortalityByCause.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Mortality by Cause</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mortalityByCause} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip formatter={(v) => [`${v} animals`, "Deaths"]} />
                  <Bar dataKey="count" fill="#b91c1c" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {bvdResultCounts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">BVD Test Results</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bvdResultCounts} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {bvdResultCounts.map((_, i) => <Cell key={i} fill={LIVESTOCK_COLORS[i % LIVESTOCK_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} tests`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {mortalityByMonth.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Monthly Mortality (last 12 months)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mortalityByMonth} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v}`, "Deaths"]} />
                <Bar dataKey="count" fill="#b91c1c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LivestockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<"herds" | "vet-plans" | "mortality" | "contractors" | "feed" | "water" | "animals" | "ai-repro" | "vet-rx" | "sires" | "straws" | "lambing" | "tb-tests" | "welfare-outcomes" | "sheep-dipping" | "bvd" | "casualty-slaughter" | "analytics">(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as any; const valid = ["herds","vet-plans","mortality","contractors","feed","water","animals","ai-repro","vet-rx","sires","straws","lambing","tb-tests","welfare-outcomes","sheep-dipping","bvd","casualty-slaughter","analytics"]; return valid.includes(t) ? t : "herds"; });

  if (!farmId) return <Redirect href="/select" />;

  return (
    <AppLayout title="Herds & Animals">
      <TabBar className="mb-6">
        <TabButton active={tab === "herds"} onClick={() => setTab("herds")}>Herds & Flocks</TabButton>
        <TabButton active={tab === "animals"} onClick={() => setTab("animals")}>
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Individual Animals</span>
        </TabButton>
        <TabButton active={tab === "vet-plans"} onClick={() => setTab("vet-plans")}>Vet Health Plans</TabButton>
        <TabButton active={tab === "mortality"} onClick={() => setTab("mortality")}>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Mortality</span>
        </TabButton>
        <TabButton active={tab === "contractors"} onClick={() => setTab("contractors")}>
          <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Fallen Stock Collectors</span>
        </TabButton>
        <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>
          <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Feed Records</span>
        </TabButton>
        <TabButton active={tab === "water"} onClick={() => setTab("water")}>
          <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5" /> Water Quality</span>
        </TabButton>
        <TabButton active={tab === "sires"} onClick={() => setTab("sires")}>
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Sires &amp; Rams</span>
        </TabButton>
        <TabButton active={tab === "straws"} onClick={() => setTab("straws")}>
          <span className="flex items-center gap-1"><FlaskConical className="h-3.5 w-3.5" /> Straw Inventory</span>
        </TabButton>
        <TabButton active={tab === "ai-repro"} onClick={() => setTab("ai-repro")}>
          <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> AI & Reproduction</span>
        </TabButton>
        <TabButton active={tab === "vet-rx"} onClick={() => setTab("vet-rx")}>
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Health Register</span>
        </TabButton>
        <TabButton active={tab === "lambing"} onClick={() => setTab("lambing")}>
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Lambing Records</span>
        </TabButton>
        <TabButton active={tab === "tb-tests"} onClick={() => setTab("tb-tests")}>
          <span className="flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" /> TB Tests</span>
        </TabButton>
        <TabButton active={tab === "welfare-outcomes"} onClick={() => setTab("welfare-outcomes")}>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Welfare Outcomes</span>
        </TabButton>
        <TabButton active={tab === "sheep-dipping"} onClick={() => setTab("sheep-dipping")}>
          <span className="flex items-center gap-1"><FlaskConical className="h-3.5 w-3.5" /> Sheep Dipping</span>
        </TabButton>
        <TabButton active={tab === "bvd"} onClick={() => setTab("bvd")}>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> BVD Testing</span>
        </TabButton>
        <TabButton active={tab === "casualty-slaughter"} onClick={() => setTab("casualty-slaughter")}>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Casualty Slaughter</span>
        </TabButton>
        <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>
          <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytics</span>
        </TabButton>
      </TabBar>
      <ErrorBoundary key={tab}>
        {tab === "herds" && <HerdsSection farmId={farmId} />}
        {tab === "animals" && <AnimalsSection farmId={farmId} />}
        {tab === "vet-plans" && <VetHealthPlansSection farmId={farmId} />}
        {tab === "mortality" && <MortalitySection farmId={farmId} />}
        {tab === "contractors" && <FallenStockContractorsSection farmId={farmId} />}
        {tab === "feed" && <FeedSection farmId={farmId} />}
        {tab === "water" && <WaterSection farmId={farmId} />}
        {tab === "sires" && <SiresSection farmId={farmId} />}
        {tab === "straws" && <StrawInventorySection farmId={farmId} />}
        {tab === "ai-repro" && <AIReproductionSection farmId={farmId} />}
        {tab === "vet-rx" && <VetPrescriptionsSection farmId={farmId} />}
        {tab === "lambing" && <LambingSection farmId={farmId} />}
        {tab === "tb-tests" && <TbTestsSection farmId={farmId} />}
        {tab === "welfare-outcomes" && <WelfareOutcomeSection farmId={farmId} />}
        {tab === "sheep-dipping" && <SheepDippingSection farmId={farmId} />}
        {tab === "bvd" && <BvdTestingSection farmId={farmId} />}
        {tab === "casualty-slaughter" && <CasualtySlaughterSection farmId={farmId} />}
        {tab === "analytics" && <LivestockAnalyticsSection farmId={farmId} />}
      </ErrorBoundary>
    </AppLayout>
  );
}

// ─── BVD Testing Section ──────────────────────────────────────────────────────
const BVD_TEST_TYPES = [
  { value: "ear_notch_pcr", label: "Ear Notch PCR" },
  { value: "blood_elisa", label: "Blood ELISA" },
  { value: "milk_elisa", label: "Individual Milk ELISA" },
  { value: "blood_pcr", label: "Blood PCR" },
  { value: "bulk_milk_pcr", label: "Bulk Milk PCR" },
];
const BVD_RESULTS = [
  { value: "negative", label: "Negative" },
  { value: "positive", label: "Positive" },
  { value: "inconclusive", label: "Inconclusive" },
  { value: "pi_identified", label: "PI Animal Identified" },
];
const BVD_ACCRED = [
  { value: "not_accredited", label: "Not Accredited" },
  { value: "not_negative", label: "Not BVD-Negative" },
  { value: "negative_not_vaccinating", label: "BVD-Negative (Not Vaccinating)" },
  { value: "negative_vaccinating", label: "BVD-Negative (Vaccinating)" },
];
const BVD_SCHEMES = [
  { value: "CHeCS", label: "CHeCS Cattle Health Certification Standards" },
  { value: "ScotEID", label: "ScotEID" },
  { value: "other", label: "Other scheme" },
  { value: "none", label: "No scheme — independent testing" },
];

function BvdTestingSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["bvd-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const { data: herdsRaw } = useQuery<{ records: any[] } | any[] | null>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()),
    enabled: !!farmId,
  });
  // Normalise: HerdsSection (default tab) caches { records: Herd[] }; if this
  // queryFn runs first the API returns the same shape.  Guard Array.isArray so
  // the component also handles a future schema change without crashing.
  const herds: any[] = Array.isArray(herdsRaw) ? herdsRaw : ((herdsRaw as any)?.records ?? []);

  function openAdd() { setEditing(null); setForm({ result: "negative" }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  function printBvdRegister() {
    const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = (records as any[]).map((r: any) => `<tr>
      <td>${fmtD(r.testDate)}</td>
      <td>${BVD_TEST_TYPES.find((t: any) => t.value === r.testType)?.label ?? r.testType ?? "—"}</td>
      <td>${herds.find((h: any) => h.id === r.herdId)?.name ?? "—"}</td>
      <td>${r.result}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.piAnimalsFound ?? 0}</td>
      <td>${r.labName ?? "—"}</td>
      <td>${r.labRef ?? "—"}</td>
      <td>${BVD_ACCRED.find((a: any) => a.value === r.accreditationStatus)?.label ?? "—"}</td>
      <td>${fmtD(r.nextTestDue)}</td>
      <td>${r.vetName ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>BVD Testing Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>BVD Testing Register</h1>
<h2>Bovine Viral Diarrhoea Monitoring — Red Tractor Beef &amp; Dairy · ${records.length} record${records.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Result</th><th>Animals Tested</th><th>PI Found</th><th>Lab</th><th>Lab Ref</th><th>Accreditation Status</th><th>Next Test Due</th><th>Vet</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Red Tractor Beef &amp; Dairy: BVD monitoring records must be maintained and available at audit. Persistent Infectees (PIs) must be removed promptly. Retain records for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  async function save() {
    const url = editing ? `/api/farms/${farmId}/bvd-tests/${editing.id}` : `/api/farms/${farmId}/bvd-tests`;
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: ["bvd-tests", farmId] });
    setOpen(false);
  }

  async function del(id: number) {
    if (!confirm("Delete this BVD test record?")) return;
    await fetch(`/api/farms/${farmId}/bvd-tests/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["bvd-tests", farmId] });
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const resultBadge = (r: string) => {
    const colours: Record<string, string> = { negative: "bg-green-100 text-green-800", positive: "bg-red-100 text-red-800", pi_identified: "bg-red-200 text-red-900", inconclusive: "bg-amber-100 text-amber-800" };
    const label = BVD_RESULTS.find(x => x.value === r)?.label ?? r;
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[r] ?? "bg-gray-100 text-gray-700"}`}>{label}</span>;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">BVD Testing Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor Beef &amp; Dairy requires documented BVD monitoring. Record individual tests, PI findings, and herd accreditation status.</p>
        </div>
        <div className="flex gap-2">
          {records.length > 0 && <Button size="sm" variant="outline" onClick={printBvdRegister}><Printer className="w-3.5 h-3.5 mr-1" />Print Register</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Test</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="font-medium text-gray-600">No BVD test records yet</p>
          <p className="text-sm text-gray-400 mt-1">Add test results including ear notch, blood ELISA, or bulk milk PCR tests.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Test Date","Test Type","Herd","Result","Animals Tested","PI Found","Accreditation Status","Next Test Due",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.testDate)}</td>
                  <td className="px-3 py-2">{BVD_TEST_TYPES.find(t => t.value === r.testType)?.label ?? r.testType}</td>
                  <td className="px-3 py-2">{herds.find((h: any) => h.id === r.herdId)?.name ?? "—"}</td>
                  <td className="px-3 py-2">{resultBadge(r.result)}</td>
                  <td className="px-3 py-2">{r.animalsTestedCount ?? "—"}</td>
                  <td className="px-3 py-2">{r.piAnimalsFound ?? 0}</td>
                  <td className="px-3 py-2 text-xs">{BVD_ACCRED.find(a => a.value === r.accreditationStatus)?.label ?? "—"}</td>
                  <td className="px-3 py-2">{fmtDate(r.nextTestDue)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} BVD Test Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Test Date *</Label><Input type="date" value={form.testDate || ""} onChange={e => set("testDate", e.target.value)} /></div>
            <div><Label>Test Type *</Label>
              <Select value={form.testType || ""} onValueChange={v => set("testType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{BVD_TEST_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Herd</Label>
              <Select value={String(form.herdId || "__none__")} onValueChange={v => set("herdId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select herd" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— All herds</SelectItem>{herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Result *</Label>
              <Select value={form.result || "negative"} onValueChange={v => set("result", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BVD_RESULTS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Lab Name</Label><Input value={form.labName || ""} onChange={e => set("labName", e.target.value)} placeholder="e.g. SRUC, Biobest" /></div>
            <div><Label>Lab Reference</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>Animals Tested</Label><Input type="number" min="0" value={form.animalsTestedCount ?? ""} onChange={e => set("animalsTestedCount", e.target.value)} /></div>
            <div><Label>PI Animals Found</Label><Input type="number" min="0" value={form.piAnimalsFound ?? 0} onChange={e => set("piAnimalsFound", e.target.value)} /></div>
            <div><Label>Monitoring Scheme</Label>
              <Select value={form.monitoringScheme || "__none__"} onValueChange={v => set("monitoringScheme", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— None</SelectItem>{BVD_SCHEMES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Accreditation Status</Label>
              <Select value={form.accreditationStatus || "__none__"} onValueChange={v => set("accreditationStatus", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not set</SelectItem>{BVD_ACCRED.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Scheme Membership No.</Label><Input value={form.schemeMembershipNumber || ""} onChange={e => set("schemeMembershipNumber", e.target.value)} /></div>
            <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
            <div><Label>Next Test Due</Label><Input type="date" value={form.nextTestDue || ""} onChange={e => set("nextTestDue", e.target.value)} /></div>
            <div className="col-span-2"><Label>Actions Taken</Label><Textarea rows={2} value={form.actionsTaken || ""} onChange={e => set("actionsTaken", e.target.value)} placeholder="PI removal, vaccination decisions, biosecurity changes…" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Casualty / Emergency Slaughter Section ───────────────────────────────────
const CASUALTY_METHODS = [
  { value: "captive_bolt", label: "Captive Bolt (+ pithing/sticking)" },
  { value: "free_bullet", label: "Free Bullet" },
  { value: "barbiturate_injection", label: "Barbiturate Injection (Vet)" },
  { value: "other", label: "Other" },
];
const CARCASE_DISPOSAL = [
  { value: "licensed_contractor", label: "Licensed Fallen Stock Contractor" },
  { value: "hunt_kennel", label: "Hunt Kennel / Knacker" },
  { value: "incineration", label: "Licensed Incineration" },
  { value: "rendering", label: "Rendering Plant" },
  { value: "burial_permitted", label: "On-farm Burial (EA Permit)" },
  { value: "other", label: "Other permitted method" },
];

function CasualtySlaughterSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["casualty-slaughter", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/casualty-slaughter`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const { data: fallenContractors = [] } = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const { data: animalsData } = useQuery<{ records: { id: number; earTagNumber: string | null; species: string; breed: string | null; dateOfBirth: string | null; sex: string | null }[] }>({
    queryKey: ["farm-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  const animals = animalsData?.records ?? [];

  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  function handleEarTagChange(tag: string) {
    const matched = animals.find(a => a.earTagNumber && a.earTagNumber.toLowerCase() === tag.toLowerCase());
    if (matched) {
      const agePart = matched.dateOfBirth
        ? `${Math.floor((Date.now() - new Date(matched.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}yo `
        : "";
      const sexPart = matched.sex ? matched.sex + " " : "";
      const breedPart = matched.breed ?? matched.species;
      setForm((f: any) => ({ ...f, animalEarTag: tag, species: matched.species || f.species, ageOrDescription: `${agePart}${sexPart}${breedPart}`.trim() || f.ageOrDescription }));
    } else {
      set("animalEarTag", tag);
    }
  }

  function handleMethodChange(v: string) {
    setForm((f: any) => ({ ...f, method: v, veterinaryInvolved: v === "barbiturate_injection" ? true : f.veterinaryInvolved }));
  }

  function openAdd() { setEditing(null); setForm({ species: "Cattle", method: "captive_bolt", veterinaryInvolved: false }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  function printCasualtyRegister() {
    const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = (records as any[]).map((r: any) => `<tr>
      <td>${fmtD(r.eventDate)}</td>
      <td>${r.animalEarTag ?? "—"}</td>
      <td>${r.species}</td>
      <td>${r.ageOrDescription ?? "—"}</td>
      <td>${r.reasonForSlaughter ?? "—"}</td>
      <td>${CASUALTY_METHODS.find((m: any) => m.value === r.method)?.label ?? r.method ?? "—"}</td>
      <td>${r.veterinaryInvolved ? (r.vetName ?? r.performedBy ?? "—") : (r.performedBy ?? "—")}</td>
      <td>${r.veterinaryInvolved ? (r.rcvsNumber ?? "—") : (r.waskWatokCertRef ?? "—")}</td>
      <td>${CARCASE_DISPOSAL.find((c: any) => c.value === r.carcaseDisposalMethod)?.label ?? r.carcaseDisposalMethod ?? "—"}</td>
      <td>${r.notes ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Casualty / Emergency Slaughter Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Casualty / Emergency Slaughter Register</h1>
<h2>On-Farm Emergency Killing Record — Red Tractor · ${records.length} event${records.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Ear Tag</th><th>Species</th><th>Age / Description</th><th>Reason</th><th>Method</th><th>Performed By</th><th>WASK/WATOK / RCVS No.</th><th>Disposal</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Red Tractor requires a record of every on-farm emergency killing. The person carrying out the slaughter must hold a valid WASK/WATOK certificate, or where a barbiturate injection is used, the attending vet must be RCVS registered. Records must be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  async function save() {
    const payload = { ...form };
    if (payload.veterinaryInvolved && !payload.performedBy && payload.vetName) {
      payload.performedBy = payload.vetName;
    }
    const url = editing ? `/api/farms/${farmId}/casualty-slaughter/${editing.id}` : `/api/farms/${farmId}/casualty-slaughter`;
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    qc.invalidateQueries({ queryKey: ["casualty-slaughter", farmId] });
    qc.invalidateQueries({ queryKey: ["farm-animals", farmId] });
    setOpen(false);
  }

  async function del(id: number) {
    if (!confirm("Delete this casualty slaughter record?")) return;
    await fetch(`/api/farms/${farmId}/casualty-slaughter/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["casualty-slaughter", farmId] });
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const matchedAnimal = (tag: string) => animals.find(a => a.earTagNumber?.toLowerCase() === tag?.toLowerCase());

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Casualty / Emergency Slaughter Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor requires a record of every on-farm emergency killing. The person carrying out the slaughter must hold a valid WASK/WATOK certificate.</p>
        </div>
        <div className="flex gap-2">
          {records.length > 0 && <Button size="sm" variant="outline" onClick={printCasualtyRegister}><Printer className="w-3.5 h-3.5 mr-1" />Print Register</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Event</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="font-medium text-gray-600">No casualty slaughter events recorded</p>
          <p className="text-sm text-gray-400 mt-1">Record emergency on-farm killings here, separate from natural mortality.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Date","Ear Tag","Species","Reason","Method","Performed By","WASK/WATOK / RCVS","Disposal",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.eventDate)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.animalEarTag || "—"}</td>
                  <td className="px-3 py-2">{r.species}</td>
                  <td className="px-3 py-2 max-w-[140px] truncate" title={r.reasonForSlaughter}>{r.reasonForSlaughter}</td>
                  <td className="px-3 py-2 text-xs">{CASUALTY_METHODS.find(m => m.value === r.method)?.label ?? r.method}</td>
                  <td className="px-3 py-2">{r.veterinaryInvolved ? (r.vetName || r.performedBy) : r.performedBy}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.veterinaryInvolved ? (r.rcvsNumber || "—") : (r.waskWatokCertRef || "—")}</td>
                  <td className="px-3 py-2 text-xs">{CARCASE_DISPOSAL.find(c => c.value === r.carcaseDisposalMethod)?.label ?? r.carcaseDisposalMethod ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Casualty Slaughter Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Event Date *</Label><Input type="date" value={form.eventDate || ""} onChange={e => set("eventDate", e.target.value)} /></div>
            <div><Label>Species *</Label>
              <Select value={form.species || "Cattle"} onValueChange={v => set("species", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Cattle","Sheep","Pig","Goat","Other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ear Tag / ID</Label>
              <Input value={form.animalEarTag || ""} onChange={e => handleEarTagChange(e.target.value)} placeholder="UK ear tag number" />
              {form.animalEarTag && matchedAnimal(form.animalEarTag) && (
                <p className="text-xs text-green-700 mt-1">Matched — breed &amp; age auto-filled from animal register.</p>
              )}
            </div>
            <div>
              <Label>Breed / Age</Label>
              <Input value={form.ageOrDescription || ""} onChange={e => set("ageOrDescription", e.target.value)} placeholder="e.g. 3yo Holstein cow" />
            </div>
            <div className="col-span-2"><Label>Reason for Slaughter *</Label><Input value={form.reasonForSlaughter || ""} onChange={e => set("reasonForSlaughter", e.target.value)} placeholder="e.g. Severe fracture — irretrievable" /></div>
            <div><Label>Method *</Label>
              <Select value={form.method || "captive_bolt"} onValueChange={handleMethodChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CASUALTY_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Witness</Label><Input value={form.witnessName || ""} onChange={e => set("witnessName", e.target.value)} /></div>
            <div className="col-span-2 flex items-center gap-2 pt-1">
              <input type="checkbox" id="vetinv" checked={!!form.veterinaryInvolved} onChange={e => set("veterinaryInvolved", e.target.checked)} className="rounded" />
              <Label htmlFor="vetinv">Veterinary surgeon involved</Label>
            </div>
            {form.veterinaryInvolved ? (
              <>
                <div><Label>Vet Name *</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Full name" /></div>
                <div><Label>RCVS Number</Label><Input value={form.rcvsNumber || ""} onChange={e => set("rcvsNumber", e.target.value)} placeholder="e.g. 1234567" /></div>
              </>
            ) : (
              <>
                <div><Label>Performed By *</Label><StaffSelect value={form.performedBy || ""} onChange={v => set("performedBy", v)} staffNames={staffNames} loading={staffLoading} /></div>
                <div><Label>WASK/WATOK Certificate Ref</Label><Input value={form.waskWatokCertRef || ""} onChange={e => set("waskWatokCertRef", e.target.value)} placeholder="Certificate number" /></div>
              </>
            )}
            <div><Label>Carcase Disposal Method</Label>
              <Select value={form.carcaseDisposalMethod || "__none__"} onValueChange={v => set("carcaseDisposalMethod", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select disposal method" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not yet arranged</SelectItem>{CARCASE_DISPOSAL.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Disposal Contractor</Label>
              <Select value={String(form.carcaseDisposalContractorId || "__none__")} onValueChange={v => set("carcaseDisposalContractorId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select contractor" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— None / N/A</SelectItem>{fallenContractors.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Carcase Collection Date</Label><Input type="date" value={form.carcaseCollectionDate || ""} onChange={e => set("carcaseCollectionDate", e.target.value)} /></div>
            <div><Label>Disposal / Collection Note Ref</Label><Input value={form.carcaseDisposalRef || ""} onChange={e => set("carcaseDisposalRef", e.target.value)} placeholder="NFAS cert / waste transfer note ref" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
