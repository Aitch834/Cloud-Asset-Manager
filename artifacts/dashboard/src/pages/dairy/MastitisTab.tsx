import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
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
import { api, formatDate, today, OutcomeBadge } from "./shared";

// ─── Mastitis Records ──────────────────────────────────────────────────────────

// ─── Mastitis Recording ────────────────────────────────────────────────────────

interface MastitisRecord {
  id: number; herdId?: number | null; earTagNumber?: string | null; onsetDate: string;
  quartersAffected?: string | null; clinicalGrade?: string | null; bacterialCultureResult?: string | null;
  treatmentProduct?: string | null; treatmentStartDate?: string | null; treatmentDurationDays?: number | null;
  withdrawalEndDate?: string | null; outcome?: string | null; outcomeDate?: string | null;
  vetConsulted?: boolean; vetName?: string | null; sccAtOnset?: number | null; notes?: string | null;
}

// Normalise grade values from any historic format to canonical text
function normalizeGrade(g?: string | null): string {
  if (!g) return "";
  const s = g.trim();
  if (s === "1" || /grade\s*1/i.test(s) || /^mild/i.test(s)) return "Mild";
  if (s === "2" || /grade\s*2/i.test(s) || /^moderate/i.test(s)) return "Moderate";
  if (s === "3" || /grade\s*3/i.test(s) || /^severe/i.test(s)) return "Severe";
  if (s === "4" || /grade\s*4/i.test(s) || /^subclinical/i.test(s)) return "Subclinical";
  return s;
}

const GRADE_PIE_COLOURS = ["#6366f1", "#f59e0b", "#f97316", "#ef4444", "#94a3b8"];
const OUTCOME_PIE_COLOURS = ["#22c55e", "#eab308", "#f97316", "#3b82f6", "#ef4444", "#94a3b8"];

