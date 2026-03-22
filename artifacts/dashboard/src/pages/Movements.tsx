import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import {
  Plus, Search, RefreshCw, Loader2, Pencil, Trash2, X, Printer,
  ArrowRight, Paperclip, CheckCircle2, AlertTriangle, Upload, File, Skull, Download, ExternalLink,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useUpload } from "@workspace/object-storage-web";
import { printHtml } from "@/lib/utils";

interface Movement {
  id: number;
  farmId: number;
  movementType: string;
  movementDate: string;
  fromLocation: string | null;
  toLocation: string | null;
  numberOfAnimals: number | null;
  licenceNumber: string | null;
  bcmsSubmissionRef: string | null;
  legalNotificationSubmitted: boolean;
  legalNotificationDate: string | null;
  species: string | null;
  earTagNumbers: string | null;
  transporterDetails: string | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
}

interface Attachment {
  id: number;
  title: string;
  filePath: string | null;
  mimeType: string | null;
  fileSize: number | null;
  notes: string | null;
  createdAt: string;
}

interface Farm {
  id: number;
  name: string;
  address: string | null;
  postcode: string | null;
  cphNumber: string | null;
  country: string | null;
  scotEidNumber: string | null;
  eidCymruNumber: string | null;
}

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function movementTypeBadge(type: string) {
  const map: Record<string, { label: string; className: string }> = {
    on:      { label: "On",     className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    off:     { label: "Off",    className: "bg-amber-100 text-amber-800 border-amber-200" },
    between: { label: "Between", className: "bg-blue-100 text-blue-800 border-blue-200" },
    birth:   { label: "Birth",  className: "bg-purple-100 text-purple-800 border-purple-200" },
    death:   { label: "Death",  className: "bg-red-100 text-red-800 border-red-200" },
  };
  const entry = map[type] ?? { label: type, className: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${entry.className}`}>
      {entry.label}
    </span>
  );
}

function BcmsStatusBadge({ movement }: { movement: Movement }) {
  const isExempt = movement.movementType === "birth" || movement.movementType === "between";
  if (isExempt) {
    return <span className="text-xs text-foreground/40 italic">N/A</span>;
  }
  if (movement.legalNotificationSubmitted) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Notified
      </span>
    );
  }
  const days = daysSince(movement.movementDate);
  const isOverdue = days > 3;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${isOverdue ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
      <AlertTriangle className="w-3 h-3" />
      {isOverdue ? `Overdue (${days}d)` : "Pending"}
    </span>
  );
}

function AttachmentsPanel({ movementId, farmId }: { movementId: number; farmId: number }) {
  const queryClient = useQueryClient();
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["movement-attachments", movementId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/movements/${movementId}/attachments`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ attachments: Attachment[] }>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: number) => {
      await fetch(`/api/farms/${farmId}/movements/${movementId}/attachments/${docId}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movement-attachments", movementId] }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const title = uploadTitle.trim() || "AML / Movement Document";
      await fetch(`/api/farms/${farmId}/movements/${movementId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          filePath: response.objectPath,
          notes: uploadNotes.trim() || null,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["movement-attachments", movementId] });
      setUploadTitle("");
      setUploadNotes("");
    },
  });

  const attachments = data?.attachments ?? [];

  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">
        Attached Documents (AML forms / eAML2 confirmations)
      </div>

      {isLoading ? (
        <div className="text-sm text-foreground/50">Loading...</div>
      ) : attachments.length === 0 ? (
        <div className="text-sm text-foreground/50 italic">No documents attached yet. Upload your AML form or eAML2 confirmation below.</div>
      ) : (
        <div className="space-y-1.5">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-primary/60" />
                <div>
                  <a
                    href={att.filePath ? `/api/storage${att.filePath}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {att.title}
                  </a>
                  {att.notes && <p className="text-xs text-foreground/50">{att.notes}</p>}
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(att.id)}
                className="p-1 rounded hover:bg-red-50 text-foreground/40 hover:text-red-500"
                title="Remove attachment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload section */}
      <div className="border border-dashed border-border rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-foreground/60">Attach a document (photo/scan of AML form, eAML2 screenshot)</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Document title (e.g. AML2-2026-00291)"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="text-xs h-8"
          />
          <Input
            placeholder="Notes (optional)"
            value={uploadNotes}
            onChange={(e) => setUploadNotes(e.target.value)}
            className="text-xs h-8"
          />
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
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5" disabled={isUploading} asChild>
            <span>
              {isUploading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading {progress}%</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Choose File</>
              )}
            </span>
          </Button>
          <span className="text-xs text-foreground/40">PDF, JPG, PNG accepted</span>
        </label>
      </div>
    </div>
  );
}

function PrintRecord({ movement, farm, onClose }: {
  movement: Movement;
  farm: Farm | null;
  onClose: () => void;
}) {
  const typeLabels: Record<string, string> = {
    on: "On (Animals Arriving at Holding)",
    off: "Off (Animals Leaving Holding)",
    between: "Between Holdings",
    birth: "Birth on Holding",
    death: "Death on Holding",
  };

  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handlePrint = () => {
    const farmBlock = farm ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px;margin-bottom:12px"><p style="font-weight:600;margin:0 0 2px">${farm.name}</p>${farm.address ? `<p style="font-size:10px;color:#555;margin:1px 0">${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm.cphNumber ? `<p style="font-size:10px;color:#555;margin:1px 0">CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}</div>` : "";
    const field = (label: string, value: string, cls = "") => `<div style="margin-bottom:10px"><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;margin:0 0 2px">${label}</p><p style="font-weight:500;margin:0;${cls}">${value}</p></div>`;
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Livestock Movement Record #${movement.id}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 32px}.col2{grid-column:span 2}.sig{border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.sigline{border-bottom:1px solid #999;height:32px;margin:16px 0 4px}.note{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h2 style="font-size:14px;font-weight:700;margin:0 0 2px">Livestock Movement Record</h2><p style="font-size:10px;color:#666;margin:0">BDE Farm Trac — On-Farm Compliance Record</p></div><div style="text-align:right;font-size:10px;color:#666"><p style="margin:0">Printed: ${printedDate}</p><p style="margin:0">Record ID: #${movement.id}</p></div></div>
${farmBlock}
<div class="grid">
${field("Movement Type", typeLabels[movement.movementType] ?? movement.movementType)}
${field("Movement Date", formatDate(movement.movementDate))}
${field("Number of Animals", String(movement.numberOfAnimals ?? "—"))}
${field("AML Licence Reference", movement.licenceNumber || "—")}
${field("BCMS/eAML2 Submission Ref", movement.bcmsSubmissionRef || "—")}
${field("BCMS/APHA Notified", movement.legalNotificationSubmitted ? `Yes — ${movement.legalNotificationDate ? formatDate(movement.legalNotificationDate) : "date not recorded"}` : "⚠ Not yet notified", movement.legalNotificationSubmitted ? "color:#065f46" : "color:#991b1b")}
${field("From Location / CPH", movement.fromLocation || "—")}
${field("To Location / CPH", movement.toLocation || "—")}
${movement.transporterDetails ? `<div class="col2">${field("Transporter / Haulier", movement.transporterDetails)}</div>` : ""}
${movement.reason ? `<div class="col2">${field("Reason", movement.reason)}</div>` : ""}
${movement.notes ? `<div class="col2">${field("Notes", movement.notes)}</div>` : ""}
</div><div class="sig"><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af">Recorded By</p><div class="sigline"></div><p style="font-size:9px;color:#9ca3af">Signature / Name</p></div><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af">Date Recorded</p><div class="sigline"></div><p style="font-size:9px;color:#9ca3af">Date</p></div></div>
<div class="note">This is an on-farm record for Red Tractor compliance purposes. Official livestock movement documents (AML1/AML2/eAML2) must be submitted separately to APHA/BCMS as required by UK livestock movement regulations. Records must be kept for a minimum of 3 years.</div>
</body></html>`;
    printHtml(html, `movement-record-${movement.id}.html`);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Print Movement Record</DialogTitle>
        </DialogHeader>

        <div id="movement-print-area" className="border border-border rounded-lg p-6 space-y-5 text-sm">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold font-display text-foreground">Livestock Movement Record</h2>
              <p className="text-foreground/60 text-xs mt-0.5">BDE Farm Trac — On-Farm Compliance Record</p>
            </div>
            <div className="text-right text-xs text-foreground/60">
              <p>Printed: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p>Record ID: #{movement.id}</p>
            </div>
          </div>

          {farm && (
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="font-semibold text-foreground">{farm.name}</p>
              {farm.address && <p className="text-foreground/70 text-xs">{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
              {farm.cphNumber && <p className="text-foreground/70 text-xs mt-0.5">CPH: <span className="font-mono font-medium">{farm.cphNumber}</span></p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">Movement Type</p>
              <p className="font-medium">{typeLabels[movement.movementType] ?? movement.movementType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">Movement Date</p>
              <p className="font-medium">{formatDate(movement.movementDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">Number of Animals</p>
              <p className="font-medium">{movement.numberOfAnimals ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">AML Licence Reference</p>
              <p className="font-medium font-mono">{movement.licenceNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">BCMS/eAML2 Submission Ref</p>
              <p className="font-medium font-mono">{movement.bcmsSubmissionRef || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">BCMS/APHA Notified</p>
              <p className={`font-medium ${movement.legalNotificationSubmitted ? "text-emerald-700" : "text-red-600"}`}>
                {movement.legalNotificationSubmitted
                  ? `Yes — ${movement.legalNotificationDate ? formatDate(movement.legalNotificationDate) : "date not recorded"}`
                  : "⚠ Not yet notified"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">From Location / CPH</p>
              <p className="font-medium">{movement.fromLocation || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">To Location / CPH</p>
              <p className="font-medium">{movement.toLocation || "—"}</p>
            </div>
            {movement.transporterDetails && (
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">Transporter / Haulier</p>
                <p className="font-medium">{movement.transporterDetails}</p>
              </div>
            )}
            {movement.reason && (
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">Reason</p>
                <p>{movement.reason}</p>
              </div>
            )}
            {movement.notes && (
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5">Notes</p>
                <p className="text-foreground/80">{movement.notes}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">Recorded By</p>
              <div className="border-b border-foreground/20 h-8 mb-1" />
              <p className="text-xs text-foreground/50">Signature / Name</p>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">Date Recorded</p>
              <div className="border-b border-foreground/20 h-8 mb-1" />
              <p className="text-xs text-foreground/50">Date</p>
            </div>
          </div>

          <p className="text-xs text-foreground/40 border-t border-border pt-3">
            This is an on-farm record for Red Tractor compliance purposes. Official livestock movement documents (AML1/AML2/eAML2)
            must be submitted separately to APHA/BCMS as required by UK livestock movement regulations. Records must be kept for a minimum of 3 years.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MortalityRecord {
  id: number;
  farmId: number;
  herdId: number | null;
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

const EMPTY_MORTALITY = {
  tagNumber: "",
  species: "",
  breed: "",
  dateOfDeath: new Date().toISOString().slice(0, 10),
  causeOfDeath: "",
  disposalMethod: "",
  disposalOperator: "",
  disposalRef: "",
  veterinaryAttended: false,
  vetName: "",
  postMortemCarriedOut: false,
  postMortemFindings: "",
  bcmsNotified: false,
  bcmsNotificationRef: "",
  notes: "",
};

function MortalitySection({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MortalityRecord | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_MORTALITY>(EMPTY_MORTALITY);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const baseUrl = `/api/farms/${farmId}/mortality-records`;

  const { data, isLoading } = useQuery({
    queryKey: ["mortality-records", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: MortalityRecord[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] }); setShowForm(false); setFormData(EMPTY_MORTALITY); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] }); setEditingRecord(null); setShowForm(false); setFormData(EMPTY_MORTALITY); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] }); setDeleteId(null); },
  });

  const records: MortalityRecord[] = data?.records ?? [];
  const filtered = records.filter(r =>
    !search || r.species?.toLowerCase().includes(search.toLowerCase()) ||
    r.tagNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.causeOfDeath?.toLowerCase().includes(search.toLowerCase())
  );

  function setField(key: keyof typeof EMPTY_MORTALITY, val: string | boolean) {
    setFormData(f => ({ ...f, [key]: val }));
  }

  function openEdit(r: MortalityRecord) {
    setEditingRecord(r);
    setFormData({
      tagNumber: r.tagNumber ?? "",
      species: r.species ?? "",
      breed: r.breed ?? "",
      dateOfDeath: r.dateOfDeath ? r.dateOfDeath.slice(0, 10) : "",
      causeOfDeath: r.causeOfDeath ?? "",
      disposalMethod: r.disposalMethod ?? "",
      disposalOperator: r.disposalOperator ?? "",
      disposalRef: r.disposalRef ?? "",
      veterinaryAttended: r.veterinaryAttended ?? false,
      vetName: r.vetName ?? "",
      postMortemCarriedOut: r.postMortemCarriedOut ?? false,
      postMortemFindings: r.postMortemFindings ?? "",
      bcmsNotified: r.bcmsNotified ?? false,
      bcmsNotificationRef: r.bcmsNotificationRef ?? "",
      notes: r.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...formData,
      dateOfDeath: formData.dateOfDeath ? new Date(formData.dateOfDeath).toISOString() : null,
    };
    if (editingRecord) { updateMutation.mutate({ id: editingRecord.id, body }); }
    else { createMutation.mutate(body); }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 flex gap-3 items-start mb-4">
        <span className="text-amber-500 mt-0.5 shrink-0">ℹ</span>
        <span>
          <strong>Fallen stock / mortality records</strong> — All animal deaths must be recorded. Fallen stock must be disposed of by an approved collector or permitted method.
          Cattle deaths must be reported to BCMS within 7 days. Retain records for a minimum of 3 years.
        </span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search by species, tag, cause..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditingRecord(null); setFormData({ ...EMPTY_MORTALITY, dateOfDeath: new Date().toISOString().slice(0, 10) }); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Record Death
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">{editingRecord ? "Edit Mortality Record" : "Record Animal Death"}</h3>
              <button onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_MORTALITY); }} className="p-1 rounded hover:bg-black/5"><X className="w-5 h-5 text-foreground/50" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Date of Death <span className="text-red-500">*</span></label>
                  <Input type="date" value={formData.dateOfDeath} onChange={e => setField("dateOfDeath", e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Species <span className="text-red-500">*</span></label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={formData.species} onChange={e => setField("species", e.target.value)} required>
                    <option value="">Select species...</option>
                    {["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Other"].map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Ear Tag / ID Number</label>
                  <Input placeholder="e.g. UK123456789012" value={formData.tagNumber} onChange={e => setField("tagNumber", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Breed</label>
                  <Input placeholder="e.g. Limousin cross" value={formData.breed} onChange={e => setField("breed", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Cause of Death <span className="text-red-500">*</span></label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={formData.causeOfDeath} onChange={e => setField("causeOfDeath", e.target.value)} required>
                    <option value="">Select cause...</option>
                    {["Disease / Illness", "Injury / Accident", "Euthanasia (vet)", "Euthanasia (emergency)", "Natural causes", "Dystocia / Calving difficulty", "Pneumonia", "Metabolic disorder", "Unknown", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Disposal Method <span className="text-red-500">*</span></label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={formData.disposalMethod} onChange={e => setField("disposalMethod", e.target.value)} required>
                    <option value="">Select method...</option>
                    {["Fallen stock collector", "Hunt / knackerman", "On-farm burial (permitted)", "Incineration", "Rendering plant", "Other permitted method"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Disposal Operator</label>
                  <Input placeholder="Company / collector name" value={formData.disposalOperator} onChange={e => setField("disposalOperator", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Disposal Reference No.</label>
                  <Input placeholder="Collection or permit reference" value={formData.disposalRef} onChange={e => setField("disposalRef", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={formData.veterinaryAttended} onChange={e => setField("veterinaryAttended", e.target.checked)} className="rounded" />
                    Vet attended / certified
                  </label>
                  {formData.veterinaryAttended && (
                    <Input placeholder="Vet name" value={formData.vetName} onChange={e => setField("vetName", e.target.value)} />
                  )}
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={formData.postMortemCarriedOut} onChange={e => setField("postMortemCarriedOut", e.target.checked)} className="rounded" />
                    Post-mortem carried out
                  </label>
                  {formData.postMortemCarriedOut && (
                    <Input placeholder="PM findings summary" value={formData.postMortemFindings} onChange={e => setField("postMortemFindings", e.target.value)} />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={formData.bcmsNotified} onChange={e => setField("bcmsNotified", e.target.checked)} className="rounded" />
                    BCMS / APHA notified
                  </label>
                  {formData.bcmsNotified && (
                    <Input placeholder="BCMS notification reference" value={formData.bcmsNotificationRef} onChange={e => setField("bcmsNotificationRef", e.target.value)} />
                  )}
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                    <Input placeholder="Any additional notes" value={formData.notes} onChange={e => setField("notes", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_MORTALITY); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingRecord ? "Update Record" : "Save Record"}
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
                <Skull className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No mortality records</h3>
              <p className="text-foreground/50 text-sm">{search ? "No records match your search." : "All animal deaths must be recorded. Use the button above to add a record."}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Date</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Species / Tag</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Cause</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Disposal</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">BCMS</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{formatDate(r.dateOfDeath)}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium capitalize">{r.species}</div>
                      {r.breed && <div className="text-xs text-foreground/50">{r.breed}</div>}
                      {r.tagNumber && <div className="text-xs font-mono text-foreground/60">{r.tagNumber}</div>}
                    </td>
                    <td className="p-4 text-sm text-foreground/70">{r.causeOfDeath}</td>
                    <td className="p-4 text-sm text-foreground/70">
                      <div>{r.disposalMethod}</div>
                      {r.disposalRef && <div className="text-xs font-mono text-foreground/50">{r.disposalRef}</div>}
                    </td>
                    <td className="p-4">
                      {r.bcmsNotified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Notified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Pending
                        </span>
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
          <DialogHeader><DialogTitle>Delete Mortality Record</DialogTitle></DialogHeader>
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

const EMPTY_FORM = {
  movementType: "",
  movementDate: "",
  fromLocation: "",
  toLocation: "",
  numberOfAnimals: "",
  species: "",
  earTagNumbers: "",
  licenceNumber: "",
  bcmsSubmissionRef: "",
  legalNotificationSubmitted: false,
  legalNotificationDate: "",
  transporterDetails: "",
  reason: "",
  notes: "",
};

function exportMovementsCsv(records: Movement[], farmCph: string) {
  const headers = [
    "Record ID", "Movement Date", "Movement Type", "Species", "Number of Animals",
    "Ear Tag Numbers", "From Location / CPH", "To Location / CPH",
    "AML Licence Reference", "BCMS/eAML2 Submission Ref",
    "BCMS/APHA Notified", "Notification Date",
    "Transporter / Haulier", "Reason", "Notes",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "";
  const rows = records.map(r => [
    r.id, fmtD(r.movementDate), r.movementType,
    r.species || "", r.numberOfAnimals ?? "",
    r.earTagNumbers || "",
    r.fromLocation || "", r.toLocation || "",
    r.licenceNumber || "", r.bcmsSubmissionRef || "",
    r.legalNotificationSubmitted ? "Yes" : "No",
    fmtD(r.legalNotificationDate),
    r.transporterDetails || "", r.reason || "", r.notes || "",
  ]);
  const csv = [headers, ...rows].map(row => row.map(esc).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `livestock-movements-cph${farmCph || "unknown"}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Movements() {
  const { farmId } = useAppStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Movement | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [printRecord, setPrintRecord] = useState<Movement | null>(null);
  const [expandedAttachments, setExpandedAttachments] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"movements" | "mortality">("movements");
  const [bcmsFilter, setBcmsFilter] = useState<"all" | "pending" | "submitted">("all");

  if (!farmId) return <Redirect href="/select" />;

  const baseUrl = `/api/farms/${farmId}/movements`;

  const { data: movementsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["movements", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: Movement[] }>;
    },
  });

  const { data: farmData } = useQuery({
    queryKey: ["tenant-farms"],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/current/farms`);
      if (!res.ok) return null;
      const json = await res.json() as { farms?: Farm[] };
      return (json.farms ?? []).find((f) => f.id === farmId) ?? null;
    },
    enabled: !!farmId,
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json() as Promise<{ record: Movement }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      setShowForm(false);
      setFormData(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json() as Promise<{ record: Movement }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      setEditingRecord(null);
      setFormData(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      setDeleteConfirmId(null);
    },
  });

  const records: Movement[] = movementsData?.records ?? [];

  const overdueMovements = records.filter((r) => {
    const exempt = r.movementType === "birth" || r.movementType === "between";
    return !exempt && !r.legalNotificationSubmitted && daysSince(r.movementDate) > 3;
  });

  const requiresBcms = (r: Movement) => r.movementType !== "birth" && r.movementType !== "between";

  const bcmsFiltered = records.filter(r => {
    if (bcmsFilter === "all") return true;
    if (bcmsFilter === "pending") return requiresBcms(r) && !r.legalNotificationSubmitted;
    if (bcmsFilter === "submitted") return r.legalNotificationSubmitted;
    return true;
  });

  const filtered = bcmsFiltered.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.movementType?.toLowerCase().includes(s) ||
      r.species?.toLowerCase().includes(s) ||
      r.fromLocation?.toLowerCase().includes(s) ||
      r.toLocation?.toLowerCase().includes(s) ||
      r.licenceNumber?.toLowerCase().includes(s) ||
      r.bcmsSubmissionRef?.toLowerCase().includes(s) ||
      r.transporterDetails?.toLowerCase().includes(s)
    );
  });

  const pendingCount = records.filter(r => requiresBcms(r) && !r.legalNotificationSubmitted).length;
  const submittedCount = records.filter(r => r.legalNotificationSubmitted).length;

  const openAdd = () => {
    setEditingRecord(null);
    setFormData({ ...EMPTY_FORM, movementDate: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (r: Movement) => {
    setEditingRecord(r);
    setFormData({
      movementType: r.movementType ?? "",
      movementDate: r.movementDate ? r.movementDate.slice(0, 10) : "",
      fromLocation: r.fromLocation ?? "",
      toLocation: r.toLocation ?? "",
      numberOfAnimals: r.numberOfAnimals != null ? String(r.numberOfAnimals) : "",
      species: r.species ?? "",
      earTagNumbers: r.earTagNumbers ?? "",
      licenceNumber: r.licenceNumber ?? "",
      bcmsSubmissionRef: r.bcmsSubmissionRef ?? "",
      legalNotificationSubmitted: r.legalNotificationSubmitted ?? false,
      legalNotificationDate: r.legalNotificationDate ? r.legalNotificationDate.slice(0, 10) : "",
      transporterDetails: r.transporterDetails ?? "",
      reason: r.reason ?? "",
      notes: r.notes ?? "",
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...formData,
      numberOfAnimals: formData.numberOfAnimals ? Number(formData.numberOfAnimals) : null,
      legalNotificationDate: formData.legalNotificationSubmitted && formData.legalNotificationDate
        ? new Date(formData.legalNotificationDate).toISOString()
        : null,
    };
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const setField = (key: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const showingForm = showForm || editingRecord !== null;

  if (isLoading) {
    return (
      <AppLayout title="Livestock Movements">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-64 bg-black/5 rounded-lg" />
            <div className="h-9 w-32 bg-black/5 rounded-lg" />
          </div>
          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-8 bg-black/5 rounded w-full" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout title="Livestock Movements">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Failed to load movement records</h3>
            <p className="text-sm text-muted-foreground mb-4">There was a problem loading your records.</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Livestock Movements">
      <style>{`
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #movement-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:12px; color:#000; background:#fff; }
        }
      `}</style>

      <TabBar className="mb-6">
        <TabButton active={activeTab === "movements"} onClick={() => setActiveTab("movements")}>Movements</TabButton>
        <TabButton active={activeTab === "mortality"} onClick={() => setActiveTab("mortality")}>Mortality Log</TabButton>
      </TabBar>

      {activeTab === "movements" && (<>
      <TabBar className="mb-5">
        <TabButton active={bcmsFilter === "all"} onClick={() => setBcmsFilter("all")}>
          All <span className="ml-1 text-xs opacity-60">({records.length})</span>
        </TabButton>
        <TabButton active={bcmsFilter === "pending"} onClick={() => setBcmsFilter("pending")}>
          BCMS Pending <span className="ml-1 text-xs opacity-60">({pendingCount})</span>
        </TabButton>
        <TabButton active={bcmsFilter === "submitted"} onClick={() => setBcmsFilter("submitted")}>
          BCMS Submitted <span className="ml-1 text-xs opacity-60">({submittedCount})</span>
        </TabButton>
      </TabBar>
      {/* Overdue compliance alert */}
      {overdueMovements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-900 flex gap-3 items-start">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <strong>BCMS/APHA notification overdue</strong> — {overdueMovements.length} movement{overdueMovements.length > 1 ? "s are" : " is"} more than 3 days old without a legal notification recorded. These must be reported to BCMS/APHA immediately. Update each record once reported.
          </div>
        </div>
      )}

      {/* Country-aware portal quick-action banner */}
      {(() => {
        const country = farmData?.country ?? "england";
        const isScotland = country === "scotland";
        const isWales = country === "wales";
        const isNI = country === "northern_ireland";
        const portalLinks: { label: string; href: string }[] = isScotland
          ? [
              { label: "ScotEID", href: "https://www.scoteid.com" },
              { label: "BCMS Online", href: "https://www.bcms.gov.uk" },
            ]
          : isWales
          ? [
              { label: "EIDCymru", href: "https://www.eidcymru.org" },
              { label: "eAML2.net", href: "https://www.eaml2.org.uk" },
              { label: "BCMS Online", href: "https://www.bcms.gov.uk" },
            ]
          : isNI
          ? [
              { label: "NIFAIS", href: "https://www.daera-ni.gov.uk/topics/animal-identification-movement-and-tracing/nifais" },
            ]
          : [
              { label: "eAML2.net", href: "https://www.eaml2.org.uk" },
              { label: "BCMS Online", href: "https://www.bcms.gov.uk" },
            ];

        const portalDescription = isScotland
          ? "All livestock movements in Scotland (cattle, sheep, goats, pigs) are reported to ScotEID. Cattle also require BCMS notification."
          : isWales
          ? "In Wales: sheep and goats use EIDCymru; pigs use eAML2.net; cattle use BCMS Online."
          : isNI
          ? "In Northern Ireland: cattle and sheep movements are recorded on NIFAIS. Contact DAERA for scheme details."
          : "In England: sheep, goats and pigs use eAML2.net; cattle use BCMS Online.";

        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-900 flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <strong>Submit to government portal:</strong> {portalDescription}{" "}
              Paste the reference number back into each movement record once submitted.
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {portalLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-white border border-blue-300 rounded-md px-2.5 py-1 hover:bg-blue-50 transition-colors"
                >
                  {link.label} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Regulatory reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 flex gap-3 items-start">
        <span className="text-amber-500 mt-0.5 shrink-0">ℹ</span>
        <span>
          <strong>Regulatory reminder:</strong> All on/off livestock movements must be reported to the relevant government portal.
          Cattle must be reported within 3 days; sheep, goats and pigs as required by the applicable scheme.
          Record the submission reference here and attach a copy of the AML form.
          Printed records are for on-farm Red Tractor compliance use only.
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search movements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMovementsCsv(records, farmData?.cphNumber ?? "")}
            disabled={records.length === 0}
            title="Download all movements as CSV for eAML2 / BCMS reference"
          >
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Movement
          </Button>
        </div>
      </div>

      {/* Add / Edit form */}
      {showingForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg">
                {editingRecord ? "Edit Movement Record" : "Record a Movement"}
              </h3>
              <button
                onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_FORM); }}
                className="p-1 rounded hover:bg-black/5"
              >
                <X className="w-5 h-5 text-foreground/50" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Movement Type <span className="text-red-500">*</span></label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={formData.movementType}
                    onChange={(e) => setField("movementType", e.target.value)}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="on">On (Animals Arriving at Holding)</option>
                    <option value="off">Off (Animals Leaving Holding)</option>
                    <option value="between">Between Holdings</option>
                    <option value="birth">Birth on Holding</option>
                    <option value="death">Death on Holding</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Movement Date <span className="text-red-500">*</span></label>
                  <Input type="date" value={formData.movementDate} onChange={(e) => setField("movementDate", e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">From Location / CPH</label>
                  <Input placeholder="e.g. 32/541/0012 or Market Name" value={formData.fromLocation} onChange={(e) => setField("fromLocation", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">To Location / CPH</label>
                  <Input placeholder="e.g. 32/541/0099 or Abattoir Name" value={formData.toLocation} onChange={(e) => setField("toLocation", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Number of Animals</label>
                  <Input type="number" min="1" value={formData.numberOfAnimals} onChange={(e) => setField("numberOfAnimals", e.target.value)} placeholder="e.g. 12" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Species</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.species}
                    onChange={(e) => setField("species", e.target.value)}
                  >
                    <option value="">Not specified</option>
                    <option value="cattle">Cattle</option>
                    <option value="sheep">Sheep</option>
                    <option value="pigs">Pigs</option>
                    <option value="goats">Goats</option>
                    <option value="deer">Deer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">AML Licence / Reference No.</label>
                  <Input placeholder="e.g. AML12345678" value={formData.licenceNumber} onChange={(e) => setField("licenceNumber", e.target.value)} />
                </div>
              </div>

              {/* Ear tag numbers — shown for cattle, sheep, goats */}
              {(formData.species === "cattle" || formData.species === "sheep" || formData.species === "goats") && (
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">
                    Individual Ear Tag Numbers
                    {formData.species === "cattle" && <span className="ml-1.5 text-xs font-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Required for BCMS cattle traceability</span>}
                  </label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[72px] resize-y"
                    placeholder={formData.species === "cattle"
                      ? "e.g. UK123456789012, UK123456789013 (one per line or comma-separated)"
                      : "e.g. UK123456789012, UK123456789013 (optional for sheep/goats)"}
                    value={formData.earTagNumbers}
                    onChange={(e) => setField("earTagNumbers", e.target.value)}
                  />
                  <p className="text-xs text-foreground/50 mt-1">
                    {formData.species === "cattle"
                      ? "BCMS requires individual ear tag numbers for all cattle movements. Enter one per line or comma-separated."
                      : "Ear tag numbers are optional for sheep/goats (batch movements are acceptable) but aid traceability."}
                  </p>
                </div>
              )}

              {/* BCMS / Legal Notification section */}
              <div className="border border-border rounded-xl p-4 space-y-4 bg-amber-50/30">
                <p className="text-sm font-semibold text-foreground">BCMS / APHA Legal Notification</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">BCMS/eAML2 Submission Reference</label>
                    <Input
                      placeholder="Reference from BCMS/APHA confirmation"
                      value={formData.bcmsSubmissionRef}
                      onChange={(e) => setField("bcmsSubmissionRef", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Date Notified to BCMS/APHA</label>
                    <Input
                      type="date"
                      value={formData.legalNotificationDate}
                      onChange={(e) => setField("legalNotificationDate", e.target.value)}
                      disabled={!formData.legalNotificationSubmitted}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.legalNotificationSubmitted}
                        onChange={(e) => {
                          setField("legalNotificationSubmitted", e.target.checked);
                          if (e.target.checked && !formData.legalNotificationDate) {
                            setField("legalNotificationDate", new Date().toISOString().slice(0, 10));
                          }
                        }}
                        className="w-4 h-4 rounded border-border text-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        BCMS/APHA has been notified of this movement
                      </span>
                    </label>
                    {!formData.legalNotificationSubmitted && formData.movementDate && daysSince(formData.movementDate) > 2 && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        This movement is {daysSince(formData.movementDate)} days old — notification is legally required within 3 days for on/off cattle movements.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Transporter / Haulier Details</label>
                  <Input placeholder="Name, vehicle reg, contact" value={formData.transporterDetails} onChange={(e) => setField("transporterDetails", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Reason</label>
                  <Input placeholder="e.g. Sale, Purchase, Slaughter" value={formData.reason} onChange={(e) => setField("reason", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                  <Input placeholder="Any additional notes" value={formData.notes} onChange={(e) => setField("notes", e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_FORM); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingRecord ? "Update Record" : "Save Movement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Movement Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure you want to delete this movement record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print dialog */}
      {printRecord && (
        <PrintRecord movement={printRecord} farm={farmData ?? null} onClose={() => setPrintRecord(null)} />
      )}

      {/* Records table */}
      <Card>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <ArrowRight className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No movement records yet</h3>
              <p className="text-foreground/50 text-sm">
                {search ? "No records match your search." : "Start by recording your first livestock movement."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Date</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Type</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Species</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">From → To</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Animals</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">AML Ref</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">BCMS Status</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                      <td className="p-4 text-sm font-medium text-foreground">{formatDate(r.movementDate)}</td>
                      <td className="p-4">{movementTypeBadge(r.movementType)}</td>
                      <td className="p-4">
                        {r.species ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                            {r.species}
                          </span>
                        ) : <span className="text-foreground/30 text-xs">—</span>}
                      </td>
                      <td className="p-4 text-sm text-foreground/70">
                        <span className="font-mono text-xs">{r.fromLocation || "—"}</span>
                        <span className="mx-1.5 text-foreground/30">→</span>
                        <span className="font-mono text-xs">{r.toLocation || "—"}</span>
                      </td>
                      <td className="p-4 text-sm text-foreground/70">{r.numberOfAnimals ?? "—"}</td>
                      <td className="p-4 text-sm font-mono text-foreground/70">{r.licenceNumber || "—"}</td>
                      <td className="p-4"><BcmsStatusBadge movement={r} /></td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExpandedAttachments(expandedAttachments === r.id ? null : r.id)}
                            className={`p-1.5 rounded-md hover:bg-black/5 transition-colors ${expandedAttachments === r.id ? "text-primary bg-primary/5" : "text-foreground/50"}`}
                            title="Attach documents"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPrintRecord(r)}
                            className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary transition-colors"
                            title="Print movement record"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedAttachments === r.id && (
                      <tr key={`attach-${r.id}`} className="bg-muted/20 border-b border-border/30">
                        <td colSpan={8} className="py-2">
                          <AttachmentsPanel movementId={r.id} farmId={farmId} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
      </>)}
      {activeTab === "mortality" && <MortalitySection farmId={farmId} />}
    </AppLayout>
  );
}
