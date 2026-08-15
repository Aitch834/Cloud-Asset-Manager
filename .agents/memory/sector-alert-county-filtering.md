---
name: Sector alert system — county filtering
description: Architecture of the 4-sector platform alert system with geographic county filtering and audit history.
---

## Platform config key pattern (5 keys per sector)
Each sector has: `{sector}.alert_active`, `{sector}.alert_level`, `{sector}.alert_message`, `{sector}.alert_date`, `{sector}.alert_counties`.
Sectors: `hpai`, `arable`, `horticulture`, `viticulture`.
All 20 keys are in `PLATFORM_CONFIG_DEFAULTS` in `admin.ts`.

## Public alert endpoints
- `GET /api/hpai-alert` — poultry
- `GET /api/arable-alert` — arable
- `GET /api/horticulture-alert` — horticulture / fresh produce
- `GET /api/viticulture-alert` — viticulture

All accept `?farmId=N` query param. The `resolveFarmCounty(farmId)` helper looks up `farms.county` and passes it to `alertAppliesForCounty()`.

**Fail-open rule:** empty alert_counties list = national (show to all); farm with no county set = show alert.

## Dashboard usage
Each sector page passes `?farmId=${farmId}` to its alert endpoint. queryKey includes farmId so it refetches per farm.
- PoultryProductionPage → `/api/hpai-alert?farmId=X`
- OrganicArablePage → `/api/arable-alert?farmId=X`
- FreshProducePage → `/api/horticulture-alert?farmId=X`
- viticulture/ViticulturePage → `/api/viticulture-alert?farmId=X`

## Farm county field
`county text` column on `farmsTable`, added via `farmCoreMigrations.ts` (ADD COLUMN IF NOT EXISTS). Editable in FarmSettings address card with a hint about its purpose.

## Audit logging
PUT/DELETE on any `hpai.*`, `arable.*`, `horticulture.*`, or `viticulture.*` config key writes action `sector_alert_change` with `{ sector, key, oldValue, newValue }` metadata. Legacy `hpai_config_change` entries are still recognised by the history endpoint.

## Admin portal history
- `GET /admin/hpai-alert-history` — legacy route, now returns HPAI-sector entries only (still used by old clients)
- `GET /admin/sector-alert-history` — all sectors; accepts `?sector=hpai|arable|horticulture|viticulture`
- `HpaiAlertLog.tsx` — now "Sector Alert Log", sector filter tabs, calls `getSectorAlertHistory`

**Why:** DEFRA/APHA alerts are regional, not always national. County filtering prevents off-area farms seeing irrelevant alert banners while keeping fail-open for farms that haven't set their county yet.
