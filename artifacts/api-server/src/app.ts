import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/authMiddleware";
import { tenantMiddleware } from "./middlewares/tenantMiddleware";
import router from "./routes";

const app: Express = express();

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/billing/webhook") {
    next();
    return;
  }
  express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);
app.use(tenantMiddleware);

app.use("/api", router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message, err.stack);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
