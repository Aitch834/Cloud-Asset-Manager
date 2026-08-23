---
name: Mutable sync queue revisions
description: Durability rule for queue rows whose payload can be replaced while a sync request is in flight.
---

When a pending queue row can be replaced with a newer edit, completion and failure handling must be conditional on the exact payload (or immutable revision) that the worker attempted. Serialize replacement, conditional status changes, and completed-row cleanup when storage uses read-modify-write semantics.

For idempotent create endpoints that use `ON CONFLICT DO NOTHING`, a duplicate POST does not apply a newer payload. Capture the server ID returned by the successful or deduplicated create and reconcile the final local revision with a PUT before clearing the queue.

When fallback storage has no cross-key transaction, persist the server-ID recovery pointer on the durable local record before exposing that pointer on the queue. Queue-first ordering can let cleanup run after a crash while the local record still lacks the ID needed by a form that was already open.

Queue processors that work from a snapshot must re-read pending work after each pass and schedule another pass for new or changed revisions. Retry backoff must be stored per row; a global timer lets newly queued work pull unrelated failures forward.

Discarding a pending create needs a tombstone, not local deletion. Resolve the server ID through the idempotent create, then DELETE the server row before clearing queue and local state.

**Why:** A worker can snapshot payload A, then a user saves payload B into the same row before A finishes. Unconditional completion deletes B after uploading only A; unconditional failure can also consume B's retries without ever attempting it. Even with conditional completion, retrying B as the same idempotent POST can return the existing A row without updating it.

**How to apply:** Any sync type that updates mutable queued data must capture a revision or payload hash before upload, alter queue status only if it is unchanged, and immediately schedule another pass when the attempted revision was superseded. For create-then-edit flows, retain the returned server ID and make the reconciliation request update that row. On non-transactional stores, write durable recovery state before advancing queue state. Persist retry deadlines and exclude not-yet-due rows from immediate passes. Add interleaving and interruption regression tests that assert final server state, not only queue state.