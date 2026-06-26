---
name: LIS sync import — DB write implementation
description: How movement records from the LIS CLA API are stored in the DB on sync
---

## Pattern
The LIS sync route (farms.ts, POST lis-sync) now upserts all fetched records into `livestock_movements` after fetching from the CLA API.

## Dedup key
`lis_movement_ref` stores a prefixed string: `"approved:<id>"`, `"transfer_request:<id>"`, or `"movement_review:<id>"`. 
Dedup is done by a check-then-insert/update query — NOT a DB unique index (avoids partial-index ON CONFLICT complexity).

## Field extraction
CLA API field names vary; flexible extractors try multiple keys in order:
- ref: id → reference → movementReference → transferId → requestId → reviewId
- date: movementDate → transferDate → requestDate → dateOfMovement → date → createdDate
- from: fromHolding → fromCph → holdingFrom → fromLocation → sourceCph → departureHolding
- to: toHolding → toCph → holdingTo → toLocation → destinationCph → destinationHolding

## Direction detection
Arrival = `cphNorm(to) === cphNorm(farmCph)` OR source is `movement_review`. Otherwise departure.
CPH norm = strip all non-digits.

## Sync timestamp
After import: `lis_farm_tokens.lis_last_synced_at` and `lis_last_sync_summary` are updated.

## LIP API (herd/animal data)
NOT yet implemented — LIP API subscription still pending (up to 5 working days from when secrets were added).
Stub: add herd import here when LIP API is available.

## Migration
`lisMigrations.ts` — idempotent ALTER TABLE IF NOT EXISTS for all LIS columns. Called from `seedDefaults()` on every API startup.
