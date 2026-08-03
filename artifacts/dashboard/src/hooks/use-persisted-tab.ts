import { useEffect, useRef, useState } from "react";

/**
 * Persist a page's active tab in localStorage, scoped to the farm — the same
 * lazy initializer + wrapped setter + farmId re-sync + tab-id validation
 * pattern as ViticulturePage / OrganicViticulturePage, so users deep in a
 * tabbed module land back where they left off after a reload.
 *
 * - `page` is a unique kebab-case page key; the storage key becomes
 *   `${page}-active-tab-${farmId ?? 0}`.
 * - Stored values that no longer match a valid tab id fall back to `defaultTab`.
 * - `urlOverride` (e.g. a `?tab=` query param) wins on first mount only and is
 *   not persisted; explicit tab clicks are.
 * - Switching farms re-reads that farm's stored tab.
 */
export function usePersistedTab<T extends string>(opts: {
  page: string;
  farmId: number | null | undefined;
  validIds: readonly string[];
  defaultTab: T;
  urlOverride?: string | null;
}): [T, (v: T) => void] {
  const { page, farmId, validIds, defaultTab, urlOverride } = opts;
  const storageKey = `${page}-active-tab-${farmId ?? 0}`;
  const readStored = (): T => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v && validIds.includes(v)) return v as T;
    } catch { /* localStorage unavailable */ }
    return defaultTab;
  };
  const [tab, setTabRaw] = useState<T>(() =>
    urlOverride && validIds.includes(urlOverride) ? (urlOverride as T) : readStored()
  );
  // Re-sync when the farm (and therefore the storage key) changes — but not on
  // first mount, so a valid URL override isn't clobbered by the stored value.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setTabRaw(readStored());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  const setTab = (v: T) => {
    try { localStorage.setItem(storageKey, v); } catch { /* localStorage unavailable */ }
    setTabRaw(v);
  };
  return [tab, setTab];
}
