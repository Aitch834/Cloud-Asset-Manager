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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

function complianceBadge(status: string) {
  const map: Record<string, string> = {
    compliant: "bg-green-100 text-green-800",
    "non-compliant": "bg-red-100 text-red-800",
    derogation: "bg-amber-100 text-amber-800",
  };
  return (
    <Badge className={map[status] ?? "bg-gray-100 text-gray-700"}>
      {status.replace(/-/g, " ")}
    </Badge>
  );
}

type ConversionRecord = {
  id: number;
  species: string;
  herdFlockName: string;
  numberOfAnimals: number | null;
  conversionStartDate: string;
  expectedCertDate: string | null;
  actualCertDate: string | null;
  status: string;
  certifier: string | null;
  certificationRef: string | null;
  parallelProduction: boolean;
  notes: string | null;
};

type FeedRecord = {
  id: number;
  recordDate: string;
  species: string;
  herdFlockName: string | null;
  feedType: string;
  feedProductName: string;
  supplier: string | null;
  supplierApprovalNumber: string | null;
  isOrganicApproved: boolean;
  quantityKg: string | null;
  organicPercentage: string | null;
  poReference: string | null;
  grnReference: string | null;
  certifierApprovalRef: string | null;
  derogationReference: string | null;
  notes: string | null;
};

type OutdoorAccessRecord = {
  id: number;
  recordDate: string;
  species: string;
  herdFlockName: string | null;
  numberOfAnimals: number | null;
  pastureAreaHectares: string | null;
  stockingDensityPerHa: string | null;
  outdoorAccessHoursDay: string | null;
  housingStartDate: string | null;
  housingEndDate: string | null;
  housingJustification: string | null;
  complianceStatus: string;
  notes: string | null;
};

type TreatmentRecord = {
  id: number;
  treatmentDate: string;
  species: string;
  animalIds: string | null;
  numberOfAnimals: number | null;
  productName: string;
  productCategory: string | null;
  activeIngredient: string | null;
  doseAmount: string | null;
  routeOfAdministration: string | null;
  vetName: string | null;
  prescriptionRef: string | null;
  standardWithdrawalDays: number | null;
  doubledWithdrawalDays: number | null;
  withdrawalEndDate: string | null;
  certifierNotified: boolean;
  treatmentNumber: number;
  notes: string | null;
};

function ConversionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ConversionRecord | null>(null);
  const [form, setForm] = useState<Partial<ConversionRecord>>({});

  const { data } = useQuery<{ records: ConversionRecord[] }>({
    queryKey: ["organic-livestock-conversion", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/conversion`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-livestock/conversion/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/conversion`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-conversion", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-livestock/conversion/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-conversion", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ status: "in-conversion", parallelProduction: false });
    setOpen(true);
  }

  function openEdit(r: ConversionRecord) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  const f = (k: keyof ConversionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Herd / Flock
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Species</TableHead>
            <TableHead>Herd / Flock</TableHead>
            <TableHead>Animals</TableHead>
            <TableHead>Conversion Start</TableHead>
            <TableHead>Expected Cert</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Certifier</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No conversion records yet
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.species}</TableCell>
              <TableCell>{r.herdFlockName}</TableCell>
              <TableCell>{r.numberOfAnimals ?? "—"}</TableCell>
              <TableCell>{fmt(r.conversionStartDate)}</TableCell>
              <TableCell>{fmt(r.expectedCertDate)}</TableCell>
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
            <DialogTitle>{editing ? "Edit" : "Add"} Conversion Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Species *</Label>
              <Input value={form.species ?? ""} onChange={f("species")} placeholder="e.g. Cattle, Sheep" />
            </div>
            <div className="space-y-1">
              <Label>Herd / Flock Name *</Label>
              <Input value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} />
            </div>
            <div className="space-y-1">
              <Label>Number of Animals</Label>
              <Input type="number" value={form.numberOfAnimals ?? ""} onChange={f("numberOfAnimals")} />
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
              <Label>Conversion Start Date *</Label>
              <Input type="date" value={form.conversionStartDate ?? ""} onChange={f("conversionStartDate")} />
            </div>
            <div className="space-y-1">
              <Label>Expected Certification Date</Label>
              <Input type="date" value={form.expectedCertDate ?? ""} onChange={f("expectedCertDate")} />
            </div>
            <div className="space-y-1">
              <Label>Actual Certification Date</Label>
              <Input type="date" value={form.actualCertDate ?? ""} onChange={f("actualCertDate")} />
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

function FeedTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeedRecord | null>(null);
  const [form, setForm] = useState<Partial<FeedRecord>>({});

  const { data } = useQuery<{ records: FeedRecord[] }>({
    queryKey: ["organic-livestock-feed", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-livestock/feed/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/feed`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-livestock/feed/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-feed", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ isOrganicApproved: true });
    setOpen(true);
  }

  function openEdit(r: FeedRecord) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  const f = (k: keyof FeedRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
            <TableHead>Species</TableHead>
            <TableHead>Feed Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Qty (kg)</TableHead>
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
              <TableCell>{r.species}</TableCell>
              <TableCell>{r.feedProductName}</TableCell>
              <TableCell>{r.feedType}</TableCell>
              <TableCell>{r.quantityKg ?? "—"}</TableCell>
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
              <Label>Species *</Label>
              <Input value={form.species ?? ""} onChange={f("species")} placeholder="e.g. Cattle" />
            </div>
            <div className="space-y-1">
              <Label>Herd / Flock</Label>
              <Input value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} />
            </div>
            <div className="space-y-1">
              <Label>Feed Type *</Label>
              <Input value={form.feedType ?? ""} onChange={f("feedType")} placeholder="e.g. Concentrate, Forage" />
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

function OutdoorAccessTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OutdoorAccessRecord | null>(null);
  const [form, setForm] = useState<Partial<OutdoorAccessRecord>>({});

  const { data } = useQuery<{ records: OutdoorAccessRecord[] }>({
    queryKey: ["organic-livestock-outdoor-access", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/outdoor-access`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-livestock/outdoor-access/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/outdoor-access`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-outdoor-access", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-livestock/outdoor-access/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-outdoor-access", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ complianceStatus: "compliant" });
    setOpen(true);
  }

  function openEdit(r: OutdoorAccessRecord) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  const f = (k: keyof OutdoorAccessRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Record
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Animals</TableHead>
            <TableHead>Pasture (ha)</TableHead>
            <TableHead>Stocking Density</TableHead>
            <TableHead>Access hrs/day</TableHead>
            <TableHead>Compliance</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No outdoor access records yet
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{fmt(r.recordDate)}</TableCell>
              <TableCell>{r.species}</TableCell>
              <TableCell>{r.numberOfAnimals ?? "—"}</TableCell>
              <TableCell>{r.pastureAreaHectares ?? "—"}</TableCell>
              <TableCell>{r.stockingDensityPerHa ? `${r.stockingDensityPerHa}/ha` : "—"}</TableCell>
              <TableCell>{r.outdoorAccessHoursDay ?? "—"}</TableCell>
              <TableCell>{complianceBadge(r.complianceStatus)}</TableCell>
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
            <DialogTitle>{editing ? "Edit" : "Add"} Outdoor Access Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input type="date" value={form.recordDate ?? ""} onChange={f("recordDate")} />
            </div>
            <div className="space-y-1">
              <Label>Species *</Label>
              <Input value={form.species ?? ""} onChange={f("species")} placeholder="e.g. Cattle" />
            </div>
            <div className="space-y-1">
              <Label>Herd / Flock</Label>
              <Input value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} />
            </div>
            <div className="space-y-1">
              <Label>Number of Animals</Label>
              <Input type="number" value={form.numberOfAnimals ?? ""} onChange={f("numberOfAnimals")} />
            </div>
            <div className="space-y-1">
              <Label>Pasture Area (ha)</Label>
              <Input type="number" step="0.0001" value={form.pastureAreaHectares ?? ""} onChange={f("pastureAreaHectares")} />
            </div>
            <div className="space-y-1">
              <Label>Stocking Density (per ha)</Label>
              <Input type="number" step="0.01" value={form.stockingDensityPerHa ?? ""} onChange={f("stockingDensityPerHa")} />
            </div>
            <div className="space-y-1">
              <Label>Outdoor Access (hrs/day)</Label>
              <Input type="number" step="0.5" value={form.outdoorAccessHoursDay ?? ""} onChange={f("outdoorAccessHoursDay")} />
            </div>
            <div className="space-y-1">
              <Label>Compliance Status</Label>
              <Select
                value={form.complianceStatus ?? "compliant"}
                onValueChange={(v) => setForm((p) => ({ ...p, complianceStatus: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  <SelectItem value="derogation">Derogation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Housing Start</Label>
              <Input type="date" value={form.housingStartDate ?? ""} onChange={f("housingStartDate")} />
            </div>
            <div className="space-y-1">
              <Label>Housing End</Label>
              <Input type="date" value={form.housingEndDate ?? ""} onChange={f("housingEndDate")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Housing Justification</Label>
              <Textarea value={form.housingJustification ?? ""} onChange={f("housingJustification")} rows={2} />
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
  const [editing, setEditing] = useState<TreatmentRecord | null>(null);
  const [form, setForm] = useState<Partial<TreatmentRecord>>({});

  const { data } = useQuery<{ records: TreatmentRecord[] }>({
    queryKey: ["organic-livestock-treatments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/treatments`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records = data?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-livestock/treatments/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/treatments`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/organic-livestock/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-treatments", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ certifierNotified: false, treatmentNumber: 1 });
    setOpen(true);
  }

  function openEdit(r: TreatmentRecord) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  const f = (k: keyof TreatmentRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Treatment
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tx No.</TableHead>
            <TableHead>Withdrawal End</TableHead>
            <TableHead>Certifier Notified</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No treatment records yet
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{fmt(r.treatmentDate)}</TableCell>
              <TableCell>{r.species}</TableCell>
              <TableCell>{r.productName}</TableCell>
              <TableCell>{r.productCategory ?? "—"}</TableCell>
              <TableCell>{r.treatmentNumber}</TableCell>
              <TableCell>{fmt(r.withdrawalEndDate)}</TableCell>
              <TableCell>
                <Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                  {r.certifierNotified ? "Yes" : "No"}
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
            <DialogTitle>{editing ? "Edit" : "Add"} Treatment Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Treatment Date *</Label>
              <Input type="date" value={form.treatmentDate ?? ""} onChange={f("treatmentDate")} />
            </div>
            <div className="space-y-1">
              <Label>Species *</Label>
              <Input value={form.species ?? ""} onChange={f("species")} placeholder="e.g. Cattle" />
            </div>
            <div className="space-y-1">
              <Label>Animal IDs</Label>
              <Input value={form.animalIds ?? ""} onChange={f("animalIds")} placeholder="e.g. UK123456/789" />
            </div>
            <div className="space-y-1">
              <Label>Number of Animals</Label>
              <Input type="number" value={form.numberOfAnimals ?? ""} onChange={f("numberOfAnimals")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Product Name *</Label>
              <Input value={form.productName ?? ""} onChange={f("productName")} />
            </div>
            <div className="space-y-1">
              <Label>Product Category</Label>
              <Input value={form.productCategory ?? ""} onChange={f("productCategory")} placeholder="e.g. Antibiotic" />
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
              <Input value={form.routeOfAdministration ?? ""} onChange={f("routeOfAdministration")} placeholder="e.g. IM, SC" />
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
              <Label>Standard Withdrawal (days)</Label>
              <Input type="number" value={form.standardWithdrawalDays ?? ""} onChange={f("standardWithdrawalDays")} />
            </div>
            <div className="space-y-1">
              <Label>Doubled Withdrawal (days)</Label>
              <Input type="number" value={form.doubledWithdrawalDays ?? ""} onChange={f("doubledWithdrawalDays")} />
            </div>
            <div className="space-y-1">
              <Label>Withdrawal End Date</Label>
              <Input type="date" value={form.withdrawalEndDate ?? ""} onChange={f("withdrawalEndDate")} />
            </div>
            <div className="space-y-1">
              <Label>Treatment Number</Label>
              <Input type="number" min={1} value={form.treatmentNumber ?? 1} onChange={f("treatmentNumber")} />
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

export default function OrganicLivestockPage() {
  const { farmId } = useAppStore();

  return (
    <AppLayout title="Organic Livestock">
      {farmId && (
        <Tabs defaultValue="conversion">
          <TabsList>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="feed">Feed Records</TabsTrigger>
            <TabsTrigger value="outdoor-access">Outdoor Access / Stocking</TabsTrigger>
            <TabsTrigger value="treatments">Treatment Compliance</TabsTrigger>
          </TabsList>
          <TabsContent value="conversion" className="mt-4">
            <ConversionTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="feed" className="mt-4">
            <FeedTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="outdoor-access" className="mt-4">
            <OutdoorAccessTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="treatments" className="mt-4">
            <TreatmentsTab farmId={farmId} />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
