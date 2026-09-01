import * as Crypto from "expo-crypto";

import {
  deleteRecord,
  enqueueSyncItem,
  getRecordById,
  getRecords,
  getTableForKey,
  insertRecord,
  kvDelete,
  kvGet,
  kvGetKeysByPrefix,
  kvSet,
  updateRecord,
} from "./database";
import { ORGANIC_INPUT_EDIT_RECORD_TYPE } from "./organicInputOfflineEdit";

export function generateId(): string {
  return Crypto.randomUUID();
}

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await kvSet(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await kvDelete(key);
}

export const AGRI_ENV_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const AGRI_ENV_CACHE_NAMESPACES = [
  "bde_agri_env_projects_cache",
  "bde_agri_env_milestones_cache",
  "bde_agri_env_project_milestones_cache",
] as const;

interface AgriEnvCacheValue {
  cachedAt?: unknown;
}

function getAgriEnvCacheFarmId(key: string): string | null {
  for (const namespace of AGRI_ENV_CACHE_NAMESPACES) {
    const keyPrefix = `${namespace}_`;
    if (key.startsWith(keyPrefix)) {
      const suffix = key.slice(keyPrefix.length);
      if (namespace === "bde_agri_env_project_milestones_cache") {
        // Detail entries are keyed as <farmId>_<projectId>. Split from the
        // right so farm IDs containing underscores remain intact.
        const projectSeparator = suffix.lastIndexOf("_");
        return projectSeparator > 0 ? suffix.slice(0, projectSeparator) : null;
      }
      return suffix || null;
    }
  }
  return null;
}

/**
 * Remove agri-environment cache entries that can no longer be used.
 *
 * Cache keys include the farm ID, so prefix enumeration is needed to clean
 * farms that are no longer in the advisor's current farm list. When an
 * authoritative farm list is available, any cache for another farm is deleted.
 * Invalid and future-dated payloads are removed too; the reader treats them as
 * stale and they should not remain in local storage indefinitely.
 */
export async function clearExpiredAgriEnvCaches(
  managedFarmIds?: Iterable<string | number>,
  now = Date.now(),
): Promise<void> {
  const managedFarmIdSet = managedFarmIds === undefined
    ? null
    : new Set(Array.from(managedFarmIds, String));
  const keys = (
    await Promise.all(
      AGRI_ENV_CACHE_NAMESPACES.map((namespace) => kvGetKeysByPrefix(`${namespace}_`)),
    )
  ).flat();

  await Promise.all(keys.map(async (key) => {
    const farmId = getAgriEnvCacheFarmId(key);
    if (managedFarmIdSet && (!farmId || !managedFarmIdSet.has(farmId))) {
      await kvDelete(key);
      return;
    }

    const raw = await kvGet(key);
    if (!raw) return;

    let cachedAt: unknown;
    try {
      const parsed = JSON.parse(raw) as AgriEnvCacheValue | null;
      cachedAt = parsed?.cachedAt;
    } catch {
      await kvDelete(key);
      return;
    }

    const timestamp = typeof cachedAt === "string" ? new Date(cachedAt).getTime() : Number.NaN;
    if (
      Number.isNaN(timestamp) ||
      timestamp > now ||
      now - timestamp > AGRI_ENV_CACHE_TTL_MS
    ) {
      await kvDelete(key);
    }
  }));
}

export async function getList<T>(key: string, farmId?: string): Promise<T[]> {
  const table = getTableForKey(key);
  if (table) {
    return getRecords<T>(table, farmId);
  }
  const raw = await kvGet(key);
  if (!raw) return [];
  return JSON.parse(raw) as T[];
}

export async function appendToList<T extends { id: string; farmId?: string; createdAt?: string }>(
  key: string,
  item: T,
): Promise<void> {
  const table = getTableForKey(key);
  if (table) {
    await insertRecord(
      table,
      item.id,
      (item as Record<string, unknown>).farmId as string || "",
      item,
      (item as Record<string, unknown>).createdAt as string || new Date().toISOString(),
    );
    await enqueueSyncItem(key, item.id, item);
    return;
  }
  const raw = await kvGet(key);
  const list: T[] = raw ? JSON.parse(raw) : [];
  list.unshift(item);
  await kvSet(key, JSON.stringify(list));
}

