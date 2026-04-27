import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { suppliersTable, purchaseOrdersTable } from "./stock-suppliers";
import { herdFlockRegisterTable } from "./livestock";

export const feedDeliveriesTable = pgTable("feed_deliveries", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  poId: integer("po_id").references(() => purchaseOrdersTable.id, { onDelete: "set null" }),
  feedStockItemId: integer("feed_stock_item_id"),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }).notNull(),
  supplierName: text("supplier_name").notNull(),
  ufasNumberOnNote: text("ufas_number_on_note"),
  femasNumberOnNote: text("femas_number_on_note"),
  deliveryNoteNumber: text("delivery_note_number"),
  invoiceReference: text("invoice_reference"),
  feedType: text("feed_type").notNull(),
  productName: text("product_name"),
  batchNumber: text("batch_number"),
  lotNumber: text("lot_number"),
  quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }).notNull(),
  costPence: integer("cost_pence"),
  storageLocation: text("storage_location"),
  bestBeforeDate: date("best_before_date"),
  medicatedFeed: boolean("medicated_feed").notNull().default(false),
  medicationDetails: text("medication_details"),
  withdrawalPeriodDays: integer("withdrawal_period_days"),
  speciesIntended: text("species_intended"),
  receivedBy: text("received_by"),
  notes: text("notes"),
  // ─── Organic feed compliance ──────────────────────────────────────────────
  isOrganicApproved: boolean("is_organic_approved").notNull().default(false),
  organicSupplierApprovalNumber: text("organic_supplier_approval_number"), // certifier-issued supplier number
  organicPercentage: numeric("organic_percentage", { precision: 5, scale: 2 }), // % of organic ingredients
  nonOrganicIngredientDerogation: text("non_organic_ingredient_derogation"), // reason if < 100% organic allowed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const feedPurchaseOrdersTable = pgTable("feed_purchase_orders", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  poNumber: text("po_number").notNull(),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  supplierName: text("supplier_name"),
  productName: text("product_name").notNull(),
  feedType: text("feed_type"),
  speciesIntended: text("species_intended"),
  quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }).notNull(),
  feedStockItemId: integer("feed_stock_item_id"),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: text("status").notNull().default("sent"),
  orderedBy: text("ordered_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const feedStockLevelsTable = pgTable("feed_stock_levels", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  feedType: text("feed_type").notNull(),
  productName: text("product_name"),
  storageLocation: text("storage_location"),
  currentStockKg: numeric("current_stock_kg", { precision: 10, scale: 2 }).notNull().default("0"),
  capacityKg: numeric("capacity_kg", { precision: 10, scale: 2 }),
  reorderThresholdKg: numeric("reorder_threshold_kg", { precision: 10, scale: 2 }),
  speciesIntended: text("species_intended"),
  supplierName: text("supplier_name"),
  awaitingDelivery: boolean("awaiting_delivery").notNull().default(false),
  expectedDeliveryDate: date("expected_delivery_date"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
});
