import React, { useState } from "react";
import { herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Plus, Pencil, Trash2, AlertTriangle, ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport } from "@/lib/print-report";

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: "vet_visit", label: "Vet Visit" },
  { value: "disease_outbreak", label: "Disease / Outbreak" },
  { value: "welfare_concern", label: "Welfare Concern" },
  { value: "routine_check", label: "Routine Health Check" },
  { value: "vaccination", label: "Vaccination Programme" },
  { value: "parasite_control", label: "Parasite Control" },
  { value: "biosecurity_event", label: "Biosecurity Event" },
  { value: "other", label: "Other" },
];

const SOURCE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  medicine:       { label: "Treatment",       color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  mortality:      { label: "Mortality",       color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
  bcs:            { label: "BCS Assessment",  color: "#6d28d9", bg: "#ede9fe", border: "#c4b5fd" },
  mastitis:       { label: "Mastitis",        color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  vet_plan:       { label: "Vet Health Plan", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  clinical_event: { label: "Clinical Event",  color: "#374151", bg: "#f3f4f6", border: "#d1d5db" },
};

const ALL_SOURCES = Object.keys(SOURCE_META);

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isWithdrawalActive(endDate: string | null | undefined): boolean {
  if (!endDate) return false;
  return new Date(endDate) >= new Date();
}

// ─── Summary Banner ───────────────────────────────────────────────────────────
function SummaryBanner({ timeline }: { timeline: any[] }) {
  const total = timeline.length;
  const activeWithdrawals = timeline.filter(e => e.withdrawal && isWithdrawalActive(e.withdrawal?.endDate)).length;
  const openFollowUps = timeline.filter(e => e.followUpRequired && !e.followUpCompleted).length;
  const overdueFollowUps = timeline.filter(e =>
    e.followUpRequired && !e.followUpCompleted && e.followUpDate && new Date(e.followUpDate) < new Date()
  ).length;
  const lastVetVisit = timeline.find(e => e.source === "vet_plan" || (e.source === "clinical_event" && e.vetName));
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      {[
        { label: "Total Entries", value: total, bg: "#f0f9ff", border: "#bae6fd", color: "#0369a1" },
        { label: "Active Withdrawals", value: activeWithdrawals, bg: activeWithdrawals > 0 ? "#fef9c3" : "#f0fdf4", border: activeWithdrawals > 0 ? "#fde047" : "#bbf7d0", color: activeWithdrawals > 0 ? "#854d0e" : "#166534" },
        { label: "Open Follow-ups", value: openFollowUps, bg: openFollowUps > 0 ? "#fff7ed" : "#f0fdf4", border: openFollowUps > 0 ? "#fed7aa" : "#bbf7d0", color: openFollowUps > 0 ? "#c2410c" : "#166534" },
        { label: "Overdue Follow-ups", value: overdueFollowUps, bg: overdueFollowUps > 0 ? "#fef2f2" : "#f0fdf4", border: overdueFollowUps > 0 ? "#fecaca" : "#bbf7d0", color: overdueFollowUps > 0 ? "#991b1b" : "#166534" },
      ].map(card => (
        <div key={card.label} style={{ flex: "1 1 140px", background: card.bg, border: `1px solid ${card.border}`, borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>{card.label}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: card.color, lineHeight: 1 }}>{card.value}</div>
        </div>
      ))}
      <div style={{ flex: "1 1 200px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" }}>
        <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>Last Vet Record</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>
          {lastVetVisit ? fmt(lastVetVisit.date) : "None recorded"}
        </div>
        {lastVetVisit?.vetName && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{lastVetVisit.vetName}</div>}
      </div>
    </div>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const m = SOURCE_META[source] ?? { label: source, color: "#374151", bg: "#f3f4f6", border: "#d1d5db" };
  return (
    <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 6, background: m.bg, color: m.color, border: `1px solid ${m.border}`, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

// ─── Timeline Entry ───────────────────────────────────────────────────────────
function TimelineEntry({ entry, onEdit, onDelete, onRaiseTask }: { entry: any; onEdit: (e: any) => void; onDelete: (e: any) => void; onRaiseTask?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const m = SOURCE_META[entry.source] ?? SOURCE_META["clinical_event"];
  const isOverdue = entry.followUpRequired && !entry.followUpCompleted && entry.followUpDate && new Date(entry.followUpDate) < new Date();
  const hasWithdrawal = entry.withdrawal && isWithdrawalActive(entry.withdrawal?.endDate);

  const isMedicine = entry.source === "medicine";
  const hasAnimalTag = isMedicine && !!entry.animalTag;
  const scope = entry.treatmentScope as string | null | undefined;

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color, marginTop: 5, flexShrink: 0 }} />
        <div style={{ width: 2, flex: 1, background: "#e5e7eb", marginTop: 3 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", borderLeft: `3px solid ${m.border}` }}>
          <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                <SourceBadge source={entry.source} />
                {entry.herdLabel && <span style={{ fontSize: "0.72rem", color: "#6b7280", background: "#f1f5f9", padding: "1px 6px", borderRadius: 5 }}>{entry.herdLabel}</span>}
                {/* Animal traceability badges for medicine entries */}
                {isMedicine && hasAnimalTag && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#166534", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: 5, fontFamily: "monospace", letterSpacing: "0.02em" }}>
                    🏷 {entry.animalTag}
                  </span>
                )}
                {isMedicine && !hasAnimalTag && scope === "herd" && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d28d9", background: "#ede9fe", border: "1px solid #c4b5fd", padding: "1px 6px", borderRadius: 5 }}>
                    Whole Herd{entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""}
                  </span>
                )}
                {isMedicine && !hasAnimalTag && scope === "group" && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: 5 }}>
                    Group{entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""}
                  </span>
                )}
                {isMedicine && !scope && !hasAnimalTag && (
                  <span style={{ fontSize: "0.65rem", color: "#9ca3af", border: "1px solid #e5e7eb", padding: "1px 6px", borderRadius: 5 }}>
                    No animal linked
                  </span>
                )}
                {hasWithdrawal && <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#854d0e", background: "#fef9c3", border: "1px solid #fde047", padding: "1px 6px", borderRadius: 5 }}>WITHDRAWAL ACTIVE</span>}
                {isOverdue && <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", padding: "1px 6px", borderRadius: 5, display: "flex", alignItems: "center", gap: 3 }}><AlertTriangle size={9} />FOLLOW-UP OVERDUE</span>}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{entry.title}</div>
              <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 1 }}>{fmt(entry.date)}{entry.vetName ? ` · ${entry.vetName}` : ""}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {entry.source === "clinical_event" && (
                <>
                  <button onClick={() => onEdit(entry.raw)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }} title="Edit"><Pencil size={13} /></button>
                  <button onClick={() => onDelete(entry.raw)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2 }} title="Delete"><Trash2 size={13} /></button>
                </>
              )}
              <button onClick={() => setExpanded(x => !x)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}>
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>
          </div>
          {expanded && (
            <div style={{ padding: "0 14px 12px 14px", borderTop: "1px solid #f3f4f6" }}>
              {/* Full animal traceability detail in expanded view */}
              {isMedicine && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Animal Traceability</div>
                  {hasAnimalTag ? (
                    <div style={{ fontSize: "0.82rem", color: "#14532d", fontFamily: "monospace", fontWeight: 600 }}>
                      Ear tag(s): {entry.animalTag}
                      {entry.treatedAnimalCount && entry.treatedAnimalCount > 1 ? <span style={{ fontFamily: "inherit", color: "#166534", marginLeft: 8 }}>({entry.treatedAnimalCount} animals total)</span> : null}
                    </div>
                  ) : scope === "herd" ? (
                    <div style={{ fontSize: "0.82rem", color: "#166534" }}>
                      Whole herd treatment{entry.herdLabel ? ` — ${entry.herdLabel}` : ""}
                      {entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""}
                    </div>
                  ) : scope === "group" ? (
                    <div style={{ fontSize: "0.82rem", color: "#166534" }}>
                      Group treatment{entry.treatedAnimalCount ? ` · ${entry.treatedAnimalCount} animals` : ""}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.82rem", color: "#9ca3af", fontStyle: "italic" }}>
                      No specific animal linked — edit this medicine record to add traceability.
                    </div>
                  )}
                </div>
              )}
              {entry.detail && <p style={{ fontSize: "0.8rem", color: "#374151", marginTop: 8, marginBottom: 0 }}>{entry.detail}</p>}
              {entry.notes && <p style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 6, marginBottom: 0 }}><span style={{ fontWeight: 600 }}>Notes:</span> {entry.notes}</p>}
              {hasWithdrawal && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 6, fontSize: "0.78rem", color: "#854d0e" }}>
                  Withdrawal period active until <strong>{fmt(entry.withdrawal.endDate)}</strong> ({entry.withdrawal.days} days). Do not slaughter or sell milk until after this date.
                </div>
              )}
              {entry.followUpRequired && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: isOverdue ? "#fef2f2" : "#fff7ed", border: `1px solid ${isOverdue ? "#fecaca" : "#fed7aa"}`, borderRadius: 6, fontSize: "0.78rem", color: isOverdue ? "#991b1b" : "#c2410c", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span>Follow-up required by {fmt(entry.followUpDate)} · {entry.followUpCompleted ? "Completed" : isOverdue ? "OVERDUE" : "Pending"}</span>
                  {!entry.followUpCompleted && onRaiseTask && (
                    <button
                      onClick={onRaiseTask}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#c2410c", background: "rgba(194,65,12,0.08)", border: "1px solid #fed7aa", borderRadius: 5, padding: "2px 8px", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      <ClipboardList size={11} />Raise Task
                    </button>
                  )}
                </div>
              )}
              {entry.recordedBy && <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 6, marginBottom: 0 }}>Recorded by: {entry.recordedBy}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Clinical Event Form Dialog ────────────────────────────────────────────────
