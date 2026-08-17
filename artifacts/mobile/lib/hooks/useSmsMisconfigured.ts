import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { SMS_CATEGORIES } from "@/constants/smsCategories";

/**
 * Returns true when the user has SMS enabled ("all") but every visible
 * category is explicitly set to false — meaning they'd get no texts despite
 * thinking they're covered. Visible categories are those whose moduleGates
 * are satisfied by activeModuleKeys.
 */
export function useSmsMisconfigured(activeModuleKeys: string[]): boolean {
  const [misconfigured, setMisconfigured] = useState(false);

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
  }, [activeModuleKeys.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return misconfigured;
}
