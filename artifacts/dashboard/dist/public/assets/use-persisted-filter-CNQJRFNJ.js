import { r as reactExports } from "./index-Bd-r42pU.js";
function usePersistedFilter(opts) {
  const { page, filter, farmId, defaultValue, validValues, isValid } = opts;
  const storageKey = `${page}-${filter}-filter-${farmId ?? 0}`;
  const readStored = () => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v !== null) {
        if (validValues && !validValues.includes(v)) return defaultValue;
        if (isValid && !isValid(v)) return defaultValue;
        return v;
      }
    } catch {
    }
    return defaultValue;
  };
  const [value, setValueRaw] = reactExports.useState(readStored);
  const firstRun = reactExports.useRef(true);
  reactExports.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setValueRaw(readStored());
  }, [storageKey]);
  const setValue = (v) => {
    try {
      localStorage.setItem(storageKey, v);
    } catch {
    }
    setValueRaw(v);
  };
  return [value, setValue];
}
function usePersistedArrayFilter(opts) {
  const { page, filter, farmId } = opts;
  const storageKey = `${page}-${filter}-filter-${farmId ?? 0}`;
  const readStored = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) return parsed;
      }
    } catch {
    }
    return [];
  };
  const [value, setValueRaw] = reactExports.useState(readStored);
  const firstRun = reactExports.useRef(true);
  reactExports.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setValueRaw(readStored());
  }, [storageKey]);
  const setValue = (v) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(v));
    } catch {
    }
    setValueRaw(v);
  };
  return [value, setValue];
}
function usePersistedNumberFilter(opts) {
  const { page, filter, farmId, defaultValue, isValid } = opts;
  const [raw, setRaw] = usePersistedFilter({
    page,
    filter,
    farmId,
    defaultValue: String(defaultValue),
    isValid: (v) => {
      const n2 = Number(v);
      return Number.isFinite(n2) && (!isValid || isValid(n2));
    }
  });
  const n = Number(raw);
  const value = Number.isFinite(n) ? n : defaultValue;
  return [value, (v) => setRaw(String(v))];
}
export {
  usePersistedFilter as a,
  usePersistedArrayFilter as b,
  usePersistedNumberFilter as u
};
