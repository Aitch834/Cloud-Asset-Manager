import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const carbonAuditsTable = pgTable("carbon_audits", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  auditYear: integer("audit_year").notNull(),
  auditDate: date("audit_date").notNull(),
  conductedBy: text("conducted_by").notNull(),
  auditTool: text("audit_tool"),
  supplyChainRequirement: text("supply_chain_requirement"),
  totalScope1TonnesCo2e: numeric("total_scope1_tonnes_co2e", { precision: 10, scale: 3 }),
  totalScope2TonnesCo2e: numeric("total_scope2_tonnes_co2e", { precision: 10, scale: 3 }),
  totalScope3TonnesCo2e: numeric("total_scope3_tonnes_co2e", { precision: 10, scale: 3 }),
  totalTonnesCo2e: numeric("total_tonnes_co2e", { precision: 10, scale: 3 }),
  sequestrationTonnesCo2e: numeric("sequestration_tonnes_co2e", { precision: 10, scale: 3 }),
  netTonnesCo2e: numeric("net_tonnes_co2e", { precision: 10, scale: 3 }),
  intensityPerTonneProd: numeric("intensity_per_tonne_prod", { precision: 10, scale: 3 }),
  reductionTargetPct: numeric("reduction_target_pct", { precision: 5, scale: 1 }),
  certificationBody: text("certification_body"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carbonEmissionsRecordsTable = pgTable("carbon_emissions_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  auditId: integer("audit_id").references(() => carbonAuditsTable.id),
  emissionYear: integer("emission_year").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  activityDescription: text("activity_description").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }),
  unit: text("unit"),
  emissionFactorSource: text("emission_factor_source"),
  tonnesCo2e: numeric("tonnes_co2e", { precision: 10, scale: 4 }).notNull(),
  scope: text("scope").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carbonSequestrationTable = pgTable("carbon_sequestration", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  auditId: integer("audit_id").references(() => carbonAuditsTable.id),
  sequestrationYear: integer("sequestration_year").notNull(),
  featureType: text("feature_type").notNull(),
  featureName: text("feature_name"),
  areaHaOrLengthM: numeric("area_ha_or_length_m", { precision: 10, scale: 3 }),
  unit: text("unit"),
  sequestrationFactorSource: text("sequestration_factor_source"),
  tonnesCo2eSequestered: numeric("tonnes_co2e_sequestered", { precision: 10, scale: 4 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carbonReductionActionsTable = pgTable("carbon_reduction_actions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  actionTitle: text("action_title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  targetReductionTonnesCo2e: numeric("target_reduction_tonnes_co2e", { precision: 8, scale: 3 }),
  plannedStartDate: date("planned_start_date"),
  plannedCompletionDate: date("planned_completion_date"),
  actualCompletionDate: date("actual_completion_date"),
  status: text("status").notNull().default("planned"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  fundingSource: text("funding_source"),
  responsiblePerson: text("responsible_person"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sustainabilityReportsTable = pgTable("sustainability_reports", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  reportYear: integer("report_year").notNull(),
  generatedDate: date("generated_date").notNull(),
  reportTitle: text("report_title").notNull(),
  supplyChainCustomer: text("supply_chain_customer"),
  submittedToCustomer: boolean("submitted_to_customer").default(false),
  submissionDate: date("submission_date"),
  customerReference: text("customer_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
