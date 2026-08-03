---
name: date columns + String(Date) → 500
description: Rule for passing date params in api-server raw-SQL routes after sanitiseBody
---

**Rule:** Never pass a body field through plain `String()` coercion into a Postgres `date` column when the body went through `sanitiseBody` — it converts ISO strings to JS Date objects, and `String(date)` produces a locale-style string Postgres rejects (22007) as a generic 500. Normalise to `YYYY-MM-DD` instead.

**Why:** The drizzle "Failed query" log hides the pg root cause; the failure looks unrelated (e.g. blamed on adjacent SQL). The real error is only in `err.cause` (`cause.message`/`cause.code`) — log that when a raw-SQL route 500s mysteriously.

**How to apply:** Fixed at the source (Aug 2026): `sanitiseBody` now converts ISO strings to `SafeDate` — a Date subclass whose `toString()`/`toJSON()` return the ORIGINAL ISO string. So `String(b.field)` / `${b.field}` yields `YYYY-MM-DD...` (safe for `date` columns), while `instanceof Date` + `toISOString()` still work (safe for Drizzle `timestamp` columns and the pg driver). New routes need no `nd()` — plain String coercion is safe. The existing `nd()` helper still works (SafeDate hits its `instanceof Date` branch). Do NOT change sanitiseBody to pass date strings through unchanged: ~500 drizzle insert/update call sites feed date-only strings into `timestamp` (mode Date) columns and would crash with "value.toISOString is not a function".
