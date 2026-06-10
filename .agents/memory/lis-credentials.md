---
name: LIS credentials & integration status
description: LIS CLA API secrets configured in Replit, Azure B2C client ID, and what's pending from LIS support
---

## Configured secrets (Replit)
- `LIS_SUBSCRIPTION_KEY` — BDE vendor platform key (Ocp-Apim-Subscription-Key header)
- `LIS_B2C_CLIENT_ID` — `91afad18-e537-48bb-840b-06f4fa943ac6` (Beta Sandbox environment)
- `CREDENTIAL_ENCRYPTION_KEY` — AES-256-GCM key for encrypting stored LIS/BCMS passwords; required for the PUT /farms/:farmId/lis-credentials route to succeed

## Integration mode
- `isLisSandboxMode()` returns `false` when `LIS_SUBSCRIPTION_KEY` is set
- Code in `artifacts/api-server/src/lib/lis.ts`
- Azure B2C ROPC flow: `B2C_1_ROPC_Auth` policy on `livestockinformation.b2clogin.com`
- Scope: `https://livestockinformation.onmicrosoft.com/api/user_impersonation openid profile offline_access`

## Pending from LIS support
- Whether a `client_secret` is required (confidential vs public client registration)
- If yes: add `LIS_B2C_CLIENT_SECRET` secret and include in token POST body

**Why:** ROPC public clients don't need a secret; confidential clients do. LIS support will confirm.
