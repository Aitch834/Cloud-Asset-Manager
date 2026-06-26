---
name: LIS LIP Cattle credentials & integration status
description: LIP (Livestock Information Platform) auth foundation — schema, migration, API routes, UI card built
---

## Status
- LIP auth foundation is BUILT (schema + migration + API test endpoint + FarmSettings card)
- LIP subscription approvals still pending from LIS (up to 5 working days from first request)

## What exists
- `lib/db/src/schema/livestock.ts`: `lipFarmTokensTable` — platform-level (no per-farm creds)
- `artifacts/api-server/src/lib/lisMigrations.ts`: `CREATE TABLE IF NOT EXISTS lip_farm_tokens`
- `artifacts/api-server/src/routes/farms.ts`: 
  - `GET /farms/:farmId/lip-credentials` — returns { configured, platformReady, testStatus, testMessage, lastTestedAt }
  - `POST /farms/:farmId/lip-credentials/test` — tries client_credentials OAuth then probes API
- `artifacts/dashboard/src/pages/FarmSettings.tsx`: `LipConnectionCard` component (purple Alpha badge, test button, status display)

## LIP OAuth approach
- Grant type: client_credentials (machine-to-machine — no per-farm OAuth needed)
- Token endpoint: `https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/oauth2/v2.0/token`
- Scope attempt: `https://livestockinformationb2cprod.onmicrosoft.com/apim-lip-ext/.default`
- API base: `https://api.service.livestockinformation.org.uk`
- Subscription key header: `Ocp-Apim-Subscription-Key` using `LIS_LIP_SUBSCRIPTION_KEY`
- Probe endpoint: `/v1.0/breeds?species=bovine`
- Status values: "connected" | "partial" (API reachable but auth not accepted) | "unreachable" | "failed"

## Known uncertainties (Alpha)
- Exact OAuth scope string unconfirmed — may need updating once LIS confirms
- /v1.0/breeds endpoint path unconfirmed for LIP (differs from CLA)
- Subscription approval still pending (3 subscriptions: LIS API Sandbox, My LIS API Sandbox, possibly LUIS)

## Secrets in use
- LIS_LIP_CLIENT_ID, LIS_LIP_PRIMARY_SECRET, LIS_LIP_SECONDARY_SECRET (rotation fallback)
- LIS_LIP_SUBSCRIPTION_KEY, LIS_LIP_SUBSCRIPTION_KEY_2
- LIS_LIP_MYLIS_SUBSCRIPTION_KEY, LIS_LIP_MYLIS_SUBSCRIPTION_KEY_2

**Why client credentials:** LIP uses platform-level BDE app registration, not per-farm user auth.
This is different from CLA (sheep) which requires each farmer to authenticate through LIS B2C.
