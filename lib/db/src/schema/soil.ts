import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
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
