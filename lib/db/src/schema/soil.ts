import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

export const soilTestRecordsTable = pgTable("soil_test_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  sampleDate: timestamp("sample_date", { withTimezone: true }).notNull(),
  laboratory: text("laboratory"),
  sampleReference: text("sample_reference"),
  sampleDepthCm: integer("sample_depth_cm"),
  notes: text("notes"),
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
