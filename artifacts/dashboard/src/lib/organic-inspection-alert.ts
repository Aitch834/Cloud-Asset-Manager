export const ORGANIC_COMPLIANCE_MODULE_KEY = "organic-compliance";

export interface OrganicInspectionAlertRecord {
  id: number;
  certifier: string;
  inspectionDate: string | null;
  nextDueDate: string | null;
}

export interface OrganicInspectionAlert extends OrganicInspectionAlertRecord {
  days: number;
}

export function hasOrganicComplianceModule(activeSubscriptions: string[]): boolean {
  return activeSubscriptions.includes(ORGANIC_COMPLIANCE_MODULE_KEY);
}

function daysUntil(dateStr: string, today: Date): number {
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  const currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);
  return Math.round((dueDate.getTime() - currentDate.getTime()) / 86400000);
}

export function getOrganicInspectionAlerts(
  records: OrganicInspectionAlertRecord[],
  today = new Date(),
): OrganicInspectionAlert[] {
  const currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);
  const in60Days = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000);

  // For each certifier, only the most recent inspection's nextDueDate is the
  // current live deadline. Earlier records' nextDueDates are historical and
  // must not be surfaced as active alerts.
  const latestByCertifier = new Map<string, OrganicInspectionAlertRecord>();
  for (const record of records) {
    const existing = latestByCertifier.get(record.certifier);
    if (
      !existing ||
      (record.inspectionDate &&
        (!existing.inspectionDate || record.inspectionDate > existing.inspectionDate))
    ) {
      latestByCertifier.set(record.certifier, record);
    }
  }

  return Array.from(latestByCertifier.values())
    .filter(record => record.nextDueDate != null)
    .map(record => ({
      ...record,
      days: daysUntil(record.nextDueDate!, currentDate),
    }))
    .filter(record => {
      const dueDate = new Date(record.nextDueDate!);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() <= in60Days.getTime();
    })
    .sort((a, b) => a.days - b.days);
}