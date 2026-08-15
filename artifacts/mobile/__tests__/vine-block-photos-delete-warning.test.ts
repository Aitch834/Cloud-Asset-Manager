/**
 * Unit tests for the last-photo delete warning in vine-block-photos.tsx.
 *
 * These tests cover both the grid long-press path (buildGridDeleteMessage)
 * and the lightbox delete-button path (buildLightboxDeleteMessage), asserting
 * that the "only photo for this block" warning fires when there is exactly one
 * photo remaining.
 */

import {
  buildGridDeleteMessage,
  buildLightboxDeleteMessage,
} from "../lib/vineBlockPhotosHelpers";

const ONLY_PHOTO_FRAGMENT = "only photo for this block";
const GENERIC_DELETE = "Are you sure you want to delete this photo? This cannot be undone.";

// ---------------------------------------------------------------------------
// Grid path (PhotoThumbnail long-press → handlePressOut)
// ---------------------------------------------------------------------------

describe("buildGridDeleteMessage", () => {
  it("includes the last-photo warning when photosCount is 1", () => {
    const message = buildGridDeleteMessage(1);
    expect(message).toContain(ONLY_PHOTO_FRAGMENT);
  });

  it("does NOT include the last-photo warning when multiple photos remain", () => {
    const message = buildGridDeleteMessage(2);
    expect(message).not.toContain(ONLY_PHOTO_FRAGMENT);
    expect(message).toBe(GENERIC_DELETE);
  });

  it("does NOT include the last-photo warning for any count > 1", () => {
    for (const count of [3, 10, 100]) {
      expect(buildGridDeleteMessage(count)).not.toContain(ONLY_PHOTO_FRAGMENT);
    }
  });
});

// ---------------------------------------------------------------------------
// Lightbox path (PhotoLightbox delete-button onPress)
// ---------------------------------------------------------------------------

describe("buildLightboxDeleteMessage", () => {
  it("includes the last-photo warning when totalPhotos is 1 (non-cover)", () => {
    const message = buildLightboxDeleteMessage(1, false);
    expect(message).toContain(ONLY_PHOTO_FRAGMENT);
  });

  it("includes the last-photo warning when totalPhotos is 1 and photo is marked as cover", () => {
    // The cover flag is irrelevant when it's the only photo — the last-photo
    // warning takes priority.
    const message = buildLightboxDeleteMessage(1, true);
    expect(message).toContain(ONLY_PHOTO_FRAGMENT);
  });

  it("does NOT include the last-photo warning when multiple photos remain (non-cover)", () => {
    const message = buildLightboxDeleteMessage(2, false);
    expect(message).not.toContain(ONLY_PHOTO_FRAGMENT);
    expect(message).toBe(GENERIC_DELETE);
  });

  it("shows cover-change notice when the photo is the cover and others remain", () => {
    const message = buildLightboxDeleteMessage(3, true);
    expect(message).not.toContain(ONLY_PHOTO_FRAGMENT);
    expect(message).toContain("cover photo for this block");
    expect(message).toContain("The next photo will become the new cover.");
  });

  it("does NOT include the last-photo warning for any totalPhotos > 1", () => {
    for (const count of [2, 5, 50]) {
      expect(buildLightboxDeleteMessage(count, false)).not.toContain(ONLY_PHOTO_FRAGMENT);
    }
  });
});
