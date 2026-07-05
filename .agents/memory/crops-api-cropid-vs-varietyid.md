---
name: Crops API cropId vs varietyId
description: The GET /api/farms/:farmId/crops endpoint returns rows keyed by variety, not by crop — trap for any consumer that treats row.id as the crop id.
---

`GET /api/farms/:farmId/crops` returns one row per (crop, variety) pair. The row's `id` field is the
`cropVarietiesTable.id` (variety id), and the row separately carries a `cropId` field pointing at
`cropsTable.id`. Downstream endpoints that reference both a crop and a variety (e.g. seed-batches
POST body wants `cropId` + `varietyId`) need both fields — passing the row `id` for both silently
persists a plausible-looking but wrong `cropId`.

**Why:** Found while building the mobile Seed Store screen — the `ApiCrop` interface consumed by
mobile hooks didn't originally expose `cropId`, so the only id available was the variety id, and it
got reused for both fields.

**How to apply:** Whenever building a new consumer (mobile screen, script, etc.) of the crops list
endpoint that needs to write back a crop-scoped record, confirm the client-side type/interface
exposes a distinct `cropId` alongside `id`/`varietyId`, and never assume a single id serves both
purposes. Also, when a crop has more than one variety, don't silently fall back to "first variety
matching this crop name" — require an explicit variety selection in the UI, since defaulting risks
attaching a batch/record to the wrong variety without the user noticing.
