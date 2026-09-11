const mockPrintAsync = jest.fn().mockResolvedValue(undefined);
const mockPrintToFileAsync = jest.fn().mockResolvedValue({
  uri: "file:///generated/input-register.pdf",
});
const mockShareAsync = jest.fn().mockResolvedValue(undefined);
const mockCopyAsync = jest.fn().mockResolvedValue(undefined);
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);

jest.mock("react-native", () => require("react-native-web"));

import { printHtml, savePdf } from "../lib/hooks/usePrint";

describe("usePrint platform behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(["ios", "android"] as const)(
    "creates and shares a named PDF through the native share sheet on %s",
    async (os) => {
      await savePdf(
        "<html>Input Register</html>",
        "Organic Input Register",
        "organic-input-register.pdf",
        os,
        {
          printToFileAsync: mockPrintToFileAsync,
          shareAsync: mockShareAsync,
          cacheDirectory: "file:///cache/",
          copyAsync: mockCopyAsync,
          deleteAsync: mockDeleteAsync,
        },
      );

      expect(mockPrintToFileAsync).toHaveBeenCalledWith({
        html: "<html>Input Register</html>",
      });
      expect(mockDeleteAsync).toHaveBeenCalledWith(
        "file:///cache/organic-input-register.pdf",
        { idempotent: true },
      );
      expect(mockCopyAsync).toHaveBeenCalledWith({
        from: "file:///generated/input-register.pdf",
        to: "file:///cache/organic-input-register.pdf",
      });
      expect(mockShareAsync).toHaveBeenCalledWith(
        "file:///cache/organic-input-register.pdf",
        {
          mimeType: "application/pdf",
          dialogTitle: "Share Organic Input Register",
          UTI: "com.adobe.pdf",
        },
      );
    },
  );

  it("opens the browser print dialog on web instead of native sharing", async () => {
    const mockWindow = {
      open: jest.fn(),
    };
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: mockWindow,
    });
    const print = jest.fn();
    const focus = jest.fn();
    const close = jest.fn();
    const write = jest.fn();
    const open = jest.spyOn(mockWindow, "open").mockReturnValue({
      document: { write, close },
      focus,
      print,
    } as unknown as Window);
    jest.useFakeTimers();

    await savePdf("<html>Input Register</html>", "Organic Input Register", undefined, "web");
    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledWith("", "_blank");
    expect(write).toHaveBeenCalledWith("<html>Input Register</html>");
    expect(close).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(print).toHaveBeenCalled();
    expect(mockPrintToFileAsync).not.toHaveBeenCalled();
    expect(mockShareAsync).not.toHaveBeenCalled();

    open.mockRestore();
    jest.useRealTimers();
  });
});