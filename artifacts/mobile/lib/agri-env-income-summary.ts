export interface IncomeSummaryMilestone {
  projectId: number;
  status: string;
  completionDate: string | null;
  claimAmountPence?: number | null;
}

export function hasCompletionDateInYear(completionDate: string | null, year: number): boolean {
  return typeof completionDate === "string" && completionDate.slice(0, 4) === String(year);
}

export interface PaidIncomeSummary {
  farmPaidPence: number;
  paidPenceByProject: Map<number, number>;
}

export function getPaidIncomeSummary(
  milestones: IncomeSummaryMilestone[],
  includedProjectIds: Set<number>,
  year: number | "all",
): PaidIncomeSummary {
  const paidPenceByProject = new Map<number, number>();

  for (const milestone of milestones) {
    if (
      milestone.status !== "paid"
      || !includedProjectIds.has(milestone.projectId)
      || (year !== "all" && !hasCompletionDateInYear(milestone.completionDate, year))
    ) {
      continue;
    }

    paidPenceByProject.set(
      milestone.projectId,
      (paidPenceByProject.get(milestone.projectId) ?? 0) + (milestone.claimAmountPence ?? 0),
    );
  }

  return {
    farmPaidPence: Array.from(paidPenceByProject.values()).reduce((sum, amount) => sum + amount, 0),
    paidPenceByProject,
  };
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