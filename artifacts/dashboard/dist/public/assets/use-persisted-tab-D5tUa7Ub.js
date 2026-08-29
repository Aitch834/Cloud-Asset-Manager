import { r as reactExports } from "./index-DsTqZLGc.js";
function usePersistedTab(opts) {
  const { page, farmId, validIds, defaultTab, urlOverride } = opts;
  const storageKey = `${page}-active-tab-${farmId ?? 0}`;
  const readStored = () => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v && validIds.includes(v)) return v;
    } catch {
    }
    return defaultTab;
  };
  const [tab, setTabRaw] = reactExports.useState(
    () => urlOverride && validIds.includes(urlOverride) ? urlOverride : readStored()
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
