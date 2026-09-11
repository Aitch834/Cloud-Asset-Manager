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
    FlatList: ({
      data = [],
      renderItem,
      ListEmptyComponent,
      ListHeaderComponent,
      ...props
    }: {
      data?: unknown[];
      renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      [key: string]: unknown;
    }) =>
      React.createElement(
        "FlatList",
        props,
        ListHeaderComponent,
        data.length && renderItem
          ? data.map((item, index) =>
              React.createElement(React.Fragment, { key: index }, renderItem({ item, index })),
            )
          : ListEmptyComponent,
      ),
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
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement("Text", props, name),
  };
});

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
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
    AGRI_ENV_PROJECTS_CACHE: "agri-env-projects",
    AGRI_ENV_MILESTONES_CACHE: "agri-env-milestones",
    AGRI_ENV_TRANSACTIONS_CACHE: "agri-env-transactions",
    AGRI_ENV_SCHEME_FILTER: "agri-env-scheme-filter",
    AGRI_ENV_STATUS_FILTER: "agri-env-status-filter",
  },
}));

jest.mock("../lib/agri-env-cache", () => ({
  canApplyAgriEnvCacheLoad: jest.fn(() => true),
}));

jest.mock("../lib/agri-env-deadline-summary", () => ({
  getMilestoneDeadlineCounts: jest.fn(() => ({ overdue: 0, upcoming: 0 })),
}));

jest.mock("../lib/agri-env-transaction-link", () => ({
  applyTransactionProjectLink: jest.fn((transactions: unknown[]) => transactions),
}));

jest.mock("../lib/hooks/usePersistedAgriEnvStatusFilter", () => ({
  usePersistedAgriEnvStatusFilter: () => require("react").useState(null),
}));

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import {
  getIncomeSummaryYears,
  getPaidIncomeSummary,
  hasCompletionDateInYear,
} from "@/lib/agri-env-income-summary";
import AgriEnvProjectsScreen from "../app/agri-env-projects";

const { useFarm } = require("../lib/context/FarmContext") as { useFarm: jest.Mock };
const { apiFetch } = require("../lib/apiFetch") as { apiFetch: jest.Mock };

function response(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

describe("agri-environment income summary years", () => {
  it("includes a historic year with submitted-only income", () => {
    const years = getIncomeSummaryYears([
      { projectId: 1, status: "submitted", completionDate: "2024-11-15" },
      { projectId: 1, status: "paid", completionDate: "2026-03-03" },
      { projectId: 2, status: "submitted", completionDate: "2023-09-20" },
      { projectId: 1, status: "pending", completionDate: "2025-01-10" },
    ], new Set([1]), 2026);

    expect(years).toEqual([2026, 2024]);
    expect(hasCompletionDateInYear("2024-11-15", 2024)).toBe(true);
    expect(hasCompletionDateInYear("2024-11-15", 2026)).toBe(false);
  });

  it("recalculates farm-wide and per-project paid totals when the income year changes", () => {
    const currentYear = 2026;
    const milestones = [
      { projectId: 1, status: "paid", completionDate: "2026-02-12", claimAmountPence: 12_500 },
      { projectId: 2, status: "paid", completionDate: "2026-08-03", claimAmountPence: 7_500 },
      { projectId: 1, status: "paid", completionDate: "2024-11-15", claimAmountPence: 4_000 },
      { projectId: 2, status: "paid", completionDate: "2024-04-21", claimAmountPence: 6_000 },
      { projectId: 2, status: "submitted", completionDate: "2024-09-01", claimAmountPence: 99_000 },
      { projectId: 3, status: "paid", completionDate: "2026-01-01", claimAmountPence: 50_000 },
    ];
    const includedProjectIds = new Set([1, 2]);
    const availableYears = getIncomeSummaryYears(milestones, includedProjectIds, currentYear);

    expect(availableYears).toEqual([2026, 2024]);

    let selectedYear = currentYear;
    let summary = getPaidIncomeSummary(milestones, includedProjectIds, selectedYear);

    expect(summary.farmPaidPence).toBe(20_000);
    expect(summary.paidPenceByProject.get(1)).toBe(12_500);
    expect(summary.paidPenceByProject.get(2)).toBe(7_500);

    selectedYear = availableYears[1];
    summary = getPaidIncomeSummary(milestones, includedProjectIds, selectedYear);

    expect(summary.farmPaidPence).toBe(10_000);
    expect(summary.paidPenceByProject.get(1)).toBe(4_000);
    expect(summary.paidPenceByProject.get(2)).toBe(6_000);
  });

  it("filters rendered payments by year, restores all years, and shows an empty year", async () => {
    const currentYear = new Date().getFullYear();
    const historicYear = currentYear - 2;
    const emptyYear = currentYear - 3;
    const currentPayment = "Current year stewardship payment";
    const historicPayment = "Historic stewardship payment";

    useFarm.mockReturnValue({ currentFarm: { id: 3, name: "Test Farm" } });
    apiFetch.mockImplementation(async (url: string) => {
      if (url.endsWith("/agri-env-projects")) {
        return response({
          projects: [{
            id: 1,
            schemeName: "Countryside Stewardship",
            administeringBody: "RPA",
            agreementReference: "CS-1",
            startDate: `${emptyYear}-01-01`,
            endDate: `${currentYear + 1}-12-31`,
            totalGrantValuePence: 100_000,
            status: "active",
          }],
        });
      }
      if (url.endsWith("/agri-env-milestones")) {
        return response({
          milestones: [{
            id: 11,
            projectId: 1,
            farmId: 3,
            milestoneName: "Historic unpaid claim",
            dueDate: `${emptyYear}-03-01`,
            completionDate: `${emptyYear}-03-01`,
            claimAmountPence: 5_000,
            status: "submitted",
            evidenceNotes: null,
          }],
        });
      }
      if (url.endsWith("/financial-transactions")) {
        return response({
          records: [
            {
              id: 21,
              transactionDate: `${currentYear}-06-15`,
              transactionType: "income",
              category: "Grant / Subsidy",
              description: currentPayment,
              amountPence: 25_000,
              reference: "CURRENT",
              agriEnvProjectId: 1,
            },
            {
              id: 22,
              transactionDate: `${historicYear}-09-20`,
              transactionType: "income",
              category: "Grant / Subsidy",
              description: historicPayment,
              amountPence: 15_000,
              reference: "HISTORIC",
              agriEnvProjectId: 1,
            },
          ],
        });
      }
      throw new Error(`Unexpected API request: ${url}`);
    });

    const screen = render(React.createElement(AgriEnvProjectsScreen));

    await waitFor(() => {
      expect(screen.getByText(currentPayment)).toBeTruthy();
      expect(screen.queryByText(historicPayment)).toBeNull();
    });

    fireEvent.press(screen.getByTestId(`agri-env-payment-year-${historicYear}`));
    expect(screen.getByText(historicPayment)).toBeTruthy();
    expect(screen.queryByText(currentPayment)).toBeNull();

    fireEvent.press(screen.getByTestId("agri-env-payment-year-all"));
    expect(screen.getByText(currentPayment)).toBeTruthy();
    expect(screen.getByText(historicPayment)).toBeTruthy();

    fireEvent.press(screen.getByTestId(`agri-env-summary-year-${emptyYear}`));
    expect(screen.queryByText(currentPayment)).toBeNull();
    expect(screen.queryByText(historicPayment)).toBeNull();
    expect(screen.getByText(`No payments received in ${emptyYear}.`)).toBeTruthy();
  });
});