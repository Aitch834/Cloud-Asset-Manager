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
import { api, formatDate, today, SccBadge } from "./shared";

// ─── NMR / Milk Recording Visits ─────────────────────────────────────────────

type RecordingVisit = {
  id: number;
  herdId?: number | null;
  visitDate: string;
  recorderName?: string | null;
  recorderNumber?: string | null;
  cowsInMilk?: number | null;
  cowsRecorded?: number | null;
  avgYieldLitresPerDay?: string | null;
  avgFatPercent?: string | null;
  avgProteinPercent?: string | null;
  avgLactosePercent?: string | null;
  avgCaseinPercent?: string | null;
  avgUreaMillimolesPerLitre?: string | null;
  avgSccThousands?: number | null;
  highSccCount?: number | null;
  highSccAnimalTags?: string | null;
  qualityAlert?: string | null;
  nextVisitDate?: string | null;
  notes?: string | null;
  createdAt?: string;
};

function calcFpr(fat?: string | null, protein?: string | null): number | null {
  if (!fat || !protein) return null;
  const f = parseFloat(fat); const p = parseFloat(protein);
  if (!p) return null;
  return f / p;
}

function FprBadge({ fat, protein }: { fat?: string | null; protein?: string | null }) {
  const ratio = calcFpr(fat, protein);
  if (ratio === null) return <span className="text-gray-400">—</span>;
  const display = ratio.toFixed(2);
  let cls = "bg-green-100 text-green-800"; let tip = "Target";
  if (ratio < 1.0) { cls = "bg-red-100 text-red-800"; tip = "Acidosis Risk"; }
  else if (ratio < 1.2) { cls = "bg-amber-100 text-amber-800"; tip = "Below Target"; }
  else if (ratio > 1.5) { cls = "bg-amber-100 text-amber-800"; tip = "Check Energy"; }
  return <span className={`inline-flex gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{display} <span className="opacity-60">({tip})</span></span>;
}

export function RecordingVisitsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RecordingVisit | null>(null);
  const [viewRec, setViewRec] = useState<RecordingVisit | null>(null);
  const [form, setForm] = useState<Partial<RecordingVisit>>({});
  const [showChart, setShowChart] = useState(false);
  const [pendingDel, setPendingDel] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ visits: RecordingVisit[] }>({
    queryKey: ["dairy-recording-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/recording-visits`), { credentials: "include" }).then(r => r.json()),
  });

  const herdsQ = useQuery<{ herds: { id: number; name: string }[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const herds = herdsQ.data?.herds ?? [];

  const animalsQ = useQuery<{ animals: { id: number; earTagNumber?: string | null; tagNumber?: string | null; herdId?: number | null; animalCode?: string | null }[] }>({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const [animalSearch, setAnimalSearch] = useState("");
  const allAnimals = (animalsQ.data as any)?.animals ?? [];

  const visits = data?.visits ?? [];
  const [yearFilterVisits, setYearFilterVisits] = usePersistedFilter({ page: "dairy-recording-visits", filter: "year", farmId, defaultValue: "all" });
  const yearsVisits = React.useMemo(() => Array.from(new Set(visits.map(v => String(v.visitDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [visits]);
  const filteredVisits = yearFilterVisits === "all" ? visits : visits.filter(v => String(v.visitDate ?? "").startsWith(yearFilterVisits));

  const save = useMutation({
    mutationFn: async (body: Partial<RecordingVisit>) => {
      const url = editing
        ? api(`farms/${farmId}/dairy/recording-visits/${editing.id}`)
        : api(`farms/${farmId}/dairy/recording-visits`);
      const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-recording-visits", farmId] }); setOpen(false); setEditing(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/recording-visits/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-recording-visits", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ visitDate: today() }); setOpen(true); }
  function openEdit(v: RecordingVisit) { setEditing(v); setForm({ ...v }); setOpen(true); }
  function set(k: keyof RecordingVisit, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  // Chart data — chronological order, last 24 visits
  const chartData = [...visits].reverse().slice(-24).map(v => {
    const fpr = calcFpr(v.avgFatPercent, v.avgProteinPercent);
    return {
      date: new Date(v.visitDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      scc: v.avgSccThousands ?? null,
      fat: v.avgFatPercent != null ? parseFloat(v.avgFatPercent) : null,
      protein: v.avgProteinPercent != null ? parseFloat(v.avgProteinPercent) : null,
      lactose: v.avgLactosePercent != null ? parseFloat(v.avgLactosePercent) : null,
      fpr: fpr != null ? parseFloat(fpr.toFixed(2)) : null,
    };
  });

  const hasTrend = chartData.some(d => d.scc !== null || d.fat !== null);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">Log monthly NMR recording visits — herd average SCC, fat%, protein%, and Fat:Protein Ratio analysis.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={yearFilterVisits} onValueChange={setYearFilterVisits}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsVisits.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          {hasTrend && (
            <Button variant="outline" size="sm" onClick={() => setShowChart(v => !v)}>
              <BarChart2 className="h-4 w-4 mr-1" />{showChart ? "Hide" : "Trend"} Chart
            </Button>
          )}
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Log Visit</Button>
        </div>
      </div>

      {/* Trend Chart */}
      {showChart && hasTrend && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Herd Trends — Last {chartData.length} Recording Visits</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SCC chart */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Herd Average SCC (k/mL)</p>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v} k/mL`, "SCC"]} />
                    <ReferenceLine y={200} stroke="#f97316" strokeDasharray="5 3" strokeOpacity={0.6} label={{ value: "200k", position: "right", fontSize: 9, fill: "#f97316" }} />
                    <Bar dataKey="scc" fill="#3b82f6" fillOpacity={0.75} radius={[3, 3, 0, 0]} name="SCC" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Constituents + F:P chart */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Fat%, Protein% &amp; Fat:Protein Ratio</p>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="pct" tick={{ fontSize: 10 }} domain={[2, 6]} unit="%" />
                    <YAxis yAxisId="fpr" orientation="right" tick={{ fontSize: 10 }} domain={[0.8, 2.0]} />
                    <Tooltip formatter={(v: number, name: string) => [name === "F:P Ratio" ? v.toFixed(2) : `${v}%`, name]} />
                    <ReferenceLine yAxisId="fpr" y={1.2} stroke="#f97316" strokeDasharray="4 3" strokeOpacity={0.6} label={{ value: "FPR 1.2", position: "right", fontSize: 9, fill: "#f97316" }} />
                    <Line yAxisId="pct" type="monotone" dataKey="fat" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Fat%" connectNulls />
                    <Line yAxisId="pct" type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Protein%" connectNulls />
                    <Line yAxisId="fpr" type="monotone" dataKey="fpr" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} name="F:P Ratio" connectNulls />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">F:P Ratio target: 1.2–1.5. Below 1.2 may indicate subclinical acidosis; above 1.5 may indicate energy deficit or ketosis risk.</p>
          </CardContent>
        </Card>
      )}

      {/* Register */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading…</div>
      ) : filteredVisits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No recording visits logged yet</p>
          <p className="text-sm mt-1">Log your first NMR recording visit to start tracking herd quality trends.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Visit Date</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Recorder</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Cows Rec.</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Avg SCC</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Fat%</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Protein%</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">F:P Ratio</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Alert</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVisits.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setViewRec(v)}>
                  <td className="px-3 py-2 font-medium">{formatDate(v.visitDate)}</td>
                  <td className="px-3 py-2 text-gray-600">{v.recorderName || "—"}</td>
                  <td className="px-3 py-2 text-right">{v.cowsRecorded ?? "—"}{v.cowsInMilk ? <span className="text-gray-400 text-xs ml-1">/{v.cowsInMilk}</span> : null}</td>
                  <td className="px-3 py-2 text-right"><SccBadge v={v.avgSccThousands} /></td>
                  <td className="px-3 py-2 text-right">{v.avgFatPercent ? `${parseFloat(v.avgFatPercent).toFixed(2)}%` : "—"}</td>
                  <td className="px-3 py-2 text-right">{v.avgProteinPercent ? `${parseFloat(v.avgProteinPercent).toFixed(2)}%` : "—"}</td>
                  <td className="px-3 py-2 text-center"><FprBadge fat={v.avgFatPercent} protein={v.avgProteinPercent} /></td>
                  <td className="px-3 py-2">{v.qualityAlert ? <span className="inline-flex items-center gap-1 text-amber-700 text-xs"><AlertTriangle className="h-3 w-3" />{v.qualityAlert}</span> : <span className="text-gray-400 text-xs">—</span>}</td>
                  <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setViewRec(v)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setPendingDel(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── View Dialog ────────────────────────────────────────────────────────── */}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "52rem" }}>
            <DialogHeader>
              <DialogTitle>Recording Visit — {formatDate(viewRec.visitDate)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 text-sm overflow-y-auto max-h-[70vh]">

              {/* Visit Details */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Visit Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Visit Date</p><p className="font-medium">{formatDate(viewRec.visitDate)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Recorder Name</p><p className="font-medium">{viewRec.recorderName || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Recorder Number</p><p className="font-medium">{viewRec.recorderNumber || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Next Visit Due</p><p className="font-medium">{formatDate(viewRec.nextVisitDate)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Cows in Milk</p><p className="font-medium">{viewRec.cowsInMilk ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Cows Recorded</p><p className="font-medium">{viewRec.cowsRecorded ?? "—"}</p></div>
                </div>
              </div>

              {/* Herd Averages */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Herd Averages</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p className="text-xs text-muted-foreground">Avg Yield / Cow / Day</p><p className="font-medium">{viewRec.avgYieldLitresPerDay ? `${parseFloat(viewRec.avgYieldLitresPerDay).toFixed(1)} L` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Average Fat%</p><p className="font-medium">{viewRec.avgFatPercent ? `${parseFloat(viewRec.avgFatPercent).toFixed(2)}%` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Average Protein%</p><p className="font-medium">{viewRec.avgProteinPercent ? `${parseFloat(viewRec.avgProteinPercent).toFixed(2)}%` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Average Lactose%</p><p className="font-medium">{viewRec.avgLactosePercent ? `${parseFloat(viewRec.avgLactosePercent).toFixed(2)}%` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Average Casein%</p><p className="font-medium">{viewRec.avgCaseinPercent ? `${parseFloat(viewRec.avgCaseinPercent).toFixed(2)}%` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Average Urea</p><p className="font-medium">{viewRec.avgUreaMillimolesPerLitre ? `${parseFloat(viewRec.avgUreaMillimolesPerLitre).toFixed(1)} mmol/L` : "—"}</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Herd Avg SCC</p>
                    <SccBadge v={viewRec.avgSccThousands} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fat:Protein Ratio</p>
                    <FprBadge fat={viewRec.avgFatPercent} protein={viewRec.avgProteinPercent} />
                  </div>
                </div>
              </div>

              {/* High-SCC Animals */}
              {(viewRec.highSccCount || viewRec.highSccAnimalTags) && (
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">High-SCC Animals (&gt;200k)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-muted-foreground">Count Above 200k</p><p className="font-medium text-amber-700">{viewRec.highSccCount ?? "—"}</p></div>
                  </div>
                  {viewRec.highSccAnimalTags && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Animals Selected</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewRec.highSccAnimalTags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="inline-flex px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quality Alert / Notes */}
              {(viewRec.qualityAlert || viewRec.notes) && (
                <div className="border-t pt-4 space-y-2">
                  {viewRec.qualityAlert && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div><p className="text-xs font-semibold text-amber-700 mb-0.5">Quality Alert</p><p className="text-sm text-amber-800">{viewRec.qualityAlert}</p></div>
                    </div>
                  )}
                  {viewRec.notes && (
                    <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm whitespace-pre-line">{viewRec.notes}</p></div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Add / Edit Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Log"} Recording Visit</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            <div><Label>Visit Date *</Label><Input type="date" value={form.visitDate || ""} onChange={e => set("visitDate", e.target.value)} /></div>
            <div>
              <Label>Herd</Label>
              <Select value={String(form.herdId ?? "__none__")} onValueChange={v => set("herdId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select herd (optional)" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— All herds</SelectItem>{herds.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Recorder Name</Label><Input value={form.recorderName || ""} onChange={e => set("recorderName", e.target.value)} placeholder="NMR recorder's name" /></div>
            <div><Label>Recorder Number</Label><Input value={form.recorderNumber || ""} onChange={e => set("recorderNumber", e.target.value)} placeholder="NMR employee number" /></div>
            <div><Label>Cows in Milk</Label><Input type="number" min="0" value={form.cowsInMilk ?? ""} onChange={e => set("cowsInMilk", e.target.value)} /></div>
            <div><Label>Cows Recorded</Label><Input type="number" min="0" value={form.cowsRecorded ?? ""} onChange={e => set("cowsRecorded", e.target.value)} /></div>

            <div className="col-span-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1">NMR Report Results</p></div>
            <div><Label>Avg Yield / Cow / Day (L)</Label><Input type="number" step="0.1" value={form.avgYieldLitresPerDay ?? ""} onChange={e => set("avgYieldLitresPerDay", e.target.value)} placeholder="e.g. 28.5" /></div>
            <div><Label>Avg SCC (k/mL)</Label><Input type="number" min="0" value={form.avgSccThousands ?? ""} onChange={e => set("avgSccThousands", e.target.value)} placeholder="e.g. 150" /></div>
            <div><Label>Avg Fat%</Label><Input type="number" step="0.01" value={form.avgFatPercent ?? ""} onChange={e => set("avgFatPercent", e.target.value)} placeholder="e.g. 4.15" /></div>
            <div><Label>Avg Protein%</Label><Input type="number" step="0.01" value={form.avgProteinPercent ?? ""} onChange={e => set("avgProteinPercent", e.target.value)} placeholder="e.g. 3.30" /></div>
            <div><Label>Avg Lactose%</Label><Input type="number" step="0.01" value={form.avgLactosePercent ?? ""} onChange={e => set("avgLactosePercent", e.target.value)} placeholder="e.g. 4.70" /></div>
            <div><Label>Avg Casein%</Label><Input type="number" step="0.01" value={form.avgCaseinPercent ?? ""} onChange={e => set("avgCaseinPercent", e.target.value)} placeholder="e.g. 2.60" /></div>
            <div><Label>Avg Urea (mmol/L)</Label><Input type="number" step="0.1" value={form.avgUreaMillimolesPerLitre ?? ""} onChange={e => set("avgUreaMillimolesPerLitre", e.target.value)} placeholder="e.g. 4.5" /></div>
            <div className="flex flex-col justify-center pt-4">
              {form.avgFatPercent && form.avgProteinPercent && (
                <div><p className="text-xs text-muted-foreground mb-1">Calculated F:P Ratio</p><FprBadge fat={form.avgFatPercent} protein={form.avgProteinPercent} /></div>
              )}
            </div>

            <div className="col-span-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-2">High-SCC Animals (&gt;200k)</p></div>
            <div><Label>Count Above 200k</Label><Input type="number" min="0" value={form.highSccCount ?? ""} onChange={e => set("highSccCount", e.target.value)} /></div>
            <div><Label>Next Visit Date</Label><Input type="date" value={form.nextVisitDate || ""} onChange={e => set("nextVisitDate", e.target.value)} /></div>
            <div className="col-span-2">
              <Label>High-SCC Animals — Livestock Register</Label>
              <p className="text-xs text-gray-400 mb-1.5 mt-0.5">Select animals flagged above 200k on this visit.</p>
              {(() => {
                const selectedTags = (form.highSccAnimalTags || "").split(",").map((t: string) => t.trim()).filter(Boolean);
                const herdAnimals = allAnimals.filter((a: any) => !form.herdId || a.herdId === form.herdId);
                const filteredA = herdAnimals.filter((a: any) => {
                  if (!animalSearch) return true;
                  const tag = (a.earTagNumber || a.tagNumber || "").toLowerCase();
                  return tag.includes(animalSearch.toLowerCase());
                });
                return (
                  <div className="border rounded-md overflow-hidden">
                    <Input placeholder="Search by ear tag…" value={animalSearch} onChange={e => setAnimalSearch(e.target.value)} className="border-0 border-b rounded-none text-sm" />
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-2 py-1.5 bg-amber-50 border-b">
                        {selectedTags.map((tag: string) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800 text-xs font-mono">
                            {tag}
                            <button type="button" className="text-amber-500 hover:text-red-600 ml-0.5 leading-none" onClick={() => {
                              const next = selectedTags.filter((t: string) => t !== tag);
                              set("highSccAnimalTags", next.join(", "));
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="max-h-36 overflow-y-auto">
                      {herdAnimals.length === 0
                        ? <p className="text-xs text-gray-400 px-3 py-2 italic">{animalsQ.isLoading ? "Loading animals…" : "No animals found — add animals to the livestock register first."}</p>
                        : filteredA.length === 0
                          ? <p className="text-xs text-gray-400 px-3 py-2 italic">No animals match your search.</p>
                          : filteredA.map((a: any) => {
                            const tag = a.earTagNumber || a.tagNumber || `Animal #${a.id}`;
                            const isSel = selectedTags.includes(tag);
                            return (
                              <button key={a.id} type="button"
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${isSel ? "bg-amber-50" : ""}`}
                                onClick={() => {
                                  const next = isSel ? selectedTags.filter((t: string) => t !== tag) : [...selectedTags, tag];
                                  set("highSccAnimalTags", next.join(", "));
                                }}
                              >
                                <span className={`h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${isSel ? "bg-amber-500 border-amber-500 text-white" : "border-gray-300 bg-white"}`}>
                                  {isSel && <Check className="h-2.5 w-2.5" />}
                                </span>
                                <span className="font-mono">{tag}</span>
                                {a.animalCode && <span className="text-gray-400">{a.animalCode}</span>}
                              </button>
                            );
                          })
                      }
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="col-span-2"><Label>Quality Alert / NMR Action Note</Label><Input value={form.qualityAlert || ""} onChange={e => set("qualityAlert", e.target.value)} placeholder="Any action note from the NMR report" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Additional observations…" /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}{editing ? "Save Changes" : "Log Visit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={pendingDel !== null}
        title="Delete recording visit"
        message="Delete this recording visit?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={del}
        onConfirm={() => { if (pendingDel !== null) del.mutate(pendingDel, { onSuccess: () => setPendingDel(null) }); }}
        onCancel={() => { setPendingDel(null); del.reset(); }}
      />
    </div>
  );
}


