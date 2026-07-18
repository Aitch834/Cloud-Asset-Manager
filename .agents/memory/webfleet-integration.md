---
name: Webfleet.connect integration
description: Webfleet uses credential-based auth (NOT OAuth); per-farm creds stored as encrypted JSON; app-level API key from developer.webfleet.com registration.
---

## Key facts
- Webfleet.connect API is **NOT OAuth** — uses account/username/password + API key auth
- API endpoint: `GET https://csv.webfleet.com/extern?action=showVehicleReport&...`
- Response: JSON array of vehicle objects (direct, no `values` wrapper)

## Credential model
- **No app-level env var or developer.webfleet.com registration required**
- Per-farm: `{ account, username, password, apiKey }` stored as `encryptCredential(JSON.stringify(...))` in `api_key_encrypted` column
- `apiKey` is the farmer's OWN Webfleet API key — found in their Webfleet dashboard under Tools → Webfleet Integration → API key

## Registration
- None required from BDE. Farmers provide all 4 credentials themselves in Farm Settings → GPS card.
- Requires farmer's Webfleet subscription to have API access enabled (they contact their Webfleet account manager if not)

## API response shape
```json
[
  { "objectno": "id", "objectname": "Vehicle", "latitude": 51.5, "longitude": -1.2, "speed": 50, "course": 180, "altitude": 100, "posdatetime": "2026-01-01T12:00:00Z" }
]
```
Note: coordinates are decimal degrees in JSON output mode. Error response: `{ "errorCode": 1143, "errorMsg": "API key is invalid" }` (not an array).

## Implementation files
- `artifacts/api-server/src/lib/webfleet.ts` — polling + credential parsing
- `artifacts/api-server/src/lib/gpsPollingJob.ts` — 5-min job (shared with Teltonika, JD)
- Route in `artifacts/api-server/src/routes/farms.ts`: `PUT /farms/:farmId/gps-integrations/webfleet/credentials`
- `artifacts/dashboard/src/pages/FarmSettings.tsx` — new `type: "credentials"` UI with 3-field form

**Why not OAuth:** Webfleet.connect is a legacy REST API that predates OAuth; it uses direct credential auth. Their newer REST API may support OAuth but has limited partner access. The credential approach works for all Webfleet subscription tiers with API access enabled.
