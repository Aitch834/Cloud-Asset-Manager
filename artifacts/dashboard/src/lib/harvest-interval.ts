function localMidnight(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getHarvestIntervalExpiryDate(
  applicationDate: unknown,
  harvestIntervalDays: unknown,
): Date | null {
  if (!applicationDate || harvestIntervalDays == null || harvestIntervalDays === "") return null;

  const hiDays = Number(harvestIntervalDays);
  if (!Number.isFinite(hiDays)) return null;

  const application = new Date(String(applicationDate));
  if (!Number.isFinite(application.getTime())) return null;

  const expiry = localMidnight(application);
  expiry.setDate(expiry.getDate() + hiDays);
  return expiry;
}

export function isHarvestIntervalActive(expiryDate: Date, today = new Date()): boolean {
  return expiryDate.getTime() > localMidnight(today).getTime();
}

export function formatHarvestInterval(
  applicationDate: unknown,
  harvestIntervalDays: unknown,
  today = new Date(),
): string {
  if (harvestIntervalDays == null || harvestIntervalDays === "") return "—";

  const hiDays = Number(harvestIntervalDays);
  if (!Number.isFinite(hiDays)) return String(harvestIntervalDays);

  const expiryDate = getHarvestIntervalExpiryDate(applicationDate, hiDays);
  if (!expiryDate) return `${hiDays}d`;

  const status = isHarvestIntervalActive(expiryDate, today) ? "expires" : "expired";
  return `${hiDays}d — ${status} ${expiryDate.toLocaleDateString("en-GB")}`;
}