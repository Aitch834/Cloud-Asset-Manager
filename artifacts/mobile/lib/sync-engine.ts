import { Platform } from "react-native";

import {
  clearCompletedSyncItems,
  deferSyncItemIfUnchanged,
  deleteRecord,
  getPendingSyncCount,
  getPendingSyncItems,
  kvGet,
  kvSet,
  kvDelete,
  hasPendingSyncItem,
  markRecordSynced,
  markSyncItemCompletedIfUnchanged,
  markSyncItemFailedIfUnchanged,
  setPendingSyncItemServerRecordId,
  getTableForKey,
  insertRecord,
  enqueueSyncItem,
} from "./database";
import {
  ORGANIC_INPUT_EDIT_RECORD_TYPE,
  parseQueuedOrganicInputEdit,
} from "./organicInputOfflineEdit";

type SyncListener = (state: SyncState) => void;

export interface SyncState {
  pendingCount: number;
  isSyncing: boolean;
  isConnected: boolean;
  lastSyncTime: string | null;
  lastError: string | null;
}

const INITIAL_STATE: SyncState = {
  pendingCount: 0,
  isSyncing: false,
  isConnected: true,
  lastSyncTime: null,
  lastError: null,
};

const RETRY_DELAYS = [1000, 5000, 15000, 30000, 60000];

let state: SyncState = { ...INITIAL_STATE };
let listeners: SyncListener[] = [];
let unsubscribeNetInfo: (() => void) | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let followupDelayWhileSyncing: number | null = null;
let isInitialized = false;

const NEWLY_MAPPED_LEGACY_RECORD_TYPES = [
  "bde_third_party_grain_outloadings",
  "bde_cleaning_records",
  "bde_casualty_slaughter_records",
  "bde_environmental_events",
  "bde_dairy_calving_records",
  "bde_dairy_mastitis_records",
  "bde_dairy_bcs_records",
  "bde_dairy_mobility_scorings",
  "bde_poultry_welfare_checks",
  "bde_poultry_daily_mortality",
  "bde_poultry_treatments",
  "bde_poultry_environmental_logs",
  "bde_poultry_fci_documents",
  "bde_poultry_broiler_welfare",
  "bde_poultry_biosecurity_cleanouts",
  "bde_poultry_thinning_records",
  "bde_poultry_ncp_tests",
  "bde_pig_welfare_checks",
  "bde_pig_red_tractor_checklists",
  "bde_pig_medicine_treatments",
  "bde_pig_movements",
  "bde_pig_fci_documents",
  "bde_pig_feed_consumption",
  "bde_pig_vet_assessments",
  "bde_pig_tail_biting_risks",
  "bde_pig_farrowing_records",
  "bde_right_to_work_checks",
  "bde_staff_training_records",
  "bde_coshh_assessments",
  "bde_irrigation_meter_readings",
  "bde_fuel_meter_readings",
  "bde_fuel_stock_checks",
  "bde_fuel_drawdowns",
  "bde_fuel_tank_deliveries",
  "bde_ai_reproduction_records",
  "bde_vet_prescriptions",
  "bde_grain_quality_tests",
  "bde_grain_temperature_readings",
  "bde_egg_production_records",
  "bde_encampment_reports",
  "bde_waste_disposal_records",
  "bde_slurry_events",
  "bde_slurry_spreading_records",
  "bde_slurry_fill_events",
  "bde_slurry_store_inspections",
  "bde_silage_additive_records",
  "bde_silage_quality_tests",
  "bde_sfi_actions",
  "bde_seed_drilling_records",
  "bde_carbon_entries",
  "bde_sprayer_calibrations",
  "bde_maintenance_logs",
  "bde_horticulture_records",
  "bde_horticulture_harvest_grades",
  "bde_fresh_produce_intake_records",
  "bde_cold_store_temp_readings",
  "bde_diversification_records",
  "bde_equine_health_events",
  "bde_shooting_records",
  "bde_food_hygiene_inspections",
  "bde_grain_stock_stocktakes",
  "bde_spray_stock_stocktakes",
  "bde_third_party_grain_intakes",
  "bde_vine_scouting",
  "bde_vine_phenology",
  "bde_winery_age_verification",
  "bde_winery_reception",
  "bde_winery_cellar_ops",
  "bde_winery_fermentation",
  "bde_winery_pressing",
  "bde_winery_so2",
  "bde_ahwr_records",
  "bde_hive_inspections",
  "bde_straw_bale_inventory",
  "bde_straw_moisture_checks",
  "bde_straw_sale_records",
  "bde_silage_haylage_stock",
] as const;

function notify() {
  listeners.forEach((l) => l({ ...state }));
}

function setState(updates: Partial<SyncState>) {
  state = { ...state, ...updates };
  notify();
}

