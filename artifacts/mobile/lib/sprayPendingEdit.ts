import {
  getRecordById,
  replacePendingSyncItem,
  updatePendingSyncItem,
} from "./database";
import { STORAGE_KEYS } from "./storage";

export type PendingSpraySaveOutcome =
  | "pending_updated"
  | "server_edit_queued"
  | "server_record_unavailable";

interface SavePendingSprayRevisionOptions {
  localId: string;
  updatedRecord: Record<string, unknown>;
}

function positiveServerId(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Save a form opened from a pending spray record.
 *
 * If its create is still queued, replace that payload in place. If background
 * sync completed while the form was open, retain the resolved server ID and
 * queue this revision as a PUT instead of creating a duplicate application.
 */
export async function savePendingSprayRevision({
  localId,
  updatedRecord,
}: SavePendingSprayRevisionOptions): Promise<PendingSpraySaveOutcome> {
  const updated = await updatePendingSyncItem(
    STORAGE_KEYS.SPRAY_RECORDS,
    localId,
    updatedRecord,
  );
  if (updated) return "pending_updated";

  const localRecord = await getRecordById<Record<string, unknown>>(
    "spray_records",
    localId,
  );
  const serverRecordId = positiveServerId(localRecord?._serverRecordId);
  if (!serverRecordId) return "server_record_unavailable";

  await replacePendingSyncItem(
    STORAGE_KEYS.SPRAY_RECORDS,
    localId,
    {
      ...updatedRecord,
      _serverRecordId: serverRecordId,
    },
  );
  return "server_edit_queued";
}