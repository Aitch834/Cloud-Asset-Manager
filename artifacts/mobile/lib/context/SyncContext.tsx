import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";

import { getList, STORAGE_KEYS } from "@/lib/storage";
import type { SyncQueueItem } from "@/lib/types";

const [SyncProviderInner, useSync] = createContextHook(
  function useSyncState() {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

    const refreshPendingCount = useCallback(async () => {
      const items = await getList<SyncQueueItem>(STORAGE_KEYS.PENDING_SYNC);
      setPendingCount(items.length);
    }, []);

    useEffect(() => {
      refreshPendingCount();
      const interval = setInterval(refreshPendingCount, 30000);
      return () => clearInterval(interval);
    }, [refreshPendingCount]);

    const triggerSync = useCallback(async () => {
      setIsSyncing(true);
      const items = await getList<SyncQueueItem>(STORAGE_KEYS.PENDING_SYNC);
      if (items.length > 0) {
        await new Promise((r) => setTimeout(r, 1500));
        const { setItem } = await import("@/lib/storage");
        await setItem(STORAGE_KEYS.PENDING_SYNC, []);
      }
      setLastSyncTime(new Date().toISOString());
      setIsSyncing(false);
      await refreshPendingCount();
    }, [refreshPendingCount]);

    return { pendingCount, isSyncing, lastSyncTime, triggerSync, refreshPendingCount };
  },
);

function SyncProvider({ children }: { children: React.ReactNode }) {
  return <SyncProviderInner>{children}</SyncProviderInner>;
}

export { SyncProvider, useSync };
