import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const BANNER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function bannerKey(screen: string, farmId: string | undefined): string {
  return `identifier-banner-dismissed-${screen}-${farmId ?? "unknown"}`;
}

/**
 * Persists the "CPH/SBI identifier banner dismissed" state for a given screen
 * and farm, mirroring the dashboard's 30-day localStorage TTL pattern.
 *
 * The in-memory state is reset to false synchronously whenever the screen or
 * farmId key changes, so switching farms never leaks a stale dismissal from
 * the previous farm.
 *
 * @param screen  - A stable slug that uniquely identifies the screen
 *                  (e.g. "purchase", "medicine", "movement")
 * @param farmId  - The current farm ID (used to scope the key per farm)
 */
export function useIdentifierBannerDismiss(
  screen: string,
  farmId: string | undefined,
): { dismissed: boolean; dismiss: () => void } {
  const [dismissed, setDismissed] = useState(false);

  // Read persisted state on mount or when farmId/screen changes.
  // Always reset to false first so a farm-switch cannot inherit the previous
  // farm's dismissed state while the async read is in flight.
  useEffect(() => {
    setDismissed(false); // synchronous reset — safe before the async read
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(bannerKey(screen, farmId));
        if (!raw || cancelled) return;
        const { ts } = JSON.parse(raw) as { ts: number };
        if (cancelled) return;
        if (Date.now() - ts < BANNER_TTL_MS) {
          setDismissed(true);
        } else {
          // TTL expired — remove the stale entry
          await AsyncStorage.removeItem(bannerKey(screen, farmId));
        }
      } catch {
        // Offline or parse error — treat as not dismissed (already false)
      }
    })();
    return () => { cancelled = true; };
  }, [screen, farmId]);

  const dismiss = useCallback(async () => {
    setDismissed(true);
    try {
      await AsyncStorage.setItem(
        bannerKey(screen, farmId),
        JSON.stringify({ ts: Date.now() }),
      );
    } catch {
      // Best-effort; in-memory state already updated
    }
  }, [screen, farmId]);

  return { dismissed, dismiss };
}
