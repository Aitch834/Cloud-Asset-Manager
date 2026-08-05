---
name: SO₂ verdict helpers
description: Winery tabs must derive SO₂ compliance from a per-tab verdict helper, not persisted flags
---
Each winery tab that shows an SO₂ verdict on multiple surfaces (badge, CSV, dialog) has a single per-tab helper: cellarSo2Verdict (CellarOpsTab), bottlingSo2Verdict (BottlingRecordsTab), so2TestVerdict (So2TestingTab).

**Why:** Review rejects surfaces that read a persisted compliance flag (e.g. so2_compliant) directly — stale saved flags can disagree with the applicable ceiling. Verdicts must be derived live (total vs ceiling), with persisted flags only as fallback when values are missing, and an explicit null "no verdict" state.

**How to apply:** When adding any new SO₂-verdict surface (batch trail, print, new tab), route it through the tab's helper; never recompute inline from ORGANIC_MAX_SO2/CONVENTIONAL_MAX_SO2 or read the stored flag alone.
