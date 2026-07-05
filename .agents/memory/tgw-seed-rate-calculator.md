---
name: TGW-based seed rate calculator
description: How seed rate is calculated at crop-assignment stage from thousand-grain-weight, target plant population, soil type, and drilling date.
---

## Model
Formula: `seedRateKgHa = (targetPlantsM2 × tgwGrams) / (establishmentPercent / 100) / 100`

Target plant population defaults:
- Standard crops: 250 plants/m²
- Black-grass risk fields: 350 plants/m² (denser stand competes harder against black-grass)

Establishment % is not a fixed constant — it's derived from soil type (regex-matched against the field's free-text soil description) combined with drilling month, then clamped to 45–90%. Heavier/wetter soils and later (post-October) drilling dates lower the estimate; lighter soils and early-autumn drilling raise it.

**Why:** The user wanted the calculator to reflect real agronomic practice — establishment losses vary by soil and drilling window, not just seed size — rather than a single flat percentage.

**How to apply:** The calculator is a pure module (no DB/API calls) so it can be reused anywhere a live "suggested rate" is needed. It only *suggests* a value; growers can override it before saving. Suggested values are persisted alongside the assignment (not recomputed later) so historical records don't silently change if the calculator logic evolves — always add new derived columns rather than mutating the formula's meaning for old rows if the model changes materially.
