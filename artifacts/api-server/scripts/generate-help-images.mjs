import { writeFileSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../public/help-images");
const RSVG = "/nix/store/0a5726czzpj40l2wavx1xk4hip994zlq-librsvg-2.60.0/bin/rsvg-convert";

mkdirSync(OUT, { recursive: true });

// Colour palette
const GREEN_DARK = "#1a3a2a";
const GREEN_MID = "#166534";
const GREEN_LIGHT = "#22c55e";
const GREEN_XL = "#dcfce7";
const BG = "#f9fafb";
const WHITE = "#ffffff";
const BORDER = "#e5e7eb";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BLUE = "#3b82f6";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const INDIGO = "#6366f1";

const W = 1280;
const H = 800;
const SIDEBAR_W = 240;
const HEADER_H = 64;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sidebar(activeLabel) {
  const items = [
    { label: "Dashboard", icon: "▣" },
    { label: "Field Register", icon: "⬡" },
    { label: "Crop Records", icon: "🌿" },
    { label: "Spray Records", icon: "💧" },
    { label: "Fertiliser Use", icon: "🧪" },
    { label: "Livestock", icon: "🐄" },
    { label: "Medicine Records", icon: "💊" },
    { label: "Movements", icon: "↔" },
    { label: "Financial Records", icon: "£" },
    { label: "Business Reports", icon: "📊" },
    { label: "Help Centre", icon: "?" },
  ];
  let html = `<rect x="0" y="0" width="${SIDEBAR_W}" height="${H}" fill="${GREEN_DARK}"/>`;
  // Logo area
  html += `<rect x="0" y="0" width="${SIDEBAR_W}" height="${HEADER_H}" fill="${GREEN_MID}"/>`;
  html += `<text x="20" y="38" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="${WHITE}">🌿 BDE Farm Trac</text>`;
  // Menu items
  items.forEach((item, i) => {
    const y = HEADER_H + 8 + i * 46;
    const isActive = item.label === activeLabel;
    if (isActive) {
      html += `<rect x="8" y="${y}" width="${SIDEBAR_W - 16}" height="38" rx="6" fill="${GREEN_LIGHT}" opacity="0.25"/>`;
      html += `<rect x="0" y="${y + 2}" width="4" height="34" fill="${GREEN_LIGHT}"/>`;
    }
    html += `<text x="20" y="${y + 24}" font-family="Arial,sans-serif" font-size="13" fill="${isActive ? WHITE : "#9ca3af"}">${esc(item.icon)}  ${esc(item.label)}</text>`;
  });
  // Farm indicator at bottom
  html += `<rect x="8" y="${H - 56}" width="${SIDEBAR_W - 16}" height="44" rx="6" fill="${GREEN_MID}" opacity="0.5"/>`;
  html += `<text x="20" y="${H - 28}" font-family="Arial,sans-serif" font-size="11" fill="#9ca3af">🏡 Home Farm</text>`;
  return html;
}

function header(title) {
  return `
    <rect x="${SIDEBAR_W}" y="0" width="${W - SIDEBAR_W}" height="${HEADER_H}" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${SIDEBAR_W + 24}" y="40" font-family="Arial,sans-serif" font-size="20" font-weight="bold" fill="${TEXT}">${esc(title)}</text>
    <rect x="${W - 160}" y="16" width="128" height="32" rx="6" fill="${GREEN_LIGHT}"/>
    <text x="${W - 96}" y="37" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="${WHITE}" text-anchor="middle">+ Add Record</text>
    <circle cx="${W - 28}" cy="32" r="18" fill="${GREEN_XL}"/>
    <text x="${W - 28}" y="38" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="${GREEN_MID}" text-anchor="middle">JD</text>
  `;
}

function statCard(x, y, w, h, label, value, sub, color) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${x + 16}" y="${y + 28}" font-family="Arial,sans-serif" font-size="12" fill="${MUTED}">${esc(label)}</text>
    <text x="${x + 16}" y="${y + 60}" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="${color || TEXT}">${esc(value)}</text>
    <text x="${x + 16}" y="${y + 82}" font-family="Arial,sans-serif" font-size="11" fill="${MUTED}">${esc(sub)}</text>
  `;
}

function tableHeader(x, y, w, cols) {
  let html = `<rect x="${x}" y="${y}" width="${w}" height="40" fill="${BG}" stroke="${BORDER}" stroke-width="1"/>`;
  let cx = x + 16;
  cols.forEach(({ label, width }) => {
    html += `<text x="${cx}" y="${y + 25}" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="${MUTED}">${esc(label)}</text>`;
    cx += width;
  });
  return html;
}

function tableRow(x, y, w, cols, values, rowIdx) {
  let html = `<rect x="${x}" y="${y}" width="${w}" height="44" fill="${rowIdx % 2 === 0 ? WHITE : BG}" stroke="${BORDER}" stroke-width="0.5"/>`;
  let cx = x + 16;
  cols.forEach(({ width }, i) => {
    const val = values[i] || "";
    if (val.type === "badge") {
      const bc = val.color || GREEN_LIGHT;
      const btc = val.textColor || GREEN_MID;
      html += `<rect x="${cx}" y="${y + 12}" width="${val.label.length * 7 + 12}" height="20" rx="10" fill="${bc}" opacity="0.2"/>`;
      html += `<text x="${cx + 6}" y="${y + 26}" font-family="Arial,sans-serif" font-size="11" fill="${btc}">${esc(val.label)}</text>`;
    } else {
      html += `<text x="${cx}" y="${y + 26}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">${esc(val)}</text>`;
    }
    cx += width;
  });
  return html;
}

function card(x, y, w, h, title, content) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${x + 16}" y="${y + 30}" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="${TEXT}">${esc(title)}</text>
    <line x1="${x}" y1="${y + 44}" x2="${x + w}" y2="${y + 44}" stroke="${BORDER}" stroke-width="1"/>
    ${content}
  `;
}

