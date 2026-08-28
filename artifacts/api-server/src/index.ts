import app from "./app";
import { seedDefaults } from "./lib/seedDefaults";
import { seedLookupDefaults } from "./lib/seedLookups";
import { startAlertingJob } from "./lib/alertingJob";
import { startTimesheetReminderJob } from "./lib/timesheetReminderJob";
import { runPlannerMigrations } from "./lib/plannerMigrations";
import { runResourceMigrations } from "./lib/resourceMigrations";
import { runDairySuppliesMigrations } from "./lib/dairySuppliesMigrations";
import { runGpsMigrations } from "./lib/gpsMigrations";
import { startGpsPollingJob } from "./lib/gpsPollingJob";
import { runSensorMigrations } from "./lib/sensorMigrations";
import { startSensorPollingJob } from "./lib/sensorPollingJob";
import { runStrawMigrations } from "./lib/strawMigrations";
import { runPoultryMigrations } from "./lib/poultryMigrations";
import { runDataApiMigrations } from "./lib/dataApiMigrations";
import { runReportBuilderMigrations } from "./lib/reportBuilderMigrations";
import { runAnalyticsMigrations } from "./lib/analyticsMigrations";
import { runWineryMigrations } from "./lib/wineryMigrations";
import { runFarmIncidentsMigrations } from "./lib/farmIncidentsMigrations";
import { runTaskLinkMigrations } from "./lib/taskLinkMigrations";
import { runWoodlandRegenMigrations } from "./lib/woodlandRegenMigrations";
import { runPestTrapMigrations } from "./lib/pestTrapMigrations";
import { runSoilAnalysisMigrations } from "./lib/soilAnalysisMigrations";
import { runAgriEnvMigrations } from "./lib/agriEnvMigrations";
import { runAhwrMigrations } from "./lib/ahwrMigrations";
import { runUserUiPrefsMigrations } from "./lib/userUiPrefsMigrations";
import { runWinegbSubmissionsMigrations } from "./lib/winegbSubmissionsMigrations";
import { runFarmCoreMigrations } from "./lib/farmCoreMigrations";
import { runPigInventoryDeathMigrations } from "./lib/pigInventoryDeathMigrations";
import { runViticultureMigrations } from "./lib/viticultureMigrations";
import { runSectorAlertMigrations } from "./lib/sectorAlertMigrations";
import { runHelpArticleMigrations } from "./lib/helpArticleMigrations";
import { runFpInputMigrations } from "./lib/fpInputMigrations";
import { runAhdbMigrations } from "./lib/ahdbMigrations";
import { runTradeBodiesMigrations } from "./lib/tradeBodiesMigrations";
import { runLeadsMigrations } from "./lib/leadsMigrations";
import { seedViticultureDemo } from "./lib/seedViticultureDemo";

interface EnvSpec {
  key: string;
  description: string;
  required: boolean;
}

const ENV_SPEC: EnvSpec[] = [
  { key: "PORT",                   description: "HTTP port the server listens on",                required: true  },
  { key: "DATABASE_URL",           description: "PostgreSQL connection string",                   required: true  },
  { key: "CLERK_SECRET_KEY",       description: "Clerk secret key — authentication",             required: true  },
  { key: "STRIPE_SECRET_KEY",      description: "Stripe API secret key — enables billing",        required: false },
  { key: "STRIPE_WEBHOOK_SECRET",  description: "Stripe webhook signing secret",                  required: false },
  { key: "DEV_BYPASS_TOKEN",       description: "Dev-only token that bypasses auth (test mode)",  required: false },
  { key: "ADMIN_PORTAL_SECRET",    description: "Admin portal master secret — enables portal",    required: false },
  { key: "SMTP_HOST",              description: "SMTP relay host (default: smtp-relay.brevo.com)",  required: false },
  { key: "SMTP_PORT",              description: "SMTP relay port (default: 587)",                    required: false },
  { key: "SMTP_USER",              description: "SMTP relay login/username",                         required: false },
  { key: "SMTP_PASS",              description: "SMTP relay password / API key — enables sending",   required: false },
  { key: "SMTP_FROM",              description: "Sender address (default: noreply@bdefarmtrac.co.uk)", required: false },
  { key: "TWILIO_ACCOUNT_SID",     description: "Twilio account SID — enables SMS alerts",          required: false },
  { key: "TITAN_IMAP_HOST",           description: "Mailbox IMAP host (default: imap.123-reg.co.uk)",         required: false },
  { key: "TITAN_IMAP_PORT",           description: "Titan IMAP port (default: 993)",                           required: false },
  { key: "TITAN_IMAP_USER",           description: "Titan IMAP username (default: hello@bdefarmtrac.co.uk)",  required: false },
  { key: "TITAN_IMAP_PROXY_URL",      description: "Secret fixed-egress HTTP/SOCKS proxy URL for IMAP",       required: false },
  { key: "TITAN_IMAP_CONNECTION_TIMEOUT_MS", description: "Titan IMAP connection timeout (default: 15000)",  required: false },
  { key: "TITAN_IMAP_PASSWORD",       description: "Titan IMAP password — enables admin email inbox",        required: false },
  { key: "CREDENTIAL_ENCRYPTION_KEY", description: "AES-256 key for encrypting stored LIS/BCMS credentials", required: false },
  { key: "LIS_SUBSCRIPTION_KEY",      description: "LIS CLA API vendor subscription key — enables live LIS",  required: false },
  { key: "LIS_B2C_CLIENT_ID",         description: "LIS Azure B2C client ID for ROPC token flow",             required: false },
];

