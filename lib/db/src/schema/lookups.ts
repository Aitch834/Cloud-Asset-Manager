import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const lookupItemsTable = pgTable("lookup_items", {
  id: serial("id").primaryKey(),
  lookupKey: text("lookup_key").notNull(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  groupLabel: text("group_label"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isBdeManaged: boolean("is_bde_managed").notNull().default(true),
  tenantId: integer("tenant_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LookupItem = typeof lookupItemsTable.$inferSelect;

export const lookupReviewLogTable = pgTable("lookup_review_log", {
  id: serial("id").primaryKey(),
  lookupKey: text("lookup_key").notNull(),
  reviewedBy: text("reviewed_by").notNull(),
  notes: text("notes"),
  nextReviewDue: timestamp("next_review_due", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LookupReviewLog = typeof lookupReviewLogTable.$inferSelect;
