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

## LIS LIP Known Issues (from portal, 14 Jul 2026)
Source: LIS LIP Developer Portal "Known Issues" table.

| Issue | Status | Notes |
|---|---|---|
| Animal Lost/Found Data Issue | Planned (TBC) | Users cannot record an animal as lost or found via API — confirms V080 is a platform bug, not our payload |
| Delayed Synchronization of Newly Submitted Data | Released Jan 2026 | Animal records created/updated via API may not be immediately available; can cause HTTP 500 errors |
| Incomplete Error Messaging | Planned (TBC) | Some API responses return generic HTTP status codes without sufficient detail |
| Movement Review Capability | Released Apr 2026 | Previously submitted livestock movements not reviewable via API |
| Data Issues — sex field format | Released Jan 2026 | Sex in test data is 'M'/'F'; registration **requires** 'male'/'female' (case-sensitive). **Our code is compliant** — DB stores 'male'/'female', passed directly to LIP payload. |

### Lost/Found — confirmed platform bug
V080 "Lost & Stolen Animal ID is for wrong species" is a known LIS platform bug (not a species subscription
boundary, not a payload issue). The `/lostfounds` endpoint is broken for ALL species in the current
sandbox. Status: Planned fix, no release date. No code changes needed on our side.

## LIS LIP Planned Improvements (from portal, 14 Jul 2026)
All status: Planned, TBC.

| Enhancement | Description | Impact on our code |
|---|---|---|
| Dedicated /holdings Endpoint | List of all holdings registered to the authenticated user's account | Useful future addition: auto-populate CPH list for farm setup instead of manual entry |
| Holding Number Lookup Service | Returns full name & address for a given CPH number | Useful for validating/auto-filling movement destination details |
| Simplified Animal Death Reporting | Required attributes for death notifications will be reduced and streamlined | **Watch this:** our death payload is complex (registration block, agriculturalHolding type hints, matching siteIds). Once released, the payload may simplify significantly — revisit |
| Support for Still Birth / Untagged Death Reporting | Record still births or untagged deaths during animal registration | Currently our birth route requires calfEarTag; once live, perinatal/untagged deaths become possible without a tag |

## LIS LIP Documentation Updates (from portal, 14 Jul 2026)
All status: Planned, TBC.

| Area | Description |
|---|---|
| JSON Examples & Field Explanations | Clearer examples for births, deaths, movements — focusing on **minimal required** fields |
| Reference Data Documentation | Full enum documentation (breeds, species, etc.) |

**Note on JSON Examples:** Once released, verify our birth/death/movement payloads against the documented
minimal field set — our current death payload may be over-specified (we worked it out empirically).
