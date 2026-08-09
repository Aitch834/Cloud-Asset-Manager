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
import { api, formatDate, today } from "./shared";

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
  buyerSccThousands?: number | null; buyerBactoscanThousands?: number | null;
  buyerTvcCfuMl?: number | null; buyerThermsCfuMl?: number | null;
  buyerColiformsCfuMl?: number | null;
  buyerFatPercent?: string | null; buyerProteinPercent?: string | null;
  buyerCaseinPercent?: string | null; buyerLactosePercent?: string | null;
  buyerUreaMillimolesPerLitre?: string | null;
  notes?: string | null;
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

export function BulkTankTab({ farmId, showCollections = true }: { farmId: number; showCollections?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [pendingDelColl, setPendingDelColl] = useState<number | null>(null);

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
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delTank = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/tanks/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tanks", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAddTank() { setEditingTank(null); setTankForm({}); setTankDialog(true); }
  function openEditTank(t: BulkTank) { setEditingTank(t); setTankForm({ ...t }); setTankDialog(true); }

  // ── Monitoring records ─────────────────────────────────────────────────────
  const [monDialog, setMonDialog] = useState(false);
  const [editingMon, setEditingMon] = useState<BulkTankRecord | null>(null);
  const [viewMon, setViewMon] = useState<BulkTankRecord | null>(null);
  const [monForm, setMonForm] = useState<Partial<BulkTankRecord>>({});
  const [monYearFilter, setMonYearFilter] = usePersistedFilter({ page: "dairy-bulk-tank", filter: "year", farmId, defaultValue: "all" });

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
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delMon = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/bulk-tank-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-tank-records", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAddMon() { setEditingMon(null); setMonForm({ recordDate: today(), recordType: "daily-temperature" }); setMonDialog(true); }
  function openEditMon(r: BulkTankRecord) { setEditingMon(r); setMonForm({ ...r, recordDate: r.recordDate.slice(0, 10) }); setMonDialog(true); }
  function setMon(k: keyof BulkTankRecord, v: unknown) { setMonForm(f => ({ ...f, [k]: v })); }

  // ── Milk collections ──────────────────────────────────────────────────────
  const [collDialog, setCollDialog] = useState(false);
  const [editingColl, setEditingColl] = useState<MilkCollection | null>(null);
  const [collForm, setCollForm] = useState<Partial<MilkCollection>>({});
  const [showCollQuality, setShowCollQuality] = useState(false);

  const collQ = useQuery<{ collections: MilkCollection[] }>({
    queryKey: ["dairy-milk-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-collections`), { credentials: "include" }).then(r => r.json()),
  });

  const saveColl = useMutation({
    mutationFn: (body: Partial<MilkCollection>) => {
      const url = editingColl ? api(`farms/${farmId}/dairy/milk-collections/${editingColl.id}`) : api(`farms/${farmId}/dairy/milk-collections`);
      return fetch(url, { method: editingColl ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] }); setCollDialog(false); setEditingColl(null); setCollForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delColl = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/milk-collections/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk-collections", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAddColl() { setEditingColl(null); setCollForm({ collectionDate: today() }); setShowCollQuality(false); setCollDialog(true); }
  function openEditColl(c: MilkCollection) {
    setEditingColl(c);
    setCollForm({ ...c, collectionDate: c.collectionDate.slice(0, 10) });
    setShowCollQuality(!!(c.buyerSccThousands || c.buyerBactoscanThousands || c.buyerFatPercent));
    setCollDialog(true);
  }
  function setColl(k: keyof MilkCollection, v: unknown) { setCollForm(f => ({ ...f, [k]: v })); }

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
      <Dialog open={tankDialog} onOpenChange={o => { setTankDialog(o); if (!o) saveTank.reset(); }}>
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
          <DialogMutationError mutation={saveTank} message="Failed to save — your entries are still here." />
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
      <Dialog open={monDialog} onOpenChange={o => { setMonDialog(o); if (!o) saveMon.reset(); }}>
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
          <DialogMutationError mutation={saveMon} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMonDialog(false)}>Cancel</Button>
            <Button onClick={() => saveMon.mutate(monForm)} disabled={saveMon.isPending || !monForm.recordDate}>
              {saveMon.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingMon ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCollections && (<>
      {/* ── Section 3: Milk Collections ──────────────────────────────────────── */}
      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div>
            <h3 className="font-semibold text-sm text-gray-800">Milk Collections ({collRecords.length})</h3>
            <p className="text-xs text-gray-500 mt-0.5">Record each milk uplift with volumes, financial settlement, and buyer quality results.</p>
          </div>
          <Button size="sm" onClick={openAddColl}>
            <Plus className="h-4 w-4 mr-1" />Log Collection
          </Button>
        </div>
        {collQ.isLoading
          ? <div className="p-4"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>
          : collRecords.length === 0
            ? <div className="px-4 py-6 text-center text-sm text-gray-400 italic">No milk collections recorded yet.</div>
            : <div className="divide-y">
              {[...collRecords].sort((a, b) => b.collectionDate.localeCompare(a.collectionDate)).map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-medium text-sm">{formatDate(c.collectionDate)}</span>
                    {c.tankId && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tankName(c.tankId)}</span>}
                    {c.milkBuyer && <span className="text-xs text-gray-500">{c.milkBuyer}</span>}
                    {c.volumeCollectedLitres && <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{parseFloat(String(c.volumeCollectedLitres)).toLocaleString()} L</span>}
                    {c.pencePerLitre && <span className="text-xs text-gray-400">{parseFloat(String(c.pencePerLitre)).toFixed(2)}ppl</span>}
                    {c.buyerSccThousands != null && <span className={`text-xs px-2 py-0.5 rounded ${c.buyerSccThousands < 100 ? "bg-green-50 text-green-700" : c.buyerSccThousands < 200 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>SCC: {c.buyerSccThousands}k</span>}
                    {c.buyerBactoscanThousands != null && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Bact: {c.buyerBactoscanThousands}k</span>}
                    {c.buyerTvcCfuMl != null && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">TVC: {c.buyerTvcCfuMl.toLocaleString()}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditColl(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setPendingDelColl(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* ── Milk Collections Dialog ────────────────────────────────────────────── */}
      <Dialog open={collDialog} onOpenChange={o => { setCollDialog(o); if (!o) saveColl.reset(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingColl ? "Edit" : "Log"} Milk Collection</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Collection Details</p></div>
            <div><Label>Collection Date *</Label><Input type="date" value={collForm.collectionDate || ""} onChange={e => setColl("collectionDate", e.target.value)} /></div>
            <div>
              <Label>Bulk Tank</Label>
              <Select value={String(collForm.tankId ?? "__none__")} onValueChange={v => setColl("tankId", v === "__none__" ? null : parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— No tank</SelectItem>{tanks.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Volume Collected (L)</Label><Input type="number" step="0.1" value={collForm.volumeCollectedLitres ?? ""} onChange={e => setColl("volumeCollectedLitres", e.target.value)} placeholder="e.g. 8500" /></div>
            <div><Label>Milk Buyer</Label><Input value={collForm.milkBuyer || ""} onChange={e => setColl("milkBuyer", e.target.value)} placeholder="e.g. Müller, Arla" /></div>
            <div><Label>Tanker Registration</Label><Input value={collForm.tankerRegistration || ""} onChange={e => setColl("tankerRegistration", e.target.value)} /></div>
            <div><Label>Tanker Driver</Label><Input value={collForm.tankerDriverName || ""} onChange={e => setColl("tankerDriverName", e.target.value)} /></div>
            <div><Label>Collection Ref</Label><Input value={collForm.collectionRef || ""} onChange={e => setColl("collectionRef", e.target.value)} /></div>
            <div><Label>Statement Ref</Label><Input value={collForm.statementRef || ""} onChange={e => setColl("statementRef", e.target.value)} /></div>
            <div className="col-span-2"><Label>ABR Result (pre-collection)</Label><Input value={collForm.abtResultBeforeCollection || ""} onChange={e => setColl("abtResultBeforeCollection", e.target.value)} placeholder="e.g. Negative" /></div>

            <div className="col-span-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1">Financial Settlement</p></div>
            <div><Label>Pence per Litre</Label><Input type="number" step="0.01" value={collForm.pencePerLitre ?? ""} onChange={e => setColl("pencePerLitre", e.target.value)} placeholder="e.g. 35.50" /></div>
            <div><Label>Gross Value (£)</Label><Input type="number" step="0.01" value={collForm.grossValuePence != null ? (collForm.grossValuePence / 100).toFixed(2) : ""} onChange={e => setColl("grossValuePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} placeholder="e.g. 3018.00" /></div>
            <div><Label>Quality Bonus (£)</Label><Input type="number" step="0.01" value={collForm.qualityBonusPence != null ? (collForm.qualityBonusPence / 100).toFixed(2) : ""} onChange={e => setColl("qualityBonusPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
            <div><Label>Quality Penalty (£)</Label><Input type="number" step="0.01" value={collForm.qualityPenaltyPence != null ? (collForm.qualityPenaltyPence / 100).toFixed(2) : ""} onChange={e => setColl("qualityPenaltyPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
            <div><Label>Transport Deduction (£)</Label><Input type="number" step="0.01" value={collForm.transportDeductionPence != null ? (collForm.transportDeductionPence / 100).toFixed(2) : ""} onChange={e => setColl("transportDeductionPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
            <div><Label>Net Payment (£)</Label><Input type="number" step="0.01" value={collForm.netPaymentPence != null ? (collForm.netPaymentPence / 100).toFixed(2) : ""} onChange={e => setColl("netPaymentPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>

            <div className="col-span-2">
              <button type="button" className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium" onClick={() => setShowCollQuality(v => !v)}>
                <FlaskConical className="h-3.5 w-3.5" />{showCollQuality ? "Hide" : "Add"} Buyer Quality Results
              </button>
            </div>
            {showCollQuality && <>
              <div className="col-span-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-0.5">Buyer Quality Results</p></div>
              <div><Label>Buyer SCC (k/mL)</Label><Input type="number" min="0" value={collForm.buyerSccThousands ?? ""} onChange={e => setColl("buyerSccThousands", e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g. 120" /></div>
              <div><Label>Bactoscan (k/mL)</Label><Input type="number" min="0" value={collForm.buyerBactoscanThousands ?? ""} onChange={e => setColl("buyerBactoscanThousands", e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g. 15" /></div>
              <div><Label>TVC (cfu/mL)</Label><Input type="number" min="0" value={collForm.buyerTvcCfuMl ?? ""} onChange={e => setColl("buyerTvcCfuMl", e.target.value ? parseInt(e.target.value) : null)} /></div>
              <div><Label>Thermodurics (cfu/mL)</Label><Input type="number" min="0" value={collForm.buyerThermsCfuMl ?? ""} onChange={e => setColl("buyerThermsCfuMl", e.target.value ? parseInt(e.target.value) : null)} /></div>
              <div><Label>Coliforms (cfu/mL)</Label><Input type="number" min="0" value={collForm.buyerColiformsCfuMl ?? ""} onChange={e => setColl("buyerColiformsCfuMl", e.target.value ? parseInt(e.target.value) : null)} /></div>
              <div><Label>Buyer Fat%</Label><Input type="number" step="0.01" value={collForm.buyerFatPercent ?? ""} onChange={e => setColl("buyerFatPercent", e.target.value)} placeholder="e.g. 4.15" /></div>
              <div><Label>Buyer Protein%</Label><Input type="number" step="0.01" value={collForm.buyerProteinPercent ?? ""} onChange={e => setColl("buyerProteinPercent", e.target.value)} placeholder="e.g. 3.30" /></div>
              <div><Label>Buyer Casein%</Label><Input type="number" step="0.01" value={collForm.buyerCaseinPercent ?? ""} onChange={e => setColl("buyerCaseinPercent", e.target.value)} placeholder="e.g. 2.60" /></div>
              <div><Label>Buyer Lactose%</Label><Input type="number" step="0.01" value={collForm.buyerLactosePercent ?? ""} onChange={e => setColl("buyerLactosePercent", e.target.value)} placeholder="e.g. 4.70" /></div>
              <div><Label>Buyer Urea (mmol/L)</Label><Input type="number" step="0.1" value={collForm.buyerUreaMillimolesPerLitre ?? ""} onChange={e => setColl("buyerUreaMillimolesPerLitre", e.target.value)} placeholder="e.g. 4.5" /></div>
            </>}

            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={collForm.notes || ""} onChange={e => setColl("notes", e.target.value)} /></div>
          </div>
          <DialogMutationError mutation={saveColl} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollDialog(false)}>Cancel</Button>
            <Button onClick={() => saveColl.mutate(collForm)} disabled={saveColl.isPending || !collForm.collectionDate}>
              {saveColl.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingColl ? "Save Changes" : "Log Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </>)}

      <ConfirmDialog
        open={pendingDelColl !== null}
        title="Delete collection record"
        message="Delete this collection record?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={delColl}
        onConfirm={() => { if (pendingDelColl !== null) delColl.mutate(pendingDelColl, { onSuccess: () => setPendingDelColl(null) }); }}
        onCancel={() => { setPendingDelColl(null); delColl.reset(); }}
      />

    </div>
  );
}

