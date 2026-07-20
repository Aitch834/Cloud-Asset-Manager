---
name: Livestock medicine withdrawal alerting
description: Covers why livestock withdrawal alerts were added to alertingJob and the key implementation details
---

## Rule
`checkLivestockMedicineWithdrawal()` in alertingJob.ts covers cattle/sheep/goat/deer medicine withdrawal periods. `checkPigWithdrawalPeriods()` covers pigs via a separate table (`pigMedicineTreatmentsTable`). Both must be maintained independently.

## Why
The original alerting job only covered pig withdrawal periods (`pigMedicineTreatmentsTable` — uses a `date` column type). `livestockMedicineRecordsTable` stores withdrawal end dates as `timestamp with timezone`, so `gte(col, dateString)` fails (no overload). Use `sql\`${col} >= CURRENT_DATE\`` for timestamp columns in Drizzle alerting queries.

## How to apply
- When adding new alerting checks on `date` columns: `gte(col, todayIso)` works.
- When adding new alerting checks on `timestamp` columns: use `sql\`${col} >= CURRENT_DATE\`` instead.
- New notification types must be added to `CRITICAL_TYPES` set in alertingJob.ts to receive SMS dispatch on critical severity.
