import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const farmInsuranceTable = pgTable("farm_insurance", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  policyType: text("policy_type").notNull(),
  insurer: text("insurer"),
  policyNumber: text("policy_number"),
  policyholderName: text("policyholder_name"),
  coverLevelPence: integer("cover_level_pence"),
  startDate: date("start_date"),
  expiryDate: date("expiry_date"),
  notes: text("notes"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
