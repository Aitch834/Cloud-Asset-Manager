import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const vetVisitsTable = pgTable("vet_visits", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  // Visit basics
  visitDate: date("visit_date").notNull(),
  vetName: text("vet_name").notNull(),
  vetPractice: text("vet_practice"),
  reasonForVisit: text("reason_for_visit").notNull(),

  // Animals / herds seen
  herdIds: text("herd_ids"),    // JSON array of herd IDs
  animalIds: text("animal_ids"), // JSON array of animal IDs

  // Clinical record
  diagnoses: text("diagnoses"),
  treatmentsCarriedOut: text("treatments_carried_out"),
  prescriptionsIssued: text("prescriptions_issued"),
  followUpActions: text("follow_up_actions"),
  followUpDueDate: date("follow_up_due_date"),

  // Compliance link
  diseaseIncidentId: integer("disease_incident_id"), // FK to disease_incident_log (soft reference)

  // Time / admin
  timeOnFarmMinutes: integer("time_on_farm_minutes"),
  callOutFeeGbp: numeric("call_out_fee_gbp", { precision: 10, scale: 2 }),
  estimatedTotalGbp: numeric("estimated_total_gbp", { precision: 10, scale: 2 }),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const vetVisitMedicinesTable = pgTable("vet_visit_medicines", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull().references(() => vetVisitsTable.id, { onDelete: "cascade" }),

  // Medicine reference (optional — links to medicine register if farm-stocked)
  medicineRecordId: integer("medicine_record_id"),

  // Medicine details
  medicineName: text("medicine_name").notNull(),
  batchNumber: text("batch_number"),
  quantityUsed: numeric("quantity_used", { precision: 10, scale: 3 }),
  unit: text("unit"), // ml, g, tablets, doses
  withdrawalPeriodDays: integer("withdrawal_period_days"),
  vetDispensed: boolean("vet_dispensed").notNull().default(false), // true = vet brought it; false = farm stock

  notes: text("notes"),
});

export const vetInvoicesTable = pgTable("vet_invoices", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  // Invoice header
  invoiceNumber: text("invoice_number").notNull(),
  invoiceDate: date("invoice_date").notNull(),
  vetPractice: text("vet_practice").notNull(),
  vetName: text("vet_name"),

  // Financial
  totalAmountGbp: numeric("total_amount_gbp", { precision: 10, scale: 2 }).notNull(),

  // Payment
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, paid, overdue, disputed
  paymentDate: date("payment_date"),
  paymentReference: text("payment_reference"),

  // Reconciliation
  reconciliationStatus: text("reconciliation_status").notNull().default("unreconciled"), // unreconciled, partial, reconciled

  // Document
  invoiceDocumentUrl: text("invoice_document_url"),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const vetInvoiceLinesTable = pgTable("vet_invoice_lines", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => vetInvoicesTable.id, { onDelete: "cascade" }),

  // Line details
  lineType: text("line_type").notNull(), // call_out, consultation, medicine, lab_test, scanning, tb_testing, other
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 3 }).default("1"),
  unitPriceGbp: numeric("unit_price_gbp", { precision: 10, scale: 2 }),
  lineTotalGbp: numeric("line_total_gbp", { precision: 10, scale: 2 }).notNull(),

  // Links for reconciliation
  visitId: integer("visit_id"),           // FK to vet_visits
  medicineRecordId: integer("medicine_record_id"), // FK to medicine register

  // Reconciliation state
  isMatched: boolean("is_matched").notNull().default(false),
  matchNote: text("match_note"),
});