function auditEnvVars(): void {
  const missing: string[] = [];

  for (const spec of ENV_SPEC) {
    const val = process.env[spec.key];
    if (!val) {
      if (spec.required) {
        missing.push(spec.key);
        console.error(`[ENV]  ✗  ${spec.key.padEnd(26)} — MISSING (required)`);
      } else {
        console.warn(`[ENV]  ⚠  ${spec.key.padEnd(26)} — not set (${spec.description} disabled)`);
      }
    } else {
      const masked = val.length > 8 ? `${val.slice(0, 4)}…${val.slice(-4)}` : "***";
      console.log(`[ENV]  ✓  ${spec.key.padEnd(26)} = ${masked}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
      "Set these in your Replit Secrets panel before starting the server.",
    );
  }

  console.log("[ENV] Environment audit passed.");
}

auditEnvVars();

const rawPort = process.env["PORT"];
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`[SERVER] Listening on port ${port}`);
  seedDefaults().catch((err) => {
    console.error("[SEED] Failed to seed defaults:", err);
  });
  seedLookupDefaults().catch((err) => {
    console.error("[SEED] Failed to seed lookup defaults:", err);
  });
  startAlertingJob();
  startTimesheetReminderJob();
  runPlannerMigrations().catch((err) => {
    console.error("[PLANNER-MIGRATE] Failed:", err);
  });
  runResourceMigrations().catch((err) => {
    console.error("[RESOURCE-MIGRATE] Failed:", err);
  });
  runDairySuppliesMigrations().catch((err) => {
    console.error("[DAIRY-SUPPLIES-MIGRATE] Failed:", err);
  });
  runGpsMigrations().then(() => {
    startGpsPollingJob();
  }).catch((err) => {
    console.error("[GPS-MIGRATE] Failed:", err);
  });
  runSensorMigrations().then(() => {
    startSensorPollingJob();
  }).catch((err) => {
    console.error("[SENSOR-MIGRATE] Failed:", err);
  });
  runStrawMigrations().catch((err) => {
    console.error("[STRAW-MIGRATE] Failed:", err);
  });
  runPoultryMigrations().catch((err) => {
    console.error("[POULTRY-MIGRATE] Failed:", err);
  });
  runReportBuilderMigrations().catch((err) => {
    console.error("[REPORT-BUILDER-MIGRATE] Failed:", err);
  });
  runDataApiMigrations().catch((err) => {
    console.error("[DATA-API-MIGRATE] Failed:", err);
  });
  runAnalyticsMigrations().catch((err) => {
    console.error("[ANALYTICS-MIGRATE] Failed:", err);
  });
  runWineryMigrations().catch((err) => {
    console.error("[WINERY-MIGRATE] Failed:", err);
  });
  runFarmIncidentsMigrations().catch((err) => {
    console.error("[FARM-INCIDENTS-MIGRATE] Failed:", err);
  });
  runTaskLinkMigrations().catch((err) => {
    console.error("[TASK-LINK-MIGRATE] Failed:", err);
  });
  runWoodlandRegenMigrations().catch((err) => {
    console.error("[WOODLAND-REGEN-MIGRATE] Failed:", err);
  });
  runSoilAnalysisMigrations().catch((err) => {
    console.error("[STARTUP] soilAnalysisMigrations failed:", err);
  });
  runPestTrapMigrations().catch((err) => {
    console.error("[PEST-TRAP-MIGRATE] Failed:", err);
  });
  runAgriEnvMigrations().catch((err) => {
    console.error("[AGRI-ENV-MIGRATE] Failed:", err);
  });
  runAhwrMigrations().catch((err) => {
    console.error("[AHWR-MIGRATE] Failed:", err);
  });
  runUserUiPrefsMigrations().catch((err) => {
    console.error("[UI-PREFS-MIGRATE] Failed:", err);
  });
  runWinegbSubmissionsMigrations().catch((err) => {
    console.error("[WINEGB-SUBMISSIONS-MIGRATE] Failed:", err);
  });
  runFarmCoreMigrations().catch((err) => {
    console.error("[FARM-CORE-MIGRATE] Failed:", err);
  });
  runPigInventoryDeathMigrations().catch((err) => {
    console.error("[PIG-INVENTORY-DEATH-MIGRATE] Failed:", err);
  });
  runViticultureMigrations().catch((err) => {
    console.error("[VITICULTURE-MIGRATE] Failed:", err);
  });
  seedViticultureDemo().catch((err) => {
    console.error("[VITICULTURE-SEED] Failed:", err);
  });
  runSectorAlertMigrations().catch((err) => {
    console.error("[SECTOR-ALERT-MIGRATE] Failed:", err);
  });
  runHelpArticleMigrations().catch((err) => {
    console.error("[HELP-ARTICLE-MIGRATE] Failed:", err);
  });
  runFpInputMigrations().catch((err) => {
    console.error("[FP-INPUT-MIGRATE] Failed:", err);
  });
  runAhdbMigrations().catch((err) => {
    console.error("[AHDB-MIGRATE] Failed:", err);
  });
  runTradeBodiesMigrations().catch((err) => {
    console.error("[TRADE-BODIES-MIGRATE] Failed:", err);
  });
  runLeadsMigrations().catch((err) => {
    console.error("[LEADS-MIGRATE] Failed:", err);
  });
});
