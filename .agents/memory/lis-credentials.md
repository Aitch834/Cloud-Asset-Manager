---
name: LIS credentials & integration status
description: LIS CLA API secrets, confirmed working auth endpoint, OAuth flow status, endpoint test matrix, confirmed TransferRequest schema
---

## Configured secrets (Replit)
- `LIS_SUBSCRIPTION_KEY` — BDE vendor platform key (Ocp-Apim-Subscription-Key header)
- `LIS_B2C_CLIENT_ID` — `91afad18-e537-48bb-840b-06f4fa943ac6` (Beta Sandbox environment)
- `CREDENTIAL_ENCRYPTION_KEY` — AES-256-GCM key for encrypting stored LIS/BCMS passwords
- `LIS_PROXY_URL` — URL of the UK VPS proxy (e.g. http://<IP>:3001)
- `LIS_PROXY_SECRET` — shared secret sent in X-Proxy-Secret header to the proxy
- `LIS_B2C_PRIMARY_SECRET` / `LIS_B2C_SECONDARY_SECRET` — client secrets for CLA app registration
- `LIS_CLA_REDIRECT_URI` — (optional) OAuth callback URI; if not set, constructed from request host

## OAuth Authorization Code Flow — IMPLEMENTED (June 2026)

LIS support confirmed ROPC (username/password) is NOT supported. Delegated access via
interactive sign-in (authorization code flow) is required.

**Flow:**
1. `GET /api/lis/authorize?farmId=X&returnUrl=...` (requireAuth) — generates CSRF nonce,
   stores in `lis_farm_tokens.oauth_state`, redirects to LIS B2C authorize URL
2. LIS B2C redirects to `GET /api/lis/callback?code=X&state=Y` (no auth middleware)
3. Callback validates nonce, calls `exchangeLisCode(code, redirectUri)`, stores tokens,
   redirects back to dashboard with `?lis_connected=true`

**Authorize URL (sandbox):**
`https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/authorize`

**Token exchange URL for code grant (sandbox — B2C policy endpoint):**
`https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/token`

**Scope (sandbox):**
`https://livestockinformationb2cprod.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access`

**Redirect URI:**
Must be registered with LIS in their app registration for `91afad18-…`. Configure via
`LIS_CLA_REDIRECT_URI` secret. For production: `https://api.bdefarmtrac.co.uk/api/lis/callback`.

**Why b2clogin.com for code grant but login.microsoftonline.com for ROPC/refresh:**
Auth code exchange uses B2C policy-specific endpoint. ROPC and refresh token calls use
standard AAD v2 (login.microsoftonline.com). Both work for their respective grant types.

## ROPC / Legacy fallback
`B2C_1A_SIGNIN` returns AADB2C90057 for ROPC — interactive-only confirmed.
ROPC kept as deprecated fallback for farms that stored credentials before OAuth migration.
Token/refresh calls still use `login.microsoftonline.com` (standard AAD v2).

## State nonce schema
`lis_farm_tokens.oauth_state` (text, nullable) — column added June 2026.
Migration already applied: `ALTER TABLE lis_farm_tokens ADD COLUMN IF NOT EXISTS oauth_state text;`

## CLA API gateway
- **Sandbox:** `https://ext-cla.api.livestockinformation.org.uk/v1.0`
- **Production:** `https://cla.api.livestockinformation.org.uk/v1.0`
- `/v1.0` is part of the base URL — do NOT add `/v1/` to resource paths
- **Direct access from Replit (US):** Not possible — LIS returns 401 "invalid subscription key" for direct calls. All calls must go via the UK proxy.

## CLA API request/response conventions (confirmed working June 2026)
- POST bodies must be wrapped: `{ "content": { ... } }` — bare payloads return 400 with "not a valid parameter" error
- ValidHoldings response shape: `{ content: { validateResults: [{ holding, state, propertyName }] } }` — state value is `"Valid"` for recognised holdings
- Response parsing must try `d.validateResults ?? d.content?.validateResults ?? d.value ?? d.items` to handle shape variations

## Token refresh (confirmed working July 2026 — tokens ~3 weeks old)
- `refreshLisToken` tries proxy first, then falls through to direct B2C if proxy fails
- Direct refresh tries 4 endpoints: sandbox B2C policy → prod B2C policy → sandbox AAD → prod AAD
- Sandbox policy endpoint is first because beta test users are in `livestockinformationb2cprod` tenant
- ROPC fallback skipped if `creds.refreshToken` exists

## UK Proxy
- Deployed on DigitalOcean London (LON1) VPS at port 3001, pm2 process `lis-proxy`
- Script at `/root/lis-proxy.js` — rebuilt July 2026 after accidental droplet rebuild
- Header: `X-Proxy-Secret` (not `x-bde-proxy-secret`)
- **$ encoding bug FIXED** in the new proxy script (July 2026). Uses raw `req.url` string concatenation — never passes through `new URL()` which encodes `$` to `%24`.
- POSTs with JSON bodies work correctly via the proxy (no encoding issues).
- `$metadata` path returns 404 — not exposed through the APIM gateway (APIM policy blocks it regardless of $ encoding).
- After proxy rebuild, env vars must be set: `PROXY_SECRET`, `LIS_SUBSCRIPTION_KEY`, `LIS_B2C_CLIENT_ID`

## POST /TransferRequests — FULLY CONFIRMED SCHEMA (July 2026)

**Result: 201 Created — individual ear-tag submission confirmed working.**
**GET /TransferRequests(id)?$expand=content reveals the complete stored schema.**

```json
{
  "content": {
    "transferDate": "2026-07-14",          // ISO date string (NOT movementDate, date, etc.)
    "species": "Sheep",                     // Title-case: 'Sheep' | 'Goat' | 'Deer' (NOT 'SHEEP')
    "userHolding": "01/100/0257",           // Farm's own CPH (source for off, dest for on)
    "sourceHolding": "01/100/0257",         // Departure CPH
    "destinationHolding": "01/100/0264",    // Destination CPH
    "animalCount": 3,                       // Top-level total (NOT animalTotal / numberOfAnimals)

    // PREFERRED: individual ear-tag submission
    "movementGroups": [{
      "devices": [
        { "tagNumber": "UK013018100001" },  // LIS auto-populates rfid from tagNumber
        { "tagNumber": "UK013018100002" },
        { "tagNumber": "UK013018100003" }
      ]
    }]

    // FALLBACK: flock-mark batch (when no individual ear tags known)
    // "movementGroups": [{
    //   "batches": [{ "batchNumber": "UK130181", "animalTotal": 3 }]
    // }]
  }
}
```

**GET response content shape (from $expand=content):**
```json
{
  "sourceHolding": "...", "destinationHolding": "...", "userHolding": "...",
  "transferDate": "...", "animalCount": 3, "species": "Sheep",
  "saleDate": null, "saleId": null, "transportHaulierName": null,
  "transportVehicleRegistrationNo": null, "id": 60206, "trackingId": null,
  "movementGroups": [{
    "fromSubLocation": null, "toSubLocation": null, "vendorHolding": null,
    "batches": [],
    "devices": [
      { "tagNumber": "UK0130181 00001", "rfid": "0826013018100001", "freezebrand": null }
    ],
    "devicesWithDetail": []
  }],
  "movementDocument": {
    "documentType": "CLA",
    "movementDocumentRef": "10496501",   // ← official CLA document reference
    ...
  },
  "deviceApplication": null, "processingFlags": []
}
```

**Key notes:**
- LIS stores tagNumber with a space: `"UK0130181 00001"` (reformats UK + 7-digit code + space + 5-digit seq)
- LIS auto-populates `rfid` from `tagNumber` — only need to send `{ tagNumber }` 
- `movementDocumentRef` in the response is the official CLA document reference for the movement
- `requestStatus: "Success"` appears within seconds on sandbox (may differ on production)
- `devices` sits directly in MovementGroup (NOT inside batches)
- `devicesWithDetail` exists but inner type field names not yet confirmed (`tagNumber` was invalid for it)

**Flock mark derivation (batch fallback only):**
- Ear tag `UK013018100001` → chars 2–8 = `0130181` → strip leading zero → `130181` → `UK130181`

## CLA Endpoint Test Matrix (July 2026)
| Endpoint | Method | Status | Notes |
|---|---|---|---|
| /Holdings/ValidHoldings | POST | ✅ 200 | Content wrapper required |
| /HoldingMovementForReviews/ReviewBySpecies(species='...',holding='...') | GET | ✅ 200 | Path-param OData, no query string |
| /TransferRequests | POST | ✅ 201 | Working — individual devices + batch fallback both confirmed |
| /TransferRequests?$top=N | GET | ✅ 200 | **Fixed** in new proxy ($ encoding bug resolved) |
| /TransferRequests(id)?$expand=content | GET | ✅ 200 | Reveals full stored content including movementGroups |
| /$metadata | GET | ❌ 404 | Blocked at APIM level — not a proxy issue |
| /ReviewHoldingMovementRequests | POST | ✅ implemented | Content wrapper; used in review flow |
| /UndoRequests | POST | ✅ implemented | Content wrapper |

## `isLisSandboxMode()` in lis.ts
Checks `!process.env.LIS_SUBSCRIPTION_KEY` (NOT `LIS_USE_SANDBOX_API`). Since the key IS set in production, sandbox mode is always `false`. The `LIS_USE_SANDBOX_API` env var is now irrelevant to this function.
