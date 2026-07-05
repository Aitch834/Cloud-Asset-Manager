import { pgTable, text, serial, integer, timestamp, boolean, numeric, jsonb, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { suppliersTable } from "./stock-suppliers";

export const fieldsTable = pgTable("fields", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  fieldReference: text("field_reference"),
  areaHectares: numeric("area_hectares", { precision: 10, scale: 4 }),
  farmableAreaHectares: numeric("farmable_area_hectares", { precision: 10, scale: 4 }),
  soilType: text("soil_type"),
  currentUse: text("current_use"),
  isOrganic: boolean("is_organic").notNull().default(false),
  isNvz: boolean("is_nvz").notNull().default(false),
  nvzLandType: text("nvz_land_type"),
  notes: text("notes"),
  fieldCode: text("field_code"),
  isActive: boolean("is_active").notNull().default(true),
  blackgrassRiskField: boolean("blackgrass_risk_field").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  // Land tenure
  tenureType: text("tenure_type"),
  landlordSupplierId: integer("landlord_supplier_id").references(() => suppliersTable.id),
  tenancyStartDate: text("tenancy_start_date"),
  tenancyEndDate: text("tenancy_end_date"),
  annualRentPounds: numeric("annual_rent_pounds", { precision: 10, scale: 2 }),
  rentReviewDate: text("rent_review_date"),
  tenureNotes: text("tenure_notes"),
});

