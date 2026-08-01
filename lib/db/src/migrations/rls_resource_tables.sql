-- ──────────────────────────────────────────────────────────────────────────────
-- Row-Level Security: farm-scoped resource tables
-- Run once. All policies are fail-open when app.current_farm_id is not set,
-- so existing functionality is preserved until the RLS middleware is wired up.
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE accident_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_book FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS accident_book_farm_isolation ON accident_book;
CREATE POLICY accident_book_farm_isolation ON accident_book
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE accident_book_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_book_photos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS accident_book_photos_farm_isolation ON accident_book_photos;
CREATE POLICY accident_book_photos_farm_isolation ON accident_book_photos
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE agri_environment_scheme_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE agri_environment_scheme_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agri_environment_scheme_records_farm_isolation ON agri_environment_scheme_records;
CREATE POLICY agri_environment_scheme_records_farm_isolation ON agri_environment_scheme_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE ai_reproduction_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reproduction_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_reproduction_records_farm_isolation ON ai_reproduction_records;
CREATE POLICY ai_reproduction_records_farm_isolation ON ai_reproduction_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE allergen_management_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergen_management_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allergen_management_records_farm_isolation ON allergen_management_records;
CREATE POLICY allergen_management_records_farm_isolation ON allergen_management_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE animal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS animal_documents_farm_isolation ON animal_documents;
CREATE POLICY animal_documents_farm_isolation ON animal_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE bcms_farm_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcms_farm_credentials FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bcms_farm_credentials_farm_isolation ON bcms_farm_credentials;
CREATE POLICY bcms_farm_credentials_farm_isolation ON bcms_farm_credentials
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE bcms_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcms_submissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bcms_submissions_farm_isolation ON bcms_submissions;
CREATE POLICY bcms_submissions_farm_isolation ON bcms_submissions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE beef_animal_weigh_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE beef_animal_weigh_entries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS beef_animal_weigh_entries_farm_isolation ON beef_animal_weigh_entries;
CREATE POLICY beef_animal_weigh_entries_farm_isolation ON beef_animal_weigh_entries
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE beef_deadweight_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE beef_deadweight_settlements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS beef_deadweight_settlements_farm_isolation ON beef_deadweight_settlements;
CREATE POLICY beef_deadweight_settlements_farm_isolation ON beef_deadweight_settlements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE beef_finishing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE beef_finishing_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS beef_finishing_records_farm_isolation ON beef_finishing_records;
CREATE POLICY beef_finishing_records_farm_isolation ON beef_finishing_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE beef_red_tractor_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE beef_red_tractor_checklists FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS beef_red_tractor_checklists_farm_isolation ON beef_red_tractor_checklists;
CREATE POLICY beef_red_tractor_checklists_farm_isolation ON beef_red_tractor_checklists
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE beef_weigh_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE beef_weigh_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS beef_weigh_records_farm_isolation ON beef_weigh_records;
CREATE POLICY beef_weigh_records_farm_isolation ON beef_weigh_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE biodiversity_net_gain ENABLE ROW LEVEL SECURITY;
ALTER TABLE biodiversity_net_gain FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS biodiversity_net_gain_farm_isolation ON biodiversity_net_gain;
CREATE POLICY biodiversity_net_gain_farm_isolation ON biodiversity_net_gain
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE biofuel_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE biofuel_certifications FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS biofuel_certifications_farm_isolation ON biofuel_certifications;
CREATE POLICY biofuel_certifications_farm_isolation ON biofuel_certifications
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE biofuel_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE biofuel_deliveries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS biofuel_deliveries_farm_isolation ON biofuel_deliveries;
CREATE POLICY biofuel_deliveries_farm_isolation ON biofuel_deliveries
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE biofuel_field_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE biofuel_field_declarations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS biofuel_field_declarations_farm_isolation ON biofuel_field_declarations;
CREATE POLICY biofuel_field_declarations_farm_isolation ON biofuel_field_declarations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE biosecurity_cleaning_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE biosecurity_cleaning_schedules FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS biosecurity_cleaning_schedules_farm_isolation ON biosecurity_cleaning_schedules;
CREATE POLICY biosecurity_cleaning_schedules_farm_isolation ON biosecurity_cleaning_schedules
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE biosecurity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE biosecurity_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS biosecurity_plans_farm_isolation ON biosecurity_plans;
CREATE POLICY biosecurity_plans_farm_isolation ON biosecurity_plans
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE borehole_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE borehole_tests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS borehole_tests_farm_isolation ON borehole_tests;
CREATE POLICY borehole_tests_farm_isolation ON borehole_tests
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE bvd_testing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bvd_testing_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bvd_testing_records_farm_isolation ON bvd_testing_records;
CREATE POLICY bvd_testing_records_farm_isolation ON bvd_testing_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE campylobacter_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE campylobacter_monitoring FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS campylobacter_monitoring_farm_isolation ON campylobacter_monitoring;
CREATE POLICY campylobacter_monitoring_farm_isolation ON campylobacter_monitoring
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE cams_annual_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cams_annual_returns FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cams_annual_returns_farm_isolation ON cams_annual_returns;
CREATE POLICY cams_annual_returns_farm_isolation ON cams_annual_returns
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE carbon_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_audits FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS carbon_audits_farm_isolation ON carbon_audits;
CREATE POLICY carbon_audits_farm_isolation ON carbon_audits
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE carbon_emissions_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_emissions_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS carbon_emissions_records_farm_isolation ON carbon_emissions_records;
CREATE POLICY carbon_emissions_records_farm_isolation ON carbon_emissions_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE carbon_reduction_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_reduction_actions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS carbon_reduction_actions_farm_isolation ON carbon_reduction_actions;
CREATE POLICY carbon_reduction_actions_farm_isolation ON carbon_reduction_actions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE carbon_sequestration ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_sequestration FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS carbon_sequestration_farm_isolation ON carbon_sequestration;
CREATE POLICY carbon_sequestration_farm_isolation ON carbon_sequestration
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE casualty_slaughter_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE casualty_slaughter_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS casualty_slaughter_records_farm_isolation ON casualty_slaughter_records;
CREATE POLICY casualty_slaughter_records_farm_isolation ON casualty_slaughter_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE cleaning_disinfection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_disinfection_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cleaning_disinfection_records_farm_isolation ON cleaning_disinfection_records;
CREATE POLICY cleaning_disinfection_records_farm_isolation ON cleaning_disinfection_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE contractor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_contacts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contractor_contacts_farm_isolation ON contractor_contacts;
CREATE POLICY contractor_contacts_farm_isolation ON contractor_contacts
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE contractor_rams ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_rams FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contractor_rams_farm_isolation ON contractor_rams;
CREATE POLICY contractor_rams_farm_isolation ON contractor_rams
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contractors_farm_isolation ON contractors;
CREATE POLICY contractors_farm_isolation ON contractors
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE coshh_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE coshh_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coshh_records_farm_isolation ON coshh_records;
CREATE POLICY coshh_records_farm_isolation ON coshh_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_contracts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_contracts_farm_isolation ON crop_contracts;
CREATE POLICY crop_contracts_farm_isolation ON crop_contracts
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_destinations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_destinations_farm_isolation ON crop_destinations;
CREATE POLICY crop_destinations_farm_isolation ON crop_destinations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_documents_farm_isolation ON crop_documents;
CREATE POLICY crop_documents_farm_isolation ON crop_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_financial_transactions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_financial_transactions_farm_isolation ON crop_financial_transactions;
CREATE POLICY crop_financial_transactions_farm_isolation ON crop_financial_transactions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stock_levels FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_stock_levels_farm_isolation ON crop_stock_levels;
CREATE POLICY crop_stock_levels_farm_isolation ON crop_stock_levels
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stock_movements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_stock_movements_farm_isolation ON crop_stock_movements;
CREATE POLICY crop_stock_movements_farm_isolation ON crop_stock_movements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_storage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_storage_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_storage_records_farm_isolation ON crop_storage_records;
CREATE POLICY crop_storage_records_farm_isolation ON crop_storage_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_trial_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_trial_observations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_trial_observations_farm_isolation ON crop_trial_observations;
CREATE POLICY crop_trial_observations_farm_isolation ON crop_trial_observations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_trial_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_trial_plots FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_trial_plots_farm_isolation ON crop_trial_plots;
CREATE POLICY crop_trial_plots_farm_isolation ON crop_trial_plots
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_trial_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_trial_treatments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_trial_treatments_farm_isolation ON crop_trial_treatments;
CREATE POLICY crop_trial_treatments_farm_isolation ON crop_trial_treatments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_trial_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_trial_yields FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_trial_yields_farm_isolation ON crop_trial_yields;
CREATE POLICY crop_trial_yields_farm_isolation ON crop_trial_yields
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crop_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_trials FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_trials_farm_isolation ON crop_trials;
CREATE POLICY crop_trials_farm_isolation ON crop_trials
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crops_farm_isolation ON crops;
CREATE POLICY crops_farm_isolation ON crops
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_abr_test_kit_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_abr_test_kit_stock FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_abr_test_kit_stock_farm_isolation ON dairy_abr_test_kit_stock;
CREATE POLICY dairy_abr_test_kit_stock_farm_isolation ON dairy_abr_test_kit_stock
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_bcs_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_bcs_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_bcs_records_farm_isolation ON dairy_bcs_records;
CREATE POLICY dairy_bcs_records_farm_isolation ON dairy_bcs_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_bulk_tank_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_bulk_tank_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_bulk_tank_records_farm_isolation ON dairy_bulk_tank_records;
CREATE POLICY dairy_bulk_tank_records_farm_isolation ON dairy_bulk_tank_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_bulk_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_bulk_tanks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_bulk_tanks_farm_isolation ON dairy_bulk_tanks;
CREATE POLICY dairy_bulk_tanks_farm_isolation ON dairy_bulk_tanks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_calving_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_calving_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_calving_records_farm_isolation ON dairy_calving_records;
CREATE POLICY dairy_calving_records_farm_isolation ON dairy_calving_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_dct_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_dct_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_dct_records_farm_isolation ON dairy_dct_records;
CREATE POLICY dairy_dct_records_farm_isolation ON dairy_dct_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_mastitis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_mastitis_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_mastitis_records_farm_isolation ON dairy_mastitis_records;
CREATE POLICY dairy_mastitis_records_farm_isolation ON dairy_mastitis_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_milk_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_milk_collections FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_milk_collections_farm_isolation ON dairy_milk_collections;
CREATE POLICY dairy_milk_collections_farm_isolation ON dairy_milk_collections
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_milk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_milk_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_milk_records_farm_isolation ON dairy_milk_records;
CREATE POLICY dairy_milk_records_farm_isolation ON dairy_milk_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dairy_mobility_scorings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_mobility_scorings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dairy_mobility_scorings_farm_isolation ON dairy_mobility_scorings;
CREATE POLICY dairy_mobility_scorings_farm_isolation ON dairy_mobility_scorings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE direct_sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_sales_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS direct_sales_records_farm_isolation ON direct_sales_records;
CREATE POLICY direct_sales_records_farm_isolation ON direct_sales_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE disease_incident_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_incident_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS disease_incident_log_farm_isolation ON disease_incident_log;
CREATE POLICY disease_incident_log_farm_isolation ON disease_incident_log
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE dispatch_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dispatch_plans_farm_isolation ON dispatch_plans;
CREATE POLICY dispatch_plans_farm_isolation ON dispatch_plans
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE diversification_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE diversification_activities FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS diversification_activities_farm_isolation ON diversification_activities;
CREATE POLICY diversification_activities_farm_isolation ON diversification_activities
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE diversification_income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diversification_income_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS diversification_income_records_farm_isolation ON diversification_income_records;
CREATE POLICY diversification_income_records_farm_isolation ON diversification_income_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE document_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS document_records_farm_isolation ON document_records;
CREATE POLICY document_records_farm_isolation ON document_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE drought_management_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE drought_management_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS drought_management_plans_farm_isolation ON drought_management_plans;
CREATE POLICY drought_management_plans_farm_isolation ON drought_management_plans
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE egg_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_sales FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS egg_sales_farm_isolation ON egg_sales;
CREATE POLICY egg_sales_farm_isolation ON egg_sales
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE encampment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE encampment_photos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS encampment_photos_farm_isolation ON encampment_photos;
CREATE POLICY encampment_photos_farm_isolation ON encampment_photos
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE environmental_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS environmental_assessments_farm_isolation ON environmental_assessments;
CREATE POLICY environmental_assessments_farm_isolation ON environmental_assessments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE environmental_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_features FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS environmental_features_farm_isolation ON environmental_features;
CREATE POLICY environmental_features_farm_isolation ON environmental_features
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE environmental_management_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_management_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS environmental_management_events_farm_isolation ON environmental_management_events;
CREATE POLICY environmental_management_events_farm_isolation ON environmental_management_events
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE equine_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE equine_health_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS equine_health_events_farm_isolation ON equine_health_events;
CREATE POLICY equine_health_events_farm_isolation ON equine_health_events
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE equine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE equine_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS equine_records_farm_isolation ON equine_records;
CREATE POLICY equine_records_farm_isolation ON equine_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS equipment_farm_isolation ON equipment;
CREATE POLICY equipment_farm_isolation ON equipment
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE equipment_defect_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_defect_reports FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS equipment_defect_reports_farm_isolation ON equipment_defect_reports;
CREATE POLICY equipment_defect_reports_farm_isolation ON equipment_defect_reports
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE equipment_hire_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_hire_bookings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS equipment_hire_bookings_farm_isolation ON equipment_hire_bookings;
CREATE POLICY equipment_hire_bookings_farm_isolation ON equipment_hire_bookings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE equipment_hire_condition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_hire_condition_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS equipment_hire_condition_logs_farm_isolation ON equipment_hire_condition_logs;
CREATE POLICY equipment_hire_condition_logs_farm_isolation ON equipment_hire_condition_logs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE equipment_hire_fuel_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_hire_fuel_issues FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS equipment_hire_fuel_issues_farm_isolation ON equipment_hire_fuel_issues;
CREATE POLICY equipment_hire_fuel_issues_farm_isolation ON equipment_hire_fuel_issues
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE expo_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE expo_push_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS expo_push_tokens_farm_isolation ON expo_push_tokens;
CREATE POLICY expo_push_tokens_farm_isolation ON expo_push_tokens
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE external_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_access_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS external_access_log_farm_isolation ON external_access_log;
CREATE POLICY external_access_log_farm_isolation ON external_access_log
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fallen_stock_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fallen_stock_contractors FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fallen_stock_contractors_farm_isolation ON fallen_stock_contractors;
CREATE POLICY fallen_stock_contractors_farm_isolation ON fallen_stock_contractors
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_advisors FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_advisors_farm_isolation ON farm_advisors;
CREATE POLICY farm_advisors_farm_isolation ON farm_advisors
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_assurance_certs ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_assurance_certs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_assurance_certs_farm_isolation ON farm_assurance_certs;
CREATE POLICY farm_assurance_certs_farm_isolation ON farm_assurance_certs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_contacts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_contacts_farm_isolation ON farm_contacts;
CREATE POLICY farm_contacts_farm_isolation ON farm_contacts
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_customers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_customers_farm_isolation ON farm_customers;
CREATE POLICY farm_customers_farm_isolation ON farm_customers
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_departments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_departments_farm_isolation ON farm_departments;
CREATE POLICY farm_departments_farm_isolation ON farm_departments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_grants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_grants_farm_isolation ON farm_grants;
CREATE POLICY farm_grants_farm_isolation ON farm_grants
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_inspection_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_inspection_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_inspection_sessions_farm_isolation ON farm_inspection_sessions;
CREATE POLICY farm_inspection_sessions_farm_isolation ON farm_inspection_sessions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_insurance FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_insurance_farm_isolation ON farm_insurance;
CREATE POLICY farm_insurance_farm_isolation ON farm_insurance
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_insurance_claims FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_insurance_claims_farm_isolation ON farm_insurance_claims;
CREATE POLICY farm_insurance_claims_farm_isolation ON farm_insurance_claims
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_insurance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_insurance_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_insurance_documents_farm_isolation ON farm_insurance_documents;
CREATE POLICY farm_insurance_documents_farm_isolation ON farm_insurance_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_locations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_locations_farm_isolation ON farm_locations;
CREATE POLICY farm_locations_farm_isolation ON farm_locations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_planner_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_planner_events_farm_isolation ON farm_planner_events;
CREATE POLICY farm_planner_events_farm_isolation ON farm_planner_events
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_hygiene_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_hygiene_inspections FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_hygiene_inspections_farm_isolation ON farm_shop_hygiene_inspections;
CREATE POLICY farm_shop_hygiene_inspections_farm_isolation ON farm_shop_hygiene_inspections
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_products FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_products_farm_isolation ON farm_shop_products;
CREATE POLICY farm_shop_products_farm_isolation ON farm_shop_products
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_purchases FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_purchases_farm_isolation ON farm_shop_purchases;
CREATE POLICY farm_shop_purchases_farm_isolation ON farm_shop_purchases
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_sale_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_sale_items_farm_isolation ON farm_shop_sale_items;
CREATE POLICY farm_shop_sale_items_farm_isolation ON farm_shop_sale_items
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_sales_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_sales_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_sales_sessions_farm_isolation ON farm_shop_sales_sessions;
CREATE POLICY farm_shop_sales_sessions_farm_isolation ON farm_shop_sales_sessions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_stocktake_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_stocktake_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_stocktake_items_farm_isolation ON farm_shop_stocktake_items;
CREATE POLICY farm_shop_stocktake_items_farm_isolation ON farm_shop_stocktake_items
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_stocktake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_stocktake_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_stocktake_sessions_farm_isolation ON farm_shop_stocktake_sessions;
CREATE POLICY farm_shop_stocktake_sessions_farm_isolation ON farm_shop_stocktake_sessions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_shop_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_shop_suppliers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_shop_suppliers_farm_isolation ON farm_shop_suppliers;
CREATE POLICY farm_shop_suppliers_farm_isolation ON farm_shop_suppliers
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_task_assignments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_task_assignments_farm_isolation ON farm_task_assignments;
CREATE POLICY farm_task_assignments_farm_isolation ON farm_task_assignments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE feed_contingency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_contingency_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feed_contingency_plans_farm_isolation ON feed_contingency_plans;
CREATE POLICY feed_contingency_plans_farm_isolation ON feed_contingency_plans
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE feed_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_deliveries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feed_deliveries_farm_isolation ON feed_deliveries;
CREATE POLICY feed_deliveries_farm_isolation ON feed_deliveries
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE feed_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_purchase_orders FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feed_purchase_orders_farm_isolation ON feed_purchase_orders;
CREATE POLICY feed_purchase_orders_farm_isolation ON feed_purchase_orders
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE feed_recall_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_recall_incidents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feed_recall_incidents_farm_isolation ON feed_recall_incidents;
CREATE POLICY feed_recall_incidents_farm_isolation ON feed_recall_incidents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE feed_stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_stock_levels FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feed_stock_levels_farm_isolation ON feed_stock_levels;
CREATE POLICY feed_stock_levels_farm_isolation ON feed_stock_levels
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE feed_stock_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_stock_targets FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feed_stock_targets_farm_isolation ON feed_stock_targets;
CREATE POLICY feed_stock_targets_farm_isolation ON feed_stock_targets
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE field_inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_inspection_photos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS field_inspection_photos_farm_isolation ON field_inspection_photos;
CREATE POLICY field_inspection_photos_farm_isolation ON field_inspection_photos
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE field_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_inspections FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS field_inspections_farm_isolation ON field_inspections;
CREATE POLICY field_inspections_farm_isolation ON field_inspections
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_operations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS field_operations_farm_isolation ON field_operations;
CREATE POLICY field_operations_farm_isolation ON field_operations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE field_season_land_use ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_season_land_use FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS field_season_land_use_farm_isolation ON field_season_land_use;
CREATE POLICY field_season_land_use_farm_isolation ON field_season_land_use
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE field_tenure_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_tenure_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS field_tenure_documents_farm_isolation ON field_tenure_documents;
CREATE POLICY field_tenure_documents_farm_isolation ON field_tenure_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fields_farm_isolation ON fields;
CREATE POLICY fields_farm_isolation ON fields
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE financial_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_exports FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS financial_exports_farm_isolation ON financial_exports;
CREATE POLICY financial_exports_farm_isolation ON financial_exports
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS financial_transactions_farm_isolation ON financial_transactions;
CREATE POLICY financial_transactions_farm_isolation ON financial_transactions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fly_tipping_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fly_tipping_incidents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fly_tipping_incidents_farm_isolation ON fly_tipping_incidents;
CREATE POLICY fly_tipping_incidents_farm_isolation ON fly_tipping_incidents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fly_tipping_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fly_tipping_photos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fly_tipping_photos_farm_isolation ON fly_tipping_photos;
CREATE POLICY fly_tipping_photos_farm_isolation ON fly_tipping_photos
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE farm_incident_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_incident_photos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS farm_incident_photos_farm_isolation ON farm_incident_photos;
CREATE POLICY farm_incident_photos_farm_isolation ON farm_incident_photos
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fresh_produce_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE fresh_produce_intake FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fresh_produce_intake_farm_isolation ON fresh_produce_intake;
CREATE POLICY fresh_produce_intake_farm_isolation ON fresh_produce_intake
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fuel_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_deliveries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fuel_deliveries_farm_isolation ON fuel_deliveries;
CREATE POLICY fuel_deliveries_farm_isolation ON fuel_deliveries
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fuel_stock_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_stock_checks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fuel_stock_checks_farm_isolation ON fuel_stock_checks;
CREATE POLICY fuel_stock_checks_farm_isolation ON fuel_stock_checks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fuel_storage_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_storage_inspections FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fuel_storage_inspections_farm_isolation ON fuel_storage_inspections;
CREATE POLICY fuel_storage_inspections_farm_isolation ON fuel_storage_inspections
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fuel_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_tanks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fuel_tanks_farm_isolation ON fuel_tanks;
CREATE POLICY fuel_tanks_farm_isolation ON fuel_tanks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE fuel_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_usage FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fuel_usage_farm_isolation ON fuel_usage;
CREATE POLICY fuel_usage_farm_isolation ON fuel_usage
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_conditioning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_conditioning_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_conditioning_records_farm_isolation ON grain_conditioning_records;
CREATE POLICY grain_conditioning_records_farm_isolation ON grain_conditioning_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_drying_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_drying_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_drying_records_farm_isolation ON grain_drying_records;
CREATE POLICY grain_drying_records_farm_isolation ON grain_drying_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_quality_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_quality_tests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_quality_tests_farm_isolation ON grain_quality_tests;
CREATE POLICY grain_quality_tests_farm_isolation ON grain_quality_tests
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_sales FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_sales_farm_isolation ON grain_sales;
CREATE POLICY grain_sales_farm_isolation ON grain_sales
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_settlement_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_settlement_notes FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_settlement_notes_farm_isolation ON grain_settlement_notes;
CREATE POLICY grain_settlement_notes_farm_isolation ON grain_settlement_notes
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_storage_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_storage_agreements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_storage_agreements_farm_isolation ON grain_storage_agreements;
CREATE POLICY grain_storage_agreements_farm_isolation ON grain_storage_agreements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_storage_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_storage_bins FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_storage_bins_farm_isolation ON grain_storage_bins;
CREATE POLICY grain_storage_bins_farm_isolation ON grain_storage_bins
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grain_temperature_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE grain_temperature_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grain_temperature_logs_farm_isolation ON grain_temperature_logs;
CREATE POLICY grain_temperature_logs_farm_isolation ON grain_temperature_logs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grid_energy_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_energy_meters FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grid_energy_meters_farm_isolation ON grid_energy_meters;
CREATE POLICY grid_energy_meters_farm_isolation ON grid_energy_meters
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE grid_energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_energy_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grid_energy_readings_farm_isolation ON grid_energy_readings;
CREATE POLICY grid_energy_readings_farm_isolation ON grid_energy_readings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE haulage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE haulage_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS haulage_records_farm_isolation ON haulage_records;
CREATE POLICY haulage_records_farm_isolation ON haulage_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE haulier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE haulier_invoices FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS haulier_invoices_farm_isolation ON haulier_invoices;
CREATE POLICY haulier_invoices_farm_isolation ON haulier_invoices
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE hauliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hauliers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hauliers_farm_isolation ON hauliers;
CREATE POLICY hauliers_farm_isolation ON hauliers
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE herd_flock_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE herd_flock_register FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS herd_flock_register_farm_isolation ON herd_flock_register;
CREATE POLICY herd_flock_register_farm_isolation ON herd_flock_register
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE herd_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE herd_health_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS herd_health_events_farm_isolation ON herd_health_events;
CREATE POLICY herd_health_events_farm_isolation ON herd_health_events
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE horticulture_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE horticulture_blocks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS horticulture_blocks_farm_isolation ON horticulture_blocks;
CREATE POLICY horticulture_blocks_farm_isolation ON horticulture_blocks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE horticulture_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE horticulture_crops FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS horticulture_crops_farm_isolation ON horticulture_crops;
CREATE POLICY horticulture_crops_farm_isolation ON horticulture_crops
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE horticulture_harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE horticulture_harvest_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS horticulture_harvest_records_farm_isolation ON horticulture_harvest_records;
CREATE POLICY horticulture_harvest_records_farm_isolation ON horticulture_harvest_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE horticulture_packhouse_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE horticulture_packhouse_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS horticulture_packhouse_records_farm_isolation ON horticulture_packhouse_records;
CREATE POLICY horticulture_packhouse_records_farm_isolation ON horticulture_packhouse_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE horticulture_water_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE horticulture_water_tests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS horticulture_water_tests_farm_isolation ON horticulture_water_tests;
CREATE POLICY horticulture_water_tests_farm_isolation ON horticulture_water_tests
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE inspection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS inspection_records_farm_isolation ON inspection_records;
CREATE POLICY inspection_records_farm_isolation ON inspection_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE ipm_monitoring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipm_monitoring_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ipm_monitoring_logs_farm_isolation ON ipm_monitoring_logs;
CREATE POLICY ipm_monitoring_logs_farm_isolation ON ipm_monitoring_logs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE ipm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipm_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ipm_plans_farm_isolation ON ipm_plans;
CREATE POLICY ipm_plans_farm_isolation ON ipm_plans
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE ipm_threshold_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipm_threshold_entries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ipm_threshold_entries_farm_isolation ON ipm_threshold_entries;
CREATE POLICY ipm_threshold_entries_farm_isolation ON ipm_threshold_entries
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE irrigation_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_equipment FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS irrigation_equipment_farm_isolation ON irrigation_equipment;
CREATE POLICY irrigation_equipment_farm_isolation ON irrigation_equipment
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE irrigation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS irrigation_records_farm_isolation ON irrigation_records;
CREATE POLICY irrigation_records_farm_isolation ON irrigation_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE johnes_monitoring_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE johnes_monitoring_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS johnes_monitoring_records_farm_isolation ON johnes_monitoring_records;
CREATE POLICY johnes_monitoring_records_farm_isolation ON johnes_monitoring_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE labour_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_absences FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS labour_absences_farm_isolation ON labour_absences;
CREATE POLICY labour_absences_farm_isolation ON labour_absences
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE labour_actual_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_actual_attendance FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS labour_actual_attendance_farm_isolation ON labour_actual_attendance;
CREATE POLICY labour_actual_attendance_farm_isolation ON labour_actual_attendance
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE labour_hourly_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_hourly_rates FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS labour_hourly_rates_farm_isolation ON labour_hourly_rates;
CREATE POLICY labour_hourly_rates_farm_isolation ON labour_hourly_rates
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE labour_leave_entitlement ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_leave_entitlement FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS labour_leave_entitlement_farm_isolation ON labour_leave_entitlement;
CREATE POLICY labour_leave_entitlement_farm_isolation ON labour_leave_entitlement
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE labour_rota ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_rota FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS labour_rota_farm_isolation ON labour_rota;
CREATE POLICY labour_rota_farm_isolation ON labour_rota
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE labour_timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_timesheet_entries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS labour_timesheet_entries_farm_isolation ON labour_timesheet_entries;
CREATE POLICY labour_timesheet_entries_farm_isolation ON labour_timesheet_entries
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE lambing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lambing_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lambing_records_farm_isolation ON lambing_records;
CREATE POLICY lambing_records_farm_isolation ON lambing_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE lerap_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lerap_assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lerap_assessments_farm_isolation ON lerap_assessments;
CREATE POLICY lerap_assessments_farm_isolation ON lerap_assessments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE lis_farm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE lis_farm_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lis_farm_tokens_farm_isolation ON lis_farm_tokens;
CREATE POLICY lis_farm_tokens_farm_isolation ON lis_farm_tokens
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE lis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lis_submissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lis_submissions_farm_isolation ON lis_submissions;
CREATE POLICY lis_submissions_farm_isolation ON lis_submissions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_animals FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_animals_farm_isolation ON livestock_animals;
CREATE POLICY livestock_animals_farm_isolation ON livestock_animals
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_daily_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_daily_checks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_daily_checks_farm_isolation ON livestock_daily_checks;
CREATE POLICY livestock_daily_checks_farm_isolation ON livestock_daily_checks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_deadweight_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_deadweight_sales FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_deadweight_sales_farm_isolation ON livestock_deadweight_sales;
CREATE POLICY livestock_deadweight_sales_farm_isolation ON livestock_deadweight_sales
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_feed_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_feed_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_feed_records_farm_isolation ON livestock_feed_records;
CREATE POLICY livestock_feed_records_farm_isolation ON livestock_feed_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_mart_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_mart_sales FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_mart_sales_farm_isolation ON livestock_mart_sales;
CREATE POLICY livestock_mart_sales_farm_isolation ON livestock_mart_sales
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_medicine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_medicine_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_medicine_records_farm_isolation ON livestock_medicine_records;
CREATE POLICY livestock_medicine_records_farm_isolation ON livestock_medicine_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_mortality ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_mortality FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_mortality_farm_isolation ON livestock_mortality;
CREATE POLICY livestock_mortality_farm_isolation ON livestock_mortality
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_movement_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_movement_animals FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_movement_animals_farm_isolation ON livestock_movement_animals;
CREATE POLICY livestock_movement_animals_farm_isolation ON livestock_movement_animals
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_movements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_movements_farm_isolation ON livestock_movements;
CREATE POLICY livestock_movements_farm_isolation ON livestock_movements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_purchases FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_purchases_farm_isolation ON livestock_purchases;
CREATE POLICY livestock_purchases_farm_isolation ON livestock_purchases
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_settlement_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_settlement_notes FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_settlement_notes_farm_isolation ON livestock_settlement_notes;
CREATE POLICY livestock_settlement_notes_farm_isolation ON livestock_settlement_notes
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE livestock_water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_water_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS livestock_water_records_farm_isolation ON livestock_water_records;
CREATE POLICY livestock_water_records_farm_isolation ON livestock_water_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE medicated_feed_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicated_feed_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS medicated_feed_records_farm_isolation ON medicated_feed_records;
CREATE POLICY medicated_feed_records_farm_isolation ON medicated_feed_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE merchant_storage_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_storage_charges FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS merchant_storage_charges_farm_isolation ON merchant_storage_charges;
CREATE POLICY merchant_storage_charges_farm_isolation ON merchant_storage_charges
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE milk_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_statements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS milk_statements_farm_isolation ON milk_statements;
CREATE POLICY milk_statements_farm_isolation ON milk_statements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE nonconformance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nonconformance_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nonconformance_records_farm_isolation ON nonconformance_records;
CREATE POLICY nonconformance_records_farm_isolation ON nonconformance_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_farm_isolation ON notifications;
CREATE POLICY notifications_farm_isolation ON notifications
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE nutrient_management_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrient_management_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrient_management_plans_farm_isolation ON nutrient_management_plans;
CREATE POLICY nutrient_management_plans_farm_isolation ON nutrient_management_plans
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE nvz_fertiliser_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nvz_fertiliser_applications FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nvz_fertiliser_applications_farm_isolation ON nvz_fertiliser_applications;
CREATE POLICY nvz_fertiliser_applications_farm_isolation ON nvz_fertiliser_applications
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE nvz_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nvz_risk_assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nvz_risk_assessments_farm_isolation ON nvz_risk_assessments;
CREATE POLICY nvz_risk_assessments_farm_isolation ON nvz_risk_assessments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE object_storage_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE object_storage_refs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS object_storage_refs_farm_isolation ON object_storage_refs;
CREATE POLICY object_storage_refs_farm_isolation ON object_storage_refs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_arable_certification ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_arable_certification FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_arable_certification_farm_isolation ON organic_arable_certification;
CREATE POLICY organic_arable_certification_farm_isolation ON organic_arable_certification
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_arable_field_conversion ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_arable_field_conversion FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_arable_field_conversion_farm_isolation ON organic_arable_field_conversion;
CREATE POLICY organic_arable_field_conversion_farm_isolation ON organic_arable_field_conversion
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_arable_harvest_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_arable_harvest_declarations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_arable_harvest_declarations_farm_isolation ON organic_arable_harvest_declarations;
CREATE POLICY organic_arable_harvest_declarations_farm_isolation ON organic_arable_harvest_declarations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_arable_input_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_arable_input_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_arable_input_records_farm_isolation ON organic_arable_input_records;
CREATE POLICY organic_arable_input_records_farm_isolation ON organic_arable_input_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_arable_seed_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_arable_seed_movements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_arable_seed_movements_farm_isolation ON organic_arable_seed_movements;
CREATE POLICY organic_arable_seed_movements_farm_isolation ON organic_arable_seed_movements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_arable_seed_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_arable_seed_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_arable_seed_records_farm_isolation ON organic_arable_seed_records;
CREATE POLICY organic_arable_seed_records_farm_isolation ON organic_arable_seed_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_arable_seed_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_arable_seed_stock FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_arable_seed_stock_farm_isolation ON organic_arable_seed_stock;
CREATE POLICY organic_arable_seed_stock_farm_isolation ON organic_arable_seed_stock
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_certification ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_certification FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_certification_farm_isolation ON organic_certification;
CREATE POLICY organic_certification_farm_isolation ON organic_certification
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_dairy_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_dairy_collection FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_dairy_collection_farm_isolation ON organic_dairy_collection;
CREATE POLICY organic_dairy_collection_farm_isolation ON organic_dairy_collection
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_dairy_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_dairy_feed FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_dairy_feed_farm_isolation ON organic_dairy_feed;
CREATE POLICY organic_dairy_feed_farm_isolation ON organic_dairy_feed
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_dairy_herd_conversion ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_dairy_herd_conversion FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_dairy_herd_conversion_farm_isolation ON organic_dairy_herd_conversion;
CREATE POLICY organic_dairy_herd_conversion_farm_isolation ON organic_dairy_herd_conversion
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_dairy_treatment ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_dairy_treatment FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_dairy_treatment_farm_isolation ON organic_dairy_treatment;
CREATE POLICY organic_dairy_treatment_farm_isolation ON organic_dairy_treatment
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_feed_derogation ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_feed_derogation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_feed_derogation_farm_isolation ON organic_feed_derogation;
CREATE POLICY organic_feed_derogation_farm_isolation ON organic_feed_derogation
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_feed_derogation_correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_feed_derogation_correspondence FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_feed_derogation_correspondence_farm_isolation ON organic_feed_derogation_correspondence;
CREATE POLICY organic_feed_derogation_correspondence_farm_isolation ON organic_feed_derogation_correspondence
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_field_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_field_status FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_field_status_farm_isolation ON organic_field_status;
CREATE POLICY organic_field_status_farm_isolation ON organic_field_status
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_fp_block_synthetic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_fp_block_synthetic_history FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_fp_block_synthetic_history_farm_isolation ON organic_fp_block_synthetic_history;
CREATE POLICY organic_fp_block_synthetic_history_farm_isolation ON organic_fp_block_synthetic_history
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_fp_derogation ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_fp_derogation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_fp_derogation_farm_isolation ON organic_fp_derogation;
CREATE POLICY organic_fp_derogation_farm_isolation ON organic_fp_derogation
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_fp_derogation_correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_fp_derogation_correspondence FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_fp_derogation_correspondence_farm_isolation ON organic_fp_derogation_correspondence;
CREATE POLICY organic_fp_derogation_correspondence_farm_isolation ON organic_fp_derogation_correspondence
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_fresh_produce_block_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_fresh_produce_block_status FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_fresh_produce_block_status_farm_isolation ON organic_fresh_produce_block_status;
CREATE POLICY organic_fresh_produce_block_status_farm_isolation ON organic_fresh_produce_block_status
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_fresh_produce_buyer_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_fresh_produce_buyer_declarations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_fresh_produce_buyer_declarations_farm_isolation ON organic_fresh_produce_buyer_declarations;
CREATE POLICY organic_fresh_produce_buyer_declarations_farm_isolation ON organic_fresh_produce_buyer_declarations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_fresh_produce_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_fresh_produce_certificates FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_fresh_produce_certificates_farm_isolation ON organic_fresh_produce_certificates;
CREATE POLICY organic_fresh_produce_certificates_farm_isolation ON organic_fresh_produce_certificates
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_fresh_produce_input_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_fresh_produce_input_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_fresh_produce_input_log_farm_isolation ON organic_fresh_produce_input_log;
CREATE POLICY organic_fresh_produce_input_log_farm_isolation ON organic_fresh_produce_input_log
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_inputs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_inputs_farm_isolation ON organic_inputs;
CREATE POLICY organic_inputs_farm_isolation ON organic_inputs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_inspection FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_inspection_farm_isolation ON organic_inspection;
CREATE POLICY organic_inspection_farm_isolation ON organic_inspection
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_livestock_conversion ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_livestock_conversion FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_livestock_conversion_farm_isolation ON organic_livestock_conversion;
CREATE POLICY organic_livestock_conversion_farm_isolation ON organic_livestock_conversion
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_livestock_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_livestock_feed FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_livestock_feed_farm_isolation ON organic_livestock_feed;
CREATE POLICY organic_livestock_feed_farm_isolation ON organic_livestock_feed
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_livestock_outdoor_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_livestock_outdoor_access FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_livestock_outdoor_access_farm_isolation ON organic_livestock_outdoor_access;
CREATE POLICY organic_livestock_outdoor_access_farm_isolation ON organic_livestock_outdoor_access
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_livestock_parallel_notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_livestock_parallel_notification FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_livestock_parallel_notification_farm_isolation ON organic_livestock_parallel_notification;
CREATE POLICY organic_livestock_parallel_notification_farm_isolation ON organic_livestock_parallel_notification
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_livestock_treatment ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_livestock_treatment FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_livestock_treatment_farm_isolation ON organic_livestock_treatment;
CREATE POLICY organic_livestock_treatment_farm_isolation ON organic_livestock_treatment
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_vit_block_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_vit_block_status FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_vit_block_status_farm_isolation ON organic_vit_block_status;
CREATE POLICY organic_vit_block_status_farm_isolation ON organic_vit_block_status
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_vit_certificate ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_vit_certificate FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_vit_certificate_farm_isolation ON organic_vit_certificate;
CREATE POLICY organic_vit_certificate_farm_isolation ON organic_vit_certificate
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_vit_copper_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_vit_copper_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_vit_copper_log_farm_isolation ON organic_vit_copper_log;
CREATE POLICY organic_vit_copper_log_farm_isolation ON organic_vit_copper_log
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_vit_derogation ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_vit_derogation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_vit_derogation_farm_isolation ON organic_vit_derogation;
CREATE POLICY organic_vit_derogation_farm_isolation ON organic_vit_derogation
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_vit_derogation_correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_vit_derogation_correspondence FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_vit_derogation_correspondence_farm_isolation ON organic_vit_derogation_correspondence;
CREATE POLICY organic_vit_derogation_correspondence_farm_isolation ON organic_vit_derogation_correspondence
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_vit_input_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_vit_input_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_vit_input_log_farm_isolation ON organic_vit_input_log;
CREATE POLICY organic_vit_input_log_farm_isolation ON organic_vit_input_log
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE organic_vit_wine_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_vit_wine_production FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organic_vit_wine_production_farm_isolation ON organic_vit_wine_production;
CREATE POLICY organic_vit_wine_production_farm_isolation ON organic_vit_wine_production
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissions_farm_isolation ON permissions;
CREATE POLICY permissions_farm_isolation ON permissions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pest_control_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_control_photos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pest_control_photos_farm_isolation ON pest_control_photos;
CREATE POLICY pest_control_photos_farm_isolation ON pest_control_photos
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pest_control_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_control_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pest_control_records_farm_isolation ON pest_control_records;
CREATE POLICY pest_control_records_farm_isolation ON pest_control_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_farrowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_farrowing_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_farrowing_records_farm_isolation ON pig_farrowing_records;
CREATE POLICY pig_farrowing_records_farm_isolation ON pig_farrowing_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_fci_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_fci_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_fci_documents_farm_isolation ON pig_fci_documents;
CREATE POLICY pig_fci_documents_farm_isolation ON pig_fci_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_feed_consumption FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_feed_consumption_farm_isolation ON pig_feed_consumption;
CREATE POLICY pig_feed_consumption_farm_isolation ON pig_feed_consumption
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_flocks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_flocks_farm_isolation ON pig_flocks;
CREATE POLICY pig_flocks_farm_isolation ON pig_flocks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_kill_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_kill_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_kill_records_farm_isolation ON pig_kill_records;
CREATE POLICY pig_kill_records_farm_isolation ON pig_kill_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_medicine_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_medicine_treatments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_medicine_treatments_farm_isolation ON pig_medicine_treatments;
CREATE POLICY pig_medicine_treatments_farm_isolation ON pig_medicine_treatments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_movements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_movements_farm_isolation ON pig_movements;
CREATE POLICY pig_movements_farm_isolation ON pig_movements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_red_tractor_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_red_tractor_checklists FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_red_tractor_checklists_farm_isolation ON pig_red_tractor_checklists;
CREATE POLICY pig_red_tractor_checklists_farm_isolation ON pig_red_tractor_checklists
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_salmonella_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_salmonella_monitoring FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_salmonella_monitoring_farm_isolation ON pig_salmonella_monitoring;
CREATE POLICY pig_salmonella_monitoring_farm_isolation ON pig_salmonella_monitoring
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_stockmanship_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_stockmanship_checks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_stockmanship_checks_farm_isolation ON pig_stockmanship_checks;
CREATE POLICY pig_stockmanship_checks_farm_isolation ON pig_stockmanship_checks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_tail_biting_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_tail_biting_risks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_tail_biting_risks_farm_isolation ON pig_tail_biting_risks;
CREATE POLICY pig_tail_biting_risks_farm_isolation ON pig_tail_biting_risks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE pig_vet_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pig_vet_assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pig_vet_assessments_farm_isolation ON pig_vet_assessments;
CREATE POLICY pig_vet_assessments_farm_isolation ON pig_vet_assessments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_batch_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_batch_settlements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_batch_settlements_farm_isolation ON poultry_batch_settlements;
CREATE POLICY poultry_batch_settlements_farm_isolation ON poultry_batch_settlements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_biosecurity_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_biosecurity_checklists FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_biosecurity_checklists_farm_isolation ON poultry_biosecurity_checklists;
CREATE POLICY poultry_biosecurity_checklists_farm_isolation ON poultry_biosecurity_checklists
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_broiler_welfare ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_broiler_welfare FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_broiler_welfare_farm_isolation ON poultry_broiler_welfare;
CREATE POLICY poultry_broiler_welfare_farm_isolation ON poultry_broiler_welfare
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_chick_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_chick_purchases FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_chick_purchases_farm_isolation ON poultry_chick_purchases;
CREATE POLICY poultry_chick_purchases_farm_isolation ON poultry_chick_purchases
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_cleanout_stock_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_cleanout_stock_consumptions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_cleanout_stock_consumptions_farm_isolation ON poultry_cleanout_stock_consumptions;
CREATE POLICY poultry_cleanout_stock_consumptions_farm_isolation ON poultry_cleanout_stock_consumptions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_daily_mortality ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_daily_mortality FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_daily_mortality_farm_isolation ON poultry_daily_mortality;
CREATE POLICY poultry_daily_mortality_farm_isolation ON poultry_daily_mortality
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_environmental_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_environmental_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_environmental_logs_farm_isolation ON poultry_environmental_logs;
CREATE POLICY poultry_environmental_logs_farm_isolation ON poultry_environmental_logs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_fci_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_fci_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_fci_documents_farm_isolation ON poultry_fci_documents;
CREATE POLICY poultry_fci_documents_farm_isolation ON poultry_fci_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_flocks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_flocks_farm_isolation ON poultry_flocks;
CREATE POLICY poultry_flocks_farm_isolation ON poultry_flocks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_house_cleanouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_house_cleanouts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_house_cleanouts_farm_isolation ON poultry_house_cleanouts;
CREATE POLICY poultry_house_cleanouts_farm_isolation ON poultry_house_cleanouts
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_houses FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_houses_farm_isolation ON poultry_houses;
CREATE POLICY poultry_houses_farm_isolation ON poultry_houses
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_scheme_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_scheme_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_scheme_records_farm_isolation ON poultry_scheme_records;
CREATE POLICY poultry_scheme_records_farm_isolation ON poultry_scheme_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_thinning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_thinning_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_thinning_records_farm_isolation ON poultry_thinning_records;
CREATE POLICY poultry_thinning_records_farm_isolation ON poultry_thinning_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE poultry_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE poultry_treatments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poultry_treatments_farm_isolation ON poultry_treatments;
CREATE POLICY poultry_treatments_farm_isolation ON poultry_treatments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE ppe_issue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_issue_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ppe_issue_records_farm_isolation ON ppe_issue_records;
CREATE POLICY ppe_issue_records_farm_isolation ON ppe_issue_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE ppe_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_risk_assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ppe_risk_assessments_farm_isolation ON ppe_risk_assessments;
CREATE POLICY ppe_risk_assessments_farm_isolation ON ppe_risk_assessments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE ppe_stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_stock_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ppe_stock_items_farm_isolation ON ppe_stock_items;
CREATE POLICY ppe_stock_items_farm_isolation ON ppe_stock_items
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS purchase_orders_farm_isolation ON purchase_orders;
CREATE POLICY purchase_orders_farm_isolation ON purchase_orders
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE renewable_energy_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewable_energy_installations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS renewable_energy_installations_farm_isolation ON renewable_energy_installations;
CREATE POLICY renewable_energy_installations_farm_isolation ON renewable_energy_installations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE renewable_energy_meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewable_energy_meter_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS renewable_energy_meter_readings_farm_isolation ON renewable_energy_meter_readings;
CREATE POLICY renewable_energy_meter_readings_farm_isolation ON renewable_energy_meter_readings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE renewable_energy_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewable_energy_production FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS renewable_energy_production_farm_isolation ON renewable_energy_production;
CREATE POLICY renewable_energy_production_farm_isolation ON renewable_energy_production
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS risk_assessments_farm_isolation ON risk_assessments;
CREATE POLICY risk_assessments_farm_isolation ON risk_assessments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE rtfo_buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtfo_buyers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rtfo_buyers_farm_isolation ON rtfo_buyers;
CREATE POLICY rtfo_buyers_farm_isolation ON rtfo_buyers
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE seed_drilling_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_drilling_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seed_drilling_records_farm_isolation ON seed_drilling_records;
CREATE POLICY seed_drilling_records_farm_isolation ON seed_drilling_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_agreements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_agreements_farm_isolation ON service_agreements;
CREATE POLICY service_agreements_farm_isolation ON service_agreements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE service_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_invoices FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_invoices_farm_isolation ON service_invoices;
CREATE POLICY service_invoices_farm_isolation ON service_invoices
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sfi_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sfi_actions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sfi_actions_farm_isolation ON sfi_actions;
CREATE POLICY sfi_actions_farm_isolation ON sfi_actions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sfi_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sfi_agreements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sfi_agreements_farm_isolation ON sfi_agreements;
CREATE POLICY sfi_agreements_farm_isolation ON sfi_agreements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_cull_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_cull_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_cull_records_farm_isolation ON sheep_cull_records;
CREATE POLICY sheep_cull_records_farm_isolation ON sheep_cull_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_dipping_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_dipping_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_dipping_records_farm_isolation ON sheep_dipping_records;
CREATE POLICY sheep_dipping_records_farm_isolation ON sheep_dipping_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_disease_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_disease_monitoring FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_disease_monitoring_farm_isolation ON sheep_disease_monitoring;
CREATE POLICY sheep_disease_monitoring_farm_isolation ON sheep_disease_monitoring
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_flocks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_flocks_farm_isolation ON sheep_flocks;
CREATE POLICY sheep_flocks_farm_isolation ON sheep_flocks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_red_tractor_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_red_tractor_checklists FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_red_tractor_checklists_farm_isolation ON sheep_red_tractor_checklists;
CREATE POLICY sheep_red_tractor_checklists_farm_isolation ON sheep_red_tractor_checklists
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_scanning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_scanning_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_scanning_records_farm_isolation ON sheep_scanning_records;
CREATE POLICY sheep_scanning_records_farm_isolation ON sheep_scanning_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_shearing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_shearing_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_shearing_records_farm_isolation ON sheep_shearing_records;
CREATE POLICY sheep_shearing_records_farm_isolation ON sheep_shearing_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_tupping_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_tupping_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_tupping_records_farm_isolation ON sheep_tupping_records;
CREATE POLICY sheep_tupping_records_farm_isolation ON sheep_tupping_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_vaccination_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_vaccination_programmes FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_vaccination_programmes_farm_isolation ON sheep_vaccination_programmes;
CREATE POLICY sheep_vaccination_programmes_farm_isolation ON sheep_vaccination_programmes
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sheep_weigh_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheep_weigh_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sheep_weigh_records_farm_isolation ON sheep_weigh_records;
CREATE POLICY sheep_weigh_records_farm_isolation ON sheep_weigh_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE shooting_and_game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shooting_and_game_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shooting_and_game_records_farm_isolation ON shooting_and_game_records;
CREATE POLICY shooting_and_game_records_farm_isolation ON shooting_and_game_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sire_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE sire_register FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sire_register_farm_isolation ON sire_register;
CREATE POLICY sire_register_farm_isolation ON sire_register
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE slurry_spreading_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE slurry_spreading_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS slurry_spreading_records_farm_isolation ON slurry_spreading_records;
CREATE POLICY slurry_spreading_records_farm_isolation ON slurry_spreading_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE slurry_store_fill_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE slurry_store_fill_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS slurry_store_fill_events_farm_isolation ON slurry_store_fill_events;
CREATE POLICY slurry_store_fill_events_farm_isolation ON slurry_store_fill_events
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE slurry_store_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE slurry_store_inspections FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS slurry_store_inspections_farm_isolation ON slurry_store_inspections;
CREATE POLICY slurry_store_inspections_farm_isolation ON slurry_store_inspections
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE slurry_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE slurry_stores FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS slurry_stores_farm_isolation ON slurry_stores;
CREATE POLICY slurry_stores_farm_isolation ON slurry_stores
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE soil_moisture_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_moisture_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS soil_moisture_readings_farm_isolation ON soil_moisture_readings;
CREATE POLICY soil_moisture_readings_farm_isolation ON soil_moisture_readings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE soil_sensor_probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_sensor_probes FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS soil_sensor_probes_farm_isolation ON soil_sensor_probes;
CREATE POLICY soil_sensor_probes_farm_isolation ON soil_sensor_probes
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE soil_sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_sensor_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS soil_sensor_readings_farm_isolation ON soil_sensor_readings;
CREATE POLICY soil_sensor_readings_farm_isolation ON soil_sensor_readings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE soil_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_test_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS soil_test_records_farm_isolation ON soil_test_records;
CREATE POLICY soil_test_records_farm_isolation ON soil_test_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE solar_export_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_export_payments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS solar_export_payments_farm_isolation ON solar_export_payments;
CREATE POLICY solar_export_payments_farm_isolation ON solar_export_payments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE solar_installation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_installation_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS solar_installation_documents_farm_isolation ON solar_installation_documents;
CREATE POLICY solar_installation_documents_farm_isolation ON solar_installation_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE spray_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE spray_applications FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS spray_applications_farm_isolation ON spray_applications;
CREATE POLICY spray_applications_farm_isolation ON spray_applications
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE spray_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE spray_products FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS spray_products_farm_isolation ON spray_products;
CREATE POLICY spray_products_farm_isolation ON spray_products
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE staff_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_certificates FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_certificates_farm_isolation ON staff_certificates;
CREATE POLICY staff_certificates_farm_isolation ON staff_certificates
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE staff_farm_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_farm_assignments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_farm_assignments_farm_isolation ON staff_farm_assignments;
CREATE POLICY staff_farm_assignments_farm_isolation ON staff_farm_assignments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE staff_right_to_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_right_to_work FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_right_to_work_farm_isolation ON staff_right_to_work;
CREATE POLICY staff_right_to_work_farm_isolation ON staff_right_to_work
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE staff_rtw_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_rtw_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_rtw_documents_farm_isolation ON staff_rtw_documents;
CREATE POLICY staff_rtw_documents_farm_isolation ON staff_rtw_documents
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE staff_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_training_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_training_records_farm_isolation ON staff_training_records;
CREATE POLICY staff_training_records_farm_isolation ON staff_training_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE stock_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_deliveries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stock_deliveries_farm_isolation ON stock_deliveries;
CREATE POLICY stock_deliveries_farm_isolation ON stock_deliveries
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stock_items_farm_isolation ON stock_items;
CREATE POLICY stock_items_farm_isolation ON stock_items
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stock_levels_farm_isolation ON stock_levels;
CREATE POLICY stock_levels_farm_isolation ON stock_levels
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stock_movements_farm_isolation ON stock_movements;
CREATE POLICY stock_movements_farm_isolation ON stock_movements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE stocktake_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktake_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stocktake_items_farm_isolation ON stocktake_items;
CREATE POLICY stocktake_items_farm_isolation ON stocktake_items
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE stocktake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktake_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stocktake_sessions_farm_isolation ON stocktake_sessions;
CREATE POLICY stocktake_sessions_farm_isolation ON stocktake_sessions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE storage_location_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_location_movements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS storage_location_movements_farm_isolation ON storage_location_movements;
CREATE POLICY storage_location_movements_farm_isolation ON storage_location_movements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS storage_locations_farm_isolation ON storage_locations;
CREATE POLICY storage_locations_farm_isolation ON storage_locations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE straw_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE straw_inventory FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS straw_inventory_farm_isolation ON straw_inventory;
CREATE POLICY straw_inventory_farm_isolation ON straw_inventory
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subscriptions_farm_isolation ON subscriptions;
CREATE POLICY subscriptions_farm_isolation ON subscriptions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS suppliers_farm_isolation ON suppliers;
CREATE POLICY suppliers_farm_isolation ON suppliers
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS support_tickets_farm_isolation ON support_tickets;
CREATE POLICY support_tickets_farm_isolation ON support_tickets
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE sustainability_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_reports FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sustainability_reports_farm_isolation ON sustainability_reports;
CREATE POLICY sustainability_reports_farm_isolation ON sustainability_reports
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE tb_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_tests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tb_tests_farm_isolation ON tb_tests;
CREATE POLICY tb_tests_farm_isolation ON tb_tests
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE third_party_grain_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_party_grain_intakes FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS third_party_grain_intakes_farm_isolation ON third_party_grain_intakes;
CREATE POLICY third_party_grain_intakes_farm_isolation ON third_party_grain_intakes
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE third_party_grain_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_party_grain_movements FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS third_party_grain_movements_farm_isolation ON third_party_grain_movements;
CREATE POLICY third_party_grain_movements_farm_isolation ON third_party_grain_movements
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_courses FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS training_courses_farm_isolation ON training_courses;
CREATE POLICY training_courses_farm_isolation ON training_courses
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE unauthorized_encampments ENABLE ROW LEVEL SECURITY;
ALTER TABLE unauthorized_encampments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS unauthorized_encampments_farm_isolation ON unauthorized_encampments;
CREATE POLICY unauthorized_encampments_farm_isolation ON unauthorized_encampments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_invitations_farm_isolation ON user_invitations;
CREATE POLICY user_invitations_farm_isolation ON user_invitations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vehicle_weather_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_weather_devices FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicle_weather_devices_farm_isolation ON vehicle_weather_devices;
CREATE POLICY vehicle_weather_devices_farm_isolation ON vehicle_weather_devices
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vehicle_weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_weather_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicle_weather_readings_farm_isolation ON vehicle_weather_readings;
CREATE POLICY vehicle_weather_readings_farm_isolation ON vehicle_weather_readings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vet_health_plan_action_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_health_plan_action_completions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vet_health_plan_action_completions_farm_isolation ON vet_health_plan_action_completions;
CREATE POLICY vet_health_plan_action_completions_farm_isolation ON vet_health_plan_action_completions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vet_health_plan_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_health_plan_actions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vet_health_plan_actions_farm_isolation ON vet_health_plan_actions;
CREATE POLICY vet_health_plan_actions_farm_isolation ON vet_health_plan_actions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vet_health_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_health_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vet_health_plans_farm_isolation ON vet_health_plans;
CREATE POLICY vet_health_plans_farm_isolation ON vet_health_plans
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vet_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_invoices FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vet_invoices_farm_isolation ON vet_invoices;
CREATE POLICY vet_invoices_farm_isolation ON vet_invoices
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vet_prescription_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_prescription_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vet_prescription_records_farm_isolation ON vet_prescription_records;
CREATE POLICY vet_prescription_records_farm_isolation ON vet_prescription_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vet_visits_farm_isolation ON vet_visits;
CREATE POLICY vet_visits_farm_isolation ON vet_visits
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vine_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE vine_register FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vine_register_farm_isolation ON vine_register;
CREATE POLICY vine_register_farm_isolation ON vine_register
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_block_plantings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_block_plantings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_block_plantings_farm_isolation ON vineyard_block_plantings;
CREATE POLICY vineyard_block_plantings_farm_isolation ON vineyard_block_plantings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_blocks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_blocks_farm_isolation ON vineyard_blocks;
CREATE POLICY vineyard_blocks_farm_isolation ON vineyard_blocks
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_harvest ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_harvest FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_harvest_farm_isolation ON vineyard_harvest;
CREATE POLICY vineyard_harvest_farm_isolation ON vineyard_harvest
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_operations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_operations_farm_isolation ON vineyard_operations;
CREATE POLICY vineyard_operations_farm_isolation ON vineyard_operations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_phenology ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_phenology FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_phenology_farm_isolation ON vineyard_phenology;
CREATE POLICY vineyard_phenology_farm_isolation ON vineyard_phenology
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_scouting ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_scouting FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_scouting_farm_isolation ON vineyard_scouting;
CREATE POLICY vineyard_scouting_farm_isolation ON vineyard_scouting
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_soil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_soil_analysis FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_soil_analysis_farm_isolation ON vineyard_soil_analysis;
CREATE POLICY vineyard_soil_analysis_farm_isolation ON vineyard_soil_analysis
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE vineyard_spray_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE vineyard_spray_diary FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vineyard_spray_diary_farm_isolation ON vineyard_spray_diary;
CREATE POLICY vineyard_spray_diary_farm_isolation ON vineyard_spray_diary
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE visitor_contractor_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_contractor_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS visitor_contractor_log_farm_isolation ON visitor_contractor_log;
CREATE POLICY visitor_contractor_log_farm_isolation ON visitor_contractor_log
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE waste_disposal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_disposal_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS waste_disposal_records_farm_isolation ON waste_disposal_records;
CREATE POLICY waste_disposal_records_farm_isolation ON waste_disposal_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE water_abstraction_licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_abstraction_licences FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS water_abstraction_licences_farm_isolation ON water_abstraction_licences;
CREATE POLICY water_abstraction_licences_farm_isolation ON water_abstraction_licences
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE water_meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_meter_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS water_meter_readings_farm_isolation ON water_meter_readings;
CREATE POLICY water_meter_readings_farm_isolation ON water_meter_readings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_readings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS weather_readings_farm_isolation ON weather_readings;
CREATE POLICY weather_readings_farm_isolation ON weather_readings
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE weather_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_stations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS weather_stations_farm_isolation ON weather_stations;
CREATE POLICY weather_stations_farm_isolation ON weather_stations
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE welfare_outcome_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_outcome_assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS welfare_outcome_assessments_farm_isolation ON welfare_outcome_assessments;
CREATE POLICY welfare_outcome_assessments_farm_isolation ON welfare_outcome_assessments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE winery_age_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE winery_age_verification FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS winery_age_verification_farm_isolation ON winery_age_verification;
CREATE POLICY winery_age_verification_farm_isolation ON winery_age_verification
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE winery_excise_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE winery_excise_returns FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS winery_excise_returns_farm_isolation ON winery_excise_returns;
CREATE POLICY winery_excise_returns_farm_isolation ON winery_excise_returns
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE winery_licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE winery_licences FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS winery_licences_farm_isolation ON winery_licences;
CREATE POLICY winery_licences_farm_isolation ON winery_licences
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE winery_tasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winery_tasting_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS winery_tasting_sessions_farm_isolation ON winery_tasting_sessions;
CREATE POLICY winery_tasting_sessions_farm_isolation ON winery_tasting_sessions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_fire_extinguisher_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_fire_extinguisher_services FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_fire_extinguisher_services_farm_isolation ON workshop_fire_extinguisher_services;
CREATE POLICY workshop_fire_extinguisher_services_farm_isolation ON workshop_fire_extinguisher_services
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_fire_extinguishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_fire_extinguishers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_fire_extinguishers_farm_isolation ON workshop_fire_extinguishers;
CREATE POLICY workshop_fire_extinguishers_farm_isolation ON workshop_fire_extinguishers
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_goods_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_goods_returns FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_goods_returns_farm_isolation ON workshop_goods_returns;
CREATE POLICY workshop_goods_returns_farm_isolation ON workshop_goods_returns
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_jobs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_jobs_farm_isolation ON workshop_jobs;
CREATE POLICY workshop_jobs_farm_isolation ON workshop_jobs
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_pat_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_pat_equipment FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_pat_equipment_farm_isolation ON workshop_pat_equipment;
CREATE POLICY workshop_pat_equipment_farm_isolation ON workshop_pat_equipment
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_pat_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_pat_test_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_pat_test_records_farm_isolation ON workshop_pat_test_records;
CREATE POLICY workshop_pat_test_records_farm_isolation ON workshop_pat_test_records
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_pat_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_pat_tests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_pat_tests_farm_isolation ON workshop_pat_tests;
CREATE POLICY workshop_pat_tests_farm_isolation ON workshop_pat_tests
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_stocktake_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_stocktake_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_stocktake_items_farm_isolation ON workshop_stocktake_items;
CREATE POLICY workshop_stocktake_items_farm_isolation ON workshop_stocktake_items
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

ALTER TABLE workshop_stocktake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_stocktake_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workshop_stocktake_sessions_farm_isolation ON workshop_stocktake_sessions;
CREATE POLICY workshop_stocktake_sessions_farm_isolation ON workshop_stocktake_sessions
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );
