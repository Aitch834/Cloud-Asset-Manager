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
import { api, formatDate, today, SccBadge, AbrKitStock } from "./shared";

// ─── Milk Records ──────────────────────────────────────────────────────────────

interface MilkRecord {
  id: number; recordDate: string; recordType: string; sessionType?: string | null;
  milkBuyer?: string | null;
  yieldLitres?: string | null;
  // On-farm temperature
  milkTemperatureCelsius?: string | null; tempTestedBy?: string | null;
  // On-farm ABR
  antibioticResidueTestResult?: string | null; abrTestedBy?: string | null;
  abrTestKitLot?: string | null; abrTestKitBatch?: string | null;
  isRetest?: boolean | null; retestOfId?: number | null;
  // Buyer lab results
  buyerLabResultsStatus?: string | null; buyerLabResultsDate?: string | null;
  buyerLabRef?: string | null; buyerSccThousands?: number | null;
  buyerTbcCfuMl?: number | null; buyerFatPercent?: string | null;
  buyerProteinPercent?: string | null; buyerLactosePercent?: string | null;
  // On-farm quality measurements
  sccThousands?: number | null; tbcCfuMl?: number | null;
  fatPercent?: string | null; proteinPercent?: string | null; lactosePercent?: string | null;
  collectorReference?: string | null; herdId?: number | null; notes?: string | null;
  documentPath?: string | null; documentName?: string | null;
}

function LabResultsBadge({ status }: { status?: string | null }) {
  if (!status || status === "not-applicable") return null;
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Lab Results Pending", cls: "bg-amber-100 text-amber-800" },
    received: { label: "Lab Results Received", cls: "bg-green-100 text-green-800" },
    concern: { label: "Lab Results — Action Needed", cls: "bg-red-100 text-red-800" },
  };
  const m = map[status];
  if (!m) return null;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>;
}

// ─── Monthly Summary Component ────────────────────────────────────────────────

