import PDFDocument from "pdfkit";

// ─── Colours ──────────────────────────────────────────────────────────────────
const GREEN = "#1a6b3a";
const DARK  = "#111827";
const MID   = "#374151";
const LIGHT = "#6b7280";
const RULE  = "#e5e7eb";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  return `${parseFloat(String(t)).toFixed(2)} t`;
}

function field(doc: InstanceType<typeof PDFDocument>, label: string, value: string | null | undefined, x: number, y: number, w: number) {
  doc.font("Helvetica").fontSize(7).fillColor(LIGHT).text(label.toUpperCase(), x, y, { width: w });
  doc.font("Helvetica").fontSize(9).fillColor(value ? DARK : "#d1d5db").text(value || "—", x, y + 10, { width: w });
}

function hRule(doc: InstanceType<typeof PDFDocument>, y: number) {
  doc.moveTo(48, y).lineTo(doc.page.width - 48, y).strokeColor(RULE).lineWidth(0.5).stroke();
}

function checkbox(doc: InstanceType<typeof PDFDocument>, x: number, y: number, label: string) {
  doc.rect(x, y, 10, 10).strokeColor(MID).lineWidth(0.75).stroke();
  doc.font("Helvetica").fontSize(8.5).fillColor(DARK).text(label, x + 15, y + 1, { width: 280 });
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DispatchNoteData {
  // Farm / operator
  farmName: string;
  farmAddress?: string | null;
  farmPostcode?: string | null;
  cphNumber?: string | null;
  sbiNumber?: string | null;
  redTractorId?: string | null;
  assuranceBody?: string | null;
  farmManager?: string | null;
  // Dispatch
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
  // Destination
  destination?: string | null;
  buyerName?: string | null;
  customerRef?: string | null;
  waybillNumber?: string | null;
  // Haulier
  vehicleRegistration?: string | null;
  driverName?: string | null;
  haulierCompany?: string | null;
  // Source bin
  binName?: string | null;
  // Post-harvest treatments (Red Tractor requirement)
  postHarvestTreatments?: string | null;
  // Delivery confirmation (if already confirmed)
  confirmedAt?: string | Date | null;
  confirmedBy?: string | null;
  weighbridgeWeightTonnes?: string | number | null;
}

// ─── Main generator ───────────────────────────────────────────────────────────
export async function generateDispatchNote(data: DispatchNoteData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 48, size: "A4" });

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 72).fill(GREEN);
  doc.fillColor("#fff")
    .font("Helvetica-Bold").fontSize(16).text("BDE Farm Trac", 48, 18)
    .font("Helvetica").fontSize(9).text("Red Tractor Compliance Platform", 48, 38);
  doc.font("Helvetica-Bold").fontSize(13)
    .text("GRAIN DISPATCH NOTE", doc.page.width - 300, 18, { width: 252, align: "right" });
  doc.font("Helvetica").fontSize(9)
    .text(`Ref: ${data.dispatchRef}`, doc.page.width - 300, 38, { width: 252, align: "right" });
  doc.fillColor(DARK);
  doc.y = 90;

  // ── Farm details ─────────────────────────────────────────────────────────────
  const col = (doc.page.width - 96) / 4;
  field(doc, "Farm / Operator", data.farmName, 48, doc.y, col * 2 - 8);
  field(doc, "CPH Number", data.cphNumber, 48 + col * 2, doc.y, col - 8);
  field(doc, "Red Tractor No.", data.redTractorId, 48 + col * 3, doc.y, col - 8);
  doc.y += 26;
  field(doc, "Address", [data.farmAddress, data.farmPostcode].filter(Boolean).join(", ") || null, 48, doc.y, col * 2 - 8);
  field(doc, "SBI Number", data.sbiNumber, 48 + col * 2, doc.y, col - 8);
  field(doc, "Farm Manager", data.farmManager, 48 + col * 3, doc.y, col - 8);
  doc.y += 30;
  hRule(doc, doc.y);
  doc.y += 10;

  // ── Dispatch details ─────────────────────────────────────────────────────────
  doc.rect(48, doc.y, doc.page.width - 96, 20).fill("#f0fdf4");
  doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(8)
    .text("DISPATCH DETAILS", 54, doc.y + 6, { characterSpacing: 0.8 });
  doc.fillColor(DARK);
  doc.y += 28;

  field(doc, "Date of Dispatch", fmt(data.departureDate), 48, doc.y, col - 8);
  field(doc, "Expected Arrival", fmt(data.arrivalDate), 48 + col, doc.y, col - 8);
  field(doc, "Waybill / Consignment No.", data.waybillNumber, 48 + col * 2, doc.y, col - 8);
  field(doc, "Weighbridge Ticket No.", data.weighbridgeTicketNo, 48 + col * 3, doc.y, col - 8);
  doc.y += 30;

  field(doc, "Commodity", data.commodity || data.loadType, 48, doc.y, col - 8);
  field(doc, "Variety", data.variety, 48 + col, doc.y, col - 8);
  field(doc, "Grade", data.grade, 48 + col * 2, doc.y, col - 8);
  field(doc, "Crop Year", data.cropYear, 48 + col * 3, doc.y, col - 8);
  doc.y += 30;

  field(doc, "Estimated Loaded Weight", fmtWeight(data.weightTonnes), 48, doc.y, col - 8);
  field(doc, "Moisture %", data.moisturePercent != null ? `${data.moisturePercent}%` : null, 48 + col, doc.y, col - 8);
  field(doc, "Specific Weight (kg/hl)", data.specificWeightKgHl != null ? String(data.specificWeightKgHl) : null, 48 + col * 2, doc.y, col - 8);
  field(doc, "Source Store / Bin", data.binName || data.storageLocation, 48 + col * 3, doc.y, col - 8);
  doc.y += 30;
  hRule(doc, doc.y);
  doc.y += 10;

  // ── Destination ──────────────────────────────────────────────────────────────
  doc.rect(48, doc.y, doc.page.width - 96, 20).fill("#f0fdf4");
  doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(8)
    .text("DESTINATION", 54, doc.y + 6, { characterSpacing: 0.8 });
  doc.fillColor(DARK);
  doc.y += 28;

  field(doc, "Buyer / Merchant", data.buyerName || data.destination, 48, doc.y, col * 2 - 8);
  field(doc, "Destination Address", data.destination, 48 + col * 2, doc.y, col * 2 - 8);
  doc.y += 30;
  field(doc, "Customer / Contract Reference", data.customerRef, 48, doc.y, col * 2 - 8);
  doc.y += 30;
  hRule(doc, doc.y);
  doc.y += 10;

  // ── Haulier ──────────────────────────────────────────────────────────────────
  doc.rect(48, doc.y, doc.page.width - 96, 20).fill("#f0fdf4");
  doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(8)
    .text("HAULIER & VEHICLE", 54, doc.y + 6, { characterSpacing: 0.8 });
  doc.fillColor(DARK);
  doc.y += 28;

  field(doc, "Haulier Company", data.haulierCompany, 48, doc.y, col - 8);
  field(doc, "Vehicle Registration", data.vehicleRegistration, 48 + col, doc.y, col - 8);
  field(doc, "Driver Name", data.driverName, 48 + col * 2, doc.y, col - 8);
  doc.y += 30;
  hRule(doc, doc.y);
  doc.y += 10;

  // ── Red Tractor: Post-harvest treatment declaration ───────────────────────────
  doc.rect(48, doc.y, doc.page.width - 96, 20).fill("#fef3c7");
  doc.fillColor("#92400e").font("Helvetica-Bold").fontSize(8)
    .text("POST-HARVEST TREATMENT DECLARATION  (Red Tractor Requirement)", 54, doc.y + 6, { characterSpacing: 0.5 });
  doc.fillColor(DARK);
  doc.y += 28;

  doc.font("Helvetica").fontSize(8).fillColor(LIGHT)
    .text("Declare any post-harvest treatments applied to this lot (fungicide, insecticide, admixture, storage protectant). This declaration is a contractual and Red Tractor compliance requirement.", 48, doc.y, { width: doc.page.width - 96 });
  doc.y += 20;

  if (data.postHarvestTreatments) {
    doc.font("Helvetica").fontSize(9).fillColor(DARK)
      .text(data.postHarvestTreatments, 48, doc.y, { width: doc.page.width - 96 });
    doc.y += 16;
  } else {
    // Tick boxes for declaration
    const checkY = doc.y;
    checkbox(doc, 48, checkY, "No post-harvest treatments have been applied to this lot.");
    doc.y += 16;
    checkbox(doc, 48, doc.y, "The following treatments were applied (attach treatment record if required):");
    doc.y += 20;
    // Lines for writing treatment details
    for (let i = 0; i < 3; i++) {
      doc.moveTo(48, doc.y).lineTo(doc.page.width - 48, doc.y).strokeColor(RULE).lineWidth(0.5).stroke();
      doc.y += 18;
    }
  }
  doc.y += 4;
  hRule(doc, doc.y);
  doc.y += 10;

  // ── Delivery confirmation (if confirmed) ─────────────────────────────────────
  if (data.confirmedAt) {
    doc.rect(48, doc.y, doc.page.width - 96, 20).fill("#dcfce7");
    doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(8)
      .text("DELIVERY CONFIRMED", 54, doc.y + 6, { characterSpacing: 0.8 });
    doc.fillColor(DARK);
    doc.y += 28;
    field(doc, "Confirmed Date", fmt(data.confirmedAt), 48, doc.y, col - 8);
    field(doc, "Confirmed By", data.confirmedBy, 48 + col, doc.y, col - 8);
    field(doc, "Weighbridge Weight", fmtWeight(data.weighbridgeWeightTonnes), 48 + col * 2, doc.y, col - 8);
    doc.y += 30;
    hRule(doc, doc.y);
    doc.y += 10;
  }

  // ── Merchant receipt ─────────────────────────────────────────────────────────
  doc.rect(48, doc.y, doc.page.width - 96, 20).fill("#f0fdf4");
  doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(8)
    .text("MERCHANT RECEIPT  (to be completed at destination)", 54, doc.y + 6, { characterSpacing: 0.5 });
  doc.fillColor(DARK);
  doc.y += 28;

  const receiptCol = (doc.page.width - 96) / 3;
  field(doc, "Weighbridge Net Weight (t)", "", 48, doc.y, receiptCol - 8);
  field(doc, "Date / Time Received", "", 48 + receiptCol, doc.y, receiptCol - 8);
  field(doc, "Receiver Name", "", 48 + receiptCol * 2, doc.y, receiptCol - 8);
  doc.y += 30;

  // Signature box
  const sigY = doc.y;
  doc.rect(48, sigY, doc.page.width - 96, 48).strokeColor(RULE).lineWidth(0.75).stroke();
  doc.font("Helvetica").fontSize(7.5).fillColor(LIGHT)
    .text("Authorised Signature (merchant):", 56, sigY + 6)
    .text("Date:", 56, sigY + 32);
  doc.y = sigY + 60;

  // ── Traceability statement ────────────────────────────────────────────────────
  doc.y += 6;
  doc.rect(48, doc.y, doc.page.width - 96, 28).fill("#f9fafb");
  doc.font("Helvetica").fontSize(7).fillColor(LIGHT)
    .text(
      `This Grain Dispatch Note must accompany the load and be retained by both parties as part of Red Tractor traceability records. ` +
      `Farm: ${data.farmName} · CPH: ${data.cphNumber || "—"} · Red Tractor: ${data.redTractorId || "—"} · ` +
      `Generated by BDE Farm Trac on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      54, doc.y + 8, { width: doc.page.width - 108 }
    );

  return bufferFromDoc(doc);
}
