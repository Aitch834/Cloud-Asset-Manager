import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

interface SQLiteDB {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

interface SyncQueueRow {
  id: string;
  record_type: string;
  record_id: string;
  data_json: string;
  status: string;
  retry_count: number;
  last_error?: string;
  next_attempt_at?: string | null;
  created_at: string;
}

export interface FailedSyncItem {
  id: string;
  record_type: string;
  record_id: string;
  data_json: string;
  last_error: string | null;
  created_at: string;
}

let sqliteDb: SQLiteDB | null = null;
let usingSQLite = false;

let syncQueueWriteChain: Promise<void> = Promise.resolve();
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
        next_attempt_at TEXT,
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
    const syncQueueColumns = await localDb.getAllAsync<{ name: string }>(
      "PRAGMA table_info(sync_queue)",
    );
    if (!syncQueueColumns.some(column => column.name === "next_attempt_at")) {
      await localDb.execAsync(
        "ALTER TABLE sync_queue ADD COLUMN next_attempt_at TEXT",
      );
    }
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
  bde_organic_inputs: "organic_inputs",
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
  bde_third_party_grain_outloadings: "third_party_grain_outloadings",
  bde_cleaning_records: "cleaning_records",
  bde_casualty_slaughter_records: "casualty_slaughter_records",
  bde_environmental_events: "environmental_events",
  bde_dairy_calving_records: "dairy_calving_records",
  bde_dairy_mastitis_records: "dairy_mastitis_records",
  bde_dairy_bcs_records: "dairy_bcs_records",
  bde_dairy_mobility_scorings: "dairy_mobility_scorings",
  bde_poultry_welfare_checks: "poultry_welfare_checks",
  bde_poultry_daily_mortality: "poultry_daily_mortality",
  bde_poultry_treatments: "poultry_treatments",
  bde_poultry_environmental_logs: "poultry_environmental_logs",
  bde_poultry_fci_documents: "poultry_fci_documents",
  bde_poultry_broiler_welfare: "poultry_broiler_welfare",
  bde_poultry_biosecurity_cleanouts: "poultry_biosecurity_cleanouts",
  bde_poultry_thinning_records: "poultry_thinning_records",
  bde_poultry_ncp_tests: "poultry_ncp_tests",
  bde_pig_welfare_checks: "pig_welfare_checks",
  bde_pig_red_tractor_checklists: "pig_red_tractor_checklists",
  bde_pig_medicine_treatments: "pig_medicine_treatments",
  bde_pig_movements: "pig_movements",
  bde_pig_fci_documents: "pig_fci_documents",
  bde_pig_feed_consumption: "pig_feed_consumption",
  bde_pig_vet_assessments: "pig_vet_assessments",
  bde_pig_tail_biting_risks: "pig_tail_biting_risks",
  bde_pig_farrowing_records: "pig_farrowing_records",
  bde_right_to_work_checks: "right_to_work_checks",
  bde_staff_training_records: "staff_training_records",
  bde_coshh_assessments: "coshh_assessments",
  bde_irrigation_meter_readings: "irrigation_meter_readings",
  bde_fuel_meter_readings: "fuel_meter_readings",
  bde_fuel_stock_checks: "fuel_stock_checks",
  bde_fuel_drawdowns: "fuel_drawdowns",
  bde_fuel_tank_deliveries: "fuel_tank_deliveries",
  bde_ai_reproduction_records: "ai_reproduction_records",
  bde_vet_prescriptions: "vet_prescriptions",
  bde_grain_quality_tests: "grain_quality_tests",
  bde_grain_temperature_readings: "grain_temperature_readings",
  bde_egg_production_records: "egg_production_records",
  bde_encampment_reports: "encampment_reports",
  bde_waste_disposal_records: "waste_disposal_records",
  bde_slurry_events: "slurry_events",
  bde_slurry_spreading_records: "slurry_spreading_records",
  bde_slurry_fill_events: "slurry_fill_events",
  bde_slurry_store_inspections: "slurry_store_inspections",
  bde_silage_additive_records: "silage_additive_records",
  bde_silage_quality_tests: "silage_quality_tests",
  bde_sfi_actions: "sfi_actions",
  bde_seed_drilling_records: "seed_drilling_records",
  bde_carbon_entries: "carbon_entries",
  bde_sprayer_calibrations: "sprayer_calibrations",
  bde_maintenance_logs: "maintenance_logs",
  bde_horticulture_records: "horticulture_records",
  bde_horticulture_harvest_grades: "horticulture_harvest_grades",
  bde_fresh_produce_intake_records: "fresh_produce_intake_records",
  bde_cold_store_temp_readings: "cold_store_temp_readings",
  bde_diversification_records: "diversification_records",
  bde_equine_health_events: "equine_health_events",
  bde_shooting_records: "shooting_records",
  bde_food_hygiene_inspections: "food_hygiene_inspections",
  bde_grain_stock_stocktakes: "grain_stock_stocktakes",
  bde_spray_stock_stocktakes: "spray_stock_stocktakes",
  bde_third_party_grain_intakes: "third_party_grain_intakes",
  bde_vine_scouting: "vine_scouting",
  bde_vine_phenology: "vine_phenology",
  bde_winery_age_verification: "winery_age_verification",
  bde_winery_reception: "winery_reception",
  bde_winery_cellar_ops: "winery_cellar_ops",
  bde_winery_fermentation: "winery_fermentation",
  bde_winery_pressing: "winery_pressing",
  bde_winery_so2: "winery_so2",
  bde_ahwr_records: "ahwr_records",
  bde_hive_inspections: "hive_inspections",
  bde_straw_bale_inventory: "straw_bale_inventory",
  bde_straw_moisture_checks: "straw_moisture_checks",
  bde_straw_sale_records: "straw_sale_records",
  bde_silage_haylage_stock: "silage_haylage_stock",
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

export async function kvGetKeysByPrefix(prefix: string): Promise<string[]> {
  await ensureInit();
  if (usingSQLite) {
    const rows = await db().getAllAsync<{ key: string }>(
      "SELECT key FROM kv_store WHERE substr(key, 1, length(?)) = ?",
      [prefix, prefix],
    );
    return rows.map((row) => row.key);
  }

  const keys = await AsyncStorage.getAllKeys();
  return keys.filter((key) => key.startsWith(prefix));
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

/**
 * Keep only the latest pending change for a server-owned record. This avoids
 * replaying stale edits if a grower saves the same record more than once while
 * offline.
 */
export async function replacePendingSyncItem(
  recordType: string,
  recordId: string,
  data: unknown,
): Promise<void> {
  await ensureInit();
  await serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      const existing = await db().getAllAsync<{ id: string }>(
        "SELECT id FROM sync_queue WHERE record_type = ? AND record_id = ? AND status = 'pending' ORDER BY created_at DESC",
        [recordType, recordId],
      );
      if (existing.length > 0) {
        // Update every duplicate first. If the app stops before cleanup, every
        // surviving replay still carries the newest edit rather than stale data.
        await db().runAsync(
          "UPDATE sync_queue SET data_json = ?, retry_count = 0, last_error = NULL, next_attempt_at = NULL, updated_at = datetime('now') WHERE record_type = ? AND record_id = ? AND status = 'pending'",
          [JSON.stringify(data), recordType, recordId],
        );
        await db().runAsync(
          "DELETE FROM sync_queue WHERE record_type = ? AND record_id = ? AND status = 'pending' AND id <> ?",
          [recordType, recordId, existing[0].id],
        );
        return;
      }
      const id = Crypto.randomUUID();
      await db().runAsync(
        "INSERT INTO sync_queue (id, record_type, record_id, data_json, status, created_at) VALUES (?, ?, ?, ?, 'pending', datetime('now'))",
        [id, recordType, recordId, JSON.stringify(data)],
      );
      return;
    }

    const raw = await AsyncStorage.getItem("bde_sync_queue");
    const queue: SyncQueueRow[] = raw ? JSON.parse(raw) : [];
    const matching = queue.filter(
      (item) => item.record_type === recordType && item.record_id === recordId && item.status === "pending",
    );
    const keepId = matching[0]?.id;
    const nextQueue = queue.filter(
      (item) => (
        item.record_type !== recordType ||
        item.record_id !== recordId ||
        item.status !== "pending" ||
        item.id === keepId
      ),
    );
    const existing = keepId ? nextQueue.find(item => item.id === keepId) : undefined;
    if (existing) {
      existing.data_json = JSON.stringify(data);
      existing.retry_count = 0;
      delete existing.last_error;
      delete existing.next_attempt_at;
    } else {
      nextQueue.push({
        id: Crypto.randomUUID(),
        record_type: recordType,
        record_id: recordId,
        data_json: JSON.stringify(data),
        status: "pending",
        retry_count: 0,
        created_at: new Date().toISOString(),
      });
    }
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(nextQueue));
  });
}
export async function getPendingSyncItems(): Promise<
  {
    id: string;
    record_type: string;
    record_id: string;
    data_json: string;
    retry_count: number;
    next_attempt_at?: string | null;
  }[]
