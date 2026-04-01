import React, { useState, useRef } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { ShieldAlert, Plus, Search, Pencil, Trash2, AlertTriangle, Clock, CheckCircle2, ShieldCheck, FlaskConical, Zap, ChevronDown, Flame, Loader2, Paperclip, File as FileIcon } from "lucide-react";

type Tab = "risk" | "coshh" | "pat" | "fire";
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

const HAZARD_TEMPLATES = [
  {
    label: "Manual Handling",
    title: "Manual Handling",
    hazardDescription: "Lifting, carrying and moving heavy loads (bags of feed/fertiliser, equipment parts) causing musculoskeletal injury.",
    controlMeasures: "Training in correct lifting technique provided. Use of mechanical aids (pallet trucks, telehandler) where loads exceed 20kg. Team lifts for awkward loads. Regular risk assessment review.",
    riskLevel: "medium",
  },
  {
    label: "Working at Height",
    title: "Working at Height",
    hazardDescription: "Access to and working on grain store roofs, silage clamps, ladder use, and elevated platform work.",
    controlMeasures: "Harness and anchor point system used. Work at height permits in place. Ladders inspected and secured. No lone working at height. Guard rails fitted where permanent access required.",
    riskLevel: "high",
  },
  {
    label: "Machinery & Moving Parts",
    title: "Machinery – PTO and Moving Parts",
    hazardDescription: "Injury from PTO shafts, augers, conveyors, and rotating machinery components.",
    controlMeasures: "All guards fitted and in good condition before use. PTOs disengaged before dismounting. Operators trained and competent. Pre-use checks completed. Emergency stop procedures displayed.",
    riskLevel: "high",
  },
  {
    label: "Chemical Handling (COSHH)",
    title: "Chemical Handling – Pesticides and Fertilisers",
    hazardDescription: "Skin, eye and respiratory exposure to agrochemicals during mixing, loading and application operations.",
    controlMeasures: "COSHH assessments completed for all products. Full PPE worn (gloves, goggles, overalls, respirator where required). Emergency wash station available at spray fill point. SDS sheets accessible. Waste product disposed of correctly.",
    riskLevel: "high",
  },
  {
    label: "Lone Working",
    title: "Lone Working",
    hazardDescription: "Working alone in remote field locations, grain stores or workshop, reducing access to emergency assistance if injured.",
    controlMeasures: "Lone worker check-in procedure in place. Mobile phone carried at all times. Supervisor informed of working location and expected return time. Buddy system for high-risk tasks. Emergency contacts posted.",
    riskLevel: "medium",
  },
  {
    label: "Young Workers / Visitors",
    title: "Young Workers and Farm Visitors",
    hazardDescription: "Inexperienced young workers and farm visitors (including children) in proximity to hazardous machinery, chemicals and livestock.",
    controlMeasures: "Induction training provided before any work commences. Restricted access zones marked. Visitors accompanied at all times. Young workers not permitted to operate machinery without supervision. Visitor risk assessment completed.",
    riskLevel: "medium",
  },
  {
    label: "Electricity",
    title: "Electrical Hazards",
    hazardDescription: "Fixed and portable electrical equipment, overhead lines, and grain drying / irrigation electrical installations.",
    controlMeasures: "PAT testing completed annually. Fixed installation tested every 5 years. RCDs fitted. Overhead line clearance checked before any tall machinery movement. Wet environments – waterproof rated equipment only. Faults reported immediately.",
    riskLevel: "high",
  },
  {
    label: "Slips, Trips & Falls",
    title: "Slips, Trips and Falls",
    hazardDescription: "Wet and muddy yard surfaces, steep banks, grain store floors, and uneven ground causing slips and falls.",
    controlMeasures: "Anti-slip surfaces installed in high-traffic areas. Good housekeeping maintained. Adequate lighting in buildings. Spills cleared immediately. Appropriate footwear required (steel toe cap, anti-slip).",
    riskLevel: "medium",
  },
  {
    label: "Livestock Handling",
    title: "Livestock Handling",
    hazardDescription: "Crushing, kicking, trampling or goring injuries when handling cattle, sheep, pigs or other livestock.",
    controlMeasures: "Proper handling facilities used at all times. Lone working with cattle not permitted. Trained handlers only. Escape route always available. Protective clothing worn. Seasonal risk (calving, lambing) procedures in place.",
    riskLevel: "high",
  },
];

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

function RiskAssessmentTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [quickFilter, setQuickFilter] = useState<"none" | "overdue" | "due-soon" | "high-critical">("none");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<RiskAssessment | null>(null);
  const [editing, setEditing] = useState<RiskAssessment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<RiskAssessment>>(EMPTY);
  const [showTemplates, setShowTemplates] = useState(false);

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
    if (quickFilter === "overdue") return r.status === "active" && isOverdue(r.reviewDate);
    if (quickFilter === "due-soon") {
      if (!r.reviewDate || r.status !== "active") return false;
      const d = new Date(r.reviewDate), now = new Date(), soon = new Date();
      soon.setDate(soon.getDate() + 30);
      return d >= now && d <= soon;
    }
    if (quickFilter === "high-critical") return r.status === "active" && (r.riskLevel === "high" || r.riskLevel === "critical");
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.area?.toLowerCase().includes(search.toLowerCase()) || r.assessedBy?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === "all" || r.riskLevel === filterRisk;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchRisk && matchStatus;
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<RiskAssessment>) => {
      const url = editing ? `/api/farms/${farmId}/risk-assessments/${editing.id}` : `/api/farms/${farmId}/risk-assessments`;
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] }); toast({ title: editing ? "Assessment updated" : "Assessment added" }); closeDialog(); },
    onError: () => toast({ title: "Error saving assessment", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/risk-assessments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] }); setDeleteId(null); toast({ title: "Assessment deleted" }); },
  });

  function openAdd() { setEditing(null); setForm({ ...EMPTY, assessmentDate: new Date().toISOString().slice(0, 10) }); setShowTemplates(false); setDialogOpen(true); }
  function openEdit(r: RiskAssessment) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate?.slice(0, 10), reviewDate: r.reviewDate?.slice(0, 10) ?? "" });
    setViewRecord(null);
    setShowTemplates(false);
    setDialogOpen(true);
  }
  function closeDialog() { setDialogOpen(false); setEditing(null); setForm(EMPTY); setShowTemplates(false); }
  const set = (k: keyof RiskAssessment, v: string) => setForm(f => ({ ...f, [k]: v }));

  const applyTemplate = (t: typeof HAZARD_TEMPLATES[0]) => {
    setForm(f => ({ ...f, title: t.title, hazardDescription: t.hazardDescription, controlMeasures: t.controlMeasures, riskLevel: t.riskLevel as RiskLevel }));
    setShowTemplates(false);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Active Assessments</p>
          <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
        </div>
        <button
          onClick={() => setQuickFilter(q => q === "high-critical" ? "none" : "high-critical")}
          className={`rounded-lg p-4 text-left border transition-all ${quickFilter === "high-critical" ? "bg-red-50 border-red-500 ring-2 ring-red-100" : "bg-white border-red-200 hover:border-red-400"}`}
        >
          <div className="flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-red-600" /><p className="text-xs text-red-600 uppercase tracking-wide font-medium">High / Critical</p></div>
          <p className="text-2xl font-bold text-red-700">{highCritical}</p>
          <p className="text-xs text-gray-400 mt-0.5">{quickFilter === "high-critical" ? "Filtered — click to clear" : "Click to filter"}</p>
        </button>
        <button
          onClick={() => setQuickFilter(q => q === "overdue" ? "none" : "overdue")}
          className={`rounded-lg p-4 text-left border transition-all ${quickFilter === "overdue" ? "bg-orange-50 border-orange-500 ring-2 ring-orange-100" : "bg-white border-orange-200 hover:border-orange-400"}`}
        >
          <div className="flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5 text-orange-600" /><p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Overdue Reviews</p></div>
          <p className="text-2xl font-bold text-orange-700">{overdueReviews}</p>
          <p className="text-xs text-gray-400 mt-0.5">{quickFilter === "overdue" ? "Filtered — click to clear" : "Click to filter"}</p>
        </button>
        <button
          onClick={() => setQuickFilter(q => q === "due-soon" ? "none" : "due-soon")}
          className={`rounded-lg p-4 text-left border transition-all ${quickFilter === "due-soon" ? "bg-yellow-50 border-yellow-500 ring-2 ring-yellow-100" : "bg-white border-yellow-200 hover:border-yellow-400"}`}
        >
          <div className="flex items-center gap-1.5 mb-1"><ShieldCheck className="w-3.5 h-3.5 text-yellow-600" /><p className="text-xs text-yellow-600 uppercase tracking-wide font-medium">Due in 30 Days</p></div>
          <p className="text-2xl font-bold text-yellow-700">{reviewDueSoon}</p>
          <p className="text-xs text-gray-400 mt-0.5">{quickFilter === "due-soon" ? "Filtered — click to clear" : "Click to filter"}</p>
        </button>
      </div>

      {quickFilter !== "none" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: 16, fontSize: "0.875rem", color: "#92400e" }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>
            Showing <strong>{filtered.length}</strong> {quickFilter === "overdue" ? "overdue review" : quickFilter === "due-soon" ? "review due within 30 days" : "high / critical"} record{filtered.length !== 1 ? "s" : ""} — all statuses
          </span>
          <button onClick={() => setQuickFilter("none")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#92400e", fontWeight: 600, fontSize: "0.875rem", padding: "0 4px" }}>✕ Clear</button>
        </div>
      )}

      <div className={`bg-white rounded-lg border p-4 flex flex-wrap gap-3 items-center mb-4 transition-colors ${quickFilter !== "none" ? "border-amber-300 bg-amber-50/30" : "border-gray-200"}`}>
        {quickFilter !== "none" ? (
          <p className="text-xs text-amber-700 font-medium w-full -mb-1">Quick filter active — search and dropdowns are bypassed</p>
        ) : null}
        <div className="relative flex-1 min-w-48">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${quickFilter !== "none" ? "text-gray-300" : "text-gray-400"}`} />
          <Input placeholder="Search by title, area or assessor…" value={search} onChange={e => { setSearch(e.target.value); setQuickFilter("none"); }} className="pl-9" disabled={quickFilter !== "none"} />
        </div>
        <Select value={filterRisk} onValueChange={v => { setFilterRisk(v); setQuickFilter("none"); }} disabled={quickFilter !== "none"}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risk level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setQuickFilter("none"); }} disabled={quickFilter !== "none"}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Assessment
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading assessments…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <ShieldAlert className="w-8 h-8 text-gray-300" />
            <p className="text-gray-500 text-sm">No risk assessments found</p>
            <p className="text-gray-400 text-xs">Add your first risk assessment or use a template to get started quickly</p>
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
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{r.title}</p>{r.area && <p className="text-xs text-gray-500">{r.area}</p>}</td>
                  <td className="px-4 py-3">{r.riskLevel ? <Badge className={`capitalize ${RISK_COLORS[r.riskLevel] ?? ""}`}>{r.riskLevel}</Badge> : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.assessedBy || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.assessmentDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.reviewDate ? <span className={isOverdue(r.reviewDate) ? "text-red-600 font-medium" : "text-gray-600"}>{isOverdue(r.reviewDate) && "⚠ "}{fmt(r.reviewDate)}</span> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3"><Badge className={`capitalize ${STATUS_COLORS[r.status] ?? ""}`}>{r.status.replace("-", " ")}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setViewRecord(r)}>View</Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "54rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              {editing ? "Edit Risk Assessment" : "New Risk Assessment"}
            </DialogTitle>
          </DialogHeader>
          {!editing && (
            <div>
              <button
                onClick={() => setShowTemplates(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", color: "#166534", fontWeight: 500 }}
              >
                <Zap size={13} /> Use a hazard template <ChevronDown size={13} style={{ marginLeft: 2, transform: showTemplates ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showTemplates && (
                <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {HAZARD_TEMPLATES.map(t => (
                    <button
                      key={t.label}
                      onClick={() => applyTemplate(t)}
                      style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", cursor: "pointer", textAlign: "left", fontSize: "0.8rem", color: "#374151", fontWeight: 500, transition: "border-color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#16a34a")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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

      {viewRecord && !dialogOpen && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> {viewRecord.title}
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
    </div>
  );
}

const HAZARD_CLASSIFICATIONS = [
  "Flammable (F)",
  "Highly Flammable (F+)",
  "Corrosive (C)",
  "Irritant (Xi)",
  "Harmful (Xn)",
  "Toxic (T)",
  "Very Toxic (T+)",
  "Oxidising (O)",
  "Explosive (E)",
  "Environmentally Hazardous (N)",
  "Carcinogenic / Mutagenic / Reprotoxic (CMR)",
  "None / Low Hazard",
];

const COSHH_PPE_OPTIONS = [
  "Nitrile gloves",
  "Chemical-resistant gloves",
  "Safety goggles",
  "Face shield",
  "Disposable overalls",
  "Chemical-resistant overalls",
  "Half-face respirator (A/P filter)",
  "Full-face respirator",
  "RPE with P3 filter",
  "Rubber boots",
  "Steel toe cap boots",
  "Apron",
];

function CoshhTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: new Date().toISOString().slice(0, 10), reviewDate: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);
  const [search, setSearch] = useState("");

  const q = useQuery({
    queryKey: ["risk-coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/risk-coshh`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["risk-coshh", farmId] });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const payload = {
        ...body,
        assessmentDate: body.assessmentDate ? new Date(body.assessmentDate).toISOString() : new Date().toISOString(),
        reviewDate: body.reviewDate ? new Date(body.reviewDate).toISOString() : null,
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/risk-coshh/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/risk-coshh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: editRecord ? "COSHH record updated" : "COSHH record saved" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/risk-coshh/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const filtered = records.filter(r => !search || r.substanceName?.toLowerCase().includes(search.toLowerCase()) || r.manufacturer?.toLowerCase().includes(search.toLowerCase()) || r.usageArea?.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: any) => {
    setEditRecord(r);
    setForm({ ...r, assessmentDate: r.assessmentDate?.slice(0, 10) ?? "", reviewDate: r.reviewDate?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };

  const overdueReviews = records.filter(r => r.reviewDate && new Date(r.reviewDate) < new Date()).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 6, padding: "6px 12px", fontSize: "0.8rem", color: "#92400e" }}>
          <FlaskConical size={13} />
          <span style={{ fontWeight: 600 }}>{records.length} substance{records.length !== 1 ? "s" : ""} assessed</span>
          {overdueReviews > 0 && <span> — <strong>{overdueReviews}</strong> review{overdueReviews !== 1 ? "s" : ""} overdue</span>}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search substances…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, width: 220 }} />
        </div>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add COSHH Record</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <FlaskConical size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No COSHH records</p>
          <p style={{ fontSize: "0.875rem" }}>Record COSHH assessments for all hazardous substances used on the farm — pesticides, diesel, oils, cleaning agents and veterinary chemicals.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Substance", "Manufacturer", "Hazard Classification", "Usage Area", "Storage", "Assessed By", "Assessment Date", "Review Due", "PPE Required", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => {
                const reviewOverdue = r.reviewDate && new Date(r.reviewDate) < new Date();
                return (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{r.substanceName}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.manufacturer || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {r.hazardClassification ? (
                        <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.7rem" }}>{r.hazardClassification}</Badge>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.usageArea || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.storageLocation || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.assessedBy || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.assessmentDate)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>
                      <span style={{ color: reviewOverdue ? "#991b1b" : "#6b7280", fontWeight: reviewOverdue ? 600 : 400 }}>
                        {reviewOverdue && "⚠ "}{fmt(r.reviewDate)}
                      </span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160, fontSize: "0.75rem" }}>{r.ppe || "—"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 600 }}>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-amber-600" />{editRecord ? "Edit COSHH Record" : "New COSHH Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Substance Name <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Glyphosate 360 g/L" value={form.substanceName} onChange={e => setForm((f: any) => ({ ...f, substanceName: e.target.value }))} /></div>
              <div><Label>Manufacturer / Supplier</Label><Input placeholder="e.g. Monsanto" value={form.manufacturer} onChange={e => setForm((f: any) => ({ ...f, manufacturer: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Hazard Classification</Label>
              <Select value={form.hazardClassification} onValueChange={v => setForm((f: any) => ({ ...f, hazardClassification: v }))}>
                <SelectTrigger><SelectValue placeholder="Select classification…" /></SelectTrigger>
                <SelectContent>{HAZARD_CLASSIFICATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Usage Area</Label><Input placeholder="e.g. Arable crops, spray season" value={form.usageArea} onChange={e => setForm((f: any) => ({ ...f, usageArea: e.target.value }))} /></div>
              <div><Label>Storage Location</Label><Input placeholder="e.g. Chemical store, locked cabinet" value={form.storageLocation} onChange={e => setForm((f: any) => ({ ...f, storageLocation: e.target.value }))} /></div>
            </div>
            <div><Label>Control Measures</Label><Textarea placeholder="Engineering controls, ventilation, safe handling procedures…" value={form.controlMeasures} onChange={e => setForm((f: any) => ({ ...f, controlMeasures: e.target.value }))} rows={2} /></div>
            <div><Label>PPE Required</Label><Input placeholder="e.g. Nitrile gloves, goggles, half-face respirator (A/P filter)" value={form.ppe} onChange={e => setForm((f: any) => ({ ...f, ppe: e.target.value }))} /></div>
            <div><Label>Emergency Procedures</Label><Textarea placeholder="Spillage, first aid, emergency contacts…" value={form.emergencyProcedures} onChange={e => setForm((f: any) => ({ ...f, emergencyProcedures: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assessed By</Label><Input value={form.assessedBy} onChange={e => setForm((f: any) => ({ ...f, assessedBy: e.target.value }))} /></div>
              <div><Label>Assessment Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.assessmentDate} onChange={e => setForm((f: any) => ({ ...f, assessmentDate: e.target.value }))} /></div>
            </div>
            <div><Label>Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm((f: any) => ({ ...f, reviewDate: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea placeholder="SDS sheet location, disposal instructions…" value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.substanceName || !form.assessmentDate || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete COSHH Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this COSHH record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ value, map }: { value: string; map: Record<string, { label: string; colour: string }> }) {
  const entry = map[value] ?? { label: value, colour: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${entry.colour}`}>{entry.label}</span>;
}

function DocCell({ endpoint, queryKey, documentPath, documentName }: {
  endpoint: string;
  queryKey: unknown[];
  documentPath: string | null;
  documentName: string | null;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }) });
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      const fileName = objectPath.split("/").pop() ?? file.name;
      await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) });
      qc.invalidateQueries({ queryKey });
    } finally { setUploading(false); }
  }

  async function handleRemove() {
    await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: null, documentName: null }) });
    qc.invalidateQueries({ queryKey });
  }

  return (
    <div className="flex items-center gap-1">
      {documentPath ? (
        <>
          <a href={`/api/storage${documentPath}`} target="_blank" rel="noopener noreferrer" title={documentName || "View document"} className="flex items-center text-blue-600 p-1"><FileIcon className="h-3.5 w-3.5" /></a>
          <button onClick={handleRemove} title="Remove document" className="text-gray-300 hover:text-gray-500 p-1 leading-none" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
        </>
      ) : (
        <>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : <button onClick={() => fileRef.current?.click()} title="Attach certificate copy" className="text-gray-300 hover:text-gray-500 p-1" style={{ background: "none", border: "none", cursor: "pointer" }}><Paperclip className="h-3.5 w-3.5" /></button>}
        </>
      )}
    </div>
  );
}

// ─── PAT Testing tab ───────────────────────────────────────────────────────────

interface PatTest {
  id: number; farmId: number; itemName: string; location: string | null; testDate: string;
  testerName: string | null; testerCompany: string | null; certificateNumber: string | null;
  result: string; nextDueDate: string | null; notes: string | null;
  documentPath: string | null; documentName: string | null; createdAt: string;
}

const PAT_RESULT: Record<string, { label: string; colour: string }> = {
  pass:     { label: "Pass",     colour: "bg-green-100 text-green-700" },
  fail:     { label: "Fail",     colour: "bg-red-100 text-red-700" },
  advisory: { label: "Advisory", colour: "bg-amber-100 text-amber-700" },
};

const EMPTY_PAT = { itemName: "", location: "", testDate: "", testerName: "", testerCompany: "", certificateNumber: "", result: "pass", nextDueDate: "", notes: "" };

function PatTestingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PatTest | null>(null);
  const [form, setForm] = useState(EMPTY_PAT);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: PatTest[] }>({
    queryKey: ["pat-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/workshop/pat-tests`, { credentials: "include" }).then(r => r.json()),
  });

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/workshop/pat-tests`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pat-tests", farmId] }); setShowForm(false); setForm(EMPTY_PAT); },
  });

  const updateMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/workshop/pat-tests/${editing!.id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pat-tests", farmId] }); setShowForm(false); setEditing(null); setForm(EMPTY_PAT); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/workshop/pat-tests/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pat-tests", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: PatTest) {
    setEditing(r);
    setForm({ itemName: r.itemName, location: r.location ?? "", testDate: r.testDate ? r.testDate.slice(0, 10) : "", testerName: r.testerName ?? "", testerCompany: r.testerCompany ?? "", certificateNumber: r.certificateNumber ?? "", result: r.result, nextDueDate: r.nextDueDate ? r.nextDueDate.slice(0, 10) : "", notes: r.notes ?? "" });
    setShowForm(true);
  }

  const today = new Date();
  const records = data?.records ?? [];
  const overdue = records.filter(r => r.nextDueDate && new Date(r.nextDueDate) < today).length;

  if (isLoading) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Track Portable Appliance Testing for all electrical equipment on the holding. Required under the Electricity at Work Regulations 1989 and Health & Safety at Work Act 1974.</p>
          {overdue > 0 && <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {overdue} item{overdue !== 1 ? "s" : ""} overdue for testing</p>}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm(EMPTY_PAT); setShowForm(true); }} className="gap-1"><Plus className="h-4 w-4" />Log PAT Test</Button>
      </div>

      {records.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400 text-sm">No PAT test records yet. Log the first test to start tracking compliance.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>{["Item / Appliance", "Location", "Test Date", "Tester", "Cert No.", "Result", "Next Due", "Cert Doc", ""].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => {
                const due = r.nextDueDate ? new Date(r.nextDueDate) : null;
                const isOverdue = due && due < today;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.itemName}</td>
                    <td className="px-4 py-3 text-gray-500">{r.location || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.testDate ? new Date(r.testDate).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{[r.testerName, r.testerCompany].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.certificateNumber || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge value={r.result} map={PAT_RESULT} /></td>
                    <td className="px-4 py-3">
                      {due ? <span className={cn("text-xs font-medium", isOverdue ? "text-red-600" : "text-gray-500")}>{isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}{due.toLocaleDateString("en-GB")}</span> : "—"}
                    </td>
                    <td className="px-2 py-3"><DocCell endpoint={`/api/farms/${farmId}/workshop/pat-tests/${r.id}`} queryKey={["pat-tests", farmId]} documentPath={r.documentPath ?? null} documentName={r.documentName ?? null} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "40rem" }} aria-describedby={undefined}>
            <DialogHeader><DialogTitle>{editing ? "Edit PAT Test" : "Log PAT Test"}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); editing ? updateMut.mutate(form) : createMut.mutate(form); }} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Item / Appliance Name *</Label><Input required value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} placeholder="e.g. Angle Grinder, Extension Lead, Welder" /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main workshop, Store room" /></div>
                <div>
                  <Label>Result</Label>
                  <Select value={form.result} onValueChange={v => setForm(f => ({ ...f, result: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pass">Pass</SelectItem><SelectItem value="fail">Fail</SelectItem><SelectItem value="advisory">Advisory</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Test Date</Label><Input type="date" value={form.testDate} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} /></div>
                <div><Label>Next Test Due</Label><Input type="date" value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} /></div>
                <div><Label>Tester Name</Label><Input value={form.testerName} onChange={e => setForm(f => ({ ...f, testerName: e.target.value }))} /></div>
                <div><Label>Tester Company</Label><Input value={form.testerCompany} onChange={e => setForm(f => ({ ...f, testerCompany: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Certificate Number</Label><Input value={form.certificateNumber} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} className="font-mono" /></div>
                <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add Record"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Delete PAT Record?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will permanently remove the PAT test record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Fire Safety tab ───────────────────────────────────────────────────────────

interface FireExtinguisher {
  id: number; farmId: number; location: string; type: string;
  capacityKg: string | null; serialNumber: string | null;
  lastServiceDate: string | null; engineerName: string | null;
  engineerCompany: string | null; nextServiceDue: string | null; notes: string | null; createdAt: string;
}

const FIRE_TYPES: { value: string; label: string }[] = [
  { value: "co2",          label: "CO₂ (Red/Black) — electrical fires" },
  { value: "dry_powder",   label: "Dry Powder (Red/Blue) — general purpose" },
  { value: "water",        label: "Water (Red) — paper/wood fires" },
  { value: "foam",         label: "Foam (Red/Cream) — liquid fires" },
  { value: "wet_chemical", label: "Wet Chemical (Red/Yellow) — cooking oils" },
];

const FIRE_TYPE_LABEL: Record<string, string> = { co2: "CO₂", dry_powder: "Dry Powder", water: "Water", foam: "Foam", wet_chemical: "Wet Chemical" };
const EMPTY_FIRE = { location: "", type: "co2", capacityKg: "", serialNumber: "", lastServiceDate: "", engineerName: "", engineerCompany: "", nextServiceDue: "", notes: "" };

function FireSafetyTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FireExtinguisher | null>(null);
  const [form, setForm] = useState(EMPTY_FIRE);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: FireExtinguisher[] }>({
    queryKey: ["fire-extinguishers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers`, { credentials: "include" }).then(r => r.json()),
  });

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] }); setShowForm(false); setForm(EMPTY_FIRE); },
  });

  const updateMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${editing!.id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] }); setShowForm(false); setEditing(null); setForm(EMPTY_FIRE); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/workshop/fire-extinguishers/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fire-extinguishers", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: FireExtinguisher) {
    setEditing(r);
    setForm({ location: r.location, type: r.type, capacityKg: r.capacityKg ?? "", serialNumber: r.serialNumber ?? "", lastServiceDate: r.lastServiceDate ? r.lastServiceDate.slice(0, 10) : "", engineerName: r.engineerName ?? "", engineerCompany: r.engineerCompany ?? "", nextServiceDue: r.nextServiceDue ? r.nextServiceDue.slice(0, 10) : "", notes: r.notes ?? "" });
    setShowForm(true);
  }

  const today = new Date();
  const records = data?.records ?? [];
  const overdue = records.filter(r => r.nextServiceDue && new Date(r.nextServiceDue) < today).length;
  const dueSoon = records.filter(r => { if (!r.nextServiceDue) return false; const d = new Date(r.nextServiceDue); const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000); return diff >= 0 && diff <= 60; }).length;

  if (isLoading) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Register all fire extinguishers on the holding. Required under the Regulatory Reform (Fire Safety) Order 2005. Extinguishers must be serviced annually by a competent person.</p>
          {overdue > 0 && <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {overdue} extinguisher{overdue !== 1 ? "s" : ""} overdue for service</p>}
          {overdue === 0 && dueSoon > 0 && <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {dueSoon} extinguisher{dueSoon !== 1 ? "s" : ""} due for service within 60 days</p>}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm(EMPTY_FIRE); setShowForm(true); }} className="gap-1"><Plus className="h-4 w-4" />Add Extinguisher</Button>
      </div>

      {records.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400 text-sm">No extinguishers registered yet. Add each extinguisher on the holding to track annual service dates.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>{["Location", "Type", "Capacity", "Serial No.", "Last Service", "Engineer", "Next Service Due", ""].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => {
                const due = r.nextServiceDue ? new Date(r.nextServiceDue) : null;
                const isOverdue = due && due < today;
                const diff = due ? Math.ceil((due.getTime() - today.getTime()) / 86400000) : null;
                const isSoon = diff !== null && diff >= 0 && diff <= 60;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.location}</td>
                    <td className="px-4 py-3">{FIRE_TYPE_LABEL[r.type] ?? r.type}</td>
                    <td className="px-4 py-3 text-gray-500">{r.capacityKg ? `${r.capacityKg} kg` : "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.serialNumber || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.lastServiceDate ? new Date(r.lastServiceDate).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{[r.engineerName, r.engineerCompany].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      {due ? <span className={cn("text-xs font-medium", isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-gray-500")}>{(isOverdue || isSoon) && <AlertTriangle className="h-3 w-3 inline mr-1" />}{due.toLocaleDateString("en-GB")}</span> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "40rem" }} aria-describedby={undefined}>
            <DialogHeader><DialogTitle>{editing ? "Edit Extinguisher" : "Add Fire Extinguisher"}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); editing ? updateMut.mutate(form) : createMut.mutate(form); }} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Location *</Label><Input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main workshop entrance, Grain store" /></div>
                <div className="col-span-2">
                  <Label>Extinguisher Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FIRE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Capacity (kg)</Label><Input value={form.capacityKg} onChange={e => setForm(f => ({ ...f, capacityKg: e.target.value }))} placeholder="e.g. 6" /></div>
                <div><Label>Serial Number</Label><Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} className="font-mono" /></div>
                <div><Label>Last Service Date</Label><Input type="date" value={form.lastServiceDate} onChange={e => setForm(f => ({ ...f, lastServiceDate: e.target.value }))} /></div>
                <div><Label>Next Service Due</Label><Input type="date" value={form.nextServiceDue} onChange={e => setForm(f => ({ ...f, nextServiceDue: e.target.value }))} /></div>
                <div><Label>Engineer Name</Label><Input value={form.engineerName} onChange={e => setForm(f => ({ ...f, engineerName: e.target.value }))} /></div>
                <div><Label>Engineer Company</Label><Input value={form.engineerCompany} onChange={e => setForm(f => ({ ...f, engineerCompany: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add Extinguisher"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Remove Extinguisher?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will permanently remove this extinguisher record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page shell ────────────────────────────────────────────────────────────────

export default function RiskAssessmentsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("risk");

  return (
    <AppLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-700" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Health, Safety & Risk</h1>
            <p className="text-sm text-gray-500">Risk assessments, COSHH records, PAT testing, and fire safety — covering your legal obligations under UK health & safety law and Red Tractor requirements</p>
          </div>
        </div>
        <TabBar className="mb-2">
          <TabButton active={tab === "risk"} onClick={() => setTab("risk")}><ShieldAlert className="h-3.5 w-3.5 mr-1 inline-block" />Risk Assessments</TabButton>
          <TabButton active={tab === "coshh"} onClick={() => setTab("coshh")}><FlaskConical className="h-3.5 w-3.5 mr-1 inline-block" />COSHH Records</TabButton>
          <TabButton active={tab === "pat"} onClick={() => setTab("pat")}><Zap className="h-3.5 w-3.5 mr-1 inline-block" />PAT Testing</TabButton>
          <TabButton active={tab === "fire"} onClick={() => setTab("fire")}><Flame className="h-3.5 w-3.5 mr-1 inline-block" />Fire Safety</TabButton>
        </TabBar>
        {farmId && tab === "risk" && <RiskAssessmentTab farmId={farmId} />}
        {farmId && tab === "coshh" && <CoshhTab farmId={farmId} />}
        {farmId && tab === "pat" && <PatTestingTab farmId={farmId} />}
        {farmId && tab === "fire" && <FireSafetyTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
