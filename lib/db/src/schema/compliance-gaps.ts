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
import { suppliersTable, stockItemsTable, purchaseOrdersTable } from "./stock-suppliers";
import { livestockMovementsTable } from "./livestock";

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
  documentUrl: text("document_url"),                   // legacy URL field (kept for existing data)
  documentName: text("document_name"),
  documentPath: text("document_path"),                 // object-storage path (new upload pattern)
  herdId: integer("herd_id"),                          // soft FK → herd_flock_register.id
  animalEarTags: text("animal_ear_tags"),              // JSON array of individual ear tag strings
  movementId: integer("movement_id").references(() => livestockMovementsTable.id), // linked pre/post-movement livestock movement record
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
  species: text("species").notNull(),                  // "cattle", "beef-cattle", "sheep", "pigs", "poultry"
  herdFlockRef: text("herd_flock_ref"),
  sampleSize: integer("sample_size"),

  // ── Assessor type ─────────────────────────────────────────────────────────
  assessorType: text("assessor_type").notNull().default("external"), // "internal" | "external"
  assessorMemberId: integer("assessor_member_id"),     // soft FK → farmMembersTable (internal staff)
  assessorSupplierId: integer("assessor_supplier_id").references(() => suppliersTable.id), // external assessor
  expectedFeeAmountPence: integer("expected_fee_amount_pence"), // assessor fee (triggers PO on save)
  purchaseOrderId: integer("purchase_order_id"),       // soft FK → purchaseOrdersTable (auto-created when external)

  // ── Scored indicators — shared across species ─────────────────────────────
  lamenessScore: text("lameness_score"),               // % lame or 0-5 category
  bodyConditionScore: text("body_condition_score"),    // % thin (BCS <2.5 cattle, <2 sheep)
  dungScore: text("dung_score"),                       // % with dirty hindquarters (cattle)
  skinLesionScore: text("skin_lesion_score"),          // % with skin injuries / fight wounds
  nasalDischargeScore: text("nasal_discharge_score"),  // % with respiratory signs
  eyeDischargeScore: text("eye_discharge_score"),
  mortalityRate: text("mortality_rate"),               // rolling 12m mortality %
  calvingLambingScore: text("calving_lambing_score"),  // assisted births %

  // ── Species-specific indicators ───────────────────────────────────────────
  dagScore: text("dag_score"),                         // sheep: % with dag / dirty fleece
  tailBitingScore: text("tail_biting_score"),          // pigs: % with tail wounds
  snoutRootingScore: text("snout_rooting_score"),      // pigs: % with snout lesions
  featherCoverageScore: text("feather_coverage_score"),        // poultry: % with poor feathering
  footpadDermatitisScore: text("footpad_dermatitis_score"),    // poultry: % FPD score ≥2
  hockBurnScore: text("hock_burn_score"),              // poultry: % hock burn score ≥2
  culledBirdsRate: text("culled_birds_rate"),          // poultry: % culled / rejected at slaughter
  stockingDensityCompliant: text("stocking_density_compliant"), // poultry: "yes"|"no"|"not_checked"

  // ── Overall outcome ────────────────────────────────────────────────────────
  overallOutcome: text("overall_outcome").notNull(),   // "good","acceptable","needs-improvement","poor"
  correctiveActions: text("corrective_actions"),
  targetDate: date("target_date"),
  nextAssessmentDue: date("next_assessment_due"),
  documentUrl: text("document_url"),
  documentName: text("document_name"),
  documentPath: text("document_path"),               // object-storage path (upload pattern)
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WelfareOutcomeAssessment = typeof welfareOutcomeAssessmentsTable.$inferSelect;
export type NewWelfareOutcomeAssessment = typeof welfareOutcomeAssessmentsTable.$inferInsert;

