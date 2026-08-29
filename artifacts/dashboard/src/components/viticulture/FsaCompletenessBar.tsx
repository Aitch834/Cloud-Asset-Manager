import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { apiUrl as api } from "@/lib/api";

type FsaField = {
  label: string;
  value: unknown;
};

/** Shows the registration references that will be blank in printed reports. */
export function FsaCompletenessBar({ farmId }: { farmId: number }) {
  const { data: farmRecord, isLoading } = useQuery<Record<string, unknown> | null>({
    queryKey: ["farm-meta", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}`), { credentials: "include" });
      if (!r.ok) return null;
      const d = await r.json();
      return (d.record ?? d) as Record<string, unknown>;
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });
  const [, navigate] = useLocation();

  if (isLoading) return null;

  const FIELD_TARGET_IDS: Record<string, string> = {
    "FSA Vine Register Ref": "settings-fsa-vine-ref",
    "FSA Wine Production Ref": "settings-fsa-wine-ref",
    "APPA Ref": "settings-appa-ref",
    "WineGB Membership No": "settings-winegb-number",
  };

  const fields: FsaField[] = [
    { label: "FSA Vine Register Ref", value: farmRecord?.fsaVineRegisterRef },
    { label: "FSA Wine Production Ref", value: farmRecord?.fsaWineProductionRef },
    { label: "APPA Ref", value: farmRecord?.appaRef },
    { label: "WineGB Membership No", value: farmRecord?.winegbMembershipNumber },
  ];

  const allComplete = fields.every(f => !!f.value && String(f.value).trim() !== "");

  if (allComplete) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
      <div className="flex items-start gap-2.5 mb-2.5">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800">FSA / APPA / WineGB registration incomplete</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Missing references will appear blank in printed reports. Add them in{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-amber-900 font-medium"
              onClick={() => {
                navigate("/settings/farm");
                const firstMissingTargetId = fields
                  .filter(f => !f.value || String(f.value).trim() === "")
                  .map(f => FIELD_TARGET_IDS[f.label])
                  .find(Boolean);
                setTimeout(() => {
                  document.getElementById(firstMissingTargetId ?? "settings-appa-ref")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 400);
              }}
            >
              Farm Settings → Viticulture Registrations
            </button>
            .
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {fields.map(f => {
          const filled = !!f.value && String(f.value).trim() !== "";
          return (
            <button
              key={f.label}
              type="button"
              className={
                filled
                  ? "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 cursor-default"
                  : "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              }
              onClick={() => {
                if (!filled) {
                  navigate("/settings/farm");
                  setTimeout(() => {
                    document.getElementById(FIELD_TARGET_IDS[f.label] ?? "settings-appa-ref")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 400);
                }
              }}
              disabled={filled}
            >
              {filled
                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
                : <XCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              }
              {f.label}
              {!filled && <span className="text-amber-500 ml-0.5">→</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}