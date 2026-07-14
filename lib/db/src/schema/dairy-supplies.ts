import { pgTable, serial, integer, text, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { ppeStockItemsTable } from "./compliance-gaps";
import { stockItemsTable } from "./stock-suppliers";

// ─── Dairy Supply Drawdowns ───────────────────────────────────────────────────
// Records PPE and chemical consumption events originating from dairy operations.
// Each log entry optionally links to an existing PPE stock item or chemical
// stock item so that quantities can be deducted in real time.

export const dairySupplyDrawdownsTable = pgTable("dairy_supply_drawdowns", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  dairyType: text("dairy_type").notNull(),          // 'cattle'|'sheep'|'goat'|'organic-cattle'|'organic-sheep'|'organic-goat'
  drawdownDate: date("drawdown_date").notNull(),
  itemType: text("item_type").notNull(),             // 'ppe' | 'chemical'
  itemName: text("item_name").notNull(),
  ppeStockItemId: integer("ppe_stock_item_id").references(() => ppeStockItemsTable.id),
  chemStockItemId: integer("chem_stock_item_id").references(() => stockItemsTable.id),
  quantityUsed: numeric("quantity_used", { precision: 10, scale: 3 }).notNull(),
  unit: text("unit").notNull(),                      // 'items'|'litres'|'ml'|'kg'|'g'
  usedBy: text("used_by"),
  usageContext: text("usage_context"),               // 'milking'|'cip-cleaning'|'teat-prep'|'calving-kidding'|'general'
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DairySupplyDrawdown = typeof dairySupplyDrawdownsTable.$inferSelect;
export type NewDairySupplyDrawdown = typeof dairySupplyDrawdownsTable.$inferInsert;

// ─── Dairy Restock Requests ───────────────────────────────────────────────────
// Purchase / replenishment requests raised by dairy staff when PPE or chemical
// stock runs low. Visible to farm admins who can approve, order, and mark
// as received.

export const dairyRestockRequestsTable = pgTable("dairy_restock_requests", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  dairyType: text("dairy_type").notNull(),
  requestDate: date("request_date").notNull(),
  itemType: text("item_type").notNull(),             // 'ppe' | 'chemical'
  itemName: text("item_name").notNull(),
  ppeStockItemId: integer("ppe_stock_item_id").references(() => ppeStockItemsTable.id),
  chemStockItemId: integer("chem_stock_item_id").references(() => stockItemsTable.id),
  requestedQty: numeric("requested_qty", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  urgency: text("urgency").notNull().default("normal"),   // 'low'|'normal'|'urgent'|'critical'
  requestedBy: text("requested_by"),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),    // 'pending'|'approved'|'ordered'|'received'|'rejected'
  adminNotes: text("admin_notes"),
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DairyRestockRequest = typeof dairyRestockRequestsTable.$inferSelect;
export type NewDairyRestockRequest = typeof dairyRestockRequestsTable.$inferInsert;
