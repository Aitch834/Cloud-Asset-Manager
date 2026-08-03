import { r as reactExports, j as jsxRuntimeExports, I as Input, d as Button, b as useAppStore, m as useQuery, R as Redirect, c as useQueryClient, a as useToast, O as useMutation, S as Plus, e as LoaderCircle, n as Card, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, Q as React, $ as X, L as Label, p as Link, T as FlaskConical } from "./index-DsC5oxCS.js";
import { u as usePersistedTab } from "./use-persisted-tab-DDv2HROt.js";
import { C as CropYearSelector } from "./CropYearSelector-Bs3bFhb3.js";
import { c as currentCropYear, i as isInCropYear, b as cropYearLabel } from "./cropYear-Dmv-iNR6.js";
import { F as FarmLocationSelect } from "./FarmLocationSelect-CWOF_myd.js";
import { P as Pen } from "./pen--CrsnkUZ.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-ClZXALA_.js";
import { A as AppLayout, U as Users, r as Bug, c as ClipboardList } from "./AppLayout-nX1o67oM.js";
import { T as TabBar, a as TabButton } from "./tab-button-Dy9GkXYm.js";
import { u as useUpload } from "./use-upload-BycaGUGY.js";
import { R as RecordAttachments } from "./RecordAttachments-B1ZHhrs2.js";
import { T as Textarea } from "./textarea-Bat34YPz.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BYnAweEK.js";
import { u as useFarmMembers } from "./use-farm-members-3DOPOfRB.js";
import { S as StaffSelect } from "./staff-select--EnG4m_J.js";
import { B as BuyerCombobox } from "./BuyerCombobox-COTz8STH.js";
import { S as Search } from "./search-luPbjm5T.js";
import { P as Printer } from "./printer-DnB-j0Ro.js";
import { F as FileText } from "./shield-alert-DwLqoDtZ.js";
import { C as CircleCheck } from "./circle-check-970D_eGt.js";
import { C as CircleX } from "./circle-x-BHDGCmjQ.js";
import { E as Eye } from "./eye-CGVkhu01.js";
import { P as Pencil } from "./pencil-DSKsR0Fr.js";
import { C as ChevronUp } from "./chevron-up-1g_SD1l8.js";
import { H as History } from "./history-BsRTkqvL.js";
import { S as ShieldCheck } from "./shield-check-BUjExI9Z.js";
import { H as HardHat } from "./hard-hat-CABX3r4s.js";
import { a as Clock } from "./database-DwWOIFqH.js";
import { P as Package } from "./use-safe-clerk-Bx2ySNlc.js";
import { C as Calendar } from "./calendar-CcGIRrqT.js";
import { T as TriangleAlert } from "./triangle-alert-BCxQNJs3.js";
import { F as File } from "./file-CXST3VJZ.js";
import { C as Camera } from "./camera-kS80YQKz.js";
import "./select-CtuC2rDB.js";
import "./index-Dqh2lpof.js";
import "./index-CCPXLth3.js";
import "./tractor-DcBOfbOA.js";
import "./paperclip-C8MhTM6M.js";
import "./upload-C9akzN5p.js";
import "./image-xVT7Zlbc.js";
import "./download-Du3IG47v.js";
import "./popover-Cnj1lS7S.js";
import "./command-CKZFiOMs.js";
import "./chevrons-up-down-Cd6yQqiE.js";
import "./user-plus-D7lk6I78.js";
function TypeaheadInput({ value, onChange, suggestions, placeholder, required, className }) {
  const [open, setOpen] = reactExports.useState(false);
  const [highlighted, setHighlighted] = reactExports.useState(-1);
  const containerRef = reactExports.useRef(null);
  const filtered = value.trim() ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()) : [];
  reactExports.useEffect(() => {
    setHighlighted(-1);
  }, [filtered.length]);
  reactExports.useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  function handleKeyDown(e) {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      onChange(filtered[highlighted]);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, style: { position: "relative" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value,
        onChange: (e) => {
          onChange(e.target.value);
          setOpen(true);
        },
        onFocus: () => setOpen(true),
        onKeyDown: handleKeyDown,
        placeholder,
        required,
        className
      }
    ),
    open && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 50,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      overflow: "hidden"
    }, children: filtered.slice(0, 8).map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onMouseDown: () => {
          onChange(s);
          setOpen(false);
        },
        style: {
          padding: "8px 14px",
          fontSize: "0.875rem",
          cursor: "pointer",
          background: highlighted === i ? "#f0fdf4" : "#fff",
          color: highlighted === i ? "#166534" : "#111827",
          fontWeight: highlighted === i ? 600 : 400,
          borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none"
        },
        children: s
      },
      s
    )) })
  ] });
}
function SignaturePad({ value, onChange, label, height = 160 }) {
  const canvasRef = reactExports.useRef(null);
  const drawing = reactExports.useRef(false);
  const lastPos = reactExports.useRef(null);
  const [hasStrokes, setHasStrokes] = reactExports.useState(false);
  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX;
    const clientY = e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }
  const clearCanvas = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  }, []);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth || 600;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  }, [height]);
  function startDraw(x, y) {
    drawing.current = true;
    lastPos.current = { x, y };
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    setHasStrokes(true);
  }
  function draw(x, y) {
    if (!drawing.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = { x, y };
  }
  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current;
    onChange(canvas.toDataURL("image/png"));
  }
  function onMouseDown(e) {
    const p = getPos(e.nativeEvent, canvasRef.current);
    startDraw(p.x, p.y);
  }
  function onMouseMove(e) {
    const p = getPos(e.nativeEvent, canvasRef.current);
    draw(p.x, p.y);
  }
  function onTouchStart(e) {
    e.preventDefault();
    const p = getPos(e.touches[0], canvasRef.current);
    startDraw(p.x, p.y);
  }
  function onTouchMove(e) {
    e.preventDefault();
    const p = getPos(e.touches[0], canvasRef.current);
    draw(p.x, p.y);
  }
  function handleClear() {
    clearCanvas();
    onChange(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 13, style: { color: "#6b7280" } }),
        label
      ] }),
      hasStrokes && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleClear, style: { background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "#ef4444", display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }),
        " Clear"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", border: "2px dashed #d1d5db", borderRadius: 10, overflow: "hidden", background: "#fff", height }, children: [
      !hasStrokes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 20, style: { color: "#d1d5db" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: "Sign here using stylus, finger or mouse" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "canvas",
        {
          ref: canvasRef,
          style: { display: "block", width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" },
          onMouseDown,
          onMouseMove,
          onMouseUp: endDraw,
          onMouseLeave: endDraw,
          onTouchStart,
          onTouchMove,
          onTouchEnd: endDraw
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", bottom: 8, left: 12, right: 12, borderTop: "1px solid #e5e7eb", paddingTop: 4 } })
    ] })
  ] });
}
function SignatureModal({ open, label, declarationText, onConfirm, onCancel, visitorName, farmName }) {
  const [sig, setSig] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (open) setSig(null);
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 16, padding: "28px 28px 24px", width: "min(680px, 96vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.0625rem", fontWeight: 700, margin: "0 0 4px", color: "#111827" }, children: label }),
    farmName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#6b7280", margin: "0 0 14px" }, children: farmName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: "0.8125rem", color: "#374151", lineHeight: 1.6, marginBottom: 16 }, children: declarationText }),
    visitorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginBottom: 10 }, children: [
      "Signatory: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#111827" }, children: visitorName })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignaturePad, { value: sig, onChange: setSig, label: "Signature", height: 180 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          disabled: !sig,
          onClick: () => sig && onConfirm(sig),
          style: { background: "#166534", color: "#fff", border: "none" },
          children: "Confirm Signature"
        }
      )
    ] })
  ] }) });
}
function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}
function formatDateTime(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return val;
  }
}
function daysBetween(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 864e5);
}
function dueBadge(dateStr, label = "Follow-up") {
  if (!dateStr) return null;
  const days = daysBetween(dateStr);
  if (days === null) return null;
  if (days < 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    label,
    " overdue"
  ] });
  if (days === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    label,
    " today"
  ] });
  if (days <= 14) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3" }),
    label,
    " in ",
    days,
    "d"
  ] });
  return null;
}
const PRINT_CSS = `body{font-family:Arial,sans-serif;font-size:9.5px;margin:0;color:#000}
h1{font-size:13px;font-weight:700;margin:0 0 2px}p.sub{font-size:10px;color:#555;margin:1px 0}
table{width:100%;border-collapse:collapse;margin-top:14px}
th{background:#166534;color:#fff;padding:5px 7px;text-align:left;font-size:9px;font-weight:700;white-space:nowrap}
td{padding:4px 7px;border-bottom:1px solid #e5e7eb;vertical-align:top;font-size:9px}
tr:nth-child(even) td{background:#f9fafb}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:14px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:20px}`;
function openPrint(html) {
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.addEventListener("afterprint", () => w.close());
    w.print();
  }
}
const EMPTY_VISITOR = {
  visitorName: "",
  company: "",
  purpose: "",
  vehicleRegistration: "",
  arrivalTime: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
  departureTime: "",
  areasVisited: "",
  biosecurityDeclarationSigned: false,
  healthDeclarationSigned: false,
  biosecuritySignature: null,
  healthSignature: null,
  escortedBy: "",
  notes: ""
};
function printVisitorRegister(records, farmName, yearLabel) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtDT = (v) => v ? new Date(v).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const rows = records.map((r) => `<tr>
    <td>${r.visitorName}</td><td>${r.company || "—"}</td><td>${r.purpose}</td>
    <td>${r.vehicleRegistration || "—"}</td><td style="white-space:nowrap">${fmtDT(r.arrivalTime)}</td>
    <td style="white-space:nowrap">${r.departureTime ? fmtDT(r.departureTime) : "—"}</td>
    <td>${r.areasVisited || "—"}</td>
    <td style="text-align:center;font-weight:700;color:${r.biosecurityDeclarationSigned ? "#16a34a" : "#dc2626"}">${r.biosecurityDeclarationSigned ? "✓" : "✗"}</td>
    <td style="text-align:center;font-weight:700;color:${r.healthDeclarationSigned ? "#16a34a" : "#dc2626"}">${r.healthDeclarationSigned ? "✓" : "✗"}</td>
    <td>${r.escortedBy || "—"}</td><td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Visitor Log — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Visitor &amp; Contractor Log · ${yearLabel} · Red Tractor Biosecurity Record</p></div>
<div class="hdr-r"><b>Visitor Log</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Visitor / Contractor</th><th>Company</th><th>Purpose</th><th>Vehicle Reg</th><th>Arrival</th><th>Departure</th><th>Areas Visited</th><th>Biosec</th><th>Health</th><th>Escorted By</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Visitor &amp; Contractor Log — Red Tractor biosecurity compliance record. Retain for minimum 3 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
const BIOSEC_DECLARATION_TEXT = `I confirm that:
1. I have not visited any other livestock or agricultural premises within the last 48 hours.
2. I agree to comply with all biosecurity measures required on this farm, including cleaning and disinfection of footwear, wearing PPE where required, and following all instructions given by farm staff.
3. I will not enter restricted areas without authorisation or escort.
4. I understand that failure to comply with biosecurity requirements may result in removal from the farm premises.`;
const HEALTH_DECLARATION_TEXT = `I confirm that:
1. I am in good health at the time of this visit.
2. I am not displaying symptoms of any infectious illness, including but not limited to vomiting, diarrhoea, respiratory illness, or open skin infections.
3. I have not been advised by a medical professional to avoid contact with livestock or to self-isolate.
4. I understand that any illness or health concern relevant to farm biosecurity must be declared to the farm manager before entering the farm.`;
function printBlankDeclarationForms(farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  openPrint(`<!DOCTYPE html><html><head><title>Visitor Declaration Forms — ${farmName}</title><style>
body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}
h1{font-size:14px;font-weight:700;margin:0 0 2px}h2{font-size:12px;font-weight:700;margin:18px 0 8px;border-bottom:2px solid #166534;padding-bottom:4px;color:#166534}
p.sub{font-size:10px;color:#555;margin:1px 0 10px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:16px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.decl{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 14px;font-size:10.5px;line-height:1.7;white-space:pre-wrap;margin-bottom:12px}
.field{border-bottom:1px solid #000;margin-top:6px;height:22px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.sig-area{border:1px solid #ccc;border-radius:4px;height:80px;margin-top:4px;background:#fff}
.label{font-size:9.5px;color:#555;margin-bottom:2px}
.page-break{page-break-after:always}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:20px}
@media print{@page{margin:2cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Visitor &amp; Contractor Declaration Forms</p></div><div class="hdr-r"><b>Visitor Declarations</b>Date: ${today}</div></div>
<h2>BIOSECURITY DECLARATION</h2>
<div class="decl">${BIOSEC_DECLARATION_TEXT}</div>
<div class="grid">
  <div><p class="label">Visitor / Contractor Name</p><div class="field"></div></div>
  <div><p class="label">Company / Organisation</p><div class="field"></div></div>
  <div><p class="label">Purpose of Visit</p><div class="field"></div></div>
  <div><p class="label">Date &amp; Time of Arrival</p><div class="field"></div></div>
</div>
<div style="margin-top:16px"><p class="label">Signature</p><div class="sig-area"></div></div>
<div class="page-break"></div>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Visitor &amp; Contractor Declaration Forms</p></div><div class="hdr-r"><b>Visitor Declarations</b>Date: ${today}</div></div>
<h2>HEALTH DECLARATION</h2>
<div class="decl">${HEALTH_DECLARATION_TEXT}</div>
<div class="grid">
  <div><p class="label">Visitor / Contractor Name</p><div class="field"></div></div>
  <div><p class="label">Company / Organisation</p><div class="field"></div></div>
  <div><p class="label">Date of Visit</p><div class="field"></div></div>
  <div><p class="label">Date of Birth (optional)</p><div class="field"></div></div>
</div>
<div style="margin-top:16px"><p class="label">Signature</p><div class="sig-area"></div></div>
<div class="footer">Visitor Declaration Forms — ${farmName} · Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function printVisitorDeclarationRecord(v, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtDT = (val) => val ? new Date(val).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const sigBlock = (label, sig, signed) => sig ? `<div><p class="label">${label}</p><img src="${sig}" style="border:1px solid #e5e7eb;border-radius:6px;max-width:100%;height:120px;object-fit:contain;background:#fff;display:block;margin-top:4px" /></div>` : `<div><p class="label">${label}</p><div style="border:1px solid ${signed ? "#bbf7d0" : "#fca5a5"};background:${signed ? "#f0fdf4" : "#fff7f7"};border-radius:6px;padding:8px 12px;margin-top:4px;font-size:10px;color:${signed ? "#166534" : "#dc2626"};font-weight:600">${signed ? "✓ Signed on paper" : "✗ Not signed"}</div></div>`;
  openPrint(`<!DOCTYPE html><html><head><title>Visitor Declaration — ${v.visitorName}</title><style>
body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}
h1{font-size:14px;font-weight:700;margin:0 0 2px}h2{font-size:11px;font-weight:700;margin:16px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:3px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:16px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
table{width:100%;border-collapse:collapse;margin-bottom:12px}
td{padding:5px 10px;border:1px solid #e5e7eb;font-size:10.5px;vertical-align:top}td:first-child{font-weight:600;background:#f9fafb;width:34%}
.decl{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:10px;line-height:1.7;white-space:pre-wrap;margin-bottom:10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:10px}
.label{font-size:9.5px;color:#6b7280;margin-bottom:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:24px}
@media print{@page{margin:2cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p style="font-size:10px;color:#555;margin:1px 0">Visitor &amp; Contractor Declaration Record</p></div><div class="hdr-r"><b>Declaration Record</b>Printed: ${today}</div></div>
<h2>Visit Details</h2>
<table><tr><td>Visitor / Contractor</td><td>${v.visitorName}</td></tr><tr><td>Company</td><td>${v.company || "—"}</td></tr><tr><td>Purpose</td><td>${v.purpose}</td></tr><tr><td>Vehicle Registration</td><td>${v.vehicleRegistration || "—"}</td></tr><tr><td>Arrival</td><td>${fmtDT(v.arrivalTime)}</td></tr><tr><td>Departure</td><td>${v.departureTime ? fmtDT(v.departureTime) : "—"}</td></tr><tr><td>Areas Visited</td><td>${v.areasVisited || "—"}</td></tr><tr><td>Escorted By</td><td>${v.escortedBy || "—"}</td></tr></table>
<h2>Biosecurity Declaration</h2>
<div class="decl">${BIOSEC_DECLARATION_TEXT}</div>
<div class="grid">${sigBlock("Signature", v.biosecuritySignature, v.biosecurityDeclarationSigned)}${sigBlock("Health Declaration Signature", v.healthSignature, v.healthDeclarationSigned)}</div>
<div class="footer">Visitor Declaration Record — ${farmName} · Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function VisitorTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = reactExports.useState("");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewVisitor, setViewVisitor] = reactExports.useState(null);
  const [viewPest, setViewPest] = reactExports.useState(null);
  const [viewCleaning, setViewCleaning] = reactExports.useState(null);
  const [viewCoshh, setViewCoshh] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_VISITOR);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [sigModal, setSigModal] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["visitors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/visitors`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const companySuggestions = [...new Set(records.map((r) => r.company).filter(Boolean))];
  const escortedBySuggestions = [...new Set(records.map((r) => r.escortedBy).filter(Boolean))];
  const filtered = records.filter(
    (r) => isInCropYear(r.arrivalTime, cropYear) && (!search || r.visitorName.toLowerCase().includes(search.toLowerCase()) || r.company?.toLowerCase().includes(search.toLowerCase()) || r.purpose.toLowerCase().includes(search.toLowerCase()))
  );
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/visitors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_VISITOR);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/visitors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_VISITOR);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/visitors/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(v) {
    setEditing(v);
    setForm({
      visitorName: v.visitorName,
      company: v.company ?? "",
      purpose: v.purpose,
      vehicleRegistration: v.vehicleRegistration ?? "",
      arrivalTime: v.arrivalTime?.slice(0, 16) ?? "",
      departureTime: v.departureTime?.slice(0, 16) ?? "",
      areasVisited: v.areasVisited ?? "",
      biosecurityDeclarationSigned: v.biosecurityDeclarationSigned,
      healthDeclarationSigned: v.healthDeclarationSigned,
      biosecuritySignature: v.biosecuritySignature ?? null,
      healthSignature: v.healthSignature ?? null,
      escortedBy: v.escortedBy ?? "",
      notes: v.notes ?? ""
    });
    setFormOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...form,
      arrivalTime: form.arrivalTime ? new Date(form.arrivalTime).toISOString() : null,
      departureTime: form.departureTime ? new Date(form.departureTime).toISOString() : null
    };
    if (editing) {
      updateM.mutate({ id: editing.id, body });
    } else {
      createM.mutate(body);
    }
  }
  const isSubmitting = createM.isPending || updateM.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search visitors, company, purpose...", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear, showAllYears: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => printVisitorRegister(filtered, farmName, cropYearLabel(cropYear)), className: "gap-2 shrink-0", disabled: filtered.length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
        " Print Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => printBlankDeclarationForms(farmName), className: "gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }),
        " Blank Declaration Forms"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setForm(EMPTY_VISITOR);
        setFormOpen(true);
      }, className: "gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " Log Visitor"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
      "Loading..."
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-8 h-8 text-primary/40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No visitor records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No visitors match your search." : "Log visitors and contractors to maintain biosecurity compliance." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border", children: ["Visitor / Contractor", "Company", "Purpose", "Arrival", "Departure", "Biosec", "Health", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-black/[0.02] transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm font-medium", children: v.visitorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: v.company || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70 max-w-[160px] truncate", children: v.purpose }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70 whitespace-nowrap", children: formatDateTime(v.arrivalTime) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70 whitespace-nowrap", children: v.departureTime ? formatDateTime(v.departureTime) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 text-xs font-medium", children: "On site" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: v.biosecurityDeclarationSigned ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: v.healthDeclarationSigned ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewVisitor(v), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-green-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(v), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(v.id), className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
        ] }) })
      ] }, v.id)) })
    ] }) }) }),
    viewVisitor && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewVisitor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-primary" }),
        "Visitor Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Visitor / Contractor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewVisitor.visitorName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewVisitor.company || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Purpose of Visit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewVisitor.purpose })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Arrival" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewVisitor.arrivalTime ? new Date(viewVisitor.arrivalTime).toLocaleString("en-GB") : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Departure" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewVisitor.departureTime ? new Date(viewVisitor.departureTime).toLocaleString("en-GB") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 text-xs font-medium", children: "Still on site" }) })
          ] }),
          viewVisitor.vehicleRegistration && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Vehicle Reg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono", children: viewVisitor.vehicleRegistration })
          ] }),
          viewVisitor.escortedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Escorted By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewVisitor.escortedBy })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Biosec Declaration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewVisitor.biosecurityDeclarationSigned ? "✓ Signed" : "Not signed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Health Declaration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewVisitor.healthDeclarationSigned ? "✓ Signed" : "Not signed" })
          ] })
        ] }),
        viewVisitor.areasVisited && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Areas Visited" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewVisitor.areasVisited })
        ] }),
        viewVisitor.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewVisitor.notes })
        ] })
      ] }),
      (viewVisitor.biosecuritySignature || viewVisitor.healthSignature) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-2", children: "Electronic Signatures" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          viewVisitor.biosecuritySignature && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Biosecurity Declaration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: viewVisitor.biosecuritySignature, alt: "Biosecurity signature", style: { height: 80, maxWidth: "100%", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", display: "block" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-medium mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
              " Signed"
            ] })
          ] }),
          viewVisitor.healthSignature && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Health Declaration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: viewVisitor.healthSignature, alt: "Health signature", style: { height: 80, maxWidth: "100%", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", display: "block" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-medium mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
              " Signed"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl p-4 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RecordAttachments,
        {
          farmId,
          recordType: "visitor-log",
          recordId: viewVisitor.id
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-1.5", onClick: () => printVisitorDeclarationRecord(viewVisitor, farmName), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewVisitor);
          setViewVisitor(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewVisitor(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) {
        setFormOpen(false);
        setEditing(null);
        setForm(EMPTY_VISITOR);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "56rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 text-primary" }),
          editing ? "Edit Visitor Record" : "Log Visitor / Contractor"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record all persons visiting the farm for Red Tractor biosecurity compliance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Full name", value: form.visitorName, onChange: (e) => setForm((f) => ({ ...f, visitorName: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Company / Organisation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TypeaheadInput, { value: form.company, onChange: (v) => setForm((f) => ({ ...f, company: v })), suggestions: companySuggestions, placeholder: "e.g. ADAS, NFU, Vet practice" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Purpose of Visit ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Vet visit, Red Tractor audit, Agronomist inspection", value: form.purpose, onChange: (e) => setForm((f) => ({ ...f, purpose: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Vehicle Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AB12 CDE", value: form.vehicleRegistration, onChange: (e) => setForm((f) => ({ ...f, vehicleRegistration: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Escorted By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TypeaheadInput, { value: form.escortedBy, onChange: (v) => setForm((f) => ({ ...f, escortedBy: v })), suggestions: escortedBySuggestions, placeholder: "Staff member name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Arrival Date & Time ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: form.arrivalTime, onChange: (e) => setForm((f) => ({ ...f, arrivalTime: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Departure Date & Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: form.departureTime, onChange: (e) => setForm((f) => ({ ...f, departureTime: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Areas Visited" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FarmLocationSelect, { farmId, value: form.areasVisited, onChange: (v) => setForm((f) => ({ ...f, areasVisited: v })), placeholder: "Select farm areas visited..." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3", children: "Declarations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: `2px solid ${form.biosecuritySignature ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px", background: form.biosecuritySignature ? "#f0fdf4" : "#fafafa" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50", children: "Biosecurity Declaration" }),
                form.biosecuritySignature && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setForm((f) => ({ ...f, biosecuritySignature: null, biosecurityDeclarationSigned: false })), className: "text-xs text-red-500 hover:text-red-700", children: "Clear" })
              ] }),
              form.biosecuritySignature ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: form.biosecuritySignature, alt: "Biosecurity signature", style: { height: 72, maxWidth: "100%", objectFit: "contain", border: "1px solid #d1fae5", borderRadius: 6, background: "#fff", display: "block" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-medium mt-1.5 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                  " Signed electronically"
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "w-full gap-2 text-sm h-10", onClick: () => setSigModal("biosecurity"), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" }),
                  " Sign electronically"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs text-foreground/60 cursor-pointer mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.biosecurityDeclarationSigned, onChange: (e) => setForm((f) => ({ ...f, biosecurityDeclarationSigned: e.target.checked })), className: "rounded w-3.5 h-3.5 accent-green-600" }),
                  "Signed on paper"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: `2px solid ${form.healthSignature ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px", background: form.healthSignature ? "#f0fdf4" : "#fafafa" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50", children: "Health Declaration" }),
                form.healthSignature && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setForm((f) => ({ ...f, healthSignature: null, healthDeclarationSigned: false })), className: "text-xs text-red-500 hover:text-red-700", children: "Clear" })
              ] }),
              form.healthSignature ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: form.healthSignature, alt: "Health signature", style: { height: 72, maxWidth: "100%", objectFit: "contain", border: "1px solid #d1fae5", borderRadius: 6, background: "#fff", display: "block" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-medium mt-1.5 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                  " Signed electronically"
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "w-full gap-2 text-sm h-10", onClick: () => setSigModal("health"), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" }),
                  " Sign electronically"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs text-foreground/60 cursor-pointer mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.healthDeclarationSigned, onChange: (e) => setForm((f) => ({ ...f, healthDeclarationSigned: e.target.checked })), className: "rounded w-3.5 h-3.5 accent-green-600" }),
                  "Signed on paper"
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SignatureModal,
          {
            open: sigModal === "biosecurity",
            label: "Biosecurity Declaration",
            declarationText: BIOSEC_DECLARATION_TEXT,
            visitorName: form.visitorName || void 0,
            farmName,
            onConfirm: (sig) => {
              setForm((f) => ({ ...f, biosecuritySignature: sig, biosecurityDeclarationSigned: true }));
              setSigModal(null);
            },
            onCancel: () => setSigModal(null)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SignatureModal,
          {
            open: sigModal === "health",
            label: "Health Declaration",
            declarationText: HEALTH_DECLARATION_TEXT,
            visitorName: form.visitorName || void 0,
            farmName,
            onConfirm: (sig) => {
              setForm((f) => ({ ...f, healthSignature: sig, healthDeclarationSigned: true }));
              setSigModal(null);
            },
            onCancel: () => setSigModal(null)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Additional notes", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          RecordAttachments,
          {
            farmId,
            recordType: "visitor-log",
            recordId: editing.id
          }
        ) }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📎" }),
          " Save the record first, then re-open it to attach scanned declarations or ID copies."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setFormOpen(false);
            setEditing(null);
            setForm(EMPTY_VISITOR);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editing ? "Update Record" : "Log Visitor"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Visitor Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure? This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteM.mutate(deleteId), disabled: deleteM.isPending, children: [
          deleteM.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) })
  ] });
}
function PestPhotoPanel({ recordId, farmId, photos }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const deleteMut = useMutation({
    mutationFn: (photoId) => fetch(`/api/farms/${farmId}/pest-control/${recordId}/photos/${photoId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pest-control", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/pest-control/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["pest-control", farmId] });
      toast({ title: "Photo uploaded" });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, style: { padding: 0, background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 16px 12px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }, children: "Evidence Photos" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }, children: photos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 12, style: { color: "#2563eb" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${p.objectPath}`, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }, children: p.fileName ?? "photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(p.id), style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }, children: [
      isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 13 }),
      isUploading ? `Uploading… ${progress}%` : "Add Photo",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*,application/pdf",
          style: { display: "none" },
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }
        }
      )
    ] })
  ] }) });
}
const EMPTY_PEST = { pestType: "", location: "", treatmentMethod: "", productUsed: "", treatmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), treatedBy: "", followUpDate: "", outcome: "", notes: "" };
const PEST_TYPES = ["Rats / Mice", "Rabbits", "Foxes", "Pigeons / Corvids", "Moles", "Slugs / Snails", "Insects", "Other"];
function printPestControlRegister(records, farmName, yearLabel) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const rows = records.map((r) => `<tr>
    <td>${r.pestType}</td><td>${r.location || "—"}</td><td>${r.treatmentMethod || "—"}</td>
    <td>${r.productUsed || "—"}</td><td style="white-space:nowrap">${fmtD(r.treatmentDate)}</td>
    <td>${r.treatedBy || "—"}</td><td style="white-space:nowrap">${fmtD(r.followUpDate)}</td>
    <td>${r.outcome || "—"}</td><td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Pest Control Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Pest Control Register · ${yearLabel} · Red Tractor Biosecurity Compliance</p></div>
<div class="hdr-r"><b>Pest Control Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Pest Type</th><th>Location</th><th>Method</th><th>Product Used</th><th>Treatment Date</th><th>Treated By</th><th>Follow-up Date</th><th>Outcome</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Pest Control Register — Red Tractor compliance record. Retain for minimum 3 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function PestControlTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = reactExports.useState("");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewPest, setViewPest] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_PEST);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["pest-control", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/pest-control`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const filtered = records.filter(
    (r) => isInCropYear(r.treatmentDate, cropYear) && (!search || r.pestType.toLowerCase().includes(search.toLowerCase()) || r.location?.toLowerCase().includes(search.toLowerCase()) || r.productUsed?.toLowerCase().includes(search.toLowerCase()))
  );
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/pest-control`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pest-control", farmId] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_PEST);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/pest-control/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pest-control", farmId] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_PEST);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/pest-control/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pest-control", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(p) {
    setEditing(p);
    setForm({ pestType: p.pestType, location: p.location ?? "", treatmentMethod: p.treatmentMethod ?? "", productUsed: p.productUsed ?? "", treatmentDate: p.treatmentDate?.slice(0, 10) ?? "", treatedBy: p.treatedBy ?? "", followUpDate: p.followUpDate?.slice(0, 10) ?? "", outcome: p.outcome ?? "", notes: p.notes ?? "" });
    setFormOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const body = { ...form, treatmentDate: form.treatmentDate ? new Date(form.treatmentDate).toISOString() : null, followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null };
    if (editing) {
      updateM.mutate({ id: editing.id, body });
    } else {
      createM.mutate(body);
    }
  }
  const isSubmitting = createM.isPending || updateM.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search pest type, location, product...", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear, showAllYears: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => printPestControlRegister(filtered, farmName, cropYearLabel(cropYear)), className: "gap-2 shrink-0", disabled: filtered.length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
        " Print Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setForm(EMPTY_PEST);
        setFormOpen(true);
      }, className: "gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " Add Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
      "Loading..."
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-8 h-8 text-primary/40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No pest control records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No records match your search." : "Record pest treatments to demonstrate active management for Red Tractor." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border", children: ["Pest Type", "Location", "Product / Method", "Treatment Date", "Treated By", "Follow-up", "Outcome", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50 whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((p) => {
        const expanded = expandedId === p.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-black/[0.02] transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm font-medium", children: p.pestType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: p.location || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: p.productUsed || p.treatmentMethod || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70 whitespace-nowrap", children: formatDate(p.treatmentDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: p.treatedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
              p.followUpDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/70", children: formatDate(p.followUpDate) }),
              dueBadge(p.followUpDate)
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70 max-w-[120px] truncate", children: p.outcome || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewPest(p), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-green-600", title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpandedId(expanded ? null : p.id), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary", title: "Photos", children: [
                expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" }),
                (p.photos?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "1px 5px", marginLeft: 2 }, children: p.photos.length })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(p), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(p.id), className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) }),
              p.followUpDate && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(p), className: "p-1.5 rounded-md hover:bg-purple-50 text-foreground/40 hover:text-purple-600", title: "Raise Task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4" }) })
            ] }) })
          ] }),
          expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PestPhotoPanel, { recordId: p.id, farmId, photos: p.photos ?? [] }) })
        ] }, p.id);
      }) })
    ] }) }) }),
    viewPest && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewPest(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-5 h-5 text-primary" }),
        "View Pest Control Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pest Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewPest.pestType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewPest.location ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewPest.treatmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treated By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewPest.treatedBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewPest.treatmentMethod ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewPest.productUsed ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Follow-up Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewPest.followUpDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewPest.outcome ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewPest.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RecordAttachments,
        {
          farmId,
          recordType: "pest-control",
          recordId: viewPest.id
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewPest);
          setViewPest(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewPest(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) {
        setFormOpen(false);
        setEditing(null);
        setForm(EMPTY_PEST);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-5 h-5 text-primary" }),
          editing ? "Edit Pest Control Record" : "Add Pest Control Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record pest control activities to demonstrate proactive management." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Pest Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: PEST_TYPES.filter((p) => p !== "Other").includes(form.pestType) ? form.pestType : form.pestType ? "Other" : "", onChange: (e) => setForm((f) => ({ ...f, pestType: e.target.value })), required: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select..." }),
              PEST_TYPES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p, children: p === "Other" ? "Other (please specify)" : p }, p))
            ] }),
            (form.pestType === "Other" || form.pestType && !PEST_TYPES.filter((p) => p !== "Other").includes(form.pestType)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.pestType === "Other" ? "" : form.pestType, onChange: (e) => setForm((f) => ({ ...f, pestType: e.target.value || "Other" })), placeholder: "Please specify pest type…", autoFocus: form.pestType === "Other" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FarmLocationSelect, { farmId, value: form.location, onChange: (v) => setForm((f) => ({ ...f, location: v })), placeholder: "Select or type location…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Treatment Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.treatmentDate, onChange: (e) => setForm((f) => ({ ...f, treatmentDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Treated By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name or contractor", value: form.treatedBy, onChange: (e) => setForm((f) => ({ ...f, treatedBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Treatment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Traps, Bait stations, Shooting", value: form.treatmentMethod, onChange: (e) => setForm((f) => ({ ...f, treatmentMethod: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Product Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Brodifacoum, Pindone", value: form.productUsed, onChange: (e) => setForm((f) => ({ ...f, productUsed: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Follow-up Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.followUpDate, onChange: (e) => setForm((f) => ({ ...f, followUpDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Outcome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Effective, Ongoing, Refer to contractor", value: form.outcome, onChange: (e) => setForm((f) => ({ ...f, outcome: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Additional notes", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setFormOpen(false);
            setEditing(null);
            setForm(EMPTY_PEST);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editing ? "Update Record" : "Save Record"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Pest Control Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure? This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteM.mutate(deleteId), disabled: deleteM.isPending, children: [
          deleteM.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Pest Control Follow-up — ${raiseTaskFor.pestType}`,
        defaultDescription: `Follow-up due ${raiseTaskFor.followUpDate ? new Date(raiseTaskFor.followUpDate).toLocaleDateString("en-GB") : ""}${raiseTaskFor.location ? ` at ${raiseTaskFor.location}` : ""}${raiseTaskFor.outcome ? ` · Outcome: ${raiseTaskFor.outcome}` : ""}`,
        module: "biosecurity"
      }
    )
  ] });
}
const EMPTY_CLEANING = {
  area: "",
  cleaningType: "",
  productsUsed: "",
  dilutionRate: "",
  contactTime: "",
  cleanedBy: "",
  cleanedDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  nextDueDate: "",
  verifiedBy: "",
  notes: "",
  performedByContractor: false,
  contractorName: "",
  contractorSupplierId: null,
  contractorOwnSupplies: false,
  costPence: "",
  invoiceRef: "",
  ramsId: ""
};
const CLEANING_TYPES = ["Routine clean", "Deep clean", "Disinfection", "Fogging / fumigation", "Pre-housing clean", "Post-TB restriction clean", "Emergency clean", "Other"];
const EMPTY_SCHEDULE = { area: "", cleaningType: "", intervalDays: "", notes: "", isActive: true };
const BIO_CLEAN_TYPE_LABELS = {
  full_clean_and_treat: "Full Clean + Treatment",
  physical_clean: "Physical Clean",
  insecticide_treatment: "Insecticide Treatment",
  fumigation: "Fumigation",
  inspection_only: "Inspection Only"
};
const BIO_CLEAN_TYPE_COLORS = {
  full_clean_and_treat: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  physical_clean: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
  insecticide_treatment: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  fumigation: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  inspection_only: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" }
};
function BioCleanHistoryDialog({ records, onClose }) {
  const [yearFilter, setYearFilter] = React.useState("all");
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const sorted = [...records].sort((a, b) => new Date(b.cleanedDate).getTime() - new Date(a.cleanedDate).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((r) => r.cleanedDate && new Date(r.cleanedDate).getFullYear() === yearFilter);
  function handlePrint() {
    const rows = filtered.map((r) => `<tr><td>${r.cleanedDate ? new Date(r.cleanedDate).toLocaleDateString("en-GB") : "—"}</td><td>${r.area}</td><td>${BIO_CLEAN_TYPE_LABELS[r.cleaningType] ?? r.cleaningType}</td><td>${r.productsUsed || "—"}</td><td>${r.dilutionRate || "—"}</td><td>${r.cleanedBy || "—"}</td><td>${r.notes || ""}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>C&D History</title><style>body{font-family:Arial,sans-serif;font-size:11pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:6px 8px;text-align:left;font-size:9pt}td{padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:9.5pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1>Cleaning & Disinfection History</h1><p style="font-size:9pt;color:#555">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}${yearFilter !== "all" ? ` · Year: ${yearFilter}` : ""}</p><table><thead><tr><th>Date</th><th>Area / Location</th><th>Type</th><th>Product</th><th>Dilution</th><th>Carried Out By</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">Red Tractor &amp; APHA: retain C&D records for a minimum of 3 years.</p></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-green-700" }),
      "Cleaning & Disinfection History"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter(y), style: { padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }, children: y === "all" ? "All years" : y }, y)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " record",
        filtered.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-9 h-9 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No records for ",
        yearFilter === "all" ? "any year" : yearFilter
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: filtered.map((r) => {
      const date = r.cleanedDate ? new Date(r.cleanedDate) : null;
      const col = BIO_CLEAN_TYPE_COLORS[r.cleaningType] ?? BIO_CLEAN_TYPE_COLORS.inspection_only;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 w-24 text-right", children: date ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 leading-tight", children: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: date.getFullYear() })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-800", children: r.area }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: col.bg, color: col.text, border: `1px solid ${col.border}` }, children: BIO_CLEAN_TYPE_LABELS[r.cleaningType] ?? r.cleaningType }),
            r.cleanedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "by ",
              r.cleanedBy
            ] })
          ] }),
          r.productsUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3 text-blue-400 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.productsUsed }),
            r.dilutionRate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "— ",
              r.dilutionRate
            ] })
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: r.notes })
        ] })
      ] }) }, r.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "border-t pt-3 flex-row items-center gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex-1", children: [
        "Retain C&D records for at least ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 years" }),
        " (APHA / Red Tractor requirement)."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function printCleaningRegister(records, farmName, yearLabel) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const rows = records.map((r) => {
    const consumptionStr = r.consumptions?.length ? r.consumptions.map((c) => `${c.productName || c.stockItemName || "Stock"}: ${c.quantityUsed}${c.stockItemUnit ? " " + c.stockItemUnit : ""}`).join("; ") : "—";
    return `<tr>
    <td>${r.area}</td><td>${r.cleaningType}</td><td>${r.productsUsed || "—"}</td>
    <td>${r.dilutionRate || "—"}</td><td>${r.contactTime || "—"}</td>
    <td style="white-space:nowrap">${fmtD(r.cleanedDate)}</td>
    <td>${r.performedByContractor ? `Contractor: ${r.contractorName || "—"}` : r.cleanedBy || "—"}</td>
    <td style="white-space:nowrap">${fmtD(r.nextDueDate)}</td><td>${r.verifiedBy || "—"}</td>
    <td>${consumptionStr}</td>
    <td>${r.costPence ? `£${(r.costPence / 100).toFixed(2)}` : "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`;
  }).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Cleaning &amp; Disinfection Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Cleaning &amp; Disinfection Register · ${yearLabel} · Red Tractor Biosecurity Compliance</p></div>