function wrap(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${body}
</svg>`;
}

const CX = SIDEBAR_W; // content x start
const CY = HEADER_H;  // content y start
const CW = W - SIDEBAR_W; // content width

// ─── 1. Dashboard Overview ────────────────────────────────────────────────────
const dashboardSVG = wrap(`
  ${sidebar("Dashboard")}
  ${header("Dashboard Overview")}
  <rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>

  <!-- Stat cards row -->
  ${statCard(CX + 16, CY + 16, 220, 96, "Fields Registered", "47", "4 added this season", GREEN_LIGHT)}
  ${statCard(CX + 252, CY + 16, 220, 96, "Spray Applications", "128", "12 this month", BLUE)}
  ${statCard(CX + 488, CY + 16, 220, 96, "Livestock Head", "342", "Cattle + Sheep", AMBER)}
  ${statCard(CX + 724, CY + 16, 220, 96, "Outstanding Tasks", "3", "Require attention", RED)}
  ${statCard(CX + 960, CY + 16, 260, 96, "Compliance Score", "94%", "Red Tractor Standard", GREEN_MID)}

  <!-- Recent activity card -->
  ${card(CX + 16, CY + 128, 620, 300, "Recent Activity", `
    <text x="${CX + 32}" y="${CY + 188}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}">Today</text>
    <circle cx="${CX + 48}" cy="${CY + 218}" r="5" fill="${GREEN_LIGHT}"/>
    <text x="${CX + 62}" y="${CY + 222}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">Spray application recorded — Field 4B (Rapeseed)</text>
    <circle cx="${CX + 48}" cy="${CY + 254}" r="5" fill="${BLUE}"/>
    <text x="${CX + 62}" y="${CY + 258}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">Medicine treatment: Cow #287 — Penicillin administered</text>
    <circle cx="${CX + 48}" cy="${CY + 290}" r="5" fill="${AMBER}"/>
    <text x="${CX + 62}" y="${CY + 294}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">Livestock movement recorded — 24 cattle to south pasture</text>
    <text x="${CX + 32}" y="${CY + 330}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}">Yesterday</text>
    <circle cx="${CX + 48}" cy="${CY + 358}" r="5" fill="${GREEN_LIGHT}"/>
    <text x="${CX + 62}" y="${CY + 362}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">NVZ calculation completed — Field 12A</text>
  `)}

  <!-- Compliance card -->
  ${card(CX + 652, CY + 128, 568, 300, "Red Tractor Compliance", `
    <text x="${CX + 668}" y="${CY + 196}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">Spray Records</text>
    <rect x="${CX + 800}" y="${CY + 180}" width="200" height="14" rx="7" fill="${BORDER}"/>
    <rect x="${CX + 800}" y="${CY + 180}" width="192" height="14" rx="7" fill="${GREEN_LIGHT}"/>
    <text x="${CX + 1008}" y="${CY + 192}" font-family="Arial,sans-serif" font-size="12" fill="${TEXT}">96%</text>

    <text x="${CX + 668}" y="${CY + 234}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">Medicine Records</text>
    <rect x="${CX + 800}" y="${CY + 218}" width="200" height="14" rx="7" fill="${BORDER}"/>
    <rect x="${CX + 800}" y="${CY + 218}" width="188" height="14" rx="7" fill="${GREEN_LIGHT}"/>
    <text x="${CX + 1008}" y="${CY + 230}" font-family="Arial,sans-serif" font-size="12" fill="${TEXT}">94%</text>

    <text x="${CX + 668}" y="${CY + 272}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">Movement Records</text>
    <rect x="${CX + 800}" y="${CY + 256}" width="200" height="14" rx="7" fill="${BORDER}"/>
    <rect x="${CX + 800}" y="${CY + 256}" width="178" height="14" rx="7" fill="${AMBER}"/>
    <text x="${CX + 1008}" y="${CY + 268}" font-family="Arial,sans-serif" font-size="12" fill="${TEXT}">89%</text>

    <text x="${CX + 668}" y="${CY + 310}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">Financial Records</text>
    <rect x="${CX + 800}" y="${CY + 294}" width="200" height="14" rx="7" fill="${BORDER}"/>
    <rect x="${CX + 800}" y="${CY + 294}" width="196" height="14" rx="7" fill="${GREEN_LIGHT}"/>
    <text x="${CX + 1008}" y="${CY + 306}" font-family="Arial,sans-serif" font-size="12" fill="${TEXT}">98%</text>
  `)}

  <!-- Quick links -->
  ${card(CX + 16, CY + 444, 1204, 72, "Quick Actions", `
    <rect x="${CX + 32}" y="${CY + 464}" width="160" height="36" rx="6" fill="${GREEN_XL}"/>
    <text x="${CX + 112}" y="${CY + 487}" font-family="Arial,sans-serif" font-size="13" fill="${GREEN_MID}" text-anchor="middle">+ Spray Record</text>
    <rect x="${CX + 208}" y="${CY + 464}" width="160" height="36" rx="6" fill="${GREEN_XL}"/>
    <text x="${CX + 288}" y="${CY + 487}" font-family="Arial,sans-serif" font-size="13" fill="${GREEN_MID}" text-anchor="middle">+ Medicine</text>
    <rect x="${CX + 384}" y="${CY + 464}" width="160" height="36" rx="6" fill="${GREEN_XL}"/>
    <text x="${CX + 464}" y="${CY + 487}" font-family="Arial,sans-serif" font-size="13" fill="${GREEN_MID}" text-anchor="middle">+ Movement</text>
    <rect x="${CX + 560}" y="${CY + 464}" width="160" height="36" rx="6" fill="${GREEN_XL}"/>
    <text x="${CX + 640}" y="${CY + 487}" font-family="Arial,sans-serif" font-size="13" fill="${GREEN_MID}" text-anchor="middle">+ Financial</text>
  `)}
`);

// ─── 2. Spray Records ─────────────────────────────────────────────────────────
const sprayCols = [
  { label: "DATE", width: 110 },
  { label: "FIELD", width: 140 },
  { label: "CROP", width: 130 },
  { label: "PRODUCT", width: 200 },
  { label: "TARGET", width: 150 },
  { label: "RATE (L/ha)", width: 100 },
  { label: "OPERATOR", width: 110 },
  { label: "STATUS", width: 100 },
];
const sprayRows = [
  ["12 Mar 2026", "Field 4B", "Winter Wheat", "Roundup ProActive", "Broadleaf weeds", "3.2", "J. Davies", {type:"badge",label:"Complete",color:GREEN_XL,textColor:GREEN_MID}],
  ["10 Mar 2026", "Field 7A", "Oilseed Rape", "Mavrik Aqua", "Pollen beetle", "0.15", "J. Davies", {type:"badge",label:"Complete",color:GREEN_XL,textColor:GREEN_MID}],
  ["08 Mar 2026", "Field 2C", "Winter Barley", "Bravo 500", "Septoria", "1.0", "M. Evans", {type:"badge",label:"Complete",color:GREEN_XL,textColor:GREEN_MID}],
  ["06 Mar 2026", "Field 11B", "Sugar Beet", "Betasana SC", "Blackfly", "1.5", "M. Evans", {type:"badge",label:"Pending",color:"#fef3c7",textColor:"#92400e"}],
  ["04 Mar 2026", "Field 6D", "Winter Wheat", "Opus Team", "Yellow rust", "0.5", "J. Davies", {type:"badge",label:"Complete",color:GREEN_XL,textColor:GREEN_MID}],
  ["01 Mar 2026", "Field 3A", "Oilseed Rape", "Kerb Flo", "Annual grasses", "2.5", "M. Evans", {type:"badge",label:"Complete",color:GREEN_XL,textColor:GREEN_MID}],
  ["26 Feb 2026", "Field 9C", "Winter Barley", "Headland Relay P", "Volunteers", "1.8", "J. Davies", {type:"badge",label:"Complete",color:GREEN_XL,textColor:GREEN_MID}],
  ["24 Feb 2026", "Field 1A", "Winter Wheat", "Tilt 250 EC", "Brown rust", "0.5", "M. Evans", {type:"badge",label:"Complete",color:GREEN_XL,textColor:GREEN_MID}],
];
let sprayBody = `<rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>`;
// Filter bar
sprayBody += `<rect x="${CX + 16}" y="${CY + 16}" width="280" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
sprayBody += `<text x="${CX + 36}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}">🔍  Search spray records...</text>`;
sprayBody += `<rect x="${CX + 312}" y="${CY + 16}" width="120" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
sprayBody += `<text x="${CX + 372}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}" text-anchor="middle">Filter ▾</text>`;

const tableX = CX + 16;
const tableY = CY + 68;
const tableW = CW - 32;
sprayBody += tableHeader(tableX, tableY, tableW, sprayCols);
sprayRows.forEach((row, i) => {
  sprayBody += tableRow(tableX, tableY + 40 + i * 44, tableW, sprayCols, row, i);
});

const sprayRecordsSVG = wrap(`
  ${sidebar("Spray Records")}
  ${header("Spray Application Records")}
  ${sprayBody}
`);

// ─── 3. Field Register ────────────────────────────────────────────────────────
const fieldCols = [
  { label: "FIELD NAME", width: 160 },
  { label: "AREA (ha)", width: 100 },
  { label: "SOIL TYPE", width: 130 },
  { label: "CURRENT CROP", width: 160 },
  { label: "NVZ?", width: 80 },
  { label: "LAST SPRAYED", width: 130 },
  { label: "STATUS", width: 120 },
  { label: "ACTIONS", width: 100 },
];
const fieldRows = [
  ["Field 1A – Home", "8.4", "Medium loam", "Winter Wheat", "Yes", "24 Feb 2026", {type:"badge",label:"Active",color:GREEN_XL,textColor:GREEN_MID}, "Edit"],
  ["Field 2C – North", "12.1", "Heavy clay", "Winter Barley", "No", "08 Mar 2026", {type:"badge",label:"Active",color:GREEN_XL,textColor:GREEN_MID}, "Edit"],
  ["Field 3A – East", "6.7", "Sandy loam", "Oilseed Rape", "No", "26 Feb 2026", {type:"badge",label:"Active",color:GREEN_XL,textColor:GREEN_MID}, "Edit"],
  ["Field 4B – West", "9.2", "Medium loam", "Winter Wheat", "Yes", "12 Mar 2026", {type:"badge",label:"Active",color:GREEN_XL,textColor:GREEN_MID}, "Edit"],
  ["Field 6D – South", "14.5", "Chalk", "Winter Wheat", "No", "04 Mar 2026", {type:"badge",label:"Active",color:GREEN_XL,textColor:GREEN_MID}, "Edit"],
  ["Field 7A – Ridge", "7.8", "Flint clay", "Oilseed Rape", "No", "10 Mar 2026", {type:"badge",label:"Active",color:GREEN_XL,textColor:GREEN_MID}, "Edit"],
  ["Field 9C – Marsh", "5.3", "Peaty", "Winter Barley", "Yes", "26 Feb 2026", {type:"badge",label:"Active",color:GREEN_XL,textColor:GREEN_MID}, "Edit"],
  ["Field 11B – Mill", "18.9", "Heavy clay", "Sugar Beet", "No", "06 Mar 2026", {type:"badge",label:"Fallow",color:"#fef3c7",textColor:"#92400e"}, "Edit"],
];
let fieldBody = `<rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>`;
fieldBody += `<rect x="${CX + 16}" y="${CY + 16}" width="280" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
fieldBody += `<text x="${CX + 36}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}">🔍  Search fields...</text>`;

const fieldTableX = CX + 16;
const fieldTableY = CY + 68;
const fieldTableW = CW - 32;
fieldBody += tableHeader(fieldTableX, fieldTableY, fieldTableW, fieldCols);
fieldRows.forEach((row, i) => {
  fieldBody += tableRow(fieldTableX, fieldTableY + 40 + i * 44, fieldTableW, fieldCols, row, i);
});

const fieldRegisterSVG = wrap(`
  ${sidebar("Field Register")}
  ${header("Field Register")}
  ${fieldBody}
`);

// ─── 4. Livestock Movements ───────────────────────────────────────────────────
const moveCols = [
  { label: "DATE", width: 110 },
  { label: "ANIMAL / GROUP", width: 180 },
  { label: "SPECIES", width: 110 },
  { label: "COUNT", width: 80 },
  { label: "FROM", width: 160 },
  { label: "TO", width: 160 },
  { label: "CPH", width: 120 },
  { label: "STATUS", width: 100 },
];
const moveRows = [
  ["15 Mar 2026", "Spring calvers batch", "Cattle", "24", "South Pasture", "Home Farm", "12/345/0001", {type:"badge",label:"Recorded",color:GREEN_XL,textColor:GREEN_MID}],
  ["12 Mar 2026", "Ewes & lambs flock 2", "Sheep", "68", "Home Farm", "Auction Market", "12/345/0001", {type:"badge",label:"Recorded",color:GREEN_XL,textColor:GREEN_MID}],
  ["10 Mar 2026", "Bull #47", "Cattle", "1", "Hired Farm", "Home Farm", "12/789/0044", {type:"badge",label:"Recorded",color:GREEN_XL,textColor:GREEN_MID}],
  ["08 Mar 2026", "Heifers group C", "Cattle", "12", "Home Farm", "South Pasture", "12/345/0001", {type:"badge",label:"Recorded",color:GREEN_XL,textColor:GREEN_MID}],
  ["05 Mar 2026", "Weaned lambs lot 3", "Sheep", "45", "Home Farm", "Abattoir", "12/345/0001", {type:"badge",label:"Recorded",color:GREEN_XL,textColor:GREEN_MID}],
  ["03 Mar 2026", "Store cattle batch", "Cattle", "8", "Market", "Home Farm", "12/234/0099", {type:"badge",label:"Pending",color:"#fef3c7",textColor:"#92400e"}],
  ["01 Mar 2026", "Ram flock 1", "Sheep", "3", "Home Farm", "Hired Farm", "12/567/0032", {type:"badge",label:"Recorded",color:GREEN_XL,textColor:GREEN_MID}],
  ["28 Feb 2026", "Cull cows batch A", "Cattle", "6", "Home Farm", "Abattoir", "12/345/0001", {type:"badge",label:"Recorded",color:GREEN_XL,textColor:GREEN_MID}],
];
let moveBody = `<rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>`;
moveBody += `<rect x="${CX + 16}" y="${CY + 16}" width="280" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
moveBody += `<text x="${CX + 36}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}">🔍  Search movements...</text>`;
moveBody += `<rect x="${CX + 312}" y="${CY + 16}" width="160" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
moveBody += `<text x="${CX + 392}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}" text-anchor="middle">Species ▾</text>`;

const moveTableX = CX + 16;
const moveTableY = CY + 68;
const moveTableW = CW - 32;
moveBody += tableHeader(moveTableX, moveTableY, moveTableW, moveCols);
moveRows.forEach((row, i) => {
  moveBody += tableRow(moveTableX, moveTableY + 40 + i * 44, moveTableW, moveCols, row, i);
});

const livestockMovementsSVG = wrap(`
  ${sidebar("Movements")}
  ${header("Livestock Movements")}
  ${moveBody}
`);

// ─── 5. Financial Records ─────────────────────────────────────────────────────
const finCols = [
  { label: "DATE", width: 110 },
  { label: "DESCRIPTION", width: 220 },
  { label: "CATEGORY", width: 140 },
  { label: "SUPPLIER/CUSTOMER", width: 180 },
  { label: "TYPE", width: 100 },
  { label: "NET (£)", width: 100 },
  { label: "VAT (£)", width: 100 },
  { label: "TOTAL (£)", width: 110 },
];
const finRows = [
  ["12 Mar 2026", "Wheat sale — 42t @ £245/t", "Crop Sales", "Frontier Agriculture", {type:"badge",label:"Income",color:"#dcfce7",textColor:GREEN_MID}, "10,290", "0", "10,290"],
  ["10 Mar 2026", "Roundup ProActive 20L", "Agrochemicals", "Hutchinsons Ltd", {type:"badge",label:"Expense",color:"#fee2e2",textColor:"#991b1b"}, "148", "29.60", "177.60"],
  ["08 Mar 2026", "Contractor spreading", "Contracting", "Jones Agriculture", {type:"badge",label:"Expense",color:"#fee2e2",textColor:"#991b1b"}, "620", "124", "744"],
  ["06 Mar 2026", "BPS Payment — March", "Subsidies & Grants", "HMRC / RPA", {type:"badge",label:"Income",color:"#dcfce7",textColor:GREEN_MID}, "4,820", "0", "4,820"],
  ["04 Mar 2026", "Diesel fuel 2,000L", "Fuel & Lubricants", "Gleadell Ltd", {type:"badge",label:"Expense",color:"#fee2e2",textColor:"#991b1b"}, "1,760", "352", "2,112"],
  ["01 Mar 2026", "Vet call — cattle herd", "Veterinary", "Davies Vets", {type:"badge",label:"Expense",color:"#fee2e2",textColor:"#991b1b"}, "310", "62", "372"],
  ["26 Feb 2026", "Lamb sales — 45 head", "Livestock Sales", "Aberystwyth Market", {type:"badge",label:"Income",color:"#dcfce7",textColor:GREEN_MID}, "3,600", "0", "3,600"],
  ["24 Feb 2026", "Fertiliser 25t (AN34)", "Fertilisers", "CF Fertilisers UK", {type:"badge",label:"Expense",color:"#fee2e2",textColor:"#991b1b"}, "7,500", "1,500", "9,000"],
];
let finBody = `<rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>`;
// Summary cards
finBody += statCard(CX + 16, CY + 16, 240, 80, "Total Income (YTD)", "£84,620", "Current financial year", GREEN_LIGHT);
finBody += statCard(CX + 272, CY + 16, 240, 80, "Total Expenditure (YTD)", "£52,310", "Current financial year", RED);
finBody += statCard(CX + 528, CY + 16, 240, 80, "Net Profit (YTD)", "£32,310", "Before tax", GREEN_MID);
finBody += statCard(CX + 784, CY + 16, 200, 80, "VAT to Reclaim", "£4,820", "This quarter", BLUE);

finBody += `<rect x="${CX + 16}" y="${CY + 112}" width="280" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
finBody += `<text x="${CX + 36}" y="${CY + 135}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}">🔍  Search transactions...</text>`;

const finTableX = CX + 16;
const finTableY = CY + 164;
const finTableW = CW - 32;
finBody += tableHeader(finTableX, finTableY, finTableW, finCols);
finRows.forEach((row, i) => {
  finBody += tableRow(finTableX, finTableY + 40 + i * 44, finTableW, finCols, row, i);
});

const financialRecordsSVG = wrap(`
  ${sidebar("Financial Records")}
  ${header("Financial Records")}
  ${finBody}
`);

// ─── 6. Business Reports ──────────────────────────────────────────────────────
const tabW = 170;
const tabs = ["Compliance Summary", "Spray Overview", "Livestock Report", "Financial Summary", "Field Analysis", "Audit Trail", "Custom Report"];
let brBody = `<rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>`;
// Tab bar
tabs.forEach((t, i) => {
  const tx = CX + 16 + i * (tabW + 4);
  const isActive = i === 0;
  brBody += `<rect x="${tx}" y="${CY + 16}" width="${tabW}" height="36" rx="6" fill="${isActive ? GREEN_LIGHT : WHITE}" stroke="${isActive ? GREEN_LIGHT : BORDER}" stroke-width="1"/>`;
  brBody += `<text x="${tx + tabW/2}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="11" font-weight="${isActive ? "bold" : "normal"}" fill="${isActive ? WHITE : MUTED}" text-anchor="middle">${esc(t)}</text>`;
});

