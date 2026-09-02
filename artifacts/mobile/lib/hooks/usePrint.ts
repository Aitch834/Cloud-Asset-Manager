import { Platform } from "react-native";

type PrintFn = (html: string) => Promise<void>;
type SavePdfFn = (html: string, docTitle?: string, fileName?: string) => Promise<void>;

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

async function savePdf(html: string, docTitle = "document", fileName?: string): Promise<void> {
  if (Platform.OS === "web") {
    await printHtml(html);
    return;
  }
  const { printToFileAsync } = await import("expo-print");
  const { shareAsync } = await import("expo-sharing");
  const result = await printToFileAsync({ html });
  let shareUri = result.uri;
  if (fileName) {
    const { cacheDirectory, copyAsync, deleteAsync } = await import("expo-file-system/legacy");
    if (cacheDirectory) {
      shareUri = `${cacheDirectory}${fileName}`;
      await deleteAsync(shareUri, { idempotent: true });
      await copyAsync({ from: result.uri, to: shareUri });
    }
  }
  await shareAsync(shareUri, {
    mimeType: "application/pdf",
    dialogTitle: `Share ${docTitle}`,
    UTI: "com.adobe.pdf",
  });
}

export function usePrint(): { print: PrintFn; savePdf: SavePdfFn } {
  return { print: printHtml, savePdf };
}
