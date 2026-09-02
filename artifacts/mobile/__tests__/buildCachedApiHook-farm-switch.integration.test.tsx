jest.mock("expo/virtual/env", () => ({ env: process.env }));

jest.mock("react-native", () => {
  const ReactModule = require("react");
  const host = (name: string) =>
    ReactModule.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        ReactModule.createElement(name, { ...props, ref }, props.children),
    );

  return {
    Platform: { OS: "web" },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => style,
    },
    Text: host("Text"),
    View: host("View"),
  };
});

import React, { useEffect } from "react";
import { act, render, waitFor } from "@testing-library/react-native";

const mockKvGet = jest.fn<Promise<string | null>, [string]>();
const mockKvSet = jest.fn<Promise<void>, [string, string]>();

jest.mock("@/lib/database", () => ({
  kvGet: (...args: [string]) => mockKvGet(...args),
  kvSet: (...args: [string, string]) => mockKvSet(...args),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

import { buildCachedApiHook } from "../lib/hooks/buildCachedApiHook";

interface TestItem {
  id: number;
  farm: string;
}

interface Observation {
  farmId: string;
  itemIds: number[];
  loadedForFarmId: string | undefined;
}

const FARM_A_ID = "41";
const FARM_B_ID = "42";
const FARM_A_ITEM: TestItem = { id: 1, farm: "A" };
const FARM_B_ITEM: TestItem = { id: 2, farm: "B" };

const useTestHook = buildCachedApiHook<TestItem>(
  (farmId) => `farm_switch_cache_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/items`,
  (json) => (json as { records: TestItem[] }).records,
);

function apiResponse(items: TestItem[]): Response {
  return {
    ok: true,
    json: async () => ({ records: items }),
  } as unknown as Response;
}

describe("buildCachedApiHook farm-switch consumer safety", () => {
  const renders: Observation[] = [];
  const consumerEffects: Observation[] = [];

  function Consumer({ farmId }: { farmId: string }) {
    const { items, loadedForFarmId } = useTestHook(farmId);
    const observation = {
      farmId,
      itemIds: items.map((item) => item.id),
      loadedForFarmId,
    };
    renders.push(observation);

    useEffect(() => {
      consumerEffects.push(observation);
    }, [farmId, items, loadedForFarmId]);

    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    renders.length = 0;
    consumerEffects.length = 0;
    mockKvGet.mockResolvedValue(null);
    mockKvSet.mockResolvedValue(undefined);
    process.env.EXPO_PUBLIC_DOMAIN = "api.example.com";
    (global as unknown as Record<string, unknown>).__DEV__ = false;
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_DOMAIN;
  });

  it("never exposes Farm A items to a Farm B render or consumer effect", async () => {
    let resolveFarmB!: (response: Response) => void;
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(apiResponse([FARM_A_ITEM]))
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFarmB = resolve;
          }),
      );

    const view = render(<Consumer farmId={FARM_A_ID} />);
    await waitFor(() => {
      expect(
        renders.some(
          (entry) =>
            entry.farmId === FARM_A_ID &&
            entry.loadedForFarmId === FARM_A_ID &&
            entry.itemIds.includes(FARM_A_ITEM.id),
        ),
      ).toBe(true);
    });

    renders.length = 0;
    consumerEffects.length = 0;

    act(() => {
      view.rerender(<Consumer farmId={FARM_B_ID} />);
    });

    expect(renders[0]).toEqual({
      farmId: FARM_B_ID,
      itemIds: [],
      loadedForFarmId: FARM_A_ID,
    });
    expect(renders.every((entry) => !entry.itemIds.includes(FARM_A_ITEM.id))).toBe(true);
    expect(
      consumerEffects.every((entry) => !entry.itemIds.includes(FARM_A_ITEM.id)),
    ).toBe(true);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    await act(async () => {
      resolveFarmB(apiResponse([FARM_B_ITEM]));
    });

    await waitFor(() => {
      expect(
        renders.some(
          (entry) =>
            entry.farmId === FARM_B_ID &&
            entry.loadedForFarmId === FARM_B_ID &&
            entry.itemIds.includes(FARM_B_ITEM.id),
        ),
      ).toBe(true);
    });

    expect(renders.every((entry) => !entry.itemIds.includes(FARM_A_ITEM.id))).toBe(true);
    expect(
      consumerEffects.every((entry) => !entry.itemIds.includes(FARM_A_ITEM.id)),
    ).toBe(true);
  });
});