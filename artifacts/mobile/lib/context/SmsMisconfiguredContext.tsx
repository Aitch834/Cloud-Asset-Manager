import React, { createContext, useContext } from "react";

interface SmsMisconfiguredContextValue {
  /** True when SMS is enabled but every visible category is turned off. */
  misconfigured: boolean;
  /** Re-fetch the profile and recompute the badge. Call after saving SMS prefs. */
  refresh: () => void;
}

export const SmsMisconfiguredContext =
  createContext<SmsMisconfiguredContextValue>({
    misconfigured: false,
    refresh: () => {},
  });

export function useSmsMisconfiguredContext(): SmsMisconfiguredContextValue {
  return useContext(SmsMisconfiguredContext);
}
