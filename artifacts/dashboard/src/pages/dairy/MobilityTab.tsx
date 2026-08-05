import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, PieChart, Pie, Cell, Legend } from "recharts";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DocAttach } from "@/components/DocAttach";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Eye, Droplets, Thermometer, FileDown, Paperclip, BarChart2, QrCode, Download, MapPin, ChevronsUpDown, Search, X, Sparkles, ClipboardList, Printer, Building2, ShoppingCart, PackageCheck, Receipt, Clock, BadgeCheck, XCircle, TrendingUp, TrendingDown, Package, Check, FlaskConical } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { QRCodeSVG } from "qrcode.react";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { openPrintWindow } from "@/lib/print-report";
import { VMD_MEDICINES } from "@/data/vmdMedicines";
import { useToast } from "@/hooks/use-toast";
import { api, formatDate, today } from "./shared";

// ─── Mobility Scoring ──────────────────────────────────────────────────────────

interface ScoringAnimal {
  id?: number;
  animalTag: string;
  earTagNumber?: string | null;
  animalId?: number | null;
  scoreGrade: 2 | 3;
  notes?: string | null;
}

interface MobilityScoring {
  id: number; herdId?: number | null; assessmentDate: string; assessedBy?: string | null;
  totalCowsScored: number; score0Count: number; score1Count: number; score2Count: number; score3Count: number;
  lamenessPrevalencePercent?: string | null; actionTaken?: string | null;
  nextAssessmentDue?: string | null; notes?: string | null;
  score3AnimalTags?: string | null; score2AnimalTags?: string | null;
  animals?: ScoringAnimal[];
}

