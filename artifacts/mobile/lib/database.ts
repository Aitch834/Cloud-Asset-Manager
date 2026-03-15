import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

let sqliteDb: any = null;
let usingSQLite = false;

async function initSQLite(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const SQLite = require("expo-sqlite");
    sqliteDb = await SQLite.openDatabaseAsync("bdefarmtrac.db");
    await sqliteDb.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        record_type TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);

      CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        record_type TEXT NOT NULL,
        farm_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_records_type_farm ON records(record_type, farm_id);
    `);
    usingSQLite = true;
    return true;
  } catch {
    return false;
  }
}

let dbInitPromise: Promise<boolean> | null = null;

async function ensureInit(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = initSQLite();
  }
  await dbInitPromise;
}

const TABLE_MAP: Record<string, string> = {
  bde_spray_records: "spray_records",
  bde_weather_entries: "weather_entries",
  bde_visitor_log: "visitor_log",
  bde_crop_events: "crop_events",
  bde_soil_samples: "soil_samples",
  bde_field_boundaries: "field_boundaries",
  bde_compliance_forms: "compliance_forms",
  bde_photos: "photos",
};

export function getTableForKey(key: string): string | null {
  return TABLE_MAP[key] || null;
}

export async function kvGet(key: string): Promise<string | null> {
  await ensureInit();
  if (usingSQLite) {
    const row = await sqliteDb.getFirstAsync(
      "SELECT value FROM kv_store WHERE key = ?",
      [key],
    );
    return row?.value ?? null;
  }
  return AsyncStorage.getItem(key);
}

export async function kvSet(key: string, value: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await sqliteDb.runAsync(
      "INSERT OR REPLACE INTO kv_store (key, value, updated_at) VALUES (?, ?, datetime('now'))",
      [key, value],
    );
    return;
  }
  await AsyncStorage.setItem(key, value);
}

export async function kvDelete(key: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await sqliteDb.runAsync("DELETE FROM kv_store WHERE key = ?", [key]);
    return;
  }
  await AsyncStorage.removeItem(key);
}

export async function insertRecord(
  table: string,
  id: string,
  farmId: string,
  data: unknown,
  createdAt: string,
): Promise<void> {
  await ensureInit();
  const json = JSON.stringify(data);
  if (usingSQLite) {
    await sqliteDb.runAsync(
      "INSERT OR REPLACE INTO records (id, record_type, farm_id, data_json, synced, created_at) VALUES (?, ?, ?, ?, 0, ?)",
      [id, table, farmId, json, createdAt],
    );
    return;
  }
  const storeKey = `bde_record_${table}_${id}`;
  await AsyncStorage.setItem(storeKey, json);
  const indexKey = `bde_index_${table}`;
  const raw = await AsyncStorage.getItem(indexKey);
  const index: string[] = raw ? JSON.parse(raw) : [];
  if (!index.includes(id)) {
    index.unshift(id);
    await AsyncStorage.setItem(indexKey, JSON.stringify(index));
  }
}

export async function updateRecord(
  table: string,
  id: string,
  data: unknown,
): Promise<void> {
  await ensureInit();
  const json = JSON.stringify(data);
  if (usingSQLite) {
    await sqliteDb.runAsync(
      "UPDATE records SET data_json = ?, synced = 0 WHERE id = ? AND record_type = ?",
      [json, id, table],
    );
    return;
  }
  const storeKey = `bde_record_${table}_${id}`;
  await AsyncStorage.setItem(storeKey, json);
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await sqliteDb.runAsync("DELETE FROM records WHERE id = ? AND record_type = ?", [id, table]);
    return;
  }
  const storeKey = `bde_record_${table}_${id}`;
  await AsyncStorage.removeItem(storeKey);
  const indexKey = `bde_index_${table}`;
  const raw = await AsyncStorage.getItem(indexKey);
  if (raw) {
    const index: string[] = JSON.parse(raw);
    await AsyncStorage.setItem(indexKey, JSON.stringify(index.filter((i) => i !== id)));
  }
}

export async function getRecords<T>(table: string, farmId?: string): Promise<T[]> {
  await ensureInit();
  if (usingSQLite) {
    let rows: { data_json: string }[];
    if (farmId) {
      rows = await sqliteDb.getAllAsync(
        "SELECT data_json FROM records WHERE record_type = ? AND farm_id = ? ORDER BY created_at DESC",
        [table, farmId],
      );
    } else {
      rows = await sqliteDb.getAllAsync(
        "SELECT data_json FROM records WHERE record_type = ? ORDER BY created_at DESC",
        [table],
      );
    }
    return rows.map((r: { data_json: string }) => JSON.parse(r.data_json) as T);
  }

  const indexKey = `bde_index_${table}`;
  const raw = await AsyncStorage.getItem(indexKey);
  if (!raw) return [];
  const index: string[] = JSON.parse(raw);
  const results: T[] = [];
  for (const id of index) {
    const itemRaw = await AsyncStorage.getItem(`bde_record_${table}_${id}`);
    if (itemRaw) {
      const item = JSON.parse(itemRaw) as T & { farmId?: string };
      if (!farmId || item.farmId === farmId) {
        results.push(item);
      }
    }
  }
  return results;
}

export async function getRecordById<T>(table: string, id: string): Promise<T | null> {
  await ensureInit();
  if (usingSQLite) {
    const row = await sqliteDb.getFirstAsync(
      "SELECT data_json FROM records WHERE id = ? AND record_type = ?",
      [id, table],
    );
    return row ? (JSON.parse(row.data_json) as T) : null;
  }
  const raw = await AsyncStorage.getItem(`bde_record_${table}_${id}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function enqueueSyncItem(
  recordType: string,
  recordId: string,
  data: unknown,
): Promise<void> {
  await ensureInit();
  const id = Crypto.randomUUID();
  if (usingSQLite) {
    await sqliteDb.runAsync(
      "INSERT INTO sync_queue (id, record_type, record_id, data_json, status, created_at) VALUES (?, ?, ?, ?, 'pending', datetime('now'))",
      [id, recordType, recordId, JSON.stringify(data)],
    );
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  const queue: any[] = raw ? JSON.parse(raw) : [];
  queue.push({
    id,
    record_type: recordType,
    record_id: recordId,
    data_json: JSON.stringify(data),
    status: "pending",
    retry_count: 0,
    created_at: new Date().toISOString(),
  });
  await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
}

export async function getPendingSyncItems(): Promise<
  { id: string; record_type: string; record_id: string; data_json: string; retry_count: number }[]
> {
  await ensureInit();
  if (usingSQLite) {
    return sqliteDb.getAllAsync(
      "SELECT id, record_type, record_id, data_json, retry_count FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC",
    );
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return [];
  const queue: any[] = JSON.parse(raw);
  return queue.filter((i) => i.status === "pending");
}

export async function getPendingSyncCount(): Promise<number> {
  await ensureInit();
  if (usingSQLite) {
    const row = await sqliteDb.getFirstAsync(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'",
    );
    return row?.count ?? 0;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return 0;
  const queue: any[] = JSON.parse(raw);
  return queue.filter((i) => i.status === "pending").length;
}

export async function markSyncItemCompleted(id: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await sqliteDb.runAsync(
      "UPDATE sync_queue SET status = 'completed', updated_at = datetime('now') WHERE id = ?",
      [id],
    );
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return;
  const queue: any[] = JSON.parse(raw);
  const idx = queue.findIndex((i) => i.id === id);
  if (idx !== -1) {
    queue[idx].status = "completed";
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
  }
}

export async function markSyncItemFailed(id: string, error: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await sqliteDb.runAsync(
      "UPDATE sync_queue SET status = CASE WHEN retry_count >= 4 THEN 'failed' ELSE 'pending' END, retry_count = retry_count + 1, last_error = ?, updated_at = datetime('now') WHERE id = ?",
      [error, id],
    );
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return;
  const queue: any[] = JSON.parse(raw);
  const idx = queue.findIndex((i) => i.id === id);
  if (idx !== -1) {
    queue[idx].retry_count = (queue[idx].retry_count || 0) + 1;
    queue[idx].last_error = error;
    if (queue[idx].retry_count >= 5) queue[idx].status = "failed";
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
  }
}

export async function markRecordSynced(table: string, id: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await sqliteDb.runAsync("UPDATE records SET synced = 1 WHERE id = ? AND record_type = ?", [id, table]);
    return;
  }
  const storeKey = `bde_record_${table}_${id}`;
  const raw = await AsyncStorage.getItem(storeKey);
  if (raw) {
    const item = JSON.parse(raw);
    item.synced = true;
    await AsyncStorage.setItem(storeKey, JSON.stringify(item));
  }
}

export async function clearCompletedSyncItems(): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await sqliteDb.runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return;
  const queue: any[] = JSON.parse(raw);
  await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue.filter((i) => i.status !== "completed")));
}
