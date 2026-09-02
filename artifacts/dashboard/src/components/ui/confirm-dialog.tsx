/**
 * Standard delete/destructive-action confirm dialog.
 *
 * Replaces window.confirm() so a failed mutation can show an inline error
 * banner (DialogMutationError) instead of failing silently after the native
 * pop-up has closed. Pass the TanStack mutation so the dialog stays open on
 * failure; call `mutation.reset()` in onCancel so a stale error doesn't
 * reappear on reopen.
 *
 * Typical usage with a pending-confirm state:
 *
 *   const [pendingDelete, setPendingDelete] = useState<number | null>(null);
 *   ...
 *   <Button onClick={() => setPendingDelete(row.id)}>Delete</Button>
 *   <ConfirmDialog
 *     open={pendingDelete !== null}
 *     title="Delete record"
 *     message="Delete this record?"
 *     confirmLabel="Delete"
 *     confirmVariant="destructive"
 *     mutation={deleteMut}
 *     onConfirm={() => { if (pendingDelete !== null) deleteMut.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) }); }}
 *     onCancel={() => { setPendingDelete(null); deleteMut.reset(); }}
 *   />
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { useEffect, useRef, useState } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  mutation,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive";
  mutation?: { isError: boolean; isPending: boolean; error: unknown };
}) {
  const confirmInFlightRef = useRef(false);
  const [confirmSubmitted, setConfirmSubmitted] = useState(false);

  // isPending disables the button after the mutation state updates. The ref
  // closes the smaller same-tick window where two click handlers can run
  // before React has rendered that disabled state.
  useEffect(() => {
    if (!open || mutation?.isError) {
      confirmInFlightRef.current = false;
      setConfirmSubmitted(false);
    }
  }, [open, mutation?.isError]);

  const handleConfirm = () => {
    if (confirmInFlightRef.current || mutation?.isPending) return;
    confirmInFlightRef.current = true;
    setConfirmSubmitted(true);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        {mutation && <DialogMutationError mutation={mutation} message="Failed — please try again." />}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={mutation?.isPending || confirmSubmitted}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
