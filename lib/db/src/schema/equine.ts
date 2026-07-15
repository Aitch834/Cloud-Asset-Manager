import { pgTable, text, serial, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Equine Register ──────────────────────────────────────────────────────────
// NOTE: equineRecordsTable + equineHealthEventsTable already exist in diversification.ts.
// This file provides an extended equine_register table with passport/food-chain fields.
export const equineRegisterTable = pgTable("equine_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  species: text("species").notNull().default("horse"), // "horse" | "pony" | "donkey" | "mule"
  breed: text("breed"),
  sex: text("sex"), // "stallion" | "gelding" | "mare" | "filly" | "colt"
  colour: text("colour"),
  dateOfBirth: date("date_of_birth"),
  microchipNumber: text("microchip_number"),
  ueln: text("ueln"), // Universal Equine Life Number (15-digit EU passport identifier)
  passportNumber: text("passport_number"),
  passportIssuer: text("passport_issuer"), // e.g. "Weatherbys", "BHWT", "World Horse Welfare"
  passportExpiryDate: date("passport_expiry_date"),
  foodChainStatus: text("food_chain_status").notNull().default("excluded"), // "included" | "excluded"
  location: text("location"),
  owner: text("owner"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Equine Event Log ──────────────────────────────────────────────────────────
// Separate from diversification.ts equineHealthEventsTable — uses equine_event_log table.
export const equineEventLogTable = pgTable("equine_event_log", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  equineId: integer("equine_id").notNull().references(() => equineRegisterTable.id),
  eventDate: date("event_date").notNull(),
  eventType: text("event_type").notNull(), // "vaccination" | "dental" | "farriery" | "worming" | "vet_visit" | "passport" | "other"
  vetOrPractitioner: text("vet_or_practitioner"),
  productUsed: text("product_used"),
  batchNumber: text("batch_number"),
  withdrawalDays: integer("withdrawal_days").default(0),
  description: text("description"),
  nextDueDate: date("next_due_date"),
  costPence: integer("cost_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EquineRegisterEntry = typeof equineRegisterTable.$inferSelect;
export type NewEquineRegisterEntry = typeof equineRegisterTable.$inferInsert;
export type EquineEventLog = typeof equineEventLogTable.$inferSelect;
export type NewEquineEventLog = typeof equineEventLogTable.$inferInsert;
