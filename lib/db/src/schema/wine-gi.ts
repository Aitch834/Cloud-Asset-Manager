import { pgTable, text, serial, integer, timestamp, numeric, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Wine GI Designations (PDO / PGI held by the farm) ────────────────────────
export const wineGiDesignationsTable = pgTable("wine_gi_designations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  designationName: text("designation_name").notNull(),
  designationType: text("designation_type").notNull(), // "PDO" | "PGI"
  aphaRef: text("apha_ref"),
  competentAuthority: text("competent_authority"),
  region: text("region"),
  approvedVarieties: jsonb("approved_varieties"),
  maxYieldKgPerHa: numeric("max_yield_kg_per_ha", { precision: 10, scale: 2 }),
  registrationDate: date("registration_date"),
  nextAssessmentDate: date("next_assessment_date"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Wine GI Certifications (per-vintage APHA assessment records) ──────────────
export const wineGiCertificationsTable = pgTable("wine_gi_certifications", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  designationId: integer("designation_id").references(() => wineGiDesignationsTable.id),
  vintageYear: integer("vintage_year").notNull(),
  submissionDate: date("submission_date"),
  assessmentType: text("assessment_type"),
  assessmentDate: date("assessment_date"),
  result: text("result"),
  certificateNumber: text("certificate_number"),
  certificateIssueDate: date("certificate_issue_date"),
  certificateExpiryDate: date("certificate_expiry_date"),
  assessorName: text("assessor_name"),
  assessorOrganisation: text("assessor_organisation"),
  sampleReference: text("sample_reference"),
  wineLotReference: text("wine_lot_reference"),
  volumeAssessedL: numeric("volume_assessed_l", { precision: 10, scale: 2 }),
  failureReason: text("failure_reason"),
  resubmissionRequired: boolean("resubmission_required").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Wine GI Harvest Declarations (per-vintage declarations to APHA) ──────────
export const wineGiHarvestDeclarationsTable = pgTable("wine_gi_harvest_declarations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  designationId: integer("designation_id").references(() => wineGiDesignationsTable.id),
  vintageYear: integer("vintage_year").notNull(),
  declarationRef: text("declaration_ref"),
  submissionDate: date("submission_date"),
  submittedBy: text("submitted_by"),
  totalRegisteredAreaHa: numeric("total_registered_area_ha", { precision: 8, scale: 4 }),
  totalYieldKg: numeric("total_yield_kg", { precision: 12, scale: 2 }),
  declaredYieldKgPerHa: numeric("declared_yield_kg_per_ha", { precision: 10, scale: 2 }),
  maxPermittedYieldKgPerHa: numeric("max_permitted_yield_kg_per_ha", { precision: 10, scale: 2 }),
  yieldWithinLimit: boolean("yield_within_limit"),
  status: text("status").notNull().default("draft"),
  aphaAcknowledgementRef: text("apha_acknowledgement_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
