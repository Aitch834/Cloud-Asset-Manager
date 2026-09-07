jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) =>
      React.createElement(name, { ...props, ref }, props.children));
  const FlatList = ({
    data = [],
    renderItem,
    ListHeaderComponent,
    ListEmptyComponent,
    ...props
  }: {
    data?: unknown[];
    renderItem?: (args: { item: unknown; index: number }) => React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement(
    "FlatList",
    props,
    ListHeaderComponent,
    data.length > 0
      ? data.map((item, index) => React.createElement(
          React.Fragment,
          { key: index },
          renderItem?.({ item, index }),
        ))
      : ListEmptyComponent,
  );

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    FlatList,
    Platform: { OS: "web" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => style,
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

let mockProjectListFocusCallback: (() => void | (() => void)) | null = null;
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    router: { push: jest.fn(), back: jest.fn() },
    useLocalSearchParams: () => ({ projectId: "7", milestoneId: "101" }),
    useFocusEffect: (callback: () => void | (() => void)) => {
      mockProjectListFocusCallback = callback;
      React.useEffect(callback, [callback]);
    },
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => React.createElement("DateTimePicker"),
    DateTimePickerAndroid: { open: jest.fn() },
  };
});

jest.mock("../components/KeyboardAwareScrollViewCompat", () => {
  const React = require("react");
  const { ScrollView } = require("react-native");
  return {
    KeyboardAwareScrollViewCompat: ({ children, ...props }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => React.createElement(ScrollView, props, children),
  };
});

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({ currentFarm: { id: 3, name: "Test Farm" } }),
}));

jest.mock("../lib/hooks/usePersistedAgriEnvStatusFilter", () => ({
  usePersistedAgriEnvStatusFilter: () => [null, jest.fn()],
}));

const mockApiFetch = jest.fn();
jest.mock("../lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const mockStorage = new Map<string, unknown>();
jest.mock("../lib/storage", () => ({
  AGRI_ENV_CACHE_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: unknown) => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
  STORAGE_KEYS: {
    AGRI_ENV_PROJECTS_CACHE: "agri-env-projects",
    AGRI_ENV_MILESTONES_CACHE: "agri-env-milestones",
    AGRI_ENV_TRANSACTIONS_CACHE: "agri-env-transactions",
    AGRI_ENV_PROJECT_MILESTONES_CACHE: "agri-env-project-milestones",
    AGRI_ENV_SCHEME_FILTER: "agri-env-scheme-filter",
  },
}));

import {
  canApplyMilestoneLoad,
  mergeMilestone,
  persistMilestoneCacheUpdate,
} from "../lib/agriEnvMilestoneCache";
import { canApplyAgriEnvCacheLoad } from "../lib/agri-env-cache";
import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import AgriEnvMilestoneDetailScreen from "../app/agri-env-milestone-detail";
import AgriEnvProjectsScreen from "../app/agri-env-projects";

const { router: mockRouter } = require("expo-router") as {
  router: { push: jest.Mock; back: jest.Mock };
};

interface CachedMilestone {
  id: number;
  evidenceNotes: string | null;
  status: string;
}

