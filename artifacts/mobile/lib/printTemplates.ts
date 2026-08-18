import type {
  BiofuelDeliveryRecord,
  CleaningRecord,
  Farm,
  HaulageConfirmation,
  LivestockCheck,
  LivestockMovement,
  MedicineRecord,
  NvzApplication,
  PestControlVisit,
  PigWelfareCheck,
  PoultryWelfareCheck,
  SprayRecord,
  ThirdPartyGrainIntakeMobile,
  ThirdPartyGrainOutloadingMobile,
  VisitorLogEntry,
} from "@/lib/types";

const PAGE_STYLE = `
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #1a1a1a; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #1a5c1a; padding-bottom: 10px; margin-bottom: 14px; }
  .logo-block h1 { font-size: 17pt; font-weight: 700; color: #1a5c1a; margin: 0 0 2px 0; }
  .logo-block p { font-size: 9pt; color: #555; margin: 0; }
  .doc-title { text-align: right; }
  .doc-title h2 { font-size: 13pt; font-weight: 700; color: #1a1a1a; margin: 0 0 3px 0; }
  .doc-title p { font-size: 8.5pt; color: #666; margin: 0; }
  .farm-bar { background: #f4f8f4; border: 1px solid #c8ddc8; border-radius: 4px; padding: 7px 10px; margin-bottom: 12px; display: flex; gap: 28px; font-size: 9.5pt; }
  .farm-bar span { color: #444; } .farm-bar strong { color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10pt; }
  th { background: #1a5c1a; color: #fff; padding: 6px 8px; text-align: left; font-size: 9.5pt; }
  td { padding: 5px 8px; border: 1px solid #d4d4d4; vertical-align: top; }
  tr:nth-child(even) td { background: #f8faf8; }
  .label { font-weight: 600; width: 38%; color: #333; }
  .section-heading { font-size: 10pt; font-weight: 700; color: #1a5c1a; background: #eef5ee; border-left: 3px solid #1a5c1a; padding: 4px 8px; margin: 14px 0 6px 0; }
  .sig-row { display: flex; gap: 20px; margin-top: 14px; }
  .sig-box { flex: 1; border: 1px solid #999; border-radius: 3px; padding: 8px; }
  .sig-box .sig-label { font-size: 8.5pt; color: #555; margin-bottom: 28px; }
  .sig-box .sig-line { border-top: 1px solid #333; padding-top: 3px; font-size: 8.5pt; color: #333; }
  .footer { border-top: 1px solid #d0d0d0; margin-top: 18px; padding-top: 6px; font-size: 8pt; color: #888; display: flex; justify-content: space-between; }
  .warning-box { background: #fff8e1; border: 1px solid #f0c040; border-radius: 3px; padding: 7px 10px; font-size: 9pt; color: #6b4e00; margin-bottom: 10px; }
  .pill { display: inline-block; background: #1a5c1a; color: #fff; border-radius: 3px; padding: 1px 7px; font-size: 9pt; font-weight: 600; }
  .pill.off { background: #c0392b; }
  .pill.on { background: #1a5c1a; }
  .pill.between { background: #2471a3; }
`;

function docHeader(farmName: string, docTitle: string, docRef: string, date: string) {
  return `
    <div class="header">
      <div class="logo-block">
        <h1>BDE Farm Trac</h1>
        <p>Red Tractor Compliance Platform</p>
      </div>
      <div class="doc-title">
        <h2>${docTitle}</h2>
        <p>Ref: ${docRef}</p>
        <p>Date: ${date}</p>
      </div>
    </div>
    <div class="farm-bar">
      <span>Farm: <strong>${farmName}</strong></span>
      <span>Printed: <strong>${new Date().toLocaleString("en-GB")}</strong></span>
    </div>`;
}

function docFooter(docTitle: string) {
  return `<div class="footer"><span>${docTitle} — BDE Farm Trac</span><span>Keep this record for a minimum of 5 years</span><span>Printed: ${new Date().toLocaleDateString("en-GB")}</span></div>`;
}

function wrap(body: string, pageStyle?: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PAGE_STYLE}${pageStyle ?? ""}</style></head><body>${body}</body></html>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmt(val: string | undefined | null, fallback = "—") {
  return val && val.trim() ? val.trim() : fallback;
}

/** Like fmt() but HTML-escapes the result — use for user-supplied strings in HTML templates. */
function efmt(val: string | undefined | null, fallback = "—"): string {
  return escHtml(fmt(val, fallback));
}

function fmtDate(iso: string | undefined | null) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return iso; }
}

function fmtDateTime(iso: string | undefined | null) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}

function yesNo(val: boolean) {
  return `<strong style="color:${val ? "#1a5c1a" : "#c0392b"}">${val ? "YES ✓" : "NO ✗"}</strong>`;
}

