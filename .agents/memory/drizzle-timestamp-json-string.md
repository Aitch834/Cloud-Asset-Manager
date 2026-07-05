---
name: Drizzle timestamp columns reject raw JSON date strings
description: db.insert/update on a pgTable timestamp column throws "value.toISOString is not a function" if given a raw string from a JSON request body instead of a Date object.
---

Drizzle's `timestamp(...)` column type (mode not set to "string") calls `.toISOString()` on the value during `mapToDriverValue`. A plain ISO date string from `JSON.parse(req.body)` is not a `Date` instance, so the insert/update throws `TypeError: value.toISOString is not a function`, surfaced generically as a 500 "Internal server error".

**Why:** Found while adding `rowSpacingCm` to `seedDrillingRecordsTable` — the seed-drilling POST/PUT routes in `farms.ts` never converted `body.drillingDate` before passing it to `db.insert(...).values({...body})`, so creating/updating any seed drilling record via the API was silently broken (pre-existing bug, unrelated to the new column). Other date-bearing routes in the same file consistently do `body.xDate = new Date(body.xDate)` before insert/update — this route had been missed.

**How to apply:** Whenever adding or touching a route that inserts/updates a timestamp column from `req.body`, confirm the date field is explicitly wrapped in `new Date(...)` before it reaches `db.insert`/`db.update`. If a "Failed query" / `toISOString is not a function` error appears in API logs after a POST/PUT, check for this exact omission first.
