import { useState, useRef, useMemo } from "react";
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
import { Plus, Pencil, Trash2, ClipboardList, Eye, Printer, ChevronLeft, ChevronRight, FileDown, Droplets, AlertTriangle, Loader2 } from "lucide-react";
import { DocAttach } from "@/components/DocAttach";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { useToast } from "@/hooks/use-toast";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { MastitisTab, CalvingTab, BcsTab, MobilityTab, BulkTankTab, DctTab, RecordingVisitsTab } from "@/pages/DairyPage";
import { JohnesTab } from "@/components/dairy/JohnesMonitoringTab";
import { DairyEnterpriseReport } from "@/components/DairyEnterpriseReport";

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
  lactosePercentage: string | null;
  sccCount: number | null;
  tbcCount: number | null;
  milkTemperatureCelsius: string | null;
  tempTestedBy: string | null;
  antibioticResidueTestResult: string | null;
  abrTestedBy: string | null;
  abrTestKitLot: string | null;
  abrTestKitBatch: string | null;
  isRetest: boolean | null;
  retestOfId: number | null;
  buyerLabResultsStatus: string | null;
  buyerLabResultsDate: string | null;
  buyerLabRef: string | null;
  buyerSccCount: number | null;
  buyerTbcCount: number | null;
  buyerFatPercentage: string | null;
  buyerProteinPercentage: string | null;
  buyerLactosePercentage: string | null;
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
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="organic-dairy-herd-conversion" recordId={viewRecord.id} /></div>
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

// ─── SCC Badge ───────────────────────────────────────────────────────────────

function CollectionSccBadge({ v }: { v?: number | null }) {
  if (v == null) return <span className="text-gray-400 text-sm">—</span>;
  const ok = v < 200;
  const warn = v >= 200 && v < 400;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
      {v.toLocaleString()} k/mL
    </span>
  );
}

// ─── Monthly Summary Component ────────────────────────────────────────────────

