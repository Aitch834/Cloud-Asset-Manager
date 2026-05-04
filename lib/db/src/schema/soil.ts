import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";
import { suppliersTable } from "./stock-suppliers";

export const soilTestRecordsTable = pgTable("soil_test_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  sampleDate: timestamp("sample_date", { withTimezone: true }).notNull(),
  sampleReference: text("sample_reference"),
  status: text("status").notNull().default("sampled"),
  laboratory: text("laboratory"),
  labSupplierId: integer("lab_supplier_id").references(() => suppliersTable.id),
  sentToLabDate: timestamp("sent_to_lab_date", { withTimezone: true }),
  resultsReceivedDate: timestamp("results_received_date", { withTimezone: true }),
  sampleDepthCm: integer("sample_depth_cm"),
  sampledBy: text("sampled_by"),
  samplerType: text("sampler_type"),
  samplerOrganisation: text("sampler_organisation"),
  notes: text("notes"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  locationDescription: text("location_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const soilTestResultsTable = pgTable("soil_test_results", {
  id: serial("id").primaryKey(),
  soilTestId: integer("soil_test_id").notNull().references(() => soilTestRecordsTable.id),
  nutrient: text("nutrient").notNull(),
  value: numeric("value", { precision: 10, scale: 4 }),
  unit: text("unit"),
  index: text("index"),
  status: text("status"),
});

// ─── Continuous Soil Monitoring ─────────────────────────────────────────────

export const soilSensorProbesTable = pgTable("soil_sensor_probes", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  name: text("name").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  sensorType: text("sensor_type").notNull().default("moisture"),
  depthsCm: text("depths_cm"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  installDate: timestamp("install_date", { withTimezone: true }),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const soilSensorReadingsTable = pgTable("soil_sensor_readings", {
  id: serial("id").primaryKey(),
  probeId: integer("probe_id").notNull().references(() => soilSensorProbesTable.id),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  readingAt: timestamp("reading_at", { withTimezone: true }).notNull(),
  depthCm: integer("depth_cm"),
  moisturePercent: numeric("moisture_percent", { precision: 6, scale: 2 }),
  temperatureCelsius: numeric("temperature_celsius", { precision: 6, scale: 2 }),
  ecUsPerCm: numeric("ec_us_per_cm", { precision: 8, scale: 2 }),
  entryMethod: text("entry_method").notNull().default("manual"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
