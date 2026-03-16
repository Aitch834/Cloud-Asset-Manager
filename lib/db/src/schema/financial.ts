import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { stockDeliveriesTable } from "./stock-suppliers";

export const financialTransactionsTable = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  stockDeliveryId: integer("stock_delivery_id").references(() => stockDeliveriesTable.id),
  transactionType: text("transaction_type").notNull(),
  category: text("category"),
  description: text("description"),
  amountPence: integer("amount_pence").notNull(),
  currency: text("currency").notNull().default("GBP"),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
  reference: text("reference"),
  vendorCustomer: text("vendor_customer"),
  paymentMethod: text("payment_method"),
  vatAmountPence: integer("vat_amount_pence"),
  vatRate: text("vat_rate"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const financialExportsTable = pgTable("financial_exports", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  exportType: text("export_type").notNull(),
  dateRangeStart: timestamp("date_range_start", { withTimezone: true }).notNull(),
  dateRangeEnd: timestamp("date_range_end", { withTimezone: true }).notNull(),
  format: text("format").notNull().default("csv"),
  generatedBy: text("generated_by"),
  filePath: text("file_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