> {
  await ensureInit();
  if (usingSQLite) {
    return db().getAllAsync<{
      id: string;
      record_type: string;
      record_id: string;
      data_json: string;
      retry_count: number;
      next_attempt_at: string | null;
    }>(
      "SELECT id, record_type, record_id, data_json, retry_count, next_attempt_at FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC",
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

export async function getFailedSyncCount(): Promise<number> {
  await ensureInit();
  if (usingSQLite) {
    const row = await db().getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'failed'",
    );
    return row?.count ?? 0;
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return 0;
  const queue: SyncQueueRow[] = JSON.parse(raw);
  return queue.filter((i) => i.status === "failed").length;
}

export async function getFailedSyncItems(): Promise<FailedSyncItem[]> {
  await ensureInit();
  if (usingSQLite) {
    return db().getAllAsync<FailedSyncItem>(
      "SELECT id, record_type, record_id, data_json, last_error, created_at FROM sync_queue WHERE status = 'failed' ORDER BY record_type ASC, created_at DESC",
    );
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return [];
  const queue: SyncQueueRow[] = JSON.parse(raw);
  return queue
    .filter((item) => item.status === "failed")
    .sort((a, b) => (
      a.record_type.localeCompare(b.record_type) ||
      b.created_at.localeCompare(a.created_at)
    ))
    .map((item) => ({
      id: item.id,
      record_type: item.record_type,
      record_id: item.record_id,
      data_json: item.data_json,
      last_error: item.last_error ?? null,
      created_at: item.created_at,
    }));
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

/**
 * Complete a queue item only if it still contains the exact payload that was
 * uploaded. A newer offline edit may replace data_json while the request is in
 * flight; in that case the new revision must remain pending.
 */
export async function markSyncItemCompletedIfUnchanged(
  id: string,
  uploadedDataJson: string,
): Promise<boolean> {
  await ensureInit();
  return serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      const result = await db().runAsync(
        "UPDATE sync_queue SET status = 'completed', updated_at = datetime('now') WHERE id = ? AND status = 'pending' AND data_json = ?",
        [id, uploadedDataJson],
      );
      return result.changes > 0;
    }

    const raw = await AsyncStorage.getItem("bde_sync_queue");
    if (!raw) return false;
    const queue: SyncQueueRow[] = JSON.parse(raw);
    const item = queue.find(
      candidate => (
        candidate.id === id &&
        candidate.status === "pending" &&
        candidate.data_json === uploadedDataJson
      ),
    );
    if (!item) return false;
    item.status = "completed";
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    return true;
  });
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

/**
 * Record a failed attempt only if the queue payload has not been replaced
 * since that attempt began.
 */
export async function markSyncItemFailedIfUnchanged(
  id: string,
  uploadedDataJson: string,
  error: string,
  nextAttemptAt: string,
): Promise<boolean> {
  await ensureInit();
  return serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      const result = await db().runAsync(
        "UPDATE sync_queue SET status = CASE WHEN retry_count >= 4 THEN 'failed' ELSE 'pending' END, retry_count = retry_count + 1, last_error = ?, next_attempt_at = CASE WHEN retry_count >= 4 THEN NULL ELSE ? END, updated_at = datetime('now') WHERE id = ? AND status = 'pending' AND data_json = ?",
        [error, nextAttemptAt, id, uploadedDataJson],
      );
      return result.changes > 0;
    }

    const raw = await AsyncStorage.getItem("bde_sync_queue");
    if (!raw) return false;
    const queue: SyncQueueRow[] = JSON.parse(raw);
    const item = queue.find(
      candidate => (
        candidate.id === id &&
        candidate.status === "pending" &&
        candidate.data_json === uploadedDataJson
      ),
    );
    if (!item) return false;
    item.retry_count = (item.retry_count || 0) + 1;
    item.last_error = error;
    if (item.retry_count >= 5) {
      item.status = "failed";
      delete item.next_attempt_at;
    } else {
      item.next_attempt_at = nextAttemptAt;
    }
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    return true;
  });
}

