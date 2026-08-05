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
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";

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
  const [tab, setTab] = useState<"overview" | "medicines" | "vaccinations" | "movements" | "breeding" | "health" | "tb-tests" | "documents">("overview");

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
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      setDocTitle(""); setDocNotes("");
      refetchDocs();
    },
  });

  async function deleteDoc(docId: number) {
    setDeletingDocId(docId);
    await fetch(`/api/farms/${farmId}/animals/${animal.id}/documents/${docId}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    setDeletingDocId(null);
    refetchDocs();
  }

  const { data: vaccData, isLoading: vaccLoading } = useQuery<{ records: VaccHistoryRecord[] }>({
    queryKey: ["animal-vaccination-history", farmId, animal.id],
    queryFn: () => fetch(`/api/farms/${farmId}/animals/${animal.id}/vaccination-history`, { credentials: "include" }).then(r => r.json()),
  });
  const vaccRecords: VaccHistoryRecord[] = vaccData?.records ?? [];

  const tabDef = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    { key: "medicines", label: "Medicines", icon: Stethoscope, count: data?.stats.medicineCount },
    { key: "vaccinations", label: "Vaccinations", icon: Syringe, count: vaccRecords.length || undefined },
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
          ) : tab === "vaccinations" ? (
            vaccLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}><Loader2 className="animate-spin w-6 h-6 mx-auto text-gray-400" /></div>
            ) : vaccRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <Syringe size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No vaccination records found for this animal.</p>
                <p style={{ fontSize: "0.78rem", marginTop: 4 }}>Vaccination events are pulled automatically from the vaccination programmes recorded for this animal's herd or flock. Record vaccines in the relevant production module (Sheep Production → Vaccination, Pig Production → Vaccination, etc.).</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {vaccRecords.map((v, i) => {
                  const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                  const sourceLabel = v.source === "medicine_record" ? "Medicine Record" : "Vaccination Programme";
                  const today = new Date(); today.setHours(0,0,0,0);
                  const dueDate = v.nextDueDate ? new Date(v.nextDueDate) : null;
                  const isOverdue = dueDate && dueDate < today;
                  const isDueSoon = dueDate && !isOverdue && dueDate <= new Date(today.getTime() + 30 * 86400000);
                  return (
                    <div key={`${v.source}-${v.id}-${i}`} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", background: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>
                            {v.vaccineProduct}
                            {v.vetPrescribed && <span style={{ marginLeft: 6, fontSize: "0.68rem", fontWeight: 700, padding: "1px 5px", borderRadius: 9999, background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>POM-V</span>}
                          </p>
                          {v.vaccinationCategory && <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>{v.vaccinationCategory}</p>}
                          <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                            {fmtD(v.date)}
                            {v.ageGroupTreated ? ` · ${v.ageGroupTreated}` : ""}
                            {v.numberTreated != null ? ` · ${v.numberTreated} treated` : ""}
                            {v.administrationRoute ? ` · ${v.administrationRoute}` : ""}
                            {v.administeredBy ? ` · ${v.administeredBy}` : ""}
                          </p>
                          {v.batchNumber && <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#9ca3af" }}>Batch: {v.batchNumber}</p>}
                          {v.withdrawalPeriodDays != null && v.withdrawalPeriodDays > 0 && <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#b45309", fontWeight: 600 }}>Withdrawal: {v.withdrawalPeriodDays} days</p>}
                          {v.notes && <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#374151", fontStyle: "italic" }}>{v.notes}</p>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                          <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: v.source === "medicine_record" ? "#f3f4f6" : "#f0fdf4", color: v.source === "medicine_record" ? "#6b7280" : "#166534", border: `1px solid ${v.source === "medicine_record" ? "#e5e7eb" : "#bbf7d0"}` }}>
                            {sourceLabel}
                          </span>
                          {v.nextDueDate && (
                            <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: isOverdue ? "#fef2f2" : isDueSoon ? "#fffbeb" : "#f9fafb", color: isOverdue ? "#991b1b" : isDueSoon ? "#92400e" : "#6b7280", border: `1px solid ${isOverdue ? "#fca5a5" : isDueSoon ? "#fde68a" : "#e5e7eb"}` }}>
                              {isOverdue ? "⚠ Booster overdue" : isDueSoon ? "⚠ Booster due soon" : `Next: ${fmtD(v.nextDueDate)}`}
                            </span>
                          )}
                        </div>
                      </div>
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
  const { toast } = useToast();
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
  const [speciesFilter, setSpeciesFilter] = usePersistedFilter({ page: "livestock-animals", filter: "species", farmId, defaultValue: "__all__" });
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
      return fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["animals", farmId] }); setShowForm(false); setForm(EMPTY_ANIMAL); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_ANIMAL & { id: number }) => {
      const payload = { ...body, herdId: body.herdId ? Number(body.herdId) : null };
      return fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["animals", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_ANIMAL); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["animals", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
            await fetch(`/api/farms/${farmId}/animals/${qrAnimal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ animalCode: code }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
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
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); } }}>
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
              <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
              <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
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
        <Dialog open onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Animal Record?</DialogTitle><DialogDescription>This will mark the record as removed. It cannot be undone.</DialogDescription></DialogHeader>
            <DialogMutationError mutation={deleteMut} message="Failed to remove — please try again." />
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
