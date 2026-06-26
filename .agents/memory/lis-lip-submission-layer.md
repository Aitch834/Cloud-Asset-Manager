---
name: LIS LIP submission layer
description: Architecture and key decisions for the LIP cattle movement/birth/death submission layer built on top of the per-farm OAuth flow.
---

## Architecture

**lib/lip.ts** exports:
- `refreshLipToken(refreshToken)` — refresh B2C token via refresh_token grant (same B2C_1A_THIRDPARTY_SIGNIN authority)
- `callLipApi(accessToken, method, path, body)` — authenticated fetch with Bearer + Ocp-Apim-Subscription-Key
- `submitLipMovement(params)` — movement notification (POST /movements)
- `submitLipBirth(params)` — calving/birth registration (POST /births)
- `submitLipDeath(params)` — death registration (POST /deaths)

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

## Why sandbox-first

LIS LIP Alpha subscriptions are pending approval (up to 5 working days). Sandbox mode:
1. Builds the full payload (identical to live)
2. Logs it to console and `lip_submissions` row
3. Returns `LIP-SANDBOX-{timestamp}` provisional reference
4. When live subscription approved (or 403 is not returned), the exact same code path sends to real API

Live detection: `isLipSandboxMode()` = `LIS_LIP_USE_PRODUCTION !== "true"`. Also fallback: if API returns 403 even in live mode, treats as sandbox.

## Provisional API endpoints

Endpoint paths (`/movements`, `/births`, `/deaths`) and payload format are educated guesses based on:
- LIS CLA sheep API patterns
- Standard UK cattle movement reporting (BCMS → LIP transition)
- LIP portal API base: `https://sandbox.movement.api.livestockinformation.org.uk/lis-public-sdbx/v1.0`

**Must verify against LIP Alpha swagger/OpenAPI spec once subscription is approved.** Update paths and payload field names as needed — the core plumbing (auth, submission logging, UI) will not need to change.

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