export async function deferSyncItemIfUnchanged(
  id: string,
  uploadedDataJson: string,
  nextAttemptAt: string,
): Promise<boolean> {
  await ensureInit();
  return serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      const result = await db().runAsync(
        "UPDATE sync_queue SET next_attempt_at = ?, updated_at = datetime('now') WHERE id = ? AND status = 'pending' AND data_json = ?",
        [nextAttemptAt, id, uploadedDataJson],
      );
      return result.changes > 0;
    }

    const raw = await AsyncStorage.getItem("bde_sync_queue");
    if (!raw) return false;
    const queue: SyncQueueRow[] = JSON.parse(raw);
    const item = queue.find(
      candidate => (
        candidate.id === id &&
        candidate.status === "pending" &&
        candidate.data_json === uploadedDataJson
      ),
    );
    if (!item) return false;
    item.next_attempt_at = nextAttemptAt;
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    return true;
  });
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

/**
 * Delete a pending or failed sync queue entry and its corresponding local
 * record. Used when a grower wants to remove a not-yet-synced item entirely.
 */
export async function deletePendingSyncItem(recordType: string, recordId: string): Promise<void> {
  await ensureInit();
  if (usingSQLite) {
    const table = TABLE_MAP[recordType];
    await db().withTransactionAsync(async () => {
      await db().runAsync(
        "DELETE FROM sync_queue WHERE record_type = ? AND record_id = ? AND status IN ('pending', 'failed')",
        [recordType, recordId],
      );
      if (table) {
        await db().runAsync("DELETE FROM records WHERE id = ? AND record_type = ?", [recordId, table]);
      }
    });
    return;
  }
  // AsyncStorage fallback: queue first (most critical), then local record.
  // No true transaction here — partial failure leaves an orphaned local record
  // that will not re-sync since the queue entry is gone, but the data is not
  // sent to the server. Acceptable for the web-only AsyncStorage path.
  const queueRaw = await AsyncStorage.getItem("bde_sync_queue");
  if (queueRaw) {
    const queue: SyncQueueRow[] = JSON.parse(queueRaw);
    await AsyncStorage.setItem(
      "bde_sync_queue",
      JSON.stringify(
        queue.filter(
          (i) =>
            !(
              i.record_type === recordType &&
              i.record_id === recordId &&
              (i.status === "pending" || i.status === "failed")
            ),
        ),
      ),
    );
  }
  const table = TABLE_MAP[recordType];
  if (table) {
    await AsyncStorage.removeItem(`bde_record_${table}_${recordId}`);
    const indexKey = `bde_index_${table}`;
    const idxRaw = await AsyncStorage.getItem(indexKey);
    if (idxRaw) {
      const index: string[] = JSON.parse(idxRaw);
      await AsyncStorage.setItem(indexKey, JSON.stringify(index.filter((i) => i !== recordId)));
    }
  }
}

