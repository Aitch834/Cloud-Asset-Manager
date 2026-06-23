---
name: LIS credentials & integration status
description: LIS CLA API secrets, confirmed working auth endpoint, and current blocker
---

## Configured secrets (Replit)
- `LIS_SUBSCRIPTION_KEY` — BDE vendor platform key (Ocp-Apim-Subscription-Key header)
- `LIS_B2C_CLIENT_ID` — `91afad18-e537-48bb-840b-06f4fa943ac6` (Beta Sandbox environment)
- `CREDENTIAL_ENCRYPTION_KEY` — AES-256-GCM key for encrypting stored LIS/BCMS passwords
- `LIS_PROXY_URL` — URL of the UK VPS proxy (e.g. http://<IP>:3001)
- `LIS_PROXY_SECRET` — shared secret sent in X-Proxy-Secret header to the proxy

## Confirmed working auth (June 2026)

**Token URL (sandbox):**
`https://login.microsoftonline.com/livestockinformationb2cprod.onmicrosoft.com/oauth2/v2.0/token`

**Token URL (production):**
`https://login.microsoftonline.com/livestockinformation.onmicrosoft.com/oauth2/v2.0/token`

**Scope (sandbox):**
`https://livestockinformationb2cprod.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access`

**Scope (production):**
`https://livestockinformation.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access`

**Why NOT b2clogin.com / B2C_1A_SIGNIN:**
`B2C_1A_SIGNIN` is an interactive-only policy. ROPC (grant_type=password) against it returns
`AADB2C90057` ("application not configured for implicit flow"). Standard AAD v2 endpoint works.

**Do NOT include `openid` in scope** — triggers implicit flow error on B2C policies.

## CLA API gateway (confirmed from LIS Developer Hub, June 2026)

- **Sandbox:** `https://ext-cla.api.livestockinformation.org.uk/v1.0`
- **Production:** `https://cla.api.livestockinformation.org.uk/v1.0`
- `/v1.0` is part of the base URL — do NOT add `/v1/` to resource paths
- Domain resolves from UK VPS ✓, returns HTTP 404 on root path ✓ (APIM gateway live)

## APIM CLA Ext application

- App name: **APIM CLA Ext**
- App ID: `77f8ff53-0866-4598-98b3-2ec6ca15ae9b`
- This is the Azure AD app that protects the CLA API

## Root cause of AADSTS50105 — RESOLVED (June 2026)

LIS support confirmed: client secrets were never generated for the app registration
`91afad18-e537-48bb-840b-06f4fa943ac6` on their end. Without secrets, the app was treated
as a public client — Azure AD then requires direct user assignment to the app, which wasn't done.

LIS support is sending primary and secondary client secrets by separate email.

**Status (June 2026): RESOLVED in code**
- Replit Secrets: `LIS_B2C_PRIMARY_SECRET` and `LIS_B2C_SECONDARY_SECRET` added by user
- `artifacts/api-server/src/lib/lis.ts` reads `LIS_B2C_PRIMARY_SECRET` as `LIS_B2C_CLIENT_SECRET`
  and appends `client_secret` to the URLSearchParams in both ROPC and refresh token requests
- `lis-proxy/index.js` reads `LIS_B2C_CLIENT_SECRET` from its own `.env` and appends to both token requests

**One remaining manual step — VPS proxy:**
SSH into the VPS and add the primary secret to the proxy `.env`, then restart:
```
echo "LIS_B2C_CLIENT_SECRET=<primary_secret>" >> /opt/lis-proxy/lis-proxy/.env
pm2 restart lis-proxy
```
After that, test via Dashboard → Farm Settings → LIS → Test Connection.

## UK Proxy
- Deployed on DigitalOcean London (LON1) VPS at port 3001, pm2 process `lis-proxy`
- No git repo on VPS — update by pasting full `index.js` content via heredoc then `pm2 restart lis-proxy`
- When `LIS_PROXY_URL` is set in Replit Secrets, all LIS calls route through it
- Proxy setup guide: `docs/lis-proxy-setup.md`
