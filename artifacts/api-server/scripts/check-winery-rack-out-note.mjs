import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

const schema = read("lib/db/src/schema/viticulture.ts");
const migrations = read("artifacts/api-server/src/lib/wineryMigrations.ts");
const routes = read("artifacts/api-server/src/routes/farms.ts");
const dashboard = read("artifacts/dashboard/src/pages/winery/VesselRegisterTab.tsx");
const mobile = read("artifacts/mobile/app/winery-vessel-detail.tsx");

const checks = [
  ["database schema exposes rack_out_note", schema.includes('rackOutNote: text("rack_out_note")')],
  ["startup migration creates rack_out_note", migrations.includes("ADD COLUMN IF NOT EXISTS rack_out_note TEXT")],
  ["fill create writes rack_out_note", routes.includes("rack_out_date, rack_out_note, batch_ref")],
  ["fill update preserves omitted rack-out notes", routes.includes("rack_out_note=COALESCE(${n(b.rackOutNote)}, rack_out_note)")],
  ["dashboard renders the dedicated field", dashboard.includes("f.rack_out_note") && dashboard.includes("Rack-out reason:")],
  ["dashboard sends rackOutNote separately", dashboard.includes("rackOutNote:   note.trim()")],
  ["mobile models and renders the dedicated field", mobile.includes("rack_out_note: string | null") && mobile.includes("fill.rack_out_note")],
  ["mobile edit and rack-out writes preserve the field", (mobile.match(/rackOutNote: (record|fill)\.rack_out_note/g) ?? []).length === 2],
  ["internal marker protocol is absent", ![schema, migrations, routes, dashboard, mobile].some(source => source.includes("[[rack-out-note]]"))],
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Rack-out note guard failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Rack-out note guard passed (${checks.length} checks).`);