---
name: LIS credentials & integration status
description: LIS CLA API secrets, confirmed working auth endpoint, OAuth flow status
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

## CLA API request/response conventions (confirmed working June 2026)
- POST bodies must be wrapped: `{ "content": { "holdings": [...] } }` — bare `{ "holdings": [...] }` returns 400 with "not a valid parameter" error
- ValidHoldings response shape: `{ content: { validateResults: [{ holding, state, propertyName }] } }` — state value is `"Valid"` for recognised holdings
- Response parsing must try `d.validateResults ?? d.content?.validateResults ?? d.value ?? d.items` to handle shape variations

## Token refresh (confirmed working June 2026)
- `refreshLisToken` tries proxy first, then falls through (does NOT return) to direct B2C if proxy fails
- Direct refresh tries 4 endpoints in order: sandbox B2C policy → prod B2C policy → sandbox AAD → prod AAD
- Sandbox policy endpoint is first because beta test users are in `livestockinformationb2cprod` tenant
- ROPC fallback in test-connection and sync routes is skipped if `creds.refreshToken` exists

## UK Proxy
- Deployed on DigitalOcean London (LON1) VPS at port 3001, pm2 process `lis-proxy`
- Token/refresh calls route through proxy when `LIS_PROXY_URL` is set
- Auth code exchange (`exchangeLisCode`) calls b2clogin.com directly — no proxy needed for that leg
