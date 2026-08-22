import { getIncomeSummaryYears, hasCompletionDateInYear } from "@/lib/agri-env-income-summary";

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
});