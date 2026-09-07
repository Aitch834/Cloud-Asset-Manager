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
    Modal: ({ visible, children, ...props }: Record<string, unknown>) =>
      visible ? React.createElement("Modal", props, children) : null,
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
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
  const { Text } = require("react-native");
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement(Text, props, name),
  };
});

jest.mock("expo-file-system/legacy", () => ({}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  let nextGestureId = 0;
  const makeGesture = () => {
    const gesture: Record<string, unknown> = { testGestureId: nextGestureId++ };
    for (const method of [
      "onBegin",
      "onStart",
      "onUpdate",
      "onEnd",
      "onFinalize",
      "activateAfterLongPress",
      "minDuration",
    ]) {
      gesture[method] = () => gesture;
    }
    gesture.numberOfTaps = () => gesture;
    return gesture;
  };
  return {
    Gesture: {
      Pinch: makeGesture,
      Pan: makeGesture,
      Tap: makeGesture,
      LongPress: makeGesture,
      Race: (_first: unknown, second: unknown) => second,
      Simultaneous: (primary: unknown) => primary,
    },
    GestureDetector: ({ children, gesture }: { children: React.ReactNode; gesture: unknown }) =>
      React.createElement(View, { testID: "vine-photo-gesture", gesture }, children),
    GestureHandlerRootView: View,
  };
});

jest.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: { View: require("react-native").View },
  runOnJS: (fn: unknown) => fn,
  useAnimatedStyle: jest.fn(() => ({})),
  useSharedValue: jest.fn((value: unknown) => ({ value })),
  withSpring: jest.fn((value: unknown) => value),
  withTiming: jest.fn((value: unknown) => value),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../components/VineBlockPicker", () => ({
  VineBlockPicker: () => null,
  BlockThumbnail: () => null,
}));
jest.mock("../components/ui/Button", () => ({ Button: () => null }));
jest.mock("../components/ui/EmptyState", () => ({ EmptyState: () => null }));
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({ user: { id: "user-1" } }),
}));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: jest.fn(),
  setCachedBlockCoverUrl: jest.fn(),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({ useFarmIdentifiers: jest.fn() }));
jest.mock("../lib/hooks/useUiPrefs", () => ({
  useUiPrefs: () => ({
    prefsReady: true,
    isHintDismissed: () => true,
    dismissHint: jest.fn(),
  }),
}));
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
  isAbortError: jest.fn(() => false),
}));
jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: jest.fn(),
  uploadPhotoToStorage: jest.fn(),
}));

import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Image } from "react-native";
import { PhotoLightbox } from "../app/vine-block-photos";

const expiredPhoto = {
  id: 101,
  blockId: 7,
  farmId: 3,
  objectPath: "vineyard/block-7/photo-101.jpg",
  fileName: "photo-101.jpg",
  caption: null,
  isCover: true,
  uploadedAt: "2026-09-01T10:00:00Z",
  downloadUrl: "https://cdn.example.com/expired.jpg",
};

const otherPhoto = {
  ...expiredPhoto,
  id: 102,
  objectPath: "vineyard/block-7/photo-102.jpg",
  fileName: "photo-102.jpg",
  isCover: false,
  downloadUrl: "https://cdn.example.com/other.jpg",
};

function lightboxProps(overrides: Record<string, unknown> = {}) {
  return {
    photos: [expiredPhoto],
    initialIndex: 0,
    visible: true,
    onClose: jest.fn(),
    onDelete: jest.fn(),
    onReorder: jest.fn(),
    onEditCaption: jest.fn(),
    onReload: jest.fn(),
    onSetCover: jest.fn(),
    ...overrides,
  };
}

function mainImage(screen: ReturnType<typeof render>) {
  return screen.UNSAFE_getAllByType(Image).find(
    (image) => image.props.resizeMode === "contain",
  )!;
}

describe("PhotoLightbox expired URL recovery", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("schedules exactly one delayed reload for the broken current photo", async () => {
    const onReload = jest.fn().mockResolvedValue(undefined);
    const screen = render(<PhotoLightbox {...lightboxProps({ onReload })} />);

    fireEvent(mainImage(screen), "error");
    fireEvent(mainImage(screen), "error");

    expect(onReload).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1999);
    });
    expect(onReload).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(onReload).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("renders the refreshed URL without the manual reload prompt", async () => {
    const onReload = jest.fn().mockResolvedValue(undefined);
    const props = lightboxProps({ onReload });
    const screen = render(<PhotoLightbox {...props} />);

    fireEvent(mainImage(screen), "error");
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    const freshPhoto = {
      ...expiredPhoto,
      downloadUrl: "https://cdn.example.com/refreshed.jpg",
    };
    screen.rerender(<PhotoLightbox {...props} photos={[freshPhoto]} />);

    expect(mainImage(screen).props.source).toEqual({ uri: freshPhoto.downloadUrl });
    expect(screen.queryByText("Tap to reload")).toBeNull();
  });

  it("keeps Tap to reload available when the automatic refresh fails", async () => {
    const onReload = jest
      .fn()
      .mockRejectedValueOnce(new Error("refresh failed"))
      .mockResolvedValueOnce(undefined);
    const screen = render(
      <PhotoLightbox {...lightboxProps({ onReload })} />,
    );

    fireEvent(mainImage(screen), "error");
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Tap to reload")).toBeTruthy();
    fireEvent.press(screen.getByText("Tap to reload"));
    expect(onReload).toHaveBeenCalledTimes(2);
  });

  it("cancels a pending reload when the lightbox closes", async () => {
    const onReload = jest.fn();
    const props = lightboxProps({ onReload });
    const screen = render(<PhotoLightbox {...props} />);

    fireEvent(mainImage(screen), "error");
    screen.rerender(<PhotoLightbox {...props} visible={false} />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(onReload).not.toHaveBeenCalled();
  });

  it("cancels the current photo timer when navigation changes the photo", async () => {
    const onReload = jest.fn();
    const props = lightboxProps({ photos: [expiredPhoto, otherPhoto], onReload });
    const screen = render(<PhotoLightbox {...props} />);

    fireEvent(mainImage(screen), "error");
    const otherThumbnail = screen.UNSAFE_getAllByType(Image).find(
      (image) => image.props.source?.uri === otherPhoto.downloadUrl,
    )!;
    fireEvent.press(otherThumbnail.parent!);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(onReload).not.toHaveBeenCalled();
  });
});