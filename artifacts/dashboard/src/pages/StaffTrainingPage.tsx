import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Printer, GraduationCap, Award, AlertTriangle, File, Trash2, Paperclip, ChevronDown, ChevronUp, Loader2, Upload, RefreshCw, Eye, Pencil } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";

import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { useFarmMembers, memberFullName, type FarmMember } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

type Tab = "training" | "certificates" | "rtw" | "courses";

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
  trainingProviderId: number | null;
  courseId: number | null;
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
  documentPath: string | null;
  documentName: string | null;
}

const CERT_GROUPS: { group: string; certs: string[] }[] = [
  {
    group: "Pesticide Application (NPTC/Lantra)",
    certs: [
      "PA1 — Safe use of pesticides",
      "PA2 — Ground crop sprayers",
      "PA3 — Hand-held applicators",
      "PA4 — Broadcast air-assisted applicators",
      "PA6 — Amenity & hard surfaces",
      "PA6AW — Aerial application (UAV/drone)",
      "Safe use of rodenticides",
    ],
  },
  {
    group: "Livestock Welfare & Husbandry",
    certs: [
      "WASK/WATOK — On-farm Emergency Slaughter Certificate of Competence",
      "Cattle Disbudding & Dehorning (NPTC/Lantra)",
      "Cattle Castration (NPTC/Lantra)",
      "Sheep Castration & Tail Docking (NPTC/Lantra)",
      "Pig Castration & Tail Docking (NPTC/Lantra)",
      "Bovine Artificial Insemination (AI) Certificate",
      "Poultry Emergency Culling Competence",
      "Poultry Catching & Handling (Lantra)",
    ],
  },
  {
    group: "Animal Transport",
    certs: [
      "Animal Transport Certificate — Category 1 (journeys under 8 hours)",
      "Animal Transport Certificate — Category 2 (long journeys, over 8 hours)",
      "Certificate of Competence — Livestock Vehicle Driver",
    ],
  },
  {
    group: "Machinery & Equipment (NPORS/Lantra/RTITB)",
    certs: [
      "Tractor & Machinery Safety",
      "Telehandler Operator (NPORS/Lantra/RTITB)",
      "Counterbalance Fork Lift Truck (FLT)",
      "Reach Fork Lift Truck (FLT)",
      "ATV / Quad Bike Safety Certificate (Lantra)",
      "ROLO — Reversing Operations & Lifting Operations (Banks Person)",
      "Combine Harvester Operation (NPTC/Lantra)",
      "Grain Dryer Operation",
    ],
  },
  {
    group: "Chainsaw (NPTC/Lantra)",
    certs: [
      "CS30 — Chainsaw crosscutting & maintenance",
      "CS31 — Felling small trees",
      "CS32 — Felling medium trees",
      "CS38 — Chainsaw from rope & harness",
    ],
  },
  {
    group: "Health & Safety",
    certs: [
      "First Aid at Work (FAW) — 3 year",
      "Emergency First Aid at Work (EFAW) — 1 year",
      "Fire Warden / Fire Marshal",
      "Manual Handling",
      "Working at Height",
      "Confined Space Entry",
      "Asbestos Awareness",
      "COSHH Awareness",
    ],
  },
  {
    group: "Agronomy & Advisory",
    certs: [
      "BASIS Certificate in Agronomy",
      "BASIS Certificate in Crop Protection",
      "FACTS — Fertiliser Adviser",
      "NRoSO — National Register of Spray Operators (CPD)",
    ],
  },
  {
    group: "Veterinary & Medicines",
    certs: [
      "AMTRA SQP — Suitably Qualified Person (veterinary medicines)",
      "Responsible for Medicines (named person)",
      "BVetMed / MRCVS — Veterinary Surgeon",
    ],
  },
  {
    group: "Food, Hygiene & Environment",
    certs: [
      "Food Hygiene — Level 2 Award",
      "Food Hygiene — Level 3 Award",
      "Food Safety in Manufacturing (Level 3)",
      "Water Hygiene Awareness",
    ],
  },
  {
    group: "Formal Qualifications",
    certs: [
      "City & Guilds Level 2 Agriculture",
      "City & Guilds Level 3 Agriculture",
      "BTEC Level 3 Agriculture",
      "HND Agriculture",
      "BSc Agriculture / Land Management",
      "NVQ Level 2 / 3 Agriculture",
    ],
  },
  {
    group: "Other",
    certs: ["Other — see notes"],
  },
];

const ALL_CERT_TYPES = CERT_GROUPS.flatMap(g => g.certs);

const COMPLIANCE_FLAGS: { label: string; match: string; detail: string; severity: "error" | "warning" }[] = [
  { label: "WASK/WATOK (Emergency Slaughter)", match: "WASK/WATOK", detail: "Legally required — any farm with livestock must have at least one person holding a Certificate of Competence for on-farm emergency slaughter.", severity: "error" },
  { label: "Animal Transport Certificate Cat. 1", match: "Animal Transport Certificate — Category 1", detail: "Required by law for anyone transporting live animals on journeys over 65km.", severity: "error" },
  { label: "First Aid at Work or EFAW", match: "First Aid", detail: "First aid coverage is required under the Health & Safety (First-Aid) Regulations 1981 for any farm with employees.", severity: "warning" },
  { label: "PA1 — Safe use of pesticides", match: "PA1 —", detail: "Any person using or supervising the use of professional pesticide products must hold at minimum a PA1 certificate.", severity: "warning" },
];