export function subscribe(listener: SyncListener): () => void {
  listeners.push(listener);
  listener({ ...state });
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getState(): SyncState {
  return { ...state };
}

export async function refreshPendingCount(): Promise<number> {
  const count = await getPendingSyncCount();
  setState({ pendingCount: count });
  return count;
}

/**
 * Refresh the pending count and, if the device is connected, immediately
 * schedule a sync attempt. Call this after enqueueing a new record so the
 * sync engine picks it up without waiting for the next NetInfo event or
 * app restart.
 */
export async function scheduleSync(delayMs = 500): Promise<void> {
  await refreshPendingCount();
  if (state.isConnected && state.pendingCount > 0) {
    scheduleSyncAttempt(delayMs);
  }
}

// One-time migration: move any entries stored under the old plural KV key
// (bde_vine_operations) into the correct TABLE_MAP-backed key (bde_vine_operation).
//
// Safety guarantees:
//   At-least-once  — the OLD_KEY is kept intact until every entry is confirmed
//                    migrated, so a crash never loses a record.
//   No duplicates  — a durable MARKER_KEY records which IDs have already been
//                    inserted + enqueued; hasPendingSyncItem guards the queue.
//                    On restart we skip already-marked IDs, so no double-POST.
async function migrateVineOperationsKey(): Promise<void> {
  const OLD_KEY = "bde_vine_operations";
  const MARKER_KEY = "bde_vine_op_migration_v1";
  try {
    const raw = await kvGet(OLD_KEY);
    if (!raw) return;
    const entries: Array<Record<string, unknown>> = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) {
      await kvDelete(OLD_KEY);
      return;
    }

    // Load the set of already-migrated IDs from a durable marker key.
    const markerRaw = await kvGet(MARKER_KEY);
    const migratedIds: Set<string> = markerRaw
      ? new Set(JSON.parse(markerRaw) as string[])
      : new Set();

    for (const entry of entries) {
      const id = String(entry.id ?? "");
      const farmId = String(entry.farmId ?? "");
      const createdAt = String(entry.createdAt ?? new Date().toISOString());
      if (!id || migratedIds.has(id)) continue;

      // INSERT OR REPLACE is idempotent; safe to re-run on retry.
      await insertRecord("vine_operation", id, farmId, entry, createdAt);

      // Only enqueue if not already pending — prevents duplicate server POSTs.
      const alreadyQueued = await hasPendingSyncItem("bde_vine_operation", id);
      if (!alreadyQueued) {
        await enqueueSyncItem("bde_vine_operation", id, entry);
      }

      // Persist progress before moving to the next entry. A crash here means
      // the next startup re-inserts this entry (INSERT OR REPLACE) and re-checks
      // the queue (hasPendingSyncItem) — still safe, still no duplicates.
      migratedIds.add(id);
      await kvSet(MARKER_KEY, JSON.stringify(Array.from(migratedIds)));
    }

    // All entries processed — clean up both keys.
    await kvDelete(OLD_KEY);
    await kvDelete(MARKER_KEY);
  } catch (err) {
    console.warn("migrateVineOperationsKey:", err instanceof Error ? err.message : err);
  }
}

// One-time migration: move any entries stored under the old flat KV key
// (bde_irrigation_applications) into the TABLE_MAP-backed SQLite records table
// and the sync queue, so records saved before this key was wired up are uploaded.
//
// Safety guarantees mirror migrateVineOperationsKey:
//   At-least-once  — OLD_KEY is kept until every entry is confirmed migrated.
//   No duplicates  — MARKER_KEY tracks already-processed IDs; hasPendingSyncItem
//                    guards the queue against double-POST.
async function migrateIrrigationApplicationsKey(): Promise<void> {
  const OLD_KEY = "bde_irrigation_applications";
  const MARKER_KEY = "bde_irrigation_app_migration_v1";
  try {
    const raw = await kvGet(OLD_KEY);
    if (!raw) return;
    let entries: Array<Record<string, unknown>>;
    try {
      entries = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      await kvDelete(OLD_KEY);
      return;
    }

    const markerRaw = await kvGet(MARKER_KEY);
    const migratedIds: Set<string> = markerRaw
      ? new Set(JSON.parse(markerRaw) as string[])
      : new Set();

    for (const entry of entries) {
      const id = String(entry.id ?? "");
      const farmId = String(entry.farmId ?? "");
      const createdAt = String(entry.createdAt ?? new Date().toISOString());
      if (!id || migratedIds.has(id)) continue;

      await insertRecord("irrigation_applications", id, farmId, entry, createdAt);

      const alreadyQueued = await hasPendingSyncItem("bde_irrigation_applications", id);
      if (!alreadyQueued) {
        await enqueueSyncItem("bde_irrigation_applications", id, entry);
      }

      migratedIds.add(id);
      await kvSet(MARKER_KEY, JSON.stringify(Array.from(migratedIds)));
    }

    await kvDelete(OLD_KEY);
    await kvDelete(MARKER_KEY);
  } catch (err) {
    console.warn("migrateIrrigationApplicationsKey:", err instanceof Error ? err.message : err);
  }
}

// One-time migration: move any entries stored under the old flat KV key
// (bde_vine_harvest) into the TABLE_MAP-backed SQLite records table and the
// sync queue, so records saved before this key was wired up are uploaded and
// their _pendingSync flag is properly cleared on success.
//
// Safety guarantees mirror migrateVineOperationsKey:
//   At-least-once  — OLD_KEY is kept until every entry is confirmed migrated.
//   No duplicates  — MARKER_KEY tracks already-processed IDs; hasPendingSyncItem
//                    guards the queue against double-POST.
async function migrateVineHarvestKey(): Promise<void> {
  const OLD_KEY = "bde_vine_harvest";
  const MARKER_KEY = "bde_vine_harvest_migration_v1";
  try {
    const raw = await kvGet(OLD_KEY);
    if (!raw) return;
    let entries: Array<Record<string, unknown>>;
    try {
      entries = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      await kvDelete(OLD_KEY);
      return;
    }

    const markerRaw = await kvGet(MARKER_KEY);
    const migratedIds: Set<string> = markerRaw
      ? new Set(JSON.parse(markerRaw) as string[])
      : new Set();

    for (const entry of entries) {
      const id = String(entry.id ?? "");
      const farmId = String(entry.farmId ?? "");
      const createdAt = String(entry.createdAt ?? new Date().toISOString());
      if (!id || migratedIds.has(id)) continue;

      await insertRecord("vine_harvest", id, farmId, entry, createdAt);

      const alreadyQueued = await hasPendingSyncItem("bde_vine_harvest", id);
      if (!alreadyQueued) {
        await enqueueSyncItem("bde_vine_harvest", id, entry);
      }

      migratedIds.add(id);
      await kvSet(MARKER_KEY, JSON.stringify(Array.from(migratedIds)));
    }

    await kvDelete(OLD_KEY);
    await kvDelete(MARKER_KEY);
  } catch (err) {
    console.warn("migrateVineHarvestKey:", err instanceof Error ? err.message : err);
  }
}

