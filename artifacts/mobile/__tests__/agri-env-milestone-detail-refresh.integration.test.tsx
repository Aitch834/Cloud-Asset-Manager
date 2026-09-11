/**
 * Regression coverage for the project remaining-balance badge.
 *
 * The detail screen keeps the project-wide milestone list in local state after
 * a save. This test exercises the real edit/save flow so the badge cannot
 * silently remain based on the pre-save milestone list.
 */

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
    Platform: { OS: "web" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
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

const mockSearchParams = { projectId: "7", milestoneId: "101" };

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => mockSearchParams,
}));

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
  const ReactNative = require("react-native");
  return {
    KeyboardAwareScrollViewCompat: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => React.createElement(ReactNative.ScrollView, props, children),
  };
});

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../lib/storage", () => ({
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
  setItem: jest.fn(async () => undefined),
  STORAGE_KEYS: {
    AGRI_ENV_PROJECT_MILESTONES_CACHE: "agri-env-project-milestones",
    AGRI_ENV_MILESTONES_CACHE: "agri-env-milestones",
    AGRI_ENV_PROJECTS_CACHE: "agri-env-projects",
  },
}));

jest.mock("../lib/agriEnvMilestoneCache", () => ({
  canApplyMilestoneLoad: jest.fn(() => true),
  confirmMilestoneSave: jest.fn(async (_updated, persist) => {
    await persist(_updated);
    return { offlineAvailable: true };
  }),
  persistMilestoneCacheUpdate: jest.fn(async () => ({ hydration: null })),
}));

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { ScrollView } from "react-native";
import AgriEnvMilestoneDetailScreen from "../app/agri-env-milestone-detail";

const { useFarm } = require("../lib/context/FarmContext") as {
  useFarm: jest.Mock;
};
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.Mock;
};
const { getItem } = require("../lib/storage") as {
  getItem: jest.Mock;
};
const { router } = require("expo-router") as {
  router: { back: jest.Mock; push: jest.Mock };
};

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

const initialMilestone = {
  id: 101,
  projectId: 7,
  farmId: 3,
  milestoneName: "Hedgerow management",
  dueDate: "2026-12-31",
  completionDate: "2026-09-01",
  claimAmountPence: null,
  status: "pending",
  evidenceNotes: null,
};

const siblingMilestone = {
  id: 102,
  projectId: 7,
  farmId: 3,
  milestoneName: "Soil improvement",
  dueDate: "2026-11-30",
  completionDate: "2026-08-15",
  claimAmountPence: 20_000,
  status: "paid",
  evidenceNotes: null,
};

    const paidMilestone = {
      ...initialMilestone,
      status: "paid",
      claimAmountPence: 60_000,
    };

type MockMilestone = Omit<typeof initialMilestone, "claimAmountPence"> & {
  claimAmountPence: number | null;
};

