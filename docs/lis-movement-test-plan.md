# LIS Movement End-to-End Test Plan

This document covers the step-by-step tests required to prove that livestock movement
submissions work end-to-end via the BDE Farm Trac → UK Proxy → LIS CLA API pipeline.

---

## Environment setup checklist

Before running any test, verify:

| Check | Where |
|-------|-------|
| `LIS_USE_SANDBOX_API=true` is set | Replit Secrets |
| `LIS_PROXY_URL` points to DigitalOcean London VPS | Replit Secrets |
| `LIS_PROXY_SECRET` matches proxy `.env` | Replit Secrets / VPS |
| `LIS_SUBSCRIPTION_KEY` is set | Replit Secrets |
| `LIS_B2C_CLIENT_ID` = `91afad18-e537-48bb-840b-06f4fa943ac6` | Replit Secrets |
| VPS proxy is running | SSH: `pm2 status` on VPS |
| API server is running | Test dashboard dev tools / workflow logs |

---

## Sandbox test accounts

Two sandbox CPH holders are provisioned specifically for BDE testing.
Passwords are in `attached_assets/testData_1781087138915.json`.

| Account | Username | Producer CPH |
|---------|----------|-------------|
| User 1 | bdefarmtrac-testcphholder1@livestockinformationb2cprod.onmicrosoft.com | 01/100/0257 |
| User 2 | bdefarmtrac-testcphholder2@livestockinformationb2cprod.onmicrosoft.com | 01/100/0264 |

### User 1 herds at CPH 01/100/0257

| Herd ref | Species | Ear tag range |
|----------|---------|---------------|
| 130181 | Sheep | UK013018100001–UK013018100025 |
| 130182 | Sheep | UK013018200001–UK013018200025 |
| 130183 | Goat | UK013018300001–UK013018300025 |
| 130184 | Goat | UK013018400001–UK013018400025 |
| 130185 | Deer | No individual tags (use count) |

### User 2 herds at CPH 01/100/0264

| Herd ref | Species | Ear tag range |
|----------|---------|---------------|
| 130186 | Sheep | UK013018600001–UK013018600025 |
| 130187 | Sheep | UK013018700001–UK013018700025 |
| 130188 | Goat | UK013018800001–UK013018800025 |
| 130189 | Goat | UK013018900001–UK013018900025 |
| 130190 | Deer | No individual tags (use count) |

---

## Phase 1 — Authentication & credential storage

### T1.1 — Credential connection test

1. Log in to test dashboard as a farm user who has LIS credentials stored
2. Go to **Farm Settings → LIS tab**
3. Enter User 1's username and password
4. Click **Test Connection**
5. ✅ **Expected:** Green "Connected to LIS" status
6. ❌ **Failure modes:** "Auth failed" → check token URL in proxy; "Network error" → check proxy is running

### T1.2 — Credentials persist across page reload

1. After T1.1 passes, reload the page
2. Go back to Farm Settings → LIS tab
3. ✅ **Expected:** Credentials still show as saved (password field shows `••••••••`)
4. ✅ **Expected:** Test Connection still passes without re-entering password

### T1.3 — Second farm account (User 2 credentials)

1. If your test setup has a second farm, add User 2's credentials to that farm
2. Run Test Connection for User 2
3. ✅ **Expected:** Connected status for CPH 01/100/0264

---

## Phase 2 — Herd & tag data retrieval from LIS

### T2.1 — Fetch herds from LIS

1. From the LIS settings page (or wherever herd sync is triggered), request herd list for User 1
2. ✅ **Expected:** 5 herds returned: 130181, 130182 (sheep), 130183, 130184 (goat), 130185 (deer)
3. Check herd species are correctly mapped

### T2.2 — Fetch animal tags for a sheep herd

1. Request tags for herd 130181
2. ✅ **Expected:** 25 sheep tags returned (UK013018100001–UK013018100025)
3. Check tag format is preserved exactly (no truncation)

### T2.3 — Fetch tags for deer herd (no individual tags)

1. Request tags for herd 130185 (deer)
2. ✅ **Expected:** Empty tag list or batch-only response — no error

---

## Phase 3 — Off-movement submission (animals leaving your holding)

This is the most important test. A movement OFF records animals leaving CPH 01/100/0257
and arriving at a destination CPH.

### T3.1 — Move sheep to another producer holding (farm-to-farm)

