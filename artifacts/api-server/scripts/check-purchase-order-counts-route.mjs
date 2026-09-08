import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

const routes = read("artifacts/api-server/src/routes/farms.ts");
const dashboard = read("artifacts/dashboard/src/pages/Dashboard.tsx");

const countsRoute = 'router.get("/farms/:farmId/purchase-orders/counts"';
const dynamicRoute = 'router.get("/farms/:farmId/purchase-orders/:poId"';
const countsRouteIndex = routes.indexOf(countsRoute);
const dynamicRouteIndex = routes.indexOf(dynamicRoute);

const checks = [
  ["purchase-order counts route exists exactly once", countsRouteIndex >= 0 && routes.indexOf(countsRoute, countsRouteIndex + 1) === -1],
  ["counts route is registered before the dynamic purchase-order route", countsRouteIndex < dynamicRouteIndex],
  ["counts route returns the badge response contract", routes.slice(countsRouteIndex, dynamicRouteIndex).includes("res.json({ counts, outstanding })")],
  ["dashboard requests the static counts endpoint", dashboard.includes("`/api/farms/${farmId}/purchase-orders/counts`")],
  ["dashboard reads submitted counts for the approval badge", dashboard.includes("poCounts?.counts?.submitted ?? 0")],
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Purchase-order counts route guard failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Purchase-order counts route guard passed (${checks.length} checks).`);
