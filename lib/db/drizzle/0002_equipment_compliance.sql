CREATE TABLE "farm_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"organisation" text,
	"email" text,
	"phone" text,
	"role" text,
	"qualifications" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ipm_monitoring_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"log_date" date NOT NULL,
	"pest_or_weed" text NOT NULL,
	"observation" text,
	"severity" text,
	"threshold_breached" boolean DEFAULT false,
	"action_taken" text,
	"inspector" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_bays" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"row_id" integer,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_labour_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"entry_date" text NOT NULL,
	"description" text,
	"charge_units" integer DEFAULT 1 NOT NULL,
	"rate_pence" integer NOT NULL,
	"cost_pence" integer NOT NULL,
	"performed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_settings" (
	"farm_id" integer PRIMARY KEY NOT NULL,
	"labour_rate_pence" integer DEFAULT 5000 NOT NULL,
	"labour_charge_unit_minutes" integer DEFAULT 15 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_shelves" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"bay_id" integer NOT NULL,
	"name" text NOT NULL,
	"qr_token" text NOT NULL,
	"capacity" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slurry_store_fill_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"event_date" date NOT NULL,
	"volume_m3" numeric(10, 2) NOT NULL,
	"material_type" text,
	"source_description" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_arable_certification" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"certifier" text NOT NULL,
	"certificate_number" text,
	"operator_number" text,
	"certification_date" date,
	"renewal_date" date,
	"annual_inspection_date" date,
	"next_inspection_due" date,
	"status" text DEFAULT 'certified' NOT NULL,
	"scope" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_arable_field_conversion" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"field_name" text NOT NULL,
	"area_ha" numeric(10, 3),
	"conversion_start_date" date NOT NULL,
	"expected_certification_date" date,
	"actual_certification_date" date,
	"status" text DEFAULT 'in-conversion' NOT NULL,
	"certifier_ref" text,
	"parallel_production" boolean DEFAULT false NOT NULL,
	"parallel_production_justification" text,
	"previous_land_use" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_arable_harvest_declarations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"field_name" text,
	"harvest_date" date NOT NULL,
	"crop_name" text NOT NULL,
	"variety" text,
	"yield_tonnes" numeric(10, 3),
	"moisture_percent" numeric(5, 2),
	"storage_location" text,
	"organic_status" text DEFAULT 'certified' NOT NULL,
	"certifier_ref" text,
	"buyer_name" text,
	"buyer_organisation" text,
	"buyer_address" text,
	"sale_date" date,
	"quantity_sold_tonnes" numeric(10, 3),
	"price_pound_per_tonne" numeric(10, 2),
	"organic_premium_percent" numeric(5, 2),
	"declaration_date" date,
	"declaration_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_arable_input_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"field_name" text,
	"application_date" date NOT NULL,
	"product_name" text NOT NULL,
	"active_ingredient" text,
	"input_type" text NOT NULL,
	"permitted_status" text DEFAULT 'permitted' NOT NULL,
	"regulatory_basis" text,
	"supplier_name" text,
	"quantity_applied" numeric(10, 3),
	"quantity_unit" text,
	"area_applied_ha" numeric(10, 3),
	"supplier_id" integer,
	"stock_delivery_id" integer,
	"batch_number" text,
	"lot_number" text,
	"grn_number" text,
	"certifier_approval" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_arable_seed_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"stock_id" integer NOT NULL,
	"seed_record_id" integer,
	"movement_type" text NOT NULL,
	"movement_date" date NOT NULL,
	"quantity_kg" numeric(10, 2) NOT NULL,
	"po_reference" text,
	"grn_reference" text,
	"supplier_name" text,
	"invoice_reference" text,
	"unit_cost_pound_per_tonne" numeric(10, 2),
	"field_id" integer,
	"field_name" text,
	"seed_rate_kg_ha" numeric(8, 2),
	"area_drilled_ha" numeric(10, 4),
	"operator_name" text,
	"reference" text,
	"reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_arable_seed_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"purchase_date" date NOT NULL,
	"crop_name" text NOT NULL,
	"variety" text,
	"quantity_kg" numeric(10, 2),
	"supplier_name" text,
	"supplier_address" text,
	"seed_type" text DEFAULT 'organic' NOT NULL,
	"derogation_granted" boolean DEFAULT false NOT NULL,
	"derogation_reference" text,
	"derogation_expiry_date" date,
	"certifier_approval" text,
	"batch_lot_number" text,
	"po_reference" text,
	"grn_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_arable_seed_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"crop_name" text NOT NULL,
	"variety" text,
	"batch_lot_number" text,
	"seed_type" text DEFAULT 'organic' NOT NULL,
	"supplier_name" text,
	"current_stock_kg" numeric(10, 2) DEFAULT '0' NOT NULL,
	"reorder_threshold_kg" numeric(10, 2),
	"storage_location" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nvz_risk_assessments" ALTER COLUMN "assessed_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "slurry_spreading_records" ALTER COLUMN "field_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "slurry_spreading_records" ALTER COLUMN "manure_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "slurry_spreading_records" ALTER COLUMN "application_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD COLUMN "ticket_ref" varchar(20);--> statement-breakpoint
ALTER TABLE "support_tickets" ADD COLUMN "source" text DEFAULT 'app' NOT NULL;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD COLUMN "farm_id" integer;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD COLUMN "tenant_slug" varchar(100);--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "sector_fresh_produce" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "company_number" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "vat_number" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "bank_account_name" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "bank_account_number" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "bank_sort_code" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "payment_terms_days" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "invoice_footer_text" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "invoice_logo_path" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "sent_method" text;--> statement-breakpoint
ALTER TABLE "nvz_risk_assessments" ADD COLUMN "assessor_name" text;--> statement-breakpoint
ALTER TABLE "nvz_risk_assessments" ADD COLUMN "assessor_organisation" text;--> statement-breakpoint
ALTER TABLE "nvz_risk_assessments" ADD COLUMN "assessor_contact_id" integer;--> statement-breakpoint
ALTER TABLE "nvz_risk_assessments" ADD COLUMN "field_ids" text;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "crop_name" text;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "valid_from" date;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "valid_to" date;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "agronomist_name" text;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "agronomist_id" integer;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "basis_number" text;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "pest_monitoring_frequency" text DEFAULT 'weekly';--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "overall_strategy" text;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "rotation_and_cultural_controls" text;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD COLUMN "biological_controls" text;--> statement-breakpoint
ALTER TABLE "ipm_threshold_entries" ADD COLUMN "monitoring_frequency" text;--> statement-breakpoint
ALTER TABLE "ipm_threshold_entries" ADD COLUMN "chemical_threshold" text;--> statement-breakpoint
ALTER TABLE "ipm_threshold_entries" ADD COLUMN "resistance_management_group" text;--> statement-breakpoint
ALTER TABLE "ipm_threshold_entries" ADD COLUMN "action_taken" text DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD COLUMN "pending_review_by" text;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD COLUMN "pending_review_by_member_id" integer;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD COLUMN "pending_review_task_id" integer;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD COLUMN "review_notes" text;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD COLUMN "target_crop" text;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD COLUMN "growth_stage" text;--> statement-breakpoint
ALTER TABLE "spray_products" ADD COLUMN "lerap_category" text;--> statement-breakpoint
ALTER TABLE "spray_products" ADD COLUMN "lerap_standard_buffer_m" numeric(6, 1);--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "compliance_category" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "loler_last_exam_date" date;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "loler_next_exam_date" date;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "loler_examiner" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "loler_outcome" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "loler_report_ref" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "loler_notes" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "pssr_last_exam_date" date;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "pssr_next_exam_date" date;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "pssr_examiner" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "pssr_written_scheme_ref" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "pssr_outcome" text;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "pssr_notes" text;--> statement-breakpoint
ALTER TABLE "slurry_spreading_records" ADD COLUMN "field_id" integer;--> statement-breakpoint
ALTER TABLE "slurry_spreading_records" ADD COLUMN "incorporation_method" text;--> statement-breakpoint
ALTER TABLE "slurry_stores" ADD COLUMN "material" text;--> statement-breakpoint
ALTER TABLE "slurry_stores" ADD COLUMN "status" text DEFAULT 'Compliant';--> statement-breakpoint
ALTER TABLE "slurry_stores" ADD COLUMN "design_standard" text;--> statement-breakpoint
ALTER TABLE "slurry_stores" ADD COLUMN "required_storage_months" integer;--> statement-breakpoint
ALTER TABLE "stock_items" ADD COLUMN "unit_sell_price_pence" integer;--> statement-breakpoint
ALTER TABLE "stock_items" ADD COLUMN "shelf_id" integer;--> statement-breakpoint
ALTER TABLE "stock_items" ADD COLUMN "superseded_by_id" integer;--> statement-breakpoint
ALTER TABLE "stock_items" ADD COLUMN "supersession_notes" text;--> statement-breakpoint
ALTER TABLE "stock_items" ADD COLUMN "superseded_at" date;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "basis_number" text;--> statement-breakpoint
ALTER TABLE "biodiversity_net_gain" ADD COLUMN "assessor_type" text;--> statement-breakpoint
ALTER TABLE "biodiversity_net_gain" ADD COLUMN "assessor_organisation" text;--> statement-breakpoint
ALTER TABLE "biodiversity_net_gain" ADD COLUMN "achieved_condition" text;--> statement-breakpoint
ALTER TABLE "biodiversity_net_gain" ADD COLUMN "achieved_units" numeric(8, 3);--> statement-breakpoint
ALTER TABLE "biodiversity_net_gain" ADD COLUMN "compliance_status" text;--> statement-breakpoint
ALTER TABLE "biodiversity_net_gain" ADD COLUMN "remedial_action_notes" text;--> statement-breakpoint
ALTER TABLE "carbon_audits" ADD COLUMN "auditor_type" text;--> statement-breakpoint
ALTER TABLE "carbon_audits" ADD COLUMN "auditor_staff_id" integer;--> statement-breakpoint
ALTER TABLE "carbon_audits" ADD COLUMN "auditor_company" text;--> statement-breakpoint
ALTER TABLE "carbon_audits" ADD COLUMN "auditor_supplier_id" integer;--> statement-breakpoint
ALTER TABLE "carbon_audits" ADD COLUMN "verification_status" text;--> statement-breakpoint
ALTER TABLE "carbon_audits" ADD COLUMN "linked_po_reference" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "funding_type" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "funding_grant_name" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "funding_grant_reference" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "target_source_type" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "contractor_name" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "contractor_company" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "contractor_type" text;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "contractor_supplier_id" integer;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD COLUMN "linked_po_reference" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "report_type" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "contact_name_at_customer" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "deadline_date" date;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "submission_method" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "acknowledged_date" date;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "total_emissions_tonnes_co2e" numeric(10, 3);--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "sequestration_tonnes_co2e" numeric(10, 3);--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "net_position_tonnes_co2e" numeric(10, 3);--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "prepared_by" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "prepared_by_supplier_id" integer;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "prepared_by_po_reference" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "prepared_by_invoice_ref" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "certifying_body" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "certificate_reference" text;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD COLUMN "report_url" text;--> statement-breakpoint
ALTER TABLE "farm_contacts" ADD CONSTRAINT "farm_contacts_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipm_monitoring_logs" ADD CONSTRAINT "ipm_monitoring_logs_plan_id_ipm_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."ipm_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipm_monitoring_logs" ADD CONSTRAINT "ipm_monitoring_logs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipm_monitoring_logs" ADD CONSTRAINT "ipm_monitoring_logs_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_bays" ADD CONSTRAINT "workshop_bays_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_labour_entries" ADD CONSTRAINT "workshop_labour_entries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_labour_entries" ADD CONSTRAINT "workshop_labour_entries_job_id_workshop_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."workshop_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_rows" ADD CONSTRAINT "workshop_rows_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_settings" ADD CONSTRAINT "workshop_settings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_shelves" ADD CONSTRAINT "workshop_shelves_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_shelves" ADD CONSTRAINT "workshop_shelves_bay_id_workshop_bays_id_fk" FOREIGN KEY ("bay_id") REFERENCES "public"."workshop_bays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slurry_store_fill_events" ADD CONSTRAINT "slurry_store_fill_events_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slurry_store_fill_events" ADD CONSTRAINT "slurry_store_fill_events_store_id_slurry_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."slurry_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_certification" ADD CONSTRAINT "organic_arable_certification_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_field_conversion" ADD CONSTRAINT "organic_arable_field_conversion_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_field_conversion" ADD CONSTRAINT "organic_arable_field_conversion_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_harvest_declarations" ADD CONSTRAINT "organic_arable_harvest_declarations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_harvest_declarations" ADD CONSTRAINT "organic_arable_harvest_declarations_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_input_records" ADD CONSTRAINT "organic_arable_input_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_input_records" ADD CONSTRAINT "organic_arable_input_records_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_input_records" ADD CONSTRAINT "organic_arable_input_records_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_input_records" ADD CONSTRAINT "organic_arable_input_records_stock_delivery_id_stock_deliveries_id_fk" FOREIGN KEY ("stock_delivery_id") REFERENCES "public"."stock_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_seed_movements" ADD CONSTRAINT "organic_arable_seed_movements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_seed_movements" ADD CONSTRAINT "organic_arable_seed_movements_stock_id_organic_arable_seed_stock_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."organic_arable_seed_stock"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_seed_movements" ADD CONSTRAINT "organic_arable_seed_movements_seed_record_id_organic_arable_seed_records_id_fk" FOREIGN KEY ("seed_record_id") REFERENCES "public"."organic_arable_seed_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_seed_movements" ADD CONSTRAINT "organic_arable_seed_movements_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_seed_records" ADD CONSTRAINT "organic_arable_seed_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_arable_seed_stock" ADD CONSTRAINT "organic_arable_seed_stock_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;