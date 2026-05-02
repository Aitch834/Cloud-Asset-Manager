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
  DialogDescription,
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
import { Plus, Pencil, Trash2, ClipboardList, Eye, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";

const CERTIFIERS = [
  "Soil Association",
  "OF&G (Organic Farmers & Growers)",
  "Biodynamic Association (BDOCA)",
  "Other",
];

const LIVESTOCK_SPECIES = [
  "Cattle",
  "Sheep",
  "Pigs",
  "Poultry (Layers)",
  "Poultry (Broilers)",
  "Goats",
  "Deer",
  "Other",
];

const FEED_TYPES: [string, string][] = [
  ["Concentrate", "Concentrate"],
  ["Grass Silage", "Grass Silage"],
  ["Maize Silage", "Maize Silage"],
  ["Hay", "Hay"],
  ["Haylage", "Haylage"],
  ["Wholecrop Silage", "Wholecrop Silage"],
  ["Grazed Grass", "Grazed Grass"],
  ["Straw", "Straw"],
  ["Root Crops / Beet", "Root Crops / Beet"],
  ["Minerals & Supplements", "Minerals & Supplements"],
  ["Fishmeal", "Fishmeal"],
  ["Other", "Other"],
];

const PRODUCT_CATEGORIES = [
  "Antibiotic",
  "NSAID",
  "Anthelmintic",
  "Antiparasitic",
  "Vaccine",
  "Homeopathic",
  "Other",
];

const ROUTES_OF_ADMINISTRATION = [
  "Intramuscular (IM)",
  "Subcutaneous (SC)",
  "Intravenous (IV)",
  "Oral",
  "Intramammary",
  "Topical",
  "Other",
];

interface FarmSupplier { id: number; name: string; }

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB");
}

