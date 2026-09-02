export type FpInputLogRow = Record<string, unknown>;

export const FP_INPUT_LOG_CSV_HEADERS = [
  "Date Applied",
  "Crop Year",
  "Input / Product",
  "Type",
  "Approval Status",
  "Expiry Date",
  "Days Remaining",
  "Supplier",
  "Qty Applied",
  "Unit",
  "Purpose",
  "Applied By",
  "Certifier Ref",
  "PO Ref",
  "GRN Ref",
  "Notes",
];

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function calendarDateFromValue(value: unknown): CalendarDate | null {
  if (typeof value === "string") {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      return {
        year: Number(isoDate[1]),
        month: Number(isoDate[2]),
        day: Number(isoDate[3]),
      };
    }
  }

  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function calendarDayNumber(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day) / 86_400_000;
}

/**
 * Return the number of calendar days from today to an input-log expiry date.
 *
 * Expiry dates are date values, not instants in time. Converting both sides to
 * UTC calendar-day numbers avoids 23/25-hour differences at UK DST changes
 * and also handles year-end rollover without relying on elapsed milliseconds.
 */
export function getFpInputLogDaysRemaining(
  expiryDate: unknown,
  today: Date = new Date(),
): number | null {
  if (!expiryDate) return null;

  const expiry = calendarDateFromValue(expiryDate);
  const current = calendarDateFromValue(today);
  if (!expiry || !current) return null;

  return calendarDayNumber(expiry) - calendarDayNumber(current);
}

function fmtDate(value: unknown): string {
  if (!value) return "";
  try {
    return new Date(value as string).toLocaleDateString("en-GB");
  } catch {
    return String(value);
  }
}

function needsDerogationColumn(row: FpInputLogRow): boolean {
  return row.approvalStatus === "restricted" || row.approvalStatus === "derogation";
}

export function buildFpInputLogCsvRows(
  rows: FpInputLogRow[],
  today: Date = new Date(),
): unknown[][] {
  return rows.map(row => {
    let expiryDate = "";
    let daysRemaining: string | number = "";
    if (needsDerogationColumn(row) && row.derogationExpiryDate) {
      expiryDate = fmtDate(row.derogationExpiryDate);
      daysRemaining = getFpInputLogDaysRemaining(row.derogationExpiryDate, today) ?? "";
    }
    return [
      fmtDate(row.applicationDate),
      row.cropYear != null ? String(row.cropYear) : "",
      row.inputName != null ? String(row.inputName) : "",
      row.inputType != null ? String(row.inputType) : "",
      row.approvalStatus != null ? String(row.approvalStatus) : "",
      expiryDate,
      daysRemaining,
      row.supplier != null ? String(row.supplier) : "",
      row.quantityApplied != null ? String(row.quantityApplied) : "",
      row.quantityUnit != null ? String(row.quantityUnit) : "",
      row.purposeOfUse != null ? String(row.purposeOfUse) : "",
      row.appliedBy != null ? String(row.appliedBy) : "",
      row.certifierApprovalRef != null ? String(row.certifierApprovalRef) : "",
      row.poReference != null ? String(row.poReference) : "",
      row.grnReference != null ? String(row.grnReference) : "",
      row.notes != null ? String(row.notes) : "",
    ];
  });
}

export function buildFpInputLogPrintRows(
  rows: FpInputLogRow[],
  today: Date = new Date(),
): string[] {
  return rows.map(row => {
    let derogCell = "—";
    let daysCell = "—";
    if (needsDerogationColumn(row) && row.derogationExpiryDate) {
      const formatted = new Date(row.derogationExpiryDate as string).toLocaleDateString("en-GB");
      const daysLeft = getFpInputLogDaysRemaining(row.derogationExpiryDate, today);
      derogCell = daysLeft != null && daysLeft < 0
        ? `<span class="expiry-expired">${formatted}</span>`
        : formatted;
      daysCell = daysLeft != null && daysLeft < 0
        ? `<span class="expiry-expired">${daysLeft}</span>`
        : String(daysLeft ?? "—");
    }
    return `
    <tr>
      <td>${row.applicationDate ? new Date(row.applicationDate as string).toLocaleDateString("en-GB") : "—"}</td>
      <td>${String(row.cropYear ?? "—")}</td>
      <td>${String(row.inputName ?? "—")}</td>
      <td>${String(row.inputType ?? "—")}</td>
      <td><span class="badge ${row.approvalStatus === 'permitted' ? 'badge-green' : row.approvalStatus === 'restricted' ? 'badge-yellow' : 'badge-red'}">${String(row.approvalStatus ?? "—")}</span></td>
      <td>${derogCell}</td>
      <td>${daysCell}</td>
      <td>${String(row.supplier ?? "—")}</td>
      <td>${row.quantityApplied ? String(row.quantityApplied) + ' ' + String(row.quantityUnit ?? "") : "—"}</td>
      <td>${String(row.purposeOfUse ?? "—")}</td>
      <td>${String(row.appliedBy ?? "—")}</td>
      <td>${String(row.certifierApprovalRef ?? "—")}</td>
      <td>${String(row.poReference ?? "—")}</td>
      <td>${String(row.grnReference ?? "—")}</td>
    </tr>`;
  });
}