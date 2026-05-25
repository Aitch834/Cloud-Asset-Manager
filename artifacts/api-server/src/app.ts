import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import { tenantMiddleware } from "./middlewares/tenantMiddleware";
import { devBypassMiddleware } from "./middlewares/devBypassMiddleware";
import { adminPortalMiddleware } from "./middlewares/adminPortalMiddleware";
import router from "./routes";

const app: Express = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow an explicit list of origins. Add production domains via ALLOWED_ORIGINS
// (comma-separated). Replit dev/app domains are always permitted so the
// workspace preview continues to work during development.

const explicitAllowList = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Requests with no Origin header (same-origin, server-to-server, curl) — allow.
      if (!origin) return callback(null, true);

      // Replit workspace / deployed app domains — always permitted.
      if (
        origin.endsWith(".replit.dev") ||
        origin.endsWith(".replit.app") ||
        origin.endsWith(".kirk.replit.dev")
      ) {
        return callback(null, true);
      }

      // Localhost variants — permitted in non-production only.
      if (process.env.NODE_ENV !== "production") {
        if (
          origin.startsWith("http://localhost") ||
          origin.startsWith("http://127.0.0.1") ||
          origin.startsWith("http://0.0.0.0")
        ) {
          return callback(null, true);
        }
      }

      // Explicit allow-list from ALLOWED_ORIGINS env variable.
      if (explicitAllowList.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Public unauthenticated routes: strict limit to prevent spam and enumeration.
// Authenticated routes: generous limit per user to prevent per-user DoS abuse.

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  // Key by authenticated userId when available, fall back to IP (IPv6-safe).
  keyGenerator: (req: Request) => (req as Request & { userId?: string }).userId ?? (req.ip ?? req.socket?.remoteAddress ?? "unknown"),
  message: { error: "Too many requests, please try again later." },
});

// File upload presigned-URL requests: tighter limit to contain storage cost abuse.
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => (req as Request & { userId?: string }).userId ?? (req.ip ?? req.socket?.remoteAddress ?? "unknown"),
  message: { error: "Upload request limit reached, please wait before uploading more files." },
});

// Clerk proxy must be mounted before body parsers (streams raw bytes)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/api/help-images", express.static(path.join(__dirname, "../public/help-images"), {
  maxAge: "7d",
  setHeaders: (res) => { res.setHeader("Cache-Control", "public, max-age=604800"); },
}));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/billing/webhook") {
    next();
    return;
  }
  express.json({ limit: "5mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

app.use(adminPortalMiddleware);
app.use(devBypassMiddleware);
app.use(clerkMiddleware());
app.use(tenantMiddleware);

// Apply public rate limiter to unauthenticated submission endpoints.
app.use("/api/leads", publicLimiter);
app.use("/api/support/tickets", publicLimiter);

// Apply upload rate limiter to presigned URL endpoint.
app.use("/api/storage/uploads", uploadLimiter);

// Apply general authenticated rate limiter across all other API routes.
app.use("/api", authLimiter);

app.use("/api", router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message, err.stack);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
