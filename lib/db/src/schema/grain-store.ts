import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Grain Drying Records ─────────────────────────────────────────────────────
export const grainDryingRecordsTable = pgTable("grain_drying_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  dryingDate: date("drying_date").notNull(),
  storeBinRef: text("store_bin_ref"),
  commodity: text("commodity").notNull(),
  lotRef: text("lot_ref"),
  quantityTonnes: numeric("quantity_tonnes", { precision: 8, scale: 3 }),
  intakeMoisturePercent: numeric("intake_moisture_percent", { precision: 5, scale: 2 }),
  targetMoisturePercent: numeric("target_moisture_percent", { precision: 5, scale: 2 }),
  exitMoisturePercent: numeric("exit_moisture_percent", { precision: 5, scale: 2 }),
  dryerType: text("dryer_type"),
  fuelType: text("fuel_type"),
  fuelUsedLitres: numeric("fuel_used_litres", { precision: 8, scale: 2 }),
  fuelUsedKwh: numeric("fuel_used_kwh", { precision: 8, scale: 2 }),
  dryingCostGbp: numeric("drying_cost_gbp", { precision: 8, scale: 2 }),
  operatorName: text("operator_name"),
  dryerFaultOccurred: boolean("dryer_fault_occurred").default(false),
  faultDetails: text("fault_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Grain Quality Tests (Mycotoxin / Pesticide Residue / Official) ───────────
export const grainQualityTestsTable = pgTable("grain_quality_tests", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  testDate: date("test_date").notNull(),
  storeBinRef: text("store_bin_ref"),
  commodity: text("commodity").notNull(),
  lotRef: text("lot_ref"),
  sampleType: text("sample_type").notNull().default("composite"),
  testCategory: text("test_category").notNull(),
  labName: text("lab_name"),
  labSampleRef: text("lab_sample_ref"),
  sampledBy: text("sampled_by"),
  // ─── Mycotoxin results
  doxNivaGenoL: numeric("don_nivalenol_ug_kg", { precision: 8, scale: 2 }),
  zearalenoneUgKg: numeric("zearalenone_ug_kg", { precision: 8, scale: 2 }),
  ochratoxinAUgKg: numeric("ochratoxin_a_ug_kg", { precision: 8, scale: 2 }),
  fumonisinsUgKg: numeric("fumonisins_ug_kg", { precision: 8, scale: 2 }),
  aflatoxinsUgKg: numeric("aflatoxins_ug_kg", { precision: 8, scale: 2 }),
  // ─── Pesticide residue result summary
  pesticideResidueResult: text("pesticide_residue_result"),
  pesticideResiduePass: boolean("pesticide_residue_pass"),
  // ─── Physical tests
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  specificWeightKgHl: numeric("specific_weight_kg_hl", { precision: 5, scale: 2 }),
  screeningPercent: numeric("screening_percent", { precision: 5, scale: 2 }),
  proteinPercent: numeric("protein_percent", { precision: 5, scale: 2 }),
  hagbergFallingNumber: integer("hagberg_falling_number"),
  // ─── Overall
  overallResult: text("overall_result").notNull().default("pending"),
  overallPass: boolean("overall_pass"),
  actionRequired: text("action_required"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Grain Store Conditioning / Aeration Records ──────────────────────────────
export const grainConditioningRecordsTable = pgTable("grain_conditioning_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  conditioningDate: date("conditioning_date").notNull(),
  storeBinRef: text("store_bin_ref"),
  commodity: text("commodity"),
  lotRef: text("lot_ref"),
  conditioningType: text("conditioning_type").notNull().default("aeration"),
  durationHours: numeric("duration_hours", { precision: 6, scale: 2 }),
  ambientTempCelsius: numeric("ambient_temp_celsius", { precision: 5, scale: 2 }),
  grainTempBeforeCelsius: numeric("grain_temp_before_celsius", { precision: 5, scale: 2 }),
  grainTempAfterCelsius: numeric("grain_temp_after_celsius", { precision: 5, scale: 2 }),
  targetTempCelsius: numeric("target_temp_celsius", { precision: 5, scale: 2 }),
  operatorName: text("operator_name"),
  pestActivityObserved: boolean("pest_activity_observed").default(false),
  pestDetails: text("pest_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Third-Party Storage Agreements ──────────────────────────────────────────
export const grainStorageAgreementsTable = pgTable("grain_storage_agreements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  merchantName: text("merchant_name").notNull(),
  merchantAddress: text("merchant_address"),
  merchantPhone: text("merchant_phone"),
  agreementRef: text("agreement_ref"),
  storageLocationName: text("storage_location_name"),
  commodity: text("commodity").notNull(),
  quantityTonnes: numeric("quantity_tonnes", { precision: 8, scale: 3 }),
  depositedDate: date("deposited_date"),
  agreedWithdrawDate: date("agreed_withdraw_date"),
  storageRatePennePerTonnePerWeek: numeric("storage_rate_pence_per_tonne_per_week", { precision: 8, scale: 2 }),
  handlingInPencePerTonne: numeric("handling_in_pence_per_tonne", { precision: 8, scale: 2 }),
  handlingOutPencePerTonne: numeric("handling_out_pence_per_tonne", { precision: 8, scale: 2 }),
  status: text("status").notNull().default("active"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
