import { useCallback } from "react";
import { useUiPrefs } from "./useUiPrefs";

function prefKey(screen: string, farmId: string | undefined): string {
  return `identifier_banner_dismissed_${screen}_${farmId ?? "unknown"}`;
}

/**
 * Returns whether the CPH/SBI identifier banner has been dismissed for a given
 * screen and farm, backed by the server-synced `useUiPrefs` store so that a
 * dismissal on one device suppresses the banner on all of the user's devices
 * after the next prefs sync.
 *
 * Blocks "dismissed" from becoming true until `prefsReady` is set, so we
 * never incorrectly hide the banner while the initial load is in-flight.
 *
 * @param screen  - A stable slug that uniquely identifies the screen
 *                  (e.g. "purchase", "medicine", "movement")
 * @param farmId  - The current farm ID (used to scope the key per farm)
 * @param userId  - The current user ID (required to scope prefs per user)
 */
export function useIdentifierBannerDismiss(
  screen: string,
  farmId: string | undefined,
  userId: string | null | undefined,
): { dismissed: boolean; dismiss: () => void } {
  const key = prefKey(screen, farmId);
  const { prefsReady, isHintDismissed, dismissHint } = useUiPrefs(userId);

  const dismiss = useCallback(() => {
    dismissHint(key);
  }, [dismissHint, key]);

  // Only treat the banner as dismissed once prefs have loaded; this prevents
  // the banner from briefly appearing on a fresh device where the cache is
  // empty and then disappearing once the server confirms it was dismissed.
  const dismissed = prefsReady && isHintDismissed(key);

  return { dismissed, dismiss };
}
