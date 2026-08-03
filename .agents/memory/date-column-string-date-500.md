---
name: date columns + String(Date) → 500
description: Rule for passing date params in api-server raw-SQL routes after sanitiseBody
---

**Rule:** Never pass a body field through plain `String()` coercion into a Postgres `date` column when the body went through `sanitiseBody` — it converts ISO strings to JS Date objects, and `String(date)` produces a locale-style string Postgres rejects (22007) as a generic 500. Normalise to `YYYY-MM-DD` instead.

**Why:** The drizzle "Failed query" log hides the pg root cause; the failure looks unrelated (e.g. blamed on adjacent SQL). The real error is only in `err.cause` (`cause.message`/`cause.code`) — log that when a raw-SQL route 500s mysteriously.

**How to apply:** Any raw-SQL route writing `date` columns from a sanitised body; reuse the `nd()` normaliser in farms.ts (winery section). All existing sanitised-body routes in farms.ts were swept and fixed (Aug 2026); apply `nd()` in any NEW route that String-coerces a sanitised date field. Routes using raw `req.body` (not sanitiseBody) are unaffected.
