import { pgTable, text, serial, integer, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

// ─── RTFO Registered Buyers ───────────────────────────────────────────────────
// Buyers are obligated fuel suppliers registered with the Department for Transport.
// They carry an RTF Obligation Number (their government-issued ID).
export const rtfoBuyersTable = pgTable("rtfo_buyers", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  companyName: text("company_name").notNull(),
  tradingName: text("trading_name"),
  rtfoObligationNumber: text("rtfo_obligation_number"),   // DfT-assigned government ID
  isccCertNumber: text("iscc_cert_number"),               // Optional: buyer's own ISCC cert ref
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  town: text("town"),
  county: text("county"),
  postcode: text("postcode"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const biofuelCertificationsTable = pgTable("biofuel_certifications", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  scheme: text("scheme").notNull(),
  certificationNumber: text("certification_number"),
  issuingBody: text("issuing_body"),
  issueDate: timestamp("issue_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  scope: text("scope"),
  rtfoOperatorNumber: text("rtfo_operator_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const biofuelFieldDeclarationsTable = pgTable("biofuel_field_declarations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  fieldName: text("field_name").notNull(),
  landUseIn2008: text("land_use_in_2008").notNull(),
  convertedAfter2008: boolean("converted_after_2008").notNull().default(false),
  conversionFrom: text("conversion_from"),
  conversionDate: timestamp("conversion_date", { withTimezone: true }),
  highCarbonStockRisk: boolean("high_carbon_stock_risk").notNull().default(false),
  highBiodiversityRisk: boolean("high_biodiversity_risk").notNull().default(false),
  eligibilityStatus: text("eligibility_status").notNull().default("eligible"),
  declarationDate: timestamp("declaration_date", { withTimezone: true }).notNull().defaultNow(),
  declaredBy: text("declared_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const biofuelDeliveriesTable = pgTable("biofuel_deliveries", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  buyerId: integer("buyer_id").references(() => rtfoBuyersTable.id),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }).notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerRtfoRef: text("buyer_rtfo_ref"),
  cropType: text("crop_type").notNull(),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 3 }),
  fieldNames: jsonb("field_names").$type<string[]>().default([]),
  certificationRef: text("certification_ref"),
  sustainabilityDeclarationRef: text("sustainability_declaration_ref"),
  sustainabilityScheme: text("sustainability_scheme"),
  ghgSavingPercent: numeric("ghg_saving_percent", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
