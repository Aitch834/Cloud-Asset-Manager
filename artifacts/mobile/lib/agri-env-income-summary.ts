export interface IncomeSummaryMilestone {
  projectId: number;
  status: string;
  completionDate: string | null;
}

export function hasCompletionDateInYear(completionDate: string | null, year: number): boolean {
  return typeof completionDate === "string" && completionDate.slice(0, 4) === String(year);
}

export function getIncomeSummaryYears(
  milestones: IncomeSummaryMilestone[],
  includedProjectIds: Set<number>,
  currentYear: number,
): number[] {
  const incomeStatuses = new Set(["paid", "submitted"]);

  return Array.from(new Set([
    currentYear,
    ...milestones
      .filter(m => incomeStatuses.has(m.status) && includedProjectIds.has(m.projectId) && m.completionDate)
      .map(m => Number(m.completionDate!.slice(0, 4)))
      .filter(year => Number.isInteger(year) && year >= 1900 && year <= currentYear + 1),
  ])).sort((a, b) => b - a);
}