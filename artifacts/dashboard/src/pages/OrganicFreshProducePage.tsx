import React, { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Loader2, Pencil, Trash2, AlertTriangle,
  Leaf, ShieldCheck, FlaskConical, FileText,
  Eye, Info, Package,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

function fmtRaw(val: unknown): string {
  return val == null || val === "" ? "—" : String(val);
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function conversionProgress(startDate: string | null | undefined): number {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = start + 2 * 365.25 * 24 * 3600 * 1000;
  const now = Date.now();
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

const api = (path: string) => `/api/${path}`;

function yearRange(): number[] {
  const cur = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => cur - 2 + i);
}

// ─── Approved substances (Annex I fertilisers + Annex II crop protection) ────

interface SubstanceOption { substance: string; autoType: string; }

const ANNEX_INPUTS: SubstanceOption[] = [
  { substance: "Farmyard Manure (FYM) — composted or well-rotted", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Composted Plant & Animal Material", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Green Manure / Cover Crop Residue", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Slurry (composted; restricted from non-organic units)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dried Blood (Blood Meal)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Bone Meal / Steamed Bone Flour", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Fish Meal / Fish Emulsion", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Calcified Seaweed (Lithothamnium)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Extract (liquid)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Rock Phosphate (soft / reactive)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Potassium Sulphate (natural mineral extraction, low chloride)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Kieserite (Magnesium Sulphate, natural mineral)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Wood Ash (from untreated wood only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Ground Limestone / Calcium Carbonate", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dolomitic Limestone / Magnesium Limestone", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Gypsum (natural calcium sulphate)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Elemental Sulphur", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Peat (growing media only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Vermiculite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Perlite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Copper Hydroxide", autoType: "Crop Protection / Pesticide" },
  { substance: "Copper Oxychloride", autoType: "Crop Protection / Pesticide" },
  { substance: "Copper Sulphate / Bordeaux Mixture", autoType: "Crop Protection / Pesticide" },
  { substance: "Pyrethrin (from Chrysanthemum cinerariaefolium)", autoType: "Crop Protection / Pesticide" },
  { substance: "Spinosad (restricted — certifier notification required)", autoType: "Crop Protection / Pesticide" },
  { substance: "Azadirachtin / Neem Extract", autoType: "Crop Protection / Pesticide" },
  { substance: "Bacillus thuringiensis (Bt)", autoType: "Crop Protection / Pesticide" },
  { substance: "Bacillus subtilis", autoType: "Crop Protection / Pesticide" },
  { substance: "Beauveria bassiana", autoType: "Crop Protection / Pesticide" },
  { substance: "Entomopathogenic Nematodes", autoType: "Crop Protection / Pesticide" },
  { substance: "Iron Phosphate (slug pellets)", autoType: "Crop Protection / Pesticide" },
  { substance: "Kaolin (particle film)", autoType: "Crop Protection / Pesticide" },
  { substance: "Diatomaceous Earth / Kieselgur", autoType: "Crop Protection / Pesticide" },
  { substance: "Potassium Bicarbonate", autoType: "Crop Protection / Pesticide" },
  { substance: "Sulphur (wettable / dust)", autoType: "Crop Protection / Pesticide" },
  { substance: "Soft Soap / Potassium Soap", autoType: "Crop Protection / Pesticide" },
  { substance: "Rapeseed Oil / Plant Oil", autoType: "Crop Protection / Pesticide" },
  { substance: "Pheromones (mating disruption traps only)", autoType: "Crop Protection / Pesticide" },
  { substance: "Certified Organic Seed", autoType: "Seed Treatment" },
  { substance: "Untreated Conventional Seed (derogation required)", autoType: "Seed Treatment" },
  { substance: "Potassium Permanganate (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Hydrogen Peroxide (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Sodium Hypochlorite (disinfection of equipment only)", autoType: "Cleaning & Disinfection" },
];

const INPUT_TYPES = [
  "Fertiliser / Soil Amendment",
  "Crop Protection / Pesticide",
  "Biological Control",
  "Seed Treatment",
  "Cleaning & Disinfection",
  "Water Treatment",
  "Other",
];

const QUANTITY_UNITS = ["kg", "kg/ha", "l", "l/ha", "t", "g", "g/ha", "units"];

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  permitted: "Permitted",
  restricted: "Restricted (notify certifier)",
  derogation: "Derogation Required",
};

const APPROVAL_STATUS_COLORS: Record<string, string> = {
  permitted: "bg-green-50 text-green-700 border-green-300",
  restricted: "bg-amber-50 text-amber-700 border-amber-300",
  derogation: "bg-red-50 text-red-700 border-red-300",
};

function SubstancePicker({ value, onSelect }: { value: string; onSelect: (substance: string, autoType: string) => void }) {
  const inList = ANNEX_INPUTS.some(o => o.substance === value);
  const [showCustom, setShowCustom] = useState(!inList && value !== "");
  const selectValue = inList ? value : (showCustom || value !== "") ? "__other__" : "";

  function handleSelect(val: string) {
    if (val === "__other__") { setShowCustom(true); onSelect("", ""); }
    else if (val === "") { setShowCustom(false); onSelect("", ""); }
    else {
      const opt = ANNEX_INPUTS.find(o => o.substance === val);
      if (opt) { setShowCustom(false); onSelect(opt.substance, opt.autoType); }
    }
  }

  return (
    <div className="space-y-1.5">
      <select
        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        value={selectValue}
        onChange={e => handleSelect(e.target.value)}
      >
        <option value="">Select approved substance…</option>
        {ANNEX_INPUTS.map(o => (
          <option key={o.substance} value={o.substance}>{o.substance}</option>
        ))}
        <option value="__other__">Other / specify below</option>
      </select>
      {(showCustom || selectValue === "__other__") && (
        <Input
          required
          placeholder="Enter product / substance name"
          value={inList ? "" : value}
          onChange={e => onSelect(e.target.value, "")}
          autoFocus
        />
      )}
    </div>
  );
}

const EMPTY_INPUT_FORM = {
  applicationDate: new Date().toISOString().slice(0, 10),
  cropYear: new Date().getFullYear(),
  blockId: "" as string,
  inputName: "",
  inputType: "",
  approvalStatus: "permitted",
  certifierApprovalRef: "",
  approvedByBody: "",
  supplier: "",
  poReference: "",
  grnReference: "",
  quantityApplied: "",
  quantityUnit: "kg",
  purposeOfUse: "",
  appliedBy: "",
  notes: "",
};

// ─── Block Status Tab ────────────────────────────────────────────────────────

function BlockStatusTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["ofp-block-status", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp-block-status`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: growerBlocks = [] } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-block-status/${editing.id}`) : api(`farms/${farmId}/organic-fp-block-status`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-block-status", farmId] }); setOpen(false); setEditing(null); setForm({}); toast({ title: "Saved" }); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-block-status/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-block-status", farmId] }),
  });

  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  const statusBadge = (status: string) => {
    if (status === "fully-organic") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />Fully Organic</span>;
    if (status === "in-conversion") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"><Clock className="w-3 h-3" />In Conversion</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{status}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Block Conversion Status</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ status: "in-conversion" }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Block
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (blocks as Record<string, unknown>[]).length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No block status records yet.</p>
      ) : (
        <div className="space-y-3">
          {(blocks as Record<string, unknown>[]).map((b, i) => {
            const progress = conversionProgress(b.conversionStartDate as string);
            const daysLeft = daysUntil(b.fullyOrganicDate as string);
            return (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{fmtRaw(b.blockName)}</p>
                      {statusBadge(String(b.status))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtRaw(b.certifyingBody)}</p>

                    {b.status === "in-conversion" && b.conversionStartDate && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Conversion progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                          <span>Started {fmt(b.conversionStartDate as string)}</span>
                          {b.fullyOrganicDate && <span>Full organic {fmt(b.fullyOrganicDate as string)} {daysLeft != null && daysLeft > 0 ? `(${daysLeft}d)` : ""}</span>}
                        </div>
                      </div>
                    )}
                    {b.status === "fully-organic" && b.fullyOrganicDate && (
                      <p className="text-xs text-green-700 mt-1">Certified organic from {fmt(b.fullyOrganicDate as string)}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(b)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(b.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Block Conversion Details</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Block Name</p><p className="font-medium">{fmtRaw(viewRecord.blockName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmtRaw(viewRecord.status)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{fmtRaw(viewRecord.certifyingBody)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion Start</p><p className="font-medium">{fmt(viewRecord.conversionStartDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fully Organic Date</p><p className="font-medium">{fmt(viewRecord.fullyOrganicDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Land Use Before</p><p className="font-medium">{fmtRaw(viewRecord.landUseBeforeConversion)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Previous Synthetic Inputs</p><p className="font-medium">{fmtRaw(viewRecord.previousSyntheticInputs)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Block Status" : "Add Block Conversion Record"}</DialogTitle>
            <DialogDescription>Track the organic conversion status of a growing block.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Block Name *</Label>
              <Input value={form.blockName ?? ""} onChange={e => setForm(f => ({ ...f, blockName: e.target.value }))} />
            </div>
            <div>
              <Label>Link to Growing Block</Label>
              <Select value={form.blockId ?? ""} onValueChange={v => {
                const bl = (growerBlocks as { id: number; blockName: string }[]).find(b => String(b.id) === v);
                setForm(f => ({ ...f, blockId: v, blockName: f.blockName || (bl?.blockName ?? "") }));
              }}>
                <SelectTrigger><SelectValue placeholder="Optional link" /></SelectTrigger>
                <SelectContent>{(growerBlocks as { id: number; blockName: string }[]).map(b => <SelectItem key={b.id} value={String(b.id)}>{b.blockName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "in-conversion"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-conversion">In Conversion</SelectItem>
                  <SelectItem value="fully-organic">Fully Organic</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certifying Body</Label>
              <Select value={form.certifyingBody ?? ""} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soil Association">Soil Association</SelectItem>
                  <SelectItem value="OF&G">OF&G (Organic Farmers &amp; Growers)</SelectItem>
                  <SelectItem value="Biodynamic Association">Biodynamic Association</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Conversion Start Date</Label><Input type="date" value={form.conversionStartDate ?? ""} onChange={e => setForm(f => ({ ...f, conversionStartDate: e.target.value }))} /></div>
            <div><Label>Fully Organic Date</Label><Input type="date" value={form.fullyOrganicDate ?? ""} onChange={e => setForm(f => ({ ...f, fullyOrganicDate: e.target.value }))} /></div>
            <div><Label>Land Use Before Conversion</Label><Input value={form.landUseBeforeConversion ?? ""} onChange={e => setForm(f => ({ ...f, landUseBeforeConversion: e.target.value }))} placeholder="e.g. Conventional arable" /></div>
            <div><Label>Previous Synthetic Inputs</Label><Input value={form.previousSyntheticInputs ?? ""} onChange={e => setForm(f => ({ ...f, previousSyntheticInputs: e.target.value }))} placeholder="e.g. NPK fertiliser, herbicides" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.blockName}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Input Log Tab ───────────────────────────────────────────────────────────

function InputLogTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ ...EMPTY_INPUT_FORM });
  const [yearFilter, setYearFilter] = useState<number | "all">(new Date().getFullYear());

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["ofp-input-log", farmId, yearFilter],
    queryFn: () => {
      const url = yearFilter === "all"
        ? api(`farms/${farmId}/organic-fp-input-log`)
        : api(`farms/${farmId}/organic-fp-input-log?cropYear=${yearFilter}`);
      return fetch(url, { credentials: "include" }).then(r => r.json());
    },
  });

  const { data: growerBlocks = [] } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-input-log/${editing.id}`) : api(`farms/${farmId}/organic-fp-input-log`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ofp-input-log", farmId] });
      setOpen(false); setEditing(null); setForm({ ...EMPTY_INPUT_FORM });
      toast({ title: "Input saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-input-log/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-input-log", farmId] }); toast({ title: "Input deleted" }); },
  });

  function openEdit(r: Record<string, unknown>) {
    setEditing(r);
    setForm({
      applicationDate: (r.applicationDate as string)?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      cropYear: r.cropYear != null ? Number(r.cropYear) : new Date().getFullYear(),
      blockId: r.blockId != null ? String(r.blockId) : "",
      inputName: (r.inputName as string) ?? "",
      inputType: (r.inputType as string) ?? "",
      approvalStatus: (r.approvalStatus as string) ?? "permitted",
      certifierApprovalRef: (r.certifierApprovalRef as string) ?? "",
      approvedByBody: (r.approvedByBody as string) ?? "",
      supplier: (r.supplier as string) ?? "",
      poReference: (r.poReference as string) ?? "",
      grnReference: (r.grnReference as string) ?? "",
      quantityApplied: r.quantityApplied != null ? String(r.quantityApplied) : "",
      quantityUnit: (r.quantityUnit as string) ?? "kg",
      purposeOfUse: (r.purposeOfUse as string) ?? "",
      appliedBy: (r.appliedBy as string) ?? "",
      notes: (r.notes as string) ?? "",
    });
    setOpen(true);
  }

  const rows = logs as Record<string, unknown>[];
  const blocks = growerBlocks as { id: number; blockName: string }[];
  const blockName = (id: unknown) => blocks.find(b => String(b.id) === String(id))?.blockName ?? "—";

  const permitted = useMemo(() => rows.filter(r => r.approvalStatus === "permitted" || (!r.approvalStatus && r.isApproved)).length, [rows]);
  const restricted = useMemo(() => rows.filter(r => r.approvalStatus === "restricted").length, [rows]);
  const derogation = useMemo(() => rows.filter(r => r.approvalStatus === "derogation").length, [rows]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-green-50 border-green-200 px-4 py-3 text-sm text-green-800 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Record every input applied to organic blocks — fertilisers, crop protection, seed treatments, and cleaning products. This is your evidence register for annual certification inspection.</span>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
          >
            <option value="all">All years</option>
            {yearRange().map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {rows.length > 0 && (
            <div className="flex gap-3 text-xs pl-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{permitted} permitted</span>
              {restricted > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{restricted} restricted</span>}
              {derogation > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{derogation} derogation</span>}
            </div>
          )}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ ...EMPTY_INPUT_FORM }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Input
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : rows.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <Package className="w-8 h-8 mx-auto text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground italic">No input records{yearFilter !== "all" ? ` for ${yearFilter}` : ""} yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const status = (row.approvalStatus as string) ?? (row.isApproved ? "permitted" : "restricted");
            const statusColor = APPROVAL_STATUS_COLORS[status] ?? APPROVAL_STATUS_COLORS.permitted;
            return (
              <div key={i} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Package className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="font-semibold text-sm">{fmtRaw(row.inputName)}</span>
                      {row.inputType && <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{fmtRaw(row.inputType)}</span>}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {APPROVAL_STATUS_LABELS[status] ?? status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                      {row.applicationDate && <span>{fmt(row.applicationDate as string)}</span>}
                      {row.blockId && <span>Block: {blockName(row.blockId)}</span>}
                      {row.supplier && <span>Supplier: {fmtRaw(row.supplier)}</span>}
                      {row.quantityApplied && <span>Qty: {fmtRaw(row.quantityApplied)}{row.quantityUnit ? ` ${fmtRaw(row.quantityUnit)}` : ""}</span>}
                      {row.approvedByBody && <span>Certifier: {fmtRaw(row.approvedByBody)}</span>}
                    </div>
                    {(row.poReference || row.grnReference) && (
                      <div className="text-xs text-muted-foreground flex gap-3 mt-0.5">
                        {row.poReference && <span>PO: {fmtRaw(row.poReference)}</span>}
                        {row.grnReference && <span>GRN: {fmtRaw(row.grnReference)}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewRecord(row)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del.mutate(row.id as number)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Input Log Entry</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product / Substance</p><p className="font-medium">{fmtRaw(viewRecord.inputName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Input Type</p><p className="font-medium">{fmtRaw(viewRecord.inputType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Approval Status</p>
                <p className="font-medium">{APPROVAL_STATUS_LABELS[(viewRecord.approvalStatus as string)] ?? fmtRaw(viewRecord.approvalStatus)}</p>
              </div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Approval Ref</p><p className="font-medium">{fmtRaw(viewRecord.certifierApprovalRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Approved by Body</p><p className="font-medium">{fmtRaw(viewRecord.approvedByBody)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p><p className="font-medium">{fmtRaw(viewRecord.supplier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Order</p><p className="font-medium">{fmtRaw(viewRecord.poReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">GRN / Delivery Note</p><p className="font-medium">{fmtRaw(viewRecord.grnReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Application Date</p><p className="font-medium">{fmt(viewRecord.applicationDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop Year</p><p className="font-medium">{fmtRaw(viewRecord.cropYear)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Growing Block</p><p className="font-medium">{blockName(viewRecord.blockId)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p>
                <p className="font-medium">{viewRecord.quantityApplied ? `${fmtRaw(viewRecord.quantityApplied)} ${fmtRaw(viewRecord.quantityUnit)}` : "—"}</p>
              </div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purpose of Use</p><p className="font-medium">{fmtRaw(viewRecord.purposeOfUse)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Applied By</p><p className="font-medium">{fmtRaw(viewRecord.appliedBy)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); } }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Input Record" : "Log Organic Input"}</DialogTitle>
            <DialogDescription>Record an input applied to organic blocks — this forms your evidence register for annual inspection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

            {/* Substance */}
            <div>
              <Label>Product / Substance Name *</Label>
              <SubstancePicker
                value={form.inputName}
                onSelect={(substance, autoType) => setForm(f => ({ ...f, inputName: substance, inputType: autoType || f.inputType }))}
              />
            </div>

            {/* Type + Block */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Input Type</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.inputType}
                  onChange={e => setForm(f => ({ ...f, inputType: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {INPUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Growing Block</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.blockId}
                  onChange={e => setForm(f => ({ ...f, blockId: e.target.value }))}
                >
                  <option value="">— None —</option>
                  {blocks.map(b => <option key={b.id} value={String(b.id)}>{b.blockName}</option>)}
                </select>
              </div>
            </div>

            {/* Approval status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Approval Status *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.approvalStatus}
                  onChange={e => setForm(f => ({ ...f, approvalStatus: e.target.value }))}
                >
                  <option value="permitted">Permitted</option>
                  <option value="restricted">Restricted (notify certifier)</option>
                  <option value="derogation">Derogation Required</option>
                </select>
              </div>
              {(form.approvalStatus === "restricted" || form.approvalStatus === "derogation") && (
                <div>
                  <Label>Certifier Approval Ref</Label>
                  <Input value={form.certifierApprovalRef} onChange={e => setForm(f => ({ ...f, certifierApprovalRef: e.target.value }))} placeholder="Reference number" />
                </div>
              )}
              {form.approvalStatus === "permitted" && (
                <div>
                  <Label>Approved by Certifying Body</Label>
                  <Input value={form.approvedByBody} onChange={e => setForm(f => ({ ...f, approvedByBody: e.target.value }))} placeholder="e.g. Soil Association, OF&G" />
                </div>
              )}
            </div>

            {/* Supplier / PO / GRN */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Supplier</Label>
                <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" />
              </div>
              <div>
                <Label>Purchase Order Ref</Label>
                <Input value={form.poReference} onChange={e => setForm(f => ({ ...f, poReference: e.target.value }))} placeholder="PO number" />
              </div>
              <div>
                <Label>GRN / Delivery Note</Label>
                <Input value={form.grnReference} onChange={e => setForm(f => ({ ...f, grnReference: e.target.value }))} placeholder="GRN number" />
              </div>
            </div>

            {/* Date / Year / Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Application Date *</Label>
                <Input type="date" value={form.applicationDate} onChange={e => setForm(f => ({ ...f, applicationDate: e.target.value }))} />
              </div>
              <div>
                <Label>Crop Year</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.cropYear}
                  onChange={e => setForm(f => ({ ...f, cropYear: parseInt(e.target.value) }))}
                >
                  {yearRange().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity Applied</Label>
                <Input type="number" value={form.quantityApplied} onChange={e => setForm(f => ({ ...f, quantityApplied: e.target.value }))} placeholder="Amount" />
              </div>
              <div>
                <Label>Unit</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.quantityUnit}
                  onChange={e => setForm(f => ({ ...f, quantityUnit: e.target.value }))}
                >
                  {QUANTITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Purpose / Applied By */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Purpose of Use</Label>
                <Input value={form.purposeOfUse} onChange={e => setForm(f => ({ ...f, purposeOfUse: e.target.value }))} placeholder="e.g. Slug control, foliar feed" />
              </div>
              <div>
                <Label>Applied By</Label>
                <Input value={form.appliedBy} onChange={e => setForm(f => ({ ...f, appliedBy: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button
              onClick={() => save.mutate(form as unknown as Record<string, unknown>)}
              disabled={save.isPending || !form.applicationDate || !form.inputName.trim()}
            >
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Certificates Tab ────────────────────────────────────────────────────────

function CertificatesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["ofp-certificates", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp-certificates`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-certificates/${editing.id}`) : api(`farms/${farmId}/organic-fp-certificates`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-certificates", farmId] }); setOpen(false); setEditing(null); setForm({}); toast({ title: "Saved" }); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-certificates/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-certificates", farmId] }),
  });

  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Organic Certificates</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ status: "active" }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Certificate
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (certs as Record<string, unknown>[]).length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No certificates recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {(certs as Record<string, unknown>[]).map((c, i) => {
            const days = daysUntil(c.annualRenewalDue as string);
            const expiring = days != null && days <= 60 && days >= 0;
            const expired = days != null && days < 0;
            return (
              <Card key={i} className={`p-4 ${expired ? "border-red-300 bg-red-50" : expiring ? "border-amber-300 bg-amber-50" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{fmtRaw(c.certifyingBody)}</p>
                      <span className="text-xs font-mono text-muted-foreground">{fmtRaw(c.certificateNumber)}</span>
                      {c.status === "active" && !expired
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle2 className="inline w-3 h-3 mr-0.5" />Active</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">Expired / Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtRaw(c.scope)}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Issued {fmt(c.issueDate as string)}</span>
                      {c.expiryDate && <span>Expires {fmt(c.expiryDate as string)}</span>}
                      {c.annualRenewalDue && (
                        <span className={expired ? "text-red-600 font-semibold" : expiring ? "text-amber-700 font-semibold" : ""}>
                          Renewal due {fmt(c.annualRenewalDue as string)}
                          {expiring && ` (${days}d)`}
                          {expired && " — OVERDUE"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(c)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(c.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Certificate Details</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{fmtRaw(viewRecord.certifyingBody)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate No.</p><p className="font-mono text-sm">{fmtRaw(viewRecord.certificateNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Issue Date</p><p className="font-medium">{fmt(viewRecord.issueDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry Date</p><p className="font-medium">{fmt(viewRecord.expiryDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Renewal Due</p><p className="font-medium">{fmt(viewRecord.annualRenewalDue as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmtRaw(viewRecord.status)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope</p><p className="font-medium">{fmtRaw(viewRecord.scope)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Products Included</p><p className="font-medium">{fmtRaw(viewRecord.productsIncluded)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Document Reference</p><p className="font-medium">{fmtRaw(viewRecord.documentRef)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Certificate" : "Add Organic Certificate"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Certifying Body *</Label>
              <Select value={form.certifyingBody ?? ""} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soil Association">Soil Association</SelectItem>
                  <SelectItem value="OF&G">OF&G</SelectItem>
                  <SelectItem value="Biodynamic Association">Biodynamic Association</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number *</Label><Input value={form.certificateNumber ?? ""} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Issue Date *</Label><Input type="date" value={form.issueDate ?? ""} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate ?? ""} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            <div><Label>Annual Renewal Due</Label><Input type="date" value={form.annualRenewalDue ?? ""} onChange={e => setForm(f => ({ ...f, annualRenewalDue: e.target.value }))} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Scope</Label><Input value={form.scope ?? ""} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} placeholder="e.g. Fresh vegetables and salads" /></div>
            <div><Label>Products Included</Label><Input value={form.productsIncluded ?? ""} onChange={e => setForm(f => ({ ...f, productsIncluded: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Document Reference</Label><Input value={form.documentRef ?? ""} onChange={e => setForm(f => ({ ...f, documentRef: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.certifyingBody || !form.certificateNumber || !form.issueDate}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Buyer Declarations Tab ──────────────────────────────────────────────────

function BuyerDeclarationsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: decls = [], isLoading } = useQuery({
    queryKey: ["ofp-buyer-decls", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-fp-buyer-declarations`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/organic-fp-buyer-declarations/${editing.id}`) : api(`farms/${farmId}/organic-fp-buyer-declarations`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofp-buyer-decls", farmId] }); setOpen(false); setEditing(null); setForm({}); toast({ title: "Saved" }); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-fp-buyer-declarations/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofp-buyer-decls", farmId] }),
  });

  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Buyer Organic Declarations</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Declaration
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (decls as Record<string, unknown>[]).length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-6 text-center">No buyer declarations recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Buyer</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Qty (kg)</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Cert Body</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(decls as Record<string, unknown>[]).map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-4">{fmt(row.declarationDate as string)}</td>
                  <td className="py-2 pr-4 font-medium">{fmtRaw(row.buyerName)}</td>
                  <td className="py-2 pr-4">{fmtRaw(row.productDescription)}</td>
                  <td className="py-2 pr-4">{fmtRaw(row.quantityKg)}</td>
                  <td className="py-2 pr-4">{fmtRaw(row.certifyingBody)}</td>
                  <td className="py-2 text-right space-x-1 whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(row)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(row.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Buyer Declaration</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Declaration Date</p><p className="font-medium">{fmt(viewRecord.declarationDate as string)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer Name</p><p className="font-medium">{fmtRaw(viewRecord.buyerName)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer Address</p><p className="font-medium">{fmtRaw(viewRecord.buyerAddress)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Description</p><p className="font-medium">{fmtRaw(viewRecord.productDescription)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity (kg)</p><p className="font-medium">{fmtRaw(viewRecord.quantityKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{fmtRaw(viewRecord.certifyingBody)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Number</p><p className="font-mono text-sm">{fmtRaw(viewRecord.certificateNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Declared By</p><p className="font-medium">{fmtRaw(viewRecord.declaredBy)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Declaration" : "Add Buyer Organic Declaration"}</DialogTitle>
            <DialogDescription>Record a declaration that produce supplied to this buyer was grown organically.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Declaration Date *</Label><Input type="date" value={form.declarationDate ?? ""} onChange={e => setForm(f => ({ ...f, declarationDate: e.target.value }))} /></div>
            <div><Label>Buyer Name *</Label><Input value={form.buyerName ?? ""} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Buyer Address</Label><Input value={form.buyerAddress ?? ""} onChange={e => setForm(f => ({ ...f, buyerAddress: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Product Description *</Label><Input value={form.productDescription ?? ""} onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))} placeholder="e.g. Organic winter lettuce, variety Romaine" /></div>
            <div><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg ?? ""} onChange={e => setForm(f => ({ ...f, quantityKg: e.target.value }))} /></div>
            <div>
              <Label>Certifying Body</Label>
              <Select value={form.certifyingBody ?? ""} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soil Association">Soil Association</SelectItem>
                  <SelectItem value="OF&G">OF&G</SelectItem>
                  <SelectItem value="Biodynamic Association">Biodynamic Association</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number</Label><Input value={form.certificateNumber ?? ""} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Declared By</Label><Input value={form.declaredBy ?? ""} onChange={e => setForm(f => ({ ...f, declaredBy: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.declarationDate || !form.buyerName || !form.productDescription}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "block-status", label: "Block Status", icon: <Leaf className="w-4 h-4" /> },
  { key: "input-log", label: "Input Log", icon: <FlaskConical className="w-4 h-4" /> },
  { key: "certificates", label: "Certificates", icon: <ShieldCheck className="w-4 h-4" /> },
  { key: "buyer-declarations", label: "Buyer Declarations", icon: <FileText className="w-4 h-4" /> },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function OrganicFreshProducePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<TabKey>("block-status");

  if (!farmId) return null;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organic Fresh Produce</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Block conversion status, approved input log, organic certification records, and buyer declarations.
          </p>
        </div>

        <TabBar>
          {TABS.map(t => (
            <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.icon}
              {t.label}
            </TabButton>
          ))}
        </TabBar>

        <Card className="p-5">
          {tab === "block-status" && <BlockStatusTab farmId={farmId} />}
          {tab === "input-log" && <InputLogTab farmId={farmId} />}
          {tab === "certificates" && <CertificatesTab farmId={farmId} />}
          {tab === "buyer-declarations" && <BuyerDeclarationsTab farmId={farmId} />}
        </Card>
      </div>
    </AppLayout>
  );
}
