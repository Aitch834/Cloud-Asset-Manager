/**
 * Formats the active photo's one-based position for a lightbox.
 *
 * Returning null for an invalid index keeps the lightbox from displaying a
 * misleading position while its active photo is being resolved.
 */
export function formatPhotoPosition(index: number, total: number): string | null {
  if (!Number.isInteger(index) || !Number.isInteger(total) || index < 0 || total < 1 || index >= total) {
    return null;
  }

  return `${index + 1} of ${total}`;
}