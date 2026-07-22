---
name: LIS CLA births/deaths — UNSUPPORTED in v1.0
description: Births and deaths are confirmed unsupported by the LIS CLA v1.0 public API. CLA is movements-only. Cattle also no longer supported in CLA.
---

## The rule

**Births and deaths are NOT supported in the LIS CLA v1.0 public API.**

Confirmed by LIS Development Hub Support (July 2026):
> "Per the published public CLA v1.0 contract, births and deaths are unsupported. The public API is limited to livestock movements: transfer, transfer correction, movement review/confirmation, and undo."

Additionally: **Cattle is no longer supported in CLA.** CLA covers Sheep and Goat only.
> "As you have been advised recently Sheep and Goat are supported and Cattle is no longer supported."
> "ANIMAL API is Multi Species cattle" — this is a SEPARATE service (not CLA).

**Why this matters:** We previously built `submitLisBirth` and `submitLisDeath` in `lis.ts` calling `/animals` (POST) and `/animals/{identifier}` (PUT) based on an incorrect earlier support response. These endpoints do not exist in the public CLA v1.0 contract.

## What to do instead

- **Sheep/goat/deer births and deaths**: Must be registered directly on the LIS keeper portal at www.livestockinformation.org.uk — no public API route is available.
- **Cattle births/deaths/movements**: Use the LIS LIP system (`lip.ts`) — completely separate from CLA, unaffected by this clarification.

## Current implementation (as of July 2026)

- `lis.ts`: `submitLisBirth` and `submitLisDeath` are **stubs** that immediately return `success: false` with an unsupported error message. They are kept as exports only so call sites compile cleanly.
- `farms.ts`: Route `POST /farms/:farmId/lis-submit/:movementId` has an **early return guard** that returns HTTP 422 if `submissionType === "birth" || "death"`, before any submission record is created.
- `Movements.tsx` (dashboard): `lisBtn` uses `isLisSubmittableType` (on/off only) instead of `isSubmittableType` (which also includes birth/death). Birth and death movement rows no longer show a LIS submit button.

## What CLA DOES support (on/off movements)

See `lis-credentials.md` for the confirmed POST /TransferRequests schema.

Species: Sheep ("Sheep"), Goat ("Goats" — plural!), Deer ("Deer").

## Historical context (do not re-implement)

The `/animals` POST and PUT endpoints were documented in an earlier LIS support reply (July 2026) stating "Births will be under registering a new Animal" and "Deaths are covered under Updating an animal." This guidance was incorrect — it was not referring to the CLA v1.0 public contract. A follow-up from LIS support clarified the public v1.0 contract does not expose these endpoints.
