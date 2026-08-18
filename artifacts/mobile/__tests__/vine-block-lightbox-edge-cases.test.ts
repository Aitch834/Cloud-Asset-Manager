/**
 * Unit tests for VineBlockPhotoLightbox edge-case logic.
 *
 * All assertions exercise pure helpers exported from lib/vineBlockLightboxHelpers.ts
 * that are directly used by the PhotoLightbox component in vine-block-photos.tsx.
 * There is no React Native dependency — the tests run in the plain Node/Jest
 * environment.
 *
 * The vine-block lightbox uses swipe gestures for navigation (no chevron buttons).
 * The equivalent of "chevron hidden at boundary" is resolveHorizSwipe returning
 * "snap" at the first / last photo.  All other edge cases map 1-to-1 with the
 * scouting lightbox:
 *
 *   1. Single photo → no navigation possible (all swipes snap)
 *   2. Delete last photo → close signal (index -1 from clampIndexAfterDelete)
 *   3. Delete middle photo → index clamps to adjacent photo (lightbox stays open)
 *   4. Delete rightmost photo → index clamps down to new last photo
 *   5. Swipe-left blocked at last photo (right boundary)
 *   6. Swipe-right blocked at first photo (left boundary)
 *   7. Navigation opens freely at an interior photo
 *   8. Counter text always reflects current position
 *   9. Share / Delete target the currently displayed photo, not the one tapped to open
 */

import {
  clampIndexAfterDelete,
  resolveHorizSwipe,
  navigationIndexAfterSwipe,
  showCounter,
  counterText,
  currentPhotoId,
  SWIPE_HORIZ_THRESHOLD,
} from "../lib/vineBlockLightboxHelpers";

// ===========================================================================
// 1. Single photo — all swipes snap (no navigation UI in vine-block lightbox)
// ===========================================================================

describe("single photo — no navigation possible", () => {
  it("swipe-left snaps back (no next photo)", () => {
    expect(resolveHorizSwipe(-(SWIPE_HORIZ_THRESHOLD + 1), SWIPE_HORIZ_THRESHOLD, 0, 1)).toBe("snap");
  });

  it("swipe-right snaps back (no previous photo)", () => {
    expect(resolveHorizSwipe(SWIPE_HORIZ_THRESHOLD + 1, SWIPE_HORIZ_THRESHOLD, 0, 1)).toBe("snap");
  });

  it("does not show the counter", () => {
    expect(showCounter(1)).toBe(false);
  });
});

// ===========================================================================
// 2. Delete last photo → lightbox should close (index -1)
// ===========================================================================

describe("clampIndexAfterDelete — delete last photo closes lightbox", () => {
  it("returns -1 (close signal) when the photos array is now empty", () => {
    expect(clampIndexAfterDelete(0, 0)).toBe(-1);
  });
});

// ===========================================================================
// 3. Delete a middle photo — index clamps to adjacent photo (stays open)
// ===========================================================================

describe("clampIndexAfterDelete — delete middle photo stays open on adjacent", () => {
  it("stays at the same index when a later photo is deleted (index < newLength)", () => {
    // 3 photos [A,B,C]; viewing A (index 0); C deleted → [A,B]; newLength=2
    expect(clampIndexAfterDelete(0, 2)).toBe(0);
  });

  it("clamps down when the current photo itself was deleted (index === newLength)", () => {
    // 3 photos [A,B,C]; viewing C (index 2); C deleted → [A,B]; newLength=2
    expect(clampIndexAfterDelete(2, 2)).toBe(1);
  });

  it("clamps down when deleted from the middle and index exceeds newLength", () => {
    // 5 photos; viewing index 4; 2 deleted → newLength=3
    expect(clampIndexAfterDelete(4, 3)).toBe(2);
  });

  it("stays at index 1 when at position 1 and list shrinks from 3 to 2", () => {
    // [A,B,C]; viewing B (index 1); A deleted → [B,C]; newLength=2; index 1 still valid
    expect(clampIndexAfterDelete(1, 2)).toBe(1);
  });
});

// ===========================================================================
// 4. Delete rightmost photo → index clamps down to new last photo
// ===========================================================================

describe("clampIndexAfterDelete — delete rightmost photo", () => {
  it("moves back to the new last photo when the current last photo is deleted", () => {
    // 4 photos [A,B,C,D]; viewing D (index 3); D deleted → [A,B,C]; newLength=3
    expect(clampIndexAfterDelete(3, 3)).toBe(2);
  });

  it("returns index 0 when only one photo remains after deletion", () => {
    // 2 photos [A,B]; viewing B (index 1); B deleted → [A]; newLength=1
    expect(clampIndexAfterDelete(1, 1)).toBe(0);
  });
});

