/**
 * LIS CLA End-to-End Test Script — Sheep & Goats
 * Covers all untested scenarios from the LIS movement test plan.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server exec tsx src/test-lis-scenarios.ts
 *
 * Uses real sandbox API via UK proxy — ensure proxy is running and
 * LIS_PROXY_URL / LIS_SUBSCRIPTION_KEY / LIS_B2C_CLIENT_ID are set.
 */

import { eq } from "drizzle-orm";
import { db, lisFarmTokensTable, farmsTable } from "@workspace/db";
import {
  submitLisMovement,
  submitLisBirth,
  submitLisDeath,
  refreshLisToken,
  callLisApi,
  isLisSandboxMode,
  type LisResult,
} from "./lib/lis.js";

// ─── ANSI colours for test output ──────────────────────────────────────────
const GREEN = "\x1b[32m";
const RED   = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN  = "\x1b[36m";
const RESET = "\x1b[0m";

const PASS = `${GREEN}✅ PASS${RESET}`;
const FAIL = `${RED}❌ FAIL${RESET}`;
const WARN = `${YELLOW}⚠️  WARN${RESET}`;

// ─── Sandbox test data (from LIS provisioned accounts) ─────────────────────
const CPH1 = "01/100/0257";  // User 1 — source farm
const CPH2 = "01/100/0264";  // User 2 — dest farm

// Sheep tags (herd 130182) — using 100 range to avoid conflicts with prior tests
const SHEEP_TAGS_ABATTOIR = ["UK013018200001", "UK013018200002"];
// Goat tags (herd 130183) — for assembly centre test
const GOAT_TAGS_ASSEMBLY  = ["UK013018300001", "UK013018300002", "UK013018300003"];
// Sheep tag for wrong-species test
const SHEEP_TAG_WRONG_SPECIES = "UK013018100006";
// Sheep tag for duplicate test (use one we'll submit twice)
const SHEEP_TAG_DUPLICATE = "UK013018100007";
// Birth: new lamb that needs registration
const SHEEP_TAG_BIRTH = "UK013018100020";
// Death: animal to record as dead
const SHEEP_TAG_DEATH = "UK013018100019";
// Abattoir CPH (from LIS test plan — User 1's abattoir)
const ABATTOIR_CPH = "01/100/0253";
// Assembly centre CPH (from LIS test plan)
const ASSEMBLY_CPH = "01/100/0254";

const TODAY = new Date().toISOString().slice(0, 10);

// ─── Result tracker ─────────────────────────────────────────────────────────
let passed = 0; let failed = 0; let warned = 0;

