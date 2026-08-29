---
name: Drizzle correlated subquery columns
description: Avoid silent miscounts when a Drizzle scalar subquery compares same-named inner and outer columns.
---

Drizzle SQL template interpolation can emit an outer-table column without its table qualifier inside a correlated scalar subquery. If the inner table has the same column name, PostgreSQL resolves the reference to the inner table and returns a plausible but incorrect result instead of an error.

**Why:** An attachment-count subquery generated `record_id = "id"` rather than a qualified outer-table ID, silently returning zero even though the matching attachment existed.

**How to apply:** For correlated counts, inspect `query.toSQL()` and run a real-data check. Prefer a typed `leftJoin` with `groupBy` and a filtered aggregate when inner and outer tables share column names.