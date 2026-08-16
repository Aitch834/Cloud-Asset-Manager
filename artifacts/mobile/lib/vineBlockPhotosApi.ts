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
