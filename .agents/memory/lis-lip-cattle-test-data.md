---
name: LIS LIP Cattle test data
description: Cattle Beta Sandbox test accounts, CPHs, and tag ranges — provided 3 Jul 2026, ready for use once LIP subscription approval completes
---

## Status
User HAS provided cattle test data (unlike sheep/goat which was provided earlier). Saved in
`attached_assets/CattleTestData_1783115572474.json` — do not paste the password here.

## Test accounts (2 users, Party13, role Keeper — LIS Production Sandbox, not the same tenant as the sheep/goat Beta Sandbox)
- User 1: lisprodsandboxuser25-prod01-li@Livestockinformationb2cprod.onmicrosoft.com
- User 2: lisprodsandboxuser26-prod01-li@Livestockinformationb2cprod.onmicrosoft.com

Passwords are in the JSON file above — do not paste here.

## Holdings (CPHs) — per user, both users have identical structure
| CPH | Site type | Tags |
|-----|-----------|------|
| 44/0NN/0001 | agriculturalHolding | ~250-260 unallocated cattle tags |
| 44/0NN/0002 | agriculturalHolding | ~210-250 unallocated cattle tags |
| 44/0NN/0003 | abattoir | 0 (fsaNumber set: 25/26 0003) |
| 44/0NN/0004 | market | 0 |
| 44/0NN/0005 | commonLand | 0 |
| 44/0NN/0006 | seaport | 0 |
| 44/0NN/0007 | showground | 0 |

- User 1 CPH prefix: 44/025/000N
- User 2 CPH prefix: 44/026/000N
- Cattle tags are UK-prefixed 14-digit ear tags (e.g. UK442501300001), all currently unallocated — need to be assigned to a herd/animal before movement testing.

## Key testing notes
- Move cattle FROM User 1's agricultural holding (44/025/0001 or 0002) TO User 2's (44/026/0001 or 0002) and vice versa, mirroring the sheep/goat cross-CPH test pattern.
- Abattoir CPHs (44/025/0003, 44/026/0003) have fsaNumber set — use for slaughter/final destination movement tests.
- This is a **different sandbox tenant** than the sheep/goat CLA Beta Sandbox data (`lis-test-data.md`) — usernames use `lisprodsandboxuserNN-prod01-li@...` pattern, not `bdefarmtrac-testcphholderN@...`. Confirm with LIS support which environment (sandbox vs prod-sandbox naming) this maps to once LIP subscription is approved, since the username contains "prod" but this is understood to be sandbox data per user.
- Still blocked on: LIP sandbox API subscription approval (see `lis-lip-cattle.md`) before this data can be used end-to-end.

**Why:** Captured so cattle movement testing can start immediately once LIP API access is approved, without waiting on the user to re-locate/re-upload this file.