function MilkMonthlySummary({ records, monthLabel }: { records: MilkRecord[]; monthLabel: string }) {
  const printRef = useRef<HTMLDivElement>(null);

  const totalYield = records.reduce((s, r) => s + (parseFloat(r.yieldLitres || "0") || 0), 0);
  const uniqueDays = new Set(records.map(r => r.recordDate?.slice(0, 10)).filter(Boolean)).size;
  const avgDaily = uniqueDays > 0 ? totalYield / uniqueDays : 0;

  const sccReadings = records.map(r => r.buyerSccThousands ?? r.sccThousands).filter((v): v is number => v != null);
  const avgScc = sccReadings.length > 0 ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;

  const abrTests = records.filter(r => r.antibioticResidueTestResult);
  const abrPositives = abrTests.filter(r => r.antibioticResidueTestResult === "positive").length;

  // Group by calendar day — sum yields, average SCC
  const byDay = new Map<string, { yield: number; sccSum: number; sccCount: number }>();
  for (const r of records) {
    const day = r.recordDate?.slice(0, 10);
    if (!day) continue;
    const yld = parseFloat(r.yieldLitres || "0") || 0;
    const scc = r.buyerSccThousands ?? r.sccThousands ?? null;
    const ex = byDay.get(day) ?? { yield: 0, sccSum: 0, sccCount: 0 };
    byDay.set(day, {
      yield: ex.yield + yld,
      sccSum: scc != null ? ex.sccSum + scc : ex.sccSum,
      sccCount: scc != null ? ex.sccCount + 1 : ex.sccCount,
    });
  }

  const chartData = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      day: parseInt(date.slice(8, 10)),
      date,
      yield: Math.round(v.yield * 10) / 10,
      scc: v.sccCount > 0 ? Math.round(v.sccSum / v.sccCount) : null,
    }));

  const hasScc = chartData.some(d => d.scc != null);

  function handlePrint() {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Milk Records — ${monthLabel}</title>
      <style>body{font-family:sans-serif;font-size:13px;color:#111;padding:24px}
      h2{margin:0 0 16px}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
      .stat{border:1px solid #e5e7eb;border-radius:6px;padding:10px}
      .stat-label{font-size:11px;color:#6b7280;margin-bottom:2px}
      .stat-value{font-size:20px;font-weight:600}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;padding:6px 8px;border-bottom:2px solid #e5e7eb}
      td{padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px}
      </style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    setTimeout(() => { w.addEventListener("afterprint", () => w.close()); w.print(); }, 400);
  }

  const sccColour = (v: number | null) =>
    v == null ? "text-gray-400" : v > 400 ? "text-red-700" : v > 200 ? "text-amber-700" : "text-green-700";
  const sccBg = (v: number | null) =>
    v == null ? "bg-gray-50 border-gray-200" : v > 400 ? "bg-red-50 border-red-200" : v > 200 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  return (
    <div className="mb-4 rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-800">Monthly Summary — {monthLabel}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
        </Button>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No records for this month to summarise.</p>
      ) : (
        <div className="p-4 space-y-5">
          {/* Hidden print content */}
          <div ref={printRef} style={{ display: "none" }}>
            <h2>Milk Records — {monthLabel}</h2>
            <div className="stats">
              <div className="stat"><div className="stat-label">Total Yield</div><div className="stat-value">{totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</div></div>
              <div className="stat"><div className="stat-label">Daily Average</div><div className="stat-value">{uniqueDays > 0 ? Math.round(avgDaily).toLocaleString() : "—"} L</div></div>
              <div className="stat"><div className="stat-label">Avg SCC (k/mL)</div><div className="stat-value">{avgScc != null ? avgScc.toLocaleString() : "—"}</div></div>
              <div className="stat"><div className="stat-label">ABR Tests</div><div className="stat-value">{abrTests.length}{abrPositives > 0 ? ` (${abrPositives} pos)` : ""}</div></div>
            </div>
            <table>
              <thead><tr><th>Date</th><th>Session</th><th>Yield (L)</th><th>Temp (°C)</th><th>ABR</th><th>SCC (k/mL)</th><th>Buyer Lab Status</th><th>Buyer</th></tr></thead>
              <tbody>{records.sort((a, b) => (a.recordDate ?? "").localeCompare(b.recordDate ?? "")).map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.recordDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                  <td>{r.sessionType ?? "—"}</td>
                  <td>{r.yieldLitres ? parseFloat(r.yieldLitres).toLocaleString() : "—"}</td>
                  <td>{r.milkTemperatureCelsius ?? "—"}</td>
                  <td>{r.antibioticResidueTestResult ?? "—"}</td>
                  <td>{(r.buyerSccThousands ?? r.sccThousands)?.toLocaleString() ?? "—"}</td>
                  <td>{r.buyerLabResultsStatus ?? "—"}</td>
                  <td>{r.milkBuyer ?? "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5">
              <p className="text-xs text-blue-600 mb-0.5">Total Yield</p>
              <p className="text-xl font-bold text-blue-800">{totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 })}<span className="text-sm font-normal ml-1">L</span></p>
            </div>
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2.5">
              <p className="text-xs text-gray-500 mb-0.5">Daily Average</p>
              <p className="text-xl font-bold text-gray-800">{uniqueDays > 0 ? Math.round(avgDaily).toLocaleString() : "—"}<span className="text-sm font-normal ml-1">L</span></p>
              {uniqueDays > 0 && <p className="text-xs text-gray-400">across {uniqueDays} day{uniqueDays !== 1 ? "s" : ""}</p>}
            </div>
            <div className={`rounded-md border px-3 py-2.5 ${sccBg(avgScc)}`}>
              <p className={`text-xs mb-0.5 ${avgScc == null ? "text-gray-500" : avgScc > 400 ? "text-red-600" : avgScc > 200 ? "text-amber-600" : "text-green-600"}`}>Avg SCC (k/mL)</p>
              <p className={`text-xl font-bold ${sccColour(avgScc)}`}>{avgScc != null ? avgScc.toLocaleString() : "—"}</p>
              {avgScc != null && <p className={`text-xs ${sccColour(avgScc)}`}>{avgScc <= 200 ? "Within threshold" : avgScc <= 400 ? "Above 200k — monitor" : "High — action needed"}</p>}
            </div>
            <div className={`rounded-md border px-3 py-2.5 ${abrPositives > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-xs mb-0.5 ${abrPositives > 0 ? "text-red-600" : "text-gray-500"}`}>ABR Tests</p>
              <p className={`text-xl font-bold ${abrPositives > 0 ? "text-red-700" : "text-gray-700"}`}>{abrTests.length}</p>
              <p className={`text-xs ${abrPositives > 0 ? "text-red-600 font-medium" : "text-gray-400"}`}>
                {abrTests.length === 0 ? "No tests recorded" : abrPositives > 0 ? `${abrPositives} positive result${abrPositives > 1 ? "s" : ""}` : "All negative"}
              </p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Daily Yield{hasScc ? " & SCC Trend" : ""}
              </p>
              <ResponsiveContainer width="100%" height={210}>
                <ComposedChart data={chartData} margin={{ top: 4, right: hasScc ? 52 : 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="yield" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={50} tickFormatter={v => `${v}L`} />
                  {hasScc && (
                    <YAxis yAxisId="scc" orientation="right" tick={{ fontSize: 11, fill: "#fb923c" }} tickLine={false} axisLine={false} width={44} tickFormatter={v => `${v}k`} />
                  )}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-md shadow px-3 py-2 text-xs">
                          <p className="font-semibold text-gray-700 mb-1">
                            {new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                          </p>
                          {d.yield > 0 && <p className="text-blue-600">Yield: <span className="font-medium">{d.yield.toLocaleString()} L</span></p>}
                          {d.scc != null && <p className="text-orange-500">SCC: <span className="font-medium">{d.scc.toLocaleString()} k/mL</span></p>}
                        </div>
                      );
                    }}
                  />
                  <Bar yAxisId="yield" dataKey="yield" fill="#3b82f6" fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Yield (L)" maxBarSize={32} />
                  {hasScc && (
                    <>
                      <Line yAxisId="scc" type="monotone" dataKey="scc" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3.5, fill: "#f97316", strokeWidth: 0 }} connectNulls name="SCC (k/mL)" />
                      <ReferenceLine yAxisId="scc" y={200} stroke="#f97316" strokeDasharray="5 3" strokeOpacity={0.45} label={{ value: "200k", position: "right", fontSize: 10, fill: "#f97316" }} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-500 opacity-80" />Daily yield (L)</span>
                {hasScc && <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-orange-400" />SCC (k/mL) — dashed line = 200k threshold</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const UK_MILK_BUYERS = [
  "Arla Foods UK", "Müller Milk & Ingredients", "First Milk", "Crediton Dairy",
  "Dale Farm", "Freshways Dairy", "Glanbia Cheese", "Graham's The Family Dairy",
  "Hook & Son", "Medina Dairy", "Norseland", "Saputo Dairy UK",
  "The Collective Dairy", "Yeo Valley Farms",
];

export function MilkRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MilkRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MilkRecord | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<MilkRecord | null>(null);
  const [form, setForm] = useState<Partial<MilkRecord>>({});
  const [abrKitStockId, setAbrKitStockId] = useState<string>("");

  // Month filter — default to current month
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth()); // 0-indexed

  function stepMonth(dir: 1 | -1) {
    setFilterMonth(m => {
      const next = m + dir;
      if (next < 0) { setFilterYear(y => y - 1); return 11; }
      if (next > 11) { setFilterYear(y => y + 1); return 0; }
      return next;
    });
  }

  const monthLabel = new Date(filterYear, filterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const { data, isLoading } = useQuery<{ records: MilkRecord[] }>({
    queryKey: ["dairy-milk", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-records`), { credentials: "include" }).then(r => r.json()),
  });

  const abrStockQ = useQuery<{ stock: AbrKitStock[] }>({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`), { credentials: "include" }).then(r => r.json()),
  });
  const abrStock = abrStockQ.data?.stock ?? [];

  const staffNamesQ = useQuery<{ names: string[] }>({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const staffNames = staffNamesQ.data?.names ?? [];

  // Filter records to selected month
  const filteredRecords = (data?.records ?? []).filter(r => {
    if (!r.recordDate) return false;
    const d = new Date(r.recordDate);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });

  const save = useMutation({
    mutationFn: async (body: Partial<MilkRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/milk-records/${editing.id}`) : api(`farms/${farmId}/dairy/milk-records`);
      const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...body, abrKitStockId: abrKitStockId || undefined }) });
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] }); qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }); setOpen(false); setEditing(null); setForm({}); setAbrKitStockId(""); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/milk-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ recordDate: today(), recordType: "bulk-tank", buyerLabResultsStatus: "not-applicable" }); setAbrKitStockId(""); setOpen(true); }
  function openEdit(r: MilkRecord) { setEditing(r); setForm({ ...r }); setAbrKitStockId(""); setOpen(true); }
  function set(k: keyof MilkRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const labStatus = form.buyerLabResultsStatus;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>

      {/* ── View Dialog ─────────────────────────────────────────────────────── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "52rem" }}>
            <DialogHeader><DialogTitle>Milk Record — {formatDate(viewRecord.recordDate)}</DialogTitle></DialogHeader>
            <div className="space-y-5 text-sm overflow-y-auto max-h-[70vh]">

              {/* Collection Details */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Collection Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Record Type</p><p className="font-medium capitalize">{String(viewRecord.recordType ?? "—").replace(/-/g, " ")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Milking Session</p><p className="font-medium capitalize">{String(viewRecord.sessionType ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Milk Buyer</p><p className="font-medium">{viewRecord.milkBuyer ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Yield (litres)</p><p className="font-medium">{viewRecord.yieldLitres ? `${parseFloat(viewRecord.yieldLitres).toLocaleString()} L` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Collector Ref</p><p className="font-medium">{viewRecord.collectorReference ?? "—"}</p></div>
                </div>
              </div>

              {/* On-Farm Measurements */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">On-Farm Measurements</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Milk Temperature (°C)</p><p className="font-medium">{viewRecord.milkTemperatureCelsius ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Temp Tested By</p><p className="font-medium">{viewRecord.tempTestedBy ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">ABR Test Result</p><p className="font-medium capitalize">{viewRecord.antibioticResidueTestResult ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">ABR Tested By</p><p className="font-medium">{viewRecord.abrTestedBy ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">ABR Kit Lot No.</p><p className="font-medium font-mono">{viewRecord.abrTestKitLot ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">ABR Kit Batch No.</p><p className="font-medium font-mono">{viewRecord.abrTestKitBatch ?? "—"}</p></div>
                  {(viewRecord.sccThousands || viewRecord.tbcCfuMl || viewRecord.fatPercent) && <>
                    <div><p className="text-xs text-muted-foreground">SCC (k/mL) — On-farm</p><SccBadge v={viewRecord.sccThousands} /></div>
                    <div><p className="text-xs text-muted-foreground">TBC (cfu/mL)</p><p className="font-medium">{viewRecord.tbcCfuMl?.toLocaleString() ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Fat %</p><p className="font-medium">{viewRecord.fatPercent ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Protein %</p><p className="font-medium">{viewRecord.proteinPercent ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Lactose %</p><p className="font-medium">{viewRecord.lactosePercent ?? "—"}</p></div>
                  </>}
                </div>
              </div>

              {/* Buyer Lab Results */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Buyer Lab Results</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 flex items-center gap-2"><p className="text-xs text-muted-foreground">Status</p><LabResultsBadge status={viewRecord.buyerLabResultsStatus} />{(!viewRecord.buyerLabResultsStatus || viewRecord.buyerLabResultsStatus === "not-applicable") && <span className="text-sm text-gray-400">Not applicable</span>}</div>
                  <div><p className="text-xs text-muted-foreground">Results Received Date</p><p className="font-medium">{viewRecord.buyerLabResultsDate ? formatDate(viewRecord.buyerLabResultsDate) : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Buyer Lab Reference</p><p className="font-medium">{viewRecord.buyerLabRef ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">SCC (k/mL) — Buyer Lab</p><SccBadge v={viewRecord.buyerSccThousands} /></div>
                  <div><p className="text-xs text-muted-foreground">TBC (cfu/mL) — Buyer Lab</p><p className="font-medium">{viewRecord.buyerTbcCfuMl?.toLocaleString() ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Fat % — Buyer Lab</p><p className="font-medium">{viewRecord.buyerFatPercent ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Protein % — Buyer Lab</p><p className="font-medium">{viewRecord.buyerProteinPercent ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Lactose % — Buyer Lab</p><p className="font-medium">{viewRecord.buyerLactosePercent ?? "—"}</p></div>
                </div>
              </div>

              {viewRecord.notes && <div className="border-t pt-4"><p className="text-xs text-muted-foreground">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}

              {/* Document Attachments */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documents &amp; Attachments</p>
                <RecordAttachments recordType="dairy_milk_record" recordId={viewRecord.id} farmId={farmId} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Month Filter ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
        <button onClick={() => stepMonth(-1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-700">{monthLabel}</span>
        <button onClick={() => stepMonth(1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Next month">
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* ── Monthly Summary ──────────────────────────────────────────────────── */}
      {!isLoading && <MilkMonthlySummary records={filteredRecords} monthLabel={monthLabel} />}

      {/* ── List ────────────────────────────────────────────────────────────── */}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {filteredRecords.length === 0 && (
            <Card><CardContent className="py-8 text-center text-gray-400 text-sm">
              {data?.records?.length ? `No records for ${monthLabel} — use the arrows to browse other months.` : "No milk records yet — click Add Record to begin."}
            </CardContent></Card>
          )}
          {filteredRecords.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{formatDate(r.recordDate)}</span>
                    <span className="text-xs text-gray-500 capitalize">{r.recordType.replace(/-/g, " ")}{r.sessionType ? ` · ${r.sessionType}` : ""}</span>
                    {r.milkBuyer && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{r.milkBuyer}</span>}
                    {r.yieldLitres && <span className="text-sm text-gray-700">{parseFloat(r.yieldLitres).toLocaleString()} L</span>}
                    <SccBadge v={r.sccThousands || r.buyerSccThousands} />
                    {r.antibioticResidueTestResult && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.antibioticResidueTestResult === "negative" ? "bg-green-100 text-green-700" : r.antibioticResidueTestResult === "positive" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.antibioticResidueTestResult === "negative" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        ABR: {r.antibioticResidueTestResult}
                      </span>
                    )}
                    {r.isRetest && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">↩ Retest</span>}
                    {!r.isRetest && (data?.records ?? []).some(rt => rt.retestOfId === r.id && rt.antibioticResidueTestResult === "negative") && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Retested — Negative</span>
                    )}
                    <LabResultsBadge status={r.buyerLabResultsStatus} />
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    <DocAttach farmId={farmId} endpoint="dairy/milk-records" recordId={r.id} documentPath={r.documentPath ?? null} documentName={r.documentName ?? null} queryKey={["dairy-milk", farmId]} compact />
                    {((r.antibioticResidueTestResult && r.antibioticResidueTestResult !== "negative") || (r.sccThousands && Number(r.sccThousands ?? 0) > 200) || (r.buyerSccThousands && Number(r.buyerSccThousands ?? 0) > 200)) && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-600" title="Raise Task — quality alert" onClick={() => setRaiseTaskFor(r)}><ClipboardList className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1 truncate">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Milk Quality Alert — ${raiseTaskFor.antibioticResidueTestResult && raiseTaskFor.antibioticResidueTestResult !== "negative" ? `ABR ${raiseTaskFor.antibioticResidueTestResult.charAt(0).toUpperCase()}${raiseTaskFor.antibioticResidueTestResult.slice(1)}` : "High SCC"}`}
          defaultDescription={`Date: ${raiseTaskFor.recordDate ?? "—"} · ABR: ${raiseTaskFor.antibioticResidueTestResult ?? "—"} · SCC: ${raiseTaskFor.sccThousands ?? raiseTaskFor.buyerSccThousands ?? "—"} k/mL · Buyer: ${raiseTaskFor.milkBuyer ?? "—"}`}
          module="dairy"
        />
      )}

      {/* ── Add / Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "64rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Milk Record" : "Add Milk Record"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="session" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="session">Milking Session</TabsTrigger>
              <TabsTrigger value="collection">Collection &amp; Buyer Lab</TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Milking Session ── */}
            <TabsContent value="session">
              <div className="overflow-y-auto max-h-[68vh] space-y-5 pr-1">
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Milking Event</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Date *</Label><Input type="date" value={form.recordDate || ""} onChange={e => set("recordDate", e.target.value)} /></div>
                    <div>
                      <Label>Record Type *</Label>
                      <Select value={form.recordType || "bulk-tank"} onValueChange={v => set("recordType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bulk-tank">Bulk Tank (Quality Sample)</SelectItem>
                          <SelectItem value="individual-cow">Individual Cow</SelectItem>
                          <SelectItem value="herd-total">Herd Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Milking Session</Label>
                      <Select value={form.sessionType || ""} onValueChange={v => set("sessionType", v)}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="daily-total">Daily Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Yield (litres)</Label><Input type="number" step="0.1" value={form.yieldLitres || ""} onChange={e => set("yieldLitres", e.target.value)} /></div>
                  </div>
                </div>

                <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">On-Farm Measurements</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Milk Temperature (°C)</Label><Input type="number" step="0.1" value={form.milkTemperatureCelsius || ""} onChange={e => set("milkTemperatureCelsius", e.target.value)} placeholder="Target ≤4°C" /></div>
                    <div className="col-span-2">
                      <Label>Temperature Tested By</Label>
                      <datalist id="staff-names-list">
                        {staffNames.map(n => <option key={n} value={n} />)}
                      </datalist>
                      <Input list="staff-names-list" placeholder="Name of person who took reading" value={form.tempTestedBy || ""} onChange={e => set("tempTestedBy", e.target.value)} />
                    </div>
                    <div>
                      <Label>ABR Test Result</Label>
                      <Select value={form.antibioticResidueTestResult || ""} onValueChange={v => set("antibioticResidueTestResult", v)}>
                        <SelectTrigger><SelectValue placeholder="Not tested" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="negative">Negative (safe to supply)</SelectItem>
                          <SelectItem value="positive">Positive (milk discarded)</SelectItem>
                          <SelectItem value="borderline">Borderline</SelectItem>
                          <SelectItem value="invalid">Invalid (test void)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>ABR Tested By</Label>
                      <Input list="staff-names-list" placeholder="Name of tester" value={form.abrTestedBy || ""} onChange={e => set("abrTestedBy", e.target.value)} />
                    </div>
                    <div>
                      <Label>ABR Kit Stock Record</Label>
                      <Select value={abrKitStockId} onValueChange={setAbrKitStockId}>
                        <SelectTrigger><SelectValue placeholder="Link kit (auto-decrements stock)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None / not tracking</SelectItem>
                          {abrStock.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.productName}{s.lotNumber ? ` · Lot ${s.lotNumber}` : ""} ({s.quantityRemaining} remaining)</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>ABR Kit Lot Number</Label><Input placeholder="From kit packaging" value={form.abrTestKitLot || ""} onChange={e => set("abrTestKitLot", e.target.value)} /></div>
                    <div><Label>ABR Kit Batch Number</Label><Input placeholder="From kit packaging" value={form.abrTestKitBatch || ""} onChange={e => set("abrTestKitBatch", e.target.value)} /></div>
                    <div className="col-span-3 border-t border-amber-100 pt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="is-retest-abr" checked={!!form.isRetest} onChange={e => { set("isRetest", e.target.checked); if (!e.target.checked) set("retestOfId", null); }} className="w-4 h-4 rounded" />
                        <Label htmlFor="is-retest-abr" className="font-normal cursor-pointer">This is a follow-up retest of a previous non-negative result</Label>
                      </div>
                      {form.isRetest && (
                        <div className="space-y-1">
                          <Label>Retest of (original concerning record)</Label>
                          <Select value={form.retestOfId ? String(form.retestOfId) : ""} onValueChange={v => set("retestOfId", v ? Number(v) : null)}>
                            <SelectTrigger><SelectValue placeholder="Select the original record…" /></SelectTrigger>
                            <SelectContent>
                              {(data?.records ?? []).filter(r => r.id !== editing?.id && ["positive","borderline","invalid"].includes(r.antibioticResidueTestResult ?? "")).slice(0, 40).map(r => (
                                <SelectItem key={r.id} value={String(r.id)}>
                                  {new Date(r.recordDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})} — ABR {r.antibioticResidueTestResult}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">A Negative retest will auto-resolve the alert for the original record.</p>
                        </div>
                      )}
                    </div>
                    <div className="col-span-3 border-t border-blue-200 pt-3">
                      <p className="text-xs text-blue-600 mb-2 font-medium">On-farm quality measurements (optional — if tested on-farm separately from buyer)</p>
                      <div className="grid grid-cols-5 gap-2">
                        <div><Label>SCC (k/mL)</Label><Input type="number" value={form.sccThousands || ""} onChange={e => set("sccThousands", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                        <div><Label>TBC (cfu/mL)</Label><Input type="number" value={form.tbcCfuMl || ""} onChange={e => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                        <div><Label>Fat %</Label><Input type="number" step="0.01" value={form.fatPercent || ""} onChange={e => set("fatPercent", e.target.value)} /></div>
                        <div><Label>Protein %</Label><Input type="number" step="0.01" value={form.proteinPercent || ""} onChange={e => set("proteinPercent", e.target.value)} /></div>
                        <div><Label>Lactose %</Label><Input type="number" step="0.01" value={form.lactosePercent || ""} onChange={e => set("lactosePercent", e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} /></div>
              </div>
            </TabsContent>

            {/* ── Tab 2: Collection & Buyer Lab ── */}
            <TabsContent value="collection">
              <div className="overflow-y-auto max-h-[68vh] space-y-5 pr-1">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-800 mb-1">One collection covers multiple milkings</p>
                  <p className="text-xs text-amber-700">A tanker typically collects from the bulk tank every 2–3 days. Enter the same Collector / Tanker Reference on every milking session that went into one collection load. The buyer's lab results are tied to the collection event, not to each individual milking.</p>
                </div>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Collection Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Milk Buyer</Label>
                      <datalist id="milk-buyer-list">
                        {UK_MILK_BUYERS.map(b => <option key={b} value={b} />)}
                      </datalist>
                      <Input list="milk-buyer-list" placeholder="Type or select buyer…" value={form.milkBuyer || ""} onChange={e => set("milkBuyer", e.target.value)} />
                    </div>
                    <div><Label>Collector / Tanker Ref</Label><Input value={form.collectorReference || ""} onChange={e => set("collectorReference", e.target.value)} /></div>
                  </div>
                </div>
                <div className="rounded-md border border-purple-100 bg-purple-50 p-4">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Buyer Lab Results</p>
                  <p className="text-xs text-purple-600 mb-3">Transcribe results from your milk buyer's lab report. These are the official figures used for payment and compliance.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3">
                      <Label>Lab Results Status</Label>
                      <Select value={labStatus || "not-applicable"} onValueChange={v => set("buyerLabResultsStatus", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-applicable">Not applicable (no buyer lab for this record)</SelectItem>
                          <SelectItem value="pending">Pending — awaiting results from buyer</SelectItem>
                          <SelectItem value="received">Received — results logged below</SelectItem>
                          <SelectItem value="concern">Concern — results require action</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(labStatus === "received" || labStatus === "concern") && <>
                      <div><Label>Results Date</Label><Input type="date" value={form.buyerLabResultsDate || ""} onChange={e => set("buyerLabResultsDate", e.target.value)} /></div>
                      <div className="col-span-2"><Label>Buyer Lab Reference</Label><Input placeholder="Lab report reference / slip number" value={form.buyerLabRef || ""} onChange={e => set("buyerLabRef", e.target.value)} /></div>
                      <div><Label>SCC (k/mL) — Buyer</Label><Input type="number" value={form.buyerSccThousands || ""} onChange={e => set("buyerSccThousands", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                      <div><Label>TBC (cfu/mL) — Buyer</Label><Input type="number" value={form.buyerTbcCfuMl || ""} onChange={e => set("buyerTbcCfuMl", e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                      <div><Label>Fat % — Buyer</Label><Input type="number" step="0.01" value={form.buyerFatPercent || ""} onChange={e => set("buyerFatPercent", e.target.value)} /></div>
                      <div><Label>Protein % — Buyer</Label><Input type="number" step="0.01" value={form.buyerProteinPercent || ""} onChange={e => set("buyerProteinPercent", e.target.value)} /></div>
                      <div><Label>Lactose % — Buyer</Label><Input type="number" step="0.01" value={form.buyerLactosePercent || ""} onChange={e => set("buyerLactosePercent", e.target.value)} /></div>
                    </>}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.recordDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

