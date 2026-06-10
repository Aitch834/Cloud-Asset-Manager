---
name: LIS credentials & integration status
description: LIS CLA API secrets configured in Replit, Azure AD B2C auth endpoint, and confirmed correct API URLs
---

## Configured secrets (Replit)
- `LIS_SUBSCRIPTION_KEY` — BDE vendor platform key (Ocp-Apim-Subscription-Key header)
- `LIS_B2C_CLIENT_ID` — `91afad18-e537-48bb-840b-06f4fa943ac6` (Beta Sandbox environment)
- `CREDENTIAL_ENCRYPTION_KEY` — AES-256-GCM key for encrypting stored LIS/BCMS passwords
- `LIS_PROXY_URL` — URL of the UK VPS proxy (e.g. http://<IP>:3001)
- `LIS_PROXY_SECRET` — shared secret sent in X-Proxy-Secret header to the proxy

## Integration mode
- `isLisSandboxMode()` returns `false` when `LIS_SUBSCRIPTION_KEY` is set (real API calls)
- `isSandboxApi()` returns `true` when `LIS_USE_SANDBOX_API=true` — routes CLA API to sandbox gateway AND uses sandbox B2C tenant
- Code in `artifacts/api-server/src/lib/lis.ts`
- Proxy code in `lis-proxy/index.js` (deployed on DigitalOcean London VPS)

## Auth endpoint — confirmed from LIS Developer Hub Additional Credentials page (June 2026)

LIS uses **Azure B2C with a custom policy (B2C_1A_SIGNIN)**.  
The correct token endpoint format uses `b2clogin.com` + `/tfp/` NOT `login.microsoftonline.com`:

- **Sandbox:** `https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/token`
- **Production:** `https://livestockinformation.b2clogin.com/livestockinformation.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/token`
- **Scope (sandbox):** `openid https://livestockinformationb2cprod.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access`
- **Scope (prod):** `openid https://livestockinformation.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access`
- **B2C policy:** `B2C_1A_SIGNIN`
- **B2C authority (from dev hub):** `https://livestockinformationb2cprod.b2clogin.com/tfp/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_SIGNIN/v2.0`

**Why:** Confirmed from the "Additional Credentials" page on the LIS Developer Hub portal, June 2026.
Previous attempts used `login.microsoftonline.com` + `openid profile offline_access` — these returned tokens but tokens lacked the CLA API scope (`apim-cla-ext/user_impersonation`) needed to call the API.

## CLA API gateway — confirmed from LIS Developer Hub (June 2026)

- **Sandbox:** `https://ext-cla.api.livestockinformation.org.uk/v1.0`
- **Production:** `https://cla.api.livestockinformation.org.uk/v1.0`  
- **The `/v1.0` version prefix is PART OF THE BASE URL** — do NOT add `/v1/` to individual resource paths (e.g. use `/flocks` not `/v1/flocks`)
- `api.cla.livestockinformation.org.uk`, `api.sandbox.cla.livestockinformation.org.uk`, `api.livestockinformation.org.uk` — none of these resolve in public DNS; they are documentation artefacts

## UK Proxy
- LIS API unreachable from Replit US infrastructure (ENOTFOUND)
- Proxy deployed on DigitalOcean London (LON1) VPS at port 3001
- When `LIS_PROXY_URL` is set in Replit Secrets, all LIS calls route through it
- Proxy setup guide: `docs/lis-proxy-setup.md`
- **VPS proxy must be updated** whenever `lis-proxy/index.js` changes in the repo

## Pending
- First live sync attempt with correct URLs (VPS proxy needs updating then retry sync-herds)
- Whether `client_secret` is required for confidential client registration
