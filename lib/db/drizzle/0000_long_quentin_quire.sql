CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"phone_number" varchar,
	"sms_opt_in" varchar DEFAULT 'none' NOT NULL,
	"sms_consent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "registration_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"farm_count" integer NOT NULL,
	"modules_interested" text[] NOT NULL,
	"message" text,
	"source" text,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text,
	"last_contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"conversation_history" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expo_push_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"farm_id" integer,
	"expo_push_token" text NOT NULL,
	"platform" text,
	"device_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expo_push_tokens_expo_push_token_unique" UNIQUE("expo_push_token")
);
--> statement-breakpoint
CREATE TABLE "farm_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"colour" text DEFAULT '#6b7280' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"linked_user_id" varchar,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"job_title" text,
	"department_id" integer,
	"employed_from" timestamp with time zone,
	"employed_to" timestamp with time zone,
	"farm_role" text DEFAULT 'operator' NOT NULL,
	"access_type" text DEFAULT 'none' NOT NULL,
	"invitation_status" text DEFAULT 'not_invited' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"ni_number" text,
	"payroll_number" text,
	"nok_name" text,
	"nok_relationship" text,
	"nok_phone" text,
	"nok_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_record_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"record_type" varchar(100) NOT NULL,
	"record_id" integer NOT NULL,
	"file_url" text NOT NULL,
	"file_key" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"notes" text,
	"uploaded_by_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "farm_task_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"assigned_to_member_id" integer NOT NULL,
	"assigned_by_user_id" text NOT NULL,
	"task_type" text DEFAULT 'custom' NOT NULL,
	"task_source_id" text,
	"title" text NOT NULL,
	"description" text,
	"due_date" text,
	"module" text,
	"href" text,
	"staff_name" text NOT NULL,
	"staff_phone" text,
	"assignment_note" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"sms_sent" boolean DEFAULT false NOT NULL,
	"sms_sent_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completion_note" text,
	"work_order_ref" text,
	"service_invoice_id" integer,
	"customer_id" integer,
	"estimated_hours" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"postcode" text,
	"cph_number" text,
	"grid_reference" text,
	"latitude" text,
	"longitude" text,
	"what3words" text,
	"emergency_contact_name" text,
	"emergency_contact_relationship" text,
	"emergency_contact_phone" text,
	"emergency_contact_email" text,
	"total_acreage" integer,
	"sector_arable" boolean DEFAULT false NOT NULL,
	"sector_beef" boolean DEFAULT false NOT NULL,
	"sector_dairy" boolean DEFAULT false NOT NULL,
	"sector_pigs" boolean DEFAULT false NOT NULL,
	"sector_poultry" boolean DEFAULT false NOT NULL,
	"sector_horticulture" boolean DEFAULT false NOT NULL,
	"sector_sheep" boolean DEFAULT false NOT NULL,
	"sector_eggs" boolean DEFAULT false NOT NULL,
	"sector_goats" boolean DEFAULT false NOT NULL,
	"sector_equine" boolean DEFAULT false NOT NULL,
	"sector_viticulture" boolean DEFAULT false NOT NULL,
	"red_tractor_id" text,
	"sbi_number" text,
	"total_hectares" numeric(10, 2),
	"is_nvz_designated" boolean DEFAULT false NOT NULL,
	"farm_manager" text,
	"holding_type" text,
	"assurance_body" text,
	"eaml2_email" text,
	"flock_mark" text,
	"herd_mark" text,
	"bcms_holding_number" text,
	"country" text DEFAULT 'england' NOT NULL,
	"scot_eid_number" text,
	"eid_cymru_number" text,
	"timesheet_reminder_time" text DEFAULT '18:00',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"invoice_number" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"billing_period_start" timestamp with time zone NOT NULL,
	"billing_period_end" timestamp with time zone NOT NULL,
	"invoice_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"billing_name" text NOT NULL,
	"billing_address" text,
	"billing_email" text NOT NULL,
	"line_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"net_amount_pence" integer NOT NULL,
	"vat_rate_pct" integer DEFAULT 20 NOT NULL,
	"vat_amount_pence" integer NOT NULL,
	"gross_amount_pence" integer NOT NULL,
	"notes" text,
	"payment_method" text,
	"payment_reference" text,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"monthly_price_pence" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_sector" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "modules_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"related_module" text,
	"related_id" integer,
	"dedupe_key" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"farm_id" integer,
	"can_read" boolean DEFAULT true NOT NULL,
	"can_write" boolean DEFAULT false NOT NULL,
	"can_delete" boolean DEFAULT false NOT NULL,
	"can_approve" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_tenant_id" integer,
	"target_farm_id" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_department_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_farm_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"farm_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"role_id" integer,
	"farm_role" text DEFAULT 'operator' NOT NULL,
	"access_type" text DEFAULT 'full' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"stripe_subscription_id" text,
	"stripe_subscription_item_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_assignment_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"previous_assignee_member_id" integer,
	"previous_assignee_name" text,
	"new_assignee_member_id" integer,
	"new_assignee_name" text,
	"reassignment_note" text,
	"reassigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reassigned_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"stripe_customer_id" text,
	"referral_code" text,
	"referred_by" text,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"farm_id" integer,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role_id" integer NOT NULL,
	"farm_role" text DEFAULT 'operator' NOT NULL,
	"access_type" text DEFAULT 'full' NOT NULL,
	"token" text NOT NULL,
	"invited_by" varchar NOT NULL,
	"staff_member_id" integer,
	"accepted_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"is_super_admin" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"receive_alerts" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"contact_name" text,
	"contact_phone" text,
	"type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"crop_id" integer NOT NULL,
	"title" text NOT NULL,
	"document_url" text NOT NULL,
	"document_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_financial_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"harvest_record_id" integer,
	"transaction_type" text NOT NULL,
	"amount_pence" integer NOT NULL,
	"currency" text DEFAULT 'GBP' NOT NULL,
	"description" text,
	"transaction_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_storage_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"harvest_record_id" integer,
	"storage_facility" text NOT NULL,
	"quantity_tonnes" numeric(10, 2),
	"date_in" timestamp with time zone NOT NULL,
	"date_out" timestamp with time zone,
	"temperature_c" numeric(5, 1),
	"moisture_percent" numeric(5, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_transport_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"harvest_record_id" integer NOT NULL,
	"vehicle_registration" text,
	"driver_name" text,
	"destination_id" integer,
	"weight_tonnes" numeric(10, 2),
	"departure_time" timestamp with time zone,
	"arrival_time" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"variety" text,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_boundaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_id" integer NOT NULL,
	"polygon_points" jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"captured_by" text
);
--> statement-breakpoint
CREATE TABLE "field_crop_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_id" integer NOT NULL,
	"crop_id" integer NOT NULL,
	"planting_date" timestamp with time zone,
	"expected_harvest_date" timestamp with time zone,
	"seed_rate" numeric(10, 2),
	"seed_unit" text,
	"season" text,
	"year" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_inspection_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"object_path" text NOT NULL,
	"file_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"mobile_id" text,
	"field_name" text NOT NULL,
	"inspection_date" timestamp with time zone NOT NULL,
	"crop_type" text,
	"growth_stage" text,
	"pest_disease_observations" text,
	"action_required" text DEFAULT 'none' NOT NULL,
	"recommended_action" text,
	"inspector" text,
	"notes" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" text,
	"resolution_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"field_name" text NOT NULL,
	"operation_date" timestamp with time zone NOT NULL,
	"operation_type" text NOT NULL,
	"vehicle_id" integer,
	"vehicle_description" text,
	"implement" text,
	"implement_id" integer,
	"working_depth_cm" integer,
	"passes" integer DEFAULT 1,
	"area_ha" numeric(10, 4),
	"quantity" numeric(10, 3),
	"quantity_unit" text,
	"operator" text,
	"machine_hours" numeric(8, 2),
	"labour_hours" numeric(8, 2),
	"machine_rate_pence" integer,
	"labour_rate_pence" integer,
	"is_contractor" boolean DEFAULT false NOT NULL,
	"contractor_name" text,
	"contractor_cost_pence" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_season_land_use" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer NOT NULL,
	"year" integer NOT NULL,
	"season" text,
	"land_use" text NOT NULL,
	"scheme_action_code" text,
	"scheme_reference" text,
	"area_hectares" numeric(10, 4),
	"start_date" text,
	"end_date" text,
	"management_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_tenure_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer NOT NULL,
	"title" text NOT NULL,
	"document_url" text NOT NULL,
	"document_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"field_reference" text,
	"area_hectares" numeric(10, 4),
	"farmable_area_hectares" numeric(10, 4),
	"soil_type" text,
	"current_use" text,
	"is_organic" boolean DEFAULT false NOT NULL,
	"is_nvz" boolean DEFAULT false NOT NULL,
	"nvz_land_type" text,
	"notes" text,
	"field_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenure_type" text,
	"landlord_supplier_id" integer,
	"tenancy_start_date" text,
	"tenancy_end_date" text,
	"annual_rent_pounds" numeric(10, 2),
	"rent_review_date" text,
	"tenure_notes" text
);
--> statement-breakpoint
CREATE TABLE "harvest_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_crop_assignment_id" integer NOT NULL,
	"harvest_date" timestamp with time zone NOT NULL,
	"start_time" text,
	"end_time" text,
	"equipment_id" integer,
	"operator_name" text,
	"yield_tonnes" numeric(10, 2),
	"area_harvested_ha" numeric(10, 4),
	"moisture_percent" numeric(5, 2),
	"quality_grade" text,
	"recorded_by" text,
	"notes" text,
	"is_organic_certified" boolean DEFAULT false NOT NULL,
	"organic_cert_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_storage_charges" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"charge_date" date NOT NULL,
	"charge_type" text DEFAULT 'storage' NOT NULL,
	"description" text,
	"quantity_tonnes" numeric(10, 2),
	"rate_used" numeric(8, 4),
	"amount_pence" integer NOT NULL,
	"statement_reference" text,
	"statement_date" date,
	"notes" text,
	"is_auto_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nvz_risk_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" timestamp with time zone NOT NULL,
	"assessed_by" text NOT NULL,
	"soil_type" text,
	"drainage_risk" text,
	"slope_risk" text,
	"distance_to_watercourse" text,
	"flood_risk" text,
	"organic_matter_level" text,
	"application_restrictions_identified" text,
	"mitigation_measures" text,
	"overall_risk_level" text,
	"next_review_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seed_drilling_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"drilling_date" timestamp with time zone NOT NULL,
	"crop_name" text NOT NULL,
	"variety" text,
	"seed_lot_number" text,
	"seed_rate" numeric(10, 2),
	"seed_rate_unit" text,
	"is_treated" boolean DEFAULT false NOT NULL,
	"treatment_product" text,
	"operator" text,
	"area_seeded_ha" numeric(10, 4),
	"soil_conditions" text,
	"weather_notes" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_location_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"movement_date" text NOT NULL,
	"movement_type" text NOT NULL,
	"direction" text NOT NULL,
	"commodity" text,
	"variety" text,
	"crop_year" text,
	"quantity_tonnes" numeric(10, 3) NOT NULL,
	"reference" text,
	"linked_record_type" text,
	"linked_record_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'grain_store' NOT NULL,
	"capacity_tonnes" numeric(10, 2),
	"location_description" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"notes" text,
	"storage_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"bin_type" text,
	"drying_system" text,
	"aeration_system" boolean DEFAULT false,
	"temperature_monitoring" boolean DEFAULT false,
	"sensor_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"merchant_name" text,
	"merchant_contact" text,
	"merchant_contract_ref" text,
	"storage_rate_ppt_week" numeric(8, 4),
	"intake_charge_ppt" numeric(8, 4),
	"outloading_charge_ppt" numeric(8, 4),
	"drying_charge_ppt" numeric(8, 4),
	"insurance_rate_ppt_week" numeric(8, 4)
);
--> statement-breakpoint
CREATE TABLE "ipm_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"plan_year" integer NOT NULL,
	"review_date" date,
	"prepared_by" text,
	"approved_by" text,
	"approved_date" date,
	"crop_rotation_notes" text,
	"monitoring_frequency" text,
	"monitoring_methods" text,
	"non_chemical_methods" text,
	"resistance_management_notes" text,
	"economic_thresholds" text,
	"spray_decision_rationale" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ipm_threshold_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"pest_or_disease" text NOT NULL,
	"target_crop" text,
	"monitoring_method" text,
	"action_threshold" text,
	"non_chemical_option" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lerap_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"product_id" integer,
	"assessment_date" date NOT NULL,
	"assessor_name" text,
	"step" text DEFAULT '1' NOT NULL,
	"watercourse_description" text,
	"watercourse_type" text,
	"standard_buffer_m" numeric(6, 1),
	"lerap_buffer_m" numeric(6, 1),
	"outcome" text,
	"reduction_justification" text,
	"crop_type" text,
	"soil_type" text,
	"valid_until" date,
	"document_ref" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nmp_field_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"field_id" integer NOT NULL,
	"crop_type" text,
	"nitrogen_kg_ha" numeric(10, 2),
	"phosphorus_kg_ha" numeric(10, 2),
	"potassium_kg_ha" numeric(10, 2),
	"organic_manure_type" text,
	"organic_manure_rate" numeric(10, 2),
	"application_method" text,
	"timing_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrient_management_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"plan_year" integer NOT NULL,
	"prepared_by" text,
	"approved_by" text,
	"approved_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nvz_fertiliser_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer NOT NULL,
	"application_date" timestamp with time zone NOT NULL,
	"product_name" text NOT NULL,
	"product_type" text NOT NULL,
	"nitrogen_kg_ha" numeric(10, 2) NOT NULL,
	"area_applied_ha" numeric(10, 4) NOT NULL,
	"total_nitrogen_kg" numeric(10, 2) NOT NULL,
	"application_method" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spray_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"application_date" timestamp with time zone NOT NULL,
	"application_rate" numeric(10, 4),
	"rate_unit" text,
	"area_sprayed_ha" numeric(10, 4),
	"water_volume_litres" numeric(10, 2),
	"wind_speed_kmh" numeric(5, 1),
	"wind_direction" text,
	"temperature_c" numeric(5, 1),
	"operator_name" text,
	"operator_member_id" integer,
	"certificate_number" text,
	"equipment_used" text,
	"equipment_id" integer,
	"supplier_id" integer,
	"reason_for_application" text,
	"batch_number" text,
	"lot_number" text,
	"stock_delivery_id" integer,
	"buffer_zone_metres" numeric(6, 1),
	"water_source_nearby" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spray_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"active_ingredient" text,
	"mappa_number" text,
	"manufacturer" text,
	"category" text,
	"harvest_interval" integer,
	"max_applications_per_season" integer,
	"storage_requirements" text,
	"coshh_record_id" integer,
	"stock_item_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soil_sensor_probes" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"name" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"sensor_type" text DEFAULT 'moisture' NOT NULL,
	"depths_cm" text,
	"latitude" text,
	"longitude" text,
	"install_date" timestamp with time zone,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soil_sensor_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"probe_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"reading_at" timestamp with time zone NOT NULL,
	"depth_cm" integer,
	"moisture_percent" numeric(6, 2),
	"temperature_celsius" numeric(6, 2),
	"ec_us_per_cm" numeric(8, 2),
	"entry_method" text DEFAULT 'manual' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soil_test_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer NOT NULL,
	"sample_date" timestamp with time zone NOT NULL,
	"sample_reference" text,
	"status" text DEFAULT 'sampled' NOT NULL,
	"laboratory" text,
	"lab_supplier_id" integer,
	"sent_to_lab_date" timestamp with time zone,
	"results_received_date" timestamp with time zone,
	"sample_depth_cm" integer,
	"sampled_by" text,
	"sampler_type" text,
	"sampler_organisation" text,
	"notes" text,
	"latitude" text,
	"longitude" text,
	"location_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soil_test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"soil_test_id" integer NOT NULL,
	"nutrient" text NOT NULL,
	"value" numeric(10, 4),
	"unit" text,
	"index" text,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "equipment_calibration_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"calibration_type" text NOT NULL,
	"calibration_date" timestamp with time zone NOT NULL,
	"next_due_date" timestamp with time zone,
	"calibrated_by" text,
	"certificate_reference" text,
	"result_pass" boolean,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_defect_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"defect_ref" text,
	"equipment_id" integer,
	"equipment_name" text NOT NULL,
	"reported_date" timestamp with time zone NOT NULL,
	"reported_by" text,
	"defect_description" text NOT NULL,
	"severity" text DEFAULT 'minor' NOT NULL,
	"status" text DEFAULT 'reported' NOT NULL,
	"action_taken" text,
	"resolved_date" timestamp with time zone,
	"resolved_by" text,
	"notes" text,
	"latitude" text,
	"longitude" text,
	"mobile_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_maintenance_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"maintenance_type" text NOT NULL,
	"description" text NOT NULL,
	"performed_by" text,
	"performed_date" timestamp with time zone NOT NULL,
	"next_due_date" timestamp with time zone,
	"cost_pence" integer,
	"parts_used" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_offboarding_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"offboarding_date" timestamp with time zone NOT NULL,
	"reason" text NOT NULL,
	"method" text,
	"sale_price_pence" integer,
	"buyer_details" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"asset_number" text,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"make" text,
	"model" text,
	"serial_number" text,
	"registration_number" text,
	"year_of_manufacture" integer,
	"purchase_date" timestamp with time zone,
	"purchase_price_pence" integer,
	"current_value_pence" integer,
	"current_hours" integer,
	"odometer_km" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"location" text,
	"notes" text,
	"photos" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"disposal_method" text,
	"disposal_date" timestamp with time zone,
	"disposal_price_pence" integer,
	"disposal_buyer_or_contractor" text,
	"waste_transfer_note_ref" text,
	"disposal_notes" text,
	"puwer_last_assessment_date" date,
	"puwer_next_review_date" date,
	"puwer_assessor" text,
	"puwer_outcome" text,
	"puwer_notes" text,
	"insurer_name" text,
	"insurance_policy_ref" text,
	"insurance_renewal_date" date,
	"insurance_premium_pence" integer,
	"depreciation_method" text,
	"depreciation_rate_pct" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_quality_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"test_date" date NOT NULL,
	"store_bin_ref" text,
	"commodity" text NOT NULL,
	"lot_ref" text,
	"sample_type" text DEFAULT 'composite' NOT NULL,
	"test_category" text NOT NULL,
	"lab_name" text,
	"lab_sample_ref" text,
	"sampled_by" text,
	"don_nivalenol_ug_kg" numeric(8, 2),
	"zearalenone_ug_kg" numeric(8, 2),
	"ochratoxin_a_ug_kg" numeric(8, 2),
	"fumonisins_ug_kg" numeric(8, 2),
	"aflatoxins_ug_kg" numeric(8, 2),
	"pesticide_residue_result" text,
	"pesticide_residue_pass" boolean,
	"moisture_percent" numeric(5, 2),
	"specific_weight_kg_hl" numeric(5, 2),
	"screening_percent" numeric(5, 2),
	"protein_percent" numeric(5, 2),
	"hagberg_falling_number" integer,
	"overall_result" text DEFAULT 'pending' NOT NULL,
	"overall_pass" boolean,
	"action_required" text,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_storage_bins" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"bin_name" text NOT NULL,
	"bin_type" text NOT NULL,
	"capacity_tonnes" numeric(8, 1),
	"drying_system" text,
	"aeration_system" boolean DEFAULT false,
	"temperature_monitoring" boolean DEFAULT false,
	"sensor_count" integer,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_temperature_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"location_id" integer,
	"bin_id" integer,
	"log_date" date NOT NULL,
	"log_time" text,
	"temperature_c" numeric(5, 1) NOT NULL,
	"sensor_position" text,
	"moisture_percent" numeric(5, 2),
	"aeration_running" boolean DEFAULT false,
	"drying_running" boolean DEFAULT false,
	"recorded_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_fire_extinguisher_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"extinguisher_id" integer NOT NULL,
	"service_date" timestamp with time zone NOT NULL,
	"service_type" text DEFAULT 'annual_check' NOT NULL,
	"engineer_name" text,
	"engineer_company" text,
	"certificate_number" text,
	"result" text DEFAULT 'pass' NOT NULL,
	"next_service_due" timestamp with time zone,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_fire_extinguishers" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"location" text NOT NULL,
	"building_id" integer,
	"sub_location" text,
	"type" text NOT NULL,
	"capacity_kg" text,
	"serial_number" text,
	"last_service_date" timestamp with time zone,
	"engineer_name" text,
	"engineer_company" text,
	"next_service_due" timestamp with time zone,
	"notes" text,
	"status" text DEFAULT 'active' NOT NULL,
	"disposal_date" timestamp with time zone,
	"disposal_reason" text,
	"disposal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_goods_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"return_ref" text NOT NULL,
	"supplier_rtn_number" text,
	"stock_item_id" integer,
	"stock_item_name" text,
	"supplier_id" integer,
	"quantity" numeric NOT NULL,
	"unit" text,
	"unit_cost_pence" integer,
	"return_reason_code" text DEFAULT 'faulty' NOT NULL,
	"return_reason" text,
	"status" text DEFAULT 'raised' NOT NULL,
	"raised_by" text,
	"raised_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dispatched_at" timestamp with time zone,
	"credit_amount_pence" integer,
	"credit_received_at" timestamp with time zone,
	"original_delivery_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_job_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text,
	"file_size_bytes" integer,
	"uploaded_by" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"equipment_id" integer,
	"job_number" text,
	"job_type" text DEFAULT 'repair' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"reported_by" text,
	"assigned_to" text,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"estimated_completion_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"labour_hours" integer,
	"labour_cost_pence" integer,
	"parts_cost_pence" integer,
	"parts_used" text,
	"root_cause" text,
	"notes" text,
	"customer_id" integer,
	"service_invoice_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_part_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_item_id" integer NOT NULL,
	"filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text,
	"file_size_bytes" integer,
	"uploaded_by" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_pat_equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"asset_number" text,
	"item_name" text NOT NULL,
	"description" text,
	"make" text,
	"model" text,
	"serial_number" text,
	"building_id" integer,
	"sub_location" text,
	"location" text,
	"last_test_date" timestamp with time zone,
	"tester_name" text,
	"tester_company" text,
	"next_test_due" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"disposal_date" timestamp with time zone,
	"disposal_reason" text,
	"disposal_notes" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_pat_test_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"equipment_id" integer NOT NULL,
	"test_date" timestamp with time zone NOT NULL,
	"tester_name" text,
	"tester_company" text,
	"certificate_number" text,
	"result" text DEFAULT 'pass' NOT NULL,
	"next_due_date" timestamp with time zone,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_pat_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"item_name" text NOT NULL,
	"equipment_id" integer,
	"location" text,
	"building_id" integer,
	"sub_location" text,
	"test_date" timestamp with time zone,
	"tester_name" text,
	"tester_company" text,
	"certificate_number" text,
	"result" text DEFAULT 'pass' NOT NULL,
	"next_due_date" timestamp with time zone,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_stocktake_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"stock_item_id" integer,
	"part_name" text NOT NULL,
	"part_number" text,
	"unit" text,
	"location" text,
	"expected_qty" numeric(10, 2) NOT NULL,
	"counted_qty" numeric(10, 2),
	"variance" numeric(10, 2),
	"unit_cost_pence" integer,
	"variance_value" numeric(12, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_stocktake_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"stocktake_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	"item_count" integer DEFAULT 0,
	"counted_count" integer DEFAULT 0,
	"total_variance_value" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_reproduction_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"animal_id" integer,
	"ear_tag" text NOT NULL,
	"service_date" date NOT NULL,
	"service_type" text NOT NULL,
	"sire_register_id" integer,
	"straw_inventory_id" integer,
	"bull_or_sire_name" text,
	"sire_stu_number" text,
	"sire_breed" text,
	"straw_batch_number" text,
	"ai_technician_name" text,
	"bulling_observed_date" date,
	"expected_calving_date" date,
	"pregnancy_diagnosis_date" date,
	"pregnancy_result" text,
	"veterinarian_name" text,
	"return_to_service_date" date,
	"actual_calving_date" date,
	"calving_outcome" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animal_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"animal_id" integer NOT NULL,
	"title" text NOT NULL,
	"document_type" text DEFAULT 'other' NOT NULL,
	"document_url" text NOT NULL,
	"document_name" text,
	"notes" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bcms_farm_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"ctws_username" text,
	"ctws_password_encrypted" text,
	"holding_number" text,
	"is_configured" boolean DEFAULT false NOT NULL,
	"sandbox_mode" boolean DEFAULT true NOT NULL,
	"last_tested_at" timestamp with time zone,
	"test_status" text,
	"test_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bcms_farm_credentials_farm_id_unique" UNIQUE("farm_id")
);
--> statement-breakpoint
CREATE TABLE "bcms_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"movement_id" integer,
	"submission_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sandbox_mode" boolean DEFAULT true NOT NULL,
	"submitted_at" timestamp with time zone,
	"acknowledged_at" timestamp with time zone,
	"bcms_reference" text,
	"error_message" text,
	"xml_payload" text,
	"response_payload" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"submitted_by_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bvd_testing_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"test_date" date NOT NULL,
	"test_type" text NOT NULL,
	"lab_name" text,
	"lab_ref" text,
	"animals_tested_count" integer,
	"pi_animals_found" integer DEFAULT 0,
	"result" text NOT NULL,
	"accreditation_status" text,
	"monitoring_scheme" text,
	"scheme_membership_number" text,
	"vet_name" text,
	"actions_taken" text,
	"next_test_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "casualty_slaughter_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"event_date" date NOT NULL,
	"animal_ear_tag" text,
	"species" text NOT NULL,
	"breed" text,
	"age_or_description" text,
	"reason_for_slaughter" text NOT NULL,
	"method" text NOT NULL,
	"performed_by" text NOT NULL,
	"performed_by_member_id" integer,
	"wask_watok_cert_ref" text,
	"witness_name" text,
	"veterinary_involved" boolean DEFAULT false,
	"vet_name" text,
	"carcase_disposal_method" text,
	"carcase_disposal_contractor_id" integer,
	"carcase_collection_date" date,
	"carcase_disposal_ref" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_abr_test_kit_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"supplier" text,
	"lot_number" text,
	"batch_number" text,
	"expiry_date" date,
	"quantity_purchased" integer DEFAULT 0 NOT NULL,
	"quantity_used" integer DEFAULT 0 NOT NULL,
	"quantity_remaining" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_bcs_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"animal_id" integer,
	"ear_tag_number" text,
	"assessment_date" timestamp with time zone NOT NULL,
	"life_stage" text,
	"bcs_score" numeric(3, 1),
	"assessed_by" text,
	"target_score" numeric(3, 1),
	"action_required" boolean DEFAULT false NOT NULL,
	"action_taken" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_bulk_tank_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tank_id" integer,
	"record_date" timestamp with time zone NOT NULL,
	"record_type" text NOT NULL,
	"tank_temperature_celsius" numeric(5, 2),
	"tank_cleaned" boolean,
	"cleaning_product_used" text,
	"cleaning_product_batch" text,
	"antibiotic_residue_test_ref" text,
	"antibiotic_residue_result" text,
	"tanker_driver_name" text,
	"collection_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_bulk_tanks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"capacity_litres" numeric(10, 0),
	"notes" text,
	"latitude_deg" double precision,
	"longitude_deg" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_calving_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"cow_animal_id" integer,
	"cow_ear_tag" text,
	"calving_date" timestamp with time zone NOT NULL,
	"calving_ease_score" integer,
	"number_of_calves" integer DEFAULT 1 NOT NULL,
	"calf_outcome" text,
	"calf_sex" text,
	"calf_ear_tag" text,
	"sire_breed" text,
	"calf_breed" text,
	"calf_birth_weight_kg" numeric(6, 2),
	"calf_animal_id" integer,
	"calf_outcome_2" text,
	"calf_sex_2" text,
	"calf_ear_tag_2" text,
	"calf_birth_weight_kg_2" numeric(6, 2),
	"calf_animal_id_2" integer,
	"colostrum_given_within_2_hours" boolean,
	"colostrum_given_within_6_hours" boolean,
	"colostrum_volume_first_feed_litres" numeric(5, 2),
	"colostrum_quality_brix" numeric(5, 2),
	"colostrum_source" text,
	"cow_complications" text,
	"assistance_required" boolean DEFAULT false NOT NULL,
	"assistance_type" text,
	"vet_attended" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"conception_method" text,
	"sire_register_id" integer,
	"straw_inventory_id" integer,
	"calf_disposition" text,
	"bcms_passport_applied" boolean DEFAULT false NOT NULL,
	"perinatal_disposal_contractor_id" integer,
	"perinatal_collection_date" date,
	"perinatal_collection_ref" text,
	"perinatal_disposal_method" text,
	"perinatal_disposal_notes" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_dct_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"animal_id" integer,
	"cow_ear_tag" text,
	"dry_off_date" timestamp with time zone NOT NULL,
	"protocol" text NOT NULL,
	"antibiotic_tube_product" text,
	"antibiotic_tube_batch" text,
	"antibiotic_tube_withdrawal_milk_days" integer,
	"antibiotic_tube_withdrawal_meat_days" integer,
	"teat_sealant_product" text,
	"teat_sealant_batch" text,
	"treatment_justification" text,
	"scc_at_dry_off" integer,
	"mastitis_episodes_12_months" integer,
	"administered_by" text,
	"vet_authorisation" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"expected_calving_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_mastitis_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"animal_id" integer,
	"ear_tag_number" text,
	"onset_date" timestamp with time zone NOT NULL,
	"quarters_affected" text,
	"clinical_grade" text,
	"bacterial_culture_result" text,
	"treatment_product" text,
	"treatment_start_date" timestamp with time zone,
	"treatment_duration_days" integer,
	"withdrawal_end_date" timestamp with time zone,
	"outcome" text,
	"outcome_date" timestamp with time zone,
	"vet_consulted" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"scc_at_onset" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_milk_collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tank_id" integer,
	"collection_date" timestamp with time zone NOT NULL,
	"volume_collected_litres" numeric(10, 2),
	"milk_buyer" text,
	"tanker_registration" text,
	"tanker_driver_name" text,
	"collection_ref" text,
	"statement_ref" text,
	"abt_result_before_collection" text,
	"pence_per_litre" numeric(8, 4),
	"gross_value_pence" integer,
	"quality_bonus_pence" integer,
	"quality_penalty_pence" integer,
	"transport_deduction_pence" integer,
	"net_payment_pence" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_milk_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"record_date" timestamp with time zone NOT NULL,
	"record_type" text DEFAULT 'bulk-tank' NOT NULL,
	"session_type" text,
	"milk_buyer" text,
	"yield_litres" numeric(10, 2),
	"milk_temperature_celsius" numeric(5, 2),
	"temp_tested_by" text,
	"antibiotic_residue_test_result" text,
	"abr_tested_by" text,
	"abr_test_kit_lot" text,
	"abr_test_kit_batch" text,
	"buyer_lab_results_status" text DEFAULT 'not-applicable',
	"buyer_lab_results_date" date,
	"buyer_lab_ref" text,
	"buyer_scc_thousands" integer,
	"buyer_tbc_cfu_ml" integer,
	"buyer_fat_percent" numeric(5, 2),
	"buyer_protein_percent" numeric(5, 2),
	"buyer_lactose_percent" numeric(5, 2),
	"scc_thousands" integer,
	"tbc_cfu_ml" integer,
	"fat_percent" numeric(5, 2),
	"protein_percent" numeric(5, 2),
	"lactose_percent" numeric(5, 2),
	"collector_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dairy_mobility_scorings" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"assessment_date" timestamp with time zone NOT NULL,
	"assessed_by" text,
	"total_cows_scored" integer NOT NULL,
	"score_0_count" integer DEFAULT 0 NOT NULL,
	"score_1_count" integer DEFAULT 0 NOT NULL,
	"score_2_count" integer DEFAULT 0 NOT NULL,
	"score_3_count" integer DEFAULT 0 NOT NULL,
	"lameness_prevalence_percent" numeric(5, 2),
	"action_taken" text,
	"next_assessment_due" timestamp with time zone,
	"notes" text,
	"score3_animal_tags" text,
	"score2_animal_tags" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fallen_stock_contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"approval_number" text NOT NULL,
	"operator_type" text DEFAULT 'nfas-collector' NOT NULL,
	"contact_name" text,
	"phone" text,
	"email" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "herd_flock_register" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"breed" text,
	"herd_number" text,
	"registration_document_url" text,
	"registration_document_name" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_organic_herd" boolean DEFAULT false NOT NULL,
	"organic_conversion_id" integer,
	"organic_cert_body" text,
	"organic_cert_number" text,
	"organic_conversion_start_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "herd_health_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"event_date" timestamp with time zone NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"vet_name" text,
	"action_taken" text,
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"follow_up_date" timestamp with time zone,
	"follow_up_completed" boolean DEFAULT false NOT NULL,
	"recorded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "johnes_monitoring_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"test_date" date NOT NULL,
	"test_type" text NOT NULL,
	"lab_name" text,
	"lab_ref" text,
	"animals_tested_count" integer,
	"risk_level" text,
	"bulk_milk_od" numeric(6, 3),
	"positive_animals_count" integer DEFAULT 0,
	"jmm_enrolled" boolean DEFAULT false,
	"scheme" text,
	"vet_sign_off" boolean DEFAULT false,
	"vet_name" text,
	"actions_taken" text,
	"next_test_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lambing_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"ewe_animal_id" integer,
	"ewe_ear_tag" text,
	"lambing_date" date NOT NULL,
	"lambing_ease_score" integer,
	"expected_litter_size" integer,
	"number_of_lambs" integer DEFAULT 1 NOT NULL,
	"lamb_outcome_1" text,
	"lamb_sex_1" text,
	"lamb_ear_tag_1" text,
	"lamb_eid_number_1" text,
	"lamb_birth_weight_kg_1" numeric(5, 2),
	"lamb_animal_id_1" integer,
	"lamb_outcome_2" text,
	"lamb_sex_2" text,
	"lamb_ear_tag_2" text,
	"lamb_eid_number_2" text,
	"lamb_birth_weight_kg_2" numeric(5, 2),
	"lamb_animal_id_2" integer,
	"lamb_outcome_3" text,
	"lamb_sex_3" text,
	"lamb_ear_tag_3" text,
	"lamb_eid_number_3" text,
	"lamb_birth_weight_kg_3" numeric(5, 2),
	"lamb_animal_id_3" integer,
	"lamb_outcome_4" text,
	"lamb_sex_4" text,
	"lamb_ear_tag_4" text,
	"lamb_eid_number_4" text,
	"lamb_birth_weight_kg_4" numeric(5, 2),
	"lamb_animal_id_4" integer,
	"assistance_required" boolean DEFAULT false NOT NULL,
	"assistance_type" text,
	"vet_attended" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"colostrum_given_within_2_hours" boolean,
	"colostrum_source" text,
	"fostering_required" boolean DEFAULT false NOT NULL,
	"fostering_details" text,
	"expected_lambing_date" date,
	"ram_ear_tag" text,
	"ram_breed" text,
	"sire_register_id" integer,
	"conception_method" text,
	"ewe_complications" text,
	"notes" text,
	"perinatal_disposal_contractor_id" integer,
	"perinatal_collection_date" date,
	"perinatal_collection_ref" text,
	"perinatal_disposal_method" text,
	"perinatal_disposal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lis_farm_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"lis_username" text,
	"lis_password_encrypted" text,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"is_configured" boolean DEFAULT false NOT NULL,
	"sandbox_mode" boolean DEFAULT true NOT NULL,
	"last_tested_at" timestamp with time zone,
	"test_status" text,
	"test_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lis_farm_tokens_farm_id_unique" UNIQUE("farm_id")
);
--> statement-breakpoint
CREATE TABLE "lis_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"movement_id" integer,
	"submission_type" text NOT NULL,
	"species" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"sandbox_mode" boolean DEFAULT true NOT NULL,
	"lis_reference" text,
	"request_payload" text,
	"response_payload" text,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"submitted_by_user_id" integer,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_animals" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"tag_number" text,
	"ear_tag_number" text,
	"eid_number" text,
	"species" text NOT NULL,
	"breed" text,
	"sex" text,
	"date_of_birth" timestamp with time zone,
	"dam_id" integer,
	"sire_id" integer,
	"acquisition_date" timestamp with time zone,
	"acquisition_source" text,
	"animal_code" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_daily_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"check_ref" text,
	"herd_name" text,
	"check_date" timestamp with time zone NOT NULL,
	"checked_by" text,
	"overall_condition" text,
	"sick_count" integer DEFAULT 0,
	"mortality_count" integer DEFAULT 0,
	"feed_ok" boolean DEFAULT true,
	"water_ok" boolean DEFAULT true,
	"shelter_ok" boolean DEFAULT true,
	"action_taken" text,
	"status" text DEFAULT 'open' NOT NULL,
	"notes" text,
	"latitude" text,
	"longitude" text,
	"mobile_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_feed_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"feed_type" text NOT NULL,
	"supplier" text,
	"batch_number" text,
	"quantity_kg" numeric(10, 2),
	"feed_date" timestamp with time zone NOT NULL,
	"notes" text,
	"feed_stock_item_id" integer,
	"delivery_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_medicine_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"animal_id" integer,
	"herd_id" integer,
	"medicine_ref" text,
	"medicine_name" text NOT NULL,
	"batch_number" text,
	"dosage" text,
	"administration_route" text,
	"administered_by" text,
	"administered_date" timestamp with time zone NOT NULL,
	"withdrawal_period_days" integer,
	"withdrawal_end_date" timestamp with time zone,
	"reason" text,
	"vet_name" text,
	"treatment_scope" text,
	"treated_animal_tags" text,
	"treated_animal_count" integer,
	"notes" text,
	"source" text DEFAULT 'manual',
	"vet_visit_medicine_id" integer,
	"disease_incident_id" integer,
	"prescription_id" integer,
	"is_organic_treatment" boolean DEFAULT false NOT NULL,
	"doubled_withdrawal_days" integer,
	"organic_withdrawal_end_date" timestamp with time zone,
	"certifier_notified" boolean DEFAULT false NOT NULL,
	"certifier_notified_date" timestamp with time zone,
	"max_treatments_reached" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_mortality" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"animal_id" integer,
	"contractor_id" integer,
	"tag_number" text,
	"species" text NOT NULL,
	"breed" text,
	"date_of_death" timestamp with time zone NOT NULL,
	"cause_of_death" text NOT NULL,
	"disposal_method" text NOT NULL,
	"disposal_operator" text,
	"disposal_ref" text,
	"veterinary_attended" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"post_mortem_carried_out" boolean DEFAULT false NOT NULL,
	"post_mortem_findings" text,
	"bcms_notified" boolean DEFAULT false NOT NULL,
	"bcms_notification_ref" text,
	"notes" text,
	"invoice_status" text DEFAULT 'none' NOT NULL,
	"invoice_ref" text,
	"invoice_amount" text,
	"invoice_paid_date" text,
	"status" text DEFAULT 'reported' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_movement_animals" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"movement_id" integer NOT NULL,
	"animal_id" integer,
	"tag_number" text,
	"eid_number" text,
	"species" text,
	"breed" text,
	"sex" text,
	"date_of_birth" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"animal_id" integer,
	"herd_id" integer,
	"movement_type" text NOT NULL,
	"movement_date" timestamp with time zone NOT NULL,
	"from_location" text,
	"to_location" text,
	"number_of_animals" integer DEFAULT 1,
	"licence_number" text,
	"bcms_submission_ref" text,
	"legal_notification_submitted" boolean DEFAULT false NOT NULL,
	"legal_notification_date" timestamp with time zone,
	"species" text,
	"ear_tag_numbers" text,
	"transporter_details" text,
	"reason" text,
	"notes" text,
	"haulage_record_id" integer,
	"vehicle_registration" text,
	"driver_name" text,
	"haulier_company" text,
	"operator_licence_no" text,
	"fci_completed" boolean,
	"fci_withdrawals_clear" boolean,
	"fci_completed_by" text,
	"all_animals_tagged" boolean,
	"vehicle_clean" boolean,
	"atc_required" boolean,
	"atc_number" text,
	"journey_time_hours" numeric(5, 1),
	"driver_competency_cert_no" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"welfare_check_complete" boolean,
	"movement_document_url" text,
	"checklist_completed_by" text,
	"checklist_completed_at" timestamp with time zone,
	"is_organic_movement" boolean DEFAULT false NOT NULL,
	"organic_cert_ref" text,
	"organic_withdrawals_clear" boolean,
	"organic_status_confirmed_by" text,
	"ata_number" text,
	"ata_expiry_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"invoice_date" timestamp with time zone NOT NULL,
	"arrival_date" timestamp with time zone,
	"supplier_name" text NOT NULL,
	"supplier_cph" text,
	"market_name" text,
	"invoice_ref" text,
	"species" text NOT NULL,
	"number_of_head" integer NOT NULL,
	"price_per_head_pence" integer,
	"total_amount_pence" integer NOT NULL,
	"vat_amount_pence" integer,
	"payment_terms_days" integer DEFAULT 0 NOT NULL,
	"payment_due_date" timestamp with time zone,
	"paid_date" timestamp with time zone,
	"payment_status" text DEFAULT 'outstanding' NOT NULL,
	"payment_method" text,
	"payment_reference" text,
	"herd_id" integer,
	"movement_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_water_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"water_source" text NOT NULL,
	"source_description" text,
	"test_date" timestamp with time zone,
	"test_result" text,
	"test_pass" boolean,
	"lab_supplier_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sire_register" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"tag_number" text,
	"passport_number" text,
	"date_of_birth" date,
	"ownership_type" text DEFAULT 'owned' NOT NULL,
	"supplier_name" text,
	"supplier_contact" text,
	"hire_start_date" date,
	"hire_end_date" date,
	"return_date" date,
	"bvd_status" text,
	"fertility_test_date" date,
	"fertility_test_result" text,
	"scrapie_genotype" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "straw_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"sire_register_id" integer,
	"sire_name" text NOT NULL,
	"sire_breed" text,
	"sire_species" text DEFAULT 'Cattle' NOT NULL,
	"supplier_name" text,
	"batch_number" text NOT NULL,
	"straws_received" integer DEFAULT 0 NOT NULL,
	"storage_location" text,
	"delivery_date" date,
	"unit_cost_pence" integer,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vet_health_plan_action_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"completed_date" timestamp with time zone NOT NULL,
	"completed_by" text,
	"notes" text,
	"attachment_url" text,
	"attachment_name" text,
	"verified_by" text,
	"verified_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vet_health_plan_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"frequency" text DEFAULT 'annual' NOT NULL,
	"next_due_date" timestamp with time zone,
	"assigned_to" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vet_health_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"plan_year" integer NOT NULL,
	"vet_name" text NOT NULL,
	"practice_name" text,
	"practice_phone" text,
	"practice_address" text,
	"plan_date" timestamp with time zone NOT NULL,
	"review_date" timestamp with time zone,
	"health_priorities" text,
	"vaccination_protocol" text,
	"biosecurity_measures" text,
	"worming_protocol" text,
	"fluke_treatment" text,
	"mastitis_prevention" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vet_prescription_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"prescription_date" date NOT NULL,
	"vet_name" text NOT NULL,
	"vrc_practice_name" text,
	"rcvs_practice_number" text,
	"product_name" text NOT NULL,
	"active_ingredient" text,
	"vmt_number" text,
	"dosage_and_frequency" text NOT NULL,
	"route_of_administration" text NOT NULL,
	"quantity_authorised" text NOT NULL,
	"validity_days" integer,
	"expiry_date" date,
	"target_species" text NOT NULL,
	"indication_or_diagnosis" text NOT NULL,
	"cascade_justification" text,
	"is_cascade" boolean DEFAULT false,
	"withdrawal_period_meat_days" integer,
	"withdrawal_period_milk_days" integer,
	"withdrawal_period_eggs_days" integer,
	"dispensed_quantity" text,
	"dispensed_date" date,
	"treatment_scope" text,
	"treatment_date" date,
	"administered_by" text,
	"herd_id" integer,
	"animal_id" integer,
	"treated_animal_tags" text,
	"treated_animal_count" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biosecurity_cleaning_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"area" text NOT NULL,
	"cleaning_type" text NOT NULL,
	"interval_days" integer NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biosecurity_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"restricted_areas" text,
	"visitor_procedures" text,
	"vehicle_entry_procedures" text,
	"cleaning_protocols" text,
	"pest_management_approach" text,
	"disease_response_plan" text,
	"waste_management_procedures" text,
	"water_source_protection" text,
	"staff_responsibilities" text,
	"farm_vet_name" text,
	"farm_vet_phone" text,
	"farm_vet_email" text,
	"apha_area_office" text,
	"apha_phone" text,
	"footwear_hygiene_procedures" text,
	"new_animal_isolation_procedures" text,
	"feed_security_procedures" text,
	"disease_suspicion_procedures" text,
	"plan_author" text,
	"last_reviewed_date" date,
	"next_review_date" date,
	"approved_by" text,
	"version_number" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleaning_disinfection_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"location_id" integer,
	"area" text NOT NULL,
	"cleaning_type" text NOT NULL,
	"products_used" text,
	"dilution_rate" text,
	"contact_time" text,
	"cleaned_by" text,
	"cleaned_date" timestamp with time zone NOT NULL,
	"next_due_date" timestamp with time zone,
	"verified_by" text,
	"notes" text,
	"performed_by_contractor" boolean DEFAULT false NOT NULL,
	"contractor_name" text,
	"contractor_own_supplies" boolean DEFAULT false NOT NULL,
	"quantity_used" text,
	"stock_item_id" integer,
	"cost_pence" integer,
	"invoice_ref" text,
	"rams_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleaning_stock_consumptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"cleaning_record_id" integer NOT NULL,
	"stock_item_id" integer NOT NULL,
	"product_name" text,
	"quantity_used" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pest_control_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"object_path" text NOT NULL,
	"file_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pest_control_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"pest_type" text NOT NULL,
	"location" text,
	"treatment_method" text,
	"product_used" text,
	"treatment_date" timestamp with time zone NOT NULL,
	"treated_by" text,
	"follow_up_date" timestamp with time zone,
	"outcome" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_contractor_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"visitor_name" text NOT NULL,
	"company" text,
	"purpose" text NOT NULL,
	"vehicle_registration" text,
	"arrival_time" timestamp with time zone NOT NULL,
	"departure_time" timestamp with time zone,
	"areas_visited" text,
	"biosecurity_declaration_signed" boolean DEFAULT false NOT NULL,
	"health_declaration_signed" boolean DEFAULT false NOT NULL,
	"biosecurity_signature" text,
	"health_signature" text,
	"escorted_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"certificate_type" text NOT NULL,
	"certificate_number" text,
	"issuer" text,
	"issuer_id" integer,
	"issue_date" timestamp with time zone NOT NULL,
	"expiry_date" timestamp with time zone,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_right_to_work" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"staff_name" varchar NOT NULL,
	"document_type" text NOT NULL,
	"document_reference" text,
	"check_date" timestamp with time zone NOT NULL,
	"checked_by" text,
	"expiry_date" timestamp with time zone,
	"follow_up_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_rtw_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"rtw_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"object_path" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_training_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"training_title" text NOT NULL,
	"training_provider" text,
	"training_provider_id" integer,
	"course_id" integer,
	"training_date" timestamp with time zone NOT NULL,
	"expiry_date" timestamp with time zone,
	"competency_achieved" text,
	"assessor_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"course_type" text,
	"issuing_body" text,
	"default_validity_months" integer,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labour_absences" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"staff_name" text NOT NULL,
	"absence_type" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days_count" numeric(5, 1),
	"notes" text,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labour_actual_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"date" date NOT NULL,
	"staff_name" text NOT NULL,
	"actual_status" text NOT NULL,
	"planned_shift" text,
	"notes" text,
	"logged_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labour_hourly_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"staff_name" text NOT NULL,
	"regular_rate_pence" integer DEFAULT 0 NOT NULL,
	"overtime_rate_pence" integer DEFAULT 0 NOT NULL,
	"effective_from" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labour_leave_entitlement" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"staff_name" text NOT NULL,
	"year" integer NOT NULL,
	"entitlement_days" numeric(5, 1) DEFAULT '28' NOT NULL,
	"carried_over_days" numeric(5, 1) DEFAULT '0' NOT NULL,
	"wtr_opt_out" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labour_rota" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"week_start_date" date NOT NULL,
	"staff_name" text NOT NULL,
	"mon_shift" text,
	"tue_shift" text,
	"wed_shift" text,
	"thu_shift" text,
	"fri_shift" text,
	"sat_shift" text,
	"sun_shift" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labour_timesheet_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"staff_name" text NOT NULL,
	"date" date NOT NULL,
	"task_type" text NOT NULL,
	"hours_regular" numeric(5, 2) DEFAULT '0' NOT NULL,
	"hours_overtime" numeric(5, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"source_type" text,
	"source_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accident_book_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"object_path" text NOT NULL,
	"file_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accident_book" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"incident_date" text NOT NULL,
	"incident_time" text,
	"incident_location" text NOT NULL,
	"person_name" text NOT NULL,
	"person_type" text DEFAULT 'employee' NOT NULL,
	"job_title" text,
	"nature_of_incident" text NOT NULL,
	"nature_of_injury" text,
	"body_part_affected" text,
	"first_aid_given" boolean DEFAULT false NOT NULL,
	"first_aid_details" text,
	"first_aider_name" text,
	"hospital_attended" boolean DEFAULT false NOT NULL,
	"hospital_name" text,
	"time_lost_days" text,
	"riddor_reportable" boolean DEFAULT false NOT NULL,
	"riddor_category" text,
	"riddor_reference" text,
	"riddor_reported_date" text,
	"witnesses" text,
	"corrective_action" text,
	"corrective_action_date" text,
	"corrective_action_by" text,
	"investigation_date" text,
	"investigated_by" text,
	"investigation_notes" text,
	"signed_off_by" text,
	"sign_off_date" text,
	"status" text DEFAULT 'reported' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coshh_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"substance_name" text NOT NULL,
	"manufacturer" text,
	"hazard_classification" text,
	"usage_area" text,
	"storage_location" text,
	"control_measures" text,
	"ppe" text,
	"emergency_procedures" text,
	"assessed_by" text,
	"assessment_date" timestamp with time zone NOT NULL,
	"review_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encampment_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"object_path" text NOT NULL,
	"file_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fly_tipping_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"discovered_at" text NOT NULL,
	"location_description" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"waste_types" text,
	"estimated_quantity" text,
	"is_hazardous" boolean DEFAULT false NOT NULL,
	"access_point" text,
	"police_reported" boolean DEFAULT false NOT NULL,
	"police_ref_number" text,
	"council_reported" boolean DEFAULT false NOT NULL,
	"council_ref_number" text,
	"ea_reported" boolean DEFAULT false NOT NULL,
	"ea_ref_number" text,
	"clearance_status" text DEFAULT 'pending' NOT NULL,
	"clearance_contractor" text,
	"clearance_date" text,
	"waste_transfer_note_ref" text,
	"insurance_claim_made" boolean DEFAULT false NOT NULL,
	"insurance_policy_id" integer,
	"insurance_claim_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fly_tipping_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"object_path" text NOT NULL,
	"file_name" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"title" text NOT NULL,
	"area" text,
	"hazard_description" text NOT NULL,
	"risk_level" text,
	"control_measures" text,
	"assessed_by" text,
	"assessment_date" timestamp with time zone NOT NULL,
	"review_date" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unauthorized_encampments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"discovered_at" text NOT NULL,
	"location_description" text NOT NULL,
	"field_id" integer,
	"field_parcel" text,
	"latitude" text,
	"longitude" text,
	"entry_point" text,
	"vehicle_count" integer,
	"person_count" integer,
	"caravan_count" integer,
	"vehicle_descriptions" text,
	"land_damage_description" text,
	"crops_affected" boolean DEFAULT false NOT NULL,
	"estimated_damage" text,
	"police_notified" boolean DEFAULT false NOT NULL,
	"police_ref_number" text,
	"police_action" text,
	"council_notified" boolean DEFAULT false NOT NULL,
	"council_ref_number" text,
	"legal_action_taken" boolean DEFAULT false NOT NULL,
	"legal_action_details" text,
	"solicitor_instructed" boolean DEFAULT false NOT NULL,
	"court_order_obtained" boolean DEFAULT false NOT NULL,
	"court_order_ref" text,
	"vacated_at" text,
	"land_condition_after" text,
	"insurance_claim_made" boolean DEFAULT false NOT NULL,
	"insurance_policy_id" integer,
	"insurance_claim_ref" text,
	"remediation_required" boolean DEFAULT false NOT NULL,
	"remediation_notes" text,
	"remediation_cost" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waste_disposal_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"waste_type" text NOT NULL,
	"quantity" text,
	"disposal_method" text NOT NULL,
	"disposal_date" timestamp with time zone NOT NULL,
	"source_description" text,
	"collection_building_id" integer,
	"carrier_id" integer,
	"carrier_name" text,
	"carrier_licence" text,
	"carrier_registration_type" text,
	"ewc_code" text,
	"destination_site" text,
	"waste_transfer_note" text,
	"receipt_photo_path" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corrective_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"nonconformance_id" integer NOT NULL,
	"description" text NOT NULL,
	"assigned_to" text,
	"due_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"verified_by" text,
	"status" text DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_assurance_certs" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"certification_body" text NOT NULL,
	"scheme" text,
	"cert_number" text,
	"sectors" text,
	"assessor_name" text,
	"assessor_membership_no" text,
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"next_visit_due" timestamp with time zone,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"inspection_type" text NOT NULL,
	"inspector_name" text,
	"inspection_body" text,
	"inspection_date" timestamp with time zone NOT NULL,
	"overall_result" text,
	"summary" text,
	"next_inspection_due" timestamp with time zone,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nonconformance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"inspection_id" integer,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"severity" text,
	"identified_date" timestamp with time zone NOT NULL,
	"identified_by" text,
	"status" text DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agri_environment_scheme_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"scheme_name" text NOT NULL,
	"agreement_number" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"annual_payment_pence" integer,
	"obligations" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environmental_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessor_name" text NOT NULL,
	"assessor_organisation" text,
	"assessment_date" timestamp with time zone NOT NULL,
	"outcome" text DEFAULT 'pass' NOT NULL,
	"conditions" text,
	"next_assessment_due" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environmental_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"feature_type" text NOT NULL,
	"description" text,
	"area_hectares" numeric(10, 4),
	"is_enclosed" boolean DEFAULT false NOT NULL,
	"length_metres" numeric(10, 2),
	"management_practice" text,
	"date_recorded" timestamp with time zone DEFAULT now() NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environmental_management_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"feature_id" integer,
	"feature_name" text,
	"feature_type" text,
	"event_date" timestamp with time zone NOT NULL,
	"event_type" text NOT NULL,
	"description" text,
	"operator" text,
	"contractor_used" boolean DEFAULT false,
	"contractor_name" text,
	"follow_up_actions_needed" text,
	"scheme_id" integer,
	"scheme_name" text,
	"fulfils_scheme_obligation" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sfi_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"agreement_id" integer,
	"action_code" text NOT NULL,
	"action_title" text NOT NULL,
	"land_parcel_reference" text,
	"eligible_area_ha" numeric(8, 3),
	"annual_payment_per_ha" numeric(8, 2),
	"annual_payment_amount" numeric(10, 2),
	"evidence_required" text,
	"last_evidence_date" date,
	"next_evidence_date" date,
	"compliance_status" text DEFAULT 'compliant' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sfi_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"agreement_number" text NOT NULL,
	"scheme_name" text NOT NULL,
	"agreement_start_date" date NOT NULL,
	"agreement_end_date" date NOT NULL,
	"total_annual_payment" numeric(10, 2),
	"managing_body" text,
	"agent_or_advisor_name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slurry_spreading_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"store_id" integer,
	"spreading_date" date NOT NULL,
	"field_description" text NOT NULL,
	"field_area_ha" numeric(8, 3),
	"manure_type" text NOT NULL,
	"application_method" text NOT NULL,
	"volume_applied_m3" numeric(10, 2),
	"nitrogen_applied_kg_ha" numeric(8, 2),
	"soil_temp_c" numeric(5, 1),
	"ground_conditions" text,
	"wind_speed" text,
	"rain_in_last_24h" boolean DEFAULT false,
	"rain_forecast_48h" boolean DEFAULT false,
	"buffer_from_water_m" numeric(6, 0),
	"within_nvz_closed_period" boolean DEFAULT false,
	"operator_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slurry_store_inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"inspection_date" date NOT NULL,
	"inspector_name" text,
	"inspector_organisation" text,
	"outcome" text NOT NULL,
	"freeboard_ok" boolean,
	"freeboard_mm" numeric(6, 0),
	"leaks_or_damage_found" boolean DEFAULT false,
	"deficiencies" text,
	"actions_required" text,
	"next_inspection_due" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slurry_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"store_name" text NOT NULL,
	"store_type" text NOT NULL,
	"capacity_m3" numeric(8, 1),
	"freeboard" text,
	"lining_type" text,
	"construction_year" integer,
	"last_inspection_date" date,
	"next_inspection_due" date,
	"agency_registration_number" text,
	"leak_detection_system" boolean DEFAULT false,
	"cover_type" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_stock_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"bin_id" integer,
	"commodity" text NOT NULL,
	"variety" text,
	"crop_year" text,
	"quantity_tonnes" numeric(10, 3) DEFAULT '0' NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"crop_stock_level_id" integer,
	"bin_id" integer,
	"movement_type" text NOT NULL,
	"direction" text NOT NULL,
	"commodity" text NOT NULL,
	"variety" text,
	"crop_year" text,
	"quantity_tonnes" numeric(10, 3) NOT NULL,
	"reference_type" text,
	"reference_id" integer,
	"moved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"performed_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispatch_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"plan_ref" text,
	"title" text NOT NULL,
	"load_type" text DEFAULT 'Other' NOT NULL,
	"commodity" text,
	"source_location" text,
	"bin_id" integer,
	"destination" text,
	"buyer_id" integer,
	"buyer_ref" text,
	"haulier_id" integer,
	"haulier_name" text,
	"planned_date" date NOT NULL,
	"planned_date_end" date,
	"estimated_loads" integer,
	"estimated_vehicles" integer,
	"estimated_tonnes" numeric(10, 2),
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_by" text,
	"decision_made_by_member_id" integer,
	"haulier_notified_at" timestamp with time zone,
	"linked_contract_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "haulage_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"movement_type" text DEFAULT 'farm_exit_dispatch' NOT NULL,
	"load_type" text NOT NULL,
	"load_description" text,
	"commodity" text,
	"variety" text,
	"grade" text,
	"moisture_percent" numeric(5, 2),
	"specific_weight_kg_hl" numeric(6, 2),
	"weighbridge_ticket_no" text,
	"bin_id" integer,
	"destination_bin_id" integer,
	"storage_location" text,
	"buyer_id" integer,
	"customer_ref" text,
	"haulier_registered_id" integer,
	"grain_sale_id" integer,
	"delivery_status" text,
	"weight_tonnes" numeric(10, 2),
	"vehicle_registration" text,
	"driver_name" text,
	"haulier_company" text,
	"origin" text,
	"destination" text,
	"departure_date" timestamp with time zone NOT NULL,
	"arrival_date" timestamp with time zone,
	"waybill_number" text,
	"invoice_ref" text,
	"dispatch_plan_id" integer,
	"cost_pence" integer,
	"delivery_confirmed_at" timestamp with time zone,
	"delivery_confirmed_by" text,
	"delivery_confirmation_notes" text,
	"weighbridge_weight_tonnes" numeric(10, 2),
	"proof_of_delivery_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "haulier_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"haulier_id" integer,
	"haulier_name" text,
	"invoice_number" text NOT NULL,
	"invoice_date" text,
	"period_from" text,
	"period_to" text,
	"amount_net_pence" integer,
	"vat_pence" integer,
	"amount_gross_pence" integer,
	"status" text DEFAULT 'received' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hauliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"address_line1" text,
	"address_line2" text,
	"town" text,
	"county" text,
	"postcode" text,
	"contacts" text,
	"email" text,
	"vehicle_types" text,
	"operator_licence" text,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"po_id" integer NOT NULL,
	"stock_item_id" integer,
	"quantity_ordered" numeric(10, 2) NOT NULL,
	"unit_price_pence" integer,
	"quantity_received" numeric(10, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"feed_stock_item_id" integer
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"supplier_id" integer,
	"po_number" text NOT NULL,
	"order_date" timestamp with time zone NOT NULL,
	"expected_delivery_date" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"submitted_by_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"supplier_id" integer,
	"stock_item_id" integer NOT NULL,
	"po_id" integer,
	"grn_number" text,
	"delivery_date" timestamp with time zone NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"batch_number" text,
	"lot_number" text,
	"expiry_date" timestamp with time zone,
	"cost_pence" integer,
	"invoice_reference" text,
	"received_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"stock_type" text DEFAULT 'chemical' NOT NULL,
	"category" text,
	"product_code" text,
	"mapp_number" text,
	"unit" text,
	"reorder_level" numeric(10, 2),
	"unit_cost_pence" integer,
	"storage_location" text,
	"default_supplier_id" integer,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"approval_required" boolean DEFAULT false NOT NULL,
	"approver_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"stock_item_id" integer NOT NULL,
	"current_quantity" numeric(10, 2) NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"stock_item_id" integer NOT NULL,
	"movement_type" text NOT NULL,
	"quantity_change" numeric(10, 4) NOT NULL,
	"reference_type" text,
	"reference_id" integer,
	"field_id" integer,
	"delivery_id" integer,
	"moved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"performed_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocktake_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"stock_item_id" integer,
	"item_name" text NOT NULL,
	"stock_type" text,
	"unit" text,
	"location" text,
	"expected_qty" numeric(10, 2) NOT NULL,
	"counted_qty" numeric(10, 2),
	"variance" numeric(10, 2),
	"unit_cost_pence" integer,
	"variance_value" numeric(12, 2),
	"variance_reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocktake_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"stocktake_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	"item_count" integer DEFAULT 0,
	"counted_count" integer DEFAULT 0,
	"total_variance_value" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"category" text,
	"supplier_type" text DEFAULT 'general' NOT NULL,
	"account_number" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"approved_date" timestamp with time zone,
	"ufas_number" text,
	"femas_number" text,
	"apha_feed_reg_number" text,
	"certification_body" text,
	"certification_expiry" timestamp with time zone,
	"cph" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"contract_type" text DEFAULT 'forward' NOT NULL,
	"crop_year" text,
	"buyer_id" integer,
	"buyer" text NOT NULL,
	"commodity" text NOT NULL,
	"variety" text,
	"quality_spec" text,
	"quantity_tonnes" numeric(10, 2),
	"contracted_price_pence" integer,
	"total_value_pence" integer,
	"currency" text DEFAULT 'GBP' NOT NULL,
	"price_unit" text,
	"contract_date" timestamp with time zone,
	"delivery_window_start" timestamp with time zone,
	"delivery_window_end" timestamp with time zone,
	"delivery_location" text,
	"call_off_window_notes" text,
	"advance_payment_pence" integer,
	"pool_levy_pence" integer,
	"pool_closing_date" timestamp with time zone,
	"pool_settlement_date" timestamp with time zone,
	"pool_bonus_declarations" text,
	"status" text DEFAULT 'open' NOT NULL,
	"contract_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"export_type" text NOT NULL,
	"date_range_start" timestamp with time zone NOT NULL,
	"date_range_end" timestamp with time zone NOT NULL,
	"format" text DEFAULT 'csv' NOT NULL,
	"generated_by" text,
	"file_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"stock_delivery_id" integer,
	"transaction_type" text NOT NULL,
	"category" text,
	"description" text,
	"amount_pence" integer NOT NULL,
	"currency" text DEFAULT 'GBP' NOT NULL,
	"transaction_date" timestamp with time zone NOT NULL,
	"reference" text,
	"vendor_customer" text,
	"payment_method" text,
	"vat_amount_pence" integer,
	"vat_rate" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"title" text NOT NULL,
	"document_type" text,
	"reference_number" text,
	"issued_by" text,
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"linked_record_type" text,
	"linked_record_id" integer,
	"file_path" text,
	"file_size" integer,
	"mime_type" text,
	"uploaded_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "object_storage_refs" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"document_id" integer,
	"storage_key" text NOT NULL,
	"bucket" text NOT NULL,
	"original_filename" text,
	"content_type" text,
	"size_bytes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_weather_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"serial_number" text,
	"installation_type" text DEFAULT 'portable' NOT NULL,
	"calibration_date" timestamp with time zone,
	"calibration_due_date" timestamp with time zone,
	"api_device_id" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_weather_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"equipment_id" integer,
	"device_id" integer,
	"vehicle_name" text NOT NULL,
	"vehicle_registration" text,
	"reading_timestamp" timestamp with time zone NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"field_description" text,
	"temperature_c" numeric(5, 1),
	"humidity_percent" numeric(5, 1),
	"wind_speed_kmh" numeric(5, 1),
	"wind_direction" text,
	"rainfall_mm" numeric(7, 2),
	"leaf_wetness" text,
	"data_source" text DEFAULT 'manual' NOT NULL,
	"linked_spray_application_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" integer,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"linked_spray_application_id" integer,
	"reading_timestamp" timestamp with time zone NOT NULL,
	"entry_mode" text,
	"data_source" text,
	"temperature_c" numeric(5, 1),
	"temperature_high_c" numeric(5, 1),
	"temperature_low_c" numeric(5, 1),
	"humidity_percent" numeric(5, 1),
	"wind_speed_kmh" numeric(5, 1),
	"wind_direction" text,
	"rainfall_mm" numeric(7, 2),
	"pressure_hpa" numeric(7, 2),
	"conditions" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"station_type" text NOT NULL,
	"location_type" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"linked_field_id" integer,
	"manufacturer" text,
	"model" text,
	"serial_number" text,
	"install_date" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"sender_type" text NOT NULL,
	"sender_id" varchar,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"location_type" text NOT NULL,
	"description" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biofuel_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"scheme" text NOT NULL,
	"certification_number" text,
	"issuing_body" text,
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"scope" text,
	"rtfo_operator_number" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biofuel_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"buyer_id" integer,
	"delivery_date" timestamp with time zone NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_rtfo_ref" text,
	"crop_type" text NOT NULL,
	"quantity_tonnes" numeric(10, 3),
	"field_names" jsonb DEFAULT '[]'::jsonb,
	"certification_ref" text,
	"sustainability_declaration_ref" text,
	"sustainability_scheme" text,
	"ghg_saving_percent" numeric(5, 2),
	"notes" text,
	"source_type" text DEFAULT 'store' NOT NULL,
	"storage_location_id" integer,
	"storage_movement_id" integer,
	"transport_type" text,
	"haulier_name" text,
	"haulier_contact" text,
	"vehicle_registration" text,
	"delivery_note_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biofuel_field_declarations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"field_name" text NOT NULL,
	"land_use_in_2008" text NOT NULL,
	"converted_after_2008" boolean DEFAULT false NOT NULL,
	"conversion_from" text,
	"conversion_date" timestamp with time zone,
	"high_carbon_stock_risk" boolean DEFAULT false NOT NULL,
	"high_biodiversity_risk" boolean DEFAULT false NOT NULL,
	"eligibility_status" text DEFAULT 'eligible' NOT NULL,
	"declaration_date" timestamp with time zone DEFAULT now() NOT NULL,
	"declared_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtfo_buyers" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"trading_name" text,
	"rtfo_obligation_number" text,
	"iscc_cert_number" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"address_line1" text,
	"address_line2" text,
	"town" text,
	"county" text,
	"postcode" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_access_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"session_type" text NOT NULL,
	"session_id" integer NOT NULL,
	"accessor_email" text,
	"accessor_name" text,
	"page_accessed" text,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_advisors" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"advisor_email" text NOT NULL,
	"advisor_name" text NOT NULL,
	"advisor_role" text NOT NULL,
	"module_access" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"last_access_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "farm_advisors_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "farm_inspection_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"accessor_email" text,
	"accessor_name" text NOT NULL,
	"accessor_organisation" text,
	"purpose" text NOT NULL,
	"module_access" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_access_at" timestamp with time zone,
	"access_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "farm_inspection_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "admin_emails_sent" (
	"id" serial PRIMARY KEY NOT NULL,
	"to_address" text NOT NULL,
	"to_name" text,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"template_id" integer,
	"ticket_id" integer,
	"status" text DEFAULT 'sent' NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lookup_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"lookup_key" text NOT NULL,
	"value" text NOT NULL,
	"label" text NOT NULL,
	"group_label" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_bde_managed" boolean DEFAULT true NOT NULL,
	"tenant_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lookup_review_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"lookup_key" text NOT NULL,
	"reviewed_by" text NOT NULL,
	"notes" text,
	"next_review_due" timestamp with time zone,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_farrowing_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"farrowing_date" date NOT NULL,
	"sow_ear_tag" text NOT NULL,
	"sow_breed" text,
	"parity_number" integer,
	"flock_id" integer,
	"total_born_alive" integer DEFAULT 0 NOT NULL,
	"total_born_dead" integer DEFAULT 0 NOT NULL,
	"total_mummified" integer DEFAULT 0 NOT NULL,
	"fosters_in" integer DEFAULT 0 NOT NULL,
	"fosters_out" integer DEFAULT 0 NOT NULL,
	"average_birth_weight_kg" numeric(5, 2),
	"weaning_date" date,
	"piglets_weaned_count" integer,
	"average_weaning_weight_kg" numeric(5, 2),
	"expected_farrowing_date" date,
	"farrowing_ease" text,
	"assistance_required" boolean DEFAULT false,
	"assistance_details" text,
	"vet_attended" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"colostrum_managed" boolean DEFAULT true,
	"perinatal_disposal_contractor_id" integer,
	"perinatal_collection_date" date,
	"perinatal_collection_ref" text,
	"perinatal_disposal_method" text,
	"perinatal_disposal_notes" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_fci_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"movement_id" integer,
	"document_date" date NOT NULL,
	"batch_reference" text,
	"destination_abattoir" text,
	"number_of_pigs" integer NOT NULL,
	"veterinary_medicines_last_60_days" boolean DEFAULT false,
	"medicine_details" text,
	"withdrawal_period_clear" boolean DEFAULT true,
	"feed_withdrawal_hours" integer,
	"lamness_casualty_status" text,
	"signed_by_farmer" boolean DEFAULT false,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_feed_consumption" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"consumption_date" date NOT NULL,
	"pen_name" text,
	"feed_type" text NOT NULL,
	"quantity_kg" numeric(10, 2),
	"batch_lot_number" text,
	"applied_to_flock_id" integer,
	"location_id" integer,
	"linked_delivery_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_flocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_name" text NOT NULL,
	"production_type" text NOT NULL,
	"breed" text,
	"cph_number" text,
	"herd_number" text,
	"current_count" integer DEFAULT 0 NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_medicine_treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"treatment_date" date NOT NULL,
	"flock_id" integer,
	"batch_or_pen_ref" text,
	"number_of_animals" integer DEFAULT 1 NOT NULL,
	"medicine_product_name" text NOT NULL,
	"active_ingredient" text,
	"manufacturer" text,
	"product_batch_number" text,
	"expiry_date" date,
	"administration_route" text NOT NULL,
	"quantity_used" text NOT NULL,
	"unit_of_measure" text,
	"diagnosis_reason" text NOT NULL,
	"prescribing_vet_name" text,
	"prescribing_vet_practice" text,
	"prescription_obtained" boolean DEFAULT false,
	"administered_by" text,
	"withdrawal_period_meat_days" integer,
	"withdrawal_end_date" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"movement_date" date NOT NULL,
	"movement_type" text NOT NULL,
	"from_location" text NOT NULL,
	"to_location" text NOT NULL,
	"from_cph" text,
	"to_cph" text,
	"number_of_animals" integer NOT NULL,
	"eaml2_reference" text,
	"transporter_name" text,
	"vehicle_registration" text,
	"cleaning_declaration" boolean DEFAULT false,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_red_tractor_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"assessor_name" text,
	"assessor_organisation" text,
	"certificate_number" text,
	"certificate_expiry_date" date,
	"animal_welfare_plan_in_place" boolean DEFAULT false,
	"vet_vist_records_complete" boolean DEFAULT false,
	"medicine_records_complete" boolean DEFAULT false,
	"feed_records_complete" boolean DEFAULT false,
	"movement_records_complete" boolean DEFAULT false,
	"biosecurity_plan_in_place" boolean DEFAULT false,
	"water_quality_tested" boolean DEFAULT false,
	"manure_management_plan" boolean DEFAULT false,
	"tail_biting_risk_assessment" boolean DEFAULT false,
	"enrichment_provided" boolean DEFAULT false,
	"muckspreader_calibrated" boolean DEFAULT false,
	"staff_training_records" boolean DEFAULT false,
	"staff_competency_assessed" boolean DEFAULT false,
	"house_condition_adequate" boolean DEFAULT false,
	"lighting_compliant" boolean DEFAULT false,
	"space_allowance_compliant" boolean DEFAULT false,
	"feed_system_compliant" boolean DEFAULT false,
	"mortality_records_complete" boolean DEFAULT false,
	"abattoir_feedback_acted_on" boolean DEFAULT false,
	"eaml2_records_complete" boolean DEFAULT false,
	"overall_status" text DEFAULT 'in-progress' NOT NULL,
	"non_conformances_count" integer DEFAULT 0,
	"non_conformance_details" text,
	"corrective_action_deadline" date,
	"next_assessment_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_stockmanship_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"check_date" date NOT NULL,
	"checked_by" text NOT NULL,
	"flock_id" integer,
	"mortalities_found" integer DEFAULT 0,
	"injured_found" integer DEFAULT 0,
	"water_system_ok" boolean DEFAULT true,
	"feed_system_ok" boolean DEFAULT true,
	"ventilation_ok" boolean DEFAULT true,
	"temperature_ok" boolean DEFAULT true,
	"lighting_ok" boolean DEFAULT true,
	"bedding_ok" boolean DEFAULT true,
	"overall_welfare" text,
	"actions_required" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_tail_biting_risks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"assessed_by" text NOT NULL,
	"flock_id" integer,
	"risk_level" text NOT NULL,
	"tails_docked_at_birth" boolean DEFAULT false,
	"tail_length_adequate" boolean DEFAULT true,
	"stocking_density_ok" boolean DEFAULT true,
	"enrichment_provided" boolean DEFAULT true,
	"enrichment_types" text,
	"feeding_system_ok" boolean DEFAULT true,
	"health_status_ok" boolean DEFAULT true,
	"mixing_frequency" text,
	"current_biting" boolean DEFAULT false,
	"biting_level" text,
	"interventions_taken" text,
	"monitoring_frequency" text,
	"review_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_vet_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"vet_name" text NOT NULL,
	"practice_name" text,
	"flock_id" integer,
	"body_condition_score" numeric(3, 1),
	"lameness" text,
	"respiratory_health" text,
	"skin_condition" text,
	"tail_biting" text,
	"mortality_rate" numeric(5, 2),
	"findings" text,
	"recommendations" text,
	"next_review_date" date,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_salmonella_monitoring" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"pig_flock_id" integer,
	"sampling_period_start" date NOT NULL,
	"sampling_period_end" date,
	"sample_type" text NOT NULL,
	"sample_count" integer,
	"lab_name" text,
	"lab_ref" text,
	"positive_count" integer DEFAULT 0,
	"seroprevalence" numeric(5, 1),
	"salmonella_category" integer,
	"previous_category" integer,
	"category_change" text,
	"action_required" boolean DEFAULT false,
	"actions_taken" text,
	"next_sampling_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campylobacter_monitoring" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"house_id" integer,
	"flock_id" integer,
	"sample_date" date NOT NULL,
	"sample_type" text NOT NULL,
	"samples_taken" integer,
	"lab_name" text,
	"lab_ref" text,
	"result" text NOT NULL,
	"ceu_count" numeric(10, 2),
	"result_category" text,
	"fsa_band" text,
	"zap_triggered" boolean DEFAULT false,
	"zap_reference" text,
	"actions_taken" text,
	"next_sample_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_biosecurity_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"house_id" integer NOT NULL,
	"previous_flock_id" integer,
	"cleanout_start_date" date NOT NULL,
	"cleanout_end_date" date,
	"downtime_days" integer,
	"catching_complete" boolean DEFAULT false,
	"litter_removed" boolean DEFAULT false,
	"litter_disposal_method" text,
	"dry_clean_complete" boolean DEFAULT false,
	"wash_complete" boolean DEFAULT false,
	"disinfection_complete" boolean DEFAULT false,
	"disinfectant_used" text,
	"disinfectant_approved" boolean DEFAULT false,
	"disinfectant_dilution_rate" text,
	"fumigation_complete" boolean DEFAULT false,
	"fumigation_product" text,
	"vermin_control_complete" boolean DEFAULT false,
	"vermin_control_details" text,
	"water_system_flush_complete" boolean DEFAULT false,
	"water_system_disinfected" boolean DEFAULT false,
	"feed_system_cleaned" boolean DEFAULT false,
	"ventilation_checked" boolean DEFAULT false,
	"heating_checked" boolean DEFAULT false,
	"footbaths_installed" boolean DEFAULT false,
	"vehicle_restrictions" boolean DEFAULT true,
	"visitor_log_in_place" boolean DEFAULT false,
	"independent_audit_completed" boolean DEFAULT false,
	"audit_body" text,
	"overall_compliance_status" text DEFAULT 'in-progress' NOT NULL,
	"scheme_certification_scheme" text,
	"completed_by" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_broiler_welfare" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"assessed_by" text NOT NULL,
	"age_at_assessment_days" integer,
	"sample_size" integer,
	"footpad_dermatitis_score" text,
	"footpad_dermatitis_percent" numeric(5, 1),
	"hock_burn_score" text,
	"hock_burn_percent" numeric(5, 1),
	"gait_score" text,
	"breast_blister_percent" numeric(5, 1),
	"plumage_score" text,
	"soiled_plumage_percent" numeric(5, 1),
	"overall_outcome" text NOT NULL,
	"actions_taken" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_chick_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"supplier_id" integer,
	"supplier_name" text,
	"hatchery_approval_number" text,
	"po_reference" text,
	"order_date" date,
	"number_of_birds_ordered" integer,
	"number_of_birds_received" integer,
	"price_per_bird_pence" integer,
	"total_cost_pence" integer,
	"invoice_reference" text,
	"invoice_date" date,
	"payment_terms_days" integer DEFAULT 30,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"payment_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_cleanout_stock_consumptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"cleanout_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"stock_item_id" integer,
	"product_name" text,
	"quantity_used" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_daily_mortality" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer NOT NULL,
	"record_date" date NOT NULL,
	"mortality_count" integer DEFAULT 0 NOT NULL,
	"culled_count" integer DEFAULT 0 NOT NULL,
	"running_total_mortality" integer,
	"mortality_percentage" numeric(5, 2),
	"main_cause" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_environmental_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer NOT NULL,
	"log_date" date NOT NULL,
	"log_time" text,
	"temperature_min" numeric(5, 1),
	"temperature_max" numeric(5, 1),
	"humidity" numeric(5, 1),
	"co2_ppm" integer,
	"ammonia_ppm" numeric(5, 1),
	"ventilation_rate" text,
	"lighting_hours" numeric(4, 1),
	"stocking_density" numeric(6, 2),
	"alarm_activated" boolean DEFAULT false,
	"alarm_details" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_fci_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer NOT NULL,
	"document_date" date NOT NULL,
	"catching_date" date,
	"destination_abattoir" text,
	"number_of_birds" integer NOT NULL,
	"catching_contractor" text,
	"any_disease_or_condition" boolean DEFAULT false,
	"disease_details" text,
	"medications_last_7_days" boolean DEFAULT false,
	"medication_details" text,
	"withdrawal_period_clear" boolean DEFAULT true,
	"last_feed_withdrawal_hours" integer,
	"signed_by_farmer" boolean DEFAULT false,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_flocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"house_id" integer,
	"herd_id" integer,
	"flock_number" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"production_system" text NOT NULL,
	"placement_date" date NOT NULL,
	"placement_count" integer NOT NULL,
	"hatchery_name" text,
	"hatchery_approval_number" text,
	"status" text DEFAULT 'active' NOT NULL,
	"depletion_date" date,
	"depletion_count" integer,
	"depletion_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_house_cleanouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"house_id" integer NOT NULL,
	"flock_id" integer,
	"cleanout_start_date" date NOT NULL,
	"cleanout_end_date" date,
	"litter_removal_date" date,
	"disinfectant_used" text,
	"disinfectant_supplier" text,
	"disinfectant_approval_number" text,
	"dilution_rate" text,
	"application_method" text,
	"contact_time_mins" integer,
	"swabs_taken" boolean DEFAULT false,
	"swab_results" text,
	"standing_time_days" integer,
	"performed_by_contractor" boolean DEFAULT false NOT NULL,
	"contractor_name" text,
	"contractor_own_supplies" boolean DEFAULT false NOT NULL,
	"completed_by" text,
	"verified_by" text,
	"cost_pence" integer,
	"invoice_ref" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_houses" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"house_name" text NOT NULL,
	"house_type" text NOT NULL,
	"species" text NOT NULL,
	"production_system" text NOT NULL,
	"approved_capacity" integer NOT NULL,
	"length_m" numeric(6, 1),
	"width_m" numeric(6, 1),
	"ventilation_type" text,
	"water_system" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_scheme_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"scheme" text NOT NULL,
	"certificate_number" text,
	"assessment_date" date,
	"assessor_name" text,
	"assessor_organisation" text,
	"outcome_status" text DEFAULT 'pass' NOT NULL,
	"non_conformances_count" integer DEFAULT 0,
	"non_conformance_details" text,
	"corrective_action_required" boolean DEFAULT false,
	"corrective_action_deadline" date,
	"corrective_action_notes" text,
	"next_assessment_due" date,
	"document_reference" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_thinning_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer NOT NULL,
	"thinning_date" date NOT NULL,
	"thinning_number" integer DEFAULT 1 NOT NULL,
	"birds_removed" integer NOT NULL,
	"target_live_weight_kg" numeric(6, 2),
	"average_live_weight_kg" numeric(6, 2),
	"destination_abattoir" text,
	"catching_contractor_name" text,
	"catching_start_time" text,
	"catching_end_time" text,
	"doas_at_loading" integer DEFAULT 0,
	"transport_vehicle_reg" text,
	"catching_conditions" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer NOT NULL,
	"treatment_date" date NOT NULL,
	"number_of_birds_treated" integer,
	"product_name" text NOT NULL,
	"active_ingredient" text,
	"condition" text NOT NULL,
	"route_of_administration" text NOT NULL,
	"dose_rate" text,
	"duration_days" integer,
	"batch_number" text,
	"expiry_date" date,
	"administered_by" text,
	"prescribing_vet_name" text,
	"prescribing_vet_practice" text,
	"prescription_obtained" boolean DEFAULT false,
	"withdrawal_period_days" integer,
	"withdrawal_clear_date" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allergen_management_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"review_date" date NOT NULL,
	"reviewed_by" text NOT NULL,
	"allergens_on_site" text[],
	"cross_contamination_risk" text NOT NULL,
	"control_measures" text,
	"staff_training_date" date,
	"labelling_verified" boolean DEFAULT false,
	"next_review_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fresh_produce_intake" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"harvest_record_id" integer,
	"intake_date" date NOT NULL,
	"harvest_batch_ref" text NOT NULL,
	"product_name" text NOT NULL,
	"quantity_kg" numeric(10, 2),
	"condition_on_arrival" text,
	"intake_temperature_c" numeric(5, 1),
	"target_storage_temperature_c" numeric(5, 1),
	"pre_cooling_start_time" text,
	"pre_cooling_end_time" text,
	"achieved_temperature_c" numeric(5, 1),
	"storage_location" text,
	"received_by" text,
	"foreign_body_check" boolean DEFAULT false,
	"pest_damage_check" boolean DEFAULT false,
	"accepted" boolean DEFAULT true,
	"rejection_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horticulture_block_boundaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"polygon_points" jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"captured_by" text
);
--> statement-breakpoint
CREATE TABLE "horticulture_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"block_name" text NOT NULL,
	"block_code" text,
	"area_ha" numeric(8, 3),
	"soil_type" text,
	"irrigation_system" text,
	"water_source" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"retired_at" timestamp,
	"retired_by" text,
	"retirement_reason" text,
	"retirement_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horticulture_crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"crop_name" text NOT NULL,
	"variety" text,
	"sowing_date" date,
	"transplanting_date" date,
	"expected_harvest_date" date,
	"seed_supplier" text,
	"seed_lot_number" text,
	"seed_treated" boolean DEFAULT false,
	"seed_treatment_details" text,
	"growing_method" text,
	"status" text DEFAULT 'growing' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horticulture_harvest_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"crop_id" integer,
	"harvest_date" date NOT NULL,
	"harvest_batch_ref" text NOT NULL,
	"block_id" integer,
	"quantity_kg" numeric(10, 2) NOT NULL,
	"grade_a_kg" numeric(10, 2),
	"grade_b_kg" numeric(10, 2),
	"waste_kg" numeric(10, 2),
	"harvested_by" text,
	"supervisor_name" text,
	"weather_conditions" text,
	"temperature" numeric(5, 1),
	"pre_harvest_interval_days" integer,
	"destination" text,
	"customer_reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horticulture_packhouse_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"harvest_record_id" integer,
	"intake_record_id" integer,
	"harvest_batch_ref" text NOT NULL,
	"packing_date" date NOT NULL,
	"product_name" text NOT NULL,
	"traceability_code" text NOT NULL,
	"quantity_packed_kg" numeric(10, 2),
	"pack_format" text,
	"label_checked" boolean DEFAULT false,
	"metal_detector_check" boolean DEFAULT false,
	"temperature_at_packing" numeric(5, 1),
	"cold_store_temperature" numeric(5, 1),
	"dispatch_date" date,
	"customer_name" text,
	"despatch_note_number" text,
	"allergen_check" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horticulture_water_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"test_date" date NOT NULL,
	"water_source" text NOT NULL,
	"testing_lab" text,
	"lab_supplier_id" integer,
	"sample_reference" text,
	"ecoli" text,
	"total_coliform" text,
	"salmonella" text,
	"cryptosporidium" text,
	"ph" numeric(4, 1),
	"turbidity" numeric(8, 2),
	"nitrates_mg_l" numeric(8, 2),
	"overall_result" text NOT NULL,
	"corrective_action" text,
	"next_test_due_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_fp_block_synthetic_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_status_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"active_ingredient" text,
	"product_type" text,
	"application_date" date,
	"notes" text,
	"spray_application_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_fresh_produce_block_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"block_name" text NOT NULL,
	"certifying_body" text,
	"conversion_start_date" date,
	"fully_organic_date" date,
	"status" text DEFAULT 'in-conversion' NOT NULL,
	"land_use_before_conversion" text,
	"previous_synthetic_inputs" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_fresh_produce_buyer_declarations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"declaration_date" date NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_address" text,
	"product_description" text NOT NULL,
	"quantity_kg" numeric(10, 2),
	"certifying_body" text,
	"certificate_number" text,
	"declared_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_fresh_produce_certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"certifying_body" text NOT NULL,
	"certificate_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"expiry_date" date,
	"scope" text,
	"products_included" text,
	"annual_renewal_due" date,
	"status" text DEFAULT 'active' NOT NULL,
	"document_ref" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_fresh_produce_input_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"application_date" date NOT NULL,
	"input_name" text NOT NULL,
	"input_type" text,
	"approval_status" text DEFAULT 'permitted',
	"certifier_approval_ref" text,
	"approved_by_body" text,
	"is_approved" boolean DEFAULT true,
	"supplier" text,
	"po_reference" text,
	"grn_reference" text,
	"crop_year" integer,
	"quantity_applied" numeric(10, 3),
	"quantity_unit" text,
	"purpose_of_use" text,
	"applied_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_certification" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"certifier" text NOT NULL,
	"certificate_number" text,
	"certification_date" date,
	"renewal_date" date,
	"status" text DEFAULT 'certified' NOT NULL,
	"operator_number" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_dairy_collection" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"collection_date" date NOT NULL,
	"collector_name" text,
	"vehicle_registration" text,
	"volume_litres" numeric(10, 2),
	"is_organic_collection" boolean DEFAULT true NOT NULL,
	"organic_cert_ref" text,
	"collection_slip_ref" text,
	"milk_quality_grade" text,
	"scc_count" integer,
	"tbc_count" integer,
	"price_per_litre_pence" integer,
	"organic_premium_pence" integer,
	"gross_value_pence" integer,
	"deductions_pence" integer,
	"net_value_pence" integer,
	"fat_percentage" numeric(5, 2),
	"protein_percentage" numeric(5, 2),
	"processor_ref" text,
	"non_organic_reason" text,
	"recorded_by_user_id" text,
	"recorded_by_user_name" text,
	"witnessed_by" text,
	"collector_supplier_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_dairy_feed" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"feed_delivery_id" integer,
	"record_date" date NOT NULL,
	"feed_type" text NOT NULL,
	"feed_product_name" text NOT NULL,
	"supplier" text,
	"supplier_approval_number" text,
	"is_organic_approved" boolean DEFAULT true NOT NULL,
	"quantity_kg" numeric(10, 2),
	"organic_percentage" numeric(5, 2),
	"dry_matter_kg" numeric(10, 2),
	"po_reference" text,
	"grn_reference" text,
	"certifier_approval_ref" text,
	"derogation_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_dairy_herd_conversion" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"herd_name" text NOT NULL,
	"breed" text,
	"number_of_cows" integer,
	"conversion_start_date" date NOT NULL,
	"expected_cert_date" date,
	"actual_cert_date" date,
	"status" text DEFAULT 'in-conversion' NOT NULL,
	"certifier" text,
	"certification_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_dairy_treatment" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"medicine_record_id" integer,
	"herd_id" integer,
	"treatment_date" date NOT NULL,
	"cow_ids" text,
	"number_of_cows" integer,
	"product_name" text NOT NULL,
	"product_category" text,
	"active_ingredient" text,
	"dose_amount" text,
	"route_of_administration" text,
	"vet_name" text,
	"prescription_ref" text,
	"standard_milk_withdrawal_days" integer,
	"doubled_milk_withdrawal_days" integer,
	"standard_meat_withdrawal_days" integer,
	"doubled_meat_withdrawal_days" integer,
	"milk_withdrawal_end_date" date,
	"meat_withdrawal_end_date" date,
	"certifier_notified" boolean DEFAULT false NOT NULL,
	"treatment_number" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_feed_derogation_correspondence" (
	"id" serial PRIMARY KEY NOT NULL,
	"derogation_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"correspondence_date" date NOT NULL,
	"direction" text DEFAULT 'to-certifier' NOT NULL,
	"subject" text NOT NULL,
	"body" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_feed_derogation" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"ingredient_name" text NOT NULL,
	"feed_product_name" text,
	"species" text,
	"certifier" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"certifier_ref" text,
	"regulatory_category" text,
	"applied_date" date,
	"decision_date" date,
	"expiry_date" date,
	"availability_search_done" boolean DEFAULT false NOT NULL,
	"justification" text,
	"conditions" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_field_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"field_name" text NOT NULL,
	"status" text DEFAULT 'conventional' NOT NULL,
	"conversion_start_date" date,
	"certification_date" date,
	"certifier_ref" text,
	"parallel_production" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_fp_derogation_correspondence" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"derogation_id" integer NOT NULL,
	"correspondence_date" date NOT NULL,
	"direction" text DEFAULT 'outbound' NOT NULL,
	"correspondence_type" text NOT NULL,
	"summary" text NOT NULL,
	"reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_fp_derogation" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"input_name" text NOT NULL,
	"input_type" text NOT NULL,
	"regulatory_basis" text,
	"certifier" text,
	"certifier_ref" text,
	"availability_search_date" date,
	"availability_search_ref" text,
	"application_date" date,
	"decision_date" date,
	"status" text DEFAULT 'pending' NOT NULL,
	"approval_conditions" text,
	"expiry_date" date,
	"crop_year" integer,
	"justification" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"input_type" text,
	"supplier" text,
	"po_reference" text,
	"grn_reference" text,
	"approval_status" text DEFAULT 'permitted' NOT NULL,
	"certifier_approval_ref" text,
	"crop_year" integer,
	"date_of_use" date,
	"quantity_amount" text,
	"quantity_unit" text,
	"field_id" integer,
	"field_name" text,
	"justification" text,
	"certifier_notified" boolean DEFAULT false NOT NULL,
	"applied_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_inspection" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"certifier" text NOT NULL,
	"inspector_name" text,
	"inspection_date" date NOT NULL,
	"outcome" text DEFAULT 'pass' NOT NULL,
	"certificate_reference" text,
	"next_due_date" date,
	"non_conformances" text,
	"actions" text,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_livestock_conversion" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"species" text NOT NULL,
	"herd_flock_name" text NOT NULL,
	"number_of_animals" integer,
	"conversion_start_date" date NOT NULL,
	"expected_cert_date" date,
	"actual_cert_date" date,
	"status" text DEFAULT 'in-conversion' NOT NULL,
	"certifier" text,
	"certification_ref" text,
	"parallel_production" boolean DEFAULT false NOT NULL,
	"cert_document_path" text,
	"cert_document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_livestock_feed" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"feed_delivery_id" integer,
	"record_date" date NOT NULL,
	"species" text NOT NULL,
	"herd_flock_name" text,
	"feed_type" text NOT NULL,
	"feed_product_name" text NOT NULL,
	"supplier" text,
	"supplier_approval_number" text,
	"is_organic_approved" boolean DEFAULT true NOT NULL,
	"quantity_kg" numeric(10, 2),
	"organic_percentage" numeric(5, 2),
	"po_reference" text,
	"grn_reference" text,
	"certifier_approval_ref" text,
	"derogation_reference" text,
	"derogation_case_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_livestock_outdoor_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"field_id" integer,
	"record_date" date NOT NULL,
	"species" text NOT NULL,
	"herd_flock_name" text,
	"number_of_animals" integer,
	"pasture_area_hectares" numeric(10, 4),
	"stocking_density_per_ha" numeric(8, 2),
	"outdoor_access_hours_day" numeric(5, 2),
	"housing_start_date" date,
	"housing_end_date" date,
	"housing_justification" text,
	"compliance_status" text DEFAULT 'compliant' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_livestock_parallel_notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"conversion_id" integer NOT NULL,
	"notification_year" integer NOT NULL,
	"notified_date" date NOT NULL,
	"certifier_ref" text,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_livestock_treatment" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"medicine_record_id" integer,
	"herd_id" integer,
	"treatment_date" date NOT NULL,
	"species" text NOT NULL,
	"animal_ids" text,
	"number_of_animals" integer,
	"product_name" text NOT NULL,
	"product_category" text,
	"active_ingredient" text,
	"dose_amount" text,
	"route_of_administration" text,
	"vet_name" text,
	"prescription_ref" text,
	"standard_withdrawal_days" integer,
	"doubled_withdrawal_days" integer,
	"withdrawal_end_date" date,
	"certifier_notified" boolean DEFAULT false NOT NULL,
	"treatment_number" integer DEFAULT 1 NOT NULL,
	"max_allopathic_treatments_per_year" integer DEFAULT 3 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_vit_block_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"vineyard_block_id" integer,
	"block_name" text NOT NULL,
	"certifying_body" text,
	"status" text DEFAULT 'in-conversion' NOT NULL,
	"conversion_start_date" date,
	"fully_organic_date" date,
	"pre_conversion_land_use" text,
	"synthetic_history" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_vit_certificate" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"certifying_body" text NOT NULL,
	"certificate_number" text,
	"certificate_type" text,
	"issue_date" date,
	"expiry_date" date,
	"scope" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_vit_copper_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"block_name" text,
	"application_date" date NOT NULL,
	"product_name" text NOT NULL,
	"copper_content" text,
	"quantity_applied" text,
	"quantity_unit" text DEFAULT 'kg/ha',
	"area_ha" text,
	"copper_kg_applied" text,
	"application_method" text,
	"operator_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_vit_derogation_correspondence" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"derogation_id" integer NOT NULL,
	"correspondence_date" date NOT NULL,
	"direction" text DEFAULT 'outbound' NOT NULL,
	"correspondence_type" text NOT NULL,
	"summary" text NOT NULL,
	"reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_vit_derogation" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"input_name" text NOT NULL,
	"input_type" text NOT NULL,
	"regulatory_basis" text,
	"certifier" text,
	"certifier_ref" text,
	"availability_search_date" date,
	"availability_search_ref" text,
	"application_date" date,
	"decision_date" date,
	"status" text DEFAULT 'pending' NOT NULL,
	"approval_conditions" text,
	"expiry_date" date,
	"vintage_year" integer,
	"justification" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_vit_input_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"block_name" text,
	"product_name" text NOT NULL,
	"input_type" text NOT NULL,
	"supplier" text,
	"date_applied" date NOT NULL,
	"quantity" text,
	"unit" text,
	"area_ha" text,
	"vintage_year" integer,
	"approval_status" text DEFAULT 'permitted' NOT NULL,
	"certifier_approval_ref" text,
	"applied_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organic_vit_wine_production" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"vintage_year" integer NOT NULL,
	"wine_colour" text,
	"volume_litres" text,
	"certified_organic" integer DEFAULT 1 NOT NULL,
	"certifier_ref" text,
	"additive_name" text,
	"additive_type" text,
	"quantity_used" text,
	"quantity_unit" text,
	"max_permitted_level" text,
	"actual_so2_mg_l" text,
	"max_so2_mg_l" text,
	"so2_compliant" integer DEFAULT 1 NOT NULL,
	"regulatory_basis" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biodiversity_net_gain" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"assessor_name" text,
	"assessment_tool" text DEFAULT 'Defra Metric 4.0' NOT NULL,
	"habitat_type" text NOT NULL,
	"habitat_description" text,
	"area_ha" numeric(8, 4) NOT NULL,
	"baseline_condition" text NOT NULL,
	"target_condition" text,
	"baseline_units" numeric(8, 3),
	"target_units" numeric(8, 3),
	"net_gain_units" numeric(8, 3),
	"record_type" text DEFAULT 'baseline' NOT NULL,
	"planning_reference" text,
	"management_commitment_years" integer,
	"legal_agreement_type" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carbon_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"audit_year" integer NOT NULL,
	"audit_date" date NOT NULL,
	"conducted_by" text NOT NULL,
	"audit_tool" text,
	"supply_chain_requirement" text,
	"total_scope1_tonnes_co2e" numeric(10, 3),
	"total_scope2_tonnes_co2e" numeric(10, 3),
	"total_scope3_tonnes_co2e" numeric(10, 3),
	"total_tonnes_co2e" numeric(10, 3),
	"sequestration_tonnes_co2e" numeric(10, 3),
	"net_tonnes_co2e" numeric(10, 3),
	"intensity_per_tonne_prod" numeric(10, 3),
	"reduction_target_pct" numeric(5, 1),
	"certification_body" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carbon_emissions_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"audit_id" integer,
	"emission_year" integer NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"activity_description" text NOT NULL,
	"quantity" numeric(12, 3),
	"unit" text,
	"emission_factor_source" text,
	"tonnes_co2e" numeric(10, 4) NOT NULL,
	"scope" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carbon_reduction_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"action_title" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"target_reduction_tonnes_co2e" numeric(8, 3),
	"planned_start_date" date,
	"planned_completion_date" date,
	"actual_completion_date" date,
	"status" text DEFAULT 'planned' NOT NULL,
	"estimated_cost" numeric(10, 2),
	"funding_source" text,
	"responsible_person" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carbon_sequestration" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"audit_id" integer,
	"sequestration_year" integer NOT NULL,
	"feature_type" text NOT NULL,
	"feature_name" text,
	"area_ha_or_length_m" numeric(10, 3),
	"unit" text,
	"sequestration_factor_source" text,
	"tonnes_co2e_sequestered" numeric(10, 4) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renewable_energy_production" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"production_year" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"technology_type" text NOT NULL,
	"system_name" text,
	"installed_capacity_kw" numeric(8, 2),
	"generation_kwh" numeric(10, 2) NOT NULL,
	"self_consumed_kwh" numeric(10, 2),
	"exported_kwh" numeric(10, 2),
	"export_tariff_pence_per_kwh" numeric(6, 2),
	"export_revenue_gbp" numeric(10, 2),
	"fit_roc_reference" text,
	"co2_avoided_tonnes" numeric(8, 3),
	"meter_reading_start" numeric(12, 2),
	"meter_reading_end" numeric(12, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sustainability_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"report_year" integer NOT NULL,
	"generated_date" date NOT NULL,
	"report_title" text NOT NULL,
	"supply_chain_customer" text,
	"submitted_to_customer" boolean DEFAULT false,
	"submission_date" date,
	"customer_reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diversification_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"activity_name" text NOT NULL,
	"activity_type" text NOT NULL,
	"start_date" date NOT NULL,
	"planning_permission_ref" text,
	"planning_permission_granted" boolean,
	"insurance_policy_number" text,
	"insurance_renewal_date" date,
	"annual_turnover" numeric(12, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diversification_income_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"activity_id" integer,
	"income_date" date NOT NULL,
	"income_type" text NOT NULL,
	"description" text,
	"amount_net" numeric(12, 2) NOT NULL,
	"vat_rate" text DEFAULT 'exempt' NOT NULL,
	"vat_amount" numeric(10, 2),
	"customer_name" text,
	"invoice_ref" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equine_health_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"horse_id" integer NOT NULL,
	"event_date" date NOT NULL,
	"event_type" text NOT NULL,
	"vet_or_farrier_name" text,
	"treatment_given" text,
	"product_used" text,
	"batch_number" text,
	"withdrawal_period_days" integer,
	"cost" numeric(8, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equine_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"horse_name" text NOT NULL,
	"passport_number" text,
	"ueln_number" text,
	"breed" text,
	"colour" text,
	"sex" text,
	"date_of_birth" date,
	"microchip_number" text,
	"owner_name" text,
	"livery_type" text,
	"box" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_hygiene_inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"inspection_date" date NOT NULL,
	"relates_to" text,
	"inspector_name" text,
	"inspector_organisation" text,
	"inspection_type" text NOT NULL,
	"hygiene_rating" integer,
	"findings_summary" text,
	"corrective_actions" text,
	"reinspection_required" boolean DEFAULT false,
	"reinspection_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"unit_of_sale" text,
	"price_per_unit" numeric(8, 2),
	"cost_price" numeric(8, 2),
	"current_stock" numeric(10, 2) DEFAULT '0',
	"reorder_level" numeric(10, 2) DEFAULT '0',
	"allergens" text[],
	"country_of_origin" text,
	"best_before_days" integer,
	"storage_requirements" text,
	"food_business_reg_number" text,
	"active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"supplier_id" integer,
	"product_id" integer,
	"product_name" text NOT NULL,
	"purchase_date" date NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_of_purchase" text,
	"cost_per_unit" numeric(8, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"invoice_ref" text,
	"delivery_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"product_id" integer,
	"product_name" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_of_sale" text,
	"price_per_unit" numeric(8, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_sales_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"sale_date" date NOT NULL,
	"notes" text,
	"total_net" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_stocktake_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"product_id" integer,
	"product_name" text NOT NULL,
	"unit_of_sale" text,
	"expected_qty" numeric(10, 2) NOT NULL,
	"counted_qty" numeric(10, 2),
	"variance" numeric(10, 2),
	"cost_price" numeric(8, 2),
	"variance_value" numeric(12, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_stocktake_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"stocktake_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"completed_at" timestamp,
	"item_count" integer DEFAULT 0,
	"counted_count" integer DEFAULT 0,
	"total_variance_value" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_shop_suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"supplier_name" text NOT NULL,
	"contact_name" text,
	"phone" text,
	"email" text,
	"address" text,
	"account_ref" text,
	"payment_terms" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renewable_energy_installations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"installation_name" text NOT NULL,
	"technology_type" text NOT NULL,
	"installed_capacity_kw" numeric(8, 2),
	"installation_date" date,
	"installer_name" text,
	"grid_connection_ref" text,
	"fit_or_seg_contract_ref" text,
	"tariff_provider" text,
	"tariff_rate_pence" numeric(6, 2),
	"maintenance_contractor" text,
	"next_service_date" date,
	"notes" text,
	"panel_count" integer,
	"mcs_certificate_number" text,
	"installer_mcs_number" text,
	"building_name" text,
	"location_id" integer,
	"location_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renewable_energy_meter_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"installation_id" integer NOT NULL,
	"reading_date" date NOT NULL,
	"meter_reference" text,
	"generation_kwh" numeric(10, 2),
	"export_kwh" numeric(10, 2),
	"self_consumed_kwh" numeric(10, 2),
	"fit_payment_period" text,
	"fit_payment_amount" numeric(8, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shooting_and_game_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"shoot_date" date NOT NULL,
	"shoot_type" text NOT NULL,
	"organiser" text,
	"number_of_guns" integer,
	"gamekeeper_name" text,
	"bags_pheasant" integer DEFAULT 0,
	"bags_partridge" integer DEFAULT 0,
	"bags_grouse" integer DEFAULT 0,
	"bags_duck" integer DEFAULT 0,
	"bags_woodcock" integer DEFAULT 0,
	"bags_other" integer DEFAULT 0,
	"total_bag" integer DEFAULT 0,
	"game_dealer" text,
	"income_lease_fee" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solar_export_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"installation_id" integer,
	"payment_date" date NOT NULL,
	"period_from" date,
	"period_to" date,
	"export_kwh" numeric(10, 2),
	"rate_used_pence_per_kwh" numeric(6, 2),
	"payment_amount_pence" integer NOT NULL,
	"payment_reference" text,
	"supplier_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solar_installation_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"installation_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"document_type" text DEFAULT 'other' NOT NULL,
	"file_name" text NOT NULL,
	"storage_key" text NOT NULL,
	"notes" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borehole_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"licence_id" integer,
	"test_date" date NOT NULL,
	"testing_company" text,
	"static_water_level_m" numeric(8, 2),
	"pumping_water_level_m" numeric(8, 2),
	"specific_capacity_lps" numeric(8, 3),
	"bacteriological_result" text,
	"chemical_result" text,
	"overall_result" text NOT NULL,
	"report_reference" text,
	"corrective_action" text,
	"next_test_due_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cams_annual_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"licence_id" integer NOT NULL,
	"return_year" integer NOT NULL,
	"return_period_start" date NOT NULL,
	"return_period_end" date NOT NULL,
	"total_abstracted_m3" numeric(12, 0),
	"monthly_breakdown_json" text,
	"submitted_to_ea" boolean DEFAULT false NOT NULL,
	"submission_date" date,
	"ea_return_reference" text,
	"submitted_by" text,
	"compliance_status" text DEFAULT 'compliant' NOT NULL,
	"exceedance_notes" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drought_management_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"plan_year" integer NOT NULL,
	"plan_title" text NOT NULL,
	"drought_stage" text DEFAULT 'normal' NOT NULL,
	"restriction_level" text DEFAULT 'none' NOT NULL,
	"trigger_condition" text,
	"actions_taken" text,
	"alternative_source_available" boolean DEFAULT false,
	"alternative_source_description" text,
	"licence_id" integer,
	"ea_contact_name" text,
	"ea_contact_ref" text,
	"review_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "irrigation_equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"equipment_name" text NOT NULL,
	"equipment_type" text NOT NULL,
	"manufacturer" text,
	"serial_number" text,
	"application_rate_lph" numeric(10, 1),
	"uniformity_coefficient" numeric(5, 1),
	"last_calibration_date" date,
	"next_calibration_due" date,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "irrigation_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"licence_id" integer,
	"irrigation_date" date NOT NULL,
	"field_or_block_description" text NOT NULL,
	"area_irrigated_ha" numeric(8, 3),
	"crop_type" text,
	"growth_stage" text,
	"irrigation_method" text NOT NULL,
	"application_depth_mm" numeric(6, 1),
	"volume_applied_m3" numeric(10, 2),
	"soil_moisture_deficit_mm" numeric(6, 1),
	"rainfall_last_7_days_mm" numeric(6, 1),
	"operator_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soil_moisture_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"reading_date" date NOT NULL,
	"field_or_block_description" text NOT NULL,
	"sensor_id" text,
	"sensor_type" text,
	"depth_cm" integer,
	"moisture_percent" numeric(5, 1),
	"soil_moisture_deficit_mm" numeric(7, 1),
	"field_capacity_mm" numeric(7, 1),
	"wilting_point_mm" numeric(7, 1),
	"reading_method" text DEFAULT 'manual' NOT NULL,
	"recorded_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_abstraction_licences" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"licence_number" text NOT NULL,
	"issuing_authority" text DEFAULT 'Environment Agency' NOT NULL,
	"water_source" text NOT NULL,
	"abstraction_point_description" text,
	"purpose_of_use" text NOT NULL,
	"annual_licenced_volume_m3" numeric(10, 0),
	"daily_licenced_volume_m3" numeric(8, 0),
	"flow_rate_litres_per_sec" numeric(8, 2),
	"licence_start_date" date,
	"licence_expiry_date" date,
	"meter_required" boolean DEFAULT true,
	"meter_serial_number" text,
	"return_required" boolean DEFAULT true,
	"return_deadline" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_meter_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"licence_id" integer NOT NULL,
	"reading_date" date NOT NULL,
	"meter_reading" numeric(12, 2) NOT NULL,
	"volume_abstracted_m3" numeric(10, 2),
	"cumulative_ytd_m3" numeric(10, 2),
	"percent_of_annual_allocation" numeric(5, 1),
	"read_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_insurance_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"insurance_record_id" integer,
	"policy_type" text,
	"insurer" text,
	"incident_date" date,
	"reported_date" date,
	"claim_ref" text,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"settled_amount_pence" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_insurance_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"insurance_record_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"document_type" text DEFAULT 'other' NOT NULL,
	"document_path" text NOT NULL,
	"document_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_insurance" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"policy_type" text NOT NULL,
	"insurer" text,
	"policy_number" text,
	"policyholder_name" text,
	"cover_level_pence" integer,
	"annual_premium_pence" integer,
	"start_date" date,
	"expiry_date" date,
	"renewal_date" date,
	"broker" text,
	"broker_contact" text,
	"covers_third_party_goods" boolean DEFAULT false NOT NULL,
	"covers_contract_work" boolean DEFAULT false NOT NULL,
	"covers_employer_liability" boolean DEFAULT false NOT NULL,
	"last_reviewed_date" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"superseded_by_renewal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_planner_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" timestamp with time zone NOT NULL,
	"colour" text DEFAULT 'slate' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"scheme_name" text NOT NULL,
	"scheme_type" text DEFAULT 'FETF' NOT NULL,
	"item_reference_code" text,
	"item_description" text,
	"application_reference" text,
	"approval_agreement_reference" text,
	"application_date" date,
	"approval_date" date,
	"purchase_deadline" date,
	"claim_deadline" date,
	"grant_amount_pence" integer,
	"actual_cost_pence" integer,
	"status" text DEFAULT 'applied' NOT NULL,
	"linked_equipment_id" integer,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tank_id" integer,
	"supplier_id" integer,
	"delivery_date" timestamp with time zone NOT NULL,
	"fuel_type" text DEFAULT 'red_diesel' NOT NULL,
	"quantity_litres" numeric(10, 2) NOT NULL,
	"unit_price_pence" integer,
	"total_cost_pence" integer,
	"invoice_reference" text,
	"delivery_note_number" text,
	"supplier_name" text,
	"driver_name" text,
	"qualifying_use" text DEFAULT 'agriculture' NOT NULL,
	"document_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_stock_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tank_id" integer NOT NULL,
	"check_date" date NOT NULL,
	"measured_litres" numeric(10, 2) NOT NULL,
	"calculated_litres" numeric(10, 2),
	"variance_litres" numeric(10, 2),
	"checked_by" text,
	"method" text DEFAULT 'dip_stick' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_storage_inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tank_id" integer,
	"inspection_date" date NOT NULL,
	"inspector" text,
	"overall_result" text DEFAULT 'pass' NOT NULL,
	"bunding_ok" boolean,
	"labelling_ok" boolean,
	"spill_kit_present" boolean,
	"spill_kit_complete" boolean,
	"tank_condition_ok" boolean,
	"pipework_ok" boolean,
	"fill_point_locked" boolean,
	"overfill_protection_ok" boolean,
	"drainage_risk_ok" boolean,
	"issues_found" text,
	"actions_required" text,
	"next_inspection_due" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_tanks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"fuel_type" text DEFAULT 'red_diesel' NOT NULL,
	"capacity_litres" numeric(10, 2) NOT NULL,
	"current_stock_litres" numeric(10, 2) DEFAULT '0' NOT NULL,
	"location" text,
	"is_bunded" boolean DEFAULT false NOT NULL,
	"bund_capacity_litres" numeric(10, 2),
	"tank_material" text,
	"install_date" date,
	"last_inspection_date" date,
	"next_inspection_due" date,
	"supplier_id" integer,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"tank_id" integer,
	"tank_name" text,
	"usage_date" timestamp with time zone NOT NULL,
	"quantity_litres" numeric(10, 2) NOT NULL,
	"purpose" text NOT NULL,
	"qualifying_activity" text DEFAULT 'agriculture' NOT NULL,
	"equipment_id" integer,
	"vehicle_name" text,
	"field_id" integer,
	"recorded_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grid_energy_meters" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"meter_type" text NOT NULL,
	"meter_reference" text,
	"mpan" text,
	"mprn" text,
	"supplier" text,
	"account_number" text,
	"location" text,
	"tariff_name" text,
	"standing_charge_pence_per_day" integer,
	"unit_rate_pence_per_kwh" integer,
	"export_tariff_pence_per_kwh" integer,
	"linked_to_renewable" boolean DEFAULT false NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grid_energy_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"meter_id" integer NOT NULL,
	"reading_date" date NOT NULL,
	"meter_reading" numeric(12, 2) NOT NULL,
	"consumption_kwh" numeric(10, 2),
	"consumption_units" numeric(10, 2),
	"export_kwh" numeric(10, 2),
	"cost_pence" integer,
	"reading_type" text DEFAULT 'actual' NOT NULL,
	"recorded_by" text,
	"invoice_reference" text,
	"billing_period_start" date,
	"billing_period_end" date,
	"document_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"supplier_id" integer,
	"po_id" integer,
	"feed_stock_item_id" integer,
	"delivery_date" timestamp with time zone NOT NULL,
	"supplier_name" text NOT NULL,
	"ufas_number_on_note" text,
	"femas_number_on_note" text,
	"delivery_note_number" text,
	"invoice_reference" text,
	"feed_type" text NOT NULL,
	"product_name" text,
	"batch_number" text,
	"lot_number" text,
	"quantity_kg" numeric(10, 2) NOT NULL,
	"cost_pence" integer,
	"storage_location" text,
	"best_before_date" date,
	"medicated_feed" boolean DEFAULT false NOT NULL,
	"medication_details" text,
	"withdrawal_period_days" integer,
	"species_intended" text,
	"received_by" text,
	"notes" text,
	"is_organic_approved" boolean DEFAULT false NOT NULL,
	"organic_supplier_approval_number" text,
	"organic_percentage" numeric(5, 2),
	"non_organic_ingredient_derogation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"po_number" text NOT NULL,
	"supplier_id" integer,
	"supplier_name" text,
	"product_name" text NOT NULL,
	"feed_type" text,
	"species_intended" text,
	"quantity_kg" numeric(10, 2) NOT NULL,
	"feed_stock_item_id" integer,
	"order_date" date NOT NULL,
	"expected_delivery_date" date,
	"actual_delivery_date" date,
	"status" text DEFAULT 'sent' NOT NULL,
	"ordered_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_stock_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"feed_type" text NOT NULL,
	"product_name" text,
	"storage_location" text,
	"current_stock_kg" numeric(10, 2) DEFAULT '0' NOT NULL,
	"capacity_kg" numeric(10, 2),
	"reorder_threshold_kg" numeric(10, 2),
	"species_intended" text,
	"supplier_name" text,
	"awaiting_delivery" boolean DEFAULT false NOT NULL,
	"expected_delivery_date" date,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "disease_incident_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"incident_date" timestamp with time zone NOT NULL,
	"reported_by" text,
	"incident_type" text NOT NULL,
	"species" text,
	"animal_count" integer,
	"affected_herds" text,
	"ear_tags_affected" text,
	"symptoms_observed" text NOT NULL,
	"onset_date" date,
	"suspected_diagnosis" text,
	"confirmed_diagnosis" text,
	"is_notifiable_disease" boolean DEFAULT false NOT NULL,
	"notifiable_disease_type" text,
	"vet_called" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"vet_call_date" date,
	"vet_visit_date" date,
	"vet_advice" text,
	"treatment_given" text,
	"prescription_ref" text,
	"isolation_applied" boolean DEFAULT false NOT NULL,
	"isolation_date" date,
	"isolation_location" text,
	"movement_restricted" boolean DEFAULT false NOT NULL,
	"movement_restriction_date" date,
	"movement_restriction_details" text,
	"cleaning_disinfection_carried_out" boolean DEFAULT false NOT NULL,
	"reported_to_apha" boolean DEFAULT false NOT NULL,
	"apha_ref" text,
	"apha_notified_date" date,
	"apha_inspection_date" date,
	"official_movement_order_issued" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_date" date,
	"outcome_summary" text,
	"mortality_count" integer,
	"mortality_animal_ids" text,
	"affected_animal_ids" text,
	"lesson_learned" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_contingency_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"minimum_stock_days_target" integer,
	"alert_threshold_kg" numeric(10, 2),
	"daily_consumption_kg" numeric(10, 2),
	"primary_supplier_name" text,
	"primary_supplier_phone" text,
	"primary_supplier_email" text,
	"alternative_suppliers" text,
	"emergency_contacts" text,
	"trigger_conditions" text,
	"immediate_actions" text,
	"rationing_procedures" text,
	"communication_plan" text,
	"record_keeping_during_incident" text,
	"recovery_actions" text,
	"plan_author" text,
	"approved_by" text,
	"last_reviewed_date" date,
	"next_review_date" date,
	"version_number" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_recall_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"raised_date" timestamp with time zone DEFAULT now() NOT NULL,
	"raised_by" text,
	"product_name" text,
	"feed_type" text,
	"supplier_name" text,
	"feed_batch_ref" text,
	"delivery_note_ref" text,
	"quantity_kg_affected" numeric(10, 2),
	"concern_type" text,
	"reason_for_concern" text NOT NULL,
	"recall_notice_ref" text,
	"recall_document_url" text,
	"feed_withdrawn" boolean DEFAULT false NOT NULL,
	"withdrawal_date" date,
	"affected_herds" text,
	"estimated_animals_affected" integer,
	"animal_health_impact_observed" boolean DEFAULT false NOT NULL,
	"health_impact_description" text,
	"actions_taken" text,
	"feed_disposal_method" text,
	"replacement_feed_source" text,
	"reported_to_supplier" boolean DEFAULT false NOT NULL,
	"supplier_notified_date" date,
	"supplier_reference" text,
	"reported_to_authority" boolean DEFAULT false NOT NULL,
	"authority_name" text,
	"authority_reference" text,
	"authority_notified_date" date,
	"reported_to_vet" boolean DEFAULT false NOT NULL,
	"vet_name" text,
	"vet_notified_date" date,
	"credit_note_required" boolean DEFAULT false NOT NULL,
	"credit_note_ref" text,
	"credit_note_value_gbp" numeric(10, 2),
	"credit_note_received_date" date,
	"credit_note_status" text,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_date" date,
	"resolution_summary" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_stock_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"species" text NOT NULL,
	"label" text,
	"daily_consumption_kg" numeric(10, 2) NOT NULL,
	"minimum_stock_days_target" integer NOT NULL,
	"alert_threshold_kg" numeric(10, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_trial_observations" (
	"id" serial PRIMARY KEY NOT NULL,
	"plot_id" integer NOT NULL,
	"trial_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"observation_date" date NOT NULL,
	"growth_stage" text,
	"plant_count" integer,
	"plant_height_cm" numeric(6, 1),
	"lodging_percent" numeric(5, 1),
	"disease_present" boolean DEFAULT false,
	"disease_name" text,
	"disease_severity" text,
	"pest_present" boolean DEFAULT false,
	"pest_name" text,
	"general_condition" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_trial_plots" (
	"id" serial PRIMARY KEY NOT NULL,
	"trial_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"plot_number" text NOT NULL,
	"treatment_label" text,
	"is_control" boolean DEFAULT false NOT NULL,
	"area_ha" numeric(8, 4),
	"location_description" text,
	"replication_block" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_trial_treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"plot_id" integer NOT NULL,
	"trial_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"treatment_date" date NOT NULL,
	"treatment_type" text NOT NULL,
	"product_name" text,
	"active_ingredient" text,
	"application_rate" numeric(10, 3),
	"unit" text,
	"water_volume_l" numeric(8, 1),
	"operator" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_trial_yields" (
	"id" serial PRIMARY KEY NOT NULL,
	"plot_id" integer NOT NULL,
	"trial_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"harvest_date" date NOT NULL,
	"fresh_weight_kg" numeric(10, 2),
	"moisture_percent" numeric(5, 2),
	"adjusted_dry_weight_kg" numeric(10, 2),
	"yield_tha" numeric(8, 3),
	"grain_protein_percent" numeric(5, 2),
	"specific_weight" numeric(5, 1),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_trials" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"field_id" integer,
	"trial_name" text NOT NULL,
	"season" text,
	"crop_name" text,
	"trial_purpose" text NOT NULL,
	"trial_type" text,
	"trials_body" text,
	"contact_name" text,
	"number_of_treatments" integer,
	"number_of_replications" integer,
	"total_area_ha" numeric(8, 4),
	"start_date" date,
	"end_date" date,
	"status" text DEFAULT 'planned' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direct_sales_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"sale_date" timestamp with time zone NOT NULL,
	"customer_id" integer,
	"channel" text NOT NULL,
	"product_name" text NOT NULL,
	"product_category" text,
	"quantity" numeric(10, 3) NOT NULL,
	"unit" text NOT NULL,
	"unit_price_pence" integer NOT NULL,
	"gross_value_pence" integer NOT NULL,
	"vat_pence" integer,
	"vat_rate" text,
	"net_value_pence" integer,
	"payment_method" text,
	"payment_status" text DEFAULT 'paid' NOT NULL,
	"customer_name" text,
	"customer_ref" text,
	"invoice_number" text,
	"market_name" text,
	"packing_ref" text,
	"certification_ref" text,
	"notes" text,
	"shop_sale_session_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "egg_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"week_ending" timestamp with time zone NOT NULL,
	"packing_station_id" integer,
	"packing_station" text,
	"sales_channel" text DEFAULT 'packing_station' NOT NULL,
	"flock_ref" text,
	"dozens_collected" numeric(10, 2),
	"dozens_delivered" numeric(10, 2),
	"grade_a_dozens" numeric(10, 2),
	"grade_b_dozens" numeric(10, 2),
	"crack_waste_dozens" numeric(10, 2),
	"lay_rate_pct" numeric(5, 2),
	"price_per_dozen_pence" integer,
	"gross_value_pence" integer,
	"deductions_pence" integer,
	"net_value_pence" integer,
	"payment_date" timestamp with time zone,
	"egg_type" text DEFAULT 'free_range' NOT NULL,
	"packing_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"sale_date" timestamp with time zone NOT NULL,
	"sale_type" text DEFAULT 'spot' NOT NULL,
	"buyer_id" integer,
	"buyer" text NOT NULL,
	"merchant_ref" text,
	"commodity" text NOT NULL,
	"variety" text,
	"tonnage" numeric(10, 2) NOT NULL,
	"price_per_tonne_pence" integer,
	"pool_bonus_pence" integer,
	"gross_value_pence" integer,
	"deductions_pence" integer,
	"net_value_pence" integer,
	"moisture" numeric(5, 2),
	"specific_weight" numeric(5, 1),
	"protein" numeric(5, 2),
	"screenings" numeric(5, 2),
	"grade_achieved" text,
	"quality_spec" text,
	"delivery_date" timestamp with time zone,
	"delivery_location" text,
	"haulier_name" text,
	"vehicle_reg" text,
	"weighbridge_ticket" text,
	"invoice_number" text,
	"payment_date" timestamp with time zone,
	"linked_contract_id" integer,
	"crop_year" text,
	"field" text,
	"store_bin" text,
	"store_bin_id" integer,
	"haulage_record_id" integer,
	"is_organic_certified" boolean DEFAULT false NOT NULL,
	"organic_cert_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_deadweight_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"kill_date" timestamp with time zone NOT NULL,
	"processor_id" integer,
	"processor" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"head_count" integer NOT NULL,
	"total_deadweight_kg" numeric(10, 2),
	"average_deadweight_kg" numeric(8, 2),
	"price_per_kg_pence" integer,
	"grade_classification" text,
	"fat_class" text,
	"conformation_class" text,
	"kill_sheet_ref" text,
	"abattoir_ref" text,
	"gross_value_pence" integer,
	"transport_deduction_pence" integer,
	"levy_deduction_pence" integer,
	"other_deductions_pence" integer,
	"net_payment_pence" integer,
	"payment_date" timestamp with time zone,
	"red_tractor_assured" boolean DEFAULT false,
	"organic_certified" boolean DEFAULT false,
	"premium_scheme_name" text,
	"premium_pence" integer,
	"vendor_declaration_ref" text,
	"animal_ids" text,
	"movement_id" integer,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_mart_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"sale_date" timestamp with time zone NOT NULL,
	"mart_id" integer,
	"mart_name" text NOT NULL,
	"mart_location" text,
	"species" text NOT NULL,
	"category" text,
	"lot_number" text,
	"head_count" integer NOT NULL,
	"average_liveweight_kg" numeric(8, 2),
	"price_type" text DEFAULT 'per_head' NOT NULL,
	"price_per_unit_pence" integer,
	"gross_value_pence" integer,
	"commission_pence" integer,
	"levy_pence" integer,
	"transport_cost_pence" integer,
	"other_costs_pence" integer,
	"net_payment_pence" integer,
	"buyer_name" text,
	"buyer_number" text,
	"auctioneer_ref" text,
	"payment_date" timestamp with time zone,
	"vendor_declaration_ref" text,
	"animal_ids" text,
	"movement_id" integer,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milk_statements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"statement_month" text NOT NULL,
	"buyer_id" integer,
	"buyer" text NOT NULL,
	"cph_number" text,
	"litres_supplied" numeric(12, 2),
	"pence_per_litre" numeric(8, 4),
	"gross_value_pence" integer,
	"butterfat_pct" numeric(5, 3),
	"protein_pct" numeric(5, 3),
	"scc" integer,
	"bactoscan" integer,
	"butterfat_bonus_pence" integer,
	"protein_bonus_pence" integer,
	"quality_bonus_pence" integer,
	"quality_penalty_pence" integer,
	"scc_penalty_pence" integer,
	"bactoscan_penalty_pence" integer,
	"transport_deduction_pence" integer,
	"membership_deduction_pence" integer,
	"other_deductions_pence" integer,
	"net_payment_pence" integer,
	"payment_date" timestamp with time zone,
	"organic_premium_pence" integer,
	"sustainability_bonus_pence" integer,
	"statement_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pig_kill_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"kill_date" timestamp with time zone NOT NULL,
	"processor_id" integer,
	"processor" text NOT NULL,
	"head_count" integer NOT NULL,
	"total_deadweight_kg" numeric(10, 2),
	"average_deadweight_kg" numeric(8, 2),
	"price_per_kg_pence" integer,
	"gross_value_pence" integer,
	"levy_deduction_pence" integer,
	"transport_deduction_pence" integer,
	"other_deductions_pence" integer,
	"net_payment_pence" integer,
	"payment_date" timestamp with time zone,
	"average_p2_backfat_mm" numeric(5, 1),
	"average_muscle_depth_mm" numeric(5, 1),
	"lean_meat_pct" numeric(5, 2),
	"grade_out" text,
	"p2_distribution" text,
	"spp_price_kg_pence" integer,
	"spp_variance_pence" integer,
	"kill_sheet_ref" text,
	"herd_mark" text,
	"premium_scheme" text,
	"premium_pence" integer,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_batch_settlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_ref" text NOT NULL,
	"integrator_id" integer,
	"integrator_name" text NOT NULL,
	"species" text DEFAULT 'broiler' NOT NULL,
	"placement_date" timestamp with time zone,
	"catch_date" timestamp with time zone,
	"birds_placed" integer,
	"birds_delivered" integer,
	"mortality_pct" numeric(5, 2),
	"average_liveweight_kg" numeric(8, 3),
	"total_liveweight_kg" numeric(12, 2),
	"fcr" numeric(6, 3),
	"ebi" numeric(8, 2),
	"settlement_rate_pence" integer,
	"gross_value_pence" integer,
	"bonus_pence" integer,
	"penalty_pence" integer,
	"catching_cost_pence" integer,
	"other_deductions_pence" integer,
	"net_payment_pence" integer,
	"payment_date" timestamp with time zone,
	"slaughterhouse_name" text,
	"settlement_ref" text,
	"chick_days_survived" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_hire_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"equipment_id" integer NOT NULL,
	"agreement_id" integer,
	"booking_ref" text,
	"start_date" date NOT NULL,
	"planned_end_date" date,
	"actual_end_date" date,
	"rate_type" text DEFAULT 'daily' NOT NULL,
	"rate_pence" integer,
	"deposit_pence" integer,
	"operator_type" text DEFAULT 'customer_operated' NOT NULL,
	"operator_name" text,
	"fuel_policy" text DEFAULT 'customer_supplied' NOT NULL,
	"insurance_verified" boolean DEFAULT false NOT NULL,
	"insurance_notes" text,
	"deposit_paid" boolean DEFAULT false NOT NULL,
	"deposit_paid_date" date,
	"status" text DEFAULT 'booked' NOT NULL,
	"total_hire_cost_pence" integer,
	"job_reference" text,
	"field_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_hire_condition_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"booking_id" integer NOT NULL,
	"log_type" text NOT NULL,
	"log_date" date NOT NULL,
	"log_time" text,
	"hours_reading" integer,
	"fuel_level_percent" integer,
	"condition_overall" text,
	"condition_notes" text,
	"damage_notes" text,
	"tyre_condition_notes" text,
	"attachment_notes" text,
	"signed_off_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_hire_fuel_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"booking_id" integer NOT NULL,
	"issue_date" date NOT NULL,
	"litres" numeric(8, 2) NOT NULL,
	"price_per_litre_pence" integer,
	"total_cost_pence" integer,
	"billed_to_customer" boolean DEFAULT true NOT NULL,
	"issued_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"contact_phone" text,
	"contact_email" text,
	"address" text,
	"holding_number" text,
	"vat_number" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"agreement_type" text DEFAULT 'grain_storage' NOT NULL,
	"title" text NOT NULL,
	"reference_number" text,
	"start_date" date,
	"end_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"area_ha" numeric(10, 4),
	"annual_rent_pence" integer,
	"rent_per_ha_pence" integer,
	"payment_frequency" text,
	"next_payment_date" date,
	"storage_location_id" integer,
	"max_tonnes_contracted" numeric(10, 2),
	"storage_rate_ppt_week" numeric(8, 4),
	"intake_charge_ppt" numeric(8, 4),
	"outloading_charge_ppt" numeric(8, 4),
	"drying_charge_ppt" numeric(8, 4),
	"day_rate_pence" integer,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_invoice_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2),
	"unit" text,
	"unit_price_pence" integer NOT NULL,
	"line_total_pence" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"agreement_id" integer,
	"invoice_number" text,
	"invoice_date" date NOT NULL,
	"due_date" date,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal_pence" integer DEFAULT 0 NOT NULL,
	"vat_rate_percent" numeric(5, 2) DEFAULT '20' NOT NULL,
	"vat_pence" integer DEFAULT 0 NOT NULL,
	"total_pence" integer DEFAULT 0 NOT NULL,
	"payment_date" date,
	"payment_method" text,
	"payment_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "third_party_grain_intakes" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"agreement_id" integer,
	"storage_location_id" integer,
	"intake_date" date NOT NULL,
	"commodity" text NOT NULL,
	"variety" text,
	"quantity_tonnes" numeric(10, 2) NOT NULL,
	"moisture_percent" numeric(5, 2),
	"screenings_percent" numeric(5, 2),
	"specific_weight_kg_hl" numeric(5, 2),
	"grade" text,
	"lot_reference" text,
	"delivery_note_ref" text,
	"vehicle_reg" text,
	"haulier" text,
	"transport_arranged_by" text DEFAULT 'customer' NOT NULL,
	"haulier_id" integer,
	"bay_or_bin" text,
	"status" text DEFAULT 'in_store' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "third_party_grain_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"intake_id" integer NOT NULL,
	"movement_date" date NOT NULL,
	"movement_type" text NOT NULL,
	"quantity_tonnes" numeric(10, 2) NOT NULL,
	"destination" text,
	"vehicle_reg" text,
	"haulier" text,
	"transport_arranged_by" text DEFAULT 'customer' NOT NULL,
	"haulier_id" integer,
	"delivery_note_ref" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vet_invoice_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"line_type" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 3) DEFAULT '1',
	"unit_price_gbp" numeric(10, 2),
	"line_total_gbp" numeric(10, 2) NOT NULL,
	"visit_id" integer,
	"medicine_record_id" integer,
	"is_matched" boolean DEFAULT false NOT NULL,
	"match_note" text
);
--> statement-breakpoint
CREATE TABLE "vet_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_date" date NOT NULL,
	"vet_practice" text NOT NULL,
	"vet_name" text,
	"total_amount_gbp" numeric(10, 2) NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"payment_date" date,
	"payment_reference" text,
	"reconciliation_status" text DEFAULT 'unreconciled' NOT NULL,
	"invoice_document_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vet_visit_medicines" (
	"id" serial PRIMARY KEY NOT NULL,
	"visit_id" integer NOT NULL,
	"medicine_record_id" integer,
	"medicine_name" text NOT NULL,
	"batch_number" text,
	"quantity_used" numeric(10, 3),
	"unit" text,
	"withdrawal_period_days" integer,
	"vet_dispensed" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "vet_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"visit_date" date NOT NULL,
	"vet_name" text NOT NULL,
	"vet_practice" text,
	"reason_for_visit" text NOT NULL,
	"herd_ids" text,
	"animal_ids" text,
	"diagnoses" text,
	"treatments_carried_out" text,
	"prescriptions_issued" text,
	"follow_up_actions" text,
	"follow_up_due_date" date,
	"disease_incident_id" integer,
	"time_on_farm_minutes" integer,
	"call_out_fee_gbp" numeric(10, 2),
	"estimated_total_gbp" numeric(10, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"excerpt" text,
	"published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "help_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contractor_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"phone" text,
	"email" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contractor_rams" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"activity_description" text NOT NULL,
	"document_url" text,
	"document_name" text,
	"received_date" date,
	"reviewed_by" text,
	"review_date" date,
	"notes" text,
	"pending_review_task_id" integer,
	"pending_review_task_staff_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"trade_type" text NOT NULL,
	"address" text,
	"contact_name" text,
	"phone" text,
	"email" text,
	"supplier_id" integer,
	"pli_number" text,
	"pli_insurer" text,
	"pli_cover_amount_gbp" numeric(12, 2),
	"pli_expiry_date" date,
	"pli_document_url" text,
	"pli_document_name" text,
	"rams_received" boolean DEFAULT false NOT NULL,
	"rams_received_date" date,
	"rams_reviewed_by" text,
	"rams_document_url" text,
	"rams_document_name" text,
	"first_on_site_date" date,
	"last_on_site_date" date,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ppe_issue_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"staff_name" text NOT NULL,
	"staff_user_id" text,
	"ppe_type" text NOT NULL,
	"description" text,
	"size" text,
	"supplier" text,
	"stock_item_id" integer,
	"date_issued" date NOT NULL,
	"condition_check_date" date,
	"condition_at_check" text,
	"replaced_date" date,
	"replaced_reason" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ppe_risk_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_ref" text,
	"ppe_type" text NOT NULL,
	"hazard_identified" text NOT NULL,
	"task_or_area" text,
	"risk_level" text,
	"ppe_specification" text,
	"fit_confirmed" boolean DEFAULT false NOT NULL,
	"fit_confirmed_by" text,
	"fit_confirmed_date" date,
	"compatibility_checked" boolean DEFAULT false NOT NULL,
	"compatibility_notes" text,
	"training_provided" boolean DEFAULT false NOT NULL,
	"training_notes" text,
	"assessed_by" text NOT NULL,
	"assessment_date" date NOT NULL,
	"review_date" date,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ppe_stock_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"ppe_type" text NOT NULL,
	"description" text,
	"size" text,
	"quantity_received" integer DEFAULT 0 NOT NULL,
	"quantity_in_stock" integer DEFAULT 0 NOT NULL,
	"unit_cost_pence" integer,
	"supplier_id" integer,
	"supplier_name" text,
	"invoice_ref" text,
	"delivery_note_ref" text,
	"received_date" date,
	"batch_number" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_dipping_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"dip_date" date NOT NULL,
	"product_name" text NOT NULL,
	"mapp_number" text,
	"active_ingredient" text,
	"dip_type" text DEFAULT 'plunge' NOT NULL,
	"dip_concentration_pct" numeric(6, 3),
	"volume_of_dip_litres" numeric(10, 2),
	"sheep_count" integer NOT NULL,
	"herd_flock_ref" text,
	"operator_name" text NOT NULL,
	"operator_cert_number" text,
	"operator_cert_expiry" date,
	"bath_fill_date" date,
	"days_since_last_use" integer,
	"top_up_volume_added" numeric(10, 2),
	"disposal_method" text,
	"disposal_quantity_litres" numeric(10, 2),
	"disposal_date" date,
	"disposal_contractor_name" text,
	"disposal_waste_transfer_note_ref" text,
	"withdrawal_period_days" integer,
	"withdrawal_clear_date" date,
	"stock_item_id" integer,
	"quantity_used" numeric(10, 3),
	"document_path" text,
	"document_url" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"test_date" date NOT NULL,
	"reading_date" date,
	"test_type" text NOT NULL,
	"species" text DEFAULT 'cattle' NOT NULL,
	"herd_flock_ref" text,
	"animals_tested" integer,
	"reactors" integer DEFAULT 0 NOT NULL,
	"inconclusives" integer DEFAULT 0 NOT NULL,
	"outcome" text NOT NULL,
	"apha_officer" text,
	"apha_case_ref" text,
	"movement_restriction" boolean DEFAULT false NOT NULL,
	"restriction_lifted_date" date,
	"next_test_due_date" date,
	"testing_vet" text,
	"document_url" text,
	"document_name" text,
	"document_path" text,
	"herd_id" integer,
	"animal_ear_tags" text,
	"movement_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "welfare_outcome_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"assessor_name" text NOT NULL,
	"assessor_role" text,
	"species" text NOT NULL,
	"herd_flock_ref" text,
	"sample_size" integer,
	"lameness_score" text,
	"body_condition_score" text,
	"dung_score" text,
	"skin_lesion_score" text,
	"nasal_discharge_score" text,
	"eye_discharge_score" text,
	"mortality_rate" text,
	"calving_lambing_score" text,
	"overall_outcome" text NOT NULL,
	"corrective_actions" text,
	"target_date" date,
	"next_assessment_due" date,
	"document_url" text,
	"document_name" text,
	"document_path" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_cull_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"cull_date" date NOT NULL,
	"number_culled" integer NOT NULL,
	"age_class" text,
	"reason_for_culling" text NOT NULL,
	"destination" text NOT NULL,
	"destination_cph" text,
	"average_live_weight_kg" numeric(6, 2),
	"price_per_head_gbp" numeric(8, 2),
	"total_value_gbp" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_disease_monitoring" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"monitoring_date" date NOT NULL,
	"monitoring_type" text NOT NULL,
	"scheme_reference" text,
	"testing_body" text,
	"number_of_samples" integer,
	"positive_results" integer DEFAULT 0,
	"negative_results" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"actions_taken" text,
	"next_test_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_flocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_name" text NOT NULL,
	"flock_number" text,
	"cph_number" text,
	"breed" text,
	"flock_type" text DEFAULT 'breeding' NOT NULL,
	"ewes_count" integer DEFAULT 0 NOT NULL,
	"rams_count" integer DEFAULT 0 NOT NULL,
	"lambs_count" integer DEFAULT 0 NOT NULL,
	"hoggets_count" integer DEFAULT 0 NOT NULL,
	"eid_tag_range" text,
	"location" text,
	"is_organic_flock" boolean DEFAULT false NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_red_tractor_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"assessor_name" text,
	"assessor_organisation" text,
	"certificate_number" text,
	"certificate_expiry_date" date,
	"flock_registration_current" boolean DEFAULT false,
	"tag_records_complete" boolean DEFAULT false,
	"movement_records_complete" boolean DEFAULT false,
	"medicine_records_complete" boolean DEFAULT false,
	"vet_health_plan_in_place" boolean DEFAULT false,
	"withdrawal_periods_recorded" boolean DEFAULT false,
	"prescriptions_on_file" boolean DEFAULT false,
	"mortality_records_complete" boolean DEFAULT false,
	"welfare_checks_recorded" boolean DEFAULT false,
	"lameness_scored" boolean DEFAULT false,
	"castration_tail_docking_recorded" boolean DEFAULT false,
	"disbudding_recorded" boolean DEFAULT false,
	"feed_records_complete" boolean DEFAULT false,
	"water_access_adequate" boolean DEFAULT false,
	"biosecurity_plan_in_place" boolean DEFAULT false,
	"visitor_log_maintained" boolean DEFAULT false,
	"scrapie_monitoring" boolean DEFAULT false,
	"staff_training_records" boolean DEFAULT false,
	"emergency_slaughter_competency" boolean DEFAULT false,
	"manure_management_plan" boolean DEFAULT false,
	"overall_status" text DEFAULT 'in-progress' NOT NULL,
	"non_conformances_count" integer DEFAULT 0,
	"non_conformance_details" text,
	"corrective_action_deadline" date,
	"next_assessment_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_scanning_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"scan_date" date NOT NULL,
	"scanner_name" text,
	"scanner_company" text,
	"total_ewes_scanned" integer NOT NULL,
	"ewes_barren" integer DEFAULT 0 NOT NULL,
	"ewes_singles" integer DEFAULT 0 NOT NULL,
	"ewes_doubles" integer DEFAULT 0 NOT NULL,
	"ewes_triples" integer DEFAULT 0 NOT NULL,
	"ewes_quads" integer DEFAULT 0 NOT NULL,
	"expected_total_lambs" integer,
	"scanning_percentage" numeric(5, 1),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_shearing_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"shearing_date" date NOT NULL,
	"contractor" text,
	"number_of_animals_sheared" integer NOT NULL,
	"total_fleeces_kg" numeric(8, 2),
	"average_fleece_kg" numeric(5, 2),
	"wool_grade" text,
	"wool_marketing_org" text,
	"wool_collection_ref" text,
	"price_per_kg_gbp" numeric(6, 3),
	"total_value_gbp" numeric(10, 2),
	"foot_bathing_carried_out" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_tupping_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"tupping_start_date" date NOT NULL,
	"tupping_end_date" date,
	"ram_ear_tag" text,
	"ram_breed" text,
	"ram_owner" text,
	"ram_hired_or_owned" text DEFAULT 'owned',
	"number_ewes_introduced" integer,
	"expected_lambing_date" date,
	"progesterone_sponge_used" boolean DEFAULT false,
	"raddle_colour_used" text,
	"mating_method" text DEFAULT 'natural',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_vaccination_programmes" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"vaccination_date" date NOT NULL,
	"vaccine_product" text NOT NULL,
	"vaccination_category" text NOT NULL,
	"batch_number" text,
	"expiry_date" date,
	"number_treated" integer NOT NULL,
	"age_class_treated" text,
	"dose_volume_ml" numeric(5, 2),
	"administration_route" text,
	"administered_by" text,
	"vet_name" text,
	"next_due_date" date,
	"withdrawal_period_days" integer,
	"withdrawal_end_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sheep_weigh_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"flock_id" integer,
	"weigh_date" date NOT NULL,
	"weigh_type" text DEFAULT 'routine' NOT NULL,
	"weighed_by" text,
	"age_class_weighed" text,
	"number_weighed" integer NOT NULL,
	"average_weight_kg" numeric(6, 2),
	"lowest_weight_kg" numeric(6, 2),
	"highest_weight_kg" numeric(6, 2),
	"target_weight_kg" numeric(6, 2),
	"dlwg_g_per_day" numeric(7, 1),
	"previous_weigh_date" date,
	"previous_average_weight_kg" numeric(6, 2),
	"drafted_for_sale_count" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beef_animal_weigh_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"weigh_record_id" integer NOT NULL,
	"animal_id" integer,
	"ear_tag_number" text,
	"weight_kg" numeric(7, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beef_deadweight_settlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"finishing_record_id" integer,
	"kill_date" date NOT NULL,
	"abattoir_name" text NOT NULL,
	"abattoir_ref" text,
	"number_of_head" integer NOT NULL,
	"average_carcass_weight_kg" numeric(7, 2),
	"total_carcass_weight_kg" numeric(8, 2),
	"killing_out_percentage" numeric(5, 2),
	"dominant_grade" text,
	"grade_breakdown" text,
	"average_price_per_kg_gbp" numeric(8, 4),
	"total_value_gbp" numeric(10, 2),
	"deadweight_levy_gbp" numeric(8, 2),
	"transport_cost_gbp" numeric(8, 2),
	"net_payment_gbp" numeric(10, 2),
	"settlement_date" date,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beef_finishing_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"batch_ref" text,
	"date_off_grass" date,
	"housed_date" date,
	"number_of_animals" integer NOT NULL,
	"average_start_weight_kg" numeric(7, 2),
	"finishing_system" text DEFAULT 'cereal-based' NOT NULL,
	"feed_regime_notes" text,
	"target_days_on_feed" integer,
	"target_kill_date" date,
	"target_carcass_weight_kg" numeric(7, 2),
	"target_grade_spec" text,
	"abattoir_name" text,
	"booked_kill_date" date,
	"actual_kill_date" date,
	"status" text DEFAULT 'in-progress' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beef_red_tractor_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"assessor_name" text,
	"assessor_organisation" text,
	"certificate_number" text,
	"certificate_expiry_date" date,
	"cattle_registration_current" boolean DEFAULT false,
	"bcms_records_complete" boolean DEFAULT false,
	"movement_documents_on_file" boolean DEFAULT false,
	"medicine_records_complete" boolean DEFAULT false,
	"vet_health_plan_in_place" boolean DEFAULT false,
	"withdrawal_periods_recorded" boolean DEFAULT false,
	"tb_testing_current" boolean DEFAULT false,
	"mortality_records_complete" boolean DEFAULT false,
	"welfare_checks_recorded" boolean DEFAULT false,
	"bcs_recorded" boolean DEFAULT false,
	"calving_records_complete" boolean DEFAULT false,
	"feed_records_complete" boolean DEFAULT false,
	"water_access_adequate" boolean DEFAULT false,
	"biosecurity_plan_in_place" boolean DEFAULT false,
	"staff_training_records" boolean DEFAULT false,
	"manure_management_plan" boolean DEFAULT false,
	"overall_status" text DEFAULT 'in-progress' NOT NULL,
	"non_conformances_count" integer DEFAULT 0,
	"non_conformance_details" text,
	"corrective_action_deadline" date,
	"next_assessment_due" date,
	"notes" text,
	"document_path" text,
	"document_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beef_weigh_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"herd_id" integer,
	"weigh_date" date NOT NULL,
	"weigh_type" text DEFAULT 'routine' NOT NULL,
	"weighed_by" text,
	"age_class_weighed" text,
	"batch_or_group_ref" text,
	"number_weighed" integer NOT NULL,
	"average_weight_kg" numeric(7, 2),
	"lowest_weight_kg" numeric(7, 2),
	"highest_weight_kg" numeric(7, 2),
	"target_weight_kg" numeric(7, 2),
	"dlwg_g_per_day" numeric(7, 1),
	"previous_weigh_date" date,
	"previous_average_weight_kg" numeric(7, 2),
	"days_on_feed" integer,
	"target_kill_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_conditioning_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"conditioning_date" date NOT NULL,
	"store_bin_ref" text,
	"commodity" text,
	"lot_ref" text,
	"conditioning_type" text DEFAULT 'aeration' NOT NULL,
	"duration_hours" numeric(6, 2),
	"ambient_temp_celsius" numeric(5, 2),
	"grain_temp_before_celsius" numeric(5, 2),
	"grain_temp_after_celsius" numeric(5, 2),
	"target_temp_celsius" numeric(5, 2),
	"operator_name" text,
	"pest_activity_observed" boolean DEFAULT false,
	"pest_details" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_drying_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"drying_date" date NOT NULL,
	"store_bin_ref" text,
	"commodity" text NOT NULL,
	"lot_ref" text,
	"quantity_tonnes" numeric(8, 3),
	"intake_moisture_percent" numeric(5, 2),
	"target_moisture_percent" numeric(5, 2),
	"exit_moisture_percent" numeric(5, 2),
	"dryer_type" text,
	"fuel_type" text,
	"fuel_used_litres" numeric(8, 2),
	"fuel_used_kwh" numeric(8, 2),
	"drying_cost_gbp" numeric(8, 2),
	"operator_name" text,
	"dryer_fault_occurred" boolean DEFAULT false,
	"fault_details" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_storage_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"merchant_name" text NOT NULL,
	"merchant_address" text,
	"merchant_phone" text,
	"agreement_ref" text,
	"storage_location_name" text,
	"commodity" text NOT NULL,
	"quantity_tonnes" numeric(8, 3),
	"deposited_date" date,
	"agreed_withdraw_date" date,
	"storage_rate_pence_per_tonne_per_week" numeric(8, 2),
	"handling_in_pence_per_tonne" numeric(8, 2),
	"handling_out_pence_per_tonne" numeric(8, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grain_settlement_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"settlement_date" date NOT NULL,
	"merchant_name" text NOT NULL,
	"contract_ref" text,
	"commodity" text NOT NULL,
	"quantity_tonnes" numeric(8, 3) NOT NULL,
	"price_per_tonne_gbp" numeric(8, 2),
	"total_value_gbp" numeric(10, 2),
	"premium_or_discount_gbp" numeric(8, 2),
	"premium_or_discount_reason" text,
	"levy_deduction_gbp" numeric(8, 2),
	"storage_cost_gbp" numeric(8, 2),
	"other_deductions_gbp" numeric(8, 2),
	"net_payment_gbp" numeric(10, 2),
	"payment_due_date" date,
	"payment_received" boolean DEFAULT false NOT NULL,
	"payment_received_date" date,
	"linked_haulage_ref" text,
	"quality_spec" text,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "livestock_settlement_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"kill_date" date NOT NULL,
	"abattoir_name" text NOT NULL,
	"abattoir_ref" text,
	"species" text NOT NULL,
	"number_of_head" integer NOT NULL,
	"average_carcass_weight_kg" numeric(7, 2),
	"total_carcass_weight_kg" numeric(8, 2),
	"killing_out_percentage" numeric(5, 2),
	"dominant_grade" text,
	"grade_breakdown" text,
	"average_price_per_kg_gbp" numeric(8, 4),
	"total_value_gbp" numeric(10, 2),
	"levy_deduction_gbp" numeric(8, 2),
	"transport_cost_gbp" numeric(8, 2),
	"other_deductions_gbp" numeric(8, 2),
	"net_payment_gbp" numeric(10, 2),
	"settlement_date" date,
	"payment_received" boolean DEFAULT false NOT NULL,
	"payment_received_date" date,
	"linked_movement_ref" text,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicated_feed_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"delivery_date" date NOT NULL,
	"product_name" text NOT NULL,
	"active_ingredient" text NOT NULL,
	"medicinal_category" text NOT NULL,
	"supplier_name" text,
	"batch_number" text NOT NULL,
	"expiry_date" date,
	"quantity_delivered_kg" numeric(10, 2) NOT NULL,
	"species_targeted" text NOT NULL,
	"herd_flock_ref" text,
	"number_of_animals" integer,
	"feeding_start_date" date NOT NULL,
	"feeding_end_date" date,
	"feeding_duration_days" integer,
	"daily_ration_kg_per_animal" numeric(7, 3),
	"indication_diagnosis" text NOT NULL,
	"prescribing_vet_name" text,
	"prescribing_vet_practice" text,
	"veterinary_prescription_ref" text,
	"prescription_on_file" boolean DEFAULT false,
	"withdrawal_period_days" integer,
	"withdrawal_end_date" date,
	"stock_used_kg" numeric(10, 2),
	"stock_remaining_kg" numeric(10, 2),
	"unused_stock_disposal_method" text,
	"unused_stock_disposal_date" date,
	"document_path" text,
	"document_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vine_register" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"planting_id" integer,
	"hmrc_vine_register_ref" text,
	"registered_variety" text NOT NULL,
	"registered_area_ha" numeric(8, 4) NOT NULL,
	"date_registered" date,
	"date_amended" date,
	"gi_classification" text,
	"wine_colour" text,
	"is_removed_from_register" boolean DEFAULT false NOT NULL,
	"removal_date" date,
	"removal_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_block_boundaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"polygon_points" jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"captured_by" text
);
--> statement-breakpoint
CREATE TABLE "vineyard_block_plantings" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"farm_id" integer NOT NULL,
	"variety" text NOT NULL,
	"clone" text,
	"rootstock" text,
	"planting_year" integer,
	"planted_date" date,
	"number_of_vines" integer,
	"row_spacing_m" numeric(5, 2),
	"vine_spacing_m" numeric(5, 2),
	"training_system" text,
	"trellis_type" text,
	"area_ha" numeric(8, 4),
	"is_organic" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"deactivated_at" timestamp with time zone,
	"deactivated_by" text,
	"deactivation_type" text,
	"deactivation_reason" text,
	"deactivation_notes" text,
	"reactivated_at" timestamp with time zone,
	"reactivated_reason" text,
	"predecessor_planting_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_name" text NOT NULL,
	"block_ref" text,
	"field_parcel_ref" text,
	"aspect" text,
	"soil_type" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_harvest" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"planting_id" integer,
	"vintage_year" integer NOT NULL,
	"harvest_date" date NOT NULL,
	"harvest_method" text,
	"yield_kg" numeric(10, 2),
	"yield_kg_per_vine" numeric(6, 3),
	"yield_tonnes_per_ha" numeric(6, 3),
	"brix" numeric(5, 2),
	"ph" numeric(4, 2),
	"titratable_acidity_gl" numeric(5, 2),
	"potential_alcohol" numeric(5, 2),
	"grape_condition" text,
	"botrytis_present" boolean DEFAULT false,
	"botrytis_percentage" integer,
	"destination_winery_type" text,
	"destination_winery" text,
	"destination_winery_contact_id" integer,
	"operator_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"planting_id" integer,
	"operation_date" date NOT NULL,
	"operation_type" text NOT NULL,
	"pruning_system" text,
	"buds_per_vine_target" integer,
	"buds_per_vine_actual" integer,
	"pruning_weight_kg_per_vine" numeric(6, 3),
	"shoots_removed_pct" integer,
	"leaves_removed_zone" text,
	"operator_name" text,
	"contractor_name" text,
	"machine_used" text,
	"hours_worked" numeric(5, 1),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_phenology" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"planting_id" integer,
	"observation_date" date NOT NULL,
	"bbch_stage" text NOT NULL,
	"bbch_description" text,
	"percentage_reached" integer,
	"observer" text,
	"temperature_c" numeric(4, 1),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_scouting" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"planting_id" integer,
	"scout_date" date NOT NULL,
	"scouted_by" text,
	"downy_mildew_pressure" integer DEFAULT 0,
	"powdery_mildew_pressure" integer DEFAULT 0,
	"botrytis_pressure" integer DEFAULT 0,
	"phomopsis_pressure" integer DEFAULT 0,
	"eutypa_dieback_sighted" boolean DEFAULT false,
	"vine_weevil_sighted" boolean DEFAULT false,
	"leafhopper_pressure" integer DEFAULT 0,
	"spider_mite_pressure" integer DEFAULT 0,
	"xylella_fastidiosa" boolean DEFAULT false,
	"phytophthora_viticola" boolean DEFAULT false,
	"action_taken" text,
	"spray_applied" boolean DEFAULT false,
	"spray_product" text,
	"next_scout_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_soil_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"status" text DEFAULT 'complete' NOT NULL,
	"request_date" date,
	"requested_by" text,
	"analysis_type" text,
	"collection_date" date,
	"collected_by" text,
	"collection_notes" text,
	"collection_gps_lat" numeric(10, 6),
	"collection_gps_lng" numeric(10, 6),
	"dispatch_date" date,
	"lab_name" text,
	"sample_reference" text,
	"results_received_date" date,
	"analysis_date" date,
	"ph" numeric(4, 2),
	"organic_matter_pct" numeric(5, 2),
	"phosphorus_mg_l" numeric(8, 2),
	"potassium_mg_l" numeric(8, 2),
	"magnesium_mg_l" numeric(8, 2),
	"calcium_mg_l" numeric(8, 2),
	"iron_mg_l" numeric(8, 2),
	"manganese_mg_l" numeric(8, 2),
	"boron_mg_l" numeric(8, 2),
	"nitrogen_mg_l" numeric(8, 2),
	"sulphur_mg_l" numeric(8, 2),
	"cec_cmol_kg" numeric(8, 2),
	"recommendations" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vineyard_spray_diary" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"block_id" integer,
	"application_date" date NOT NULL,
	"product_name" text NOT NULL,
	"mapp_number" text,
	"active_ingredient" text,
	"product_type" text,
	"rate_per_hectare" numeric(8, 3),
	"rate_unit" text,
	"total_quantity_applied" numeric(10, 3),
	"quantity_unit" text,
	"area_treated_ha" numeric(8, 4),
	"water_volume_l_per_ha" integer,
	"application_method" text,
	"reentry_period_hours" integer,
	"harvest_interval_days" integer,
	"wind_speed_mph" numeric(4, 1),
	"temperature_celsius" numeric(4, 1),
	"weather_conditions" text,
	"operator_name" text,
	"operator_certificate_no" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winery_age_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"record_type" text NOT NULL,
	"record_date" date NOT NULL,
	"staff_name" text,
	"training_provider" text,
	"training_certificate_ref" text,
	"training_expiry_date" date,
	"refusal_location" text,
	"estimated_age" integer,
	"id_requested" boolean DEFAULT false,
	"id_produced" boolean DEFAULT false,
	"supervisor_notified" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winery_excise_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"hmrc_excise_ref" text,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"total_litres_produced" numeric(10, 2),
	"total_litres_sold" numeric(10, 2),
	"total_litres_tastings" numeric(10, 2),
	"duty_rate_per_100_l" numeric(8, 2),
	"total_duty_payable" numeric(10, 2),
	"submitted_date" date,
	"paid_date" date,
	"status" text DEFAULT 'draft' NOT NULL,
	"small_producer_relief" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winery_licences" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"licence_number" text,
	"licence_type" text,
	"local_authority" text,
	"dps_name" text,
	"dps_personal_licence_number" text,
	"dps_personal_licence_expiry" date,
	"granted_date" date,
	"review_date" date,
	"conditions" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winery_tasting_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"farm_id" integer NOT NULL,
	"session_date" date NOT NULL,
	"session_type" text,
	"session_name" text,
	"visitor_count" integer,
	"wines_shown_count" integer,
	"volume_per_person_ml" integer,
	"total_volume_l" numeric(8, 2),
	"staff_name" text,
	"ticket_price_gbp" numeric(8, 2),
	"revenue_gbp" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expo_push_tokens" ADD CONSTRAINT "expo_push_tokens_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_departments" ADD CONSTRAINT "farm_departments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_members" ADD CONSTRAINT "farm_members_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_members" ADD CONSTRAINT "farm_members_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_members" ADD CONSTRAINT "farm_members_department_id_farm_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."farm_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_task_assignments" ADD CONSTRAINT "farm_task_assignments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_task_assignments" ADD CONSTRAINT "farm_task_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_task_assignments" ADD CONSTRAINT "farm_task_assignments_assigned_to_member_id_farm_members_id_fk" FOREIGN KEY ("assigned_to_member_id") REFERENCES "public"."farm_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms" ADD CONSTRAINT "farms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_department_memberships" ADD CONSTRAINT "staff_department_memberships_member_id_farm_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."farm_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_department_memberships" ADD CONSTRAINT "staff_department_memberships_department_id_farm_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."farm_departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_farm_assignments" ADD CONSTRAINT "staff_farm_assignments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_farm_assignments" ADD CONSTRAINT "staff_farm_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_farm_assignments" ADD CONSTRAINT "staff_farm_assignments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment_history" ADD CONSTRAINT "task_assignment_history_assignment_id_farm_task_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."farm_task_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_destinations" ADD CONSTRAINT "crop_destinations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_documents" ADD CONSTRAINT "crop_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_documents" ADD CONSTRAINT "crop_documents_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_financial_transactions" ADD CONSTRAINT "crop_financial_transactions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_financial_transactions" ADD CONSTRAINT "crop_financial_transactions_harvest_record_id_harvest_records_id_fk" FOREIGN KEY ("harvest_record_id") REFERENCES "public"."harvest_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_storage_records" ADD CONSTRAINT "crop_storage_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_storage_records" ADD CONSTRAINT "crop_storage_records_harvest_record_id_harvest_records_id_fk" FOREIGN KEY ("harvest_record_id") REFERENCES "public"."harvest_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_transport_records" ADD CONSTRAINT "crop_transport_records_harvest_record_id_harvest_records_id_fk" FOREIGN KEY ("harvest_record_id") REFERENCES "public"."harvest_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_boundaries" ADD CONSTRAINT "field_boundaries_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_crop_assignments" ADD CONSTRAINT "field_crop_assignments_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_crop_assignments" ADD CONSTRAINT "field_crop_assignments_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_inspection_photos" ADD CONSTRAINT "field_inspection_photos_record_id_field_inspections_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."field_inspections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_inspection_photos" ADD CONSTRAINT "field_inspection_photos_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_inspections" ADD CONSTRAINT "field_inspections_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_operations" ADD CONSTRAINT "field_operations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_operations" ADD CONSTRAINT "field_operations_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_season_land_use" ADD CONSTRAINT "field_season_land_use_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_season_land_use" ADD CONSTRAINT "field_season_land_use_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_tenure_documents" ADD CONSTRAINT "field_tenure_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_tenure_documents" ADD CONSTRAINT "field_tenure_documents_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_landlord_supplier_id_suppliers_id_fk" FOREIGN KEY ("landlord_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_records" ADD CONSTRAINT "harvest_records_field_crop_assignment_id_field_crop_assignments_id_fk" FOREIGN KEY ("field_crop_assignment_id") REFERENCES "public"."field_crop_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_storage_charges" ADD CONSTRAINT "merchant_storage_charges_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_storage_charges" ADD CONSTRAINT "merchant_storage_charges_location_id_storage_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nvz_risk_assessments" ADD CONSTRAINT "nvz_risk_assessments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seed_drilling_records" ADD CONSTRAINT "seed_drilling_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seed_drilling_records" ADD CONSTRAINT "seed_drilling_records_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_location_movements" ADD CONSTRAINT "storage_location_movements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_location_movements" ADD CONSTRAINT "storage_location_movements_location_id_storage_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipm_plans" ADD CONSTRAINT "ipm_plans_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipm_threshold_entries" ADD CONSTRAINT "ipm_threshold_entries_plan_id_ipm_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."ipm_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipm_threshold_entries" ADD CONSTRAINT "ipm_threshold_entries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD CONSTRAINT "lerap_assessments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD CONSTRAINT "lerap_assessments_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lerap_assessments" ADD CONSTRAINT "lerap_assessments_product_id_spray_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."spray_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nmp_field_entries" ADD CONSTRAINT "nmp_field_entries_plan_id_nutrient_management_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."nutrient_management_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nmp_field_entries" ADD CONSTRAINT "nmp_field_entries_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrient_management_plans" ADD CONSTRAINT "nutrient_management_plans_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nvz_fertiliser_applications" ADD CONSTRAINT "nvz_fertiliser_applications_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nvz_fertiliser_applications" ADD CONSTRAINT "nvz_fertiliser_applications_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD CONSTRAINT "spray_applications_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD CONSTRAINT "spray_applications_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD CONSTRAINT "spray_applications_product_id_spray_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."spray_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD CONSTRAINT "spray_applications_operator_member_id_farm_members_id_fk" FOREIGN KEY ("operator_member_id") REFERENCES "public"."farm_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD CONSTRAINT "spray_applications_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD CONSTRAINT "spray_applications_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_applications" ADD CONSTRAINT "spray_applications_stock_delivery_id_stock_deliveries_id_fk" FOREIGN KEY ("stock_delivery_id") REFERENCES "public"."stock_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_products" ADD CONSTRAINT "spray_products_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_products" ADD CONSTRAINT "spray_products_coshh_record_id_coshh_records_id_fk" FOREIGN KEY ("coshh_record_id") REFERENCES "public"."coshh_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spray_products" ADD CONSTRAINT "spray_products_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_sensor_probes" ADD CONSTRAINT "soil_sensor_probes_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_sensor_probes" ADD CONSTRAINT "soil_sensor_probes_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_sensor_readings" ADD CONSTRAINT "soil_sensor_readings_probe_id_soil_sensor_probes_id_fk" FOREIGN KEY ("probe_id") REFERENCES "public"."soil_sensor_probes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_sensor_readings" ADD CONSTRAINT "soil_sensor_readings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_test_records" ADD CONSTRAINT "soil_test_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_test_records" ADD CONSTRAINT "soil_test_records_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_test_records" ADD CONSTRAINT "soil_test_records_lab_supplier_id_suppliers_id_fk" FOREIGN KEY ("lab_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_test_results" ADD CONSTRAINT "soil_test_results_soil_test_id_soil_test_records_id_fk" FOREIGN KEY ("soil_test_id") REFERENCES "public"."soil_test_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_calibration_records" ADD CONSTRAINT "equipment_calibration_records_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_defect_reports" ADD CONSTRAINT "equipment_defect_reports_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_defect_reports" ADD CONSTRAINT "equipment_defect_reports_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_maintenance_logs" ADD CONSTRAINT "equipment_maintenance_logs_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_offboarding_records" ADD CONSTRAINT "equipment_offboarding_records_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_quality_tests" ADD CONSTRAINT "grain_quality_tests_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_storage_bins" ADD CONSTRAINT "grain_storage_bins_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_temperature_logs" ADD CONSTRAINT "grain_temperature_logs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_temperature_logs" ADD CONSTRAINT "grain_temperature_logs_location_id_storage_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_temperature_logs" ADD CONSTRAINT "grain_temperature_logs_bin_id_grain_storage_bins_id_fk" FOREIGN KEY ("bin_id") REFERENCES "public"."grain_storage_bins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_fire_extinguisher_services" ADD CONSTRAINT "workshop_fire_extinguisher_services_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_fire_extinguisher_services" ADD CONSTRAINT "workshop_fire_extinguisher_services_extinguisher_id_workshop_fire_extinguishers_id_fk" FOREIGN KEY ("extinguisher_id") REFERENCES "public"."workshop_fire_extinguishers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_fire_extinguishers" ADD CONSTRAINT "workshop_fire_extinguishers_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_fire_extinguishers" ADD CONSTRAINT "workshop_fire_extinguishers_building_id_farm_locations_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."farm_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_goods_returns" ADD CONSTRAINT "workshop_goods_returns_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_goods_returns" ADD CONSTRAINT "workshop_goods_returns_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_goods_returns" ADD CONSTRAINT "workshop_goods_returns_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_job_documents" ADD CONSTRAINT "workshop_job_documents_job_id_workshop_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."workshop_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_jobs" ADD CONSTRAINT "workshop_jobs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_jobs" ADD CONSTRAINT "workshop_jobs_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_jobs" ADD CONSTRAINT "workshop_jobs_customer_id_farm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."farm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_jobs" ADD CONSTRAINT "workshop_jobs_service_invoice_id_service_invoices_id_fk" FOREIGN KEY ("service_invoice_id") REFERENCES "public"."service_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_part_documents" ADD CONSTRAINT "workshop_part_documents_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_pat_equipment" ADD CONSTRAINT "workshop_pat_equipment_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_pat_equipment" ADD CONSTRAINT "workshop_pat_equipment_building_id_farm_locations_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."farm_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_pat_test_records" ADD CONSTRAINT "workshop_pat_test_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_pat_test_records" ADD CONSTRAINT "workshop_pat_test_records_equipment_id_workshop_pat_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."workshop_pat_equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_pat_tests" ADD CONSTRAINT "workshop_pat_tests_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_pat_tests" ADD CONSTRAINT "workshop_pat_tests_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_pat_tests" ADD CONSTRAINT "workshop_pat_tests_building_id_farm_locations_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."farm_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_stocktake_items" ADD CONSTRAINT "workshop_stocktake_items_session_id_workshop_stocktake_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workshop_stocktake_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_stocktake_items" ADD CONSTRAINT "workshop_stocktake_items_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_stocktake_items" ADD CONSTRAINT "workshop_stocktake_items_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_stocktake_sessions" ADD CONSTRAINT "workshop_stocktake_sessions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_reproduction_records" ADD CONSTRAINT "ai_reproduction_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_documents" ADD CONSTRAINT "animal_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_documents" ADD CONSTRAINT "animal_documents_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcms_farm_credentials" ADD CONSTRAINT "bcms_farm_credentials_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcms_submissions" ADD CONSTRAINT "bcms_submissions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcms_submissions" ADD CONSTRAINT "bcms_submissions_movement_id_livestock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."livestock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bvd_testing_records" ADD CONSTRAINT "bvd_testing_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bvd_testing_records" ADD CONSTRAINT "bvd_testing_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casualty_slaughter_records" ADD CONSTRAINT "casualty_slaughter_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casualty_slaughter_records" ADD CONSTRAINT "casualty_slaughter_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casualty_slaughter_records" ADD CONSTRAINT "casualty_slaughter_records_carcase_disposal_contractor_id_fallen_stock_contractors_id_fk" FOREIGN KEY ("carcase_disposal_contractor_id") REFERENCES "public"."fallen_stock_contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_abr_test_kit_stock" ADD CONSTRAINT "dairy_abr_test_kit_stock_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_bcs_records" ADD CONSTRAINT "dairy_bcs_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_bcs_records" ADD CONSTRAINT "dairy_bcs_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_bcs_records" ADD CONSTRAINT "dairy_bcs_records_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_bulk_tank_records" ADD CONSTRAINT "dairy_bulk_tank_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_bulk_tank_records" ADD CONSTRAINT "dairy_bulk_tank_records_tank_id_dairy_bulk_tanks_id_fk" FOREIGN KEY ("tank_id") REFERENCES "public"."dairy_bulk_tanks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_bulk_tanks" ADD CONSTRAINT "dairy_bulk_tanks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_calving_records" ADD CONSTRAINT "dairy_calving_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_calving_records" ADD CONSTRAINT "dairy_calving_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_calving_records" ADD CONSTRAINT "dairy_calving_records_cow_animal_id_livestock_animals_id_fk" FOREIGN KEY ("cow_animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_calving_records" ADD CONSTRAINT "dairy_calving_records_calf_animal_id_livestock_animals_id_fk" FOREIGN KEY ("calf_animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_calving_records" ADD CONSTRAINT "dairy_calving_records_calf_animal_id_2_livestock_animals_id_fk" FOREIGN KEY ("calf_animal_id_2") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_calving_records" ADD CONSTRAINT "dairy_calving_records_perinatal_disposal_contractor_id_fallen_stock_contractors_id_fk" FOREIGN KEY ("perinatal_disposal_contractor_id") REFERENCES "public"."fallen_stock_contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_dct_records" ADD CONSTRAINT "dairy_dct_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_dct_records" ADD CONSTRAINT "dairy_dct_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_dct_records" ADD CONSTRAINT "dairy_dct_records_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_mastitis_records" ADD CONSTRAINT "dairy_mastitis_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_mastitis_records" ADD CONSTRAINT "dairy_mastitis_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_mastitis_records" ADD CONSTRAINT "dairy_mastitis_records_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_milk_collections" ADD CONSTRAINT "dairy_milk_collections_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_milk_collections" ADD CONSTRAINT "dairy_milk_collections_tank_id_dairy_bulk_tanks_id_fk" FOREIGN KEY ("tank_id") REFERENCES "public"."dairy_bulk_tanks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_milk_records" ADD CONSTRAINT "dairy_milk_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_milk_records" ADD CONSTRAINT "dairy_milk_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_mobility_scorings" ADD CONSTRAINT "dairy_mobility_scorings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dairy_mobility_scorings" ADD CONSTRAINT "dairy_mobility_scorings_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fallen_stock_contractors" ADD CONSTRAINT "fallen_stock_contractors_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "herd_flock_register" ADD CONSTRAINT "herd_flock_register_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "herd_health_events" ADD CONSTRAINT "herd_health_events_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "herd_health_events" ADD CONSTRAINT "herd_health_events_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "johnes_monitoring_records" ADD CONSTRAINT "johnes_monitoring_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "johnes_monitoring_records" ADD CONSTRAINT "johnes_monitoring_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_ewe_animal_id_livestock_animals_id_fk" FOREIGN KEY ("ewe_animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_lamb_animal_id_1_livestock_animals_id_fk" FOREIGN KEY ("lamb_animal_id_1") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_lamb_animal_id_2_livestock_animals_id_fk" FOREIGN KEY ("lamb_animal_id_2") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_lamb_animal_id_3_livestock_animals_id_fk" FOREIGN KEY ("lamb_animal_id_3") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_lamb_animal_id_4_livestock_animals_id_fk" FOREIGN KEY ("lamb_animal_id_4") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lambing_records" ADD CONSTRAINT "lambing_records_perinatal_disposal_contractor_id_fallen_stock_contractors_id_fk" FOREIGN KEY ("perinatal_disposal_contractor_id") REFERENCES "public"."fallen_stock_contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lis_farm_tokens" ADD CONSTRAINT "lis_farm_tokens_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lis_submissions" ADD CONSTRAINT "lis_submissions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lis_submissions" ADD CONSTRAINT "lis_submissions_movement_id_livestock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."livestock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_animals" ADD CONSTRAINT "livestock_animals_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_animals" ADD CONSTRAINT "livestock_animals_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_daily_checks" ADD CONSTRAINT "livestock_daily_checks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_daily_checks" ADD CONSTRAINT "livestock_daily_checks_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_feed_records" ADD CONSTRAINT "livestock_feed_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_feed_records" ADD CONSTRAINT "livestock_feed_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_medicine_records" ADD CONSTRAINT "livestock_medicine_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_medicine_records" ADD CONSTRAINT "livestock_medicine_records_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_medicine_records" ADD CONSTRAINT "livestock_medicine_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_mortality" ADD CONSTRAINT "livestock_mortality_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_mortality" ADD CONSTRAINT "livestock_mortality_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_mortality" ADD CONSTRAINT "livestock_mortality_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_mortality" ADD CONSTRAINT "livestock_mortality_contractor_id_fallen_stock_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."fallen_stock_contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_movement_animals" ADD CONSTRAINT "livestock_movement_animals_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_movement_animals" ADD CONSTRAINT "livestock_movement_animals_movement_id_livestock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."livestock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_movement_animals" ADD CONSTRAINT "livestock_movement_animals_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_movements" ADD CONSTRAINT "livestock_movements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_movements" ADD CONSTRAINT "livestock_movements_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_movements" ADD CONSTRAINT "livestock_movements_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_purchases" ADD CONSTRAINT "livestock_purchases_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_purchases" ADD CONSTRAINT "livestock_purchases_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_purchases" ADD CONSTRAINT "livestock_purchases_movement_id_livestock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."livestock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_water_records" ADD CONSTRAINT "livestock_water_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_water_records" ADD CONSTRAINT "livestock_water_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_water_records" ADD CONSTRAINT "livestock_water_records_lab_supplier_id_suppliers_id_fk" FOREIGN KEY ("lab_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sire_register" ADD CONSTRAINT "sire_register_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "straw_inventory" ADD CONSTRAINT "straw_inventory_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_health_plan_action_completions" ADD CONSTRAINT "vet_health_plan_action_completions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_health_plan_action_completions" ADD CONSTRAINT "vet_health_plan_action_completions_action_id_vet_health_plan_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."vet_health_plan_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_health_plan_actions" ADD CONSTRAINT "vet_health_plan_actions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_health_plan_actions" ADD CONSTRAINT "vet_health_plan_actions_plan_id_vet_health_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."vet_health_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_health_plans" ADD CONSTRAINT "vet_health_plans_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_prescription_records" ADD CONSTRAINT "vet_prescription_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_prescription_records" ADD CONSTRAINT "vet_prescription_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_prescription_records" ADD CONSTRAINT "vet_prescription_records_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biosecurity_cleaning_schedules" ADD CONSTRAINT "biosecurity_cleaning_schedules_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biosecurity_plans" ADD CONSTRAINT "biosecurity_plans_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_disinfection_records" ADD CONSTRAINT "cleaning_disinfection_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_disinfection_records" ADD CONSTRAINT "cleaning_disinfection_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_disinfection_records" ADD CONSTRAINT "cleaning_disinfection_records_rams_id_risk_assessments_id_fk" FOREIGN KEY ("rams_id") REFERENCES "public"."risk_assessments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_stock_consumptions" ADD CONSTRAINT "cleaning_stock_consumptions_cleaning_record_id_cleaning_disinfection_records_id_fk" FOREIGN KEY ("cleaning_record_id") REFERENCES "public"."cleaning_disinfection_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_stock_consumptions" ADD CONSTRAINT "cleaning_stock_consumptions_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_control_photos" ADD CONSTRAINT "pest_control_photos_record_id_pest_control_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."pest_control_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_control_photos" ADD CONSTRAINT "pest_control_photos_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_control_records" ADD CONSTRAINT "pest_control_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_contractor_log" ADD CONSTRAINT "visitor_contractor_log_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_certificates" ADD CONSTRAINT "staff_certificates_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_right_to_work" ADD CONSTRAINT "staff_right_to_work_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_rtw_documents" ADD CONSTRAINT "staff_rtw_documents_rtw_id_staff_right_to_work_id_fk" FOREIGN KEY ("rtw_id") REFERENCES "public"."staff_right_to_work"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_rtw_documents" ADD CONSTRAINT "staff_rtw_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_training_records" ADD CONSTRAINT "staff_training_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour_absences" ADD CONSTRAINT "labour_absences_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour_actual_attendance" ADD CONSTRAINT "labour_actual_attendance_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour_hourly_rates" ADD CONSTRAINT "labour_hourly_rates_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour_leave_entitlement" ADD CONSTRAINT "labour_leave_entitlement_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour_rota" ADD CONSTRAINT "labour_rota_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labour_timesheet_entries" ADD CONSTRAINT "labour_timesheet_entries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_book_photos" ADD CONSTRAINT "accident_book_photos_record_id_accident_book_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."accident_book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_book_photos" ADD CONSTRAINT "accident_book_photos_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_book" ADD CONSTRAINT "accident_book_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coshh_records" ADD CONSTRAINT "coshh_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encampment_photos" ADD CONSTRAINT "encampment_photos_incident_id_unauthorized_encampments_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."unauthorized_encampments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encampment_photos" ADD CONSTRAINT "encampment_photos_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fly_tipping_incidents" ADD CONSTRAINT "fly_tipping_incidents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fly_tipping_incidents" ADD CONSTRAINT "fly_tipping_incidents_insurance_policy_id_farm_insurance_id_fk" FOREIGN KEY ("insurance_policy_id") REFERENCES "public"."farm_insurance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fly_tipping_photos" ADD CONSTRAINT "fly_tipping_photos_incident_id_fly_tipping_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."fly_tipping_incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fly_tipping_photos" ADD CONSTRAINT "fly_tipping_photos_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unauthorized_encampments" ADD CONSTRAINT "unauthorized_encampments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unauthorized_encampments" ADD CONSTRAINT "unauthorized_encampments_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unauthorized_encampments" ADD CONSTRAINT "unauthorized_encampments_insurance_policy_id_farm_insurance_id_fk" FOREIGN KEY ("insurance_policy_id") REFERENCES "public"."farm_insurance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waste_disposal_records" ADD CONSTRAINT "waste_disposal_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waste_disposal_records" ADD CONSTRAINT "waste_disposal_records_collection_building_id_farm_locations_id_fk" FOREIGN KEY ("collection_building_id") REFERENCES "public"."farm_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waste_disposal_records" ADD CONSTRAINT "waste_disposal_records_carrier_id_suppliers_id_fk" FOREIGN KEY ("carrier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_nonconformance_id_nonconformance_records_id_fk" FOREIGN KEY ("nonconformance_id") REFERENCES "public"."nonconformance_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_assurance_certs" ADD CONSTRAINT "farm_assurance_certs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_records" ADD CONSTRAINT "inspection_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nonconformance_records" ADD CONSTRAINT "nonconformance_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nonconformance_records" ADD CONSTRAINT "nonconformance_records_inspection_id_inspection_records_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspection_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agri_environment_scheme_records" ADD CONSTRAINT "agri_environment_scheme_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_assessments" ADD CONSTRAINT "environmental_assessments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_features" ADD CONSTRAINT "environmental_features_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_features" ADD CONSTRAINT "environmental_features_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_management_events" ADD CONSTRAINT "environmental_management_events_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_management_events" ADD CONSTRAINT "environmental_management_events_feature_id_environmental_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."environmental_features"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_management_events" ADD CONSTRAINT "environmental_management_events_scheme_id_agri_environment_scheme_records_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."agri_environment_scheme_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sfi_actions" ADD CONSTRAINT "sfi_actions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sfi_actions" ADD CONSTRAINT "sfi_actions_agreement_id_sfi_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."sfi_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sfi_agreements" ADD CONSTRAINT "sfi_agreements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slurry_spreading_records" ADD CONSTRAINT "slurry_spreading_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slurry_spreading_records" ADD CONSTRAINT "slurry_spreading_records_store_id_slurry_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."slurry_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slurry_store_inspections" ADD CONSTRAINT "slurry_store_inspections_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slurry_store_inspections" ADD CONSTRAINT "slurry_store_inspections_store_id_slurry_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."slurry_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slurry_stores" ADD CONSTRAINT "slurry_stores_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_stock_levels" ADD CONSTRAINT "crop_stock_levels_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_stock_levels" ADD CONSTRAINT "crop_stock_levels_bin_id_grain_storage_bins_id_fk" FOREIGN KEY ("bin_id") REFERENCES "public"."grain_storage_bins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_stock_movements" ADD CONSTRAINT "crop_stock_movements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_stock_movements" ADD CONSTRAINT "crop_stock_movements_crop_stock_level_id_crop_stock_levels_id_fk" FOREIGN KEY ("crop_stock_level_id") REFERENCES "public"."crop_stock_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_stock_movements" ADD CONSTRAINT "crop_stock_movements_bin_id_grain_storage_bins_id_fk" FOREIGN KEY ("bin_id") REFERENCES "public"."grain_storage_bins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_plans" ADD CONSTRAINT "dispatch_plans_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_plans" ADD CONSTRAINT "dispatch_plans_bin_id_grain_storage_bins_id_fk" FOREIGN KEY ("bin_id") REFERENCES "public"."grain_storage_bins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_plans" ADD CONSTRAINT "dispatch_plans_buyer_id_suppliers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatch_plans" ADD CONSTRAINT "dispatch_plans_haulier_id_hauliers_id_fk" FOREIGN KEY ("haulier_id") REFERENCES "public"."hauliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulage_records" ADD CONSTRAINT "haulage_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulage_records" ADD CONSTRAINT "haulage_records_bin_id_grain_storage_bins_id_fk" FOREIGN KEY ("bin_id") REFERENCES "public"."grain_storage_bins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulage_records" ADD CONSTRAINT "haulage_records_destination_bin_id_grain_storage_bins_id_fk" FOREIGN KEY ("destination_bin_id") REFERENCES "public"."grain_storage_bins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulage_records" ADD CONSTRAINT "haulage_records_buyer_id_suppliers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulage_records" ADD CONSTRAINT "haulage_records_haulier_registered_id_hauliers_id_fk" FOREIGN KEY ("haulier_registered_id") REFERENCES "public"."hauliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulage_records" ADD CONSTRAINT "haulage_records_dispatch_plan_id_dispatch_plans_id_fk" FOREIGN KEY ("dispatch_plan_id") REFERENCES "public"."dispatch_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulier_invoices" ADD CONSTRAINT "haulier_invoices_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haulier_invoices" ADD CONSTRAINT "haulier_invoices_haulier_id_hauliers_id_fk" FOREIGN KEY ("haulier_id") REFERENCES "public"."hauliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hauliers" ADD CONSTRAINT "hauliers_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_deliveries" ADD CONSTRAINT "stock_deliveries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_deliveries" ADD CONSTRAINT "stock_deliveries_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_deliveries" ADD CONSTRAINT "stock_deliveries_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_deliveries" ADD CONSTRAINT "stock_deliveries_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_default_supplier_id_suppliers_id_fk" FOREIGN KEY ("default_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_delivery_id_stock_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."stock_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocktake_items" ADD CONSTRAINT "stocktake_items_session_id_stocktake_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."stocktake_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocktake_items" ADD CONSTRAINT "stocktake_items_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocktake_items" ADD CONSTRAINT "stocktake_items_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocktake_sessions" ADD CONSTRAINT "stocktake_sessions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_contracts" ADD CONSTRAINT "crop_contracts_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_contracts" ADD CONSTRAINT "crop_contracts_buyer_id_suppliers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_exports" ADD CONSTRAINT "financial_exports_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_stock_delivery_id_stock_deliveries_id_fk" FOREIGN KEY ("stock_delivery_id") REFERENCES "public"."stock_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_storage_refs" ADD CONSTRAINT "object_storage_refs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_storage_refs" ADD CONSTRAINT "object_storage_refs_document_id_document_records_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_weather_devices" ADD CONSTRAINT "vehicle_weather_devices_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_weather_readings" ADD CONSTRAINT "vehicle_weather_readings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_weather_readings" ADD CONSTRAINT "vehicle_weather_readings_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_weather_readings" ADD CONSTRAINT "vehicle_weather_readings_device_id_vehicle_weather_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."vehicle_weather_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_readings" ADD CONSTRAINT "weather_readings_station_id_weather_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."weather_stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_readings" ADD CONSTRAINT "weather_readings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_readings" ADD CONSTRAINT "weather_readings_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_stations" ADD CONSTRAINT "weather_stations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_stations" ADD CONSTRAINT "weather_stations_linked_field_id_fields_id_fk" FOREIGN KEY ("linked_field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_locations" ADD CONSTRAINT "farm_locations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biofuel_certifications" ADD CONSTRAINT "biofuel_certifications_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biofuel_deliveries" ADD CONSTRAINT "biofuel_deliveries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biofuel_deliveries" ADD CONSTRAINT "biofuel_deliveries_buyer_id_rtfo_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."rtfo_buyers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biofuel_deliveries" ADD CONSTRAINT "biofuel_deliveries_storage_location_id_storage_locations_id_fk" FOREIGN KEY ("storage_location_id") REFERENCES "public"."storage_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biofuel_field_declarations" ADD CONSTRAINT "biofuel_field_declarations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biofuel_field_declarations" ADD CONSTRAINT "biofuel_field_declarations_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtfo_buyers" ADD CONSTRAINT "rtfo_buyers_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_access_log" ADD CONSTRAINT "external_access_log_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_advisors" ADD CONSTRAINT "farm_advisors_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_inspection_sessions" ADD CONSTRAINT "farm_inspection_sessions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_farrowing_records" ADD CONSTRAINT "pig_farrowing_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_farrowing_records" ADD CONSTRAINT "pig_farrowing_records_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_fci_documents" ADD CONSTRAINT "pig_fci_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_fci_documents" ADD CONSTRAINT "pig_fci_documents_movement_id_pig_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."pig_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_feed_consumption" ADD CONSTRAINT "pig_feed_consumption_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_feed_consumption" ADD CONSTRAINT "pig_feed_consumption_applied_to_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("applied_to_flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_flocks" ADD CONSTRAINT "pig_flocks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_medicine_treatments" ADD CONSTRAINT "pig_medicine_treatments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_medicine_treatments" ADD CONSTRAINT "pig_medicine_treatments_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_movements" ADD CONSTRAINT "pig_movements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_red_tractor_checklists" ADD CONSTRAINT "pig_red_tractor_checklists_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_stockmanship_checks" ADD CONSTRAINT "pig_stockmanship_checks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_stockmanship_checks" ADD CONSTRAINT "pig_stockmanship_checks_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_tail_biting_risks" ADD CONSTRAINT "pig_tail_biting_risks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_tail_biting_risks" ADD CONSTRAINT "pig_tail_biting_risks_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_vet_assessments" ADD CONSTRAINT "pig_vet_assessments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_vet_assessments" ADD CONSTRAINT "pig_vet_assessments_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_salmonella_monitoring" ADD CONSTRAINT "pig_salmonella_monitoring_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_salmonella_monitoring" ADD CONSTRAINT "pig_salmonella_monitoring_pig_flock_id_pig_flocks_id_fk" FOREIGN KEY ("pig_flock_id") REFERENCES "public"."pig_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campylobacter_monitoring" ADD CONSTRAINT "campylobacter_monitoring_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campylobacter_monitoring" ADD CONSTRAINT "campylobacter_monitoring_house_id_poultry_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."poultry_houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campylobacter_monitoring" ADD CONSTRAINT "campylobacter_monitoring_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_biosecurity_checklists" ADD CONSTRAINT "poultry_biosecurity_checklists_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_biosecurity_checklists" ADD CONSTRAINT "poultry_biosecurity_checklists_house_id_poultry_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."poultry_houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_biosecurity_checklists" ADD CONSTRAINT "poultry_biosecurity_checklists_previous_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("previous_flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_broiler_welfare" ADD CONSTRAINT "poultry_broiler_welfare_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_broiler_welfare" ADD CONSTRAINT "poultry_broiler_welfare_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_chick_purchases" ADD CONSTRAINT "poultry_chick_purchases_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_chick_purchases" ADD CONSTRAINT "poultry_chick_purchases_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_cleanout_stock_consumptions" ADD CONSTRAINT "poultry_cleanout_stock_consumptions_cleanout_id_poultry_house_cleanouts_id_fk" FOREIGN KEY ("cleanout_id") REFERENCES "public"."poultry_house_cleanouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_cleanout_stock_consumptions" ADD CONSTRAINT "poultry_cleanout_stock_consumptions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_daily_mortality" ADD CONSTRAINT "poultry_daily_mortality_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_daily_mortality" ADD CONSTRAINT "poultry_daily_mortality_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_environmental_logs" ADD CONSTRAINT "poultry_environmental_logs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_environmental_logs" ADD CONSTRAINT "poultry_environmental_logs_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_fci_documents" ADD CONSTRAINT "poultry_fci_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_fci_documents" ADD CONSTRAINT "poultry_fci_documents_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_flocks" ADD CONSTRAINT "poultry_flocks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_flocks" ADD CONSTRAINT "poultry_flocks_house_id_poultry_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."poultry_houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_flocks" ADD CONSTRAINT "poultry_flocks_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_house_cleanouts" ADD CONSTRAINT "poultry_house_cleanouts_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_house_cleanouts" ADD CONSTRAINT "poultry_house_cleanouts_house_id_poultry_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."poultry_houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_house_cleanouts" ADD CONSTRAINT "poultry_house_cleanouts_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_houses" ADD CONSTRAINT "poultry_houses_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_scheme_records" ADD CONSTRAINT "poultry_scheme_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_scheme_records" ADD CONSTRAINT "poultry_scheme_records_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_thinning_records" ADD CONSTRAINT "poultry_thinning_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_thinning_records" ADD CONSTRAINT "poultry_thinning_records_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_treatments" ADD CONSTRAINT "poultry_treatments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_treatments" ADD CONSTRAINT "poultry_treatments_flock_id_poultry_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."poultry_flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allergen_management_records" ADD CONSTRAINT "allergen_management_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fresh_produce_intake" ADD CONSTRAINT "fresh_produce_intake_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fresh_produce_intake" ADD CONSTRAINT "fresh_produce_intake_harvest_record_id_horticulture_harvest_records_id_fk" FOREIGN KEY ("harvest_record_id") REFERENCES "public"."horticulture_harvest_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_block_boundaries" ADD CONSTRAINT "horticulture_block_boundaries_block_id_horticulture_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."horticulture_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_blocks" ADD CONSTRAINT "horticulture_blocks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_blocks" ADD CONSTRAINT "horticulture_blocks_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_crops" ADD CONSTRAINT "horticulture_crops_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_crops" ADD CONSTRAINT "horticulture_crops_block_id_horticulture_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."horticulture_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_harvest_records" ADD CONSTRAINT "horticulture_harvest_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_harvest_records" ADD CONSTRAINT "horticulture_harvest_records_crop_id_horticulture_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."horticulture_crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_harvest_records" ADD CONSTRAINT "horticulture_harvest_records_block_id_horticulture_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."horticulture_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_packhouse_records" ADD CONSTRAINT "horticulture_packhouse_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_packhouse_records" ADD CONSTRAINT "horticulture_packhouse_records_harvest_record_id_horticulture_harvest_records_id_fk" FOREIGN KEY ("harvest_record_id") REFERENCES "public"."horticulture_harvest_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_packhouse_records" ADD CONSTRAINT "horticulture_packhouse_records_intake_record_id_fresh_produce_intake_id_fk" FOREIGN KEY ("intake_record_id") REFERENCES "public"."fresh_produce_intake"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_water_tests" ADD CONSTRAINT "horticulture_water_tests_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horticulture_water_tests" ADD CONSTRAINT "horticulture_water_tests_lab_supplier_id_suppliers_id_fk" FOREIGN KEY ("lab_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fp_block_synthetic_history" ADD CONSTRAINT "organic_fp_block_synthetic_history_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fp_block_synthetic_history" ADD CONSTRAINT "organic_fp_block_synthetic_history_block_status_id_organic_fresh_produce_block_status_id_fk" FOREIGN KEY ("block_status_id") REFERENCES "public"."organic_fresh_produce_block_status"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fresh_produce_block_status" ADD CONSTRAINT "organic_fresh_produce_block_status_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fresh_produce_block_status" ADD CONSTRAINT "organic_fresh_produce_block_status_block_id_horticulture_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."horticulture_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fresh_produce_buyer_declarations" ADD CONSTRAINT "organic_fresh_produce_buyer_declarations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fresh_produce_certificates" ADD CONSTRAINT "organic_fresh_produce_certificates_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fresh_produce_input_log" ADD CONSTRAINT "organic_fresh_produce_input_log_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fresh_produce_input_log" ADD CONSTRAINT "organic_fresh_produce_input_log_block_id_horticulture_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."horticulture_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_certification" ADD CONSTRAINT "organic_certification_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_collection" ADD CONSTRAINT "organic_dairy_collection_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_feed" ADD CONSTRAINT "organic_dairy_feed_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_feed" ADD CONSTRAINT "organic_dairy_feed_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_feed" ADD CONSTRAINT "organic_dairy_feed_feed_delivery_id_feed_deliveries_id_fk" FOREIGN KEY ("feed_delivery_id") REFERENCES "public"."feed_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_herd_conversion" ADD CONSTRAINT "organic_dairy_herd_conversion_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_herd_conversion" ADD CONSTRAINT "organic_dairy_herd_conversion_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_treatment" ADD CONSTRAINT "organic_dairy_treatment_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_treatment" ADD CONSTRAINT "organic_dairy_treatment_medicine_record_id_livestock_medicine_records_id_fk" FOREIGN KEY ("medicine_record_id") REFERENCES "public"."livestock_medicine_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_dairy_treatment" ADD CONSTRAINT "organic_dairy_treatment_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_feed_derogation_correspondence" ADD CONSTRAINT "organic_feed_derogation_correspondence_derogation_id_organic_feed_derogation_id_fk" FOREIGN KEY ("derogation_id") REFERENCES "public"."organic_feed_derogation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_feed_derogation_correspondence" ADD CONSTRAINT "organic_feed_derogation_correspondence_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_feed_derogation" ADD CONSTRAINT "organic_feed_derogation_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_field_status" ADD CONSTRAINT "organic_field_status_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_field_status" ADD CONSTRAINT "organic_field_status_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fp_derogation_correspondence" ADD CONSTRAINT "organic_fp_derogation_correspondence_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fp_derogation_correspondence" ADD CONSTRAINT "organic_fp_derogation_correspondence_derogation_id_organic_fp_derogation_id_fk" FOREIGN KEY ("derogation_id") REFERENCES "public"."organic_fp_derogation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_fp_derogation" ADD CONSTRAINT "organic_fp_derogation_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_inputs" ADD CONSTRAINT "organic_inputs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_inputs" ADD CONSTRAINT "organic_inputs_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_inspection" ADD CONSTRAINT "organic_inspection_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_conversion" ADD CONSTRAINT "organic_livestock_conversion_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_conversion" ADD CONSTRAINT "organic_livestock_conversion_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_feed" ADD CONSTRAINT "organic_livestock_feed_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_feed" ADD CONSTRAINT "organic_livestock_feed_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_feed" ADD CONSTRAINT "organic_livestock_feed_feed_delivery_id_feed_deliveries_id_fk" FOREIGN KEY ("feed_delivery_id") REFERENCES "public"."feed_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_outdoor_access" ADD CONSTRAINT "organic_livestock_outdoor_access_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_outdoor_access" ADD CONSTRAINT "organic_livestock_outdoor_access_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_outdoor_access" ADD CONSTRAINT "organic_livestock_outdoor_access_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_parallel_notification" ADD CONSTRAINT "organic_livestock_parallel_notification_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_parallel_notification" ADD CONSTRAINT "organic_livestock_parallel_notification_conversion_id_organic_livestock_conversion_id_fk" FOREIGN KEY ("conversion_id") REFERENCES "public"."organic_livestock_conversion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_treatment" ADD CONSTRAINT "organic_livestock_treatment_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_treatment" ADD CONSTRAINT "organic_livestock_treatment_medicine_record_id_livestock_medicine_records_id_fk" FOREIGN KEY ("medicine_record_id") REFERENCES "public"."livestock_medicine_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_livestock_treatment" ADD CONSTRAINT "organic_livestock_treatment_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_block_status" ADD CONSTRAINT "organic_vit_block_status_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_certificate" ADD CONSTRAINT "organic_vit_certificate_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_copper_log" ADD CONSTRAINT "organic_vit_copper_log_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_derogation_correspondence" ADD CONSTRAINT "organic_vit_derogation_correspondence_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_derogation_correspondence" ADD CONSTRAINT "organic_vit_derogation_correspondence_derogation_id_organic_vit_derogation_id_fk" FOREIGN KEY ("derogation_id") REFERENCES "public"."organic_vit_derogation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_derogation" ADD CONSTRAINT "organic_vit_derogation_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_input_log" ADD CONSTRAINT "organic_vit_input_log_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organic_vit_wine_production" ADD CONSTRAINT "organic_vit_wine_production_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biodiversity_net_gain" ADD CONSTRAINT "biodiversity_net_gain_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_audits" ADD CONSTRAINT "carbon_audits_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions_records" ADD CONSTRAINT "carbon_emissions_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions_records" ADD CONSTRAINT "carbon_emissions_records_audit_id_carbon_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."carbon_audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_reduction_actions" ADD CONSTRAINT "carbon_reduction_actions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_sequestration" ADD CONSTRAINT "carbon_sequestration_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_sequestration" ADD CONSTRAINT "carbon_sequestration_audit_id_carbon_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."carbon_audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewable_energy_production" ADD CONSTRAINT "renewable_energy_production_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustainability_reports" ADD CONSTRAINT "sustainability_reports_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diversification_activities" ADD CONSTRAINT "diversification_activities_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diversification_income_records" ADD CONSTRAINT "diversification_income_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diversification_income_records" ADD CONSTRAINT "diversification_income_records_activity_id_diversification_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."diversification_activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equine_health_events" ADD CONSTRAINT "equine_health_events_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equine_health_events" ADD CONSTRAINT "equine_health_events_horse_id_equine_records_id_fk" FOREIGN KEY ("horse_id") REFERENCES "public"."equine_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equine_records" ADD CONSTRAINT "equine_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_hygiene_inspections" ADD CONSTRAINT "farm_shop_hygiene_inspections_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_products" ADD CONSTRAINT "farm_shop_products_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_purchases" ADD CONSTRAINT "farm_shop_purchases_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_purchases" ADD CONSTRAINT "farm_shop_purchases_supplier_id_farm_shop_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."farm_shop_suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_purchases" ADD CONSTRAINT "farm_shop_purchases_product_id_farm_shop_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."farm_shop_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_sale_items" ADD CONSTRAINT "farm_shop_sale_items_session_id_farm_shop_sales_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."farm_shop_sales_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_sale_items" ADD CONSTRAINT "farm_shop_sale_items_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_sale_items" ADD CONSTRAINT "farm_shop_sale_items_product_id_farm_shop_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."farm_shop_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_sales_sessions" ADD CONSTRAINT "farm_shop_sales_sessions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_stocktake_items" ADD CONSTRAINT "farm_shop_stocktake_items_session_id_farm_shop_stocktake_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."farm_shop_stocktake_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_stocktake_items" ADD CONSTRAINT "farm_shop_stocktake_items_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_stocktake_items" ADD CONSTRAINT "farm_shop_stocktake_items_product_id_farm_shop_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."farm_shop_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_stocktake_sessions" ADD CONSTRAINT "farm_shop_stocktake_sessions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_shop_suppliers" ADD CONSTRAINT "farm_shop_suppliers_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewable_energy_installations" ADD CONSTRAINT "renewable_energy_installations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewable_energy_meter_readings" ADD CONSTRAINT "renewable_energy_meter_readings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewable_energy_meter_readings" ADD CONSTRAINT "renewable_energy_meter_readings_installation_id_renewable_energy_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."renewable_energy_installations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shooting_and_game_records" ADD CONSTRAINT "shooting_and_game_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solar_export_payments" ADD CONSTRAINT "solar_export_payments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solar_export_payments" ADD CONSTRAINT "solar_export_payments_installation_id_renewable_energy_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."renewable_energy_installations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solar_installation_documents" ADD CONSTRAINT "solar_installation_documents_installation_id_renewable_energy_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."renewable_energy_installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solar_installation_documents" ADD CONSTRAINT "solar_installation_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borehole_tests" ADD CONSTRAINT "borehole_tests_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borehole_tests" ADD CONSTRAINT "borehole_tests_licence_id_water_abstraction_licences_id_fk" FOREIGN KEY ("licence_id") REFERENCES "public"."water_abstraction_licences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cams_annual_returns" ADD CONSTRAINT "cams_annual_returns_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cams_annual_returns" ADD CONSTRAINT "cams_annual_returns_licence_id_water_abstraction_licences_id_fk" FOREIGN KEY ("licence_id") REFERENCES "public"."water_abstraction_licences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drought_management_plans" ADD CONSTRAINT "drought_management_plans_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drought_management_plans" ADD CONSTRAINT "drought_management_plans_licence_id_water_abstraction_licences_id_fk" FOREIGN KEY ("licence_id") REFERENCES "public"."water_abstraction_licences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irrigation_equipment" ADD CONSTRAINT "irrigation_equipment_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irrigation_records" ADD CONSTRAINT "irrigation_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irrigation_records" ADD CONSTRAINT "irrigation_records_licence_id_water_abstraction_licences_id_fk" FOREIGN KEY ("licence_id") REFERENCES "public"."water_abstraction_licences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_moisture_readings" ADD CONSTRAINT "soil_moisture_readings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_abstraction_licences" ADD CONSTRAINT "water_abstraction_licences_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_meter_readings" ADD CONSTRAINT "water_meter_readings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_meter_readings" ADD CONSTRAINT "water_meter_readings_licence_id_water_abstraction_licences_id_fk" FOREIGN KEY ("licence_id") REFERENCES "public"."water_abstraction_licences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_insurance_claims" ADD CONSTRAINT "farm_insurance_claims_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_insurance_claims" ADD CONSTRAINT "farm_insurance_claims_insurance_record_id_farm_insurance_id_fk" FOREIGN KEY ("insurance_record_id") REFERENCES "public"."farm_insurance"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_insurance_documents" ADD CONSTRAINT "farm_insurance_documents_insurance_record_id_farm_insurance_id_fk" FOREIGN KEY ("insurance_record_id") REFERENCES "public"."farm_insurance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_insurance_documents" ADD CONSTRAINT "farm_insurance_documents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_insurance" ADD CONSTRAINT "farm_insurance_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_planner_events" ADD CONSTRAINT "farm_planner_events_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_grants" ADD CONSTRAINT "farm_grants_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_tank_id_fuel_tanks_id_fk" FOREIGN KEY ("tank_id") REFERENCES "public"."fuel_tanks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_stock_checks" ADD CONSTRAINT "fuel_stock_checks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_stock_checks" ADD CONSTRAINT "fuel_stock_checks_tank_id_fuel_tanks_id_fk" FOREIGN KEY ("tank_id") REFERENCES "public"."fuel_tanks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_storage_inspections" ADD CONSTRAINT "fuel_storage_inspections_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_storage_inspections" ADD CONSTRAINT "fuel_storage_inspections_tank_id_fuel_tanks_id_fk" FOREIGN KEY ("tank_id") REFERENCES "public"."fuel_tanks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_tanks" ADD CONSTRAINT "fuel_tanks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_tanks" ADD CONSTRAINT "fuel_tanks_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_usage" ADD CONSTRAINT "fuel_usage_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_usage" ADD CONSTRAINT "fuel_usage_tank_id_fuel_tanks_id_fk" FOREIGN KEY ("tank_id") REFERENCES "public"."fuel_tanks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_usage" ADD CONSTRAINT "fuel_usage_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_usage" ADD CONSTRAINT "fuel_usage_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grid_energy_meters" ADD CONSTRAINT "grid_energy_meters_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grid_energy_readings" ADD CONSTRAINT "grid_energy_readings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grid_energy_readings" ADD CONSTRAINT "grid_energy_readings_meter_id_grid_energy_meters_id_fk" FOREIGN KEY ("meter_id") REFERENCES "public"."grid_energy_meters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_deliveries" ADD CONSTRAINT "feed_deliveries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_deliveries" ADD CONSTRAINT "feed_deliveries_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_deliveries" ADD CONSTRAINT "feed_deliveries_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_purchase_orders" ADD CONSTRAINT "feed_purchase_orders_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_purchase_orders" ADD CONSTRAINT "feed_purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_stock_levels" ADD CONSTRAINT "feed_stock_levels_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_stock_levels" ADD CONSTRAINT "feed_stock_levels_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disease_incident_log" ADD CONSTRAINT "disease_incident_log_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_contingency_plans" ADD CONSTRAINT "feed_contingency_plans_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_recall_incidents" ADD CONSTRAINT "feed_recall_incidents_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_stock_targets" ADD CONSTRAINT "feed_stock_targets_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_observations" ADD CONSTRAINT "crop_trial_observations_plot_id_crop_trial_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."crop_trial_plots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_observations" ADD CONSTRAINT "crop_trial_observations_trial_id_crop_trials_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."crop_trials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_observations" ADD CONSTRAINT "crop_trial_observations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_plots" ADD CONSTRAINT "crop_trial_plots_trial_id_crop_trials_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."crop_trials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_plots" ADD CONSTRAINT "crop_trial_plots_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_treatments" ADD CONSTRAINT "crop_trial_treatments_plot_id_crop_trial_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."crop_trial_plots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_treatments" ADD CONSTRAINT "crop_trial_treatments_trial_id_crop_trials_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."crop_trials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_treatments" ADD CONSTRAINT "crop_trial_treatments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_yields" ADD CONSTRAINT "crop_trial_yields_plot_id_crop_trial_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."crop_trial_plots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_yields" ADD CONSTRAINT "crop_trial_yields_trial_id_crop_trials_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."crop_trials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trial_yields" ADD CONSTRAINT "crop_trial_yields_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trials" ADD CONSTRAINT "crop_trials_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trials" ADD CONSTRAINT "crop_trials_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_sales_records" ADD CONSTRAINT "direct_sales_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_sales_records" ADD CONSTRAINT "direct_sales_records_customer_id_suppliers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egg_sales" ADD CONSTRAINT "egg_sales_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egg_sales" ADD CONSTRAINT "egg_sales_packing_station_id_suppliers_id_fk" FOREIGN KEY ("packing_station_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_sales" ADD CONSTRAINT "grain_sales_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_sales" ADD CONSTRAINT "grain_sales_buyer_id_suppliers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_sales" ADD CONSTRAINT "grain_sales_store_bin_id_grain_storage_bins_id_fk" FOREIGN KEY ("store_bin_id") REFERENCES "public"."grain_storage_bins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_deadweight_sales" ADD CONSTRAINT "livestock_deadweight_sales_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_deadweight_sales" ADD CONSTRAINT "livestock_deadweight_sales_processor_id_suppliers_id_fk" FOREIGN KEY ("processor_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_deadweight_sales" ADD CONSTRAINT "livestock_deadweight_sales_movement_id_livestock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."livestock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_mart_sales" ADD CONSTRAINT "livestock_mart_sales_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_mart_sales" ADD CONSTRAINT "livestock_mart_sales_mart_id_suppliers_id_fk" FOREIGN KEY ("mart_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_mart_sales" ADD CONSTRAINT "livestock_mart_sales_movement_id_livestock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."livestock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk_statements" ADD CONSTRAINT "milk_statements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk_statements" ADD CONSTRAINT "milk_statements_buyer_id_suppliers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_kill_records" ADD CONSTRAINT "pig_kill_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pig_kill_records" ADD CONSTRAINT "pig_kill_records_processor_id_suppliers_id_fk" FOREIGN KEY ("processor_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_batch_settlements" ADD CONSTRAINT "poultry_batch_settlements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_batch_settlements" ADD CONSTRAINT "poultry_batch_settlements_integrator_id_suppliers_id_fk" FOREIGN KEY ("integrator_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_bookings" ADD CONSTRAINT "equipment_hire_bookings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_bookings" ADD CONSTRAINT "equipment_hire_bookings_customer_id_farm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."farm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_bookings" ADD CONSTRAINT "equipment_hire_bookings_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_bookings" ADD CONSTRAINT "equipment_hire_bookings_agreement_id_service_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."service_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_bookings" ADD CONSTRAINT "equipment_hire_bookings_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_condition_logs" ADD CONSTRAINT "equipment_hire_condition_logs_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_condition_logs" ADD CONSTRAINT "equipment_hire_condition_logs_booking_id_equipment_hire_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."equipment_hire_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_fuel_issues" ADD CONSTRAINT "equipment_hire_fuel_issues_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_hire_fuel_issues" ADD CONSTRAINT "equipment_hire_fuel_issues_booking_id_equipment_hire_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."equipment_hire_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_customers" ADD CONSTRAINT "farm_customers_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_agreements" ADD CONSTRAINT "service_agreements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_agreements" ADD CONSTRAINT "service_agreements_customer_id_farm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."farm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_agreements" ADD CONSTRAINT "service_agreements_storage_location_id_storage_locations_id_fk" FOREIGN KEY ("storage_location_id") REFERENCES "public"."storage_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_invoice_lines" ADD CONSTRAINT "service_invoice_lines_invoice_id_service_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."service_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_invoices" ADD CONSTRAINT "service_invoices_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_invoices" ADD CONSTRAINT "service_invoices_customer_id_farm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."farm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_invoices" ADD CONSTRAINT "service_invoices_agreement_id_service_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."service_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "third_party_grain_intakes" ADD CONSTRAINT "third_party_grain_intakes_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "third_party_grain_intakes" ADD CONSTRAINT "third_party_grain_intakes_customer_id_farm_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."farm_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "third_party_grain_intakes" ADD CONSTRAINT "third_party_grain_intakes_agreement_id_service_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."service_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "third_party_grain_intakes" ADD CONSTRAINT "third_party_grain_intakes_storage_location_id_storage_locations_id_fk" FOREIGN KEY ("storage_location_id") REFERENCES "public"."storage_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "third_party_grain_movements" ADD CONSTRAINT "third_party_grain_movements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "third_party_grain_movements" ADD CONSTRAINT "third_party_grain_movements_intake_id_third_party_grain_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."third_party_grain_intakes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_invoice_lines" ADD CONSTRAINT "vet_invoice_lines_invoice_id_vet_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."vet_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_invoices" ADD CONSTRAINT "vet_invoices_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_visit_medicines" ADD CONSTRAINT "vet_visit_medicines_visit_id_vet_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."vet_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_visits" ADD CONSTRAINT "vet_visits_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_contacts" ADD CONSTRAINT "contractor_contacts_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_contacts" ADD CONSTRAINT "contractor_contacts_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_rams" ADD CONSTRAINT "contractor_rams_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_rams" ADD CONSTRAINT "contractor_rams_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppe_issue_records" ADD CONSTRAINT "ppe_issue_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppe_issue_records" ADD CONSTRAINT "ppe_issue_records_stock_item_id_ppe_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."ppe_stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppe_risk_assessments" ADD CONSTRAINT "ppe_risk_assessments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppe_stock_items" ADD CONSTRAINT "ppe_stock_items_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppe_stock_items" ADD CONSTRAINT "ppe_stock_items_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_dipping_records" ADD CONSTRAINT "sheep_dipping_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_dipping_records" ADD CONSTRAINT "sheep_dipping_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_tests" ADD CONSTRAINT "tb_tests_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_tests" ADD CONSTRAINT "tb_tests_movement_id_livestock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."livestock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "welfare_outcome_assessments" ADD CONSTRAINT "welfare_outcome_assessments_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_cull_records" ADD CONSTRAINT "sheep_cull_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_cull_records" ADD CONSTRAINT "sheep_cull_records_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_disease_monitoring" ADD CONSTRAINT "sheep_disease_monitoring_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_disease_monitoring" ADD CONSTRAINT "sheep_disease_monitoring_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_flocks" ADD CONSTRAINT "sheep_flocks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_red_tractor_checklists" ADD CONSTRAINT "sheep_red_tractor_checklists_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_scanning_records" ADD CONSTRAINT "sheep_scanning_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_scanning_records" ADD CONSTRAINT "sheep_scanning_records_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_shearing_records" ADD CONSTRAINT "sheep_shearing_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_shearing_records" ADD CONSTRAINT "sheep_shearing_records_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_tupping_records" ADD CONSTRAINT "sheep_tupping_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_tupping_records" ADD CONSTRAINT "sheep_tupping_records_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_vaccination_programmes" ADD CONSTRAINT "sheep_vaccination_programmes_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_vaccination_programmes" ADD CONSTRAINT "sheep_vaccination_programmes_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_weigh_records" ADD CONSTRAINT "sheep_weigh_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheep_weigh_records" ADD CONSTRAINT "sheep_weigh_records_flock_id_herd_flock_register_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_animal_weigh_entries" ADD CONSTRAINT "beef_animal_weigh_entries_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_animal_weigh_entries" ADD CONSTRAINT "beef_animal_weigh_entries_weigh_record_id_beef_weigh_records_id_fk" FOREIGN KEY ("weigh_record_id") REFERENCES "public"."beef_weigh_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_animal_weigh_entries" ADD CONSTRAINT "beef_animal_weigh_entries_animal_id_livestock_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."livestock_animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_deadweight_settlements" ADD CONSTRAINT "beef_deadweight_settlements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_deadweight_settlements" ADD CONSTRAINT "beef_deadweight_settlements_finishing_record_id_beef_finishing_records_id_fk" FOREIGN KEY ("finishing_record_id") REFERENCES "public"."beef_finishing_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_finishing_records" ADD CONSTRAINT "beef_finishing_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_finishing_records" ADD CONSTRAINT "beef_finishing_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_red_tractor_checklists" ADD CONSTRAINT "beef_red_tractor_checklists_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_weigh_records" ADD CONSTRAINT "beef_weigh_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beef_weigh_records" ADD CONSTRAINT "beef_weigh_records_herd_id_herd_flock_register_id_fk" FOREIGN KEY ("herd_id") REFERENCES "public"."herd_flock_register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_conditioning_records" ADD CONSTRAINT "grain_conditioning_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_drying_records" ADD CONSTRAINT "grain_drying_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_storage_agreements" ADD CONSTRAINT "grain_storage_agreements_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grain_settlement_notes" ADD CONSTRAINT "grain_settlement_notes_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestock_settlement_notes" ADD CONSTRAINT "livestock_settlement_notes_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicated_feed_records" ADD CONSTRAINT "medicated_feed_records_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vine_register" ADD CONSTRAINT "vine_register_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vine_register" ADD CONSTRAINT "vine_register_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vine_register" ADD CONSTRAINT "vine_register_planting_id_vineyard_block_plantings_id_fk" FOREIGN KEY ("planting_id") REFERENCES "public"."vineyard_block_plantings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_block_boundaries" ADD CONSTRAINT "vineyard_block_boundaries_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_block_plantings" ADD CONSTRAINT "vineyard_block_plantings_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_block_plantings" ADD CONSTRAINT "vineyard_block_plantings_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_blocks" ADD CONSTRAINT "vineyard_blocks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_harvest" ADD CONSTRAINT "vineyard_harvest_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_harvest" ADD CONSTRAINT "vineyard_harvest_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_harvest" ADD CONSTRAINT "vineyard_harvest_planting_id_vineyard_block_plantings_id_fk" FOREIGN KEY ("planting_id") REFERENCES "public"."vineyard_block_plantings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_operations" ADD CONSTRAINT "vineyard_operations_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_operations" ADD CONSTRAINT "vineyard_operations_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_operations" ADD CONSTRAINT "vineyard_operations_planting_id_vineyard_block_plantings_id_fk" FOREIGN KEY ("planting_id") REFERENCES "public"."vineyard_block_plantings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_phenology" ADD CONSTRAINT "vineyard_phenology_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_phenology" ADD CONSTRAINT "vineyard_phenology_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_phenology" ADD CONSTRAINT "vineyard_phenology_planting_id_vineyard_block_plantings_id_fk" FOREIGN KEY ("planting_id") REFERENCES "public"."vineyard_block_plantings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_scouting" ADD CONSTRAINT "vineyard_scouting_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_scouting" ADD CONSTRAINT "vineyard_scouting_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_scouting" ADD CONSTRAINT "vineyard_scouting_planting_id_vineyard_block_plantings_id_fk" FOREIGN KEY ("planting_id") REFERENCES "public"."vineyard_block_plantings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_soil_analysis" ADD CONSTRAINT "vineyard_soil_analysis_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_soil_analysis" ADD CONSTRAINT "vineyard_soil_analysis_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_spray_diary" ADD CONSTRAINT "vineyard_spray_diary_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vineyard_spray_diary" ADD CONSTRAINT "vineyard_spray_diary_block_id_vineyard_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."vineyard_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winery_age_verification" ADD CONSTRAINT "winery_age_verification_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winery_excise_returns" ADD CONSTRAINT "winery_excise_returns_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winery_licences" ADD CONSTRAINT "winery_licences_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winery_tasting_sessions" ADD CONSTRAINT "winery_tasting_sessions_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_dept_membership_uniq" ON "staff_department_memberships" USING btree ("member_id","department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_farm_unique" ON "staff_farm_assignments" USING btree ("user_id","farm_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_tenant_unique" ON "user_tenants" USING btree ("user_id","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "crop_stock_levels_farm_bin_unique" ON "crop_stock_levels" USING btree ("farm_id","bin_id");