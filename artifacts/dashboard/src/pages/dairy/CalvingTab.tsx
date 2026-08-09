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
import { api, formatDate, today, EaseScoreBadge } from "./shared";

// ─── Calving Records ───────────────────────────────────────────────────────────

interface CalvingRecord {
  id: number; herdId?: number | null; cowEarTag?: string | null; cowAnimalId?: number | null; calvingDate: string;
  calvingEaseScore?: number | null; numberOfCalves?: number; calfOutcome?: string | null;
  calfSex?: string | null; calfEarTag?: string | null; sireBreed?: string | null; calfBreed?: string | null;
  calfBirthWeightKg?: string | null; calfAnimalId?: number | null;
  calfOutcome2?: string | null; calfSex2?: string | null; calfEarTag2?: string | null; calfBirthWeightKg2?: string | null; calfAnimalId2?: number | null;
  colostrumGivenWithin2Hours?: boolean | null;
  colostrumGivenWithin6Hours?: boolean | null; colostrumVolumeFirstFeedLitres?: string | null;
  colostrumQualityBrix?: string | null; colostrumSource?: string | null;
  cowComplications?: string | null; assistanceRequired?: boolean; assistanceType?: string | null;
  vetAttended?: boolean; vetName?: string | null;
  conceptionMethod?: string | null; sireRegisterId?: number | null; strawInventoryId?: number | null;
  calfDisposition?: string | null; bcmsPassportApplied?: boolean;
  perinatalDisposalContractorId?: number | null;
  perinatalCollectionDate?: string | null;
  perinatalCollectionRef?: string | null;
  perinatalDisposalMethod?: string | null;
  perinatalDisposalNotes?: string | null;
  notes?: string | null;
}

