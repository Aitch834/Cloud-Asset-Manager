import React, { useState } from "react";
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
import { Plus, Pencil, Trash2, ClipboardList, Eye, Printer, FileText, Bell, AlertTriangle, Upload, ChevronDown, ChevronRight, Mail, ArrowDownToLine, ArrowUpFromLine, Paperclip, ExternalLink } from "lucide-react";
import { DocAttach } from "@/components/DocAttach";
import { useToast } from "@/hooks/use-toast";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { MortalitySection } from "@/pages/livestock/MortalitySection";
import {
  HerdsSection, AnimalsSection, VetHealthPlansSection,
  FallenStockContractorsSection, FeedSection, WaterSection,
  SiresSection, AIReproductionSection, VetPrescriptionsSection,
  StrawInventorySection, LambingSection, TbTestsSection,
  WelfareOutcomeSection, SheepDippingSection,
} from "@/pages/LivestockPage";

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

interface FarmSupplier {
  id: number;
  name: string;
  supplierType?: string | null;
  ufasNumber?: string | null;
  femasNumber?: string | null;
  certificationBody?: string | null;
}

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
  certDocumentPath: string | null;
  certDocumentName: string | null;
  notes: string | null;
};

type ParallelNotification = {
  id: number;
  conversionId: number;
  notificationYear: number;
  notifiedDate: string;
  certifierRef: string | null;
  documentPath: string | null;
  documentName: string | null;
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
  derogationCaseId: number | null;
  notes: string | null;
};

type DerogationCase = {
  id: number;
  ingredientName: string;
  feedProductName: string | null;
  species: string | null;
  certifier: string | null;
  status: string;
  certifierRef: string | null;
  regulatoryCategory: string | null;
  appliedDate: string | null;
  decisionDate: string | null;
  expiryDate: string | null;
  availabilitySearchDone: boolean;
  justification: string | null;
  conditions: string | null;
  notes: string | null;
};

type DerogationCorrespondence = {
  id: number;
  derogationId: number;
  correspondenceDate: string;
  direction: string;
  subject: string;
  body: string | null;
  notes: string | null;
};

