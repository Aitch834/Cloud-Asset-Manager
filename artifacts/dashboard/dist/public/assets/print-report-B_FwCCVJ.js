const CSS = (pageSize) => `
  @page { size: ${pageSize}; margin: 0.9cm 1.1cm; }
  *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #111; margin: 0; padding: 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a3a1a; padding-bottom: 8px; margin-bottom: 8px; }
  .hdr-left h1 { font-size: 12px; font-weight: 700; color: #1a3a1a; margin: 0 0 4px; }
  .hdr-left p { font-size: 7.5px; color: #374151; margin: 4px 0; line-height: 1.5; }
  .hdr-right { text-align: right; font-size: 7px; color: #374151; line-height: 1.8; }
  .rt-badge { display: inline-block; background: #dc2626; color: #fff; font-size: 6.5px; font-weight: 700; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.05em; margin-bottom: 4px; }
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
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const meta = [
    opts.cphNumber ? `CPH: ${opts.cphNumber}` : null,
    opts.redTractorId ? `Red Tractor ID: ${opts.redTractorId}` : null
  ].filter(Boolean).join("  ·  ");
  const pageSize = opts.landscape !== false ? "A4 landscape" : "A4";
  const recordStr = opts.recordCount !== void 0 ? `${opts.recordCount} ${opts.recordLabel ?? "record"}${opts.recordCount !== 1 ? "s" : ""}` : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${opts.title}${opts.farmName ? ` — ${opts.farmName}` : ""}</title>
<style>${CSS(pageSize)}</style></head><body>
<div class="hdr">
  <div class="hdr-left">
    <h1>${opts.title}</h1>
    ${opts.farmName ? `<p><strong>${opts.farmName}</strong>${meta ? `  ·  ${meta}` : ""}</p>` : ""}
    ${opts.subtitle ? `<p style="color:#444">${opts.subtitle}</p>` : ""}
    ${opts.extraMeta ? `<p style="color:#444">${opts.extraMeta}</p>` : ""}
  </div>
  <div class="hdr-right">
    <div class="rt-badge">RED TRACTOR</div><br>
    <span>Printed: ${today}</span>
    ${recordStr ? `<br><span>${recordStr}</span>` : ""}
  </div>
</div>
${opts.tableHtml}
<div class="footer">
  <span>${opts.footerNote ?? "Retain records for a minimum of 3 years and make available at Red Tractor audit inspection."}</span>
  <span>BDE Farm Trac · ${today}</span>
</div>
</body></html>`;
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
function printFromRef(ref, title, landscape = true) {
  if (!ref.current) return;
  const content = ref.current.innerHTML;
  const pageSize = landscape ? "A4 landscape" : "A4";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: ${pageSize}; margin: 1cm 1.2cm; }
  *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { margin: 0; padding: 0; background: #fff; font-family: Arial, Helvetica, sans-serif; }
  div[style*="overflow"] { overflow: visible !important; }
  tr { page-break-inside: avoid; }
  div[style*="box-shadow"] { box-shadow: none !important; border-radius: 0 !important; }
</style>
</head><body>${content}</body></html>`;
  openPrintWindow(html);
}
export {
  printFromRef as a,
  buildProReport as b,
  openPrintWindow as o,
  printProReport as p
};
