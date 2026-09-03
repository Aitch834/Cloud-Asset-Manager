/**
 * Integration tests for the vine-block-photos delete-warning flow.
 *
 * The unit tests in vine-block-photos-delete-warning.test.ts cover the pure
 * message-builder functions in isolation.  These tests cover the integration
 * boundary:
 *
 *   1. API-sync layer — fetchBlockPhotos (the real production function called
 *      by VineBlockPhotosScreen.loadPhotos) is tested with a mocked apiFetch
 *      module.  Tests assert the live server-synced count feeds the message
 *      builders correctly for both the grid (photosCount = photos.length) and
 *      lightbox (buildLightboxDeleteMessage(photos.length, photo.isCover)) paths.
 *
 *   2. State-update guard — applyPhotoUpdateIfCurrent (extracted from loadPhotos)
 *      is tested with deferred, out-of-order responses.  Tests model the actual
 *      production invalidation paths:
 *        (a) Same-block out-of-order: older request resolves after newer refresh.
 *        (b) Block-change gap: handleSelectBlock advances the generation
 *            synchronously BEFORE the next loadPhotos call, so a stale previous-
 *            block response resolving in that gap is already discarded.
 *        (c) Unmount cleanup: the cleanup effect advances the generation so an
 *            in-flight request cannot call setPhotos after the component tears down.
 *        (d) Error-preservation: null from fetchBlockPhotos does not clear state.
 *        (e) Fast-path: a current-generation response is applied normally.
 */

// ---------------------------------------------------------------------------
// Module mock — hoisted by Babel before any imports execute.
// Manual factory prevents Jest from loading the real apiFetch module and its
// transitive React Native dependencies (expo-crypto via lib/database.ts).
// ---------------------------------------------------------------------------
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
  const ScrollView = host("ScrollView");
  const KeyboardAvoidingView = host("KeyboardAvoidingView");
  const ActivityIndicator = host("ActivityIndicator");
  const TextInput = host("TextInput");
  const Modal = ({ visible, children, ...props }: Record<string, unknown>) =>
    visible ? React.createElement("Modal", props, children) : null;
  const FlatList = ({
    data,
    renderItem,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    ...props
  }: {
    data: unknown[];
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    ListFooterComponent?: React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement(
      View,
      props,
      ListHeaderComponent,
      data.length
        ? data.map((item, index) =>
            React.createElement(
              React.Fragment,
              { key: index },
              renderItem({ item, index }),
            ),
          )
        : ListEmptyComponent,
      data.length ? ListFooterComponent : null,
    );
  return {
    ActivityIndicator,
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform: { OS: "android" },
    Pressable,
    ScrollView,
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text,
    TextInput,
    View,
  };
});

