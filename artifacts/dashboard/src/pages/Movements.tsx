import React, { useState } from "react";
import { downloadCsvFile } from "@/lib/csv";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter, usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect, useLocation } from "wouter";
import { useFarmMeta } from "@/pages/viticulture/shared";
import {
  Plus, Search, RefreshCw, Loader2, Pencil, Eye, Trash2, X, Printer,
  ArrowRight, Paperclip, CheckCircle2, AlertTriangle, Upload, File, Skull, Download, ExternalLink,
  Send, ShieldCheck, Shield, WifiOff, Clock, ClipboardCheck, Truck,
  RotateCcw, Inbox,
} from "lucide-react";
import { LivestockDispatchChecklist } from "@/components/livestock/LivestockDispatchChecklist";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { useUpload } from "@workspace/object-storage-web";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { printProReport, openPrintWindow } from "@/lib/print-report";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";

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
  ataNumber: string | null;
  ataExpiryDate: string | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  lisSource: string | null;
  lisMovementRef: string | null;
  // Dispatch checklist fields
  haulageRecordId: number | null;
  vehicleRegistration: string | null;
  driverName: string | null;
  haulierCompany: string | null;
  checklistCompletedBy: string | null;
  checklistCompletedAt: string | null;
  lisManualRef: string | null;
  lisManualNotifiedAt: string | null;
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

interface AnimalRecord {
  id: number;
  earTagNumber: string | null;
  tagNumber: string | null;
  animalCode: string | null;
  name?: string | null;
  species: string;
  breed: string | null;
  sex: string | null;
  status: string;
}

interface MovementAnimal {
  id: number;
  animalId: number | null;
  tagNumber: string | null;
  species: string | null;
  breed: string | null;
  sex: string | null;
  animalCode: string | null;
  animalEarTagNumber: string | null;
  animalTagNumber: string | null;
}

