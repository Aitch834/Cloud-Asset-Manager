// ─── Dispatch Note — HTML generator ────────────────────────────────────────
// Generates an HTML string that the client opens in a new window and prints.
// Matches the print-report pattern used across the rest of the platform.

function val(v: string | number | null | undefined): string {
  if (v == null || v === "") return "—";
  return String(v);
}

function fmt(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtWeight(t: string | number | null | undefined): string {
  if (t == null || t === "") return "—";
  return `${parseFloat(String(t)).toFixed(3)} t`;
}

function docTitle(loadType: string, commodity?: string | null): string {
  const lt = (loadType || "").toLowerCase();
  const cm = (commodity || "").toLowerCase();
  if (
    lt.includes("livestock") || lt.includes("cattle") || lt.includes("sheep") ||
    lt.includes("pig") || lt.includes("poultry") || lt.includes("beef") || lt.includes("lamb") ||
    cm.includes("cattle") || cm.includes("beef") || cm.includes("sheep") ||
    cm.includes("lamb") || cm.includes("pig") || cm.includes("livestock")
  ) return "Livestock Dispatch Note";
  if (
    lt.includes("grain") || lt.includes("cereal") || lt.includes("oilseed") ||
    lt.includes("straw") || lt.includes("pulse") ||
    cm.includes("wheat") || cm.includes("barley") || cm.includes("osr") ||
    cm.includes("oat") || cm.includes("rape") || cm.includes("bean") || cm.includes("pea")
  ) return "Grain Dispatch Note";
  return "Dispatch Note";
}

export interface DispatchNoteData {
  farmName: string;
  farmAddress?: string | null;
  farmPostcode?: string | null;
  cphNumber?: string | null;
  sbiNumber?: string | null;
  redTractorId?: string | null;
  farmManager?: string | null;
  dispatchRef: string;
  departureDate?: string | Date | null;
  arrivalDate?: string | Date | null;
  loadType: string;
  commodity?: string | null;
  variety?: string | null;
  grade?: string | null;
  cropYear?: string | null;
  storageLocation?: string | null;
  weighbridgeTicketNo?: string | null;
  weightTonnes?: string | number | null;
  moisturePercent?: string | number | null;
  specificWeightKgHl?: string | number | null;
  destination?: string | null;
  buyerName?: string | null;
  customerRef?: string | null;
  waybillNumber?: string | null;
  vehicleRegistration?: string | null;
  driverName?: string | null;
  haulierCompany?: string | null;
  binName?: string | null;
  postHarvestTreatments?: string | null;
  confirmedAt?: string | Date | null;
  confirmedBy?: string | null;
  weighbridgeWeightTonnes?: string | number | null;
}

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#1a1a1a;background:#fff}
  .hdr{background:#1a6b3a;color:#fff;padding:12px 20px;display:flex;justify-content:space-between;align-items:flex-start}
  .hdr-left h1{font-size:18px;font-weight:700;margin-bottom:2px}
  .hdr-left p{font-size:9.5px;color:#a7d9b8}
  .hdr-right{text-align:right}
  .hdr-right h2{font-size:15px;font-weight:700;margin-bottom:2px}
  .hdr-right p{font-size:9.5px;color:#c8ecd5}
  .farm-bar{padding:8px 20px 6px;border-bottom:1px solid #d1d5db;display:flex;gap:16px;align-items:flex-start}
  .farm-name{font-size:13px;font-weight:700;flex:1}
  .farm-addr{font-size:10px;color:#6b7280;margin-top:1px}
  .farm-ids{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px 12px;min-width:420px}
  .kv{padding:2px 0}
  .kv label{display:block;font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1px}
  .kv span{font-size:11px;color:#1a1a1a}
  .kv span.empty{color:#d1d5db}
  section{padding:0 20px}
  .sec-hdr{background:#e8f5ee;padding:4px 8px;margin:0 -20px;font-size:9px;font-weight:700;color:#1a6b3a;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;margin-top:0}
  .sec-hdr.amber{background:#fef3c7;color:#92400e}
  .sec-hdr.confirmed{background:#dcfce7;color:#1a6b3a}
  .row4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px 12px;margin-bottom:6px}
  .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px;margin-bottom:6px}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;margin-bottom:6px}
  .panels{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 20px;margin-bottom:4px}
  .panel{border:1px solid #e5e7eb;border-radius:3px;overflow:hidden}
  .panel-hdr{background:#e8f5ee;padding:4px 8px;font-size:9px;font-weight:700;color:#1a6b3a;letter-spacing:0.5px;text-transform:uppercase}
  .panel-body{padding:6px 8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 8px}
  .panel-body.dest{grid-template-columns:1fr 1fr}
  .divider{height:1px;background:#d1d5db;margin:6px 20px}
  .checkbox-row{display:flex;gap:24px;margin-bottom:6px;align-items:flex-start}
  .checkbox-col{display:flex;flex-direction:column;gap:5px}
  .cb{display:flex;align-items:flex-start;gap:5px;font-size:10.5px;color:#1a1a1a}
  .cb-box{width:11px;height:11px;min-width:11px;border:1px solid #6b7280;display:inline-block;margin-top:1px}
  .write-line{border-bottom:1px solid #d1d5db;height:18px;margin-bottom:4px}
  .sig-box{border:1px solid #d1d5db;height:44px;padding:6px 8px;display:flex;flex-direction:column;justify-content:space-between}
  .sig-box p{font-size:9px;color:#6b7280}
  .receipt-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px;margin-bottom:8px}
  .footer-bar{background:#f9fafb;padding:5px 20px;font-size:8px;color:#6b7280;border-top:1px solid #e5e7eb;margin-top:6px}
  .section-wrap{padding:6px 20px 4px}
  @media print{
    @page{size:A4 landscape;margin:0.8cm}
    body{font-size:10px}
  }
`;

export function generateDispatchNoteHtml(data: DispatchNoteData): string {
  const title = docTitle(data.loadType, data.commodity);
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const farmAddr = [data.farmAddress, data.farmPostcode].filter(Boolean).join("  ·  ");

  const kv = (label: string, value: string | number | null | undefined) => {
    const v = val(value);
    return `<div class="kv"><label>${label}</label><span class="${v === "—" ? "empty" : ""}">${v}</span></div>`;
  };

  const confirmedSection = data.confirmedAt ? `
    <div class="section-wrap">
      <div class="sec-hdr confirmed">Delivery Confirmed</div>
      <div class="row4">
        ${kv("Confirmed Date", fmt(data.confirmedAt))}
        ${kv("Confirmed By", data.confirmedBy)}
        ${kv("Weighbridge Weight", fmtWeight(data.weighbridgeWeightTonnes))}
        <div></div>
      </div>
    </div>
    <div class="divider"></div>` : "";

  const isLivestock = docTitle(data.loadType, data.commodity) === "Livestock Dispatch Note";

  const treatmentContent = data.postHarvestTreatments
    ? `<p style="font-size:10.5px;color:#1a1a1a;margin-bottom:4px">${data.postHarvestTreatments}</p>`
    : `<div class="checkbox-row">
        <div class="cb"><span class="cb-box"></span><span>No post-harvest treatments have been applied to this lot.</span></div>
        <div class="cb"><span class="cb-box"></span><span>Treatments were applied — details below / attached:</span></div>
      </div>
      <div class="write-line"></div>`;

  const livestockDeclarations = `
    <div class="cb"><span class="cb-box"></span><span>Food Chain Information (FCI) / Vendor Declaration has been completed and issued with this consignment.</span></div>
    <div class="cb"><span class="cb-box"></span><span>All animals are fit to travel and show no signs of injury, illness, or distress at time of loading.</span></div>
    <div class="cb"><span class="cb-box"></span><span>Estimated journey time is within legal welfare limits — feed, water and rest provisions are in place if journey exceeds 8 hours.</span></div>
    <div class="cb"><span class="cb-box"></span><span>No TB movement restriction, FMD restriction, or other disease / standstill notice is in force on this holding at time of dispatch.</span></div>
    <div class="cb"><span class="cb-box"></span><span>Movement has been notified to BCMS / eAML2 or the relevant devolved nation portal prior to or at time of departure.</span></div>
    <div class="cb"><span class="cb-box"></span><span>Number of animals loaded matches the accompanying movement document, ear tag records, and herd / flock register.</span></div>
    <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">
      <div class="kv"><label>BCMS / Portal Submission Ref.</label><span class="empty">________________________________</span></div>
      <div class="kv"><label>FCI / Vendor Declaration Ref.</label><span class="empty">________________________________</span></div>
    </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} — ${data.dispatchRef} — ${data.farmName}</title>
  <style>${CSS}</style>
</head>
<body>

  <div class="hdr">
    <div class="hdr-left">
      <h1>BDE Farm Trac</h1>
      <p>Red Tractor Compliance Platform</p>
    </div>
    <div class="hdr-right">
      <h2>${title.toUpperCase()}</h2>
      <p>Ref: ${data.dispatchRef}</p>
    </div>
  </div>

  <div class="farm-bar">
    <div style="flex:1">
      <div class="farm-name">${data.farmName}</div>
      ${farmAddr ? `<div class="farm-addr">${farmAddr}</div>` : ""}
    </div>
    <div class="farm-ids">
      ${kv("CPH Number", data.cphNumber)}
      ${kv("SBI Number", data.sbiNumber)}
      ${kv("Red Tractor No.", data.redTractorId)}
      ${kv("Farm Manager", data.farmManager)}
    </div>
  </div>

  <div class="divider"></div>

  <div class="section-wrap">
    <div class="sec-hdr">Dispatch Details</div>
    <div class="row4">
      ${kv("Date of Dispatch", fmt(data.departureDate))}
      ${kv("Expected Arrival", fmt(data.arrivalDate))}
      ${kv("Waybill / Consignment No.", data.waybillNumber)}
      ${kv("Weighbridge Ticket No.", data.weighbridgeTicketNo)}
    </div>
    ${isLivestock ? `
    <div class="row4">
      ${kv("Species / Type", data.commodity || data.loadType)}
      ${kv("Breed / Category", data.variety)}
      ${kv("Class / Grade", data.grade)}
      ${kv("Number of Animals", data.cropYear)}
    </div>
    <div class="row4">
      ${kv("Estimated Live Weight", fmtWeight(data.weightTonnes))}
      ${kv("Holding of Origin (CPH)", data.cphNumber)}
      ${kv("Destination CPH / Abattoir", data.destination)}
      ${kv("Movement Doc. Type", data.storageLocation)}
    </div>` : `
    <div class="row4">
      ${kv("Commodity / Load", data.commodity || data.loadType)}
      ${kv("Variety", data.variety)}
      ${kv("Grade", data.grade)}
      ${kv("Crop Year / Batch", data.cropYear)}
    </div>
    <div class="row4">
      ${kv("Estimated Net Weight", fmtWeight(data.weightTonnes))}
      ${kv("Moisture %", data.moisturePercent != null ? `${data.moisturePercent}%` : null)}
      ${kv("Specific Weight (kg/hl)", data.specificWeightKgHl != null ? String(data.specificWeightKgHl) : null)}
      ${kv("Source Store / Bin", data.binName || data.storageLocation)}
    </div>`}
  </div>

  <div class="divider"></div>

  <div class="panels">
    <div class="panel">
      <div class="panel-hdr">Destination</div>
      <div class="panel-body dest">
        ${kv("Buyer / Merchant", data.buyerName || data.destination)}
        ${kv("Destination Address", data.destination)}
        ${kv("Customer / Contract Reference", data.customerRef)}
        <div></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-hdr">Haulier &amp; Vehicle</div>
      <div class="panel-body">
        ${kv("Haulier Company", data.haulierCompany)}
        ${kv("Vehicle Registration", data.vehicleRegistration)}
        ${kv("Driver Name", data.driverName)}
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="section-wrap">
    ${isLivestock
      ? `<div class="sec-hdr amber">Livestock Compliance Declarations — Red Tractor &amp; BCMS Requirement</div>
         <div class="checkbox-col">${livestockDeclarations}</div>`
      : `<div class="sec-hdr amber">Post-Harvest Treatment Declaration — Red Tractor Requirement</div>
         ${treatmentContent}`
    }
  </div>

  <div class="divider"></div>

  ${confirmedSection}

  <div class="section-wrap">
    ${isLivestock
      ? `<div class="sec-hdr">Receiving Holding / Abattoir Receipt — to be completed on arrival</div>
         <div class="receipt-row">
           ${kv("Animals Received (count)", "")}
           ${kv("Date / Time of Arrival", "")}
           ${kv("Received By (name)", "")}
         </div>`
      : `<div class="sec-hdr">Merchant Receipt — to be completed at destination</div>
         <div class="receipt-row">
           ${kv("Weighbridge Net Weight (t)", "")}
           ${kv("Date / Time Received", "")}
           ${kv("Receiver Name", "")}
         </div>`
    }
    <div class="sig-box">
      <p>Authorised Signature (${isLivestock ? "receiving keeper / abattoir operative" : "merchant / receiver"}):</p>
      <p>Date:</p>
    </div>
  </div>

  <div class="footer-bar">
    This document must accompany the load and be retained by both parties as part of Red Tractor traceability records.
    Farm: ${data.farmName} · CPH: ${val(data.cphNumber)} · Red Tractor: ${val(data.redTractorId)} · Generated by BDE Farm Trac on ${today}
  </div>

</body>
</html>`;
}
