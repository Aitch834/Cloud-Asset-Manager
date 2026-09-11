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

import "./test-utils/vine-block-photos-screen-mocks";

// ---------------------------------------------------------------------------
// Module mock — hoisted by Babel before any imports execute.
// Manual factory prevents Jest from loading the real apiFetch module and its
// transitive React Native dependencies (expo-crypto via lib/database.ts).
// ---------------------------------------------------------------------------
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../lib/context/FarmContext", () => ({ useFarm: jest.fn() }));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: jest.fn(),
  setCachedBlockCoverUrl: jest.fn(),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({ useFarmIdentifiers: jest.fn() }));
jest.mock("../lib/hooks/useUiPrefs", () => ({ useUiPrefs: jest.fn() }));
jest.mock("../lib/uploadPhoto", () => ({
  uploadPhotoToStorage: jest.fn(),
  getApiBase: jest.fn(),
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
import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import VineBlockPhotosScreen from "../app/vine-block-photos";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useFarm } = require("../lib/context/FarmContext") as { useFarm: jest.Mock };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useApiVineBlocks } = require("../lib/hooks/useApiVineBlocks") as {
  useApiVineBlocks: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as {
  useFarmIdentifiers: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useUiPrefs } = require("../lib/hooks/useUiPrefs") as { useUiPrefs: jest.Mock };

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
  jest.clearAllMocks();
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

describe("VineBlockPhotosScreen — rendered Android caption failure", () => {
  it("keeps the sheet open with an inline error, then clears it and closes after retry", async () => {
    useFarm.mockReturnValue({
      currentFarm: { id: FARM_ID, name: "Test Farm" },
      user: { id: "test-user" },
    });
    useApiVineBlocks.mockReturnValue({
      blocks: [{
        id: BLOCK_ID,
        blockName: "North Block",
        blockRef: null,
        fieldParcelRef: null,
        variety: "Chardonnay",
        rootstock: null,
        areaHa: 1.2,
        numberOfVines: 1000,
        plantingStatus: "active",
        isActive: true,
        isOrganicBlock: false,
        coverPhotoUrl: null,
        photoCount: 1,
      }],
      loading: false,
    });
    useFarmIdentifiers.mockReturnValue({ address: "Test Farm Lane", loading: false });
    useUiPrefs.mockReturnValue({
      prefsReady: true,
      prefs: {},
      setPref: jest.fn(),
      isHintDismissed: () => true,
      dismissHint: jest.fn(),
    });

    let captionPatchAttempts = 0;
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockImplementation(
      async (url, options) => {
        if (options?.method === "PATCH" && url === EXPECTED_URL) {
          captionPatchAttempts++;
          return captionPatchAttempts === 1
            ? errorResponse(500)
            : okResponse({ id: PHOTO_ID, caption: "New caption" });
        }
        return okResponse({
        photos: [{
          id: PHOTO_ID,
          blockId: BLOCK_ID,
          farmId: FARM_ID,
          objectPath: "vineyard/block-7/photo-101.jpg",
          fileName: "photo-101.jpg",
          caption: "Old caption",
          isCover: true,
          uploadedAt: "2025-06-01T10:00:00Z",
          downloadUrl: "https://cdn.example.com/photo-101.jpg",
        }],
        });
      },
    );

    jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === "Edit Caption")?.onPress?.();
    });

    const screen = render(React.createElement(VineBlockPhotosScreen));
    fireEvent.press(screen.getByText("North Block"));
    const thumbnail = await screen.findByTestId(`vine-block-photo-${PHOTO_ID}`);
    fireEvent(thumbnail, "longPress");
    fireEvent(thumbnail, "pressOut");

    const input = await screen.findByPlaceholderText("e.g. Post-harvest Oct 2025");
    fireEvent.changeText(input, "New caption");
    await act(async () => {
      fireEvent.press(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(screen.getByText(CAPTION_SAVE_ERROR_MESSAGE)).toBeTruthy();
      expect(screen.getByText("Edit Caption")).toBeTruthy();
      expect(screen.getByText("Save").parent?.props.disabled).not.toBe(true);
      expect(captionPatchAttempts).toBe(1);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(captionPatchAttempts).toBe(2);
      expect(screen.queryByText(CAPTION_SAVE_ERROR_MESSAGE)).toBeNull();
      expect(screen.queryByText("Edit Caption")).toBeNull();
    });
  });
});

