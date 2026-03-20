import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const emailTemplatesTable = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("general"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EmailTemplate = typeof emailTemplatesTable.$inferSelect;

export const adminEmailsSentTable = pgTable("admin_emails_sent", {
  id: serial("id").primaryKey(),
  toAddress: text("to_address").notNull(),
  toName: text("to_name"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  templateId: integer("template_id"),
  ticketId: integer("ticket_id"),
  status: text("status").notNull().default("sent"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminEmailSent = typeof adminEmailsSentTable.$inferSelect;
