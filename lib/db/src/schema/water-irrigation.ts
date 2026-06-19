import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

export const waterAbstractionLicencesTable = pgTable("water_abstraction_licences", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  licenceNumber: text("licence_number").notNull(),
  issuingAuthority: text("issuing_authority").notNull().default("Environment Agency"),
  sourceType: text("source_type"),                   // Borehole | River/Stream | Reservoir/Pond | Mains | Recycled
  waterSource: text("water_source").notNull(),        // free-text description of source location
  abstractionPointDescription: text("abstraction_point_description"),
  purposeOfUse: text("purpose_of_use").notNull(),
  annualLicencedVolumeM3: numeric("annual_licenced_volume_m3", { precision: 10, scale: 0 }),
  dailyLicencedVolumeM3: numeric("daily_licenced_volume_m3", { precision: 8, scale: 0 }),
  flowRateLitresPerSec: numeric("flow_rate_litres_per_sec", { precision: 8, scale: 2 }),
  licenceStartDate: date("licence_start_date"),
  licenceExpiryDate: date("licence_expiry_date"),
  meterRequired: boolean("meter_required").default(true),
  meterSerialNumber: text("meter_serial_number"),
  costPerM3: numeric("cost_per_m3", { precision: 10, scale: 4 }),  // £ per m³ abstracted
  returnRequired: boolean("return_required").default(true),
  returnDeadline: text("return_deadline"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waterMeterReadingsTable = pgTable("water_meter_readings", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  licenceId: integer("licence_id").notNull().references(() => waterAbstractionLicencesTable.id),
  readingDate: date("reading_date").notNull(),
  meterReading: numeric("meter_reading", { precision: 12, scale: 2 }).notNull(),
  volumeAbstractedM3: numeric("volume_abstracted_m3", { precision: 10, scale: 2 }),
  cumulativeYtdM3: numeric("cumulative_ytd_m3", { precision: 10, scale: 2 }),
  percentOfAnnualAllocation: numeric("percent_of_annual_allocation", { precision: 5, scale: 1 }),
  readBy: text("read_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const boreholeTestsTable = pgTable("borehole_tests", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  licenceId: integer("licence_id").references(() => waterAbstractionLicencesTable.id),
  testDate: date("test_date").notNull(),
  testingCompany: text("testing_company"),
  staticWaterLevelM: numeric("static_water_level_m", { precision: 8, scale: 2 }),
  pumpingWaterLevelM: numeric("pumping_water_level_m", { precision: 8, scale: 2 }),
  specificCapacityLps: numeric("specific_capacity_lps", { precision: 8, scale: 3 }),
  bacteriologicalResult: text("bacteriological_result"),
  chemicalResult: text("chemical_result"),
  overallResult: text("overall_result").notNull(),
  reportReference: text("report_reference"),
  correctiveAction: text("corrective_action"),
  nextTestDueDate: date("next_test_due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const irrigationRecordsTable = pgTable("irrigation_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  licenceId: integer("licence_id").references(() => waterAbstractionLicencesTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),          // FK to registered field (preferred)
  irrigationEquipmentId: integer("irrigation_equipment_id"),               // FK to equipment register
  irrigationDate: date("irrigation_date").notNull(),
  fieldOrBlockDescription: text("field_or_block_description"),             // fallback free text when no fieldId
  areaIrrigatedHa: numeric("area_irrigated_ha", { precision: 8, scale: 3 }),
  cropType: text("crop_type"),                                             // auto-populated from field assignment
  growthStage: text("growth_stage"),
  irrigationMethod: text("irrigation_method").notNull(),
  meterStartReading: numeric("meter_start_reading", { precision: 12, scale: 2 }),
  meterEndReading: numeric("meter_end_reading", { precision: 12, scale: 2 }),
  applicationDepthMm: numeric("application_depth_mm", { precision: 6, scale: 1 }),
  volumeAppliedM3: numeric("volume_applied_m3", { precision: 10, scale: 2 }),
  costPerM3Override: numeric("cost_per_m3_override", { precision: 10, scale: 4 }), // overrides licence cost if set
  soilMoistureDeficitMm: numeric("soil_moisture_deficit_mm", { precision: 6, scale: 1 }), // kept for legacy data
  rainfallLast7DaysMm: numeric("rainfall_last_7_days_mm", { precision: 6, scale: 1 }),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const irrigationEquipmentTable = pgTable("irrigation_equipment", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  equipmentName: text("equipment_name").notNull(),
  equipmentType: text("equipment_type").notNull(),
  manufacturer: text("manufacturer"),
  serialNumber: text("serial_number"),
  applicationRateLph: numeric("application_rate_lph", { precision: 10, scale: 1 }),
  uniformityCoefficient: numeric("uniformity_coefficient", { precision: 5, scale: 1 }),
  lastCalibrationDate: date("last_calibration_date"),
  nextCalibrationDue: date("next_calibration_due"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const soilMoistureReadingsTable = pgTable("soil_moisture_readings", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  readingDate: date("reading_date").notNull(),
  fieldOrBlockDescription: text("field_or_block_description").notNull(),
  sensorId: text("sensor_id"),
  sensorType: text("sensor_type"),
  depthCm: integer("depth_cm"),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 1 }),
  soilMoistureDeficitMm: numeric("soil_moisture_deficit_mm", { precision: 7, scale: 1 }),
  fieldCapacityMm: numeric("field_capacity_mm", { precision: 7, scale: 1 }),
  wiltingPointMm: numeric("wilting_point_mm", { precision: 7, scale: 1 }),
  readingMethod: text("reading_method").notNull().default("manual"),
  recordedBy: text("recorded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const droughtManagementPlansTable = pgTable("drought_management_plans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  planYear: integer("plan_year").notNull(),
  planTitle: text("plan_title").notNull(),
  droughtStage: text("drought_stage").notNull().default("normal"),
  restrictionLevel: text("restriction_level").notNull().default("none"),
  triggerCondition: text("trigger_condition"),
  actionsTaken: text("actions_taken"),
  alternativeSourceAvailable: boolean("alternative_source_available").default(false),
  alternativeSourceDescription: text("alternative_source_description"),
  licenceId: integer("licence_id").references(() => waterAbstractionLicencesTable.id),
  eaContactName: text("ea_contact_name"),
  eaContactRef: text("ea_contact_ref"),
  reviewDate: date("review_date"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const camsAnnualReturnsTable = pgTable("cams_annual_returns", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  licenceId: integer("licence_id").notNull().references(() => waterAbstractionLicencesTable.id),
  returnYear: integer("return_year").notNull(),
  returnPeriodStart: date("return_period_start").notNull(),
  returnPeriodEnd: date("return_period_end").notNull(),
  totalAbstractedM3: numeric("total_abstracted_m3", { precision: 12, scale: 0 }),
  monthlyBreakdownJson: text("monthly_breakdown_json"),
  submittedToEa: boolean("submitted_to_ea").notNull().default(false),
  submissionDate: date("submission_date"),
  eaReturnReference: text("ea_return_reference"),
  submittedBy: text("submitted_by"),
  complianceStatus: text("compliance_status").notNull().default("compliant"),
  exceedanceNotes: text("exceedance_notes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
