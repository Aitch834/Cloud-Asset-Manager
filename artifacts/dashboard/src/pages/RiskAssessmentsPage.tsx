import React, { useState } from "react";
import { FarmLocationSelect } from "@/components/ui/FarmLocationSelect";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ShieldAlert, Plus, Search, Pencil, Trash2, AlertTriangle, Clock, CheckCircle2, ShieldCheck } from "lucide-react";

type RiskLevel = "low" | "medium" | "high" | "critical";
type Status = "active" | "under-review" | "archived";

interface RiskAssessment {
  id: number;
  farmId: number;
  title: string;
  area: string | null;
  hazardDescription: string;
  riskLevel: RiskLevel | null;
  controlMeasures: string | null;
  assessedBy: string | null;
  assessmentDate: string;
  reviewDate: string | null;
  status: Status;
  notes: string | null;
  createdAt: string;
}

const RISK_COLORS: Record<string, string> = {
  low: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  "under-review": "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const isOverdue = (reviewDate: string | null) => {
  if (!reviewDate) return false;
  return new Date(reviewDate) < new Date();
};

const EMPTY: Partial<RiskAssessment> = {
  title: "", area: "", hazardDescription: "", riskLevel: "medium",
  controlMeasures: "", assessedBy: "", assessmentDate: new Date().toISOString().slice(0, 10),
  reviewDate: "", status: "active", notes: "",
};

