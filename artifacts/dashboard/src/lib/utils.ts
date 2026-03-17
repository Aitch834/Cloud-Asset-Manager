import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Opens a complete HTML document in a new top-level browser tab and triggers
 * the browser's print dialog from within that tab.
 *
 * Must be called synchronously from a user click handler (not inside setTimeout
 * or async callbacks) so browsers treat it as user-initiated and don't block the popup.
 *
 * The HTML is packaged as a Blob URL (same-origin, so never blocked by mixed-content
 * rules) and an auto-print script is injected before </body> so the tab prints
 * as soon as it finishes loading — no second click needed.
 *
 * Falls back to a file download if window.open is blocked.
 */
export function printHtml(html: string, filename = "farm-records.html"): void {
  const htmlWithScript = html.replace(
    "</body>",
    `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},300);});<\/script></body>`
  );
  const blob = new Blob([htmlWithScript], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  // Revoke the object URL after 60 s (well after printing completes)
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  if (!win) {
    // Popup was blocked — fall back to downloading the file so the user can
    // open it in their browser and print from there.
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export function formatCurrency(amountPence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amountPence / 100);
}
