/**
 * Network helpers for scouting photo actions.
 *
 * Kept separate from the shared photo UI so the single-photo URL refresh can
 * be tested without rendering React Native components.
 */

import { apiFetch } from "./apiFetch";

/**
 * Fetches a fresh presigned download URL for one scouting photo.
 *
 * Returns null for network and non-2xx failures so callers can preserve the
 * current photo state and show the appropriate retry feedback.
 */
export async function fetchScoutingPhotoUrl(
  farmId: number | string,
  scoutingId: number | string,
  photoId: number | string,
): Promise<string | null> {
  try {
    const res = await apiFetch(
      `/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos/${photoId}/url`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { downloadUrl: string | null };
    return data.downloadUrl ?? null;
  } catch {
    return null;
  }
}