import { Platform } from "react-native";

import {
  clearCompletedSyncItems,
  getPendingSyncCount,
  getPendingSyncItems,
  kvGet,
  kvSet,
  kvDelete,
  hasPendingSyncItem,
  markRecordSynced,
  markSyncItemCompleted,
  markSyncItemFailed,
  getTableForKey,
  insertRecord,
  enqueueSyncItem,
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

export async function initialize(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  await migrateVineOperationsKey();
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

  const data = JSON.parse(item.data_json) as Record<string, unknown>;
  const endpoint = getSyncEndpoint(item.record_type, data.farmId as string, data);
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

  const mappedData = remapForApi(item.record_type, data);
  const baseUrl = `https://${apiDomain}/api`;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(mappedData),
  });

  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}`);
  }
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
  if (recordType === "bde_organic_fp_inputs") {
    return {
      ...data,
      inputName: data.productName,
      applicationDate: data.dateOfUse,
      quantityApplied: data.quantityAmount,
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
  };
  return typeMap[recordType] || null;
}

async function simulateUpload(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));
}

export async function triggerManualSync(): Promise<void> {
  await processQueue();
}
