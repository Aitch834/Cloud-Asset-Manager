import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const equipmentTable = pgTable("equipment", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  make: text("make"),
  model: text("model"),
  serialNumber: text("serial_number"),
  registrationNumber: text("registration_number"),
  yearOfManufacture: integer("year_of_manufacture"),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }),
  purchasePricePence: integer("purchase_price_pence"),
  currentValuePence: integer("current_value_pence"),
  status: text("status").notNull().default("active"),
  location: text("location"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const equipmentMaintenanceLogsTable = pgTable("equipment_maintenance_logs", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id),
  maintenanceType: text("maintenance_type").notNull(),
  description: text("description").notNull(),
  performedBy: text("performed_by"),
  performedDate: timestamp("performed_date", { withTimezone: true }).notNull(),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  costPence: integer("cost_pence"),
  partsUsed: text("parts_used"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const equipmentCalibrationRecordsTable = pgTable("equipment_calibration_records", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id),
  calibrationType: text("calibration_type").notNull(),
  calibrationDate: timestamp("calibration_date", { withTimezone: true }).notNull(),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  calibratedBy: text("calibrated_by"),
  certificateReference: text("certificate_reference"),
  resultPass: boolean("result_pass"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const equipmentOffboardingRecordsTable = pgTable("equipment_offboarding_records", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id),
  offboardingDate: timestamp("offboarding_date", { withTimezone: true }).notNull(),
  reason: text("reason").notNull(),
  method: text("method"),
  salePricePence: integer("sale_price_pence"),
  buyerDetails: text("buyer_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
