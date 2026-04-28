/**
 * compliance-gaps.ts
 * New tables for P1 + P2 compliance gap features:
 *   - TB Test Register (statutory cattle/sheep record)
 *   - Welfare Outcome Assessments (Red Tractor Beef & Lamb WOA)
 *   - PPE Issue Records (H&S PPE issuance register)
 *   - Contractors (H&S file: RAMS, PLI, method statements)
 *   - Sheep Dipping Records (specific legal requirements)
 */

import {
  pgTable, serial, integer, text, boolean,
  timestamp, numeric, date,
} from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { suppliersTable } from "./stock-suppliers";

// ─── TB Test Register ────────────────────────────────────────────────────────
// Statutory record for cattle and sheep holdings under APHA/TBAEngine rules.
// Separate from general disease incidents — structured test result register.

export const tbTestsTable = pgTable("tb_tests", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  testDate: date("test_date").notNull(),
  readingDate: date("reading_date"),                  // 72-hour skin reading date
  testType: text("test_type").notNull(),               // "routine_skin", "pre_movement", "post_movement", "gamma_interferon", "check_test", "gamma_ifn"
  species: text("species").notNull().default("cattle"), // "cattle", "sheep", "goat", "deer"
  herdFlockRef: text("herd_flock_ref"),                // herd number / flock mark
  animalsTested: integer("animals_tested"),
  reactors: integer("reactors").notNull().default(0),
  inconclusives: integer("inconclusives").notNull().default(0),
  outcome: text("outcome").notNull(),                  // "clear", "reactor", "inconclusive", "withdrawn"
  aphaOfficer: text("apha_officer"),
  aphaCaseRef: text("apha_case_ref"),                  // APHA case reference number
  movementRestriction: boolean("movement_restriction").notNull().default(false),
  restrictionLiftedDate: date("restriction_lifted_date"),
  nextTestDueDate: date("next_test_due_date"),
  testingVet: text("testing_vet"),                     // vet or OV who conducted the test
  documentUrl: text("document_url"),                   // uploaded TB test certificate/report
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TbTest = typeof tbTestsTable.$inferSelect;
export type NewTbTest = typeof tbTestsTable.$inferInsert;

// ─── Welfare Outcome Assessments (WOA) ───────────────────────────────────────
// Red Tractor Beef & Lamb and sheep-specific formal welfare assessment.
// Scores a set of standardised welfare indicators at herd/flock level.

export const welfareOutcomeAssessmentsTable = pgTable("welfare_outcome_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  assessmentDate: date("assessment_date").notNull(),
  assessorName: text("assessor_name").notNull(),
  assessorRole: text("assessor_role"),                 // "farmer", "vet", "assurance_inspector", "farm_advisor"
  species: text("species").notNull(),                  // "cattle", "sheep"
  herdFlockRef: text("herd_flock_ref"),
  sampleSize: integer("sample_size"),

  // ── Scored indicators (% of animals affected, or 0–5 scale) ────────────────
  lamenessScore: text("lameness_score"),               // % lame or 0-5 category
  bodyConditionScore: text("body_condition_score"),    // % thin (BCS <2 cattle, <2 sheep)
  dungScore: text("dung_score"),                       // % with dirty hindquarters
  skinLesionScore: text("skin_lesion_score"),          // % with skin injuries
  nasalDischargeScore: text("nasal_discharge_score"),  // % with respiratory signs
  eyeDischargeScore: text("eye_discharge_score"),
  mortalityRate: text("mortality_rate"),               // rolling 12m mortality %
  calvingLambingScore: text("calving_lambing_score"),  // assisted births %

  // ── Overall outcome ────────────────────────────────────────────────────────
  overallOutcome: text("overall_outcome").notNull(),   // "pass", "advisory", "fail"
  correctiveActions: text("corrective_actions"),
  targetDate: date("target_date"),
  nextAssessmentDue: date("next_assessment_due"),
  documentUrl: text("document_url"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WelfareOutcomeAssessment = typeof welfareOutcomeAssessmentsTable.$inferSelect;
export type NewWelfareOutcomeAssessment = typeof welfareOutcomeAssessmentsTable.$inferInsert;

// ─── PPE Issue Records ────────────────────────────────────────────────────────
// Physical record of PPE issued to individual staff members.
// Separate from COSHH "PPE Required" text — this is the issue register.

export const ppeIssueRecordsTable = pgTable("ppe_issue_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  staffName: text("staff_name").notNull(),
  staffUserId: text("staff_user_id"),                  // optional link to system user
  ppeType: text("ppe_type").notNull(),                 // e.g. "gloves", "safety_boots", "overalls", "goggles", "ear_defenders", "hard_hat", "high_vis", "respirator", "face_shield"
  description: text("description"),                    // e.g. "Nitrile gloves, size L"
  size: text("size"),
  supplier: text("supplier"),
  dateIssued: date("date_issued").notNull(),
  conditionCheckDate: date("condition_check_date"),
  conditionAtCheck: text("condition_at_check"),        // "good", "worn", "damaged", "replaced"
  replacedDate: date("replaced_date"),
  replacedReason: text("replaced_reason"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PpeIssueRecord = typeof ppeIssueRecordsTable.$inferSelect;
export type NewPpeIssueRecord = typeof ppeIssueRecordsTable.$inferInsert;

// ─── Contractors (H&S File) ──────────────────────────────────────────────────
// Register of external contractors who work on the farm,
// with PLI, RAMS and method statement details.

export const contractorsTable = pgTable("contractors", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  companyName: text("company_name").notNull(),
  tradeType: text("trade_type").notNull(),             // "electrical", "plumbing", "agrochemical", "ai_technician", "slurry", "construction", "roofing", "machinery", "vet", "other"
  address: text("address"),

  // ── Legacy single-contact fields (kept for backward compat; new contacts go in contractor_contacts) ──
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),

  // ── Optional link to the Suppliers / Trade Contacts register ────────────────
  supplierId: integer("supplier_id").references(() => suppliersTable.id),

  // ── Public Liability Insurance ──────────────────────────────────────────────
  pliNumber: text("pli_number"),
  pliInsurer: text("pli_insurer"),
  pliCoverAmountGbp: numeric("pli_cover_amount_gbp", { precision: 12, scale: 2 }),
  pliExpiryDate: date("pli_expiry_date"),
  pliDocumentUrl: text("pli_document_url"),
  pliDocumentName: text("pli_document_name"),

  // ── Legacy single RAMS fields (kept for backward compat; new RAMS go in contractor_rams) ──
  ramsReceived: boolean("rams_received").notNull().default(false),
  ramsReceivedDate: date("rams_received_date"),
  ramsReviewedBy: text("rams_reviewed_by"),
  ramsDocumentUrl: text("rams_document_url"),
  ramsDocumentName: text("rams_document_name"),

  // ── On-farm activity ───────────────────────────────────────────────────────
  firstOnSiteDate: date("first_on_site_date"),
  lastOnSiteDate: date("last_on_site_date"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Contractor = typeof contractorsTable.$inferSelect;
export type NewContractor = typeof contractorsTable.$inferInsert;

// ─── Contractor Contacts ──────────────────────────────────────────────────────
// Multiple named contacts per contractor (e.g. office contact, H&S contact,
// emergency contact, site supervisor).

export const contractorContactsTable = pgTable("contractor_contacts", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").notNull().references(() => contractorsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  role: text("role"),                                  // e.g. "Office", "H&S Contact", "Site Supervisor", "Emergency"
  phone: text("phone"),
  email: text("email"),
  isPrimary: boolean("is_primary").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContractorContact = typeof contractorContactsTable.$inferSelect;
export type NewContractorContact = typeof contractorContactsTable.$inferInsert;

// ─── Contractor RAMS (Risk Assessments & Method Statements) ──────────────────
// One row per activity/task type — a contractor may have multiple RAMS for
// different activities performed on the holding (e.g. grain store maintenance,
// pesticide application, machinery repair each require separate RAMS).

export const contractorRamsTable = pgTable("contractor_rams", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").notNull().references(() => contractorsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  activityDescription: text("activity_description").notNull(), // e.g. "Grain store construction", "Slurry tanker operation"
  documentUrl: text("document_url"),
  documentName: text("document_name"),
  receivedDate: date("received_date"),
  reviewedBy: text("reviewed_by"),
  reviewDate: date("review_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContractorRams = typeof contractorRamsTable.$inferSelect;
export type NewContractorRams = typeof contractorRamsTable.$inferInsert;

// ─── Sheep Dipping Records ───────────────────────────────────────────────────
// Specific legal recording requirements beyond standard medicine records.
// Covers organophosphate and other dipping products.

export const sheepDippingRecordsTable = pgTable("sheep_dipping_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  dipDate: date("dip_date").notNull(),
  productName: text("product_name").notNull(),
  mappNumber: text("mapp_number"),                     // product approval number
  activeIngredient: text("active_ingredient"),         // e.g. "Diazinon", "Propetamphos"
  dipType: text("dip_type").notNull().default("plunge"), // "plunge", "shower", "jetting"
  dipConcentrationPct: numeric("dip_concentration_pct", { precision: 6, scale: 3 }),
  volumeOfDipLitres: numeric("volume_of_dip_litres", { precision: 10, scale: 2 }),
  sheepCount: integer("sheep_count").notNull(),
  herdFlockRef: text("herd_flock_ref"),

  // ── Operator details ────────────────────────────────────────────────────────
  operatorName: text("operator_name").notNull(),
  operatorCertNumber: text("operator_cert_number"),   // NPTC BASIS Level 3 cert number
  operatorCertExpiry: date("operator_cert_expiry"),

  // ── Bath management ─────────────────────────────────────────────────────────
  bathFillDate: date("bath_fill_date"),
  daysSinceLastUse: integer("days_since_last_use"),
  topUpVolumeAdded: numeric("top_up_volume_added", { precision: 10, scale: 2 }),

  // ── Disposal ────────────────────────────────────────────────────────────────
  disposalMethod: text("disposal_method"),             // "licensed_contractor", "dilution_spreading", "on_farm_spray"
  disposalQuantityLitres: numeric("disposal_quantity_litres", { precision: 10, scale: 2 }),
  disposalDate: date("disposal_date"),
  disposalContractorName: text("disposal_contractor_name"),
  disposalWasteTransferNoteRef: text("disposal_waste_transfer_note_ref"),

  withdrawalPeriodDays: integer("withdrawal_period_days"),
  withdrawalClearDate: date("withdrawal_clear_date"),
  documentUrl: text("document_url"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SheepDippingRecord = typeof sheepDippingRecordsTable.$inferSelect;
export type NewSheepDippingRecord = typeof sheepDippingRecordsTable.$inferInsert;

// ─── ATA on livestock_movements is handled by adding columns there ───────────
// See livestock.ts — will add ataNumber + ataExpiry via schema push
