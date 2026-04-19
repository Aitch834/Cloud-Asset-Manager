import PDFDocument from "pdfkit";

// ─── Brand colours (matches the rest of the platform) ─────────────────────
const C = {
  brand:  "#1a6b3a",
  accent: "#2d9e5c",
  light:  "#e8f5ee",
  amber:  "#fef3c7",
  amberText: "#92400e",
  text:   "#1a1a1a",
  muted:  "#6b7280",
  border: "#d1d5db",
  white:  "#ffffff",
  rowAlt: "#f9fafb",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function bufferFromDoc(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function fmt(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtWeight(t: string | number | null | undefined): string {
  if (t == null || t === "") return "—";
  return `${parseFloat(String(t)).toFixed(3)} t`;
}

function val(v: string | number | null | undefined): string {
  if (v == null || v === "") return "—";
  return String(v);
}

/** Derive a human-readable document title from the load type and commodity */
function docTitle(loadType: string, commodity?: string | null): string {
  const lt = (loadType || "").toLowerCase();
  const cm = (commodity || "").toLowerCase();
  if (
    lt.includes("livestock") || lt.includes("cattle") || lt.includes("sheep") ||
    lt.includes("pig") || lt.includes("poultry") || lt.includes("beef") || lt.includes("lamb") ||
    cm.includes("cattle") || cm.includes("beef") || cm.includes("sheep") ||
    cm.includes("lamb") || cm.includes("pig") || cm.includes("livestock")
  ) return "LIVESTOCK DISPATCH NOTE";
  if (
    lt.includes("grain") || lt.includes("cereal") || lt.includes("oilseed") ||
    lt.includes("straw") || lt.includes("pulse") ||
    cm.includes("wheat") || cm.includes("barley") || cm.includes("osr") ||
    cm.includes("oat") || cm.includes("rape") || cm.includes("bean") || cm.includes("pea")
  ) return "GRAIN DISPATCH NOTE";
  return "DISPATCH NOTE";
}

// ─── Layout constants for landscape A4 ───────────────────────────────────
const M  = 48;   // margin
const PW = 841.89 - M * 2;  // content width ≈ 745.89
const C1 = M;
const C2 = M + PW * 0.25;
const C3 = M + PW * 0.50;
const C4 = M + PW * 0.75;
const CW = PW * 0.25 - 6;   // column width with gutter

/** Draw a section header band */
function sectionBand(
  doc: InstanceType<typeof PDFDocument>,
  y: number,
  title: string,
  colour = C.light,
  textColour = C.brand,
): number {
  doc.rect(M, y, PW, 18).fill(colour);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(textColour)
    .text(title, M + 6, y + 5, { width: PW - 12, characterSpacing: 0.6 });
  return y + 22; // returns y after band
}

/** Draw a labelled key-value field at an absolute position */
function kv(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string | null | undefined,
  x: number,
  y: number,
  w: number,
): void {
  doc.font("Helvetica").fontSize(6.5).fillColor(C.muted)
    .text(label.toUpperCase(), x, y, { width: w, lineBreak: false });
  doc.font("Helvetica").fontSize(8.5).fillColor(value && value !== "—" ? C.text : C.border)
    .text(val(value), x, y + 9, { width: w });
}

/** Draw a horizontal rule */
function rule(doc: InstanceType<typeof PDFDocument>, y: number): void {
  doc.moveTo(M, y).lineTo(M + PW, y).strokeColor(C.border).lineWidth(0.4).stroke();
}

/** A row of 4 equal kv fields. Returns the Y after the row. */
function row4(
  doc: InstanceType<typeof PDFDocument>,
  y: number,
  fields: [string, string | null | undefined][],
): number {
  fields.forEach(([label, value], i) => {
    const x = [C1, C2, C3, C4][i];
    if (x !== undefined) kv(doc, label, value, x, y, CW);
  });
  return y + 26;
}

/** A row of 2 half-width kv fields. Returns the Y after the row. */
function row2(
  doc: InstanceType<typeof PDFDocument>,
  y: number,
  fields: [string, string | null | undefined][],
): number {
  const hw = PW * 0.5 - 6;
  fields.forEach(([label, value], i) => {
    const x = i === 0 ? M : M + PW * 0.5;
    kv(doc, label, value, x, y, hw);
  });
  return y + 26;
}

/** A single full-width kv field. Returns the Y after. */
function row1(
  doc: InstanceType<typeof PDFDocument>,
  y: number,
  label: string,
  value: string | null | undefined,
): number {
  kv(doc, label, value, M, y, PW);
  return y + 26;
}

// ─── Types ────────────────────────────────────────────────────────────────
export interface DispatchNoteData {
  farmName: string;
  farmAddress?: string | null;
  farmPostcode?: string | null;
  cphNumber?: string | null;
  sbiNumber?: string | null;
  redTractorId?: string | null;
  assuranceBody?: string | null;
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

// ─── Main generator ───────────────────────────────────────────────────────
export async function generateDispatchNote(data: DispatchNoteData): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: M, bottom: M, left: M, right: M },
    info: {
      Title: `BDE Farm Trac — ${docTitle(data.loadType, data.commodity)} — ${data.dispatchRef}`,
      Author: "BDE Farm Trac",
      Creator: "BDE Farm Trac",
    },
  });

  const title = docTitle(data.loadType, data.commodity);

  // ── Header band ──────────────────────────────────────────────────────────
  doc.rect(0, 0, 841.89, 64).fill(C.brand);

  // Left: wordmark
  doc.font("Helvetica-Bold").fontSize(15).fillColor(C.white)
    .text("BDE Farm Trac", M, 16, { width: 260 });
  doc.font("Helvetica").fontSize(8).fillColor("#a7d9b8")
    .text("Red Tractor Compliance Platform", M, 34, { width: 260 });

  // Right: document title + ref
  doc.font("Helvetica-Bold").fontSize(13).fillColor(C.white)
    .text(title, M + PW - 260, 16, { width: 260, align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor("#c8ecd5")
    .text(`Ref: ${data.dispatchRef}`, M + PW - 260, 35, { width: 260, align: "right" });

  // Thin separator line inside header
  doc.moveTo(M, 52).lineTo(M + PW, 52)
    .strokeColor("rgba(255,255,255,0.15)").lineWidth(0.5).stroke();

  // ── Farm details ─────────────────────────────────────────────────────────
  let y = 76;

  // Farm name prominent
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.text)
    .text(data.farmName, M, y, { width: PW * 0.5 });
  if (data.farmAddress || data.farmPostcode) {
    doc.font("Helvetica").fontSize(8).fillColor(C.muted)
      .text([data.farmAddress, data.farmPostcode].filter(Boolean).join("  ·  "), M, y + 14, { width: PW * 0.5 });
  }
  // Farm identifiers on right
  kv(doc, "CPH Number",       data.cphNumber,    C3,    y,      CW);
  kv(doc, "SBI Number",       data.sbiNumber,    C4,    y,      CW);
  kv(doc, "Red Tractor No.",  data.redTractorId, C3,    y + 16, CW);
  kv(doc, "Farm Manager",     data.farmManager,  C4,    y + 16, CW);

  y += 38;
  rule(doc, y);
  y += 8;

  // ── Dispatch details ─────────────────────────────────────────────────────
  y = sectionBand(doc, y, "DISPATCH DETAILS");

  y = row4(doc, y, [
    ["Date of Dispatch",         fmt(data.departureDate)],
    ["Expected Arrival",         fmt(data.arrivalDate)],
    ["Waybill / Consignment No.", data.waybillNumber],
    ["Weighbridge Ticket No.",    data.weighbridgeTicketNo],
  ]);

  y = row4(doc, y, [
    ["Commodity / Load",          data.commodity || data.loadType],
    ["Variety",                   data.variety],
    ["Grade",                     data.grade],
    ["Crop Year / Batch",         data.cropYear],
  ]);

  y = row4(doc, y, [
    ["Estimated Net Weight",      fmtWeight(data.weightTonnes)],
    ["Moisture %",                data.moisturePercent != null ? `${data.moisturePercent}%` : null],
    ["Specific Weight (kg/hl)",   data.specificWeightKgHl != null ? String(data.specificWeightKgHl) : null],
    ["Source Store / Bin",        data.binName || data.storageLocation],
  ]);

  rule(doc, y);
  y += 8;

  // ── Destination & Haulier (two panels side by side) ───────────────────
  const destY = y;

  // Destination panel (left half)
  doc.rect(M, destY, PW * 0.5 - 4, 18).fill(C.light);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.brand)
    .text("DESTINATION", M + 6, destY + 5, { width: PW * 0.5 - 10, characterSpacing: 0.6 });
  y = destY + 22;

  const hw = PW * 0.5 - 12;
  kv(doc, "Buyer / Merchant",              data.buyerName || data.destination, M,           y,      hw);
  kv(doc, "Destination Address",           data.destination,                   M + hw * 0.5 + 6, y, hw * 0.5 - 6);
  y += 26;
  kv(doc, "Customer / Contract Reference", data.customerRef, M, y, hw);
  y += 26;

  // Haulier panel (right half) — drawn from destY
  const haulX = M + PW * 0.5 + 4;
  const haulW = PW * 0.5 - 4;
  doc.rect(haulX, destY, haulW, 18).fill(C.light);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.brand)
    .text("HAULIER & VEHICLE", haulX + 6, destY + 5, { width: haulW - 10, characterSpacing: 0.6 });

  const hcw = haulW / 3 - 4;
  kv(doc, "Haulier Company",     data.haulierCompany,       haulX,             destY + 22, hcw);
  kv(doc, "Vehicle Reg.",        data.vehicleRegistration,  haulX + haulW / 3, destY + 22, hcw);
  kv(doc, "Driver Name",         data.driverName,           haulX + haulW * 2 / 3, destY + 22, hcw);

  rule(doc, y);
  y += 8;

  // ── Post-harvest treatment declaration ───────────────────────────────────
  y = sectionBand(doc, y, "POST-HARVEST TREATMENT DECLARATION  —  Red Tractor Requirement", C.amber, C.amberText);

  if (data.postHarvestTreatments) {
    doc.font("Helvetica").fontSize(8.5).fillColor(C.text)
      .text(data.postHarvestTreatments, M, y, { width: PW });
    y = doc.y + 8;
  } else {
    doc.font("Helvetica").fontSize(8).fillColor(C.muted)
      .text(
        "Declare any post-harvest treatments applied to this lot (fungicide, insecticide, storage protectant). " +
        "This declaration is a contractual and Red Tractor compliance requirement.",
        M, y, { width: PW }
      );
    y = doc.y + 8;

    // Two tick-boxes
    const boxSize = 9;
    doc.rect(M, y, boxSize, boxSize).strokeColor(C.muted).lineWidth(0.6).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(C.text)
      .text("No post-harvest treatments have been applied to this lot.", M + boxSize + 6, y + 1, { width: PW * 0.45 - boxSize - 6 });

    doc.rect(M + PW * 0.5, y, boxSize, boxSize).strokeColor(C.muted).lineWidth(0.6).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(C.text)
      .text("Treatments were applied — details attached / below:", M + PW * 0.5 + boxSize + 6, y + 1, { width: PW * 0.5 - boxSize - 6 });
    y += 16;

    // One write-in line
    doc.moveTo(M, y).lineTo(M + PW, y).strokeColor(C.border).lineWidth(0.4).stroke();
    y += 14;
  }

  rule(doc, y);
  y += 8;

  // ── Delivery confirmation (if already confirmed) ─────────────────────────
  if (data.confirmedAt) {
    y = sectionBand(doc, y, "DELIVERY CONFIRMED", "#dcfce7", C.brand);
    y = row4(doc, y, [
      ["Confirmed Date",      fmt(data.confirmedAt)],
      ["Confirmed By",        data.confirmedBy],
      ["Weighbridge Weight",  fmtWeight(data.weighbridgeWeightTonnes)],
      ["", null],
    ]);
    rule(doc, y);
    y += 8;
  }

  // ── Merchant receipt ─────────────────────────────────────────────────────
  y = sectionBand(doc, y, "MERCHANT RECEIPT  —  to be completed at destination");

  const rcw = PW / 3 - 6;
  kv(doc, "Weighbridge Net Weight (t)", "", M,               y, rcw);
  kv(doc, "Date / Time Received",       "", M + PW / 3,      y, rcw);
  kv(doc, "Receiver Name",              "", M + PW * 2 / 3,  y, rcw);
  y += 30;

  // Signature box
  doc.rect(M, y, PW, 36).strokeColor(C.border).lineWidth(0.6).stroke();
  doc.font("Helvetica").fontSize(7).fillColor(C.muted)
    .text("Authorised Signature (merchant / receiver):", M + 8, y + 6)
    .text("Date:", M + 8, y + 24);
  y += 44;

  // ── Footer traceability ──────────────────────────────────────────────────
  y += 4;
  doc.rect(M, y, PW, 20).fill(C.rowAlt);
  doc.font("Helvetica").fontSize(6.5).fillColor(C.muted)
    .text(
      `This document must accompany the load and be retained by both parties as part of Red Tractor traceability records. ` +
      `Farm: ${data.farmName}  ·  CPH: ${val(data.cphNumber)}  ·  Red Tractor: ${val(data.redTractorId)}  ·  ` +
      `Generated by BDE Farm Trac on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      M + 6, y + 6, { width: PW - 12 }
    );

  return bufferFromDoc(doc);
}
