import {
  getRecordById,
  replacePendingSyncItem,
  updatePendingSyncItem,
} from "./database";
import { STORAGE_KEYS } from "./storage";

export type PendingOrganicInputSaveOutcome =
  | "pending_updated"
  | "server_edit_queued"
  | "server_record_unavailable";

interface SavePendingOrganicInputRevisionOptions {
  localId: string;
  farmId: string;
  updatedRecord: unknown;
  changes: Record<string, unknown>;
}

function positiveServerId(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Save a form that was opened from a pending new record.
 *
 * If the POST queue row still exists, replace it in place. If background sync
 * completed while the form was open, use the server ID retained on the durable
 * local record to queue the same form values as a normal server PUT.
 */
export async function savePendingOrganicInputRevision({
  localId,
  farmId,
  updatedRecord,
  changes,
}: SavePendingOrganicInputRevisionOptions): Promise<PendingOrganicInputSaveOutcome> {
  const updated = await updatePendingSyncItem(
    STORAGE_KEYS.ORGANIC_INPUTS,
    localId,
    updatedRecord,
  );
  if (updated) return "pending_updated";

  const localRecord = await getRecordById<Record<string, unknown>>(
    "organic_inputs",
    localId,
  );
  const serverRecordId = positiveServerId(localRecord?._serverRecordId);
  if (!serverRecordId) return "server_record_unavailable";

  await replacePendingSyncItem(
    STORAGE_KEYS.ORGANIC_INPUT_EDITS,
    String(serverRecordId),
    {
      farmId,
      serverRecordId,
      changes,
    },
  );
  return "server_edit_queued";
}