export function CalvingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalvingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<CalvingRecord | null>(null);
  const [form, setForm] = useState<Partial<CalvingRecord>>({});
  const [showManualEarTag, setShowManualEarTag] = useState(false);
  const [showManualVet, setShowManualVet] = useState(false);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "dairy-calving", filter: "year", farmId, defaultValue: String(CURRENT_YEAR) });

  const { data, isLoading } = useQuery<{ records: CalvingRecord[] }>({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/calving-records`), { credentials: "include" }).then(r => r.json()),
  });

  const animalsQ = useQuery<{ records: Array<{ id: number; earTagNumber?: string | null; species: string; sex?: string | null; status: string }> }>({
    queryKey: ["calving-animals", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const CATTLE_SPECIES = ["cattle", "bovine"];
  const cows = (animalsQ.data?.records ?? []).filter(a =>
    CATTLE_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber
  );

  const vetVisitsQ = useQuery<{ records: Array<{ id: number; vetName: string; vetPractice?: string | null }> }>({
    queryKey: ["calving-vet-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/vet-visits`), { credentials: "include" }).then(r => r.json()),
    enabled: open && !!form.vetAttended,
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map(v => v.vetName).filter(Boolean))] as string[];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter(v => v.vetName && v.vetPractice).map(v => [v.vetName, v.vetPractice])
  );

  const siresQ = useQuery<{ records: Array<{ id: number; name: string; breed?: string | null; tagNumber?: string | null; species: string; isActive?: boolean | null }> }>({
    queryKey: ["calving-sires", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sires`), { credentials: "include" }).then(r => r.json()),
    enabled: open && form.conceptionMethod === "natural",
  });
  const activeSires = (siresQ.data?.records ?? []).filter(s => s.isActive !== false && s.species?.toLowerCase() === "cattle");

  const strawsQ = useQuery<{ records: Array<{ id: number; sireName: string; sireBreed?: string | null; batchNumber: string; sireSpecies: string }> }>({
    queryKey: ["calving-straws", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/straws`), { credentials: "include" }).then(r => r.json()),
    enabled: open && form.conceptionMethod === "ai",
  });
  const cattleStraws = (strawsQ.data?.records ?? []).filter(s => s.sireSpecies?.toLowerCase() === "cattle");

  const { data: attachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const calvingAttachMap = Object.fromEntries(attachCountsRaw.filter(c => c.recordType === "calving").map(c => [c.recordId, c.count]));

  const contractorsQ = useQuery<Array<{ id: number; name: string; approvalNumber: string; operatorType: string; phone?: string | null }>>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fallen-stock-contractors`), { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const contractors = contractorsQ.data ?? [];

  const save = useMutation({
    mutationFn: async (body: Partial<CalvingRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/calving-records/${editing.id}`) : api(`farms/${farmId}/dairy/calving-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }); setOpen(false); setEditing(null); setForm({}); setShowManualEarTag(false); setShowManualVet(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/calving-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ calvingDate: today(), numberOfCalves: 1 }); setShowManualEarTag(false); setShowManualVet(false); setOpen(true); }
  function openEdit(r: CalvingRecord) {
    setEditing(r);
    setForm({ ...r, calvingDate: r.calvingDate.slice(0, 10) });
    setShowManualEarTag(!r.cowAnimalId && !!r.cowEarTag);
    setShowManualVet(!!r.vetAttended && !!r.vetName);
    setOpen(true);
  }
  function set(k: keyof CalvingRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const hasDeadCalf = (r: Partial<CalvingRecord>) =>
    r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" ||
    r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h";

  function generateCalvingReport() {
    const records = data?.records ?? [];
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-GB") : "—";
    const fv2 = (v: unknown) => (v === null || v === undefined || v === "") ? "—" : String(v);
    const easeLabel = (n?: number | null) => n ? ["", "1 — Unassisted", "2 — Easy pull", "3 — Hard pull", "4 — Mech. assistance", "5 — C-section"][n] ?? String(n) : "—";
    const yesNo = (v: boolean | null | undefined) => v === true ? "Yes" : v === false ? "No" : "—";

    const rows = records.map(r => {
      const calves = r.numberOfCalves && r.numberOfCalves > 1
        ? `${r.calfOutcome ?? "—"} (${r.calfSex ?? "?"}) ${r.calfEarTag ?? ""} + ${r.calfOutcome2 ?? "—"} (${r.calfSex2 ?? "?"}) ${r.calfEarTag2 ?? ""}`
        : `${r.calfOutcome ?? "—"} · ${r.calfSex === "male" ? "Bull" : r.calfSex === "female" ? "Heifer" : r.calfSex ?? "?"} · ${r.calfEarTag ?? "no tag"}`;
      const deadCount = (r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" ? 1 : 0) + (r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h" ? 1 : 0);
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod
        ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}`
        : (deadCount > 0 ? "<span style='color:#b91c1c'>NOT RECORDED</span>" : "—");
      return `<tr>
        <td>${fmtD(r.calvingDate)}</td>
        <td>${fv2(r.cowEarTag)}</td>
        <td>${easeLabel(r.calvingEaseScore)}</td>
        <td>${r.numberOfCalves ?? 1} calf${(r.numberOfCalves ?? 1) > 1 ? "ves" : ""}</td>
        <td>${calves}</td>
        <td>${r.calfBirthWeightKg ? `${r.calfBirthWeightKg} kg` : "—"}</td>
        <td>${yesNo(r.colostrumGivenWithin2Hours)} / ${yesNo(r.colostrumGivenWithin6Hours)}</td>
        <td>${r.colostrumVolumeFirstFeedLitres ? `${r.colostrumVolumeFirstFeedLitres} L` : "—"}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td>${yesNo(r.vetAttended)}</td>
        <td>${yesNo(r.bcmsPassportApplied)}</td>
        <td style="font-size:9px">${disposalCell}</td>
        <td style="color:#888;font-size:9px">${fv2(r.notes).slice(0, 80)}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><title>Calving Records — Red Tractor Dairy Audit</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Calving Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<table>
  <thead><tr>
    <th>Date</th><th>Dam Tag</th><th>Ease Score</th><th>No. Calves</th><th>Calf Outcome / Tag</th>
    <th>Birth Wt</th><th>Colostrum ≤2h / ≤6h</th><th>Col. Volume</th><th>Assisted</th><th>Vet</th><th>BCMS Applied</th><th>ABP Disposal</th><th>Notes</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="note">This calving records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Dairy audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      {(() => {
        const allCalvingRecords = data?.records ?? [];
        const calvingRecords = yearFilter === "all" ? allCalvingRecords : allCalvingRecords.filter(r => r.calvingDate?.startsWith(yearFilter));
        const calvingYears = [...new Set(allCalvingRecords.map(r => r.calvingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a)) as string[];
        if (!calvingYears.includes(String(CURRENT_YEAR))) calvingYears.unshift(String(CURRENT_YEAR));
        function calvingStats(recs: CalvingRecord[]) {
          const cows = recs.length;
          const totalCalves = recs.reduce((s, r) => s + (r.numberOfCalves ?? 1), 0);
          const stillborns = recs.reduce((s, r) => s + (r.calfOutcome === "stillborn" ? 1 : 0) + (r.calfOutcome2 === "stillborn" ? 1 : 0), 0);
          const died24h = recs.reduce((s, r) => s + (r.calfOutcome === "died-within-24h" ? 1 : 0) + (r.calfOutcome2 === "died-within-24h" ? 1 : 0), 0);
          const perinatal = stillborns + died24h;
          const pct = (n: number) => totalCalves > 0 ? ((n / totalCalves) * 100).toFixed(1) : "—";
          return { cows, totalCalves, stillborns, died24h, perinatal, pct };
        }
        const currentCalvingStats = calvingStats(calvingRecords);
        const calvingYearlyStats = calvingYears.map(y => ({ year: y, ...calvingStats(allCalvingRecords.filter(r => r.calvingDate?.startsWith(y))) }));
        return (<>
      <div className="flex justify-between items-center mb-4 gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Calving records including ease score, calf details, colostrum management, and BCMS passport application.</p>
          <p className="text-xs text-gray-400">Red Tractor Dairy: calving performance must be recorded and available at audit. Retain records for a minimum of 3 years.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {calvingYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              <SelectItem value="all">All years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateCalvingReport}><FileDown className="h-4 w-4 mr-1" />Audit Report</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Calving</Button>
        </div>
      </div>
      {allCalvingRecords.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[
              { label: "Cows Calved", value: String(currentCalvingStats.cows), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
              { label: "Total Calves Born", value: String(currentCalvingStats.totalCalves), sub: "", colour: "" },
              { label: "Stillborn", value: `${currentCalvingStats.stillborns}`, sub: `${currentCalvingStats.pct(currentCalvingStats.stillborns)}% of born`, colour: currentCalvingStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
              { label: "Died Within 24h", value: `${currentCalvingStats.died24h}`, sub: `${currentCalvingStats.pct(currentCalvingStats.died24h)}% of born`, colour: currentCalvingStats.died24h > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
              { label: "Perinatal Loss", value: `${currentCalvingStats.perinatal}`, sub: `${currentCalvingStats.pct(currentCalvingStats.perinatal)}% of born`, colour: currentCalvingStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`}>
                <p className={`text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`}>{s.value}</p>
                <p className="text-xs font-medium text-gray-600 mt-0.5">{s.label}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
          {calvingYearlyStats.length > 1 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year-by-Year Perinatal Mortality Trend</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Year</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Cows</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Calves Born</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Stillborn</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Died &lt;24h</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Perinatal Loss</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {calvingYearlyStats.map((s, i) => {
                    const maxRate = Math.max(...calvingYearlyStats.map(x => Number(x.pct(x.perinatal)) || 0), 0.1);
                    const rate = Number(s.pct(s.perinatal)) || 0;
                    const barWidth = Math.round((rate / maxRate) * 100);
                    return (
                      <tr key={s.year} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium">{s.year}</td>
                        <td className="px-3 py-2 text-right">{s.cows}</td>
                        <td className="px-3 py-2 text-right">{s.totalCalves}</td>
                        <td className="px-3 py-2 text-right">{s.stillborns} <span className="text-gray-400">({s.pct(s.stillborns)}%)</span></td>
                        <td className="px-3 py-2 text-right">{s.died24h} <span className="text-gray-400">({s.pct(s.died24h)}%)</span></td>
                        <td className={`px-3 py-2 text-right font-semibold ${rate > 5 ? "text-red-600" : rate > 2 ? "text-amber-600" : "text-green-700"}`}>{s.perinatal} ({s.pct(s.perinatal)}%)</td>
                        <td className="px-3 py-2 w-32">
                          <div className="h-3 bg-gray-100 rounded overflow-hidden">
                            <div className={`h-full rounded ${rate > 5 ? "bg-red-400" : rate > 2 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${barWidth}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-400">Red &gt;5% perinatal loss · Amber 2–5% · Green &lt;2%. Red Tractor Dairy and BCMS may query rates significantly above industry benchmarks.</p>
              </div>
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!calvingRecords.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No calving records yet.</CardContent></Card>}
          {calvingRecords.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.calvingDate)}</span>
                    {r.cowEarTag && <span className="text-sm text-gray-700 font-mono">Dam: {r.cowEarTag}</span>}
                    <EaseScoreBadge v={r.calvingEaseScore} />
                    {r.numberOfCalves && r.numberOfCalves > 1 && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Twins × {r.numberOfCalves}</span>}
                    {r.calfOutcome && <span className={`text-xs px-2 py-0.5 rounded ${r.calfOutcome === "live" ? "bg-green-100 text-green-700" : r.calfOutcome === "stillborn" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{r.calfOutcome.charAt(0).toUpperCase() + r.calfOutcome.slice(1)}</span>}
                    {r.calfSex && <span className="text-xs text-gray-500">{r.calfSex === "male" ? "Bull calf" : r.calfSex === "female" ? "Heifer calf" : r.calfSex}</span>}
                    {r.calfEarTag && <span className="text-xs text-gray-500 font-mono">Calf: {r.calfEarTag}</span>}
                    {r.calfOutcome === "live" && !r.calfEarTag && (() => {
                      const hoursOld = (Date.now() - new Date(r.calvingDate).getTime()) / 3600000;
                      if (hoursOld >= 36) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">⚠ Tag 1 overdue ({Math.floor(hoursOld)}h)</span>;
                      return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Tag 1 due in {Math.ceil(36 - hoursOld)}h</span>;
                    })()}
                    {r.calfOutcome === "live" && (() => {
                      if (r.calfEarTag2) return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Tag 2 ✓</span>;
                      const daysOld = Math.floor((Date.now() - new Date(r.calvingDate).getTime()) / 86400000);
                      if (daysOld >= 20) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">⚠ Tag 2 overdue ({daysOld}d)</span>;
                      if (daysOld >= 15) return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Tag 2 due in {20 - daysOld}d</span>;
                      return null;
                    })()}
                    {r.calfAnimalId && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">In Livestock Register ✓</span>}
                    {r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h"}
                      </span>
                    )}
                    {r.bcmsPassportApplied
                      ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Passport applied ✓</span>
                      : (() => {
                          const daysOld = Math.floor((Date.now() - new Date(r.calvingDate).getTime()) / 86400000);
                          if (daysOld >= 27) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">⚠ Passport overdue ({daysOld}d)</span>;
                          if (daysOld >= 20) return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Passport due in {27 - daysOld}d</span>;
                          return null;
                        })()
                    }
                    {hasDeadCalf(r) && (
                      r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">ABP disposal ✓</span>
                        : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">⚠ ABP disposal not recorded</span>
                    )}
                    {(calvingAttachMap[r.id] ?? 0) > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />{calvingAttachMap[r.id]}
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
        </>); })()}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Calving Record — {viewRecord.cowEarTag || `Record #${viewRecord.id}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calving Date</p><p className="font-medium">{formatDate(viewRecord.calvingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dam Ear Tag</p><p className="font-medium font-mono">{viewRecord.cowEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><p className="font-medium">{viewRecord.calvingEaseScore ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][viewRecord.calvingEaseScore] ?? viewRecord.calvingEaseScore : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">No. of Calves</p><p className="font-medium">{viewRecord.numberOfCalves ?? 1}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Outcome</p><p className="font-medium capitalize">{viewRecord.calfOutcome || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Sex</p><p className="font-medium capitalize">{viewRecord.calfSex || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Ear Tag</p><p className="font-medium font-mono">{viewRecord.calfEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Weight (kg)</p><p className="font-medium">{viewRecord.calfBirthWeightKg || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assistance Required</p><p className="font-medium">{viewRecord.assistanceRequired ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Attended</p><p className="font-medium">{viewRecord.vetAttended ? viewRecord.vetName || "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BCMS Passport</p><p className="font-medium">{viewRecord.bcmsPassportApplied ? "Applied ✓" : "Pending"}</p></div>
              {hasDeadCalf(viewRecord) && (
                <div className="col-span-2 border rounded-md bg-amber-50 border-amber-200 p-3">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">ABP Perinatal Disposal (Category 3)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{viewRecord.perinatalCollectionDate ? new Date(viewRecord.perinatalCollectionDate).toLocaleDateString("en-GB") : "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Consignment / NFAS Ref</p><p className="font-medium">{viewRecord.perinatalCollectionRef || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Method</p><p className="font-medium">{viewRecord.perinatalDisposalMethod || "—"}</p></div>
                    {viewRecord.perinatalDisposalNotes && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Notes</p><p className="font-medium">{viewRecord.perinatalDisposalNotes}</p></div>}
                  </div>
                </div>
              )}
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="calving" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "62rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Calving Record" : "Add Calving Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column: cow + calf ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cow Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Calving Date *</Label><Input type="date" value={form.calvingDate?.slice(0, 10) || ""} onChange={e => set("calvingDate", e.target.value)} /></div>
                  <div>
                    <Label>Dam Ear Tag</Label>
                    {cows.length > 0 && !showManualEarTag ? (
                      <Select
                        value={form.cowAnimalId ? String(form.cowAnimalId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__manual__") { setShowManualEarTag(true); set("cowAnimalId", null); return; }
                          const animal = cows.find(a => a.id === parseInt(v));
                          set("cowAnimalId", v === "__none__" ? null : parseInt(v));
                          set("cowEarTag", animal?.earTagNumber ?? null);
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select cow..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {cows.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.earTagNumber!}</SelectItem>)}
                          <SelectItem value="__manual__">Enter tag manually…</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input value={form.cowEarTag || ""} onChange={e => set("cowEarTag", e.target.value)} placeholder="Cow's BCMS ear tag" />
                        {cows.length > 0 && (
                          <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualEarTag(false); set("cowAnimalId", null); set("cowEarTag", null); }}>↩</Button>
                        )}
                      </div>
                    )}
                    {cows.length === 0 && animalsQ.isSuccess && (
                      <p className="text-xs text-amber-600 mt-1">No cattle registered. Add animals in the Livestock page, or type the ear tag above.</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Calving Ease Score *</Label>
                  <Select value={String(form.calvingEaseScore || "")} onValueChange={v => set("calvingEaseScore", v ? parseInt(v) : null)}>
                    <SelectTrigger><SelectValue placeholder="Select score..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 — Unassisted</SelectItem>
                      <SelectItem value="2">2 — Minor assistance (1 person)</SelectItem>
                      <SelectItem value="3">3 — Major assistance (calving aid)</SelectItem>
                      <SelectItem value="4">4 — Vet/caesarean required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Cow Complications</Label><Input value={form.cowComplications || ""} onChange={e => set("cowComplications", e.target.value)} placeholder="e.g. retained placenta, hypocalcaemia" /></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ar" checked={!!form.assistanceRequired} onChange={e => { set("assistanceRequired", e.target.checked); if (!e.target.checked) set("assistanceType", null); }} className="rounded" />
                    <Label htmlFor="ar">Assistance required</Label>
                  </div>
                  {form.assistanceRequired && (
                    <div className="pl-6">
                      <Label>Type of Assistance</Label>
                      <Select value={form.assistanceType || "__none__"} onValueChange={v => set("assistanceType", v === "__none__" ? null : v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          <SelectItem value="manual-1-person">Manual — 1 person</SelectItem>
                          <SelectItem value="manual-2-person">Manual — 2 persons</SelectItem>
                          <SelectItem value="calving-aid">Calving aid / jack</SelectItem>
                          <SelectItem value="vet-assisted">Vet-assisted delivery</SelectItem>
                          <SelectItem value="caesarean">Caesarean section</SelectItem>
                          <SelectItem value="embryotomy">Embryotomy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="va" checked={!!form.vetAttended} onChange={e => { set("vetAttended", e.target.checked); if (!e.target.checked) { set("vetName", null); setShowManualVet(false); } }} className="rounded" />
                    <Label htmlFor="va">Vet attended</Label>
                  </div>
                  {form.vetAttended && (
                    <div className="pl-6">
                      <Label>Vet Name</Label>
                      {uniqueVetNames.length > 0 && !showManualVet ? (
                        <Select
                          value={form.vetName && uniqueVetNames.includes(form.vetName) ? form.vetName : "__none__"}
                          onValueChange={v => {
                            if (v === "__manual__") { setShowManualVet(true); set("vetName", ""); return; }
                            set("vetName", v === "__none__" ? null : v);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Select vet..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Not specified</SelectItem>
                            {uniqueVetNames.map(n => <SelectItem key={n} value={n}>{n}{vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""}</SelectItem>)}
                            <SelectItem value="__manual__">Enter new vet name…</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex gap-1">
                          <Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Vet's name" />
                          {uniqueVetNames.length > 0 && (
                            <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualVet(false); set("vetName", null); }}>↩</Button>
                          )}
                        </div>
                      )}
                      {vetVisitsQ.isSuccess && uniqueVetNames.length === 0 && !showManualVet && (
                        <p className="text-xs text-gray-400 mt-1">No previous vets on record — type the name above.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calf Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><Label>Number of Calves</Label><Input type="number" min="1" max="4" value={form.numberOfCalves || 1} onChange={e => { const n = parseInt(e.target.value); set("numberOfCalves", n); if (n < 2) { set("calfOutcome2", null); set("calfSex2", null); set("calfEarTag2", null); set("calfBirthWeightKg2", null); } }} /></div>
                </div>
                {/* Calf 1 */}
                {(form.numberOfCalves ?? 1) >= 2 && <p className="text-xs font-medium text-gray-500">Calf 1</p>}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Outcome" : "Calf Outcome"}</Label>
                    <Select value={form.calfOutcome || ""} onValueChange={v => set("calfOutcome", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="stillborn">Stillborn</SelectItem>
                        <SelectItem value="died-within-24h">Died within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Sex" : "Calf Sex"}</Label>
                    <Select value={form.calfSex || ""} onValueChange={v => set("calfSex", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Heifer (Female)</SelectItem>
                        <SelectItem value="male">Bull Calf (Male)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Ear Tag" : "Calf Ear Tag"}</Label>
                    <Input value={form.calfEarTag || ""} onChange={e => set("calfEarTag", e.target.value)} placeholder="BCMS ear tag number" />
                    {form.calfOutcome === "live" && form.calfEarTag && !form.calfAnimalId && (
                      <p className="text-xs text-teal-600 mt-1">Live calf will be auto-registered in the Livestock module on save — no double entry needed.</p>
                    )}
                    {form.calfAnimalId && (
                      <p className="text-xs text-teal-600 mt-1">Already in Livestock Register (ID #{form.calfAnimalId}). Movements &amp; destination tracked there.</p>
                    )}
                  </div>
                  <div><Label>{(form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Birth Weight (kg)" : "Birth Weight (kg)"}</Label><Input type="number" step="0.1" value={form.calfBirthWeightKg || ""} onChange={e => set("calfBirthWeightKg", e.target.value)} /></div>
                </div>
                {/* Calf 2 (twins) */}
                {(form.numberOfCalves ?? 1) >= 2 && (
                  <>
                    <p className="text-xs font-medium text-gray-500 pt-1 border-t">Calf 2</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Calf 2 Outcome</Label>
                        <Select value={form.calfOutcome2 || ""} onValueChange={v => set("calfOutcome2", v)}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="stillborn">Stillborn</SelectItem>
                            <SelectItem value="died-within-24h">Died within 24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Calf 2 Sex</Label>
                        <Select value={form.calfSex2 || ""} onValueChange={v => set("calfSex2", v)}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Heifer (Female)</SelectItem>
                            <SelectItem value="male">Bull Calf (Male)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Calf 2 Ear Tag</Label>
                        <Input value={form.calfEarTag2 || ""} onChange={e => set("calfEarTag2", e.target.value)} placeholder="BCMS ear tag number" />
                        {form.calfOutcome2 === "live" && form.calfEarTag2 && !form.calfAnimalId2 && (
                          <p className="text-xs text-teal-600 mt-1">Live calf will be auto-registered in the Livestock module on save.</p>
                        )}
                      </div>
                      <div><Label>Calf 2 Birth Weight (kg)</Label><Input type="number" step="0.1" value={form.calfBirthWeightKg2 || ""} onChange={e => set("calfBirthWeightKg2", e.target.value)} /></div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label>Conception Method</Label>
                    <Select
                      value={form.conceptionMethod || "__none__"}
                      onValueChange={v => {
                        const method = v === "__none__" ? null : v;
                        set("conceptionMethod", method);
                        set("sireRegisterId", null);
                        set("strawInventoryId", null);
                        set("sireBreed", "");
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not recorded</SelectItem>
                        <SelectItem value="natural">Natural Service (bull)</SelectItem>
                        <SelectItem value="ai">AI — Artificial Insemination</SelectItem>
                        <SelectItem value="embryo-transfer">Embryo Transfer (ET)</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.conceptionMethod === "natural" && (
                    <div className="col-span-2">
                      <Label>Sire (from Sire Register)</Label>
                      <Select
                        value={form.sireRegisterId ? String(form.sireRegisterId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__none__") { set("sireRegisterId", null); set("sireBreed", ""); return; }
                          const sire = activeSires.find(s => s.id === parseInt(v));
                          set("sireRegisterId", parseInt(v));
                          set("sireBreed", sire?.breed ?? "");
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select sire..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {activeSires.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}{s.breed ? ` (${s.breed})` : ""}{s.tagNumber ? ` — ${s.tagNumber}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {siresQ.isSuccess && activeSires.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">No bulls in Sire Register. Add them via the Livestock → Breeding section.</p>
                      )}
                      {form.sireBreed && <p className="text-xs text-gray-500 mt-1">Breed auto-filled: {form.sireBreed}</p>}
                    </div>
                  )}
                  {form.conceptionMethod === "ai" && (
                    <div className="col-span-2">
                      <Label>AI Straw (from Inventory)</Label>
                      <Select
                        value={form.strawInventoryId ? String(form.strawInventoryId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__none__") { set("strawInventoryId", null); set("sireBreed", ""); return; }
                          const straw = cattleStraws.find(s => s.id === parseInt(v));
                          set("strawInventoryId", parseInt(v));
                          set("sireBreed", straw?.sireBreed ?? "");
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select straw batch..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {cattleStraws.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.sireName}{s.sireBreed ? ` (${s.sireBreed})` : ""} — Batch {s.batchNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {strawsQ.isSuccess && cattleStraws.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">No AI straws in inventory. Add them via the Livestock → Breeding section.</p>
                      )}
                      {form.sireBreed && <p className="text-xs text-gray-500 mt-1">Sire breed auto-filled: {form.sireBreed}</p>}
                    </div>
                  )}
                  {(!form.conceptionMethod || form.conceptionMethod === "unknown") && (
                    <div className="col-span-2">
                      <Label>Sire Breed</Label>
                      <Input value={form.sireBreed || ""} onChange={e => set("sireBreed", e.target.value)} placeholder="e.g. Aberdeen Angus" />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Calf Disposition <span className="font-normal text-gray-400">(optional — can be updated later)</span></Label>
                  <Select value={form.calfDisposition || "__none__"} onValueChange={v => set("calfDisposition", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Not yet decided..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not yet decided</SelectItem>
                      <SelectItem value="retained">Retained on farm (rear)</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="market">To market / auction</SelectItem>
                      <SelectItem value="died">Died post-birth</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">Only needed for calves leaving the holding (sold/market) or that die post-birth. Calves retained on farm have their movements tracked automatically through the Livestock module — no need to record disposition here.</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="bpp" checked={!!form.bcmsPassportApplied} onChange={e => set("bcmsPassportApplied", e.target.checked)} className="rounded" />
                    <Label htmlFor="bpp">BCMS passport applied</Label>
                  </div>
                  <p className="text-xs text-gray-400 ml-6">UK rules: passport must be applied within 36 days of birth (or within 7 days if the calf leaves the farm of birth before day 36). Tick once submitted to BCMS/CTS.</p>
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column: colostrum + notes ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colostrum Management</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="c2h" checked={!!form.colostrumGivenWithin2Hours} onChange={e => set("colostrumGivenWithin2Hours", e.target.checked)} className="rounded" />
                    <Label htmlFor="c2h">Colostrum given within 2 hours</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="c6h" checked={!!form.colostrumGivenWithin6Hours} onChange={e => set("colostrumGivenWithin6Hours", e.target.checked)} className="rounded" />
                    <Label htmlFor="c6h">Colostrum given within 6 hours</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>First Feed Volume (L)</Label><Input type="number" step="0.1" value={form.colostrumVolumeFirstFeedLitres || ""} onChange={e => set("colostrumVolumeFirstFeedLitres", e.target.value)} /></div>
                  <div><Label>Brix Quality (%)</Label><Input type="number" step="0.1" value={form.colostrumQualityBrix || ""} onChange={e => set("colostrumQualityBrix", e.target.value)} placeholder="≥22% = good" /></div>
                </div>
                <div>
                  <Label>Colostrum Source</Label>
                  <Select value={form.colostrumSource || ""} onValueChange={v => set("colostrumSource", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own-dam">Own dam</SelectItem>
                      <SelectItem value="other-cow">Other cow on farm</SelectItem>
                      <SelectItem value="frozen-stored">Frozen/stored colostrum</SelectItem>
                      <SelectItem value="colostrum-supplement">Commercial colostrum supplement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={5} />
              </div>
            </div>
          </div>
          {hasDeadCalf(form) && (
            <div className="border border-amber-300 bg-amber-50 rounded-md p-4 space-y-3 mt-2">
              <p className="text-sm font-semibold text-amber-800">ABP Perinatal Disposal — Category 3 (Required)</p>
              <p className="text-xs text-amber-700">Stillborn and died-within-24h calves are Category 3 Animal By-Product waste (Regulation (EC) 1069/2009). They must be collected by a licensed fallen stock contractor or disposed of via another approved route. Retain the collection/consignment note for at least 3 years. These calves may not enter the food chain.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fallen Stock Contractor</Label>
                  <Select value={form.perinatalDisposalContractorId ? String(form.perinatalDisposalContractorId) : ""} onValueChange={v => set("perinatalDisposalContractorId", v ? Number(v) : null)}>
                    <SelectTrigger><SelectValue placeholder="Select contractor…" /></SelectTrigger>
                    <SelectContent>
                      {contractors.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.approvalNumber})</SelectItem>)}
                      {contractors.length === 0 && <SelectItem value="none" disabled>No contractors set up — add in Livestock settings</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Collection Date</Label><Input type="date" value={form.perinatalCollectionDate?.slice(0, 10) || ""} onChange={e => set("perinatalCollectionDate", e.target.value)} /></div>
                <div><Label>Consignment / NFAS Reference</Label><Input value={form.perinatalCollectionRef || ""} onChange={e => set("perinatalCollectionRef", e.target.value)} placeholder="e.g. NFAS-LIN-0042-240317" /></div>
                <div><Label>Disposal Method (if no contractor)</Label><Input value={form.perinatalDisposalMethod || ""} onChange={e => set("perinatalDisposalMethod", e.target.value)} placeholder="e.g. Hunt kennels, on-farm incinerator" /></div>
              </div>
              <div><Label>Disposal Notes</Label><Input value={form.perinatalDisposalNotes || ""} onChange={e => set("perinatalDisposalNotes", e.target.value)} placeholder="Any additional disposal notes…" /></div>
            </div>
          )}
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.calvingDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Calving"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

