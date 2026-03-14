import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { farmsTable, tenantsTable } from "./core";

export const supportTicketMessagesTable = pgTable("support_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  senderType: text("sender_type").notNull(),
  senderId: varchar("sender_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
