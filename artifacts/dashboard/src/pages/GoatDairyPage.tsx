import React, { useState, useMemo } from "react";
import { formatAlertIssuedAt } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, Eye, Droplets, Printer, ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DocAttach } from "@/components/DocAttach";
import { useToast } from "@/hooks/use-toast";
import { AbrKitStockSection, SccEquipmentSection } from "@/pages/DairyPage";
import { AbrProcurementSection } from "@/pages/dairy/AbrProcurementSection";
import { DairyEnterpriseReport } from "@/components/DairyEnterpriseReport";
import { ResponsiveContainer, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart } from "recharts";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

function fmt(v?: string | null) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return v; }
}

function today() { return new Date().toISOString().slice(0, 10); }

// SCC badge — goat regulatory limit is 1,000,000 cells/mL
function GoatSccBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const ok = v < 500;
  const warn = v >= 500 && v < 1000;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL {v >= 1000 ? "⚠ Exceeds 1,000k limit" : ""}
    </span>
  );
}

function OutcomeBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const map: Record<string, string> = { cured: "bg-green-100 text-green-800", recovered: "bg-green-100 text-green-800", "dried-off": "bg-blue-100 text-blue-800", culled: "bg-red-100 text-red-800", chronic: "bg-amber-100 text-amber-800", ongoing: "bg-yellow-100 text-yellow-800" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || "bg-gray-100 text-gray-700"}`}>{v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ")}</span>;
}

function BcsBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const n = parseFloat(v);
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${n >= 2.5 && n <= 3.5 ? "bg-green-100 text-green-800" : n < 2.5 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{v}</span>;
}

function ResultBadge({ v }: { v?: string | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const cls = v.toLowerCase().includes("neg") || v.toLowerCase() === "clear" ? "bg-green-100 text-green-800" : v.toLowerCase().includes("pos") ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{v}</span>;
}

import { DairySuppliesTab } from "@/components/DairySuppliesTab";
type Tab = "milk" | "mastitis" | "kidding" | "bcs" | "tank" | "cae" | "assurance" | "abr-kit" | "scc-equipment" | "enterprise" | "supplies";

export default function GoatDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({
    page: "goat-dairy",
    farmId,
    validIds: ["milk", "mastitis", "kidding", "bcs", "tank", "cae", "assurance", "abr-kit", "scc-equipment", "enterprise", "supplies"],
    defaultTab: "milk",
  });
  const { data: goatAlert } = useQuery({
    queryKey: ["goat-platform-alert", farmId],
    queryFn: () => fetch(`/api/goat-alert${farmId ? `?farmId=${farmId}` : ""}`).then(r => r.json()).catch(() => ({ active: false })),
    enabled: !!farmId,
  });

  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Goat Dairy">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Goat Dairy Records</h1>
          <p className="text-gray-500 text-sm mt-1">
            British Goat Society compliance — milk recording with SCC monitoring (1,000,000 cells/mL regulatory limit), mastitis, kidding records with LIS tagging, body condition scoring, bulk tank hygiene, and CAE (Caprine Arthritis Encephalitis) monitoring.
          </p>
        </div>
        {goatAlert?.active && (
          <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm mb-4 ${
            goatAlert.level === "national" ? "bg-red-50 border-red-200 text-red-800" :
            goatAlert.level === "regional" ? "bg-orange-50 border-orange-200 text-orange-800" :
            "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">
                {goatAlert.level === "national" ? "National Goat Disease Alert" :
                 goatAlert.level === "regional" ? "Regional Goat Disease Alert" :
                 "Goat Disease Notice"}
              </span>
              {goatAlert.message && <span className="ml-2">{goatAlert.message}</span>}
              {(goatAlert.issuedAt || goatAlert.date) && <span className="ml-2 opacity-70 text-xs">{formatAlertIssuedAt(goatAlert.issuedAt, goatAlert.date)}</span>}
            </div>
          </div>
        )}
        <TabBar>
          <TabButton active={tab === "milk"} onClick={() => setTab("milk")}>Milk Collections</TabButton>
          <TabButton active={tab === "mastitis"} onClick={() => setTab("mastitis")}>Mastitis</TabButton>
          <TabButton active={tab === "kidding"} onClick={() => setTab("kidding")}>Kidding Records</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "cae"} onClick={() => setTab("cae")}>CAE Monitoring</TabButton>
          <TabButton active={tab === "assurance"} onClick={() => setTab("assurance")}>Assurance</TabButton>
          <TabButton active={tab === "abr-kit"} onClick={() => setTab("abr-kit")}>ABR Kit Stock</TabButton>
          <TabButton active={tab === "scc-equipment"} onClick={() => setTab("scc-equipment")}>SCC Equipment</TabButton>
          <TabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}>Enterprise Report</TabButton>
          <TabButton active={tab === "supplies"} onClick={() => setTab("supplies")}>Supplies</TabButton>
        </TabBar>
        <div className="mt-6">
          {tab === "milk" && <MilkTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "kidding" && <KiddingTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "cae" && <CaeTab farmId={farmId} />}
          {tab === "assurance" && <AssuranceTab />}
          {tab === "abr-kit" && <div className="space-y-6"><AbrKitStockSection farmId={farmId} /><AbrProcurementSection farmId={farmId} /></div>}
          {tab === "scc-equipment" && <SccEquipmentSection farmId={farmId} species="goat" />}
          {tab === "enterprise" && <DairyEnterpriseReport farmId={farmId} endpoint={api(`farms/${farmId}/goat-dairy-enterprise-report`)} queryPrefix="goat-dairy-enterprise" speciesNote="Milk income from goat dairy collection records. Feed cost and other variable costs not yet included — add via Financial for a complete P&L." />}
          {tab === "supplies" && <DairySuppliesTab farmId={farmId} dairyType="goat" />}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Milk Collections ──────────────────────────────────────────────────────────

interface MilkRecord {
  id: number; recordDate: string; sessionType?: string | null; yieldLitres?: string | null;
  milkBuyer?: string | null; collectorReference?: string | null;
  sccThousands?: number | null; tbcCfuMl?: number | null; fatPercent?: string | null; proteinPercent?: string | null;
  milkTemperatureCelsius?: string | null; antibioticResidueTestResult?: string | null;
  buyerLabResultsStatus?: string | null; buyerSccThousands?: number | null;
  buyerFatPercent?: string | null; buyerProteinPercent?: string | null;
  pencePerLitre?: string | null; netPaymentPence?: number | null; abrTestKitLot?: string | null; notes?: string | null;
  isRetest?: boolean | null; retestOfId?: number | null;
}

function MilkTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MilkRecord | null>(null);
  const [viewRec, setViewRec] = useState<MilkRecord | null>(null);
  const blank: Partial<MilkRecord> = { recordDate: today(), sessionType: "morning" };
  const [form, setForm] = useState<Partial<MilkRecord>>(blank);
  const set = (k: keyof MilkRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-milk", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/milk-records`)).then(r => r.json()) });
  const records: MilkRecord[] = data?.records ?? [];

  const [abrKitStockId, setAbrKitStockId] = useState<string>("");
  const abrStockQ = useQuery<{ stock: Array<{ id: number; productName: string; lotNumber: string | null; quantityRemaining: number }> }>({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`)).then(r => r.json()),
  });
  const abrStock = abrStockQ.data?.stock ?? [];

  const save = useMutation({
    mutationFn: (body: Partial<MilkRecord>) => fetch(api(`farms/${farmId}/goat-dairy/milk-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, abrKitStockId: abrKitStockId || undefined }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-milk", farmId] }); qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }); setOpen(false); setAbrKitStockId(""); toast({ title: editing ? "Record updated" : "Record added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/milk-records/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-milk", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const milkYears = useMemo(() => {
    const s = new Set<string>(records.map(r => String(r.recordDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [milkYearFilter, setMilkYearFilter] = usePersistedFilter({ page: "goat-dairy-milk", filter: "year", farmId, defaultValue: "all" });
  const filteredMilk = useMemo(() => milkYearFilter === "all" ? records : records.filter(r => String(r.recordDate || "").startsWith(milkYearFilter)), [records, milkYearFilter]);

  const totalYield = filteredMilk.reduce((s, r) => s + (parseFloat(r.yieldLitres || "0") || 0), 0);
  const sccReadings = filteredMilk.map(r => r.buyerSccThousands ?? r.sccThousands).filter((v): v is number => v != null);
  const avgScc = sccReadings.length ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;

  const printMilk = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Milk Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Milk Collection Records${milkYearFilter !== "all" ? ` — ${milkYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Session</th><th>Yield (L)</th><th>SCC (k/mL)</th><th>Fat%</th><th>Protein%</th><th>ABR</th><th>Buyer</th></tr></thead><tbody>${filteredMilk.map(r => `<tr><td>${fmt(r.recordDate)}</td><td>${r.sessionType || "—"}</td><td>${r.yieldLitres || "—"}</td><td>${(r.buyerSccThousands ?? r.sccThousands) ?? "—"}</td><td>${r.buyerFatPercent ?? r.fatPercent ?? "—"}</td><td>${r.buyerProteinPercent ?? r.proteinPercent ?? "—"}</td><td>${r.antibioticResidueTestResult || "—"}</td><td>${r.milkBuyer || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Total Yield (filtered)</p><p className="text-2xl font-bold text-blue-800">{totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 })}<span className="text-sm font-normal ml-1">L</span></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Avg SCC (k/mL)</p><p className={`text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1000 ? "text-red-700" : avgScc > 500 ? "text-amber-700" : "text-green-700"}`}>{avgScc != null ? avgScc.toLocaleString() : "—"}</p><p className="text-xs text-gray-400">UK limit: 1,000k cells/mL</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Records</p><p className="text-2xl font-bold text-gray-800">{filteredMilk.length}</p></CardContent></Card>
      </div>
      {(() => {
        const monthMap: Record<string, { label: string; yieldL: number; scc: number | null }> = {};
        [...records].sort((a, b) => String(a.recordDate).localeCompare(String(b.recordDate))).forEach(r => {
          const d = new Date(String(r.recordDate));
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
          if (!monthMap[key]) monthMap[key] = { label, yieldL: 0, scc: null };
          monthMap[key].yieldL += parseFloat(r.yieldLitres || "0") || 0;
          const scc = r.buyerSccThousands ?? r.sccThousands ?? null;
          if (scc != null) monthMap[key].scc = scc;
        });
        const chartData = Object.keys(monthMap).sort().map(k => monthMap[k]);
        if (chartData.length <= 1) return null;
        return (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Yield &amp; SCC Trend — Monthly</h3>
              <span className="text-xs text-gray-400">Goat regulatory SCC limit: 1,000k cells/mL</span>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={55} tickFormatter={(v: number) => `${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={65} tickFormatter={(v: number) => `${v}k`} />
                  <Tooltip formatter={(v: number, name: string) => [name === "SCC (k/mL)" ? `${v}k` : `${Number(v).toFixed(0)}L`, name]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="yieldL" name="Yield (L)" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="scc" name="SCC (k/mL)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">Milk Collection Records</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={milkYearFilter} onValueChange={setMilkYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{milkYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printMilk}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setAbrKitStockId(""); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filteredMilk.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><Droplets className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No milk records yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Session</th><th className="py-2 px-3 text-left">Yield (L)</th><th className="py-2 px-3 text-left">SCC</th><th className="py-2 px-3 text-left">Fat%</th><th className="py-2 px-3 text-left">Protein%</th><th className="py-2 px-3 text-left">ABR</th><th className="py-2 px-3 text-left">Buyer</th><th className="py-2 px-3 text-left"></th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
            <tbody>{filteredMilk.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium">{fmt(r.recordDate)}</td>
                <td className="py-2 px-3 capitalize">{r.sessionType || "—"}</td>
                <td className="py-2 px-3">{r.yieldLitres ? parseFloat(r.yieldLitres).toLocaleString() : "—"}</td>
                <td className="py-2 px-3"><GoatSccBadge v={r.buyerSccThousands ?? r.sccThousands} /></td>
                <td className="py-2 px-3">{r.buyerFatPercent ?? r.fatPercent ?? "—"}</td>
                <td className="py-2 px-3">{r.buyerProteinPercent ?? r.proteinPercent ?? "—"}</td>
                <td className="py-2 px-3">{r.antibioticResidueTestResult ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.antibioticResidueTestResult === "negative" ? "bg-green-100 text-green-800" : r.antibioticResidueTestResult === "positive" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{r.antibioticResidueTestResult}</span> : "—"}</td>
                <td className="py-2 px-3 text-gray-500">{r.milkBuyer || "—"}</td>
                <td className="py-2 px-3"><DocAttach farmId={farmId} endpoint="goat-dairy/milk-records" recordId={r.id} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["goat-dairy-milk", String(farmId)]} compact /></td>
                <td className="py-2 px-3"><div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setAbrKitStockId(""); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader><DialogTitle>Milk Record — {fmt(viewRec.recordDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Session</p><p className="font-medium capitalize">{viewRec.sessionType || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Yield (L)</p><p className="font-medium">{viewRec.yieldLitres || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC on-farm (k/mL)</p><GoatSccBadge v={viewRec.sccThousands} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer SCC (k/mL)</p><GoatSccBadge v={viewRec.buyerSccThousands} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fat%</p><p className="font-medium">{viewRec.buyerFatPercent ?? viewRec.fatPercent ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protein%</p><p className="font-medium">{viewRec.buyerProteinPercent ?? viewRec.proteinPercent ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Temperature (°C)</p><p className="font-medium">{viewRec.milkTemperatureCelsius || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Result</p><p className="font-medium capitalize">{viewRec.antibioticResidueTestResult || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Buyer</p><p className="font-medium">{viewRec.milkBuyer || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collector Ref</p><p className="font-medium">{viewRec.collectorReference || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Payment</p><p className="font-medium">{viewRec.netPaymentPence != null ? `£${(viewRec.netPaymentPence / 100).toFixed(2)}` : "—"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="goat-dairy-milk" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setAbrKitStockId(""); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Milk Record" : "Add Milk Record"}</DialogTitle></DialogHeader>
          <Tabs defaultValue="session" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="session">Milking Session</TabsTrigger>
              <TabsTrigger value="collection">Collection &amp; Buyer Lab</TabsTrigger>
            </TabsList>
            <TabsContent value="session">
              <div className="grid grid-cols-2 gap-3 py-2">
                <div><Label>Date *</Label><Input type="date" value={String(form.recordDate || "").slice(0, 10)} onChange={e => set("recordDate", e.target.value)} /></div>
                <div><Label>Session</Label>
                  <Select value={form.sessionType || "__none__"} onValueChange={v => set("sessionType", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="morning">Morning</SelectItem><SelectItem value="afternoon">Afternoon</SelectItem><SelectItem value="evening">Evening</SelectItem><SelectItem value="full-day">Full day</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Yield (litres)</Label><Input type="number" step="0.1" value={form.yieldLitres || ""} onChange={e => set("yieldLitres", e.target.value)} /></div>
                <div><Label>Milk Temperature (°C)</Label><Input type="number" step="0.1" value={form.milkTemperatureCelsius || ""} onChange={e => set("milkTemperatureCelsius", e.target.value)} /></div>
                <div><Label>On-farm SCC (k/mL)</Label><Input type="number" value={form.sccThousands || ""} onChange={e => set("sccThousands", e.target.value ? parseInt(e.target.value) : null)} /><p className="text-xs text-gray-400 mt-0.5">UK limit: 1,000k</p></div>
                <div><Label>On-farm TBC (cfu/mL)</Label><Input type="number" value={form.tbcCfuMl || ""} onChange={e => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : null)} /></div>
                <div><Label>Fat %</Label><Input type="number" step="0.01" value={form.fatPercent || ""} onChange={e => set("fatPercent", e.target.value)} /></div>
                <div><Label>Protein %</Label><Input type="number" step="0.01" value={form.proteinPercent || ""} onChange={e => set("proteinPercent", e.target.value)} /></div>
                <div><Label>ABR Test Result</Label>
                  <Select value={form.antibioticResidueTestResult || "__none__"} onValueChange={v => set("antibioticResidueTestResult", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent><SelectItem value="__none__">Not tested</SelectItem><SelectItem value="negative">Negative ✓</SelectItem><SelectItem value="positive">Positive ⚠</SelectItem><SelectItem value="borderline">Borderline</SelectItem><SelectItem value="invalid">Invalid (test void)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>ABR Kit Stock Record</Label>
                  <Select value={abrKitStockId} onValueChange={setAbrKitStockId}>
                    <SelectTrigger><SelectValue placeholder="Link kit (auto-decrements stock)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None / not tracking</SelectItem>
                      {abrStock.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.productName}{s.lotNumber ? ` · Lot ${s.lotNumber}` : ""} ({s.quantityRemaining} remaining)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>ABR Kit Lot</Label><Input value={form.abrTestKitLot || ""} onChange={e => set("abrTestKitLot", e.target.value)} /></div>
                <div className="col-span-3 border-t border-amber-100 pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is-retest-gd" checked={!!form.isRetest} onChange={e => { set("isRetest", e.target.checked); if (!e.target.checked) set("retestOfId", null); }} className="w-4 h-4 rounded" />
                    <Label htmlFor="is-retest-gd" className="font-normal cursor-pointer">This is a follow-up retest of a previous non-negative result</Label>
                  </div>
                  {form.isRetest && (
                    <div className="space-y-1">
                      <Label>Retest of (original concerning record)</Label>
                      <Select value={form.retestOfId ? String(form.retestOfId) : ""} onValueChange={v => set("retestOfId", v ? Number(v) : null)}>
                        <SelectTrigger><SelectValue placeholder="Select the original record…" /></SelectTrigger>
                        <SelectContent>
                          {records.filter(r => r.id !== editing?.id && ["positive","borderline","invalid"].includes(r.antibioticResidueTestResult ?? "")).slice(0, 40).map(r => (
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
                <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
              </div>
            </TabsContent>
            <TabsContent value="collection">
              <div className="space-y-4 py-2">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-800 mb-1">One collection covers multiple milkings</p>
                  <p className="text-xs text-amber-700">A tanker typically collects from the bulk tank every 2–3 days. Enter the same Collector Reference on every milking session that went into one collection load. The buyer's lab results are tied to the collection event, not each individual milking.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Milk Buyer</Label><Input value={form.milkBuyer || ""} onChange={e => set("milkBuyer", e.target.value)} /></div>
                  <div><Label>Collector Reference</Label><Input value={form.collectorReference || ""} onChange={e => set("collectorReference", e.target.value)} /></div>
                  <div><Label>Buyer SCC (k/mL)</Label><Input type="number" value={form.buyerSccThousands || ""} onChange={e => set("buyerSccThousands", e.target.value ? parseInt(e.target.value) : null)} /></div>
                  <div><Label>Buyer Fat %</Label><Input type="number" step="0.01" value={form.buyerFatPercent || ""} onChange={e => set("buyerFatPercent", e.target.value)} /></div>
                  <div><Label>Buyer Protein %</Label><Input type="number" step="0.01" value={form.buyerProteinPercent || ""} onChange={e => set("buyerProteinPercent", e.target.value)} /></div>
                  <div><Label>Pence per litre</Label><Input type="number" step="0.01" value={form.pencePerLitre || ""} onChange={e => set("pencePerLitre", e.target.value)} /></div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Mastitis ──────────────────────────────────────────────────────────────────

interface MastitisRecord {
  id: number; incidentDate: string; doeLisTag?: string | null; doeName?: string | null;
  halfAffected?: string | null; clinicalSigns?: string | null; pathogenIdentified?: string | null;
  labSampleTaken?: boolean; labRef?: string | null; sccAtOnset?: number | null;
  treatmentProduct?: string | null; treatmentDurationDays?: number | null;
  withdrawalMilkDays?: number | null; milkWithdrawnUntil?: string | null;
  outcome?: string | null; chronicCase?: boolean; culledDueToMastitis?: boolean;
  attendingVet?: string | null; notes?: string | null;
}

export function MastitisTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MastitisRecord | null>(null);
  const [viewRec, setViewRec] = useState<MastitisRecord | null>(null);
  const blank: Partial<MastitisRecord> = { incidentDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false };
  const [form, setForm] = useState<Partial<MastitisRecord>>(blank);
  const set = (k: keyof MastitisRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records`)).then(r => r.json()) });
  const records: MastitisRecord[] = data?.records ?? [];

  const save = useMutation({
    mutationFn: (body: Partial<MastitisRecord>) => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-mastitis", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-mastitis", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const mastiYears = useMemo(() => {
    const s = new Set<string>(records.map(r => String(r.incidentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [mastiYearFilter, setMastiYearFilter] = usePersistedFilter({ page: "goat-dairy-mastitis", filter: "year", farmId, defaultValue: "all" });
  const filteredMasti = useMemo(() => mastiYearFilter === "all" ? records : records.filter(r => String(r.incidentDate || "").startsWith(mastiYearFilter)), [records, mastiYearFilter]);

  const printMasti = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Mastitis Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Mastitis Records${mastiYearFilter !== "all" ? ` — ${mastiYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Doe LIS Tag</th><th>Half</th><th>Pathogen</th><th>Treatment</th><th>Outcome</th></tr></thead><tbody>${filteredMasti.map(r => `<tr><td>${fmt(r.incidentDate)}</td><td>${r.doeLisTag || "—"}</td><td>${r.halfAffected || "—"}</td><td>${r.pathogenIdentified || "—"}</td><td>${r.treatmentProduct || "—"}</td><td>${r.outcome || "—"}${r.chronicCase ? " (Chronic)" : ""}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  const mastiAnalytics = useMemo(() => {
    const monthMap: Record<string, number> = {};
    filteredMasti.forEach(r => { const key = String(r.incidentDate || "").slice(0, 7); if (key.length === 7) monthMap[key] = (monthMap[key] || 0) + 1; });
    const trend = Object.keys(monthMap).sort().map(k => ({ label: new Date(k + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), cases: monthMap[k] }));
    const outcomeMap: Record<string, number> = {};
    filteredMasti.forEach(r => { const o = r.outcome || "ongoing"; outcomeMap[o] = (outcomeMap[o] || 0) + 1; });
    const outcomeData = Object.entries(outcomeMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " "), value }));
    const pathMap: Record<string, number> = {};
    filteredMasti.forEach(r => { if (r.pathogenIdentified?.trim()) { const p = r.pathogenIdentified.trim(); pathMap[p] = (pathMap[p] || 0) + 1; } });
    const pathData = Object.entries(pathMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const animalMap: Record<string, number> = {};
    filteredMasti.forEach(r => { if (r.doeLisTag) animalMap[r.doeLisTag] = (animalMap[r.doeLisTag] || 0) + 1; });
    const repeatAnimals = Object.entries(animalMap).filter(([, c]) => c >= 2).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
    return { trend, outcomeData, pathData, repeatAnimals };
  }, [filteredMasti]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Total Cases</p><p className="text-2xl font-bold text-gray-800">{filteredMasti.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Chronic Cases</p><p className="text-2xl font-bold text-amber-700">{filteredMasti.filter(r => r.chronicCase).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Culled Due to Mastitis</p><p className="text-2xl font-bold text-red-700">{filteredMasti.filter(r => r.culledDueToMastitis).length}</p></CardContent></Card>
      </div>
      {mastiAnalytics.trend.length > 1 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Monthly Case Trend</h3></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={mastiAnalytics.trend} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cases" name="Cases" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {(mastiAnalytics.outcomeData.length > 0 || mastiAnalytics.pathData.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mastiAnalytics.outcomeData.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Outcome Distribution</h3></div>
              <div className="p-4 flex justify-center">
                <PieChart width={220} height={160}>
                  <Pie data={mastiAnalytics.outcomeData} cx={110} cy={75} innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 9 }}>
                    {mastiAnalytics.outcomeData.map((_: unknown, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          )}
          {mastiAnalytics.pathData.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Pathogen Breakdown</h3></div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={mastiAnalytics.pathData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" name="Cases" fill="#3b82f6" radius={[0, 3, 3, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
      {mastiAnalytics.repeatAnimals.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-200"><h3 className="text-sm font-semibold text-amber-800">⚠ Repeat Mastitis Does — {mastiAnalytics.repeatAnimals.length} doe{mastiAnalytics.repeatAnimals.length !== 1 ? "s" : ""} with ≥2 episodes</h3></div>
          <div className="px-4 py-2 flex flex-wrap gap-2">
            {mastiAnalytics.repeatAnimals.map((a: { tag: string; count: number }) => (
              <span key={a.tag} className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 border border-amber-300 rounded-md text-xs font-mono font-medium text-amber-900">{a.tag} <span className="font-bold text-amber-700">× {a.count}</span></span>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">Mastitis Records</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={mastiYearFilter} onValueChange={setMastiYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{mastiYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printMasti}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filteredMasti.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No mastitis records yet.</p></div>
      ) : (
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Doe LIS Tag</th><th className="py-2 px-3 text-left">Half</th><th className="py-2 px-3 text-left">Pathogen</th><th className="py-2 px-3 text-left">Treatment</th><th className="py-2 px-3 text-left">Outcome</th><th className="py-2 px-3 text-left"></th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
          <tbody>{filteredMasti.map(r => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-medium">{fmt(r.incidentDate)}</td>
              <td className="py-2 px-3 font-mono text-xs">{r.doeLisTag || "—"}</td>
              <td className="py-2 px-3 capitalize">{r.halfAffected || "—"}</td>
              <td className="py-2 px-3">{r.pathogenIdentified || "—"}</td>
              <td className="py-2 px-3">{r.treatmentProduct || "—"}</td>
              <td className="py-2 px-3"><OutcomeBadge v={r.outcome} />{r.chronicCase && <span className="ml-1 text-xs text-amber-600">Chronic</span>}</td>
              <td className="py-2 px-3"><DocAttach farmId={farmId} endpoint="goat-dairy/mastitis-records" recordId={r.id} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["goat-dairy-mastitis", String(farmId)]} compact /></td>
              <td className="py-2 px-3"><div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Mastitis — {viewRec.doeLisTag || "Unknown doe"} on {fmt(viewRec.incidentDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe LIS Tag</p><p className="font-mono font-medium">{viewRec.doeLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Half Affected</p><p className="font-medium capitalize">{viewRec.halfAffected || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clinical Signs</p><p className="font-medium">{viewRec.clinicalSigns || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pathogen</p><p className="font-medium">{viewRec.pathogenIdentified || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Onset (k/mL)</p><p className="font-medium">{viewRec.sccAtOnset ? viewRec.sccAtOnset.toLocaleString() : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Product</p><p className="font-medium">{viewRec.treatmentProduct || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Withdrawal</p><p className="font-medium">{viewRec.withdrawalMilkDays != null ? `${viewRec.withdrawalMilkDays} days` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><OutcomeBadge v={viewRec.outcome} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Attending Vet</p><p className="font-medium">{viewRec.attendingVet || "—"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="goat-dairy-mastitis" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Mastitis Record" : "Add Mastitis Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Incident Date *</Label><Input type="date" value={String(form.incidentDate || "").slice(0, 10)} onChange={e => set("incidentDate", e.target.value)} /></div>
            <div><Label>Doe LIS Tag</Label><Input value={form.doeLisTag || ""} onChange={e => set("doeLisTag", e.target.value)} placeholder="LIS ear tag" /></div>
            <div><Label>Half Affected</Label>
              <Select value={form.halfAffected || "__none__"} onValueChange={v => set("halfAffected", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="left">Left</SelectItem><SelectItem value="right">Right</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Clinical Signs</Label><Input value={form.clinicalSigns || ""} onChange={e => set("clinicalSigns", e.target.value)} /></div>
            <div><Label>Pathogen Identified</Label><Input value={form.pathogenIdentified || ""} onChange={e => set("pathogenIdentified", e.target.value)} placeholder="e.g. Staph. aureus, Strep." /></div>
            <div><Label>Lab Ref</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>SCC at Onset (k/mL)</Label><Input type="number" value={form.sccAtOnset || ""} onChange={e => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g. 800" /><p className="text-xs text-gray-400 mt-0.5">UK limit: 1,000k</p></div>
            <div><Label>Treatment Product</Label><Input value={form.treatmentProduct || ""} onChange={e => set("treatmentProduct", e.target.value)} /></div>
            <div><Label>Treatment Duration (days)</Label><Input type="number" value={form.treatmentDurationDays || ""} onChange={e => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Milk Withdrawal (days)</Label><Input type="number" value={form.withdrawalMilkDays || ""} onChange={e => set("withdrawalMilkDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Milk Withheld Until</Label><Input type="date" value={String(form.milkWithdrawnUntil || "").slice(0, 10)} onChange={e => set("milkWithdrawnUntil", e.target.value)} /></div>
            <div><Label>Outcome</Label>
              <Select value={form.outcome || "__none__"} onValueChange={v => set("outcome", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Ongoing</SelectItem><SelectItem value="cured">Cured</SelectItem><SelectItem value="recovered">Recovered</SelectItem><SelectItem value="dried-off">Dried off early</SelectItem><SelectItem value="chronic">Chronic</SelectItem><SelectItem value="culled">Culled</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Attending Vet</Label><Input value={form.attendingVet || ""} onChange={e => set("attendingVet", e.target.value)} /></div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.labSampleTaken} onChange={e => set("labSampleTaken", e.target.checked)} />Lab sample taken</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.chronicCase} onChange={e => set("chronicCase", e.target.checked)} />Chronic case</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.culledDueToMastitis} onChange={e => set("culledDueToMastitis", e.target.checked)} />Culled for mastitis</label>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Kidding Records ────────────────────────────────────────────────────────────

interface KiddingRecord {
  id: number; kiddingDate: string; doeLisTag?: string | null; birthOutcome: string;
  kidCount?: number | null; kidSex?: string | null; kidEidTag?: string | null;
  kidBirthWeightKg?: string | null; easeScore?: number | null;
  assistanceRequired?: boolean; assistanceType?: string | null;
  vetAttended?: boolean; vetName?: string | null;
  colostrumGivenWithin2Hours?: boolean | null;
  eidApplied?: boolean; eidAppliedDate?: string | null; lisTagNumber?: string | null;
  doeMilkingStatus?: string | null; doeComplications?: string | null; notes?: string | null;
}

function EaseScoreBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const cls = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const lbl = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] || "bg-gray-100 text-gray-700"}`}>{v} — {lbl[v] || "Unknown"}</span>;
}

export function KiddingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KiddingRecord | null>(null);
  const [viewRec, setViewRec] = useState<KiddingRecord | null>(null);
  const blank: Partial<KiddingRecord> = { kiddingDate: today(), birthOutcome: "live-single", kidCount: 1, assistanceRequired: false, vetAttended: false, eidApplied: false };
  const [form, setForm] = useState<Partial<KiddingRecord>>(blank);
  const set = (k: keyof KiddingRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-kidding", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/kidding-records`)).then(r => r.json()) });
  const records: KiddingRecord[] = data?.records ?? [];

  const save = useMutation({
    mutationFn: (body: Partial<KiddingRecord>) => fetch(api(`farms/${farmId}/goat-dairy/kidding-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-kidding", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/kidding-records/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-kidding", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const kiddingYears = useMemo(() => {
    const s = new Set<string>(records.map(r => String(r.kiddingDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [kiddingYearFilter, setKiddingYearFilter] = usePersistedFilter({ page: "goat-dairy-kidding", filter: "year", farmId, defaultValue: "all" });
  const filteredKidding = useMemo(() => kiddingYearFilter === "all" ? records : records.filter(r => String(r.kiddingDate || "").startsWith(kiddingYearFilter)), [records, kiddingYearFilter]);

  const liveCount = filteredKidding.reduce((s, r) => s + (r.birthOutcome?.includes("live") ? (r.kidCount || 1) : 0), 0);
  const pendingEid = filteredKidding.filter(r => !r.eidApplied && r.birthOutcome?.includes("live")).length;

  const printKidding = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Kidding Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Kidding Records${kiddingYearFilter !== "all" ? ` — ${kiddingYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Doe LIS Tag</th><th>Outcome</th><th>Kids</th><th>Ease</th><th>EID Applied</th></tr></thead><tbody>${filteredKidding.map(r => `<tr><td>${fmt(r.kiddingDate)}</td><td>${r.doeLisTag || "—"}</td><td>${r.birthOutcome?.replace(/-/g, " ") || "—"}</td><td>${r.kidCount ?? 1} × ${r.kidSex || "?"}</td><td>${r.easeScore ?? "—"}</td><td>${r.eidApplied ? "Yes" : "Pending"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        <strong>LIS Tagging:</strong> Goat EID tags must be applied before first movement off the holding. Record EID application date and LIS tag number for each kid.
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Litters Recorded</p><p className="text-2xl font-bold text-gray-800">{filteredKidding.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Live Kids</p><p className="text-2xl font-bold text-green-700">{liveCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">EID Pending</p><p className={`text-2xl font-bold ${pendingEid > 0 ? "text-amber-700" : "text-gray-400"}`}>{pendingEid}</p></CardContent></Card>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">Kidding Records</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={kiddingYearFilter} onValueChange={setKiddingYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{kiddingYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printKidding}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filteredKidding.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No kidding records yet.</p></div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Doe LIS Tag</th><th className="py-2 px-3 text-left">Outcome</th><th className="py-2 px-3 text-left">Kids</th><th className="py-2 px-3 text-left">Ease</th><th className="py-2 px-3 text-left">EID</th><th className="py-2 px-3 text-left"></th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
          <tbody>{filteredKidding.map(r => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-medium">{fmt(r.kiddingDate)}</td>
              <td className="py-2 px-3 font-mono text-xs">{r.doeLisTag || "—"}</td>
              <td className="py-2 px-3 capitalize">{r.birthOutcome?.replace(/-/g, " ") || "—"}</td>
              <td className="py-2 px-3">{r.kidCount ?? 1} × {r.kidSex || "?"}</td>
              <td className="py-2 px-3"><EaseScoreBadge v={r.easeScore} /></td>
              <td className="py-2 px-3">{r.eidApplied ? <span className="text-green-700 font-medium text-xs">✓ Applied</span> : <span className="text-amber-600 text-xs font-medium">Pending</span>}</td>
              <td className="py-2 px-3"><DocAttach farmId={farmId} endpoint="goat-dairy/kidding-records" recordId={r.id} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["goat-dairy-kidding", String(farmId)]} compact /></td>
              <td className="py-2 px-3"><div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Kidding Record — {fmt(viewRec.kiddingDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe LIS Tag</p><p className="font-mono font-medium">{viewRec.doeLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Outcome</p><p className="font-medium capitalize">{viewRec.birthOutcome?.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Kid Count</p><p className="font-medium">{viewRec.kidCount ?? 1}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sex</p><p className="font-medium capitalize">{viewRec.kidSex || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Weight (kg)</p><p className="font-medium">{viewRec.kidBirthWeightKg || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><EaseScoreBadge v={viewRec.easeScore} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EID Applied</p><p className="font-medium">{viewRec.eidApplied ? `Yes — ${fmt(viewRec.eidAppliedDate)}` : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">LIS Tag Number</p><p className="font-mono font-medium">{viewRec.lisTagNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRec.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRec.colostrumGivenWithin2Hours === false ? "No" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe Milking Status</p><p className="font-medium capitalize">{viewRec.doeMilkingStatus || "—"}</p></div>
              {viewRec.doeComplications && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe Complications</p><p className="font-medium">{viewRec.doeComplications}</p></div>}
              {viewRec.vetAttended && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet</p><p className="font-medium">{viewRec.vetName || "Attended"}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="goat-dairy-kidding" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Kidding Record" : "Add Kidding Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Kidding Date *</Label><Input type="date" value={String(form.kiddingDate || "").slice(0, 10)} onChange={e => set("kiddingDate", e.target.value)} /></div>
            <div><Label>Doe LIS Tag</Label><Input value={form.doeLisTag || ""} onChange={e => set("doeLisTag", e.target.value)} /></div>
            <div><Label>Birth Outcome *</Label>
              <Select value={form.birthOutcome || "live-single"} onValueChange={v => set("birthOutcome", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="live-single">Live — single</SelectItem><SelectItem value="live-twins">Live — twins</SelectItem><SelectItem value="live-triplets">Live — triplets</SelectItem><SelectItem value="stillborn">Stillborn</SelectItem><SelectItem value="mummified">Mummified</SelectItem><SelectItem value="abortion">Abortion</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Kid Count</Label><Input type="number" min="1" value={form.kidCount || 1} onChange={e => set("kidCount", parseInt(e.target.value))} /></div>
            <div><Label>Sex</Label>
              <Select value={form.kidSex || "__none__"} onValueChange={v => set("kidSex", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not recorded</SelectItem><SelectItem value="doe">Doe kid</SelectItem><SelectItem value="buck">Buck kid</SelectItem><SelectItem value="mixed">Mixed</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Birth Weight (kg)</Label><Input type="number" step="0.1" value={form.kidBirthWeightKg || ""} onChange={e => set("kidBirthWeightKg", e.target.value)} /></div>
            <div><Label>Ease Score</Label>
              <Select value={String(form.easeScore || "")} onValueChange={v => set("easeScore", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent><SelectItem value="1">1 — Unassisted</SelectItem><SelectItem value="2">2 — Minor assistance</SelectItem><SelectItem value="3">3 — Major assistance</SelectItem><SelectItem value="4">4 — Vet required</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">LIS Tagging</p></div>
            <div><Label>Kid EID Tag</Label><Input value={form.kidEidTag || ""} onChange={e => set("kidEidTag", e.target.value)} /></div>
            <div><Label>LIS Tag Number</Label><Input value={form.lisTagNumber || ""} onChange={e => set("lisTagNumber", e.target.value)} /></div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" className="rounded" checked={!!form.eidApplied} onChange={e => set("eidApplied", e.target.checked)} id="gd-eid" />
              <label htmlFor="gd-eid" className="text-sm cursor-pointer">EID tag applied</label>
              {form.eidApplied && <Input type="date" className="ml-2 w-40" value={String(form.eidAppliedDate || "").slice(0, 10)} onChange={e => set("eidAppliedDate", e.target.value)} />}
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Colostrum & Doe</p></div>
            <div><Label>Colostrum Given ≤2h</Label>
              <Select value={form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no"} onValueChange={v => set("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not recorded</SelectItem><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Doe Milking Status</Label>
              <Select value={form.doeMilkingStatus || "__none__"} onValueChange={v => set("doeMilkingStatus", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="good">Good let-down</SelectItem><SelectItem value="poor">Poor let-down</SelectItem><SelectItem value="agalactia">Agalactia</SelectItem><SelectItem value="mastitis">Mastitis</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Doe Complications</Label><Input value={form.doeComplications || ""} onChange={e => set("doeComplications", e.target.value)} /></div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.vetAttended} onChange={e => set("vetAttended", e.target.checked)} />Vet attended</label>
            </div>
            {form.vetAttended && <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} /></div>}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Body Condition Scoring ────────────────────────────────────────────────────

interface BcsRecord {
  id: number; assessmentDate: string; assessedBy?: string | null; assessmentStage?: string | null;
  doeLisTag?: string | null; bcsScore?: string | null; actionRequired?: string | null;
  followUpDate?: string | null; notes?: string | null;
}

export function BcsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BcsRecord | null>(null);
  const [viewRec, setViewRec] = useState<BcsRecord | null>(null);
  const blank: Partial<BcsRecord> = { assessmentDate: today() };
  const [form, setForm] = useState<Partial<BcsRecord>>(blank);
  const set = (k: keyof BcsRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-bcs", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/bcs-records`)).then(r => r.json()) });
  const records: BcsRecord[] = data?.records ?? [];

  const bcsYears = useMemo(() => {
    const s = new Set<string>(records.map(r => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [bcsYearFilter, setBcsYearFilter] = usePersistedFilter({ page: "goat-dairy-bcs", filter: "year", farmId, defaultValue: "all" });
  const filteredBcs = useMemo(() => bcsYearFilter === "all" ? records : records.filter(r => String(r.assessmentDate || "").startsWith(bcsYearFilter)), [records, bcsYearFilter]);

  const printBcs = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>BCS Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Body Condition Scoring Records${bcsYearFilter !== "all" ? ` — ${bcsYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Doe LIS Tag</th><th>Stage</th><th>BCS</th><th>Action Required</th><th>Assessed By</th></tr></thead><tbody>${filteredBcs.map(r => `<tr><td>${fmt(r.assessmentDate)}</td><td>${r.doeLisTag || "—"}</td><td>${r.assessmentStage || "—"}</td><td>${r.bcsScore || "—"}</td><td>${r.actionRequired || "None"}</td><td>${r.assessedBy || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  const save = useMutation({
    mutationFn: (body: Partial<BcsRecord>) => fetch(api(`farms/${farmId}/goat-dairy/bcs-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-bcs", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/bcs-records/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-bcs", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const bcsChartData = useMemo(() => {
    const byDate: Record<string, { label: string; scores: number[] }> = {};
    [...records].sort((a, b) => String(a.assessmentDate).localeCompare(String(b.assessmentDate))).forEach(r => {
      const key = String(r.assessmentDate || "").slice(0, 7);
      if (key.length !== 7) return;
      const label = new Date(key + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!byDate[key]) byDate[key] = { label, scores: [] };
      const s = parseFloat(r.bcsScore || "");
      if (!isNaN(s)) byDate[key].scores.push(s);
    });
    return Object.keys(byDate).sort().map(k => ({ label: byDate[k].label, avgBcs: byDate[k].scores.length ? parseFloat((byDate[k].scores.reduce((a, b) => a + b, 0) / byDate[k].scores.length).toFixed(2)) : null }));
  }, [records]);

  return (
    <div className="space-y-4">
      {bcsChartData.length > 1 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold">BCS Trend — Average by Month</h3>
            <span className="text-xs text-gray-400">Target range: 2.5–3.5 at all stages</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={bcsChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 5]} ticks={[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`BCS ${v}`, "Avg BCS"]} />
                <Line type="monotone" dataKey="avgBcs" name="Avg BCS" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">Body Condition Scoring (1–5 scale)</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={bcsYearFilter} onValueChange={setBcsYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{bcsYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printBcs}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filteredBcs.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No BCS records yet.</p></div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide"><th className="py-2 px-3 text-left">Date</th><th className="py-2 px-3 text-left">Doe LIS Tag</th><th className="py-2 px-3 text-left">Stage</th><th className="py-2 px-3 text-left">BCS</th><th className="py-2 px-3 text-left">Action</th><th className="py-2 px-3 text-left">Assessed By</th><th className="py-2 px-3 text-left"></th><th className="py-2 px-3 text-left">Actions</th></tr></thead>
          <tbody>{filteredBcs.map(r => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 font-medium">{fmt(r.assessmentDate)}</td>
              <td className="py-2 px-3 font-mono text-xs">{r.doeLisTag || "—"}</td>
              <td className="py-2 px-3 capitalize">{r.assessmentStage || "—"}</td>
              <td className="py-2 px-3"><BcsBadge v={r.bcsScore} /></td>
              <td className="py-2 px-3 text-sm">{r.actionRequired || "None"}</td>
              <td className="py-2 px-3 text-gray-500">{r.assessedBy || "—"}</td>
              <td className="py-2 px-3"><DocAttach farmId={farmId} endpoint="goat-dairy/bcs-records" recordId={r.id} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["goat-dairy-bcs", String(farmId)]} compact /></td>
              <td className="py-2 px-3"><div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>BCS Assessment — {fmt(viewRec.assessmentDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe LIS Tag</p><p className="font-mono font-medium">{viewRec.doeLisTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Stage</p><p className="font-medium capitalize">{viewRec.assessmentStage || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BCS Score</p><BcsBadge v={viewRec.bcsScore} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{viewRec.assessedBy || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up Date</p><p className="font-medium">{fmt(viewRec.followUpDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Required</p><p className="font-medium">{viewRec.actionRequired || "None"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="goat-dairy-bcs" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit BCS Record" : "Add BCS Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Date *</Label><Input type="date" value={String(form.assessmentDate || "").slice(0, 10)} onChange={e => set("assessmentDate", e.target.value)} /></div>
            <div><Label>Doe LIS Tag</Label><Input value={form.doeLisTag || ""} onChange={e => set("doeLisTag", e.target.value)} /></div>
            <div><Label>Assessment Stage</Label>
              <Select value={form.assessmentStage || "__none__"} onValueChange={v => set("assessmentStage", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="mating">Pre-mating</SelectItem><SelectItem value="mid-pregnancy">Mid-pregnancy</SelectItem><SelectItem value="late-pregnancy">Late pregnancy</SelectItem><SelectItem value="post-kidding">Post-kidding</SelectItem><SelectItem value="weaning">Weaning</SelectItem><SelectItem value="peak-lactation">Peak lactation</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>BCS Score (1–5)</Label>
              <Select value={String(form.bcsScore || "")} onValueChange={v => set("bcsScore", v || null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Assessed By</Label><Input value={form.assessedBy || ""} onChange={e => set("assessedBy", e.target.value)} /></div>
            <div><Label>Follow-up Date</Label><Input type="date" value={String(form.followUpDate || "").slice(0, 10)} onChange={e => set("followUpDate", e.target.value)} /></div>
            <div className="col-span-2"><Label>Action Required</Label><Input value={form.actionRequired || ""} onChange={e => set("actionRequired", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Bulk Tank ─────────────────────────────────────────────────────────────────

interface BulkTank {
  id: number; name: string; location?: string | null;
  capacityLitres?: string | null; manufacturer?: string | null;
  serialNumber?: string | null; installDate?: string | null; notes?: string | null;
}
interface TankRecord {
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

const MONITOR_TYPES = [
  { value: "daily-temperature", label: "Daily Temperature Check" },
  { value: "cleaning", label: "Cleaning Record" },
  { value: "abr-test", label: "Antibiotic Residue Test" },
  { value: "maintenance", label: "Maintenance Check" },
];
const ABR_RESULTS = ["Negative", "Positive", "Borderline", "Invalid"];

export function BulkTankTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  // tank register
  const [showTanks, setShowTanks] = useState(false);
  const [tankDialog, setTankDialog] = useState(false);
  const [editingTank, setEditingTank] = useState<BulkTank | null>(null);
  const [tankForm, setTankForm] = useState({ name: "", location: "", capacityLitres: "", manufacturer: "", serialNumber: "", installDate: "", notes: "" });

  // monitoring records
  const [monDialog, setMonDialog] = useState(false);
  const [editingMon, setEditingMon] = useState<TankRecord | null>(null);
  const [monForm, setMonForm] = useState({ tankId: "", recordDate: today(), recordType: "daily-temperature", tankTemperatureCelsius: "", tankCleaned: false as boolean, cleaningProductUsed: "", cleaningProductBatch: "", antibioticResidueTestRef: "", antibioticResidueResult: "", notes: "" });
  const [monYear, setMonYear] = usePersistedFilter({ page: "goat-dairy-bulk-tank", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });

  // queries
  const tanksQ = useQuery<{ tanks: BulkTank[] }>({ queryKey: ["goat-dairy-bulk-tanks", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks`)).then(r => r.json()) });
  const tanks = tanksQ.data?.tanks ?? [];

  const monQ = useQuery<{ records: TankRecord[] }>({ queryKey: ["goat-dairy-tank-records", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records`)).then(r => r.json()) });
  const allMonRecords = monQ.data?.records ?? [];
  const monRecords = useMemo(() => allMonRecords.filter(r => new Date(r.recordDate).getFullYear() === parseInt(monYear)), [allMonRecords, monYear]);

  const collQ = useQuery<{ collections: MilkCollection[] }>({ queryKey: ["goat-dairy-milk-collections", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/milk-collections`)).then(r => r.json()) });
  const allColls = collQ.data?.collections ?? [];

  // compliance summary
  const summary = useMemo(() => {
    const yr = parseInt(monYear);
    const yrRecs = allMonRecords.filter(r => new Date(r.recordDate).getFullYear() === yr);
    const tempRecs = yrRecs.filter(r => r.recordType === "daily-temperature" && r.tankTemperatureCelsius != null);
    const tempOk = tempRecs.filter(r => parseFloat(r.tankTemperatureCelsius!) <= 4).length;
    const cleanings = yrRecs.filter(r => r.tankCleaned).length;
    const abrTests = yrRecs.filter(r => r.recordType === "abr-test").length;
    const yrColls = allColls.filter(c => new Date(c.collectionDate).getFullYear() === yr);
    const totalVol = yrColls.reduce((s, c) => s + (c.volumeCollectedLitres ? parseFloat(c.volumeCollectedLitres) : 0), 0);
    return { tempOk, tempTotal: tempRecs.length, cleanings, abrTests, totalVol, collCount: yrColls.length };
  }, [allMonRecords, allColls, monYear]);

  const years = useMemo(() => Array.from(new Set([
    ...allMonRecords.map(r => String(new Date(r.recordDate).getFullYear())),
    ...allColls.map(c => String(new Date(c.collectionDate).getFullYear())),
    String(new Date().getFullYear()),
  ])).sort((a, b) => parseInt(b) - parseInt(a)), [allMonRecords, allColls]);

  // mutations — tanks
  const saveTankM = useMutation({ mutationFn: (d: Record<string, unknown>) => editingTank ? fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks/${editingTank.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()) : fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-bulk-tanks", farmId] }); setTankDialog(false); toast({ title: editingTank ? "Tank updated" : "Tank added" }); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delTankM = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-bulk-tanks", farmId] }); toast({ title: "Tank removed" }); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  // mutations — monitoring
  const saveMonM = useMutation({ mutationFn: (d: Record<string, unknown>) => editingMon ? fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records/${editingMon.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()) : fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-tank-records", farmId] }); setMonDialog(false); toast({ title: editingMon ? "Record updated" : "Record saved" }); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delMonM = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-tank-records", farmId] }); toast({ title: "Record deleted" }); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  // helpers
  function openNewTank() { setEditingTank(null); setTankForm({ name: "", location: "", capacityLitres: "", manufacturer: "", serialNumber: "", installDate: "", notes: "" }); setTankDialog(true); }
  function openEditTank(t: BulkTank) { setEditingTank(t); setTankForm({ name: t.name, location: t.location || "", capacityLitres: t.capacityLitres || "", manufacturer: t.manufacturer || "", serialNumber: t.serialNumber || "", installDate: t.installDate || "", notes: t.notes || "" }); setTankDialog(true); }
  function openNewMon() { setEditingMon(null); setMonForm({ tankId: "", recordDate: today(), recordType: "daily-temperature", tankTemperatureCelsius: "", tankCleaned: false, cleaningProductUsed: "", cleaningProductBatch: "", antibioticResidueTestRef: "", antibioticResidueResult: "", notes: "" }); setMonDialog(true); }
  function openEditMon(r: TankRecord) { setEditingMon(r); setMonForm({ tankId: r.tankId ? String(r.tankId) : "", recordDate: r.recordDate.slice(0, 10), recordType: r.recordType, tankTemperatureCelsius: r.tankTemperatureCelsius || "", tankCleaned: r.tankCleaned || false, cleaningProductUsed: r.cleaningProductUsed || "", cleaningProductBatch: r.cleaningProductBatch || "", antibioticResidueTestRef: r.antibioticResidueTestRef || "", antibioticResidueResult: r.antibioticResidueResult || "", notes: r.notes || "" }); setMonDialog(true); }
  const tankName = (id?: number | null) => id ? (tanks.find(t => t.id === id)?.name || `Tank #${id}`) : "—";

  function generateReport() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Goat Dairy Bulk Tank Report ${monYear}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}h1{font-size:16px;margin-bottom:4px}h2{font-size:13px;margin:16px 0 6px;border-bottom:1px solid #ccc;padding-bottom:3px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#f0f0f0;padding:5px 8px;text-align:left;font-size:10px;border:1px solid #ddd}td{padding:4px 8px;border:1px solid #ddd;font-size:10px}.kpi{display:inline-block;background:#f7f7f7;border:1px solid #ddd;padding:8px 16px;border-radius:6px;margin:0 12px 8px 0}.kpi-val{font-size:18px;font-weight:bold;color:#1d4ed8}.kpi-lab{font-size:10px;color:#666}@media print{button{display:none}}</style></head><body>
<h1>Goat Dairy — Bulk Tank Report</h1>
<p style="color:#666;font-size:10px">Year: ${monYear} | Generated: ${new Date().toLocaleDateString("en-GB")}</p>
<div>
<div class="kpi"><div class="kpi-val">${summary.tempOk}/${summary.tempTotal}</div><div class="kpi-lab">Temp ≤4°C Checks</div></div>
<div class="kpi"><div class="kpi-val">${summary.cleanings}</div><div class="kpi-lab">Cleaning Records</div></div>
<div class="kpi"><div class="kpi-val">${summary.abrTests}</div><div class="kpi-lab">ABR Tests</div></div>
<div class="kpi"><div class="kpi-val">${summary.totalVol.toFixed(0)}L</div><div class="kpi-lab">Milk Collected (${summary.collCount} collections)</div></div>
</div>
<h2>Tank Monitoring Records</h2>
<table><tr><th>Date</th><th>Tank</th><th>Type</th><th>Temp (°C)</th><th>Cleaned</th><th>Cleaning Product</th><th>ABR Ref</th><th>ABR Result</th><th>Notes</th></tr>
${monRecords.map(r => `<tr><td>${fmt(r.recordDate)}</td><td>${tankName(r.tankId)}</td><td>${r.recordType.replace(/-/g," ")}</td><td>${r.tankTemperatureCelsius||"—"}</td><td>${r.tankCleaned?"Yes":"—"}</td><td>${r.cleaningProductUsed||"—"}</td><td>${r.antibioticResidueTestRef||"—"}</td><td>${r.antibioticResidueResult||"—"}</td><td>${r.notes||"—"}</td></tr>`).join("")}
</table>
<h2>Milk Collections</h2>
<table><tr><th>Date</th><th>Tank</th><th>Volume (L)</th><th>Buyer</th><th>Tanker Reg</th><th>Driver</th><th>Coll. Ref</th><th>ABR Before</th><th>Net Pay (£)</th><th>Notes</th></tr>
${allColls.filter(c => new Date(c.collectionDate).getFullYear() === parseInt(monYear)).map(c => `<tr><td>${fmt(c.collectionDate)}</td><td>${tankName(c.tankId)}</td><td>${c.volumeCollectedLitres||"—"}</td><td>${c.milkBuyer||"—"}</td><td>${c.tankerRegistration||"—"}</td><td>${c.tankerDriverName||"—"}</td><td>${c.collectionRef||"—"}</td><td>${c.abtResultBeforeCollection||"—"}</td><td>${c.netPaymentPence?"£"+(c.netPaymentPence/100).toFixed(2):"—"}</td><td>${c.notes||"—"}</td></tr>`).join("")}
</table>
<script>window.onload=()=>window.print()</script>
</body></html>`);
    w.document.close();
  }

  function TempBadge({ v }: { v?: string | null }) {
    if (!v) return <span className="text-gray-400">—</span>;
    const n = parseFloat(v);
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${n <= 4 ? "bg-green-100 text-green-800" : n <= 6 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{v}°C{n > 4 ? " ⚠" : ""}</span>;
  }

  return (
    <div className="space-y-6">
      {/* Compliance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-gray-500 mb-1">Temp ≤4°C</p><p className="text-2xl font-bold text-blue-700">{summary.tempOk}/{summary.tempTotal}</p><p className="text-xs text-gray-400">checks ({monYear})</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-gray-500 mb-1">Cleaning Records</p><p className="text-2xl font-bold text-blue-700">{summary.cleanings}</p><p className="text-xs text-gray-400">records ({monYear})</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-gray-500 mb-1">ABR Tests</p><p className="text-2xl font-bold text-blue-700">{summary.abrTests}</p><p className="text-xs text-gray-400">tests ({monYear})</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-gray-500 mb-1">Milk Collected</p><p className="text-2xl font-bold text-blue-700">{summary.totalVol.toFixed(0)}L</p><p className="text-xs text-gray-400">{summary.collCount} collections ({monYear})</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={generateReport}><Printer className="w-4 h-4 mr-1" />Print Report</Button>
      </div>

      {/* Tank Registry */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowTanks(v => !v)}>
            <h3 className="font-semibold text-gray-800 flex items-center gap-1">
              {showTanks ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Tank Registry ({tanks.length})
            </h3>
            <Button size="sm" onClick={e => { e.stopPropagation(); openNewTank(); }}><Plus className="w-4 h-4 mr-1" />Add Tank</Button>
          </div>
          {showTanks && (
            <div className="mt-3 divide-y">
              {tanks.length === 0 ? <p className="text-sm text-gray-500 py-2">No tanks registered.</p> : tanks.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{[t.location, t.capacityLitres ? `${t.capacityLitres}L` : null, t.manufacturer].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditTank(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => delTankM.mutate(t.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tank Monitoring Records */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-semibold text-gray-800">Tank Monitoring Records</h3>
            <div className="flex items-center gap-2">
              <Select value={monYear} onValueChange={setMonYear}><SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
              <Button size="sm" onClick={openNewMon}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
            </div>
          </div>
          {monQ.isLoading ? <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : monRecords.length === 0 ? <p className="text-sm text-gray-400 py-4">No monitoring records for {monYear}.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-gray-500"><th className="text-left py-2 pr-3 font-medium">Date</th><th className="text-left py-2 pr-3 font-medium">Tank</th><th className="text-left py-2 pr-3 font-medium">Type</th><th className="text-left py-2 pr-3 font-medium">Temp</th><th className="text-left py-2 pr-3 font-medium">Cleaned</th><th className="text-left py-2 pr-3 font-medium">ABR Result</th><th className="text-left py-2 font-medium">Notes</th><th></th></tr></thead>
                <tbody>
                  {monRecords.map(r => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-3 text-xs whitespace-nowrap">{fmt(r.recordDate)}</td>
                      <td className="py-2 pr-3 text-xs">{tankName(r.tankId)}</td>
                      <td className="py-2 pr-3 text-xs capitalize">{r.recordType.replace(/-/g, " ")}</td>
                      <td className="py-2 pr-3"><TempBadge v={r.tankTemperatureCelsius} /></td>
                      <td className="py-2 pr-3 text-xs">{r.tankCleaned ? <CheckCircle2 className="w-4 h-4 text-green-600 inline" /> : <span className="text-gray-400">—</span>}</td>
                      <td className="py-2 pr-3"><ResultBadge v={r.antibioticResidueResult} /></td>
                      <td className="py-2 text-xs text-gray-500 max-w-[160px] truncate">{r.notes || "—"}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <RecordAttachments recordType="goat-dairy-tank-record" recordId={r.id} farmId={farmId} compact />
                          <Button size="sm" variant="ghost" onClick={() => openEditMon(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => delMonM.mutate(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Record Dialog */}
      <Dialog open={monDialog} onOpenChange={o => { setMonDialog(o); if (!o) saveMonM.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingMon ? "Edit" : "Add"} Monitoring Record</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={monForm.recordDate} onChange={e => setMonForm(f => ({ ...f, recordDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={monForm.tankId} onValueChange={v => setMonForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank…" /></SelectTrigger>
                  <SelectContent><SelectItem value="">— None —</SelectItem>{tanks.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Record Type *</Label>
              <Select value={monForm.recordType} onValueChange={v => setMonForm(f => ({ ...f, recordType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MONITOR_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Tank Temperature (°C)</Label><Input type="number" step="0.1" placeholder="e.g. 3.5" value={monForm.tankTemperatureCelsius} onChange={e => setMonForm(f => ({ ...f, tankTemperatureCelsius: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="mon-tc" checked={monForm.tankCleaned} onChange={e => setMonForm(f => ({ ...f, tankCleaned: e.target.checked }))} className="w-4 h-4 rounded" />
              <Label htmlFor="mon-tc">Tank cleaned this session</Label>
            </div>
            {monForm.tankCleaned && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cleaning Product</Label><Input value={monForm.cleaningProductUsed} onChange={e => setMonForm(f => ({ ...f, cleaningProductUsed: e.target.value }))} /></div>
                <div><Label>Batch Number</Label><Input value={monForm.cleaningProductBatch} onChange={e => setMonForm(f => ({ ...f, cleaningProductBatch: e.target.value }))} /></div>
              </div>
            )}
            {monForm.recordType === "abr-test" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ABR Test Ref</Label><Input value={monForm.antibioticResidueTestRef} onChange={e => setMonForm(f => ({ ...f, antibioticResidueTestRef: e.target.value }))} /></div>
                <div><Label>ABR Result</Label>
                  <Select value={monForm.antibioticResidueResult} onValueChange={v => setMonForm(f => ({ ...f, antibioticResidueResult: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{ABR_RESULTS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea value={monForm.notes} onChange={e => setMonForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={saveMonM} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMonDialog(false)}>Cancel</Button>
            <Button onClick={() => saveMonM.mutate({ ...monForm, tankId: monForm.tankId || null })} disabled={saveMonM.isPending}>
              {saveMonM.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMon ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ABR Kit Stock */}
      <AbrKitStockSection farmId={farmId} />
      <AbrProcurementSection farmId={farmId} />

      {/* Tank Dialog */}
      <Dialog open={tankDialog} onOpenChange={o => { setTankDialog(o); if (!o) saveTankM.reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingTank ? "Edit" : "Add"} Bulk Tank</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Tank Name *</Label><Input value={tankForm.name} onChange={e => setTankForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Tank" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label><Input value={tankForm.location} onChange={e => setTankForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div><Label>Capacity (L)</Label><Input type="number" value={tankForm.capacityLitres} onChange={e => setTankForm(f => ({ ...f, capacityLitres: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Manufacturer</Label><Input value={tankForm.manufacturer} onChange={e => setTankForm(f => ({ ...f, manufacturer: e.target.value }))} /></div>
              <div><Label>Serial Number</Label><Input value={tankForm.serialNumber} onChange={e => setTankForm(f => ({ ...f, serialNumber: e.target.value }))} /></div>
            </div>
            <div><Label>Install Date</Label><Input type="date" value={tankForm.installDate} onChange={e => setTankForm(f => ({ ...f, installDate: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={tankForm.notes} onChange={e => setTankForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={saveTankM} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTankDialog(false)}>Cancel</Button>
            <Button onClick={() => saveTankM.mutate(tankForm)} disabled={saveTankM.isPending}>
              {saveTankM.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTank ? "Save Changes" : "Add Tank"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ─── CAE Monitoring ────────────────────────────────────────────────────────────

const CAE_LABS = [
  "SRUC Veterinary Services",
  "SAC Consulting Veterinary Services",
  "APHA Starcross (Exeter)",
  "APHA Weybridge",
  "APHA Shrewsbury",
  "Axiom Veterinary Laboratories",
  "Biobest Laboratories",
  "University of Liverpool VDL",
  "Fera Science",
  "Other",
] as const;

const CAE_ACCRED_BODIES = [
  "SGS UK (CAEV-free Scheme)",
  "British Goat Society",
  "Individual buyer scheme",
  "APHA",
  "Not enrolled in scheme",
  "Other",
] as const;

const CAE_TEST_TYPES = [
  { value: "blood-elisa", label: "Blood ELISA" },
  { value: "agar-gel-id", label: "Agar gel immunodiffusion (AGID)" },
  { value: "pcr", label: "PCR" },
  { value: "western-blot", label: "Western blot" },
  { value: "post-mortem", label: "Post-mortem / histopathology" },
] as const;

interface CaeRecord {
  id: number; testDate: string; testType: string;
  testRef?: string | null; sampledByType?: string | null;
  laboratory?: string | null; labRef?: string | null;
  animalsTestedCount?: number | null; positiveCount?: number | null;
  result?: string | null;
  caeAccreditationStatus?: string | null; accreditationBody?: string | null;
  actionTaken?: string | null; nextTestDue?: string | null; vetName?: string | null; notes?: string | null;
}

type CaeDialogMode = "log" | "result" | "edit";

const caeIsAwaiting = (r: CaeRecord) => !r.result || r.result === "";
const caeIsPostMortem = (t: string) => t === "post-mortem";

export function CaeTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CaeDialogMode>("log");
  const [editing, setEditing] = useState<CaeRecord | null>(null);
  const [viewRec, setViewRec] = useState<CaeRecord | null>(null);
  const [labOther, setLabOther] = useState("");
  const blank: Partial<CaeRecord> = { testDate: today(), testType: "blood-elisa" };
  const [form, setForm] = useState<Partial<CaeRecord>>(blank);
  const set = (k: keyof CaeRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-cae", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/cae-monitoring`)).then(r => r.json()) });
  const allRecords: CaeRecord[] = Array.isArray(data) ? data : (data?.records ?? []);

  const { data: vetData } = useQuery({ queryKey: ["vet-names", farmId], queryFn: () => fetch(api(`farms/${farmId}/vet-names`)).then(r => r.json()), enabled: open });
  const vetNames: string[] = (vetData?.vets ?? []).map((v: { vetName: string }) => v.vetName).filter(Boolean);
  const { data: staffData } = useQuery({ queryKey: ["farm-staff", farmId], queryFn: () => fetch(api(`farms/${farmId}/staff`)).then(r => r.json()), enabled: open });
  const staffNames: string[] = Array.isArray(staffData) ? staffData.map((s: { name: string }) => s.name).filter(Boolean) : [];

  const caeYears = useMemo(() => {
    const s = new Set<string>(allRecords.map(r => String(r.testDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allRecords]);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "goat-dairy-cae", filter: "year", farmId, defaultValue: "all" });
  const records = useMemo(() => yearFilter === "all" ? allRecords : allRecords.filter(r => String(r.testDate || "").startsWith(yearFilter)), [allRecords, yearFilter]);
  const latestAccred = allRecords.find(r => r.caeAccreditationStatus)?.caeAccreditationStatus;
  const awaitingCount = allRecords.filter(caeIsAwaiting).length;

  const printCae = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>CAE Monitoring</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>CAE Monitoring Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Test Type</th><th>Laboratory</th><th>Animals</th><th>Positives</th><th>Result</th><th>Next Test Due</th><th>Notes</th></tr></thead><tbody>${records.map(r => `<tr><td>${fmt(r.testDate)}</td><td>${CAE_TEST_TYPES.find(t => t.value === r.testType)?.label || r.testType}</td><td>${r.laboratory || "—"}</td><td>${r.animalsTestedCount ?? "—"}</td><td>${r.positiveCount ?? "—"}</td><td>${r.result || "Awaiting results"}</td><td>${fmt(r.nextTestDue)}</td><td>${r.notes || ""}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  const openLogTest = () => { setEditing(null); setForm({ ...blank }); setLabOther(""); setMode("log"); setOpen(true); };
  const openEnterResult = (r: CaeRecord) => { setEditing(r); setForm({ ...r }); setLabOther(""); setMode("result"); setOpen(true); };
  const openEdit = (r: CaeRecord) => { setEditing(r); setForm({ ...r }); setLabOther(""); setMode("edit"); setOpen(true); };

  const labIsKnown = CAE_LABS.slice(0, -1).includes(form.laboratory as any);
  const effectiveLab = form.laboratory === "Other" ? labOther : form.laboratory;

  const save = useMutation({
    mutationFn: (body: Partial<CaeRecord>) =>
      fetch(api(`farms/${farmId}/goat-dairy/cae-monitoring${editing ? `/${editing.id}` : ""}`), {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, laboratory: effectiveLab }),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-cae", farmId] }); setOpen(false); toast({ title: mode === "log" ? "Test event logged" : editing ? "Record updated" : "Added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-dairy/cae-monitoring/${id}`), { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-dairy-cae", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const testType = form.testType || "blood-elisa";
  const isPostMortem = caeIsPostMortem(testType);
  const vetLabel = isPostMortem ? "Examining vet" : "Sample taken by";
  const isNonNeg = !!(form.result && (form.result.includes("pos") || form.result === "inconclusive"));
  const dialogTitle = mode === "log" ? "Log CAE Test Event" : mode === "result" ? "Enter CAE Test Results" : "Edit CAE Record";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>CAE — Caprine Arthritis Encephalitis</strong> is a progressive viral disease of goats causing joint disease in adults and neurological disease in kids. Accreditation through programmes such as SGS UK CAEV-free is expected by dairy buyers and assurance bodies. <em>Log each sampling event now — enter laboratory results when the report arrives.</em>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {latestAccred && <div className="flex items-center gap-2"><span className="font-medium text-gray-600">Current accreditation:</span><ResultBadge v={latestAccred} /></div>}
        {awaitingCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />{awaitingCount} test{awaitingCount > 1 ? "s" : ""} awaiting results
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">CAE Test Records</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{caeYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printCae}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={openLogTest}><Plus className="w-4 h-4 mr-1" />Log Test Event</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="font-medium">No CAE monitoring records yet.</p>
          <p className="text-xs mt-1">Use "Log Test Event" to record a blood draw or sampling event. Enter results once your laboratory report arrives.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Ref</th>
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Test Type</th>
              <th className="py-2 px-3 text-left">Laboratory</th>
              <th className="py-2 px-3 text-left">Animals</th>
              <th className="py-2 px-3 text-left">Result</th>
              <th className="py-2 px-3 text-left">Next Test</th>
              <th className="py-2 px-3 text-left">Actions</th>
            </tr></thead>
            <tbody>{records.map(r => (
              <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 ${caeIsAwaiting(r) ? "bg-amber-50/50" : ""}`}>
                <td className="py-2 px-3 text-xs font-mono text-gray-400">{r.testRef || "—"}</td>
                <td className="py-2 px-3 font-medium">{fmt(r.testDate)}</td>
                <td className="py-2 px-3 text-xs">{CAE_TEST_TYPES.find(t => t.value === r.testType)?.label || r.testType?.replace(/-/g, " ")}</td>
                <td className="py-2 px-3 text-xs text-gray-500">{r.laboratory || "—"}</td>
                <td className="py-2 px-3">{r.animalsTestedCount != null ? r.animalsTestedCount : "—"}</td>
                <td className="py-2 px-3">
                  {caeIsAwaiting(r)
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Awaiting results</span>
                    : <ResultBadge v={r.result} />}
                </td>
                <td className="py-2 px-3 text-xs text-gray-500">{fmt(r.nextTestDue)}</td>
                <td className="py-2 px-3">
                  <div className="flex gap-1 items-center">
                    {caeIsAwaiting(r) && (
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2 text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => openEnterResult(r)}>
                        Enter result
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "34rem" }}>
            <DialogHeader>
              <DialogTitle>CAE Test — {fmt(viewRec.testDate)}</DialogTitle>
              {viewRec.testRef && <p className="text-xs font-mono text-muted-foreground pt-0.5">{viewRec.testRef}</p>}
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Type</p><p className="font-medium">{CAE_TEST_TYPES.find(t => t.value === viewRec.testType)?.label || viewRec.testType}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Laboratory</p><p className="font-medium">{viewRec.laboratory || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Reference</p><p className="font-medium">{viewRec.labRef || "—"}</p></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{caeIsPostMortem(viewRec.testType) ? "Examining Vet" : "Sample Taken By"}</p>
                <p className="font-medium">{viewRec.vetName || "—"}</p>
                {viewRec.sampledByType && !caeIsPostMortem(viewRec.testType) && <p className="text-xs text-gray-400">{viewRec.sampledByType === "vet" ? "Veterinary surgeon" : viewRec.sampledByType === "staff" ? "Farm staff member" : "Other"}</p>}
              </div>
              {!caeIsPostMortem(viewRec.testType) && <>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animals Tested</p><p className="font-medium">{viewRec.animalsTestedCount ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Positives</p><p className={`font-medium ${(viewRec.positiveCount ?? 0) > 0 ? "text-red-700" : ""}`}>{viewRec.positiveCount ?? "—"}</p></div>
              </>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Result</p>
                {caeIsAwaiting(viewRec) ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Awaiting results</span> : <ResultBadge v={viewRec.result} />}
              </div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">CAE Accreditation</p><ResultBadge v={viewRec.caeAccreditationStatus} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Accreditation Body</p><p className="font-medium">{viewRec.accreditationBody || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">{fmt(viewRec.nextTestDue)}</p></div>
              {viewRec.actionTaken && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Taken</p><p className="font-medium">{viewRec.actionTaken}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="goat-dairy-cae" recordId={viewRec.id} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRec(null)}>Close</Button>
              {caeIsAwaiting(viewRec) && <Button variant="outline" onClick={() => { openEnterResult(viewRec); setViewRec(null); }}>Enter Result</Button>}
              <Button onClick={() => { openEdit(viewRec); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            {mode === "log" && <p className="text-xs text-muted-foreground pt-1">Record the sampling event now. Return to enter laboratory results once they arrive.</p>}
            {mode === "result" && <p className="text-xs text-muted-foreground pt-1">Test from <strong>{fmt(editing?.testDate)}</strong> · {CAE_TEST_TYPES.find(t => t.value === editing?.testType)?.label} · {editing?.laboratory || "lab not recorded"}</p>}
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">

            {(mode === "log" || mode === "edit") && <>
              <div><Label>Test Date *</Label><Input type="date" value={String(form.testDate || "").slice(0, 10)} onChange={e => set("testDate", e.target.value)} /></div>
              <div><Label>Test Type *</Label>
                <Select value={testType} onValueChange={v => set("testType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CAE_TEST_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!isPostMortem && <>
                <div>
                  <Label>Laboratory</Label>
                  <Select value={labIsKnown ? form.laboratory! : form.laboratory ? "Other" : ""} onValueChange={v => { set("laboratory", v || null); if (v !== "Other") setLabOther(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select lab…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      {CAE_LABS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {form.laboratory === "Other" && (
                  <div><Label>Specify laboratory</Label><Input value={labOther} onChange={e => setLabOther(e.target.value)} placeholder="Laboratory name" /></div>
                )}
                  <div><Label>Animals Tested</Label><Input type="number" min="0" value={form.animalsTestedCount ?? ""} onChange={e => set("animalsTestedCount", e.target.value ? parseInt(e.target.value) : null)} /></div>
              </>}
              <div className="col-span-2">
                <Label>{vetLabel}</Label>
                <div className="space-y-1.5 mt-1">
                  {!isPostMortem && (
                    <Select value={form.sampledByType || ""} onValueChange={v => { set("sampledByType", v || null); set("vetName", null); }}>
                      <SelectTrigger><SelectValue placeholder="Who took the sample?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vet">Veterinary surgeon</SelectItem>
                        <SelectItem value="staff">Farm staff member</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {(isPostMortem || form.sampledByType === "vet") && vetNames.length > 0 && (
                    <Select value={vetNames.includes(form.vetName || "") ? (form.vetName || "") : ""} onValueChange={v => set("vetName", v || null)}>
                      <SelectTrigger><SelectValue placeholder={isPostMortem ? "Select examining vet…" : "Select vet from ledger…"} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">— Not listed, type below —</SelectItem>
                        {vetNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {form.sampledByType === "staff" && staffNames.length > 0 && (
                    <Select value={staffNames.includes(form.vetName || "") ? (form.vetName || "") : ""} onValueChange={v => set("vetName", v || null)}>
                      <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">— Not listed, type below —</SelectItem>
                        {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {(isPostMortem || form.sampledByType) && (
                    <Input
                      value={form.vetName || ""}
                      onChange={e => set("vetName", e.target.value)}
                      placeholder={
                        isPostMortem ? "Examining vet name" :
                        form.sampledByType === "vet" ? "Vet name (or select above)" :
                        form.sampledByType === "staff" ? "Staff member name (or select above)" :
                        "Name or description"
                      }
                    />
                  )}
                </div>
              </div>
            </>}

            {(mode === "result" || mode === "edit") && <>
              {!isPostMortem && <div><Label>Lab Reference No.</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} placeholder="Lab report reference" /></div>}
              {!isPostMortem && mode === "result" && <div><Label>Animals Tested</Label><Input type="number" min="0" value={form.animalsTestedCount ?? ""} onChange={e => set("animalsTestedCount", e.target.value ? parseInt(e.target.value) : null)} /></div>}
              {!isPostMortem && <div><Label>Positives</Label><Input type="number" min="0" value={form.positiveCount ?? ""} onChange={e => set("positiveCount", e.target.value ? parseInt(e.target.value) : null)} /></div>}
              <div><Label>Result</Label>
                <Select value={form.result || ""} onValueChange={v => set("result", v || null)}>
                  <SelectTrigger><SelectValue placeholder="Select result…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negative">Negative (all clear)</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive</SelectItem>
                    <SelectItem value="caev-free">CAEV-free certified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isNonNeg && (
                <div className="col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span><strong>Non-negative result:</strong> Vet consultation, biosecurity review, and segregation of any seropositive animals are required. Document actions taken below.</span>
                </div>
              )}
              <div><Label>CAE Accreditation Status</Label>
                <Select value={form.caeAccreditationStatus || "__none__"} onValueChange={v => set("caeAccreditationStatus", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No change / not applicable</SelectItem>
                    <SelectItem value="caev-free">CAEV-free certified</SelectItem>
                    <SelectItem value="provisional">Provisional accreditation</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="not-accredited">Not accredited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Accreditation Body</Label>
                <Select value={CAE_ACCRED_BODIES.includes(form.accreditationBody as any) ? form.accreditationBody! : form.accreditationBody ? "Other" : "__none__"} onValueChange={v => set("accreditationBody", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not applicable</SelectItem>
                    {CAE_ACCRED_BODIES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Next Test Due</Label><Input type="date" value={String(form.nextTestDue || "").slice(0, 10)} onChange={e => set("nextTestDue", e.target.value)} /></div>
              <div className="col-span-2">
                <Label>{isNonNeg ? "Action Taken *" : "Action Taken"}</Label>
                <Input value={form.actionTaken || ""} onChange={e => set("actionTaken", e.target.value)} placeholder={isNonNeg ? "Required — describe biosecurity / management actions" : "e.g. All clear — no action required"} className={isNonNeg && !form.actionTaken ? "border-red-300" : ""} />
              </div>
            </>}

            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Additional notes" /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {mode === "log" ? "Log Test Event" : mode === "result" ? "Save Results" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Assurance Tab ─────────────────────────────────────────────────────────────

export function AssuranceTab() {
  const [, navigate] = useLocation();
  return (
    <div className="space-y-4">
      {/* Assurance register link */}
      <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-indigo-800 mb-1">Assurance Certificates Register</h3>
          <p className="text-sm text-indigo-700">Your farm's assurance memberships and certificates (BGS, organic bodies, buyer schemes etc.) are stored in the <strong>Inspections → Assurance Certificates</strong> tab. Record expiry dates, certificate numbers, and upload copies there.</p>
        </div>
        <button
          onClick={() => navigate("/inspections?tab=assurance-certs")}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          Open Register <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* BGS */}
      <div className="rounded-md border border-green-100 bg-green-50 p-4">
        <h3 className="font-semibold text-green-800 mb-1">British Goat Society (BGS)</h3>
        <p className="text-sm text-green-700">The BGS is the UK body supporting dairy goat producers with herd recording, breed standards, and quality assurance. BGS milk recording data supports SCC compliance monitoring. Record BGS membership and certificate details in the Assurance Certificates register (link above).</p>
        <a href="https://www.britishgoatsociety.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-green-800 underline hover:text-green-900">Visit British Goat Society ↗</a>
      </div>

      {/* CAE */}
      <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
        <h3 className="font-semibold text-amber-800 mb-1">CAE Accreditation</h3>
        <p className="text-sm text-amber-700">Several UK buyers require goat milk to come from CAEV-free or CAE accredited herds. Accreditation bodies include SGS UK and veterinary laboratories. Keep annual test records and accreditation certificates here and upload copies using the document attachment on each test record.</p>
      </div>

      {/* NMR */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-700 mb-1">National Milk Records (NMR)</h3>
        <p className="text-sm text-gray-600">NMR is a separate statutory milk recording service that sends recording officers to the farm and provides SCC analysis, yield data, and quality trend reporting. NMR does not offer a public developer API — data exchange with NMR is handled through their own systems and cannot currently be automated from BDE Farm Trac. Your milk collection records within this app serve your own compliance audit trail and are independent of any NMR submission.</p>
        <a href="https://www.nmr.co.uk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-gray-700 underline hover:text-gray-900">Visit National Milk Records ↗</a>
      </div>
    </div>
  );
}