<div class="hdr-r"><b>Cleaning &amp; Disinfection Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Area / Location</th><th>Cleaning Type</th><th>Products Used</th><th>Dilution Rate</th><th>Contact Time</th><th>Cleaned Date</th><th>Cleaned By</th><th>Next Due</th><th>Verified By</th><th>Qty Used</th><th>Cost</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Cleaning &amp; Disinfection Register — Red Tractor compliance record. Retain for minimum 3 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function CleaningTab({ farmId, farmName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [historyOpen, setHistoryOpen] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewCleaning, setViewCleaning] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_CLEANING);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [selectedProducts, setSelectedProducts] = reactExports.useState([]);
  const [stockConsumptions, setStockConsumptions] = reactExports.useState({});
  const [customProduct, setCustomProduct] = reactExports.useState("");
  const [autoNextDue, setAutoNextDue] = reactExports.useState("");
  const [scheduleOpen, setScheduleOpen] = reactExports.useState(false);
  const [scheduleForm, setScheduleForm] = reactExports.useState(EMPTY_SCHEDULE);
  const [editingSchedule, setEditingSchedule] = reactExports.useState(null);
  const [deleteScheduleId, setDeleteScheduleId] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["cleaning", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/cleaning`).then((r) => r.json())
  });
  const { data: coshhData } = useQuery({
    queryKey: ["coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/coshh`).then((r) => r.json())
  });
  const { data: stockData } = useQuery({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then((r) => r.json())
  });
  const { data: ramsData } = useQuery({
    queryKey: ["risk-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/risk-assessments`).then((r) => r.json())
  });
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ["cleaning-schedules", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/cleaning-schedules`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const coshhSubstances = (coshhData?.records ?? []).map((r) => r.substanceName).filter(Boolean);
  const stockItems = stockData?.records ?? [];
  const CLEANING_STOCK_CATEGORIES = ["disinfectant", "disinfectants", "cleaning", "sanitiser", "sanitizer", "biosecurity"];
  const cleaningStockItems = stockItems.filter((s) => s.category && CLEANING_STOCK_CATEGORIES.includes(s.category.toLowerCase()));
  const stockForDropdown = cleaningStockItems.length > 0 ? cleaningStockItems : stockItems;
  const ramsRecords = ramsData?.records ?? [];
  const schedules = schedulesData?.schedules ?? [];
  const { data: cleanMembersData, isLoading: cleanMembersLoading } = useFarmMembers(farmId);
  const cleanStaffNames = (cleanMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const knownStaff = [.../* @__PURE__ */ new Set([
    ...records.map((r) => r.cleanedBy).filter(Boolean),
    ...records.map((r) => r.verifiedBy).filter(Boolean)
  ])];
  const filtered = records.filter(
    (r) => isInCropYear(r.cleanedDate, cropYear) && (!search || r.area.toLowerCase().includes(search.toLowerCase()) || r.cleaningType.toLowerCase().includes(search.toLowerCase()) || r.productsUsed?.toLowerCase().includes(search.toLowerCase()) || r.contractorName?.toLowerCase().includes(search.toLowerCase()))
  );
  reactExports.useEffect(() => {
    if (!form.area || !form.cleaningType || !form.cleanedDate) {
      setAutoNextDue("");
      return;
    }
    const rule = schedules.find(
      (s) => s.isActive && s.area.toLowerCase() === form.area.toLowerCase() && s.cleaningType.toLowerCase() === form.cleaningType.toLowerCase()
    );
    if (rule) {
      const d = new Date(form.cleanedDate);
      d.setDate(d.getDate() + rule.intervalDays);
      const computed = d.toISOString().slice(0, 10);
      setAutoNextDue(computed);
      setForm((f) => ({ ...f, nextDueDate: f.nextDueDate === autoNextDue || f.nextDueDate === "" ? computed : f.nextDueDate }));
    } else {
      setAutoNextDue("");
    }
  }, [form.area, form.cleaningType, form.cleanedDate, schedules]);
  function resetCleaningDialog() {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_CLEANING);
    setSelectedProducts([]);
    setStockConsumptions({});
    setCustomProduct("");
    setAutoNextDue("");
  }
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/cleaning`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning", farmId] });
      qc.invalidateQueries({ queryKey: ["stock-items", farmId] });
      resetCleaningDialog();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/cleaning/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning", farmId] });
      resetCleaningDialog();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/cleaning/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const createScheduleM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/cleaning-schedules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-schedules", farmId] });
      setScheduleOpen(false);
      setEditingSchedule(null);
      setScheduleForm(EMPTY_SCHEDULE);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateScheduleM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/cleaning-schedules/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-schedules", farmId] });
      setScheduleOpen(false);
      setEditingSchedule(null);
      setScheduleForm(EMPTY_SCHEDULE);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteScheduleM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/cleaning-schedules/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-schedules", farmId] });
      setDeleteScheduleId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(c) {
    setEditing(c);
    setForm({
      area: c.area,
      cleaningType: c.cleaningType,
      productsUsed: c.productsUsed ?? "",
      dilutionRate: c.dilutionRate ?? "",
      contactTime: c.contactTime ?? "",
      cleanedBy: c.cleanedBy ?? "",
      cleanedDate: c.cleanedDate?.slice(0, 10) ?? "",
      nextDueDate: c.nextDueDate?.slice(0, 10) ?? "",
      verifiedBy: c.verifiedBy ?? "",
      notes: c.notes ?? "",
      performedByContractor: c.performedByContractor ?? false,
      contractorName: c.contractorName ?? "",
      contractorSupplierId: c.contractorSupplierId ?? null,
      contractorOwnSupplies: c.contractorOwnSupplies ?? false,
      costPence: c.costPence ? String(c.costPence / 100) : "",
      invoiceRef: c.invoiceRef ?? "",
      ramsId: c.ramsId ?? ""
    });
    const products = c.productsUsed ? c.productsUsed.split(",").map((s) => s.trim()).filter(Boolean) : [];
    setSelectedProducts(products);
    const savedConsumptions = {};
    for (const cons of c.consumptions ?? []) {
      const key = cons.productName || (cons.stockItemName ?? `item-${cons.stockItemId}`);
      savedConsumptions[key] = { stockItemId: String(cons.stockItemId), quantity: cons.quantityUsed };
    }
    setStockConsumptions(savedConsumptions);
    setCustomProduct("");
    setAutoNextDue("");
    setFormOpen(true);
  }
  function openEditSchedule(s) {
    setEditingSchedule(s);
    setScheduleForm({ area: s.area, cleaningType: s.cleaningType, intervalDays: s.intervalDays, notes: s.notes ?? "", isActive: s.isActive });
    setScheduleOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const productsUsed = selectedProducts.join(", ");
    const costPenceVal = form.costPence !== "" ? Math.round(parseFloat(String(form.costPence)) * 100) : null;
    const consumptions = selectedProducts.filter((p) => stockConsumptions[p]?.stockItemId).map((p) => ({
      productName: p,
      stockItemId: parseInt(String(stockConsumptions[p].stockItemId)),
      quantityUsed: stockConsumptions[p].quantity || "0"
    }));
    const body = {
      ...form,
      productsUsed,
      consumptions,
      cleanedDate: form.cleanedDate ? new Date(form.cleanedDate).toISOString() : null,
      nextDueDate: form.nextDueDate ? new Date(form.nextDueDate).toISOString() : null,
      ramsId: form.ramsId !== "" ? parseInt(String(form.ramsId)) : null,
      costPence: !isNaN(costPenceVal) ? costPenceVal : null,
      invoiceRef: form.invoiceRef || null,
      contractorName: form.contractorName || null,
      contractorSupplierId: form.contractorSupplierId ?? null
    };
    if (editing) {
      updateM.mutate({ id: editing.id, body });
    } else {
      createM.mutate(body);
    }
  }
  function handleScheduleSubmit(e) {
    e.preventDefault();
    const body = { ...scheduleForm, intervalDays: parseInt(String(scheduleForm.intervalDays)) };
    if (editingSchedule) {
      updateScheduleM.mutate({ id: editingSchedule.id, body });
    } else {
      createScheduleM.mutate(body);
    }
  }
  const isSubmitting = createM.isPending || updateM.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search area, type, product...", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear, showAllYears: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setHistoryOpen(true), className: "gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
        " C&D History"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => printCleaningRegister(filtered, farmName, cropYearLabel(cropYear)), className: "gap-2 shrink-0", disabled: filtered.length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
        " Print Register"
      ] }),
      historyOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(BioCleanHistoryDialog, { records, onClose: () => setHistoryOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        resetCleaningDialog();
        setFormOpen(true);
      }, className: "gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " Add Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
      "Loading..."
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-8 h-8 text-primary/40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No cleaning records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No records match your search." : "Record cleaning and disinfection activities to maintain biosecurity standards." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border", children: ["Area", "Type", "Products", "Cleaned Date", "Performed By", "Next Due", "Verified By", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50 whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-black/[0.02] transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm font-medium", children: c.area }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: c.cleaningType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70 max-w-[140px] truncate", children: c.productsUsed || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70 whitespace-nowrap", children: formatDate(c.cleanedDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: c.performedByContractor ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { className: "w-3 h-3" }),
          c.contractorName || "Contractor"
        ] }) : c.cleanedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
          c.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/70 whitespace-nowrap", children: formatDate(c.nextDueDate) }),
          dueBadge(c.nextDueDate, "Due")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: c.verifiedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewCleaning(c), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-green-600", title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(c), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(c.id), className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
        ] }) })
      ] }, c.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-primary/60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-foreground/70 uppercase tracking-wider", children: "Cleaning Schedule Rules" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40", children: "— auto-calculate Next Due Date when area & type match" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => {
          setEditingSchedule(null);
          setScheduleForm(EMPTY_SCHEDULE);
          setScheduleOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
          " Add Rule"
        ] })
      ] }),
      schedulesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-foreground/40 py-2", children: "Loading schedules…" }) : schedules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-dashed border-border rounded-xl p-6 text-center text-foreground/40 text-sm", children: "No schedule rules yet. Add a rule to auto-fill Next Due Date when logging a clean." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/40 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50", children: "Area" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50", children: "Cleaning Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50", children: "Interval" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: schedules.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-black/[0.015]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: s.area }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-foreground/70", children: s.cleaningType }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-foreground/70", children: [
            "Every ",
            s.intervalDays,
            " day",
            s.intervalDays !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: s.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
            "Active"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200", children: "Inactive" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-foreground/50 text-xs max-w-[160px] truncate", children: s.notes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditSchedule(s), className: "p-1 rounded hover:bg-black/5 text-foreground/40 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteScheduleId(s.id), className: "p-1 rounded hover:bg-red-50 text-foreground/40 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
          ] }) })
        ] }, s.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) resetCleaningDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-primary" }),
          editing ? "Edit Cleaning Record" : "Add Cleaning Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record cleaning and disinfection to maintain Red Tractor biosecurity standards." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pt-1 max-h-[70vh] overflow-y-auto pr-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Area / Location ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FarmLocationSelect, { farmId, value: form.area, onChange: (v) => setForm((f) => ({ ...f, area: v })), required: true, placeholder: "Select area / location…" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Cleaning Type ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10", value: CLEANING_TYPES.filter((t) => t !== "Other").includes(form.cleaningType) ? form.cleaningType : form.cleaningType ? "Other" : "", onChange: (e) => setForm((f) => ({ ...f, cleaningType: e.target.value })), required: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select type..." }),
                CLEANING_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t === "Other" ? "Other (please specify)" : t }, t))
              ] }),
              (form.cleaningType === "Other" || form.cleaningType && !CLEANING_TYPES.filter((t) => t !== "Other").includes(form.cleaningType)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.cleaningType === "Other" ? "" : form.cleaningType, onChange: (e) => setForm((f) => ({ ...f, cleaningType: e.target.value || "Other" })), placeholder: "Please specify cleaning type…", autoFocus: form.cleaningType === "Other" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Cleaned Date ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.cleanedDate, onChange: (e) => setForm((f) => ({ ...f, cleanedDate: e.target.value })), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Next Due Date",
                autoNextDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs font-normal text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 inline mr-0.5" }),
                  "Auto from schedule"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextDueDate, onChange: (e) => setForm((f) => ({ ...f, nextDueDate: e.target.value })) }),
              autoNextDue && !form.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 mt-1", children: [
                "Will auto-set to ",
                new Date(autoNextDue).toLocaleDateString("en-GB"),
                " on save"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1", children: "Performed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setForm((f) => ({ ...f, performedByContractor: false })),
                  className: `flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${!form.performedByContractor ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground/50 hover:border-primary/40"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4" }),
                    " Farm Staff"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setForm((f) => ({ ...f, performedByContractor: true })),
                  className: `flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.performedByContractor ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border text-foreground/50 hover:border-amber-400"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { className: "w-4 h-4" }),
                    " Contractor"
                  ]
                }
              )
            ] }),
            form.performedByContractor ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                  "Contractor Name ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.contractorSupplierId ?? null, valueName: form.contractorName, onChange: (id, name) => setForm((f) => ({ ...f, contractorSupplierId: id, contractorName: name })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end pb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: form.contractorOwnSupplies,
                    onChange: (e) => setForm((f) => ({ ...f, contractorOwnSupplies: e.target.checked })),
                    className: "w-4 h-4 rounded accent-amber-600"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground/70", children: "Contractor's own supplies" })
              ] }) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Cleaned By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "cleaning-staff-list", placeholder: "Name of staff member", value: form.cleanedBy, onChange: (e) => setForm((f) => ({ ...f, cleanedBy: e.target.value })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "cleaning-staff-list", children: knownStaff.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Products Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 min-h-[2rem] mb-2", children: [
              selectedProducts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20", children: [
                p,
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedProducts((pp) => pp.filter((x) => x !== p)), className: "ml-0.5 hover:text-red-500 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
              ] }, p)),
              selectedProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/40 italic self-center", children: "No products selected yet" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: "",
                onChange: (e) => {
                  const v = e.target.value;
                  if (v) setSelectedProducts((pp) => pp.includes(v) ? pp : [...pp, v]);
                },
                className: "flex-1 h-10 rounded-xl border-2 border-border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "+ Add from COSHH register…" }),
                  coshhSubstances.filter((s) => !selectedProducts.includes(s)).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Or type unlisted product name…",
                  value: customProduct,
                  onChange: (e) => setCustomProduct(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const v = customProduct.trim();
                      if (v) {
                        setSelectedProducts((pp) => pp.includes(v) ? pp : [...pp, v]);
                        setCustomProduct("");
                      }
                    }
                  },
                  className: "flex-1 text-sm h-10"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  className: "h-10 px-3 shrink-0",
                  disabled: !customProduct.trim(),
                  onClick: () => {
                    const v = customProduct.trim();
                    if (v) {
                      setSelectedProducts((pp) => pp.includes(v) ? pp : [...pp, v]);
                      setCustomProduct("");
                    }
                  },
                  children: "Add"
                }
              )
            ] }),
            coshhSubstances.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1.5", children: "No COSHH substances on register yet — type products manually above." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Dilution Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 1:100, 1%", value: form.dilutionRate, onChange: (e) => setForm((f) => ({ ...f, dilutionRate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Contact Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 30 minutes, overnight", value: form.contactTime, onChange: (e) => setForm((f) => ({ ...f, contactTime: e.target.value })) })
            ] })
          ] }),
          !form.contractorOwnSupplies && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-4 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5" }),
              "Stock Used — per product",
              !form.performedByContractor && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-foreground/40", children: "· farm supplies deducted on save" })
            ] }),
            selectedProducts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-1", children: "Add products above to link stock items for each one." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: selectedProducts.map((product) => {
              const consumption = stockConsumptions[product] ?? { stockItemId: "", quantity: "" };
              const norm = product.toLowerCase();
              const matched = stockForDropdown.filter((s) => s.name.toLowerCase().includes(norm) || norm.includes(s.name.toLowerCase()));
              const others = stockForDropdown.filter((s) => !matched.includes(s));
              const linkedItem = stockForDropdown.find((s) => s.id === Number(consumption.stockItemId));
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground/70 min-w-0 w-36 truncate", title: product, children: product }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 shrink-0", children: "→" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: consumption.stockItemId,
                    onChange: (e) => setStockConsumptions((prev) => ({ ...prev, [product]: { ...prev[product] ?? { quantity: "" }, stockItemId: e.target.value } })),
                    className: "flex-1 h-9 rounded-lg border-2 border-border bg-transparent px-2 text-xs focus:outline-none focus:border-primary min-w-0",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Link stock item…" }),
                      matched.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "── Matched by name", children: matched.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.id, children: [
                        s.name,
                        s.unit ? ` (${s.unit})` : ""
                      ] }, s.id)) }),
                      others.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: matched.length > 0 ? "── Other stock items" : "── Stock items", children: others.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.id, children: [
                        s.name,
                        s.unit ? ` (${s.unit})` : ""
                      ] }, s.id)) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      className: "w-20 h-9 text-xs",
                      placeholder: "Qty",
                      value: consumption.quantity,
                      disabled: !consumption.stockItemId,
                      onChange: (e) => setStockConsumptions((prev) => ({ ...prev, [product]: { ...prev[product] ?? { stockItemId: "" }, quantity: e.target.value } }))
                    }
                  ),
                  linkedItem?.unit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 w-8 shrink-0", children: linkedItem.unit })
                ] })
              ] }, product);
            }) }),
            stockItems.length === 0 && selectedProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No stock items on register yet — add them in the Stock & Suppliers module." }),
            stockItems.length > 0 && cleaningStockItems.length === 0 && selectedProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: 'No items categorised as Disinfectant found — showing all stock items. Set the category to "Disinfectant" in Stock & Suppliers to filter here.' })
          ] }),
          form.performedByContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1", children: "Cost & Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Cost (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-foreground/50", children: "£" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-7", type: "number", step: "0.01", min: "0", placeholder: "0.00", value: form.costPence, onChange: (e) => setForm((f) => ({ ...f, costPence: e.target.value })) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Invoice / PO Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-2024-001", value: form.invoiceRef, onChange: (e) => setForm((f) => ({ ...f, invoiceRef: e.target.value })) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 inline mr-1 text-foreground/40" }),
                "RAMS / Risk Assessment Reference"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: form.ramsId,
                  onChange: (e) => setForm((f) => ({ ...f, ramsId: e.target.value })),
                  className: "w-full h-10 rounded-xl border-2 border-border bg-transparent px-3 py-1 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "None / not applicable" }),
                    ramsRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: r.id, children: [
                      r.title,
                      r.area ? ` — ${r.area}` : ""
                    ] }, r.id))
                  ]
                }
              ),
              ramsRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-1", children: "No risk assessments on file. Add them in the Risk & Waste module." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Verified By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.verifiedBy, onChange: (v) => setForm((f) => ({ ...f, verifiedBy: v })), staffNames: cleanStaffNames, loading: cleanMembersLoading })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Additional notes", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
          ] })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl p-4 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          RecordAttachments,
          {
            farmId,
            recordType: "cleaning-disinfection",
            recordId: editing.id
          }
        ) }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 flex items-center gap-1.5 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📎" }),
          " Save the record first, then re-open it to attach photos or documents."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: resetCleaningDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editing ? "Update Record" : "Save Record"
          ] })
        ] })
      ] })
    ] }) }),
    viewCleaning && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewCleaning(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-primary" }),
        "Cleaning Record — ",
        viewCleaning.area
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Area / Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.area })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Cleaning Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.cleaningType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Cleaned Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewCleaning.cleanedDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Performed By" }),
          viewCleaning.performedByContractor ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { className: "w-3.5 h-3.5 text-amber-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-700", children: "Contractor" }),
            viewCleaning.contractorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/70 font-normal", children: [
              " — ",
              viewCleaning.contractorName
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.cleanedBy || "—" })
        ] }),
        viewCleaning.performedByContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Contractor's Own Supplies" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.contractorOwnSupplies ? "Yes" : "No — farm supplies used" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Products Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.productsUsed || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Dilution Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.dilutionRate || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Contact Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.contactTime || "—" })
        ] }),
        viewCleaning.consumptions?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1.5", children: "Stock Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: viewCleaning.consumptions.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 text-foreground/40 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.stockItemName || `Item #${c.stockItemId}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50", children: "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              c.quantityUsed,
              c.stockItemUnit ? ` ${c.stockItemUnit}` : ""
            ] }),
            c.productName && c.productName !== c.stockItemName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/40 italic", children: [
              "(",
              c.productName,
              ")"
            ] })
          ] }, i)) })
        ] }),
        (viewCleaning.costPence || viewCleaning.invoiceRef) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Cost / Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewCleaning.costPence ? `£${(viewCleaning.costPence / 100).toFixed(2)}` : "—",
            viewCleaning.invoiceRef && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50 font-normal ml-2 text-xs", children: viewCleaning.invoiceRef })
          ] })
        ] }),
        viewCleaning.ramsId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "RAMS Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 text-foreground/40" }),
            ramsRecords.find((r) => r.id === viewCleaning.ramsId)?.title ?? `RA-${viewCleaning.ramsId}`
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Next Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.nextDueDate ? formatDate(viewCleaning.nextDueDate) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Verified By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.verifiedBy || "—" })
        ] }),
        viewCleaning.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-0.5", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCleaning.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl p-4 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RecordAttachments,
        {
          farmId,
          recordType: "cleaning-disinfection",
          recordId: viewCleaning.id
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewCleaning);
          setViewCleaning(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewCleaning(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Cleaning Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure? This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteM.mutate(deleteId), disabled: deleteM.isPending, children: [
          deleteM.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: scheduleOpen, onOpenChange: (o) => {
      if (!o) {
        setScheduleOpen(false);
        setEditingSchedule(null);
        setScheduleForm(EMPTY_SCHEDULE);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-primary" }),
          editingSchedule ? "Edit Schedule Rule" : "Add Schedule Rule"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Define recurring cleaning intervals. When you log a clean that matches an active rule, the Next Due Date is calculated automatically." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleScheduleSubmit, className: "space-y-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Area / Location ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FarmLocationSelect, { farmId, value: scheduleForm.area, onChange: (v) => setScheduleForm((f) => ({ ...f, area: v })), required: true, placeholder: "Select area…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Cleaning Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10", value: scheduleForm.cleaningType, onChange: (e) => setScheduleForm((f) => ({ ...f, cleaningType: e.target.value })), required: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select type..." }),
              CLEANING_TYPES.filter((t) => t !== "Other").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Interval (days) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "3650", placeholder: "e.g. 7, 14, 28, 90", value: scheduleForm.intervalDays, onChange: (e) => setScheduleForm((f) => ({ ...f, intervalDays: e.target.value })), required: true }),
            scheduleForm.intervalDays && !isNaN(Number(scheduleForm.intervalDays)) && Number(scheduleForm.intervalDays) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-1", children: [
              "Every ",
              Number(scheduleForm.intervalDays) === 7 ? "week" : Number(scheduleForm.intervalDays) === 14 ? "fortnight" : Number(scheduleForm.intervalDays) === 28 || Number(scheduleForm.intervalDays) === 30 ? "month" : `${scheduleForm.intervalDays} days`
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end pb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: scheduleForm.isActive, onChange: (e) => setScheduleForm((f) => ({ ...f, isActive: e.target.checked })), className: "w-4 h-4 rounded accent-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground/70", children: "Active (used for auto-date)" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Optional — e.g. Red Tractor requirement, quarterly inspection", value: scheduleForm.notes, onChange: (e) => setScheduleForm((f) => ({ ...f, notes: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setScheduleOpen(false);
            setEditingSchedule(null);
            setScheduleForm(EMPTY_SCHEDULE);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: createScheduleM.isPending || updateScheduleM.isPending, children: [
            (createScheduleM.isPending || updateScheduleM.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editingSchedule ? "Update Rule" : "Save Rule"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteScheduleId !== null, onOpenChange: () => setDeleteScheduleId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Schedule Rule" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "This rule will no longer auto-calculate Next Due Date. Existing records are not affected." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteScheduleId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteScheduleId && deleteScheduleM.mutate(deleteScheduleId), disabled: deleteScheduleM.isPending, children: [
          deleteScheduleM.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) })
  ] });
}
function printCoshhRegister(records, farmName, yearLabel) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const rows = records.map((r) => `<tr>
    <td style="font-weight:600">${r.substanceName}</td><td>${r.manufacturer || "—"}</td>
    <td>${r.hazardClassification || "—"}</td><td>${r.usageArea || "—"}</td>
    <td>${r.storageLocation || "—"}</td><td>${r.assessedBy || "—"}</td>
    <td style="white-space:nowrap">${fmtD(r.assessmentDate)}</td>
    <td style="white-space:nowrap">${fmtD(r.reviewDate)}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>COSHH Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">COSHH Assessment Register · ${yearLabel} · Control of Substances Hazardous to Health · Red Tractor Compliance</p></div>
