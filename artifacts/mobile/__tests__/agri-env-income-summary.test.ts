import {
  getIncomeSummaryYears,
  getPaidIncomeSummary,
  hasCompletionDateInYear,
} from "@/lib/agri-env-income-summary";

describe("agri-environment income summary years", () => {
  it("includes a historic year with submitted-only income", () => {
    const years = getIncomeSummaryYears([
      { projectId: 1, status: "submitted", completionDate: "2024-11-15" },
      { projectId: 1, status: "paid", completionDate: "2026-03-03" },
      { projectId: 2, status: "submitted", completionDate: "2023-09-20" },
      { projectId: 1, status: "pending", completionDate: "2025-01-10" },
    ], new Set([1]), 2026);

    expect(years).toEqual([2026, 2024]);
    expect(hasCompletionDateInYear("2024-11-15", 2024)).toBe(true);
    expect(hasCompletionDateInYear("2024-11-15", 2026)).toBe(false);
  });

  it("recalculates farm-wide and per-project paid totals when the income year changes", () => {
    const currentYear = 2026;
    const milestones = [
      { projectId: 1, status: "paid", completionDate: "2026-02-12", claimAmountPence: 12_500 },
      { projectId: 2, status: "paid", completionDate: "2026-08-03", claimAmountPence: 7_500 },
      { projectId: 1, status: "paid", completionDate: "2024-11-15", claimAmountPence: 4_000 },
      { projectId: 2, status: "paid", completionDate: "2024-04-21", claimAmountPence: 6_000 },
      { projectId: 2, status: "submitted", completionDate: "2024-09-01", claimAmountPence: 99_000 },
      { projectId: 3, status: "paid", completionDate: "2026-01-01", claimAmountPence: 50_000 },
    ];
    const includedProjectIds = new Set([1, 2]);
    const availableYears = getIncomeSummaryYears(milestones, includedProjectIds, currentYear);

    expect(availableYears).toEqual([2026, 2024]);

    let selectedYear = currentYear;
    let summary = getPaidIncomeSummary(milestones, includedProjectIds, selectedYear);

    expect(summary.farmPaidPence).toBe(20_000);
    expect(summary.paidPenceByProject.get(1)).toBe(12_500);
    expect(summary.paidPenceByProject.get(2)).toBe(7_500);

    selectedYear = availableYears[1];
    summary = getPaidIncomeSummary(milestones, includedProjectIds, selectedYear);

    expect(summary.farmPaidPence).toBe(10_000);
    expect(summary.paidPenceByProject.get(1)).toBe(4_000);
    expect(summary.paidPenceByProject.get(2)).toBe(6_000);
  });
});