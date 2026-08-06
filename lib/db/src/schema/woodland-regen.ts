import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

// ─── Felling Licences (Forestry Commission, England) ─────────────────────────
// One row per licence application / granted licence. Licences are free, issued
// by the Forestry Commission, and usually carry restocking conditions.
export const fellingLicencesTable = pgTable("felling_licences", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  licenceNumber: text("licence_number"),
  status: text("status").notNull().default("planned"), // planned | applied | approved | refused | expired
  fellingType: text("felling_type"),                   // clear_fell | thinning | selective | coppice | other
  areaDescription: text("area_description"),           // woodland / compartment name
  areaHectares: numeric("area_hectares", { precision: 10, scale: 4 }),
  estimatedVolumeM3: numeric("estimated_volume_m3", { precision: 10, scale: 2 }),
  applicationDate: date("application_date"),
  approvalDate: date("approval_date"),
  expiryDate: date("expiry_date"),
  // Restocking conditions — typically required except for thinning-only licences
  restockingRequired: boolean("restocking_required").notNull().default(true),
  restockingConditions: text("restocking_conditions"),
  restockingDeadline: date("restocking_deadline"),
  restockingCompletedDate: date("restocking_completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Tree Felling Records ────────────────────────────────────────────────────
// One row per felling operation. Where no licence is held, the exemption being
// relied on must be recorded WITH supporting evidence (photos, maps, surveys) —
// the Forestry Commission's July 2026 guidance makes clear the burden of proof
// sits with the person claiming the exemption.
export const treeFellingRecordsTable = pgTable("tree_felling_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  licenceId: integer("licence_id").references(() => fellingLicencesTable.id, { onDelete: "set null" }),
  fieldId: integer("field_id").references(() => fieldsTable.id, { onDelete: "set null" }),
  fellingDate: date("felling_date").notNull(),
  location: text("location"),                          // woodland / parcel description
  species: text("species"),
  treeCount: integer("tree_count"),
  volumeM3: numeric("volume_m3", { precision: 10, scale: 2 }),       // estimated felled volume
  volumeSoldM3: numeric("volume_sold_m3", { precision: 10, scale: 2 }), // max 2 m³/quarter may be sold under the personal allowance
  // Legal basis for the felling
  legalBasis: text("legal_basis").notNull().default("licence"),
  // licence | quarterly_allowance | small_diameter | garden_orchard_churchyard |
  // dangerous_nuisance | tpo_planning_consent | statutory_undertaking |
  // lopping_topping | hedgerow | other_exemption
  purpose: text("purpose"),
  contractor: text("contractor"),
  evidenceNotes: text("evidence_notes"),               // photos / maps / surveys / permissions kept as proof
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Regenerative Practice Records ───────────────────────────────────────────
// One row per practice event/season, tagged to one of the six widely-recognised
// regenerative principles so coverage can be reported per principle per year.
export const regenPracticeRecordsTable = pgTable("regen_practice_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  fieldId: integer("field_id").references(() => fieldsTable.id, { onDelete: "set null" }),
  fieldName: text("field_name"),                       // display name / free text if no field link
  recordDate: date("record_date").notNull(),
  seasonYear: integer("season_year"),                  // harvest year the practice belongs to
  principle: text("principle").notNull(),
  // min_disturbance | soil_cover | living_roots | diversity | livestock_integration | input_reduction
  practice: text("practice").notNull(),                // e.g. "No-till drilling", "Cover crop — vetch/rye mix"
  areaHectares: numeric("area_hectares", { precision: 10, scale: 2 }),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Regenerative Soil Health Indicators ─────────────────────────────────────
// Outcome evidence over time — verification schemes (Regenified 6-3-4, buyer
// schemes) are outcome-based, so improvement must be demonstrable.
export const regenSoilIndicatorsTable = pgTable("regen_soil_indicators", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  fieldId: integer("field_id").references(() => fieldsTable.id, { onDelete: "set null" }),
  fieldName: text("field_name"),
  testDate: date("test_date").notNull(),
  sampleDepthCm: integer("sample_depth_cm"),
  organicMatterPercent: numeric("organic_matter_percent", { precision: 5, scale: 2 }),
  wormCount: integer("worm_count"),                    // worms per spadeful / 20cm pit
  vessScore: integer("vess_score"),                    // Visual Evaluation of Soil Structure, 1 (best) – 5 (worst)
  infiltrationSeconds: integer("infiltration_seconds"),// time for water to infiltrate (standard ring test)
  bulkDensityGCm3: numeric("bulk_density_g_cm3", { precision: 5, scale: 2 }),
  labName: text("lab_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