export function livestockMovementHtml(record: LivestockMovement, farm: Farm | null): string {
  const mvType = record.movementType === "on" ? "on" : record.movementType === "off" ? "off" : "between";
  const mvLabel = mvType === "on" ? "On to Farm" : mvType === "off" ? "Off Farm" : "Between Holdings";
  const ref = fmt(record.movementRef, `MOV-${record.id.slice(-6).toUpperCase()}`);

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Livestock Movement Certificate", ref, fmtDate(record.movementDate))}
    <div class="warning-box">
      ⚠ This document must accompany the animals during transport and be retained by the keeper for 3 years.
      Cattle movements must be reported to BCMS/CTS. Sheep movements must be recorded in the flock register.
    </div>

    <div class="section-heading">Movement Details</div>
    <table>
      <tr><td class="label">Movement Type</td><td><span class="pill ${mvType}">${mvLabel}</span></td></tr>
      <tr><td class="label">Species</td><td>${fmt(record.species)}</td></tr>
      <tr><td class="label">Number of Animals</td><td><strong>${fmt(record.animalCount)}</strong></td></tr>
      <tr><td class="label">Herd / Flock Name</td><td>${fmt(record.herdName)}</td></tr>
      ${record.earTagNumbers ? `<tr><td class="label">Ear Tag / ID Numbers</td><td style="font-family:monospace;white-space:pre-wrap">${fmt(record.earTagNumbers)}</td></tr>` : ""}
      <tr><td class="label">Movement Date</td><td>${fmtDate(record.movementDate)}</td></tr>
      <tr><td class="label">Movement Reference</td><td>${ref}</td></tr>
    </table>

    <div class="section-heading">Locations</div>
    <table>
      <tr><td class="label">From Location / CPH</td><td>${fmt(record.fromLocation)}</td></tr>
      <tr><td class="label">To Location / CPH</td><td>${fmt(record.toLocation)}</td></tr>
    </table>

    <div class="section-heading">Transport Details</div>
    <table>
      <tr><td class="label">Transporter Name</td><td>${fmt(record.transporterName)}</td></tr>
      <tr><td class="label">Vehicle Registration</td><td>${fmt(record.vehicleReg)}</td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Additional Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Keeper / Sender Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Receiver Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Transporter Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Livestock Movement Certificate")}`;

  return wrap(body);
}

export function medicineRecordHtml(record: MedicineRecord, farm: Farm | null): string {
  const ref = `MED-${record.id.slice(-6).toUpperCase()}`;

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Medicine Administration Record", ref, fmtDate(record.administeredDate))}
    <div class="warning-box">
      ⚠ This record must be retained for a minimum of 5 years under the Veterinary Medicines Regulations 2013.
      Observe all withdrawal periods before the animal enters the food chain.
    </div>

    <div class="section-heading">Animal Details</div>
    <table>
      <tr><td class="label">Herd / Flock Name</td><td>${fmt(record.herdName)}</td></tr>
      <tr><td class="label">Animal ID / Tag Number</td><td><strong>${fmt(record.animalId)}</strong></td></tr>
      <tr><td class="label">Reason for Treatment</td><td>${fmt(record.reason)}</td></tr>
    </table>

    <div class="section-heading">Medicine Details</div>
    <table>
      <tr><td class="label">Medicine Name</td><td><strong>${fmt(record.medicineName)}</strong></td></tr>
      <tr><td class="label">Batch Number</td><td>${fmt(record.batchNumber)}</td></tr>
      <tr><td class="label">Dosage</td><td>${fmt(record.dosage)} ${fmt(record.dosageUnit, "")}</td></tr>
      <tr><td class="label">Route of Administration</td><td>${fmt(record.administrationRoute)}</td></tr>
    </table>

    <div class="section-heading">Administration</div>
    <table>
      <tr><td class="label">Date Administered</td><td>${fmtDate(record.administeredDate)}</td></tr>
      <tr><td class="label">Administered By</td><td>${fmt(record.administeredBy)}</td></tr>
      <tr><td class="label">Prescribing Vet</td><td>${fmt(record.vetName)}</td></tr>
    </table>

    <div class="section-heading">Withdrawal Period</div>
    <table>
      <tr><td class="label">Withdrawal Period</td><td><strong>${fmt(record.withdrawalPeriodDays)} days</strong></td></tr>
      <tr><td class="label">Withdrawal End Date</td><td><strong style="color:#c0392b">${fmtDate(record.withdrawalEndDate)}</strong></td></tr>
      <tr><td class="label">Meat / Milk Safe After</td><td>${fmtDate(record.withdrawalEndDate)}</td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Operator Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Farm Manager Verification</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Medicine Administration Record")}`;

  return wrap(body);
}

export function sprayRecordHtml(record: SprayRecord, farm: Farm | null): string {
  const ref = `SPRAY-${record.id.slice(-6).toUpperCase()}`;
  const start = record.startTime ? fmtDateTime(record.startTime) : "—";
  const end = record.endTime ? fmtDateTime(record.endTime) : "—";

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Spray Application Record", ref, fmtDate(record.createdAt))}
    <div class="warning-box">
      ⚠ This record must be retained for a minimum of 3 years. The operator must hold a valid BASIS/FACTS certificate.
      All products must be applied in accordance with the product label and current Red Tractor requirements.
    </div>

    <div class="section-heading">Field &amp; Product</div>
    <table>
      <tr><td class="label">Field Name</td><td><strong>${fmt(record.fieldName)}</strong></td></tr>
      <tr><td class="label">Target Crop</td><td><strong>${fmt(record.targetCrop)}</strong></td></tr>
      ${record.growthStage ? `<tr><td class="label">Growth Stage (BBCH)</td><td>${fmt(record.growthStage)}</td></tr>` : ""}
      <tr><td class="label">Product Name</td><td><strong>${fmt(record.productName)}</strong></td></tr>
      <tr><td class="label">Application Rate</td><td>${fmt(record.applicationRate)} ${fmt(record.applicationUnit, "")}</td></tr>
      <tr><td class="label">Equipment Used</td><td>${fmt(record.equipmentUsed)}</td></tr>
    </table>

    <div class="section-heading">Application</div>
    <table>
      <tr><td class="label">Operator</td><td>${fmt(record.operatorName)}</td></tr>
      <tr><td class="label">Start Time</td><td>${start}</td></tr>
      <tr><td class="label">End Time</td><td>${end}</td></tr>
    </table>

    <div class="section-heading">Weather Conditions at Application</div>
    <table>
      <tr><td class="label">Wind Speed</td><td>${fmt(record.windSpeed)} mph</td></tr>
      <tr><td class="label">Wind Direction</td><td>${fmt(record.windDirection)}</td></tr>
      <tr><td class="label">Temperature</td><td>${fmt(record.temperature)} °C</td></tr>
      <tr><td class="label">Humidity</td><td>${fmt(record.humidity)} %</td></tr>
      <tr><td class="label">Pressure</td><td>${fmt(record.pressure)} hPa</td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Operator Signature &amp; Certificate No.</div>
        <div class="sig-line">Name / Cert No. / Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Farm Manager Verification</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Spray Application Record")}`;

  return wrap(body);
}

