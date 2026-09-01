import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Shape of the ui_prefs JSONB column stored on each user row. */
export interface UiPrefs {
  /** Keys are hint IDs (e.g. "lightbox_reorder_hint_shown"); value is true when dismissed. */
  [hintKey: string]: boolean | undefined;
}

/** The eight alert categories a user can independently opt in/out of. */
export type SmsCategory = "livestock" | "dairy" | "arable" | "viticulture" | "tasks" | "regulatory" | "quality" | "stock";
/** Per-category SMS preferences stored in sms_categories JSONB. null = all categories enabled (legacy/default). */
export type SmsCategories = Partial<Record<SmsCategory, boolean>>;

// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessionsTable = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  smsOptIn: varchar("sms_opt_in").notNull().default("none"),
  smsConsentAt: timestamp("sms_consent_at", { withTimezone: true }),
  /** Per-user UI hint dismissal flags, keyed by hint ID. Added via startup migration. */
  uiPrefs: jsonb("ui_prefs").$type<UiPrefs>().notNull().default({}),
  /** Per-category SMS opt-in. null = all categories enabled (legacy). Added via startup migration. */
  smsCategories: jsonb("sms_categories").$type<SmsCategories>(),
  /** Whether the user receives sector alert emails (issued and all-clear notices). Added via startup migration. */
  emailSectorAlerts: boolean("email_sector_alerts").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
