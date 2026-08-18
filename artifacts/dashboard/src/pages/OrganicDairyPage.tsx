import React, { useState, useRef, useMemo } from "react";
import { formatAlertIssuedAt } from "@/lib/utils";
import { AbrProcurementSection } from "@/pages/dairy/AbrProcurementSection";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter, usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
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
import { DialogMutationError } from "@/components/ui/dialog-error";
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ClipboardList, Eye, Printer, ChevronLeft, ChevronRight, FileDown, Droplets, AlertTriangle, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { DocAttach } from "@/components/DocAttach";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { useToast } from "@/hooks/use-toast";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { BcsTab, MobilityTab, BulkTankTab, RecordingVisitsTab, SccEquipmentSection } from "@/pages/DairyPage";
import { openPrintWindow } from "@/lib/print-report";
import { downloadCsvFile } from "@/lib/csv";
import { DairyEnterpriseReport } from "@/components/DairyEnterpriseReport";
import { DairySuppliesTab } from "@/components/DairySuppliesTab";
import { OrganicJohnesTab } from "@/pages/OrganicJohnesTab";
import { ArableFarmSettingsChecklist } from "@/components/ArableFarmSettingsChecklist";

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

function today() { return new Date().toISOString().slice(0, 10); }

function fmtRaw(v: unknown): string {
  return v == null || v === "" ? "—" : String(v);
}

