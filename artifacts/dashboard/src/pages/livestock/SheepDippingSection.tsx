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


// ─── Sheep Dipping Records ─────────────────────────────────────────────────────

interface SheepDippingRecord { id: number; farmId: number; dipDate: string; productName: string; mappNumber: string | null; activeIngredient: string | null; dipType: string; dipConcentrationPct: string | null; volumeOfDipLitres: string | null; sheepCount: number; herdFlockRef: string | null; operatorName: string; operatorCertNumber: string | null; operatorCertExpiry: string | null; bathFillDate: string | null; daysSinceLastUse: number | null; topUpVolumeAdded: string | null; disposalMethod: string | null; disposalQuantityLitres: string | null; disposalDate: string | null; disposalContractorName: string | null; disposalWasteTransferNoteRef: string | null; withdrawalPeriodDays: number | null; withdrawalClearDate: string | null; stockItemId: number | null; quantityUsed: string | null; stockItemName: string | null; stockItemUnit: string | null; stockItemStorageLocation: string | null; documentPath: string | null; documentUrl: string | null; documentName: string | null; notes: string | null; }
interface DipStockItem { id: number; name: string; stockType: string; mappNumber: string | null; unit: string | null; storageLocation: string | null; isActive: boolean; }
interface DipCert { id: number; userId: string; certificateType: string; certificateNumber: string | null; expiryDate: string | null; }

const EMPTY_DIP: Omit<SheepDippingRecord, "id" | "farmId" | "stockItemName" | "stockItemUnit" | "stockItemStorageLocation"> = { dipDate: "", productName: "", mappNumber: null, activeIngredient: null, dipType: "plunge", dipConcentrationPct: null, volumeOfDipLitres: null, sheepCount: 0, herdFlockRef: null, operatorName: "", operatorCertNumber: null, operatorCertExpiry: null, bathFillDate: null, daysSinceLastUse: null, topUpVolumeAdded: null, disposalMethod: null, disposalQuantityLitres: null, disposalDate: null, disposalContractorName: null, disposalWasteTransferNoteRef: null, withdrawalPeriodDays: null, withdrawalClearDate: null, stockItemId: null, quantityUsed: null, documentPath: null, documentUrl: null, documentName: null, notes: null };

