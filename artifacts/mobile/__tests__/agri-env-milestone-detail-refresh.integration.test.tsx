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

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ projectId: "7", milestoneId: "101" }),
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
  persistMilestoneCacheUpdate: jest.fn(async () => ({ hydration: null })),
}));

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import AgriEnvMilestoneDetailScreen from "../app/agri-env-milestone-detail";

const { useFarm } = require("../lib/context/FarmContext") as {
  useFarm: jest.Mock;
};
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.Mock;
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

function response(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

describe("agri-environment milestone remaining balance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFarm.mockReturnValue({
      currentFarm: { id: 3, name: "Test Farm" },
    });
    apiFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (options?.method === "PUT") {
        return response({
          milestone: {
            ...initialMilestone,
            status: "paid",
            completionDate: "2026-09-01",
            claimAmountPence: 30_000,
          },
        });
      }
      if (url.endsWith("/agri-env-projects/7/milestones")) {
        return response({ milestones: [initialMilestone, siblingMilestone] });
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
      expect(screen.getByText("Paid")).toBeTruthy();
    });
  });
});