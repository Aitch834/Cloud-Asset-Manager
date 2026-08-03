---
name: Signed winery record writes need audit-trail append
description: Any endpoint that mutates a signable winery record must append edit_history when signed
---

Winery records (pressing, fermentation, cellar ops, bottling) carry an `audit_signature`. Once signed, **every** write path — including narrow single-column endpoints — must atomically append an edit-history entry in the same UPDATE:

```sql
SET edit_history = CASE WHEN audit_signature IS NOT NULL
  THEN COALESCE(edit_history,'[]'::jsonb) || ${buildAuditEditEntry(await resolveAuditEditor(req), "…action…")}::jsonb
  ELSE COALESCE(edit_history,'[]'::jsonb) END, …
```

**Why:** completion code review rejects any new write route that can change a signed record without a tracked, authenticated-editor entry (audit/compliance regression). Attribution must come from `resolveAuditEditor(req)`, never the request body.

**How to apply:** when adding any new PUT/PATCH touching these tables in `artifacts/api-server/src/routes/farms.ts`, copy the CASE pattern from the main pressing PUT. Signed records also block DELETE (409).
