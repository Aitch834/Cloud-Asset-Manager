import React, { createContext, useCallback, useContext, useState } from "react";

interface BarrelAlertContextValue {
  /** Increments every time a barrel fill or maintenance record is successfully saved. */
  refreshKey: number;
  /** Call after a successful barrel fill or maintenance write to trigger badge re-evaluation. */
  triggerBarrelRefresh: () => void;
}

const BarrelAlertContext = createContext<BarrelAlertContextValue>({
  refreshKey: 0,
  triggerBarrelRefresh: () => {},
});

export function BarrelAlertProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerBarrelRefresh = useCallback(() => setRefreshKey(k => k + 1), []);
  return (
    <BarrelAlertContext.Provider value={{ refreshKey, triggerBarrelRefresh }}>
      {children}
    </BarrelAlertContext.Provider>
  );
}

export function useBarrelAlertContext(): BarrelAlertContextValue {
  return useContext(BarrelAlertContext);
}