function CollectionMonthlySummary({ records, monthLabel, farmName }: { records: CollectionRecord[]; monthLabel: string; farmName: string }) {
  const printRef = useRef<HTMLDivElement>(null);

  const totalVol = records.reduce((s, r) => s + (parseFloat(r.volumeLitres || "0") || 0), 0);
  const collectionCount = records.length;

  const fatReadings = records.map(r => r.fatPercentage ? parseFloat(r.fatPercentage) : null).filter((v): v is number => v != null && !isNaN(v));
  const avgFat = fatReadings.length > 0 ? fatReadings.reduce((a, b) => a + b, 0) / fatReadings.length : null;

  const proteinReadings = records.map(r => r.proteinPercentage ? parseFloat(r.proteinPercentage) : null).filter((v): v is number => v != null && !isNaN(v));
  const avgProtein = proteinReadings.length > 0 ? proteinReadings.reduce((a, b) => a + b, 0) / proteinReadings.length : null;

  const sccReadings = records.map(r => r.sccCount).filter((v): v is number => v != null);
  const avgScc = sccReadings.length > 0 ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;

  const totalNetValuePence = records.filter(r => r.netValuePence != null).reduce((s, r) => s + (r.netValuePence ?? 0), 0);
  const hasNetValue = records.some(r => r.netValuePence != null);

  const nonOrganicCount = records.filter(r => !r.isOrganicCollection).length;

  // Group by calendar day — sum volume, average SCC
  const byDay = new Map<string, { vol: number; sccSum: number; sccCount: number }>();
  for (const r of records) {
    const day = r.collectionDate?.slice(0, 10);
    if (!day) continue;
    const vol = parseFloat(r.volumeLitres || "0") || 0;
    const scc = r.sccCount;
    const ex = byDay.get(day) ?? { vol: 0, sccSum: 0, sccCount: 0 };
    byDay.set(day, {
      vol: ex.vol + vol,
      sccSum: scc != null ? ex.sccSum + scc : ex.sccSum,
      sccCount: scc != null ? ex.sccCount + 1 : ex.sccCount,
    });
  }

  const chartData = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      day: parseInt(date.slice(8, 10)),
      date,
      vol: Math.round(v.vol * 10) / 10,
      scc: v.sccCount > 0 ? Math.round(v.sccSum / v.sccCount) : null,
    }));

  const hasScc = chartData.some(d => d.scc != null);

  function handlePrint() {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Organic Milk Collections — ${monthLabel} — ${farmName}</title>
      <style>
        body{font-family:sans-serif;font-size:13px;color:#111;padding:24px}
        h2{margin:0 0 4px;font-size:18px} .sub{color:#6b7280;font-size:12px;margin-bottom:16px}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .stat{border:1px solid #e5e7eb;border-radius:6px;padding:10px}
        .stat-label{font-size:11px;color:#6b7280;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em}
        .stat-value{font-size:20px;font-weight:600}
        .stat-sub{font-size:11px;color:#9ca3af;margin-top:2px}
        .badge-green{background:#dcfce7;color:#166534;padding:2px 8px;border-radius:9999px;font-size:11px}
        .badge-amber{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:9999px;font-size:11px}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;padding:6px 8px;border-bottom:2px solid #e5e7eb}
        td{padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px}
      </style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    setTimeout(() => { w.addEventListener("afterprint", () => w.close()); w.print(); }, 400);
  }

  const sccColour = (v: number | null) =>
    v == null ? "text-gray-400" : v > 400 ? "text-red-700" : v > 200 ? "text-amber-700" : "text-green-700";
  const sccBg = (v: number | null) =>
    v == null ? "bg-gray-50 border-gray-200" : v > 400 ? "bg-red-50 border-red-200" : v > 200 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  return (
    <div className="mb-4 rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-800">Monthly Summary — {monthLabel}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
        </Button>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No records for this month to summarise.</p>
      ) : (
        <div className="p-4 space-y-5">
          {/* Hidden print content */}
          <div ref={printRef} style={{ display: "none" }}>
            <h2>Organic Milk Collections — {monthLabel}</h2>
            <div className="sub">{farmName} · {collectionCount} collection{collectionCount !== 1 ? "s" : ""} · Printed {new Date().toLocaleDateString("en-GB")}</div>
            <div className="stats">
              <div className="stat"><div className="stat-label">Total Volume</div><div className="stat-value">{totalVol.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</div><div className="stat-sub">{collectionCount} collections</div></div>
              <div className="stat"><div className="stat-label">Avg SCC (k/mL)</div><div className="stat-value">{avgScc != null ? avgScc.toLocaleString() : "—"}</div><div className="stat-sub">{avgScc == null ? "" : avgScc <= 200 ? "Within threshold" : avgScc <= 400 ? "Above 200k — monitor" : "High — action needed"}</div></div>
              {(avgFat != null || avgProtein != null) && <div className="stat"><div className="stat-label">Avg Fat / Protein</div><div className="stat-value">{avgFat != null ? avgFat.toFixed(2) + "%" : "—"}</div><div className="stat-sub">{avgProtein != null ? "Protein: " + avgProtein.toFixed(2) + "%" : ""}</div></div>}
              {hasNetValue && <div className="stat"><div className="stat-label">Total Net Value</div><div className="stat-value">£{(totalNetValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>}
              {nonOrganicCount > 0 && <div className="stat"><div className="stat-label">Non-organic</div><div className="stat-value">{nonOrganicCount}</div><div className="stat-sub">of {collectionCount} collections</div></div>}
            </div>
            <table>
              <thead><tr><th>Date</th><th>Collector</th><th>Volume (L)</th><th>Fat %</th><th>Protein %</th><th>SCC (k/mL)</th><th>TBC (k/mL)</th><th>Organic</th><th>Collection Docket</th><th>Net Value</th></tr></thead>
              <tbody>{[...records].sort((a, b) => (a.collectionDate ?? "").localeCompare(b.collectionDate ?? "")).map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.collectionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                  <td>{r.collectorName ?? "—"}</td>
                  <td>{r.volumeLitres ? parseFloat(r.volumeLitres).toLocaleString() : "—"}</td>
                  <td>{r.fatPercentage ? r.fatPercentage + "%" : "—"}</td>
                  <td>{r.proteinPercentage ? r.proteinPercentage + "%" : "—"}</td>
                  <td>{r.sccCount != null ? r.sccCount + "k" : "—"}</td>
                  <td>{r.tbcCount != null ? r.tbcCount + "k" : "—"}</td>
                  <td><span className={r.isOrganicCollection ? "badge-green" : "badge-amber"}>{r.isOrganicCollection ? "Organic" : `Non-organic${r.nonOrganicReason ? " — " + r.nonOrganicReason : ""}`}</span></td>
                  <td>{r.collectionSlipRef ?? "—"}</td>
                  <td>{r.netValuePence != null ? "£" + (r.netValuePence / 100).toFixed(2) : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5">
              <p className="text-xs text-blue-600 mb-0.5">Total Volume</p>
              <p className="text-xl font-bold text-blue-800">{totalVol.toLocaleString("en-GB", { maximumFractionDigits: 0 })}<span className="text-sm font-normal ml-1">L</span></p>
              <p className="text-xs text-blue-400">{collectionCount} collection{collectionCount !== 1 ? "s" : ""}</p>
            </div>
            <div className={`rounded-md border px-3 py-2.5 ${sccBg(avgScc)}`}>
              <p className={`text-xs mb-0.5 ${avgScc == null ? "text-gray-500" : avgScc > 400 ? "text-red-600" : avgScc > 200 ? "text-amber-600" : "text-green-600"}`}>Avg SCC (k/mL)</p>
              <p className={`text-xl font-bold ${sccColour(avgScc)}`}>{avgScc != null ? avgScc.toLocaleString() : "—"}</p>
              {avgScc != null && <p className={`text-xs ${sccColour(avgScc)}`}>{avgScc <= 200 ? "Within threshold" : avgScc <= 400 ? "Above 200k — monitor" : "High — action needed"}</p>}
            </div>
            <div className="rounded-md bg-green-50 border border-green-100 px-3 py-2.5">
              <p className="text-xs text-green-600 mb-0.5">Avg Fat / Protein</p>
              <p className="text-xl font-bold text-green-800">{avgFat != null ? avgFat.toFixed(2) + "%" : "—"}</p>
              <p className="text-xs text-green-500">{avgProtein != null ? "Protein: " + avgProtein.toFixed(2) + "%" : "No protein data"}</p>
            </div>
            {nonOrganicCount > 0 ? (
              <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5">
                <p className="text-xs text-amber-600 mb-0.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Non-organic</p>
                <p className="text-xl font-bold text-amber-700">{nonOrganicCount}</p>
                <p className="text-xs text-amber-600">of {collectionCount} collections</p>
              </div>
            ) : hasNetValue ? (
              <div className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                <p className="text-xs text-emerald-600 mb-0.5">Total Net Value</p>
                <p className="text-xl font-bold text-emerald-800">£{(totalNetValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2.5">
                <p className="text-xs text-gray-500 mb-0.5">Collections</p>
                <p className="text-xl font-bold text-gray-800">{collectionCount}</p>
                <p className="text-xs text-gray-400">this month</p>
              </div>
            )}
          </div>

          {/* Show net value row if non-organic card took the 4th slot */}
          {nonOrganicCount > 0 && hasNetValue && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                <p className="text-xs text-emerald-600 mb-0.5">Total Net Value</p>
                <p className="text-xl font-bold text-emerald-800">£{(totalNetValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Daily Volume{hasScc ? " & SCC Trend" : ""}
              </p>
              <ResponsiveContainer width="100%" height={210}>
                <ComposedChart data={chartData} margin={{ top: 4, right: hasScc ? 52 : 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="vol" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={50} tickFormatter={(v: number) => `${v}L`} />
                  {hasScc && (
                    <YAxis yAxisId="scc" orientation="right" tick={{ fontSize: 11, fill: "#fb923c" }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${v}k`} />
                  )}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-md shadow px-3 py-2 text-xs">
                          <p className="font-semibold text-gray-700 mb-1">
                            {new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                          </p>
                          {d.vol > 0 && <p className="text-blue-600">Volume: <span className="font-medium">{d.vol.toLocaleString()} L</span></p>}
                          {d.scc != null && <p className="text-orange-500">SCC: <span className="font-medium">{d.scc.toLocaleString()} k/mL</span></p>}
                        </div>
                      );
                    }}
                  />
                  <Bar yAxisId="vol" dataKey="vol" fill="#3b82f6" fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Volume (L)" maxBarSize={32} />
                  {hasScc && (
                    <>
                      <Line yAxisId="scc" type="monotone" dataKey="scc" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3.5, fill: "#f97316", strokeWidth: 0 }} connectNulls name="SCC (k/mL)" />
                      <ReferenceLine yAxisId="scc" y={200} stroke="#f97316" strokeDasharray="5 3" strokeOpacity={0.45} label={{ value: "200k", position: "right", fontSize: 10, fill: "#f97316" }} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-500 opacity-80" />Volume (L)</span>
                {hasScc && <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-orange-400" />SCC (k/mL) — dashed line = 200k threshold</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AbrBadge ────────────────────────────────────────────────────────────────

function AbrBadge({ result }: { result?: string | null }) {
  if (!result || result === "not-tested") return <span className="text-gray-400 text-xs">—</span>;
  const map: Record<string, string> = {
    negative: "bg-green-100 text-green-800",
    positive: "bg-red-100 text-red-800",
    borderline: "bg-amber-100 text-amber-800",
    invalid: "bg-gray-100 text-gray-600",
  };
  return <Badge className={`text-xs ${map[result] ?? "bg-gray-100 text-gray-600"}`}>{result}</Badge>;
}

function LabResultsBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const map: Record<string, string> = {
    pass: "bg-green-100 text-green-800",
    fail: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
  };
  return <Badge className={`text-xs ${map[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</Badge>;
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
  const [raiseTaskFor, setRaiseTaskFor] = useState<CollectionRecord | null>(null);
  const [formTab, setFormTab] = useState("collection");

  // Month filter — default to current month
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth()); // 0-indexed

  function stepMonth(dir: 1 | -1) {
    setFilterMonth(m => {
      const next = m + dir;
      if (next < 0) { setFilterYear(y => y - 1); return 11; }
      if (next > 11) { setFilterYear(y => y + 1); return 0; }
      return next;
    });
  }

  const monthLabel = new Date(filterYear, filterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const { data } = useQuery<{ records: CollectionRecord[] }>({
    queryKey: ["organic-dairy-collections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-dairy/collections`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const records = data?.records ?? [];

  // Filter to selected month (for display and summary)
  const filteredRecords = records.filter(r => {
    if (!r.collectionDate) return false;
    const d = new Date(r.collectionDate);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });

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
  const staffNames = members.map(m => `${m.firstName} ${m.lastName}`.trim()).filter(Boolean);

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
    setFormTab("collection");
    setOpen(true);
  }
  function openEdit(r: CollectionRecord) { setEditing(r); setForm({ ...r }); setFormTab("collection"); setOpen(true); }

  const f = (k: keyof CollectionRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  function formatPence(pence: number | null | undefined) {
    if (pence == null) return "—";
    return `£${(pence / 100).toFixed(2)}`;
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => printMilkCollectionLog(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print All Records
        </Button>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Collection
        </Button>
      </div>

      {/* ── Month Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
        <button onClick={() => stepMonth(-1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-700">{monthLabel}</span>
        <button onClick={() => stepMonth(1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Next month">
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* ── Monthly Summary ───────────────────────────────────────────────────── */}
      <CollectionMonthlySummary records={filteredRecords} monthLabel={monthLabel} farmName={farmName} />

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Collector</TableHead>
            <TableHead>Volume (L)</TableHead>
            <TableHead>Fat %</TableHead>
            <TableHead>Protein %</TableHead>
            <TableHead>SCC</TableHead>
            <TableHead>ABR</TableHead>
            <TableHead>Lab</TableHead>
            <TableHead>Organic</TableHead>
            <TableHead>Net Value</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                {records.length > 0
                  ? `No collections for ${monthLabel} — use the arrows to browse other months.`
                  : "No milk collection records yet — click Add Collection to begin."}
              </TableCell>
            </TableRow>
          )}
          {filteredRecords.map((r) => (
            <TableRow key={r.id} className={!r.isOrganicCollection ? "bg-amber-50/40" : undefined}>
              <TableCell>{fmt(r.collectionDate)}</TableCell>
              <TableCell>{r.collectorName ?? "—"}</TableCell>
              <TableCell className="font-medium">{r.volumeLitres ? `${parseFloat(r.volumeLitres).toLocaleString()} L` : "—"}</TableCell>
              <TableCell>{r.fatPercentage ? `${r.fatPercentage}%` : "—"}</TableCell>
              <TableCell>{r.proteinPercentage ? `${r.proteinPercentage}%` : "—"}</TableCell>
              <TableCell><CollectionSccBadge v={r.sccCount} /></TableCell>
              <TableCell><AbrBadge result={r.antibioticResidueTestResult} /></TableCell>
              <TableCell><LabResultsBadge status={r.buyerLabResultsStatus} /></TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <Badge className={r.isOrganicCollection ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-100"}>
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
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => setViewRecord(r)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(r.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                  {((r.sccCount != null && r.sccCount > 200) || !r.isOrganicCollection) && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-600" title="Raise Task — quality alert" onClick={() => setRaiseTaskFor(r)}>
                      <ClipboardList className="h-3.5 w-3.5" />
                    </Button>
                  )}
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
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC (k/mL)</p><p className="font-medium"><CollectionSccBadge v={viewRecord.sccCount} /></p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">TBC (k/mL)</p><p className="font-medium">{viewRecord.tbcCount ? `${viewRecord.tbcCount}k` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Milk Temperature</p><p className="font-medium">{viewRecord.milkTemperatureCelsius ? `${viewRecord.milkTemperatureCelsius} °C` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Result</p><p className="font-medium"><AbrBadge result={viewRecord.antibioticResidueTestResult} /></p></div>
              {viewRecord.abrTestedBy && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Tested By</p><p className="font-medium">{viewRecord.abrTestedBy}</p></div>}
              {viewRecord.lactosePercentage && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lactose %</p><p className="font-medium">{viewRecord.lactosePercentage}%</p></div>}
              {viewRecord.isRetest && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Retest</p><p className="font-medium text-amber-700">Follow-up retest{viewRecord.retestOfId ? ` of record #${viewRecord.retestOfId}` : ""}</p></div>}
              {viewRecord.buyerLabResultsStatus && <>
                <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buyer Lab Results — {viewRecord.buyerLabResultsStatus}</p></div>
                {viewRecord.buyerLabResultsDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Results Date</p><p className="font-medium">{viewRecord.buyerLabResultsDate}</p></div>}
                {viewRecord.buyerLabRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Ref</p><p className="font-medium">{viewRecord.buyerLabRef}</p></div>}
                {viewRecord.buyerSccCount != null && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer SCC</p><p className="font-medium">{viewRecord.buyerSccCount.toLocaleString()} k/mL</p></div>}
                {viewRecord.buyerFatPercentage && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer Fat %</p><p className="font-medium">{viewRecord.buyerFatPercentage}%</p></div>}
              </>}
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
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attachments — documents &amp; buyer lab report</p>
                <RecordAttachments farmId={farmId} recordType="organic-dairy-collection" recordId={viewRecord.id} />
              </div>
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
          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collection">Collection</TabsTrigger>
              <TabsTrigger value="quality">Quality & ABR</TabsTrigger>
              <TabsTrigger value="buyer">Buyer Lab</TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
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
                    <Input value={form.collectorName ?? ""} onChange={f("collectorName")} placeholder="e.g. Arla UK Ltd" className={suppliers.length > 0 ? "mt-1" : ""} />
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
                    <Input value={form.nonOrganicReason ?? ""} onChange={f("nonOrganicReason")} placeholder="e.g. Antibiotic withdrawal period, conversion milk…" className="border-amber-300 focus-visible:ring-amber-400" />
                    <p className="text-xs text-amber-600">Required. This milk will be sold as conventional. Notify your certifier if this occurs regularly.</p>
                  </div>
                )}
                <div className="col-span-2 space-y-1">
                  <Label>Witnessed By (farm staff present at collection)</Label>
                  {members.length > 0 ? (
                    <Select value={form.witnessedBy ?? "__none__"} onValueChange={(v) => setForm(p => ({ ...p, witnessedBy: v === "__none__" ? null : v }))}>
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
            </TabsContent>

            <TabsContent value="quality" className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Milk Temperature (°C)</Label>
                  <Input type="number" step="0.1" value={form.milkTemperatureCelsius ?? ""} onChange={f("milkTemperatureCelsius")} placeholder="e.g. 4.2" />
                  <p className="text-xs text-gray-400">Target: ≤6°C at point of collection</p>
                </div>
                <div className="space-y-1">
                  <Label>Temp Tested By</Label>
                  <datalist id="dairy-staff-list-org">{staffNames.map(n => <option key={n} value={n} />)}</datalist>
                  <Input list="dairy-staff-list-org" placeholder="Name of tester" value={form.tempTestedBy ?? ""} onChange={f("tempTestedBy")} />
                </div>
                <div className="space-y-1">
                  <Label>ABR Test Result</Label>
                  <Select value={form.antibioticResidueTestResult ?? "__none__"} onValueChange={(v) => setForm(p => ({ ...p, antibioticResidueTestResult: v === "__none__" ? null : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select result…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not tested —</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="positive">Positive ⚠</SelectItem>
                      <SelectItem value="borderline">Borderline — repeat required</SelectItem>
                      <SelectItem value="invalid">Invalid — repeat required</SelectItem>
                      <SelectItem value="not-tested">Not tested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>ABR Tested By</Label>
                  <Input list="dairy-staff-list-org" placeholder="Name of tester" value={form.abrTestedBy ?? ""} onChange={f("abrTestedBy")} />
                </div>
                <div className="space-y-1"><Label>ABR Test Kit Lot</Label><Input value={form.abrTestKitLot ?? ""} onChange={f("abrTestKitLot")} placeholder="Lot number" /></div>
                <div className="space-y-1"><Label>ABR Test Kit Batch</Label><Input value={form.abrTestKitBatch ?? ""} onChange={f("abrTestKitBatch")} placeholder="Batch / expiry" /></div>
                <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
                  <Checkbox checked={form.isRetest ?? false} onCheckedChange={(v) => setForm(p => ({ ...p, isRetest: !!v }))} id="is-retest" />
                  <Label htmlFor="is-retest" className="cursor-pointer font-normal">This is a follow-up retest of a previous non-negative result</Label>
                </div>
                {form.isRetest && (
                  <div className="col-span-2 space-y-1">
                    <Label>Retest of (original record)</Label>
                    <Select value={form.retestOfId ? String(form.retestOfId) : "__none__"} onValueChange={(v) => setForm(p => ({ ...p, retestOfId: v === "__none__" ? null : Number(v) }))}>
                      <SelectTrigger><SelectValue placeholder="Select original record…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None selected —</SelectItem>
                        {records.filter(r => r.id !== editing?.id && (r.antibioticResidueTestResult === "positive" || r.antibioticResidueTestResult === "borderline" || r.antibioticResidueTestResult === "invalid")).slice(0, 40).map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>{fmt(r.collectionDate)} — ABR {r.antibioticResidueTestResult}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1"><Label>SCC (k/mL)</Label><Input type="number" step="1" value={form.sccCount ?? ""} onChange={(e) => setForm(p => ({ ...p, sccCount: e.target.value ? Number(e.target.value) : null }))} /><p className="text-xs text-gray-400">UK limit: 200k (organic)</p></div>
                <div className="space-y-1"><Label>TBC (k/mL)</Label><Input type="number" step="1" value={form.tbcCount ?? ""} onChange={(e) => setForm(p => ({ ...p, tbcCount: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="space-y-1"><Label>Fat %</Label><Input type="number" step="0.01" value={form.fatPercentage ?? ""} onChange={f("fatPercentage")} /></div>
                <div className="space-y-1"><Label>Protein %</Label><Input type="number" step="0.01" value={form.proteinPercentage ?? ""} onChange={f("proteinPercentage")} /></div>
                <div className="col-span-2 space-y-1"><Label>Lactose %</Label><Input type="number" step="0.01" value={form.lactosePercentage ?? ""} onChange={f("lactosePercentage")} /></div>
              </div>
            </TabsContent>

            <TabsContent value="buyer" className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-md border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs text-blue-800">Buyer lab results are the processor's independent measurements. Enter them when you receive the results report from your milk buyer.</p>
                </div>
                <div className="space-y-1">
                  <Label>Buyer Lab Results Status</Label>
                  <Select value={form.buyerLabResultsStatus ?? "__none__"} onValueChange={(v) => setForm(p => ({ ...p, buyerLabResultsStatus: v === "__none__" ? null : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select status…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not received —</SelectItem>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Lab Results Date</Label><Input type="date" value={String(form.buyerLabResultsDate ?? "").slice(0, 10)} onChange={f("buyerLabResultsDate")} /></div>
                <div className="col-span-2 space-y-1"><Label>Lab Reference</Label><Input value={form.buyerLabRef ?? ""} onChange={f("buyerLabRef")} placeholder="Buyer's lab report reference" /></div>
                <div className="space-y-1"><Label>Buyer SCC (k/mL)</Label><Input type="number" value={form.buyerSccCount ?? ""} onChange={(e) => setForm(p => ({ ...p, buyerSccCount: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="space-y-1"><Label>Buyer TBC (k/mL)</Label><Input type="number" value={form.buyerTbcCount ?? ""} onChange={(e) => setForm(p => ({ ...p, buyerTbcCount: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="space-y-1"><Label>Buyer Fat %</Label><Input type="number" step="0.01" value={form.buyerFatPercentage ?? ""} onChange={f("buyerFatPercentage")} /></div>
                <div className="space-y-1"><Label>Buyer Protein %</Label><Input type="number" step="0.01" value={form.buyerProteinPercentage ?? ""} onChange={f("buyerProteinPercentage")} /></div>
                <div className="col-span-2 space-y-1"><Label>Buyer Lactose %</Label><Input type="number" step="0.01" value={form.buyerLactosePercentage ?? ""} onChange={f("buyerLactosePercentage")} /></div>
              </div>
            </TabsContent>
          </Tabs>
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

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Milk Quality Alert — ${!raiseTaskFor.isOrganicCollection ? "Non-organic Collection" : "High SCC"}`}
          defaultDescription={`Date: ${raiseTaskFor.collectionDate} · Volume: ${raiseTaskFor.volumeLitres}L · SCC: ${raiseTaskFor.sccCount != null ? raiseTaskFor.sccCount + "k/mL" : "—"} · Organic: ${raiseTaskFor.isOrganicCollection ? "Yes" : "No"}${!raiseTaskFor.isOrganicCollection && raiseTaskFor.nonOrganicReason ? " — " + raiseTaskFor.nonOrganicReason : ""}`}
          module="organic-dairy"
        />
      )}
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
  const allFeedRecords = data?.records ?? [];
  const [yearFilterFeed, setYearFilterFeed] = useState("all");
  const yearsFeed = useMemo(() => {
    const s = new Set(allFeedRecords.map(r => String(r.recordDate ?? "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allFeedRecords]);
  const records = yearFilterFeed === "all" ? allFeedRecords : allFeedRecords.filter(r => String(r.recordDate ?? "").startsWith(yearFilterFeed));

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
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={yearFilterFeed} onValueChange={setYearFilterFeed}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsFeed.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => printFeedNutritionLog(allFeedRecords, farmName)} disabled={allFeedRecords.length === 0} className="gap-1.5">
            <Printer className="h-4 w-4" />Print Feed Log
          </Button>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Feed Record
        </Button>
      </div>
      {records.length > 0 && (() => {
        const totalQty = records.reduce((s, r) => s + (r.quantityKg ? parseFloat(String(r.quantityKg)) : 0), 0);
        const totalDm = records.reduce((s, r) => s + (r.dryMatterKg ? parseFloat(String(r.dryMatterKg)) : 0), 0);
        const organicPcts = records.filter(r => r.organicPercentage != null).map(r => parseFloat(String(r.organicPercentage)));
        const avgOrganic = organicPcts.length > 0 ? organicPcts.reduce((s, v) => s + v, 0) / organicPcts.length : null;
        const approvedCount = records.filter(r => r.isOrganicApproved).length;
        const hasQty = records.some(r => r.quantityKg);
        const hasDm = records.some(r => r.dryMatterKg);
        return (
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { label: "Feed Records", value: String(records.length), color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
              ...(hasQty ? [{ label: "Total Qty", value: `${totalQty.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg`, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }] : []),
              ...(hasDm ? [{ label: "Total DM", value: `${totalDm.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg`, color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" }] : []),
              ...(avgOrganic !== null ? [{ label: "Avg Organic", value: `${avgOrganic.toFixed(0)}%`, color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0" }] : []),
              { label: "Approved", value: `${approvedCount}/${records.length}`, color: approvedCount === records.length ? "#15803d" : "#b45309", bg: approvedCount === records.length ? "#f0fdf4" : "#fffbeb", border: approvedCount === records.length ? "#bbf7d0" : "#fde68a" },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 14px", minWidth: 100 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", margin: "0 0 2px" }}>{label}</p>
                <p style={{ fontSize: "1.15rem", fontWeight: 800, color, margin: 0, lineHeight: 1.1 }}>{value}</p>
              </div>
            ))}
          </div>
        );
      })()}
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
            <TableHead>Doc</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No feed records{yearFilterFeed !== "all" ? ` for ${yearFilterFeed}` : ""} yet</TableCell>
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
              <TableCell><DocAttach farmId={farmId} endpoint="organic-dairy/feed" recordId={r.id} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["organic-dairy-feed", farmId]} compact /></TableCell>
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
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="organic-dairy-feed" recordId={viewRecord.id} /></div>
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
  const [yearFilter, setYearFilter] = useState<string>("all");

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

  const dairyTreatYears = useMemo(() => Array.from(new Set(records.map(r => String(r.treatmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredDairyTreatments = useMemo(() => yearFilter === "all" ? records : records.filter(r => String(r.treatmentDate ?? "").startsWith(yearFilter)), [records, yearFilter]);

  return (
    <div className="space-y-4">
      {medicineOrganicRecords.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span>🌿</span>
          <span><strong>{medicineOrganicRecords.length} treatment{medicineOrganicRecords.length !== 1 ? "s" : ""}</strong> auto-populated from the Medicine Register. No double entry needed.</span>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{dairyTreatYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => printDairyTreatmentRegister(records, farmName)} disabled={records.length === 0} className="gap-1.5">
            <Printer className="h-4 w-4" />Print Treatment Register
          </Button>
        </div>
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
          {filteredDairyTreatments.map((r) => (
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
          <TabsList className="flex-wrap h-auto gap-y-1">
            <TabsTrigger value="herd-conversion">Herd Conversion</TabsTrigger>
            <TabsTrigger value="collections">Milk Collections</TabsTrigger>
            <TabsTrigger value="mastitis">Mastitis</TabsTrigger>
            <TabsTrigger value="calving">Calving</TabsTrigger>
            <TabsTrigger value="bcs">Body Condition</TabsTrigger>
            <TabsTrigger value="mobility">Mobility Scoring</TabsTrigger>
            <TabsTrigger value="tank">Bulk Tank</TabsTrigger>
            <TabsTrigger value="dct">Dry Cow Therapy</TabsTrigger>
            <TabsTrigger value="recording">Recording Visits</TabsTrigger>
            <TabsTrigger value="johnes">Johne's Monitoring</TabsTrigger>
            <TabsTrigger value="feed">Feed & Nutrition</TabsTrigger>
            <TabsTrigger value="treatments">Treatment Compliance</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise Report</TabsTrigger>
          </TabsList>
          <TabsContent value="herd-conversion" className="mt-4">
            <HerdConversionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="collections" className="mt-4">
            <MilkCollectionsTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="mastitis" className="mt-4">
            <MastitisTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="calving" className="mt-4">
            <CalvingTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="bcs" className="mt-4">
            <BcsTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="mobility" className="mt-4">
            <MobilityTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="tank" className="mt-4">
            <BulkTankTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="dct" className="mt-4">
            <DctTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="recording" className="mt-4">
            <RecordingVisitsTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="johnes" className="mt-4">
            <JohnesTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="feed" className="mt-4">
            <FeedNutritionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="treatments" className="mt-4">
            <TreatmentsTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="enterprise" className="mt-4">
            <DairyEnterpriseReport farmId={farmId} />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
