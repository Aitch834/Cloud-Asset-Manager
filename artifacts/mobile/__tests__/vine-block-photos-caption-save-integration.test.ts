/**
 * Integration tests for the vine-block-photos caption-save flow.
 *
 * These tests cover the boundary between the caption sheet and the server via
 * the production `patchPhotoCaption` helper extracted from handleSaveCaption
 * in app/vine-block-photos.tsx.
 *
 * Pattern mirrors vine-block-photos-delete-warning-integration.test.ts:
 * the apiFetch module is mocked at the module level; the real production
 * function (patchPhotoCaption from lib/vineBlockPhotosApi) is imported and
 * exercised directly, so any regression in the actual helper is caught.
 *
 * The tests assert the discriminated-union result that handleSaveCaption
 * branches on to decide whether to close the caption sheet:
 *   { ok: true }  → component calls setCaptionPhoto(null) — sheet closes
 *   { ok: false } → component does NOT call setCaptionPhoto(null) — sheet
 *                   stays open and shows an error to the grower
 */

// ---------------------------------------------------------------------------
// Module mock — hoisted by Babel before any imports execute.
// Manual factory prevents Jest from loading the real apiFetch module and its
// transitive React Native dependencies (expo-crypto via lib/database.ts).
// ---------------------------------------------------------------------------
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};

import { patchPhotoCaption } from "../lib/vineBlockPhotosApi";
import {
  CAPTION_SAVE_ERROR_MESSAGE,
  handleCaptionSaveFailure,
} from "../lib/vineBlockPhotosHelpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function okResponse(payload: unknown = {}): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function errorResponse(status = 404): Response {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FARM_ID = 3;
const BLOCK_ID = 7;
const PHOTO_ID = 101;
const EXPECTED_URL = `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos/${PHOTO_ID}`;

beforeEach(() => {
  (apiFetch as jest.MockedFunction<typeof apiFetch>).mockReset();
});

// ===========================================================================
// patchPhotoCaption — the production helper handleSaveCaption delegates to
// ===========================================================================

describe("patchPhotoCaption — caption-save PATCH result (API-sync layer)", () => {
  // -------------------------------------------------------------------------
  // 1. Happy path — server accepts the save
  //    handleSaveCaption branches on result.ok === true → closes sheet
  // -------------------------------------------------------------------------
  it("returns ok:true and the trimmed caption when PATCH succeeds", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      okResponse({ id: PHOTO_ID, caption: "Post-harvest Oct 2025" }),
    );

    const result = await patchPhotoCaption(FARM_ID, BLOCK_ID, PHOTO_ID, "Post-harvest Oct 2025");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trimmedCaption).toBe("Post-harvest Oct 2025");
    }

    // Correct endpoint and method used
    expect(apiFetch).toHaveBeenCalledWith(
      EXPECTED_URL,
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  // -------------------------------------------------------------------------
  // 2. Whitespace-only caption — trimmed to null
  //    handleSaveCaption must store null, not a blank string
  // -------------------------------------------------------------------------
  it("stores null (not blank string) when the grower saves whitespace-only text", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(okResponse());

    const result = await patchPhotoCaption(FARM_ID, BLOCK_ID, PHOTO_ID, "   ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trimmedCaption).toBeNull();
    }

    // null sent in the request body
    const callBody = JSON.parse(
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mock.calls[0][1]!.body as string,
    );
    expect(callBody.caption).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 3. Stale-ID failure — photo was concurrently deleted (404)
  //    result.ok === false → handleSaveCaption does NOT close the sheet
  // -------------------------------------------------------------------------
  it("returns ok:false when PATCH returns 404 (concurrent delete)", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      errorResponse(404),
    );

    const result = await patchPhotoCaption(FARM_ID, BLOCK_ID, PHOTO_ID, "New caption");

    // ok:false means the component must NOT call setCaptionPhoto(null)
    expect(result.ok).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 4. Server error — 500 response
  //    result.ok === false → sheet stays open
  // -------------------------------------------------------------------------
  it("returns ok:false when PATCH returns 500", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      errorResponse(500),
    );

    const result = await patchPhotoCaption(FARM_ID, BLOCK_ID, PHOTO_ID, "My caption");

    expect(result.ok).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 5. Network failure — apiFetch rejects
  //    result.ok === false → sheet stays open, error surfaced
  // -------------------------------------------------------------------------
  it("returns ok:false when apiFetch throws (network error)", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const result = await patchPhotoCaption(FARM_ID, BLOCK_ID, PHOTO_ID, "Caption");

    expect(result.ok).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 6. Correct URL construction — photoId comes from the live captionPhoto
  //    state, not a stale closed-over value
  // -------------------------------------------------------------------------
  it("constructs the URL from the supplied farmId, blockId, and photoId", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(okResponse());

    await patchPhotoCaption(FARM_ID, BLOCK_ID, PHOTO_ID, "Caption");

    const calledUrl = (apiFetch as jest.MockedFunction<typeof apiFetch>).mock.calls[0][0];
    expect(calledUrl).toBe(EXPECTED_URL);
  });

  // -------------------------------------------------------------------------
  // 7. Empty-string caption trimmed to null
  //    Guards the edge case where the grower clears the field entirely
  // -------------------------------------------------------------------------
  it("treats an empty string the same as whitespace — stores null", async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(okResponse());

    const result = await patchPhotoCaption(FARM_ID, BLOCK_ID, PHOTO_ID, "");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trimmedCaption).toBeNull();
    }
  });
});

// ===========================================================================
// Platform-specific failure feedback
// ===========================================================================

describe("handleCaptionSaveFailure — platform feedback", () => {
  it("keeps iOS Alert.prompt users informed with an alert", () => {
    const setInlineError = jest.fn();
    const showAlert = jest.fn();

    handleCaptionSaveFailure("ios", setInlineError, showAlert);

    expect(showAlert).toHaveBeenCalledWith("Error", CAPTION_SAVE_ERROR_MESSAGE);
    expect(setInlineError).not.toHaveBeenCalled();
  });

  it("shows the failure inline for the caption sheet on Android", () => {
    const setInlineError = jest.fn();
    const showAlert = jest.fn();

    handleCaptionSaveFailure("android", setInlineError, showAlert);

    expect(setInlineError).toHaveBeenCalledWith(CAPTION_SAVE_ERROR_MESSAGE);
    expect(showAlert).not.toHaveBeenCalled();
  });
});
