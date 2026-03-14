import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const suppliersTable = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  category: text("category"),
  accountNumber: text("account_number"),
  isApproved: boolean("is_approved").notNull().default(false),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const stockItemsTable = pgTable("stock_items", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  category: text("category"),
  unit: text("unit"),
  reorderLevel: numeric("reorder_level", { precision: 10, scale: 2 }),
  storageLocation: text("storage_location"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockDeliveriesTable = pgTable("stock_deliveries", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliersTable.id),
  stockItemId: integer("stock_item_id").notNull().references(() => stockItemsTable.id),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  batchNumber: text("batch_number"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  costPence: integer("cost_pence"),
  invoiceReference: text("invoice_reference"),
  receivedBy: text("received_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockLevelsTable = pgTable("stock_levels", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  stockItemId: integer("stock_item_id").notNull().references(() => stockItemsTable.id),
  currentQuantity: numeric("current_quantity", { precision: 10, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
});
