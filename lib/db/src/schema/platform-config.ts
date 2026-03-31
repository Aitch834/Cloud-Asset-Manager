import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformConfigTable = pgTable("platform_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PlatformConfig = typeof platformConfigTable.$inferSelect;