export function livestockCheckHtml(record: LivestockCheck, farm: Farm | null): string {
  const ref = `CHK-${record.id.slice(-6).toUpperCase()}`;
  const conditionColour = record.overallCondition === "excellent" || record.overallCondition === "good"
    ? "#1a5c1a" : record.overallCondition === "fair" ? "#b7950b" : "#c0392b";

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Livestock Daily Health Check", ref, fmtDate(record.checkDate))}

    <div class="section-heading">Herd / Flock</div>
    <table>
      <tr><td class="label">Herd / Flock Name</td><td><strong>${fmt(record.herdName)}</strong></td></tr>
      <tr><td class="label">Check Date &amp; Time</td><td>${fmtDateTime(record.checkDate)}</td></tr>
      <tr><td class="label">Checked By</td><td>${fmt(record.checkedBy)}</td></tr>
    </table>

    <div class="section-heading">Health Assessment</div>
    <table>
      <tr><td class="label">Overall Condition</td><td><strong style="color:${conditionColour};text-transform:capitalize">${fmt(record.overallCondition)}</strong></td></tr>
      <tr><td class="label">Sick / Injured Animals</td><td>${record.sickCount || "0"}</td></tr>
      <tr><td class="label">Mortalities</td><td>${record.mortalityCount || "0"}</td></tr>
    </table>

    <div class="section-heading">Welfare Checks</div>
    <table>
      <tr><td class="label">Feed Adequate</td><td>${yesNo(record.feedOk)}</td></tr>
      <tr><td class="label">Water Adequate</td><td>${yesNo(record.waterOk)}</td></tr>
      <tr><td class="label">Shelter / Housing OK</td><td>${yesNo(record.shelterOk)}</td></tr>
    </table>

    ${record.actionTaken ? `<div class="section-heading">Actions Taken</div><table><tr><td>${fmt(record.actionTaken)}</td></tr></table>` : ""}
    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Checker Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Livestock Daily Health Check")}`;

  return wrap(body);
}

export function biofuelDeclarationHtml(record: BiofuelDeliveryRecord, farm: Farm | null): string {
  const ref = fmt(record.sustainabilityDeclarationRef, `RTFO-${record.id.slice(-6).toUpperCase()}`);

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "RTFO Sustainability Declaration", ref, fmtDate(record.deliveryDate))}
    <div class="warning-box">
      ⚠ This declaration must be provided to the biofuel buyer and retained by the farm for audit purposes
      under the Renewable Transport Fuel Obligations (RTFO) Order 2007 (as amended).
    </div>

    <div class="section-heading">Supplier Declaration</div>
    <table>
      <tr><td class="label">Farm Name</td><td><strong>${fmt(farm?.name)}</strong></td></tr>
      <tr><td class="label">Sustainability Scheme</td><td>${fmt(record.sustainabilityScheme)}</td></tr>
      <tr><td class="label">Certification Reference</td><td>${fmt(record.certificationRef)}</td></tr>
      <tr><td class="label">Sustainability Dec. Ref.</td><td>${ref}</td></tr>
    </table>

    <div class="section-heading">Crop / Delivery Details</div>
    <table>
      <tr><td class="label">Crop Type</td><td><strong>${fmt(record.cropType)}</strong></td></tr>
      <tr><td class="label">Quantity (Tonnes)</td><td><strong>${fmt(record.quantityTonnes)} t</strong></td></tr>
      <tr><td class="label">Delivery Date</td><td>${fmtDate(record.deliveryDate)}</td></tr>
      <tr><td class="label">GHG Saving (%)</td><td>${fmt(record.ghgSavingPercent)} %</td></tr>
    </table>

    <div class="section-heading">Buyer Details</div>
    <table>
      <tr><td class="label">Buyer Name</td><td>${fmt(record.buyerName)}</td></tr>
      <tr><td class="label">Buyer RTFO Reference</td><td>${fmt(record.buyerRtfoRef)}</td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <p style="font-size:9pt;color:#333;margin-top:14px">
      I declare that the information provided above is accurate and that the crop described meets the
      sustainability criteria of the stated certification scheme.
    </p>

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Supplier Signature</div>
        <div class="sig-line">Name / Position / Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Company Stamp (if applicable)</div>
        <div class="sig-line">&nbsp;</div>
      </div>
    </div>

    ${docFooter("RTFO Sustainability Declaration")}`;

  return wrap(body);
}

export function visitorLogHtml(record: VisitorLogEntry, farm: Farm | null): string {
  const ref = `VIS-${record.id.slice(-6).toUpperCase()}`;

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Visitor / Contractor Record", ref, fmtDate(record.createdAt))}

    <div class="section-heading">Visitor Details</div>
    <table>
      <tr><td class="label">Visitor Name</td><td><strong>${fmt(record.visitorName)}</strong></td></tr>
      <tr><td class="label">Organisation</td><td>${fmt(record.organisation)}</td></tr>
      <tr><td class="label">Purpose of Visit</td><td>${fmt(record.purpose)}</td></tr>
      <tr><td class="label">Vehicle Registration</td><td>${fmt(record.vehicleReg)}</td></tr>
    </table>

    <div class="section-heading">Access &amp; Biosecurity</div>
    <table>
      <tr><td class="label">Time In</td><td>${fmtDateTime(record.timeIn)}</td></tr>
      <tr><td class="label">Time Out</td><td>${fmtDateTime(record.timeOut)}</td></tr>
      <tr><td class="label">Areas Visited</td><td>${fmt(record.areasVisited)}</td></tr>
      <tr><td class="label">Biosecurity Protocol Followed</td><td>${yesNo(record.biosecurityCompliant)}</td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Visitor Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Farm Authoriser</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Visitor / Contractor Record")}`;

  return wrap(body);
}

