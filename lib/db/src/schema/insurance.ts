import { pgTable, text, serial, integer, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const DOC_TYPE_VALUES = ["certificate", "insurance_schedule", "insurance_policy", "renewal_invitation", "policy_document", "other"] as const;

export const farmInsuranceTable = pgTable("farm_insurance", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  policyType: text("policy_type").notNull(),
  insurer: text("insurer"),
  policyNumber: text("policy_number"),
  policyholderName: text("policyholder_name"),
  coverLevelPence: integer("cover_level_pence"),
  annualPremiumPence: integer("annual_premium_pence"),
  startDate: date("start_date"),
  expiryDate: date("expiry_date"),
  renewalDate: date("renewal_date"),
  broker: text("broker"),
  brokerContact: text("broker_contact"),
  coversThirdPartyGoods: boolean("covers_third_party_goods").notNull().default(false),
  coversContractWork: boolean("covers_contract_work").notNull().default(false),
  coversEmployerLiability: boolean("covers_employer_liability").notNull().default(false),
  lastReviewedDate: date("last_reviewed_date"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  supersededByRenewal: boolean("superseded_by_renewal").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const CLAIM_STATUS_VALUES = ["draft", "reported", "acknowledged", "under_investigation", "settled", "rejected", "withdrawn"] as const;

export const farmInsuranceClaimsTable = pgTable("farm_insurance_claims", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  insuranceRecordId: integer("insurance_record_id").references(() => farmInsuranceTable.id, { onDelete: "set null" }),
  policyType: text("policy_type"),
  insurer: text("insurer"),
  incidentDate: date("incident_date"),
  reportedDate: date("reported_date"),
  claimRef: text("claim_ref"),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  settledAmountPence: integer("settled_amount_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const farmInsuranceDocumentsTable = pgTable("farm_insurance_documents", {
  id: serial("id").primaryKey(),
  insuranceRecordId: integer("insurance_record_id").notNull().references(() => farmInsuranceTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  documentType: text("document_type").notNull().default("other"),
  documentPath: text("document_path").notNull(),
  documentName: text("document_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
