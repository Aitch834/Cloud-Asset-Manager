// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

export function MortalityTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Record<string, unknown> | null>(null);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "poultry-mortality", filter: "year", farmId, defaultValue: String(CURRENT_YEAR) });
  const [flockFilterMort, setFlockFilterMort] = usePersistedFilter({ page: "poultry-mortality", filter: "flock", farmId, defaultValue: "all" });
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-daily-mortality", "poultry-mortality");

  const recordsList = (records ?? []) as Record<string, unknown>[];

  // Form-related calculations always use full recordsList regardless of year filter
  const selectedFlock = flocks.find(f => String(f.id) === String(form.flockId)) ?? null;
  const flockRecords = recordsList.filter(r =>
    String(r.flockId) === String(form.flockId) && (!editing || String(r.id) !== String((editing as Record<string, unknown>).id))
  );
  const currentRunning = flockRecords.length > 0 ? Math.max(...flockRecords.map(r => Number(r.runningTotalMortality ?? 0))) : 0;
  const todayTotal = Number(form.mortalityCount ?? 0) + Number(form.culledCount ?? 0);
  const projectedRunning = currentRunning + todayTotal;
  const placementCount = Number(selectedFlock?.placementCount ?? 0);
  const projectedPct = placementCount > 0 ? (projectedRunning / placementCount * 100) : null;

  // Year filter
  const availableYears = [...new Set(recordsList.map(r => String(r.recordDate ?? "").slice(0, 4)).filter(y => y.length === 4))].sort((a, b) => Number(b) - Number(a));
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));
  const filteredList = (yearFilter === "all" ? recordsList : recordsList.filter(r => String(r.recordDate ?? "").startsWith(yearFilter))).filter(r => flockFilterMort === "all" || String(r.flockId) === flockFilterMort);

  // Summary stats from filtered list
  const totalDeaths = filteredList.reduce((s, r) => s + Number(r.mortalityCount ?? 0), 0);
  const totalCulled = filteredList.reduce((s, r) => s + Number(r.culledCount ?? 0), 0);
  const maxPct = filteredList.length ? Math.max(...filteredList.map(r => Number(r.mortalityPercentage ?? 0))) : 0;
  const causeCounts: Record<string, number> = {};
  filteredList.forEach(r => { if (r.mainCause) { const c = String(r.mainCause); causeCounts[c] = (causeCounts[c] ?? 0) + 1; } });
  const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const flockSummaryMap: Record<string, { label: string; deaths: number; culled: number; pct: number }> = {};
  filteredList.forEach(r => {
    const key = String(r.flockId ?? "?");
    if (!flockSummaryMap[key]) flockSummaryMap[key] = { label: r.flockNumber ? `${r.flockNumber}${r.houseName ? ` · ${r.houseName}` : ""}` : key, deaths: 0, culled: 0, pct: 0 };
    flockSummaryMap[key].deaths += Number(r.mortalityCount ?? 0);
    flockSummaryMap[key].culled += Number(r.culledCount ?? 0);
    flockSummaryMap[key].pct = Math.max(flockSummaryMap[key].pct, Number(r.mortalityPercentage ?? 0));
  });
  const flockSummary = Object.values(flockSummaryMap);

  // Breed / Strain breakdown (join each record to its flock to get breed)
  const breedMap: Record<string, { deaths: number; culled: number; pct: number; flockIds: string[] }> = {};
  filteredList.forEach(r => {
    const flock = flocks.find(f => String(f.id) === String(r.flockId));
    const breed = flock?.breed ? String(flock.breed) : "Not recorded";
    if (!breedMap[breed]) breedMap[breed] = { deaths: 0, culled: 0, pct: 0, flockIds: [] };
    breedMap[breed].deaths += Number(r.mortalityCount ?? 0);
    breedMap[breed].culled += Number(r.culledCount ?? 0);
    breedMap[breed].pct = Math.max(breedMap[breed].pct, Number(r.mortalityPercentage ?? 0));
    if (!breedMap[breed].flockIds.includes(String(r.flockId ?? ""))) breedMap[breed].flockIds.push(String(r.flockId ?? ""));
  });
  const breedSummary = Object.entries(breedMap)
    .map(([breed, d]) => ({ breed, deaths: d.deaths, culled: d.culled, pct: d.pct, crops: d.flockIds.length }))
    .sort((a, b) => b.deaths - a.deaths);
  const showBreedBreakdown = breedSummary.length > 1 && breedSummary.some(b => b.breed !== "Not recorded");

  // Hatchery / supplier breakdown
  const hatcheryMap: Record<string, { deaths: number; culled: number; pct: number; flockIds: string[] }> = {};
  filteredList.forEach(r => {
    const flock = flocks.find(f => String(f.id) === String(r.flockId));
    const hatchery = flock?.hatcheryName ? String(flock.hatcheryName) : "Not recorded";
    if (!hatcheryMap[hatchery]) hatcheryMap[hatchery] = { deaths: 0, culled: 0, pct: 0, flockIds: [] };
    hatcheryMap[hatchery].deaths += Number(r.mortalityCount ?? 0);
    hatcheryMap[hatchery].culled += Number(r.culledCount ?? 0);
    hatcheryMap[hatchery].pct = Math.max(hatcheryMap[hatchery].pct, Number(r.mortalityPercentage ?? 0));
    if (!hatcheryMap[hatchery].flockIds.includes(String(r.flockId ?? ""))) hatcheryMap[hatchery].flockIds.push(String(r.flockId ?? ""));
  });
  const hatcherySummary = Object.entries(hatcheryMap)
    .map(([hatchery, d]) => ({ hatchery, deaths: d.deaths, culled: d.culled, pct: d.pct, crops: d.flockIds.length }))
    .sort((a, b) => b.deaths - a.deaths);
  const showHatcheryBreakdown = hatcherySummary.length > 1 && hatcherySummary.some(h => h.hatchery !== "Not recorded");

  // Year-by-year stats (always computed from full recordsList for the trend table)
  function calcYearStats(recs: Record<string, unknown>[]) {
    const crops = new Set(recs.map(r => String(r.flockId ?? ""))).size;
    const deaths = recs.reduce((s, r) => s + Number(r.mortalityCount ?? 0), 0);
    const culled = recs.reduce((s, r) => s + Number(r.culledCount ?? 0), 0);
    const peakPct = recs.length ? Math.max(...recs.map(r => Number(r.mortalityPercentage ?? 0))) : 0;
    return { crops, deaths, culled, peakPct };
  }
  const yearlyStats = availableYears.map(y => ({ year: y, ...calcYearStats(recordsList.filter(r => String(r.recordDate ?? "").startsWith(y))) }));
  const hasMultiYearData = yearlyStats.filter(s => s.deaths > 0 || s.culled > 0).length > 1;

  const csvCols = [
    { key: "recordDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.recordDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "mortalityCount", label: "Deaths" }, { key: "culledCount", label: "Culled" },
    { key: "runningTotalMortality", label: "Running Total" }, { key: "mortalityPercentage", label: "Mortality %" },
    { key: "mainCause", label: "Main Cause" }, { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Daily Mortality Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor Broilers: daily mortality must be recorded and retained for a minimum of 3 years.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={flockFilterMort} onValueChange={setFlockFilterMort}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All flocks</SelectItem>
              {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              <SelectItem value="all">All years</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredList, "mortality-records.csv", csvCols)} disabled={!filteredList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => openAdd({ mortalityCount: "0", culledCount: "0" })}><Plus className="w-4 h-4 mr-1" />Log Mortality</Button>
        </div>
      </div>
      {!isLoading && recordsList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mortality Summary — {yearFilter === "all" ? "All Years" : yearFilter}</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Deaths" value={totalDeaths.toLocaleString()} />
            <StatCard label="Total Culled" value={totalCulled.toLocaleString()} />
            <StatCard label="Peak Mortality %" value={`${maxPct.toFixed(2)}%`} color={maxPct > 5 ? "red" : maxPct > 3 ? "amber" : "green"} />
            <StatCard label="Top Cause" value={topCause.split(" (")[0]} sub={topCause.includes("(") ? topCause.split("(")[1]?.replace(")", "") : undefined} />
          </div>
          {flockSummary.length > 1 && (
            <div className="overflow-x-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">By Flock</p>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">Flock</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Deaths</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Culled</th><th className="text-right py-1.5 text-muted-foreground font-medium">Peak Mortality %</th></tr></thead>
                <tbody>{flockSummary.map((fs, i) => <tr key={i} className="border-b last:border-0"><td className="py-1.5 pr-4 font-medium">{fs.label}</td><td className="py-1.5 pr-4 text-right">{fs.deaths.toLocaleString()}</td><td className="py-1.5 pr-4 text-right">{fs.culled.toLocaleString()}</td><td className={`py-1.5 text-right font-semibold ${fs.pct > 5 ? "text-red-600" : fs.pct > 3 ? "text-amber-600" : "text-green-700"}`}>{fs.pct.toFixed(2)}%</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {showBreedBreakdown && (
            <div className="overflow-x-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">By Breed / Strain</p>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">Breed / Strain</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Crops</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Deaths</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Culled</th><th className="text-right py-1.5 text-muted-foreground font-medium">Peak Mort. %</th></tr></thead>
                <tbody>{breedSummary.map((bs, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-4 font-medium">{bs.breed}</td>
                    <td className="py-1.5 pr-4 text-right text-muted-foreground">{bs.crops}</td>
                    <td className="py-1.5 pr-4 text-right">{bs.deaths.toLocaleString()}</td>
                    <td className="py-1.5 pr-4 text-right">{bs.culled.toLocaleString()}</td>
                    <td className={`py-1.5 text-right font-semibold ${bs.pct > 5 ? "text-red-600" : bs.pct > 3 ? "text-amber-600" : "text-green-700"}`}>{bs.pct.toFixed(2)}%</td>
                  </tr>
                ))}</tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-1">Breed / strain is set on the Flock Register. Ensuring all flocks have a breed recorded gives the most accurate comparison.</p>
            </div>
          )}
          {showHatcheryBreakdown && (
            <div className="overflow-x-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">By Hatchery / Supplier</p>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">Hatchery / Supplier</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Crops</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Deaths</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Culled</th><th className="text-right py-1.5 text-muted-foreground font-medium">Peak Mort. %</th></tr></thead>
                <tbody>{hatcherySummary.map((hs, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-4 font-medium">{hs.hatchery}</td>
                    <td className="py-1.5 pr-4 text-right text-muted-foreground">{hs.crops}</td>
                    <td className="py-1.5 pr-4 text-right">{hs.deaths.toLocaleString()}</td>
                    <td className="py-1.5 pr-4 text-right">{hs.culled.toLocaleString()}</td>
                    <td className={`py-1.5 text-right font-semibold ${hs.pct > 5 ? "text-red-600" : hs.pct > 3 ? "text-amber-600" : "text-green-700"}`}>{hs.pct.toFixed(2)}%</td>
                  </tr>
                ))}</tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-1">Hatchery name is set on the Flock Register. Flocks with no hatchery recorded show as 'Not recorded'.</p>
            </div>
          )}
          {hasMultiYearData && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year-by-Year Mortality Trend</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Year</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Crops</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Deaths</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Culled</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Peak Mort. %</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyStats.map((s, i) => {
                    const maxRate = Math.max(...yearlyStats.map(x => x.peakPct), 0.1);
                    const barWidth = Math.round((s.peakPct / maxRate) * 100);
                    return (
                      <tr key={s.year} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium">{s.year}</td>
                        <td className="px-3 py-2 text-right">{s.crops}</td>
                        <td className="px-3 py-2 text-right">{s.deaths.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">{s.culled.toLocaleString()}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${s.peakPct > 5 ? "text-red-600" : s.peakPct > 3 ? "text-amber-600" : "text-green-700"}`}>{s.peakPct.toFixed(2)}%</td>
                        <td className="px-3 py-2 w-32">
                          <div className="h-3 bg-gray-100 rounded overflow-hidden">
                            <div className={`h-full rounded ${s.peakPct > 5 ? "bg-red-400" : s.peakPct > 3 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${barWidth}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-400">Peak mortality % is the highest cumulative rate recorded in any crop in that year. Red &gt;5% · Amber 3–5% · Green &lt;3%. Red Tractor Broilers and NatureScot schemes may query rates above scheme thresholds.</p>
              </div>
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "recordDate", label: "Date", fmt: r => fmtDate(r.recordDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "mortalityCount", label: "Deaths" },
        { key: "culledCount", label: "Culled" },
        { key: "runningTotalMortality", label: "Running Total" },
        { key: "mortalityPercentage", label: "Mortality %", fmt: r => r.mortalityPercentage ? `${Number(r.mortalityPercentage).toFixed(2)}%` : "—" },
        { key: "mainCause", label: "Main Cause" },
      ]} rows={filteredList} onEdit={r => openEdit(r)} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} onView={setViewRecord} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader><DialogTitle>Daily Mortality — {fmtDate(viewRecord.recordDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmtDate(viewRecord.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlock(viewRecord)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Deaths</p><p className="font-medium">{String(viewRecord.mortalityCount ?? "0")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Culled</p><p className="font-medium">{String(viewRecord.culledCount ?? "0")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Running Total Mortality</p><p className="font-medium">{String(viewRecord.runningTotalMortality ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mortality %</p><p className="font-medium">{viewRecord.mortalityPercentage ? `${Number(viewRecord.mortalityPercentage).toFixed(2)}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Main Cause</p><p className="font-medium">{String(viewRecord.mainCause ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              {Number(viewRecord.mortalityPercentage) > 3 && (
                <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => { setRaiseTaskFor(viewRecord); setViewRecord(null); }}><ClipboardList className="w-3.5 h-3.5 mr-1" />Raise Task</Button>
              )}
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`High Mortality Investigation — ${raiseTaskFor.mortalityPercentage ? `${Number(raiseTaskFor.mortalityPercentage).toFixed(2)}%` : "Alert"}`}
          defaultDescription={`Date: ${raiseTaskFor.recordDate ?? "—"} · Deaths: ${raiseTaskFor.mortalityCount ?? 0} · Culled: ${raiseTaskFor.culledCount ?? 0} · Cause: ${raiseTaskFor.mainCause ?? "—"}`}
          module="poultry"
        />
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Daily Mortality</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.recordDate ?? "")} onChange={e => setForm(f => ({ ...f, recordDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Deaths *</Label><Input type="number" min="0" value={String(form.mortalityCount ?? "0")} onChange={e => setForm(f => ({ ...f, mortalityCount: e.target.value }))} /></div>
            <div><Label>Culled *</Label><Input type="number" min="0" value={String(form.culledCount ?? "0")} onChange={e => setForm(f => ({ ...f, culledCount: e.target.value }))} /></div>
            {form.flockId && (
              <div className="col-span-2 rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">After this entry is saved</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Today's losses</p>
                    <p className="font-semibold">{todayTotal} birds</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Running total</p>
                    <p className="font-semibold">{projectedRunning.toLocaleString()} birds</p>
                  </div>
                  {projectedPct !== null ? (
                    <div>
                      <p className="text-muted-foreground">Mortality %</p>
                      <p className={`font-semibold ${projectedPct > 5 ? "text-red-600" : projectedPct > 3 ? "text-amber-600" : "text-green-700"}`}>
                        {projectedPct.toFixed(2)}%
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground">Mortality %</p>
                      <p className="text-muted-foreground text-xs">Set placement count on flock</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Running total and mortality % are calculated automatically — not editable.</p>
              </div>
            )}
            <div className="col-span-2">
              <Label>Main Cause of Death</Label>
              <Select value={String(form.mainCause ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, mainCause: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select cause" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select cause —</SelectItem>
                  {[
                    "Natural causes (normal losses)",
                    "Sudden Death Syndrome (SDS / Flip-over)",
                    "Ascites (Waterbelly)",
                    "Cardiovascular failure",
                    "Respiratory disease",
                    "Leg / skeletal problems",
                    "Digestive disorder",
                    "Bacterial infection",
                    "Viral disease",
                    "Injury / trauma",
                    "Cannibalism / pecking injury",
                    "Heat stress",
                    "Chilling (young chicks)",
                    "Smothering / piling",
                    "Nutritional deficiency",
                    "Unknown",
                    "Other (specify in notes)",
                  ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