1. Log in to test dashboard with User 1's LIS credentials linked
2. Navigate to **Livestock → Movements** (or equivalent page)
3. Create a new **off movement**:
   - Species: Sheep
   - From CPH: 01/100/0257
   - To CPH: 01/100/0264 (User 2's producer holding)
   - Animals: select 3 tags from herd 130181 (e.g. UK013018100001, UK013018100002, UK013018100003)
   - Movement date: today
4. Submit to LIS
5. ✅ **Expected:** Movement reference number returned from LIS CLA API
6. ✅ **Expected:** Movement saved to local database with LIS reference
7. ❌ **If 401/403:** Token doesn't carry CLA API permissions → contact LIS support for correct resource scope
8. ❌ **If 422:** Request body format mismatch → check CLA API docs for field names

### T3.2 — Move sheep to abattoir

1. Create an off movement:
   - Species: Sheep
   - From CPH: 01/100/0257
   - To CPH: 01/100/0253 (User 1's abattoir, MHS code 0035)
   - Animals: 2 tags from herd 130182
   - Movement date: today
2. ✅ **Expected:** LIS reference returned
3. Check MHS code is included in request payload (required for abattoir movements)

### T3.3 — Move goats to assembly centre

1. Create an off movement:
   - Species: Goat
   - From CPH: 01/100/0257
   - To CPH: 01/100/0254 (assembly centre)
   - Animals: 5 tags from herd 130183
2. ✅ **Expected:** LIS reference returned

### T3.4 — Move deer (count-based, no ear tags)

1. Create an off movement:
   - Species: Deer
   - From CPH: 01/100/0257
   - To CPH: 01/100/0264
   - Animals: count = 3 (herd 130185, no individual tags)
2. ✅ **Expected:** LIS accepts count-based deer movement without tag validation error

---

## Phase 4 — On-movement submission (animals arriving at your holding)

### T4.1 — Receive sheep from another producer

1. Log in as User 2 (CPH 01/100/0264)
2. Create a new **on movement**:
   - Species: Sheep
   - From CPH: 01/100/0257
   - Animals: 3 tags (same tags sent in T3.1 above)
   - Arrival date: today
3. ✅ **Expected:** LIS records the arrival and returns confirmation
4. ✅ **Expected:** Animals now appear against User 2's CPH in LIS

---

## Phase 5 — Error handling & edge cases

### T5.1 — Wrong species on tag

1. Attempt to move a sheep tag (from herd 130181) but mark species as Goat
2. ✅ **Expected:** LIS returns a validation error
3. ✅ **Expected:** App shows a clear, human-readable error message (not a raw 422 dump)

### T5.2 — Duplicate movement (same tags, same date)

1. Attempt to resubmit the same movement as T3.1
2. ✅ **Expected:** LIS rejects it (duplicate) or app prevents re-submission

### T5.3 — Proxy failure recovery

1. Temporarily stop the VPS proxy (`pm2 stop lis-proxy`)
2. Attempt a movement submission from the dashboard
3. ✅ **Expected:** Clear error message ("LIS connection unavailable" or similar)
4. ✅ **Expected:** Movement is NOT saved to local DB as "submitted" (only as "pending/failed")
5. Restart proxy (`pm2 start lis-proxy`) and retry
6. ✅ **Expected:** Submission succeeds on retry

### T5.4 — Expired token handling

1. Wait for the LIS Bearer token to expire (tokens are typically 1 hour)
2. Attempt a movement submission without refreshing credentials
3. ✅ **Expected:** App automatically re-authenticates and retries the call
4. ✅ **Expected:** No visible error to the user

---

## Phase 6 — Local record keeping

### T6.1 — Movement appears in local movement history

1. After T3.1 passes, go to the Movements list in the dashboard
2. ✅ **Expected:** Movement record shows:
   - LIS reference number
   - Date, species, number of animals
   - From / To CPH
   - Status: "Submitted to LIS"

### T6.2 — Movement PDF / print

1. Open a submitted movement record
2. ✅ **Expected:** Can generate a movement document / haulier certificate showing the LIS reference

---

## Notes on token scope (pending LIS support confirmation)

The Bearer token we currently receive uses scope `openid profile offline_access`.
This is an identity token only. The CLA API may require a token with a specific
**resource scope** to authorise movement submissions.

If Phase 3 tests return **401 Unauthorized** from the CLA API, the fix is:
1. Contact LIS support and ask: *"What resource or scope should be requested
   in the ROPC grant to call the CLA movement submission endpoints?"*
2. Update the scope in `lis-proxy/index.js` and `artifacts/api-server/src/lib/lis.ts`

This is the most likely blocker between "Connected" and actually submitting movements.

---

*Last updated: June 2026. Sandbox environment: `api.sandbox.cla.livestockinformation.org.uk`*
