import { pgTable, text, serial, integer, timestamp, numeric, boolean, jsonb, date, doublePrecision } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { suppliersTable } from "./stock-suppliers";

export const herdFlockRegisterTable = pgTable("herd_flock_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  breed: text("breed"),
  herdNumber: text("herd_number"),
  registrationDocumentUrl: text("registration_document_url"),
  registrationDocumentName: text("registration_document_name"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  // ─── Organic certification ────────────────────────────────────────────────
  isOrganicHerd: boolean("is_organic_herd").notNull().default(false),
  organicConversionId: integer("organic_conversion_id"),   // FK to organic_livestock_conversion.id
  organicCertBody: text("organic_cert_body"),               // e.g. "Soil Association", "OF&G"
  organicCertNumber: text("organic_cert_number"),
  organicConversionStartDate: timestamp("organic_conversion_start_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const livestockAnimalsTable = pgTable("livestock_animals", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  tagNumber: text("tag_number"),
  earTagNumber: text("ear_tag_number"),
  eidNumber: text("eid_number"),
  species: text("species").notNull(),
  breed: text("breed"),
  sex: text("sex"),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  damId: integer("dam_id"),
  sireId: integer("sire_id"),
  acquisitionDate: timestamp("acquisition_date", { withTimezone: true }),
  acquisitionSource: text("acquisition_source"),
  animalCode: text("animal_code"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const animalDocumentsTable = pgTable("animal_documents", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  animalId: integer("animal_id").notNull().references(() => livestockAnimalsTable.id),
  title: text("title").notNull(),
  documentType: text("document_type").notNull().default("other"),
  documentUrl: text("document_url").notNull(),
  documentName: text("document_name"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const livestockMovementsTable = pgTable("livestock_movements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  movementType: text("movement_type").notNull(),
  movementDate: timestamp("movement_date", { withTimezone: true }).notNull(),
  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  numberOfAnimals: integer("number_of_animals").default(1),
  licenceNumber: text("licence_number"),
  bcmsSubmissionRef: text("bcms_submission_ref"),
  legalNotificationSubmitted: boolean("legal_notification_submitted").notNull().default(false),
  legalNotificationDate: timestamp("legal_notification_date", { withTimezone: true }),
  species: text("species"),
  earTagNumbers: text("ear_tag_numbers"),
  transporterDetails: text("transporter_details"),
  reason: text("reason"),
  notes: text("notes"),
  // ─── Haulier / logistics (links to haulage_records) ─────────────────────
  haulageRecordId: integer("haulage_record_id"),
  vehicleRegistration: text("vehicle_registration"),
  driverName: text("driver_name"),
  haulierCompany: text("haulier_company"),
  operatorLicenceNo: text("operator_licence_no"),
  // ─── Dispatch compliance checklist ───────────────────────────────────────
  fciCompleted: boolean("fci_completed"),
  fciWithdrawalsClear: boolean("fci_withdrawals_clear"),
  fciCompletedBy: text("fci_completed_by"),
  allAnimalsTagged: boolean("all_animals_tagged"),
  vehicleClean: boolean("vehicle_clean"),
  atcRequired: boolean("atc_required"),
  atcNumber: text("atc_number"),
  journeyTimeHours: numeric("journey_time_hours", { precision: 5, scale: 1 }),
  driverCompetencyCertNo: text("driver_competency_cert_no"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  welfareCheckComplete: boolean("welfare_check_complete"),
  movementDocumentUrl: text("movement_document_url"),
  checklistCompletedBy: text("checklist_completed_by"),
  checklistCompletedAt: timestamp("checklist_completed_at", { withTimezone: true }),
  // ─── Organic traceability ─────────────────────────────────────────────────
  // Populated automatically when any animal in the movement belongs to an organic herd
  isOrganicMovement: boolean("is_organic_movement").notNull().default(false),
  organicCertRef: text("organic_cert_ref"),               // certifier reference for this consignment
  organicWithdrawalsClear: boolean("organic_withdrawals_clear"), // all organic doubled-withdrawal periods cleared
  organicStatusConfirmedBy: text("organic_status_confirmed_by"),
  // ─── Animal Transporter Authorisation (ATA) ───────────────────────────────
  // APHA-issued ATA number for the transporter company (different from ATC/driver cert)
  ataNumber: text("ata_number"),                          // ATA reference e.g. "UK/ATA/1234567"
  ataExpiryDate: text("ata_expiry_date"),                 // stored as text date YYYY-MM-DD
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Per-animal junction table for livestock movements ────────────────────────
// Used for cattle (mandatory BCMS per-animal tracking) and optionally sheep/pigs.
// One row per animal per movement. Allows selecting from the livestock_animals register
// or recording unregistered animals by tag number only.
export const livestockMovementAnimalsTable = pgTable("livestock_movement_animals", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  movementId: integer("movement_id").notNull().references(() => livestockMovementsTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  tagNumber: text("tag_number"),
  eidNumber: text("eid_number"),
  species: text("species"),
  breed: text("breed"),
  sex: text("sex"),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const livestockMedicineRecordsTable = pgTable("livestock_medicine_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  medicineRef: text("medicine_ref"),
  medicineName: text("medicine_name").notNull(),
  batchNumber: text("batch_number"),
  dosage: text("dosage"),
  administrationRoute: text("administration_route"),
  administeredBy: text("administered_by"),
  administeredDate: timestamp("administered_date", { withTimezone: true }).notNull(),
  withdrawalPeriodDays: integer("withdrawal_period_days"),
  withdrawalEndDate: timestamp("withdrawal_end_date", { withTimezone: true }),
  reason: text("reason"),
  vetName: text("vet_name"),
  treatmentScope: text("treatment_scope"),
  treatedAnimalTags: text("treated_animal_tags"),
  treatedAnimalCount: integer("treated_animal_count"),
  notes: text("notes"),
  source: text("source").default("manual"),           // 'manual' | 'vet_ledger' | 'disease_incident'
  vetVisitMedicineId: integer("vet_visit_medicine_id"), // FK to vet_visit_medicines.id (when source='vet_ledger')
  diseaseIncidentId: integer("disease_incident_id"),    // FK to disease_incident_log (when source='disease_incident')
  prescriptionId: integer("prescription_id"),           // FK to vet_prescription_records.id — links treatment to authorising prescription
  // ─── Organic compliance ───────────────────────────────────────────────────
  // Populated automatically when the treated herd is flagged isOrganicHerd=true
  isOrganicTreatment: boolean("is_organic_treatment").notNull().default(false),
  doubledWithdrawalDays: integer("doubled_withdrawal_days"),       // withdrawal_period_days × 2 (organic requirement)
  organicWithdrawalEndDate: timestamp("organic_withdrawal_end_date", { withTimezone: true }),
  certifierNotified: boolean("certifier_notified").notNull().default(false),
  certifierNotifiedDate: timestamp("certifier_notified_date", { withTimezone: true }),
  maxTreatmentsReached: boolean("max_treatments_reached").notNull().default(false), // flag if 3-treatment limit hit in conversion
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const livestockFeedRecordsTable = pgTable("livestock_feed_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  feedType: text("feed_type").notNull(),
  supplier: text("supplier"),
  batchNumber: text("batch_number"),
  quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }),
  feedDate: timestamp("feed_date", { withTimezone: true }).notNull(),
  notes: text("notes"),
  feedStockItemId: integer("feed_stock_item_id"),
  deliveryId: integer("delivery_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const livestockWaterRecordsTable = pgTable("livestock_water_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  waterSource: text("water_source").notNull(),
  sourceDescription: text("source_description"),
  testDate: timestamp("test_date", { withTimezone: true }),
  testResult: text("test_result"),
  testPass: boolean("test_pass"),
  labSupplierId: integer("lab_supplier_id").references(() => suppliersTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fallenStockContractorsTable = pgTable("fallen_stock_contractors", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  approvalNumber: text("approval_number").notNull(),
  operatorType: text("operator_type").notNull().default("nfas-collector"),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const livestockMortalityTable = pgTable("livestock_mortality", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  contractorId: integer("contractor_id").references(() => fallenStockContractorsTable.id),
  tagNumber: text("tag_number"),
  species: text("species").notNull(),
  breed: text("breed"),
  dateOfDeath: timestamp("date_of_death", { withTimezone: true }).notNull(),
  causeOfDeath: text("cause_of_death").notNull(),
  disposalMethod: text("disposal_method").notNull(),
  disposalOperator: text("disposal_operator"),
  disposalRef: text("disposal_ref"),
  veterinaryAttended: boolean("veterinary_attended").notNull().default(false),
  vetName: text("vet_name"),
  postMortemCarriedOut: boolean("post_mortem_carried_out").notNull().default(false),
  postMortemFindings: text("post_mortem_findings"),
  bcmsNotified: boolean("bcms_notified").notNull().default(false),
  bcmsNotificationRef: text("bcms_notification_ref"),
  notes: text("notes"),
  invoiceStatus: text("invoice_status").notNull().default("none"),
  invoiceRef: text("invoice_ref"),
  invoiceAmount: text("invoice_amount"),
  invoicePaidDate: text("invoice_paid_date"),
  status: text("status").notNull().default("reported"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vetHealthPlansTable = pgTable("vet_health_plans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  planYear: integer("plan_year").notNull(),
  vetName: text("vet_name").notNull(),
  practiceName: text("practice_name"),
  practicePhone: text("practice_phone"),
  practiceAddress: text("practice_address"),
  planDate: timestamp("plan_date", { withTimezone: true }).notNull(),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  healthPriorities: text("health_priorities"),
  vaccinationProtocol: text("vaccination_protocol"),
  biosecurityMeasures: text("biosecurity_measures"),
  wormingProtocol: text("worming_protocol"),
  flukeTreatment: text("fluke_treatment"),
  mastitisPrevention: text("mastitis_prevention"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const vetHealthPlanActionsTable = pgTable("vet_health_plan_actions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  planId: integer("plan_id").notNull().references(() => vetHealthPlansTable.id),
  description: text("description").notNull(),
  category: text("category").notNull().default("other"),
  frequency: text("frequency").notNull().default("annual"),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const vetHealthPlanActionCompletionsTable = pgTable("vet_health_plan_action_completions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  actionId: integer("action_id").notNull().references(() => vetHealthPlanActionsTable.id),
  completedDate: timestamp("completed_date", { withTimezone: true }).notNull(),
  completedBy: text("completed_by"),
  notes: text("notes"),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  verifiedBy: text("verified_by"),
  verifiedDate: timestamp("verified_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dairyMilkRecordsTable = pgTable("dairy_milk_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  recordDate: timestamp("record_date", { withTimezone: true }).notNull(),
  recordType: text("record_type").notNull().default("bulk-tank"),
  sessionType: text("session_type"),
  milkBuyer: text("milk_buyer"),
  yieldLitres: numeric("yield_litres", { precision: 10, scale: 2 }),
  // ─── On-farm temperature measurement ────────────────────────────────────────
  milkTemperatureCelsius: numeric("milk_temperature_celsius", { precision: 5, scale: 2 }),
  tempTestedBy: text("temp_tested_by"),
  // ─── On-farm ABR test ────────────────────────────────────────────────────────
  antibioticResidueTestResult: text("antibiotic_residue_test_result"),
  abrTestedBy: text("abr_tested_by"),
  abrTestKitLot: text("abr_test_kit_lot"),
  abrTestKitBatch: text("abr_test_kit_batch"),
  // ─── Buyer lab results (transcribed from milk buyer's lab report) ────────────
  buyerLabResultsStatus: text("buyer_lab_results_status").default("not-applicable"), // not-applicable | pending | received | concern
  buyerLabResultsDate: date("buyer_lab_results_date"),
  buyerLabRef: text("buyer_lab_ref"),
  buyerSccThousands: integer("buyer_scc_thousands"),
  buyerTbcCfuMl: integer("buyer_tbc_cfu_ml"),
  buyerFatPercent: numeric("buyer_fat_percent", { precision: 5, scale: 2 }),
  buyerProteinPercent: numeric("buyer_protein_percent", { precision: 5, scale: 2 }),
  buyerLactosePercent: numeric("buyer_lactose_percent", { precision: 5, scale: 2 }),
  // ─── On-farm quality (individual cow or herd total recording) ───────────────
  sccThousands: integer("scc_thousands"),
  tbcCfuMl: integer("tbc_cfu_ml"),
  fatPercent: numeric("fat_percent", { precision: 5, scale: 2 }),
  proteinPercent: numeric("protein_percent", { precision: 5, scale: 2 }),
  lactosePercent: numeric("lactose_percent", { precision: 5, scale: 2 }),
  collectorReference: text("collector_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dairyMastitisRecordsTable = pgTable("dairy_mastitis_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  earTagNumber: text("ear_tag_number"),
  onsetDate: timestamp("onset_date", { withTimezone: true }).notNull(),
  quartersAffected: text("quarters_affected"),
  clinicalGrade: text("clinical_grade"),
  bacterialCultureResult: text("bacterial_culture_result"),
  treatmentProduct: text("treatment_product"),
  treatmentStartDate: timestamp("treatment_start_date", { withTimezone: true }),
  treatmentDurationDays: integer("treatment_duration_days"),
  withdrawalEndDate: timestamp("withdrawal_end_date", { withTimezone: true }),
  outcome: text("outcome"),
  outcomeDate: timestamp("outcome_date", { withTimezone: true }),
  vetConsulted: boolean("vet_consulted").notNull().default(false),
  vetName: text("vet_name"),
  sccAtOnset: integer("scc_at_onset"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const dairyCalvingRecordsTable = pgTable("dairy_calving_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  cowAnimalId: integer("cow_animal_id").references(() => livestockAnimalsTable.id),
  cowEarTag: text("cow_ear_tag"),
  calvingDate: timestamp("calving_date", { withTimezone: true }).notNull(),
  calvingEaseScore: integer("calving_ease_score"),
  numberOfCalves: integer("number_of_calves").notNull().default(1),
  calfOutcome: text("calf_outcome"),
  calfSex: text("calf_sex"),
  calfEarTag: text("calf_ear_tag"),
  sireBreed: text("sire_breed"),
  calfBreed: text("calf_breed"),
  calfBirthWeightKg: numeric("calf_birth_weight_kg", { precision: 6, scale: 2 }),
  calfAnimalId: integer("calf_animal_id").references(() => livestockAnimalsTable.id),
  calfOutcome2: text("calf_outcome_2"),
  calfSex2: text("calf_sex_2"),
  calfEarTag2: text("calf_ear_tag_2"),
  calfBirthWeightKg2: numeric("calf_birth_weight_kg_2", { precision: 6, scale: 2 }),
  calfAnimalId2: integer("calf_animal_id_2").references(() => livestockAnimalsTable.id),
  colostrumGivenWithin2Hours: boolean("colostrum_given_within_2_hours"),
  colostrumGivenWithin6Hours: boolean("colostrum_given_within_6_hours"),
  colostrumVolumeFirstFeedLitres: numeric("colostrum_volume_first_feed_litres", { precision: 5, scale: 2 }),
  colostrumQualityBrix: numeric("colostrum_quality_brix", { precision: 5, scale: 2 }),
  colostrumSource: text("colostrum_source"),
  cowComplications: text("cow_complications"),
  assistanceRequired: boolean("assistance_required").notNull().default(false),
  assistanceType: text("assistance_type"),
  vetAttended: boolean("vet_attended").notNull().default(false),
  vetName: text("vet_name"),
  conceptionMethod: text("conception_method"),
  sireRegisterId: integer("sire_register_id"),
  strawInventoryId: integer("straw_inventory_id"),
  calfDisposition: text("calf_disposition"),
  bcmsPassportApplied: boolean("bcms_passport_applied").notNull().default(false),
  perinatalDisposalContractorId: integer("perinatal_disposal_contractor_id").references(() => fallenStockContractorsTable.id),
  perinatalCollectionDate: date("perinatal_collection_date"),
  perinatalCollectionRef: text("perinatal_collection_ref"),
  perinatalDisposalMethod: text("perinatal_disposal_method"),
  perinatalDisposalNotes: text("perinatal_disposal_notes"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const dairyBcsRecordsTable = pgTable("dairy_bcs_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  earTagNumber: text("ear_tag_number"),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  lifeStage: text("life_stage"),
  bcsScore: numeric("bcs_score", { precision: 3, scale: 1 }),
  assessedBy: text("assessed_by"),
  targetScore: numeric("target_score", { precision: 3, scale: 1 }),
  actionRequired: boolean("action_required").notNull().default(false),
  actionTaken: text("action_taken"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dairyMobilityScoringsTable = pgTable("dairy_mobility_scorings", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  assessedBy: text("assessed_by"),
  totalCowsScored: integer("total_cows_scored").notNull(),
  score0Count: integer("score_0_count").notNull().default(0),
  score1Count: integer("score_1_count").notNull().default(0),
  score2Count: integer("score_2_count").notNull().default(0),
  score3Count: integer("score_3_count").notNull().default(0),
  lamenessPrevalencePercent: numeric("lameness_prevalence_percent", { precision: 5, scale: 2 }),
  actionTaken: text("action_taken"),
  nextAssessmentDue: timestamp("next_assessment_due", { withTimezone: true }),
  notes: text("notes"),
  score3AnimalTags: text("score3_animal_tags"),
  score2AnimalTags: text("score2_animal_tags"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dairyBulkTanksTable = pgTable("dairy_bulk_tanks", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  location: text("location"),
  capacityLitres: numeric("capacity_litres", { precision: 10, scale: 0 }),
  notes: text("notes"),
  latitudeDeg: doublePrecision("latitude_deg"),
  longitudeDeg: doublePrecision("longitude_deg"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dairyBulkTankRecordsTable = pgTable("dairy_bulk_tank_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tankId: integer("tank_id").references(() => dairyBulkTanksTable.id),
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
});

export const dairyMilkCollectionsTable = pgTable("dairy_milk_collections", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tankId: integer("tank_id").references(() => dairyBulkTanksTable.id),
  collectionDate: timestamp("collection_date", { withTimezone: true }).notNull(),
  volumeCollectedLitres: numeric("volume_collected_litres", { precision: 10, scale: 2 }),
  milkBuyer: text("milk_buyer"),
  tankerRegistration: text("tanker_registration"),
  tankerDriverName: text("tanker_driver_name"),
  collectionRef: text("collection_ref"),
  statementRef: text("statement_ref"),
  abtResultBeforeCollection: text("abt_result_before_collection"),
  // ─── Sales / settlement ──────────────────────────────────────────────────────
  pencePerLitre: numeric("pence_per_litre", { precision: 8, scale: 4 }),
  grossValuePence: integer("gross_value_pence"),
  qualityBonusPence: integer("quality_bonus_pence"),
  qualityPenaltyPence: integer("quality_penalty_pence"),
  transportDeductionPence: integer("transport_deduction_pence"),
  netPaymentPence: integer("net_payment_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dairyAbrTestKitStockTable = pgTable("dairy_abr_test_kit_stock", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  productName: text("product_name").notNull(),
  supplier: text("supplier"),
  lotNumber: text("lot_number"),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  quantityPurchased: integer("quantity_purchased").notNull().default(0),
  quantityUsed: integer("quantity_used").notNull().default(0),
  quantityRemaining: integer("quantity_remaining").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dairyDctRecordsTable = pgTable("dairy_dct_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  cowEarTag: text("cow_ear_tag"),
  dryOffDate: timestamp("dry_off_date", { withTimezone: true }).notNull(),
  protocol: text("protocol").notNull(),
  antibioticTubeProduct: text("antibiotic_tube_product"),
  antibioticTubeBatch: text("antibiotic_tube_batch"),
  antibioticTubeWithdrawalMilkDays: integer("antibiotic_tube_withdrawal_milk_days"),
  antibioticTubeWithdrawalMeatDays: integer("antibiotic_tube_withdrawal_meat_days"),
  teatSealantProduct: text("teat_sealant_product"),
  teatSealantBatch: text("teat_sealant_batch"),
  treatmentJustification: text("treatment_justification"),
  sccAtDryOff: integer("scc_at_dry_off"),
  mastitisEpisodes12Months: integer("mastitis_episodes_12_months"),
  administeredBy: text("administered_by"),
  vetAuthorisation: boolean("vet_authorisation").notNull().default(false),
  vetName: text("vet_name"),
  expectedCalvingDate: timestamp("expected_calving_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const strawInventoryTable = pgTable("straw_inventory", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  sireRegisterId: integer("sire_register_id"),
  sireName: text("sire_name").notNull(),
  sireBreed: text("sire_breed"),
  sireSpecies: text("sire_species").notNull().default("Cattle"),
  supplierName: text("supplier_name"),
  batchNumber: text("batch_number").notNull(),
  strawsReceived: integer("straws_received").notNull().default(0),
  storageLocation: text("storage_location"),
  deliveryDate: date("delivery_date"),
  unitCostPence: integer("unit_cost_pence"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const aiReproductionRecordsTable = pgTable("ai_reproduction_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  animalId: integer("animal_id"),
  earTag: text("ear_tag").notNull(),
  serviceDate: date("service_date").notNull(),
  serviceType: text("service_type").notNull(),
  sireRegisterId: integer("sire_register_id"),
  strawInventoryId: integer("straw_inventory_id"),
  bullOrSireName: text("bull_or_sire_name"),
  sireStuNumber: text("sire_stu_number"),
  sireBreed: text("sire_breed"),
  strawBatchNumber: text("straw_batch_number"),
  aiTechnicianName: text("ai_technician_name"),
  bullingObservedDate: date("bulling_observed_date"),
  expectedCalvingDate: date("expected_calving_date"),
  pregnancyDiagnosisDate: date("pregnancy_diagnosis_date"),
  pregnancyResult: text("pregnancy_result"),
  veterinarianName: text("veterinarian_name"),
  returnToServiceDate: date("return_to_service_date"),
  actualCalvingDate: date("actual_calving_date"),
  calvingOutcome: text("calving_outcome"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vetPrescriptionRecordsTable = pgTable("vet_prescription_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  prescriptionDate: date("prescription_date").notNull(),
  vetName: text("vet_name").notNull(),
  vrcPracticeName: text("vrc_practice_name"),
  rcvsPracticeNumber: text("rcvs_practice_number"),
  productName: text("product_name").notNull(),
  activeIngredient: text("active_ingredient"),
  vmtNumber: text("vmt_number"),
  dosageAndFrequency: text("dosage_and_frequency").notNull(),
  routeOfAdministration: text("route_of_administration").notNull(),
  quantityAuthorised: text("quantity_authorised").notNull(),
  validityDays: integer("validity_days"),
  expiryDate: date("expiry_date"),
  targetSpecies: text("target_species").notNull(),
  indicationOrDiagnosis: text("indication_or_diagnosis").notNull(),
  cascadeJustification: text("cascade_justification"),
  isCascade: boolean("is_cascade").default(false),
  withdrawalPeriodMeat: integer("withdrawal_period_meat_days"),
  withdrawalPeriodMilk: integer("withdrawal_period_milk_days"),
  withdrawalPeriodEggs: integer("withdrawal_period_eggs_days"),
  dispensedQuantity: text("dispensed_quantity"),
  dispensedDate: date("dispensed_date"),
  treatmentScope: text("treatment_scope"),
  treatmentDate: date("treatment_date"),
  administeredBy: text("administered_by"),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  treatedAnimalTags: text("treated_animal_tags"),
  treatedAnimalCount: integer("treated_animal_count"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const livestockDailyChecksTable = pgTable("livestock_daily_checks", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  checkRef: text("check_ref"),
  herdName: text("herd_name"),
  checkDate: timestamp("check_date", { withTimezone: true }).notNull(),
  checkedBy: text("checked_by"),
  overallCondition: text("overall_condition"),
  sickCount: integer("sick_count").default(0),
  mortalityCount: integer("mortality_count").default(0),
  feedOk: boolean("feed_ok").default(true),
  waterOk: boolean("water_ok").default(true),
  shelterOk: boolean("shelter_ok").default(true),
  actionTaken: text("action_taken"),
  status: text("status").notNull().default("open"),
  notes: text("notes"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  mobileId: text("mobile_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sireRegisterTable = pgTable("sire_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  tagNumber: text("tag_number"),
  passportNumber: text("passport_number"),
  dateOfBirth: date("date_of_birth"),
  ownershipType: text("ownership_type").notNull().default("owned"),
  supplierName: text("supplier_name"),
  supplierContact: text("supplier_contact"),
  hireStartDate: date("hire_start_date"),
  hireEndDate: date("hire_end_date"),
  returnDate: date("return_date"),
  bvdStatus: text("bvd_status"),
  fertilityTestDate: date("fertility_test_date"),
  fertilityTestResult: text("fertility_test_result"),
  scrapieGenotype: text("scrapie_genotype"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const herdHealthEventsTable = pgTable("herd_health_events", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  eventType: text("event_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  vetName: text("vet_name"),
  actionTaken: text("action_taken"),
  followUpRequired: boolean("follow_up_required").notNull().default(false),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  followUpCompleted: boolean("follow_up_completed").notNull().default(false),
  recordedBy: text("recorded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const livestockPurchasesTable = pgTable("livestock_purchases", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
  arrivalDate: timestamp("arrival_date", { withTimezone: true }),
  supplierName: text("supplier_name").notNull(),
  supplierCph: text("supplier_cph"),
  marketName: text("market_name"),
  invoiceRef: text("invoice_ref"),
  species: text("species").notNull(),
  numberOfHead: integer("number_of_head").notNull(),
  pricePerHeadPence: integer("price_per_head_pence"),
  totalAmountPence: integer("total_amount_pence").notNull(),
  vatAmountPence: integer("vat_amount_pence"),
  paymentTermsDays: integer("payment_terms_days").notNull().default(0),
  paymentDueDate: timestamp("payment_due_date", { withTimezone: true }),
  paidDate: timestamp("paid_date", { withTimezone: true }),
  paymentStatus: text("payment_status").notNull().default("outstanding"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  movementId: integer("movement_id").references(() => livestockMovementsTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const lisFarmTokensTable = pgTable("lis_farm_tokens", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id).unique(),
  lisUsername: text("lis_username"),
  lisPasswordEncrypted: text("lis_password_encrypted"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  isConfigured: boolean("is_configured").notNull().default(false),
  sandboxMode: boolean("sandbox_mode").notNull().default(true),
  lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
  testStatus: text("test_status"),
  testMessage: text("test_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const lisSubmissionsTable = pgTable("lis_submissions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  movementId: integer("movement_id").references(() => livestockMovementsTable.id),
  submissionType: text("submission_type").notNull(),
  species: text("species"),
  status: text("status").notNull().default("pending"),
  sandboxMode: boolean("sandbox_mode").notNull().default(true),
  lisReference: text("lis_reference"),
  requestPayload: text("request_payload"),
  responsePayload: text("response_payload"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  submittedByUserId: integer("submitted_by_user_id"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bcmsFarmCredentialsTable = pgTable("bcms_farm_credentials", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id).unique(),
  ctwsUsername: text("ctws_username"),
  ctwsPasswordEncrypted: text("ctws_password_encrypted"),
  holdingNumber: text("holding_number"),
  isConfigured: boolean("is_configured").notNull().default(false),
  sandboxMode: boolean("sandbox_mode").notNull().default(true),
  lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
  testStatus: text("test_status"),
  testMessage: text("test_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bcmsSubmissionsTable = pgTable("bcms_submissions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  movementId: integer("movement_id").references(() => livestockMovementsTable.id),
  submissionType: text("submission_type").notNull(),
  status: text("status").notNull().default("pending"),
  sandboxMode: boolean("sandbox_mode").notNull().default(true),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  bcmsReference: text("bcms_reference"),
  errorMessage: text("error_message"),
  xmlPayload: text("xml_payload"),
  responsePayload: text("response_payload"),
  retryCount: integer("retry_count").notNull().default(0),
  submittedByUserId: integer("submitted_by_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Lambing Records ───────────────────────────────────────────────────────────
// Sheep-specific birth recording. Supports up to 4 lambs per lambing event
// (singles, twins, triplets, quads). Mirrors dairy_calving_records in purpose
// but is tailored to sheep husbandry and Red Tractor sheep assurance requirements.
export const lambingRecordsTable = pgTable("lambing_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  eweAnimalId: integer("ewe_animal_id").references(() => livestockAnimalsTable.id),
  eweEarTag: text("ewe_ear_tag"),
  lambingDate: date("lambing_date").notNull(),
  lambingEaseScore: integer("lambing_ease_score"),   // 1=unassisted, 2=easy assist, 3=hard assist, 4=vet/caesarean
  expectedLitterSize: integer("expected_litter_size"), // from pre-lambing scan
  numberOfLambs: integer("number_of_lambs").notNull().default(1),
  // Lamb 1
  lambOutcome1: text("lamb_outcome_1"),    // live | stillborn | died-within-24h
  lambSex1: text("lamb_sex_1"),            // male | female
  lambEarTag1: text("lamb_ear_tag_1"),
  lambEidNumber1: text("lamb_eid_number_1"),
  lambBirthWeightKg1: numeric("lamb_birth_weight_kg_1", { precision: 5, scale: 2 }),
  lambAnimalId1: integer("lamb_animal_id_1").references(() => livestockAnimalsTable.id),
  // Lamb 2
  lambOutcome2: text("lamb_outcome_2"),
  lambSex2: text("lamb_sex_2"),
  lambEarTag2: text("lamb_ear_tag_2"),
  lambEidNumber2: text("lamb_eid_number_2"),
  lambBirthWeightKg2: numeric("lamb_birth_weight_kg_2", { precision: 5, scale: 2 }),
  lambAnimalId2: integer("lamb_animal_id_2").references(() => livestockAnimalsTable.id),
  // Lamb 3
  lambOutcome3: text("lamb_outcome_3"),
  lambSex3: text("lamb_sex_3"),
  lambEarTag3: text("lamb_ear_tag_3"),
  lambEidNumber3: text("lamb_eid_number_3"),
  lambBirthWeightKg3: numeric("lamb_birth_weight_kg_3", { precision: 5, scale: 2 }),
  lambAnimalId3: integer("lamb_animal_id_3").references(() => livestockAnimalsTable.id),
  // Lamb 4
  lambOutcome4: text("lamb_outcome_4"),
  lambSex4: text("lamb_sex_4"),
  lambEarTag4: text("lamb_ear_tag_4"),
  lambEidNumber4: text("lamb_eid_number_4"),
  lambBirthWeightKg4: numeric("lamb_birth_weight_kg_4", { precision: 5, scale: 2 }),
  lambAnimalId4: integer("lamb_animal_id_4").references(() => livestockAnimalsTable.id),
  // Assistance & vet
  assistanceRequired: boolean("assistance_required").notNull().default(false),
  assistanceType: text("assistance_type"),
  vetAttended: boolean("vet_attended").notNull().default(false),
  vetName: text("vet_name"),
  // Colostrum
  colostrumGivenWithin2Hours: boolean("colostrum_given_within_2_hours"),
  colostrumSource: text("colostrum_source"),  // own-dam | other-ewe | frozen | supplement
  // Fostering
  fosteringRequired: boolean("fostering_required").notNull().default(false),
  fosteringDetails: text("fostering_details"),
  // Expected date (for week-ahead planner)
  expectedLambingDate: date("expected_lambing_date"),
  // Sire / ram
  ramEarTag: text("ram_ear_tag"),
  ramBreed: text("ram_breed"),
  sireRegisterId: integer("sire_register_id"),
  conceptionMethod: text("conception_method"),  // natural-service | ai
  // Ewe health
  eweComplications: text("ewe_complications"),
  notes: text("notes"),
  // Perinatal disposal — required under Animal By-Products Regulations for stillborns and died-within-24h
  perinatalDisposalContractorId: integer("perinatal_disposal_contractor_id").references(() => fallenStockContractorsTable.id),
  perinatalCollectionDate: date("perinatal_collection_date"),
  perinatalCollectionRef: text("perinatal_collection_ref"),   // consignment note / NFAS certificate reference
  perinatalDisposalMethod: text("perinatal_disposal_method"), // free-text for non-registered routes
  perinatalDisposalNotes: text("perinatal_disposal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── BVD Testing Register ──────────────────────────────────────────────────────
export const bvdTestingRecordsTable = pgTable("bvd_testing_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  testDate: date("test_date").notNull(),
  testType: text("test_type").notNull(), // "ear_notch_pcr" | "blood_elisa" | "milk_elisa" | "blood_pcr" | "bulk_milk_pcr"
  labName: text("lab_name"),
  labRef: text("lab_ref"),
  animalsTestedCount: integer("animals_tested_count"),
  piAnimalsFound: integer("pi_animals_found").default(0),
  result: text("result").notNull(), // "negative" | "positive" | "inconclusive" | "pi_identified"
  accreditationStatus: text("accreditation_status"), // "not_accredited" | "not_negative" | "negative_not_vaccinating" | "negative_vaccinating"
  monitoringScheme: text("monitoring_scheme"), // "CHeCS" | "ScotEID" | "other" | "none"
  schemeMembershipNumber: text("scheme_membership_number"),
  vetName: text("vet_name"),
  actionsTaken: text("actions_taken"),
  nextTestDue: date("next_test_due"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BvdTestingRecord = typeof bvdTestingRecordsTable.$inferSelect;
export type NewBvdTestingRecord = typeof bvdTestingRecordsTable.$inferInsert;

// ─── Johne's Disease Monitoring Register ─────────────────────────────────────
export const johnesMonitoringRecordsTable = pgTable("johnes_monitoring_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  testDate: date("test_date").notNull(),
  testType: text("test_type").notNull(), // "individual_blood_elisa" | "bulk_milk_elisa" | "individual_milk_elisa" | "faecal_pcr" | "post_mortem" | "pooled_faecal_pcr"
  labName: text("lab_name"),
  labRef: text("lab_ref"),
  animalsTestedCount: integer("animals_tested_count"),
  riskLevel: text("risk_level"), // "1_very_low" | "2_low" | "3_moderate" | "4_high" — JoHne's UK classification
  bulkMilkOd: numeric("bulk_milk_od", { precision: 6, scale: 3 }), // optical density for bulk milk ELISA
  positiveAnimalsCount: integer("positive_animals_count").default(0),
  jmmEnrolled: boolean("jmm_enrolled").default(false), // Johne's Management in Milk scheme
  scheme: text("scheme"), // "johnes_management_in_milk" | "farm_health_connect" | "voluntary" | "other"
  vetSignOff: boolean("vet_sign_off").default(false),
  vetName: text("vet_name"),
  actionsTaken: text("actions_taken"),
  nextTestDue: date("next_test_due"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type JohnesMonitoringRecord = typeof johnesMonitoringRecordsTable.$inferSelect;
export type NewJohnesMonitoringRecord = typeof johnesMonitoringRecordsTable.$inferInsert;

// ─── Casualty / Emergency Slaughter Records ───────────────────────────────────
export const casualtySlaughterRecordsTable = pgTable("casualty_slaughter_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  eventDate: date("event_date").notNull(),
  animalEarTag: text("animal_ear_tag"),
  species: text("species").notNull(), // "Cattle" | "Sheep" | "Pig" | "Goat" | "Other"
  breed: text("breed"),
  ageOrDescription: text("age_or_description"),
  reasonForSlaughter: text("reason_for_slaughter").notNull(),
  method: text("method").notNull(), // "captive_bolt" | "free_bullet" | "barbiturate_injection" | "pithing" | "other"
  performedBy: text("performed_by").notNull(),
  performedByMemberId: integer("performed_by_member_id"),
  waskWatokCertRef: text("wask_watok_cert_ref"), // certificate reference number
  witnessName: text("witness_name"),
  veterinaryInvolved: boolean("veterinary_involved").default(false),
  vetName: text("vet_name"),
  rcvsNumber: text("rcvs_number"),
  carcaseDisposalMethod: text("carcase_disposal_method"), // "licensed_contractor" | "hunt_kennel" | "incineration" | "rendering" | "burial_permitted" | "other"
  carcaseDisposalContractorId: integer("carcase_disposal_contractor_id").references(() => fallenStockContractorsTable.id),
  carcaseCollectionDate: date("carcase_collection_date"),
  carcaseDisposalRef: text("carcase_disposal_ref"), // collection note / waste transfer note reference
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CasualtySlaughterRecord = typeof casualtySlaughterRecordsTable.$inferSelect;
export type NewCasualtySlaughterRecord = typeof casualtySlaughterRecordsTable.$inferInsert;
