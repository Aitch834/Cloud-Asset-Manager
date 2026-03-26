import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const inspectionRecordsTable = pgTable("inspection_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  inspectionType: text("inspection_type").notNull(),
  inspectorName: text("inspector_name"),
  inspectionBody: text("inspection_body"),
  inspectionDate: timestamp("inspection_date", { withTimezone: true }).notNull(),
  overallResult: text("overall_result"),
  summary: text("summary"),
  nextInspectionDue: timestamp("next_inspection_due", { withTimezone: true }),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nonconformanceRecordsTable = pgTable("nonconformance_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  inspectionId: integer("inspection_id").references(() => inspectionRecordsTable.id),
  category: text("category").notNull(),
  description: text("description").notNull(),
  severity: text("severity"),
  identifiedDate: timestamp("identified_date", { withTimezone: true }).notNull(),
  identifiedBy: text("identified_by"),
  status: text("status").notNull().default("open"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const correctiveActionsTable = pgTable("corrective_actions", {
  id: serial("id").primaryKey(),
  nonconformanceId: integer("nonconformance_id").notNull().references(() => nonconformanceRecordsTable.id),
  description: text("description").notNull(),
  assignedTo: text("assigned_to"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  completedDate: timestamp("completed_date", { withTimezone: true }),
  verifiedBy: text("verified_by"),
  status: text("status").notNull().default("open"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const farmAssuranceCertsTable = pgTable("farm_assurance_certs", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  certificationBody: text("certification_body").notNull(),
  scheme: text("scheme"),
  certNumber: text("cert_number"),
  sectors: text("sectors"),
  assessorName: text("assessor_name"),
  assessorMembershipNo: text("assessor_membership_no"),
  issueDate: timestamp("issue_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  nextVisitDue: timestamp("next_visit_due", { withTimezone: true }),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
