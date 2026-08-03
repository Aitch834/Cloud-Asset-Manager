---
name: farm_task_assignments task_type default
description: task_type column defaults to 'custom', so "untyped" legacy tasks are 'custom', not NULL
---
The `farm_task_assignments.task_type` column has DB default `'custom'::text`; `task_source_id` has no default (NULL).

**Why:** A backfill that matched `task_type IS NULL` silently touched zero rows — legacy rows all carry `'custom'`.

**How to apply:** any migration/query targeting tasks without a structured type must match `task_type IS NULL OR task_type IN ('', 'custom')`. Verify backfills with an INSERT+UPDATE+ROLLBACK transaction in psql before shipping.
