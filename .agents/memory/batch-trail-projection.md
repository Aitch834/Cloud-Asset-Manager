---
name: Batch-trail API projections are explicit column lists
description: Any new field surfaced in batch-trail print/CSV output must be added to BOTH SQL projections in the batch-trail route
---

The `winery-pressing/batch-trail` route in api-server's farms.ts has two separate SQL projection blocks (batchRef scope and vintageYear scope), each with explicit SELECT column lists per record type. They are not `SELECT *`.

**Why:** Adding a new field to the dashboard's batch-trail print/CSV renderer silently renders it as empty/unsigned unless the column is added to both SELECTs — a completion review rejected exactly this (SO₂ test sign-off fields present in the renderer but absent from the projections).

**How to apply:** When surfacing any record field in batch-trail outputs, grep the route for the record's table and update both scope blocks, then verify via a dev-bypass curl in both scopes. Also: signed winery records are delete-locked (`SIGNED_RECORD_LOCKED`), so clean up signed test fixtures via SQL, not the DELETE route.