export const fieldTenureDocumentsTable = pgTable("field_tenure_documents", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  title: text("title").notNull(),
  documentUrl: text("document_url").notNull(),
  documentName: text("document_name"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldBoundariesTable = pgTable("field_boundaries", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  polygonPoints: jsonb("polygon_points").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  capturedBy: text("captured_by"),
});

export const cropsTable = pgTable("crops", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropVarietiesTable = pgTable("crop_varieties", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").notNull().references(() => cropsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  variety: text("variety"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropDocumentsTable = pgTable("crop_documents", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  cropId: integer("crop_id").notNull().references(() => cropsTable.id),
  title: text("title").notNull(),
  documentUrl: text("document_url").notNull(),
  documentName: text("document_name"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const seedBatchesTable = pgTable("seed_batches", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  cropId: integer("crop_id").notNull().references(() => cropsTable.id),
  varietyId: integer("variety_id").notNull().references(() => cropVarietiesTable.id),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  batchNumber: text("batch_number").notNull(),
  tgwGrams: numeric("tgw_grams", { precision: 6, scale: 2 }).notNull(),
  bagWeightKg: numeric("bag_weight_kg", { precision: 8, scale: 2 }).notNull().default("25"),
  quantityReceivedKg: numeric("quantity_received_kg", { precision: 10, scale: 2 }).notNull(),
  quantityRemainingKg: numeric("quantity_remaining_kg", { precision: 10, scale: 2 }).notNull(),
  dateReceived: date("date_received"),
  treatmentNotes: text("treatment_notes"),
  certificateDocumentPath: text("certificate_document_path"),
  certificateDocumentName: text("certificate_document_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldCropAssignmentsTable = pgTable("field_crop_assignments", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  varietyId: integer("variety_id").notNull().references(() => cropVarietiesTable.id),
  plantingDate: timestamp("planting_date", { withTimezone: true }),
  expectedHarvestDate: timestamp("expected_harvest_date", { withTimezone: true }),
  seedRate: numeric("seed_rate", { precision: 10, scale: 2 }),
  seedUnit: text("seed_unit"),
  season: text("season"),
  year: integer("year"),
  notes: text("notes"),
  reasonTags: text("reason_tags").array(),
  // Seed rate calculator inputs/outputs — target plants/m² x TGW (g) / establishment %,
  // adjusted for soil type and drilling date. Stored so the suggested rate is
  // auditable and can be recalculated if inputs change.
  tgwGrams: numeric("tgw_grams", { precision: 6, scale: 2 }),
  targetPlantPopulationM2: numeric("target_plant_population_m2", { precision: 6, scale: 1 }),
  estimatedEstablishmentPercent: numeric("estimated_establishment_percent", { precision: 5, scale: 1 }),
  calculatedSeedRateKgHa: numeric("calculated_seed_rate_kg_ha", { precision: 10, scale: 2 }),
  targetRowSpacingCm: numeric("target_row_spacing_cm", { precision: 6, scale: 1 }),
  // Seed batch allocation — links this planting to the physical seed batch used,
  // so TGW can be sourced from the supplier's batch record and stock/labels tracked.
  seedBatchId: integer("seed_batch_id").references(() => seedBatchesTable.id),
  bagsAllocated: integer("bags_allocated"),
  labelsGeneratedAt: timestamp("labels_generated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldSeasonLandUseTable = pgTable("field_season_land_use", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  year: integer("year").notNull(),
  season: text("season"),
  landUse: text("land_use").notNull(),
  schemeActionCode: text("scheme_action_code"),
  schemeReference: text("scheme_reference"),
  areaHectares: numeric("area_hectares", { precision: 10, scale: 4 }),
  startDate: text("start_date"),
  endDate: text("end_date"),
  managementNotes: text("management_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const harvestRecordsTable = pgTable("harvest_records", {
  id: serial("id").primaryKey(),
  fieldCropAssignmentId: integer("field_crop_assignment_id").notNull().references(() => fieldCropAssignmentsTable.id),
  harvestDate: timestamp("harvest_date", { withTimezone: true }).notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  equipmentId: integer("equipment_id"),
  operatorName: text("operator_name"),
  yieldTonnes: numeric("yield_tonnes", { precision: 10, scale: 2 }),
  areaHarvestedHa: numeric("area_harvested_ha", { precision: 10, scale: 4 }),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  qualityGrade: text("quality_grade"),
  recordedBy: text("recorded_by"),
  notes: text("notes"),
  isOrganicCertified: boolean("is_organic_certified").notNull().default(false),
  organicCertRef: text("organic_cert_ref"),
  salePricePerTonnePence: integer("sale_price_per_tonne_pence"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropTransportRecordsTable = pgTable("crop_transport_records", {
  id: serial("id").primaryKey(),
  harvestRecordId: integer("harvest_record_id").notNull().references(() => harvestRecordsTable.id),
  vehicleRegistration: text("vehicle_registration"),
  driverName: text("driver_name"),
  destinationId: integer("destination_id"),
  weightTonnes: numeric("weight_tonnes", { precision: 10, scale: 2 }),
  departureTime: timestamp("departure_time", { withTimezone: true }),
  arrivalTime: timestamp("arrival_time", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropStorageRecordsTable = pgTable("crop_storage_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  harvestRecordId: integer("harvest_record_id").references(() => harvestRecordsTable.id),
  storageFacility: text("storage_facility").notNull(),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 2 }),
  dateIn: timestamp("date_in", { withTimezone: true }).notNull(),
  dateOut: timestamp("date_out", { withTimezone: true }),
  temperatureC: numeric("temperature_c", { precision: 5, scale: 1 }),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropDestinationsTable = pgTable("crop_destinations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  address: text("address"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  type: text("type"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storageLocationsTable = pgTable("storage_locations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("grain_store"),
  capacityTonnes: numeric("capacity_tonnes", { precision: 10, scale: 2 }),
  locationDescription: text("location_description"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  notes: text("notes"),
  storageCode: text("storage_code"),
  isActive: boolean("is_active").notNull().default(true),
  binType: text("bin_type"),
  dryingSystem: text("drying_system"),
  aerationSystem: boolean("aeration_system").default(false),
  temperatureMonitoring: boolean("temperature_monitoring").default(false),
  sensorCount: integer("sensor_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  merchantName: text("merchant_name"),
  merchantContact: text("merchant_contact"),
  merchantContractRef: text("merchant_contract_ref"),
  storageRatePptWeek: numeric("storage_rate_ppt_week", { precision: 8, scale: 4 }),
  intakeChargePpt: numeric("intake_charge_ppt", { precision: 8, scale: 4 }),
  outloadingChargePpt: numeric("outloading_charge_ppt", { precision: 8, scale: 4 }),
  dryingChargePpt: numeric("drying_charge_ppt", { precision: 8, scale: 4 }),
  insuranceRatePptWeek: numeric("insurance_rate_ppt_week", { precision: 8, scale: 4 }),
});

export const merchantStorageChargesTable = pgTable("merchant_storage_charges", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  locationId: integer("location_id").notNull().references(() => storageLocationsTable.id),
  chargeDate: date("charge_date").notNull(),
  chargeType: text("charge_type").notNull().default("storage"),
  description: text("description"),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 2 }),
  rateUsed: numeric("rate_used", { precision: 8, scale: 4 }),
  amountPence: integer("amount_pence").notNull(),
  statementReference: text("statement_reference"),
  statementDate: date("statement_date"),
  notes: text("notes"),
  isAutoGenerated: boolean("is_auto_generated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storageLocationMovementsTable = pgTable("storage_location_movements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  locationId: integer("location_id").notNull().references(() => storageLocationsTable.id, { onDelete: "cascade" }),
  movementDate: text("movement_date").notNull(),
  movementType: text("movement_type").notNull(),
  direction: text("direction").notNull(),
  commodity: text("commodity"),
  variety: text("variety"),
  cropYear: text("crop_year"),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 3 }).notNull(),
  reference: text("reference"),
  linkedRecordType: text("linked_record_type"),
  linkedRecordId: integer("linked_record_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropFinancialTransactionsTable = pgTable("crop_financial_transactions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  harvestRecordId: integer("harvest_record_id").references(() => harvestRecordsTable.id),
  transactionType: text("transaction_type").notNull(),
  amountPence: integer("amount_pence").notNull(),
  currency: text("currency").notNull().default("GBP"),
  description: text("description"),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const seedDrillingRecordsTable = pgTable("seed_drilling_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  drillingDate: timestamp("drilling_date", { withTimezone: true }).notNull(),
  cropName: text("crop_name").notNull(),
  variety: text("variety"),
  seedLotNumber: text("seed_lot_number"),
  seedRate: numeric("seed_rate", { precision: 10, scale: 2 }),
  seedRateUnit: text("seed_rate_unit"),
  rowSpacingCm: numeric("row_spacing_cm", { precision: 6, scale: 1 }),
  isTreated: boolean("is_treated").notNull().default(false),
  treatmentProduct: text("treatment_product"),
  operator: text("operator"),
  areaSeededHa: numeric("area_seeded_ha", { precision: 10, scale: 4 }),
  seedCostPencePerKg: integer("seed_cost_pence_per_kg"),
  soilConditions: text("soil_conditions"),
  weatherNotes: text("weather_notes"),
  notes: text("notes"),
  // ── Delivery-linked costing (Option B) ──────────────────────────────────────
  stockItemId: integer("stock_item_id"),
  stockDeliveryId: integer("stock_delivery_id"),
  batchNumber: text("batch_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldOperationsTable = pgTable("field_operations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  fieldName: text("field_name").notNull(),
  operationDate: timestamp("operation_date", { withTimezone: true }).notNull(),
  operationType: text("operation_type").notNull(),
  vehicleId: integer("vehicle_id"),
  vehicleDescription: text("vehicle_description"),
  implement: text("implement"),
  implementId: integer("implement_id"),
  workingDepthCm: integer("working_depth_cm"),
  passes: integer("passes").default(1),
  areaHa: numeric("area_ha", { precision: 10, scale: 4 }),
  quantity: numeric("quantity", { precision: 10, scale: 3 }),
  quantityUnit: text("quantity_unit"),
  operator: text("operator"),
  // Time & cost tracking
  machineHours: numeric("machine_hours", { precision: 8, scale: 2 }),
  labourHours: numeric("labour_hours", { precision: 8, scale: 2 }),
  machineRatePence: integer("machine_rate_pence"),
  labourRatePence: integer("labour_rate_pence"),
  isContractor: boolean("is_contractor").notNull().default(false),
  contractorName: text("contractor_name"),
  contractorCostPence: integer("contractor_cost_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const fieldInspectionsTable = pgTable("field_inspections", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  mobileId: text("mobile_id"),
  fieldName: text("field_name").notNull(),
  inspectionDate: timestamp("inspection_date", { withTimezone: true }).notNull(),
  cropType: text("crop_type"),
  growthStage: text("growth_stage"),
  pestDiseaseObservations: text("pest_disease_observations"),
  actionRequired: text("action_required").notNull().default("none"),
  recommendedAction: text("recommended_action"),
  inspector: text("inspector"),
  notes: text("notes"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: text("resolved_by"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldInspectionPhotosTable = pgTable("field_inspection_photos", {
  id: serial("id").primaryKey(),
  recordId: integer("record_id").notNull().references(() => fieldInspectionsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldSeasonExpensesTable = pgTable("field_season_expenses", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldCropAssignmentId: integer("field_crop_assignment_id").notNull().references(() => fieldCropAssignmentsTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  expenseDate: date("expense_date").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amountPence: integer("amount_pence").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nvzRiskAssessmentsTable = pgTable("nvz_risk_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  // Legacy single-field assessor (kept for backward compat — new records use assessorName + assessorOrganisation)
  assessedBy: text("assessed_by"),
  // Split assessor fields
  assessorName: text("assessor_name"),
  assessorOrganisation: text("assessor_organisation"),
  assessorContactId: integer("assessor_contact_id"), // soft-ref to farmContactsTable.id
  // Location: JSON array of field IDs this assessment covers, e.g. "[1,3,7]"
  fieldIds: text("field_ids"),
  soilType: text("soil_type"), // MAFF/AHDB standard classification
  drainageRisk: text("drainage_risk"),
  slopeRisk: text("slope_risk"),
  distanceToWatercourse: text("distance_to_watercourse"),
  floodRisk: text("flood_risk"),
  organicMatterLevel: text("organic_matter_level"),
  applicationRestrictionsIdentified: text("application_restrictions_identified"),
  mitigationMeasures: text("mitigation_measures"),
  overallRiskLevel: text("overall_risk_level"),
  nextReviewDate: timestamp("next_review_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
