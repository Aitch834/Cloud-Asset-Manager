const CSS = (pageSize) => `
  @page { size: ${pageSize}; margin: 0.9cm 1.1cm; }
  *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #111; margin: 0; padding: 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a3a1a; padding-bottom: 8px; margin-bottom: 8px; }
  .hdr-left h1 { font-size: 12px; font-weight: 700; color: #1a3a1a; margin: 0 0 4px; }
  .hdr-left p { font-size: 7.5px; color: #374151; margin: 4px 0; line-height: 1.5; }
  .hdr-right { text-align: right; font-size: 7px; color: #374151; line-height: 1.8; }
  .authority-badge { display: inline-block; background: #1a3a1a; color: #fff; font-size: 6.5px; font-weight: 700; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.05em; margin-bottom: 4px; text-transform: uppercase; }
  .missing-meta { margin: 0 0 8px; padding: 6px 8px; border: 1px solid #f59e0b; background: #fffbeb; color: #92400e; font-size: 7.5px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 7.5px; }
  thead tr { background: #1a3a1a; }
  thead th { padding: 4px 5px; color: #fff; font-weight: 700; font-size: 6.5px; text-transform: uppercase; letter-spacing: 0.05em; border-right: 1px solid #2d5a2d; text-align: left; white-space: nowrap; }
  thead th:last-child { border-right: none; }
  tbody tr { page-break-inside: avoid; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 3px 5px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #f0f0f0; vertical-align: top; line-height: 1.35; color: #111; }
  tbody td:last-child { border-right: none; }
  .section-head { font-size: 9px; font-weight: 700; color: #1a3a1a; border-bottom: 1px solid #d1d5db; padding: 8px 0 4px; margin: 12px 0 6px; }
  .footer { margin-top: 10px; padding-top: 6px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; font-size: 6.5px; color: #555; }
`;
function buildProReport(opts) {
  const farmName = opts.farmName?.trim() || "Holding name not configured";
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const references = [
    { label: "CPH", value: opts.cphNumber, required: false },
    { label: "SBI", value: opts.sbiNumber, required: false },
    { label: "Red Tractor ID", value: opts.redTractorId, required: opts.authority === "Red Tractor" },
    ...opts.authorityReferenceLabel ? [{ label: opts.authorityReferenceLabel, value: opts.authorityReference, required: !!opts.authorityReferenceRequired }] : [],
    ...opts.additionalReferences ?? []
  ];
  const idMeta = references.filter((ref) => !!ref.value).map((ref) => `${escapeHtml(ref.label)}: ${escapeHtml(ref.value)}`).join("  ·  ");
  const missingReferences = [
    ...!opts.farmName?.trim() ? ["Holding name"] : [],
    ...references.filter((ref) => ref.required && !ref.value).map((ref) => ref.label)
  ];
  const pageSize = opts.landscape !== false ? "A4 landscape" : "A4";
  const recordStr = opts.recordCount !== void 0 ? `${opts.recordCount} ${escapeHtml(opts.recordLabel ?? "record")}${opts.recordCount !== 1 ? "s" : ""}` : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${escapeHtml(opts.title)} — ${escapeHtml(farmName)}</title>
<style>${CSS(pageSize)}</style></head><body>
<div class="hdr">
  <div class="hdr-left">
    <h1>${escapeHtml(opts.title)}</h1>
    <p><strong>${escapeHtml(farmName)}</strong>${idMeta ? `  ·  ${idMeta}` : ""}</p>
    ${opts.farmAddress ? `<p style="color:#555">${escapeHtml(opts.farmAddress)}</p>` : ""}
    ${opts.contactPhone ? `<p style="color:#555">Tel: ${escapeHtml(opts.contactPhone)}</p>` : ""}
    ${opts.subtitle ? `<p style="color:#444">${escapeHtml(opts.subtitle)}</p>` : ""}
    ${opts.extraMeta ? `<p style="color:#444">${escapeHtml(opts.extraMeta)}</p>` : ""}
  </div>
  <div class="hdr-right">
    ${opts.authority ? `<div class="authority-badge">${escapeHtml(opts.authority)}</div><br>` : ""}
    <span>Printed: ${today}</span>
    ${recordStr ? `<br><span>${recordStr}</span>` : ""}
  </div>
</div>
${missingReferences.length ? `<div class="missing-meta">Required report information missing: ${missingReferences.map(escapeHtml).join(", ")}. Add it in Farm Settings before submitting this report.</div>` : ""}
${opts.tableHtml}
<div class="footer">
  <span>${escapeHtml(opts.footerNote ?? "Farm record produced by BDE Farm Trac.")}</span>
  <span>BDE Farm Trac · ${today}</span>
</div>
</body></html>`;
}
function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function openPrintWindow(html) {
  const w = window.open("", "_blank", "width=1400,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.addEventListener("afterprint", () => w.close());
    w.print();
  }, 600);
}
function printProReport(opts) {
  openPrintWindow(buildProReport(opts));
}
function printElementReport(element, options) {
  if (!element) return;
  const clone = element.cloneNode(true);
  clone.querySelectorAll("button,input,select,textarea,[data-print-exclude]").forEach((node) => node.remove());
  clone.querySelectorAll("[hidden]").forEach((node) => node.removeAttribute("hidden"));
  const inheritedStyles = Array.from(document.head.querySelectorAll('style,link[rel="stylesheet"]')).map((node) => node.outerHTML).join("");
  const html = buildProReport({ ...options, tableHtml: clone.outerHTML }).replace("<head>", `<head><base href="${escapeHtml(document.baseURI)}">${inheritedStyles}`);
  openPrintWindow(html);
}
function printFromRef(ref, options) {
  if (!ref.current) return;
  const content = ref.current.innerHTML;
  openPrintWindow(buildProReport({ ...options, tableHtml: content }));
}
export {
  printElementReport as a,
  printFromRef as b,
  buildProReport as c,
  escapeHtml as e,
  openPrintWindow as o,
  printProReport as p
};
