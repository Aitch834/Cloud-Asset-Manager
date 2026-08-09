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

export function PlacementQualityTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [flockFilter, setFlockFilter] = usePersistedFilter({ page: "poultry-placement-quality", filter: "flock", farmId, defaultValue: "all" });

  const empty = { flockId: "", assessmentDate: new Date().toISOString().slice(0, 10), assessedBy: "", overallQualityScore: "", uniformityPercent: "", cullCountAtPlacement: "", cullPercentAtPlacement: "", arrivalTemperatureCelsius: "", hatcheryNotified: false, notes: "" };
  const [form, setForm] = useState({ ...empty });

  const assessQ = useQuery({ queryKey: ["placement-quality", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-placement-quality`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.assessments ?? [] });
  const flocksQ = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-flocks`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.flocks ?? [] });
  const assessments: any[] = assessQ.data ?? [];
  const flocks: any[] = flocksQ.data ?? [];
  const { data: pqMembersData, isLoading: pqMembersLoading } = useFarmMembers(farmId);
  const pqStaffNames = (pqMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/poultry-placement-quality`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Quality assessment saved" }); qc.invalidateQueries({ queryKey: ["placement-quality", farmId] }); setAddOpen(false); setForm({ ...empty }); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }: any) => fetch(`/api/farms/${farmId}/poultry-placement-quality/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Assessment updated" }); qc.invalidateQueries({ queryKey: ["placement-quality", farmId] }); setEditRec(null); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/poultry-placement-quality/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { toast({ title: "Assessment deleted" }); qc.invalidateQueries({ queryKey: ["placement-quality", farmId] }); setDeleteId(null); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });

  const fmtD = (d: any) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const flockName = (id: any) => { const f = flocks.find((fl: any) => String(fl.id) === String(id)); return f ? (f.flockName || f.houseNumber || `Flock #${id}`) : `Flock #${id}`; };
  const filtered = flockFilter === "all" ? assessments : assessments.filter((a: any) => String(a.flockId) === flockFilter);
  const scoreColour: Record<string, string> = { excellent: "bg-green-100 text-green-700", good: "bg-blue-100 text-blue-700", acceptable: "bg-amber-100 text-amber-700", poor: "bg-red-100 text-red-700", fail: "bg-red-200 text-red-900" };

  function openEdit(a: any) {
    setEditRec(a);
    setForm({ flockId: String(a.flockId ?? ""), assessmentDate: a.assessmentDate?.slice(0, 10) ?? "", assessedBy: a.assessedBy ?? "", overallQualityScore: a.overallQualityScore ?? "", uniformityPercent: String(a.uniformityPercent ?? ""), cullCountAtPlacement: String(a.cullCountAtPlacement ?? ""), cullPercentAtPlacement: String(a.cullPercentAtPlacement ?? ""), arrivalTemperatureCelsius: String(a.arrivalTemperatureCelsius ?? ""), hatcheryNotified: a.hatcheryNotified ?? false, notes: a.notes ?? "" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Chick / Poult Quality Assessment at Placement</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor requirement: record chick quality assessments at each placement including culls, uniformity, and arrival temperature.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
      </div>

      {flocks.length > 0 && (
        <div className="flex items-center gap-2">
          <select className="border border-input rounded-md px-3 py-1.5 text-sm bg-background" value={flockFilter} onChange={e => setFlockFilter(e.target.value)}>
            <option value="all">All Flocks</option>
            {flocks.map((f: any) => <option key={f.id} value={String(f.id)}>{flockName(f.id)}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">{filtered.length} assessment{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {assessQ.isLoading && <div className="flex justify-center py-8 text-sm text-muted-foreground gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}
      {!assessQ.isLoading && filtered.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <ClipboardCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">No quality assessments recorded</p>
          <p className="text-xs text-gray-400 mt-1">Record chick quality at each placement for full traceability.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((a: any) => {
          const isExp = expandedId === a.id;
          const sc = a.overallQualityScore ? (scoreColour[a.overallQualityScore] || "bg-gray-100 text-gray-600") : "bg-gray-100 text-gray-600";
          return (
            <div key={a.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(isExp ? null : a.id)}>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{flockName(a.flockId)} — {fmtD(a.assessmentDate)}</p>
                  <p className="text-xs text-muted-foreground">{a.assessedBy ? `by ${a.assessedBy}` : ""}{a.uniformityPercent ? ` · Uniformity ${a.uniformityPercent}%` : ""}{a.cullCountAtPlacement ? ` · ${a.cullCountAtPlacement} culls` : ""}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.overallQualityScore && <span className={`text-xs border rounded px-1.5 py-0.5 capitalize ${sc}`}>{a.overallQualityScore}</span>}
                  {a.hatcheryNotified && <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">Hatchery Notified</span>}
                  <button className="p-1 rounded hover:bg-gray-200" onClick={ev => { ev.stopPropagation(); openEdit(a); }}><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button className="p-1 rounded hover:bg-red-100" onClick={ev => { ev.stopPropagation(); setDeleteId(a.id); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {isExp && (
                <div className="border-t bg-gray-50 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Overall Quality</p><p className="capitalize">{a.overallQualityScore || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Uniformity</p><p>{a.uniformityPercent ? `${a.uniformityPercent}%` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Culls at Placement</p><p>{a.cullCountAtPlacement ?? "—"}{a.cullPercentAtPlacement ? ` (${a.cullPercentAtPlacement}%)` : ""}</p></div>
                  <div><p className="text-xs text-muted-foreground">Arrival Temperature</p><p>{a.arrivalTemperatureCelsius ? `${a.arrivalTemperatureCelsius}°C` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Hatchery Notified</p><p>{a.hatcheryNotified ? "Yes" : "No"}</p></div>
                  {a.notes && <div className="col-span-full"><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-line">{a.notes}</p></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={addOpen || !!editRec} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...empty }); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editRec ? "Edit Quality Assessment" : "Quality Assessment at Placement"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Flock *</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.flockId} onChange={e => setForm(f => ({ ...f, flockId: e.target.value }))}>
                  <option value="">Select flock…</option>
                  {flocks.map((f: any) => <option key={f.id} value={String(f.id)}>{flockName(f.id)}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Assessment Date *</Label><Input type="date" value={form.assessmentDate} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Assessed By</Label><StaffSelect value={form.assessedBy} onChange={v => setForm(f => ({ ...f, assessedBy: v }))} staffNames={pqStaffNames} loading={pqMembersLoading} /></div>
              <div><Label className="text-xs">Overall Quality Score</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.overallQualityScore} onChange={e => setForm(f => ({ ...f, overallQualityScore: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="poor">Poor</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Uniformity (%)</Label><Input type="number" min="0" max="100" step="0.1" value={form.uniformityPercent} onChange={e => setForm(f => ({ ...f, uniformityPercent: e.target.value }))} /></div>
              <div><Label className="text-xs">Arrival Temperature (°C)</Label><Input type="number" step="0.5" value={form.arrivalTemperatureCelsius} onChange={e => setForm(f => ({ ...f, arrivalTemperatureCelsius: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Culls at Placement (count)</Label><Input type="number" min="0" value={form.cullCountAtPlacement} onChange={e => setForm(f => ({ ...f, cullCountAtPlacement: e.target.value }))} /></div>
              <div><Label className="text-xs">Cull % at Placement</Label><Input type="number" min="0" max="100" step="0.01" value={form.cullPercentAtPlacement} onChange={e => setForm(f => ({ ...f, cullPercentAtPlacement: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pq-hatch" checked={form.hatcheryNotified} onChange={e => setForm(f => ({ ...f, hatcheryNotified: e.target.checked }))} />
              <Label htmlFor="pq-hatch" className="text-sm cursor-pointer">Hatchery notified of quality issues</Label>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...empty }); }}>Cancel</Button>
            <Button disabled={!form.flockId || !form.assessmentDate || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Save Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Assessment</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this quality assessment?</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Poultry Vaccination Tab ──────────────────────────────────────────────────
