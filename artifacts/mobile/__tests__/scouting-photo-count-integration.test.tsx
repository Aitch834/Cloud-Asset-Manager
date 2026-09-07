/**
 * Integration coverage for the scouting history photo count callback.
 *
 * The edit screen owns the row badge while ScoutingPhotoSection owns the
 * photo list. This test joins the real components together and exercises the
 * add/delete paths without unmounting or navigating away from the row.
 */

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "test-uuid"),
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
  const ScrollView = host("ScrollView");
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
      create: (config: {
        onMoveShouldSetPanResponder: (...args: unknown[]) => boolean;
        onPanResponderRelease: (...args: unknown[]) => void;
      }) => ({
        panHandlers: {
          onMoveShouldSetResponder: config.onMoveShouldSetPanResponder,
          onResponderRelease: config.onPanResponderRelease,
        },
      }),
    },
    Platform: { OS: "android" },
    Pressable,
    ScrollView,
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
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn(),
}));
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));
jest.mock("../lib/hooks/useApiFetch", () => ({
  useApiFetch: jest.fn(),
}));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: jest.fn(),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  useFarmIdentifiers: jest.fn(),
}));
jest.mock("../lib/hooks/useIdentifierBannerDismiss", () => ({
  useIdentifierBannerDismiss: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedBlockFilter", () => ({
  usePersistedBlockFilter: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedPressureFilter", () => ({
  usePersistedPressureFilter: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedVintage", () => ({
  usePersistedVintage: jest.fn(),
}));
jest.mock("../lib/hooks/usePrint", () => ({
  usePrint: jest.fn(),
}));
jest.mock("../lib/printTemplates", () => ({
  vineScoutingHistoryHtml: jest.fn(),
}));
jest.mock("../components/VineBlockPicker", () => ({
  VineBlockPicker: () => null,
}));
jest.mock("../components/ui/Button", () => ({
  Button: () => null,
}));
jest.mock("../components/ui/Input", () => ({
  Input: () => null,
}));
jest.mock("../components/ui/IdentifierBanner", () => ({
  IdentifierBanner: () => null,
}));
jest.mock("../lib/vineyardCountEvents", () => ({
  vineyardCountEvents: { emit: jest.fn() },
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
jest.mock("../lib/scoutingPhotosApi", () => ({
  fetchScoutingPhotoUrl: jest.fn(),
}));

// Keep the test focused on the count callback instead of native gesture
// implementation details inside the lightbox.
jest.mock("../lib/scoutingLightboxHelpers", () => ({
  claimDeleteConfirmation: jest.fn((lock: { current: boolean }) => {
    if (lock.current) return false;
    lock.current = true;
    return true;
  }),
  getSwipeDirection: jest.fn(
    (deleting: boolean, dx: number, threshold = 50) => {
      if (deleting || Math.abs(dx) <= threshold) return null;
      return dx < 0 ? "next" : "previous";
    },
  ),
  shouldAllowSwipe: jest.fn(() => false),
  getPaginationItems: jest.fn((photosCount: number) =>
    Array.from({ length: photosCount }, (_, index) => index),
  ),
  isPaginationItemActive: jest.fn((item: number, currentIndex: number) => item === currentIndex),
  mergeRefreshedPhotoCaptions: jest.fn((
    refreshedPhotos: Array<{ id: number; caption: string | null; [key: string]: unknown }>,
    currentPhotos: Array<{ id: number; caption: string | null; [key: string]: unknown }>,
    captionRevisions: ReadonlyMap<number, number>,
    refreshStartedAtRevision: number,
  ) => {
    const currentById = new Map(currentPhotos.map((photo) => [photo.id, photo]));
    return refreshedPhotos.map((photo) => {
      const captionRevision = captionRevisions.get(photo.id) ?? 0;
      const currentPhoto = currentById.get(photo.id);
      if (captionRevision <= refreshStartedAtRevision || !currentPhoto) return photo;
      return { ...photo, caption: currentPhoto.caption };
    });
  }),
  scheduleScoutingPhotoAutoRetry: jest.fn(),
  mergeRefreshedPhotoCaptions: jest.fn(
    (refreshedPhotos: Array<{ id: number; caption: string | null }>) =>
      refreshedPhotos,
  ),
  updatePhotoCaption: jest.fn((photos: Array<{ id: number; [key: string]: unknown }>, photoId: number, caption: string | null) =>
    photos.map((photo: { id: number }) => photo.id === photoId ? { ...photo, caption } : photo),
  ),
}));

const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};
const { pickPhoto, uploadPhotoToStorage } = require("../lib/uploadPhoto") as {
  pickPhoto: jest.Mock;
  uploadPhotoToStorage: jest.Mock;
};

import React, { useState } from "react";
import { Alert, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import {
  ScoutingPhotoLightbox,
  ScoutingPhotoSection,
  type ScoutingPhoto,
} from "../components/ScoutingPhotoSection";
import { ScoutingRow } from "../app/vine-scouting-history";

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function makePhoto(id: number): ScoutingPhoto {
  return {
    id,
    scoutingId: 42,
    farmId: 7,
    objectPath: `vineyard/scouting/photo-${id}.jpg`,
    fileName: `photo-${id}.jpg`,
    caption: null,
    sortOrder: id,
    isCover: id === 1,
    uploadedAt: "2026-08-29T10:00:00Z",
    downloadUrl: `https://cdn.example.test/photo-${id}.jpg`,
  };
}

function makeRecord(photoCount: number) {
  return {
    id: 42,
    scoutDate: "2026-08-29",
    nextScoutDate: null,
    blockId: 7,
    blockName: "North Block",
    scoutedBy: "Test operator",
    downyMildewPressure: 0,
    powderyMildewPressure: 0,
    botrytisPressure: 0,
    phomopsisPressure: 0,
    leafhopperPressure: 0,
    spiderMitePressure: 0,
    vineWeevilSighted: false,
    eutypaDiebackSighted: false,
    xylellaFastidiosa: false,
    phytophthoraViticola: false,
    actionTaken: null,
    notes: null,
    photoCount,
  };
}

function CountBadgeHarness() {
  const [photoCount, setPhotoCount] = useState(2);
  const handlePhotoCountChange = (count: number) => {
    observedPhotoCounts(count);
    setPhotoCount(count);
  };
  return (
    <>
      <ScoutingPhotoSection
        farmId={7}
        scoutingId={42}
        onPhotoCountChange={handlePhotoCountChange}
      />
      <ScoutingRow
        item={makeRecord(photoCount)}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    </>
  );
}

const observedPhotoCounts = jest.fn();

function confirmEveryAlert() {
  jest.spyOn(Alert, "alert").mockImplementation(
    (_title, _message, buttons) => {
      const deleteButton = buttons?.find((button) => button.text === "Delete");
      deleteButton?.onPress?.();
    },
  );
}

beforeEach(() => {
  apiFetch.mockReset();
  pickPhoto.mockReset();
  uploadPhotoToStorage.mockReset();
  observedPhotoCounts.mockReset();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("scouting photo count badge", () => {
  it("increments after adding and decrements after deleting without leaving the row", async () => {
    const initialPhotos = [makePhoto(1), makePhoto(2)];
    apiFetch
      .mockResolvedValueOnce(okResponse({ photos: initialPhotos }))
      .mockResolvedValueOnce(okResponse({ photo: { id: 3 } }))
      .mockResolvedValueOnce(okResponse({ photos: [...initialPhotos, makePhoto(3)] }))
      .mockResolvedValueOnce(okResponse({}));
    pickPhoto.mockResolvedValue("file:///new-photo.jpg");
    uploadPhotoToStorage.mockResolvedValue("vineyard/scouting/photo-3.jpg");
    const screen = render(<CountBadgeHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("scouting-photo-badge-42")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Add Photo"));
    await waitFor(() => expect(screen.getByText("Skip")).toBeTruthy());
    fireEvent.press(screen.getByText("Skip"));

    await waitFor(() => {
      expect(screen.getByTestId("scouting-photo-badge-42")).toBeTruthy();
      expect(screen.getByText("3", { exact: true })).toBeTruthy();
    });

    confirmEveryAlert();
    fireEvent.press(screen.getByTestId("scouting-photo-3"));
    fireEvent.press(screen.getByText("Delete"));

    await waitFor(() => {
      expect(screen.getByText("2", { exact: true })).toBeTruthy();
      expect(apiFetch).toHaveBeenLastCalledWith(
        "/api/farms/7/vineyard-scouting/42/photos/3",
        { method: "DELETE" },
      );
    });
  });

  it("removes the badge when deleting the last photo", async () => {
    apiFetch
      .mockResolvedValueOnce(okResponse({ photos: [makePhoto(1)] }))
      .mockResolvedValueOnce(okResponse({}));
    const screen = render(<CountBadgeHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("scouting-photo-badge-42")).toBeTruthy();
    });

    confirmEveryAlert();
    fireEvent.press(screen.getByTestId("scouting-photo-1"));
    fireEvent.press(screen.getByText("Delete"));

    await waitFor(() => {
      expect(observedPhotoCounts).toHaveBeenCalledWith(0);
      expect(screen.queryByTestId("scouting-photo-badge-42")).toBeNull();
      expect(apiFetch).toHaveBeenLastCalledWith(
        "/api/farms/7/vineyard-scouting/42/photos/1",
        { method: "DELETE" },
      );
    });
  });
});

describe("ScoutingPhotoLightbox cover badge", () => {
  it("jumps to a tapped dot and keeps the active dot in sync with swipe navigation", () => {
    const screen = render(
      <ScoutingPhotoLightbox
        photos={[makePhoto(1), makePhoto(2), makePhoto(3)]}
        initialIndex={0}
        visible
        onClose={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByTestId("scouting-photo-dot-0").props.accessibilityState).toEqual({
      selected: true,
    });

    fireEvent.press(screen.getByTestId("scouting-photo-dot-2"));

    expect(screen.getByText("3 / 3")).toBeTruthy();
    expect(screen.getByTestId("scouting-photo-dot-2").props.accessibilityState).toEqual({
      selected: true,
    });
    expect(screen.getByTestId("scouting-photo-dot-0").props.accessibilityState).toEqual({
      selected: false,
    });

    const swipeableView = screen
      .UNSAFE_getAllByType(View)
      .find((node) => typeof node.props.onResponderRelease === "function");
    expect(swipeableView).toBeTruthy();

    fireEvent(swipeableView!, "responderRelease", {}, { dx: 60, dy: 0 });

    expect(screen.getByText("2 / 3")).toBeTruthy();
    expect(screen.getByTestId("scouting-photo-dot-1").props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it("hides the badge after swiping to a non-cover photo and restores it when swiping back", () => {
    const screen = render(
      <ScoutingPhotoLightbox
        photos={[makePhoto(1), makePhoto(2)]}
        initialIndex={0}
        visible
        onClose={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("★")).toBeTruthy();

    const swipeableView = screen
      .UNSAFE_getAllByType(View)
      .find((node) => typeof node.props.onResponderRelease === "function");
    expect(swipeableView).toBeTruthy();

    fireEvent(swipeableView!, "responderRelease", {}, { dx: -60, dy: 0 });
    expect(screen.queryByText("★")).toBeNull();

    fireEvent(swipeableView!, "responderRelease", {}, { dx: 60, dy: 0 });
    expect(screen.getByText("★")).toBeTruthy();
  });
});