describe("VineBlockPhotosScreen — caption persistence after reopening", () => {
  it("shows the saved caption beneath the thumbnail and in the lightbox after a fresh gallery load", async () => {
    useFarm.mockReturnValue({
      currentFarm: { id: FARM_ID, name: "Test Farm" },
      user: { id: "test-user" },
    });
    useApiVineBlocks.mockReturnValue({
      blocks: [{
        id: BLOCK_ID,
        blockName: "North Block",
        blockRef: null,
        fieldParcelRef: null,
        variety: "Chardonnay",
        rootstock: null,
        areaHa: 1.2,
        numberOfVines: 1000,
        plantingStatus: "active",
        isActive: true,
        isOrganicBlock: false,
        coverPhotoUrl: null,
        photoCount: 1,
      }],
      loading: false,
    });
    useFarmIdentifiers.mockReturnValue({ address: "Test Farm Lane", loading: false });
    useUiPrefs.mockReturnValue({
      prefsReady: true,
      prefs: {},
      setPref: jest.fn(),
      isHintDismissed: () => true,
      dismissHint: jest.fn(),
    });

    const savedCaption = "Canopy trimmed after flowering";
    let serverCaption = "Before trimming";
    let photoListLoads = 0;
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockImplementation(
      async (url, options) => {
        if (options?.method === "PATCH" && url === EXPECTED_URL) {
          serverCaption = JSON.parse(options.body as string).caption;
          return okResponse({ id: PHOTO_ID, caption: serverCaption });
        }
        if (
          !options?.method
          && url === `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos`
        ) {
          photoListLoads++;
          return okResponse({
            photos: [{
              id: PHOTO_ID,
              blockId: BLOCK_ID,
              farmId: FARM_ID,
              objectPath: "vineyard/block-7/photo-101.jpg",
              fileName: "photo-101.jpg",
              caption: serverCaption,
              isCover: true,
              uploadedAt: "2025-06-01T10:00:00Z",
              downloadUrl: "https://cdn.example.com/photo-101.jpg",
            }],
          });
        }
        return errorResponse(404);
      },
    );

    jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === "Edit Caption")?.onPress?.();
    });

    const firstVisit = render(React.createElement(VineBlockPhotosScreen));
    fireEvent.press(firstVisit.getByText("North Block"));
    const firstThumbnail = await firstVisit.findByTestId(`vine-block-photo-${PHOTO_ID}`);
    fireEvent(firstThumbnail, "longPress");
    fireEvent(firstThumbnail, "pressOut");

    const input = await firstVisit.findByPlaceholderText("e.g. Post-harvest Oct 2025");
    fireEvent.changeText(input, savedCaption);
    await act(async () => {
      fireEvent.press(firstVisit.getByText("Save"));
    });
    await waitFor(() => {
      expect(firstVisit.getByText(savedCaption)).toBeTruthy();
      expect(serverCaption).toBe(savedCaption);
    });

    firstVisit.unmount();

    const reopened = render(React.createElement(VineBlockPhotosScreen));
    fireEvent.press(reopened.getByText("North Block"));

    const reopenedThumbnail = await reopened.findByTestId(`vine-block-photo-${PHOTO_ID}`);
    expect(reopened.getByText(savedCaption)).toBeTruthy();
    expect(photoListLoads).toBe(2);

    fireEvent.press(reopenedThumbnail);
    await waitFor(() => {
      expect(reopened.getAllByText(savedCaption)).toHaveLength(2);
    });
  });
});
