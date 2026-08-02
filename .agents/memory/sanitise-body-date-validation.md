---
name: sanitiseBody breaks strict date validation
description: Why date-format validation must run on the original request string, not the sanitised value.
---

Rule: any route doing strict YYYY-MM-DD validation must validate the ORIGINAL body string before/instead of the `sanitiseBody()` output, and insert the validated string (via `nd()` only for already-validated values).

**Why:** `sanitiseBody` converts ISO-looking strings to JS Date objects. Two failure modes: (1) `n(dateField)` then yields "Wed Jul 01 2026 …" which fails the regex, so ALL valid rows get rejected; (2) JS Date silently normalises invalid calendar dates (2025-02-30 → Mar 2), so `nd()` on the sanitised value would ACCEPT and alter bad dates. A completion code review rejected an nd()-only fix for exactly reason (2).

**How to apply:** In bulk/import routes, keep a reference to the raw record before `sanitiseBody`, validate `typeof raw.date === "string"` + regex + days-in-month on that, then overwrite the sanitised field with the validated string before insert.