// The screen-rendering coverage below imports the full Expo screen. Keep the
// test focused on the delete/count flow by replacing native-only dependencies
// that are not exercised by this scenario.
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  downloadAsync: jest.fn(),
}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-media-library", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
}));
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  const gesture = () => {
    const chain = {
      activateAfterLongPress: () => chain,
      minDuration: () => chain,
      numberOfTaps: () => chain,
      onBegin: () => chain,
      onEnd: () => chain,
      onFinalize: () => chain,
      onStart: () => chain,
      onUpdate: () => chain,
    };
    return chain;
  };
  return {
    Gesture: {
      Pan: gesture,
      Pinch: gesture,
      Tap: gesture,
      LongPress: gesture,
      Simultaneous: (...gestures: unknown[]) => gestures[0],
      Race: (...gestures: unknown[]) => gestures[0],
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      React.createElement(ReactNative.View, null, children),
    GestureHandlerRootView: ReactNative.View,
  };
});
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    default: { View: ReactNative.View },
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useSharedValue: (value: unknown) => ({ value }),
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});
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
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: jest.fn(),
  setCachedBlockCoverUrl: jest.fn(),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  useFarmIdentifiers: jest.fn(),
}));
jest.mock("../lib/hooks/useUiPrefs", () => ({
  useUiPrefs: jest.fn(),
}));
jest.mock("../lib/uploadPhoto", () => ({
  uploadPhotoToStorage: jest.fn(),
  getApiBase: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useFarm } = require("../lib/context/FarmContext") as {
  useFarm: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useApiVineBlocks } = require("../lib/hooks/useApiVineBlocks") as {
  useApiVineBlocks: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as {
  useFarmIdentifiers: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useUiPrefs } = require("../lib/hooks/useUiPrefs") as {
  useUiPrefs: jest.Mock;
};

import {
  fetchBlockPhotos,
  applyPhotoUpdateIfCurrent,
  type BlockPhotoRecord,
} from "../lib/vineBlockPhotosApi";
import {
  buildGridDeleteMessage,
  buildLightboxDeleteMessage,
} from "../lib/vineBlockPhotosHelpers";
import React from "react";
import { Alert, StyleSheet } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import VineBlockPhotosScreen from "../app/vine-block-photos";
import type { VineBlock } from "../lib/hooks/useApiVineBlocks";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePhoto(overrides: Partial<BlockPhotoRecord> = {}): BlockPhotoRecord {
  return {
    id: 101,
    blockId: 7,
    farmId: 3,
    objectPath: "vineyard/block-7/photo-101.jpg",
    fileName: "photo-101.jpg",
    caption: null,
    isCover: true,
    uploadedAt: "2025-06-01T10:00:00Z",
    downloadUrl: "https://cdn.example.com/photo-101.jpg",
    ...overrides,
  };
}

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function errorResponse(status = 500): Response {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

const ONLY_PHOTO_FRAGMENT = "only photo for this block";
const FARM_ID = 3;
const BLOCK_ID = 7;
const EXPECTED_URL = `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos`;

beforeEach(() => {
  (apiFetch as jest.MockedFunction<typeof apiFetch>).mockReset();
});

function makeBlock(overrides: Partial<VineBlock> = {}): VineBlock {
  return {
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
    photoCount: 2,
    ...overrides,
  };
}

function configureScreenMocks(
  blockOrBlocks: VineBlock | VineBlock[],
  prefs: Record<string, unknown> = {},
  prefsReady = true,
  setPref = jest.fn(),
) {
  const blocks = Array.isArray(blockOrBlocks) ? blockOrBlocks : [blockOrBlocks];
  useFarm.mockReturnValue({
    currentFarm: { id: FARM_ID, name: "Test Farm" },
    user: { id: "test-user" },
  });
  useApiVineBlocks.mockReturnValue({
    blocks,
    loading: false,
  });
  useFarmIdentifiers.mockReturnValue({
    address: "Test Farm Lane",
    loading: false,
  });
  useUiPrefs.mockReturnValue({
    prefsReady,
    prefs,
    setPref,
    isHintDismissed: () => true,
    dismissHint: jest.fn(),
  });
}

async function deletePhotoAndReturnToBlockList(
  initialPhotos: BlockPhotoRecord[],
): Promise<ReturnType<typeof render>> {
  configureScreenMocks(makeBlock({ photoCount: initialPhotos.length }));
  (apiFetch as jest.MockedFunction<typeof apiFetch>)
    .mockResolvedValueOnce(okResponse({ photos: initialPhotos }))
    .mockResolvedValueOnce(okResponse({}));

  const screen = render(React.createElement(VineBlockPhotosScreen));
  fireEvent.press(screen.getByText("North Block"));

  await waitFor(() => {
    expect(screen.getByTestId(`vine-block-photo-${initialPhotos[0].id}`)).toBeTruthy();
  });

  const alert = jest.spyOn(Alert, "alert").mockImplementation(
    (_title, _message, buttons) => {
      const deleteButton = buttons?.find((button) => button.text === "Delete");
      deleteButton?.onPress?.();
    },
  );
  const thumbnail = screen.getByTestId(`vine-block-photo-${initialPhotos[0].id}`);
  fireEvent(thumbnail, "longPress");
  fireEvent(thumbnail, "pressOut");

  await waitFor(() => {
    expect(apiFetch).toHaveBeenLastCalledWith(
      `/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos/${initialPhotos[0].id}`,
      { method: "DELETE" },
    );
  });
  await waitFor(() => {
    expect(screen.getByText("Clear selection")).toBeTruthy();
  });

  fireEvent.press(screen.getByText("Clear selection"));
  alert.mockRestore();
  return screen;
}

describe("VineBlockPhotosScreen — block list count after delete", () => {
  it("shows the decremented count when deleting one of two photos", async () => {
    const screen = await deletePhotoAndReturnToBlockList([
      makePhoto({ id: 1001, isCover: true }),
      makePhoto({ id: 1002, isCover: false }),
    ]);

    expect(screen.getByText("1 photo")).toBeTruthy();
    expect(screen.queryByText("2 photos")).toBeNull();
  });

  it("shows an amber No photos badge when deleting the last photo", async () => {
    const screen = await deletePhotoAndReturnToBlockList([
      makePhoto({ id: 1003, isCover: true }),
    ]);

    const noPhotosBadge = screen.getByText("No photos");
    expect(noPhotosBadge).toBeTruthy();
    expect(StyleSheet.flatten(noPhotosBadge.props.style)).toEqual(
      expect.objectContaining({ color: "#b45309" }),
    );
  });
});

describe("VineBlockPhotosScreen — block-list sort preference", () => {
  const SORT_COVERAGE_KEY = "vine_block_photo_sort_coverage";

  function makeSortBlocks(): VineBlock[] {
    return [
      makeBlock({ id: 11, blockName: "Covered Block", photoCount: 3 }),
      makeBlock({ id: 12, blockName: "Zero Block", photoCount: 0 }),
    ];
  }

  function renderedOrder(screen: ReturnType<typeof render>): string {
    return JSON.stringify(screen.toJSON());
  }

  it("restores 0 photos first after the screen is unmounted and mounted again", async () => {
    const blocks = makeSortBlocks();
    const persistedPrefs: Record<string, unknown> = {};
    const setPref = jest.fn((key: string, value: unknown) => {
      persistedPrefs[key] = value;
    });

    configureScreenMocks(blocks, persistedPrefs, true, setPref);
    const firstMount = render(React.createElement(VineBlockPhotosScreen));

    await waitFor(() => {
      expect(firstMount.getByText("A–Z")).toBeTruthy();
    });
    fireEvent.press(firstMount.getByText("0 photos first"));

    expect(persistedPrefs[SORT_COVERAGE_KEY]).toBe(true);
    expect(renderedOrder(firstMount).indexOf("Zero Block")).toBeLessThan(
      renderedOrder(firstMount).indexOf("Covered Block"),
    );

    firstMount.unmount();

    configureScreenMocks(blocks, persistedPrefs, true, setPref);
    const secondMount = render(React.createElement(VineBlockPhotosScreen));

    await waitFor(() => {
      const order = renderedOrder(secondMount);
      expect(order.indexOf("Zero Block")).toBeLessThan(order.indexOf("Covered Block"));
    });
    expect(
      StyleSheet.flatten(secondMount.getByText("0 photos first").props.style),
    ).toEqual(expect.objectContaining({ color: "#fff" }));
  });

  it("does not reset a user toggle when persisted prefs arrive after the interaction", async () => {
    const blocks = makeSortBlocks();
    const setPref = jest.fn();
    configureScreenMocks(blocks, {}, false, setPref);
    const screen = render(React.createElement(VineBlockPhotosScreen));

    fireEvent.press(screen.getByText("0 photos first"));
    expect(
      renderedOrder(screen).indexOf("Zero Block"),
    ).toBeLessThan(renderedOrder(screen).indexOf("Covered Block"));

    // Simulate the bootstrap response arriving with the old/default value
    // after the grower has already chosen coverage-first.
    configureScreenMocks(blocks, { [SORT_COVERAGE_KEY]: false }, true, setPref);
    screen.rerender(React.createElement(VineBlockPhotosScreen));

    await waitFor(() => {
      const order = renderedOrder(screen);
      expect(order.indexOf("Zero Block")).toBeLessThan(order.indexOf("Covered Block"));
    });
    expect(
      StyleSheet.flatten(screen.getByText("0 photos first").props.style),
    ).toEqual(expect.objectContaining({ color: "#fff" }));
  });
});

// ===========================================================================
// Part 1 — API-sync layer
// Verifies fetchBlockPhotos calls the real mocked apiFetch module and the
// returned count feeds the message builders correctly.
// ===========================================================================

describe("fetchBlockPhotos → message builder (API-sync layer)", () => {
  describe("Grid delete warning", () => {
    it("shows 'only photo' warning when the server returns 1 photo", async () => {
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
        okResponse({ photos: [makePhoto({ id: 101, isCover: true })] }),
      );

      const photos = await fetchBlockPhotos(FARM_ID, BLOCK_ID);

      expect(apiFetch).toHaveBeenCalledWith(EXPECTED_URL);
      expect(photos).not.toBeNull();
      expect(photos).toHaveLength(1);
      expect(buildGridDeleteMessage(photos!.length)).toContain(ONLY_PHOTO_FRAGMENT);
    });

    it("does NOT show 'only photo' warning when the server returns 2 photos", async () => {
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
        okResponse({
          photos: [
            makePhoto({ id: 101, isCover: true }),
            makePhoto({ id: 102, isCover: false }),
          ],
        }),
      );

      const photos = await fetchBlockPhotos(FARM_ID, BLOCK_ID);

      expect(photos).toHaveLength(2);
      expect(buildGridDeleteMessage(photos!.length)).not.toContain(ONLY_PHOTO_FRAGMENT);
    });

    it("returns null on server error — loadPhotos skips setPhotos", async () => {
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
        errorResponse(500),
      );

      const photos = await fetchBlockPhotos(FARM_ID, BLOCK_ID);
      expect(photos).toBeNull();
    });

    it("returns null on network failure — loadPhotos skips setPhotos", async () => {
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const photos = await fetchBlockPhotos(FARM_ID, BLOCK_ID);
      expect(photos).toBeNull();
    });
  });

  describe("Lightbox delete warning", () => {
    it("shows 'only photo' warning (cover) when server returns 1 photo", async () => {
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
        okResponse({ photos: [makePhoto({ id: 201, isCover: true })] }),
      );

      const photos = await fetchBlockPhotos(FARM_ID, BLOCK_ID);

      expect(photos).toHaveLength(1);
      const msg = buildLightboxDeleteMessage(photos!.length, photos![0].isCover);
      expect(msg).toContain(ONLY_PHOTO_FRAGMENT);
      expect(msg).not.toContain("cover photo for this block");
    });

    it("shows 'only photo' warning (non-cover) when server returns 1 photo", async () => {
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
        okResponse({ photos: [makePhoto({ id: 202, isCover: false })] }),
      );

      const photos = await fetchBlockPhotos(FARM_ID, BLOCK_ID);

      expect(photos).toHaveLength(1);
      expect(
        buildLightboxDeleteMessage(photos!.length, photos![0].isCover),
      ).toContain(ONLY_PHOTO_FRAGMENT);
    });

    it("shows cover-change notice when multiple photos remain and target is cover", async () => {
      (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
        okResponse({
          photos: [
            makePhoto({ id: 201, isCover: true }),
            makePhoto({ id: 202, isCover: false }),
          ],
        }),
      );

      const photos = await fetchBlockPhotos(FARM_ID, BLOCK_ID);

      expect(photos).toHaveLength(2);
      const msg = buildLightboxDeleteMessage(photos!.length, photos![0].isCover);
      expect(msg).not.toContain(ONLY_PHOTO_FRAGMENT);
      expect(msg).toContain("cover photo for this block");
      expect(msg).toContain("The next photo will become the new cover.");
    });
  });
});

