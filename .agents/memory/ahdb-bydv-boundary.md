---
name: AHDB BYDV integration boundary
description: Product and data boundary for BYDV decision-support work with AHDB's hosted tool.
---

BDE Farm Trac may store field context, farmer-entered AHDB assessment outcomes, and the farm's resulting decision. It should link users to AHDB's hosted tool and clearly describe the BDE record as internal decision support, not a pesticide recommendation.

**Why:** AHDB owns and operates the risk model. Phase 1 was deliberately designed to add record-keeping value without duplicating, scraping, reverse-engineering, or misrepresenting AHDB's model.

**How to apply:** Any future automation must use an explicitly authorised public or partner API/feed with agreed licensing. Until then, keep the assessment outcome user-entered and preserve the link back to AHDB.