// ─── Welfare Walkthrough Observations ────────────────────────────────────────
// Raw animal-by-animal tally observations recorded during internal staff walkthrough.
// Tally pairs (affected count + total observed) per criterion → percentages auto-derived.
// Applies to a parent WOA (woaId) once reviewed by the assessor.

export const welfareWalkthroughObservationsTable = pgTable("welfare_walkthrough_observations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  woaId: integer("woa_id").references(() => welfareOutcomeAssessmentsTable.id, { onDelete: "set null" }),

  assessmentDate: date("assessment_date").notNull(),
  species: text("species").notNull(),
  herdFlockRef: text("herd_flock_ref"),
  observedBy: text("observed_by").notNull(),          // staff member name (display)
  observerMemberId: integer("observer_member_id"),    // soft FK → farmMembersTable
  sampleSize: integer("sample_size"),

  // ── Per-criterion tally pairs (affected / total observed) ─────────────────
  lamenessAffected: integer("lameness_affected"),
  lamenessTotal: integer("lameness_total"),
  bcsAffected: integer("bcs_affected"),
  bcsTotal: integer("bcs_total"),
  dungAffected: integer("dung_affected"),
  dungTotal: integer("dung_total"),
  skinLesionAffected: integer("skin_lesion_affected"),
  skinLesionTotal: integer("skin_lesion_total"),
  nasalDischargeAffected: integer("nasal_discharge_affected"),
  nasalDischargeTotal: integer("nasal_discharge_total"),
  eyeDischargeAffected: integer("eye_discharge_affected"),
  eyeDischargeTotal: integer("eye_discharge_total"),
  calvingLambingAffected: integer("calving_lambing_affected"),
  calvingLambingTotal: integer("calving_lambing_total"),

  // ── Species-specific tally pairs ──────────────────────────────────────────
  dagAffected: integer("dag_affected"),               // sheep
  dagTotal: integer("dag_total"),
  tailBitingAffected: integer("tail_biting_affected"), // pigs
  tailBitingTotal: integer("tail_biting_total"),
  snoutRootingAffected: integer("snout_rooting_affected"),
  snoutRootingTotal: integer("snout_rooting_total"),
  featherCoverageAffected: integer("feather_coverage_affected"), // poultry
  featherCoverageTotal: integer("feather_coverage_total"),
  footpadDermatitisAffected: integer("footpad_dermatitis_affected"),
  footpadDermatitisTotal: integer("footpad_dermatitis_total"),
  hockBurnAffected: integer("hock_burn_affected"),
  hockBurnTotal: integer("hock_burn_total"),
  culledBirdsAffected: integer("culled_birds_affected"),
  culledBirdsTotal: integer("culled_birds_total"),

  walkthroughNotes: text("walkthrough_notes"),
  weatherConditions: text("weather_conditions"),
  appliedToWoa: boolean("applied_to_woa").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WelfareWalkthroughObservation = typeof welfareWalkthroughObservationsTable.$inferSelect;
export type NewWelfareWalkthroughObservation = typeof welfareWalkthroughObservationsTable.$inferInsert;

// ─── PPE Stock Register ───────────────────────────────────────────────────────
// Inventory of PPE items held on the farm, with supplier and invoice traceability.

export const ppeStockItemsTable = pgTable("ppe_stock_items", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  ppeType: text("ppe_type").notNull(),
  description: text("description"),
  size: text("size"),
  quantityReceived: integer("quantity_received").notNull().default(0),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  unitCostPence: integer("unit_cost_pence"),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  supplierName: text("supplier_name"),
  invoiceRef: text("invoice_ref"),
  deliveryNoteRef: text("delivery_note_ref"),
  receivedDate: date("received_date"),
  batchNumber: text("batch_number"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PpeStockItem = typeof ppeStockItemsTable.$inferSelect;
export type NewPpeStockItem = typeof ppeStockItemsTable.$inferInsert;

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
  stockItemId: integer("stock_item_id").references(() => ppeStockItemsTable.id),
  dateIssued: date("date_issued").notNull(),
  conditionCheckDate: date("condition_check_date"),
  conditionAtCheck: text("condition_at_check"),        // "good", "worn", "damaged", "replaced"
  replacedDate: date("replaced_date"),
  replacedReason: text("replaced_reason"),
  notes: text("notes"),
  fitCheckConfirmed: boolean("fit_check_confirmed").notNull().default(false),
  fitCheckBy: text("fit_check_by"),                    // who confirmed the individual fit
  fitCheckNotes: text("fit_check_notes"),              // notes from the individual fit check
  trainingProvided: boolean("training_provided").notNull().default(false),
  trainingNotes: text("training_notes"),               // e.g. "Toolbox talk 01/05/2026 — donning/doffing, storage, inspection"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PpeIssueRecord = typeof ppeIssueRecordsTable.$inferSelect;
export type NewPpeIssueRecord = typeof ppeIssueRecordsTable.$inferInsert;

// ─── PPE Risk Assessments ─────────────────────────────────────────────────────
// PPE at Work Regulations 2022: employers must carry out a documented risk
// assessment before issuing PPE, confirming the correct item has been selected
// for the hazard, that it fits the individual, and that it is compatible with
// any other PPE being worn simultaneously.

export const ppeRiskAssessmentsTable = pgTable("ppe_risk_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  assessmentRef: text("assessment_ref"),               // optional reference number e.g. "PPE-RA-001"
  ppeType: text("ppe_type").notNull(),                 // which category of PPE this assessment covers
  hazardIdentified: text("hazard_identified").notNull(), // what hazard the PPE protects against
  taskOrArea: text("task_or_area"),                    // work task or location where PPE is required
  riskLevel: text("risk_level"),                       // "Low" | "Medium" | "High"
  ppeSpecification: text("ppe_specification"),         // specific standard / EN number / model

  fitConfirmed: boolean("fit_confirmed").notNull().default(false),
  fitConfirmedBy: text("fit_confirmed_by"),
  fitConfirmedDate: date("fit_confirmed_date"),

  compatibilityChecked: boolean("compatibility_checked").notNull().default(false),
  compatibilityNotes: text("compatibility_notes"),
  compatiblePpeTypes: text("compatible_ppe_types"),    // comma-separated PPE type keys confirmed compatible e.g. "safety-boots,safety-glasses"

  trainingProvided: boolean("training_provided").notNull().default(false),
  trainingNotes: text("training_notes"),

  assessedBy: text("assessed_by").notNull(),
  assessmentDate: date("assessment_date").notNull(),
  reviewDate: date("review_date"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PpeRiskAssessment = typeof ppeRiskAssessmentsTable.$inferSelect;
export type NewPpeRiskAssessment = typeof ppeRiskAssessmentsTable.$inferInsert;

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
  pendingReviewTaskId: integer("pending_review_task_id"),       // task board task awaiting review
  pendingReviewTaskStaffName: text("pending_review_task_staff_name"), // snapshot of assignee name
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

  // ── Chemical store link ─────────────────────────────────────────────────────
  stockItemId: integer("stock_item_id").references(() => stockItemsTable.id),
  quantityUsed: numeric("quantity_used", { precision: 10, scale: 3 }),   // amount consumed from stock (in stock item's unit)

  // ── Document ────────────────────────────────────────────────────────────────
  documentPath: text("document_path"),   // object-storage path (preferred)
  documentUrl: text("document_url"),     // legacy URL field (kept for existing records)
  documentName: text("document_name"),   // display name for the document
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SheepDippingRecord = typeof sheepDippingRecordsTable.$inferSelect;
export type NewSheepDippingRecord = typeof sheepDippingRecordsTable.$inferInsert;

// ─── ATA on livestock_movements is handled by adding columns there ───────────
// See livestock.ts — will add ataNumber + ataExpiry via schema push
