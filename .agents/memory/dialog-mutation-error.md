---
name: Dialog failed-save UX convention
description: Dashboard convention for how dialogs must behave when a save/delete mutation fails
---
Rule: any dashboard dialog whose create/update/delete mutation fails must stay open with the entered data preserved and render `<DialogMutationError mutation={mut} />` (src/components/ui/dialog-error.tsx) above the DialogFooter; the dialog's close handler must call `mutation.reset()` so stale errors don't reappear on reopen.

**Why:** toast-only failures left confirmation dialogs stuck open with no guidance (found while e2e-verifying failure toasts); users had no clear retry/cancel state.

**How to apply:** whenever adding or touching a dialog-bound useMutation, wire the banner + reset. Reference implementations: NMPPage, FinancialPage (transactions), CarbonPage (audits). Also ensure the mutationFn throws on !res.ok, or the error path never fires.
