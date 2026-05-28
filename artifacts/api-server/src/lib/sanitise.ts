/**
 * Strips fields that must never be user-writable from an update body.
 * Apply before every db.update().set() call to prevent mass-assignment attacks.
 *
 * Protected fields that are always stripped:
 *   id, farmId, tenantId, createdAt, updatedAt, deletedAt
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitiseBody(body: unknown): any {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (!PROTECTED_FIELDS.has(key)) {
      result[key] = value;
    }
  }
  return result;
}
