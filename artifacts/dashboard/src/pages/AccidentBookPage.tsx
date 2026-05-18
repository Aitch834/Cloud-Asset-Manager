import React, { useState } from "react";
import { printProReport } from "@/lib/print-report";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OtherSelect } from "@/components/ui/other-select";
import {
  BookOpen, Plus, Printer, Trash2, Pencil, AlertTriangle, CheckCircle, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Camera, File, Loader2, ClipboardList, ArrowRight,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";

const PERSON_TYPES = ["Employee", "Contractor", "Self-employed", "Visitor", "Member of public"];

const BODY_PARTS = [
  "Head / skull", "Face", "Eye(s)", "Ear(s)", "Neck", "Shoulder(s)", "Upper arm", "Elbow", "Forearm",
  "Wrist", "Hand / fingers", "Chest / ribcage", "Upper back", "Lower back", "Abdomen", "Hip",
  "Thigh / upper leg", "Knee", "Lower leg / shin", "Ankle", "Foot / toes", "Multiple / whole body", "Internal", "Other",
];

const RIDDOR_CATEGORIES = [
  "Over-7-day injury (must report within 15 days)",
  "Specified injury — fracture other than finger/thumb/toe",
  "Specified injury — amputation",
  "Specified injury — loss of sight (permanent or temporary)",
  "Specified injury — crush injury",
  "Specified injury — scalping",
  "Specified injury — unconsciousness due to head injury / asphyxia",
  "Specified injury — requires resuscitation or 24h+ hospital",
  "Dangerous occurrence (near miss, no injury required)",
  "Occupational disease",
  "Death",
];

interface Photo { id: number; objectPath: string; fileName: string | null; }

interface AccidentRecord {
  id: number;
  incidentDate: string;
  incidentTime: string | null;
  incidentLocation: string;
  personName: string;
  personType: string;
  jobTitle: string | null;
  natureOfIncident: string;
  natureOfInjury: string | null;
  bodyPartAffected: string | null;
  firstAidGiven: boolean;
  firstAidDetails: string | null;
  firstAiderName: string | null;
  hospitalAttended: boolean;
  hospitalName: string | null;
  timeLostDays: string | null;
  riddorReportable: boolean;
  riddorCategory: string | null;
  riddorReference: string | null;
  riddorReportedDate: string | null;
  witnesses: string | null;
  correctiveAction: string | null;
  signedOffBy: string | null;
  signOffDate: string | null;
  notes: string | null;
  status: string;
  investigationDate: string | null;
  investigatedBy: string | null;
  investigationNotes: string | null;
  correctiveActionDate: string | null;
  correctiveActionBy: string | null;
  createdAt: string;
  photos: Photo[];
}

function AccidentPhotoPanel({ recordId, farmId, photos }: { recordId: number; farmId: number; photos: Photo[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const deleteMut = useMutation({
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/accident-book/${recordId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accident-book", farmId] }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/accident-book/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() }),
      });
      qc.invalidateQueries({ queryKey: ["accident-book", farmId] });
      toast({ title: "Photo uploaded" });
    },
  });

  return (
    <div style={{ padding: "10px 14px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }}>Scene / Evidence Photos</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }}>
        {photos.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }}>
            <File size={12} style={{ color: "#2563eb" }} />
            <a href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }}>
              {p.fileName ?? "photo"}
            </a>
            <button onClick={() => deleteMut.mutate(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
        {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
        {isUploading ? `Uploading… ${progress}%` : "Add Photo"}
        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      </label>
    </div>
  );
}

const EMPTY_FORM = {
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: "",
  incidentLocation: "",
  personName: "",
  personType: "Employee",
  jobTitle: "",
  natureOfIncident: "",
  natureOfInjury: "",
  bodyPartAffected: "",
  firstAidGiven: false,
  firstAidDetails: "",
  firstAiderName: "",
  hospitalAttended: false,
  hospitalName: "",
  timeLostDays: "",
  riddorReportable: false,
  riddorCategory: "",
  riddorReference: "",
  riddorReportedDate: "",
  witnesses: "",
  correctiveAction: "",
  signedOffBy: "",
  signOffDate: "",
  notes: "",
  status: "reported",
};

const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function RiddorBadge({ record }: { record: AccidentRecord }) {
  if (!record.riddorReportable) return null;
  if (record.riddorReference) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
        <CheckCircle size={10} /> RIDDOR — Reported ({record.riddorReference})
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
      <AlertTriangle size={10} /> RIDDOR — Pending Report
    </span>
  );
}

function RecordCard({ record, farmId, onEdit, onDelete, onRaiseTask, onInvestigate, onCorrectiveAction, onSignOff }: {
  record: AccidentRecord; farmId: number; onEdit: () => void; onDelete: () => void; onRaiseTask: () => void;
  onInvestigate?: () => void; onCorrectiveAction?: () => void; onSignOff?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = record.status ?? "reported";
  const borderColor = (record.riddorReportable && !record.riddorReference) ? "#fca5a5" : status === "closed" ? "#bbf7d0" : "#e5e7eb";

  return (
    <div style={{ border: `1px solid ${borderColor}`, borderRadius: 10, background: "#fff", overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 16px", gap: 12, cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.9375rem" }}>
              {fmt(record.incidentDate)}{record.incidentTime ? ` at ${record.incidentTime}` : ""}
            </span>
            <RiddorBadge record={record} />
            <AccidentStatusBadge status={status} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{record.personName} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({record.personType}{record.jobTitle ? ` — ${record.jobTitle}` : ""})</span></p>
          <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }}>
            <strong>Location:</strong> {record.incidentLocation} &nbsp;·&nbsp;
            <strong>Incident:</strong> {record.natureOfIncident.length > 90 ? record.natureOfIncident.slice(0, 90) + "…" : record.natureOfIncident}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
          {/* Stage action buttons */}
          {status === "reported" && onInvestigate && (
            <button onClick={onInvestigate} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, cursor: "pointer", padding: "4px 10px", color: "#92400e", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <ArrowRight size={12} /> Investigate
            </button>
          )}
          {status === "under_investigation" && onCorrectiveAction && (
            <button onClick={onCorrectiveAction} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", padding: "4px 10px", color: "#1d4ed8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <ArrowRight size={12} /> Record Action
            </button>
          )}
          {(status === "under_investigation" || status === "corrective_action_taken") && onSignOff && (
            <button onClick={onSignOff} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", padding: "4px 10px", color: "#166534", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <CheckCircle2 size={12} /> Sign Off
            </button>
          )}
          <button onClick={onEdit} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#374151", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
            <Pencil size={12} /> Edit
          </button>
          <button onClick={onDelete} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#dc2626", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={onRaiseTask} style={{ background: "none", border: "1px solid #fde68a", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#92400e", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }} title="Raise Task">
            <ClipboardList size={12} /> Task
          </button>
          <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <>
          <div style={{ borderTop: "1px solid #f3f4f6", padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "0.8125rem", color: "#374151" }}>
            <DetailRow label="Nature of Injury" value={record.natureOfInjury} />
            <DetailRow label="Body Part Affected" value={record.bodyPartAffected} />
            <DetailRow label="First Aid Given" value={record.firstAidGiven ? (record.firstAidDetails || "Yes") : "No"} />
            <DetailRow label="First Aider" value={record.firstAiderName} />
            <DetailRow label="Hospital Attended" value={record.hospitalAttended ? (record.hospitalName || "Yes") : "No"} />
            <DetailRow label="Time Lost" value={record.timeLostDays ? `${record.timeLostDays} day(s)` : "None recorded"} />
            {record.riddorReportable && <>
              <DetailRow label="RIDDOR Category" value={record.riddorCategory} />
              <DetailRow label="RIDDOR Reference" value={record.riddorReference} />
              <DetailRow label="Date Reported to HSE" value={record.riddorReportedDate ? fmt(record.riddorReportedDate) : null} />
            </>}
            <DetailRow label="Witnesses" value={record.witnesses} span />
            {record.investigatedBy && <DetailRow label="Investigated By" value={`${record.investigatedBy}${record.investigationDate ? ` on ${fmt(record.investigationDate)}` : ""}`} />}
            {record.investigationNotes && <DetailRow label="Investigation Notes" value={record.investigationNotes} span />}
            {record.correctiveAction && <DetailRow label="Corrective Action Taken" value={record.correctiveAction} span />}
            {record.correctiveActionBy && <DetailRow label="Corrective Action By" value={`${record.correctiveActionBy}${record.correctiveActionDate ? ` on ${fmt(record.correctiveActionDate)}` : ""}`} />}
            <DetailRow label="Signed Off By" value={record.signedOffBy ? `${record.signedOffBy}${record.signOffDate ? ` on ${fmt(record.signOffDate)}` : ""}` : null} />
            <DetailRow label="Notes" value={record.notes} span />
          </div>
          <AccidentPhotoPanel recordId={record.id} farmId={farmId} photos={record.photos} />
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value, span }: { label: string; value: string | null | undefined; span?: boolean }) {
  if (!value) return null;
  return (
    <div style={span ? { gridColumn: "1 / -1" } : {}}>
      <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <p style={{ marginTop: 2, color: "#111827", whiteSpace: "pre-wrap" }}>{value}</p>
    </div>
  );
}

// ─── Accident Book Workflow Status ────────────────────────────────────────────

const ACCIDENT_STATUS_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  reported:                { label: "Reported",               bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  under_investigation:     { label: "Under Investigation",    bg: "#fefce8", color: "#713f12", border: "#fef08a" },
  corrective_action_taken: { label: "Action Taken",           bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  closed:                  { label: "Closed",                 bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
};

function AccidentStatusBadge({ status }: { status: string }) {
  const cfg = ACCIDENT_STATUS_CFG[status] ?? ACCIDENT_STATUS_CFG.reported;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

// ─── Stage 2: Investigate Dialog ─────────────────────────────────────────────

function InvestigateDialog({ farmId, record, onClose }: { farmId: number; record: AccidentRecord; onClose: () => void }) {
  const qc = useQueryClient();
  const [investigationDate, setInvestigationDate] = useState(new Date().toISOString().slice(0, 10));
  const [investigatedBy, setInvestigatedBy] = useState("");
  const [investigationNotes, setInvestigationNotes] = useState(record.investigationNotes ?? "");
  const [riddorCategory, setRiddorCategory] = useState(record.riddorCategory ?? "");
  const [riddorReference, setRiddorReference] = useState(record.riddorReference ?? "");
  const [riddorReportedDate, setRiddorReportedDate] = useState(record.riddorReportedDate ?? "");

  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/accident-book/${record.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        investigationDate, investigatedBy: investigatedBy || null,
        investigationNotes: investigationNotes || null,
        riddorCategory: riddorCategory || null, riddorReference: riddorReference || null,
        riddorReportedDate: riddorReportedDate || null,
        status: "under_investigation",
      }),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accident-book", farmId] }); onClose(); },
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader>
          <DialogTitle>Record Investigation</DialogTitle>
          <DialogDescription>{record.personName} — {fmt(record.incidentDate)}</DialogDescription>
        </DialogHeader>
        <div style={{ display: "grid", gap: 14, marginTop: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Investigation Date *</Label><Input type="date" className="mt-1" value={investigationDate} onChange={e => setInvestigationDate(e.target.value)} /></div>
            <div><Label>Investigated By *</Label><Input className="mt-1" value={investigatedBy} onChange={e => setInvestigatedBy(e.target.value)} placeholder="Manager / investigator name" /></div>
          </div>
          <div><Label>Investigation Notes</Label><Textarea className="mt-1" rows={3} value={investigationNotes} onChange={e => setInvestigationNotes(e.target.value)} placeholder="Findings, root cause, contributing factors…" /></div>
          {record.riddorReportable && (
            <div style={{ padding: "12px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8 }}>
              <p style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#991b1b", marginBottom: 10 }}>RIDDOR — Complete within deadline</p>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <Label>RIDDOR Category</Label>
                  <Select value={riddorCategory} onValueChange={setRiddorCategory}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select category…" /></SelectTrigger>
                    <SelectContent>{RIDDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><Label>HSE Reference No.</Label><Input className="mt-1" value={riddorReference} onChange={e => setRiddorReference(e.target.value)} placeholder="From riddor.hse.gov.uk" /></div>
                  <div><Label>Date Reported to HSE</Label><Input type="date" className="mt-1" value={riddorReportedDate} onChange={e => setRiddorReportedDate(e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter style={{ marginTop: 12 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !investigatedBy.trim()}>
            {mut.isPending ? <><Loader2 size={14} className="animate-spin mr-1" /> Saving…</> : <>Save Investigation <ArrowRight size={14} className="ml-1" /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stage 3: Corrective Action Dialog ────────────────────────────────────────

function RecordCorrectiveActionDialog({ farmId, record, onClose }: { farmId: number; record: AccidentRecord; onClose: () => void }) {
  const qc = useQueryClient();
  const [correctiveAction, setCorrectiveAction] = useState(record.correctiveAction ?? "");
  const [correctiveActionDate, setCorrectiveActionDate] = useState(new Date().toISOString().slice(0, 10));
  const [correctiveActionBy, setCorrectiveActionBy] = useState("");

  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/accident-book/${record.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correctiveAction: correctiveAction || null,
        correctiveActionDate: correctiveActionDate || null,
        correctiveActionBy: correctiveActionBy || null,
        status: "corrective_action_taken",
      }),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accident-book", farmId] }); onClose(); },
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle>Record Corrective Action</DialogTitle>
          <DialogDescription>{record.personName} — {fmt(record.incidentDate)}</DialogDescription>
        </DialogHeader>
        <div style={{ display: "grid", gap: 14, marginTop: 8 }}>
          <div><Label>Corrective Action Taken *</Label><Textarea className="mt-1" rows={3} value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} placeholder="What steps were taken to prevent recurrence?" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Date Action Taken</Label><Input type="date" className="mt-1" value={correctiveActionDate} onChange={e => setCorrectiveActionDate(e.target.value)} /></div>
            <div><Label>Action Taken By</Label><Input className="mt-1" value={correctiveActionBy} onChange={e => setCorrectiveActionBy(e.target.value)} placeholder="Name" /></div>
          </div>
        </div>
        <DialogFooter style={{ marginTop: 12 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !correctiveAction.trim()}>
            {mut.isPending ? <><Loader2 size={14} className="animate-spin mr-1" /> Saving…</> : <>Save Action <ArrowRight size={14} className="ml-1" /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stage 4: Sign-Off Dialog ─────────────────────────────────────────────────

function SignOffDialog({ farmId, record, onClose }: { farmId: number; record: AccidentRecord; onClose: () => void }) {
  const qc = useQueryClient();
  const [signedOffBy, setSignedOffBy] = useState(record.signedOffBy ?? "");
  const [signOffDate, setSignOffDate] = useState(new Date().toISOString().slice(0, 10));

  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/accident-book/${record.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedOffBy: signedOffBy || null, signOffDate: signOffDate || null, status: "closed" }),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accident-book", farmId] }); onClose(); },
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent style={{ maxWidth: 400 }}>
        <DialogHeader>
          <DialogTitle>Sign Off Record</DialogTitle>
          <DialogDescription>{record.personName} — {fmt(record.incidentDate)}</DialogDescription>
        </DialogHeader>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <div><Label>Signed Off By *</Label><Input className="mt-1" value={signedOffBy} onChange={e => setSignedOffBy(e.target.value)} placeholder="Manager's name" autoFocus /></div>
          <div><Label>Sign-Off Date</Label><Input type="date" className="mt-1" value={signOffDate} onChange={e => setSignOffDate(e.target.value)} /></div>
        </div>
        <DialogFooter style={{ marginTop: 12 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !signedOffBy.trim()} style={{ background: "#16a34a", color: "#fff" }}>
            {mut.isPending ? <><Loader2 size={14} className="animate-spin mr-1" /> Saving…</> : <><CheckCircle2 size={14} className="mr-1" /> Sign Off Record</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AccidentBookPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [raiseTaskFor, setRaiseTaskFor] = useState<AccidentRecord | null>(null);

  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const q = useQuery<{ records: AccidentRecord[] }>({
    queryKey: ["accident-book", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/accident-book`).then(r => r.json()),
    enabled: !!farmId,
  });
  const records: AccidentRecord[] = q.data?.records ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<AccidentRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "riddor-pending" | "riddor-reported" | "unsigned">("all");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [allYears, setAllYears] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [investigateRecord, setInvestigateRecord] = useState<AccidentRecord | null>(null);
  const [correctiveActionRecord, setCorrectiveActionRecord] = useState<AccidentRecord | null>(null);
  const [signOffRecord, setSignOffRecord] = useState<AccidentRecord | null>(null);

  function openAdd() { setEditItem(null); setForm({ ...EMPTY_FORM, incidentDate: new Date().toISOString().slice(0, 10) }); setAddOpen(true); }
  function openEdit(r: AccidentRecord) {
    setEditItem(r);
    setForm({
      incidentDate: r.incidentDate, incidentTime: r.incidentTime ?? "",
      incidentLocation: r.incidentLocation, personName: r.personName, personType: r.personType,
      jobTitle: r.jobTitle ?? "", natureOfIncident: r.natureOfIncident, natureOfInjury: r.natureOfInjury ?? "",
      bodyPartAffected: r.bodyPartAffected ?? "", firstAidGiven: r.firstAidGiven, firstAidDetails: r.firstAidDetails ?? "",
      firstAiderName: r.firstAiderName ?? "", hospitalAttended: r.hospitalAttended, hospitalName: r.hospitalName ?? "",
      timeLostDays: r.timeLostDays ?? "", riddorReportable: r.riddorReportable, riddorCategory: r.riddorCategory ?? "",
      riddorReference: r.riddorReference ?? "", riddorReportedDate: r.riddorReportedDate ?? "",
      witnesses: r.witnesses ?? "", correctiveAction: r.correctiveAction ?? "",
      signedOffBy: r.signedOffBy ?? "", signOffDate: r.signOffDate ?? "", notes: r.notes ?? "",
      status: r.status ?? "reported",
    });
    setAddOpen(true);
  }

  const invalidate = () => qc.invalidateQueries({ queryKey: ["accident-book", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/accident-book`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Record added to Accident Book" }); invalidate(); setAddOpen(false); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/accident-book/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Record updated" }); invalidate(); setAddOpen(false); setEditItem(null); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/accident-book/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Record deleted" }); invalidate(); setDeleteId(null); },
  });

  function handleSave() {
    const body = { ...form, riddorReportable: !!form.riddorReportable, firstAidGiven: !!form.firstAidGiven, hospitalAttended: !!form.hospitalAttended };
    if (editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }

  const filtered = records.filter(r => {
    if (!allYears && !isInCropYear(r.incidentDate, cropYear)) return false;
    if (filter === "riddor-pending") return r.riddorReportable && !r.riddorReference;
    if (filter === "riddor-reported") return r.riddorReportable && !!r.riddorReference;
    if (filter === "unsigned") return !r.signedOffBy;
    return true;
  });

  const pendingRiddor = records.filter(r => r.riddorReportable && !r.riddorReference).length;
  const totalTimeLost = records.reduce((s, r) => s + (r.timeLostDays ? parseFloat(r.timeLostDays) || 0 : 0), 0);

  function handlePrint() {
    const farm = farmData?.record;
    const rows = records.map(r => `<tr>
      <td style="white-space:nowrap">${r.incidentDate ? new Date(r.incidentDate).toLocaleDateString("en-GB") : "—"}</td>
      <td><strong>${r.personName}</strong></td>
      <td>${r.personType}</td>
      <td>${r.incidentLocation}</td>
      <td>${r.natureOfIncident}</td>
      <td>${r.natureOfInjury || "—"}</td>
      <td>${r.bodyPartAffected || "—"}</td>
      <td>${r.firstAidGiven ? (r.firstAidDetails || "Yes") : "No"}</td>
      <td>${r.hospitalAttended ? "Yes" : "No"}</td>
      <td style="white-space:nowrap">${r.timeLostDays ? r.timeLostDays + " day(s)" : "—"}</td>
      <td style="${r.riddorReportable && !r.riddorReference ? "color:#dc2626;font-weight:700" : ""}">${r.riddorReportable ? (r.riddorReference ? r.riddorReference : "PENDING") : "No"}</td>
      <td>${r.signedOffBy || "—"}</td>
    </tr>`).join("");
    const tableHtml = `<table><thead><tr>
      <th>Date</th><th>Person</th><th>Type</th><th>Location</th><th>Incident</th>
      <th>Injury</th><th>Body Part</th><th>First Aid</th><th>Hospital</th>
      <th>Time Lost</th><th>RIDDOR</th><th>Signed Off</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: "Accident Book Register",
      subtitle: "UK Health & Safety Law · RIDDOR 2013",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      redTractorId: (farm as any)?.redTractorId ?? undefined,
      recordCount: records.length,
      recordLabel: "entry",
      extraMeta: `Total days lost: ${totalTimeLost > 0 ? totalTimeLost.toFixed(1) : "0"}`,
      tableHtml,
      footerNote: "Maintained under UK Health & Safety law and RIDDOR 2013. Keep securely — access restricted to authorised persons.",
    });
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 8px" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={22} style={{ color: "#2563eb" }} /> Accident Book
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>
              Maintained under UK Health &amp; Safety law and RIDDOR 2013. All workplace incidents, injuries and near misses.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!farmId}><Printer size={14} className="mr-2" /> Print Register</Button>
            <Button size="sm" onClick={openAdd} disabled={!farmId}><Plus size={14} className="mr-1" /> Add Entry</Button>
          </div>
        </div>

        {/* RIDDOR alert banner */}
        {pendingRiddor > 0 && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, marginBottom: 20 }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1, color: "#dc2626" }} />
            <div>
              <p style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.9375rem" }}>{pendingRiddor} RIDDOR reportable incident{pendingRiddor > 1 ? "s" : ""} awaiting HSE report</p>
              <p style={{ color: "#7f1d1d", fontSize: "0.8125rem", marginTop: 2 }}>
                Report online at <strong>riddor.hse.gov.uk</strong> — over-7-day injuries must be reported within 15 days; specified injuries, dangerous occurrences and deaths within 10 days.
              </p>
            </div>
          </div>
        )}

        {!farmId ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1, color: "#d97706" }} />
            <p style={{ fontSize: "0.875rem", color: "#92400e" }}>Select a farm from the sidebar to view this farm's Accident Book.</p>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            {records.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Total Entries", value: String(records.length), bg: "#f9fafb", border: "#e5e7eb", color: "#111827", clickable: false },
                  { label: "RIDDOR Reportable", value: String(records.filter(r => r.riddorReportable).length), bg: "#fef2f2", border: "#fecaca", color: "#dc2626", clickable: false },
                  { label: "Awaiting HSE Report", value: String(pendingRiddor), bg: pendingRiddor > 0 ? "#fef2f2" : "#f0fdf4", border: pendingRiddor > 0 ? (allYears && filter === "riddor-pending" ? "#dc2626" : "#fca5a5") : "#bbf7d0", color: pendingRiddor > 0 ? "#dc2626" : "#16a34a", clickable: pendingRiddor > 0 },
                  { label: "Total Days Lost", value: totalTimeLost > 0 ? totalTimeLost.toFixed(1) : "0", bg: "#fffbeb", border: "#fde68a", color: "#92400e", clickable: false },
                ].map(s => {
                  const isActive = s.label === "Awaiting HSE Report" && allYears && filter === "riddor-pending";
                  return (
                    <div key={s.label}
                      onClick={s.clickable ? () => { if (isActive) { setAllYears(false); setFilter("all"); } else { setFilter("riddor-pending"); setAllYears(true); } } : undefined}
                      style={{ background: s.bg, border: isActive ? `2px solid #dc2626` : `1px solid ${s.border}`, borderRadius: 8, padding: isActive ? "11px 15px" : "12px 16px", cursor: s.clickable ? "pointer" : "default", boxShadow: isActive ? "0 0 0 3px #fee2e2" : undefined, transition: "box-shadow 0.15s" }}>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>{s.label}</p>
                      <p style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</p>
                      {s.clickable && <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }}>{isActive ? "All years — click to clear" : "Click to filter"}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* All-years banner */}
            {allYears && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 12, fontSize: "0.875rem", color: "#92400e" }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Showing all years — RIDDOR Pending ({filtered.length} record{filtered.length !== 1 ? "s" : ""})</span>
                <button onClick={() => { setAllYears(false); setFilter("all"); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#92400e", fontWeight: 600, fontSize: "0.875rem", padding: "0 4px" }}>✕ Clear</button>
              </div>
            )}

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              {([
                ["all", `All (${records.length})`],
                ["riddor-pending", `RIDDOR Pending (${records.filter(r => r.riddorReportable && !r.riddorReference).length})`],
                ["riddor-reported", `RIDDOR Reported (${records.filter(r => r.riddorReportable && !!r.riddorReference).length})`],
                ["unsigned", `Awaiting Sign-Off (${records.filter(r => !r.signedOffBy).length})`],
              ] as const).map(([key, label]) => (
                <button key={key} onClick={() => { setFilter(key); if (key !== "riddor-pending") setAllYears(false); }}
                  style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.8125rem", cursor: "pointer", fontWeight: filter === key ? 600 : 400,
                    background: filter === key ? "#111827" : "#f3f4f6", color: filter === key ? "#fff" : "#374151",
                    border: "1px solid " + (filter === key ? "#111827" : "#e5e7eb") }}>
                  {label}
                </button>
              ))}
              <div style={{ marginLeft: "auto" }}><CropYearSelector value={cropYear} onChange={v => { setCropYear(v); setAllYears(false); }} /></div>
            </div>

            {/* Records */}
            {q.isLoading ? (
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
                <BookOpen size={40} style={{ margin: "0 auto 10px", opacity: 0.2 }} />
                <p style={{ fontWeight: 600, color: "#374151", fontSize: "1rem" }}>
                  {records.length === 0 ? "Accident Book is empty" : "No records match this filter"}
                </p>
                {records.length === 0 && (
                  <>
                    <p style={{ fontSize: "0.875rem", maxWidth: 420, margin: "8px auto 0" }}>
                      All workplace injuries, near misses and dangerous occurrences must be recorded here. UK employers are legally required to maintain this register.
                    </p>
                    <Button size="sm" style={{ marginTop: 20 }} onClick={openAdd}><Plus size={13} className="mr-1" /> Add first entry</Button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {filtered.map(record => (
                  <RecordCard key={record.id} record={record} farmId={farmId!} onEdit={() => openEdit(record)} onDelete={() => setDeleteId(record.id)} onRaiseTask={() => setRaiseTaskFor(record)} onInvestigate={() => setInvestigateRecord(record)} onCorrectiveAction={() => setCorrectiveActionRecord(record)} onSignOff={() => setSignOffRecord(record)} />
                ))}
              </div>
            )}

            {/* Data protection note */}
            {records.length > 0 && (
              <p style={{ marginTop: 24, fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.5 }}>
                <strong>Data protection:</strong> Accident records contain personal data. Access is restricted to authorised farm managers. Records should be retained for at least 3 years (RIDDOR) or for the duration of employment plus 40 years where industrial disease may be relevant.
              </p>
            )}
          </>
        )}

        {/* Add / Edit Dialog */}
        {addOpen && (
          <Dialog open onOpenChange={o => { if (!o) { setAddOpen(false); setEditItem(null); } }}>
            <DialogContent style={{ maxWidth: 640, maxHeight: "88vh", overflowY: "auto" }}>
              <DialogHeader>
                <DialogTitle>{editItem ? "Edit Accident Book Entry" : "New Accident Book Entry"}</DialogTitle>
              </DialogHeader>

              <div style={{ display: "grid", gap: 16 }}>
                {/* Section: Incident */}
                <SectionHeading>Incident Details</SectionHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><Label>Date of Incident *</Label><Input type="date" className="mt-1" value={form.incidentDate} onChange={e => setForm(f => ({ ...f, incidentDate: e.target.value }))} /></div>
                  <div><Label>Time (if known)</Label><Input type="time" className="mt-1" value={form.incidentTime} onChange={e => setForm(f => ({ ...f, incidentTime: e.target.value }))} /></div>
                </div>
                <div><Label>Location on Farm *</Label><Input className="mt-1" value={form.incidentLocation} onChange={e => setForm(f => ({ ...f, incidentLocation: e.target.value }))} placeholder="e.g. Grain store, Top field, Workshop" /></div>
                <div><Label>Description of What Happened *</Label><Textarea className="mt-1" rows={3} value={form.natureOfIncident} onChange={e => setForm(f => ({ ...f, natureOfIncident: e.target.value }))} placeholder="Describe how the incident occurred, what activity was taking place, and any equipment involved." /></div>

                {/* Section: Person */}
                <SectionHeading>Person Involved</SectionHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><Label>Full Name *</Label><Input className="mt-1" value={form.personName} onChange={e => setForm(f => ({ ...f, personName: e.target.value }))} placeholder="Full name" /></div>
                  <div>
                    <Label>Person Type *</Label>
                    <Select value={form.personType} onValueChange={v => setForm(f => ({ ...f, personType: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{PERSON_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Job Title / Role</Label><Input className="mt-1" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} placeholder="e.g. Tractor driver, Farm manager, Contractor" /></div>

                {/* Section: Injury */}
                <SectionHeading>Injury &amp; Treatment</SectionHeading>
                <div><Label>Nature of Injury</Label><Input className="mt-1" value={form.natureOfInjury} onChange={e => setForm(f => ({ ...f, natureOfInjury: e.target.value }))} placeholder="e.g. Laceration, fracture, sprain, bruising, chemical burn" /></div>
                <div>
                  <Label>Body Part Affected</Label>
                  <OtherSelect
                    className="mt-1"
                    options={BODY_PARTS}
                    value={form.bodyPartAffected}
                    onValueChange={v => setForm(f => ({ ...f, bodyPartAffected: v }))}
                    placeholder="Select body part…"
                    specifyPlaceholder="Describe the affected body part…"
                  />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <input type="checkbox" id="firstAidGiven" checked={form.firstAidGiven} onChange={e => setForm(f => ({ ...f, firstAidGiven: e.target.checked }))} style={{ width: 15, height: 15 }} />
                    <label htmlFor="firstAidGiven" style={{ fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>First Aid Was Given</label>
                  </div>
                  {form.firstAidGiven && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingLeft: 24 }}>
                      <div><Label>First Aid Details</Label><Input className="mt-1" value={form.firstAidDetails} onChange={e => setForm(f => ({ ...f, firstAidDetails: e.target.value }))} placeholder="e.g. Wound cleaned and dressed" /></div>
                      <div><Label>First Aider Name</Label><Input className="mt-1" value={form.firstAiderName} onChange={e => setForm(f => ({ ...f, firstAiderName: e.target.value }))} /></div>
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <input type="checkbox" id="hospitalAttended" checked={form.hospitalAttended} onChange={e => setForm(f => ({ ...f, hospitalAttended: e.target.checked }))} style={{ width: 15, height: 15 }} />
                    <label htmlFor="hospitalAttended" style={{ fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>Hospital / GP Attended</label>
                  </div>
                  {form.hospitalAttended && (
                    <div style={{ paddingLeft: 24 }}>
                      <Label>Hospital / Surgery Name</Label><Input className="mt-1" value={form.hospitalName} onChange={e => setForm(f => ({ ...f, hospitalName: e.target.value }))} placeholder="e.g. Morriston Hospital A&E" />
                    </div>
                  )}
                </div>

                <div><Label>Days Away from Work</Label><Input type="number" min="0" step="0.5" className="mt-1" value={form.timeLostDays} onChange={e => setForm(f => ({ ...f, timeLostDays: e.target.value }))} placeholder="0 (none), 0.5, 1, 7…" /></div>

                {/* Section: RIDDOR */}
                <div style={{ padding: "12px 14px", background: form.riddorReportable ? "#fef2f2" : "#f9fafb", border: `1px solid ${form.riddorReportable ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: form.riddorReportable ? 12 : 0 }}>
                    <input type="checkbox" id="riddorReportable" checked={form.riddorReportable} onChange={e => setForm(f => ({ ...f, riddorReportable: e.target.checked }))} style={{ width: 15, height: 15, marginTop: 2 }} />
                    <label htmlFor="riddorReportable" style={{ cursor: "pointer" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: form.riddorReportable ? "#991b1b" : "#111827" }}>RIDDOR Reportable</span>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 1 }}>Tick if this is a specified injury, over-7-day absence, dangerous occurrence or occupational disease that must be reported to the HSE.</p>
                    </label>
                  </div>
                  {form.riddorReportable && (
                    <div style={{ display: "grid", gap: 10, paddingLeft: 24 }}>
                      <div>
                        <Label>RIDDOR Category *</Label>
                        <Select value={form.riddorCategory} onValueChange={v => setForm(f => ({ ...f, riddorCategory: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select category…" /></SelectTrigger>
                          <SelectContent>{RIDDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><Label>HSE Reference Number</Label><Input className="mt-1" value={form.riddorReference} onChange={e => setForm(f => ({ ...f, riddorReference: e.target.value }))} placeholder="From riddor.hse.gov.uk" /></div>
                        <div><Label>Date Reported to HSE</Label><Input type="date" className="mt-1" value={form.riddorReportedDate} onChange={e => setForm(f => ({ ...f, riddorReportedDate: e.target.value }))} /></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Follow-up */}
                <SectionHeading>Follow-Up</SectionHeading>
                <div><Label>Witnesses</Label><Input className="mt-1" value={form.witnesses} onChange={e => setForm(f => ({ ...f, witnesses: e.target.value }))} placeholder="Names of any witnesses" /></div>
                <div><Label>Additional Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

                {/* Corrective action / sign-off only in edit mode — use stage buttons for new records */}
                {editItem && (
                  <>
                    <SectionHeading>Corrective Action &amp; Sign-Off</SectionHeading>
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: -8 }}>Use the "Investigate", "Record Action" and "Sign Off" buttons on the record card to progress through stages. Edit these fields here only to correct existing data.</p>
                    <div><Label>Corrective Action Taken</Label><Textarea className="mt-1" rows={2} value={form.correctiveAction} onChange={e => setForm(f => ({ ...f, correctiveAction: e.target.value }))} placeholder="What steps were taken to prevent recurrence?" /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div><Label>Signed Off By (Manager)</Label><Input className="mt-1" value={form.signedOffBy} onChange={e => setForm(f => ({ ...f, signedOffBy: e.target.value }))} placeholder="Manager's name" /></div>
                      <div><Label>Sign-Off Date</Label><Input type="date" className="mt-1" value={form.signOffDate} onChange={e => setForm(f => ({ ...f, signOffDate: e.target.value }))} /></div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
                <Button
                  disabled={!form.incidentDate || !form.incidentLocation.trim() || !form.personName.trim() || !form.natureOfIncident.trim() || createMut.isPending || updateMut.isPending}
                  onClick={handleSave}
                >
                  {editItem ? "Update Entry" : "Add to Accident Book"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {investigateRecord && <InvestigateDialog farmId={farmId!} record={investigateRecord} onClose={() => setInvestigateRecord(null)} />}
        {correctiveActionRecord && <RecordCorrectiveActionDialog farmId={farmId!} record={correctiveActionRecord} onClose={() => setCorrectiveActionRecord(null)} />}
        {signOffRecord && <SignOffDialog farmId={farmId!} record={signOffRecord} onClose={() => setSignOffRecord(null)} />}

        <RaiseTaskDialog
          farmId={farmId!}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={raiseTaskFor ? `${raiseTaskFor.riddorReportable && !raiseTaskFor.riddorReference ? "RIDDOR Report" : "Corrective Action"} — ${raiseTaskFor.personName} (${raiseTaskFor.incidentDate ? new Date(raiseTaskFor.incidentDate).toLocaleDateString("en-GB") : ""})` : ""}
          defaultDescription={raiseTaskFor?.correctiveAction || ""}
          module="health_safety"
        />

        {/* Delete confirm */}
        {deleteId !== null && (
          <Dialog open onOpenChange={() => setDeleteId(null)}>
            <DialogContent style={{ maxWidth: 380 }}>
              <DialogHeader><DialogTitle>Delete this entry?</DialogTitle></DialogHeader>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                This will permanently remove this accident record. If this incident was RIDDOR reportable, the HSE submission itself is not affected.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: "1px solid #e5e7eb" }}>
      <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</span>
    </div>
  );
}
