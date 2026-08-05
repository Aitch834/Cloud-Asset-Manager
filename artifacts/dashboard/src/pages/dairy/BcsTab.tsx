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
import { api, formatDate, today, BcsBadge } from "./shared";

// ─── Body Condition Scoring ────────────────────────────────────────────────────

interface BcsRecord {
  id: number; herdId?: number | null; animalId?: number | null; earTagNumber?: string | null;
  assessmentDate: string; lifeStage?: string | null; bcsScore?: string | null;
  assessedBy?: string | null; targetScore?: string | null; actionRequired?: boolean;
  actionTaken?: string | null; notes?: string | null;
}

export function BcsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BcsRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<BcsRecord | null>(null);
  const [form, setForm] = useState<Partial<BcsRecord>>({});
  const { data: bcsMembersData, isLoading: bcsMembersLoading } = useFarmMembers(farmId);
  const bcsStaffNames = (bcsMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const { data, isLoading } = useQuery<{ records: BcsRecord[] }>({
    queryKey: ["dairy-bcs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bcs-records`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<BcsRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/bcs-records/${editing.id}`) : api(`farms/${farmId}/dairy/bcs-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] }); setOpen(false); setEditing(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/bcs-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ assessmentDate: today(), assessedBy: myName }); setOpen(true); }
  function openEdit(r: BcsRecord) { setEditing(r); setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10) }); setOpen(true); }
  function set(k: keyof BcsRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const LIFE_STAGES = ["Early lactation (0-60 DIM)", "Mid lactation (60-200 DIM)", "Late lactation (>200 DIM)", "Dry period", "At dry-off", "At calving", "Heifers pre-calving"];

  const allBcsRecords = data?.records ?? [];

  const [yearFilterBcs, setYearFilterBcs] = useState("all");
  const yearsBcs = useMemo(() => {
    const s = new Set(allBcsRecords.map(r => r.assessmentDate?.slice(0, 4)).filter(Boolean) as string[]);
    return Array.from(s).sort().reverse();
  }, [allBcsRecords]);
  const filteredBcsRecords = useMemo(
    () => yearFilterBcs === "all" ? allBcsRecords : allBcsRecords.filter(r => r.assessmentDate?.startsWith(yearFilterBcs)),
    [allBcsRecords, yearFilterBcs],
  );

  const bcsTrendData = React.useMemo(() => {
    const monthMap: Record<string, { sum: number; count: number; inRange: number; outRange: number }> = {};
    for (const r of allBcsRecords) {
      if (!r.assessmentDate || !r.bcsScore) continue;
      const d = new Date(r.assessmentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const score = parseFloat(r.bcsScore);
      if (isNaN(score)) continue;
      if (!monthMap[key]) monthMap[key] = { sum: 0, count: 0, inRange: 0, outRange: 0 };
      monthMap[key].sum += score;
      monthMap[key].count++;
      if (score >= 2.5 && score <= 3.5) monthMap[key].inRange++; else monthMap[key].outRange++;
    }
    return Object.keys(monthMap).sort().map(m => ({
      month: new Date(m + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      avg: Math.round((monthMap[m].sum / monthMap[m].count) * 10) / 10,
      inRange: monthMap[m].inRange,
      outRange: monthMap[m].outRange,
      total: monthMap[m].count,
    }));
  }, [allBcsRecords]);

  function generateBcsReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const total = allBcsRecords.length;
    const inRange = allBcsRecords.filter(r => r.bcsScore && parseFloat(r.bcsScore) >= 2.5 && parseFloat(r.bcsScore) <= 3.5).length;
    const actionsNeeded = allBcsRecords.filter(r => r.actionRequired).length;
    const rows = allBcsRecords.map(r => `<tr>
      <td>${r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${r.earTagNumber || "Group / all"}</td>
      <td>${r.lifeStage || "—"}</td>
      <td>${r.bcsScore || "—"}</td>
      <td>${r.targetScore || "—"}</td>
      <td>${r.bcsScore && parseFloat(r.bcsScore) >= 2.5 && parseFloat(r.bcsScore) <= 3.5 ? "In range" : r.bcsScore ? "<b style='color:#b45309'>Outside range</b>" : "—"}</td>
      <td>${r.assessedBy || "—"}</td>
      <td>${r.actionRequired ? "Yes" : "No"}</td>
      <td>${r.actionTaken || "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>BCS Records — Compliance Report</title>
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
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="hdr">
  <div><h1>Body Condition Scoring (BCS) Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${total} record${total !== 1 ? "s" : ""}</b><br>Target: 2.5–3.5 (1–5 scale)<br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${total}</div><div class="kpi-lbl">Total assessments</div></div>
  <div class="kpi-box"><div class="kpi-val">${total > 0 ? Math.round((inRange / total) * 100) : 0}%</div><div class="kpi-lbl">Scores in target range (2.5–3.5)</div></div>
  <div class="kpi-box"><div class="kpi-val">${actionsNeeded}</div><div class="kpi-lbl">Actions flagged</div></div>
</div>
<h3>All BCS Records</h3>
<table>
  <tr><th>Date</th><th>Ear Tag / Group</th><th>Life Stage</th><th>Score</th><th>Target</th><th>Range</th><th>Assessed By</th><th>Action?</th><th>Action Taken</th></tr>
  ${rows || "<tr><td colspan='9'>No records</td></tr>"}
</table>
<p class="note">Body Condition Scoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires BCS assessed at dry-off, calving, and mid-lactation. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <p className="text-sm text-gray-500">Body Condition Scoring (BCS) — document at dry-off, calving, and mid-lactation. Target range: 2.5–3.5 on a 1–5 scale.</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={yearFilterBcs} onValueChange={setYearFilterBcs}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsBcs.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateBcsReport} disabled={allBcsRecords.length === 0}>
            <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
          </Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add BCS</Button>
        </div>
      </div>

      {/* ── BCS Trend Chart ── */}
      {bcsTrendData.length >= 2 && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm font-semibold text-gray-700 mb-0.5">Average BCS by Month</p>
            <p className="text-xs text-gray-400 mb-3">Monthly average body condition score — target band 2.5–3.5 shown in green</p>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={bcsTrendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} ticks={[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]} />
                <Tooltip formatter={(v: unknown) => [String(v), "Avg BCS"]} />
                <ReferenceLine y={2.5} stroke="#16a34a" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Min 2.5", position: "right", fontSize: 9, fill: "#16a34a" }} />
                <ReferenceLine y={3.5} stroke="#16a34a" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Max 3.5", position: "right", fontSize: 9, fill: "#16a34a" }} />
                <Bar dataKey="inRange" name="In range" fill="#bbf7d0" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="outRange" name="Outside range" fill="#fecaca" stackId="a" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="avg" name="Avg BCS" stroke="#1d4ed8" strokeWidth={2} dot={{ fill: "#1d4ed8", r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View BCS Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{formatDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ear Tag Number</p><p className="font-medium">{String(viewRecord.earTagNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Life Stage</p><p className="font-medium capitalize">{String(viewRecord.lifeStage ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BCS Score</p><p className="font-medium">{String(viewRecord.bcsScore ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Score</p><p className="font-medium">{String(viewRecord.targetScore ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{String(viewRecord.assessedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Required</p><p className="font-medium">{viewRecord.actionRequired ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Taken</p><p className="font-medium">{String(viewRecord.actionTaken ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {!isLoading && filteredBcsRecords.length > 0 && (() => {
        const scores = filteredBcsRecords.map(r => r.bcsScore ? parseFloat(r.bcsScore) : null).filter((v): v is number => v !== null);
        const avgBcs = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        const inRange = scores.filter(s => s >= 2.5 && s <= 3.5).length;
        const inRangePct = scores.length > 0 ? Math.round((inRange / scores.length) * 100) : null;
        const actionsNeeded = filteredBcsRecords.filter(r => r.actionRequired).length;
        return (
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }}>Assessments</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }}>{filteredBcsRecords.length}</p>
            </div>
            {avgBcs !== null && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }}>Avg BCS</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }}>{avgBcs.toFixed(2)}</p>
              </div>
            )}
            {inRangePct !== null && (
              <div style={{ background: inRangePct >= 70 ? "#f0fdf4" : "#fef9c3", border: `1px solid ${inRangePct >= 70 ? "#bbf7d0" : "#fef08a"}`, borderRadius: 8, padding: "10px 16px", minWidth: 150 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: inRangePct >= 70 ? "#15803d" : "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }}>In Target Range (2.5–3.5)</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: inRangePct >= 70 ? "#14532d" : "#78350f", lineHeight: 1, margin: 0 }}>{inRangePct}%</p>
                <p style={{ fontSize: "0.65rem", color: inRangePct >= 70 ? "#15803d" : "#92400e", margin: "2px 0 0" }}>{inRange} of {scores.length} scored</p>
              </div>
            )}
            {actionsNeeded > 0 && (
              <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }}>Action Required</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }}>{actionsNeeded}</p>
              </div>
            )}
          </div>
        );
      })()}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!filteredBcsRecords.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No BCS records{yearFilterBcs !== "all" ? ` for ${yearFilterBcs}` : ""} yet.</CardContent></Card>}
          {filteredBcsRecords.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.assessmentDate)}</span>
                    {r.earTagNumber && <span className="text-sm text-gray-700 font-mono">{r.earTagNumber}</span>}
                    {r.lifeStage && <span className="text-xs text-gray-500">{r.lifeStage}</span>}
                    {r.bcsScore && <><BcsBadge v={r.bcsScore} />{r.targetScore && <span className="text-xs text-gray-400">Target: {r.targetScore}</span>}</>}
                    {r.assessedBy && <span className="text-xs text-gray-400">by {r.assessedBy}</span>}
                    {r.actionRequired && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Action needed</span>}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <RecordAttachments farmId={farmId} recordType="dairy-bcs-records" recordId={r.id} compact />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.actionTaken && <p className="text-xs text-gray-400 mt-1">Action: {r.actionTaken}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit BCS Record" : "Add BCS Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate?.slice(0, 10) || ""} onChange={e => set("assessmentDate", e.target.value)} /></div>
            <div><Label>Cow Ear Tag (or leave blank for group)</Label><Input value={form.earTagNumber || ""} onChange={e => set("earTagNumber", e.target.value)} /></div>
            <div>
              <Label>Life Stage</Label>
              <Select value={form.lifeStage || ""} onValueChange={v => set("lifeStage", v)}>
                <SelectTrigger><SelectValue placeholder="Select life stage..." /></SelectTrigger>
                <SelectContent>{LIFE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>BCS Score (1–5 scale)</Label>
              <Select value={form.bcsScore || ""} onValueChange={v => set("bcsScore", v)}>
                <SelectTrigger><SelectValue placeholder="Select score..." /></SelectTrigger>
                <SelectContent>
                  {["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Score</Label>
              <Select value={form.targetScore || ""} onValueChange={v => set("targetScore", v)}>
                <SelectTrigger><SelectValue placeholder="Optional target..." /></SelectTrigger>
                <SelectContent>
                  {["2.0","2.5","3.0","3.5","4.0"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Assessed By</Label><StaffSelect value={form.assessedBy || ""} onChange={v => set("assessedBy", v)} staffNames={bcsStaffNames} loading={bcsMembersLoading} /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="acreq" checked={!!form.actionRequired} onChange={e => set("actionRequired", e.target.checked)} className="rounded" />
              <Label htmlFor="acreq">Management action required</Label>
            </div>
            <div className="col-span-2"><Label>Action Taken</Label><Input value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} placeholder="e.g. Moved to higher energy group, supplemented" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.assessmentDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add BCS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

