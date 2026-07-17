---
name: John Deere Operations Center OAuth
description: JD uses Basic Auth for token exchange (not body params); poll chain is orgs→machines→breadcrumbs; credentials pending manual JD approval.
---

## Key facts
- John Deere Operations Center uses **OAuth 2.0 Authorization Code** (confidential client)
- **Token exchange uses HTTP Basic Auth** — client_id:client_secret as `Authorization: Basic base64(...)` header, NOT sent in the request body.
- **Auth server**: `https://johndeerecustomer.okta.com/oauth2/default/v1` — NOT `signin.johndeere.com` which is JD's employee SSO and rejects custom scopes
- Authorization URL: `https://johndeerecustomer.okta.com/oauth2/default/v1/authorize`
- Token URL: `https://johndeerecustomer.okta.com/oauth2/default/v1/token`
- API base: `https://partnerapi.deere.com/platforms`
- Accept header required: `application/vnd.deere.axiom.v3+json`

## Registration details
- **Redirect URI**: `https://api.bdefarmtrac.co.uk/api/gps/john_deere/callback`
- **Scopes**: `openid offline_access` — JD controls API access at client-ID approval level (developer.deere.com), NOT via OAuth scope strings. `ag1`/`eq1` are NOT valid scope names.
- **APIs approved**: Precision Tech → Operations Center - Machine Locations + Operations Center - Organizations (both Approved in developer.deere.com)
- **Status**: APPROVED — app is live in developer.deere.com

## Env vars required (add when JD approval arrives)
- `JD_CLIENT_ID`
- `JD_CLIENT_SECRET`

## Poll chain
1. `GET /platforms/organizations` → list organisations the user has in Operations Center
2. For each org: `GET /platforms/organizations/{orgId}/machines` → list machines
3. For each machine: `GET /platforms/machines/{machineId}/breadcrumbs` → most recent position (values[0])
4. Response shape: `{ values: [{ point: { lat, lon }, timestamp, speed, heading, altitude }] }`

## Implementation files
- `artifacts/api-server/src/lib/john_deere.ts` — OAuth helpers + polling
- `artifacts/api-server/src/lib/gpsPollingJob.ts` — 5-min job (shared with Teltonika)
- Routes in `artifacts/api-server/src/routes/farms.ts`: `GET /api/gps/john_deere/authorize` + `/callback`
- `artifacts/dashboard/src/pages/FarmSettings.tsx` — oauth_active UI is now provider-agnostic

**Why Basic Auth for token exchange:** JD's token endpoint follows RFC 6749 §2.3.1 (client credentials in Authorization header) rather than the body-params variant. Sending credentials in the body returns a 401.
