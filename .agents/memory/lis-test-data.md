---
name: LIS Beta Sandbox test data
description: Two LIS test user accounts, their CPH numbers, herd marks, and ear tag ranges for end-to-end testing
---

## Test accounts (Beta Sandbox only — never use in production)

### User 1
- Username: bdefarmtrac-testcphholder1@livestockinformationb2cprod.onmicrosoft.com
- LIS user ID: d56ce58c-0d25-445c-b201-c4582348bdd1

### User 2
- Username: bdefarmtrac-testcphholder2@livestockinformationb2cprod.onmicrosoft.com
- LIS user ID: fd143edd-1c8e-45bf-b91b-a7b2f5df1aca

Passwords are in attached_assets/testData_1781087138915.json — do not paste here.

## CPH numbers

| CPH | Type | User | MHS | Notes |
|-----|------|------|-----|-------|
| 01/100/0253 | Abattoir | 1 | 0035 | |
| 01/100/0254 | Assembly | 1 | | |
| 01/100/0255 | Collection | 1 | | |
| 01/100/0256 | Common | 1 | | |
| 01/100/0257 | Producer | 1 | | Has herds & tags |
| 01/100/0258 | SaleYard (Market) | 1 | | |
| 01/100/0259 | ShowGround | 1 | | |
| 01/100/0260 | Abattoir | 2 | 0036 | |
| 01/100/0261 | Assembly | 2 | | |
| 01/100/0262 | Collection | 2 | | |
| 01/100/0263 | Common | 2 | | |
| 01/100/0264 | Producer | 2 | | Has herds & tags |
| 01/100/0265 | SaleYard (Market) | 2 | | |
| 01/100/0266 | ShowGround | 2 | | |

## Herds & tags (Producer CPHs only)

### User 1 — CPH 01/100/0257
| Herd ref | Batch | Species | Tags |
|----------|-------|---------|------|
| 130181 | UK130181 | Sheep | UK013018100001–UK013018100025 (25 tags) |
| 130182 | UK130182 | Sheep | UK013018200001–UK013018200025 (25 tags) |
| 130183 | UK130183 | Goat | UK013018300001–UK013018300025 (25 tags) |
| 130184 | UK130184 | Goat | UK013018400001–UK013018400025 (25 tags) |
| 130185 | UKBD0185 | Deer | no tags |

### User 2 — CPH 01/100/0264
| Herd ref | Batch | Species | Tags |
|----------|-------|---------|------|
| 130186 | UK130186 | Sheep | UK013018600001–UK013018600025 (25 tags) |
| 130187 | UK130187 | Sheep | UK013018700001–UK013018700025 (25 tags) |
| 130188 | UK130188 | Goat | UK013018800001–UK013018800025 (25 tags) |
| 130189 | UK130189 | Goat | UK013018900001–UK013018900025 (25 tags) |
| 130190 | UKBD0190 | Deer | no tags |

## Key testing notes
- Move sheep/goats FROM User 1's Producer CPH (01/100/0257) TO User 2's Producer CPH (01/100/0264) and vice versa
- Use MHS code 0035 (User 1 abattoir) or 0036 (User 2) for abattoir movements
- Deer herd has no individual tags — use batch/count only
- LIS warns if you record a sheep move on a goat tag — good test case
- API env: LIS_USE_SANDBOX_API=true → routes to api.sandbox.cla.livestockinformation.org.uk

**Why:** These are unique sandbox records — no pre-existing movements, all clean slate for testing.
