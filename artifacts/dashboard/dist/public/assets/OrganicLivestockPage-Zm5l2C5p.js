import { b as useAppStore, m as useQuery, j as jsxRuntimeExports, c as useQueryClient, a as useToast, r as reactExports, S as useMutation, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, L as Label, I as Input, N as DialogMutationError, C as Checkbox, O as React, e as LoaderCircle, n as Card, o as CardContent } from "./index-CnPMRsi2.js";
import { R as RecordAttachments } from "./RecordAttachments-1k89Att1.js";
import { u as usePersistedTab } from "./use-persisted-tab-BB2xwmso.js";
import { A as AppLayout, p as Bell, c as ClipboardList } from "./AppLayout-DO1Qj-LS.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CFKfshtE.js";
import { B as Badge } from "./badge-3yJN2S3s.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DcKrf_Wg.js";
import { T as Textarea } from "./textarea-Uek8Hn90.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-GWAiOeyf.js";
import { S as StaffSelect } from "./staff-select-xGayFKsi.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-BxMaXkmh.js";
import { D as DocAttach } from "./DocAttach-CCH41iIU.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-DwwJ5RmY.js";
import { H as HerdsSection, A as AnimalsSection, V as VetHealthPlansSection, M as MortalitySection, F as FallenStockContractorsSection, a as FeedSection, W as WaterSection, S as SiresSection, b as StrawInventorySection, c as AIReproductionSection, T as TbTestsSection, d as WelfareOutcomeSection } from "./MortalitySection-D4NgqHfo.js";
import { P as Printer } from "./printer-B9vyeLHw.js";
import { E as Eye } from "./eye-Ck1VPN67.js";
import { P as Pencil } from "./pencil-Bv8a1VVz.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-0Uo4hwB8.js";
import { F as FileText } from "./shield-alert-xBDV0U9g.js";
import { T as TriangleAlert } from "./triangle-alert-BdSfMpvF.js";
import { C as ChevronRight } from "./tractor-Dy2DsQHg.js";
import { M as Mail } from "./mail-CIUP7D4-.js";
import { A as ArrowUpFromLine, a as ArrowDownToLine } from "./arrow-up-from-line-CTt6ScWB.js";
import { P as Paperclip } from "./paperclip-C73_-Vl0.js";
import { U as Upload } from "./upload-DBNQ64AS.js";
import { E as ExternalLink } from "./external-link-Cy5idohJ.js";
import { C as CircleCheck } from "./circle-check-GhL2LcET.js";
import "./use-upload-BbqCIA4h.js";
import "./image-BAPB47fe.js";
import "./download-Cc1pzWHK.js";
import "./use-safe-clerk-_i6GmcQS.js";
import "./database-CExeTER3.js";
import "./shield-check-BG0AfMsd.js";
import "./index-CD8LwwuB.js";
import "./index-B3dt8mGQ.js";
import "./index-5vETOCi8.js";
import "./chevron-up-BVbjvmU1.js";
import "./api-Dhdsf4oM.js";
import "./herd-utils-DXn3XBS9.js";
import "./use-lookup-BqtAPHJf.js";
import "./search-CV8uqbgA.js";
import "./use-persisted-filter-jxEk7_02.js";
import "./print-report-B_FwCCVJ.js";
import "./circle-x-CjmuwM6S.js";
import "./LabSelector-JIf0EiMz.js";
import "./index-Cx2ARuJS.js";
import "./qr-code-D2sGTFEo.js";
import "./syringe-D445Thwe.js";
import "./confirm-dialog-BJ3wJxOi.js";
const CERTIFIERS = [
  "Soil Association",
  "OF&G (Organic Farmers & Growers)",
  "Biodynamic Association (BDOCA)",
  "Other"
];
const LIVESTOCK_SPECIES = [
  "Cattle",
  "Sheep",
  "Pigs",
  "Poultry (Layers)",
  "Poultry (Broilers)",
  "Goats",
  "Deer",
  "Other"
];
const FEED_TYPES = [
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
  ["Other", "Other"]
];
const PRODUCT_CATEGORIES = [
  "Antibiotic",
  "NSAID",
  "Anthelmintic",
  "Antiparasitic",
  "Vaccine",
  "Homeopathic",
  "Other"
];
const ROUTES_OF_ADMINISTRATION = [
  "Intramuscular (IM)",
  "Subcutaneous (SC)",
  "Intravenous (IV)",
  "Oral",
  "Intramammary",
  "Topical",
  "Other"
];
function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB");
}
function fmtRaw(v) {
  return v == null || v === "" ? "—" : String(v);
}
function conversionStatusBadge(status) {
  const map = {
    "in-conversion": "bg-yellow-100 text-yellow-800",
    certified: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: map[status] ?? "bg-gray-100 text-gray-700", children: status.replace(/-/g, " ") });
}
function complianceBadge(status) {
  const map = {
    compliant: "bg-green-100 text-green-800",
    "non-compliant": "bg-red-100 text-red-800",
    derogation: "bg-amber-100 text-amber-800"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: map[status] ?? "bg-gray-100 text-gray-700", children: status.replace(/-/g, " ") });
}
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
function openPrint(html) {
  const w = window.open("", "_blank", "width=1100,height=780");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.addEventListener("afterprint", () => w.close());
  setTimeout(() => w.print(), 400);
}
function printConversionRegister(records, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
    <tr>
      <td>${fmtRaw(r.herdFlockName)}</td>
      <td>${fmtRaw(r.species)}</td>
      <td>${fmtRaw(r.numberOfAnimals)}</td>
      <td><span class="badge ${r.status === "certified" ? "badge-green" : r.status === "in-conversion" ? "badge-yellow" : "badge-red"}">${r.status.replace(/-/g, " ")}</span></td>
      <td>${fmt(r.conversionStartDate)}</td>
      <td>${fmt(r.expectedCertDate)}</td>
      <td>${fmt(r.actualCertDate)}</td>
      <td>${fmtRaw(r.certifier)}</td>
      <td>${fmtRaw(r.certificationRef)}</td>
      <td>${r.parallelProduction ? "Yes" : "No"}</td>
      <td>${fmtRaw(r.notes)}</td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Livestock Conversion Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Livestock Conversion Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Conversion Register</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Herd / Flock</th><th>Species</th><th>Animals</th><th>Status</th><th>Conv. Start</th><th>Exp. Cert</th><th>Actual Cert</th><th>Certifier</th><th>Cert Ref</th><th>Parallel</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function printFeedLog(records, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
    <tr>
      <td>${fmt(r.recordDate)}</td>
      <td>${fmtRaw(r.species)}</td>
      <td>${fmtRaw(r.herdFlockName)}</td>
      <td>${fmtRaw(r.feedProductName)}</td>
      <td>${fmtRaw(r.feedType)}</td>
      <td>${fmtRaw(r.supplier)}</td>
      <td>${fmtRaw(r.quantityKg)}</td>
      <td>${r.organicPercentage ? r.organicPercentage + "%" : "—"}</td>
      <td><span class="badge ${r.isOrganicApproved ? "badge-green" : "badge-red"}">${r.isOrganicApproved ? "Yes" : "No"}</span></td>
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
function printOutdoorAccessLog(records, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
    <tr>
      <td>${fmt(r.recordDate)}</td>
      <td>${fmtRaw(r.species)}</td>
      <td>${fmtRaw(r.herdFlockName)}</td>
      <td>${fmtRaw(r.numberOfAnimals)}</td>
      <td>${fmtRaw(r.pastureAreaHectares)}</td>
      <td>${r.stockingDensityPerHa ? r.stockingDensityPerHa + "/ha" : "—"}</td>
      <td>${fmtRaw(r.outdoorAccessHoursDay)}</td>
      <td><span class="badge ${r.complianceStatus === "compliant" ? "badge-green" : r.complianceStatus === "derogation" ? "badge-yellow" : "badge-red"}">${r.complianceStatus}</span></td>
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
function printTreatmentRegister(records, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const rows = records.map((r) => `
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
      <td><span class="badge ${r.certifierNotified ? "badge-green" : "badge-gray"}">${r.certifierNotified ? "Yes" : "No"}</span></td>
    </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Vet Treatment Register — ${farmName}</title><style>${PRINT_CSS}</style></head><body>
    <div class="hdr"><div class="hdr-l"><div class="title">Organic Livestock Vet Treatment Register</div><div class="farm">${farmName}</div></div>
    <div class="hdr-r"><b>Vet Treatments</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
    <table><thead><tr><th>Date</th><th>Species</th><th>Animal IDs</th><th>No.</th><th>Product</th><th>Category</th><th>Active Ingredient</th><th>Dose</th><th>Vet</th><th>Rx Ref</th><th>Std W/D</th><th>Doubled W/D</th><th>W/D End</th><th>Tx No.</th><th>Cert. Notified</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`);
}
function printParallelNotificationLetter(conversion, notification, farmName) {
  const fmtD = (d) => d ? (/* @__PURE__ */ new Date(d + "T00:00:00Z")).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
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
  <script>window.onload=function(){window.print();}<\/script>
</body>
</html>`;
  const w = window.open("", "_blank");
  if (!w) {
    alert("Please allow pop-ups to generate the notification letter.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
function ConversionTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data } = useQuery({
    queryKey: ["organic-livestock-conversion", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/conversion`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId
  });
  const coreHerds = herdsData?.records ?? [];
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/farms/${farmId}/organic-livestock/conversion/${editing.id}` : `/api/farms/${farmId}/organic-livestock/conversion`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (form.herdId) {
        await fetch(`/api/farms/${farmId}/herds/${form.herdId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isOrganicHerd: true,
            organicCertBody: form.certifier ?? void 0,
            organicCertNumber: form.certificationRef ?? void 0,
            organicConversionStartDate: form.conversionStartDate ? new Date(form.conversionStartDate).toISOString() : void 0
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
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
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-livestock/conversion/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-conversion", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const [notifConversion, setNotifConversion] = reactExports.useState(null);
  const [notifForm, setNotifForm] = reactExports.useState({ notificationYear: (/* @__PURE__ */ new Date()).getFullYear(), notifiedDate: "", certifierRef: "", notes: "" });
  const { data: notifData } = useQuery({
    queryKey: ["parallel-notifications", notifConversion?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/parallel-notifications/${notifConversion.id}`).then((r) => r.json()),
    enabled: !!notifConversion
  });
  const notifications = notifData?.notifications ?? [];
  const saveNotif = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/organic-livestock/parallel-notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversionId: notifConversion?.id, ...notifForm })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parallel-notifications", notifConversion?.id] });
      setNotifForm({ notificationYear: (/* @__PURE__ */ new Date()).getFullYear(), notifiedDate: "", certifierRef: "", notes: "" });
      toast({ title: "Notification recorded" });
    },
    onError: () => toast({ title: "Failed to save notification", variant: "destructive" })
  });
  const deleteNotif = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-livestock/parallel-notifications/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parallel-notifications", notifConversion?.id] }),
    onError: () => toast({ title: "Failed to delete notification", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ status: "in-conversion", parallelProduction: false, herdId: null });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, herdId: r.herdId ?? null });
    setOpen(true);
  }
  function onHerdSelect(herdId) {
    const herd = coreHerds.find((h) => String(h.id) === herdId);
    if (herd) {
      setForm((p) => ({ ...p, herdId: herd.id, herdFlockName: herd.name, species: herd.type.charAt(0).toUpperCase() + herd.type.slice(1) }));
    } else {
      setForm((p) => ({ ...p, herdId: null }));
    }
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    coreHerds.filter((h) => h.isOrganicHerd).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
        "🌿 ",
        coreHerds.filter((h) => h.isOrganicHerd).length,
        " herd",
        coreHerds.filter((h) => h.isOrganicHerd).length !== 1 ? "s" : "",
        " in your Livestock Register marked as organic:"
      ] }),
      coreHerds.filter((h) => h.isOrganicHerd).map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-2 py-0.5 text-xs font-medium", children: h.name }, h.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printConversionRegister(records, farmName), disabled: records.length === 0, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
        "Print Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Herd / Flock"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Herd / Flock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Animals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Conversion Start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Expected Cert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cert Doc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "text-center text-muted-foreground py-8", children: "No conversion records yet. Link a herd from your Livestock Register to get started." }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.species }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.herdFlockName }),
            r.herdId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs text-green-600 font-medium", children: "● Linked" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.numberOfAnimals ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.conversionStartDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.expectedCertDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: conversionStatusBadge(r.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.certifier ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocAttach,
            {
              farmId,
              endpoint: "organic-livestock/conversion",
              recordId: r.id,
              documentPath: r.certDocumentPath,
              documentName: r.certDocumentName,
              queryKey: ["organic-livestock-conversion", String(farmId)]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }),
            r.parallelProduction && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Annual Parallel Production Notifications", onClick: () => {
              setNotifConversion(r);
              setNotifForm({ notificationYear: (/* @__PURE__ */ new Date()).getFullYear(), notifiedDate: "", certifierRef: "", notes: "" });
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-amber-500" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Conversion Record — ",
        viewRecord.herdFlockName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.species) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd / Flock Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.herdFlockName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.numberOfAnimals) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.status.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Conversion Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.conversionStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.expectedCertDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actual Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.actualCertDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifier) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certification Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certificationRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Parallel Production" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.parallelProduction ? "Yes — certifier approval required" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certification Document" }),
          viewRecord.certDocumentName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 text-blue-600" }),
            viewRecord.certDocumentName
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-muted-foreground text-sm", children: "No document attached" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    notifConversion && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setNotifConversion(null);
        saveNotif.reset();
        deleteNotif.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Annual Parallel Production Notifications — ",
          notifConversion.herdFlockName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record each year's annual notification sent to your certifying body. UK Organic Regulations 2020 require annual notification of all parallel production arrangements. Generate a pre-filled letter for each year to send or email to your certifier." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 bg-muted/30 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Record a New Annual Notification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notification Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 2e3, max: 2099, value: notifForm.notificationYear, onChange: (e) => setNotifForm((p) => ({ ...p, notificationYear: parseInt(e.target.value) || (/* @__PURE__ */ new Date()).getFullYear() })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Notified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: notifForm.notifiedDate, onChange: (e) => setNotifForm((p) => ({ ...p, notifiedDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Ref / Acknowledgement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: notifForm.certifierRef, onChange: (e) => setNotifForm((p) => ({ ...p, certifierRef: e.target.value })), placeholder: "e.g. ACK-2024-001" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notifForm.notes, onChange: (e) => setNotifForm((p) => ({ ...p, notes: e.target.value })), rows: 2, placeholder: "Any additional details about this year's notification…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveNotif.mutate(), disabled: saveNotif.isPending || !notifForm.notifiedDate, children: saveNotif.isPending ? "Saving…" : "Save Notification" }) })
      ] }),
      notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "No annual notifications recorded yet for this herd/flock." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: notifications.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: n.notificationYear }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(n.notifiedDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: n.certifierRef ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocAttach,
            {
              farmId,
              endpoint: "organic-livestock/parallel-notifications",
              recordId: n.id,
              documentPath: n.documentPath,
              documentName: n.documentName,
              queryKey: ["parallel-notifications", String(notifConversion.id)]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Generate Notification Letter", onClick: () => printParallelNotificationLetter(notifConversion, n, farmName), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteNotif.mutate(n.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, n.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveNotif, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteNotif, message: "Failed to delete notification — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setNotifConversion(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Conversion Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Track the organic conversion status of a herd or flock." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Livestock Register Herd / Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.herdId ? String(form.herdId) : "__none__",
              onValueChange: (v) => onHerdSelect(v === "__none__" ? "" : v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select registered herd…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Enter manually —" }),
                  coreHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                    h.name,
                    " (",
                    h.type,
                    ")",
                    h.isOrganicHerd ? " 🌿" : ""
                  ] }, h.id))
                ] })
              ]
            }
          ),
          form.herdId ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "✓ Saving will mark this herd as organic in the Livestock Register." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Linking to a registered herd automatically flags it as organic across all modules." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.species ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, species: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LIVESTOCK_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockName ?? "", onChange: f("herdFlockName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfAnimals ?? "", onChange: f("numberOfAnimals") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "in-conversion", onValueChange: (v) => setForm((p) => ({ ...p, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in-conversion", children: "In Conversion" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "certified", children: "Certified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.conversionStartDate ?? "", onChange: f("conversionStartDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Certification Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedCertDate ?? "", onChange: f("expectedCertDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actual Certification Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.actualCertDate ?? "", onChange: f("actualCertDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificationRef ?? "", onChange: f("certificationRef") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: form.parallelProduction ?? false,
              onCheckedChange: (v) => setForm((p) => ({ ...p, parallelProduction: !!v })),
              id: "parallel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "parallel", children: "Parallel Production" })
        ] }),
        form.parallelProduction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-md border border-amber-400 bg-amber-50 px-4 py-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-amber-800 mb-1", children: "Certifier Approval Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-amber-700", children: "Under UK Organic Regulations 2020, parallel production — running organic and non-organic animals of the same species on the same holding — requires explicit written approval from your certification body. Ensure written approval is obtained before parallel production commences, record the certification reference above, and notify your certifier annually. Keep approval documentation on file for inspection." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function FeedTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [supplierId, setSupplierId] = reactExports.useState(null);
  const [filterYear, setFilterYear] = reactExports.useState("all");
  const [filterSpecies, setFilterSpecies] = reactExports.useState("all");
  const { data } = useQuery({
    queryKey: ["organic-livestock-feed", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = data?.records ?? [];
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()),
    enabled: !!farmId
  });
  const suppliers = suppliersData?.records ?? [];
  const { data: derogationsData } = useQuery({
    queryKey: ["feed-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const activeDerogations = (derogationsData?.cases ?? []).filter((c) => c.status === "approved");
  const yearOptions = Array.from(new Set(records.map((r) => r.recordDate?.slice(0, 4)).filter(Boolean))).sort().reverse();
  const speciesOptions = Array.from(new Set(records.map((r) => r.species).filter(Boolean))).sort();
  const multipleSpecies = speciesOptions.length > 1;
  const filteredRecords = records.filter((r) => {
    if (filterYear !== "all" && r.recordDate?.slice(0, 4) !== filterYear) return false;
    if (filterSpecies !== "all" && r.species !== filterSpecies) return false;
    return true;
  });
  const groupedRecords = {};
  if (multipleSpecies && filterSpecies === "all") {
    filteredRecords.forEach((r) => {
      const sp = r.species ?? "Unknown";
      if (!groupedRecords[sp]) groupedRecords[sp] = [];
      groupedRecords[sp].push(r);
    });
  } else {
    groupedRecords["__all__"] = filteredRecords;
  }
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId
  });
  const coreHerds = herdsData?.records ?? [];
  const save = useMutation({
    mutationFn: () => {
      const url = editing ? `/api/farms/${farmId}/organic-livestock/feed/${editing.id}` : `/api/farms/${farmId}/organic-livestock/feed`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-livestock/feed/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-feed", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ isOrganicApproved: true, recordDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setSupplierId(null);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    const matched = suppliers.find((s) => s.name === (r.supplier ?? ""));
    setSupplierId(matched?.id ?? null);
    setOpen(true);
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterYear, onValueChange: setFilterYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-32 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearOptions.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        speciesOptions.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterSpecies, onValueChange: setFilterSpecies, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-40 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All species" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All species" }),
            speciesOptions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printFeedLog(records, farmName), disabled: records.length === 0, className: "gap-1.5 h-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Feed Log"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Feed Record"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: multipleSpecies && filterSpecies === "all" ? "Herd / Flock" : "Species / Herd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Feed Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Qty (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Approved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        filteredRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: records.length === 0 ? "No feed records yet" : "No records match the selected filters" }) }),
        Object.entries(groupedRecords).sort(([a], [b]) => a === "__all__" ? 0 : a.localeCompare(b)).map(([species, rows]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          species !== "__all__" && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "bg-muted/40 font-semibold text-sm py-1.5 px-3 border-t", children: species }) }),
          rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.recordDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.herdFlockName ?? r.species ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.feedProductName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.feedType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.quantityKg ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.organicPercentage ? `${r.organicPercentage}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.isOrganicApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800", children: r.isOrganicApproved ? "Approved" : "Derogation" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] }) })
          ] }, r.id))
        ] }, species))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Feed Record — ",
        viewRecord.feedProductName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.recordDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.species) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd / Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.herdFlockName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.feedType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.feedProductName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.supplier) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier Approval No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.supplierApprovalNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.quantityKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.organicPercentage ? `${viewRecord.organicPercentage}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.poReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "GRN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.grnReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: viewRecord.isOrganicApproved ? "bg-green-100 text-green-800 mt-1" : "bg-amber-100 text-amber-800 mt-1", children: viewRecord.isOrganicApproved ? "Organic Approved" : "Non-approved — Derogation" })
        ] }),
        viewRecord.isOrganicApproved ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifierApprovalRef) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Derogation Approval Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.certifierApprovalRef) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Regulatory Derogation Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.derogationReference) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: viewRecord.isOrganicApproved ? "Notes" : "Derogation Justification / Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Feed Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log organic feed supplied to livestock." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.recordDate ?? "", onChange: f("recordDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.species ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, species: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LIVESTOCK_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
          (() => {
            const firstWord = (form.species ?? "").toLowerCase().split(/[\s(]/)[0];
            const filteredHerds = form.species ? coreHerds.filter((h) => {
              const t = h.type.toLowerCase().trim();
              return t === firstWord || t.startsWith(firstWord) || firstWord.startsWith(t);
            }) : coreHerds;
            const isLinked = filteredHerds.length > 0 && filteredHerds.some((h) => h.name === form.herdFlockName);
            return filteredHerds.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: isLinked ? form.herdFlockName ?? "" : "__manual__",
                  onValueChange: (v) => setForm((p) => ({ ...p, herdFlockName: v === "__manual__" ? "" : v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd / flock…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "— Enter manually —" }),
                      filteredHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: h.name, children: [
                        h.name,
                        h.isOrganicHerd ? " 🌿" : ""
                      ] }, h.id))
                    ] })
                  ]
                }
              ),
              !isLinked && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.herdFlockName ?? "", onChange: f("herdFlockName"), placeholder: "Herd / flock name" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockName ?? "", onChange: f("herdFlockName") });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.feedType ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, feedType: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEED_TYPES.map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: l }, v)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.feedProductName ?? "", onChange: f("feedProductName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          suppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: supplierId ? String(supplierId) : "__manual__",
                onValueChange: (v) => {
                  if (v === "__manual__") {
                    setSupplierId(null);
                    setForm((p) => ({ ...p, supplier: "", supplierApprovalNumber: "" }));
                  } else {
                    const s = suppliers.find((s2) => String(s2.id) === v);
                    setSupplierId(s?.id ?? null);
                    const autoApprovalNo = s?.ufasNumber || s?.femasNumber || "";
                    setForm((p) => ({ ...p, supplier: s?.name ?? "", supplierApprovalNumber: autoApprovalNo }));
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from supplier register…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "— Enter manually —" }),
                    suppliers.map((s) => {
                      const badge = s.ufasNumber ? ` · UFAS: ${s.ufasNumber}` : s.femasNumber ? ` · FEMAS: ${s.femasNumber}` : s.certificationBody ? ` · ${s.certificationBody}` : "";
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                        s.name,
                        badge
                      ] }, s.id);
                    })
                  ] })
                ]
              }
            ),
            supplierId === null && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: "mt-1",
                value: form.supplier ?? "",
                onChange: f("supplier"),
                placeholder: "Supplier name (not in register)"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplier ?? "", onChange: f("supplier") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Approval No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierApprovalNumber ?? "", onChange: f("supplierApprovalNumber"), placeholder: "UFAS or FEMAS registration number" }),
          supplierId && form.supplierApprovalNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Auto-populated from supplier record (UFAS/FEMAS). Edit to override." }),
          supplierId && !form.supplierApprovalNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "No UFAS/FEMAS number on this supplier record — enter manually or update the supplier register." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.quantityKg ?? "", onChange: f("quantityKg") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", max: "100", value: form.organicPercentage ?? "", onChange: f("organicPercentage") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.poReference ?? "", onChange: f("poReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.grnReference ?? "", onChange: f("grnReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: form.isOrganicApproved ?? true,
                onCheckedChange: (v) => setForm((p) => ({ ...p, isOrganicApproved: !!v })),
                id: "organic-approved"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "organic-approved", children: "Organic Approved" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tick if this feed comes from a UFAS/FEMAS-registered supplier and meets organic standards. Untick if you are using a non-approved ingredient under certifier derogation." })
        ] }),
        form.isOrganicApproved ?? true ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierApprovalRef ?? "", onChange: f("certifierApprovalRef"), placeholder: "Optional — batch approval reference" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-md border border-amber-300 bg-amber-50 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-600 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-amber-800", children: "Non-approved feed — certifier derogation required" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mt-1", children: "Under UK Organic Regulations 2020, non-organically-approved feed ingredients may only be used with prior written approval from your certification body. Link this record to an approved derogation case from the Feed Derogations tab, or enter the reference manually." })
            ] })
          ] }),
          activeDerogations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Approved Derogation Case" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.derogationCaseId ? String(form.derogationCaseId) : "__manual__",
                onValueChange: (v) => {
                  if (v === "__manual__") {
                    setForm((p) => ({ ...p, derogationCaseId: null }));
                  } else {
                    const dc = activeDerogations.find((d) => String(d.id) === v);
                    setForm((p) => ({ ...p, derogationCaseId: dc?.id ?? null, certifierApprovalRef: dc?.certifierRef ?? p.certifierApprovalRef, derogationReference: dc?.regulatoryCategory ?? p.derogationReference }));
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select derogation case…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "— Enter manually —" }),
                    activeDerogations.map((dc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(dc.id), children: [
                      dc.ingredientName,
                      dc.species ? ` (${dc.species})` : "",
                      dc.certifierRef ? ` · ${dc.certifierRef}` : ""
                    ] }, dc.id))
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Selecting a case auto-fills the certifier ref and regulatory category below. Manage derogation cases in the Feed Derogations tab." })
          ] }),
          activeDerogations.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
            "No active approved derogation cases found. Go to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Feed Derogations" }),
            " tab to create and manage derogation cases before linking records here."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Derogation Approval Ref *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierApprovalRef ?? "", onChange: f("certifierApprovalRef"), placeholder: "e.g. SA/DER/2025/001" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Reference issued by your certification body when approving this derogation." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regulatory Derogation Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.derogationReference ?? "", onChange: f("derogationReference"), placeholder: "e.g. Art. 22(2)(b)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The derogation category under UK Organic Regulations 2020, if stated by your certifier." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: !(form.isOrganicApproved ?? true) ? "Derogation Justification / Notes" : "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: form.notes ?? "",
              onChange: f("notes"),
              rows: 3,
              placeholder: !(form.isOrganicApproved ?? true) ? "State why no organically approved equivalent was available — this should match the justification submitted to your certification body." : void 0
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function OutdoorAccessTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilterOA, setYearFilterOA] = reactExports.useState("all");
  const { data } = useQuery({
    queryKey: ["organic-livestock-outdoor-access", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/outdoor-access`).then((r) => r.json()),
    enabled: !!farmId
  });
  const allRecords = data?.records ?? [];
  const yearsOA = reactExports.useMemo(() => {
    const s = new Set(allRecords.map((r) => String(r.recordDate ?? "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [allRecords]);
  const records = yearFilterOA === "all" ? allRecords : allRecords.filter((r) => String(r.recordDate ?? "").startsWith(yearFilterOA));
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId
  });
  const coreHerds = herdsData?.records ?? [];
  const save = useMutation({
    mutationFn: () => {
      const url = editing ? `/api/farms/${farmId}/organic-livestock/outdoor-access/${editing.id}` : `/api/farms/${farmId}/organic-livestock/outdoor-access`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-outdoor-access", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-livestock/outdoor-access/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-outdoor-access", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ complianceStatus: "compliant", recordDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterOA, onValueChange: setYearFilterOA, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsOA.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printOutdoorAccessLog(allRecords, farmName), disabled: allRecords.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Access Log"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Record"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Animals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Pasture (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Stocking Density" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Access hrs/day" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Compliance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Doc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 9, className: "text-center text-muted-foreground py-8", children: [
          "No outdoor access records",
          yearFilterOA !== "all" ? ` for ${yearFilterOA}` : "",
          " yet"
        ] }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.recordDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.species }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.numberOfAnimals ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.pastureAreaHectares ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.stockingDensityPerHa ? `${r.stockingDensityPerHa}/ha` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.outdoorAccessHoursDay ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: complianceBadge(r.complianceStatus) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "organic-livestock/outdoor-access", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["organic-livestock-outdoor-access", farmId], compact: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Outdoor Access Record — ",
        fmt(viewRecord.recordDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.recordDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.species) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd / Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.herdFlockName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.numberOfAnimals) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pasture Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.pastureAreaHectares) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Stocking Density" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.stockingDensityPerHa ? `${viewRecord.stockingDensityPerHa}/ha` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outdoor Access (hrs/day)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.outdoorAccessHoursDay) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Compliance Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.complianceStatus.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Housing Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.housingStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Housing End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.housingEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Housing Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.housingJustification) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Outdoor Access Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record daily outdoor access and stocking density for organic compliance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.recordDate ?? "", onChange: f("recordDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.species ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, species: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LIVESTOCK_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
          (() => {
            const firstWord = (form.species ?? "").toLowerCase().split(/[\s(]/)[0];
            const filteredHerds = form.species ? coreHerds.filter((h) => {
              const t = h.type.toLowerCase().trim();
              return t === firstWord || t.startsWith(firstWord) || firstWord.startsWith(t);
            }) : coreHerds;
            const isLinked = filteredHerds.length > 0 && filteredHerds.some((h) => h.name === form.herdFlockName);
            return filteredHerds.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: isLinked ? form.herdFlockName ?? "" : "__manual__",
                  onValueChange: (v) => setForm((p) => ({ ...p, herdFlockName: v === "__manual__" ? "" : v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd / flock…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "— Enter manually —" }),
                      filteredHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: h.name, children: [
                        h.name,
                        h.isOrganicHerd ? " 🌿" : ""
                      ] }, h.id))
                    ] })
                  ]
                }
              ),
              !isLinked && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.herdFlockName ?? "", onChange: f("herdFlockName"), placeholder: "Herd / flock name" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockName ?? "", onChange: f("herdFlockName") });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfAnimals ?? "", onChange: f("numberOfAnimals") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pasture Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", value: form.pastureAreaHectares ?? "", onChange: f("pastureAreaHectares") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stocking Density (per ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.stockingDensityPerHa ?? "", onChange: f("stockingDensityPerHa") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outdoor Access (hrs/day)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", value: form.outdoorAccessHoursDay ?? "", onChange: f("outdoorAccessHoursDay") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Compliance Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.complianceStatus ?? "compliant", onValueChange: (v) => setForm((p) => ({ ...p, complianceStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "compliant", children: "Compliant" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "non-compliant", children: "Non-Compliant" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "derogation", children: "Derogation" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Housing Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.housingStartDate ?? "", onChange: f("housingStartDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Housing End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.housingEndDate ?? "", onChange: f("housingEndDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Housing Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.housingJustification ?? "", onChange: f("housingJustification"), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function TreatmentsTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [raiseTaskRecord, setRaiseTaskRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data } = useQuery({
    queryKey: ["organic-livestock-treatments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/treatments`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: medData } = useQuery({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then((r) => r.json()),
    enabled: !!farmId
  });
  const medicineOrganicRecords = (medData?.records ?? []).filter((r) => r.isOrganicTreatment);
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: () => {
      const url = editing ? `/api/farms/${farmId}/organic-livestock/treatments/${editing.id}` : `/api/farms/${farmId}/organic-livestock/treatments`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-livestock/treatments/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-livestock-treatments", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ certifierNotified: false, treatmentNumber: 1, treatmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const treatYears = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.treatmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredTreatments = reactExports.useMemo(() => yearFilter === "all" ? records : records.filter((r) => String(r.treatmentDate ?? "").startsWith(yearFilter)), [records, yearFilter]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    medicineOrganicRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🌿" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          medicineOrganicRecords.length,
          " treatment",
          medicineOrganicRecords.length !== 1 ? "s" : ""
        ] }),
        " auto-populated from the Medicine Register. No double entry needed."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            treatYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printTreatmentRegister(records, farmName), disabled: records.length === 0, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          "Print Treatment Register"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Standalone Treatment"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Std W/D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic W/D End" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier Notified" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        medicineOrganicRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-green-50/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.administeredDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5", children: "Medicine Register" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.medicineName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: "Veterinary Medicine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.organicWithdrawalEndDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700 font-medium text-sm", children: [
            fmt(r.organicWithdrawalEndDate),
            " (",
            r.doubledWithdrawalDays,
            "d)"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700", children: r.certifierNotified ? "Yes" : "No" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "Edit in Medicines" }) })
        ] }, `med-${r.id}`)),
        records.length === 0 && medicineOrganicRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: "No treatment records yet. When you record a vet treatment for an organic herd in the Medicine Register, it will appear here automatically." }) }),
        filteredTreatments.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.treatmentDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Standalone" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.productName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.productCategory ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.standardWithdrawalDays ? `${r.standardWithdrawalDays}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.withdrawalEndDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.certifierNotified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700", children: r.certifierNotified ? "Yes" : "No" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-livestock-treatments", recordId: r.id, compact: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
            r.withdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Raise task for withdrawal end", onClick: () => setRaiseTaskRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-emerald-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem", maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Treatment Record — ",
        viewRecord.productName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.treatmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.species) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animal IDs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.animalIds) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.numberOfAnimals) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.productName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.productCategory) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.activeIngredient) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dose Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.doseAmount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Route of Administration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.routeOfAdministration) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.vetName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.prescriptionRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.standardWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doubled Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.doubledWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.withdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.treatmentNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certifierNotified ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.notes) })
        ] })
      ] }),
      viewRecord.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-livestock-treatments", recordId: viewRecord.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    raiseTaskRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskRecord,
        onClose: () => setRaiseTaskRecord(null),
        defaultTitle: `Organic withdrawal ends: ${raiseTaskRecord.productName} — due ${raiseTaskRecord.withdrawalEndDate ? (/* @__PURE__ */ new Date(raiseTaskRecord.withdrawalEndDate + "T00:00:00Z")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`,
        defaultDescription: `Verify animals treated with '${raiseTaskRecord.productName}' have completed their organic (doubled) withdrawal period before being sold as organic livestock.`,
        defaultDueDate: raiseTaskRecord.withdrawalEndDate ?? "",
        taskType: "organic_livestock_withdrawal",
        module: "Organic Livestock"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Treatment Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record veterinary treatments with organic withdrawal periods." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.treatmentDate ?? "", onChange: f("treatmentDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.species ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, species: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LIVESTOCK_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animal IDs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalIds ?? "", onChange: f("animalIds"), placeholder: "e.g. UK123456/789" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfAnimals ?? "", onChange: f("numberOfAnimals") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName ?? "", onChange: f("productName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.productCategory ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, productCategory: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRODUCT_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.activeIngredient ?? "", onChange: f("activeIngredient") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doseAmount ?? "", onChange: f("doseAmount"), placeholder: "e.g. 5ml/100kg" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Route of Administration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.routeOfAdministration ?? "",
              onValueChange: (v) => setForm((p) => ({ ...p, routeOfAdministration: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select route…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROUTES_OF_ADMINISTRATION.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName ?? "", onChange: f("vetName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.prescriptionRef ?? "", onChange: f("prescriptionRef") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardWithdrawalDays ?? "", onChange: f("standardWithdrawalDays") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doubled Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doubledWithdrawalDays ?? "", onChange: f("doubledWithdrawalDays") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.withdrawalEndDate ?? "", onChange: f("withdrawalEndDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.treatmentNumber ?? 1, onChange: f("treatmentNumber") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: form.certifierNotified ?? false,
              onCheckedChange: (v) => setForm((p) => ({ ...p, certifierNotified: !!v })),
              id: "cert-notified"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cert-notified", children: "Certifier Notified" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function FeedDerogRecordDecisionDialog({ farmId, derogCase, onClose, onSaved }) {
  const { toast } = useToast();
  const [status, setStatus] = reactExports.useState("approved");
  const [decisionDate, setDecisionDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [certifierRef, setCertifierRef] = reactExports.useState(derogCase.certifierRef ?? "");
  const [conditions, setConditions] = reactExports.useState(derogCase.conditions ?? "");
  const [expiryDate, setExpiryDate] = reactExports.useState(derogCase.expiryDate ?? "");
  const [rejectionReason, setRejectionReason] = reactExports.useState("");
  const [rejectionRef, setRejectionRef] = reactExports.useState("");
  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${derogCase.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...derogCase, status, decisionDate: decisionDate || null, certifierRef: certifierRef || null, conditions: conditions || null, expiryDate: expiryDate || null, rejectionReason: rejectionReason || null, rejectionRef: rejectionRef || null })
    }).then((r) => {
      if (!r.ok) throw new Error("Failed");
    }),
    onSuccess: () => {
      onSaved();
      toast({ title: "Decision recorded" });
      onClose();
    },
    onError: () => toast({ title: "Error saving decision", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Certifier Decision" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        derogCase.ingredientName,
        " — decision from ",
        derogCase.certifier ?? "certifying body"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: setStatus, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn (by applicant)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired — no decision received" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: decisionDate, onChange: (e) => setDecisionDate(e.target.value) })
        ] })
      ] }),
      status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: certifierRef, onChange: (e) => setCertifierRef(e.target.value), placeholder: "Reference from certifying body" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: conditions, onChange: (e) => setConditions(e.target.value), rows: 2, placeholder: "Any conditions attached to the approval…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: expiryDate, onChange: (e) => setExpiryDate(e.target.value) })
        ] })
      ] }),
      status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: rejectionReason, onChange: (e) => setRejectionReason(e.target.value), rows: 2, placeholder: "Certifier's stated reason for refusing the derogation" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: rejectionRef, onChange: (e) => setRejectionRef(e.target.value), placeholder: "Certifier's reference for the rejection notice" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || !decisionDate, children: mut.isPending ? "Saving…" : "Save Decision" })
    ] })
  ] }) });
}
const DEROG_STATUS_CFG = {
  pending: { label: "Pending", className: "bg-blue-100 text-blue-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  expired: { label: "Expired", className: "bg-red-100 text-red-800" },
  withdrawn: { label: "Withdrawn", className: "bg-gray-100 text-gray-700" }
};
const DOCUMENT_TYPES = [
  "Approval Letter",
  "Availability Search Evidence",
  "Application / Justification Letter",
  "Supporting Evidence",
  "Conditions Letter",
  "Correspondence",
  "Other"
];
function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 864e5);
}
function FeedDerogationTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editCase, setEditCase] = reactExports.useState(null);
  const [recordDecisionOpen, setRecordDecisionOpen] = reactExports.useState(false);
  const [recordDecisionFor, setRecordDecisionFor] = reactExports.useState(null);
  const blankCase = { ingredientName: "", feedProductName: "", species: "", certifier: "", status: "pending", certifierRef: "", regulatoryCategory: "", internalDecisionDate: "", appliedDate: "", decisionDate: "", expiryDate: "", availabilitySearchDone: false, availabilitySearchDate: "", availabilitySearchRef: "", justification: "", conditions: "", rejectionReason: "", rejectionRef: "", correctiveAction: "", notes: "" };
  const [form, setForm] = reactExports.useState(blankCase);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [corrDialogOpen, setCorrDialogOpen] = reactExports.useState(false);
  const [editCorr, setEditCorr] = reactExports.useState(null);
  const [corrDerogId, setCorrDerogId] = reactExports.useState(null);
  const blankCorr = { correspondenceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), direction: "to-certifier", subject: "", body: "", notes: "" };
  const [corrForm, setCorrForm] = reactExports.useState(blankCorr);
  const [uploading, setUploading] = reactExports.useState(false);
  const [uploadDerogId, setUploadDerogId] = reactExports.useState(null);
  const [uploadType, setUploadType] = reactExports.useState("Approval Letter");
  reactExports.useState(null);
  const { data: casesData, isLoading } = useQuery({
    queryKey: ["feed-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const cases = casesData?.cases ?? [];
  const { data: corrData } = useQuery({
    queryKey: ["feed-derogation-corr", expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${expandedId}/correspondence`).then((r) => r.json()),
    enabled: !!expandedId
  });
  const correspondence = corrData?.correspondence ?? [];
  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ["feed-derogation-docs", expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${expandedId}/documents`).then((r) => r.json()),
    enabled: !!expandedId
  });
  const documents = docsData?.documents ?? [];
  const saveCase = useMutation({
    mutationFn: (body) => {
      const url = body.id ? `/api/farms/${farmId}/organic-livestock/feed-derogations/${body.id}` : `/api/farms/${farmId}/organic-livestock/feed-derogations`;
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-derogations", farmId] });
      setDialogOpen(false);
      toast({ title: "Derogation case saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteCase = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-derogations", farmId] });
      if (expandedId === deleteCase.variables) setExpandedId(null);
      toast({ title: "Case deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveCorr = useMutation({
    mutationFn: (body) => {
      const url = body.id ? `/api/farms/${farmId}/organic-livestock/feed-derogations/${body.derogationId}/correspondence/${body.id}` : `/api/farms/${farmId}/organic-livestock/feed-derogations/${body.derogationId}/correspondence`;
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-derogation-corr", expandedId] });
      setCorrDialogOpen(false);
      setEditCorr(null);
      toast({ title: "Correspondence saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteCorr = useMutation({
    mutationFn: ({ derogationId, corrId }) => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${derogationId}/correspondence/${corrId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-derogation-corr", expandedId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const deleteDoc = useMutation({
    mutationFn: ({ derogationId, docId }) => fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${derogationId}/documents/${docId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-derogation-docs", expandedId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openNewCase() {
    setForm(blankCase);
    setEditCase(null);
    setDialogOpen(true);
  }
  function openEditCase(c) {
    setForm({ ingredientName: c.ingredientName, feedProductName: c.feedProductName ?? "", species: c.species ?? "", certifier: c.certifier ?? "", status: c.status, certifierRef: c.certifierRef ?? "", regulatoryCategory: c.regulatoryCategory ?? "", internalDecisionDate: c.internalDecisionDate ?? "", appliedDate: c.appliedDate ?? "", decisionDate: c.decisionDate ?? "", expiryDate: c.expiryDate ?? "", availabilitySearchDone: c.availabilitySearchDone, availabilitySearchDate: c.availabilitySearchDate ?? "", availabilitySearchRef: c.availabilitySearchRef ?? "", justification: c.justification ?? "", conditions: c.conditions ?? "", rejectionReason: c.rejectionReason ?? "", rejectionRef: c.rejectionRef ?? "", correctiveAction: c.correctiveAction ?? "", notes: c.notes ?? "" });
    setEditCase(c);
    setDialogOpen(true);
  }
  function f(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }
  function openNewCorr(derogationId) {
    setCorrForm(blankCorr);
    setEditCorr(null);
    setCorrDerogId(derogationId);
    setCorrDialogOpen(true);
  }
  function openEditCorr(c) {
    setCorrForm({ correspondenceDate: c.correspondenceDate, direction: c.direction, subject: c.subject, body: c.body ?? "", notes: c.notes ?? "" });
    setEditCorr(c);
    setCorrDerogId(c.derogationId);
    setCorrDialogOpen(true);
  }
  function fc(k) {
    return (e) => setCorrForm((p) => ({ ...p, [k]: e.target.value }));
  }
  async function handleFileUpload(derogationId, file, docType) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type })
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/organic-livestock/feed-derogations/${derogationId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: objectPath, documentName: file.name, documentType: docType, fileSize: file.size, mimeType: file.type })
      });
      qc.invalidateQueries({ queryKey: ["feed-derogation-docs", derogationId] });
      toast({ title: "Document uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }
  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        Object.entries(DEROG_STATUS_CFG).map(
          ([status, cfg]) => statusCounts[status] ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: cfg.className, children: [
            cfg.label,
            ": ",
            statusCounts[status]
          ] }, status) : null
        ),
        cases.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No derogation cases yet." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openNewCase, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " New Derogation Case"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "UK Organic Regulations 2020 — Article 22" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Non-organically-approved feed ingredients may only be used with ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "prior written approval" }),
        " from your certification body. Each approval is ingredient-specific and time-limited. Keep the certifier's written approval, your availability search evidence, and all correspondence on file — inspectors will ask to see these."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: cases.map((c) => {
      const cfg = DEROG_STATUS_CFG[c.status] ?? DEROG_STATUS_CFG.pending;
      const days = daysUntil(c.expiryDate);
      const isExpanded = expandedId === c.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 cursor-pointer",
            onClick: () => setExpandedId(isExpanded ? null : c.id),
            children: [
              isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: c.ingredientName }),
                  c.species && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "(",
                    c.species,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cfg.className + " text-xs", children: cfg.label }),
                  c.status === "approved" && days !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: days < 14 ? "bg-red-100 text-red-800 text-xs" : days < 60 ? "bg-amber-100 text-amber-800 text-xs" : "bg-gray-100 text-gray-700 text-xs", children: days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining` }),
                  c.availabilitySearchDone && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-50 text-green-700 text-xs border border-green-200", children: "Availability search ✓" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap", children: [
                  c.certifier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Certifier: ",
                    c.certifier
                  ] }),
                  c.certifierRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Ref: ",
                    c.certifierRef
                  ] }),
                  c.appliedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Applied: ",
                    fmt(c.appliedDate)
                  ] }),
                  c.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Expires: ",
                    fmt(c.expiryDate)
                  ] }),
                  c.regulatoryCategory && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.regulatoryCategory })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0 items-center", onClick: (e) => e.stopPropagation(), children: [
                c.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 gap-1", onClick: () => {
                  setRecordDecisionFor(c);
                  setRecordDecisionOpen(true);
                }, children: "Record Decision" }),
                c.status === "rejected" && !c.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-orange-100 text-orange-800 text-xs border border-orange-300", children: "Action Required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEditCase(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteCase.mutate(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
              ] })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t bg-muted/10 p-4 space-y-5", children: [
          c.status === "rejected" && !c.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Action Required:" }),
            " This derogation was rejected. Record a corrective action (what the farm did in response) by editing this case."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm", children: [
            c.feedProductName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Feed product: " }),
              c.feedProductName
            ] }),
            c.internalDecisionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Internal decision: " }),
              fmt(c.internalDecisionDate)
            ] }),
            c.availabilitySearchDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Availability search: " }),
              fmt(c.availabilitySearchDate)
            ] }),
            c.availabilitySearchRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Search ref: " }),
              c.availabilitySearchRef
            ] }),
            c.decisionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Decision date: " }),
              fmt(c.decisionDate)
            ] }),
            c.conditions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Conditions: " }),
              c.conditions
            ] }),
            c.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rejection reason: " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700", children: c.rejectionReason })
            ] }),
            c.rejectionRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rejection ref: " }),
              c.rejectionRef
            ] }),
            c.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Corrective action: " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: c.correctiveAction })
            ] }),
            c.justification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Justification: " }),
              c.justification
            ] }),
            c.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes: " }),
              c.notes
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
                " Correspondence Log"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => openNewCorr(c.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
                " Add Entry"
              ] })
            ] }),
            correspondence.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No correspondence logged yet. Add entries to record communications with your certifier." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Direction" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Subject" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-16" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: correspondence.map((cr) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: fmt(cr.correspondenceDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  cr.direction === "to-certifier" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-3 w-3 text-blue-600" }) : cr.direction === "from-certifier" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { className: "h-3 w-3 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3 text-gray-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cr.direction === "to-certifier" ? "To certifier" : cr.direction === "from-certifier" ? "From certifier" : "Internal" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-medium", children: cr.subject }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: fmtRaw(cr.notes) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEditCorr(cr), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => deleteCorr.mutate({ derogationId: c.id, corrId: cr.id }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
                ] }) })
              ] }, cr.id)) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }),
                " Documents"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: uploadType, onValueChange: setUploadType, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-48 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DOCUMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-7 text-xs gap-1",
                    disabled: uploading,
                    onClick: () => {
                      const inp = document.createElement("input");
                      inp.type = "file";
                      inp.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
                      inp.onchange = async () => {
                        const file = inp.files?.[0];
                        if (file) await handleFileUpload(c.id, file, uploadType);
                      };
                      inp.click();
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3 w-3" }),
                      uploading ? "Uploading…" : "Upload"
                    ]
                  }
                )
              ] })
            ] }),
            documents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No documents uploaded yet. Upload the certifier's approval letter, your availability search evidence, and any supporting correspondence." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: documents.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border bg-background px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium truncate", children: doc.fileName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  doc.notes,
                  " · ",
                  new Date(doc.uploadedAt).toLocaleDateString("en-GB")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api${doc.fileKey}`, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => deleteDoc.mutate({ derogationId: c.id, docId: doc.id }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
            ] }, doc.id)) })
          ] })
        ] })
      ] }, c.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (o) => {
      setDialogOpen(o);
      if (!o) saveCase.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editCase ? "Edit Derogation Case" : "New Derogation Case" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record a certifier-approved derogation for a specific non-organic feed ingredient. One case covers all deliveries of this ingredient for the approved period." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Non-Organic Ingredient Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ingredientName, onChange: f("ingredientName"), placeholder: "e.g. Soya bean meal, Fish meal, Linseed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The specific ingredient — not the feed product name. Be precise; the certifier's approval is ingredient-specific." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Product Name (if applicable)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.feedProductName, onChange: f("feedProductName"), placeholder: "e.g. Blend X 18% Protein" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species || "__all__", onValueChange: (v) => setForm((p) => ({ ...p, species: v === "__all__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All species" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All / Not species-specific" }),
              LIVESTOCK_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: CERTIFIERS.includes(form.certifier) ? form.certifier : form.certifier ? "Other" : "", onValueChange: (v) => setForm((p) => ({ ...p, certifier: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certifier…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERTIFIERS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] }),
          (form.certifier === "Other" || !!form.certifier && !CERTIFIERS.slice(0, -1).includes(form.certifier)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.certifier === "Other" ? "" : form.certifier, onChange: (e) => setForm((p) => ({ ...p, certifier: e.target.value || "Other" })), placeholder: "Please specify…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((p) => ({ ...p, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending — awaiting certifier decision" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierRef, onChange: f("certifierRef"), placeholder: "e.g. SA/DER/2025/042" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The reference issued by the certifier in their approval letter." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regulatory Derogation Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.regulatoryCategory, onChange: f("regulatoryCategory"), placeholder: "e.g. Art. 22(2)(b) UK Org Regs 2020" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Applied to Certifier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.appliedDate, onChange: f("appliedDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Decision Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.decisionDate, onChange: f("decisionDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate, onChange: f("expiryDate") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Typically the end of the certification year. Derogations must be renewed annually." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Internal Decision Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.internalDecisionDate, onChange: f("internalDecisionDate") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Date the holding internally decided this ingredient was needed." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "avail-search", checked: form.availabilitySearchDone, onCheckedChange: (v) => setForm((p) => ({ ...p, availabilitySearchDone: !!v })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "avail-search", children: "Availability search completed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Tick when you have documented evidence that no organic equivalent was available from any supplier." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.availabilitySearchDate, onChange: f("availabilitySearchDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Ref (OFAS / UKOAS)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.availabilitySearchRef, onChange: f("availabilitySearchRef"), placeholder: "Search reference number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.justification, onChange: f("justification"), rows: 3, placeholder: "State why no organically approved equivalent was available — species/category, suppliers contacted, and outcome. This should match what you submitted to the certifier." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conditions Attached to Approval" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.conditions, onChange: f("conditions"), rows: 2, placeholder: "Any conditions stated by the certifier in their approval letter, e.g. maximum inclusion rate, review date, re-application requirements." })
        ] }),
        form.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.rejectionReason, onChange: f("rejectionReason"), rows: 2, placeholder: "Certifier's stated reason for refusing the derogation" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.rejectionRef, onChange: f("rejectionRef"), placeholder: "Certifier's reference for the rejection notice" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.correctiveAction, onChange: f("correctiveAction"), rows: 2, placeholder: "What the farm did in response — e.g. sourced organic alternative, reformulated feed, submitted revised application" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: f("notes"), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveCase, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveCase.mutate({ ...form, id: editCase?.id }), disabled: saveCase.isPending || !form.ingredientName.trim(), children: saveCase.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    recordDecisionOpen && recordDecisionFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FeedDerogRecordDecisionDialog,
      {
        farmId,
        derogCase: recordDecisionFor,
        onClose: () => {
          setRecordDecisionOpen(false);
          setRecordDecisionFor(null);
        },
        onSaved: () => qc.invalidateQueries({ queryKey: ["feed-derogations", farmId] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: corrDialogOpen, onOpenChange: (o) => {
      setCorrDialogOpen(o);
      if (!o) saveCorr.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editCorr ? "Edit Correspondence Entry" : "Add Correspondence Entry" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: corrForm.correspondenceDate, onChange: fc("correspondenceDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: corrForm.direction, onValueChange: (v) => setCorrForm((p) => ({ ...p, direction: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "to-certifier", children: "To certifier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "from-certifier", children: "From certifier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "internal", children: "Internal note" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Subject *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: corrForm.subject, onChange: fc("subject"), placeholder: "e.g. Derogation application for soya bean meal — 2025" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Body / Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: corrForm.body, onChange: fc("body"), rows: 4, placeholder: "Summary of the communication — key points, any decisions or commitments made." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: corrForm.notes, onChange: fc("notes"), placeholder: "e.g. Sent by email, ref: ticket #12345" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveCorr, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setCorrDialogOpen(false);
          setEditCorr(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => saveCorr.mutate({ ...corrForm, id: editCorr?.id, derogationId: corrDerogId }),
            disabled: saveCorr.isPending || !corrForm.subject.trim() || !corrDerogId,
            children: saveCorr.isPending ? "Saving…" : "Save"
          }
        )
      ] })
    ] }) })
  ] });
}
function KiddingEaseBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" });
  const map = {
    1: { label: "1 — Unassisted", cls: "bg-green-100 text-green-700" },
    2: { label: "2 — Minor assist", cls: "bg-yellow-100 text-yellow-700" },
    3: { label: "3 — Major assist", cls: "bg-orange-100 text-orange-700" },
    4: { label: "4 — Vet required", cls: "bg-red-100 text-red-700" }
  };
  const d = map[v];
  return d ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded font-medium ${d.cls}`, children: d.label }) : null;
}
function KiddingSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const todayStr = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const BLANK = {
    kiddingDate: todayStr(),
    birthOutcome: "live-single",
    kidCount: 1,
    assistanceRequired: false,
    vetAttended: false,
    eidApplied: false
  };
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(BLANK);
  const [confirmDelete, setConfirmDelete] = reactExports.useState(null);
  const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = reactExports.useState(String(CURRENT_YEAR));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data, isLoading } = useQuery({
    queryKey: ["ol-kidding-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-livestock/kidding-records`, { credentials: "include" }).then((r) => r.json())
  });
  const allRecords = data?.records ?? [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter((r) => r.kiddingDate?.startsWith(yearFilter));
  const availableYears = [...new Set(allRecords.map((r) => r.kiddingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));
  const liveKids = records.reduce((s, r) => s + (r.birthOutcome?.startsWith("live") ? r.kidCount ?? 1 : 0), 0);
  const eidPending = records.filter((r) => r.birthOutcome?.startsWith("live") && !r.eidApplied).length;
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? `/api/farms/${farmId}/organic-livestock/kidding-records/${editing.id}` : `/api/farms/${farmId}/organic-livestock/kidding-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ol-kidding-records", farmId] });
      closeDialog();
      toast({ title: editing ? "Record updated" : "Kidding record added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic-livestock/kidding-records/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ol-kidding-records", farmId] });
      setConfirmDelete(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm(BLANK);
  }
  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK, kiddingDate: todayStr() });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, kiddingDate: r.kiddingDate?.slice(0, 10) ?? "" });
    setOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-900 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS Tagging:" }),
      " All goat kids must be electronically identified (EID) before first movement off the holding. Record EID application date and tag number for each live kid."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Goat kidding records — doe tag, litter size, ease score, colostrum, EID tagging compliance, and perinatal details." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Organic certification (Soil Association / OF&G): kidding records contribute to herd health and welfare evidence at inspection." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Kidding Record"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Litters Recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: records.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Live Kids" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: liveKids })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "EID Pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${eidPending > 0 ? "text-amber-700" : "text-muted-foreground"}`, children: eidPending })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground text-sm", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Doe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kids" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sex" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ease" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "EID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Colostrum ≤2h" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 9, className: "text-center text-muted-foreground py-8", children: [
        "No kidding records for ",
        yearFilter === "all" ? "any year" : yearFilter,
        ". Add the first one above."
      ] }) }) : records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.kiddingDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: fmtRaw(r.doeLisTag) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: r.birthOutcome?.replace(/-/g, " ") ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.kidCount ?? 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: r.kidSex ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(KiddingEaseBadge, { v: r.easeScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.eidApplied ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 font-medium text-xs", children: "✓ Applied" }) : r.birthOutcome?.startsWith("live") ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 text-xs font-medium", children: "Pending" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "N/A" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.colostrumGivenWithin2Hours === true ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 text-xs font-medium", children: "✓ Yes" }) : r.colostrumGivenWithin2Hours === false ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 text-xs font-medium", children: "No" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setConfirmDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] }) })
      ] }, r.id)) })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Kidding Record — ",
        fmt(viewRecord.kiddingDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: fmtRaw(viewRecord.doeLisTag) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.birthOutcome?.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Kid Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.kidCount ?? 1 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: fmtRaw(viewRecord.kidSex) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRecord.kidBirthWeightKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KiddingEaseBadge, { v: viewRecord.easeScore })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "EID Applied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.eidApplied ? `Yes — ${fmt(viewRecord.eidAppliedDate)}` : "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "LIS Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: fmtRaw(viewRecord.lisTagNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assistance Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assistanceRequired ? `Yes — ${viewRecord.assistanceType ?? ""}` : "No" })
        ] }),
        viewRecord.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Attended" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetName ?? "Yes" })
        ] }),
        viewRecord.doeComplications && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe Complications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.doeComplications })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      if (!v) {
        closeDialog();
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Kidding Record" : "Add Kidding Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record goat kidding details including ease score, EID tagging, and doe condition." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kidding Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.kiddingDate ?? "").slice(0, 10), onChange: (e) => set("kiddingDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doeLisTag ?? "", onChange: (e) => set("doeLisTag", e.target.value), placeholder: "UK ear tag / LIS number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Outcome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.birthOutcome ?? "live-single", onValueChange: (v) => set("birthOutcome", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live-single", children: "Live — single" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live-twins", children: "Live — twins" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live-triplets", children: "Live — triplets" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mummified", children: "Mummified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "abortion", children: "Abortion" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kid Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: form.kidCount ?? 1, onChange: (e) => set("kidCount", parseInt(e.target.value) || 1) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.kidSex ?? "__none__", onValueChange: (v) => set("kidSex", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "doe", children: "Doe kid (female)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "buck", children: "Buck kid (male)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mixed", children: "Mixed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.kidBirthWeightKg ?? "", onChange: (e) => set("kidBirthWeightKg", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.easeScore ?? ""), onValueChange: (v) => set("easeScore", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Unassisted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Minor assistance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Major assistance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Vet required" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end pb-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "ol-k-assist", checked: !!form.assistanceRequired, onCheckedChange: (v) => set("assistanceRequired", !!v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "ol-k-assist", className: "text-sm cursor-pointer", children: "Assistance required" })
        ] }),
        form.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assistance Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assistanceType ?? "", onChange: (e) => set("assistanceType", e.target.value), placeholder: "e.g. repositioning, lubrication" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "EID / LIS Tagging" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "ol-k-eid", checked: !!form.eidApplied, onCheckedChange: (v) => set("eidApplied", !!v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "ol-k-eid", className: "text-sm cursor-pointer", children: "EID tag applied" }),
          form.eidApplied && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-40", value: String(form.eidAppliedDate ?? "").slice(0, 10), onChange: (e) => set("eidAppliedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "LIS Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.lisTagNumber ?? "", onChange: (e) => set("lisTagNumber", e.target.value), placeholder: "UK8 tag number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Colostrum & Doe Condition" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum Given ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no", onValueChange: (v) => set("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end pb-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "ol-k-vet", checked: !!form.vetAttended, onCheckedChange: (v) => set("vetAttended", !!v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "ol-k-vet", className: "text-sm cursor-pointer", children: "Vet attended" })
        ] }),
        form.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName ?? "", onChange: (e) => set("vetName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doe Complications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doeComplications ?? "", onChange: (e) => set("doeComplications", e.target.value), placeholder: "e.g. retained placenta, hypocalcaemia" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: confirmDelete !== null, onOpenChange: (v) => {
      if (!v) {
        setConfirmDelete(null);
        del.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Kidding Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This will permanently delete the kidding record. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: del, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfirmDelete(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => confirmDelete !== null && del.mutate(confirmDelete), disabled: del.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function parseOrgNotes(raw) {
  if (!raw) return { orgFields: {}, userNotes: "" };
  const m = raw.match(/^__org__(.*?)__\n?([\s\S]*)$/);
  if (!m) return { orgFields: {}, userNotes: raw };
  try {
    return { orgFields: JSON.parse(m[1]), userNotes: m[2] };
  } catch {
    return { orgFields: {}, userNotes: raw };
  }
}
function buildOrgNotes(orgFields, userNotes) {
  const kept = Object.fromEntries(Object.entries(orgFields).filter(([, v]) => v !== "" && v !== false && v !== null && v !== void 0));
  if (!Object.keys(kept).length && !userNotes) return "";
  if (!Object.keys(kept).length) return userNotes;
  return `__org__${JSON.stringify(kept)}__
${userNotes}`;
}
function OrgVetPrescriptionsSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [certNotified, setCertNotified] = reactExports.useState(false);
  const [altJustification, setAltJustification] = reactExports.useState("");
  const [userNotes, setUserNotes] = reactExports.useState("");
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deletePending, setDeletePending] = reactExports.useState(null);
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["vet-prescriptions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-prescriptions`, { credentials: "include" }).then((r) => r.json())
  });
  const allRows = records;
  const years = reactExports.useMemo(() => Array.from(new Set(allRows.map((r) => String(r.prescriptionDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allRows]);
  const rows = yearFilter === "all" ? allRows : allRows.filter((r) => String(r.prescriptionDate ?? "").startsWith(yearFilter));
  const uncertifiedCount = allRows.filter((r) => {
    const { orgFields } = parseOrgNotes(r.notes);
    return !orgFields.certifierNotified;
  }).length;
  function openAdd() {
    setEditing(null);
    setCertNotified(false);
    setAltJustification("");
    setUserNotes("");
    setForm({ signedByVet: true, farmRegistered: true });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    const { orgFields, userNotes: un } = parseOrgNotes(r.notes);
    setCertNotified(Boolean(orgFields.certifierNotified));
    setAltJustification(String(orgFields.alternativesJustification ?? ""));
    setUserNotes(un);
    setForm({ ...r, notes: un });
    setOpen(true);
  }
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? `/api/farms/${farmId}/vet-prescriptions/${editing.id}` : `/api/farms/${farmId}/vet-prescriptions`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] });
      setOpen(false);
      toast({ title: editing ? "Updated" : "Saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/vet-prescriptions/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] });
      setDeletePending(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function handleSave() {
    const combinedNotes = buildOrgNotes({ certifierNotified: certNotified, alternativesJustification: altJustification }, userNotes);
    save.mutate({ ...form, notes: combinedNotes || null });
  }
  function orgW(days) {
    const n = Number(days);
    return isNaN(n) || n === 0 ? "—" : `${n * 2}d (×2)`;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-green-300 bg-green-50 text-sm text-green-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic Prescription Register" }),
      " — Under EC 889/2008 and UK retained equivalents, veterinary medicines may only be used when phytotherapeutic, homeopathic and other alternatives are ineffective or unavailable. You must document why alternatives were ruled out, double all label withdrawal periods before slaughter/milk supply, and notify your certifier of any use of prohibited substances (e.g. antibiotics). Records must be kept for ≥5 years."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Prescription Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Record each vet prescription. Treatment administration is recorded separately in the Medicine module." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        uncertifiedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-2.5 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
          uncertifiedCount,
          " certifier not notified"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-4 text-center", children: "No prescription records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        ["Rx Date", "Product / Active Ingredient", "Indication", "Std W/D Meat", "Org W/D Meat (×2)", "Std W/D Milk", "Org W/D Milk (×2)", "Vet / Practice", "Alternatives Documented", "Certifier Notified"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap text-xs", children: h }, h)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r, i) => {
        const { orgFields } = parseOrgNotes(r.notes);
        const hasCertNotified = Boolean(orgFields.certifierNotified);
        const hasAlt = Boolean(orgFields.alternativesJustification);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap", children: r.prescriptionDate ? new Date(r.prescriptionDate).toLocaleDateString("en-GB") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: String(r.productName ?? "—") }),
            r.activeIngredient != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: String(r.activeIngredient) }),
            Boolean(r.isCascade) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block", children: "Cascade" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 max-w-[180px] text-xs text-muted-foreground", children: r.indicationOrDiagnosis ? String(r.indicationOrDiagnosis).slice(0, 60) + (String(r.indicationOrDiagnosis).length > 60 ? "…" : "") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap text-xs", children: r.withdrawalPeriodMeat ? `${r.withdrawalPeriodMeat}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap text-xs font-semibold text-green-800", children: orgW(r.withdrawalPeriodMeat) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap text-xs", children: r.withdrawalPeriodMilk ? `${r.withdrawalPeriodMilk}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap text-xs font-semibold text-green-800", children: orgW(r.withdrawalPeriodMilk) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-xs", children: String(r.vetName ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: hasAlt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-green-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
            "Yes"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-red-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
            "Missing"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: hasCertNotified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-green-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
            "Yes"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-amber-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
            "No"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDeletePending({ id: r.id, msg: "Delete this prescription record?" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
          ] })
        ] }, i);
      }) })
    ] }) }) }) }),
    viewRecord && (() => {
      const { orgFields, userNotes: un } = parseOrgNotes(viewRecord.notes);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem", maxHeight: "90vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Prescription — ",
          String(viewRecord.productName ?? "")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-lg border border-green-200 bg-green-50 text-xs text-green-900 mb-2 space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Organic W/D — Meat:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: orgW(viewRecord.withdrawalPeriodMeat) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold ml-4", children: "Organic W/D — Milk:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: orgW(viewRecord.withdrawalPeriodMilk) }),
          Boolean(viewRecord.withdrawalPeriodEggs) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold ml-4", children: "Organic W/D — Eggs:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: orgW(viewRecord.withdrawalPeriodEggs) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.prescriptionDate ? new Date(viewRecord.prescriptionDate).toLocaleDateString("en-GB") : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.prescriptionRef || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vetName || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Practice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vetPractice || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.productName || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.activeIngredient || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard W/D — Meat" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.withdrawalPeriodMeat ? `${viewRecord.withdrawalPeriodMeat}d` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard W/D — Milk" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.withdrawalPeriodMilk ? `${viewRecord.withdrawalPeriodMilk}d` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Indication / Diagnosis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium col-span-2", children: String(viewRecord.indicationOrDiagnosis || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cascade / Off-label" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isCascade ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Alternatives Considered (Organic)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(orgFields.alternativesJustification || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-medium ${orgFields.certifierNotified ? "text-green-700" : "text-amber-600"}`, children: orgFields.certifierNotified ? "Yes" : "No" })
          ] }),
          un && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: un })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            openEdit(viewRecord);
            setViewRecord(null);
          }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
        ] })
      ] }) });
    })(),
    deletePending && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setDeletePending(null);
        del.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Prescription Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: deletePending.msg }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: del, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeletePending(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => del.mutate(deletePending.id), disabled: del.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Prescription Record" : "Add Prescription Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record the veterinary prescription. Organic rules: document alternatives first, apply ×2 withdrawal, notify certifier." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-h-[72vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic obligation:" }),
          " Non-conventional medicines are a last resort. You must document why organic/phytotherapeutic alternatives were ineffective or unavailable. Apply ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "double the label withdrawal period" }),
          " before slaughter or milk supply. Notify your certifier if using prohibited substances (e.g. antibiotics in certain categories)."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1", children: "Prescription Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.prescriptionDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescriptionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.prescriptionRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescriptionRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetName ?? ""), onChange: (e) => setForm((f) => ({ ...f, vetName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Practice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetPractice ?? ""), onChange: (e) => setForm((f) => ({ ...f, vetPractice: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet RCVS Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetRcvsNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, vetRcvsNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Valid Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.prescriptionValidUntil ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescriptionValidUntil: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t", children: "Medicine Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.productName ?? ""), onChange: (e) => setForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.activeIngredient ?? ""), onChange: (e) => setForm((f) => ({ ...f, activeIngredient: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Route of Administration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.routeOfAdministration ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, routeOfAdministration: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Oral", "Injection (IM)", "Injection (SC)", "Injection (IV)", "Topical", "Pour-on", "Intramammary", "Intrauterine", "In-water", "In-feed"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.dose ?? ""), onChange: (e) => setForm((f) => ({ ...f, dose: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Authorised" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.quantityAuthorised ?? ""), onChange: (e) => setForm((f) => ({ ...f, quantityAuthorised: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Dispensed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.dispensedQuantity ?? ""), onChange: (e) => setForm((f) => ({ ...f, dispensedQuantity: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t", children: "Withdrawal Periods (enter label values — organic applies ×2 automatically)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label W/D — Meat (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodMeat ?? ""), onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodMeat: e.target.value })) }),
          Number(form.withdrawalPeriodMeat) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-semibold mt-1", children: [
            "Organic W/D: ",
            Number(form.withdrawalPeriodMeat) * 2,
            " days"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label W/D — Milk (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodMilk ?? ""), onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodMilk: e.target.value })) }),
          Number(form.withdrawalPeriodMilk) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-semibold mt-1", children: [
            "Organic W/D: ",
            Number(form.withdrawalPeriodMilk) * 2,
            " days"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label W/D — Eggs (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodEggs ?? ""), onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodEggs: e.target.value })) }),
          Number(form.withdrawalPeriodEggs) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-semibold mt-1", children: [
            "Organic W/D: ",
            Number(form.withdrawalPeriodEggs) * 2,
            " days"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.targetSpecies ?? ""), onChange: (e) => setForm((f) => ({ ...f, targetSpecies: e.target.value })), placeholder: "e.g. Cattle, Sheep" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2 pt-1 border-t", children: [
          [["signedByVet", "Signed by vet?"], ["isCascade", "Cascade / off-label use?"], ["farmRegistered", "Farm registered for prescribing?"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: `rx-${k}`, checked: Boolean(form[k]), onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.checked })), className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `rx-${k}`, children: l })
          ] }, k)),
          Boolean(form.isCascade) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cascade Justification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.cascadeJustification ?? ""), onChange: (e) => setForm((f) => ({ ...f, cascadeJustification: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Indication / Diagnosis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.indicationOrDiagnosis ?? ""), onChange: (e) => setForm((f) => ({ ...f, indicationOrDiagnosis: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t", children: "Organic Compliance Fields" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Alternatives Considered ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "*" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground", children: "(organic requirement: document why conventional alternatives were ruled out)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: altJustification, onChange: (e) => setAltJustification(e.target.value), rows: 3, placeholder: "e.g. Homeopathic nosode trialled for 5 days without improvement. Phytotherapeutic options unavailable from vet. Antibiotic required to prevent animal welfare deterioration." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "rx-certNotified", checked: certNotified, onChange: (e) => setCertNotified(e.target.checked), className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rx-certNotified", children: "Certifier notified of this prescription (required for prohibited substances)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: userNotes, onChange: (e) => setUserNotes(e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 rounded-lg border border-blue-200 bg-blue-50 text-xs text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Recording actual treatments?" }),
          " Once medicine has been administered, record each event — ear tags, date given, who administered — in the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Medicine" }),
          " module. When creating a treatment entry, link it back to this prescription for a full audit trail."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: save.isPending || !altJustification.trim(), children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          "Save Record"
        ] })
      ] })
    ] }) })
  ] });
}
const EMPTY_ORG_DIP = {
  dipDate: "",
  productName: "",
  mappNumber: null,
  activeIngredient: null,
  dipType: "plunge",
  dipConcentrationPct: null,
  volumeOfDipLitres: null,
  sheepCount: null,
  herdFlockRef: null,
  operatorName: "",
  operatorCertNumber: null,
  operatorCertExpiry: null,
  daysSinceLastUse: null,
  disposalMethod: null,
  disposalQuantityLitres: null,
  disposalDate: null,
  disposalContractorName: null,
  disposalWasteTransferNoteRef: null,
  withdrawalPeriodDays: null,
  withdrawalClearDate: null
};
function OrgSheepDippingSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/sheep-dipping-records`;
  const { data, isLoading } = useQuery({
    queryKey: ["sheep-dipping", farmId],
    queryFn: () => fetch(base).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const years = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.dipDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filtered = yearFilter === "all" ? records : records.filter((r) => String(r.dipDate ?? "").startsWith(yearFilter));
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json())
  });
  const sheepHerds = (herdsData?.herds ?? []).filter((h) => h.species === "sheep" || h.species === "goat");
  const { data: certsData } = useQuery({
    queryKey: ["staff-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then((r) => r.ok ? r.json() : { records: [] })
  });
  const allCerts = certsData?.records ?? [];
  const PESTICIDE_TYPES = ["PA1", "PA2", "PA3", "PA4", "PA6", "PA6AW", "Safe use of pesticides"];
  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive !== false);
  const staffNames = activeMembers.map((m) => memberFullName(m));
  function getCert(name) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const certs = allCerts.filter((c) => c.userId === name && PESTICIDE_TYPES.some((t) => c.certificateType.startsWith(t)));
    if (!certs.length) return null;
    const valid = certs.filter((c) => !c.expiryDate || new Date(c.expiryDate) >= today);
    const sorted = (valid.length ? valid : certs).sort((a, b) => (b.expiryDate ?? "").localeCompare(a.expiryDate ?? ""));
    return sorted[0];
  }
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY_ORG_DIP });
  const [organicApproved, setOrganicApproved] = reactExports.useState(false);
  const [alternativesConsidered, setAlternativesConsidered] = reactExports.useState("");
  const [certNotified, setCertNotified] = reactExports.useState(false);
  const [userNotes, setUserNotes] = reactExports.useState("");
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_ORG_DIP });
    setOrganicApproved(false);
    setAlternativesConsidered("");
    setCertNotified(false);
    setUserNotes("");
    setShowForm(true);
  }
  function openEdit(r) {
    setEditing(r);
    const { orgFields, userNotes: un } = parseOrgNotes(r.notes);
    setOrganicApproved(Boolean(orgFields.organicApproved));
    setAlternativesConsidered(String(orgFields.alternativesConsidered ?? ""));
    setCertNotified(Boolean(orgFields.certifierNotified));
    setUserNotes(un);
    setForm({ ...EMPTY_ORG_DIP, ...r });
    setShowForm(true);
  }
  const createMut = useMutation({
    mutationFn: (b) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
      setShowForm(false);
      setForm({ ...EMPTY_ORG_DIP });
      toast({ title: "Dipping record saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (b) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
      setShowForm(false);
      setEditing(null);
      toast({ title: "Updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function handleSave() {
    const combinedNotes = buildOrgNotes({ organicApproved, alternativesConsidered, certifierNotified: certNotified }, userNotes);
    const payload = { ...form, notes: combinedNotes || null };
    if (editing) updateMut.mutate({ ...payload, id: editing.id });
    else createMut.mutate(payload);
  }
  function orgWd(days) {
    const n = Number(days);
    return isNaN(n) || n === 0 ? "—" : `${n * 2}d (×2)`;
  }
  const nonApprovedCount = records.filter((r) => {
    const { orgFields } = parseOrgNotes(r.notes);
    return !orgFields.organicApproved;
  }).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-900 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic Sheep/Goat Dipping" }),
      " — Only organically-approved active ingredients may be used. Synthetic organophosphate (OP) dips (e.g. diazinon) are ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "prohibited" }),
      " for certified organic livestock. Cypermethrin pour-ons require certifier approval. All organic livestock withdrawal periods are ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "doubled" }),
      " from the product label. Record alternatives considered before each treatment event."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Organic Sheep Dipping Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Dipping records under the Control of Pesticides Regulations — organic rules apply. OP dips prohibited." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        nonApprovedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-800 border border-red-300 rounded-full px-2.5 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
          nonApprovedCount,
          " organic approval unconfirmed"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Log Dipping"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 mb-1", children: "No dipping records logged" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Log dipping events to maintain organic compliance records." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Dip Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Sheep" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Operator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Std W/D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-green-800", children: "Org W/D (×2)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Org Approved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filtered.map((r) => {
        const { orgFields } = parseOrgNotes(r.notes);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: fmt(r.dipDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-gray-900 text-xs", children: r.productName }),
            r.mappNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "MAPP: ",
              r.mappNumber
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs capitalize", children: r.dipType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: r.sheepCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r.operatorName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r.withdrawalPeriodDays != null ? `${r.withdrawalPeriodDays}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs font-semibold text-green-800", children: orgWd(r.withdrawalPeriodDays) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: orgFields.organicApproved ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-green-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
            "Yes"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-red-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
            "Unconfirmed"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewItem(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3 text-blue-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    viewItem && (() => {
      const { orgFields, userNotes: un } = parseOrgNotes(viewItem.notes);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            "Organic Dipping — ",
            fmt(viewItem.dipDate)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            viewItem.productName,
            " · ",
            viewItem.sheepCount,
            " sheep"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-green-50 border border-green-200 text-xs text-green-900 font-semibold mb-2", children: [
          "Organic Withdrawal: ",
          orgWd(viewItem.withdrawalPeriodDays),
          "  |  Standard: ",
          viewItem.withdrawalPeriodDays != null ? `${viewItem.withdrawalPeriodDays}d` : "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dip Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewItem.dipDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product (MAPP)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              viewItem.productName,
              viewItem.mappNumber && ` (${viewItem.mappNumber})`
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.activeIngredient ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dip Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewItem.dipType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sheep Count" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.sheepCount })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.operatorName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.disposalMethod ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Waste Transfer Note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono text-xs", children: viewItem.disposalWasteTransferNoteRef ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Product Approved" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-medium ${orgFields.organicApproved ? "text-green-700" : "text-red-600"}`, children: orgFields.organicApproved ? "Yes — confirmed" : "Unconfirmed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Alternatives Considered" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(orgFields.alternativesConsidered || "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-medium ${orgFields.certifierNotified ? "text-green-700" : "text-amber-600"}`, children: orgFields.certifierNotified ? "Yes" : "No" })
          ] }),
          un && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: un })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
            openEdit(viewItem);
            setViewItem(null);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
            "Edit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewItem(null), children: "Close" })
        ] })
      ] }) });
    })(),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Organic Dipping Record" : "Log Organic Sheep Dipping" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Organic rules apply — no synthetic OP dips; doubled withdrawal; certifier notification required for prohibited inputs." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dipping Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dipDate ?? "", onChange: (e) => setF("dipDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName ?? "", onChange: (e) => setF("productName", e.target.value), placeholder: "e.g. Crovect Pour-On" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "MAPP Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.mappNumber ?? "", onChange: (e) => setF("mappNumber", e.target.value || null), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.activeIngredient ?? "", onChange: (e) => setF("activeIngredient", e.target.value || null), placeholder: "e.g. Cypermethrin" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dip Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.dipType, onValueChange: (v) => setF("dipType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "plunge", children: "Plunge Dip" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "shower", children: "Shower / Race Dip" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pour-on", children: "Pour-On" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "spray", children: "Hand Spray" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Concentration (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.dipConcentrationPct ?? "", onChange: (e) => setF("dipConcentrationPct", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume of Dip (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.volumeOfDipLitres ?? "", onChange: (e) => setF("volumeOfDipLitres", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sheep Count *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.sheepCount || "", onChange: (e) => setF("sheepCount", Number(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
          sheepHerds.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdFlockRef ?? "", onValueChange: (v) => setF("herdFlockRef", v || null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select flock…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
              sheepHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: h.herdFlockMark ?? h.name, children: [
                h.name,
                h.herdFlockMark ? ` (${h.herdFlockMark})` : ""
              ] }, h.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockRef ?? "", onChange: (e) => setF("herdFlockRef", e.target.value || null), placeholder: "Flock mark / reference" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StaffSelect,
            {
              value: form.operatorName ?? "",
              onChange: (name) => {
                setF("operatorName", name);
                if (name) {
                  const cert = getCert(name);
                  if (cert) {
                    setF("operatorCertNumber", cert.certificateNumber ?? null);
                    setF("operatorCertExpiry", cert.expiryDate ? cert.expiryDate.split("T")[0] : null);
                  }
                }
              },
              staffNames
            }
          ),
          form.operatorName && (() => {
            const cert = getCert(form.operatorName);
            const today = /* @__PURE__ */ new Date();
            today.setHours(0, 0, 0, 0);
            if (!cert) return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-amber-700 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "No pesticide certificate found — add one in Staff & Certificates."
            ] });
            const expired = cert.expiryDate && new Date(cert.expiryDate) < today;
            return expired ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-red-700 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "Certificate expired ",
              cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString("en-GB") : "",
              " — renewal required."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-green-700 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              cert.certificateType,
              " — cert number auto-filled."
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cert. of Competence No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.operatorCertNumber ?? "", onChange: (e) => setF("operatorCertNumber", e.target.value || null), className: "font-mono", placeholder: "PA6AW / equivalent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cert. Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.operatorCertExpiry ?? "", onChange: (e) => setF("operatorCertExpiry", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Days Since Last Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.daysSinceLastUse ?? "", onChange: (e) => setF("daysSinceLastUse", e.target.value ? Number(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3", children: "Dip Waste Disposal" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.disposalMethod ?? "", onValueChange: (v) => setF("disposalMethod", v || null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "licensed-contractor", children: "Licensed Contractor Collection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved-disposal-site", children: "Approved Disposal Site" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "treatment-plant", children: "Treatment Plant" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Quantity (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.disposalQuantityLitres ?? "", onChange: (e) => setF("disposalQuantityLitres", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.disposalDate ?? "", onChange: (e) => setF("disposalDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Contractor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.disposalContractorName ?? "", onChange: (e) => setF("disposalContractorName", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Transfer Note Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.disposalWasteTransferNoteRef ?? "", onChange: (e) => setF("disposalWasteTransferNoteRef", e.target.value || null), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3", children: "Withdrawal Period (enter label value — organic doubles automatically)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.withdrawalPeriodDays ?? "", onChange: (e) => setF("withdrawalPeriodDays", e.target.value ? Number(e.target.value) : null) }),
          form.withdrawalPeriodDays != null && form.withdrawalPeriodDays > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-semibold mt-1", children: [
            "Organic W/D: ",
            form.withdrawalPeriodDays * 2,
            " days"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Clear Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.withdrawalClearDate ?? "", onChange: (e) => setF("withdrawalClearDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3", children: "Organic Compliance" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "dip-orgApproved", checked: organicApproved, onChange: (e) => setOrganicApproved(e.target.checked), className: "w-4 h-4 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dip-orgApproved", children: "Product is confirmed as approved for use on organic livestock (check with your certifier if unsure — synthetic OP dips are prohibited)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Alternatives Considered ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground", children: "(document why dipping was necessary and what alternatives were assessed)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: alternativesConsidered, onChange: (e) => setAlternativesConsidered(e.target.value), rows: 3, placeholder: "e.g. Blowfly strike risk assessed as high due to weather conditions and wool length. Pour-on flystrike prevention applied first — dipping required as secondary measure." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "dip-certNotified", checked: certNotified, onChange: (e) => setCertNotified(e.target.checked), className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dip-certNotified", children: "Certifier notified of this treatment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: userNotes, onChange: (e) => setUserNotes(e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowForm(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: !form.dipDate || !form.productName || !form.operatorName || !form.sheepCount || createMut.isPending || updateMut.isPending, children: [
          (createMut.isPending || updateMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          editing ? "Update" : "Save Dipping Record"
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Dipping Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "This sheep dipping record will be permanently deleted." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
const ORGANIC_LIVESTOCK_TAB_IDS = [
  "conversion",
  "feed",
  "feed-derogations",
  "outdoor-access",
  "treatments",
  "herds",
  "animals",
  "vet-plans",
  "mortality",
  "contractors",
  "ls-feed",
  "water",
  "sires",
  "straws",
  "ai-repro",
  "vet-rx",
  "tb-tests",
  "welfare-outcomes",
  "sheep-dipping",
  "kidding"
];
function OrganicLivestockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "organic-livestock",
    farmId,
    validIds: ORGANIC_LIVESTOCK_TAB_IDS,
    defaultTab: "conversion",
    urlOverride: new URLSearchParams(window.location.search).get("tab")
  });
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const name = farmData?.name ?? "Farm";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Organic Livestock", children: farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto gap-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "conversion", children: "Conversion" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "feed", children: "Feed Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "feed-derogations", children: "Feed Derogations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "outdoor-access", children: "Outdoor Access / Stocking" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "treatments", children: "Treatment Compliance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "herds", children: "Herds & Flocks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "animals", children: "Animals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "vet-plans", children: "Vet Health Plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mortality", children: "Mortality" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "contractors", children: "Contractors" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ls-feed", children: "Feed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "water", children: "Water" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "sires", children: "Sires" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "straws", children: "Straws" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ai-repro", children: "AI & Repro" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "vet-rx", children: "Vet Rx" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "tb-tests", children: "TB Tests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "welfare-outcomes", children: "Welfare Outcomes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "sheep-dipping", children: "Sheep Dipping" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "kidding", children: "Goat Kidding" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "conversion", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConversionTab, { farmId, farmName: name }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "feed", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedTab, { farmId, farmName: name }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "feed-derogations", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedDerogationTab, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "outdoor-access", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OutdoorAccessTab, { farmId, farmName: name }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "treatments", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreatmentsTab, { farmId, farmName: name }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "herds", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HerdsSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "animals", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimalsSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "vet-plans", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VetHealthPlansSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "mortality", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MortalitySection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "contractors", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FallenStockContractorsSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ls-feed", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "water", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WaterSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sires", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SiresSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "straws", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StrawInventorySection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ai-repro", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AIReproductionSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "vet-rx", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrgVetPrescriptionsSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "tb-tests", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TbTestsSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "welfare-outcomes", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WelfareOutcomeSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sheep-dipping", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrgSheepDippingSection, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "kidding", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KiddingSection, { farmId }) })
  ] }) });
}
export {
  OrganicLivestockPage as default
};
