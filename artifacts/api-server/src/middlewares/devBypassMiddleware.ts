import { type Request, type Response, type NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      isBypassMode?: boolean;
    }
  }
}

const DEV_BYPASS_TOKEN =
  process.env.NODE_ENV === "development"
    ? (process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local")
    : null;

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

  req.user = {
    id: "dev-bypass-user",
    email: "dev@bdefarmtrac.local",
    firstName: "Developer",
    lastName: "Mode",
    profileImageUrl: null,
  };

  req.isAuthenticated = function (this: Request) {
    return true;
  } as Request["isAuthenticated"];

  req.isBypassMode = true;

  next();
}
