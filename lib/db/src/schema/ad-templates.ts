import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

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
