import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { herdFlockRegisterTable } from "./livestock";

// ═══════════════════════════════════════════════════════════════════════════════
// SHEEP DAIRY MODULE
// SCC regulatory limit: 1,500,000 cells/mL (UK/retained-EU Reg 853/2004)
// Tagging: Livestock Information Service (LIS) — not BCMS
// Health monitoring: Maedi-Visna (MV), Johne's
// Assurance: British Sheep Dairying Association (BSDA)
// ═══════════════════════════════════════════════════════════════════════════════

export const sheepDairyMilkRecordsTable = pgTable("sheep_dairy_milk_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  recordDate: timestamp("record_date", { withTimezone: true }).notNull(),
  sessionType: text("session_type"),
  yieldLitres: numeric("yield_litres", { precision: 10, scale: 2 }),
  milkBuyer: text("milk_buyer"),
  collectorReference: text("collector_reference"),
  // On-farm quality measurements
  sccThousands: integer("scc_thousands"),
  tbcCfuMl: integer("tbc_cfu_ml"),
  fatPercent: numeric("fat_percent", { precision: 5, scale: 2 }),
  proteinPercent: numeric("protein_percent", { precision: 5, scale: 2 }),
  milkTemperatureCelsius: numeric("milk_temperature_celsius", { precision: 5, scale: 2 }),
  tempTestedBy: text("temp_tested_by"),
  // Antibiotic residue test
  antibioticResidueTestResult: text("antibiotic_residue_test_result"),
  abrTestedBy: text("abr_tested_by"),
  abrTestKitLot: text("abr_test_kit_lot"),
  // Buyer lab results
  buyerLabResultsStatus: text("buyer_lab_results_status"),
  buyerLabResultsDate: date("buyer_lab_results_date"),
  buyerLabRef: text("buyer_lab_ref"),
  buyerSccThousands: integer("buyer_scc_thousands"),
  buyerTbcCfuMl: integer("buyer_tbc_cfu_ml"),
  buyerFatPercent: numeric("buyer_fat_percent", { precision: 5, scale: 2 }),
  buyerProteinPercent: numeric("buyer_protein_percent", { precision: 5, scale: 2 }),
  // Settlement
  pencePerLitre: numeric("pence_per_litre", { precision: 8, scale: 4 }),
  grossValuePence: integer("gross_value_pence"),
  netPaymentPence: integer("net_payment_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const sheepDairyMastitisRecordsTable = pgTable("sheep_dairy_mastitis_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  incidentDate: timestamp("incident_date", { withTimezone: true }).notNull(),
  eweLisTag: text("ewe_lis_tag"),
  eweName: text("ewe_name"),
  quarterAffected: text("quarter_affected"),
  clinicalSigns: text("clinical_signs"),
  pathogenIdentified: text("pathogen_identified"),
  labSampleTaken: boolean("lab_sample_taken").notNull().default(false),
  labRef: text("lab_ref"),
  treatmentProduct: text("treatment_product"),
  treatmentBatch: text("treatment_batch"),
  treatmentDurationDays: integer("treatment_duration_days"),
  withdrawalMilkDays: integer("withdrawal_milk_days"),
  withdrawalMeatDays: integer("withdrawal_meat_days"),
  milkWithdrawnUntil: date("milk_withdrawn_until"),
  outcome: text("outcome"),
  chronicCase: boolean("chronic_case").notNull().default(false),
  culledDueToMastitis: boolean("culled_due_to_mastitis").notNull().default(false),
  attendingVet: text("attending_vet"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Lambing/kidding for dairy sheep — uses LIS tagging (not BCMS)
// No 36h first-tag rule; EID must be applied at or before first movement
export const sheepDairyKiddingRecordsTable = pgTable("sheep_dairy_kidding_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  lambingDate: timestamp("lambing_date", { withTimezone: true }).notNull(),
  eweLisTag: text("ewe_lis_tag"),
  eweId: integer("ewe_id"),
  birthOutcome: text("birth_outcome").notNull(),
  lambCount: integer("lamb_count").notNull().default(1),
  // Per-lamb fields (stored as comma-separated for multi-birth)
  lambSex: text("lamb_sex"),
  lambEidTag: text("lamb_eid_tag"),
  lambVisualTag: text("lamb_visual_tag"),
  lambBirthWeightKg: numeric("lamb_birth_weight_kg", { precision: 5, scale: 2 }),
  // Birth assistance
  easeScore: integer("ease_score"),
  assistanceRequired: boolean("assistance_required").notNull().default(false),
  assistanceType: text("assistance_type"),
  vetAttended: boolean("vet_attended").notNull().default(false),
  vetName: text("vet_name"),
  // Colostrum management
  colostrumGivenWithin2Hours: boolean("colostrum_given_within_2_hours"),
  colostrumSource: text("colostrum_source"),
  // LIS tagging compliance (no 36h rule — tag before first movement)
  eidApplied: boolean("eid_applied").notNull().default(false),
  eidAppliedDate: date("eid_applied_date"),
  lisTagNumber: text("lis_tag_number"),
  // Ewe recovery
  eweComplications: text("ewe_complications"),
  eweMilkingStatus: text("ewe_milking_status"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const sheepDairyBcsRecordsTable = pgTable("sheep_dairy_bcs_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  assessedBy: text("assessed_by"),
  assessmentStage: text("assessment_stage"),
  eweLisTag: text("ewe_lis_tag"),
  bcsScore: numeric("bcs_score", { precision: 3, scale: 1 }),
  actionRequired: text("action_required"),
  followUpDate: date("follow_up_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const sheepDairyBulkTankRecordsTable = pgTable("sheep_dairy_bulk_tank_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  recordDate: timestamp("record_date", { withTimezone: true }).notNull(),
  recordType: text("record_type").notNull(),
  tankTemperatureCelsius: numeric("tank_temperature_celsius", { precision: 5, scale: 2 }),
  tankCleaned: boolean("tank_cleaned"),
  cleaningProductUsed: text("cleaning_product_used"),
  cleaningProductBatch: text("cleaning_product_batch"),
  antibioticResidueTestRef: text("antibiotic_residue_test_ref"),
  antibioticResidueResult: text("antibiotic_residue_result"),
  tankerDriverName: text("tanker_driver_name"),
  collectionRef: text("collection_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Maedi-Visna (MV) — the sheep equivalent of BVD/Johne's for dairy
// A progressive chronic viral disease; OIE listed; accreditation schemes via SRUC/MAEDI-VISNA
export const sheepDairyMvMonitoringTable = pgTable("sheep_dairy_mv_monitoring", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  testDate: timestamp("test_date", { withTimezone: true }).notNull(),
  testType: text("test_type").notNull(),
  laboratory: text("laboratory"),
  labRef: text("lab_ref"),
  animalsTestedCount: integer("animals_tested_count"),
  positiveCount: integer("positive_count"),
  result: text("result").notNull(),
  mvAccreditationStatus: text("mv_accreditation_status"),
  accreditationBody: text("accreditation_body"),
  actionTaken: text("action_taken"),
  nextTestDue: date("next_test_due"),
  vetName: text("vet_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ═══════════════════════════════════════════════════════════════════════════════
// GOAT DAIRY MODULE
// SCC regulatory limit: 1,000,000 cells/mL (UK/retained-EU Reg 853/2004)
// Tagging: Livestock Information Service (LIS) — not BCMS
// Health monitoring: CAE (Caprine Arthritis Encephalitis), Johne's
// Assurance: British Goat Society (BGS)
// ═══════════════════════════════════════════════════════════════════════════════

export const goatDairyMilkRecordsTable = pgTable("goat_dairy_milk_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  recordDate: timestamp("record_date", { withTimezone: true }).notNull(),
  sessionType: text("session_type"),
  yieldLitres: numeric("yield_litres", { precision: 10, scale: 2 }),
  milkBuyer: text("milk_buyer"),
  collectorReference: text("collector_reference"),
  // On-farm quality measurements
  sccThousands: integer("scc_thousands"),
  tbcCfuMl: integer("tbc_cfu_ml"),
  fatPercent: numeric("fat_percent", { precision: 5, scale: 2 }),
  proteinPercent: numeric("protein_percent", { precision: 5, scale: 2 }),
  milkTemperatureCelsius: numeric("milk_temperature_celsius", { precision: 5, scale: 2 }),
  tempTestedBy: text("temp_tested_by"),
  // Antibiotic residue test
  antibioticResidueTestResult: text("antibiotic_residue_test_result"),
  abrTestedBy: text("abr_tested_by"),
  abrTestKitLot: text("abr_test_kit_lot"),
  // Buyer lab results
  buyerLabResultsStatus: text("buyer_lab_results_status"),
  buyerLabResultsDate: date("buyer_lab_results_date"),
  buyerLabRef: text("buyer_lab_ref"),
  buyerSccThousands: integer("buyer_scc_thousands"),
  buyerTbcCfuMl: integer("buyer_tbc_cfu_ml"),
  buyerFatPercent: numeric("buyer_fat_percent", { precision: 5, scale: 2 }),
  buyerProteinPercent: numeric("buyer_protein_percent", { precision: 5, scale: 2 }),
  // Settlement
  pencePerLitre: numeric("pence_per_litre", { precision: 8, scale: 4 }),
  grossValuePence: integer("gross_value_pence"),
  netPaymentPence: integer("net_payment_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const goatDairyMastitisRecordsTable = pgTable("goat_dairy_mastitis_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  incidentDate: timestamp("incident_date", { withTimezone: true }).notNull(),
  doeLisTag: text("doe_lis_tag"),
  doeName: text("doe_name"),
  halfAffected: text("half_affected"),
  clinicalSigns: text("clinical_signs"),
  pathogenIdentified: text("pathogen_identified"),
  labSampleTaken: boolean("lab_sample_taken").notNull().default(false),
  labRef: text("lab_ref"),
  treatmentProduct: text("treatment_product"),
  treatmentBatch: text("treatment_batch"),
  treatmentDurationDays: integer("treatment_duration_days"),
  withdrawalMilkDays: integer("withdrawal_milk_days"),
  withdrawalMeatDays: integer("withdrawal_meat_days"),
  milkWithdrawnUntil: date("milk_withdrawn_until"),
  outcome: text("outcome"),
  chronicCase: boolean("chronic_case").notNull().default(false),
  culledDueToMastitis: boolean("culled_due_to_mastitis").notNull().default(false),
  attendingVet: text("attending_vet"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Kidding records for dairy goats — LIS tagging, EID before first movement
export const goatDairyKiddingRecordsTable = pgTable("goat_dairy_kidding_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  kiddingDate: timestamp("kidding_date", { withTimezone: true }).notNull(),
  doeLisTag: text("doe_lis_tag"),
  doeId: integer("doe_id"),
  birthOutcome: text("birth_outcome").notNull(),
  kidCount: integer("kid_count").notNull().default(1),
  kidSex: text("kid_sex"),
  kidEidTag: text("kid_eid_tag"),
  kidVisualTag: text("kid_visual_tag"),
  kidBirthWeightKg: numeric("kid_birth_weight_kg", { precision: 5, scale: 2 }),
  easeScore: integer("ease_score"),
  assistanceRequired: boolean("assistance_required").notNull().default(false),
  assistanceType: text("assistance_type"),
  vetAttended: boolean("vet_attended").notNull().default(false),
  vetName: text("vet_name"),
  colostrumGivenWithin2Hours: boolean("colostrum_given_within_2_hours"),
  colostrumSource: text("colostrum_source"),
  eidApplied: boolean("eid_applied").notNull().default(false),
  eidAppliedDate: date("eid_applied_date"),
  lisTagNumber: text("lis_tag_number"),
  doeComplications: text("doe_complications"),
  doeMilkingStatus: text("doe_milking_status"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const goatDairyBcsRecordsTable = pgTable("goat_dairy_bcs_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  assessedBy: text("assessed_by"),
  assessmentStage: text("assessment_stage"),
  doeLisTag: text("doe_lis_tag"),
  bcsScore: numeric("bcs_score", { precision: 3, scale: 1 }),
  actionRequired: text("action_required"),
  followUpDate: date("follow_up_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const goatDairyBulkTankRecordsTable = pgTable("goat_dairy_bulk_tank_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  recordDate: timestamp("record_date", { withTimezone: true }).notNull(),
  recordType: text("record_type").notNull(),
  tankTemperatureCelsius: numeric("tank_temperature_celsius", { precision: 5, scale: 2 }),
  tankCleaned: boolean("tank_cleaned"),
  cleaningProductUsed: text("cleaning_product_used"),
  cleaningProductBatch: text("cleaning_product_batch"),
  antibioticResidueTestRef: text("antibiotic_residue_test_ref"),
  antibioticResidueResult: text("antibiotic_residue_result"),
  tankerDriverName: text("tanker_driver_name"),
  collectionRef: text("collection_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// CAE — Caprine Arthritis Encephalitis: the goat equivalent of MV/BVD
// Progressive viral disease; management through CAEV accreditation programmes
export const goatDairyCaeMonitoringTable = pgTable("goat_dairy_cae_monitoring", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  testDate: timestamp("test_date", { withTimezone: true }).notNull(),
  testType: text("test_type").notNull(),
  laboratory: text("laboratory"),
  labRef: text("lab_ref"),
  animalsTestedCount: integer("animals_tested_count"),
  positiveCount: integer("positive_count"),
  result: text("result").notNull(),
  caeAccreditationStatus: text("cae_accreditation_status"),
  accreditationBody: text("accreditation_body"),
  actionTaken: text("action_taken"),
  nextTestDue: date("next_test_due"),
  vetName: text("vet_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
