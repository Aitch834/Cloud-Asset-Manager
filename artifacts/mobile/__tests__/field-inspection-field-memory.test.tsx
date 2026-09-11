import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ApiField } from "../lib/hooks/useApiFields";
import { useRememberedFieldSelection } from "../lib/hooks/useRememberedFieldSelection";

(global as typeof globalThis & { __DEV__: boolean }).__DEV__ = false;
const { act, renderHook, waitFor } =
  require("@testing-library/react-native") as typeof import("@testing-library/react-native");

jest.mock("@react-native-async-storage/async-storage", () => {
  const values = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => values.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        values.set(key, value);
      }),
      removeItem: jest.fn(async (key: string) => {
        values.delete(key);
      }),
      clear: jest.fn(async () => values.clear()),
    },
  };
});

const farmAFields: ApiField[] = [
  { id: 1, name: "North Field", isActive: true },
  { id: 2, name: "Inactive Field", isActive: false },
];
const farmBFields: ApiField[] = [
  { id: 3, name: "South Field", isActive: true },
];

const props = (farmId: string, fields: ApiField[]) => ({
  farmId,
  fields,
  fieldsLoading: false,
  fieldsLoadedForFarmId: farmId,
});

type HookProps = {
  farmId: string | undefined;
  fields: ApiField[];
  fieldsLoading: boolean;
  fieldsLoadedForFarmId: string | undefined;
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

it("stores a selection and restores it after a same-farm remount", async () => {
  const first = renderHook(
    (hookProps: HookProps) => useRememberedFieldSelection(hookProps),
    { initialProps: props("farm-a", farmAFields) },
  );

  await waitFor(() => expect(first.result.current.fieldName).toBe(""));
  act(() => first.result.current.setFieldName("North Field"));
  await waitFor(() =>
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "bde_field_inspection_last_field_farm-a",
      JSON.stringify({ fieldName: "North Field" }),
    ),
  );
  first.unmount();

  const second = renderHook(
    (hookProps: HookProps) => useRememberedFieldSelection(hookProps),
    { initialProps: props("farm-a", farmAFields) },
  );

  await waitFor(() =>
    expect(second.result.current.fieldName).toBe("North Field"),
  );
});

it("clears the visible selection when switching farms and restores only that farm's field", async () => {
  await AsyncStorage.setItem(
    "bde_field_inspection_last_field_farm-a",
    JSON.stringify({ fieldName: "North Field" }),
  );
  await AsyncStorage.setItem(
    "bde_field_inspection_last_field_farm-b",
    JSON.stringify({ fieldName: "South Field" }),
  );

  const hook = renderHook(
    (hookProps: HookProps) => useRememberedFieldSelection(hookProps),
    { initialProps: props("farm-a", farmAFields) },
  );
  await waitFor(() => expect(hook.result.current.fieldName).toBe("North Field"));

  hook.rerender({
    farmId: "farm-b",
    fields: [],
    fieldsLoading: true,
    fieldsLoadedForFarmId: undefined,
  });
  await waitFor(() => expect(hook.result.current.fieldName).toBe(""));

  hook.rerender(props("farm-b", farmBFields));
  await waitFor(() => expect(hook.result.current.fieldName).toBe("South Field"));
});

it.each([
  ["deleted", []],
  ["renamed", [{ id: 1, name: "North Paddock", isActive: true }]],
  ["inactive", [{ id: 1, name: "North Field", isActive: false }]],
] as const)("does not restore a %s field", async (_reason, fields) => {
  await AsyncStorage.setItem(
    "bde_field_inspection_last_field_farm-a",
    JSON.stringify({ fieldName: "North Field" }),
  );

  const hook = renderHook(
    (hookProps: HookProps) => useRememberedFieldSelection(hookProps),
    { initialProps: props("farm-a", [...fields]) },
  );

  await waitFor(() =>
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
      "bde_field_inspection_last_field_farm-a",
    ),
  );
  expect(hook.result.current.fieldName).toBe("");
});