import { Platform } from "react-native";

type PrintFn = (html: string) => Promise<void>;
type SavePdfFn = (html: string, docTitle?: string, fileName?: string) => Promise<void>;

interface SavePdfDependencies {
  printToFileAsync: (options: { html: string }) => Promise<{ uri: string }>;
  shareAsync: (
    uri: string,
    options: { mimeType: string; dialogTitle: string; UTI: string },
  ) => Promise<void>;
  cacheDirectory: string | null;
  copyAsync: (options: { from: string; to: string }) => Promise<void>;
  deleteAsync: (uri: string, options: { idempotent: boolean }) => Promise<void>;
}

async function loadSavePdfDependencies(): Promise<SavePdfDependencies> {
  const { printToFileAsync } = await import("expo-print");
  const { shareAsync } = await import("expo-sharing");
  const { cacheDirectory, copyAsync, deleteAsync } = await import("expo-file-system/legacy");
  return { printToFileAsync, shareAsync, cacheDirectory, copyAsync, deleteAsync };
}

export async function printHtml(html: string, platform = Platform.OS): Promise<void> {
  if (platform === "web") {
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

export async function savePdf(
  html: string,
  docTitle = "document",
  fileName?: string,
  platform = Platform.OS,
  dependencies?: SavePdfDependencies,
): Promise<void> {
  if (platform === "web") {
    await printHtml(html, platform);
    return;
  }
  const {
    printToFileAsync,
    shareAsync,
    cacheDirectory,
    copyAsync,
    deleteAsync,
  } = dependencies ?? await loadSavePdfDependencies();
  const result = await printToFileAsync({ html });
  let shareUri = result.uri;
  if (fileName) {
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
