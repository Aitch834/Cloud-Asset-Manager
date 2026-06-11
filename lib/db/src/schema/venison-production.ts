import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { herdFlockRegisterTable } from "./livestock";

// ─── Venison Cull Records ──────────────────────────────────────────────────────
export const venisonCullRecordsTable = pgTable("venison_cull_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  cullDate: date("cull_date").notNull(),
  stalkerName: text("stalker_name"),
  species: text("species").notNull(),
  sex: text("sex"),
  ageClass: text("age_class"),
  locationBeat: text("location_beat"),
  larderNumber: text("larder_number"),
  carcassNumber: text("carcass_number"),
  liveweightKg: numeric("liveweight_kg", { precision: 6, scale: 2 }),
  grallochWeightKg: numeric("gralloch_weight_kg", { precision: 6, scale: 2 }),
  carcassWeightKg: numeric("carcass_weight_kg", { precision: 6, scale: 2 }),
  killoutPercent: numeric("killout_percent", { precision: 4, scale: 1 }),
  cullMethod: text("cull_method").default("rifle"),
  cullReason: text("cull_reason").notNull(),
  foodSafetyInspectionResult: text("food_safety_inspection_result").default("passed"),
  notifiableDiseaseSupect: boolean("notifiable_disease_suspect").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Venison Carcass Sales ─────────────────────────────────────────────────────
export const venisonCarcassSalesTable = pgTable("venison_carcass_sales", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  saleDate: date("sale_date").notNull(),
  facilityType: text("facility_type").notNull(),
  species: text("species"),
  numberCarcasses: integer("number_carcasses").notNull(),
  carcassNumbers: text("carcass_numbers"),
  gradeOrQuality: text("grade_or_quality"),
  destinationType: text("destination_type").notNull(),
  buyerName: text("buyer_name"),
  pricePerKgGbp: numeric("price_per_kg_gbp", { precision: 8, scale: 4 }),
  totalWeightKg: numeric("total_weight_kg", { precision: 8, scale: 2 }),
  totalValueGbp: numeric("total_value_gbp", { precision: 10, scale: 2 }),
  invoiceReference: text("invoice_reference"),
  wildGameDeclarationNumber: text("wild_game_declaration_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Venison Herd Monitoring ───────────────────────────────────────────────────
export const venisonHerdMonitoringTable = pgTable("venison_herd_monitoring", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  surveyDate: date("survey_date").notNull(),
  surveyMethod: text("survey_method").notNull(),
  species: text("species"),
  maleCount: integer("male_count"),
  femaleCount: integer("female_count"),
  youngCount: integer("young_count"),
  totalCount: integer("total_count"),
  maleFemaleRatio: text("male_female_ratio"),
  recruitmentRatePercent: numeric("recruitment_rate_percent", { precision: 5, scale: 1 }),
  observedBy: text("observed_by"),
  weatherConditions: text("weather_conditions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Venison Health Records ────────────────────────────────────────────────────
export const venisonHealthRecordsTable = pgTable("venison_health_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  eventDate: date("event_date").notNull(),
  healthEventType: text("health_event_type").notNull(),
  productOrDescription: text("product_or_description"),
  batchNumber: text("batch_number"),
  numberTreated: integer("number_treated"),
  withdrawalPeriodDays: integer("withdrawal_period_days").default(0),
  btbTestResult: text("btb_test_result"),
  aphaReference: text("apha_reference"),
  vetName: text("vet_name"),
  vetPrescribed: boolean("vet_prescribed").default(false),
  notifiableDiseaseSupect: boolean("notifiable_disease_suspect").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Venison Firearms & Certificates Register ──────────────────────────────────
export const venisonFirearmsRegisterTable = pgTable("venison_firearms_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  holderName: text("holder_name").notNull(),
  certificateType: text("certificate_type").notNull(),
  certificateNumber: text("certificate_number"),
  issuingAuthority: text("issuing_authority"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  calibreOrDescription: text("calibre_or_description"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organic Venison Certification ────────────────────────────────────────────
export const organicVenisonCertificationTable = pgTable("organic_venison_certification", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  certifyingBody: text("certifying_body").notNull(),
  certificateNumber: text("certificate_number"),
  certificateType: text("certificate_type").notNull().default("venison"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  scope: text("scope"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organic Venison Land Register ────────────────────────────────────────────
export const organicVenisonLandRegisterTable = pgTable("organic_venison_land_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  compartmentName: text("compartment_name").notNull(),
  areaHa: numeric("area_ha", { precision: 8, scale: 2 }),
  conversionStatus: text("conversion_status").notNull().default("pre-conversion"),
  conversionStartDate: date("conversion_start_date"),
  certifiedOrganicDate: date("certified_organic_date"),
  certifyingBody: text("certifying_body"),
  certifierReference: text("certifier_reference"),
  previousLandUse: text("previous_land_use"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organic Venison Feed & Supplements ───────────────────────────────────────
export const organicVenisonFeedSupplementsTable = pgTable("organic_venison_feed_supplements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  applicationDate: date("application_date").notNull(),
  productName: text("product_name").notNull(),
  productType: text("product_type"),
  organicApprovalStatus: text("organic_approval_status").notNull().default("certified organic"),
  certifierApprovalReference: text("certifier_approval_reference"),
  quantityKg: numeric("quantity_kg", { precision: 8, scale: 2 }),
  areaOrHerd: text("area_or_herd"),
  supplierName: text("supplier_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organic Venison Derogations ──────────────────────────────────────────────
export const organicVenisonDerogationsTable = pgTable("organic_venison_derogations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  caseReference: text("case_reference"),
  inputName: text("input_name").notNull(),
  inputType: text("input_type"),
  regulatoryBasis: text("regulatory_basis"),
  certifyingBody: text("certifying_body"),
  certifierRef: text("certifier_ref"),                        // reference issued by certifier when approving
  internalDecisionDate: date("internal_decision_date"),       // when the holding internally decided it needed this input
  availabilitySearchDate: date("availability_search_date"),   // date of OFAS/UKOAS search
  availabilitySearchRef: text("availability_search_ref"),     // OFAS/UKOAS search reference number
  applicationDate: date("application_date"),
  justification: text("justification"),
  status: text("status").notNull().default("pending"),
  decisionDate: date("decision_date"),
  expiryDate: date("expiry_date"),
  approvalConditions: text("approval_conditions"),
  rejectionReason: text("rejection_reason"),                  // certifier's stated reason for rejection
  rejectionRef: text("rejection_ref"),                        // certifier's reference for the rejection notice
  correctiveAction: text("corrective_action"),                // what the farm did in response to rejection
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organicVenisonDerogationCorrespondenceTable = pgTable("organic_venison_derogation_correspondence", {
  id: serial("id").primaryKey(),
  derogationId: integer("derogation_id").notNull().references(() => organicVenisonDerogationsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  correspondenceDate: date("correspondence_date").notNull(),
  direction: text("direction").notNull().default("to-certifier"),  // to-certifier | from-certifier | internal
  correspondenceType: text("correspondence_type").notNull(),
  summary: text("summary").notNull(),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
