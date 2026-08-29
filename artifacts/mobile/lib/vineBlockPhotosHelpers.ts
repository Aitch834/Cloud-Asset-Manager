/**
 * Pure helpers for the vine-block-photos screen.
 * Kept in a separate file so they can be unit-tested without importing any
 * React Native modules.
 */

export const CAPTION_SAVE_ERROR_MESSAGE = "Could not save the caption. Please try again.";

/**
 * Preserve platform-specific failure feedback for caption saves:
 * iOS edits captions through Alert.prompt, while Android and other platforms
 * render the error inside CaptionSheet.
 */
export function handleCaptionSaveFailure(
  platform: string,
  setInlineError: (message: string) => void,
  showAlert: (title: string, message: string) => void,
): void {
  if (platform === "ios") {
    showAlert("Error", CAPTION_SAVE_ERROR_MESSAGE);
  } else {
    setInlineError(CAPTION_SAVE_ERROR_MESSAGE);
  }
}

/**
 * Returns the confirmation message for the grid long-press delete flow.
 * When photosCount is 1 the "only photo" warning is shown.
 */
export function buildGridDeleteMessage(photosCount: number): string {
  return photosCount === 1
    ? "This is the only photo for this block — deleting it will leave the block with no images. This cannot be undone."
    : "Are you sure you want to delete this photo? This cannot be undone.";
}

/**
 * Returns the confirmation message for the lightbox delete-button flow.
 * When totalPhotos is 1 the "only photo" warning is shown; when the photo is
 * the cover (and there are others) a cover-change notice is appended.
 */
export function buildLightboxDeleteMessage(totalPhotos: number, isCover: boolean): string {
  if (totalPhotos === 1) {
    return "This is the only photo for this block — deleting it will leave the block with no images. This cannot be undone.";
  }
  if (isCover) {
    return "Are you sure you want to delete this photo? This cannot be undone.\n\nThis is the cover photo for this block. The next photo will become the new cover.";
  }
  return "Are you sure you want to delete this photo? This cannot be undone.";
}
