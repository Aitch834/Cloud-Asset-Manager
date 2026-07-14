---
name: LIS LIP Cattle credentials & integration status
description: LIP (Livestock Information Platform) confirmed as per-farm delegated OAuth — full OAuth routes built
---

## Endpoint test matrix (sandbox, updated 14 Jul 2026)

| Operation | Endpoint | Result |
|---|---|---|
| GET /animals (list) | `/animals?siteIdentifier=CPH` | ✅ Works |
| POST /animals (birth reg) | `/animals` | ✅ Works — UK442601500007 registered |
| PUT /animals (death reg) | `/animals/{id}` | ⚠️ V052 same-day sandbox restriction only; production OK |
| POST /lostfounds | `/lostfounds` | ❌ V080 "wrong species" — see note below |
| POST /movements | `/movements` (multipart) | ❌ 401 "Not authorized" — subscription not approved |
| GET /movements | `/movements?SiteIdentifier=CPH` | ✅ Works (read-only) |

### Lost & Found — V080 "Lost & Stolen Animal ID is for wrong species"
- V080 fires for both UK442601500007 and UK442601400006 — animals registered via POST /animals as cattle.
- Adding `species: "cattle"` to the payload does NOT resolve V080.
- **Most likely cause:** The `/lostfounds` endpoint in LIS LIP is scoped to sheep/goat (CLA product), not
  cattle. Cattle lost/found/stolen reports are filed through BCMS/APHA, not LIS LIP. The LIP cattle
  subscription does not include a `/lostfounds` operation.
- **Action required:** Confirm with LIS support whether cattle lost/found is a LIP endpoint at all, or
  whether it goes through a different channel (BCMS web service).
- Code in `submitLipLostFound` + `lip-lost-found` route is structurally correct; `species` field added
  (defaults to "cattle"). If LIS confirms a different endpoint or payload, adapt accordingly.

### Movement submission — 401 "Not authorized"
- HTTP 401 `{"detail":"The resource could not be returned as the requestor is not authorized"}` — distinct
  from the previous "invalid subscription key" 401s. Subscription key is accepted; the user/token does not
  have POST /movements permission.
- Read (GET /movements) continues to work, confirming token validity.
- **Action required:** LIS must approve the movement submission subscription for the cattle test account.
  No code changes needed; the moment approval comes through it will start working.

## Death submission — V052 "The Birth Date has been updated before"
- V052 fires when PUT /animals is attempted on the **same calendar day** as the original POST /animals.
- This is a LIS sandbox same-day restriction; **production impact: NONE** (deaths occur days/weeks after birth).
- **Correct production payload:** `registration.category: "registration"`, `registration.date: deathDate`,
  both `registration.site` and `death.site` using `{ type: { type: "agriculturalHolding" }, identifiers: [{ identifier: holdingCph }] }`.
  The `agriculturalHolding` type hint is REQUIRED in both sites — without it the site resolves to `" "` and
  LIS rejects the request.
- **Pre-existing sandbox animals** (UK306253* etc.) give V000d "Value cannot be null (Parameter 'source')" —
  they were not registered via POST /animals so PUT /animals doesn't work for them.
- **Death route** joins `dairyCalvingRecordsTable` to get birthDate and sex (these are NOT on mortalityTable).

## Birth submission — CONFIRMED WORKING
- UK442601600001 (male AA) — registered Test 3a
- UK442601400006 (female AA) — registered Test 3b
- UK442601500007 (female AA, born 2026-07-13, calving ID=4) — registered 14 Jul 2026
- POST /animals endpoint works. Category "birthRegistration", site without type hint.

## Credentials & auth
- **Root cause of the original 401:** `LIS_LIP_SUBSCRIPTION_KEY` (primary) is rejected; `LIS_LIP_SUBSCRIPTION_KEY_2` (secondary) is live. `callLipApi` auto-retries with secondary.
- **Interactive sign-in CONFIRMED WORKING** — farm 1 connected, token stored in `lip_farm_tokens`.
- ROPC/username-password NOT supported — always use interactive sign-in popup.
- Token expires ~1 hour after sign-in; route auto-refreshes via `refreshLipToken` if expired.
- Redirect URI `https://api.bdefarmtrac.co.uk/api/lip/callback` must be registered in LIP developer portal.

## Confirmed portal values (LIP Developer Portal "Additional Credentials", June 2026)
- **api-url**: `https://sandbox.movement.api.livestockinformation.org.uk/lis-public-sdbx/v1.0`
- **b2c-authority**: `https://livestockinformationb2cprod.b2clogin.com/tfp/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_THIRDPARTY_SIGNIN/v2.0`
- Real authorize endpoint: `https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/b2c_1a_thirdparty_signin/oauth2/v2.0/authorize`

## Architecture
- Grant type: **authorization_code** (per-farm delegated OAuth)
- Access + refresh tokens stored per farm in `lip_farm_tokens`

## Secrets in use
- LIS_LIP_CLIENT_ID, LIS_LIP_PRIMARY_SECRET, LIS_LIP_SECONDARY_SECRET
- LIS_LIP_SUBSCRIPTION_KEY, LIS_LIP_SUBSCRIPTION_KEY_2
