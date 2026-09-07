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
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-router", () => ({ useFocusEffect: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("../lib/apiFetch", () => ({ apiFetch: jest.fn(), isAbortError: jest.fn() }));
jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: jest.fn(),
  pickPhoto: jest.fn(),
  uploadPhotoToStorage: jest.fn(),
}));
jest.mock("../lib/scoutingPhotosApi", () => ({ fetchScoutingPhotoUrl: jest.fn() }));

import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Image } from "react-native";
import {
  ScoutingPhotoLightbox,
  type ScoutingPhoto,
} from "../components/ScoutingPhotoSection";

function photo(id: number): ScoutingPhoto {
  return {
    id,
    scoutingId: 10,
    farmId: 20,
    objectPath: `scouting/${id}.jpg`,
    fileName: `${id}.jpg`,
    caption: null,
    sortOrder: id,
    isCover: id === 101,
    uploadedAt: "2026-09-07T09:00:00Z",
    downloadUrl: `https://cdn.example.test/${id}.jpg`,
  };
}

function displayedImage(screen: ReturnType<typeof render>) {
  return screen.UNSAFE_getAllByType(Image).find(
    (image) => image.props.resizeMode === "contain",
  )!;
}

describe("ScoutingPhotoLightbox retry allowance after navigation", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("retries the next photo after the first photo used its retry", async () => {
    const onReload = jest.fn().mockResolvedValue(undefined);
    const screen = render(
      <ScoutingPhotoLightbox
        photos={[photo(101), photo(202)]}
        initialIndex={0}
        visible
        onClose={jest.fn()}
        onDelete={jest.fn()}
        onReload={onReload}
      />,
    );

    fireEvent(displayedImage(screen), "error");
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(onReload).toHaveBeenLastCalledWith(101);

    fireEvent.press(screen.getByTestId("scouting-photo-next"));
    fireEvent(displayedImage(screen), "error");
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(onReload).toHaveBeenCalledTimes(2);
    expect(onReload).toHaveBeenLastCalledWith(202);
  });
});