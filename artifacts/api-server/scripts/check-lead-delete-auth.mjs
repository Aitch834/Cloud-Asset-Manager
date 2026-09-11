import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/routes/admin.ts", import.meta.url),
  "utf8",
);

const routeMatch = source.match(
  /router\.delete\("\/admin\/leads\/:id",([\s\S]*?)\n}\);/,
);

assert.ok(routeMatch, "DELETE /admin/leads/:id route is missing");

const route = routeMatch[0];
assert.match(
  route,
  /router\.delete\("\/admin\/leads\/:id",\s*requireAuth,/,
  "Lead deletion must reject unauthenticated requests with requireAuth",
);
assert.match(
  route,
  /if\s*\(!\(await checkPlatformAdmin\(req,\s*res\)\)\)\s*return;/,
  "Lead deletion must reject authenticated non-admin requests",
);

const authPosition = route.indexOf("requireAuth");
const adminPosition = route.indexOf("checkPlatformAdmin");
const deletePosition = route.indexOf(".delete(leadsTable)");

assert.ok(
  authPosition < adminPosition && adminPosition < deletePosition,
  "Lead deletion authorization checks must run before the database delete",
);

console.log("Lead deletion authentication and admin authorization guard passed.");