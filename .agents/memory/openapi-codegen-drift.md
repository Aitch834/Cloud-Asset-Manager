---
name: OpenAPI codegen drift
description: Safeguard for regenerating API clients when the OpenAPI source trails live generated schemas.
---

Regenerating API clients can remove fields that were previously added directly to generated output but never backfilled into the OpenAPI source.

**Why:** A focused lead-schema regeneration attempted to delete unrelated farm-sector and support-ticket fields that remain in active use.

**How to apply:** After API codegen, inspect the complete generated diff and restore unrelated removals. Prefer a separate follow-up to reconcile the OpenAPI source rather than expanding a focused feature task.