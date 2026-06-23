/**
 * BDE Farm Trac — LIS UK Proxy
 *
 * A minimal Express server that runs on a UK VPS and forwards:
 *   POST /lis/token       → Azure B2C ROPC token endpoint
 *   POST /lis/cla/*       → LIS CLA API (movements, etc.)
 *   GET  /healthz         → health check
 *
 * The proxy adds the Ocp-Apim-Subscription-Key header to CLA API calls
 * so the subscription key never leaves UK infrastructure.
 *
 * Environment variables (create a .env file or set via your process manager):
 *   PORT                    Port to listen on (default: 3001)
 *   PROXY_SECRET            Shared secret — Replit sends this in X-Proxy-Secret header
 *   LIS_SUBSCRIPTION_KEY    BDE platform subscription key from LIS Developer Hub
 *   LIS_USE_SANDBOX_API     Set to "true" to use sandbox B2C tenant and CLA API
 *   LIS_B2C_CLIENT_ID       Azure B2C client_id (default: public client ID)
 */

const express = require("express");

// ─── Config ────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const PROXY_SECRET = process.env.PROXY_SECRET;
const LIS_SUBSCRIPTION_KEY = process.env.LIS_SUBSCRIPTION_KEY;
const USE_SANDBOX = process.env.LIS_USE_SANDBOX_API === "true";
const LIS_B2C_CLIENT_ID = process.env.LIS_B2C_CLIENT_ID ?? "lis-cla-public";
// Client secret for the confidential app registration. Required once LIS generates
// secrets for the app — without it Azure AD returns AADSTS50105.
const LIS_B2C_CLIENT_SECRET = process.env.LIS_B2C_CLIENT_SECRET ?? "";

// B2C_1A_SIGNIN is an interactive policy only — it rejects ROPC (grant_type=password)
// with AADB2C90057. For ROPC we use the standard AAD v2 endpoint on the B2C tenant,
// which supports username/password and issues tokens with the apim-cla-ext scope.
const B2C_TOKEN_URL = USE_SANDBOX
  ? "https://login.microsoftonline.com/livestockinformationb2cprod.onmicrosoft.com/oauth2/v2.0/token"
  : "https://login.microsoftonline.com/livestockinformation.onmicrosoft.com/oauth2/v2.0/token";

// Correct CLA API gateway confirmed from LIS Developer Hub (api-url field, June 2026).
// The /v1.0 version prefix is part of the base — do NOT include /v1/ in individual paths.
const CLA_API_BASE = USE_SANDBOX
  ? "https://ext-cla.api.livestockinformation.org.uk/v1.0"
  : "https://cla.api.livestockinformation.org.uk/v1.0";

// ─── App ───────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(express.text({ type: "application/x-www-form-urlencoded" }));

// ─── Auth middleware ───────────────────────────────────────────────────────

function requireSecret(req, res, next) {
  if (!PROXY_SECRET) {
    // No secret configured — allow all (insecure, dev only)
    return next();
  }
  const provided = req.headers["x-proxy-secret"];
  if (!provided || provided !== PROXY_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ─── Health check ──────────────────────────────────────────────────────────

app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    sandbox: USE_SANDBOX,
    subscriptionKeyConfigured: !!LIS_SUBSCRIPTION_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ─── Token endpoint ────────────────────────────────────────────────────────

/**
 * POST /lis/token
 * Body (JSON): { username, password }
 * Returns the raw B2C token response.
 */
app.post("/lis/token", requireSecret, async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  // Scope from LIS Developer Hub api-scopes field (June 2026)
  // Do NOT include "openid" — B2C treats it as implicit flow (AADB2C90057).
  // ROPC only needs the API access scope + offline_access for a refresh token.
  const B2C_SCOPE = USE_SANDBOX
    ? "https://livestockinformationb2cprod.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access"
    : "https://livestockinformation.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access";

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: LIS_B2C_CLIENT_ID,
    scope: B2C_SCOPE,
    username,
    password,
  });
  if (LIS_B2C_CLIENT_SECRET) body.append("client_secret", LIS_B2C_CLIENT_SECRET);

  try {
    const upstream = await fetch(B2C_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await upstream.text();
      console.error("[LIS-PROXY] B2C returned non-JSON:", upstream.status, text.slice(0, 200));
      return res.status(502).json({
        error: "upstream_non_json",
        message: `B2C returned HTTP ${upstream.status} with non-JSON body`,
      });
    }

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("[LIS-PROXY] Token fetch error:", err);
    res.status(502).json({ error: "upstream_unreachable", message: err.message });
  }
});

// ─── Token refresh endpoint ────────────────────────────────────────────────

/**
 * POST /lis/token/refresh
 * Body (JSON): { refreshToken }
 * Returns the raw B2C token response.
 */
app.post("/lis/token/refresh", requireSecret, async (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken is required" });
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: LIS_B2C_CLIENT_ID,
    refresh_token: refreshToken,
  });
  if (LIS_B2C_CLIENT_SECRET) body.append("client_secret", LIS_B2C_CLIENT_SECRET);

  try {
    const upstream = await fetch(B2C_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("[LIS-PROXY] Token refresh error:", err);
    res.status(502).json({ error: "upstream_unreachable", message: err.message });
  }
});

// ─── CLA API proxy ─────────────────────────────────────────────────────────

/**
 * POST /lis/cla/*
 * Headers must include: Authorization: Bearer <access_token>
 * Proxy adds: Ocp-Apim-Subscription-Key
 * Body: forwarded as-is (JSON).
 */
app.all("/lis/cla/*", requireSecret, async (req, res) => {
  if (!LIS_SUBSCRIPTION_KEY) {
    return res.status(503).json({
      error: "subscription_key_not_configured",
      message: "LIS_SUBSCRIPTION_KEY is not set on the proxy server",
    });
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header required" });
  }

  // Strip /lis/cla prefix to get the CLA path
  const claPath = req.path.replace(/^\/lis\/cla/, "");
  const upstreamUrl = `${CLA_API_BASE}${claPath}`;

  const upstreamHeaders = {
    "Content-Type": "application/json",
    "Authorization": authHeader,
    "Ocp-Apim-Subscription-Key": LIS_SUBSCRIPTION_KEY,
  };

  const bodyStr = Object.keys(req.body ?? {}).length > 0
    ? JSON.stringify(req.body)
    : undefined;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: upstreamHeaders,
      ...(bodyStr ? { body: bodyStr } : {}),
    });

    const responseText = await upstream.text();
    res.status(upstream.status);
    res.set("Content-Type", upstream.headers.get("content-type") ?? "application/json");
    res.send(responseText);
  } catch (err) {
    const cause = err?.cause;
    const detail = cause?.code ?? cause?.message ?? err?.message ?? "unknown";
    console.error("[LIS-PROXY] CLA API error:", detail, err);
    res.status(502).json({ error: "upstream_unreachable", message: `${err.message} — ${detail}`, detail });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[LIS-PROXY] Listening on port ${PORT}`);
  console.log(`[LIS-PROXY] Sandbox mode: ${USE_SANDBOX}`);
  console.log(`[LIS-PROXY] Subscription key configured: ${!!LIS_SUBSCRIPTION_KEY}`);
  console.log(`[LIS-PROXY] Shared secret required: ${!!PROXY_SECRET}`);
  console.log(`[LIS-PROXY] B2C URL: ${B2C_TOKEN_URL}`);
  console.log(`[LIS-PROXY] CLA base: ${CLA_API_BASE}`);
});
