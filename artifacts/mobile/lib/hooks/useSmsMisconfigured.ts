import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { SMS_CATEGORIES } from "@/constants/smsCategories";

/**
 * Returns [misconfigured, refresh] where:
 * - misconfigured is true when the user has SMS enabled ("all") but every
 *   visible category is explicitly set to false — meaning they'd get no texts
 *   despite thinking they're covered. Visible categories are those whose
 *   moduleGates are satisfied by activeModuleKeys.
 * - refresh is a stable callback that re-fetches the profile on demand
 *   (call it after saving SMS preferences so the badge clears immediately).
 */
export function useSmsMisconfigured(
  activeModuleKeys: string[],
): [boolean, () => void] {
  const [misconfigured, setMisconfigured] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick(t => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/account/profile")
      .then(r => (r.ok ? r.json() : null))
      .then(
        (data: {
          smsOptIn?: string;
          smsCategories?: Record<string, boolean> | null;
        } | null) => {
          if (cancelled || !data) return;
          if (data.smsOptIn === "none" || !data.smsOptIn) {
            setMisconfigured(false);
            return;
          }
          const saved = data.smsCategories;
          if (!saved) {
            // null means default (all on) — not misconfigured
            setMisconfigured(false);
            return;
          }
          const activeSet = new Set(activeModuleKeys);
          const visible = SMS_CATEGORIES.filter(
            cat =>
              cat.moduleGates.length === 0 ||
              cat.moduleGates.some(g => activeSet.has(g)),
          );
          if (visible.length === 0) {
            setMisconfigured(false);
            return;
          }
          const allOff = visible.every(cat => saved[cat.key] === false);
          setMisconfigured(allOff);
        },
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeModuleKeys.join(","), tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return [misconfigured, refresh];
}
