import { Platform } from "react-native";

type PrintFn = (html: string) => Promise<void>;
type SavePdfFn = (html: string, docTitle?: string) => Promise<void>;

async function printHtml(html: string): Promise<void> {
  if (Platform.OS === "web") {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 400);
    }
    return;
  }
  const { printAsync } = await import("expo-print");
  await printAsync({ html });
}

async function savePdf(html: string, docTitle = "document"): Promise<void> {
  if (Platform.OS === "web") {
    await printHtml(html);
    return;
  }
  const { printToFileAsync } = await import("expo-print");
  const { shareAsync } = await import("expo-sharing");
  const result = await printToFileAsync({ html });
  await shareAsync(result.uri, {
    mimeType: "application/pdf",
    dialogTitle: `Share ${docTitle}`,
    UTI: "com.adobe.pdf",
  });
}

export function usePrint(): { print: PrintFn; savePdf: SavePdfFn } {
  return { print: printHtml, savePdf };
}
