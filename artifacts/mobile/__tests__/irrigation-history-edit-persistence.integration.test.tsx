/**
 * Regression coverage for correcting persisted irrigation application details.
 *
 * The screen talks to a mutable in-memory API fixture so each assertion after
 * refresh proves the values came back through the history reload path.
 */

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const View = host("View");
  const Modal = ({
    visible,
    children,
    ...props
  }: {
    visible?: boolean;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (visible ? React.createElement("Modal", props, children) : null);
  const FlatList = ({
    data,
    renderItem,
    ListHeaderComponent,
    ListEmptyComponent,
    refreshControl,
    ...props
  }: {
    data: unknown[];
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    refreshControl?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement(
      View,
      props,
      refreshControl,
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
    );

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    FlatList,
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal,
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) =>
        Array.isArray(style)
          ? Object.assign({}, ...style.filter(Boolean))
          : ((style as Record<string, unknown>) ?? {}),
    },
    Text: host("Text"),
    TextInput: host("TextInput"),
    View,
  };
});

jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));
jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: "DateTimePicker",
  DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn() },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: { id: 7, name: "Persistence Test Farm", tenantSlug: "test" },
  }),
}));
jest.mock("../lib/database", () => ({
  deletePendingSyncItem: jest.fn(),
  getSyncItemsForType: jest.fn(async () => []),
  resetSyncItemToRetryById: jest.fn(),
}));
jest.mock("../lib/sync-engine", () => ({
  refreshPendingCount: jest.fn(),
  scheduleSync: jest.fn(),
  subscribe: jest.fn(() => () => undefined),
}));
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
  isAbortError: jest.fn(() => false),
}));

import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";

import IrrigationHistoryScreen from "../app/irrigation-history";
import { apiFetch } from "../lib/apiFetch";

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;

type ServerRecord = {
  id: number;
  irrigationDate: string;
  fieldId: number;
  fieldName: string;
  fieldOrBlockDescription: string;
  waterSource: string | null;
  applicationDepthMm: string | null;
  irrigationMethod: string;
  cropType: string | null;
  growthStage: string | null;
  meterStartReading: string | null;
  meterEndReading: string | null;
  volumeAppliedM3: string | null;
  areaIrrigatedHa: string | null;
  operatorName: string | null;
  rainfallLast7DaysMm: string | null;
  notes: string | null;
};

function response(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

describe("irrigation history edit persistence", () => {
  let serverRecord: ServerRecord;

  beforeEach(() => {
    jest.clearAllMocks();
    serverRecord = {
      id: 91,
      irrigationDate: "2026-09-09",
      fieldId: 14,
      fieldName: "North Field",
      fieldOrBlockDescription: "North Field",
      waterSource: "Old borehole",
      applicationDepthMm: "12",
      irrigationMethod: "Rain Gun",
      cropType: "Potatoes",
      growthStage: null,
      meterStartReading: "100",
      meterEndReading: null,
      volumeAppliedM3: "25",
      areaIrrigatedHa: "2",
      operatorName: "Alex",
      rainfallLast7DaysMm: null,
      notes: null,
    };
    apiFetchMock.mockImplementation(async (_path, options) => {
      if (options?.method === "PUT") {
        serverRecord = {
          ...serverRecord,
          ...(JSON.parse(String(options.body)) as Partial<ServerRecord>),
        };
        return response(serverRecord);
      }
      return response([serverRecord]);
    });
  });

  afterEach(() => {
    cleanup();
  });

  async function openEditor(screen: ReturnType<typeof render>) {
    await waitFor(() => {
      expect(
        screen.getByLabelText("Edit irrigation record for North Field"),
      ).toBeTruthy();
    });
    fireEvent.press(
      screen.getByLabelText("Edit irrigation record for North Field"),
    );
    expect(screen.getByText("Edit Application")).toBeTruthy();
  }

  async function saveAndReload(screen: ReturnType<typeof render>) {
    await act(async () => {
      fireEvent.press(screen.getByText("Save Changes"));
      await Promise.resolve();
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.queryByText("Edit Application")).toBeNull();
    });
    await act(async () => {
      fireEvent(screen.getByTestId("irrigation-history-refresh"), "refresh");
      await Promise.resolve();
      await Promise.resolve();
    });
    await openEditor(screen);
    return screen;
  }

  it("keeps a corrected water source and direct applied volume after reload", async () => {
    serverRecord.meterStartReading = null;
    const screen = render(<IrrigationHistoryScreen />);
    await openEditor(screen);

    fireEvent.changeText(
      screen.getByPlaceholderText(
        "e.g. North borehole, Licence 12/54/18/0012",
      ),
      "South reservoir",
    );
    fireEvent.changeText(screen.getByPlaceholderText("m³ abstracted"), "42.75");

    const reloaded = await saveAndReload(screen);

    expect(
      reloaded.getByPlaceholderText(
        "e.g. North borehole, Licence 12/54/18/0012",
      ).props.value,
    ).toBe("South reservoir");
    expect(reloaded.getByPlaceholderText("m³ abstracted").props.value).toBe(
      "42.75",
    );
  });

  it("reloads applied volume calculated from corrected meter readings", async () => {
    const screen = render(<IrrigationHistoryScreen />);
    await openEditor(screen);

    fireEvent.changeText(screen.getByPlaceholderText("Start reading"), "125.5");
    fireEvent.changeText(screen.getByPlaceholderText("End reading"), "168.25");
    expect(screen.getByText("42.75 m³")).toBeTruthy();

    const reloaded = await saveAndReload(screen);

    expect(reloaded.getByPlaceholderText("Start reading").props.value).toBe(
      "125.5",
    );
    expect(reloaded.getByPlaceholderText("End reading").props.value).toBe(
      "168.25",
    );
    expect(reloaded.getByText("42.75 m³")).toBeTruthy();
    expect(serverRecord.volumeAppliedM3).toBe("42.75");
  });

  it("keeps optional meter and volume values cleared after reload", async () => {
    serverRecord.meterEndReading = "140";
    const screen = render(<IrrigationHistoryScreen />);
    await openEditor(screen);

    fireEvent.changeText(screen.getByPlaceholderText("Start reading"), "");
    fireEvent.changeText(screen.getByPlaceholderText("End reading"), "");
    fireEvent.changeText(screen.getByPlaceholderText("m³ abstracted"), "");

    const reloaded = await saveAndReload(screen);

    expect(reloaded.getByPlaceholderText("Start reading").props.value).toBe("");
    expect(reloaded.getByPlaceholderText("End reading").props.value).toBe("");
    expect(reloaded.getByPlaceholderText("m³ abstracted").props.value).toBe("");
    expect(serverRecord).toEqual(
      expect.objectContaining({
        meterStartReading: null,
        meterEndReading: null,
        volumeAppliedM3: null,
      }),
    );
  });
});