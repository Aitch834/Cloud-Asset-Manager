import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const staffTrainingRecordsTable = pgTable("staff_training_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  userId: varchar("user_id").notNull(),
  trainingTitle: text("training_title").notNull(),
  trainingProvider: text("training_provider"),
  trainingDate: timestamp("training_date", { withTimezone: true }).notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  competencyAchieved: text("competency_achieved"),
  assessorName: text("assessor_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staffCertificatesTable = pgTable("staff_certificates", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  userId: varchar("user_id").notNull(),
  certificateType: text("certificate_type").notNull(),
  certificateNumber: text("certificate_number"),
  issuer: text("issuer"),
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staffRightToWorkTable = pgTable("staff_right_to_work", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  staffName: varchar("staff_name").notNull(),
  documentType: text("document_type").notNull(),
  documentReference: text("document_reference"),
  checkDate: timestamp("check_date", { withTimezone: true }).notNull(),
  checkedBy: text("checked_by"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staffRtwDocumentsTable = pgTable("staff_rtw_documents", {
  id: serial("id").primaryKey(),
  rtwId: integer("rtw_id").notNull().references(() => staffRightToWorkTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fileName: text("file_name").notNull(),
  objectPath: text("object_path").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});