/**
 * Turn a pending organic-input create into a durable discard tombstone.
 * The sync engine will resolve the server ID through the idempotent POST, then
 * DELETE that server row, so a create already in flight cannot become orphaned.
 */
export async function requestPendingSyncItemDiscard(
  recordType: string,
  recordId: string,
): Promise<boolean> {
  await ensureInit();
  return serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      const item = await db().getFirstAsync<{ id: string; data_json: string }>(
        "SELECT id, data_json FROM sync_queue WHERE record_type = ? AND record_id = ? AND status = 'pending'",
        [recordType, recordId],
      );
      if (!item) return false;
      const data = JSON.parse(item.data_json) as Record<string, unknown>;
      const nextJson = JSON.stringify({ ...data, _discardRequested: true });
      const table = TABLE_MAP[recordType];
      let updated = false;
      await db().withTransactionAsync(async () => {
        const result = await db().runAsync(
          "UPDATE sync_queue SET data_json = ?, retry_count = 0, last_error = NULL, next_attempt_at = NULL, updated_at = datetime('now') WHERE id = ? AND status = 'pending' AND data_json = ?",
          [nextJson, item.id, item.data_json],
        );
        updated = result.changes > 0;
        if (updated && table) {
          await db().runAsync(
            "UPDATE records SET data_json = ? WHERE id = ? AND record_type = ?",
            [nextJson, recordId, table],
          );
        }
      });
      return updated;
    }

    const queueRaw = await AsyncStorage.getItem("bde_sync_queue");
    if (!queueRaw) return false;
    const queue: SyncQueueRow[] = JSON.parse(queueRaw);
    const item = queue.find(
      candidate => (
        candidate.record_type === recordType &&
        candidate.record_id === recordId &&
        candidate.status === "pending"
      ),
    );
    if (!item) return false;
    const data = JSON.parse(item.data_json) as Record<string, unknown>;
    item.data_json = JSON.stringify({ ...data, _discardRequested: true });
    item.retry_count = 0;
    delete item.last_error;
    delete item.next_attempt_at;
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    const table = TABLE_MAP[recordType];
    if (table) {
      await AsyncStorage.setItem(
        `bde_record_${table}_${recordId}`,
        item.data_json,
      );
    }
    return true;
  });
}

