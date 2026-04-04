import { pgTable, text, serial, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
