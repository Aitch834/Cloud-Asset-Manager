import { p as printProReport, e as escapeHtml } from "./print-report-ClU8-1P0.js";
const SPECIES_LABELS = {
  cattle: "Calving",
  sheep: "Lambing",
  goat: "Kidding"
};
function value(value2) {
  if (value2 == null || value2 === "") return "—";
  if (typeof value2 === "boolean") return value2 ? "Yes" : "No";
  return String(value2).replace(/_/g, " ");
}
function date(valueToFormat) {
  if (!valueToFormat) return "—";
  const parsed = new Date(String(valueToFormat));
  return Number.isNaN(parsed.getTime()) ? value(valueToFormat) : parsed.toLocaleDateString("en-GB");
}
function yesNo(valueToFormat) {
  return valueToFormat == null ? "—" : valueToFormat ? "Yes" : "No";
}
function row(label, content) {
  return `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value(content))}</td></tr>`;
}
function table(title, rows) {
  return `<div class="section-head">${escapeHtml(title)}</div><table><tbody>${rows}</tbody></table>`;
}
function offspringTable(offspring) {
  const rows = offspring.length ? offspring.map((child) => `<tr>
        <td>${escapeHtml(child.label)}</td>
        <td>${escapeHtml(value(child.outcome))}</td>
        <td>${escapeHtml(value(child.sex))}</td>
        <td>${escapeHtml(value(child.tag))}</td>
        <td>${escapeHtml(value(child.eid))}</td>
        <td>${escapeHtml(value(child.animalId))}</td>
        <td>${escapeHtml(child.weightKg == null || child.weightKg === "" ? "—" : `${value(child.weightKg)} kg`)}</td>
        <td>${escapeHtml(value(child.colostrum))}</td>
      </tr>`).join("") : `<tr><td colspan="8">No offspring details recorded.</td></tr>`;
  return `<div class="section-head">Offspring details</div>
    <table class="offspring-table">
      <thead><tr><th>Offspring</th><th>Outcome</th><th>Sex</th><th>Tag</th><th>EID</th><th>Animal ID</th><th>Birth weight</th><th>Colostrum</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}
function buildBirthRecordTable(data) {
  const title = SPECIES_LABELS[data.species];
  const organicRows = data.organic ? row("Organic status confirmed", yesNo(data.organic.statusConfirmed)) + row("Colostrum from organic doe", yesNo(data.organic.colostrumFromOrganicDoe)) : "";
  return `<style>
    .birth-note{margin:8px 0;padding:7px 9px;border:1px solid #c8ddc8;background:#f4f8f4;color:#365236;font-size:7.5px;line-height:1.4}
    .offspring-table{font-size:7px}
    .offspring-table th{white-space:normal}
    .signature-row{display:flex;gap:18px;margin-top:16px;page-break-inside:avoid}
    .signature-box{flex:1;border-bottom:1px solid #6b7280;padding:18px 4px 4px;font-size:7px;color:#4b5563}
    .signature-box span{float:right}
  </style>
  <div class="birth-note"><strong>Farm Birth Record</strong> — This document is an internal farm record produced by BDE Farm Trac. It is not an official statutory birth certificate, passport, BCMS/LIS submission, or breed-registration document.</div>
  ${table("Birth event", [
    row("Species / event", title),
    row("Birth date", date(data.birthDate)),
    row("Record reference", data.recordId),
    row("Dam", data.damLabel),
    row("Dam identification", data.damId),
    row("Dam age / condition", [value(data.damAge), value(data.damCondition)].filter((part) => part !== "—").join(" · ") || "—"),
    row("Sire / sire reference", data.sire),
    row("Sire breed", data.sireBreed),
    row("Conception method", data.conceptionMethod)
  ].join(""))}
  ${offspringTable(data.offspring)}
  ${table("Delivery and attendance", [
    row("Ease score", data.ease),
    row("Assistance required", data.assistance),
    row("Assistance type", data.assistanceType),
    row("Vet / practice", data.vet),
    row("Recorded by", data.operator),
    row("Dam complications", data.complications)
  ].join(""))}
  ${table("Care, registration and welfare", [
    row("Colostrum within 2 hours", yesNo(data.colostrumWithin2Hours)),
    row("Colostrum within 6 hours", yesNo(data.colostrumWithin6Hours)),
    row("Colostrum source", data.colostrumSource),
    row("First-feed volume", data.colostrumVolume == null || data.colostrumVolume === "" ? "—" : `${value(data.colostrumVolume)} L`),
    row("Fostering", data.fostering),
    row("Offspring disposition", data.disposition),
    row("Passport / EID / LIS registration", data.registration),
    row("Perinatal disposal", data.perinatalDisposal),
    ...organicRows ? [organicRows] : [],
    row("Attachments / photo evidence", data.attachmentCount == null ? "—" : `${data.attachmentCount} attachment${data.attachmentCount === 1 ? "" : "s"}`),
    row("Notes", data.notes)
  ].join(""))}
  <div class="section-head">Sign-off</div>
  <div class="signature-row">
    <div class="signature-box">Recorded by / signature<span>Date</span></div>
    <div class="signature-box">Reviewed by / signature<span>Date</span></div>
  </div>`;
}
function printBirthRecordReport(data) {
  const title = `${SPECIES_LABELS[data.species]} — Farm Birth Record`;
  printProReport({
    title,
    subtitle: `${SPECIES_LABELS[data.species]} event for ${value(data.damLabel)}`,
    farmName: data.farmName,
    farmAddress: data.farmAddress,
    contactPhone: data.contactPhone,
    cphNumber: data.cphNumber ?? void 0,
    sbiNumber: data.sbiNumber ?? void 0,
    additionalReferences: [{ label: "Record reference", value: String(data.recordId) }],
    recordCount: 1,
    recordLabel: "birth event",
    tableHtml: buildBirthRecordTable(data),
    footerNote: "Farm Birth Record produced by BDE Farm Trac. Not an official statutory certificate.",
    landscape: true
  });
}
export {
  printBirthRecordReport as p
};