export function cleaningRecordHtml(record: CleaningRecord, farm: Farm | null): string {
  const ref = `CLN-${record.id.slice(-6).toUpperCase()}`;

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Cleaning & Disinfection Record", ref, fmtDate(record.cleanedDate))}

    <div class="section-heading">Area &amp; Method</div>
    <table>
      <tr><td class="label">Area Cleaned</td><td><strong>${fmt(record.area)}</strong></td></tr>
      <tr><td class="label">Cleaning Type</td><td>${fmt(record.cleaningType)}</td></tr>
      <tr><td class="label">Date Cleaned</td><td>${fmtDate(record.cleanedDate)}</td></tr>
      <tr><td class="label">Cleaned By</td><td>${fmt(record.cleanedBy)}</td></tr>
    </table>

    <div class="section-heading">Products Used</div>
    <table>
      <tr><td class="label">Product(s)</td><td>${fmt(record.productsUsed)}</td></tr>
      <tr><td class="label">Dilution Rate</td><td>${fmt(record.dilutionRate)}</td></tr>
      <tr><td class="label">Contact Time</td><td>${fmt(record.contactTime)}</td></tr>
    </table>

    <div class="section-heading">Verification</div>
    <table>
      <tr><td class="label">Verified By</td><td>${fmt(record.verifiedBy)}</td></tr>
      <tr><td class="label">Next Due Date</td><td><strong>${fmtDate(record.nextDueDate)}</strong></td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Operator Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Supervisor Verification</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Cleaning & Disinfection Record")}`;

  return wrap(body);
}

export function nvzApplicationHtml(record: NvzApplication, farm: Farm | null): string {
  const ref = `NVZ-${record.id.slice(-6).toUpperCase()}`;

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "NVZ Fertiliser Application Record", ref, fmtDate(record.applicationDate))}
    <div class="warning-box">
      ⚠ Farms in Nitrate Vulnerable Zones must keep records of all nitrogen applications for 5 years.
      Total nitrogen applications must not exceed the permitted amount for the field.
    </div>

    <div class="section-heading">Field &amp; Application</div>
    <table>
      <tr><td class="label">Field Name</td><td><strong>${fmt(record.fieldName)}</strong></td></tr>
      <tr><td class="label">Application Date</td><td>${fmtDate(record.applicationDate)}</td></tr>
      <tr><td class="label">Product Name</td><td>${fmt(record.productName)}</td></tr>
      <tr><td class="label">Product Type</td><td>${fmt(record.productType)}</td></tr>
    </table>

    <div class="section-heading">Quantities</div>
    <table>
      <tr><td class="label">Nitrogen Applied (kg/ha)</td><td><strong>${fmt(record.nitrogenKgHa)} kg/ha</strong></td></tr>
      <tr><td class="label">Area Applied (ha)</td><td>${fmt(record.areaAppliedHa)} ha</td></tr>
      <tr><td class="label">Total Nitrogen (kg)</td>
        <td><strong>${
          record.nitrogenKgHa && record.areaAppliedHa
            ? (parseFloat(record.nitrogenKgHa) * parseFloat(record.areaAppliedHa)).toFixed(1)
            : "—"
        } kg</strong></td></tr>
      <tr><td class="label">Application Method</td><td>${fmt(record.applicationMethod)}</td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Operator Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("NVZ Fertiliser Application Record")}`;

  return wrap(body);
}

export function pestControlHtml(record: PestControlVisit, farm: Farm | null): string {
  const ref = `PEST-${record.id.slice(-6).toUpperCase()}`;

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Pest Control Visit Record", ref, fmtDate(record.visitDate))}

    <div class="section-heading">Visit Details</div>
    <table>
      <tr><td class="label">Location</td><td><strong>${fmt(record.location)}</strong></td></tr>
      <tr><td class="label">Visit Date</td><td>${fmtDate(record.visitDate)}</td></tr>
      <tr><td class="label">Pest Type</td><td>${fmt(record.pestType)}</td></tr>
      <tr><td class="label">Carried Out By</td><td>${fmt(record.carriedOutBy)}</td></tr>
    </table>

    <div class="section-heading">Activity &amp; Action</div>
    <table>
      <tr><td class="label">Activity Observed</td><td>${fmt(record.activityObserved)}</td></tr>
      <tr><td class="label">Action Taken</td><td>${fmt(record.actionTaken)}</td></tr>
      <tr><td class="label">Bait / Product Used</td><td>${fmt(record.baitUsed)}</td></tr>
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Operator Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Pest Control Visit Record")}`;

  return wrap(body);
}

