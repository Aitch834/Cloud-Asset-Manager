import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

export const suppliersTable = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  category: text("category"),
  supplierType: text("supplier_type").notNull().default("general"),
  accountNumber: text("account_number"),
  isApproved: boolean("is_approved").notNull().default(false),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  ufasNumber: text("ufas_number"),
  femasNumber: text("femas_number"),
  aphaFeedRegNumber: text("apha_feed_reg_number"),
  certificationBody: text("certification_body"),
  certificationExpiry: timestamp("certification_expiry", { withTimezone: true }),
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
  productCode: text("product_code"),
  mappNumber: text("mapp_number"),
  unit: text("unit"),
  reorderLevel: numeric("reorder_level", { precision: 10, scale: 2 }),
  storageLocation: text("storage_location"),
  defaultSupplierId: integer("default_supplier_id").references(() => suppliersTable.id),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  poNumber: text("po_number").notNull(),
  orderDate: timestamp("order_date", { withTimezone: true }).notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date", { withTimezone: true }),
  status: text("status").notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const purchaseOrderLinesTable = pgTable("purchase_order_lines", {
  id: serial("id").primaryKey(),
  poId: integer("po_id").notNull().references(() => purchaseOrdersTable.id, { onDelete: "cascade" }),
  stockItemId: integer("stock_item_id").notNull().references(() => stockItemsTable.id),
  quantityOrdered: numeric("quantity_ordered", { precision: 10, scale: 2 }).notNull(),
  unitPricePence: integer("unit_price_pence"),
  quantityReceived: numeric("quantity_received", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
});

export const stockDeliveriesTable = pgTable("stock_deliveries", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  stockItemId: integer("stock_item_id").notNull().references(() => stockItemsTable.id),
  poId: integer("po_id").references(() => purchaseOrdersTable.id),
  grnNumber: text("grn_number"),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  batchNumber: text("batch_number"),
  lotNumber: text("lot_number"),
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

export const stockMovementsTable = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  stockItemId: integer("stock_item_id").notNull().references(() => stockItemsTable.id),
  movementType: text("movement_type").notNull(),
  quantityChange: numeric("quantity_change", { precision: 10, scale: 4 }).notNull(),
  referenceType: text("reference_type"),
  referenceId: integer("reference_id"),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  deliveryId: integer("delivery_id").references(() => stockDeliveriesTable.id),
  movedAt: timestamp("moved_at", { withTimezone: true }).notNull().defaultNow(),
  performedBy: text("performed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
