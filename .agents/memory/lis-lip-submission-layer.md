---
name: LIS LIP submission layer
description: Architecture and key decisions for the LIP cattle movement/birth/death submission layer built on top of the per-farm OAuth flow.
---

## Architecture

**lib/lip.ts** exports:
- `refreshLipToken(refreshToken)` — refresh B2C token via refresh_token grant (same B2C_1A_THIRDPARTY_SIGNIN authority)
- `callLipApi(accessToken, method, path, body)` — authenticated fetch with Bearer + Ocp-Apim-Subscription-Key (JSON)
- `callLipApiMultipart(accessToken, path, movementData)` — authenticated POST with multipart/form-data (required for POST /movements)
- `submitLipMovement(params)` — movement notification (POST /movements, multipart/form-data)
- `submitLipBirth(params)` — calving/birth registration (POST /animals, application/json)
- `submitLipDeath(params)` — death registration (PUT /animals/{identifier}, application/json)

**lib/db schema**: `lipSubmissionsTable` in `livestock.ts` — 18 cols (farmId, movementId, mortalityId, calvingId, submissionType, status, sandboxMode, lipReference, requestPayload jsonb, responsePayload jsonb, etc.). Migration in `lisMigrations.ts` (CREATE TABLE IF NOT EXISTS).

**farms.ts routes**:
- `GET /farms/:farmId/lip-submissions` — list history
- `POST /farms/:farmId/lip-submit-movement/:movementId` — cattle movement
- `POST /farms/:farmId/lip-submit-death/:mortalityId` — mortality
- `POST /farms/:farmId/lip-submit-birth/:calvingId` — calving
- All routes: fetch lipFarmTokensTable, refresh if expired (2-min buffer), then call submit fn, log to lipSubmissionsTable

**Movements.tsx** additions:
- `"lip-submissions"` tab (5th tab), purple colour scheme
- `lipCredsData` query → `/lip-credentials`, `lipConfigured` boolean
- `lipSubmissions` query → `/lip-submissions`
- `submitLipMut` mutation → `/lip-submit-movement/:id`
- `lipBtn` shown on cattle rows when `lipConfigured` (purple, alongside BCMS green and LIS blue)
- Confirm dialog with `DialogDescription` (had to add to dialog imports)
- Full submission history table in `lip-submissions` tab

## Confirmed API endpoints (LIS public spec + support reply 07/07/2026)

| Operation | Endpoint | Content-Type |
|-----------|----------|--------------|
| Create movement | `POST /movements` | **multipart/form-data** (movementData JSON part) |
| Update movement | `PUT /movements/{movementNumber}` | application/json |
| Register birth | `POST /animals` | application/json |
| Register death | `PUT /animals/{identifier}` | application/json |

**Critical**: `POST /movements` returns 415 if sent as application/json — MUST use multipart/form-data with a `movementData` blob (application/json content-type on the part). Use `callLipApiMultipart` helper.

## Movement payload structure (spec-verified)

```typescript
{
  movementKind: "standard",        // enum not published in spec — use "standard"
  state: "preNotified",            // enum: awaitingConfirmation | preNotified | ...
  movementReports: [{
    departure: {
      site: { identifiers: [{ identifier: "12/345/6789" }] },
      date: "YYYY-MM-DD",
    },
    arrival: {
      site: { identifiers: [{ identifier: "98/765/4321" }] },
      date: "YYYY-MM-DD",
    },
    batches: [{
      species: "cattle",
      animals: [{ animalIdentifier: "UK123..." }]  // or [{ quantity: N }] if no tags
    }]
  }],
  createdDateTime: "<ISO8601>",
  updatedDateTime: "<ISO8601>",
}
```

## Birth payload structure (spec-verified, POST /animals)

```typescript
{
  animal: { identifier: earTag, species: "cattle", sex?: "male"|"female" },
  breed?: { name: "..." },
  birth: {
    site: { identifiers: [{ identifier: holdingCph }] },
    date: "YYYY-MM-DD",
    assistedBirthFlag: false,
    multipleBirthsFlag: false,
    embryoTransferFlag: false,
  },
  registration: {
    site: { identifiers: [{ identifier: holdingCph }] },
    date: "YYYY-MM-DD",
    category: "bovine",
  },
  importParents?: { birthDam: { identifier: damTag, species: "cattle" } },
}
```

## Death payload structure (spec-verified, PUT /animals/{identifier})

```typescript
{
  animal: { identifier: earTag, species: "cattle" },
  registration: {
    site: { identifiers: [{ identifier: holdingCph }] },
    date: deathDate,
    category: "bovine",
  },
  death: {
    date: deathDate,
    site: { identifiers: [{ identifier: holdingCph }] },
    reason?: { name: causeOfDeath },
  },
}
```
No ear tag → returns error immediately (can't call PUT /animals/{identifier} without identifier).

## Subscription key — secondary is active

Primary APIM key (LIS_LIP_SUBSCRIPTION_KEY) rejected by sandbox with "invalid subscription key".
Secondary key (LIS_LIP_SUBSCRIPTION_KEY_2) is live and working.
`callLipApiWithKey` already auto-retries with fallback key when primary returns "invalid subscription key" error.
LIS support confirmed (07/07/2026): "Secondary key should be fine and you can continue using that".

## Why sandbox-first

LIS LIP subscriptions are pending approval. Sandbox mode:
1. Always attempts the real LIS sandbox API call
2. Falls back to `LIP-SANDBOX-{timestamp}` provisional reference ONLY when API returns 403 (subscription not yet active)
3. When live subscription approved, the exact same code path sends to real API automatically

Live detection: `isLipSandboxMode()` = `LIS_LIP_USE_PRODUCTION !== "true"`. LIP_API_BASE points to sandbox URL until production approved.

## Death/birth submissions

`/lip-submit-death/:mortalityId` — populates `bcmsNotified` and `bcmsNotificationRef` on the mortality row (LIP reference stored there for now, as that's the existing "death notified" tracking mechanism).

`/lip-submit-birth/:calvingId` — reads from `dairyCalvingRecordsTable`; no separate flag updated yet (calving records don't have a LIP-submitted flag; the lipSubmissionsTable row is the source of truth).

## Token refresh pattern (in each route)

Routes inline the refresh logic rather than calling a helper function, to avoid adding complexity to the giant farms.ts file. Pattern:
```typescript
const nowPlusBuffer = new Date(Date.now() + 120_000);
const isExpired = !accessToken || (tokenRow.tokenExpiresAt && new Date(tokenRow.tokenExpiresAt) < nowPlusBuffer);
if (isExpired && tokenRow.lipRefreshToken) {
  const refreshResult = await refreshLipToken(tokenRow.lipRefreshToken);
  if (refreshResult.success) { /* update DB + accessToken */ }
}
```
