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
    FlatList: ({
      data = [],
      renderItem,
      ListEmptyComponent,
      ...props
    }: {
      data?: unknown[];
      renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode;
      [key: string]: unknown;
    }) =>
      React.createElement(
        "FlatList",
        props,
        data.length && renderItem
          ? data.map((item, index) =>
              React.createElement(React.Fragment, { key: index }, renderItem({ item, index })),
            )
          : ListEmptyComponent,
      ),
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
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Warning: "warning" },
}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  const makeGesture = () => {
    const gesture: Record<string, unknown> = {};
    let onBegin: ((...args: unknown[]) => void) | undefined;
    let onUpdate: ((...args: unknown[]) => void) | undefined;
    let onEnd: ((...args: unknown[]) => void) | undefined;
    gesture.onBegin = (callbackOrEvent?: ((...args: unknown[]) => void) | unknown, ...args: unknown[]) => {
      if (typeof callbackOrEvent === "function") onBegin = callbackOrEvent;
      else onBegin?.(callbackOrEvent, ...args);
      return gesture;
    };
    gesture.onUpdate = (callbackOrEvent: ((...args: unknown[]) => void) | unknown, ...args: unknown[]) => {
      if (typeof callbackOrEvent === "function") onUpdate = callbackOrEvent;
      else onUpdate?.(callbackOrEvent, ...args);
      return gesture;
    };
    gesture.onEnd = (callbackOrEvent: ((...args: unknown[]) => void) | unknown, ...args: unknown[]) => {
      if (typeof callbackOrEvent === "function") onEnd = callbackOrEvent;
      else onEnd?.(callbackOrEvent, ...args);
      return gesture;
    };
    gesture.numberOfTaps = () => gesture;
    return gesture;
  };

  return {
    Gesture: {
      Pinch: makeGesture,
      Pan: makeGesture,
      Tap: makeGesture,
      Race: (_doubleTap: unknown, pan: unknown) => pan,
      Simultaneous: (primary: unknown) => primary,
    },
    GestureDetector: ({ children, gesture }: { children: React.ReactNode; gesture: unknown }) =>
      React.createElement(ReactNative.View, { testID: "spray-lightbox-gesture", gesture }, children),
    GestureHandlerRootView: ReactNative.View,
  };
});
jest.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: { View: require("react-native").View },
  runOnJS: (fn: unknown) => fn,
  useAnimatedStyle: jest.fn(() => ({})),
  useSharedValue: jest.fn((value: unknown) => ({ value })),
  withSpring: jest.fn((value: unknown) => value),
  withTiming: jest.fn((value: unknown, _config: unknown, callback?: () => void) => {
    callback?.();
    return value;
  }),
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
  counterText: jest.fn((index: number, count: number) => `${index + 1} / ${count}`),
  showCounter: jest.fn((count: number) => count > 1),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert, Image } from "react-native";
import {
  default as VineSprayDiaryHistoryScreen,
  SprayPhotoLightbox,
  SprayPhotoThumbnail,
} from "../app/vine-spray-diary-history";

const { useFarm } = require("../lib/context/FarmContext") as { useFarm: jest.Mock };
const { useApiFetch } = require("../lib/hooks/useApiFetch") as { useApiFetch: jest.Mock };
const { useApiVineBlocks } = require("../lib/hooks/useApiVineBlocks") as { useApiVineBlocks: jest.Mock };
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as { useFarmIdentifiers: jest.Mock };
const { useIdentifierBannerDismiss } = require("../lib/hooks/useIdentifierBannerDismiss") as {
  useIdentifierBannerDismiss: jest.Mock;
};
const { usePersistedBlockFilter } = require("../lib/hooks/usePersistedBlockFilter") as {
  usePersistedBlockFilter: jest.Mock;
};
const { usePrint } = require("../lib/hooks/usePrint") as { usePrint: jest.Mock };
const { apiFetch } = require("../lib/apiFetch") as { apiFetch: jest.Mock };
const { pickPhoto, uploadPhotoToStorage } = require("../lib/uploadPhoto") as {
  pickPhoto: jest.Mock;
  uploadPhotoToStorage: jest.Mock;
};

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


