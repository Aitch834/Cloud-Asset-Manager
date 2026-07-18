---
name: AGCO Connect integration
description: OAuth 2.0 via Okta (id.agconet.com); credentials in POST body (not Basic Auth); machine location in nested variants; register via PTx Trimble Partner Portal (developer.trimble.com).
---

## Registration — PTx Trimble Partner Portal
- Apply at **https://developer.trimble.com** (NOT a standalone AGCO developer programme)
- AGCO's AgCommand / AGCO Connect telematics API is managed via AGCO's partnership with PTx Trimble
- Redirect URI to register: `https://api.bdefarmtrac.co.uk/api/gps/agco/callback`
- Approval typically takes 2–4 weeks (similar to John Deere process)

## Auth server
- Authorization: `https://id.agconet.com/oauth2/ausde7tkyIXBBuaLb357/v1/authorize`
- Token: `https://id.agconet.com/oauth2/ausde7tkyIXBBuaLb357/v1/token`
- Scopes: `openid offline_access`
- Token exchange: `client_id` + `client_secret` sent in **POST body** (NOT Basic Auth — differs from John Deere)

## API
- Base: `https://api.agconet.com/v1`
- `GET /organizations` → list orgs (response: array or `{ items }` or `{ value }`)
- `GET /organizations/{orgId}/machines` → machines with telemetry
- Position nested in: `machine.location` OR `machine.lastKnownLocation` OR `machine.telemetry.location` — `extractLocation()` in agco.ts handles all three
- Covers AGCO brands: Massey Ferguson, Fendt, Valtra, Challenger

## Env vars (pending — add once Trimble portal approval received)
- `AGCO_CLIENT_ID`
- `AGCO_CLIENT_SECRET`

## Implementation files (already written, waiting for credentials)
- `artifacts/api-server/src/lib/agco.ts` — OAuth helpers + polling
- `artifacts/api-server/src/lib/gpsPollingJob.ts` — 5-min background job (shared)
- Routes in `artifacts/api-server/src/routes/farms.ts`: `GET /api/gps/agco/authorize` + `/callback`

**Why multiple location fallbacks:** AGCO API documentation is sparse and varies by machine type / firmware; `extractLocation()` tries all known shapes rather than failing on shape mismatch.
