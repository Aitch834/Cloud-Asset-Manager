// Shared "SO₂ ceiling exceeded — save anyway?" confirmation dialog used by the
// CellarOps, Bottling and SO₂ Testing tabs. Each tab keeps its own
// confirmOverCeiling boolean + save(ceilingConfirmed) gate, but the dialog
// wording, layout and buttons live here so the three copies can't drift apart.
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function So2OverCeilingDialog({
  open,
  valueLabel = "Total SO₂",
  valueMgL,
  ceilingMgL,
  ceilingLabel,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  /** Lead-in for the measured value, e.g. "Total SO₂" or "Projected total". */
  valueLabel?: string;
  /** The over-ceiling value in mg/L; "—" is shown when unavailable. */
  valueMgL: number | null;
  /** The active ceiling in mg/L (as stored, e.g. "150"). */
  ceilingMgL: string | null | undefined;
  /** "organic" | "conventional" | "" (empty when the ceiling is a custom value). */
  ceilingLabel: string;
  /** True while the underlying save mutation is in flight. */
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" />SO₂ ceiling exceeded</DialogTitle>
          <DialogDescription>
            {valueLabel} {valueMgL != null && !isNaN(valueMgL) ? valueMgL.toFixed(1) : "—"} mg/L exceeds the {ceilingMgL} mg/L {ceilingLabel ? `${ceilingLabel} ` : ""}ceiling — save anyway?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