// ===========================================================================
// Part 2 — State-update guard (applyPhotoUpdateIfCurrent)
//
// Tests use deferred promises resolved out of order and directly model the
// production invalidation paths that advance the generation counter:
//   • loadPhotos start: `const gen = ++loadGenRef.current`
//   • handleSelectBlock: `loadGenRef.current++` before setSelectedBlock
//   • unmount cleanup: `loadGenRef.current++` in useEffect cleanup
// ===========================================================================

describe("applyPhotoUpdateIfCurrent — stale-response guard", () => {
  // -------------------------------------------------------------------------
  // (a) Same-block out-of-order: a slow initial load resolves after a newer
  //     background refresh (useFocusEffect / 4-min interval).
  // Production path: gen advances at the START of each loadPhotos call.
  // -------------------------------------------------------------------------
  it("(a) discards a stale initial load that resolves after a newer background refresh", async () => {
    const photo1 = makePhoto({ id: 301, isCover: true });
    const photo2 = makePhoto({ id: 302, isCover: false });

    let latestGen = 0;
    const getLatestGen = () => latestGen;
    let photosState: BlockPhotoRecord[] = [];
    const setPhotos = jest.fn((p: BlockPhotoRecord[]) => { photosState = p; });

    let resolveGen1!: (v: BlockPhotoRecord[] | null) => void;
    let resolveGen2!: (v: BlockPhotoRecord[] | null) => void;
    const gen1Promise = new Promise<BlockPhotoRecord[] | null>((r) => { resolveGen1 = r; });
    const gen2Promise = new Promise<BlockPhotoRecord[] | null>((r) => { resolveGen2 = r; });

    // loadPhotos #1 starts — gen1 captured as `++latestGen`
    const gen1 = ++latestGen;
    // loadPhotos #2 starts (focus refresh) — gen2 captured as `++latestGen`
    const gen2 = ++latestGen;

    const applyGen1 = gen1Promise.then((f) =>
      applyPhotoUpdateIfCurrent(gen1, getLatestGen, f, setPhotos),
    );
    const applyGen2 = gen2Promise.then((f) =>
      applyPhotoUpdateIfCurrent(gen2, getLatestGen, f, setPhotos),
    );

    // gen2 resolves first with the refreshed single-photo list
    resolveGen2([photo1]);
    await applyGen2;
    expect(setPhotos).toHaveBeenCalledTimes(1);
    expect(photosState).toHaveLength(1);

    // gen1 resolves late with the stale 2-photo list — must be discarded
    resolveGen1([photo1, photo2]);
    await applyGen1;
    expect(setPhotos).toHaveBeenCalledTimes(1); // no additional call
    expect(photosState).toHaveLength(1);

    // Delete dialog uses the guarded state (1 photo) — warning fires correctly
    expect(buildGridDeleteMessage(photosState.length)).toContain(ONLY_PHOTO_FRAGMENT);
    expect(
      buildLightboxDeleteMessage(photosState.length, photosState[0].isCover),
    ).toContain(ONLY_PHOTO_FRAGMENT);
  });

  // -------------------------------------------------------------------------
  // (b) Block-change gap: handleSelectBlock advances the generation
  //     SYNCHRONOUSLY before the next loadPhotos call starts.  An old request
  //     that resolves in the gap between the selection commit and the new
  //     loadPhotos invocation must already be discarded.
  // Production path: `loadGenRef.current++` inside handleSelectBlock, THEN
  //   `const gen = ++loadGenRef.current` inside the new loadPhotos call.
  // -------------------------------------------------------------------------
  it("(b) discards a stale previous-block response resolving in the block-change gap", async () => {
    const oldBlockPhoto = makePhoto({ id: 401, blockId: 5, isCover: true });

    let latestGen = 0;
    const getLatestGen = () => latestGen;
    let photosState: BlockPhotoRecord[] = [];
    const setPhotos = jest.fn((p: BlockPhotoRecord[]) => { photosState = p; });

    let resolveOld!: (v: BlockPhotoRecord[] | null) => void;
    const oldPromise = new Promise<BlockPhotoRecord[] | null>((r) => { resolveOld = r; });

    // loadPhotos for old block (block 5) starts
    const gen1 = ++latestGen; // = 1

    const applyOld = oldPromise.then((f) =>
      applyPhotoUpdateIfCurrent(gen1, getLatestGen, f, setPhotos),
    );

    // Grower selects a new block.  handleSelectBlock fires:
    //   `loadGenRef.current++`  ← gen advances synchronously to 2
    // This happens BEFORE the new loadPhotos call starts.
    latestGen++; // = 2  (models `loadGenRef.current++` in handleSelectBlock)

    // Old block's response arrives in the gap — gen1 (1) !== latestGen (2)
    resolveOld([oldBlockPhoto]);
    await applyOld;

    expect(setPhotos).not.toHaveBeenCalled();
    expect(photosState).toHaveLength(0);

    // New loadPhotos call for the new block starts afterward
    const gen3 = ++latestGen; // = 3
    const newPhoto = makePhoto({ id: 501, blockId: 7, isCover: true });
    applyPhotoUpdateIfCurrent(gen3, getLatestGen, [newPhoto], setPhotos);

    expect(setPhotos).toHaveBeenCalledTimes(1);
    expect(photosState).toHaveLength(1);
    expect(photosState[0].blockId).toBe(7);
  });

  // -------------------------------------------------------------------------
  // (c) Unmount cleanup: the useEffect cleanup fires `loadGenRef.current++`
  //     so an in-flight loadPhotos cannot call setPhotos after the component
  //     has been torn down.
  // Production path: `loadGenRef.current++` in `useEffect(() => { return () =>
  //   { loadGenRef.current++ }; }, [])` cleanup.
  // -------------------------------------------------------------------------
  it("(c) discards an in-flight response after unmount cleanup advances the generation", async () => {
    let latestGen = 0;
    const getLatestGen = () => latestGen;
    let photosState: BlockPhotoRecord[] = [];
    const setPhotos = jest.fn((p: BlockPhotoRecord[]) => { photosState = p; });

    let resolveInflight!: (v: BlockPhotoRecord[] | null) => void;
    const inflightPromise = new Promise<BlockPhotoRecord[] | null>((r) => {
      resolveInflight = r;
    });

    // loadPhotos starts — gen captured
    const gen1 = ++latestGen;
    const applyInflight = inflightPromise.then((f) =>
      applyPhotoUpdateIfCurrent(gen1, getLatestGen, f, setPhotos),
    );

    // Component unmounts — cleanup runs `loadGenRef.current++`
    latestGen++; // models the useEffect cleanup

    // In-flight response arrives after unmount — must be discarded
    resolveInflight([makePhoto({ id: 601 })]);
    await applyInflight;

    expect(setPhotos).not.toHaveBeenCalled();
    expect(photosState).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // (d) Error-preservation: null from fetchBlockPhotos (network / HTTP error)
  //     does not clear the existing photo list.
  // -------------------------------------------------------------------------
  it("(d) preserves existing photos list when a refresh returns null (error)", () => {
    const photo1 = makePhoto({ id: 701, isCover: true });
    const photo2 = makePhoto({ id: 702, isCover: false });

    let latestGen = 0;
    const getLatestGen = () => latestGen;
    let photosState: BlockPhotoRecord[] = [photo1, photo2];
    const setPhotos = jest.fn((p: BlockPhotoRecord[]) => { photosState = p; });

    const gen1 = ++latestGen;
    applyPhotoUpdateIfCurrent(gen1, getLatestGen, null, setPhotos);

    expect(setPhotos).not.toHaveBeenCalled();
    expect(photosState).toHaveLength(2);
    expect(buildGridDeleteMessage(photosState.length)).not.toContain(ONLY_PHOTO_FRAGMENT);
  });

  // -------------------------------------------------------------------------
  // (f) Spinner-ownership: a non-silent initial load sets photosLoading=true;
  //     a silent background refresh (useFocusEffect / 4-min interval) supersedes
  //     it.  When the silent refresh completes as the latest request, it MUST
  //     clear the spinner — even though it was launched silently — otherwise
  //     the screen stays permanently on the loading indicator.
  //
  // Production path: `if (gen === loadGenRef.current) setPhotosLoading(false)`
  //   in the finally block (no `!options?.silent` guard).
  // -------------------------------------------------------------------------
  it("(f) silent refresh superseding a non-silent load clears the spinner when it completes", async () => {
    const photo1 = makePhoto({ id: 901, isCover: true });

    // Simulate the generation ref and loading state (stand-ins for useRef/useState)
    const genRef = { current: 0 };
    let isLoading = false;
    const setLoading = jest.fn((v: boolean) => { isLoading = v; });
    let photosState: BlockPhotoRecord[] = [];
    const setPhotos = jest.fn((p: BlockPhotoRecord[]) => { photosState = p; });

    /**
     * Mirrors the production loadPhotos control flow:
     *   const gen = ++loadGenRef.current;
     *   if (!options?.silent) setPhotosLoading(true);
     *   try {
     *     const fetched = await fetchBlockPhotos(...);
     *     applyPhotoUpdateIfCurrent(gen, () => loadGenRef.current, fetched, setPhotos);
     *   } finally {
     *     if (gen === loadGenRef.current) setPhotosLoading(false);
     *   }
     */
    async function simulateLoad(
      gen: number,
      silent: boolean,
      fetchPromise: Promise<BlockPhotoRecord[] | null>,
    ): Promise<void> {
      if (!silent) setLoading(true);
      try {
        const fetched = await fetchPromise;
        applyPhotoUpdateIfCurrent(gen, () => genRef.current, fetched, setPhotos);
      } finally {
        // Fixed: no `&& !silent` — latest request must always clear spinner
        if (gen === genRef.current) setLoading(false);
      }
    }

    let resolveNonSilent!: (v: BlockPhotoRecord[] | null) => void;
    let resolveSilent!: (v: BlockPhotoRecord[] | null) => void;
    const nonSilentFetch = new Promise<BlockPhotoRecord[] | null>((r) => { resolveNonSilent = r; });
    const silentFetch   = new Promise<BlockPhotoRecord[] | null>((r) => { resolveSilent   = r; });

    // Non-silent loadPhotos starts (initial selection load): gen=1, spinner on
    const gen1 = ++genRef.current;
    const run1 = simulateLoad(gen1, false, nonSilentFetch);
    expect(isLoading).toBe(true);

    // Silent focus-refresh supersedes it: gen=2, spinner stays on
    const gen2 = ++genRef.current;
    const run2 = simulateLoad(gen2, true, silentFetch);
    expect(isLoading).toBe(true); // unchanged

    // Silent refresh resolves first with 1 photo
    resolveSilent([photo1]);
    await run2;

    // gen2 is the latest → spinner must be cleared
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(isLoading).toBe(false);
    expect(photosState).toHaveLength(1);

    // Non-silent resolves late with stale 2-photo list — must be fully discarded
    resolveNonSilent([makePhoto({ id: 902 }), makePhoto({ id: 903 })]);
    await run1;

    expect(photosState).toHaveLength(1); // state unchanged
    // Spinner was not re-toggled by the stale request
    const lastLoadingCall = setLoading.mock.calls.at(-1)?.[0];
    expect(lastLoadingCall).toBe(false);

    // Delete dialog uses the live 1-photo count — warning fires correctly
    expect(buildGridDeleteMessage(photosState.length)).toContain(ONLY_PHOTO_FRAGMENT);
  });

  // -------------------------------------------------------------------------
  // (e) Fast-path: when no newer call superseded the request, its result is
  //     applied and the delete warning fires correctly.
  // -------------------------------------------------------------------------
  it("(e) applies result normally when the generation is still current", () => {
    const photo = makePhoto({ id: 801, isCover: true });

    let latestGen = 0;
    const getLatestGen = () => latestGen;
    let photosState: BlockPhotoRecord[] = [];
    const setPhotos = jest.fn((p: BlockPhotoRecord[]) => { photosState = p; });

    const gen1 = ++latestGen;
    applyPhotoUpdateIfCurrent(gen1, getLatestGen, [photo], setPhotos);

    expect(setPhotos).toHaveBeenCalledTimes(1);
    expect(photosState).toHaveLength(1);
    expect(buildGridDeleteMessage(photosState.length)).toContain(ONLY_PHOTO_FRAGMENT);
    expect(
      buildLightboxDeleteMessage(photosState.length, photosState[0].isCover),
    ).toContain(ONLY_PHOTO_FRAGMENT);
  });
});
