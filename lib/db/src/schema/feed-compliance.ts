import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const feedContingencyPlansTable = pgTable("feed_contingency_plans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  // Supply resilience targets
  minimumStockDaysTarget: integer("minimum_stock_days_target"),
  alertThresholdKg: numeric("alert_threshold_kg", { precision: 10, scale: 2 }),
  dailyConsumptionKg: numeric("daily_consumption_kg", { precision: 10, scale: 2 }),

  // Supplier contacts (JSON arrays stored as text)
  primarySupplierName: text("primary_supplier_name"),
  primarySupplierPhone: text("primary_supplier_phone"),
  primarySupplierEmail: text("primary_supplier_email"),
  alternativeSuppliers: text("alternative_suppliers"), // JSON: [{name, phone, email, notes}]

  // Emergency contacts: vet, mill, AHDB, neighbours, AHDB crisis line
  emergencyContacts: text("emergency_contacts"), // JSON: [{name, role, phone, email}]

  // Written plan sections
  triggerConditions: text("trigger_conditions"),       // What triggers the plan
  immediateActions: text("immediate_actions"),          // Steps 1–N when feed supply fails
  rationingProcedures: text("rationing_procedures"),   // How to stretch existing stock
  communicationPlan: text("communication_plan"),        // Who to notify internally + externally
  recordKeepingDuringIncident: text("record_keeping_during_incident"),
  recoveryActions: text("recovery_actions"),            // Returning to normal operations

  // Document control
  planAuthor: text("plan_author"),
  approvedBy: text("approved_by"),
  lastReviewedDate: date("last_reviewed_date"),
  nextReviewDate: date("next_review_date"),
  versionNumber: text("version_number"),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const feedStockTargetsTable = pgTable("feed_stock_targets", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  species: text("species").notNull(), // "cattle", "sheep", "pigs", "poultry", "horses", "goats", "mixed", "all"
  label: text("label"), // optional display name e.g. "Dairy Herd", "Beef Finishers"
  dailyConsumptionKg: numeric("daily_consumption_kg", { precision: 10, scale: 2 }).notNull(),
  minimumStockDaysTarget: integer("minimum_stock_days_target").notNull(),
  alertThresholdKg: numeric("alert_threshold_kg", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const feedRecallIncidentsTable = pgTable("feed_recall_incidents", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  raisedDate: timestamp("raised_date", { withTimezone: true }).notNull().defaultNow(),
  raisedBy: text("raised_by"),

  // Feed identification
  productName: text("product_name"),
  feedType: text("feed_type"),
  supplierName: text("supplier_name"),
  feedBatchRef: text("feed_batch_ref"),   // matches feedDeliveriesTable.batchNumber
  deliveryNoteRef: text("delivery_note_ref"),
  quantityKgAffected: numeric("quantity_kg_affected", { precision: 10, scale: 2 }),

  // Reason for concern
  concernType: text("concern_type"), // "contamination", "mislabelling", "supplier_recall", "disease_link", "regulatory_advice", "other"
  reasonForConcern: text("reason_for_concern").notNull(),
  recallNoticeRef: text("recall_notice_ref"),      // supplier's official recall notice / reference number
  recallDocumentUrl: text("recall_document_url"),  // URL/path to the recall letter or document

  // Impact assessment
  feedWithdrawn: boolean("feed_withdrawn").notNull().default(false),
  withdrawalDate: date("withdrawal_date"),
  affectedHerds: text("affected_herds"),  // JSON: ["Herd A", "Herd B"]
  estimatedAnimalsAffected: integer("estimated_animals_affected"),
  animalHealthImpactObserved: boolean("animal_health_impact_observed").notNull().default(false),
  healthImpactDescription: text("health_impact_description"),

  // Actions taken
  actionsTaken: text("actions_taken"),
  feedDisposalMethod: text("feed_disposal_method"),
  replacementFeedSource: text("replacement_feed_source"),

  // Notifications
  reportedToSupplier: boolean("reported_to_supplier").notNull().default(false),
  supplierNotifiedDate: date("supplier_notified_date"),
  supplierReference: text("supplier_reference"),

  reportedToAuthority: boolean("reported_to_authority").notNull().default(false),
  authorityName: text("authority_name"),   // "APHA", "Trading Standards", "FSA", "DEFRA"
  authorityReference: text("authority_reference"),
  authorityNotifiedDate: date("authority_notified_date"),

  reportedToVet: boolean("reported_to_vet").notNull().default(false),
  vetName: text("vet_name"),
  vetNotifiedDate: date("vet_notified_date"),

  // Resolution
  status: text("status").notNull().default("open"),  // "open", "monitoring", "resolved"
  resolvedDate: date("resolved_date"),
  resolutionSummary: text("resolution_summary"),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const diseaseIncidentLogTable = pgTable("disease_incident_log", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  incidentDate: timestamp("incident_date", { withTimezone: true }).notNull(),
  reportedBy: text("reported_by"),

  // Classification
  incidentType: text("incident_type").notNull(), // "disease_suspicion", "notifiable_disease", "illness_outbreak", "injury", "other"
  species: text("species"),
  animalCount: integer("animal_count"),
  affectedHerds: text("affected_herds"),  // JSON: ["Herd A"]
  earTagsAffected: text("ear_tags_affected"),  // free text for individual animals if relevant

  // Clinical picture
  symptomsObserved: text("symptoms_observed").notNull(),
  onsetDate: date("onset_date"),
  suspectedDiagnosis: text("suspected_diagnosis"),
  confirmedDiagnosis: text("confirmed_diagnosis"),

  // Is this notifiable?
  isNotifiableDisease: boolean("is_notifiable_disease").notNull().default(false),
  notifiableDiseaseType: text("notifiable_disease_type"), // "FMD", "Bluetongue", "Avian Influenza", "ASF", "Brucellosis", "TB", "Anthrax", "other"

  // Vet response
  vetCalled: boolean("vet_called").notNull().default(false),
  vetName: text("vet_name"),
  vetCallDate: date("vet_call_date"),
  vetVisitDate: date("vet_visit_date"),
  vetAdvice: text("vet_advice"),
  treatmentGiven: text("treatment_given"),
  prescriptionRef: text("prescription_ref"),

  // Biosecurity response
  isolationApplied: boolean("isolation_applied").notNull().default(false),
  isolationDate: date("isolation_date"),
  isolationLocation: text("isolation_location"),
  movementRestricted: boolean("movement_restricted").notNull().default(false),
  movementRestrictionDate: date("movement_restriction_date"),
  movementRestrictionDetails: text("movement_restriction_details"),
  cleaningDisinfectionCarriedOut: boolean("cleaning_disinfection_carried_out").notNull().default(false),

  // Official reporting
  reportedToAPHA: boolean("reported_to_apha").notNull().default(false),
  aphaRef: text("apha_ref"),
  aphaNotifiedDate: date("apha_notified_date"),
  aphaInspectionDate: date("apha_inspection_date"),
  officialMovementOrderIssued: boolean("official_movement_order_issued").notNull().default(false),

  // Outcome
  status: text("status").notNull().default("open"),  // "open", "monitoring", "resolved"
  resolvedDate: date("resolved_date"),
  outcomeSummary: text("outcome_summary"),
  mortalityCount: integer("mortality_count"),
  mortalityAnimalIds: text("mortality_animal_ids"),  // JSON: [animalId, ...] — links to livestock_animals
  affectedAnimalIds: text("affected_animal_ids"),    // JSON: [animalId, ...] — links to livestock_animals
  lessonLearned: text("lesson_learned"),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
