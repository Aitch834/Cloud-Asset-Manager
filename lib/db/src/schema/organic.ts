import { pgTable, text, serial, integer, timestamp, boolean, date, numeric } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";
import { herdFlockRegisterTable, livestockMedicineRecordsTable } from "./livestock";
import { feedDeliveriesTable } from "./feed-management";

export const organicCertificationTable = pgTable("organic_certification", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  certifier: text("certifier").notNull(),
  certificateNumber: text("certificate_number"),
  certificationDate: date("certification_date"),
  renewalDate: date("renewal_date"),
  status: text("status").notNull().default("certified"),
  operatorNumber: text("operator_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicFieldStatusTable = pgTable("organic_field_status", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  fieldName: text("field_name").notNull(),
  status: text("status").notNull().default("conventional"),
  conversionStartDate: date("conversion_start_date"),
  certificationDate: date("certification_date"),
  certifierRef: text("certifier_ref"),
  parallelProduction: boolean("parallel_production").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicInspectionTable = pgTable("organic_inspection", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  certifier: text("certifier").notNull(),
  inspectorName: text("inspector_name"),
  inspectionDate: date("inspection_date").notNull(),
  outcome: text("outcome").notNull().default("pass"),
  certificateReference: text("certificate_reference"),
  nextDueDate: date("next_due_date"),
  nonConformances: text("non_conformances"),
  actions: text("actions"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicRestrictedInputTable = pgTable("organic_restricted_input", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  fieldName: text("field_name"),
  productName: text("product_name").notNull(),
  productCategory: text("product_category"),
  dateApplied: date("date_applied").notNull(),
  appliedBy: text("applied_by"),
  justification: text("justification").notNull(),
  approvalReference: text("approval_reference"),
  certifierNotified: boolean("certifier_notified").notNull().default(false),
  notes: text("notes"),
  supplier: text("supplier"),
  poReference: text("po_reference"),
  grnReference: text("grn_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicInputsTable = pgTable("organic_inputs", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  productName: text("product_name").notNull(),
  inputType: text("input_type"),
  supplier: text("supplier"),
  poReference: text("po_reference"),
  grnReference: text("grn_reference"),
  approvalStatus: text("approval_status").notNull().default("permitted"),
  certifierApprovalRef: text("certifier_approval_ref"),
  cropYear: integer("crop_year"),
  dateOfUse: date("date_of_use"),
  quantityAmount: text("quantity_amount"),
  quantityUnit: text("quantity_unit"),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  fieldName: text("field_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Organic Livestock Tables ──────────────────────────────────────────────────

export const organicLivestockConversionTable = pgTable("organic_livestock_conversion", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Core module link ─────────────────────────────────────────────────────
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id), // links to herd_flock_register
  species: text("species").notNull(),
  herdFlockName: text("herd_flock_name").notNull(),
  numberOfAnimals: integer("number_of_animals"),
  conversionStartDate: date("conversion_start_date").notNull(),
  expectedCertDate: date("expected_cert_date"),
  actualCertDate: date("actual_cert_date"),
  status: text("status").notNull().default("in-conversion"),
  certifier: text("certifier"),
  certificationRef: text("certification_ref"),
  parallelProduction: boolean("parallel_production").notNull().default(false),
  certDocumentPath: text("cert_document_path"),
  certDocumentName: text("cert_document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicLivestockParallelNotificationTable = pgTable("organic_livestock_parallel_notification", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  conversionId: integer("conversion_id").notNull().references(() => organicLivestockConversionTable.id, { onDelete: "cascade" }),
  notificationYear: integer("notification_year").notNull(),
  notifiedDate: date("notified_date").notNull(),
  certifierRef: text("certifier_ref"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicLivestockFeedTable = pgTable("organic_livestock_feed", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Core module links ────────────────────────────────────────────────────
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  feedDeliveryId: integer("feed_delivery_id").references(() => feedDeliveriesTable.id), // links to feed_deliveries
  recordDate: date("record_date").notNull(),
  species: text("species").notNull(),
  herdFlockName: text("herd_flock_name"),
  feedType: text("feed_type").notNull(),
  feedProductName: text("feed_product_name").notNull(),
  supplier: text("supplier"),
  supplierApprovalNumber: text("supplier_approval_number"),
  isOrganicApproved: boolean("is_organic_approved").notNull().default(true),
  quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }),
  organicPercentage: numeric("organic_percentage", { precision: 5, scale: 2 }),
  poReference: text("po_reference"),
  grnReference: text("grn_reference"),
  certifierApprovalRef: text("certifier_approval_ref"),
  derogationReference: text("derogation_reference"),
  derogationCaseId: integer("derogation_case_id"), // links to organicFeedDerogationTable
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Organic Feed Derogation Tables ───────────────────────────────────────────
// One derogation case per non-organic ingredient — covers all deliveries of
// that ingredient for the approved period. Correspondence and documents are
// stored as child records here, forming the complete audit trail.

export const organicFeedDerogationTable = pgTable("organic_feed_derogation", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  ingredientName: text("ingredient_name").notNull(),          // e.g. "Soya bean meal"
  feedProductName: text("feed_product_name"),                 // optional — specific branded product
  species: text("species"),                                   // optional — which species this covers
  certifier: text("certifier"),                               // e.g. "Soil Association", "OF&G"
  status: text("status").notNull().default("pending"),        // pending | approved | rejected | expired | withdrawn
  certifierRef: text("certifier_ref"),                        // reference issued by certifier when approving
  regulatoryCategory: text("regulatory_category"),            // e.g. "Art. 22(2)(b) UK Org Regs 2020"
  appliedDate: date("applied_date"),                          // date application submitted to certifier
  decisionDate: date("decision_date"),                        // date certifier issued decision
  expiryDate: date("expiry_date"),                            // when approval expires (typically end of cert year)
  availabilitySearchDone: boolean("availability_search_done").notNull().default(false),
  justification: text("justification"),                       // why no organic equivalent was available
  conditions: text("conditions"),                             // any conditions attached to the approval
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicFeedDerogationCorrespondenceTable = pgTable("organic_feed_derogation_correspondence", {
  id: serial("id").primaryKey(),
  derogationId: integer("derogation_id").notNull().references(() => organicFeedDerogationTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  correspondenceDate: date("correspondence_date").notNull(),
  direction: text("direction").notNull().default("to-certifier"), // to-certifier | from-certifier | internal
  subject: text("subject").notNull(),
  body: text("body"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicLivestockOutdoorAccessTable = pgTable("organic_livestock_outdoor_access", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Core module links ────────────────────────────────────────────────────
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id), // links to fields register
  recordDate: date("record_date").notNull(),
  species: text("species").notNull(),
  herdFlockName: text("herd_flock_name"),
  numberOfAnimals: integer("number_of_animals"),
  pastureAreaHectares: numeric("pasture_area_hectares", { precision: 10, scale: 4 }),
  stockingDensityPerHa: numeric("stocking_density_per_ha", { precision: 8, scale: 2 }),
  outdoorAccessHoursDay: numeric("outdoor_access_hours_day", { precision: 5, scale: 2 }),
  housingStartDate: date("housing_start_date"),
  housingEndDate: date("housing_end_date"),
  housingJustification: text("housing_justification"),
  complianceStatus: text("compliance_status").notNull().default("compliant"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicLivestockTreatmentTable = pgTable("organic_livestock_treatment", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Core module links ────────────────────────────────────────────────────
  // When linked, this record mirrors a medicine register entry for organic compliance
  medicineRecordId: integer("medicine_record_id").references(() => livestockMedicineRecordsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  treatmentDate: date("treatment_date").notNull(),
  species: text("species").notNull(),
  animalIds: text("animal_ids"),
  numberOfAnimals: integer("number_of_animals"),
  productName: text("product_name").notNull(),
  productCategory: text("product_category"),
  activeIngredient: text("active_ingredient"),
  doseAmount: text("dose_amount"),
  routeOfAdministration: text("route_of_administration"),
  vetName: text("vet_name"),
  prescriptionRef: text("prescription_ref"),
  standardWithdrawalDays: integer("standard_withdrawal_days"),
  doubledWithdrawalDays: integer("doubled_withdrawal_days"),
  withdrawalEndDate: date("withdrawal_end_date"),
  certifierNotified: boolean("certifier_notified").notNull().default(false),
  treatmentNumber: integer("treatment_number").notNull().default(1),
  maxAllopathicTreatmentsPerYear: integer("max_allopathic_treatments_per_year").notNull().default(3),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Organic Dairy Tables ──────────────────────────────────────────────────────

export const organicDairyHerdConversionTable = pgTable("organic_dairy_herd_conversion", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Core module link ─────────────────────────────────────────────────────
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id), // links to herd_flock_register
  herdName: text("herd_name").notNull(),
  breed: text("breed"),
  numberOfCows: integer("number_of_cows"),
  conversionStartDate: date("conversion_start_date").notNull(),
  expectedCertDate: date("expected_cert_date"),
  actualCertDate: date("actual_cert_date"),
  status: text("status").notNull().default("in-conversion"),
  certifier: text("certifier"),
  certificationRef: text("certification_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicDairyCollectionTable = pgTable("organic_dairy_collection", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  collectionDate: date("collection_date").notNull(),
  collectorName: text("collector_name"),
  vehicleRegistration: text("vehicle_registration"),
  volumeLitres: numeric("volume_litres", { precision: 10, scale: 2 }),
  isOrganicCollection: boolean("is_organic_collection").notNull().default(true),
  organicCertRef: text("organic_cert_ref"),
  collectionSlipRef: text("collection_slip_ref"),
  milkQualityGrade: text("milk_quality_grade"),
  sccCount: integer("scc_count"),
  tbcCount: integer("tbc_count"),
  pricePerLitrePence: integer("price_per_litre_pence"),
  organicPremiumPence: integer("organic_premium_pence"),
  grossValuePence: integer("gross_value_pence"),
  deductionsPence: integer("deductions_pence"),
  netValuePence: integer("net_value_pence"),
  fatPercentage: numeric("fat_percentage", { precision: 5, scale: 2 }),
  proteinPercentage: numeric("protein_percentage", { precision: 5, scale: 2 }),
  processorRef: text("processor_ref"),
  nonOrganicReason: text("non_organic_reason"),
  recordedByUserId: text("recorded_by_user_id"),
  recordedByUserName: text("recorded_by_user_name"),
  witnessedBy: text("witnessed_by"),
  collectorSupplierId: integer("collector_supplier_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicDairyFeedTable = pgTable("organic_dairy_feed", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Core module links ────────────────────────────────────────────────────
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  feedDeliveryId: integer("feed_delivery_id").references(() => feedDeliveriesTable.id), // links to feed_deliveries
  recordDate: date("record_date").notNull(),
  feedType: text("feed_type").notNull(),
  feedProductName: text("feed_product_name").notNull(),
  supplier: text("supplier"),
  supplierApprovalNumber: text("supplier_approval_number"),
  isOrganicApproved: boolean("is_organic_approved").notNull().default(true),
  quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }),
  organicPercentage: numeric("organic_percentage", { precision: 5, scale: 2 }),
  dryMatterKg: numeric("dry_matter_kg", { precision: 10, scale: 2 }),
  poReference: text("po_reference"),
  grnReference: text("grn_reference"),
  certifierApprovalRef: text("certifier_approval_ref"),
  derogationReference: text("derogation_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicDairyTreatmentTable = pgTable("organic_dairy_treatment", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Core module links ────────────────────────────────────────────────────
  // When linked, this record mirrors a medicine register entry for organic compliance
  medicineRecordId: integer("medicine_record_id").references(() => livestockMedicineRecordsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  treatmentDate: date("treatment_date").notNull(),
  cowIds: text("cow_ids"),
  numberOfCows: integer("number_of_cows"),
  productName: text("product_name").notNull(),
  productCategory: text("product_category"),
  activeIngredient: text("active_ingredient"),
  doseAmount: text("dose_amount"),
  routeOfAdministration: text("route_of_administration"),
  vetName: text("vet_name"),
  prescriptionRef: text("prescription_ref"),
  standardMilkWithdrawalDays: integer("standard_milk_withdrawal_days"),
  doubledMilkWithdrawalDays: integer("doubled_milk_withdrawal_days"),
  standardMeatWithdrawalDays: integer("standard_meat_withdrawal_days"),
  doubledMeatWithdrawalDays: integer("doubled_meat_withdrawal_days"),
  milkWithdrawalEndDate: date("milk_withdrawal_end_date"),
  meatWithdrawalEndDate: date("meat_withdrawal_end_date"),
  certifierNotified: boolean("certifier_notified").notNull().default(false),
  treatmentNumber: integer("treatment_number").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicFpDerogationTable = pgTable("organic_fp_derogation", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  inputName: text("input_name").notNull(),
  inputType: text("input_type").notNull(),
  regulatoryBasis: text("regulatory_basis"),
  certifier: text("certifier"),
  certifierRef: text("certifier_ref"),
  availabilitySearchDate: date("availability_search_date"),
  availabilitySearchRef: text("availability_search_ref"),
  applicationDate: date("application_date"),
  decisionDate: date("decision_date"),
  status: text("status").notNull().default("pending"),
  approvalConditions: text("approval_conditions"),
  expiryDate: date("expiry_date"),
  cropYear: integer("crop_year"),
  justification: text("justification"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicFpDerogationCorrespondenceTable = pgTable("organic_fp_derogation_correspondence", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  derogationId: integer("derogation_id").notNull().references(() => organicFpDerogationTable.id),
  correspondenceDate: date("correspondence_date").notNull(),
  direction: text("direction").notNull().default("outbound"),
  correspondenceType: text("correspondence_type").notNull(),
  summary: text("summary").notNull(),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Organic Viticulture ──────────────────────────────────────────────────────

export const organicVitBlockStatusTable = pgTable("organic_vit_block_status", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  vineyardBlockId: integer("vineyard_block_id"),
  blockName: text("block_name").notNull(),
  certifyingBody: text("certifying_body"),
  status: text("status").notNull().default("in-conversion"),
  conversionStartDate: date("conversion_start_date"),
  fullyOrganicDate: date("fully_organic_date"),
  preConversionLandUse: text("pre_conversion_land_use"),
  syntheticHistory: text("synthetic_history"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicVitInputLogTable = pgTable("organic_vit_input_log", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id"),
  blockName: text("block_name"),
  productName: text("product_name").notNull(),
  inputType: text("input_type").notNull(),
  supplier: text("supplier"),
  dateApplied: date("date_applied").notNull(),
  quantity: text("quantity"),
  unit: text("unit"),
  areaHa: text("area_ha"),
  vintageYear: integer("vintage_year"),
  approvalStatus: text("approval_status").notNull().default("permitted"),
  certifierApprovalRef: text("certifier_approval_ref"),
  appliedBy: text("applied_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicVitCopperLogTable = pgTable("organic_vit_copper_log", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id"),
  blockName: text("block_name"),
  applicationDate: date("application_date").notNull(),
  productName: text("product_name").notNull(),
  copperContent: text("copper_content"),
  quantityApplied: text("quantity_applied"),
  quantityUnit: text("quantity_unit").default("kg/ha"),
  areaHa: text("area_ha"),
  copperKgApplied: text("copper_kg_applied"),
  applicationMethod: text("application_method"),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicVitDerogationTable = pgTable("organic_vit_derogation", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  inputName: text("input_name").notNull(),
  inputType: text("input_type").notNull(),
  regulatoryBasis: text("regulatory_basis"),
  certifier: text("certifier"),
  certifierRef: text("certifier_ref"),
  availabilitySearchDate: date("availability_search_date"),
  availabilitySearchRef: text("availability_search_ref"),
  applicationDate: date("application_date"),
  decisionDate: date("decision_date"),
  status: text("status").notNull().default("pending"),
  approvalConditions: text("approval_conditions"),
  expiryDate: date("expiry_date"),
  vintageYear: integer("vintage_year"),
  justification: text("justification"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicVitDerogationCorrespondenceTable = pgTable("organic_vit_derogation_correspondence", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  derogationId: integer("derogation_id").notNull().references(() => organicVitDerogationTable.id),
  correspondenceDate: date("correspondence_date").notNull(),
  direction: text("direction").notNull().default("outbound"),
  correspondenceType: text("correspondence_type").notNull(),
  summary: text("summary").notNull(),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicVitCertificateTable = pgTable("organic_vit_certificate", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  certifyingBody: text("certifying_body").notNull(),
  certificateNumber: text("certificate_number"),
  certificateType: text("certificate_type"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  scope: text("scope"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organicVitWineProductionTable = pgTable("organic_vit_wine_production", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  vintageYear: integer("vintage_year").notNull(),
  wineColour: text("wine_colour"),
  volumeLitres: text("volume_litres"),
  certifiedOrganic: integer("certified_organic").notNull().default(1),
  certifierRef: text("certifier_ref"),
  additiveName: text("additive_name"),
  additiveType: text("additive_type"),
  quantityUsed: text("quantity_used"),
  quantityUnit: text("quantity_unit"),
  maxPermittedLevel: text("max_permitted_level"),
  actualSO2MgL: text("actual_so2_mg_l"),
  maxSO2MgL: text("max_so2_mg_l"),
  so2Compliant: integer("so2_compliant").notNull().default(1),
  regulatoryBasis: text("regulatory_basis"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
