---
name: Shared ConfirmDialog for deletes
description: Dashboard destructive confirmations must use the shared mutation-aware ConfirmDialog, never window.confirm()
---

Rule: all destructive confirmations in the dashboard use `ConfirmDialog` from `@/components/ui/confirm-dialog` with the delete mutation passed in. Trigger only sets a pending state; `onConfirm` calls `mutate(args, { onSuccess: () => setPending(null) })` so the dialog stays open on failure and shows DialogMutationError; `onCancel` clears state and calls `mutation.reset()`.

**Why:** native confirm() closes instantly, so a failed delete could only toast (silent-failure gap fixed project-wide, Aug 2026). All 41 confirm() sites in pages/ were converted; validation/review expects this pattern.

**How to apply:** any new delete flow, and any legacy local ConfirmDialog without a mutation prop (e.g. PigProductionPage's DataTable one) should migrate to the shared component. Bare async del() fetch handlers should become useMutation with res.ok checks so failures reject.