export function poultryWelfareCheckHtml(record: PoultryWelfareCheck, farm: Farm | null): string {
  const ref = `PWT-${record.id.slice(-6).toUpperCase()}`;
  const welfareColour = record.overallWelfare === "pass" ? "#1a5c1a" : record.overallWelfare === "advisory" ? "#b7950b" : "#c0392b";
  const litterColour = record.litterCondition === "good" ? "#1a5c1a" : record.litterCondition === "fair" ? "#b7950b" : "#c0392b";
  const ammoniaColour = record.ammoniaLevel === "none" || record.ammoniaLevel === "low" ? "#1a5c1a" : record.ammoniaLevel === "moderate" ? "#b7950b" : "#c0392b";

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Poultry Daily Welfare Check", ref, fmtDate(record.checkDate))}
    <div class="warning-box" style="background:#fff8e1;border-color:#f9a825;color:#5d4037;">
      &#x26A0; Red Tractor Poultry Standard — daily welfare inspections must be completed and retained for a minimum of 3 years.
    </div>

    <div class="section-heading">House &amp; Flock Details</div>
    <table>
      <tr><td class="label">House / Unit Name</td><td><strong>${fmt(record.houseName)}</strong></td></tr>
      <tr><td class="label">Flock / Batch ID</td><td>${fmt(record.flockId)}</td></tr>
      <tr><td class="label">Check Date &amp; Time</td><td>${fmtDateTime(record.checkDate)}</td></tr>
      <tr><td class="label">Checked By</td><td>${fmt(record.checkedBy)}</td></tr>
    </table>

    <div class="section-heading">Environment</div>
    <table>
      <tr><td class="label">Ambient Temperature</td><td>${record.ambientTempC ? `${record.ambientTempC} °C` : "—"}</td></tr>
      <tr><td class="label">Ventilation / Airflow OK</td><td>${yesNo(record.ventilationOk)}</td></tr>
      <tr><td class="label">Lighting Adequate</td><td>${yesNo(record.lightingOk)}</td></tr>
      <tr><td class="label">Ammonia Level</td><td><strong style="color:${ammoniaColour};text-transform:capitalize">${fmt(record.ammoniaLevel)}</strong></td></tr>
    </table>

    <div class="section-heading">Welfare Observations</div>
    <table>
      <tr><td class="label">Feed Available</td><td>${yesNo(record.feedOk)}</td></tr>
      <tr><td class="label">Fresh Water Available</td><td>${yesNo(record.waterOk)}</td></tr>
      <tr><td class="label">Litter Condition</td><td><strong style="color:${litterColour};text-transform:capitalize">${fmt(record.litterCondition)}</strong></td></tr>
      <tr><td class="label">Bird Behaviour</td><td style="text-transform:capitalize">${fmt(record.birdBehaviour)}</td></tr>
    </table>

    <div class="section-heading">Mortality &amp; Health</div>
    <table>
      <tr><td class="label">Daily Mortalities</td><td>${record.dailyMortalities || "0"}</td></tr>
      <tr><td class="label">Sick / Injured Birds</td><td>${record.sickInjuredCount || "0"}</td></tr>
      <tr><td class="label">Overall Welfare Outcome</td><td><strong style="color:${welfareColour};text-transform:uppercase">${fmt(record.overallWelfare)}</strong></td></tr>
    </table>

    ${record.actionTaken ? `<div class="section-heading">Actions Taken</div><table><tr><td>${fmt(record.actionTaken)}</td></tr></table>` : ""}
    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Stockperson Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Poultry Daily Welfare Check")}`;

  return wrap(body);
}

