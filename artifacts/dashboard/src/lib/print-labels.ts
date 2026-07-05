import { openPrintWindow } from "./print-report";

export interface SeedBagLabelData {
  cropName: string;
  varietyName?: string | null;
  batchNumber: string;
  supplierName?: string | null;
  tgwGrams?: string | number | null;
  germinationPercent?: string | number | null;
  fieldName?: string | null;
  fieldReference?: string | null;
  plantingDate?: string | null;
  farmName?: string | null;
  cphNumber?: string | null;
}

const LABEL_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; }
  .sheet {
    width: 210mm;
    padding: 15.15mm 7.2mm;
    display: grid;
    grid-template-columns: repeat(3, 63.5mm);
    grid-template-rows: repeat(7, 38.1mm);
    column-gap: 2.5mm;
    row-gap: 0mm;
    justify-content: center;
  }
  .label {
    width: 63.5mm;
    height: 38.1mm;
    padding: 3mm 3.5mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    border: 1px dotted #d1d5db;
  }
  .label.empty { border: 1px dotted #f3f4f6; }
  .label .crop { font-size: 10.5px; font-weight: 700; color: #1a3a1a; line-height: 1.2; margin: 0 0 1mm; }
  .label .variety { font-size: 8px; color: #374151; margin: 0 0 1.5mm; }
  .label .row { font-size: 7px; color: #111; display: flex; justify-content: space-between; line-height: 1.5; }
  .label .row b { font-weight: 700; }
  .label .batch { font-size: 7.5px; font-weight: 700; color: #92400e; margin-top: 1mm; }
  .label .farm { font-size: 6px; color: #6b7280; margin-top: 1mm; border-top: 0.5px solid #e5e7eb; padding-top: 1mm; }
`;

function buildLabelHtml(data: SeedBagLabelData): string {
  return `
    <div class="crop">${escapeHtml(data.cropName)}</div>
    ${data.varietyName ? `<div class="variety">${escapeHtml(data.varietyName)}</div>` : ""}
    <div class="row"><span>Batch:</span><b>${escapeHtml(data.batchNumber)}</b></div>
    ${data.supplierName ? `<div class="row"><span>Supplier:</span><span>${escapeHtml(data.supplierName)}</span></div>` : ""}
    ${data.tgwGrams ? `<div class="row"><span>TGW:</span><span>${escapeHtml(String(data.tgwGrams))}g</span></div>` : ""}
    ${data.germinationPercent ? `<div class="row"><span>Germination:</span><span>${escapeHtml(String(data.germinationPercent))}%</span></div>` : ""}
    ${data.fieldName ? `<div class="row"><span>Field:</span><span>${escapeHtml(data.fieldName)}${data.fieldReference ? ` (${escapeHtml(data.fieldReference)})` : ""}</span></div>` : ""}
    ${data.plantingDate ? `<div class="row"><span>Planted:</span><span>${escapeHtml(data.plantingDate)}</span></div>` : ""}
    ${data.farmName ? `<div class="farm">${escapeHtml(data.farmName)}${data.cphNumber ? ` · CPH ${escapeHtml(data.cphNumber)}` : ""}</div>` : ""}
  `;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function printSeedBagLabels(data: SeedBagLabelData, count: number): void {
  const labelsPerSheet = 21;
  const totalCells = Math.ceil(count / labelsPerSheet) * labelsPerSheet;
  const cells: string[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < count) {
      cells.push(`<div class="label">${buildLabelHtml(data)}</div>`);
    } else {
      cells.push(`<div class="label empty"></div>`);
    }
  }
  const sheetsCount = totalCells / labelsPerSheet;
  const sheets: string[] = [];
  for (let s = 0; s < sheetsCount; s++) {
    const sheetCells = cells.slice(s * labelsPerSheet, (s + 1) * labelsPerSheet).join("");
    sheets.push(`<div class="sheet">${sheetCells}</div>`);
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Seed Bag Labels — ${escapeHtml(data.batchNumber)}</title>
<style>${LABEL_CSS}</style></head><body>${sheets.join("")}</body></html>`;

  openPrintWindow(html);
}