<div class="hdr-r"><b>COSHH Register</b>${records.length} substance${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Substance</th><th>Manufacturer</th><th>Hazard Classification</th><th>Usage Area</th><th>Storage Location</th><th>Assessed By</th><th>Assessment Date</th><th>Review Due</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">COSHH Register — Control of Substances Hazardous to Health Regulations 2002. Retain for minimum 5 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function printCoshhSheet(r, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const tRow = (label, val) => val ? `<tr><td style="font-weight:600;padding:7px 10px;background:#f9fafb;border:1px solid #e5e7eb;width:34%;vertical-align:top;font-size:11px">${label}</td><td style="padding:7px 10px;border:1px solid #e5e7eb;white-space:pre-wrap;font-size:11px">${val}</td></tr>` : "";
  openPrint(`<!DOCTYPE html><html><head><title>COSHH Assessment — ${r.substanceName}</title><style>
body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}h1{font-size:15px;font-weight:700;margin:0 0 2px}
h2{font-size:11px;font-weight:700;margin:16px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:3px}
p.sub{font-size:10px;color:#555;margin:1px 0}table{width:100%;border-collapse:collapse;margin-bottom:10px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:16px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.hazard{display:inline-block;background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c;padding:3px 12px;border-radius:4px;font-weight:700;font-size:11px;margin:4px 0 14px}
.sig{margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig-box{border-top:1px solid #000;padding-top:6px;font-size:10px}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:24px}
@media print{@page{margin:2cm}}</style></head><body>
<div class="hdr"><div><h1>${r.substanceName}</h1><p class="sub">${farmName} · COSHH Assessment Sheet · Ref: COSHH-${r.id ?? "—"}</p></div>
<div class="hdr-r"><b>COSHH Assessment</b>Assessed: ${fmtD(r.assessmentDate)}<br>Review due: ${fmtD(r.reviewDate)}<br>Printed: ${today}</div></div>
${r.hazardClassification ? `<div class="hazard">⚠ ${r.hazardClassification}</div>` : ""}
<h2>Substance Details</h2><table>${tRow("Substance Name", r.substanceName)}${tRow("Manufacturer", r.manufacturer)}${tRow("Hazard Classification", r.hazardClassification)}${tRow("Usage Area", r.usageArea)}${tRow("Storage Location", r.storageLocation)}</table>
<h2>Control Measures &amp; PPE Required</h2><table>${tRow("Control Measures / PPE", r.controlMeasures || r.ppe || "—")}</table>
<h2>Emergency Procedures</h2><table>${tRow("Spill / First Aid / Emergency Contacts", r.emergencyProcedures || "—")}</table>
<h2>Document Control</h2><table>${tRow("Assessed By", r.assessedBy)}${tRow("Assessment Date", fmtD(r.assessmentDate))}${tRow("Next Review Date", fmtD(r.reviewDate))}</table>
<div class="sig">
<div class="sig-box">Assessor Signature<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
<div class="sig-box">Farm Manager Countersignature<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
</div>
<div class="footer">COSHH Assessment — Control of Substances Hazardous to Health Regulations 2002. Must be available at the point of use. Retain for minimum 5 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function CoshhTab({ farmId, farmName }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewCoshh, setViewCoshh] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: "", reviewDate: "", notes: "" });
  const { data: coshhMembersData, isLoading: coshhMembersLoading } = useFarmMembers(farmId);
  const coshhStaffNames = (coshhMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const q = useQuery({
    queryKey: ["coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/coshh`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["coshh", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/coshh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "COSHH assessment saved" });
      invalidate();
      setAddOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/coshh/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const resetForm = () => setForm({ substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: "", reviewDate: "", notes: "" });
  const allRecords = q.data ?? [];
  const records = allRecords.filter((r) => isInCropYear(r.assessmentDate, cropYear));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "COSHH assessments for hazardous substances used on the farm." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear, showAllYears: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => printCoshhRegister(records, farmName, cropYearLabel(cropYear)), disabled: records.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          resetForm();
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Add COSHH Assessment"
        ] })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, color: "#374151" }, children: [
        "No COSHH assessments for ",
        cropYearLabel(cropYear)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record assessments for pesticides, cleaning chemicals, fuels and other hazardous substances." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Substance", "Manufacturer", "Hazard Class", "Usage Area", "Storage", "Assessed By", "Date", "Review Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600 }, children: r.substanceName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.manufacturer || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.hazardClassification || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.usageArea || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.storageLocation || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.assessedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: r.reviewDate ? new Date(r.reviewDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewCoshh(r), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => printCoshhSheet(r, farmName), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Print COSHH Assessment Sheet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewCoshh && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewCoshh(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-primary" }),
        "View COSHH Assessment"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Substance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewCoshh.substanceName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Manufacturer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewCoshh.manufacturer ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Hazard Classification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewCoshh.hazardClassification ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Usage Area" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewCoshh.usageArea ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewCoshh.storageLocation ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewCoshh.assessedBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCoshh.assessmentDate ? new Date(viewCoshh.assessmentDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewCoshh.reviewDate ? new Date(viewCoshh.reviewDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PPE / Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewCoshh.controlMeasures || viewCoshh.ppe || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Emergency Procedures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewCoshh.emergencyProcedures || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewCoshh.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RecordAttachments,
        {
          farmId,
          recordType: "coshh",
          recordId: viewCoshh.id
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewCoshh(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) resetForm();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add COSHH Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Substance Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Roundup 360", value: form.substanceName, onChange: (e) => setForm((f) => ({ ...f, substanceName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manufacturer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.manufacturer, onChange: (e) => setForm((f) => ({ ...f, manufacturer: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hazard Classification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Irritant, Harmful to environment", value: form.hazardClassification, onChange: (e) => setForm((f) => ({ ...f, hazardClassification: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Usage Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Arable fields, buildings", value: form.usageArea, onChange: (e) => setForm((f) => ({ ...f, usageArea: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FarmLocationSelect, { farmId, value: form.storageLocation, onChange: (v) => setForm((f) => ({ ...f, storageLocation: v })), placeholder: "Select storage location…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Control Measures / PPE Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Describe PPE, handling precautions, ventilation requirements...", value: form.controlMeasures, onChange: (e) => setForm((f) => ({ ...f, controlMeasures: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Emergency Procedures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Spill response, first aid, emergency contacts...", value: form.emergencyProcedures, onChange: (e) => setForm((f) => ({ ...f, emergencyProcedures: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.assessedBy, onChange: (v) => setForm((f) => ({ ...f, assessedBy: v })), staffNames: coshhStaffNames, loading: coshhMembersLoading })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Assessment Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate, onChange: (e) => setForm((f) => ({ ...f, assessmentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.reviewDate, onChange: (e) => setForm((f) => ({ ...f, reviewDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 flex items-center gap-1.5 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📎" }),
          " Save the assessment first, then open it to attach the Safety Data Sheet or other documents."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(form), disabled: !form.substanceName || !form.assessmentDate || createMut.isPending, children: "Save Assessment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete COSHH Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this COSHH assessment record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function BiosecurityPlanTab({ farmId }) {
  const q = useQuery({
    queryKey: ["biosecurity-plan", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biosecurity-plan`).then((r) => r.json()),
    enabled: !!farmId
  });
  const plan = q.data?.plan ?? null;
  const hasPlan = !!(plan?.restrictedAreas || plan?.visitorProcedures);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 640 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "18px 20px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 22, style: { color: "#2563eb", flexShrink: 0, marginTop: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#1d4ed8", margin: "0 0 4px", fontSize: "0.9375rem" }, children: "Biosecurity Plan — managed in Compliance & Plans" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#1e40af", margin: "0 0 12px", lineHeight: 1.5 }, children: [
          "Your Biosecurity Plan now lives in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Compliance & Plans" }),
          ", giving you access to the full 13-section editor, emergency contacts (vet & APHA area office), version control, and the printable Red Tractor document. Any edits made there are reflected here automatically."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/compliance", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14, className: "mr-2" }),
          "Open Biosecurity Plan"
        ] }) })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Loading…" }) : !hasPlan ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "2rem 1rem", border: "2px dashed #e5e7eb", borderRadius: 10, color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 28, style: { margin: "0 auto 8px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", margin: "0 0 4px" }, children: "No Biosecurity Plan on file yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", margin: "0 0 14px" }, children: "Inspectors will ask to see this document. Create it in Compliance & Plans." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/compliance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", children: "Go to Compliance & Plans" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 18px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#111827", margin: "0 0 10px", fontSize: "0.875rem" }, children: "Current plan status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: "0.8125rem", color: "#374151" }, children: [
        plan.lastReviewedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, style: { color: "#16a34a", flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Last reviewed:" }),
            " ",
            formatDate(plan.lastReviewedDate)
          ] })
        ] }),
        plan.nextReviewDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14, style: { color: "#d97706", flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Next review due:" }),
            " ",
            formatDate(plan.nextReviewDate)
          ] })
        ] }),
        plan.planAuthor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Author:" }),
          " ",
          plan.planAuthor
        ] }),
        plan.approvedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Approved by:" }),
          " ",
          plan.approvedBy
        ] })
      ] })
    ] })
  ] });
}
function BiosecurityPage({ defaultTab = "visitors" }) {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "biosecurity", farmId, validIds: ["visitors", "pest-control", "cleaning", "coshh", "biosecurity-plan"], defaultTab, urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmData?.record?.name ?? farmData?.name ?? "Farm";
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Biosecurity", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "visitors", onClick: () => setTab("visitors"), children: "Visitor Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "pest-control", onClick: () => setTab("pest-control"), children: "Pest Control" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "cleaning", onClick: () => setTab("cleaning"), children: "Cleaning & Disinfection" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "coshh", onClick: () => setTab("coshh"), children: "COSHH" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "biosecurity-plan", onClick: () => setTab("biosecurity-plan"), children: "Biosecurity Plan" })
    ] }),
    tab === "visitors" && /* @__PURE__ */ jsxRuntimeExports.jsx(VisitorTab, { farmId, farmName }),
    tab === "pest-control" && /* @__PURE__ */ jsxRuntimeExports.jsx(PestControlTab, { farmId, farmName }),
    tab === "cleaning" && /* @__PURE__ */ jsxRuntimeExports.jsx(CleaningTab, { farmId, farmName }),
    tab === "coshh" && /* @__PURE__ */ jsxRuntimeExports.jsx(CoshhTab, { farmId, farmName }),
    tab === "biosecurity-plan" && /* @__PURE__ */ jsxRuntimeExports.jsx(BiosecurityPlanTab, { farmId })
  ] });
}
export {
  BiosecurityPage as default
};