export function pigWelfareCheckHtml(record: PigWelfareCheck, farm: Farm | null): string {
  const ref = `PIG-${record.id.slice(-6).toUpperCase()}`;
  const welfareColour = record.overallWelfare === "pass" ? "#1a5c1a" : record.overallWelfare === "advisory" ? "#b7950b" : "#c0392b";
  const beddingColour = record.beddingCondition === "clean" ? "#1a5c1a" : record.beddingCondition === "damp" ? "#b7950b" : "#c0392b";

  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Pig Daily Welfare Check", ref, fmtDate(record.checkDate))}
    <div class="warning-box" style="background:#fff8e1;border-color:#f9a825;color:#5d4037;">
      &#x26A0; Red Tractor Pigs Standard — pigs must be inspected at least once per day and all observations recorded.
    </div>

    <div class="section-heading">Group / Pen Details</div>
    <table>
      <tr><td class="label">Group / Pen Name</td><td><strong>${fmt(record.groupName)}</strong></td></tr>
      <tr><td class="label">Pigs in Group</td><td>${record.pigsInGroup || "—"}</td></tr>
      <tr><td class="label">Check Date &amp; Time</td><td>${fmtDateTime(record.checkDate)}</td></tr>
      <tr><td class="label">Checked By</td><td>${fmt(record.checkedBy)}</td></tr>
    </table>

    <div class="section-heading">Behaviour &amp; Environment</div>
    <table>
      <tr><td class="label">Pig Behaviour</td><td style="text-transform:capitalize">${fmt(record.behaviour)}</td></tr>
      <tr><td class="label">Ventilation / Temperature OK</td><td>${yesNo(record.ventilationOk)}</td></tr>
      <tr><td class="label">Feed Adequate</td><td>${yesNo(record.feedOk)}</td></tr>
      <tr><td class="label">Fresh Water Available</td><td>${yesNo(record.waterOk)}</td></tr>
      <tr><td class="label">Bedding / Floor Condition</td><td><strong style="color:${beddingColour};text-transform:capitalize">${fmt(record.beddingCondition)}</strong></td></tr>
    </table>

    <div class="section-heading">Welfare Concerns</div>
    <table>
      <tr><td class="label">Tail Biting Observed</td><td>${yesNo(record.tailBitingObserved)}</td></tr>
      <tr><td class="label">Fighting / Aggression</td><td>${yesNo(record.aggression)}</td></tr>
      <tr><td class="label">Sick / Injured Pigs</td><td>${record.sickInjuredCount || "0"}</td></tr>
      <tr><td class="label">Mortalities</td><td>${record.mortalityCount || "0"}</td></tr>
      <tr><td class="label">Overall Welfare Outcome</td><td><strong style="color:${welfareColour};text-transform:uppercase">${fmt(record.overallWelfare)}</strong></td></tr>
    </table>

    ${record.actionTaken ? `<div class="section-heading">Actions Taken</div><table><tr><td>${fmt(record.actionTaken)}</td></tr></table>` : ""}
    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Stockperson Signature</div>
        <div class="sig-line">Name &amp; Date:</div>
      </div>
    </div>

    ${docFooter("Pig Daily Welfare Check")}`;

  return wrap(body);
}

export function cropDispatchDocketHtml(record: HaulageConfirmation, farm: Farm | null): string {
  const ref = `DOCKET-${record.id.slice(-8).toUpperCase()}`;
  const body = `
    ${docHeader(fmt(farm?.name, "Unknown Farm"), "Crop Dispatch Docket", ref, fmtDateTime(record.confirmationDate))}

    <div class="warning-box">
      ⚠ This docket must travel with the load and be retained by the driver. A copy must be kept on farm for a minimum of 5 years.
    </div>

    <div class="section-heading">Origin — Dispatching Holding</div>
    <table>
      <tr><td class="label">Farm Name</td><td><strong>${fmt(farm?.name)}</strong></td></tr>
      <tr><td class="label">Dispatch Date / Time</td><td><strong>${fmtDateTime(record.confirmationDate)}</strong></td></tr>
      ${record.storageLocationName ? `<tr><td class="label">Store / Bin</td><td>${fmt(record.storageLocationName)}</td></tr>` : ""}
    </table>

    <div class="section-heading">Commodity</div>
    <table>
      <tr><td class="label">Crop / Commodity</td><td><strong>${fmt(record.cropType)}</strong></td></tr>
      <tr><td class="label">Quantity Dispatched</td><td><strong>${fmt(record.quantityTonnes)} tonnes</strong></td></tr>
    </table>

    <div class="section-heading">Destination</div>
    <table>
      <tr><td class="label">Buyer / Customer</td><td><strong>${fmt(record.customerName)}</strong></td></tr>
      ${record.customerRef ? `<tr><td class="label">Customer Reference</td><td>${fmt(record.customerRef)}</td></tr>` : ""}
      <tr><td class="label">Destination</td><td>${fmt(record.destination)}</td></tr>
    </table>

    <div class="section-heading">Transport</div>
    <table>
      <tr><td class="label">Haulier</td><td><strong>${fmt(record.haulierName)}</strong></td></tr>
      <tr><td class="label">Vehicle Registration</td><td><strong>${fmt(record.vehicleReg)}</strong></td></tr>
      <tr><td class="label">Driver Name</td><td>${fmt(record.driverName)}</td></tr>
    </table>

    ${record.dispatchNotes ? `<div class="section-heading">Notes / Discrepancies</div><table><tr><td>${fmt(record.dispatchNotes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Confirmed by (Farm): <strong>${fmt(record.confirmedBy)}</strong></div>
        <div class="sig-line">Signature &amp; Date:</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Driver signature (received)</div>
        <div class="sig-line">Signature &amp; Date:</div>
      </div>
    </div>

    <p style="margin-top:10px;font-size:9pt;color:#555">
      Docket Ref: ${ref} &nbsp;|&nbsp; Generated by BDE Farm Trac &nbsp;|&nbsp; Keep original on farm, copy travels with load
    </p>

    ${docFooter("Crop Dispatch Docket")}`;

  return wrap(body);
}

export function grainIntakeDocketHtml(record: ThirdPartyGrainIntakeMobile, farmName: string): string {
  const ref = record.lotReference || `INT-${record.id.slice(-8).toUpperCase()}`;
  const sigHtml = record.customerSignature
    ? `<img src="${record.customerSignature}" style="max-width:260px;max-height:80px;display:block;margin-top:4px;" />`
    : `<div style="height:60px;border-bottom:1px solid #333;margin-top:4px;"></div>`;

  const body = `
    ${docHeader(farmName, "Third-Party Grain Intake Docket", ref, fmtDate(record.intakeDate))}

    <div class="warning-box">
      ⚠ This docket confirms receipt of third-party grain into store. Both parties should retain a copy. Keep records for a minimum of 5 years for Red Tractor traceability.
    </div>

    <div class="section-heading">Customer / Depositor</div>
    <table>
      <tr><td class="label">Customer / Farm Name</td><td><strong>${fmt(record.customerName)}</strong></td></tr>
      <tr><td class="label">Lot / Batch Reference</td><td><strong>${fmt(ref)}</strong></td></tr>
      <tr><td class="label">Delivery Note Ref</td><td>${fmt(record.deliveryNoteRef)}</td></tr>
      <tr><td class="label">Intake Date</td><td>${fmtDate(record.intakeDate)}</td></tr>
    </table>

    <div class="section-heading">Commodity</div>
    <table>
      <tr><td class="label">Commodity</td><td><strong>${fmt(record.commodity)}</strong></td></tr>
      ${record.variety ? `<tr><td class="label">Variety</td><td>${fmt(record.variety)}</td></tr>` : ""}
      ${record.grade ? `<tr><td class="label">Grade</td><td>${fmt(record.grade)}</td></tr>` : ""}
      <tr><td class="label">Quantity Received</td><td><strong>${fmt(record.quantityTonnes)} tonnes</strong></td></tr>
    </table>

    <div class="section-heading">Quality at Intake</div>
    <table>
      ${record.moisturePercent ? `<tr><td class="label">Moisture (%)</td><td>${fmt(record.moisturePercent)}%</td></tr>` : ""}
      ${record.screeningsPercent ? `<tr><td class="label">Screenings (%)</td><td>${fmt(record.screeningsPercent)}%</td></tr>` : ""}
      ${record.specificWeightKgHl ? `<tr><td class="label">Specific Weight (kg/hl)</td><td>${fmt(record.specificWeightKgHl)}</td></tr>` : ""}
    </table>

    <div class="section-heading">Storage</div>
    <table>
      <tr><td class="label">Holding / Store</td><td><strong>${farmName}</strong></td></tr>
      ${record.bayOrBin ? `<tr><td class="label">Bay / Bin Allocated</td><td>${fmt(record.bayOrBin)}</td></tr>` : ""}
    </table>

    <div class="section-heading">Transport</div>
    <table>
      <tr><td class="label">Transport Arranged By</td><td>${record.transportArrangedBy === "customer" ? "Customer's own lorry" : "Holding booked haulier"}</td></tr>
      ${record.vehicleReg ? `<tr><td class="label">Vehicle Registration</td><td><strong>${fmt(record.vehicleReg)}</strong></td></tr>` : ""}
      ${record.haulier ? `<tr><td class="label">Haulier</td><td>${fmt(record.haulier)}</td></tr>` : ""}
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Received by (Store): <strong>${fmt(record.recordedBy)}</strong></div>
        <div class="sig-line">Signature &amp; Date: ___________________</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Customer / Driver signature (confirming delivery)</div>
        ${sigHtml}
      </div>
    </div>

    <p style="margin-top:10px;font-size:9pt;color:#555">
      Lot Ref: ${ref} &nbsp;|&nbsp; Generated by BDE Farm Trac &nbsp;|&nbsp; Keep original on farm, copy to customer
    </p>

    ${docFooter("Third-Party Grain Intake Docket")}`;

  return wrap(body);
}

export interface VineSprayDiaryRow {
  id: number;
  applicationDate: string | null;
  blockName: string | null;
  productName: string | null;
  mappNumber: string | null;
  activeIngredient: string | null;
  productType: string | null;
  ratePerHectare: number | null;
  rateUnit: string | null;
  areaTreatedHa: number | null;
  harvestIntervalDays: number | null;
  windSpeedMph: number | null;
  temperatureCelsius: number | null;
  weatherConditions: string | null;
  operatorName: string | null;
  operatorCertificateNo: string | null;
  notes: string | null;
}

export function vineSprayDiaryHtml(
  records: VineSprayDiaryRow[],
  farmName: string | null,
  farmAddress: string | null,
  farmPostcode: string | null,
  searchQuery?: string,
  dateFrom?: string,
  dateTo?: string,
): string {
  const safeDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  // Escape all user-supplied strings before inserting into HTML
  const eFarmName = efmt(farmName);
  const eAddress = farmAddress && farmAddress.trim() ? escHtml(farmAddress.trim()) : "";
  const ePostcode = farmPostcode && farmPostcode.trim() ? escHtml(farmPostcode.trim()) : "";
  const addressParts = [eAddress, ePostcode].filter(Boolean).join(", ");
  const eSearch = searchQuery && searchQuery.trim() ? escHtml(searchQuery.trim()) : "";

  // Format date range for display
  const fmtDateRange = (d: string) => {
    const parts = d.split("-");
    if (parts.length !== 3) return escHtml(d);
    const [y, m, day] = parts;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const mIdx = parseInt(m, 10) - 1;
    return `${day} ${months[mIdx] ?? m} ${y}`;
  };
  const hasDateRange = (dateFrom && dateFrom.trim()) || (dateTo && dateTo.trim());
  const dateRangeParts: string[] = [];
  if (dateFrom && dateFrom.trim()) dateRangeParts.push(`From: <strong>${fmtDateRange(dateFrom.trim())}</strong>`);
  if (dateTo && dateTo.trim()) dateRangeParts.push(`To: <strong>${fmtDateRange(dateTo.trim())}</strong>`);
  const dateRangeStr = dateRangeParts.join(" &nbsp;&middot;&nbsp; ");

  const header = `
    <div class="header">
      <div class="logo-block">
        <h1>BDE Farm Trac</h1>
        <p>Vineyard Compliance Platform</p>
      </div>
      <div class="doc-title">
        <h2>Vine Spray Diary</h2>
        <p>Date: ${safeDate}</p>
        <p>${records.length} record${records.length === 1 ? "" : "s"}${eSearch ? ` &middot; Filter: &ldquo;${eSearch}&rdquo;` : ""}</p>
      </div>
    </div>
    <div class="farm-bar" style="flex-direction:column;gap:4px;">
      <div style="display:flex;gap:28px;">
        <span>Farm: <strong>${eFarmName}</strong></span>
        <span>Printed: <strong>${new Date().toLocaleString("en-GB")}</strong></span>
      </div>
      ${addressParts ? `<div><span>Address: <strong>${addressParts}</strong></span></div>` : ""}
      ${hasDateRange ? `<div style="margin-top:2px;"><span style="color:#1e3a5f;">&#128197; Date range: ${dateRangeStr}</span></div>` : ""}
    </div>`;

  // Build a clear, accurate list of which fields are missing
  const missingFields: string[] = [];
  if (!farmName || !farmName.trim()) missingFields.push("Farm name");
  if (!farmAddress || !farmAddress.trim()) missingFields.push("Farm address");
  const missingWarning = missingFields.length > 0
    ? `<div class="warning-box">⚠ ${missingFields.join(" and ")} not set — update Farm Settings to populate the header.</div>`
    : "";

  const todayMs = new Date().setHours(0, 0, 0, 0);
  const tableRows = records.map((r) => {
    // Numeric fields are formatted as numbers — safe to interpolate directly
    const rate = r.ratePerHectare != null
      ? `${r.ratePerHectare} ${efmt(r.rateUnit, "")}`.trim()
      : "—";
    const weatherParts: string[] = [];
    if (r.windSpeedMph != null) weatherParts.push(`${r.windSpeedMph} mph`);
    if (r.temperatureCelsius != null) weatherParts.push(`${r.temperatureCelsius} \u00b0C`);
    if (r.weatherConditions) weatherParts.push(escHtml(r.weatherConditions));
    const weather = weatherParts.length > 0 ? weatherParts.join(" &middot; ") : "—";

    // Harvest-interval expiry check
    const hiDays = r.harvestIntervalDays != null ? Number(r.harvestIntervalDays) : null;
    let hiActive = false;
    let hiCell = "—";
    if (hiDays != null && !isNaN(hiDays) && r.applicationDate) {
      const appMs = new Date(r.applicationDate).setHours(0, 0, 0, 0);
      const expiryMs = appMs + hiDays * 86400000;
      hiActive = expiryMs > todayMs;
      const expiryStr = new Date(expiryMs).toLocaleDateString("en-GB");
      hiCell = hiActive
        ? `<span style="font-weight:700;color:#92400e">${hiDays}d ⚠<br><span style="font-size:7.5pt;font-weight:400">Expires ${expiryStr}</span></span>`
        : `${hiDays}d<br><span style="font-size:7.5pt;color:#555">Expired ${expiryStr}</span>`;
    }
    // Apply amber background to td directly so it overrides the zebra-stripe td selector
    const cellBg = hiActive ? "background:#fffbeb;" : "";

    return `
      <tr>
        <td style="${cellBg}">${fmtDate(r.applicationDate)}</td>
        <td style="${cellBg}"><strong>${efmt(r.productName)}</strong>${r.productType ? `<br><span style="color:#555;font-size:8.5pt">${efmt(r.productType)}</span>` : ""}</td>
        <td style="${cellBg}">${efmt(r.mappNumber)}</td>
        <td style="${cellBg}">${efmt(r.activeIngredient)}</td>
        <td style="${cellBg}">${rate}</td>
        <td style="${cellBg}">${r.areaTreatedHa != null ? `${Number(r.areaTreatedHa).toFixed(2)} ha` : "—"}</td>
        <td style="${cellBg}">${efmt(r.blockName)}</td>
        <td style="font-size:8.5pt;${cellBg}">${weather}</td>
        <td style="${cellBg}">${efmt(r.operatorName)}${r.operatorCertificateNo ? `<br><span style="color:#555;font-size:8pt">${efmt(r.operatorCertificateNo)}</span>` : ""}</td>
        <td style="text-align:center;font-size:8.5pt;${cellBg}">${hiCell}</td>
      </tr>`;
  }).join("");

  const tableEmpty = `<tr><td colspan="10" style="text-align:center;color:#888;padding:16px 8px;">No spray diary records match the current filter.</td></tr>`;

  const extraCss = `
    table { font-size: 8.5pt; }
    th { font-size: 8pt; }
    td { padding: 4px 6px; }
  `;

  const body = `
    ${header}
    ${missingWarning}
    <div class="warning-box" style="background:#f0f9ff;border-color:#7dd3fc;color:#075985;">
      &#8505; This spray diary must be retained for a minimum of 3 years. All pesticide applications must comply
      with product label instructions and current certification requirements.
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Product</th>
          <th>MAPP No.</th>
          <th>Active Ingredient</th>
          <th>Rate</th>
          <th>Area</th>
          <th>Block</th>
          <th>Weather</th>
          <th>Operator</th>
          <th style="text-align:center">HI (days)</th>
        </tr>
      </thead>
      <tbody>
        ${records.length > 0 ? tableRows : tableEmpty}
      </tbody>
    </table>
    ${records.some(r => r.notes) ? `
      <div class="section-heading">Notes</div>
      <table>
        ${records.filter(r => r.notes).map(r => `
          <tr>
            <td class="label" style="width:22%">${fmtDate(r.applicationDate)} &mdash; ${efmt(r.productName)}</td>
            <td>${efmt(r.notes)}</td>
          </tr>`).join("")}
      </table>` : ""}
    ${docFooter("Vine Spray Diary")}`;

  return wrap(body, extraCss);
}

export function grainOutloadingDocketHtml(record: ThirdPartyGrainOutloadingMobile, farmName: string): string {
  const lotLabel = record.intakeLotRef || (record.intakeId ? `Intake #${record.intakeId}` : "—");
  const ref = `OUT-${record.id.slice(-8).toUpperCase()}`;
  const movementLabels: Record<string, string> = {
    outloading: "Outloading to Customer / Merchant",
    sample: "Sample Removal",
    return: "Return to Customer",
    transfer: "Internal Transfer",
  };

  const body = `
    ${docHeader(farmName, "Grain Outloading Docket", ref, fmtDate(record.movementDate))}

    <div class="warning-box">
      ⚠ This docket confirms grain movement from store. Both parties should retain a copy. Keep records for a minimum of 5 years for Red Tractor traceability.
    </div>

    <div class="section-heading">Lot / Customer Details</div>
    <table>
      <tr><td class="label">Customer / Farm Name</td><td><strong>${fmt(record.intakeCustomerName)}</strong></td></tr>
      <tr><td class="label">Lot / Batch Reference</td><td><strong>${fmt(lotLabel)}</strong></td></tr>
      <tr><td class="label">Movement Type</td><td><strong>${movementLabels[record.movementType] ?? record.movementType}</strong></td></tr>
      <tr><td class="label">Movement Date</td><td>${fmtDate(record.movementDate)}</td></tr>
    </table>

    <div class="section-heading">Quantity Moved</div>
    <table>
      <tr><td class="label">Quantity</td><td><strong>${fmt(record.quantityTonnes)} tonnes</strong></td></tr>
      ${record.destination ? `<tr><td class="label">Destination</td><td>${fmt(record.destination)}</td></tr>` : ""}
      ${record.deliveryNoteRef ? `<tr><td class="label">Delivery / Uplift Note Ref</td><td>${fmt(record.deliveryNoteRef)}</td></tr>` : ""}
    </table>

    <div class="section-heading">Transport</div>
    <table>
      <tr><td class="label">Transport Arranged By</td><td>${record.transportArrangedBy === "customer" ? "Customer's own lorry" : "Holding booked haulier"}</td></tr>
      ${record.vehicleReg ? `<tr><td class="label">Vehicle Registration</td><td><strong>${fmt(record.vehicleReg)}</strong></td></tr>` : ""}
      ${record.haulier ? `<tr><td class="label">Haulier</td><td>${fmt(record.haulier)}</td></tr>` : ""}
    </table>

    ${record.notes ? `<div class="section-heading">Notes</div><table><tr><td>${fmt(record.notes)}</td></tr></table>` : ""}

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-label">Released by (Store): <strong>${fmt(record.recordedBy)}</strong></div>
        <div class="sig-line">Signature &amp; Date: ___________________</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Driver / Customer signature (load received)</div>
        <div style="height:60px;border-bottom:1px solid #333;margin-top:4px;"></div>
      </div>
    </div>

    <p style="margin-top:10px;font-size:9pt;color:#555">
      Docket Ref: ${ref} &nbsp;|&nbsp; Generated by BDE Farm Trac &nbsp;|&nbsp; Keep original on farm, copy travels with load
    </p>

    ${docFooter("Grain Outloading Docket")}`;

  return wrap(body);
}
