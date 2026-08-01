---
name: Enter-opens-dialog ghost close
description: Opening a Radix dialog from an Enter keydown can immediately dismiss it unless the keydown calls preventDefault().
---

Rule: any keyboard handler that opens a Radix/shadcn Dialog on Enter must call `e.preventDefault()` in the Enter branch.

**Why:** In the batch-ref combobox, Enter on a highlighted suggestion mounted the batch trail dialog, but the same native keystroke leaked into the newly auto-focused dialog (close button), instantly closing it — dialog "flashed" then vanished and the input state was reset via onClose. Mouse click paths worked fine; only the keyboard path failed, and intermittently (timing-sensitive), so manual checks can miss it.

**How to apply:** When wiring Enter-to-open-dialog interactions (comboboxes, search inputs, list rows), always preventDefault on the Enter keydown, and e2e-verify that the dialog is still open ~1s after the key press (not just that it appeared).