function escHtml(v: unknown): string {
  const s = v == null || v === "" ? "—" : String(v);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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

function esc(v: unknown): string {
  if (v == null || v === "") return "—";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function downloadMastitisCsv(records: OrgDairyMastitisRecord[], farmName: string, monthLabel: string) {
  const headers = ["Onset Date", "Ear Tag", "Quarter", "Grade", "Treatment", "Std W/D (days)", "Dbl W/D (days)", "W/D End Date", "Certifier Notified", "Outcome", "Vet", "Notes"];
  const dataRows = records.map(r => [
    r.onsetDate ? new Date(r.onsetDate).toLocaleDateString("en-GB") : "",
    r.earTagNumber ?? "",
    r.quartersAffected ?? "",
    r.clinicalGrade ?? "",
    r.treatmentProduct ?? "",
    r.standardWithdrawalDays != null ? String(r.standardWithdrawalDays) : "",
    r.doubledWithdrawalDays != null ? String(r.doubledWithdrawalDays) : "",
    r.withdrawalEndDate ? new Date(r.withdrawalEndDate).toLocaleDateString("en-GB") : "",
    r.certifierNotified ? "Yes" : (r.treatmentProduct ? "Pending" : "N/A"),
    r.outcome ? (r.chronicCase ? `${r.outcome} (Chronic)` : r.outcome) : (r.chronicCase ? "Ongoing (Chronic)" : "Ongoing"),
    r.attendingVet ?? "",
    r.notes ?? "",
  ]);
  const filename = `Mastitis_${farmName.replace(/[^a-z0-9]/gi, "_")}_${monthLabel.replace(/[^a-z0-9]/gi, "_")}.csv`;
  downloadCsvFile(filename, [headers, ...dataRows]);
}

function printMastitisRecords(records: OrgDairyMastitisRecord[], farmName: string, monthLabel: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const rows = records.map(r => `
    <tr>
      <td>${esc(fmt(r.onsetDate))}</td>
      <td class="font-mono">${esc(r.earTagNumber)}</td>
      <td>${esc(r.quartersAffected)}</td>
      <td>${esc(r.clinicalGrade)}</td>
      <td>${esc(r.treatmentProduct)}</td>
      <td>${r.standardWithdrawalDays != null ? esc(r.standardWithdrawalDays) + 'd' : '&mdash;'}</td>
      <td><b>${r.doubledWithdrawalDays != null ? esc(r.doubledWithdrawalDays) + 'd' : '&mdash;'}</b></td>
      <td>${esc(fmt(r.withdrawalEndDate))}</td>
      <td><span class="badge ${r.certifierNotified ? 'badge-green' : r.treatmentProduct ? 'badge-yellow' : 'badge-gray'}">${r.certifierNotified ? 'Notified' : r.treatmentProduct ? 'Pending' : 'N/A'}</span></td>
      <td>${r.outcome ? esc(r.outcome) : 'Ongoing'}${r.chronicCase ? ' (Chronic)' : ''}</td>
      <td>${esc(r.attendingVet)}</td>
      <td>${esc(r.notes)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Mastitis Register &mdash; ${esc(farmName)}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Mastitis Register</div><div class="farm">${esc(farmName)} &middot; ${esc(monthLabel)}</div></div>
    <div class="hdr-r"><b>Mastitis Records</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${esc(today)}</div></div>
    <table><thead><tr><th>Onset Date</th><th>Ear Tag</th><th>Quarter</th><th>Grade</th><th>Treatment</th><th>Std W/D</th><th>Dbl W/D &#9888;</th><th>W/D End</th><th>Certifier</th><th>Outcome</th><th>Vet</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function printDctRegister(records: OrgDctRecord[], farmName: string, monthLabel: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const eFarmName = escHtml(farmName);
  const eMonthLabel = escHtml(monthLabel);
  const rows = records.map(r => `
    <tr>
      <td>${escHtml(fmt(r.dryOffDate))}</td>
      <td>${escHtml(r.cowEarTag)}</td>
      <td>${escHtml(r.protocol?.replace(/-/g, " "))}</td>
      <td>${escHtml(r.antibioticTubeProduct)}</td>
      <td>${escHtml(r.antibioticTubeBatch)}</td>
      <td>${escHtml(r.standardMilkWithdrawalDays)}</td>
      <td>${escHtml(r.doubledMilkWithdrawalDays)}</td>
      <td>${escHtml(r.teatSealantProduct)}</td>
      <td>${escHtml(r.sccAtDryOff)}</td>
      <td>${r.vetAuthorisation ? 'Yes' : 'No'}</td>
      <td>${escHtml(r.vetName)}</td>
      <td><span class="badge ${r.certifierNotified ? 'badge-green' : r.antibioticTubeProduct ? 'badge-yellow' : 'badge-gray'}">${r.certifierNotified ? 'Yes' : r.antibioticTubeProduct ? 'Pending' : 'N/A'}</span></td>
      <td>${escHtml(fmt(r.expectedCalvingDate))}</td>
      <td>${escHtml(r.therapeuticJustification)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Dry Cow Therapy Register &#8212; ${eFarmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Dry Cow Therapy Register</div><div class="farm">${eFarmName}</div></div>
    <div class="hdr-r"><b>${eMonthLabel}</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${escHtml(today)}</div></div>
    <table><thead><tr><th>Dry-Off Date</th><th>Ear Tag</th><th>Protocol</th><th>Antibiotic Product</th><th>Batch</th><th>Std Milk W/D</th><th>Dbl Milk W/D</th><th>Teat Sealant</th><th>SCC (k/mL)</th><th>Vet Auth</th><th>Vet Name</th><th>Cert. Notified</th><th>Exp. Calving</th><th>Justification</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}

function exportDctCsv(records: OrgDctRecord[], monthLabel: string) {
  const slug = monthLabel.toLowerCase().replace(/\s+/g, "-");
  const header = [
    "Dry-Off Date", "Ear Tag", "Protocol", "Antibiotic Product", "Antibiotic Batch",
    "Std Milk W/D (days)", "Dbl Milk W/D (days)", "Teat Sealant Product", "SCC at Dry-Off (k/mL)",
    "Vet Authorisation", "Vet Name", "Certifier Notified", "Expected Calving Date", "Justification",
  ];
  const dataRows = records.map(r => [
    r.dryOffDate ? new Date(r.dryOffDate).toLocaleDateString("en-GB") : "",
    r.cowEarTag ?? "",
    r.protocol ? r.protocol.replace(/-/g, " ") : "",
    r.antibioticTubeProduct ?? "",
    r.antibioticTubeBatch ?? "",
    r.standardMilkWithdrawalDays != null ? String(r.standardMilkWithdrawalDays) : "",
    r.doubledMilkWithdrawalDays != null ? String(r.doubledMilkWithdrawalDays) : "",
    r.teatSealantProduct ?? "",
    r.sccAtDryOff != null ? String(r.sccAtDryOff) : "",
    r.vetAuthorisation ? "Yes" : "No",
    r.vetName ?? "",
    r.certifierNotified ? "Yes" : "No",
    r.expectedCalvingDate ? new Date(r.expectedCalvingDate).toLocaleDateString("en-GB") : "",
    r.therapeuticJustification ?? "",
  ]);
  downloadCsvFile(`dct-records-${slug}.csv`, [header, ...dataRows]);
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
  buyerBactoscanThousands?: number | null;
  buyerTvcCfuMl?: number | null;
  buyerThermsCfuMl?: number | null;
  buyerColiformsCfuMl?: number | null;
  buyerCaseinPercent?: string | null;
  buyerUreaMillimolesPerLitre?: string | null;
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
  herdId?: number | null;
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

// ─── Organic Dairy — MastitisTab ──────────────────────────────────────────────

interface OrgDairyMastitisRecord {
  id: number; onsetDate: string; earTagNumber?: string | null; quartersAffected?: string | null;
  clinicalGrade?: string | null; bacterialCultureResult?: string | null; labSampleTaken?: boolean | null;
  labRef?: string | null; sccAtOnset?: number | null; treatmentProduct?: string | null;
  treatmentStartDate?: string | null; treatmentDurationDays?: number | null;
  standardWithdrawalDays?: number | null; doubledWithdrawalDays?: number | null;
  withdrawalEndDate?: string | null; certifierNotified?: boolean | null;
  outcome?: string | null; outcomeDate?: string | null; attendingVet?: string | null;
  chronicCase?: boolean | null; culledDueToMastitis?: boolean | null; notes?: string | null;
}

function MastitisTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OrgDairyMastitisRecord | null>(null);
  const [viewRec, setViewRec] = useState<OrgDairyMastitisRecord | null>(null);
  const blank: Partial<OrgDairyMastitisRecord> = { onsetDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false, certifierNotified: false };
  const [form, setForm] = useState<Partial<OrgDairyMastitisRecord>>(blank);
  const setF = (k: keyof OrgDairyMastitisRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ["dairy-mastitis", farmId], queryFn: () => fetch(`/api/farms/${farmId}/dairy/mastitis-records`, { credentials: "include" }).then(r => r.json()) });
  const allRecords: OrgDairyMastitisRecord[] = data?.records ?? [];
  const uncertifiedCount = allRecords.filter(r => r.treatmentProduct && !r.certifierNotified).length;

  const nowM = new Date();
  const [filterYear, setFilterYear] = usePersistedNumberFilter({ page: "organic-dairy-mastitis", filter: "year", farmId, defaultValue: nowM.getFullYear() });
  const [filterMonth, setFilterMonth] = usePersistedNumberFilter({ page: "organic-dairy-mastitis", filter: "month", farmId, defaultValue: nowM.getMonth(), isValid: (v) => v >= 0 && v <= 11 });
  function stepMonthM(dir: 1 | -1) {
    const next = filterMonth + dir;
    if (next < 0) { setFilterYear(filterYear - 1); setFilterMonth(11); }
    else if (next > 11) { setFilterYear(filterYear + 1); setFilterMonth(0); }
    else { setFilterMonth(next); }
  }
  const monthLabelM = new Date(filterYear, filterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const filtered = allRecords.filter(r => {
    if (!r.onsetDate) return false;
    const d = new Date(r.onsetDate);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });

  // Rolling 12-month trend data for the chart
  const nowYear = nowM.getFullYear();
  const nowMonth = nowM.getMonth();
  const trendData = useMemo(() => {
    const months: { label: string; year: number; month: number; regular: number; chronic: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(nowYear, nowMonth - i, 1);
      months.push({
        label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
        year: d.getFullYear(),
        month: d.getMonth(),
        regular: 0,
        chronic: 0,
      });
    }
    for (const r of allRecords) {
      if (!r.onsetDate) continue;
      const d = new Date(r.onsetDate);
      const slot = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (!slot) continue;
      if (r.outcome === "chronic") slot.chronic += 1;
      else slot.regular += 1;
    }
    return months;
  }, [allRecords, nowYear, nowMonth]);

  const save = useMutation({
    mutationFn: (body: Partial<OrgDairyMastitisRecord>) => fetch(editing ? `/api/farms/${farmId}/dairy/mastitis-records/${editing.id}` : `/api/farms/${farmId}/dairy/mastitis-records`, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }); setOpen(false); toast({ title: editing ? "Updated" : "Added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/dairy/mastitis-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Organic rule:</strong> All withdrawal periods for mastitis treatments must be DOUBLED (EU/UK Organic Regulation). Record both standard and doubled milk withdrawal days and notify your certifier of any antibiotic use.
      </div>
      {uncertifiedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{uncertifiedCount} treated case{uncertifiedCount !== 1 ? "s" : ""} where certifier has not been notified.</span>
        </div>
      )}
      {/* 12-month trend chart */}
      {!isLoading && allRecords.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">12-Month Case Trend</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => {
                const rows = [["Month", "Total Cases", "Chronic Cases"]];
                for (const m of trendData) {
                  rows.push([m.label, String(m.regular + m.chronic), String(m.chronic)]);
                }
                const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\r\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `mastitis-trend-${farmName.replace(/[^a-z0-9]/gi, "-")}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <FileDown className="w-3.5 h-3.5" />Download CSV
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <span className="flex items-center gap-1 text-xs text-gray-500"><span className="inline-block w-3 h-3 rounded-sm bg-blue-400" />Standard</span>
            <span className="flex items-center gap-1 text-xs text-gray-500"><span className="inline-block w-3 h-3 rounded-sm bg-amber-400" />Chronic</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={trendData} margin={{ top: 2, right: 4, left: -28, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
                formatter={(value: number, name: string) => [value, name === "regular" ? "Standard" : "Chronic"]}
                labelFormatter={(label: string) => `Month: ${label}`}
              />
              <Bar dataKey="regular" stackId="cases" fill="#60a5fa" name="regular" radius={[0, 0, 0, 0]} />
              <Bar dataKey="chronic" stackId="cases" fill="#fbbf24" name="chronic" radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-800">Mastitis Records</h2>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md">
            <button onClick={() => stepMonthM(-1)} className="p-1 rounded-l hover:bg-gray-200 transition-colors" aria-label="Previous month"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
            <span className="text-sm font-medium text-gray-700 px-2">{monthLabelM}</span>
            <button onClick={() => stepMonthM(1)} className="p-1 rounded-r hover:bg-gray-200 transition-colors" aria-label="Next month"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => printMastitisRecords(filtered, farmName, monthLabelM)} disabled={filtered.length === 0} className="gap-1.5"><Printer className="w-4 h-4" />Print</Button>
          <Button variant="outline" size="sm" onClick={() => downloadMastitisCsv(filtered, farmName, monthLabelM)} disabled={filtered.length === 0} className="gap-1.5"><FileDown className="w-4 h-4" />Download CSV</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No mastitis records found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Ear Tag</TableHead><TableHead>Quarter</TableHead>
              <TableHead>Treatment</TableHead><TableHead>Dbl Milk W/D</TableHead><TableHead>Certifier</TableHead><TableHead>Outcome</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>{filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{fmt(r.onsetDate)}</TableCell>
                <TableCell className="font-mono text-xs">{r.earTagNumber || "—"}</TableCell>
                <TableCell className="capitalize">{r.quartersAffected || "—"}</TableCell>
                <TableCell>{r.treatmentProduct || "—"}</TableCell>
                <TableCell>{r.doubledWithdrawalDays != null ? <Badge className="bg-blue-100 text-blue-800">{r.doubledWithdrawalDays}d</Badge> : "—"}</TableCell>
                <TableCell><Badge className={r.certifierNotified ? "bg-green-100 text-green-800" : r.treatmentProduct ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"}>{r.certifierNotified ? "Notified" : r.treatmentProduct ? "Pending" : "N/A"}</Badge></TableCell>
                <TableCell>{r.outcome || "Ongoing"}{r.chronicCase ? <span className="ml-1 text-xs text-amber-600">Chronic</span> : null}</TableCell>
                <TableCell><div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Mastitis — {viewRec.earTagNumber || "Unknown cow"} on {fmt(viewRec.onsetDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ear Tag</p><p className="font-mono font-medium">{viewRec.earTagNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quarters Affected</p><p className="font-medium capitalize">{viewRec.quartersAffected || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clinical Grade</p><p className="font-medium capitalize">{viewRec.clinicalGrade || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pathogen</p><p className="font-medium">{viewRec.bacterialCultureResult || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Onset</p><p className="font-medium">{viewRec.sccAtOnset?.toLocaleString() ?? "—"} k/mL</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Product</p><p className="font-medium">{viewRec.treatmentProduct || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Standard Milk W/D (days)</p><p className="font-medium">{viewRec.standardWithdrawalDays ?? "—"}</p></div>
              <div><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Doubled Milk W/D (days)</p><p className="font-bold text-blue-800">{viewRec.doubledWithdrawalDays ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal End Date</p><p className="font-medium">{fmt(viewRec.withdrawalEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Notified</p><p className="font-medium">{viewRec.certifierNotified ? "Yes" : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-medium capitalize">{viewRec.outcome || "Ongoing"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Attending Vet</p><p className="font-medium">{viewRec.attendingVet || "—"}</p></div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm(viewRec); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Mastitis Record" : "Add Mastitis Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Onset Date *</Label><Input type="date" value={String(form.onsetDate || "").slice(0, 10)} onChange={e => setF("onsetDate", e.target.value)} /></div>
            <div><Label>Ear Tag</Label><Input value={form.earTagNumber || ""} onChange={e => setF("earTagNumber", e.target.value)} /></div>
            <div><Label>Quarters Affected</Label>
              <Select value={form.quartersAffected || "__none__"} onValueChange={v => setF("quartersAffected", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not specified</SelectItem><SelectItem value="LF">LF</SelectItem><SelectItem value="RF">RF</SelectItem><SelectItem value="LR">LR</SelectItem><SelectItem value="RR">RR</SelectItem><SelectItem value="multiple">Multiple</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Clinical Grade</Label>
              <Select value={form.clinicalGrade || "__none__"} onValueChange={v => setF("clinicalGrade", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Not graded</SelectItem><SelectItem value="subclinical">Subclinical</SelectItem><SelectItem value="mild">Mild</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="severe">Severe</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Pathogen Identified</Label><Input value={form.bacterialCultureResult || ""} onChange={e => setF("bacterialCultureResult", e.target.value)} placeholder="e.g. Staph. aureus" /></div>
            <div><Label>SCC at Onset (k/mL)</Label><Input type="number" value={form.sccAtOnset || ""} onChange={e => setF("sccAtOnset", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Treatment Product</Label><Input value={form.treatmentProduct || ""} onChange={e => setF("treatmentProduct", e.target.value)} /></div>
            <div><Label>Treatment Start Date</Label><Input type="date" value={String(form.treatmentStartDate || "").slice(0, 10)} onChange={e => setF("treatmentStartDate", e.target.value)} /></div>
            <div><Label>Duration (days)</Label><Input type="number" value={form.treatmentDurationDays || ""} onChange={e => setF("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">⚠ Organic — Doubled Withdrawal</p></div>
            <div><Label>Standard Milk W/D (days)</Label><Input type="number" value={form.standardWithdrawalDays || ""} onChange={e => { const v = e.target.value ? parseInt(e.target.value) : null; setF("standardWithdrawalDays", v); setF("doubledWithdrawalDays", v ? v * 2 : null); }} /></div>
            <div><Label className="text-blue-700">Doubled Milk W/D (days)</Label><Input type="number" value={form.doubledWithdrawalDays || ""} onChange={e => setF("doubledWithdrawalDays", e.target.value ? parseInt(e.target.value) : null)} className="border-blue-300" /></div>
            <div><Label>Withdrawal End Date</Label><Input type="date" value={String(form.withdrawalEndDate || "").slice(0, 10)} onChange={e => setF("withdrawalEndDate", e.target.value)} /></div>
            <div><Label>Outcome</Label>
              <Select value={form.outcome || "__none__"} onValueChange={v => setF("outcome", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">Ongoing</SelectItem><SelectItem value="cured">Cured</SelectItem><SelectItem value="recovered">Recovered</SelectItem><SelectItem value="dried-off">Dried off early</SelectItem><SelectItem value="chronic">Chronic</SelectItem><SelectItem value="culled">Culled</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Attending Vet</Label><Input value={form.attendingVet || ""} onChange={e => setF("attendingVet", e.target.value)} /></div>
            <div className="col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.labSampleTaken} onChange={e => setF("labSampleTaken", e.target.checked)} />Lab sample taken</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.chronicCase} onChange={e => setF("chronicCase", e.target.checked)} />Chronic case</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.culledDueToMastitis} onChange={e => setF("culledDueToMastitis", e.target.checked)} />Culled for mastitis</label>
            </div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={!!form.certifierNotified} onCheckedChange={v => setF("certifierNotified", !!v)} id="org-masti-cert" />
              <Label htmlFor="org-masti-cert" className="cursor-pointer font-normal">Certifier has been notified of this antibiotic treatment</Label>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => setF("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Organic Dairy — CalvingTab ────────────────────────────────────────────────

interface OrgCalvingRecord {
  id: number; calvingDate: string; cowEarTag?: string | null; cowAnimalId?: number | null;
  numberOfCalves?: number | null; calfSex?: string | null; calfEarTag?: string | null;
  calfOutcome?: string | null; calfSex2?: string | null; calfEarTag2?: string | null; calfOutcome2?: string | null;
  calfBirthWeightKg?: string | null; calvingEaseScore?: number | null;
  assistanceRequired?: boolean | null; vetAttended?: boolean | null; vetName?: string | null;
  colostrumGivenWithin2Hours?: boolean | null; colostrumGivenWithin6Hours?: boolean | null;
  colostrumVolumeFirstFeedLitres?: string | null; colostrumFromOrganicDam?: boolean | null;
  organicStatusConfirmed?: boolean | null;
  bcmsPassportApplied?: boolean | null; calfAnimalId?: number | null;
  perinatalCollectionDate?: string | null; perinatalCollectionRef?: string | null; perinatalDisposalMethod?: string | null;
  notes?: string | null;
}

function OrgEaseScoreBadgeDairy({ v }: { v?: number | null }) {
  if (!v) return <span className="text-gray-400">—</span>;
  const cls = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800", "bg-red-200 text-red-900"];
  const lbl = ["", "Unassisted", "Easy pull", "Hard pull", "Mech. assist", "C-section"];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] || "bg-gray-100 text-gray-700"}`}>{v} — {lbl[v] || "Unknown"}</span>;
}

function CalvingTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OrgCalvingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<OrgCalvingRecord | null>(null);
  const [form, setForm] = useState<Partial<OrgCalvingRecord>>({});
  const nowC = new Date();
  const [calvFilterYear, setCalvFilterYear] = usePersistedNumberFilter({ page: "organic-dairy-calving", filter: "year", farmId, defaultValue: nowC.getFullYear() });
  const [calvFilterMonth, setCalvFilterMonth] = usePersistedNumberFilter({ page: "organic-dairy-calving", filter: "month", farmId, defaultValue: nowC.getMonth(), isValid: (v) => v >= 0 && v <= 11 });
  function stepMonthC(dir: 1 | -1) {
    const next = calvFilterMonth + dir;
    if (next < 0) { setCalvFilterYear(calvFilterYear - 1); setCalvFilterMonth(11); }
    else if (next > 11) { setCalvFilterYear(calvFilterYear + 1); setCalvFilterMonth(0); }
    else { setCalvFilterMonth(next); }
  }
  const monthLabelC = new Date(calvFilterYear, calvFilterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const setF = (k: keyof OrgCalvingRecord, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const { data, isLoading } = useQuery<{ records: OrgCalvingRecord[] }>({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/calving-records`, { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<OrgCalvingRecord>) => {
      const url = editing ? `/api/farms/${farmId}/dairy/calving-records/${editing.id}` : `/api/farms/${farmId}/dairy/calving-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }); setOpen(false); setEditing(null); setForm({}); toast({ title: editing ? "Updated" : "Added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/dairy/calving-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ calvingDate: today(), numberOfCalves: 1, colostrumFromOrganicDam: true, organicStatusConfirmed: false }); setOpen(true); }
  function openEdit(r: OrgCalvingRecord) { setEditing(r); setForm({ ...r, calvingDate: r.calvingDate.slice(0, 10) }); setOpen(true); }

  const allRecords = data?.records ?? [];
  const calvingRecords = allRecords.filter(r => {
    if (!r.calvingDate) return false;
    const d = new Date(r.calvingDate);
    return d.getFullYear() === calvFilterYear && d.getMonth() === calvFilterMonth;
  });

  const totalCalves = calvingRecords.reduce((s, r) => s + (r.numberOfCalves ?? 1), 0);
  const stillborns = calvingRecords.reduce((s, r) => s + (r.calfOutcome === "stillborn" ? 1 : 0) + (r.calfOutcome2 === "stillborn" ? 1 : 0), 0);
  const colostrumRisk = calvingRecords.filter(r => r.calfOutcome !== "stillborn" && r.colostrumGivenWithin2Hours === false).length;
  const nonOrganicColostrum = calvingRecords.filter(r => r.colostrumFromOrganicDam === false).length;
  const hasDeadCalf = (r: Partial<OrgCalvingRecord>) => r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" || r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h";

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Organic welfare:</strong> Colostrum must be given within 2 hours of birth from the dam where possible. Record whether colostrum came from an organic dam. Confirm organic status of each calf born into the herd.
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Calvings</p><p className="text-2xl font-bold">{calvingRecords.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Live Calves</p><p className="text-2xl font-bold text-green-700">{totalCalves - stillborns}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Stillborn</p><p className={`text-2xl font-bold ${stillborns > 0 ? "text-red-700" : "text-gray-400"}`}>{stillborns}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Col. Risk</p><p className={`text-2xl font-bold ${colostrumRisk > 0 ? "text-amber-700" : "text-gray-400"}`}>{colostrumRisk}</p></CardContent></Card>
      </div>
      {colostrumRisk > 0 && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"><AlertTriangle className="h-4 w-4 flex-shrink-0" /><span>{colostrumRisk} calf{colostrumRisk !== 1 ? "s" : ""} did NOT receive colostrum within 2 hours — organic welfare concern.</span></div>}
      {nonOrganicColostrum > 0 && <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"><AlertTriangle className="h-4 w-4 flex-shrink-0" /><span>{nonOrganicColostrum} birth{nonOrganicColostrum !== 1 ? "s" : ""} used non-organic colostrum — document justification in notes.</span></div>}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-800">Calving Records</h2>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md">
            <button onClick={() => stepMonthC(-1)} className="p-1 rounded-l hover:bg-gray-200 transition-colors" aria-label="Previous month"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
            <span className="text-sm font-medium text-gray-700 px-2">{monthLabelC}</span>
            <button onClick={() => stepMonthC(1)} className="p-1 rounded-r hover:bg-gray-200 transition-colors" aria-label="Next month"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCalvingCsv(calvingRecords, farmName, monthLabelC)} disabled={calvingRecords.length === 0} className="gap-1.5"><FileDown className="w-4 h-4" />Download CSV</Button>
          <Button variant="outline" size="sm" onClick={() => printCalvingRecords(calvingRecords, farmName, monthLabelC)} disabled={calvingRecords.length === 0} className="gap-1.5"><Printer className="w-4 h-4" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Calving</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : calvingRecords.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No calving records for {monthLabelC}.</p></div>
      ) : (
        <div className="space-y-2">
          {calvingRecords.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{fmt(r.calvingDate)}</span>
                    {r.cowEarTag && <span className="font-mono text-xs text-gray-700">Dam: {r.cowEarTag}</span>}
                    <OrgEaseScoreBadgeDairy v={r.calvingEaseScore} />
                    {r.numberOfCalves && r.numberOfCalves > 1 && <Badge className="bg-purple-100 text-purple-700">Twins ×{r.numberOfCalves}</Badge>}
                    {r.calfOutcome && <Badge className={r.calfOutcome === "live" ? "bg-green-100 text-green-700" : r.calfOutcome === "stillborn" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>{r.calfOutcome}</Badge>}
                    {r.calfEarTag && <span className="font-mono text-xs text-gray-500">Calf: {r.calfEarTag}</span>}
                    {r.colostrumGivenWithin2Hours === true && <Badge className="bg-green-100 text-green-700">Col ≤2h ✓</Badge>}
                    {r.colostrumGivenWithin2Hours === false && <Badge className="bg-red-100 text-red-700">Col &gt;2h ⚠</Badge>}
                    {r.colostrumFromOrganicDam === false && <Badge className="bg-amber-100 text-amber-700">Non-organic col.</Badge>}
                    {r.organicStatusConfirmed && <Badge className="bg-teal-100 text-teal-700">Organic ✓</Badge>}
                    {r.bcmsPassportApplied && <Badge className="bg-blue-100 text-blue-700">Passport ✓</Badge>}
                    {hasDeadCalf(r) && !r.perinatalCollectionDate && <Badge className="bg-red-100 text-red-700">⚠ ABP not recorded</Badge>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Calving — {fmt(viewRecord.calvingDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dam Ear Tag</p><p className="font-mono font-medium">{viewRecord.cowEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">No. Calves</p><p className="font-medium">{viewRecord.numberOfCalves ?? 1}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Outcome</p><p className="font-medium capitalize">{viewRecord.calfOutcome || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sex</p><p className="font-medium capitalize">{viewRecord.calfSex || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calf Ear Tag</p><p className="font-mono font-medium">{viewRecord.calfEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birth Weight (kg)</p><p className="font-medium">{viewRecord.calfBirthWeightKg || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><OrgEaseScoreBadgeDairy v={viewRecord.calvingEaseScore} /></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No ⚠" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Col. Volume (1st feed)</p><p className="font-medium">{viewRecord.colostrumVolumeFirstFeedLitres ? `${viewRecord.colostrumVolumeFirstFeedLitres} L` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum from Organic Dam</p><p className="font-medium">{viewRecord.colostrumFromOrganicDam === true ? "Yes" : viewRecord.colostrumFromOrganicDam === false ? "No — see notes" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Status Confirmed</p><p className="font-medium">{viewRecord.organicStatusConfirmed ? "Yes" : "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BCMS Passport Applied</p><p className="font-medium">{viewRecord.bcmsPassportApplied ? "Yes" : "No"}</p></div>
              {hasDeadCalf(viewRecord) && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">ABP Disposal</p><p className="font-medium">{viewRecord.perinatalCollectionDate ? `Collected ${fmt(viewRecord.perinatalCollectionDate)} · Ref: ${viewRecord.perinatalCollectionRef || "—"} · Method: ${viewRecord.perinatalDisposalMethod || "—"}` : "Not recorded ⚠"}</p></div>}
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button><Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Calving Record" : "Add Calving Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Calving Date *</Label><Input type="date" value={String(form.calvingDate || "").slice(0, 10)} onChange={e => setF("calvingDate", e.target.value)} /></div>
            <div><Label>Dam Ear Tag</Label><Input value={form.cowEarTag || ""} onChange={e => setF("cowEarTag", e.target.value)} /></div>
            <div><Label>No. Calves</Label><Input type="number" min="1" max="3" value={form.numberOfCalves ?? 1} onChange={e => setF("numberOfCalves", parseInt(e.target.value))} /></div>
            <div><Label>Ease Score</Label>
              <Select value={String(form.calvingEaseScore || "")} onValueChange={v => setF("calvingEaseScore", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent><SelectItem value="1">1 — Unassisted</SelectItem><SelectItem value="2">2 — Easy pull</SelectItem><SelectItem value="3">3 — Hard pull</SelectItem><SelectItem value="4">4 — Mech. assistance</SelectItem><SelectItem value="5">5 — C-section</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Calf 1 — Outcome</Label>
              <Select value={form.calfOutcome || "__none__"} onValueChange={v => setF("calfOutcome", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="live">Live</SelectItem><SelectItem value="stillborn">Stillborn</SelectItem><SelectItem value="died-within-24h">Died within 24h</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Calf 1 — Sex</Label>
              <Select value={form.calfSex || "__none__"} onValueChange={v => setF("calfSex", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="male">Bull calf</SelectItem><SelectItem value="female">Heifer calf</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Calf 1 — Ear Tag</Label><Input value={form.calfEarTag || ""} onChange={e => setF("calfEarTag", e.target.value)} /></div>
            <div><Label>Birth Weight (kg)</Label><Input type="number" step="0.1" value={form.calfBirthWeightKg || ""} onChange={e => setF("calfBirthWeightKg", e.target.value)} /></div>
            {(form.numberOfCalves ?? 1) > 1 && <>
              <div><Label>Calf 2 — Outcome</Label>
                <Select value={form.calfOutcome2 || "__none__"} onValueChange={v => setF("calfOutcome2", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="live">Live</SelectItem><SelectItem value="stillborn">Stillborn</SelectItem><SelectItem value="died-within-24h">Died within 24h</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Calf 2 — Sex</Label>
                <Select value={form.calfSex2 || "__none__"} onValueChange={v => setF("calfSex2", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Bull calf</SelectItem><SelectItem value="female">Heifer calf</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Calf 2 — Ear Tag</Label><Input value={form.calfEarTag2 || ""} onChange={e => setF("calfEarTag2", e.target.value)} /></div>
            </>}
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">⚠ Organic Welfare — Colostrum</p></div>
            <div><Label>Colostrum Given ≤2h *</Label>
              <Select value={form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no"} onValueChange={v => setF("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes ✓</SelectItem><SelectItem value="no">No ⚠</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Colostrum ≤6h</Label>
              <Select value={form.colostrumGivenWithin6Hours == null ? "__none__" : form.colostrumGivenWithin6Hours ? "yes" : "no"} onValueChange={v => setF("colostrumGivenWithin6Hours", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes ✓</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Volume 1st Feed (L)</Label><Input type="number" step="0.1" value={form.colostrumVolumeFirstFeedLitres || ""} onChange={e => setF("colostrumVolumeFirstFeedLitres", e.target.value)} /></div>
            <div><Label>Colostrum from Organic Dam</Label>
              <Select value={form.colostrumFromOrganicDam == null ? "__none__" : form.colostrumFromOrganicDam ? "yes" : "no"} onValueChange={v => setF("colostrumFromOrganicDam", v === "__none__" ? null : v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No — note reason</SelectItem><SelectItem value="__none__">Not recorded</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-green-50 border-green-200">
              <Checkbox checked={!!form.organicStatusConfirmed} onCheckedChange={v => setF("organicStatusConfirmed", !!v)} id="org-calving-status" />
              <Label htmlFor="org-calving-status" className="cursor-pointer font-normal text-green-800">Organic status of this birth confirmed</Label>
            </div>
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">BCMS / Registration</p></div>
            <div className="col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.assistanceRequired} onChange={e => setF("assistanceRequired", e.target.checked)} />Assistance required</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.vetAttended} onChange={e => setF("vetAttended", e.target.checked)} />Vet attended</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.bcmsPassportApplied} onChange={e => setF("bcmsPassportApplied", e.target.checked)} />BCMS passport applied</label>
            </div>
            {form.vetAttended && <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => setF("vetName", e.target.value)} /></div>}
            {hasDeadCalf(form) && (
              <div className="col-span-2 space-y-2 rounded-md border border-red-100 p-3">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">ABP Disposal (required for dead calves)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Collection Date</Label><Input type="date" value={String(form.perinatalCollectionDate || "").slice(0, 10)} onChange={e => setF("perinatalCollectionDate", e.target.value)} /></div>
                  <div><Label>Collection Ref</Label><Input value={form.perinatalCollectionRef || ""} onChange={e => setF("perinatalCollectionRef", e.target.value)} /></div>
                  <div className="col-span-2"><Label>Disposal Method</Label><Input value={form.perinatalDisposalMethod || ""} onChange={e => setF("perinatalDisposalMethod", e.target.value)} placeholder="e.g. licensed knackery" /></div>
                </div>
              </div>
            )}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => setF("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Organic Dairy — DctTab ───────────────────────────────────────────────────

interface OrgDctRecord {
  id: number; dryOffDate: string; cowEarTag?: string | null; animalId?: number | null;
  protocol: string; antibioticTubeProduct?: string | null; antibioticTubeBatch?: string | null;
  standardMilkWithdrawalDays?: number | null; doubledMilkWithdrawalDays?: number | null;
  antibioticTubeWithdrawalMeatDays?: number | null;
  teatSealantProduct?: string | null; teatSealantBatch?: string | null;
  sccAtDryOff?: number | null; mastitisEpisodes12Months?: number | null;
  vetAuthorisation?: boolean | null; vetName?: string | null;
  therapeuticJustification?: string | null; certifierNotified?: boolean | null;
  expectedCalvingDate?: string | null; notes?: string | null;
}

function DctTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OrgDctRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<OrgDctRecord | null>(null);
  const [form, setForm] = useState<Partial<OrgDctRecord>>({});
  const setF = (k: keyof OrgDctRecord, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const { data, isLoading } = useQuery<{ records: OrgDctRecord[] }>({
    queryKey: ["dairy-dct", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/dct-records`, { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async (body: Partial<OrgDctRecord>) => {
      const url = editing ? `/api/farms/${farmId}/dairy/dct-records/${editing.id}` : `/api/farms/${farmId}/dairy/dct-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }); setOpen(false); setEditing(null); setForm({}); toast({ title: editing ? "Updated" : "Added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/dairy/dct-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ dryOffDate: today(), protocol: "selective", vetAuthorisation: true, certifierNotified: false }); setOpen(true); }
  function openEdit(r: OrgDctRecord) { setEditing(r); setForm({ ...r, dryOffDate: r.dryOffDate.slice(0, 10), expectedCalvingDate: r.expectedCalvingDate?.slice(0, 10) }); setOpen(true); }

  const allRecords = data?.records ?? [];
  const nowD = new Date();
  const [filterYear, setFilterYear] = usePersistedNumberFilter({ page: "organic-dairy-dct", filter: "year", farmId, defaultValue: nowD.getFullYear() });
  const [filterMonth, setFilterMonth] = usePersistedNumberFilter({ page: "organic-dairy-dct", filter: "month", farmId, defaultValue: nowD.getMonth(), isValid: (v) => v >= 0 && v <= 11 });
  function stepMonth(dir: 1 | -1) {
    const next = filterMonth + dir;
    if (next < 0) { setFilterYear(filterYear - 1); setFilterMonth(11); }
    else if (next > 11) { setFilterYear(filterYear + 1); setFilterMonth(0); }
    else { setFilterMonth(next); }
  }
  const monthLabel = new Date(filterYear, filterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const filteredList = allRecords.filter(r => {
    if (!r.dryOffDate) return false;
    const d = new Date(r.dryOffDate);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });

  const uncertifiedCount = allRecords.filter(r => r.antibioticTubeProduct && !r.certifierNotified).length;
  const blanketCount = allRecords.filter(r => r.protocol === "blanket" || r.protocol === "blanket-sealant").length;

  const ORG_PROTOCOLS = [
    { value: "selective", label: "Selective DCT — therapeutic only (antibiotic where indicated)" },
    { value: "teat-sealant-only", label: "Teat Sealant Only (no antibiotic)" },
    { value: "selective-sealant", label: "Selective DCT + Teat Sealant" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Organic rule:</strong> Blanket DCT (routine antibiotic dry-off of all cows) is NOT permitted on organic farms. All antibiotic use must be therapeutic with documented justification, vet authorisation, doubled withdrawal periods, and certifier notification.
      </div>
      {blanketCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{blanketCount} record{blanketCount !== 1 ? "s" : ""} recorded as Blanket DCT — this is not compliant on an organic farm.</span>
        </div>
      )}
      {uncertifiedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{uncertifiedCount} antibiotic treatment{uncertifiedCount !== 1 ? "s" : ""} where certifier has not been notified.</span>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-800">Dry Cow Therapy Records</h2>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md">
            <button onClick={() => stepMonth(-1)} className="p-1 rounded-l hover:bg-gray-200 transition-colors" aria-label="Previous month"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
            <span className="text-sm font-medium text-gray-700 px-2">{monthLabel}</span>
            <button onClick={() => stepMonth(1)} className="p-1 rounded-r hover:bg-gray-200 transition-colors" aria-label="Next month"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => printDctRegister(filteredList, farmName, monthLabel)} disabled={filteredList.length === 0} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" />Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportDctCsv(filteredList, monthLabel)} disabled={filteredList.length === 0} className="gap-1.5">
            <FileDown className="w-3.5 h-3.5" />CSV Export
          </Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add DCT Record</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> : filteredList.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>No DCT records yet.</p></div>
      ) : (
        <div className="space-y-2">
          {filteredList.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{fmt(r.dryOffDate)}</span>
                    {r.cowEarTag && <span className="font-mono text-xs text-gray-700">{r.cowEarTag}</span>}
                    <Badge className={r.protocol === "blanket" || r.protocol === "blanket-sealant" ? "bg-red-100 text-red-700" : r.protocol === "teat-sealant-only" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}>{r.protocol.replace(/-/g, " ")}</Badge>
                    {r.antibioticTubeProduct && <span className="text-xs text-gray-500">{r.antibioticTubeProduct}</span>}
                    {r.doubledMilkWithdrawalDays != null && <Badge className="bg-blue-100 text-blue-800">Dbl W/D: {r.doubledMilkWithdrawalDays}d</Badge>}
                    {r.vetAuthorisation && <Badge className="bg-green-100 text-green-700">Vet auth ✓</Badge>}
                    {r.certifierNotified && <Badge className="bg-teal-100 text-teal-700">Certifier notified ✓</Badge>}
                    {r.antibioticTubeProduct && !r.certifierNotified && <Badge className="bg-amber-100 text-amber-700">Certifier pending ⚠</Badge>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                {r.therapeuticJustification && <p className="text-xs text-gray-500 mt-1">Justification: {r.therapeuticJustification}</p>}
                {r.notes && <p className="text-xs text-gray-400 mt-0.5">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>DCT Record — {fmt(viewRecord.dryOffDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cow Ear Tag</p><p className="font-mono font-medium">{viewRecord.cowEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dry-Off Date</p><p className="font-medium">{fmt(viewRecord.dryOffDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protocol</p><p className="font-medium capitalize">{viewRecord.protocol?.replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Antibiotic Product</p><p className="font-medium">{viewRecord.antibioticTubeProduct || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Standard Milk W/D (days)</p><p className="font-medium">{viewRecord.standardMilkWithdrawalDays ?? "—"}</p></div>
              <div><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Doubled Milk W/D (days)</p><p className="font-bold text-blue-800">{viewRecord.doubledMilkWithdrawalDays ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Teat Sealant</p><p className="font-medium">{viewRecord.teatSealantProduct || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Dry-Off</p><p className="font-medium">{viewRecord.sccAtDryOff?.toLocaleString() ?? "—"} k/mL</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mastitis Eps (12m)</p><p className="font-medium">{viewRecord.mastitisEpisodes12Months ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Authorisation</p><p className="font-medium">{viewRecord.vetAuthorisation ? "Yes" : "No ⚠"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{viewRecord.vetName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Notified</p><p className="font-medium">{viewRecord.certifierNotified ? "Yes" : viewRecord.antibioticTubeProduct ? "Pending ⚠" : "N/A"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Calving</p><p className="font-medium">{fmt(viewRecord.expectedCalvingDate)}</p></div>
              {viewRecord.therapeuticJustification && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Therapeutic Justification</p><p className="font-medium">{viewRecord.therapeuticJustification}</p></div>}
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button><Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit DCT Record" : "Add Dry Cow Therapy Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Cow Ear Tag</Label><Input value={form.cowEarTag || ""} onChange={e => setF("cowEarTag", e.target.value)} /></div>
            <div><Label>Dry-Off Date *</Label><Input type="date" value={String(form.dryOffDate || "").slice(0, 10)} onChange={e => setF("dryOffDate", e.target.value)} /></div>
            <div className="col-span-2"><Label>Protocol *</Label>
              <Select value={form.protocol || "selective"} onValueChange={v => setF("protocol", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ORG_PROTOCOLS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.protocol !== "teat-sealant-only" && (
              <>
                <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antibiotic Tube</p></div>
                <div className="col-span-2"><Label>Product Name</Label><Input value={form.antibioticTubeProduct || ""} onChange={e => setF("antibioticTubeProduct", e.target.value)} placeholder="e.g. Orbeseal, Bovaclox DC" /></div>
                <div><Label>Batch Number</Label><Input value={form.antibioticTubeBatch || ""} onChange={e => setF("antibioticTubeBatch", e.target.value)} /></div>
                <div />
                <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">⚠ Organic — Doubled Withdrawal</p></div>
                <div><Label>Standard Milk W/D (days)</Label><Input type="number" value={form.standardMilkWithdrawalDays || ""} onChange={e => { const v = e.target.value ? parseInt(e.target.value) : null; setF("standardMilkWithdrawalDays", v); setF("doubledMilkWithdrawalDays", v ? v * 2 : null); }} /></div>
                <div><Label className="text-blue-700">Doubled Milk W/D (days)</Label><Input type="number" value={form.doubledMilkWithdrawalDays || ""} onChange={e => setF("doubledMilkWithdrawalDays", e.target.value ? parseInt(e.target.value) : null)} className="border-blue-300" /></div>
                <div><Label>Meat W/D (days)</Label><Input type="number" value={form.antibioticTubeWithdrawalMeatDays || ""} onChange={e => setF("antibioticTubeWithdrawalMeatDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
              </>
            )}
            {form.protocol?.includes("sealant") && (
              <>
                <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teat Sealant</p></div>
                <div><Label>Product</Label><Input value={form.teatSealantProduct || ""} onChange={e => setF("teatSealantProduct", e.target.value)} /></div>
                <div><Label>Batch Number</Label><Input value={form.teatSealantBatch || ""} onChange={e => setF("teatSealantBatch", e.target.value)} /></div>
              </>
            )}
            {form.protocol === "teat-sealant-only" && (
              <>
                <div className="col-span-2 border-t pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teat Sealant</p></div>
                <div><Label>Product</Label><Input value={form.teatSealantProduct || ""} onChange={e => setF("teatSealantProduct", e.target.value)} /></div>
                <div><Label>Batch Number</Label><Input value={form.teatSealantBatch || ""} onChange={e => setF("teatSealantBatch", e.target.value)} /></div>
              </>
            )}
            <div className="border-t col-span-2 pt-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cow Data</p></div>
            <div><Label>SCC at Dry-Off (k/mL)</Label><Input type="number" value={form.sccAtDryOff || ""} onChange={e => setF("sccAtDryOff", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Mastitis Eps (12m)</Label><Input type="number" min="0" value={form.mastitisEpisodes12Months ?? ""} onChange={e => setF("mastitisEpisodes12Months", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label>Expected Calving</Label><Input type="date" value={String(form.expectedCalvingDate || "").slice(0, 10)} onChange={e => setF("expectedCalvingDate", e.target.value)} /></div>
            <div><Label>Vet Name</Label><Input value={form.vetName || ""} onChange={e => setF("vetName", e.target.value)} /></div>
            <div className="col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={!!form.vetAuthorisation} onChange={e => setF("vetAuthorisation", e.target.checked)} />Vet authorisation in place</label>
            </div>
            {form.protocol !== "teat-sealant-only" && (
              <>
                <div className="col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30">
                  <Checkbox checked={!!form.certifierNotified} onCheckedChange={v => setF("certifierNotified", !!v)} id="org-dct-cert" />
                  <Label htmlFor="org-dct-cert" className="cursor-pointer font-normal">Certifier has been notified of this antibiotic treatment</Label>
                </div>
                <div className="col-span-2"><Label>Therapeutic Justification *</Label><Textarea value={form.therapeuticJustification || ""} onChange={e => setF("therapeuticJustification", e.target.value)} rows={2} placeholder="Document why antibiotic DCT is indicated for this cow (mastitis history, SCC, clinical signs…)" /></div>
              </>
            )}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => setF("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
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
      fetch(`/api/farms/${farmId}/organic-dairy/herd-conversion/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
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

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
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

function OrganicAbrBadge({ result }: { result?: string | null }) {
  if (!result || result === "not-tested") return <span className="text-gray-400 text-xs">—</span>;
  const map: Record<string, string> = {
    negative: "bg-green-100 text-green-800",
    positive: "bg-red-100 text-red-800",
    borderline: "bg-amber-100 text-amber-800",
    invalid: "bg-gray-100 text-gray-600",
  };
  return <Badge className={`text-xs ${map[result] ?? "bg-gray-100 text-gray-600"}`}>{result}</Badge>;
}

function OrganicLabResultsBadge({ status }: { status?: string | null }) {
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
  const { user } = useSafeUser();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<CollectionRecord | null>(null);
  const [form, setForm] = useState<Partial<CollectionRecord>>({});
  const [raiseTaskFor, setRaiseTaskFor] = useState<CollectionRecord | null>(null);
  const [formTab, setFormTab] = useState("collection");

  // Month filter — persisted per farm, default to current month
  const now = new Date();
  const [filterYear, setFilterYear] = usePersistedNumberFilter({
    page: "organic-dairy-collections",
    filter: "year",
    farmId,
    defaultValue: now.getFullYear(),
  });
  const [filterMonth, setFilterMonth] = usePersistedNumberFilter({
    page: "organic-dairy-collections",
    filter: "month",
    farmId,
    defaultValue: now.getMonth(),
    isValid: (v) => v >= 0 && v <= 11,
  }); // 0-indexed

  function stepMonth(dir: 1 | -1) {
    const next = filterMonth + dir;
    if (next < 0) { setFilterYear(filterYear - 1); setFilterMonth(11); }
    else if (next > 11) { setFilterYear(filterYear + 1); setFilterMonth(0); }
    else { setFilterMonth(next); }
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

  const [abrKitStockId, setAbrKitStockId] = useState<string>("");
  const abrStockQ = useQuery<{ stock: Array<{ id: number; productName: string; lotNumber: string | null; quantityRemaining: number }> }>({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/abr-test-kit-stock`).then(r => r.json()),
    enabled: !!farmId,
  });
  const abrStock = abrStockQ.data?.stock ?? [];

  const save = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/collections/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/collections`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, abrKitStockId: abrKitStockId || undefined }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setAbrKitStockId("");
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-dairy/collections/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-dairy-collections", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setAbrKitStockId("");
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
  function openEdit(r: CollectionRecord) { setEditing(r); setForm({ ...r }); setAbrKitStockId(""); setFormTab("collection"); setOpen(true); }

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
              <TableCell><OrganicAbrBadge result={r.antibioticResidueTestResult} /></TableCell>
              <TableCell><OrganicLabResultsBadge status={r.buyerLabResultsStatus} /></TableCell>
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
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ABR Result</p><p className="font-medium"><OrganicAbrBadge result={viewRecord.antibioticResidueTestResult} /></p></div>
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

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
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
                <div className="col-span-2 space-y-1"><Label>ABR Kit Stock Record</Label>
                  <Select value={abrKitStockId} onValueChange={setAbrKitStockId}>
                    <SelectTrigger><SelectValue placeholder="Link kit (auto-decrements stock)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None / not tracking</SelectItem>
                      {abrStock.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.productName}{s.lotNumber ? ` · Lot ${s.lotNumber}` : ""} ({s.quantityRemaining} remaining)</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                <div className="space-y-1"><Label>Buyer Lactose %</Label><Input type="number" step="0.01" value={form.buyerLactosePercentage ?? ""} onChange={f("buyerLactosePercentage")} /></div>
                <div className="space-y-1"><Label>Buyer Casein %</Label><Input type="number" step="0.01" value={form.buyerCaseinPercent ?? ""} onChange={f("buyerCaseinPercent")} /></div>
                <div className="space-y-1"><Label>Bactoscan (k/mL)</Label><Input type="number" value={form.buyerBactoscanThousands ?? ""} onChange={(e) => setForm(p => ({ ...p, buyerBactoscanThousands: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="space-y-1"><Label>TVC (cfu/mL)</Label><Input type="number" value={form.buyerTvcCfuMl ?? ""} onChange={(e) => setForm(p => ({ ...p, buyerTvcCfuMl: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="space-y-1"><Label>Thermodurics (cfu/mL)</Label><Input type="number" value={form.buyerThermsCfuMl ?? ""} onChange={(e) => setForm(p => ({ ...p, buyerThermsCfuMl: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="space-y-1"><Label>Coliforms (cfu/mL)</Label><Input type="number" value={form.buyerColiformsCfuMl ?? ""} onChange={(e) => setForm(p => ({ ...p, buyerColiformsCfuMl: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="col-span-2 space-y-1"><Label>Urea (mmol/L)</Label><Input type="number" step="0.1" value={form.buyerUreaMillimolesPerLitre ?? ""} onChange={f("buyerUreaMillimolesPerLitre")} /></div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
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

  // Month navigator — persisted per farm, default to current month
  const nowFeed = new Date();
  const [feedFilterYear, setFeedFilterYear] = usePersistedNumberFilter({
    page: "organic-dairy-feed",
    filter: "year",
    farmId,
    defaultValue: nowFeed.getFullYear(),
  });
  const [feedFilterMonth, setFeedFilterMonth] = usePersistedNumberFilter({
    page: "organic-dairy-feed",
    filter: "month",
    farmId,
    defaultValue: nowFeed.getMonth(),
    isValid: (v) => v >= 0 && v <= 11,
  }); // 0-indexed

  function stepFeedMonth(dir: 1 | -1) {
    const next = feedFilterMonth + dir;
    if (next < 0) { setFeedFilterYear(feedFilterYear - 1); setFeedFilterMonth(11); }
    else if (next > 11) { setFeedFilterYear(feedFilterYear + 1); setFeedFilterMonth(0); }
    else { setFeedFilterMonth(next); }
  }

  const feedMonthLabel = new Date(feedFilterYear, feedFilterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const records = useMemo(() => allFeedRecords.filter(r => {
    if (!r.recordDate) return false;
    const d = new Date(r.recordDate);
    return d.getFullYear() === feedFilterYear && d.getMonth() === feedFilterMonth;
  }), [allFeedRecords, feedFilterYear, feedFilterMonth]);

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
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-dairy/feed/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
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
        <Button variant="outline" size="sm" onClick={() => printFeedNutritionLog(allFeedRecords, farmName)} disabled={allFeedRecords.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Feed Log
        </Button>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Feed Record
        </Button>
      </div>

      {/* ── Month Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
        <button onClick={() => stepFeedMonth(-1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-700">{feedMonthLabel}</span>
        <button onClick={() => stepFeedMonth(1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Next month">
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
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
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                {allFeedRecords.length > 0
                  ? `No feed records for ${feedMonthLabel} — use the arrows to browse other months.`
                  : "No feed records yet — click Add Feed Record to begin."}
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

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
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
  const [animalSearch, setAnimalSearch] = useState("");

  // Month navigator — persisted per farm, default to current month
  const nowTreat = new Date();
  const [treatFilterYear, setTreatFilterYear] = usePersistedNumberFilter({
    page: "organic-dairy-treatments",
    filter: "year",
    farmId,
    defaultValue: nowTreat.getFullYear(),
  });
  const [treatFilterMonth, setTreatFilterMonth] = usePersistedNumberFilter({
    page: "organic-dairy-treatments",
    filter: "month",
    farmId,
    defaultValue: nowTreat.getMonth(),
    isValid: (v) => v >= 0 && v <= 11,
  }); // 0-indexed

  function stepTreatMonth(dir: 1 | -1) {
    const next = treatFilterMonth + dir;
    if (next < 0) { setTreatFilterYear(treatFilterYear - 1); setTreatFilterMonth(11); }
    else if (next > 11) { setTreatFilterYear(treatFilterYear + 1); setTreatFilterMonth(0); }
    else { setTreatFilterMonth(next); }
  }

  const treatMonthLabel = new Date(treatFilterYear, treatFilterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const { data: herdsData2 } = useQuery<{ records: CoreHerd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const herds = herdsData2?.records ?? [];

  const { data: animalsData, isLoading: animalsLoading } = useQuery<{ animals: any[] }>({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
    enabled: !!farmId,
  });
  const allTreatAnimals = animalsData?.animals ?? [];

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
      const stdMilk = form.standardMilkWithdrawalDays ? Number(form.standardMilkWithdrawalDays) : null;
      const stdMeat = form.standardMeatWithdrawalDays ? Number(form.standardMeatWithdrawalDays) : null;
      const dblMilk = stdMilk != null ? stdMilk * 2 : null;
      const dblMeat = stdMeat != null ? stdMeat * 2 : null;
      function addDays(d: string | null | undefined, days: number | null): string | null {
        if (!d || days == null) return null;
        const dt = new Date(d); dt.setDate(dt.getDate() + days); return dt.toISOString().slice(0, 10);
      }
      const body = {
        ...form,
        doubledMilkWithdrawalDays: dblMilk,
        doubledMeatWithdrawalDays: dblMeat,
        milkWithdrawalEndDate: addDays(form.treatmentDate, dblMilk),
        meatWithdrawalEndDate: addDays(form.treatmentDate, dblMeat),
        treatmentNumber: form.treatmentNumber ?? 1,
      };
      const url = editing
        ? `/api/farms/${farmId}/organic-dairy/treatments/${editing.id}`
        : `/api/farms/${farmId}/organic-dairy/treatments`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic-dairy/treatments/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-dairy-treatments", farmId] }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() { setEditing(null); setAnimalSearch(""); setForm({ certifierNotified: false, treatmentDate: new Date().toISOString().slice(0, 10) }); setOpen(true); }
  function openEdit(r: DairyTreatmentRecord) { setEditing(r); setAnimalSearch(""); setForm({ ...r }); setOpen(true); }

  const f = (k: keyof DairyTreatmentRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const filteredDairyTreatments = useMemo(() => records.filter(r => {
    if (!r.treatmentDate) return false;
    const d = new Date(r.treatmentDate);
    return d.getFullYear() === treatFilterYear && d.getMonth() === treatFilterMonth;
  }), [records, treatFilterYear, treatFilterMonth]);

  return (
    <div className="space-y-4">
      {medicineOrganicRecords.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <span>🌿</span>
          <span><strong>{medicineOrganicRecords.length} treatment{medicineOrganicRecords.length !== 1 ? "s" : ""}</strong> auto-populated from the Medicine Register. No double entry needed.</span>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => printDairyTreatmentRegister(records, farmName)} disabled={records.length === 0} className="gap-1.5">
          <Printer className="h-4 w-4" />Print Treatment Register
        </Button>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Standalone Treatment
        </Button>
      </div>

      {/* ── Month Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
        <button onClick={() => stepTreatMonth(-1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-700">{treatMonthLabel}</span>
        <button onClick={() => stepTreatMonth(1)} className="p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Next month">
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
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
          {records.length > 0 && filteredDairyTreatments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No standalone treatments for {treatMonthLabel} — use the arrows to browse other months.
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

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
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
              <Label>Herd</Label>
              <Select value={String(form.herdId ?? "__none__")} onValueChange={(v) => setForm((p) => ({ ...p, herdId: v === "__none__" ? null : Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select herd (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— All herds</SelectItem>
                  {herds.map((h) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Number of Cows Treated</Label>
              <Input type="number" value={form.numberOfCows ?? ""} onChange={f("numberOfCows")} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Animals Treated — Livestock Register</Label>
              <p className="text-xs text-gray-400 mt-0.5 mb-1">Select animals from the herd. Selected ear tags are saved to the record.</p>
              {(() => {
                const selTags = (form.cowIds || "").split(",").map((t: string) => t.trim()).filter(Boolean);
                const herdAnim = allTreatAnimals.filter((a: any) => !form.herdId || a.herdId === form.herdId);
                const filtAnim = herdAnim.filter((a: any) => {
                  if (!animalSearch) return true;
                  return (a.earTagNumber || a.tagNumber || "").toLowerCase().includes(animalSearch.toLowerCase());
                });
                return (
                  <div className="border rounded-md overflow-hidden">
                    <Input placeholder="Search by ear tag…" value={animalSearch} onChange={(e) => setAnimalSearch(e.target.value)} className="border-0 border-b rounded-none text-sm" />
                    {selTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-2 py-1.5 bg-emerald-50 border-b">
                        {selTags.map((tag: string) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800 text-xs font-mono">
                            {tag}
                            <button type="button" className="text-emerald-500 hover:text-red-600 ml-0.5 leading-none" onClick={() => {
                              const next = selTags.filter((t: string) => t !== tag);
                              setForm((p) => ({ ...p, cowIds: next.join(", ") || null, numberOfCows: next.length || p.numberOfCows }));
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="max-h-36 overflow-y-auto">
                      {herdAnim.length === 0
                        ? <p className="text-xs text-gray-400 px-3 py-2 italic">{animalsLoading ? "Loading animals…" : "No animals found — add animals to the livestock register first."}</p>
                        : filtAnim.length === 0
                          ? <p className="text-xs text-gray-400 px-3 py-2 italic">No animals match your search.</p>
                          : filtAnim.map((a: any) => {
                            const tag = a.earTagNumber || a.tagNumber || `Animal #${a.id}`;
                            const isSel = selTags.includes(tag);
                            return (
                              <button key={a.id} type="button"
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${isSel ? "bg-emerald-50" : ""}`}
                                onClick={() => {
                                  const next = isSel ? selTags.filter((t: string) => t !== tag) : [...selTags, tag];
                                  setForm((p) => ({ ...p, cowIds: next.join(", ") || null, numberOfCows: next.length || p.numberOfCows }));
                                }}
                              >
                                <span className={`h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center ${isSel ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 bg-white"}`}>
                                  {isSel && <CheckCircle2 className="h-2.5 w-2.5" />}
                                </span>
                                <span className="font-mono">{tag}</span>
                                {a.animalCode && <span className="text-gray-400">{a.animalCode}</span>}
                              </button>
                            );
                          })
                      }
                    </div>
                  </div>
                );
              })()}
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
            <div className="col-span-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1">Withdrawal Periods <span className="text-gray-400 font-normal normal-case">(organic = standard × 2)</span></p></div>
            <div className="space-y-1">
              <Label>Standard Milk Withdrawal (days)</Label>
              <Input type="number" min={0} value={form.standardMilkWithdrawalDays ?? ""} onChange={f("standardMilkWithdrawalDays")} placeholder="e.g. 4" />
            </div>
            <div className="space-y-1">
              <Label>Organic Milk Withdrawal (auto)</Label>
              <div className="h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm font-medium">
                {form.standardMilkWithdrawalDays ? `${Number(form.standardMilkWithdrawalDays) * 2} days` : "—"}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Standard Meat Withdrawal (days)</Label>
              <Input type="number" min={0} value={form.standardMeatWithdrawalDays ?? ""} onChange={f("standardMeatWithdrawalDays")} placeholder="e.g. 28" />
            </div>
            <div className="space-y-1">
              <Label>Organic Meat Withdrawal (auto)</Label>
              <div className="h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm font-medium">
                {form.standardMeatWithdrawalDays ? `${Number(form.standardMeatWithdrawalDays) * 2} days` : "—"}
              </div>
            </div>
            {form.treatmentDate && form.standardMilkWithdrawalDays && (
              <div className="space-y-1">
                <Label>Milk Withdrawal End Date (auto)</Label>
                <div className="h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm">
                  {(() => { const dt = new Date(form.treatmentDate); dt.setDate(dt.getDate() + Number(form.standardMilkWithdrawalDays) * 2); return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); })()}
                </div>
              </div>
            )}
            {form.treatmentDate && form.standardMeatWithdrawalDays && (
              <div className="space-y-1">
                <Label>Meat Withdrawal End Date (auto)</Label>
                <div className="h-9 flex items-center px-3 rounded-md border bg-emerald-50 text-emerald-800 text-sm">
                  {(() => { const dt = new Date(form.treatmentDate); dt.setDate(dt.getDate() + Number(form.standardMeatWithdrawalDays) * 2); return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); })()}
                </div>
              </div>
            )}
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
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
  const [activeTab, setActiveTab] = usePersistedTab<string>({ page: "organic-dairy", farmId, validIds: ["herd-conversion", "collections", "mastitis", "calving", "bcs", "mobility", "tank", "dct", "recording", "johnes", "feed", "treatments", "enterprise", "abr-kit", "scc-equipment", "supplies"], defaultTab: "herd-conversion" });
  const { data: farmData } = useQuery<{ name: string }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const name = farmData?.name ?? "Farm";

  const { data: dairyAlert } = useQuery({
    queryKey: ["dairy-platform-alert", farmId],
    queryFn: () => fetch(`/api/dairy-alert${farmId ? `?farmId=${farmId}` : ""}`).then(r => r.json()).catch(() => ({ active: false })),
    enabled: !!farmId,
  });

  return (
    <AppLayout title="Organic Dairy">
      {farmId && (
        <>
        <ArableFarmSettingsChecklist farmId={farmId} reportLabel="dairy" />
        {dairyAlert?.active && (
          <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
            dairyAlert.level === "national" ? "bg-red-50 border-red-200 text-red-800" :
            dairyAlert.level === "regional" ? "bg-orange-50 border-orange-200 text-orange-800" :
            "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">
                {dairyAlert.level === "national" ? "National Dairy Herd Disease Alert" :
                 dairyAlert.level === "regional" ? "Regional Dairy Herd Disease Alert" :
                 "Dairy Herd Disease Notice"}
              </span>
              {dairyAlert.message && <span className="ml-2">{dairyAlert.message}</span>}
              {(dairyAlert.issuedAt || dairyAlert.date) && <span className="ml-2 opacity-70 text-xs">{formatAlertIssuedAt(dairyAlert.issuedAt, dairyAlert.date)}</span>}
            </div>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <TabsTrigger value="abr-kit">ABR Kit Stock</TabsTrigger>
            <TabsTrigger value="scc-equipment">SCC Equipment</TabsTrigger>
            <TabsTrigger value="supplies">Supplies</TabsTrigger>
          </TabsList>
          <TabsContent value="herd-conversion" className="mt-4">
            <HerdConversionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="collections" className="mt-4">
            <MilkCollectionsTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="mastitis" className="mt-4">
            <MastitisTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="calving" className="mt-4">
            <CalvingTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="bcs" className="mt-4">
            <BcsTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="mobility" className="mt-4">
            <MobilityTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="tank" className="mt-4">
            <BulkTankTab farmId={farmId} showCollections={false} />
          </TabsContent>
          <TabsContent value="dct" className="mt-4">
            <DctTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="recording" className="mt-4">
            <RecordingVisitsTab farmId={farmId} />
          </TabsContent>
          <TabsContent value="johnes" />
          <TabsContent value="feed" className="mt-4">
            <FeedNutritionTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="treatments" className="mt-4">
            <TreatmentsTab farmId={farmId} farmName={name} />
          </TabsContent>
          <TabsContent value="enterprise" className="mt-4">
            <DairyEnterpriseReport farmId={farmId} />
          </TabsContent>
          <TabsContent value="scc-equipment" className="mt-4">
            <SccEquipmentSection farmId={farmId} species="cattle" />
          </TabsContent>
          <TabsContent value="abr-kit" className="mt-4">
            <AbrProcurementSection farmId={farmId} />
          </TabsContent>
          <TabsContent value="supplies" className="mt-4">
            <DairySuppliesTab farmId={farmId} dairyType="organic-cattle" />
          </TabsContent>
        </Tabs>
        {activeTab === "johnes" && <div className="mt-4"><OrganicJohnesTab farmId={farmId} /></div>}
        </>
      )}
    </AppLayout>
  );
}

function downloadCalvingCsv(records: OrgCalvingRecord[], farmName: string, monthLabel: string) {
  const easeLabel = ["", "Unassisted", "Easy pull", "Hard pull", "Mech. assist", "C-section"];
  const headers = [
    "Calving Date", "Dam Tag", "Calves",
    "Calf Tag", "Calf Sex", "Outcome",
    "Ease Score", "Colostrum ≤2h", "Organic Colostrum",
    "Organic Status", "BCMS Passport", "Notes",
  ];
  const dataRows = records.map(r => [
    r.calvingDate ? new Date(r.calvingDate).toLocaleDateString("en-GB") : "",
    r.cowEarTag ?? "",
    r.numberOfCalves != null ? String(r.numberOfCalves) : "1",
    r.calfEarTag ?? "",
    r.calfSex ?? "",
    r.calfOutcome ?? "",
    r.calvingEaseScore != null ? `${r.calvingEaseScore} — ${easeLabel[r.calvingEaseScore] ?? ""}` : "",
    r.colostrumGivenWithin2Hours === true ? "Yes" : r.colostrumGivenWithin2Hours === false ? "No" : "",
    r.colostrumFromOrganicDam === true ? "Yes" : r.colostrumFromOrganicDam === false ? "No" : "",
    r.organicStatusConfirmed ? "Confirmed" : "Pending",
    r.bcmsPassportApplied ? "Yes" : "No",
    r.notes ?? "",
  ]);
  const filename = `Calving_${farmName.replace(/[^a-z0-9]/gi, "_")}_${monthLabel.replace(/[^a-z0-9]/gi, "_")}.csv`;
  downloadCsvFile(filename, [headers, ...dataRows]);
}
function printCalvingRecords(records: OrgCalvingRecord[], farmName: string, monthLabel: string) {
  const today = new Date().toLocaleDateString("en-GB");
  const easeLabel = ["", "Unassisted", "Easy pull", "Hard pull", "Mech. assist", "C-section"];
  const rows = records.map(r => `
    <tr>
      <td>${esc(fmt(r.calvingDate))}</td>
      <td class="font-mono">${esc(r.cowEarTag)}</td>
      <td>${r.numberOfCalves ?? 1}</td>
      <td>${r.calfEarTag ? esc(r.calfEarTag) : '&mdash;'}${r.calfSex ? ' (' + esc(r.calfSex) + ')' : ''}</td>
      <td><span class="badge ${r.calfOutcome === 'live' ? 'badge-green' : r.calfOutcome === 'stillborn' ? 'badge-red' : 'badge-gray'}">${r.calfOutcome ? esc(r.calfOutcome) : '&mdash;'}</span></td>
      <td>${r.calvingEaseScore ? esc(r.calvingEaseScore) + ' &mdash; ' + esc(easeLabel[r.calvingEaseScore] || '') : '&mdash;'}</td>
      <td>${r.colostrumGivenWithin2Hours === true ? 'Yes &#10003;' : r.colostrumGivenWithin2Hours === false ? 'No &#9888;' : '&mdash;'}</td>
      <td>${r.colostrumFromOrganicDam === true ? 'Yes' : r.colostrumFromOrganicDam === false ? 'No' : '&mdash;'}</td>
      <td><span class="badge ${r.organicStatusConfirmed ? 'badge-green' : 'badge-gray'}">${r.organicStatusConfirmed ? 'Confirmed' : 'Pending'}</span></td>
      <td><span class="badge ${r.bcmsPassportApplied ? 'badge-green' : 'badge-gray'}">${r.bcmsPassportApplied ? 'Yes' : 'No'}</span></td>
      <td>${esc(r.notes)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Calving Register &mdash; ${esc(farmName)}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Calving Register</div><div class="farm">${esc(farmName)} &middot; ${esc(monthLabel)}</div></div>
    <div class="hdr-r"><b>Calving Records</b><br>${records.length} calving${records.length !== 1 ? "s" : ""}<br>Printed: ${esc(today)}</div></div>
    <table><thead><tr><th>Date</th><th>Dam Tag</th><th>Calves</th><th>Calf Tag (sex)</th><th>Outcome</th><th>Ease</th><th>Col &#8804;2h</th><th>Organic Col.</th><th>Organic Status</th><th>BCMS Passport</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