// One-time migration: move any entries stored under the flat KV key
// (bde_organic_inputs) into the TABLE_MAP-backed SQLite records table and the
// sync queue, so records saved before this key was wired up are uploaded.
//
// Delivery semantics:
//   At-least-once  — OLD_KEY is kept until every entry is confirmed migrated.
//   Exactly-once server records — the server POST uses INSERT … ON CONFLICT
//                    (farm_id, mobile_record_id) DO NOTHING, so a retry after a
//                    lost response returns the existing row rather than inserting
//                    a duplicate. The returned server ID is retained so the final
//                    local revision is applied by PUT before the queue is cleared.
async function migrateOrganicInputsKey(): Promise<void> {
  const OLD_KEY = "bde_organic_inputs";
  const MARKER_KEY = "bde_organic_inputs_migration_v1";
  try {
    const raw = await kvGet(OLD_KEY);
    if (!raw) return;
    let entries: Array<Record<string, unknown>>;
    try {
      entries = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      await kvDelete(OLD_KEY);
      return;
    }

    const markerRaw = await kvGet(MARKER_KEY);
    const migratedIds: Set<string> = markerRaw
      ? new Set(JSON.parse(markerRaw) as string[])
      : new Set();

    for (const entry of entries) {
      const id = String(entry.id ?? "");
      const farmId = String(entry.farmId ?? "");
      const createdAt = String(entry.createdAt ?? new Date().toISOString());
      if (!id || migratedIds.has(id)) continue;

      await insertRecord("organic_inputs", id, farmId, entry, createdAt);

      // Only enqueue if not already pending and not already synced to the server.
      if (!entry.synced) {
        const alreadyQueued = await hasPendingSyncItem("bde_organic_inputs", id);
        if (!alreadyQueued) {
          await enqueueSyncItem("bde_organic_inputs", id, entry);
        }
      }

      migratedIds.add(id);
      await kvSet(MARKER_KEY, JSON.stringify(Array.from(migratedIds)));
    }

    await kvDelete(OLD_KEY);
    await kvDelete(MARKER_KEY);
  } catch (err) {
    console.warn("migrateOrganicInputsKey:", err instanceof Error ? err.message : err);
  }
}

/**
 * Move records saved by older app versions from flat KV lists into the generic
 * records table now used by TABLE_MAP. Progress is persisted per key so a
 * crash after insert/enqueue cannot duplicate an upload on the next launch.
 */
