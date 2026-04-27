import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB");
}

function conversionStatusBadge(status: string) {
  const map: Record<string, string> = {
    "in-conversion": "bg-yellow-100 text-yellow-800",
    certified: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge className={map[status] ?? "bg-gray-100 text-gray-700"}>
      {status.replace(/-/g, " ")}
    </Badge>
  );
}

type HerdConversionRecord = {
  id: number;
  herdName: string;
  numberOfCows: number | null;
  breed: string | null;
  conversionStartDate: string;
  expectedMilkCertDate: string | null;
  actualMilkCertDate: string | null;
  status: string;
  certifier: string | null;
  certificationRef: string | null;
  parallelProduction: boolean;
  notes: string | null;
};

type CollectionRecord = {
  id: number;
  collectionDate: string;
  collectorName: string | null;
  vehicleRef: string | null;
  volumeLitres: string;
  fatPercentage: string | null;
  proteinPercentage: string | null;
  sccThousandsPerMl: string | null;
  tbc: string | null;
  isOrganicCertified: boolean;
  processorRef: string | null;
  collectionRef: string | null;
  deductionsPence: number | null;
  netValuePence: number | null;
  notes: string | null;
};

type DairyFeedRecord = {
  id: number;
  recordDate: string;
  feedType: string;
  feedProductName: string;
  supplier: string | null;
  supplierApprovalNumber: string | null;
  isOrganicApproved: boolean;
  quantityKg: string | null;
  organicPercentage: string | null;
  dryMatterKg: string | null;
  poReference: string | null;
  grnReference: string | null;
  certifierApprovalRef: string | null;
  derogationReference: string | null;
  notes: string | null;
};

type DairyTreatmentRecord = {
  id: number;
  treatmentDate: string;
  cowIds: string | null;
  numberOfCows: number | null;
  productName: string;
  productCategory: string | null;
  activeIngredient: string | null;
  doseAmount: string | null;
  routeOfAdministration: string | null;
  vetName: string | null;
  prescriptionRef: string | null;
  standardMilkWithdrawalDays: number | null;
  doubledMilkWithdrawalDays: number | null;
  standardMeatWithdrawalDays: number | null;
  doubledMeatWithdrawalDays: number | null;
  milkWithdrawalEndDate: string | null;
  meatWithdrawalEndDate: string | null;
  certifierNotified: boolean;
  treatmentNumber: number;
  notes: string | null;
};

type CoreHerd = { id: number; name: string; type: string; herdNumber: string | null; isOrganicHerd?: boolean };

function HerdConversionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HerdConversionRecord | null>(null);
  const [form, setForm] = useState<Partial<HerdConversionRecord> & { herdId?: number | null }>({});

  const { data } = useQuery<{ records: HerdConversionRecord[] }>({
    queryKey: ["organic-dairy-herd-conversion", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/herd-conversion`).then((r) => r.json()),
    enabled: !!farmId,
  });

  // Fetch core herd register for linking
  const { data: herdsData } = useQuery<{ records: CoreHerd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const coreHerds: CoreHerd[] = herdsData?.records ?? [];

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/herd-conversion/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/herd-conversion`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      // If a herd is linked, mark it organic in the core livestock register
      if (form.herdId) {
        await fetch(`/api/farms/${farmId}/herds/${form.herdId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isOrganicHerd: true,
            organicCertBody: form.certifier ?? undefined,
            organicCertNumber: form.certificationRef ?? undefined,
            organicConversionStartDate: form.conversionStartDate ? new Date(form.conversionStartDate).toISOString() : undefined,
          }),
        });
      }
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-herd-conversion", farmId] });
      qc.invalidateQueries({ queryKey: ["herds", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added — herd marked as organic in the Livestock Register" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-dairy/herd-conversion/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-herd-conversion", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ status: "in-conversion", parallelProduction: false, herdId: null });
    setOpen(true);
  }

  function openEdit(r: HerdConversionRecord) {
    setEditing(r);
    setForm({ ...r, herdId: (r as any).herdId ?? null });
    setOpen(true);
  }

  function onHerdSelect(herdId: string) {
    const herd = coreHerds.find(h => String(h.id) === herdId);
    if (herd) {
      setForm(p => ({ ...p, herdId: herd.id, herdName: herd.name }));
    } else {
      setForm(p => ({ ...p, herdId: null }));
    }
  }

  const f = (k: keyof HerdConversionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Organic herds banner */}
      {coreHerds.filter(h => h.isOrganicHerd).length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span className="font-semibold">🌿 {coreHerds.filter(h => h.isOrganicHerd).length} herd{coreHerds.filter(h => h.isOrganicHerd).length !== 1 ? "s" : ""} in your Livestock Register marked as organic:</span>
          {coreHerds.filter(h => h.isOrganicHerd).map(h => (
            <span key={h.id} className="inline-flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-2 py-0.5 text-xs font-medium">{h.name}</span>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Herd
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Herd Name</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Cows</TableHead>
            <TableHead>Conversion Start</TableHead>
            <TableHead>Expected Milk Cert</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Certifier</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No herd conversion records yet. Link a herd from your Livestock Register to get started.
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                {r.herdName}
                {(r as any).herdId && <span className="ml-1.5 text-xs text-green-600 font-medium">● Linked</span>}
              </TableCell>
              <TableCell>{r.breed ?? "—"}</TableCell>
              <TableCell>{r.numberOfCows ?? "—"}</TableCell>
              <TableCell>{fmt(r.conversionStartDate)}</TableCell>
              <TableCell>{fmt(r.expectedMilkCertDate)}</TableCell>
              <TableCell>{conversionStatusBadge(r.status)}</TableCell>
              <TableCell>{r.certifier ?? "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Herd Conversion Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {/* Link to core herd register */}
            <div className="col-span-2 space-y-1">
              <Label>Link to Livestock Register Herd</Label>
              <Select
                value={form.herdId ? String(form.herdId) : "__none__"}
                onValueChange={v => onHerdSelect(v === "__none__" ? "" : v)}
              >
                <SelectTrigger><SelectValue placeholder="Select registered herd…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Enter manually —</SelectItem>
                  {coreHerds.map(h => (
                    <SelectItem key={h.id} value={String(h.id)}>
                      {h.name} ({h.type}){h.isOrganicHerd ? " 🌿" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.herdId ? (
                <p className="text-xs text-green-700 mt-1">✓ Saving will mark this herd as organic in the Livestock Register — enabling organic compliance across Medicines and Feed modules.</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Linking to a registered herd flags it as organic across all modules — no double entry.</p>
              )}
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Herd Name *</Label>
              <Input value={form.herdName ?? ""} onChange={f("herdName")} placeholder="e.g. Main Dairy Herd" />
            </div>
            <div className="space-y-1">
              <Label>Breed</Label>
              <Input value={form.breed ?? ""} onChange={f("breed")} placeholder="e.g. Holstein Friesian" />
            </div>
            <div className="space-y-1">
              <Label>Number of Cows</Label>
              <Input type="number" value={form.numberOfCows ?? ""} onChange={f("numberOfCows")} />
            </div>
            <div className="space-y-1">
              <Label>Conversion Start Date *</Label>
              <Input type="date" value={form.conversionStartDate ?? ""} onChange={f("conversionStartDate")} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status ?? "in-conversion"}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-conversion">In Conversion</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Expected Milk Cert Date</Label>
              <Input type="date" value={form.expectedMilkCertDate ?? ""} onChange={f("expectedMilkCertDate")} />
            </div>
            <div className="space-y-1">
              <Label>Actual Milk Cert Date</Label>
              <Input type="date" value={form.actualMilkCertDate ?? ""} onChange={f("actualMilkCertDate")} />
            </div>
            <div className="space-y-1">
              <Label>Certifier</Label>
              <Input value={form.certifier ?? ""} onChange={f("certifier")} placeholder="e.g. Soil Association" />
            </div>
            <div className="space-y-1">
              <Label>Certification Ref</Label>
              <Input value={form.certificationRef ?? ""} onChange={f("certificationRef")} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                checked={form.parallelProduction ?? false}
                onCheckedChange={(v) => setForm((p) => ({ ...p, parallelProduction: !!v }))}
                id="parallel"
              />
              <Label htmlFor="parallel">Parallel Production</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={f("notes")} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MilkCollectionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRecord | null>(null);
  const [form, setForm] = useState<Partial<CollectionRecord>>({});

  const { data } = useQuery<{ records: CollectionRecord[] }>({
    queryKey: ["organic-dairy-collections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/collections`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/collections/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/collections`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-dairy/collections/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ isOrganicCertified: true });
    setOpen(true);
  }

  function openEdit(r: CollectionRecord) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  const f = (k: keyof CollectionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  function formatPence(pence: number | null | undefined) {
    if (pence == null) return "—";
    return `£${(pence / 100).toFixed(2)}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Collection
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Collector</TableHead>
            <TableHead>Volume (L)</TableHead>
            <TableHead>Fat %</TableHead>
            <TableHead>Protein %</TableHead>
            <TableHead>SCC</TableHead>
            <TableHead>Organic</TableHead>
            <TableHead>Net Value</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No milk collection records yet
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{fmt(r.collectionDate)}</TableCell>
              <TableCell>{r.collectorName ?? "—"}</TableCell>
              <TableCell>{r.volumeLitres}</TableCell>
              <TableCell>{r.fatPercentage ? `${r.fatPercentage}%` : "—"}</TableCell>
              <TableCell>{r.proteinPercentage ? `${r.proteinPercentage}%` : "—"}</TableCell>
              <TableCell>{r.sccThousandsPerMl ? `${r.sccThousandsPerMl}k` : "—"}</TableCell>
              <TableCell>
                <Badge className={r.isOrganicCertified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                  {r.isOrganicCertified ? "Organic" : "Standard"}
                </Badge>
              </TableCell>
              <TableCell>{formatPence(r.netValuePence)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Milk Collection</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Collection Date *</Label>
              <Input type="date" value={form.collectionDate ?? ""} onChange={f("collectionDate")} />
            </div>
            <div className="space-y-1">
              <Label>Volume (litres) *</Label>
              <Input type="number" step="0.01" value={form.volumeLitres ?? ""} onChange={f("volumeLitres")} />
            </div>
            <div className="space-y-1">
              <Label>Collector Name</Label>
              <Input value={form.collectorName ?? ""} onChange={f("collectorName")} placeholder="e.g. Arla" />
            </div>
            <div className="space-y-1">
              <Label>Vehicle Ref</Label>
              <Input value={form.vehicleRef ?? ""} onChange={f("vehicleRef")} />
            </div>
            <div className="space-y-1">
              <Label>Fat %</Label>
              <Input type="number" step="0.01" value={form.fatPercentage ?? ""} onChange={f("fatPercentage")} />
            </div>
            <div className="space-y-1">
              <Label>Protein %</Label>
              <Input type="number" step="0.01" value={form.proteinPercentage ?? ""} onChange={f("proteinPercentage")} />
            </div>
            <div className="space-y-1">
              <Label>SCC (000s/ml)</Label>
              <Input type="number" step="1" value={form.sccThousandsPerMl ?? ""} onChange={f("sccThousandsPerMl")} />
            </div>
            <div className="space-y-1">
              <Label>TBC (000s/ml)</Label>
              <Input type="number" step="1" value={form.tbc ?? ""} onChange={f("tbc")} />
            </div>
            <div className="space-y-1">
              <Label>Processor Ref</Label>
              <Input value={form.processorRef ?? ""} onChange={f("processorRef")} />
            </div>
            <div className="space-y-1">
              <Label>Collection Ref</Label>
              <Input value={form.collectionRef ?? ""} onChange={f("collectionRef")} />
            </div>
            <div className="space-y-1">
              <Label>Deductions (pence)</Label>
              <Input type="number" value={form.deductionsPence ?? ""} onChange={f("deductionsPence")} />
            </div>
            <div className="space-y-1">
              <Label>Net Value (pence)</Label>
              <Input type="number" value={form.netValuePence ?? ""} onChange={f("netValuePence")} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                checked={form.isOrganicCertified ?? true}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isOrganicCertified: !!v }))}
                id="organic-cert"
              />
              <Label htmlFor="organic-cert">Organic Certified Milk</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={f("notes")} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeedNutritionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DairyFeedRecord | null>(null);
  const [form, setForm] = useState<Partial<DairyFeedRecord>>({});

  const { data } = useQuery<{ records: DairyFeedRecord[] }>({
    queryKey: ["organic-dairy-feed", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/feed`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/feed/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/feed`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-dairy/feed/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-feed", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ isOrganicApproved: true });
    setOpen(true);
  }

  function openEdit(r: DairyFeedRecord) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  const f = (k: keyof DairyFeedRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Feed Record
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Feed Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Qty (kg)</TableHead>
            <TableHead>DM (kg)</TableHead>
            <TableHead>Organic %</TableHead>
            <TableHead>Approved</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No feed records yet
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{fmt(r.recordDate)}</TableCell>
              <TableCell>{r.feedProductName}</TableCell>
              <TableCell>{r.feedType}</TableCell>
              <TableCell>{r.quantityKg ?? "—"}</TableCell>
              <TableCell>{r.dryMatterKg ?? "—"}</TableCell>
              <TableCell>{r.organicPercentage ? `${r.organicPercentage}%` : "—"}</TableCell>
              <TableCell>
                <Badge className={r.isOrganicApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {r.isOrganicApproved ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Feed Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input type="date" value={form.recordDate ?? ""} onChange={f("recordDate")} />
            </div>
            <div className="space-y-1">
              <Label>Feed Type *</Label>
              <Input value={form.feedType ?? ""} onChange={f("feedType")} placeholder="e.g. Concentrate, Silage" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Feed Product Name *</Label>
              <Input value={form.feedProductName ?? ""} onChange={f("feedProductName")} />
            </div>
            <div className="space-y-1">
              <Label>Supplier</Label>
              <Input value={form.supplier ?? ""} onChange={f("supplier")} />
            </div>
            <div className="space-y-1">
              <Label>Supplier Approval No.</Label>
              <Input value={form.supplierApprovalNumber ?? ""} onChange={f("supplierApprovalNumber")} />
            </div>
            <div className="space-y-1">
              <Label>Quantity (kg)</Label>
              <Input type="number" step="0.01" value={form.quantityKg ?? ""} onChange={f("quantityKg")} />
            </div>
            <div className="space-y-1">
              <Label>Dry Matter (kg)</Label>
              <Input type="number" step="0.01" value={form.dryMatterKg ?? ""} onChange={f("dryMatterKg")} />
            </div>
            <div className="space-y-1">
              <Label>Organic %</Label>
              <Input type="number" step="0.01" max="100" value={form.organicPercentage ?? ""} onChange={f("organicPercentage")} />
            </div>
            <div className="space-y-1">
              <Label>PO Reference</Label>
              <Input value={form.poReference ?? ""} onChange={f("poReference")} />
            </div>
            <div className="space-y-1">
              <Label>GRN Reference</Label>
              <Input value={form.grnReference ?? ""} onChange={f("grnReference")} />
            </div>
            <div className="space-y-1">
              <Label>Certifier Approval Ref</Label>
              <Input value={form.certifierApprovalRef ?? ""} onChange={f("certifierApprovalRef")} />
            </div>
            <div className="space-y-1">
              <Label>Derogation Reference</Label>
              <Input value={form.derogationReference ?? ""} onChange={f("derogationReference")} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                checked={form.isOrganicApproved ?? true}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isOrganicApproved: !!v }))}
                id="organic-approved"
              />
              <Label htmlFor="organic-approved">Organic Approved</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={f("notes")} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TreatmentsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DairyTreatmentRecord | null>(null);
  const [form, setForm] = useState<Partial<DairyTreatmentRecord>>({});
  const [raiseTaskMilkRecord, setRaiseTaskMilkRecord] = useState<DairyTreatmentRecord | null>(null);
  const [raiseTaskMeatRecord, setRaiseTaskMeatRecord] = useState<DairyTreatmentRecord | null>(null);

  const { data } = useQuery<{ records: DairyTreatmentRecord[] }>({
    queryKey: ["organic-dairy-treatments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/treatments`).then((r) => r.json()),
    enabled: !!farmId,
  });

  // Pull organic-flagged records from the core Medicine Register — no double-entry needed
  const { data: medData } = useQuery<{ records: any[] }>({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const medicineOrganicRecords = (medData?.records ?? []).filter((r: any) => r.isOrganicTreatment);

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/treatments/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/treatments`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-dairy/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ certifierNotified: false, treatmentNumber: 1 });
    setOpen(true);
  }

  function openEdit(r: DairyTreatmentRecord) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  const f = (k: keyof DairyTreatmentRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Integration banner */}
      {medicineOrganicRecords.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span>🌿</span>
          <span><strong>{medicineOrganicRecords.length} treatment{medicineOrganicRecords.length !== 1 ? "s" : ""}</strong> auto-populated from the Medicine Register. No double entry needed.</span>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Standalone Treatment
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Std W/D</TableHead>
            <TableHead>Organic Milk W/D End</TableHead>
            <TableHead>Organic Meat W/D End</TableHead>
            <TableHead>Certifier Notified</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Medicine register rows (integrated, read-only) */}
          {medicineOrganicRecords.map((r: any) => (
            <TableRow key={`med-${r.id}`} className="bg-green-50/50">
              <TableCell>{fmt(r.administeredDate)}</TableCell>
              <TableCell>
                <span className="text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">Medicine Register</span>
              </TableCell>
              <TableCell className="font-medium">{r.medicineName}</TableCell>
              <TableCell>{r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays}d` : "—"}</TableCell>
              <TableCell>
                {r.organicWithdrawalEndDate ? (
                  <span className="text-green-700 font-medium text-sm">{fmt(r.organicWithdrawalEndDate)} ({r.doubledWithdrawalDays}d)</span>
                ) : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell><span className="text-muted-foreground text-xs">See Med. Register</span></TableCell>
              <TableCell>
                <Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                  {r.certifierNotified ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell><span className="text-xs text-muted-foreground italic">Edit in Medicines</span></TableCell>
            </TableRow>
          ))}
          {records.length === 0 && medicineOrganicRecords.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No treatment records yet. When you record a vet treatment for an organic herd in the Medicine Register, it will appear here automatically.
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{fmt(r.treatmentDate)}</TableCell>
              <TableCell><span className="text-xs text-muted-foreground">Standalone</span></TableCell>
              <TableCell>{r.productName}</TableCell>
              <TableCell>{(r as any).standardWithdrawalDays ? `${(r as any).standardWithdrawalDays}d` : "—"}</TableCell>
              <TableCell>{fmt(r.milkWithdrawalEndDate)}</TableCell>
              <TableCell>{fmt(r.meatWithdrawalEndDate)}</TableCell>
              <TableCell>
                <Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                  {r.certifierNotified ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {r.milkWithdrawalEndDate && (
                    <Button variant="ghost" size="icon" title="Raise task for milk withdrawal end" onClick={() => setRaiseTaskMilkRecord(r)}>
                      <ClipboardList className="h-4 w-4 text-teal-600" />
                    </Button>
                  )}
                  {r.meatWithdrawalEndDate && (
                    <Button variant="ghost" size="icon" title="Raise task for meat withdrawal end" onClick={() => setRaiseTaskMeatRecord(r)}>
                      <ClipboardList className="h-4 w-4 text-amber-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {raiseTaskMilkRecord && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskMilkRecord}
          onClose={() => setRaiseTaskMilkRecord(null)}
          defaultTitle={`Organic milk withdrawal ends: ${raiseTaskMilkRecord.productName} — due ${raiseTaskMilkRecord.milkWithdrawalEndDate ? new Date(raiseTaskMilkRecord.milkWithdrawalEndDate + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`}
          defaultDescription={`Verify the organic milk withdrawal period (doubled) for '${raiseTaskMilkRecord.productName}' has ended before collecting milk from treated cows for organic sale.`}
          defaultDueDate={raiseTaskMilkRecord.milkWithdrawalEndDate ?? ""}
          taskType="organic_dairy_milk_withdrawal"
          module="Organic Dairy"
        />
      )}

      {raiseTaskMeatRecord && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskMeatRecord}
          onClose={() => setRaiseTaskMeatRecord(null)}
          defaultTitle={`Organic meat withdrawal ends: ${raiseTaskMeatRecord.productName} — due ${raiseTaskMeatRecord.meatWithdrawalEndDate ? new Date(raiseTaskMeatRecord.meatWithdrawalEndDate + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`}
          defaultDescription={`Verify the organic meat withdrawal period (doubled) for '${raiseTaskMeatRecord.productName}' has ended before sending treated cows to slaughter as organic beef.`}
          defaultDueDate={raiseTaskMeatRecord.meatWithdrawalEndDate ?? ""}
          taskType="organic_dairy_meat_withdrawal"
          module="Organic Dairy"
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Treatment Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Treatment Date *</Label>
              <Input type="date" value={form.treatmentDate ?? ""} onChange={f("treatmentDate")} />
            </div>
            <div className="space-y-1">
              <Label>Cow IDs</Label>
              <Input value={form.cowIds ?? ""} onChange={f("cowIds")} placeholder="e.g. UK123456/789" />
            </div>
            <div className="space-y-1">
              <Label>Number of Cows</Label>
              <Input type="number" value={form.numberOfCows ?? ""} onChange={f("numberOfCows")} />
            </div>
            <div className="space-y-1">
              <Label>Treatment Number</Label>
              <Input type="number" min={1} value={form.treatmentNumber ?? 1} onChange={f("treatmentNumber")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Product Name *</Label>
              <Input value={form.productName ?? ""} onChange={f("productName")} />
            </div>
            <div className="space-y-1">
              <Label>Product Category</Label>
              <Input value={form.productCategory ?? ""} onChange={f("productCategory")} placeholder="e.g. Antibiotic, NSAID" />
            </div>
            <div className="space-y-1">
              <Label>Active Ingredient</Label>
              <Input value={form.activeIngredient ?? ""} onChange={f("activeIngredient")} />
            </div>
            <div className="space-y-1">
              <Label>Dose Amount</Label>
              <Input value={form.doseAmount ?? ""} onChange={f("doseAmount")} placeholder="e.g. 5ml/100kg" />
            </div>
            <div className="space-y-1">
              <Label>Route of Administration</Label>
              <Input value={form.routeOfAdministration ?? ""} onChange={f("routeOfAdministration")} placeholder="e.g. IM, intramammary" />
            </div>
            <div className="space-y-1">
              <Label>Vet Name</Label>
              <Input value={form.vetName ?? ""} onChange={f("vetName")} />
            </div>
            <div className="space-y-1">
              <Label>Prescription Ref</Label>
              <Input value={form.prescriptionRef ?? ""} onChange={f("prescriptionRef")} />
            </div>
            <div className="space-y-1">
              <Label>Std Milk Withdrawal (days)</Label>
              <Input type="number" value={form.standardMilkWithdrawalDays ?? ""} onChange={f("standardMilkWithdrawalDays")} />
            </div>
            <div className="space-y-1">
              <Label>Doubled Milk Withdrawal (days)</Label>
              <Input type="number" value={form.doubledMilkWithdrawalDays ?? ""} onChange={f("doubledMilkWithdrawalDays")} />
            </div>
            <div className="space-y-1">
              <Label>Std Meat Withdrawal (days)</Label>
              <Input type="number" value={form.standardMeatWithdrawalDays ?? ""} onChange={f("standardMeatWithdrawalDays")} />
            </div>
            <div className="space-y-1">
              <Label>Doubled Meat Withdrawal (days)</Label>
              <Input type="number" value={form.doubledMeatWithdrawalDays ?? ""} onChange={f("doubledMeatWithdrawalDays")} />
            </div>
            <div className="space-y-1">
              <Label>Milk Withdrawal End Date</Label>
              <Input type="date" value={form.milkWithdrawalEndDate ?? ""} onChange={f("milkWithdrawalEndDate")} />
            </div>
            <div className="space-y-1">
              <Label>Meat Withdrawal End Date</Label>
              <Input type="date" value={form.meatWithdrawalEndDate ?? ""} onChange={f("meatWithdrawalEndDate")} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                checked={form.certifierNotified ?? false}
                onCheckedChange={(v) => setForm((p) => ({ ...p, certifierNotified: !!v }))}
                id="cert-notified"
              />
              <Label htmlFor="cert-notified">Certifier Notified</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={f("notes")} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrganicDairyPage() {
  const { farmId } = useAppStore();

  return (
    <AppLayout title="Organic Dairy">
      {farmId && (
        <Tabs defaultValue="herd-conversion">
          <TabsList>
            <TabsTrigger value="herd-conversion">Herd Conversion</TabsTrigger>
            <TabsTrigger value="collections">Milk Collections</TabsTrigger>
            <TabsTrigger value="feed">Feed & Nutrition</TabsTrigger>
            <TabsTrigger value="treatments">Treatment Compliance</TabsTrigger>
          </TabsList>
          <TabsContent value="herd-conversion" className="mt-4">
            <HerdConversionTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="collections" className="mt-4">
            <MilkCollectionsTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="feed" className="mt-4">
            <FeedNutritionTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="treatments" className="mt-4">
            <TreatmentsTab farmId={farmId} />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
