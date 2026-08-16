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
