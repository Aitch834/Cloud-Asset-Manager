import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Plus, Printer, Trash2, Pencil, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, AlertCircle,
} from "lucide-react";

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
  createdAt: string;
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

function RecordCard({ record, onEdit, onDelete }: { record: AccidentRecord; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ border: "1px solid " + (record.riddorReportable && !record.riddorReference ? "#fca5a5" : "#e5e7eb"), borderRadius: 10, background: "#fff", overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 16px", gap: 12, cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.9375rem" }}>
              {fmt(record.incidentDate)}{record.incidentTime ? ` at ${record.incidentTime}` : ""}
            </span>
            <RiddorBadge record={record} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{record.personName} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({record.personType}{record.jobTitle ? ` — ${record.jobTitle}` : ""})</span></p>
          <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }}>
            <strong>Location:</strong> {record.incidentLocation} &nbsp;·&nbsp;
            <strong>Incident:</strong> {record.natureOfIncident.length > 90 ? record.natureOfIncident.slice(0, 90) + "…" : record.natureOfIncident}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#374151", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
            <Pencil size={12} /> Edit
          </button>
          <button onClick={onDelete} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer", padding: "4px 8px", color: "#dc2626", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
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
          <DetailRow label="Corrective Action Taken" value={record.correctiveAction} span />
          <DetailRow label="Signed Off By" value={record.signedOffBy ? `${record.signedOffBy}${record.signOffDate ? ` on ${fmt(record.signOffDate)}` : ""}` : null} />
          <DetailRow label="Notes" value={record.notes} span />
        </div>
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

export default function AccidentBookPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

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
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });

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
    if (filter === "riddor-pending") return r.riddorReportable && !r.riddorReference;
    if (filter === "riddor-reported") return r.riddorReportable && !!r.riddorReference;
    if (filter === "unsigned") return !r.signedOffBy;
    return true;
  });

  const pendingRiddor = records.filter(r => r.riddorReportable && !r.riddorReference).length;
  const totalTimeLost = records.reduce((s, r) => s + (r.timeLostDays ? parseFloat(r.timeLostDays) || 0 : 0), 0);

  function handlePrint() {
    const rows = records.map(r => `<tr>
      <td>${r.incidentDate}</td>
      <td>${r.personName}</td>
      <td>${r.personType}</td>
      <td>${r.incidentLocation}</td>
      <td>${r.natureOfIncident}</td>
      <td>${r.natureOfInjury || "—"}</td>
      <td>${r.bodyPartAffected || "—"}</td>
      <td>${r.firstAidGiven ? (r.firstAidDetails || "Yes") : "No"}</td>
      <td>${r.hospitalAttended ? "Yes" : "No"}</td>
      <td>${r.timeLostDays ? r.timeLostDays + " day(s)" : "—"}</td>
      <td>${r.riddorReportable ? (r.riddorReference ? "Reported — " + r.riddorReference : "YES — PENDING") : "No"}</td>
      <td>${r.signedOffBy || "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Accident Book — ${farmData?.record?.name ?? ""}</title>
    <style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h2{font-size:15px;margin-bottom:4px}
    p{font-size:11px;color:#555;margin:2px 0}
    table{width:100%;border-collapse:collapse;margin-top:16px;page-break-inside:auto}
    th,td{border:1px solid #bbb;padding:5px 7px;vertical-align:top}
    th{background:#f0f0f0;font-weight:700;font-size:9px;text-transform:uppercase}
    .riddor-pending{color:#dc2626;font-weight:700}
    @media print{.no-print{display:none}}</style></head>
    <body>
    <h2>Accident Book Register</h2>
    <p><strong>Farm:</strong> ${farmData?.record?.name ?? "—"}${farmData?.record?.cphNumber ? " &nbsp;|&nbsp; <strong>CPH:</strong> " + farmData.record.cphNumber : ""}</p>
    <p>Printed: ${new Date().toLocaleDateString("en-GB")} &nbsp;|&nbsp; Total entries: ${records.length} &nbsp;|&nbsp; Total days lost: ${totalTimeLost > 0 ? totalTimeLost.toFixed(1) : "0"}</p>
    <p style="margin-top:6px;color:#666;font-size:9px">This register is maintained in accordance with UK Health &amp; Safety law and the Reporting of Injuries, Diseases and Dangerous Occurrences Regulations 2013 (RIDDOR). Records are kept securely and access is restricted to authorised persons in accordance with data protection obligations.</p>
    <table>
      <thead><tr>
        <th>Date</th><th>Person</th><th>Type</th><th>Location</th><th>Incident Description</th>
        <th>Nature of Injury</th><th>Body Part</th><th>First Aid</th><th>Hospital</th>
        <th>Time Lost</th><th>RIDDOR</th><th>Signed Off By</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 400); }
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
                  { label: "Total Entries", value: String(records.length), bg: "#f9fafb", border: "#e5e7eb", color: "#111827" },
                  { label: "RIDDOR Reportable", value: String(records.filter(r => r.riddorReportable).length), bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
                  { label: "Awaiting HSE Report", value: String(pendingRiddor), bg: pendingRiddor > 0 ? "#fef2f2" : "#f0fdf4", border: pendingRiddor > 0 ? "#fca5a5" : "#bbf7d0", color: pendingRiddor > 0 ? "#dc2626" : "#16a34a" },
                  { label: "Total Days Lost", value: totalTimeLost > 0 ? totalTimeLost.toFixed(1) : "0", bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "12px 16px" }}>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>{s.label}</p>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {([
                ["all", `All (${records.length})`],
                ["riddor-pending", `RIDDOR Pending (${records.filter(r => r.riddorReportable && !r.riddorReference).length})`],
                ["riddor-reported", `RIDDOR Reported (${records.filter(r => r.riddorReportable && !!r.riddorReference).length})`],
                ["unsigned", `Awaiting Sign-Off (${records.filter(r => !r.signedOffBy).length})`],
              ] as const).map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)}
                  style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.8125rem", cursor: "pointer", fontWeight: filter === key ? 600 : 400,
                    background: filter === key ? "#111827" : "#f3f4f6", color: filter === key ? "#fff" : "#374151",
                    border: "1px solid " + (filter === key ? "#111827" : "#e5e7eb") }}>
                  {label}
                </button>
              ))}
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
                  <RecordCard key={record.id} record={record} onEdit={() => openEdit(record)} onDelete={() => setDeleteId(record.id)} />
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
                  <Select value={form.bodyPartAffected || "__none__"} onValueChange={v => setForm(f => ({ ...f, bodyPartAffected: v === "__none__" ? "" : v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      {BODY_PARTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                <SectionHeading>Follow-Up &amp; Sign-Off</SectionHeading>
                <div><Label>Witnesses</Label><Input className="mt-1" value={form.witnesses} onChange={e => setForm(f => ({ ...f, witnesses: e.target.value }))} placeholder="Names of any witnesses" /></div>
                <div><Label>Corrective Action Taken</Label><Textarea className="mt-1" rows={2} value={form.correctiveAction} onChange={e => setForm(f => ({ ...f, correctiveAction: e.target.value }))} placeholder="What steps were taken to prevent recurrence?" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><Label>Signed Off By (Manager)</Label><Input className="mt-1" value={form.signedOffBy} onChange={e => setForm(f => ({ ...f, signedOffBy: e.target.value }))} placeholder="Manager's name" /></div>
                  <div><Label>Sign-Off Date</Label><Input type="date" className="mt-1" value={form.signOffDate} onChange={e => setForm(f => ({ ...f, signOffDate: e.target.value }))} /></div>
                </div>
                <div><Label>Additional Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
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
