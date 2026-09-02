import { describe, expect, it } from "vitest";
import { calculateAgriEnvDrawdown } from "./agri-env-drawdown";

describe("calculateAgriEnvDrawdown", () => {
  it("counts only valued active, applied, and pending projects", () => {
    const projects = [
      { id: 1, status: "active", totalGrantValuePence: 100_000 },
      { id: 2, status: "applied", totalGrantValuePence: 200_000 },
      { id: 3, status: "pending", totalGrantValuePence: 300_000 },
      { id: 4, status: "completed", totalGrantValuePence: 900_000 },
      { id: 5, status: "suspended", totalGrantValuePence: 800_000 },
      { id: 6, status: "withdrawn", totalGrantValuePence: 700_000 },
      { id: 7, status: "active", totalGrantValuePence: null },
    ];
    const milestones = [
      { projectId: 1, status: "paid", claimAmountPence: 25_000 },
      { projectId: 2, status: "paid", claimAmountPence: 50_000 },
      { projectId: 2, status: "submitted", claimAmountPence: 10_000 },
      { projectId: 3, status: "paid", claimAmountPence: 30_000 },
      { projectId: 3, status: "submitted", claimAmountPence: 30_000 },
      // These claims must not leak into the farm-wide card.
      { projectId: 4, status: "paid", claimAmountPence: 900_000 },
      { projectId: 5, status: "submitted", claimAmountPence: 800_000 },
      { projectId: 6, status: "paid", claimAmountPence: 700_000 },
      { projectId: 7, status: "paid", claimAmountPence: 999_999 },
    ];

    const summary = calculateAgriEnvDrawdown(projects, milestones);

    expect(summary.eligibleProjects.map((project) => project.id)).toEqual([
      1, 2, 3,
    ]);
    expect(summary.totalPence).toBe(600_000);
    expect(summary.paidPence).toBe(105_000);
    expect(summary.submittedPence).toBe(40_000);
    expect(summary.paidPercentage).toBe(18);
    expect(summary.submittedPercentage).toBe(7);
  });

  it("returns no card values when no project is eligible for drawdown", () => {
    const summary = calculateAgriEnvDrawdown(
      [
        { id: 1, status: "completed", totalGrantValuePence: 100_000 },
        { id: 2, status: "withdrawn", totalGrantValuePence: null },
      ],
      [{ projectId: 1, status: "paid", claimAmountPence: 100_000 }],
    );

    expect(summary.eligibleProjects).toHaveLength(0);
    expect(summary.totalPence).toBe(0);
    expect(summary.paidPence).toBe(0);
    expect(summary.submittedPence).toBe(0);
  });
});