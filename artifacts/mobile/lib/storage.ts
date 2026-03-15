import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

export function generateId(): string {
  return Crypto.randomUUID();
}

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  return JSON.parse(raw) as T[];
}

export async function appendToList<T>(key: string, item: T): Promise<void> {
  const list = await getList<T>(key);
  list.unshift(item);
  await AsyncStorage.setItem(key, JSON.stringify(list));
  if (key !== STORAGE_KEYS.PENDING_SYNC) {
    await addToSyncQueue(key, item);
  }
}

async function addToSyncQueue<T>(type: string, data: T): Promise<void> {
  const queue = await getList<{ id: string; type: string; data: unknown; createdAt: string }>(STORAGE_KEYS.PENDING_SYNC);
  queue.push({
    id: generateId(),
    type,
    data,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
}

export async function updateInList<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>,
): Promise<void> {
  const list = await getList<T>(key);
  const idx = list.findIndex((item) => item.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    await AsyncStorage.setItem(key, JSON.stringify(list));
  }
}

export async function removeFromList<T extends { id: string }>(
  key: string,
  id: string,
): Promise<void> {
  const list = await getList<T>(key);
  const filtered = list.filter((item) => item.id !== id);
  await AsyncStorage.setItem(key, JSON.stringify(filtered));
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: "bde_auth_token",
  CURRENT_FARM: "bde_current_farm",
  SPRAY_RECORDS: "bde_spray_records",
  WEATHER_ENTRIES: "bde_weather_entries",
  VISITOR_LOG: "bde_visitor_log",
  CROP_EVENTS: "bde_crop_events",
  SOIL_SAMPLES: "bde_soil_samples",
  FIELD_BOUNDARIES: "bde_field_boundaries",
  COMPLIANCE_FORMS: "bde_compliance_forms",
  PHOTOS: "bde_photos",
  PENDING_SYNC: "bde_pending_sync",
  USER_PROFILE: "bde_user_profile",
  FARM_LIST: "bde_farm_list",
} as const;
