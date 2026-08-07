import { useEffect, useRef, useState } from "react";

/**
 * Persist an in-tab filter (year/season picker, species filter, etc.) in
 * localStorage, scoped to the farm — the same lazy initializer + wrapped
 * setter + farmId re-sync pattern as use-persisted-tab.ts and the winery
 * usePersistedYearFilter, so users resume exactly where they left off.
 *
 * - `page` is a unique kebab-case page key and `filter` names the specific
 *   filter; the storage key becomes `${page}-${filter}-filter-${farmId ?? 0}`.
 * - Stale stored values that fail `isValid` (or aren't in `validValues`)
 *   fall back to `defaultValue`.
 * - Switching farms re-reads that farm's stored value.
 *
 * ── Convention for "Clear filters" buttons ───────────────────────────────────
 * Always call the setter returned by this hook (not a raw useState setter) when
 * clearing a filter — including in "Clear filters" click handlers.  The setter
 * writes the empty string to localStorage so the cleared state is remembered on
 * the next visit.  If you reset state with a local useState dispatch instead,
 * the stored value is NOT cleared and the user will see stale filters next time
 * they open the page.
 *
 * ✅  onClick={() => { setFilterStatus(""); setFilterGI(""); }}  // persisted
 * ❌  onClick={() => { setLocalStatus(""); setLocalGI(""); }}    // not persisted
 */
export function usePersistedFilter(opts: {
  page: string;
  filter: string;
  farmId: number | null | undefined;
  defaultValue: string;
  validValues?: readonly string[];
  isValid?: (v: string) => boolean;
}): [string, (v: string) => void] {
  const { page, filter, farmId, defaultValue, validValues, isValid } = opts;
  const storageKey = `${page}-${filter}-filter-${farmId ?? 0}`;
  const readStored = (): string => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v !== null) {
        if (validValues && !validValues.includes(v)) return defaultValue;
        if (isValid && !isValid(v)) return defaultValue;
        return v;
      }
    } catch { /* localStorage unavailable */ }
    return defaultValue;
  };
  const [value, setValueRaw] = useState<string>(readStored);
  // Re-sync when the farm (and therefore the storage key) changes — but not on
  // first mount, where the lazy initializer already read the stored value.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setValueRaw(readStored());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  const setValue = (v: string) => {
    try { localStorage.setItem(storageKey, v); } catch { /* localStorage unavailable */ }
    setValueRaw(v);
  };
  return [value, setValue];
}

/**
 * Numeric variant of usePersistedFilter for year pickers that hold numbers
 * (e.g. Season Reports' crop year). Non-numeric or invalid stored values
 * fall back to `defaultValue`.
 */
export function usePersistedNumberFilter(opts: {
  page: string;
  filter: string;
  farmId: number | null | undefined;
  defaultValue: number;
  isValid?: (v: number) => boolean;
}): [number, (v: number) => void] {
  const { page, filter, farmId, defaultValue, isValid } = opts;
  const [raw, setRaw] = usePersistedFilter({
    page,
    filter,
    farmId,
    defaultValue: String(defaultValue),
    isValid: (v) => {
      const n = Number(v);
      return Number.isFinite(n) && (!isValid || isValid(n));
    },
  });
  const n = Number(raw);
  const value = Number.isFinite(n) ? n : defaultValue;
  return [value, (v: number) => setRaw(String(v))];
}
