import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const adCopyPresetsTable = pgTable("ad_copy_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  headline: text("headline").notNull().default(""),
  body: text("body").notNull().default(""),
  accentColor: text("accent_color").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdCopyPreset = typeof adCopyPresetsTable.$inferSelect;
export type NewAdCopyPreset = typeof adCopyPresetsTable.$inferInsert;

export const adTemplatesTable = pgTable("ad_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  widthMm: integer("width_mm").notNull(),
  heightMm: integer("height_mm").notNull(),
  /** Full WeasyPrint HTML with {{font_css}}, {{logo}}, {{bg}}, {{qr}} placeholders */
  htmlBody: text("html_body").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  /** Soft-delete: non-null means the template has been archived and will not appear in renders */
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export type AdTemplate = typeof adTemplatesTable.$inferSelect;
export type NewAdTemplate = typeof adTemplatesTable.$inferInsert;
