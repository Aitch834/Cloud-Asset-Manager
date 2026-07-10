/**
 * Strips fields that must never be user-writable from an update body.
 * Apply before every db.update().set() call to prevent mass-assignment attacks.
 *
 * Protected fields that are always stripped:
 *   id, farmId, tenantId, createdAt, updatedAt, deletedAt
 *
 * Date handling:
 *   Any string value that looks like an ISO 8601 date or datetime
 *   (e.g. "2025-06-01" or "2025-06-01T00:00:00.000Z") is automatically
 *   converted to a JavaScript Date object.  This is required because
 *   Drizzle's `timestamp` columns call value.toISOString() internally and
 *   will throw "value.toISOString is not a function" if given a plain string.
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitiseBody(body: unknown): any {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (!PROTECTED_FIELDS.has(key)) {
      // Convert ISO date strings → Date objects for Drizzle timestamp columns
      if (isIsoDateString(value)) {
        const d = new Date(value);
        result[key] = isNaN(d.getTime()) ? null : d;
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
