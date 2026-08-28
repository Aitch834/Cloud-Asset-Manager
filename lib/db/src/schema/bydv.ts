import { boolean, date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

export const bydvAssessmentsTable = pgTable("bydv_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id, { onDelete: "cascade" }),
  assessmentDate: date("assessment_date", { mode: "string" }).notNull(),
  assessmentMode: text("assessment_mode").notNull(),
  cropType: text("crop_type").notNull(),
  variety: text("variety"),
  sowDate: date("sow_date", { mode: "string" }).notNull(),
  emergenceDate: date("emergence_date", { mode: "string" }),
  surroundedByArable: boolean("surrounded_by_arable").notNull().default(false),
  insecticideProgramme: text("insecticide_programme"),
  resultStatus: text("result_status").notNull(),
  resultNotes: text("result_notes"),
  internalDecision: text("internal_decision").notNull(),
  assessorName: text("assessor_name"),
  sourceUrl: text("source_url").notNull().default("https://bydvtool.ahdb.org.uk/"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBydvAssessmentSchema = createInsertSchema(bydvAssessmentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBydvAssessment = z.infer<typeof insertBydvAssessmentSchema>;
export type BydvAssessment = typeof bydvAssessmentsTable.$inferSelect;