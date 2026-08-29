/**
 * Pure logic helpers for the ScoutingPhotoLightbox component.
 * Kept in a separate file so they can be unit-tested without importing
 * any React Native modules.
 */

/**
 * Clamp a photo index after the photos array shrinks (e.g. after a delete).
 * Returns -1 (close signal) when the array is empty.
 */
export function clampIndexAfterDelete(currentIndex: number, newLength: number): number {
  if (newLength === 0) return -1;
  return Math.min(currentIndex, newLength - 1);
}

/**
 * Whether the left chevron should be visible.
 * Hidden when there is only one photo or the first photo is already shown.
 */
export function showLeftChevron(photosCount: number, currentIndex: number): boolean {
  return photosCount > 1 && currentIndex > 0;
}

/**
 * Whether the right chevron should be visible.
 * Hidden when there is only one photo or the last photo is already shown.
 */
export function showRightChevron(photosCount: number, currentIndex: number): boolean {
  return photosCount > 1 && currentIndex < photosCount - 1;
}

/**
 * Whether the photo counter (e.g. "2 / 5") should be visible.
 * Only shown when there are multiple photos.
 */
export function showCounter(photosCount: number): boolean {
  return photosCount > 1;
}

/**
 * Human-readable counter label, e.g. "2 / 5".
 */
export function counterText(currentIndex: number, photosCount: number): string {
  return `${currentIndex + 1} / ${photosCount}`;
}

/**
 * Derive the id of the photo that Share / Delete should target.
 * Always resolves from the current display index so that navigating
 * between photos before confirming an action targets the shown photo,
 * not the one originally tapped to open the lightbox.
 */
export function currentPhotoId(
  photos: ReadonlyArray<{ id: number }>,
  currentIndex: number,
): number | null {
  return photos[currentIndex]?.id ?? null;
}

/**
 * Claim the one automatic retry allowed for a photo view and schedule it.
 * Returns null when a retry has already been claimed, even if the first
 * scheduled attempt subsequently fails.
 */
export function scheduleScoutingPhotoAutoRetry(
  autoRetried: { current: boolean },
  schedule: (
    callback: () => void | Promise<void>,
    delayMs: number,
  ) => ReturnType<typeof setTimeout>,
  callback: () => void | Promise<void>,
  delayMs = 2000,
): ReturnType<typeof setTimeout> | null {
  if (autoRetried.current) return null;
  autoRetried.current = true;
  return schedule(callback, delayMs);
}

/**
 * Apply a caption save to the matching photo without relying on its array
 * position.  The lightbox index can change while the PATCH is in flight, so
 * caption updates must follow the stable photo ID rather than the current
 * display index.
 */
export function updatePhotoCaption<T extends { id: number; caption: string | null }>(
  photos: ReadonlyArray<T>,
  photoId: number,
  caption: string | null,
): T[] {
  return photos.map((photo) =>
    photo.id === photoId ? { ...photo, caption } : photo,
  );
}

/**
 * Whether a gesture should start swipe navigation.
 * Deletion takes priority over gesture direction so a swipe cannot race
 * with a photo removal that is already in flight.
 */
export function shouldAllowSwipe(deleting: boolean, dx: number, dy: number): boolean {
  return !deleting && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
}

/**
 * Resolve the navigation direction for a completed swipe.
 * Returning null while deleting protects against a gesture that started
 * before deletion began but was released after deletion became active.
 */
export function getSwipeDirection(
  deleting: boolean,
  dx: number,
  threshold = 50,
): "next" | "previous" | null {
  if (deleting || Math.abs(dx) <= threshold) return null;
  return dx < 0 ? "next" : "previous";
}