describe("SprayPhotoLightbox cover badge", () => {
  it("hides the badge after swiping to a non-cover photo and restores it when swiping back", () => {
    const screen = render(
      <SprayPhotoLightbox
        photos={[
          { ...photo, id: 101, isCover: true },
          { ...photo, id: 102, isCover: false },
        ]}
        initialIndex={0}
        visible
        onClose={jest.fn()}
        farmId={3}
        sprayDiaryId={7}
        onCaptionSaved={jest.fn()}
      />,
    );

    expect(screen.getByText("★")).toBeTruthy();

    const gestureDetector = screen.getByTestId("spray-lightbox-gesture");
    const gesture = gestureDetector.props.gesture as {
      onBegin: () => void;
      onUpdate: (event: { translationX: number; translationY: number }) => void;
      onEnd: (event: { translationX: number }) => void;
    };

    act(() => {
      gesture.onBegin();
      gesture.onUpdate({ translationX: -100, translationY: 0 });
      gesture.onEnd({ translationX: -100 });
    });
    expect(screen.queryByText("★")).toBeNull();

    act(() => {
      gesture.onBegin();
      gesture.onUpdate({ translationX: 100, translationY: 0 });
      gesture.onEnd({ translationX: 100 });
    });
    expect(screen.getByText("★")).toBeTruthy();
  });
});

describe("SprayPhotoLightbox photo action state", () => {
  it("disables and dims actions only for the failed photo while swiping away and back", () => {
    const screen = render(
      <SprayPhotoLightbox
        photos={[
          { ...photo, id: 101, downloadUrl: "https://cdn.example.com/failed-photo.jpg" },
          { ...photo, id: 102, downloadUrl: "https://cdn.example.com/healthy-photo.jpg" },
        ]}
        initialIndex={0}
        visible
        onClose={jest.fn()}
        farmId={3}
        sprayDiaryId={7}
        onCaptionSaved={jest.fn()}
      />,
    );

    const actionState = () => {
      const save = screen.getByTestId("spray-photo-save-to-roll");
      const share = screen.getByTestId("spray-photo-share");
      return {
        saveDisabled: save.props.disabled,
        shareDisabled: share.props.disabled,
        saveOpacity: save.props.style.flat(Infinity).find((style: { opacity?: number }) => style?.opacity)?.opacity,
        shareOpacity: share.props.style.flat(Infinity).find((style: { opacity?: number }) => style?.opacity)?.opacity,
      };
    };
    const gesture = screen.getByTestId("spray-lightbox-gesture").props.gesture as {
      onBegin: () => void;
      onUpdate: (event: { translationX: number; translationY: number }) => void;
      onEnd: (event: { translationX: number }) => void;
    };
    const swipe = (translationX: number) => {
      act(() => {
        gesture.onBegin();
        gesture.onUpdate({ translationX, translationY: 0 });
        gesture.onEnd({ translationX });
      });
    };

    const failedImage = screen
      .UNSAFE_getAllByType(Image)
      .find((node) => node.props.source?.uri === "https://cdn.example.com/failed-photo.jpg");
    expect(failedImage).toBeTruthy();
    fireEvent(failedImage!, "error");

    expect(actionState()).toEqual({
      saveDisabled: true,
      shareDisabled: true,
      saveOpacity: 0.4,
      shareOpacity: 0.4,
    });

    swipe(-100);
    expect(actionState()).toEqual({
      saveDisabled: false,
      shareDisabled: false,
      saveOpacity: undefined,
      shareOpacity: undefined,
    });

    swipe(100);
    fireEvent(
      screen
        .UNSAFE_getAllByType(Image)
        .find((node) => node.props.source?.uri === "https://cdn.example.com/failed-photo.jpg")!,
      "error",
    );
    expect(actionState()).toEqual({
      saveDisabled: true,
      shareDisabled: true,
      saveOpacity: 0.4,
      shareOpacity: 0.4,
    });
  });
});

describe("VineSprayDiaryHistoryScreen — filtered empty states", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFarm.mockReturnValue({
      currentFarm: { id: "farm-1", name: "Test Vineyard" },
      user: { id: "test-user" },
    });
    useApiFetch.mockReturnValue({
      records: [],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
    });
    useApiVineBlocks.mockReturnValue({ blocks: [], loading: false });
    useFarmIdentifiers.mockReturnValue({
      address: "Test Lane",
      postcode: "AB1 2CD",
      cphNumber: "12/345/6789",
      sbiNumber: "123456789",
      loading: false,
      justSaved: false,
      clearJustSaved: jest.fn(),
      refetch: jest.fn(),
    });
    useIdentifierBannerDismiss.mockReturnValue({ dismissed: true, dismiss: jest.fn() });
    usePersistedBlockFilter.mockReturnValue([[], jest.fn()]);
    usePrint.mockReturnValue({ savePdf: jest.fn() });
  });

  it("shows block-specific guidance when only the block filter is active", () => {
    usePersistedBlockFilter.mockReturnValue([[99], jest.fn()]);

    const screen = render(<VineSprayDiaryHistoryScreen />);

    expect(screen.getByText("No entries for the selected block(s).")).toBeTruthy();
    expect(screen.queryByText("Spray diary entries you create will appear here.")).toBeNull();
  });

  it("keeps the current-filters message for an empty search", () => {
    const screen = render(<VineSprayDiaryHistoryScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Search by product, block or operator…"),
      "sulphur",
    );

    expect(screen.getByText("No entries match the current filters.")).toBeTruthy();
  });

  it("keeps the current-filters message for an empty date range", () => {
    const screen = render(<VineSprayDiaryHistoryScreen />);
    fireEvent.changeText(
      screen.getAllByPlaceholderText("DD/MM/YYYY")[0],
      "01/01/2026",
    );

    expect(screen.getByText("No entries match the current filters.")).toBeTruthy();
  });
});

