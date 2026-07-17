import { type Request, type Response, type NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      isBypassMode?: boolean;
    }
  }
}

const DEV_BYPASS_TOKEN =
  process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

export function devBypassMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!DEV_BYPASS_TOKEN) {
    next();
    return;
  }

  const header = req.headers["x-dev-bypass"];

  if (header !== DEV_BYPASS_TOKEN) {
    next();
    return;
  }

  req.userId = "dev-bypass-user";
  req.isBypassMode = true;

  next();
}
