/**
 * Network helpers for scouting photo actions.
 *
 * Kept separate from the shared photo UI so the single-photo URL refresh can
 * be tested without rendering React Native components.
 */

import { apiFetch } from "./apiFetch";

export interface ScoutingPhotoCoverCallbacks<T extends { id: number }> {
  setPhotos: (updater: (photos: T[]) => T[]) => void;
  showError: (message: string) => void;
}

/**
 * Sets one scouting photo as the record cover and applies the matching local
 * state update only after the server accepts the PATCH.
 *
 * Keeping the request and state transition together gives the lightbox action
 * one failure-safe path: a failed request never clears the existing cover.
 */
export async function executeScoutingPhotoSetCover<T extends { id: number }>(
  farmId: number | string,
  scoutingId: number | string,
  photoId: number | string,
  callbacks: ScoutingPhotoCoverCallbacks<T>,
): Promise<boolean> {
  try {
    const res = await apiFetch(
      `/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos/${photoId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCover: true }),
      },
    );
    if (!res.ok) {
      callbacks.showError("Could not set the cover photo. Please try again.");
      return false;
    }

    callbacks.setPhotos((prev) =>
      prev.map((photo) => ({ ...photo, isCover: photo.id === Number(photoId) })),
    );
    return true;
  } catch {
    callbacks.showError("Could not set the cover photo.");
    return false;
  }
}

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