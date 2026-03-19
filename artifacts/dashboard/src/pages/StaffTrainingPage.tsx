import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Printer, GraduationCap, Award, AlertTriangle } from "lucide-react";

type Tab = "training" | "certificates";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function expiryBadge(expiry: string | null | undefined) {
  if (!expiry) return null;
  const now = new Date();
  const exp = new Date(expiry);
  const daysLeft = Math.floor((exp.getTime() - now.getTime()) / 86400000);
  if (daysLeft < 0) return <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>Expired</Badge>;
  if (daysLeft <= 60) return <Badge style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>Expires {fmt(expiry)}</Badge>;
  return <Badge style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>Valid · {fmt(expiry)}</Badge>;
}

interface TrainingRecord {
  id: number;
  userId: string;
  trainingTitle: string;
  trainingProvider: string | null;
  trainingDate: string;
  expiryDate: string | null;
  competencyAchieved: string | null;
  assessorName: string | null;
  notes: string | null;
}

interface CertificateRecord {
  id: number;
  userId: string;
  certificateType: string;
  certificateNumber: string | null;
  issuer: string | null;
  issueDate: string;
  expiryDate: string | null;
  notes: string | null;
}

const CERT_TYPES = [
  "PA1 — Safe use of pesticides",
  "PA2 — Ground crop sprayers",
  "PA3 — Hand-held applicators",
  "PA4 — Broadcast air-assisted applicators",
  "PA6 — Aerial application",
  "PA6AW — Aerial application (UAV/drone)",
  "BASIS Certificate in Agronomy",
  "FACTS — Fertiliser Adviser",
  "City & Guilds Level 2 Agriculture",
  "City & Guilds Level 3 Agriculture",
  "Safe use of rodenticides",
  "Tractor & Machinery Safety",
  "First Aid at Work",
  "Food Hygiene Certificate",
  "Manual Handling",
  "Other",
];

function TrainingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TrainingRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const empty = { userId: "", trainingTitle: "", trainingProvider: "", trainingDate: "", expiryDate: "", competencyAchieved: "", assessorName: "", notes: "" };
  const [form, setForm] = useState({ ...empty });

  const q = useQuery<{ records: TrainingRecord[] }>({
    queryKey: ["training-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records = (q.data?.records ?? []).filter(r =>
    !search || r.trainingTitle.toLowerCase().includes(search.toLowerCase()) || (r.trainingProvider ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/training`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Training record added" }); qc.invalidateQueries({ queryKey: ["training-records", farmId] }); setAddOpen(false); setForm({ ...empty }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/training/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Training record updated" }); qc.invalidateQueries({ queryKey: ["training-records", farmId] }); setEditItem(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/training/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Record deleted" }); qc.invalidateQueries({ queryKey: ["training-records", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: TrainingRecord) {
    setEditItem(r);
    setForm({
      userId: r.userId ?? "",
      trainingTitle: r.trainingTitle,
      trainingProvider: r.trainingProvider ?? "",
      trainingDate: r.trainingDate ? r.trainingDate.slice(0, 10) : "",
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      competencyAchieved: r.competencyAchieved ?? "",
      assessorName: r.assessorName ?? "",
      notes: r.notes ?? "",
    });
  }

  function handleSubmit(isEdit: boolean) {
    const body = { ...form };
    if (isEdit && editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }

  const expiredCount = records.filter(r => r.expiryDate && new Date(r.expiryDate) < new Date()).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <Input placeholder="Search training records…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <div style={{ flex: 1 }} />
        {expiredCount > 0 && (
          <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={13} /> {expiredCount} expired
          </Badge>
        )}
        <Button size="sm" onClick={() => { setForm({ ...empty }); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" /> Add Training Record
        </Button>
      </div>

      {q.isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
          <GraduationCap size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No training records</p>
          <p style={{ fontSize: "0.875rem" }}>Log training courses, safety briefings, and competency assessments for all farm operators.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Staff Member</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Training</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Provider</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Date</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Expiry</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Competency</th>
                <th style={{ width: 100 }} />
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.userId || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{r.trainingTitle}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.trainingProvider || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{fmt(r.trainingDate)}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{r.expiryDate ? expiryBadge(r.expiryDate) : <span style={{ color: "#9ca3af" }}>No expiry</span>}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8125rem" }}>{r.competencyAchieved || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => openEdit(r)}>Edit</Button>
                      <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#dc2626" }} onClick={() => setDeleteId(r.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {[addOpen, !!editItem].includes(true) && (
        <Dialog open={addOpen || !!editItem} onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); } }}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader><DialogTitle>{editItem ? "Edit Training Record" : "Add Training Record"}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Label>Staff Name / ID *</Label><Input className="mt-1" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} placeholder="e.g. John Smith" /></div>
              <div><Label>Training Title *</Label><Input className="mt-1" value={form.trainingTitle} onChange={e => setForm(f => ({ ...f, trainingTitle: e.target.value }))} placeholder="e.g. PA1 Safe Use of Pesticides" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label>Training Date *</Label><Input type="date" className="mt-1" value={form.trainingDate} onChange={e => setForm(f => ({ ...f, trainingDate: e.target.value }))} /></div>
                <div><Label>Expiry Date</Label><Input type="date" className="mt-1" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
              </div>
              <div><Label>Training Provider</Label><Input className="mt-1" value={form.trainingProvider} onChange={e => setForm(f => ({ ...f, trainingProvider: e.target.value }))} placeholder="e.g. Lantra Awards" /></div>
              <div><Label>Competency Achieved</Label><Input className="mt-1" value={form.competencyAchieved} onChange={e => setForm(f => ({ ...f, competencyAchieved: e.target.value }))} placeholder="e.g. Safe pesticide handling" /></div>
              <div><Label>Assessor Name</Label><Input className="mt-1" value={form.assessorName} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
              <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
              <Button onClick={() => handleSubmit(!!editItem)} disabled={!form.trainingTitle || !form.trainingDate || !form.userId}>Save Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Training Record</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Are you sure you want to delete this training record? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CertificatesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CertificateRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const empty = { userId: "", certificateType: "", certificateNumber: "", issuer: "", issueDate: "", expiryDate: "", notes: "" };
  const [form, setForm] = useState({ ...empty });

  const q = useQuery<{ records: CertificateRecord[] }>({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records = q.data?.records ?? [];

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/certificates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Certificate added" }); qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }); setAddOpen(false); setForm({ ...empty }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/certificates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Certificate updated" }); qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }); setEditItem(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/certificates/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Certificate deleted" }); qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: CertificateRecord) {
    setEditItem(r);
    setForm({
      userId: r.userId ?? "",
      certificateType: r.certificateType,
      certificateNumber: r.certificateNumber ?? "",
      issuer: r.issuer ?? "",
      issueDate: r.issueDate ? r.issueDate.slice(0, 10) : "",
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      notes: r.notes ?? "",
    });
  }

  const expiredCount = records.filter(r => r.expiryDate && new Date(r.expiryDate) < new Date()).length;
  const expiringCount = records.filter(r => {
    if (!r.expiryDate) return false;
    const days = Math.floor((new Date(r.expiryDate).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 60;
  }).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <div style={{ flex: 1 }} />
        {expiredCount > 0 && (
          <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={13} /> {expiredCount} expired
          </Badge>
        )}
        {expiringCount > 0 && (
          <Badge style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 4 }}>
            {expiringCount} expiring soon
          </Badge>
        )}
        <Button size="sm" onClick={() => { setForm({ ...empty }); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" /> Add Certificate
        </Button>
      </div>

      {q.isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
          <Award size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No certificates recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Record PA1, PA2, PA6, BASIS, FACTS, and other professional certificates here. Inspectors will ask to see these.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Staff Member</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Certificate Type</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Cert. No.</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Issuer</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Issued</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>Expiry / Status</th>
                <th style={{ width: 100 }} />
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.userId || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.certificateType}</td>
                  <td style={{ padding: "0.625rem 0.75rem", fontFamily: "monospace", fontSize: "0.8125rem", color: "#374151" }}>{r.certificateNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.issuer || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{fmt(r.issueDate)}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{r.expiryDate ? expiryBadge(r.expiryDate) : <Badge style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}>No expiry</Badge>}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => openEdit(r)}>Edit</Button>
                      <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#dc2626" }} onClick={() => setDeleteId(r.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen || !!editItem} onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{editItem ? "Edit Certificate" : "Add Certificate"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div><Label>Staff Name / ID *</Label><Input className="mt-1" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} placeholder="e.g. John Smith" /></div>
            <div>
              <Label>Certificate Type *</Label>
              <Select value={form.certificateType} onValueChange={v => setForm(f => ({ ...f, certificateType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {CERT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number</Label><Input className="mt-1" value={form.certificateNumber} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} placeholder="e.g. PA1-123456" /></div>
            <div><Label>Issuing Body</Label><Input className="mt-1" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} placeholder="e.g. Lantra Awards, BASIS, FACTS" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Issue Date *</Label><Input type="date" className="mt-1" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" className="mt-1" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
            <Button onClick={() => {
              const body = { ...form };
              if (editItem) updateMut.mutate({ id: editItem.id, body });
              else createMut.mutate(body);
            }} disabled={!form.certificateType || !form.issueDate || !form.userId}>Save Certificate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Certificate</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function printTrainingRegister(
  trainingRecords: TrainingRecord[],
  certificates: CertificateRecord[],
  farmName: string,
) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";

  const trainingRows = trainingRecords.map(r => {
    const expired = r.expiryDate && new Date(r.expiryDate) < new Date();
    const expTxt = r.expiryDate
      ? `<span style="color:${expired ? "#dc2626" : "#16a34a"}">${fmtD(r.expiryDate)}${expired ? " ⚠ EXPIRED" : ""}</span>`
      : "—";
    return `<tr><td>${r.userId || "—"}</td><td>${r.trainingTitle}</td><td>${r.trainingProvider || "—"}</td><td>${fmtD(r.trainingDate)}</td><td>${expTxt}</td><td>${r.competencyAchieved || "—"}</td></tr>`;
  }).join("");

  const certRows = certificates.map(r => {
    const expired = r.expiryDate && new Date(r.expiryDate) < new Date();
    const expTxt = r.expiryDate
      ? `<span style="color:${expired ? "#dc2626" : "#16a34a"}">${fmtD(r.expiryDate)}${expired ? " ⚠ EXPIRED" : ""}</span>`
      : "No expiry";
    return `<tr><td>${r.userId || "—"}</td><td>${r.certificateType}</td><td style="font-family:monospace">${r.certificateNumber || "—"}</td><td>${r.issuer || "—"}</td><td>${fmtD(r.issueDate)}</td><td>${expTxt}</td></tr>`;
  }).join("");

  const html = `<html><head><title>Staff Training &amp; Qualifications Register</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}
h1{font-size:14px;margin:0 0 2px}h2{font-size:12px;margin:18px 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
p{font-size:10px;color:#555;margin:1px 0}
table{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:16px}
th{background:#f0fdf4;font-weight:600;text-align:left;border:1px solid #d1d5db;padding:5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:.04em}
td{border:1px solid #e5e7eb;padding:5px 8px}tr:nth-child(even) td{background:#fafafa}
.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #16a34a;padding-bottom:12px;margin-bottom:18px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:24px}
.sig{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig-box{border-top:1px solid #000;padding-top:6px;font-size:10px}
@media print{@page{margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p>Staff Training &amp; Qualifications Register</p></div>
<div class="hdr-r"><b>Training Register</b>Printed: ${today}<br>${trainingRecords.length} training records · ${certificates.length} certificates</div></div>

<h2>Training Records</h2>
${trainingRecords.length === 0
    ? '<p style="color:#9ca3af;font-style:italic">No training records on file.</p>'
    : `<table><thead><tr><th>Staff</th><th>Training Title</th><th>Provider</th><th>Date</th><th>Expiry</th><th>Competency</th></tr></thead><tbody>${trainingRows}</tbody></table>`}

<h2>Operator Certificates &amp; Qualifications</h2>
<p style="margin-bottom:8px;font-style:italic">Includes PA1, PA2, PA3, PA6, BASIS, FACTS, and other required operator certificates.</p>
${certificates.length === 0
    ? '<p style="color:#9ca3af;font-style:italic">No certificates on file.</p>'
    : `<table><thead><tr><th>Staff</th><th>Certificate Type</th><th>Cert. No.</th><th>Issuer</th><th>Issue Date</th><th>Expiry</th></tr></thead><tbody>${certRows}</tbody></table>`}

<div class="sig">
<div class="sig-box">Farm Manager Signature<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
<div class="sig-box">Red Tractor Assessor<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
</div>
<div class="footer">Staff Training &amp; Qualifications Register — Red Tractor Combinable Crops &amp; Sugar Beet compliance record. Retain for minimum 3 years and make available at audit. BDE Farm Trac · ${today}</div>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

export default function StaffTrainingPage() {
  const { currentFarm } = useAppStore();
  const farmId = currentFarm?.id;
  const [tab, setTab] = useState<Tab>("training");

  const trainingQ = useQuery<{ records: TrainingRecord[] }>({
    queryKey: ["training-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training`).then(r => r.json()),
    enabled: !!farmId,
  });
  const certsQ = useQuery<{ records: CertificateRecord[] }>({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then(r => r.json()),
    enabled: !!farmId,
  });

  const trainingRecords = trainingQ.data?.records ?? [];
  const certificates = certsQ.data?.records ?? [];
  const farmName = currentFarm?.name ?? "Farm";

  return (
    <AppLayout>
      <div style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <GraduationCap size={22} style={{ color: "#16a34a" }} /> Staff Training Register
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: 4 }}>
              Training records, operator certificates, and qualifications — required for Red Tractor Combinable Crops compliance.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printTrainingRegister(trainingRecords, certificates, farmName)}
            disabled={trainingRecords.length === 0 && certificates.length === 0}
          >
            <Printer size={14} className="mr-2" /> Print Register
          </Button>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "training"} onClick={() => setTab("training")}>
            Training Records {trainingRecords.length > 0 && `(${trainingRecords.length})`}
          </TabButton>
          <TabButton active={tab === "certificates"} onClick={() => setTab("certificates")}>
            Certificates &amp; Qualifications {certificates.length > 0 && `(${certificates.length})`}
          </TabButton>
        </TabBar>

        {!farmId ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>Please select a farm to view training records.</div>
        ) : tab === "training" ? (
          <TrainingTab farmId={farmId} />
        ) : (
          <CertificatesTab farmId={farmId} />
        )}
      </div>
    </AppLayout>
  );
}
