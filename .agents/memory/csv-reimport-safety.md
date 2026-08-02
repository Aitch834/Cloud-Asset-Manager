---
name: CSV re-import safety pattern
description: What "re-import-safe" means for dashboard CSV import/export pairs and what code review requires
---

Rule: a CSV export/import pair is only re-import-safe when (1) headers/aliases/example row/payload mapping derive from one shared column list (HARVEST_COLUMNS pattern; bottling version lives in `artifacts/dashboard/src/lib/bottling-csv.ts` with round-trip tests), (2) export values are ISO dates + Yes/No, AND (3) the importer uses a full-file CSV state-machine parser — line-split parsers corrupt quoted multiline Notes and completion review rejects them.

**Why:** Task completion review rejected a line-split bottling importer for exactly this; harvest already used the state machine (`parseCsvText`).

**How to apply:** For any new winery/dashboard import flow, reuse `parseCsvText`/the bottling-csv module structure instead of writing an inline parser; add round-trip tests for commas, quotes, newlines, legacy headers.
