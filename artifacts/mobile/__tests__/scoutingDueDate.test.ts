import { formatScoutingDueDate } from "../lib/scoutingDueDate";

const formatDate = (value: string) => `[${value}]`;
const today = new Date(2026, 8, 11, 12);

describe("formatScoutingDueDate", () => {
  it.each([
    ["scheduled", "2026-09-12", "scheduled", "Next: [2026-09-12]"],
    ["overdue", "2026-09-10", "overdue", "Overdue · [2026-09-10]"],
    ["today", "2026-09-11", "today", "Next: [2026-09-11]"],
  ])("formats a %s return date", (_case, value, status, label) => {
    expect(formatScoutingDueDate(value, formatDate, today)).toEqual({ status, label });
  });

  it.each([null, undefined, ""])("formats a missing return date", value => {
    expect(formatScoutingDueDate(value, formatDate, today)).toEqual({
      status: "missing",
      label: "Next: Not scheduled",
    });
  });

  it.each(["not-a-date", "2026-02-30", "2026-13-01"])(
    "keeps malformed return date wording non-overdue: %s",
    value => {
      expect(formatScoutingDueDate(value, formatDate, today)).toEqual({
        status: "malformed",
        label: `Next: [${value}]`,
      });
    },
  );
});