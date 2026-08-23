import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

export interface VarietyColsVisibility {
  avgBrix: boolean;
  avgPh: boolean;
  avgTa: boolean;
  avgPotAlc: boolean;
}

const DEFAULT_COLS: VarietyColsVisibility = {
  avgBrix: true,
  avgPh: true,
  avgTa: true,
  avgPotAlc: true,
};

function isValidCols(v: unknown): v is VarietyColsVisibility {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.avgBrix === "boolean" &&
    typeof c.avgPh === "boolean" &&
    typeof c.avgTa === "boolean" &&
    typeof c.avgPotAlc === "boolean"
  );
}

/**
 * Persist which chemistry columns are visible in the "Yield by Variety" table,
 * scoped per farm. Returns `[cols, toggleCol]`.
 *
 * - Default: all 4 columns shown.
 * - Switching farms re-reads that farm's stored preference.
 * - Selection survives app restarts.
 *
 * Storage key: `bde_vine_variety_cols_<farmId>`
 */
export function usePersistedVarietyColumns(
  farmId: string | undefined,
): [VarietyColsVisibility, (key: keyof VarietyColsVisibility) => void] {
  const storageKey = farmId ? `bde_vine_variety_cols_${farmId}` : null;

  const [cols, setColsRaw] = useState<VarietyColsVisibility>(DEFAULT_COLS);
  const loadedForFarm = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setColsRaw(DEFAULT_COLS);
      loadedForFarm.current = farmId;
      return;
    }
    if (loadedForFarm.current === farmId) return;

    let cancelled = false;
    getItem<VarietyColsVisibility>(storageKey).then((stored) => {
      if (cancelled) return;
      setColsRaw(isValidCols(stored) ? stored : DEFAULT_COLS);
      loadedForFarm.current = farmId;
    });
    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const toggleCol = useCallback(
    (key: keyof VarietyColsVisibility) => {
      setColsRaw((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        if (storageKey) {
          setItem(storageKey, next).catch(() => {
            /* best-effort */
          });
        }
        return next;
      });
    },
    [storageKey],
  );

  return [cols, toggleCol];
}
