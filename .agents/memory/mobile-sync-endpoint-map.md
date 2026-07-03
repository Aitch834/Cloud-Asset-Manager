---
name: Mobile sync-engine endpoint map gaps
description: A fully-built offline mobile screen can silently never reach the server if its storage key isn't registered in the sync engine's endpoint map.
---

The mobile app's offline record flow has two independent registration points that must both be updated for a new record type to actually sync:

1. The screen itself (form + local save via `appendToList` to a storage key).
2. `getSyncEndpoint()`'s type map in `artifacts/mobile/lib/sync-engine.ts`, which maps each storage key (e.g. `bde_encampment_reports`) to its API endpoint (e.g. `/farms/${farmId}/encampments`).

**Why:** A screen with no navigation registration crashes/no-ops (loud, visible). A screen missing from the endpoint map fails silently — the record saves locally, `synced: false` never flips, and data quietly never reaches the backend. This was found for two already-built screens (encampments, waste-disposal) that had complete forms and local persistence but no server sync.

**How to apply:** When adding or auditing any new offline-capable mobile record type, check three things together: (1) it's registered in `app/_layout.tsx` Stack.Screen if it has a custom header, (2) its storage key has an entry in `getSyncEndpoint()`'s type map, (3) the local record's field names match what the API route expects (no `remapForApi` transform exists unless explicitly added — field names are sent as-is by default).
