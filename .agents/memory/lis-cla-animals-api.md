---
name: LIS CLA birth/death REST endpoints
description: Correct CLA API endpoints for sheep/goat/deer birth registration and death notification (confirmed by LIS support July 2026).
---

## The rule

LIS CLA births/deaths must use the **Animals REST API**, NOT the OData `POST /TransferRequests` endpoint that movements use.

- **Birth** → `POST /animals`
- **Death** → `PUT /animals/{identifier}` (ear tag URL-encoded in path)

**Why:** LIS CLA support confirmed (July 2026): "Births will be under registering a new Animal" and "Deaths are covered under Updating an animal." The previous code routed all movement types including birth/death through `POST /TransferRequests`, which is only correct for on/off movements.

**How to apply:** In `lis.ts`, `submitLisBirth` and `submitLisDeath` call `callLisApi` with the correct paths. The route handler at `POST /farms/:farmId/lis-submit/:movementId` branches on `submissionType`: "birth" → `submitLisBirth`, "death" → `submitLisDeath`, else → `submitLisMovement`.

## Payload structure (spec-verified against production OpenAPI spec)

### Birth — `POST /animals`

```typescript
{
  animal: { identifier: earTag, species: "sheep"|"goats"|"deer", sex: "male"|"female" },
  breed?: { code: "..." },
  birth: {
    site: { identifiers: [{ identifier: holdingCph }] },
    date: "YYYY-MM-DD",
    year: 2026,
    assistedBirthFlag: false,
    multipleBirthsFlag: false,
    embryoTransferFlag: false,
  },
  registration: {
    site: { identifiers: [{ identifier: holdingCph }] },
    date: "YYYY-MM-DD",
    category: "birthRegistration",   // ← enum value from spec
  },
}
```

### Death — `PUT /animals/{identifier}`

```typescript
{
  animal: { identifier: earTag, species: "sheep"|"goats"|"deer", sex: "male"|"female" },
  registration: {
    site: { identifiers: [{ identifier: holdingCph }] },
    date: "YYYY-MM-DD",
    category: "registration",        // ← NOT "birthRegistration"
  },
  death: {
    site: { identifiers: [{ identifier: holdingCph }] },
    date: "YYYY-MM-DD",
    reason?: { id: deathReasonUuid },
  },
}
```

PUT spec: `animal` and `registration` are **required**; `death` is optional additional info.

## Species enum (lowercase, as per CLA spec)

| LisSpecies (internal) | CLA API value |
|-----------------------|---------------|
| SHEEP | "sheep" |
| GOAT  | "goats" (plural!) |
| DEER  | "deer" |

## Multiple ear tags

Submit one API call per ear tag. The route handler uses `Promise.all(earTags.map(...))`. Returns 400 if no ear tags present on the movement record.

## CPH extraction

- Birth: `movement.toLocation ?? movement.fromLocation` (born at destination holding)
- Death: `movement.fromLocation ?? movement.toLocation` (died at origin holding)

## Live test blocker (sandbox)

The sandbox B2C tenant blocks ROPC for the CLA application (`AADSTS50105` — user not assigned). The stored refresh token also expires quickly (days, not weeks). To test, the farm must re-authenticate via the OAuth flow in the dashboard (LIS Settings → reconnect) to get a fresh token pair.
