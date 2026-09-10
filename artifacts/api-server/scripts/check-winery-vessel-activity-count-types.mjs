import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const routes = fs.readFileSync(
  path.join(root, "artifacts/api-server/src/routes/farms.ts"),
  "utf8",
);

const routeStart = routes.indexOf('router.get("/farms/:farmId/winery-vessels"');
const routeEnd = routes.indexOf('router.post("/farms/:farmId/winery-vessels"', routeStart);

if (routeStart < 0 || routeEnd < 0) {
  console.error("Winery vessel activity count type guard failed: vessel list route was not found.");
  process.exit(1);
}

const vesselListRoute = routes.slice(routeStart, routeEnd);
const activityCounts = [
  "maintenance_count",
  "fill_count",
  "movement_count",
  "clean_count",
];

const failures = activityCounts.filter(countAlias => {
  const countProjection = new RegExp(
    `\\(SELECT\\s+COUNT\\(\\*\\)::int\\s+FROM\\s+[^)]*\\)\\s+AS\\s+${countAlias}\\b`,
    "i",
  );
  return !countProjection.test(vesselListRoute);
});

if (failures.length > 0) {
  console.error(
    `Winery vessel activity count type guard failed: these fields are not projected as PostgreSQL int values:\n- ${failures.join("\n- ")}`,
  );
  process.exit(1);
}

console.log(
  `Winery vessel activity count type guard passed (${activityCounts.length} numeric count fields).`,
);