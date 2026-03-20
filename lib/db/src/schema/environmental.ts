import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

export const environmentalFeaturesTable = pgTable("environmental_features", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  featureType: text("feature_type").notNull(),
  description: text("description"),
  areaHectares: numeric("area_hectares", { precision: 10, scale: 4 }),
  lengthMetres: numeric("length_metres", { precision: 10, scale: 2 }),
  managementPractice: text("management_practice"),
  dateRecorded: timestamp("date_recorded", { withTimezone: true }).notNull().defaultNow(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const environmentalAssessmentsTable = pgTable("environmental_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  assessorName: text("assessor_name").notNull(),
  assessorOrganisation: text("assessor_organisation"),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  outcome: text("outcome").notNull().default("pass"),
  conditions: text("conditions"),
  nextAssessmentDue: timestamp("next_assessment_due", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agriEnvironmentSchemeRecordsTable = pgTable("agri_environment_scheme_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  schemeName: text("scheme_name").notNull(),
  agreementNumber: text("agreement_number"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  annualPaymentPence: integer("annual_payment_pence"),
  obligations: text("obligations"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const environmentalManagementEventsTable = pgTable("environmental_management_events", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  featureId: integer("feature_id").references(() => environmentalFeaturesTable.id, { onDelete: "set null" }),
  featureName: text("feature_name"),
  featureType: text("feature_type"),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  eventType: text("event_type").notNull(),
  description: text("description"),
  operator: text("operator"),
  contractorUsed: boolean("contractor_used").default(false),
  contractorName: text("contractor_name"),
  schemeId: integer("scheme_id").references(() => agriEnvironmentSchemeRecordsTable.id, { onDelete: "set null" }),
  schemeName: text("scheme_name"),
  fulfilsSchemeObligation: boolean("fulfils_scheme_obligation").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
