---
name: LIS LIP Cattle credentials & integration status
description: LIP (Livestock Information Platform) confirmed as per-farm delegated OAuth — full OAuth routes built
---

## Status (updated 4 Jul 2026)
- LIP OAuth architecture corrected to per-farm delegated flow (user_impersonation)
- Full authorize + callback routes built, LipConnectionCard rewritten to match
- **Interactive sign-in CONFIRMED WORKING end-to-end** (4 Jul 2026): farm 1 successfully connected using
  the cattle test account (`lisprodsandboxuser26-prod01-li@...`), refresh token stored, `test_status: ok`,
  Test API returns "LIP API reachable (no /health endpoint — expected during Alpha)" — this is the expected/
  correct response, not an error.
- LIP subscription approvals for actual movement/birth/death submission endpoints still pending from LIS —
  authenticated sign-in and basic reachability work now, but movement submission calls may still 403 until
  those subscriptions are approved. Don't re-test connection/sign-in flow again; only test submission
  endpoints once subscriptions are confirmed approved.
- Redirect URI `https://api.bdefarmtrac.co.uk/api/lip/callback` must be registered in LIP developer portal
- ROPC/username-password is NOT supported by LIP (confirmed by LIS, same as CLA) — do not attempt to store
  or script credentials; always use the interactive sign-in popup. Attempting to script the B2C login risks
  triggering bot/fraud detection on a government-linked identity provider — always have the human do the
  interactive step.

## Confirmed portal values (LIP Developer Portal "Additional Credentials", June 2026)
- **api-scopes**: `https://livestockinformationb2cprod.onmicrosoft.com/ms-apimlisapisdbx/user_impersonation`
- **api-url**: `https://sandbox.movement.api.livestockinformation.org.uk/lis-public-sdbx/v1.0`
- **b2c-authority**: `https://livestockinformationb2cprod.b2clogin.com/tfp/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_THIRDPARTY_SIGNIN/v2.0`
- **b2c-tenant**: `Livestockinformationb2cprod`
- **b2c-policy**: `B2C_1A_THIRDPARTY_SIGNIN` (NOT B2C_1A_SIGNIN — different from CLA)

**Critical — B2C URL format (corrected June 2026):**
- The `b2c-authority` value ending in `/tfp/.../v2.0` is the **OIDC issuer only** — DO NOT append `/authorize` or `/token` to it.
- Real authorize endpoint: `https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/b2c_1a_thirdparty_signin/oauth2/v2.0/authorize`
- Real token endpoint: same base + `/token`
- Pattern: `https://{b2cDomain}/{tenant}/{policy_lowercase}/oauth2/v2.0/{authorize|token}`
- Scope gets `offline_access` appended for refresh tokens.
- **Why:** Azure B2C's developer portal shows the issuer URL as `b2c-authority`; the actual OAuth endpoints follow a different path structure not derivable from that issuer URL.

## Architecture (corrected)
- Grant type: **authorization_code** (per-farm delegated OAuth — same pattern as CLA sheep)
- Each farm's user signs in with LIS credentials via B2C_1A_THIRDPARTY_SIGNIN policy
- Access + refresh tokens stored per farm in `lip_farm_tokens`
- lib: `artifacts/api-server/src/lib/lip.ts` (mirrors lis.ts pattern)

## What exists
- `lib/db/src/schema/livestock.ts`: `lipFarmTokensTable` — with sandboxMode, lipRefreshToken, oauthState
- `artifacts/api-server/src/lib/lisMigrations.ts`: CREATE TABLE + ALTER TABLE for new columns
- `artifacts/api-server/src/lib/lip.ts`: buildLipAuthUrl, exchangeLipCode, probeLipApi, signLipOAuthState, verifyLipOAuthState, getLipRedirectUri
- `artifacts/api-server/src/routes/farms.ts`:
  - `GET /farms/:farmId/lip-credentials` — returns { configured, sandboxMode, platformReady, testStatus, testMessage, lastTestedAt }
  - `POST /farms/:farmId/lip-credentials/test` — probes API with subscription key only (no user auth)
  - `DELETE /farms/:farmId/lip-credentials` — clears tokens
  - `GET /api/lip/authorize` — starts B2C auth code flow
  - `GET /api/lip/callback` — exchanges code for tokens, stores, redirects
- `artifacts/dashboard/src/pages/FarmSettings.tsx`: LipConnectionCard with sign-in popup, disconnect, connected state

## Env vars stored (shared)
- LIS_LIP_API_URL_SANDBOX, LIS_LIP_B2C_AUTHORITY_SANDBOX, LIS_LIP_SCOPE_SANDBOX
- Production equivalents: LIS_LIP_API_URL_PROD, LIS_LIP_B2C_AUTHORITY_PROD, LIS_LIP_SCOPE_PROD (not yet set)
- Set LIS_LIP_USE_PRODUCTION=true to switch to prod endpoints

## Secrets in use
- LIS_LIP_CLIENT_ID, LIS_LIP_PRIMARY_SECRET, LIS_LIP_SECONDARY_SECRET
- LIS_LIP_SUBSCRIPTION_KEY, LIS_LIP_SUBSCRIPTION_KEY_2
- LIS_LIP_MYLIS_SUBSCRIPTION_KEY, LIS_LIP_MYLIS_SUBSCRIPTION_KEY_2
- LIS_LIP_REDIRECT_URI (optional — constructed from request if absent)

## Key difference from CLA (sheep)
- CLA: policy = B2C_1A_SIGNIN, authority path without /tfp/
- LIP: policy = B2C_1A_THIRDPARTY_SIGNIN, authority path WITH /tfp/ (/tfp/ is required)
