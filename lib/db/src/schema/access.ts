import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const farmAdvisorsTable = pgTable("farm_advisors", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  invitedByUserId: text("invited_by_user_id").notNull(),
  advisorEmail: text("advisor_email").notNull(),
  advisorName: text("advisor_name").notNull(),
  advisorRole: text("advisor_role").notNull(),
  moduleAccess: jsonb("module_access").$type<string[]>().notNull().default([]),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const farmInspectionSessionsTable = pgTable("farm_inspection_sessions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  createdByUserId: text("created_by_user_id").notNull(),
  accessorEmail: text("accessor_email"),
  accessorName: text("accessor_name").notNull(),
  accessorOrganisation: text("accessor_organisation"),
  purpose: text("purpose").notNull(),
  moduleAccess: jsonb("module_access").$type<string[]>().notNull().default([]),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
  accessCount: integer("access_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const externalAccessLogTable = pgTable("external_access_log", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  sessionType: text("session_type").notNull(),
  sessionId: integer("session_id").notNull(),
  accessorEmail: text("accessor_email"),
  accessorName: text("accessor_name"),
  pageAccessed: text("page_accessed"),
  accessedAt: timestamp("accessed_at", { withTimezone: true }).notNull().defaultNow(),
});
