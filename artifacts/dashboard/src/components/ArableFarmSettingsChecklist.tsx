import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useFarmMeta } from "@/pages/viticulture/shared";

/**
 * Shows a checklist of arable-report header fields (SBI number, farm address).
 * Renders a green "complete" banner when both are filled, an amber warning
 * with per-field status and a link to Farm Settings when any are missing.
 *
 * Place this component above the tab bar on any page that produces printed
 * arable reports so growers are warned before they try to export.
 */
export function ArableFarmSettingsChecklist({ farmId }: { farmId: number }) {
  const { farmRecord, isLoading } = useFarmMeta(farmId);
  const [, navigate] = useLocation();

  if (isLoading) return null;

  const fields = [
    { label: "SBI Number", filled: !!farmRecord?.sbiNumber && String(farmRecord.sbiNumber).trim() !== "" },
    { label: "Farm Address", filled: !!farmRecord?.address && String(farmRecord.address).trim() !== "" },
  ];

  const missingCount = fields.filter(f => !f.filled).length;
  const allComplete = missingCount === 0;

  if (allComplete) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 mb-6">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
        <span className="font-medium">Farm Settings complete</span>
        <span className="text-green-700">— SBI number and farm address are both filled in.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
      <div className="flex items-start gap-2.5 mb-3">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Farm Settings incomplete</p>
          <p className="text-xs text-amber-700 mt-0.5">
            {missingCount} field{missingCount === 1 ? "" : "s"} below {missingCount === 1 ? "is" : "are"} missing — your printed arable reports will have blank header fields.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map(f => (
          <div key={f.label} className="flex items-center gap-2 text-sm">
            {f.filled
              ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              : <XCircle className="w-4 h-4 shrink-0 text-amber-500" />
            }
            <span className={f.filled ? "text-green-800" : "text-amber-800"}>{f.label}</span>
            {!f.filled && (
              <button
                type="button"
                className="ml-auto text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium whitespace-nowrap"
                onClick={() => navigate("/settings/farm")}
              >
                Add →
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5 border-t border-amber-200">
        <button
          type="button"
          className="text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium"
          onClick={() => navigate("/settings/farm")}
        >
          Open Farm Settings →
        </button>
      </div>
    </div>
  );
}