describe("agri-environment milestone detail cache refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();
    mockProjectListFocusCallback = null;
  });

  it("merges a saved response into a freshly fetched farm-wide list", () => {
    const farmMilestones = [
      {
        id: 17,
        status: "pending",
        completionDate: null,
        claimAmountPence: null,
        evidenceNotes: "Original evidence note",
      },
      {
        id: 23,
        status: "paid",
        completionDate: "2026-08-01",
        claimAmountPence: 25000,
        evidenceNotes: "Already paid",
      },
    ];
    const savedMilestone = {
      id: 17,
      status: "submitted",
      completionDate: "2026-09-02",
      claimAmountPence: 123456,
      evidenceNotes: "Updated on site",
    };

    expect(mergeMilestone(farmMilestones, savedMilestone)).toEqual([
      savedMilestone,
      farmMilestones[1],
    ]);
  });

  it("creates a readable fallback list when the farm-wide cache was absent", () => {
    const savedMilestone = {
      id: 17,
      status: "paid",
      completionDate: "2026-09-02",
      claimAmountPence: 123456,
      evidenceNotes: "Force-quit persistence check",
    };

    expect(mergeMilestone([], savedMilestone)).toEqual([savedMilestone]);
  });

  it("persists both caches before an absent-list bootstrap GET resolves", async () => {
    const savedMilestone = {
      id: 17,
      status: "paid",
      completionDate: "2026-09-02",
      claimAmountPence: 123456,
      evidenceNotes: "Force-quit persistence check",
    };
    const projectWrites: typeof savedMilestone[][] = [];
    const allWrites: typeof savedMilestone[][] = [];
    let resolveHydration!: (milestones: typeof savedMilestone[]) => void;
    const pendingHydration = new Promise<typeof savedMilestone[]>((resolve) => {
      resolveHydration = resolve;
    });

    const result = await persistMilestoneCacheUpdate({
      updated: savedMilestone,
      projectMilestones: [],
      allMilestones: null,
      persistProjectMilestones: async (milestones) => {
        projectWrites.push(milestones);
      },
      persistAllMilestones: async (milestones) => {
        allWrites.push(milestones);
      },
      hydrateAllMilestones: () => pendingHydration,
    });

    expect(projectWrites).toEqual([[savedMilestone]]);
    expect(allWrites).toEqual([[savedMilestone]]);

    resolveHydration([
      savedMilestone,
      { ...savedMilestone, id: 23, evidenceNotes: "Another project" },
    ]);
    await result.hydration;
    expect(allWrites[1]).toHaveLength(2);
  });

  it("keeps the confirmed save when a pre-save GET resolves afterwards", async () => {
    const staleMilestones: CachedMilestone[] = [{
      id: 17,
      evidenceNotes: "Original evidence note",
      status: "pending",
    }];
    const savedMilestones: CachedMilestone[] = [{
      id: 17,
      evidenceNotes: "Updated on site",
      status: "submitted",
    }];

    let currentMutationVersion = 0;
    const preSaveRequestVersion = currentMutationVersion;
    let cachedMilestones = staleMilestones;
    let resolveDelayedGet!: (milestones: CachedMilestone[]) => void;
    const delayedGet = new Promise<CachedMilestone[]>((resolve) => {
      resolveDelayedGet = resolve;
    });

    const applyDelayedGet = delayedGet.then((milestones) => {
      if (canApplyMilestoneLoad(preSaveRequestVersion, currentMutationVersion)) {
        cachedMilestones = milestones;
      }
    });

    // A successful PUT advances the version and writes the confirmed response.
    currentMutationVersion += 1;
    cachedMilestones = savedMilestones;

    // The older GET completes last and must not overwrite the saved cache.
    resolveDelayedGet(staleMilestones);
    await applyDelayedGet;

    expect(cachedMilestones).toEqual(savedMilestones);
  });

  it("does not render farm A transactions when its delayed cache read resolves after switching to farm B", async () => {
    let currentGeneration = 0;
    const farmAGeneration = ++currentGeneration;
    let renderedTransactions: string[] = [];
    let resolveFarmACache!: (transactions: string[]) => void;
    const farmACacheRead = new Promise<string[]>((resolve) => {
      resolveFarmACache = resolve;
    });

    const applyFarmACache = farmACacheRead.then((transactions) => {
      if (canApplyAgriEnvCacheLoad(farmAGeneration, currentGeneration)) {
        renderedTransactions = transactions;
      }
    });

    // Switching farms starts a new load before the old farm's cache finishes.
    currentGeneration++;
    resolveFarmACache(["Farm A payment"]);
    await applyFarmACache;

    expect(renderedTransactions).toEqual([]);
  });

  it("refreshes the project drawdown after returning from an updated milestone", async () => {
    const cachedAt = new Date().toISOString();
    const project = {
      id: 7,
      schemeName: "Countryside Stewardship",
      administeringBody: "RPA",
      agreementReference: "AG-7",
      startDate: "2026-01-01",
      endDate: "2027-12-31",
      totalGrantValuePence: 100_000,
      status: "active",
    };
    const staleMilestone = {
      id: 101,
      projectId: 7,
      farmId: 3,
      milestoneName: "Hedgerow management",
      dueDate: "2026-12-31",
      completionDate: "2026-09-01",
      claimAmountPence: 10_000,
      status: "paid",
      evidenceNotes: null,
    };
    const refreshedMilestone = {
      ...staleMilestone,
      claimAmountPence: 30_000,
      evidenceNotes: "Updated on site",
    };
    let farmWideMilestones = [staleMilestone];

    mockStorage.set("agri-env-projects_3", { data: [project], cachedAt });
    mockStorage.set("agri-env-milestones_3", { data: [staleMilestone], cachedAt });
    mockStorage.set("agri-env-transactions_3", { data: [], cachedAt });
    mockStorage.set("agri-env-project-milestones_3_7", {
      milestones: [staleMilestone],
      cachedAt,
    });

    const response = (payload: unknown) => ({
      ok: true,
      status: 200,
      json: async () => payload,
    }) as Response;
    mockApiFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (options?.method === "PUT") {
        farmWideMilestones = [refreshedMilestone];
        return response({ milestone: refreshedMilestone });
      }
      if (url.endsWith("/agri-env-projects/7/milestones")) {
        return response({ milestones: farmWideMilestones });
      }
      if (url.endsWith("/agri-env-projects")) {
        return response({ projects: [project] });
      }
      if (url.endsWith("/agri-env-milestones")) {
        return response({ milestones: farmWideMilestones });
      }
      if (url.endsWith("/financial-transactions")) {
        return response({ records: [] });
      }
      throw new Error(`Unexpected API request: ${url}`);
    });

    const projectsScreen = render(React.createElement(AgriEnvProjectsScreen));
    await waitFor(() => {
      expect(projectsScreen.getByText("10%")).toBeTruthy();
    });

    fireEvent.press(projectsScreen.getByLabelText(
      "Countryside Stewardship, Active. Expand details.",
    ));
    fireEvent.press(projectsScreen.getByLabelText(
      "Hedgerow management, Paid. Open milestone detail.",
    ));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/agri-env-milestone-detail",
      params: { projectId: "7", milestoneId: "101" },
    });

    const detailScreen = render(React.createElement(AgriEnvMilestoneDetailScreen));
    await waitFor(() => {
      expect(detailScreen.getByTestId("edit-milestone-button")).toBeTruthy();
    });
    fireEvent.press(detailScreen.getByTestId("edit-milestone-button"));
    fireEvent.changeText(
      detailScreen.getByTestId("milestone-claim-amount-input"),
      "300",
    );
    fireEvent.press(detailScreen.getByTestId("save-milestone-button"));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/farms/3/agri-env-projects/7/milestones/101",
        expect.objectContaining({ method: "PUT" }),
      );
      expect(mockStorage.get("agri-env-milestones_3")).toEqual(
        expect.objectContaining({ data: [refreshedMilestone] }),
      );
    });

    fireEvent.press(detailScreen.getByText("arrow-left"));
    expect(mockRouter.back).toHaveBeenCalled();

    await act(async () => {
      mockProjectListFocusCallback?.();
    });

    await waitFor(() => {
      expect(projectsScreen.getByText("30%")).toBeTruthy();
      expect(projectsScreen.getByText("£300 of £1,000 claimed in 2026")).toBeTruthy();
    });
  });
});
