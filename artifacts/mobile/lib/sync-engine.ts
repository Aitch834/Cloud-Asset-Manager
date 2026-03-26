import { Platform } from "react-native";

import {
  clearCompletedSyncItems,
  getPendingSyncCount,
  getPendingSyncItems,
  kvGet,
  markRecordSynced,
  markSyncItemCompleted,
  markSyncItemFailed,
  getTableForKey,
} from "./database";

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
let isInitialized = false;

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

export async function initialize(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

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
  isInitialized = false;
}

function scheduleSyncAttempt(delayMs: number) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    processQueue();
  }, delayMs);
}

async function processQueue(): Promise<void> {
  if (state.isSyncing) return;
  if (!state.isConnected) return;

  setState({ isSyncing: true, lastError: null });

  try {
    const items = await getPendingSyncItems();

    if (items.length === 0) {
      setState({ isSyncing: false, lastSyncTime: new Date().toISOString() });
      await refreshPendingCount();
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      if (!state.isConnected) {
        setState({ isSyncing: false, lastError: "Connection lost during sync" });
        break;
      }

      try {
        await uploadSyncItem(item);
        await markSyncItemCompleted(item.id);

        const table = getTableForKey(item.record_type);
        if (table) {
          await markRecordSynced(table, item.record_id);
        }
        successCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        await markSyncItemFailed(item.id, errorMsg);
        failCount++;

        const retryDelay = RETRY_DELAYS[Math.min(item.retry_count, RETRY_DELAYS.length - 1)];
        scheduleSyncAttempt(retryDelay);
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
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Sync failed";
    setState({ isSyncing: false, lastError: errorMsg });
    scheduleSyncAttempt(15000);
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

async function uploadSyncItem(item: {
  id: string;
  record_type: string;
  record_id: string;
  data_json: string;
  retry_count: number;
}): Promise<void> {
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!apiDomain) {
    await simulateUpload();
    return;
  }

  const data = JSON.parse(item.data_json);
  const endpoint = getSyncEndpoint(item.record_type, data.farmId);
  if (!endpoint) {
    await simulateUpload();
    return;
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

  const baseUrl = `https://${apiDomain}/api`;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: item.data_json,
  });

  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}`);
  }
}

function getSyncEndpoint(recordType: string, farmId: string): string | null {
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
    bde_feed_records: `/farms/${farmId}/feed-records`,
    bde_water_quality_records: `/farms/${farmId}/water-records`,
    bde_environmental_events: `/farms/${farmId}/environmental-management-events`,
    bde_dairy_calving_records: `/farms/${farmId}/calving-records`,
    bde_dairy_mastitis_records: `/farms/${farmId}/mastitis-records`,
    bde_dairy_bcs_records: `/farms/${farmId}/bcs-records`,
    bde_dairy_mobility_scorings: `/farms/${farmId}/mobility-scorings`,
    bde_poultry_welfare_checks: `/farms/${farmId}/poultry-welfare-checks`,
    bde_pig_welfare_checks: `/farms/${farmId}/pig-welfare-checks`,
    bde_right_to_work_checks: `/farms/${farmId}/right-to-work`,
    bde_irrigation_meter_readings: `/farms/${farmId}/irrigation-readings`,
    bde_pig_farrowing_records: `/farms/${farmId}/pig-farrowing-records`,
    bde_poultry_thinning_records: `/farms/${farmId}/poultry-thinning-records`,
    bde_ai_reproduction_records: `/farms/${farmId}/ai-reproduction-records`,
    bde_vet_prescriptions: `/farms/${farmId}/vet-prescriptions`,
    bde_grain_quality_tests: `/farms/${farmId}/grain-quality-tests`,
    bde_grain_temperature_readings: `/farms/${farmId}/grain-temperature-readings`,
    bde_egg_production_records: `/farms/${farmId}/egg-production-records`,
    bde_slurry_events: `/farms/${farmId}/slurry-events`,
    bde_sfi_actions: `/farms/${farmId}/sfi-actions`,
    bde_sprayer_calibrations: `/farms/${farmId}/sprayer-calibrations`,
    bde_maintenance_logs: `/farms/${farmId}/maintenance-logs`,
    bde_horticulture_records: `/farms/${farmId}/horticulture-records`,
    bde_horticulture_harvest_grades: `/farms/${farmId}/horticulture-harvest-grades`,
    bde_cold_store_temp_readings: `/farms/${farmId}/cold-store-readings`,
    bde_carbon_entries: `/farms/${farmId}/carbon-entries`,
    bde_diversification_records: `/farms/${farmId}/diversification-records`,
    bde_staff_training_records: `/farms/${farmId}/staff-training-records`,
    bde_coshh_assessments: `/farms/${farmId}/coshh-assessments`,
    bde_seed_drilling_records: `/farms/${farmId}/seed-drilling`,
  };
  return typeMap[recordType] || null;
}

async function simulateUpload(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));
}

export async function triggerManualSync(): Promise<void> {
  await processQueue();
}
