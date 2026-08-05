/**
 * Strips fields that must never be user-writable from an update body.
 * Apply before every db.update().set() call to prevent mass-assignment attacks.
 *
 * Protected fields that are always stripped:
 *   id, farmId, tenantId, createdAt, updatedAt, deletedAt
 *
 * Date handling:
 *   Any string value that looks like an ISO 8601 date or datetime
 *   (e.g. "2025-06-01" or "2025-06-01T00:00:00.000Z") is converted to a
 *   SafeDate — a Date subclass that keeps the original string.
 *
 *   Why not a plain Date?  Routes that write to Postgres `date` columns
 *   often String()-coerce the value; String(new Date(...)) yields
 *   "Thu Jul 02 2026 ... (Coordinated Universal Time)" which Postgres
 *   rejects with error 22007.  SafeDate.toString() returns the original
 *   ISO string instead, so String()/template-literal coercion is always
 *   safe for `date` columns.
 *
 *   Why not a plain string?  Drizzle `timestamp` columns (default
 *   mode: "date") call value.toISOString() internally and throw
 *   "value.toISOString is not a function" if given a plain string.
 *   SafeDate is a real Date, so those columns keep working.
 *
 *   Net effect: new routes can use the sanitised value directly for BOTH
 *   `date` columns (via String coercion or Drizzle string-mode) and
 *   `timestamp` columns (as a Date object) without any per-route
 *   normaliser like nd().
 *
 * Usage:
 *   db.update(someTable).set(sanitiseBody(req.body)).where(...)
 */

const PROTECTED_FIELDS = new Set([
  "id",
  "farmId",
  "tenantId",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "farm_id",
  "tenant_id",
  "created_at",
  "updated_at",
  "deleted_at",
]);

/** Returns true for strings that look like ISO 8601 dates / datetimes. */
function isIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  // Match YYYY-MM-DD or YYYY-MM-DDTHH:mm... but not arbitrary short strings
  return /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]*)?$/.test(value);
}

/**
 * Returns true only if the YYYY-MM-DD prefix of an ISO date/datetime string
 * is a real calendar date. JS Date parsing silently rolls invalid dates
 * (e.g. "2025-02-30" → 2 March), so we verify the parsed UTC components
 * round-trip to the original year/month/day.
 */
export function isValidCalendarDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * A Date that remembers the ISO string it was parsed from.
 *
 * - `instanceof Date` → true, `.toISOString()` etc. all work, so Drizzle
 *   `timestamp` columns and the pg driver treat it exactly like a Date.
 * - `String(value)` / `${value}` / `.toString()` return the ORIGINAL ISO
 *   string (e.g. "2025-06-01"), so coercion into Postgres `date` columns
 *   can never produce the locale-verbose format Postgres rejects (22007).
 */
export class SafeDate extends Date {
  readonly raw: string;

  constructor(raw: string) {
    super(raw);
    this.raw = raw;
  }

  override toString(): string {
    return this.raw;
  }

  override toJSON(): string {
    return this.raw;
  }
}

/**
 * Thrown by sanitiseBody when a date-looking field is not a real calendar
 * date (e.g. "2025-02-30"). The central error handler in app.ts converts
 * this into a 400 response naming the field, so the user learns their date
 * was rejected instead of the record silently saving with a blank field.
 */
export class InvalidDateFieldError extends Error {
  readonly field: string;
  readonly value: string;

  constructor(field: string, value: string) {
    const label = humaniseFieldName(field);
    super(
      `"${value.slice(0, 10)}" is not a real calendar date — please correct the ${label} field.`,
    );
    this.name = "InvalidDateFieldError";
    this.field = field;
    this.value = value;
  }
}

/** "harvestDate" → "harvest date"; "due_date" → "due date". */
function humaniseFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitiseBody(body: unknown): any {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (!PROTECTED_FIELDS.has(key)) {
      // Convert ISO date strings → SafeDate: a Date for Drizzle timestamp
      // columns, whose String() coercion still yields the original ISO string
      // so `date` columns are safe too.
      if (isIsoDateString(value)) {
        // Reject calendar-invalid dates (Feb 30, month 13, ...) explicitly:
        // JS Date parsing would either roll them forward or accept them as
        // strings downstream, saving dates the user never intended. Throwing
        // (instead of nulling) surfaces a 400 to the user via the central
        // error handler, rather than silently saving the field blank.
        if (!isValidCalendarDate(value)) {
          throw new InvalidDateFieldError(key, value);
        }
        const d = new SafeDate(value);
        result[key] = isNaN(d.getTime()) ? null : d;
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
