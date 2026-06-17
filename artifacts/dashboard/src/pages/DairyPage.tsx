import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useUser } from "@clerk/react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, PieChart, Pie, Cell } from "recharts";
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
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, Eye, Droplets, Thermometer, FileDown, Paperclip, BarChart2, QrCode, Download, MapPin, ChevronsUpDown, Search, X, Sparkles, ClipboardList, Printer } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { QRCodeSVG } from "qrcode.react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { openPrintWindow } from "@/lib/print-report";
import { VMD_MEDICINES } from "@/data/vmdMedicines";
import { AbrProcurementSection } from "@/pages/dairy/AbrProcurementSection";

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

function formatDate(v?: string | null) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return v; }
}

function today() { return new Date().toISOString().slice(0, 10); }

function SccBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const ok = v < 200;
  const warn = v >= 200 && v < 400;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL
    </span>
  );
}

function EaseScoreBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const colours = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const labels = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[v] || "bg-gray-100 text-gray-700"}`}>{v} — {labels[v] || "Unknown"}</span>;
}

function OutcomeBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const map: Record<string, string> = { cured: "bg-green-100 text-green-800", recovered: "bg-green-100 text-green-800", "dried-off": "bg-blue-100 text-blue-800", "culled": "bg-red-100 text-red-800", chronic: "bg-amber-100 text-amber-800", ongoing: "bg-yellow-100 text-yellow-800" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || "bg-gray-100 text-gray-700"}`}>{v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ")}</span>;
}

function BcsBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const n = parseFloat(v);
  const ok = n >= 2.5 && n <= 3.5;
  const low = n < 2.5;
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : low ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{v}</span>;
}

type Tab = "milk" | "mastitis" | "calving" | "bcs" | "mobility" | "tank" | "dct" | "johnes";

export default function DairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("milk");

  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Dairy Records">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dairy Records</h1>
          <p className="text-gray-500 text-sm mt-1">Red Tractor Dairy scheme compliance — milk recording, mastitis, calving, body condition, mobility, bulk tank, and dry cow therapy. Supports dairy cattle and water buffalo herds (both regulated as bovines under BCMS).</p>
        </div>

        <TabBar>
          <TabButton active={tab === "milk"} onClick={() => setTab("milk")}>Milk Records</TabButton>
          <TabButton active={tab === "mastitis"} onClick={() => setTab("mastitis")}>Mastitis</TabButton>
          <TabButton active={tab === "calving"} onClick={() => setTab("calving")}>Calving</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "mobility"} onClick={() => setTab("mobility")}>Mobility Scoring</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "dct"} onClick={() => setTab("dct")}>Dry Cow Therapy</TabButton>
          <TabButton active={tab === "johnes"} onClick={() => setTab("johnes")}>Johne's Monitoring</TabButton>
        </TabBar>

        <div className="mt-6">
          {tab === "milk" && <MilkRecordsTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "calving" && <CalvingTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "mobility" && <MobilityTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "dct" && <DctTab farmId={farmId} />}
          {tab === "johnes" && <JohnesTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}

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

function MilkRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
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
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/milk-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] }),
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
      <Dialog open={open} onOpenChange={setOpen}>
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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MastitisRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MastitisRecord | null>(null);
  const [form, setForm] = useState<Partial<MastitisRecord>>({});

  // ── Filters & view state ──
  const [filterPreset, setFilterPreset] = useState<"30d" | "90d" | "12m" | "all">("12m");
  const [filterEarTag, setFilterEarTag] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
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
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/mastitis-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }),
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
      <Dialog open={open} onOpenChange={setOpen}>
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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalvingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<CalvingRecord | null>(null);
  const [form, setForm] = useState<Partial<CalvingRecord>>({});
  const [showManualEarTag, setShowManualEarTag] = useState(false);
  const [showManualVet, setShowManualVet] = useState(false);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));

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
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/calving-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }),
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
      <Dialog open={open} onOpenChange={setOpen}>
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

// ─── Body Condition Scoring ────────────────────────────────────────────────────

interface BcsRecord {
  id: number; herdId?: number | null; animalId?: number | null; earTagNumber?: string | null;
  assessmentDate: string; lifeStage?: string | null; bcsScore?: string | null;
  assessedBy?: string | null; targetScore?: string | null; actionRequired?: boolean;
  actionTaken?: string | null; notes?: string | null;
}

export function BcsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { user: clerkUser } = useUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BcsRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<BcsRecord | null>(null);
  const [form, setForm] = useState<Partial<BcsRecord>>({});

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
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/bcs-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-bcs", farmId] }),
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
      <Dialog open={open} onOpenChange={setOpen}>
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
            <div><Label>Assessed By</Label><Input value={form.assessedBy || ""} onChange={e => set("assessedBy", e.target.value)} /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="acreq" checked={!!form.actionRequired} onChange={e => set("actionRequired", e.target.checked)} className="rounded" />
              <Label htmlFor="acreq">Management action required</Label>
            </div>
            <div className="col-span-2"><Label>Action Taken</Label><Input value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} placeholder="e.g. Moved to higher energy group, supplemented" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
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

// ─── Mobility Scoring ──────────────────────────────────────────────────────────

interface MobilityScoring {
  id: number; herdId?: number | null; assessmentDate: string; assessedBy?: string | null;
  totalCowsScored: number; score0Count: number; score1Count: number; score2Count: number; score3Count: number;
  lamenessPrevalencePercent?: string | null; actionTaken?: string | null;
  nextAssessmentDue?: string | null; notes?: string | null;
  score3AnimalTags?: string | null; score2AnimalTags?: string | null;
}

