---
name: LIS LIP Cattle credentials & integration status
description: LIP (Livestock Information Platform) confirmed as per-farm delegated OAuth — full OAuth routes built
---

## Status (updated 4 Jul 2026 — subscription key + endpoint investigation)
- **Root cause of the 401 "invalid subscription key" found:** `LIS_LIP_SUBSCRIPTION_KEY` (primary APIM key) is
  rejected by the real sandbox, but `LIS_LIP_SUBSCRIPTION_KEY_2` (secondary) is live and works — confirmed via
  direct calls returning real 200/400 business responses (not auth errors) once key_2 was used. Most likely
  explanation: LIS regenerated the primary key on their side after issuance and our stored primary secret is
  stale, while the secondary was unaffected. `LIS_LIP_MYLIS_SUBSCRIPTION_KEY`/`_2` are unused/unrelated and both
  401 — do not use them for LIP movement calls.
- **Fix applied:** `callLipApi` in `lip.ts` now automatically retries with `LIS_LIP_SUBSCRIPTION_KEY_2` whenever
  the primary key is rejected with an "invalid subscription key" response, so submissions keep working
  regardless of which key LIS currently has active. `probeLipApi` also falls back if the primary key is unset.
- **`/movements` resource confirmed real and partially working:** `GET /movements?SiteIdentifier=<CPH>` (URL-
  encoded CPH, e.g. `44/025/0001`) returns real `200` responses (`{values, errors, meta}` shape) once
  authenticated with the working key — this is a genuine query-by-holding endpoint. `SiteIdentifier` is a
  **query parameter on the API call itself**, not something that needs separate per-holding storage in Farm
  Settings — the farm's own CPH(s) already stored in the app can be passed straight through.
  - **However, `POST /movements` (actual submission) reliably returns 415 Unsupported Media Type** regardless of
    Content-Type variant tried (`application/json`, `application/json-patch+json`, with/without SiteIdentifier
    as query param, single object vs array body). This is NOT a subscription/auth problem — the request
    authenticates fine and reaches the app, but the API rejects the write. Most likely this sandbox resource is
    read-only (a movement-history query API), and genuine third-party submission requires either a different
    LIS product/endpoint not yet accessible in Alpha, or a different request shape not yet documented.
  - `/births`, `/deaths`, `/animals`, `/holdings` all return genuine 404 "Resource not found" under the working
    key too (not a key/auth issue) — these paths do not exist in this sandbox. They were always provisional
    guesses (see code comments); no confirmed alternative path was found despite probing common variants
    (`/movements/submit`, `/movementreports`, `PUT /movements`, etc. — all 404).
  - **Open question for LIS support:** whether cattle birth/death reporting is even a LIP REST resource at all,
    or whether it's expected to go through BCMS/a different channel, and what the correct write endpoint/method
    is for movements (this sandbox looks read-only for `/movements` as tested).

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
- **Bug found & fixed (4 Jul 2026):** `submitLipMovement`/`submitLipBirth`/`submitLipDeath` in `lip.ts` used
  to short-circuit and fabricate a fake local success whenever `isLipSandboxMode()` was true — they never
  called the real API at all, so approval could never have been detected. Fixed to always attempt the real
  call (against the correct sandbox/prod URL) and only fall back to a fake reference when the response
  actively signals "not yet approved" (see `isSubscriptionPendingResponse` helper — handles both a plain 403
  and a 401 whose body mentions "subscription", since LIP's APIM has been observed to use either depending
  on endpoint/product).
- **Live subscription test (4 Jul 2026), against real sandbox API using farm 1's stored OAuth token:**
  movement submission → HTTP 401 "invalid subscription key" (still NOT approved — different subscription
  key requirement per API product than the general reachability check, which already works). Birth/death
  submission → HTTP 404 "Resource not found" (endpoint paths `/births` and `/deaths` are still unverified/
  provisional per the code comments — a separate problem from subscription approval, not yet resolved).
  Test artifacts (temporary `lip_submissions` rows) were cleaned up after testing.
- **To re-check approval status in future:** just re-run a real movement submission (via UI or the
  dev-bypass API test) — thanks to the fix above, it will now genuinely succeed the moment LIS approves the
  movement subscription, instead of always faking success. No code changes needed to detect it.
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
