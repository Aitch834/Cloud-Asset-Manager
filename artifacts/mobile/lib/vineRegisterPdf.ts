export interface VineRegisterPdfRecord {
  registeredVariety: string | null;
  vivcNumber?: string | null;
  registeredAreaHa: string | null;
  giClassification: string | null;
  wineColour: string | null;
  dateRegistered: string | null;
  dateAmended?: string | null;
  isRemovedFromRegister: boolean | null;
}

export interface VineRegisterPdfMeta {
  fsaVineRegisterRef?: string | null;
  fsaWineProductionRef?: string | null;
  appaRef?: string | null;
  winegbMembershipNumber?: string | null;
}

export interface VineRegisterPdfOptions {
  farmName: string;
  address?: string | null;
  postcode?: string | null;
  fsaVineRef?: string | null;
  farmMeta?: VineRegisterPdfMeta | null;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textOrDash(value: unknown): string {
  const text = String(value ?? "").trim();
  return text || "—";
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB");
}

function formatArea(value: string | null | undefined): string {
  if (!value) return "—";
  const area = Number.parseFloat(value);
  return Number.isFinite(area) ? `${area.toFixed(4)} ha` : "—";
}

/**
 * Builds the same information shown by the dashboard Vine Register PDF.
 * The mobile app passes the result to expo-print, which handles pagination
 * and creates the native PDF on iOS and Android.
 */
export function buildVineRegisterPdfHtml(
  records: VineRegisterPdfRecord[],
  options: VineRegisterPdfOptions,
): string {
  const farmName = options.farmName.trim() || "—";
  const address = String(options.address ?? "").trim();
  const postcode = String(options.postcode ?? "").trim();
  const addressLine = [address, postcode].filter(Boolean).join(", ");
  const fsaVineRegisterRef = (
    options.farmMeta?.fsaVineRegisterRef || options.fsaVineRef || ""
  ).trim();
  const fsaWineProductionRef = String(options.farmMeta?.fsaWineProductionRef ?? "").trim();
  const appaRef = String(options.farmMeta?.appaRef ?? "").trim();
  const winegbMembershipNumber = String(options.farmMeta?.winegbMembershipNumber ?? "").trim();
  const activeCount = records.filter(record => !record.isRemovedFromRegister).length;
  const totalHa = records.reduce((sum, record) => {
    const area = Number.parseFloat(record.registeredAreaHa ?? "");
    return sum + (Number.isFinite(area) ? area : 0);
  }, 0);
  const missingFields = [
    !farmName || farmName === "—" ? "Farm name" : "",
    !addressLine ? "Farm address" : "",
    !fsaVineRegisterRef ? "FSA Vine Register Ref" : "",
    !fsaWineProductionRef ? "FSA Wine Production Ref" : "",
    !appaRef ? "APPA Ref" : "",
    !winegbMembershipNumber ? "WineGB Membership No" : "",
  ].filter(Boolean);
  const refs = [
    fsaVineRegisterRef ? `FSA Vine Reg: ${escapeHtml(fsaVineRegisterRef)}` : "",
    fsaWineProductionRef ? `FSA Wine Prod: ${escapeHtml(fsaWineProductionRef)}` : "",
    appaRef ? `APPA Ref: ${escapeHtml(appaRef)}` : "",
    winegbMembershipNumber ? `WineGB No: ${escapeHtml(winegbMembershipNumber)}` : "",
  ].filter(Boolean).join(" &nbsp;·&nbsp; ");
  const printedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const printedDateTime = new Date().toLocaleString("en-GB");

  const rows = records.length
    ? records.map(record => `
        <tr>
          <td>${escapeHtml(textOrDash(record.registeredVariety))}</td>
          <td>${escapeHtml(textOrDash(record.vivcNumber))}</td>
          <td class="numeric">${escapeHtml(formatArea(record.registeredAreaHa))}</td>
          <td>${escapeHtml(textOrDash(record.giClassification))}</td>
          <td>${escapeHtml(textOrDash(record.wineColour))}</td>
          <td>${escapeHtml(formatDate(record.dateRegistered))}</td>
          <td>${escapeHtml(formatDate(record.dateAmended))}</td>
          <td class="${record.isRemovedFromRegister ? "removed" : "active"}">
            ${record.isRemovedFromRegister ? "Removed" : "Active"}
          </td>
        </tr>`).join("")
    : `<tr><td colspan="8" class="empty">No register entries</td></tr>`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>FSA Vine Register — ${escapeHtml(farmName)}</title>
    <style>
      @page { size: A4 landscape; margin: 14mm; }
      * { box-sizing: border-box; }
      body {
        color: #1e1e1e;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10px;
        margin: 0;
      }
      .header {
        align-items: center;
        background: #2d6a4f;
        color: #fff;
        display: flex;
        justify-content: space-between;
        padding: 10px 14px;
      }
      .brand { font-size: 16px; font-weight: 700; }
      .subtitle { font-size: 9px; margin-top: 4px; }
      .report-title { font-size: 14px; font-weight: 700; text-align: right; }
      .report-date { font-size: 9px; margin-top: 4px; text-align: right; }
      .farm-bar, .notice, .refs, .summary {
        border-radius: 4px;
        margin-top: 8px;
        padding: 7px 9px;
      }
      .farm-bar {
        background: #f0fdf4;
        display: flex;
        justify-content: space-between;
      }
      .farm-bar span { flex: 1; }
      .farm-bar span:nth-child(2) { text-align: center; }
      .farm-bar span:last-child { text-align: right; }
      .notice {
        background: #fffbeb;
        border: 1px solid #fcd34d;
        color: #78350f;
      }
      .refs {
        background: #d1fae5;
        border: 1px solid #6ee7b7;
        color: #065f46;
      }
      .summary {
        background: #f0fdf4;
        border: 1px solid #86efac;
        color: #065f46;
      }
      table {
        border-collapse: collapse;
        margin-top: 10px;
        table-layout: fixed;
        width: 100%;
      }
      th {
        background: #2d6a4f;
        color: #fff;
        font-size: 9px;
        padding: 6px 5px;
        text-align: left;
      }
      td {
        border-bottom: 1px solid #d1d5db;
        padding: 5px;
        overflow-wrap: anywhere;
        vertical-align: top;
      }
      tbody tr:nth-child(even) { background: #f0fdf4; }
      th:nth-child(1) { width: 18%; }
      th:nth-child(2) { width: 8%; }
      th:nth-child(3) { width: 10%; }
      th:nth-child(4) { width: 14%; }
      th:nth-child(5) { width: 12%; }
      th:nth-child(6), th:nth-child(7) { width: 11%; }
      th:nth-child(8) { width: 9%; }
      .numeric { text-align: right; }
      .active { color: #065f46; font-weight: 700; }
      .removed { color: #991b1b; font-weight: 700; }
      .empty { color: #6b7280; text-align: center; }
      .footer {
        color: #969696;
        font-size: 8px;
        margin-top: 12px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <header class="header">
      <div>
        <div class="brand">BDE Farm Trac</div>
        <div class="subtitle">Vineyard Compliance Platform</div>
      </div>
      <div>
        <div class="report-title">FSA Vine Register</div>
        <div class="report-date">Date: ${escapeHtml(printedDate)}</div>
      </div>
    </header>
    <div class="farm-bar">
      <span><strong>Farm:</strong> ${escapeHtml(farmName)}</span>
      <span><strong>Printed:</strong> ${escapeHtml(printedDateTime)}</span>
      <span>${addressLine ? `<strong>Address:</strong> ${escapeHtml(addressLine)}` : ""}</span>
    </div>
    ${missingFields.length > 0
      ? `<div class="notice"><strong>⚠ Missing:</strong> ${escapeHtml(missingFields.join(", "))} — update Farm Settings before submitting to the FSA.</div>`
      : ""}
    ${refs ? `<div class="refs">${refs}</div>` : ""}
    <div class="summary">
      <strong>ⓘ ${records.length} ${records.length === 1 ? "entry" : "entries"}</strong>
      &nbsp;·&nbsp; Active: ${activeCount}
      &nbsp;·&nbsp; Removed: ${records.length - activeCount}
      &nbsp;·&nbsp; Total Area: ${totalHa.toFixed(4)} ha
      &nbsp;— Mandatory for UK vineyards &gt; 0.01 ha. Report changes to the FSA within 30 days.
    </div>
    <table>
      <thead>
        <tr>
          <th>Registered Variety</th>
          <th>VIVC No.</th>
          <th>Area (ha)</th>
          <th>GI / PDO</th>
          <th>Wine Colour</th>
          <th>Date Registered</th>
          <th>Date Amended</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      ${records.length > 0
        ? `<tfoot><tr><td><strong>Totals</strong></td><td></td><td class="numeric"><strong>${totalHa.toFixed(4)} ha</strong></td><td colspan="5"></td></tr></tfoot>`
        : ""}
    </table>
    <div class="footer">
      Prepared by BDE Farm Trac · FSA Vine Register · Report any changes to the FSA within 30 days · food.gov.uk/business-guidance/vine-register
    </div>
  </body>
</html>`;
}