// Compliance summary content
brBody += `<rect x="${CX + 16}" y="${CY + 68}" width="${CW - 32}" height="${H - CY - 84}" rx="8" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
brBody += `<text x="${CX + 32}" y="${CY + 102}" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="${TEXT}">Red Tractor Compliance Summary</text>`;
brBody += `<text x="${CX + 32}" y="${CY + 124}" font-family="Arial,sans-serif" font-size="12" fill="${MUTED}">Report generated: 20 March 2026  ·  Period: 01 Jan 2026 – 20 Mar 2026</text>`;

// Compliance meters
const compItems = [
  { label: "Spray Application Records", pct: 96, color: GREEN_LIGHT },
  { label: "Pesticide Storage Records", pct: 100, color: GREEN_LIGHT },
  { label: "Medicine & Vet Records", pct: 94, color: GREEN_LIGHT },
  { label: "Livestock Movements (BCMS)", pct: 89, color: AMBER },
  { label: "NVZ Compliance", pct: 100, color: GREEN_LIGHT },
  { label: "Visitor & Biosecurity Log", pct: 78, color: RED },
  { label: "Financial Record Keeping", pct: 98, color: GREEN_LIGHT },
  { label: "Water Usage Records", pct: 92, color: GREEN_LIGHT },
];
compItems.forEach((item, i) => {
  const iy = CY + 148 + i * 60;
  brBody += `<text x="${CX + 32}" y="${iy + 20}" font-family="Arial,sans-serif" font-size="13" fill="${TEXT}">${esc(item.label)}</text>`;
  brBody += `<rect x="${CX + 32}" y="${iy + 28}" width="500" height="16" rx="8" fill="${BORDER}"/>`;
  brBody += `<rect x="${CX + 32}" y="${iy + 28}" width="${item.pct * 5}" height="16" rx="8" fill="${item.color}"/>`;
  brBody += `<text x="${CX + 544}" y="${iy + 42}" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="${TEXT}">${item.pct}%</text>`;
});

// Export button
brBody += `<rect x="${CX + CW - 172}" y="${CY + 80}" width="140" height="36" rx="6" fill="${GREEN_LIGHT}"/>`;
brBody += `<text x="${CX + CW - 102}" y="${CY + 103}" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="${WHITE}" text-anchor="middle">Export PDF ↓</text>`;

const businessReportsSVG = wrap(`
  ${sidebar("Business Reports")}
  ${header("Business Reports")}
  ${brBody}
