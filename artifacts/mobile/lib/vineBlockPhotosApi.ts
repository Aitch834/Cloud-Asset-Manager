/**
 * Network helpers for the vine-block-photos screen.
 *
 * Kept in a separate file from vineBlockPhotosHelpers.ts so that:
 *   (a) The pure message-builder helpers remain importable in the node Jest
 *       environment without triggering React Native module resolution.
 *   (b) This file—and therefore apiFetch—can be mocked at the module level
 *       in integration tests without affecting the pure-helper unit tests.
 */

import { apiFetch } from "./apiFetch";

export interface BlockPhotoRecord {
  id: number;
  blockId: number;
  farmId: number;
  objectPath: string;
  fileName: string | null;
  caption: string | null;
  isCover: boolean;
  uploadedAt: string;
  downloadUrl: string | null;
}

/**
 * Fetches the live photo list for a vineyard block from the server.
 *
 * Returns:
 *   - `BlockPhotoRecord[]` (possibly empty) on HTTP 2xx — the photos state
 *     should be updated to this value.
 *   - `null` on any network or non-2xx HTTP error — the caller should keep
 *     the existing photos state rather than clearing it.
 *
 * This mirrors the try/catch + `if (res.ok)` guard in the original inline
 * loadPhotos implementation and is extracted here so the fetch → parse →
 * photos-array pipeline can be integration-tested by mocking the apiFetch
 * module without rendering the full React Native component tree.
 */
