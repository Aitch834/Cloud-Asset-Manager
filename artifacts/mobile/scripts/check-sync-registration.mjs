#!/usr/bin/env node
/**
 * check-sync-registration.mjs
 *
 * Guards against the offline-record "stuck forever" failure mode.
 *
 * Background
 * ----------
 * Every mobile offline record type has two independent registration points
 * that must both be kept in sync:
 *
 *   1. TABLE_MAP in artifacts/mobile/lib/database.ts
 *      Maps the KV key (e.g. "bde_vine_operation") to its local SQLite table.
 *      The sync engine calls getTableForKey() after a successful upload to mark
 *      the record as locally-synced.  If the key is absent, the local `synced`
 *      flag is never cleared — the sync badge stays permanently.
 *
 *   2. typeMap inside getSyncEndpoint() in artifacts/mobile/lib/sync-engine.ts
 *      Maps the same KV key to its API endpoint.  If the key is absent,
 *      getSyncEndpoint() returns null and uploadSyncItem() falls through to
 *      simulateUpload() — data is silently discarded without reaching the server.
 *
 * Three source-of-truth registries feed into every call to enqueueSyncItem():
 *
 *   A. STORAGE_KEYS in artifacts/mobile/lib/storage.ts
 *      Every declared storage key that a screen can pass to appendToList()
 *      (which internally calls enqueueSyncItem). If a new key is added here
 *      but omitted from the sync maps, CI catches it.
 *
 *   B. Direct literal strings in enqueueSyncItem() / replacePendingSyncItem()
 *      calls outside storage.ts (e.g. migration helpers in sync-engine.ts).
 *
 * Failure conditions (all exit 1)
 * --------------------------------
 *   1. TABLE_MAP key absent from typeMap or ENDPOINT_ONLY_KEYS
 *      → data-loss risk: records saved locally, silently discarded on sync.
 *
 *   2. typeMap key absent from TABLE_MAP and ENDPOINT_ONLY_KEYS
 *      → badge-stuck risk: local synced flag never cleared after upload.
 *
 *   3. ENDPOINT_ONLY_KEYS entry no longer in getSyncEndpoint()
 *      → stale allowlist; remove the entry.
 *
 *   4. STORAGE_KEYS bde_* value not in TABLE_MAP, typeMap, ENDPOINT_ONLY_KEYS,
 *      NON_SYNC_KEYS, or SPECIAL_SYNC_KEYS
 *      → a new enqueue-capable key that has no registered endpoint and no
 *        documented reason for the omission.
 *
 *   5. Direct enqueueSyncItem/replacePendingSyncItem literal call uses a bde_*
 *      key not in TABLE_MAP, typeMap, ENDPOINT_ONLY_KEYS, or SPECIAL_SYNC_KEYS.
 *      → same data-loss risk as condition 1.
 *
 * Adding a new record type
 * ------------------------
 *   Option 1 — Uses insertRecord() + enqueueSyncItem() for local-first storage:
 *     Add the key to TABLE_MAP (database.ts), typeMap (sync-engine.ts), and
 *     STORAGE_KEYS (storage.ts).
 *
 *   Option 2 — Enqueue-only (no local insertRecord row needed):
 *     Add the key to typeMap (sync-engine.ts), STORAGE_KEYS (storage.ts), and
 *     ENDPOINT_ONLY_KEYS below with a brief comment.
 *
 *   Option 3 — Not synced (cache/auth/UI state/future offline):
 *     Add the key to STORAGE_KEYS (storage.ts) and NON_SYNC_KEYS below
 *     with a brief comment.
 *
 *   Option 4 — Special upload logic (not in typeMap but handled in uploadSyncItem):
 *     Add the key to STORAGE_KEYS (storage.ts) and SPECIAL_SYNC_KEYS below
 *     with a brief comment pointing to the special handler.
 *
 * Usage
 *   node artifacts/mobile/scripts/check-sync-registration.mjs           # normal run
 *   node artifacts/mobile/scripts/check-sync-registration.mjs --self-test # parser tests only
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_DIR = path.resolve(__dirname, "..");
const DATABASE_TS = path.resolve(MOBILE_DIR, "lib/database.ts");
const SYNC_ENGINE_TS = path.resolve(MOBILE_DIR, "lib/sync-engine.ts");
const STORAGE_TS = path.resolve(MOBILE_DIR, "lib/storage.ts");

// ---------------------------------------------------------------------------
// ENDPOINT_ONLY_KEYS
// Keys in typeMap that do NOT use insertRecord() for local storage.
// Every key here is intentional. A new typeMap key missing from both
// TABLE_MAP and this list will fail CI (check 2 above).
// ---------------------------------------------------------------------------
const ENDPOINT_ONLY_KEYS = new Set([
  // Special-cased in getSyncEndpoint() — intakeId embedded in the endpoint path
  "bde_third_party_grain_outloadings",
  // Cleaning / operations — enqueue-only pattern (no local insertRecord row)
  "bde_cleaning_records",
  "bde_casualty_slaughter_records",
  "bde_environmental_events",
  // Dairy — readings/assessments enqueued directly
  "bde_dairy_calving_records",
  "bde_dairy_mastitis_records",
  "bde_dairy_bcs_records",
  "bde_dairy_mobility_scorings",
  // Poultry — welfare/production/biosecurity forms enqueued directly
  "bde_poultry_welfare_checks",
  "bde_poultry_daily_mortality",
  "bde_poultry_treatments",
  "bde_poultry_environmental_logs",
  "bde_poultry_fci_documents",
  "bde_poultry_broiler_welfare",
  "bde_poultry_biosecurity_cleanouts",
  "bde_poultry_thinning_records",
  "bde_poultry_ncp_tests",
  // Pig — welfare/production/health forms enqueued directly
  "bde_pig_welfare_checks",
  "bde_pig_red_tractor_checklists",
  "bde_pig_medicine_treatments",
  "bde_pig_movements",
  "bde_pig_fci_documents",
  "bde_pig_feed_consumption",
  "bde_pig_vet_assessments",
  "bde_pig_tail_biting_risks",
  "bde_pig_farrowing_records",
  // HR / compliance — enqueue-only
  "bde_right_to_work_checks",
  "bde_staff_training_records",
  "bde_coshh_assessments",
  // Irrigation / water — meter readings enqueued directly
  "bde_irrigation_meter_readings",
  // Fuel / energy — readings and stock checks enqueued directly
  "bde_fuel_meter_readings",
  "bde_fuel_stock_checks",
  "bde_fuel_drawdowns",
  "bde_fuel_tank_deliveries",
  // Veterinary / health — enqueue-only
  "bde_ai_reproduction_records",
  "bde_vet_prescriptions",
  // Grain — quality/temperature logs enqueued directly
  "bde_grain_quality_tests",
  "bde_grain_temperature_readings",
  // Poultry / eggs — production logs enqueued directly
  "bde_egg_production_records",
  // Land / waste — reports enqueued directly
  "bde_encampment_reports",
  "bde_waste_disposal_records",
  // Slurry — events and inspections enqueued directly
  "bde_slurry_events",
  "bde_slurry_spreading_records",
  "bde_slurry_fill_events",
  "bde_slurry_store_inspections",
  // Silage — additive records and quality tests enqueued directly
  "bde_silage_additive_records",
  "bde_silage_quality_tests",
  // Arable / agri-environment — enqueue-only
  "bde_sfi_actions",
  "bde_seed_drilling_records",
  "bde_carbon_entries",
  // Machinery / horticulture — enqueue-only
  "bde_sprayer_calibrations",
  "bde_maintenance_logs",
  "bde_horticulture_records",
  "bde_horticulture_harvest_grades",
  "bde_fresh_produce_intake_records",
  "bde_cold_store_temp_readings",
  // Diversification / rural — enqueue-only
  "bde_diversification_records",
  "bde_equine_health_events",
  "bde_shooting_records",
  "bde_food_hygiene_inspections",
  // Grain / stocktakes — enqueue-only
  "bde_grain_stock_stocktakes",
  "bde_spray_stock_stocktakes",
  "bde_third_party_grain_intakes",
  // Viticulture — scouting/phenology enqueued directly (vine_operation/harvest
  // ARE in TABLE_MAP; scouting/phenology are not)
  "bde_vine_scouting",
  "bde_vine_phenology",
  // Winery — cellar-ops sub-types enqueued directly
  "bde_winery_age_verification",
  "bde_winery_reception",
  "bde_winery_cellar_ops",
  "bde_winery_fermentation",
  "bde_winery_pressing",
  "bde_winery_so2",
  // Apiary
  "bde_ahwr_records",
  "bde_hive_inspections",
  // Straw — baling + sub-operations enqueued directly
  "bde_straw_baling_operations",
  "bde_straw_cartage_journeys",
  "bde_straw_bale_inventory",
  "bde_straw_moisture_checks",
  "bde_straw_sale_records",
  // Silage / forage stock
  "bde_silage_haylage_stock",
]);

// ---------------------------------------------------------------------------
// NON_SYNC_KEYS
// STORAGE_KEYS bde_* values that are intentionally NOT enqueued to the server.
// These are auth/session state, UI state, cache data, or future offline records
// not yet connected to an API endpoint.
// ---------------------------------------------------------------------------
const NON_SYNC_KEYS = new Set([
  // Auth / session — never sent to server via sync queue
  "bde_auth_token",
  "bde_auth_state",
  "bde_user_profile",
  // Farm / UI state — read from server, never pushed via sync
  "bde_current_farm",
  "bde_farm_list",
  "bde_block_boundaries",
  // Internal sync-engine state — not a record type
  "bde_pending_sync",
  // Environmental features — stored via appendToList KV fallback (no TABLE_MAP entry),
  // so appendToList() never calls enqueueSyncItem(); local-only geometry store
  "bde_environmental_features",
  // Agri-env cache — downloaded reference data, never uploaded
  "bde_agri_env_projects_cache",
  "bde_agri_env_milestones_cache",
  "bde_agri_env_transactions_cache",
  "bde_agri_env_project_milestones_cache",
  "bde_agri_env_scheme_filter",
  // Agri-env status filter — per-farm UI preference, never uploaded
  "bde_agri_env_status_filter",
  // Records not yet connected to an API endpoint (future offline capability)
  "bde_harvest_transport_records",
  "bde_dairy_dct_records",
  "bde_dairy_nmr_recording_visits",
  "bde_lambing_records",
  "bde_grain_sale_records",
  "bde_livestock_sale_records",
  "bde_direct_sale_records",
  "bde_milk_statement_records",
  "bde_disease_incidents",
  "bde_vet_visits",
  "bde_grain_store_movements",
  "bde_service_job_records",
  "bde_organic_inspections",
  "bde_organic_arable_inputs",
  "bde_organic_arable_seeds",
  "bde_organic_arable_harvests",
  "bde_organic_arable_stock_movements",
  "bde_carbon_sequestration_records",
  "bde_carbon_reduction_actions",
  "bde_carbon_audit_records",
  "bde_bng_records",
  "bde_accident_reports",
]);

// ---------------------------------------------------------------------------
// SPECIAL_SYNC_KEYS
// Keys that are enqueued via enqueueSyncItem/replacePendingSyncItem but handled
// by special branches in uploadSyncItem() rather than by typeMap lookup.
// ---------------------------------------------------------------------------
const SPECIAL_SYNC_KEYS = new Set([
  // Handled via the organicInputEdit branch in uploadSyncItem() — PUT to
  // /farms/:id/organic/inputs/:serverId using parsed edit metadata.
  "bde_organic_input_edits",
]);

// ---------------------------------------------------------------------------
// ALL_KNOWN_SYNC_KEYS: the union of every intentional enqueue-capable key.
// A literal bde_* key passed to enqueueSyncItem must appear in this set.
// ---------------------------------------------------------------------------
// (Populated after extracting TABLE_MAP and typeMap at runtime.)

// ---------------------------------------------------------------------------
// Extract the body of a named function from source text.
// ---------------------------------------------------------------------------
function extractFunctionBody(src, functionSignatureSubstring) {
  const fnStart = src.indexOf(functionSignatureSubstring);
  if (fnStart === -1) {
    throw new Error(`Could not find function matching "${functionSignatureSubstring}" in source`);
  }
  const openBrace = src.indexOf("{", fnStart);
  if (openBrace === -1) throw new Error("No opening brace found after function signature");

  let depth = 0;
  let endIdx = openBrace;
  for (let i = openBrace; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  return src.slice(openBrace, endIdx + 1);
}

// ---------------------------------------------------------------------------
// Parse TABLE_MAP from database.ts
// ---------------------------------------------------------------------------
function extractTableMapKeys(src) {
  const block = extractFunctionBody(src, "const TABLE_MAP");
  const keyRe = /^\s+(bde_\w+)\s*:/gm;
  const keys = [];
  let m;
  while ((m = keyRe.exec(block)) !== null) keys.push(m[1]);
  if (keys.length === 0) throw new Error("TABLE_MAP appears empty — check the source file");
  return keys;
}

// ---------------------------------------------------------------------------
// Parse getSyncEndpoint() — restricted to that function's body only.
// Does NOT scan the whole file, so remapForApi()'s if-branches are never
// mistaken for endpoint registrations.
// ---------------------------------------------------------------------------
function extractSyncEndpointKeys(src) {
  const fnBody = extractFunctionBody(src, "function getSyncEndpoint(");
  const keys = new Set();

  // Special-case branches inside getSyncEndpoint only
  const specialRe = /if\s*\(\s*recordType\s*===\s*["'](bde_\w+)["']/g;
  let sm;
  while ((sm = specialRe.exec(fnBody)) !== null) keys.add(sm[1]);

  // typeMap object inside the function body
  const tmStart = fnBody.indexOf("const typeMap");
  if (tmStart === -1) throw new Error("Could not find typeMap inside getSyncEndpoint");
  const tmBlock = extractFunctionBody(fnBody.slice(tmStart), "{");
  const keyRe = /^\s+(bde_\w+)\s*:/gm;
  let m;
  while ((m = keyRe.exec(tmBlock)) !== null) keys.add(m[1]);

  if (keys.size === 0) throw new Error("getSyncEndpoint typeMap appears empty — check the source file");
  return keys;
}

// ---------------------------------------------------------------------------
// Parse all bde_* string values from the STORAGE_KEYS object in storage.ts.
// These are every storage key a screen can legitimately pass to appendToList()
// (which routes to enqueueSyncItem).
// ---------------------------------------------------------------------------
function extractStorageKeys(src) {
  const block = extractFunctionBody(src, "export const STORAGE_KEYS");
  // Values: either "bde_..." literals or identifiers like ORGANIC_INPUT_EDIT_RECORD_TYPE
  const literalRe = /:\s*["'](bde_\w+)["']/g;
  const keys = new Set();
  let m;
  while ((m = literalRe.exec(block)) !== null) keys.add(m[1]);
  if (keys.size === 0) throw new Error("STORAGE_KEYS appears empty — check storage.ts");
  return keys;
}

// ---------------------------------------------------------------------------
// Scan source files for direct literal enqueueSyncItem / replacePendingSyncItem
// calls that pass a "bde_..." string as the first argument.
// Skips test files and the storage/sync-engine/database files where the
// indirect pattern (key as variable) is the expected usage.
// ---------------------------------------------------------------------------
function* walkTs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git", "__tests__"].includes(entry.name)) continue;
      yield* walkTs(full);
    } else if (/\.tsx?$/.test(entry.name)) {
      yield full;
    }
  }
}

function extractDirectEnqueueLiterals(mobileDir, skipFiles) {
  const skipSet = new Set(skipFiles.map((f) => path.resolve(f)));
  const keys = new Map(); // key → [file, ...]
  const callRe = /(?:enqueueSyncItem|replacePendingSyncItem)\(\s*["'](bde_\w+)["']/g;
  for (const file of walkTs(mobileDir)) {
    if (skipSet.has(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    let m;
    while ((m = callRe.exec(src)) !== null) {
      const key = m[1];
      if (!keys.has(key)) keys.set(key, []);
      keys.get(key).push(path.relative(process.cwd(), file));
    }
  }
  return keys;
}

// ---------------------------------------------------------------------------
// Self-tests: verify the parsers handle realistic regressions.
// ---------------------------------------------------------------------------
function runSelfTests() {
  let passed = 0;
  let failed = 0;

  function assert(label, condition) {
    if (condition) { console.log(`  ✓ ${label}`); passed++; }
    else { console.error(`  ✗ ${label}`); failed++; }
  }

  console.log("\nRunning parser self-tests…\n");

  // --- Fixture: a key in remapForApi if-branch but NOT in getSyncEndpoint ---
  const fixtureEngine = `
    function remapForApi(recordType, data) {
      if (recordType === "bde_only_in_remap") { return { ...data }; }
      return data;
    }
    function getSyncEndpoint(recordType, farmId, data) {
      if (recordType === "bde_special_case" && data?.id) {
        return "/farms/" + farmId + "/special";
      }
      const typeMap = {
        bde_real_record: "/farms/" + farmId + "/real",
      };
      return typeMap[recordType] || null;
    }
  `;

  const syncKeys = extractSyncEndpointKeys(fixtureEngine);
  assert("bde_real_record (in typeMap) is detected", syncKeys.has("bde_real_record"));
  assert("bde_special_case (in getSyncEndpoint if-branch) is detected", syncKeys.has("bde_special_case"));
  assert("bde_only_in_remap (only in remapForApi) is NOT detected", !syncKeys.has("bde_only_in_remap"));

  // --- Check A: TABLE_MAP key absent from getSyncEndpoint triggers failure ---
  const fixtureDb = `
    const TABLE_MAP = {
      bde_real_record: "real_records",
      bde_only_in_remap: "remap_only_table",
    };
  `;
  const tableKeys = extractTableMapKeys(fixtureDb);
  const missingFromSync = tableKeys.filter(
    (k) => !syncKeys.has(k) && !ENDPOINT_ONLY_KEYS.has(k),
  );
  assert("bde_only_in_remap (TABLE_MAP but not getSyncEndpoint) triggers check 1", missingFromSync.includes("bde_only_in_remap"));
  assert("bde_real_record (present in both) does NOT trigger check 1", !missingFromSync.includes("bde_real_record"));

  // --- Check B: new typeMap key absent from TABLE_MAP and ENDPOINT_ONLY_KEYS ---
  const tableSet = new Set(tableKeys);
  const keysWithNew = new Set([...syncKeys, "bde_new_unregistered"]);
  const unregistered = [...keysWithNew].filter(
    (k) => !tableSet.has(k) && !ENDPOINT_ONLY_KEYS.has(k),
  );
  assert("bde_new_unregistered (typeMap, no TABLE_MAP, no allowlist) triggers check 2", unregistered.includes("bde_new_unregistered"));
  assert("bde_real_record (in TABLE_MAP) does NOT trigger check 2", !unregistered.includes("bde_real_record"));

  // --- Check 4: STORAGE_KEYS bde_* with no endpoint and no allowlist entry ---
  const fixtureStorage = `
    export const STORAGE_KEYS = {
      REAL: "bde_real_record",
      UNREGISTERED: "bde_unregistered_storage_key",
      CACHE: "bde_some_cache",
    } as const;
  `;
  const storageKeys = extractStorageKeys(fixtureStorage);
  const allKnown = new Set([...tableSet, ...syncKeys, ...ENDPOINT_ONLY_KEYS, ...NON_SYNC_KEYS, ...SPECIAL_SYNC_KEYS]);
  allKnown.add("bde_some_cache"); // simulate it being in NON_SYNC_KEYS
  const unregisteredStorage = [...storageKeys].filter((k) => !allKnown.has(k));
  assert("bde_unregistered_storage_key triggers check 4", unregisteredStorage.includes("bde_unregistered_storage_key"));
  assert("bde_real_record (in TABLE_MAP) does NOT trigger check 4", !unregisteredStorage.includes("bde_real_record"));
  assert("bde_some_cache (in NON_SYNC_KEYS) does NOT trigger check 4", !unregisteredStorage.includes("bde_some_cache"));

  // --- Check 5: direct enqueueSyncItem literal with unregistered key ---
  // (parser tested by direct regex — verify it extracts the right key)
  const fixtureDirectCall = `
    async function migrateX() {
      await enqueueSyncItem("bde_unregistered_direct", id, entry);
    }
  `;
  const directRe = /(?:enqueueSyncItem|replacePendingSyncItem)\(\s*["'](bde_\w+)["']/g;
  const directKeys = new Set();
  let dm;
  while ((dm = directRe.exec(fixtureDirectCall)) !== null) directKeys.add(dm[1]);
  assert("bde_unregistered_direct (direct literal call) is extracted", directKeys.has("bde_unregistered_direct"));

  console.log(`\nSelf-tests: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const selfTestMode = process.argv.includes("--self-test");
if (selfTestMode) {
  const ok = runSelfTests();
  process.exit(ok ? 0 : 1);
}

// Always run self-tests first to validate parser soundness.
const selfTestOk = runSelfTests();
if (!selfTestOk) {
  console.error("✗ Parser self-tests failed — the check cannot be trusted. Fix the script before re-running.\n");
  process.exit(1);
}

const dbSrc = fs.readFileSync(DATABASE_TS, "utf8");
const seSrc = fs.readFileSync(SYNC_ENGINE_TS, "utf8");
const storageSrc = fs.readFileSync(STORAGE_TS, "utf8");

const tableMapKeys = extractTableMapKeys(dbSrc);
const syncEndpointKeys = extractSyncEndpointKeys(seSrc);
const storageKeyValues = extractStorageKeys(storageSrc);
const directEnqueueLiterals = extractDirectEnqueueLiterals(MOBILE_DIR, [
  DATABASE_TS, SYNC_ENGINE_TS, STORAGE_TS,
]);

const tableMapSet = new Set(tableMapKeys);
// All intentionally registered / acknowledged keys
const allKnownKeys = new Set([
  ...tableMapKeys,
  ...syncEndpointKeys,
  ...ENDPOINT_ONLY_KEYS,
  ...NON_SYNC_KEYS,
  ...SPECIAL_SYNC_KEYS,
]);
// Keys with a valid upload path (TABLE_MAP + typeMap + ENDPOINT_ONLY_KEYS + SPECIAL_SYNC_KEYS)
const allSyncableKeys = new Set([
  ...tableMapKeys,
  ...syncEndpointKeys,
  ...ENDPOINT_ONLY_KEYS,
  ...SPECIAL_SYNC_KEYS,
]);

let failed = false;

// --- Check 1: TABLE_MAP key missing from typeMap (data-loss risk) ---
const missingFromSync = tableMapKeys.filter(
  (k) => !syncEndpointKeys.has(k) && !ENDPOINT_ONLY_KEYS.has(k),
);
if (missingFromSync.length > 0) {
  failed = true;
  console.error(
    `\n✗ [CHECK 1 FATAL] ${missingFromSync.length} TABLE_MAP key(s) have no entry in getSyncEndpoint().\n` +
    "  Records are saved locally but silently discarded (simulateUpload) instead of uploading.\n" +
    "  Add each to typeMap in artifacts/mobile/lib/sync-engine.ts:\n",
  );
  for (const k of missingFromSync) console.error(`    ${k}`);
  console.error();
}

// --- Check 2: typeMap key missing from TABLE_MAP and ENDPOINT_ONLY_KEYS (badge-stuck risk) ---
const unregisteredTypeMapOnly = [...syncEndpointKeys].filter(
  (k) => !tableMapSet.has(k) && !ENDPOINT_ONLY_KEYS.has(k),
);
if (unregisteredTypeMapOnly.length > 0) {
  failed = true;
  console.error(
    `\n✗ [CHECK 2 FATAL] ${unregisteredTypeMapOnly.length} getSyncEndpoint() key(s) are not in TABLE_MAP or ENDPOINT_ONLY_KEYS.\n` +
    "  The local 'synced' flag is never cleared after upload — sync badge stays permanently.\n" +
    "  Either add to TABLE_MAP (database.ts) or to ENDPOINT_ONLY_KEYS in this script:\n",
  );
  for (const k of unregisteredTypeMapOnly) console.error(`    ${k}`);
  console.error();
}

// --- Check 3: stale ENDPOINT_ONLY_KEYS entry (maintainability) ---
const staleAllowlistEntries = [...ENDPOINT_ONLY_KEYS].filter(
  (k) => !syncEndpointKeys.has(k),
);
if (staleAllowlistEntries.length > 0) {
  failed = true;
  console.error(
    `\n✗ [CHECK 3 FATAL] ${staleAllowlistEntries.length} ENDPOINT_ONLY_KEYS entry/entries no longer in getSyncEndpoint().\n` +
    "  Remove stale entries from ENDPOINT_ONLY_KEYS in this script:\n",
  );
  for (const k of staleAllowlistEntries) console.error(`    ${k}`);
  console.error();
}

// --- Check 4: STORAGE_KEYS bde_* value not acknowledged anywhere ---
const unregisteredStorageKeys = [...storageKeyValues].filter(
  (k) => !allKnownKeys.has(k),
);
if (unregisteredStorageKeys.length > 0) {
  failed = true;
  console.error(
    `\n✗ [CHECK 4 FATAL] ${unregisteredStorageKeys.length} STORAGE_KEYS bde_* value(s) have no endpoint, TABLE_MAP entry,\n` +
    "  or documented reason for the omission.\n" +
    "  Any screen calling appendToList(STORAGE_KEYS.X, item) with these keys will silently lose data.\n" +
    "  For each key, choose one action:\n" +
    "    (a) Add to TABLE_MAP + typeMap (local-first sync)\n" +
    "    (b) Add to typeMap + ENDPOINT_ONLY_KEYS (enqueue-only sync)\n" +
    "    (c) Add to NON_SYNC_KEYS with a comment (cache/auth/future offline)\n" +
    "    (d) Add to SPECIAL_SYNC_KEYS with a comment (custom upload handler)\n",
  );
  for (const k of unregisteredStorageKeys) console.error(`    ${k}`);
  console.error();
}

// --- Check 5: direct literal enqueueSyncItem/replacePendingSyncItem calls ---
const unregisteredDirectCalls = [];
for (const [key, files] of directEnqueueLiterals) {
  if (!allSyncableKeys.has(key)) {
    unregisteredDirectCalls.push({ key, files });
  }
}
if (unregisteredDirectCalls.length > 0) {
  failed = true;
  console.error(
    `\n✗ [CHECK 5 FATAL] ${unregisteredDirectCalls.length} literal string(s) passed directly to enqueueSyncItem/replacePendingSyncItem\n` +
    "  have no registered endpoint.  These records will be silently discarded on sync.\n" +
    "  Add each to TABLE_MAP + typeMap, or ENDPOINT_ONLY_KEYS, or SPECIAL_SYNC_KEYS:\n",
  );
  for (const { key, files } of unregisteredDirectCalls) {
    console.error(`    ${key}`);
    for (const f of files) console.error(`      called from: ${f}`);
  }
  console.error();
}

if (!failed) {
  console.log(
    `✓ [CHECK 1] All ${tableMapKeys.length} TABLE_MAP keys have a getSyncEndpoint() entry.\n` +
    `✓ [CHECK 2] All getSyncEndpoint() keys are in TABLE_MAP or ENDPOINT_ONLY_KEYS (${ENDPOINT_ONLY_KEYS.size} entries).\n` +
    `✓ [CHECK 3] All ENDPOINT_ONLY_KEYS entries are still present in getSyncEndpoint().\n` +
    `✓ [CHECK 4] All ${storageKeyValues.size} STORAGE_KEYS bde_* values are documented (sync/non-sync/special).\n` +
    `✓ [CHECK 5] All ${directEnqueueLiterals.size} direct enqueueSyncItem literal key(s) have a registered endpoint.`,
  );
  process.exit(0);
} else {
  process.exit(1);
}
