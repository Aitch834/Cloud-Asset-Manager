import {
  formatAgriEnvMilestoneStatus,
  getAgriEnvMilestoneSections,
} from "../lib/agri-env-milestone-sections";

describe("mobile agri-environment milestone sections", () => {
  const now = new Date("2026-09-02T12:00:00Z");
  const milestones = [
    {
      id: 1,
      projectId: 10,
      milestoneName: "Hedgerow management",
      dueDate: "2026-08-15",
      status: "paid",
      schemeName: "Countryside Stewardship",
    },
    {
      id: 2,
      projectId: 10,
      milestoneName: "Soil improvement",
      dueDate: "2026-08-20",
      status: "completed",
      schemeName: "Countryside Stewardship",
    },
    {
      id: 3,
      projectId: 10,
      milestoneName: "Evidence submission",
      dueDate: "2026-09-20",
      status: "pending",
      schemeName: "Countryside Stewardship",
    },
    {
      id: 4,
      projectId: 10,
      milestoneName: "Overdue evidence",
      dueDate: "2026-08-25",
      status: "overdue",
      schemeName: "Countryside Stewardship",
    },
  ];

  it("includes all past milestones with their status and leaves future milestones in upcoming", () => {
    const sections = getAgriEnvMilestoneSections(milestones, now);

    expect(sections.past.map(({ milestoneName, status }) => ({ milestoneName, status }))).toEqual([
      { milestoneName: "Soil improvement", status: "completed" },
      { milestoneName: "Hedgerow management", status: "paid" },
    ]);
    expect(sections.upcoming.map(({ milestoneName, status }) => ({ milestoneName, status }))).toEqual([
      { milestoneName: "Overdue evidence", status: "overdue" },
      { milestoneName: "Evidence submission", status: "pending" },
    ]);
  });

  it("keeps open overdue milestones in the actionable section without duplicating them in history", () => {
    const sections = getAgriEnvMilestoneSections(milestones, now);

    expect(sections.upcoming.some((milestone) => milestone.id === 4)).toBe(true);
    expect(sections.past.some((milestone) => milestone.id === 4)).toBe(false);
  });

  it("formats stored status values for mobile display", () => {
    expect(formatAgriEnvMilestoneStatus("in-review")).toBe("In review");
    expect(formatAgriEnvMilestoneStatus("paid")).toBe("Paid");
  });
});