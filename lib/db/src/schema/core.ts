import { pgTable, text, serial, integer, timestamp, boolean, varchar, jsonb, uniqueIndex, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const tenantsTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  isSandbox: boolean("is_sandbox").notNull().default(false),
  sandboxOfTenantId: integer("sandbox_of_tenant_id").references((): any => tenantsTable.id),
  stripeCustomerId: text("stripe_customer_id"),
  referralCode: text("referral_code"),
  referredBy: text("referred_by"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const farmsTable = pgTable("farms", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  name: text("name").notNull(),
  address: text("address"),
  postcode: text("postcode"),
  county: text("county"),
  cphNumber: text("cph_number"),
  gridReference: text("grid_reference"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  what3words: text("what3words"),
  contactPhone: text("contact_phone"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactEmail: text("emergency_contact_email"),
  totalAcreage: integer("total_acreage"),
  sectorArable: boolean("sector_arable").notNull().default(false),
  sectorBeef: boolean("sector_beef").notNull().default(false),
  sectorDairy: boolean("sector_dairy").notNull().default(false),
  sectorPigs: boolean("sector_pigs").notNull().default(false),
  sectorPoultry: boolean("sector_poultry").notNull().default(false),
  sectorHorticulture: boolean("sector_horticulture").notNull().default(false),
  sectorSheep: boolean("sector_sheep").notNull().default(false),
  sectorEggs: boolean("sector_eggs").notNull().default(false),
  sectorGoats: boolean("sector_goats").notNull().default(false),
  sectorEquine: boolean("sector_equine").notNull().default(false),
  sectorViticulture: boolean("sector_viticulture").notNull().default(false),
  sectorFreshProduce: boolean("sector_fresh_produce").notNull().default(false),
  sectorDeer: boolean("sector_deer").notNull().default(false),
  redTractorId: text("red_tractor_id"),
  sbiNumber: text("sbi_number"),
  totalHectares: numeric("total_hectares", { precision: 10, scale: 2 }),
  isNvzDesignated: boolean("is_nvz_designated").notNull().default(false),
  farmManager: text("farm_manager"),
  holdingType: text("holding_type"),
  assuranceBody: text("assurance_body"),
  eaml2Email: text("eaml2_email"),
  flockMark: text("flock_mark"),
  herdMark: text("herd_mark"),
  pigHerdMark: text("pig_herd_mark"),
  bcmsHoldingNumber: text("bcms_holding_number"),
  country: text("country").notNull().default("england"),
  scotEidNumber: text("scot_eid_number"),
  eidCymruNumber: text("eid_cymru_number"),
  timesheetReminderTime: text("timesheet_reminder_time").default("18:00"),
  appaRef: text("appa_ref"),
  appaRegistrationDate: text("appa_registration_date"),
  fsaWineProductionRef: text("fsa_wine_production_ref"),
  fsaVineRegisterRef: text("fsa_vine_register_ref"),
  winegbMembershipNumber: text("winegb_membership_number"),
  companyNumber: text("company_number"),
  vatNumber: text("vat_number"),
  bankName: text("bank_name"),
  bankAccountName: text("bank_account_name"),
  bankAccountNumber: text("bank_account_number"),
  bankSortCode: text("bank_sort_code"),
  paymentTermsDays: integer("payment_terms_days").default(30),
  invoiceFooterText: text("invoice_footer_text"),
  invoiceLogoPath: text("invoice_logo_path"),
  harvestStrictStorage: boolean("harvest_strict_storage").notNull().default(false),
  hpaiZoneStatus: text("hpai_zone_status"),
  hpaiZoneDate: text("hpai_zone_date"),
  hpaiHousingRequiredSince: text("hpai_housing_required_since"),
  irrigationCostPerMmHa: numeric("irrigation_cost_per_mm_ha", { precision: 8, scale: 2 }),
  irrigationAbstractionSource: text("irrigation_abstraction_source"),
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
  farmId: integer("farm_id").references(() => farmsTable.id),
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
  receiveAlerts: boolean("receive_alerts").notNull().default(false),
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
  farmRole: text("farm_role").notNull().default("operator"),
  accessType: text("access_type").notNull().default("full"),
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

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("warning"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedModule: text("related_module"),
  relatedId: integer("related_id"),
  dedupeKey: text("dedupe_key").unique(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userInvitationsTable = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  farmId: integer("farm_id").references(() => farmsTable.id),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  farmRole: text("farm_role").notNull().default("operator"),
  accessType: text("access_type").notNull().default("full"),
  token: text("token").notNull().unique(),
  invitedBy: varchar("invited_by").notNull(),
  staffMemberId: integer("staff_member_id"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  status: text("status").notNull().default("draft"),
  billingPeriodStart: timestamp("billing_period_start", { withTimezone: true }).notNull(),
  billingPeriodEnd: timestamp("billing_period_end", { withTimezone: true }).notNull(),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  billingName: text("billing_name").notNull(),
  billingAddress: text("billing_address"),
  billingEmail: text("billing_email").notNull(),
  lineItems: jsonb("line_items").notNull().default([]),
  netAmountPence: integer("net_amount_pence").notNull(),
  vatRatePct: integer("vat_rate_pct").notNull().default(20),
  vatAmountPence: integer("vat_amount_pence").notNull(),
  grossAmountPence: integer("gross_amount_pence").notNull(),
  notes: text("notes"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  sentMethod: text("sent_method"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── Farm Departments ───────────────────────────────────────────────────────────
// Optional grouping for staff — e.g. "Dairy Unit", "Arable", "Maintenance".
// Larger holdings use departments to monitor performance across teams.

export const farmDepartmentsTable = pgTable("farm_departments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  colour: text("colour").notNull().default("#6b7280"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type FarmDepartment = typeof farmDepartmentsTable.$inferSelect;
export type NewFarmDepartment = typeof farmDepartmentsTable.$inferInsert;

export const farmMembersTable = pgTable("farm_members", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  linkedUserId: varchar("linked_user_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  jobTitle: text("job_title"),
  departmentId: integer("department_id").references(() => farmDepartmentsTable.id, { onDelete: "set null" }),
  employedFrom: timestamp("employed_from", { withTimezone: true }),
  employedTo: timestamp("employed_to", { withTimezone: true }),
  farmRole: text("farm_role").notNull().default("operator"),
  accessType: text("access_type").notNull().default("none"),
  invitationStatus: text("invitation_status").notNull().default("not_invited"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  niNumber: text("ni_number"),
  payrollNumber: text("payroll_number"),
  nokName: text("nok_name"),
  nokRelationship: text("nok_relationship"),
  nokPhone: text("nok_phone"),
  nokEmail: text("nok_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── Staff ↔ Secondary Departments (many-to-many) ───────────────────────────────
// Keeps departmentId on farmMembersTable as the *primary* department.
// This table records any additional departments a person also works across.
export const staffDepartmentMembershipsTable = pgTable("staff_department_memberships", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => farmMembersTable.id, { onDelete: "cascade" }),
  departmentId: integer("department_id").notNull().references(() => farmDepartmentsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniq: uniqueIndex("staff_dept_membership_uniq").on(t.memberId, t.departmentId),
}));

export type StaffDepartmentMembership = typeof staffDepartmentMembershipsTable.$inferSelect;

export const farmTaskAssignmentsTable = pgTable("farm_task_assignments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id),
  assignedToMemberId: integer("assigned_to_member_id").notNull().references(() => farmMembersTable.id),
  assignedByUserId: text("assigned_by_user_id").notNull(),
  taskType: text("task_type").notNull().default("custom"),
  taskSourceId: text("task_source_id"),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date"),
  endDate: text("end_date"),
  module: text("module"),
  href: text("href"),
  staffName: text("staff_name").notNull(),
  staffPhone: text("staff_phone"),
  assignmentNote: text("assignment_note"),
  status: text("status").notNull().default("pending"),
  smsSent: boolean("sms_sent").notNull().default(false),
  smsSentAt: timestamp("sms_sent_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  completionNote: text("completion_note"),
  workOrderRef: text("work_order_ref"),
  serviceInvoiceId: integer("service_invoice_id"),
  customerId: integer("customer_id"),
  estimatedHours: numeric("estimated_hours", { precision: 5, scale: 2 }),
  startTime: text("start_time"),
  endTime: text("end_time"),
  reqTractors: integer("req_tractors").notNull().default(0),
  reqImplements: integer("req_implements").notNull().default(0),
  reqVehicles: integer("req_vehicles").notNull().default(0),
  reqSprayers: integer("req_sprayers").notNull().default(0),
  reqTrailers: integer("req_trailers").notNull().default(0),
  reqStaff: integer("req_staff").notNull().default(0),
  reqOther: integer("req_other").notNull().default(0),
  reqOtherNotes: text("req_other_notes"),
  reqMaterials: text("req_materials"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const taskAssignmentHistoryTable = pgTable("task_assignment_history", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => farmTaskAssignmentsTable.id, { onDelete: "cascade" }),
  previousAssigneeMemberId: integer("previous_assignee_member_id"),
  previousAssigneeName: text("previous_assignee_name"),
  newAssigneeMemberId: integer("new_assignee_member_id"),
  newAssigneeName: text("new_assignee_name"),
  reassignmentNote: text("reassignment_note"),
  reassignedAt: timestamp("reassigned_at", { withTimezone: true }).notNull().defaultNow(),
  reassignedByUserId: text("reassigned_by_user_id"),
});

// ── Farm Contacts Register ──────────────────────────────────────────────────
// Shared register of third-party contacts (agronomists, assessors, vets, etc.)
// referenced by multiple compliance modules.  Assessors can log in with a
// scoped "nvz-assessor" role and will auto-populate fields from this table.
export const farmContactsTable = pgTable("farm_contacts", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  organisation: text("organisation"),
  email: text("email"),
  phone: text("phone"),
  role: text("role"),            // e.g. "NVZ Assessor", "Agronomist", "Vet", "FACTS Adviser"
  qualifications: text("qualifications"), // e.g. "FACTS qualified, BASIS registered"
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
export type FarmContact = typeof farmContactsTable.$inferSelect;
export type NewFarmContact = typeof farmContactsTable.$inferInsert;

// ── Generic record attachments (calving, lambing, farrowing, mortality, mastitis, DCT, AI) ──
export const farmRecordAttachmentsTable = pgTable("farm_record_attachments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull(),
  recordType: varchar("record_type", { length: 100 }).notNull(),
  recordId: integer("record_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  notes: text("notes"),
  uploadedByName: text("uploaded_by_name"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Expo Push Notification Tokens ──
// Stores Expo push tokens registered by mobile workers.
// Tokens are linked to a Clerk user ID so tasks can be pushed to the correct device(s).
export const expoPushTokensTable = pgTable("expo_push_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  farmId: integer("farm_id").references(() => farmsTable.id, { onDelete: "set null" }),
  expoPushToken: text("expo_push_token").notNull().unique(),
  platform: text("platform"),
  deviceName: text("device_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Platform admin audit log ──
// Records every sensitive action taken in the admin portal.
// Rows are append-only — no updates or deletes should ever be performed on this table.
export const platformAuditLogTable = pgTable("platform_audit_log", {
  id: serial("id").primaryKey(),
  // The admin user who performed the action (Clerk userId).
  actorUserId: text("actor_user_id").notNull(),
  // Human-readable action name, e.g. "sql_query", "impersonate", "email_delete".
  action: varchar("action", { length: 100 }).notNull(),
  // Optional: which tenant or farm this action relates to.
  targetTenantId: integer("target_tenant_id"),
  targetFarmId: integer("target_farm_id"),
  // Freeform metadata (SQL text, email UID, impersonated userId, etc.).
  metadata: jsonb("metadata"),
  // UTC timestamp of the action.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