export function MobilityTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MobilityScoring | null>(null);
  const [viewRecord, setViewRecord] = useState<MobilityScoring | null>(null);
  const [form, setForm] = useState<Partial<MobilityScoring>>({});
  const [animals, setAnimals] = useState<ScoringAnimal[]>([]);
  const [pendingTag, setPendingTag] = useState("");
  const [pendingScore, setPendingScore] = useState<2 | 3>(3);
  const [pendingNotes, setPendingNotes] = useState("");

  const { data, isLoading } = useQuery<{ records: MobilityScoring[] }>({
    queryKey: ["dairy-mobility", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mobility-scorings`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: staffData } = useQuery<{ names: string[] }>({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then(r => r.json()),
  });
  const staffNames = staffData?.names ?? [];

  const save = useMutation({
    mutationFn: async (body: Partial<MobilityScoring>) => {
      const url = editing ? api(`farms/${farmId}/dairy/mobility-scorings/${editing.id}`) : api(`farms/${farmId}/dairy/mobility-scorings`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }); setOpen(false); setEditing(null); setForm({}); setAnimals([]); setPendingTag(""); setPendingNotes(""); setPendingScore(3); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/mobility-scorings/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { data: cattleData } = useQuery<{ records: Array<{ id: number; tagNumber: string | null; earTagNumber: string | null; animalCode: string | null; breed: string | null; status: string }> }>({
    queryKey: ["farm-cattle", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then(r => r.json()).catch(() => ({ records: [] })),
    enabled: open,
  });
  const cattleList = (cattleData?.records ?? []).filter(a => a.status === "active");
  const cattleTagListId = `cattle-tags-${farmId}`;

  function openAdd() {
    setEditing(null);
    setForm({ assessmentDate: today(), score0Count: 0, score1Count: 0, score2Count: 0, score3Count: 0, assessedBy: myName });
    setAnimals([]);
    setPendingTag(""); setPendingScore(3); setPendingNotes("");
    setOpen(true);
  }
  function openEdit(r: MobilityScoring) {
    setEditing(r);
    setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10), nextAssessmentDue: r.nextAssessmentDue?.slice(0, 10) });
    setAnimals((r.animals ?? []).map(a => ({ ...a, scoreGrade: (a.scoreGrade === 2 ? 2 : 3) as 2 | 3 })));
    setPendingTag(""); setPendingScore(3); setPendingNotes("");
    setOpen(true);
  }
  function set(k: keyof MobilityScoring, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  function addAnimal() {
    const tag = pendingTag.trim();
    if (!tag) return;
    const matched = cattleList.find(c => (c.tagNumber || "").toLowerCase() === tag.toLowerCase() || (c.earTagNumber || "").toLowerCase() === tag.toLowerCase());
    setAnimals(prev => [...prev, {
      animalTag: tag,
      earTagNumber: matched?.earTagNumber ?? null,
      animalId: matched?.id ?? null,
      scoreGrade: pendingScore,
      notes: pendingNotes.trim() || null,
    }]);
    setPendingTag(""); setPendingNotes("");
  }
  function removeAnimal(idx: number) { setAnimals(prev => prev.filter((_, i) => i !== idx)); }

  function handleAssessmentDateChange(dateStr: string) {
    const updates: Partial<MobilityScoring> = { assessmentDate: dateStr };
    // Auto-calculate next assessment due = 91 days (13 weeks) from assessment date
    if (dateStr) {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + 91);
      updates.nextAssessmentDue = d.toISOString().slice(0, 10);
    }
    setForm(f => ({ ...f, ...updates }));
  }

  const total = (form.score0Count || 0) + (form.score1Count || 0) + (form.score2Count || 0) + (form.score3Count || 0);
  const prevalence = total > 0 ? (((form.score3Count || 0) / total) * 100).toFixed(1) : null;
  const score2Pct = total > 0 ? (((form.score2Count || 0) / total) * 100).toFixed(1) : null;

  const staffListId = `mobility-staff-${farmId}`;

  const allMobilityRecords = data?.records ?? [];

  const [yearFilterMob, setYearFilterMob] = useState("all");
  const yearsMob = useMemo(() => {
    const s = new Set(allMobilityRecords.map(r => r.assessmentDate?.slice(0, 4)).filter(Boolean) as string[]);
    return Array.from(s).sort().reverse();
  }, [allMobilityRecords]);
  const filteredMobilityRecords = useMemo(
    () => yearFilterMob === "all" ? allMobilityRecords : allMobilityRecords.filter(r => r.assessmentDate?.startsWith(yearFilterMob)),
    [allMobilityRecords, yearFilterMob],
  );

  const mobilityTrend = React.useMemo(() => {
    return [...allMobilityRecords]
      .filter(r => r.assessmentDate && r.lamenessPrevalencePercent != null)
      .sort((a, b) => a.assessmentDate.localeCompare(b.assessmentDate))
      .map(r => ({
        date: new Date(r.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }),
        lameness: parseFloat(r.lamenessPrevalencePercent!),
        total: r.totalCowsScored,
      }));
  }, [allMobilityRecords]);

  function generateMobilityReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const records = [...allMobilityRecords].sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate));
    const total = records.length;
    const aboveTarget = records.filter(r => r.lamenessPrevalencePercent && parseFloat(r.lamenessPrevalencePercent) >= 10).length;
    const avgLameness = total > 0 ? (records.reduce((s, r) => s + (r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : 0), 0) / total).toFixed(1) : "—";
    const rows = records.map(r => {
      const lam = r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null;
      const lamCell = lam != null ? `<span style="color:${lam >= 10 ? "#b91c1c" : "#166534"};font-weight:600">${lam.toFixed(1)}%${lam >= 10 ? " ⚠" : ""}</span>` : "—";
      return `<tr>
        <td>${new Date(r.assessmentDate).toLocaleDateString("en-GB")}</td>
        <td>${r.assessedBy || "—"}</td>
        <td>${r.totalCowsScored}</td>
        <td>${r.score0Count}</td>
        <td>${r.score1Count}</td>
        <td>${r.score2Count}</td>
        <td>${r.score3Count}</td>
        <td>${lamCell}</td>
        <td style="font-size:9px">${(r.animals && r.animals.length > 0) ? r.animals.map((a: ScoringAnimal) => `[${a.scoreGrade}] ${a.animalTag}`).join(", ") : (r.score3AnimalTags || r.score2AnimalTags || "—")}</td>
        <td style="font-size:9px">${r.actionTaken || "—"}</td>
        <td>${r.nextAssessmentDue ? new Date(r.nextAssessmentDue).toLocaleDateString("en-GB") : "—"}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Mobility Scoring — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:10px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Mobility / Lameness Scoring Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2><p style="margin:4px 0;font-size:9px;color:#6b7280">Quarterly assessment required. Score 3 (lame) target: below 10% of herd.</p></div>
  <div class="hdr-r"><b>${total} assessment${total !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${total}</div><div class="kpi-lbl">Total assessments</div></div>
  <div class="kpi-box"><div class="kpi-val">${avgLameness}%</div><div class="kpi-lbl">Average lameness prevalence</div></div>
  <div class="kpi-box"><div class="kpi-val">${aboveTarget}</div><div class="kpi-lbl">Sessions above 10% target</div></div>
</div>
<h3>All Mobility Assessments</h3>
<table>
  <tr><th>Date</th><th>Assessed By</th><th>Total</th><th>Score 0</th><th>Score 1</th><th>Score 2</th><th>Score 3</th><th>Lameness %</th><th>Lame tags</th><th>Action Taken</th><th>Next Due</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Mobility scoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires quarterly mobility scoring. Score 3 (severely lame) target: below 10% of herd. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <datalist id={staffListId}>{staffNames.map(n => <option key={n} value={n} />)}</datalist>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <p className="text-sm text-gray-500">Quarterly mobility/lameness scoring — score cows 0–3 as they walk from the parlour. Red Tractor target: score 3 (lame) cows below 10% of herd. Next assessment date auto-calculates at 13 weeks.</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={yearFilterMob} onValueChange={setYearFilterMob}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsMob.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateMobilityReport} disabled={allMobilityRecords.length === 0}>
            <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
          </Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Assessment</Button>
        </div>
      </div>

      {/* ── Lameness trend chart ── */}
      {mobilityTrend.length >= 2 && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm font-semibold text-gray-700 mb-0.5">Lameness Prevalence Trend</p>
            <p className="text-xs text-gray-400 mb-3">Score 3 (lame) cows as a % of herd per assessment session — Red Tractor target below 10%</p>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={mobilityTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, "auto"]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: unknown) => [`${v}%`, "Lameness"]} />
                <ReferenceLine y={10} stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "10% target", position: "right", fontSize: 9, fill: "#dc2626" }} />
                <Bar dataKey="lameness" name="Lameness %" fill="#fca5a5" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="lameness" name="Trend" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626", r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ── View dialog ── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "48rem" }}>
            <DialogHeader><DialogTitle>Mobility Assessment — {formatDate(viewRecord.assessmentDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{formatDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{viewRecord.assessedBy || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Scored</p><p className="font-medium">{viewRecord.totalCowsScored}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lameness Prevalence</p>
                <p className={`font-semibold ${viewRecord.lamenessPrevalencePercent && parseFloat(viewRecord.lamenessPrevalencePercent) >= 10 ? "text-red-600" : "text-green-700"}`}>
                  {viewRecord.lamenessPrevalencePercent ? `${parseFloat(viewRecord.lamenessPrevalencePercent).toFixed(1)}%` : "—"}
                  {viewRecord.lamenessPrevalencePercent && parseFloat(viewRecord.lamenessPrevalencePercent) >= 10 ? " — Above target" : ""}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Score Distribution</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Score 0 (Normal): {viewRecord.score0Count}</span>
                  <span className="bg-lime-100 text-lime-800 px-2 py-1 rounded font-medium">Score 1: {viewRecord.score1Count}</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">Score 2 (Impaired): {viewRecord.score2Count}</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">Score 3 (Lame): {viewRecord.score3Count}</span>
                </div>
              </div>
              {(viewRecord.animals && viewRecord.animals.length > 0) ? (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Individual Animal Records</p>
                  <div className="flex flex-col gap-1">
                    {viewRecord.animals.filter(a => a.scoreGrade === 3).length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Score 3 — Lame</p>
                        {viewRecord.animals.filter(a => a.scoreGrade === 3).map((a, i) => (
                          <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-2 py-1 text-xs">
                            <span className="bg-red-500 text-white rounded px-1.5 py-0.5 font-bold text-xs">3</span>
                            <span className="font-mono font-medium text-red-900">{a.animalTag}</span>
                            {a.notes && <span className="text-red-600 italic">{a.notes}</span>}
                          </div>
                        ))}
                      </>
                    )}
                    {viewRecord.animals.filter(a => a.scoreGrade === 2).length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mt-1">Score 2 — Impaired (Monitor)</p>
                        {viewRecord.animals.filter(a => a.scoreGrade === 2).map((a, i) => (
                          <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-2 py-1 text-xs">
                            <span className="bg-amber-500 text-white rounded px-1.5 py-0.5 font-bold text-xs">2</span>
                            <span className="font-mono font-medium text-amber-900">{a.animalTag}</span>
                            {a.notes && <span className="text-amber-600 italic">{a.notes}</span>}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {viewRecord.score3AnimalTags && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Score 3 — Ear Tag Numbers</p>
                      <p className="font-medium text-red-700 bg-red-50 rounded px-2 py-1 text-xs mt-1">{viewRecord.score3AnimalTags}</p>
                    </div>
                  )}
                  {viewRecord.score2AnimalTags && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Score 2 — Ear Tag Numbers (Monitor)</p>
                      <p className="font-medium text-amber-700 bg-amber-50 rounded px-2 py-1 text-xs mt-1">{viewRecord.score2AnimalTags}</p>
                    </div>
                  )}
                </>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Taken</p><p className="font-medium">{viewRecord.actionTaken || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Assessment Due</p>
                <p className="font-medium">{formatDate(viewRecord.nextAssessmentDue)}
                  <span className="text-xs text-gray-400 ml-1">(auto-calculated 13 weeks)</span>
                </p>
              </div>
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Summary strip ── */}
      {!isLoading && filteredMobilityRecords.length > 0 && (() => {
        const totalCows = filteredMobilityRecords.reduce((s, r) => s + (r.totalCowsScored ?? 0), 0);
        const lamValues = filteredMobilityRecords.map(r => r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null).filter((v): v is number => v !== null);
        const avgLameness = lamValues.length > 0 ? lamValues.reduce((a, b) => a + b, 0) / lamValues.length : null;
        const aboveTarget = lamValues.filter(v => v >= 10).length;
        return (
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }}>Assessments</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }}>{filteredMobilityRecords.length}</p>
            </div>
            {totalCows > 0 && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Cows Scored</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }}>{totalCows.toLocaleString("en-GB")}</p>
              </div>
            )}
            {avgLameness !== null && (
              <div style={{ background: avgLameness >= 10 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${avgLameness >= 10 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 160 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: avgLameness >= 10 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Avg Lameness Prevalence</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: avgLameness >= 10 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }}>{avgLameness.toFixed(1)}<span style={{ fontSize: "0.7rem", fontWeight: 500 }}>%</span></p>
                <p style={{ fontSize: "0.65rem", color: avgLameness >= 10 ? "#b91c1c" : "#15803d", margin: "2px 0 0" }}>{avgLameness >= 10 ? "Above 10% target" : "Within target"}</p>
              </div>
            )}
            {aboveTarget > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>Above 10% Target</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }}>{aboveTarget} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>session{aboveTarget !== 1 ? "s" : ""}</span></p>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Record list ── */}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!filteredMobilityRecords.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No mobility assessments{yearFilterMob !== "all" ? ` for ${yearFilterMob}` : ""} yet. Assessments should be carried out at least quarterly.</CardContent></Card>}
          {filteredMobilityRecords.map(r => {
            const lam = r.lamenessPrevalencePercent ? parseFloat(r.lamenessPrevalencePercent) : null;
            const s2pct = r.totalCowsScored > 0 ? (r.score2Count / r.totalCowsScored) * 100 : 0;
            return (
              <Card key={r.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setViewRecord(r)}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-sm">{formatDate(r.assessmentDate)}</span>
                      <span className="text-xs text-gray-500">{r.totalCowsScored} cows scored</span>
                      <div className="flex gap-1 text-xs">
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">0: {r.score0Count}</span>
                        <span className="bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded">1: {r.score1Count}</span>
                        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">2: {r.score2Count}</span>
                        <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">3: {r.score3Count}</span>
                      </div>
                      {lam !== null && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lam >= 10 ? "bg-red-100 text-red-700" : lam >= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          Lameness: {lam.toFixed(1)}%{lam >= 10 ? " ⚠ above target" : ""}
                        </span>
                      )}
                      {s2pct >= 20 && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Score 2: {s2pct.toFixed(1)}% — monitor</span>}
                      {r.assessedBy && <span className="text-xs text-gray-400">by {r.assessedBy}</span>}
                      {r.nextAssessmentDue && <span className="text-xs text-gray-400">Next: {formatDate(r.nextAssessmentDue)}</span>}
                    </div>
                    <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                      <RecordAttachments farmId={farmId} recordType="dairy-mobility-scorings" recordId={r.id} compact />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {r.actionTaken && <p className="text-xs text-gray-400 mt-1">Action: {r.actionTaken}</p>}
                  {(r.animals && r.animals.length > 0) ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {r.animals.map((a, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded font-medium ${a.scoreGrade === 3 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                          [{a.scoreGrade}] {a.animalTag}{a.notes ? ` — ${a.notes}` : ""}
                        </span>
                      ))}
                    </div>
                  ) : (r.score3AnimalTags || r.score2AnimalTags) ? (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {r.score3AnimalTags && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">Score 3: {r.score3AnimalTags}</span>}
                      {r.score2AnimalTags && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Score 2: {r.score2AnimalTags}</span>}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit dialog ── */}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "60rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Mobility Assessment" : "Add Mobility Assessment"}</DialogTitle>
            <p className="text-xs text-muted-foreground">Score cows 0–3 as they walk from the milking parlour. Next assessment date is calculated automatically at 13 weeks (Red Tractor quarterly requirement).</p>
          </DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column: scores ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Assessment Date *</Label>
                  <Input type="date" value={form.assessmentDate?.slice(0, 10) || ""} onChange={e => handleAssessmentDateChange(e.target.value)} />
                </div>
                <div>
                  <Label>Assessed By</Label>
                  <StaffSelect
                    value={form.assessedBy || ""}
                    onChange={v => set("assessedBy", v)}
                    staffNames={staffNames}
                    loading={false}
                  />
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Score counts — observe each cow walking from parlour</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-green-700 mb-0.5">Score 0 — Normal</p>
                  <p className="text-xs text-green-600 mb-2">Perfect gait, even weight bearing</p>
                  <Input type="number" min="0" className="text-center" value={form.score0Count || 0} onChange={e => set("score0Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-lime-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-lime-700 mb-0.5">Score 1 — Imperfect</p>
                  <p className="text-xs text-lime-600 mb-2">Minor gait imperfection</p>
                  <Input type="number" min="0" className="text-center" value={form.score1Count || 0} onChange={e => set("score1Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-amber-700 mb-0.5">Score 2 — Impaired</p>
                  <p className="text-xs text-amber-600 mb-2">Clear gait impairment, arched back</p>
                  <Input type="number" min="0" className="text-center" value={form.score2Count || 0} onChange={e => set("score2Count", parseInt(e.target.value) || 0)} />
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-medium text-red-700 mb-0.5">Score 3 — Lame</p>
                  <p className="text-xs text-red-600 mb-2">Severely lame, reluctant to bear weight</p>
                  <Input type="number" min="0" className="text-center" value={form.score3Count || 0} onChange={e => set("score3Count", parseInt(e.target.value) || 0)} />
                </div>
              </div>

              {/* Live prevalence feedback */}
              {total > 0 && (
                <div className={`p-3 rounded-lg text-sm text-center space-y-0.5 ${prevalence && parseFloat(prevalence) >= 10 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                  <p className={`font-semibold ${prevalence && parseFloat(prevalence) >= 10 ? "text-red-700" : "text-green-700"}`}>
                    {total} cows scored — Lameness (score 3): <strong>{prevalence}%</strong>
                    {prevalence && parseFloat(prevalence) >= 10 ? " ⚠ above 10% target" : " — within target"}
                  </p>
                  {score2Pct && parseFloat(score2Pct) >= 20 && (
                    <p className="text-xs text-amber-700">Score 2 impaired: {score2Pct}% — above advisory 20% threshold</p>
                  )}
                </div>
              )}

              {/* Individual animal records — appears when any score 2 or 3 cows recorded */}
              {((form.score3Count || 0) > 0 || (form.score2Count || 0) > 0) && (
                <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Individual Animal Records</p>
                    <p className="text-xs text-gray-500">Record each Score 2 or 3 animal individually by ear tag. Matched animals update their record in the livestock register.</p>
                  </div>
                  {/* Existing animals list */}
                  {animals.length > 0 && (
                    <div className="space-y-1">
                      {animals.map((a, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-2 rounded border text-xs ${a.scoreGrade === 3 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-white text-xs ${a.scoreGrade === 3 ? "bg-red-500" : "bg-amber-500"}`}>{a.scoreGrade}</span>
                          <span className="font-medium text-gray-800 flex-1">{a.animalTag}</span>
                          {a.animalId && <span className="text-green-600 text-xs">✓ matched</span>}
                          {a.notes && <span className="text-gray-400 italic truncate max-w-[120px]">{a.notes}</span>}
                          <button type="button" onClick={() => removeAnimal(idx)} className="text-gray-400 hover:text-red-500 ml-auto">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add animal form */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Ear tag number</p>
                      <input
                        list={cattleTagListId}
                        value={pendingTag}
                        onChange={e => setPendingTag(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAnimal(); } }}
                        placeholder="e.g. UK123456 001234"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <datalist id={cattleTagListId}>
                        {cattleList.map(c => (
                          <option key={c.id} value={c.tagNumber || c.earTagNumber || ""}>
                            {c.earTagNumber ? `${c.tagNumber || ""} / ${c.earTagNumber}` : c.tagNumber || ""}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Score</p>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setPendingScore(2)} className={`px-3 py-1.5 text-xs rounded border font-medium ${pendingScore === 2 ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-700 border-amber-300"}`}>2</button>
                        <button type="button" onClick={() => setPendingScore(3)} className={`px-3 py-1.5 text-xs rounded border font-medium ${pendingScore === 3 ? "bg-red-500 text-white border-red-500" : "bg-white text-red-700 border-red-300"}`}>3</button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Notes (optional)</p>
                      <input
                        value={pendingNotes}
                        onChange={e => setPendingNotes(e.target.value)}
                        placeholder="e.g. left rear"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    <button type="button" onClick={addAnimal} disabled={!pendingTag.trim()} className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                      + Add
                    </button>
                  </div>
                  {animals.length === 0 && <p className="text-xs text-gray-400 italic">No animals added yet — use the form above to add each Score 2 or 3 animal individually.</p>}
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column: actions, dates, notes ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <Label>Action Taken</Label>
                <Textarea value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} placeholder="e.g. Score 3 cows referred to vet for foot trimming and examination" rows={4} />
              </div>
              <div>
                <Label>Next Assessment Due</Label>
                <Input type="date" value={form.nextAssessmentDue?.slice(0, 10) || ""} onChange={e => set("nextAssessmentDue", e.target.value)} />
                <p className="text-xs text-gray-400 mt-0.5">Auto-calculated 13 weeks from assessment date — override if vet specifies a shorter interval.</p>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={4} placeholder="e.g. Wet conditions in yard increased scores this month. Foot-bathing frequency increased to 3×/week." />
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 rounded p-3 space-y-1">
                <p className="font-semibold text-gray-500">Threshold reminders</p>
                <p>• Score 3 ≥ 10% → critical alert + SMS sent to farm managers</p>
                <p>• Score 2 ≥ 20% → advisory notification to review foot bathing</p>
                <p>• Next assessment date appears in the Week Ahead Planner</p>
              </div>
            </div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form, totalCowsScored: total, animals })} disabled={save.isPending || !form.assessmentDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

