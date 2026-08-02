---
name: RLS middleware commits after response
description: farmRlsMiddleware commits the per-request transaction in res.on("finish"), after the response is sent — fast sequential clients can race the commit
---

The api-server's farm-scoped RLS middleware wraps each request in a transaction and COMMITs in `res.on("finish")` — which fires *after* the HTTP response has been sent to the client.

**Why:** A client that fires request N+1 immediately after receiving request N's response can hit the DB before N's transaction has committed. Symptom: an UPDATE/SELECT on a row just created by the previous request matches 0 rows → 200 with an empty record, looking like a data bug. Seen intermittently in integration check scripts (duplicate batch-ref check: PUT-after-POST returned 200 `{}`).

**How to apply:** Any integration/e2e script that creates a record and immediately acts on it must tolerate the commit lag — retry briefly when a farm-scoped follow-up request reports 0 rows / missing record. Distinguish real failures: a genuine regression returns the actual (wrong) record, not an empty one. If this bites real users, the proper fix is committing before the response is flushed in farmRlsMiddleware.
