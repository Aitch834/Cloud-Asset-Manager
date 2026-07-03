---
name: Silage/slurry table field-name conventions
description: Correct DB/API field names for silageAdditiveRecordsTable, silageQualityTestsTable, slurryStoresTable, slurryStoreInspectionsTable — use before writing any new consumer of these endpoints.
---

When consuming `/api/farms/:id/silage-additive-records`, `/api/farms/:id/silage-quality-tests`, `/api/farms/:id/slurry-stores`, or `/api/farms/:id/slurry-store-inspections`, use these exact field names (verified against `artifacts/api-server/src/routes/farms.ts` select statements):

- Silage quality tests: `dryMatterPercent` (not `dryMatterPct`), `phLevel` (not `ph`), `mePerKgDm` (not `metabolisableEnergy`), `crudeProteinPercent` (not `crudeProteinPct`), `ammoniaNPercent`, `labName`, `testDate`, `storeId`, `storeName` (joined from slurryStoresTable), `cropType`.
- Silage additive records: `applicationDate`, `cropType`, `productName`, `batchNumber`, `applicationRate`, `coshhAssessed`, `operatorName` (not `appliedBy`), `storeId`, `storeName` (joined).
- Slurry stores: `storeName`, `storeType` (e.g. "Silage Clamp" identifies silage clamps among slurry store types), `nextInspectionDue`.
- Slurry store inspections: `storeId`, `inspectionDate`, `inspectorName`, `outcome`, `freeboardOk`, `deficiencies`, `actionsRequired`.

**Why:** These tables share a naming pattern with the general slurry-store domain but silage-specific tests use `...Percent`/`...Level`/`mePerKgDm` suffixes rather than the abbreviated names (`Pct`, `ph`) that would be guessed by analogy with other modules. Silage clamps are a `storeType` value inside the shared `slurryStoresTable`, not a separate table.

**How to apply:** Before writing any new report, dashboard card, or print/export view referencing these endpoints, grep the actual `.select({...})` in `farms.ts` for the exact aliases rather than guessing from the UI form field labels.
