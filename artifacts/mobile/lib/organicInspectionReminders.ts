export interface OrganicInspectionReminderRecord {
  id: number;
  certifier: string;
  inspectionDate?: string | null;
  nextDueDate?: string | null;
}

export interface OrganicInspectionReminder {
  id: number;
  certifier: string;
  nextDueDate: string;
  isOverdue: boolean;
}

/**
 * Return the latest inspection per certifier when its next inspection is due
 * today or within the next 90 days. Overdue inspections remain visible so
 * growers are not left without a reminder to act.
 */
export function getUpcomingInspectionReminders(
  records: OrganicInspectionReminderRecord[],
  now: Date = new Date(),
): OrganicInspectionReminder[] {
  // Pick only the most recent inspection per certifier to avoid stale
  // next-due dates remaining visible after a new inspection is logged.
  const latestByCertifier = new Map<string, OrganicInspectionReminderRecord>();
  for (const record of records) {
    const existing = latestByCertifier.get(record.certifier);
    if (
      !existing ||
      // A dated record always beats an undated existing record.
      (!!record.inspectionDate && !existing.inspectionDate) ||
      // Both dated: later date wins; same date → higher ID wins.
      (!!record.inspectionDate && !!existing.inspectionDate &&
        (record.inspectionDate > existing.inspectionDate ||
          (record.inspectionDate === existing.inspectionDate && record.id > existing.id))) ||
      // Both undated: higher ID wins (best-available tie-breaker).
      (!record.inspectionDate && !existing.inspectionDate && record.id > existing.id)
    ) {
      latestByCertifier.set(record.certifier, record);
    }
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 90);

  return Array.from(latestByCertifier.values())
    .filter((record) => {
      if (!record.nextDueDate) return false;
      const due = new Date(record.nextDueDate);
      return due < today || due <= horizon;
    })
    .map((record) => ({
      id: record.id,
      certifier: record.certifier,
      nextDueDate: record.nextDueDate as string,
      isOverdue: new Date(record.nextDueDate as string) < today,
    }))
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 5);
}