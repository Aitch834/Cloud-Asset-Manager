export interface MastitisCsvRecord {
  onsetDate: string;
  earTagNumber?: string | null;
  quartersAffected?: string | null;
  clinicalGrade?: string | null;
  bacterialCultureResult?: string | null;
  sccAtOnset?: number | null;
  treatmentProduct?: string | null;
  treatmentStartDate?: string | null;
  treatmentDurationDays?: number | string | null;
  withdrawalEndDate?: string | null;
  vetConsulted?: boolean | null;
  vetName?: string | null;
  outcome?: string | null;
  outcomeDate?: string | null;
  notes?: string | null;
}

const CSV_FORMULA_STARTERS = /^[=+\-@|%\t\r]/;

function quoteCsvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = CSV_FORMULA_STARTERS.test(raw) ? `\t${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function formatCsvDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
}

/**
 * Builds the mobile mastitis register from the dairy API's actual record shape.
 * Keep this model in sync with dairyMastitisRecordsTable and the offline form.
 */
export function buildMastitisCsv(records: MastitisCsvRecord[]): string {
  const rows: unknown[][] = [
    [
      "Onset Date",
      "Ear Tag",
      "Quarter(s) Affected",
      "Clinical Grade",
      "Bacterial Culture",
      "SCC at Onset (k/mL)",
      "Treatment Product",
      "Treatment Start Date",
      "Treatment Duration (days)",
      "Withdrawal End Date",
      "Vet Consulted",
      "Vet Name",
      "Outcome",
      "Outcome Date",
      "Notes",
    ],
    ...records.map((r) => [
      formatCsvDate(r.onsetDate),
      r.earTagNumber ?? "",
      r.quartersAffected ?? "",
      r.clinicalGrade ?? "",
      r.bacterialCultureResult ?? "",
      r.sccAtOnset != null ? String(r.sccAtOnset) : "",
      r.treatmentProduct ?? "",
      formatCsvDate(r.treatmentStartDate),
      r.treatmentDurationDays != null ? String(r.treatmentDurationDays) : "",
      formatCsvDate(r.withdrawalEndDate),
      r.vetConsulted ? "Yes" : "No",
      r.vetName ?? "",
      r.outcome ?? "",
      formatCsvDate(r.outcomeDate),
      r.notes ?? "",
    ]),
  ];

  return `\uFEFF${rows
    .map((row) => row.map(quoteCsvCell).join(","))
    .join("\r\n")}`;
}