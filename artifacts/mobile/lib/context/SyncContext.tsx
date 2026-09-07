import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";

import {
  cleanup,
  dismissModuleUnavailableNotice,
  getState,
  initialize,
  refreshPendingCount as engineRefresh,
  subscribe,
  triggerManualSync,
  type SyncState,
} from "@/lib/sync-engine";

const [SyncProviderInner, useSync] = createContextHook(
  function useSyncState() {
    const [syncState, setSyncState] = useState<SyncState>(getState());

    useEffect(() => {
      initialize();
      const unsub = subscribe((s) => setSyncState(s));
      return () => {
        unsub();
        cleanup();
      };
    }, []);

    const triggerSync = useCallback(async () => {
      await triggerManualSync();
    }, []);

    const refreshPendingCount = useCallback(async () => {
      await engineRefresh();
    }, []);

    return {
      pendingCount: syncState.pendingCount,
      failedCount: syncState.failedCount,
      isSyncing: syncState.isSyncing,
      isConnected: syncState.isConnected,
      lastSyncTime: syncState.lastSyncTime,
      lastError: syncState.lastError,
      moduleUnavailableNotice: syncState.moduleUnavailableNotice,
      dismissModuleUnavailableNotice,
      triggerSync,
      refreshPendingCount,
    };
  },
);

function SyncProvider({ children }: { children: React.ReactNode }) {
  return <SyncProviderInner>{children}</SyncProviderInner>;
}

export { SyncProvider, useSync };
