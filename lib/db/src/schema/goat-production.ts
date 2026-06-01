import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { herdFlockRegisterTable } from "./livestock";

// ─── Goat Mating Records ──────────────────────────────────────────────────────
export const goatMatingRecordsTable = pgTable("goat_mating_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  matingStartDate: date("mating_start_date").notNull(),
  matingEndDate: date("mating_end_date"),
  buckEarTag: text("buck_ear_tag"),
  buckBreed: text("buck_breed"),
  buckOwner: text("buck_owner"),
  buckHiredOrOwned: text("buck_hired_or_owned").default("owned"),
  doesExposed: integer("does_exposed"),
  expectedKiddingDate: date("expected_kidding_date"),
  progesteroneSpongeUsed: boolean("progesterone_sponge_used").default(false),
  matingMethod: text("mating_method").default("natural"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Goat Pregnancy Scanning Records ─────────────────────────────────────────
export const goatScanningRecordsTable = pgTable("goat_scanning_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  scanDate: date("scan_date").notNull(),
  scannerName: text("scanner_name"),
  scannerCompany: text("scanner_company"),
  totalDoesScanned: integer("total_does_scanned").notNull(),
  doesBarren: integer("does_barren").notNull().default(0),
  doesSingles: integer("does_singles").notNull().default(0),
  doesDoubles: integer("does_doubles").notNull().default(0),
  doesTriples: integer("does_triples").notNull().default(0),
  expectedTotalKids: integer("expected_total_kids"),
  scanningPercentage: numeric("scanning_percentage", { precision: 5, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Goat Weigh-In & Performance Records ─────────────────────────────────────
export const goatWeighRecordsTable = pgTable("goat_weigh_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  weighDate: date("weigh_date").notNull(),
  weighType: text("weigh_type").notNull().default("routine"),
  weighedBy: text("weighed_by"),
  ageClassWeighed: text("age_class_weighed"),
  numberWeighed: integer("number_weighed").notNull(),
  averageWeightKg: numeric("average_weight_kg", { precision: 6, scale: 2 }),
  lowestWeightKg: numeric("lowest_weight_kg", { precision: 6, scale: 2 }),
  highestWeightKg: numeric("highest_weight_kg", { precision: 6, scale: 2 }),
  targetWeightKg: numeric("target_weight_kg", { precision: 6, scale: 2 }),
  dlwgGPerDay: numeric("dlwg_g_per_day", { precision: 6, scale: 1 }),
  daysSincePreviousWeigh: integer("days_since_previous_weigh"),
  bodyConditionScore: numeric("body_condition_score", { precision: 3, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Goat Cull / Draft / Market Records ──────────────────────────────────────
export const goatCullRecordsTable = pgTable("goat_cull_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  cullDate: date("cull_date").notNull(),
  numberCulled: integer("number_culled").notNull(),
  ageClass: text("age_class"),
  reasonForCulling: text("reason_for_culling").notNull(),
  destination: text("destination").notNull(),
  destinationCph: text("destination_cph"),
  averageLiveWeightKg: numeric("average_live_weight_kg", { precision: 6, scale: 2 }),
  averageDeadweightKg: numeric("average_deadweight_kg", { precision: 6, scale: 2 }),
  deadweightKilloutPercent: numeric("deadweight_killout_percent", { precision: 4, scale: 1 }),
  pricePerHeadGbp: numeric("price_per_head_gbp", { precision: 8, scale: 2 }),
  totalValueGbp: numeric("total_value_gbp", { precision: 10, scale: 2 }),
  abattoirName: text("abattoir_name"),
  finishGrade: text("finish_grade"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Goat Vaccination Programmes ──────────────────────────────────────────────
export const goatVaccinationProgrammesTable = pgTable("goat_vaccination_programmes", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  vaccinationDate: date("vaccination_date").notNull(),
  vaccineProduct: text("vaccine_product").notNull(),
  vaccinationCategory: text("vaccination_category").notNull(),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  numberTreated: integer("number_treated").notNull(),
  ageClassTreated: text("age_class_treated"),
  doseVolumeMl: numeric("dose_volume_ml", { precision: 5, scale: 2 }),
  administrationRoute: text("administration_route"),
  withdrawalPeriodDays: integer("withdrawal_period_days").default(0),
  nextDueDate: date("next_due_date"),
  administeredBy: text("administered_by"),
  vetPrescribed: boolean("vet_prescribed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Goat Disease Monitoring ──────────────────────────────────────────────────
export const goatDiseaseMonitoringTable = pgTable("goat_disease_monitoring", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
