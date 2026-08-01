---
name: date columns + String(Date) → 500
description: Rule for passing date params in api-server raw-SQL routes after sanitiseBody
---

**Rule:** Never pass a body field through plain `String()` coercion into a Postgres `date` column when the body went through `sanitiseBody` — it converts ISO strings to JS Date objects, and `String(date)` produces a locale-style string Postgres rejects (22007) as a generic 500. Normalise to `YYYY-MM-DD` instead.

**Why:** The drizzle "Failed query" log hides the pg root cause; the failure looks unrelated (e.g. blamed on adjacent SQL). The real error is only in `err.cause` (`cause.message`/`cause.code`) — log that when a raw-SQL route 500s mysteriously.

**How to apply:** Any raw-SQL route writing `date` columns from a sanitised body; grep for the local date normaliser helper in the winery section of farms.ts and reuse the pattern.