function logResult(scenario: string, result: LisResult, expectSuccess: boolean, notes?: string) {
  const statusIcon = result.success === expectSuccess ? PASS : FAIL;
  const label = `${CYAN}[${scenario}]${RESET}`;
  if (result.success === expectSuccess) { passed++; } else { failed++; }
  console.log(`\n${label} ${statusIcon}`);
  if (result.sandbox) console.log(`  ${YELLOW}(sandbox simulation — no real API call)${RESET}`);
  if (result.success) console.log(`  Reference: ${GREEN}${result.reference}${RESET}`);
  if (result.errorMessage) console.log(`  Error: ${RED}${result.errorMessage}${RESET}`);
  if (!result.success && result.responsePayload) {
    try {
      const parsed = JSON.parse(result.responsePayload);
      console.log(`  Raw LIS response: ${JSON.stringify(parsed, null, 2).split("\n").slice(0, 20).join("\n")}`);
    } catch {
      console.log(`  Raw LIS response: ${result.responsePayload.slice(0, 400)}`);
    }
  }
  if (notes) console.log(`  ${YELLOW}Note: ${notes}${RESET}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  LIS CLA End-to-End Test Suite — ${TODAY}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Sandbox mode: ${isLisSandboxMode() ? `${YELLOW}YES (no real API calls)${RESET}` : `${GREEN}NO (hitting LIS sandbox API)${RESET}`}`);
  console.log(`  LIS_PROXY_URL: ${process.env.LIS_PROXY_URL ?? RED + "NOT SET" + RESET}`);

  // ── Step 1: Get LIS token from DB and refresh if needed ──────────────────
  console.log(`\n${CYAN}── Step 1: Token refresh ──────────────────────────────${RESET}`);

  const allTokenRows = await db.select().from(lisFarmTokensTable).where(eq(lisFarmTokensTable.isConfigured, true));
  if (allTokenRows.length === 0) {
    console.log(`${RED}No LIS credentials found in DB. Cannot run live tests.${RESET}`);
    console.log(`Please set up LIS credentials in Farm Settings → LIS tab first.`);
    process.exit(1);
  }

  console.log(`Found ${allTokenRows.length} farm(s) with LIS configured.`);

  // Pick the farm whose token expired MOST RECENTLY (smallest gap = most likely
  // refresh token still within the B2C 14-day sliding window).
  const sorted = [...allTokenRows].sort((a, b) => {
    const aExp = a.tokenExpiresAt ? new Date(a.tokenExpiresAt).getTime() : 0;
    const bExp = b.tokenExpiresAt ? new Date(b.tokenExpiresAt).getTime() : 0;
    return bExp - aExp; // descending — most recently expired first
  });
  let tokenRow = sorted.find(r => r.refreshToken) ?? sorted[0];
  let accessToken: string | undefined = tokenRow.accessToken ?? undefined;

  const tokenAge = tokenRow.tokenExpiresAt
    ? Math.round((Date.now() - new Date(tokenRow.tokenExpiresAt).getTime()) / 86400000)
    : null;
  const tokenExpired = !accessToken || (tokenRow.tokenExpiresAt && new Date(tokenRow.tokenExpiresAt) < new Date());

  console.log(`Using farm: ${tokenRow.farmId} (username: ${tokenRow.lisUsername ?? "OAuth-only"})`);
  console.log(`Token status: ${tokenExpired ? RED + "EXPIRED" : GREEN + "valid"}${RESET} (${tokenAge !== null ? `${Math.abs(tokenAge)}d ${tokenAge > 0 ? "past" : "until"} expiry` : "unknown age"})`);

  if ((tokenExpired || !accessToken) && tokenRow.refreshToken && !isLisSandboxMode()) {
    console.log(`Attempting token refresh...`);
    const refresh = await refreshLisToken(tokenRow.refreshToken);
    if (refresh.success && refresh.accessToken) {
      accessToken = refresh.accessToken;
      await db.update(lisFarmTokensTable).set({
        accessToken,
        refreshToken: refresh.refreshToken ?? undefined,
        tokenExpiresAt: refresh.expiresIn ? new Date(Date.now() + refresh.expiresIn * 1000) : undefined,
        updatedAt: new Date(),
      }).where(eq(lisFarmTokensTable.farmId, tokenRow.farmId));
      console.log(`${GREEN}Token refreshed successfully.${RESET} (expires in ${refresh.expiresIn}s, prefix: ${accessToken.slice(0, 30)}...)`);
    } else {
      console.log(`${RED}Token refresh failed: ${refresh.errorMessage}${RESET}`);
      console.log(`${YELLOW}You will need to re-authenticate via Farm Settings → LIS → Sign in with LIS.${RESET}`);
      accessToken = undefined;
    }
  }

  if (!accessToken && !isLisSandboxMode()) {
    console.log(`\n${YELLOW}No valid access token available. Tests will be skipped.${RESET}`);
    console.log(`Re-authenticate via the dashboard and re-run this script.`);
    process.exit(2);
  }

  const token = accessToken ?? "";

  // ── Step 2: Verify proxy is reachable ────────────────────────────────────
  console.log(`\n${CYAN}── Step 2: Proxy connectivity check ──────────────────${RESET}`);
  if (!isLisSandboxMode()) {
    const proxyTest = await callLisApi(token, "/TransferRequests?$top=1");
    if (proxyTest.ok || proxyTest.status === 200) {
      console.log(`${GREEN}✓ Proxy reachable — LIS API responding${RESET}`);
    } else if (proxyTest.status === 0) {
      console.log(`${RED}✗ Proxy unreachable: ${proxyTest.raw}${RESET}`);
      console.log(`Ensure the VPS proxy is running (pm2 status on DigitalOcean London VPS).`);
      process.exit(3);
    } else {
      console.log(`${YELLOW}⚠ Proxy responded HTTP ${proxyTest.status} — continuing (may still work for writes)${RESET}`);
    }
  } else {
    console.log(`${YELLOW}(skipped — sandbox simulation mode)${RESET}`);
  }

  // ── T3.2: Abattoir movement (Sheep OFF → Abattoir) ───────────────────────
  console.log(`\n${CYAN}── T3.2: Sheep OFF → Abattoir (${ABATTOIR_CPH}) ──────${RESET}`);
  const t32 = await submitLisMovement({
    lisUsername: tokenRow.lisUsername ?? "",
    lisPassword: "",
    accessToken: token,
    movementType: "movement_off",
    movementDate: TODAY,
    species: "SHEEP",
    numberOfAnimals: SHEEP_TAGS_ABATTOIR.length,
    departureCph: CPH1,
    destinationCph: ABATTOIR_CPH,
    earTagNumbers: SHEEP_TAGS_ABATTOIR.join(","),
    fromLocation: CPH1,
    toLocation: ABATTOIR_CPH,
    // Test account (testcphholder1) owns BOTH CPH1 and the abattoir CPH.
    // LIS error 21165 requires userHolding = destination when user owns both.
    // In production a farmer won't own the abattoir, so no override is needed.
    userHoldingOverride: ABATTOIR_CPH,
  });
  logResult("T3.2 Abattoir", t32, true, t32.success ? undefined : "Abattoir CPH may not be registered in sandbox");

  // ── T3.3: Assembly centre movement (Goat OFF → Assembly Centre) ──────────
  console.log(`\n${CYAN}── T3.3: Goat OFF → Assembly Centre (${ASSEMBLY_CPH}) ─${RESET}`);
  const t33 = await submitLisMovement({
    lisUsername: tokenRow.lisUsername ?? "",
    lisPassword: "",
    accessToken: token,
    movementType: "movement_off",
    movementDate: TODAY,
    species: "GOAT",
    numberOfAnimals: GOAT_TAGS_ASSEMBLY.length,
    departureCph: CPH1,
    destinationCph: ASSEMBLY_CPH,
    earTagNumbers: GOAT_TAGS_ASSEMBLY.join(","),
    fromLocation: CPH1,
    toLocation: ASSEMBLY_CPH,
    // Same testcphholder1 issue — user owns both CPHs; LIS 21165 requires destination.
    userHoldingOverride: ASSEMBLY_CPH,
  });
  logResult("T3.3 Assembly centre", t33, true, t33.success ? undefined : "Assembly centre CPH may not be registered in sandbox");

  // ── T5.1: Wrong species on tag (Sheep tag submitted as Goat) ──────────────
  console.log(`\n${CYAN}── T5.1: Wrong species on tag (expect LIS validation error) ─${RESET}`);
  const t51 = await submitLisMovement({
    lisUsername: tokenRow.lisUsername ?? "",
    lisPassword: "",
    accessToken: token,
    movementType: "movement_off",
    movementDate: TODAY,
    species: "GOAT",         // Wrong — this is a sheep tag
    numberOfAnimals: 1,
    departureCph: CPH1,
    destinationCph: CPH2,
    earTagNumbers: SHEEP_TAG_WRONG_SPECIES,
    fromLocation: CPH1,
    toLocation: CPH2,
  });
  // We EXPECT this to fail (LIS should return a validation error)
  const t51Pass = !t51.success;
  const t51Icon = t51Pass ? PASS : WARN;
  if (t51Pass) { passed++; } else { warned++; }
  console.log(`\n${CYAN}[T5.1 Wrong species]${RESET} ${t51Icon}`);
  if (t51.success) {
    console.log(`  ${YELLOW}LIS ACCEPTED the wrong-species tag — may not validate species in sandbox${RESET}`);
    console.log(`  Reference: ${t51.reference}`);
  } else {
    console.log(`  ${GREEN}LIS correctly rejected wrong-species submission${RESET}`);
    console.log(`  Error message: ${t51.errorMessage}`);
  }

  // ── T5.2: Duplicate submission (submit same movement twice) ───────────────
  console.log(`\n${CYAN}── T5.2: Duplicate submission (submit same tags twice) ─${RESET}`);
  const dupPayload = {
    lisUsername: tokenRow.lisUsername ?? "",
    lisPassword: "",
    accessToken: token,
    movementType: "movement_off" as const,
    movementDate: TODAY,
    species: "SHEEP" as const,
    numberOfAnimals: 1,
    departureCph: CPH1,
    destinationCph: CPH2,
    earTagNumbers: SHEEP_TAG_DUPLICATE,
    fromLocation: CPH1,
    toLocation: CPH2,
  };
  const dup1 = await submitLisMovement(dupPayload);
  console.log(`  First attempt: ${dup1.success ? GREEN + "201 Created ref=" + dup1.reference : RED + "Failed: " + dup1.errorMessage}${RESET}`);
  const dup2 = await submitLisMovement(dupPayload);
  // Second attempt should either fail or return a different reference
  const t52Pass = !dup2.success || (dup2.reference !== dup1.reference);
  const t52Icon = t52Pass ? PASS : WARN;
  if (t52Pass) { passed++; } else { warned++; }
  console.log(`  Second attempt: ${dup2.success ? GREEN + "ref=" + dup2.reference : RED + dup2.errorMessage}${RESET}`);
  console.log(`\n${CYAN}[T5.2 Duplicate]${RESET} ${t52Icon}`);
  if (!t52Pass) console.log(`  ${YELLOW}LIS accepted both duplicate submissions${RESET}`);

  // ── T5.3: Proxy failure recovery (error handling code-path) ───────────────
  console.log(`\n${CYAN}── T5.3: Proxy failure (no LIS_PROXY_URL configured) ──${RESET}`);
  const savedProxy = process.env.LIS_PROXY_URL;
  delete process.env.LIS_PROXY_URL;
  const t53 = await submitLisMovement({
    lisUsername: "", lisPassword: "", accessToken: "dummy-token",
    movementType: "movement_off", movementDate: TODAY,
    species: "SHEEP", numberOfAnimals: 1,
    departureCph: CPH1, destinationCph: CPH2,
    earTagNumbers: "UK013018100001",
    fromLocation: CPH1, toLocation: CPH2,
  });
  process.env.LIS_PROXY_URL = savedProxy;
  const t53Pass = !t53.success && !!t53.errorMessage;
  const t53Icon = t53Pass ? PASS : FAIL;
  if (t53Pass) { passed++; } else { failed++; }
  console.log(`\n${CYAN}[T5.3 Proxy failure]${RESET} ${t53Icon}`);
  console.log(`  Error message returned: "${t53.errorMessage}"`);
  console.log(`  success=false: ${!t53.success ? GREEN + "✓" : RED + "✗"}${RESET}`);

  // ── Births: Register a new sheep birth ────────────────────────────────────
  // NOTE: LIS ext-cla sandbox returns 404 for /animals — the Animals REST API is not
  // available at the same API gateway as the OData TransferRequests API in sandbox.
  // A 404 from the API gateway (not a validation error) means the route doesn't exist.
  // This is a sandbox environment limitation; birth/death flows must be tested on production
  // credentials or via LIS support enabling the Animals API in ext-cla.
  // We still exercise the code path but treat 404 as an expected sandbox limitation (warn).
  console.log(`\n${CYAN}── Birth registration: POST /animals ──────────────────${RESET}`);
  const birthResult = await submitLisBirth({
    accessToken: token,
    holdingCph: CPH1,
    birthDate: TODAY,
    species: "SHEEP",
    earTag: SHEEP_TAG_BIRTH,
    sex: "female",
  });
  const birthIs404 = birthResult.responsePayload?.includes('"statusCode":404') || birthResult.responsePayload?.includes('"statusCode": 404');
  if (birthIs404) {
    warned++;
    console.log(`\n${CYAN}[Birth (Sheep)]${RESET} ${YELLOW}⚠️  WARN${RESET}`);
    console.log(`  ${YELLOW}Animals API returns 404 in ext-cla sandbox — route not enabled.${RESET}`);
    console.log(`  ${YELLOW}Code path exercised; test against production or ask LIS to enable /animals in sandbox.${RESET}`);
  } else {
    logResult("Birth (Sheep)", birthResult, true, birthResult.success ? undefined : "Unexpected error — check raw response above");
  }

  // ── Deaths: Record a sheep death ──────────────────────────────────────────
  console.log(`\n${CYAN}── Death registration: PUT /animals/{identifier} ──────${RESET}`);
  const deathResult = await submitLisDeath({
    accessToken: token,
    holdingCph: CPH1,
    deathDate: TODAY,
    species: "SHEEP",
    earTag: SHEEP_TAG_DEATH,
    sex: "female",
  });
  const deathIs404 = deathResult.responsePayload?.includes('"statusCode":404') || deathResult.responsePayload?.includes('"statusCode": 404');
  if (deathIs404) {
    warned++;
    console.log(`\n${CYAN}[Death (Sheep)]${RESET} ${YELLOW}⚠️  WARN${RESET}`);
    console.log(`  ${YELLOW}Animals API returns 404 in ext-cla sandbox — route not enabled.${RESET}`);
    console.log(`  ${YELLOW}Code path exercised; test against production or ask LIS to enable /animals in sandbox.${RESET}`);
  } else {
    logResult("Death (Sheep)", deathResult, true, deathResult.success ? undefined : "Unexpected error — check raw response above");
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  TEST SUMMARY`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  ${GREEN}Passed: ${passed}${RESET}`);
  console.log(`  ${YELLOW}Warnings (expected/acceptable): ${warned}${RESET}`);
  console.log(`  ${RED}Failed: ${failed}${RESET}`);
  console.log(`${"=".repeat(60)}\n`);

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(`\n${RED}Test script error: ${err?.message ?? err}${RESET}`);
  process.exit(1);
});
