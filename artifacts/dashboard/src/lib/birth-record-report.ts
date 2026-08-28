import { escapeHtml, printProReport } from "@/lib/print-report";

export type BirthSpecies = "cattle" | "sheep" | "goat";

export interface BirthOffspring {
  label: string;
  outcome?: string | number | null;
  sex?: string | number | null;
  tag?: string | number | null;
  eid?: string | number | null;
  animalId?: string | number | null;
  weightKg?: string | number | null;
  colostrum?: string | null;
}

export interface BirthRecordReportData {
  species: BirthSpecies;
  recordId: string | number;
  farmName?: string;
  farmAddress?: string;
  contactPhone?: string;
  cphNumber?: string | null;
  sbiNumber?: string | null;
  birthDate?: string | null;
  damLabel?: string | null;
  damId?: string | number | null;
  damAge?: string | number | null;
  damCondition?: string | null;
  offspring: BirthOffspring[];
  sire?: string | number | null;
  sireBreed?: string | null;
  conceptionMethod?: string | null;
  ease?: string | number | null;
  assistance?: string | boolean | null;
  assistanceType?: string | null;
  vet?: string | null;
  operator?: string | null;
  complications?: string | null;
  colostrumWithin2Hours?: boolean | null;
  colostrumWithin6Hours?: boolean | null;
  colostrumSource?: string | null;
  colostrumVolume?: string | number | null;
  fostering?: string | boolean | null;
  disposition?: string | null;
  registration?: string | null;
  perinatalDisposal?: string | null;
  notes?: string | null;
  attachmentCount?: number | null;
  organic?: {
    statusConfirmed?: boolean | null;
    colostrumFromOrganicDoe?: boolean | null;
  };
}

const SPECIES_LABELS: Record<BirthSpecies, string> = {
  cattle: "Calving",
  sheep: "Lambing",
  goat: "Kidding",
};

function value(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value).replace(/_/g, " ");
}

function date(valueToFormat: unknown): string {
  if (!valueToFormat) return "—";
  const parsed = new Date(String(valueToFormat));
  return Number.isNaN(parsed.getTime()) ? value(valueToFormat) : parsed.toLocaleDateString("en-GB");
}

function yesNo(valueToFormat: boolean | null | undefined): string {
  return valueToFormat == null ? "—" : valueToFormat ? "Yes" : "No";
}

function row(label: string, content: unknown): string {
  return `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value(content))}</td></tr>`;
}

function table(title: string, rows: string): string {
  return `<div class="section-head">${escapeHtml(title)}</div><table><tbody>${rows}</tbody></table>`;
}

function offspringTable(offspring: BirthOffspring[]): string {
  const rows = offspring.length
    ? offspring.map((child) => `<tr>
        <td>${escapeHtml(child.label)}</td>
        <td>${escapeHtml(value(child.outcome))}</td>
        <td>${escapeHtml(value(child.sex))}</td>
        <td>${escapeHtml(value(child.tag))}</td>
        <td>${escapeHtml(value(child.eid))}</td>
        <td>${escapeHtml(value(child.animalId))}</td>
        <td>${escapeHtml(child.weightKg == null || child.weightKg === "" ? "—" : `${value(child.weightKg)} kg`)}</td>
        <td>${escapeHtml(value(child.colostrum))}</td>
      </tr>`).join("")
    : `<tr><td colspan="8">No offspring details recorded.</td></tr>`;

  return `<div class="section-head">Offspring details</div>
    <table class="offspring-table">
      <thead><tr><th>Offspring</th><th>Outcome</th><th>Sex</th><th>Tag</th><th>EID</th><th>Animal ID</th><th>Birth weight</th><th>Colostrum</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function buildBirthRecordTable(data: BirthRecordReportData): string {
  const title = SPECIES_LABELS[data.species];
  const organicRows = data.organic
    ? row("Organic status confirmed", yesNo(data.organic.statusConfirmed)) +
      row("Colostrum from organic doe", yesNo(data.organic.colostrumFromOrganicDoe))
    : "";

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
    row("Conception method", data.conceptionMethod),
  ].join(""))}
  ${offspringTable(data.offspring)}
  ${table("Delivery and attendance", [
    row("Ease score", data.ease),
    row("Assistance required", data.assistance),
    row("Assistance type", data.assistanceType),
    row("Vet / practice", data.vet),
    row("Recorded by", data.operator),
    row("Dam complications", data.complications),
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
    row("Notes", data.notes),
  ].join(""))}
  <div class="section-head">Sign-off</div>
  <div class="signature-row">
    <div class="signature-box">Recorded by / signature<span>Date</span></div>
    <div class="signature-box">Reviewed by / signature<span>Date</span></div>
  </div>`;
}

export function printBirthRecordReport(data: BirthRecordReportData): void {
  const title = `${SPECIES_LABELS[data.species]} — Farm Birth Record`;
  printProReport({
    title,
    subtitle: `${SPECIES_LABELS[data.species]} event for ${value(data.damLabel)}`,
    farmName: data.farmName,
    farmAddress: data.farmAddress,
    contactPhone: data.contactPhone,
    cphNumber: data.cphNumber ?? undefined,
    sbiNumber: data.sbiNumber ?? undefined,
    additionalReferences: [{ label: "Record reference", value: String(data.recordId) }],
    recordCount: 1,
    recordLabel: "birth event",
    tableHtml: buildBirthRecordTable(data),
    footerNote: "Farm Birth Record produced by BDE Farm Trac. Not an official statutory certificate.",
    landscape: true,
  });
}