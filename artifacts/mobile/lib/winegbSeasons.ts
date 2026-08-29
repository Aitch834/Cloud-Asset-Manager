export function winegbYearOf(date: string | null | undefined): string {
  if (!date) return "";
  const year = new Date(date).getFullYear();
  return Number.isInteger(year) ? String(year) : "";
}

export function buildWinegbSeasonYears(
  currentYear: number,
  historyYears: readonly number[],
  observationDates: readonly (string | null | undefined)[],
): string[] {
  return Array.from(new Set([
    String(currentYear),
    ...historyYears.filter(Number.isInteger).map(String),
    ...observationDates.map(winegbYearOf).filter(Boolean),
  ])).sort().reverse();
}

export function isWinegbMutationResultCurrent(
  requestSeasonYear: number,
  selectedSeasonYear: number,
): boolean {
  return requestSeasonYear === selectedSeasonYear;
}