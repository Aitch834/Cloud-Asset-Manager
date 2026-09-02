/**
 * UI regression coverage for the spray diary history thumbnail retry control.
 *
 * The retry control is nested inside the thumbnail Pressable. It must consume
 * the press event so a retry does not also open the full-screen lightbox.
 */

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
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
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    FlatList: host("FlatList"),
    Image: host("Image"),
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal: host("Modal"),
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
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
  const ReactNative = require("react-native");
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement(ReactNative.Text, props, name),
  };
});

jest.mock("expo-file-system/legacy", () => ({}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Warning: "warning" },
}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("react-native-gesture-handler", () => ({
  Gesture: {},
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("react-native-reanimated", () => ({
  default: { View: "AnimatedView" },
  runOnJS: (fn: unknown) => fn,
  useAnimatedStyle: jest.fn(),
  useSharedValue: jest.fn(),
  withSpring: jest.fn(),
  withTiming: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../components/VineBlockPicker", () => ({ VineBlockPicker: () => null }));
jest.mock("../components/ui/Button", () => ({ Button: () => null }));
jest.mock("../components/ui/Input", () => ({ Input: () => null }));
jest.mock("../components/ui/IdentifierBanner", () => ({ IdentifierBanner: () => null }));
jest.mock("../lib/context/FarmContext", () => ({ useFarm: jest.fn() }));
jest.mock("../lib/hooks/useApiFetch", () => ({ useApiFetch: jest.fn() }));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({ useApiVineBlocks: jest.fn() }));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({ useFarmIdentifiers: jest.fn() }));
jest.mock("../lib/hooks/useIdentifierBannerDismiss", () => ({ useIdentifierBannerDismiss: jest.fn() }));
jest.mock("../lib/hooks/usePersistedBlockFilter", () => ({ usePersistedBlockFilter: jest.fn() }));
jest.mock("../lib/hooks/usePrint", () => ({ usePrint: jest.fn() }));
jest.mock("../lib/vineyardCountEvents", () => ({ vineyardCountEvents: {} }));
jest.mock("../lib/printTemplates", () => ({ vineSprayDiaryHtml: jest.fn() }));
jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: jest.fn(),
  pickPhoto: jest.fn(),
  uploadPhotoToStorage: jest.fn(),
}));
jest.mock("../lib/vineSprayDiaryLightboxHelpers", () => ({
  DIR_HORIZ: 1,
  DIR_NONE: 0,
  DIR_VERT: 2,
  MAX_SCALE: 4,
  MIN_SCALE: 1,
  SWIPE_DOWN_THRESHOLD: 80,
  SWIPE_HORIZ_THRESHOLD: 80,
  counterText: jest.fn(),
  showCounter: jest.fn(),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Image } from "react-native";
import { SprayPhotoThumbnail } from "../app/vine-spray-diary-history";

const photo = {
  id: 101,
  sprayDiaryId: 7,
  farmId: 3,
  objectPath: "spray-diary/photo-101.jpg",
  fileName: "photo-101.jpg",
  caption: null,
  sortOrder: 0,
  isCover: false,
  uploadedAt: "2026-09-02T10:00:00Z",
  downloadUrl: "https://cdn.example.com/expired-photo.jpg",
};

describe("SprayPhotoThumbnail — history retry control", () => {
  it("consumes retry taps instead of opening the lightbox", () => {
    const onPress = jest.fn();
    const onReload = jest.fn();
    const screen = render(
      <SprayPhotoThumbnail
        photo={photo}
        onPress={onPress}
        onDelete={jest.fn()}
        onEditCaption={jest.fn()}
        onReload={onReload}
        onShowTooltip={jest.fn()}
        onHideTooltip={jest.fn()}
      />,
    );

    const image = screen.UNSAFE_getByType(Image);
    fireEvent(image, "error");

    const retry = screen.getByText("Tap to reload");
    const stopPropagation = jest.fn();
    fireEvent(retry, "press", { stopPropagation });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });
});