function AnimalRegisterPicker({
  animals,
  speciesFilter,
  selectedIds,
  onChange,
}: {
  animals: AnimalRecord[];
  speciesFilter: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [search, setSearch] = useState("");
  const active = animals.filter(
    (a) =>
      a.status === "active" &&
      (!speciesFilter || a.species === speciesFilter) &&
      (!search ||
        (a.earTagNumber ?? a.tagNumber ?? a.animalCode ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (a.name ?? "").toLowerCase().includes(search.toLowerCase()))
  );
  const toggleId = (id: number) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
        <Search className="w-3.5 h-3.5 text-foreground/40 flex-shrink-0" />
        <input
          type="text"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
          placeholder="Search by ear tag, name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {selectedIds.length > 0 && (
          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
        {active.length === 0 ? (
          <p className="text-xs text-foreground/40 italic px-3 py-4 text-center">
            {speciesFilter
              ? `No active ${speciesFilter} found in your Animal Register`
              : "No active animals found in your Animal Register"}
          </p>
        ) : (
          active.map((a) => {
            const tag = a.earTagNumber ?? a.tagNumber ?? a.animalCode ?? `#${a.id}`;
            const selected = selectedIds.includes(a.id);
            return (
              <label
                key={a.id}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer select-none transition-colors ${
                  selected ? "bg-green-50" : "hover:bg-muted/30"
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 flex-shrink-0"
                  style={{ accentColor: "#16a34a" }}
                  checked={selected}
                  onChange={() => toggleId(a.id)}
                />
                <span className="font-mono text-sm font-medium text-foreground flex-1 truncate">
                  {tag}
                </span>
                {a.name && (
                  <span className="text-xs text-foreground/60 truncate max-w-[80px]">{a.name}</span>
                )}
                {a.breed && (
                  <span className="text-xs text-foreground/50 hidden sm:inline">{a.breed}</span>
                )}
                {a.sex && (
                  <span className="text-xs text-foreground/40 capitalize hidden sm:inline">{a.sex}</span>
                )}
              </label>
            );
          })
        )}
      </div>
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-green-50/60 border-t border-border">
          <span className="text-xs text-green-800 font-medium">
            {selectedIds.length} animal{selectedIds.length !== 1 ? "s" : ""} linked to this movement
          </span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
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

function printMovementsRegister(movements: Movement[], farm: { name: string; cphNumber?: string | null; address?: string | null; postcode?: string | null } | null, filterLabel: string): void {
  const typeLabels: Record<string, string> = { on: "On", off: "Off", between: "Between", birth: "Birth", death: "Death" };
  const rows = movements.map(m => {
    const isExempt = m.movementType === "birth" || m.movementType === "between";
    const notified = isExempt
      ? "<em style='color:#555'>N/A</em>"
      : m.legalNotificationSubmitted
      ? "<span style='color:#065f46;font-weight:700'>✓ Notified</span>"
      : "<span style='color:#991b1b;font-weight:700'>⚠ Pending</span>";
    return `<tr>
      <td style="white-space:nowrap">${formatDate(m.movementDate)}</td>
      <td>${typeLabels[m.movementType] ?? m.movementType}</td>
      <td>${m.species ?? "—"}</td>
      <td style="text-align:center">${m.numberOfAnimals ?? "—"}</td>
      <td style="font-family:monospace">${m.fromLocation ?? "—"}</td>
      <td style="font-family:monospace">${m.toLocation ?? "—"}</td>
      <td style="font-family:monospace">${m.licenceNumber ?? "—"}</td>
      <td>${notified}</td>
      <td style="font-family:monospace">${m.bcmsSubmissionRef ?? "—"}</td>
    </tr>`;
  }).join("");
  const tableHtml = `<table><thead><tr>
    <th>Date</th><th>Type</th><th>Species</th><th>No.</th><th>From CPH</th><th>To CPH</th><th>Licence / AML Ref</th><th>BCMS Notified</th><th>BCMS/eAML2 Ref</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
  printProReport({
    title: "Livestock Movements Register",
    subtitle: "Cattle Identification Regulations · Sheep & Goat Movement Order",
    farmName: farm?.name,
    cphNumber: farm?.cphNumber ?? undefined,
    recordCount: movements.length,
    extraMeta: `Filter: ${filterLabel}`,
    tableHtml,
    footerNote: "Movement records must be retained for a minimum of 3 years. All on/off movements must be notified to the relevant government portal (BCMS, eAML2, ScotEID, EIDCymru, or NIFAIS).",
  });
}

function printLisComplianceReport(
  movements: Movement[],
  farm: { name: string; cphNumber?: string | null; address?: string | null; postcode?: string | null } | null,
  periodLabel: string,
  lastSyncedAt?: string | null,
): void {
  const LIS_SPECIES = ["sheep", "goat", "deer"];
  const lisMovements = movements.filter(m => LIS_SPECIES.includes((m.species ?? "").toLowerCase()));
  const notified = lisMovements.filter(m => m.legalNotificationSubmitted || !!m.lisMovementRef);
  const unnotified = lisMovements.filter(m => !m.legalNotificationSubmitted && !m.lisMovementRef);

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const summaryHtml = `
    <table style="width:100%;margin-bottom:1.5rem;border-collapse:collapse;font-size:0.85rem;">
      <tbody>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;width:40%">Total LIS-reportable movements</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;">${lisMovements.length}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">Notified to LIS / bearing LIS reference</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;color:#166534;font-weight:600">✓ ${notified.length}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">Unnotified (compliance gap)</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;color:${unnotified.length > 0 ? "#dc2626" : "#166534"};font-weight:600">${unnotified.length > 0 ? "✗ " : "✓ "}${unnotified.length}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">Compliance rate</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600">${lisMovements.length === 0 ? "N/A" : Math.round((notified.length / lisMovements.length) * 100) + "%"}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">LIS last data sync</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;">${lastSyncedAt ? new Date(lastSyncedAt).toLocaleString("en-GB") : "Not yet synced"}</td>
        </tr>
      </tbody>
    </table>
  `;

  const rows = lisMovements.map(m => {
    const isNotified = m.legalNotificationSubmitted || !!m.lisMovementRef;
    const rowBg = isNotified ? "" : "background:#fff5f5";
    return `<tr style="${rowBg}">
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${formatDate(m.movementDate)}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;text-transform:capitalize;">${m.movementType ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;text-transform:capitalize;">${m.species ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${m.numberOfAnimals ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${m.fromLocation ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${m.toLocation ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;font-family:monospace;font-size:0.78rem;">${m.lisMovementRef ?? m.licenceNumber ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;font-weight:700;color:${isNotified ? "#166534" : "#dc2626"};">${isNotified ? "✓ Notified" : "✗ Not notified"}</td>
    </tr>`;
  }).join("");

  const tableHtml = `
    <h3 style="font-size:0.9rem;font-weight:700;margin:0 0 0.5rem;color:#111827">Compliance Summary</h3>
    ${summaryHtml}
    <h3 style="font-size:0.9rem;font-weight:700;margin:1rem 0 0.5rem;color:#111827">Movement Detail — LIS-Reportable Species (Sheep / Goat / Deer)</h3>
    <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
      <thead><tr style="background:#f3f4f6;">
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Date</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Type</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Species</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">Animals</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">From</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">To</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">LIS / Licence Ref</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Notification Status</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="8" style="padding:12px;text-align:center;color:#6b7280;border:1px solid #e5e7eb;">No LIS-reportable movements in this period</td></tr>'}</tbody>
    </table>
  `;

  printProReport({
    title: "LIS Movement Notification Compliance Report",
    subtitle: "Livestock Information Service — Red Tractor Audit Evidence",
    farmName: farm?.name,
    cphNumber: farm?.cphNumber ?? undefined,
    recordCount: lisMovements.length,
    extraMeta: `Period: ${periodLabel} · Generated: ${new Date().toLocaleString("en-GB")}`,
    tableHtml,
    footerNote: "This report is generated from BDE Farm Trac records and constitutes evidence of LIS movement notification compliance. LIS notification of sheep, goat and deer movements is required under the Livestock (England) Order 2015 (as amended). Records must be retained for a minimum of 3 years for Red Tractor audit purposes.",
  });
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
  const { toast } = useToast();
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
      await fetch(`/api/farms/${farmId}/movements/${movementId}/attachments/${docId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movement-attachments", movementId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
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
    const farmBlock = farm ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px;margin-bottom:12px"><p style="font-weight:600;margin:0 0 4px">${farm.name}</p>${farm.address ? `<p style="font-size:10px;color:#374151;margin:4px 0">${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm.cphNumber ? `<p style="font-size:10px;color:#374151;margin:4px 0">CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}</div>` : "";
    const field = (label: string, value: string, cls = "") => `<div style="margin-bottom:10px"><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555;margin:0 0 2px">${label}</p><p style="font-weight:500;margin:0;${cls}">${value}</p></div>`;
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Livestock Movement Record #${movement.id}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 32px}.col2{grid-column:span 2}.sig{border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.sigline{border-bottom:1px solid #999;height:32px;margin:16px 0 4px}.note{font-size:9px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h2 style="font-size:14px;font-weight:700;margin:0 0 4px">Livestock Movement Record</h2><p style="font-size:10px;color:#374151;margin:0">BDE Farm Trac — On-Farm Compliance Record</p></div><div style="text-align:right;font-size:10px;color:#374151;line-height:1.8"><p style="margin:4px 0">Printed: ${printedDate}</p><p style="margin:4px 0">Record ID: #${movement.id}</p></div></div>
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
</div><div class="sig"><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Recorded By</p><div class="sigline"></div><p style="font-size:9px;color:#555">Signature / Name</p></div><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Date Recorded</p><div class="sigline"></div><p style="font-size:9px;color:#555">Date</p></div></div>
<div class="note">This is an on-farm record for Red Tractor compliance purposes. Official livestock movement documents (AML1/AML2/eAML2) must be submitted separately to APHA/BCMS as required by UK livestock movement regulations. Records must be kept for a minimum of 3 years.</div>
</body></html>`;
    openPrintWindow(html);
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
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewRecord, setViewRecord] = useState<MortalityRecord | null>(null);
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
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] }); setEditingRecord(null); setShowForm(false); setFormData(EMPTY_MORTALITY); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 540 }}>
            <DialogHeader><DialogTitle>Mortality Record</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-0.5">{label}</div>
                <div className="text-sm" style={{ color: value ? undefined : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div className="grid gap-3.5">
                  <div className="grid grid-cols-3 gap-3.5">
                    <F label="Date of Death" value={fmt(r.dateOfDeath)} />
                    <F label="Species" value={r.species} />
                    <F label="Breed" value={r.breed} />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <F label="Tag Number" value={r.tagNumber} />
                    <F label="Cause of Death" value={r.causeOfDeath} />
                  </div>
                  <div className="grid grid-cols-3 gap-3.5">
                    <F label="Disposal Method" value={r.disposalMethod} />
                    <F label="Disposal Operator" value={r.disposalOperator} />
                    <F label="Disposal Ref." value={r.disposalRef} />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <F label="Vet Attended" value={r.veterinaryAttended ? `Yes${r.vetName ? ` — ${r.vetName}` : ""}` : "No"} />
                    <F label="Post-Mortem" value={r.postMortemCarriedOut ? `Yes${r.postMortemFindings ? ` — ${r.postMortemFindings}` : ""}` : "No"} />
                  </div>
                  <F label="BCMS Notified" value={r.bcmsNotified ? `Yes${r.bcmsNotificationRef ? ` — Ref: ${r.bcmsNotificationRef}` : ""}` : "Not yet notified"} />
                  {r.notes && <F label="Notes" value={r.notes} />}
                </div>
              );
            })()}
            <RecordAttachments farmId={farmId} recordType="mortality" recordId={viewRecord.id} />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.species} onChange={e => setField("species", e.target.value)} required>
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
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.causeOfDeath} onChange={e => setField("causeOfDeath", e.target.value)} required>
                    <option value="">Select cause...</option>
                    {["Disease / Illness", "Injury / Accident", "Euthanasia (vet)", "Euthanasia (emergency)", "Natural causes", "Dystocia / Calving difficulty", "Pneumonia", "Metabolic disorder", "Unknown", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Disposal Method <span className="text-red-500">*</span></label>
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.disposalMethod} onChange={e => setField("disposalMethod", e.target.value)} required>
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
                        <button onClick={() => setViewRecord(r)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary" title="View"><Eye className="w-4 h-4" /></button>
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

      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) { setDeleteId(null); deleteMutation.reset(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Mortality Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — the record is still here." />
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
  ataNumber: "",
  ataExpiryDate: "",
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
  downloadCsvFile(
    `livestock-movements-cph${farmCph || "unknown"}-${new Date().toISOString().slice(0, 10)}.csv`,
    [headers, ...rows],
  );
}

function exportMovementsEaml2(records: Movement[], farm: { cphNumber?: string | null; name?: string | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const timestamp = new Date().toISOString().slice(0, 19);
  const esc = (s: string | null | undefined) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const movXml = records.map(r => {
    const tags = r.earTagNumbers
      ? r.earTagNumbers.split(",").map(t => t.trim()).filter(Boolean)
      : [];
    const animalsXml = tags.length > 0
      ? `\n        <Animals>${tags.map(t => `\n          <Animal><EarTag>${esc(t)}</EarTag></Animal>`).join("")}\n        </Animals>`
      : "";
    return `
    <Movement>
      <MovementDate>${esc(r.movementDate?.slice(0, 10))}</MovementDate>
      <MovementType>${esc(r.movementType)}</MovementType>
      <Species>${esc(r.species)}</Species>
      <NumberOfAnimals>${r.numberOfAnimals ?? ""}</NumberOfAnimals>
      <DepartureCPH>${esc(r.fromLocation)}</DepartureCPH>
      <DestinationCPH>${esc(r.toLocation)}</DestinationCPH>
      <LicenceNumber>${esc(r.licenceNumber)}</LicenceNumber>
      <TransporterName>${esc(r.haulierCompany ?? r.driverName)}</TransporterName>
      <VehicleRegistration>${esc(r.vehicleRegistration)}</VehicleRegistration>${animalsXml}
    </Movement>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<MovementDocument xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="2.0">
  <Header>
    <HoldingCPH>${esc(farm.cphNumber)}</HoldingCPH>
    <HoldingName>${esc(farm.name)}</HoldingName>
    <ExportDate>${today}</ExportDate>
    <ExportTimestamp>${timestamp}</ExportTimestamp>
    <ExportedBy>BDE Farm Trac</ExportedBy>
    <RecordCount>${records.length}</RecordCount>
  </Header>
  <Movements>${movXml}
  </Movements>
</MovementDocument>`;

  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `livestock-movements-eaml2-${farm.cphNumber?.replace(/\//g, "-") ?? "export"}-${today}.xml`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Movements() {
  const { farmId } = useAppStore();
  const [, navigateTo] = useLocation();
  const { farmRecord: movFarmRecord } = useFarmMeta(farmId ?? 0);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = usePersistedNumberFilter({ page: "movements", filter: "crop-year", farmId, defaultValue: currentCropYear() });
  const [showForm, setShowForm] = useState(false);
  const [viewMovement, setViewMovement] = useState<Movement | null>(null);
  const [checklistMovement, setChecklistMovement] = useState<Movement | null>(null);
  const [editingRecord, setEditingRecord] = useState<Movement | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [printRecord, setPrintRecord] = useState<Movement | null>(null);
  const [expandedAttachments, setExpandedAttachments] = useState<number | null>(null);
  const [activeTab, setActiveTab] = usePersistedTab<"movements" | "mortality" | "bcms-submissions" | "lis-submissions" | "lip-submissions" | "lip-lost-found" | "eidcymru-submissions" | "scoteid-submissions">({ page: "movements", farmId, validIds: ["movements", "mortality", "bcms-submissions", "lis-submissions", "lip-submissions", "lip-lost-found", "eidcymru-submissions", "scoteid-submissions"], defaultTab: "movements" });
  const [lipActionDialog, setLipActionDialog] = useState<{ type: "confirm" | "reject" | "cancel"; submissionId: number; lipReference: string } | null>(null);
  const [lipActionReason, setLipActionReason] = useState("");
  const [lipRejectionReasonId, setLipRejectionReasonId] = useState("");
  const [showLostFoundForm, setShowLostFoundForm] = useState(false);
  const [lostFoundViewId, setLostFoundViewId] = useState<number | null>(null);
  const [lostFoundEditId, setLostFoundEditId] = useState<number | null>(null);
  const [lostFoundDeleteId, setLostFoundDeleteId] = useState<number | null>(null);
  const [lostFoundForm, setLostFoundForm] = useState({ earTag: "", status: "lost", eventDate: "", crimeReferenceNumber: "", foundDead: false, notes: "" });
  const [bcmsFilter, setBcmsFilter] = usePersistedFilter({ page: "movements", filter: "bcms", farmId, defaultValue: "all" });
  const { toast } = useToast();
  const [submitConfirmId, setSubmitConfirmId] = useState<number | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [lisSubmitConfirmId, setLisSubmitConfirmId] = useState<number | null>(null);
  const [lisSubmittingId, setLisSubmittingId] = useState<number | null>(null);
  const [firstProductionSubmissionNotice, setFirstProductionSubmissionNotice] = useState<{
    farmId: number;
    reference: string | null;
  } | null>(null);
  const [lisSubTab, setLisSubTab] = useState<"outbound" | "inbound">("outbound");
  const [lisReviewDialog, setLisReviewDialog] = useState<{ movId: number; requestId: number; holding: string; animalTotal: number; fromCph: string | null; toCph: string | null; date: string } | null>(null);
  const [lisReviewArrivalDate, setLisReviewArrivalDate] = useState("");
  const [lisReviewAccepting, setLisReviewAccepting] = useState(true);
  const [lisUndoConfirmId, setLisUndoConfirmId] = useState<number | null>(null);
  const [lisPortalRefId, setLisPortalRefId] = useState<number | null>(null);
  const [lisPortalRefInput, setLisPortalRefInput] = useState("");
  const [bcmsPortalRefId, setBcmsPortalRefId] = useState<number | null>(null);
  const [bcmsPortalRefInput, setBcmsPortalRefInput] = useState("");
  const [lipSubmitConfirmId, setLipSubmitConfirmId] = useState<number | null>(null);
  const [lipSubmittingId, setLipSubmittingId] = useState<number | null>(null);
  const [eidcymruSubmitConfirmId, setEidcymruSubmitConfirmId] = useState<number | null>(null);
  const [eidcymruSubmittingId, setEidcymruSubmittingId] = useState<number | null>(null);
  const [scoteidSubmitConfirmId, setScoteidSubmitConfirmId] = useState<number | null>(null);
  const [scoteidSubmittingId, setScoteidSubmittingId] = useState<number | null>(null);
  const [linkedAnimalIds, setLinkedAnimalIds] = useState<number[]>([]);
  const [incomingAnimalTags, setIncomingAnimalTags] = useState("");
  const [incomingAnimalBreed, setIncomingAnimalBreed] = useState("");
  const [incomingAnimalSex, setIncomingAnimalSex] = useState("");
  const idBannerKey = `movements-id-warning-dismissed-${farmId}`;
  const BANNER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const readBannerDismissed = (key: string): boolean => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const { ts } = JSON.parse(raw) as { ts: number };
      return Date.now() - ts < BANNER_TTL_MS;
    } catch { return false; }
  };
  const [idBannerDismissed, setIdBannerDismissed] = useState(() => readBannerDismissed(`movements-id-warning-dismissed-${farmId}`));
  // Sync dismissal state when the user switches farms
  React.useEffect(() => {
    setIdBannerDismissed(readBannerDismissed(idBannerKey));
  }, [farmId, idBannerKey]);

  // ── Sector-aware livestock identifier warning — shown on all submission tabs ──
  const idBanner = (() => {
    if (!movFarmRecord || idBannerDismissed) return null;
    const r = movFarmRecord as Record<string, unknown>;
    const hasAnyLivestock =
      r.sectorBeef || r.sectorSheep || r.sectorDairy || r.sectorPigs ||
      r.sectorGoats || r.sectorEquine || r.sectorDeer || r.sectorPoultry || r.sectorEggs;
    if (!hasAnyLivestock) return null;

    const missing: { label: string; anchor: string }[] = [];
    if (!r.cphNumber || String(r.cphNumber).trim() === "")
      missing.push({ label: "CPH Number", anchor: "settings-cph" });
    if ((r.sectorSheep || r.sectorGoats) && (!r.flockMark || String(r.flockMark).trim() === ""))
      missing.push({ label: "Flock Mark", anchor: "settings-flock-mark" });
    if ((r.sectorBeef || r.sectorDairy) && (!r.herdMark || String(r.herdMark).trim() === ""))
      missing.push({ label: "Herd Mark", anchor: "settings-herd-mark" });
    if (r.sectorPigs && (!r.pigHerdMark || String(r.pigHerdMark).trim() === ""))
      missing.push({ label: "Pig Herd Mark", anchor: "settings-pig-herd-mark" });

    if (missing.length === 0) return null;

    return (
      <div className="flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 mb-4">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <span className="flex-1">
          <span className="font-semibold">Missing livestock identifiers: </span>
          {missing.map((f, i) => (
            <span key={f.label}>
              {i > 0 && ", "}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-amber-900 font-medium"
                onClick={() => {
                  navigateTo("/settings/farm");
                  setTimeout(() => {
                    const el = document.getElementById(f.anchor);
                    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); }
                  }, 400);
                }}
              >
                {f.label}
              </button>
            </span>
          ))}
          {" — submissions may fail or be incomplete. "}
          <button
            type="button"
            className="underline underline-offset-2 hover:text-amber-900 font-medium"
            onClick={() => navigateTo("/settings/farm")}
          >
            Add in Farm Settings → Livestock
          </button>
        </span>
        <button
          type="button"
          aria-label="Dismiss warning"
          className="shrink-0 ml-1 text-amber-500 hover:text-amber-700"
          onClick={() => {
            try { localStorage.setItem(idBannerKey, JSON.stringify({ ts: Date.now() })); } catch { /* */ }
            setIdBannerDismissed(true);
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  })();

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

  const { data: animalsData } = useQuery({
    queryKey: ["animals-for-movements", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/animals`);
      if (!res.ok) return [];
      const d = await res.json() as { records?: AnimalRecord[] };
      return d.records ?? [];
    },
    enabled: !!farmId,
  });
  const allAnimals: AnimalRecord[] = animalsData ?? [];

  const { data: viewMovementAnimalsData } = useQuery({
    queryKey: ["movement-animals-view", farmId, viewMovement?.id],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/livestock-movements/${viewMovement!.id}/animals`);
      if (!res.ok) return [];
      const d = await res.json() as { animals?: MovementAnimal[] };
      return d.animals ?? [];
    },
    enabled: !!farmId && !!viewMovement?.id,
  });
  const viewMovementAnimals: MovementAnimal[] = viewMovementAnimalsData ?? [];

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
      queryClient.invalidateQueries({ queryKey: ["animals-for-movements", farmId] });
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setLinkedAnimalIds([]);
      setIncomingAnimalTags("");
      setIncomingAnimalBreed("");
      setIncomingAnimalSex("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
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
      queryClient.invalidateQueries({ queryKey: ["animals-for-movements", farmId] });
      setEditingRecord(null);
      setFormData(EMPTY_FORM);
      setLinkedAnimalIds([]);
      setIncomingAnimalTags("");
      setIncomingAnimalBreed("");
      setIncomingAnimalSex("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
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
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { data: submissionsData, refetch: refetchSubmissions } = useQuery({
    queryKey: ["bcms-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bcms-submissions`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.records ?? [],
  });
  const bcmsSubmissions: any[] = submissionsData ?? [];

  const { data: bcmsCredsData } = useQuery({
    queryKey: ["bcms-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bcms-credentials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const bcmsConfigured = !!bcmsCredsData?.configured;

  const { data: lisSubmissionsData, refetch: refetchLisSubmissions } = useQuery({
    queryKey: ["lis-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-submissions`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.submissions ?? [],
  });
  const lisSubmissions: any[] = lisSubmissionsData ?? [];

  const { data: lisInboundData, refetch: refetchLisInbound } = useQuery({
    queryKey: ["lis-inbound-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-inbound-movements`).then(r => r.json()),
    enabled: !!farmId,
  });
  const lisInbound: any[] = Array.isArray(lisInboundData) ? lisInboundData : [];

  const { data: lisCredsData } = useQuery({
    queryKey: ["lis-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-credentials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const lisConfigured = !!lisCredsData?.configured;

  const { data: lipSubmissionsData, refetch: refetchLipSubmissions } = useQuery({
    queryKey: ["lip-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-submissions`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.submissions ?? [],
  });
  const lipSubmissions: any[] = lipSubmissionsData ?? [];

  const { data: lipCredsData } = useQuery({
    queryKey: ["lip-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-credentials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const lipConfigured = !!lipCredsData?.configured;

  const isWales = farmData?.country === "wales";
  const isScotland = farmData?.country === "scotland";

  const { data: eidcymruCredsData } = useQuery({
    queryKey: ["eidcymru-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/eidcymru-credentials`).then(r => r.json()),
    enabled: !!farmId && isWales,
  });
  const eidcymruConfigured = !!eidcymruCredsData?.configured;

  const { data: eidcymruSubmissionsData, refetch: refetchEidcymruSubmissions } = useQuery({
    queryKey: ["eidcymru-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/eidcymru-submissions`).then(r => r.json()),
    enabled: !!farmId && isWales,
    select: (d: any) => d.submissions ?? [],
  });
  const eidcymruSubmissions: any[] = eidcymruSubmissionsData ?? [];

  const { data: scoteidCredsData } = useQuery({
    queryKey: ["scoteid-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/scoteid-credentials`).then(r => r.json()),
    enabled: !!farmId && isScotland,
  });
  const scoteidConfigured = !!scoteidCredsData?.configured;

  const { data: scoteidSubmissionsData, refetch: refetchScoteidSubmissions } = useQuery({
    queryKey: ["scoteid-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/scoteid-submissions`).then(r => r.json()),
    enabled: !!farmId && isScotland,
    select: (d: any) => d.submissions ?? [],
  });
  const scoteidSubmissions: any[] = scoteidSubmissionsData ?? [];

  const { data: lipRejectionReasonsData } = useQuery({
    queryKey: ["lip-rejection-reasons", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-rejection-reasons`).then(r => r.json()),
    enabled: lipConfigured,
    staleTime: 10 * 60 * 1000,
  });
  const lipRejectionReasons: Array<{ rejectionReasonId: string; rejectionReason: string }> = lipRejectionReasonsData?.reasons ?? [];

  const { data: lostFoundData, refetch: refetchLostFound } = useQuery({
    queryKey: ["lip-lost-found", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-lost-found`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.records ?? [],
  });
  const lostFoundRecords: any[] = lostFoundData ?? [];

  const submitLipMut = useMutation({
    mutationFn: (movementId: number) =>
      fetch(`/api/farms/${farmId}/lip-submit-movement/${movementId}`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onMutate: (id) => setLipSubmittingId(id),
    onSuccess: (d) => {
      setLipSubmittingId(null);
      setLipSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchLipSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted to LIP (sandbox)" : "Submitted to LIP", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `LIP ref: ${d.reference}` });
      } else {
        toast({ title: "LIP submission failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => { setLipSubmittingId(null); toast({ title: "LIP submission error", variant: "destructive" }); },
  });

  const confirmLipMut = useMutation({
    mutationFn: (params: { lipReference: string; action: "accept" | "reject"; rejectionReason?: string; rejectionReasonId?: string; submissionId: number }) =>
      fetch(`/api/farms/${farmId}/lip-confirm-movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lipReference: params.lipReference, action: params.action, rejectionReason: params.rejectionReason, rejectionReasonId: params.rejectionReasonId, submissionId: params.submissionId }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      setLipActionDialog(null);
      setLipActionReason("");
      setLipRejectionReasonId("");
      refetchLipSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Confirmation sent (sandbox)" : "Movement confirmed", description: d.reference ? `Ref: ${d.reference}` : undefined });
      } else {
        toast({ title: "Confirmation failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Confirmation error", variant: "destructive" }),
  });

  const checkAsyncMut = useMutation({
    mutationFn: (submissionId: number) =>
      fetch(`/api/farms/${farmId}/lip-check-async/${submissionId}`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d, submissionId) => {
      refetchLipSubmissions();
      if (d.resolved) {
        const ok = /completed/i.test(d.status ?? "");
        toast({ title: ok ? "Submission confirmed" : "Submission failed", description: ok ? (d.reference ? `Ref: ${d.reference}` : "Completed") : `Status: ${d.status}`, variant: ok ? "default" : "destructive" });
      } else {
        toast({ title: "Still pending", description: `LIS status: ${d.status ?? "Pending"}` });
      }
    },
    onError: () => toast({ title: "Status check failed", variant: "destructive" }),
  });

  const cancelLipMut = useMutation({
    mutationFn: (params: { lipReference: string; submissionId: number }) =>
      fetch(`/api/farms/${farmId}/lip-cancel-movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lipReference: params.lipReference, submissionId: params.submissionId }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      setLipActionDialog(null);
      refetchLipSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Cancellation sent (sandbox)" : "Movement cancelled", description: d.reference ? `Ref: ${d.reference}` : undefined });
      } else {
        toast({ title: "Cancellation failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Cancellation error", variant: "destructive" }),
  });

  const saveLostFoundMut = useMutation({
    mutationFn: (params: { id?: number; body: Record<string, unknown> }) =>
      fetch(params.id ? `/api/farms/${farmId}/lip-lost-found/${params.id}` : `/api/farms/${farmId}/lip-lost-found`, {
        method: params.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params.body),
      }).then(r => r.json()),
    onSuccess: (d) => {
      refetchLostFound();
      setShowLostFoundForm(false);
      setLostFoundEditId(null);
      setLostFoundForm({ earTag: "", status: "lost", eventDate: "", crimeReferenceNumber: "", foundDead: false, notes: "" });
      const rec = d.record;
      if (rec?.lipStatus === "submitted" || rec?.lipStatus === "pending") {
        toast({ title: "Lost & Found record saved", description: d.reference ? `LIP ref: ${d.reference}` : "Record saved locally" });
      } else if (d.error) {
        toast({ title: "LIP submission failed", description: d.error, variant: "destructive" });
      } else {
        toast({ title: "Lost & Found record saved" });
      }
    },
    onError: () => toast({ title: "Failed to save record", variant: "destructive" }),
  });

  const submitEidcymruMut = useMutation({
    mutationFn: (movementId: number) =>
      fetch(`/api/farms/${farmId}/eidcymru-submit/${movementId}`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onMutate: (id) => setEidcymruSubmittingId(id),
    onSuccess: (d) => {
      setEidcymruSubmittingId(null);
      setEidcymruSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchEidcymruSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted to EIDCymru staging" : "Submitted to EIDCymru", description: `${d.sandbox ? "Staging" : "EIDCymru"} ref: ${d.reference}${d.warnings?.length ? ` — ${d.warnings.map((warning: { description?: string }) => warning.description).filter(Boolean).join("; ")}` : ""}` });
      } else {
        toast({ title: "EIDCymru submission failed", description: d.errorMessage, variant: "destructive" });
      }
    },
    onError: () => { setEidcymruSubmittingId(null); toast({ title: "EIDCymru submission error", variant: "destructive" }); },
  });

  const submitScoteidMut = useMutation({
    mutationFn: (movementId: number) =>
      fetch(`/api/farms/${farmId}/scoteid-submit/${movementId}`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onMutate: (id) => setScoteidSubmittingId(id),
    onSuccess: (d) => {
      setScoteidSubmittingId(null);
      setScoteidSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchScoteidSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted to ScotEID (sandbox)" : "Submitted to ScotEID", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `ScotEID ref: ${d.reference}` });
      } else {
        toast({ title: "ScotEID submission failed", description: d.errorMessage, variant: "destructive" });
      }
    },
    onError: () => { setScoteidSubmittingId(null); toast({ title: "ScotEID submission error", variant: "destructive" }); },
  });

  const submitLisMut = useMutation({
    mutationFn: (movementId: number) =>
      fetch(`/api/farms/${farmId}/lis-submit/${movementId}`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onMutate: (id) => setLisSubmittingId(id),
    onSuccess: (d, id) => {
      setLisSubmittingId(null);
      setLisSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchLisSubmissions();
      if (d.success) {
        if (d.firstProductionSubmission) {
          setFirstProductionSubmissionNotice({ farmId, reference: d.reference ?? null });
        }
        toast({ title: d.sandbox ? "Submitted to LIS (sandbox)" : "Submitted to LIS", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `LIS ref: ${d.reference}` });
      } else {
        toast({ title: "LIS submission failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => { setLisSubmittingId(null); toast({ title: "LIS submission error", variant: "destructive" }); },
  });

  const saveBcmsPortalRefMut = useMutation({
    mutationFn: ({ movementId, bcmsManualRef }: { movementId: number; bcmsManualRef: string }) =>
      fetch(`/api/farms/${farmId}/movements/${movementId}/bcms-portal-ref`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bcmsManualRef }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.success) {
        queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
        setBcmsPortalRefId(null);
        setBcmsPortalRefInput("");
        toast({ title: "BCMS reference saved", description: "Movement marked as notified on BCMS Online." });
      } else {
        toast({ title: "Failed to save reference", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Failed to save BCMS reference", variant: "destructive" }),
  });

  const saveLisPortalRefMut = useMutation({
    mutationFn: ({ movementId, lisManualRef }: { movementId: number; lisManualRef: string }) =>
      fetch(`/api/farms/${farmId}/movements/${movementId}/lis-portal-ref`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lisManualRef }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.success) {
        queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
        setLisPortalRefId(null);
        setLisPortalRefInput("");
        toast({ title: "LIS portal reference saved", description: "Movement marked as notified on the LIS keeper portal." });
      } else {
        toast({ title: "Failed to save reference", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Failed to save LIS portal reference", variant: "destructive" }),
  });

  const lisSyncMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/lis/sync-herds`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      refetchLisSubmissions();
      refetchLisInbound();
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      toast({ title: "LIS sync complete", description: d.message ?? "Synced with LIS successfully" });
    },
    onError: () => toast({ title: "LIS sync failed", variant: "destructive" }),
  });

  const lisReviewMut = useMutation({
    mutationFn: (vars: { movId: number; isAccepted: boolean; arrivalDate: string }) =>
      fetch(`/api/farms/${farmId}/lis-review-movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      setLisReviewDialog(null);
      refetchLisInbound();
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      if (d.success) {
        toast({ title: d.isAccepted ? "Movement accepted" : "Movement rejected", description: d.sandbox ? "Simulated in sandbox" : "LIS has been notified." });
      } else {
        toast({ title: "Review failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Review error", variant: "destructive" }),
  });

  const lisUndoMut = useMutation({
    mutationFn: (movId: number) =>
      fetch(`/api/farms/${farmId}/lis-undo-movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movId }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => {
      setLisUndoConfirmId(null);
      refetchLisInbound();
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      if (d.success) {
        toast({ title: "Movement withdrawn", description: d.sandbox ? "Simulated in sandbox" : "LIS has been notified of the withdrawal." });
      } else {
        toast({ title: "Undo failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Undo error", variant: "destructive" }),
  });

  const submitBcmsMut = useMutation({
    mutationFn: (movementId: number) =>
      fetch(`/api/farms/${farmId}/bcms-submit/${movementId}`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onMutate: (id) => setSubmittingId(id),
    onSuccess: (d, id) => {
      setSubmittingId(null);
      setSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted (sandbox)" : "Submitted to BCMS", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `BCMS ref: ${d.reference}` });
      } else {
        toast({ title: "Submission failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => { setSubmittingId(null); toast({ title: "Submission error", variant: "destructive" }); },
  });

  const records: Movement[] = movementsData?.records ?? [];

  const overdueMovements = records.filter((r) => {
    const exempt = r.movementType === "birth" || r.movementType === "between";
    return !exempt && !r.legalNotificationSubmitted && daysSince(r.movementDate) > 3;
  });

  const LIS_SPECIES_LIST = ["sheep", "goat", "deer"];
  const lisUnreported = records.filter(r =>
    LIS_SPECIES_LIST.includes((r.species ?? "").toLowerCase()) &&
    !r.legalNotificationSubmitted && !r.lisMovementRef
  );
  const lipUnreported = records.filter(r =>
    (r.species ?? "").toLowerCase() === "cattle" &&
    (r.movementType === "on" || r.movementType === "off") &&
    !r.legalNotificationSubmitted && !(r as any).bcmsSubmissionRef
  );

  const requiresBcms = (r: Movement) => r.movementType !== "birth" && r.movementType !== "between";

  const bcmsFiltered = records.filter(r => {
    if (bcmsFilter === "all") return true;
    if (bcmsFilter === "pending") return requiresBcms(r) && !r.legalNotificationSubmitted;
    if (bcmsFilter === "submitted") return r.legalNotificationSubmitted;
    return true;
  });

  const filtered = bcmsFiltered.filter((r) => {
    if (!isInCropYear(r.movementDate, cropYear)) return false;
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

  const yearRecords = records.filter(r => isInCropYear(r.movementDate, cropYear));
  const pendingCount = yearRecords.filter(r => requiresBcms(r) && !r.legalNotificationSubmitted).length;
  const submittedCount = yearRecords.filter(r => r.legalNotificationSubmitted).length;

  const resetAnimalState = () => {
    setLinkedAnimalIds([]);
    setIncomingAnimalTags("");
    setIncomingAnimalBreed("");
    setIncomingAnimalSex("");
  };

  const openAdd = () => {
    setEditingRecord(null);
    setFormData({ ...EMPTY_FORM, movementDate: new Date().toISOString().slice(0, 10) });
    resetAnimalState();
    setShowForm(true);
  };

  const openEdit = async (r: Movement) => {
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
      ataNumber: r.ataNumber ?? "",
      ataExpiryDate: r.ataExpiryDate ? r.ataExpiryDate.slice(0, 10) : "",
      reason: r.reason ?? "",
      notes: r.notes ?? "",
    });
    resetAnimalState();
    if (r.movementType === "off") {
      try {
        const res = await fetch(`/api/farms/${farmId}/livestock-movements/${r.id}/animals`);
        if (res.ok) {
          const d = await res.json() as { animals?: MovementAnimal[] };
          const ids = (d.animals ?? []).filter((a) => a.animalId != null).map((a) => a.animalId as number);
          setLinkedAnimalIds(ids);
        }
      } catch { /* ignore */ }
    }
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = incomingAnimalTags
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const autoCount =
      formData.movementType === "off" && linkedAnimalIds.length > 0
        ? linkedAnimalIds.length
        : formData.movementType === "on" && parsedTags.length > 0
        ? parsedTags.length
        : null;
    const body: Record<string, unknown> = {
      ...formData,
      numberOfAnimals: formData.numberOfAnimals
        ? Number(formData.numberOfAnimals)
        : autoCount,
      legalNotificationDate:
        formData.legalNotificationSubmitted && formData.legalNotificationDate
          ? new Date(formData.legalNotificationDate).toISOString()
          : null,
    };
    if (formData.movementType === "off" && linkedAnimalIds.length > 0) {
      body.linkedAnimalIds = linkedAnimalIds;
    }
    if (formData.movementType === "on" && parsedTags.length > 0) {
      body.incomingAnimalEntries = parsedTags.map((tag) => ({
        tagNumber: tag,
        species: formData.species || undefined,
        breed: incomingAnimalBreed || undefined,
        sex: incomingAnimalSex || undefined,
      }));
    }
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
        <TabButton active={activeTab === "bcms-submissions"} onClick={() => setActiveTab("bcms-submissions")}>
          <span className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />BCMS Submissions
            {bcmsSubmissions.length > 0 && <span className="text-xs opacity-60">({bcmsSubmissions.length})</span>}
          </span>
        </TabButton>
        <TabButton active={activeTab === "lis-submissions"} onClick={() => setActiveTab("lis-submissions")}>
          <span className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />LIS Submissions
            {lisSubmissions.length > 0 && <span className="text-xs opacity-60">({lisSubmissions.length})</span>}
          </span>
        </TabButton>
        <TabButton active={activeTab === "lip-submissions"} onClick={() => setActiveTab("lip-submissions")}>
          <span className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />LIP Submissions
            {lipSubmissions.length > 0 && <span className="text-xs opacity-60">({lipSubmissions.length})</span>}
          </span>
        </TabButton>
        <TabButton active={activeTab === "lip-lost-found"} onClick={() => setActiveTab("lip-lost-found")}>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />Lost &amp; Found
            {lostFoundRecords.length > 0 && <span className="text-xs opacity-60">({lostFoundRecords.length})</span>}
          </span>
        </TabButton>
        {isWales && (
          <TabButton active={activeTab === "eidcymru-submissions"} onClick={() => setActiveTab("eidcymru-submissions")}>
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />EIDCymru
              {eidcymruSubmissions.length > 0 && <span className="text-xs opacity-60">({eidcymruSubmissions.length})</span>}
            </span>
          </TabButton>
        )}
        {isScotland && (
          <TabButton active={activeTab === "scoteid-submissions"} onClick={() => setActiveTab("scoteid-submissions")}>
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />ScotEID
              {scoteidSubmissions.length > 0 && <span className="text-xs opacity-60">({scoteidSubmissions.length})</span>}
            </span>
          </TabButton>
        )}
      </TabBar>

      {firstProductionSubmissionNotice?.farmId === farmId && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p>
            <strong>First live LIS submission sent — awaiting LIS confirmation.</strong> LIS reference:{" "}
            <span className="font-mono font-semibold">
              {firstProductionSubmissionNotice.reference ?? "not returned by LIS"}
            </span>
          </p>
        </div>
      )}

      {activeTab === "movements" && (<>
      <TabBar className="mb-5">
        <TabButton active={bcmsFilter === "all"} onClick={() => setBcmsFilter("all")}>
          All <span className="ml-1 text-xs opacity-60">({yearRecords.length})</span>
        </TabButton>
        <TabButton active={bcmsFilter === "pending"} onClick={() => setBcmsFilter("pending")}>
          BCMS Pending <span className="ml-1 text-xs opacity-60">({pendingCount})</span>
        </TabButton>
        <TabButton active={bcmsFilter === "submitted"} onClick={() => setBcmsFilter("submitted")}>
          BCMS Submitted <span className="ml-1 text-xs opacity-60">({submittedCount})</span>
        </TabButton>
      </TabBar>
      {/* ── Sector-aware livestock identifier warning ── */}
      {idBanner}
      {/* Overdue compliance alert */}
      {overdueMovements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-900 flex gap-3 items-start">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <strong>BCMS/APHA notification overdue</strong> — {overdueMovements.length} movement{overdueMovements.length > 1 ? "s are" : " is"} more than 3 days old without a legal notification recorded. These must be reported to BCMS/APHA immediately. Update each record once reported.
          </div>
        </div>
      )}

      {(() => {
        const lisUnnotified = yearRecords.filter(r => {
          const sp = (r.species ?? "").toLowerCase();
          return (sp === "sheep" || sp === "goat" || sp === "deer")
            && (r.movementType === "on" || r.movementType === "off")
            && !r.legalNotificationSubmitted
            && !r.lisMovementRef;
        });
        if (lisUnnotified.length === 0) return null;
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <strong>LIS notification gap</strong> — {lisUnnotified.length} sheep/goat/deer movement{lisUnnotified.length > 1 ? "s" : ""} in this period {lisUnnotified.length > 1 ? "have" : "has"} not been notified to LIS. Report {lisUnnotified.length > 1 ? "these" : "this"} at{" "}
              <a href="https://cla.livestockinformation.org.uk" target="_blank" rel="noopener noreferrer" className="underline font-medium">cla.livestockinformation.org.uk</a>{" "}
              and record the reference number against each movement. Use <strong>Print LIS Report</strong> below to produce audit evidence.
            </div>
          </div>
        );
      })()}

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search movements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const filterLabel = bcmsFilter === "all" ? "All movements" : bcmsFilter === "pending" ? "BCMS Pending" : "BCMS Submitted";
              printMovementsRegister(filtered, farmData ?? null, filterLabel);
            }}
            disabled={filtered.length === 0}
          >
            <Printer className="w-4 h-4 mr-1" /> Print Register
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const periodLabel = `Crop year ${cropYear}`;
              printLisComplianceReport(records, farmData ?? null, periodLabel, (lisCredsData as any)?.lisLastSyncedAt ?? null);
            }}
            disabled={records.length === 0}
            title="Print LIS Movement Notification Compliance Report for Red Tractor audit"
          >
            <Printer className="w-4 h-4 mr-1" /> LIS Report
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMovementsEaml2(records, { cphNumber: farmData?.cphNumber, name: farmData?.name })}
            disabled={records.length === 0}
            title="Download movements as eAML2-compatible XML (upload to eAML2.org.uk)"
          >
            <Download className="w-4 h-4 mr-1" /> eAML2 XML
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Movement
          </Button>
        </div>
      </div>

      {viewMovement && (
        <Dialog open onOpenChange={() => setViewMovement(null)}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Movement Record</DialogTitle></DialogHeader>
            {(() => {
              const r = viewMovement;
              const typeLabels: Record<string, string> = { "on": "On (Purchase)", "off": "Off (Sale)", "birth": "Birth", "death": "Death", "between": "Between Holdings" };
              const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-0.5">{label}</div>
                <div className="text-sm" style={{ color: value ? undefined : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div className="grid gap-3.5">
                  <div className="grid grid-cols-3 gap-3.5">
                    <F label="Date" value={fmt(r.movementDate)} />
                    <F label="Type" value={typeLabels[r.movementType] ?? r.movementType} />
                    <F label="Species" value={r.species} />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <F label="From" value={r.fromLocation} />
                    <F label="To" value={r.toLocation} />
                  </div>
                  <div className="grid grid-cols-3 gap-3.5">
                    <F label="Number of Animals" value={r.numberOfAnimals != null ? String(r.numberOfAnimals) : null} />
                    <F label="AML / Licence Ref." value={r.licenceNumber} />
                    <F label="BCMS Ref." value={r.bcmsSubmissionRef} />
                  </div>
                  {r.earTagNumbers && <F label="Ear Tag Numbers" value={r.earTagNumbers} />}
                  {viewMovementAnimals.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-2">
                        Linked Animals ({viewMovementAnimals.length})
                      </div>
                      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border/50">
                        {viewMovementAnimals.map((a) => {
                          const tag = a.animalEarTagNumber ?? a.animalTagNumber ?? a.tagNumber ?? a.animalCode ?? (a.animalId ? `#${a.animalId}` : "—");
                          return (
                            <div key={a.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                              <span className="font-mono font-medium text-foreground flex-1">{tag}</span>
                              {a.breed && <span className="text-xs text-foreground/50">{a.breed}</span>}
                              {a.sex && <span className="text-xs text-foreground/40 capitalize">{a.sex}</span>}
                              {!a.animalId && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Unlinked</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <F label="BCMS / APHA Notified" value={r.legalNotificationSubmitted ? `Yes${r.legalNotificationDate ? ` — ${fmt(r.legalNotificationDate)}` : ""}` : "⚠ Not yet notified"} />
                  {r.transporterDetails && <F label="Transporter" value={r.transporterDetails} />}
                  {r.ataNumber && <F label="Transporter ATA No." value={r.ataNumber + (r.ataExpiryDate ? ` (expires ${fmt(r.ataExpiryDate)})` : "")} />}
                  {r.reason && <F label="Reason" value={r.reason} />}
                  {r.notes && <F label="Notes" value={r.notes} />}
                  {/* Haulage cross-link */}
                  {r.haulageRecordId && (
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Truck size={13} color="#1d4ed8" />
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e40af" }}>
                          Linked to Haulage Record HR-{r.haulageRecordId}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }}>
                        This movement was arranged via the Haulage module. See the Haulage &amp; Transport tab for vehicle and cost details.
                      </p>
                    </div>
                  )}
                  {/* Dispatch checklist summary for off movements */}
                  {r.movementType === "off" && (
                    <div style={{ background: r.checklistCompletedAt ? "#f0fdf4" : "#fffbeb", border: `1px solid ${r.checklistCompletedAt ? "#bbf7d0" : "#fde68a"}`, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {r.checklistCompletedAt
                          ? <CheckCircle2 size={14} color="#16a34a" />
                          : <ClipboardCheck size={14} color="#92400e" />}
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: r.checklistCompletedAt ? "#166534" : "#92400e" }}>
                          {r.checklistCompletedAt
                            ? `Dispatch checklist signed off by ${r.checklistCompletedBy}`
                            : "Dispatch checklist not yet completed"}
                        </span>
                      </div>
                      {r.vehicleRegistration && (
                        <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>
                          {r.haulierCompany ? `${r.haulierCompany} · ` : ""}{r.vehicleRegistration}{r.driverName ? ` · ${r.driverName}` : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            <DialogFooter className="mt-4" style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button variant="outline" onClick={() => setViewMovement(null)}>Close</Button>
              {viewMovement?.movementType === "off" && (
                <Button variant="outline" style={{ gap: 6, borderColor: "#1a6b3a", color: "#1a6b3a" }} onClick={() => { const r = viewMovement; setViewMovement(null); setChecklistMovement(r); }}>
                  <ClipboardCheck size={14} /> Dispatch Checklist
                  {viewMovement.checklistCompletedAt && <CheckCircle2 size={12} color="#16a34a" />}
                </Button>
              )}
              <Button onClick={() => { const r = viewMovement; setViewMovement(null); openEdit(r); }}>Edit Movement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Livestock Dispatch Checklist Dialog */}
      {checklistMovement && farmId && (
        <LivestockDispatchChecklist
          farmId={farmId}
          movementId={checklistMovement.id}
          onClose={() => setChecklistMovement(null)}
        />
      )}

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
                    className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
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

              {/* Individual animal section — type-specific */}
              {(formData.species === "cattle" || formData.species === "sheep" || formData.species === "goats") && (
                formData.movementType === "off" ? (
                  /* OFF movement: link existing animals from register */
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                      Link Animals from Register
                      <span className="text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        Status set to Sold on save
                      </span>
                    </label>
                    <AnimalRegisterPicker
                      animals={allAnimals}
                      speciesFilter={formData.species}
                      selectedIds={linkedAnimalIds}
                      onChange={(ids) => {
                        setLinkedAnimalIds(ids);
                        if (ids.length > 0 && !formData.numberOfAnimals) {
                          setField("numberOfAnimals", String(ids.length));
                        }
                      }}
                    />
                    <p className="text-xs text-foreground/50">
                      Select the animals leaving this holding. Their status will be updated to <strong>Sold</strong> automatically.
                    </p>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">
                        Additional / Unregistered Tags <span className="font-normal text-foreground/40">(optional)</span>
                      </label>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[56px] resize-y"
                        placeholder="Ear tags not yet in your Animal Register…"
                        value={formData.earTagNumbers}
                        onChange={(e) => setField("earTagNumbers", e.target.value)}
                      />
                    </div>
                  </div>
                ) : formData.movementType === "on" ? (
                  /* ON movement: register incoming animals */
                  <div className="space-y-3 border border-emerald-200 bg-emerald-50/30 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <label className="text-sm font-semibold text-emerald-900">Register Incoming Animals</label>
                      <span className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                        Adds to Animal Register
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Ear Tag Numbers</label>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] resize-y"
                        placeholder={"Enter ear tag numbers, one per line or comma-separated\ne.g. UK123456789012\nUK123456789013"}
                        value={incomingAnimalTags}
                        onChange={(e) => {
                          setIncomingAnimalTags(e.target.value);
                          const count = e.target.value.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean).length;
                          if (count > 0 && !formData.numberOfAnimals) setField("numberOfAnimals", String(count));
                        }}
                      />
                      {incomingAnimalTags.trim() && (() => {
                        const n = incomingAnimalTags.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean).length;
                        return (
                          <p className="text-xs text-emerald-700 font-medium mt-1">
                            {n} animal record{n !== 1 ? "s" : ""} will be created in the Animal Register
                          </p>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground/70 mb-1 block">Default Breed <span className="font-normal text-foreground/40">(optional)</span></label>
                        <Input
                          placeholder="e.g. Charolais"
                          value={incomingAnimalBreed}
                          onChange={(e) => setIncomingAnimalBreed(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground/70 mb-1 block">Default Sex <span className="font-normal text-foreground/40">(optional)</span></label>
                        <select
                          className="w-full h-10 rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:outline-none"
                          value={incomingAnimalSex}
                          onChange={(e) => setIncomingAnimalSex(e.target.value)}
                        >
                          <option value="">Not specified</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="castrated">Castrated</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/50">
                      Animals will be added to your Individual Animal Register with status <strong>Active</strong>. Edit individual records from the Animal Register afterwards.
                    </p>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Additional Tag Notes <span className="font-normal text-foreground/40">(optional free text)</span></label>
                      <Input
                        placeholder="Any additional tag reference notes…"
                        value={formData.earTagNumbers}
                        onChange={(e) => setField("earTagNumbers", e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  /* Other movement types: free-text textarea */
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
                )
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
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Transporter ATA Number <span className="text-xs text-muted-foreground font-normal">(Animal Transporter Authorisation)</span></label>
                  <Input placeholder="e.g. UK/ATA/1234567" value={formData.ataNumber} onChange={(e) => setField("ataNumber", e.target.value)} className="font-mono" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">ATA Expiry Date</label>
                  <Input type="date" value={formData.ataExpiryDate} onChange={(e) => setField("ataExpiryDate", e.target.value)} />
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
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingRecord(null); setFormData(EMPTY_FORM); resetAnimalState(); }}>
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
      <Dialog open={deleteConfirmId !== null} onOpenChange={(o) => { if (!o) { setDeleteConfirmId(null); deleteMutation.reset(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Movement Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure you want to delete this movement record? This action cannot be undone.</p>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — the record is still here." />
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
                      <td className="p-4 text-sm font-medium text-foreground">
                        {formatDate(r.movementDate)}
                        {r.lisSource && (
                          <span title={`Imported from LIS (${r.lisSource.replace(/_/g, " ")})`} style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", fontSize: "0.63rem", padding: "1px 5px", borderRadius: 8, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontWeight: 700, verticalAlign: "middle", letterSpacing: "0.03em" }}>
                            LIS
                          </span>
                        )}
                      </td>
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
                      <td className="p-4">
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <BcmsStatusBadge movement={r} />
                          {(() => {
                            const speciesLower = (r.species ?? "").toLowerCase();
                            const isCattle = speciesLower === "cattle" || (!r.species && r.movementType !== "birth");
                            const isLisSpecies = speciesLower === "sheep" || speciesLower === "goat" || speciesLower === "deer";
                            const isSubmittableType = r.movementType === "on" || r.movementType === "off" || r.movementType === "birth" || r.movementType === "death";
                            // LIS CLA v1.0 only supports on/off movements — births and deaths are NOT supported
                            // (confirmed by LIS Support July 2026: "Per the published public CLA v1.0 contract,
                            //  births and deaths are unsupported.")
                            const isLisSubmittableType = r.movementType === "on" || r.movementType === "off";

                            const bcmsBtn = isCattle && isSubmittableType && !(r.legalNotificationSubmitted && !r.bcmsSubmissionRef?.startsWith("SANDBOX-")) ? (
                              <button
                                onClick={() => setSubmitConfirmId(r.id)}
                                disabled={submittingId === r.id}
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                {submittingId === r.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                {bcmsCredsData?.sandboxMode !== false ? "Test Submit" : "Submit to BCMS"}
                              </button>
                            ) : null;

                            // Manual BCMS portal reference — shown on unnotified cattle rows
                            // until automated CTWS API submission is live (pending DEFRA DDTS vendor registration)
                            const bcmsPortalBtn = isCattle && isSubmittableType && !r.legalNotificationSubmitted ? (
                              <button
                                onClick={() => { setBcmsPortalRefId(r.id); setBcmsPortalRefInput(""); }}
                                title="Record the reference number you received after submitting this movement on BCMS Online"
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                <ExternalLink size={10} />
                                Record BCMS Ref
                              </button>
                            ) : null;

                            // For England LIS species birth/death rows — portal guidance badge
                            // (Wales uses EIDCymru, Scotland uses ScotEID, so portal badge is England-only)
                            const isEngland = !isWales && !isScotland;
                            const isLisPortalType = isLisSpecies && isEngland && (r.movementType === "birth" || r.movementType === "death");
                            const lisPortalBtn = isLisPortalType ? (
                              r.lisManualRef ? (
                                <span
                                  title={`LIS portal reference: ${r.lisManualRef}${r.lisManualNotifiedAt ? ` — recorded ${formatDate(r.lisManualNotifiedAt)}` : ""}`}
                                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", fontWeight: 600, whiteSpace: "nowrap", cursor: "default" }}>
                                  <CheckCircle2 size={10} />
                                  LIS Notified
                                </span>
                              ) : (
                                <button
                                  onClick={() => { setLisPortalRefId(r.id); setLisPortalRefInput(""); }}
                                  title="Births and deaths cannot be submitted via the LIS CLA API. Register on the LIS keeper portal and record your confirmation reference here."
                                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                                  <ExternalLink size={10} />
                                  Register via LIS portal
                                </button>
                              )
                            ) : null;

                            const lisBtn = isLisSpecies && isLisSubmittableType && !(r.legalNotificationSubmitted && r.bcmsSubmissionRef && !r.bcmsSubmissionRef.startsWith("LIS-SANDBOX-")) ? (
                              <button
                                onClick={() => setLisSubmitConfirmId(r.id)}
                                disabled={lisSubmittingId === r.id}
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                {lisSubmittingId === r.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                {lisCredsData?.sandboxMode !== false ? "Test Submit (LIS)" : "Submit to LIS"}
                              </button>
                            ) : null;

                            const isLipSubmittable = isCattle && r.movementType !== "birth" && lipConfigured;
                            const lipBtn = isLipSubmittable ? (
                              <span
                                title="LIS Cattle API submissions are temporarily paused from 21 July 2026 while LIS transitions cattle traceability services. Please use BCMS (CTS Web Services) for cattle movements in the meantime."
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed", fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                <WifiOff size={10} />
                                LIP Paused
                              </span>
                            ) : null;

                            const isEidcymruSpecies = (speciesLower === "sheep" || speciesLower === "goat") && isWales && (r.movementType === "on" || r.movementType === "off" || r.movementType === "between");
                            const eidcymruBtn = isEidcymruSpecies ? (
                              <button
                                onClick={() => setEidcymruSubmitConfirmId(r.id)}
                                disabled={eidcymruSubmittingId === r.id}
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                {eidcymruSubmittingId === r.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                {eidcymruCredsData?.sandboxMode !== false ? "Submit EIDCymru (staging)" : "Submit EIDCymru"}
                              </button>
                            ) : null;

                            const isScoteidSubmittable = isScotland && isSubmittableType;
                            const scoteidBtn = isScoteidSubmittable ? (
                              <button
                                onClick={() => setScoteidSubmitConfirmId(r.id)}
                                disabled={scoteidSubmittingId === r.id}
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #fed7aa", background: "#fff7ed", color: "#c2410c", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                {scoteidSubmittingId === r.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                {scoteidCredsData?.sandboxMode !== false ? "Test (ScotEID)" : "Submit ScotEID"}
                              </button>
                            ) : null;

                            return <>{bcmsBtn}{bcmsPortalBtn}{lisPortalBtn}{lisBtn}{lipBtn}{eidcymruBtn}{scoteidBtn}</>;
                          })()}
                        </div>
                      </td>
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
                            onClick={() => setViewMovement(r)}
                            className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
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
      {/* Submit to BCMS confirmation dialog */}
      <Dialog open={submitConfirmId !== null} onOpenChange={o => { if (!o) { setSubmitConfirmId(null); submitBcmsMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 440 }}>
          <DialogHeader><DialogTitle>Submit to BCMS</DialogTitle></DialogHeader>
          {(() => {
            const r = records.find(m => m.id === submitConfirmId);
            if (!r) return null;
            const isSandbox = bcmsCredsData?.sandboxMode !== false;
            return (
              <div className="space-y-4 py-1">
                {isSandbox && (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Shield size={14} style={{ color: "#92400e", marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: "0.78rem", color: "#92400e", lineHeight: 1.5 }}>
                      <strong>Sandbox mode:</strong> This will simulate the CTWS submission and log the XML payload — no data will be sent to BCMS. Go to Farm Settings → BCMS Integration to configure your credentials.
                    </p>
                  </div>
                )}
                {!bcmsConfigured && !isSandbox && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: "0.78rem", color: "#dc2626" }}><strong>Not configured:</strong> Set up your CTWS credentials in Farm Settings first.</p>
                  </div>
                )}
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }}>
                  <div className="grid grid-cols-2 gap-y-1.5">
                    {[["Movement", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "—"], ["Animals", String(r.numberOfAnimals ?? "—")], ["From", r.fromLocation ?? "—"], ["To", r.toLocation ?? "—"], ["AML Ref", r.licenceNumber ?? "—"]].map(([k, v]) => (
                      <React.Fragment key={k}><span style={{ color: "#6b7280", fontWeight: 500 }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></React.Fragment>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                  {isSandbox ? "The CTWS XML payload will be logged on the server. Once BDE obtains DEFRA vendor credentials, live submissions will be enabled automatically." : "This will send the movement notification directly to BCMS via CTS Web Services. Ensure the details above are correct before proceeding."}
                </p>
              </div>
            );
          })()}
          <DialogMutationError mutation={submitBcmsMut} message="BCMS submission failed — nothing was sent." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitConfirmId(null)}>Cancel</Button>
            <Button
              className="bg-green-800 hover:bg-green-900 text-white"
              disabled={submitBcmsMut.isPending}
              onClick={() => submitConfirmId !== null && submitBcmsMut.mutate(submitConfirmId)}
            >
              {submitBcmsMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Send size={14} className="mr-1" />}
              {bcmsCredsData?.sandboxMode !== false ? "Run Sandbox Test" : "Submit to BCMS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit to LIS confirmation dialog */}
      <Dialog open={lisSubmitConfirmId !== null} onOpenChange={o => { if (!o) { setLisSubmitConfirmId(null); submitLisMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 440 }}>
          <DialogHeader><DialogTitle>Submit to LIS</DialogTitle></DialogHeader>
          {(() => {
            const r = records.find(m => m.id === lisSubmitConfirmId);
            if (!r) return null;
            const isSandbox = lisCredsData?.sandboxMode !== false;
            return (
              <div className="space-y-4 py-1">
                {isSandbox && (
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Shield size={14} style={{ color: "#1d4ed8", marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: "0.78rem", color: "#1d4ed8", lineHeight: 1.5 }}>
                      <strong>Sandbox mode:</strong> This will simulate the LIS submission and log the request payload — no data will be sent to the Livestock Information Service. Go to Farm Settings → LIS Integration to configure your credentials.
                    </p>
                  </div>
                )}
                {!lisConfigured && !isSandbox && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: "0.78rem", color: "#dc2626" }}><strong>Not configured:</strong> Set up your LIS credentials in Farm Settings first.</p>
                  </div>
                )}
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }}>
                  <div className="grid grid-cols-2 gap-y-1.5">
                    {[["Movement", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "—"], ["Animals", String(r.numberOfAnimals ?? "—")], ["From CPH", r.fromLocation ?? "—"], ["To CPH", r.toLocation ?? "—"], ["Licence Ref", r.licenceNumber ?? "—"]].map(([k, v]) => (
                      <React.Fragment key={k}><span style={{ color: "#6b7280", fontWeight: 500 }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></React.Fragment>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                  {isSandbox
                    ? "The LIS CLA API JSON payload will be logged on the server. Once BDE registers on the LIS Developer Hub and sets a subscription key, live submissions will be enabled automatically."
                    : "This will send the movement notification directly to the Livestock Information Service (LIS) via the CLA API. Sheep/goat/deer movements must be reported within the required timescales."}
                </p>
              </div>
            );
          })()}
          <DialogMutationError mutation={submitLisMut} message="LIS submission failed — nothing was sent." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLisSubmitConfirmId(null)}>Cancel</Button>
            <Button
              className="bg-blue-700 hover:bg-blue-800 text-white"
              disabled={submitLisMut.isPending}
              onClick={() => lisSubmitConfirmId !== null && submitLisMut.mutate(lisSubmitConfirmId)}
            >
              {submitLisMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Send size={14} className="mr-1" />}
              {lisCredsData?.sandboxMode !== false ? "Run Sandbox Test" : "Submit to LIS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record BCMS Online Reference — all cattle movements (England) */}
      <Dialog open={bcmsPortalRefId !== null} onOpenChange={o => { if (!o) { setBcmsPortalRefId(null); setBcmsPortalRefInput(""); saveBcmsPortalRefMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Record BCMS Reference</DialogTitle></DialogHeader>
          {(() => {
            const r = records.find(m => m.id === bcmsPortalRefId);
            if (!r) return null;
            const typeLabel = r.movementType === "birth" ? "birth" : r.movementType === "death" ? "death" : r.movementType === "on" ? "movement ON" : "movement OFF";
            return (
              <div className="space-y-4 py-1">
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <ExternalLink size={14} style={{ color: "#92400e", marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontSize: "0.78rem", color: "#92400e", lineHeight: 1.6 }}>
                    <strong>Manual BCMS notification required.</strong>
                    {" "}The automated CTWS API is not yet active — please submit this {typeLabel} on BCMS Online, then record your confirmation reference here to complete the audit trail.
                    <div style={{ marginTop: 8 }}>
                      <a
                        href="https://www.bcms.gov.uk"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1d4ed8", fontWeight: 600, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <ExternalLink size={11} />{"  "}Open BCMS Online (www.bcms.gov.uk)
                      </a>
                    </div>
                  </div>
                </div>
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }}>
                  <div className="grid grid-cols-2 gap-y-1.5">
                    {([["Event", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "Cattle"], ["Animals", String(r.numberOfAnimals ?? "—")], ["Ear Tags", r.earTagNumbers || "—"]] as [string, string][]).map(([k, v]) => (
                      <React.Fragment key={k}><span style={{ color: "#6b7280", fontWeight: 500 }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">
                    BCMS Online confirmation or document reference <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. CTS-2026-XXXXXXXX or document number"
                    value={bcmsPortalRefInput}
                    onChange={e => setBcmsPortalRefInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && bcmsPortalRefInput.trim() && bcmsPortalRefId !== null) {
                        saveBcmsPortalRefMut.mutate({ movementId: bcmsPortalRefId, bcmsManualRef: bcmsPortalRefInput });
                      }
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                  Once saved, this movement will be marked as BCMS notified. The reference will appear in the BCMS Submissions tab and on the movement detail panel.
                </p>
              </div>
            );
          })()}
          <DialogMutationError mutation={saveBcmsPortalRefMut} message="Failed to save — your reference is still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBcmsPortalRefId(null); setBcmsPortalRefInput(""); }}>Cancel</Button>
            <Button
              disabled={!bcmsPortalRefInput.trim() || saveBcmsPortalRefMut.isPending}
              onClick={() => bcmsPortalRefId !== null && saveBcmsPortalRefMut.mutate({ movementId: bcmsPortalRefId, bcmsManualRef: bcmsPortalRefInput })}
              style={{ background: "#b45309", color: "white" }}
              className="hover:opacity-90"
            >
              {saveBcmsPortalRefMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle2 size={14} className="mr-1" />}
              Save Reference
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record LIS Keeper Portal Reference (births & deaths — England) */}
      <Dialog open={lisPortalRefId !== null} onOpenChange={o => { if (!o) { setLisPortalRefId(null); setLisPortalRefInput(""); saveLisPortalRefMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Record LIS Portal Reference</DialogTitle></DialogHeader>
          {(() => {
            const r = records.find(m => m.id === lisPortalRefId);
            if (!r) return null;
            const eventLabel = r.movementType === "birth" ? "birth" : "death";
            return (
              <div className="space-y-4 py-1">
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <ExternalLink size={14} style={{ color: "#92400e", marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontSize: "0.78rem", color: "#92400e", lineHeight: 1.6 }}>
                    <strong>Action required — LIS keeper portal.</strong>
                    {" "}The LIS CLA v1.0 API does not support {eventLabel} registration. You must register this event directly on the LIS keeper portal, then save your confirmation reference here to complete the audit trail.
                    <div style={{ marginTop: 8 }}>
                      <a
                        href="https://www.livestockinformation.org.uk"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1d4ed8", fontWeight: 600, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <ExternalLink size={11} />{"  "}Open LIS Keeper Portal (www.livestockinformation.org.uk)
                      </a>
                    </div>
                  </div>
                </div>
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }}>
                  <div className="grid grid-cols-2 gap-y-1.5">
                    {([["Event", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "—"], ["Animals", String(r.numberOfAnimals ?? "—")], ["Ear Tags", r.earTagNumbers || "—"]] as [string, string][]).map(([k, v]) => (
                      <React.Fragment key={k}><span style={{ color: "#6b7280", fontWeight: 500 }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">
                    Confirmation or document reference from the LIS portal <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. CLN-2026-ABC123 or document number"
                    value={lisPortalRefInput}
                    onChange={e => setLisPortalRefInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && lisPortalRefInput.trim() && lisPortalRefId !== null) {
                        saveLisPortalRefMut.mutate({ movementId: lisPortalRefId, lisManualRef: lisPortalRefInput });
                      }
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                  Once saved, this movement will be marked as notified and the reference will appear on the movement row and in compliance reports.
                </p>
              </div>
            );
          })()}
          <DialogMutationError mutation={saveLisPortalRefMut} message="Failed to save — your reference is still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLisPortalRefId(null); setLisPortalRefInput(""); }}>Cancel</Button>
            <Button
              disabled={!lisPortalRefInput.trim() || saveLisPortalRefMut.isPending}
              onClick={() => lisPortalRefId !== null && saveLisPortalRefMut.mutate({ movementId: lisPortalRefId, lisManualRef: lisPortalRefInput })}
              style={{ background: "#b45309", color: "white" }}
              className="hover:opacity-90"
            >
              {saveLisPortalRefMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle2 size={14} className="mr-1" />}
              Save Reference
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LIS Inbound Review Dialog */}
      <Dialog open={lisReviewDialog !== null} onOpenChange={o => { if (!o) { setLisReviewDialog(null); lisReviewMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 460 }}>
          <DialogHeader><DialogTitle>Review Inbound Movement</DialogTitle></DialogHeader>
          {lisReviewDialog && (
            <div className="space-y-4 py-1">
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }}>
                <div className="grid grid-cols-2 gap-y-1.5">
                  {[
                    ["LIS Request ID", String(lisReviewDialog.requestId)],
                    ["From CPH", lisReviewDialog.fromCph ?? "—"],
                    ["To CPH", lisReviewDialog.toCph ?? "—"],
                    ["Animals", String(lisReviewDialog.animalTotal)],
                  ].map(([k, v]) => (
                    <React.Fragment key={k}><span style={{ color: "#6b7280", fontWeight: 500 }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></React.Fragment>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Arrival date</label>
                <input
                  type="date"
                  value={lisReviewArrivalDate}
                  onChange={e => setLisReviewArrivalDate(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem" }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                <strong>Accept</strong> to confirm these animals arrived at your holding. <strong>Reject</strong> if this movement did not happen at your holding.
              </p>
            </div>
          )}
          <DialogMutationError mutation={lisReviewMut} message="LIS review failed — please try again." />
          <DialogFooter style={{ gap: 8 }}>
            <Button variant="outline" onClick={() => setLisReviewDialog(null)} disabled={lisReviewMut.isPending}>Cancel</Button>
            <Button
              variant="outline"
              style={{ borderColor: "#fca5a5", color: "#dc2626" }}
              disabled={lisReviewMut.isPending || !lisReviewDialog}
              onClick={() => lisReviewDialog && lisReviewMut.mutate({ movId: lisReviewDialog.movId, isAccepted: false, arrivalDate: lisReviewArrivalDate })}
            >
              {lisReviewMut.isPending && !lisReviewAccepting ? <Loader2 size={13} className="animate-spin mr-1" /> : <X size={13} className="mr-1" />}
              Reject
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white"
              disabled={lisReviewMut.isPending || !lisReviewDialog || !lisReviewArrivalDate}
              onClick={() => { setLisReviewAccepting(true); lisReviewDialog && lisReviewMut.mutate({ movId: lisReviewDialog.movId, isAccepted: true, arrivalDate: lisReviewArrivalDate }); }}
            >
              {lisReviewMut.isPending && lisReviewAccepting ? <Loader2 size={13} className="animate-spin mr-1" /> : <CheckCircle2 size={13} className="mr-1" />}
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LIS Undo Confirm Dialog */}
      <Dialog open={lisUndoConfirmId !== null} onOpenChange={o => { if (!o) { setLisUndoConfirmId(null); lisUndoMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader><DialogTitle>Withdraw LIS Transfer Request</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <p style={{ fontSize: "0.875rem", color: "#374151" }}>
              This will send an <strong>UndoRequest</strong> to LIS to withdraw this transfer. The movement will be removed from the holding register.
            </p>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: "0.8rem", color: "#dc2626" }}>
                ⚠ This cannot be undone once confirmed. Only proceed if this movement was submitted in error.
              </p>
            </div>
          </div>
          <DialogMutationError mutation={lisUndoMut} message="Withdrawal failed — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLisUndoConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={lisUndoMut.isPending}
              onClick={() => lisUndoConfirmId !== null && lisUndoMut.mutate(lisUndoConfirmId)}
            >
              {lisUndoMut.isPending ? <Loader2 size={13} className="animate-spin mr-1" /> : <RotateCcw size={13} className="mr-1" />}
              Withdraw from LIS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeTab === "mortality" && <MortalitySection farmId={farmId} />}

      {activeTab === "bcms-submissions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>BCMS / CTWS Submission History</h3>
              <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>All cattle movement submissions sent (or simulated) via CTS Web Services from this farm.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {bcmsCredsData && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: bcmsCredsData.configured ? "#f0fdf4" : "#f9fafb", border: `1px solid ${bcmsCredsData.configured ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: bcmsCredsData.configured ? "#166534" : "#6b7280" }}>
                  {bcmsCredsData.configured ? <ShieldCheck size={13} /> : <WifiOff size={13} />}
                  {bcmsCredsData.configured ? (bcmsCredsData.sandboxMode ? "Sandbox mode" : "Live mode") : "Not configured"}
                </div>
              )}
            </div>
          </div>

          {/* ── Sector-aware livestock identifier warning ── */}
          {idBanner}

          {!bcmsConfigured && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Shield size={16} style={{ color: "#92400e", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }}>CTWS credentials not configured</p>
                <p style={{ fontSize: "0.8rem", color: "#78350f" }}>To enable one-click submissions, go to <strong>Farm Settings → BCMS / CTS One-Click Submission</strong> and enter your CTS Web Services username and password. The Submit button will appear on each cattle movement row.</p>
              </div>
            </div>
          )}

          {bcmsSubmissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
              <Send size={32} style={{ margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" }} />
              <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No submissions yet</p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Use the "Test Submit" button on any cattle movement row to run a sandbox submission test.</p>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Date & Time", "Movement", "Type", "Status", "Mode", "Reference", "Error", ""].map(h => (
                      <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bcmsSubmissions.map((s: any, i: number) => {
                    const mov = records.find(m => m.id === s.movementId);
                    const statusCfg: Record<string, { bg: string; color: string }> = {
                      submitted: { bg: "#dcfce7", color: "#166534" },
                      pending:   { bg: "#fef3c7", color: "#92400e" },
                      failed:    { bg: "#fee2e2", color: "#991b1b" },
                    };
                    const sc = statusCfg[s.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
                    return (
                      <tr key={s.id} style={{ borderBottom: i < bcmsSubmissions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }}>
                          <div>{new Date(s.createdAt).toLocaleDateString("en-GB")}</div>
                          <div style={{ fontSize: "0.7rem" }}>{new Date(s.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          {mov ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{formatDate(mov.movementDate)}</div>
                              <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{mov.species ?? ""} · {mov.numberOfAnimals ?? "?"} head</div>
                            </div>
                          ) : <span style={{ color: "#9ca3af" }}>#{s.movementId}</span>}
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem", color: "#374151", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 }}>{s.submissionType?.replace("_", " ")}</td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>{s.status}</span>
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          {s.sandboxMode
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#92400e", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}><Shield size={10} />Sandbox</span>
                            : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}><ShieldCheck size={10} />Live</span>
                          }
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }}>{s.bcmsReference || "—"}</td>
                        <td style={{ padding: "0.625rem 0.875rem", color: "#dc2626", fontSize: "0.75rem", maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.errorMessage || "—"}</div>
                        </td>
                        <td style={{ padding: "0.5rem 0.875rem" }}>
                          {s.status === "failed" && (
                            <button
                              onClick={() => submitBcmsMut.mutate(s.movementId)}
                              disabled={submitBcmsMut.isPending}
                              title="Retry this submission"
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600, cursor: submitBcmsMut.isPending ? "not-allowed" : "pointer", opacity: submitBcmsMut.isPending ? 0.6 : 1, whiteSpace: "nowrap" }}
                            >
                              <RefreshCw size={10} />Retry
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === "lis-submissions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>LIS Submission History</h3>
              <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>All sheep, goat and deer movement submissions sent (or simulated) via the Livestock Information Service CLA API from this farm.</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {lisConfigured && (
                <button
                  onClick={() => lisSyncMut.mutate()}
                  disabled={lisSyncMut.isPending}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: "#15803d", cursor: "pointer" }}
                >
                  {lisSyncMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  Sync from LIS
                </button>
              )}
              {lisCredsData && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: lisCredsData.configured ? "#eff6ff" : "#f9fafb", border: `1px solid ${lisCredsData.configured ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: lisCredsData.configured ? "#1d4ed8" : "#6b7280" }}>
                  {lisCredsData.configured ? <ShieldCheck size={13} /> : <WifiOff size={13} />}
                  {lisCredsData.configured ? (lisCredsData.sandboxMode ? "Sandbox mode" : "Live mode") : "Not configured"}
                </div>
              )}
            </div>
          </div>

          {/* ── Sector-aware livestock identifier warning ── */}
          {idBanner}

          {/* Sub-tab selector */}
          <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: "1rem" }}>
            <button onClick={() => setLisSubTab("outbound")} style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, border: "none", background: "none", cursor: "pointer", borderBottom: lisSubTab === "outbound" ? "2px solid #1d4ed8" : "2px solid transparent", color: lisSubTab === "outbound" ? "#1d4ed8" : "#6b7280", marginBottom: -2 }}>
              Outbound ({lisSubmissions.length})
            </button>
            <button onClick={() => setLisSubTab("inbound")} style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, border: "none", background: "none", cursor: "pointer", borderBottom: lisSubTab === "inbound" ? "2px solid #1d4ed8" : "2px solid transparent", color: lisSubTab === "inbound" ? "#1d4ed8" : "#6b7280", marginBottom: -2, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Inbox size={13} />
              Inbound{lisInbound.length > 0 ? ` (${lisInbound.length})` : ""}
            </button>
          </div>

          {lisSubTab === "outbound" && (<>
          {!lisConfigured && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Shield size={16} style={{ color: "#1d4ed8", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1d4ed8", marginBottom: 4 }}>LIS credentials not configured</p>
                <p style={{ fontSize: "0.8rem", color: "#1e40af" }}>To enable one-click submissions for sheep, goat and deer movements, go to <strong>Farm Settings → LIS Integration</strong> and enter your LIS username and password. The Submit button will appear on each eligible movement row.</p>
              </div>
            </div>
          )}

          {/* Stale sandbox token — platform moved to production, farm must re-authorise.
              Condition mirrors the server-side enforcement: token.sandboxMode=true && !isLisOAuthSandbox(). */}
          {lisConfigured && (lisCredsData as any)?.tokenScopeMismatch && (
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertTriangle size={16} style={{ color: "#92400e", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }}>LIS re-authorisation required</p>
                <p style={{ fontSize: "0.8rem", color: "#78350f", lineHeight: 1.5 }}>Your LIS account was connected under the sandbox environment. BDE Farm Trac now submits to the <strong>production</strong> Livestock Information Service — please go to <strong>Farm Settings → LIS Integration</strong> and click <em>Re-sign in with LIS</em> to refresh your sign-in. Submissions will remain queued until you re-connect.</p>
              </div>
            </div>
          )}

          {lisUnreported.length > 0 && (
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={15} style={{ color: "#92400e", flexShrink: 0 }} />
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e", margin: 0 }}>
                  {lisUnreported.length} movement{lisUnreported.length !== 1 ? "s" : ""} not yet reported to LIS
                </p>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#78350f", marginBottom: 10 }}>
                These sheep, goat or deer movements have no LIS submission reference and have not been marked as notified. UK law requires notification within 3 days for most movements.
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.05)" }}>
                    {["Date", "Type", "Species", "Animals", "From → To", "Days Old"].map(h => (
                      <th key={h} style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600, color: "#78350f", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lisUnreported.map((m, i) => {
                    const age = daysSince(m.movementDate);
                    return (
                      <tr key={m.id} style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
                        <td style={{ padding: "3px 8px", color: "#78350f", whiteSpace: "nowrap" }}>{formatDate(m.movementDate)}</td>
                        <td style={{ padding: "3px 8px", color: "#78350f", textTransform: "capitalize" }}>{m.movementType}</td>
                        <td style={{ padding: "3px 8px", color: "#78350f", textTransform: "capitalize" }}>{m.species}</td>
                        <td style={{ padding: "3px 8px", color: "#78350f" }}>{m.numberOfAnimals ?? "—"}</td>
                        <td style={{ padding: "3px 8px", color: "#78350f" }}>{[m.fromLocation, m.toLocation].filter(Boolean).join(" → ") || "—"}</td>
                        <td style={{ padding: "3px 8px", fontWeight: 700, color: age > 3 ? "#dc2626" : "#92400e" }}>{age}d{age > 3 ? " ⚠" : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {lisSubmissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
              <Send size={32} style={{ margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" }} />
              <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No LIS submissions yet</p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Use the "Test Submit (LIS)" button on any sheep, goat or deer movement row to run a sandbox submission test.</p>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Date & Time", "Movement", "Species", "Type", "Status", "Mode", "LIS Reference", "Error"].map(h => (
                      <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lisSubmissions.map((s: any, i: number) => {
                    const mov = records.find(m => m.id === s.movementId);
                    const statusCfg: Record<string, { bg: string; color: string }> = {
                      submitted: { bg: "#dcfce7", color: "#166534" },
                      pending:   { bg: "#fef3c7", color: "#92400e" },
                      failed:    { bg: "#fee2e2", color: "#991b1b" },
                    };
                    const sc = statusCfg[s.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
                    return (
                      <tr key={s.id} style={{ borderBottom: i < lisSubmissions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }}>
                          <div>{new Date(s.submittedAt).toLocaleDateString("en-GB")}</div>
                          <div style={{ fontSize: "0.7rem" }}>{new Date(s.submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          {mov ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{formatDate(mov.movementDate)}</div>
                              <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{mov.numberOfAnimals ?? "?"} head</div>
                            </div>
                          ) : <span style={{ color: "#9ca3af" }}>#{s.movementId}</span>}
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem", color: "#374151", fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>{s.species ?? "—"}</td>
                        <td style={{ padding: "0.625rem 0.875rem", color: "#374151", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 }}>{s.submissionType?.replace("_", " ")}</td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>{s.status}</span>
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          {s.sandboxMode
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}><Shield size={10} />Sandbox</span>
                            : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}><ShieldCheck size={10} />Live</span>
                          }
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }}>{s.lisReference || "—"}</td>
                        <td style={{ padding: "0.625rem 0.875rem", color: "#dc2626", fontSize: "0.75rem", maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.errorMessage || "—"}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          </>)}

          {lisSubTab === "inbound" && (
            <div>
              {lisInbound.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
                  <Inbox size={32} style={{ margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" }} />
                  <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No inbound movements pending review</p>
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                    {lisConfigured ? "Use \"Sync from LIS\" to fetch movements that other keepers have submitted to your holding." : "Configure LIS credentials in Farm Settings, then sync to see inbound movements from other keepers."}
                  </p>
                </div>
              ) : (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe", padding: "10px 16px" }}>
                    <p style={{ fontSize: "0.8rem", color: "#1e40af", margin: 0 }}>
                      <strong>{lisInbound.length} movement{lisInbound.length !== 1 ? "s" : ""}</strong> submitted by other keepers are waiting for your review. Accept to confirm animals arrived, or reject if the movement didn't happen.
                    </p>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {["Movement Date", "Species", "Animals", "From CPH", "To CPH", "LIS Ref", "Action"].map(h => (
                          <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lisInbound.map((m: any, i: number) => {
                        const raw = m.lisRawData as any;
                        const requestId = Number(raw?.requestId ?? raw?.id ?? raw?.reviewId ?? 0);
                        return (
                          <tr key={m.id} style={{ borderBottom: i < lisInbound.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <td style={{ padding: "0.625rem 0.875rem", color: "#374151", whiteSpace: "nowrap" }}>{formatDate(m.movementDate)}</td>
                            <td style={{ padding: "0.625rem 0.875rem", color: "#374151", textTransform: "capitalize" }}>{m.species ?? "—"}</td>
                            <td style={{ padding: "0.625rem 0.875rem", color: "#374151" }}>{m.numberOfAnimals ?? "—"}</td>
                            <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#6b7280" }}>{m.fromLocation ?? "—"}</td>
                            <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#6b7280" }}>{m.toLocation ?? "—"}</td>
                            <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }}>{m.lisMovementRef?.replace("movement_review:", "") ?? "—"}</td>
                            <td style={{ padding: "0.625rem 0.875rem" }}>
                              {requestId ? (
                                <button
                                  onClick={() => {
                                    setLisReviewArrivalDate(m.movementDate ? new Date(m.movementDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
                                    setLisReviewDialog({ movId: m.id, requestId, holding: m.toLocation ?? "", animalTotal: m.numberOfAnimals ?? 1, fromCph: m.fromLocation, toCph: m.toLocation, date: m.movementDate ?? "" });
                                  }}
                                  style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: "0.76rem", fontWeight: 600, cursor: "pointer" }}
                                >
                                  <ClipboardCheck size={12} /> Review
                                </button>
                              ) : (
                                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Sync to review</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Transfer requests with undo option */}
              {(() => {
                const undoable = records.filter(r => (r as any).lisSource === "transfer_request" && (r as any).lisMovementRef);
                if (undoable.length === 0) return null;
                return (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Synced outbound transfers (undo available)</h4>
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                        <thead>
                          <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            {["Date", "Species", "Animals", "From → To", "LIS Ref", "Action"].map(h => (
                              <th key={h} style={{ padding: "0.5rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {undoable.map((m: any, i: number) => (
                            <tr key={m.id} style={{ borderBottom: i < undoable.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "0.5rem 0.875rem", color: "#374151", whiteSpace: "nowrap" }}>{formatDate(m.movementDate)}</td>
                              <td style={{ padding: "0.5rem 0.875rem", color: "#374151", textTransform: "capitalize" }}>{m.species ?? "—"}</td>
                              <td style={{ padding: "0.5rem 0.875rem", color: "#374151" }}>{m.numberOfAnimals ?? "—"}</td>
                              <td style={{ padding: "0.5rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }}>{[m.fromLocation, m.toLocation].filter(Boolean).join(" → ") || "—"}</td>
                              <td style={{ padding: "0.5rem 0.875rem", fontFamily: "monospace", fontSize: "0.74rem", color: "#374151" }}>{(m as any).lisMovementRef?.replace("transfer_request:", "") ?? "—"}</td>
                              <td style={{ padding: "0.5rem 0.875rem" }}>
                                <button
                                  onClick={() => setLisUndoConfirmId(m.id)}
                                  style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #fca5a5", borderRadius: 7, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, color: "#dc2626", cursor: "pointer" }}
                                >
                                  <RotateCcw size={11} /> Undo
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {activeTab === "lip-submissions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>LIP Submission History</h3>
              <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>All cattle movement, birth and death notifications submitted (or logged in sandbox) via the LIS LIP API from this farm.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {lipCredsData && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: "#92400e" }}>
                  <AlertTriangle size={13} />
                  Service paused
                </div>
              )}
            </div>
          </div>

          {/* ── Sector-aware livestock identifier warning ── */}
          {idBanner}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={15} style={{ color: "#92400e", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e", marginBottom: 4 }}>LIS Cattle API — Temporarily Paused from 21 July 2026</p>
              <p style={{ fontSize: "0.8rem", color: "#78350f", lineHeight: 1.5 }}>
                The Livestock Information Service has confirmed that LIP Cattle API submissions are temporarily paused while cattle traceability services transition to a new Defra-operated service. <strong>New cattle submissions via LIP cannot be made at this time.</strong> Existing submission records below are preserved for audit purposes. Please continue reporting cattle movements via <strong>BCMS (CTS Web Services)</strong> as usual. LIS will provide further guidance in September/October 2026.
              </p>
            </div>
          </div>

          {!lipConfigured && (
            <div style={{ background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Shield size={16} style={{ color: "#6d28d9", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6d28d9", marginBottom: 4 }}>LIP account not connected</p>
                <p style={{ fontSize: "0.8rem", color: "#5b21b6" }}>LIS Cattle API submissions are temporarily paused from 21 July 2026 while LIS transitions cattle traceability services. New connections are not available at this time. Please report cattle movements via <strong>BCMS (CTS Web Services)</strong> in the meantime.</p>
              </div>
            </div>
          )}

          {lipUnreported.length > 0 && (
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={15} style={{ color: "#92400e", flexShrink: 0 }} />
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e", margin: 0 }}>
                  {lipUnreported.length} cattle movement{lipUnreported.length !== 1 ? "s" : ""} not yet reported to BCMS / LIP
                </p>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#78350f", marginBottom: 10 }}>
                These on/off-farm cattle movements have no submission reference and have not been marked as notified. BCMS requires cattle movement notification within 3 days of the move (or within 3 days of the animal arriving on your holding for births/acquisitions).
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.05)" }}>
                    {["Date", "Type", "Animals", "From → To", "Days Old"].map(h => (
                      <th key={h} style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600, color: "#78350f", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lipUnreported.map((m, i) => {
                    const age = daysSince(m.movementDate);
                    return (
                      <tr key={m.id} style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
                        <td style={{ padding: "3px 8px", color: "#78350f", whiteSpace: "nowrap" }}>{formatDate(m.movementDate)}</td>
                        <td style={{ padding: "3px 8px", color: "#78350f", textTransform: "capitalize" }}>{m.movementType}</td>
                        <td style={{ padding: "3px 8px", color: "#78350f" }}>{m.numberOfAnimals ?? "—"}</td>
                        <td style={{ padding: "3px 8px", color: "#78350f" }}>{[m.fromLocation, m.toLocation].filter(Boolean).join(" → ") || "—"}</td>
                        <td style={{ padding: "3px 8px", fontWeight: 700, color: age > 3 ? "#dc2626" : "#92400e" }}>{age}d{age > 3 ? " ⚠" : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {lipSubmissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
              <Send size={32} style={{ margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" }} />
              <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No LIP submissions yet</p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>LIS Cattle API submissions are temporarily paused. Please report cattle movements via BCMS (CTS Web Services) in the meantime. Submission history will appear here once the LIS service resumes.</p>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Date & Time", "Record", "Type", "Status", "Mode", "LIP Reference", "Error", "Actions"].map(h => (
                      <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lipSubmissions.map((s: any, i: number) => {
                    const mov = records.find(m => m.id === s.movementId);
                    const statusCfg: Record<string, { bg: string; color: string }> = {
                      submitted:    { bg: "#dcfce7", color: "#166534" },
                      acknowledged: { bg: "#dcfce7", color: "#166534" },
                      pending:         { bg: "#fef3c7", color: "#92400e" },
                      "async-pending": { bg: "#ede9fe", color: "#5b21b6" },
                      failed:          { bg: "#fee2e2", color: "#991b1b" },
                    };
                    const sc = statusCfg[s.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
                    return (
                      <tr key={s.id} style={{ borderBottom: i < lipSubmissions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }}>
                          <div>{new Date(s.createdAt).toLocaleDateString("en-GB")}</div>
                          <div style={{ fontSize: "0.7rem" }}>{new Date(s.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          {s.submissionType === "movement" && mov ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{formatDate(mov.movementDate)}</div>
                              <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{mov.numberOfAnimals ?? "?"} head · {mov.movementType?.toUpperCase()}</div>
                            </div>
                          ) : s.submissionType === "death" ? (
                            <span style={{ color: "#6b7280" }}>Mortality #{s.mortalityId}</span>
                          ) : s.submissionType === "birth" ? (
                            <span style={{ color: "#6b7280" }}>Calving #{s.calvingId}</span>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>#{s.movementId ?? s.mortalityId ?? s.calvingId}</span>
                          )}
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem", color: "#374151", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 }}>{s.submissionType}</td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>{s.status}</span>
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          {s.sandboxMode
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f5f3ff", color: "#6d28d9", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}><Shield size={10} />Sandbox</span>
                            : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}><ShieldCheck size={10} />Live</span>
                          }
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }}>{s.lipReference || "—"}</td>
                        <td style={{ padding: "0.625rem 0.875rem", color: "#dc2626", fontSize: "0.75rem", maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.errorMessage || "—"}</div>
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          {s.submissionType === "movement" && s.lipReference && s.status !== "cancelled" && (
                            <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
                              {s.status !== "confirmed" && s.confirmedAction !== "accept" && (
                                <button
                                  onClick={() => setLipActionDialog({ type: "confirm", submissionId: s.id, lipReference: s.lipReference })}
                                  style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                                >Accept</button>
                              )}
                              {s.status !== "rejected" && s.confirmedAction !== "reject" && (
                                <button
                                  onClick={() => setLipActionDialog({ type: "reject", submissionId: s.id, lipReference: s.lipReference })}
                                  style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                                >Reject</button>
                              )}
                              <button
                                onClick={() => setLipActionDialog({ type: "cancel", submissionId: s.id, lipReference: s.lipReference })}
                                style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                              >Cancel</button>
                            </div>
                          )}
                          {s.status === "async-pending" && (
                            <button
                              disabled={checkAsyncMut.isPending && checkAsyncMut.variables === s.id}
                              onClick={() => checkAsyncMut.mutate(s.id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #ddd6fe", background: "#f5f3ff", color: "#5b21b6", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                            >
                              {checkAsyncMut.isPending && checkAsyncMut.variables === s.id ? <Loader2 size={10} className="animate-spin" /> : null}
                              Check Status
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "lip-lost-found" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>Lost &amp; Found — LIP Notifications</h3>
              <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>Report lost, found or stolen cattle to the Livestock Information Platform. All reports are logged regardless of submission status.</p>
            </div>
            <Button
              onClick={() => { setShowLostFoundForm(true); setLostFoundEditId(null); setLostFoundForm({ earTag: "", status: "lost", eventDate: "", crimeReferenceNumber: "", foundDead: false, notes: "" }); }}
              style={{ background: "#6d28d9", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} /> Report Animal
            </Button>
          </div>

          {showLostFoundForm && (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ fontWeight: 600, color: "#1f2937" }}>{lostFoundEditId ? "Edit Record" : "Report Lost / Found Animal"}</h4>
                <button onClick={() => { setShowLostFoundForm(false); setLostFoundEditId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Ear Tag *</label>
                  <input
                    value={lostFoundForm.earTag}
                    onChange={e => setLostFoundForm(f => ({ ...f, earTag: e.target.value }))}
                    placeholder="e.g. UK123456 789012"
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Status *</label>
                  <select
                    value={lostFoundForm.status}
                    onChange={e => setLostFoundForm(f => ({ ...f, status: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }}
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                    <option value="stolen">Stolen</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Event Date *</label>
                  <input
                    type="date"
                    value={lostFoundForm.eventDate}
                    onChange={e => setLostFoundForm(f => ({ ...f, eventDate: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Crime Reference No. <span style={{ fontWeight: 400, color: "#9ca3af" }}>(theft only)</span></label>
                  <input
                    value={lostFoundForm.crimeReferenceNumber}
                    onChange={e => setLostFoundForm(f => ({ ...f, crimeReferenceNumber: e.target.value }))}
                    placeholder="Police crime reference"
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    id="foundDead"
                    checked={lostFoundForm.foundDead}
                    onChange={e => setLostFoundForm(f => ({ ...f, foundDead: e.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="foundDead" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Animal found dead</label>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Notes</label>
                  <textarea
                    value={lostFoundForm.notes}
                    onChange={e => setLostFoundForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Additional details..."
                    rows={2}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: "1rem", justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setShowLostFoundForm(false); setLostFoundEditId(null); }}
                  style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "7px 16px", fontSize: "0.875rem", cursor: "pointer" }}
                >Cancel</button>
                <button
                  disabled={saveLostFoundMut.isPending || !lostFoundForm.earTag || !lostFoundForm.status || !lostFoundForm.eventDate}
                  onClick={() => saveLostFoundMut.mutate({
                    id: lostFoundEditId ?? undefined,
                    body: {
                      earTag: lostFoundForm.earTag.trim(),
                      status: lostFoundForm.status,
                      eventDate: lostFoundForm.eventDate,
                      crimeReferenceNumber: lostFoundForm.crimeReferenceNumber || undefined,
                      foundDead: lostFoundForm.foundDead || undefined,
                      notes: lostFoundForm.notes || undefined,
                      submitToLip: lipConfigured && !lostFoundEditId,
                    },
                  })}
                  style={{ background: "#6d28d9", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600 }}
                >
                  {saveLostFoundMut.isPending ? "Saving…" : (lipConfigured && !lostFoundEditId ? "Save & Submit to LIP" : "Save Record")}
                </button>
              </div>
            </div>
          )}

          {lostFoundRecords.length === 0 && !showLostFoundForm ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}>
              <AlertTriangle size={32} style={{ margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" }} />
              <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No lost &amp; found reports</p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Use this section to report any cattle that are missing, found straying, or stolen. Reports are submitted to the LIP API.</p>
            </div>
          ) : lostFoundRecords.length > 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Date", "Ear Tag", "Status", "LIP Status", "Reference", "Notes", ""].map(h => (
                      <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lostFoundRecords.map((r: any, i: number) => {
                    const statusColors: Record<string, { bg: string; color: string }> = {
                      lost:    { bg: "#fef3c7", color: "#92400e" },
                      found:   { bg: "#dcfce7", color: "#166534" },
                      stolen:  { bg: "#fee2e2", color: "#991b1b" },
                    };
                    const lipStatusColors: Record<string, { bg: string; color: string }> = {
                      submitted: { bg: "#dcfce7", color: "#166534" },
                      pending:   { bg: "#f3f4f6", color: "#6b7280" },
                      failed:    { bg: "#fee2e2", color: "#991b1b" },
                    };
                    const sc = statusColors[r.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
                    const lc = lipStatusColors[r.lipStatus] ?? { bg: "#f3f4f6", color: "#6b7280" };
                    const isViewMode = lostFoundViewId === r.id;
                    return (
                      <React.Fragment key={r.id}>
                        <tr style={{ borderBottom: "1px solid #f3f4f6", background: isViewMode ? "#faf5ff" : undefined }}>
                          <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280", fontSize: "0.8rem" }}>
                            {r.eventDate ? new Date(r.eventDate).toLocaleDateString("en-GB") : "—"}
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, fontFamily: "monospace", fontSize: "0.8rem" }}>{r.earTag}</td>
                          <td style={{ padding: "0.625rem 0.875rem" }}>
                            <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }}>{r.status}</span>
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem" }}>
                            <span style={{ background: lc.bg, color: lc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }}>{r.lipStatus}</span>
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }}>{r.lipReference || "—"}</td>
                          <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem", maxWidth: 200 }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notes || "—"}</div>
                          </td>
                          <td style={{ padding: "0.625rem 0.875rem" }}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button
                                onClick={() => setLostFoundViewId(isViewMode ? null : r.id)}
                                title={isViewMode ? "Close" : "View"}
                                style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #e5e7eb", background: isViewMode ? "#f3f4f6" : "#f9fafb", color: "#374151", cursor: "pointer" }}
                              ><Eye size={11} /></button>
                              <button
                                onClick={() => {
                                  setLostFoundEditId(r.id);
                                  setLostFoundForm({ earTag: r.earTag, status: r.status, eventDate: r.eventDate ?? "", crimeReferenceNumber: r.crimeReferenceNumber ?? "", foundDead: r.foundDead ?? false, notes: r.notes ?? "" });
                                  setShowLostFoundForm(true);
                                }}
                                title="Edit"
                                style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", cursor: "pointer" }}
                              ><Pencil size={11} /></button>
                            </div>
                          </td>
                        </tr>
                        {isViewMode && (
                          <tr>
                            <td colSpan={7} style={{ padding: "0.875rem 1.25rem", background: "#faf5ff", borderBottom: "1px solid #e5e7eb" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem 1.5rem", fontSize: "0.82rem" }}>
                                {[
                                  ["Ear Tag", r.earTag],
                                  ["Status", r.status],
                                  ["Event Date", r.eventDate ? new Date(r.eventDate).toLocaleDateString("en-GB") : "—"],
                                  ["Crime Ref.", r.crimeReferenceNumber || "—"],
                                  ["Found Dead", r.foundDead ? "Yes" : "No"],
                                  ["LIP Reference", r.lipReference || "—"],
                                  ["LIP Status", r.lipStatus],
                                  ["Sandbox", r.sandboxMode ? "Yes" : "No"],
                                  ["Reported", new Date(r.createdAt).toLocaleDateString("en-GB")],
                                ].map(([k, v]) => (
                                  <div key={k}><span style={{ color: "#6b7280", fontWeight: 500 }}>{k}: </span><span style={{ fontWeight: 600, color: "#1f2937" }}>{v}</span></div>
                                ))}
                                {r.notes && <div style={{ gridColumn: "span 3" }}><span style={{ color: "#6b7280", fontWeight: 500 }}>Notes: </span><span style={{ color: "#1f2937" }}>{r.notes}</span></div>}
                                {r.errorMessage && <div style={{ gridColumn: "span 3" }}><span style={{ color: "#dc2626", fontWeight: 500 }}>Error: </span><span style={{ color: "#dc2626" }}>{r.errorMessage}</span></div>}
                                {lipConfigured && r.lipStatus === "failed" && (
                                  <div style={{ gridColumn: "span 3", marginTop: 4 }}>
                                    <button
                                      disabled={saveLostFoundMut.isPending}
                                      onClick={() => saveLostFoundMut.mutate({ body: { earTag: r.earTag, status: r.status, eventDate: r.eventDate, crimeReferenceNumber: r.crimeReferenceNumber, foundDead: r.foundDead, notes: r.notes, submitToLip: true } })}
                                      style={{ background: "#6d28d9", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                                    >Re-submit to LIP</button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* LIP Submit Confirmation Dialog */}
      <Dialog open={lipSubmitConfirmId !== null} onOpenChange={o => { if (!o) { setLipSubmitConfirmId(null); submitLipMut.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit to LIS LIP</DialogTitle>
            <DialogDescription>
              {(() => {
                const r = records.find(m => m.id === lipSubmitConfirmId);
                if (!r) return "Submit this cattle movement notification to the LIS Livestock Information Platform.";
                return `Submit the ${r.movementType?.toUpperCase()} movement of ${r.numberOfAnimals ?? "?"} cattle on ${formatDate(r.movementDate)} to LIS LIP for regulatory notification.`;
              })()}
              {lipCredsData?.sandboxMode !== false && (
                <span className="block mt-2 text-amber-700 text-xs font-medium">Running in sandbox mode — payload will be logged but not sent to LIP until subscription is approved.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogMutationError mutation={submitLipMut} message="LIP submission failed — nothing was sent." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLipSubmitConfirmId(null)}>Cancel</Button>
            <Button
              disabled={submitLipMut.isPending}
              onClick={() => lipSubmitConfirmId !== null && submitLipMut.mutate(lipSubmitConfirmId)}
              style={{ background: "#6d28d9", color: "#fff" }}
            >
              {submitLipMut.isPending ? <><Loader2 size={14} className="animate-spin mr-1" />Submitting…</> : "Submit to LIP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LIP Accept / Reject Dialog */}
      <Dialog open={lipActionDialog?.type === "confirm" || lipActionDialog?.type === "reject"} onOpenChange={o => { if (!o) { setLipActionDialog(null); setLipActionReason(""); setLipRejectionReasonId(""); confirmLipMut.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lipActionDialog?.type === "confirm" ? "Accept Movement" : "Reject Movement"}</DialogTitle>
            <DialogDescription>
              {lipActionDialog?.type === "confirm"
                ? `Accept movement ${lipActionDialog.lipReference} as confirmed at the receiving holding.`
                : `Reject movement ${lipActionDialog?.lipReference}. Select a reason from the list.`}
            </DialogDescription>
          </DialogHeader>
          {lipActionDialog?.type === "reject" && (
            <div style={{ padding: "0 0 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              {lipRejectionReasons.length > 0 ? (
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Rejection Reason</label>
                  <select
                    value={lipRejectionReasonId}
                    onChange={e => setLipRejectionReasonId(e.target.value)}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: "0.875rem", background: "#fff" }}
                  >
                    <option value="">— Select a reason —</option>
                    {lipRejectionReasons.map(r => (
                      <option key={r.rejectionReasonId} value={r.rejectionReasonId}>{r.rejectionReason}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Rejection Reason</label>
                  <textarea
                    value={lipActionReason}
                    onChange={e => setLipActionReason(e.target.value)}
                    placeholder="Describe why this movement is being rejected"
                    rows={3}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: "0.875rem" }}
                  />
                </div>
              )}
              {lipRejectionReasonId && (
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Additional Notes (optional)</label>
                  <textarea
                    value={lipActionReason}
                    onChange={e => setLipActionReason(e.target.value)}
                    placeholder="Any additional notes"
                    rows={2}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: "0.875rem" }}
                  />
                </div>
              )}
            </div>
          )}
          <DialogMutationError mutation={confirmLipMut} message="Action failed — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLipActionDialog(null); setLipActionReason(""); setLipRejectionReasonId(""); }}>Cancel</Button>
            <Button
              disabled={confirmLipMut.isPending}
              onClick={() => {
                if (!lipActionDialog) return;
                confirmLipMut.mutate({
                  submissionId: lipActionDialog.submissionId,
                  lipReference: lipActionDialog.lipReference,
                  action: lipActionDialog.type === "confirm" ? "accept" : "reject",
                  rejectionReason: lipActionReason || undefined,
                  rejectionReasonId: lipRejectionReasonId || undefined,
                });
              }}
              style={{ background: lipActionDialog?.type === "confirm" ? "#166534" : "#991b1b", color: "#fff" }}
            >
              {confirmLipMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {lipActionDialog?.type === "confirm" ? "Confirm Accept" : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LIP Cancel Movement Dialog */}
      <Dialog open={lipActionDialog?.type === "cancel"} onOpenChange={o => { if (!o) { setLipActionDialog(null); cancelLipMut.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Movement Notification</DialogTitle>
            <DialogDescription>
              This will send a cancellation request to LIP for movement reference <strong>{lipActionDialog?.lipReference}</strong>. The original submission will be marked as cancelled. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogMutationError mutation={cancelLipMut} message="Cancellation failed — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLipActionDialog(null)}>Go Back</Button>
            <Button
              disabled={cancelLipMut.isPending}
              onClick={() => {
                if (!lipActionDialog) return;
                cancelLipMut.mutate({ submissionId: lipActionDialog.submissionId, lipReference: lipActionDialog.lipReference });
              }}
              variant="destructive"
            >
              {cancelLipMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Cancel Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ═══ EIDCymru Submissions Tab ═══════════════════════════════════════ */}
      {activeTab === "eidcymru-submissions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>EIDCymru — Wales Sheep &amp; Goat Submissions</h3>
              <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                Sheep and goat movement notifications submitted to EIDCymru on behalf of this Wales holding.
                {eidcymruCredsData?.sandboxMode !== false && (
                  <span style={{ marginLeft: 8, color: "#b45309", fontWeight: 600 }}>⚠ Staging service — real test requests go to stagews.eidcymru.org</span>
                )}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetchEidcymruSubmissions()}>Refresh</Button>
          </div>

          {!eidcymruConfigured && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }}>
              <strong>EIDCymru not configured.</strong> Go to Farm Settings and enter the keeper credentials plus the EIDCymru-registered application name and version.
            </div>
          )}

          {eidcymruSubmissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#9ca3af" }}>
              <Send className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p style={{ fontWeight: 600, marginBottom: 4 }}>No EIDCymru submissions yet</p>
              <p style={{ fontSize: "0.82rem" }}>Use the EIDCymru button on an eligible sheep or goat on/off movement to submit it.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Date</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Type</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Status</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Reference</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Mode</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {eidcymruSubmissions.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "8px 12px", color: "#374151" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-GB") : new Date(s.createdAt).toLocaleDateString("en-GB")}</td>
                      <td style={{ padding: "8px 12px", color: "#374151", textTransform: "capitalize" }}>{s.submissionType}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600,
                          background: s.status === "submitted" ? "#d1fae5" : s.status === "failed" ? "#fee2e2" : "#fef3c7",
                          color: s.status === "submitted" ? "#065f46" : s.status === "failed" ? "#991b1b" : "#92400e",
                        }}>{s.status}</span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#374151", fontFamily: "monospace", fontSize: "0.78rem" }}>{s.eidcymruReference ?? "—"}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: "0.72rem", padding: "1px 6px", borderRadius: 999, background: s.sandboxMode ? "#fef3c7" : "#d1fae5", color: s.sandboxMode ? "#92400e" : "#065f46" }}>
                          {s.sandboxMode ? "Sandbox" : "Live"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.78rem", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.errorMessage ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ScotEID Submissions Tab ═════════════════════════════════════════ */}
      {activeTab === "scoteid-submissions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>ScotEID — Scotland Livestock Submissions</h3>
              <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                All-species movement notifications submitted to ScotEID on behalf of this Scotland holding.
                {scoteidCredsData?.sandboxMode !== false && (
                  <span style={{ marginLeft: 8, color: "#b45309", fontWeight: 600 }}>⚠ Sandbox mode — submissions are simulated (SCOTEID_API_KEY not configured)</span>
                )}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetchScoteidSubmissions()}>Refresh</Button>
          </div>

          {!scoteidConfigured && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }}>
              <strong>ScotEID not configured.</strong> Go to Farm Settings → Integrations to enter your ScotEID holding number. In sandbox mode all submissions are simulated automatically.
            </div>
          )}

          {scoteidSubmissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#9ca3af" }}>
              <Send className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p style={{ fontWeight: 600, marginBottom: 4 }}>No ScotEID submissions yet</p>
              <p style={{ fontSize: "0.82rem" }}>Use the "Test (ScotEID)" button on a movement to submit it.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Date</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Type</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Status</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Reference</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Mode</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {scoteidSubmissions.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "8px 12px", color: "#374151" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-GB") : new Date(s.createdAt).toLocaleDateString("en-GB")}</td>
                      <td style={{ padding: "8px 12px", color: "#374151", textTransform: "capitalize" }}>{s.submissionType}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600,
                          background: s.status === "submitted" ? "#d1fae5" : s.status === "failed" ? "#fee2e2" : "#fef3c7",
                          color: s.status === "submitted" ? "#065f46" : s.status === "failed" ? "#991b1b" : "#92400e",
                        }}>{s.status}</span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#374151", fontFamily: "monospace", fontSize: "0.78rem" }}>{s.scoteidReference ?? "—"}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: "0.72rem", padding: "1px 6px", borderRadius: 999, background: s.sandboxMode ? "#fef3c7" : "#d1fae5", color: s.sandboxMode ? "#92400e" : "#065f46" }}>
                          {s.sandboxMode ? "Sandbox" : "Live"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.78rem", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.errorMessage ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EIDCymru submit confirm dialog */}
      <Dialog open={eidcymruSubmitConfirmId !== null} onOpenChange={o => { if (!o) { setEidcymruSubmitConfirmId(null); submitEidcymruMut.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit to EIDCymru</DialogTitle>
            <DialogDescription>
              {eidcymruCredsData?.sandboxMode !== false
                ? "This sends a real test SOAP request to EIDCymru’s staging service. It will not use the production EIDCymru endpoint."
                : "This will submit the movement notification to the live EIDCymru service on behalf of this holding."}
            </DialogDescription>
          </DialogHeader>
          <DialogMutationError mutation={submitEidcymruMut} message="EIDCymru submission failed — nothing was sent." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEidcymruSubmitConfirmId(null)}>Cancel</Button>
            <Button
              disabled={submitEidcymruMut.isPending}
              onClick={() => { if (eidcymruSubmitConfirmId) submitEidcymruMut.mutate(eidcymruSubmitConfirmId); }}
              style={{ background: "#166534", color: "#fff" }}
            >
              {submitEidcymruMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {eidcymruCredsData?.sandboxMode !== false ? "Submit to EIDCymru staging" : "Submit to EIDCymru"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ScotEID submit confirm dialog */}
      <Dialog open={scoteidSubmitConfirmId !== null} onOpenChange={o => { if (!o) { setScoteidSubmitConfirmId(null); submitScoteidMut.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit to ScotEID</DialogTitle>
            <DialogDescription>
              {scoteidCredsData?.sandboxMode !== false
                ? "ScotEID is in sandbox mode. This will log a simulated submission without contacting the live ScotEID service."
                : "This will submit the movement notification to the live ScotEID service on behalf of this holding."}
            </DialogDescription>
          </DialogHeader>
          <DialogMutationError mutation={submitScoteidMut} message="ScotEID submission failed — nothing was sent." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScoteidSubmitConfirmId(null)}>Cancel</Button>
            <Button
              disabled={submitScoteidMut.isPending}
              onClick={() => { if (scoteidSubmitConfirmId) submitScoteidMut.mutate(scoteidSubmitConfirmId); }}
              style={{ background: "#c2410c", color: "#fff" }}
            >
              {submitScoteidMut.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {scoteidCredsData?.sandboxMode !== false ? "Test Submit (Sandbox)" : "Submit to ScotEID"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
