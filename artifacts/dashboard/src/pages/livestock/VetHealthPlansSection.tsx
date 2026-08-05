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
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["vhp-completions", farmId, action.id],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/vet-health-plan-actions/${action.id}/completions`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ completions: VetHealthPlanActionCompletion[] }>;
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vet-health-plan-action-completions/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-completions", farmId, action.id] }); qc.invalidateQueries({ queryKey: ["vhp-actions"] }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const completions = data?.completions ?? [];
  return (
    <Dialog open onOpenChange={o => { if (!o) { onClose(); deleteMut.reset(); } }}>
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
        <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MarkCompleteDialog({ farmId, action, onClose }: { farmId: number; action: VetHealthPlanAction; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
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
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vhp-actions"] });
      qc.invalidateQueries({ queryKey: ["vhp-completions", farmId, action.id] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) { onClose(); completeMut.reset(); } }}>
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
        <DialogMutationError mutation={completeMut} message="Failed to save — your entries are still here." />
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
  const { toast } = useToast();
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
    mutationFn: (body: typeof EMPTY_ACTION) => fetch(actionsUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nextDueDate: body.nextDueDate || null }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] }); setShowAddForm(false); setActionForm(EMPTY_ACTION); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateActionMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_ACTION }) => fetch(`/api/farms/${farmId}/vet-health-plan-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nextDueDate: body.nextDueDate || null }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] }); setEditingAction(null); setShowAddForm(false); setActionForm(EMPTY_ACTION); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteActionMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vet-health-plan-actions/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] }); setDeletingActionId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
    <Dialog open onOpenChange={o => { if (!o) { onClose(); createActionMut.reset(); updateActionMut.reset(); } }}>
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
                <DialogMutationError mutation={createActionMut} message="Failed to save — your entries are still here." />
                <DialogMutationError mutation={updateActionMut} message="Failed to save — your entries are still here." />
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
        <Dialog open onOpenChange={o => { if (!o) { setDeletingActionId(null); deleteActionMut.reset(); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Action Point?</DialogTitle><DialogDescription>This action point and its completion history will be removed. This cannot be undone.</DialogDescription></DialogHeader>
            <DialogMutationError mutation={deleteActionMut} message="Failed to delete — please try again." />
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
  const { toast } = useToast();
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
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setEditingPlan(null); setShowForm(false); setFormData(EMPTY_PLAN); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const records: VetHealthPlan[] = data?.records ?? [];

  const [yearFilterVhp, setYearFilterVhp] = usePersistedFilter({ page: "livestock-vhp", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsVhp = useMemo(() => Array.from(new Set(records.map(r => String(r.planYear ?? "")).filter(Boolean))).sort().reverse(), [records]);
  const filteredVhpRecords = yearFilterVhp === "all" ? records : records.filter(r => String(r.planYear ?? "") === yearFilterVhp);

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
        <div className="flex items-center gap-2">
          <Select value={yearFilterVhp} onValueChange={setYearFilterVhp}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsVhp.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingPlan(null); setFormData(EMPTY_PLAN); setShowForm(true); }} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Add Health Plan
          </Button>
        </div>
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
        ) : filteredVhpRecords.length === 0 ? (
          <Card>
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No vet health plans recorded</h3>
              <p className="text-foreground/50 text-sm">Add your annual veterinary health plan. Red Tractor requires a current signed plan from your vet.</p>
            </div>
          </Card>
        ) : filteredVhpRecords.map(p => (
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

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMutation.reset(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Vet Health Plan</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
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

