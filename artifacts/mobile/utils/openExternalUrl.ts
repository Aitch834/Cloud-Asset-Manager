import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

/**
 * Opens an external URL safely inside the app.
 *
 * - HTTP / HTTPS  → expo-web-browser in-app browser (user never leaves the app)
 * - Native schemes (tel:, mailto:, sms:, …) → Linking.openURL (hands off to the OS)
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    await WebBrowser.openBrowserAsync(url);
  } else {
    await Linking.openURL(url);
  }
}
