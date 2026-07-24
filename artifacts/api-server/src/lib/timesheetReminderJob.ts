import { db } from "@workspace/db";
import {
  farmsTable,
  farmMembersTable,
  labourRotaTable,
  labourTimesheetEntriesTable,
  tenantsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sendSms } from "./sms";

const DAY_SHIFT_KEYS = [
  "monShift", "tueShift", "wedShift", "thuShift",
  "friShift", "satShift", "sunShift",
] as const;

type RotaRow = {
  staffName: string;
  monShift: string | null;
  tueShift: string | null;
  wedShift: string | null;
  thuShift: string | null;
  friShift: string | null;
  satShift: string | null;
  sunShift: string | null;
};

const OFF_SHIFTS = new Set(["day-off", "holiday", "sick", "cancelled"]);

// Deduplication: track reminders sent per farm+phone+date
const sentToday = new Map<string, string>();

function getUKDateTime(): { hour: string; date: string } {
  const now = new Date();
  // Approximate BST detection (last Sun March → last Sun October)
  const month = now.getUTCMonth();
  const isBST = month >= 2 && month <= 9;
  const offsetHours = isBST ? 1 : 0;
  const ukMs = now.getTime() + offsetHours * 3_600_000;
  const ukNow = new Date(ukMs);
  const hour = String(ukNow.getUTCHours()).padStart(2, "0");
  const date = ukNow.toISOString().slice(0, 10);
  return { hour, date };
}

function getMondayOfWeek(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00Z");
  const dow = d.getUTCDay(); // 0=Sun
  const daysBack = dow === 0 ? 6 : dow - 1;
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

export async function runTimesheetReminderChecks(): Promise<void> {
  try {
    const { hour: currentHour, date: todayUK } = getUKDateTime();

    // Load all active non-sandbox farms
    const farms = await db
      .select({
        id: farmsTable.id,
        name: farmsTable.name,
        timesheetReminderTime: farmsTable.timesheetReminderTime,
      })
      .from(farmsTable)
      .innerJoin(tenantsTable, and(eq(farmsTable.tenantId, tenantsTable.id), eq(tenantsTable.isSandbox, false)))
      .where(eq(farmsTable.isActive, true));

    for (const farm of farms) {
      const reminderTime = farm.timesheetReminderTime ?? "18:00";
      const reminderHour = reminderTime.split(":")[0]?.padStart(2, "0") ?? "18";

      if (reminderHour !== currentHour) continue;

      const weekStart = getMondayOfWeek(todayUK);

      // Day-of-week index (0=Mon … 6=Sun) for today
      const d = new Date(todayUK + "T00:00:00Z");
      const dow = d.getUTCDay();
      const dayIndex = dow === 0 ? 6 : dow - 1;
      const shiftKey = DAY_SHIFT_KEYS[dayIndex];

      // Fetch rota, today's entries, and active staff with phones in parallel
      const [rota, entries, members] = await Promise.all([
        db
          .select()
          .from(labourRotaTable)
          .where(
            and(
              eq(labourRotaTable.farmId, farm.id),
              eq(labourRotaTable.weekStartDate, weekStart),
            ),
          ),
        db
          .select({ staffName: labourTimesheetEntriesTable.staffName })
          .from(labourTimesheetEntriesTable)
          .where(
            and(
              eq(labourTimesheetEntriesTable.farmId, farm.id),
              eq(labourTimesheetEntriesTable.date, todayUK),
            ),
          ),
        db
          .select({
            firstName: farmMembersTable.firstName,
            lastName: farmMembersTable.lastName,
            phone: farmMembersTable.phone,
          })
          .from(farmMembersTable)
          .where(
            and(
              eq(farmMembersTable.farmId, farm.id),
              eq(farmMembersTable.isActive, true),
            ),
          ),
      ]);

      const submittedNames = new Set(entries.map((e) => e.staffName));

      for (const member of members) {
        if (!member.phone) continue;

        const fullName = `${member.firstName} ${member.lastName}`.trim();

        // Must be rostered and working today
        const rotaEntry = rota.find((r) => r.staffName === fullName) as RotaRow | undefined;
        if (!rotaEntry || !shiftKey) continue;

        const shift = rotaEntry[shiftKey as keyof RotaRow] as string | null;
        if (!shift || OFF_SHIFTS.has(shift)) continue;

        // Already submitted
        if (submittedNames.has(fullName)) continue;

        // Deduplication
        const key = `${farm.id}:${member.phone}:${todayUK}`;
        if (sentToday.get(key) === todayUK) continue;

        const body =
          `Hi ${member.firstName}, reminder from BDE Farm Trac: please submit ` +
          `your timesheet for today (${todayUK}) before you finish. ` +
          `Open the app → Record → Labour Timesheet Entry. Thank you.`;

        const result = await sendSms(member.phone, body);
        if (result.sent) {
          sentToday.set(key, todayUK);
          console.log(
            `[TIMESHEET-REMINDER] Sent to ${fullName} at ${farm.name} (farm ${farm.id})`,
          );
        }
      }
    }
  } catch (err) {
    console.error("[TIMESHEET-REMINDER] Error:", err);
  }
}

export function startTimesheetReminderJob(): void {
  const INTERVAL_MS = 30 * 60 * 1000; // every 30 min — catches any configured hour
  runTimesheetReminderChecks();
  setInterval(runTimesheetReminderChecks, INTERVAL_MS);
  console.log("[TIMESHEET-REMINDER] Job scheduled (every 30 min)");
}
