export type ScoutingDueDateStatus =
  | "scheduled"
  | "overdue"
  | "today"
  | "missing"
  | "malformed";

export interface ScoutingDueDate {
  status: ScoutingDueDateStatus;
  label: string;
}

function localDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function validIsoDateKey(value: string): string | null {
  const key = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    ? key
    : null;
}

export function formatScoutingDueDate(
  value: string | null | undefined,
  formatDate: (date: string) => string,
  today = new Date(),
): ScoutingDueDate {
  if (!value) {
    return { status: "missing", label: "Next: Not scheduled" };
  }

  const dateKey = validIsoDateKey(value);
  const formattedDate = formatDate(value);
  if (!dateKey) {
    return { status: "malformed", label: `Next: ${formattedDate}` };
  }

  const todayKey = localDateKey(today);
  if (dateKey < todayKey) {
    return { status: "overdue", label: `Overdue · ${formattedDate}` };
  }
  if (dateKey === todayKey) {
    return { status: "today", label: `Next: ${formattedDate}` };
  }
  return { status: "scheduled", label: `Next: ${formattedDate}` };
}