export async function fetchBlockPhotos(
  farmId: number | string,
  blockId: number | string,
): Promise<BlockPhotoRecord[] | null> {
  try {
    const res = await apiFetch(
      `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { photos: BlockPhotoRecord[] };
    return data.photos ?? [];
  } catch {
    return null;
  }
}

/**
 * Applies a fetched photo list to state only when the request generation token
 * still matches the latest one — discarding any response that was superseded
 * by a newer loadPhotos call while it was in flight.
 *
 * This is the guard that prevents a slow initial load from overwriting the
 * result of a faster background refresh, and from applying a stale response
 * after the selected block has changed.
 *
 * Extracted from VineBlockPhotosScreen so the state-update logic can be
 * integration-tested with deferred, out-of-order responses without rendering
 * the full React Native component tree.
 *
 * @param gen          The generation token captured at the start of this request.
 * @param getLatestGen A function returning the current latest generation
 *                     (backed by a `useRef` in the component).
 * @param fetched      The result of fetchBlockPhotos — null means a network/HTTP
 *                     error; an array (possibly empty) means success.
 * @param setPhotos    The React state setter for the photos array.
 */
/**
 * Fetches a fresh presigned download URL for a single block photo.
 *
 * Used by `handleReload` in vine-block-photos.tsx so that tapping
 * "Tap to reload" on a broken thumbnail only hits a lightweight
 * single-URL endpoint rather than re-fetching the full photo list.
 *
 * Returns:
 *   - A URL string on HTTP 2xx — the caller should patch only the
 *     affected photo in state.
 *   - `null` on any network or non-2xx HTTP error — the caller should
 *     show an error Alert and leave the existing state unchanged.
 */
export async function fetchBlockPhotoUrl(
  farmId: number | string,
  blockId: number | string,
  photoId: number | string,
): Promise<string | null> {
  try {
    const res = await apiFetch(
      `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${photoId}/url`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { downloadUrl: string | null };
    return data.downloadUrl ?? null;
  } catch {
    return null;
  }
}

export interface PhotoReloadCallbacks {
  setPhotos: (
    updater: (photos: BlockPhotoRecord[]) => BlockPhotoRecord[],
  ) => void;
  setReloadingPhotoId: (photoId: number | null) => void;
  reloadInFlightRef: { current: boolean };
  showReloadFailedAlert: () => void;
}

/**
 * Runs the complete single-photo reload state machine used by handleReload.
 *
 * The callbacks keep the helper independent of React Native while preserving
 * the production behavior: one reload at a time, a per-photo loading state,
 * target-only URL replacement, failure feedback, and cleanup that always
 * allows a later retry.
 */
export async function executePhotoReload(
  farmId: number | string,
  blockId: number | string,
  photoId: number | string,
  callbacks: PhotoReloadCallbacks,
): Promise<void> {
  if (callbacks.reloadInFlightRef.current) return;

  const targetPhotoId = Number(photoId);
  callbacks.reloadInFlightRef.current = true;
  callbacks.setReloadingPhotoId(targetPhotoId);

  try {
    const freshUrl = await fetchBlockPhotoUrl(farmId, blockId, photoId);
    if (freshUrl === null) {
      callbacks.showReloadFailedAlert();
      return;
    }

    callbacks.setPhotos((photos) =>
      photos.map((photo) =>
        photo.id === targetPhotoId
          ? { ...photo, downloadUrl: freshUrl }
          : photo,
      ),
    );
  } catch {
    callbacks.showReloadFailedAlert();
  } finally {
    callbacks.reloadInFlightRef.current = false;
    callbacks.setReloadingPhotoId(null);
  }
}

/**
 * Result type returned by patchPhotoCaption.
 *
 * `ok: true`  — the server accepted the save; `trimmedCaption` holds the
 *               normalised value that should be written to local state.
 * `ok: false` — a non-2xx HTTP response or a network error occurred; the
 *               caller must leave the caption sheet open so the grower can
 *               see the error and retry.
 */
export type PatchCaptionResult =
  | { ok: true; trimmedCaption: string | null }
  | { ok: false };

/**
 * Pure helper: returns a new array of photos sorted by `newPhotoIds`, dropping
 * any ID not present in `prev`.  Mirrors the `setPhotos` updater inside
 * `handleReorder` in vine-block-photos.tsx and is exported so tests can verify
 * the optimistic step without re-implementing it.
 */
export function applyOptimisticReorder(
  prev: BlockPhotoRecord[],
  newPhotoIds: number[],
): BlockPhotoRecord[] {
  const map = new Map(prev.map((p) => [p.id, p]));
  return newPhotoIds.map((id) => map.get(id)).filter(Boolean) as BlockPhotoRecord[];
}

/**
 * Sends the reorder PUT to the server and returns whether it succeeded.
 *
 * Returns `true` when the server accepted the new order (2xx).
 * Returns `false` when the PUT fails (non-ok response or network error) — the
 * caller should revert state by reloading from the server via `loadPhotos()`.
 *
 * Extracted from `handleReorder` in vine-block-photos.tsx so the network path
 * (PUT URL, method, body shape, and ok-check) can be tested directly without
 * rendering the full React Native component tree.
 */
export async function executePhotoReorder(
  farmId: number | string,
  blockId: number | string,
  newPhotoIds: number[],
): Promise<boolean> {
  try {
    const res = await apiFetch(
      `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/reorder`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: newPhotoIds }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

export interface PhotoSetCoverCallbacks {
  setPhotos: (
    updater: (photos: BlockPhotoRecord[]) => BlockPhotoRecord[],
  ) => void;
  showError: (message: string) => void;
}

/**
 * Sets one photo as the block cover and applies the matching local state
 * update only after the server accepts the PATCH.
 *
 * The callbacks keep this flow independent of React Native so a stale photo
 * ID (for example, after another device deleted the photo) can be tested
 * without rendering the full screen.  A failed request leaves local state
 * untouched and reports an error to the caller.
 */
export async function executePhotoSetCover(
  farmId: number | string,
  blockId: number | string,
  photoId: number | string,
  callbacks: PhotoSetCoverCallbacks,
): Promise<boolean> {
  try {
    const res = await apiFetch(
      `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${photoId}`,
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

export function applyPhotoUpdateIfCurrent(
  gen: number,
  getLatestGen: () => number,
  fetched: BlockPhotoRecord[] | null,
  setPhotos: (photos: BlockPhotoRecord[]) => void,
): void {
  // Discard stale responses — a newer request already resolved or is in flight.
  if (gen !== getLatestGen()) return;
  // Null = error path — keep the existing list rather than flashing empty state.
  if (fetched !== null) {
    setPhotos(fetched);
  }
}

/**
 * PATCHes a single photo's caption on the server.
 *
 * Returns a discriminated union so the component can decide whether to close
 * the caption sheet (on success) or keep it open (on failure) without
 * duplicating the fetch/error-handling logic inline.
 *
 * Extracted here — rather than kept inline in handleSaveCaption — so the
 * fetch → parse → result pipeline can be integration-tested by mocking the
 * apiFetch module without rendering the full React Native component tree.
 */
export async function patchPhotoCaption(
  farmId: number | string,
  blockId: number | string,
  photoId: number | string,
  caption: string,
): Promise<PatchCaptionResult> {
  try {
    const trimmed = caption.trim() || null;
    const res = await apiFetch(
      `/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${photoId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: trimmed }),
      },
    );
    if (res.ok) return { ok: true, trimmedCaption: trimmed };
    return { ok: false };
  } catch {
    return { ok: false };
  }
}