/**
 * Overwrite the data in a pending sync queue entry without creating a duplicate.
 * Used when a grower edits a not-yet-synced record before it reaches the server.
 */
/**
 * Returns true when the update succeeded (the pending entry still existed).
 * Returns false when the record was already synced/removed before the save —
 * callers should treat this as a "record already synced" condition and handle
 * it (e.g. redirect to the server-edit flow).
 */
export async function updatePendingSyncItem(recordType: string, recordId: string, data: unknown): Promise<boolean> {
  await ensureInit();
  return serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      const item = await db().getFirstAsync<{ id: string; data_json: string }>(
        "SELECT id, data_json FROM sync_queue WHERE record_type = ? AND record_id = ? AND status = 'pending'",
        [recordType, recordId],
      );
      if (!item) return false;
      const previous = JSON.parse(item.data_json) as Record<string, unknown>;
      const next = data && typeof data === "object"
        ? { ...(data as Record<string, unknown>) }
        : data;
      if (next && typeof next === "object") {
        const nextRecord = next as Record<string, unknown>;
        if (previous._serverRecordId !== undefined) nextRecord._serverRecordId = previous._serverRecordId;
        if (previous._discardRequested !== undefined) nextRecord._discardRequested = previous._discardRequested;
      }
      const json = JSON.stringify(next);
      const table = TABLE_MAP[recordType];
      let updated = false;
      await db().withTransactionAsync(async () => {
        const result = await db().runAsync(
          "UPDATE sync_queue SET data_json = ?, retry_count = 0, last_error = NULL, next_attempt_at = NULL, updated_at = datetime('now') WHERE id = ? AND status = 'pending' AND data_json = ?",
          [json, item.id, item.data_json],
        );
        updated = result.changes > 0;
        if (updated && table) {
          await db().runAsync(
            "UPDATE records SET data_json = ? WHERE id = ? AND record_type = ?",
            [json, recordId, table],
          );
        }
      });
      return updated;
    }
    // Keep the queue and local copy inside the same serialized write section.
    // This prevents completion/cleanup for an older upload snapshot from
    // overwriting or deleting the grower's newer edit.
    const queueRaw = await AsyncStorage.getItem("bde_sync_queue");
    if (!queueRaw) return false;
    const queue: SyncQueueRow[] = JSON.parse(queueRaw);
    const idx = queue.findIndex(
      (i) => i.record_type === recordType && i.record_id === recordId && i.status === "pending",
    );
    if (idx === -1) return false;
    const previous = JSON.parse(queue[idx].data_json) as Record<string, unknown>;
    const next = data && typeof data === "object"
      ? { ...(data as Record<string, unknown>) }
      : data;
    if (next && typeof next === "object") {
      const nextRecord = next as Record<string, unknown>;
      if (previous._serverRecordId !== undefined) nextRecord._serverRecordId = previous._serverRecordId;
      if (previous._discardRequested !== undefined) nextRecord._discardRequested = previous._discardRequested;
    }
    const json = JSON.stringify(next);
    queue[idx].data_json = json;
    queue[idx].retry_count = 0;
    delete queue[idx].last_error;
    delete queue[idx].next_attempt_at;
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    const table = TABLE_MAP[recordType];
    if (table) {
      await AsyncStorage.setItem(`bde_record_${table}_${recordId}`, json);
    }
    return true;
  });
}

