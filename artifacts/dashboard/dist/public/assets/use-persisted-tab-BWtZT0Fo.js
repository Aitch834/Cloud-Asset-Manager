import { r as reactExports } from "./index-szmq1rP5.js";
function persistedTabStorageKey(page, farmId) {
  return `${page}-active-tab-${farmId ?? 0}`;
}
function resolvePersistedTabValue(storedValue, validIds, defaultTab, urlOverride) {
  if (urlOverride && validIds.includes(urlOverride)) return urlOverride;
  if (storedValue && validIds.includes(storedValue)) return storedValue;
  return defaultTab;
}
function usePersistedTab(opts) {
  const { page, farmId, validIds, defaultTab, urlOverride } = opts;
  const storageKey = persistedTabStorageKey(page, farmId);
  const readStored = () => {
    let storedValue = null;
    try {
      storedValue = localStorage.getItem(storageKey);
    } catch {
    }
    return resolvePersistedTabValue(storedValue, validIds, defaultTab);
  };
  const [tab, setTabRaw] = reactExports.useState(
    () => resolvePersistedTabValue(
      (() => {
        try {
          return localStorage.getItem(storageKey);
        } catch {
          return null;
        }
      })(),
      validIds,
      defaultTab,
      urlOverride
    )
  );
  const firstRun = reactExports.useRef(true);
  reactExports.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setTabRaw(readStored());
  }, [storageKey]);
  const setTab = (v) => {
    try {
      localStorage.setItem(storageKey, v);
    } catch {
    }
    setTabRaw(v);
  };
  return [tab, setTab];
}
export {
  usePersistedTab as u
};
