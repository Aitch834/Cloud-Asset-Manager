import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ── Agri-environment Scheme Projects ─────────────────────────────────────────
// Covers FiPL, SFI, Countryside Stewardship, ELMs, AONB grants, etc.
// Deliberately scheme-agnostic so it works for any agreement-based payment scheme.

export const agriEnvProjectsTable = pgTable("agri_env_projects", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  schemeName: text("scheme_name").notNull(),
  administeringBody: text("administering_body"),
  agreementReference: text("agreement_reference"),
  designatedLandscape: text("designated_landscape"),
  theme: text("theme"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  totalGrantValuePence: integer("total_grant_value_pence"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agriEnvMilestonesTable = pgTable("agri_env_milestones", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => agriEnvProjectsTable.id, { onDelete: "cascade" }),
  milestoneName: text("milestone_name").notNull(),
  dueDate: date("due_date"),
  completionDate: date("completion_date"),
  claimAmountPence: integer("claim_amount_pence"),
  status: text("status").notNull().default("pending"),
  evidenceNotes: text("evidence_notes"),
  alertClaimedAt: timestamp("alert_claimed_at", { withTimezone: true }),
  alertedAt: timestamp("alerted_at", { withTimezone: true }),
  push7dClaimedAt: timestamp("push_7d_claimed_at", { withTimezone: true }),
  push7dSentAt: timestamp("push_7d_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const farmGrantsTable = pgTable("farm_grants", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  schemeName: text("scheme_name").notNull(),
  schemeType: text("scheme_type").notNull().default("FETF"),
  itemReferenceCode: text("item_reference_code"),
  itemDescription: text("item_description"),
  applicationReference: text("application_reference"),
  approvalAgreementReference: text("approval_agreement_reference"),
  applicationDate: date("application_date"),
  approvalDate: date("approval_date"),
  purchaseDeadline: date("purchase_deadline"),
  claimDeadline: date("claim_deadline"),
  grantAmountPence: integer("grant_amount_pence"),
  actualCostPence: integer("actual_cost_pence"),
  status: text("status").notNull().default("applied"),
  linkedEquipmentId: integer("linked_equipment_id"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
