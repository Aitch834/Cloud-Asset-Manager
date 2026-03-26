import { pgTable, text, serial, integer, timestamp, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const fieldsTable = pgTable("fields", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  fieldReference: text("field_reference"),
  areaHectares: numeric("area_hectares", { precision: 10, scale: 4 }),
  soilType: text("soil_type"),
  currentUse: text("current_use"),
  isOrganic: boolean("is_organic").notNull().default(false),
  isNvz: boolean("is_nvz").notNull().default(false),
  nvzLandType: text("nvz_land_type"),
  notes: text("notes"),
  fieldCode: text("field_code"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
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
  variety: text("variety"),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldCropAssignmentsTable = pgTable("field_crop_assignments", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  cropId: integer("crop_id").notNull().references(() => cropsTable.id),
  plantingDate: timestamp("planting_date", { withTimezone: true }),
  expectedHarvestDate: timestamp("expected_harvest_date", { withTimezone: true }),
  seedRate: numeric("seed_rate", { precision: 10, scale: 2 }),
  seedUnit: text("seed_unit"),
  season: text("season"),
  year: integer("year"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const harvestRecordsTable = pgTable("harvest_records", {
  id: serial("id").primaryKey(),
  fieldCropAssignmentId: integer("field_crop_assignment_id").notNull().references(() => fieldCropAssignmentsTable.id),
  harvestDate: timestamp("harvest_date", { withTimezone: true }).notNull(),
  equipmentId: integer("equipment_id"),
  operatorName: text("operator_name"),
  yieldTonnes: numeric("yield_tonnes", { precision: 10, scale: 2 }),
  areaHarvestedHa: numeric("area_harvested_ha", { precision: 10, scale: 4 }),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  qualityGrade: text("quality_grade"),
  recordedBy: text("recorded_by"),
  notes: text("notes"),
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
  isTreated: boolean("is_treated").notNull().default(false),
  treatmentProduct: text("treatment_product"),
  operator: text("operator"),
  areaSeededHa: numeric("area_seeded_ha", { precision: 10, scale: 4 }),
  soilConditions: text("soil_conditions"),
  weatherNotes: text("weather_notes"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fieldOperationsTable = pgTable("field_operations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  fieldName: text("field_name").notNull(),
  operationDate: timestamp("operation_date", { withTimezone: true }).notNull(),
  operationType: text("operation_type").notNull(),
  implement: text("implement"),
  workingDepthCm: integer("working_depth_cm"),
  passes: integer("passes").default(1),
  areaHa: numeric("area_ha", { precision: 10, scale: 4 }),
  quantity: numeric("quantity", { precision: 10, scale: 3 }),
  quantityUnit: text("quantity_unit"),
  operator: text("operator"),
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

export const nvzRiskAssessmentsTable = pgTable("nvz_risk_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  assessedBy: text("assessed_by").notNull(),
  soilType: text("soil_type"),
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
