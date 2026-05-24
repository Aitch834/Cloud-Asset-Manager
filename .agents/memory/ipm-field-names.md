---
name: IPM plan field name mismatches
description: Correct DB column names, API field names, and UI state keys for IPM plans and threshold entries — these have historically been mismatched causing silent save failures.
---

## The rule
Always use the DB/API canonical names in the UI. Do not invent aliases.

## ipm_plans — canonical field names (DB → camelCase in API/UI)
- `plan_year` → `planYear` (integer — crop year start, e.g. 2024)
- `crop_name` → `cropName`
- `status` → `status` (draft | active | under_review | archived)
- `valid_from` / `valid_to` → `validFrom` / `validTo`
- `agronomist_name` → `agronomistName`
- `agronomist_id` → `agronomistId`
- `basis_number` → `basisNumber`
- `pest_monitoring_frequency` → `pestMonitoringFrequency`
- `overall_strategy` → `overallStrategy`
- `rotation_and_cultural_controls` → `rotationAndCulturalControls`
- `biological_controls` → `biologicalControls`
- `review_date` → `reviewDate`

## ipm_threshold_entries — canonical field names
- `pest_or_disease` → `pestOrDisease` (NOT `pestOrWeedName` — that was wrong)
- `action_threshold` → `actionThreshold` (NOT `economicThreshold`)
- `non_chemical_option` → `nonChemicalOption` (NOT `nonChemicalControl`)
- `chemical_threshold` → `chemicalThreshold`
- `resistance_management_group` → `resistanceManagementGroup`
- `action_taken` → `actionTaken`
- `monitoring_frequency` → `monitoringFrequency`

## ipm_monitoring_logs — canonical field names
- `log_date` → `logDate` (required)
- `pest_or_weed` → `pestOrWeed` (required)
- `threshold_breached` → `thresholdBreached` (boolean)
- `action_taken` → `actionTaken`
- `inspector` → `inspector`

**Why:** The original UI was using `pestOrWeedName`, `economicThreshold`, `nonChemicalControl` which do not match DB columns — threshold entries silently failed to save. All corrected in the IpmPlanTab rewrite.

**How to apply:** Whenever editing the IpmPlanTab or adding new threshold/monitoring fields, use only the canonical names above for form state keys, API request bodies, and column display.
