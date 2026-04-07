import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
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

export const cropContractsTable = pgTable("crop_contracts", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // Instrument type — determines which fields apply
  contractType: text("contract_type").notNull().default("forward"), // forward | pool
  cropYear: text("crop_year"), // e.g. "2024 Harvest" — which harvest the contract relates to
  buyer: text("buyer").notNull(),
  commodity: text("commodity").notNull(),
  variety: text("variety"),
  qualitySpec: text("quality_spec"),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 2 }),
  contractedPricePence: integer("contracted_price_pence"), // Forward: fixed price; Pool: not used
  totalValuePence: integer("total_value_pence"),
  currency: text("currency").notNull().default("GBP"),
  priceUnit: text("price_unit"),
  contractDate: timestamp("contract_date", { withTimezone: true }),
  // Forward contract fields
  deliveryWindowStart: timestamp("delivery_window_start", { withTimezone: true }),
  deliveryWindowEnd: timestamp("delivery_window_end", { withTimezone: true }),
  deliveryLocation: text("delivery_location"),
  callOffWindowNotes: text("call_off_window_notes"), // Notes on call-off schedule / tonnage windows
  // Pool scheme fields
  advancePaymentPence: integer("advance_payment_pence"), // Advance per tonne at pool opening (pence)
  poolLevyPence: integer("pool_levy_pence"),             // Pool operator's levy per tonne (pence)
  poolClosingDate: timestamp("pool_closing_date", { withTimezone: true }), // When pool stops accepting grain
  poolSettlementDate: timestamp("pool_settlement_date", { withTimezone: true }), // When pool pays final balance
  poolBonusDeclarations: text("pool_bonus_declarations"), // JSON: [{date, bonusPence, notes}]
  // Common
  status: text("status").notNull().default("open"), // open | active | pending | fulfilled | cancelled | disputed
  contractReference: text("contract_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
