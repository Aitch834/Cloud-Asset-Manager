import app from "./app";
import { seedDefaults } from "./lib/seedDefaults";

function auditEnvVars() {
  const required = ["PORT", "DATABASE_URL", "REPL_ID"];
  const optional = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "ISSUER_URL"];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  for (const key of optional) {
    if (!process.env[key]) {
      console.warn(`[ENV AUDIT] Optional env var ${key} is not set — related features will be disabled.`);
    }
  }

  console.log("[ENV AUDIT] All required environment variables are present.");
}

auditEnvVars();

const rawPort = process.env["PORT"];
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  seedDefaults().catch((err) => {
    console.error("Failed to seed defaults:", err);
  });
});
