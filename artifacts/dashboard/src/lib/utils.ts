import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Opens a complete HTML document in a new top-level browser tab and triggers
 * the browser's print dialog from within that tab.
 *
 * Must be called synchronously from a user click handler so browsers treat it
 * as user-initiated and don't block the popup.
 *
 * The HTML is packaged as a Blob URL and two scripts are injected:
 *  - onload → window.print() after 300 ms
 *  - afterprint → window.close() so the tab disappears once printing is done
 *    (or if the user cancels), leaving no lingering tab.
 */
export function printHtml(html: string, _filename?: string): void {
  const htmlWithScript = html.replace(
    "</body>",
    // Screen-only rule hides all visible content so the tab appears as a
    // blank white page behind the print dialog — less jarring for the user.
    // The @media print rule restores visibility so the printed output is unaffected.
    `<style>@media screen{body>*{visibility:hidden!important}}@media print{body>*{visibility:visible!important}}</style>` +
    `<script>` +
    `window.addEventListener('load',function(){setTimeout(function(){window.print();},300);});` +
    `window.addEventListener('afterprint',function(){window.close();});` +
    `<\/script></body>`
  );
  const blob = new Blob([htmlWithScript], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function formatCurrency(amountPence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amountPence / 100);
}
