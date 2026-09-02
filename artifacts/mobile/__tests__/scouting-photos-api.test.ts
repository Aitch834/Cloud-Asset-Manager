/**
 * Integration coverage for the scouting photo single-URL refresh helper.
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
  const View = host("View");
  const Text = host("Text");
  const Pressable = host("Pressable");
  const Image = host("Image");
  const KeyboardAvoidingView = host("KeyboardAvoidingView");
  const ActivityIndicator = host("ActivityIndicator");
  const TextInput = host("TextInput");
  const Modal = ({ visible, children, ...props }: Record<string, unknown>) =>
    visible ? React.createElement("Modal", props, children) : null;
  const FlatList = ({
    data,
    renderItem,
    ListEmptyComponent,
    ...props
  }: {
    data: unknown[];
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement(
      View,
      props,
      data.length
        ? data.map((item, index) =>
            React.createElement(
              React.Fragment,
              { key: index },
              renderItem({ item, index }),
            ),
          )
        : ListEmptyComponent,
    );
  return {
    ActivityIndicator,
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    PanResponder: {
      create: () => ({ panHandlers: {} }),
    },
    Platform: { OS: "android" },
    Pressable,
    StatusBar: host("StatusBar"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text,
    TextInput,
    View,
  };
});

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  downloadAsync: jest.fn(),
}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Warning: "warning" },
}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement(ReactNative.Text, props, name),
  };
});
jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: jest.fn(() => "https://api.example.test"),
  pickPhoto: jest.fn(),
  uploadPhotoToStorage: jest.fn(),
}));
jest.mock("../lib/scoutingLightboxHelpers", () => ({
  getSwipeDirection: jest.fn(() => null),
  shouldAllowSwipe: jest.fn(() => false),
  getPaginationItems: jest.fn(() => []),
  isPaginationItemActive: jest.fn(() => false),
  scheduleScoutingPhotoAutoRetry: jest.fn(),
  updatePhotoCaption: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};

import React from "react";
import { ActivityIndicator, Alert, Image } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import {
  ScoutingPhotoSection,
  type ScoutingPhoto,
} from "../components/ScoutingPhotoSection";
import { fetchScoutingPhotoUrl } from "../lib/scoutingPhotosApi";

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function errorResponse(status = 404): Response {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

const FARM_ID = 5;
const SCOUTING_ID = 12;
const PHOTO_ID = 34;
const EXPECTED_URL =
  `/api/farms/${FARM_ID}/vineyard-scouting/${SCOUTING_ID}/photos/${PHOTO_ID}/url`;

function makePhoto(downloadUrl: string | null): ScoutingPhoto {
  return {
    id: PHOTO_ID,
    scoutingId: SCOUTING_ID,
    farmId: FARM_ID,
    objectPath: `vineyard/scouting/photo-${PHOTO_ID}.jpg`,
    fileName: `photo-${PHOTO_ID}.jpg`,
    caption: null,
    sortOrder: 0,
    isCover: false,
    uploadedAt: "2026-08-29T10:00:00Z",
    downloadUrl,
  };
}

beforeEach(() => {
  apiFetch.mockReset();
  (Alert.alert as jest.Mock).mockReset();
});

describe("fetchScoutingPhotoUrl", () => {
  it("requests the single-photo URL endpoint and returns the fresh URL", async () => {
    apiFetch.mockResolvedValueOnce(
      okResponse({ downloadUrl: "https://cdn.example.com/fresh.jpg" }),
    );

    await expect(
      fetchScoutingPhotoUrl(FARM_ID, SCOUTING_ID, PHOTO_ID),
    ).resolves.toBe("https://cdn.example.com/fresh.jpg");
    expect(apiFetch).toHaveBeenCalledWith(EXPECTED_URL);
  });

  it("returns null for an unsuccessful response", async () => {
    apiFetch.mockResolvedValueOnce(errorResponse(404));

    await expect(
      fetchScoutingPhotoUrl(FARM_ID, SCOUTING_ID, PHOTO_ID),
    ).resolves.toBeNull();
  });

  it("returns null when the network request fails", async () => {
    apiFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      fetchScoutingPhotoUrl(FARM_ID, SCOUTING_ID, PHOTO_ID),
    ).resolves.toBeNull();
  });
});

describe("ScoutingPhotoSection reload failure feedback", () => {
  it("alerts on a rejected reload and allows the thumbnail to be retried", async () => {
    const freshUrl = "https://cdn.example.com/retried.jpg";
    apiFetch
      .mockResolvedValueOnce(okResponse({ photos: [makePhoto("https://cdn.example.com/broken.jpg")] }))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(okResponse({ downloadUrl: freshUrl }));

    const screen = render(
      React.createElement(ScoutingPhotoSection, {
        farmId: FARM_ID,
        scoutingId: SCOUTING_ID,
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`scouting-photo-${PHOTO_ID}`)).toBeTruthy();
    });

    fireEvent(screen.UNSAFE_getByType(Image), "error");
    fireEvent.press(screen.getByText("Tap to reload"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Reload Failed",
        "Could not reload photo. Please check your connection and try again.",
      );
      expect(screen.UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(0);
    });

    fireEvent.press(screen.getByText("Tap to reload"));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenNthCalledWith(
        3,
        EXPECTED_URL,
      );
      expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: freshUrl });
    });
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });
});