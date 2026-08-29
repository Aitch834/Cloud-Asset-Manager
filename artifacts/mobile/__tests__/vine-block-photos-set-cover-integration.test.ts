/**
 * Integration coverage for the vine-block-photos "Set as Cover" action.
 *
 * The production executePhotoSetCover helper is exercised with apiFetch
 * mocked at the module boundary.  This models the stale-ID race where another
 * device deletes the photo before this device's PATCH arrives.
 */

// ---------------------------------------------------------------------------
// Module mock — prevents the test from loading apiFetch's React Native
// dependencies while still exercising the real production helper.
// ---------------------------------------------------------------------------
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};

import {
  executePhotoSetCover,
  type BlockPhotoRecord,
} from "../lib/vineBlockPhotosApi";

function makePhoto(overrides: Partial<BlockPhotoRecord> = {}): BlockPhotoRecord {
  return {
    id: 101,
    blockId: 7,
    farmId: 3,
    objectPath: "vineyard/block-7/photo-101.jpg",
    fileName: "photo-101.jpg",
    caption: null,
    isCover: false,
    uploadedAt: "2025-06-01T10:00:00Z",
    downloadUrl: "https://cdn.example.com/photo-101.jpg",
    ...overrides,
  };
}

function errorResponse(status = 404): Response {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

const FARM_ID = 3;
const BLOCK_ID = 7;
const PHOTO_ID = 101;
const EXPECTED_URL = `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos/${PHOTO_ID}`;

beforeEach(() => {
  (apiFetch as jest.MockedFunction<typeof apiFetch>).mockReset();
});

describe("executePhotoSetCover — stale deleted-photo PATCH", () => {
  it("leaves local photos unchanged and surfaces an error when the photo was deleted", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      errorResponse(404),
    );

    const initialPhotos = [
      makePhoto({ id: 100, isCover: true }),
      makePhoto({ id: PHOTO_ID, isCover: false }),
    ];
    let photosState = initialPhotos;
    const setPhotos = jest.fn(
      (updater: (photos: BlockPhotoRecord[]) => BlockPhotoRecord[]) => {
        photosState = updater(photosState);
      },
    );
    const showError = jest.fn();

    const result = await executePhotoSetCover(FARM_ID, BLOCK_ID, PHOTO_ID, {
      setPhotos,
      showError,
    });

    expect(result).toBe(false);
    expect(apiFetch).toHaveBeenCalledWith(EXPECTED_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCover: true }),
    });

    // A stale 404 must never optimistically promote the deleted photo.
    expect(setPhotos).not.toHaveBeenCalled();
    expect(photosState).toEqual(initialPhotos);
    expect(photosState.find((photo) => photo.id === PHOTO_ID)?.isCover).toBe(false);

    // The component wires this callback to Alert.alert for the grower.
    expect(showError).toHaveBeenCalledWith(
      "Could not set the cover photo. Please try again.",
    );
  });
});