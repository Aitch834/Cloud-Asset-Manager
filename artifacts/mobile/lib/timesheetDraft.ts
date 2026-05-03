import { kvDelete, kvGet, kvSet } from "./database";
import { generateId } from "./storage";

export interface DraftEntry {
  id: string;
  taskType: string;
  hoursRegular: number;
  hoursOvertime: number;
  notes: string;
  linkedTaskId?: number;
  linkedTaskTitle?: string;
}

export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function draftKey(farmId: string, userId: string, date: string): string {
  return `bde_ts_draft_${farmId}_${userId}_${date}`;
}

export async function loadDraft(
  farmId: string,
  userId: string,
  date: string,
): Promise<DraftEntry[]> {
  try {
    const raw = await kvGet(draftKey(farmId, userId, date));
    return raw ? (JSON.parse(raw) as DraftEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveDraft(
  farmId: string,
  userId: string,
  date: string,
  entries: DraftEntry[],
): Promise<void> {
  await kvSet(draftKey(farmId, userId, date), JSON.stringify(entries));
}

export async function clearDraft(
  farmId: string,
  userId: string,
  date: string,
): Promise<void> {
  await kvDelete(draftKey(farmId, userId, date));
}

export async function addDraftEntry(
  farmId: string,
  userId: string,
  entry: Omit<DraftEntry, "id">,
): Promise<void> {
  const date = todayIso();
  const existing = await loadDraft(farmId, userId, date);
  const newEntry: DraftEntry = { id: generateId(), ...entry };
  await saveDraft(farmId, userId, date, [...existing, newEntry]);
}

export async function removeDraftEntry(
  farmId: string,
  userId: string,
  date: string,
  entryId: string,
): Promise<DraftEntry[]> {
  const existing = await loadDraft(farmId, userId, date);
  const next = existing.filter((e) => e.id !== entryId);
  await saveDraft(farmId, userId, date, next);
  return next;
}

export const MODULE_TO_TASK_TYPE: Record<string, string> = {
  equipment_defect: "Machinery Maintenance",
  medicine_followup: "Livestock Handling",
  vet_followup: "Livestock Handling",
  spray_assignment: "Crop Spraying",
  feed_bin: "Livestock Handling",
  farm_services: "General Farm Work",
  work_order: "General Farm Work",
  field_inspection: "General Farm Work",
  planner: "General Farm Work",
  risk_assessment: "Record Keeping / Admin",
  custom: "General Farm Work",
};