export async function migrateNewlyMappedLegacyRecords(): Promise<void> {
  for (const recordType of NEWLY_MAPPED_LEGACY_RECORD_TYPES) {
    const table = getTableForKey(recordType);
    if (!table) continue;

    const markerKey = `bde_table_map_migration_v1_${recordType}`;
    try {
      const raw = await kvGet(recordType);
      if (!raw) continue;

      let entries: Array<Record<string, unknown>>;
      try {
        entries = JSON.parse(raw);
      } catch {
        continue;
      }
      if (!Array.isArray(entries)) continue;

      const markerRaw = await kvGet(markerKey);
      const migratedIds = new Set<string>(
        markerRaw ? JSON.parse(markerRaw) as string[] : [],
      );
      let everyEntryValid = true;

      for (const entry of entries) {
        const id = String(entry?.id ?? "");
        if (!id) {
          everyEntryValid = false;
          continue;
        }
        if (migratedIds.has(id)) continue;

        const farmId = String(entry.farmId ?? "");
        const createdAt = String(entry.createdAt ?? new Date().toISOString());
        await insertRecord(table, id, farmId, entry, createdAt);

        if (entry.synced) {
          await markRecordSynced(table, id);
        } else {
          const alreadyQueued = await hasPendingSyncItem(recordType, id);
          if (!alreadyQueued) {
            await enqueueSyncItem(recordType, id, entry);
          }
        }

        migratedIds.add(id);
        await kvSet(markerKey, JSON.stringify(Array.from(migratedIds)));
      }

      if (everyEntryValid) {
        await kvDelete(recordType);
        await kvDelete(markerKey);
      }
    } catch (err) {
      console.warn(
        `migrateNewlyMappedLegacyRecords(${recordType}):`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

export async function initialize(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  await migrateVineOperationsKey();
  await migrateIrrigationApplicationsKey();
  await migrateVineHarvestKey();
  await migrateOrganicInputsKey();
  await migrateNewlyMappedLegacyRecords();
  await refreshPendingCount();

  try {
    if (Platform.OS !== "web") {
      const NetInfo = require("@react-native-community/netinfo").default;
      unsubscribeNetInfo = NetInfo.addEventListener((netState: { isConnected: boolean | null }) => {
        const wasConnected = state.isConnected;
        const nowConnected = netState.isConnected ?? false;
        setState({ isConnected: nowConnected });

        if (!wasConnected && nowConnected && state.pendingCount > 0) {
          scheduleSyncAttempt(500);
        }
      });
    }
  } catch (netErr: unknown) {
    console.warn("NetInfo unavailable:", netErr instanceof Error ? netErr.message : "unknown");
  }

  if (state.pendingCount > 0) {
    scheduleSyncAttempt(2000);
  }
}

export function cleanup(): void {
  if (unsubscribeNetInfo) {
    unsubscribeNetInfo();
    unsubscribeNetInfo = null;
  }
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
  followupDelayWhileSyncing = null;
  isInitialized = false;
}

function requestFollowupAfterCurrentSync(delayMs: number): void {
  followupDelayWhileSyncing = followupDelayWhileSyncing === null
    ? delayMs
    : Math.min(followupDelayWhileSyncing, delayMs);
}

function scheduleSyncAttempt(delayMs: number) {
  if (state.isSyncing) {
    requestFollowupAfterCurrentSync(delayMs);
    return;
  }
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    if (state.isSyncing) {
      requestFollowupAfterCurrentSync(delayMs);
      return;
    }
    void processQueue();
  }, delayMs);
}

function syncItemIsDue(item: { next_attempt_at?: string | null }, now: number): boolean {
  if (!item.next_attempt_at) return true;
  const dueAt = new Date(item.next_attempt_at).getTime();
  return Number.isNaN(dueAt) || dueAt <= now;
}

async function processQueue(): Promise<void> {
  if (state.isSyncing) {
    requestFollowupAfterCurrentSync(0);
    return;
  }
  if (!state.isConnected) return;

  const attemptedSnapshots = new Map<string, string>();
  setState({ isSyncing: true, lastError: null });

  try {
    const pendingItems = await getPendingSyncItems();
    const items = pendingItems.filter(item => syncItemIsDue(item, Date.now()));
    for (const item of items) {
      attemptedSnapshots.set(item.id, item.data_json);
    }

    if (items.length === 0) {
      setState({ isSyncing: false, lastSyncTime: new Date().toISOString() });
      await refreshPendingCount();
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let supersededCount = 0;

    for (const item of items) {
      if (!state.isConnected) {
        setState({ isSyncing: false, lastError: "Connection lost during sync" });
        break;
      }

      try {
        const uploadResult = await uploadSyncItem(item);
        const createdServerRecordId = uploadResult.createdOrganicInputServerId
          ?? uploadResult.createdSprayServerId;
        if (createdServerRecordId) {
          await setPendingSyncItemServerRecordId(
            item.id,
            createdServerRecordId,
          );
        }
        const completed = await markSyncItemCompletedIfUnchanged(item.id, item.data_json);
        if (!completed) {
          // A newer edit replaced this payload during upload. Leave that newer
          // revision pending and run another pass once this one has finished.
          supersededCount++;
          continue;
        }

        const table = getTableForKey(item.record_type);
        if (table) {
          if (uploadResult.deletedOrganicInput || uploadResult.deletedSprayRecord) {
            await deleteRecord(table, item.record_id);
          } else {
            await markRecordSynced(table, item.record_id);
          }
        }
        successCount++;
      } catch (err) {
        if (err instanceof SyncDeferredError) {
          // Module state not yet resolved — leave item pending, do not count as
          // a failure or consume a retry slot. Schedule a retry so the item is
          // re-attempted once useApiModules has written the module cache.
          const deferredDelay = 10000;
          const deferredUntil = new Date(Date.now() + deferredDelay).toISOString();
          const deferred = await deferSyncItemIfUnchanged(
            item.id,
            item.data_json,
            deferredUntil,
          );
          if (!deferred) {
            supersededCount++;
          }
          requestFollowupAfterCurrentSync(deferredDelay);
          continue;
        }
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        const retryDelay = RETRY_DELAYS[Math.min(item.retry_count, RETRY_DELAYS.length - 1)];
        const retryAt = new Date(Date.now() + retryDelay).toISOString();
        const failureRecorded = await markSyncItemFailedIfUnchanged(
          item.id,
          item.data_json,
          errorMsg,
          retryAt,
        );
        if (!failureRecorded) {
          supersededCount++;
          continue;
        }
        failCount++;

        requestFollowupAfterCurrentSync(retryDelay);
      }
    }

    await clearCompletedSyncItems();
    await refreshPendingCount();

    if (failCount === 0) {
      setState({
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        lastError: null,
      });
    } else {
      setState({
        isSyncing: false,
        lastError: `${failCount} item${failCount > 1 ? "s" : ""} failed to sync`,
      });
    }
    if (supersededCount > 0) {
      requestFollowupAfterCurrentSync(500);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Sync failed";
    setState({ isSyncing: false, lastError: errorMsg });
    requestFollowupAfterCurrentSync(15000);
  } finally {
    if (state.isSyncing) {
      setState({ isSyncing: false });
    }

    let followupDelay = followupDelayWhileSyncing;
    followupDelayWhileSyncing = null;
    if (state.isConnected) {
      try {
        const latestPending = await getPendingSyncItems();
        const now = Date.now();
        const hasNewOrChangedWork = latestPending.some(
          item => (
            syncItemIsDue(item, now) &&
            attemptedSnapshots.get(item.id) !== item.data_json
          ),
        );
        if (hasNewOrChangedWork) {
          followupDelay = followupDelay === null
            ? 500
            : Math.min(followupDelay, 500);
        }
        const futureAttemptTimes = latestPending
          .map(item => item.next_attempt_at
            ? new Date(item.next_attempt_at).getTime()
            : Number.NaN)
          .filter(attemptAt => !Number.isNaN(attemptAt) && attemptAt > now);
        if (futureAttemptTimes.length > 0) {
          const earliestRetryDelay = Math.max(
            0,
            Math.min(...futureAttemptTimes) - now,
          );
          followupDelay = followupDelay === null
            ? earliestRetryDelay
            : Math.min(followupDelay, earliestRetryDelay);
        }
      } catch {
        // A later app or network event will retry if storage is unavailable.
      }
    }

    if (state.isConnected && followupDelay !== null) {
      scheduleSyncAttempt(followupDelay);
    }
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("auth_session_token");
      if (token) return token;
    } else {
      try {
        const token = localStorage.getItem("auth_session_token");
        if (token) return token;
      } catch { /* localStorage unavailable */ }
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch (err: unknown) {
    console.warn("Failed to read auth token:", err instanceof Error ? err.message : "unknown");
    return null;
  }
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch (err: unknown) {
    console.warn("Failed to read tenant slug:", err instanceof Error ? err.message : "unknown");
  }
  return "";
}

/**
 * Thrown when a sync item should be skipped for this cycle but kept in the
 * queue for retry once the blocking condition (e.g. unresolved module cache)
 * is resolved. Unlike a normal error, this does NOT consume a retry slot.
 */
class SyncDeferredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyncDeferredError";
  }
}

const WINERY_RECORD_TYPES = new Set([
  "bde_winery_age_verification",
  "bde_winery_reception",
  "bde_winery_cellar_ops",
  "bde_winery_fermentation",
  "bde_winery_pressing",
  "bde_winery_so2",
]);

const IRRIGATION_RECORD_TYPES = new Set([
  "bde_irrigation_applications",
  "bde_irrigation_meter_readings",
]);

/**
 * Returns the cached module keys for a specific farm, or null when the cache
 * has not yet been populated (modules not yet resolved for this farm).
 */
async function getCachedModuleKeysForFarm(farmId: string): Promise<string[] | null> {
  try {
    const raw = await kvGet(`bde_active_module_keys_${farmId}`);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

interface UploadSyncResult {
  createdOrganicInputServerId?: number;
  createdSprayServerId?: number;
  deletedOrganicInput?: boolean;
  deletedSprayRecord?: boolean;
}

async function uploadSyncItem(item: {
  id: string;
  record_type: string;
  record_id: string;
  data_json: string;
  retry_count: number;
}): Promise<UploadSyncResult> {
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!apiDomain) {
    await simulateUpload();
    return {};
  }

  // Guard winery record types: only sync when the record's farm has a confirmed
  // viticulture or organic-viticulture module. If the module cache hasn't been
  // populated yet for that farm (null), throw so the item is retried later rather
  // than silently dropped. Only discard when we have a confirmed non-viticulture result.
  if (WINERY_RECORD_TYPES.has(item.record_type)) {
    const data = JSON.parse(item.data_json) as Record<string, unknown>;
    const recordFarmId = data.farmId as string | undefined;
    if (recordFarmId) {
      const moduleKeys = await getCachedModuleKeysForFarm(recordFarmId);
      if (moduleKeys === null) {
        // Cache not yet populated for this farm — defer without consuming a retry slot.
        throw new SyncDeferredError("Module cache not yet resolved for farm; deferring winery sync");
      }
      const hasWinery = moduleKeys.includes("viticulture");
      if (!hasWinery) {
        // Confirmed non-viticulture farm: discard the record without uploading.
        return {};
      }
    }
  }

  // Guard irrigation record types: only sync when the record's farm has the
  // water-irrigation module enabled. If the module cache hasn't been populated yet,
  // defer so the item is retried once the cache is written by useApiModules.
  // When the module is confirmed absent, discard silently — the form now blocks
  // saves at submission time, so records in the queue from before this guard was
  // added should not retry indefinitely and accumulate a permanent sync-badge.
  if (IRRIGATION_RECORD_TYPES.has(item.record_type)) {
    const data = JSON.parse(item.data_json) as Record<string, unknown>;
    const recordFarmId = data.farmId as string | undefined;
    if (recordFarmId) {
      const moduleKeys = await getCachedModuleKeysForFarm(recordFarmId);
      if (moduleKeys === null) {
        // Cache not yet populated — defer without consuming a retry slot.
        throw new SyncDeferredError("Module cache not yet resolved for farm; deferring irrigation sync");
      }
      if (!moduleKeys.includes("water-irrigation")) {
        // Confirmed module-absent farm: discard the record to clear the sync badge.
        return {};
      }
    }
  }

  const data = JSON.parse(item.data_json) as Record<string, unknown>;
  const pendingOrganicServerId = item.record_type === "bde_organic_inputs"
    ? Number(data._serverRecordId)
    : null;
  const hasPendingOrganicServerId = (
    pendingOrganicServerId !== null &&
    Number.isInteger(pendingOrganicServerId) &&
    pendingOrganicServerId > 0
  );
  const discardPendingOrganicInput = (
    item.record_type === "bde_organic_inputs" &&
    data._discardRequested === true
  );
  const pendingSprayServerId = item.record_type === "bde_spray_records"
    ? Number(data._serverRecordId)
    : null;
  const hasPendingSprayServerId = (
    pendingSprayServerId !== null &&
    Number.isInteger(pendingSprayServerId) &&
    pendingSprayServerId > 0
  );
  const discardPendingSprayRecord = (
    item.record_type === "bde_spray_records" &&
    data._discardRequested === true
  );
  const organicInputEdit = item.record_type === ORGANIC_INPUT_EDIT_RECORD_TYPE
    ? parseQueuedOrganicInputEdit(data)
    : null;
  if (
    item.record_type === ORGANIC_INPUT_EDIT_RECORD_TYPE &&
    (!organicInputEdit || String(organicInputEdit.serverRecordId) !== item.record_id)
  ) {
    throw new Error("Invalid queued organic input edit");
  }
  const endpoint = organicInputEdit
    ? `/farms/${organicInputEdit.farmId}/organic/inputs/${organicInputEdit.serverRecordId}`
    : hasPendingOrganicServerId
      ? `/farms/${String(data.farmId)}/organic/inputs/${pendingOrganicServerId}`
      : hasPendingSprayServerId
        ? `/farms/${String(data.farmId)}/spray-applications/${pendingSprayServerId}`
        : getSyncEndpoint(item.record_type, data.farmId as string, data);
  if (!endpoint) {
    await simulateUpload();
    return {};
  }

  const token = await getAuthToken();
  const tenantSlug = await getTenantSlug();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-tenant-slug": tenantSlug,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const mappedData = organicInputEdit?.changes ?? remapForApi(item.record_type, data);
  const baseUrl = `https://${apiDomain}/api`;
  const deletesResolvedServerRecord = (
    (discardPendingOrganicInput && hasPendingOrganicServerId) ||
    (discardPendingSprayRecord && hasPendingSprayServerId)
  );
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: deletesResolvedServerRecord
      ? "DELETE"
      : organicInputEdit || hasPendingOrganicServerId || hasPendingSprayServerId
        ? "PUT"
        : "POST",
    headers,
    ...(deletesResolvedServerRecord
      ? {}
      : { body: JSON.stringify(mappedData) }),
  });

  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}`);
  }
  if (discardPendingOrganicInput && hasPendingOrganicServerId) {
    return { deletedOrganicInput: true };
  }
  if (discardPendingSprayRecord && hasPendingSprayServerId) {
    return { deletedSprayRecord: true };
  }
  if (item.record_type === "bde_organic_inputs" && !hasPendingOrganicServerId) {
    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      throw new Error("Organic input create response did not include a server record");
    }
    const serverId = Number(
      (responseBody as { record?: { id?: unknown } } | null)?.record?.id,
    );
    if (!Number.isInteger(serverId) || serverId <= 0) {
      throw new Error("Organic input create response did not include a valid server record ID");
    }
    return { createdOrganicInputServerId: serverId };
  }
  if (item.record_type === "bde_spray_records" && !hasPendingSprayServerId) {
    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      throw new Error("Spray application create response did not include a server record");
    }
    const serverId = Number(
      (responseBody as { record?: { id?: unknown } } | null)?.record?.id,
    );
    if (!Number.isInteger(serverId) || serverId <= 0) {
      throw new Error("Spray application create response did not include a valid server record ID");
    }
    return { createdSprayServerId: serverId };
  }
  return {};
}

function remapForApi(recordType: string, data: Record<string, unknown>): Record<string, unknown> {
  if (recordType === "bde_ppe_issue_records") {
    return {
      staffName: data.staffName,
      ppeType: data.ppeType,
      description: data.description ?? data.ppeDescription ?? null,
      size: data.size ?? null,
      supplier: data.supplier ?? data.manufacturer ?? null,
      dateIssued: data.dateIssued ?? data.issueDate ?? null,
      conditionAtCheck: data.conditionAtCheck ?? null,
      conditionCheckDate: data.conditionCheckDate ?? null,
      replacedDate: data.replacedDate ?? data.returnDate ?? null,
      replacedReason: data.replacedReason ?? (data.returned ? "Returned" : null),
      notes: data.notes ?? null,
      fitCheckConfirmed: data.fitCheckConfirmed ?? false,
      fitCheckBy: data.fitCheckBy ?? null,
      fitCheckNotes: data.fitCheckNotes ?? null,
      trainingProvided: data.trainingProvided ?? false,
      trainingNotes: data.trainingNotes ?? null,
      isActive: data.isActive !== undefined ? data.isActive : !data.returned,
    };
  }
  if (recordType === "bde_organic_inputs") {
    // Include the stable mobile UUID as mobileRecordId so the server-side
    // ON CONFLICT DO NOTHING upsert can deduplicate retries after a lost response.
    const {
      _serverRecordId: _ignoredServerRecordId,
      _discardRequested: _ignoredDiscardRequested,
      ...apiData
    } = data;
    return { ...apiData, mobileRecordId: data.id };
  }
  if (recordType === "bde_spray_records") {
    const {
      _serverRecordId: _ignoredServerRecordId,
      _discardRequested: _ignoredDiscardRequested,
      ...apiData
    } = data;
    return { ...apiData, mobileRecordId: data.id };
  }
  if (recordType === "bde_organic_fp_inputs") {
    return {
      ...data,
      inputName: data.productName,
      applicationDate: data.dateOfUse,
      quantityApplied: data.quantityAmount,
      derogationExpiryDate: data.derogationExpiryDate ?? null,
    };
  }
  if (recordType === "bde_organic_outdoor_access") {
    return {
      ...data,
      species: data.animalGroup,
      recordDate: data.date,
      complianceStatus: data.accessProvided ? "compliant" : "non-compliant",
      outdoorAccessHoursDay: data.durationHours ?? null,
      housingJustification: data.restrictionReason ?? null,
      notes: [data.paddockArea ? `Paddock/area: ${data.paddockArea}` : null, data.notes ? String(data.notes) : null].filter(Boolean).join(". ") || null,
    };
  }
  if (recordType === "bde_organic_treatments") {
    const wdDays = data.withdrawalPeriodDays ? parseInt(String(data.withdrawalPeriodDays), 10) : null;
    return {
      ...data,
      species: data.animalGroup,
      animalIds: data.animalIdentifiers ?? null,
      treatmentDate: data.dateOfTreatment,
      productName: data.medicineProduct,
      doseAmount: data.dosage ?? null,
      routeOfAdministration: data.routeOfAdmin ?? null,
      standardWithdrawalDays: Number.isNaN(wdDays) ? null : wdDays,
      notes: [data.batchNumber ? `Batch: ${data.batchNumber}` : null, data.notes ? String(data.notes) : null].filter(Boolean).join(". ") || null,
    };
  }
  if (recordType === "bde_irrigation_applications") {
    const numOrNull = (v: unknown): number | null => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };
    return {
      fieldId: data.fieldId != null ? Number(data.fieldId) : undefined,
      irrigationDate: data.irrigationDate,
      fieldOrBlockDescription: data.fieldOrBlockDescription || null,
      cropType: data.cropType || null,
      growthStage: data.growthStage || null,
      irrigationMethod: data.irrigationMethod || null,
      applicationDepthMm: numOrNull(data.applicationDepthMm),
      volumeAppliedM3: numOrNull(data.volumeAppliedM3),
      areaIrrigatedHa: numOrNull(data.areaIrrigatedHa),
      rainfallLast7DaysMm: numOrNull(data.rainfallLast7DaysMm),
      soilMoistureDeficitMm: numOrNull(data.soilMoistureDeficitMm),
      operatorName: data.operatorName || null,
      notes: data.notes || null,
    };
  }
  return data;
}

function getSyncEndpoint(recordType: string, farmId: string, data?: Record<string, unknown>): string | null {
  if (recordType === "bde_third_party_grain_outloadings" && data?.intakeId) {
    return `/farms/${farmId}/grain-intakes/${data.intakeId}/movements`;
  }
  const typeMap: Record<string, string> = {
    bde_spray_records: `/farms/${farmId}/spray-applications`,
    bde_weather_entries: `/farms/${farmId}/weather-readings`,
    bde_visitor_log: `/farms/${farmId}/visitors`,
    bde_crop_events: `/farms/${farmId}/crops`,
    bde_soil_samples: `/farms/${farmId}/soil-tests`,
    bde_field_boundaries: `/farms/${farmId}/fields`,
    bde_compliance_forms: `/farms/${farmId}/documents`,
    bde_photos: `/farms/${farmId}/documents`,
    bde_medicine_records: `/farms/${farmId}/medicine-records`,
    bde_livestock_checks: `/farms/${farmId}/livestock-checks`,
    bde_livestock_movements: `/farms/${farmId}/movements`,
    bde_harvest_records: `/farms/${farmId}/crops`,
    bde_nvz_applications: `/farms/${farmId}/nvz-applications`,
    bde_equipment_defects: `/farms/${farmId}/equipment-defect-reports`,
    bde_pest_control_visits: `/farms/${farmId}/pest-control`,
    bde_cleaning_records: `/farms/${farmId}/cleaning`,
    bde_field_inspections: `/farms/${farmId}/field-inspections`,
    bde_biofuel_field_declarations: `/farms/${farmId}/biofuel/field-declarations`,
    bde_biofuel_delivery_records: `/farms/${farmId}/biofuel/deliveries`,
    bde_field_operations: `/farms/${farmId}/field-operations`,
    bde_mortality_records: `/farms/${farmId}/mortality-records`,
    bde_casualty_slaughter_records: `/farms/${farmId}/casualty-slaughter`,
    bde_feed_records: `/farms/${farmId}/feed-records`,
    bde_water_quality_records: `/farms/${farmId}/water-records`,
    bde_environmental_events: `/farms/${farmId}/environmental-management-events`,
    bde_dairy_calving_records: `/farms/${farmId}/calving-records`,
    bde_dairy_mastitis_records: `/farms/${farmId}/mastitis-records`,
    bde_dairy_bcs_records: `/farms/${farmId}/bcs-records`,
    bde_dairy_mobility_scorings: `/farms/${farmId}/mobility-scorings`,
    bde_poultry_welfare_checks: `/farms/${farmId}/poultry-welfare-checks`,
    bde_poultry_daily_mortality: `/farms/${farmId}/poultry-daily-mortality`,
    bde_poultry_treatments: `/farms/${farmId}/poultry-treatments`,
    bde_poultry_environmental_logs: `/farms/${farmId}/poultry-environmental-logs`,
    bde_poultry_fci_documents: `/farms/${farmId}/poultry-fci-documents`,
    bde_poultry_broiler_welfare: `/farms/${farmId}/poultry-broiler-welfare`,
    bde_poultry_biosecurity_cleanouts: `/farms/${farmId}/poultry-biosecurity-checklists`,
    bde_pig_welfare_checks: `/farms/${farmId}/pig-stockmanship-checks`,
    bde_pig_red_tractor_checklists: `/farms/${farmId}/pig-red-tractor-checklists`,
    bde_pig_medicine_treatments: `/farms/${farmId}/pig-medicine-treatments`,
    bde_pig_movements: `/farms/${farmId}/pig-movements`,
    bde_pig_fci_documents: `/farms/${farmId}/pig-fci-documents`,
    bde_pig_feed_consumption: `/farms/${farmId}/pig-feed-consumption`,
    bde_pig_vet_assessments: `/farms/${farmId}/pig-vet-assessments`,
    bde_pig_tail_biting_risks: `/farms/${farmId}/pig-tail-biting-risks`,
    bde_right_to_work_checks: `/farms/${farmId}/right-to-work`,
    bde_irrigation_meter_readings: `/farms/${farmId}/irrigation-readings`,
    bde_fuel_meter_readings: `/farms/${farmId}/energy/readings`,
    bde_fuel_stock_checks: `/farms/${farmId}/fuel/stock-checks`,
    bde_fuel_drawdowns: `/farms/${farmId}/fuel/usage`,
    bde_fuel_tank_deliveries: `/farms/${farmId}/fuel/deliveries`,
    bde_pig_farrowing_records: `/farms/${farmId}/pig-farrowing-records`,
    bde_poultry_thinning_records: `/farms/${farmId}/poultry-thinning-records`,
    bde_ai_reproduction_records: `/farms/${farmId}/ai-reproduction-records`,
    bde_vet_prescriptions: `/farms/${farmId}/vet-prescriptions`,
    bde_grain_quality_tests: `/farms/${farmId}/grain-quality-tests`,
    bde_grain_temperature_readings: `/farms/${farmId}/grain-temperature-logs`,
    bde_egg_production_records: `/farms/${farmId}/egg-production-records`,
    bde_fly_tipping_reports: `/farms/${farmId}/fly-tipping`,
    bde_encampment_reports: `/farms/${farmId}/encampments`,
    bde_waste_disposal_records: `/farms/${farmId}/waste`,
    bde_slurry_events: `/farms/${farmId}/slurry-events`,
    bde_slurry_spreading_records: `/farms/${farmId}/slurry-spreading-records`,
    bde_slurry_fill_events: `/farms/${farmId}/slurry-fill-events`,
    bde_slurry_store_inspections: `/farms/${farmId}/slurry-store-inspections`,
    bde_silage_additive_records: `/farms/${farmId}/silage-additive-records`,
    bde_silage_quality_tests: `/farms/${farmId}/silage-quality-tests`,
    bde_sfi_actions: `/farms/${farmId}/sfi-actions`,
    bde_sprayer_calibrations: `/farms/${farmId}/sprayer-calibrations`,
    bde_maintenance_logs: `/farms/${farmId}/maintenance-logs`,
    bde_horticulture_records: `/farms/${farmId}/horticulture-records`,
    bde_horticulture_harvest_grades: `/farms/${farmId}/horticulture-harvest-grades`,
    bde_fresh_produce_intake_records: `/farms/${farmId}/fresh-produce-intake`,
    bde_cold_store_temp_readings: `/farms/${farmId}/cold-store-readings`,
    bde_carbon_entries: `/farms/${farmId}/carbon-entries`,
    bde_diversification_records: `/farms/${farmId}/diversification-records`,
    bde_equine_health_events: `/farms/${farmId}/equine-health-events`,
    bde_shooting_records: `/farms/${farmId}/shooting-records`,
    bde_food_hygiene_inspections: `/farms/${farmId}/food-hygiene-inspections`,
    bde_staff_training_records: `/farms/${farmId}/staff-training-records`,
    bde_coshh_assessments: `/farms/${farmId}/coshh-assessments`,
    bde_seed_drilling_records: `/farms/${farmId}/seed-drilling`,
    bde_haulage_confirmations: `/farms/${farmId}/haulage-mobile`,
    bde_third_party_grain_intakes: `/farms/${farmId}/grain-intakes`,
    bde_organic_inputs: `/farms/${farmId}/organic/inputs`,
    bde_organic_fp_inputs: `/farms/${farmId}/organic-fp-input-log`,
    bde_organic_outdoor_access: `/farms/${farmId}/organic-livestock/outdoor-access`,
    bde_organic_treatments: `/farms/${farmId}/organic-livestock/treatments`,
    bde_tb_tests: `/farms/${farmId}/tb-tests`,
    bde_welfare_outcome_assessments: `/farms/${farmId}/welfare-outcomes`,
    bde_ppe_issue_records: `/farms/${farmId}/ppe-issue-records`,
    bde_vine_scouting: `/farms/${farmId}/vineyard-scouting`,
    bde_vine_phenology: `/farms/${farmId}/vineyard-phenology`,
    bde_vine_operation: `/farms/${farmId}/vineyard-operations`,
    bde_vine_harvest: `/farms/${farmId}/vineyard-harvest`,
    bde_winery_age_verification: `/farms/${farmId}/winery-age-verification`,
    bde_winery_reception: `/farms/${farmId}/winery-reception`,
    bde_winery_cellar_ops: `/farms/${farmId}/winery-cellar-ops`,
    bde_winery_fermentation: `/farms/${farmId}/winery-fermentation`,
    bde_winery_pressing: `/farms/${farmId}/winery-pressing`,
    bde_winery_so2: `/farms/${farmId}/winery-so2`,
    bde_grain_stock_stocktakes: `/farms/${farmId}/crop-stock-stocktakes`,
    bde_spray_stock_stocktakes: `/farms/${farmId}/spray-product-stocktakes`,
    bde_poultry_ncp_tests: `/farms/${farmId}/poultry-ncp-tests`,
    bde_poultry_transfers: `/farms/${farmId}/poultry-transfers`,
    bde_poultry_transport_welfare: `/farms/${farmId}/poultry-transport-welfare`,
    bde_ahwr_records: `/farms/${farmId}/ahwr-records`,
    bde_hive_inspections: `/farms/${farmId}/apiary-inspections`,
    bde_straw_baling_operations: `/farms/${farmId}/straw-baling-operations`,
    bde_straw_cartage_journeys: `/farms/${farmId}/straw-baling-operations/${data?.balingOperationId ?? 0}/journeys`,
    bde_straw_bale_inventory: `/farms/${farmId}/straw-bale-inventory`,
    bde_straw_moisture_checks: `/farms/${farmId}/straw-moisture-checks`,
    bde_straw_sale_records: `/farms/${farmId}/straw-sales`,
    bde_silage_haylage_stock: `/farms/${farmId}/silage-haylage-stock`,
    bde_pig_inventory_records: `/farms/${farmId}/pig-inventory`,
    bde_pig_death_records: `/farms/${farmId}/pig-deaths`,
    bde_irrigation_applications: `/farms/${farmId}/irrigation-records`,
  };
  return typeMap[recordType] || null;
}

async function simulateUpload(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));
}

export async function triggerManualSync(): Promise<void> {
  await processQueue();
}
