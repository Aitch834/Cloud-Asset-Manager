import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import { tenantMiddleware } from "./middlewares/tenantMiddleware";
import { devBypassMiddleware } from "./middlewares/devBypassMiddleware";
import { adminPortalMiddleware } from "./middlewares/adminPortalMiddleware";
import router from "./routes";

const app: Express = express();

// Clerk proxy must be mounted before body parsers (streams raw bytes)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));

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
  express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

app.use(adminPortalMiddleware);
app.use(devBypassMiddleware);
app.use(clerkMiddleware());
app.use(tenantMiddleware);

app.use("/api", router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message, err.stack);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