/**
 * Convert a successfully-created mobile record's still-pending queue row into
 * a server-targeted revision. This deliberately changes data_json so the POST
 * snapshot cannot complete the row; the next sync pass can PUT the latest
 * payload to the returned server ID.
 */
export async function setPendingSyncItemServerRecordId(
  id: string,
  serverRecordId: number,
): Promise<boolean> {
  await ensureInit();
  if (!Number.isInteger(serverRecordId) || serverRecordId <= 0) return false;

  return serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      const item = await db().getFirstAsync<{
        data_json: string;
        record_type: string;
        record_id: string;
      }>(
        "SELECT data_json, record_type, record_id FROM sync_queue WHERE id = ? AND status = 'pending'",
        [id],
      );
      if (!item) return false;
      const data = JSON.parse(item.data_json) as Record<string, unknown>;
      const nextJson = JSON.stringify({ ...data, _serverRecordId: serverRecordId });
      const table = TABLE_MAP[item.record_type];
      let updated = false;
      await db().withTransactionAsync(async () => {
        const result = await db().runAsync(
          "UPDATE sync_queue SET data_json = ?, retry_count = 0, last_error = NULL, next_attempt_at = NULL, updated_at = datetime('now') WHERE id = ? AND status = 'pending' AND data_json = ?",
          [nextJson, id, item.data_json],
        );
        updated = result.changes > 0;
        if (updated && table) {
          await db().runAsync(
            "UPDATE records SET data_json = ? WHERE id = ? AND record_type = ?",
            [nextJson, item.record_id, table],
          );
        }
      });
      return updated;
    }

    const raw = await AsyncStorage.getItem("bde_sync_queue");
    if (!raw) return false;
    const queue: SyncQueueRow[] = JSON.parse(raw);
    const item = queue.find(candidate => candidate.id === id && candidate.status === "pending");
    if (!item) return false;
    const data = JSON.parse(item.data_json) as Record<string, unknown>;
    item.data_json = JSON.stringify({ ...data, _serverRecordId: serverRecordId });
    item.retry_count = 0;
    delete item.last_error;
    delete item.next_attempt_at;
    const table = TABLE_MAP[item.record_type];
    if (table) {
      await AsyncStorage.setItem(
        `bde_record_${table}_${item.record_id}`,
        item.data_json,
      );
    }
    // AsyncStorage has no cross-key transaction. Persist the recovery pointer
    // before exposing it on the queue so an interruption can only cause a safe
    // duplicate POST, never queue cleanup without a durable server ID.
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    return true;
  });
}

/**
 * Returns all sync queue entries whose status is 'failed' for a given record
 * type. Optionally filtered by farmId (matched against the farmId field inside
 * data_json). Used by screens that need to show a "sync failed" badge.
 */
