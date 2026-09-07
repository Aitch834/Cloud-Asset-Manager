/**
 * Regression coverage for the scouting lightbox Cover action.
 *
 * This renders the real lightbox button and uses the production request/state
 * helper so the test protects the visible action, PATCH payload, local
 * single-cover invariant, and failure feedback together.
 */

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const flatten = (style: unknown): Record<string, unknown> => {
    if (!Array.isArray(style)) return (style as Record<string, unknown>) ?? {};
    return style.reduce(
      (merged, item) => ({ ...merged, ...flatten(item) }),
      {} as Record<string, unknown>,
    );
  };
  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    FlatList: host("FlatList"),
    Image: host("Image"),
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal: ({ visible, children }: { visible: boolean; children: React.ReactNode }) =>
      visible ? React.createElement("Modal", null, children) : null,
    PanResponder: { create: () => ({ panHandlers: {} }) },
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    StatusBar: host("StatusBar"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text: host("Text"),
    TextInput: host("TextInput"),
    View: host("View"),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return { Feather: (props: Record<string, unknown>) => React.createElement("Feather", props) };
});
jest.mock("expo-file-system/legacy", () => ({}));
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-router", () => ({ useFocusEffect: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: jest.fn(),
  pickPhoto: jest.fn(),
  uploadPhotoToStorage: jest.fn(),
}));
jest.mock("../lib/scoutingLightboxHelpers", () => ({
  getSwipeDirection: jest.fn(() => null),
  shouldAllowSwipe: jest.fn(() => false),
  getPaginationItems: jest.fn((photosCount: number) =>
    Array.from({ length: photosCount }, (_, index) => index),
  ),
  isPaginationItemActive: jest.fn((item: number, currentIndex: number) => item === currentIndex),
  scheduleScoutingPhotoAutoRetry: jest.fn(),
  updatePhotoCaption: jest.fn(),
}));

import React, { useState } from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import type { ScoutingPhoto } from "../components/ScoutingPhotoSection";
import { ScoutingPhotoLightbox } from "../components/ScoutingPhotoSection";
import { executeScoutingPhotoSetCover } from "../lib/scoutingPhotosApi";

const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};

const FARM_ID = 7;
const SCOUTING_ID = 42;

function okResponse(): Response {
  return { ok: true, status: 200, json: async () => ({}) } as unknown as Response;
}

function errorResponse(status = 422): Response {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

function makePhoto(id: number, isCover: boolean): ScoutingPhoto {
  return {
    id,
    scoutingId: SCOUTING_ID,
    farmId: FARM_ID,
    objectPath: `vineyard/scouting/photo-${id}.jpg`,
    fileName: `photo-${id}.jpg`,
    caption: null,
    sortOrder: id,
    isCover,
    uploadedAt: "2026-09-07T09:00:00Z",
    downloadUrl: `https://cdn.example.test/photo-${id}.jpg`,
  };
}

function CoverActionHarness({ initialPhotos }: { initialPhotos: ScoutingPhoto[] }) {
  const [photos, setPhotos] = useState(initialPhotos);

  const handleSetCover = async (photo: ScoutingPhoto): Promise<void> => {
    await executeScoutingPhotoSetCover(FARM_ID, SCOUTING_ID, photo.id, {
      setPhotos,
      showError: (message) => Alert.alert("Error", message),
    });
  };

  return (
    <ScoutingPhotoLightbox
      photos={photos}
      initialIndex={1}
      visible
      onClose={jest.fn()}
      onDelete={jest.fn()}
      onSetCover={handleSetCover}
    />
  );
}

beforeEach(() => {
  apiFetch.mockReset();
  (Alert.alert as jest.Mock).mockReset();
});

describe("scouting lightbox Cover action", () => {
  it("PATCHes a non-cover photo and makes it the only local cover", async () => {
    apiFetch.mockResolvedValueOnce(okResponse());
    const screen = render(
      <CoverActionHarness
        initialPhotos={[makePhoto(101, true), makePhoto(202, false)]}
      />,
    );

    expect(screen.getByText("Cover")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText("Cover"));
    });

    expect(apiFetch).toHaveBeenCalledWith(
      `/api/farms/${FARM_ID}/vineyard-scouting/${SCOUTING_ID}/photos/202`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCover: true }),
      },
    );
    await waitFor(() =>
      expect(screen.getByTestId("scouting-photo-dot-1").props.accessibilityState).toEqual({
        selected: true,
      }),
    );
    expect(screen.getByText("★")).toBeTruthy();
    expect(screen.queryByText("Cover")).toBeNull();

    fireEvent.press(screen.getByTestId("scouting-photo-dot-0"));
    expect(screen.queryByText("★")).toBeNull();

    fireEvent.press(screen.getByTestId("scouting-photo-dot-1"));
    expect(screen.getByText("★")).toBeTruthy();
  });

  it("keeps the existing cover and shows feedback when the PATCH fails", async () => {
    apiFetch.mockResolvedValueOnce(errorResponse());
    const screen = render(
      <CoverActionHarness
        initialPhotos={[makePhoto(101, true), makePhoto(202, false)]}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByText("Cover"));
    });

    expect(screen.queryByText("★")).toBeNull();
    expect(screen.getByText("Cover")).toBeTruthy();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Could not set the cover photo. Please try again.",
    );
  });

  it("keeps the existing cover and shows network feedback when the PATCH rejects", async () => {
    apiFetch.mockRejectedValueOnce(new TypeError("Network request failed"));
    const screen = render(
      <CoverActionHarness
        initialPhotos={[makePhoto(101, true), makePhoto(202, false)]}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByText("Cover"));
    });

    expect(screen.queryByText("★")).toBeNull();
    expect(screen.getByText("Cover")).toBeTruthy();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Could not set the cover photo.",
    );
  });
});