export function MastitisTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MastitisRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MastitisRecord | null>(null);
  const [form, setForm] = useState<Partial<MastitisRecord>>({});

  // ── Filters & view state ──
  const [filterPreset, setFilterPreset] = usePersistedFilter({ page: "dairy-mastitis", filter: "preset", farmId, defaultValue: "12m" });
  const [filterEarTag, setFilterEarTag] = useState("");
  const [filterOutcome, setFilterOutcome] = usePersistedFilter({ page: "dairy-mastitis", filter: "outcome", farmId, defaultValue: "" });
  const [filterGrade, setFilterGrade] = usePersistedFilter({ page: "dairy-mastitis", filter: "grade", farmId, defaultValue: "" });
  const [showReports, setShowReports] = useState(false);

  const { data, isLoading } = useQuery<{ records: MastitisRecord[] }>({
    queryKey: ["dairy-mastitis", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mastitis-records`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: attachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const mastitisAttachMap = Object.fromEntries(attachCountsRaw.filter(c => c.recordType === "mastitis").map(c => [c.recordId, c.count]));

  const save = useMutation({
    mutationFn: async (body: Partial<MastitisRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/mastitis-records/${editing.id}`) : api(`farms/${farmId}/dairy/mastitis-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }); setOpen(false); setEditing(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/mastitis-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ onsetDate: today() }); setOpen(true); }
  function openEdit(r: MastitisRecord) { setEditing(r); setForm({ ...r, treatmentStartDate: r.treatmentStartDate?.slice(0, 10), withdrawalEndDate: r.withdrawalEndDate?.slice(0, 10), outcomeDate: r.outcomeDate?.slice(0, 10) }); setOpen(true); }
  function set(k: keyof MastitisRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  // ── Date cutoff from preset ──
  const allRecords = data?.records ?? [];
  const presetFrom = React.useMemo(() => {
    if (filterPreset === "all") return null;
    const d = new Date();
    if (filterPreset === "30d") d.setDate(d.getDate() - 30);
    else if (filterPreset === "90d") d.setDate(d.getDate() - 90);
    else d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  }, [filterPreset]);

  // ── Filtered records ──
  const filtered = React.useMemo(() => allRecords.filter(r => {
    const d = r.onsetDate.slice(0, 10);
    if (presetFrom && d < presetFrom) return false;
    if (filterEarTag && !r.earTagNumber?.toLowerCase().includes(filterEarTag.toLowerCase())) return false;
    if (filterOutcome && r.outcome !== filterOutcome) return false;
    if (filterGrade && normalizeGrade(r.clinicalGrade) !== filterGrade) return false;
    return true;
  }), [allRecords, presetFrom, filterEarTag, filterOutcome, filterGrade]);

  // ── KPIs (computed from filtered) ──
  const kpis = React.useMemo(() => {
    const now = new Date();
    const activeCases = filtered.filter(r => r.outcome === "ongoing" || !r.outcome).length;
    const inWithdrawal = filtered.filter(r => r.withdrawalEndDate && new Date(r.withdrawalEndDate) >= now).length;
    const tagCounts: Record<string, number> = {};
    filtered.forEach(r => { if (r.earTagNumber) tagCounts[r.earTagNumber] = (tagCounts[r.earTagNumber] || 0) + 1; });
    const recurrentCows = Object.values(tagCounts).filter(c => c >= 2).length;
    const pathogenCounts: Record<string, number> = {};
    filtered.forEach(r => { if (r.bacterialCultureResult?.trim()) { const p = r.bacterialCultureResult.trim(); pathogenCounts[p] = (pathogenCounts[p] || 0) + 1; } });
    const topPathogen = Object.entries(pathogenCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const quarterCounts: Record<string, number> = {};
    filtered.forEach(r => { if (r.quartersAffected) quarterCounts[r.quartersAffected] = (quarterCounts[r.quartersAffected] || 0) + 1; });
    const topQuarter = Object.entries(quarterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { total: filtered.length, activeCases, inWithdrawal, recurrentCows, topPathogen, topQuarter, tagCounts };
  }, [filtered]);

  // ── Outbreak detection: ≥3 cases within any 14-day window ──
  const outbreakWindow = React.useMemo(() => {
    if (filtered.length < 3) return null;
    const sorted = [...filtered].sort((a, b) => a.onsetDate.localeCompare(b.onsetDate));
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = new Date(sorted[i].onsetDate);
      const windowEnd = new Date(windowStart);
      windowEnd.setDate(windowEnd.getDate() + 14);
      const inWindow = sorted.filter(r => { const d = new Date(r.onsetDate); return d >= windowStart && d <= windowEnd; });
      if (inWindow.length >= 3) return { count: inWindow.length, start: sorted[i].onsetDate, end: inWindow[inWindow.length - 1].onsetDate };
    }
    return null;
  }, [filtered]);

  // ── Report datasets ──
  const reportData = React.useMemo(() => {
    const monthMap: Record<string, number> = {};
    filtered.forEach(r => {
      const d = new Date(r.onsetDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const monthlyTrend = Object.keys(monthMap).sort().map(m => ({
      month: new Date(m + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      cases: monthMap[m],
    }));

    const gradeMap: Record<string, number> = {};
    filtered.forEach(r => { const g = normalizeGrade(r.clinicalGrade); if (g) gradeMap[g] = (gradeMap[g] || 0) + 1; });
    const gradeData = Object.entries(gradeMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const pathMap: Record<string, number> = {};
    filtered.forEach(r => { if (r.bacterialCultureResult?.trim()) { const p = r.bacterialCultureResult.trim(); pathMap[p] = (pathMap[p] || 0) + 1; } });
    const pathogenData = Object.entries(pathMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

    const outcomeMap: Record<string, number> = {};
    filtered.forEach(r => { const o = r.outcome || "not recorded"; outcomeMap[o] = (outcomeMap[o] || 0) + 1; });
    const outcomeData = Object.entries(outcomeMap).map(([name, value]) => ({ name, value }));

    const cowMap: Record<string, { count: number; grades: string[]; lastDate: string }> = {};
    filtered.forEach(r => {
      if (!r.earTagNumber) return;
      if (!cowMap[r.earTagNumber]) cowMap[r.earTagNumber] = { count: 0, grades: [], lastDate: "" };
      cowMap[r.earTagNumber].count++;
      const ng = normalizeGrade(r.clinicalGrade); if (ng) cowMap[r.earTagNumber].grades.push(ng);
      if (!cowMap[r.earTagNumber].lastDate || r.onsetDate > cowMap[r.earTagNumber].lastDate) cowMap[r.earTagNumber].lastDate = r.onsetDate;
    });
    const problemCows = Object.entries(cowMap)
      .filter(([, v]) => v.count >= 2)
      .map(([tag, v]) => ({ tag, ...v }))
      .sort((a, b) => b.count - a.count);

    return { monthlyTrend, gradeData, pathogenData, outcomeData, problemCows };
  }, [filtered]);

  function generateMastitisReport() {
    const periodLabel = filterPreset === "30d" ? "Last 30 days" : filterPreset === "90d" ? "Last 90 days" : filterPreset === "12m" ? "Last 12 months" : "All records";
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v?: string | null) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const rows = filtered.map(r => `<tr>
      <td>${fmtD(r.onsetDate)}</td>
      <td>${r.earTagNumber || "—"}</td>
      <td>${r.quartersAffected || "—"}</td>
      <td>${r.clinicalGrade || "—"}</td>
      <td>${r.bacterialCultureResult || "—"}</td>
      <td>${r.treatmentProduct || "—"}</td>
      <td>${r.outcome ? r.outcome.charAt(0).toUpperCase() + r.outcome.slice(1).replace("-", " ") : "Ongoing"}</td>
      <td>${fmtD(r.withdrawalEndDate)}</td>
    </tr>`).join("");
    const pathRows = reportData.pathogenData.map(p => `<tr><td>${p.name}</td><td>${p.value}</td><td>${filtered.length > 0 ? ((p.value / filtered.length) * 100).toFixed(0) : 0}%</td></tr>`).join("");
    const problemRows = reportData.problemCows.map(c => `<tr><td>${c.tag}</td><td>${c.count}</td><td>${c.grades.join(", ") || "—"}</td><td>${fmtD(c.lastDate)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Mastitis Records — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}
  .kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="hdr">
  <div><h1>Mastitis Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2><p style="margin:4px 0;font-size:9px;color:#6b7280">Period: <strong>${periodLabel}</strong></p></div>
  <div class="hdr-r"><b>${filtered.length} record${filtered.length !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${kpis.total}</div><div class="kpi-lbl">Total cases</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.activeCases}</div><div class="kpi-lbl">Active / ongoing</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.recurrentCows}</div><div class="kpi-lbl">Recurrent cows (≥2 cases)</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.topPathogen ?? "—"}</div><div class="kpi-lbl">Most common pathogen</div></div>
</div>
${pathRows ? `<h3>Pathogen Breakdown</h3><table><tr><th>Pathogen</th><th>Cases</th><th>% of total</th></tr>${pathRows}</table>` : ""}
${problemRows ? `<h3>Recurrent Cows (2+ episodes in period)</h3><table><tr><th>Ear Tag</th><th>Episodes</th><th>Grades</th><th>Last case</th></tr>${problemRows}</table>` : ""}
<h3>All Records — ${periodLabel}</h3>
<table>
  <tr><th>Date</th><th>Ear Tag</th><th>Quarter</th><th>Grade</th><th>Pathogen</th><th>Treatment</th><th>Outcome</th><th>Withdrawal ends</th></tr>
  ${rows || "<tr><td colspan='8'>No records</td></tr>"}
</table>
<p class="note">This mastitis records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Dairy audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  const filtersActive = filterEarTag || filterOutcome || filterGrade || filterPreset !== "12m";

  return (
    <div>
      {/* ── Filter strip ── */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {(["30d", "90d", "12m", "all"] as const).map(p => (
            <button key={p} onClick={() => setFilterPreset(p)}
              className={`px-3 py-1.5 font-medium transition-colors ${filterPreset === p ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {p === "30d" ? "30 days" : p === "90d" ? "90 days" : p === "12m" ? "12 months" : "All time"}
            </button>
          ))}
        </div>
        <Input className="w-44 h-8 text-sm" placeholder="Search ear tag…" value={filterEarTag} onChange={e => setFilterEarTag(e.target.value)} />
        <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm text-gray-700">
          <option value="">All outcomes</option>
          <option value="ongoing">Ongoing</option>
          <option value="cured">Cured</option>
          <option value="chronic">Chronic</option>
          <option value="dried-off">Dried off</option>
          <option value="culled">Culled</option>
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm text-gray-700">
          <option value="">All grades</option>
          <option value="Subclinical">Subclinical</option>
          <option value="Mild">Mild</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
        </select>
        {filtersActive && (
          <button onClick={() => { setFilterEarTag(""); setFilterOutcome(""); setFilterGrade(""); setFilterPreset("12m"); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">Clear</button>
        )}
        <div className="flex-1" />
        <div className="flex gap-2">
          <button onClick={() => setShowReports(v => !v)}
            className={`h-8 px-3 rounded-md border text-sm font-medium transition-colors flex items-center gap-1.5 ${showReports ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
            <BarChart2 className="h-3.5 w-3.5" />{showReports ? "Hide Reports" : "Reports"}
          </button>
          <Button variant="outline" size="sm" onClick={generateMastitisReport} disabled={filtered.length === 0}>
            <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
          </Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      {!isLoading && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          <div className="rounded-lg border bg-white px-3 py-2.5 text-center">
            <p className="text-2xl font-bold text-gray-800">{kpis.total}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total cases</p>
          </div>
          <div className={`rounded-lg border px-3 py-2.5 text-center ${kpis.activeCases > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white"}`}>
            <p className={`text-2xl font-bold ${kpis.activeCases > 0 ? "text-yellow-700" : "text-gray-800"}`}>{kpis.activeCases}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active cases</p>
          </div>
          <div className={`rounded-lg border px-3 py-2.5 text-center ${kpis.inWithdrawal > 0 ? "bg-amber-50 border-amber-200" : "bg-white"}`}>
            <p className={`text-2xl font-bold ${kpis.inWithdrawal > 0 ? "text-amber-700" : "text-gray-800"}`}>{kpis.inWithdrawal}</p>
            <p className="text-xs text-gray-500 mt-0.5">In withdrawal</p>
          </div>
          <div className={`rounded-lg border px-3 py-2.5 text-center ${kpis.recurrentCows > 0 ? "bg-orange-50 border-orange-200" : "bg-white"}`}>
            <p className={`text-2xl font-bold ${kpis.recurrentCows > 0 ? "text-orange-700" : "text-gray-800"}`}>{kpis.recurrentCows}</p>
            <p className="text-xs text-gray-500 mt-0.5">Recurrent cows</p>
          </div>
          <div className="rounded-lg border bg-white px-3 py-2.5 text-center overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate" title={kpis.topPathogen ?? ""}>{kpis.topPathogen ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Top pathogen</p>
          </div>
          <div className="rounded-lg border bg-white px-3 py-2.5 text-center">
            <p className="text-sm font-semibold text-gray-800">{kpis.topQuarter ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Top quarter</p>
          </div>
        </div>
      )}

      {/* ── Outbreak alert banner ── */}
      {outbreakWindow && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Possible outbreak detected</p>
            <p className="text-xs text-red-700 mt-0.5">
              {outbreakWindow.count} new cases recorded within a 14-day window ({formatDate(outbreakWindow.start)} – {formatDate(outbreakWindow.end)}).
              This pattern may indicate an environmental pathogen spreading through the herd. Review bacterial culture results and consult your vet.
            </p>
          </div>
        </div>
      )}

      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <>
          {/* ── Reports panel ── */}
          {showReports ? (
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No records match the current filters.</CardContent></Card>
              ) : (
                <>
                  {/* Monthly trend */}
                  <Card>
                    <CardContent className="pt-4 pb-2">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Monthly Case Trend</p>
                      <p className="text-xs text-gray-400 mb-3">New mastitis cases per calendar month in the selected period</p>
                      {reportData.monthlyTrend.length < 2 ? (
                        <p className="text-xs text-gray-400 text-center py-8">Not enough data across multiple months. Widen the date filter to see a trend.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <ComposedChart data={reportData.monthlyTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="cases" name="Cases" fill="#fca5a5" radius={[3, 3, 0, 0]} />
                            <Line type="monotone" dataKey="cases" name="Trend" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626", r: 3 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Grade breakdown */}
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Clinical Grade</p>
                        {reportData.gradeData.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">No grade data recorded</p>
                        ) : (
                          <>
                            <ResponsiveContainer width="100%" height={150}>
                              <PieChart>
                                <Pie data={reportData.gradeData} cx="50%" cy="50%" outerRadius={60} dataKey="value" labelLine={false}>
                                  {reportData.gradeData.map((_, i) => <Cell key={i} fill={GRADE_PIE_COLOURS[i % GRADE_PIE_COLOURS.length]} />)}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-2 space-y-1">
                              {reportData.gradeData.map((g, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: GRADE_PIE_COLOURS[i % GRADE_PIE_COLOURS.length] }} />
                                    {g.name}
                                  </span>
                                  <span className="font-semibold text-gray-700">{g.value}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Outcome breakdown */}
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Outcome Breakdown</p>
                        {reportData.outcomeData.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">No outcome data recorded</p>
                        ) : (
                          <>
                            <ResponsiveContainer width="100%" height={150}>
                              <PieChart>
                                <Pie data={reportData.outcomeData} cx="50%" cy="50%" outerRadius={60} dataKey="value" labelLine={false}>
                                  {reportData.outcomeData.map((_, i) => <Cell key={i} fill={OUTCOME_PIE_COLOURS[i % OUTCOME_PIE_COLOURS.length]} />)}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-2 space-y-1">
                              {reportData.outcomeData.map((o, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: OUTCOME_PIE_COLOURS[i % OUTCOME_PIE_COLOURS.length] }} />
                                    <span className="capitalize">{o.name}</span>
                                  </span>
                                  <span className="font-semibold text-gray-700">{o.value}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Pathogen frequency */}
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Pathogen Frequency</p>
                        <p className="text-xs text-gray-400 mb-3">Culture results only</p>
                        {reportData.pathogenData.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">No culture results recorded yet</p>
                        ) : (
                          <div className="space-y-2.5 mt-1">
                            {reportData.pathogenData.map((p, i) => {
                              const maxVal = reportData.pathogenData[0].value;
                              return (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <span className="w-28 truncate text-gray-700 font-mono text-[11px]" title={p.name}>{p.name}</span>
                                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(p.value / maxVal) * 100}%` }} />
                                  </div>
                                  <span className="w-4 text-right text-gray-600 font-semibold">{p.value}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Problem cows table */}
                  {reportData.problemCows.length > 0 && (
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Recurrent Cases — Problem Cows</p>
                        <p className="text-xs text-gray-400 mb-3">Animals with 2 or more mastitis episodes in the selected period. Key candidates for selective dry cow therapy review and veterinary discussion.</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left">
                                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ear Tag</th>
                                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Episodes</th>
                                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grades seen</th>
                                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last episode</th>
                                <th className="pb-2"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {reportData.problemCows.map(cow => (
                                <tr key={cow.tag} className="hover:bg-gray-50">
                                  <td className="py-2 font-mono text-gray-800 font-medium">{cow.tag}</td>
                                  <td className="py-2">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cow.count >= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{cow.count}</span>
                                  </td>
                                  <td className="py-2 text-gray-600 text-xs">{[...new Set(cow.grades)].join(", ") || "—"}</td>
                                  <td className="py-2 text-gray-600">{formatDate(cow.lastDate)}</td>
                                  <td className="py-2 text-right">
                                    <button onClick={() => { setFilterEarTag(cow.tag); setShowReports(false); }}
                                      className="text-xs text-green-700 hover:underline">View records</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ── Record list ── */
            <div className="space-y-2">
              {filtered.length === 0 && (
                <Card><CardContent className="py-8 text-center text-gray-400 text-sm">
                  {allRecords.length === 0 ? "No mastitis records yet." : "No records match the current filters."}
                </CardContent></Card>
              )}
              {filtered.map(r => (
                <Card key={r.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-medium text-sm">{formatDate(r.onsetDate)}</span>
                        {r.earTagNumber && <span className="text-sm text-gray-700 font-mono">{r.earTagNumber}</span>}
                        {r.earTagNumber && (kpis.tagCounts[r.earTagNumber] ?? 0) >= 2 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">{kpis.tagCounts[r.earTagNumber]}× recurring</span>
                        )}
                        {r.quartersAffected && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{r.quartersAffected}</span>}
                        {r.clinicalGrade && <span className="text-xs text-gray-500">Grade: {normalizeGrade(r.clinicalGrade)}</span>}
                        {r.treatmentProduct && <span className="text-xs text-gray-500">{r.treatmentProduct}</span>}
                        <OutcomeBadge v={r.outcome} />
                        {r.withdrawalEndDate && new Date(r.withdrawalEndDate) >= new Date() && (
                          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">Withdrawal ends {formatDate(r.withdrawalEndDate)}</span>
                        )}
                        {(mastitisAttachMap[r.id] ?? 0) > 0 && (
                          <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />{mastitisAttachMap[r.id]}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── View dialog ── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Mastitis Record — {viewRecord.earTagNumber || formatDate(viewRecord.onsetDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Onset Date</p><p className="font-medium">{formatDate(viewRecord.onsetDate)}</p></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Cow Ear Tag</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium font-mono">{viewRecord.earTagNumber || "—"}</p>
                  {viewRecord.earTagNumber && (kpis.tagCounts[viewRecord.earTagNumber] ?? 0) >= 2 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{kpis.tagCounts[viewRecord.earTagNumber]}× recurring</span>
                  )}
                </div>
              </div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quarters Affected</p><p className="font-medium">{viewRecord.quartersAffected || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clinical Grade</p><p className="font-medium">{normalizeGrade(viewRecord.clinicalGrade) || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bacterial Culture</p><p className="font-medium">{viewRecord.bacterialCultureResult || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Onset</p><p className="font-medium">{viewRecord.sccAtOnset ? `${viewRecord.sccAtOnset.toLocaleString()} k/mL` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Product</p><p className="font-medium">{viewRecord.treatmentProduct || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Start</p><p className="font-medium">{formatDate(viewRecord.treatmentStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Duration (days)</p><p className="font-medium">{viewRecord.treatmentDurationDays ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal End</p><p className="font-medium">{formatDate(viewRecord.withdrawalEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-medium capitalize">{viewRecord.outcome || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome Date</p><p className="font-medium">{formatDate(viewRecord.outcomeDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Consulted</p><p className="font-medium">{viewRecord.vetConsulted ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{viewRecord.vetName || "—"}</p></div>
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="mastitis" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Add / Edit dialog ── */}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "58rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Mastitis Record" : "Add Mastitis Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Onset Date *</Label><Input type="date" value={form.onsetDate?.slice(0, 10) || ""} onChange={e => set("onsetDate", e.target.value)} /></div>
                <div><Label>Cow Ear Tag</Label><Input value={form.earTagNumber || ""} onChange={e => set("earTagNumber", e.target.value)} placeholder="e.g. UK123456 000001" /></div>
              </div>
              <div>
                <Label>Quarters Affected</Label>
                <Select value={form.quartersAffected || ""} onValueChange={v => set("quartersAffected", v)}>
                  <SelectTrigger><SelectValue placeholder="Select quarters..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LF">Left Front (LF)</SelectItem>
                    <SelectItem value="RF">Right Front (RF)</SelectItem>
                    <SelectItem value="LR">Left Rear (LR)</SelectItem>
                    <SelectItem value="RR">Right Rear (RR)</SelectItem>
                    <SelectItem value="LF, RF">Both Fronts (LF + RF)</SelectItem>
                    <SelectItem value="LR, RR">Both Rears (LR + RR)</SelectItem>
                    <SelectItem value="LF, LR">Left Side (LF + LR)</SelectItem>
                    <SelectItem value="RF, RR">Right Side (RF + RR)</SelectItem>
                    <SelectItem value="All quarters">All Four Quarters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Clinical Grade</Label>
                <Select value={form.clinicalGrade || ""} onValueChange={v => set("clinicalGrade", v)}>
                  <SelectTrigger><SelectValue placeholder="Select grade..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subclinical">Subclinical (high SCC, no visible signs)</SelectItem>
                    <SelectItem value="Mild">Mild (clots in milk, slight swelling)</SelectItem>
                    <SelectItem value="Moderate">Moderate (swollen quarter, cow lame/off-feed)</SelectItem>
                    <SelectItem value="Severe">Severe (toxic cow, systemic signs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>SCC at Onset (k/mL)</Label><Input type="number" value={form.sccAtOnset || ""} onChange={e => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
              <div><Label>Bacterial Culture Result</Label><Input value={form.bacterialCultureResult || ""} onChange={e => set("bacterialCultureResult", e.target.value)} placeholder="e.g. Staph. aureus, E. coli, Strep. uberis" /></div>
            </div>
            <div className="w-px bg-gray-200 self-stretch" />
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Treatment</p>
                <div><Label>Product</Label><Input value={form.treatmentProduct || ""} onChange={e => set("treatmentProduct", e.target.value)} placeholder="e.g. Ubrolexin intramammary" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Start Date</Label><Input type="date" value={form.treatmentStartDate || ""} onChange={e => set("treatmentStartDate", e.target.value)} /></div>
                  <div><Label>Duration (days)</Label><Input type="number" value={form.treatmentDurationDays || ""} onChange={e => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                </div>
                <div><Label>Milk Withdrawal End Date</Label><Input type="date" value={form.withdrawalEndDate || ""} onChange={e => set("withdrawalEndDate", e.target.value)} /></div>
              </div>
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outcome &amp; Vet</p>
                <div>
                  <Label>Outcome</Label>
                  <Select value={form.outcome || ""} onValueChange={v => set("outcome", v)}>
                    <SelectTrigger><SelectValue placeholder="Select outcome..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing (still treating)</SelectItem>
                      <SelectItem value="cured">Cured</SelectItem>
                      <SelectItem value="chronic">Chronic (no cure achieved)</SelectItem>
                      <SelectItem value="dried-off">Quarter/Cow Dried Off</SelectItem>
                      <SelectItem value="culled">Culled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Outcome Date</Label><Input type="date" value={form.outcomeDate || ""} onChange={e => set("outcomeDate", e.target.value)} /></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vc" checked={!!form.vetConsulted} onChange={e => set("vetConsulted", e.target.checked)} className="rounded" />
                  <Label htmlFor="vc">Vet consulted</Label>
                </div>
                <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} /></div>
            </div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.onsetDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