const emptyForm = { eventType: "", title: "", eventDate: new Date().toISOString().slice(0, 10), herdId: "", description: "", vetName: "", actionTaken: "", followUpRequired: false, followUpDate: "", followUpCompleted: false, recordedBy: "" };

function ClinicalEventDialog({ open, onClose, farmId, herds, editRecord, onSaved }: {
  open: boolean; onClose: () => void; farmId: number; herds: any[]; editRecord: any | null; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<any>(emptyForm);

  React.useEffect(() => {
    if (editRecord) {
      setForm({
        eventType: editRecord.eventType ?? "",
        title: editRecord.title ?? "",
        eventDate: editRecord.eventDate?.slice(0, 10) ?? "",
        herdId: editRecord.herdId ? String(editRecord.herdId) : "",
        description: editRecord.description ?? "",
        vetName: editRecord.vetName ?? "",
        actionTaken: editRecord.actionTaken ?? "",
        followUpRequired: editRecord.followUpRequired ?? false,
        followUpDate: editRecord.followUpDate?.slice(0, 10) ?? "",
        followUpCompleted: editRecord.followUpCompleted ?? false,
        recordedBy: editRecord.recordedBy ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editRecord, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const saveMut = useMutation({
    mutationFn: async () => {
      const body: any = {
        ...form,
        herdId: form.herdId ? parseInt(form.herdId) : null,
        followUpDate: form.followUpRequired && form.followUpDate ? form.followUpDate : null,
      };
      const url = editRecord
        ? `/api/farms/${farmId}/herd-health-events/${editRecord.id}`
        : `/api/farms/${farmId}/herd-health-events`;
      const r = await fetch(url, { method: editRecord ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => { toast({ title: editRecord ? "Event updated" : "Clinical event logged" }); onSaved(); onClose(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const canSave = form.eventType && form.title && form.eventDate;

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 580 }}>
        <DialogHeader><DialogTitle>{editRecord ? "Edit Clinical Event" : "Log Clinical Event"}</DialogTitle></DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Event Type <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select value={form.eventType} onValueChange={v => set("eventType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent className="max-h-56">
                  {EVENT_TYPES.map(et => <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input type="date" value={form.eventDate} onChange={e => set("eventDate", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Title / Summary <span style={{ color: "#ef4444" }}>*</span></Label>
            <Input placeholder="Brief description of the event" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Herd / Flock (optional)</Label>
              <Select value={form.herdId || "__none__"} onValueChange={v => set("herdId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="All herds / unspecified" /></SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem value="__none__">All herds / unspecified</SelectItem>
                  {herds.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name} ({herdSpeciesDisplayLabel(h.type)}{herdProductionSubtype(h.type) ? ` · ${herdProductionSubtype(h.type)}` : ""})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vet Name</Label>
              <Input placeholder="Attending vet (if applicable)" value={form.vetName} onChange={e => set("vetName", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Description / Clinical Findings</Label>
            <Textarea placeholder="Clinical observations, diagnosis, condition notes…" value={form.description} onChange={e => set("description", e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Action Taken</Label>
            <Textarea placeholder="What was done — treatment prescribed, animals isolated, vet plan updated…" value={form.actionTaken} onChange={e => set("actionTaken", e.target.value)} rows={2} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <Checkbox id="followup" checked={form.followUpRequired} onCheckedChange={v => set("followUpRequired", !!v)} style={{ marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <label htmlFor="followup" style={{ fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>Follow-up Required</label>
              {form.followUpRequired && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label>Follow-up Due Date</Label>
                    <Input type="date" value={form.followUpDate} onChange={e => set("followUpDate", e.target.value)} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, paddingBottom: 2 }}>
                    <Checkbox id="followup-done" checked={form.followUpCompleted} onCheckedChange={v => set("followUpCompleted", !!v)} />
                    <label htmlFor="followup-done" style={{ fontSize: "0.82rem", cursor: "pointer" }}>Mark as completed</label>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Recorded By</Label>
            <Input placeholder="Your name" value={form.recordedBy} onChange={e => set("recordedBy", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => saveMut.mutate()} disabled={!canSave || saveMut.isPending}>
            {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Log Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteDialog({ record, farmId, onClose, onDeleted }: { record: any; farmId: number; onClose: () => void; onDeleted: () => void }) {
  const { toast } = useToast();
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/herd-health-events/${record.id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Event deleted" }); onDeleted(); onClose(); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });
  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 400 }}>
        <DialogHeader><DialogTitle>Delete Clinical Event</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600 py-2">Remove "<strong>{record?.title}</strong>" from the herd health register? This cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HerdHealthRegisterPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<any | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<any | null>(null);
  const [filterSource, setFilterSource] = useState<string>("__all__");
  const [filterHerd, setFilterHerd] = useState<string>("__all__");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");

  const q = useQuery({
    queryKey: ["herd-health-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herd-health-register`).then(r => r.json()),
    enabled: !!farmId,
  });

  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const timeline: any[] = q.data?.timeline ?? [];
  const herds: any[] = q.data?.herds ?? [];
  const farm = farmQ.data?.record ?? null;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["herd-health-register", farmId] });

  const filtered = timeline.filter(e => {
    if (filterSource !== "__all__" && e.source !== filterSource) return false;
    if (filterHerd !== "__all__" && e.herdLabel !== filterHerd) return false;
    if (filterFrom && new Date(e.date) < new Date(filterFrom)) return false;
    if (filterTo && new Date(e.date) > new Date(filterTo + "T23:59:59")) return false;
    return true;
  });

  const herdLabels = Array.from(new Set(timeline.map(e => e.herdLabel).filter(Boolean)));

  const handlePrint = () => {
    const escape = (s: string | null | undefined) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const sourceBadgeHtml = (source: string) => {
      const m = SOURCE_META[source] ?? SOURCE_META["clinical_event"];
      return `<span style="font-size:6px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:2px 5px;border-radius:3px;background:${m.bg};color:${m.color};border:1px solid ${m.border};white-space:nowrap">${m.label}</span>`;
    };

    const withdrawalHtml = (entry: any) => {
      if (!entry.withdrawal) return "—";
      const end = entry.withdrawal.endDate;
      if (!end) return "—";
      const daysLeft = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
      if (daysLeft > 0) {
        return `<span style="background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:2px;font-weight:600">${daysLeft}d left — ends ${fmt(end)}</span>`;
      }
      return `<span style="background:#dcfce7;color:#166534;padding:1px 4px;border-radius:2px">Cleared ${fmt(end)}</span>`;
    };

    const followUpHtml = (entry: any) => {
      if (!entry.followUpRequired) return "—";
      if (entry.followUpCompleted) {
        return `<span style="background:#dcfce7;color:#166534;padding:1px 4px;border-radius:2px">Completed</span>`;
      }
      if (entry.followUpDate && new Date(entry.followUpDate) < new Date()) {
        return `<span style="background:#fee2e2;color:#991b1b;padding:1px 4px;border-radius:2px;font-weight:600">Overdue — ${fmt(entry.followUpDate)}</span>`;
      }
      return entry.followUpDate ? `Due ${fmt(entry.followUpDate)}` : "Required";
    };

    const rows = filtered.map(e => `<tr>
      <td style="white-space:nowrap;font-weight:600">${fmt(e.date)}</td>
      <td>${sourceBadgeHtml(e.source)}</td>
      <td>${escape(e.herdLabel ?? "—")}</td>
      <td><strong>${escape(e.title)}</strong>${e.detail ? `<br><span style="color:#555;font-size:7px">${escape(e.detail)}</span>` : ""}</td>
      <td>${escape(e.vetName ?? "—")}</td>
      <td>${withdrawalHtml(e)}</td>
      <td>${followUpHtml(e)}${e.notes && e.source === "clinical_event" ? `<br><span style="color:#555;font-size:7px">Action: ${escape(e.notes)}</span>` : ""}</td>
    </tr>`).join("");

    const activeWithdrawals = timeline.filter(e => e.withdrawal && isWithdrawalActive(e.withdrawal?.endDate)).length;
    const openFollowUps = timeline.filter(e => e.followUpRequired && !e.followUpCompleted).length;
    const overdueFollowUps = timeline.filter(e => e.followUpRequired && !e.followUpCompleted && e.followUpDate && new Date(e.followUpDate) < new Date()).length;

    const filterParts: string[] = [];
    if (filterSource !== "__all__") filterParts.push(`Type: ${SOURCE_META[filterSource]?.label ?? filterSource}`);
    if (filterHerd !== "__all__") filterParts.push(`Herd: ${filterHerd}`);
    if (filterFrom) filterParts.push(`From: ${fmt(filterFrom)}`);
    if (filterTo) filterParts.push(`To: ${fmt(filterTo)}`);
    const filterLabel = filterParts.length > 0 ? filterParts.join("  ·  ") : "All records";

    const tableHtml = `
      <p style="font-size:7.5px;color:#374151;margin:0 0 10px">
        <strong>Summary:</strong>&nbsp;
        ${filtered.length} entries shown &nbsp;·&nbsp; ${activeWithdrawals} active withdrawal${activeWithdrawals !== 1 ? "s" : ""} &nbsp;·&nbsp;
        ${openFollowUps} open follow-up${openFollowUps !== 1 ? "s" : ""} (${overdueFollowUps} overdue)
      </p>
      <table><thead><tr>
        <th>Date</th><th>Type</th><th>Herd / Group</th><th style="width:30%">Summary / Detail</th>
        <th>Vet / Clinician</th><th>Withdrawal Status</th><th>Follow-up / Action</th>
      </tr></thead><tbody>${rows}</tbody></table>
    `;

    printProReport({
      title: "Herd Health Register",
      subtitle: "Consolidated livestock health record — Red Tractor compliant",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      redTractorId: farm?.redTractorId ?? undefined,
      recordCount: filtered.length,
      recordLabel: "entry",
      extraMeta: `Filter: ${filterLabel}`,
      tableHtml,
      footerNote: "Retain herd health records for a minimum of 3 years. Withdrawal periods must be observed before animals enter the food chain. Make available at Red Tractor audit inspection.",
      landscape: true,
    });
  };

  if (!farmId) {
    return (
      <AppLayout title="Herd Health Register">
        <p className="text-sm text-gray-500">Select a farm to view the Herd Health Register.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Herd Health Register">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div>
            <p className="text-sm text-gray-500">
              Consolidated chronological record of all health events, treatments, vet visits, welfare assessments, and clinical observations — suitable for Red Tractor audit.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer size={14} className="mr-1" />Print Register</Button>
            <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} className="mr-1" />Log Clinical Event</Button>
          </div>
        </div>

        {q.isLoading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading health register…</div>
        ) : (
          <>
            <SummaryBanner timeline={timeline} />

            {/* Filter bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", background: "#f8fafc", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }}>RECORD TYPE</div>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger style={{ height: 32, fontSize: "0.8rem" }}><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="__all__">All types</SelectItem>
                    {ALL_SOURCES.map(s => <SelectItem key={s} value={s}>{SOURCE_META[s].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {herdLabels.length > 0 && (
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }}>HERD / FLOCK</div>
                  <Select value={filterHerd} onValueChange={setFilterHerd}>
                    <SelectTrigger style={{ height: 32, fontSize: "0.8rem" }}><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-56">
                      <SelectItem value="__all__">All herds</SelectItem>
                      {herdLabels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }}>FROM</div>
                <Input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={{ height: 32, fontSize: "0.8rem", width: 140 }} />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 3 }}>TO</div>
                <Input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={{ height: 32, fontSize: "0.8rem", width: 140 }} />
              </div>
              {(filterSource !== "__all__" || filterHerd !== "__all__" || filterFrom || filterTo) && (
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 0 }}>
                  <Button variant="ghost" size="sm" onClick={() => { setFilterSource("__all__"); setFilterHerd("__all__"); setFilterFrom(""); setFilterTo(""); }} style={{ height: 32, fontSize: "0.78rem" }}>Clear filters</Button>
                </div>
              )}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", paddingBottom: 0 }}>
                <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{filtered.length} of {timeline.length} entries</span>
              </div>
            </div>

            {/* Timeline */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 12, border: "1px dashed #d1d5db", color: "#6b7280" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🐄</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>No health records found</div>
                <div style={{ fontSize: "0.85rem" }}>
                  {timeline.length > 0
                    ? "Try adjusting your filters."
                    : "Health events will appear here automatically as you add treatments, BCS assessments, vet plans, and mortalities. Use \"Log Clinical Event\" to add vet visits or other health notes."}
                </div>
              </div>
            ) : (
              <div>
                {filtered.map((entry, i) => (
                  <TimelineEntry
                    key={`${entry.source}-${entry.raw?.id ?? i}`}
                    entry={entry}
                    onEdit={(raw) => { setEditRecord(raw); setAddOpen(true); }}
                    onDelete={(raw) => setDeleteRecord(raw)}
                    onRaiseTask={() => setRaiseTaskFor(entry)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <ClinicalEventDialog
          open={addOpen || !!editRecord}
          onClose={() => { setAddOpen(false); setEditRecord(null); }}
          farmId={farmId}
          herds={herds}
          editRecord={editRecord}
          onSaved={invalidate}
        />

        {deleteRecord && (
          <DeleteDialog
            record={deleteRecord}
            farmId={farmId}
            onClose={() => setDeleteRecord(null)}
            onDeleted={invalidate}
          />
        )}

        {raiseTaskFor && (
          <RaiseTaskDialog
            farmId={farmId}
            open={!!raiseTaskFor}
            onClose={() => setRaiseTaskFor(null)}
            defaultTitle={`Vet Follow-up — ${raiseTaskFor.title ?? "Health Event"}`}
            defaultDescription={`Follow-up required by ${raiseTaskFor.followUpDate ? new Date(raiseTaskFor.followUpDate).toLocaleDateString("en-GB") : "—"}${raiseTaskFor.herdLabel ? ` · ${raiseTaskFor.herdLabel}` : ""}${raiseTaskFor.detail ? ` · ${raiseTaskFor.detail}` : ""}`}
          />
        )}
      </div>
    </AppLayout>
  );
}
