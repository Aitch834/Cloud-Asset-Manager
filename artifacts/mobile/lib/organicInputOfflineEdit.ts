export const ORGANIC_INPUT_EDIT_RECORD_TYPE = "bde_organic_input_edits";

export interface QueuedOrganicInputEdit {
  farmId: string;
  serverRecordId: number;
  changes: Record<string, unknown>;
}

/**
 * Validate persisted queue data before it can affect either the list UI or a
 * server record. Queue storage survives app upgrades, so callers must not
 * assume its JSON still has the current shape.
 */
export function parseQueuedOrganicInputEdit(value: unknown): QueuedOrganicInputEdit | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const farmId = typeof candidate.farmId === "string" ? candidate.farmId.trim() : "";
  const rawServerRecordId = candidate.serverRecordId;
  const serverRecordId = typeof rawServerRecordId === "number"
    ? rawServerRecordId
    : typeof rawServerRecordId === "string"
      ? Number(rawServerRecordId)
      : Number.NaN;
  const changes = candidate.changes;

  if (
    !farmId ||
    !Number.isInteger(serverRecordId) ||
    serverRecordId <= 0 ||
    !changes ||
    typeof changes !== "object" ||
    Array.isArray(changes) ||
    Object.keys(changes).length === 0
  ) {
    return null;
  }

  const typedChanges = changes as Record<string, unknown>;
  if (typeof typedChanges.productName !== "string" || !typedChanges.productName.trim()) {
    return null;
  }

  return { farmId, serverRecordId, changes: typedChanges };
}