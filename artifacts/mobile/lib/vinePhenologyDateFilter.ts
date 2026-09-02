export interface PhenologyDateRecord {
  observationDate: string | null;
}

/**
 * Normalise a grower-typed date to YYYY-MM-DD.
 * Accepts: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY.
 * Returns null when blank, still being typed, unparseable, or an impossible
 * calendar date (e.g. 31 Feb or 30 Feb).
 */
export function canonicalisePhenologyDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let y: string, m: string, d: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    [y, m, d] = s.split("-") as [string, string, string];
  } else {
    const dmy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.exec(s);
    if (!dmy) return null;
    d = dmy[1]!; m = dmy[2]!; y = dmy[3]!;
  }
  const date = new Date(`${y}-${m}-${d}`);
  if (
    isNaN(date.getTime()) ||
    date.getUTCFullYear() !== parseInt(y, 10) ||
    date.getUTCMonth() + 1 !== parseInt(m, 10) ||
    date.getUTCDate() !== parseInt(d, 10)
  ) {
    return null;
  }
  return `${y}-${m}-${d}`;
}

/**
 * Keep incomplete input neutral while a grower is still typing. Once the
 * field has reached eight characters, invalid input is surfaced as an error.
 */
export function isPhenologyDateInvalid(raw: string): boolean {
  return raw.trim().length >= 8 && canonicalisePhenologyDate(raw) === null;
}

/**
 * Apply only complete, valid date bounds. Partial or invalid input is ignored
 * so it cannot narrow the list while a grower is midway through typing.
 */
export function filterPhenologyRecordsByDateRange<T extends PhenologyDateRecord>(
  records: readonly T[],
  fromRaw: string,
  toRaw: string,
): T[] {
  const from = canonicalisePhenologyDate(fromRaw);
  const to = canonicalisePhenologyDate(toRaw);
  let result = records;
  if (from) result = result.filter(r => r.observationDate && r.observationDate >= from);
  if (to) result = result.filter(r => r.observationDate && r.observationDate <= to);
  return [...result];
}