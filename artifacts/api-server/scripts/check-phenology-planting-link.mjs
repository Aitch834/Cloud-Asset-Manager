#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const routePath = path.resolve(here, "../src/routes/viticulture.ts");
const source = fs.readFileSync(routePath, "utf8");

const start = source.indexOf('router.put("/farms/:farmId/vineyard-phenology/:id"');
const end = source.indexOf('router.delete("/farms/:farmId/vineyard-phenology/:id"', start);
const route = start >= 0 && end > start ? source.slice(start, end) : "";

const checks = [
  ["phenology update route is present", route.length > 0],
  ["block updates are detected even when blockId is null", route.includes('if ("blockId" in body)')],
  ["changed blocks resolve the farm's active planting", route.includes("eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId))")
    && route.includes("eq(vineyardBlockPlantingsTable.farmId, farmId)")
    && route.includes('eq(vineyardBlockPlantingsTable.status, "active")')
    && route.includes("body.plantingId = active ? active.id : null")],
  ["unlinked blocks clear the old planting", /else\s*\{[\s\S]*?body\.plantingId = null;[\s\S]*?\}/.test(route)],
  ["the reconciled body is written", route.includes(".set(body)")],
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Phenology planting-link guard failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Phenology planting-link guard passed (${checks.length} checks).`);