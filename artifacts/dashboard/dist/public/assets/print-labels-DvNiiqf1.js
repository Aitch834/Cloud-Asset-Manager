import { Q as QRCode } from "./browser-c55JqCbr.js";
import { o as openPrintWindow } from "./print-report-ClU8-1P0.js";
const LABEL_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; }

  .sheet {
    width: 210mm;
    height: 297mm;
    display: grid;
    grid-template-columns: 105mm 105mm;
    grid-template-rows: 148.5mm 148.5mm;
    page-break-after: always;
  }
  .sheet:last-child { page-break-after: auto; }

  .label {
    width: 105mm;
    height: 148.5mm;
    padding: 7mm 7mm 5mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 0.5pt solid #d1d5db;
  }
  .label.empty { border: 0.5pt solid #f0f0f0; }

  .label-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 4mm;
    margin-bottom: 3.5mm;
  }
  .crop-block { flex: 1; min-width: 0; }
  .crop-name {
    font-size: 20pt;
    font-weight: 800;
    color: #14532d;
    line-height: 1.1;
    margin: 0 0 1.5mm;
    word-break: break-word;
  }
  .variety-name {
    font-size: 11pt;
    font-weight: 600;
    color: #374151;
    margin: 0;
    line-height: 1.2;
  }
  .qr-block { flex-shrink: 0; }
  .qr-block img { width: 37mm; height: 37mm; display: block; }

  .batch-bar {
    background: #fef3c7;
    border: 0.5pt solid #fcd34d;
    border-radius: 2mm;
    padding: 2mm 3mm;
    margin-bottom: 3.5mm;
  }
  .batch-label { font-size: 7pt; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.5mm; }
  .batch-number { font-size: 13pt; font-weight: 800; color: #78350f; font-family: 'Courier New', monospace; letter-spacing: 0.05em; line-height: 1; }

  .detail-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.5mm 3.5mm;
    font-size: 8.5pt;
    color: #111;
    margin-bottom: 2.5mm;
  }
  .dl { color: #6b7280; font-weight: 600; white-space: nowrap; }
  .dv { font-weight: 700; color: #111; word-break: break-word; }

  .treatment-bar {
    background: #ede9fe;
    border-left: 2mm solid #7c3aed;
    padding: 1.5mm 2.5mm;
    font-size: 7.5pt;
    color: #4c1d95;
    font-style: italic;
    margin-bottom: 2.5mm;
    line-height: 1.3;
  }

  .spacer { flex: 1; }

  .farm-footer {
    border-top: 0.5pt solid #e5e7eb;
    padding-top: 2mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7pt;
    color: #9ca3af;
  }
  .qr-hint {
    font-size: 6pt;
    color: #d1d5db;
    text-align: center;
    margin-top: 0.5mm;
  }
`;
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function buildLabelHtml(data, qrDataUrl) {
  const details = [];
  if (data.supplierName) details.push(["Supplier", data.supplierName]);
  if (data.tgwGrams) details.push(["TGW", `${data.tgwGrams} g`]);
  if (data.germinationPercent) details.push(["Germination", `${data.germinationPercent}%`]);
  if (data.quantityReceivedKg) details.push(["Qty Received", `${data.quantityReceivedKg} kg`]);
  if (data.fieldName) details.push(["Field", data.fieldName + (data.fieldReference ? ` (${data.fieldReference})` : "")]);
  if (data.plantingDate) details.push(["Planted", data.plantingDate]);
  const detailRows = details.map(([l, v]) => `<span class="dl">${escapeHtml(l)}</span><span class="dv">${escapeHtml(v)}</span>`).join("");
  const treatment = data.treatmentNotes ? `<div class="treatment-bar">Treated: ${escapeHtml(data.treatmentNotes)}</div>` : "";
  const footer = data.farmName ? `${escapeHtml(data.farmName)}${data.cphNumber ? ` &middot; CPH ${escapeHtml(data.cphNumber)}` : ""}` : "";
  return `
    <div class="label-header">
      <div class="crop-block">
        <p class="crop-name">${escapeHtml(data.cropName)}</p>
        ${data.varietyName ? `<p class="variety-name">${escapeHtml(data.varietyName)}</p>` : ""}
      </div>
      <div class="qr-block">
        <img src="${qrDataUrl}" alt="QR SB-${data.batchId}" />
        <div class="qr-hint">SB-${data.batchId}</div>
      </div>
    </div>

    <div class="batch-bar">
      <div class="batch-label">Batch Number</div>
      <div class="batch-number">${escapeHtml(data.batchNumber)}</div>
    </div>

    ${details.length > 0 ? `<div class="detail-grid">${detailRows}</div>` : ""}
    ${treatment}

    <div class="spacer"></div>
    ${footer ? `<div class="farm-footer"><span>${footer}</span><span>${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</span></div>` : ""}
  `;
}
const SOIL_LABEL_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; }

  .sheet {
    width: 210mm;
    height: 297mm;
    display: grid;
    grid-template-columns: 105mm 105mm;
    grid-template-rows: 148.5mm 148.5mm;
    page-break-after: always;
  }
  .sheet:last-child { page-break-after: auto; }

  .label {
    width: 105mm;
    height: 148.5mm;
    padding: 6mm 7mm 5mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 0.5pt solid #d1d5db;
  }
  .label.empty { border: 0.5pt solid #f0f0f0; }

  .label-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 3mm;
    margin-bottom: 3mm;
  }
  .label-title-block { flex: 1; min-width: 0; }
  .label-module {
    font-size: 7pt;
    font-weight: 700;
    color: #78350f;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 1mm;
  }
  .label-type {
    font-size: 17pt;
    font-weight: 800;
    color: #3d1f00;
    line-height: 1.1;
    margin: 0;
    word-break: break-word;
  }
  .qr-block { flex-shrink: 0; }
  .qr-block img { width: 34mm; height: 34mm; display: block; }

  .ref-bar {
    background: #fef9c3;
    border: 0.5pt solid #fde047;
    border-radius: 2mm;
    padding: 2.5mm 3mm;
    margin-bottom: 3mm;
  }
  .ref-label { font-size: 6.5pt; font-weight: 700; color: #713f12; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.5mm; }
  .ref-number { font-size: 15pt; font-weight: 800; color: #78350f; font-family: 'Courier New', monospace; letter-spacing: 0.06em; line-height: 1; }

  .detail-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.5mm 3mm;
    font-size: 8pt;
    margin-bottom: 2.5mm;
  }
  .dl { color: #6b7280; font-weight: 600; white-space: nowrap; }
  .dv { font-weight: 700; color: #111; word-break: break-word; }

  .lab-box {
    border: 0.5pt dashed #d1d5db;
    border-radius: 2mm;
    padding: 2mm 3mm;
    margin-bottom: 2.5mm;
  }
  .lab-box-label { font-size: 6.5pt; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1mm; }
  .lab-box-line {
    border-bottom: 0.5pt solid #e5e7eb;
    height: 5mm;
    margin-bottom: 1mm;
  }
  .lab-box-hint { font-size: 6pt; color: #d1d5db; }

  .instructions-bar {
    background: #f0fdf4;
    border-left: 2mm solid #16a34a;
    padding: 1.5mm 2.5mm;
    font-size: 7.5pt;
    color: #15803d;
    font-style: italic;
    margin-bottom: 2.5mm;
    line-height: 1.3;
  }

  .spacer { flex: 1; }

  .farm-footer {
    border-top: 0.5pt solid #e5e7eb;
    padding-top: 2mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7pt;
    color: #9ca3af;
  }
  .qr-hint {
    font-size: 6pt;
    color: #d1d5db;
    text-align: center;
    margin-top: 0.5mm;
  }
`;
function buildSoilLabelHtml(data, qrDataUrl) {
  const details = [];
  if (data.blockName) details.push(["Block", data.blockName]);
  if (data.requestedBy) details.push(["Requested By", data.requestedBy]);
  if (data.requestDate) details.push(["Date Raised", data.requestDate]);
  const detailRows = details.map(([l, v]) => `<span class="dl">${escapeHtml(l)}</span><span class="dv">${escapeHtml(v)}</span>`).join("");
  const instructions = data.instructions ? `<div class="instructions-bar">Note: ${escapeHtml(data.instructions)}</div>` : "";
  const footer = data.farmName ? escapeHtml(data.farmName) : "";
  return `
    <div class="label-top">
      <div class="label-title-block">
        <p class="label-module">Soil &amp; Leaf Analysis</p>
        <p class="label-type">${escapeHtml(data.analysisType)}</p>
      </div>
      <div class="qr-block">
        <img src="${qrDataUrl}" alt="QR ${escapeHtml(data.requestReference)}" />
        <div class="qr-hint">${escapeHtml(data.requestReference)}</div>
      </div>
    </div>

    <div class="ref-bar">
      <div class="ref-label">Request Reference</div>
      <div class="ref-number">${escapeHtml(data.requestReference)}</div>
    </div>

    ${details.length > 0 ? `<div class="detail-grid">${detailRows}</div>` : ""}
    ${instructions}

    <div class="lab-box">
      <div class="lab-box-label">Lab Sample Reference (complete on receipt)</div>
      <div class="lab-box-line"></div>
      <div class="lab-box-hint">Write lab reference above</div>
    </div>

    <div class="spacer"></div>
    ${footer ? `<div class="farm-footer"><span>${footer}</span><span>BDE Farm Trac</span></div>` : ""}
  `;
}
async function printSoilSampleLabel(data, count = 4) {
  const qrDataUrl = await QRCode.toDataURL(data.requestReference, {
    width: 136,
    margin: 1,
    color: { dark: "#78350f", light: "#fef9c3" },
    errorCorrectionLevel: "M"
  });
  const labelsPerSheet = 4;
  const totalCells = Math.ceil(count / labelsPerSheet) * labelsPerSheet;
  const cells = [];
  const labelInner = buildSoilLabelHtml(data, qrDataUrl);
  for (let i = 0; i < totalCells; i++) {
    cells.push(i < count ? `<div class="label">${labelInner}</div>` : `<div class="label empty"></div>`);
  }
  const sheetsCount = totalCells / labelsPerSheet;
  const sheets = [];
  for (let s = 0; s < sheetsCount; s++) {
    sheets.push(`<div class="sheet">${cells.slice(s * labelsPerSheet, (s + 1) * labelsPerSheet).join("")}</div>`);
  }
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Sample Label — ${escapeHtml(data.requestReference)}</title>
<style>${SOIL_LABEL_CSS}</style></head><body>${sheets.join("")}</body></html>`;
  openPrintWindow(html);
}
async function printSeedBagLabels(data, count) {
  const qrDataUrl = await QRCode.toDataURL(`SB-${data.batchId}`, {
    width: 148,
    margin: 1,
    color: { dark: "#14532d", light: "#ffffff" },
    errorCorrectionLevel: "M"
  });
  const labelsPerSheet = 4;
  const totalCells = Math.ceil(count / labelsPerSheet) * labelsPerSheet;
  const cells = [];
  const labelInner = buildLabelHtml(data, qrDataUrl);
  for (let i = 0; i < totalCells; i++) {
    if (i < count) {
      cells.push(`<div class="label">${labelInner}</div>`);
    } else {
      cells.push(`<div class="label empty"></div>`);
    }
  }
  const sheetsCount = totalCells / labelsPerSheet;
  const sheets = [];
  for (let s = 0; s < sheetsCount; s++) {
    const sheetCells = cells.slice(s * labelsPerSheet, (s + 1) * labelsPerSheet).join("");
    sheets.push(`<div class="sheet">${sheetCells}</div>`);
  }
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Seed Bag Labels — ${escapeHtml(data.batchNumber)}</title>
<style>${LABEL_CSS}</style></head><body>${sheets.join("")}</body></html>`;
  openPrintWindow(html);
}
export {
  printSoilSampleLabel as a,
  printSeedBagLabels as p
};