export function MobilityTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { user: clerkUser } = useUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MobilityScoring | null>(null);
  const [viewRecord, setViewRecord] = useState<MobilityScoring | null>(null);
  const [form, setForm] = useState<Partial<MobilityScoring>>({});

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }); setOpen(false); setEditing(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/mobility-scorings/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mobility", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ assessmentDate: today(), score0Count: 0, score1Count: 0, score2Count: 0, score3Count: 0, assessedBy: myName }); setOpen(true); }
  function openEdit(r: MobilityScoring) { setEditing(r); setForm({ ...r, assessmentDate: r.assessmentDate.slice(0, 10), nextAssessmentDue: r.nextAssessmentDue?.slice(0, 10) }); setOpen(true); }
  function set(k: keyof MobilityScoring, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

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
        <td style="font-size:9px">${r.score3AnimalTags || "—"}</td>
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
                  {(r.score3AnimalTags || r.score2AnimalTags) && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {r.score3AnimalTags && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">Score 3 tags: {r.score3AnimalTags}</span>}
                      {r.score2AnimalTags && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Score 2 tags: {r.score2AnimalTags}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
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
                  <Input
                    list={staffListId}
                    value={form.assessedBy || ""}
                    onChange={e => set("assessedBy", e.target.value)}
                    placeholder="Select or type name…"
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

              {/* Score 3 animal tags — appears when any lame cows recorded */}
              {(form.score3Count || 0) > 0 && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <Label className="text-red-800 text-xs font-semibold uppercase tracking-wide">Score 3 — Lame Animal Ear Tags</Label>
                  <p className="text-xs text-red-600 mb-1.5">Record ear tag numbers of lame animals for vet identification. Separate multiple tags with commas.</p>
                  <Input
                    value={form.score3AnimalTags || ""}
                    onChange={e => set("score3AnimalTags", e.target.value)}
                    placeholder="e.g. UK123456 7893, UK123456 7901, UK123456 7915"
                    className="bg-white border-red-300"
                  />
                </div>
              )}

              {/* Score 2 animal tags — optional monitoring list */}
              {(form.score2Count || 0) > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                  <Label className="text-amber-800 text-xs font-semibold uppercase tracking-wide">Score 2 — Impaired Animal Ear Tags (optional)</Label>
                  <p className="text-xs text-amber-600 mb-1.5">Record ear tag numbers to monitor between assessments. Separate multiple tags with commas.</p>
                  <Input
                    value={form.score2AnimalTags || ""}
                    onChange={e => set("score2AnimalTags", e.target.value)}
                    placeholder="e.g. UK123456 7844, UK123456 7862"
                    className="bg-white border-amber-300"
                  />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form, totalCowsScored: total })} disabled={save.isPending || !form.assessmentDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ABR Test Kit Stock Section ───────────────────────────────────────────────

export function AbrKitStockSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AbrKitStock | null>(null);
  const [form, setForm] = useState<Partial<AbrKitStock>>({});
  const [panelOpen, setPanelOpen] = useState(false);

  const stockQ = useQuery<{ stock: AbrKitStock[] }>({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`), { credentials: "include" }).then(r => r.json()),
  });
  const stock = stockQ.data?.stock ?? [];
  const lowStock = stock.filter(s => s.quantityRemaining <= s.lowStockThreshold && s.quantityRemaining >= 0);

  const save = useMutation({
    mutationFn: (body: Partial<AbrKitStock>) => {
      const url = editingItem ? api(`farms/${farmId}/dairy/abr-test-kit-stock/${editingItem.id}`) : api(`farms/${farmId}/dairy/abr-test-kit-stock`);
      return fetch(url, { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }); setOpen(false); setEditingItem(null); setForm({}); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }),
  });

  function openAdd() { setEditingItem(null); setForm({ quantityPurchased: 0, quantityUsed: 0, lowStockThreshold: 5 }); setOpen(true); }
  function openEdit(s: AbrKitStock) { setEditingItem(s); setForm({ ...s }); setOpen(true); }
  function set(k: keyof AbrKitStock, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setPanelOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-gray-800">ABR Test Kit Stock ({stock.length} products)</span>
          {lowStock.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <AlertTriangle className="h-3 w-3" />{lowStock.length} low stock
            </span>
          )}
        </div>
        {panelOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
      </button>
      {panelOpen && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">Track antibiotic residue test kit batches, lot numbers, expiry dates, and remaining stock. When linked to a milk record, stock automatically decrements.</p>
          {stockQ.isLoading
            ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            : stock.length === 0
              ? <p className="text-sm text-gray-400 italic">No kit stock logged yet. Add your first kit batch below.</p>
              : stock.map(s => {
                const isLow = s.quantityRemaining <= s.lowStockThreshold;
                const isOut = s.quantityRemaining === 0;
                return (
                  <div key={s.id} className={`flex items-start justify-between rounded-md border px-3 py-2.5 ${isOut ? "bg-red-50 border-red-200" : isLow ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{s.productName}</span>
                        {s.supplier && <span className="text-xs text-gray-500">{s.supplier}</span>}
                        {isOut ? <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Out of stock</span>
                          : isLow ? <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Low stock</span>
                          : <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />In stock</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {s.lotNumber && <span>Lot: <span className="font-mono text-gray-700">{s.lotNumber}</span></span>}
                        {s.batchNumber && <span>Batch: <span className="font-mono text-gray-700">{s.batchNumber}</span></span>}
                        {s.expiryDate && <span>Expires: {formatDate(s.expiryDate)}</span>}
                        <span className="font-medium text-gray-700">{s.quantityRemaining} of {s.quantityPurchased} remaining</span>
                        <span>({s.quantityUsed} used)</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })
          }
          <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add Kit Batch</Button>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editingItem ? "Edit Kit Batch" : "Add ABR Test Kit Batch"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Product Name *</Label><Input placeholder="e.g. Delvotest Accelerator, BRT Tube Kit" value={form.productName || ""} onChange={e => set("productName", e.target.value)} /></div>
            <div><Label>Supplier</Label><Input placeholder="e.g. Neogen, Charm Sciences" value={form.supplier || ""} onChange={e => set("supplier", e.target.value)} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate || ""} onChange={e => set("expiryDate", e.target.value)} /></div>
            <div><Label>Lot Number</Label><Input placeholder="From kit box" value={form.lotNumber || ""} onChange={e => set("lotNumber", e.target.value)} /></div>
            <div><Label>Batch Number</Label><Input placeholder="From kit box" value={form.batchNumber || ""} onChange={e => set("batchNumber", e.target.value)} /></div>
            <div><Label>Qty Purchased</Label><Input type="number" min="0" value={form.quantityPurchased ?? ""} onChange={e => set("quantityPurchased", parseInt(e.target.value) || 0)} /></div>
            <div><Label>Qty Used (to date)</Label><Input type="number" min="0" value={form.quantityUsed ?? ""} onChange={e => set("quantityUsed", parseInt(e.target.value) || 0)} /></div>
            <div><Label>Low Stock Alert Threshold</Label><Input type="number" min="0" value={form.lowStockThreshold ?? 5} onChange={e => set("lowStockThreshold", parseInt(e.target.value) || 5)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.productName?.trim()}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingItem ? "Save Changes" : "Add Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Bulk Tank interfaces ─────────────────────────────────────────────────────

interface BulkTank {
  id: number; name: string; location?: string | null;
  capacityLitres?: string | null; notes?: string | null;
  latitudeDeg?: number | null; longitudeDeg?: number | null;
}

interface BulkTankRecord {
  id: number; tankId?: number | null; recordDate: string; recordType: string;
  tankTemperatureCelsius?: string | null; tankCleaned?: boolean;
  cleaningProductUsed?: string | null; cleaningProductBatch?: string | null;
  antibioticResidueTestRef?: string | null; antibioticResidueResult?: string | null;
  notes?: string | null;
}

interface MilkCollection {
  id: number; tankId?: number | null; collectionDate: string;
  volumeCollectedLitres?: string | null; milkBuyer?: string | null;
  tankerRegistration?: string | null; tankerDriverName?: string | null;
  collectionRef?: string | null; statementRef?: string | null;
  abtResultBeforeCollection?: string | null;
  pencePerLitre?: string | null; grossValuePence?: number | null;
  qualityBonusPence?: number | null; qualityPenaltyPence?: number | null;
  transportDeductionPence?: number | null; netPaymentPence?: number | null;
  notes?: string | null;
}

interface AbrKitStock {
  id: number; productName: string; supplier?: string | null;
  lotNumber?: string | null; batchNumber?: string | null;
  expiryDate?: string | null; quantityPurchased: number;
  quantityUsed: number; quantityRemaining: number;
  lowStockThreshold: number; notes?: string | null;
}

// ─── ABR badge helper ─────────────────────────────────────────────────────────
function AbrBadge({ result }: { result?: string | null }) {
  if (!result) return null;
  const ok = result === "negative";
  return (
    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      ABR: {result}
    </span>
  );
}

// ─── Temperature badge helper ─────────────────────────────────────────────────
function TempBadge({ v }: { v?: string | null }) {
  if (!v) return null;
  const n = parseFloat(v);
  const cls = n <= 4 ? "bg-green-100 text-green-700" : n <= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${cls}`}><Thermometer className="h-3 w-3" />{v}°C</span>;
}

// ─── BulkTankTab ──────────────────────────────────────────────────────────────

export function BulkTankTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();

  // ── Tank registry ──────────────────────────────────────────────────────────
  const [tanksOpen, setTanksOpen] = useState(true);
  const [tankDialog, setTankDialog] = useState(false);
  const [editingTank, setEditingTank] = useState<BulkTank | null>(null);
  const [tankForm, setTankForm] = useState<Partial<BulkTank>>({});
  const [qrTank, setQrTank] = useState<BulkTank | null>(null);

  const tanksQ = useQuery<{ tanks: BulkTank[] }>({
    queryKey: ["dairy-tanks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/tanks`), { credentials: "include" }).then(r => r.json()),
  });
  const tanks = tanksQ.data?.tanks ?? [];

  const saveTank = useMutation({
    mutationFn: (body: Partial<BulkTank>) => {
      const url = editingTank ? api(`farms/${farmId}/dairy/tanks/${editingTank.id}`) : api(`farms/${farmId}/dairy/tanks`);
      return fetch(url, { method: editingTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] }); setTankDialog(false); setEditingTank(null); setTankForm({}); },
  });
  const delTank = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/tanks/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] }),
  });

  function openAddTank() { setEditingTank(null); setTankForm({}); setTankDialog(true); }
  function openEditTank(t: BulkTank) { setEditingTank(t); setTankForm({ ...t }); setTankDialog(true); }

  // ── Monitoring records ─────────────────────────────────────────────────────
  const [monDialog, setMonDialog] = useState(false);
  const [editingMon, setEditingMon] = useState<BulkTankRecord | null>(null);
  const [viewMon, setViewMon] = useState<BulkTankRecord | null>(null);
  const [monForm, setMonForm] = useState<Partial<BulkTankRecord>>({});
  const [monYearFilter, setMonYearFilter] = useState("all");

  const monQ = useQuery<{ records: BulkTankRecord[] }>({
    queryKey: ["dairy-tank-records", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/bulk-tank-records`), { credentials: "include" }).then(r => r.json()),
  });

  const saveMon = useMutation({
    mutationFn: (body: Partial<BulkTankRecord>) => {
      const url = editingMon ? api(`farms/${farmId}/dairy/bulk-tank-records/${editingMon.id}`) : api(`farms/${farmId}/dairy/bulk-tank-records`);
      return fetch(url, { method: editingMon ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] }); setMonDialog(false); setEditingMon(null); setMonForm({}); },
  });
  const delMon = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/bulk-tank-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] }),
  });

  function openAddMon() { setEditingMon(null); setMonForm({ recordDate: today(), recordType: "daily-temperature" }); setMonDialog(true); }
  function openEditMon(r: BulkTankRecord) { setEditingMon(r); setMonForm({ ...r, recordDate: r.recordDate.slice(0, 10) }); setMonDialog(true); }
  function setMon(k: keyof BulkTankRecord, v: unknown) { setMonForm(f => ({ ...f, [k]: v })); }

  // ── Milk collections (read-only for summary/report) ───────────────────────

  const collQ = useQuery<{ collections: MilkCollection[] }>({
    queryKey: ["dairy-milk-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-collections`), { credentials: "include" }).then(r => r.json()),
  });

  const tankName = (id?: number | null) => tanks.find(t => t.id === id)?.name ?? null;

  const allMonRecords = monQ.data?.records ?? [];
  const monYears = React.useMemo(() => {
    const s = new Set(allMonRecords.map(r => r.recordDate.slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allMonRecords]);
  const monRecords = React.useMemo(
    () => monYearFilter === "all" ? allMonRecords : allMonRecords.filter(r => r.recordDate.startsWith(monYearFilter)),
    [allMonRecords, monYearFilter],
  );
  const collRecords = collQ.data?.collections ?? [];

  const tankComplianceSummary = React.useMemo(() => {
    const tempRecords = monRecords.filter(r => r.recordType === "daily-temperature" && r.tankTemperatureCelsius != null);
    const tempInRange = tempRecords.filter(r => Number(r.tankTemperatureCelsius!) <= 4).length;
    const cleaningCount = monRecords.filter(r => r.tankCleaned).length;
    const abrTests = monRecords.filter(r => r.antibioticResidueResult);
    const abrPositive = abrTests.filter(r => r.antibioticResidueResult === "positive").length;
    const abrNegative = abrTests.filter(r => r.antibioticResidueResult === "negative").length;
    const totalCollVol = collRecords.reduce((s, c) => s + (c.volumeCollectedLitres ? parseFloat(String(c.volumeCollectedLitres)) : 0), 0);
    return { tempTotal: tempRecords.length, tempInRange, cleaningCount, abrTests: abrTests.length, abrPositive, abrNegative, totalCollVol: Math.round(totalCollVol) };
  }, [monRecords, collRecords]);

  function generateTankReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const s = tankComplianceSummary;
    const tempPct = s.tempTotal > 0 ? Math.round((s.tempInRange / s.tempTotal) * 100) : null;
    const monRows = [...monRecords].sort((a, b) => b.recordDate.localeCompare(a.recordDate)).map(r => `<tr>
      <td>${new Date(r.recordDate).toLocaleDateString("en-GB")}</td>
      <td>${tanks.find(t => t.id === r.tankId)?.name ?? "—"}</td>
      <td>${r.recordType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</td>
      <td>${r.tankTemperatureCelsius != null ? `${r.tankTemperatureCelsius}°C${Number(r.tankTemperatureCelsius) <= 4 ? "" : " ⚠"}` : "—"}</td>
      <td>${r.tankCleaned ? "Yes" : "No"}</td>
      <td>${r.cleaningProductUsed || "—"}</td>
      <td>${r.antibioticResidueResult ? (r.antibioticResidueResult === "positive" ? "<b style='color:#b91c1c'>POSITIVE ⚠</b>" : "Negative") : "—"}</td>
      <td style="font-size:9px">${r.notes || "—"}</td>
    </tr>`).join("");
    const collRows = [...collRecords].sort((a, b) => b.collectionDate.localeCompare(a.collectionDate)).map(c => `<tr>
      <td>${new Date(c.collectionDate).toLocaleDateString("en-GB")}</td>
      <td>${tanks.find(t => t.id === c.tankId)?.name ?? "—"}</td>
      <td>${c.volumeCollectedLitres ? `${Number(c.volumeCollectedLitres).toLocaleString()} L` : "—"}</td>
      <td>${c.milkBuyer || "—"}</td>
      <td>${c.collectionRef || "—"}</td>
      <td>${c.abtResultBeforeCollection ? (c.abtResultBeforeCollection === "positive" ? "<b style='color:#b91c1c'>POSITIVE ⚠</b>" : "Negative") : "—"}</td>
      <td>${c.pencePerLitre ? `${parseFloat(c.pencePerLitre).toFixed(2)}ppl` : "—"}</td>
      <td>${c.netPaymentPence != null ? `£${(c.netPaymentPence / 100).toFixed(2)}` : "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Bulk Tank — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:18px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Bulk Tank — Monitoring &amp; Compliance Report</h1><h2>Red Tractor Dairy Scheme</h2></div>
  <div class="hdr-r">${tanks.length} tank${tanks.length !== 1 ? "s" : ""} registered<br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${tempPct != null ? `${tempPct}%` : "—"}</div><div class="kpi-lbl">Temp ≤4°C compliance (${s.tempInRange}/${s.tempTotal} checks)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.cleaningCount}</div><div class="kpi-lbl">Cleaning records</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.abrPositive > 0 ? `<span style="color:#b91c1c">${s.abrPositive} POSITIVE</span>` : s.abrNegative}</div><div class="kpi-lbl">ABR tests (tank monitoring)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.totalCollVol.toLocaleString()} L</div><div class="kpi-lbl">Total milk collected</div></div>
</div>
${monRows ? `<h3>Tank Monitoring Records</h3><table><tr><th>Date</th><th>Tank</th><th>Type</th><th>Temperature</th><th>Cleaned</th><th>Product</th><th>ABR Result</th><th>Notes</th></tr>${monRows}</table>` : ""}
${collRows ? `<h3>Milk Collections</h3><table><tr><th>Date</th><th>Tank</th><th>Volume</th><th>Buyer</th><th>Ref</th><th>ABR (pre-collection)</th><th>ppl</th><th>Net payment</th></tr>${collRows}</table>` : ""}
<p class="note">Bulk tank compliance report produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires daily temperature records, regular cleaning logs, and pre-collection ABR testing. Retain for a minimum of 3 years and present at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-6">

      {/* ── Compliance Summary ───────────────────────────────────────────────── */}
      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="font-semibold text-sm text-gray-800">Compliance Summary</span>
          <Button variant="outline" size="sm" onClick={generateTankReport} disabled={monRecords.length === 0 && collRecords.length === 0}>
            <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100">
          <div className="px-4 py-3 text-center">
            <p className="text-xl font-bold text-gray-800">
              {tankComplianceSummary.tempTotal > 0 ? `${Math.round((tankComplianceSummary.tempInRange / tankComplianceSummary.tempTotal) * 100)}%` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Temp ≤4°C compliance</p>
            <p className="text-xs text-gray-400">{tankComplianceSummary.tempInRange}/{tankComplianceSummary.tempTotal} checks</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xl font-bold text-gray-800">{tankComplianceSummary.cleaningCount || "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Cleaning records</p>
          </div>
          <div className="px-4 py-3 text-center">
            {tankComplianceSummary.abrPositive > 0 ? (
              <p className="text-xl font-bold text-red-700">{tankComplianceSummary.abrPositive} positive</p>
            ) : (
              <p className="text-xl font-bold text-gray-800">{tankComplianceSummary.abrNegative || "—"}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">ABR tests</p>
            {tankComplianceSummary.abrPositive > 0 && (
              <p className="text-xs text-red-600 font-medium">Action required</p>
            )}
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xl font-bold text-blue-700">{tankComplianceSummary.totalCollVol > 0 ? `${tankComplianceSummary.totalCollVol.toLocaleString()} L` : "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total milk collected</p>
            <p className="text-xs text-gray-400">{collRecords.length} collection{collRecords.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* ── Section 1: Tank Registry ────────────────────────────────────────── */}
      <div className="border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          onClick={() => setTanksOpen(o => !o)}
        >
          <span className="font-semibold text-sm text-gray-800">Registered Bulk Tanks ({tanks.length})</span>
          {tanksOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
        </button>
        {tanksOpen && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500">Register each bulk tank on the holding. Once registered, select the tank when logging monitoring records or milk collections.</p>
            {tanksQ.isLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              : tanks.length === 0
                ? <p className="text-sm text-gray-400 italic">No tanks registered yet. Add your first tank below.</p>
                : tanks.map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-white border rounded px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="font-medium text-sm">{t.name}</span>
                      {t.location && <span className="text-xs text-gray-500">· {t.location}</span>}
                      {t.capacityLitres && <span className="text-xs text-gray-400">· {Number(t.capacityLitres).toLocaleString()} L</span>}
                      {t.latitudeDeg != null && t.longitudeDeg != null && (
                        <a
                          href={`https://maps.google.com/?q=${t.latitudeDeg},${t.longitudeDeg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline"
                          title="View on Google Maps"
                        >
                          <MapPin className="h-3 w-3" />GPS
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View QR code" onClick={() => setQrTank(t)}><QrCode className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditTank(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => delTank.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))
            }
            <Button size="sm" variant="outline" onClick={openAddTank}><Plus className="h-3.5 w-3.5 mr-1" />Add Tank</Button>
          </div>
        )}
      </div>

      {/* ── Section 2: Tank Monitoring Records ─────────────────────────────── */}
      <div>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-sm text-gray-800">Tank Monitoring Records</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daily temperature checks, cleaning, antibiotic residue tests, and maintenance logs.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={monYearFilter} onValueChange={setMonYearFilter}>
              <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {monYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={openAddMon} disabled={tanksQ.isLoading || tanks.length === 0}>
              <Plus className="h-4 w-4 mr-1" />Add Record
            </Button>
          </div>
        </div>
        {!tanksQ.isLoading && tanks.length === 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">No tanks registered.</span> You must register at least one bulk tank before adding monitoring records.
              Use the <span className="font-semibold">Registered Bulk Tanks</span> section above to add your first tank.
            </p>
          </div>
        )}
        {monQ.isLoading
          ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          : !monRecords.length
            ? <Card><CardContent className="py-8 text-center text-gray-400 text-sm">{allMonRecords.length ? "No records for selected year." : "No monitoring records yet."}</CardContent></Card>
            : <div className="space-y-2">
              {monRecords.map(r => (
                <Card key={r.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{formatDate(r.recordDate)}</span>
                        {r.tankId && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tankName(r.tankId)}</span>}
                        <span className="text-xs text-gray-500 capitalize">{r.recordType.replace(/-/g, " ")}</span>
                        <TempBadge v={r.tankTemperatureCelsius} />
                        {r.tankCleaned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Cleaned</span>}
                        {r.cleaningProductUsed && <span className="text-xs text-gray-400">{r.cleaningProductUsed}</span>}
                        <AbrBadge result={r.antibioticResidueResult} />
                        <DocAttach farmId={farmId} endpoint="dairy/bulk-tank-records" recordId={r.id} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["dairy-tank-records", farmId]} compact />
                      </div>
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMon(r)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMon(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => delMon.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
        }
      </div>

      {/* ── Tank Registry Dialog ─────────────────────────────────────────────── */}
      <Dialog open={tankDialog} onOpenChange={setTankDialog}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editingTank ? "Edit Tank" : "Add Bulk Tank"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Tank Name / Designation *</Label>
              <Input placeholder="e.g. Tank 1, Main Tank, Overflow Tank" value={tankForm.name || ""} onChange={e => setTankForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Location on Holding</Label>
              <Input placeholder="e.g. Main Dairy, North Unit" value={tankForm.location || ""} onChange={e => setTankForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <Label>Capacity (litres)</Label>
              <Input type="number" placeholder="e.g. 12000" value={tankForm.capacityLitres || ""} onChange={e => setTankForm(f => ({ ...f, capacityLitres: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-blue-500" />GPS Location (optional)</Label>
              <p className="text-xs text-gray-500 mb-1.5">Set coordinates so the tank appears on the farm map. Use the mobile app to capture GPS automatically, or enter manually below.</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-normal text-gray-500">Latitude</Label>
                  <Input type="number" step="0.000001" placeholder="e.g. 51.507351" value={tankForm.latitudeDeg ?? ""} onChange={e => setTankForm(f => ({ ...f, latitudeDeg: e.target.value ? parseFloat(e.target.value) : null }))} />
                </div>
                <div>
                  <Label className="text-xs font-normal text-gray-500">Longitude</Label>
                  <Input type="number" step="0.000001" placeholder="e.g. -0.127758" value={tankForm.longitudeDeg ?? ""} onChange={e => setTankForm(f => ({ ...f, longitudeDeg: e.target.value ? parseFloat(e.target.value) : null }))} />
                </div>
              </div>
              {tankForm.latitudeDeg != null && tankForm.longitudeDeg != null && (
                <a href={`https://maps.google.com/?q=${tankForm.latitudeDeg},${tankForm.longitudeDeg}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Preview on Google Maps →</a>
              )}
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={tankForm.notes || ""} onChange={e => setTankForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTankDialog(false)}>Cancel</Button>
            <Button onClick={() => saveTank.mutate(tankForm)} disabled={saveTank.isPending || !tankForm.name?.trim()}>
              {saveTank.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingTank ? "Save Changes" : "Add Tank"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── QR Code Dialog ────────────────────────────────────────────────────── */}
      {qrTank && (() => {
        const qrValue = `BDE:F${farmId}:TNK-${qrTank.id}`;
        function downloadQr() {
          const svg = document.getElementById(`tank-qr-${qrTank!.id}`);
          if (!svg) return;
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement("canvas");
          canvas.width = 400; canvas.height = 480;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 400, 480);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 50, 40, 300, 300);
            ctx.fillStyle = "#111827";
            ctx.font = "bold 18px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(qrTank!.name, 200, 380);
            ctx.font = "14px sans-serif";
            ctx.fillStyle = "#6b7280";
            ctx.fillText("BDE Farm Trac · Bulk Tank", 200, 406);
            ctx.fillText(`TNK-${qrTank!.id}`, 200, 430);
            const link = document.createElement("a");
            link.download = `tank-qr-${qrTank!.name.replace(/\s+/g, "-")}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
          };
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        }
        return (
          <Dialog open onOpenChange={() => setQrTank(null)}>
            <DialogContent style={{ maxWidth: "24rem" }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><QrCode className="h-4 w-4" />QR Label — {qrTank.name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <QRCodeSVG id={`tank-qr-${qrTank.id}`} value={qrValue} size={220} level="H" includeMargin={false} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-800">{qrTank.name}</p>
                  <p className="text-xs text-gray-500">BDE Farm Trac · Bulk Tank</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">TNK-{qrTank.id}</p>
                </div>
                <p className="text-xs text-gray-500 text-center">Scan with the BDE Farm Trac mobile app to log monitoring records, cleaning events, or view tank details without manual selection.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setQrTank(null)}>Close</Button>
                <Button onClick={downloadQr}><Download className="h-4 w-4 mr-1.5" />Download PNG</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── Monitoring Record View Dialog ────────────────────────────────────── */}
      {viewMon && (
        <Dialog open onOpenChange={() => setViewMon(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>View Monitoring Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{formatDate(viewMon.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tank</p><p className="font-medium">{tankName(viewMon.tankId) ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Record Type</p><p className="font-medium capitalize">{viewMon.recordType.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Temperature (°C)</p><p className="font-medium">{viewMon.tankTemperatureCelsius ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tank Cleaned</p><p className="font-medium">{viewMon.tankCleaned ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleaning Product</p><p className="font-medium">{viewMon.cleaningProductUsed ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleaning Batch</p><p className="font-medium">{viewMon.cleaningProductBatch ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Result</p><p className="font-medium capitalize">{viewMon.antibioticResidueResult ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Test Ref</p><p className="font-medium">{viewMon.antibioticResidueTestRef ?? "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewMon.notes ?? "—"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEditMon(viewMon); setViewMon(null); }}>Edit</Button>
              <Button onClick={() => setViewMon(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Monitoring Record Add/Edit Dialog ────────────────────────────────── */}
      <Dialog open={monDialog} onOpenChange={setMonDialog}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editingMon ? "Edit Monitoring Record" : "Add Monitoring Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Date *</Label><Input type="date" value={monForm.recordDate?.slice(0, 10) || ""} onChange={e => setMon("recordDate", e.target.value)} /></div>
            <div>
              <Label>Tank</Label>
              <Select value={monForm.tankId ? String(monForm.tankId) : "__none__"} onValueChange={v => setMon("tankId", v !== "__none__" ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not specified</SelectItem>
                  {tanks.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}{t.location ? ` — ${t.location}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Record Type *</Label>
              <Select value={monForm.recordType || "daily-temperature"} onValueChange={v => setMon("recordType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily-temperature">Daily Temperature Check</SelectItem>
                  <SelectItem value="cleaning">Tank Cleaning</SelectItem>
                  <SelectItem value="antibiotic-residue-test">Antibiotic Residue Test</SelectItem>
                  <SelectItem value="maintenance">Tank Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tank Temperature (°C)</Label><Input type="number" step="0.1" value={monForm.tankTemperatureCelsius || ""} onChange={e => setMon("tankTemperatureCelsius", e.target.value)} placeholder="Target ≤4°C" /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="tc" checked={!!monForm.tankCleaned} onChange={e => setMon("tankCleaned", e.target.checked)} className="rounded" />
              <Label htmlFor="tc">Tank cleaned and sanitised</Label>
            </div>
            {monForm.tankCleaned && <>
              <div><Label>Cleaning Product</Label><Input value={monForm.cleaningProductUsed || ""} onChange={e => setMon("cleaningProductUsed", e.target.value)} /></div>
              <div><Label>Product Batch Number</Label><Input value={monForm.cleaningProductBatch || ""} onChange={e => setMon("cleaningProductBatch", e.target.value)} /></div>
            </>}
            <div>
              <Label>Antibiotic Residue Result</Label>
              <Select value={monForm.antibioticResidueResult || ""} onValueChange={v => setMon("antibioticResidueResult", v)}>
                <SelectTrigger><SelectValue placeholder="Not tested" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="borderline">Borderline</SelectItem>
                  <SelectItem value="invalid">Invalid (test void)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>ABR Test Reference</Label><Input value={monForm.antibioticResidueTestRef || ""} onChange={e => setMon("antibioticResidueTestRef", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={monForm.notes || ""} onChange={e => setMon("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMonDialog(false)}>Cancel</Button>
            <Button onClick={() => saveMon.mutate(monForm)} disabled={saveMon.isPending || !monForm.recordDate}>
              {saveMon.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingMon ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Section 4: ABR Test Kit Stock ───────────────────────────────────── */}
      <AbrKitStockSection farmId={farmId} />
      <AbrProcurementSection farmId={farmId} />

    </div>
  );
}

// ─── Dry Cow Therapy ───────────────────────────────────────────────────────────

// Typical withdrawal days for known intramammary DCT products (post-calving milk / meat from administration)
const DCT_WITHDRAWAL: Record<string, { milkDays: number; meatDays: number }> = {
  "Orbenin Extra Dry Cow": { milkDays: 7, meatDays: 28 },
  "Orbenin Quick Release": { milkDays: 4, meatDays: 10 },
  "Bovaclox DC Extra": { milkDays: 7, meatDays: 28 },
  "Bovaclox Milking": { milkDays: 4, meatDays: 14 },
  "Tetra-Delta": { milkDays: 7, meatDays: 60 },
  "Pirsue 5 mg/ml": { milkDays: 7, meatDays: 30 },
  "Mastiplan LC": { milkDays: 7, meatDays: 28 },
  "Kloxerate Plus": { milkDays: 7, meatDays: 28 },
  "Ubrolexin": { milkDays: 5, meatDays: 21 },
};

const INTRAMAMMARY_ANTIBIOTICS = VMD_MEDICINES.filter(
  m => m.category === "Intramammary" &&
    !m.name.toLowerCase().includes("sealant") &&
    !m.activeIngredient.toLowerCase().includes("bismuth")
);

const INTRAMAMMARY_SEALANTS = VMD_MEDICINES.filter(
  m => m.category === "Intramammary" && (
    m.name.toLowerCase().includes("sealant") ||
    m.activeIngredient.toLowerCase().includes("bismuth")
  )
);

interface DctRecord {
  id: number; herdId?: number | null; animalId?: number | null; cowEarTag?: string | null;
  dryOffDate: string; protocol: string; antibioticTubeProduct?: string | null;
  antibioticTubeBatch?: string | null; antibioticTubeWithdrawalMilkDays?: number | null;
  antibioticTubeWithdrawalMeatDays?: number | null; teatSealantProduct?: string | null;
  teatSealantBatch?: string | null; treatmentJustification?: string | null;
  sccAtDryOff?: number | null; mastitisEpisodes12Months?: number | null;
  administeredBy?: string | null; vetAuthorisation?: boolean; vetName?: string | null;
  expectedCalvingDate?: string | null; estimatedPrescriptionFee?: number | string | null; notes?: string | null;
}

interface FarmAnimal { id: number; earTagNumber?: string | null; tagNumber?: string | null; herdId?: number | null; breed?: string | null; species?: string | null; }

// ── Small reusable inline combobox for product name lookup ──────────────────
function ProductCombobox({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  options: { name: string; activeIngredient: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length >= 1
    ? options.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.activeIngredient.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : options.slice(0, 10);

  function select(name: string) { onChange(name); setQuery(""); setOpen(false); }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={open ? query : (value || "")}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => { setOpen(true); setQuery(""); }}
        className="pr-7"
        autoComplete="off"
      />
      <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No products match — type to enter custom name</div>
          )}
          {filtered.map(o => (
            <button key={o.name} type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-start justify-between gap-2 ${value === o.name ? "bg-primary/10" : ""}`}
              onMouseDown={e => { e.preventDefault(); select(o.name); }}
            >
              <div>
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-gray-400">{o.activeIngredient}</div>
              </div>
              {value === o.name && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Generic name combobox (vet names, staff names) ──────────────────────────
function NameCombobox({
  value, onChange, names, placeholder, allowFreeType = true,
}: {
  value: string; onChange: (v: string) => void;
  names: string[]; placeholder: string; allowFreeType?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length >= 1
    ? names.filter(n => n.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : names.slice(0, 12);

  function select(name: string) { onChange(name); setQuery(""); setOpen(false); }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={open ? query : (value || "")}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); if (allowFreeType) onChange(e.target.value); }}
        onFocus={() => { setOpen(true); setQuery(""); }}
        className="pr-7"
        autoComplete="off"
      />
      <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 && names.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No previous records — type name above</div>
          )}
          {filtered.length === 0 && names.length > 0 && query.length >= 1 && (
            <div className="px-3 py-2 text-xs text-gray-400">No match — will use "{query}"</div>
          )}
          {filtered.map(n => (
            <button key={n} type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-center justify-between ${value === n ? "bg-primary/10" : ""}`}
              onMouseDown={e => { e.preventDefault(); select(n); }}
            >
              <span>{n}</span>
              {value === n && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Animal ear tag combobox ─────────────────────────────────────────────────
function AnimalEarTagCombobox({
  value, onSelect, animals,
}: {
  value: string; onSelect: (tag: string, animal: FarmAnimal | null) => void;
  animals: FarmAnimal[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length >= 1
    ? animals.filter(a => {
        const tag = (a.earTagNumber || a.tagNumber || "").toLowerCase();
        return tag.includes(query.toLowerCase());
      }).slice(0, 12)
    : animals.slice(0, 12);

  function select(a: FarmAnimal) {
    const tag = a.earTagNumber || a.tagNumber || "";
    onSelect(tag, a);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={open ? query : (value || "")}
        placeholder="e.g. UK123456 78901"
        onChange={e => { setQuery(e.target.value); setOpen(true); onSelect(e.target.value, null); }}
        onFocus={() => { setOpen(true); setQuery(value || ""); }}
        className="pr-7"
        autoComplete="off"
      />
      <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {animals.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No animals in register — enter tag manually</div>
          )}
          {filtered.length === 0 && query.length >= 1 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No match — enter "{query}" manually</div>
          )}
          {filtered.map(a => {
            const tag = a.earTagNumber || a.tagNumber || "—";
            return (
              <button key={a.id} type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-center justify-between gap-2 ${value === tag ? "bg-primary/10" : ""}`}
                onMouseDown={e => { e.preventDefault(); select(a); }}
              >
                <div>
                  <div className="font-mono font-medium">{tag}</div>
                  {a.breed && <div className="text-xs text-gray-400">{a.breed}</div>}
                </div>
                {value === tag && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DctTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DctRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<DctRecord | null>(null);
  const [form, setForm] = useState<Partial<DctRecord>>({});
  const [hint, setHint] = useState<{ mastitisCount12m: number; recentMastitisScc: number | null } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const { data, isLoading } = useQuery<{ records: DctRecord[] }>({
    queryKey: ["dairy-dct", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/dct-records`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: animalsData } = useQuery<{ records: FarmAnimal[] }>({
    queryKey: ["farm-animals-dct", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });
  const animals = (animalsData?.records ?? []).filter(a => {
    const sp = (a.species || "").toLowerCase();
    return !sp || sp.includes("bovine") || sp.includes("cattle") || sp.includes("cow") || sp.includes("dairy");
  });

  const { data: vetNamesData } = useQuery<{ names: string[] }>({
    queryKey: ["dct-vet-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/dct-vet-names`), { credentials: "include" }).then(r => r.json()),
    staleTime: 120000,
  });
  const vetNames = vetNamesData?.names ?? [];

  const { data: staffNamesData } = useQuery<{ names: string[] }>({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then(r => r.json()),
    staleTime: 120000,
  });
  const staffNames = staffNamesData?.names ?? [];

  const { data: attachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const dctAttachMap = Object.fromEntries(attachCountsRaw.filter(c => c.recordType === "dct").map(c => [c.recordId, c.count]));

  const save = useMutation({
    mutationFn: async (body: Partial<DctRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/dct-records/${editing.id}`) : api(`farms/${farmId}/dairy/dct-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }); setOpen(false); setEditing(null); setForm({}); setHint(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/dct-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ dryOffDate: today(), protocol: "selective" }); setHint(null); setOpen(true); }
  function openEdit(r: DctRecord) { setEditing(r); setForm({ ...r, dryOffDate: r.dryOffDate.slice(0, 10), expectedCalvingDate: r.expectedCalvingDate?.slice(0, 10) }); setHint(null); setOpen(true); }
  function set(k: keyof DctRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const fetchHint = useCallback(async (earTag: string) => {
    if (!earTag.trim()) { setHint(null); return; }
    setHintLoading(true);
    try {
      const res = await fetch(api(`farms/${farmId}/dairy/dct-animal-hint?earTag=${encodeURIComponent(earTag)}`), { credentials: "include" });
      const data = await res.json();
      setHint({ mastitisCount12m: data.mastitisCount12m ?? 0, recentMastitisScc: data.recentMastitisScc ?? null });
    } catch { setHint(null); }
    setHintLoading(false);
  }, [farmId]);

  function handleAnimalSelect(tag: string, animal: FarmAnimal | null) {
    setForm(f => ({ ...f, cowEarTag: tag, animalId: animal?.id ?? null, herdId: animal?.herdId ?? f.herdId }));
    if (tag.trim().length >= 5) fetchHint(tag);
    else setHint(null);
  }

  function applyHint() {
    if (!hint) return;
    setForm(f => ({
      ...f,
      mastitisEpisodes12Months: hint.mastitisCount12m,
      ...(hint.recentMastitisScc && !f.sccAtDryOff ? { sccAtDryOff: hint.recentMastitisScc } : {}),
    }));
  }

  function handleAntibioticProduct(name: string) {
    set("antibioticTubeProduct", name);
    const wd = DCT_WITHDRAWAL[name];
    if (wd) {
      setForm(f => ({ ...f, antibioticTubeProduct: name, antibioticTubeWithdrawalMilkDays: wd.milkDays, antibioticTubeWithdrawalMeatDays: wd.meatDays }));
    }
  }

  const PROTOCOLS = [
    { value: "selective", label: "Selective DCT (antibiotic only where indicated)" },
    { value: "blanket", label: "Blanket DCT (all cows treated)" },
    { value: "teat-sealant-only", label: "Teat Sealant Only (no antibiotic)" },
    { value: "selective-sealant", label: "Selective DCT + Teat Sealant" },
    { value: "blanket-sealant", label: "Blanket DCT + Teat Sealant" },
  ];

  const needsVetAuth = form.protocol !== "teat-sealant-only";
  const canSave = !!form.dryOffDate && (!needsVetAuth || !!form.vetAuthorisation);

  const hasHintData = hint && (hint.mastitisCount12m > 0 || hint.recentMastitisScc);

  const [dctYear, setDctYear] = useState<number>(new Date().getFullYear());
  const allDctRecords = data?.records ?? [];
  const dctYearRecords = allDctRecords.filter(r => r.dryOffDate && new Date(r.dryOffDate).getFullYear() === dctYear);

  const dctStats = React.useMemo(() => {
    const recs = dctYearRecords;
    const total = recs.length;
    const selective = recs.filter(r => r.protocol === "selective" || r.protocol === "selective-sealant").length;
    const blanket = recs.filter(r => r.protocol === "blanket" || r.protocol === "blanket-sealant").length;
    const sealantOnly = recs.filter(r => r.protocol === "teat-sealant-only").length;
    const vetAuthorised = recs.filter(r => r.vetAuthorisation).length;
    const sccValues = recs.filter(r => r.sccAtDryOff != null).map(r => r.sccAtDryOff!);
    const avgScc = sccValues.length > 0 ? Math.round(sccValues.reduce((a, b) => a + b, 0) / sccValues.length) : null;
    const productCounts: Record<string, number> = {};
    recs.forEach(r => { if (r.antibioticTubeProduct) productCounts[r.antibioticTubeProduct] = (productCounts[r.antibioticTubeProduct] || 0) + 1; });
    const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, selective, blanket, sealantOnly, vetAuthorised, avgScc, topProducts };
  }, [dctYearRecords]);

  function generateDctReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const s = dctStats;
    const recs = [...dctYearRecords].sort((a, b) => b.dryOffDate.localeCompare(a.dryOffDate));
    const productRows = s.topProducts.map(([p, c]) => `<tr><td>${p}</td><td>${c}</td><td>${s.total > 0 ? Math.round((c / s.total) * 100) : 0}%</td></tr>`).join("");
    const rows = recs.map(r => `<tr>
      <td>${new Date(r.dryOffDate).toLocaleDateString("en-GB")}</td>
      <td>${r.cowEarTag || "—"}</td>
      <td>${r.protocol.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</td>
      <td>${r.antibioticTubeProduct || "—"}</td>
      <td>${r.teatSealantProduct || "—"}</td>
      <td>${r.sccAtDryOff?.toLocaleString() ?? "—"}</td>
      <td>${r.mastitisEpisodes12Months ?? "—"}</td>
      <td>${r.vetAuthorisation ? "Yes" : "<b style='color:#b91c1c'>No</b>"}</td>
      <td>${r.vetName || "—"}</td>
      <td style="font-size:9px">${r.treatmentJustification || "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>DCT Stewardship Report ${dctYear}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:18px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Dry Cow Therapy (DCT) — Antibiotic Stewardship Report</h1><h2>Red Tractor Dairy Scheme — Reporting Year: ${dctYear}</h2></div>
  <div class="hdr-r"><b>${s.total} dry-off record${s.total !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${s.total}</div><div class="kpi-lbl">Total dry-offs recorded</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.total > 0 ? Math.round((s.selective / s.total) * 100) : 0}%</div><div class="kpi-lbl">Selective DCT (${s.selective} cows)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.total > 0 ? Math.round((s.vetAuthorised / s.total) * 100) : 0}%</div><div class="kpi-lbl">Vet-authorised (${s.vetAuthorised}/${s.total})</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.avgScc != null ? s.avgScc.toLocaleString() + " k/mL" : "—"}</div><div class="kpi-lbl">Avg SCC at dry-off</div></div>
</div>
<p style="font-size:10px;margin-bottom:8px"><b>Protocol breakdown:</b> Selective DCT: ${s.selective} &nbsp;|&nbsp; Blanket DCT: ${s.blanket} &nbsp;|&nbsp; Teat sealant only: ${s.sealantOnly}</p>
${productRows ? `<h3>Antibiotic Products Used</h3><table><tr><th>Product</th><th>Cows treated</th><th>% of total</th></tr>${productRows}</table>` : ""}
<h3>All DCT Records — ${dctYear}</h3>
<table>
  <tr><th>Dry-off date</th><th>Ear Tag</th><th>Protocol</th><th>Antibiotic product</th><th>Sealant</th><th>SCC at dry-off</th><th>Mastitis eps 12m</th><th>Vet auth.</th><th>Vet</th><th>Justification</th></tr>
  ${rows || "<tr><td colspan='10'>No records for this year</td></tr>"}
</table>
<p class="note">DCT Antibiotic Stewardship Report produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). This report should be reviewed annually with your prescribing vet as part of your Veterinary Health Plan. Retain for a minimum of 5 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Dry Cow Therapy (DCT) — record treatment decisions at dry-off. Antibiotic stewardship requires documented justification for each cow treated.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={generateDctReport} disabled={dctYearRecords.length === 0}>
            <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
          </Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add DCT Record</Button>
        </div>
      </div>

      {/* ── Annual Stewardship Summary ── */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Annual Stewardship Summary</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setDctYear(y => y - 1)} className="h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <span className="text-sm font-semibold text-gray-800 w-12 text-center">{dctYear}</span>
              <button onClick={() => setDctYear(y => y + 1)} disabled={dctYear >= new Date().getFullYear()} className="h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {dctYearRecords.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">No DCT records for {dctYear}.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-white px-3 py-2.5 text-center">
                <p className="text-2xl font-bold text-gray-800">{dctStats.total}</p>
                <p className="text-xs text-gray-500 mt-0.5">Dry-offs recorded</p>
              </div>
              <div className={`rounded-lg border px-3 py-2.5 text-center ${dctStats.total > 0 && Math.round((dctStats.selective / dctStats.total) * 100) >= 50 ? "bg-green-50 border-green-200" : "bg-white"}`}>
                <p className={`text-2xl font-bold ${dctStats.total > 0 && Math.round((dctStats.selective / dctStats.total) * 100) >= 50 ? "text-green-700" : "text-gray-800"}`}>
                  {dctStats.total > 0 ? `${Math.round((dctStats.selective / dctStats.total) * 100)}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Selective DCT</p>
              </div>
              <div className={`rounded-lg border px-3 py-2.5 text-center ${dctStats.vetAuthorised < dctStats.total ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                <p className={`text-2xl font-bold ${dctStats.vetAuthorised < dctStats.total ? "text-amber-700" : "text-green-700"}`}>
                  {dctStats.total > 0 ? `${Math.round((dctStats.vetAuthorised / dctStats.total) * 100)}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Vet-authorised</p>
              </div>
              <div className="rounded-lg border bg-white px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-gray-800">{dctStats.avgScc != null ? dctStats.avgScc.toLocaleString() : "—"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg SCC at dry-off (k/mL)</p>
              </div>
            </div>
          )}
          {dctStats.topProducts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Antibiotic products used in {dctYear}</p>
              <div className="flex flex-wrap gap-2">
                {dctStats.topProducts.map(([p, c]) => (
                  <span key={p} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded">
                    {p} <span className="font-semibold">×{c}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View DCT Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dry-Off Date</p><p className="font-medium">{formatDate(viewRecord.dryOffDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cow Ear Tag</p><p className="font-medium">{String(viewRecord.cowEarTag ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protocol</p><p className="font-medium capitalize">{String(viewRecord.protocol ?? "—").replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Antibiotic Product</p><p className="font-medium">{String(viewRecord.antibioticTubeProduct || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Teat Sealant</p><p className="font-medium">{String(viewRecord.teatSealantProduct ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Dry-Off</p><p className="font-medium">{viewRecord.sccAtDryOff?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mastitis Eps (12m)</p><p className="font-medium">{String(viewRecord.mastitisEpisodes12Months ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Authorisation</p><p className="font-medium">{viewRecord.vetAuthorisation ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Calving</p><p className="font-medium">{formatDate(viewRecord.expectedCalvingDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Justification</p><p className="font-medium">{String(viewRecord.treatmentJustification ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="dct" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!data?.records?.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No DCT records yet. Record dry-off treatments for each cow at the end of lactation.</CardContent></Card>}
          {data?.records?.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.dryOffDate)}</span>
                    {r.cowEarTag && <span className="text-sm text-gray-700 font-mono">{r.cowEarTag}</span>}
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded capitalize">{r.protocol.replace(/-/g, " ")}</span>
                    {r.antibioticTubeProduct && <span className="text-xs text-gray-500">{r.antibioticTubeProduct}</span>}
                    {r.teatSealantProduct && <span className="text-xs text-gray-500">Sealant: {r.teatSealantProduct}</span>}
                    {r.sccAtDryOff && <SccBadge v={r.sccAtDryOff} />}
                    {r.mastitisEpisodes12Months !== null && r.mastitisEpisodes12Months !== undefined && <span className="text-xs text-gray-500">{r.mastitisEpisodes12Months} mastitis episodes (12m)</span>}
                    {r.vetAuthorisation && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Vet authorised</span>}
                    {r.expectedCalvingDate && <span className="text-xs text-gray-400 flex items-center gap-1"><ChevronRight className="h-3 w-3" />Expected calving {formatDate(r.expectedCalvingDate)}</span>}
                    {(dctAttachMap[r.id] ?? 0) > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />{dctAttachMap[r.id]}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.treatmentJustification && <p className="text-xs text-gray-500 mt-1">Justification: {r.treatmentJustification}</p>}
                {r.notes && <p className="text-xs text-gray-400 mt-0.5">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "62rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit DCT Record" : "Add Dry Cow Therapy Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cow Ear Tag</Label>
                  <AnimalEarTagCombobox
                    value={form.cowEarTag || ""}
                    onSelect={handleAnimalSelect}
                    animals={animals}
                  />
                </div>
                <div><Label>Dry-Off Date *</Label><Input type="date" value={form.dryOffDate?.slice(0, 10) || ""} onChange={e => set("dryOffDate", e.target.value)} /></div>
              </div>

              {/* Stewardship hint banner */}
              {form.cowEarTag && form.cowEarTag.length >= 5 && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-2.5 flex items-center justify-between gap-2">
                  {hintLoading ? (
                    <span className="flex items-center gap-1.5 text-xs text-blue-500"><Loader2 className="h-3 w-3 animate-spin" />Looking up animal history…</span>
                  ) : hasHintData ? (
                    <>
                      <div className="text-xs text-blue-700">
                        <span className="font-semibold">From records:</span>{" "}
                        {hint!.mastitisCount12m} mastitis episode{hint!.mastitisCount12m !== 1 ? "s" : ""} in 12 months
                        {hint!.recentMastitisScc ? ` · most recent SCC at onset ${hint!.recentMastitisScc.toLocaleString()} k/mL` : ""}
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-blue-200 text-blue-700 hover:bg-blue-100" onClick={applyHint}>
                        <Sparkles className="h-3 w-3 mr-1" />Auto-fill
                      </Button>
                    </>
                  ) : hint ? (
                    <span className="text-xs text-blue-400">No mastitis records found for this ear tag in the last 12 months.</span>
                  ) : null}
                </div>
              )}

              <div>
                <Label>DCT Protocol *</Label>
                <Select value={form.protocol || "selective"} onValueChange={v => set("protocol", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROTOCOLS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {form.protocol !== "teat-sealant-only" && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antibiotic Tube</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label>Product Name</Label>
                      <ProductCombobox
                        value={form.antibioticTubeProduct || ""}
                        onChange={handleAntibioticProduct}
                        options={INTRAMAMMARY_ANTIBIOTICS}
                        placeholder="Search VMD intramammary products…"
                      />
                      {form.antibioticTubeProduct && DCT_WITHDRAWAL[form.antibioticTubeProduct] && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Standard withdrawal pre-filled — verify against the product datasheet
                        </p>
                      )}
                    </div>
                    <div><Label>Batch Number</Label><Input value={form.antibioticTubeBatch || ""} onChange={e => set("antibioticTubeBatch", e.target.value)} /></div>
                    <div></div>
                    <div><Label>Milk Withdrawal (days)</Label><Input type="number" value={form.antibioticTubeWithdrawalMilkDays ?? ""} onChange={e => set("antibioticTubeWithdrawalMilkDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
                    <div><Label>Meat Withdrawal (days)</Label><Input type="number" value={form.antibioticTubeWithdrawalMeatDays ?? ""} onChange={e => set("antibioticTubeWithdrawalMeatDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
                  </div>
                </div>
              )}

              {form.protocol?.includes("sealant") && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teat Sealant</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label>Product</Label>
                      <ProductCombobox
                        value={form.teatSealantProduct || ""}
                        onChange={v => set("teatSealantProduct", v)}
                        options={INTRAMAMMARY_SEALANTS}
                        placeholder="Search sealant products…"
                      />
                    </div>
                    <div><Label>Batch Number</Label><Input value={form.teatSealantBatch || ""} onChange={e => set("teatSealantBatch", e.target.value)} /></div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antibiotic Stewardship</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>SCC at Dry-Off (k/mL)</Label><Input type="number" value={form.sccAtDryOff ?? ""} onChange={e => set("sccAtDryOff", e.target.value ? parseInt(e.target.value) : null)} /></div>
                  <div><Label>Mastitis Episodes (12 mo)</Label><Input type="number" value={form.mastitisEpisodes12Months ?? ""} onChange={e => set("mastitisEpisodes12Months", e.target.value ? parseInt(e.target.value) : null)} /></div>
                </div>
                <div><Label>Treatment Justification</Label><Textarea value={form.treatmentJustification || ""} onChange={e => set("treatmentJustification", e.target.value)} placeholder="e.g. SCC consistently above 200k, 2 mastitis episodes in last lactation" rows={2} /></div>
              </div>

              <div className="rounded-md border p-3 space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vet &amp; Administration</p>

                {/* POM-V authorisation — required when antibiotics involved */}
                {needsVetAuth && (
                  <div className={`rounded-md border p-2.5 ${form.vetAuthorisation ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="vetauth"
                        checked={!!form.vetAuthorisation}
                        onChange={e => set("vetAuthorisation", e.target.checked)}
                        className="rounded mt-0.5 accent-green-600 h-4 w-4 shrink-0"
                      />
                      <div>
                        <Label htmlFor="vetauth" className={`font-semibold ${form.vetAuthorisation ? "text-green-800" : "text-red-800"}`}>
                          Written vet prescription / authorisation obtained *
                        </Label>
                        <p className={`text-xs mt-0.5 ${form.vetAuthorisation ? "text-green-700" : "text-red-700"}`}>
                          {form.vetAuthorisation
                            ? "Confirmed — this product is covered by a valid vet prescription."
                            : "Required by law: intramammary antibiotic tubes are POM-V medicines. A vet must examine the herd and issue a written prescription before the product can legally be obtained or used."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Teat sealant only — authorisation not required */}
                {!needsVetAuth && (
                  <p className="text-xs text-gray-400">No antibiotic used — vet prescription not required for internal teat sealants.</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Prescribing Vet</Label>
                    <NameCombobox
                      value={form.vetName || ""}
                      onChange={v => set("vetName", v)}
                      names={vetNames}
                      placeholder="Select or type vet name…"
                    />
                  </div>
                  <div>
                    <Label>Administered By</Label>
                    <NameCombobox
                      value={form.administeredBy || ""}
                      onChange={v => set("administeredBy", v)}
                      names={staffNames}
                      placeholder="Select or type staff name…"
                    />
                  </div>
                </div>

                <div>
                  <Label>Expected Calving Date</Label>
                  <Input type="date" value={form.expectedCalvingDate || ""} onChange={e => set("expectedCalvingDate", e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">
                    Used to determine withdrawal compliance — milk withdrawal for antibiotic dry cow tubes runs from calving, not from the date of administration.
                  </p>
                </div>

                {needsVetAuth && (
                  <div>
                    <Label>Estimated Prescription Fee (£)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 45.00"
                      value={form.estimatedPrescriptionFee ?? ""}
                      onChange={e => set("estimatedPrescriptionFee", e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Optional — this will appear against the vet visit in the Vet Ledger so finance can match it when the invoice arrives.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-amber-100 bg-amber-50 p-2.5">
                <p className="text-xs text-amber-700 font-medium mb-0.5">Medicines Register</p>
                <p className="text-xs text-amber-600">When saved, any antibiotic tube product will be automatically added to the farm's Medicine Records for this animal.</p>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !canSave} title={!form.dryOffDate ? "Dry-off date is required" : needsVetAuth && !form.vetAuthorisation ? "Written vet prescription must be confirmed before saving" : undefined}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add DCT Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Johne's Disease Monitoring Tab ──────────────────────────────────────────
const JOHNES_TYPES = [
  { value: "bulk_milk_elisa", label: "Bulk Milk ELISA" },
  { value: "individual_milk_elisa", label: "Individual Milk ELISA" },
  { value: "individual_blood_elisa", label: "Individual Blood ELISA" },
  { value: "faecal_pcr", label: "Faecal PCR (individual)" },
  { value: "pooled_faecal_pcr", label: "Pooled Faecal PCR" },
  { value: "post_mortem", label: "Post-mortem confirmation" },
];
const JOHNES_RISK = [
  { value: "1_very_low", label: "1 — Very Low Risk" },
  { value: "2_low", label: "2 — Low Risk" },
  { value: "3_moderate", label: "3 — Moderate Risk" },
  { value: "4_high", label: "4 — High Risk" },
];
const JOHNES_SCHEMES = [
  { value: "johnes_management_in_milk", label: "Johne's Management in Milk (AHDB)" },
  { value: "farm_health_connect", label: "Farm Health Connect" },
  { value: "voluntary", label: "Voluntary / Vet-led" },
  { value: "other", label: "Other" },
];

function JohnesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewRec, setViewRec] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["johnes-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/johnes-monitoring`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const allJohnesRecords: any[] = allRecordsRaw;
  const [yearFilterJohnes, setYearFilterJohnes] = useState("all");
  const yearsJohnes = useMemo(() => {
    const s = new Set(allJohnesRecords.map((r: any) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean) as string[]);
    return Array.from(s).sort().reverse();
  }, [allJohnesRecords]);
  const records: any[] = yearFilterJohnes === "all" ? allJohnesRecords : allJohnesRecords.filter((r: any) => String(r.testDate ?? "").startsWith(yearFilterJohnes));

  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then(r => r.json()).then(d => (d.records ?? []).filter((h: any) => { const t = String(h.type ?? "").toLowerCase(); return ["cattle", "beef", "dairy", "suckler", "bovine"].some(k => t.includes(k)); })),
    enabled: !!farmId,
  });

  function openAdd() { setEditing(null); setForm({ testType: "bulk_milk_elisa", jmmEnrolled: false, vetSignOff: false }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  async function save() {
    const url = editing ? api(`farms/${farmId}/johnes-monitoring/${editing.id}`) : api(`farms/${farmId}/johnes-monitoring`);
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
    setOpen(false);
  }

  async function del(id: number) {
    if (!confirm("Delete this Johne's monitoring record?")) return;
    await fetch(api(`farms/${farmId}/johnes-monitoring/${id}`), { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const riskLabel = (v: string | null) => JOHNES_RISK.find(r => r.value === v)?.label ?? v ?? "—";
  const typeLabel = (v: string) => JOHNES_TYPES.find(t => t.value === v)?.label ?? v;

  function printJohnesReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const rows = records.map((r: any) => `<tr>
      <td>${fmtDate(r.testDate)}</td>
      <td>${typeLabel(r.testType)}</td>
      <td>${r.herdId ? (herds.find((h: any) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}`) : "—"}</td>
      <td>${riskLabel(r.riskLevel)}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.positiveAnimalsCount ?? 0}</td>
      <td>${r.bulkMilkOd ?? "—"}</td>
      <td>${r.labName || "—"}</td>
      <td>${r.labRef || "—"}</td>
      <td>${fmtDate(r.nextTestDue)}</td>
      <td>${r.jmmEnrolled ? "Yes" : "No"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Johne's Disease Monitoring Register</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Johne's Disease Monitoring Register</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b>${yearFilterJohnes !== "all" ? `<br>Year: ${yearFilterJohnes}` : ""}<br>Printed: ${printedDate}</div>
</div>
<table>
  <tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Risk Level</th><th>Tested</th><th>Positive</th><th>Bulk Milk OD</th><th>Lab</th><th>Lab Ref</th><th>Next Due</th><th>JMM</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Johne's monitoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires a documented Johne's monitoring programme. Retain for a minimum of 3 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Johne's Disease Monitoring Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor Dairy requires a documented Johne's monitoring programme. Record each test with result and risk level classification.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={yearFilterJohnes} onValueChange={setYearFilterJohnes}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsJohnes.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={printJohnesReport} disabled={records.length === 0}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Test</Button>
        </div>
      </div>

      {!isLoading && records.length > 0 && (() => {
        const totalAnimals = records.reduce((s: number, r: any) => s + (r.animalsTestedCount ? Number(r.animalsTestedCount) : 0), 0);
        const totalPositive = records.reduce((s: number, r: any) => s + (r.positiveAnimalsCount ? Number(r.positiveAnimalsCount) : 0), 0);
        const prevalence = totalAnimals > 0 ? ((totalPositive / totalAnimals) * 100).toFixed(1) : null;
        const highRisk = records.filter((r: any) => r.riskLevel && (r.riskLevel.startsWith("3") || r.riskLevel.startsWith("4"))).length;
        return (
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Tests Recorded</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }}>{records.length}</p>
            </div>
            {totalAnimals > 0 && (
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Animals Tested</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>{totalAnimals.toLocaleString()}</p>
              </div>
            )}
            {totalAnimals > 0 && (
              <div style={{ background: totalPositive > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${totalPositive > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalPositive > 0 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Positives{prevalence ? ` (${prevalence}%)` : ""}</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: totalPositive > 0 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }}>{totalPositive}</p>
              </div>
            )}
            {highRisk > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>High / Elevated Risk</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }}>{highRisk}</p>
              </div>
            )}
          </div>
        );
      })()}

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="font-medium text-gray-600">No Johne's monitoring records{yearFilterJohnes !== "all" ? ` for ${yearFilterJohnes}` : ""} yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first test result to start tracking your herd's Johne's status.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>
                {["Test Date","Test Type","Herd","Risk Level","Animals Tested","Positive","Bulk Milk OD","Next Test Due","Doc","Actions"].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.testDate)}</td>
                  <td className="px-3 py-2">{typeLabel(r.testType)}</td>
                  <td className="px-3 py-2">{r.herdId ? (herds.find((h: any) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}`) : "—"}</td>
                  <td className="px-3 py-2">
                    {r.riskLevel ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.riskLevel.startsWith("4") ? "bg-red-100 text-red-800" : r.riskLevel.startsWith("3") ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{riskLabel(r.riskLevel)}</span> : "—"}
                  </td>
                  <td className="px-3 py-2">{r.animalsTestedCount ?? "—"}</td>
                  <td className="px-3 py-2">{r.positiveAnimalsCount ?? 0}</td>
                  <td className="px-3 py-2">{r.bulkMilkOd ?? "—"}</td>
                  <td className="px-3 py-2">{fmtDate(r.nextTestDue)}</td>
                  <td className="px-3 py-2"><DocAttach farmId={farmId} endpoint="johnes-monitoring" recordId={r.id as number} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["johnes-monitoring", farmId]} compact /></td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Johne's Monitoring — {fmtDate(viewRec.testDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Date</p><p className="font-medium">{fmtDate(viewRec.testDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Type</p><p className="font-medium">{typeLabel(viewRec.testType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd</p><p className="font-medium">{viewRec.herdId ? (herds.find((h: any) => h.id === viewRec.herdId)?.name ?? `Herd #${viewRec.herdId}`) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Risk Level</p><p className="font-medium">{riskLabel(viewRec.riskLevel)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animals Tested</p><p className="font-medium">{viewRec.animalsTestedCount ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Positive Animals</p><p className="font-medium">{viewRec.positiveAnimalsCount ?? 0}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bulk Milk OD</p><p className="font-medium">{viewRec.bulkMilkOd ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab</p><p className="font-medium">{viewRec.labName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Reference</p><p className="font-medium">{viewRec.labRef || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scheme</p><p className="font-medium">{JOHNES_SCHEMES.find(s => s.value === viewRec.scheme)?.label ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet</p><p className="font-medium">{viewRec.vetName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">{fmtDate(viewRec.nextTestDue)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">JMM Enrolled</p><p className="font-medium">{viewRec.jmmEnrolled ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Sign-off</p><p className="font-medium">{viewRec.vetSignOff ? "Yes" : "No"}</p></div>
              {viewRec.actionsTaken && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Taken</p><p className="font-medium">{viewRec.actionsTaken}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              {viewRec.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="johnes-monitoring" recordId={viewRec.id as number} /></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Johne's Monitoring Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Test Date *</Label><Input type="date" value={form.testDate || ""} onChange={e => set("testDate", e.target.value)} /></div>
            <div><Label>Test Type *</Label>
              <Select value={form.testType || ""} onValueChange={v => set("testType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{JOHNES_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Herd</Label>
              <Select value={String(form.herdId || "__none__")} onValueChange={v => set("herdId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select herd (optional)" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— All herds</SelectItem>{herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Risk Level</Label>
              <Select value={form.riskLevel || "__none__"} onValueChange={v => set("riskLevel", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not classified</SelectItem>{JOHNES_RISK.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Lab Name</Label><Input value={form.labName || ""} onChange={e => set("labName", e.target.value)} placeholder="e.g. SRUC, APHA Starcross" /></div>
            <div><Label>Lab Reference</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} placeholder="Lab submission reference" /></div>
            <div><Label>Animals Tested</Label><Input type="number" min="0" value={form.animalsTestedCount ?? ""} onChange={e => set("animalsTestedCount", e.target.value)} /></div>
            <div><Label>Positive Animals</Label><Input type="number" min="0" value={form.positiveAnimalsCount ?? 0} onChange={e => set("positiveAnimalsCount", e.target.value)} /></div>
            <div><Label>Bulk Milk OD</Label><Input type="number" step="0.001" value={form.bulkMilkOd ?? ""} onChange={e => set("bulkMilkOd", e.target.value)} placeholder="Optical density reading" /></div>
            <div><Label>Monitoring Scheme</Label>
              <Select value={form.scheme || "__none__"} onValueChange={v => set("scheme", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— None</SelectItem>{JOHNES_SCHEMES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>
            <div><Label>Next Test Due</Label><Input type="date" value={form.nextTestDue || ""} onChange={e => set("nextTestDue", e.target.value)} /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="jmm" checked={!!form.jmmEnrolled} onChange={e => set("jmmEnrolled", e.target.checked)} className="rounded" />
              <Label htmlFor="jmm">Enrolled in JMM Scheme</Label>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="vetso" checked={!!form.vetSignOff} onChange={e => set("vetSignOff", e.target.checked)} className="rounded" />
              <Label htmlFor="vetso">Vet sign-off obtained</Label>
            </div>
            <div className="col-span-2"><Label>Actions Taken</Label><Textarea rows={2} value={form.actionsTaken || ""} onChange={e => set("actionsTaken", e.target.value)} placeholder="Management actions, culling decisions, biosecurity changes…" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
