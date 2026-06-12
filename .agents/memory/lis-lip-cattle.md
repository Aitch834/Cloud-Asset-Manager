---
name: LIS LIP Cattle credentials & integration status
description: LIS Livestock Information Platform (LIP) cattle API credentials, endpoint details, and current status
---

## What LIP is

LIP (Livestock Information Platform) is the NEW platform for cattle/bison/buffalo.
It is entirely separate from CLA (the sheep/goat/deer platform):
- Different developer portal: `developer.service.livestockinformation.org.uk` (vs `developers.livestockinformation.org.uk`)
- Different authentication tenant and flow
- Different base URL, different headers (`LI-Request-Mode`, `LI-Correlation-Id`)
- Different data model (batches, breed codes, productionType, movement confirmation step)

## Configured secrets (Replit)

- `LIS_LIP_CLIENT_ID` — BDE Farm Trac application client ID on LIP portal
- `LIS_LIP_PRIMARY_SECRET` — primary client secret
- `LIS_LIP_SECONDARY_SECRET` — secondary client secret (rotation fallback)

## Configured env vars (Replit, shared)

- `LIS_LIP_REDIRECT_URL` = `https://api.bdefarmtrac.co.uk/api/lis/callback`
- `LIS_LIP_API_BASE` = `https://api.service.livestockinformation.org.uk`

## Subscription keys (June 2026)

- `LIS_LIP_SUBSCRIPTION_KEY` — **received & saved** — LIS API - Sandbox - v1.0 (movements + animal registration)
- `LIS_LIP_MYLIS_SUBSCRIPTION_KEY` — **received & saved** — My LivestockInformation API - Sandbox - v1.0 (keeper/holding data, CPH lookups)
- `LIS_LIP_LUIS_SUBSCRIPTION_KEY` — **pending** — LUIS API Sandbox - v2.0 (ear tag ID issuance/validation)

## LIP API endpoints (Alpha — subject to change)

Base: `https://api.service.livestockinformation.org.uk` (to confirm from portal once keys arrive)

| Endpoint | Purpose |
|---|---|
| `POST /animals` | Register animal (birth or import) — sync or async |
| `PUT /animals` | Update animal record |
| `GET /animals` | List animals on holding |
| `GET /animals/{identifier}` | Get single animal |
| `POST /animals/lost` | Report lost/stolen |
| `GET /breeds` | Breed codes reference data |
| `GET /deathreasons` | Death reasons reference data |
| `POST /movements` | Submit movement — sync or async |
| `PUT /movements` | Update movement |
| `DELETE /movements` | Delete movement |
| `GET /movements/{id}` | Retrieve movement |
| `POST /movements/confirm` | Confirm received movement (required step) |
| `GET /movements/rejectionreasons` | Rejection reasons reference data |
| `GET /requeststatus/{requestId}` | Poll async operation result |

## Key data model differences vs CLA sheep

- **Breed**: code (e.g. `DEX`) not free text — needs `GET /breeds` lookup table
- **Movement batches**: animals grouped in `batches` array by species
- **Movement time**: `time` field required (HH:MMZ) in addition to date
- **Haulier type**: `departure | arrival | haulier`
- **Vehicle reg**: explicit `vehicleRegistrationNumber` field
- **productionType**: `meat | dairy | beef` on animal registration
- **identificationDate**: when animal was tagged (separate from DOB)
- **Birth flags**: `assistedBirthFlag`, `multipleBirthsFlag`
- **Parent IDs**: `sire`, `birthDam`, `geneticDam` identifiers
- **TSE flag**: `tseTestRequiredFlag` on death records
- **Movement confirmation**: `POST /movements/confirm` explicit step required
- **Sex field**: case-sensitive — must be `"male"` or `"female"` exactly

## Schema additions needed (plan for LIS Cattle integration build)

On `livestockAnimalsTable`: `productionType`, `breedCode`, `identificationDate`,
`assistedBirth`, `multipleBirth`, `sireEarTag`, `birthDamEarTag`, `geneticDamEarTag`,
`hasEid`, `tseTestRequired`, `carcassCollectionCph`, `lipAnimalId`,
`lipSyncStatus`, `lipLastSyncAt`, `lipRequestId`

On `livestockMovementsTable`: `departureTime`, `arrivalTime`, `haulierVehicleReg`,
`haulierType`, `lipMovementId`, `lipMovementStatus`, `lipMovementRequestId`

New: `breedCodesTable` (seeded from `GET /breeds`) — code, name, species

## Build sequencing

Do NOT start LIP cattle integration code until:
1. CLA sheep sync blocker (AADSTS50105) resolved with LIS support
2. LIP subscription keys received and confirmed working in sandbox
3. Full retest required before cattle go-live (summer 2026)

## Known LIP issues (from their portal, June 2026)

- Delayed sync: records may not be immediately retrievable after POST — occasional 500s; need retry logic
- Sex field case-sensitive: `"male"` / `"female"` only
- Incomplete error messaging: some errors return generic codes without field detail
- Movement review not yet available in alpha (fixed Apr 2026 per their release notes)