export async function updateInList<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>,
): Promise<void> {
  const table = getTableForKey(key);
  if (table) {
    const existing = await getRecordById<T>(table, id);
    if (existing) {
      const updated = { ...existing, ...updates };
      await updateRecord(table, id, updated);
      await enqueueSyncItem(key, id, updated);
    }
    return;
  }
  const raw = await kvGet(key);
  if (!raw) return;
  const list: T[] = JSON.parse(raw);
  const idx = list.findIndex((item) => item.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    await kvSet(key, JSON.stringify(list));
  }
}

export async function removeFromList<T extends { id: string }>(
  key: string,
  id: string,
): Promise<void> {
  const table = getTableForKey(key);
  if (table) {
    await deleteRecord(table, id);
    return;
  }
  const raw = await kvGet(key);
  if (!raw) return;
  const list: T[] = JSON.parse(raw);
  const filtered = list.filter((item) => item.id !== id);
  await kvSet(key, JSON.stringify(filtered));
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: "bde_auth_token",
  AUTH_STATE: "bde_auth_state",
  CURRENT_FARM: "bde_current_farm",
  SPRAY_RECORDS: "bde_spray_records",
  WEATHER_ENTRIES: "bde_weather_entries",
  VISITOR_LOG: "bde_visitor_log",
  CROP_EVENTS: "bde_crop_events",
  SOIL_SAMPLES: "bde_soil_samples",
  FIELD_BOUNDARIES: "bde_field_boundaries",
  BLOCK_BOUNDARIES: "bde_block_boundaries",
  COMPLIANCE_FORMS: "bde_compliance_forms",
  PHOTOS: "bde_photos",
  PENDING_SYNC: "bde_pending_sync",
  USER_PROFILE: "bde_user_profile",
  FARM_LIST: "bde_farm_list",
  MEDICINE_RECORDS: "bde_medicine_records",
  LIVESTOCK_CHECKS: "bde_livestock_checks",
  LIVESTOCK_MOVEMENTS: "bde_livestock_movements",
  HARVEST_RECORDS: "bde_harvest_records",
  NVZ_APPLICATIONS: "bde_nvz_applications",
  EQUIPMENT_DEFECTS: "bde_equipment_defects",
  PEST_CONTROL_VISITS: "bde_pest_control_visits",
  CLEANING_RECORDS: "bde_cleaning_records",
  FIELD_INSPECTIONS: "bde_field_inspections",
  BIOFUEL_FIELD_DECLARATIONS: "bde_biofuel_field_declarations",
  BIOFUEL_DELIVERY_RECORDS: "bde_biofuel_delivery_records",
  HARVEST_TRANSPORT_RECORDS: "bde_harvest_transport_records",
  FIELD_OPERATIONS: "bde_field_operations",
  MORTALITY_RECORDS: "bde_mortality_records",
  DAIRY_CALVING_RECORDS: "bde_dairy_calving_records",
  DAIRY_MASTITIS_RECORDS: "bde_dairy_mastitis_records",
  DAIRY_DCT_RECORDS: "bde_dairy_dct_records",
  DAIRY_BCS_RECORDS: "bde_dairy_bcs_records",
  DAIRY_MOBILITY_SCORINGS: "bde_dairy_mobility_scorings",
  DAIRY_NMR_RECORDING_VISITS: "bde_dairy_nmr_recording_visits",
  FEED_RECORDS: "bde_feed_records",
  WATER_QUALITY_RECORDS: "bde_water_quality_records",
  ENVIRONMENTAL_EVENTS: "bde_environmental_events",
  ENVIRONMENTAL_FEATURES: "bde_environmental_features",
  SEED_DRILLING_RECORDS: "bde_seed_drilling_records",
  WASTE_DISPOSAL_RECORDS: "bde_waste_disposal_records",
  FLY_TIPPING_REPORTS: "bde_fly_tipping_reports",
  ENCAMPMENT_REPORTS: "bde_encampment_reports",
  POULTRY_WELFARE_CHECKS: "bde_poultry_welfare_checks",
  PIG_WELFARE_CHECKS: "bde_pig_welfare_checks",
  PIG_MEDICINE_TREATMENTS: "bde_pig_medicine_treatments",
  PIG_MOVEMENTS: "bde_pig_movements",
  PIG_FCI_DOCUMENTS: "bde_pig_fci_documents",
  PIG_FEED_CONSUMPTION: "bde_pig_feed_consumption",
  PIG_VET_ASSESSMENTS: "bde_pig_vet_assessments",
  PIG_TAIL_BITING_RISKS: "bde_pig_tail_biting_risks",
  RIGHT_TO_WORK_CHECKS: "bde_right_to_work_checks",
  IRRIGATION_METER_READINGS: "bde_irrigation_meter_readings",
  IRRIGATION_APPLICATIONS: "bde_irrigation_applications",
  FUEL_METER_READINGS: "bde_fuel_meter_readings",
  FUEL_STOCK_CHECKS: "bde_fuel_stock_checks",
  FUEL_DRAWDOWNS: "bde_fuel_drawdowns",
  FUEL_TANK_DELIVERIES: "bde_fuel_tank_deliveries",
  PIG_FARROWING_RECORDS: "bde_pig_farrowing_records",
  LAMBING_RECORDS: "bde_lambing_records",
  POULTRY_THINNING_RECORDS: "bde_poultry_thinning_records",
  AI_REPRODUCTION_RECORDS: "bde_ai_reproduction_records",
  VET_PRESCRIPTIONS: "bde_vet_prescriptions",
  GRAIN_QUALITY_TESTS: "bde_grain_quality_tests",
  GRAIN_TEMPERATURE_READINGS: "bde_grain_temperature_readings",
  EGG_PRODUCTION_RECORDS: "bde_egg_production_records",
  SLURRY_EVENTS: "bde_slurry_events",
  SLURRY_SPREADING_RECORDS: "bde_slurry_spreading_records",
  SLURRY_FILL_EVENTS: "bde_slurry_fill_events",
  SLURRY_STORE_INSPECTIONS: "bde_slurry_store_inspections",
  SILAGE_ADDITIVE_RECORDS: "bde_silage_additive_records",
  SILAGE_QUALITY_TESTS: "bde_silage_quality_tests",
  SFI_ACTIONS: "bde_sfi_actions",
  SPRAYER_CALIBRATIONS: "bde_sprayer_calibrations",
  MAINTENANCE_LOGS: "bde_maintenance_logs",
  HORTICULTURE_RECORDS: "bde_horticulture_records",
  HORTICULTURE_HARVEST_GRADES: "bde_horticulture_harvest_grades",
  FRESH_PRODUCE_INTAKE_RECORDS: "bde_fresh_produce_intake_records",
  COLD_STORE_TEMP_READINGS: "bde_cold_store_temp_readings",
  CARBON_ENTRIES: "bde_carbon_entries",
  DIVERSIFICATION_RECORDS: "bde_diversification_records",
  STAFF_TRAINING_RECORDS: "bde_staff_training_records",
  COSHH_ASSESSMENTS: "bde_coshh_assessments",
  ACCIDENT_REPORTS: "bde_accident_reports",
  HAULAGE_CONFIRMATIONS: "bde_haulage_confirmations",
  POULTRY_BIOSECURITY_CLEANOUTS: "bde_poultry_biosecurity_cleanouts",
  POULTRY_DAILY_MORTALITY: "bde_poultry_daily_mortality",
  POULTRY_TREATMENTS: "bde_poultry_treatments",
  POULTRY_ENVIRONMENTAL_LOGS: "bde_poultry_environmental_logs",
  POULTRY_FCI_DOCUMENTS: "bde_poultry_fci_documents",
  POULTRY_BROILER_WELFARE: "bde_poultry_broiler_welfare",
  PIG_RED_TRACTOR_CHECKLISTS: "bde_pig_red_tractor_checklists",
  GRAIN_SALE_RECORDS: "bde_grain_sale_records",
  LIVESTOCK_SALE_RECORDS: "bde_livestock_sale_records",
  DIRECT_SALE_RECORDS: "bde_direct_sale_records",
  MILK_STATEMENT_RECORDS: "bde_milk_statement_records",
  DISEASE_INCIDENTS: "bde_disease_incidents",
  VET_VISITS: "bde_vet_visits",
  GRAIN_STORE_MOVEMENTS: "bde_grain_store_movements",
  SERVICE_JOB_RECORDS: "bde_service_job_records",
  EQUINE_HEALTH_EVENTS: "bde_equine_health_events",
  SHOOTING_RECORDS: "bde_shooting_records",
  FOOD_HYGIENE_INSPECTIONS: "bde_food_hygiene_inspections",
  THIRD_PARTY_GRAIN_INTAKES: "bde_third_party_grain_intakes",
  THIRD_PARTY_GRAIN_OUTLOADINGS: "bde_third_party_grain_outloadings",
  ORGANIC_INSPECTIONS: "bde_organic_inspections",
  ORGANIC_INPUTS: "bde_organic_inputs",
  ORGANIC_INPUT_EDITS: ORGANIC_INPUT_EDIT_RECORD_TYPE,
  ORGANIC_FP_INPUTS: "bde_organic_fp_inputs",
  ORGANIC_OUTDOOR_ACCESS: "bde_organic_outdoor_access",
  ORGANIC_TREATMENTS: "bde_organic_treatments",
  ORGANIC_ARABLE_INPUTS: "bde_organic_arable_inputs",
  ORGANIC_ARABLE_SEEDS: "bde_organic_arable_seeds",
  ORGANIC_ARABLE_HARVESTS: "bde_organic_arable_harvests",
  ORGANIC_ARABLE_STOCK_MOVEMENTS: "bde_organic_arable_stock_movements",
  TB_TEST_RECORDS: "bde_tb_tests",
  WELFARE_OUTCOME_RECORDS: "bde_welfare_outcome_assessments",
  PPE_ISSUE_RECORDS: "bde_ppe_issue_records",
  CASUALTY_SLAUGHTER_RECORDS: "bde_casualty_slaughter_records",
  CARBON_SEQUESTRATION_RECORDS: "bde_carbon_sequestration_records",
  CARBON_REDUCTION_ACTIONS: "bde_carbon_reduction_actions",
  CARBON_AUDIT_RECORDS: "bde_carbon_audit_records",
  BNG_RECORDS: "bde_bng_records",
  GRAIN_STOCK_STOCKTAKES: "bde_grain_stock_stocktakes",
  SPRAY_STOCK_STOCKTAKES: "bde_spray_stock_stocktakes",
  POULTRY_NCP_TESTS: "bde_poultry_ncp_tests",
  POULTRY_TRANSFERS: "bde_poultry_transfers",
  POULTRY_TRANSPORT_WELFARE: "bde_poultry_transport_welfare",
  AHWR_RECORDS: "bde_ahwr_records",
  HIVE_INSPECTIONS: "bde_hive_inspections",
  STRAW_BALE_INVENTORY: "bde_straw_bale_inventory",
  STRAW_MOISTURE_CHECKS: "bde_straw_moisture_checks",
  STRAW_SALE_RECORDS: "bde_straw_sale_records",
  SILAGE_HAYLAGE_STOCK: "bde_silage_haylage_stock",
  PIG_INVENTORY_RECORDS: "bde_pig_inventory_records",
  PIG_DEATH_RECORDS: "bde_pig_death_records",
  AGRI_ENV_PROJECTS_CACHE: "bde_agri_env_projects_cache",
  AGRI_ENV_MILESTONES_CACHE: "bde_agri_env_milestones_cache",
  AGRI_ENV_PROJECT_MILESTONES_CACHE: "bde_agri_env_project_milestones_cache",
  AGRI_ENV_SCHEME_FILTER: "bde_agri_env_scheme_filter",
  AGRI_ENV_STATUS_FILTER: "bde_agri_env_status_filter",
} as const;
