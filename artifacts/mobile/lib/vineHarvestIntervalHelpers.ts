export interface SprayDiaryRecord {
  id: number;
  applicationDate: string | null;
  blockId: number | null;
  productName: string | null;
  harvestIntervalDays: number | null;
}

export interface HarvestIntervalWarning {
  id: number;
  productName: string;
  expiryDate: string;
}

export function getHarvestIntervalExpiry(
  applicationDate: string | null,
  intervalDays: number | null,
): string | null {
  const date = String(applicationDate ?? "").slice(0, 10);
  const days = Number(intervalDays);
  if (!date || !Number.isFinite(days)) return null;
  const expiry = new Date(`${date}T12:00:00`);
  if (Number.isNaN(expiry.getTime())) return null;
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString().slice(0, 10);
}

export function getActiveHarvestIntervalWarnings(
  sprays: SprayDiaryRecord[],
  blockId: number | null,
  harvestDate: string,
): HarvestIntervalWarning[] {
  const targetDate = harvestDate.slice(0, 10);
  if (!blockId || !targetDate) return [];
  return sprays.flatMap(spray => {
    if (String(spray.blockId) !== String(blockId)) return [];
    const expiryDate = getHarvestIntervalExpiry(spray.applicationDate, spray.harvestIntervalDays);
    if (!expiryDate || expiryDate <= targetDate) return [];
    return [{
      id: spray.id,
      productName: spray.productName?.trim() || "Unnamed spray product",
      expiryDate,
    }];
  });
}

export function getHarvestIntervalWarningKey(warnings: HarvestIntervalWarning[]): string {
  return warnings.map(warning => `${warning.id}:${warning.expiryDate}`).join("|");
}

export function isHarvestIntervalSaveBlocked(
  warnings: HarvestIntervalWarning[],
  acknowledgedWarningKey: string,
): boolean {
  return warnings.length > 0 && acknowledgedWarningKey !== getHarvestIntervalWarningKey(warnings);
}

export function formatIntervalExpiry(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB");
}
