import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

interface Herd {
  id: number;
  farmId: number;
  name: string;
  type: string;
  breed: string | null;
  herdNumber: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface VetHealthPlan {
  id: number;
  farmId: number;
  planYear: number;
  vetName: string;
  practiceName: string | null;
  practicePhone: string | null;
  practiceAddress: string | null;
  planDate: string;
  reviewDate: string | null;
  healthPriorities: string | null;
  vaccinationProtocol: string | null;
  biosecurityMeasures: string | null;
  wormingProtocol: string | null;
  flukeTreatment: string | null;
  mastitisPrevention: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_HERD = { name: "", type: "", breed: "", herdNumber: "", notes: "" };
const EMPTY_PLAN = {
  planYear: new Date().getFullYear(),
  vetName: "",
  practiceName: "",
  practicePhone: "",
  practiceAddress: "",
  planDate: new Date().toISOString().slice(0, 10),
  reviewDate: "",
  healthPriorities: "",
  vaccinationProtocol: "",
  biosecurityMeasures: "",
  wormingProtocol: "",
  flukeTreatment: "",
  mastitisPrevention: "",
  notes: "",
};

function HerdsSection({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHerd, setEditingHerd] = useState<Herd | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_HERD>(EMPTY_HERD);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const baseUrl = `/api/farms/${farmId}/herds`;

  const { data, isLoading } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: Herd[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setShowForm(false); setFormData(EMPTY_HERD); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setEditingHerd(null); setShowForm(false); setFormData(EMPTY_HERD); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["herds", farmId] }); setDeleteId(null); },
  });

  const records: Herd[] = data?.records ?? [];
  const filtered = records.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(h: Herd) {
    setEditingHerd(h);
    setFormData({ name: h.name ?? "", type: h.type ?? "", breed: h.breed ?? "", herdNumber: h.herdNumber ?? "", notes: h.notes ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...formData };
    if (editingHerd) { updateMutation.mutate({ id: editingHerd.id, body }); }
    else { createMutation.mutate(body); }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search herds..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditingHerd(null); setFormData(EMPTY_HERD); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Herd / Flock
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-5">
            <h3 className="font-semibold text-base mb-4">{editingHerd ? "Edit Herd / Flock" : "New Herd / Flock"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Name <span className="text-red-500">*</span></label>
                  <Input placeholder="e.g. Main Dairy Herd" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Species <span className="text-red-500">*</span></label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} required>
                    <option value="">Select species...</option>
                    {["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Other"].map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Breed</label>
                  <Input placeholder="e.g. Holstein Friesian" value={formData.breed} onChange={e => setFormData(f => ({ ...f, breed: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Herd / Flock Number</label>
                  <Input placeholder="e.g. 32/541/0012" value={formData.herdNumber} onChange={e => setFormData(f => ({ ...f, herdNumber: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                  <Input placeholder="Any additional notes" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
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
                  <th className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Herd No.</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => (
                  <tr key={h.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{h.name}</td>
                    <td className="p-4 text-sm capitalize text-foreground/70">{h.type || "—"}</td>
                    <td className="p-4 text-sm text-foreground/70">{h.breed || "—"}</td>
                    <td className="p-4 text-sm font-mono text-foreground/70">{h.herdNumber || "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(h)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(h.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Herd Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VetHealthPlansSection({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VetHealthPlan | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_PLAN>(EMPTY_PLAN);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const baseUrl = `/api/farms/${farmId}/vet-health-plans`;

  const { data, isLoading } = useQuery({
    queryKey: ["vet-health-plans", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ records: VetHealthPlan[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setShowForm(false); setFormData(EMPTY_PLAN); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setEditingPlan(null); setShowForm(false); setFormData(EMPTY_PLAN); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${baseUrl}/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] }); setDeleteId(null); },
  });

  const records: VetHealthPlan[] = data?.records ?? [];

  function openEdit(p: VetHealthPlan) {
    setEditingPlan(p);
    setFormData({
      planYear: p.planYear,
      vetName: p.vetName ?? "",
      practiceName: p.practiceName ?? "",
      practicePhone: p.practicePhone ?? "",
      practiceAddress: p.practiceAddress ?? "",
      planDate: p.planDate ? p.planDate.slice(0, 10) : "",
      reviewDate: p.reviewDate ? p.reviewDate.slice(0, 10) : "",
      healthPriorities: p.healthPriorities ?? "",
      vaccinationProtocol: p.vaccinationProtocol ?? "",
      biosecurityMeasures: p.biosecurityMeasures ?? "",
      wormingProtocol: p.wormingProtocol ?? "",
      flukeTreatment: p.flukeTreatment ?? "",
      mastitisPrevention: p.mastitisPrevention ?? "",
      notes: p.notes ?? "",
    });
    setShowForm(true);
  }

  function setField(key: keyof typeof EMPTY_PLAN, val: string | number) {
    setFormData(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...formData,
      planYear: Number(formData.planYear),
      planDate: formData.planDate ? new Date(formData.planDate).toISOString() : null,
      reviewDate: formData.reviewDate ? new Date(formData.reviewDate).toISOString() : null,
    };
    if (editingPlan) { updateMutation.mutate({ id: editingPlan.id, body }); }
    else { createMutation.mutate(body); }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-foreground/60">Annual veterinary health plans signed by your vet — required for Red Tractor livestock standards.</p>
        </div>
        <Button onClick={() => { setEditingPlan(null); setFormData(EMPTY_PLAN); setShowForm(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Health Plan
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-5">
            <h3 className="font-semibold text-base mb-4">{editingPlan ? "Edit Vet Health Plan" : "New Vet Health Plan"}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Plan Year <span className="text-red-500">*</span></label>
                  <Input type="number" min="2000" max="2099" value={formData.planYear} onChange={e => setField("planYear", e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Plan Date <span className="text-red-500">*</span></label>
                  <Input type="date" value={formData.planDate} onChange={e => setField("planDate", e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Review Date</label>
                  <Input type="date" value={formData.reviewDate} onChange={e => setField("reviewDate", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">Veterinary Practice</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Vet Name <span className="text-red-500">*</span></label>
                    <Input placeholder="e.g. Mr J. Smith BVSc" value={formData.vetName} onChange={e => setField("vetName", e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Practice Name</label>
                    <Input placeholder="e.g. Green Pastures Vets" value={formData.practiceName} onChange={e => setField("practiceName", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Practice Phone</label>
                    <Input placeholder="e.g. 01234 567890" value={formData.practicePhone} onChange={e => setField("practicePhone", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Practice Address</label>
                    <Input placeholder="Address" value={formData.practiceAddress} onChange={e => setField("practiceAddress", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">Health Plan Content</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Key Health Priorities</label>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                      placeholder="Key health issues identified for this farm (e.g. BVD control, lameness reduction, pneumonia prevention...)"
                      value={formData.healthPriorities}
                      onChange={e => setField("healthPriorities", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Vaccination Protocol</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Vaccines used, schedule, products..." value={formData.vaccinationProtocol} onChange={e => setField("vaccinationProtocol", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Biosecurity Measures</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Quarantine, testing, visitor controls..." value={formData.biosecurityMeasures} onChange={e => setField("biosecurityMeasures", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Worming / Parasite Protocol</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Products, timing, rotation strategy..." value={formData.wormingProtocol} onChange={e => setField("wormingProtocol", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Fluke Treatment</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Flukicide products and timing..." value={formData.flukeTreatment} onChange={e => setField("flukeTreatment", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Mastitis Prevention (dairy)</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Dry cow therapy, teat dipping, cell count targets..." value={formData.mastitisPrevention} onChange={e => setField("mastitisPrevention", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Additional Notes</label>
                      <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" placeholder="Any other notes..." value={formData.notes} onChange={e => setField("notes", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingPlan(null); setFormData(EMPTY_PLAN); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingPlan ? "Update Plan" : "Save Health Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
        ) : records.length === 0 ? (
          <Card>
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80 mb-1">No vet health plans recorded</h3>
              <p className="text-foreground/50 text-sm">Add your annual veterinary health plan. Red Tractor requires a current signed plan from your vet.</p>
            </div>
          </Card>
        ) : records.map(p => (
          <Card key={p.id} className="overflow-hidden">
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary/70" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold">{p.planYear} Health Plan</span>
                    {p.isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70">
                    <span className="font-medium">{p.vetName}</span>
                    {p.practiceName && <span className="text-foreground/50"> — {p.practiceName}</span>}
                  </p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    Plan date: {formatDate(p.planDate)}
                    {p.reviewDate && <> · Review due: {formatDate(p.reviewDate)}</>}
                    {p.practicePhone && <> · {p.practicePhone}</>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {(p.healthPriorities || p.vaccinationProtocol || p.wormingProtocol || p.flukeTreatment) && (
              <div className="border-t border-border/50 px-5 py-3 bg-muted/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.healthPriorities && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Health Priorities</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.healthPriorities}</p>
                  </div>
                )}
                {p.vaccinationProtocol && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Vaccination</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.vaccinationProtocol}</p>
                  </div>
                )}
                {p.wormingProtocol && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Worming</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.wormingProtocol}</p>
                  </div>
                )}
                {p.flukeTreatment && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Fluke</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-line">{p.flukeTreatment}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Vet Health Plan</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function LivestockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<"herds" | "vet-plans">("herds");

  if (!farmId) return <Redirect href="/select" />;

  return (
    <AppLayout title="Herds & Animals">
      <TabBar className="mb-6">
        <TabButton active={tab === "herds"} onClick={() => setTab("herds")}>Herds & Animals</TabButton>
        <TabButton active={tab === "vet-plans"} onClick={() => setTab("vet-plans")}>Vet Health Plans</TabButton>
      </TabBar>
      {tab === "herds" && <HerdsSection farmId={farmId} />}
      {tab === "vet-plans" && <VetHealthPlansSection farmId={farmId} />}
    </AppLayout>
  );
}
