// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
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

export function ThinningRecordsTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-thinning-records", "poultry-thinning");
  const tList = (records ?? []) as Record<string, unknown>[];
  const [flockFilterThin, setFlockFilterThin] = useState("all");
  const [yearFilterThin, setYearFilterThin] = useState("all");
  const yearsThin = useMemo(() => {
    const s = new Set(tList.map(r => String(r.thinningDate ?? "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [tList]);
  const filteredThinList = tList.filter(r =>
    (flockFilterThin === "all" || String(r.flockId) === flockFilterThin) &&
    (yearFilterThin === "all" || String(r.thinningDate ?? "").startsWith(yearFilterThin))
  );
  const totalBirdsRemoved = filteredThinList.reduce((s, r) => s + Number(r.birdsRemoved ?? 0), 0);
  const totalDoas = filteredThinList.reduce((s, r) => s + Number(r.doasAtLoading ?? 0), 0);
  const withWeight = filteredThinList.filter(r => r.averageLiveWeightKg != null);
  const avgLiveWeight = withWeight.length ? (withWeight.reduce((s, r) => s + Number(r.averageLiveWeightKg), 0) / withWeight.length).toFixed(2) : null;
  const doaPct = totalBirdsRemoved > 0 ? ((totalDoas / totalBirdsRemoved) * 100).toFixed(2) : null;
  const tCsv = [
    { key: "thinningDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.thinningDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "thinningNumber", label: "Thinning No." }, { key: "birdsRemoved", label: "Birds Removed" },
    { key: "doasAtLoading", label: "DOAs at Loading" }, { key: "targetLiveWeightKg", label: "Target Live Wt (kg)" },
    { key: "averageLiveWeightKg", label: "Avg Live Wt (kg)" }, { key: "destinationAbattoir", label: "Abattoir" },
    { key: "catchingContractorName", label: "Catching Contractor" }, { key: "catchingConditions", label: "Catching Conditions" },
    { key: "transportVehicleReg", label: "Vehicle Reg" }, { key: "notes", label: "Notes" },
  ];
  function printThinning() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredThinList.map(r => `<tr><td>${fmtD(r.thinningDate)}</td><td>${String(r.flockNumber ?? r.flockId ?? "—")}</td><td>${String(r.houseName ?? "—")}</td><td>${String(r.thinningNumber ?? "—")}</td><td>${String(r.birdsRemoved ?? "—")}</td><td>${String(r.doasAtLoading ?? "0")}</td><td>${String(r.averageLiveWeightKg ?? "—")}</td><td>${String(r.destinationAbattoir ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Thinning Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Thinning Records</h1><h2>${filteredThinList.length} record${filteredThinList.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Flock</th><th>House</th><th>Thinning No.</th><th>Birds Removed</th><th>DOAs</th><th>Avg Live Wt (kg)</th><th>Abattoir</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Thinning Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record each partial depletion event — numbers removed, live weight, catching details and any DOAs at loading.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredThinList, "thinning-records.csv", tCsv)} disabled={!filteredThinList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          {filteredThinList.length > 0 && <Button size="sm" variant="outline" onClick={printThinning}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ thinningNumber: "1", doasAtLoading: "0" })}><Plus className="w-4 h-4 mr-1" />Log Thinning</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={yearFilterThin} onValueChange={setYearFilterThin}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {yearsThin.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={flockFilterThin} onValueChange={setFlockFilterThin}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {!isLoading && tList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thinning Summary</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Events" value={filteredThinList.length} />
            <StatCard label="Total Birds Removed" value={totalBirdsRemoved.toLocaleString()} />
            <StatCard label="Total DOAs" value={totalDoas} color={totalDoas > 0 ? "amber" : "green"} sub={doaPct !== null ? `${doaPct}% of birds removed` : undefined} />
            <StatCard label="Avg Live Weight" value={avgLiveWeight !== null ? `${avgLiveWeight} kg` : "—"} />
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "thinningDate", label: "Date", fmt: r => fmtDate(r.thinningDate) },
          { key: "flockNumber", label: "Flock", fmt: fmtFlock },
          { key: "thinningNumber", label: "Thinning No." },
          { key: "birdsRemoved", label: "Birds Removed" },
          { key: "averageLiveWeightKg", label: "Avg Live Wt (kg)" },
          { key: "destinationAbattoir", label: "Abattoir" },
          { key: "doasAtLoading", label: "DOAs at Loading" },
          { key: "doc", label: "Doc", render: (r: Record<string, unknown>) => <DocAttach farmId={farmId} endpoint="poultry-thinning-records" recordId={r.id as number} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["poultry-thinning", farmId]} compact /> },
        ]}
        rows={filteredThinList}
        onDelete={r => del.mutate(r.id as number)}
        onView={setViewRecord}
      />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Thinning Record — {fmtDate(viewRecord.thinningDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Thinning Date</p><p className="font-medium">{fmtDate(viewRecord.thinningDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlock(viewRecord)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Thinning Number</p><p className="font-medium">{["", "1st thinning", "2nd thinning", "3rd thinning", "Final depletion"][Number(viewRecord.thinningNumber)] ?? String(viewRecord.thinningNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Removed</p><p className="font-medium">{String(viewRecord.birdsRemoved ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">DOAs at Loading</p><p className="font-medium">{String(viewRecord.doasAtLoading ?? "0")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Live Weight (kg)</p><p className="font-medium">{viewRecord.targetLiveWeightKg != null ? `${viewRecord.targetLiveWeightKg} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Average Live Weight (kg)</p><p className="font-medium">{viewRecord.averageLiveWeightKg != null ? `${viewRecord.averageLiveWeightKg} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Destination Abattoir</p><p className="font-medium">{String(viewRecord.destinationAbattoir ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Contractor</p><p className="font-medium">{String(viewRecord.catchingContractorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Start Time</p><p className="font-medium">{String(viewRecord.catchingStartTime ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching End Time</p><p className="font-medium">{String(viewRecord.catchingEndTime ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Transport Vehicle Reg</p><p className="font-medium">{String(viewRecord.transportVehicleReg ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Conditions</p><p className="font-medium">{String(viewRecord.catchingConditions ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Thinning Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Thinning Date *</Label><Input type="date" value={String(form.thinningDate ?? "")} onChange={e => setForm(f => ({ ...f, thinningDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div>
              <Label>Thinning Number *</Label>
              <Select value={String(form.thinningNumber ?? "1")} onValueChange={v => setForm(f => ({ ...f, thinningNumber: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["1st thinning", "2nd thinning", "3rd thinning", "Final depletion"].map((o, i) => <SelectItem key={o} value={String(i + 1)}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Birds Removed *</Label><Input type="number" value={String(form.birdsRemoved ?? "")} onChange={e => setForm(f => ({ ...f, birdsRemoved: e.target.value }))} /></div>
            <div><Label>DOAs at Loading</Label><Input type="number" value={String(form.doasAtLoading ?? "0")} onChange={e => setForm(f => ({ ...f, doasAtLoading: e.target.value }))} /></div>
            <div><Label>Target Live Weight (kg)</Label><Input type="number" step="0.01" value={String(form.targetLiveWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, targetLiveWeightKg: e.target.value }))} /></div>
            <div><Label>Average Live Weight (kg)</Label><Input type="number" step="0.01" value={String(form.averageLiveWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, averageLiveWeightKg: e.target.value }))} /></div>
            <div><Label>Destination Abattoir</Label><Input value={String(form.destinationAbattoir ?? "")} onChange={e => setForm(f => ({ ...f, destinationAbattoir: e.target.value }))} /></div>
            <div><Label>Catching Contractor</Label><Input value={String(form.catchingContractorName ?? "")} onChange={e => setForm(f => ({ ...f, catchingContractorName: e.target.value }))} /></div>
            <div><Label>Catching Start Time</Label><Input type="time" value={String(form.catchingStartTime ?? "")} onChange={e => setForm(f => ({ ...f, catchingStartTime: e.target.value }))} /></div>
            <div><Label>Catching End Time</Label><Input type="time" value={String(form.catchingEndTime ?? "")} onChange={e => setForm(f => ({ ...f, catchingEndTime: e.target.value }))} /></div>
            <div><Label>Transport Vehicle Reg</Label><Input value={String(form.transportVehicleReg ?? "")} onChange={e => setForm(f => ({ ...f, transportVehicleReg: e.target.value }))} /></div>
            <div>
              <Label>Catching Conditions</Label>
              <Select value={String(form.catchingConditions ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, catchingConditions: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select conditions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select conditions —</SelectItem>
                  {[
                    "Good — dark, calm conditions",
                    "Good — cool overnight temperatures",
                    "Moderate — some natural light",
                    "Moderate — light wind or breeze",
                    "Poor — high ambient temperature (heat stress risk)",
                    "Poor — wet or adverse weather",
                    "Poor — strong wind",
                    "Emergency — welfare concern raised",
                    "Other (specify in notes)",
                  ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

