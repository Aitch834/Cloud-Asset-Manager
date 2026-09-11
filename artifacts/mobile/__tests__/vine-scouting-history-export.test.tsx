/**
 * Regression coverage for the scouting history date filter/export contract.
 *
 * The export must use the same date-filtered rows shown in the history list,
 * while passing the canonical ISO bounds to the printable report header.
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

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    FlatList: ({
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
        "FlatList",
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
      ),
    Image: host("Image"),
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal: ({ visible, children, ...props }: Record<string, unknown>) =>
      visible ? React.createElement("Modal", props, children) : null,
    Platform: { OS: "android" },
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

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Warning: "warning" },
}));

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement("Text", props, name),
  };
});

jest.mock("../components/VineBlockPicker", () => ({
  VineBlockPicker: () => null,
}));
jest.mock("../components/ScoutingPhotoSection", () => ({
  ScoutingPhotoSection: () => null,
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
jest.mock("../lib/hooks/usePersistedDateRange", () => ({
  usePersistedDateRange: jest.fn(),
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

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import VineScoutingHistoryScreen from "../app/vine-scouting-history";

const { useFarm } = require("../lib/context/FarmContext") as {
  useFarm: jest.Mock;
};
const { useApiFetch } = require("../lib/hooks/useApiFetch") as {
  useApiFetch: jest.Mock;
};
const { useApiVineBlocks } = require("../lib/hooks/useApiVineBlocks") as {
  useApiVineBlocks: jest.Mock;
};
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as {
  useFarmIdentifiers: jest.Mock;
};
const { useIdentifierBannerDismiss } = require("../lib/hooks/useIdentifierBannerDismiss") as {
  useIdentifierBannerDismiss: jest.Mock;
};
const { usePersistedBlockFilter } = require("../lib/hooks/usePersistedBlockFilter") as {
  usePersistedBlockFilter: jest.Mock;
};
const { usePersistedDateRange } = require("../lib/hooks/usePersistedDateRange") as {
  usePersistedDateRange: jest.Mock;
};
const { usePersistedPressureFilter } = require("../lib/hooks/usePersistedPressureFilter") as {
  usePersistedPressureFilter: jest.Mock;
};
const { usePersistedVintage } = require("../lib/hooks/usePersistedVintage") as {
  usePersistedVintage: jest.Mock;
};
const { usePrint } = require("../lib/hooks/usePrint") as {
  usePrint: jest.Mock;
};

const FARM_ID = "farm-1";
let persistedBlockIds: number[] = [];

function makeRecord(id: number, scoutDate: string, blockName: string) {
  return {
    id,
    scoutDate,
    nextScoutDate: null,
    blockId: null,
    blockName,
    scoutedBy: `Operator ${id}`,
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
    photoCount: 0,
    coverPhotoId: null,
    coverPhotoUrl: null,
  };
}

const records = [
  { ...makeRecord(1, "2026-06-01", "Outside Before"), nextScoutDate: "2000-01-01" },
  { ...makeRecord(2, "2026-06-15", "Inside Window"), nextScoutDate: "2999-12-31" },
  makeRecord(3, "2026-07-01", "Outside After"),
];

const savePdf = jest.fn(async () => undefined);

function setDateRange(screen: ReturnType<typeof render>, from: string, to: string) {
  const dateInputs = screen.getAllByPlaceholderText("DD/MM/YYYY");
  fireEvent.changeText(dateInputs[0], from);
  fireEvent.changeText(dateInputs[1], to);
}

function lastPdfHtml(): string {
  return savePdf.mock.calls.at(-1)?.[0] as string;
}

beforeEach(() => {
  jest.clearAllMocks();
  persistedBlockIds = [];
  useFarm.mockReturnValue({
    currentFarm: { id: FARM_ID, name: "Test Vineyard" },
    user: { id: "test-user" },
  });
  useApiFetch.mockReturnValue({
    records,
    loading: false,
    refreshing: false,
    error: null,
    refresh: jest.fn(),
    recordsFarmId: FARM_ID,
  });
  useApiVineBlocks.mockReturnValue({ blocks: [], loading: false });
  useFarmIdentifiers.mockReturnValue({
    address: "Test Lane",
    cphNumber: "12/345/6789",
    sbiNumber: "123456789",
    loading: false,
    justSaved: false,
    clearJustSaved: jest.fn(),
    refetch: jest.fn(),
  });
  useIdentifierBannerDismiss.mockReturnValue({
    dismissed: true,
    dismiss: jest.fn(),
  });
  usePersistedBlockFilter.mockImplementation(() => {
    const [selectedIds, setSelectedIdsRaw] = React.useState<number[]>(persistedBlockIds);
    const setSelectedIds = (ids: number[]) => {
      persistedBlockIds = ids;
      setSelectedIdsRaw(ids);
    };
    return [selectedIds, setSelectedIds, FARM_ID];
  });
  usePersistedDateRange.mockImplementation(() => {
    const [from, setFrom] = React.useState("");
    const [to, setTo] = React.useState("");
    return [from, setFrom, to, setTo];
  });
  usePersistedPressureFilter.mockReturnValue(["__all__", jest.fn()]);
  usePersistedVintage.mockReturnValue([null, jest.fn(), FARM_ID]);
  usePrint.mockReturnValue({ savePdf });
});

describe("VineScoutingHistoryScreen — block filter shortcuts", () => {
  const blockRecords = [
    { ...makeRecord(11, "2026-06-01", "North Scouting"), blockId: 101 },
    { ...makeRecord(12, "2026-06-02", "South Scouting"), blockId: 202 },
  ];

  beforeEach(() => {
    useApiFetch.mockReturnValue({
      records: blockRecords,
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: FARM_ID,
    });
    useApiVineBlocks.mockReturnValue({
      blocks: [
        { id: 101, blockName: "North Block" },
        { id: 202, blockName: "South Block" },
      ],
      loading: false,
    });
  });

  it("handles Show all, Select none, individual chips, and restores the persisted choice", () => {
    const screen = render(<VineScoutingHistoryScreen />);

    expect(screen.getByText("Operator 11")).toBeTruthy();
    expect(screen.getByText("Operator 12")).toBeTruthy();

    fireEvent.press(screen.getByTestId("scouting-block-filter-select-none"));
    expect(screen.getByText("Operator 11")).toBeTruthy();
    expect(screen.queryByText("Operator 12")).toBeNull();

    fireEvent.press(screen.getByTestId("scouting-block-filter-show-all"));
    expect(screen.getByText("Operator 11")).toBeTruthy();
    expect(screen.getByText("Operator 12")).toBeTruthy();

    fireEvent.press(screen.getByTestId("scouting-block-filter-202"));
    expect(screen.queryByText("Operator 11")).toBeNull();
    expect(screen.getByText("Operator 12")).toBeTruthy();

    screen.unmount();
    const returnedScreen = render(<VineScoutingHistoryScreen />);
    expect(returnedScreen.queryByText("Operator 11")).toBeNull();
    expect(returnedScreen.getByText("Operator 12")).toBeTruthy();
  });
});

describe("VineScoutingHistoryScreen — date-filtered PDF export", () => {
  it("exports only records in a bounded range and prints the canonical dates", async () => {
    const screen = render(<VineScoutingHistoryScreen />);
    setDateRange(screen, "10/06/2026", "20/06/2026");

    await waitFor(() => {
      expect(screen.getByText("Operator 2")).toBeTruthy();
      expect(screen.queryByText("Operator 1")).toBeNull();
      expect(screen.queryByText("Operator 3")).toBeNull();
    });

    fireEvent.press(screen.getByTestId("vine-scouting-export"));

    await waitFor(() => {
      expect(savePdf).toHaveBeenCalledWith(expect.any(String), "Vine Scouting History");
    });
    const html = lastPdfHtml();
    expect(html).toContain("1 record");
    expect(html).toContain("Date range: From: <strong>10 Jun 2026</strong>");
    expect(html).toContain("To: <strong>20 Jun 2026</strong>");
    expect(html).toContain("Inside Window");
    expect(html).not.toContain("Outside Before");
    expect(html).not.toContain("Outside After");
  });

  it("supports a From-only filter when exporting", async () => {
    const screen = render(<VineScoutingHistoryScreen />);
    setDateRange(screen, "15/06/2026", "");

    await waitFor(() => {
      expect(screen.getByText("Operator 2")).toBeTruthy();
      expect(screen.getByText("Operator 3")).toBeTruthy();
      expect(screen.queryByText("Operator 1")).toBeNull();
    });

    fireEvent.press(screen.getByTestId("vine-scouting-export"));

    await waitFor(() => expect(savePdf).toHaveBeenCalledTimes(1));
    const html = lastPdfHtml();
    expect(html).toContain("2 records");
    expect(html).toContain("Date range: From: <strong>15 Jun 2026</strong>");
    expect(html).not.toContain("Outside Before");
    expect(html).toContain("Inside Window");
    expect(html).toContain("Outside After");
  });

  it("supports a To-only filter when exporting", async () => {
    const screen = render(<VineScoutingHistoryScreen />);
    setDateRange(screen, "", "15/06/2026");

    await waitFor(() => {
      expect(screen.getByText("Operator 1")).toBeTruthy();
      expect(screen.getByText("Operator 2")).toBeTruthy();
      expect(screen.queryByText("Operator 3")).toBeNull();
    });

    fireEvent.press(screen.getByTestId("vine-scouting-export"));

    await waitFor(() => expect(savePdf).toHaveBeenCalledTimes(1));
    const html = lastPdfHtml();
    expect(html).toContain("2 records");
    expect(html).toContain("Date range: To: <strong>15 Jun 2026</strong>");
    expect(html).toContain("Outside Before");
    expect(html).toContain("Inside Window");
    expect(html).not.toContain("Outside After");
  });

  it("exports scheduled, overdue, and unscheduled next scouting states", async () => {
    const screen = render(<VineScoutingHistoryScreen />);

    fireEvent.press(screen.getByTestId("vine-scouting-export"));

    await waitFor(() => expect(savePdf).toHaveBeenCalledTimes(1));
    const html = lastPdfHtml();
    expect(html).toContain("<th>Next Scouting</th>");
    expect(html).toContain("Overdue &middot; 01 January 2000");
    expect(html).toContain("Next: 31 December 2999");
    expect(html).toContain("Next: Not scheduled");
  });

  it("shows the reversed-range validation and keeps export disabled", async () => {
    const screen = render(<VineScoutingHistoryScreen />);
    setDateRange(screen, "20/06/2026", "10/06/2026");

    await waitFor(() => {
      expect(screen.getByText("'From' date must be before 'To' date.")).toBeTruthy();
    });

    expect(screen.getByTestId("vine-scouting-export").props.disabled).toBe(true);
  });

  it.each([
    ["From", "31/02/2026", ""],
    ["To", "", "2026-13-01"],
    ["From", "1/1/2026", ""],
    ["To", "", "not-a-date"],
  ])("keeps export disabled for a complete invalid %s date", async (_field, from, to) => {
    const screen = render(<VineScoutingHistoryScreen />);
    setDateRange(screen, from, to);

    await waitFor(() => {
      expect(screen.getByText("Use DD/MM/YYYY or YYYY-MM-DD format.")).toBeTruthy();
      expect(screen.getByTestId("vine-scouting-export").props.disabled).toBe(true);
    });

    fireEvent.press(screen.getByTestId("vine-scouting-export"));
    expect(savePdf).not.toHaveBeenCalled();
  });

  it("keeps export available while a date is still partial", async () => {
    const screen = render(<VineScoutingHistoryScreen />);
    setDateRange(screen, "2026-06-", "");

    await waitFor(() => {
      expect(screen.queryByText("Use DD/MM/YYYY or YYYY-MM-DD format.")).toBeNull();
      expect(screen.getByTestId("vine-scouting-export").props.disabled).toBe(false);
    });
  });
});

describe("VineScoutingHistoryScreen — filtered empty states", () => {
  beforeEach(() => {
    useApiFetch.mockReturnValue({
      records: [],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: FARM_ID,
    });
  });

  it("shows block-specific guidance when only the block filter is active", () => {
    usePersistedBlockFilter.mockReturnValue([[99], jest.fn()]);

    const screen = render(<VineScoutingHistoryScreen />);

    expect(screen.getByText("No records for the selected block(s).")).toBeTruthy();
    expect(screen.queryByText("Scouting records you create will appear here.")).toBeNull();
  });

  it("keeps the generic current-filters message for an empty date range", () => {
    usePersistedDateRange.mockReturnValue([
      "01/01/2026",
      jest.fn(),
      "",
      jest.fn(),
    ]);

    const screen = render(<VineScoutingHistoryScreen />);

    expect(screen.getByText("No records match the current filters.")).toBeTruthy();
  });

  it("keeps the search-specific empty-state message", () => {
    const screen = render(<VineScoutingHistoryScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Search by block, scout or date…"),
      "mildew",
    );

    expect(screen.getByText('No scouting records match "mildew"')).toBeTruthy();
    expect(
      screen.getByText("Try adjusting your search or clear the filters to see all records."),
    ).toBeTruthy();
  });

  it("keeps the pressure-filter-specific empty-state message", () => {
    usePersistedPressureFilter.mockReturnValue(["3", jest.fn()]);

    const screen = render(<VineScoutingHistoryScreen />);

    expect(
      screen.getByText('No scouting records match pressure "High only"'),
    ).toBeTruthy();
    expect(
      screen.getByText("Try adjusting your search or clear the filters to see all records."),
    ).toBeTruthy();
  });

  it("prioritises search-specific guidance over block-only guidance", () => {
    usePersistedBlockFilter.mockReturnValue([[99], jest.fn()]);
    const screen = render(<VineScoutingHistoryScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Search by block, scout or date…"),
      "mildew",
    );

    expect(screen.getByText('No scouting records match "mildew"')).toBeTruthy();
    expect(screen.queryByText("No records for the selected block(s).")).toBeNull();
  });

  it("prioritises date-filter guidance over block-only guidance", () => {
    usePersistedBlockFilter.mockReturnValue([[99], jest.fn()]);
    usePersistedDateRange.mockReturnValue([
      "01/01/2026",
      jest.fn(),
      "",
      jest.fn(),
    ]);

    const screen = render(<VineScoutingHistoryScreen />);

    expect(screen.getByText("No records match the current filters.")).toBeTruthy();
    expect(screen.queryByText("No records for the selected block(s).")).toBeNull();
  });

  it("prioritises pressure-specific guidance over block-only guidance", () => {
    usePersistedBlockFilter.mockReturnValue([[99], jest.fn()]);
    usePersistedPressureFilter.mockReturnValue(["3", jest.fn()]);

    const screen = render(<VineScoutingHistoryScreen />);

    expect(
      screen.getByText('No scouting records match pressure "High only"'),
    ).toBeTruthy();
    expect(screen.queryByText("No records for the selected block(s).")).toBeNull();
  });
});