---
name: AGCO Connect integration
description: OAuth 2.0 via Okta (id.agconet.com); credentials in POST body (not Basic Auth); machine location in nested variants; awaiting AGCO developer programme credentials.
---

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

## Env vars (pending)
- `AGCO_CLIENT_ID`
- `AGCO_CLIENT_SECRET`
- Redirect URI to register: `https://api.bdefarmtrac.co.uk/api/gps/agco/callback`

## Registration
- AGCO Connect developer programme (formal application, similar to JD)
- Approval typically takes 2–4 weeks

**Why multiple location fallbacks:** AGCO API documentation is sparse and varies by machine type / firmware; `extractLocation()` tries all known shapes rather than failing on shape mismatch.
