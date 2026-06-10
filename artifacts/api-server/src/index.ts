import app from "./app";
import { seedDefaults } from "./lib/seedDefaults";
import { seedLookupDefaults } from "./lib/seedLookups";
import { startAlertingJob } from "./lib/alertingJob";
import { startTimesheetReminderJob } from "./lib/timesheetReminderJob";

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
});
