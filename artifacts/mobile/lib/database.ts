import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

interface SQLiteDB {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
}

interface SyncQueueRow {
  id: string;
  record_type: string;
  record_id: string;
  data_json: string;
  status: string;
  retry_count: number;
  last_error?: string;
  created_at: string;
}

let sqliteDb: SQLiteDB | null = null;
let usingSQLite = false;

async function initSQLite(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const SQLite = require("expo-sqlite");
    sqliteDb = (await SQLite.openDatabaseAsync("bdefarmtrac.db")) as SQLiteDB;
    const localDb = sqliteDb;
    await localDb.execAsync(`
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

      CREATE TABLE IF NOT EXISTS ref_cache (
        data_type TEXT NOT NULL,
        farm_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        last_synced_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (data_type, farm_id)
      );
    `);
    usingSQLite = true;
    return true;
  } catch (initErr: unknown) {
    console.warn("SQLite init failed, using AsyncStorage fallback:", initErr instanceof Error ? initErr.message : "unknown");
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

function db(): SQLiteDB {
  if (!sqliteDb) throw new Error("SQLite not initialized");
  return sqliteDb;
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
  bde_medicine_records: "medicine_records",
  bde_livestock_checks: "livestock_checks",
  bde_livestock_movements: "livestock_movements",
  bde_harvest_records: "harvest_records",
  bde_nvz_applications: "nvz_applications",
  bde_equipment_defects: "equipment_defects",
  bde_pest_control_visits: "pest_control_visits",
  bde_field_inspections: "field_inspections",
  bde_biofuel_field_declarations: "biofuel_field_declarations",
  bde_biofuel_delivery_records: "biofuel_delivery_records",
  bde_field_operations: "field_operations",
  bde_mortality_records: "mortality_records",
  bde_feed_records: "feed_records",
  bde_water_quality_records: "water_quality_records",
  bde_fly_tipping_reports: "fly_tipping_reports",
  bde_haulage_confirmations: "haulage_confirmations",
  bde_organic_fp_inputs: "organic_fp_inputs",
  bde_organic_outdoor_access: "organic_outdoor_access",
  bde_organic_treatments: "organic_treatments",
  bde_tb_tests: "tb_tests",
  bde_welfare_outcome_assessments: "welfare_outcome_assessments",
  bde_ppe_issue_records: "ppe_issue_records",
  bde_poultry_transfers: "poultry_transfers",
  bde_poultry_transport_welfare: "poultry_transport_welfare",
  bde_pig_inventory_records: "pig_inventory_records",
  bde_pig_death_records: "pig_death_records",
  bde_vine_operation: "vine_operation",
  bde_vine_harvest: "vine_harvest",
  bde_irrigation_applications: "irrigation_applications",
};

export function getTableForKey(key: string): string | null {
  return TABLE_MAP[key] || null;
}

export async function kvGet(key: string): Promise<string | null> {
  await ensureInit();
  if (usingSQLite) {
    const row = await db().getFirstAsync<{ value: string }>(
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
    await db().runAsync(
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
    await db().runAsync("DELETE FROM kv_store WHERE key = ?", [key]);
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
    await db().runAsync(
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
    await db().runAsync(
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
    await db().runAsync("DELETE FROM records WHERE id = ? AND record_type = ?", [id, table]);
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
      rows = await db().getAllAsync<{ data_json: string }>(
        "SELECT data_json FROM records WHERE record_type = ? AND farm_id = ? ORDER BY created_at DESC",
        [table, farmId],
      );
    } else {
      rows = await db().getAllAsync<{ data_json: string }>(
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
    const row = await db().getFirstAsync<{ data_json: string }>(
      "SELECT data_json FROM records WHERE id = ? AND record_type = ?",
      [id, table],
    );
    return row ? (JSON.parse(row.data_json) as T) : null;
  }
  const raw = await AsyncStorage.getItem(`bde_record_${table}_${id}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function hasPendingSyncItem(
  recordType: string,
  recordId: string,
): Promise<boolean> {
  await ensureInit();
  if (usingSQLite) {
    const row = await db().getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_queue WHERE record_type = ? AND record_id = ? AND status = 'pending'",
      [recordType, recordId],
    );
    return (row?.count ?? 0) > 0;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return false;
  const queue: SyncQueueRow[] = JSON.parse(raw);
  return queue.some((i) => i.record_type === recordType && i.record_id === recordId && i.status === "pending");
}

export async function enqueueSyncItem(
  recordType: string,
  recordId: string,
  data: unknown,
): Promise<void> {
  await ensureInit();
  const id = Crypto.randomUUID();
  if (usingSQLite) {
    await db().runAsync(
      "INSERT INTO sync_queue (id, record_type, record_id, data_json, status, created_at) VALUES (?, ?, ?, ?, 'pending', datetime('now'))",
      [id, recordType, recordId, JSON.stringify(data)],
    );
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  const queue: SyncQueueRow[] = raw ? JSON.parse(raw) : [];
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
    return db().getAllAsync<{ id: string; record_type: string; record_id: string; data_json: string; retry_count: number }>(
      "SELECT id, record_type, record_id, data_json, retry_count FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC",
    );
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return [];
  const queue: SyncQueueRow[] = JSON.parse(raw);
  return queue.filter((i) => i.status === "pending");
}

export async function getPendingSyncCount(): Promise<number> {
  await ensureInit();
  if (usingSQLite) {
    const row = await db().getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'",
    );
    return row?.count ?? 0;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return 0;
  const queue: SyncQueueRow[] = JSON.parse(raw);
  return queue.filter((i) => i.status === "pending").length;
}

export async function markSyncItemCompleted(id: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await db().runAsync(
      "UPDATE sync_queue SET status = 'completed', updated_at = datetime('now') WHERE id = ?",
      [id],
    );
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return;
  const queue: SyncQueueRow[] = JSON.parse(raw);
  const idx = queue.findIndex((i) => i.id === id);
  if (idx !== -1) {
    queue[idx].status = "completed";
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
  }
}

export async function markSyncItemFailed(id: string, error: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await db().runAsync(
      "UPDATE sync_queue SET status = CASE WHEN retry_count >= 4 THEN 'failed' ELSE 'pending' END, retry_count = retry_count + 1, last_error = ?, updated_at = datetime('now') WHERE id = ?",
      [error, id],
    );
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return;
  const queue: SyncQueueRow[] = JSON.parse(raw);
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
    // Also strip _pendingSync from the stored JSON so getRecords()-based screens
    // don't continue treating this record as an unsynced offline entry.
    await db().runAsync(
      "UPDATE records SET synced = 1, data_json = json_remove(data_json, '$._pendingSync') WHERE id = ? AND record_type = ?",
      [id, table],
    );
    return;
  }
  const storeKey = `bde_record_${table}_${id}`;
  const raw = await AsyncStorage.getItem(storeKey);
  if (raw) {
    const item = JSON.parse(raw);
    item.synced = true;
    delete item._pendingSync;
    await AsyncStorage.setItem(storeKey, JSON.stringify(item));
  }
}

export async function clearCompletedSyncItems(): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    await db().runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
    return;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return;
  const queue: SyncQueueRow[] = JSON.parse(raw);
  await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue.filter((i) => i.status !== "completed")));
}

export async function saveRefCache(dataType: string, farmId: string, data: unknown): Promise<void> {
  await ensureInit();
  const json = JSON.stringify(data);
  const now = new Date().toISOString();
  if (usingSQLite) {
    await db().runAsync(
      "INSERT OR REPLACE INTO ref_cache (data_type, farm_id, data_json, last_synced_at) VALUES (?, ?, ?, ?)",
      [dataType, farmId, json, now],
    );
    return;
  }
  await AsyncStorage.setItem(`bde_ref_${dataType}_${farmId}`, JSON.stringify({ data, syncedAt: now }));
}

export async function getRefCache<T>(dataType: string, farmId: string): Promise<T[]> {
  await ensureInit();
  if (usingSQLite) {
    const row = await db().getFirstAsync<{ data_json: string }>(
      "SELECT data_json FROM ref_cache WHERE data_type = ? AND farm_id = ?",
      [dataType, farmId],
    );
    if (!row) return [];
    return JSON.parse(row.data_json) as T[];
  }
  const raw = await AsyncStorage.getItem(`bde_ref_${dataType}_${farmId}`);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as { data: T[] };
  return parsed.data ?? [];
}

export async function getRefCacheUpdatedAt(dataType: string, farmId: string): Promise<Date | null> {
  await ensureInit();
  if (usingSQLite) {
    const row = await db().getFirstAsync<{ last_synced_at: string }>(
      "SELECT last_synced_at FROM ref_cache WHERE data_type = ? AND farm_id = ?",
      [dataType, farmId],
    );
    return row ? new Date(row.last_synced_at) : null;
  }
  const raw = await AsyncStorage.getItem(`bde_ref_${dataType}_${farmId}`);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { syncedAt: string };
  return parsed.syncedAt ? new Date(parsed.syncedAt) : null;
}
