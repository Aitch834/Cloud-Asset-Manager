import { getMilestoneDeadlineCounts } from "../lib/agri-env-deadline-summary";

describe("mobile agri-environment milestone deadline counts", () => {
  const now = new Date("2026-09-02T12:00:00Z");
  const projects = [
    { id: 101, schemeName: "Countryside Stewardship" },
    { id: 202, schemeName: "Sustainable Farming Incentive" },
  ];
  const milestones = [
    { projectId: 101, dueDate: "2026-08-20", status: "pending" },
    { projectId: 101, dueDate: "2026-09-15", status: "submitted" },
    { projectId: 202, dueDate: "2026-08-25", status: "overdue" },
    { projectId: 202, dueDate: "2026-09-20", status: "pending" },
    { projectId: 202, dueDate: "2026-09-10", status: "paid" },
  ];

  it("counts all schemes and scopes selected schemes without counting paid milestones", () => {
    expect(getMilestoneDeadlineCounts(projects, milestones, "", now)).toEqual({
      overdue: 2,
      upcoming: 2,
    });

    expect(getMilestoneDeadlineCounts(projects, milestones, "countryside", now)).toEqual({
      overdue: 1,
      upcoming: 1,
    });

    expect(getMilestoneDeadlineCounts(projects, milestones, "sustainable", now)).toEqual({
      overdue: 1,
      upcoming: 1,
    });
  });

  it("keeps scheme-scoped totals independent from the status chip", () => {
    const countsForStatusChip = ["all", "active", "completed"].map(() =>
      getMilestoneDeadlineCounts(projects, milestones, "countryside", now),
    );

    expect(countsForStatusChip).toEqual([
      { overdue: 1, upcoming: 1 },
      { overdue: 1, upcoming: 1 },
      { overdue: 1, upcoming: 1 },
    ]);
  });

  it("classifies today and the 30-day boundary without counting later or missing dates", () => {
    const project = [{ id: 303, schemeName: "Boundary Scheme" }];
    const countsFor = (dueDate: string | null) =>
      getMilestoneDeadlineCounts(
        project,
        [{ projectId: 303, dueDate, status: "pending" }],
        "",
        now,
      );

    expect(countsFor("2026-09-02")).toEqual({ overdue: 0, upcoming: 1 });
    expect(countsFor("2026-10-02")).toEqual({ overdue: 0, upcoming: 1 });
    expect(countsFor("2026-10-03")).toEqual({ overdue: 0, upcoming: 0 });
    expect(countsFor(null)).toEqual({ overdue: 0, upcoming: 0 });
  });
});