// ===========================================================================
// 5 & 6. Swipe boundary blocking (vine-block equivalent of chevron visibility)
// ===========================================================================

describe("resolveHorizSwipe — right boundary (last photo, no swipe-left)", () => {
  it("snaps back at the last photo even on a strong swipe-left", () => {
    expect(resolveHorizSwipe(-200, SWIPE_HORIZ_THRESHOLD, 2, 3)).toBe("snap");
    expect(resolveHorizSwipe(-200, SWIPE_HORIZ_THRESHOLD, 4, 5)).toBe("snap");
  });
});

describe("resolveHorizSwipe — left boundary (first photo, no swipe-right)", () => {
  it("snaps back at the first photo even on a strong swipe-right", () => {
    expect(resolveHorizSwipe(200, SWIPE_HORIZ_THRESHOLD, 0, 3)).toBe("snap");
    expect(resolveHorizSwipe(200, SWIPE_HORIZ_THRESHOLD, 0, 5)).toBe("snap");
  });
});

// ===========================================================================
// 7. Navigation opens freely at an interior photo
// ===========================================================================

describe("resolveHorizSwipe — interior photo allows both directions", () => {
  it("navigates to next on a strong swipe-left from the middle", () => {
    const result = resolveHorizSwipe(-200, SWIPE_HORIZ_THRESHOLD, 1, 3);
    expect(result).toBe("next");
    expect(navigationIndexAfterSwipe(result, 1)).toBe(2);
  });

  it("navigates to previous on a strong swipe-right from the middle", () => {
    const result = resolveHorizSwipe(200, SWIPE_HORIZ_THRESHOLD, 1, 3);
    expect(result).toBe("prev");
    expect(navigationIndexAfterSwipe(result, 1)).toBe(0);
  });
});

// ===========================================================================
// 8. Counter text always reflects current position
// ===========================================================================

describe("showCounter / counterText", () => {
  it("hides counter for 0 photos", () => {
    expect(showCounter(0)).toBe(false);
  });

  it("hides counter for exactly 1 photo", () => {
    expect(showCounter(1)).toBe(false);
  });

  it("shows counter for 2+ photos", () => {
    expect(showCounter(2)).toBe(true);
    expect(showCounter(10)).toBe(true);
  });

  it("formats counter as '1 / N' for the first photo", () => {
    expect(counterText(0, 5)).toBe("1 / 5");
  });

  it("formats counter as 'N / N' for the last photo", () => {
    expect(counterText(4, 5)).toBe("5 / 5");
  });

  it("reflects the correct position at an interior index", () => {
    expect(counterText(2, 7)).toBe("3 / 7");
  });

  it("updates correctly after index clamp (delete last photo in list)", () => {
    // Was at index 4 of 5; photo deleted → clamp to 3 of 4
    const newIndex = clampIndexAfterDelete(4, 4);
    expect(counterText(newIndex, 4)).toBe("4 / 4");
  });
});

// ===========================================================================
// 9. Share / Delete target the currently displayed photo
//    (vine-block-photos.tsx delete handler uses currentPhotoId() to resolve)
// ===========================================================================

describe("currentPhotoId — always targets the displayed photo", () => {
  const photos = [
    { id: 101 },
    { id: 202 },
    { id: 303 },
  ];

  it("returns the id of the photo at currentIndex", () => {
    expect(currentPhotoId(photos, 0)).toBe(101);
    expect(currentPhotoId(photos, 1)).toBe(202);
    expect(currentPhotoId(photos, 2)).toBe(303);
  });

  it("returns the navigated-to photo id, not the originally tapped one", () => {
    // Grower taps photo at index 0 (id 101), then swipes to index 2 (id 303).
    // The delete handler must target 303, not 101.
    expect(currentPhotoId(photos, 0)).toBe(101); // stale tap index
    expect(currentPhotoId(photos, 2)).toBe(303); // correct target after swipe
  });

  it("returns null when the photos array is empty", () => {
    expect(currentPhotoId([], 0)).toBeNull();
  });

  it("returns null when index is out of range", () => {
    expect(currentPhotoId(photos, 5)).toBeNull();
  });

  it("returns the correct id after a delete clamps the index", () => {
    // 3 photos; user at 2; photo 303 deleted → newLength=2; clamp to 1 → id 202
    const newIndex = clampIndexAfterDelete(2, 2);
    expect(currentPhotoId(photos.slice(0, 2), newIndex)).toBe(202);
  });
});
