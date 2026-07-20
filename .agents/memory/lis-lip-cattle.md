---
name: LIS LIP Cattle credentials & integration status
description: LIP (Livestock Information Platform) OAuth integration — PAUSED 21 Jul 2026; service status, credentials, and technical notes
---

## Current Status — SERVICE PAUSED (effective 21 July 2026)

LIS confirmed via official email (20 July 2026, addressed to both generic ETM list and Haydn) that the LIP Cattle API Alpha Developer Hub goes dark 21 July 2026. All ETMs instructed to pause development. Defra takes over cattle traceability communications going forward. Further guidance expected September/October 2026. BEID mandate target Q1 2027.

**CLA/Sheep/Goat/Deer API — continues unaffected.**

## Platform changes applied on pause (20 July 2026)

- `FarmSettings.tsx` — LIP section: badge changed from "Alpha" → "Paused" (amber); service notice banner added; sign-in button disabled (grayed, `disabled` prop); description updated
- `Movements.tsx` — LIP submit button on movement rows replaced with a grayed "LIP Paused" `<span>` badge with tooltip; LIP Submissions tab shows amber service notice banner; "not connected" and empty-state messages updated to direct to BCMS; status badge in tab header changed to amber "Service paused"
- `defaultHelpArticles.ts` — LIP article prefixed with amber notice div
- `HelpCentre.tsx` (dashboard) — submission route steps updated to note LIP pause and direct to BCMS
- `Features.tsx`, `Pricing.tsx`, `RegisterInterest.tsx` — LIP cattle bullet/note updated to "temporarily paused"

## Endpoint test matrix (sandbox — as of 14 Jul 2026, now dark)

| Operation | Endpoint | Result |
|---|---|---|
| GET /animals (list) | `/animals?siteIdentifier=CPH` | ✅ Was working |
| POST /animals (birth reg) | `/animals` | ✅ Was working |
| PUT /animals (death reg) | `/animals/{id}` | ⚠️ V052 same-day sandbox restriction only |
| POST /lostfounds | `/lostfounds` | ❌ V080 "wrong species" — known platform bug |
| POST /movements | `/movements` (multipart) | ❌ 401 — subscription not approved before pause |
| GET /movements | `/movements?SiteIdentifier=CPH` | ✅ Was working (read-only) |

## Credentials & auth (for when service resumes)

- `LIS_LIP_CLIENT_ID` — Alpha sandbox client ID
- `LIS_LIP_PRIMARY_SECRET` / `LIS_LIP_SECONDARY_SECRET` — APIM keys (secondary is live one; auto-fallback implemented in `callLipApi`)
- `LIS_LIP_MYLIS_SUBSCRIPTION_KEY` / `LIS_LIP_MYLIS_SUBSCRIPTION_KEY_2` — MyLIS sub keys
- `LIS_LIP_REDIRECT_URI` — OAuth callback URI
- Grant type: **authorization_code** (per-farm delegated OAuth); tokens stored per farm in `lip_farm_tokens`
- OAuth state is HMAC-SHA256 signed (not DB-stored); use `createHmac`/`timingSafeEqual` from `"crypto"` import, NOT global crypto
- ROPC/username-password NOT supported — always use interactive sign-in popup

## Technical notes (for when service resumes)

- `callLipApi` / `submitLipMovement` / `submitLipBirth` / `submitLipDeath` in `lip.ts`
- 4 routes in `farms.ts`; `lip_submissions` table in DB
- Death payload: `registration.category: "registration"`, both site blocks need `type: { type: "agriculturalHolding" }` — required or LIS rejects
- Lost & Found V080 is a known LIS platform bug (not species subscription boundary); no code change needed when it's fixed
- Movement submission was pending subscription approval — confirm with new Defra service when available
- POST /births confirmed working: category "birthRegistration", site without type hint

## Confirmed portal values (LIP Developer Portal, June 2026 — now dark)

- **api-url**: `https://sandbox.movement.api.livestockinformation.org.uk/lis-public-sdbx/v1.0`
- **b2c-authority**: `https://livestockinformationb2cprod.b2clogin.com/tfp/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_THIRDPARTY_SIGNIN/v2.0`

**Why:** LIS email 20 July 2026 — ETMs instructed to halt development until Defra publishes new service specification and timeline.
