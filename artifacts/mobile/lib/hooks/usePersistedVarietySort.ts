import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

type VarietySortCol = "variety" | "totalHa" | "totalKg" | "kgPerHa" | "avgBrix";
type VarietySortDir = "asc" | "desc";

export interface VarietySort {
  col: VarietySortCol;
  dir: VarietySortDir;
}

const DEFAULT_SORT: VarietySort = { col: "variety", dir: "asc" };

const VALID_COLS: VarietySortCol[] = ["variety", "totalHa", "totalKg", "kgPerHa", "avgBrix"];
const VALID_DIRS: VarietySortDir[] = ["asc", "desc"];

function isValidSort(v: unknown): v is VarietySort {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.col === "string" &&
    VALID_COLS.includes(s.col as VarietySortCol) &&
    typeof s.dir === "string" &&
    VALID_DIRS.includes(s.dir as VarietySortDir)
  );
}

/**
 * Persist the harvest "Yield by Variety" cross-tab sort preference in
 * AsyncStorage, scoped per farm.
 *
 * Returns `[sort, setSort]`.
 * - Defaults to `{ col: "variety", dir: "asc" }`.
 * - Switching farms re-reads that farm's stored sort.
 * - Sort survives app restarts.
 *
 * Storage key: `bde_vine_variety_sort_<farmId>`
 */
export function usePersistedVarietySort(
  farmId: string | undefined,
): [VarietySort, (sort: VarietySort) => void] {
  const storageKey = farmId ? `bde_vine_variety_sort_${farmId}` : null;

  const [sort, setSortRaw] = useState<VarietySort>(DEFAULT_SORT);
  const userToggled = useRef(false);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setSortRaw(DEFAULT_SORT);
      userToggled.current = false;
      return;
    }

    // Reset immediately so a farm switch never displays the previous farm's
    // preference while this farm's value is being hydrated.
    setSortRaw(DEFAULT_SORT);
    userToggled.current = false;
    let cancelled = false;
    getItem<VarietySort>(storageKey).then((stored) => {
      if (cancelled || userToggled.current) return;
      setSortRaw(isValidSort(stored) ? stored : DEFAULT_SORT);
    });
    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setSort = useCallback(
    (newSort: VarietySort) => {
      userToggled.current = true;
      setSortRaw(newSort);
      if (storageKey) {
        setItem(storageKey, newSort).catch(() => {
          /* ignore write failures silently */
        });
      }
    },
    [storageKey],
  );

  return [sort, setSort];
}
