import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const helpArticlesTable = pgTable("help_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt"),
  published: boolean("published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type HelpArticle = typeof helpArticlesTable.$inferSelect;
export type NewHelpArticle = typeof helpArticlesTable.$inferInsert;
