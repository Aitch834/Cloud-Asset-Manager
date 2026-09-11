---
name: Manual sync retry failure state
description: User-triggered sync retries are single visible attempts and must become retryable again immediately on failure.
---

A queue item retried explicitly by a grower must return to its failed state after one unsuccessful upload, with the latest error retained and the row still available for another manual retry.

**Why:** Sending a manual retry back through several hidden automatic attempts leaves the card showing “Uploading…” after the visible attempt has already failed, so the grower cannot see the failure or retry again.

**How to apply:** Any UI action that retries a previously failed queue item should arrange for the next failed attempt to reach the terminal failed threshold immediately. Keep the retry threshold shared with the sync policy so the behavior cannot drift.