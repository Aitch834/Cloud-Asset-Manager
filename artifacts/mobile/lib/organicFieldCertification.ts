export type CertificationNotice = {
  kind: "due-soon" | "eligible";
  date: Date;
};

export function certificationNotice(
  startDate: string | null | undefined,
  status: string,
  today = new Date(),
): CertificationNotice | null {
  if (!startDate || status !== "in-conversion") return null;

  const expectedDate = new Date(startDate);
  if (Number.isNaN(expectedDate.getTime())) return null;
  expectedDate.setFullYear(expectedDate.getFullYear() + 2);
  expectedDate.setHours(0, 0, 0, 0);

  const comparisonDate = new Date(today);
  comparisonDate.setHours(0, 0, 0, 0);
  const daysUntil = Math.round((expectedDate.getTime() - comparisonDate.getTime()) / 86400000);

  if (daysUntil <= 0) return { kind: "eligible", date: expectedDate };
  if (daysUntil <= 30) return { kind: "due-soon", date: expectedDate };
  return null;
}