export function SheepDippingSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/sheep-dipping-records`;
  const { data, isLoading } = useQuery<{ records: SheepDippingRecord[] }>({ queryKey: ["sheep-dipping", farmId], queryFn: () => fetch(base).then(r => r.json()) });
  const records = data?.records ?? [];
  const [yearFilterDip, setYearFilterDip] = usePersistedFilter({ page: "livestock-dip", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsDip = useMemo(() => Array.from(new Set(records.map(r => String(r.dipDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredDipRecords = yearFilterDip === "all" ? records : records.filter(r => String(r.dipDate ?? "").startsWith(yearFilterDip));

  const { data: stockData } = useQuery<{ records: DipStockItem[] }>({ queryKey: ["stock-items", farmId], queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then(r => r.json()) });
  const chemicalItems = (stockData?.records ?? []).filter(s => s.isActive);

  const { data: herdsData } = useQuery<{ herds: { id: number; name: string; species: string; herdFlockMark: string | null }[] }>({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()) });
  const sheepHerds = (herdsData?.herds ?? []).filter(h => h.species === "sheep" || h.species === "goat");

  const { data: certsData } = useQuery<{ records: DipCert[] }>({
    queryKey: ["staff-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then(r => r.ok ? r.json() : { records: [] }),
  });
  const allCerts = certsData?.records ?? [];
  const PESTICIDE_TYPES = ["PA1", "PA2", "PA3", "PA4", "PA6", "PA6AW", "Safe use of pesticides", "Safe use of rodenticides"];

  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter(m => m.isActive !== false);
  const staffNames = activeMembers.map(memberFullName);

  function getCertForOperator(name: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const certs = allCerts.filter(c => c.userId === name && PESTICIDE_TYPES.some(t => c.certificateType.startsWith(t)));
    if (certs.length === 0) return null;
    const valid = certs.filter(c => !c.expiryDate || new Date(c.expiryDate) >= today);
    return valid.length > 0
      ? valid.sort((a, b) => (b.expiryDate ?? "").localeCompare(a.expiryDate ?? ""))[0]
      : certs.sort((a, b) => (b.expiryDate ?? "").localeCompare(a.expiryDate ?? ""))[0];
  }

  const [viewItem, setViewItem] = useState<SheepDippingRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SheepDippingRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_DIP>({ ...EMPTY_DIP });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pendingDoc, setPendingDoc] = useState<{ path: string; name: string } | null>(null);
  const dipDocRef = useRef<HTMLInputElement>(null);
  const { uploadFile: uploadDipDoc, isUploading: isUploadingDipDoc } = useUpload();
  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const selectedStockItem = chemicalItems.find(s => s.id === form.stockItemId) ?? null;

  const createMut = useMutation({ mutationFn: (b: typeof EMPTY_DIP) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] }); qc.invalidateQueries({ queryKey: ["stock-items", farmId] }); setShowForm(false); setForm({ ...EMPTY_DIP }); setPendingDoc(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b: typeof EMPTY_DIP & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] }); setShowForm(false); setEditing(null); setPendingDoc(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] }); setDeleteId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  function openEdit(r: SheepDippingRecord) { setEditing(r); setPendingDoc(null); setForm({ dipDate: r.dipDate, productName: r.productName, mappNumber: r.mappNumber ?? null, activeIngredient: r.activeIngredient ?? null, dipType: r.dipType, dipConcentrationPct: r.dipConcentrationPct ?? null, volumeOfDipLitres: r.volumeOfDipLitres ?? null, sheepCount: r.sheepCount, herdFlockRef: r.herdFlockRef ?? null, operatorName: r.operatorName, operatorCertNumber: r.operatorCertNumber ?? null, operatorCertExpiry: r.operatorCertExpiry ?? null, bathFillDate: r.bathFillDate ?? null, daysSinceLastUse: r.daysSinceLastUse, topUpVolumeAdded: r.topUpVolumeAdded ?? null, disposalMethod: r.disposalMethod ?? null, disposalQuantityLitres: r.disposalQuantityLitres ?? null, disposalDate: r.disposalDate ?? null, disposalContractorName: r.disposalContractorName ?? null, disposalWasteTransferNoteRef: r.disposalWasteTransferNoteRef ?? null, withdrawalPeriodDays: r.withdrawalPeriodDays, withdrawalClearDate: r.withdrawalClearDate ?? null, stockItemId: r.stockItemId ?? null, quantityUsed: r.quantityUsed ?? null, documentPath: r.documentPath ?? null, documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, notes: r.notes ?? null }); setShowForm(true); }

  function printReport() {
    const rows = records.map(r => `<tr><td>${formatDate(r.dipDate)}</td><td>${r.productName}</td><td>${r.dipType}</td><td>${r.sheepCount}</td><td>${r.operatorName}</td><td>${r.operatorCertNumber ?? "—"}</td><td>${r.disposalMethod ?? "—"}</td><td>${r.withdrawalPeriodDays != null ? r.withdrawalPeriodDays + " days" : "—"}</td><td>${formatDate(r.withdrawalClearDate)}</td></tr>`).join("");
    printProReport({ title: "Sheep Dipping Register", subtitle: `${records.length} dipping records`, tableHtml: `<table><thead><tr><th>Dip Date</th><th>Product</th><th>Type</th><th>Sheep Count</th><th>Operator</th><th>Cert No.</th><th>Disposal</th><th>W/drawal</th><th>Clear Date</th></tr></thead><tbody>${rows}</tbody></table>` });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Sheep Dipping Records</h3>
          <p className="text-sm text-gray-500 mt-0.5">Organophosphate and synthetic pyrethroid dipping records as required by the Control of Pesticides Regulations and Red Tractor Sheep Assurance Scheme.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterDip} onValueChange={setYearFilterDip}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsDip.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Report</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY_DIP }); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Log Dipping</Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Regulatory requirement:</strong> Operator must hold a Certificate of Competence in Safe Use of Pesticides (PA6AW or equivalent). All dip waste must be disposed of by a licensed contractor with a Waste Transfer Note. Withdrawal periods must be observed for slaughter and wool.
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        : filteredDipRecords.length === 0 ? <Card><CardContent className="py-16 text-center"><AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="font-medium text-gray-700 mb-1">No dipping records logged</p><p className="text-sm text-muted-foreground">Log your sheep dipping treatments to maintain compliance with pesticide regulations.</p></CardContent></Card>
        : <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dip Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sheep</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Operator</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Disposal</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">W/drawal Clear</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y">
                {filteredDipRecords.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{formatDate(r.dipDate)}</td>
                    <td className="px-4 py-3"><div className="font-medium text-gray-900 text-xs">{r.productName}</div>{r.mappNumber && <div className="text-xs text-muted-foreground">MAPP: {r.mappNumber}</div>}</td>
                    <td className="px-4 py-3 text-xs capitalize">{r.dipType}</td>
                    <td className="px-4 py-3 text-right">{r.sheepCount}</td>
                    <td className="px-4 py-3 text-xs">{r.operatorName}</td>
                    <td className="px-4 py-3 text-xs">{r.disposalMethod ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(r.withdrawalClearDate)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewItem(r)} title="View"><Eye className="h-3 w-3 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Sheep Dipping — {formatDate(viewItem.dipDate)}</DialogTitle><DialogDescription>{viewItem.productName} · {viewItem.sheepCount} sheep</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              {viewItem.stockItemName && <div className="col-span-2 p-2 bg-muted/40 rounded-lg flex items-center gap-2 text-xs"><Package className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{viewItem.stockItemName}</span>{viewItem.stockItemStorageLocation && <span className="text-muted-foreground">· {viewItem.stockItemStorageLocation}</span>}{viewItem.quantityUsed && <span className="ml-auto font-semibold text-destructive">−{viewItem.quantityUsed} {viewItem.stockItemUnit ?? "units"} deducted</span>}</div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dip Date</p><p className="font-medium">{formatDate(viewItem.dipDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product (MAPP)</p><p className="font-medium">{viewItem.productName}{viewItem.mappNumber && ` (${viewItem.mappNumber})`}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{viewItem.activeIngredient ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dip Type</p><p className="font-medium capitalize">{viewItem.dipType}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Concentration</p><p className="font-medium">{viewItem.dipConcentrationPct ? `${viewItem.dipConcentrationPct}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume of Dip (L)</p><p className="font-medium">{viewItem.volumeOfDipLitres ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sheep Dipped</p><p className="font-medium">{viewItem.sheepCount}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock Ref</p><p className="font-medium">{viewItem.herdFlockRef ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Operator</p><p className="font-medium">{viewItem.operatorName}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cert. Number</p><p className="font-medium font-mono">{viewItem.operatorCertNumber ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cert. Expiry</p><p className="font-medium">{formatDate(viewItem.operatorCertExpiry)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bath Fill Date</p><p className="font-medium">{formatDate(viewItem.bathFillDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Days Since Last Use</p><p className="font-medium">{viewItem.daysSinceLastUse ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Top-Up Added (L)</p><p className="font-medium">{viewItem.topUpVolumeAdded ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Method</p><p className="font-medium">{viewItem.disposalMethod ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Qty (L)</p><p className="font-medium">{viewItem.disposalQuantityLitres ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Date</p><p className="font-medium">{formatDate(viewItem.disposalDate)}</p></div>
              {viewItem.disposalContractorName && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Contractor</p><p className="font-medium">{viewItem.disposalContractorName}</p></div>}
              {viewItem.disposalWasteTransferNoteRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">WTN Reference</p><p className="font-medium font-mono">{viewItem.disposalWasteTransferNoteRef}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Period</p><p className="font-medium">{viewItem.withdrawalPeriodDays != null ? `${viewItem.withdrawalPeriodDays} days` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Clear Date</p><p className="font-medium">{formatDate(viewItem.withdrawalClearDate)}</p></div>
              {(viewItem.documentPath || viewItem.documentName) && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Document</p>
                  <a href={viewItem.documentPath ? `/api/storage${viewItem.documentPath}` : (viewItem.documentUrl ?? "#")} target="_blank" rel="noreferrer" className="text-primary text-xs underline">{viewItem.documentName || "View Document"}</a>
                </div>
              )}
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="whitespace-pre-line">{viewItem.notes}</p></div>}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); } }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Dipping Record" : "Log Sheep Dipping"}</DialogTitle><DialogDescription>Complete all fields required under Control of Pesticides Regulations and Red Tractor SAS.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">

              {/* ── Chemical Store Lookup ── */}
              <div className="col-span-2">
                <Label>Chemical Store Product <span className="text-muted-foreground font-normal text-xs">(select to auto-fill product details &amp; deduct stock)</span></Label>
                <Select
                  value={form.stockItemId != null ? String(form.stockItemId) : ""}
                  onValueChange={v => {
                    if (!v) { setF("stockItemId", null); return; }
                    const item = chemicalItems.find(s => s.id === Number(v));
                    if (item) {
                      setF("stockItemId", item.id);
                      if (item.name) setF("productName", item.name);
                      if (item.mappNumber) setF("mappNumber", item.mappNumber);
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder={chemicalItems.length === 0 ? "No stock items — enter manually below" : "Select from chemical store…"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— None / enter manually —</SelectItem>
                    {chemicalItems.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}{s.mappNumber ? ` (${s.mappNumber})` : ""}{s.storageLocation ? ` · ${s.storageLocation}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStockItem?.storageLocation && (
                  <p className="text-xs text-muted-foreground mt-1">Storage location: <span className="font-medium">{selectedStockItem.storageLocation}</span></p>
                )}
              </div>

              {selectedStockItem && (
                <div className="col-span-2">
                  <Label>Quantity Used <span className="text-muted-foreground font-normal text-xs">({selectedStockItem.unit ?? "units"} — will be deducted from stock on save)</span></Label>
                  <Input type="number" min={0} step="0.001" value={form.quantityUsed ?? ""} onChange={e => setF("quantityUsed", e.target.value || null)} placeholder={`Amount in ${selectedStockItem.unit ?? "units"}`} />
                </div>
              )}

              <div><Label>Dipping Date *</Label><Input type="date" value={form.dipDate ?? ""} onChange={e => setF("dipDate", e.target.value)} /></div>
              <div>
                <Label>Product Name (MAPP) *</Label>
                <Input value={form.productName ?? ""} onChange={e => setF("productName", e.target.value)} placeholder="e.g. Ridect Pour-On" />
                {form.stockItemId && <p className="text-xs text-muted-foreground mt-0.5">Auto-filled from chemical store — edit if needed</p>}
              </div>
              <div><Label>MAPP Number</Label><Input value={form.mappNumber ?? ""} onChange={e => setF("mappNumber", e.target.value || null)} className="font-mono" /></div>
              <div><Label>Active Ingredient</Label><Input value={form.activeIngredient ?? ""} onChange={e => setF("activeIngredient", e.target.value || null)} placeholder="e.g. Cypermethrin" /></div>
              <div><Label>Dip Type</Label>
                <Select value={form.dipType} onValueChange={v => setF("dipType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plunge">Plunge Dip</SelectItem>
                    <SelectItem value="shower">Shower / Race Dip</SelectItem>
                    <SelectItem value="pour-on">Pour-On</SelectItem>
                    <SelectItem value="spray">Hand Spray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Concentration (%)</Label><Input value={form.dipConcentrationPct ?? ""} onChange={e => setF("dipConcentrationPct", e.target.value || null)} /></div>
              <div><Label>Volume of Dip (litres)</Label><Input type="number" min={0} value={form.volumeOfDipLitres ?? ""} onChange={e => setF("volumeOfDipLitres", e.target.value || null)} /></div>
              <div><Label>Sheep Count *</Label><Input type="number" min={1} value={form.sheepCount || ""} onChange={e => setF("sheepCount", Number(e.target.value))} /></div>
              <div>
                <Label>Herd / Flock</Label>
                {sheepHerds.length > 0 ? (
                  <Select value={form.herdFlockRef ?? ""} onValueChange={v => setF("herdFlockRef", v || null)}>
                    <SelectTrigger><SelectValue placeholder="Select flock…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {sheepHerds.map(h => <SelectItem key={h.id} value={h.herdFlockMark ?? h.name}>{h.name}{h.herdFlockMark ? ` (${h.herdFlockMark})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.herdFlockRef ?? ""} onChange={e => setF("herdFlockRef", e.target.value || null)} placeholder="Flock mark / reference" />
                )}
              </div>
              <div className="col-span-2">
                <Label>Operator Name *</Label>
                <StaffSelect
                  value={form.operatorName ?? ""}
                  onChange={name => {
                    setF("operatorName", name);
                    if (name) {
                      const cert = getCertForOperator(name);
                      if (cert) {
                        setF("operatorCertNumber", cert.certificateNumber ?? null);
                        setF("operatorCertExpiry", cert.expiryDate ? cert.expiryDate.split("T")[0] : null);
                      }
                    }
                  }}
                  staffNames={staffNames}
                />
                {(() => {
                  if (!form.operatorName) return null;
                  const cert = getCertForOperator(form.operatorName);
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  if (!cert) {
                    return (
                      <p className="mt-1 text-xs text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No pesticide certificate (PA1/PA6AW/equivalent) found for this operator in the Staff &amp; Certificates register. Add one there or enter details manually below.
                      </p>
                    );
                  }
                  const expired = cert.expiryDate && new Date(cert.expiryDate) < today;
                  if (expired) {
                    return (
                      <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Certificate <span className="font-mono font-semibold">{cert.certificateNumber}</span> ({cert.certificateType}) expired {new Date(cert.expiryDate!).toLocaleDateString("en-GB")} — renewal required before operating.
                      </p>
                    );
                  }
                  return (
                    <p className="mt-1 text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {cert.certificateType} — cert number &amp; expiry auto-filled from Staff &amp; Certificates register.
                    </p>
                  );
                })()}
              </div>
              <div><Label>Cert. of Competence No.</Label><Input value={form.operatorCertNumber ?? ""} onChange={e => setF("operatorCertNumber", e.target.value || null)} className="font-mono" placeholder="PA6AW / equivalent" /></div>
              <div><Label>Cert. Expiry</Label><Input type="date" value={form.operatorCertExpiry ?? ""} onChange={e => setF("operatorCertExpiry", e.target.value || null)} /></div>
              <div><Label>Bath Fill Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.bathFillDate ?? ""} onChange={e => setF("bathFillDate", e.target.value || null)} /></div>
              <div><Label>Days Since Last Use</Label><Input type="number" min={0} value={form.daysSinceLastUse ?? ""} onChange={e => setF("daysSinceLastUse", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><Label>Top-Up Volume Added (L)</Label><Input value={form.topUpVolumeAdded ?? ""} onChange={e => setF("topUpVolumeAdded", e.target.value || null)} /></div>
              <div className="col-span-2 border-t pt-4"><p className="text-xs font-semibold text-gray-500 uppercase mb-3">Dip Waste Disposal</p></div>
              <div><Label>Disposal Method</Label>
                <Select value={form.disposalMethod ?? ""} onValueChange={v => setF("disposalMethod", v || null)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licensed-contractor">Licensed Contractor Collection</SelectItem>
                    <SelectItem value="approved-disposal-site">Approved Disposal Site</SelectItem>
                    <SelectItem value="treatment-plant">Treatment Plant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Disposal Quantity (L)</Label><Input type="number" min={0} value={form.disposalQuantityLitres ?? ""} onChange={e => setF("disposalQuantityLitres", e.target.value || null)} /></div>
              <div><Label>Disposal Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.disposalDate ?? ""} onChange={e => setF("disposalDate", e.target.value || null)} /></div>
              <div><Label>Disposal Contractor</Label><Input value={form.disposalContractorName ?? ""} onChange={e => setF("disposalContractorName", e.target.value || null)} /></div>
              <div className="col-span-2"><Label>Waste Transfer Note Ref</Label><Input value={form.disposalWasteTransferNoteRef ?? ""} onChange={e => setF("disposalWasteTransferNoteRef", e.target.value || null)} className="font-mono" /></div>
              <div className="col-span-2 border-t pt-4"><p className="text-xs font-semibold text-gray-500 uppercase mb-3">Withdrawal Period</p></div>
              <div><Label>Withdrawal Period (days)</Label><Input type="number" min={0} value={form.withdrawalPeriodDays ?? ""} onChange={e => setF("withdrawalPeriodDays", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><Label>Withdrawal Clear Date</Label><Input type="date" value={form.withdrawalClearDate ?? ""} onChange={e => setF("withdrawalClearDate", e.target.value || null)} /></div>

              {/* ── Document Upload ── */}
              <div className="col-span-2">
                <Label>Supporting Document <span className="text-muted-foreground font-normal text-xs">(MAPP label, risk assessment, waste transfer note…)</span></Label>
                <input
                  type="file"
                  ref={dipDocRef}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const upload = await uploadDipDoc(file);
                    if (upload?.objectPath) { setPendingDoc({ path: upload.objectPath, name: file.name }); setF("documentPath", upload.objectPath); setF("documentName", file.name); }
                    if (dipDocRef.current) dipDocRef.current.value = "";
                  }}
                />
                {(pendingDoc || form.documentPath || form.documentName) ? (
                  <div className="flex items-center gap-2 mt-1 p-2 border rounded text-sm">
                    <span className="text-muted-foreground">📎</span>
                    {form.documentPath ? (
                      <a href={`/api/storage${form.documentPath}`} target="_blank" rel="noreferrer" className="text-primary underline truncate flex-1">{form.documentName || "Document"}</a>
                    ) : (
                      <span className="truncate flex-1">{form.documentName || "Document"}</span>
                    )}
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPendingDoc(null); setF("documentPath", null); setF("documentName", null); }}>×</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => dipDocRef.current?.click()} disabled={isUploadingDipDoc}>
                    {isUploadingDipDoc ? "Uploading…" : "Upload Document (PDF / image)"}
                  </Button>
                )}
              </div>

              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
            </div>
            <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
            <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.dipDate || !form.productName || !form.operatorName || !form.sheepCount || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update" : "Save Dipping Record"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && <ConfirmDialog open title="Delete Dipping Record?" message="This sheep dipping record will be permanently deleted." onConfirm={() => deleteMut.mutate(deleteId!)} onCancel={() => setDeleteId(null)} confirmLabel="Delete" confirmVariant="destructive" />}
    </>
  );
}

