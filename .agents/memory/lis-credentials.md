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
- Header: `X-Proxy-Secret` (not `x-bde-proxy-secret`)
- **Known bug: proxy URL-encodes `$` to `%24` in query strings.** OData params like `$top`, `$filter`, `$orderby` are mangled when forwarded to LIS. LIS then returns 400 "The $top query parameter must be provided" even when $top IS in the URL.
- **Workaround:** Avoid query-string OData params. Use OData path functions instead (e.g. `ReviewBySpecies(species='Sheep',holding='...')` works fine). Fix requires updating the proxy server.
- POSTs with JSON bodies work correctly via the proxy (no encoding issues).
- `$metadata` path (GET /lis/cla/$metadata) returns 404 — not exposed through the APIM gateway.

## POST /TransferRequests — CONFIRMED WORKING SCHEMA (July 2026)

**Result: 201 Created — `requestId` returned. First successful submission July 15 2026.**

Confirmed TransferModel fields (all others tried return "property X does not exist on type CLAOData.Models.Transfer.TransferModel"):
```json
{
  "content": {
    "transferDate": "2026-07-14",          // ISO date string (NOT movementDate, date, etc.)
    "species": "Sheep",                     // Title-case: 'Sheep' | 'Goat' | 'Deer' (NOT 'SHEEP')
    "userHolding": "01/100/0257",           // Farm's own CPH (source for off, dest for on)
    "sourceHolding": "01/100/0257",         // Departure CPH
    "destinationHolding": "01/100/0264",    // Destination CPH
    "animalCount": 3,                       // Top-level total count (NOT animalTotal, numberOfAnimals, headCount)
    "movementGroups": [{
      "batches": [{
        "batchNumber": "UK130181",          // Flock mark: UK + flock-code-without-leading-zeros
        "animalTotal": 3                    // Count within this batch
      }]
    }]
  }
}
```

**Flock mark (batchNumber) derivation from ear tags:**
- Ear tag format: `UK<7-char flock code><5-char sequence>` e.g. `UK013018100001`
- Flock code = chars 2–8: `0130181`
- batchNumber = `UK` + lstrip-zeros(flock-code) = `UK130181`
- Implemented in `buildMovementPayload` — uses `req.flockMark` if provided, else derives from first ear tag

**Key discoveries (70+ field names tried to find these):**
- `batches` ❌ for species='Sheep' when batchNumber is an individual ear tag format (e.g. UK013018100001)
- `batches` ✅ for species='Sheep' when batchNumber is the flock mark format (e.g. UK130181)
- Individual ear tag array field in MovementGroup: STILL UNKNOWN after 70+ attempts
  (tried: animals, individuals, tags, earTags, identifiedAnimals, tagInformations, identifications, and many more)
  → Batch approach with flock mark is the current working solution

**Response shape:**
```json
{
  "@odata.context": "https://lz-cla-core-cla-odata-prod-ext-uks-01.azurewebsites.net/v1/$metadata#TransferRequests/$entity",
  "requestId": 60197,
  "requestStatus": "Pending",
  "requestDate": "2026-07-15T00:22:31.717+01:00",
  "updatedDate": "2026-07-15T00:22:31.717+01:00",
  "isFullUndone": false,
  "undoSupported": true,
  "userName": null,
  "isContentPurged": false,
  "errors": [],
  "warnings": [],
  "validationErrors": null
}
```
Reference stored as `requestId` (integer). `submitLisMovement` already handles `responseData?.requestId`.

## CLA Endpoint Test Matrix (July 2026)
| Endpoint | Method | Status | Notes |
|---|---|---|---|
| /Holdings/ValidHoldings | POST | ✅ 200 | Content wrapper required |
| /HoldingMovementForReviews/ReviewBySpecies(species='...',holding='...') | GET | ✅ 200 | Path-param OData, no query string |
| /TransferRequests | POST | ✅ 201 | Working — confirmed July 2026. Schema above. |
| /TransferRequests?$top=50 | GET | ❌ 400 | Proxy encodes `$` → `%24`; LIS never sees `$top` |
| /$metadata | GET | ❌ 404 | Not exposed through APIM gateway |
| /ReviewHoldingMovementRequests | POST | ✅ implemented | Content wrapper; used in review flow |
| /UndoRequests | POST | ✅ implemented | Content wrapper |

## `isLisSandboxMode()` in lis.ts
Checks `!process.env.LIS_SUBSCRIPTION_KEY` (NOT `LIS_USE_SANDBOX_API`). Since the key IS set in production, sandbox mode is always `false`. The `LIS_USE_SANDBOX_API` env var is now irrelevant to this function.
