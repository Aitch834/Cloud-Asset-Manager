/**
 * Integration tests for the single-photo URL refresh used by
 * VineBlockPhotosScreen.handleReload.
 *
 * The real executePhotoReload state machine is exercised with a mocked
 * apiFetch module.  This verifies the production orchestration rather than
 * reimplementing its state update in the test: target-only URL replacement,
 * failure feedback, and cleanup that clears the spinner/mutex for retries.
 */

// ---------------------------------------------------------------------------
// Module mock — hoisted by Babel before any imports execute.
// ---------------------------------------------------------------------------
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};

import {
  executePhotoReload,
  fetchBlockPhotoUrl,
  type BlockPhotoRecord,
  type PhotoReloadCallbacks,
} from "../lib/vineBlockPhotosApi";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makePhoto(
  id: number,
  downloadUrl: string | null,
): BlockPhotoRecord {
  return {
    id,
    blockId: 7,
    farmId: 3,
    objectPath: `vineyard/block-7/photo-${id}.jpg`,
    fileName: `photo-${id}.jpg`,
    caption: null,
    isCover: false,
    uploadedAt: "2025-06-01T10:00:00Z",
    downloadUrl,
  };
}

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function errorResponse(status = 500): Response {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as unknown as Response;
}

const FARM_ID = 3;
const BLOCK_ID = 7;
const TARGET_PHOTO_ID = 101;
const OTHER_PHOTO_ID = 102;
const RELOAD_URL =
  `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos/` +
  `${TARGET_PHOTO_ID}/url`;

function createReloadHarness(initialPhotos: BlockPhotoRecord[]) {
  let photos = initialPhotos;
  const reloadInFlightRef = { current: false };
  const setPhotos = jest.fn(
    (updater: (current: BlockPhotoRecord[]) => BlockPhotoRecord[]) => {
      photos = updater(photos);
    },
  );
  const setReloadingPhotoId = jest.fn<(photoId: number | null) => void>();
  const showReloadFailedAlert = jest.fn();
  const callbacks: PhotoReloadCallbacks = {
    setPhotos,
    setReloadingPhotoId,
    reloadInFlightRef,
    showReloadFailedAlert,
  };

  return {
    getPhotos: () => photos,
    callbacks,
    reloadInFlightRef,
    setPhotos,
    setReloadingPhotoId,
    showReloadFailedAlert,
  };
}

beforeEach(() => {
  (apiFetch as jest.MockedFunction<typeof apiFetch>).mockReset();
});

// ===========================================================================
// executePhotoReload — production handleReload state machine
// ===========================================================================

describe("executePhotoReload — handleReload refresh path", () => {
  it("patches only the requested photo with a fresh URL", async () => {
    const initialPhotos = [
      makePhoto(TARGET_PHOTO_ID, "https://cdn.example.com/expired-target.jpg"),
      makePhoto(OTHER_PHOTO_ID, "https://cdn.example.com/other.jpg"),
    ];
    const freshUrl = "https://cdn.example.com/refreshed-target.jpg";
    const harness = createReloadHarness(initialPhotos);

    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      okResponse({ downloadUrl: freshUrl }),
    );

    await executePhotoReload(
      FARM_ID,
      BLOCK_ID,
      TARGET_PHOTO_ID,
      harness.callbacks,
    );

    expect(harness.getPhotos()).toEqual([
      { ...initialPhotos[0], downloadUrl: freshUrl },
      initialPhotos[1],
    ]);
    expect(harness.getPhotos()[1]).toBe(initialPhotos[1]);
    expect(harness.setReloadingPhotoId).toHaveBeenNthCalledWith(
      1,
      TARGET_PHOTO_ID,
    );
    expect(harness.setReloadingPhotoId).toHaveBeenNthCalledWith(2, null);
    expect(harness.reloadInFlightRef.current).toBe(false);
    expect(harness.showReloadFailedAlert).not.toHaveBeenCalled();
    expect(apiFetch).toHaveBeenCalledWith(RELOAD_URL);
  });

  it("shows failure feedback and leaves state unchanged for a null URL", async () => {
    const initialPhotos = [
      makePhoto(TARGET_PHOTO_ID, "https://cdn.example.com/previous-target.jpg"),
      makePhoto(OTHER_PHOTO_ID, "https://cdn.example.com/other.jpg"),
    ];
    const harness = createReloadHarness(initialPhotos);

    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      okResponse({ downloadUrl: null }),
    );

    await executePhotoReload(
      FARM_ID,
      BLOCK_ID,
      TARGET_PHOTO_ID,
      harness.callbacks,
    );

    expect(harness.getPhotos()).toBe(initialPhotos);
    expect(harness.showReloadFailedAlert).toHaveBeenCalledTimes(1);
    expect(harness.setReloadingPhotoId).toHaveBeenLastCalledWith(null);
    expect(harness.reloadInFlightRef.current).toBe(false);
  });

  it("shows failure feedback and resets state for a non-2xx response", async () => {
    const initialPhotos = [
      makePhoto(TARGET_PHOTO_ID, "https://cdn.example.com/previous-target.jpg"),
    ];
    const harness = createReloadHarness(initialPhotos);

    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      errorResponse(404),
    );

    await executePhotoReload(
      FARM_ID,
      BLOCK_ID,
      TARGET_PHOTO_ID,
      harness.callbacks,
    );

    expect(harness.getPhotos()).toBe(initialPhotos);
    expect(harness.showReloadFailedAlert).toHaveBeenCalledTimes(1);
    expect(harness.setReloadingPhotoId).toHaveBeenLastCalledWith(null);
    expect(harness.reloadInFlightRef.current).toBe(false);
  });

  it("shows failure feedback, resets state, and permits retry after a network error", async () => {
    const initialPhotos = [
      makePhoto(TARGET_PHOTO_ID, "https://cdn.example.com/previous-target.jpg"),
      makePhoto(OTHER_PHOTO_ID, "https://cdn.example.com/other.jpg"),
    ];
    const freshUrl = "https://cdn.example.com/retried-target.jpg";
    const harness = createReloadHarness(initialPhotos);

    (apiFetch as jest.MockedFunction<typeof apiFetch>)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(okResponse({ downloadUrl: freshUrl }));

    await executePhotoReload(
      FARM_ID,
      BLOCK_ID,
      TARGET_PHOTO_ID,
      harness.callbacks,
    );

    expect(harness.getPhotos()).toBe(initialPhotos);
    expect(harness.showReloadFailedAlert).toHaveBeenCalledTimes(1);
    expect(harness.reloadInFlightRef.current).toBe(false);
    expect(harness.setReloadingPhotoId).toHaveBeenNthCalledWith(
      2,
      null,
    );

    // A stuck mutex or spinner would prevent this second production reload.
    await executePhotoReload(
      FARM_ID,
      BLOCK_ID,
      TARGET_PHOTO_ID,
      harness.callbacks,
    );

    expect(harness.getPhotos()[0].downloadUrl).toBe(freshUrl);
    expect(harness.getPhotos()[1]).toBe(initialPhotos[1]);
    expect(harness.showReloadFailedAlert).toHaveBeenCalledTimes(1);
    expect(harness.reloadInFlightRef.current).toBe(false);
    expect(harness.setReloadingPhotoId).toHaveBeenLastCalledWith(null);
  });
});

describe("fetchBlockPhotoUrl — HTTP error contract", () => {
  it("returns null for a non-2xx response", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      errorResponse(500),
    );

    await expect(
      fetchBlockPhotoUrl(FARM_ID, BLOCK_ID, TARGET_PHOTO_ID),
    ).resolves.toBeNull();
  });
});