describe("VineSprayDiaryHistoryScreen — photo badge callbacks", () => {
  const makeRecord = (id: number, productName: string, photoCount: number) => ({
    id,
    applicationDate: "2026-09-03",
    blockId: null,
    productName,
    mappNumber: null,
    activeIngredient: null,
    productType: null,
    ratePerHectare: null,
    rateUnit: null,
    areaTreatedHa: null,
    totalQuantityApplied: null,
    harvestIntervalDays: null,
    windSpeedMph: null,
    temperatureCelsius: null,
    weatherConditions: null,
    operatorName: null,
    operatorCertificateNo: null,
    notes: null,
    photoCount,
  });

  const makePhoto = (id: number) => ({
    ...photo,
    id,
    sprayDiaryId: 7,
    fileName: `photo-${id}.jpg`,
    objectPath: `spray-diary/photo-${id}.jpg`,
    downloadUrl: `https://cdn.example.com/photo-${id}.jpg`,
    isCover: id === 101,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useFarm.mockReturnValue({
      currentFarm: { id: "farm-1", name: "Test Vineyard" },
      user: { id: "test-user" },
    });
    useApiFetch.mockReturnValue({
      records: [
        makeRecord(7, "Copper Spray", 1),
        makeRecord(8, "Sulphur Spray", 4),
      ],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
    });
    useApiVineBlocks.mockReturnValue({ blocks: [], loading: false });
    useFarmIdentifiers.mockReturnValue({
      address: "Test Lane",
      postcode: "AB1 2CD",
      cphNumber: "12/345/6789",
      sbiNumber: "123456789",
      loading: false,
      justSaved: false,
      clearJustSaved: jest.fn(),
      refetch: jest.fn(),
    });
    useIdentifierBannerDismiss.mockReturnValue({ dismissed: true, dismiss: jest.fn() });
    usePersistedBlockFilter.mockReturnValue([[], jest.fn()]);
    usePrint.mockReturnValue({ savePdf: jest.fn() });
  });

  it("applies photo add and delete counts only to the row opened for editing", async () => {
    const firstPhoto = makePhoto(101);
    const addedPhoto = makePhoto(102);
    apiFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ photos: [firstPhoto] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ photo: addedPhoto }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ photos: [firstPhoto, addedPhoto] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    pickPhoto.mockResolvedValue("file:///new-spray-photo.jpg");
    uploadPhotoToStorage.mockResolvedValue("spray-diary/photo-102.jpg");
    jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === "Delete")?.onPress?.();
    });

    const screen = render(<VineSprayDiaryHistoryScreen />);
    expect(screen.getByText("1 photo")).toBeTruthy();
    expect(screen.getByText("4 photos")).toBeTruthy();

    fireEvent.press(screen.getByText("Copper Spray"));
    await waitFor(() => expect(screen.getByText("1 attached")).toBeTruthy());

    fireEvent.press(screen.getByText("Add Photo"));
    await waitFor(() => {
      expect(screen.getByText("2 photos")).toBeTruthy();
      expect(screen.getByText("4 photos")).toBeTruthy();
    });

    const addedImage = screen
      .UNSAFE_getAllByType(Image)
      .find((node) => node.props.source?.uri === addedPhoto.downloadUrl);
    expect(addedImage).toBeTruthy();
    const thumbnail = addedImage!.parent?.parent;
    expect(thumbnail).toBeTruthy();
    fireEvent(thumbnail!, "longPress");
    fireEvent(thumbnail!, "pressOut");

    await waitFor(() => {
      expect(screen.getByText("1 photo")).toBeTruthy();
      expect(screen.getByText("4 photos")).toBeTruthy();
      expect(screen.queryByText("2 photos")).toBeNull();
    });
    expect(apiFetch).toHaveBeenLastCalledWith(
      "/api/farms/farm-1/vineyard-spray-diary/7/photos/102",
      { method: "DELETE" },
    );
  });
});