---
name: FP input log calendar-day countdowns
description: Date-only derogation expiry countdowns must use calendar dates rather than elapsed local-midnight milliseconds.
---

Date-only expiry countdowns should convert the expiry date and the current local calendar date to UTC day numbers before subtracting. This keeps “today”, year-end rollovers, and dates spanning 23/25-hour DST days correct while preserving negative values for expired records.

**Why:** Local midnight intervals are not always 24 hours in the UK, so millisecond division can make audit exports vulnerable to off-by-one countdowns.

**How to apply:** Use the shared FP input-log calendar-day helper for every output surface that reports derogation days remaining, including CSV and print.