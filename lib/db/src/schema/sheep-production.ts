import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { herdFlockRegisterTable } from "./livestock";

// ─── Sheep Flock Register ─────────────────────────────────────────────────────
export const sheepFlocksTable = pgTable("sheep_flocks", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockName: text("flock_name").notNull(),
  flockNumber: text("flock_number"),
  cphNumber: text("cph_number"),
  breed: text("breed"),
  flockType: text("flock_type").notNull().default("breeding"),
  ewesCount: integer("ewes_count").notNull().default(0),
  ramsCount: integer("rams_count").notNull().default(0),
  lambsCount: integer("lambs_count").notNull().default(0),
  hoggetsCount: integer("hoggets_count").notNull().default(0),
  eidTagRange: text("eid_tag_range"),
  location: text("location"),
  isOrganicFlock: boolean("is_organic_flock").notNull().default(false),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Tupping Records ──────────────────────────────────────────────────────────
export const sheepTuppingRecordsTable = pgTable("sheep_tupping_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  tuppingStartDate: date("tupping_start_date").notNull(),
  tuppingEndDate: date("tupping_end_date"),
  ramEarTag: text("ram_ear_tag"),
  ramBreed: text("ram_breed"),
  ramOwner: text("ram_owner"),
  ramHiredOrOwned: text("ram_hired_or_owned").default("owned"),
  numberEwesIntroduced: integer("number_ewes_introduced"),
  expectedLambingDate: date("expected_lambing_date"),
  progesteroneSpongeUsed: boolean("progesterone_sponge_used").default(false),
  raddleColourUsed: text("raddle_colour_used"),
  matingMethod: text("mating_method").default("natural"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Pregnancy Scanning Records ───────────────────────────────────────────────
export const sheepScanningRecordsTable = pgTable("sheep_scanning_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  scanDate: date("scan_date").notNull(),
  scannerName: text("scanner_name"),
  scannerCompany: text("scanner_company"),
  totalEwesScanned: integer("total_ewes_scanned").notNull(),
  ewesBarren: integer("ewes_barren").notNull().default(0),
  ewesSingles: integer("ewes_singles").notNull().default(0),
  ewesDoubles: integer("ewes_doubles").notNull().default(0),
  ewesTriples: integer("ewes_triples").notNull().default(0),
  ewesQuads: integer("ewes_quads").notNull().default(0),
  expectedTotalLambs: integer("expected_total_lambs"),
  scanningPercentage: numeric("scanning_percentage", { precision: 5, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Weigh-In & Performance Records ──────────────────────────────────────────
export const sheepWeighRecordsTable = pgTable("sheep_weigh_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  weighDate: date("weigh_date").notNull(),
  weighType: text("weigh_type").notNull().default("routine"),
  weighedBy: text("weighed_by"),
  ageClassWeighed: text("age_class_weighed"),
  numberWeighed: integer("number_weighed").notNull(),
  averageWeightKg: numeric("average_weight_kg", { precision: 6, scale: 2 }),
  lowestWeightKg: numeric("lowest_weight_kg", { precision: 6, scale: 2 }),
  highestWeightKg: numeric("highest_weight_kg", { precision: 6, scale: 2 }),
  targetWeightKg: numeric("target_weight_kg", { precision: 6, scale: 2 }),
  dlwgGPerDay: numeric("dlwg_g_per_day", { precision: 7, scale: 1 }),
  previousWeighDate: date("previous_weigh_date"),
  previousAverageWeightKg: numeric("previous_average_weight_kg", { precision: 6, scale: 2 }),
  draftedForSaleCount: integer("drafted_for_sale_count").default(0),
  weighBatchRef: text("weigh_batch_ref"),
  animalCategory: text("animal_category"),
  numberOfAnimalsWeighed: integer("number_of_animals_weighed"),
  totalWeightKg: numeric("total_weight_kg", { precision: 8, scale: 2 }),
  daysSincePreviousWeigh: integer("days_since_previous_weigh"),
  bodyConditionScore: numeric("body_condition_score", { precision: 3, scale: 1 }),
  weighingEquipmentId: integer("weighing_equipment_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Shearing Records ─────────────────────────────────────────────────────────
export const sheepShearingRecordsTable = pgTable("sheep_shearing_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  shearingDate: date("shearing_date").notNull(),
  contractor: text("contractor"),
  numberOfAnimalsSheared: integer("number_of_animals_sheared").notNull(),
  totalFleecesKg: numeric("total_fleeces_kg", { precision: 8, scale: 2 }),
  averageFleecKg: numeric("average_fleece_kg", { precision: 5, scale: 2 }),
  woolGrade: text("wool_grade"),
  woolMarketingOrg: text("wool_marketing_org"),
  woolCollectionRef: text("wool_collection_ref"),
  pricePerKgGbp: numeric("price_per_kg_gbp", { precision: 6, scale: 3 }),
  totalValueGbp: numeric("total_value_gbp", { precision: 10, scale: 2 }),
  footBathingCarriedOut: boolean("foot_bathing_carried_out").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Cull / Draft Records ─────────────────────────────────────────────────────
export const sheepCullRecordsTable = pgTable("sheep_cull_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  cullDate: date("cull_date").notNull(),
  numberCulled: integer("number_culled").notNull(),
  ageClass: text("age_class"),
  reasonForCulling: text("reason_for_culling").notNull(),
  destination: text("destination").notNull(),
  destinationCph: text("destination_cph"),
  averageLiveWeightKg: numeric("average_live_weight_kg", { precision: 6, scale: 2 }),
  pricePerHeadGbp: numeric("price_per_head_gbp", { precision: 8, scale: 2 }),
  totalValueGbp: numeric("total_value_gbp", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vaccination Programmes ───────────────────────────────────────────────────
export const sheepVaccinationProgrammesTable = pgTable("sheep_vaccination_programmes", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  vaccinationDate: date("vaccination_date").notNull(),
  vaccineProduct: text("vaccine_product").notNull(),
  vaccinationCategory: text("vaccination_category").notNull(),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  numberTreated: integer("number_treated").notNull(),
  ageClassTreated: text("age_class_treated"),
  doseVolumeMl: numeric("dose_volume_ml", { precision: 5, scale: 2 }),
  administrationRoute: text("administration_route"),
  administeredBy: text("administered_by"),
  vetName: text("vet_name"),
  nextDueDate: date("next_due_date"),
  withdrawalPeriodDays: integer("withdrawal_period_days"),
  withdrawalEndDate: date("withdrawal_end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Sheep Scrapie NTSB / MV Monitoring ──────────────────────────────────────
export const sheepDiseaseMonitoringTable = pgTable("sheep_disease_monitoring", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => herdFlockRegisterTable.id),
  monitoringDate: date("monitoring_date").notNull(),
  monitoringType: text("monitoring_type").notNull(),
  schemeReference: text("scheme_reference"),
  testingBody: text("testing_body"),
  numberOfSamples: integer("number_of_samples"),
  positiveResults: integer("positive_results").default(0),
  negativeResults: integer("negative_results").default(0),
  status: text("status").notNull().default("pending"),
  actionsTaken: text("actions_taken"),
  nextTestDue: date("next_test_due"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Sheep Red Tractor Self-Assessment Checklist ──────────────────────────────
export const sheepRedTractorChecklistTable = pgTable("sheep_red_tractor_checklists", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  assessmentDate: date("assessment_date").notNull(),
  assessorName: text("assessor_name"),
  assessorOrganisation: text("assessor_organisation"),
  certificateNumber: text("certificate_number"),
  certificateExpiryDate: date("certificate_expiry_date"),
  // ─── Section A: Identification & Traceability
  flockRegistrationCurrent: boolean("flock_registration_current").default(false),
  tagRecordsComplete: boolean("tag_records_complete").default(false),
  movementRecordsComplete: boolean("movement_records_complete").default(false),
  // ─── Section B: Medicine & Health
  medicineRecordsComplete: boolean("medicine_records_complete").default(false),
  vetHealthPlanInPlace: boolean("vet_health_plan_in_place").default(false),
  withdrawalPeriodsRecorded: boolean("withdrawal_periods_recorded").default(false),
  prescriptionsOnFile: boolean("prescriptions_on_file").default(false),
  // ─── Section C: Welfare
  mortalityRecordsComplete: boolean("mortality_records_complete").default(false),
  welfareChecksRecorded: boolean("welfare_checks_recorded").default(false),
  lamenessScored: boolean("lameness_scored").default(false),
  castrationTailDockingRecorded: boolean("castration_tail_docking_recorded").default(false),
  disbuddingRecorded: boolean("disbudding_recorded").default(false),
  // ─── Section D: Feed & Water
  feedRecordsComplete: boolean("feed_records_complete").default(false),
  waterAccessAdequate: boolean("water_access_adequate").default(false),
  // ─── Section E: Biosecurity
  biosecurityPlanInPlace: boolean("biosecurity_plan_in_place").default(false),
  visitorLogMaintained: boolean("visitor_log_maintained").default(false),
  scrapieMonitoring: boolean("scrapie_monitoring").default(false),
  // ─── Section F: Staff & Training
  staffTrainingRecords: boolean("staff_training_records").default(false),
  emergencySlaughterCompetency: boolean("emergency_slaughter_competency").default(false),
  // ─── Section G: Environment
  manureManagementPlan: boolean("manure_management_plan").default(false),
  // ─── Overall
  overallStatus: text("overall_status").notNull().default("in-progress"),
  nonConformancesCount: integer("non_conformances_count").default(0),
  nonConformanceDetails: text("non_conformance_details"),
  correctiveActionDeadline: date("corrective_action_deadline"),
  nextAssessmentDue: date("next_assessment_due"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Weighing Equipment Register ─────────────────────────────────────────────
export const weighingEquipmentTable = pgTable("weighing_equipment", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("floor_scale"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchaseDate: date("purchase_date"),
  lastCalibrationDate: date("last_calibration_date"),
  lastCalibrationResult: text("last_calibration_result"),
  calibratedBy: text("calibrated_by"),
  nextCalibrationDue: date("next_calibration_due"),
  calibrationIntervalMonths: integer("calibration_interval_months").default(12),
  location: text("location"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Weighing Equipment Calibration History ───────────────────────────────────
export const weighingEquipmentCalibrationsTable = pgTable("weighing_equipment_calibrations", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => weighingEquipmentTable.id),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  calibrationDate: date("calibration_date").notNull(),
  result: text("result").notNull(),
  calibratedBy: text("calibrated_by"),
  certificateRef: text("certificate_ref"),
  nextDueDate: date("next_due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