function response(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

describe("agri-environment milestone remaining balance", () => {
  let serverMilestone: MockMilestone = initialMilestone;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.projectId = "7";
    mockSearchParams.milestoneId = "101";
    getItem.mockResolvedValue(null);
    serverMilestone = initialMilestone;
    useFarm.mockReturnValue({
      currentFarm: { id: 3, name: "Test Farm" },
    });
    apiFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (options?.method === "PUT") {
        serverMilestone = paidMilestone;
        return response({ milestone: serverMilestone });
      }
      if (url.endsWith("/agri-env-projects/7/milestones")) {
        return response({ milestones: [serverMilestone, siblingMilestone] });
      }
      if (url.endsWith("/agri-env-projects")) {
        return response({ projects: [project] });
      }
      throw new Error(`Unexpected API request: ${url}`);
    });
  });

  it("refreshes the remaining-balance badge immediately after saving a paid claim", async () => {
    const screen = render(<AgriEnvMilestoneDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("£800 left")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("edit-milestone-button"));
    fireEvent.press(screen.getByTestId("milestone-status-paid"));
    fireEvent.changeText(screen.getByTestId("milestone-claim-amount-input"), "300");
    fireEvent.press(screen.getByTestId("save-milestone-button"));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/farms/3/agri-env-projects/7/milestones/101",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining('"claimAmountPence":30000'),
        }),
      );
      expect(screen.getByText("£500 left")).toBeTruthy();
      expect(screen.getByText("£500 claimed so far")).toBeTruthy();
      expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
    });
  });

  it("shows the server-confirmed paid claim after reopening the milestone", async () => {
    const firstVisit = render(<AgriEnvMilestoneDetailScreen />);

    await waitFor(() => {
      expect(firstVisit.getByText("£800 left")).toBeTruthy();
    });

    fireEvent.press(firstVisit.getByTestId("edit-milestone-button"));
    fireEvent.press(firstVisit.getByTestId("milestone-status-paid"));
    fireEvent.changeText(
      firstVisit.getByTestId("milestone-claim-amount-input"),
      "300",
    );
    fireEvent.press(firstVisit.getByTestId("save-milestone-button"));

    await waitFor(() => {
      expect(serverMilestone).toEqual(paidMilestone);
    });

    firstVisit.unmount();
    const reopened = render(<AgriEnvMilestoneDetailScreen />);

    await waitFor(() => {
      expect(reopened.getAllByText("Paid").length).toBeGreaterThan(0);
      expect(reopened.getByText("£300")).toBeTruthy();
      expect(reopened.getByText("£500 left")).toBeTruthy();
      expect(reopened.getByText("£500 claimed so far")).toBeTruthy();
    });
  });

  it("warns while the entered claim exceeds the live remaining balance", async () => {
    const screen = render(<AgriEnvMilestoneDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("£800 left")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("edit-milestone-button"));
    fireEvent.changeText(screen.getByTestId("milestone-claim-amount-input"), "800.01");

    expect(screen.getByTestId("milestone-claim-balance-warning")).toBeTruthy();
    expect(
      screen.getByText("This claim exceeds the remaining project balance of £800."),
    ).toBeTruthy();

    fireEvent.changeText(screen.getByTestId("milestone-claim-amount-input"), "800");

    expect(screen.queryByTestId("milestone-claim-balance-warning")).toBeNull();
  });

  it("treats an existing paid claim as available when editing that claim", async () => {
    const paidMilestone = {
      ...initialMilestone,
      status: "paid",
      claimAmountPence: 60_000,
    };
    apiFetch.mockImplementation(async (url: string) => {
      if (url.endsWith("/agri-env-projects/7/milestones")) {
        return response({ milestones: [paidMilestone, siblingMilestone] });
      }
      if (url.endsWith("/agri-env-projects")) {
        return response({ projects: [project] });
      }
      throw new Error(`Unexpected API request: ${url}`);
    });

    const screen = render(<AgriEnvMilestoneDetailScreen />);
    await waitFor(() => expect(screen.getByText("£200 left")).toBeTruthy());

    fireEvent.press(screen.getByTestId("edit-milestone-button"));

    expect(screen.queryByTestId("milestone-claim-balance-warning")).toBeNull();

    fireEvent.changeText(screen.getByTestId("milestone-claim-amount-input"), "800.01");

    expect(
      screen.getByText("This claim exceeds the remaining project balance of £800."),
    ).toBeTruthy();
  });

  it("does not warn when the project has no configured grant ceiling", async () => {
    apiFetch.mockImplementation(async (url: string) => {
      if (url.endsWith("/agri-env-projects/7/milestones")) {
        return response({ milestones: [initialMilestone, siblingMilestone] });
      }
      if (url.endsWith("/agri-env-projects")) {
        return response({
          projects: [{ ...project, totalGrantValuePence: null }],
        });
      }
      throw new Error(`Unexpected API request: ${url}`);
    });

    const screen = render(<AgriEnvMilestoneDetailScreen />);
    await waitFor(() => expect(screen.getByText("Hedgerow management")).toBeTruthy());

    fireEvent.press(screen.getByTestId("edit-milestone-button"));
    fireEvent.changeText(screen.getByTestId("milestone-claim-amount-input"), "900");

    expect(screen.queryByTestId("milestone-claim-balance-warning")).toBeNull();
  });

  it("keeps project context while opening, refreshing, and leaving a sibling milestone", async () => {
    const cachedAt = "2026-09-10T09:30:00.000Z";
    getItem.mockImplementation(async (key: string) => {
      if (key === "agri-env-project-milestones_3_7") {
        return { milestones: [initialMilestone, siblingMilestone], cachedAt };
      }
      if (key === "agri-env-projects_3") {
        return { data: [project], cachedAt };
      }
      return null;
    });

    const screen = render(<AgriEnvMilestoneDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Soil improvement")).toBeTruthy();
      expect(screen.getByText("Due 30 Nov 2026")).toBeTruthy();
      expect(screen.getByText("Paid")).toBeTruthy();
      expect(screen.getByText("Countryside Stewardship")).toBeTruthy();
      expect(screen.queryByText("£200")).toBeNull();
    });

    fireEvent.press(screen.getByTestId("sibling-milestone-102"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/agri-env-milestone-detail",
      params: { projectId: "7", milestoneId: "102" },
    });

    mockSearchParams.milestoneId = "102";
    screen.rerender(<AgriEnvMilestoneDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("£200")).toBeTruthy();
      expect(screen.getByText("Countryside Stewardship")).toBeTruthy();
      expect(screen.getByText("Hedgerow management")).toBeTruthy();
      expect(screen.getByText("£200")).toBeTruthy();
    });

    apiFetch.mockClear();
    const detailScrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    const refreshControl = detailScrollView.props.refreshControl as React.ReactElement<{
      onRefresh: () => void;
    }>;
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(2);
      expect(apiFetch).toHaveBeenNthCalledWith(
        1,
        "/api/farms/3/agri-env-projects/7/milestones",
        expect.any(Object),
      );
      expect(screen.getByText("£200")).toBeTruthy();
      expect(screen.getByText("Countryside Stewardship")).toBeTruthy();
      expect(screen.getByText("£200")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("milestone-detail-back-button"));
    expect(router.back).toHaveBeenCalledTimes(1);

    mockSearchParams.milestoneId = "101";
    screen.rerender(<AgriEnvMilestoneDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Hedgerow management")).toBeTruthy();
      expect(screen.getByText("Countryside Stewardship")).toBeTruthy();
      expect(screen.queryByText("£200")).toBeNull();
    });
  });
});