`);

// ─── 7. Medicine Records ──────────────────────────────────────────────────────
const medCols = [
  { label: "DATE", width: 110 },
  { label: "ANIMAL / GROUP", width: 170 },
  { label: "MEDICINE", width: 200 },
  { label: "DOSE", width: 100 },
  { label: "ROUTE", width: 90 },
  { label: "BATCH No.", width: 120 },
  { label: "WITHDRAWAL", width: 130 },
  { label: "OPERATOR", width: 110 },
];
const medRows = [
  ["15 Mar 2026", "Cow #287", "Penicillin G 300mg/mL", "20mL", "IM", "BN2024-082", "07 Apr 2026", "J. Davies"],
  ["12 Mar 2026", "Ewes group 3 (x12)", "Closamectin Pour-On", "5mL/50kg", "Pour-on", "CL2024-119", "30 Mar 2026", "M. Evans"],
  ["10 Mar 2026", "Calf #301", "Metacam 20mg/mL", "2.5mL", "IV", "MC2024-203", "14 Mar 2026", "J. Davies"],
  ["08 Mar 2026", "Heifer #189", "Oxytetracycline LA", "10mL", "IM", "OX2024-441", "24 Apr 2026", "J. Davies"],
  ["05 Mar 2026", "Bull #47", "Dectomax Pour-On", "7mL/50kg", "Pour-on", "DC2024-087", "22 Mar 2026", "M. Evans"],
  ["03 Mar 2026", "Cattle group A (x8)", "Rispoval RS+PI3", "2mL", "IN", "RV2024-214", "03 Mar 2026", "J. Davies"],
  ["28 Feb 2026", "Sheep flock 1 (x45)", "Heptavac P Plus", "2mL", "SC", "HP2024-198", "28 Feb 2026", "M. Evans"],
  ["26 Feb 2026", "Cow #249", "Mastiplan LC", "1 tube", "IMM", "MA2024-076", "10 Mar 2026", "J. Davies"],
];
let medBody = `<rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>`;
medBody += `<rect x="${CX + 16}" y="${CY + 16}" width="280" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
medBody += `<text x="${CX + 36}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}">🔍  Search medicine records...</text>`;
medBody += `<rect x="${CX + 312}" y="${CY + 16}" width="180" height="36" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
medBody += `<text x="${CX + 402}" y="${CY + 39}" font-family="Arial,sans-serif" font-size="13" fill="${MUTED}" text-anchor="middle">Withdrawal Alerts ▾</text>`;

// Withdrawal alert banner
medBody += `<rect x="${CX + 16}" y="${CY + 64}" width="${CW - 32}" height="38" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>`;
medBody += `<text x="${CX + 36}" y="${CY + 88}" font-family="Arial,sans-serif" font-size="13" fill="#92400e">⚠️  2 animals have active withdrawal periods — check before slaughter</text>`;

const medTableX = CX + 16;
const medTableY = CY + 116;
const medTableW = CW - 32;
medBody += tableHeader(medTableX, medTableY, medTableW, medCols);
medRows.forEach((row, i) => {
  medBody += tableRow(medTableX, medTableY + 40 + i * 44, medTableW, medCols, row, i);
});

const medicineRecordsSVG = wrap(`
  ${sidebar("Medicine Records")}
  ${header("Medicine Records")}
  ${medBody}
