import React, { useState } from "react";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { printProReport, openPrintWindow } from "@/lib/print-report";
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
  breed: string | null;
  herdNumber: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

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
  createdAt: string;
}

interface WaterRecord {
  id: number;
  farmId: number;
  herdId: number | null;
  waterSource: string;
  testDate: string | null;
  testResult: string | null;
  testPass: boolean | null;
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

const EMPTY_HERD = { name: "", type: "", breed: "", herdNumber: "", notes: "" };
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
          <td style="text-transform:capitalize">${h.type || "—"}</td>
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
                    <td className="border border-border/60 px-3 py-2 capitalize">{h.type || "—"}</td>
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

function HerdsSection({ farmId }: { farmId: number }) {
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
    setFormData({ name: h.name ?? "", type: h.type ?? "", breed: h.breed ?? "", herdNumber: h.herdNumber ?? "", notes: h.notes ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...formData };
    if (editingHerd) { updateMutation.mutate({ id: editingHerd.id, body }); }
    else { createMutation.mutate(body); }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Name <span className="text-red-500">*</span></label>
                  <Input placeholder="e.g. Main Dairy Herd" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Species <span className="text-red-500">*</span></label>
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} required>
                    <option value="">Select species...</option>
                    {livestockSpecies.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Breed</label>
                  <Input placeholder="e.g. Holstein Friesian" value={formData.breed} onChange={e => setFormData(f => ({ ...f, breed: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Herd / Flock Number</label>
                  <Input placeholder="e.g. 32/541/0012" value={formData.herdNumber} onChange={e => setFormData(f => ({ ...f, herdNumber: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                  <Input placeholder="Any additional notes" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
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
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Herd No.</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => (
                  <tr key={h.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{h.name}</td>
                    <td className="p-4 text-sm capitalize text-foreground/70">{h.type || "—"}</td>
                    <td className="p-4 text-sm text-foreground/70">{h.breed || "—"}</td>
                    <td className="p-4 text-sm font-mono text-foreground/70">{h.herdNumber || "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewHerd(h)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(h)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(h.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Type</p><p className="capitalize">{viewHerd.type || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Breed</p><p>{viewHerd.breed || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Herd Number</p><p className="font-mono text-xs">{viewHerd.herdNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><p>{viewHerd.isActive ? "Active" : "Inactive"}</p></div>
              </div>
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

function VetHealthPlansSection({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VetHealthPlan | null>(null);
  const [viewPlan, setViewPlan] = useState<VetHealthPlan | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_PLAN>(EMPTY_PLAN);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [printPlan, setPrintPlan] = useState<VetHealthPlan | null>(null);

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
    </>
  );
}

const CAUSE_LABELS: Record<string, string> = {
  disease: "Disease / Illness", injury: "Injury / Trauma", metabolic: "Metabolic Disorder",
  "difficult-birth": "Difficult Birth", hypothermia: "Hypothermia / Exposure",
  predation: "Predation", accidental: "Accidental", euthanised: "Euthanised",
  unknown: "Unknown / Sudden Death", other: "Other",
};
const DISPOSAL_LABELS: Record<string, string> = {
  nfas: "Fallen Stock (NFAS)", "hunt-kennel": "Hunt Kennel / Knacker",
  incineration: "Incineration / Cremation", "burial-licensed": "On-farm Burial",
  rendering: "Rendering Plant", other: "Other",
};

const CONTRACTOR_TYPES: Record<string, string> = {
  "nfas-collector": "NFAS Fallen Stock Collector",
  "hunt-kennel": "Hunt Kennel",
  "knacker": "Knacker / Slaughterer",
  "rendering": "Rendering Plant",
  "incinerator": "Licensed Incinerator",
  "other": "Other",
};

const EMPTY_MORTALITY = {
  animalId: "" as string,
  contractorId: "" as string,
  tagNumber: "", species: "", breed: "", dateOfDeath: new Date().toISOString().slice(0, 10),
  causeOfDeath: "", disposalMethod: "", disposalOperator: "", disposalRef: "",
  veterinaryAttended: false, vetName: "", postMortemCarriedOut: false, postMortemFindings: "",
  bcmsNotified: false, bcmsNotificationRef: "", notes: "",
};

function MortalitySection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const mortalitySpecies = useLookupStrings("livestock_species", ANIMAL_SPECIES_FALLBACK);
  const base = `/api/farms/${farmId}/mortality-records`;
  const { data, isLoading } = useQuery<{ records: MortalityRecord[] }>({
    queryKey: ["mortality", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const { data: animals = [] } = useQuery<Animal[]>({
    queryKey: ["livestock-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/livestock-animals`).then(r => r.json()).then(d => d.records ?? []),
  });
  const activeAnimals = animals.filter(a => a.status === "active");

  const { data: contractors = [] } = useQuery<FallenStockContractor[]>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then(r => r.json()),
  });
  const activeContractors = contractors.filter(c => c.isActive);

  const { data: vetPlans = [] } = useQuery<VetHealthPlan[]>({
    queryKey: ["vet-health-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-health-plans`).then(r => r.json()).then(d => d.records ?? []),
  });
  // Deduplicated list of vets from health plans (most recent plan for each vet)
  const knownVets = vetPlans.reduce<{ label: string; value: string }[]>((acc, p) => {
    const value = [p.vetName, p.practiceName].filter(Boolean).join(" — ");
    if (!acc.find(v => v.value === value)) acc.push({ label: value + (p.practicePhone ? ` · ${p.practicePhone}` : ""), value });
    return acc;
  }, []);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MortalityRecord | null>(null);
  const [viewMortality, setViewMortality] = useState<MortalityRecord | null>(null);
  const [form, setForm] = useState(EMPTY_MORTALITY);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [useOtherVet, setUseOtherVet] = useState(false);

  function setField(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })); }

  function handleAnimalSelect(animalId: string) {
    if (animalId === "__none__") {
      setForm(f => ({ ...f, animalId: "", tagNumber: "", species: "", breed: "" }));
      return;
    }
    const a = activeAnimals.find(x => String(x.id) === animalId);
    if (a) {
      setForm(f => ({
        ...f,
        animalId,
        tagNumber: a.earTagNumber ?? a.tagNumber ?? "",
        species: a.species,
        breed: a.breed ?? "",
      }));
    }
  }

  function handleContractorSelect(contractorId: string) {
    if (contractorId === "__none__") { setForm(f => ({ ...f, contractorId: "", disposalOperator: "", disposalRef: "" })); return; }
    const c = activeContractors.find(x => String(x.id) === contractorId);
    if (c) setForm(f => ({ ...f, contractorId, disposalOperator: c.name, disposalRef: f.disposalRef || "" }));
  }

  const selectedContractor = activeContractors.find(c => String(c.id) === form.contractorId);

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_MORTALITY) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      qc.invalidateQueries({ queryKey: ["livestock-animals", farmId] });
      setShowForm(false); setForm(EMPTY_MORTALITY); setUseOtherVet(false);
    },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_MORTALITY & { id: number }) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_MORTALITY); setUseOtherVet(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: MortalityRecord) {
    setEditing(r);
    const existingVet = r.vetName ?? "";
    const isKnownVet = knownVets.some(v => v.value === existingVet);
    setUseOtherVet(existingVet !== "" && !isKnownVet);
    setForm({
      animalId: r.animalId ? String(r.animalId) : "",
      contractorId: r.contractorId ? String(r.contractorId) : "",
      tagNumber: r.tagNumber ?? "", species: r.species, breed: r.breed ?? "",
      dateOfDeath: r.dateOfDeath?.slice(0, 10) ?? "", causeOfDeath: r.causeOfDeath,
      disposalMethod: r.disposalMethod, disposalOperator: r.disposalOperator ?? "",
      disposalRef: r.disposalRef ?? "", veterinaryAttended: r.veterinaryAttended,
      vetName: existingVet, postMortemCarriedOut: r.postMortemCarriedOut,
      postMortemFindings: r.postMortemFindings ?? "", bcmsNotified: r.bcmsNotified,
      bcmsNotificationRef: r.bcmsNotificationRef ?? "", notes: r.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
  }

  const animalLinked = !!form.animalId;

  const filtered = records.filter(r =>
    (r.tagNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
    r.species.toLowerCase().includes(search.toLowerCase()) ||
    r.causeOfDeath.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by tag, species or cause…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_MORTALITY); setUseOtherVet(false); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Record
        </Button>
      </div>

      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
        <strong>Legal requirement:</strong> Keep mortality records for a minimum of 3 years. Cattle deaths must be notified to BCMS within 7 days. Retain disposal certificates.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matching records found." : "No mortality records yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tag / Species</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cause</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Disposal</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">BCMS</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vet</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{formatDate(r.dateOfDeath)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.tagNumber || <span className="text-muted-foreground italic">No tag</span>}</div>
                    <div className="text-xs text-muted-foreground capitalize">{r.species}{r.breed ? ` · ${r.breed}` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{CAUSE_LABELS[r.causeOfDeath] ?? r.causeOfDeath}</td>
                  <td className="px-4 py-3 text-xs">{DISPOSAL_LABELS[r.disposalMethod] ?? r.disposalMethod}</td>
                  <td className="px-4 py-3">
                    {r.bcmsNotified
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /> Notified</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" /> Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.veterinaryAttended ? r.vetName || "Yes" : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewMortality(r)}><Eye className="h-3 w-3" /></Button>
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

      {viewMortality && (
        <Dialog open onOpenChange={() => setViewMortality(null)}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader><DialogTitle>Mortality Record</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Date of Death</p><p>{formatDate(viewMortality.dateOfDeath)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Tag Number</p><p className="font-mono text-xs">{viewMortality.tagNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Species</p><p className="capitalize">{viewMortality.species}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Breed</p><p>{viewMortality.breed || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Cause of Death</p><p>{CAUSE_LABELS[viewMortality.causeOfDeath] ?? viewMortality.causeOfDeath}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Disposal Method</p><p>{DISPOSAL_LABELS[viewMortality.disposalMethod] ?? viewMortality.disposalMethod}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Disposal Operator</p><p>{viewMortality.disposalOperator || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Disposal Ref</p><p className="font-mono text-xs">{viewMortality.disposalRef || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">BCMS Notified</p><p>{viewMortality.bcmsNotified ? "Yes" : "Pending"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vet Attended</p><p>{viewMortality.veterinaryAttended ? (viewMortality.vetName || "Yes") : "No"}</p></div>
              </div>
              {viewMortality.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewMortality.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewMortality); setViewMortality(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewMortality(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); setUseOtherVet(false); } }}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Mortality Record" : "Log Animal Mortality"}</DialogTitle>
              <DialogDescription>Required for Red Tractor and BCMS compliance. Retain for 3 years.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* ── Animal lookup ── */}
              <div>
                <Label>Animal from Register</Label>
                <Select value={form.animalId || "__none__"} onValueChange={handleAnimalSelect}>
                  <SelectTrigger><SelectValue placeholder="Search by ear tag or select animal…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Not in register / manual entry —</SelectItem>
                    {activeAnimals.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.earTagNumber ?? a.tagNumber ?? `#${a.id}`} — {a.species}{a.breed ? ` (${a.breed})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {animalLinked && <p className="text-xs text-green-700 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Linked to animal record — tag, species and breed locked from register</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <Label>Ear Tag / Tag Number</Label>
                  <Input value={form.tagNumber} onChange={e => setField("tagNumber", e.target.value)} placeholder="e.g. UK123456 78901" readOnly={animalLinked} className={animalLinked ? "bg-gray-50 text-gray-500" : ""} />
                </div>
                <div>
                  <Label>Species *</Label>
                  {animalLinked ? (
                    <Input value={form.species} readOnly className="bg-gray-50 text-gray-500" />
                  ) : (
                    <Select value={form.species} onValueChange={v => setField("species", v)}>
                      <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                      <SelectContent>
                        {mortalitySpecies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input value={form.breed} onChange={e => setField("breed", e.target.value)} placeholder="e.g. Limousin × Friesian" readOnly={animalLinked} className={animalLinked ? "bg-gray-50 text-gray-500" : ""} />
                </div>
                <div><Label>Date of Death *</Label><Input type="date" value={form.dateOfDeath} onChange={e => setField("dateOfDeath", e.target.value)} required /></div>
                <div><Label>Cause of Death *</Label>
                  <Select value={form.causeOfDeath} onValueChange={v => setField("causeOfDeath", v)}>
                    <SelectTrigger><SelectValue placeholder="Select cause" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CAUSE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Disposal Method *</Label>
                  <Select value={form.disposalMethod} onValueChange={v => setField("disposalMethod", v)}>
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DISPOSAL_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* ── Contractor lookup ── */}
                <div className="col-span-2">
                  <Label>Disposal Operator / Collector</Label>
                  {activeContractors.length > 0 ? (
                    <Select value={form.contractorId || "__none__"} onValueChange={handleContractorSelect}>
                      <SelectTrigger><SelectValue placeholder="Select registered contractor…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Select contractor —</SelectItem>
                        {activeContractors.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name} <span className="text-gray-400">({CONTRACTOR_TYPES[c.operatorType] ?? c.operatorType})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={form.disposalOperator} onChange={e => setField("disposalOperator", e.target.value)} placeholder="Operator name — add contractors in the Contractors tab" />
                  )}
                  {selectedContractor && (
                    <div className="mt-1.5 rounded bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-purple-800 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span>APHA Approval No: <strong className="font-mono">{selectedContractor.approvalNumber}</strong></span>
                      {selectedContractor.phone && <span>· {selectedContractor.phone}</span>}
                    </div>
                  )}
                </div>

                <div className="col-span-2"><Label>Disposal Reference / Certificate No.</Label><Input value={form.disposalRef} onChange={e => setField("disposalRef", e.target.value)} placeholder="NFAS certificate no. or collection note ref" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.veterinaryAttended} onChange={e => setField("veterinaryAttended", e.target.checked)} className="rounded" />
                  Veterinary attended
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.postMortemCarriedOut} onChange={e => setField("postMortemCarriedOut", e.target.checked)} className="rounded" />
                  Post-mortem carried out
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.bcmsNotified} onChange={e => setField("bcmsNotified", e.target.checked)} className="rounded" />
                  BCMS notified
                </label>
              </div>
              {form.veterinaryAttended && (
                <div>
                  <Label>Attending Vet / Practice</Label>
                  {knownVets.length > 0 ? (
                    <>
                      <Select
                        value={(!useOtherVet && knownVets.find(v => v.value === form.vetName)) ? form.vetName : (useOtherVet ? "__other__" : "__none__")}
                        onValueChange={v => {
                          if (v === "__none__") { setUseOtherVet(false); setField("vetName", ""); }
                          else if (v === "__other__") { setUseOtherVet(true); setField("vetName", ""); }
                          else { setUseOtherVet(false); setField("vetName", v); }
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select from your vet register…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select vet —</SelectItem>
                          {knownVets.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                          <SelectItem value="__other__">Other / manual entry…</SelectItem>
                        </SelectContent>
                      </Select>
                      {useOtherVet && (
                        <Input className="mt-2" value={form.vetName} onChange={e => setField("vetName", e.target.value)} placeholder="e.g. Mr A. Jones BVSc — Shire Vets" autoFocus />
                      )}
                    </>
                  ) : (
                    <Input value={form.vetName} onChange={e => setField("vetName", e.target.value)} placeholder="e.g. Mr A. Jones BVSc — add vets in Vet Health Plans" />
                  )}
                </div>
              )}
              {form.postMortemCarriedOut && <div><Label>Post-mortem Findings</Label><Textarea value={form.postMortemFindings} onChange={e => setField("postMortemFindings", e.target.value)} placeholder="Summary of PM findings..." rows={2} /></div>}
              {form.bcmsNotified && <div><Label>BCMS Notification Reference</Label><Input value={form.bcmsNotificationRef} onChange={e => setField("bcmsNotificationRef", e.target.value)} placeholder="BCMS submission reference" /></div>}
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Additional circumstances or observations..." rows={2} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setUseOtherVet(false); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : editing ? "Update Record" : "Save Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Mortality Record?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
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
};

function FallenStockContractorsSection({ farmId }: { farmId: number }) {
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
          <h3 className="font-semibold text-gray-900">Fallen Stock Contractors</h3>
          <p className="text-sm text-gray-500 mt-0.5">Registered ABP-approved collectors and disposal operators. Only contractors listed here can be selected on mortality records.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" }); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Contractor
        </Button>
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Regulatory note:</strong> Under the Animal By-Products Regulations, fallen stock must be collected by an APHA-approved operator. Record their official approval/registration number here to ensure your mortality records are audit-ready.
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
              <DialogTitle>{editing ? "Edit Contractor" : "Add Fallen Stock Contractor"}</DialogTitle>
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
                {editing ? "Update" : "Add Contractor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Contractor?</DialogTitle><DialogDescription>This will remove them from the register. Existing mortality records won't be affected.</DialogDescription></DialogHeader>
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

function FeedSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}/feed-records`;
  const { data, isLoading } = useQuery<{ records: FeedRecord[] }>({
    queryKey: ["feed-records", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeedRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FEED);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_FEED) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); setShowForm(false); setForm(EMPTY_FEED); },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_FEED & { id: number }) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_FEED); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: FeedRecord) {
    setEditing(r);
    setForm({
      feedType: r.feedType, supplier: r.supplier ?? "", batchNumber: r.batchNumber ?? "",
      quantityKg: r.quantityKg ?? "", feedDate: r.feedDate?.slice(0, 10) ?? "", notes: r.notes ?? "",
    });
    setShowForm(true);
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
        <strong>Traceability requirement:</strong> Record all feed deliveries with supplier name and batch/lot number. Retain purchase invoices and delivery notes for 3 years.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matching records." : "No feed records yet. Add your first delivery."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Feed Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Batch No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qty (kg)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{formatDate(r.feedDate)}</td>
                  <td className="px-4 py-3 font-medium">{FEED_TYPE_LABELS[r.feedType] ?? r.feedType}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.supplier || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.batchNumber || "—"}</td>
                  <td className="px-4 py-3 font-medium">{r.quantityKg ? `${Number(r.quantityKg).toLocaleString()} kg` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
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
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Feed Record" : "Add Feed Record"}</DialogTitle>
              <DialogDescription>Record feed deliveries with supplier and batch number for traceability.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><Label>Feed Type *</Label>
                  <Select value={form.feedType} onValueChange={v => setField("feedType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FEED_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Feed Date *</Label><Input type="date" value={form.feedDate} onChange={e => setField("feedDate", e.target.value)} required /></div>
                <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setField("supplier", e.target.value)} placeholder="Supplier name" /></div>
                <div><Label>Batch / Lot Number</Label><Input value={form.batchNumber} onChange={e => setField("batchNumber", e.target.value)} placeholder="As on delivery note" /></div>
                <div><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg} onChange={e => setField("quantityKg", e.target.value)} placeholder="e.g. 500" min="0" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Ration changes, refusals, etc." rows={2} /></div>
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
            <DialogHeader><DialogTitle>Delete Feed Record?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
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
  waterSource: "", testDate: new Date().toISOString().slice(0, 10),
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

function WaterSection({ farmId }: { farmId: number }) {
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

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_WATER) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setShowForm(false); setForm(EMPTY_WATER); },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_WATER & { id: number }) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_WATER); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: WaterRecord) {
    setEditing(r);
    setForm({
      waterSource: r.waterSource, testDate: r.testDate?.slice(0, 10) ?? "",
      testResult: r.testResult ?? "", testPass: r.testPass === false ? "false" : "true", notes: r.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
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
                  <Select value={form.waterSource} onValueChange={v => setField("waterSource", v)}>
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(WATER_SOURCE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Test Date</Label><Input type="date" value={form.testDate} onChange={e => setField("testDate", e.target.value)} /></div>
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

function AnimalsSection({ farmId }: { farmId: number }) {
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
  const animals = animalsData?.records ?? [];
  const herds = herdsData?.records ?? [];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [form, setForm] = useState(EMPTY_ANIMAL);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [qrAnimal, setQrAnimal] = useState<Animal | null>(null);
  const [isSavingAnimalCode, setIsSavingAnimalCode] = useState(false);

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

  const filtered = animals.filter(a =>
    !search ||
    (a.earTagNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.eidNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.tagNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
    a.species.toLowerCase().includes(search.toLowerCase()) ||
    (a.breed ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const herdName = (herdId: number | null) => herds.find(h => h.id === herdId)?.name ?? "—";

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by ear tag, EID, species or breed…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_ANIMAL); setShowForm(true); }}>
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
          {search ? "No animals match your search." : "No individual animals registered yet. Click 'Register Animal' to add the first record."}
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
        const saveAnimalCode = async (code: string) => {
          setIsSavingAnimalCode(true);
          try {
            await fetch(`/api/farms/${farmId}/animals/${qrAnimal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ animalCode: code }) });
            qc.invalidateQueries({ queryKey: ["animals", farmId] });
            setQrAnimal(prev => prev ? { ...prev, animalCode: code } : null);
          } finally { setIsSavingAnimalCode(false); }
        };
        return (
          <Dialog open onOpenChange={o => { if (!o) setQrAnimal(null); }}>
            <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><QrCode className="w-4 h-4 text-teal-600" /> Animal QR Label</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-xs text-muted-foreground font-medium">{qrAnimal.earTagNumber || qrAnimal.tagNumber || `Animal #${qrAnimal.id}`}</p>
                {displayCode ? (
                  <>
                    <span className="font-mono text-lg font-bold tracking-widest text-teal-700">{displayCode}</span>
                    <QRCodeSVG value={displayCode} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
                    <p className="text-xs text-muted-foreground text-center">Attach this label to the animal's record folder or paddock sign so field workers can scan it.</p>
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2"><Printer className="w-3.5 h-3.5" /> Print Label</Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
                      <QrCode className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">No QR code yet. Assign code <strong className="font-mono">{autoCode}</strong> to this animal.</p>
                    <Button onClick={() => saveAnimalCode(autoCode)} disabled={isSavingAnimalCode} className="gap-2">
                      {isSavingAnimalCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                      Generate QR Code
                    </Button>
                  </>
                )}
              </div>
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
                  <Select value={form.species} onValueChange={v => setField("species", v)}>
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
                  <Select value={form.sex} onValueChange={v => setField("sex", v)}>
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
                  <Select value={form.herdId} onValueChange={v => setField("herdId", v)}>
                    <SelectTrigger><SelectValue placeholder="Assign to herd (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— Unassigned —</SelectItem>
                      {herds.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Acquisition Date</Label>
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
    </>
  );
}

// ─── Sire Register Section ─────────────────────────────────────────────────────
function SiresSection({ farmId }: { farmId: number }) {
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
              <div><Label>Breed</Label><Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="e.g. Aberdeen Angus" /></div>
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
function AIReproductionSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

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
  const { data: membersData } = useFarmMembers(farmId);

  const herds: Herd[] = (herdsData?.records ?? []).filter((h: Herd) => h.isActive);
  const allAnimals: Animal[] = animalsData?.records ?? [];
  const activeSires: Sire[] = (siresData?.records ?? []).filter((s: Sire) => s.isActive);

  // Filter animals to selected herd (if any), active only
  const selectedHerdId = form.herdId ? Number(form.herdId) : null;
  const herdAnimals = allAnimals.filter(a =>
    a.status !== "Dead" && a.status !== "Sold" &&
    (selectedHerdId ? a.herdId === selectedHerdId : true)
  );

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

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ai-reproduction", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`, { credentials: "include" }).then(r => r.json()),
  });

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
                    <td className="py-2 text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(r.id as number); }}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent></Card>
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
                      {h.name}{h.type ? ` (${h.type})` : ""}
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

            <div><Label>Straw / Batch Ref</Label><Input value={String(form.strawBatchRef ?? "")} onChange={e => setForm(f => ({ ...f, strawBatchRef: e.target.value }))} /></div>
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

// ─── Vet Prescriptions Section ──────────────────────────────────────────────────
function VetPrescriptionsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

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
          <h3 className="font-semibold">Veterinary Prescriptions</h3>
          <p className="text-sm text-muted-foreground">Record all veterinary prescriptions and dispensed medicines for audit compliance.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ signedByVet: true, farmRegistered: true }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Prescription
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <Card><CardContent className="pt-4">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground italic py-4 text-center">No prescriptions recorded yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Date", "Ref", "Vet / Practice", "Product", "Species/Group", "Qty Rx", "Withdrawal Meat", "Withdrawal Milk", "Valid Until"].map(h => <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground">{h}</th>)}
                  <th />
                </tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4">{r.prescriptionDate ? new Date(r.prescriptionDate as string).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{String(r.prescriptionRef ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.vetName ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.productName ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.speciesAndBreed ?? r.animalGroupDescription ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.quantityPrescribed ?? "—")}</td>
                    <td className="py-2 pr-4">{r.withdrawalPeriodMeat ? `${r.withdrawalPeriodMeat} days` : "—"}</td>
                    <td className="py-2 pr-4">{r.withdrawalPeriodMilk ? `${r.withdrawalPeriodMilk} days` : "—"}</td>
                    <td className="py-2 pr-4">{r.prescriptionValidUntil ? new Date(r.prescriptionValidUntil as string).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="py-2 text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(r.id as number); }}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent></Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "48rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Prescription" : "Add Veterinary Prescription"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Prescription Date *</Label><Input type="date" value={String(form.prescriptionDate ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionDate: e.target.value }))} /></div>
            <div><Label>Prescription Reference</Label><Input value={String(form.prescriptionRef ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionRef: e.target.value }))} /></div>
            <div><Label>Vet Name *</Label><Input value={String(form.vetName ?? "")} onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))} /></div>
            <div><Label>Vet Practice *</Label><Input value={String(form.vetPractice ?? "")} onChange={e => setForm(f => ({ ...f, vetPractice: e.target.value }))} /></div>
            <div><Label>Vet RCVS Number</Label><Input value={String(form.vetRcvsNumber ?? "")} onChange={e => setForm(f => ({ ...f, vetRcvsNumber: e.target.value }))} /></div>
            <div><Label>Product Name *</Label><Input value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Active Ingredient</Label><Input value={String(form.activeIngredient ?? "")} onChange={e => setForm(f => ({ ...f, activeIngredient: e.target.value }))} /></div>
            <div><Label>Species & Breed</Label><Input value={String(form.speciesAndBreed ?? "")} onChange={e => setForm(f => ({ ...f, speciesAndBreed: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Animal Group Description</Label><Input value={String(form.animalGroupDescription ?? "")} onChange={e => setForm(f => ({ ...f, animalGroupDescription: e.target.value }))} /></div>
            <div><Label>Route *</Label>
              <Select value={String(form.routeOfAdministration ?? "")} onValueChange={v => setForm(f => ({ ...f, routeOfAdministration: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Oral", "Injection (IM)", "Injection (SC)", "Injection (IV)", "Topical", "Pour-on", "Intramammary", "Intrauterine", "In-water", "In-feed"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Dose</Label><Input value={String(form.dose ?? "")} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} /></div>
            <div><Label>Frequency</Label><Input value={String(form.frequency ?? "")} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} /></div>
            <div><Label>Treatment Duration</Label><Input value={String(form.treatmentDuration ?? "")} onChange={e => setForm(f => ({ ...f, treatmentDuration: e.target.value }))} /></div>
            <div><Label>Quantity Prescribed</Label><Input value={String(form.quantityPrescribed ?? "")} onChange={e => setForm(f => ({ ...f, quantityPrescribed: e.target.value }))} /></div>
            <div><Label>Quantity Dispensed</Label><Input value={String(form.quantityDispensed ?? "")} onChange={e => setForm(f => ({ ...f, quantityDispensed: e.target.value }))} /></div>
            <div><Label>Batch Number</Label><Input value={String(form.batchNumber ?? "")} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate ?? "")} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            <div><Label>Withdrawal — Meat (days)</Label><Input type="number" value={String(form.withdrawalPeriodMeat ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodMeat: e.target.value }))} /></div>
            <div><Label>Withdrawal — Milk (days)</Label><Input type="number" value={String(form.withdrawalPeriodMilk ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodMilk: e.target.value }))} /></div>
            <div><Label>Withdrawal — Eggs (days)</Label><Input type="number" value={String(form.withdrawalPeriodEggs ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodEggs: e.target.value }))} /></div>
            <div><Label>Prescription Valid Until</Label><Input type="date" value={String(form.prescriptionValidUntil ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionValidUntil: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2">
              {([["signedByVet", "Signed by vet?"], ["farmRegistered", "Farm registered for prescribing?"]] as [string, string][]).map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <input type="checkbox" id={k} checked={Boolean(form[k])} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} className="w-4 h-4" />
                  <Label htmlFor={k}>{l}</Label>
                </div>
              ))}
            </div>
            <div className="col-span-2"><Label>Reason for Prescribing</Label><Textarea value={String(form.reasonForPrescribing ?? "")} onChange={e => setForm(f => ({ ...f, reasonForPrescribing: e.target.value }))} rows={2} /></div>
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

export default function LivestockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<"herds" | "vet-plans" | "mortality" | "contractors" | "feed" | "water" | "animals" | "ai-repro" | "vet-rx" | "sires">("herds");

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
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Contractors</span>
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
        <TabButton active={tab === "ai-repro"} onClick={() => setTab("ai-repro")}>
          <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> AI & Reproduction</span>
        </TabButton>
        <TabButton active={tab === "vet-rx"} onClick={() => setTab("vet-rx")}>
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Vet Prescriptions</span>
        </TabButton>
      </TabBar>
      {tab === "herds" && <HerdsSection farmId={farmId} />}
      {tab === "animals" && <AnimalsSection farmId={farmId} />}
      {tab === "vet-plans" && <VetHealthPlansSection farmId={farmId} />}
      {tab === "mortality" && <MortalitySection farmId={farmId} />}
      {tab === "contractors" && <FallenStockContractorsSection farmId={farmId} />}
      {tab === "feed" && <FeedSection farmId={farmId} />}
      {tab === "water" && <WaterSection farmId={farmId} />}
      {tab === "sires" && <SiresSection farmId={farmId} />}
      {tab === "ai-repro" && <AIReproductionSection farmId={farmId} />}
      {tab === "vet-rx" && <VetPrescriptionsSection farmId={farmId} />}
    </AppLayout>
  );
}