function fmtRaw(v: unknown): string {
  return v == null || v === "" ? "—" : String(v);
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

// ─── Print helpers ────────────────────────────────────────────────────────────

const PRINT_CSS = `
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #166534; padding-bottom: 8px; margin-bottom: 14px; }
  .hdr-l .title { font-size: 15px; font-weight: bold; color: #166534; }
  .hdr-l .farm { font-size: 12px; color: #374151; margin-top: 2px; }
  .hdr-r { font-size: 10px; color: #6b7280; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 5px 7px; text-align: left; font-size: 10px; font-weight: bold; color: #166534; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { display: inline-block; padding: 1px 7px; border-radius: 12px; font-size: 9px; font-weight: bold; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-yellow { background: #fef9c3; color: #854d0e; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-gray { background: #f3f4f6; color: #374151; }
  @media print { @page { size: A4 landscape; margin: 1.5cm; } }
`;

function openPrint(html: string) {
  const w = window.open("", "_blank", "width=1100,height=780");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.addEventListener("afterprint", () => w.close());
  setTimeout(() => w.print(), 400);
}

function printConversionRegister(records: ConversionRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmtRaw(r.herdFlockName)}</td>
      <td>${fmtRaw(r.species)}</td>
      <td>${fmtRaw(r.numberOfAnimals)}</td>
      <td><span class="badge ${r.status === 'certified' ? 'badge-green' : r.status === 'in-conversion' ? 'badge-yellow' : 'badge-red'}">${r.status.replace(/-/g, ' ')}</span></td>
      <td>${fmt(r.conversionStartDate)}</td>
      <td>${fmt(r.expectedCertDate)}</td>
      <td>${fmt(r.actualCertDate)}</td>
      <td>${fmtRaw(r.certifier)}</td>
      <td>${fmtRaw(r.certificationRef)}</td>
      <td>${r.parallelProduction ? 'Yes' : 'No'}</td>
      <td>${fmtRaw(r.notes)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Livestock Conversion Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Livestock Conversion Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Conversion Register</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Herd / Flock</th><th>Species</th><th>Animals</th><th>Status</th><th>Conv. Start</th><th>Exp. Cert</th><th>Actual Cert</th><th>Certifier</th><th>Cert Ref</th><th>Parallel</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printFeedLog(records: FeedRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmt(r.recordDate)}</td>
      <td>${fmtRaw(r.species)}</td>
      <td>${fmtRaw(r.herdFlockName)}</td>
      <td>${fmtRaw(r.feedProductName)}</td>
      <td>${fmtRaw(r.feedType)}</td>
      <td>${fmtRaw(r.supplier)}</td>
      <td>${fmtRaw(r.quantityKg)}</td>
      <td>${r.organicPercentage ? r.organicPercentage + '%' : '—'}</td>
      <td><span class="badge ${r.isOrganicApproved ? 'badge-green' : 'badge-red'}">${r.isOrganicApproved ? 'Yes' : 'No'}</span></td>
      <td>${fmtRaw(r.certifierApprovalRef)}</td>
      <td>${fmtRaw(r.poReference)}</td>
      <td>${fmtRaw(r.grnReference)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Feed Records Log — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Livestock Feed Records Log</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Feed Records</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Species</th><th>Herd/Flock</th><th>Feed Product</th><th>Type</th><th>Supplier</th><th>Qty (kg)</th><th>Organic %</th><th>Approved</th><th>Certifier Ref</th><th>PO Ref</th><th>GRN Ref</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printOutdoorAccessLog(records: OutdoorAccessRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmt(r.recordDate)}</td>
      <td>${fmtRaw(r.species)}</td>
      <td>${fmtRaw(r.herdFlockName)}</td>
      <td>${fmtRaw(r.numberOfAnimals)}</td>
      <td>${fmtRaw(r.pastureAreaHectares)}</td>
      <td>${r.stockingDensityPerHa ? r.stockingDensityPerHa + '/ha' : '—'}</td>
      <td>${fmtRaw(r.outdoorAccessHoursDay)}</td>
      <td><span class="badge ${r.complianceStatus === 'compliant' ? 'badge-green' : r.complianceStatus === 'derogation' ? 'badge-yellow' : 'badge-red'}">${r.complianceStatus}</span></td>
      <td>${fmt(r.housingStartDate)}</td>
      <td>${fmt(r.housingEndDate)}</td>
      <td>${fmtRaw(r.housingJustification)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Outdoor Access Log — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Livestock Outdoor Access Log</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Outdoor Access</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Species</th><th>Herd/Flock</th><th>Animals</th><th>Pasture (ha)</th><th>Stocking Density</th><th>Access hrs/day</th><th>Compliance</th><th>Housing Start</th><th>Housing End</th><th>Justification</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printTreatmentRegister(records: TreatmentRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmt(r.treatmentDate)}</td>
      <td>${fmtRaw(r.species)}</td>
      <td>${fmtRaw(r.animalIds)}</td>
      <td>${fmtRaw(r.numberOfAnimals)}</td>
      <td>${fmtRaw(r.productName)}</td>
      <td>${fmtRaw(r.productCategory)}</td>
      <td>${fmtRaw(r.activeIngredient)}</td>
      <td>${fmtRaw(r.doseAmount)}</td>
      <td>${fmtRaw(r.vetName)}</td>
      <td>${fmtRaw(r.prescriptionRef)}</td>
      <td>${fmtRaw(r.standardWithdrawalDays)}</td>
      <td>${fmtRaw(r.doubledWithdrawalDays)}</td>
      <td>${fmt(r.withdrawalEndDate)}</td>
      <td>${fmtRaw(r.treatmentNumber)}</td>
      <td><span class="badge ${r.certifierNotified ? 'badge-green' : 'badge-gray'}">${r.certifierNotified ? 'Yes' : 'No'}</span></td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Vet Treatment Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Livestock Vet Treatment Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Vet Treatments</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Species</th><th>Animal IDs</th><th>No.</th><th>Product</th><th>Category</th><th>Active Ingredient</th><th>Dose</th><th>Vet</th><th>Rx Ref</th><th>Std W/D</th><th>Doubled W/D</th><th>W/D End</th><th>Tx No.</th><th>Cert. Notified</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

type CoreHerd = { id: number; name: string; type: string; herdNumber: string | null; isOrganicHerd?: boolean };

// ─── ConversionTab ────────────────────────────────────────────────────────────

function ConversionTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ConversionRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<ConversionRecord | null>(null);
  const [form, setForm] = useState<Partial<ConversionRecord> & { herdId?: number | null }>({});

  const { data } = useQuery<{ records: ConversionRecord[] }>({
    queryKey: ["organic-livestock-conversion", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/conversion`).then((r) => r.json()),
    enabled: !!farmId,
  });

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
        ? `/api/farms/${farmId}/organic-livestock/conversion/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/conversion`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
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
      qc.invalidateQueries({ queryKey: ["organic-livestock-conversion", farmId] });
      qc.invalidateQueries({ queryKey: ["herds", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added — herd marked as organic in the Livestock Register" });
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
    setForm({ status: "in-conversion", parallelProduction: false, herdId: null });
    setOpen(true);
  }

  function openEdit(r: ConversionRecord) {
    setEditing(r);
    setForm({ ...r, herdId: (r as any).herdId ?? null });
    setOpen(true);
  }

  function onHerdSelect(herdId: string) {
    const herd = coreHerds.find(h => String(h.id) === herdId);
    if (herd) {
      setForm(p => ({ ...p, herdId: herd.id, herdFlockName: herd.name, species: herd.type.charAt(0).toUpperCase() + herd.type.slice(1) }));
    } else {
      setForm(p => ({ ...p, herdId: null }));
    }
  }

  const f = (k: keyof ConversionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {coreHerds.filter(h => h.isOrganicHerd).length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span className="font-semibold">🌿 {coreHerds.filter(h => h.isOrganicHerd).length} herd{coreHerds.filter(h => h.isOrganicHerd).length !== 1 ? "s" : ""} in your Livestock Register marked as organic:</span>
          {coreHerds.filter(h => h.isOrganicHerd).map(h => (
            <span key={h.id} className="inline-flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-2 py-0.5 text-xs font-medium">{h.name}</span>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => printConversionRegister(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Register
        </Button>
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
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No conversion records yet. Link a herd from your Livestock Register to get started.
              </TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.species}</TableCell>
              <TableCell>
                <span>{r.herdFlockName}</span>
                {(r as any).herdId && <span className="ml-1.5 text-xs text-green-600 font-medium">● Linked</span>}
              </TableCell>
              <TableCell>{r.numberOfAnimals ?? "—"}</TableCell>
              <TableCell>{fmt(r.conversionStartDate)}</TableCell>
              <TableCell>{fmt(r.expectedCertDate)}</TableCell>
              <TableCell>{conversionStatusBadge(r.status)}</TableCell>
              <TableCell>{r.certifier ?? "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" title="View" onClick={() => setViewRecord(r)}>
                    <Eye className="h-4 w-4" />
                  </Button>
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

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Conversion Record — {viewRecord.herdFlockName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium">{fmtRaw(viewRecord.species)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock Name</p><p className="font-medium">{fmtRaw(viewRecord.herdFlockName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Animals</p><p className="font-medium">{fmtRaw(viewRecord.numberOfAnimals)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{viewRecord.status.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion Start Date</p><p className="font-medium">{fmt(viewRecord.conversionStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Cert Date</p><p className="font-medium">{fmt(viewRecord.expectedCertDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Actual Cert Date</p><p className="font-medium">{fmt(viewRecord.actualCertDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier</p><p className="font-medium">{fmtRaw(viewRecord.certifier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Ref</p><p className="font-medium">{fmtRaw(viewRecord.certificationRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Parallel Production</p><p className="font-medium">{viewRecord.parallelProduction ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Conversion Record</DialogTitle>
            <DialogDescription>Track the organic conversion status of a herd or flock.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Link to Livestock Register Herd / Flock</Label>
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
                <p className="text-xs text-green-700 mt-1">✓ Saving will mark this herd as organic in the Livestock Register.</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Linking to a registered herd automatically flags it as organic across all modules.</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Species *</Label>
              <Select
                value={form.species ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, species: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select species…" /></SelectTrigger>
                <SelectContent>
                  {LIVESTOCK_SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Select value={form.status ?? "in-conversion"} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
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
              <Select
                value={CERTIFIERS.includes(form.certifier ?? "") ? (form.certifier ?? "") : (form.certifier ? "Other" : "")}
                onValueChange={(v) => setForm((p) => ({ ...p, certifier: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select certifier…" /></SelectTrigger>
                <SelectContent>
                  {CERTIFIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {(form.certifier === "Other" || (!!form.certifier && !CERTIFIERS.slice(0, -1).includes(form.certifier))) && (
                <Input
                  className="mt-1"
                  value={form.certifier === "Other" ? "" : (form.certifier ?? "")}
                  onChange={(e) => setForm((p) => ({ ...p, certifier: e.target.value || "Other" }))}
                  placeholder="Please specify certifying body…"
                />
              )}
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

// ─── FeedTab ──────────────────────────────────────────────────────────────────

function FeedTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeedRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<FeedRecord | null>(null);
  const [form, setForm] = useState<Partial<FeedRecord>>({});
  const [supplierId, setSupplierId] = useState<number | null>(null);

  const { data } = useQuery<{ records: FeedRecord[] }>({
    queryKey: ["organic-livestock-feed", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const records = data?.records ?? [];

  const { data: suppliersData } = useQuery<{ records: FarmSupplier[] }>({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const suppliers: FarmSupplier[] = suppliersData?.records ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-livestock/feed/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/feed`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-livestock/feed/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-livestock-feed", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setForm({ isOrganicApproved: true }); setSupplierId(null); setOpen(true); }
  function openEdit(r: FeedRecord) {
    setEditing(r);
    setForm({ ...r });
    const matched = suppliers.find((s) => s.name === (r.supplier ?? ""));
    setSupplierId(matched?.id ?? null);
    setOpen(true);
  }

  const f = (k: keyof FeedRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => printFeedLog(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Feed Log
        </Button>
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
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No feed records yet</TableCell>
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
                  <Button variant="ghost" size="icon" title="View" onClick={() => setViewRecord(r)}>
                    <Eye className="h-4 w-4" />
                  </Button>
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

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Feed Record — {viewRecord.feedProductName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmt(viewRecord.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium">{fmtRaw(viewRecord.species)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock</p><p className="font-medium">{fmtRaw(viewRecord.herdFlockName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Type</p><p className="font-medium">{fmtRaw(viewRecord.feedType)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Product</p><p className="font-medium">{fmtRaw(viewRecord.feedProductName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p><p className="font-medium">{fmtRaw(viewRecord.supplier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier Approval No.</p><p className="font-medium">{fmtRaw(viewRecord.supplierApprovalNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity (kg)</p><p className="font-medium">{fmtRaw(viewRecord.quantityKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic %</p><p className="font-medium">{viewRecord.organicPercentage ? `${viewRecord.organicPercentage}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PO Reference</p><p className="font-medium">{fmtRaw(viewRecord.poReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">GRN Reference</p><p className="font-medium">{fmtRaw(viewRecord.grnReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Approval Ref</p><p className="font-medium">{fmtRaw(viewRecord.certifierApprovalRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Derogation Reference</p><p className="font-medium">{fmtRaw(viewRecord.derogationReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Approved</p><p className="font-medium">{viewRecord.isOrganicApproved ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Feed Record</DialogTitle>
            <DialogDescription>Log organic feed supplied to livestock.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input type="date" value={form.recordDate ?? ""} onChange={f("recordDate")} />
            </div>
            <div className="space-y-1">
              <Label>Species *</Label>
              <Select
                value={form.species ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, species: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select species…" /></SelectTrigger>
                <SelectContent>
                  {LIVESTOCK_SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Herd / Flock</Label>
              <Input value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} />
            </div>
            <div className="space-y-1">
              <Label>Feed Type *</Label>
              <Select
                value={form.feedType ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, feedType: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {FEED_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Feed Product Name *</Label>
              <Input value={form.feedProductName ?? ""} onChange={f("feedProductName")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Supplier</Label>
              {suppliers.length > 0 ? (
                <>
                  <Select
                    value={supplierId ? String(supplierId) : "__manual__"}
                    onValueChange={(v) => {
                      if (v === "__manual__") {
                        setSupplierId(null);
                        setForm((p) => ({ ...p, supplier: "" }));
                      } else {
                        const s = suppliers.find((s) => String(s.id) === v);
                        setSupplierId(s?.id ?? null);
                        setForm((p) => ({ ...p, supplier: s?.name ?? "" }));
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select from supplier register…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__manual__">— Enter manually —</SelectItem>
                      {suppliers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {supplierId === null && (
                    <Input
                      className="mt-1"
                      value={form.supplier ?? ""}
                      onChange={f("supplier")}
                      placeholder="Supplier name (not in register)"
                    />
                  )}
                </>
              ) : (
                <Input value={form.supplier ?? ""} onChange={f("supplier")} />
              )}
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

// ─── OutdoorAccessTab ─────────────────────────────────────────────────────────

function OutdoorAccessTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OutdoorAccessRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<OutdoorAccessRecord | null>(null);
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
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-outdoor-access", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-livestock/outdoor-access/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-livestock-outdoor-access", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setForm({ complianceStatus: "compliant" }); setOpen(true); }
  function openEdit(r: OutdoorAccessRecord) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const f = (k: keyof OutdoorAccessRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => printOutdoorAccessLog(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Access Log
        </Button>
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
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No outdoor access records yet</TableCell>
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
                  <Button variant="ghost" size="icon" title="View" onClick={() => setViewRecord(r)}>
                    <Eye className="h-4 w-4" />
                  </Button>
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

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Outdoor Access Record — {fmt(viewRecord.recordDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmt(viewRecord.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium">{fmtRaw(viewRecord.species)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock</p><p className="font-medium">{fmtRaw(viewRecord.herdFlockName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Animals</p><p className="font-medium">{fmtRaw(viewRecord.numberOfAnimals)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pasture Area (ha)</p><p className="font-medium">{fmtRaw(viewRecord.pastureAreaHectares)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stocking Density</p><p className="font-medium">{viewRecord.stockingDensityPerHa ? `${viewRecord.stockingDensityPerHa}/ha` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outdoor Access (hrs/day)</p><p className="font-medium">{fmtRaw(viewRecord.outdoorAccessHoursDay)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Compliance Status</p><p className="font-medium">{viewRecord.complianceStatus.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Housing Start</p><p className="font-medium">{fmt(viewRecord.housingStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Housing End</p><p className="font-medium">{fmt(viewRecord.housingEndDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Housing Justification</p><p className="font-medium">{fmtRaw(viewRecord.housingJustification)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Outdoor Access Record</DialogTitle>
            <DialogDescription>Record daily outdoor access and stocking density for organic compliance.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input type="date" value={form.recordDate ?? ""} onChange={f("recordDate")} />
            </div>
            <div className="space-y-1">
              <Label>Species *</Label>
              <Select
                value={form.species ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, species: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select species…" /></SelectTrigger>
                <SelectContent>
                  {LIVESTOCK_SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Select value={form.complianceStatus ?? "compliant"} onValueChange={(v) => setForm((p) => ({ ...p, complianceStatus: v }))}>
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

// ─── TreatmentsTab ────────────────────────────────────────────────────────────

function TreatmentsTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TreatmentRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<TreatmentRecord | null>(null);
  const [raiseTaskRecord, setRaiseTaskRecord] = useState<TreatmentRecord | null>(null);
  const [form, setForm] = useState<Partial<TreatmentRecord>>({});

  const { data } = useQuery<{ records: TreatmentRecord[] }>({
    queryKey: ["organic-livestock-treatments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/treatments`).then((r) => r.json()),
    enabled: !!farmId,
  });

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
        ? `/api/farms/${farmId}/organic-livestock/treatments/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/treatments`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-livestock/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-livestock-treatments", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setForm({ certifierNotified: false, treatmentNumber: 1 }); setOpen(true); }
  function openEdit(r: TreatmentRecord) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const f = (k: keyof TreatmentRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {medicineOrganicRecords.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span>🌿</span>
          <span><strong>{medicineOrganicRecords.length} treatment{medicineOrganicRecords.length !== 1 ? "s" : ""}</strong> auto-populated from the Medicine Register. No double entry needed.</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => printTreatmentRegister(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Treatment Register
        </Button>
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
            <TableHead>Category</TableHead>
            <TableHead>Std W/D</TableHead>
            <TableHead>Organic W/D End</TableHead>
            <TableHead>Certifier Notified</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicineOrganicRecords.map((r: any) => (
            <TableRow key={`med-${r.id}`} className="bg-green-50/50">
              <TableCell>{fmt(r.administeredDate)}</TableCell>
              <TableCell>
                <span className="text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">Medicine Register</span>
              </TableCell>
              <TableCell className="font-medium">{r.medicineName}</TableCell>
              <TableCell className="text-muted-foreground">Veterinary Medicine</TableCell>
              <TableCell>{r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays}d` : "—"}</TableCell>
              <TableCell>
                {r.organicWithdrawalEndDate ? (
                  <span className="text-green-700 font-medium text-sm">{fmt(r.organicWithdrawalEndDate)} ({r.doubledWithdrawalDays}d)</span>
                ) : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                <Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                  {r.certifierNotified ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground italic">Edit in Medicines</span>
              </TableCell>
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
              <TableCell>{r.productCategory ?? "—"}</TableCell>
              <TableCell>{r.standardWithdrawalDays ? `${r.standardWithdrawalDays}d` : "—"}</TableCell>
              <TableCell>{fmt(r.withdrawalEndDate)}</TableCell>
              <TableCell>
                <Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                  {r.certifierNotified ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" title="View" onClick={() => setViewRecord(r)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {r.withdrawalEndDate && (
                    <Button variant="ghost" size="icon" title="Raise task for withdrawal end" onClick={() => setRaiseTaskRecord(r)}>
                      <ClipboardList className="h-4 w-4 text-emerald-600" />
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

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem", maxHeight: "90vh", overflowY: "auto" }}>
            <DialogHeader><DialogTitle>Treatment Record — {viewRecord.productName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Date</p><p className="font-medium">{fmt(viewRecord.treatmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium">{fmtRaw(viewRecord.species)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animal IDs</p><p className="font-medium">{fmtRaw(viewRecord.animalIds)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Animals</p><p className="font-medium">{fmtRaw(viewRecord.numberOfAnimals)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmtRaw(viewRecord.productName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Category</p><p className="font-medium">{fmtRaw(viewRecord.productCategory)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{fmtRaw(viewRecord.activeIngredient)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dose Amount</p><p className="font-medium">{fmtRaw(viewRecord.doseAmount)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Route of Administration</p><p className="font-medium">{fmtRaw(viewRecord.routeOfAdministration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{fmtRaw(viewRecord.vetName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Ref</p><p className="font-medium">{fmtRaw(viewRecord.prescriptionRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Standard Withdrawal (days)</p><p className="font-medium">{fmtRaw(viewRecord.standardWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doubled Withdrawal (days)</p><p className="font-medium">{fmtRaw(viewRecord.doubledWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal End Date</p><p className="font-medium">{fmt(viewRecord.withdrawalEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Number</p><p className="font-medium">{fmtRaw(viewRecord.treatmentNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Notified</p><p className="font-medium">{viewRecord.certifierNotified ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {raiseTaskRecord && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskRecord}
          onClose={() => setRaiseTaskRecord(null)}
          defaultTitle={`Organic withdrawal ends: ${raiseTaskRecord.productName} — due ${raiseTaskRecord.withdrawalEndDate ? new Date(raiseTaskRecord.withdrawalEndDate + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`}
          defaultDescription={`Verify animals treated with '${raiseTaskRecord.productName}' have completed their organic (doubled) withdrawal period before being sold as organic livestock.`}
          defaultDueDate={raiseTaskRecord.withdrawalEndDate ?? ""}
          taskType="organic_livestock_withdrawal"
          module="Organic Livestock"
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Treatment Record</DialogTitle>
            <DialogDescription>Record veterinary treatments with organic withdrawal periods.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Treatment Date *</Label>
              <Input type="date" value={form.treatmentDate ?? ""} onChange={f("treatmentDate")} />
            </div>
            <div className="space-y-1">
              <Label>Species *</Label>
              <Select
                value={form.species ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, species: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select species…" /></SelectTrigger>
                <SelectContent>
                  {LIVESTOCK_SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Select
                value={form.productCategory ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, productCategory: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Select
                value={form.routeOfAdministration ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, routeOfAdministration: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select route…" /></SelectTrigger>
                <SelectContent>
                  {ROUTES_OF_ADMINISTRATION.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrganicLivestockPage() {
  const { farmId } = useAppStore();
  const { data: farmData } = useQuery<{ name: string }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const name = farmData?.name ?? "Farm";

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
            <ConversionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="feed" className="mt-4">
            <FeedTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="outdoor-access" className="mt-4">
            <OutdoorAccessTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="treatments" className="mt-4">
            <TreatmentsTab farmId={farmId} farmName={name} />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
