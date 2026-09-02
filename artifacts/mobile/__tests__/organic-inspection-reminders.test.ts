import {
  getUpcomingInspectionReminders,
  type OrganicInspectionReminderRecord,
} from "../lib/organicInspectionReminders";

describe("organic inspection home-screen reminders", () => {
  const now = new Date("2026-09-02T12:00:00Z");

  function inspection(overrides: Partial<OrganicInspectionReminderRecord>): OrganicInspectionReminderRecord {
    return {
      id: 1,
      certifier: "Soil Association",
      inspectionDate: "2026-09-02",
      nextDueDate: "2026-09-10",
      ...overrides,
    };
  }

  it("clears a stale reminder when the newly logged inspection is due more than 90 days out", () => {
    const records = [
      inspection({ id: 1, inspectionDate: "2026-01-15", nextDueDate: "2026-09-10" }),
      inspection({ id: 2, inspectionDate: "2026-09-02", nextDueDate: "2026-12-02" }),
    ];

    expect(getUpcomingInspectionReminders(records, now)).toEqual([]);
  });

  it("keeps the reminder when the latest inspection is due within 90 days", () => {
    const records = [
      inspection({ id: 1, inspectionDate: "2026-01-15", nextDueDate: "2026-09-10" }),
      // 1 December 2026 is exactly 90 days after 2 September 2026.
      inspection({ id: 2, inspectionDate: "2026-09-02", nextDueDate: "2026-12-01" }),
    ];

    expect(getUpcomingInspectionReminders(records, now)).toEqual([
      {
        id: 2,
        certifier: "Soil Association",
        nextDueDate: "2026-12-01",
        isOverdue: false,
      },
    ]);
  });
});