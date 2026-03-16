import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import {
  Plus, Search, RefreshCw, Loader2, Pencil, Trash2, X, Printer,
  ArrowRight, Paperclip, CheckCircle2, AlertTriangle, Upload, File,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useUpload } from "@workspace/object-storage-web";

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
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const EMPTY_FORM = {
  movementType: "",
  movementDate: "",
  fromLocation: "",
  toLocation: "",
  numberOfAnimals: "",
  licenceNumber: "",
  bcmsSubmissionRef: "",
  legalNotificationSubmitted: false,
  legalNotificationDate: "",
  transporterDetails: "",
  reason: "",
  notes: "",
};

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

  const filtered = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.movementType?.toLowerCase().includes(s) ||
      r.fromLocation?.toLowerCase().includes(s) ||
      r.toLocation?.toLowerCase().includes(s) ||
      r.licenceNumber?.toLowerCase().includes(s) ||
      r.bcmsSubmissionRef?.toLowerCase().includes(s) ||
      r.transporterDetails?.toLowerCase().includes(s)
    );
  });

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

      {/* Overdue compliance alert */}
      {overdueMovements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-900 flex gap-3 items-start">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <strong>BCMS/APHA notification overdue</strong> — {overdueMovements.length} movement{overdueMovements.length > 1 ? "s are" : " is"} more than 3 days old without a legal notification recorded. These must be reported to BCMS/APHA immediately. Update each record once reported.
          </div>
        </div>
      )}

      {/* Regulatory reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 flex gap-3 items-start">
        <span className="text-amber-500 mt-0.5 shrink-0">ℹ</span>
        <span>
          <strong>Regulatory reminder:</strong> All on/off livestock movements must be reported to BCMS/APHA via eAML2 or AML forms
          within 3 days (cattle) or as required for sheep/pigs. Record the submission reference here and attach a copy of the form.
          Printed records are for on-farm Red Tractor compliance records only.
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
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">AML Licence / Reference No.</label>
                  <Input placeholder="e.g. AML12345678" value={formData.licenceNumber} onChange={(e) => setField("licenceNumber", e.target.value)} />
                </div>
              </div>

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
                        <td colSpan={7} className="py-2">
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
    </AppLayout>
  );
}