export async function getFailedSyncItemsForType(
  recordType: string,
  farmId?: string,
): Promise<{ id: string; record_id: string; data_json: string; last_error: string | null }[]> {
  await ensureInit();
  if (usingSQLite) {
    const rows = await db().getAllAsync<{
      id: string;
      record_id: string;
      data_json: string;
      last_error: string | null;
    }>(
      "SELECT id, record_id, data_json, last_error FROM sync_queue WHERE status = 'failed' AND record_type = ? ORDER BY created_at DESC",
      [recordType],
    );
    if (!farmId) return rows;
    return rows.filter((row) => {
      try {
        const d = JSON.parse(row.data_json) as Record<string, unknown>;
        return String(d?.farmId) === farmId;
      } catch {
        return true;
      }
    });
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return [];
  const queue: SyncQueueRow[] = JSON.parse(raw);
  return queue
    .filter((i) => i.status === "failed" && i.record_type === recordType)
    .filter((i) => {
      if (!farmId) return true;
      try {
        const d = JSON.parse(i.data_json) as Record<string, unknown>;
        return String(d?.farmId) === farmId;
      } catch {
        return true;
      }
    })
    .map((i) => ({
      id: i.id,
      record_id: i.record_id,
      data_json: i.data_json,
      last_error: i.last_error ?? null,
    }));
}

/**
 * Returns sync queue entries in the requested statuses for a given record type,
 * optionally filtered by farmId (matched against data_json). Used by screens
 * that need to render both failed and pending-retry local items.
 */
export async function getSyncItemsForType(
  recordType: string,
  statuses: string[],
  farmId?: string,
): Promise<{
  id: string;
  record_id: string;
  data_json: string;
  status: string;
  last_error: string | null;
}[]> {
  await ensureInit();
  if (statuses.length === 0) return [];
  if (usingSQLite) {
    const placeholders = statuses.map(() => "?").join(", ");
    const rows = await db().getAllAsync<{
      id: string;
      record_id: string;
      data_json: string;
      status: string;
      last_error: string | null;
    }>(
      `SELECT id, record_id, data_json, status, last_error FROM sync_queue WHERE record_type = ? AND status IN (${placeholders}) ORDER BY created_at DESC`,
      [recordType, ...statuses],
    );
    if (!farmId) return rows;
    return rows.filter((row) => {
      try {
        return String((JSON.parse(row.data_json) as Record<string, unknown>)?.farmId) === farmId;
      } catch {
        return true;
      }
    });
  }
  const raw = await AsyncStorage.getItem("bde_sync_queue");
  if (!raw) return [];
  const queue: SyncQueueRow[] = JSON.parse(raw);
  return queue
    .filter((i) => i.record_type === recordType && statuses.includes(i.status))
    .filter((i) => {
      if (!farmId) return true;
      try {
        return String((JSON.parse(i.data_json) as Record<string, unknown>)?.farmId) === farmId;
      } catch {
        return true;
      }
    })
    .map((i) => ({
      id: i.id,
      record_id: i.record_id,
      data_json: i.data_json,
      status: i.status,
      last_error: i.last_error ?? null,
    }));
}

/**
 * Reset a 'failed' sync queue entry back to 'pending' so the sync engine will
 * retry it on the next pass. Use after manual user retry requests.
 */
export async function resetSyncItemToRetry(
  recordType: string,
  recordId: string,
): Promise<void> {
  await ensureInit();
  await serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      await db().runAsync(
        "UPDATE sync_queue SET status = 'pending', retry_count = 0, last_error = NULL, next_attempt_at = NULL, updated_at = datetime('now') WHERE record_type = ? AND record_id = ? AND status = 'failed'",
        [recordType, recordId],
      );
      return;
    }
    const raw = await AsyncStorage.getItem("bde_sync_queue");
    if (!raw) return;
    const queue: SyncQueueRow[] = JSON.parse(raw);
    let changed = false;
    for (const item of queue) {
      if (
        item.record_type === recordType &&
        item.record_id === recordId &&
        item.status === "failed"
      ) {
        item.status = "pending";
        item.retry_count = 0;
        delete item.last_error;
        delete item.next_attempt_at;
        changed = true;
      }
    }
    if (changed) {
      await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    }
  });
}

/**
 * Reset a specific failed queue entry (identified by its queue row ID) back to
 * 'pending'. Unlike resetSyncItemToRetry which targets by recordId, this only
 * touches the one row the grower explicitly chose to retry.
 */
export async function resetSyncItemToRetryById(syncId: string): Promise<void> {
  await ensureInit();
  await serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      await db().runAsync(
        "UPDATE sync_queue SET status = 'pending', retry_count = 0, last_error = NULL, next_attempt_at = NULL, updated_at = datetime('now') WHERE id = ? AND status = 'failed'",
        [syncId],
      );
      return;
    }
    const raw = await AsyncStorage.getItem("bde_sync_queue");
    if (!raw) return;
    const queue: SyncQueueRow[] = JSON.parse(raw);
    let changed = false;
    for (const item of queue) {
      if (item.id === syncId && item.status === "failed") {
        item.status = "pending";
        item.retry_count = 0;
        delete item.last_error;
        delete item.next_attempt_at;
        changed = true;
        break;
      }
    }
    if (changed) {
      await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue));
    }
  });
}

export async function clearCompletedSyncItems(): Promise<void> {
  await ensureInit();
  await serializeSyncQueueWrite(async () => {
    if (usingSQLite) {
      await db().runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
      return;
    }
    const raw = await AsyncStorage.getItem("bde_sync_queue");
    if (!raw) return;
    const queue: SyncQueueRow[] = JSON.parse(raw);
    await AsyncStorage.setItem("bde_sync_queue", JSON.stringify(queue.filter((i) => i.status !== "completed")));
  });
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

async function serializeSyncQueueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = syncQueueWriteChain.then(operation, operation);
  syncQueueWriteChain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