function TrainingTab({ farmId, staffNames, staffLoading, defaultMember }: { farmId: number; staffNames: string[]; staffLoading?: boolean; defaultMember?: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TrainingRecord | null>(null);
  const [viewItem, setViewItem] = useState<TrainingRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState(defaultMember ?? "");
  const [cropYear, setCropYear] = useState(currentCropYear());

  const membersQ = useFarmMembers(farmId);
  const memberNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (membersQ.data?.members ?? []).forEach(m => {
      const full = memberFullName(m);
      map.set(String(m.id), full);
      map.set(full, full);
      if (m.linkedUserId) map.set(m.linkedUserId, full);
    });
    return map;
  }, [membersQ.data]);
  const resolveStaffName = (uid: string) => memberNameMap.get(String(uid)) ?? memberNameMap.get(uid) ?? (uid || "—");

  const coursesQ = useQuery<{ records: any[] }>({
    queryKey: ["training-courses", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training-courses`).then(r => r.json()),
    enabled: !!farmId,
  });
  const providersQ = useQuery<{ records: any[] }>({
    queryKey: ["training-providers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training-providers`).then(r => r.json()),
    enabled: !!farmId,
  });
  const courses: any[] = coursesQ.data?.records ?? [];
  const providers: any[] = providersQ.data?.records ?? [];

  const [courseSearch, setCourseSearch] = useState("");
  const [courseDropOpen, setCourseDropOpen] = useState(false);

  const empty = { userId: "", trainingTitle: "", trainingProvider: "", trainingProviderId: "" as string, courseId: "" as string, trainingDate: "", expiryDate: "", competencyAchieved: "", assessorName: "", notes: "" };
  const [form, setForm] = useState({ ...empty });

  const q = useQuery<{ records: TrainingRecord[] }>({
    queryKey: ["training-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records = (q.data?.records ?? []).filter(r =>
    isInCropYear(r.trainingDate, cropYear) && (
      !search || r.trainingTitle.toLowerCase().includes(search.toLowerCase()) || (r.trainingProvider ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/training`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Training record added" }); qc.invalidateQueries({ queryKey: ["training-records", farmId] }); setAddOpen(false); setForm({ ...empty }); setCourseSearch(""); },
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
      trainingProviderId: r.trainingProviderId ? String(r.trainingProviderId) : "",
      courseId: r.courseId ? String(r.courseId) : "",
      trainingDate: r.trainingDate ? r.trainingDate.slice(0, 10) : "",
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      competencyAchieved: r.competencyAchieved ?? "",
      assessorName: r.assessorName ?? "",
      notes: r.notes ?? "",
    });
    setCourseSearch(r.trainingTitle ?? "");
  }

  function handleSubmit(isEdit: boolean) {
    const providerIdNum = form.trainingProviderId && form.trainingProviderId !== "__custom__" ? parseInt(form.trainingProviderId) : null;
    const body = {
      ...form,
      courseId: form.courseId ? parseInt(form.courseId) : null,
      trainingProviderId: providerIdNum,
    };
    if (isEdit && editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }

  function selectCourse(course: any) {
    const expiryDate = course.defaultValidityMonths && form.trainingDate
      ? (() => {
          const d = new Date(form.trainingDate);
          d.setMonth(d.getMonth() + course.defaultValidityMonths);
          return d.toISOString().slice(0, 10);
        })()
      : form.expiryDate;
    setForm(f => ({
      ...f,
      trainingTitle: course.name,
      courseId: String(course.id),
      expiryDate,
    }));
    setCourseSearch(course.name);
    setCourseDropOpen(false);
  }

  const expiredCount = records.filter(r => r.expiryDate && new Date(r.expiryDate) < new Date()).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <Input placeholder="Search training records…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-[280px]" />
        <CropYearSelector value={cropYear} onChange={setCropYear} />
        <div style={{ flex: 1 }} />
        {expiredCount > 0 && (
          <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={13} /> {expiredCount} expired
          </Badge>
        )}
        <Button size="sm" onClick={() => { setForm({ ...empty }); setCourseSearch(""); setAddOpen(true); }}>
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
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{resolveStaffName(r.userId)}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{r.trainingTitle}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.trainingProvider || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{fmt(r.trainingDate)}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{r.expiryDate ? expiryBadge(r.expiryDate) : <span style={{ color: "#9ca3af" }}>No expiry</span>}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8125rem" }}>{r.competencyAchieved || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button size="sm" variant="ghost" style={{ height: 28, width: 28, padding: 0, color: "#9ca3af" }} onClick={() => setViewItem(r)} title="View"><Eye size={13} /></Button>
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

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent style={{ maxWidth: 500 }}>
            <DialogHeader><DialogTitle>Training Record</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gap: 12, padding: "4px 0", fontSize: "0.875rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Staff Member</p><p>{resolveStaffName(viewItem.userId)}</p></div>
                <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Training Date</p><p>{fmt(viewItem.trainingDate)}</p></div>
                <div style={{ gridColumn: "1 / -1" }}><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Training Title</p><p style={{ fontWeight: 600 }}>{viewItem.trainingTitle}</p></div>
                <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Provider</p><p>{viewItem.trainingProvider || "—"}</p></div>
                <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Expiry</p><p>{viewItem.expiryDate ? fmt(viewItem.expiryDate) : "No expiry"}</p></div>
                <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Competency</p><p>{viewItem.competencyAchieved || "—"}</p></div>
                <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Assessor</p><p>{viewItem.assessorName || "—"}</p></div>
              </div>
              {viewItem.notes && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Notes</p><p style={{ whiteSpace: "pre-line", color: "#374151" }}>{viewItem.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil size={13} style={{ marginRight: 4 }} />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {[addOpen, !!editItem].includes(true) && (
        <Dialog open={addOpen || !!editItem} onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); } }}>
          <DialogContent style={{ maxWidth: 540 }}>
            <DialogHeader><DialogTitle>{editItem ? "Edit Training Record" : "Add Training Record"}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Label>Staff Member *</Label><StaffSelect value={form.userId} onChange={v => setForm(f => ({ ...f, userId: v }))} staffNames={staffNames} loading={staffLoading} /></div>

              {/* Training Title — combobox from Course Register, free-text fallback */}
              <div>
                <Label>Training Title *</Label>
                <div style={{ position: "relative", marginTop: 4 }}>
                  <Input
                    value={courseSearch}
                    onChange={e => {
                      setCourseSearch(e.target.value);
                      setForm(f => ({ ...f, trainingTitle: e.target.value, courseId: "" }));
                      setCourseDropOpen(true);
                    }}
                    onFocus={() => setCourseDropOpen(true)}
                    onBlur={() => setTimeout(() => setCourseDropOpen(false), 150)}
                    placeholder={courses.length ? "Search or type a course name…" : "e.g. PA1 Safe Use of Pesticides"}
                  />
                  {courseDropOpen && courses.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxHeight: 220, overflowY: "auto", marginTop: 2 }}>
                      {courses.filter(c => !courseSearch || c.name.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 ? (
                        <div style={{ padding: "8px 12px", fontSize: "0.8125rem", color: "#9ca3af" }}>No matching courses — your typed text will be saved</div>
                      ) : courses.filter(c => !courseSearch || c.name.toLowerCase().includes(courseSearch.toLowerCase())).map((c: any) => (
                        <div
                          key={c.id}
                          onMouseDown={() => selectCourse(c)}
                          style={{ padding: "8px 12px", cursor: "pointer", fontSize: "0.8125rem", borderBottom: "1px solid #f3f4f6" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                        >
                          <div style={{ fontWeight: 500 }}>{c.name}</div>
                          {(c.issuingBody || c.defaultValidityMonths) && (
                            <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }}>
                              {c.issuingBody}{c.issuingBody && c.defaultValidityMonths ? " · " : ""}{c.defaultValidityMonths ? `Valid ${c.defaultValidityMonths} months` : ""}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {courses.length === 0 && (
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>Add standard courses in the Course Register tab to enable quick lookup.</p>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <Label>Training Date *</Label>
                  <Input type="date" className="mt-1" value={form.trainingDate} onChange={e => {
                    const newDate = e.target.value;
                    setForm(f => {
                      let expiryDate = f.expiryDate;
                      if (f.courseId) {
                        const course = courses.find((c: any) => String(c.id) === f.courseId);
                        if (course?.defaultValidityMonths && newDate) {
                          const d = new Date(newDate);
                          d.setMonth(d.getMonth() + course.defaultValidityMonths);
                          expiryDate = d.toISOString().slice(0, 10);
                        }
                      }
                      return { ...f, trainingDate: newDate, expiryDate };
                    });
                  }} />
                </div>
                <div><Label>Expiry Date</Label><Input type="date" className="mt-1" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
              </div>

              {/* Training Provider — dropdown from training provider suppliers */}
              <div>
                <Label>Training Provider</Label>
                <select
                  className="mt-1"
                  value={form.trainingProviderId}
                  onChange={e => {
                    const id = e.target.value;
                    const p = providers.find((p: any) => String(p.id) === id);
                    setForm(f => ({ ...f, trainingProviderId: id, trainingProvider: p ? p.name : f.trainingProvider }));
                  }}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" }}
                >
                  <option value="">— select registered provider —</option>
                  {providers.map((p: any) => (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  ))}
                  <option value="__custom__">Other / not listed</option>
                </select>
                {(form.trainingProviderId === "__custom__" || (form.trainingProviderId === "" && form.trainingProvider)) && (
                  <Input
                    className="mt-1"
                    value={form.trainingProvider}
                    onChange={e => setForm(f => ({ ...f, trainingProvider: e.target.value }))}
                    placeholder="Provider name"
                  />
                )}
                {providers.length === 0 && (
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>Add training providers to your Suppliers list (category: Training Provider) to enable this lookup.</p>
                )}
              </div>

              <div><Label>Competency Achieved</Label><Input className="mt-1" value={form.competencyAchieved} onChange={e => setForm(f => ({ ...f, competencyAchieved: e.target.value }))} placeholder="e.g. Safe pesticide handling" /></div>
              <div><Label>Assessor Name</Label><Input className="mt-1" value={form.assessorName} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
              <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); setCourseSearch(""); }}>Cancel</Button>
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

function CertDocPanel({ certId, farmId, documentPath, documentName }: { certId: number; farmId: number; documentPath: string | null; documentName: string | null }) {
  const qc = useQueryClient();

  const removeMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/certificates/${certId}/document`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const fileName = response.objectPath.split("/").pop() ?? "document";
      await fetch(`/api/farms/${farmId}/certificates/${certId}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: fileName }),
      });
      qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] });
    },
  });

  return (
    <div style={{ padding: "8px 12px 10px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }}>Certificate Scan</p>
      {documentPath ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <File style={{ width: 14, height: 14, color: "#6b7280", flexShrink: 0 }} />
          <a href={`/api/storage${documentPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none", flex: 1 }}>
            {documentName ?? "View Scan"}
          </a>
          <button onClick={() => removeMut.mutate()} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af" }} title="Remove scan">
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>
      ) : (
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="file"
            accept="image/*,application/pdf"
            style={{ display: "none" }}
            disabled={isUploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
          />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff" }}>
            {isUploading ? <><Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> Uploading {progress}%</> : <><Upload style={{ width: 12, height: 12 }} /> Attach Scan</>}
          </span>
          <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>PDF, JPG or PNG</span>
        </label>
      )}
    </div>
  );
}

function CertificatesTab({ farmId, staffNames, staffLoading, defaultMember }: { farmId: number; staffNames: string[]; staffLoading?: boolean; defaultMember?: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CertificateRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedCertId, setExpandedCertId] = useState<number | null>(null);

  const membersQ = useFarmMembers(farmId);
  const memberNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (membersQ.data?.members ?? []).forEach(m => {
      const full = memberFullName(m);
      map.set(String(m.id), full);
      map.set(full, full);
      if (m.linkedUserId) map.set(m.linkedUserId, full);
    });
    return map;
  }, [membersQ.data]);
  const resolveStaffName = (uid: string) => memberNameMap.get(String(uid)) ?? memberNameMap.get(uid) ?? (uid || "—");

  const empty = { userId: "", certificateType: "", certificateNumber: "", issuer: "", issueDate: "", expiryDate: "", notes: "" };
  const [form, setForm] = useState({ ...empty, userId: defaultMember ?? "" });

  useEffect(() => {
    if (defaultMember) {
      setForm(f => ({ ...f, userId: defaultMember }));
      setAddOpen(true);
    }
  }, [defaultMember]);

  const q = useQuery<{ records: CertificateRecord[] }>({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records = q.data?.records ?? [];

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/certificates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Certificate added" }); qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }); setAddOpen(false); setForm({ ...empty }); setRenewMode(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/certificates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Certificate updated" }); qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }); setEditItem(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/certificates/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Certificate deleted" }); qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }); setDeleteId(null); },
  });

  const [renewMode, setRenewMode] = useState(false);

  function openEdit(r: CertificateRecord) {
    setRenewMode(false);
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

  function openRenew(r: CertificateRecord) {
    setEditItem(null);
    setRenewMode(true);
    setForm({
      userId: r.userId ?? "",
      certificateType: r.certificateType,
      certificateNumber: "",
      issuer: r.issuer ?? "",
      issueDate: "",
      expiryDate: "",
      notes: "",
    });
    setAddOpen(true);
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

      {!q.isLoading && (() => {
        const missingFlags = COMPLIANCE_FLAGS.filter(f => !records.some(r => r.certificateType.includes(f.match)));
        if (missingFlags.length === 0) return null;
        return (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 2 }}>Compliance Gaps Detected</p>
            {missingFlags.map(f => (
              <div key={f.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: f.severity === "error" ? "#fef2f2" : "#fffbeb", border: `1px solid ${f.severity === "error" ? "#fecaca" : "#fde68a"}` }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1, color: f.severity === "error" ? "#dc2626" : "#d97706" }} />
                <div>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: f.severity === "error" ? "#991b1b" : "#92400e", marginBottom: 2 }}>{f.label} — no record on file</p>
                  <p style={{ fontSize: "0.75rem", color: f.severity === "error" ? "#b91c1c" : "#b45309" }}>{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {q.isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
          <Award size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No certificates recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Record operator certificates, professional qualifications and welfare competencies here. Inspectors will ask to see these.</p>
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
                <React.Fragment key={r.id}>
                  <tr style={{ borderBottom: expandedCertId === r.id ? "none" : "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{resolveStaffName(r.userId)}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.certificateType}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontFamily: "monospace", fontSize: "0.8125rem", color: "#374151" }}>{r.certificateNumber || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.issuer || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{fmt(r.issueDate)}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>{r.expiryDate ? expiryBadge(r.expiryDate) : <Badge style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}>No expiry</Badge>}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ fontSize: "0.75rem", height: 28, display: "flex", alignItems: "center", gap: 3 }}
                          onClick={() => setExpandedCertId(expandedCertId === r.id ? null : r.id)}
                        >
                          {r.documentPath ? <File style={{ width: 11, height: 11, color: "#2563eb" }} /> : <Paperclip style={{ width: 11, height: 11 }} />}
                          Scan
                          {expandedCertId === r.id ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
                        </Button>
                        <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#059669" }} onClick={() => openRenew(r)} title="Create a new renewal record — keeps this one intact">Renew</Button>
                        <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => openEdit(r)}>Edit</Button>
                        <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#dc2626" }} onClick={() => setDeleteId(r.id)}>Del</Button>
                      </div>
                    </td>
                  </tr>
                  {expandedCertId === r.id && (
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <CertDocPanel certId={r.id} farmId={farmId} documentPath={r.documentPath} documentName={r.documentName} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen || !!editItem} onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); setRenewMode(false); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Certificate" : renewMode ? "Renew Certificate" : "Add Certificate"}</DialogTitle>
          </DialogHeader>
          {renewMode && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, marginBottom: 4 }}>
              <RefreshCw size={14} style={{ flexShrink: 0, marginTop: 2, color: "#16a34a" }} />
              <p style={{ fontSize: "0.8125rem", color: "#166534", margin: 0 }}>
                A <strong>new</strong> certificate record will be created. The previous record is kept — both will be stored and viewable.
              </p>
            </div>
          )}
          <div style={{ display: "grid", gap: 12 }}>
            <div><Label>Staff Member *</Label><StaffSelect value={form.userId} onChange={v => setForm(f => ({ ...f, userId: v }))} staffNames={staffNames} loading={staffLoading} /></div>
            <div>
              <Label>Certificate Type *</Label>
              <Select value={form.certificateType} onValueChange={v => setForm(f => ({ ...f, certificateType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category then type…" /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {CERT_GROUPS.map((g, gi) => (
                    <React.Fragment key={g.group}>
                      {gi > 0 && <SelectSeparator />}
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">{g.group}</SelectLabel>
                        {g.certs.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectGroup>
                    </React.Fragment>
                  ))}
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
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); setRenewMode(false); }}>Cancel</Button>
            <Button onClick={() => {
              const body = { ...form };
              if (editItem) updateMut.mutate({ id: editItem.id, body });
              else createMut.mutate(body);
            }} disabled={!form.certificateType || !form.issueDate || !form.userId}>{renewMode ? "Save Renewal" : "Save Certificate"}</Button>
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

const RTW_DOCUMENT_TYPES = [
  { group: "List A — Unrestricted Right to Work (no expiry)", docs: [
    "UK or Irish Passport / Passport Card",
    "UK Biometric Residence Permit — settled status",
    "Certificate of Naturalisation or Registration as a British Citizen",
    "UK Birth or Adoption Certificate + NI evidence",
    "Letter from Home Office — indefinite leave",
  ]},
  { group: "List B — Time-Limited Right to Work (expiry date required)", docs: [
    "UK Biometric Residence Permit — pre-settled status",
    "UK Biometric Residence Permit — limited leave",
    "Online Share Code — Home Office Employer Checking Service",
    "Passport with vignette / entry clearance sticker",
    "Seasonal Worker visa (Defra/GLAA approved)",
    "Student visa — evidence of study",
    "Other immigration status document",
  ]},
];

interface RtwRecord {
  id: number;
  staffName: string;
  documentType: string;
  documentReference: string | null;
  checkDate: string;
  checkedBy: string | null;
  expiryDate: string | null;
  followUpDate: string | null;
  notes: string | null;
}

function rtwStatusBadge(expiryDate: string | null | undefined) {
  if (!expiryDate) return <Badge style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>Valid — No Expiry</Badge>;
  const now = new Date();
  const exp = new Date(expiryDate);
  const days = Math.floor((exp.getTime() - now.getTime()) / 86400000);
  if (days < 0) return <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>EXPIRED — Re-check required</Badge>;
  if (days <= 28) return <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>Expires {fmt(expiryDate)} — urgent</Badge>;
  if (days <= 90) return <Badge style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>Expires {fmt(expiryDate)}</Badge>;
  return <Badge style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>Valid · {fmt(expiryDate)}</Badge>;
}

interface RtwDocument { id: number; rtwId: number; farmId: number; fileName: string; objectPath: string; uploadedAt: string; }

function RtwDocsPanel({ rtwId, farmId }: { rtwId: number; farmId: number }) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ documents: RtwDocument[] }>({
    queryKey: ["rtw-docs", rtwId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work/${rtwId}/documents`).then(r => r.json()),
  });

  const deleteMut = useMutation({
    mutationFn: (docId: number) => fetch(`/api/farms/${farmId}/right-to-work/${rtwId}/documents/${docId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rtw-docs", rtwId] }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const fileName = response.objectPath.split("/").pop() ?? "document";
      await fetch(`/api/farms/${farmId}/right-to-work/${rtwId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, objectPath: response.objectPath }),
      });
      qc.invalidateQueries({ queryKey: ["rtw-docs", rtwId] });
    },
  });

  const docs = data?.documents ?? [];

  return (
    <div style={{ padding: "8px 12px 10px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }}>Attached Document Copies</p>
      {isLoading ? (
        <p style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>Loading…</p>
      ) : docs.length === 0 ? (
        <p style={{ fontSize: "0.8125rem", color: "#9ca3af", fontStyle: "italic", marginBottom: 6 }}>No documents attached. Upload a scan or photo of the identity document below.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 5, padding: "4px 8px" }}>
              <File style={{ width: 13, height: 13, color: "#6b7280", flexShrink: 0 }} />
              <a href={`/api/storage${doc.objectPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none", flex: 1 }}>
                {doc.fileName}
              </a>
              <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{new Date(doc.uploadedAt).toLocaleDateString("en-GB")}</span>
              <button onClick={() => deleteMut.mutate(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af" }} title="Remove">
                <Trash2 style={{ width: 12, height: 12 }} />
              </button>
            </div>
          ))}
        </div>
      )}
      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <input
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          disabled={isUploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
        />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff" }}>
          {isUploading ? <><Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> Uploading {progress}%</> : <><Upload style={{ width: 12, height: 12 }} /> Add Document</>}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>PDF, JPG or PNG — scan or photo of original document</span>
      </label>
    </div>
  );
}

function RightToWorkTab({ farmId, staffNames, staffLoading, defaultMember }: { farmId: number; staffNames: string[]; staffLoading?: boolean; defaultMember?: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<RtwRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState(defaultMember ?? "");
  const [expandedRtwId, setExpandedRtwId] = useState<number | null>(null);

  const emptyForm = { staffName: defaultMember ?? "", documentType: "", documentReference: "", checkDate: "", checkedBy: "", expiryDate: "", followUpDate: "", notes: "" };
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    if (defaultMember) {
      setForm(f => ({ ...f, staffName: defaultMember }));
      setAddOpen(true);
    }
  }, [defaultMember]);

  const q = useQuery<{ records: RtwRecord[] }>({
    queryKey: ["staff-rtw", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work`).then(r => r.json()),
    enabled: !!farmId,
  });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/right-to-work`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "RTW check recorded" }); qc.invalidateQueries({ queryKey: ["staff-rtw", farmId] }); setAddOpen(false); setForm({ ...emptyForm }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/right-to-work/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "RTW record updated" }); qc.invalidateQueries({ queryKey: ["staff-rtw", farmId] }); setEditItem(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/right-to-work/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Record deleted" }); qc.invalidateQueries({ queryKey: ["staff-rtw", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: RtwRecord) {
    setEditItem(r);
    setForm({
      staffName: r.staffName,
      documentType: r.documentType,
      documentReference: r.documentReference ?? "",
      checkDate: r.checkDate ? r.checkDate.slice(0, 10) : "",
      checkedBy: r.checkedBy ?? "",
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      followUpDate: r.followUpDate ? r.followUpDate.slice(0, 10) : "",
      notes: r.notes ?? "",
    });
  }

  const records = (q.data?.records ?? []).filter(r =>
    !search || r.staffName.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const expired = records.filter(r => r.expiryDate && new Date(r.expiryDate) < now).length;
  const urgent = records.filter(r => {
    if (!r.expiryDate) return false;
    const d = Math.floor((new Date(r.expiryDate).getTime() - now.getTime()) / 86400000);
    return d >= 0 && d <= 28;
  }).length;

  const checkedNames = new Set((q.data?.records ?? []).map(r => r.staffName));
  const uncheckedStaff = staffNames.filter(n => !checkedNames.has(n));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <Input placeholder="Filter by staff member…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-[260px]" />
        <div style={{ flex: 1 }} />
        {expired > 0 && <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={13} /> {expired} expired</Badge>}
        {urgent > 0 && <Badge style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>{urgent} expiring &lt;28 days</Badge>}
        <Button size="sm" onClick={() => { setForm({ ...emptyForm }); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" /> Record RTW Check
        </Button>
      </div>

      {!q.isLoading && uncheckedStaff.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#991b1b", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> No RTW check recorded for: {uncheckedStaff.join(", ")}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#b91c1c" }}>
            UK law requires a Right to Work check before employment begins. Civil penalties of up to £45,000 per worker apply if checks are not completed. Record a check for each person above.
          </p>
        </div>
      )}

      {!q.isLoading && expired > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#991b1b", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> {expired} time-limited RTW check{expired !== 1 ? "s have" : " has"} expired — repeat checks must be completed immediately.
          </p>
        </div>
      )}

      {q.isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
          <Award size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No Right to Work checks recorded</p>
          <p style={{ fontSize: "0.875rem", maxWidth: 420, margin: "0 auto" }}>
            Record documentary evidence of each staff member's right to work in the UK. Required under the Immigration, Asylum and Nationality Act 2006 before employment starts.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                {(["Staff Member", "Document Type", "Reference / Share Code", "Check Date", "Checked By", "Status / Expiry", ""].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>{h}</th>
                )))}
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <React.Fragment key={r.id}>
                  <tr style={{ borderBottom: expandedRtwId === r.id ? "none" : "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.staffName}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>{r.documentType}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontFamily: "monospace", fontSize: "0.8125rem", color: "#374151" }}>{r.documentReference || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{fmt(r.checkDate)}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.checkedBy || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>{rtwStatusBadge(r.expiryDate)}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ fontSize: "0.75rem", height: 28, display: "flex", alignItems: "center", gap: 3, border: "1px solid #93c5fd", color: "#1d4ed8", background: expandedRtwId === r.id ? "#dbeafe" : "#eff6ff", fontWeight: 600 }}
                          onClick={() => setExpandedRtwId(expandedRtwId === r.id ? null : r.id)}
                          title="Upload and view identity document scans for this RTW check"
                        >
                          <Paperclip style={{ width: 11, height: 11 }} />
                          Docs / Scans
                          {expandedRtwId === r.id ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
                        </Button>
                        <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => openEdit(r)}>Edit</Button>
                        <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#dc2626" }} onClick={() => setDeleteId(r.id)}>Del</Button>
                      </div>
                    </td>
                  </tr>
                  {expandedRtwId === r.id && (
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <RtwDocsPanel rtwId={r.id} farmId={farmId} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen || !!editItem} onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); } }}>
        <DialogContent style={{ maxWidth: 540 }}>
          <DialogHeader><DialogTitle>{editItem ? "Edit RTW Record" : "Record Right to Work Check"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div><Label>Staff Member *</Label><StaffSelect value={form.staffName} onChange={v => setForm(f => ({ ...f, staffName: v }))} staffNames={staffNames} loading={staffLoading} /></div>
            <div>
              <Label>Document Type *</Label>
              <Select value={form.documentType} onValueChange={v => setForm(f => ({ ...f, documentType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select document type…" /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {RTW_DOCUMENT_TYPES.map((g, gi) => (
                    <React.Fragment key={g.group}>
                      {gi > 0 && <SelectSeparator />}
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">{g.group}</SelectLabel>
                        {g.docs.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectGroup>
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Document Reference / Share Code</Label><Input className="mt-1" value={form.documentReference} onChange={e => setForm(f => ({ ...f, documentReference: e.target.value }))} placeholder="e.g. 4HB8YR or passport number" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Date Check Carried Out *</Label><Input type="date" className="mt-1" value={form.checkDate} onChange={e => setForm(f => ({ ...f, checkDate: e.target.value }))} /></div>
              <div><Label>Checked By</Label><Input className="mt-1" value={form.checkedBy} onChange={e => setForm(f => ({ ...f, checkedBy: e.target.value }))} placeholder="e.g. Farm Manager" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Document Expiry Date</Label>
                <Input type="date" className="mt-1" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }}>Leave blank for List A (indefinite)</p>
              </div>
              <div>
                <Label>Follow-Up / Repeat Check Due</Label>
                <Input type="date" className="mt-1" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
              </div>
            </div>
            <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
            <Button onClick={() => {
              const body = { ...form };
              if (editItem) updateMut.mutate({ id: editItem.id, body });
              else createMut.mutate(body);
            }} disabled={!form.staffName || !form.documentType || !form.checkDate}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete RTW Record</DialogTitle></DialogHeader>
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
  members: FarmMember[],
  cphNumber?: string | null,
  redTractorId?: string | null,
) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";

  const nameMap = new Map<string, string>();
  members.forEach(m => {
    const fullName = memberFullName(m);
    nameMap.set(String(m.id), fullName);
    nameMap.set(fullName, fullName);
    if (m.linkedUserId) nameMap.set(m.linkedUserId, fullName);
  });
  const staffName = (userId: string) => nameMap.get(String(userId)) ?? nameMap.get(userId) ?? (userId || "—");

  const trainingRows = trainingRecords.map(r => {
    const expired = r.expiryDate && new Date(r.expiryDate) < new Date();
    const expTxt = r.expiryDate
      ? `<span style="color:${expired ? "#dc2626" : "#16a34a"}">${fmtD(r.expiryDate)}${expired ? " &#9888; EXPIRED" : ""}</span>`
      : "—";
    return `<tr><td class="name">${staffName(r.userId)}</td><td>${r.trainingTitle}</td><td>${r.trainingProvider || "—"}</td><td class="date">${fmtD(r.trainingDate)}</td><td class="date">${expTxt}</td><td>${r.competencyAchieved || "—"}</td></tr>`;
  }).join("");

  const certRows = certificates.map(r => {
    const expired = r.expiryDate && new Date(r.expiryDate) < new Date();
    const expTxt = r.expiryDate
      ? `<span style="color:${expired ? "#dc2626" : "#16a34a"}">${fmtD(r.expiryDate)}${expired ? " &#9888; EXPIRED" : ""}</span>`
      : "No expiry";
    return `<tr><td class="name">${staffName(r.userId)}</td><td>${r.certificateType}</td><td class="mono">${r.certificateNumber || "—"}</td><td>${r.issuer || "—"}</td><td class="date">${fmtD(r.issueDate)}</td><td class="date">${expTxt}</td></tr>`;
  }).join("");

  const html = `<html><head><title>Staff Training &amp; Qualifications Register — ${farmName}</title>
<style>
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;font-size:10pt;margin:0;color:#111;background:#fff;line-height:1.4}
  .page{padding:1.8cm 2cm 2.5cm}
  /* Header */
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;margin-bottom:22px;border-bottom:3px solid #16a34a}
  .hdr-left{max-width:60%}
  .hdr-left h1{font-size:15pt;font-weight:800;margin:0 0 3px;color:#111;letter-spacing:-.01em}
  .hdr-left .doc-type{font-size:8.5pt;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;margin:0 0 2px}
  .hdr-left p{font-size:8.5pt;color:#6b7280;margin:4px 0 0}
  .hdr-right{text-align:right;font-size:8.5pt;color:#6b7280;line-height:1.7;flex-shrink:0}
  .hdr-right .farm{font-size:11.5pt;font-weight:700;color:#111;display:block;margin-bottom:3px}
  /* Section headings */
  h2{font-size:10pt;font-weight:700;margin:24px 0 6px;padding:6px 10px 6px;background:#f0fdf4;border-left:4px solid #16a34a;color:#14532d;letter-spacing:.01em;page-break-after:avoid}
  .subtitle{font-size:8pt;color:#6b7280;font-style:italic;margin:0 0 8px 0}
  /* Tables */
  table{width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:4px;page-break-inside:auto}
  thead{display:table-header-group}
  thead tr{page-break-after:avoid}
  tbody tr{page-break-inside:avoid}
  th{background:#f0fdf4;font-weight:700;text-align:left;border-top:2px solid #16a34a;border-bottom:1.5px solid #16a34a;border-right:1px solid #dcfce7;padding:6px 9px;font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:#166534}
  th:first-child{border-left:2px solid #16a34a}
  th:last-child{border-right:2px solid #16a34a}
  td{border:1px solid #e5e7eb;padding:5px 9px;vertical-align:top}
  tr:nth-child(even) td{background:#f9fafb}
  td.name{font-weight:600;color:#111;white-space:nowrap;min-width:110px}
  td.date{white-space:nowrap;color:#374151;min-width:80px}
  td.mono{font-family:'Courier New',monospace;font-size:8pt;letter-spacing:.02em}
  td.status-ok{color:#15803d;font-weight:600}
  td.status-exp{color:#dc2626;font-weight:600}
  /* Signature block */
  .sig{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:52px;page-break-inside:avoid}
  .sig-box{border-top:2px solid #374151;padding-top:10px;font-size:8.5pt;line-height:2.2}
  .sig-box strong{font-size:9pt;display:block;margin-bottom:4px;color:#111}
  /* Footer */
  .footer{font-size:7.5pt;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:32px;line-height:1.5}
  .empty{color:#9ca3af;font-style:italic;font-size:8.5pt;padding:8px 0 14px}
  /* Summary row */
  .summary{display:flex;gap:24px;margin:0 0 18px;font-size:8.5pt}
  .summary-item{border:1px solid #e5e7eb;border-radius:5px;padding:5px 12px;background:#f9fafb}
  .summary-item strong{display:block;font-size:11pt;font-weight:700;color:#111;line-height:1.1}
  .summary-item span{color:#6b7280;font-size:7.5pt;text-transform:uppercase;letter-spacing:.05em}
  @media print{
    @page{size:A4 landscape;margin:1.2cm 1.5cm}
    body{font-size:9.5pt}
    .page{padding:0}
    h2{margin-top:18px}
  }
</style></head><body><div class="page">
<div class="hdr">
  <div class="hdr-left">
    <p class="doc-type">Red Tractor Compliance Record</p>
    <h1>Staff Training &amp; Qualifications Register</h1>
    <p>Red Tractor Combinable Crops &amp; Sugar Beet — Staff Competency Record</p>
  </div>
  <div class="hdr-right">
    <span class="farm">${farmName}</span>${cphNumber ? `<br>CPH: ${cphNumber}` : ""}${redTractorId ? `<br>Red Tractor ID: ${redTractorId}` : ""}
    <br>Printed: ${today}<br>
    Retain for minimum 3 years — make available at audit
  </div>
</div>
<div class="summary">
  <div class="summary-item"><strong>${trainingRecords.length}</strong><span>Training Records</span></div>
  <div class="summary-item"><strong>${certificates.length}</strong><span>Certificates</span></div>
  <div class="summary-item"><strong>${trainingRecords.filter(r => r.expiryDate && new Date(r.expiryDate) < new Date()).length + certificates.filter(r => r.expiryDate && new Date(r.expiryDate) < new Date()).length}</strong><span>Expired</span></div>
</div>

<h2>Training Records</h2>
${trainingRecords.length === 0
    ? '<p class="empty">No training records on file.</p>'
    : `<table><thead><tr><th style="width:16%">Staff Member</th><th style="width:25%">Training Title</th><th style="width:16%">Provider</th><th style="width:10%">Date</th><th style="width:13%">Expiry</th><th>Competency Achieved</th></tr></thead><tbody>${trainingRows}</tbody></table>`}

<h2>Operator Certificates &amp; Qualifications</h2>
<p class="subtitle">Includes PA1, PA2, PA3, PA6, PA6AW, BASIS, FACTS, and all other required operator certificates.</p>
${certificates.length === 0
    ? '<p class="empty">No certificates on file.</p>'
    : `<table><thead><tr><th style="width:16%">Staff Member</th><th style="width:22%">Certificate Type</th><th style="width:14%">Cert. Number</th><th style="width:14%">Issuer</th><th style="width:10%">Issue Date</th><th>Expiry / Status</th></tr></thead><tbody>${certRows}</tbody></table>`}

<div class="sig">
  <div class="sig-box"><strong>Farm Manager</strong>Signature: ____________________________<br>Name (print): ________________________<br>Date: ________________________________</div>
  <div class="sig-box"><strong>Red Tractor Assessor</strong>Signature: ____________________________<br>Name (print): ________________________<br>Date: ________________________________</div>
</div>
<div class="footer">
  Staff Training &amp; Qualifications Register &mdash; Red Tractor compliance record. Retain for a minimum of 3 years and make available at audit.<br>
  Generated by BDE Farm Trac &middot; ${today}
</div>
</div></body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

// ─── Course Register Tab ─────────────────────────────────────────────────────
function CoursesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const q = useQuery<{ records: any[] }>({
    queryKey: ["training-courses", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training-courses`).then(r => r.json()),
    enabled: !!farmId,
  });
  const courses: any[] = q.data?.records ?? [];

  const emptyForm = { name: "", courseType: "", issuingBody: "", defaultValidityMonths: "" as string | number, notes: "" };
  const [form, setForm] = useState({ ...emptyForm });
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openEdit(c: any) {
    setEditItem(c);
    setForm({
      name: c.name ?? "",
      courseType: c.courseType ?? "",
      issuingBody: c.issuingBody ?? "",
      defaultValidityMonths: c.defaultValidityMonths ?? "",
      notes: c.notes ?? "",
    });
  }

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/training-courses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Course added" }); qc.invalidateQueries({ queryKey: ["training-courses", farmId] }); setAddOpen(false); setForm({ ...emptyForm }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/training-courses/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Course updated" }); qc.invalidateQueries({ queryKey: ["training-courses", farmId] }); setEditItem(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/training-courses/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Course removed" }); qc.invalidateQueries({ queryKey: ["training-courses", farmId] }); setDeleteId(null); },
  });

  function handleSubmit(isEdit: boolean) {
    const body: any = {
      ...form,
      defaultValidityMonths: form.defaultValidityMonths !== "" ? parseInt(String(form.defaultValidityMonths)) : null,
    };
    if (isEdit && editItem) {
      body.isActive = !!editItem.isActive;
      updateMut.mutate({ id: editItem.id, body });
    } else {
      createMut.mutate(body);
    }
  }

  const COURSE_TYPES = ["Safety", "Pesticide / PA Award", "First Aid", "Machinery", "Animal Welfare", "Environmental", "Business / Admin", "Other"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Define standard courses your farm uses. These appear as quick-select options in the Training Records form.
          </p>
        </div>
        <Button size="sm" onClick={() => { setForm({ ...emptyForm }); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" /> Add Course
        </Button>
      </div>

      {q.isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
          <GraduationCap size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No courses defined yet</p>
          <p style={{ fontSize: "0.875rem" }}>Add standard courses (e.g. PA1, First Aid, Safe Tractor Operation) to speed up training record entry.</p>
          <Button size="sm" className="mt-4" onClick={() => { setForm({ ...emptyForm }); setAddOpen(true); }}>
            <Plus size={14} className="mr-1" /> Add Course
          </Button>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Course Name</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Type</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Issuing Body</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Valid (months)</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Status</th>
                <th style={{ padding: "10px 14px" }}></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: any, i: number) => (
                <tr key={c.id} style={{ borderBottom: i < courses.length - 1 ? "1px solid #f3f4f6" : undefined }}>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "10px 14px", color: "#6b7280" }}>{c.courseType || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#6b7280" }}>{c.issuingBody || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#6b7280" }}>{c.defaultValidityMonths ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, background: c.isActive ? "#f0fdf4" : "#f9fafb", color: c.isActive ? "#16a34a" : "#9ca3af", border: `1px solid ${c.isActive ? "#bbf7d0" : "#e5e7eb"}` }}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)} style={{ padding: "4px 8px" }}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(c.id)} style={{ padding: "4px 8px", color: "#dc2626" }}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit dialog */}
      {(addOpen || !!editItem) && (
        <Dialog open={addOpen || !!editItem} onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); } }}>
          <DialogContent style={{ maxWidth: 480 }}>
            <DialogHeader><DialogTitle>{editItem ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Label>Course Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. PA1 Safe Use of Pesticides" /></div>
              <div>
                <Label>Course Type</Label>
                <select
                  className="mt-1"
                  value={COURSE_TYPES.filter(t => t !== "Other").includes(form.courseType) ? form.courseType : (form.courseType ? "Other" : "")}
                  onChange={e => setForm(f => ({ ...f, courseType: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" }}
                >
                  <option value="">— select type —</option>
                  {COURSE_TYPES.map(t => <option key={t} value={t}>{t === "Other" ? "Other (please specify)" : t}</option>)}
                </select>
                {(form.courseType === "Other" || (form.courseType && !COURSE_TYPES.filter(t => t !== "Other").includes(form.courseType))) && (
                  <Input
                    className="mt-1"
                    value={form.courseType === "Other" ? "" : form.courseType}
                    onChange={e => setForm(f => ({ ...f, courseType: e.target.value || "Other" }))}
                    placeholder="Please specify course type…"
                    autoFocus={form.courseType === "Other"}
                    style={{ fontSize: "0.875rem" }}
                  />
                )}
              </div>
              <div><Label>Issuing Body</Label><Input className="mt-1" value={form.issuingBody} onChange={e => setForm(f => ({ ...f, issuingBody: e.target.value }))} placeholder="e.g. Lantra Awards, NPTC Group" /></div>
              <div>
                <Label>Default Validity (months)</Label>
                <Input type="number" min={1} className="mt-1" value={form.defaultValidityMonths} onChange={e => setForm(f => ({ ...f, defaultValidityMonths: e.target.value }))} placeholder="e.g. 36" />
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>When a course is selected in a training record, expiry date is auto-calculated from this value.</p>
              </div>
              <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              {editItem && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="courseActive" checked={!!editItem.isActive} onChange={e => setEditItem((ei: any) => ({ ...ei, isActive: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  <Label htmlFor="courseActive" style={{ marginBottom: 0, cursor: "pointer" }}>Active (available for selection)</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
              <Button onClick={() => handleSubmit(!!editItem)} disabled={!form.name}>Save Course</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <Dialog open onOpenChange={() => setDeleteId(null)}>
          <DialogContent style={{ maxWidth: 380 }}>
            <DialogHeader><DialogTitle>Delete Course?</DialogTitle></DialogHeader>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>This will remove the course from your register. Existing training records that reference this course will not be deleted.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteMut.mutate(deleteId!)}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function StaffTrainingPage() {
  const { farmId } = useAppStore();
  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null; redTractorId: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const currentFarm = farmData?.record ?? null;
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const urlMember = params.get("member") ?? undefined;
  const urlTab = (params.get("tab") as Tab | null) ?? "training";

  const [tab, setTab] = useState<Tab>(urlTab);
  const membersQ = useFarmMembers(farmId);
  const staffNames = (membersQ.data?.members ?? []).filter(m => m.isActive !== false).map(memberFullName);
  const staffLoading = membersQ.isLoading;

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
  const trainingRecordsThisYear = trainingRecords.filter(r => isInCropYear(r.trainingDate, currentCropYear()));
  const certificates = certsQ.data?.records ?? [];
  const farmName = currentFarm?.name ?? "Farm";
  const farmCph = currentFarm?.cphNumber ?? null;
  const farmRtId = currentFarm?.redTractorId ?? null;

  return (
    <AppLayout>
      <div style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 10 }}>
          <Link href="/staff" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8125rem", color: "#6b7280", textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Staff
          </Link>
        </div>
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
            onClick={() => printTrainingRegister(trainingRecords, certificates, farmName, membersQ.data?.members ?? [], farmCph, farmRtId)}
            disabled={(trainingRecords.length === 0 && certificates.length === 0) || !currentFarm}
          >
            <Printer size={14} className="mr-2" /> Print Register
          </Button>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "training"} onClick={() => setTab("training")}>
            Training Records {trainingRecordsThisYear.length > 0 && `(${trainingRecordsThisYear.length})`}
          </TabButton>
          <TabButton active={tab === "certificates"} onClick={() => setTab("certificates")}>
            Certificates &amp; Qualifications {certificates.length > 0 && `(${certificates.length})`}
          </TabButton>
          <TabButton active={tab === "rtw"} onClick={() => setTab("rtw")}>
            Right to Work
          </TabButton>
          <TabButton active={tab === "courses"} onClick={() => setTab("courses")}>
            Course Register
          </TabButton>
        </TabBar>

        {!farmId && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", marginBottom: 24, borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1, color: "#d97706" }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#92400e", margin: 0 }}>No farm selected</p>
              <p style={{ fontSize: "0.8125rem", color: "#b45309", margin: "2px 0 0" }}>
                Use the <strong>Current Farm</strong> dropdown in the top-left of the sidebar to select a farm — then this page will load your training records and the Add buttons will become active.
              </p>
            </div>
          </div>
        )}

        {!farmId ? null : tab === "training" ? (
          <TrainingTab farmId={farmId} staffNames={staffNames} staffLoading={staffLoading} defaultMember={tab === "training" ? urlMember : undefined} />
        ) : tab === "certificates" ? (
          <CertificatesTab farmId={farmId} staffNames={staffNames} staffLoading={staffLoading} defaultMember={tab === "certificates" ? urlMember : undefined} />
        ) : tab === "rtw" ? (
          <RightToWorkTab farmId={farmId} staffNames={staffNames} staffLoading={staffLoading} defaultMember={tab === "rtw" ? urlMember : undefined} />
        ) : (
          <CoursesTab farmId={farmId} />
        )}
      </div>
    </AppLayout>
  );
}
