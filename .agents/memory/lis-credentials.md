---
name: LIS credentials & integration status
description: LIS CLA API secrets configured in Replit, Azure AD auth endpoint, and what's pending from LIS support
---

## Configured secrets (Replit)
- `LIS_SUBSCRIPTION_KEY` — BDE vendor platform key (Ocp-Apim-Subscription-Key header)
- `LIS_B2C_CLIENT_ID` — `91afad18-e537-48bb-840b-06f4fa943ac6` (Beta Sandbox environment)
- `CREDENTIAL_ENCRYPTION_KEY` — AES-256-GCM key for encrypting stored LIS/BCMS passwords
- `LIS_PROXY_URL` — URL of the UK VPS proxy (e.g. http://<IP>:3001)
- `LIS_PROXY_SECRET` — shared secret sent in X-Proxy-Secret header to the proxy

## Integration mode
- `isLisSandboxMode()` returns `false` when `LIS_SUBSCRIPTION_KEY` is set (real API calls)
- `isSandboxApi()` returns `true` when `LIS_USE_SANDBOX_API=true` — routes CLA API to `api.sandbox.cla.*` AND uses the sandbox AAD tenant
- Code in `artifacts/api-server/src/lib/lis.ts`
- Proxy code in `lis-proxy/index.js` (deployed on DigitalOcean London VPS)

## Auth endpoint — CRITICAL: NOT Azure AD B2C

LIS uses **standard Azure AD ROPC** via `login.microsoftonline.com`, NOT `b2clogin.com`.
The b2clogin.com URLs return HTML 404. The correct endpoints are:

- **Sandbox:** `https://login.microsoftonline.com/livestockinformationb2cprod.onmicrosoft.com/oauth2/v2.0/token`
- **Production:** `https://login.microsoftonline.com/livestockinformation.onmicrosoft.com/oauth2/v2.0/token`
- **Scope (both):** `openid profile offline_access`

The custom `user_impersonation` scope (`https://livestockinformationb2cprod.onmicrosoft.com/api/user_impersonation`) does NOT exist in the sandbox tenant — returns AADSTS500011.

**Why:** Confirmed by live curl test from UK VPS — only `login.microsoftonline.com` + `openid profile offline_access` returns a valid Bearer token.

## UK Proxy
- LIS API unreachable from Replit US infrastructure (ENOTFOUND)
- Proxy deployed on DigitalOcean London (LON1) VPS at port 3001
- When `LIS_PROXY_URL` is set in Replit Secrets, all LIS calls route through it
- Proxy setup guide: `docs/lis-proxy-setup.md`

## Pending from LIS support
- Confirm the correct scope/resource for CLA API token (the openid token may not carry CLA API permissions — may need a specific resource scope for movement submissions)
- Whether a `client_secret` is required for confidential client registration
