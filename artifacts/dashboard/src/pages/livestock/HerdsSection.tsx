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

export function HerdsSection({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const livestockSpecies = useLookupStrings("livestock_species", ANIMAL_SPECIES_FALLBACK);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHerd, setEditingHerd] = useState<Herd | null>(null);
  const [viewHerd, setViewHerd] = useState<Herd | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_HERD>(EMPTY_HERD);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  const baseUrl = `/api/farms/${farmId}/herds`;

  const { data, isLoading } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: Herd[] }>;
    },
  });

  const { data: countsData } = useQuery({
    queryKey: ["animal-counts-by-herd", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/animal-counts-by-herd`);
      if (!res.ok) return { counts: [] };
      return res.json() as Promise<{ counts: { herdId: number | null; total: number; male: number; female: number }[] }>;
    },
  });

  const countByHerd: Record<number, { total: number; male: number; female: number }> = {};
  for (const c of countsData?.counts ?? []) {
    if (c.herdId != null) countByHerd[c.herdId] = { total: c.total, male: c.male, female: c.female };
  }

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setShowForm(false); setFormData(EMPTY_HERD); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setEditingHerd(null); setShowForm(false); setFormData(EMPTY_HERD); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const records: Herd[] = data?.records ?? [];
  const filtered = records.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(h: Herd) {
    setEditingHerd(h);
    setFormData({
      name: h.name ?? "", type: h.type ?? "", productionType: h.productionType ?? "", breed: h.breed ?? "", herdNumber: h.herdNumber ?? "",
      registrationDocumentUrl: h.registrationDocumentUrl ?? "", registrationDocumentName: h.registrationDocumentName ?? "",
      notes: h.notes ?? "",
      isOrganicHerd: (h as any).isOrganicHerd ?? false,
      organicCertBody: (h as any).organicCertBody ?? "",
      organicCertNumber: (h as any).organicCertNumber ?? "",
      organicConversionStartDate: (h as any).organicConversionStartDate ? new Date((h as any).organicConversionStartDate).toISOString().slice(0, 10) : "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...formData };
    if (editingHerd) { updateMutation.mutate({ id: editingHerd.id, body }); }
    else { createMutation.mutate(body); }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const herdNumConfig = getHerdNumberConfig(formData.type);

  const { uploadFile: uploadDoc, isUploading: isUploadingDoc } = useUpload({
    onSuccess: (response) => {
      const fileName = (response as { objectPath?: string; filename?: string }).filename
        ?? (response as { objectPath?: string }).objectPath?.split("/").pop()
        ?? "Registration document";
      setFormData(f => ({
        ...f,
        registrationDocumentUrl: (response as { objectPath?: string }).objectPath ?? "",
        registrationDocumentName: fileName,
      }));
    },
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search herds..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => setPrintOpen(true)} disabled={records.length === 0} className="gap-2">
            <Printer className="w-4 h-4" /> Print Register
          </Button>
          <Button onClick={() => { setEditingHerd(null); setFormData(EMPTY_HERD); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Herd / Flock
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-5">
            <h3 className="font-semibold text-base mb-4">{editingHerd ? "Edit Herd / Flock" : "New Herd / Flock"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Species <span className="text-red-500">*</span></label>
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value, productionType: "" }))} required>
                    <option value="">Select species...</option>
                    {livestockSpecies.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                {PRODUCTION_TYPE_OPTIONS[canonicalHerdSpecies(formData.type)] && (
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Production Type</label>
                    <select
                      className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      value={(formData as any).productionType ?? ""}
                      onChange={e => setFormData(f => ({ ...f, productionType: e.target.value }))}
                    >
                      <option value="">Not specified</option>
                      {PRODUCTION_TYPE_OPTIONS[canonicalHerdSpecies(formData.type)].map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Specifies what this herd is farmed for — used to filter herds correctly in Welfare Outcome Assessments and reports.</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Name <span className="text-red-500">*</span></label>
                  <Input
                    placeholder={formData.type ? getHerdNamePlaceholder(formData.type) : "e.g. Main Dairy Herd"}
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Breed</label>
                  <Input
                    placeholder={formData.type ? getBreedPlaceholder(formData.type) : "e.g. Holstein Friesian"}
                    value={formData.breed}
                    onChange={e => setFormData(f => ({ ...f, breed: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">{herdNumConfig.label}</label>
                  <Input
                    placeholder={herdNumConfig.placeholder}
                    value={formData.herdNumber}
                    onChange={e => setFormData(f => ({ ...f, herdNumber: e.target.value }))}
                  />
                  {formData.type && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                      <FileText className="w-3 h-3 mt-0.5 shrink-0 text-blue-500" />
                      {herdNumConfig.hint}
                    </p>
                  )}
                  {!formData.type && (
                    <p className="text-xs text-muted-foreground mt-1">Select a species above to see which official number applies.</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Official Registration Document</label>
                  {formData.registrationDocumentUrl ? (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-4 h-4 text-green-700 shrink-0" />
                      <span className="text-sm text-green-800 font-medium flex-1 truncate">{formData.registrationDocumentName || "Document attached"}</span>
                      <a href={formData.registrationDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">View</a>
                      <button type="button" onClick={() => setFormData(f => ({ ...f, registrationDocumentUrl: "", registrationDocumentName: "" }))} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                      {isUploadingDoc ? (
                        <><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Uploading…</span></>
                      ) : (
                        <><Upload className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Upload registration letter, BCMS letter, or herd/flock number document</span></>
                      )}
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadDoc(e.target.files[0]); }} />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Attach a photo or scan of the official letter or certificate for easy access during inspections.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                  <Input placeholder="Any additional notes" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
                </div>

                {/* ─── Organic Certification ───────────────────────────────── */}
                <div className="md:col-span-2 pt-1">
                  <div className={`rounded-xl border-2 p-4 transition-colors ${(formData as any).isOrganicHerd ? "border-green-400 bg-green-50" : "border-dashed border-border"}`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData as any).isOrganicHerd ?? false}
                        onChange={e => setFormData(f => ({ ...f, isOrganicHerd: e.target.checked }))}
                        className="w-5 h-5 rounded accent-green-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Organic Certified / In Conversion Herd</p>
                        <p className="text-xs text-muted-foreground">Enables organic compliance tracking, doubled withdrawal periods, and certifier notifications across all modules.</p>
                      </div>
                    </label>
                    {(formData as any).isOrganicHerd && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground/70 mb-1 block">Certifying Body</label>
                          <select
                            className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            value={(formData as any).organicCertBody ?? ""}
                            onChange={e => setFormData(f => ({ ...f, organicCertBody: e.target.value }))}
                          >
                            <option value="">Select certifier...</option>
                            <option value="Soil Association">Soil Association</option>
                            <option value="OF&G">OF&G (Organic Farmers &amp; Growers)</option>
                            <option value="Organic Food Federation">Organic Food Federation (OFF)</option>
                            <option value="Biodynamic Association">Biodynamic Association</option>
                            <option value="SOPA">SOPA (Scottish Organic Producers Association)</option>
                            <option value="QWFC">Quality Welsh Food Certification (QWFC)</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground/70 mb-1 block">Certification / Licence Number</label>
                          <Input placeholder="e.g. SA-CERT-12345" value={(formData as any).organicCertNumber ?? ""} onChange={e => setFormData(f => ({ ...f, organicCertNumber: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground/70 mb-1 block">Conversion Start Date</label>
                          <Input type="date" value={(formData as any).organicConversionStartDate ?? ""} onChange={e => setFormData(f => ({ ...f, organicConversionStartDate: e.target.value }))} />
                          <p className="text-xs text-muted-foreground mt-1">The date this herd/flock entered organic conversion. Used to enforce the 12-month minimum conversion period.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingHerd(null); setFormData(EMPTY_HERD); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingHerd ? "Update" : "Save Herd"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No herds registered</h3>
              <p className="text-foreground/50 text-sm">{search ? "No records match your search." : "Register your first herd or flock to get started."}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Name</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Species</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Breed</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Head Count</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Herd No.</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Doc</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => {
                  const cnt = countByHerd[h.id];
                  return (
                  <tr key={h.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{h.name}</td>
                    <td className="p-4 text-sm text-foreground/70">
                      {h.type ? (
                        <span className="inline-flex flex-col gap-0">
                          <span>{herdSpeciesDisplayLabel(h.type)}</span>
                          {herdProductionSubtype(h.type, h.productionType) && (
                            <span className="text-xs text-muted-foreground/60 leading-tight">{herdProductionSubtype(h.type, h.productionType)}</span>
                          )}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-4 text-sm text-foreground/70">{h.breed || "—"}</td>
                    <td className="p-4 text-sm text-foreground/70">
                      {cnt ? (
                        <span>
                          <span className="font-semibold text-foreground">{cnt.total}</span>
                          {(cnt.male > 0 || cnt.female > 0) && (
                            <span className="ml-1 text-xs text-muted-foreground">♂{cnt.male} / ♀{cnt.female}</span>
                          )}
                        </span>
                      ) : <span className="text-muted-foreground/40 text-xs">—</span>}
                    </td>
                    <td className="p-4 text-sm font-mono text-foreground/70">{h.herdNumber || "—"}</td>
                    <td className="p-4 text-sm">
                      {h.registrationDocumentUrl
                        ? <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5"><FileText className="w-3 h-3" />Doc</span>
                        : <span className="text-muted-foreground/40 text-xs">—</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewHerd(h)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(h)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(h.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ); })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {viewHerd && (
        <Dialog open onOpenChange={() => setViewHerd(null)}>
          <DialogContent style={{ maxWidth: 440 }}>
            <DialogHeader><DialogTitle>Herd Record</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Name</p><p className="font-medium">{viewHerd.name}</p></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Species</p>
                  <p>{viewHerd.type ? herdSpeciesDisplayLabel(viewHerd.type) : "—"}{viewHerd.type && herdProductionSubtype(viewHerd.type, viewHerd.productionType) ? <span className="ml-1 text-xs text-gray-400">({herdProductionSubtype(viewHerd.type, viewHerd.productionType)})</span> : null}</p>
                </div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Breed</p><p>{viewHerd.breed || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Herd Number</p><p className="font-mono text-xs">{viewHerd.herdNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><p>{viewHerd.isActive ? "Active" : "Inactive"}</p></div>
              </div>
              {viewHerd.registrationDocumentUrl && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Registration Document</p>
                  <a href={viewHerd.registrationDocumentUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <FileText className="w-4 h-4" />{viewHerd.registrationDocumentName || "View document"}
                  </a>
                </div>
              )}
              {viewHerd.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewHerd.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewHerd); setViewHerd(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewHerd(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMutation.reset(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Herd Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printOpen && (
        <PrintHerdRegisterDialog
          farmId={farmId}
          herds={records}
          onClose={() => setPrintOpen(false)}
        />
      )}
    </>
  );
}

