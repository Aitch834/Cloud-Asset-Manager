import React, { createContext, useCallback, useContext, useRef, useState } from "react";

interface SmsPrefsContextValue {
  /** Increments every time SMS prefs are successfully saved. */
  refreshKey: number;
  /** Call after a successful SMS preferences save to trigger badge re-evaluation. */
  triggerSmsRefresh: () => void;
}

const SmsPrefsContext = createContext<SmsPrefsContextValue>({
  refreshKey: 0,
  triggerSmsRefresh: () => {},
});

export function SmsPrefsProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerSmsRefresh = useCallback(() => setRefreshKey(k => k + 1), []);
  return (
    <SmsPrefsContext.Provider value={{ refreshKey, triggerSmsRefresh }}>
      {children}
    </SmsPrefsContext.Provider>
  );
}

export function useSmsPrefsContext(): SmsPrefsContextValue {
  return useContext(SmsPrefsContext);
}