type DerogationDocument = {
  id: number;
  recordType: string;
  recordId: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  mimeType: string | null;
  fileSize: number | null;
  notes: string | null;
  uploadedAt: string;
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

// ─── Parallel Production Notification Letter Template ─────────────────────────

function printParallelNotificationLetter(conversion: ConversionRecord, notification: ParallelNotification, farmName: string) {
  const fmtD = (d: string | null | undefined) =>
    d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Parallel Production Annual Notification ${notification.notificationYear} — ${conversion.herdFlockName}</title>
  <style>
    body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.6;margin:2.5cm;color:#111}
    h1{font-size:13pt;font-weight:bold;border-bottom:2px solid #333;padding-bottom:.3em;margin-bottom:.5em}
    h2{font-size:11pt;font-weight:bold;margin-top:1.4em;margin-bottom:.25em}
    table{border-collapse:collapse;width:100%;margin:.6em 0}
    th,td{border:1px solid #aaa;padding:5px 10px;text-align:left;vertical-align:top}
    th{background:#f4f4f4;font-weight:bold;width:40%}
    ul{margin:.4em 0;padding-left:1.5em}li{margin-bottom:.2em}
    .sig-line{border-bottom:1px solid #555;display:inline-block;min-width:220px}
    @media print{body{margin:1.5cm}}
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;margin-bottom:2em">
    <div><strong>${farmName}</strong></div>
    <div><strong>Date:</strong> ${today}</div>
  </div>
  <div style="margin-bottom:1.5em"><strong>To:</strong> ${conversion.certifier ?? "[Certifying Body Name and Address]"}</div>
  <h1>ANNUAL NOTIFICATION OF PARALLEL PRODUCTION ARRANGEMENTS</h1>
  <p><strong>Certification Year:</strong> ${notification.notificationYear} &nbsp;&nbsp; <strong>Date of Notification:</strong> ${fmtD(notification.notifiedDate)}</p>
  <p>In accordance with UK Organic Regulations 2020 and our organic certification agreement, we hereby provide our annual notification of parallel production arrangements maintained on our holding during the certification year <strong>${notification.notificationYear}</strong>.</p>
  <h2>1. Operator Details</h2>
  <table>
    <tr><th>Farm / Holding Name</th><td>${farmName}</td></tr>
    <tr><th>Organic Certificate Number</th><td>${conversion.certificationRef ?? "—"}</td></tr>
    <tr><th>Certification Body</th><td>${conversion.certifier ?? "—"}</td></tr>
  </table>
  <h2>2. Parallel Production Unit</h2>
  <table>
    <tr><th>Species</th><td>${conversion.species}</td></tr>
    <tr><th>Herd / Flock Name</th><td>${conversion.herdFlockName}</td></tr>
    <tr><th>Number of Animals (Organic Unit)</th><td>${conversion.numberOfAnimals ?? "See attached records"}</td></tr>
    <tr><th>Organic Conversion Start Date</th><td>${fmtD(conversion.conversionStartDate)}</td></tr>
    <tr><th>Non-organic unit of same species maintained on holding</th><td>Yes</td></tr>
  </table>
  <h2>3. Segregation Measures in Place</h2>
  <table>
    <tr><th>Measure</th><th style="width:12%;text-align:center">Confirmed</th></tr>
    <tr><td>Organic and non-organic production units are kept fully separate at all times</td><td style="text-align:center">&#10003;</td></tr>
    <tr><td>Organic animals are clearly and permanently identifiable</td><td style="text-align:center">&#10003;</td></tr>
    <tr><td>Separate housing, grazing areas and handling facilities maintained</td><td style="text-align:center">&#10003;</td></tr>
    <tr><td>Separate records maintained for organic and non-organic units</td><td style="text-align:center">&#10003;</td></tr>
    <tr><td>No mixing of organic and non-organic animals at any stage</td><td style="text-align:center">&#10003;</td></tr>
  </table>
  <h2>4. Compliance Declaration</h2>
  <p>We confirm that:</p>
  <ul>
    <li>Our organic management practices continue to comply with UK Organic Regulations 2020.</li>
    <li>Full production records for both organic and non-organic units are maintained and available for inspection at any time.</li>
    <li>Our certification body's prior written approval for parallel production is held on file.</li>
    ${notification.certifierRef ? `<li>Certifier approval / acknowledgement reference: <strong>${notification.certifierRef}</strong></li>` : ""}
  </ul>
  ${notification.notes ? `<h2>5. Additional Notes</h2><p>${notification.notes}</p>` : ""}
  <div style="margin-top:3em">
    <p>We request that you acknowledge receipt of this annual notification. Please contact us if any further information is required.</p>
    <br/><p>Yours faithfully,</p><br/><br/>
    <p><span class="sig-line"></span></p>
    <p><strong>${farmName}</strong></p>
    <p>Date:&nbsp;<span class="sig-line" style="min-width:160px"></span></p>
  </div>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`;
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups to generate the notification letter."); return; }
  w.document.write(html);
  w.document.close();
}

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

  // ── Parallel production annual notifications ──────────────────────────────
  const [notifConversion, setNotifConversion] = useState<ConversionRecord | null>(null);
  const [notifForm, setNotifForm] = useState({ notificationYear: new Date().getFullYear(), notifiedDate: "", certifierRef: "", notes: "" });

  const { data: notifData } = useQuery<{ notifications: ParallelNotification[] }>({
    queryKey: ["parallel-notifications", notifConversion?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/parallel-notifications/${notifConversion!.id}`).then(r => r.json()),
    enabled: !!notifConversion,
  });
  const notifications = notifData?.notifications ?? [];

  const saveNotif = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/organic-livestock/parallel-notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversionId: notifConversion?.id, ...notifForm }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parallel-notifications", notifConversion?.id] });
      setNotifForm({ notificationYear: new Date().getFullYear(), notifiedDate: "", certifierRef: "", notes: "" });
      toast({ title: "Notification recorded" });
    },
    onError: () => toast({ title: "Failed to save notification", variant: "destructive" }),
  });

  const deleteNotif = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-livestock/parallel-notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parallel-notifications", notifConversion?.id] }),
    onError: () => toast({ title: "Failed to delete notification", variant: "destructive" }),
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
            <TableHead>Cert Doc</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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
                <DocAttach
                  farmId={farmId}
                  endpoint="organic-livestock/conversion"
                  recordId={r.id}
                  documentPath={r.certDocumentPath}
                  documentName={r.certDocumentName}
                  queryKey={["organic-livestock-conversion", String(farmId)]}
                />
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
                  {r.parallelProduction && (
                    <Button variant="ghost" size="icon" title="Annual Parallel Production Notifications" onClick={() => { setNotifConversion(r); setNotifForm({ notificationYear: new Date().getFullYear(), notifiedDate: "", certifierRef: "", notes: "" }); }}>
                      <Bell className="h-4 w-4 text-amber-500" />
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
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Parallel Production</p><p className="font-medium">{viewRecord.parallelProduction ? "Yes — certifier approval required" : "No"}</p></div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Document</p>
                {viewRecord.certDocumentName ? (
                  <p className="font-medium flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-600" />{viewRecord.certDocumentName}</p>
                ) : (
                  <p className="font-medium text-muted-foreground text-sm">No document attached</p>
                )}
              </div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {notifConversion && (
        <Dialog open onOpenChange={() => setNotifConversion(null)}>
          <DialogContent style={{ maxWidth: "58rem" }} className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Annual Parallel Production Notifications — {notifConversion.herdFlockName}</DialogTitle>
              <DialogDescription>
                Record each year's annual notification sent to your certifying body. UK Organic Regulations 2020 require annual notification of all parallel production arrangements. Generate a pre-filled letter for each year to send or email to your certifier.
              </DialogDescription>
            </DialogHeader>

            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              <p className="text-sm font-semibold">Record a New Annual Notification</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Notification Year</Label>
                  <Input type="number" min={2000} max={2099} value={notifForm.notificationYear} onChange={e => setNotifForm(p => ({ ...p, notificationYear: parseInt(e.target.value) || new Date().getFullYear() }))} />
                </div>
                <div className="space-y-1">
                  <Label>Date Notified</Label>
                  <Input type="date" value={notifForm.notifiedDate} onChange={e => setNotifForm(p => ({ ...p, notifiedDate: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Certifier Ref / Acknowledgement</Label>
                  <Input value={notifForm.certifierRef} onChange={e => setNotifForm(p => ({ ...p, certifierRef: e.target.value }))} placeholder="e.g. ACK-2024-001" />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label>Notes</Label>
                  <Textarea value={notifForm.notes} onChange={e => setNotifForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any additional details about this year's notification…" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveNotif.mutate()} disabled={saveNotif.isPending || !notifForm.notifiedDate}>
                  {saveNotif.isPending ? "Saving…" : "Save Notification"}
                </Button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No annual notifications recorded yet for this herd/flock.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Date Notified</TableHead>
                    <TableHead>Certifier Ref</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map(n => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.notificationYear}</TableCell>
                      <TableCell>{fmt(n.notifiedDate)}</TableCell>
                      <TableCell>{n.certifierRef ?? "—"}</TableCell>
                      <TableCell>
                        <DocAttach
                          farmId={farmId}
                          endpoint="organic-livestock/parallel-notifications"
                          recordId={n.id}
                          documentPath={n.documentPath}
                          documentName={n.documentName}
                          queryKey={["parallel-notifications", String(notifConversion.id)]}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" title="Generate Notification Letter" onClick={() => printParallelNotificationLetter(notifConversion, n, farmName)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteNotif.mutate(n.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotifConversion(null)}>Close</Button>
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
            {form.parallelProduction && (
              <div className="col-span-2 rounded-md border border-amber-400 bg-amber-50 px-4 py-3 text-sm">
                <p className="font-semibold text-amber-800 mb-1">Certifier Approval Required</p>
                <p className="text-amber-700">Under UK Organic Regulations 2020, parallel production — running organic and non-organic animals of the same species on the same holding — requires explicit written approval from your certification body. Ensure written approval is obtained before parallel production commences, record the certification reference above, and notify your certifier annually. Keep approval documentation on file for inspection.</p>
              </div>
            )}
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
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterSpecies, setFilterSpecies] = useState<string>("all");

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

  const { data: derogationsData } = useQuery<{ cases: DerogationCase[] }>({
    queryKey: ["feed-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations`).then(r => r.json()),
    enabled: !!farmId,
  });
  const activeDerogations = (derogationsData?.cases ?? []).filter(c => c.status === "approved");

  const yearOptions = Array.from(new Set(records.map(r => r.recordDate?.slice(0, 4)).filter(Boolean))).sort().reverse() as string[];
  const speciesOptions = Array.from(new Set(records.map(r => r.species).filter(Boolean))).sort() as string[];
  const multipleSpecies = speciesOptions.length > 1;
  const filteredRecords = records.filter(r => {
    if (filterYear !== "all" && r.recordDate?.slice(0, 4) !== filterYear) return false;
    if (filterSpecies !== "all" && r.species !== filterSpecies) return false;
    return true;
  });
  const groupedRecords: Record<string, FeedRecord[]> = {};
  if (multipleSpecies && filterSpecies === "all") {
    filteredRecords.forEach(r => {
      const sp = r.species ?? "Unknown";
      if (!groupedRecords[sp]) groupedRecords[sp] = [];
      groupedRecords[sp].push(r);
    });
  } else {
    groupedRecords["__all__"] = filteredRecords;
  }

  const { data: herdsData } = useQuery<{ records: CoreHerd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const coreHerds: CoreHerd[] = herdsData?.records ?? [];

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

  function openNew() { setEditing(null); setForm({ isOrganicApproved: true, recordDate: new Date().toISOString().slice(0, 10) }); setSupplierId(null); setOpen(true); }
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
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          {speciesOptions.length > 1 && (
            <Select value={filterSpecies} onValueChange={setFilterSpecies}>
              <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="All species" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All species</SelectItem>
                {speciesOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={() => printFeedLog(records, farmName)} disabled={records.length === 0} className="gap-1.5 h-8">
            <Printer className="h-4 w-4" />Print Feed Log
          </Button>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Feed Record
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>{multipleSpecies && filterSpecies === "all" ? "Herd / Flock" : "Species / Herd"}</TableHead>
            <TableHead>Feed Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Qty (kg)</TableHead>
            <TableHead>Organic %</TableHead>
            <TableHead>Approved</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                {records.length === 0 ? "No feed records yet" : "No records match the selected filters"}
              </TableCell>
            </TableRow>
          )}
          {Object.entries(groupedRecords).sort(([a], [b]) => a === "__all__" ? 0 : a.localeCompare(b)).map(([species, rows]) => (
            <React.Fragment key={species}>
              {species !== "__all__" && (
                <TableRow>
                  <TableCell colSpan={8} className="bg-muted/40 font-semibold text-sm py-1.5 px-3 border-t">{species}</TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{fmt(r.recordDate)}</TableCell>
                  <TableCell className="text-sm">{r.herdFlockName ?? r.species ?? "—"}</TableCell>
                  <TableCell>{r.feedProductName}</TableCell>
                  <TableCell>{r.feedType}</TableCell>
                  <TableCell>{r.quantityKg ?? "—"}</TableCell>
                  <TableCell>{r.organicPercentage ? `${r.organicPercentage}%` : "—"}</TableCell>
                  <TableCell>
                    <Badge className={r.isOrganicApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                      {r.isOrganicApproved ? "Approved" : "Derogation"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="View" onClick={() => setViewRecord(r)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
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
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Status</p>
                <Badge className={viewRecord.isOrganicApproved ? "bg-green-100 text-green-800 mt-1" : "bg-amber-100 text-amber-800 mt-1"}>
                  {viewRecord.isOrganicApproved ? "Organic Approved" : "Non-approved — Derogation"}
                </Badge>
              </div>
              {viewRecord.isOrganicApproved ? (
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Approval Ref</p><p className="font-medium">{fmtRaw(viewRecord.certifierApprovalRef)}</p></div>
              ) : (
                <>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Derogation Approval Ref</p><p className="font-medium">{fmtRaw(viewRecord.certifierApprovalRef)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Regulatory Derogation Category</p><p className="font-medium">{fmtRaw(viewRecord.derogationReference)}</p></div>
                </>
              )}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">{viewRecord.isOrganicApproved ? "Notes" : "Derogation Justification / Notes"}</p><p className="font-medium">{fmtRaw(viewRecord.notes)}</p></div>
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
              {(() => {
                const firstWord = (form.species ?? "").toLowerCase().split(/[\s(]/)[0];
                const filteredHerds = form.species
                  ? coreHerds.filter(h => { const t = h.type.toLowerCase().trim(); return t === firstWord || t.startsWith(firstWord) || firstWord.startsWith(t); })
                  : coreHerds;
                const isLinked = filteredHerds.length > 0 && filteredHerds.some(h => h.name === form.herdFlockName);
                return filteredHerds.length > 0 ? (
                  <>
                    <Select
                      value={isLinked ? (form.herdFlockName ?? "") : "__manual__"}
                      onValueChange={v => setForm(p => ({ ...p, herdFlockName: v === "__manual__" ? "" : v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select herd / flock…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__manual__">— Enter manually —</SelectItem>
                        {filteredHerds.map(h => (
                          <SelectItem key={h.id} value={h.name}>{h.name}{h.isOrganicHerd ? " 🌿" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isLinked && (
                      <Input className="mt-1" value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} placeholder="Herd / flock name" />
                    )}
                  </>
                ) : (
                  <Input value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} />
                );
              })()}
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
                        setForm((p) => ({ ...p, supplier: "", supplierApprovalNumber: "" }));
                      } else {
                        const s = suppliers.find((s) => String(s.id) === v);
                        setSupplierId(s?.id ?? null);
                        const autoApprovalNo = s?.ufasNumber || s?.femasNumber || "";
                        setForm((p) => ({ ...p, supplier: s?.name ?? "", supplierApprovalNumber: autoApprovalNo }));
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select from supplier register…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__manual__">— Enter manually —</SelectItem>
                      {suppliers.map((s) => {
                        const badge = s.ufasNumber ? ` · UFAS: ${s.ufasNumber}` : s.femasNumber ? ` · FEMAS: ${s.femasNumber}` : s.certificationBody ? ` · ${s.certificationBody}` : "";
                        return <SelectItem key={s.id} value={String(s.id)}>{s.name}{badge}</SelectItem>;
                      })}
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
              <Input value={form.supplierApprovalNumber ?? ""} onChange={f("supplierApprovalNumber")} placeholder="UFAS or FEMAS registration number" />
              {supplierId && form.supplierApprovalNumber && (
                <p className="text-xs text-muted-foreground">Auto-populated from supplier record (UFAS/FEMAS). Edit to override.</p>
              )}
              {supplierId && !form.supplierApprovalNumber && (
                <p className="text-xs text-amber-600">No UFAS/FEMAS number on this supplier record — enter manually or update the supplier register.</p>
              )}
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
            <div className="col-span-2 space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.isOrganicApproved ?? true}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isOrganicApproved: !!v }))}
                  id="organic-approved"
                />
                <Label htmlFor="organic-approved">Organic Approved</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Tick if this feed comes from a UFAS/FEMAS-registered supplier and meets organic standards. Untick if you are using a non-approved ingredient under certifier derogation.
              </p>
            </div>
            {(form.isOrganicApproved ?? true) ? (
              <div className="space-y-1">
                <Label>Certifier Approval Ref</Label>
                <Input value={form.certifierApprovalRef ?? ""} onChange={f("certifierApprovalRef")} placeholder="Optional — batch approval reference" />
              </div>
            ) : (
              <div className="col-span-2 rounded-md border border-amber-300 bg-amber-50 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Non-approved feed — certifier derogation required</p>
                    <p className="text-xs text-amber-700 mt-1">Under UK Organic Regulations 2020, non-organically-approved feed ingredients may only be used with prior written approval from your certification body. Link this record to an approved derogation case from the Feed Derogations tab, or enter the reference manually.</p>
                  </div>
                </div>
                {activeDerogations.length > 0 && (
                  <div className="space-y-1">
                    <Label>Link to Approved Derogation Case</Label>
                    <Select
                      value={form.derogationCaseId ? String(form.derogationCaseId) : "__manual__"}
                      onValueChange={(v) => {
                        if (v === "__manual__") {
                          setForm(p => ({ ...p, derogationCaseId: null }));
                        } else {
                          const dc = activeDerogations.find(d => String(d.id) === v);
                          setForm(p => ({ ...p, derogationCaseId: dc?.id ?? null, certifierApprovalRef: dc?.certifierRef ?? p.certifierApprovalRef, derogationReference: dc?.regulatoryCategory ?? p.derogationReference }));
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select derogation case…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__manual__">— Enter manually —</SelectItem>
                        {activeDerogations.map(dc => (
                          <SelectItem key={dc.id} value={String(dc.id)}>
                            {dc.ingredientName}{dc.species ? ` (${dc.species})` : ""}{dc.certifierRef ? ` · ${dc.certifierRef}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Selecting a case auto-fills the certifier ref and regulatory category below. Manage derogation cases in the Feed Derogations tab.</p>
                  </div>
                )}
                {activeDerogations.length === 0 && (
                  <p className="text-xs text-amber-700">No active approved derogation cases found. Go to the <strong>Feed Derogations</strong> tab to create and manage derogation cases before linking records here.</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Certifier Derogation Approval Ref *</Label>
                    <Input value={form.certifierApprovalRef ?? ""} onChange={f("certifierApprovalRef")} placeholder="e.g. SA/DER/2025/001" />
                    <p className="text-xs text-muted-foreground">Reference issued by your certification body when approving this derogation.</p>
                  </div>
                  <div className="space-y-1">
                    <Label>Regulatory Derogation Category</Label>
                    <Input value={form.derogationReference ?? ""} onChange={f("derogationReference")} placeholder="e.g. Art. 22(2)(b)" />
                    <p className="text-xs text-muted-foreground">The derogation category under UK Organic Regulations 2020, if stated by your certifier.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="col-span-2 space-y-1">
              <Label>{!(form.isOrganicApproved ?? true) ? "Derogation Justification / Notes" : "Notes"}</Label>
              <Textarea
                value={form.notes ?? ""}
                onChange={f("notes")}
                rows={3}
                placeholder={!(form.isOrganicApproved ?? true) ? "State why no organically approved equivalent was available — this should match the justification submitted to your certification body." : undefined}
              />
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

  const { data: herdsData } = useQuery<{ records: CoreHerd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const coreHerds: CoreHerd[] = herdsData?.records ?? [];

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

  function openNew() { setEditing(null); setForm({ complianceStatus: "compliant", recordDate: new Date().toISOString().slice(0, 10) }); setOpen(true); }
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
              {(() => {
                const firstWord = (form.species ?? "").toLowerCase().split(/[\s(]/)[0];
                const filteredHerds = form.species
                  ? coreHerds.filter(h => { const t = h.type.toLowerCase().trim(); return t === firstWord || t.startsWith(firstWord) || firstWord.startsWith(t); })
                  : coreHerds;
                const isLinked = filteredHerds.length > 0 && filteredHerds.some(h => h.name === form.herdFlockName);
                return filteredHerds.length > 0 ? (
                  <>
                    <Select
                      value={isLinked ? (form.herdFlockName ?? "") : "__manual__"}
                      onValueChange={v => setForm(p => ({ ...p, herdFlockName: v === "__manual__" ? "" : v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select herd / flock…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__manual__">— Enter manually —</SelectItem>
                        {filteredHerds.map(h => (
                          <SelectItem key={h.id} value={h.name}>{h.name}{h.isOrganicHerd ? " 🌿" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isLinked && (
                      <Input className="mt-1" value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} placeholder="Herd / flock name" />
                    )}
                  </>
                ) : (
                  <Input value={form.herdFlockName ?? ""} onChange={f("herdFlockName")} />
                );
              })()}
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

  function openNew() { setEditing(null); setForm({ certifierNotified: false, treatmentNumber: 1, treatmentDate: new Date().toISOString().slice(0, 10) }); setOpen(true); }
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

// ─── FeedDerogationTab ────────────────────────────────────────────────────────

const DEROG_STATUS_CFG: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-blue-100 text-blue-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  expired: { label: "Expired", className: "bg-red-100 text-red-800" },
  withdrawn: { label: "Withdrawn", className: "bg-gray-100 text-gray-700" },
};

const DOCUMENT_TYPES = [
  "Approval Letter",
  "Availability Search Evidence",
  "Application / Justification Letter",
  "Supporting Evidence",
  "Conditions Letter",
  "Correspondence",
  "Other",
];

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function FeedDerogationTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  // ─── Case dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCase, setEditCase] = useState<DerogationCase | null>(null);
  const blankCase = { ingredientName: "", feedProductName: "", species: "", certifier: "", status: "pending", certifierRef: "", regulatoryCategory: "", appliedDate: "", decisionDate: "", expiryDate: "", availabilitySearchDone: false, justification: "", conditions: "", notes: "" };
  const [form, setForm] = useState<typeof blankCase>(blankCase);

  // ─── Expand / collapse per case
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ─── Correspondence dialog state
  const [corrDialogOpen, setCorrDialogOpen] = useState(false);
  const [editCorr, setEditCorr] = useState<DerogationCorrespondence | null>(null);
  const [corrDerogId, setCorrDerogId] = useState<number | null>(null);
  const blankCorr = { correspondenceDate: new Date().toISOString().slice(0, 10), direction: "to-certifier", subject: "", body: "", notes: "" };
  const [corrForm, setCorrForm] = useState<typeof blankCorr>(blankCorr);

  // ─── Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadDerogId, setUploadDerogId] = useState<number | null>(null);
  const [uploadType, setUploadType] = useState("Approval Letter");
  const fileInputRef = useState<HTMLInputElement | null>(null);

  // ─── Queries
  const { data: casesData, isLoading } = useQuery<{ cases: DerogationCase[] }>({
    queryKey: ["feed-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations`).then(r => r.json()),
    enabled: !!farmId,
  });
  const cases = casesData?.cases ?? [];

  const { data: corrData } = useQuery<{ correspondence: DerogationCorrespondence[] }>({
    queryKey: ["feed-derogation-corr", expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${expandedId}/correspondence`).then(r => r.json()),
    enabled: !!expandedId,
  });
  const correspondence = corrData?.correspondence ?? [];

  const { data: docsData, refetch: refetchDocs } = useQuery<{ documents: DerogationDocument[] }>({
    queryKey: ["feed-derogation-docs", expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${expandedId}/documents`).then(r => r.json()),
    enabled: !!expandedId,
  });
  const documents = docsData?.documents ?? [];

  // ─── Mutations
  const saveCase = useMutation({
    mutationFn: (body: typeof form & { id?: number }) => {
      const url = body.id
        ? `/api/farms/${farmId}/organic-livestock/feed-derogations/${body.id}`
        : `/api/farms/${farmId}/organic-livestock/feed-derogations`;
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-derogations", farmId] }); setDialogOpen(false); toast({ title: "Derogation case saved" }); },
  });

  const deleteCase = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-derogations", farmId] }); if (expandedId === deleteCase.variables) setExpandedId(null); toast({ title: "Case deleted" }); },
  });

  const saveCorr = useMutation({
    mutationFn: (body: typeof corrForm & { id?: number; derogationId: number }) => {
      const url = body.id
        ? `/api/farms/${farmId}/organic-livestock/feed-derogations/${body.derogationId}/correspondence/${body.id}`
        : `/api/farms/${farmId}/organic-livestock/feed-derogations/${body.derogationId}/correspondence`;
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-derogation-corr", expandedId] }); setCorrDialogOpen(false); setEditCorr(null); toast({ title: "Correspondence saved" }); },
  });

  const deleteCorr = useMutation({
    mutationFn: ({ derogationId, corrId }: { derogationId: number; corrId: number }) =>
      fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${derogationId}/correspondence/${corrId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-derogation-corr", expandedId] }),
  });

  const deleteDoc = useMutation({
    mutationFn: ({ derogationId, docId }: { derogationId: number; docId: number }) =>
      fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${derogationId}/documents/${docId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-derogation-docs", expandedId] }),
  });

  // ─── Helpers
  function openNewCase() { setForm(blankCase); setEditCase(null); setDialogOpen(true); }
  function openEditCase(c: DerogationCase) {
    setForm({ ingredientName: c.ingredientName, feedProductName: c.feedProductName ?? "", species: c.species ?? "", certifier: c.certifier ?? "", status: c.status, certifierRef: c.certifierRef ?? "", regulatoryCategory: c.regulatoryCategory ?? "", appliedDate: c.appliedDate ?? "", decisionDate: c.decisionDate ?? "", expiryDate: c.expiryDate ?? "", availabilitySearchDone: c.availabilitySearchDone, justification: c.justification ?? "", conditions: c.conditions ?? "", notes: c.notes ?? "" });
    setEditCase(c); setDialogOpen(true);
  }
  function f(k: keyof typeof form) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value })); }
  function openNewCorr(derogationId: number) { setCorrForm(blankCorr); setEditCorr(null); setCorrDerogId(derogationId); setCorrDialogOpen(true); }
  function openEditCorr(c: DerogationCorrespondence) { setCorrForm({ correspondenceDate: c.correspondenceDate, direction: c.direction, subject: c.subject, body: c.body ?? "", notes: c.notes ?? "" }); setEditCorr(c); setCorrDerogId(c.derogationId); setCorrDialogOpen(true); }
  function fc(k: keyof typeof corrForm) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCorrForm(p => ({ ...p, [k]: e.target.value })); }

  async function handleFileUpload(derogationId: number, file: File, docType: string) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json() as { uploadURL: string; objectPath: string };
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${derogationId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: objectPath, documentName: file.name, documentType: docType, fileSize: file.size, mimeType: file.type }),
      });
      qc.invalidateQueries({ queryKey: ["feed-derogation-docs", derogationId] });
      toast({ title: "Document uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const statusCounts = cases.reduce((acc: Record<string, number>, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-4">
      {/* ── Status summary ── */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {Object.entries(DEROG_STATUS_CFG).map(([status, cfg]) =>
            statusCounts[status] ? (
              <Badge key={status} className={cfg.className}>{cfg.label}: {statusCounts[status]}</Badge>
            ) : null
          )}
          {cases.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No derogation cases yet.</p>
          )}
        </div>
        <Button size="sm" onClick={openNewCase}>
          <Plus className="h-4 w-4 mr-1" /> New Derogation Case
        </Button>
      </div>

      {/* ── Regulatory note ── */}
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <p className="font-semibold mb-1">UK Organic Regulations 2020 — Article 22</p>
        <p>Non-organically-approved feed ingredients may only be used with <strong>prior written approval</strong> from your certification body. Each approval is ingredient-specific and time-limited. Keep the certifier's written approval, your availability search evidence, and all correspondence on file — inspectors will ask to see these.</p>
      </div>

      {/* ── Cases list ── */}
      <div className="space-y-2">
        {cases.map(c => {
          const cfg = DEROG_STATUS_CFG[c.status] ?? DEROG_STATUS_CFG.pending;
          const days = daysUntil(c.expiryDate);
          const isExpanded = expandedId === c.id;
          return (
            <div key={c.id} className="border rounded-md overflow-hidden">
              {/* Case header row */}
              <div
                className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{c.ingredientName}</span>
                    {c.species && <span className="text-xs text-muted-foreground">({c.species})</span>}
                    <Badge className={cfg.className + " text-xs"}>{cfg.label}</Badge>
                    {c.status === "approved" && days !== null && (
                      <Badge className={days < 14 ? "bg-red-100 text-red-800 text-xs" : days < 60 ? "bg-amber-100 text-amber-800 text-xs" : "bg-gray-100 text-gray-700 text-xs"}>
                        {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining`}
                      </Badge>
                    )}
                    {c.availabilitySearchDone && <Badge className="bg-green-50 text-green-700 text-xs border border-green-200">Availability search ✓</Badge>}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    {c.certifier && <span>Certifier: {c.certifier}</span>}
                    {c.certifierRef && <span>Ref: {c.certifierRef}</span>}
                    {c.appliedDate && <span>Applied: {fmt(c.appliedDate)}</span>}
                    {c.expiryDate && <span>Expires: {fmt(c.expiryDate)}</span>}
                    {c.regulatoryCategory && <span>{c.regulatoryCategory}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => openEditCase(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCase.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t bg-muted/10 p-4 space-y-5">
                  {/* Case details */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {c.feedProductName && <div><span className="text-muted-foreground">Feed product: </span>{c.feedProductName}</div>}
                    {c.decisionDate && <div><span className="text-muted-foreground">Decision date: </span>{fmt(c.decisionDate)}</div>}
                    {c.conditions && <div className="col-span-2"><span className="text-muted-foreground">Conditions: </span>{c.conditions}</div>}
                    {c.justification && <div className="col-span-2"><span className="text-muted-foreground">Justification: </span>{c.justification}</div>}
                    {c.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes: </span>{c.notes}</div>}
                  </div>

                  {/* Correspondence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5"><Mail className="h-4 w-4" /> Correspondence Log</h4>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openNewCorr(c.id)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Entry
                      </Button>
                    </div>
                    {correspondence.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No correspondence logged yet. Add entries to record communications with your certifier.</p>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Date</TableHead>
                              <TableHead className="text-xs">Direction</TableHead>
                              <TableHead className="text-xs">Subject</TableHead>
                              <TableHead className="text-xs">Notes</TableHead>
                              <TableHead className="w-16" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {correspondence.map(cr => (
                              <TableRow key={cr.id}>
                                <TableCell className="text-xs">{fmt(cr.correspondenceDate)}</TableCell>
                                <TableCell className="text-xs">
                                  <div className="flex items-center gap-1">
                                    {cr.direction === "to-certifier" ? <ArrowUpFromLine className="h-3 w-3 text-blue-600" /> : cr.direction === "from-certifier" ? <ArrowDownToLine className="h-3 w-3 text-green-600" /> : <Mail className="h-3 w-3 text-gray-500" />}
                                    <span>{cr.direction === "to-certifier" ? "To certifier" : cr.direction === "from-certifier" ? "From certifier" : "Internal"}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs font-medium">{cr.subject}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{fmtRaw(cr.notes)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCorr(cr)}><Pencil className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCorr.mutate({ derogationId: c.id, corrId: cr.id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5"><Paperclip className="h-4 w-4" /> Documents</h4>
                      <div className="flex items-center gap-2">
                        <Select value={uploadType} onValueChange={setUploadType}>
                          <SelectTrigger className="h-7 w-48 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{DOCUMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button
                          size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={uploading}
                          onClick={() => {
                            const inp = document.createElement("input");
                            inp.type = "file";
                            inp.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
                            inp.onchange = async () => {
                              const file = inp.files?.[0];
                              if (file) await handleFileUpload(c.id, file, uploadType);
                            };
                            inp.click();
                          }}
                        >
                          <Upload className="h-3 w-3" />{uploading ? "Uploading…" : "Upload"}
                        </Button>
                      </div>
                    </div>
                    {documents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No documents uploaded yet. Upload the certifier's approval letter, your availability search evidence, and any supporting correspondence.</p>
                    ) : (
                      <div className="space-y-1">
                        {documents.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">{doc.notes} · {new Date(doc.uploadedAt).toLocaleDateString("en-GB")}</p>
                            </div>
                            <a href={`/api${doc.fileKey}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3 w-3" /></Button>
                            </a>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteDoc.mutate({ derogationId: c.id, docId: doc.id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit Case Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCase ? "Edit Derogation Case" : "New Derogation Case"}</DialogTitle>
            <DialogDescription>
              Record a certifier-approved derogation for a specific non-organic feed ingredient. One case covers all deliveries of this ingredient for the approved period.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Non-Organic Ingredient Name *</Label>
              <Input value={form.ingredientName} onChange={f("ingredientName")} placeholder="e.g. Soya bean meal, Fish meal, Linseed" />
              <p className="text-xs text-muted-foreground">The specific ingredient — not the feed product name. Be precise; the certifier's approval is ingredient-specific.</p>
            </div>
            <div className="space-y-1">
              <Label>Feed Product Name (if applicable)</Label>
              <Input value={form.feedProductName} onChange={f("feedProductName")} placeholder="e.g. Blend X 18% Protein" />
            </div>
            <div className="space-y-1">
              <Label>Species</Label>
              <Select value={form.species || "__all__"} onValueChange={v => setForm(p => ({ ...p, species: v === "__all__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="All species" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All / Not species-specific</SelectItem>
                  {LIVESTOCK_SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Certification Body</Label>
              <Select value={CERTIFIERS.includes(form.certifier) ? form.certifier : (form.certifier ? "Other" : "")} onValueChange={v => setForm(p => ({ ...p, certifier: v }))}>
                <SelectTrigger><SelectValue placeholder="Select certifier…" /></SelectTrigger>
                <SelectContent>{CERTIFIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {(form.certifier === "Other" || (!!form.certifier && !CERTIFIERS.slice(0, -1).includes(form.certifier))) && (
                <Input className="mt-1" value={form.certifier === "Other" ? "" : form.certifier} onChange={e => setForm(p => ({ ...p, certifier: e.target.value || "Other" }))} placeholder="Please specify…" />
              )}
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending — awaiting certifier decision</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Certifier Approval Reference</Label>
              <Input value={form.certifierRef} onChange={f("certifierRef")} placeholder="e.g. SA/DER/2025/042" />
              <p className="text-xs text-muted-foreground">The reference issued by the certifier in their approval letter.</p>
            </div>
            <div className="space-y-1">
              <Label>Regulatory Derogation Category</Label>
              <Input value={form.regulatoryCategory} onChange={f("regulatoryCategory")} placeholder="e.g. Art. 22(2)(b) UK Org Regs 2020" />
            </div>
            <div className="space-y-1">
              <Label>Date Applied to Certifier</Label>
              <Input type="date" value={form.appliedDate} onChange={f("appliedDate")} />
            </div>
            <div className="space-y-1">
              <Label>Certifier Decision Date</Label>
              <Input type="date" value={form.decisionDate} onChange={f("decisionDate")} />
            </div>
            <div className="space-y-1">
              <Label>Approval Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={f("expiryDate")} />
              <p className="text-xs text-muted-foreground">Typically the end of the certification year. Derogations must be renewed annually.</p>
            </div>
            <div className="flex items-start gap-2 pt-5">
              <Checkbox id="avail-search" checked={form.availabilitySearchDone} onCheckedChange={v => setForm(p => ({ ...p, availabilitySearchDone: !!v }))} />
              <div>
                <Label htmlFor="avail-search">Availability search completed</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Tick when you have documented evidence that no organic equivalent was available from any supplier.</p>
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Justification</Label>
              <Textarea value={form.justification} onChange={f("justification")} rows={3} placeholder="State why no organically approved equivalent was available — species/category, suppliers contacted, and outcome. This should match what you submitted to the certifier." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Conditions Attached to Approval</Label>
              <Textarea value={form.conditions} onChange={f("conditions")} rows={2} placeholder="Any conditions stated by the certifier in their approval letter, e.g. maximum inclusion rate, review date, re-application requirements." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={f("notes")} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveCase.mutate({ ...form, id: editCase?.id })} disabled={saveCase.isPending || !form.ingredientName.trim()}>
              {saveCase.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add/Edit Correspondence Dialog ── */}
      <Dialog open={corrDialogOpen} onOpenChange={setCorrDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editCorr ? "Edit Correspondence Entry" : "Add Correspondence Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date *</Label>
                <Input type="date" value={corrForm.correspondenceDate} onChange={fc("correspondenceDate")} />
              </div>
              <div className="space-y-1">
                <Label>Direction</Label>
                <Select value={corrForm.direction} onValueChange={v => setCorrForm(p => ({ ...p, direction: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-certifier">To certifier</SelectItem>
                    <SelectItem value="from-certifier">From certifier</SelectItem>
                    <SelectItem value="internal">Internal note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Subject *</Label>
              <Input value={corrForm.subject} onChange={fc("subject")} placeholder="e.g. Derogation application for soya bean meal — 2025" />
            </div>
            <div className="space-y-1">
              <Label>Body / Summary</Label>
              <Textarea value={corrForm.body} onChange={fc("body")} rows={4} placeholder="Summary of the communication — key points, any decisions or commitments made." />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input value={corrForm.notes} onChange={fc("notes")} placeholder="e.g. Sent by email, ref: ticket #12345" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCorrDialogOpen(false); setEditCorr(null); }}>Cancel</Button>
            <Button
              onClick={() => saveCorr.mutate({ ...corrForm, id: editCorr?.id, derogationId: corrDerogId! })}
              disabled={saveCorr.isPending || !corrForm.subject.trim() || !corrDerogId}
            >
              {saveCorr.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Organic Livestock Kidding Section ───────────────────────────────────────

interface OlKiddingRecord {
  id: number;
  kiddingDate: string;
  doeLisTag?: string | null;
  birthOutcome: string;
  kidCount?: number | null;
  kidSex?: string | null;
  kidBirthWeightKg?: string | null;
  easeScore?: number | null;
  assistanceRequired?: boolean;
  assistanceType?: string | null;
  vetAttended?: boolean;
  vetName?: string | null;
  colostrumGivenWithin2Hours?: boolean | null;
  eidApplied?: boolean;
  eidAppliedDate?: string | null;
  lisTagNumber?: string | null;
  doeComplications?: string | null;
  notes?: string | null;
}

function KiddingEaseBadge({ v }: { v?: number | null }) {
  if (!v) return <span className="text-muted-foreground">—</span>;
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: "1 — Unassisted", cls: "bg-green-100 text-green-700" },
    2: { label: "2 — Minor assist", cls: "bg-yellow-100 text-yellow-700" },
    3: { label: "3 — Major assist", cls: "bg-orange-100 text-orange-700" },
    4: { label: "4 — Vet required", cls: "bg-red-100 text-red-700" },
  };
  const d = map[v];
  return d ? <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.cls}`}>{d.label}</span> : null;
}

function KiddingSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const BLANK: Partial<OlKiddingRecord> = {
    kiddingDate: todayStr(),
    birthOutcome: "live-single",
    kidCount: 1,
    assistanceRequired: false,
    vetAttended: false,
    eidApplied: false,
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OlKiddingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<OlKiddingRecord | null>(null);
  const [form, setForm] = useState<Partial<OlKiddingRecord>>(BLANK);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));

  const set = (k: keyof OlKiddingRecord, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const { data, isLoading } = useQuery<{ records: OlKiddingRecord[] }>({
    queryKey: ["ol-kidding-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/kidding-records`, { credentials: "include" }).then(r => r.json()),
  });

  const allRecords = data?.records ?? [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter(r => r.kiddingDate?.startsWith(yearFilter));
  const availableYears = [...new Set(allRecords.map(r => r.kiddingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a)) as string[];
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));

  const liveKids = records.reduce((s, r) => s + (r.birthOutcome?.startsWith("live") ? (r.kidCount ?? 1) : 0), 0);
  const eidPending = records.filter(r => r.birthOutcome?.startsWith("live") && !r.eidApplied).length;

  const save = useMutation({
    mutationFn: (body: Partial<OlKiddingRecord>) => {
      const url = editing
        ? `/api/farms/${farmId}/organic-livestock/kidding-records/${editing.id}`
        : `/api/farms/${farmId}/organic-livestock/kidding-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ol-kidding-records", farmId] }); closeDialog(); toast({ title: editing ? "Record updated" : "Kidding record added" }); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-livestock/kidding-records/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ol-kidding-records", farmId] }); setConfirmDelete(null); },
  });

  function closeDialog() { setOpen(false); setEditing(null); setForm(BLANK); }
  function openAdd() { setEditing(null); setForm({ ...BLANK, kiddingDate: todayStr() }); setOpen(true); }
  function openEdit(r: OlKiddingRecord) { setEditing(r); setForm({ ...r, kiddingDate: r.kiddingDate?.slice(0, 10) ?? "" }); setOpen(true); }

  return (
    <div>
      <div className="rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-900 mb-4">
        <strong>LIS Tagging:</strong> All goat kids must be electronically identified (EID) before first movement off the holding. Record EID application date and tag number for each live kid.
      </div>
      <div className="flex justify-between items-center mb-4 gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Goat kidding records — doe tag, litter size, ease score, colostrum, EID tagging compliance, and perinatal details.</p>
          <p className="text-xs text-gray-400">Organic certification (Soil Association / OF&amp;G): kidding records contribute to herd health and welfare evidence at inspection.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Kidding Record</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Litters Recorded</p>
          <p className="text-2xl font-bold">{records.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Live Kids</p>
          <p className="text-2xl font-bold text-green-700">{liveKids}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">EID Pending</p>
          <p className={`text-2xl font-bold ${eidPending > 0 ? "text-amber-700" : "text-muted-foreground"}`}>{eidPending}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Doe LIS Tag</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Kids</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Ease</TableHead>
              <TableHead>EID</TableHead>
              <TableHead>Colostrum ≤2h</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No kidding records for {yearFilter === "all" ? "any year" : yearFilter}. Add the first one above.</TableCell></TableRow>
            ) : records.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.kiddingDate)}</TableCell>
                <TableCell className="font-mono text-xs">{fmtRaw(r.doeLisTag)}</TableCell>
                <TableCell className="capitalize">{r.birthOutcome?.replace(/-/g, " ") ?? "—"}</TableCell>
                <TableCell>{r.kidCount ?? 1}</TableCell>
                <TableCell className="capitalize">{r.kidSex ?? "—"}</TableCell>
                <TableCell><KiddingEaseBadge v={r.easeScore} /></TableCell>
                <TableCell>
                  {r.eidApplied
                    ? <span className="text-green-700 font-medium text-xs">✓ Applied</span>
                    : r.birthOutcome?.startsWith("live")
                      ? <span className="text-amber-600 text-xs font-medium">Pending</span>
                      : <span className="text-muted-foreground text-xs">N/A</span>}
                </TableCell>
                <TableCell>
                  {r.colostrumGivenWithin2Hours === true
                    ? <span className="text-green-700 text-xs font-medium">✓ Yes</span>
                    : r.colostrumGivenWithin2Hours === false
                      ? <span className="text-red-600 text-xs font-medium">No</span>
                      : <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewRecord(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader><DialogTitle>Kidding Record — {fmt(viewRecord.kiddingDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe LIS Tag</p><p className="font-mono font-medium">{fmtRaw(viewRecord.doeLisTag)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Outcome</p><p className="font-medium capitalize">{viewRecord.birthOutcome?.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Kid Count</p><p className="font-medium">{viewRecord.kidCount ?? 1}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sex</p><p className="font-medium capitalize">{fmtRaw(viewRecord.kidSex)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Weight (kg)</p><p className="font-medium">{fmtRaw(viewRecord.kidBirthWeightKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><KiddingEaseBadge v={viewRecord.easeScore} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EID Applied</p><p className="font-medium">{viewRecord.eidApplied ? `Yes — ${fmt(viewRecord.eidAppliedDate)}` : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">LIS Tag Number</p><p className="font-mono font-medium">{fmtRaw(viewRecord.lisTagNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assistance Required</p><p className="font-medium">{viewRecord.assistanceRequired ? `Yes — ${viewRecord.assistanceType ?? ""}` : "No"}</p></div>
              {viewRecord.vetAttended && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Attended</p><p className="font-medium">{viewRecord.vetName ?? "Yes"}</p></div>}
              {viewRecord.doeComplications && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Doe Complications</p><p className="font-medium">{viewRecord.doeComplications}</p></div>}
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kidding Record" : "Add Kidding Record"}</DialogTitle>
            <DialogDescription>Record goat kidding details including ease score, EID tagging, and doe condition.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <Label>Kidding Date *</Label>
              <Input type="date" value={String(form.kiddingDate ?? "").slice(0, 10)} onChange={e => set("kiddingDate", e.target.value)} />
            </div>
            <div>
              <Label>Doe LIS Tag</Label>
              <Input value={form.doeLisTag ?? ""} onChange={e => set("doeLisTag", e.target.value)} placeholder="UK ear tag / LIS number" />
            </div>
            <div>
              <Label>Birth Outcome *</Label>
              <Select value={form.birthOutcome ?? "live-single"} onValueChange={v => set("birthOutcome", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live-single">Live — single</SelectItem>
                  <SelectItem value="live-twins">Live — twins</SelectItem>
                  <SelectItem value="live-triplets">Live — triplets</SelectItem>
                  <SelectItem value="stillborn">Stillborn</SelectItem>
                  <SelectItem value="mummified">Mummified</SelectItem>
                  <SelectItem value="abortion">Abortion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kid Count</Label>
              <Input type="number" min="1" value={form.kidCount ?? 1} onChange={e => set("kidCount", parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <Label>Sex</Label>
              <Select value={form.kidSex ?? "__none__"} onValueChange={v => set("kidSex", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not recorded</SelectItem>
                  <SelectItem value="doe">Doe kid (female)</SelectItem>
                  <SelectItem value="buck">Buck kid (male)</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Birth Weight (kg)</Label>
              <Input type="number" step="0.1" value={form.kidBirthWeightKg ?? ""} onChange={e => set("kidBirthWeightKg", e.target.value)} />
            </div>
            <div>
              <Label>Ease Score</Label>
              <Select value={String(form.easeScore ?? "")} onValueChange={v => set("easeScore", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 — Unassisted</SelectItem>
                  <SelectItem value="2">2 — Minor assistance</SelectItem>
                  <SelectItem value="3">3 — Major assistance</SelectItem>
                  <SelectItem value="4">4 — Vet required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-2 gap-2">
              <Checkbox id="ol-k-assist" checked={!!form.assistanceRequired} onCheckedChange={v => set("assistanceRequired", !!v)} />
              <label htmlFor="ol-k-assist" className="text-sm cursor-pointer">Assistance required</label>
            </div>
            {form.assistanceRequired && (
              <div className="col-span-2">
                <Label>Assistance Type</Label>
                <Input value={form.assistanceType ?? ""} onChange={e => set("assistanceType", e.target.value)} placeholder="e.g. repositioning, lubrication" />
              </div>
            )}

            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">EID / LIS Tagging</p>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Checkbox id="ol-k-eid" checked={!!form.eidApplied} onCheckedChange={v => set("eidApplied", !!v)} />
              <label htmlFor="ol-k-eid" className="text-sm cursor-pointer">EID tag applied</label>
              {form.eidApplied && (
                <Input type="date" className="w-40" value={String(form.eidAppliedDate ?? "").slice(0, 10)} onChange={e => set("eidAppliedDate", e.target.value)} />
              )}
            </div>
            <div>
              <Label>LIS Tag Number</Label>
              <Input value={form.lisTagNumber ?? ""} onChange={e => set("lisTagNumber", e.target.value)} placeholder="UK8 tag number" />
            </div>

            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Colostrum &amp; Doe Condition</p>
            </div>
            <div>
              <Label>Colostrum Given ≤2h</Label>
              <Select value={form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no"} onValueChange={v => set("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not recorded</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-2 gap-2">
              <Checkbox id="ol-k-vet" checked={!!form.vetAttended} onCheckedChange={v => set("vetAttended", !!v)} />
              <label htmlFor="ol-k-vet" className="text-sm cursor-pointer">Vet attended</label>
            </div>
            {form.vetAttended && (
              <div>
                <Label>Vet Name</Label>
                <Input value={form.vetName ?? ""} onChange={e => set("vetName", e.target.value)} />
              </div>
            )}
            <div className="col-span-2">
              <Label>Doe Complications</Label>
              <Input value={form.doeComplications ?? ""} onChange={e => set("doeComplications", e.target.value)} placeholder="e.g. retained placenta, hypocalcaemia" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={confirmDelete !== null} onOpenChange={v => { if (!v) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Kidding Record</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the kidding record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete !== null && del.mutate(confirmDelete)} disabled={del.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
          <TabsList className="flex-wrap h-auto gap-y-1">
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="feed">Feed Records</TabsTrigger>
            <TabsTrigger value="feed-derogations">Feed Derogations</TabsTrigger>
            <TabsTrigger value="outdoor-access">Outdoor Access / Stocking</TabsTrigger>
            <TabsTrigger value="treatments">Treatment Compliance</TabsTrigger>
            <TabsTrigger value="herds">Herds &amp; Flocks</TabsTrigger>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="vet-plans">Vet Health Plans</TabsTrigger>
            <TabsTrigger value="mortality">Mortality</TabsTrigger>
            <TabsTrigger value="contractors">Contractors</TabsTrigger>
            <TabsTrigger value="ls-feed">Feed</TabsTrigger>
            <TabsTrigger value="water">Water</TabsTrigger>
            <TabsTrigger value="sires">Sires</TabsTrigger>
            <TabsTrigger value="straws">Straws</TabsTrigger>
            <TabsTrigger value="ai-repro">AI &amp; Repro</TabsTrigger>
            <TabsTrigger value="vet-rx">Vet Rx</TabsTrigger>
            <TabsTrigger value="lambing">Lambing</TabsTrigger>
            <TabsTrigger value="tb-tests">TB Tests</TabsTrigger>
            <TabsTrigger value="welfare-outcomes">Welfare Outcomes</TabsTrigger>
            <TabsTrigger value="sheep-dipping">Sheep Dipping</TabsTrigger>
            <TabsTrigger value="kidding">Goat Kidding</TabsTrigger>
          </TabsList>
          <TabsContent value="conversion" className="mt-4">
            <ConversionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="feed" className="mt-4">
            <FeedTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="feed-derogations" className="mt-4">
            <FeedDerogationTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="outdoor-access" className="mt-4">
            <OutdoorAccessTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="treatments" className="mt-4">
            <TreatmentsTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="herds" className="mt-4">
            <HerdsSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="animals" className="mt-4">
            <AnimalsSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="vet-plans" className="mt-4">
            <VetHealthPlansSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="mortality" className="mt-4">
            <MortalitySection farmId={farmId} />
          </TabsContent>
          <TabsContent value="contractors" className="mt-4">
            <FallenStockContractorsSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="ls-feed" className="mt-4">
            <FeedSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="water" className="mt-4">
            <WaterSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="sires" className="mt-4">
            <SiresSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="straws" className="mt-4">
            <StrawInventorySection farmId={farmId} />
          </TabsContent>
          <TabsContent value="ai-repro" className="mt-4">
            <AIReproductionSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="vet-rx" className="mt-4">
            <VetPrescriptionsSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="lambing" className="mt-4">
            <LambingSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="tb-tests" className="mt-4">
            <TbTestsSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="welfare-outcomes" className="mt-4">
            <WelfareOutcomeSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="sheep-dipping" className="mt-4">
            <SheepDippingSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="kidding" className="mt-4">
            <KiddingSection farmId={farmId} />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