`);

// ─── 8. Help Centre ────────────────────────────────────────────────────────────
let helpBody = `<rect x="${CX}" y="${CY}" width="${CW}" height="${H - CY}" fill="${BG}"/>`;
// Search
helpBody += `<rect x="${CX + 16}" y="${CY + 16}" width="${CW - 32}" height="50" rx="8" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
helpBody += `<text x="${CX + 44}" y="${CY + 47}" font-family="Arial,sans-serif" font-size="15" fill="${MUTED}">🔍  Search help articles...</text>`;

// Categories
const cats = [
  { label: "Getting Started", count: 4, color: GREEN_LIGHT },
  { label: "Spray Records", count: 5, color: BLUE },
  { label: "Livestock", count: 6, color: AMBER },
  { label: "Financial", count: 3, color: INDIGO },
  { label: "Compliance", count: 5, color: RED },
  { label: "Reports", count: 3, color: GREEN_MID },
];
helpBody += `<text x="${CX + 32}" y="${CY + 98}" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="${TEXT}">Browse by Category</text>`;
cats.forEach((cat, i) => {
  const catX = CX + 16 + (i % 3) * 330;
  const catY = CY + 112 + Math.floor(i / 3) * 80;
  helpBody += `<rect x="${catX}" y="${catY}" width="314" height="60" rx="8" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
  helpBody += `<rect x="${catX}" y="${catY}" width="8" height="60" rx="4" fill="${cat.color}"/>`;
  helpBody += `<text x="${catX + 24}" y="${catY + 25}" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="${TEXT}">${esc(cat.label)}</text>`;
  helpBody += `<text x="${catX + 24}" y="${catY + 45}" font-family="Arial,sans-serif" font-size="12" fill="${MUTED}">${cat.count} articles</text>`;
});

// Recent articles
helpBody += `<text x="${CX + 32}" y="${CY + 278}" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="${TEXT}">Popular Articles</text>`;
const arts = [
  "How to record a spray application",
  "Setting up your field register",
  "Recording livestock movements (BCMS)",
  "Understanding Red Tractor compliance scores",
  "How to generate a compliance PDF report",
  "Recording veterinary medicine treatments",
];
arts.forEach((art, i) => {
  const artY = CY + 296 + i * 60;
  helpBody += `<rect x="${CX + 16}" y="${artY}" width="${CW - 32}" height="50" rx="6" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
  helpBody += `<text x="${CX + 36}" y="${artY + 30}" font-family="Arial,sans-serif" font-size="14" fill="${BLUE}">${esc(art)}</text>`;
  helpBody += `<text x="${CX + CW - 50}" y="${artY + 30}" font-family="Arial,sans-serif" font-size="14" fill="${MUTED}" text-anchor="middle">›</text>`;
});

const helpCentreSVG = wrap(`
  ${sidebar("Help Centre")}
  ${header("Help Centre")}
  ${helpBody}
`);

// ─── Write & Convert ──────────────────────────────────────────────────────────
const images = [
  { name: "dashboard-overview", svg: dashboardSVG },
  { name: "spray-records",      svg: sprayRecordsSVG },
  { name: "field-register",     svg: fieldRegisterSVG },
  { name: "livestock-movements",svg: livestockMovementsSVG },
  { name: "financial-records",  svg: financialRecordsSVG },
  { name: "business-reports",   svg: businessReportsSVG },
  { name: "medicine-records",   svg: medicineRecordsSVG },
  { name: "help-centre",        svg: helpCentreSVG },
];

for (const { name, svg } of images) {
  const svgPath = path.join(OUT, `${name}.svg`);
  const pngPath = path.join(OUT, `${name}.png`);
  writeFileSync(svgPath, svg);
  try {
    execSync(`${RSVG} -f png -w 1280 -h 800 "${svgPath}" -o "${pngPath}"`, { stdio: "pipe" });
    console.log(`✓ ${name}.png (${pngPath})`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
  }
}
console.log("All done.");
