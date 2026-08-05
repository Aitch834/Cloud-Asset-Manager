import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";

export function StrawInventorySection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StrawInventory | null>(null);
  const [form, setForm] = useState<typeof EMPTY_STRAW>(EMPTY_STRAW);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: siresData } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: Sire[] }>,
  });
  const activeSires: Sire[] = (siresData?.records ?? []).filter((s: Sire) => s.isActive);

  const { data, isLoading } = useQuery({
    queryKey: ["straws", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straws`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: StrawInventory[] }>,
  });
  const straws: StrawInventory[] = data?.records ?? [];
  const [yearFilterStraws, setYearFilterStraws] = usePersistedFilter({ page: "livestock-straws", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsStraws = useMemo(() => Array.from(new Set(straws.map(r => String(r.deliveryDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [straws]);
  const filteredStraws = yearFilterStraws === "all" ? straws : straws.filter(r => String(r.deliveryDate ?? "").startsWith(yearFilterStraws));

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? `/api/farms/${farmId}/straws/${editing.id}` : `/api/farms/${farmId}/straws`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straws", farmId] }); setOpen(false); setEditing(null); setForm(EMPTY_STRAW); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/straws/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straws", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm(EMPTY_STRAW); setOpen(true); }
  function openEdit(s: StrawInventory) {
    setEditing(s);
    setForm({
      sireRegisterId: s.sireRegisterId ?? "",
      sireName: s.sireName, sireBreed: s.sireBreed ?? "", sireSpecies: s.sireSpecies,
      supplierName: s.supplierName ?? "", batchNumber: s.batchNumber,
      strawsReceived: s.strawsReceived, storageLocation: s.storageLocation ?? "",
      deliveryDate: s.deliveryDate ?? "", unitCostPence: s.unitCostPence ?? "",
      notes: s.notes ?? "",
    });
    setOpen(true);
  }

  function handleSireSelect(val: string) {
    if (val === "__none__") { setForm(f => ({ ...f, sireRegisterId: "", sireName: "", sireBreed: "" })); return; }
    const sire = activeSires.find(s => String(s.id) === val);
    if (sire) setForm(f => ({ ...f, sireRegisterId: sire.id, sireName: sire.name, sireBreed: sire.breed ?? "", sireSpecies: sire.species }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      sireRegisterId: form.sireRegisterId !== "" ? Number(form.sireRegisterId) : null,
      strawsReceived: Number(form.strawsReceived),
      unitCostPence: form.unitCostPence !== "" ? Number(form.unitCostPence) : null,
    };
    save.mutate(body);
  }

  function stockBadge(s: StrawInventory) {
    const remaining = s.strawsReceived - (s.strawsUsed ?? 0);
    if (remaining <= 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    if (remaining <= 2) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Low — {remaining} left</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{remaining} remaining</span>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Straw Inventory</h2>
          <p className="text-sm text-muted-foreground">Track AI straw deliveries by batch number — straws used are counted automatically from AI records.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterStraws} onValueChange={setYearFilterStraws}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsStraws.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Delivery</Button>
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : filteredStraws.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium">No straw deliveries logged yet</p>
          <p className="text-sm mt-1">Add your first delivery to start tracking stock and verifying batch numbers at AI service time.</p>
        </div>
      ) : (
        <>
          {/* ── Summary strip ── */}
          {(() => {
            const totalReceived = straws.reduce((s, r) => s + (r.strawsReceived ?? 0), 0);
            const totalUsed = straws.reduce((s, r) => s + (r.strawsUsed ?? 0), 0);
            const totalInStock = straws.reduce((s, r) => s + Math.max(0, (r.strawsReceived ?? 0) - (r.strawsUsed ?? 0)), 0);
            const totalCostPence = straws.reduce((s, r) => s + ((r.unitCostPence ?? 0) * (r.strawsReceived ?? 0)), 0);
            const hasCost = straws.some(r => r.unitCostPence);
            return (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ background: totalInStock > 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${totalInStock > 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalInStock > 0 ? "#15803d" : "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>In Stock</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: totalInStock > 0 ? "#14532d" : "#7f1d1d", lineHeight: 1, margin: 0 }}>{totalInStock}</p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>straw{totalInStock !== 1 ? "s" : ""}</p>
                </div>
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 100 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Received</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>{totalReceived}</p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>straws</p>
                </div>
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 100 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Used to Date</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>{totalUsed}</p>
                  <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>straws</p>
                </div>
                {hasCost && (
                  <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Stock Value</p>
                    <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>£{(totalCostPence / 100).toFixed(2)}</p>
                    <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }}>total received</p>
                  </div>
                )}
              </div>
            );
          })()}
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sire / Bull / Ram</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Batch No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Storage</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Delivered</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStraws.map(s => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.sireName}</p>
                    {s.sireBreed && <p className="text-xs text-muted-foreground">{s.sireBreed} · {s.sireSpecies}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.batchNumber}</td>
                  <td className="px-4 py-3">{s.supplierName || "—"}</td>
                  <td className="px-4 py-3">
                    {stockBadge(s)}
                    <p className="text-xs text-muted-foreground mt-0.5">{s.strawsReceived} received · {s.strawsUsed ?? 0} used</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{s.storageLocation || "—"}</td>
                  <td className="px-4 py-3 text-xs">{s.deliveryDate || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); del.reset(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove from inventory?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will mark the batch as inactive. AI records linked to it will not be affected.</p>
          <DialogMutationError mutation={del} message="Failed to remove — please try again." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && del.mutate(deleteId)} disabled={del.isPending}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm(EMPTY_STRAW); save.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Straw Batch" : "Log Straw Delivery"}</DialogTitle>
            <DialogDescription>Record the delivery details and batch number from the AI centre documentation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Sire register lookup */}
              <div className="col-span-2">
                <Label>Link to Sire Register</Label>
                <Select value={String(form.sireRegisterId || "__none__")} onValueChange={handleSireSelect}>
                  <SelectTrigger><SelectValue placeholder="Select from sire register…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Not in register / enter manually —</SelectItem>
                    {activeSires.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}{s.breed ? ` (${s.breed})` : ""}{s.tagNumber ? ` — ${s.tagNumber}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Linking to the register enables automatic donor verification. You can also enter details manually below.</p>
              </div>
              <div className="col-span-2"><Label>Donor Sire Name *</Label><Input value={form.sireName} onChange={e => setForm(f => ({ ...f, sireName: e.target.value }))} placeholder="e.g. Cogent Commander" required /></div>
              <div>
                <Label>Species *</Label>
                <Select value={form.sireSpecies} onValueChange={v => setForm(f => ({ ...f, sireSpecies: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Cattle", "Sheep", "Pig", "Goat", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Breed</Label><Input value={form.sireBreed} onChange={e => setForm(f => ({ ...f, sireBreed: e.target.value }))} placeholder={({ Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" } as Record<string, string>)[form.sireSpecies] ?? "e.g. enter breed"} /></div>
              <div><Label>Batch / Lot Number *</Label><Input value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} placeholder="As printed on straw label" required /></div>
              <div><Label>Supplier / AI Centre</Label><Input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="e.g. Cogent Breeding, Genus ABS" /></div>
              <div><Label>Straws Received</Label><Input type="number" min={0} value={form.strawsReceived} onChange={e => setForm(f => ({ ...f, strawsReceived: Number(e.target.value) }))} /></div>
              <div><Label>Storage Location</Label><Input value={form.storageLocation} onChange={e => setForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Tank 2, Goblet 3" /></div>
              <div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
              <div><Label>Unit Cost (£)</Label><Input type="number" min={0} step={0.01} value={form.unitCostPence !== "" ? Number(form.unitCostPence) / 100 : ""} onChange={e => setForm(f => ({ ...f, unitCostPence: e.target.value !== "" ? Math.round(Number(e.target.value) * 100) : "" }))} placeholder="e.g. 18.50" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Health cert reference, catalogue page, etc." /></div>
            </div>
            <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(EMPTY_STRAW); }}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