export default function RiskAssessmentsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<RiskAssessment | null>(null);
  const [editing, setEditing] = useState<RiskAssessment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<RiskAssessment>>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["risk-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/risk-assessments`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records: RiskAssessment[] = data?.records ?? [];

  const totalActive = records.filter(r => r.status === "active").length;
  const highCritical = records.filter(r => r.status === "active" && (r.riskLevel === "high" || r.riskLevel === "critical")).length;
  const overdueReviews = records.filter(r => r.status === "active" && isOverdue(r.reviewDate)).length;
  const reviewDueSoon = records.filter(r => {
    if (!r.reviewDate || r.status !== "active") return false;
    const d = new Date(r.reviewDate);
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return d >= now && d <= soon;
  }).length;

  const filtered = records.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.area?.toLowerCase().includes(search.toLowerCase()) || r.assessedBy?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === "all" || r.riskLevel === filterRisk;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchRisk && matchStatus;
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<RiskAssessment>) => {
      const url = editing
        ? `/api/farms/${farmId}/risk-assessments/${editing.id}`
        : `/api/farms/${farmId}/risk-assessments`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          assessmentDate: data.assessmentDate ? new Date(data.assessmentDate).toISOString() : new Date().toISOString(),
          reviewDate: data.reviewDate ? new Date(data.reviewDate).toISOString() : null,
        }),
      }).then(r => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] });
      toast({ title: editing ? "Assessment updated" : "Assessment added" });
      closeDialog();
    },
    onError: () => toast({ title: "Error saving assessment", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/risk-assessments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] }); setDeleteId(null); toast({ title: "Assessment deleted" }); },
  });

  function openAdd() { setEditing(null); setForm({ ...EMPTY, assessmentDate: new Date().toISOString().slice(0, 10) }); setDialogOpen(true); }
  function openEdit(r: RiskAssessment) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate?.slice(0, 10), reviewDate: r.reviewDate?.slice(0, 10) ?? "" });
    setViewRecord(null);
    setDialogOpen(true);
  }
  function closeDialog() { setDialogOpen(false); setEditing(null); setForm(EMPTY); }
  const set = (k: keyof RiskAssessment, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Risk Assessments</h1>
              <p className="text-sm text-gray-500">Health, safety & hazard risk records for Red Tractor compliance</p>
            </div>
          </div>
          <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Assessment
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Active Assessments</p>
            <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <p className="text-xs text-red-600 uppercase tracking-wide font-medium">High / Critical</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{highCritical}</p>
            <p className="text-xs text-gray-500 mt-0.5">Require priority controls</p>
          </div>
          <div className="bg-white rounded-lg border border-orange-200 p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Overdue Reviews</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">{overdueReviews}</p>
            <p className="text-xs text-gray-500 mt-0.5">Review date passed</p>
          </div>
          <div className="bg-white rounded-lg border border-yellow-200 p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
              <p className="text-xs text-yellow-600 uppercase tracking-wide font-medium">Due in 30 Days</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{reviewDueSoon}</p>
            <p className="text-xs text-gray-500 mt-0.5">Upcoming reviews</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by title, area or assessor…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Risk level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading assessments…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <ShieldAlert className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">No risk assessments found</p>
              <p className="text-gray-400 text-xs">Add your first risk assessment to maintain Red Tractor compliance</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title / Area</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Risk Level</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assessed By</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assessment Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Review Due</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.title}</p>
                      {r.area && <p className="text-xs text-gray-500">{r.area}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {r.riskLevel ? (
                        <Badge className={`capitalize ${RISK_COLORS[r.riskLevel] ?? ""}`}>{r.riskLevel}</Badge>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.assessedBy || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.assessmentDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.reviewDate ? (
                        <span className={isOverdue(r.reviewDate) ? "text-red-600 font-medium" : "text-gray-600"}>
                          {isOverdue(r.reviewDate) && "⚠ "}{fmt(r.reviewDate)}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`capitalize ${STATUS_COLORS[r.status] ?? ""}`}>{r.status.replace("-", " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewRecord(r)}>View</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              {editing ? "Edit Risk Assessment" : "New Risk Assessment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="space-y-1.5 col-span-2">
                <Label>Title *</Label>
                <Input value={form.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="e.g. Chemical storage area risk assessment" />
              </div>
              <div className="space-y-1.5">
                <Label>Area / Location</Label>
                <FarmLocationSelect farmId={farmId} value={form.area ?? ""} onChange={v => set("area", v)} placeholder="Select or type area…" />
              </div>
              <div className="space-y-1.5">
                <Label>Risk Level</Label>
                <Select value={form.riskLevel ?? "medium"} onValueChange={v => set("riskLevel", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Hazard Description *</Label>
                <Textarea value={form.hazardDescription ?? ""} onChange={e => set("hazardDescription", e.target.value)} rows={3} placeholder="Describe the hazard and who might be harmed…" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Control Measures</Label>
                <Textarea value={form.controlMeasures ?? ""} onChange={e => set("controlMeasures", e.target.value)} rows={3} placeholder="PPE, training requirements, engineering controls, safe working procedures…" />
              </div>
              <div className="space-y-1.5">
                <Label>Assessed By</Label>
                <Input value={form.assessedBy ?? ""} onChange={e => set("assessedBy", e.target.value)} placeholder="Name of assessor" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status ?? "active"} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assessment Date *</Label>
                <Input type="date" value={form.assessmentDate ?? ""} onChange={e => set("assessmentDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Review Due Date</Label>
                <Input type="date" value={form.reviewDate ?? ""} onChange={e => set("reviewDate", e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Any additional context or follow-up actions…" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button
              className="bg-brand-forest hover:bg-brand-forest/90 text-white"
              disabled={!form.title || !form.hazardDescription || !form.assessmentDate || saveMutation.isPending}
              onClick={() => saveMutation.mutate(form)}
            >
              {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      {viewRecord && !dialogOpen && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                {viewRecord.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                {viewRecord.riskLevel && <Badge className={`capitalize ${RISK_COLORS[viewRecord.riskLevel]}`}>{viewRecord.riskLevel} Risk</Badge>}
                <Badge className={`capitalize ${STATUS_COLORS[viewRecord.status]}`}>{viewRecord.status.replace("-", " ")}</Badge>
                {isOverdue(viewRecord.reviewDate) && <Badge className="bg-red-50 text-red-700 border-red-200">Review Overdue</Badge>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Area</p><p>{viewRecord.area || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Assessed By</p><p>{viewRecord.assessedBy || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Assessment Date</p><p>{fmt(viewRecord.assessmentDate)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Review Due</p><p className={isOverdue(viewRecord.reviewDate) ? "text-red-600 font-medium" : ""}>{fmt(viewRecord.reviewDate)}</p></div>
              </div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Hazard Description</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.hazardDescription}</p></div>
              {viewRecord.controlMeasures && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Control Measures</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.controlMeasures}</p></div>}
              {viewRecord.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => openEdit(viewRecord)}>Edit</Button>
              <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent style={{ maxWidth: "28rem" }}>
          <DialogHeader><DialogTitle>Delete Risk Assessment</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">This will permanently delete this risk assessment record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
