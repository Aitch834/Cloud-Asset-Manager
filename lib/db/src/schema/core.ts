import { pgTable, text, serial, integer, timestamp, boolean, varchar, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const tenantsTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const farmsTable = pgTable("farms", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  name: text("name").notNull(),
  address: text("address"),
  postcode: text("postcode"),
  cphNumber: text("cph_number"),
  gridReference: text("grid_reference"),
  totalAcreage: integer("total_acreage"),
  sectorArable: boolean("sector_arable").notNull().default(false),
  sectorBeef: boolean("sector_beef").notNull().default(false),
  sectorDairy: boolean("sector_dairy").notNull().default(false),
  sectorPigs: boolean("sector_pigs").notNull().default(false),
  sectorPoultry: boolean("sector_poultry").notNull().default(false),
  sectorHorticulture: boolean("sector_horticulture").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  isSystemRole: boolean("is_system_role").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const modulesTable = pgTable("modules", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  monthlyPricePence: integer("monthly_price_pence").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  requiresSector: text("requires_sector"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id),
  canRead: boolean("can_read").notNull().default(true),
  canWrite: boolean("can_write").notNull().default(false),
  canDelete: boolean("can_delete").notNull().default(false),
  canApprove: boolean("can_approve").notNull().default(false),
});

export const userTenantsTable = pgTable("user_tenants", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("user_tenant_unique").on(table.userId, table.tenantId),
]);

export const staffFarmAssignmentsTable = pgTable("staff_farm_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  roleId: integer("role_id").references(() => rolesTable.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("staff_farm_unique").on(table.userId, table.farmId),
]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeSubscriptionItemId: text("stripe_subscription_item_id"),
  status: text("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const userInvitationsTable = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  email: text("email").notNull(),
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  token: text("token").notNull().unique(),
  invitedBy: varchar("invited_by").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
