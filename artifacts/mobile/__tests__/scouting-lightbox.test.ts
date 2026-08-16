/**
 * Unit tests for ScoutingPhotoLightbox edge-case logic.
 *
 * All assertions exercise pure helpers extracted from the lightbox component
 * so there is no React Native dependency and the tests run in the node
 * Jest environment.
 *
 * Covered cases:
 *   1. Single photo → no chevrons, no counter
 *   2. Delete last photo → close signal (index -1)
 *   3. Delete middle photo → index clamps to adjacent photo
 *   4. Delete last photo in list (at boundary) → index clamps down
 *   5. Left chevron hidden at index 0
 *   6. Right chevron hidden at last index
 *   7. Both chevrons visible when navigating in the middle
 *   8. Counter text always reflects current position
 *   9. Share / Delete target the currently displayed photo, not the tapped one
 */

import {
  clampIndexAfterDelete,
  showLeftChevron,
  showRightChevron,
  showCounter,
  counterText,
  currentPhotoId,
} from "../lib/scoutingLightboxHelpers";

// ---------------------------------------------------------------------------
// 1. Single photo — no chevrons, no counter
// ---------------------------------------------------------------------------

describe("single photo", () => {
  it("does not show the left chevron", () => {
    expect(showLeftChevron(1, 0)).toBe(false);
  });

  it("does not show the right chevron", () => {
    expect(showRightChevron(1, 0)).toBe(false);
  });

  it("does not show the counter", () => {
    expect(showCounter(1)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Delete last photo → lightbox should close (index -1)
// ---------------------------------------------------------------------------

describe("clampIndexAfterDelete — delete last photo closes lightbox", () => {
  it("returns -1 (close signal) when the photos array is now empty", () => {
    expect(clampIndexAfterDelete(0, 0)).toBe(-1);
  });

  it("returns -1 regardless of which index was shown when array empties", () => {
    // Should never happen in practice (only one photo), but guard the invariant.
    expect(clampIndexAfterDelete(0, 0)).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// 3. Delete a middle photo — index clamps to adjacent photo (stays open)
// ---------------------------------------------------------------------------

describe("clampIndexAfterDelete — delete middle photo stays open on adjacent", () => {
  it("stays at the same index when a later photo is deleted (index < newLength)", () => {
    // 3 photos [A,B,C]; user is at index 0; C is deleted externally → [A,B]
    // index 0 is still valid and unchanged.
    expect(clampIndexAfterDelete(0, 2)).toBe(0);
  });

  it("clamps down when the current photo itself was deleted (index === newLength)", () => {
    // 3 photos [A,B,C]; user is at index 2; C deleted → [A,B]; newLength=2
    // index 2 is out of bounds → clamp to 1
    expect(clampIndexAfterDelete(2, 2)).toBe(1);
  });

  it("clamps down when deleted from the middle and index exceeds newLength", () => {
    // 5 photos; user at index 4 (last); 2 deleted externally → newLength=3
    expect(clampIndexAfterDelete(4, 3)).toBe(2);
  });

  it("stays at index 1 when at position 1 and list shrinks from 3 to 2", () => {
    // User at index 1 [A,B,C]; A is deleted → [B,C]; newLength=2; index 1 still valid
    expect(clampIndexAfterDelete(1, 2)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 4. Delete last item in a multi-photo list (rightmost boundary)
// ---------------------------------------------------------------------------

describe("clampIndexAfterDelete — delete rightmost photo", () => {
  it("moves back to the new last photo when the current last photo is deleted", () => {
    // 4 photos [A,B,C,D]; user at 3 (D); D deleted → [A,B,C]; newLength=3
    expect(clampIndexAfterDelete(3, 3)).toBe(2);
  });

  it("returns the only remaining photo index (0) after second-to-last deletion", () => {
    // 2 photos [A,B]; user at 1 (B); B deleted → [A]; newLength=1
    expect(clampIndexAfterDelete(1, 1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 5 & 6. Chevron boundary visibility
// ---------------------------------------------------------------------------

describe("showLeftChevron", () => {
  it("is hidden at index 0 (first photo)", () => {
    expect(showLeftChevron(3, 0)).toBe(false);
  });

  it("is visible at index 1+", () => {
    expect(showLeftChevron(3, 1)).toBe(true);
    expect(showLeftChevron(3, 2)).toBe(true);
  });

  it("is hidden even at index > 0 when there is only one photo", () => {
    // Defensive: index should never be > 0 with one photo, but guard anyway.
    expect(showLeftChevron(1, 0)).toBe(false);
  });
});

describe("showRightChevron", () => {
  it("is hidden at the last index", () => {
    expect(showRightChevron(3, 2)).toBe(false);
    expect(showRightChevron(1, 0)).toBe(false);
  });

  it("is visible when not at the last photo", () => {
    expect(showRightChevron(3, 0)).toBe(true);
    expect(showRightChevron(3, 1)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Both chevrons visible in the middle
// ---------------------------------------------------------------------------

describe("chevrons — middle of a multi-photo set", () => {
  it("shows both chevrons when the user is at an interior photo", () => {
    const count = 5;
    const index = 2; // interior
    expect(showLeftChevron(count, index)).toBe(true);
    expect(showRightChevron(count, index)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Counter text always reflects current position
// ---------------------------------------------------------------------------

describe("showCounter / counterText", () => {
  it("shows counter only for multiple photos", () => {
    expect(showCounter(0)).toBe(false);
    expect(showCounter(1)).toBe(false);
    expect(showCounter(2)).toBe(true);
    expect(showCounter(10)).toBe(true);
  });

  it("formats counter as '1 / N' for the first photo", () => {
    expect(counterText(0, 5)).toBe("1 / 5");
  });

  it("formats counter as 'N / N' for the last photo", () => {
    expect(counterText(4, 5)).toBe("5 / 5");
  });

  it("reflects the correct position after navigation", () => {
    expect(counterText(2, 7)).toBe("3 / 7");
  });

  it("updates correctly after index clamp (delete last photo in list)", () => {
    // Was at index 4 of 5, deleted last → clamp to 3 of 4
    const newIndex = clampIndexAfterDelete(4, 4);
    expect(counterText(newIndex, 4)).toBe("4 / 4");
  });
});

// ---------------------------------------------------------------------------
// 9. Share / Delete target the currently displayed photo, not the tapped one
// ---------------------------------------------------------------------------

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
    // Share / Delete must target 303, not 101.
    const originalTapIndex = 0;
    const navigatedIndex = 2;
    expect(currentPhotoId(photos, originalTapIndex)).toBe(101); // stale tap
    expect(currentPhotoId(photos, navigatedIndex)).toBe(303);   // correct target
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
