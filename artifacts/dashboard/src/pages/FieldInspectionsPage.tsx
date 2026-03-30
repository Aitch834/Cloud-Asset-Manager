import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, Search, CheckCircle2, AlertTriangle, AlertCircle, Eye, Filter, Camera, File, Trash2, Loader2 } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";

type ActionRequired = "none" | "monitor" | "treat" | "urgent";

interface Photo { id: number; objectPath: string; fileName: string | null; }

interface FieldInspection {
  id: number;
  farmId: number;
  fieldName: string;
  inspectionDate: string;
  cropType: string | null;
  growthStage: string | null;
  pestDiseaseObservations: string | null;
  actionRequired: ActionRequired;
  recommendedAction: string | null;
  inspector: string | null;
  notes: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  photos: Photo[];
}

function InspectionPhotoPanel({ recordId, farmId, photos }: { recordId: number; farmId: number; photos: Photo[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const deleteMut = useMutation({
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/field-inspections/${recordId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-inspections", farmId] }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/field-inspections/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() }),
      });
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Photo uploaded" });
    },
  });

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Evidence Photos</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {photos.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1">
            <File size={11} className="text-blue-500" />
            <a href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
              {p.fileName ?? "photo"}
            </a>
            <button onClick={() => deleteMut.mutate(p.id)} className="text-red-400 hover:text-red-600 ml-1" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-50">
        {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
        {isUploading ? `Uploading… ${progress}%` : "Add Photo"}
        <input type="file" accept="image/*,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      </label>
    </div>
  );
}

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const ACTION_LABELS: Record<ActionRequired, string> = {
  none: "No Action",
  monitor: "Monitor",
  treat: "Treat",
  urgent: "Urgent",
};

function ActionBadge({ action, resolved }: { action: ActionRequired; resolved: boolean }) {
  if (resolved) return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
  if (action === "urgent") return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
  if (action === "treat") return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Treat</Badge>;
  if (action === "monitor") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Monitor</Badge>;
  return <Badge variant="outline">No Action</Badge>;
}

export default function FieldInspectionsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [allYears, setAllYears] = useState(false);

  const [detailRecord, setDetailRecord] = useState<FieldInspection | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolvedBy, setResolvedBy] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["field-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-inspections`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records: FieldInspection[] = data?.records ?? [];

  const openActions = records.filter((r) => !r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent")).length;
  const monitored = records.filter((r) => !r.isResolved && r.actionRequired === "monitor").length;
  const resolvedThisMonth = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return records.filter((r) => r.isResolved && r.resolvedAt && new Date(r.resolvedAt) >= start).length;
  })();

  const filtered = records.filter((r) => {
    if (!allYears && !isInCropYear(r.inspectionDate, cropYear)) return false;
    const matchSearch = !search || r.fieldName.toLowerCase().includes(search.toLowerCase()) || r.inspector?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || r.actionRequired === filterAction;
    const matchStatus = filterStatus === "all"
      ? true
      : filterStatus === "open"
        ? !r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent")
        : filterStatus === "resolved"
          ? r.isResolved
          : filterStatus === "monitor"
            ? r.actionRequired === "monitor" && !r.isResolved
            : true;
    return matchSearch && matchAction && matchStatus;
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/field-inspections/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolvedBy, resolutionNotes }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Inspection resolved", description: "The action has been marked as resolved." });
      setResolveOpen(false);
      setDetailRecord(null);
      setResolvedBy("");
      setResolutionNotes("");
    },
    onError: () => toast({ title: "Error", description: "Failed to resolve the inspection.", variant: "destructive" }),
  });

  function openResolve(r: FieldInspection) {
    setDetailRecord(r);
    setResolveOpen(true);
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Field Inspections</h1>
            <p className="text-sm text-gray-500">Track crop inspection findings and resolve field actions</p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Total Inspections</p>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
          <button
            onClick={() => { setFilterStatus("open"); setAllYears(true); setFilterAction("all"); setSearch(""); }}
            className="bg-white rounded-lg border p-4 text-left transition-all"
            style={{
              borderColor: allYears && filterStatus === "open" ? "#dc2626" : "#fecaca",
              background: allYears && filterStatus === "open" ? "#fff1f1" : "#fff",
              cursor: "pointer",
              boxShadow: allYears && filterStatus === "open" ? "0 0 0 2px #fca5a5" : "none",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Open Actions</p>
              </div>
              <span style={{ fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }}>click to view all</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{openActions}</p>
            <p className="text-xs text-gray-500 mt-0.5">Treat or urgent — unresolved · all years</p>
          </button>
          <button
            onClick={() => { setFilterStatus("monitor"); setAllYears(true); setFilterAction("all"); setSearch(""); }}
            className="bg-white rounded-lg border p-4 text-left transition-all"
            style={{
              borderColor: allYears && filterStatus === "monitor" ? "#d97706" : "#fde68a",
              background: allYears && filterStatus === "monitor" ? "#fffbeb" : "#fff",
              cursor: "pointer",
              boxShadow: allYears && filterStatus === "monitor" ? "0 0 0 2px #fcd34d" : "none",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-yellow-600" />
                <p className="text-xs text-yellow-600 uppercase tracking-wide font-medium">Monitoring</p>
              </div>
              <span style={{ fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }}>click to view all</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{monitored}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active monitoring flags · all years</p>
          </button>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Resolved This Month</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{resolvedThisMonth}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {allYears && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8,
              background: filterStatus === "open" ? "#fff1f1" : "#fffbeb",
              border: `1px solid ${filterStatus === "open" ? "#fca5a5" : "#fcd34d"}`,
              fontSize: "0.8125rem", color: filterStatus === "open" ? "#991b1b" : "#92400e",
              fontWeight: 500, marginBottom: 8,
            }}>
              <span>
                {filterStatus === "open" ? "🔴" : "🟡"}{" "}
                Showing all years — {filterStatus === "open" ? "Open Actions" : "Monitoring"} ({filtered.length} records)
              </span>
              <button
                onClick={() => { setAllYears(false); setFilterStatus("all"); }}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "inherit", padding: "0 2px", lineHeight: 1 }}
                title="Clear — return to crop year view"
              >
                ✕ Clear
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by field or inspector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setAllYears(false); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open actions</SelectItem>
                <SelectItem value="monitor">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <CropYearSelector value={cropYear} onChange={(y) => { setCropYear(y); setAllYears(false); }} />
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="treat">Treat</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="none">No action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading inspections…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <ClipboardCheck className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">No inspections found</p>
              <p className="text-gray-400 text-xs">Field inspections logged from the mobile app will appear here</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Field</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Crop</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Observations</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Inspector</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.fieldName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.inspectionDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.cropType || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <span className="line-clamp-2">{r.pestDiseaseObservations || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={r.actionRequired} resolved={r.isResolved} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.inspector || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setDetailRecord(r); setResolveOpen(false); }}>
                          View
                        </Button>
                        {!r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent" || r.actionRequired === "monitor") && (
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" onClick={() => openResolve(r)}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail / View dialog */}
      {detailRecord && !resolveOpen && (
        <Dialog open onOpenChange={() => setDetailRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-green-600" />
                Field Inspection — {detailRecord.fieldName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Date</p>
                  <p>{fmt(detailRecord.inspectionDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Inspector</p>
                  <p>{detailRecord.inspector || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Crop Type</p>
                  <p>{detailRecord.cropType || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Growth Stage</p>
                  <p>{detailRecord.growthStage || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Observations</p>
                <p className="text-gray-700 whitespace-pre-line">{detailRecord.pestDiseaseObservations || "None recorded"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Recommended Action</p>
                <p className="text-gray-700">{detailRecord.recommendedAction || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Action Required</p>
                <ActionBadge action={detailRecord.actionRequired} resolved={detailRecord.isResolved} />
              </div>
              {detailRecord.notes && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Notes</p>
                  <p className="text-gray-700 whitespace-pre-line">{detailRecord.notes}</p>
                </div>
              )}
              {detailRecord.isResolved && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Resolution</p>
                  <p className="text-gray-700">{detailRecord.resolutionNotes || "—"}</p>
                  <p className="text-xs text-gray-500">Resolved by {detailRecord.resolvedBy || "—"} on {fmt(detailRecord.resolvedAt)}</p>
                </div>
              )}
            </div>
            {farmId && <InspectionPhotoPanel recordId={detailRecord.id} farmId={farmId} photos={detailRecord.photos ?? []} />}
            <DialogFooter>
              {!detailRecord.isResolved && (detailRecord.actionRequired === "treat" || detailRecord.actionRequired === "urgent" || detailRecord.actionRequired === "monitor") && (
                <Button variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" onClick={() => { setResolveOpen(true); }}>
                  Mark as Resolved
                </Button>
              )}
              <Button variant="ghost" onClick={() => setDetailRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Resolve dialog */}
      {detailRecord && resolveOpen && (
        <Dialog open onOpenChange={() => { setResolveOpen(false); setDetailRecord(null); }}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Resolve Action — {detailRecord.fieldName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                <p className="font-medium mb-0.5">Action: {ACTION_LABELS[detailRecord.actionRequired]}</p>
                {detailRecord.pestDiseaseObservations && <p className="text-xs mt-1">{detailRecord.pestDiseaseObservations}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resolvedBy">Resolved by</Label>
                <Input
                  id="resolvedBy"
                  placeholder="Your name"
                  value={resolvedBy}
                  onChange={(e) => setResolvedBy(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resolutionNotes">Resolution notes</Label>
                <Textarea
                  id="resolutionNotes"
                  placeholder="Describe what action was taken to resolve this issue…"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => { setResolveOpen(false); setDetailRecord(null); }}>Cancel</Button>
              <Button
                className="bg-green-700 hover:bg-green-800 text-white"
                disabled={!resolvedBy || resolveMutation.isPending}
                onClick={() => resolveMutation.mutate(detailRecord.id)}
              >
                {resolveMutation.isPending ? "Saving…" : "Mark Resolved"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
