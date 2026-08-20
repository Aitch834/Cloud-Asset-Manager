---
name: Defra plant health alerts
description: Current official position on automated access to Plant Health Alerts.
---

Defra Plant Health has confirmed that Plant Health Alerts currently have no API or structured subscription feed for third-party integration. Official communication remains through the Plant Health Information Portal and GOV.UK plant health pages, with no dedicated API or structured notification service currently confirmed.

**Why:** An integration based on undocumented endpoints, scraping, or inferred GOV.UK page changes would be brittle and could misrepresent official alerts.

**How to apply:** For BDE Farm Trac, prefer clearly labelled links to the official portal and GOV.UK pages, manually curated in-app awareness notices when needed, and an architecture that can accept a future official feed without promising automated alert completeness today.