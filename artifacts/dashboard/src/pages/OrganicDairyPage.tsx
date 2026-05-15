import { useState } from "react";
import { useUser } from "@clerk/react";
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
  ["Other", "Other"],
];

const CERTIFIERS = [
  "Soil Association",
  "OF&G (Organic Farmers & Growers)",
  "Biodynamic Association (BDOCA)",
  "Other",
];

const DAIRY_BREEDS = [
  "Holstein Friesian",
  "Jersey",
  "Ayrshire",
  "Guernsey",
  "British Friesian",
  "Brown Swiss",
  "Shorthorn (Dairy)",
  "Montbéliarde",
  "Norwegian Red",
  "Mixed / Cross-breed",
  "Other",
];

const PRODUCT_CATEGORIES = [
  "Antibiotic",
  "NSAID",
  "Anthelmintic",
  "Antiparasitic",
  "Vaccine",
  "Teat Sealant",
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

// ─── Print helpers ────────────────────────────────────────────────────────────

const PRINT_CSS = `
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0e7490; padding-bottom: 8px; margin-bottom: 14px; }
  .hdr-l .title { font-size: 15px; font-weight: bold; color: #0e7490; }
  .hdr-l .farm { font-size: 12px; color: #374151; margin-top: 2px; }
  .hdr-r { font-size: 10px; color: #6b7280; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #ecfeff; border: 1px solid #a5f3fc; padding: 5px 7px; text-align: left; font-size: 10px; font-weight: bold; color: #0e7490; }
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

function printHerdConversionRegister(records: HerdConversionRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmtRaw(r.herdName)}</td>
      <td>${fmtRaw(r.breed)}</td>
      <td>${fmtRaw(r.numberOfCows)}</td>
      <td><span class="badge ${r.status === 'certified' ? 'badge-green' : r.status === 'in-conversion' ? 'badge-yellow' : 'badge-red'}">${r.status.replace(/-/g, ' ')}</span></td>
      <td>${fmt(r.conversionStartDate)}</td>
      <td>${fmt(r.expectedMilkCertDate)}</td>
      <td>${fmt(r.actualMilkCertDate)}</td>
      <td>${fmtRaw(r.certifier)}</td>
      <td>${fmtRaw(r.certificationRef)}</td>
      <td>${r.parallelProduction ? 'Yes' : 'No'}</td>
      <td>${fmtRaw(r.notes)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Dairy Herd Conversion Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Dairy Herd Conversion Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Herd Conversion</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Herd Name</th><th>Breed</th><th>Cows</th><th>Status</th><th>Conv. Start</th><th>Exp. Milk Cert</th><th>Actual Cert</th><th>Certifier</th><th>Cert Ref</th><th>Parallel</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printMilkCollectionLog(records: CollectionRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmt(r.collectionDate)}</td>
      <td>${fmtRaw(r.collectorName)}</td>
      <td>${fmtRaw(r.vehicleRegistration)}</td>
      <td>${fmtRaw(r.volumeLitres)}</td>
      <td>${r.fatPercentage ? r.fatPercentage + '%' : '—'}</td>
      <td>${r.proteinPercentage ? r.proteinPercentage + '%' : '—'}</td>
      <td>${r.sccCount ? r.sccCount + 'k' : '—'}</td>
      <td>${r.tbcCount ? r.tbcCount + 'k' : '—'}</td>
      <td><span class="badge ${r.isOrganicCollection ? 'badge-green' : 'badge-amber'}">${r.isOrganicCollection ? 'Organic' : 'Non-organic'}${!r.isOrganicCollection && r.nonOrganicReason ? ' — ' + r.nonOrganicReason : ''}</span></td>
      <td>${fmtRaw(r.collectionSlipRef)}</td>
      <td>${fmtRaw(r.processorRef)}</td>
      <td>${r.netValuePence != null ? '£' + (r.netValuePence / 100).toFixed(2) : '—'}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Milk Collection Log — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Milk Collection Log</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Milk Collections</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Collector</th><th>Vehicle</th><th>Volume (L)</th><th>Fat %</th><th>Protein %</th><th>SCC</th><th>TBC</th><th>Organic</th><th>Collection Docket</th><th>Processor Ref</th><th>Net Value</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printFeedNutritionLog(records: DairyFeedRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmt(r.recordDate)}</td>
      <td>${fmtRaw(r.feedProductName)}</td>
      <td>${fmtRaw(r.feedType)}</td>
      <td>${fmtRaw(r.supplier)}</td>
      <td>${fmtRaw(r.quantityKg)}</td>
      <td>${fmtRaw(r.dryMatterKg)}</td>
      <td>${r.organicPercentage ? r.organicPercentage + '%' : '—'}</td>
      <td><span class="badge ${r.isOrganicApproved ? 'badge-green' : 'badge-red'}">${r.isOrganicApproved ? 'Yes' : 'No'}</span></td>
      <td>${fmtRaw(r.certifierApprovalRef)}</td>
      <td>${fmtRaw(r.poReference)}</td>
      <td>${fmtRaw(r.grnReference)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Dairy Feed & Nutrition Log — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Dairy Feed & Nutrition Log</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Feed Records</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Feed Product</th><th>Type</th><th>Supplier</th><th>Qty (kg)</th><th>DM (kg)</th><th>Organic %</th><th>Approved</th><th>Certifier Ref</th><th>PO Ref</th><th>GRN Ref</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printDairyTreatmentRegister(records: DairyTreatmentRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${fmt(r.treatmentDate)}</td>
      <td>${fmtRaw(r.cowIds)}</td>
      <td>${fmtRaw(r.numberOfCows)}</td>
      <td>${fmtRaw(r.productName)}</td>
      <td>${fmtRaw(r.productCategory)}</td>
      <td>${fmtRaw(r.activeIngredient)}</td>
      <td>${fmtRaw(r.doseAmount)}</td>
      <td>${fmtRaw(r.vetName)}</td>
      <td>${fmtRaw(r.prescriptionRef)}</td>
      <td>${fmtRaw(r.standardMilkWithdrawalDays)}</td>
      <td>${fmtRaw(r.doubledMilkWithdrawalDays)}</td>
      <td>${fmt(r.milkWithdrawalEndDate)}</td>
      <td>${fmt(r.meatWithdrawalEndDate)}</td>
      <td>${fmtRaw(r.treatmentNumber)}</td>
      <td><span class="badge ${r.certifierNotified ? 'badge-green' : 'badge-gray'}">${r.certifierNotified ? 'Yes' : 'No'}</span></td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Dairy Vet Treatment Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Dairy Vet Treatment Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Vet Treatments</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Cow IDs</th><th>No.</th><th>Product</th><th>Category</th><th>Active Ingredient</th><th>Dose</th><th>Vet</th><th>Rx Ref</th><th>Std Milk W/D</th><th>Dbl Milk W/D</th><th>Milk W/D End</th><th>Meat W/D End</th><th>Tx No.</th><th>Cert. Notified</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
  collectorSupplierId: number | null;
  vehicleRegistration: string | null;
  volumeLitres: string;
  fatPercentage: string | null;
  proteinPercentage: string | null;
  sccCount: number | null;
  tbcCount: number | null;
  isOrganicCollection: boolean;
  nonOrganicReason: string | null;
  processorRef: string | null;
  collectionSlipRef: string | null;
  deductionsPence: number | null;
  netValuePence: number | null;
  recordedByUserId: string | null;
  recordedByUserName: string | null;
  witnessedBy: string | null;
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

// ─── HerdConversionTab ────────────────────────────────────────────────────────

function HerdConversionTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HerdConversionRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<HerdConversionRecord | null>(null);
  const [form, setForm] = useState<Partial<HerdConversionRecord> & { herdId?: number | null }>({});

  const { data } = useQuery<{ records: HerdConversionRecord[] }>({
    queryKey: ["organic-dairy-herd-conversion", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/herd-conversion`).then((r) => r.json()),
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
        ? `/api/farms/${farmId}/organic-dairy/herd-conversion/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/herd-conversion`;
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-dairy-herd-conversion", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setForm({ status: "in-conversion", parallelProduction: false, herdId: null }); setOpen(true); }
  function openEdit(r: HerdConversionRecord) { setEditing(r); setForm({ ...r, herdId: (r as any).herdId ?? null }); setOpen(true); }

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
      {coreHerds.filter(h => h.isOrganicHerd).length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span className="font-semibold">🌿 {coreHerds.filter(h => h.isOrganicHerd).length} herd{coreHerds.filter(h => h.isOrganicHerd).length !== 1 ? "s" : ""} in your Livestock Register marked as organic:</span>
          {coreHerds.filter(h => h.isOrganicHerd).map(h => (
            <span key={h.id} className="inline-flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-2 py-0.5 text-xs font-medium">{h.name}</span>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => printHerdConversionRegister(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Register
        </Button>
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
            <TableHead className="w-28" />
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
            <DialogHeader><DialogTitle>Herd Conversion — {viewRecord.herdName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd Name</p><p className="font-medium">{fmtRaw(viewRecord.herdName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Breed</p><p className="font-medium">{fmtRaw(viewRecord.breed)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Cows</p><p className="font-medium">{fmtRaw(viewRecord.numberOfCows)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{viewRecord.status.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion Start Date</p><p className="font-medium">{fmt(viewRecord.conversionStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Milk Cert Date</p><p className="font-medium">{fmt(viewRecord.expectedMilkCertDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Actual Milk Cert Date</p><p className="font-medium">{fmt(viewRecord.actualMilkCertDate)}</p></div>
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
            <DialogTitle>{editing ? "Edit" : "Add"} Herd Conversion Record</DialogTitle>
            <DialogDescription>Track the organic conversion status of a dairy herd.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-green-700 mt-1">✓ Saving will mark this herd as organic in the Livestock Register.</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Linking to a registered herd flags it as organic across all modules.</p>
              )}
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Herd Name *</Label>
              <Input value={form.herdName ?? ""} onChange={f("herdName")} placeholder="e.g. Main Dairy Herd" />
            </div>
            <div className="space-y-1">
              <Label>Breed</Label>
              <Select
                value={form.breed ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, breed: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select breed…" /></SelectTrigger>
                <SelectContent>
                  {DAIRY_BREEDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Label>Expected Milk Cert Date</Label>
              <Input type="date" value={form.expectedMilkCertDate ?? ""} onChange={f("expectedMilkCertDate")} />
            </div>
            <div className="space-y-1">
              <Label>Actual Milk Cert Date</Label>
              <Input type="date" value={form.actualMilkCertDate ?? ""} onChange={f("actualMilkCertDate")} />
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

// ─── MilkCollectionsTab ───────────────────────────────────────────────────────

function MilkCollectionsTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<CollectionRecord | null>(null);
  const [form, setForm] = useState<Partial<CollectionRecord>>({});

  const { data } = useQuery<{ records: CollectionRecord[] }>({
    queryKey: ["organic-dairy-collections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/collections`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const records = data?.records ?? [];

  const { data: supplierData } = useQuery<{ records: Array<{ id: number; name: string }> }>({
    queryKey: ["farm-suppliers-for-collection", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.ok ? r.json() : { records: [] }),
    enabled: !!farmId,
  });
  const suppliers = supplierData?.records ?? [];

  const { data: membersData } = useQuery<{ members: Array<{ id: number; firstName: string; lastName: string }> }>({
    queryKey: ["farm-members-for-collection", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
    enabled: !!farmId,
  });
  const members = membersData?.members ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/collections/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/collections`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-dairy/collections/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({
      isOrganicCollection: true,
      collectionDate: new Date().toISOString().slice(0, 10),
      recordedByUserId: user?.id ?? null,
      recordedByUserName: user
        ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || user.primaryEmailAddress?.emailAddress || null)
        : null,
    });
    setOpen(true);
  }
  function openEdit(r: CollectionRecord) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const f = (k: keyof CollectionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  function formatPence(pence: number | null | undefined) {
    if (pence == null) return "—";
    return `£${(pence / 100).toFixed(2)}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => printMilkCollectionLog(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Collection Log
        </Button>
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
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No milk collection records yet</TableCell>
            </TableRow>
          )}
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{fmt(r.collectionDate)}</TableCell>
              <TableCell>{r.collectorName ?? "—"}</TableCell>
              <TableCell>{r.volumeLitres}</TableCell>
              <TableCell>{r.fatPercentage ? `${r.fatPercentage}%` : "—"}</TableCell>
              <TableCell>{r.proteinPercentage ? `${r.proteinPercentage}%` : "—"}</TableCell>
              <TableCell>{r.sccCount ? `${r.sccCount}k` : "—"}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <Badge className={r.isOrganicCollection ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800 border border-amber-300"}>
                    {r.isOrganicCollection ? "Organic" : "Non-organic"}
                  </Badge>
                  {!r.isOrganicCollection && r.nonOrganicReason && (
                    <span className="text-xs text-amber-700 truncate max-w-[110px]" title={r.nonOrganicReason}>{r.nonOrganicReason}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatPence(r.netValuePence)}</TableCell>
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
            <DialogHeader><DialogTitle>Milk Collection — {fmt(viewRecord.collectionDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{fmt(viewRecord.collectionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Volume (litres)</p><p className="font-medium">{fmtRaw(viewRecord.volumeLitres)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collector</p><p className="font-medium">{fmtRaw(viewRecord.collectorName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle Registration</p><p className="font-medium">{fmtRaw(viewRecord.vehicleRegistration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fat %</p><p className="font-medium">{viewRecord.fatPercentage ? `${viewRecord.fatPercentage}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protein %</p><p className="font-medium">{viewRecord.proteinPercentage ? `${viewRecord.proteinPercentage}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC (000s/ml)</p><p className="font-medium">{viewRecord.sccCount ? `${viewRecord.sccCount}k` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">TBC (000s/ml)</p><p className="font-medium">{viewRecord.tbcCount ? `${viewRecord.tbcCount}k` : "—"}</p></div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Certified</p>
                <p className="font-medium">{viewRecord.isOrganicCollection
                  ? <span className="text-green-700">Yes — sold as organic</span>
                  : <span className="text-amber-700">No — sold as conventional</span>
                }</p>
              </div>
              {!viewRecord.isOrganicCollection && viewRecord.nonOrganicReason && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Reason (non-organic)</p><p className="font-medium text-amber-800">{viewRecord.nonOrganicReason}</p></div>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Processor Ref</p><p className="font-medium">{fmtRaw(viewRecord.processorRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Docket / Receipt Ref</p><p className="font-medium">{fmtRaw(viewRecord.collectionSlipRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Deductions</p><p className="font-medium">{viewRecord.deductionsPence != null ? `${viewRecord.deductionsPence}p` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Value</p><p className="font-medium">{formatPence(viewRecord.netValuePence)}</p></div>
              {viewRecord.witnessedBy && (
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Witnessed By</p><p className="font-medium">{viewRecord.witnessedBy}</p></div>
              )}
              {viewRecord.recordedByUserName && (
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Recorded By</p><p className="font-medium">{viewRecord.recordedByUserName}</p></div>
              )}
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
            <DialogTitle>{editing ? "Edit" : "Add"} Milk Collection</DialogTitle>
            <DialogDescription>Record each milk collection with quality metrics and organic certification status.</DialogDescription>
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

            <div className="col-span-2 space-y-1">
              <Label>Collector (Milk Buyer)</Label>
              {suppliers.length > 0 && (
                <Select
                  value={form.collectorSupplierId ? String(form.collectorSupplierId) : "__other__"}
                  onValueChange={(v) => {
                    if (v === "__other__") {
                      setForm(p => ({ ...p, collectorSupplierId: null }));
                    } else {
                      const sup = suppliers.find(s => s.id === Number(v));
                      setForm(p => ({ ...p, collectorSupplierId: Number(v), collectorName: sup?.name ?? p.collectorName ?? null }));
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Choose from suppliers register…" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    <SelectItem value="__other__">Other — enter name below</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {!form.collectorSupplierId && (
                <Input
                  value={form.collectorName ?? ""}
                  onChange={f("collectorName")}
                  placeholder="e.g. Arla UK Ltd"
                  className={suppliers.length > 0 ? "mt-1" : ""}
                />
              )}
            </div>

            <div className="space-y-1">
              <Label>Vehicle Registration</Label>
              <Input value={form.vehicleRegistration ?? ""} onChange={f("vehicleRegistration")} placeholder="e.g. AB12 CDE" />
            </div>
            <div className="space-y-1">
              <Label>Processor Ref</Label>
              <Input value={form.processorRef ?? ""} onChange={f("processorRef")} />
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
              <Input type="number" step="1" value={form.sccCount ?? ""} onChange={(e) => setForm(p => ({ ...p, sccCount: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div className="space-y-1">
              <Label>TBC (000s/ml)</Label>
              <Input type="number" step="1" value={form.tbcCount ?? ""} onChange={(e) => setForm(p => ({ ...p, tbcCount: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div className="space-y-1">
              <Label>Collection Docket / Receipt Ref</Label>
              <Input value={form.collectionSlipRef ?? ""} onChange={f("collectionSlipRef")} placeholder="Docket number from tanker driver" />
            </div>
            <div className="space-y-1">
              <Label>Deductions (pence)</Label>
              <Input type="number" value={form.deductionsPence ?? ""} onChange={(e) => setForm(p => ({ ...p, deductionsPence: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Net Value (pence)</Label>
              <Input type="number" value={form.netValuePence ?? ""} onChange={(e) => setForm(p => ({ ...p, netValuePence: e.target.value ? Number(e.target.value) : null }))} />
            </div>

            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox
                checked={form.isOrganicCollection ?? true}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isOrganicCollection: !!v, nonOrganicReason: !!v ? null : p.nonOrganicReason }))}
                id="organic-cert"
              />
              <Label htmlFor="organic-cert" className="cursor-pointer font-normal">This collection is certified as Organic</Label>
            </div>
            {!form.isOrganicCollection && (
              <div className="col-span-2 space-y-1">
                <Label className="text-amber-700">Reason — non-organic collection *</Label>
                <Input
                  value={form.nonOrganicReason ?? ""}
                  onChange={f("nonOrganicReason")}
                  placeholder="e.g. Antibiotic withdrawal period, conversion milk…"
                  className="border-amber-300 focus-visible:ring-amber-400"
                />
                <p className="text-xs text-amber-600">Required. This milk will be sold as conventional. Notify your certifier if this occurs regularly.</p>
              </div>
            )}

            <div className="col-span-2 space-y-1">
              <Label>Witnessed By (farm staff present at collection)</Label>
              {members.length > 0 ? (
                <Select
                  value={form.witnessedBy ?? "__none__"}
                  onValueChange={(v) => setForm(p => ({ ...p, witnessedBy: v === "__none__" ? null : v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Not specified —</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.id} value={`${m.firstName} ${m.lastName}`}>{m.firstName} {m.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.witnessedBy ?? ""} onChange={f("witnessedBy")} placeholder="Name of farm staff present" />
              )}
            </div>

            {form.recordedByUserName && (
              <div className="col-span-2 space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Recorded By (system user)</Label>
                <Input value={form.recordedByUserName} readOnly className="bg-muted/40 text-muted-foreground cursor-default" />
              </div>
            )}

            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={f("notes")} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!form.isOrganicCollection && !form.nonOrganicReason?.trim()) {
                  toast({ title: "Reason required", description: "Please explain why this collection is non-organic before saving.", variant: "destructive" });
                  return;
                }
                save.mutate();
              }}
              disabled={save.isPending}
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FeedNutritionTab ─────────────────────────────────────────────────────────

function FeedNutritionTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DairyFeedRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<DairyFeedRecord | null>(null);
  const [form, setForm] = useState<Partial<DairyFeedRecord>>({});
  const [supplierId, setSupplierId] = useState<string>("");
  const [derogCaseId, setDerogCaseId] = useState<string>("");

  const { data: derogCasesData } = useQuery<{ cases: Array<{ id: number; ingredientName: string; certifierRef: string | null; status: string; expiryDate: string | null; species: string | null }> }>({
    queryKey: ["feed-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations`).then(r => r.json()),
    enabled: !!farmId,
  });
  const derogCases = (derogCasesData?.cases ?? []).filter(c => c.status === "approved");

  const { data } = useQuery<{ records: DairyFeedRecord[] }>({
    queryKey: ["organic-dairy-feed", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/feed`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const records = data?.records ?? [];

  const { data: suppData } = useQuery<{ suppliers: FarmSupplier[] }>({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const suppliers = suppData?.suppliers ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/feed/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/feed`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-dairy/feed/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-dairy-feed", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setForm({ isOrganicApproved: true, recordDate: new Date().toISOString().slice(0, 10) }); setSupplierId(""); setDerogCaseId(""); setOpen(true); }
  function openEdit(r: DairyFeedRecord) {
    setEditing(r);
    setForm({ ...r });
    const matched = suppliers.find(s => s.name === r.supplier);
    setSupplierId(matched ? String(matched.id) : "");
    setDerogCaseId("");
    setOpen(true);
  }

  const f = (k: keyof DairyFeedRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => printFeedNutritionLog(records, farmName)} disabled={records.length === 0} className="gap-1.5">
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
            <TableHead>Feed Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Qty (kg)</TableHead>
            <TableHead>DM (kg)</TableHead>
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
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Type</p><p className="font-medium">{fmtRaw(viewRecord.feedType)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Product</p><p className="font-medium">{fmtRaw(viewRecord.feedProductName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p><p className="font-medium">{fmtRaw(viewRecord.supplier)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier Approval No.</p><p className="font-medium">{fmtRaw(viewRecord.supplierApprovalNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity (kg)</p><p className="font-medium">{fmtRaw(viewRecord.quantityKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dry Matter (kg)</p><p className="font-medium">{fmtRaw(viewRecord.dryMatterKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic %</p><p className="font-medium">{viewRecord.organicPercentage ? `${viewRecord.organicPercentage}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Approved</p><p className="font-medium">{viewRecord.isOrganicApproved ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PO Reference</p><p className="font-medium">{fmtRaw(viewRecord.poReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">GRN Reference</p><p className="font-medium">{fmtRaw(viewRecord.grnReference)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Approval Ref</p><p className="font-medium">{fmtRaw(viewRecord.certifierApprovalRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Derogation Reference</p><p className="font-medium">{fmtRaw(viewRecord.derogationReference)}</p></div>
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
            <DialogDescription>Log organic feed given to the dairy herd.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input type="date" value={form.recordDate ?? ""} onChange={f("recordDate")} />
            </div>
            <div className="space-y-1">
              <Label>Feed Type *</Label>
              <Select value={form.feedType ?? ""} onValueChange={v => setForm(p => ({ ...p, feedType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select feed type…" /></SelectTrigger>
                <SelectContent>
                  {FEED_TYPES.map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Feed Product Name *</Label>
              <Input value={form.feedProductName ?? ""} onChange={f("feedProductName")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Supplier</Label>
              <Select
                value={supplierId || "__text__"}
                onValueChange={v => {
                  if (v === "__text__") {
                    setSupplierId("");
                    setForm(p => ({ ...p, supplier: "" }));
                  } else {
                    setSupplierId(v);
                    setForm(p => ({ ...p, supplier: suppliers.find(s => String(s.id) === v)?.name ?? "" }));
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select from supplier register…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__text__">— Type supplier name manually —</SelectItem>
                  {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {!supplierId && (
                <Input className="mt-2" value={form.supplier ?? ""} onChange={f("supplier")} placeholder="Supplier name (if not in register)" />
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
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                checked={form.isOrganicApproved ?? true}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isOrganicApproved: !!v }))}
                id="organic-approved"
              />
              <Label htmlFor="organic-approved">Organic Approved</Label>
            </div>
            {!form.isOrganicApproved && derogCases.length > 0 && (
              <div className="col-span-2 space-y-1">
                <Label>Link to Approved Feed Derogation Case (Article 22)</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={derogCaseId}
                  onChange={e => {
                    const cid = e.target.value;
                    setDerogCaseId(cid);
                    if (cid) {
                      const c = derogCases.find(dc => String(dc.id) === cid);
                      if (c) setForm(p => ({ ...p, certifierApprovalRef: c.certifierRef ?? p.certifierApprovalRef ?? "", derogationReference: c.certifierRef ?? p.derogationReference ?? "" }));
                    }
                  }}
                >
                  <option value="">— Select an approved case to auto-fill references —</option>
                  {derogCases.map(c => (
                    <option key={c.id} value={String(c.id)}>
                      {c.ingredientName}{c.species ? ` (${c.species})` : ""} — Ref: {c.certifierRef ?? "no ref"}{c.expiryDate ? ` · expires ${new Date(c.expiryDate).toLocaleDateString("en-GB")}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Selecting an approved derogation case auto-fills the references below.</p>
              </div>
            )}
            {!form.isOrganicApproved && derogCases.length === 0 && (
              <div className="col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                No approved feed derogation cases found for this farm. Create and approve a case in Organic Livestock → Feed Derogations before linking it here.
              </div>
            )}
            <div className="space-y-1">
              <Label>Certifier Approval Ref</Label>
              <Input value={form.certifierApprovalRef ?? ""} onChange={f("certifierApprovalRef")} />
            </div>
            <div className="space-y-1">
              <Label>Derogation Reference</Label>
              <Input value={form.derogationReference ?? ""} onChange={f("derogationReference")} />
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
  const [editing, setEditing] = useState<DairyTreatmentRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<DairyTreatmentRecord | null>(null);
  const [raiseTaskMilkRecord, setRaiseTaskMilkRecord] = useState<DairyTreatmentRecord | null>(null);
  const [raiseTaskMeatRecord, setRaiseTaskMeatRecord] = useState<DairyTreatmentRecord | null>(null);
  const [form, setForm] = useState<Partial<DairyTreatmentRecord>>({});

  const { data } = useQuery<{ records: DairyTreatmentRecord[] }>({
    queryKey: ["organic-dairy-treatments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/treatments`).then((r) => r.json()),
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
        ? `/api/farms/${farmId}/organic-dairy/treatments/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/treatments`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-dairy/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setForm({ certifierNotified: false, treatmentNumber: 1, treatmentDate: new Date().toISOString().slice(0, 10) }); setOpen(true); }
  function openEdit(r: DairyTreatmentRecord) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const f = (k: keyof DairyTreatmentRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
        <Button variant="outline" size="sm" onClick={() => printDairyTreatmentRegister(records, farmName)} disabled={records.length === 0} className="gap-1.5">
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
            <TableHead>Std W/D</TableHead>
            <TableHead>Organic Milk W/D End</TableHead>
            <TableHead>Organic Meat W/D End</TableHead>
            <TableHead>Certifier Notified</TableHead>
            <TableHead className="w-32" />
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
              <TableCell>{(r as any).standardMilkWithdrawalDays ? `${(r as any).standardMilkWithdrawalDays}d` : "—"}</TableCell>
              <TableCell>{fmt(r.milkWithdrawalEndDate)}</TableCell>
              <TableCell>{fmt(r.meatWithdrawalEndDate)}</TableCell>
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

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem", maxHeight: "90vh", overflowY: "auto" }}>
            <DialogHeader><DialogTitle>Treatment Record — {viewRecord.productName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Date</p><p className="font-medium">{fmt(viewRecord.treatmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cow IDs</p><p className="font-medium">{fmtRaw(viewRecord.cowIds)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Cows</p><p className="font-medium">{fmtRaw(viewRecord.numberOfCows)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Number</p><p className="font-medium">{fmtRaw(viewRecord.treatmentNumber)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmtRaw(viewRecord.productName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Category</p><p className="font-medium">{fmtRaw(viewRecord.productCategory)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{fmtRaw(viewRecord.activeIngredient)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dose Amount</p><p className="font-medium">{fmtRaw(viewRecord.doseAmount)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Route of Administration</p><p className="font-medium">{fmtRaw(viewRecord.routeOfAdministration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{fmtRaw(viewRecord.vetName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Ref</p><p className="font-medium">{fmtRaw(viewRecord.prescriptionRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Std Milk Withdrawal (days)</p><p className="font-medium">{fmtRaw(viewRecord.standardMilkWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doubled Milk Withdrawal (days)</p><p className="font-medium">{fmtRaw(viewRecord.doubledMilkWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Std Meat Withdrawal (days)</p><p className="font-medium">{fmtRaw(viewRecord.standardMeatWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doubled Meat Withdrawal (days)</p><p className="font-medium">{fmtRaw(viewRecord.doubledMeatWithdrawalDays)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Withdrawal End Date</p><p className="font-medium">{fmt(viewRecord.milkWithdrawalEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Meat Withdrawal End Date</p><p className="font-medium">{fmt(viewRecord.meatWithdrawalEndDate)}</p></div>
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
            <DialogDescription>Record veterinary treatments with organic withdrawal periods for milk and meat.</DialogDescription>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrganicDairyPage() {
  const { farmId } = useAppStore();
  const { data: farmData } = useQuery<{ name: string }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const name = farmData?.name ?? "Farm";

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
            <HerdConversionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="collections" className="mt-4">
            <MilkCollectionsTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="feed" className="mt-4">
            <FeedNutritionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="treatments" className="mt-4">
            <TreatmentsTab farmId={farmId} farmName={name} />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
