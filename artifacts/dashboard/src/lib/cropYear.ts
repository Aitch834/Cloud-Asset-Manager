/**
 * UK crop year utility.
 * Crop Year Y runs from 1 August of year (Y-1) to 31 July of year Y.
 * Label = harvest year. e.g. "Crop Year 2026" = 1 Aug 2025 – 31 Jul 2026.
 */

export function currentCropYear(): number {
  const now = new Date();
  const month = now.getMonth() + 1;
  return month >= 8 ? now.getFullYear() + 1 : now.getFullYear();
}

export function cropYearLabel(year: number): string {
  if (year === 0) return "All years";
  return `${year - 1}/${String(year).slice(2)}`;
}

export function cropYearStart(year: number): Date {
  return new Date(year - 1, 7, 1);
}

export function cropYearEnd(year: number): Date {
  return new Date(year, 6, 31, 23, 59, 59, 999);
}

export function isInCropYear(dateStr: string | null | undefined, year: number): boolean {
  if (!dateStr) return false;
  if (year === 0) return true;
  const d = new Date(dateStr);
  return d >= cropYearStart(year) && d <= cropYearEnd(year);
}

export function cropYearOptions(count = 7): number[] {
  const current = currentCropYear();
  return Array.from({ length: count }, (_, i) => current - i);
}
