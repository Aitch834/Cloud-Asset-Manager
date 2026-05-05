import { pgTable, text, serial, integer, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

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
