import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const farmGrantsTable = pgTable("farm_grants", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  schemeName: text("scheme_name").notNull(),
  schemeType: text("scheme_type").notNull().default("FETF"),
  itemReferenceCode: text("item_reference_code"),
  itemDescription: text("item_description"),
  applicationReference: text("application_reference"),
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
