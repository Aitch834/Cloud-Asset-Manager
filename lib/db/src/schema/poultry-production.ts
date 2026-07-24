import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { herdFlockRegisterTable } from "./livestock";
import { suppliersTable } from "./stock-suppliers";

export const poultryHousesTable = pgTable("poultry_houses", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  houseName: text("house_name").notNull(),
  houseType: text("house_type").notNull(),
  species: text("species").notNull(),
  productionSystem: text("production_system").notNull(),
  approvedCapacity: integer("approved_capacity").notNull(),
  lengthM: numeric("length_m", { precision: 6, scale: 1 }),
  widthM: numeric("width_m", { precision: 6, scale: 1 }),
  ventilationType: text("ventilation_type"),
  waterSystem: text("water_system"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryFlocksTable = pgTable("poultry_flocks", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  houseId: integer("house_id").references(() => poultryHousesTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  flockNumber: text("flock_number").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  productionSystem: text("production_system").notNull(),
  placementDate: date("placement_date").notNull(),
  placementCount: integer("placement_count").notNull(),
  hatcheryName: text("hatchery_name"),
  hatcheryApprovalNumber: text("hatchery_approval_number"),
  supplierOrganicCert: text("supplier_organic_cert"),
  transitMortality: integer("transit_mortality"),
  deliveryCompany: text("delivery_company"),
  deliveryVehicleReg: text("delivery_vehicle_reg"),
  deliveryDriver: text("delivery_driver"),
  derogationRef: text("derogation_ref"),
  status: text("status").notNull().default("active"),
  depletionDate: date("depletion_date"),
  depletionCount: integer("depletion_count"),
  depletionReason: text("depletion_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryDailyMortalityTable = pgTable("poultry_daily_mortality", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").notNull().references(() => poultryFlocksTable.id),
  recordDate: date("record_date").notNull(),
  mortalityCount: integer("mortality_count").notNull().default(0),
  culledCount: integer("culled_count").notNull().default(0),
  runningTotalMortality: integer("running_total_mortality"),
  mortalityPercentage: numeric("mortality_percentage", { precision: 5, scale: 2 }),
  mainCause: text("main_cause"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryTreatmentsTable = pgTable("poultry_treatments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").notNull().references(() => poultryFlocksTable.id),
  treatmentDate: date("treatment_date").notNull(),
  numberOfBirdsTreated: integer("number_of_birds_treated"),
  productName: text("product_name").notNull(),
  activeIngredient: text("active_ingredient"),
  condition: text("condition").notNull(),
  routeOfAdministration: text("route_of_administration").notNull(),
  doseRate: text("dose_rate"),
  durationDays: integer("duration_days"),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  administeredBy: text("administered_by"),
  prescribingVetName: text("prescribing_vet_name"),
  prescribingVetPractice: text("prescribing_vet_practice"),
  prescriptionObtained: boolean("prescription_obtained").default(false),
  withdrawalPeriodDays: integer("withdrawal_period_days"),
  withdrawalClearDate: date("withdrawal_clear_date"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryHouseCleanoutsTable = pgTable("poultry_house_cleanouts", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  houseId: integer("house_id").notNull().references(() => poultryHousesTable.id),
  flockId: integer("flock_id").references(() => poultryFlocksTable.id),
  cleanoutStartDate: date("cleanout_start_date").notNull(),
  cleanoutEndDate: date("cleanout_end_date"),
  litterRemovalDate: date("litter_removal_date"),
  disinfectantUsed: text("disinfectant_used"),
  disinfectantSupplier: text("disinfectant_supplier"),
  disinfectantApprovalNumber: text("disinfectant_approval_number"),
  dilutionRate: text("dilution_rate"),
  applicationMethod: text("application_method"),
  contactTimeMins: integer("contact_time_mins"),
  swabsTaken: boolean("swabs_taken").default(false),
  swabResults: text("swab_results"),
  standingTimeDays: integer("standing_time_days"),
  performedByContractor: boolean("performed_by_contractor").notNull().default(false),
  contractorName: text("contractor_name"),
  contractorSupplierId: integer("contractor_supplier_id").references(() => suppliersTable.id),
  contractorOwnSupplies: boolean("contractor_own_supplies").notNull().default(false),
  completedBy: text("completed_by"),
  verifiedBy: text("verified_by"),
  costPence: integer("cost_pence"),
  invoiceRef: text("invoice_ref"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryCleanoutStockConsumptionsTable = pgTable("poultry_cleanout_stock_consumptions", {
  id: serial("id").primaryKey(),
  cleanoutId: integer("cleanout_id").notNull().references(() => poultryHouseCleanoutsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  stockItemId: integer("stock_item_id"),
  productName: text("product_name"),
  quantityUsed: text("quantity_used").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryEnvironmentalLogsTable = pgTable("poultry_environmental_logs", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").notNull().references(() => poultryFlocksTable.id),
  logDate: date("log_date").notNull(),
  logTime: text("log_time"),
  temperatureMin: numeric("temperature_min", { precision: 5, scale: 1 }),
  temperatureMax: numeric("temperature_max", { precision: 5, scale: 1 }),
  humidity: numeric("humidity", { precision: 5, scale: 1 }),
  co2Ppm: integer("co2_ppm"),
  ammoniaPpm: numeric("ammonia_ppm", { precision: 5, scale: 1 }),
  ventilationRate: text("ventilation_rate"),
  lightingHours: numeric("lighting_hours", { precision: 4, scale: 1 }),
  stockingDensity: numeric("stocking_density", { precision: 6, scale: 2 }),
  alarmActivated: boolean("alarm_activated").default(false),
  alarmDetails: text("alarm_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryFciDocumentsTable = pgTable("poultry_fci_documents", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").notNull().references(() => poultryFlocksTable.id),
  documentDate: date("document_date").notNull(),
  catchingDate: date("catching_date"),
  destinationAbattoir: text("destination_abattoir"),
  numberOfBirds: integer("number_of_birds").notNull(),
  catchingContractor: text("catching_contractor"),
  anyDiseaseOrCondition: boolean("any_disease_or_condition").default(false),
  diseaseDetails: text("disease_details"),
  medicationsLast7Days: boolean("medications_last_7_days").default(false),
  medicationDetails: text("medication_details"),
  withdrawalPeriodClear: boolean("withdrawal_period_clear").default(true),
  lastFeedWithdrawalHours: integer("last_feed_withdrawal_hours"),
  signedByFarmer: boolean("signed_by_farmer").default(false),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryBroilerWelfareTable = pgTable("poultry_broiler_welfare", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").notNull().references(() => poultryFlocksTable.id),
  assessmentDate: date("assessment_date").notNull(),
  assessedBy: text("assessed_by").notNull(),
  ageAtAssessmentDays: integer("age_at_assessment_days"),
  sampleSize: integer("sample_size"),
  footpadDermatitisScore: text("footpad_dermatitis_score"),
  footpadDermatitisPercent: numeric("footpad_dermatitis_percent", { precision: 5, scale: 1 }),
  hockBurnScore: text("hock_burn_score"),
  hockBurnPercent: numeric("hock_burn_percent", { precision: 5, scale: 1 }),
  gaitScore: text("gait_score"),
  breastBlisterPercent: numeric("breast_blister_percent", { precision: 5, scale: 1 }),
  plumageScore: text("plumage_score"),
  soiledPlumagePercent: numeric("soiled_plumage_percent", { precision: 5, scale: 1 }),
  overallOutcome: text("overall_outcome").notNull(),
  actionsTaken: text("actions_taken"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryThinningRecordsTable = pgTable("poultry_thinning_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").notNull().references(() => poultryFlocksTable.id),
  thinningDate: date("thinning_date").notNull(),
  thinningNumber: integer("thinning_number").notNull().default(1),
  birdsRemoved: integer("birds_removed").notNull(),
  targetLiveWeightKg: numeric("target_live_weight_kg", { precision: 6, scale: 2 }),
  averageLiveWeightKg: numeric("average_live_weight_kg", { precision: 6, scale: 2 }),
  destinationAbattoir: text("destination_abattoir"),
  catchingContractorName: text("catching_contractor_name"),
  catchingStartTime: text("catching_start_time"),
  catchingEndTime: text("catching_end_time"),
  doasAtLoading: integer("doas_at_loading").default(0),
  transportVehicleReg: text("transport_vehicle_reg"),
  catchingConditions: text("catching_conditions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryBiosecurityChecklistTable = pgTable("poultry_biosecurity_checklists", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  houseId: integer("house_id").notNull().references(() => poultryHousesTable.id),
  previousFlockId: integer("previous_flock_id").references(() => poultryFlocksTable.id),
  cleanoutStartDate: date("cleanout_start_date").notNull(),
  cleanoutEndDate: date("cleanout_end_date"),
  downtimeDays: integer("downtime_days"),
  catchingComplete: boolean("catching_complete").default(false),
  litterRemoved: boolean("litter_removed").default(false),
  litterDisposalMethod: text("litter_disposal_method"),
  dryCleanComplete: boolean("dry_clean_complete").default(false),
  washComplete: boolean("wash_complete").default(false),
  disinfectionComplete: boolean("disinfection_complete").default(false),
  disinfectantUsed: text("disinfectant_used"),
  disinfectantApproved: boolean("disinfectant_approved").default(false),
  disinfectantDilutionRate: text("disinfectant_dilution_rate"),
  fumigationComplete: boolean("fumigation_complete").default(false),
  fumigationProduct: text("fumigation_product"),
  verminControlComplete: boolean("vermin_control_complete").default(false),
  verminControlDetails: text("vermin_control_details"),
  waterSystemFlushComplete: boolean("water_system_flush_complete").default(false),
  waterSystemDisinfected: boolean("water_system_disinfected").default(false),
  feedSystemCleaned: boolean("feed_system_cleaned").default(false),
  ventilationChecked: boolean("ventilation_checked").default(false),
  heatingChecked: boolean("heating_checked").default(false),
  footbathsInstalled: boolean("footbaths_installed").default(false),
  vehicleRestrictions: boolean("vehicle_restrictions").default(true),
  visitorLogInPlace: boolean("visitor_log_in_place").default(false),
  independentAuditCompleted: boolean("independent_audit_completed").default(false),
  auditBody: text("audit_body"),
  overallComplianceStatus: text("overall_compliance_status").notNull().default("in-progress"),
  schemeCertificationScheme: text("scheme_certification_scheme"),
  completedBy: text("completed_by"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultryChickPurchasesTable = pgTable("poultry_chick_purchases", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => poultryFlocksTable.id),
  supplierId: integer("supplier_id"),
  supplierName: text("supplier_name"),
  hatcheryApprovalNumber: text("hatchery_approval_number"),
  poReference: text("po_reference"),
  orderDate: date("order_date"),
  numberOfBirdsOrdered: integer("number_of_birds_ordered"),
  numberOfBirdsReceived: integer("number_of_birds_received"),
  pricePerBirdPence: integer("price_per_bird_pence"),
  totalCostPence: integer("total_cost_pence"),
  invoiceReference: text("invoice_reference"),
  invoiceDate: date("invoice_date"),
  paymentTermsDays: integer("payment_terms_days").default(30),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  paymentDate: date("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poultrySchemeRecordsTable = pgTable("poultry_scheme_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => poultryFlocksTable.id),
  scheme: text("scheme").notNull(),
  certificateNumber: text("certificate_number"),
  assessmentDate: date("assessment_date"),
  assessorName: text("assessor_name"),
  assessorOrganisation: text("assessor_organisation"),
  outcomeStatus: text("outcome_status").notNull().default("pass"),
  nonConformancesCount: integer("non_conformances_count").default(0),
  nonConformanceDetails: text("non_conformance_details"),
  correctiveActionRequired: boolean("corrective_action_required").default(false),
  correctiveActionDeadline: date("corrective_action_deadline"),
  correctiveActionNotes: text("corrective_action_notes"),
  nextAssessmentDue: date("next_assessment_due"),
  documentReference: text("document_reference"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Campylobacter Monitoring Programme ───────────────────────────────────────
export const campylobacterMonitoringTable = pgTable("campylobacter_monitoring", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  houseId: integer("house_id").references(() => poultryHousesTable.id),
  flockId: integer("flock_id").references(() => poultryFlocksTable.id),
  sampleDate: date("sample_date").notNull(),
  sampleType: text("sample_type").notNull(), // "boot_swab" | "neck_skin" | "caecal_content" | "environmental"
  samplesTaken: integer("samples_taken"),
  labName: text("lab_name"),
  labRef: text("lab_ref"),
  result: text("result").notNull(), // "negative" | "positive" | "pending"
  ceuCount: numeric("ceu_count", { precision: 10, scale: 2 }), // campylobacter enumeration units per gram
  resultCategory: text("result_category"), // "highest" (>1000) | "high" (100-1000) | "lower" (<100)
  fsa_band: text("fsa_band"), // "a_very_low" | "b_low" | "c_intermediate" | "d_high" | "e_very_high"
  zapTriggered: boolean("zap_triggered").default(false), // Zoonoses Action Plan triggered
  zapReference: text("zap_reference"),
  actionsTaken: text("actions_taken"),
  nextSampleDue: date("next_sample_due"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CampylobacterMonitoringRecord = typeof campylobacterMonitoringTable.$inferSelect;
export type NewCampylobacterMonitoringRecord = typeof campylobacterMonitoringTable.$inferInsert;

// ─── Chick / Poult Quality Assessment at Placement ──────────────────────────
export const poultryPlacementQualityAssessmentsTable = pgTable("poultry_placement_quality_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").notNull().references(() => poultryFlocksTable.id),
  assessmentDate: date("assessment_date").notNull(),
  assessedBy: text("assessed_by").notNull(),
  arrivalTemperatureCelsius: numeric("arrival_temperature_celsius", { precision: 4, scale: 1 }),
  navelCondition: text("navel_condition").notNull(),          // "healed" | "slight" | "unhealed"
  legCondition: text("leg_condition").notNull(),              // "normal" | "weak" | "severe"
  activityLevel: text("activity_level").notNull(),            // "lively" | "moderate" | "lethargic"
  uniformityPercent: numeric("uniformity_percent", { precision: 5, scale: 1 }),
  cullCountAtPlacement: integer("cull_count_at_placement"),
  cullPercentAtPlacement: numeric("cull_percent_at_placement", { precision: 5, scale: 2 }),
  overallQualityScore: text("overall_quality_score").notNull(), // "acceptable" | "substandard" | "rejected"
  actionTaken: text("action_taken"),
  hatcheryNotified: boolean("hatchery_notified").default(false),
  hatcheryResponseNotes: text("hatchery_response_notes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PoultryPlacementQualityAssessment = typeof poultryPlacementQualityAssessmentsTable.$inferSelect;
export type NewPoultryPlacementQualityAssessment = typeof poultryPlacementQualityAssessmentsTable.$inferInsert;

// ─── Poultry NCP Salmonella Tests ─────────────────────────────────────────────
// National Control Programme (NCP) mandatory Salmonella surveillance
export const poultryNcpTestsTable = pgTable("poultry_ncp_tests", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => poultryFlocksTable.id),
  flockRef: text("flock_ref"),            // house/pen reference
  houseOrLocation: text("house_or_location"),
  testDate: date("test_date").notNull(),
  sampleType: text("sample_type").notNull(), // "boot_swab" | "environmental" | "blood" | "neck_skin" | "caecal"
  samplingMethod: text("sampling_method"),   // "official" | "self_sampled"
  laboratoryName: text("laboratory_name"),
  sampleRef: text("sample_ref"),
  result: text("result").notNull().default("pending"), // "negative" | "positive" | "inconclusive" | "pending"
  serotypeIsolated: text("serotype_isolated"), // e.g. "S. Enteritidis", "S. Typhimurium"
  notificationSentToApha: boolean("notification_sent_to_apha").notNull().default(false),
  movementRestrictions: boolean("movement_restrictions").notNull().default(false),
  actionsTaken: text("actions_taken"),
  nextTestDueDate: date("next_test_due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type PoultryNcpTest = typeof poultryNcpTestsTable.$inferSelect;
export type NewPoultryNcpTest = typeof poultryNcpTestsTable.$inferInsert;

// ─── Poultry Inter-Site Transfers ─────────────────────────────────────────────
// Records movement of birds between holdings owned by the same farmer
export const poultryInterSiteTransfersTable = pgTable("poultry_inter_site_transfers", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => poultryFlocksTable.id),
  toCph: text("to_cph"),
  toFarmName: text("to_farm_name").notNull(),
  transferDate: date("transfer_date").notNull(),
  quantityTransferred: integer("quantity_transferred").notNull(),
  reason: text("reason"),
  transportCompany: text("transport_company"),
  vehicleReg: text("vehicle_reg"),
  driverName: text("driver_name"),
  estimatedJourneyHours: numeric("estimated_journey_hours", { precision: 4, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PoultryInterSiteTransfer = typeof poultryInterSiteTransfersTable.$inferSelect;
export type NewPoultryInterSiteTransfer = typeof poultryInterSiteTransfersTable.$inferInsert;

// ─── Poultry Transport Welfare ─────────────────────────────────────────────────
// Welfare of Animals During Transport records (required for journeys >65 km)
export const poultryTransportWelfareTable = pgTable("poultry_transport_welfare", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockId: integer("flock_id").references(() => poultryFlocksTable.id),
  journeyDate: date("journey_date").notNull(),
  journeyPurpose: text("journey_purpose").notNull(),   // to_slaughter | inter_site | hatchery_collection | other
  vehicleReg: text("vehicle_reg"),
  driverName: text("driver_name"),
  transporterAuthorisationNo: text("transporter_authorisation_no"),
  journeyStartTime: text("journey_start_time"),
  journeyEndTime: text("journey_end_time"),
  journeyDistanceKm: numeric("journey_distance_km", { precision: 8, scale: 1 }),
  stockingDensityBirdsM2: numeric("stocking_density_birds_m2", { precision: 6, scale: 2 }),
  temperatureAdequate: boolean("temperature_adequate"),
  waterProvision: boolean("water_provision"),
  ventilationAdequate: boolean("ventilation_adequate"),
  birdsDeadOnArrival: integer("birds_dead_on_arrival").default(0),
  overallWelfareAssessment: text("overall_welfare_assessment").notNull().default("not_assessed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PoultryTransportWelfare = typeof poultryTransportWelfareTable.$inferSelect;
export type NewPoultryTransportWelfare = typeof poultryTransportWelfareTable.$inferInsert;
