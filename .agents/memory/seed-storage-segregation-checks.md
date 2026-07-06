---
name: Seed storage segregation checks (CR.ST.19)
description: Where the Red Tractor CR.ST.19 seed/grain segregation feature lives and its scope boundaries
---

Implements Red Tractor CR.ST.19 (treated seed must not contaminate stored grain) as a
recording/reporting feature: `seedStorageSegregationChecksTable` (lib/db), CRUD routes
at `/farms/:farmId/seed-storage-checks` (api-server), a "Segregation Checks" tab on
`SeedStorePage.tsx` (dashboard), and a gap-check card in `ComplianceHealthPanel.tsx`.

**Why:** User confirmed via live fetch of redtractor.org.uk that CR.ST.19 is a
must-comply/evidence-required standard, so it needed the same recording pattern as other
compliance checks (insurance, NMP, silage safety) already on the health panel.

**How to apply:** Mobile intentionally has NO new form for this — only the
`rt-seed-treatment` checklist wording in `compliance-form.tsx` was updated to reference
CR.ST.19 explicitly. If asked to extend seed segregation recording to mobile, that would
be new scope, not a bug — check with the user first, per the project's "mobile kept
simple" convention for this feature.
