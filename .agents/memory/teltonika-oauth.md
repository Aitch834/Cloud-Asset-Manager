---
name: Teltonika RMS OAuth integration
description: Teltonika uses OAuth 2.0 Authorization Code (not webhooks or API keys); FULLY LIVE — redirect URI corrected, TELTONIKA_CLIENT_ID and TELTONIKA_CLIENT_SECRET confirmed correct in secrets.
---

## Status: FULLY LIVE
- Redirect URI corrected to `https://api.bdefarmtrac.co.uk/api/gps/teltonika/callback` ✓
- `TELTONIKA_CLIENT_ID` and `TELTONIKA_CLIENT_SECRET` set and verified in secrets ✓

## Key facts
- Teltonika RMS uses **OAuth 2.0 Authorization Code** flow, NOT API keys or device-push webhooks
- Application type must be **Confidential** (server-side; we hold the client_secret)
- Authorization URL: `https://rms.teltonika-networks.com/account/oauth2/authorization`
- Token URL: `POST https://rms.teltonika-networks.com/account/token`
- API base: `https://rms.teltonika-networks.com/api/v1`

## Registration details
- **Redirect URI**: `https://api.bdefarmtrac.co.uk/api/gps/teltonika/callback`
- **Scopes**: `devices:read`, `device_location:read`
- **Application type**: Confidential

## Implementation files
- `artifacts/api-server/src/lib/teltonika.ts` — OAuth helpers + polling
- `artifacts/api-server/src/lib/gpsPollingJob.ts` — 5-min background job
- Routes in `artifacts/api-server/src/routes/farms.ts`: `GET /api/gps/teltonika/authorize` + `GET /api/gps/teltonika/callback`

## Token refresh
- Refresh token flow requires sending the OLD access token as `Authorization: Bearer <oldToken>` header alongside the refresh grant body
- On refresh, RMS issues a **new refresh token + access token pair** (both rotate)

## API endpoints for positions
- List devices: `GET /api/v1/devices?limit=100`
- Device location: `GET /api/v1/devices/{id}/location`
- Response shape: `{ data: { lat, lng, speed, heading, altitude, timestamp, ignition } }`

**Why:** Teltonika RMS does not offer a simple API key — all third-party integrations must go through their OAuth server to act on behalf of a user account. The confidential application type is required because the client_secret must be kept server-side.
